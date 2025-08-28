// src/services/hashing/HashingService-UGA.node.js
// Path: src/services/hashing/HashingService-UGA.node.js
// Node.js version of UGA HashingService for deployment scripts

import crypto from 'crypto';

/**
 * Node.js UGA-Enhanced Hashing Service for ADR-006 Implementation
 * Node.js version using built-in crypto module for deployment scripts
 */
export class HashingServiceUGA {
  
  // ADR-006 Domain Tags (4-byte ASCII strings for domain separation)
  static DOMAINS = {
    USER_GENESIS: 'UGEN',      // User Genesis hash
    UGR: 'UGR ',               // User Graph Root (note trailing space for 4 bytes)
    IDENTITY_ROOT: 'IDEN',     // Final identity root
    GLYFFITI_GENESIS: 'GGEN',  // Platform genesis
    LANE_ROOT: 'LANE',         // Lane root hashes
    CHUNK_ROOT: 'CHUN',        // Chunk root hashes
    CONTENT_ITEM: 'ITEM'       // Individual content items
  };

  /**
   * Hash content using SHA-256 (Node.js crypto)
   * @param {Uint8Array} content - Content to hash
   * @returns {Promise<string>} Hex-encoded hash
   */
  static async hashContent(content) {
    console.log('HashingService-UGA.node.js: hashContent: Creating standard hash');
    try {
      if (!content || !(content instanceof Uint8Array)) {
        throw new Error('Content must be a Uint8Array');
      }

      // Create hash using Node.js crypto
      const hash = crypto.createHash('sha256');
      hash.update(Buffer.from(content));
      const hashBuffer = hash.digest();
      
      // Convert to hex string (matching expo-crypto format)
      const result = hashBuffer.toString('hex');
      console.log('HashingService-UGA.node.js: hashContent: Hash created successfully');
      return result;
    } catch (error) {
      console.error('HashingService-UGA.node.js: hashContent: Error hashing content:', error);
      throw new Error(`Failed to hash content: ${error.message}`);
    }
  }

  /**
   * Create a domain-separated hash to prevent collisions between data types
   * Node.js version for deployment scripts
   * 
   * @param {string} domain - Domain tag from DOMAINS constant
   * @param {string} payload - Data to hash (string for Node.js)
   * @returns {Promise<string>} - Hex encoded domain-separated hash
   */
  static async hashWithDomain(domain, payload) {
    console.log(`HashingService-UGA.node.js: hashWithDomain: Creating domain-separated hash with domain: ${domain}`);
    
    try {
      // Validate domain
      if (!Object.values(this.DOMAINS).includes(domain)) {
        throw new Error(`Invalid domain: ${domain}. Must be one of: ${Object.values(this.DOMAINS).join(', ')}`);
      }

      // Ensure domain is exactly 4 bytes
      if (domain.length !== 4) {
        throw new Error(`Domain must be exactly 4 bytes. Got: ${domain} (${domain.length} bytes)`);
      }

      if (typeof payload !== 'string') {
        throw new Error('Payload must be string for Node.js version');
      }

      // ADR-006 specification: domain || payload
      const domainSeparatedData = domain + payload;

      // Hash using Node.js crypto
      const hash = crypto.createHash('sha256');
      hash.update(domainSeparatedData, 'utf8');
      const result = hash.digest('hex');
      
      console.log(`HashingService-UGA.node.js: hashWithDomain: Domain-separated hash created for domain ${domain}`);
      return result;
    } catch (error) {
      console.error('HashingService-UGA.node.js: hashWithDomain: Error creating domain hash:', error);
      throw new Error(`Failed to create domain hash: ${error.message}`);
    }
  }

  /**
   * Create User Genesis hash as specified in ADR-006
   * Node.js version for deployment scripts
   * 
   * @param {string} userPublicKey - User's public key
   * @param {string} glyffitiGenesisHash - Platform genesis hash
   * @param {string} username - Username for this genesis
   * @returns {Promise<string>} - User genesis hash
   */
  static async createUserGenesisHash(userPublicKey, glyffitiGenesisHash, username) {
    console.log('HashingService-UGA.node.js: createUserGenesisHash: Creating user genesis hash');
    
    try {
      // ADR-006 specification: UGEN || userPubKey || glyffitiGenesisHash || username
      const payload = userPublicKey + glyffitiGenesisHash + username;
      const userGenesisHash = await this.hashWithDomain(this.DOMAINS.USER_GENESIS, payload);
      
      console.log('HashingService-UGA.node.js: createUserGenesisHash: User genesis hash created successfully');
      return userGenesisHash;
    } catch (error) {
      console.error('HashingService-UGA.node.js: createUserGenesisHash: Error creating user genesis hash:', error);
      throw new Error(`Failed to create user genesis hash: ${error.message}`);
    }
  }

  /**
   * Create User Graph Root (UGR) hash from 8 lane roots
   * @param {string[]} laneRoots - Array of 8 lane root hashes (fixed-shape tree)
   * @returns {Promise<string>} - UGR hash with domain separation
   */
  static async createUGRHash(laneRoots) {
    console.log('HashingService-UGA.node.js: createUGRHash: Creating UGR hash from lane roots');
    
    try {
      if (!Array.isArray(laneRoots) || laneRoots.length !== 8) {
        throw new Error('UGR requires exactly 8 lane roots');
      }

      // Concatenate all lane roots
      const payload = laneRoots.join('');
      const ugrHash = await this.hashWithDomain(this.DOMAINS.UGR, payload);
      
      console.log('HashingService-UGA.node.js: createUGRHash: UGR hash created successfully');
      return ugrHash;
    } catch (error) {
      console.error('HashingService-UGA.node.js: createUGRHash: Error creating UGR hash:', error);
      throw new Error(`Failed to create UGR hash: ${error.message}`);
    }
  }

  /**
   * Create final identity root hash from UGR, user genesis, and platform genesis
   * @param {string} ugrHash - User Graph Root hash
   * @param {string} userGenesisHash - User genesis hash
   * @param {string} glyffitiGenesisHash - Platform genesis hash
   * @returns {Promise<string>} - Identity root hash
   */
  static async createIdentityRootHash(ugrHash, userGenesisHash, glyffitiGenesisHash) {
    console.log('HashingService-UGA.node.js: createIdentityRootHash: Creating identity root hash');
    
    try {
      // ADR-006 specification: concatenate the three components
      const payload = ugrHash + userGenesisHash + glyffitiGenesisHash;
      const identityRoot = await this.hashWithDomain(this.DOMAINS.IDENTITY_ROOT, payload);
      
      console.log('HashingService-UGA.node.js: createIdentityRootHash: Identity root hash created successfully');
      return identityRoot;
    } catch (error) {
      console.error('HashingService-UGA.node.js: createIdentityRootHash: Error creating identity root hash:', error);
      throw new Error(`Failed to create identity root hash: ${error.message}`);
    }
  }

  /**
   * Run comprehensive self-test for UGA hashing functionality (Node.js version)
   * @returns {Promise<boolean>} - True if all tests pass
   */
  static async runSelfTest() {
    console.log('HashingService-UGA.node.js: runSelfTest: Starting UGA hashing self-test');
    
    try {
      // Test 1: Basic domain-separated hashing
      const testPayload = 'test_payload_data';
      const hash1 = await this.hashWithDomain(this.DOMAINS.USER_GENESIS, testPayload);
      const hash2 = await this.hashWithDomain(this.DOMAINS.UGR, testPayload);
      
      if (hash1 === hash2) {
        throw new Error('Domain separation failed - identical hashes for different domains');
      }

      // Test 2: User genesis hash creation
      const testUserKey = 'test_user_public_key';
      const testGenesisHash = 'test_glyffiti_genesis_hash';
      const testUsername = 'test_user';
      
      const userGenesisHash = await this.createUserGenesisHash(testUserKey, testGenesisHash, testUsername);
      if (!userGenesisHash || userGenesisHash.length !== 64) {
        throw new Error('User genesis hash creation failed');
      }

      // Test 3: UGR hash creation
      const testLaneRoots = new Array(8).fill('test_lane_root_hash');
      const ugrHash = await this.createUGRHash(testLaneRoots);
      if (!ugrHash || ugrHash.length !== 64) {
        throw new Error('UGR hash creation failed');
      }

      // Test 4: Identity root hash creation
      const identityRoot = await this.createIdentityRootHash(ugrHash, userGenesisHash, testGenesisHash);
      if (!identityRoot || identityRoot.length !== 64) {
        throw new Error('Identity root hash creation failed');
      }

      // Test 5: Deterministic hashing
      const hash3 = await this.hashWithDomain(this.DOMAINS.USER_GENESIS, testPayload);
      if (hash1 !== hash3) {
        throw new Error('Hashing is not deterministic');
      }

      console.log('HashingService-UGA.node.js: runSelfTest: All UGA hashing tests passed successfully');
      return true;
    } catch (error) {
      console.error('HashingService-UGA.node.js: runSelfTest: Self-test failed:', error);
      return false;
    }
  }
}

// Character count: 8,321