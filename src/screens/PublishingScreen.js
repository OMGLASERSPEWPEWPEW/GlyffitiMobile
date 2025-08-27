// src/screens/PublishingScreen.js
// Path: src/screens/PublishingScreen.js
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert
} from 'react-native';
import { LoadingOverlay, ErrorBoundary, ErrorDisplay, ScreenContainer, ContentArea } from '../components/shared';
import { TopBar, BottomBar } from '../components/navigation';
import { UserPanel, UserSelectorPanel } from '../components/panels';
import { publishingStyles } from '../styles/publishingStyles';
import { ProgressBar, PublishingStatusIndicator, ContentSections } from '../components/publishing';
import { StorageService } from '../services/storage/StorageService';
import { useWallet } from '../hooks/useWallet';
import { useUser } from '../hooks/useUser';
import { usePublishing } from '../hooks/usePublishing'; 
import { spacing } from '../styles/tokens';
import { Keypair } from '@solana/web3.js';
import { UserStorageService } from '../services/storage/UserStorageService';
import { StoryHeaderService } from '../services/feed/StoryHeaderService';
import { nuclearClearStories } from '../utils/NuclearClear';
import userRegistry from '../data/user-registry.json';
import ContentServiceM from '../services/content/ContentService-M';
import PublishingServiceM from '../services/publishing/PublishingService-M';
import StoryViewerServiceM from '../services/story/StoryViewerService-M';

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
    setProgress,
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
  

  const [isMerklePublishing, setIsMerklePublishing] = useState(false);
  const [merkleProgress, setMerkleProgress] = useState({ 
    current: 0, 
    total: 0, 
    message: '' 
  });


  const handleMerklePublish = async () => {
  console.log('🚀 handleMerklePublish: Starting...');
  
  // Check if both selectedUser and selectedUserData are available
  if (!selectedUser || !selectedUserData) {
    console.log('❌ handleMerklePublish: Missing user data');
    console.log('  selectedUser:', !!selectedUser);
    console.log('  selectedUserData:', !!selectedUserData);
    Alert.alert('User Not Selected', 'Please select a user first.');
    return;
  }
  
  // Extract the Glyffiti genesis from the decoded user data
  // selectedUserData contains the decoded genesis block with the 'parent' field
  const glyffitiGenesisHash = selectedUserData.parent || selectedUserData.parentGenesis;
  
  if (!glyffitiGenesisHash) {
    console.error('❌ handleMerklePublish: No Glyffiti genesis found in user data:', selectedUserData);
    Alert.alert('Error', 'Could not find Glyffiti genesis hash in user data.');
    return;
  }
  
  console.log('✅ handleMerklePublish: User selected:', {
    username: selectedUser.username,
    publicKey: selectedUser.publicKey?.substring(0, 16) + '...',
    transactionHash: selectedUser.transactionHash?.substring(0, 16) + '...',
    glyffitiGenesis: glyffitiGenesisHash?.substring(0, 16) + '...'
  });

  // Check if userWalletService is ready
  if (!userWalletService) {
    console.log('❌ handleMerklePublish: No userWalletService');
    Alert.alert('Wallet Not Ready', 'User wallet is not initialized.');
    return;
  }
  console.log('✅ handleMerklePublish: userWalletService exists');

  // Get keypair from userWalletService
  let keypair;
  try {
    keypair = userWalletService.getWalletKeypair();
    if (!keypair) {
      console.log('❌ handleMerklePublish: getWalletKeypair returned null');
      Alert.alert('Wallet Error', 'Could not retrieve user keypair.');
      return;
    }
    console.log('✅ handleMerklePublish: Got keypair:', keypair.publicKey.toString());
  } catch (error) {
    console.error('❌ handleMerklePublish: Error getting keypair:', error);
    Alert.alert('Wallet Error', 'Failed to get keypair: ' + error.message);
    return;
  }

  // Check if already publishing
  if (publishing) {
    console.log('⚠️ handleMerklePublish: Already publishing');
    Alert.alert('Publishing', 'Already publishing, please wait...');
    return;
  }

  console.log('📝 handleMerklePublish: Starting merkle publish process...');

  try {
  // Pick and load file (same as handlePublishFile)
  const content = await publishingService.pickAndLoadFile();
  if (!content) {
    console.log('📄 handleMerklePublish: No file selected');
    return;
  }
  
  console.log('📄 handleMerklePublish: File selected:', {
    title: content.title,
    size: content.size,
    type: content.type
  });
  
  // ✅ Use data from both selectedUser (registry) and selectedUserData (decoded genesis)
  console.log('🔨 handleMerklePublish: Calling ContentServiceM with correct parameters...');
  console.log('  Author Public Key:', selectedUser.publicKey);
  console.log('  User Genesis Hash:', selectedUser.transactionHash);
  console.log('  Glyffiti Genesis Hash:', glyffitiGenesisHash);
  
  const preparedContent = await ContentServiceM.prepareContentForManifestPublishing(
    content.content,              // Use actual file content
    content.title || 'Untitled Story', // Add title parameter (required)
    selectedUser.publicKey,        // User's public key from registry
    {
      tags: ['test'],
      reGlyphCap: 1000
    }
  );

  setIsMerklePublishing(true);
    const totalSteps =
      1 + (preparedContent.hashListChunks?.length || 0) + (preparedContent.contentChunks?.length || 0);

    setProgress({
      phase: 'manifest',
      current: 0,
      total: totalSteps,
      message: 'Preparing 3-tier manifest…',
      publicationPackage: preparedContent,
    });

  // Store the original content info for later storage
  preparedContent.originalTitle = content.title || 'Untitled Story';
  preparedContent.originalFilename = content.filename;
  preparedContent.originalSize = content.size;
  preparedContent.originalType = content.type;
    
  // ADD: Store the publicationPackage in progress state for the new PublishingStatusIndicator
  setProgress(prev => ({
    phase: 'manifest',
    current: 0,
    total: 1 + (preparedContent.hashListChunks?.length || 0) + (preparedContent.contentChunks?.length || 0),
    message: 'Preparing to publish story manifest...',
    progress: 0,
    publicationPackage: preparedContent  // <-- ADD THIS LINE
  }));

    console.log('✅ handleMerklePublish: Content prepared:', {
      glyphs: preparedContent.glyphs?.length || 0,
      reGlyphCap: preparedContent.reGlyphCap,
      authorPublicKey: preparedContent.authorPublicKey?.substring(0, 16) + '...',
      userGenesisHash: preparedContent.userGenesisHash?.substring(0, 16) + '...',
      glyffitiGenesisHash: preparedContent.glyffitiGenesisHash?.substring(0, 16) + '...'
    });

    // Publish the story using the merkle system
    console.log('📡 handleMerklePublish: Calling PublishingServiceM.publishStory...');
    const result = await PublishingServiceM.publishStoryWithManifest(
    preparedContent,
    keypair,  // Use the keypair from userWalletService
    (update) => {
      console.log('📊 handleMerklePublish: Progress update:', update);
      // Update progress display
      setProgress({
        phase: update.phase,
        current: update.current,
        total: update.total,
        message: update.message || `${update.phase}: ${update.current}/${update.total}`,
        progress: Math.round((update.current / update.total) * 100)
      });
    }
  );
    
    const txIds = result.glyphTransactionIds;
    console.log('🎉 handleMerklePublish: Success! Story ID:', result.storyId);
    console.log('🎉 handleMerklePublish: Transaction IDs:', txIds);

// Store the published item in user storage (same pattern as old system)
try {
  const publishedItem = {
    id: `merkle-${Date.now()}`,
    type: 'merkle-v1',
    title: preparedContent.originalTitle,
    filename: preparedContent.originalFilename,
    size: preparedContent.originalSize,
    contentType: preparedContent.originalType,
    transactionIds: txIds,
    authorPublicKey: selectedUser.publicKey,
    publishedAt: new Date().toISOString(),
    glyphCount: preparedContent.summary.totalChunks || 0,
    storyId: result.storyId,
    manifestTxId: result.manifestTransactionId,
    reGlyphCap: preparedContent.reGlyphCap,
    status: 'completed'
  };
  
  // src/screens/PublishingScreen.js — handleMerklePublish()
// Save to user-scoped storage using the canonical API & id field
publishedItem.contentId = result.storyId; // canonical id for deletes & lookups

const contentTxIds = result.glyphTransactionIds || [];
const contentCount = contentTxIds.length;

publishedItem.manifest = {
  storyId: result.storyId,
  title: publishedItem.title,
  author: selectedUser?.username || selectedUser?.publicKey,
  chunks: contentTxIds,       // just the 9 glyph txs
  totalChunks: contentCount   // must equal chunks.length
};

// Persist in user-scoped storage
await UserStorageService.savePublishedStory(publishedItem, selectedUser.publicKey);

// (optional, but nice) also save a user-scoped scroll/manifest record
await UserStorageService.saveUserScroll(
  {
    storyId: result.storyId,
    title: publishedItem.title,
    createdAt: Date.now(),
    chunks: result.glyphTransactionIds,
    totalChunks: publishedItem.glyphCount
  },
  selectedUser.publicKey
);

console.log('✅ handleMerklePublish: Stored published item (user-scoped)');

  
} catch (storageError) {
  console.error('⚠️ handleMerklePublish: Failed to store published item:', storageError);
  // Continue anyway - the item was published successfully
}

Alert.alert(
  'Merkle Publish Success!', 
  `"${preparedContent.originalTitle}" published successfully!\n\nTransaction ID: ${txIds[0]?.substring(0, 12)}...`
);

// Refresh content to show the new published item
await loadExistingContent();
    
  } catch (error) {
    console.error('❌ handleMerklePublish: Publishing failed:', error);
    console.error('Stack trace:', error.stack);
    Alert.alert('Merkle Publish Error', error.message || 'Failed to publish story');
  } finally {
    console.log('🏁 handleMerklePublish: Cleaning up...');
    setIsMerklePublishing(false);
    // Reset progress
    setProgress({
      phase: 'complete', 
      current: 0, 
      total: 0, 
      message: '',
      publicationPackage: undefined,
    });
  }
};

const handleViewPublishedContent = async (item) => {
  // New/Merkle-v1 stories (3-tier)
  if (item.type === 'merkle-v1') {
    // Normalize to a viewer-ready manifest
    const txs = item.transactionIds || item.glyphTransactionIds || [];
    const viewerManifest = item.manifest || {
      protocol: 'merkle-v1',
      storyId: item.storyId || item.contentId || item.id,
      title: item.title,
      author: (selectedUser?.username || selectedUser?.publicKey || item.authorName),
      chunks: txs.map((txId, index) => ({ txId, index, type: 'glyph' })), // << required objects
      totalChunks: txs.length
    };

    console.log('📖 Opening story viewer for:', viewerManifest.title);
    console.log('✅ Navigating to story view with manifest:', {
      storyId: viewerManifest.storyId,
      title: viewerManifest.title,
      chunks: viewerManifest.totalChunks
    });

    navigation.navigate('StoryView', {
      storyId: viewerManifest.storyId,
      manifest: viewerManifest,
      autoStart: true
    });
    return;
  }

  // Legacy stories
  navigation.navigate('StoryView', {
    storyId: item.contentId,
    manifest: item,
  });
};

const handleMerkleVerify = async () => {
    setIsPublishing(true);
    setProgress({ current: 0, total: 1, message: 'Verifying on-chain data...' });
    
    // The transaction ID from our last successful test
    const testTxId = '5qe2nyLeGRvCMgM5KmsUuyPLq5Hke6xTFrLXHr8bRxxYAvMk5ATHXGUD9pL2CsMX5HauZVz4X8ntsTWi7Rsd1ipb';

    try {
      console.log(`🚀 handleMerkleVerify: Verifying TX ID: ${testTxId}`);
      const decodedContent = await StoryViewerServiceM.fetchAndVerifyStory(testTxId);

      Alert.alert(
        'Verification Success! ✅',
        `The content has been successfully decoded and its Merkle proof is valid.\n\nDecoded Content:\n"${decodedContent}"`
      );
      console.log(`🎉 handleMerkleVerify: Success! Decoded content: "${decodedContent}"`);

    } catch (error) {
      console.error('❌ handleMerkleVerify: Verification failed:', error);
      Alert.alert('Verification Error ❌', error.message);
    } finally {
      setIsPublishing(false);
      setProgress({ current: 0, total: 0, message: '' });
    }
  };


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
      const content = await publishingService.pickAndLoadFile(); // eight vars: id, title, content, filename, size, type, authorPublicKey, createdAt
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
  // src/screens/PublishingScreen.js
const handleViewStory = async (item) => {
  try {
    console.log('📖 Opening story viewer for:', item.title);

    // 1) Start with any manifest already on the item
    let manifest = item.manifest || null;

    // 2) If none, try loading any persisted scroll by id
    if (!manifest && item.scrollId) {
      try {
        manifest = await StorageService.loadScroll(item.scrollId);
      } catch (err) {
        console.warn('⚠️ Could not load manifest from ScrollManager:', err);
      }
    }

    // 3) If still none, backfill from the item’s fields (new merkle saved items have transactionIds)
    if (!manifest && Array.isArray(item.transactionIds) && item.transactionIds.length > 0) {
      manifest = {
        storyId: item.storyId || item.contentId || item.id,
        title: item.title,
        chunks: item.transactionIds.slice(),   // clone
        totalChunks: item.transactionIds.length
      };
    }

    // 4) Final validation / normalization
    if (!manifest || !Array.isArray(manifest.chunks) || manifest.chunks.length === 0) {
      Alert.alert('Story Unavailable', 'This story cannot be viewed because the content data is missing or incomplete.', [{ text: 'OK' }]);
      return;
    }
    if (manifest.totalChunks !== manifest.chunks.length) {
      // normalize to content-only totals
      manifest = { ...manifest, totalChunks: manifest.chunks.length };
    }

    console.log('✅ Navigating to story view with manifest:', {
      storyId: manifest.storyId,
      title: manifest.title,
      chunks: manifest.chunks.length
    });

    navigation.navigate('StoryView', {
      storyId: manifest.storyId,
      manifest,
      autoStart: true
    });

  } catch (error) {
    console.error('❌ Error opening story:', error);
    Alert.alert('Error', 'Failed to open the story. Please try again.', [{ text: 'OK' }]);
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
          
          {(publishing || isMerklePublishing) && (
            <PublishingStatusIndicator 
              progress={progress}   // we standardize this below
              isDarkMode={false}
            />
          )}
          
          {/* Content Sections - EXACTLY THE SAME */}
          <ContentSections 
            inProgressContent={inProgressContent}
            onPressPublished={handleViewPublishedContent}
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


          {/* TEMPORARY DEBUG SECTION - Get Story Stats */}
          <View style={{ marginTop: 20, padding: 10, backgroundColor: '#f0f0f0' }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Story Chain Debug</Text>
            
            <TouchableOpacity 
              style={{ backgroundColor: '#007AFF', padding: 10, margin: 5, borderRadius: 5 }}
              onPress={async () => {
                try {
                  const stats = await StoryHeaderService.getStats();
                  console.log('📊 Story Stats:', stats);
                  Alert.alert('Story Stats', JSON.stringify(stats, null, 2));
                } catch (error) {
                  console.error('Stats error:', error);
                  Alert.alert('Error', error.message);
                }
              }}
            >
              <Text style={{ color: 'white' }}>Get Story Stats</Text>
            </TouchableOpacity>

            {/* TEMPORARY DEBUG SECTION - Get All Story Heads */}
            <TouchableOpacity 
              style={{ backgroundColor: '#34C759', padding: 10, margin: 5, borderRadius: 5 }}
              onPress={async () => {
                try {
                  const heads = await StoryHeaderService.getAllUserStoryHeads();
                  console.log('📚 All Story Heads:', heads);
                  Alert.alert('Story Heads', JSON.stringify(heads, null, 2));
                } catch (error) {
                  console.error('Heads error:', error);
                  Alert.alert('Error', error.message);
                }
              }}
            >
              <Text style={{ color: 'white' }}>Get All Story Heads</Text>
            </TouchableOpacity>


          {/* TEMPORARY DEBUG SECTION - Read from Solana */}
          <TouchableOpacity
            style={{ backgroundColor: '#007AFF', padding: 10, margin: 5, borderRadius: 5 }}
            onPress={async () => {
              const currentUser = selectedUser;
              if (!currentUser) {
                Alert.alert('Error', 'No user selected');
                return;
              }
              
              Alert.alert('On-Chain Verification', 'Starting chain verification with correct approach...');
              
              /**
               * CORRECTED: Fetch and parse glyph metadata structure
               * Stories contain linking metadata in the glyph structure, not in content JSON
               */
              const fetchGlyphMetadata = async (txId) => {
                try {
                  console.log(`PublishingScreen.fetchGlyphMetadata: Fetching glyph structure from ${txId.substring(0,8)}...`);
                  
                  // Use PostTransactionReader which knows how to read the full glyph structure
                  const postReader = new (await import('../services/blockchain/PostTransactionReader')).PostTransactionReader();
                  const postData = await postReader.readPostFromTransaction(txId, currentUser.alias, currentUser.publicKey);
                  
                  if (!postData) {
                    throw new Error(`No post data found for transaction ${txId.substring(0,8)}`);
                  }
                  
                  console.log(`PublishingScreen.fetchGlyphMetadata: Post data structure:`, {
                    hasGlyphs: !!postData.glyphData,
                    hasPreviousHash: !!postData.previousPostHash,
                    glyphCount: postData.glyphData?.totalGlyphs || 0
                  });
                  
                  return postData;
                  
                } catch (error) {
                  console.error(`PublishingScreen.fetchGlyphMetadata: Error for tx ${txId.substring(0,8)}:`, error);
                  throw new Error(`Failed to read glyph metadata for ${txId.substring(0,8)}: ${error.message}`);
                }
              };

              try {
                console.log('PublishingScreen.verifyChain: Starting CORRECTED chain verification...');
                
                // Step 1: Get the head of the latest story
                const latestStoryHash = await StoryHeaderService.getUserStoryHead(currentUser.publicKey);
                if (!latestStoryHash) {
                  Alert.alert('Verification Failed', 'Could not find any story head for this user.');
                  return;
                }
                
                console.log(`PublishingScreen.verifyChain: Found latest story: ${latestStoryHash.substring(0,12)}...`);

                // Step 2: Read the latest story's glyph metadata
                const latestStory = await fetchGlyphMetadata(latestStoryHash);
                const previousStoryHash = latestStory.previousPostHash; // This contains the chain link
                
                console.log(`PublishingScreen.verifyChain: Latest story links to:`, 
                  previousStoryHash ? previousStoryHash.substring(0,12) + '...' : 'none (first story)');

                if (!previousStoryHash) {
                  // This is the first story - should link to user genesis
                  const registryEntry = userRegistry.users.find(u => u.publicKey === currentUser.publicKey);
                  const expectedGenesisHash = registryEntry?.transactionHash;
                  
                  Alert.alert('✅ First Story Verification', 
                    `This appears to be the user's first story.\n\n` +
                    `📖 Story Hash:\n${latestStoryHash.substring(0, 12)}...\n\n` +
                    `🎯 Expected to link to User Genesis:\n${expectedGenesisHash ? expectedGenesisHash.substring(0, 12) + '...' : 'Not Found'}\n\n` +
                    `Note: First stories should be linked to User Genesis during publishing.`);
                  return;
                }

                // Step 3: Read the previous story's metadata
                const previousStory = await fetchGlyphMetadata(previousStoryHash);
                const genesisHashFromChain = previousStory.previousPostHash;
                
                console.log(`PublishingScreen.verifyChain: Previous story links to:`, 
                  genesisHashFromChain ? genesisHashFromChain.substring(0,12) + '...' : 'none');

                // Step 4: Verify against user registry
                const registryEntry = userRegistry.users.find(u => u.publicKey === currentUser.publicKey);
                const expectedGenesisHash = registryEntry?.transactionHash;
                
                // For a 2-story chain: Latest → Previous → Genesis
                const isChainValid = genesisHashFromChain === expectedGenesisHash;
                
                console.log(`PublishingScreen.verifyChain: Chain validation result: ${isChainValid}`);
                console.log(`PublishingScreen.verifyChain: Expected genesis: ${expectedGenesisHash?.substring(0,12)}...`);
                console.log(`PublishingScreen.verifyChain: Found genesis: ${genesisHashFromChain?.substring(0,12)}...`);

                // Step 5: Display the verification result
                Alert.alert(
                  isChainValid ? '✅ On-Chain Verification SUCCESS' : '❌ On-Chain Verification FAILED',
                  `Story Chain Verification:\n\n` +
                  `📖 Latest Story:\n${latestStoryHash.substring(0, 12)}...\n` +
                  `Author: ${latestStory.author || 'Unknown'}\n` +
                  `Glyphs: ${latestStory.glyphData?.totalGlyphs || 0}\n` +
                  ` ⬇️ links to\n` +
                  `📖 Previous Story:\n${previousStoryHash.substring(0, 12)}...\n` +
                  `Author: ${previousStory.author || 'Unknown'}\n` +
                  `Glyphs: ${previousStory.glyphData?.totalGlyphs || 0}\n` +
                  ` ⬇️ links to\n` +
                  `🎯 Genesis Reference:\n${genesisHashFromChain ? genesisHashFromChain.substring(0, 12) + '...' : 'None'}\n\n` +
                  `🏷️ Expected Genesis:\n${expectedGenesisHash ? expectedGenesisHash.substring(0, 12) + '...' : 'Not Found'}\n\n` +
                  `${isChainValid ? '🎉 Perfect chain integrity!' : '⚠️ Chain linkage issue detected!'}\n\n` +
                  `📊 Verification Method: Reading glyph metadata structure`
                );
                
              } catch (error) {
                console.error('PublishingScreen.verifyChain: Chain verification error:', error);
                
                // More helpful error for architectural misunderstanding
                if (error.message.includes('JSON Parse error') || error.message.includes('Unexpected character')) {
                  Alert.alert('Verification Error', 
                    `Architecture Issue Detected:\n\n` +
                    `The transactions contain story content (text), not JSON metadata.\n\n` +
                    `Story linking information is embedded in the glyph structure.\n\n` +
                    `Error: ${error.message}\n\n` +
                    `Solution: Use PostTransactionReader to read full glyph metadata.`);
                } else {
                  Alert.alert('Verification Error', 
                    `An error occurred during chain verification:\n\n${error.message}\n\nCheck console for details.`);
                }
              }
            }}
          >
            <Text style={{ color: 'white' }}>⛓️ Verify Story Chain (Glyph Metadata)</Text>
          </TouchableOpacity>

         {/* TEMPORARY DEBUG SECTION - Check Local Chain Status */}
          <TouchableOpacity
            style={{ backgroundColor: '#28a745', padding: 10, margin: 5, borderRadius: 5 }}
            onPress={async () => {
              const currentUser = selectedUser;
              if (!currentUser) {
                Alert.alert('Error', 'No user selected');
                return;
              }

              try {
                console.log('PublishingScreen.simpleVerify: Checking local story chain integrity...');
                
                // Get local story chain data
                const latestStoryHash = await StoryHeaderService.getUserStoryHead(currentUser.publicKey);
                const allHeads = await StoryHeaderService.getAllUserStoryHeads();
                const userHead = allHeads.find(head => head.publicKey === currentUser.publicKey);
                
                // Check user registry
                const registryEntry = userRegistry.users.find(u => u.publicKey === currentUser.publicKey);
                
                Alert.alert('📊 Local Chain Status', 
                  `👤 User: ${currentUser.alias}\n` +
                  `🔑 Public Key: ${currentUser.publicKey.substring(0,12)}...\n\n` +
                  `📖 Latest Story: ${latestStoryHash ? latestStoryHash.substring(0,12) + '...' : 'None'}\n` +
                  `📈 Story Count: ${userHead?.storyCount || 0}\n` +
                  `⏰ Last Updated: ${userHead?.lastUpdated || 'Never'}\n\n` +
                  `🎯 User Genesis: ${registryEntry?.transactionHash ? registryEntry.transactionHash.substring(0,12) + '...' : 'Not Found'}\n\n` +
                  `ℹ️ This shows local tracking data.\nUse the blue button for on-chain verification.`
                );
                
              } catch (error) {
                console.error('PublishingScreen.simpleVerify: Error:', error);
                Alert.alert('Error', `Failed to check local chain status: ${error.message}`);
              }
            }}
          >
            <Text style={{ color: 'white' }}>📊 Check Local Chain Status</Text>
          </TouchableOpacity>

          {/* TEMPORARY DEBUG SECTION - Clear ALL User Data */}
          <TouchableOpacity
            style={{ backgroundColor: '#FF3B30', padding: 10, margin: 5, borderRadius: 5 }}
            onPress={async () => {
              try {
                // Get current user dynamically
                const currentUser = selectedUser; // From useUser hook
                if (!currentUser) {
                  Alert.alert('Error', 'No user selected');
                  return;
                }
                
                Alert.alert(
                  'Clean Slate',
                  `This will delete all published content for ${currentUser.username}. Continue?`,
                  [
                    { text: 'Cancel' },
                    {
                      text: 'Clean Up',
                      onPress: async () => {
                        console.log('🧹 Cleaning up published content for:', currentUser.username);
                        
                        
                        // Clear user-scoped stories for current user (USE EXISTING METHOD)
                        await UserStorageService.clearUserData(currentUser.publicKey);
                        await StoryHeaderService.resetUserStoryHeads();
                        
                        // Remove ONLY this user from story headers (using existing methods)
                        const storyHeads = await StoryHeaderService.loadUserStoryHeads();
                        if (storyHeads.users[currentUser.publicKey]) {
                          // Remove this user from the users object
                          delete storyHeads.users[currentUser.publicKey];
                          // Update total count
                          storyHeads.totalUsers = Object.keys(storyHeads.users).length;
                          // Save the updated headers
                          await StoryHeaderService.saveUserStoryHeads(storyHeads);
                          console.log(`🗑️ Removed ${currentUser.username} from story headers`);
                        }
                        
                        console.log('✅ Cleanup complete for user:', currentUser.username);
                        Alert.alert('Success', `All content cleared for ${currentUser.username}!`);
                        
                        // Reload the data to reflect changes
                        loadExistingContent();
                      }
                    }
                  ]
                );
              } catch (error) {
                console.error('Cleanup error:', error);
                Alert.alert('Error', error.message);
              }
            }}
          >
            <Text style={{ color: 'white' }}>🧹 Clean ALL User Data</Text>
          </TouchableOpacity>



          {/* TEMPORARY DEBUG SECTION - Nuclear Clear Stories Button */}
          <TouchableOpacity 
            style={{ backgroundColor: '#FF0000', padding: 10, margin: 5, borderRadius: 5 }}
            onPress={async () => {
              try {
                Alert.alert(
                  '💥 Nuclear Clear Stories',
                  'This will remove ALL story data from ALL storage locations. Wallets will be preserved. Continue?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Nuclear Clear', 
                      style: 'destructive',
                      onPress: async () => {
                        console.log('💥 Starting nuclear clear...');
                        const success = await nuclearClearStories();
                        
                        Alert.alert(
                          success ? 'Nuclear Clear Complete' : 'Nuclear Clear Failed',
                          success ? 'All story data removed!' : 'Some data may remain - check console'
                        );
                        
                        // Reload your data to verify
                        loadExistingContent();
                      }
                    }
                  ]
                );
              } catch (error) {
                console.error('Nuclear clear error:', error);
                Alert.alert('Error', error.message);
              }
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>💥 Nuclear Clear Stories</Text>
          </TouchableOpacity>



          </View>

          


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
            console.log('PublishingScreen: onLongPressMenu received action:', action);
            switch (action) {
              case 'publish':
                handleMerklePublish();
                break;
              case 'merkle-verify':
                handleMerkleVerify();
                break;
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
                console.warn('PublishingScreen: Received an unknown BottomBar action:', action);
            }
          }}
          onHomePress={() => {
            console.log('PublishingScreen: Home button pressed - navigating to Home');
            navigation.navigate('Home');
          }}
          customRadialButtons={{
            top: {
              action: 'publish',
              label: 'MerklePub',
              icon: 'cloud-upload'
            },
            right: {
              action: 'clear-drafts', 
              label: 'Clear Drafts',
              icon: 'clear'
            },
            left: {
              action: 'merkle-verify',
              label: 'Merkle Verify',
              icon: 'check-circle'
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