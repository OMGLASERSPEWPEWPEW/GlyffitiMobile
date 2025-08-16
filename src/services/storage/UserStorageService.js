// src/services/storage/UserStorageService.js
// Path: src/services/storage/UserStorageService.js

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * UserStorageService
 * 
 * Handles all storage operations that are scoped to individual users.
 * All data stored by this service is keyed with the user's public key
 * to ensure complete isolation between users.
 * 
 * This service is responsible for:
 * - User-scoped published stories
 * - User-scoped scroll manifests
 * - Any other user-specific persistent data
 * 
 * Key Strategy:
 * All AsyncStorage keys are prefixed with user_{publicKey}_ to ensure
 * data isolation and prevent cross-user contamination.
 */
export class UserStorageService {
  
  /**
   * Generate storage key for user's published stories
   * @param {string} userPublicKey - User's public key
   * @returns {string} Storage key
   */
  static getPublishedStoriesKey(userPublicKey) {
    return `user_${userPublicKey}_published_stories`;
  }
  
  /**
   * Generate storage key for user's scrolls
   * @param {string} userPublicKey - User's public key
   * @returns {string} Storage key
   */
  static getUserScrollsKey(userPublicKey) {
    return `user_${userPublicKey}_scrolls`;
  }
  
  /**
   * Save a published story to user's sandboxed storage
   * @param {Object} publishedStory - Story object to save
   * @param {string} userPublicKey - User's public key
   * @returns {Promise<boolean>} Success status
   */
  static async savePublishedStory(publishedStory, userPublicKey) {
    try {
      if (!publishedStory || !userPublicKey) {
        throw new Error('Published story and user public key are required');
      }
      
      // Get current stories for this user
      const currentStories = await this.loadPublishedStories(userPublicKey);
      
      // Add timestamp if not present
      if (!publishedStory.publishedAt) {
        publishedStory.publishedAt = Date.now();
      }
      
      // Add the new story
      currentStories.push(publishedStory);
      
      // Save back to storage
      const storageKey = this.getPublishedStoriesKey(userPublicKey);
      await AsyncStorage.setItem(storageKey, JSON.stringify(currentStories));
      
      console.log(`✅ Published story saved for user ${userPublicKey.substring(0, 8)}...`);
      return true;
      
    } catch (error) {
      console.error('❌ Error saving published story:', error);
      return false;
    }
  }
  
  /**
   * Load published stories for a specific user
   * @param {string} userPublicKey - User's public key
   * @returns {Promise<Array>} Array of published stories
   */
  static async loadPublishedStories(userPublicKey) {
    try {
      if (!userPublicKey) {
        throw new Error('User public key is required');
      }
      
      const storageKey = this.getPublishedStoriesKey(userPublicKey);
      const storiesData = await AsyncStorage.getItem(storageKey);
      
      if (!storiesData) {
        return [];
      }
      
      const stories = JSON.parse(storiesData);
      
      // Sort by published date (newest first)
      return stories.sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0));
      
    } catch (error) {
      console.error('❌ Error loading published stories:', error);
      return [];
    }
  }
  
  /**
   * Save a scroll manifest to user's sandboxed storage
   * @param {Object} manifest - Scroll manifest to save
   * @param {string} userPublicKey - User's public key
   * @returns {Promise<boolean>} Success status
   */
  static async saveUserScroll(manifest, userPublicKey) {
    try {
      if (!manifest || !userPublicKey) {
        throw new Error('Manifest and user public key are required');
      }
      
      // Get current scrolls for this user
      const currentScrolls = await this.loadUserScrolls(userPublicKey);
      
      // Check if scroll already exists
      const existingIndex = currentScrolls.findIndex(s => s.storyId === manifest.storyId);
      
      if (existingIndex >= 0) {
        // Update existing scroll
        currentScrolls[existingIndex] = manifest;
      } else {
        // Add new scroll
        currentScrolls.push(manifest);
      }
      
      // Save back to storage
      const storageKey = this.getUserScrollsKey(userPublicKey);
      await AsyncStorage.setItem(storageKey, JSON.stringify(currentScrolls));
      
      console.log(`✅ Scroll manifest saved for user ${userPublicKey.substring(0, 8)}...`);
      return true;
      
    } catch (error) {
      console.error('❌ Error saving user scroll:', error);
      return false;
    }
  }
  
  /**
   * Load scroll manifests for a specific user
   * @param {string} userPublicKey - User's public key
   * @returns {Promise<Array>} Array of scroll manifests
   */
  static async loadUserScrolls(userPublicKey) {
    try {
      if (!userPublicKey) {
        throw new Error('User public key is required');
      }
      
      const storageKey = this.getUserScrollsKey(userPublicKey);
      const scrollsData = await AsyncStorage.getItem(storageKey);
      
      if (!scrollsData) {
        return [];
      }
      
      const scrolls = JSON.parse(scrollsData);
      
      // Sort by creation date (newest first)
      return scrolls.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      
    } catch (error) {
      console.error('❌ Error loading user scrolls:', error);
      return [];
    }
  }
  
  /**
   * Delete a specific published story for a user
   * @param {string} storyId - Story ID to delete
   * @param {string} userPublicKey - User's public key
   * @returns {Promise<boolean>} Success status
   */
  static async deletePublishedStory(storyId, userPublicKey) {
    try {
      if (!storyId || !userPublicKey) {
        throw new Error('Story ID and user public key are required');
      }
      
      const currentStories = await this.loadPublishedStories(userPublicKey);
      const filteredStories = currentStories.filter(story => story.contentId !== storyId);
      
      const storageKey = this.getPublishedStoriesKey(userPublicKey);
      await AsyncStorage.setItem(storageKey, JSON.stringify(filteredStories));
      
      console.log(`✅ Published story deleted for user ${userPublicKey.substring(0, 8)}...`);
      return true;
      
    } catch (error) {
      console.error('❌ Error deleting published story:', error);
      return false;
    }
  }
  
  /**
   * Delete a specific scroll for a user
   * @param {string} storyId - Story ID to delete
   * @param {string} userPublicKey - User's public key
   * @returns {Promise<boolean>} Success status
   */
  static async deleteUserScroll(storyId, userPublicKey) {
    try {
      if (!storyId || !userPublicKey) {
        throw new Error('Story ID and user public key are required');
      }
      
      const currentScrolls = await this.loadUserScrolls(userPublicKey);
      const filteredScrolls = currentScrolls.filter(scroll => scroll.storyId !== storyId);
      
      const storageKey = this.getUserScrollsKey(userPublicKey);
      await AsyncStorage.setItem(storageKey, JSON.stringify(filteredScrolls));
      
      console.log(`✅ User scroll deleted for user ${userPublicKey.substring(0, 8)}...`);
      return true;
      
    } catch (error) {
      console.error('❌ Error deleting user scroll:', error);
      return false;
    }
  }
  
  /**
   * Clear all data for a specific user
   * @param {string} userPublicKey - User's public key
   * @returns {Promise<Object>} Cleanup results
   */
  static async clearUserData(userPublicKey) {
    try {
      if (!userPublicKey) {
        throw new Error('User public key is required');
      }
      
      const storiesKey = this.getPublishedStoriesKey(userPublicKey);
      const scrollsKey = this.getUserScrollsKey(userPublicKey);
      
      await AsyncStorage.multiRemove([storiesKey, scrollsKey]);
      
      console.log(`✅ All data cleared for user ${userPublicKey.substring(0, 8)}...`);
      
      return {
        success: true,
        clearedKeys: [storiesKey, scrollsKey],
        timestamp: Date.now()
      };
      
    } catch (error) {
      console.error('❌ Error clearing user data:', error);
      return {
        success: false,
        error: error.message,
        timestamp: Date.now()
      };
    }
  }
  
  /**
   * Get storage statistics for a specific user
   * @param {string} userPublicKey - User's public key
   * @returns {Promise<Object>} Storage statistics
   */
  static async getUserStorageStats(userPublicKey) {
    try {
      if (!userPublicKey) {
        throw new Error('User public key is required');
      }
      
      const stories = await this.loadPublishedStories(userPublicKey);
      const scrolls = await this.loadUserScrolls(userPublicKey);
      
      return {
        userPublicKey: userPublicKey.substring(0, 8) + '...',
        publishedStories: stories.length,
        scrollManifests: scrolls.length,
        totalItems: stories.length + scrolls.length,
        lastActivity: Math.max(
          stories.length > 0 ? Math.max(...stories.map(s => s.publishedAt || 0)) : 0,
          scrolls.length > 0 ? Math.max(...scrolls.map(s => s.createdAt || 0)) : 0
        ),
        storageKeys: {
          stories: this.getPublishedStoriesKey(userPublicKey),
          scrolls: this.getUserScrollsKey(userPublicKey)
        }
      };
      
    } catch (error) {
      console.error('❌ Error getting user storage stats:', error);
      return {
        userPublicKey: userPublicKey.substring(0, 8) + '...',
        publishedStories: 0,
        scrollManifests: 0,
        totalItems: 0,
        lastActivity: 0,
        error: error.message
      };
    }
  }
  
  /**
   * Run self-test to verify service functionality
   * @returns {Promise<boolean>} Test result
   */
  static async runSelfTest() {
    try {
      const testUserKey = 'test_user_12345678901234567890123456789012';
      const testStory = {
        contentId: 'test_story_123',
        title: 'Test Story',
        content: 'Test content',
        publishedAt: Date.now()
      };
      const testManifest = {
        storyId: 'test_story_123',
        title: 'Test Manifest',
        createdAt: Date.now()
      };
      
      // Test save and load operations
      await this.savePublishedStory(testStory, testUserKey);
      await this.saveUserScroll(testManifest, testUserKey);
      
      const stories = await this.loadPublishedStories(testUserKey);
      const scrolls = await this.loadUserScrolls(testUserKey);
      
      const hasStory = stories.some(s => s.contentId === testStory.contentId);
      const hasScroll = scrolls.some(s => s.storyId === testManifest.storyId);
      
      // Clean up test data
      await this.clearUserData(testUserKey);
      
      const testPassed = hasStory && hasScroll;
      console.log('🧪 UserStorageService self-test:', testPassed ? 'PASSED' : 'FAILED');
      
      return testPassed;
      
    } catch (error) {
      console.error('❌ UserStorageService self-test failed:', error);
      return false;
    }
  }
}

// Character count: 12,847