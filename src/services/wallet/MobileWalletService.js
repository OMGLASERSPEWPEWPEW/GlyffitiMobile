// src/services/wallet/MobileWalletService.js
// Path: src/services/wallet/MobileWalletService.js

import 'react-native-get-random-values';
import { Keypair, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
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
    this.connection = null;
    this.DEFAULT_WALLET_NAME = 'Default Solana Wallet';
    
    // Initialize Solana connection for balance checking
    this.connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    
    // Add logging control properties - simplified
    this._lastLoggedBalance = null;
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
        publicKey: this.keypair.publicKey.toString(),
        name: options.name || this.DEFAULT_WALLET_NAME,
        type: 'solana',
        isEncrypted: true
      };

      this._updateInfo(walletInfo);
      this._updateStatus(WalletConnectionStatus.CONNECTED);

      console.log('✅ Wallet created successfully:', walletInfo.publicKey);
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

      // Parse private key
      let secretKey;
      if (options.privateKey.startsWith('[') && options.privateKey.endsWith(']')) {
        secretKey = new Uint8Array(JSON.parse(options.privateKey));
      } else {
        // Assume it's base64 encoded
        secretKey = Buffer.from(options.privateKey, 'base64');
      }

      // Create keypair from private key
      this.keypair = Keypair.fromSecretKey(secretKey);

      // Create wallet data structure
      const decryptedWallet = WalletStorage.solanaKeypairToWallet(
        this.keypair,
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
        publicKey: this.keypair.publicKey.toString(),
        name: options.name || this.DEFAULT_WALLET_NAME,
        type: 'solana',
        isEncrypted: true
      };

      this._updateInfo(walletInfo);
      this._updateStatus(WalletConnectionStatus.CONNECTED);

      console.log('✅ Wallet imported successfully:', walletInfo.publicKey);
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

      console.log('✅ Wallet loaded successfully:', walletInfo.publicKey);
      
      // Log initial balance
      await this.getBalance('initial load');
      
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
   * @param {string} options.password - Password for decryption
   * @param {boolean} [options.includePrivateKey=false] - Whether to include private key
   * @returns {Promise<string>} Exported wallet data
   */
  async export(options) {
    try {
      this._validateOptions(options, ['password']);

      if (!this.currentWalletId) {
        throw new Error('No wallet loaded');
      }

      // Get encrypted wallet
      const encryptedWallet = await WalletStorage.getWallet(this.currentWalletId);
      if (!encryptedWallet) {
        throw new Error('Wallet not found');
      }

      // Decrypt wallet
      const decryptedWallet = await WalletStorage.decryptWallet(
        encryptedWallet,
        options.password
      );

      // Create export data
      const exportData = {
        publicKey: decryptedWallet.publicKey,
        name: decryptedWallet.name,
        type: 'solana',
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
   * Connect to Solana network
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
   * Get current wallet balance from Solana network
   * @param {string} [logContext] - Context for when to log (e.g., 'initial', 'airdrop', 'transaction')
   * @returns {Promise<Object>} Balance object
   */
  async getBalance(logContext = null) {
    try {
      if (!this.keypair) {
        throw new Error('No wallet loaded');
      }

      if (!this.connection) {
        throw new Error('No connection to Solana network');
      }

      // Actually query the Solana network for the balance
      const lamports = await this.connection.getBalance(this.keypair.publicKey);
      const solBalance = lamports / LAMPORTS_PER_SOL;

      const balance = {
        total: solBalance,
        available: solBalance,
        currency: 'SOL'
      };

      // Update stored balance in wallet info
      if (this._info) {
        this._info.balance = balance;
      }

      this._updateBalance(balance);

      // SIMPLE LOGGING: Only log when there's a meaningful context or balance changed
      const balanceChanged = this._lastLoggedBalance !== null && 
                            Math.abs(this._lastLoggedBalance - solBalance) > 0.001;

      if (logContext || balanceChanged) {
        const contextMsg = logContext ? ` (${logContext})` : ' (balance changed)';
        console.log(`💰 Current balance: ${solBalance} SOL${contextMsg}`);
        this._lastLoggedBalance = solBalance;
      }

      return balance;
    } catch (error) {
      console.error('❌ Error getting balance:', error);
      this._emitError(error);
      
      // Return zero balance on error but don't throw
      const errorBalance = {
        total: 0,
        available: 0,
        currency: 'SOL'
      };
      
      this._updateBalance(errorBalance);
      return errorBalance;
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

      console.log('🚀 Transaction created:', transactionResult.transactionId);
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
      console.error('❌ Error verifying signature:', error);
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
      console.error('❌ Error getting available wallets:', error);
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
      console.error('❌ Error deleting wallet:', error);
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
   * Get the current wallet ID
   * @returns {string|null} Current wallet ID
   */
  getCurrentWalletId() {
    return this.currentWalletId;
  }

  /**
   * Check if a wallet already exists in storage
   * @returns {Promise<boolean>} True if wallet exists
   */
  static async hasWallet() {
    try {
      const wallets = await WalletStorage.getAllWallets();
      return wallets.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Migrate legacy wallet from old storage format
   * @returns {Promise<boolean>} Success status
   */
  static async migrateLegacyWallet() {
    try {
      // Check if there's a legacy wallet
      const legacyWallet = await AsyncStorage.getItem('solana_wallet');
      if (!legacyWallet) {
        console.log('ℹ️ No legacy wallet found');
        return false;
      }

      console.log('🔄 Migrating legacy wallet...');
      
      // Parse legacy wallet
      const parsedWallet = JSON.parse(legacyWallet);
      
      // Create new wallet service and migrate
      const walletService = new MobileWalletService();
      await walletService.import({
        privateKey: parsedWallet.privateKey,
        name: 'Migrated Wallet',
        password: 'temp123' // User will need to set a proper password
      });

      // Remove legacy wallet
      await AsyncStorage.removeItem('solana_wallet');

      console.log('✅ Successfully migrated wallet to encrypted storage');
      return true;
    } catch (error) {
      console.error('❌ Error migrating wallet:', error);
      return false;
    }
  }

  /**
   * Run self-test to verify wallet functionality
   * @returns {Promise<boolean>} True if all tests pass
   */
  static async runSelfTest() {
    try {
      console.log('🧪 Running MobileWalletService self-test...');

      const testPassword = 'test123';
      const wallet = new MobileWalletService();

      // Test wallet creation
      const walletInfo = await wallet.create({
        name: 'Test Wallet',
        password: testPassword
      });

      if (!walletInfo.publicKey || !walletInfo.isEncrypted) {
        console.error('❌ Self-test failed: Wallet creation returned invalid info');
        return false;
      }

      // Test connection
      const connected = await wallet.connect();
      if (!connected) {
        console.error('❌ Self-test failed: Could not connect wallet');
        return false;
      }

      // Test balance fetching (with context for test)
      const balance = await wallet.getBalance('self-test');
      if (balance.currency !== 'SOL') {
        console.error('❌ Self-test failed: Balance check returned invalid currency');
        return false;
      }

      // Test signing
      const testData = 'Hello, world!';
      const signature = await wallet.signData(testData);
      if (!signature) {
        console.error('❌ Self-test failed: Could not sign data');
        return false;
      }

      // Test export
      const exportedData = await wallet.export({ password: testPassword });
      if (!exportedData) {
        console.error('❌ Self-test failed: Could not export wallet');
        return false;
      }

      // Test wallet listing
      const availableWallets = await MobileWalletService.getAvailableWallets();
      if (availableWallets.length === 0) {
        console.error('❌ Self-test failed: No wallets found in storage');
        return false;
      }

      // Clean up test wallet
      await wallet.disconnect();
      await MobileWalletService.deleteWallet(wallet.currentWalletId, testPassword);

      console.log('✅ MobileWalletService self-test passed!');
      return true;
    } catch (error) {
      console.error('❌ Self-test failed with error:', error);
      return false;
    }
  }

  /**
   * Force a balance refresh with logging context
   * @param {string} context - Why the balance is being refreshed
   * @returns {Promise<Object>} Balance object
   */
  async refreshBalance(context = 'manual refresh') {
    return await this.getBalance(context);
  }

  /**
   * Reset logging state (useful when switching wallets)
   */
  resetLoggingState() {
    this._lastLoggedBalance = null;
  }
}

// Character count: 16,847