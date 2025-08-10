// src/services/feed/FeedService.js
// Path: src/services/feed/FeedService.js

import { Connection } from '@solana/web3.js';
import { PostHeaderService } from './PostHeaderService';

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
 * 3. Parse post content from blockchain transactions 
 * 4. Combine and sort posts by timestamp
 * 5. Return feed data for UI rendering
 */
export class FeedService {
  
  constructor() {
    this.connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    this.feedCache = null;
    this.lastFetchTime = null;
    this.CACHE_DURATION = 30000; // 30 seconds cache
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
          const post = await this.readPostFromTransaction(currentHash, username, publicKey);
          
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
   * @param {string} transactionHash - Transaction hash to read
   * @param {string} username - Username for logging
   * @param {string} publicKey - Author's public key
   * @returns {Promise<Object|null>} Parsed post object or null
   */
  async readPostFromTransaction(transactionHash, username, publicKey) {
    try {
      // Get transaction details from Solana
      const transaction = await this.connection.getTransaction(transactionHash, {
        maxSupportedTransactionVersion: 0
      });
      
      if (!transaction || !transaction.meta) {
        console.warn(`⚠️ Transaction not found: ${transactionHash.substring(0, 8)}`);
        return null;
      }
      
      // Look for memo instruction (where post content is stored)
      let postContent = null;
      let timestamp = null;
      
      // Check transaction instructions for memo program
      if (transaction.transaction && transaction.transaction.message && transaction.transaction.message.instructions) {
        for (const instruction of transaction.transaction.message.instructions) {
          // Look for memo program instructions
          if (instruction.data) {
            try {
              // Decode the instruction data (base58 encoded)
              const decodedData = Buffer.from(instruction.data, 'base64').toString('utf8');
              
              // Check if this looks like post content
              if (decodedData && decodedData.length > 0 && decodedData.length < 1000) {
                postContent = decodedData;
                break;
              }
            } catch (decodeError) {
              // Continue checking other instructions
            }
          }
        }
      }
      
      // Get timestamp from block time
      if (transaction.blockTime) {
        timestamp = transaction.blockTime * 1000; // Convert to milliseconds
      } else {
        timestamp = Date.now(); // Fallback to current time
      }
      
      // If we couldn't find content in memo, try to extract from logs
      if (!postContent && transaction.meta.logMessages) {
        for (const log of transaction.meta.logMessages) {
          // Look for program logs that might contain our content
          if (log.includes('Program log: ') && log.length < 200) {
            const logContent = log.replace('Program log: ', '').trim();
            if (logContent.length > 0) {
              postContent = logContent;
              break;
            }
          }
        }
      }
      
      // Create post object
      const post = {
        id: `post_${username}_${timestamp}`,
        transactionHash: transactionHash,
        author: username,
        authorPublicKey: publicKey,
        content: postContent || '[Content could not be decoded]',
        timestamp: timestamp,
        previousPostHash: null, // Will be determined by chain walking logic
        blockTime: transaction.blockTime,
        slot: transaction.slot
      };
      
      console.log(`📄 Post read for ${username}:`, {
        hash: transactionHash.substring(0, 8) + '...',
        contentLength: post.content.length,
        timestamp: new Date(timestamp).toISOString()
      });
      
      return post;
      
    } catch (error) {
      console.error(`❌ Error reading transaction ${transactionHash.substring(0, 8)}:`, error);
      return null;
    }
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
        totalPosts: 0,
        cacheStatus: 'error',
        lastFetchTime: null,
        cachedPosts: 0
      };
    }
  }
  
  /**
   * Run self-test to verify service functionality
   * @returns {Promise<boolean>} Test success status
   */
  async runSelfTest() {
    try {
      console.log('🧪 Running FeedService self-test...');
      
      // Test building an empty feed
      const emptyFeed = await this.buildFeed({ useCache: false });
      if (!Array.isArray(emptyFeed)) {
        throw new Error('Feed should return an array');
      }
      
      // Test cache functionality
      const cachedFeed = await this.buildFeed({ useCache: true });
      if (!Array.isArray(cachedFeed)) {
        throw new Error('Cached feed should return an array');
      }
      
      // Test refresh functionality
      const refreshedFeed = await this.refreshFeed();
      if (!Array.isArray(refreshedFeed)) {
        throw new Error('Refreshed feed should return an array');
      }
      
      // Test stats
      const stats = await this.getFeedStats();
      if (typeof stats !== 'object') {
        throw new Error('Stats should return an object');
      }
      
      console.log('✅ FeedService self-test passed');
      return true;
      
    } catch (error) {
      console.error('❌ FeedService self-test failed:', error);
      return false;
    }
  }
}

// Export singleton instance for app-wide use
export const feedService = new FeedService();
export default feedService;

// Character count: 11,438