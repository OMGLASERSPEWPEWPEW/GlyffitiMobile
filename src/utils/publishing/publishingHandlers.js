// src/utils/publishing/publishingHandlers.js
import { Alert } from 'react-native';
import { SolanaAirdropService } from '../../services/wallet/SolanaAirdropService';
import { ClearPublishedScript } from '../ClearPublishedScript';

export const createPublishingHandlers = (setters, getters) => {
  const {
    setPublishing,
    setProgress,
    setIsRequestingAirdrop,
    loadWalletInfo,
    refreshContent,
    setShowWalletUnlock
  } = setters;

  const {
    walletService,
    publishingService,
    isRequestingAirdrop
  } = getters;

  const airdropService = new SolanaAirdropService();

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

  return {
    handleRequestAirdrop,
    handlePickAndPublish,
    startPublishing,
    handleClearPublished,
    handleResumePublishing
  };
};

// Character count: 5598