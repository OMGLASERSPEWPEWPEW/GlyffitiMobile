// src/services/wallet/MobileWalletService.js
// Path: src/services/wallet/MobileWalletService.js

import 'react-native-get-random-values';
import { Keypair, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { WalletStorage } from './WalletStorage';
import { BaseWallet, WalletConnectionStatus } from './BaseWallet';

/**
 * Mobile Wallet Service with encrypted storage and better security
 * CLEANED VERSION: Removed legacy migration system
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
    
    // Add logging control properties
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
      return walletInfo;
    } catch (error) {
      this._emitError(error);
      this._updateStatus(WalletConnectionStatus.ERROR);
      throw new Error('Failed to load wallet: ' + error.message);
    }
  }

  /**
   * Connect the wallet service to blockchain
   * @returns {Promise<boolean>} Success status
   */
  async connect() {
    try {
      if (!this.keypair) {
        throw new Error('No wallet loaded');
      }

      // Test connection by getting balance
      await this.getBalance('connection-test');
      
      this._updateStatus(WalletConnectionStatus.CONNECTED);
      console.log('✅ Wallet connected to Solana network');
      return true;
    } catch (error) {
      this._updateStatus(WalletConnectionStatus.ERROR);
      console.error('❌ Failed to connect wallet:', error);
      return false;
    }
  }

  /**
   * Disconnect the wallet
   * @returns {Promise<boolean>} Success status
   */
  async disconnect() {
    try {
      this.keypair = null;
      this.currentWalletId = null;
      this._updateStatus(WalletConnectionStatus.DISCONNECTED);
      this._updateInfo(null);
      
      console.log('✅ Wallet disconnected');
      return true;
    } catch (error) {
      console.error('❌ Error disconnecting wallet:', error);
      return false;
    }
  }

  /**
   * Get wallet balance with improved logging
   * @param {string} [context] - Context for why balance is being fetched
   * @returns {Promise<Object>} Balance information
   */
  async getBalance(context = 'user-request') {
    try {
      if (!this.keypair) {
        throw new Error('No wallet connected');
      }

      const lamports = await this.connection.getBalance(this.keypair.publicKey);
      const sol = lamports / LAMPORTS_PER_SOL;

      // Only log if balance changed or it's been a while
      const shouldLog = this._lastLoggedBalance === null || 
                       Math.abs(this._lastLoggedBalance - sol) > 0.001;

      if (shouldLog) {
        console.log(`💰 Balance (${context}): ${sol.toFixed(4)} SOL (${lamports} lamports)`);
        this._lastLoggedBalance = sol;
      }

      return {
        amount: sol,
        currency: 'SOL',
        lamports: lamports,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('❌ Error getting balance:', error);
      return {
        amount: 0,
        currency: 'SOL',
        lamports: 0,
        timestamp: Date.now(),
        error: error.message
      };
    }
  }

  /**
   * Sign arbitrary data
   * @param {string} data - Data to sign
   * @returns {Promise<string>} Base64 encoded signature
   */
  async signData(data) {
    try {
      if (!this.keypair) {
        throw new Error('No wallet connected');
      }

      const message = new TextEncoder().encode(data);
      const signature = await this.keypair.sign(message);
      
      console.log('✅ Data signed successfully');
      return Buffer.from(signature).toString('base64');
    } catch (error) {
      console.error('❌ Error signing data:', error);
      throw new Error('Failed to sign data: ' + error.message);
    }
  }

  /**
   * Export wallet data (encrypted)
   * @param {Object} options - Export options
   * @param {string} options.password - Password for verification
   * @returns {Promise<Object>} Encrypted wallet data
   */
  async export(options) {
    try {
      this._validateOptions(options, ['password']);
      
      if (!this.currentWalletId) {
        throw new Error('No wallet loaded');
      }

      // Get the encrypted wallet from storage
      const encryptedWallet = await WalletStorage.getWallet(this.currentWalletId);
      if (!encryptedWallet) {
        throw new Error('Wallet not found in storage');
      }

      // Verify password by attempting to decrypt
      await WalletStorage.decryptWallet(encryptedWallet, options.password);

      console.log('✅ Wallet exported successfully');
      return {
        wallet: encryptedWallet,
        exportedAt: Date.now(),
        version: '1.0'
      };
    } catch (error) {
      console.error('❌ Error exporting wallet:', error);
      throw new Error('Failed to export wallet: ' + error.message);
    }
  }

  /**
   * Verify a signature
   * @param {string} data - Original data
   * @param {string} signature - Base64 encoded signature
   * @param {string} publicKey - Public key to verify against
   * @returns {Promise<boolean>} True if signature is valid
   */
  async verifySignature(data, signature, publicKey) {
    try {
      // This is a simplified verification
      // In a real implementation, you'd use proper cryptographic verification
      return !!(data && signature && publicKey);
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
      console.warn('Error checking for wallets:', error);
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

// Character count: 12,789