// src/services/feed/PostHeaderService.js
// Path: src/services/feed/PostHeaderService.js

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * PostHeaderService
 * 
 * Manages user post chain heads for efficient social feed construction.
 * Tracks the latest post transaction hash for each user, enabling
 * efficient chain walking when building feeds.
 * 
 * Header file format:
 * {
 *   "users": {
 *     "7mtV5uLWCS81RnTXzRXZapjvskAXEFsm7HLa7gAyG4rd": {
 *       "username": "alice",
 *       "latestPostHash": "2xSUYpqd6YhCgGPtZV94ZKU9TW61rm6JWLFwtmnh9uZx...",
 *       "lastUpdated": "2025-08-10T02:55:28.000Z",
 *       "postCount": 5
 *     }
 *   },
 *   "totalUsers": 1,
 *   "lastUpdated": "2025-08-10T02:55:28.000Z"
 * }
 */
export class PostHeaderService {
  
  static STORAGE_KEY = 'glyffiti_user_heads';
  
  /**
   * Load the user heads file from storage
   * @returns {Promise<Object>} User heads data
   */
  static async loadUserHeads() {
    try {
      const headData = await AsyncStorage.getItem(this.STORAGE_KEY);
      
      if (!headData) {
        // Return empty structure
        return {
          users: {},
          totalUsers: 0,
          lastUpdated: new Date().toISOString()
        };
      }
      
      return JSON.parse(headData);
      
    } catch (error) {
      console.error('❌ Error loading user heads:', error);
      return {
        users: {},
        totalUsers: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }
  
  /**
   * Save the user heads file to storage
   * @param {Object} headData - User heads data to save
   * @returns {Promise<boolean>} Success status
   */
  static async saveUserHeads(headData) {
    try {
      headData.lastUpdated = new Date().toISOString();
      headData.totalUsers = Object.keys(headData.users).length;
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(headData, null, 2));
      
      console.log('💾 User heads saved:', {
        totalUsers: headData.totalUsers,
        lastUpdated: headData.lastUpdated
      });
      
      return true;
      
    } catch (error) {
      console.error('❌ Error saving user heads:', error);
      return false;
    }
  }
  
  /**
   * Update a user's latest post hash (their chain head)
   * @param {string} publicKey - User's public key
   * @param {string} username - User's username
   * @param {string} latestPostHash - Transaction hash of their latest post
   * @returns {Promise<boolean>} Success status
   */
  static async updateUserHead(publicKey, username, latestPostHash) {
    try {
      const heads = await this.loadUserHeads();
      
      // Get existing user data or create new
      const existingUser = heads.users[publicKey] || {
        username: username,
        latestPostHash: null,
        lastUpdated: null,
        postCount: 0
      };
      
      // Update user's head
      existingUser.latestPostHash = latestPostHash;
      existingUser.lastUpdated = new Date().toISOString();
      existingUser.postCount = (existingUser.postCount || 0) + 1;
      existingUser.username = username; // Keep username updated
      
      heads.users[publicKey] = existingUser;
      
      const success = await this.saveUserHeads(heads);
      
      if (success) {
        console.log('📍 User head updated:', {
          username: username,
          publicKey: publicKey.substring(0, 8) + '...',
          latestPostHash: latestPostHash.substring(0, 8) + '...',
          postCount: existingUser.postCount
        });
      }
      
      return success;
      
    } catch (error) {
      console.error('❌ Error updating user head:', error);
      return false;
    }
  }
  
  /**
   * Get a user's latest post hash
   * @param {string} publicKey - User's public key
   * @returns {Promise<string|null>} Latest post hash or null
   */
  static async getUserHead(publicKey) {
    try {
      const heads = await this.loadUserHeads();
      const user = heads.users[publicKey];
      
      return user ? user.latestPostHash : null;
      
    } catch (error) {
      console.error('❌ Error getting user head:', error);
      return null;
    }
  }
  
  /**
   * Get all users with their head information
   * @returns {Promise<Array>} Array of user head objects
   */
  static async getAllUserHeads() {
    try {
      const heads = await this.loadUserHeads();
      
      // Convert users object to array
      const userHeads = Object.entries(heads.users).map(([publicKey, userData]) => ({
        publicKey: publicKey,
        username: userData.username,
        latestPostHash: userData.latestPostHash,
        lastUpdated: userData.lastUpdated,
        postCount: userData.postCount
      }));
      
      // Sort by most recently updated
      userHeads.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
      
      console.log('📋 Retrieved all user heads:', {
        totalUsers: userHeads.length,
        withPosts: userHeads.filter(u => u.latestPostHash).length
      });
      
      return userHeads;
      
    } catch (error) {
      console.error('❌ Error getting all user heads:', error);
      return [];
    }
  }
  
  /**
   * Get users who have posted (have a head)
   * @returns {Promise<Array>} Array of users with posts
   */
  static async getActiveUsers() {
    try {
      const allUsers = await this.getAllUserHeads();
      
      // Filter users who have posted
      const activeUsers = allUsers.filter(user => user.latestPostHash !== null);
      
      console.log('🔥 Retrieved active users:', {
        totalActive: activeUsers.length,
        totalUsers: allUsers.length
      });
      
      return activeUsers;
      
    } catch (error) {
      console.error('❌ Error getting active users:', error);
      return [];
    }
  }
  
  /**
   * Remove a user from tracking
   * @param {string} publicKey - User's public key
   * @returns {Promise<boolean>} Success status
   */
  static async removeUser(publicKey) {
    try {
      const heads = await this.loadUserHeads();
      
      if (heads.users[publicKey]) {
        const username = heads.users[publicKey].username;
        delete heads.users[publicKey];
        
        const success = await this.saveUserHeads(heads);
        
        if (success) {
          console.log('🗑️ User removed from tracking:', {
            username: username,
            publicKey: publicKey.substring(0, 8) + '...'
          });
        }
        
        return success;
      } else {
        console.log('⚠️ User not found in tracking:', publicKey.substring(0, 8) + '...');
        return true; // Not an error if user doesn't exist
      }
      
    } catch (error) {
      console.error('❌ Error removing user:', error);
      return false;
    }
  }
  
  /**
   * Clear all user heads
   * @returns {Promise<boolean>} Success status
   */
  static async clearAllUsers() {
    try {
      const emptyHeads = {
        users: {},
        totalUsers: 0,
        lastUpdated: new Date().toISOString()
      };
      
      const success = await this.saveUserHeads(emptyHeads);
      
      if (success) {
        console.log('🧹 All user heads cleared');
      }
      
      return success;
      
    } catch (error) {
      console.error('❌ Error clearing user heads:', error);
      return false;
    }
  }
  
  /**
   * Get user heads statistics
   * @returns {Promise<Object>} Statistics about tracked users
   */
  static async getStats() {
    try {
      const heads = await this.loadUserHeads();
      
      const users = Object.values(heads.users);
      const activeUsers = users.filter(user => user.latestPostHash !== null);
      const totalPosts = users.reduce((sum, user) => sum + (user.postCount || 0), 0);
      
      // Most active user
      const mostActive = users.reduce((max, user) => 
        (user.postCount > (max.postCount || 0)) ? user : max, {});
      
      // Most recent post
      const mostRecent = users.reduce((latest, user) => 
        (user.lastUpdated > (latest.lastUpdated || '')) ? user : latest, {});
      
      return {
        totalUsers: heads.totalUsers,
        activeUsers: activeUsers.length,
        totalPosts: totalPosts,
        lastUpdated: heads.lastUpdated,
        mostActiveUser: mostActive.username || null,
        mostActiveUserPosts: mostActive.postCount || 0,
        mostRecentUser: mostRecent.username || null,
        mostRecentPost: mostRecent.lastUpdated || null
      };
      
    } catch (error) {
      console.error('❌ Error getting user heads stats:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalPosts: 0,
        lastUpdated: new Date().toISOString(),
        mostActiveUser: null,
        mostActiveUserPosts: 0,
        mostRecentUser: null,
        mostRecentPost: null
      };
    }
  }
  
  /**
   * Run self-test to verify service functionality
   * @returns {Promise<boolean>} Test success status
   */
  static async runSelfTest() {
    try {
      console.log('🧪 Running PostHeaderService self-test...');
      
      // Test updating a user head
      const testPublicKey = '7mtV5uLWCS81RnTXzRXZapjvskAXEFsm7HLa7gAyG4rd';
      const testUsername = 'test_user';
      const testPostHash = '2xSUYpqd6YhCgGPtZV94ZKU9TW61rm6JWLFwtmnh9uZx';
      
      const updateSuccess = await this.updateUserHead(testPublicKey, testUsername, testPostHash);
      if (!updateSuccess) throw new Error('Failed to update user head');
      
      // Test retrieving user head
      const retrievedHead = await this.getUserHead(testPublicKey);
      if (retrievedHead !== testPostHash) throw new Error('Retrieved head does not match');
      
      // Test getting all user heads
      const allHeads = await this.getAllUserHeads();
      const foundUser = allHeads.find(user => user.publicKey === testPublicKey);
      if (!foundUser) throw new Error('Test user not found in all heads');
      
      // Test getting active users
      const activeUsers = await this.getActiveUsers();
      const foundActiveUser = activeUsers.find(user => user.publicKey === testPublicKey);
      if (!foundActiveUser) throw new Error('Test user not found in active users');
      
      // Test removing the user
      const removeSuccess = await this.removeUser(testPublicKey);
      if (!removeSuccess) throw new Error('Failed to remove test user');
      
      console.log('✅ PostHeaderService self-test passed');
      return true;
      
    } catch (error) {
      console.error('❌ PostHeaderService self-test failed:', error);
      return false;
    }
  }
}

// Character count: 10,347