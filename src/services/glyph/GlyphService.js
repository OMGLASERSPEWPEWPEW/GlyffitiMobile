// src/services/glyph/GlyphService.js
// Path: src/services/glyph/GlyphService.js
import { CompressionService } from '../compression/CompressionService';
import { HashingService } from '../hashing/HashingService';

/**
 * @typedef {Object} GlyphChunk
 * @property {number} index - Position in sequence
 * @property {number} totalChunks - Total number of chunks
 * @property {string} content - Base64-encoded compressed content
 * @property {string} hash - Content hash for verification
 * @property {string} [originalText] - Original text before compression
 */

/**
 * @typedef {Object} GlyphContent
 * @property {string} id - Unique content identifier
 * @property {string} title - Content title
 * @property {string} content - Text content
 * @property {string} authorPublicKey - Author's public key
 * @property {number} timestamp - Creation timestamp
 * @property {GlyphChunk[]} [chunks] - Generated chunks
 */

/**
 * @typedef {Object} BlockchainConfig
 * @property {number} maxMemoSize - Maximum size in bytes for memo field
 * @property {number} maxCompressedSize - Maximum size after compression
 * @property {number} targetChunkSize - Target size for text chunks before compression
 * @property {string} networkName - Network name (e.g., "solana", "bitcoin")
 */

// Default configurations for different blockchains
const BLOCKCHAIN_CONFIGS = {
  solana: {
    maxMemoSize: 1200,      // Solana memo program safe payload window
    maxCompressedSize: 2000,
    targetChunkSize: 900,   // pre-compression text size target to keep base64 within memo size
    networkName: 'solana',
  },
  // Other networks could be added later if desired
};

export class GlyphService {
  static config = {
    ...BLOCKCHAIN_CONFIGS.solana
  };

  /**
   * Normalize / preprocess text prior to chunking.
   */
  static preprocessText(text) {
    if (!text) return '';
    // Normalize line endings and trim excess whitespace
    const normalized = text.replace(/\r\n/g, '\n');
    // Optionally collapse multiple blank lines, trim trailing spaces, etc.
    return normalized;
  }

  /**
   * Create compressed glyph chunks from content.
   * Returns an array where each chunk's `content` is base64 string.
   */
  static async createGlyphs(content) {
    try {
      const chunks = [];
      let originalText = content.content;
      
      // Pre-process text to ensure optimal chunking
      originalText = this.preprocessText(originalText);
      
      // Calculate how many chunks we'll need
      const totalChunks = Math.ceil(originalText.length / this.config.targetChunkSize);
      
      console.log(`Creating ${totalChunks} glyphs from ${originalText.length} characters`);
      
      // Split content into chunks and compress each chunk individually
      for (let i = 0; i < totalChunks; i++) {
        const start = i * this.config.targetChunkSize;
        const end = Math.min(start + this.config.targetChunkSize, originalText.length);
        
        // Extract chunk text content, finding natural breaking points
        let chunkText = originalText.slice(start, end);
        
        // If not the last chunk, try to break at natural points
        if (i < totalChunks - 1) {
          chunkText = this.findNaturalBreakPoint(originalText, start, end);
        }
        
        // Compress this individual chunk
        const compressedChunk = CompressionService.compress(chunkText);
        const base64Chunk = CompressionService.uint8ArrayToBase64(compressedChunk);
        
        // Get estimated size after base64 encoding (from bytes length)
        const base64Size = Math.ceil(compressedChunk.length * 4 / 3);
        
        // Verify the chunk isn't too large after base64 encoding
        if (base64Size > this.config.maxMemoSize) {
          console.warn(
            `Chunk ${i} exceeds maximum size after base64 encoding: ${base64Size} bytes. Max: ${this.config.maxMemoSize}`
          );
          
          // Recursively split this chunk if too large
          const smallerChunks = await this.splitOversizedChunk(chunkText, i, totalChunks);
          chunks.push(...smallerChunks);
          
          // Adjust total chunks count and update remaining indices later
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
          content: base64Chunk,   // ✅ store base64
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
   * Find natural breaking points in text to avoid splitting words/sentences
   */
  static findNaturalBreakPoint(text, start, end) {
    const originalChunk = text.slice(start, end);
    
    // Try to break at sentence boundaries first
    const sentenceBreak = originalChunk.lastIndexOf('. ');
    if (sentenceBreak > 0 && sentenceBreak > originalChunk.length * 0.6) {
      return originalChunk.slice(0, sentenceBreak + 1);
    }
    
    // Try to break at commas or semicolons
    const commaBreak = originalChunk.lastIndexOf(', ');
    if (commaBreak > 0 && commaBreak > originalChunk.length * 0.6) {
      return originalChunk.slice(0, commaBreak + 1);
    }
    
    // Try to break at word boundaries (space)
    const spaceBreak = originalChunk.lastIndexOf(' ');
    if (spaceBreak > 0 && spaceBreak > originalChunk.length * 0.6) {
      return originalChunk.slice(0, spaceBreak);
    }
    
    // No natural break found, return original chunk
    return originalChunk;
  }
  
  /**
   * Split an oversized chunk into smaller pieces
   * @param {string} chunkText - Text that's too large
   * @param {number} originalIndex - Original chunk index
   * @param {number} totalChunks - Total chunks count
   * @returns {Promise<GlyphChunk[]>} Array of smaller chunks
   */
  static async splitOversizedChunk(chunkText, originalIndex, totalChunks) {
    const smallerChunks = [];
    const smallerSize = Math.floor(this.config.targetChunkSize / 2);
    
    console.log(`Splitting oversized chunk into ${Math.ceil(chunkText.length / smallerSize)} smaller pieces`);
    
    for (let i = 0; i < Math.ceil(chunkText.length / smallerSize); i++) {
      const start = i * smallerSize;
      const end = Math.min(start + smallerSize, chunkText.length);
      const subChunkText = chunkText.slice(start, end);
      
      const compressedSubChunk = CompressionService.compress(subChunkText);
      const base64SubChunk = CompressionService.uint8ArrayToBase64(compressedSubChunk);
      const hash = await HashingService.hashContent(compressedSubChunk);
      
      smallerChunks.push({
        index: originalIndex + i, // Will be updated later
        totalChunks: totalChunks,  // Will be updated later
        content: base64SubChunk,   // ✅ store base64
        hash: hash,
        originalText: subChunkText
      });
    }
    
    return smallerChunks;
  }

  /**
   * Create a preview of chunking & compression results (kept as-is)
   */
  static async previewChunking(content) {
    try {
      const processedContent = this.preprocessText(content);
      const chunkSize = this.config.targetChunkSize;
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
      console.error('Error generating preview:', error);
      throw new Error('Failed to generate preview: ' + error.message);
    }
  }

    /**
   * Run self-test to verify GlyphService functionality
   * @returns {Promise<boolean>} True if all tests pass
   */
  static async runSelfTest() {
    try {
      console.log('Running GlyphService self-test...');
      
      const testContent = {
        id: 'test_content',
        title: 'Test Content',
        content: 'This is a test string for the glyph service. '.repeat(50) + 
                 'It should split into multiple chunks, compress them, and reassemble correctly. ' +
                 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20),
        authorPublicKey: 'test_author_key',
        timestamp: Date.now()
      };
      
      // Test chunking
      const chunks = await this.createGlyphs(testContent);
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
      const reassembled = await this.reassembleContent(chunks);
      const originalProcessed = this.preprocessText(testContent.content);
      
      if (reassembled !== originalProcessed) {
        console.error('Self-test failed: Reassembled content does not match original');
        console.log('Expected length:', originalProcessed.length);
        console.log('Actual length:', reassembled.length);
        return false;
      }
      
      // Test cost estimation
      const costEstimate = this.estimateStorageCost(testContent.content);
      if (costEstimate.chunkCount !== chunks.length) {
        console.error('Self-test failed: Cost estimation chunk count mismatch');
        return false;
      }
      
      console.log('✅ GlyphService self-test passed!');
      console.log(`Processed ${testContent.content.length} chars into ${chunks.length} chunks`);
      console.log(`Compression ratio: ${costEstimate.compressionRatio}`);
      console.log(`Estimated cost: ${costEstimate.costs.total} ${costEstimate.costs.currency}`);
      
      return true;
    } catch (error) {
      console.error('Self-test failed with error:', error);
      return false;
    }
  }
}

 

// Character count: 21170

  


// Character count: 15962