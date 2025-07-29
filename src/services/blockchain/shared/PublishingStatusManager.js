// src/services/blockchain/shared/PublishingStatusManager.js
// Path: src/services/blockchain/shared/PublishingStatusManager.js
import { StorageService } from '../../storage/StorageService';

/**
 * Publishing Status Manager - Handles status tracking and progress management
 * Shared logic extracted from BlockChainPublisher for multi-currency support
 */
export class PublishingStatusManager {
  constructor() {
    this.activePublishing = new Map();
  }

  /**
   * Initialize status for a new publishing operation
   * @param {string} contentId - Content ID
   * @param {Object} content - Content object with glyphs
   * @param {Function} onProgress - Progress callback
   * @returns {Object} Initial status object
   */
  initializeStatus(contentId, content, onProgress = null) {
    const status = {
      contentId,
      stage: 'preparing',
      progress: 0,
      currentGlyph: 0,
      totalGlyphs: content.glyphs.length,
      successfulGlyphs: 0,
      failedGlyphs: 0,
      transactionIds: [],
      compressionStats: content.compressionStats,
      error: null,
      scrollId: null
    };

    this.activePublishing.set(contentId, status);
    onProgress && onProgress(status);
    
    return status;
  }

  /**
   * Initialize status for resuming a publishing operation
   * @param {string} contentId - Content ID
   * @param {Object} content - Content object with glyphs
   * @param {Function} onProgress - Progress callback
   * @returns {Object} Resume status object
   */
  initializeResumeStatus(contentId, content, onProgress = null) {
    // Count current status
    const publishedGlyphs = content.glyphs.filter(g => g.status === 'published');
    const failedGlyphs = content.glyphs.filter(g => g.status === 'failed');
    const pendingGlyphs = content.glyphs.filter(g => !g.status || g.status === 'pending');
    
    console.log(`📊 Resume Status: ${publishedGlyphs.length} published, ${failedGlyphs.length} failed, ${pendingGlyphs.length} pending`);

    const status = {
      contentId,
      stage: 'publishing',
      progress: Math.floor((publishedGlyphs.length / content.glyphs.length) * 90),
      currentGlyph: publishedGlyphs.length,
      totalGlyphs: content.glyphs.length,
      successfulGlyphs: publishedGlyphs.length,
      failedGlyphs: failedGlyphs.length,
      transactionIds: publishedGlyphs.map(g => g.transactionId).filter(id => id),
      compressionStats: content.compressionStats,
      error: null,
      scrollId: null
    };

    this.activePublishing.set(contentId, status);
    onProgress && onProgress(status);
    
    return status;
  }

  /**
   * Update status stage and trigger progress callback
   * @param {string} contentId - Content ID
   * @param {string} stage - New stage
   * @param {number} progress - Progress percentage (optional)
   * @param {Function} onProgress - Progress callback
   */
  updateStage(contentId, stage, progress = null, onProgress = null) {
    const status = this.activePublishing.get(contentId);
    if (status) {
      status.stage = stage;
      if (progress !== null) {
        status.progress = progress;
      }
      onProgress && onProgress(status);
    }
  }

  /**
   * Update glyph progress and calculate overall progress
   * @param {string} contentId - Content ID
   * @param {number} glyphIndex - Current glyph index (0-based)
   * @param {Function} onProgress - Progress callback
   */
  updateGlyphProgress(contentId, glyphIndex, onProgress = null) {
    const status = this.activePublishing.get(contentId);
    if (status) {
      status.currentGlyph = glyphIndex + 1;
      status.progress = Math.floor((glyphIndex / status.totalGlyphs) * 80) + 10; // Reserve 10% for finalization
      onProgress && onProgress(status);
    }
  }

  /**
   * Update resume glyph progress
   * @param {string} contentId - Content ID
   * @param {Function} onProgress - Progress callback
   */
  updateResumeGlyphProgress(contentId, onProgress = null) {
    const status = this.activePublishing.get(contentId);
    if (status) {
      status.progress = Math.floor((status.successfulGlyphs / status.totalGlyphs) * 90);
      onProgress && onProgress(status);
    }
  }

  /**
   * Record successful glyph publication
   * @param {string} contentId - Content ID
   * @param {Object} glyph - Glyph object
   * @param {string} transactionId - Transaction ID
   * @param {Function} onProgress - Progress callback
   */
  recordGlyphSuccess(contentId, glyph, transactionId, onProgress = null) {
    const status = this.activePublishing.get(contentId);
    if (status) {
      // Update glyph status
      glyph.status = 'published';
      glyph.transactionId = transactionId;
      glyph.publishedAt = Date.now();
      glyph.error = undefined;
      
      // Update status counters
      status.transactionIds.push(transactionId);
      status.successfulGlyphs++;
      
      onProgress && onProgress(status);
    }
  }

  /**
   * Record failed glyph publication
   * @param {string} contentId - Content ID
   * @param {Object} glyph - Glyph object
   * @param {string} error - Error message
   * @param {Function} onProgress - Progress callback
   */
  recordGlyphFailure(contentId, glyph, error, onProgress = null) {
    const status = this.activePublishing.get(contentId);
    if (status) {
      // Update glyph status
      glyph.status = 'failed';
      glyph.error = error;
      
      // Update status counters
      status.failedGlyphs++;
      
      onProgress && onProgress(status);
    }
  }

  /**
   * Set error status for publishing operation
   * @param {string} contentId - Content ID
   * @param {string} error - Error message
   * @param {Function} onProgress - Progress callback
   */
  setError(contentId, error, onProgress = null) {
    const status = this.activePublishing.get(contentId);
    if (status) {
      status.stage = 'error';
      status.error = error;
      onProgress && onProgress(status);
    }
  }

  /**
   * Set partial completion status (some glyphs failed)
   * @param {string} contentId - Content ID
   * @param {string} error - Error message
   * @param {Function} onProgress - Progress callback
   */
  setPartialStatus(contentId, error, onProgress = null) {
    const status = this.activePublishing.get(contentId);
    if (status) {
      status.stage = 'partial';
      status.error = error;
      onProgress && onProgress(status);
    }
  }

  /**
   * Set completion status for publishing operation
   * @param {string} contentId - Content ID
   * @param {string} scrollId - Generated scroll ID (optional)
   * @param {Function} onProgress - Progress callback
   */
  setCompleted(contentId, scrollId = null, onProgress = null) {
    const status = this.activePublishing.get(contentId);
    if (status) {
      status.stage = 'completed';
      status.progress = 100;
      if (scrollId) {
        status.scrollId = scrollId;
      }
      onProgress && onProgress(status);
    }
  }

  /**
   * Set cancelled status for publishing operation
   * @param {string} contentId - Content ID
   * @param {Function} onProgress - Progress callback
   */
  setCancelled(contentId, onProgress = null) {
    const status = this.activePublishing.get(contentId);
    if (status) {
      status.stage = 'cancelled';
      status.error = 'Publishing cancelled by user';
      onProgress && onProgress(status);
    }
  }

  /**
   * Get publishing status for active publishing operations
   * @param {string} contentId - Content ID to check
   * @returns {Object|null} Current status or null
   */
  getPublishingStatus(contentId) {
    return this.activePublishing.get(contentId) || null;
  }

  /**
   * Get all active publishing operations
   * @returns {Array} Array of active publishing statuses
   */
  getActivePublishing() {
    return Array.from(this.activePublishing.values());
  }

  /**
   * Cancel an active publishing operation
   * @param {string} contentId - Content ID to cancel
   * @returns {Promise<boolean>} Success status
   */
  async cancelPublishing(contentId) {
    try {
      const status = this.activePublishing.get(contentId);
      if (status) {
        this.setCancelled(contentId);
        this.activePublishing.delete(contentId);
        
        // Remove from in-progress storage
        await StorageService.removeInProgressContent(contentId);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error cancelling publishing:', error);
      return false;
    }
  }

  /**
   * Clean up completed or failed publishing operation
   * @param {string} contentId - Content ID to clean up
   */
  cleanup(contentId) {
    if (contentId) {
      this.activePublishing.delete(contentId);
    }
  }

  /**
   * Check if all glyphs are already published (for resume operations)
   * @param {Object} content - Content object with glyphs
   * @returns {boolean} True if all glyphs are published
   */
  areAllGlyphsPublished(content) {
    if (!content.glyphs || content.glyphs.length === 0) {
      return false;
    }
    
    return content.glyphs.every(g => g.status === 'published');
  }

  /**
   * Get glyphs that need to be processed (failed + pending)
   * @param {Object} content - Content object with glyphs
   * @returns {Array} Array of glyphs to process
   */
  getGlyphsToProcess(content) {
    return content.glyphs.filter(g => 
      g.status === 'failed' || !g.status || g.status === 'pending'
    );
  }

  /**
   * Create publishing result object
   * @param {string} contentId - Content ID
   * @param {Object} manifest - Scroll manifest (optional)
   * @param {Object} publishedContent - Published content object (optional)
   * @param {Object} saveResult - Save result (optional)
   * @returns {Object} Publishing result
   */
  createPublishingResult(contentId, manifest = null, publishedContent = null, saveResult = null) {
    const status = this.activePublishing.get(contentId);
    if (!status) {
      throw new Error('No active publishing status found for content');
    }

    return {
      status: status.stage,
      contentId,
      manifest,
      saveResult,
      publishedContent,
      scrollId: manifest?.storyId || status.scrollId,
      totalGlyphs: status.totalGlyphs,
      successfulGlyphs: status.successfulGlyphs,
      failedGlyphs: status.failedGlyphs,
      transactionIds: status.transactionIds,
      compressionStats: status.compressionStats,
      error: status.error
    };
  }

  /**
   * Create resume publishing result object
   * @param {string} contentId - Content ID
   * @param {Object} manifest - Scroll manifest (optional)
   * @param {Object} publishedContent - Published content object (optional)
   * @param {Object} saveResult - Save result (optional)
   * @returns {Object} Resume publishing result
   */
  createResumeResult(contentId, manifest = null, publishedContent = null, saveResult = null) {
    const result = this.createPublishingResult(contentId, manifest, publishedContent, saveResult);
    // Resume results are the same structure as regular publishing results
    return result;
  }

  /**
   * Log publishing summary
   * @param {string} contentId - Content ID
   * @param {string} operation - Operation type ('publish' or 'resume')
   */
  logSummary(contentId, operation = 'publish') {
    const status = this.activePublishing.get(contentId);
    if (status) {
      console.log(`📊 ${operation} Summary: ${status.successfulGlyphs} successful, ${status.failedGlyphs} failed`);
    }
  }

  /**
   * Validate if operation can proceed
   * @param {string} contentId - Content ID
   * @returns {boolean} True if operation can proceed
   */
  canProceed(contentId) {
    const status = this.activePublishing.get(contentId);
    return status && status.successfulGlyphs > 0;
  }
}

// Character count: 9,247