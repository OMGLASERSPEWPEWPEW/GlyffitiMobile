// src/services/publishing/BlockChainPublisher.js
// Path: src/services/publishing/BlockChainPublisher.js
import { Connection, Transaction, TransactionInstruction, PublicKey } from '@solana/web3.js';
import { CompressionService } from '../compression/CompressionService';
import { StorageService } from '../storage/StorageService';


/**
 * Blockchain Publisher - Handles blockchain publishing operations
 * Separated from PublishingService for better organization
 */
export class BlockChainPublisher {
  constructor() {
    this.connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    this.MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
    this.activePublishing = new Map();
  }

  /**
   * Publish prepared content to blockchain with enhanced error handling and scroll creation
   * @param {Object} content - Prepared content object
   * @param {Object} keypair - Wallet keypair for signing
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} Publishing result with scroll information
   */
  async publishContent(content, keypair, onProgress = null) {
    try {
      if (!content || !content.glyphs || content.glyphs.length === 0) {
        throw new Error('No valid content to publish');
      }

      if (!keypair) {
        throw new Error('No wallet keypair provided');
      }

      const { contentId } = content;
      
      // Initialize publishing status with proper progress tracking
      const status = {
        contentId,
        stage: 'publishing',
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

      // Save as in-progress
      await StorageService.saveInProgressContent(content);

      console.log(`📤 Starting publication of ${content.glyphs.length} glyphs...`);
      onProgress && onProgress(status);

      // Process each glyph with retry logic and sequence integrity
      for (let i = 0; i < content.glyphs.length; i++) {
        const glyph = content.glyphs[i];
        let glyphPublished = false;
        let retryCount = 0;
        const maxRetries = 3;
        
        // Update current glyph progress
        status.currentGlyph = i + 1;
        status.progress = Math.floor(((i) / content.glyphs.length) * 90); // Reserve 10% for scroll creation
        onProgress && onProgress(status);
        
        // Retry logic for failed glyphs
        while (!glyphPublished && retryCount < maxRetries) {
          try {
            console.log(`📤 Publishing glyph ${i + 1}/${content.glyphs.length} (attempt ${retryCount + 1}/${maxRetries})`);
            
            // Get or create full glyph chunk data
            const glyphChunk = content.glyphChunks[glyph.index] || 
              {
                index: glyph.index,
                totalChunks: glyph.totalGlyphs,
                content: CompressionService.base64ToUint8Array(glyph.content),
                hash: glyph.hash,
                originalText: glyph.originalText
              };
            
            // Create transaction
            const transaction = new Transaction();
            
            // IMPORTANT: Convert compressed binary data to base64 for the Memo program
            const base64CompressedData = CompressionService.uint8ArrayToBase64(glyphChunk.content);
            const memoData = Buffer.from(base64CompressedData, 'utf-8');
            
            // Add memo instruction
            const instruction = new TransactionInstruction({
              keys: [],
              programId: this.MEMO_PROGRAM_ID,
              data: memoData
            });
            
            transaction.add(instruction);
            
            // Get recent blockhash
            const { blockhash } = await this.connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = keypair.publicKey;
            
            // Sign and send
            transaction.sign(keypair);
            const signature = await this.connection.sendRawTransaction(
              transaction.serialize(),
              { skipPreflight: false, preflightCommitment: 'confirmed' }
            );
            
            // Wait for confirmation with extended timeout for retry attempts
            const confirmationTimeout = retryCount === 0 ? 30000 : 45000; // Longer timeout for retries
            await this.connection.confirmTransaction(signature, 'confirmed');
            
            // SUCCESS - Mark glyph as published
            glyph.transactionId = signature;
            glyph.status = 'published';
            glyph.error = undefined;
            status.transactionIds.push(signature);
            status.successfulGlyphs++;
            glyphPublished = true;
            
            console.log(`✅ Glyph ${i + 1}/${content.glyphs.length} published: ${signature}`);
            
          } catch (error) {
            retryCount++;
            console.error(`❌ Error publishing glyph ${i + 1} (attempt ${retryCount}/${maxRetries}):`, error);
            
            if (retryCount < maxRetries) {
              console.log(`🔄 Retrying glyph ${i + 1} in ${retryCount * 2} seconds...`);
              await new Promise(resolve => setTimeout(resolve, retryCount * 2000)); // Exponential backoff
            } else {
              // All retries failed - mark as failed and STOP publishing
              glyph.status = 'failed';
              glyph.error = error.message;
              status.failedGlyphs++;
              
              console.error(`💥 CRITICAL: Glyph ${i + 1} failed after ${maxRetries} attempts. Publishing stopped to maintain sequence integrity.`);
              
              // Update status to partial and return early
              status.stage = 'partial';
              status.error = `Glyph ${i + 1} failed after ${maxRetries} attempts. Story is incomplete.`;
              onProgress && onProgress(status);
              
              // Save partial progress
              await StorageService.updateInProgressContent(
                contentId, 
                content.glyphs, 
                status.successfulGlyphs, 
                status.failedGlyphs
              );
              
              return {
                status: 'partial',
                contentId: contentId,
                scrollId: null,
                totalGlyphs: content.glyphs.length,
                successfulGlyphs: status.successfulGlyphs,
                failedGlyphs: status.failedGlyphs,
                transactionIds: status.transactionIds,
                compressionStats: status.compressionStats,
                failedAtGlyph: i + 1,
                error: status.error
              };
            }
          }
        }
        
        // Update in-progress content after each successful glyph
        await StorageService.updateInProgressContent(
          contentId, 
          content.glyphs, 
          status.successfulGlyphs, 
          status.failedGlyphs
        );
        
        // Small delay between transactions (only after successful publish)
        if (glyphPublished && i < content.glyphs.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Check if ALL glyphs were published successfully
      const allPublished = content.glyphs.every(g => g.status === 'published');
      
      if (allPublished) {
        // ALL GLYPHS PUBLISHED SUCCESSFULLY - Create and save scroll manifest
        try {
          status.stage = 'creating_scroll';
          status.progress = 95;
          status.currentGlyph = content.glyphs.length; // Show completion
          onProgress && onProgress(status);
          
          console.log('🔄 Creating scroll manifest...');
          
          // Prepare published content data for scroll creation
          const publishedContent = {
            ...content,
            transactionIds: status.transactionIds,
            publishedAt: Date.now(),
            glyphs: content.glyphs.filter(g => g.status === 'published') // Only include successful glyphs
          };
          
          // Create scroll manifest
          const manifest = await StorageService.createScrollFromPublishedContent(publishedContent);
          
          // CRITICAL FIX: Use correct property name (storyId, not id)
          status.scrollId = manifest.storyId;
          publishedContent.scrollId = manifest.storyId;
          publishedContent.manifest = manifest;
          
          // CRITICAL FIX: Save manifest to glyffiti_scrolls storage
          console.log('💾 Saving scroll manifest to local storage...');
          const saveResult = await StorageService.saveScrollLocally(manifest);
          
          if (!saveResult) {
            console.warn('⚠️ Warning: Failed to save scroll manifest locally');
          } else {
            console.log(`✅ Scroll manifest saved: ${manifest.storyId}`);
          }
          
          // Save as published content
          await StorageService.savePublishedContent(publishedContent);
          await StorageService.removeInProgressContent(contentId);
          
          status.stage = 'completed';
          status.progress = 100;
          onProgress && onProgress(status);
          
          console.log(`🎉 Publication completed successfully! Scroll ID: ${manifest.storyId}`);
          
          return {
            status: 'completed',
            contentId: contentId,
            scrollId: manifest.storyId,
            totalGlyphs: content.glyphs.length,
            successfulGlyphs: status.successfulGlyphs,
            failedGlyphs: status.failedGlyphs,
            transactionIds: status.transactionIds,
            compressionStats: status.compressionStats,
            manifest: manifest
          };
          
        } catch (scrollError) {
          console.error('❌ Error creating scroll manifest:', scrollError);
          
          // Even if scroll creation fails, the blockchain publication was successful
          status.stage = 'completed_no_scroll';
          status.progress = 100;
          status.error = `Publication successful but scroll creation failed: ${scrollError.message}`;
          onProgress && onProgress(status);
          
          return {
            status: 'completed_no_scroll',
            contentId: contentId,
            scrollId: null,
            totalGlyphs: content.glyphs.length,
            successfulGlyphs: status.successfulGlyphs,
            failedGlyphs: status.failedGlyphs,
            transactionIds: status.transactionIds,
            compressionStats: status.compressionStats,
            error: status.error
          };
        }
      } else {
        // This should never happen now since we stop on first failure
        console.error('❌ Unexpected state: Not all glyphs published but no early return triggered');
        
        status.stage = 'partial';
        status.error = 'Not all glyphs were published successfully';
        onProgress && onProgress(status);
        
        return {
          status: 'partial',
          contentId: contentId,
          scrollId: null,
          totalGlyphs: content.glyphs.length,
          successfulGlyphs: status.successfulGlyphs,
          failedGlyphs: status.failedGlyphs,
          transactionIds: status.transactionIds,
          compressionStats: status.compressionStats,
          error: status.error
        };
      }
      
    } catch (error) {
      console.error('❌ Publishing error:', error);
      
      const status = this.activePublishing.get(content?.contentId) || {};
      status.stage = 'error';
      status.error = error.message;
      onProgress && onProgress(status);
      
      throw error;
    } finally {
      // Clean up active publishing tracking
      if (content?.contentId) {
        this.activePublishing.delete(content.contentId);
      }
    }
  }

  /**
   * Resume publishing from a failed or partial state
   * @param {string} contentId - Content ID to resume
   * @param {Object} keypair - Wallet keypair for signing
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} Publishing result
   */
  async resumePublishing(contentId, keypair, onProgress = null) {
    try {
      console.log(`🔄 Resuming publication of content: ${contentId}`);
      
      // Get in-progress content
      const inProgressContent = await StorageService.getInProgressContent();
      const content = inProgressContent[contentId];
      
      if (!content) {
        throw new Error('No in-progress content found for resuming');
      }

      // Count current status
      const publishedGlyphs = content.glyphs.filter(g => g.status === 'published');
      const failedGlyphs = content.glyphs.filter(g => g.status === 'failed');
      const pendingGlyphs = content.glyphs.filter(g => !g.status || g.status === 'pending');
      
      console.log(`📊 Resume Status: ${publishedGlyphs.length} published, ${failedGlyphs.length} failed, ${pendingGlyphs.length} pending`);

      // Initialize resume status
      const status = {
        contentId,
        stage: 'publishing',
        progress: Math.floor((publishedGlyphs.length / content.glyphs.length) * 90),
        currentGlyph: publishedGlyphs.length,
        totalGlyphs: content.glyphs.length,
        successfulGlyphs: publishedGlyphs.length,
        failedGlyphs: failedGlyphs.length,
        transactionIds: publishedGlyphs.map(g => g.transactionId),
        compressionStats: content.compressionStats,
        error: null,
        scrollId: null
      };

      this.activePublishing.set(contentId, status);
      onProgress && onProgress(status);

      // Identify glyphs that need to be published (failed + pending)
      const glyphsToRetry = content.glyphs.filter(g => 
        g.status === 'failed' || !g.status || g.status === 'pending'
      );

      if (glyphsToRetry.length === 0) {
        console.log('✅ All glyphs already published, creating scroll...');
        
        // All glyphs are published, just need to create scroll
        const publishedContent = {
          ...content,
          transactionIds: status.transactionIds,
          publishedAt: Date.now()
        };
        
        const manifest = await StorageService.createScrollFromPublishedContent(publishedContent);
        publishedContent.scrollId = manifest.storyId;
        publishedContent.manifest = manifest;
        
        await StorageService.saveScrollLocally(manifest);
        await StorageService.savePublishedContent(publishedContent);
        await StorageService.removeInProgressContent(contentId);
        
        status.stage = 'completed';
        status.progress = 100;
        onProgress && onProgress(status);
        
        return {
          status: 'completed',
          contentId: contentId,
          scrollId: manifest.storyId,
          totalGlyphs: content.glyphs.length,
          successfulGlyphs: content.glyphs.filter(g => g.status === 'published').length,
          failedGlyphs: content.glyphs.filter(g => g.status === 'failed').length,
          transactionIds: status.transactionIds,
          manifest: manifest
        };
      }

      console.log(`🔄 Resuming with ${glyphsToRetry.length} glyphs to retry...`);

      // Process failed/pending glyphs with retry logic
      for (const glyph of glyphsToRetry) {
        let glyphPublished = false;
        let retryCount = 0;
        const maxRetries = 3;
        
        // Reset glyph status for retry
        glyph.status = 'pending';
        glyph.error = undefined;
        
        // Update current glyph progress
        status.currentGlyph = glyph.index + 1;
        status.progress = Math.floor((status.successfulGlyphs / content.glyphs.length) * 90);
        onProgress && onProgress(status);
        
        // Retry logic for this specific glyph
        while (!glyphPublished && retryCount < maxRetries) {
          try {
            console.log(`📤 Resuming glyph ${glyph.index + 1}/${content.glyphs.length} (attempt ${retryCount + 1}/${maxRetries})`);
            
            // Get or create full glyph chunk data
            const glyphChunk = content.glyphChunks && content.glyphChunks[glyph.index] || 
              {
                index: glyph.index,
                totalChunks: glyph.totalGlyphs,
                content: CompressionService.base64ToUint8Array(glyph.content),
                hash: glyph.hash,
                originalText: glyph.originalText
              };
            
            // Create transaction
            const transaction = new Transaction();
            
            // Convert compressed binary data to base64 for the Memo program
            const base64CompressedData = CompressionService.uint8ArrayToBase64(glyphChunk.content);
            const memoData = Buffer.from(base64CompressedData, 'utf-8');
            
            // Add memo instruction
            const instruction = new TransactionInstruction({
              keys: [],
              programId: this.MEMO_PROGRAM_ID,
              data: memoData
            });
            
            transaction.add(instruction);
            
            // Get recent blockhash
            const { blockhash } = await this.connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = keypair.publicKey;
            
            // Sign and send
            transaction.sign(keypair);
            const signature = await this.connection.sendRawTransaction(
              transaction.serialize(),
              { skipPreflight: false, preflightCommitment: 'confirmed' }
            );
            
            // Wait for confirmation
            await this.connection.confirmTransaction(signature, 'confirmed');
            
            // SUCCESS - Mark glyph as published
            glyph.transactionId = signature;
            glyph.status = 'published';
            glyph.error = undefined;
            status.transactionIds.push(signature);
            status.successfulGlyphs++;
            glyphPublished = true;
            
            console.log(`✅ Glyph ${glyph.index + 1}/${content.glyphs.length} resumed: ${signature}`);
            
          } catch (error) {
            retryCount++;
            console.error(`❌ Error resuming glyph ${glyph.index + 1} (attempt ${retryCount}/${maxRetries}):`, error);
            
            if (retryCount < maxRetries) {
              console.log(`🔄 Retrying glyph ${glyph.index + 1} in ${retryCount * 2} seconds...`);
              await new Promise(resolve => setTimeout(resolve, retryCount * 2000));
            } else {
              // All retries failed - mark as failed and STOP
              glyph.status = 'failed';
              glyph.error = error.message;
              status.failedGlyphs++;
              
              console.error(`💥 CRITICAL: Resume failed for glyph ${glyph.index + 1} after ${maxRetries} attempts.`);
              
              // Update status to partial and return early
              status.stage = 'partial';
              status.error = `Resume failed: Glyph ${glyph.index + 1} could not be published after ${maxRetries} attempts.`;
              onProgress && onProgress(status);
              
              // Save partial progress
              await StorageService.updateInProgressContent(
                contentId, 
                content.glyphs, 
                status.successfulGlyphs, 
                status.failedGlyphs
              );
              
              return {
                status: 'partial',
                contentId: contentId,
                scrollId: null,
                totalGlyphs: content.glyphs.length,
                successfulGlyphs: status.successfulGlyphs,
                failedGlyphs: status.failedGlyphs,
                transactionIds: status.transactionIds,
                compressionStats: status.compressionStats,
                failedAtGlyph: glyph.index + 1,
                error: status.error
              };
            }
          }
        }
        
        // Update in-progress content after each successful glyph
        await StorageService.updateInProgressContent(
          contentId, 
          content.glyphs, 
          status.successfulGlyphs, 
          status.failedGlyphs
        );
        
        // Small delay between transactions
        if (glyphPublished) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Check if ALL glyphs are now published
      const allPublished = content.glyphs.every(g => g.status === 'published');
      
      if (allPublished) {
        // SUCCESS - Create scroll manifest
        try {
          status.stage = 'creating_scroll';
          status.progress = 95;
          status.currentGlyph = content.glyphs.length;
          onProgress && onProgress(status);
          
          console.log('🔄 Creating scroll manifest after successful resume...');
          
          const publishedContent = {
            ...content,
            transactionIds: status.transactionIds,
            publishedAt: Date.now(),
            glyphs: content.glyphs.filter(g => g.status === 'published')
          };
          
          const manifest = await StorageService.createScrollFromPublishedContent(publishedContent);
          
          status.scrollId = manifest.storyId;
          publishedContent.scrollId = manifest.storyId;
          publishedContent.manifest = manifest;
          
          await StorageService.saveScrollLocally(manifest);
          await StorageService.savePublishedContent(publishedContent);
          await StorageService.removeInProgressContent(contentId);
          
          status.stage = 'completed';
          status.progress = 100;
          onProgress && onProgress(status);
          
          console.log(`🎉 Resume completed successfully! Scroll ID: ${manifest.storyId}`);
          
          return {
            status: 'completed',
            contentId: contentId,
            scrollId: manifest.storyId,
            totalGlyphs: content.glyphs.length,
            successfulGlyphs: status.successfulGlyphs,
            failedGlyphs: status.failedGlyphs,
            transactionIds: status.transactionIds,
            compressionStats: status.compressionStats,
            manifest: manifest
          };
          
        } catch (scrollError) {
          console.error('❌ Error creating scroll manifest during resume:', scrollError);
          
          status.stage = 'completed_no_scroll';
          status.progress = 100;
          status.error = `Resume successful but scroll creation failed: ${scrollError.message}`;
          onProgress && onProgress(status);
          
          return {
            status: 'completed_no_scroll',
            contentId: contentId,
            scrollId: null,
            totalGlyphs: content.glyphs.length,
            successfulGlyphs: status.successfulGlyphs,
            failedGlyphs: status.failedGlyphs,
            transactionIds: status.transactionIds,
            compressionStats: status.compressionStats,
            error: status.error
          };
        }
      } else {
        // Still incomplete after resume attempt
        status.stage = 'partial';
        status.error = 'Resume incomplete: Some glyphs could not be published';
        onProgress && onProgress(status);
        
        return {
          status: 'partial',
          contentId: contentId,
          scrollId: null,
          totalGlyphs: content.glyphs.length,
          successfulGlyphs: status.successfulGlyphs,
          failedGlyphs: status.failedGlyphs,
          transactionIds: status.transactionIds,
          compressionStats: status.compressionStats,
          error: status.error
        };
      }
      
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
    return this.activePublishing.get(contentId) || null;
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
        status.stage = 'cancelled';
        status.error = 'Publishing cancelled by user';
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
   * Get all active publishing operations
   * @returns {Array} Array of active publishing statuses
   */
  getActivePublishing() {
    return Array.from(this.activePublishing.values());
  }

  /**
   * Check blockchain connection status
   * @returns {Promise<Object>} Connection status
   */
  async checkConnection() {
    try {
      const startTime = Date.now();
      const { blockhash } = await this.connection.getLatestBlockhash();
      const latency = Date.now() - startTime;
      
      return {
        connected: true,
        latency: latency,
        blockhash: blockhash,
        endpoint: this.connection.rpcEndpoint
      };
    } catch (error) {
      console.error('Blockchain connection check failed:', error);
      return {
        connected: false,
        latency: null,
        blockhash: null,
        endpoint: this.connection.rpcEndpoint,
        error: error.message
      };
    }
  }

  /**
   * Estimate transaction costs
   * @param {number} glyphCount - Number of glyphs to publish
   * @returns {Promise<Object>} Cost estimation
   */
  async estimateTransactionCosts(glyphCount) {
    try {
      // Get current fee structure
      const feeCalculator = await this.connection.getRecentBlockhash();
      const lamportsPerSignature = 5000; // Current base fee
      
      const totalCost = lamportsPerSignature * glyphCount;
      const solCost = totalCost / 1000000000; // Convert to SOL
      
      return {
        glyphCount,
        lamportsPerTransaction: lamportsPerSignature,
        totalLamports: totalCost,
        totalSol: solCost,
        estimatedUsd: solCost * 20, // Rough SOL price estimate
        currency: 'SOL'
      };
    } catch (error) {
      console.error('Error estimating transaction costs:', error);
      return {
        glyphCount,
        lamportsPerTransaction: 5000,
        totalLamports: 5000 * glyphCount,
        totalSol: (5000 * glyphCount) / 1000000000,
        estimatedUsd: ((5000 * glyphCount) / 1000000000) * 20,
        currency: 'SOL',
        error: error.message
      };
    }
  }

  /**
   * Run self-test to verify BlockchainPublisher functionality
   * @returns {Promise<boolean>} True if all tests pass
   */
  async runSelfTest() {
    try {
      console.log('Running BlockChainPublisher self-test...');
      
      // Test connection
      const connectionStatus = await this.checkConnection();
      if (!connectionStatus.connected) {
        console.error('Self-test failed: Blockchain connection failed');
        return false;
      }

      // Test cost estimation
      const costEstimate = await this.estimateTransactionCosts(5);
      if (!costEstimate || typeof costEstimate.totalSol !== 'number') {
        console.error('Self-test failed: Cost estimation failed');
        return false;
      }

      // Test active publishing tracking
      const testStatus = {
        contentId: 'test_blockchain',
        stage: 'testing',
        progress: 50
      };
      
      this.activePublishing.set('test_blockchain', testStatus);
      const retrievedStatus = this.getPublishingStatus('test_blockchain');
      
      if (!retrievedStatus || retrievedStatus.stage !== 'testing') {
        console.error('Self-test failed: Publishing status tracking failed');
        return false;
      }

      // Clean up
      this.activePublishing.delete('test_blockchain');

      console.log('✅ BlockChainPublisher self-test passed!');
      return true;
    } catch (error) {
      console.error('Self-test failed with error:', error);
      return false;
    }
  }
}

// Character count: 12847