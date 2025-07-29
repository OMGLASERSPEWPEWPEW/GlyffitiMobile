// src/services/glyph/assembly/ContentAssembler.js
// Path: src/services/glyph/assembly/ContentAssembler.js
import { CompressionService } from '../../compression/CompressionService';
import { HashingService } from '../../hashing/HashingService';
import { TextProcessor } from '../processing/TextProcessor';

/**
 * Content Assembly - Handles content reassembly and decoding from blockchain
 * Extracted from GlyphService.js for better organization
 */
export class ContentAssembler {
  /**
   * Reassemble content from chunks with integrity verification
   * @param {GlyphChunk[]} chunks - Array of glyph chunks
   * @returns {Promise<string>} Reassembled text content
   */
  static async reassembleContent(chunks) {
    try {
      // Verify we have all chunks and they're valid
      chunks.sort((a, b) => a.index - b.index);
      
      // Check for missing chunks
      for (let i = 0; i < chunks.length; i++) {
        if (chunks[i].index !== i) {
          throw new Error(`Missing chunk at index ${i}`);
        }
      }
      
      const decompressedChunks = [];
      
      for (const chunk of chunks) {
        // Verify hash integrity
        const actualHash = await HashingService.hashContent(chunk.content);
        if (actualHash !== chunk.hash) {
          throw new Error(`Invalid hash for chunk ${chunk.index}. This may indicate tampered content.`);
        }
        
        // Decompress chunk
        const decompressedChunk = CompressionService.decompress(chunk.content);
        decompressedChunks.push(decompressedChunk);
      }
      
      // Combine and clean up the reassembled text
      const combinedText = decompressedChunks.join('');
      return TextProcessor.cleanupReassembledText(combinedText);
    } catch (error) {
      console.error('Error reassembling content:', error);
      throw new Error('Failed to reassemble content: ' + error.message);
    }
  }
  
  /**
   * Decode a base64-encoded compressed glyph from the blockchain
   * @param {string} base64Data - Base64 encoded compressed data
   * @returns {string} Decompressed text content
   */
  static decodeGlyphFromBlockchain(base64Data) {
    try {
      // Convert base64 string back to binary
      const binaryData = CompressionService.base64ToUint8Array(base64Data);
      
      // Decompress the binary data
      return CompressionService.decompress(binaryData);
    } catch (error) {
      console.error('Error decoding glyph from blockchain:', error);
      throw new Error('Failed to decode glyph data. The data may be corrupted or in an incorrect format.');
    }
  }
}

// Character count: 2092