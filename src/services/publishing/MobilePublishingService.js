// src/services/publishing/MobilePublishingService.js
// Path: src/services/publishing/MobilePublishingService.js
import { Connection, Transaction, TransactionInstruction, PublicKey } from '@solana/web3.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { MobileWalletService } from '../wallet/MobileWalletService';
import { MobileGlyphManager } from './MobileGlyphManager';
import { MobileScrollManager } from './MobileScrollManager';
import { HashingService } from '../hashing/HashingService';
import { CompressionService } from '../compression/CompressionService';

/**
 * Mobile Publishing Service with proper encryption, compression, and integrity verification
 * Replaces the old MobilePublishingService with better security and features
 */
export class MobilePublishingService {
  constructor() {
    this.connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    this.MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
    this.activePublishing = new Map();
    this.currentWallet = null;
  }

  /**
   * Initialize the service with a wallet
   * @param {MobileWalletService} walletService - Initialized wallet service
   */
  setWallet(walletService) {
    this.currentWallet = walletService;
  }

  /**
   * File picker with expanded format support
   * @returns {Promise<Object|null>} Content object or null
   */
  async pickAndLoadFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'text/plain',           // .txt
          'text/markdown',        // .md
          'text/rtf',            // .rtf
          'application/pdf',      // .pdf (we'll handle text extraction)
          'application/msword',   // .doc
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
          'text/*',              // Any text file
          '*/*'                  // Allow all files as fallback
        ],
        copyToCacheDirectory: true,
      });
      
      if (result.assets && result.assets[0]) {
        const file = result.assets[0];
        let content;
        
        try {
          // Try to read as text
          content = await FileSystem.readAsStringAsync(file.uri);
          
          // Basic validation
          if (!content || content.trim().length < 10) {
            throw new Error('File content is too short or empty');
          }
          
        } catch (readError) {
          throw new Error(`Cannot read file as text. Please select a text file (.txt, .md, etc.)`);
        }
        
        // Generate content ID using enhanced hashing
        const contentId = await HashingService.generateContentId(
          file.name,
          await this.getWalletPublicKey(),
          Date.now()
        );
        
        return {
          id: contentId,
          title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
          content: content,
          authorPublicKey: await this.getWalletPublicKey(),
          createdAt: Date.now(),
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error picking file:', error);
      throw error;
    }
  }

  /**
   * Estimate publishing cost and time for content
   * @param {Object} content - Content object
   * @returns {Object} Publishing estimate
   */
  estimatePublishing(content) {
    try {
      const glyphCount = MobileGlyphManager.estimateChunkCount(content.content);
      const estimatedCost = MobileGlyphManager.estimateStorageCost(content.content);
      
      return {
        glyphCount: glyphCount,
        estimatedCost: estimatedCost.costs.total,
        currency: estimatedCost.costs.currency,
        estimatedTimeMinutes: (glyphCount * 1.5) / 60, // 1.5 seconds per glyph
        compressionRatio: estimatedCost.compressionRatio,
        spaceSaved: estimatedCost.spaceSaved
      };
    } catch (error) {
      console.error('Error estimating publishing:', error);
      throw error;
    }
  }

  /**
   * Main publishing function with enhanced error handling and progress tracking
   * @param {Object} content - Content to publish
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} Publishing result
   */
  async publishContent(content, onProgress) {
    try {
      console.log('Starting enhanced publishing process...');
      
      // Initialize tracking
      const contentId = content.id;
      const status = {
        contentId: contentId,
        stage: 'preparing',
        progress: 0,
        currentGlyph: 0,
        totalGlyphs: 0,
        transactionIds: [],
        failedGlyphs: 0,
        successfulGlyphs: 0,
        estimatedCost: null,
        compressionStats: null
      };
      
      this.activePublishing.set(contentId, status);
      onProgress && onProgress(status);
      
      // Step 1: Create glyphs with enhanced chunking
      status.stage = 'processing';
      onProgress && onProgress(status);
      
      console.log('Creating glyphs with enhanced GlyphManager...');
      const glyphChunks = await MobileGlyphManager.createGlyphs(
        content.content,
        {
          onProgress: (current, total) => {
            console.log(`Created ${current}/${total} glyphs...`);
          }
        }
      );
      
      status.totalGlyphs = glyphChunks.length;
      
      // Calculate compression stats
      const originalSize = content.content.length;
      const compressedSize = glyphChunks.reduce((total, chunk) => total + chunk.content.length, 0);
      
      status.compressionStats = {
        originalSize: originalSize,
        compressedSize: compressedSize,
        compressionRatio: (compressedSize / originalSize).toFixed(2),
        spaceSaved: originalSize - compressedSize,
        percentSaved: ((1 - compressedSize / originalSize) * 100).toFixed(1)
      };
      
      // Cost estimation
      status.estimatedCost = MobileGlyphManager.estimateStorageCost(content.content);
      
      console.log(`Created ${glyphChunks.length} glyphs with ${status.compressionStats.percentSaved}% compression`);
      onProgress && onProgress(status);
      
      // Convert glyph chunks to old format for compatibility
      const glyphs = glyphChunks.map(chunk => ({
        id: `glyph_${chunk.index}_${Date.now()}`,
        index: chunk.index,
        content: CompressionService.uint8ArrayToBase64(chunk.content), // Convert to base64 for storage
        hash: chunk.hash,
        totalGlyphs: chunk.totalChunks,
        transactionId: null,
        status: 'pending',
        originalText: chunk.originalText
      }));
      
      // Save as in-progress immediately
      await this.saveInProgressContent({
        ...content,
        glyphs: glyphs,
        glyphChunks: glyphChunks, // Keep enhanced chunks for later use
        status: 'processing',
        startedAt: Date.now(),
        compressionStats: status.compressionStats,
        estimatedCost: status.estimatedCost
      });
      
      // Step 2: Get wallet
      const keypair = await this.getWalletKeypair();
      
      // Step 3: Publish each glyph with enhanced error handling
      status.stage = 'publishing';
      onProgress && onProgress(status);
      
      const transactionIds = [];
      let successfulGlyphs = 0;
      let failedGlyphs = 0;
      
      for (let i = 0; i < glyphs.length; i++) {
        const glyph = glyphs[i];
        const glyphChunk = glyphChunks[i];
        
        // Update progress
        status.currentGlyph = i + 1;
        status.progress = Math.floor((i / glyphs.length) * 100);
        status.successfulGlyphs = successfulGlyphs;
        status.failedGlyphs = failedGlyphs;
        onProgress && onProgress(status);
        
        try {
          // Verify glyph integrity before publishing
          const isIntegrityValid = await MobileGlyphManager.verifyGlyphIntegrity(glyphChunk);
          if (!isIntegrityValid) {
            throw new Error(`Glyph ${i + 1} failed integrity check`);
          }
          
          // Create transaction with compressed data
          const transaction = new Transaction();
          
          // IMPORTANT: Convert compressed binary data to base64 for the Memo program
          // The Solana Memo program expects UTF-8 text, so we encode our binary data as base64
          const base64CompressedData = CompressionService.uint8ArrayToBase64(glyphChunk.content);
          const memoData = Buffer.from(base64CompressedData, 'utf-8');
          
          // Add memo instruction with base64-encoded compressed data
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
          await this.connection.confirmTransaction(signature);
          
          // SUCCESS - Mark glyph as published
          glyph.transactionId = signature;
          glyph.status = 'published';
          transactionIds.push(signature);
          successfulGlyphs++;
          
          console.log(`✅ Glyph ${i + 1}/${glyphs.length} published: ${signature}`);
          
        } catch (error) {
          // FAILURE - Mark glyph as failed
          console.error(`❌ Error publishing glyph ${i + 1}:`, error);
          glyph.status = 'failed';
          glyph.error = error.message;
          failedGlyphs++;
        }
        
        // Update in-progress content after each glyph
        await this.updateInProgressContent(contentId, glyphs, successfulGlyphs, failedGlyphs);
        
        // Small delay between transactions
        if (i < glyphs.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Final status determination
      status.successfulGlyphs = successfulGlyphs;
      status.failedGlyphs = failedGlyphs;
      status.transactionIds = transactionIds;
      
      if (successfulGlyphs === glyphs.length) {
        // ALL GLYPHS PUBLISHED SUCCESSFULLY - Create scroll manifest
        status.stage = 'completed';
        status.progress = 100;
        
        // Create scroll manifest
        const publishedContent = {
          ...content,
          glyphs: glyphs.filter(g => g.status === 'published'),
          transactionIds: transactionIds,
          totalGlyphs: glyphs.length,
          successfulGlyphs: successfulGlyphs,
          failedGlyphs: failedGlyphs,
          publishedAt: Date.now(),
          compressionStats: status.compressionStats
        };
        
        const manifest = await MobileScrollManager.createScrollFromPublishedContent(publishedContent);
        status.scrollId = manifest.id;
        publishedContent.scrollId = manifest.id;
        publishedContent.manifest = manifest;
        
        // Save as published
        await this.savePublishedContent(publishedContent);
        await this.removeInProgressContent(contentId);
        
        onProgress && onProgress(status);
        
        return {
          status: 'completed',
          contentId: contentId,
          scrollId: manifest.id,
          totalGlyphs: glyphs.length,
          successfulGlyphs: successfulGlyphs,
          failedGlyphs: failedGlyphs,
          transactionIds: transactionIds,
          compressionStats: status.compressionStats
        };
        
      } else if (successfulGlyphs > 0) {
        // PARTIAL SUCCESS
        status.stage = 'partial';
        status.progress = Math.floor((successfulGlyphs / glyphs.length) * 100);
        onProgress && onProgress(status);
        
        return {
          status: 'partial',
          contentId: contentId,
          scrollId: null,
          totalGlyphs: glyphs.length,
          successfulGlyphs: successfulGlyphs,
          failedGlyphs: failedGlyphs,
          transactionIds: transactionIds,
          compressionStats: status.compressionStats
        };
        
      } else {
        // TOTAL FAILURE
        status.stage = 'failed';
        status.error = 'All glyphs failed to publish';
        onProgress && onProgress(status);
        
        return {
          status: 'failed',
          contentId: contentId,
          scrollId: null,
          totalGlyphs: glyphs.length,
          successfulGlyphs: 0,
          failedGlyphs: glyphs.length,
          transactionIds: [],
          compressionStats: status.compressionStats
        };
      }
      
    } catch (error) {
      console.error('Publishing error:', error);
      throw error;
    } finally {
      this.activePublishing.delete(content.id);
    }
  }

  /**
   * Resume publishing for failed glyphs
   * @param {string} contentId - Content ID to resume
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} Publishing result
   */
  async resumePublishing(contentId, onProgress) {
    try {
      // Get in-progress content
      const inProgressList = await this.getInProgressContent();
      const content = inProgressList.find(item => item.id === contentId);
      
      if (!content) {
        throw new Error('Content not found in progress');
      }
      
      // Get unpublished glyphs
      const unpublishedGlyphs = content.glyphs.filter(g => g.status !== 'published');
      
      if (unpublishedGlyphs.length === 0) {
        throw new Error('No unpublished glyphs to resume');
      }
      
      console.log(`Resuming publishing for ${unpublishedGlyphs.length} failed glyphs...`);
      
      // Initialize status
      const status = {
        contentId: contentId,
        stage: 'publishing',
        progress: 0,
        currentGlyph: 0,
        totalGlyphs: content.glyphs.length,
        transactionIds: content.transactionIds || [],
        failedGlyphs: 0,
        successfulGlyphs: content.glyphs.filter(g => g.status === 'published').length,
        compressionStats: content.compressionStats,
        estimatedCost: content.estimatedCost
      };
      
      onProgress && onProgress(status);
      
      // Get wallet
      const keypair = await this.getWalletKeypair();
      
      // Try to publish each unpublished glyph
      for (const glyph of unpublishedGlyphs) {
        status.currentGlyph++;
        status.progress = Math.floor((status.successfulGlyphs / content.glyphs.length) * 100);
        onProgress && onProgress(status);
        
        try {
          // Get the original glyph chunk
          const glyphChunk = content.glyphChunks ? 
            content.glyphChunks[glyph.index] : 
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
          
          // Wait for confirmation
          await this.connection.confirmTransaction(signature);
          
          // Mark as published
          glyph.transactionId = signature;
          glyph.status = 'published';
          glyph.error = undefined;
          status.transactionIds.push(signature);
          status.successfulGlyphs++;
          
          console.log(`✅ Glyph ${glyph.index + 1} published: ${signature}`);
          
        } catch (error) {
          console.error(`❌ Error publishing glyph ${glyph.index + 1}:`, error);
          glyph.error = error.message;
          status.failedGlyphs++;
        }
        
        // Update in-progress content
        await this.updateInProgressContent(
          contentId, 
          content.glyphs, 
          status.successfulGlyphs, 
          status.failedGlyphs
        );
      }
      
      // Check final status
      const allPublished = content.glyphs.every(g => g.status === 'published');
      
      if (allPublished) {
        // Create scroll and move to published
        status.stage = 'completed';
        status.progress = 100;
        
        const publishedContent = {
          ...content,
          transactionIds: status.transactionIds,
          publishedAt: Date.now()
        };
        
        const manifest = await MobileScrollManager.createScrollFromPublishedContent(publishedContent);
        publishedContent.scrollId = manifest.id;
        publishedContent.manifest = manifest;
        
        await this.savePublishedContent(publishedContent);
        await this.removeInProgressContent(contentId);
        
        onProgress && onProgress(status);
        
        return {
          status: 'completed',
          contentId: contentId,
          scrollId: manifest.id,
          totalGlyphs: content.glyphs.length,
          successfulGlyphs: status.successfulGlyphs,
          failedGlyphs: status.failedGlyphs,
          transactionIds: status.transactionIds
        };
      } else {
        // Still partial
        return {
          status: 'partial',
          contentId: contentId,
          scrollId: null,
          totalGlyphs: content.glyphs.length,
          successfulGlyphs: status.successfulGlyphs,
          failedGlyphs: status.failedGlyphs,
          transactionIds: status.transactionIds
        };
      }
      
    } catch (error) {
      console.error('Resume publishing error:', error);
      throw error;
    }
  }

  /**
   * Storage Methods
   */
  
  async savePublishedContent(content) {
    try {
      const published = await this.getPublishedContent();
      published.push(content);
      await AsyncStorage.setItem('glyffiti_published', JSON.stringify(published));
    } catch (error) {
      console.error('Error saving published content:', error);
    }
  }

  async getPublishedContent() {
    try {
      const data = await AsyncStorage.getItem('glyffiti_published');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting published content:', error);
      return [];
    }
  }

  async saveInProgressContent(content) {
    try {
      const inProgress = await this.getInProgressContent();
      const index = inProgress.findIndex(item => item.id === content.id);
      
      if (index >= 0) {
        inProgress[index] = content;
      } else {
        inProgress.push(content);
      }
      
      await AsyncStorage.setItem('glyffiti_in_progress', JSON.stringify(inProgress));
    } catch (error) {
      console.error('Error saving in-progress content:', error);
    }
  }

  async getInProgressContent() {
    try {
      const data = await AsyncStorage.getItem('glyffiti_in_progress');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting in-progress content:', error);
      return [];
    }
  }

  async updateInProgressContent(contentId, glyphs, successfulGlyphs, failedGlyphs) {
    try {
      const inProgress = await this.getInProgressContent();
      const index = inProgress.findIndex(item => item.id === contentId);
      
      if (index >= 0) {
        inProgress[index].glyphs = glyphs;
        inProgress[index].successfulGlyphs = successfulGlyphs;
        inProgress[index].failedGlyphs = failedGlyphs;
        inProgress[index].lastUpdated = Date.now();
        
        await AsyncStorage.setItem('glyffiti_in_progress', JSON.stringify(inProgress));
      }
    } catch (error) {
      console.error('Error updating in-progress content:', error);
    }
  }

  async removeInProgressContent(contentId) {
    try {
      const inProgress = await this.getInProgressContent();
      const filtered = inProgress.filter(item => item.id !== contentId);
      await AsyncStorage.setItem('glyffiti_in_progress', JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing in-progress content:', error);
    }
  }

  async saveDraft(content) {
    try {
      const drafts = await this.getDrafts();
      drafts.push({
        ...content,
        savedAt: Date.now()
      });
      await AsyncStorage.setItem('glyffiti_drafts', JSON.stringify(drafts));
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  }

  async getDrafts() {
    try {
      const data = await AsyncStorage.getItem('glyffiti_drafts');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting drafts:', error);
      return [];
    }
  }

  /**
   * Get publishing statistics
   * @returns {Promise<Object>} Publishing stats
   */
  async getPublishingStats() {
    try {
      const published = await this.getPublishedContent();
      const totalGlyphs = published.reduce((sum, item) => sum + (item.glyphs?.length || 0), 0);
      const totalCost = totalGlyphs * 0.000005; // Estimated cost per glyph
      
      return {
        totalPublished: published.length,
        totalGlyphs: totalGlyphs,
        totalCost: totalCost,
        successRate: published.length > 0 ? 100 : 0
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        totalPublished: 0,
        totalGlyphs: 0,
        totalCost: 0,
        successRate: 0
      };
    }
  }

  /**
   * Helper method to get wallet keypair
   * @returns {Promise<Keypair>} Wallet keypair
   */
  async getWalletKeypair() {
    if (!this.currentWallet) {
      throw new Error('No wallet connected');
    }
    
    return this.currentWallet.getWalletKeypair();
  }

  /**
   * Helper method to get wallet public key
   * @returns {Promise<string>} Wallet public key
   */
  async getWalletPublicKey() {
    if (!this.currentWallet) {
      return 'unknown';
    }
    
    return this.currentWallet.getWalletPublicKey();
  }
}

// Character count: 26847