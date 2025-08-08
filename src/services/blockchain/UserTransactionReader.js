// src/services/blockchain/UserTransactionReader.js
// Path: src/services/blockchain/UserTransactionReader.js

import { Connection } from '@solana/web3.js';
import { SolanaMemoBuilder } from './solana/utils/SolanaMemoBuilder';

/**
 * Service for reading user transaction data directly from the blockchain
 * Uses the existing SolanaMemoBuilder to properly decode user genesis blocks
 */
export class UserTransactionReader {
  constructor() {
    // Use devnet for development
    this.connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    
    // Use existing SolanaMemoBuilder for reading genesis blocks
    this.memoBuilder = new SolanaMemoBuilder(this.connection);
    
    // Cache for transaction data to avoid repeated fetches
    this.transactionCache = new Map();
    this.cacheMaxAge = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Fetch user data from transaction hash
   * @param {string} transactionHash - The transaction hash from user-registry
   * @returns {Promise<Object|null>} User data from transaction or null if error
   */
  async fetchUserDataFromTransaction(transactionHash) {
    try {
      console.log('📖 Fetching user data from transaction:', transactionHash);
      
      // Check cache first
      const cached = this.getCachedTransaction(transactionHash);
      if (cached) {
        console.log('✅ Using cached transaction data');
        return cached;
      }

      // Use the existing SolanaMemoBuilder to read the genesis block
      // This handles all the complex decoding logic correctly
      const userGenesis = await this.memoBuilder.readGenesisFromTransaction(transactionHash);
      
      if (!userGenesis) {
        console.error('❌ Failed to read genesis from transaction');
        return null;
      }

      console.log('📄 Genesis block retrieved:', {
        kind: userGenesis.kind,
        alias: userGenesis.alias || userGenesis.username
      });

      // Extract the fields we need for display
      const extractedData = {
        kind: userGenesis.kind || 'user_genesis',
        ts: userGenesis.ts || Date.now(),
        alias: userGenesis.alias || userGenesis.username || 'anonymous',
        parent: userGenesis.parent ? userGenesis.parent.substring(0, 5) : '',
        pub: userGenesis.pub ? userGenesis.pub.substring(0, 5) : '',
        fullData: userGenesis // Keep full data for debugging
      };

      // Cache the result
      this.cacheTransaction(transactionHash, extractedData);
      console.log('✅ User data extracted:', extractedData);
      
      return extractedData;
      
    } catch (error) {
      console.error('❌ Error fetching user transaction:', error);
      return null;
    }
  }

  /**
   * Get cached transaction data
   * @param {string} transactionHash - Transaction hash
   * @returns {Object|null} Cached data or null
   */
  getCachedTransaction(transactionHash) {
    const cached = this.transactionCache.get(transactionHash);
    if (!cached) return null;
    
    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.cacheMaxAge) {
      this.transactionCache.delete(transactionHash);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Cache transaction data
   * @param {string} transactionHash - Transaction hash
   * @param {Object} data - Data to cache
   */
  cacheTransaction(transactionHash, data) {
    this.transactionCache.set(transactionHash, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear transaction cache
   */
  clearCache() {
    this.transactionCache.clear();
  }

  /**
   * Test connection to Solana network
   * @returns {Promise<boolean>} True if connection is working
   */
  async testConnection() {
    try {
      const version = await this.connection.getVersion();
      console.log('✅ Solana connection test successful:', version);
      return true;
    } catch (error) {
      console.error('❌ Solana connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const userTransactionReader = new UserTransactionReader();

// Character count: 3887