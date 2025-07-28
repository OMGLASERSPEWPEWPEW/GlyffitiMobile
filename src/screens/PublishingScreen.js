// src/screens/PublishingScreen.js
// Path: src/screens/PublishingScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { LoadingOverlay, Button } from '../components/shared';
import { ArrowLeft } from 'lucide-react-native';
import { publishingStyles } from '../styles/publishingStyles';
import { WalletSection, ProgressBar, ContentSections } from '../components/publishing';
import { StorageService } from '../services/storage/StorageService';
import { useWallet } from '../hooks/useWallet';
import { usePublishing } from '../hooks/usePublishing'; // NEW: Import usePublishing hook

export const PublishingScreen = ({ navigation }) => {
  // Use the wallet hook (keeping this as-is)
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

  // NEW: Use the publishing hook instead of local state
  const {
    publishingService,
    isPublishing: publishing,
    progress,
    drafts,
    inProgressContent,
    publishedContent,
    publishingStats,
    isLoadingContent,
    loadExistingContent,
    publishToBlockchain
  } = usePublishing(walletService);

  // Keep only the essential local state
  const [isLoading, setIsLoading] = useState(true);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletLoadingMessage, setWalletLoadingMessage] = useState('');
  const [airdropLoading, setAirdropLoading] = useState(false);

  // Initialize data on component mount
  useEffect(() => {
    initializeData();
  }, []);

  // Initialize all data including published content
  const initializeData = async () => {
    try {
      console.log('🔄 Initializing PublishingScreen data...');
      setIsLoading(true);
      
      // Use the hook's loadExistingContent method
      await loadExistingContent();
      
      console.log('✅ PublishingScreen initialization complete');
    } catch (error) {
      console.error('❌ Error initializing PublishingScreen:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced wallet action handler with loading overlay
  const handleWalletActionWithLoading = async () => {
    try {
      setWalletLoading(true);
      
      if (walletStatus === 'none') {
        setWalletLoadingMessage('Creating secure wallet...');
        await new Promise(resolve => setTimeout(resolve, 800));
        setWalletLoadingMessage('Encrypting with password...');
        
        const result = await handleWalletAction();
        
        if (result !== false) {
          setWalletLoadingMessage('Wallet created successfully!');
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } else {
        setWalletLoadingMessage('Unlocking wallet...');
        
        const result = await handleWalletAction();
        
        if (result !== false) {
          setWalletLoadingMessage('Wallet unlocked successfully!');
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
    } catch (error) {
      console.error('Wallet action error:', error);
      Alert.alert('Error', 'Failed to complete wallet action: ' + error.message);
    } finally {
      setWalletLoading(false);
      setWalletLoadingMessage('');
    }
  };

    // Enhanced airdrop handler with loading overlay
  const handleRequestAirdropWithLoading = async () => {
    try {
      setAirdropLoading(true);
      await handleRequestAirdrop();
    } catch (error) {
      console.error('Airdrop error:', error);
      Alert.alert('Error', 'Failed to request airdrop: ' + error.message);
    } finally {
      setAirdropLoading(false);
    }
  };

  // Cancel wallet loading
  const handleCancelWalletLoading = () => {
    Alert.alert(
      'Cancel Operation',
      'Are you sure you want to cancel the wallet operation?',
      [
        { text: 'Continue', style: 'cancel' },
        { 
          text: 'Cancel', 
          style: 'destructive',
          onPress: () => {
            setWalletLoading(false);
            setWalletLoadingMessage('');
          }
        }
      ]
    );
  };

  // Publishing logic - using the original simple one-tap flow
  const handlePublishFile = async () => {
    if (!walletService || !publishingService || publishing) {
      console.log('🚫 Cannot publish:', { 
        walletService: !!walletService, 
        publishingService: !!publishingService, 
        publishing 
      });
      return;
    }
    
    try {
      // Pick and load file
      const content = await publishingService.pickAndLoadFile();
      if (!content) {
        console.log('📄 No file selected');
        return;
      }
      
      // Prepare content
      const preparedContent = await publishingService.prepareContent(
        content,
        content.title || 'Untitled Story'
      );
      
      if (!preparedContent) {
        Alert.alert('Error', 'Failed to prepare content');
        return;
      }
      
      // Get wallet keypair
      const keypair = walletService.getWalletKeypair();
      if (!keypair) {
        Alert.alert('Error', 'Failed to access wallet');
        return;
      }
      
      // Progress callback - matches original format
      const onProgress = (status) => {
        console.log('📊 Publishing progress:', status);
        // The hook handles progress state internally
      };
      
      // Use the hook's publishToBlockchain method
      const result = await publishToBlockchain(preparedContent, keypair, onProgress);
      
      if (result && result.status === 'completed') {
        Alert.alert(
          '✅ Success!', 
          `Successfully published "${preparedContent.title}"!`
        );
      } else if (result && result.status === 'partial') {
        Alert.alert(
          '⚠️ Partial Success', 
          `Published ${result.successfulGlyphs}/${result.totalGlyphs} glyphs.`
        );
      } else {
        Alert.alert('❌ Publishing Failed', 'Publishing failed. Please try again.');
      }
      
    } catch (error) {
      console.error('❌ Publishing error:', error);
      Alert.alert('Error', error.message || 'An error occurred during publishing');
    }
  };

  // Resume publishing for in-progress content
  const handleResumePublishing = async (contentId) => {
    if (!walletService || !publishingService || publishing) {
      console.log('🚫 Cannot resume publishing');
      return;
    }

    try {
      console.log(`🔄 Resuming publishing for content: ${contentId}`);
      
      const content = inProgressContent.find(c => c.id === contentId);
      if (!content) {
        throw new Error('Content not found');
      }

      await publishingService.resumePublishing(contentId);
      await loadExistingContent();
      
    } catch (error) {
      console.error('❌ Resume publishing failed:', error);
      Alert.alert('Resume Failed', error.message);
    }
  };

  // Handle viewing a published story
  const handleViewStory = async (item) => {
    try {
      console.log('📖 Opening story viewer for:', item.title);
      
      // Get manifest from the item or try to load it
      let manifest = item.manifest;
      
      if (!manifest && item.scrollId) {
        try {
          manifest = await StorageService.loadScroll(item.scrollId);
        } catch (error) {
          console.warn('⚠️ Could not load manifest from ScrollManager:', error);
          Alert.alert(
            'Story Loading Issue',
            'The story data may be incomplete.',
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
              await loadExistingContent(); // Use hook's method
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
      <LoadingOverlay
        visible={true}
        message="Initializing Publishing..."
        subMessage="Loading wallet and content data"
        modal={false}
        isDarkMode={false}
      />
    );
  }

  return (
    <SafeAreaView style={publishingStyles.container}>
      {/* Header - EXACTLY THE SAME */}
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
        {/* Wallet Section - EXACTLY THE SAME */}
        <WalletSection 
          walletStatus={walletStatus}
          walletAddress={walletAddress}
          walletBalance={walletBalance}
          isRequestingAirdrop={isRequestingAirdrop || airdropLoading}
          showWalletUnlock={showWalletUnlock}
          password={password}
          isLoading={isLoadingWallet || walletLoading}
          setPassword={setPassword}
          setShowWalletUnlock={setShowWalletUnlock}
          handleRequestAirdrop={handleRequestAirdropWithLoading}
          handleWalletAction={handleWalletActionWithLoading}
          handleMigration={handleMigration}
        />
        
        {/* Publishing Button - EXACTLY THE SAME STYLING */}
        <Button
          title={publishing ? '📤 Publishing...' : 
                walletStatus !== 'unlocked' ? '🔒 Unlock Wallet to Publish' :
                '📁 Pick File & Publish'}
          onPress={handlePublishFile}
          disabled={publishing || walletStatus !== 'unlocked' || isLoading}
          loading={publishing}
          variant="primary"
          size="large"
          style={publishingStyles.publishButton}
        />
        
        {/* Clear Test Data Button - EXACTLY THE SAME */}
        <Button
          title="🗑️ Clear Test Data"
          onPress={handleClearPublished}
          variant="danger"
          size="medium"
          style={publishingStyles.clearButton}
        />
        
        {/* Progress Bar - EXACTLY THE SAME */}
        <ProgressBar publishing={publishing} progress={progress} />
        
        {/* Content Sections - EXACTLY THE SAME */}
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


          {/* Wallet Loading Overlay */}
      <LoadingOverlay
        visible={walletLoading}
        message={walletLoadingMessage}
        subMessage="This may take a few moments..."
        showCancel={true}
        onCancel={handleCancelWalletLoading}
        isDarkMode={false}
        modal={true}
      />

      {/* Airdrop Loading Overlay */}
      <LoadingOverlay
        visible={airdropLoading}
        message="Requesting Airdrop..."
        subMessage="Connecting to Solana testnet"
        showCancel={false}
        isDarkMode={false}
        modal={true}
      />           



    </SafeAreaView>
  );
};

export default PublishingScreen;

// Character count: 10,847