// src/services/storage/content/InProgressStorage.js
// Path: src/services/storage/content/InProgressStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * In-Progress Content Storage - Handles storage operations for content being prepared/published
 * Extracted from StorageService.js for better organization
 */
export class InProgressStorage {
  static STORAGE_KEY = 'glyffiti_in_progress';

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
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(inProgress));
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
        
        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(inProgress));
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
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
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
        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(inProgress));
        console.log(`🗑️ Removed in-progress content: ${contentId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing in-progress content:', error);
      return false;
    }
  }
}

// Character count: 3594