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
import { ArrowLeft } from 'lucide-react-native';
import { publishingStyles } from '../styles/publishingStyles';
import { WalletSection, ProgressBar, ContentSections } from '../components/publishing';
import { MobilePublishingService } from '../services/publishing/MobilePublishingService';
import { MobileStorageManager } from '../services/publishing/MobileStorageManager';
import { MobileScrollManager } from '../services/publishing/MobileScrollManager';
import { useWallet } from '../hooks/useWallet'; // NEW: Import our hook

export const PublishingScreen = ({ navigation }) => {
  // NEW: Use the wallet hook instead of managing wallet state directly
  const {
    walletService,
    walletStatus,
    walletBalance,
    walletAddress,
    password,
    isLoadingWallet,
    showWalletUnlock,
    isRequestingAirdrop,
    setPassword,
    setShowWalletUnlock,
    handleWalletAction,
    handleRequestAirdrop,
    handleMigration
  } = useWallet();

  // Core state management (keeping non-wallet state as-is)
  const [publishingService] = useState(() => new MobilePublishingService());
  const [publishing, setPublishing] = useState(false);
  const [progress, setProgress] = useState({
    progress: 0,
    currentGlyph: 0,
    totalGlyphs: 0,
    message: ''
  });
  const [inProgressContent, setInProgressContent] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [publishedContent, setPublishedContent] = useState([]);
  const [publishingStats, setPublishingStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize data on component mount
  useEffect(() => {
    initializeData();
  }, []);

  // Link wallet to publishing service when wallet becomes available
  useEffect(() => {
    if (walletService && walletStatus === 'unlocked' && publishingService) {
      console.log('🔗 Linking wallet to publishing service...');
      publishingService.setWallet(walletService);
    }
  }, [walletService, walletStatus, publishingService]);

  // Initialize all data including published content
  const initializeData = async () => {
    try {
      console.log('🔄 Initializing PublishingScreen data...');
      setIsLoading(true);
      
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

  // Load published content
  const loadPublishedContent = async () => {
    try {
      const published = await MobileStorageManager.getPublishedContentArray();
      console.log(`📚 Loaded ${published.length} published items`);
      setPublishedContent(published);
    } catch (error) {
      console.error('Error loading published content:', error);
      setPublishedContent([]);
    }
  };

  // Load publishing stats
  const loadPublishingStats = async () => {
    try {
      if (publishingService && typeof publishingService.getPublishingStats === 'function') {
        const stats = await publishingService.getPublishingStats();
        setPublishingStats(stats);
      }
    } catch (error) {
      console.log('Publishing stats not available:', error.message);
    }
  };

  // Handle file selection and publishing
  const handlePublishFile = async () => {
    if (!walletService || walletStatus !== 'unlocked') {
      Alert.alert('Wallet Required', 'Please unlock your wallet first');
      return;
    }

    if (publishing) return;

    try {
      setPublishing(true);
      setProgress({ 
        message: 'Selecting file...', 
        progress: 0,
        currentGlyph: 0,
        totalGlyphs: 0 
      });
      
      // Pick and load file
      const fileContent = await publishingService.pickAndLoadFile();
      if (!fileContent) {
        setPublishing(false);
        setProgress({
          progress: 0,
          currentGlyph: 0,
          totalGlyphs: 0,
          message: ''
        });
        return;
      }

      setProgress({ 
        message: 'Preparing content...', 
        progress: 10,
        currentGlyph: 0,
        totalGlyphs: 0 
      });
      
      // Prepare content for publishing
      const preparedContent = await publishingService.prepareContent(
        fileContent,
        fileContent.title || 'Untitled Story'
      );

      // Save as in-progress (like original code)
      await MobileStorageManager.saveInProgressContent(preparedContent);
      await loadInProgressContent();

      setProgress({ 
        message: 'Publishing to blockchain...', 
        progress: 20,
        currentGlyph: 0,
        totalGlyphs: preparedContent.glyphs ? preparedContent.glyphs.length : 0 
      });
      
      // Publish content - use blockchainPublisher directly like original code
      const result = await publishingService.blockchainPublisher.publishContent(
        preparedContent,
        walletService.getWalletKeypair(),
        (status) => {
          console.log(`📊 Progress: ${status.progress}%`);
          setProgress({
            progress: status.progress || 0,              // ← NOT 'percentage'
            currentGlyph: status.currentGlyph || 0,      // ← Include this
            totalGlyphs: status.totalGlyphs || 0,        // ← Include this
            stage: status.stage || 'publishing',         // ← Include stage
            message: `Publishing glyph ${status.currentGlyph || 0}/${status.totalGlyphs || 0}...`
          });
        }
      );

      // Handle result
      if (result.status === 'completed') {
        Alert.alert('✅ Success!', `Successfully published "${preparedContent.title}"!`);
        
        // Refresh content lists
        await Promise.all([
          loadInProgressContent(),
          loadPublishedContent(),
          loadPublishingStats()
        ]);
      } else if (result.status === 'partial') {
        Alert.alert('⚠️ Partial Success', `Published ${result.successfulGlyphs}/${result.totalGlyphs} glyphs.`);
        
        // Still refresh to show partial progress
        await Promise.all([
          loadInProgressContent(),
          loadPublishedContent(),
          loadPublishingStats()
        ]);
      } else {
        Alert.alert('❌ Publishing Failed', result.error || 'Publishing failed. Please try again.');
      }

    } catch (error) {
      console.error('❌ Publishing process failed:', error);
      Alert.alert('Publishing Failed', error.message);
    } finally {
      setPublishing(false);
      setProgress({
        progress: 0,
        currentGlyph: 0,
        totalGlyphs: 0,
        message: ''
      });
    }
  };

  // Resume publishing for in-progress content
  const handleResumePublishing = async (contentId) => {
    try {
      console.log(`🔄 Resuming publishing for: ${contentId}`);
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
      
      let manifest = publishedItem.manifest;
      
      if (!manifest && publishedItem.scrollId) {
        console.log('🔍 Fetching manifest for scrollId:', publishedItem.scrollId);
        manifest = await MobileScrollManager.getScrollById(publishedItem.scrollId);
      }
      
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
          text: 'Clear All', 
          style: 'destructive', 
          onPress: async () => {
            try {
              const { ClearPublishedScript } = await import('../utils/ClearPublishedScript');
              await ClearPublishedScript.clearAll();
              await Promise.all([
                loadInProgressContent(),
                loadPublishedContent(),
                loadPublishingStats()
              ]);
              Alert.alert('Success', 'All test data cleared!');
            } catch (error) {
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
  if (isLoading && walletStatus === 'checking') {
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
      {/* Header */}
      <View style={publishingStyles.header}>
        <TouchableOpacity onPress={handleGoBack} style={publishingStyles.backButton}>
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
        {/* Wallet Section - Using wallet hook data */}
        <WalletSection 
          walletStatus={walletStatus}
          walletAddress={walletAddress}
          walletBalance={walletBalance}
          isRequestingAirdrop={isRequestingAirdrop}
          showWalletUnlock={showWalletUnlock}
          password={password}
          isLoading={isLoadingWallet}
          setPassword={setPassword}
          setShowWalletUnlock={setShowWalletUnlock}
          handleRequestAirdrop={handleRequestAirdrop}
          handleWalletAction={handleWalletAction}
          handleMigration={handleMigration}
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
        
        {/* Content Sections */}
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default PublishingScreen;

// Character count: 13,052