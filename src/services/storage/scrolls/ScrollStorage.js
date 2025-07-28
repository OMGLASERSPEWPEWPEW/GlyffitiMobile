// src/services/storage/scrolls/ScrollStorage.js
// Path: src/services/storage/scrolls/ScrollStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Scroll Storage - Handles storage operations for scroll manifests
 * Extracted from StorageService.js for better organization
 */
export class ScrollStorage {
  static STORAGE_KEY = 'glyffiti_scrolls';
  static SCROLL_VERSION = '1.0';

  /**
   * Create a scroll manifest from published content
   * @param {Object} publishedContent - Published content object with glyphs and transaction data
   * @returns {Object} Scroll manifest
   */
  static createScrollFromPublishedContent(publishedContent) {
    try {
      const storyId = publishedContent.contentId;
      const glyphs = publishedContent.glyphs || [];
      const previewText = publishedContent.originalContent?.substring(0, 200) || '';
      
      if (!glyphs || glyphs.length === 0) {
        throw new Error('No glyphs provided for scroll creation');
      }

      // Handle different glyph structures - could be {chunk, transactionId} or direct glyph objects
      const hasChunkWrapper = glyphs[0] && glyphs[0].hasOwnProperty('chunk');
      
      const manifest = {
        storyId,
        title: publishedContent.title,
        author: publishedContent.authorName || this.formatAuthorName(publishedContent.authorPublicKey),
        authorPublicKey: publishedContent.authorPublicKey,
        totalChunks: glyphs.length,
        chunks: glyphs.map((item, index) => {
          if (hasChunkWrapper) {
            // Structure: {chunk: glyph, transactionId: string}
            const { chunk, transactionId } = item;
            return {
              index: chunk.index !== undefined ? chunk.index : index,
              transactionId,
              hash: chunk.hash || ''
            };
          } else {
            // Direct glyph structure
            return {
              index: item.index !== undefined ? item.index : index,
              transactionId: item.transactionId || '',
              hash: item.hash || ''
            };
          }
        }),
        timestamp: Date.now(),
        previewText: previewText + (publishedContent.originalContent?.length > 200 ? '...' : ''),
        tags: publishedContent.tags || [],
        version: this.SCROLL_VERSION
      };
      
      // Add optional metadata
      if (publishedContent.license) {
        manifest.license = publishedContent.license;
      }
      
      if (publishedContent.seriesId) {
        manifest.seriesId = publishedContent.seriesId;
      }
      
      console.log(`Created scroll manifest: ${storyId}`);
      return manifest;
    } catch (error) {
      console.error('Error creating scroll:', error);
      throw new Error('Failed to create scroll: ' + error.message);
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
   * Save a scroll manifest to local storage
   * @param {Object} manifest - Manifest to save
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
   * Get a scroll manifest from local storage
   * @param {string} storyId - Story ID to retrieve
   * @returns {Promise<Object|null>} Manifest or null if not found
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
   * Get all scroll manifests from local storage
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
   * Get scrolls as an array sorted by timestamp
   * @param {boolean} [descending=true] - Sort order
   * @returns {Promise<Array>} Array of manifests
   */
  static async getScrollsArray(descending = true) {
    try {
      const manifests = await this.getAllScrolls();
      const manifestArray = Object.values(manifests);
      
      return manifestArray.sort((a, b) => {
        return descending ? 
          b.timestamp - a.timestamp : 
          a.timestamp - b.timestamp;
      });
    } catch (error) {
      console.error('Error getting scrolls array:', error);
      return [];
    }
  }

  /**
   * Delete a scroll manifest from local storage
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
   * Update an existing scroll manifest
   * @param {string} storyId - Story ID to update
   * @param {Partial<Object>} updates - Fields to update
   * @returns {Promise<Object|null>} Updated manifest or null if not found
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
   * Get scroll storage statistics
   * @returns {Promise<Object>} Storage stats
   */
  static async getScrollStorageStats() {
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
        allTags: new Set()
      };
      
      if (manifestArray.length > 0) {
        // Sort by timestamp
        const sorted = manifestArray.sort((a, b) => a.timestamp - b.timestamp);
        stats.oldestScroll = sorted[0];
        stats.newestScroll = sorted[sorted.length - 1];
        stats.averageChunksPerScroll = stats.totalChunks / stats.totalScrolls;
        
        // Collect unique authors and tags
        manifestArray.forEach(manifest => {
          if (manifest.authorPublicKey) {
            stats.uniqueAuthors.add(manifest.authorPublicKey);
          }
          if (manifest.tags) {
            manifest.tags.forEach(tag => stats.allTags.add(tag));
          }
        });
      }
      
      // Convert Sets to counts
      stats.uniqueAuthorsCount = stats.uniqueAuthors.size;
      stats.uniqueTagsCount = stats.allTags.size;
      delete stats.uniqueAuthors;
      delete stats.allTags;
      
      return stats;
    } catch (error) {
      console.error('Error getting scroll storage stats:', error);
      return {
        totalScrolls: 0,
        totalChunks: 0,
        uniqueAuthorsCount: 0,
        uniqueTagsCount: 0
      };
    }
  }

  /**
   * Validate a scroll manifest structure
   * @param {Object} manifest - Manifest to validate
   * @returns {boolean} True if valid
   */
  static validateManifest(manifest) {
    const requiredFields = ['storyId', 'title', 'authorPublicKey', 'chunks', 'timestamp'];
    const hasRequiredFields = requiredFields.every(field => manifest.hasOwnProperty(field));
    
    if (!hasRequiredFields) {
      return false;
    }
    
    // Check chunks array
    if (!Array.isArray(manifest.chunks) || manifest.chunks.length === 0) {
      return false;
    }
    
    // Check each chunk has required fields
    const validChunks = manifest.chunks.every(chunk => 
      chunk.hasOwnProperty('index') && 
      chunk.hasOwnProperty('transactionId')
    );
    
    return validChunks;
  }

  /**
   * Clear all scrolls (use with caution)
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
}

// Character count: 7965