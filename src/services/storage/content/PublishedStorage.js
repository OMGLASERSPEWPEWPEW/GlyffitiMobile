// src/services/storage/content/PublishedStorage.js
// Path: src/services/storage/content/PublishedStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Published Content Storage - Handles storage operations for published content
 * Extracted from StorageService.js for better organization
 */
export class PublishedStorage {
  static STORAGE_KEY = 'glyffiti_published';

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
          await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(published));
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
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(published));
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
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
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
        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(cleaned));
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
        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(published));
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
      console.error('Error checking if content is published:', error);
      return false;
    }
  }
}

// Character count: 4776