// src/services/publishing/MobileScrollManager.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HashingService } from '../hashing/HashingService';

/**
 * @typedef {Object} Manifest
 * @property {string} storyId - Unique story identifier
 * @property {string} title - Content title
 * @property {string} author - Author display name
 * @property {string} authorPublicKey - Author's public key
 * @property {number} totalChunks - Total number of chunks
 * @property {Object[]} chunks - Array of chunk metadata
 * @property {number} chunks[].index - Chunk index
 * @property {string} chunks[].transactionId - Blockchain transaction ID
 * @property {string} chunks[].hash - Content hash
 * @property {number} timestamp - Creation timestamp
 * @property {string} [previewText] - Preview text for display
 * @property {string[]} [tags] - Content tags
 */

/**
 * @typedef {Object} ScrollOptions
 * @property {string} [creatorHandle] - Creator handle/username
 * @property {string} [previewText] - Preview text
 * @property {string[]} [tags] - Content tags
 * @property {string} [license] - Content license
 * @property {string} [seriesId] - Series identifier
 * @property {string} [previousGlyphId] - Previous scroll ID
 * @property {string} [nextGlyphId] - Next scroll ID
 */

/**
 * ScrollManager handles the creation and management of content manifests (scrolls)
 * that track all the chunks/glyphs associated with a piece of content
 */
export class MobileScrollManager {
  static STORAGE_KEY = 'glyffiti_scrolls';
  static VERSION = '1.0';
  
  /**
   * Create a manifest with all the necessary metadata
   * @param {string} title - Content title
   * @param {string} authorPublicKey - Author's public key
   * @param {Array} chunks - Array of {chunk: GlyphChunk, transactionId: string}
   * @param {ScrollOptions} [options] - Optional metadata
   * @returns {Promise<Manifest>} Created manifest
   */
  static async createScroll(title, authorPublicKey, chunks, options = {}) {
    try {
      // Generate a unique ID for the scroll
      const storyId = await this.generateScrollId(title, authorPublicKey);
      
      // Extract author from public key if no handle provided
      const author = options.creatorHandle || this.formatAuthorName(authorPublicKey);
      
      // Generate preview text if not provided
      const previewText = options.previewText || this.generatePreviewText(chunks);
      
      // Create the manifest
      const manifest = {
        storyId,
        title,
        author,
        authorPublicKey,
        totalChunks: chunks.length > 0 ? chunks[0].chunk.totalChunks : 0,
        chunks: chunks.map(({ chunk, transactionId }) => ({
          index: chunk.index,
          transactionId,
          hash: chunk.hash
        })),
        timestamp: Date.now(),
        previewText,
        tags: options.tags || [],
        version: this.VERSION
      };
      
      // Add optional metadata
      if (options.license) {
        manifest.license = options.license;
      }
      
      if (options.seriesId) {
        manifest.seriesId = options.seriesId;
      }
      
      if (options.previousGlyphId) {
        manifest.previousGlyphId = options.previousGlyphId;
      }
      
      if (options.nextGlyphId) {
        manifest.nextGlyphId = options.nextGlyphId;
      }
      
      console.log(`Created scroll manifest: ${storyId}`);
      return manifest;
    } catch (error) {
      console.error('Error creating scroll:', error);
      throw new Error('Failed to create scroll: ' + error.message);
    }
  }
  
  /**
   * Save a manifest to local storage
   * @param {Manifest} manifest - Manifest to save
   * @returns {Promise<boolean>} Success status
   */
  static async saveScrollLocally(manifest) {
    try {
      // Get existing manifests
      const manifests = await this.getAllScrolls();
      
      // Add or update the manifest
      manifests[manifest.storyId] = manifest;
      
      // Save back to storage
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(manifests));
      
      console.log(`Saved scroll locally: ${manifest.storyId}`);
      return true;
    } catch (error) {
      console.error('Error saving scroll locally:', error);
      return false;
    }
  }
  
  /**
   * Get a manifest from local storage
   * @param {string} storyId - Story ID to retrieve
   * @returns {Promise<Manifest|null>} Manifest or null if not found
   */
  static async getScrollById(storyId) {
    try {
      const manifests = await this.getAllScrolls();
      return manifests[storyId] || null;
    } catch (error) {
      console.error('Error getting scroll:', error);
      return null;
    }
  }
  
  /**
   * Get all manifests from local storage
   * @returns {Promise<Object>} Object with storyId as keys, manifests as values
   */
  static async getAllScrolls() {
    try {
      const storedManifests = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (storedManifests) {
        return JSON.parse(storedManifests);
      }
      return {};
    } catch (error) {
      console.error('Error getting all scrolls:', error);
      return {};
    }
  }
  
  /**
   * Get manifests as an array sorted by timestamp
   * @param {boolean} [descending=true] - Sort order
   * @returns {Promise<Manifest[]>} Array of manifests
   */
  static async getScrollsArray(descending = true) {
    try {
      const manifests = await this.getAllScrolls();
      const manifestArray = Object.values(manifests);
      
      return manifestArray.sort((a, b) => {
        return descending ? b.timestamp - a.timestamp : a.timestamp - b.timestamp;
      });
    } catch (error) {
      console.error('Error getting scrolls array:', error);
      return [];
    }
  }
  
  /**
   * Delete a manifest from local storage
   * @param {string} storyId - Story ID to delete
   * @returns {Promise<boolean>} Success status
   */
  static async deleteScroll(storyId) {
    try {
      const manifests = await this.getAllScrolls();
      
      if (!manifests[storyId]) {
        return false; // Manifest not found
      }
      
      delete manifests[storyId];
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(manifests));
      
      console.log(`Deleted scroll: ${storyId}`);
      return true;
    } catch (error) {
      console.error('Error deleting scroll:', error);
      return false;
    }
  }
  
  /**
   * Update an existing manifest
   * @param {string} storyId - Story ID to update
   * @param {Partial<Manifest>} updates - Fields to update
   * @returns {Promise<Manifest|null>} Updated manifest or null if not found
   */
  static async updateScroll(storyId, updates) {
    try {
      const manifests = await this.getAllScrolls();
      
      if (!manifests[storyId]) {
        return null; // Manifest not found
      }
      
      // Merge updates
      manifests[storyId] = {
        ...manifests[storyId],
        ...updates,
        storyId, // Ensure ID doesn't change
        timestamp: manifests[storyId].timestamp // Preserve original timestamp
      };
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(manifests));
      
      console.log(`Updated scroll: ${storyId}`);
      return manifests[storyId];
    } catch (error) {
      console.error('Error updating scroll:', error);
      return null;
    }
  }
  
  /**
   * Search scrolls by title, author, or tags
   * @param {string} query - Search query
   * @returns {Promise<Manifest[]>} Matching manifests
   */
  static async searchScrolls(query) {
    try {
      if (!query || query.trim().length === 0) {
        return [];
      }
      
      const manifests = await this.getScrollsArray();
      const lowerQuery = query.toLowerCase();
      
      return manifests.filter(manifest => {
        // Search in title
        if (manifest.title.toLowerCase().includes(lowerQuery)) {
          return true;
        }
        
        // Search in author
        if (manifest.author.toLowerCase().includes(lowerQuery)) {
          return true;
        }
        
        // Search in tags
        if (manifest.tags && manifest.tags.some(tag => 
          tag.toLowerCase().includes(lowerQuery)
        )) {
          return true;
        }
        
        // Search in preview text
        if (manifest.previewText && 
          manifest.previewText.toLowerCase().includes(lowerQuery)) {
          return true;
        }
        
        return false;
      });
    } catch (error) {
      console.error('Error searching scrolls:', error);
      return [];
    }
  }
  
  /**
   * Get scrolls by tag
   * @param {string} tag - Tag to filter by
   * @returns {Promise<Manifest[]>} Manifests with the tag
   */
  static async getScrollsByTag(tag) {
    try {
      const manifests = await this.getScrollsArray();
      
      return manifests.filter(manifest => 
        manifest.tags && manifest.tags.includes(tag)
      );
    } catch (error) {
      console.error('Error getting scrolls by tag:', error);
      return [];
    }
  }
  
  /**
   * Get scrolls by author
   * @param {string} authorPublicKey - Author's public key
   * @returns {Promise<Manifest[]>} Manifests by the author
   */
  static async getScrollsByAuthor(authorPublicKey) {
    try {
      const manifests = await this.getScrollsArray();
      
      return manifests.filter(manifest => 
        manifest.authorPublicKey === authorPublicKey
      );
    } catch (error) {
      console.error('Error getting scrolls by author:', error);
      return [];
    }
  }
  
  /**
   * Get all unique tags from all scrolls
   * @returns {Promise<string[]>} Array of unique tags
   */
  static async getAllTags() {
    try {
      const manifests = await this.getScrollsArray();
      const tagSet = new Set();
      
      manifests.forEach(manifest => {
        if (manifest.tags) {
          manifest.tags.forEach(tag => tagSet.add(tag));
        }
      });
      
      return Array.from(tagSet).sort();
    } catch (error) {
      console.error('Error getting all tags:', error);
      return [];
    }
  }
  
  /**
   * Validate a manifest structure
   * @param {Object} manifest - Manifest to validate
   * @returns {boolean} True if valid
   */
  static validateManifest(manifest) {
    try {
      // Required fields
      const requiredFields = ['storyId', 'title', 'author', 'authorPublicKey', 'totalChunks', 'chunks', 'timestamp'];
      
      for (const field of requiredFields) {
        if (!(field in manifest)) {
          console.error(`Manifest validation failed: Missing required field '${field}'`);
          return false;
        }
      }
      
      // Type checks
      if (typeof manifest.storyId !== 'string' || manifest.storyId.length === 0) {
        console.error('Manifest validation failed: Invalid storyId');
        return false;
      }
      
      if (typeof manifest.title !== 'string' || manifest.title.length === 0) {
        console.error('Manifest validation failed: Invalid title');
        return false;
      }
      
      if (typeof manifest.totalChunks !== 'number' || manifest.totalChunks < 0) {
        console.error('Manifest validation failed: Invalid totalChunks');
        return false;
      }
      
      if (!Array.isArray(manifest.chunks)) {
        console.error('Manifest validation failed: chunks must be an array');
        return false;
      }
      
      if (manifest.chunks.length !== manifest.totalChunks) {
        console.error('Manifest validation failed: chunks array length does not match totalChunks');
        return false;
      }
      
      // Validate each chunk
      for (let i = 0; i < manifest.chunks.length; i++) {
        const chunk = manifest.chunks[i];
        
        if (typeof chunk.index !== 'number' || chunk.index !== i) {
          console.error(`Manifest validation failed: Invalid chunk index at position ${i}`);
          return false;
        }
        
        if (typeof chunk.hash !== 'string' || chunk.hash.length === 0) {
          console.error(`Manifest validation failed: Invalid chunk hash at position ${i}`);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error validating manifest:', error);
      return false;
    }
  }
  
  /**
   * Generate a unique scroll ID
   * @param {string} title - Content title
   * @param {string} authorPublicKey - Author's public key
   * @returns {Promise<string>} Unique scroll ID
   */
  static async generateScrollId(title, authorPublicKey) {
    try {
      const timestamp = Date.now();
      const contentString = `${title}_${authorPublicKey}_${timestamp}`;
      const hash = await HashingService.hashContent(contentString);
      
      // Return first 16 characters for a shorter ID
      return `scroll_${hash.substring(0, 16)}`;
    } catch (error) {
      console.error('Error generating scroll ID:', error);
      // Fallback to timestamp-based ID
      return `scroll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }
  
  /**
   * Format author name from public key
   * @param {string} publicKey - Author's public key
   * @returns {string} Formatted author name
   */
  static formatAuthorName(publicKey) {
    if (!publicKey || publicKey.length < 16) {
      return 'Unknown Author';
    }
    
    return `${publicKey.substring(0, 8)}...${publicKey.substring(publicKey.length - 8)}`;
  }
  
  /**
   * Generate preview text from chunks
   * @param {Array} chunks - Array of chunk objects
   * @returns {string} Preview text
   */
  static generatePreviewText(chunks) {
    try {
      if (!chunks || chunks.length === 0) {
        return 'No preview available';
      }
      
      // Try to use original text from first chunk if available
      const firstChunk = chunks[0];
      if (firstChunk && firstChunk.chunk && firstChunk.chunk.originalText) {
        const text = firstChunk.chunk.originalText;
        return text.length > 200 ? text.substring(0, 200) + '...' : text;
      }
      
      return 'Content preview not available';
    } catch (error) {
      console.error('Error generating preview text:', error);
      return 'Preview generation failed';
    }
  }
  
  /**
   * Export all scrolls for backup
   * @returns {Promise<string>} JSON string of all scrolls
   */
  static async exportScrolls() {
    try {
      const manifests = await this.getAllScrolls();
      const exportData = {
        version: this.VERSION,
        exportDate: new Date().toISOString(),
        scrollCount: Object.keys(manifests).length,
        scrolls: manifests
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting scrolls:', error);
      throw new Error('Failed to export scrolls: ' + error.message);
    }
  }
  
  /**
   * Import scrolls from backup
   * @param {string} jsonData - JSON string of scroll data
   * @param {boolean} [merge=true] - Whether to merge with existing data
   * @returns {Promise<number>} Number of scrolls imported
   */
  static async importScrolls(jsonData, merge = true) {
    try {
      const importData = JSON.parse(jsonData);
      
      if (!importData.scrolls || typeof importData.scrolls !== 'object') {
        throw new Error('Invalid import data format');
      }
      
      const existingManifests = merge ? await this.getAllScrolls() : {};
      let importCount = 0;
      
      // Validate and import each scroll
      for (const [storyId, manifest] of Object.entries(importData.scrolls)) {
        if (this.validateManifest(manifest)) {
          existingManifests[storyId] = manifest;
          importCount++;
        } else {
          console.warn(`Skipped invalid manifest: ${storyId}`);
        }
      }
      
      // Save merged data
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingManifests));
      
      console.log(`Imported ${importCount} scrolls`);
      return importCount;
    } catch (error) {
      console.error('Error importing scrolls:', error);
      throw new Error('Failed to import scrolls: ' + error.message);
    }
  }
  
  /**
   * Clear all stored scrolls (use with caution)
   * @returns {Promise<boolean>} Success status
   */
  static async clearAllScrolls() {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      console.log('Cleared all scrolls');
      return true;
    } catch (error) {
      console.error('Error clearing scrolls:', error);
      return false;
    }
  }
  
  /**
   * Get storage statistics
   * @returns {Promise<Object>} Storage stats
   */
  static async getStorageStats() {
    try {
      const manifests = await this.getAllScrolls();
      const manifestArray = Object.values(manifests);
      
      const stats = {
        totalScrolls: manifestArray.length,
        totalChunks: manifestArray.reduce((sum, m) => sum + m.totalChunks, 0),
        oldestScroll: null,
        newestScroll: null,
        averageChunksPerScroll: 0,
        uniqueAuthors: new Set(),
        allTags: new Set(),
        totalStorageSize: 0
      };
      
      if (manifestArray.length > 0) {
        // Sort by timestamp
        const sorted = manifestArray.sort((a, b) => a.timestamp - b.timestamp);
        stats.oldestScroll = sorted[0];
        stats.newestScroll = sorted[sorted.length - 1];
        
        stats.averageChunksPerScroll = stats.totalChunks / stats.totalScrolls;
        
        // Collect unique authors and tags
        manifestArray.forEach(manifest => {
          stats.uniqueAuthors.add(manifest.authorPublicKey);
          if (manifest.tags) {
            manifest.tags.forEach(tag => stats.allTags.add(tag));
          }
        });
        
        // Calculate storage size
        const jsonString = JSON.stringify(manifests);
        stats.totalStorageSize = new Blob([jsonString]).size;
      }
      
      // Convert sets to arrays for serialization
      stats.uniqueAuthors = Array.from(stats.uniqueAuthors);
      stats.allTags = Array.from(stats.allTags);
      
      return stats;
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        totalScrolls: 0,
        totalChunks: 0,
        oldestScroll: null,
        newestScroll: null,
        averageChunksPerScroll: 0,
        uniqueAuthors: [],
        allTags: [],
        totalStorageSize: 0
      };
    }
  }
  
  /**
   * Verify scroll integrity against blockchain data
   * @param {string} storyId - Story ID to verify
   * @param {Function} getTransactionData - Function to fetch transaction data
   * @returns {Promise<Object>} Verification result
   */
  static async verifyScrollIntegrity(storyId, getTransactionData) {
    try {
      const manifest = await this.getScrollById(storyId);
      if (!manifest) {
        return {
          isValid: false,
          error: 'Manifest not found'
        };
      }
      
      const verificationResult = {
        isValid: true,
        checkedChunks: 0,
        validChunks: 0,
        invalidChunks: [],
        errors: []
      };
      
      // Verify each chunk
      for (const chunkInfo of manifest.chunks) {
        verificationResult.checkedChunks++;
        
        try {
          // Fetch transaction data from blockchain
          const transactionData = await getTransactionData(chunkInfo.transactionId);
          
          if (!transactionData) {
            verificationResult.invalidChunks.push({
              index: chunkInfo.index,
              error: 'Transaction not found'
            });
            continue;
          }
          
          // Verify hash matches
          const dataHash = await HashingService.hashContent(transactionData);
          if (dataHash === chunkInfo.hash) {
            verificationResult.validChunks++;
          } else {
            verificationResult.invalidChunks.push({
              index: chunkInfo.index,
              error: 'Hash mismatch'
            });
          }
        } catch (error) {
          verificationResult.invalidChunks.push({
            index: chunkInfo.index,
            error: error.message
          });
        }
      }
      
      verificationResult.isValid = verificationResult.invalidChunks.length === 0;
      
      return verificationResult;
    } catch (error) {
      console.error('Error verifying scroll integrity:', error);
      return {
        isValid: false,
        error: error.message
      };
    }
  }
  
  /**
   * Create a scroll from published content data
   * @param {Object} publishedContent - Published content data
   * @returns {Promise<Manifest>} Created manifest
   */
  static async createScrollFromPublishedContent(publishedContent) {
    try {
      const chunks = publishedContent.glyphs.map((glyph, index) => ({
        chunk: {
          index: index,
          totalChunks: publishedContent.glyphs.length,
          hash: glyph.hash,
          originalText: glyph.originalText || ''
        },
        transactionId: glyph.transactionId
      }));
      
      const options = {
        creatorHandle: publishedContent.authorName || undefined,
        previewText: this.generatePreviewText(chunks),
        tags: publishedContent.tags || [],
        license: publishedContent.license || undefined
      };
      
      return await this.createScroll(
        publishedContent.title,
        publishedContent.authorPublicKey,
        chunks,
        options
      );
    } catch (error) {
      console.error('Error creating scroll from published content:', error);
      throw new Error('Failed to create scroll from published content: ' + error.message);
    }
  }
  
  /**
   * Run self-test to verify ScrollManager functionality
   * @returns {Promise<boolean>} True if all tests pass
   */
  static async runSelfTest() {
    try {
      console.log('Running MobileScrollManager self-test...');
      
      // Create test data
      const testChunks = [
        {
          chunk: {
            index: 0,
            totalChunks: 2,
            hash: 'test_hash_0',
            originalText: 'This is the first chunk of test content.'
          },
          transactionId: 'test_tx_0'
        },
        {
          chunk: {
            index: 1,
            totalChunks: 2,
            hash: 'test_hash_1',
            originalText: 'This is the second chunk of test content.'
          },
          transactionId: 'test_tx_1'
        }
      ];
      
      const testOptions = {
        creatorHandle: 'TestUser',
        tags: ['test', 'selftest'],
        license: 'MIT'
      };
      
      // Test scroll creation
      const manifest = await this.createScroll(
        'Test Scroll',
        'test_author_public_key',
        testChunks,
        testOptions
      );
      
      // Test validation
      if (!this.validateManifest(manifest)) {
        console.error('Self-test failed: Created manifest is invalid');
        return false;
      }
      
      // Test saving
      const saveResult = await this.saveScrollLocally(manifest);
      if (!saveResult) {
        console.error('Self-test failed: Could not save manifest');
        return false;
      }
      
      // Test retrieval
      const retrievedManifest = await this.getScrollById(manifest.storyId);
      if (!retrievedManifest) {
        console.error('Self-test failed: Could not retrieve saved manifest');
        return false;
      }
      
      // Test search
      const searchResults = await this.searchScrolls('Test');
      if (searchResults.length === 0) {
        console.error('Self-test failed: Search did not find test manifest');
        return false;
      }
      
      // Test tag filtering
      const tagResults = await this.getScrollsByTag('test');
      if (tagResults.length === 0) {
        console.error('Self-test failed: Tag search did not find test manifest');
        return false;
      }
      
      // Test deletion
      const deleteResult = await this.deleteScroll(manifest.storyId);
      if (!deleteResult) {
        console.error('Self-test failed: Could not delete test manifest');
        return false;
      }
      
      // Verify deletion
      const deletedManifest = await this.getScrollById(manifest.storyId);
      if (deletedManifest) {
        console.error('Self-test failed: Manifest still exists after deletion');
        return false;
      }
      
      console.log('MobileScrollManager self-test passed!');
      return true;
    } catch (error) {
      console.error('Self-test failed with error:', error);
      return false;
    }
  }
}

// Character count: 16823