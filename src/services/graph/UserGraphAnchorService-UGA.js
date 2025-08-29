// src/services/graph/UserGraphAnchorService-UGA.js
// Path: src/services/graph/UserGraphAnchorService-UGA.js

import { MerkleServiceUGA } from './MerkleService-UGA';
import { UserGenesisServiceUGA } from '../genesis/UserGenesisService-UGA';
import { GlyffitiGenesisServiceUGA } from '../genesis/GlyffitiGenesisService-UGA';
import { SolanaMemoBuilder } from '../blockchain/solana/utils/SolanaMemoBuilder';
import { BlockchainService } from '../blockchain/BlockchainService';
import { StorageService } from '../storage/StorageService';

/**
 * User Graph Anchor Service for ADR-006 Implementation
 * 
 * Handles the creation and publishing of User Graph Anchor (UGA) transactions
 * that periodically checkpoint a user's complete social state to the blockchain.
 * 
 * Key responsibilities:
 * - Build User Graph Root (UGR) from lane data
 * - Create identity binding (UGR + user genesis + platform genesis)
 * - Publish minimal UGA transactions to blockchain
 * - Manage UGA publishing cadence and state
 * - Provide UGA verification capabilities
 */
export class UserGraphAnchorServiceUGA {

  // UGA configuration constants
  static UGA_VERSION = 1;
  static UGA_KIND = 'user_graph_anchor';
  static DEFAULT_EPOCH_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  static MAX_MEMO_SIZE = 566; // Solana memo size limit

  // Lane types as defined in ADR-006, expanded for 32 lanes
  static LANE_TYPES = {
    POSTS: 0,
    REPLIES: 1,
    LIKES: 2,
    FOLLOWS: 3,
    STORIES: 4,    // Integrates with ADR-004
    PROFILE: 5,
    REVOCATIONS: 6,
    BOOKMARKS: 7,  // Formerly RESERVED
    // Add other new lanes here as they are defined
    // Fill the rest with placeholders for now
    RESERVED_8: 8,
    RESERVED_9: 9,
    RESERVED_10: 10,
    RESERVED_11: 11,
    RESERVED_12: 12,
    RESERVED_13: 13,
    RESERVED_14: 14,
    RESERVED_15: 15,
    RESERVED_16: 16,
    RESERVED_17: 17,
    RESERVED_18: 18,
    RESERVED_19: 19,
    RESERVED_20: 20,
    RESERVED_21: 21,
    RESERVED_22: 22,
    RESERVED_23: 23,
    RESERVED_24: 24,
    RESERVED_25: 25,
    RESERVED_26: 26,
    RESERVED_27: 27,
    RESERVED_28: 28,
    RESERVED_29: 29,
    RESERVED_30: 30,
    RESERVED_31: 31
  };

  /**
   * Publish a new User Graph Anchor (UGA) transaction
   * This creates a complete checkpoint of the user's social state
   * 
   * @param {Object} userWallet - Wallet object with keypair for signing
   * @param {Object} laneData - Current state of all user lanes
   * @param {Object} options - Publishing options
   * @returns {Promise<{transactionId: string, identityRoot: string, ugaData: Object}>}
   */
  static async publishNewUGA(userWallet, laneData = {}, options = {}) {
    console.log('UserGraphAnchorService-UGA.js: publishNewUGA: Publishing new UGA');
    
    try {
      // Validate inputs
      if (!userWallet || !userWallet.keypair) {
        throw new Error('User wallet with keypair is required');
      }

      const userPublicKey = userWallet.keypair.publicKey.toBase58();
      console.log('UserGraphAnchorService-UGA.js: publishNewUGA: Creating UGA for user:', userPublicKey.substring(0, 8) + '...');

      // Step 1: Get user genesis information
      const { userGenesisHash, glyffitiGenesisHash } = await this._getUserGenesisInfo(userPublicKey);

      // Step 2: Create lane roots from current data (placeholder for Phase 1)
      const laneRoots = await this._createLaneRoots(laneData);

      // Step 3: Build User Graph Root (UGR) from lane roots
      console.log('UserGraphAnchorService-UGA.js: publishNewUGA: Creating UGR from lane roots');
      const { root: ugrRoot } = await MerkleServiceUGA.createUGR(laneRoots);

      // Step 4: Create identity root binding
      console.log('UserGraphAnchorService-UGA.js: publishNewUGA: Creating identity root');
      const { root: identityRoot } = await MerkleServiceUGA.createIdentityRoot(
        ugrRoot,
        userGenesisHash,
        glyffitiGenesisHash
      );

      // Step 5: Create UGA memo object (minimal on-chain data)
      const ugaEpoch = Date.now();
      const ugaMemo = {
        v: this.UGA_VERSION,
        kind: this.UGA_KIND,
        identityRoot: identityRoot,
        epoch: ugaEpoch,
        userPubKey: userPublicKey
      };

      // Add previous UGA reference if available
      const lastUGA = await this._getLastUGA(userPublicKey);
      if (lastUGA) {
        ugaMemo.prevUGA = lastUGA.transactionId;
      }

      // Step 6: Validate memo size
      const memoData = JSON.stringify(ugaMemo);
      if (Buffer.from(memoData, 'utf8').length > this.MAX_MEMO_SIZE) {
        throw new Error(`UGA memo too large: ${memoData.length} bytes (max ${this.MAX_MEMO_SIZE})`);
      }

      // Step 7: Publish to blockchain
      console.log('UserGraphAnchorService-UGA.js: publishNewUGA: Publishing UGA transaction');
      const blockchainService = new BlockchainService();
      const connection = blockchainService.getConnection();
      const memoBuilder = new SolanaMemoBuilder(connection);

      const wireData = Buffer.from(memoData, 'utf8');
      const transaction = await memoBuilder.buildMemoTransaction(wireData, userWallet.keypair);
      const transactionId = await memoBuilder.submitTransactionWithRetries(
        transaction,
        userWallet.keypair,
        `UGA for ${userPublicKey.substring(0, 8)}...`
      );

      // Step 8: Store UGA metadata locally
      await this._storeUGAMetadata(userPublicKey, {
        transactionId,
        identityRoot,
        ugrRoot,
        userGenesisHash,
        glyffitiGenesisHash,
        epoch: ugaEpoch,
        laneRoots,
        publishedAt: new Date().toISOString()
      });

      console.log('UserGraphAnchorService-UGA.js: publishNewUGA: UGA published successfully');
      console.log('UserGraphAnchorService-UGA.js: publishNewUGA: Transaction ID:', transactionId);

      return {
        transactionId,
        identityRoot,
        ugaData: ugaMemo,
        ugrRoot,
        laneRoots,
        epoch: ugaEpoch
      };

    } catch (error) {
      console.error('UserGraphAnchorService-UGA.js: publishNewUGA: Error publishing UGA:', error);
      throw new Error(`Failed to publish UGA: ${error.message}`);
    }
  }

  /**
   * Check if a UGA should be published based on time elapsed since last UGA
   * 
   * @param {string} userPublicKey - User's public key
   * @param {number} intervalMs - Interval in milliseconds (default: 24 hours)
   * @returns {Promise<boolean>} - True if UGA should be published
   */
  static async shouldPublishUGA(userPublicKey, intervalMs = this.DEFAULT_EPOCH_INTERVAL) {
    console.log('UserGraphAnchorService-UGA.js: shouldPublishUGA: Checking if UGA should be published');
    
    try {
      const lastUGA = await this._getLastUGA(userPublicKey);
      
      if (!lastUGA) {
        console.log('UserGraphAnchorService-UGA.js: shouldPublishUGA: No previous UGA found, should publish');
        return true;
      }

      const timeSinceLastUGA = Date.now() - lastUGA.epoch;
      const shouldPublish = timeSinceLastUGA >= intervalMs;

      console.log('UserGraphAnchorService-UGA.js: shouldPublishUGA: Time since last UGA:', timeSinceLastUGA, 'ms');
      console.log('UserGraphAnchorService-UGA.js: shouldPublishUGA: Should publish:', shouldPublish);

      return shouldPublish;

    } catch (error) {
      console.error('UserGraphAnchorService-UGA.js: shouldPublishUGA: Error checking UGA timing:', error);
      return true; // Default to publishing if we can't determine
    }
  }

  /**
   * Read and validate a UGA transaction from the blockchain
   * 
   * @param {string} transactionId - UGA transaction ID
   * @returns {Promise<Object>} - Validated UGA data
   */
  static async readUGA(transactionId) {
    console.log('UserGraphAnchorService-UGA.js: readUGA: Reading UGA transaction:', transactionId);
    
    try {
      if (!transactionId || typeof transactionId !== 'string') {
        throw new Error('Valid transaction ID is required');
      }

      // Fetch transaction from blockchain
      const blockchainService = new BlockchainService();
      const transactionData = await blockchainService.getTransaction(transactionId);
      
      if (!transactionData) {
        throw new Error(`UGA transaction not found: ${transactionId}`);
      }

      // Parse memo data
      const ugaData = this._parseUGAMemo(transactionData);
      
      // Validate UGA structure
      this._validateUGA(ugaData);

      console.log('UserGraphAnchorService-UGA.js: readUGA: UGA read and validated successfully');
      return {
        transactionId,
        ...ugaData
      };

    } catch (error) {
      console.error('UserGraphAnchorService-UGA.js: readUGA: Error reading UGA:', error);
      throw new Error(`Failed to read UGA: ${error.message}`);
    }
  }

  /**
   * Get the latest UGA for a user
   * 
   * @param {string} userPublicKey - User's public key
   * @returns {Promise<Object|null>} - Latest UGA data or null
   */
  static async getLatestUGA(userPublicKey) {
    console.log('UserGraphAnchorService-UGA.js: getLatestUGA: Getting latest UGA for user');
    
    try {
      return await this._getLastUGA(userPublicKey);
    } catch (error) {
      console.error('UserGraphAnchorService-UGA.js: getLatestUGA: Error getting latest UGA:', error);
      return null;
    }
  }

  /**
   * Verify a UGA's identity root against its components
   * 
   * @param {string} identityRoot - Identity root to verify
   * @param {string} ugrRoot - UGR root
   * @param {string} userGenesisHash - User genesis hash
   * @param {string} glyffitiGenesisHash - Platform genesis hash
   * @returns {Promise<boolean>} - True if verification passes
   */
  static async verifyIdentityRoot(identityRoot, ugrRoot, userGenesisHash, glyffitiGenesisHash) {
    console.log('UserGraphAnchorService-UGA.js: verifyIdentityRoot: Verifying identity root');
    
    try {
      // Recreate the identity root
      const { root: calculatedRoot } = await MerkleServiceUGA.createIdentityRoot(
        ugrRoot,
        userGenesisHash,
        glyffitiGenesisHash
      );

      const isValid = calculatedRoot === identityRoot;
      console.log('UserGraphAnchorService-UGA.js: verifyIdentityRoot: Verification result:', isValid);
      return isValid;

    } catch (error) {
      console.error('UserGraphAnchorService-UGA.js: verifyIdentityRoot: Verification error:', error);
      return false;
    }
  }

  // === Private Helper Methods ===

  /**
   * Get user genesis information needed for UGA creation
   * @param {string} userPublicKey - User's public key
   * @returns {Promise<{userGenesisHash: string, glyffitiGenesisHash: string}>}
   * @private
   */
  static async _getUserGenesisInfo(userPublicKey) {
    try {
      // Get platform genesis hash
      const glyffitiGenesisHash = await GlyffitiGenesisServiceUGA.getGenesisHash();
      
      // For Phase 1, we'll need to look up the user genesis hash
      // This is a simplified implementation - in production you'd have a proper registry
      const userGenesisInfo = await UserGenesisServiceUGA.getUserGenesisForUGA(userPublicKey);
      
      // For now, create a placeholder user genesis hash
      // TODO: Implement proper user genesis lookup
      const userGenesisHash = userGenesisInfo.userGenesisHash || 
        await this._createPlaceholderUserGenesis(userPublicKey, glyffitiGenesisHash);

      return { userGenesisHash, glyffitiGenesisHash };
    } catch (error) {
      throw new Error(`Failed to get user genesis info: ${error.message}`);
    }
  }

  /**
   * Create placeholder user genesis hash for Phase 1 testing
   * @param {string} userPublicKey - User's public key
   * @param {string} glyffitiGenesisHash - Platform genesis hash
   * @returns {Promise<string>} - Placeholder user genesis hash
   * @private
   */
  static async _createPlaceholderUserGenesis(userPublicKey, glyffitiGenesisHash) {
    // Create a placeholder username based on public key
    const placeholderUsername = 'user_' + userPublicKey.substring(0, 8);
    
    // Calculate a proper user genesis hash
    return await UserGenesisServiceUGA.calculateUserGenesisHash(
      userPublicKey,
      glyffitiGenesisHash,
      placeholderUsername
    );
  }

  /**
   * Create lane roots from current user data
   * For Phase 1, this creates placeholder roots
   * @param {Object} laneData - Current lane data
   * @returns {Promise<string[]>} - Array of 8 lane roots
   * @private
   */
  static async _createLaneRoots(laneData) {
    console.log('UserGraphAnchorService-UGA.js: _createLaneRoots: Creating lane roots (Phase 1 placeholders)');
    
    // For Phase 1, create placeholder lane roots
    // In full implementation, this would process actual lane chunks
    const laneRoots = MerkleServiceUGA.createPlaceholderLaneRoots();
    
    // TODO: Process actual lane data when lane management is implemented
    // - Process POSTS lane chunks
    // - Process REPLIES lane chunks  
    // - Process LIKES lane chunks
    // - Process FOLLOWS lane chunks
    // - Process STORIES lane chunks (integrate with ADR-004)
    // - Process PROFILE lane chunks
    // - Process REVOCATIONS lane chunks
    // - Keep RESERVED lane as zero hash

    return laneRoots;
  }

  /**
   * Store UGA metadata locally for tracking and caching
   * @param {string} userPublicKey - User's public key
   * @param {Object} ugaMetadata - UGA metadata to store
   * @private
   */
  static async _storeUGAMetadata(userPublicKey, ugaMetadata) {
    try {
      const storageKey = `uga_latest_${userPublicKey}`;
      const storageService = new StorageService();
      await storageService.setItem(storageKey, ugaMetadata);
    } catch (error) {
      console.warn('UserGraphAnchorService-UGA.js: _storeUGAMetadata: Failed to store metadata:', error.message);
      // Non-critical error, continue
    }
  }

  /**
   * Get the last UGA metadata for a user
   * @param {string} userPublicKey - User's public key
   * @returns {Promise<Object|null>} - Last UGA metadata or null
   * @private
   */
  static async _getLastUGA(userPublicKey) {
    try {
      const storageKey = `uga_latest_${userPublicKey}`;
      const storageService = new StorageService();
      return await storageService.getItem(storageKey);
    } catch (error) {
      console.warn('UserGraphAnchorService-UGA.js: _getLastUGA: Failed to get last UGA:', error.message);
      return null;
    }
  }

  /**
   * Parse UGA memo from transaction data
   * @param {Object} transactionData - Raw transaction data
   * @returns {Object} - Parsed UGA data
   * @private
   */
  static _parseUGAMemo(transactionData) {
    try {
      let ugaData;
      if (transactionData.memo) {
        ugaData = JSON.parse(transactionData.memo);
      } else if (transactionData.data) {
        ugaData = transactionData.data;
      } else {
        throw new Error('No UGA data found in transaction');
      }
      return ugaData;
    } catch (error) {
      throw new Error(`Failed to parse UGA memo: ${error.message}`);
    }
  }

  /**
   * Validate UGA structure and content
   * @param {Object} ugaData - UGA data to validate
   * @private
   */
  static _validateUGA(ugaData) {
    // Check required fields
    const requiredFields = ['v', 'kind', 'identityRoot', 'epoch', 'userPubKey'];
    for (const field of requiredFields) {
      if (!(field in ugaData)) {
        throw new Error(`Missing required UGA field: ${field}`);
      }
    }

    // Validate kind
    if (ugaData.kind !== this.UGA_KIND) {
      throw new Error(`Invalid UGA kind: ${ugaData.kind}`);
    }

    // Validate identity root format
    if (typeof ugaData.identityRoot !== 'string' || ugaData.identityRoot.length !== 64) {
      throw new Error('Invalid identity root format');
    }

    // Validate epoch
    if (typeof ugaData.epoch !== 'number' || ugaData.epoch <= 0) {
      throw new Error('Invalid epoch value');
    }
  }

  /**
   * Run comprehensive self-test for the UGA service
   * @returns {Promise<boolean>} - True if all tests pass
   */
  static async runSelfTest() {
    console.log('UserGraphAnchorService-UGA.js: runSelfTest: Starting UGA service self-test');
    
    try {
      // Test 1: Lane root creation
      const laneRoots = await this._createLaneRoots({});
      if (!Array.isArray(laneRoots) || laneRoots.length !== 32) {
        throw new Error('Lane root creation failed');
      }

      // Test 2: UGA timing check
      const testUserKey = 'test_user_public_key_123';
      const shouldPublish = await this.shouldPublishUGA(testUserKey);
      if (typeof shouldPublish !== 'boolean') {
        throw new Error('UGA timing check failed');
      }

      // Test 3: Identity root verification
      const testUGRRoot = 'a'.repeat(64);
      const testUserGenesis = 'b'.repeat(64);
      const testGlyffitiGenesis = 'c'.repeat(64);
      
      const { root: identityRoot } = await MerkleServiceUGA.createIdentityRoot(
        testUGRRoot,
        testUserGenesis,
        testGlyffitiGenesis
      );

      const isValid = await this.verifyIdentityRoot(
        identityRoot,
        testUGRRoot,
        testUserGenesis,
        testGlyffitiGenesis
      );

      if (!isValid) {
        throw new Error('Identity root verification failed');
      }

      console.log('UserGraphAnchorService-UGA.js: runSelfTest: All UGA service tests passed');
      return true;

    } catch (error) {
      console.error('UserGraphAnchorService-UGA.js: runSelfTest: Self-test failed:', error);
      return false;
    }
  }
}

// Character count: 17,432