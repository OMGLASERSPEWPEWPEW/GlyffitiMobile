// src/services/publishing/PostPublishingService.js
// Path: src/services/publishing/PostPublishingService.js

import { MobileWalletService } from '../wallet/MobileWalletService';
import { BlockchainService } from '../blockchain/BlockchainService';
import { PostHeaderService } from '../feed/PostHeaderService';

/**
 * PostPublishingService - Dedicated service for social media posts only
 * 
 * This service is specifically for social posts (short-form content) and is 
 * completely separate from PublishingService (long-form content publishing).
 * 
 * Key differences from PublishingService:
 * - No 10-character minimum (can post single characters)
 * - No storage in published content (social posts managed by feed system)
 * - No glyph chunking (posts are single blockchain transactions)
 * - Simpler cost structure (single transaction cost)
 * - Updates user's post chain via PostHeaderService
 * 
 * Architecture:
 * - Social posts: PostPublishingService → Blockchain → FeedService (read via feed)
 * - Published content: PublishingService → PublishedStorage → PublishingScreen
 */
export class PostPublishingService {
  constructor() {
    this.currentWallet = null;
    this.blockchainService = new BlockchainService();
  }

  /**
   * Initialize the service with a wallet
   * @param {MobileWalletService} walletService - Initialized wallet service
   */
  setWallet(walletService) {
    this.currentWallet = walletService;
  }

  /**
   * Get current wallet if available
   * @returns {MobileWalletService|null} Current wallet or null
   */
  getCurrentWallet() {
    return this.currentWallet;
  }

  /**
   * Estimate cost for a social post (single transaction)
   * @param {string} content - Post content
   * @returns {Object} Cost estimation
   */
  estimateCost(content) {
    // Social posts are single transactions, much simpler than published content
    const baseCost = 0.001; // Base Solana transaction fee
    const contentLength = content.length;
    
    // Small additional cost for longer content
    const lengthCost = Math.ceil(contentLength / 100) * 0.0001;
    const estimatedCost = baseCost + lengthCost;
    
    return {
      estimatedCost,
      transactionCount: 1,
      contentLength,
      breakdown: {
        baseFee: baseCost,
        contentFee: lengthCost
      }
    };
  }

  /**
   * Publish a social post to blockchain
   * @param {Object} postData - Post data
   * @param {string} postData.content - Post content (no minimum length)
   * @param {string} postData.authorName - Author's username
   * @param {Function} onProgress - Progress callback (optional)
   * @returns {Promise<Object>} Publishing result
   */
  async publishPost(postData, onProgress = null) {
    try {
      if (!this.currentWallet) {
        throw new Error('No wallet connected. Please connect a wallet first.');
      }

      if (!postData.content || typeof postData.content !== 'string') {
        throw new Error('Post content is required');
      }

      // ✅ NO MINIMUM LENGTH CHECK - social posts can be any length
      const content = postData.content.trim();
      if (content.length === 0) {
        throw new Error('Post cannot be empty');
      }

      const walletKeypair = this.currentWallet.getWalletKeypair();
      if (!walletKeypair) {
        throw new Error('Wallet keypair not available');
      }

      console.log(`📝 Publishing social post: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`);

      // Update progress
      if (onProgress) {
        onProgress({
          progress: 0.1,
          message: 'Preparing social post...',
          currentGlyph: 0,
          totalGlyphs: 1
        });
      }

      // Get user's previous post hash for chain linking
      const authorPublicKey = walletKeypair.publicKey.toBase58();
      let previousPostHash = 'none'; // Default for first post
      
      try {
        const userHead = await PostHeaderService.getUserHead(authorPublicKey);
        if (userHead) {
          previousPostHash = userHead;
        }
      } catch (error) {
        console.log('📝 No previous posts found, this will be the first post');
      }

      if (onProgress) {
        onProgress({
          progress: 0.3,
          message: 'Publishing to blockchain...',
          currentGlyph: 0,
          totalGlyphs: 1
        });
      }

      // Create simple single-glyph content for social posts
        const simpleContent = {
        contentId: `social_post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: `Post by ${postData.authorName}`,
        originalContent: content,
        glyphs: [{
            index: 0,
            content: content,
            hash: Date.now().toString(), // Simple hash
            previousPostHash: previousPostHash
        }],
        authorPublicKey,
        authorName: postData.authorName,
        socialPost: true // Mark as social post
        };

        // Use existing BlockchainService.publishContent
        const result = await this.blockchainService.publishContent(
        simpleContent, 
        walletKeypair, 
        onProgress
        );

      if (onProgress) {
        onProgress({
          progress: 0.8,
          message: 'Updating post chain...',
          currentGlyph: 1,
          totalGlyphs: 1
        });
      }

      // Update user's head pointer to this new post
      const transactionHash = result.transactionId || result.signature;
      await PostHeaderService.updateUserHead(
        authorPublicKey,
        postData.authorName,
        transactionHash
      );

      if (onProgress) {
        onProgress({
          progress: 1.0,
          message: 'Social post published successfully!',
          currentGlyph: 1,
          totalGlyphs: 1
        });
      }

      console.log('✅ Social post published successfully:', transactionHash);

      return {
        success: true,
        transactionId: transactionHash,
        transactionIds: [transactionHash], // For compatibility
        contentId: `social_post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        totalCost: result.cost || this.estimateCost(content).estimatedCost,
        postLength: content.length,
        publishedAt: Date.now(),
        type: 'social_post' // Mark as social post
      };

    } catch (error) {
      console.error('❌ Social post publishing failed:', error);
      
      if (onProgress) {
        onProgress({
          progress: 0,
          message: `Publishing failed: ${error.message}`,
          currentGlyph: 0,
          totalGlyphs: 1,
          error: true
        });
      }

      throw error;
    }
  }

  /**
   * Validate post content (much more permissive than published content)
   * @param {string} content - Post content to validate
   * @returns {Object} Validation result
   */
  validatePostContent(content) {
    if (!content || typeof content !== 'string') {
      return {
        valid: false,
        error: 'Content must be a string'
      };
    }

    const trimmedContent = content.trim();
    
    if (trimmedContent.length === 0) {
      return {
        valid: false,
        error: 'Post cannot be empty'
      };
    }

    // Social posts can be up to 280 characters (Twitter-style)
    if (trimmedContent.length > 280) {
      return {
        valid: false,
        error: 'Post exceeds 280 character limit'
      };
    }

    return {
      valid: true,
      length: trimmedContent.length,
      remaining: 280 - trimmedContent.length
    };
  }

  /**
   * Get service information
   * @returns {Object} Service information
   */
  getServiceInfo() {
    return {
      name: 'PostPublishingService',
      version: '1.0.0',
      purpose: 'Social media post publishing',
      components: [
        'BlockchainService',
        'PostHeaderService'
      ],
      capabilities: [
        'Single-transaction social posts',
        'No minimum content length',
        'Post chain management',
        'Real-time cost estimation',
        'Twitter-style character limits'
      ],
      differences: [
        'Separate from PublishingService (long-form content)',
        'No glyph chunking',
        'No published content storage',
        'Managed via social feed system'
      ]
    };
  }

    /**
     * Alias for estimateCost to match PublishingService API
     */
  estimatePublishing(content) {
    return this.estimateCost(content);
  }

    /**
     * Alias for publishPost to match PublishingService API  
     */
  async publishContent(contentData, onProgress) {
    return await this.publishPost(contentData, onProgress);
  }

  /**
   * Run self-test to verify service functionality
   * @returns {Promise<Object>} Test results
   */
  async runSelfTest() {
    const results = {
      serviceCreation: false,
      costEstimation: false,
      contentValidation: false,
      walletIntegration: false,
      overallSuccess: false,
      errors: []
    };

    try {
      // Test service creation
      const testService = new PostPublishingService();
      results.serviceCreation = !!testService;

      // Test cost estimation
      const costEstimate = testService.estimateCost('Test post content');
      results.costEstimation = costEstimate && typeof costEstimate.estimatedCost === 'number';

      // Test content validation
      const validation = testService.validatePostContent('Valid post');
      results.contentValidation = validation && validation.valid === true;

      // Test empty content validation
      const emptyValidation = testService.validatePostContent('');
      const emptyValidationCorrect = emptyValidation && emptyValidation.valid === false;

      // Test wallet integration (without actual wallet)
      const noWallet = testService.getCurrentWallet();
      results.walletIntegration = noWallet === null; // Should be null initially

      results.overallSuccess = results.serviceCreation && 
                              results.costEstimation && 
                              results.contentValidation && 
                              emptyValidationCorrect &&
                              results.walletIntegration;

      if (results.overallSuccess) {
        console.log('✅ PostPublishingService self-test passed');
      } else {
        console.log('❌ PostPublishingService self-test failed. See errors for details.');
      }

      return results;
    } catch (error) {
      console.error('Self-test failed with error:', error);
      results.errors.push(`Self-test execution failed: ${error.message}`);
      return results;
    }
  }
}

// Character count: 7821