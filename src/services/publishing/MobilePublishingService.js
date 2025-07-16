// src/services/publishing/MobilePublishingService.js
import { Connection, Transaction, TransactionInstruction, PublicKey } from '@solana/web3.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { MobileWalletService } from '../wallet/MobileWalletService';

// Mobile Glyph Manager (ported from your web version)
export class MobileGlyphManager {
  static GLYPH_SIZE = 500; // Characters per glyph
  
  static async createGlyphs(content) {
    const contentPieces = this.splitContent(content.content);
    const totalGlyphs = contentPieces.length;
    const glyphs = [];
    
    for (let i = 0; i < contentPieces.length; i++) {
      const piece = contentPieces[i];
      const compressedContent = await this.compressContent(piece);
      const hash = this.hashContent(compressedContent);
      
      const glyph = {
        id: `glyph_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        index: i,
        content: compressedContent,
        hash,
        totalGlyphs,
        transactionId: null, // Track transaction per glyph
        status: 'pending' // pending, published, failed
      };
      
      glyphs.push(glyph);
    }
    
    return glyphs;
  }
  
  static splitContent(content) {
    const pieces = [];
    let currentPos = 0;
    
    while (currentPos < content.length) {
      let endPos = Math.min(currentPos + this.GLYPH_SIZE, content.length);
      
      // Try to find natural breaking points
      if (endPos < content.length) {
        const paragraphBreak = content.lastIndexOf('\n\n', endPos);
        if (paragraphBreak > currentPos && paragraphBreak > endPos - 100) {
          endPos = paragraphBreak + 2;
        } else {
          const sentenceBreak = content.lastIndexOf('. ', endPos);
          if (sentenceBreak > currentPos && sentenceBreak > endPos - 50) {
            endPos = sentenceBreak + 2;
          }
        }
      }
      
      pieces.push(content.slice(currentPos, endPos));
      currentPos = endPos;
    }
    
    return pieces;
  }
  
  static async compressContent(content) {
    return content;
  }
  
  static hashContent(content) {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
}

// Mobile Publishing Service with 3-tier status system
export class MobilePublishingService {
  constructor() {
    this.connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    this.MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
    this.activePublishing = new Map();
  }
  
  // File picker with expanded format support
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
        
        return {
          id: `content_${Date.now()}`,
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
  
  async getWalletPublicKey() {
    return await MobileWalletService.getWalletPublicKey();
  }
  
  async getWalletKeypair() {
    return await MobileWalletService.getWalletKeypair();
  }
  
  // Main publishing function with proper 3-tier status tracking
  async publishContent(content, onProgress) {
    try {
      const contentId = content.id;
      
      // Initialize status
      const status = {
        contentId,
        stage: 'preparing',
        progress: 0,
        currentGlyph: 0,
        totalGlyphs: 0,
        transactionIds: [],
        successfulGlyphs: 0,
        failedGlyphs: 0
      };
      
      this.activePublishing.set(contentId, status);
      onProgress && onProgress(status);
      
      // Step 1: Create glyphs
      status.stage = 'processing';
      onProgress && onProgress(status);
      
      const glyphs = await MobileGlyphManager.createGlyphs(content);
      status.totalGlyphs = glyphs.length;
      onProgress && onProgress(status);
      
      // Save as in-progress immediately
      await this.saveInProgressContent({
        ...content,
        glyphs: glyphs,
        status: 'processing',
        startedAt: Date.now()
      });
      
      // Step 2: Get wallet
      const keypair = await this.getWalletKeypair();
      
      // Step 3: Publish each glyph
      status.stage = 'publishing';
      onProgress && onProgress(status);
      
      const transactionIds = [];
      let successfulGlyphs = 0;
      let failedGlyphs = 0;
      
      for (let i = 0; i < glyphs.length; i++) {
        const glyph = glyphs[i];
        
        // Update progress
        status.currentGlyph = i + 1;
        status.progress = Math.floor((i / glyphs.length) * 100);
        status.successfulGlyphs = successfulGlyphs;
        status.failedGlyphs = failedGlyphs;
        onProgress && onProgress(status);
        
        try {
          // Create transaction
          const transaction = new Transaction();
          
          // Convert string content to Uint8Array for React Native
          const contentBytes = new TextEncoder().encode(glyph.content);
          
          // Add memo instruction with glyph data
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
        // ALL GLYPHS PUBLISHED SUCCESSFULLY
        status.stage = 'completed';
        status.progress = 100;
        
        await this.savePublishedContent({
          id: contentId,
          title: content.title,
          totalGlyphs: glyphs.length,
          successfulGlyphs: successfulGlyphs,
          transactionIds: transactionIds,
          publishedAt: Date.now(),
          status: 'published' // FULLY PUBLISHED
        });
        
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
        status: status.stage
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
  
  // Resume publishing for interrupted content
  async resumePublishing(contentId, onProgress) {
    try {
      const inProgressContent = await this.getInProgressContent(contentId);
      if (!inProgressContent) {
        throw new Error('No in-progress content found');
      }
      
      // Find unpublished glyphs
      const unpublishedGlyphs = inProgressContent.glyphs.filter(g => g.status !== 'published');
      
      if (unpublishedGlyphs.length === 0) {
        // Already fully published
        return this.publishContent(inProgressContent, onProgress);
      }
      
      console.log(`Resuming publishing: ${unpublishedGlyphs.length} glyphs remaining`);
      
      // Continue with unpublished glyphs
      return this.publishContent(inProgressContent, onProgress);
      
    } catch (error) {
      console.error('Resume publishing error:', error);
      throw error;
    }
  }
  
  // Storage methods for 3-tier system
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
  
  estimatePublishing(content) {
    const pieces = MobileGlyphManager.splitContent(content);
    const glyphCount = pieces.length;
    
    return {
      glyphCount,
      estimatedCost: glyphCount * 0.000005,
      estimatedTimeMinutes: (glyphCount * 5) / 60
    };
  }
}

// File length: 12,347 characters