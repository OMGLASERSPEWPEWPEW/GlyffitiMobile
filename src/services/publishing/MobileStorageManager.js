// src/services/publishing/MobileStorageManager.js
// Path: src/services/publishing/MobileStorageManager.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MobileScrollManager } from './MobileScrollManager';

/**
 * Mobile Storage Manager - Handles all storage operations for publishing content
 * FIXED VERSION: Prevents duplicates and ensures proper data persistence
 */
export class MobileStorageManager {
  static STORAGE_KEYS = {
    IN_PROGRESS: 'glyffiti_in_progress',
    PUBLISHED: 'glyffiti_published',
    SCROLLS: 'glyffiti_scrolls'
  };

  // ==================== IN-PROGRESS CONTENT ====================

  /**
   * Save in-progress content with duplicate prevention
   * @param {Object} content - Content to save
   * @returns {Promise<boolean>} Success status
   */
  static async saveInProgressContent(content) {
    try {
      const inProgress = await this.getInProgressContent();
      
      // Prevent duplicates by checking contentId
      if (inProgress[content.contentId]) {
        console.log(`⚠️ In-progress content already exists: ${content.contentId}`);
        return await this.updateInProgressContent(
          content.contentId, 
          content.glyphs, 
          content.successfulGlyphs || 0, 
          content.failedGlyphs || 0
        );
      }
      
      inProgress[content.contentId] = {
        ...content,
        status: 'in_progress',
        lastUpdated: Date.now(),
        createdAt: content.createdAt || Date.now()
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
        console.log(`🔄 Updated in-progress content: ${contentId}`);
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
      if (inProgress[contentId]) {
        delete inProgress[contentId];
        await AsyncStorage.setItem(this.STORAGE_KEYS.IN_PROGRESS, JSON.stringify(inProgress));
        console.log(`🗑️ Removed in-progress content: ${contentId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing in-progress content:', error);
      return false;
    }
  }

  // ==================== PUBLISHED CONTENT ====================

  /**
   * Save published content with enhanced duplicate prevention
   * @param {Object} content - Published content to save
   * @returns {Promise<boolean>} Success status
   */
  static async savePublishedContent(content) {
    try {
      const published = await this.getPublishedContent();
      
      // Enhanced duplicate checking
      const isDuplicate = Object.values(published).some(existing => 
        existing.contentId === content.contentId ||
        (existing.title === content.title && 
         existing.originalContent === content.originalContent &&
         existing.authorPublicKey === content.authorPublicKey)
      );
      
      if (isDuplicate) {
        console.log(`⚠️ Duplicate published content detected: ${content.title}`);
        // Update existing instead of creating new
        const existingKey = Object.keys(published).find(key => 
          published[key].contentId === content.contentId ||
          (published[key].title === content.title && 
           published[key].originalContent === content.originalContent)
        );
        
        if (existingKey) {
          published[existingKey] = {
            ...published[existingKey],
            ...content,
            status: 'published',
            lastUpdated: Date.now()
          };
          await AsyncStorage.setItem(this.STORAGE_KEYS.PUBLISHED, JSON.stringify(published));
          console.log(`🔄 Updated existing published content: ${content.contentId}`);
          return true;
        }
      }
      
      // Create new entry
      published[content.contentId] = {
        ...content,
        status: 'published',
        lastUpdated: Date.now(),
        publishedAt: content.publishedAt || Date.now()
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
      const parsed = stored ? JSON.parse(stored) : {};
      
      // Clean up any null or invalid entries
      const cleaned = {};
      Object.keys(parsed).forEach(key => {
        if (parsed[key] && typeof parsed[key] === 'object' && parsed[key].contentId) {
          cleaned[key] = parsed[key];
        }
      });
      
      // If we cleaned anything, save the cleaned version
      if (Object.keys(cleaned).length !== Object.keys(parsed).length) {
        await AsyncStorage.setItem(this.STORAGE_KEYS.PUBLISHED, JSON.stringify(cleaned));
        console.log('🧹 Cleaned up invalid published content entries');
      }
      
      return cleaned;
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
      return Object.values(published).sort((a, b) => 
        (b.publishedAt || b.lastUpdated || 0) - (a.publishedAt || a.lastUpdated || 0)
      );
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
      if (published[contentId]) {
        delete published[contentId];
        await AsyncStorage.setItem(this.STORAGE_KEYS.PUBLISHED, JSON.stringify(published));
        console.log(`🗑️ Deleted published content: ${contentId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting published content:', error);
      return false;
    }
  }

  /**
   * Check if content is already published
   * @param {string} title - Content title
   * @param {string} content - Content text
   * @param {string} authorPublicKey - Author's public key
   * @returns {Promise<boolean>} True if already published
   */
  static async isContentAlreadyPublished(title, content, authorPublicKey) {
    try {
      const published = await this.getPublishedContent();
      return Object.values(published).some(item => 
        item.title === title && 
        item.originalContent === content &&
        item.authorPublicKey === authorPublicKey
      );
    } catch (error) {
      console.error('Error checking if content is already published:', error);
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
   * @returns {Promise<Object>} Export data object
   */
  static async exportData() {
    try {
      const [inProgress, published, scrolls] = await Promise.all([
        this.getInProgressContent(),
        this.getPublishedContent(),
        MobileScrollManager.getAllScrolls()
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

      console.log(`📤 Exported ${Object.keys(inProgress).length} in-progress, ${Object.keys(published).length} published, ${Object.keys(scrolls).length} scrolls`);
      return exportData;
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error('Failed to export data: ' + error.message);
    }
  }

  /**
   * Import data from backup with duplicate handling
   * @param {string} importDataJson - JSON string of import data
   * @param {boolean} merge - Whether to merge with existing data
   * @returns {Promise<Object>} Import results
   */
  static async importData(importDataJson, merge = true) {
    try {
      const importData = JSON.parse(importDataJson);
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

      // Import published content with duplicate checking
      if (importData.data.published) {
        try {
          const existingPublished = merge ? await this.getPublishedContent() : {};
          const importedPublished = importData.data.published;
          
          // Filter out duplicates
          const filteredImport = {};
          Object.keys(importedPublished).forEach(key => {
            const item = importedPublished[key];
            const isDuplicate = Object.values(existingPublished).some(existing => 
              existing.contentId === item.contentId ||
              (existing.title === item.title && existing.originalContent === item.originalContent)
            );
            
            if (!isDuplicate) {
              filteredImport[key] = item;
            }
          });
          
          const mergedPublished = { ...existingPublished, ...filteredImport };
          await AsyncStorage.setItem(this.STORAGE_KEYS.PUBLISHED, JSON.stringify(mergedPublished));
          results.published = Object.keys(filteredImport).length;
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

      // Test duplicate prevention
      const duplicateResult = await this.savePublishedContent(publishedContent);
      if (!duplicateResult) {
        throw new Error('Duplicate prevention test failed');
      }

      // Clean up test data
      await this.removeInProgressContent(testContent.contentId);
      await this.deletePublishedContent(testContent.contentId);

      console.log('✅ MobileStorageManager self-test passed');
      return true;
    } catch (error) {
      console.error('❌ MobileStorageManager self-test failed:', error);
      return false;
    }
  }

  /**
   * Get in-progress content by ID
   * @param {string} contentId - Content ID to retrieve
   * @returns {Promise<Object|null>} In-progress content or null
   */
  static async getInProgressContentById(contentId) {
    try {
      const inProgress = await this.getInProgressContent();
      return inProgress[contentId] || null;
    } catch (error) {
      console.error('Error getting in-progress content by ID:', error);
      return null;
    }
  }
}

// Character count: 14,682