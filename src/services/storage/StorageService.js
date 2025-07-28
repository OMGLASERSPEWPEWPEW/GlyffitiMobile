// src/services/storage/StorageService.js
// Path: src/services/storage/StorageService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InProgressStorage } from './content/InProgressStorage';
import { PublishedStorage } from './content/PublishedStorage';
import { ScrollStorage } from './scrolls/ScrollStorage';

/**
 * Storage Service Facade - Coordinates between specialized storage services
 * Maintains backwards compatibility while delegating to focused services
 */
export class StorageService {
  static STORAGE_KEYS = {
    IN_PROGRESS: 'glyffiti_in_progress',
    PUBLISHED: 'glyffiti_published',
    SCROLLS: 'glyffiti_scrolls'
  };

  static SCROLL_VERSION = '1.0';

  // ==================== IN-PROGRESS CONTENT ====================

  /**
   * Save in-progress content with duplicate prevention
   * @param {Object} content - Content to save
   * @returns {Promise<boolean>} Success status
   */
  static async saveInProgressContent(content) {
    return await InProgressStorage.saveInProgressContent(content);
  }

  /**
   * Update in-progress content
   * @param {string} contentId - Content ID to update
   * @param {Array} glyphs - Updated glyphs array
   * @param {number} successfulGlyphs - Number of successful glyphs
   * @param {number} failedGlyphs - Number of failed glyphs
   * @returns {Promise<boolean>} Success status
   */
  static async updateInProgressContent(contentId, glyphs, successfulGlyphs, failedGlyphs) {
    return await InProgressStorage.updateInProgressContent(contentId, glyphs, successfulGlyphs, failedGlyphs);
  }

  /**
   * Get all in-progress content
   * @returns {Promise<Object>} Object with contentId as keys
   */
  static async getInProgressContent() {
    return await InProgressStorage.getInProgressContent();
  }

  /**
   * Get in-progress content as array
   * @returns {Promise<Array>} Array of in-progress content
   */
  static async getInProgressContentArray() {
    return await InProgressStorage.getInProgressContentArray();
  }

  /**
   * Get in-progress content by ID
   * @param {string} contentId - Content ID to retrieve
   * @returns {Promise<Object|null>} In-progress content or null
   */
  static async getInProgressContentById(contentId) {
    return await InProgressStorage.getInProgressContentById(contentId);
  }

  /**
   * Remove in-progress content
   * @param {string} contentId - Content ID to remove
   * @returns {Promise<boolean>} Success status
   */
  static async removeInProgressContent(contentId) {
    return await InProgressStorage.removeInProgressContent(contentId);
  }

  // ==================== PUBLISHED CONTENT ====================

  /**
   * Save published content with enhanced duplicate prevention
   * @param {Object} content - Published content to save
   * @returns {Promise<boolean>} Success status
   */
  static async savePublishedContent(content) {
    return await PublishedStorage.savePublishedContent(content);
  }

  /**
   * Get all published content
   * @returns {Promise<Object>} Object with contentId as keys
   */
  static async getPublishedContent() {
    return await PublishedStorage.getPublishedContent();
  }

  /**
   * Get published content as array sorted by date
   * @returns {Promise<Array>} Array of published content
   */
  static async getPublishedContentArray() {
    return await PublishedStorage.getPublishedContentArray();
  }

  /**
   * Get published content by ID
   * @param {string} contentId - Content ID to retrieve
   * @returns {Promise<Object|null>} Published content or null
   */
  static async getPublishedContentById(contentId) {
    return await PublishedStorage.getPublishedContentById(contentId);
  }

  /**
   * Delete published content
   * @param {string} contentId - Content ID to delete
   * @returns {Promise<boolean>} Success status
   */
  static async deletePublishedContent(contentId) {
    return await PublishedStorage.deletePublishedContent(contentId);
  }

  /**
   * Check if content is already published
   * @param {string} title - Content title
   * @param {string} content - Content text
   * @param {string} authorPublicKey - Author's public key
   * @returns {Promise<boolean>} True if already published
   */
  static async isContentAlreadyPublished(title, content, authorPublicKey) {
    return await PublishedStorage.isContentAlreadyPublished(title, content, authorPublicKey);
  }

  // ==================== SCROLL MANAGEMENT ====================

  /**
   * Create a scroll manifest from published content
   * @param {Object} publishedContent - Published content object with glyphs and transaction data
   * @returns {Object} Scroll manifest
   */
  static createScrollFromPublishedContent(publishedContent) {
    return ScrollStorage.createScrollFromPublishedContent(publishedContent);
  }

  /**
   * Format author name from public key
   * @param {string} publicKey - Author's public key
   * @returns {string} Formatted author name
   */
  static formatAuthorName(publicKey) {
    return ScrollStorage.formatAuthorName(publicKey);
  }

  /**
   * Save a scroll manifest to local storage
   * @param {Object} manifest - Manifest to save
   * @returns {Promise<boolean>} Success status
   */
  static async saveScrollLocally(manifest) {
    return await ScrollStorage.saveScrollLocally(manifest);
  }

  /**
   * Get a scroll manifest from local storage
   * @param {string} storyId - Story ID to retrieve
   * @returns {Promise<Object|null>} Manifest or null if not found
   */
  static async getScrollById(storyId) {
    return await ScrollStorage.getScrollById(storyId);
  }

  /**
   * Get all scroll manifests from local storage
   * @returns {Promise<Object>} Object with storyId as keys, manifests as values
   */
  static async getAllScrolls() {
    return await ScrollStorage.getAllScrolls();
  }

  /**
   * Get scrolls as an array sorted by timestamp
   * @param {boolean} [descending=true] - Sort order
   * @returns {Promise<Array>} Array of manifests
   */
  static async getScrollsArray(descending = true) {
    return await ScrollStorage.getScrollsArray(descending);
  }

  /**
   * Delete a scroll manifest from local storage
   * @param {string} storyId - Story ID to delete
   * @returns {Promise<boolean>} Success status
   */
  static async deleteScroll(storyId) {
    return await ScrollStorage.deleteScroll(storyId);
  }

  /**
   * Update an existing scroll manifest
   * @param {string} storyId - Story ID to update
   * @param {Partial<Object>} updates - Fields to update
   * @returns {Promise<Object|null>} Updated manifest or null if not found
   */
  static async updateScroll(storyId, updates) {
    return await ScrollStorage.updateScroll(storyId, updates);
  }

  /**
   * Get scroll storage statistics
   * @returns {Promise<Object>} Storage stats
   */
  static async getScrollStorageStats() {
    return await ScrollStorage.getScrollStorageStats();
  }

  /**
   * Validate a scroll manifest structure
   * @param {Object} manifest - Manifest to validate
   * @returns {boolean} True if valid
   */
  static validateManifest(manifest) {
    return ScrollStorage.validateManifest(manifest);
  }

  /**
   * Clear all scrolls (use with caution)
   * @returns {Promise<boolean>} Success status
   */
  static async clearAllScrolls() {
    return await ScrollStorage.clearAllScrolls();
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Clear all storage (for testing/debugging)
   * @returns {Promise<boolean>} Success status
   */
  static async clearAllStorage() {
    try {
      await AsyncStorage.multiRemove([
        this.STORAGE_KEYS.IN_PROGRESS,
        this.STORAGE_KEYS.PUBLISHED,
        this.STORAGE_KEYS.SCROLLS
      ]);
      
      console.log('🧹 Cleared all publishing storage');
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  /**
   * Get combined storage statistics
   * @returns {Promise<Object>} Storage statistics
   */
  static async getStorageStats() {
    try {
      const [inProgress, published, scrolls, scrollStats] = await Promise.all([
        this.getInProgressContent(),
        this.getPublishedContent(),
        this.getAllScrolls(),
        this.getScrollStorageStats()
      ]);
      
      return {
        inProgress: Object.keys(inProgress).length,
        published: Object.keys(published).length,
        scrolls: Object.keys(scrolls).length,
        totalItems: Object.keys(inProgress).length + Object.keys(published).length + Object.keys(scrolls).length,
        scrollStats
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        inProgress: 0,
        published: 0,
        scrolls: 0,
        totalItems: 0
      };
    }
  }

  /**
   * Search content across in-progress and published
   * @param {string} searchTerm - Search term
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  static async searchContent(searchTerm, options = {}) {
    try {
      const {
        includeInProgress = true,
        includePublished = true,
        searchIn = ['title', 'content']
      } = options;

      const results = {
        inProgress: [],
        published: [],
        total: 0
      };

      if (includeInProgress) {
        const inProgress = await this.getInProgressContentArray();
        results.inProgress = inProgress.filter(content => {
          return searchIn.some(field => {
            const value = field === 'content' ? 
              content.originalContent : content[field];
            return value && value.toLowerCase().includes(searchTerm.toLowerCase());
          });
        });
      }

      if (includePublished) {
        const published = await this.getPublishedContentArray();
        results.published = published.filter(content => {
          return searchIn.some(field => {
            const value = field === 'content' ? 
              content.originalContent : content[field];
            return value && value.toLowerCase().includes(searchTerm.toLowerCase());
          });
        });
      }

      results.total = results.inProgress.length + results.published.length;
      return results;
    } catch (error) {
      console.error('Error searching content:', error);
      return { inProgress: [], published: [], total: 0 };
    }
  }

  /**
   * Export all data for backup
   * @returns {Promise<string>} JSON string of all data
   */
  static async exportAllData() {
    try {
      const [inProgress, published, scrolls] = await Promise.all([
        this.getInProgressContent(),
        this.getPublishedContent(),
        this.getAllScrolls()
      ]);

      const exportData = {
        version: '1.0',
        timestamp: Date.now(),
        data: {
          inProgress,
          published,
          scrolls
        }
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error('Failed to export data: ' + error.message);
    }
  }

  /**
   * Import data from backup
   * @param {string} jsonData - JSON string of backup data
   * @param {boolean} merge - Whether to merge with existing data
   * @returns {Promise<Object>} Import results
   */
  static async importData(jsonData, merge = true) {
    try {
      const importData = JSON.parse(jsonData);
      const results = {
        inProgress: 0,
        published: 0,
        scrolls: 0,
        errors: []
      };

      // Import in-progress content
      if (importData.data?.inProgress) {
        try {
          const existingInProgress = merge ? await this.getInProgressContent() : {};
          const mergedInProgress = { ...existingInProgress, ...importData.data.inProgress };
          await AsyncStorage.setItem(this.STORAGE_KEYS.IN_PROGRESS, JSON.stringify(mergedInProgress));
          results.inProgress = Object.keys(importData.data.inProgress).length;
        } catch (error) {
          results.errors.push(`In-progress import failed: ${error.message}`);
        }
      }

      // Import published content with duplicate checking
      if (importData.data?.published) {
        try {
          const existingPublished = merge ? await this.getPublishedContent() : {};
          
          // Check for duplicates before merging
          for (const [key, content] of Object.entries(importData.data.published)) {
            const isDuplicate = Object.values(existingPublished).some(existing => 
              existing.contentId === content.contentId ||
              (existing.title === content.title && 
               existing.originalContent === content.originalContent &&
               existing.authorPublicKey === content.authorPublicKey)
            );
            
            if (!isDuplicate) {
              existingPublished[key] = content;
              results.published++;
            }
          }
          
          await AsyncStorage.setItem(this.STORAGE_KEYS.PUBLISHED, JSON.stringify(existingPublished));
        } catch (error) {
          results.errors.push(`Published import failed: ${error.message}`);
        }
      }

      // Import scrolls
      if (importData.data?.scrolls) {
        try {
          const existingScrolls = merge ? await this.getAllScrolls() : {};
          let importCount = 0;
          
          // Validate and import each scroll
          for (const [storyId, manifest] of Object.entries(importData.data.scrolls)) {
            if (this.validateManifest(manifest)) {
              existingScrolls[storyId] = manifest;
              importCount++;
            } else {
              console.warn(`Skipped invalid manifest: ${storyId}`);
            }
          }
          
          await AsyncStorage.setItem(this.STORAGE_KEYS.SCROLLS, JSON.stringify(existingScrolls));
          results.scrolls = importCount;
        } catch (error) {
          results.errors.push(`Scrolls import failed: ${error.message}`);
        }
      }

      console.log('Import completed:', results);
      return results;
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Failed to import data: ' + error.message);
    }
  }

  /**
   * Run self-test to verify StorageService functionality
   * @returns {Promise<boolean>} True if all tests pass
   */
  static async runSelfTest() {
    try {
      console.log('Running StorageService self-test...');
      
      // Test content object
      const testContent = {
        contentId: 'test_storage_' + Date.now(),
        title: 'Test Storage Content',
        originalContent: 'This is test content for storage testing.',
        glyphs: [],
        authorPublicKey: 'test_author_key'
      };

      // Test in-progress operations
      const saveInProgressResult = await this.saveInProgressContent(testContent);
      if (!saveInProgressResult) {
        throw new Error('Failed to save in-progress content');
      }

      const retrievedInProgress = await this.getInProgressContentById(testContent.contentId);
      if (!retrievedInProgress) {
        throw new Error('Failed to retrieve in-progress content');
      }

      // Test published operations
      const publishedContent = { ...testContent, publishedAt: Date.now() };
      const savePublishedResult = await this.savePublishedContent(publishedContent);
      if (!savePublishedResult) {
        throw new Error('Failed to save published content');
      }

      const retrievedPublished = await this.getPublishedContentById(testContent.contentId);
      if (!retrievedPublished) {
        throw new Error('Failed to retrieve published content');
      }

      // Test scroll operations
      const manifest = this.createScrollFromPublishedContent({
        ...publishedContent,
        glyphs: [{ chunk: { index: 0, totalChunks: 1, hash: 'test' }, transactionId: 'test_tx' }]
      });
      
      const saveScrollResult = await this.saveScrollLocally(manifest);
      if (!saveScrollResult) {
        throw new Error('Failed to save scroll');
      }

      const retrievedScroll = await this.getScrollById(testContent.contentId);
      if (!retrievedScroll) {
        throw new Error('Failed to retrieve scroll');
      }

      // Clean up test data
      await this.removeInProgressContent(testContent.contentId);
      await this.deletePublishedContent(testContent.contentId);
      await this.deleteScroll(testContent.contentId);

      console.log('✅ StorageService self-test passed');
      return true;
    } catch (error) {
      console.error('❌ StorageService self-test failed:', error);
      return false;
    }
  }
}

// Character count: 11847