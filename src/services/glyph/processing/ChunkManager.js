// src/services/glyph/processing/ChunkManager.js
// Path: src/services/glyph/processing/ChunkManager.js

import { CompressionService } from '../../compression/CompressionService';
import { HashingService } from '../../hashing/HashingService';
import { TextProcessor } from './TextProcessor';

/**
 * Chunk Management - Handles content chunking and glyph creation
 * Extracted from GlyphService.js for better organization
 */
export class ChunkManager {
  /**
   * Split content into chunks (glyphs) with appropriate size and compression
   * @param {GlyphContent} content - Content to split into glyphs
   * @param {BlockchainConfig} config - Configuration for chunking
   * @returns {Promise<GlyphChunk[]>} Array of glyph chunks
   */
  static async createGlyphs(content, config) {
    try {
      const chunks = [];
      let originalText = content.content;
      
      // Pre-process text to ensure optimal chunking
      originalText = TextProcessor.preprocessText(originalText);
      
      // ✅ FIXED: Track actual position instead of calculated positions
      let currentPosition = 0;
      let chunkIndex = 0;
      
      // Split content into chunks with proper boundary tracking
      while (currentPosition < originalText.length) {
        const remainingLength = originalText.length - currentPosition;
        const targetEnd = Math.min(currentPosition + config.targetChunkSize, originalText.length);
        
        let chunkText;
        let actualEnd;
        
        // If this is the last chunk or close to end, take everything remaining
        if (remainingLength <= config.targetChunkSize * 1.2) {
          chunkText = originalText.slice(currentPosition);
          actualEnd = originalText.length;
        } else {
          // Find natural break point and get the actual chunk
          chunkText = TextProcessor.findNaturalBreakPoint(originalText, currentPosition, targetEnd);
          actualEnd = currentPosition + chunkText.length;
        }
        
        // Compress this individual chunk
        const compressedChunk = CompressionService.compress(chunkText);
        
        // Get estimated size after base64 encoding
        const base64Size = Math.ceil(compressedChunk.length * 4 / 3);
        
        // Verify the chunk isn't too large after base64 encoding
        if (base64Size > config.maxMemoSize) {
          console.warn(`Chunk ${chunkIndex} exceeds maximum size after base64 encoding: ${base64Size} bytes. Max: ${config.maxMemoSize}`);
          
          // ✅ FIXED: Split oversized chunk and track position properly
          const smallerChunks = await this.splitOversizedChunk(chunkText, chunkIndex, config);
          chunks.push(...smallerChunks);
          chunkIndex += smallerChunks.length;
        } else {
          // Create hash for the chunk
          // Create hash for the chunk
          const hash = await HashingService.hashContent(compressedChunk);
          
          // Determine previous hash for story chaining
          let previousHash = null;
          if (chunkIndex === 0) {
            // First glyph: use previous story hash (or user genesis for first story)
            previousHash = content.previousStoryHash || null;
          } else {
            // Subsequent glyphs: chain to previous glyph hash
            previousHash = chunks[chunkIndex - 1].hash;
          }
          
          // Calculate story sequence (incremental number for this user)
          // This will be the same for all glyphs in the same story
          const storySequence = this.calculateStorySequence(content);
          
          console.log(`ChunkManager.createGlyphs: Glyph ${chunkIndex} previousHash:`, 
            previousHash ? previousHash.substring(0, 8) + '...' : 'none');
          
          // Create chunk with story chain fields
          chunks.push({
            index: chunkIndex,
            totalChunks: 0, // Will be updated after all chunks created
            content: compressedChunk,
            hash: hash,
            originalText: chunkText,
            // Story chain fields
            previousStoryHash: content.previousStoryHash,
            previousGlyphHash: previousHash,
            storySequence: storySequence,
            contentType: 'published_story'
          });
          chunkIndex++;
        }
        
        // ✅ FIXED: Move to actual end position, not calculated position
        currentPosition = actualEnd;
        
        // Log progress for large content
        if (chunkIndex > 0 && chunkIndex % 5 === 0) {
          console.log(`Created ${chunkIndex} glyphs... (${currentPosition}/${originalText.length} chars)`);
        }
      }
      
      // Update total chunks count in all chunks
      const finalTotalChunks = chunks.length;
      chunks.forEach((chunk, index) => {
        chunk.index = index;
        chunk.totalChunks = finalTotalChunks;
      });
      
      return chunks;
    } catch (error) {
      console.error('Error creating glyphs:', error);
      throw new Error('Failed to create glyphs: ' + error.message);
    }
  }
  
  /**
   * Split an oversized chunk into smaller pieces
   * @param {string} chunkText - Text that's too large
   * @param {number} originalIndex - Original chunk index
   * @param {BlockchainConfig} config - Configuration for chunking
   * @returns {Promise<GlyphChunk[]>} Array of smaller chunks
   */
  static async splitOversizedChunk(chunkText, originalIndex, config) {
    const smallerChunks = [];
    const smallerSize = Math.floor(config.targetChunkSize / 2);
    
    // ✅ FIXED: Use position tracking for oversized chunks too
    let position = 0;
    let subIndex = 0;
    
    while (position < chunkText.length) {
      const remainingLength = chunkText.length - position;
      const end = Math.min(position + smallerSize, chunkText.length);
      
      // For smaller chunks, don't worry about natural breaks to avoid infinite recursion
      const subChunkText = chunkText.slice(position, end);
      
      const compressedSubChunk = CompressionService.compress(subChunkText);
      const hash = await HashingService.hashContent(compressedSubChunk);
      
      smallerChunks.push({
        index: originalIndex + subIndex, // Will be updated later
        totalChunks: 0, // Will be updated later
        content: compressedSubChunk,
        hash: hash,
        originalText: subChunkText
      });
      
      position = end;
      subIndex++;
    }
    
    console.log(`Split oversized chunk into ${smallerChunks.length} smaller pieces`);
    return smallerChunks;
  }

    /**
     * Calculate story sequence number for chaining
     * This is a placeholder - in practice, this should be passed from the publishing service
     * @param {GlyphContent} content - Content object
     * @returns {number} Story sequence number
     */
    static calculateStorySequence(content) {
      // For now, use timestamp-based sequence
      // In full implementation, this should come from StoryHeaderService
      return content.storySequence || Math.floor(Date.now() / 1000);
    }
}

// Character count: 4327