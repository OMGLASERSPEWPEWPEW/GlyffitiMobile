// src/services/glyph/validation/GlyphValidator.js
// Path: src/services/glyph/validation/GlyphValidator.js
import { CompressionService } from '../../compression/CompressionService';
import { HashingService } from '../../hashing/HashingService';
import { TextProcessor } from '../processing/TextProcessor';
import { ChunkManager } from '../processing/ChunkManager';
import { ContentAssembler } from '../assembly/ContentAssembler';

/**
 * Glyph Validation - Handles integrity verification, previews, and testing
 * Extracted from GlyphService.js for better organization
 */
export class GlyphValidator {
  /**
   * Verify integrity of a glyph chunk
   * @param {GlyphChunk} glyph - Glyph to verify
   * @returns {Promise<boolean>} True if valid
   */
  static async verifyGlyphIntegrity(glyph) {
    try {
      // Verify hash matches content
      const actualHash = await HashingService.hashContent(glyph.content);
      if (actualHash !== glyph.hash) {
        console.error(`Hash mismatch for glyph ${glyph.index}`);
        return false;
      }
      
      // Verify chunk can be decompressed
      try {
        CompressionService.decompress(glyph.content);
      } catch (decompressionError) {
        console.error(`Decompression failed for glyph ${glyph.index}:`, decompressionError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error verifying glyph integrity:', error);
      return false;
    }
  }
  
  /**
   * Verify integrity of an entire scroll (all glyphs)
   * @param {GlyphChunk[]} glyphs - Array of glyphs to verify
   * @returns {Promise<boolean>} True if all glyphs are valid
   */
  static async verifyScrollIntegrity(glyphs) {
    try {
      console.log('Verifying scroll integrity...');
      
      // Check for missing or duplicate indices
      const indices = glyphs.map(g => g.index).sort((a, b) => a - b);
      for (let i = 0; i < indices.length; i++) {
        if (indices[i] !== i) {
          console.error(`Missing or duplicate glyph at index ${i}`);
          return false;
        }
      }
      
      // Verify each glyph individually
      for (const glyph of glyphs) {
        const isValid = await this.verifyGlyphIntegrity(glyph);
        if (!isValid) {
          return false;
        }
      }
      
      // Try to reassemble to ensure content coherence
      const reassembled = await ContentAssembler.reassembleContent(glyphs);
      console.log(`Scroll integrity verified. Reassembled ${reassembled.length} characters from ${glyphs.length} glyphs.`);
      
      console.log('Scroll integrity verification passed');
      return true;
    } catch (error) {
      console.error('Error verifying scroll integrity:', error);
      return false;
    }
  }
  
  /**
   * Create a preview of content showing chunking breakdown
   * @param {string} content - Content to preview
   * @param {BlockchainConfig} config - Configuration for chunking
   * @returns {Object} Preview information
   */
  static createChunkingPreview(content, config) {
    try {
      const processedContent = TextProcessor.preprocessText(content);
      const chunkSize = config.targetChunkSize;
      const totalChunks = Math.ceil(processedContent.length / chunkSize);
      
      const preview = {
        originalLength: content.length,
        processedLength: processedContent.length,
        chunkSize: chunkSize,
        totalChunks: totalChunks,
        chunks: []
      };
      
      // Create preview of first few chunks
      const previewCount = Math.min(5, totalChunks);
      for (let i = 0; i < previewCount; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, processedContent.length);
        const chunkText = processedContent.slice(start, end);
        
        preview.chunks.push({
          index: i,
          length: chunkText.length,
          preview: chunkText.substring(0, 100) + (chunkText.length > 100 ? '...' : ''),
          estimatedCompressedSize: CompressionService.estimateCompressedSize(chunkText)
        });
      }
      
      if (totalChunks > previewCount) {
        preview.chunks.push({
          index: '...',
          note: `And ${totalChunks - previewCount} more chunks`
        });
      }
      
      return preview;
    } catch (error) {
      console.error('Error creating chunking preview:', error);
      return {
        originalLength: 0,
        processedLength: 0,
        chunkSize: 0,
        totalChunks: 0,
        chunks: [],
        error: error.message
      };
    }
  }
  
  /**
   * Run self-test to verify GlyphManager functionality
   * @param {BlockchainConfig} config - Configuration for testing
   * @returns {Promise<boolean>} True if all tests pass
   */
  static async runSelfTest(config) {
    try {
      console.log('Running GlyphService self-test...');
      
      const testContent = {
        id: 'test_content',
        title: 'Test Content',
        content: 'This is a test string for the glyph manager. '.repeat(50) + 
                 'It should split into multiple chunks, compress them, and reassemble correctly. ' +
                 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20),
        authorPublicKey: 'test_author_key',
        timestamp: Date.now()
      };
      
      // Test chunking
      const chunks = await ChunkManager.createGlyphs(testContent, config);
      console.log(`Created ${chunks.length} chunks`);
      
      if (chunks.length === 0) {
        console.error('Self-test failed: No chunks created');
        return false;
      }
      
      // Test integrity verification
      for (const chunk of chunks) {
        const isValid = await this.verifyGlyphIntegrity(chunk);
        if (!isValid) {
          console.error(`Self-test failed: Chunk ${chunk.index} failed integrity check`);
          return false;
        }
      }
      
      // Test reassembly
      const reassembled = await ContentAssembler.reassembleContent(chunks);
      const originalProcessed = TextProcessor.preprocessText(testContent.content);
      
      if (reassembled !== originalProcessed) {
        console.error('Self-test failed: Reassembled content does not match original');
        console.log('Expected length:', originalProcessed.length);
        console.log('Actual length:', reassembled.length);
        return false;
      }
      
      // Test cost estimation (basic check)
      const estimatedChunkCount = TextProcessor.estimateChunkCount(testContent.content, config.targetChunkSize);
      if (estimatedChunkCount !== chunks.length) {
        console.error('Self-test failed: Cost estimation chunk count mismatch');
        return false;
      }
      
      console.log('GlyphService self-test passed!');
      console.log(`Processed ${testContent.content.length} chars into ${chunks.length} chunks`);
      
      return true;
    } catch (error) {
      console.error('Self-test failed with error:', error);
      return false;
    }
  }
}

// Character count: 5723