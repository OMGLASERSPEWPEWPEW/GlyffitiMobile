// src/services/graph/MerkleService-UGA.js
// Path: src/services/graph/MerkleService-UGA.js

import { HashingServiceUGA } from '../hashing/HashingService-UGA';

/**
 * ADR-006 Specific Merkle Tree Service
 * 
 * Handles the creation of fixed-shape Merkle trees required for 
 * Genesis & User Graph Anchors (UGA) architecture:
 * 
 * 1. User Graph Root (UGR) - Fixed 8-leaf tree from lane roots
 * 2. Identity Root - Fixed 3-leaf tree from UGR + genesis hashes
 * 
 * These differ from the general-purpose MerkleBuilder-M in that they
 * have predetermined structures and use domain-separated hashing.
 */
export class MerkleServiceUGA {

  // Fixed structure constants for ADR-006 (Updated to 32 lanes)
  static LANE_COUNT = 32;  // UGR now has exactly 32 lanes
  static IDENTITY_LEAVES = 3;  // Identity root always has exactly 3 leaves

  // Zero hash for empty/placeholder lanes
  static ZERO_HASH = '0'.repeat(64);

  /**
   * Create User Graph Root (UGR) from a power-of-two number of lane roots
   * 
   * This implements the fixed-shape Merkle tree specified in our protocol.
   * The structure is always complete and predictable.
   * 
   * @param {string[]} laneRoots - Array of exactly LANE_COUNT root hashes
   * @returns {Promise<{root: string, tree: Object}>} - UGR root hash and tree structure
   */
  static async createUGR(laneRoots) {
    console.log('MerkleService-UGA.js: createUGR: Creating User Graph Root from lane roots');
    
    try {
      // Validate input
      if (!Array.isArray(laneRoots)) {
        throw new Error('Lane roots must be an array');
      }

      if (laneRoots.length !== this.LANE_COUNT) {
        throw new Error(`UGR requires exactly ${this.LANE_COUNT} lane roots, got ${laneRoots.length}`);
      }
      
      // Optional but recommended: Validate that the count is a power of two
      if ((laneRoots.length & (laneRoots.length - 1)) !== 0 || laneRoots.length === 0) {
        throw new Error('Number of lane roots must be a power of two.');
      }

      // Validate that each lane root is a valid hash (64 hex characters)
      for (let i = 0; i < laneRoots.length; i++) {
        const laneRoot = laneRoots[i];
        if (typeof laneRoot !== 'string' || laneRoot.length !== 64 || !/^[0-9a-f]+$/i.test(laneRoot)) {
          throw new Error(`Invalid lane root at index ${i}: ${laneRoot}`);
        }
      }

      const treeDepth = Math.log2(laneRoots.length);
      console.log(`MerkleService-UGA.js: createUGR: Building ${treeDepth}-level fixed Merkle tree for ${this.LANE_COUNT} lanes`);

      const levels = [[...laneRoots]];
      let currentLevel = levels[0];

      while (currentLevel.length > 1) {
        const nextLevel = [];
        for (let i = 0; i < currentLevel.length; i += 2) {
          const left = currentLevel[i];
          const right = currentLevel[i + 1];
          const parentHash = await this._hashPair(left, right);
          nextLevel.push(parentHash);
        }
        levels.push(nextLevel);
        currentLevel = nextLevel;
      }

      const ugrRoot = currentLevel[0];

      const tree = {
        root: ugrRoot,
        levels: levels,
        structure: `fixed-${this.LANE_COUNT}-leaf`
      };

      console.log('MerkleService-UGA.js: createUGR: UGR created successfully, root:', ugrRoot.substring(0, 16) + '...');
      return { root: ugrRoot, tree };

    } catch (error) {
      console.error('MerkleService-UGA.js: createUGR: Error creating UGR:', error);
      throw new Error(`Failed to create UGR: ${error.message}`);
    }
  }

  /**
   * Create Identity Root from UGR hash, user genesis hash, and platform genesis hash
   * 
   * This implements the fixed 3-leaf Merkle tree that binds a user's complete
   * social graph to their identity and the platform genesis.
   * 
   * Tree structure:
   *        identityRoot
   *          /        \
   *    UGR_UG       glyffitiGenesis  
   *     /    \
   *   UGR  userGenesis
   * 
   * @param {string} ugrHash - User Graph Root hash
   * @param {string} userGenesisHash - User genesis hash (U₀)
   * @param {string} glyffitiGenesisHash - Platform genesis hash (G₀)
   * @returns {Promise<{root: string, tree: Object}>} - Identity root and tree structure
   */
  static async createIdentityRoot(ugrHash, userGenesisHash, glyffitiGenesisHash) {
    console.log('MerkleService-UGA.js: createIdentityRoot: Creating identity root from UGR and genesis hashes');
    
    try {
      // Validate inputs
      this._validateHash(ugrHash, 'UGR hash');
      this._validateHash(userGenesisHash, 'User genesis hash');
      this._validateHash(glyffitiGenesisHash, 'Glyffiti genesis hash');

      console.log('MerkleService-UGA.js: createIdentityRoot: Building fixed 3-leaf identity tree');

      // Level 0: Three leaf hashes
      const level0 = [ugrHash, userGenesisHash, glyffitiGenesisHash];

      // Level 1: First combine UGR with user genesis
      const ugrUserGenesis = await this._hashPair(ugrHash, userGenesisHash);
      const level1 = [ugrUserGenesis, glyffitiGenesisHash];

      // Level 2: Combine the result with platform genesis to get identity root
      const identityRoot = await this._hashPair(ugrUserGenesis, glyffitiGenesisHash);

      const tree = {
        root: identityRoot,
        levels: [level0, level1, [identityRoot]],
        structure: 'fixed-3-leaf-identity'
      };

      console.log('MerkleService-UGA.js: createIdentityRoot: Identity root created successfully:', identityRoot.substring(0, 16) + '...');
      return { root: identityRoot, tree };

    } catch (error) {
      console.error('MerkleService-UGA.js: createIdentityRoot: Error creating identity root:', error);
      throw new Error(`Failed to create identity root: ${error.message}`);
    }
  }

  /**
   * Generate proof for a specific lane in the UGR tree
   * @param {Object} ugrTree - UGR tree from createUGR()
   * @param {number} laneIndex - Index of lane to prove (0-7)
   * @returns {Array} - Merkle proof path for the lane
   */
  static generateUGRProof(ugrTree, laneIndex) {
    console.log(`MerkleService-UGA.js: generateUGRProof: Generating proof for lane ${laneIndex}`);
    
    try {
      if (!ugrTree || !ugrTree.levels) {
        throw new Error('Invalid UGR tree provided');
      }

      if (laneIndex < 0 || laneIndex >= this.LANE_COUNT) {
        throw new Error(`Lane index must be between 0 and ${this.LANE_COUNT - 1}`);
      }

      const proof = [];
      let currentIndex = laneIndex;

      // Build proof path from leaf to root
      for (let level = 0; level < ugrTree.levels.length - 1; level++) {
        const currentLevel = ugrTree.levels[level];
        const isOdd = currentIndex % 2 !== 0;
        const siblingIndex = isOdd ? currentIndex - 1 : currentIndex + 1;

        if (siblingIndex < currentLevel.length) {
          proof.push({
            hash: currentLevel[siblingIndex],
            position: isOdd ? 'left' : 'right',
            level: level
          });
        }

        currentIndex = Math.floor(currentIndex / 2);
      }

      console.log(`MerkleService-UGA.js: generateUGRProof: Proof generated with ${proof.length} elements`);
      return proof;

    } catch (error) {
      console.error('MerkleService-UGA.js: generateUGRProof: Error generating UGR proof:', error);
      throw new Error(`Failed to generate UGR proof: ${error.message}`);
    }
  }

  /**
   * Verify a lane exists in the UGR tree
   * @param {string} laneRoot - Lane root to verify
   * @param {Array} proof - Merkle proof from generateUGRProof()
   * @param {string} expectedUGRRoot - Expected UGR root
   * @returns {Promise<boolean>} - True if proof is valid
   */
  static async verifyUGRProof(laneRoot, proof, expectedUGRRoot) {
    console.log('MerkleService-UGA.js: verifyUGRProof: Verifying UGR proof');
    
    try {
      this._validateHash(laneRoot, 'Lane root');
      this._validateHash(expectedUGRRoot, 'Expected UGR root');

      let computedHash = laneRoot;

      // Traverse the proof path
      for (const proofElement of proof) {
        if (proofElement.position === 'left') {
          computedHash = await this._hashPair(proofElement.hash, computedHash);
        } else {
          computedHash = await this._hashPair(computedHash, proofElement.hash);
        }
      }

      const isValid = computedHash === expectedUGRRoot;
      console.log(`MerkleService-UGA.js: verifyUGRProof: Verification result: ${isValid}`);
      return isValid;

    } catch (error) {
      console.error('MerkleService-UGA.js: verifyUGRProof: Error verifying proof:', error);
      return false;
    }
  }

  // === Private Helper Methods ===

  /**
   * Hash two sibling nodes together using deterministic ordering
   * @param {string} hashA - First hash
   * @param {string} hashB - Second hash
   * @returns {Promise<string>} - Parent hash
   * @private
   */
  static async _hashPair(hashA, hashB) {
    try {
      // Sort hashes lexicographically for deterministic results
      const sortedHashes = [hashA, hashB].sort((a, b) => a.localeCompare(b));
      const combinedPayload = sortedHashes[0] + sortedHashes[1];
      
      // Use standard (non-domain-separated) hashing for Merkle tree internal nodes
      // This maintains compatibility with existing MerkleBuilder-M patterns
      return await HashingServiceUGA.hashContent(combinedPayload);
    } catch (error) {
      throw new Error(`Failed to hash pair: ${error.message}`);
    }
  }

  /**
   * Validate that a string is a proper hash (64 hex characters)
   * @param {string} hash - Hash to validate
   * @param {string} description - Description for error messages
   * @private
   */
  static _validateHash(hash, description) {
    if (typeof hash !== 'string') {
      throw new Error(`${description} must be a string`);
    }
    if (hash.length !== 64) {
      throw new Error(`${description} must be 64 characters long, got ${hash.length}`);
    }
    if (!/^[0-9a-f]+$/i.test(hash)) {
      throw new Error(`${description} must be hexadecimal`);
    }
  }

  /**
   * Create placeholder lane roots for testing (all zeros)
   * @returns {string[]} - Array of 32 zero hashes
   */
  static createPlaceholderLaneRoots() {
    console.log('MerkleService-UGA.js: createPlaceholderLaneRoots: Creating placeholder lane roots');
    return new Array(this.LANE_COUNT).fill(this.ZERO_HASH);
  }

  /**
   * Run comprehensive self-test for UGA Merkle functionality
   * @returns {Promise<boolean>} - True if all tests pass
   */
  static async runSelfTest() {
    console.log('MerkleService-UGA.js: runSelfTest: Starting UGA Merkle service self-test');
    
    try {
      // Test 1: Create UGR with placeholder data
      const testLaneRoots = this.createPlaceholderLaneRoots();
      const { root: ugrRoot, tree: ugrTree } = await this.createUGR(testLaneRoots);
      
      if (!ugrRoot || ugrRoot.length !== 64) {
        throw new Error('UGR creation failed');
      }

      // Test 2: Create identity root
      const testUserGenesis = 'a'.repeat(64);
      const testGlyffitiGenesis = 'b'.repeat(64);
      
      const { root: identityRoot } = await this.createIdentityRoot(
        ugrRoot, 
        testUserGenesis, 
        testGlyffitiGenesis
      );
      
      if (!identityRoot || identityRoot.length !== 64) {
        throw new Error('Identity root creation failed');
      }

      // Test 3: Generate and verify UGR proof
      const proof = this.generateUGRProof(ugrTree, 0);
      if (proof.length === 0) {
        throw new Error('UGR proof generation failed');
      }

      const isValid = await this.verifyUGRProof(testLaneRoots[0], proof, ugrRoot);
      if (!isValid) {
        throw new Error('UGR proof verification failed');
      }

      // Test 4: Deterministic tree creation
      const { root: ugrRoot2 } = await this.createUGR(testLaneRoots);
      if (ugrRoot !== ugrRoot2) {
        throw new Error('UGR creation is not deterministic');
      }

      console.log('MerkleService-UGA.js: runSelfTest: All UGA Merkle tests passed successfully');
      return true;

    } catch (error) {
      console.error('MerkleService-UGA.js: runSelfTest: Self-test failed:', error);
      return false;
    }
  }
}

// Character count: 12,582