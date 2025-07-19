// src/screens/PublishingScreen.js
// Path: src/screens/PublishingScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { MobilePublishingService } from '../services/publishing/MobilePublishingService';
import { MobileWalletService } from '../services/wallet/MobileWalletService';
import { MobileScrollManager } from '../services/publishing/MobileScrollManager';
import { MigrationHelper } from '../utils/MigrationHelper';
import { publishingStyles } from '../styles/publishingStyles';
import { WalletSection } from '../components/publishing/WalletSection';
import { ProgressBar } from '../components/publishing/ProgressBar';
import { ContentSections } from '../components/publishing/ContentSections';
import { createWalletHandlers } from '../utils/publishing/walletHandlers';

export const PublishingScreen = ({ navigation }) => {
  // State variables
  const [publishing, setPublishing] = useState(false);
  const [progress, setProgress] = useState(null);
  const [publishedContent, setPublishedContent] = useState([]);
  const [inProgressContent, setInProgressContent] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletService, setWalletService] = useState(null);
  const [publishingService, setPublishingService] = useState(null);
  const [showWalletUnlock, setShowWalletUnlock] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [publishingStats, setPublishingStats] = useState(null);
  const [walletStatus, setWalletStatus] = useState('unknown');
  const [isRequestingAirdrop, setIsRequestingAirdrop] = useState(false);

  // Create handlers using our utilities - moved inside useEffect to avoid null reference errors
  const [walletHandlers, setWalletHandlers] = useState(null);
  
  // Create inline publishing handlers to avoid timing issues
  const handleRequestAirdrop = async () => {
    if (!walletService) {
      Alert.alert('Wallet Required', 'Please unlock your wallet first to request SOL.');
      setShowWalletUnlock(true);
      return;
    }
    
    if (isRequestingAirdrop) {
      return;
    }
    
    try {
      setIsRequestingAirdrop(true);
      const { SolanaAirdropService } = await import('../services/wallet/SolanaAirdropService');
      const airdropService = new SolanaAirdropService();
      const keypair = walletService.getWalletKeypair();
      
      Alert.alert(
        'Request Devnet SOL',
        'This will request 1 SOL from Solana devnet faucet. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Request', onPress: async () => {
            try {
              await airdropService.requestAirdrop(keypair.publicKey, 1);
              Alert.alert('⏳ Processing', 'Waiting for airdrop confirmation...');
              
              setTimeout(async () => {
                const balance = await walletService.getBalance();
                setWalletBalance(balance.available);
              }, 3000);
              
            } catch (error) {
              Alert.alert('Error', 'Airdrop failed: ' + error.message);
            } finally {
              setIsRequestingAirdrop(false);
            }
          }}
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to request airdrop: ' + error.message);
      setIsRequestingAirdrop(false);
    }
  };

  const handlePickAndPublish = async () => {
    if (!walletService) {
      Alert.alert('Wallet Required', 'Please unlock your wallet first to publish content.');
      setShowWalletUnlock(true);
      return;
    }
    
    if (!publishingService) {
      Alert.alert('Error', 'Publishing service not ready');
      return;
    }
    
    // Prevent multiple publishing attempts
    if (publishing) {
      console.log('Already publishing, ignoring request');
      return;
    }
    
    let content;
    
    try {
      console.log('🚀 Starting publishing process...');
      
      // Set publishing state FIRST and IMMEDIATELY
      setPublishing(true);
      
      // Set initial progress to show we're starting
      setProgress({
        contentId: `temp_${Date.now()}`,
        stage: 'preparing',
        progress: 0,
        currentGlyph: 0,
        totalGlyphs: 0,
        successfulGlyphs: 0,
        failedGlyphs: 0,
        transactionIds: [],
        error: null,
        scrollId: null
      });
      
      content = await publishingService.pickAndLoadFile();
      if (!content) {
        console.log('📁 File picking cancelled');
        setPublishing(false);
        setProgress(null);
        return;
      }
      
      console.log('🚀 Starting publishing for:', content.title);
      
      const result = await publishingService.publishContent(
        content,
        (status) => {
          // Force state update by creating new object
          const newProgress = { ...status };
          setProgress(newProgress);
          
          // Keep publishing state true until completed
          if (status.stage !== 'completed' && status.stage !== 'failed' && status.stage !== 'error') {
            setPublishing(true);
          }
        }
      );
      
      console.log('📝 Publishing result:', result);
      
      // Handle completion
      if (result.status === 'completed') {
        Alert.alert('✅ Publishing Complete!', `Successfully published "${content.title}"!`);
      } else if (result.status === 'partial') {
        Alert.alert('⚠️ Partial Success', `Published ${result.successfulGlyphs}/${result.totalGlyphs} glyphs.`);
      } else {
        Alert.alert('❌ Publishing Failed', 'Publishing failed. Please try again.');
      }
      
    } catch (error) {
      console.error('Publishing error:', error);
      Alert.alert('Error', 'Publishing failed: ' + error.message);
    } finally {
      // Always clean up publishing state
      setTimeout(() => {
        setPublishing(false);
        setProgress(null);
        
        // Safely refresh content
        try {
          refreshContent();
        } catch (refreshError) {
          console.error('Error refreshing content:', refreshError);
        }
      }, 1000);
    }
  };

  const handleResumePublishing = async (contentId) => {
    if (!walletService || !publishingService) {
      Alert.alert('Error', 'Services not ready');
      return;
    }
    
    try {
      setPublishing(true);
      
      const result = await publishingService.resumePublishing(
        contentId,
        (status) => setProgress(status)
      );
      
      if (result.status === 'completed') {
        Alert.alert('✅ Publishing Complete!', 'Successfully completed publishing!');
        await refreshContent();
      }
      
    } catch (error) {
      console.error('Resume error:', error);
      Alert.alert('Error', 'Failed to resume publishing: ' + error.message);
    } finally {
      setPublishing(false);
      setProgress(null);
    }
  };

  const handleClearPublished = async () => {
    Alert.alert(
      'Clear Test Data',
      'This will clear all published content. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: async () => {
          try {
            const { ClearPublishedScript } = await import('../utils/ClearPublishedScript');
            await ClearPublishedScript.clearAll();
            await refreshContent();
            Alert.alert('Success', 'All test data cleared!');
          } catch (error) {
            Alert.alert('Error', 'Failed to clear data: ' + error.message);
          }
        }}
      ]
    );
  };

  const refreshContent = async () => {
    if (!publishingService) return;
    
    try {
      const published = await publishingService.getPublishedContent();
      const inProgress = await publishingService.getInProgressContent();
      const drafts = await publishingService.getDrafts();
      
      // Try to get stats, but don't fail if the method doesn't exist
      let stats = null;
      try {
        if (typeof publishingService.getPublishingStats === 'function') {
          stats = await publishingService.getPublishingStats();
        } else {
          console.log('Publishing stats not available (method not implemented)');
        }
      } catch (error) {
        console.log('Publishing stats not available:', error.message);
      }
      
      setPublishedContent(published);
      setInProgressContent(inProgress);
      setDrafts(drafts);
      setPublishingStats(stats);
    } catch (error) {
      console.error('Error refreshing content:', error);
    }
  };

  // Helper function for loading wallet info (needed by walletHandlers)
  const loadWalletInfo = async (wallet, logContext = null) => {
    try {
      const balance = await wallet.getBalance(logContext);
      console.log('💰 Balance object received:', balance);
      
      // Handle different balance object structures
      if (typeof balance === 'number') {
        setWalletBalance(balance);
      } else if (balance && balance.available !== undefined) {
        setWalletBalance(balance.available);
      } else if (balance && balance.total !== undefined) {
        setWalletBalance(balance.total);
      } else {
        console.warn('Unexpected balance format:', balance);
        setWalletBalance(0);
      }
    } catch (error) {
      console.error('Error loading wallet info:', error);
      setWalletBalance(0);
    }
  };

  // Initialize services and load data
  useEffect(() => {
    const initializeServices = async () => {
      try {
        console.log('🔄 Initializing PublishingScreen services...');
        
        // Initialize publishing service
        const publisher = new MobilePublishingService();
        setPublishingService(publisher);
        
        // Create wallet handlers (they handle wallet creation/loading)
        const walletHandlersInstance = createWalletHandlers({
          setWalletBalance,
          setWalletAddress,
          setWalletStatus,
          setWalletService,
          setIsLoading,
          setShowWalletUnlock,
          setPassword,
          loadWalletInfo, // Add the missing loadWalletInfo function
          setPublishingService // Add this - wallet handlers need it to link wallet to publishing
        });
        setWalletHandlers(walletHandlersInstance);
        
        // Check wallet status using static methods
        const migrationNeeded = await MigrationHelper.needsMigration();
        if (migrationNeeded) {
          setWalletStatus('migrating');
          setIsLoading(false);
          return;
        }
        
        const availableWallets = await MobileWalletService.getAvailableWallets();
        if (availableWallets.length === 0) {
          setWalletStatus('none');
        } else {
          setWalletStatus('locked');
          console.log(`Found ${availableWallets.length} existing wallet(s)`);
        }
        
        // Load content data
        await refreshContent();
        
        console.log('✅ PublishingScreen initialization complete');
      } catch (error) {
        console.error('❌ Error initializing PublishingScreen:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeServices();
  }, []);

  // Update balance when wallet service changes
  useEffect(() => {
    if (walletService && walletStatus === 'unlocked') {
      console.log('🔄 Wallet service changed, refreshing balance...');
      loadWalletInfo(walletService, 'wallet-service-change');
      
      // IMPORTANT: Link the wallet to the publishing service
      if (publishingService) {
        console.log('🔗 Linking wallet to publishing service...');
        publishingService.setWallet(walletService);
      }
    }
  }, [walletService, walletStatus, publishingService]);

  // Handle wallet action (create or unlock)
  const handleWalletAction = () => {
    if (!walletHandlers) return;
    
    // Use the walletHandlers.handleWalletAction method which takes password and status
    walletHandlers.handleWalletAction(password, walletStatus);
  };

  // Handle back navigation
  const handleBack = () => {
    if (publishing) {
      Alert.alert(
        'Publishing in Progress',
        'Publishing is currently in progress. Are you sure you want to go back?',
        [
          { text: 'Continue Publishing', style: 'cancel' },
          { 
            text: 'Go Back', 
            style: 'destructive',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  // NEW: Handle viewing published stories
  const handleViewStory = async (publishedItem) => {
    try {
      console.log('📖 Opening story:', publishedItem.title);
      
      // First, try to get the manifest from the published item
      let manifest = publishedItem.manifest;
      
      // If no manifest in published item, try to fetch it using scrollId
      if (!manifest && publishedItem.scrollId) {
        console.log('🔍 Fetching manifest for scrollId:', publishedItem.scrollId);
        manifest = await MobileScrollManager.getScrollById(publishedItem.scrollId);
      }
      
      // If still no manifest, create one from the published content
      if (!manifest) {
        console.log('🔧 Creating manifest from published content...');
        try {
          manifest = await MobileScrollManager.createScrollFromPublishedContent(publishedItem);
          await MobileScrollManager.saveScrollLocally(manifest);
          console.log('✅ Created and saved manifest:', manifest.storyId);
        } catch (manifestError) {
          console.error('❌ Error creating manifest:', manifestError);
          Alert.alert(
            'Error',
            'Could not prepare story for viewing. The story data may be incomplete.',
            [{ text: 'OK' }]
          );
          return;
        }
      }
      
      // Validate manifest has required data
      if (!manifest || !manifest.chunks || manifest.chunks.length === 0) {
        Alert.alert(
          'Story Unavailable',
          'This story cannot be viewed because the content data is missing or incomplete.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      console.log('✅ Navigating to story view with manifest:', {
        storyId: manifest.storyId,
        title: manifest.title,
        chunks: manifest.chunks.length
      });
      
      // Navigate to the story viewer
      navigation.navigate('StoryView', {
        storyId: manifest.storyId,
        manifest: manifest,
        autoStart: true
      });
      
    } catch (error) {
      console.error('❌ Error opening story:', error);
      Alert.alert(
        'Error',
        'Failed to open the story. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Show loading screen while initializing or if handlers aren't ready
  if (isLoading || !walletHandlers) {
    return (
      <SafeAreaView style={publishingStyles.loadingContainer}>
        <Text style={publishingStyles.loadingText}>⏳ Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={publishingStyles.container}>
      {/* Back Button */}
      <View style={publishingStyles.headerRow}>
        <TouchableOpacity 
          style={publishingStyles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Text style={publishingStyles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={publishingStyles.scrollContainer}>
        <Text style={publishingStyles.header}>📜 Glyffiti Publishing</Text>
        
        {/* Wallet Section */}
        <WalletSection 
          walletStatus={walletStatus}
          walletAddress={walletAddress}
          walletBalance={walletBalance}
          isRequestingAirdrop={isRequestingAirdrop}
          showWalletUnlock={showWalletUnlock}
          password={password}
          isLoading={isLoading}
          setPassword={setPassword}
          setShowWalletUnlock={setShowWalletUnlock}
          handleRequestAirdrop={handleRequestAirdrop}
          handleWalletAction={handleWalletAction}
          handleMigration={walletHandlers.handleMigration}
        />
        
        {/* Main Publish Button */}
        <TouchableOpacity 
          style={[
            publishingStyles.publishButton,
            (publishing || walletStatus !== 'unlocked') && publishingStyles.publishButtonDisabled
          ]}
          onPress={handlePickAndPublish}
          disabled={publishing || walletStatus !== 'unlocked'}
        >
          <Text style={publishingStyles.publishButtonText}>
            {publishing ? '📤 Publishing...' : 
             walletStatus !== 'unlocked' ? '🔒 Unlock Wallet to Publish' :
             '📁 Pick File & Publish'}
          </Text>
        </TouchableOpacity>
        
        {/* Clear Test Data Button */}
        <TouchableOpacity 
          style={publishingStyles.clearButton}
          onPress={handleClearPublished}
        >
          <Text style={publishingStyles.clearButtonText}>🗑️ Clear Test Data</Text>
        </TouchableOpacity>
        
        {/* Progress Bar */}
        <ProgressBar publishing={publishing} progress={progress} />
        
        {/* Content Sections - NOW WITH STORY VIEWING */}
        <ContentSections 
          inProgressContent={inProgressContent}
          drafts={drafts}
          publishedContent={publishedContent}
          publishingStats={publishingStats}
          walletStatus={walletStatus}
          publishing={publishing}
          handleResumePublishing={handleResumePublishing}
          handleViewStory={handleViewStory} // NEW: Pass the story viewing handler
        />
      </ScrollView>
    </SafeAreaView>
  );
};

// Character count: 7042