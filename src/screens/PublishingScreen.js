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
import { LoadingOverlay, Button, ErrorBoundary, ErrorDisplay, RetryButton, ScreenContainer, ContentArea } from '../components/shared';
import { TopBar, BottomBar } from '../components/navigation';
import { UserPanel, UserSelectorPanel } from '../components/panels';
import { publishingStyles } from '../styles/publishingStyles';
import { WalletSection, ProgressBar, ContentSections } from '../components/publishing';
import { StorageService } from '../services/storage/StorageService';
import { useWallet } from '../hooks/useWallet';
import { useUser } from '../hooks/useUser';
import { usePublishing } from '../hooks/usePublishing'; // NEW: Import usePublishing hook
import { spacing } from '../styles/tokens';
import { Keypair } from '@solana/web3.js';
import { UserStorageService } from '../services/storage/UserStorageService';

export const PublishingScreen = ({ navigation, route }) => {
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
  } = usePublishing(userWalletService);

  // User management via shared context  
  const {
    selectedUser,
    selectedUserData,
    userWalletBalance,
    showUserPanel,
    showUserSelectorPanel,
    handleUserTap,
    handleUserLongPress,
    handleUserSelect,
    handleCloseUserPanel,
    handleCloseUserSelectorPanel,
    refreshUserBalance
  } = useUser();

  // Keep only the essential local state
  const [isLoading, setIsLoading] = useState(true);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletLoadingMessage, setWalletLoadingMessage] = useState('');
  const [airdropLoading, setAirdropLoading] = useState(false);
  const [initError, setInitError] = useState(null);
  const [publishError, setPublishError] = useState(null);
  const [userWalletService, setUserWalletService] = useState(null);
  

  // Initialize data on component mount
  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
  const setupUserWallet = async () => {
    if (selectedUser && selectedUser.publicKey) {
      try {
        console.log('🔧 Setting up user wallet for publishing:', selectedUser.username);
        
        // Import user keys (you'll need this - same as ComposerModal)
        const userKeys = require('../data/user-keys.json');
        
        // Create user wallet object
        const userWallet = {
          getWalletKeypair: () => {
            const privateKeyArray = userKeys[selectedUser.username];
            if (!privateKeyArray) {
              throw new Error(`No private key found for user: ${selectedUser.username}`);
            }
            const keypair = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
            return keypair;
          },
          getWalletPublicKey: () => {
            return selectedUser.publicKey;
          },
          getBalance: async () => {
            return { available: userWalletBalance, currency: 'SOL' };
          }
        };
        
        setUserWalletService(userWallet);
        console.log('✅ User wallet service ready for:', selectedUser.username);
      } catch (error) {
        console.error('❌ Error setting up user wallet:', error);
        setUserWalletService(null);
      }
    } else {
      setUserWalletService(null);
    }
  };
  
  setupUserWallet();
}, [selectedUser, userWalletBalance]);

// Set user wallet on publishing service when userWalletService changes
useEffect(() => {
  if (userWalletService && publishingService) {
    publishingService.setWallet(userWalletService);
  }
}, [userWalletService, publishingService]);

  // Initialize all data including published content
  const initializeData = async () => {
    try {
      console.log('🔄 Initializing PublishingScreen data...');
      setIsLoading(true);
      setInitError(null);

      await loadExistingContent();
      console.log('✅ PublishingScreen initialization complete');
    } catch (error) {
      console.error('❌ Error initializing PublishingScreen:', error);
      setInitError({
        type: 'general',
        message: 'Failed to load publishing data. Please try again.'
      });
    } finally {
      setIsLoading(false);
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
    if (!userWalletService || !publishingService || publishing) {
      console.log('🚫 Cannot publish:', { 
        walletService: !!userWalletService, 
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
      const keypair = userWalletService.getWalletKeypair();
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
      const result = await publishToBlockchain(
        preparedContent, 
        keypair, 
        onProgress,
        selectedUser?.publicKey
      );

      if (result && result.status === 'completed') {
        // Refresh user's balance after successful publishing
        if (selectedUser) {
          console.log('💰 Refreshing user balance after successful publishing...');
          await refreshUserBalance(selectedUser);
        }
        
        Alert.alert(
          '✅ Success!', 
          `Successfully published "${preparedContent.title}"!`
        );
      } else if (result && result.status === 'partial') {
        // Refresh user's balance after partial publishing (they still paid for some transactions)
        if (selectedUser) {
          console.log('💰 Refreshing user balance after partial publishing...');
          await refreshUserBalance(selectedUser);
        }
        
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
    if (!userWalletService || !publishingService || publishing) {
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
              await ClearPublishedScript.clearOnlyLongFormContent();
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

  // Clear draft/in-progress data (for testing)
  const handleClearDrafts = async () => {
  Alert.alert(
    'Clear Draft Data',
    'This will remove all draft and published content for this user. Are you sure?',
    [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Clear All', 
        style: 'destructive', 
        onPress: async () => {
          try {
            if (!selectedUser?.publicKey) {
              Alert.alert('Error', 'No user selected');
              return;
            }
            
            // ✅ FIXED: Clear user-scoped data instead of global data
            const result = await UserStorageService.clearUserData(selectedUser.publicKey);
            
            if (result.success) {
              // Also clear global drafts and in-progress (these are still global)
              const { ClearPublishedScript } = await import('../utils/ClearPublishedScript');
              await ClearPublishedScript.clearInProgress();
              
              await loadExistingContent(); // Refresh the UI
              Alert.alert('Success', 'All user data cleared!');
            } else {
              throw new Error(result.error || 'Failed to clear user data');
            }
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
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('PublishingScreen error:', error);
        setPublishError({
          type: 'general',
          message: 'An unexpected error occurred in the publishing screen.'
        });
      }}
      onRetry={() => {
        setPublishError(null);
        initializeData();
      }}
    >
      <ScreenContainer isDarkMode={false} variant="screen">
        {/* Header */}
        <TopBar 
          title="Publishing"
          selectedUser={selectedUser}
          onUserTap={handleUserTap}
          isDarkMode={false}
        />

        <ContentArea variant="scroll" isDarkMode={false} withBottomBarPadding={true}>
          {/* Error display for initialization errors */}
          {initError && (
            <ErrorDisplay
              type={initError.type}
              title="Initialization Error"
              message={initError.message}
              onRetry={initializeData}
              showGoBack={true}
              onGoBack={() => navigation.goBack()}
              style={{ margin: spacing.medium }}
            />
          )}
          
          {/* Error display for publishing errors */}
          {publishError && (
            <ErrorDisplay
              type={publishError.type}
              title="Publishing Error"
              message={publishError.message}
              onRetry={() => setPublishError(null)}
              style={{ margin: spacing.medium }}
            />
          )}

          {/* Wallet Section */}
            {/* Simple Wallet Balance Display */}
            {selectedUser && (
              <View style={{
                alignItems: 'center',
                paddingVertical: spacing.medium,
                borderBottomWidth: 1,
                borderBottomColor: '#eee',
                marginBottom: spacing.medium
              }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#333'
                }}>
                  Wallet: {userWalletBalance.toFixed(5)} SOL
                </Text>
              </View>
            )}
          
          {/* Progress Bar - EXACTLY THE SAME */}
          <ProgressBar publishing={publishing} progress={progress} />
          
          {/* Content Sections - EXACTLY THE SAME */}
          <ContentSections 
            inProgressContent={inProgressContent}
            drafts={drafts}
            publishedContent={publishedContent.filter(item => 
              item.type !== 'social_post' && 
              !item.socialPost &&
              !item.title?.startsWith('Post by ')
            )}
            publishingStats={publishingStats}
            walletStatus={walletStatus}
            publishing={publishing}
            handleResumePublishing={handleResumePublishing}
            handleViewStory={handleViewStory}
          />
        </ContentArea>

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

        {/* Bottom Bar Navigation */}
        <BottomBar 
          onLogoPress={() => {
            // Navigate to compose/HomeScreen or open compose modal
            navigation.navigate('ComposeModal', {
              selectedUser: null, // Can be null for PublishingScreen
              selectedUserData: null,
              userWalletBalance: 0,
              onPostCreate: () => {} // Empty callback
            });
          }}
          onLongPressMenu={(action) => {
            // Handle publishing-specific actions
            switch (action) {
              case 'pickfile-publish':
                handlePublishFile();
                break;
              case 'clear-test':
                handleClearPublished();
                break;
              case 'clear-drafts':
                handleClearDrafts();
                break;
              default:
                console.log('Unknown action:', action);
            }
          }}
          onHomePress={() => {
            // Navigate back to home screen
            navigation.goBack();
          }}
          customRadialButtons={{
            top: {
              action: 'pickfile-publish',
              label: 'Pick & Pub',
              icon: 'file'
            },
            right: {
              action: 'clear-drafts', 
              label: 'Clear Drafts',
              icon: 'clear'
            },
            left: {
              action: 'clear-test',
              label: 'Clear Test',
              icon: 'clear'
            }
          }}
          isDarkMode={false}
        />

        {/* User Panels */}
        <UserPanel
          visible={showUserPanel}
          selectedUser={selectedUser}
          selectedUserData={selectedUserData}
          userWalletBalance={userWalletBalance}
          onClose={handleCloseUserPanel}
          onUserBalanceUpdate={() => {}} // TODO: Implement balance refresh
          isDarkMode={false}
        />

        <UserSelectorPanel
          visible={showUserSelectorPanel}
          selectedUser={selectedUser}
          onUserSelect={handleUserSelect}
          onClose={handleCloseUserSelectorPanel}
          isDarkMode={false}
        />


      </ScreenContainer>
    </ErrorBoundary>
  );
};

export default PublishingScreen;

// Character count: 10,847