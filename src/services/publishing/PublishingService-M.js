// src/services/publishing/PublishingService-M.js
// Path: src/services/publishing/PublishingService-M.js

import { blockchainServices } from '../blockchain/BlockchainService';
import { CompressionService } from '../compression/CompressionService';
import { globalRPCRateLimiter } from '../blockchain/shared/GlobalRPCRateLimiter';

/**
 * 3-Phase Manifest Tree Publishing Service
 * 
 * Manages the three-phase publishing process for scalable content:
 * Phase 1: Publish Primary Manifest (single manifestRoot hash)
 * Phase 2: Publish Hash List Chunks (arrays of content chunk hashes)
 * Phase 3: Publish Content Glyphs (actual story content)
 * 
 * Based on ADR-003: Manifest-Based Publishing Architecture (3-Tier Enhancement)
 */
class PublishingServiceM {
  /**
   * Publish a story using the 3-tier Manifest Tree Architecture.
   * This enables scalable publishing for content of any length.
   * 
   * @param {Object} publicationPackage - The 3-tier package from ChunkManager-M
   * @param {Object} keypair - The user's wallet keypair for signing transactions
   * @param {Function} [onProgress] - Optional callback for progress updates
   * @returns {Promise<Object>} Publication result with all transaction IDs
   */
   static async publishStoryWithManifest(publicationPackage, keypair, onProgress) {
    console.log('PublishingService-M.js: publishStoryWithManifest: Beginning 3-tier manifest tree publication');
    console.log('PublishingService-M.js: publishStoryWithManifest: Using GlobalRPCRateLimiter for coordinated publishing');
    console.log('PublishingService-M.js: publishStoryWithManifest: Pre-publish rate limiter stats:', globalRPCRateLimiter.getStats());
    
    const { primaryManifest, hashListChunks, contentChunks, summary } = publicationPackage;
    const totalSteps = 1 + hashListChunks.length + contentChunks.length; // manifest + hash lists + content
    
    const result = {
      storyId: null,
      manifestTransactionId: null,
      hashListTransactionIds: [],
      glyphTransactionIds: [],
      publishedAt: Date.now(),
      summary: summary,
      phases: {
        manifest: { status: 'pending', transactionId: null },
        hashLists: { status: 'pending', transactionIds: [], total: hashListChunks.length },
        content: { status: 'pending', transactionIds: [], total: contentChunks.length }
      }
    };

    // Get the blockchain publisher
    const publisher = blockchainServices.getPublisher();

    try {
      // === PHASE 1: Publish Primary Manifest ===
      console.log('PublishingService-M.js: publishStoryWithManifest: Phase 1 - Publishing primary manifest');
      
      if (onProgress) {
        onProgress({ 
          current: 0, 
          total: totalSteps, 
          phase: 'manifest',
          message: 'Publishing story manifest...' 
        });
      }

      // Serialize primary manifest (should be small now)
      const manifestMemo = this._serializeDataToMemo(primaryManifest.serialize(), {
        type: 'manifest',
        protocol: 'glyffiti-manifest-tree-v1'
      });

      // Publish manifest transaction (GlobalRPCRateLimiter coordinates this automatically)
      const manifestTxId = await publisher.publishSingleTransaction(manifestMemo, keypair);
      
      // Set the story ID from manifest transaction signature
      primaryManifest.setStoryId(manifestTxId);
      result.storyId = manifestTxId;
      result.manifestTransactionId = manifestTxId;
      result.phases.manifest.status = 'completed';
      result.phases.manifest.transactionId = manifestTxId;
      
      console.log('PublishingService-M.js: publishStoryWithManifest: Phase 1 complete - Manifest TX ID:', manifestTxId);

      // === PHASE 2: Publish Hash List Chunks ===
      console.log('PublishingService-M.js: publishStoryWithManifest: Phase 2 - Publishing', hashListChunks.length, 'hash list chunks');
      
      // Prepare hash list tasks for concurrent publishing
      const hashListTasks = hashListChunks.map((hashChunk, index) => ({
        type: 'hashlist',
        storyId: result.storyId,
        index: index,
        totalHashLists: hashListChunks.length,
        hashes: hashChunk
      }));

      // Publish hash lists with reduced concurrency - GlobalRPCRateLimiter handles optimal rate
      result.hashListTransactionIds = await this._publishTasksWithConcurrency(
        hashListTasks,
        async (task) => {
          const memo = this._serializeDataToMemo(task.hashes, {
            type: 'hashlist',
            storyId: task.storyId,
            index: task.index,
            totalHashLists: task.totalHashLists
          });
          return await publisher.publishSingleTransaction(memo, keypair);
        },
        2, // Lower concurrency - GlobalRPCRateLimiter handles optimal rate
        (completed, total) => {
          if (onProgress) {
            onProgress({
              current: 1 + completed,
              total: totalSteps,
              phase: 'hashlist',
              message: `Publishing hash list ${completed + 1} of ${total}...`
            });
          }
        }
      );

      result.phases.hashLists.status = 'completed';
      result.phases.hashLists.transactionIds = result.hashListTransactionIds;
      console.log('PublishingService-M.js: publishStoryWithManifest: Phase 2 complete - Hash lists published');

      // === PHASE 3: Publish Content Chunks ===
      console.log('PublishingService-M.js: publishStoryWithManifest: Phase 3 - Publishing', contentChunks.length, 'content chunks');

      // Prepare content tasks for concurrent publishing
      const contentTasks = contentChunks.map((chunk, index) => ({
        type: 'content',
        storyId: result.storyId,
        index: index,
        totalChunks: contentChunks.length,
        content: chunk,
        reGlyphCap: index === 0 ? primaryManifest.reGlyphCap : undefined // Only on first chunk
      }));

      // Publish content with reduced concurrency - GlobalRPCRateLimiter handles optimal rate
      result.glyphTransactionIds = await this._publishTasksWithConcurrency(
        contentTasks,
        async (task) => {
          const memo = this._serializeDataToMemo(task.content, {
            type: 'glyph',
            storyId: task.storyId,
            index: task.index,
            totalChunks: task.totalChunks,
            reGlyphCap: task.reGlyphCap
          });
          return await publisher.publishSingleTransaction(memo, keypair);
        },
        2, // Lower concurrency - GlobalRPCRateLimiter handles optimal rate
        (completed, total) => {
          if (onProgress) {
            onProgress({
              current: 1 + hashListChunks.length + completed,
              total: totalSteps,
              phase: 'content',
              message: `Publishing content ${completed + 1} of ${total}...`
            });
          }
        }
      );

      result.phases.content.status = 'completed';
      result.phases.content.transactionIds = result.glyphTransactionIds;

      // Final progress update
      if (onProgress) {
        onProgress({ 
          current: totalSteps, 
          total: totalSteps, 
          phase: 'complete',
          message: '3-tier publication complete!' 
        });
      }

      console.log('PublishingService-M.js: publishStoryWithManifest: 3-tier publication complete');
      console.log('PublishingService-M.js: publishStoryWithManifest: Story ID:', result.storyId);
      console.log('PublishingService-M.js: publishStoryWithManifest: Total transactions:', totalSteps);
      console.log('PublishingService-M.js: publishStoryWithManifest: Final rate limiter stats:', globalRPCRateLimiter.getStats());

      return result;

    } catch (error) {
      console.error('PublishingService-M.js: publishStoryWithManifest: Publication failed:', error);
      console.error('PublishingService-M.js: publishStoryWithManifest: Rate limiter stats at failure:', globalRPCRateLimiter.getStats());
      
      // Mark failed phases
      if (!result.manifestTransactionId) {
        result.phases.manifest.status = 'failed';
      } else if (result.hashListTransactionIds.length < hashListChunks.length) {
        result.phases.hashLists.status = 'partial';
      } else if (result.glyphTransactionIds.length < contentChunks.length) {
        result.phases.content.status = 'partial';
      }
      
      result.error = error.message;
      throw error;
    }
  }


  /**
   * Publish tasks with controlled concurrency to avoid rate limiting
   * @param {Array} tasks - Array of tasks to publish
   * @param {Function} taskPublisher - Async function that publishes a single task
   * @param {number} concurrencyLimit - Maximum concurrent operations
   * @param {Function} onProgressUpdate - Callback for progress updates
   * @returns {Promise<Array>} Array of transaction IDs
   * @private
   */
  // REPLACE ENTIRE METHOD WITH:
 static async _publishTasksWithConcurrency(tasks, taskPublisher, concurrencyLimit = 2, onProgressUpdate) {
    console.log('PublishingService-M.js: _publishTasksWithConcurrency: Publishing', tasks.length, 'tasks using GlobalRPCRateLimiter coordination');
    
    const results = [];
    let completed = 0;
    
    // Process tasks in smaller batches with GlobalRPCRateLimiter coordination
    for (let i = 0; i < tasks.length; i += concurrencyLimit) {
      const batch = tasks.slice(i, i + concurrencyLimit);
      console.log('PublishingService-M.js: _publishTasksWithConcurrency: Processing batch', Math.floor(i / concurrencyLimit) + 1, 'with', batch.length, 'tasks');
      
      // Process batch concurrently - GlobalRPCRateLimiter will coordinate the actual RPC calls
      const batchPromises = batch.map(async (task, batchIndex) => {
        const globalIndex = i + batchIndex;
        
        try {
          const txId = await taskPublisher(task);
          console.log('PublishingService-M.js: _publishTasksWithConcurrency: Task', globalIndex, 'completed:', txId.substring(0, 12) + '...');
          
          completed++;
          
          if (onProgressUpdate) {
            onProgressUpdate(completed, tasks.length);
          }
          
          return txId;
        } catch (error) {
          console.error('PublishingService-M.js: _publishTasksWithConcurrency: Task', globalIndex, 'failed:', error);
          throw error;
        }
      });
      
      // Wait for this batch to complete before starting next batch
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // NO artificial delays - GlobalRPCRateLimiter handles optimal timing
      console.log('PublishingService-M.js: _publishTasksWithConcurrency: Batch', Math.floor(i / concurrencyLimit) + 1, 'complete');
    }
    
    console.log('PublishingService-M.js: _publishTasksWithConcurrency: All', tasks.length, 'tasks completed via GlobalRPCRateLimiter');
    return results;
  }

  /**
   * Enhanced serialization for 3-tier architecture
   * @param {any} data - Data to serialize
   * @param {Object} metadata - Transaction metadata
   * @returns {string} Compressed, Base64 encoded string for transaction memo
   * @private
   */
  static _serializeDataToMemo(data, metadata = {}) {
    console.log('PublishingService-M.js: _serializeDataToMemo: Serializing', metadata.type, 'data');
    
    let memoObject;
    
    if (metadata.type === 'manifest') {
      // Primary manifest - should be small now with just manifestRoot
      memoObject = {
        p: 'g-mt-v1',           // Protocol: glyffiti-manifest-tree-v1
        t: 'manifest',          // Type
        d: data                 // Serialized manifest data
      };
    } else if (metadata.type === 'hashlist') {
      // Hash list chunk
      memoObject = {
        p: 'g-mt-v1',           // Protocol
        t: 'hashlist',          // Type
        sid: metadata.storyId,  // Story ID
        i: metadata.index,      // Chunk index
        thl: metadata.totalHashLists, // Total hash list chunks
        h: data                 // Array of hashes
      };
    } else if (metadata.type === 'glyph') {
      // Content chunk
      memoObject = {
        p: 'g-mt-v1',           // Protocol
        t: 'glyph',             // Type  
        sid: metadata.storyId,  // Story ID
        i: metadata.index,      // Chunk index
        tc: metadata.totalChunks, // Total content chunks
        c: data                 // Content string
      };
      
      // Include reGlyphCap only on first chunk
      if (metadata.reGlyphCap !== undefined) {
        memoObject.rgc = metadata.reGlyphCap;
      }
    } else {
      throw new Error(`Unknown memo type: ${metadata.type}`);
    }

    // Serialize, compress, and encode
    const jsonString = JSON.stringify(memoObject);
    const compressedData = CompressionService.compress(jsonString);
    const base64String = CompressionService.uint8ArrayToBase64(compressedData);
    
    console.log('PublishingService-M.js: _serializeDataToMemo: Serialized', metadata.type, 'to', base64String.length, 'characters');
    
    // Verify size is within limits
    if (base64String.length > 566) {
      console.warn('PublishingService-M.js: _serializeDataToMemo: Warning - memo size', base64String.length, 'exceeds recommended limit');
    }
    
    return base64String;
  }

  /**
   * Estimate the cost and time for 3-tier publishing
   * @param {Object} publicationPackage - Package from ChunkManager-M
   * @returns {Object} Cost and time estimates
   */
  static estimatePublishing(publicationPackage) {
    console.log('PublishingService-M.js: estimatePublishing: Calculating 3-tier estimates');
    
    const { primaryManifest, hashListChunks, contentChunks } = publicationPackage;
    
    // Base cost per transaction (rough Solana estimate)
    const baseTransactionCost = 0.000005; // SOL
    
    // Total transactions: 1 manifest + N hash lists + N content chunks
    const totalTransactions = 1 + hashListChunks.length + contentChunks.length;
    
    const estimate = {
      architecture: '3-tier',
      phases: {
        manifest: { transactions: 1, costSOL: baseTransactionCost },
        hashLists: { 
          transactions: hashListChunks.length, 
          costSOL: hashListChunks.length * baseTransactionCost,
          averageHashesPerChunk: Math.round(
            hashListChunks.reduce((sum, chunk) => sum + chunk.length, 0) / hashListChunks.length
          )
        },
        content: { 
          transactions: contentChunks.length, 
          costSOL: contentChunks.length * baseTransactionCost,
          averageChunkSize: Math.round(
            contentChunks.reduce((sum, chunk) => sum + chunk.length, 0) / contentChunks.length
          )
        }
      },
      totals: {
        transactions: totalTransactions,
        estimatedCostSOL: totalTransactions * baseTransactionCost,
        estimatedTimeSeconds: Math.ceil(totalTransactions / 3), // With 3x concurrency
        manifestRoot: primaryManifest.manifestRoot.substring(0, 16) + '...',
        contentLength: primaryManifest.contentLength
      }
    };
    
    console.log('PublishingService-M.js: estimatePublishing: 3-tier estimates calculated:', estimate.totals);
    return estimate;
  }

  /**
   * Validate a 3-tier publication package before attempting to publish
   * @param {Object} publicationPackage - Package to validate
   * @returns {Object} Validation result
   */
  static validatePublicationPackage(publicationPackage) {
    console.log('PublishingService-M.js: validatePublicationPackage: Validating 3-tier package');
    
    const errors = [];
    
    // Check required components
    if (!publicationPackage.primaryManifest) {
      errors.push('Missing primaryManifest in publication package');
    }
    
    if (!publicationPackage.hashListChunks || !Array.isArray(publicationPackage.hashListChunks)) {
      errors.push('Missing or invalid hashListChunks in publication package');
    }
    
    if (!publicationPackage.contentChunks || !Array.isArray(publicationPackage.contentChunks)) {
      errors.push('Missing or invalid contentChunks in publication package');
    }
    
    if (!publicationPackage.summary) {
      errors.push('Missing summary in publication package');
    }
    
    // Validate manifest if present
    if (publicationPackage.primaryManifest) {
      const manifestValidation = publicationPackage.primaryManifest.validate();
      if (!manifestValidation.isValid) {
        errors.push(...manifestValidation.errors.map(err => `Primary Manifest: ${err}`));
      }
    }
    
    // Validate structure consistency
    if (publicationPackage.primaryManifest && publicationPackage.contentChunks && publicationPackage.hashListChunks) {
      const manifest = publicationPackage.primaryManifest;
      
      // Check content chunk count
      if (manifest.totalContentChunks !== publicationPackage.contentChunks.length) {
        errors.push(`Content chunk count mismatch: manifest expects ${manifest.totalContentChunks}, package has ${publicationPackage.contentChunks.length}`);
      }
      
      // Check hash list chunk count
      if (manifest.totalHashListChunks !== publicationPackage.hashListChunks.length) {
        errors.push(`Hash list chunk count mismatch: manifest expects ${manifest.totalHashListChunks}, package has ${publicationPackage.hashListChunks.length}`);
      }
    }
    
    const isValid = errors.length === 0;
    console.log('PublishingService-M.js: validatePublicationPackage: Validation', isValid ? 'passed' : 'failed');
    
    return {
      isValid,
      errors
    };
  }

  /**
   * Get information about this publishing service
   * @returns {Object} Service information
   */
  static getServiceInfo() {
    return {
      name: 'PublishingServiceM',
      architecture: '3-Tier Manifest Tree Publishing',
      version: '1.0.0',
      adr: 'ADR-003 (3-Tier Enhancement)',
      phases: [
        'Primary Manifest Publication (manifestRoot hash)',
        'Hash List Chunks Publication (chunk hash arrays)', 
        'Content Glyphs Publication (actual story content)'
      ],
      benefits: [
        'Scalable for content of any length',
        'Fixed-size primary manifest (no memo size issues)',
        'Parallel hash list and content publishing',
        'Maintains cryptographic integrity via manifest tree',
        'Efficient concurrency management'
      ],
      compatibility: {
        replaces: 'Flat Manifest Publishing',
        protocol: 'glyffiti-manifest-tree-v1'
      }
    };
  }
}

export default PublishingServiceM;

// Character count: 8996