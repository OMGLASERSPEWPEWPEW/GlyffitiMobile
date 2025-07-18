// src/services/publishing/MobileStorageManager.js
// Path: src/services/publishing/MobileStorageManager.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MobileScrollManager } from './MobileScrollManager';

/**
 * Mobile Storage Manager - Handles all storage operations for publishing content
 * Separated from MobilePublishingService for better organization
 */
export class MobileStorageManager {
  static STORAGE_KEYS = {
    IN_PROGRESS: 'glyffiti_in_progress',
    PUBLISHED: 'glyffiti_published',
    SCROLLS: 'glyffiti_scrolls'
  };

  // ==================== IN-PROGRESS CONTENT ====================

  /**
   * Save in-progress content
   * @param {Object} content - Content to save
   * @returns {Promise<boolean>} Success status
   */
  static async saveInProgressContent(content) {
    try {
      const inProgress = await this.getInProgressContent();
      inProgress[content.contentId] = {
        ...content,
        status: 'in_progress',
        lastUpdated: Date.now()
      };
      
      await AsyncStorage.setItem(this.STORAGE_KEYS.IN_PROGRESS, JSON.stringify(inProgress));
      console.log(`💾 Saved in-progress content: ${content.contentId}`);
      return true;
    } catch (error) {
      console.error('Error saving in-progress content:', error);
      return false;
    }
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
    try {
      const inProgress = await this.getInProgressContent();
      if (inProgress[contentId]) {
        inProgress[contentId].glyphs = glyphs;
        inProgress[contentId].successfulGlyphs = successfulGlyphs;
        inProgress[contentId].failedGlyphs = failedGlyphs;
        inProgress[contentId].lastUpdated = Date.now();
        
        await AsyncStorage.setItem(this.STORAGE_KEYS.IN_PROGRESS, JSON.stringify(inProgress));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating in-progress content:', error);
      return false;
    }
  }

  /**
   * Get all in-progress content
   * @returns {Promise<Object>} Object with contentId as keys
   */
  static async getInProgressContent() {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEYS.IN_PROGRESS);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error getting in-progress content:', error);
      return {};
    }
  }

  /**
   * Get in-progress content as array
   * @returns {Promise<Array>} Array of in-progress content
   */
  static async getInProgressContentArray() {
    try {
      const inProgress = await this.getInProgressContent();
      return Object.values(inProgress).sort((a, b) => b.lastUpdated - a.lastUpdated);
    } catch (error) {
      console.error('Error getting in-progress content array:', error);
      return [];
    }
  }

  /**
   * Remove in-progress content
   * @param {string} contentId - Content ID to remove
   * @returns {Promise<boolean>} Success status
   */
  static async removeInProgressContent(contentId) {
    try {
      const inProgress = await this.getInProgressContent();
      delete inProgress[contentId];
      await AsyncStorage.setItem(this.STORAGE_KEYS.IN_PROGRESS, JSON.stringify(inProgress));
      console.log(`🗑️ Removed in-progress content: ${contentId}`);
      return true;
    } catch (error) {
      console.error('Error removing in-progress content:', error);
      return false;
    }
  }

  // ==================== PUBLISHED CONTENT ====================

  /**
   * Save published content
   * @param {Object} content - Published content to save
   * @returns {Promise<boolean>} Success status
   */
  static async savePublishedContent(content) {
    try {
      const published = await this.getPublishedContent();
      published[content.contentId] = {
        ...content,
        status: 'published',
        lastUpdated: Date.now()
      };
      
      await AsyncStorage.setItem(this.STORAGE_KEYS.PUBLISHED, JSON.stringify(published));
      console.log(`✅ Saved published content: ${content.contentId}`);
      return true;
    } catch (error) {
      console.error('Error saving published content:', error);
      return false;
    }
  }

  /**
   * Get all published content
   * @returns {Promise<Object>} Object with contentId as keys
   */
  static async getPublishedContent() {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEYS.PUBLISHED);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error getting published content:', error);
      return {};
    }
  }

  /**
   * Get published content as array sorted by date
   * @returns {Promise<Array>} Array of published content
   */
  static async getPublishedContentArray() {
    try {
      const published = await this.getPublishedContent();
      return Object.values(published).sort((a, b) => b.publishedAt - a.publishedAt);
    } catch (error) {
      console.error('Error getting published content array:', error);
      return [];
    }
  }

  /**
   * Get published content by ID
   * @param {string} contentId - Content ID to retrieve
   * @returns {Promise<Object|null>} Published content or null
   */
  static async getPublishedContentById(contentId) {
    try {
      const published = await this.getPublishedContent();
      return published[contentId] || null;
    } catch (error) {
      console.error('Error getting published content by ID:', error);
      return null;
    }
  }

  /**
   * Delete published content
   * @param {string} contentId - Content ID to delete
   * @returns {Promise<boolean>} Success status
   */
  static async deletePublishedContent(contentId) {
    try {
      const published = await this.getPublishedContent();
      delete published[contentId];
      await AsyncStorage.setItem(this.STORAGE_KEYS.PUBLISHED, JSON.stringify(published));
      
      console.log(`🗑️ Deleted published content: ${contentId}`);
      return true;
    } catch (error) {
      console.error('Error deleting published content:', error);
      return false;
    }
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
   * Get storage statistics
   * @returns {Promise<Object>} Storage statistics
   */
  static async getStorageStats() {
    try {
      const inProgress = await this.getInProgressContent();
      const published = await this.getPublishedContent();
      const scrolls = await MobileScrollManager.getAllScrolls();
      
      return {
        inProgress: Object.keys(inProgress).length,
        published: Object.keys(published).length,
        scrolls: Object.keys(scrolls).length,
        totalItems: Object.keys(inProgress).length + Object.keys(published).length + Object.keys(scrolls).length
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return { inProgress: 0, published: 0, scrolls: 0, totalItems: 0 };
    }
  }

  /**
   * Export all data for backup
   * @returns {Promise<string>} JSON string of all data
   */
  static async exportAllData() {
    try {
      const inProgress = await this.getInProgressContent();
      const published = await this.getPublishedContent();
      const scrolls = await MobileScrollManager.getAllScrolls();
      
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        data: {
          inProgress,
          published,
          scrolls
        },
        stats: await this.getStorageStats()
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
      
      if (!importData.data || typeof importData.data !== 'object') {
        throw new Error('Invalid import data format');
      }

      const results = {
        inProgress: 0,
        published: 0,
        scrolls: 0,
        errors: []
      };

      // Import in-progress content
      if (importData.data.inProgress) {
        try {
          const existingInProgress = merge ? await this.getInProgressContent() : {};
          const mergedInProgress = { ...existingInProgress, ...importData.data.inProgress };
          await AsyncStorage.setItem(this.STORAGE_KEYS.IN_PROGRESS, JSON.stringify(mergedInProgress));
          results.inProgress = Object.keys(importData.data.inProgress).length;
        } catch (error) {
          results.errors.push(`In-progress import failed: ${error.message}`);
        }
      }

      // Import published content
      if (importData.data.published) {
        try {
          const existingPublished = merge ? await this.getPublishedContent() : {};
          const mergedPublished = { ...existingPublished, ...importData.data.published };
          await AsyncStorage.setItem(this.STORAGE_KEYS.PUBLISHED, JSON.stringify(mergedPublished));
          results.published = Object.keys(importData.data.published).length;
        } catch (error) {
          results.errors.push(`Published import failed: ${error.message}`);
        }
      }

      // Import scrolls using ScrollManager
      if (importData.data.scrolls) {
        try {
          await MobileScrollManager.importScrolls(JSON.stringify({
            scrolls: importData.data.scrolls
          }), merge);
          results.scrolls = Object.keys(importData.data.scrolls).length;
        } catch (error) {
          results.errors.push(`Scrolls import failed: ${error.message}`);
        }
      }

      console.log(`📥 Import completed: ${results.inProgress} in-progress, ${results.published} published, ${results.scrolls} scrolls`);
      return results;
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Failed to import data: ' + error.message);
    }
  }

  /**
   * Find content by search criteria
   * @param {string} searchTerm - Search term
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  static async searchContent(searchTerm, options = {}) {
    try {
      const { includeInProgress = true, includePublished = true, searchIn = ['title', 'content'] } = options;
      
      const results = {
        inProgress: [],
        published: [],
        total: 0
      };

      if (includeInProgress) {
        const inProgress = await this.getInProgressContentArray();
        results.inProgress = inProgress.filter(content => {
          return searchIn.some(field => {
            const value = field === 'content' ? content.originalContent : content[field];
            return value && value.toLowerCase().includes(searchTerm.toLowerCase());
          });
        });
      }

      if (includePublished) {
        const published = await this.getPublishedContentArray();
        results.published = published.filter(content => {
          return searchIn.some(field => {
            const value = field === 'content' ? content.originalContent : content[field];
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
   * Run self-test to verify StorageManager functionality
   * @returns {Promise<boolean>} True if all tests pass
   */
  static async runSelfTest() {
    try {
      console.log('Running MobileStorageManager self-test...');
      
      // Test content object
      const testContent = {
        contentId: 'test_storage_' + Date.now(),
        title: 'Test Storage Content',
        originalContent: 'This is test content for storage testing.',
        authorPublicKey: 'test_key',
        glyphs: []
      };

      // Test in-progress operations
      const saveResult = await this.saveInProgressContent(testContent);
      if (!saveResult) {
        console.error('Self-test failed: Could not save in-progress content');
        return false;
      }

      const inProgressContent = await this.getInProgressContent();
      if (!inProgressContent[testContent.contentId]) {
        console.error('Self-test failed: Could not retrieve in-progress content');
        return false;
      }

      const updateResult = await this.updateInProgressContent(testContent.contentId, [], 0, 0);
      if (!updateResult) {
        console.error('Self-test failed: Could not update in-progress content');
        return false;
      }

      // Test published operations
      const publishedContent = { ...testContent, publishedAt: Date.now() };
      const publishResult = await this.savePublishedContent(publishedContent);
      if (!publishResult) {
        console.error('Self-test failed: Could not save published content');
        return false;
      }

      // Test search
      const searchResults = await this.searchContent('Test Storage');
      if (searchResults.total === 0) {
        console.error('Self-test failed: Search did not find test content');
        return false;
      }

      // Test statistics
      const stats = await this.getStorageStats();
      if (typeof stats.totalItems !== 'number') {
        console.error('Self-test failed: Storage stats invalid');
        return false;
      }

      // Clean up test data
      await this.removeInProgressContent(testContent.contentId);
      await this.deletePublishedContent(testContent.contentId);

      console.log('✅ MobileStorageManager self-test passed!');
      return true;
    } catch (error) {
      console.error('Self-test failed with error:', error);
      return false;
    }
  }
}

// Character count: 10247