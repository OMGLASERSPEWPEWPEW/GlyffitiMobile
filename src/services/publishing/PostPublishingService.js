// src/services/publishing/PostPublishingService.js
// Path: src/services/publishing/PostPublishingService.js

import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { BlockchainService } from '../blockchain/BlockchainService';
import { ContentService } from '../content/ContentService';
import { HashingService } from '../hashing/HashingService';
 
/**
 * PostPublishingService
 * 
 * Specialized service for publishing short social media posts to the blockchain.
 * Maintains user post chains by linking each post to the user's previous post,
 * preserving the integrity of the user's genesis block chain.
 * 
 * Key Features:
 * - Maintains post chain integrity (each post links to previous)
 * - Uses user's individual wallet for payment
 * - Uses ContentService for proper content preparation and compression
 * - Updates user's last post hash after successful publishing
 * - Stores post chain metadata for tracking
 * 
 * Architecture:
 * - Each user has a genesis block (from account creation)
 * - Posts form a chain: genesis -> post1 -> post2 -> post3...
 * - Each post references the hash of the previous post
 * - The user's profile stores the hash of their most recent post
 */
class PostPublishingService {
  
  constructor() {
    this.connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    this.blockchainService = new BlockchainService();
    
    // State management
    this.activePublishings = new Map(); // Track ongoing publications
    this.postChainData = this.loadPostChainData(); // Load existing chain data
  }

  // ==================== POST CHAIN MANAGEMENT ====================

  /**
   * Load post chain data from storage
   * This tracks the last post hash for each user to maintain chain integrity
   * @returns {Object} Post chain data structure
   */
  loadPostChainData() {
    try {
      // For now, use a simple in-memory structure
      // In production, this would be stored persistently
      return {
        userChains: {}, // { username: { lastPostHash, postCount, genesisHash } }
        globalPosts: [], // Array of all posts for feed display
        lastUpdated: Date.now()
      };
    } catch (error) {
      console.error('❌ Error loading post chain data:', error);
      return {
        userChains: {},
        globalPosts: [],
        lastUpdated: Date.now()
      };
    }
  }

  /**
   * Save post chain data to storage
   * @param {Object} chainData - Updated chain data
   */
  async savePostChainData(chainData) {
    try {
      this.postChainData = chainData;
      this.postChainData.lastUpdated = Date.now();
      
      // TODO: In production, persist to file system or database
      console.log('💾 Post chain data updated:', {
        userCount: Object.keys(chainData.userChains).length,
        totalPosts: chainData.globalPosts.length
      });
      
    } catch (error) {
      console.error('❌ Error saving post chain data:', error);
    }
  }

  /**
   * Get user's last post hash for chain linking
   * @param {string} username - Username to look up
   * @returns {string|null} Last post hash or null if first post
   */
  getUserLastPostHash(username) {
    const userChain = this.postChainData.userChains[username];
    return userChain ? userChain.lastPostHash : null;
  }

  /**
   * Update user's chain after successful post
   * @param {string} username - Username
   * @param {string} postHash - New post hash
   * @param {string} genesisHash - User's genesis hash (from registry)
   */
  async updateUserChain(username, postHash, genesisHash) {
    if (!this.postChainData.userChains[username]) {
      this.postChainData.userChains[username] = {
        genesisHash: genesisHash,
        postCount: 0,
        firstPostHash: null,
        lastPostHash: null,
        createdAt: Date.now()
      };
    }

    const userChain = this.postChainData.userChains[username];
    
    // If this is the first post, record it
    if (userChain.postCount === 0) {
      userChain.firstPostHash = postHash;
    }
    
    userChain.lastPostHash = postHash;
    userChain.postCount += 1;
    userChain.updatedAt = Date.now();
    
    await this.savePostChainData(this.postChainData);
  }

  // ==================== POST PREPARATION ====================

  /**
   * Prepare social post for blockchain publishing
   * ✅ FIX: Now uses ContentService.prepareContent() for proper compression and encoding
   * @param {Object} postData - Post data from PostComposer
   * @param {Object} userKeypair - User's wallet keypair
   * @returns {Promise<Object>} Prepared post content
   */
  async preparePost(postData, userKeypair) {
    try {
      console.log('📝 Preparing social post for blockchain...');
      
      const { content, author, authorPublicKey, timestamp } = postData;
      
      // Get user's last post hash for chain linking
      const previousPostHash = this.getUserLastPostHash(author);
      
      // ✅ FIX: Create contentData in the format ContentService expects
      const contentData = {
        content: content.trim(),
        filename: `${author}_post_${timestamp}.txt`,
        size: content.trim().length,
        type: 'text/plain'
      };
      
      const postTitle = `Post by ${author}`;
      
      // Create enhanced metadata for social posts
      const socialPostOptions = {
        authorName: author,
        socialPost: true,
        previousPostHash: previousPostHash,
        postType: 'social-post',
        version: '1.0'
      };
      
      // ✅ FIX: Use ContentService.prepareContent() instead of manual preparation
      // This handles compression, proper glyph creation, and base64 encoding
      const preparedContent = await ContentService.prepareContent(
        contentData,
        postTitle,
        authorPublicKey,
        socialPostOptions
      );
      
      // Add social post specific metadata to the prepared content
      preparedContent.type = 'social-post';
      preparedContent.socialMetadata = {
        previousPostHash: previousPostHash,
        isFirstPost: previousPostHash === null,
        chainPosition: this.postChainData.userChains[author]?.postCount + 1 || 1
      };
      
      console.log('✅ Post prepared:', {
        contentId: preparedContent.contentId,
        author: author,
        glyphCount: preparedContent.glyphs.length,
        previousPostHash: previousPostHash ? 
          `${previousPostHash.substring(0, 8)}...` : 'none (first post)'
      });
      
      return preparedContent;
      
    } catch (error) {
      console.error('❌ Error preparing post:', error);
      throw new Error(`Failed to prepare post: ${error.message}`);
    }
  }

  // ==================== PUBLISHING OPERATIONS ====================

  /**
   * Publish a social post to the blockchain
   * Uses the user's individual wallet for payment
   * @param {Object} postData - Post data from PostComposer
   * @param {Object} userKeypair - User's wallet keypair for signing and payment
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} Publishing result
   */
  async publishPost(postData, userKeypair, onProgress = null) {
    const startTime = Date.now();
    const publishingId = `post_${postData.author}_${postData.timestamp}`;
    
    try {
      console.log('🚀 Starting post publication:', {
        author: postData.author,
        contentLength: postData.content.length,
        publishingId: publishingId
      });
      
      // Check user wallet balance
      const balance = await this.connection.getBalance(userKeypair.publicKey);
      const balanceSOL = balance / LAMPORTS_PER_SOL;
      
      console.log(`💰 User wallet balance: ${balanceSOL.toFixed(4)} SOL`);
      
      if (balanceSOL < 0.001) {
        throw new Error(`Insufficient balance. Need at least 0.001 SOL, have ${balanceSOL.toFixed(4)} SOL`);
      }
      
      // Update progress: preparation stage
      if (onProgress) {
        onProgress({
          stage: 'preparing',
          progress: 0.1,
          currentStep: 'Preparing post content...',
          publishingId: publishingId
        });
      }
      
      // ✅ FIX: Use the fixed preparePost method that leverages ContentService
      const preparedContent = await this.preparePost(postData, userKeypair);
      
      // Update progress: publishing stage
      if (onProgress) {
        onProgress({
          stage: 'publishing',
          progress: 0.3,
          currentStep: 'Publishing to blockchain...',
          publishingId: publishingId
        });
      }
      
      // ✅ The BlockchainService can now properly handle the correctly prepared content
      const publishResult = await this.blockchainService.publishContent(
        preparedContent,
        userKeypair,
        (blockchainProgress) => {
          if (onProgress) {
            onProgress({
              stage: 'blockchain',
              progress: 0.3 + (blockchainProgress.progress * 0.6), // 30% to 90%
              currentStep: `Publishing glyph ${blockchainProgress.currentGlyph || 1} of ${blockchainProgress.totalGlyphs || 1}`,
              publishingId: publishingId,
              blockchainProgress: blockchainProgress
            });
          }
        }
      );
      
      // Create post hash for chain linking
      const postHash = await HashingService.hashContent(preparedContent.contentId + postData.timestamp);
      
      // Update user's post chain
      await this.updateUserChain(postData.author, postHash, postData.genesisHash || 'unknown');
      
      // Create post record for global feed
      const postRecord = {
        id: publishingId,
        author: postData.author,
        content: postData.content,
        timestamp: postData.timestamp,
        postHash: postHash,
        transactionId: publishResult.transactionIds?.[0] || 'unknown',
        publishedAt: Date.now()
      };
      
      this.postChainData.globalPosts.unshift(postRecord); // Add to beginning (newest first)
      await this.savePostChainData(this.postChainData);
      
      // Final progress update
      if (onProgress) {
        onProgress({
          stage: 'complete',
          progress: 1.0,
          currentStep: 'Post published successfully!',
          publishingId: publishingId
        });
      }
      
      const duration = Date.now() - startTime;
      
      console.log('✅ Post published successfully:', {
        publishingId: publishingId,
        author: postData.author,
        transactionId: publishResult.transactionIds?.[0],
        postHash: postHash.substring(0, 16) + '...',
        duration: `${duration}ms`,
        cost: `~${publishResult.totalCost || 'unknown'} SOL`
      });
      
      return {
        success: true,
        publishingId: publishingId,
        postHash: postHash,
        transactionId: publishResult.transactionIds?.[0],
        cost: publishResult.totalCost,
        duration: duration,
        postRecord: postRecord
      };
      
    } catch (error) {
      console.error('❌ Post publication failed:', error);
      
      if (onProgress) {
        onProgress({
          stage: 'error',
          progress: 0,
          currentStep: `Error: ${error.message}`,
          publishingId: publishingId,
          error: error.message
        });
      }
      
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get user's post history
   * @param {string} username - Username to get posts for
   * @returns {Array} Array of user's posts
   */
  getUserPosts(username) {
    return this.postChainData.globalPosts.filter(post => post.author === username);
  }

  /**
   * Get global post feed
   * @param {number} limit - Maximum number of posts to return
   * @returns {Array} Array of recent posts
   */
  getGlobalFeed(limit = 50) {
    return this.postChainData.globalPosts.slice(0, limit);
  }

  /**
   * Get user's post chain info
   * @param {string} username - Username to get chain info for
   * @returns {Object|null} Chain information or null if user has no posts
   */
  getUserChainInfo(username) {
    return this.postChainData.userChains[username] || null;
  }

  /**
   * Estimate cost for a post
   * @param {string} content - Post content
   * @returns {Promise<number>} Estimated cost in SOL
   */
  async estimatePostCost(content) {
    try {
      // ✅ FIX: Use ContentService estimation instead of manual calculation
      const estimation = await ContentService.estimatePublishing(content);
      return estimation.sol || 0.001; // Default fallback
    } catch (error) {
      console.error('❌ Error estimating cost:', error);
      return 0.001; // Default fallback
    }
  }

  /**
   * Validate post content before publishing
   * @param {Object} postData - Post data to validate
   * @returns {Object} Validation result
   */
  validatePost(postData) {
    const errors = [];
    
    if (!postData.content || postData.content.trim().length === 0) {
      errors.push('Post content cannot be empty');
    }
    
    if (postData.content.length > 1000) { // Reasonable limit for social posts
      errors.push('Post content too long (max 1000 characters)');
    }
    
    if (!postData.author || !postData.authorPublicKey) {
      errors.push('Author information missing');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
}

// Export singleton instance
export const postPublishingService = new PostPublishingService();
export default postPublishingService;

// Character count: 11,247