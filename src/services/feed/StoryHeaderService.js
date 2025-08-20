// src/services/feed/StoryHeaderService.js
// Path: src/services/feed/StoryHeaderService.js

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * StoryHeaderService
 * 
 * Manages user story chain heads for efficient story chain construction.
 * Tracks the latest story transaction hash for each user, enabling
 * efficient chain walking when building story feeds and reading user stories.
 * 
 * Header file format:
 * {
 *   "users": {
 *     "7mtV5uLWCS81RnTXzRXZapjvskAXEFsm7HLa7gAyG4rd": {
 *       "username": "alice",
 *       "latestStoryHash": "2xSUYpqd6YhCgGPtZV94ZKU9TW61rm6JWLFwtmnh9uZx...",
 *       "lastUpdated": "2025-08-20T15:30:45.000Z",
 *       "storyCount": 3
 *     }
 *   },
 *   "totalUsers": 1,
 *   "lastUpdated": "2025-08-20T15:30:45.000Z"
 * }
 */
export class StoryHeaderService {
  
  static STORAGE_KEY = 'glyffiti_user_story_heads';
  
  /**
   * Load the user story heads file from storage
   * @returns {Promise<Object>} User story heads data
   */
  static async loadUserStoryHeads() {
    try {
      console.log('StoryHeaderService.loadUserStoryHeads: Loading story heads from storage');
      const headData = await AsyncStorage.getItem(this.STORAGE_KEY);
      
      if (!headData) {
        console.log('StoryHeaderService.loadUserStoryHeads: No existing story heads, returning empty structure');
        // Return empty structure
        return {
          users: {},
          totalUsers: 0,
          lastUpdated: new Date().toISOString()
        };
      }
      
      const parsed = JSON.parse(headData);
      console.log('StoryHeaderService.loadUserStoryHeads: Loaded story heads for', Object.keys(parsed.users).length, 'users');
      return parsed;
      
    } catch (error) {
      console.error('StoryHeaderService.loadUserStoryHeads: ❌ Error loading user story heads:', error);
      return {
        users: {},
        totalUsers: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }
  
  /**
   * Save the user story heads file to storage
   * @param {Object} headData - User story heads data to save
   * @returns {Promise<boolean>} Success status
   */
  static async saveUserStoryHeads(headData) {
    try {
      console.log('StoryHeaderService.saveUserStoryHeads: Saving story heads to storage');
      headData.lastUpdated = new Date().toISOString();
      headData.totalUsers = Object.keys(headData.users).length;
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(headData, null, 2));
      
      console.log('StoryHeaderService.saveUserStoryHeads: 💾 User story heads saved:', {
        totalUsers: headData.totalUsers,
        lastUpdated: headData.lastUpdated
      });
      
      return true;
      
    } catch (error) {
      console.error('StoryHeaderService.saveUserStoryHeads: ❌ Error saving user story heads:', error);
      return false;
    }
  }
  
  /**
   * Update a user's latest story hash (their story chain head)
   * @param {string} publicKey - User's public key
   * @param {string} username - User's username
   * @param {string} latestStoryHash - Transaction hash of their latest story
   * @returns {Promise<boolean>} Success status
   */
  static async updateUserStoryHead(publicKey, username, latestStoryHash) {
    try {
      console.log('StoryHeaderService.updateUserStoryHead: Updating story head for', username, 'with hash', latestStoryHash.substring(0, 8) + '...');
      const heads = await this.loadUserStoryHeads();
      
      // Get existing user data or create new
      const existingUser = heads.users[publicKey] || {
        username: username,
        latestStoryHash: null,
        lastUpdated: null,
        storyCount: 0
      };
      
      // Update user's story head
      heads.users[publicKey] = {
        ...existingUser,
        username: username, // Always update username in case it changed
        latestStoryHash: latestStoryHash,
        lastUpdated: new Date().toISOString(),
        storyCount: existingUser.storyCount + 1
      };
      
      const success = await this.saveUserStoryHeads(heads);
      
      if (success) {
        console.log('StoryHeaderService.updateUserStoryHead: ✅ Successfully updated story head for', username, 'story count now', heads.users[publicKey].storyCount);
      } else {
        console.error('StoryHeaderService.updateUserStoryHead: ❌ Failed to save updated story heads');
      }
      
      return success;
      
    } catch (error) {
      console.error('StoryHeaderService.updateUserStoryHead: ❌ Error updating user story head:', error);
      return false;
    }
  }
  
  /**
   * Get a user's latest story hash
   * @param {string} publicKey - User's public key
   * @returns {Promise<string|null>} Latest story hash or null if no stories
   */
  static async getUserStoryHead(publicKey) {
    try {
      console.log('StoryHeaderService.getUserStoryHead: Getting story head for user', publicKey.substring(0, 8) + '...');
      const heads = await this.loadUserStoryHeads();
      const user = heads.users[publicKey];
      
      if (user && user.latestStoryHash) {
        console.log('StoryHeaderService.getUserStoryHead: Found story head for user', user.username, 'hash', user.latestStoryHash.substring(0, 8) + '...');
        return user.latestStoryHash;
      }
      
      console.log('StoryHeaderService.getUserStoryHead: No story head found for user');
      return null;
      
    } catch (error) {
      console.error('StoryHeaderService.getUserStoryHead: ❌ Error getting user story head:', error);
      return null;
    }
  }
  
  /**
   * Get all user story heads data
   * @returns {Promise<Array>} Array of user story data
   */
  static async getAllUserStoryHeads() {
    try {
      console.log('StoryHeaderService.getAllUserStoryHeads: Getting all user story heads');
      const heads = await this.loadUserStoryHeads();
      
      const userArray = Object.entries(heads.users).map(([publicKey, userData]) => ({
        publicKey,
        username: userData.username,
        latestStoryHash: userData.latestStoryHash,
        lastUpdated: userData.lastUpdated,
        storyCount: userData.storyCount
      }));
      
      console.log('StoryHeaderService.getAllUserStoryHeads: Retrieved', userArray.length, 'user story heads');
      return userArray;
      
    } catch (error) {
      console.error('StoryHeaderService.getAllUserStoryHeads: ❌ Error getting all user story heads:', error);
      return [];
    }
  }
  
  /**
   * Get all users who have published stories
   * @returns {Promise<Array>} Array of active story users
   */
  static async getActiveStoryUsers() {
    try {
      console.log('StoryHeaderService.getActiveStoryUsers: Getting active story users');
      const allUsers = await this.getAllUserStoryHeads();
      
      // Filter for users who have at least one story
      const activeUsers = allUsers.filter(user => 
        user.latestStoryHash && 
        user.storyCount > 0
      );
      
      console.log('StoryHeaderService.getActiveStoryUsers: Found', activeUsers.length, 'active story users');
      return activeUsers;
      
    } catch (error) {
      console.error('StoryHeaderService.getActiveStoryUsers: ❌ Error getting active story users:', error);
      return [];
    }
  }
  
  /**
   * Get story statistics
   * @returns {Promise<Object>} Story statistics
   */
  static async getStats() {
    try {
      console.log('StoryHeaderService.getStats: Calculating story statistics');
      const heads = await this.loadUserStoryHeads();
      const users = Object.values(heads.users);
      
      // Filter active story users
      const activeUsers = users.filter(user => user.latestStoryHash && user.storyCount > 0);
      
      // Calculate total stories
      const totalStories = users.reduce((sum, user) => sum + (user.storyCount || 0), 0);
      
      // Find most active user (by story count)
      const mostActive = users.reduce((max, user) => 
        (user.storyCount || 0) > (max.storyCount || 0) ? user : max, {});
      
      // Most recent story
      const mostRecent = users.reduce((latest, user) => 
        (user.lastUpdated > (latest.lastUpdated || '')) ? user : latest, {});
      
      const stats = {
        totalUsers: heads.totalUsers,
        activeUsers: activeUsers.length,
        totalStories: totalStories,
        lastUpdated: heads.lastUpdated,
        mostActiveUser: mostActive.username || null,
        mostActiveUserStories: mostActive.storyCount || 0,
        mostRecentUser: mostRecent.username || null,
        mostRecentStory: mostRecent.lastUpdated || null
      };
      
      console.log('StoryHeaderService.getStats: Statistics calculated', stats);
      return stats;
      
    } catch (error) {
      console.error('StoryHeaderService.getStats: ❌ Error getting story stats:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalStories: 0,
        lastUpdated: new Date().toISOString(),
        mostActiveUser: null,
        mostActiveUserStories: 0,
        mostRecentUser: null,
        mostRecentStory: null
      };
    }
  }
  
  /**
   * Run self-test to verify service functionality
   * @returns {Promise<boolean>} Test success status
   */
  static async runSelfTest() {
    try {
      console.log('StoryHeaderService.runSelfTest: 🧪 Running StoryHeaderService self-test...');
      
      // Test updating a user story head
      const testPublicKey = '7mtV5uLWCS81RnTXzRXZapjvskAXEFsm7HLa7gAyG4rd';
      const testUsername = 'test_story_user';
      const testStoryHash = '3xSUYpqd6YhCgGPtZV94ZKU9TW61rm6JWLFwtmnh9uZy';
      
      const updateSuccess = await this.updateUserStoryHead(testPublicKey, testUsername, testStoryHash);
      if (!updateSuccess) throw new Error('Failed to update user story head');
      
      // Test retrieving user story head
      const retrievedHead = await this.getUserStoryHead(testPublicKey);
      if (retrievedHead !== testStoryHash) throw new Error('Retrieved story head does not match');
      
      // Test getting all user story heads
      const allHeads = await this.getAllUserStoryHeads();
      const foundUser = allHeads.find(user => user.publicKey === testPublicKey);
      if (!foundUser) throw new Error('Test user not found in all story heads');
      
      // Test getting active story users
      const activeUsers = await this.getActiveStoryUsers();
      const foundActiveUser = activeUsers.find(user => user.publicKey === testPublicKey);
      if (!foundActiveUser) throw new Error('Test user not found in active story users');
      
      // Test getting statistics
      const stats = await this.getStats();
      if (typeof stats.totalUsers !== 'number') throw new Error('Stats format invalid');
      
      console.log('StoryHeaderService.runSelfTest: ✅ All tests passed');
      return true;
      
    } catch (error) {
      console.error('StoryHeaderService.runSelfTest: ❌ Self-test failed:', error);
      return false;
    }
  }
  
  /**
   * Reset all user story heads (clears all story data)
   * @returns {Promise<boolean>} Success status
   */
  static async resetUserStoryHeads() {
    try {
      console.log('StoryHeaderService.resetUserStoryHeads: Resetting all user story heads');
      
      const emptyHeads = {
        users: {},
        totalUsers: 0,
        lastUpdated: new Date().toISOString()
      };
      
      const success = await this.saveUserStoryHeads(emptyHeads);
      
      if (success) {
        console.log('StoryHeaderService.resetUserStoryHeads: ✅ All user story heads reset');
      } else {
        console.error('StoryHeaderService.resetUserStoryHeads: ❌ Failed to reset user story heads');
      }
      
      return success;
      
    } catch (error) {
      console.error('StoryHeaderService.resetUserStoryHeads: ❌ Error resetting user story heads:', error);
      return false;
    }
  }
  
  /**
   * Test connectivity (AsyncStorage availability)
   * @returns {Promise<boolean>} True if service can connect to storage
   */
  static async testConnection() {
    try {
      console.log('StoryHeaderService.testConnection: Testing AsyncStorage connectivity');
      
      // Try to read storage (should succeed even if empty)
      await AsyncStorage.getItem(this.STORAGE_KEY);
      
      console.log('StoryHeaderService.testConnection: ✅ AsyncStorage connectivity test passed');
      return true;
      
    } catch (error) {
      console.error('StoryHeaderService.testConnection: ❌ AsyncStorage connectivity test failed:', error);
      return false;
    }
  }
}

// Character count: 9847