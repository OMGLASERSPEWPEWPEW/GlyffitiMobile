// src/services/wallet/BaseWallet.js
import { EventEmitter } from 'events';

/**
 * Wallet connection status enumeration
 */
export const WalletConnectionStatus = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error'
};

/**
 * @typedef {Object} WalletBalance
 * @property {number} total - Total balance
 * @property {number} available - Available balance for transactions
 * @property {string} currency - Currency symbol (e.g., 'SOL', 'BTC')
 */

/**
 * @typedef {Object} TransactionResult
 * @property {string} transactionId - Blockchain transaction ID
 * @property {'pending'|'confirmed'|'failed'} status - Transaction status
 * @property {number} timestamp - Transaction timestamp
 */

/**
 * @typedef {Object} WalletInfo
 * @property {string} publicKey - Wallet's public key
 * @property {string} [name] - Optional wallet name
 * @property {string} type - Wallet type (e.g., 'solana', 'bitcoin')
 * @property {WalletBalance} [balance] - Current balance
 * @property {boolean} isEncrypted - Whether wallet is encrypted
 */

/**
 * @typedef {Object} WalletCreationOptions
 * @property {string} [name] - Optional wallet name
 * @property {string} password - Password for encryption
 */

/**
 * @typedef {Object} WalletImportOptions
 * @property {string} privateKey - Private key to import
 * @property {string} [name] - Optional wallet name
 * @property {string} password - Password for encryption
 */

/**
 * @typedef {Object} WalletExportOptions
 * @property {string} password - Password for decryption
 * @property {boolean} [includePrivateKey] - Whether to include private key in export
 */

/**
 * @typedef {Object} WalletServiceEvents
 * @property {function(string): void} statusChange - Fired when connection status changes
 * @property {function(WalletBalance): void} balanceChange - Fired when balance changes
 * @property {function(Error): void} error - Fired when an error occurs
 */

/**
 * Base abstract wallet class to standardize wallet implementations
 * across different blockchains. All wallet implementations should extend this class.
 */
export class BaseWallet extends EventEmitter {
  
  constructor() {
    super();
    this._status = WalletConnectionStatus.DISCONNECTED;
    this._info = null;
    this._lastBalance = null;
    this._balanceCheckInterval = null;
  }

  /**
   * Get current connection status
   * @returns {string} Current status
   */
  get status() {
    return this._status;
  }

  /**
   * Get wallet information
   * @returns {WalletInfo|null} Wallet info or null if not connected
   */
  get info() {
    return this._info;
  }

  /**
   * Get last known balance
   * @returns {WalletBalance|null} Last balance or null
   */
  get lastBalance() {
    return this._lastBalance;
  }

  /**
   * Check if wallet is connected
   * @returns {boolean} True if connected
   */
  get isConnected() {
    return this._status === WalletConnectionStatus.CONNECTED;
  }

  /**
   * Create a new wallet
   * Must be implemented by subclasses
   * @param {WalletCreationOptions} options - Creation options
   * @returns {Promise<WalletInfo>} Created wallet info
   * @abstract
   */
  async create(options) {
    throw new Error('create() must be implemented by subclass');
  }

  /**
   * Import an existing wallet using private key
   * Must be implemented by subclasses
   * @param {WalletImportOptions} options - Import options
   * @returns {Promise<WalletInfo>} Imported wallet info
   * @abstract
   */
  async import(options) {
    throw new Error('import() must be implemented by subclass');
  }

  /**
   * Export wallet - with or without private key based on options
   * Must be implemented by subclasses
   * @param {WalletExportOptions} options - Export options
   * @returns {Promise<string>} Exported wallet data
   * @abstract
   */
  async export(options) {
    throw new Error('export() must be implemented by subclass');
  }

  /**
   * Connect to the blockchain network
   * Must be implemented by subclasses
   * @returns {Promise<boolean>} True if successfully connected
   * @abstract
   */
  async connect() {
    throw new Error('connect() must be implemented by subclass');
  }

  /**
   * Disconnect from the blockchain network
   * Must be implemented by subclasses
   * @returns {Promise<void>}
   * @abstract
   */
  async disconnect() {
    throw new Error('disconnect() must be implemented by subclass');
  }

  /**
   * Get current wallet balance
   * Must be implemented by subclasses
   * @returns {Promise<WalletBalance>} Current balance
   * @abstract
   */
  async getBalance() {
    throw new Error('getBalance() must be implemented by subclass');
  }

  /**
   * Pay for a transaction (specific to publishing content)
   * Must be implemented by subclasses
   * @param {Uint8Array} data - Transaction data
   * @param {Object} [options] - Optional transaction options
   * @returns {Promise<TransactionResult>} Transaction result
   * @abstract
   */
  async payForTransaction(data, options) {
    throw new Error('payForTransaction() must be implemented by subclass');
  }

  /**
   * Sign arbitrary data with the wallet's private key
   * Must be implemented by subclasses
   * @param {string|Uint8Array} data - Data to sign
   * @returns {Promise<string>} Signature
   * @abstract
   */
  async signData(data) {
    throw new Error('signData() must be implemented by subclass');
  }

  /**
   * Verify a signature against data
   * Must be implemented by subclasses
   * @param {string|Uint8Array} data - Original data
   * @param {string} signature - Signature to verify
   * @param {string} [publicKey] - Public key to verify against (defaults to wallet's key)
   * @returns {Promise<boolean>} True if signature is valid
   * @abstract
   */
  async verifySignature(data, signature, publicKey) {
    throw new Error('verifySignature() must be implemented by subclass');
  }

  /**
   * Protected method to update connection status
   * @param {string} newStatus - New status
   * @protected
   */
  _updateStatus(newStatus) {
    if (this._status !== newStatus) {
      const oldStatus = this._status;
      this._status = newStatus;
      
      console.log(`Wallet status changed: ${oldStatus} → ${newStatus}`);
      this.emit('statusChange', newStatus);
      
      // If disconnected, clear info and stop balance checking
      if (newStatus === WalletConnectionStatus.DISCONNECTED) {
        this._info = null;
        this._lastBalance = null;
        this._stopBalanceChecking();
      }
    }
  }

  /**
   * Protected method to update wallet info
   * @param {WalletInfo} info - New wallet info
   * @protected
   */
  _updateInfo(info) {
    this._info = { ...info };
    
    // If balance is included, update last balance
    if (info.balance) {
      this._updateBalance(info.balance);
    }
  }

  /**
   * Protected method to update balance
   * @param {WalletBalance} balance - New balance
   * @protected
   */
  _updateBalance(balance) {
    const oldBalance = this._lastBalance;
    this._lastBalance = { ...balance };
    
    // Only emit if balance actually changed
    if (!oldBalance || 
        oldBalance.total !== balance.total || 
        oldBalance.available !== balance.available) {
      console.log(`Balance updated: ${balance.available} ${balance.currency}`);
      this.emit('balanceChange', balance);
    }
  }

  /**
   * Protected method to emit error events
   * @param {Error} error - Error to emit
   * @protected
   */
  _emitError(error) {
    console.error('Wallet error:', error);
    this.emit('error', error);
    
    // Set status to error if not already disconnected
    if (this._status !== WalletConnectionStatus.DISCONNECTED) {
      this._updateStatus(WalletConnectionStatus.ERROR);
    }
  }

  /**
   * Start automatic balance checking
   * @param {number} [intervalMs=30000] - Check interval in milliseconds
   * @protected
   */
  _startBalanceChecking(intervalMs = 30000) {
    this._stopBalanceChecking();
    
    this._balanceCheckInterval = setInterval(async () => {
      if (this.isConnected) {
        try {
          const balance = await this.getBalance();
          this._updateBalance(balance);
        } catch (error) {
          console.warn('Balance check failed:', error.message);
          // Don't emit error for balance check failures
        }
      }
    }, intervalMs);
    
    console.log(`Started balance checking every ${intervalMs}ms`);
  }

  /**
   * Stop automatic balance checking
   * @protected
   */
  _stopBalanceChecking() {
    if (this._balanceCheckInterval) {
      clearInterval(this._balanceCheckInterval);
      this._balanceCheckInterval = null;
      console.log('Stopped balance checking');
    }
  }

  /**
   * Cleanup method called when wallet is being destroyed
   * Override in subclasses to add specific cleanup
   * @returns {Promise<void>}
   */
  async cleanup() {
    this._stopBalanceChecking();
    await this.disconnect();
    this.removeAllListeners();
  }

  /**
   * Validate wallet options
   * @param {Object} options - Options to validate
   * @param {string[]} requiredFields - Required field names
   * @throws {Error} If validation fails
   * @protected
   */
  _validateOptions(options, requiredFields) {
    if (!options || typeof options !== 'object') {
      throw new Error('Options must be an object');
    }
    
    for (const field of requiredFields) {
      if (!options[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }

  /**
   * Generate a simple wallet ID
   * @returns {string} Wallet ID
   * @protected
   */
  _generateWalletId() {
    return `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if a public key format is valid for this wallet type
   * Must be implemented by subclasses for their specific format
   * @param {string} publicKey - Public key to validate
   * @returns {boolean} True if valid
   * @protected
   * @abstract
   */
  _isValidPublicKey(publicKey) {
    throw new Error('_isValidPublicKey() must be implemented by subclass');
  }

  /**
   * Check if a private key format is valid for this wallet type
   * Must be implemented by subclasses for their specific format
   * @param {string} privateKey - Private key to validate
   * @returns {boolean} True if valid
   * @protected
   * @abstract
   */
  _isValidPrivateKey(privateKey) {
    throw new Error('_isValidPrivateKey() must be implemented by subclass');
  }
}

// Character count: 9847