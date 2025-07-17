// src/services/wallet/BaseWallet.js
// Path: src/services/wallet/BaseWallet.js
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

// Create a simple EventEmitter for React Native that mimics Node.js EventEmitter
class SimpleEventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return this;
  }

  emit(event, ...args) {
    if (!this.events[event]) return false;
    this.events[event].forEach(listener => {
      listener(...args);
    });
    return true;
  }

  removeListener(event, listenerToRemove) {
    if (!this.events[event]) return this;
    this.events[event] = this.events[event].filter(listener => listener !== listenerToRemove);
    return this;
  }

  removeAllListeners(event) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
    return this;
  }
}

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
export class BaseWallet extends SimpleEventEmitter {
  
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
   * @param {Object} [options] - Transaction options
   * @returns {Promise<TransactionResult>} Transaction result
   * @abstract
   */
  async payForTransaction(data, options) {
    throw new Error('payForTransaction() must be implemented by subclass');
  }

  /**
   * Get transaction fee estimate
   * Must be implemented by subclasses
   * @param {Uint8Array} data - Transaction data
   * @param {Object} [options] - Estimation options
   * @returns {Promise<number>} Fee estimate in native currency
   * @abstract
   */
  async estimateFee(data, options) {
    throw new Error('estimateFee() must be implemented by subclass');
  }

  /**
   * Validate an address
   * Must be implemented by subclasses
   * @param {string} address - Address to validate
   * @returns {boolean} True if valid
   * @abstract
   */
  validateAddress(address) {
    throw new Error('validateAddress() must be implemented by subclass');
  }

  /**
   * Sign data with the wallet's private key
   * Must be implemented by subclasses
   * @param {string} data - Data to sign
   * @returns {Promise<string>} Signature
   * @abstract
   */
  async signData(data) {
    throw new Error('signData() must be implemented by subclass');
  }

  /**
   * Update wallet status and emit event
   * @protected
   * @param {string} status - New status
   */
  _updateStatus(status) {
    const oldStatus = this._status;
    this._status = status;
    if (oldStatus !== status) {
      this.emit('statusChange', status);
      console.log(`Wallet status changed: ${oldStatus} → ${status}`);
    }
  }

  /**
   * Update wallet info
   * @protected
   * @param {WalletInfo} info - New wallet info
   */
  _updateInfo(info) {
    this._info = info;
  }

  /**
   * Update balance and emit event if changed
   * @protected
   * @param {WalletBalance} balance - New balance
   */
  _updateBalance(balance) {
    const oldBalance = this._lastBalance;
    this._lastBalance = balance;
    
    if (!oldBalance || oldBalance.total !== balance.total) {
      this.emit('balanceChange', balance);
    }
  }

  /**
   * Emit error event
   * @protected
   * @param {Error} error - Error to emit
   */
  _emitError(error) {
    console.error('Wallet error:', error);
    this.emit('error', error);
  }

  /**
   * Validate required options
   * @protected
   * @param {Object} options - Options to validate
   * @param {string[]} required - Required field names
   * @throws {Error} If validation fails
   */
  _validateOptions(options, required) {
    if (!options) {
      throw new Error('Options are required');
    }
    
    for (const field of required) {
      if (!options[field]) {
        throw new Error(`${field} is required`);
      }
    }
  }

  /**
   * Start periodic balance checking
   * @protected
   * @param {number} [intervalMs=30000] - Check interval in milliseconds
   */
  _startBalanceChecking(intervalMs = 30000) {
    this._stopBalanceChecking();
    
    this._balanceCheckInterval = setInterval(async () => {
      if (this.isConnected) {
        try {
          const balance = await this.getBalance();
          this._updateBalance(balance);
        } catch (error) {
          console.error('Error checking balance:', error);
        }
      }
    }, intervalMs);
    
    console.log(`Started balance checking every ${intervalMs}ms`);
  }

  /**
   * Stop periodic balance checking
   * @protected
   */
  _stopBalanceChecking() {
    if (this._balanceCheckInterval) {
      clearInterval(this._balanceCheckInterval);
      this._balanceCheckInterval = null;
      console.log('Stopped balance checking');
    }
  }
}

// Character count: 8431