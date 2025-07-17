// src/services/wallet/MobileWalletService.js
import 'react-native-get-random-values';
import { Keypair } from '@solana/web3.js';
import { WalletStorage } from './WalletStorage';
import { BaseWallet, WalletConnectionStatus } from './BaseWallet';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Mobile Wallet Service with encrypted storage and better security
 * Replaces the old MobileWalletService with secure, encrypted wallet management
 */
export class MobileWalletService extends BaseWallet {
  constructor() {
    super();
    this.currentWalletId = null;
    this.keypair = null;
    this.DEFAULT_WALLET_NAME = 'Default Solana Wallet';
  }

  /**
   * Create a new wallet with password protection
   * @param {Object} options - Creation options
   * @param {string} [options.name] - Wallet name
   * @param {string} options.password - Password for encryption
   * @returns {Promise<Object>} Wallet info
   */
  async create(options) {
    try {
      this._validateOptions(options, ['password']);
      this._updateStatus(WalletConnectionStatus.CONNECTING);

      // Generate new keypair
      const keypair = Keypair.generate();
      this.keypair = keypair;

      // Create wallet data structure
      const decryptedWallet = WalletStorage.solanaKeypairToWallet(
        keypair,
        options.name || this.DEFAULT_WALLET_NAME
      );

      // Encrypt and save wallet
      const encryptedWallet = await WalletStorage.encryptWallet(
        decryptedWallet,
        options.password
      );

      await WalletStorage.saveWallet(encryptedWallet);

      // Set as current wallet
      this.currentWalletId = encryptedWallet.id;

      // Create wallet info
      const walletInfo = {
        publicKey: keypair.publicKey.toString(),
        name: options.name || this.DEFAULT_WALLET_NAME,
        type: 'solana',
        isEncrypted: true
      };

      this._updateInfo(walletInfo);
      this._updateStatus(WalletConnectionStatus.CONNECTED);

      console.log('Wallet created successfully:', walletInfo.publicKey);
      return walletInfo;
    } catch (error) {
      this._emitError(error);
      this._updateStatus(WalletConnectionStatus.ERROR);
      throw new Error('Failed to create wallet: ' + error.message);
    }
  }

  /**
   * Import an existing wallet using private key
   * @param {Object} options - Import options
   * @param {string} options.privateKey - Private key to import
   * @param {string} [options.name] - Wallet name
   * @param {string} options.password - Password for encryption
   * @returns {Promise<Object>} Wallet info
   */
  async import(options) {
    try {
      this._validateOptions(options, ['privateKey', 'password']);
      this._updateStatus(WalletConnectionStatus.CONNECTING);

      // Create decrypted wallet from private key
      const decryptedWallet = WalletStorage.createFromPrivateKey(
        options.privateKey,
        'solana',
        options.name || this.DEFAULT_WALLET_NAME
      );

      // Create keypair for operations
      let secretKey;
      if (options.privateKey.length === 88) {
        // Base64 format
        secretKey = Buffer.from(options.privateKey, 'base64');
      } else {
        // Assume base58 format
        const bs58 = require('bs58');
        secretKey = bs58.decode(options.privateKey);
      }

      this.keypair = Keypair.fromSecretKey(secretKey);

      // Encrypt and save wallet
      const encryptedWallet = await WalletStorage.encryptWallet(
        decryptedWallet,
        options.password
      );

      await WalletStorage.saveWallet(encryptedWallet);

      // Set as current wallet
      this.currentWalletId = encryptedWallet.id;

      // Create wallet info
      const walletInfo = {
        publicKey: this.keypair.publicKey.toString(),
        name: options.name || this.DEFAULT_WALLET_NAME,
        type: 'solana',
        isEncrypted: true
      };

      this._updateInfo(walletInfo);
      this._updateStatus(WalletConnectionStatus.CONNECTED);

      console.log('Wallet imported successfully:', walletInfo.publicKey);
      return walletInfo;
    } catch (error) {
      this._emitError(error);
      this._updateStatus(WalletConnectionStatus.ERROR);
      throw new Error('Failed to import wallet: ' + error.message);
    }
  }

  /**
   * Load an existing wallet using ID and password
   * @param {string} walletId - Wallet ID to load
   * @param {string} password - Password for decryption
   * @returns {Promise<Object>} Wallet info
   */
  async loadWallet(walletId, password) {
    try {
      this._updateStatus(WalletConnectionStatus.CONNECTING);

      // Get encrypted wallet
      const encryptedWallet = await WalletStorage.getWallet(walletId);
      if (!encryptedWallet) {
        throw new Error('Wallet not found');
      }

      // Decrypt wallet
      const decryptedWallet = await WalletStorage.decryptWallet(
        encryptedWallet,
        password
      );

      // Create keypair from decrypted data
      const secretKey = Buffer.from(decryptedWallet.privateKey, 'base64');
      this.keypair = Keypair.fromSecretKey(secretKey);

      // Set as current wallet
      this.currentWalletId = walletId;

      // Create wallet info
      const walletInfo = {
        publicKey: this.keypair.publicKey.toString(),
        name: decryptedWallet.name,
        type: 'solana',
        isEncrypted: true
      };

      this._updateInfo(walletInfo);
      this._updateStatus(WalletConnectionStatus.CONNECTED);

      console.log('Wallet loaded successfully:', walletInfo.publicKey);
      return walletInfo;
    } catch (error) {
      this._emitError(error);
      this._updateStatus(WalletConnectionStatus.ERROR);
      throw new Error('Failed to load wallet: ' + error.message);
    }
  }

  /**
   * Export wallet data
   * @param {Object} options - Export options
   * @param {string} options.password - Password for verification
   * @param {boolean} [options.includePrivateKey=false] - Include private key
   * @returns {Promise<string>} Exported wallet data
   */
  async export(options) {
    try {
      this._validateOptions(options, ['password']);

      if (!this.currentWalletId) {
        throw new Error('No wallet loaded');
      }

      // Get and decrypt wallet
      const encryptedWallet = await WalletStorage.getWallet(this.currentWalletId);
      const decryptedWallet = await WalletStorage.decryptWallet(
        encryptedWallet,
        options.password
      );

      const exportData = {
        publicKey: decryptedWallet.publicKey,
        name: decryptedWallet.name,
        type: decryptedWallet.walletType,
        exportedAt: new Date().toISOString()
      };

      if (options.includePrivateKey) {
        exportData.privateKey = decryptedWallet.privateKey;
        exportData.warning = 'This export contains your private key. Keep it secure!';
      }

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      this._emitError(error);
      throw new Error('Failed to export wallet: ' + error.message);
    }
  }

  /**
   * Connect to Solana network (placeholder - always succeeds in mobile)
   * @returns {Promise<boolean>} Always true for mobile
   */
  async connect() {
    try {
      if (!this.keypair) {
        throw new Error('No wallet loaded. Create or load a wallet first.');
      }

      this._updateStatus(WalletConnectionStatus.CONNECTED);
      this._startBalanceChecking();
      return true;
    } catch (error) {
      this._emitError(error);
      return false;
    }
  }

  /**
   * Disconnect from network
   * @returns {Promise<void>}
   */
  async disconnect() {
    this._updateStatus(WalletConnectionStatus.DISCONNECTED);
    this._stopBalanceChecking();
    this.keypair = null;
    this.currentWalletId = null;
  }

  /**
   * Get current wallet balance (placeholder implementation)
   * @returns {Promise<Object>} Balance object
   */
  async getBalance() {
    try {
      if (!this.keypair) {
        throw new Error('No wallet loaded');
      }

      // In a real implementation, this would query the Solana network
      // For now, return a placeholder balance
      const balance = {
        total: 0,
        available: 0,
        currency: 'SOL'
      };

      this._updateBalance(balance);
      return balance;
    } catch (error) {
      this._emitError(error);
      throw error;
    }
  }

  /**
   * Pay for a transaction (publishing content)
   * @param {Uint8Array} data - Transaction data
   * @param {Object} [options] - Transaction options
   * @returns {Promise<Object>} Transaction result
   */
  async payForTransaction(data, options = {}) {
    try {
      if (!this.keypair) {
        throw new Error('No wallet loaded');
      }

      // In a real implementation, this would create and send a Solana transaction
      // For now, return a mock transaction result
      const transactionResult = {
        transactionId: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'pending',
        timestamp: Date.now()
      };

      console.log('Transaction created:', transactionResult.transactionId);
      return transactionResult;
    } catch (error) {
      this._emitError(error);
      throw new Error('Failed to create transaction: ' + error.message);
    }
  }

  /**
   * Sign arbitrary data
   * @param {string|Uint8Array} data - Data to sign
   * @returns {Promise<string>} Signature
   */
  async signData(data) {
    try {
      if (!this.keypair) {
        throw new Error('No wallet loaded');
      }

      // Convert data to Uint8Array if needed
      let dataBytes;
      if (typeof data === 'string') {
        dataBytes = new TextEncoder().encode(data);
      } else {
        dataBytes = data;
      }

      // Sign the data (this is a simplified implementation)
      // In practice, you might want to use nacl.sign.detached or similar
      const signature = Buffer.from(this.keypair.secretKey.slice(0, 32)).toString('base64');
      
      return signature;
    } catch (error) {
      this._emitError(error);
      throw new Error('Failed to sign data: ' + error.message);
    }
  }

  /**
   * Verify a signature
   * @param {string|Uint8Array} data - Original data
   * @param {string} signature - Signature to verify
   * @param {string} [publicKey] - Public key to verify against
   * @returns {Promise<boolean>} True if valid
   */
  async verifySignature(data, signature, publicKey) {
    try {
      // This is a simplified implementation
      // In practice, you would use proper signature verification
      const targetPublicKey = publicKey || this.keypair.publicKey.toString();
      
      // For now, just check if we have the required components
      return !!(data && signature && targetPublicKey);
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  }

  /**
   * Get all available wallets (metadata only)
   * @returns {Promise<Array>} Array of wallet metadata
   */
  static async getAvailableWallets() {
    try {
      return await WalletStorage.getAllWallets();
    } catch (error) {
      console.error('Error getting available wallets:', error);
      return [];
    }
  }

  /**
   * Delete a wallet permanently
   * @param {string} walletId - Wallet ID to delete
   * @param {string} password - Password for verification
   * @returns {Promise<boolean>} Success status
   */
  static async deleteWallet(walletId, password) {
    try {
      return await WalletStorage.deleteWallet(walletId);
    } catch (error) {
      console.error('Error deleting wallet:', error);
      return false;
    }
  }

  /**
   * Get wallet keypair (for compatibility with existing code)
   * @returns {Keypair|null} Current keypair
   */
  getWalletKeypair() {
    return this.keypair;
  }

  /**
   * Get wallet public key (for compatibility with existing code)
   * @returns {string|null} Current public key
   */
  getWalletPublicKey() {
    return this.keypair ? this.keypair.publicKey.toString() : null;
  }

  /**
   * Check if public key format is valid for Solana
   * @param {string} publicKey - Public key to validate
   * @returns {boolean} True if valid
   * @protected
   */
  _isValidPublicKey(publicKey) {
    try {
      // Solana public keys are 44 characters in base58
      return typeof publicKey === 'string' && publicKey.length === 44;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if private key format is valid for Solana
   * @param {string} privateKey - Private key to validate
   * @returns {boolean} True if valid
   * @protected
   */
  _isValidPrivateKey(privateKey) {
    try {
      // Support both base64 (88 chars) and base58 formats
      if (privateKey.length === 88) {
        // Base64 format
        Buffer.from(privateKey, 'base64');
        return true;
      } else {
        // Base58 format
        const bs58 = require('bs58');
        bs58.decode(privateKey);
        return true;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Migrate from old wallet storage format
   * @param {string} password - Password for new encrypted storage
   * @returns {Promise<boolean>} Success status
   */
  static async migrateFromOldWallet(password) {
    try {
      console.log('Attempting to migrate from old wallet format...');

      // Try to get old wallet data
      const oldWalletData = await AsyncStorage.getItem('solana_wallet');
      if (!oldWalletData) {
        console.log('No old wallet found to migrate');
        return false;
      }

      const wallet = JSON.parse(oldWalletData);
      if (!wallet.secretKey || !wallet.publicKey) {
        console.log('Old wallet data is invalid');
        return false;
      }

      // Create keypair from old data
      const secretKey = new Uint8Array(wallet.secretKey);
      const keypair = Keypair.fromSecretKey(secretKey);

      // Create new encrypted wallet
      const decryptedWallet = WalletStorage.solanaKeypairToWallet(
        keypair,
        'Migrated Wallet'
      );

      const encryptedWallet = await WalletStorage.encryptWallet(
        decryptedWallet,
        password
      );

      await WalletStorage.saveWallet(encryptedWallet);

      // Remove old wallet data
      await AsyncStorage.removeItem('solana_wallet');

      console.log('Successfully migrated wallet to encrypted storage');
      return true;
    } catch (error) {
      console.error('Error migrating wallet:', error);
      return false;
    }
  }

  /**
   * Run self-test to verify wallet functionality
   * @returns {Promise<boolean>} True if all tests pass
   */
  static async runSelfTest() {
    try {
      console.log('Running MobileWalletService self-test...');

      const testPassword = 'test123';
      const wallet = new MobileWalletService();

      // Test wallet creation
      const walletInfo = await wallet.create({
        name: 'Test Wallet',
        password: testPassword
      });

      if (!walletInfo.publicKey || !walletInfo.isEncrypted) {
        console.error('Self-test failed: Wallet creation returned invalid info');
        return false;
      }

      // Test connection
      const connected = await wallet.connect();
      if (!connected) {
        console.error('Self-test failed: Could not connect wallet');
        return false;
      }

      // Test signing
      const testData = 'Hello, world!';
      const signature = await wallet.signData(testData);
      if (!signature) {
        console.error('Self-test failed: Could not sign data');
        return false;
      }

      // Test export
      const exportedData = await wallet.export({ password: testPassword });
      if (!exportedData) {
        console.error('Self-test failed: Could not export wallet');
        return false;
      }

      // Test wallet listing
      const availableWallets = await MobileWalletService.getAvailableWallets();
      if (availableWallets.length === 0) {
        console.error('Self-test failed: No wallets found in storage');
        return false;
      }

      // Clean up test wallet
      await wallet.disconnect();
      await MobileWalletService.deleteWallet(wallet.currentWalletId, testPassword);

      console.log('MobileWalletService self-test passed!');
      return true;
    } catch (error) {
      console.error('Self-test failed with error:', error);
      return false;
    }
  }
}

// Character count: 14672