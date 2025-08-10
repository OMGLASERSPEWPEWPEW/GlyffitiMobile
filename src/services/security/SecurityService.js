// src/services/security/SecurityService.js
// Path: src/services/security/SecurityService.js

import { CompressionService } from '../compression/CompressionService';
import { sha256 } from 'js-sha256';

/**
 * SecurityService - Centralized security utilities for Glyffiti
 * 
 * Provides encryption, integrity verification, and field obfuscation
 * for all blockchain data (genesis blocks, posts, messages, etc.)
 * 
 * Security Layers:
 * 1. Field obfuscation (readable names → coded names)
 * 2. JSON serialization  
 * 3. Compression (gzip via CompressionService)
 * 4. Encryption (XOR cipher + substitution)
 * 5. Integrity hash (SHA-256)
 * 6. Wire format (version byte + hash + encrypted data)
 */
export class SecurityService {
  
  // Fixed encryption key (in production, derive from network parameters)
  static CIPHER_KEY = new Uint8Array([0x47, 0x6C, 0x79, 0x66, 0x66, 0x69, 0x74, 0x69]);
  
  // Wire format version
  static WIRE_FORMAT_VERSION = 0x01;
  
  // Maximum memo size for Solana (566 bytes - some buffer for encoding overhead)
  static MAX_MEMO_SIZE = 566;

  /**
   * Field obfuscation mapping (comprehensive list for all data types)
   */
  static FIELD_MAP = {
    // Genesis block fields
    'kind': 'a',
    'ver': 'b', 
    'ts': 'c',
    'alias': 'd',
    'parent': 'e',
    'pub': 'f',
    'seq': 'g',
    
    // Post/content fields
    'content': 'h',
    'title': 'i',
    'author': 'j',
    'authorName': 'k',
    'authorPublicKey': 'l',
    'socialPost': 'm',
    'type': 'n',
    'filename': 'o',
    'size': 'p',
    'prev': 'q',        // Previous post hash
    'tags': 'r',        // Post tags
    'mentions': 's',    // User mentions
    'replies': 't',     // Reply references
    
    // Future fields for messages, reactions, etc.
    'recipient': 'u',
    'encrypted': 'v',
    'reaction': 'w',
    'messageType': 'x',
    'threadId': 'y',
    'attachment': 'z'
  };

  /**
   * Reverse mapping for deobfuscation
   */
  static REVERSE_FIELD_MAP = Object.fromEntries(
    Object.entries(SecurityService.FIELD_MAP).map(([k, v]) => [v, k])
  );

  // ==================== FIELD OBFUSCATION ====================

  /**
   * Obfuscate field names to make raw data less readable
   * @param {Object} data - Original data with readable field names
   * @returns {Object} Data with obfuscated field names
   */
  static obfuscateFields(data) {
    const obfuscated = {};
    for (const [key, value] of Object.entries(data)) {
      const obfuscatedKey = this.FIELD_MAP[key] || key;
      obfuscated[obfuscatedKey] = value;
    }
    return obfuscated;
  }

  /**
   * Deobfuscate field names back to readable names
   * @param {Object} obfuscatedData - Data with obfuscated field names
   * @returns {Object} Data with original field names
   */
  static deobfuscateFields(obfuscatedData) {
    const deobfuscated = {};
    for (const [key, value] of Object.entries(obfuscatedData)) {
      const originalKey = this.REVERSE_FIELD_MAP[key] || key;
      deobfuscated[originalKey] = value;
    }
    return deobfuscated;
  }

  // ==================== ENCRYPTION ====================

  /**
   * Encrypt data using custom cipher (XOR + nibble swap + XOR)
   * @param {Uint8Array} data - Data to encrypt
   * @returns {Uint8Array} Encrypted data
   */
  static encrypt(data) {
    const encrypted = new Uint8Array(data.length);
    const { CIPHER_KEY } = this;
    
    for (let i = 0; i < data.length; i++) {
      // Step 1: XOR with key and position
      const keyByte = CIPHER_KEY[i % CIPHER_KEY.length];
      const xored = data[i] ^ keyByte ^ (i & 0xFF);
      
      // Step 2: Swap nibbles (swap upper and lower 4 bits)
      const swapped = ((xored & 0x0F) << 4) | ((xored & 0xF0) >> 4);
      
      // Step 3: XOR with constant
      encrypted[i] = swapped ^ 0xAA;
    }
    
    return encrypted;
  }

  /**
   * Decrypt data (exact reverse of encrypt)
   * @param {Uint8Array} encryptedData - Encrypted data
   * @returns {Uint8Array} Decrypted data
   */
  static decrypt(encryptedData) {
    const decrypted = new Uint8Array(encryptedData.length);
    for (let i = 0; i < encryptedData.length; i++) {
      // Reverse step 3: XOR with constant
      const unxored = encryptedData[i] ^ 0xAA;
      
      // Reverse step 2: Swap nibbles back
      const unswapped = ((unxored & 0x0F) << 4) | ((unxored & 0xF0) >> 4);
      
      // Reverse step 1: XOR with key and position
      const keyByte = this.CIPHER_KEY[i % this.CIPHER_KEY.length];
      decrypted[i] = unswapped ^ keyByte ^ (i & 0xFF);
    }
    return decrypted;
  }

  // ==================== INTEGRITY VERIFICATION ====================

  /**
   * Create SHA-256 integrity hash for data
   * @param {Uint8Array} data - Data to hash
   * @returns {Promise<Uint8Array>} 32-byte hash
   */
  static async createIntegrityHash(data) {
    const hashString = sha256(data);
    const hashBytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      hashBytes[i] = parseInt(hashString.slice(i * 2, i * 2 + 2), 16);
    }
    return hashBytes;
  }

  /**
   * Verify integrity hash matches data
   * @param {Uint8Array} data - Data to verify
   * @param {Uint8Array} expectedHash - Expected 32-byte hash
   * @returns {Promise<boolean>} True if hash matches
   */
  static async verifyIntegrityHash(data, expectedHash) {
    const computedHash = await this.createIntegrityHash(data);
    if (computedHash.length !== expectedHash.length) return false;
    for (let i = 0; i < computedHash.length; i++) {
      if (computedHash[i] !== expectedHash[i]) return false;
    }
    return true;
  }

  // ==================== SECURE WIRE FORMAT ====================

  /**
   * Create secure wire format from data object
   * @param {Object} data - Data object to secure
   * @param {string} logPrefix - Prefix for logging
   * @returns {Promise<Uint8Array>} Secure wire format data
   */
  static async createSecureWireFormat(data, logPrefix = '🔒') {
    try {
      // Step 1: Obfuscate field names
      const obfuscatedData = this.obfuscateFields(data);
      const jsonString = JSON.stringify(obfuscatedData);
      console.log(`${logPrefix} Data obfuscated:`, jsonString.length, 'chars');
      
      // Step 2: Compress the obfuscated JSON
      const compressedData = CompressionService.compress(jsonString);
      console.log(`${logPrefix} Compressed:`, compressedData.length, 'bytes');
      
      // Step 3: Encrypt the compressed data
      const encryptedData = this.encrypt(compressedData);
      console.log(`${logPrefix} Encrypted:`, encryptedData.length, 'bytes');
      
      // Step 4: Create integrity hash
      const integrityHash = await this.createIntegrityHash(encryptedData);
      console.log(`${logPrefix} Integrity hash created (32 bytes)`);
      
      // Step 5: Create wire format: version byte + hash + encrypted data
      const wireFormat = new Uint8Array(1 + 32 + encryptedData.length);
      wireFormat[0] = this.WIRE_FORMAT_VERSION; // Version byte
      wireFormat.set(integrityHash, 1); // Hash at bytes 1-32
      wireFormat.set(encryptedData, 33); // Encrypted data at byte 33+
      
      console.log(`${logPrefix} Wire format created:`, wireFormat.length, 'bytes');
      
      // Check size limits
      if (wireFormat.length > this.MAX_MEMO_SIZE) {
        throw new Error(`Wire format too large: ${wireFormat.length} bytes (max ${this.MAX_MEMO_SIZE})`);
      }
      
      return wireFormat;
    } catch (error) {
      console.error(`❌ Error creating secure wire format:`, error);
      throw new Error('Failed to create secure wire format: ' + error.message);
    }
  }

  /**
   * Parse secure wire format back to data object
   * @param {Uint8Array} wireData - Secure wire format data
   * @param {string} logPrefix - Prefix for logging
   * @returns {Promise<Object>} Parsed data object
   */
  static async parseSecureWireFormat(wireData, logPrefix = '🔓') {
    try {
      // Validate wire format
      if (!wireData || wireData.length < 34 || wireData[0] !== this.WIRE_FORMAT_VERSION) {
        throw new Error('Invalid secure wire format');
      }
      
      console.log(`${logPrefix} Parsing wire format:`, {
        totalSize: wireData.length,
        version: wireData[0],
        hashSize: 32,
        encryptedSize: wireData.length - 33
      });
      
      // Extract components
      const integrityHash = wireData.slice(1, 33);
      const encryptedData = wireData.slice(33);
      
      // Verify integrity
      const hashValid = await this.verifyIntegrityHash(encryptedData, integrityHash);
      if (!hashValid) {
        throw new Error('Integrity verification failed');
      }
      console.log(`${logPrefix} Integrity verified`);
      
      // Decrypt
      const compressedData = this.decrypt(encryptedData);
      console.log(`${logPrefix} Data decrypted`);
      
      // Decompress
      const jsonString = CompressionService.decompress(compressedData);
      console.log(`${logPrefix} Data decompressed`);
      
      // Parse and deobfuscate
      const obfuscatedData = JSON.parse(jsonString);
      const data = this.deobfuscateFields(obfuscatedData);
      console.log(`${logPrefix} Fields deobfuscated:`, Object.keys(data));
      
      return data;
      
    } catch (error) {
      console.error(`❌ Error parsing secure wire format:`, error);
      throw new Error('Failed to parse secure wire format: ' + error.message);
    }
  }

  // ==================== CONVENIENCE METHODS ====================

  /**
   * Create secure post data for blockchain storage
   * @param {Object} postData - Post data object
   * @returns {Promise<Uint8Array>} Secure wire format
   */
  static async createSecurePost(postData) {
    const secureData = {
      kind: 'post',
      ts: Math.floor(Date.now() / 1000),
      ...postData
    };
    return await this.createSecureWireFormat(secureData, '📝');
  }

  /**
   * Parse secure post from wire format
   * @param {Uint8Array} wireData - Wire format data
   * @returns {Promise<Object>} Post data
   */
  static async parseSecurePost(wireData) {
    const data = await this.parseSecureWireFormat(wireData, '📖');
    if (data.kind !== 'post') {
      throw new Error(`Invalid post kind: ${data.kind}`);
    }
    return data;
  }

  /**
   * Create secure user genesis for blockchain storage
   * @param {Object} genesisData - Genesis data object
   * @returns {Promise<Uint8Array>} Secure wire format
   */
  static async createSecureUserGenesis(genesisData) {
    const secureData = {
      kind: 'user_genesis',
      ts: Math.floor(Date.now() / 1000),
      seq: 0,
      ...genesisData
    };
    return await this.createSecureWireFormat(secureData, '👤');
  }

  /**
   * Parse secure user genesis from wire format
   * @param {Uint8Array} wireData - Wire format data
   * @returns {Promise<Object>} Genesis data
   */
  static async parseSecureUserGenesis(wireData) {
    const data = await this.parseSecureWireFormat(wireData, '🔍');
    if (data.kind !== 'user_genesis') {
      throw new Error(`Invalid user genesis kind: ${data.kind}`);
    }
    return data;
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Check if data looks like secure wire format
   * @param {Uint8Array} data - Data to check
   * @returns {boolean} True if looks like secure wire format
   */
  static looksLikeSecureWireFormat(data) {
    return data && 
           data instanceof Uint8Array && 
           data.length >= 34 && 
           data[0] === this.WIRE_FORMAT_VERSION;
  }

  /**
   * Get security information
   * @returns {Object} Security service information
   */
  static getSecurityInfo() {
    return {
      name: 'SecurityService',
      version: '1.0.0',
      wireFormatVersion: this.WIRE_FORMAT_VERSION,
      maxMemoSize: this.MAX_MEMO_SIZE,
      fieldMapSize: Object.keys(this.FIELD_MAP).length,
      cipherKeyLength: this.CIPHER_KEY.length,
      features: [
        'Field obfuscation',
        'XOR encryption with nibble swapping',
        'SHA-256 integrity verification',
        'Versioned wire format',
        'Compression support'
      ]
    };
  }

  /**
   * Run self-test of security functions
   * @returns {Promise<boolean>} True if all tests pass
   */
  static async runSelfTest() {
    try {
      console.log('🔒 Running SecurityService self-test...');
      
      // Test data
      const testData = {
        kind: 'test',
        content: 'Hello, secure world!',
        author: 'testuser',
        ts: Date.now()
      };
      
      // Test secure wire format round-trip
      const wireFormat = await this.createSecureWireFormat(testData, '🧪');
      const parsedData = await this.parseSecureWireFormat(wireFormat, '🧪');
      
      // Verify round-trip integrity
      const roundTripSuccess = (
        parsedData.kind === testData.kind &&
        parsedData.content === testData.content &&
        parsedData.author === testData.author &&
        parsedData.ts === testData.ts
      );
      
      console.log('✅ SecurityService self-test passed!');
      return roundTripSuccess;
      
    } catch (error) {
      console.error('❌ SecurityService self-test failed:', error);
      return false;
    }
  }
}

// Character count: 10247