// src/services/storage/StorageService.js
// Path: src/services/storage/StorageService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Consolidated Storage Service - Handles all storage operations for publishing content
 * Combines functionality from MobileStorageManager and MobileScrollManager
 * Prevents duplicates and ensures proper data persistence
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

  // ==================== SCROLL MANAGEMENT ====================

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
      await AsyncStorage.setItem(this.STORAGE_KEYS.SCROLLS, JSON.stringify(manifests));
      
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
      const storedManifests = await AsyncStorage.getItem(this.STORAGE_KEYS.SCROLLS);
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
      await AsyncStorage.setItem(this.STORAGE_KEYS.SCROLLS, JSON.stringify(manifests));
      
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
      
      await AsyncStorage.setItem(this.STORAGE_KEYS.SCROLLS, JSON.stringify(manifests));
      
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
      await AsyncStorage.removeItem(this.STORAGE_KEYS.SCROLLS);
      console.log('Cleared all scrolls');
      return true;
    } catch (error) {
      console.error('Error clearing scrolls:', error);
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
        totalItems: 0,
        scrollStats: {
          totalScrolls: 0,
          totalChunks: 0,
          uniqueAuthorsCount: 0,
          uniqueTagsCount: 0
        }
      };
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
        this.getAllScrolls()
      ]);

      const exportData = {
        version: '2.0',
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
   * Export all data as JSON string for backup
   * @returns {Promise<string>} JSON string of all data
   */
  static async exportAllData() {
    const exportData = await this.exportData();
    return JSON.stringify(exportData, null, 2);
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

      console.log(`📥 Imported ${results.inProgress} in-progress, ${results.published} published, ${results.scrolls} scrolls`);
      if (results.errors.length > 0) {
        console.warn('Import warnings:', results.errors);
      }
      
      return results;
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Failed to import data: ' + error.message);
    }
  }

  /**
   * Search content across all storage
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

// Character count: 29,785