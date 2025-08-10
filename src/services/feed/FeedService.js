// src/services/feed/FeedService.js
// Path: src/services/feed/FeedService.js

import { Connection } from '@solana/web3.js';
import { PostHeaderService } from './PostHeaderService';
import { PostTransactionReader } from '../blockchain/PostTransactionReader';

/**
 * FeedService
 * 
 * Main service for building social feeds by reading user post chains from blockchain.
 * Uses PostHeaderService to get user heads, then walks their chains backward to
 * collect recent posts for feed construction.
 * 
 * Architecture:
 * 1. Get active users from PostHeaderService
 * 2. For each user, walk their post chain backward from latest post
 * 3. Parse post content from blockchain transactions using PostTransactionReader
 * 4. Combine and sort posts by timestamp
 * 5. Return feed data for UI rendering
 */
export class FeedService {
  
  constructor() {
    this.connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    this.feedCache = null;
    this.lastFetchTime = null;
    this.CACHE_DURATION = 30000; // 30 seconds cache
    
    // Use the new PostTransactionReader for proper post decoding
    this.postReader = new PostTransactionReader();
  }
  
  /**
   * Build social feed from all active users
   * @param {Object} options - Feed options
   * @param {number} options.limit - Maximum posts per user (default: 3)
   * @param {number} options.maxTotalPosts - Maximum total posts in feed (default: 20)
   * @param {boolean} options.useCache - Whether to use cached data (default: true)
   * @returns {Promise<Array>} Array of feed posts
   */
  async buildFeed(options = {}) {
    const {
      limit = 3,
      maxTotalPosts = 20,
      useCache = true
    } = options;
    
    try {
      // Check cache first
      if (useCache && this.isCacheValid()) {
        console.log('📰 Using cached feed data');
        return this.feedCache;
      }
      
      console.log('🔄 Building fresh social feed...');
      const startTime = Date.now();
      
      // Get all users who have posted
      const activeUsers = await PostHeaderService.getActiveUsers();
      
      if (activeUsers.length === 0) {
        console.log('📭 No active users found');
        return [];
      }
      
      console.log('👥 Found active users:', {
        count: activeUsers.length,
        users: activeUsers.map(u => u.username).join(', ')
      });
      
      // Collect posts from all users
      const allPosts = [];
      
      for (const user of activeUsers) {
        try {
          const userPosts = await this.getUserRecentPosts(
            user.publicKey,
            user.username,
            user.latestPostHash,
            limit
          );
          
          allPosts.push(...userPosts);
          
        } catch (error) {
          console.error(`❌ Error getting posts for ${user.username}:`, error.message);
          // Continue with other users even if one fails
        }
      }
      
      // Sort posts by timestamp (newest first)
      allPosts.sort((a, b) => b.timestamp - a.timestamp);
      
      // Limit total posts
      const feedPosts = allPosts.slice(0, maxTotalPosts);
      
      // Cache the results
      this.feedCache = feedPosts;
      this.lastFetchTime = Date.now();
      
      const duration = Date.now() - startTime;
      console.log('✅ Feed built successfully:', {
        totalPosts: feedPosts.length,
        fromUsers: activeUsers.length,
        duration: `${duration}ms`
      });
      
      return feedPosts;
      
    } catch (error) {
      console.error('❌ Error building feed:', error);
      return [];
    }
  }
  
  /**
   * Get recent posts from a specific user by walking their chain backward
   * @param {string} publicKey - User's public key
   * @param {string} username - User's username
   * @param {string} latestPostHash - User's latest post transaction hash
   * @param {number} limit - Maximum number of posts to retrieve
   * @returns {Promise<Array>} Array of user's recent posts
   */
  async getUserRecentPosts(publicKey, username, latestPostHash, limit = 3) {
    try {
      if (!latestPostHash) {
        console.log(`📭 No posts found for ${username}`);
        return [];
      }
      
      console.log(`📖 Reading posts for ${username}...`);
      
      const posts = [];
      let currentHash = latestPostHash;
      let postsRead = 0;
      
      // Walk backward through user's post chain
      while (currentHash && postsRead < limit) {
        try {
          // Use PostTransactionReader for proper post decoding
          const post = await this.postReader.readPostFromTransaction(currentHash, username, publicKey);
          
          if (post) {
            posts.push(post);
            postsRead++;
            
            // Get previous post hash to continue chain walking
            currentHash = post.previousPostHash;
            
            // Stop if we reach the beginning of the chain
            if (!currentHash || currentHash === 'none') {
              break;
            }
          } else {
            // Failed to read this post, stop chain walking
            break;
          }
          
        } catch (error) {
          console.error(`❌ Error reading post ${currentHash.substring(0, 8)}:`, error.message);
          break; // Stop chain walking on error
        }
      }
      
      console.log(`📚 Retrieved ${posts.length} posts for ${username}`);
      return posts;
      
    } catch (error) {
      console.error(`❌ Error getting recent posts for ${username}:`, error);
      return [];
    }
  }
  
  /**
   * Read and parse a single post from a blockchain transaction
   * @deprecated - Use PostTransactionReader.readPostFromTransaction instead
   * @param {string} transactionHash - Transaction hash to read
   * @param {string} username - Username for logging
   * @param {string} publicKey - Author's public key
   * @returns {Promise<Object|null>} Parsed post object or null
   */
  async readPostFromTransaction(transactionHash, username, publicKey) {
    console.warn('⚠️ FeedService.readPostFromTransaction is deprecated. Use PostTransactionReader instead.');
    return await this.postReader.readPostFromTransaction(transactionHash, username, publicKey);
  }
  
  /**
   * Refresh feed by clearing cache and rebuilding
   * @param {Object} options - Feed options
   * @returns {Promise<Array>} Fresh feed data
   */
  async refreshFeed(options = {}) {
    console.log('🔄 Refreshing feed...');
    
    // Clear cache
    this.feedCache = null;
    this.lastFetchTime = null;
    
    // Build fresh feed
    return await this.buildFeed({ ...options, useCache: false });
  }
  
  /**
   * Check if cached feed data is still valid
   * @returns {boolean} True if cache is valid
   */
  isCacheValid() {
    if (!this.feedCache || !this.lastFetchTime) {
      return false;
    }
    
    const cacheAge = Date.now() - this.lastFetchTime;
    return cacheAge < this.CACHE_DURATION;
  }
  
  /**
   * Get feed statistics
   * @returns {Promise<Object>} Feed statistics
   */
  async getFeedStats() {
    try {
      const userStats = await PostHeaderService.getStats();
      
      return {
        ...userStats,
        cacheStatus: this.isCacheValid() ? 'valid' : 'expired',
        lastFetchTime: this.lastFetchTime ? new Date(this.lastFetchTime).toISOString() : null,
        cachedPosts: this.feedCache ? this.feedCache.length : 0
      };
      
    } catch (error) {
      console.error('❌ Error getting feed stats:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        cacheStatus: 'error',
        error: error.message
      };
    }
  }
  
  /**
   * Clear all caches
   */
  clearCache() {
    this.feedCache = null;
    this.lastFetchTime = null;
    this.postReader.clearCache();
    console.log('🗑️ Feed cache cleared');
  }
  
  /**
   * Test feed service connectivity
   * @returns {Promise<boolean>} True if service is working
   */
  async testConnection() {
    try {
      const postReaderOk = await this.postReader.testConnection();
      const headerServiceOk = await PostHeaderService.testConnection();
      
      const result = postReaderOk && headerServiceOk;
      console.log('🔗 Feed service connectivity test:', result ? 'PASSED' : 'FAILED');
      
      return result;
    } catch (error) {
      console.error('❌ Feed service connectivity test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const feedService = new FeedService();

// Character count: 6854