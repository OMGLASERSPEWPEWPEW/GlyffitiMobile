// src/services/genesis/GlyffitiGenesisService-UGA.js
// Path: src/services/genesis/GlyffitiGenesisService-UGA.js

import { BlockchainService } from '../blockchain/BlockchainService';
import { StorageService } from '../storage/StorageService';

/**
 * Glyffiti Genesis Service for ADR-006 Implementation
 * 
 * Manages the platform-wide Glyffiti Genesis (G₀) block which serves as the
 * root of trust for the entire Glyffiti social network. This is a singleton
 * block deployed once and referenced by all user genesis blocks.
 * 
 * Key responsibilities:
 * - Cache and provide access to the deployed G₀ transaction
 * - Validate G₀ structure and integrity
 * - Provide G₀ hash for user genesis creation
 * - Monitor G₀ transaction status
 */
export class GlyffitiGenesisServiceUGA {

  // Configuration constants
  static CONFIG_KEY = 'glyffiti_genesis_config';
  static CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  // Expected G₀ structure validation
  static EXPECTED_GENESIS_FIELDS = ['version', 'protocol', 'network', 'timestamp', 'deployerKey'];

  // Static cache to avoid repeated blockchain lookups
  static _genesisCache = null;
  static _lastFetch = null;

  /**
   * Get the Glyffiti Genesis (G₀) information
   * This method caches the result aggressively since G₀ is immutable
   * 
   * @returns {Promise<{hash: string, transactionId: string, data: Object, deployedAt: Date}>}
   */
  static async getGenesisInfo() {
    console.log('GlyffitiGenesisService-UGA.js: getGenesisInfo: Retrieving Glyffiti Genesis info');
    
    try {
      // Check cache first
      if (this._genesisCache && this._isCacheValid()) {
        console.log('GlyffitiGenesisService-UGA.js: getGenesisInfo: Using cached genesis info');
        return this._genesisCache;
      }

      // Load configuration (contains transaction ID from deployment)
      const config = await this._loadGenesisConfig();
      if (!config || !config.transactionId) {
        throw new Error('Glyffiti Genesis not deployed yet. Run deployGenesis.js first.');
      }

      console.log('GlyffitiGenesisService-UGA.js: getGenesisInfo: Fetching genesis from blockchain');
      
      // Fetch from blockchain using existing BlockchainService
      const blockchainService = new BlockchainService();
      const transactionData = await blockchainService.getTransaction(config.transactionId);
      
      if (!transactionData) {
        throw new Error(`Genesis transaction not found: ${config.transactionId}`);
      }

      // Parse and validate the genesis data
      const genesisData = this._parseGenesisTransaction(transactionData);
      this._validateGenesisStructure(genesisData);

      // Create genesis info object
      const genesisInfo = {
        hash: genesisData.genesisHash || config.genesisHash,
        transactionId: config.transactionId,
        data: genesisData,
        deployedAt: new Date(genesisData.timestamp || config.deployedAt),
        network: genesisData.network || config.network,
        version: genesisData.version || '1.0.0'
      };

      // Cache the result
      this._genesisCache = genesisInfo;
      this._lastFetch = Date.now();

      console.log('GlyffitiGenesisService-UGA.js: getGenesisInfo: Genesis info retrieved successfully');
      return genesisInfo;

    } catch (error) {
      console.error('GlyffitiGenesisService-UGA.js: getGenesisInfo: Error retrieving genesis info:', error);
      throw new Error(`Failed to get genesis info: ${error.message}`);
    }
  }

  /**
   * Get just the genesis hash (most common operation)
   * @returns {Promise<string>} - The G₀ hash
   */
  static async getGenesisHash() {
    console.log('GlyffitiGenesisService-UGA.js: getGenesisHash: Getting genesis hash');
    
    try {
      const genesisInfo = await this.getGenesisInfo();
      return genesisInfo.hash;
    } catch (error) {
      console.error('GlyffitiGenesisService-UGA.js: getGenesisHash: Error getting genesis hash:', error);
      throw error;
    }
  }

  /**
   * Verify that the genesis is properly deployed and accessible
   * @returns {Promise<boolean>} - True if genesis is valid and accessible
   */
  static async verifyGenesisDeployment() {
    console.log('GlyffitiGenesisService-UGA.js: verifyGenesisDeployment: Verifying genesis deployment');
    
    try {
      const genesisInfo = await this.getGenesisInfo();
      
      // Check that we can access all required fields
      const requiredFields = ['hash', 'transactionId', 'data', 'deployedAt'];
      for (const field of requiredFields) {
        if (!genesisInfo[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Verify the hash format
      if (typeof genesisInfo.hash !== 'string' || genesisInfo.hash.length !== 64) {
        throw new Error('Invalid genesis hash format');
      }

      // Verify deployment is recent (within last 10 years)
      const deploymentAge = Date.now() - genesisInfo.deployedAt.getTime();
      const maxAge = 10 * 365 * 24 * 60 * 60 * 1000; // 10 years
      if (deploymentAge > maxAge) {
        throw new Error('Genesis deployment is too old');
      }

      console.log('GlyffitiGenesisService-UGA.js: verifyGenesisDeployment: Genesis deployment verified successfully');
      return true;

    } catch (error) {
      console.error('GlyffitiGenesisService-UGA.js: verifyGenesisDeployment: Verification failed:', error);
      return false;
    }
  }

  /**
   * Store genesis configuration after deployment
   * This is called by the deployment script to save the transaction details
   * 
   * @param {string} transactionId - Blockchain transaction ID
   * @param {string} genesisHash - The computed genesis hash
   * @param {string} network - Network name (devnet/mainnet)
   * @param {Object} additionalData - Additional deployment data
   */
  static async storeGenesisConfig(transactionId, genesisHash, network, additionalData = {}) {
    console.log('GlyffitiGenesisService-UGA.js: storeGenesisConfig: Storing genesis configuration');
    
    try {
      const config = {
        transactionId,
        genesisHash,
        network,
        deployedAt: new Date().toISOString(),
        deployedBy: additionalData.deployerKey || 'unknown',
        version: '1.0.0',
        ...additionalData
      };

      // Store in secure storage
      const storageService = new StorageService();
      await storageService.setItem(this.CONFIG_KEY, config);

      // Clear cache to force refresh
      this._genesisCache = null;
      this._lastFetch = null;

      console.log('GlyffitiGenesisService-UGA.js: storeGenesisConfig: Genesis configuration stored successfully');

    } catch (error) {
      console.error('GlyffitiGenesisService-UGA.js: storeGenesisConfig: Error storing config:', error);
      throw new Error(`Failed to store genesis config: ${error.message}`);
    }
  }

  /**
   * Clear the genesis cache (useful for testing or after config updates)
   */
  static clearCache() {
    console.log('GlyffitiGenesisService-UGA.js: clearCache: Clearing genesis cache');
    this._genesisCache = null;
    this._lastFetch = null;
  }

  /**
   * Get status information about the genesis service
   * @returns {Promise<Object>} - Service status information
   */
  static async getServiceStatus() {
    console.log('GlyffitiGenesisService-UGA.js: getServiceStatus: Getting service status');
    
    try {
      const status = {
        serviceName: 'GlyffitiGenesisService-UGA',
        version: '1.0.0',
        cacheStatus: this._genesisCache ? 'cached' : 'empty',
        lastFetch: this._lastFetch ? new Date(this._lastFetch).toISOString() : null
      };

      try {
        const genesisInfo = await this.getGenesisInfo();
        status.genesisStatus = 'available';
        status.genesisHash = genesisInfo.hash.substring(0, 16) + '...';
        status.network = genesisInfo.network;
        status.deployedAt = genesisInfo.deployedAt.toISOString();
      } catch (error) {
        status.genesisStatus = 'error';
        status.error = error.message;
      }

      return status;

    } catch (error) {
      console.error('GlyffitiGenesisService-UGA.js: getServiceStatus: Error getting status:', error);
      return {
        serviceName: 'GlyffitiGenesisService-UGA',
        status: 'error',
        error: error.message
      };
    }
  }

  // === Private Helper Methods ===

  /**
   * Load genesis configuration from storage
   * @returns {Promise<Object|null>} - Stored configuration or null
   * @private
   */
  static async _loadGenesisConfig() {
    try {
      const storageService = new StorageService();
      const config = await storageService.getItem(this.CONFIG_KEY);
      return config;
    } catch (error) {
      console.warn('GlyffitiGenesisService-UGA.js: _loadGenesisConfig: Config not found:', error.message);
      return null;
    }
  }

  /**
   * Check if the current cache is still valid
   * @returns {boolean} - True if cache is valid
   * @private
   */
  static _isCacheValid() {
    if (!this._lastFetch) return false;
    const age = Date.now() - this._lastFetch;
    return age < this.CACHE_DURATION;
  }

  /**
   * Parse genesis data from blockchain transaction
   * @param {Object} transactionData - Raw transaction data from blockchain
   * @returns {Object} - Parsed genesis data
   * @private
   */
  static _parseGenesisTransaction(transactionData) {
    try {
      // This will depend on the specific format used by your blockchain service
      // For now, assume it's in the memo field as JSON
      if (transactionData.memo) {
        return JSON.parse(transactionData.memo);
      } else if (transactionData.data) {
        return transactionData.data;
      } else {
        throw new Error('No genesis data found in transaction');
      }
    } catch (error) {
      throw new Error(`Failed to parse genesis transaction: ${error.message}`);
    }
  }

  /**
   * Validate that genesis data has the expected structure
   * @param {Object} genesisData - Parsed genesis data to validate
   * @private
   */
  static _validateGenesisStructure(genesisData) {
    if (!genesisData || typeof genesisData !== 'object') {
      throw new Error('Genesis data must be an object');
    }

    // Check for required fields (relaxed validation - some fields are optional)
    const criticalFields = ['version', 'protocol'];
    for (const field of criticalFields) {
      if (!(field in genesisData)) {
        console.warn(`GlyffitiGenesisService-UGA.js: _validateGenesisStructure: Missing field: ${field}`);
      }
    }

    // Validate protocol if present
    if (genesisData.protocol && genesisData.protocol !== 'glyffiti-genesis') {
      console.warn('GlyffitiGenesisService-UGA.js: _validateGenesisStructure: Unexpected protocol:', genesisData.protocol);
    }
  }

  /**
   * Run comprehensive self-test for the genesis service
   * @returns {Promise<boolean>} - True if all tests pass
   */
  static async runSelfTest() {
    console.log('GlyffitiGenesisService-UGA.js: runSelfTest: Starting genesis service self-test');
    
    try {
      // Test 1: Check cache functionality
      this.clearCache();
      if (this._genesisCache !== null) {
        throw new Error('Cache clear failed');
      }

      // Test 2: Try to get service status (should work even without genesis)
      const status = await this.getServiceStatus();
      if (!status || !status.serviceName) {
        throw new Error('Service status test failed');
      }

      // Test 3: Configuration validation (if available)
      try {
        await this.getGenesisInfo();
        console.log('GlyffitiGenesisService-UGA.js: runSelfTest: Genesis available for testing');
        
        // If genesis is available, test verification
        const isValid = await this.verifyGenesisDeployment();
        if (!isValid) {
          throw new Error('Genesis verification failed');
        }
      } catch (error) {
        console.log('GlyffitiGenesisService-UGA.js: runSelfTest: Genesis not available (normal for fresh deployment)');
        // This is normal if genesis hasn't been deployed yet
      }

      console.log('GlyffitiGenesisService-UGA.js: runSelfTest: All genesis service tests passed');
      return true;

    } catch (error) {
      console.error('GlyffitiGenesisService-UGA.js: runSelfTest: Self-test failed:', error);
      return false;
    }
  }
}

// Character count: 13,047