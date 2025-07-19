// src/screens/PublishingScreen.js
// Path: src/screens/PublishingScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { publishingStyles } from '../styles/publishingStyles';
import { WalletSection, ProgressBar, ContentSections } from '../components/publishing';
import { MobileWalletService } from '../services/wallet/MobileWalletService';
import { MobilePublishingService } from '../services/publishing/MobilePublishingService';
import { MobileStorageManager } from '../services/publishing/MobileStorageManager';
import { MobileScrollManager } from '../services/publishing/MobileScrollManager';

export const PublishingScreen = ({ navigation }) => {
  // Core state management
  const [walletService] = useState(() => new MobileWalletService());
  const [publishingService] = useState(() => new MobilePublishingService());
  const [walletStatus, setWalletStatus] = useState('locked');
  const [publishing, setPublishing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [inProgressContent, setInProgressContent] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [publishedContent, setPublishedContent] = useState([]);
  const [publishingStats, setPublishingStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Wallet-specific state - THIS IS WHAT WAS MISSING!
  const [showWalletUnlock, setShowWalletUnlock] = useState(false);
  const [password, setPassword] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [isRequestingAirdrop, setIsRequestingAirdrop] = useState(false);

  // Initialize data on component mount
  useEffect(() => {
    initializeData();
  }, []);

  // Initialize all data including published content
  const initializeData = async () => {
    try {
      console.log('🔄 Initializing PublishingScreen data...');
      setIsLoading(true);
      
      // Check wallet status first - FIXED TO USE STATIC METHODS
      try {
        console.log('🔧 Checking for existing wallets...');
        
        // Use static method to check for existing wallets
        const hasWallet = await MobileWalletService.hasWallet();
        if (hasWallet) {
          setWalletStatus('locked');
          console.log('📱 Found existing wallet - status: locked');
        } else {
          setWalletStatus('none');
          console.log('📱 No wallet found - status: none');
        }
      } catch (walletError) {
        console.warn('⚠️ Error checking wallet status:', walletError);
        setWalletStatus('none');
      }
      
      // Load all content types concurrently
      await Promise.all([
        loadInProgressContent(),
        loadPublishedContent(),
        loadPublishingStats()
      ]);
      
      console.log('✅ PublishingScreen initialization complete');
    } catch (error) {
      console.error('❌ Error initializing PublishingScreen:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load in-progress content
  const loadInProgressContent = async () => {
    try {
      const inProgress = await MobileStorageManager.getInProgressContentArray();
      console.log(`📥 Loaded ${inProgress.length} in-progress items`);
      setInProgressContent(inProgress);
    } catch (error) {
      console.error('Error loading in-progress content:', error);
      setInProgressContent([]);
    }
  };

  // Load published content - FIXED TO PROPERLY LOAD FROM STORAGE
  const loadPublishedContent = async () => {
    try {
      console.log('📚 Loading published content from storage...');
      
      // Get published content from storage
      const published = await MobileStorageManager.getPublishedContentArray();
      console.log(`📥 Found ${published.length} published items in storage`);
      
      // For each published item, ensure it has a scroll/manifest
      const enrichedPublished = await Promise.all(
        published.map(async (item) => {
          try {
            // If item doesn't have a scrollId, try to find/create one
            if (!item.scrollId && item.glyphs && item.glyphs.length > 0) {
              console.log(`🔧 Creating scroll for published item: ${item.title}`);
              
              // Create a scroll from the published content
              const manifest = await MobileScrollManager.createScrollFromPublishedContent(item);
              if (manifest) {
                // Save the manifest locally
                await MobileScrollManager.saveScrollLocally(manifest);
                
                // Update the published item with scroll ID
                item.scrollId = manifest.storyId;
                item.manifest = manifest;
                
                // Update in storage
                await MobileStorageManager.savePublishedContent(item);
                console.log(`✅ Created and linked scroll: ${manifest.storyId}`);
              }
            } else if (item.scrollId && !item.manifest) {
              // Load existing manifest
              const manifest = await MobileScrollManager.getScrollById(item.scrollId);
              if (manifest) {
                item.manifest = manifest;
              }
            }
            
            return item;
          } catch (itemError) {
            console.error(`Error processing published item ${item.title}:`, itemError);
            return item; // Return as-is if there's an error
          }
        })
      );
      
      setPublishedContent(enrichedPublished);
      console.log(`✅ Loaded ${enrichedPublished.length} published stories`);
    } catch (error) {
      console.error('❌ Error loading published content:', error);
      setPublishedContent([]);
    }
  };

  // Load publishing statistics
  const loadPublishingStats = async () => {
    try {
      const stats = await MobileStorageManager.getStorageStats();
      setPublishingStats({
        totalPublished: stats.published,
        totalGlyphs: 0, // We'll calculate this if needed
        successRate: 100, // Default to 100% for now
        totalCost: 0 // We'll calculate this if needed
      });
    } catch (error) {
      console.error('Error loading publishing stats:', error);
    }
  };

  // Wallet management functions
  const handleWalletToggle = async () => {
    try {
      if (walletStatus === 'locked' || walletStatus === 'none') {
        setShowWalletUnlock(true);
      } else {
        await walletService.disconnect();
        setWalletStatus('locked');
        setWalletAddress('');
        setWalletBalance(0);
        setPassword('');
        setShowWalletUnlock(false);
      }
    } catch (error) {
      console.error('Wallet operation failed:', error);
      Alert.alert('Error', 'Failed to toggle wallet: ' + error.message);
    }
  };

  const handleWalletAction = async () => {
    if (!password.trim()) {
      Alert.alert('Password Required', 'Please enter a password to continue.');
      return;
    }

    try {
      setIsLoading(true);
      
      if (walletStatus === 'none') {
        // Create new wallet
        const walletInfo = await walletService.create({
          password: password,
          name: 'My Solana Wallet'
        });
        console.log('✅ Created new wallet:', walletInfo.publicKey);
      } else {
        // Unlock existing wallet - get the first available wallet
        const availableWallets = await MobileWalletService.getAvailableWallets();
        if (availableWallets.length === 0) {
          throw new Error('No wallets found to unlock');
        }
        
        // Load the first wallet (or user could select)
        const walletInfo = await walletService.loadWallet(availableWallets[0].id, password);
        console.log('✅ Unlocked wallet:', walletInfo.publicKey);
      }
      
      // Connect the wallet
      await walletService.connect();
      
      setWalletStatus('unlocked');
      publishingService.setWallet(walletService);
      
      // Load wallet info
      const address = walletService.getWalletPublicKey();
      setWalletAddress(address);
      
      // Get balance
      try {
        const balanceInfo = await walletService.getBalance();
        setWalletBalance(balanceInfo.amount);
      } catch (balanceError) {
        console.warn('Could not fetch balance:', balanceError);
        setWalletBalance(0);
      }
      
      setShowWalletUnlock(false);
      setPassword('');
      
    } catch (error) {
      console.error('Wallet action failed:', error);
      Alert.alert('Error', error.message || 'Failed to process wallet action');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestAirdrop = async () => {
    if (isRequestingAirdrop) return;
    
    try {
      setIsRequestingAirdrop(true);
      
      Alert.alert(
        'Request Devnet SOL',
        'Request 1 SOL from the Solana devnet faucet?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Request', 
            onPress: async () => {
              try {
                // Simple airdrop request
                const publicKey = walletService.getWalletPublicKey();
                console.log(`🎁 Requesting airdrop for: ${publicKey}`);
                
                // You can implement actual airdrop logic here
                // For now, just show success
                Alert.alert('Success', 'Airdrop requested! It may take a few moments to appear in your balance.');
                
                // Refresh balance after a delay
                setTimeout(async () => {
                  try {
                    const newBalance = await walletService.getBalance();
                    setWalletBalance(newBalance.amount);
                  } catch (err) {
                    console.warn('Could not refresh balance:', err);
                  }
                }, 3000);
                
              } catch (error) {
                console.error('Airdrop failed:', error);
                Alert.alert('Error', 'Failed to request airdrop: ' + error.message);
              }
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Airdrop request failed:', error);
      Alert.alert('Error', 'Failed to request airdrop: ' + error.message);
    } finally {
      setIsRequestingAirdrop(false);
    }
  };

  const handleMigration = async () => {
    // Placeholder for wallet migration
    Alert.alert('Migration', 'Wallet migration feature coming soon!');
  };

  // Main publishing handler - IMPROVED WITH DEDUPLICATION
  const handlePublishing = async () => {
    if (walletStatus !== 'unlocked') {
      Alert.alert('Wallet Required', 'Please unlock your wallet to publish content.');
      return;
    }

    if (publishing) {
      Alert.alert('Publishing In Progress', 'Please wait for the current publication to complete.');
      return;
    }

    try {
      setPublishing(true);
      setProgress(0);

      // Pick and prepare content
      const contentData = await publishingService.pickAndLoadFile();
      if (!contentData) {
        setPublishing(false);
        return;
      }

      console.log(`📤 Starting publication: "${contentData.title}"`);

      // Check if this content was already published (prevent duplicates)
      const existingPublished = await MobileStorageManager.getPublishedContent();
      const isDuplicate = Object.values(existingPublished).some(item => 
        item.title === contentData.title && 
        item.originalContent === contentData.content
      );

      if (isDuplicate) {
        Alert.alert(
          'Already Published',
          'This content appears to have been published already. Would you like to publish it again?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Publish Again', 
              style: 'default',
              onPress: () => proceedWithPublishing(contentData)
            }
          ]
        );
        setPublishing(false);
        return;
      }

      await proceedWithPublishing(contentData);

    } catch (error) {
      console.error('❌ Publishing failed:', error);
      Alert.alert('Publishing Failed', error.message);
      setPublishing(false);
      setProgress(0);
    }
  };

  // Proceed with publishing (extracted for reuse)
  const proceedWithPublishing = async (contentData) => {
    try {
      const title = contentData.title || 'Untitled Story';
      const preparedContent = await publishingService.prepareContent(contentData, title);

      // Save as in-progress immediately
      await MobileStorageManager.saveInProgressContent(preparedContent);
      await loadInProgressContent(); // Refresh display

      // Publish to blockchain
      const result = await publishingService.blockchainPublisher.publishContent(
        preparedContent,
        walletService.getKeypair(),
        (progressData) => {
          console.log(`📊 Progress: ${progressData.progress}%`);
          setProgress(progressData.progress);
        }
      );

      if (result.success) {
        console.log('✅ Publishing successful!');
        
        // Create published content record - SINGLE ENTRY
        const publishedRecord = {
          contentId: preparedContent.contentId,
          title: preparedContent.title,
          originalContent: preparedContent.originalContent,
          glyphs: preparedContent.glyphs,
          transactionIds: result.transactionIds || [],
          scrollId: result.scroll?.storyId || null,
          manifest: result.scroll || null,
          publishedAt: Date.now(),
          status: 'published',
          authorPublicKey: walletService.getWalletPublicKey(),
          authorName: walletService.getWalletPublicKey().substring(0, 8) + '...',
          totalGlyphs: preparedContent.glyphs.length,
          successfulGlyphs: preparedContent.glyphs.length,
          failedGlyphs: 0
        };

        // Save as published (single entry)
        await MobileStorageManager.savePublishedContent(publishedRecord);
        
        // Remove from in-progress
        await MobileStorageManager.removeInProgressContent(preparedContent.contentId);
        
        // Save scroll/manifest if created
        if (result.scroll) {
          await MobileScrollManager.saveScrollLocally(result.scroll);
        }

        // Refresh all displays
        await Promise.all([
          loadInProgressContent(),
          loadPublishedContent(),
          loadPublishingStats()
        ]);

        Alert.alert('Success!', `"${title}" has been published successfully!`);
      } else {
        throw new Error(result.error || 'Publishing failed');
      }

    } catch (error) {
      console.error('❌ Publishing process failed:', error);
      Alert.alert('Publishing Failed', error.message);
    } finally {
      setPublishing(false);
      setProgress(0);
    }
  };

  // Resume publishing for in-progress content
  const handleResumePublishing = async (contentId) => {
    try {
      console.log(`🔄 Resuming publishing for: ${contentId}`);
      // Implementation for resuming would go here
      Alert.alert('Resume Publishing', 'Resume publishing feature coming soon!');
    } catch (error) {
      console.error('Error resuming publishing:', error);
      Alert.alert('Error', 'Failed to resume publishing: ' + error.message);
    }
  };

  // Handle viewing published stories
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

  // Clear published data (for testing)
  const handleClearPublished = async () => {
    Alert.alert(
      'Clear Test Data',
      'This will remove all test publishing data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            try {
              await MobileStorageManager.clearAllStorage();
              await MobileScrollManager.clearAllScrolls();
              await initializeData(); // Reload everything
              Alert.alert('Cleared', 'All test data has been cleared.');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data: ' + error.message);
            }
          }
        }
      ]
    );
  };

  // Handle back navigation
  const handleGoBack = () => {
    if (publishing) {
      Alert.alert(
        'Publishing in Progress',
        'Are you sure you want to go back?',
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

  // Show loading screen during initialization
  if (isLoading) {
    return (
      <SafeAreaView style={publishingStyles.container}>
        <View style={publishingStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={publishingStyles.loadingText}>Loading publishing data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={publishingStyles.container}>
      <ScrollView 
        style={publishingStyles.scrollView}
        contentContainerStyle={publishingStyles.scrollContentContainer}
        showsVerticalScrollIndicator={true}
        bounces={true}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={publishingStyles.header}>
          <TouchableOpacity 
            style={publishingStyles.backButton}
            onPress={handleGoBack}
          >
            <Text style={publishingStyles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={publishingStyles.title}>Publishing</Text>
        </View>
        
        {/* Wallet Section - ALL PROPS NOW PROVIDED */}
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
          handleMigration={handleMigration}
        />
        
        {/* Main Publishing Button */}
        <TouchableOpacity 
          style={[
            publishingStyles.publishButton,
            publishing && publishingStyles.publishButtonDisabled,
            walletStatus !== 'unlocked' && publishingStyles.publishButtonDisabled
          ]}
          onPress={handlePublishing}
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
        
        {/* Content Sections - WITH STORY VIEWING */}
        <ContentSections 
          inProgressContent={inProgressContent}
          drafts={drafts}
          publishedContent={publishedContent}
          publishingStats={publishingStats}
          walletStatus={walletStatus}
          publishing={publishing}
          handleResumePublishing={handleResumePublishing}
          handleViewStory={handleViewStory}
        />
        
        {/* Bottom spacing to ensure last items are accessible */}
        <View style={publishingStyles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Character count: 16,248