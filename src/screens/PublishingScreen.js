// src/screens/PublishingScreen.js
// Path: src/screens/PublishingScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, TextInput } from 'react-native';
import { MobilePublishingService } from '../services/publishing/MobilePublishingService';
import { MobileWalletService } from '../services/wallet/MobileWalletService';
import { MigrationHelper } from '../utils/MigrationHelper';
import { SolanaAirdropService } from '../services/wallet/SolanaAirdropService';
import { ClearPublishedScript } from '../utils/ClearPublishedScript';
import { publishingStyles } from '../styles/publishingStyles';

export const PublishingScreen = () => {
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
  const [walletStatus, setWalletStatus] = useState('unknown'); // 'none', 'locked', 'unlocked', 'migrating'
  const [isRequestingAirdrop, setIsRequestingAirdrop] = useState(false);
  
  const airdropService = new SolanaAirdropService();
  
  useEffect(() => {
    initializeServices();
  }, []);
  
  // Auto-refresh balance when wallet is unlocked
  // And update the useEffect to not log on auto-refresh:
    useEffect(() => {
    if (walletStatus === 'unlocked' && walletService) {
        const interval = setInterval(async () => {
        try {
            // Don't pass logContext - this will be silent balance checking
            await loadWalletInfo(walletService);
        } catch (error) {
            console.log('Error refreshing balance:', error);
        }
        }, 5000);
        
        return () => clearInterval(interval);
    }
    }, [walletStatus, walletService]);
  
  const initializeServices = async () => {
    try {
      setIsLoading(true);
      
      // Always initialize publishing service first (works without wallet)
      const pubService = new MobilePublishingService();
      setPublishingService(pubService);
      
      // Load content that doesn't require wallet
      try {
        await loadContent(pubService);
      } catch (error) {
        console.log('Some content requires wallet unlock');
      }
      
      // Check if migration is needed
      const migrationNeeded = await MigrationHelper.needsMigration();
      if (migrationNeeded) {
        setWalletStatus('migrating');
        setIsLoading(false);
        
        // Show migration prompt but don't block the UI
        Alert.alert(
          '🔐 Security Upgrade Available',
          'We can upgrade your wallet security with password encryption. This is optional but recommended.',
          [
            {
              text: 'Upgrade Now',
              onPress: () => handleMigration()
            },
            {
              text: 'Maybe Later',
              style: 'cancel',
              onPress: () => setWalletStatus('none')
            }
          ]
        );
        return;
      }
      
      // Check if we have any wallets
      const availableWallets = await MobileWalletService.getAvailableWallets();
      if (availableWallets.length === 0) {
        setWalletStatus('none');
      } else {
        setWalletStatus('locked');
        console.log(`Found ${availableWallets.length} existing wallet(s)`);
      }
      
      setIsLoading(false);
      
    } catch (error) {
      console.error('Error initializing services:', error);
      setWalletStatus('none');
      setIsLoading(false);
    }
  };
  
  const handleMigration = async () => {
    Alert.prompt(
      '🔒 Create Wallet Password',
      'Create a secure password to encrypt your wallet.',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setWalletStatus('none') },
        {
          text: 'Migrate',
          onPress: async (password) => {
            if (!password || password.length < 6) {
              Alert.alert('Error', 'Password must be at least 6 characters long');
              return;
            }
            
            try {
              setIsLoading(true);
              const result = await MigrationHelper.performMigration(password);
              
              if (result.success) {
                Alert.alert('✅ Migration Complete', 'Your wallet has been successfully upgraded!');
                
                // Auto-unlock the migrated wallet
                await unlockWallet(password, result.walletId);
                
              } else {
                Alert.alert('❌ Migration Failed', result.error);
                setWalletStatus('none');
              }
            } catch (error) {
              console.error('Migration error:', error);
              Alert.alert('❌ Migration Failed', error.message);
              setWalletStatus('none');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ],
      'secure-text'
    );
  };
  
  const unlockWallet = async (walletPassword, specificWalletId = null) => {
    try {
      setIsLoading(true);
      
      const availableWallets = await MobileWalletService.getAvailableWallets();
      if (availableWallets.length === 0) {
        throw new Error('No wallets found');
      }
      
      const walletId = specificWalletId || availableWallets[0].id;
      const wallet = new MobileWalletService();
      await wallet.loadWallet(walletId, walletPassword);
      await wallet.connect();
      
      setWalletService(wallet);
      setWalletAddress(wallet.getWalletPublicKey());
      setWalletStatus('unlocked');
      
      // Update publishing service with wallet
      if (publishingService) {
        publishingService.setWallet(wallet);
      }
      
      await loadWalletInfo(wallet, 'wallet-unlock');
      
      setShowWalletUnlock(false);
      setPassword('');
      
      console.log('✅ Wallet unlocked successfully');
      
    } catch (error) {
      console.error('Error unlocking wallet:', error);
      Alert.alert('Error', 'Failed to unlock wallet. Please check your password.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const createNewWallet = async (walletPassword) => {
    try {
      setIsLoading(true);
      
      const wallet = new MobileWalletService();
      const walletInfo = await wallet.create({
        name: 'My Glyffiti Wallet',
        password: walletPassword
      });
      
      await wallet.connect();
      
      setWalletService(wallet);
      setWalletAddress(wallet.getWalletPublicKey());
      setWalletStatus('unlocked');
      
      if (publishingService) {
        publishingService.setWallet(wallet);
      }
      
      await loadWalletInfo(wallet, 'wallet-created');
      
      setShowWalletUnlock(false);
      setPassword('');
      
      Alert.alert('✅ Wallet Created', 'Your secure wallet has been created successfully!');
      
    } catch (error) {
      console.error('Error creating wallet:', error);
      Alert.alert('Error', 'Failed to create wallet: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleWalletAction = async () => {
    if (!password || password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }
    
    if (walletStatus === 'none') {
      await createNewWallet(password);
    } else {
      await unlockWallet(password);
    }
  };
  
const loadWalletInfo = async (wallet, logContext = null) => {
  try {
    // Pass logContext to getBalance to control when it logs
    const balance = await wallet.getBalance(logContext);
    setWalletBalance(balance.available);
  } catch (error) {
    console.error('Error loading wallet info:', error);
  }
};
  
  const loadContent = async (pubService) => {
    try {
      const published = await pubService.getPublishedContent();
      const inProgress = await pubService.getInProgressContent();
      const draftList = await pubService.getDrafts();
      
      // Only get stats if we have a method for it
      let stats = null;
      try {
        stats = await pubService.getPublishingStats();
      } catch (error) {
        console.log('Publishing stats not available without enhanced features');
      }
      
      setPublishedContent(published);
      setInProgressContent(inProgress);
      setDrafts(draftList);
      setPublishingStats(stats);
    } catch (error) {
      console.error('Error loading content:', error);
    }
  };
  
  const handleRequestAirdrop = async () => {
    if (!walletService) {
      Alert.alert('Wallet Required', 'Please unlock your wallet first to request SOL.');
      setShowWalletUnlock(true);
      return;
    }
    
    if (isRequestingAirdrop) {
      return; // Prevent multiple simultaneous requests
    }
    
    try {
      setIsRequestingAirdrop(true);
      const keypair = walletService.getWalletKeypair();
      
      Alert.alert(
        'Request Devnet SOL',
        'This will request 1 SOL from Solana devnet faucet. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Request', onPress: async () => {
            try {
              await airdropService.requestAirdrop(keypair.publicKey, 1);
              
              // Wait a bit for the airdrop to be confirmed on chain
              Alert.alert('⏳ Processing', 'Waiting for airdrop confirmation...');
              
              // Try to refresh balance after delays
              setTimeout(async () => {
                await loadWalletInfo(walletService, 'post-airdrop');
              }, 2000);
              
              setTimeout(async () => {
                await loadWalletInfo(walletService, 'post-airdrop-final');
                Alert.alert('Success!', 'Airdrop completed! Balance should update shortly.');
              }, 5000);
              
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
    
    try {
      setPublishing(true);
      setProgress(null);
      
      // Pick file
      const content = await publishingService.pickAndLoadFile();
      if (!content) {
        setPublishing(false);
        return;
      }
      
      // Show publishing estimate if available
      try {
        const estimate = publishingService.estimatePublishing(content);
        
        Alert.alert(
          '📊 Publishing Estimate',
          `File: ${content.title}\n` +
          `Size: ${content.content.length} characters\n` +
          `Glyphs: ${estimate.glyphCount}\n` +
          `Estimated Cost: ${estimate.estimatedCost.toFixed(6)} ${estimate.currency}\n` +
          `Estimated Time: ${estimate.estimatedTimeMinutes.toFixed(1)} minutes\n\n` +
          'Continue with publishing?',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setPublishing(false) },
            { text: 'Publish', onPress: () => startPublishing(content) }
          ]
        );
      } catch (error) {
        // If estimation fails, just proceed with publishing
        console.log('Estimation not available, proceeding with publishing');
        startPublishing(content);
      }
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to pick file: ' + error.message);
      setPublishing(false);
    }
  };
  
  const startPublishing = async (content) => {
    try {
      const result = await publishingService.publishContent(
        content,
        (status) => {
          setProgress(status);
          console.log('Publishing progress:', status);
        }
      );
      
      console.log('Publishing result:', result);
      
      if (result.status === 'completed') {
        Alert.alert(
          '✅ Publishing Complete!',
          `Successfully published "${content.title}" with ${result.successfulGlyphs} glyphs!`,
          [{ text: 'OK', onPress: () => refreshContent() }]
        );
      } else if (result.status === 'partial') {
        Alert.alert(
          '⚠️ Partial Success',
          `Published ${result.successfulGlyphs}/${result.totalGlyphs} glyphs. ` +
          `${result.failedGlyphs} failed. You can retry the failed glyphs later.`,
          [{ text: 'OK', onPress: () => refreshContent() }]
        );
      } else {
        Alert.alert(
          '❌ Publishing Failed',
          'Failed to publish content. Please try again.',
          [{ text: 'OK' }]
        );
      }
      
    } catch (error) {
      console.error('Publishing error:', error);
      Alert.alert('Error', 'Publishing failed: ' + error.message);
    } finally {
      setPublishing(false);
      setProgress(null);
    }
  };
  
  const refreshContent = async () => {
    if (publishingService) {
      await loadContent(publishingService);
    }
  };
  
  const handleClearPublished = async () => {
    Alert.alert(
      'Clear Test Data',
      'This will clear all published content, drafts, and in-progress items. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: async () => {
          try {
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
  
  const handleResumePublishing = async (contentId) => {
    if (!walletService) {
      Alert.alert('Wallet Required', 'Please unlock your wallet first to resume publishing.');
      setShowWalletUnlock(true);
      return;
    }
    
    if (!publishingService) {
      Alert.alert('Error', 'Publishing service not ready');
      return;
    }
    
    try {
      setPublishing(true);
      
      const result = await publishingService.resumePublishing(
        contentId,
        (status) => {
          setProgress(status);
          console.log('Resume progress:', status);
        }
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
  
  const renderWalletSection = () => {
    if (walletStatus === 'unlocked') {
      return (
        <View style={publishingStyles.walletContainer}>
          <Text style={publishingStyles.walletTitle}>💳 Secure Encrypted Wallet</Text>
          <Text style={publishingStyles.walletAddress}>
            {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
          </Text>
          <Text style={publishingStyles.walletBalance}>
            Balance: {walletBalance.toFixed(4)} SOL
          </Text>
          
          <TouchableOpacity 
            style={[
              publishingStyles.airdropButton,
              isRequestingAirdrop && publishingStyles.airdropButtonDisabled
            ]}
            onPress={handleRequestAirdrop}
            disabled={isRequestingAirdrop}
          >
            <Text style={publishingStyles.airdropButtonText}>
              {isRequestingAirdrop ? '⏳ Requesting...' : '🎁 Request 1 SOL'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (walletStatus === 'migrating') {
      return (
        <View style={publishingStyles.walletContainer}>
          <Text style={publishingStyles.walletTitle}>🔄 Wallet Migration Available</Text>
          <Text style={publishingStyles.walletSubtitle}>
            A security upgrade is available for your wallet
          </Text>
          <TouchableOpacity 
            style={publishingStyles.upgradeButton}
            onPress={handleMigration}
          >
            <Text style={publishingStyles.upgradeButtonText}>🔐 Upgrade Security</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View style={publishingStyles.walletContainer}>
        <Text style={publishingStyles.walletTitle}>
          {walletStatus === 'none' ? '🔒 No Wallet Found' : '🔒 Wallet Locked'}
        </Text>
        <Text style={publishingStyles.walletSubtitle}>
          {walletStatus === 'none' 
            ? 'Create a wallet to publish content' 
            : 'Unlock your wallet to publish content'}
        </Text>
        
        {showWalletUnlock ? (
          <View style={publishingStyles.passwordContainer}>
            <TextInput
              style={publishingStyles.passwordInput}
              placeholder="Enter password..."
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              style={publishingStyles.unlockButton}
              onPress={handleWalletAction}
              disabled={isLoading}
            >
              <Text style={publishingStyles.unlockButtonText}>
                {isLoading ? '⏳ Processing...' : 
                 walletStatus === 'none' ? '🔓 Create Wallet' : '🔓 Unlock'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={publishingStyles.unlockButton}
            onPress={() => setShowWalletUnlock(true)}
          >
            <Text style={publishingStyles.unlockButtonText}>
              {walletStatus === 'none' ? '➕ Create New Wallet' : '🔓 Enter Password'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  
  const renderProgressBar = () => {
    if (!publishing || !progress) return null;
    
    return (
      <View style={publishingStyles.progressContainer}>
        <Text style={publishingStyles.progressTitle}>
          {progress.stage === 'preparing' && '📋 Preparing content...'}
          {progress.stage === 'processing' && '🔄 Processing glyphs...'}
          {progress.stage === 'publishing' && `📤 Publishing glyph ${progress.currentGlyph}/${progress.totalGlyphs}...`}
          {progress.stage === 'completed' && '✅ Publishing complete!'}
          {progress.stage === 'failed' && '❌ Publishing failed'}
        </Text>
        
        <View style={publishingStyles.progressBar}>
          <View 
            style={[
              publishingStyles.progressFill,
              { width: `${progress.progress}%` }
            ]}
          />
        </View>
        
        <Text style={publishingStyles.progressText}>
          {progress.progress}% Complete
        </Text>
        
        {progress.compressionStats && (
          <Text style={publishingStyles.compressionText}>
            💾 Compressed {progress.compressionStats.percentSaved}% 
            ({progress.compressionStats.spaceSaved} bytes saved)
          </Text>
        )}
      </View>
    );
  };
  
  if (isLoading) {
    return (
      <View style={publishingStyles.loadingContainer}>
        <Text style={publishingStyles.loadingText}>⏳ Loading...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={publishingStyles.container}>
      <Text style={publishingStyles.header}>📜 Glyffiti Publishing</Text>
      
      {/* Wallet Section */}
      {renderWalletSection()}
      
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
      {renderProgressBar()}
      
      {/* Content sections remain the same... */}
      {inProgressContent.length > 0 && (
        <View style={publishingStyles.section}>
          <Text style={publishingStyles.sectionTitle}>⚠️ In Progress ({inProgressContent.length})</Text>
          {inProgressContent.map((item, index) => (
            <View key={index} style={publishingStyles.contentItem}>
              <Text style={publishingStyles.contentTitle}>{item.title}</Text>
              <Text style={publishingStyles.contentMeta}>
                {item.successfulGlyphs || 0}/{item.totalGlyphs} glyphs published
              </Text>
              <TouchableOpacity 
                style={[
                  publishingStyles.resumeButton,
                  walletStatus !== 'unlocked' && publishingStyles.resumeButtonDisabled
                ]}
                onPress={() => handleResumePublishing(item.id)}
                disabled={publishing || walletStatus !== 'unlocked'}
              >
                <Text style={publishingStyles.resumeButtonText}>
                  {walletStatus !== 'unlocked' ? '🔒 Unlock to Resume' : '▶️ Resume Publishing'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      
      {drafts.length > 0 && (
        <View style={publishingStyles.section}>
          <Text style={publishingStyles.sectionTitle}>📝 Drafts ({drafts.length})</Text>
          {drafts.map((draft, index) => (
            <View key={index} style={publishingStyles.contentItem}>
              <Text style={publishingStyles.contentTitle}>{draft.title}</Text>
              <Text style={publishingStyles.contentMeta}>
                {draft.content.length} characters
              </Text>
            </View>
          ))}
        </View>
      )}
      
      {publishedContent.length > 0 && (
        <View style={publishingStyles.section}>
          <Text style={publishingStyles.sectionTitle}>✅ Published ({publishedContent.length})</Text>
          {publishedContent.map((item, index) => (
            <View key={index} style={publishingStyles.contentItem}>
              <Text style={publishingStyles.contentTitle}>{item.title}</Text>
              <Text style={publishingStyles.contentMeta}>
                {item.glyphs?.length || 0} glyphs • {item.transactionIds?.length || 0} transactions
              </Text>
              {item.scrollId && (
                <Text style={publishingStyles.scrollId}>
                  Scroll: {item.scrollId.slice(0, 8)}...
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
      
      {publishingStats && (
        <View style={publishingStyles.statsContainer}>
          <Text style={publishingStyles.statsTitle}>📊 Publishing Statistics</Text>
          <Text style={publishingStyles.statsText}>
            Total Published: {publishingStats.totalPublished}
          </Text>
          <Text style={publishingStyles.statsText}>
            Total Glyphs: {publishingStats.totalGlyphs}
          </Text>
          <Text style={publishingStyles.statsText}>
            Success Rate: {publishingStats.successRate}%
          </Text>
          <Text style={publishingStyles.statsText}>
            Total Cost: {publishingStats.totalCost.toFixed(6)} SOL
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

// Character count: 22851