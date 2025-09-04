// src/services/blockchain/shared/models/UgaGenesisBlock.js
// Path: src/services/blockchain/shared/models/UgaGenesisBlock.js

import { CompressionService } from '../../../compression/CompressionService.js';
import { sha256 } from 'js-sha256';

/**
 * ADR-006 User Graph Anchor Genesis Block Models
 * 
 * Implements the Genesis block structure defined in ADR-006 for the
 * User Graph Anchor (UGA) architecture. This includes:
 * - Glyffiti Genesis (G₀) - The platform root of trust
 * - User Genesis (U₀) - Per-user root binding to G₀
 * 
 * Security layers (same as original GenesisBlock.js):
 * 1. Field obfuscation
 * 2. JSON serialization  
 * 3. Compression (gzip)
 * 4. Encryption (XOR cipher + substitution)
 * 5. Integrity hash (SHA-256)
 * 6. Wire format (version byte + hash + encrypted data)
 */

/**
 * Domain separation constants for ADR-006
 * Each domain gets a unique 4-byte tag + null terminator
 */
const HASH_DOMAINS = {
  GLYFFITI_GENESIS: 'GGEN\x00',  // Glyffiti Genesis (G₀)
  USER_GENESIS: 'UGEN\x00',      // User Genesis (U₀) 
  USER_GRAPH_ROOT: 'UGR\x00',    // User Graph Root
  IDENTITY_ROOT: 'IDEN\x00',     // Identity Root
  LANE: 'LANE\x00',              // Lane roots
  CHUNK: 'CHNK\x00',             // Chunk roots
  ITEM: 'ITEM\x00'               // Individual items
};

/**
 * Lane types defined in ADR-006
 */
const LANE_TYPES = {
  POSTS: 0,
  REPLIES: 1,
  LIKES: 2,
  FOLLOWS: 3,
  STORIES: 4,
  PROFILE: 5,
  REVOCATIONS: 6,
  RESERVED: 7
};

/**
 * Universal HashingService with domain separation for ADR-006
 */
const HashingService = {
  /**
   * Hash content with domain separation as specified in ADR-006
   * @param {string} domain - Domain tag from HASH_DOMAINS
   * @param {Uint8Array|string} content - Content to hash
   * @returns {string} Hex hash
   */
  hashWithDomain(domain, content) {
    // Convert string to bytes if needed
    const contentBytes = typeof content === 'string' 
      ? new TextEncoder().encode(content)
      : content;
    
    // Concatenate domain tag and content
    const domainBytes = new TextEncoder().encode(domain);
    const combined = new Uint8Array(domainBytes.length + contentBytes.length);
    combined.set(domainBytes, 0);
    combined.set(contentBytes, domainBytes.length);
    
    // Hash with SHA-256 (will use BLAKE3 in production per ADR-006)
    return sha256(combined);
  },
  
  /**
   * Standard hash without domain separation (for compatibility)
   * @param {Uint8Array} content - Content to hash
   * @returns {string} Hex hash
   */
  async hashContent(content) {
    if (!content || !(content instanceof Uint8Array)) {
      throw new Error('Content must be a Uint8Array');
    }
    return sha256(content);
  }
};

/**
 * Security utilities (identical to original GenesisBlock.js)
 */
class SecurityUtils {
  static CIPHER_KEY = new Uint8Array([0x47, 0x6C, 0x79, 0x66, 0x66, 0x69, 0x74, 0x69]);

  static FIELD_MAP = {
  // Common fields - use random letters with no connection
  'kind': 'q',           
  'version': 'w',         
  'timestamp': 'r',      
  
  // G₀ specific
  'protocol': 'x',       
  'network': 'z',        
  'adr': 'b',           
  
  // U₀ specific  
  'username': 'c',       
  'parentGenesis': 'd',  
  'publicKey': 'f',      
  
  // UGA specific
  'identityRoot': 'g',   
  'userGraphRoot': 'h',   
  'epoch': 'j',          
  'prevUGA': 'k',        
  'lanes': 'm'           
};

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
 * Glyffiti Genesis Block (G₀) - ADR-006 compliant
 * The root of trust for the entire Glyffiti network
 */
export class GlyffitiGenesisBlockUGA {
  constructor(network = 'mainnet') {
    this.kind = 'glyffiti_genesis';
    this.version = '1.0.0';
    this.protocol = 'glyffiti-uga';
    this.network = network;
    this.timestamp = Math.floor(Date.now() / 1000);
    this.adr = '006';
  }

  /**
   * Calculate the genesis hash using domain separation
   * @returns {string} The G₀ hash
   */
  calculateHash() {
    const data = {
      kind: this.kind,
      version: this.version,
      protocol: this.protocol,
      network: this.network,
      timestamp: this.timestamp,
      adr: this.adr
    };
    
    const serialized = JSON.stringify(data, Object.keys(data).sort());
    return HashingService.hashWithDomain(HASH_DOMAINS.GLYFFITI_GENESIS, serialized);
  }

  toJSON() {
    const original = {
      kind: this.kind,
      version: this.version,
      protocol: this.protocol,
      network: this.network,
      timestamp: this.timestamp,
      adr: this.adr
    };
    const obfuscated = SecurityUtils.obfuscateFields(original);
    return JSON.stringify(obfuscated);
  }

  async toMemoData() {
    try {
      const jsonString = this.toJSON();
      console.log('🏗️ G₀ block (obfuscated):', jsonString);
      
      const compressedData = CompressionService.compress(jsonString);
      console.log('📦 Compressed size:', compressedData.length, 'bytes');
      
      const encryptedData = SecurityUtils.encrypt(compressedData);
      console.log('🔒 Encrypted size:', encryptedData.length, 'bytes');
      
      const integrityHash = await SecurityUtils.createIntegrityHash(encryptedData);
      console.log('🛡️ Integrity hash created (32 bytes)');
      
      const wireFormat = new Uint8Array(1 + 32 + encryptedData.length);
      wireFormat[0] = 0x01; // Version byte
      wireFormat.set(integrityHash, 1);
      wireFormat.set(encryptedData, 33);
      
      console.log('📡 Final wire format size:', wireFormat.length, 'bytes');
      
      if (wireFormat.length > 566) {
        throw new Error(`Genesis block too large: ${wireFormat.length} bytes (max 566)`);
      }
      
      return wireFormat;
    } catch (error) {
      console.error('❌ Error creating G₀ memo data:', error);
      throw new Error('Failed to create G₀ memo data: ' + error.message);
    }
  }

  async toBase64Memo() {
    const wireData = await this.toMemoData();
    return CompressionService.uint8ArrayToBase64(wireData);
  }

  static async fromWireData(wireData) {
    try {
      if (!wireData || wireData.length < 34) {
        throw new Error('Invalid wire data: too short');
      }
      
      if (wireData[0] !== 0x01) {
        throw new Error(`Unsupported version: ${wireData[0]}`);
      }
      
      const integrityHash = wireData.slice(1, 33);
      const encryptedData = wireData.slice(33);
      
      const hashValid = await SecurityUtils.verifyIntegrityHash(encryptedData, integrityHash);
      if (!hashValid) {
        throw new Error('Integrity hash verification failed');
      }
      
      const compressedData = SecurityUtils.decrypt(encryptedData);
      const jsonString = CompressionService.decompress(compressedData);
      const obfuscatedData = JSON.parse(jsonString);
      const data = SecurityUtils.deobfuscateFields(obfuscatedData);
      
      if (data.kind !== 'glyffiti_genesis') {
        throw new Error(`Invalid genesis kind: ${data.kind}`);
      }
      
      const genesis = new GlyffitiGenesisBlockUGA(data.network);
      genesis.version = data.version;
      genesis.protocol = data.protocol;
      genesis.timestamp = data.timestamp;
      genesis.adr = data.adr;
      
      return genesis;
    } catch (error) {
      console.error('❌ Error parsing G₀ from wire data:', error);
      throw new Error('Failed to parse G₀: ' + error.message);
    }
  }
}

/**
 * User Genesis Block (U₀) - ADR-006 compliant
 * Binds a user's identity to the Glyffiti Genesis
 */
export class UserGenesisBlockUGA {
  constructor(username, glyffitiGenesisHash, userPublicKey) {
    if (!username || !glyffitiGenesisHash || !userPublicKey) {
      throw new Error('All parameters required for User Genesis');
    }
    
    this.kind = 'user_genesis';
    this.username = username;
    this.parentGenesis = glyffitiGenesisHash;
    this.publicKey = userPublicKey;
    this.timestamp = Math.floor(Date.now() / 1000);
  }

  /**
   * Calculate the user genesis hash using domain separation
   * @returns {string} The U₀ hash
   */
  calculateHash() {
    const data = {
      kind: this.kind,
      username: this.username,
      parentGenesis: this.parentGenesis,
      publicKey: this.publicKey,
      timestamp: this.timestamp
    };
    
    const serialized = JSON.stringify(data, Object.keys(data).sort());
    return HashingService.hashWithDomain(HASH_DOMAINS.USER_GENESIS, serialized);
  }

  toJSON() {
    const original = {
      kind: this.kind,
      username: this.username,
      parentGenesis: this.parentGenesis,
      publicKey: this.publicKey,
      timestamp: this.timestamp
    };
    const obfuscated = SecurityUtils.obfuscateFields(original);
    return JSON.stringify(obfuscated);
  }

  async toMemoData() {
    try {
      const jsonString = this.toJSON();
      const compressedData = CompressionService.compress(jsonString);
      const encryptedData = SecurityUtils.encrypt(compressedData);
      const integrityHash = await SecurityUtils.createIntegrityHash(encryptedData);
      
      const wireFormat = new Uint8Array(1 + 32 + encryptedData.length);
      wireFormat[0] = 0x01;
      wireFormat.set(integrityHash, 1);
      wireFormat.set(encryptedData, 33);
      
      if (wireFormat.length > 566) {
        throw new Error(`User genesis too large: ${wireFormat.length} bytes`);
      }
      
      return wireFormat;
    } catch (error) {
      console.error('❌ Error creating U₀ memo data:', error);
      throw new Error('Failed to create U₀ memo data: ' + error.message);
    }
  }

  static async fromWireData(wireData) {
    try {
      if (!wireData || wireData.length < 34 || wireData[0] !== 0x01) {
        throw new Error('Invalid wire data');
      }
      
      const integrityHash = wireData.slice(1, 33);
      const encryptedData = wireData.slice(33);
      
      const hashValid = await SecurityUtils.verifyIntegrityHash(encryptedData, integrityHash);
      if (!hashValid) {
        throw new Error('Integrity verification failed');
      }
      
      const compressedData = SecurityUtils.decrypt(encryptedData);
      const jsonString = CompressionService.decompress(compressedData);
      const obfuscatedData = JSON.parse(jsonString);
      const data = SecurityUtils.deobfuscateFields(obfuscatedData);
      
      if (data.kind !== 'user_genesis') {
        throw new Error(`Invalid kind: ${data.kind}`);
      }
      
      const userGenesis = new UserGenesisBlockUGA(
        data.username,
        data.parentGenesis,
        data.publicKey
      );
      userGenesis.timestamp = data.timestamp;
      
      return userGenesis;
    } catch (error) {
      console.error('❌ Error parsing U₀:', error);
      throw new Error('Failed to parse U₀: ' + error.message);
    }
  }
}

/**
 * Factory for creating ADR-006 compliant genesis blocks
 */
export class UgaGenesisFactory {
  static createGlyffitiGenesis(network = 'mainnet') {
    console.log('🌟 Creating ADR-006 G₀ block');
    return new GlyffitiGenesisBlockUGA(network);
  }

  static createUserGenesis(username, glyffitiGenesisHash, userPublicKey) {
    console.log('👤 Creating ADR-006 U₀ block for:', username);
    return new UserGenesisBlockUGA(username, glyffitiGenesisHash, userPublicKey);
  }

  static async parseFromWireData(wireData) {
    try {
      if (!wireData || wireData.length < 34 || wireData[0] !== 0x01) {
        throw new Error('Invalid wire format');
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
      if (data.kind === 'glyffiti_genesis') {
        return await GlyffitiGenesisBlockUGA.fromWireData(wireData);
      } else if (data.kind === 'user_genesis') {
        return await UserGenesisBlockUGA.fromWireData(wireData);
      } else {
        throw new Error(`Unknown genesis block kind: ${data.kind}`);
      }
    } catch (error) {
      console.error('❌ Error parsing genesis block from wire data:', error);
      throw new Error('Failed to parse genesis block from wire data: ' + error.message);
    }
  }

  static async runSelfTest() {
    try {
      console.log('🧪 Running ADR-006 Genesis self-test...');
      
      // Test G₀
      const g0 = this.createGlyffitiGenesis('devnet');
      const g0Hash = g0.calculateHash();
      const g0Wire = await g0.toMemoData();
      const g0Parsed = await GlyffitiGenesisBlockUGA.fromWireData(g0Wire);
      
      if (g0Parsed.kind !== 'glyffiti_genesis') {
        throw new Error('G₀ test failed');
      }
      
      // Test U₀
      const u0 = this.createUserGenesis('testuser', g0Hash, 'testpubkey123');
      const u0Hash = u0.calculateHash();
      const u0Wire = await u0.toMemoData();
      const u0Parsed = await UserGenesisBlockUGA.fromWireData(u0Wire);
      
      if (u0Parsed.kind !== 'user_genesis') {
        throw new Error('U₀ test failed');
      }
      
      console.log('✅ ADR-006 Genesis self-test passed!');
      console.log(`📊 G₀ size: ${g0Wire.length} bytes, hash: ${g0Hash.substring(0, 16)}...`);
      console.log(`📊 U₀ size: ${u0Wire.length} bytes, hash: ${u0Hash.substring(0, 16)}...`);
      
      return true;
    } catch (error) {
      console.error('❌ ADR-006 self-test failed:', error);
      return false;
    }
  }
}

// Character count: 15,836