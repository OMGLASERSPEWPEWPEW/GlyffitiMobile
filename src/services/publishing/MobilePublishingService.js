// src/services/publishing/MobilePublishingService.js
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
          title: file.name.replace(/\.[^/.]+$/, ""),
          content: content,
          authorPublicKey: await this.getWalletPublicKey(),
          timestamp: Date.now(),
          status: 'draft' // Start as draft
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error picking file:', error);
      throw error;
    }
  }
  
  /**
   * Get wallet public key from current wallet
   * @returns {Promise<string>} Public key
   */
  async getWalletPublicKey() {
    if (!this.currentWallet) {
      throw new Error('No wallet service configured');
    }
    return this.currentWallet.getWalletPublicKey();
  }
  
  /**
   * Get wallet keypair from current wallet
   * @returns {Promise<Object>} Keypair
   */
  async getWalletKeypair() {
    if (!this.currentWallet) {
      throw new Error('No wallet service configured');
    }
    return this.currentWallet.getWalletKeypair();
  }
  
  /**
   * Main publishing function with enhanced glyph management and progress tracking
   * @param {Object} content - Content to publish
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} Publishing result
   */
  async publishContent(content, onProgress) {
    try {
      const contentId = content.id;
      
      // Initialize enhanced status tracking
      const status = {
        contentId,
        stage: 'preparing',
        progress: 0,
        currentGlyph: 0,
        totalGlyphs: 0,
        transactionIds: [],
        successfulGlyphs: 0,
        failedGlyphs: 0,
        compressionStats: null,
        estimatedCost: null
      };
      
      this.activePublishing.set(contentId, status);
      onProgress && onProgress(status);
      
      // Step 1: Create enhanced glyphs with compression and integrity checking
      status.stage = 'processing';
      onProgress && onProgress(status);
      
      console.log('Creating glyphs with enhanced GlyphManager...');
      const glyphChunks = await MobileGlyphManager.createGlyphs(content);
      status.totalGlyphs = glyphChunks.length;
      
      // Get compression statistics
      status.compressionStats = CompressionService.getCompressionStats(content.content);
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
          
          // Use the compressed content from the glyph chunk
          const contentBytes = glyphChunk.content;
          
          // Add memo instruction with compressed glyph data
          const instruction = new TransactionInstruction({
            keys: [],
            programId: this.MEMO_PROGRAM_ID,
            data: contentBytes
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
        
        try {
          // Create scroll manifest with published glyph data
          const publishedChunks = glyphChunks.map((chunk, index) => ({
            chunk: chunk,
            transactionId: glyphs[index].transactionId
          }));
          
          const scrollManifest = await MobileScrollManager.createScroll(
            content.title,
            content.authorPublicKey,
            publishedChunks,
            {
              creatorHandle: content.authorName,
              tags: content.tags || [],
              license: content.license
            }
          );
          
          // Save scroll manifest
          await MobileScrollManager.saveScrollLocally(scrollManifest);
          
          // Save to published content with manifest
          await this.savePublishedContent({
            id: contentId,
            title: content.title,
            totalGlyphs: glyphs.length,
            successfulGlyphs: successfulGlyphs,
            transactionIds: transactionIds,
            publishedAt: Date.now(),
            status: 'published',
            scrollId: scrollManifest.storyId,
            compressionStats: status.compressionStats,
            estimatedCost: status.estimatedCost
          });
          
          console.log(`✅ Content fully published with scroll manifest: ${scrollManifest.storyId}`);
        } catch (manifestError) {
          console.error('Error creating scroll manifest:', manifestError);
          // Still save as published even if manifest creation fails
          await this.savePublishedContent({
            id: contentId,
            title: content.title,
            totalGlyphs: glyphs.length,
            successfulGlyphs: successfulGlyphs,
            transactionIds: transactionIds,
            publishedAt: Date.now(),
            status: 'published',
            manifestError: manifestError.message
          });
        }
        
        // Remove from in-progress
        await this.removeInProgressContent(contentId);
        
      } else if (successfulGlyphs > 0) {
        // PARTIAL SUCCESS - Keep as in-progress
        status.stage = 'partial';
        status.error = `Published ${successfulGlyphs}/${glyphs.length} glyphs. ${failedGlyphs} failed.`;
        
        await this.updateInProgressContent(contentId, glyphs, successfulGlyphs, failedGlyphs);
        
      } else {
        // TOTAL FAILURE
        status.stage = 'failed';
        status.error = 'All glyphs failed to publish';
        
        await this.removeInProgressContent(contentId);
      }
      
      onProgress && onProgress(status);
      
      return {
        contentId,
        transactionIds,
        totalGlyphs: glyphs.length,
        successfulGlyphs,
        failedGlyphs,
        status: status.stage,
        compressionStats: status.compressionStats,
        scrollId: status.stage === 'completed' ? status.scrollId : null
      };
      
    } catch (error) {
      console.error('Publishing error:', error);
      
      const status = this.activePublishing.get(content.id);
      if (status) {
        status.stage = 'failed';
        status.error = error.message;
        onProgress && onProgress(status);
      }
      
      throw error;
    }
  }
  
  /**
   * Resume publishing for interrupted content
   * @param {string} contentId - Content ID to resume
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} Publishing result
   */
  async resumePublishing(contentId, onProgress) {
    try {
      const inProgressContent = await this.getInProgressContent(contentId);
      if (!inProgressContent) {
        throw new Error('No in-progress content found');
      }
      
      // Find unpublished glyphs
      const unpublishedGlyphs = inProgressContent.glyphs.filter(g => g.status !== 'published');
      
      if (unpublishedGlyphs.length === 0) {
        // Already fully published, try to create manifest if missing
        try {
          if (inProgressContent.glyphChunks) {
            const publishedChunks = inProgressContent.glyphChunks.map((chunk, index) => ({
              chunk: chunk,
              transactionId: inProgressContent.glyphs[index].transactionId
            }));
            
            const scrollManifest = await MobileScrollManager.createScroll(
              inProgressContent.title,
              inProgressContent.authorPublicKey,
              publishedChunks
            );
            
            await MobileScrollManager.saveScrollLocally(scrollManifest);
            console.log('Created missing scroll manifest for completed content');
          }
        } catch (error) {
          console.error('Error creating missing manifest:', error);
        }
        
        return { status: 'completed', message: 'Content already fully published' };
      }
      
      console.log(`Resuming publishing: ${unpublishedGlyphs.length} glyphs remaining`);
      
      // Continue with unpublished glyphs
      return this.publishContent(inProgressContent, onProgress);
      
    } catch (error) {
      console.error('Resume publishing error:', error);
      throw error;
    }
  }
  
  /**
   * Estimate publishing cost and stats for content
   * @param {Object} content - Content to estimate
   * @returns {Object} Estimation details
   */
  estimatePublishing(content) {
    try {
      const costEstimate = MobileGlyphManager.estimateStorageCost(content.content);
      const compressionStats = CompressionService.getCompressionStats(content.content);
      
      return {
        glyphCount: costEstimate.chunkCount,
        originalSize: costEstimate.originalSize,
        compressedSize: costEstimate.estimatedCompressedSize,
        compressionRatio: compressionStats.compressionRatio,
        spaceSaved: compressionStats.percentSaved,
        estimatedCost: costEstimate.costs.total,
        currency: costEstimate.costs.currency,
        estimatedTimeMinutes: (costEstimate.chunkCount * 5) / 60
      };
    } catch (error) {
      console.error('Error estimating publishing:', error);
      return {
        glyphCount: 0,
        estimatedCost: 0,
        estimatedTimeMinutes: 0,
        error: error.message
      };
    }
  }
  
  // Storage methods for 3-tier system (enhanced with compression stats)
  async saveInProgressContent(contentData) {
    try {
      const existing = await AsyncStorage.getItem('in_progress_content');
      const inProgressList = existing ? JSON.parse(existing) : [];
      
      const existingIndex = inProgressList.findIndex(item => item.id === contentData.id);
      if (existingIndex >= 0) {
        inProgressList[existingIndex] = contentData;
      } else {
        inProgressList.push(contentData);
      }
      
      await AsyncStorage.setItem('in_progress_content', JSON.stringify(inProgressList));
    } catch (error) {
      console.error('Error saving in-progress content:', error);
    }
  }
  
  async updateInProgressContent(contentId, glyphs, successfulGlyphs, failedGlyphs) {
    try {
      const existing = await AsyncStorage.getItem('in_progress_content');
      const inProgressList = existing ? JSON.parse(existing) : [];
      
      const existingIndex = inProgressList.findIndex(item => item.id === contentId);
      if (existingIndex >= 0) {
        inProgressList[existingIndex].glyphs = glyphs;
        inProgressList[existingIndex].successfulGlyphs = successfulGlyphs;
        inProgressList[existingIndex].failedGlyphs = failedGlyphs;
        inProgressList[existingIndex].lastUpdated = Date.now();
        
        await AsyncStorage.setItem('in_progress_content', JSON.stringify(inProgressList));
      }
    } catch (error) {
      console.error('Error updating in-progress content:', error);
    }
  }
  
  async removeInProgressContent(contentId) {
    try {
      const existing = await AsyncStorage.getItem('in_progress_content');
      const inProgressList = existing ? JSON.parse(existing) : [];
      
      const filteredList = inProgressList.filter(item => item.id !== contentId);
      await AsyncStorage.setItem('in_progress_content', JSON.stringify(filteredList));
    } catch (error) {
      console.error('Error removing in-progress content:', error);
    }
  }
  
  async getInProgressContent(contentId = null) {
    try {
      const data = await AsyncStorage.getItem('in_progress_content');
      const inProgressList = data ? JSON.parse(data) : [];
      
      if (contentId) {
        return inProgressList.find(item => item.id === contentId);
      }
      
      return inProgressList;
    } catch (error) {
      console.error('Error getting in-progress content:', error);
      return contentId ? null : [];
    }
  }
  
  async savePublishedContent(contentData) {
    try {
      const existing = await AsyncStorage.getItem('published_content');
      const publishedList = existing ? JSON.parse(existing) : [];
      
      publishedList.push(contentData);
      await AsyncStorage.setItem('published_content', JSON.stringify(publishedList));
    } catch (error) {
      console.error('Error saving published content:', error);
    }
  }
  
  async getPublishedContent() {
    try {
      const data = await AsyncStorage.getItem('published_content');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting published content:', error);
      return [];
    }
  }
  
  async saveDraft(draftData) {
    try {
      const existing = await AsyncStorage.getItem('draft_content');
      const draftList = existing ? JSON.parse(existing) : [];
      
      const existingIndex = draftList.findIndex(d => d.id === draftData.id);
      if (existingIndex >= 0) {
        draftList[existingIndex] = draftData;
      } else {
        draftList.push(draftData);
      }
      
      await AsyncStorage.setItem('draft_content', JSON.stringify(draftList));
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  }
  
  async getDrafts() {
    try {
      const data = await AsyncStorage.getItem('draft_content');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting drafts:', error);
      return [];
    }
  }
  
  /**
   * Get comprehensive publishing statistics
   * @returns {Promise<Object>} Publishing statistics
   */
  async getPublishingStats() {
    try {
      const published = await this.getPublishedContent();
      const inProgress = await this.getInProgressContent();
      const drafts = await this.getDrafts();
      
      const stats = {
        totalPublished: published.length,
        totalInProgress: inProgress.length,
        totalDrafts: drafts.length,
        totalGlyphsPublished: published.reduce((sum, p) => sum + (p.totalGlyphs || 0), 0),
        totalTransactions: published.reduce((sum, p) => sum + (p.transactionIds?.length || 0), 0),
        averageCompressionRatio: 0,
        totalSpaceSaved: 0
      };
      
      // Calculate compression statistics
      let compressionCount = 0;
      let totalCompressionRatio = 0;
      let totalSpaceSaved = 0;
      
      [...published, ...inProgress].forEach(content => {
        if (content.compressionStats) {
          compressionCount++;
          totalCompressionRatio += content.compressionStats.compressionRatio;
          totalSpaceSaved += content.compressionStats.spaceSaved;
        }
      });
      
      if (compressionCount > 0) {
        stats.averageCompressionRatio = totalCompressionRatio / compressionCount;
        stats.totalSpaceSaved = totalSpaceSaved;
      }
      
      return stats;
    } catch (error) {
      console.error('Error getting publishing stats:', error);
      return {
        totalPublished: 0,
        totalInProgress: 0,
        totalDrafts: 0,
        totalGlyphsPublished: 0,
        totalTransactions: 0,
        averageCompressionRatio: 0,
        totalSpaceSaved: 0
      };
    }
  }
}

// Character count: 18247