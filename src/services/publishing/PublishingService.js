// src/services/publishing/PublishingService.js
// Path: src/services/publishing/PublishingService.js
import { MobileWalletService } from '../wallet/MobileWalletService';
import { ContentService } from '../content/ContentService';
import { BlockchainService } from '../blockchain/BlockchainService';
import { StorageService } from '../storage/StorageService';
import { UserStorageService } from '../storage/UserStorageService';
import { StoryHeaderService } from '../feed/StoryHeaderService';

/**
 * Mobile Publishing Service - Main orchestrator for publishing content
 * Refactored to use separate managers for better organization and maintainability
 */
export class PublishingService {
  constructor() {
    this.currentWallet = null;
    this.blockchainPublisher = new BlockchainService();
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

  // ==================== CONTENT MANAGEMENT ====================

  /**
   * File picker with expanded format support
   * @returns {Promise<Object|null>} Content object or null
   */
  async pickAndLoadFile() {
    const fileContent = await ContentService.pickAndLoadFile();
    if (!fileContent) {
      return null;
    }

    // Return in the format expected by existing code
    return {
      id: `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: fileContent.filename ? fileContent.filename.replace(/\.[^/.]+$/, '') : 'Untitled',
      content: fileContent.content,
      filename: fileContent.filename,
      size: fileContent.size,
      type: fileContent.type,
      authorPublicKey: this.currentWallet ? this.currentWallet.getWalletPublicKey() : 'unknown',
      createdAt: Date.now()
    };
  }

  /**
   * Manual text entry
   * @param {string} text - Text content
   * @param {string} title - Content title
   * @returns {Object} Content object
   */
  createTextContent(text, title = 'Manual Entry') {
    return ContentService.createTextContent(text, title);
  }

  async saveUserPublishedContent(content, userPublicKey) {
  // Save to user storage instead of global storage
  return await UserStorageService.savePublishedStory(content, userPublicKey);
  }

  /**
   * Prepare content for publishing with enhanced validation
   * @param {Object} contentData - Content from file or manual entry
   * @param {string} title - Publishing title
   * @param {Object} options - Publishing options
   * @returns {Promise<Object>} Prepared content ready for publishing
   */
  async prepareContent(contentData, title, options = {}) {
    try {
    if (!this.currentWallet) {
    throw new Error('No wallet connected. Please connect a wallet first.');
    }
    const keypair = this.currentWallet.getWalletKeypair();
    if (!keypair) {
    throw new Error('Unable to access wallet keypair');
    }

    // Get previous story hash for story chain
    let previousStoryHash = null;
    try {
    previousStoryHash = await StoryHeaderService.getUserStoryHead(keypair.publicKey.toString());
    console.log('PublishingService.prepareContent: Previous story hash found:', previousStoryHash ? previousStoryHash.substring(0, 8) + '...' : 'none (first story)');
    } catch (error) {
    console.error('PublishingService.prepareContent: Error getting previous story hash:', error);
    // Continue with null - will be handled as first story
    }

    return await ContentService.prepareContent(
    contentData,
    title,
    keypair.publicKey.toString(),
    {
    ...options,
    authorName: options.authorName || `User_${keypair.publicKey.toString().substring(0, 8)}`,
    previousStoryHash: previousStoryHash
    }
    );
    } catch (error) {
      console.error('Error preparing content:', error);
      throw error;
    }
  }

  /**
   * Estimate publishing cost and time for content
   * @param {string|Object} content - Content text or content object
   * @returns {Object} Publishing estimate
   */
  estimatePublishing(content) {
    try {
      // Handle both string content and content objects
      let contentText = '';
      
      if (typeof content === 'string') {
        contentText = content;
      } else if (content && content.content) {
        contentText = content.content;
      } else {
        console.warn('Invalid content type for estimation, using empty string');
        contentText = '';
      }
      
      if (!contentText || contentText.trim().length === 0) {
        return {
          glyphCount: 0,
          estimatedCost: 0,
          currency: 'SOL',
          estimatedTimeMinutes: 0,
          compressionRatio: 1,
          spaceSaved: 0,
          error: 'Content is empty'
        };
      }
      
      return ContentService.estimatePublishing(contentText);
    } catch (error) {
      console.error('Error in publishing estimation:', error);
      return {
        glyphCount: 0,
        estimatedCost: 0,
        currency: 'SOL',
        estimatedTimeMinutes: 0,
        compressionRatio: 1,
        spaceSaved: 0,
        error: error.message
      };
    }
  }

  /**
   * Validate content structure
   * @param {Object} content - Content to validate
   * @returns {boolean} True if valid
   */
  validateContent(content) {
    return ContentService.validateContent(content);
  }

  /**
   * Get content statistics
   * @param {Object} content - Content to analyze
   * @returns {Object} Content statistics
   */
  getContentStats(content) {
    return ContentService.getContentStats(content);
  }

  // ==================== PUBLISHING OPERATIONS ====================

  /**
   * Publish prepared content to blockchain with enhanced error handling and scroll creation
   * @param {Object} content - Content object (raw or prepared)
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} Publishing result with scroll information
   */
  /**
 * Publish prepared content to blockchain with enhanced error handling and scroll creation
 * @param {Object} content - Content object (raw or prepared)
 * @param {Function} onProgress - Progress callback
 * @param {string} userPublicKey - User's public key for scoped storage
 * @returns {Promise<Object>} Publishing result with scroll information
 */
async publishContent(content, onProgress = null, userPublicKey = null) {
  try {
    if (!this.currentWallet) {
      throw new Error('PublishingService: No wallet connected');
    }

    // ✅ FIXED: Enhanced validation to handle both raw and prepared content
    if (!content) {
      throw new Error('PublishingService: No content provided');
    }

    // Check if content is prepared (has glyphs) or raw (has content text)
    const isPreparedContent = content.glyphs && Array.isArray(content.glyphs) && content.glyphs.length > 0;
    const isRawContent = content.content && typeof content.content === 'string' && content.content.trim().length > 0;

    if (!isPreparedContent && !isRawContent) {
      throw new Error('PublishingService: No valid content to publish - content must have either text content or prepared glyphs');
    }

    const keypair = this.currentWallet.getWalletKeypair();
    if (!keypair) {
      throw new Error('PublishingService: Unable to access wallet keypair');
    }

    // Check if content is already prepared (has glyphs) or needs preparation
    let preparedContent;
    if (isPreparedContent) {
      // Content is already prepared
      console.log('PublishingService: ✅ Using pre-prepared content with', content.glyphs.length, 'glyphs');
      preparedContent = content;
    } else {
      // Content needs to be prepared first
      console.log('PublishingService: 📝 Preparing content for publishing...');
      
      const contentData = {
        content: content.content,
        filename: content.filename || `${content.title || 'Untitled'}.txt`,
        size: content.content.length,
        type: content.type || 'text/plain'
      };

      preparedContent = await this.prepareContent(
        contentData,
        content.title || 'Untitled',
        {
          authorName: content.authorName
        }
      );
    }

    // ✅ FIXED: Pass userPublicKey to the blockchain publisher for user-scoped storage
    return await this.blockchainPublisher.publishContent(
      preparedContent, 
      keypair, 
      onProgress, 
      'solana', // blockchain type
      userPublicKey // Pass user context for scoped storage
    );
    
  } catch (error) {
    console.error('❌ PublishingService:', error);
    throw error;
  }
}


  /**
   * Resume publishing from a failed or partial state
   * @param {string} contentId - Content ID to resume
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} Publishing result
   */
  async resumePublishing(contentId, onProgress = null) {
    try {
      if (!this.currentWallet) {
        throw new Error('No wallet connected');
      }

      const keypair = this.currentWallet.getWalletKeypair();
      if (!keypair) {
        throw new Error('Unable to access wallet keypair');
      }

      return await this.blockchainPublisher.resumePublishing(contentId, keypair, onProgress);
    } catch (error) {
      console.error('❌ Error resuming publishing:', error);
      throw error;
    }
  }

  /**
   * Get publishing status for active publishing operations
   * @param {string} contentId - Content ID to check
   * @returns {Object|null} Current status or null
   */
  getPublishingStatus(contentId) {
    return this.blockchainPublisher.getPublishingStatus(contentId);
  }

  /**
   * Cancel an active publishing operation
   * @param {string} contentId - Content ID to cancel
   * @returns {Promise<boolean>} Success status
   */
  async cancelPublishing(contentId) {
    return await this.blockchainPublisher.cancelPublishing(contentId);
  }

  /**
   * Get all active publishing operations
   * @returns {Array} Array of active publishing statuses
   */
  getActivePublishing() {
    return this.blockchainPublisher.getActivePublishing();
  }

  // ==================== STORAGE OPERATIONS ====================

  /**
   * Get in-progress content as array (fixed to use new storage manager)
   * @returns {Promise<Array>} Array of in-progress content
   */
  async getInProgressContent() {
    return await StorageService.getInProgressContentArray();
  }

  /**
   * Get in-progress content as array
   * @returns {Promise<Array>} Array of in-progress content
   */
  async getInProgressContentArray() {
    return await StorageService.getInProgressContentArray();
  }

  /**
   * Get all published content
   * @returns {Promise<Array>} Array of published content (fixed to use new storage manager)
   */
  async getPublishedContent() {
    return await StorageService.getPublishedContentArray();
  }

  /**
   * Get published content as array sorted by date
   * @returns {Promise<Array>} Array of published content
   */
  async getPublishedContentArray() {
    return await StorageService.getPublishedContentArray();
  }

  /**
   * Get published content by ID
   * @param {string} contentId - Content ID to retrieve
   * @returns {Promise<Object|null>} Published content or null
   */
  async getPublishedContentById(contentId) {
    return await StorageService.getPublishedContentById(contentId);
  }

  /**
   * Delete published content
   * @param {string} contentId - Content ID to delete
   * @returns {Promise<boolean>} Success status
   */
  async deletePublishedContent(contentId) {
    return await StorageService.deletePublishedContent(contentId);
  }

  /**
   * Find content by search criteria
   * @param {string} searchTerm - Search term
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  async searchContent(searchTerm, options = {}) {
    return await StorageService.searchContent(searchTerm, options);
  }

  /**
   * Get storage statistics
   * @returns {Promise<Object>} Storage statistics
   */
  async getStorageStats() {
    return await StorageService.getStorageStats();
  }

  /**
   * Clear all storage (for testing/debugging)
   * @returns {Promise<boolean>} Success status
   */
  async clearAllStorage() {
    return await StorageService.clearAllStorage();
  }

  /**
   * Export all data for backup
   * @returns {Promise<string>} JSON string of all data
   */
  async exportAllData() {
    return await StorageService.exportAllData();
  }

  /**
   * Import data from backup
   * @param {string} jsonData - JSON string of backup data
   * @param {boolean} merge - Whether to merge with existing data
   * @returns {Promise<Object>} Import results
   */
  async importData(jsonData, merge = true) {
    return await StorageService.importData(jsonData, merge);
  }

  // ==================== LEGACY COMPATIBILITY METHODS ====================

  /**
   * Get drafts (for compatibility with existing code)
   * @returns {Promise<Array>} Array of draft content
   */
  async getDrafts() {
    // Map in-progress content to draft format for compatibility
    const inProgress = await this.getInProgressContentArray();
    return inProgress.map(content => ({
      id: content.contentId,
      title: content.title,
      content: content.originalContent,
      savedAt: content.lastUpdated || content.createdAt,
      ...content
    }));
  }

  /**
   * Save draft (for compatibility with existing code)
   * @param {Object} content - Content to save as draft
   * @returns {Promise<boolean>} Success status
   */
  async saveDraft(content) {
    try {
      // Convert draft format to in-progress format
      const inProgressContent = {
        contentId: content.id || `draft_${Date.now()}`,
        title: content.title,
        originalContent: content.content,
        authorPublicKey: content.authorPublicKey || 'unknown',
        glyphs: content.glyphs || [],
        createdAt: content.savedAt || Date.now(),
        status: 'draft'
      };
      
      return await StorageService.saveInProgressContent(inProgressContent);
    } catch (error) {
      console.error('Error saving draft:', error);
      return false;
    }
  }

  // ==================== BLOCKCHAIN OPERATIONS ====================

  /**
   * Check blockchain connection status
   * @returns {Promise<Object>} Connection status
   */
  async checkConnection() {
    return await this.blockchainPublisher.checkConnection();
  }

  /**
   * Estimate transaction costs
   * @param {number} glyphCount - Number of glyphs to publish
   * @returns {Promise<Object>} Cost estimation
   */
  async estimateTransactionCosts(glyphCount) {
    return await this.blockchainPublisher.estimateTransactionCosts(glyphCount);
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get service health status
   * @returns {Promise<Object>} Health status of all components
   */
  async getHealthStatus() {
    try {
      const [storageStats, connectionStatus] = await Promise.all([
        this.getStorageStats(),
        this.checkConnection()
      ]);

      return {
        wallet: {
          connected: !!this.currentWallet,
          hasKeypair: this.currentWallet ? !!(await this.currentWallet.getKeypair()) : false
        },
        storage: {
          ...storageStats,
          accessible: true
        },
        blockchain: connectionStatus,
        activePublishing: this.getActivePublishing().length,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error getting health status:', error);
      return {
        wallet: { connected: false, hasKeypair: false },
        storage: { accessible: false, error: error.message },
        blockchain: { connected: false, error: error.message },
        activePublishing: 0,
        timestamp: Date.now(),
        error: error.message
      };
    }
  }

  /**
   * Run comprehensive self-test of all components
   * @returns {Promise<Object>} Test results
   */
  async runSelfTest() {
    try {
      console.log('Running PublishingService comprehensive self-test...');
      
      const results = {
        contentManager: false,
        storageManager: false,
        blockchainPublisher: false,
        overallSuccess: false,
        errors: []
      };

      // Test ContentManager
      try {
        results.contentManager = await ContentService.runSelfTest();
      } catch (error) {
        results.errors.push(`ContentManager test failed: ${error.message}`);
      }

      // Test StorageManager
      try {
        results.storageManager = await StorageService.runSelfTest();
      } catch (error) {
        results.errors.push(`StorageManager test failed: ${error.message}`);
      }

      // Test BlockchainPublisher
      try {
        results.blockchainPublisher = await this.blockchainPublisher.runSelfTest();
      } catch (error) {
        results.errors.push(`BlockchainPublisher test failed: ${error.message}`);
      }

      // Overall success
      results.overallSuccess = results.contentManager && results.storageManager && results.blockchainPublisher;

      if (results.overallSuccess) {
        console.log('🎉 PublishingService comprehensive self-test passed!');
      } else {
        console.log('❌ PublishingService self-test failed. See errors for details.');
      }

      return results;
    } catch (error) {
      console.error('Self-test failed with error:', error);
      return {
        contentManager: false,
        storageManager: false,
        blockchainPublisher: false,
        overallSuccess: false,
        errors: [`Self-test execution failed: ${error.message}`]
      };
    }
  }

  /**
   * Get service information
   * @returns {Object} Service information
   */
  getServiceInfo() {
    return {
      name: 'PublishingService',
      version: '2.0.0',
      components: [
        'ContentService',
        'StorageService', 
        'BlockChainPublisher'
      ],
      capabilities: [
        'File loading and text entry',
        'Content preparation and validation',
        'Blockchain publishing with compression',
        'Scroll manifest creation and storage',
        'Progress tracking and error handling',
        'Data backup and import',
        'Content search and statistics'
      ],
      storageKeys: StorageService.STORAGE_KEYS
    };
  }
}

// Character count: 9821