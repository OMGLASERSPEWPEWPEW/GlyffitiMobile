// src/services/blockchain/shared/models/GenesisBlock.js
// Path: src/services/blockchain/shared/models/GenesisBlock.js
import { CompressionService } from '../../../compression/CompressionService.js';
import { HashingService } from '../../../hashing/HashingService.js';

/**
 * Genesis Block Models for Glyffiti Social Network
 * Implements memo-only blockchain architecture with encrypted, compressed payloads
 * 
 * Security layers (applied in order):
 * 1. Field obfuscation (readable names → coded names)
 * 2. JSON serialization  
 * 3. Compression (gzip via CompressionService)
 * 4. Encryption (XOR cipher + substitution)
 * 5. Integrity hash (SHA-256)
 * 
 * Wire Format:
 * - byte[0] = 0x01 (payload version)
 * - byte[1-32] = integrity hash (32 bytes)
 * - byte[33..] = encrypted(compressed(obfuscated JSON))
 * - Keep total memo ≤ 566 bytes (Solana transaction limit with signature)
 */

// Security constants (obscured)
const CIPHER_KEY = new Uint8Array([0x47, 0x4C, 0x59, 0x46, 0x46, 0x49, 0x54, 0x49]); // "GLYFFITI"
const FIELD_MAP = {
  // Genesis fields
  kind: 'a', ver: 'b', ts: 'c',
  // User genesis fields  
  alias: 'd', parent: 'e', pub: 'f'
};
const REVERSE_FIELD_MAP = Object.fromEntries(Object.entries(FIELD_MAP).map(([k, v]) => [v, k]));

// Value obfuscation
const VALUE_MAP = {
  'glyf_genesis': 'gg',
  'user_genesis': 'ug'
};
const REVERSE_VALUE_MAP = Object.fromEntries(Object.entries(VALUE_MAP).map(([k, v]) => [v, k]));

/**
 * Security utilities for genesis block encryption/decryption
 */
class SecurityUtils {
  /**
   * Obfuscate field names and values in JSON object
   * @param {Object} obj - Object to obfuscate
   * @returns {Object} Obfuscated object
   */
  static obfuscateFields(obj) {
    const obfuscated = {};
    for (const [key, value] of Object.entries(obj)) {
      const obfuscatedKey = FIELD_MAP[key] || key;
      const obfuscatedValue = VALUE_MAP[value] || value;
      obfuscated[obfuscatedKey] = obfuscatedValue;
    }
    return obfuscated;
  }

  /**
   * Deobfuscate field names and values
   * @param {Object} obj - Obfuscated object  
   * @returns {Object} Original object
   */
  static deobfuscateFields(obj) {
    const deobfuscated = {};
    for (const [key, value] of Object.entries(obj)) {
      const originalKey = REVERSE_FIELD_MAP[key] || key;
      const originalValue = REVERSE_VALUE_MAP[value] || value;
      deobfuscated[originalKey] = originalValue;
    }
    return deobfuscated;
  }

  /**
   * Encrypt data using XOR cipher with key rotation and substitution (FIXED VERSION)
   * @param {Uint8Array} data - Data to encrypt
   * @returns {Uint8Array} Encrypted data
   */
  static encrypt(data) {
    const encrypted = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      const keyByte = CIPHER_KEY[i % CIPHER_KEY.length];
      // Step 1: XOR with key and position  
      const xored = data[i] ^ keyByte ^ (i & 0xFF);
      // Step 2: Swap nibbles
      const swapped = ((xored & 0x0F) << 4) | ((xored & 0xF0) >> 4);
      // Step 3: XOR with constant
      encrypted[i] = swapped ^ 0xAA;
    }
    return encrypted;
  }

  /**
   * Decrypt data (reverse of encrypt - FIXED VERSION)
   * @param {Uint8Array} encryptedData - Encrypted data
   * @returns {Uint8Array} Decrypted data
   */
  static decrypt(encryptedData) {
    const decrypted = new Uint8Array(encryptedData.length);
    for (let i = 0; i < encryptedData.length; i++) {
      // Step 3 reverse: XOR with constant
      const unxored = encryptedData[i] ^ 0xAA;
      // Step 2 reverse: Swap nibbles back
      const unswapped = ((unxored & 0x0F) << 4) | ((unxored & 0xF0) >> 4);
      // Step 1 reverse: XOR with key and position
      const keyByte = CIPHER_KEY[i % CIPHER_KEY.length];
      decrypted[i] = unswapped ^ keyByte ^ (i & 0xFF);
    }
    return decrypted;
  }

  /**
   * Create integrity hash of data
   * @param {Uint8Array} data - Data to hash
   * @returns {Promise<Uint8Array>} 32-byte hash
   */
  static async createIntegrityHash(data) {
    const hashString = await HashingService.hashContent(data);
    // Convert hex string to bytes (HashingService returns hex)
    const hashBytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      hashBytes[i] = parseInt(hashString.slice(i * 2, i * 2 + 2), 16);
    }
    return hashBytes;
  }

  /**
   * Verify integrity hash
   * @param {Uint8Array} data - Data to verify
   * @param {Uint8Array} expectedHash - Expected hash bytes
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
}

/**
 * Global Glyffiti Genesis Block - Created once for the entire network
 * This is the root of all social graph operations (encrypted and obfuscated)
 */
export class GlyffitiGenesisBlock {
  constructor() {
    this.kind = 'glyf_genesis';
    this.ver = 1;
    this.ts = Math.floor(Date.now() / 1000);
  }

  /**
   * Convert to obfuscated JSON string for compression
   * @returns {string} Obfuscated JSON representation
   */
  toJSON() {
    const original = {
      kind: this.kind,
      ver: this.ver,
      ts: this.ts
    };
    const obfuscated = SecurityUtils.obfuscateFields(original);
    return JSON.stringify(obfuscated);
  }

  /**
   * Create encrypted, compressed memo data with integrity hash
   * @returns {Promise<Uint8Array>} Wire format data ready for blockchain memo
   */
  async toMemoData() {
    try {
      const jsonString = this.toJSON();
      console.log('🏗️ Genesis block (obfuscated):', jsonString);
      
      // Step 1: Compress the obfuscated JSON
      const compressedData = CompressionService.compress(jsonString);
      console.log('📦 Compressed size:', compressedData.length, 'bytes');
      
      // Step 2: Encrypt the compressed data
      const encryptedData = SecurityUtils.encrypt(compressedData);
      console.log('🔒 Encrypted size:', encryptedData.length, 'bytes');
      
      // Step 3: Create integrity hash
      const integrityHash = await SecurityUtils.createIntegrityHash(encryptedData);
      console.log('🛡️ Integrity hash created (32 bytes)');
      
      // Step 4: Create wire format: version byte + hash + encrypted data
      const wireFormat = new Uint8Array(1 + 32 + encryptedData.length);
      wireFormat[0] = 0x01; // Version byte
      wireFormat.set(integrityHash, 1); // Hash at bytes 1-32
      wireFormat.set(encryptedData, 33); // Encrypted data at byte 33+
      
      console.log('📡 Final wire format size:', wireFormat.length, 'bytes');
      
      if (wireFormat.length > 566) {
        throw new Error(`Genesis block too large: ${wireFormat.length} bytes (max 566)`);
      }
      
      return wireFormat;
    } catch (error) {
      console.error('❌ Error creating secure genesis memo data:', error);
      throw new Error('Failed to create secure genesis memo data: ' + error.message);
    }
  }

  /**
   * Convert wire format data to base64 for blockchain storage
   * @returns {Promise<string>} Base64 encoded wire format data
   */
  async toBase64Memo() {
    try {
      const wireData = await this.toMemoData();
      return CompressionService.uint8ArrayToBase64(wireData);
    } catch (error) {
      console.error('❌ Error creating base64 memo:', error);
      throw new Error('Failed to create base64 memo: ' + error.message);
    }
  }

  /**
   * Parse genesis block from encrypted wire format data
   * @param {Uint8Array} wireData - Wire format data from blockchain
   * @returns {Promise<GlyffitiGenesisBlock>} Parsed genesis block
   */
  static async fromWireData(wireData) {
    try {
      if (!wireData || wireData.length < 34) { // version(1) + hash(32) + min data(1)
        throw new Error('Invalid wire data: too short for secure format');
      }
      
      // Check version byte
      if (wireData[0] !== 0x01) {
        throw new Error(`Unsupported version: ${wireData[0]} (expected 0x01)`);
      }
      
      // Extract components
      const integrityHash = wireData.slice(1, 33); // bytes 1-32
      const encryptedData = wireData.slice(33);     // byte 33+
      
      console.log('🔍 Parsing secure genesis:', {
        totalSize: wireData.length,
        hashSize: integrityHash.length,
        encryptedSize: encryptedData.length
      });
      
      // Verify integrity hash
      const hashValid = await SecurityUtils.verifyIntegrityHash(encryptedData, integrityHash);
      if (!hashValid) {
        throw new Error('Integrity hash verification failed - data may be corrupted');
      }
      console.log('✅ Integrity hash verified');
      
      // Decrypt the data
      const compressedData = SecurityUtils.decrypt(encryptedData);
      console.log('🔓 Data decrypted');
      
      // Decompress the data  
      const jsonString = CompressionService.decompress(compressedData);
      console.log('📦 Data decompressed');
      
      // Parse and deobfuscate JSON
      const obfuscatedData = JSON.parse(jsonString);
      const data = SecurityUtils.deobfuscateFields(obfuscatedData);
      console.log('🔍 Fields deobfuscated:', data);
      
      // Validate structure
      if (data.kind !== 'glyf_genesis') {
        throw new Error(`Invalid genesis kind: ${data.kind}`);
      }
      
      // Create genesis block instance
      const genesis = new GlyffitiGenesisBlock();
      genesis.ver = data.ver;
      genesis.ts = data.ts;
      
      return genesis;
    } catch (error) {
      console.error('❌ Error parsing secure genesis from wire data:', error);
      throw new Error('Failed to parse secure genesis block: ' + error.message);
    }
  }

  /**
   * Parse genesis block from base64 memo data
   * @param {string} base64Memo - Base64 encoded memo from blockchain
   * @returns {Promise<GlyffitiGenesisBlock>} Parsed genesis block
   */
  static async fromBase64Memo(base64Memo) {
    try {
      const wireData = CompressionService.base64ToUint8Array(base64Memo);
      return await this.fromWireData(wireData);
    } catch (error) {
      console.error('❌ Error parsing genesis from base64:', error);
      throw new Error('Failed to parse genesis from base64: ' + error.message);
    }
  }
}

/**
 * User Genesis Block - Links user account to global Glyffiti genesis (encrypted and obfuscated)
 * Each user creates exactly one of these when joining the network
 */
export class UserGenesisBlock {
  constructor(alias, parentBlockId, userPublicKey) {
    if (!parentBlockId) {
      throw new Error('Parent block ID (Glyffiti genesis hash) is required');
    }
    if (!userPublicKey) {
      throw new Error('User public key is required');
    }
    
    this.kind = 'user_genesis';
    this.alias = alias || null;           // optional, non-unique display name
    this.parent = parentBlockId;          // GLYF_GENESIS transaction hash
    this.pub = userPublicKey;             // base58 Ed25519 public key
    this.ts = Math.floor(Date.now() / 1000);
  }

  /**
   * Convert to obfuscated JSON string for compression
   * @returns {string} Obfuscated JSON representation
   */
  toJSON() {
    const original = {
      kind: this.kind,
      parent: this.parent,
      pub: this.pub,
      ts: this.ts
    };
    
    // Only include alias if provided
    if (this.alias) {
      original.alias = this.alias;
    }
    
    const obfuscated = SecurityUtils.obfuscateFields(original);
    return JSON.stringify(obfuscated);
  }

  /**
   * Create encrypted, compressed memo data with integrity hash
   * @returns {Promise<Uint8Array>} Wire format data ready for blockchain memo
   */
  async toMemoData() {
    try {
      const jsonString = this.toJSON();
      console.log('🏗️ User genesis (obfuscated):', jsonString);
      
      // Step 1: Compress the obfuscated JSON
      const compressedData = CompressionService.compress(jsonString);
      console.log('📦 Compressed size:', compressedData.length, 'bytes');
      
      // Step 2: Encrypt the compressed data
      const encryptedData = SecurityUtils.encrypt(compressedData);
      console.log('🔒 Encrypted size:', encryptedData.length, 'bytes');
      
      // Step 3: Create integrity hash
      const integrityHash = await SecurityUtils.createIntegrityHash(encryptedData);
      console.log('🛡️ Integrity hash created (32 bytes)');
      
      // Step 4: Create wire format: version byte + hash + encrypted data
      const wireFormat = new Uint8Array(1 + 32 + encryptedData.length);
      wireFormat[0] = 0x01; // Version byte
      wireFormat.set(integrityHash, 1); // Hash at bytes 1-32
      wireFormat.set(encryptedData, 33); // Encrypted data at byte 33+
      
      console.log('📡 Final wire format size:', wireFormat.length, 'bytes');
      
      if (wireFormat.length > 566) {
        throw new Error(`User genesis block too large: ${wireFormat.length} bytes (max 566)`);
      }
      
      return wireFormat;
    } catch (error) {
      console.error('❌ Error creating secure user genesis memo data:', error);
      throw new Error('Failed to create secure user genesis memo data: ' + error.message);
    }
  }

  /**
   * Convert wire format data to base64 for blockchain storage
   * @returns {Promise<string>} Base64 encoded wire format data
   */
  async toBase64Memo() {
    try {
      const wireData = await this.toMemoData();
      return CompressionService.uint8ArrayToBase64(wireData);
    } catch (error) {
      console.error('❌ Error creating base64 memo:', error);
      throw new Error('Failed to create base64 memo: ' + error.message);
    }
  }

  /**
   * Parse user genesis block from encrypted wire format data
   * @param {Uint8Array} wireData - Wire format data from blockchain
   * @returns {Promise<UserGenesisBlock>} Parsed user genesis block
   */
  static async fromWireData(wireData) {
    try {
      if (!wireData || wireData.length < 34) { // version(1) + hash(32) + min data(1)
        throw new Error('Invalid wire data: too short for secure format');
      }
      
      // Check version byte
      if (wireData[0] !== 0x01) {
        throw new Error(`Unsupported version: ${wireData[0]} (expected 0x01)`);
      }
      
      // Extract components
      const integrityHash = wireData.slice(1, 33); // bytes 1-32
      const encryptedData = wireData.slice(33);     // byte 33+
      
      console.log('🔍 Parsing secure user genesis:', {
        totalSize: wireData.length,
        hashSize: integrityHash.length,
        encryptedSize: encryptedData.length
      });
      
      // Verify integrity hash
      const hashValid = await SecurityUtils.verifyIntegrityHash(encryptedData, integrityHash);
      if (!hashValid) {
        throw new Error('Integrity hash verification failed - data may be corrupted');
      }
      console.log('✅ Integrity hash verified');
      
      // Decrypt the data
      const compressedData = SecurityUtils.decrypt(encryptedData);
      console.log('🔓 Data decrypted');
      
      // Decompress the data
      const jsonString = CompressionService.decompress(compressedData);
      console.log('📦 Data decompressed');
      
      // Parse and deobfuscate JSON
      const obfuscatedData = JSON.parse(jsonString);
      const data = SecurityUtils.deobfuscateFields(obfuscatedData);
      console.log('🔍 Fields deobfuscated:', { ...data, pub: data.pub?.slice(0, 8) + '...' });
      
      // Validate structure
      if (data.kind !== 'user_genesis') {
        throw new Error(`Invalid user genesis kind: ${data.kind}`);
      }
      
      if (!data.parent || !data.pub) {
        throw new Error('Missing required fields: parent or pub');
      }
      
      // Create user genesis block instance
      const userGenesis = new UserGenesisBlock(data.alias, data.parent, data.pub);
      userGenesis.ts = data.ts;
      
      return userGenesis;
    } catch (error) {
      console.error('❌ Error parsing secure user genesis from wire data:', error);
      throw new Error('Failed to parse secure user genesis block: ' + error.message);
    }
  }

  /**
   * Parse user genesis block from base64 memo data
   * @param {string} base64Memo - Base64 encoded memo from blockchain
   * @returns {Promise<UserGenesisBlock>} Parsed user genesis block
   */
  static async fromBase64Memo(base64Memo) {
    try {
      const wireData = CompressionService.base64ToUint8Array(base64Memo);
      return await this.fromWireData(wireData);
    } catch (error) {
      console.error('❌ Error parsing user genesis from base64:', error);
      throw new Error('Failed to parse user genesis from base64: ' + error.message);
    }
  }
}

/**
 * Genesis Block Factory - Utility for creating and parsing secure genesis blocks
 */
export class GenesisBlockFactory {
  /**
   * Create the global Glyffiti genesis block
   * @returns {GlyffitiGenesisBlock} New global genesis block
   */
  static createGlyffitiGenesis() {
    console.log('🌟 Creating Secure Glyffiti Genesis Block');
    return new GlyffitiGenesisBlock();
  }

  /**
   * Create a user genesis block that links to the global genesis
   * @param {string} alias - Optional display name
   * @param {string} glyffitiGenesisHash - Transaction hash of global genesis
   * @param {string} userPublicKey - User's Ed25519 public key (base58)
   * @returns {UserGenesisBlock} New user genesis block
   */
  static createUserGenesis(alias, glyffitiGenesisHash, userPublicKey) {
    console.log('👤 Creating Secure User Genesis Block for:', alias || 'anonymous');
    return new UserGenesisBlock(alias, glyffitiGenesisHash, userPublicKey);
  }

  /**
   * Parse any genesis block from base64 memo data (secure version)
   * @param {string} base64Memo - Base64 encoded memo from blockchain
   * @returns {Promise<GlyffitiGenesisBlock|UserGenesisBlock>} Parsed genesis block
   */
  static async parseFromBase64(base64Memo) {
    try {
      const wireData = CompressionService.base64ToUint8Array(base64Memo);
      
      if (wireData.length < 34 || wireData[0] !== 0x01) {
        throw new Error(`Invalid secure wire format`);
      }
      
      // Extract and decrypt to peek at the kind
      const integrityHash = wireData.slice(1, 33);
      const encryptedData = wireData.slice(33);
      
      // Verify integrity
      const hashValid = await SecurityUtils.verifyIntegrityHash(encryptedData, integrityHash);
      if (!hashValid) {
        throw new Error('Integrity verification failed');
      }
      
      // Decrypt and decompress to peek at type
      const compressedData = SecurityUtils.decrypt(encryptedData);
      const jsonString = CompressionService.decompress(compressedData);
      const obfuscatedData = JSON.parse(jsonString);
      const data = SecurityUtils.deobfuscateFields(obfuscatedData);
      
      // Route to appropriate parser based on kind
      if (data.kind === 'glyf_genesis') {
        return await GlyffitiGenesisBlock.fromBase64Memo(base64Memo);
      } else if (data.kind === 'user_genesis') {
        return await UserGenesisBlock.fromBase64Memo(base64Memo);
      } else {
        throw new Error(`Unknown genesis block kind: ${data.kind}`);
      }
    } catch (error) {
      console.error('❌ Error parsing secure genesis block:', error);
      throw new Error('Failed to parse secure genesis block: ' + error.message);
    }
  }

  /**
   * Run self-test to verify secure genesis block functionality
   * @returns {Promise<boolean>} True if all tests pass
   */
  static async runSelfTest() {
    try {
      console.log('🧪 Running Secure Genesis Block self-test...');
      
      // Test 1: Create and parse Glyffiti Genesis
      const genesis = this.createGlyffitiGenesis();
      const genesisBase64 = await genesis.toBase64Memo();
      const parsedGenesis = await GlyffitiGenesisBlock.fromBase64Memo(genesisBase64);
      
      if (parsedGenesis.kind !== 'glyf_genesis' || parsedGenesis.ver !== 1) {
        throw new Error('Secure Glyffiti genesis test failed');
      }
      
      // Test 2: Create and parse User Genesis
      const userGenesis = this.createUserGenesis('testuser', 'mock_genesis_hash', 'mock_public_key');
      const userBase64 = await userGenesis.toBase64Memo();
      const parsedUser = await UserGenesisBlock.fromBase64Memo(userBase64);
      
      if (parsedUser.kind !== 'user_genesis' || parsedUser.alias !== 'testuser') {
        throw new Error('Secure user genesis test failed');
      }
      
      // Test 3: Factory parsing
      const factoryParsedGenesis = await this.parseFromBase64(genesisBase64);
      const factoryParsedUser = await this.parseFromBase64(userBase64);
      
      if (!(factoryParsedGenesis instanceof GlyffitiGenesisBlock) ||
          !(factoryParsedUser instanceof UserGenesisBlock)) {
        throw new Error('Secure factory parsing test failed');
      }
      
      // Test 4: Security features
      console.log('🔒 Testing security features...');
      const rawGenesis = new GlyffitiGenesisBlock();
      const rawJson = rawGenesis.toJSON(); // This should be obfuscated
      if (rawJson.includes('glyf_genesis') || rawJson.includes('kind')) {
        throw new Error('Field obfuscation test failed - readable fields detected');
      }
      
      console.log('✅ Secure Genesis Block self-test passed!');
      console.log(`📊 Secure genesis memo size: ${genesisBase64.length} chars`);
      console.log(`📊 Secure user genesis memo size: ${userBase64.length} chars`);
      console.log('🔒 Security features: Compression + Encryption + Field Obfuscation + Integrity Hash');
      
      return true;
    } catch (error) {
      console.error('❌ Secure Genesis Block self-test failed:', error);
      return false;
    }
  }
}

// Character count: 19,347