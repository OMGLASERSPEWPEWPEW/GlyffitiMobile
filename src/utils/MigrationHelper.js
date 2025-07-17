// src/utils/MigrationHelper.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MobileWalletService } from '../services/wallet/MobileWalletService';
import { Alert } from 'react-native';

/**
 * Helper utility for migrating from old insecure wallet storage
 * to new encrypted wallet storage
 */
export class MigrationHelper {
  
  /**
   * Check if migration is needed
   * @returns {Promise<boolean>} True if old wallet exists and needs migration
   */
  static async needsMigration() {
    try {
      // Check for old wallet format
      const oldWallet = await AsyncStorage.getItem('solana_wallet');
      if (!oldWallet) {
        return false;
      }
      
      // Check if new wallets already exist
      const newWallets = await MobileWalletService.getAvailableWallets();
      if (newWallets.length > 0) {
        return false; // Already migrated
      }
      
      return true;
    } catch (error) {
      console.error('Error checking migration status:', error);
      return false;
    }
  }
  
  /**
   * Show migration prompt to user
   * @param {Function} onMigrationNeeded - Callback when migration is needed
   * @returns {Promise<void>}
   */
  static async showMigrationPrompt(onMigrationNeeded) {
    const migrationNeeded = await this.needsMigration();
    
    if (migrationNeeded) {
      Alert.alert(
        '🔐 Security Upgrade Required',
        'We need to upgrade your wallet security. This will encrypt your wallet with a password for better protection.\n\nYour wallet will be safe during this process.',
        [
          {
            text: 'Upgrade Now',
            onPress: () => onMigrationNeeded(),
            style: 'default'
          },
          {
            text: 'Later',
            style: 'cancel'
          }
        ]
      );
    }
  }
  
  /**
   * Perform the migration with user-provided password
   * @param {string} password - Password for encrypting the wallet
   * @returns {Promise<{success: boolean, walletId?: string, error?: string}>}
   */
  static async performMigration(password) {
    try {
      console.log('Starting wallet migration...');
      
      // Validate password
      if (!password || password.length < 6) {
        return {
          success: false,
          error: 'Password must be at least 6 characters long'
        };
      }
      
      // Get old wallet data
      const oldWalletData = await AsyncStorage.getItem('solana_wallet');
      if (!oldWalletData) {
        return {
          success: false,
          error: 'No old wallet found to migrate'
        };
      }
      
      let oldWallet;
      try {
        oldWallet = JSON.parse(oldWalletData);
      } catch (error) {
        return {
          success: false,
          error: 'Old wallet data is corrupted'
        };
      }
      
      if (!oldWallet.secretKey || !oldWallet.publicKey) {
        return {
          success: false,
          error: 'Old wallet data is incomplete'
        };
      }
      
      // Create new encrypted wallet service
      const walletService = new MobileWalletService();
      
      // Import old wallet with new encryption
      const secretKeyArray = oldWallet.secretKey;
      const secretKeyBuffer = Buffer.from(secretKeyArray);
      const privateKeyBase64 = secretKeyBuffer.toString('base64');
      
      const walletInfo = await walletService.import({
        privateKey: privateKeyBase64,
        name: 'Migrated Wallet',
        password: password
      });
      
      // Verify migration worked
      if (walletInfo.publicKey !== oldWallet.publicKey) {
        throw new Error('Migration verification failed - public keys do not match');
      }
      
      // Remove old wallet data
      await AsyncStorage.removeItem('solana_wallet');
      
      console.log('Wallet migration completed successfully');
      
      return {
        success: true,
        walletId: walletService.currentWalletId
      };
      
    } catch (error) {
      console.error('Migration failed:', error);
      return {
        success: false,
        error: 'Migration failed: ' + error.message
      };
    }
  }
  
  /**
   * Complete migration flow with UI prompts
   * @param {Function} onSuccess - Callback when migration succeeds
   * @param {Function} onError - Callback when migration fails
   * @returns {Promise<void>}
   */
  static async completeMigrationFlow(onSuccess, onError) {
    try {
      // Check if migration is needed
      const migrationNeeded = await this.needsMigration();
      if (!migrationNeeded) {
        console.log('No migration needed');
        return;
      }
      
      // Show password input prompt
      Alert.prompt(
        '🔒 Create Wallet Password',
        'Create a secure password to encrypt your wallet. You\'ll need this password to access your wallet.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => onError && onError('Migration cancelled by user')
          },
          {
            text: 'Migrate',
            onPress: async (password) => {
              if (!password) {
                onError && onError('Password is required');
                return;
              }
              
              const result = await this.performMigration(password);
              
              if (result.success) {
                Alert.alert(
                  '✅ Migration Complete',
                  'Your wallet has been successfully upgraded with encryption!',
                  [
                    {
                      text: 'OK',
                      onPress: () => onSuccess && onSuccess(result.walletId)
                    }
                  ]
                );
              } else {
                Alert.alert(
                  '❌ Migration Failed',
                  result.error || 'Unknown error occurred',
                  [
                    {
                      text: 'OK',
                      onPress: () => onError && onError(result.error)
                    }
                  ]
                );
              }
            }
          }
        ],
        'secure-text'
      );
      
    } catch (error) {
      console.error('Migration flow error:', error);
      onError && onError(error.message);
    }
  }
  
  /**
   * Clean up any leftover old data
   * @returns {Promise<boolean>} Success status
   */
  static async cleanupOldData() {
    try {
      await AsyncStorage.removeItem('solana_wallet');
      console.log('Cleaned up old wallet data');
      return true;
    } catch (error) {
      console.error('Error cleaning up old data:', error);
      return false;
    }
  }
  
  /**
   * Check if app needs wallet setup (no wallets exist at all)
   * @returns {Promise<boolean>} True if setup is needed
   */
  static async needsWalletSetup() {
    try {
      // Check for new wallets
      const newWallets = await MobileWalletService.getAvailableWallets();
      if (newWallets.length > 0) {
        return false;
      }
      
      // Check for old wallets
      const oldWallet = await AsyncStorage.getItem('solana_wallet');
      if (oldWallet) {
        return false; // Has old wallet, migration needed instead
      }
      
      return true; // No wallets at all
    } catch (error) {
      console.error('Error checking wallet setup status:', error);
      return true; // Assume setup needed on error
    }
  }
}

// Character count: 6129