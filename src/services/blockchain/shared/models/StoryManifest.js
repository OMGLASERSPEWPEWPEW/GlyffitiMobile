// src/services/blockchain/shared/models/StoryManifest.js
// Path: src/services/blockchain/shared/models/StoryManifest.js

/**
 * StoryManifest - Data model for the 3-Tier Manifest Tree Architecture
 * 
 * Primary Manifest contains a single manifestRoot hash instead of all chunk hashes.
 * This makes the manifest fixed-size and enables scalable content of any length.
 * 
 * Based on ADR-003: Manifest-Based Publishing Architecture (3-Tier Enhancement)
 */

import { HashingService } from '../../../hashing/HashingService';

export class StoryManifest {
  /**
   * Create a new StoryManifest instance
   * @param {Object} options - Manifest configuration options
   * @param {string} options.title - Story title
   * @param {string} options.authorPublicKey - Author's public key
   * @param {string} options.authorUsername - Author's username (optional)
   * @param {string} options.manifestRoot - Single hash root of all chunk hashes
   * @param {number} options.totalContentChunks - Total number of content chunks
   * @param {number} options.totalHashListChunks - Total number of hash list chunks
   * @param {Object} options.metadata - Additional story metadata
   * @param {string[]} options.tags - Story tags for discovery
   * @param {number|null} options.reGlyphCap - Maximum re-glyph count (creator-controlled scarcity)
   */
  constructor(options = {}) {
    console.log('StoryManifest.js: constructor: Creating new 3-tier manifest');
    
    // Required fields
    this.title = options.title || '';
    this.authorPublicKey = options.authorPublicKey || '';
    this.manifestRoot = options.manifestRoot || ''; // Single hash instead of array
    
    // Content structure
    this.totalContentChunks = options.totalContentChunks || 0;
    this.totalHashListChunks = options.totalHashListChunks || 0;
    
    // Optional author info
    this.authorUsername = options.authorUsername || null;
    
    // Timestamps
    this.createdAt = options.createdAt || Date.now();
    this.publishedAt = options.publishedAt || null;
    
    // Content metadata
    this.estimatedReadTime = options.estimatedReadTime || this._calculateReadTime(options.contentLength);
    this.contentLength = options.contentLength || 0;
    
    // Discovery and categorization
    this.tags = options.tags || [];
    this.genre = options.genre || null;
    this.language = options.language || 'en';
    
    // Creator economy features
    this.reGlyphCap = options.reGlyphCap || null; // null = unlimited
    this.currentReGlyphCount = options.currentReGlyphCount || 0;
    
    // Blockchain identifiers (set after publishing)
    this.storyId = options.storyId || null; // Transaction signature of manifest publication
    this.manifestTransactionId = options.manifestTransactionId || null;
    
    // Version and protocol
    this.version = options.version || '1.0.0';
    this.protocol = 'glyffiti-manifest-tree-v1';
    
    // Additional metadata
    this.metadata = {
      previewText: options.previewText || '',
      isNSFW: options.isNSFW || false,
      license: options.license || 'CC0',
      ...options.metadata
    };
    
    console.log('StoryManifest.js: constructor: 3-tier manifest created');
    console.log('StoryManifest.js: constructor: Content chunks:', this.totalContentChunks);
    console.log('StoryManifest.js: constructor: Hash list chunks:', this.totalHashListChunks);
  }

  /**
   * Create a StoryManifest from pre-computed manifest tree data
   * @param {string} title - Story title
   * @param {string} authorPublicKey - Author's public key
   * @param {string} manifestRoot - Root hash of the manifest tree
   * @param {number} totalContentChunks - Total content chunks
   * @param {number} totalHashListChunks - Total hash list chunks
   * @param {number} contentLength - Total character count
   * @param {Object} options - Additional options
   * @returns {StoryManifest} New manifest instance
   */
  static fromManifestTree(title, authorPublicKey, manifestRoot, totalContentChunks, totalHashListChunks, contentLength, options = {}) {
    console.log('StoryManifest.js: fromManifestTree: Creating manifest from tree data');
    console.log('StoryManifest.js: fromManifestTree: Manifest root:', manifestRoot.substring(0, 16) + '...');
    
    // Generate preview text if provided
    const previewText = options.firstChunk ? 
      options.firstChunk.substring(0, 200).replace(/\s+\S*$/, '...') : '';
    
    return new StoryManifest({
      title,
      authorPublicKey,
      manifestRoot,
      totalContentChunks,
      totalHashListChunks,
      contentLength,
      estimatedReadTime: options.estimatedReadTime,
      previewText,
      ...options
    });
  }

  /**
   * Serialize manifest data for blockchain storage (compact format)
   * @returns {Object} Serialized manifest data
   */
  serialize() {
    console.log('StoryManifest.js: serialize: Serializing 3-tier manifest for blockchain storage');
    
    return {
      // Protocol identifier (shortened for space)
      p: 'g-mt-v1',           // glyffiti-manifest-tree-v1
      v: this.version,
      
      // Core story data (minimal)
      t: this.title.substring(0, 60), // Truncate title for space
      a: this.authorPublicKey,
      an: this.authorUsername,
      
      // Manifest tree structure  
      mr: this.manifestRoot,          // Single manifest root hash
      tcc: this.totalContentChunks,   // Total content chunks
      thlc: this.totalHashListChunks, // Total hash list chunks
      cl: this.contentLength,
      
      // Timestamps
      ca: this.createdAt,
      pa: this.publishedAt,
      
      // Discovery metadata (minimal)
      tags: this.tags.slice(0, 5),    // Limit tags for space
      g: this.genre,
      l: this.language,
      pv: this.metadata.previewText?.substring(0, 100), // Truncate preview
      
      // Creator economy
      rgc: this.reGlyphCap,
      rgn: this.currentReGlyphCount,
      
      // Additional metadata (minimal)
      et: this.estimatedReadTime,
      nsfw: this.metadata.isNSFW,
      lic: this.metadata.license
    };
  }

  /**
   * Deserialize manifest data from blockchain storage
   * @param {Object} data - Serialized manifest data
   * @returns {StoryManifest} New manifest instance
   */
  static deserialize(data) {
    console.log('StoryManifest.js: deserialize: Deserializing 3-tier manifest from blockchain data');
    
    return new StoryManifest({
      title: data.t || '',
      authorPublicKey: data.a || '',
      authorUsername: data.an || null,
      manifestRoot: data.mr || '',
      totalContentChunks: data.tcc || 0,
      totalHashListChunks: data.thlc || 0,
      contentLength: data.cl || 0,
      createdAt: data.ca || Date.now(),
      publishedAt: data.pa || null,
      tags: data.tags || [],
      genre: data.g || null,
      language: data.l || 'en',
      reGlyphCap: data.rgc || null,
      currentReGlyphCount: data.rgn || 0,
      estimatedReadTime: data.et || 0,
      version: data.v || '1.0.0',
      metadata: {
        previewText: data.pv || '',
        isNSFW: data.nsfw || false,
        license: data.lic || 'CC0'
      }
    });
  }

  /**
   * Validate manifest integrity
   * @returns {Object} Validation result with isValid boolean and errors array
   */
  validate() {
    console.log('StoryManifest.js: validate: Validating 3-tier manifest integrity');
    
    const errors = [];
    
    // Required field validation
    if (!this.title.trim()) {
      errors.push('Title is required');
    }
    
    if (!this.authorPublicKey.trim()) {
      errors.push('Author public key is required');
    }
    
    if (!this.manifestRoot.trim()) {
      errors.push('Manifest root hash is required');
    }
    
    if (this.totalContentChunks <= 0) {
      errors.push('Total content chunks must be greater than 0');
    }
    
    if (this.totalHashListChunks <= 0) {
      errors.push('Total hash list chunks must be greater than 0');
    }
    
    // Hash format validation for manifest root
    const hashRegex = /^[a-f0-9]{64}$/i;
    if (this.manifestRoot && !hashRegex.test(this.manifestRoot)) {
      errors.push(`Invalid manifest root hash format: ${this.manifestRoot}`);
    }
    
    // Re-glyph cap validation
    if (this.reGlyphCap !== null && this.reGlyphCap < 0) {
      errors.push('Re-glyph cap cannot be negative');
    }
    
    if (this.currentReGlyphCount < 0) {
      errors.push('Current re-glyph count cannot be negative');
    }
    
    const isValid = errors.length === 0;
    console.log('StoryManifest.js: validate: Validation', isValid ? 'passed' : 'failed', 'with', errors.length, 'errors');
    
    return {
      isValid,
      errors
    };
  }

  /**
   * Get manifest hash for integrity verification
   * @returns {string} SHA-256 hash of the manifest data
   */
  async getManifestHash() {
    console.log('StoryManifest.js: getManifestHash: Computing 3-tier manifest hash');
    
    const manifestData = JSON.stringify(this.serialize(), null, 0);
    const hash = await HashingService.hashContent(manifestData);
    
    console.log('StoryManifest.js: getManifestHash: Hash computed:', hash.substring(0, 16) + '...');
    return hash;
  }

  /**
   * Update story ID after manifest publication
   * @param {string} transactionId - Blockchain transaction ID
   */
  setStoryId(transactionId) {
    console.log('StoryManifest.js: setStoryId: Setting story ID:', transactionId);
    
    this.storyId = transactionId;
    this.manifestTransactionId = transactionId;
    this.publishedAt = Date.now();
  }

  /**
   * Calculate estimated reading time based on content length
   * @returns {number} Estimated reading time in minutes
   * @private
   */
  _calculateReadTime(contentLength) {
    // Average reading speed: 200-250 words per minute
    // Estimate 5 characters per word on average
    const wordsPerMinute = 225;
    const charactersPerWord = 5;
    
    const estimatedWords = (contentLength || this.contentLength) / charactersPerWord;
    const readTimeMinutes = Math.ceil(estimatedWords / wordsPerMinute);
    
    return Math.max(1, readTimeMinutes); // Minimum 1 minute
  }

  /**
   * Export manifest as JSON string
   * @returns {string} JSON representation
   */
  toJSON() {
    return JSON.stringify(this.serialize(), null, 2);
  }

  /**
   * Create manifest from JSON string
   * @param {string} jsonString - JSON string
   * @returns {StoryManifest} New manifest instance
   */
  static fromJSON(jsonString) {
    console.log('StoryManifest.js: fromJSON: Parsing 3-tier manifest from JSON');
    
    try {
      const data = JSON.parse(jsonString);
      return StoryManifest.deserialize(data);
    } catch (error) {
      console.error('StoryManifest.js: fromJSON: Parse error:', error);
      throw new Error(`Invalid manifest JSON: ${error.message}`);
    }
  }
}

export default StoryManifest;

// Character count: 7824