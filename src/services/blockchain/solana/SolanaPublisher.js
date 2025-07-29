// src/services/blockchain/solana/SolanaPublisher.js
// Path: src/services/blockchain/solana/SolanaPublisher.js
import { Connection, Transaction, TransactionInstruction, PublicKey } from '@solana/web3.js';
import { CompressionService } from '../../compression/CompressionService';
import { StorageService } from '../../storage/StorageService';

/**
 * Solana Publisher - Handles Solana-specific blockchain publishing operations
 * Extracted from BlockChainPublisher for better organization and multi-currency support
 */
export class SolanaPublisher {
  constructor() {
    this.connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    this.MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
    this.activePublishing = new Map();
  }

  /**
   * Publish prepared content to Solana blockchain with enhanced error handling and scroll creation
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
        stage: 'preparing',
        progress: 0,
        currentGlyph: 0,
        totalGlyphs: content.glyphs.length,
        successfulGlyphs: 0,
        failedGlyphs: 0,
        transactionIds: [],
        compressionStats: content.compressionStats,
        error: null
      };

      this.activePublishing.set(contentId, status);
      onProgress && onProgress(status);

      // Save in-progress content
      status.stage = 'saving';
      status.progress = 5;
      onProgress && onProgress(status);

      await StorageService.saveInProgressContent(content);

      console.log(`🚀 Starting Solana publication of ${content.glyphs.length} glyphs for content: ${contentId}`);

      // Publishing phase
      status.stage = 'publishing';
      status.progress = 10;
      onProgress && onProgress(status);

      const maxRetries = 3;
      const retryDelay = 2000;

      // Process each glyph
      for (let index = 0; index < content.glyphs.length; index++) {
        const glyph = content.glyphs[index];
        let glyphPublished = false;
        let retryCount = 0;

        // Update progress
        status.currentGlyph = index + 1;
        status.progress = Math.floor((index / content.glyphs.length) * 80) + 10;
        onProgress && onProgress(status);

        // Retry logic for this specific glyph
        while (!glyphPublished && retryCount < maxRetries) {
          try {
            console.log(`📤 Publishing glyph ${index + 1}/${content.glyphs.length} (attempt ${retryCount + 1}/${maxRetries})`);
            
            // Get or create full glyph chunk data
            const glyphChunk = content.glyphChunks && content.glyphChunks[index] || 
              {
                index: index,
                totalChunks: content.glyphs.length,
                content: CompressionService.base64ToUint8Array(glyph.content),
                hash: glyph.hash,
                originalText: glyph.originalText
              };
            
            // Create Solana transaction
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
            const confirmation = await this.connection.confirmTransaction(
              signature,
              'confirmed'
            );
            
            if (confirmation.value.err) {
              throw new Error(`Transaction failed: ${confirmation.value.err}`);
            }
            
            console.log(`✅ Glyph ${index + 1} published: ${signature}`);
            
            // Update glyph status
            glyph.status = 'published';
            glyph.transactionId = signature;
            glyph.publishedAt = Date.now();
            
            status.transactionIds.push(signature);
            status.successfulGlyphs++;
            glyphPublished = true;
            
            // Update storage with current progress
            await StorageService.saveInProgressContent(content);
            
          } catch (error) {
            retryCount++;
            console.error(`❌ Glyph ${index + 1} attempt ${retryCount} failed:`, error.message);
            
            if (retryCount >= maxRetries) {
              console.error(`💥 Glyph ${index + 1} failed after ${maxRetries} attempts`);
              glyph.status = 'failed';
              glyph.error = error.message;
              status.failedGlyphs++;
              glyphPublished = true; // Move on to next glyph
            } else {
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
          }
        }
      }

      // Final validation and scroll creation
      status.stage = 'finalizing';
      status.progress = 90;
      onProgress && onProgress(status);

      console.log(`📊 Publishing Summary: ${status.successfulGlyphs} successful, ${status.failedGlyphs} failed`);

      if (status.successfulGlyphs === 0) {
        throw new Error('All glyph publishing attempts failed');
      }

      // Create published content record
      const publishedContent = {
        ...content,
        publishedAt: Date.now(),
        publishingStatus: 'completed',
        successfulGlyphs: status.successfulGlyphs,
        failedGlyphs: status.failedGlyphs,
        transactionIds: status.transactionIds
      };

      // Save to published content and create scroll
      await StorageService.savePublishedContent(publishedContent);

      // Create scroll manifest
      const manifest = await StorageService.createScrollFromPublishedContent(publishedContent);

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
     
    } catch (error) {
      console.error('❌ Solana publishing error:', error);
      
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
   * Resume publishing from a failed or partial state on Solana
   * @param {string} contentId - Content ID to resume
   * @param {Object} keypair - Wallet keypair for signing
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} Publishing result
   */
  async resumePublishing(contentId, keypair, onProgress = null) {
    try {
      console.log(`🔄 Resuming Solana publication of content: ${contentId}`);
      
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
        error: null
      };

      this.activePublishing.set(contentId, status);
      onProgress && onProgress(status);

      const maxRetries = 3;
      const retryDelay = 2000;

      // Process unpublished glyphs only
      const glyphsToProcess = content.glyphs.filter(g => g.status !== 'published');
      
      for (const glyph of glyphsToProcess) {
        let glyphPublished = false;
        let retryCount = 0;

        // Update progress
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
            
            // Create Solana transaction
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
            const confirmation = await this.connection.confirmTransaction(
              signature,
              'confirmed'
            );
            
            if (confirmation.value.err) {
              throw new Error(`Transaction failed: ${confirmation.value.err}`);
            }
            
            console.log(`✅ Resumed glyph ${glyph.index + 1} published: ${signature}`);
            
            // Update glyph status
            glyph.status = 'published';
            glyph.transactionId = signature;
            glyph.publishedAt = Date.now();
            
            status.transactionIds.push(signature);
            status.successfulGlyphs++;
            glyphPublished = true;
            
            // Update storage with current progress
            await StorageService.saveInProgressContent(content);
            
          } catch (error) {
            retryCount++;
            console.error(`❌ Resumed glyph ${glyph.index + 1} attempt ${retryCount} failed:`, error.message);
            
            if (retryCount >= maxRetries) {
              console.error(`💥 Resumed glyph ${glyph.index + 1} failed after ${maxRetries} attempts`);
              glyph.status = 'failed';
              glyph.error = error.message;
              status.failedGlyphs++;
              glyphPublished = true; // Move on to next glyph
            } else {
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
          }
        }
      }

      // Final processing same as publishContent
      status.stage = 'finalizing';
      status.progress = 90;
      onProgress && onProgress(status);

      console.log(`📊 Resume Summary: ${status.successfulGlyphs} successful, ${status.failedGlyphs} failed`);

      if (status.successfulGlyphs === 0) {
        throw new Error('All glyph publishing attempts failed during resume');
      }

      // Create published content record
      const publishedContent = {
        ...content,
        publishedAt: Date.now(),
        publishingStatus: 'completed',
        successfulGlyphs: status.successfulGlyphs,
        failedGlyphs: status.failedGlyphs,
        transactionIds: status.transactionIds
      };

      // Save to published content and create scroll
      await StorageService.savePublishedContent(publishedContent);

      // Create scroll manifest
      const manifest = await StorageService.createScrollFromPublishedContent(publishedContent);
      const saveResult = await StorageService.saveScrollLocally(manifest);

      // Clean up in-progress content
      await StorageService.removeInProgressContent(contentId);

      // Final status update
      status.stage = 'completed';
      status.progress = 100;
      onProgress && onProgress(status);

      console.log('🎉 Solana resume publishing completed successfully!');

      return {
        status: 'completed',
        contentId,
        manifest,
        saveResult,
        publishedContent,
        totalGlyphs: content.glyphs.length,
        successfulGlyphs: status.successfulGlyphs,
        failedGlyphs: status.failedGlyphs,
        transactionIds: status.transactionIds,
        compressionStats: status.compressionStats,
        error: status.error
      };
      
    } catch (error) {
      console.error('❌ Error resuming Solana publishing:', error);
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
      console.error('Error cancelling Solana publishing:', error);
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
   * Check connection health to Solana network
   * @returns {Promise<boolean>} Connection status
   */
  async checkConnection() {
    try {
      await this.connection.getVersion();
      return true;
    } catch (error) {
      console.error('Solana connection check failed:', error);
      return false;
    }
  }

  /**
   * Get current Solana network endpoint
   * @returns {string} Network endpoint URL
   */
  getNetworkEndpoint() {
    return this.connection.rpcEndpoint;
  }
}

// Character count: 13,892