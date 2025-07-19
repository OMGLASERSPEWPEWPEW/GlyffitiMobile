// src/screens/PublishingScreen.js
// Path: src/screens/PublishingScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Dimensions
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { publishingStyles } from '../styles/publishingStyles';
import { MobileWalletService } from '../services/wallet/MobileWalletService';
import { MobilePublishingService } from '../services/publishing/MobilePublishingService';
import { MobileScrollManager } from '../services/publishing/MobileScrollManager';
import { WalletHandlers } from '../components/publishing/WalletHandlers';
import { ContentSections } from '../components/publishing/ContentSections';
import { ProgressBar } from '../components/publishing/ProgressBar';
import { WalletSection } from '../components/publishing/WalletSection';

const { width } = Dimensions.get('window');

export const PublishingScreen = ({ navigation }) => {
  // Core state
  const [isLoading, setIsLoading] = useState(true);
  const [walletService, setWalletService] = useState(null);
  const [publishingService, setPublishingService] = useState(null);
  const [walletStatus, setWalletStatus] = useState('checking'); // checking, none, locked, unlocked
  const [walletBalance, setWalletBalance] = useState(null);
  const [password, setPassword] = useState('');

  // Publishing state
  const [publishing, setPublishing] = useState(false);
  const [progress, setProgress] = useState(null);

  // Content state
  const [publishedContent, setPublishedContent] = useState([]);
  const [inProgressContent, setInProgressContent] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [publishingStats, setPublishingStats] = useState(null);

  // Refs to prevent multiple initialization
  const initializationRef = useRef(false);
  const contentLoadedRef = useRef(false);

  // Initialize services and load content
  useEffect(() => {
    // Prevent multiple initialization
    if (initializationRef.current) return;
    initializationRef.current = true;

    const initializeServices = async () => {
      try {
        console.log('🚀 Initializing PublishingScreen...');
        setIsLoading(true);

        // Initialize publishing service
        const pubService = new MobilePublishingService();
        setPublishingService(pubService);
        console.log('✅ Publishing service initialized');

        // Check for existing wallets
        const availableWallets = await MobileWalletService.getAvailableWallets();
        if (availableWallets.length === 0) {
          setWalletStatus('none');
        } else {
          setWalletStatus('locked');
          console.log(`Found ${availableWallets.length} existing wallet(s)`);
        }
        
        // CRITICAL: Load existing content immediately
        await loadExistingContent(pubService);
        
        console.log('✅ PublishingScreen initialization complete');
      } catch (error) {
        console.error('❌ Error initializing PublishingScreen:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeServices();
  }, []);

  // Load existing content function with duplicate prevention
  const loadExistingContent = async (pubService = publishingService) => {
    if (!pubService) {
      console.warn('⚠️ Publishing service not available for content loading');
      return;
    }

    // Prevent multiple simultaneous loads
    if (contentLoadedRef.current) {
      console.log('📚 Content already loaded, skipping duplicate load');
      return;
    }

    try {
      contentLoadedRef.current = true;
      console.log('📚 Loading existing content...');
      
      // Load all content types
      const [published, inProgress, drafts] = await Promise.all([
        pubService.getPublishedContent(),
        pubService.getInProgressContent(),
        pubService.getDrafts()
      ]);

      console.log(`📊 Loaded content: ${published.length} published, ${inProgress.length} in progress, ${drafts.length} drafts`);
      
      // Update state with loaded content
      setPublishedContent(published);
      setInProgressContent(inProgress);
      setDrafts(drafts);

      // Try to get stats
      try {
        if (typeof pubService.getPublishingStats === 'function') {
          const stats = await pubService.getPublishingStats();
          setPublishingStats(stats);
        }
      } catch (error) {
        console.log('Publishing stats not available:', error.message);
      }

    } catch (error) {
      console.error('❌ Error loading existing content:', error);
    } finally {
      // Reset the flag after a delay to allow future refreshes
      setTimeout(() => {
        contentLoadedRef.current = false;
      }, 1000);
    }
  };

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

  // Wallet handlers setup
  const walletHandlers = WalletHandlers({
    password,
    setPassword,
    setWalletService,
    setWalletStatus,
    loadWalletInfo
  });

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

  // Handle file selection and publishing with duplicate prevention
  const handlePublishFile = async () => {
    if (!walletService || !publishingService || publishing) {
      Alert.alert('Error', 'Services not ready or already publishing');
      return;
    }
    
    try {
      setPublishing(true);
      setProgress({ message: 'Selecting file...', percentage: 0 });
      
      // Pick and load file
      const fileContent = await publishingService.pickAndLoadFile();
      if (!fileContent) {
        setPublishing(false);
        setProgress(null);
        return;
      }

      setProgress({ message: 'Preparing content...', percentage: 10 });
      
      // Prepare content for publishing
      const preparedContent = await publishingService.prepareContent(
        fileContent,
        fileContent.title || 'Untitled Story'
      );

      setProgress({ message: 'Publishing to blockchain...', percentage: 20 });
      
      // Publish content
      const result = await publishingService.publishContent(
        preparedContent,
        (status) => {
          setProgress({
            message: `Publishing glyph ${status.successfulGlyphs + 1}/${status.totalGlyphs}...`,
            percentage: 20 + (status.progress * 0.8) // Scale to 20-100%
          });
        }
      );

      // Handle result
      if (result.status === 'completed') {
        Alert.alert('✅ Success!', `Successfully published "${preparedContent.title}"!`);
      } else if (result.status === 'partial') {
        Alert.alert('⚠️ Partial Success', `Published ${result.successfulGlyphs}/${result.totalGlyphs} glyphs.`);
      } else {
        Alert.alert('❌ Publishing Failed', 'Publishing failed. Please try again.');
      }
      
    } catch (error) {
      console.error('Publishing error:', error);
      Alert.alert('Error', 'Publishing failed: ' + error.message);
    } finally {
      // Always clean up publishing state and refresh content
      setTimeout(async () => {
        setPublishing(false);
        setProgress(null);
        
        // Refresh content after publishing
        try {
          await loadExistingContent();
        } catch (refreshError) {
          console.error('Error refreshing content:', refreshError);
        }
      }, 1000);
    }
  };

  // Handle resuming publishing for in-progress content
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
        await loadExistingContent();
      }
      
    } catch (error) {
      console.error('Resume error:', error);
      Alert.alert('Error', 'Failed to resume publishing: ' + error.message);
    } finally {
      setPublishing(false);
      setProgress(null);
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

  // Handle clearing test data
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
            await loadExistingContent();
            Alert.alert('Success', 'All test data cleared!');
          } catch (error) {
            Alert.alert('Error', 'Failed to clear data: ' + error.message);
          }
        }}
      ]
    );
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
      } else if (balance && balance.balance !== undefined) {
        setWalletBalance(balance.balance);
      } else {
        console.warn('⚠️ Unexpected balance format:', balance);
        setWalletBalance(0);
      }
    } catch (error) {
      console.error('❌ Error loading wallet info:', error);
      setWalletBalance(0);
    }
  };

  return (
    <SafeAreaView style={publishingStyles.container}>
      {/* Header */}
      <View style={publishingStyles.header}>
        <TouchableOpacity onPress={handleBack} style={publishingStyles.backButton}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={publishingStyles.headerTitle}>Publishing</Text>
        <View style={publishingStyles.headerSpacer} />
      </View>

      <ScrollView 
        style={publishingStyles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={publishingStyles.scrollContent}
      >
        {/* Wallet Section */}
        <WalletSection 
          walletStatus={walletStatus}
          walletBalance={walletBalance}
          password={password}
          setPassword={setPassword}
          handleWalletAction={handleWalletAction}
          isLoading={isLoading}
        />
        
        {/* Publishing Button */}
        <TouchableOpacity 
          style={[
            publishingStyles.publishButton,
            (publishing || walletStatus !== 'unlocked') && publishingStyles.publishButtonDisabled
          ]}
          onPress={handlePublishFile}
          disabled={publishing || walletStatus !== 'unlocked' || isLoading}
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

export default PublishingScreen;

// 12,747 characters