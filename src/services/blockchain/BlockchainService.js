// src/services/blockchain/BlockchainService.js
// Path: src/services/blockchain/BlockchainService.js
import { SolanaPublisher } from './solana/SolanaPublisher';
import { PublishingStatusManager } from './shared/PublishingStatusManager';

/**
 * Blockchain Services - Main orchestrator for blockchain publishing operations
 * Provides a unified interface for multiple blockchain publishers while maintaining 
 * the same API as the original BlockChainPublisher for seamless integration
 */
export class BlockchainService {
  constructor() {
    this.statusManager = new PublishingStatusManager();
    this.publishers = {
      solana: new SolanaPublisher()
    };
    this.defaultPublisher = 'solana'; // For now, default to Solana
  }

  /**
   * Get the appropriate publisher for the blockchain type
   * @param {string} blockchain - Blockchain type ('solana', 'ethereum', etc.)
   * @returns {Object} Blockchain publisher instance
   */
  getPublisher(blockchain = this.defaultPublisher) {
    const publisher = this.publishers[blockchain];
    if (!publisher) {
      throw new Error(`Unsupported blockchain: ${blockchain}`);
    }
    return publisher;
  }

  /**
   * Publish prepared content to blockchain with enhanced error handling and scroll creation
   * Maintains exact same interface as original BlockChainPublisher.publishContent
   * @param {Object} content - Prepared content object
   * @param {Object} keypair - Wallet keypair for signing
   * @param {Function} onProgress - Progress callback
   * @param {string} blockchain - Blockchain type (optional, defaults to Solana)
   * @returns {Promise<Object>} Publishing result with scroll information
   */
  async publishContent(content, keypair, onProgress = null, blockchain = this.defaultPublisher, userPublicKey = null) {
    try {
      if (!content || !content.glyphs || content.glyphs.length === 0) {
        throw new Error('Blockchain Services: No valid content to publish');
      }

      if (!keypair) {
        throw new Error('Blockchain Services: No wallet keypair provided');
      }

      const publisher = this.getPublisher(blockchain);
      
      // Delegate to the specific blockchain publisher
      // The publisher handles its own status management through the shared manager
      return await publisher.publishContent(content, keypair, onProgress, userPublicKey);
      
    } catch (error) {
      console.error('❌ BlockchainServices publishing error:', error);
      
      // Update status through the shared manager if content ID is available
      if (content?.contentId) {
        this.statusManager.setError(content.contentId, error.message, onProgress);
      }
      
      throw error;
    }
  }

  /**
   * Resume publishing from a failed or partial state
   * Maintains exact same interface as original BlockChainPublisher.resumePublishing
   * @param {string} contentId - Content ID to resume
   * @param {Object} keypair - Wallet keypair for signing
   * @param {Function} onProgress - Progress callback
   * @param {string} blockchain - Blockchain type (optional, defaults to Solana)
   * @returns {Promise<Object>} Publishing result
   */
  async resumePublishing(contentId, keypair, onProgress = null, blockchain = this.defaultPublisher, userPublicKey = null) {
    try {
      console.log(`🔄 BlockchainServices resuming publication of content: ${contentId}`);
      
      if (!keypair) {
        throw new Error('No wallet keypair provided');
      }

      const publisher = this.getPublisher(blockchain);
      
      // Delegate to the specific blockchain publisher
      return await publisher.resumePublishing(contentId, keypair, onProgress, userPublicKey);
      
    } catch (error) {
      console.error('❌ BlockchainServices resume error:', error);
      
      // Update status through the shared manager
      this.statusManager.setError(contentId, error.message, onProgress);
      
      throw error;
    }
  }

  /**
   * Get publishing status for active publishing operations
   * Maintains exact same interface as original BlockChainPublisher.getPublishingStatus
   * @param {string} contentId - Content ID to check
   * @returns {Object|null} Current status or null
   */
  getPublishingStatus(contentId) {
    // Check all publishers for the status (in case of multi-blockchain publishing)
    // For now, just check the status manager since all publishers share it
    return this.statusManager.getPublishingStatus(contentId);
  }

  /**
   * Cancel an active publishing operation
   * Maintains exact same interface as original BlockChainPublisher.cancelPublishing
   * @param {string} contentId - Content ID to cancel
   * @returns {Promise<boolean>} Success status
   */
  async cancelPublishing(contentId) {
    try {
      // Try to cancel on all publishers that might have this content
      // For now, just use the shared status manager
      return await this.statusManager.cancelPublishing(contentId);
      
    } catch (error) {
      console.error('Error cancelling publishing via BlockchainServices:', error);
      return false;
    }
  }

  /**
   * Get all active publishing operations
   * Maintains exact same interface as original BlockChainPublisher.getActivePublishing
   * @returns {Array} Array of active publishing statuses
   */
  getActivePublishing() {
    // Return all active publishing operations from the shared status manager
    return this.statusManager.getActivePublishing();
  }

  /**
   * Check connection health for a specific blockchain
   * @param {string} blockchain - Blockchain type (optional, defaults to Solana)
   * @returns {Promise<boolean>} Connection status
   */
  async checkConnection(blockchain = this.defaultPublisher) {
    try {
      const publisher = this.getPublisher(blockchain);
      
      // Check if the publisher has a connection check method
      if (typeof publisher.checkConnection === 'function') {
        return await publisher.checkConnection();
      }
      
      // If no check method, assume connected
      return true;
      
    } catch (error) {
      console.error(`Connection check failed for ${blockchain}:`, error);
      return false;
    }
  }

  /**
   * Get network endpoint for a specific blockchain
   * @param {string} blockchain - Blockchain type (optional, defaults to Solana)
   * @returns {string} Network endpoint URL
   */
  getNetworkEndpoint(blockchain = this.defaultPublisher) {
    try {
      const publisher = this.getPublisher(blockchain);
      
      // Check if the publisher has a network endpoint method
      if (typeof publisher.getNetworkEndpoint === 'function') {
        return publisher.getNetworkEndpoint();
      }
      
      return 'Unknown';
      
    } catch (error) {
      console.error(`Failed to get network endpoint for ${blockchain}:`, error);
      return 'Error';
    }
  }

  /**
   * Get supported blockchain types
   * @returns {Array} Array of supported blockchain names
   */
  getSupportedBlockchains() {
    return Object.keys(this.publishers);
  }

  /**
   * Check if a blockchain is supported
   * @param {string} blockchain - Blockchain type to check
   * @returns {boolean} True if supported
   */
  isBlockchainSupported(blockchain) {
    return this.publishers.hasOwnProperty(blockchain);
  }

  /**
   * Set the default blockchain for operations
   * @param {string} blockchain - Blockchain type to set as default
   */
  setDefaultBlockchain(blockchain) {
    if (!this.isBlockchainSupported(blockchain)) {
      throw new Error(`Cannot set unsupported blockchain as default: ${blockchain}`);
    }
    this.defaultPublisher = blockchain;
  }

  /**
   * Get the current default blockchain
   * @returns {string} Current default blockchain type
   */
  getDefaultBlockchain() {
    return this.defaultPublisher;
  }

  /**
   * Add a new blockchain publisher (for future extensibility)
   * @param {string} blockchain - Blockchain type name
   * @param {Object} publisher - Publisher instance
   */
  addPublisher(blockchain, publisher) {
    if (this.publishers[blockchain]) {
      console.warn(`Overwriting existing publisher for ${blockchain}`);
    }
    
    this.publishers[blockchain] = publisher;
    console.log(`✅ Added publisher for ${blockchain}`);
  }

  /**
   * Remove a blockchain publisher
   * @param {string} blockchain - Blockchain type to remove
   */
  removePublisher(blockchain) {
    if (blockchain === this.defaultPublisher) {
      throw new Error('Cannot remove the default blockchain publisher');
    }
    
    if (this.publishers[blockchain]) {
      delete this.publishers[blockchain];
      console.log(`🗑️ Removed publisher for ${blockchain}`);
    }
  }

  /**
   * Get publisher information for debugging
   * @returns {Object} Publisher information
   */
  getPublisherInfo() {
    const info = {
      supportedBlockchains: this.getSupportedBlockchains(),
      defaultBlockchain: this.defaultPublisher,
      activePublishing: this.getActivePublishing().length,
      publishers: {}
    };

    // Get info from each publisher if available
    for (const [blockchain, publisher] of Object.entries(this.publishers)) {
      info.publishers[blockchain] = {
        connected: false,
        endpoint: 'Unknown'
      };

      try {
        if (typeof publisher.getNetworkEndpoint === 'function') {
          info.publishers[blockchain].endpoint = publisher.getNetworkEndpoint();
        }
      } catch (error) {
        // Ignore errors for info gathering
      }
    }

    return info;
  }
}

// Export singleton instance to maintain compatibility with existing code
export const blockchainServices = new BlockchainService();

// Also export the class for testing or multiple instances if needed
export default BlockchainService;

// Character count: 8,249