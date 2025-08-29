// src/services/genesis/UserGenesisService-UGA.js
// Path: src/services/genesis/UserGenesisService-UGA.js

import { GlyffitiGenesisServiceUGA } from './GlyffitiGenesisService-UGA';
import { HashingServiceUGA } from '../hashing/HashingService-UGA';
import { SolanaMemoBuilder } from '../blockchain/solana/utils/SolanaMemoBuilder';
import { BlockchainService } from '../blockchain/BlockchainService';

/**
 * User Genesis Service for ADR-006 Implementation
 * 
 * Handles the creation and publishing of User Genesis (U₀) blocks that bind
 * individual users to the Glyffiti platform. Each user must have exactly one
 * U₀ block that creates their cryptographic identity within the system.
 * 
 * Key responsibilities:
 * - Calculate user genesis hashes according to ADR-006 specification
 * - Publish U₀ blocks to the blockchain
 * - Validate user genesis blocks
 * - Provide user genesis information for UGA creation
 */
export class UserGenesisServiceUGA {

  // U₀ block structure constants
  static USER_GENESIS_VERSION = '1.0.0';
  static USER_GENESIS_KIND = 'user_genesis';

  /**
   * Calculate the user genesis hash according to ADR-006 specification
   * Hash = HASH("UGEN" || userPubKey || glyffitiGenesisHash || username)
   * 
   * @param {string} userPublicKey - User's public key (base58)
   * @param {string} glyffitiGenesisHash - Platform genesis hash from G₀
   * @param {string} username - Unique username for this user
   * @returns {Promise<string>} - Deterministic user genesis hash
   */
  static async calculateUserGenesisHash(userPublicKey, glyffitiGenesisHash, username) {
    console.log('UserGenesisService-UGA.js: calculateUserGenesisHash: Calculating user genesis hash');
    
    try {
      // Validate inputs
      if (!userPublicKey || typeof userPublicKey !== 'string') {
        throw new Error('User public key is required and must be a string');
      }
      if (!glyffitiGenesisHash || typeof glyffitiGenesisHash !== 'string') {
        throw new Error('Glyffiti genesis hash is required and must be a string');
      }
      if (!username || typeof username !== 'string') {
        throw new Error('Username is required and must be a string');
      }

      // Use the domain-separated hashing from HashingService-UGA
      const userGenesisHash = await HashingServiceUGA.createUserGenesisHash(
        userPublicKey,
        glyffitiGenesisHash,
        username
      );

      console.log('UserGenesisService-UGA.js: calculateUserGenesisHash: User genesis hash calculated successfully');
      return userGenesisHash;

    } catch (error) {
      console.error('UserGenesisService-UGA.js: calculateUserGenesisHash: Error calculating hash:', error);
      throw new Error(`Failed to calculate user genesis hash: ${error.message}`);
    }
  }

  /**
   * Create and publish a User Genesis (U₀) block to the blockchain
   * 
   * @param {Object} userWallet - Wallet object with keypair for signing
   * @param {string} username - Unique username for this user
   * @param {Object} metadata - Additional metadata for the user genesis
   * @returns {Promise<{transactionId: string, userGenesisHash: string, memo: Object}>}
   */
  static async publishUserGenesis(userWallet, username, metadata = {}) {
    console.log('UserGenesisService-UGA.js: publishUserGenesis: Publishing user genesis for:', username);
    
    try {
      // Validate inputs
      if (!userWallet || !userWallet.keypair) {
        throw new Error('User wallet with keypair is required');
      }
      if (!username || typeof username !== 'string' || username.trim() === '') {
        throw new Error('Valid username is required');
      }

      // Get the Glyffiti Genesis hash
      console.log('UserGenesisService-UGA.js: publishUserGenesis: Fetching Glyffiti Genesis hash');
      const glyffitiGenesisHash = await GlyffitiGenesisServiceUGA.getGenesisHash();
      
      // Extract public key from wallet
      const userPublicKey = userWallet.keypair.publicKey.toBase58();

      // Calculate the user genesis hash
      const userGenesisHash = await this.calculateUserGenesisHash(
        userPublicKey,
        glyffitiGenesisHash,
        username.trim()
      );

      // Create the U₀ memo object according to ADR-006 specification
      const userGenesisMemo = {
        v: 1, // Version
        kind: this.USER_GENESIS_KIND,
        userGenesisHash: userGenesisHash,
        username: username.trim(),
        publicKey: userPublicKey,
        glyffitiGenesis: glyffitiGenesisHash,
        timestamp: Date.now(),
        // Optional metadata
        ...metadata
      };

      console.log('UserGenesisService-UGA.js: publishUserGenesis: Creating memo transaction');

      // Create memo builder for blockchain publishing
      const blockchainService = new BlockchainService();
      const connection = blockchainService.getConnection();
      const memoBuilder = new SolanaMemoBuilder(connection);

      // Convert memo to wire format and publish
      const memoData = JSON.stringify(userGenesisMemo);
      const wireData = Buffer.from(memoData, 'utf8');

      // Build and submit transaction
      const transaction = await memoBuilder.buildMemoTransaction(wireData, userWallet.keypair);
      const transactionId = await memoBuilder.submitTransactionWithRetries(
        transaction,
        userWallet.keypair,
        `User Genesis for ${username}`
      );

      console.log('UserGenesisService-UGA.js: publishUserGenesis: User genesis published successfully');
      console.log('UserGenesisService-UGA.js: publishUserGenesis: Transaction ID:', transactionId);

      // Return complete result
      return {
        transactionId,
        userGenesisHash,
        memo: userGenesisMemo,
        userPublicKey,
        username: username.trim()
      };

    } catch (error) {
      console.error('UserGenesisService-UGA.js: publishUserGenesis: Error publishing user genesis:', error);
      throw new Error(`Failed to publish user genesis: ${error.message}`);
    }
  }

  /**
   * Read and validate a user genesis block from a transaction ID
   * 
   * @param {string} transactionId - Blockchain transaction ID containing U₀
   * @returns {Promise<Object>} - Validated user genesis data
   */
  static async readUserGenesis(transactionId) {
    console.log('UserGenesisService-UGA.js: readUserGenesis: Reading user genesis from transaction:', transactionId);
    
    try {
      if (!transactionId || typeof transactionId !== 'string') {
        throw new Error('Valid transaction ID is required');
      }

      // Use blockchain service to fetch transaction
      const blockchainService = new BlockchainService();
      const transactionData = await blockchainService.getTransaction(transactionId);
      
      if (!transactionData) {
        throw new Error(`Transaction not found: ${transactionId}`);
      }

      // Parse memo data
      const memoData = this._parseUserGenesisMemo(transactionData);
      
      // Validate the user genesis structure
      await this._validateUserGenesis(memoData);

      console.log('UserGenesisService-UGA.js: readUserGenesis: User genesis read and validated successfully');
      return {
        transactionId,
        ...memoData
      };

    } catch (error) {
      console.error('UserGenesisService-UGA.js: readUserGenesis: Error reading user genesis:', error);
      throw new Error(`Failed to read user genesis: ${error.message}`);
    }
  }

  /**
   * Verify that a user genesis hash is correctly calculated
   * 
   * @param {Object} userGenesis - User genesis data to verify
   * @returns {Promise<boolean>} - True if hash is valid
   */
  static async verifyUserGenesisHash(userGenesis) {
    console.log('UserGenesisService-UGA.js: verifyUserGenesisHash: Verifying user genesis hash');
    
    try {
      // Extract required fields
      const { publicKey, username, glyffitiGenesis, userGenesisHash } = userGenesis;
      
      if (!publicKey || !username || !glyffitiGenesis || !userGenesisHash) {
        throw new Error('Missing required fields for verification');
      }

      // Recalculate the hash
      const calculatedHash = await this.calculateUserGenesisHash(
        publicKey,
        glyffitiGenesis,
        username
      );

      // Compare hashes
      const isValid = calculatedHash === userGenesisHash;
      
      console.log('UserGenesisService-UGA.js: verifyUserGenesisHash: Verification result:', isValid);
      return isValid;

    } catch (error) {
      console.error('UserGenesisService-UGA.js: verifyUserGenesisHash: Verification error:', error);
      return false;
    }
  }

  /**
   * Check if a username is available (no existing U₀ block)
   * Note: This is a simplified check - in production you'd need a proper registry
   * 
   * @param {string} username - Username to check
   * @returns {Promise<boolean>} - True if available
   */
  static async isUsernameAvailable(username) {
    console.log('UserGenesisService-UGA.js: isUsernameAvailable: Checking username availability:', username);
    
    try {
      // This is a placeholder implementation
      // In a real system, you'd check against a registry or search blockchain
      
      // For now, assume all usernames are available
      // TODO: Implement proper username registry checking
      console.log('UserGenesisService-UGA.js: isUsernameAvailable: Username check passed (placeholder)');
      return true;

    } catch (error) {
      console.error('UserGenesisService-UGA.js: isUsernameAvailable: Error checking username:', error);
      return false;
    }
  }

  /**
   * Get user genesis information for UGA creation
   * This is used by UserGraphAnchorService-UGA
   * 
   * @param {string} userPublicKey - User's public key
   * @returns {Promise<{userGenesisHash: string, glyffitiGenesisHash: string}>}
   */
  static async getUserGenesisForUGA(userPublicKey) {
    console.log('UserGenesisService-UGA.js: getUserGenesisForUGA: Getting genesis info for UGA creation');
    
    try {
      if (!userPublicKey) {
        throw new Error('User public key is required');
      }

      // This is a simplified implementation
      // In a real system, you'd look up the user's U₀ transaction
      // For now, we'll generate it if we have the username
      
      // TODO: Implement proper U₀ lookup by public key
      // For Phase 1, this will be manually coordinated
      
      const glyffitiGenesisHash = await GlyffitiGenesisServiceUGA.getGenesisHash();
      
      // Return the components needed for UGA creation
      return {
        userGenesisHash: null, // TODO: Look up from registry
        glyffitiGenesisHash
      };

    } catch (error) {
      console.error('UserGenesisService-UGA.js: getUserGenesisForUGA: Error getting genesis info:', error);
      throw new Error(`Failed to get user genesis for UGA: ${error.message}`);
    }
  }

  // === Private Helper Methods ===

  /**
   * Parse user genesis memo from transaction data
   * @param {Object} transactionData - Raw transaction data
   * @returns {Object} - Parsed memo data
   * @private
   */
  static _parseUserGenesisMemo(transactionData) {
    try {
      // Extract memo data (format depends on blockchain service implementation)
      let memoData;
      if (transactionData.memo) {
        memoData = JSON.parse(transactionData.memo);
      } else if (transactionData.data) {
        memoData = transactionData.data;
      } else {
        throw new Error('No memo data found in transaction');
      }

      return memoData;
    } catch (error) {
      throw new Error(`Failed to parse user genesis memo: ${error.message}`);
    }
  }

  /**
   * Validate user genesis structure and content
   * @param {Object} userGenesis - User genesis data to validate
   * @private
   */
  static async _validateUserGenesis(userGenesis) {
    // Check required fields
    const requiredFields = ['v', 'kind', 'userGenesisHash', 'username', 'publicKey', 'glyffitiGenesis'];
    for (const field of requiredFields) {
      if (!(field in userGenesis)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate kind
    if (userGenesis.kind !== this.USER_GENESIS_KIND) {
      throw new Error(`Invalid genesis kind: ${userGenesis.kind}`);
    }

    // Validate hash format
    if (typeof userGenesis.userGenesisHash !== 'string' || userGenesis.userGenesisHash.length !== 64) {
      throw new Error('Invalid user genesis hash format');
    }

    // Verify the hash calculation
    const isValidHash = await this.verifyUserGenesisHash(userGenesis);
    if (!isValidHash) {
      throw new Error('User genesis hash verification failed');
    }
  }

  /**
   * Run comprehensive self-test for the user genesis service
   * @returns {Promise<boolean>} - True if all tests pass
   */
  static async runSelfTest() {
    console.log('UserGenesisService-UGA.js: runSelfTest: Starting user genesis service self-test');
    
    try {
      // Test 1: Hash calculation
      const testUserKey = 'testUserPublicKey123';
      const testGenesisHash = 'a'.repeat(64);
      const testUsername = 'testuser';

      const userGenesisHash = await this.calculateUserGenesisHash(
        testUserKey,
        testGenesisHash,
        testUsername
      );

      if (!userGenesisHash || userGenesisHash.length !== 64) {
        throw new Error('User genesis hash calculation failed');
      }

      // Test 2: Hash verification
      const mockUserGenesis = {
        publicKey: testUserKey,
        username: testUsername,
        glyffitiGenesis: testGenesisHash,
        userGenesisHash: userGenesisHash
      };

      const isValid = await this.verifyUserGenesisHash(mockUserGenesis);
      if (!isValid) {
        throw new Error('User genesis hash verification failed');
      }

      // Test 3: Deterministic hash calculation
      const userGenesisHash2 = await this.calculateUserGenesisHash(
        testUserKey,
        testGenesisHash,
        testUsername
      );

      if (userGenesisHash !== userGenesisHash2) {
        throw new Error('User genesis hash is not deterministic');
      }

      // Test 4: Username availability (placeholder)
      const isAvailable = await this.isUsernameAvailable('test_available_user');
      if (!isAvailable) {
        console.warn('UserGenesisService-UGA.js: runSelfTest: Username availability check may need implementation');
      }

      console.log('UserGenesisService-UGA.js: runSelfTest: All user genesis service tests passed');
      return true;

    } catch (error) {
      console.error('UserGenesisService-UGA.js: runSelfTest: Self-test failed:', error);
      return false;
    }
  }
}

// Character count: 13,089