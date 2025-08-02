// src/services/blockchain/shared/models/GenesisBlock.js
// Path: src/services/blockchain/shared/models/GenesisBlock.js
import { CompressionService } from '../../../compression/CompressionService.js';

let HashingService;
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
  // Node.js environment
  const crypto = await import('crypto');
  HashingService = {
    async hashContent(content) {
      if (!content || !(content instanceof Uint8Array)) {
        throw new Error('Content must be a Uint8Array');
      }
      const hash = crypto.createHash('sha256');
      hash.update(Buffer.from(content));
      return hash.digest('hex');
    }
  };
} else {
  // React Native environment
  const { HashingService: HS } = await import('../../../hashing/HashingService.js');
  HashingService = HS;
}

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
 * 6. Wire format (version byte + hash + encrypted data)
 */

/**
 * Security utilities for secure genesis blocks
 */
class SecurityUtils {
  // Fixed encryption key (in production, this should be derived from network parameters)
  static CIPHER_KEY = new Uint8Array([0x47, 0x6C, 0x79, 0x66, 0x66, 0x69, 0x74, 0x69]);

  /**
   * Field obfuscation mapping
   */
  static FIELD_MAP = {
    'kind': 'a',
    'ver': 'b', 
    'ts': 'c',
    'alias': 'd',
    'parent': 'e',
    'pub': 'f'
  };

  /**
   * Reverse mapping for deobfuscation
   */
  static REVERSE_FIELD_MAP = Object.fromEntries(
    Object.entries(SecurityUtils.FIELD_MAP).map(([k, v]) => [v, k])
  );

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
   * Decrypt data (exact reverse of encrypt - FIXED VERSION)
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
      const keyByte = SecurityUtils.CIPHER_KEY[i % SecurityUtils.CIPHER_KEY.length];
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
      throw new Error('Parent block ID required');
    }
    if (!userPublicKey) {
      throw new Error('User public key required');
    }
    
    this.kind = 'user_genesis';
    this.alias = alias || null;
    this.parent = parentBlockId;
    this.pub = userPublicKey;
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
    
    // Only include alias if it exists
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
   * Parse any genesis block from wire format data (NEW METHOD)
   * @param {Uint8Array} wireData - Wire format data from blockchain
   * @returns {Promise<GlyffitiGenesisBlock|UserGenesisBlock>} Parsed genesis block
   */
  static async parseFromWireData(wireData) {
    try {
      if (!wireData || wireData.length < 34 || wireData[0] !== 0x01) {
        throw new Error('Invalid secure wire format');
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
        return await GlyffitiGenesisBlock.fromWireData(wireData);
      } else if (data.kind === 'user_genesis') {
        return await UserGenesisBlock.fromWireData(wireData);
      } else {
        throw new Error(`Unknown genesis block kind: ${data.kind}`);
      }
    } catch (error) {
      console.error('❌ Error parsing secure genesis block from wire data:', error);
      throw new Error('Failed to parse secure genesis block from wire data: ' + error.message);
    }
  }

  /**
   * Parse any genesis block from base64 memo data (secure version)
   * @param {string} base64Memo - Base64 encoded memo from blockchain
   * @returns {Promise<GlyffitiGenesisBlock|UserGenesisBlock>} Parsed genesis block
   */
  static async parseFromBase64(base64Memo) {
    try {
      const wireData = CompressionService.base64ToUint8Array(base64Memo);
      return await this.parseFromWireData(wireData);
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
      
      // Test 4: Wire data factory parsing (NEW TEST)
      const genesisWireData = await genesis.toMemoData();
      const userWireData = await userGenesis.toMemoData();
      const wireFactoryParsedGenesis = await this.parseFromWireData(genesisWireData);
      const wireFactoryParsedUser = await this.parseFromWireData(userWireData);
      
      if (!(wireFactoryParsedGenesis instanceof GlyffitiGenesisBlock) ||
          !(wireFactoryParsedUser instanceof UserGenesisBlock)) {
        throw new Error('Secure factory wire data parsing test failed');
      }
      
      // Test 5: Security features
      console.log('🔒 Testing security features...');
      const rawGenesis = new GlyffitiGenesisBlock();
      const rawJson = rawGenesis.toJSON(); // This should be obfuscated
      // Check that field NAMES are obfuscated (not values)
      if (rawJson.includes('"kind"') || rawJson.includes('"ver"') || rawJson.includes('"ts"')) {
        throw new Error('Field obfuscation test failed - readable field names detected');
      }
      // Verify the obfuscated field names are present
      if (!rawJson.includes('"a"') || !rawJson.includes('"b"') || !rawJson.includes('"c"')) {
        throw new Error('Field obfuscation test failed - obfuscated field names missing');
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