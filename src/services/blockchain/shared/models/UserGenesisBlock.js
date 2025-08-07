// src/services/blockchain/shared/models/UserGenesisBlock.js
// Path: src/services/blockchain/shared/models/UserGenesisBlock.js

import { CompressionService } from '../../../compression/CompressionService.js';
import { sha256 } from 'js-sha256';

/**
 * User Genesis Block Model for Glyffiti Social Network
 * 
 * This extends the genesis pattern but specifically for user accounts.
 * Each user has exactly one genesis block that links to the global Glyffiti genesis.
 * 
 * Data flow:
 * 1. User creates keypair locally
 * 2. User genesis links to Glyffiti genesis hash 
 * 3. All user posts link back to their user genesis
 * 4. This forms a hash chain: Glyffiti Genesis -> User Genesis -> Posts
 */

/**
 * Universal HashingService using js-sha256
 */
const HashingService = {
  async hashContent(content) {
    if (!content || !(content instanceof Uint8Array)) {
      throw new Error('Content must be a Uint8Array');
    }
    const hashHex = sha256(content);
    return hashHex;
  }
};

/**
 * Security utilities (matching GenesisBlock.js patterns)
 */
class SecurityUtils {
  // Fixed encryption key - matches GenesisBlock.js
  static CIPHER_KEY = new Uint8Array([0x47, 0x6C, 0x79, 0x66, 0x66, 0x69, 0x74, 0x69]);

  /**
   * Field obfuscation mapping - matches GenesisBlock.js
   */
  static FIELD_MAP = {
    'kind': 'a',
    'ver': 'b', 
    'ts': 'c',
    'alias': 'd',
    'parent': 'e',
    'pub': 'f',
    'seq': 'g',     // For post sequence numbers
    'prev': 'h',     // For previous post hash
    'text': 'i'      // For post text content
  };

  /**
   * Reverse mapping for deobfuscation
   */
  static REVERSE_FIELD_MAP = Object.fromEntries(
    Object.entries(SecurityUtils.FIELD_MAP).map(([k, v]) => [v, k])
  );

  static obfuscateFields(data) {
    const obfuscated = {};
    for (const [key, value] of Object.entries(data)) {
      const obfuscatedKey = this.FIELD_MAP[key] || key;
      obfuscated[obfuscatedKey] = value;
    }
    return obfuscated;
  }

  static deobfuscateFields(obfuscatedData) {
    const deobfuscated = {};
    for (const [key, value] of Object.entries(obfuscatedData)) {
      const originalKey = this.REVERSE_FIELD_MAP[key] || key;
      deobfuscated[originalKey] = value;
    }
    return deobfuscated;
  }

  static encrypt(data) {
    const encrypted = new Uint8Array(data.length);
    const { CIPHER_KEY } = this;
    
    for (let i = 0; i < data.length; i++) {
      const keyByte = CIPHER_KEY[i % CIPHER_KEY.length];
      const xored = data[i] ^ keyByte ^ (i & 0xFF);
      const swapped = ((xored & 0x0F) << 4) | ((xored & 0xF0) >> 4);
      encrypted[i] = swapped ^ 0xAA;
    }
    
    return encrypted;
  }

  static decrypt(encryptedData) {
    const decrypted = new Uint8Array(encryptedData.length);
    for (let i = 0; i < encryptedData.length; i++) {
      const unxored = encryptedData[i] ^ 0xAA;
      const unswapped = ((unxored & 0x0F) << 4) | ((unxored & 0xF0) >> 4);
      const keyByte = SecurityUtils.CIPHER_KEY[i % SecurityUtils.CIPHER_KEY.length];
      decrypted[i] = unswapped ^ keyByte ^ (i & 0xFF);
    }
    return decrypted;
  }

  static async createIntegrityHash(data) {
    const hashString = await HashingService.hashContent(data);
    const hashBytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      hashBytes[i] = parseInt(hashString.slice(i * 2, i * 2 + 2), 16);
    }
    return hashBytes;
  }

  static async verifyIntegrityHash(data, expectedHash) {
    const computedHash = await this.createIntegrityHash(data);
    if (computedHash.length !== expectedHash.length) return false;
    for (let i = 0; i < computedHash.length; i++) {
      if (computedHash[i] !== expectedHash[i]) return false;
    }
    return true;
  }
}

/**
 * User Genesis Block - Each user's entry point into the Glyffiti network
 */
export class UserGenesisBlock {
  /**
   * Create a new user genesis block
   * @param {string} alias - Username/display name (required for MVP)
   * @param {string} parentBlockId - Glyffiti genesis transaction hash
   * @param {string} userPublicKey - User's Ed25519 public key (base58)
   */
  constructor(alias, parentBlockId, userPublicKey) {
    if (!alias || alias.length < 1) {
      throw new Error('Username is required for user genesis');
    }
    if (!parentBlockId) {
      throw new Error('Parent block ID (Glyffiti genesis hash) is required');
    }
    if (!userPublicKey) {
      throw new Error('User public key is required');
    }
    
    // Validate alias length for memo constraints
    if (alias.length > 32) {
      throw new Error('Username too long (max 32 characters)');
    }
    
    this.kind = 'user_genesis';
    this.alias = alias;
    this.parent = parentBlockId;
    this.pub = userPublicKey;
    this.ts = Math.floor(Date.now() / 1000);
    this.seq = 0; // Genesis is sequence 0, first post is 1, etc.
  }

  /**
   * Convert to obfuscated JSON for compression
   */
  toJSON() {
    const original = {
      kind: this.kind,
      alias: this.alias,
      parent: this.parent,
      pub: this.pub,
      ts: this.ts,
      seq: this.seq
    };
    
    const obfuscated = SecurityUtils.obfuscateFields(original);
    return JSON.stringify(obfuscated);
  }

  /**
   * Create secure wire format for memo field
   * @returns {Promise<Uint8Array>} Encrypted, compressed wire data
   */
  async toMemoData() {
    try {
      const jsonString = this.toJSON();
      console.log('👤 User genesis (obfuscated):', jsonString);
      
      // Compress
      const compressedData = CompressionService.compress(jsonString);
      console.log('📦 Compressed:', compressedData.length, 'bytes');
      
      // Encrypt
      const encryptedData = SecurityUtils.encrypt(compressedData);
      console.log('🔒 Encrypted:', encryptedData.length, 'bytes');
      
      // Create integrity hash
      const integrityHash = await SecurityUtils.createIntegrityHash(encryptedData);
      console.log('🛡️ Integrity hash created');
      
      // Wire format: version(1) + hash(32) + encrypted data
      const wireFormat = new Uint8Array(1 + 32 + encryptedData.length);
      wireFormat[0] = 0x01; // Version
      wireFormat.set(integrityHash, 1);
      wireFormat.set(encryptedData, 33);
      
      console.log('📡 Wire format:', wireFormat.length, 'bytes');
      
      if (wireFormat.length > 566) {
        throw new Error(`User genesis too large: ${wireFormat.length} bytes (max 566)`);
      }
      
      return wireFormat;
    } catch (error) {
      console.error('❌ Error creating user genesis memo:', error);
      throw error;
    }
  }

  /**
   * Convert to base64 for display/storage
   */
  async toBase64Memo() {
    const wireData = await this.toMemoData();
    return CompressionService.uint8ArrayToBase64(wireData);
  }

  /**
   * Parse user genesis from wire data
   * @param {Uint8Array} wireData - Raw wire format data
   * @returns {Promise<UserGenesisBlock>} Parsed user genesis
   */
  static async fromWireData(wireData) {
    try {
      // Validate wire format
      if (!wireData || wireData.length < 34) {
        throw new Error('Invalid wire data');
      }
      if (wireData[0] !== 0x01) {
        throw new Error(`Unsupported version: ${wireData[0]}`);
      }
      
      // Extract components
      const integrityHash = wireData.slice(1, 33);
      const encryptedData = wireData.slice(33);
      
      // Verify integrity
      const hashValid = await SecurityUtils.verifyIntegrityHash(encryptedData, integrityHash);
      if (!hashValid) {
        throw new Error('Integrity check failed');
      }
      
      // Decrypt
      const compressedData = SecurityUtils.decrypt(encryptedData);
      
      // Decompress
      const jsonString = CompressionService.decompress(compressedData);
      
      // Parse and deobfuscate
      const obfuscatedData = JSON.parse(jsonString);
      const data = SecurityUtils.deobfuscateFields(obfuscatedData);
      
      // Validate it's a user genesis
      if (data.kind !== 'user_genesis') {
        throw new Error(`Invalid kind: ${data.kind}`);
      }
      
      // Create instance
      const userGenesis = new UserGenesisBlock(
        data.alias,
        data.parent,
        data.pub
      );
      userGenesis.ts = data.ts;
      userGenesis.seq = data.seq || 0;
      
      return userGenesis;
    } catch (error) {
      console.error('❌ Error parsing user genesis:', error);
      throw error;
    }
  }

  /**
   * Get display info for UI
   */
  getDisplayInfo() {
    return {
      username: this.alias,
      publicKey: this.pub,
      joinedAt: new Date(this.ts * 1000),
      parentGenesis: this.parent,
      sequence: this.seq
    };
  }

  /**
   * Run self-test
   */
  static async runSelfTest() {
    try {
      console.log('🧪 Testing UserGenesisBlock...');
      
      // Create test user
      const user = new UserGenesisBlock(
        'testuser',
        'mock_genesis_hash',
        'mock_public_key'
      );
      
      // Test wire format
      const wireData = await user.toMemoData();
      console.log(`📊 Wire size: ${wireData.length} bytes`);
      
      // Test parsing
      const parsed = await UserGenesisBlock.fromWireData(wireData);
      
      // Verify fields
      if (parsed.alias !== user.alias || 
          parsed.parent !== user.parent ||
          parsed.pub !== user.pub) {
        throw new Error('Field mismatch after parsing');
      }
      
      console.log('✅ UserGenesisBlock test passed!');
      return true;
    } catch (error) {
      console.error('❌ UserGenesisBlock test failed:', error);
      return false;
    }
  }
}

// Character count: 9,823