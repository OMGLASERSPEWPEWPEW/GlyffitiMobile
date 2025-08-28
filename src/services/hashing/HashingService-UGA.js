// src/services/hashing/HashingService-UGA.js
// Path: src/services/hashing/HashingService-UGA.js
import * as Crypto from 'expo-crypto';

/**
 * UGA-Enhanced Hashing Service for ADR-006 Implementation
 * Extends the original HashingService with domain-separated hashing
 * required for Genesis & User Graph Anchors (UGA) architecture
 * 
 * Domain separation prevents hash collisions between different data types
 * (e.g., user genesis hash vs. lane hash vs. identity root hash)
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
   * Create a SHA-256 hash of content (maintains backward compatibility)
   * @param {string|Uint8Array} content - Content to hash
   * @returns {Promise<string>} - Hex encoded hash
   */
  static async hashContent(content) {
    console.log('HashingService-UGA.js: hashContent: Creating standard hash');
    try {
      let data;
      
      if (typeof content === 'string') {
        data = content;
      } else if (content instanceof Uint8Array) {
        data = this.uint8ArrayToBase64(content);
      } else {
        throw new Error('Content must be string or Uint8Array');
      }

      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        data,
        { encoding: Crypto.CryptoEncoding.HEX }
      );
      
      console.log('HashingService-UGA.js: hashContent: Hash created successfully');
      return hash;
    } catch (error) {
      console.error('HashingService-UGA.js: hashContent: Error hashing content:', error);
      throw new Error('Failed to hash content: ' + error.message);
    }
  }

  /**
   * Create a domain-separated hash to prevent collisions between data types
   * This is the core primitive for ADR-006 implementation
   * 
   * @param {string} domain - Domain tag from DOMAINS constant
   * @param {string|Uint8Array} payload - Data to hash
   * @returns {Promise<string>} - Hex encoded domain-separated hash
   */
  static async hashWithDomain(domain, payload) {
    console.log(`HashingService-UGA.js: hashWithDomain: Creating domain-separated hash with domain: ${domain}`);
    
    try {
      // Validate domain
      if (!Object.values(this.DOMAINS).includes(domain)) {
        throw new Error(`Invalid domain: ${domain}. Must be one of: ${Object.values(this.DOMAINS).join(', ')}`);
      }

      // Ensure domain is exactly 4 bytes
      if (domain.length !== 4) {
        throw new Error(`Domain must be exactly 4 bytes. Got: ${domain} (${domain.length} bytes)`);
      }

      let payloadData;
      if (typeof payload === 'string') {
        payloadData = payload;
      } else if (payload instanceof Uint8Array) {
        payloadData = this.uint8ArrayToBase64(payload);
      } else {
        throw new Error('Payload must be string or Uint8Array');
      }

      // ADR-006 specification: domain || payload
      const domainSeparatedData = domain + payloadData;

      // Hash the domain-separated data
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        domainSeparatedData,
        { encoding: Crypto.CryptoEncoding.HEX }
      );
      
      console.log(`HashingService-UGA.js: hashWithDomain: Domain-separated hash created for domain ${domain}`);
      return hash;
    } catch (error) {
      console.error('HashingService-UGA.js: hashWithDomain: Error creating domain hash:', error);
      throw new Error(`Failed to create domain hash: ${error.message}`);
    }
  }

  /**
   * Create User Genesis hash as specified in ADR-006
   * Hash = BLAKE3("UGEN" || userPubKey || glyffitiGenesisHash || username)
   * Note: Currently using SHA-256, will migrate to BLAKE3 in future phase
   * 
   * @param {string} userPublicKey - User's public key
   * @param {string} glyffitiGenesisHash - Platform genesis hash
   * @param {string} username - Username for this genesis
   * @returns {Promise<string>} - User genesis hash
   */
  static async createUserGenesisHash(userPublicKey, glyffitiGenesisHash, username) {
    console.log('HashingService-UGA.js: createUserGenesisHash: Creating user genesis hash');
    
    try {
      // ADR-006 specification: UGEN || userPubKey || glyffitiGenesisHash || username
      const payload = userPublicKey + glyffitiGenesisHash + username;
      const userGenesisHash = await this.hashWithDomain(this.DOMAINS.USER_GENESIS, payload);
      
      console.log('HashingService-UGA.js: createUserGenesisHash: User genesis hash created successfully');
      return userGenesisHash;
    } catch (error) {
      console.error('HashingService-UGA.js: createUserGenesisHash: Error creating user genesis hash:', error);
      throw new Error(`Failed to create user genesis hash: ${error.message}`);
    }
  }

  /**
   * Create User Graph Root (UGR) hash from 8 lane roots
   * @param {string[]} laneRoots - Array of 8 lane root hashes (fixed-shape tree)
   * @returns {Promise<string>} - UGR hash with domain separation
   */
  static async createUGRHash(laneRoots) {
    console.log('HashingService-UGA.js: createUGRHash: Creating UGR hash from lane roots');
    
    try {
      if (!Array.isArray(laneRoots) || laneRoots.length !== 8) {
        throw new Error('UGR requires exactly 8 lane roots');
      }

      // Concatenate all lane roots
      const payload = laneRoots.join('');
      const ugrHash = await this.hashWithDomain(this.DOMAINS.UGR, payload);
      
      console.log('HashingService-UGA.js: createUGRHash: UGR hash created successfully');
      return ugrHash;
    } catch (error) {
      console.error('HashingService-UGA.js: createUGRHash: Error creating UGR hash:', error);
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
    console.log('HashingService-UGA.js: createIdentityRootHash: Creating identity root hash');
    
    try {
      // ADR-006 specification: concatenate the three components
      const payload = ugrHash + userGenesisHash + glyffitiGenesisHash;
      const identityRoot = await this.hashWithDomain(this.DOMAINS.IDENTITY_ROOT, payload);
      
      console.log('HashingService-UGA.js: createIdentityRootHash: Identity root hash created successfully');
      return identityRoot;
    } catch (error) {
      console.error('HashingService-UGA.js: createIdentityRootHash: Error creating identity root hash:', error);
      throw new Error(`Failed to create identity root hash: ${error.message}`);
    }
  }

  // === Utility Functions (preserved from original HashingService) ===

  /**
   * Verify if content matches a given hash
   * @param {string|Uint8Array} content - Content to verify
   * @param {string} hash - Expected hash (hex encoded)
   * @returns {Promise<boolean>} - True if hash matches
   */
  static async verifyHash(content, hash) {
    try {
      const calculatedHash = await this.hashContent(content);
      return calculatedHash.toLowerCase() === hash.toLowerCase();
    } catch (error) {
      console.error('HashingService-UGA.js: verifyHash: Error verifying hash:', error);
      return false;
    }
  }

  /**
   * Helper function to convert Uint8Array to base64
   * @param {Uint8Array} uint8Array - Byte array to convert
   * @returns {string} - Base64 encoded string
   */
  static uint8ArrayToBase64(uint8Array) {
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binaryString);
  }

  /**
   * Helper function to convert base64 to Uint8Array
   * @param {string} base64 - Base64 encoded string
   * @returns {Uint8Array} - Byte array
   */
  static base64ToUint8Array(base64) {
    const binaryString = atob(base64);
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }
    return uint8Array;
  }

  /**
   * Run comprehensive self-test for UGA hashing functionality
   * @returns {Promise<boolean>} - True if all tests pass
   */
  static async runSelfTest() {
    console.log('HashingService-UGA.js: runSelfTest: Starting UGA hashing self-test');
    
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

      console.log('HashingService-UGA.js: runSelfTest: All UGA hashing tests passed successfully');
      return true;
    } catch (error) {
      console.error('HashingService-UGA.js: runSelfTest: Self-test failed:', error);
      return false;
    }
  }
}

// Character count: 10,847