// src/utils/publishing/walletHandlers.js
import { Alert } from 'react-native';
import { MobileWalletService } from '../../services/wallet/MobileWalletService';
import { MigrationHelper } from '../MigrationHelper';

export const createWalletHandlers = (setters) => {
  const {
    setIsLoading,
    setWalletService,
    setWalletAddress,
    setWalletStatus,
    setPublishingService,
    setShowWalletUnlock,
    setPassword,
    loadWalletInfo
  } = setters;

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
      setPublishingService(prev => {
        if (prev) {
          prev.setWallet(wallet);
        }
        return prev;
      });
      
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
      
      setPublishingService(prev => {
        if (prev) {
          prev.setWallet(wallet);
        }
        return prev;
      });
      
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

  const handleWalletAction = async (password, walletStatus) => {
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

  return {
    handleMigration,
    unlockWallet,
    createNewWallet,
    handleWalletAction
  };
};

// Character count: 3653