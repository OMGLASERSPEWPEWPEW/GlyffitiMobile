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
      
      // Calculate how many chunks we'll need
      const totalChunks = Math.ceil(originalText.length / config.targetChunkSize);
      
      console.log(`Creating ${totalChunks} glyphs from ${originalText.length} characters`);
      
      // Split content into chunks and compress each chunk individually
      for (let i = 0; i < totalChunks; i++) {
        const start = i * config.targetChunkSize;
        const end = Math.min(start + config.targetChunkSize, originalText.length);
        
        // Extract chunk text content, finding natural breaking points
        let chunkText = originalText.slice(start, end);
        
        // If not the last chunk, try to break at natural points
        if (i < totalChunks - 1) {
          chunkText = TextProcessor.findNaturalBreakPoint(originalText, start, end);
        }
        
        // Compress this individual chunk
        const compressedChunk = CompressionService.compress(chunkText);
        
        // Get estimated size after base64 encoding
        const base64Size = Math.ceil(compressedChunk.length * 4 / 3);
        
        // Verify the chunk isn't too large after base64 encoding
        if (base64Size > config.maxMemoSize) {
          console.warn(`Chunk ${i} exceeds maximum size after base64 encoding: ${base64Size} bytes. Max: ${config.maxMemoSize}`);
          
          // Recursively split this chunk if too large
          const smallerChunks = await this.splitOversizedChunk(chunkText, i, totalChunks, config);
          chunks.push(...smallerChunks);
          
          // Adjust total chunks count and update remaining indices
          const additionalChunks = smallerChunks.length - 1;
          for (let j = i + 1; j < totalChunks; j++) {
            // Will need to update subsequent chunk indices
          }
          
          continue;
        }
        
        // Create hash for the chunk
        const hash = await HashingService.hashContent(compressedChunk);
        
        // Create chunk with hash
        chunks.push({
          index: i,
          totalChunks,
          content: compressedChunk,
          hash: hash,
          originalText: chunkText
        });
        
        // Log progress for large content
        if (totalChunks > 10 && (i + 1) % 5 === 0) {
          console.log(`Created ${i + 1}/${totalChunks} glyphs...`);
        }
      }
      
      // Update total chunks count in all chunks if we had splits
      const finalTotalChunks = chunks.length;
      if (finalTotalChunks !== totalChunks) {
        chunks.forEach((chunk, index) => {
          chunk.index = index;
          chunk.totalChunks = finalTotalChunks;
        });
      }
      
      console.log(`Successfully created ${chunks.length} glyphs`);
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
   * @param {number} totalChunks - Total chunks count
   * @param {BlockchainConfig} config - Configuration for chunking
   * @returns {Promise<GlyphChunk[]>} Array of smaller chunks
   */
  static async splitOversizedChunk(chunkText, originalIndex, totalChunks, config) {
    const smallerChunks = [];
    const smallerSize = Math.floor(config.targetChunkSize / 2);
    const subChunkCount = Math.ceil(chunkText.length / smallerSize);
    
    console.log(`Splitting oversized chunk into ${subChunkCount} smaller pieces`);
    
    for (let i = 0; i < subChunkCount; i++) {
      const start = i * smallerSize;
      const end = Math.min(start + smallerSize, chunkText.length);
      const subChunkText = chunkText.slice(start, end);
      
      const compressedSubChunk = CompressionService.compress(subChunkText);
      const hash = await HashingService.hashContent(compressedSubChunk);
      
      smallerChunks.push({
        index: originalIndex + i, // Will be updated later
        totalChunks: totalChunks, // Will be updated later
        content: compressedSubChunk,
        hash: hash,
        originalText: subChunkText
      });
    }
    
    return smallerChunks;
  }
}

// Character count: 4639