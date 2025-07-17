// src/services/publishing/MobileGlyphManager.js
import { CompressionService } from '../compression/CompressionService';
import { HashingService } from '../hashing/HashingService';

/**
 * @typedef {Object} GlyphChunk
 * @property {number} index - Position in sequence
 * @property {number} totalChunks - Total number of chunks
 * @property {Uint8Array} content - Compressed content data
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
    maxMemoSize: 1200,      // Solana memo program has generous limits
    maxCompressedSize: 900, // Conservative limit to account for base64 encoding overhead
    targetChunkSize: 250,   // Characters per chunk before compression
    networkName: "solana"
  },
  bitcoin: {
    maxMemoSize: 80,        // Bitcoin OP_RETURN is limited
    maxCompressedSize: 70,  // Conservative limit
    targetChunkSize: 35,    // Much smaller for Bitcoin
    networkName: "bitcoin"
  }
};

/**
 * Enhanced GlyphManager handles the conversion of content into blockchain-storable chunks (glyphs)
 * with better chunking algorithms, compression, and integrity checking
 */
export class MobileGlyphManager {
  static config = BLOCKCHAIN_CONFIGS.solana;
  
  /**
   * Configure the GlyphManager for a specific blockchain
   * @param {string} blockchain - Blockchain name ('solana', 'bitcoin')
   */
  static configure(blockchain) {
    if (BLOCKCHAIN_CONFIGS[blockchain]) {
      this.config = BLOCKCHAIN_CONFIGS[blockchain];
      console.log(`GlyphManager configured for ${blockchain}`);
    } else {
      console.warn(`Unknown blockchain "${blockchain}". Using Solana defaults.`);
      this.config = BLOCKCHAIN_CONFIGS.solana;
    }
  }
  
  /**
   * Get current configuration
   * @returns {BlockchainConfig} Copy of current config
   */
  static getConfig() {
    return { ...this.config };
  }
  
  /**
   * Split content into chunks (glyphs) with appropriate size and compression
   * @param {GlyphContent} content - Content to split into glyphs
   * @returns {Promise<GlyphChunk[]>} Array of glyph chunks
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
        
        // Get estimated size after base64 encoding
        const base64Size = Math.ceil(compressedChunk.length * 4 / 3);
        
        // Verify the chunk isn't too large after base64 encoding
        if (base64Size > this.config.maxMemoSize) {
          console.warn(`Chunk ${i} exceeds maximum size after base64 encoding: ${base64Size} bytes. Max: ${this.config.maxMemoSize}`);
          
          // Recursively split this chunk if too large
          const smallerChunks = await this.splitOversizedChunk(chunkText, i, totalChunks);
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
   * Find natural breaking points in text to avoid splitting words/sentences
   * @param {string} text - Full text
   * @param {number} start - Start position
   * @param {number} end - End position
   * @returns {string} Text chunk with natural break
   */
  static findNaturalBreakPoint(text, start, end) {
    const originalChunk = text.slice(start, end);
    
    // If we're at the end of text, return as-is
    if (end >= text.length) {
      return originalChunk;
    }
    
    // Look for natural breaking points within the last 100 characters
    const searchStart = Math.max(start, end - 100);
    const searchText = text.slice(searchStart, end);
    
    // Priority order: paragraph break, sentence break, word break
    const paragraphBreak = searchText.lastIndexOf('\n\n');
    if (paragraphBreak !== -1) {
      const breakPoint = searchStart + paragraphBreak + 2;
      return text.slice(start, breakPoint);
    }
    
    const sentenceBreak = searchText.lastIndexOf('. ');
    if (sentenceBreak !== -1) {
      const breakPoint = searchStart + sentenceBreak + 2;
      return text.slice(start, breakPoint);
    }
    
    const wordBreak = searchText.lastIndexOf(' ');
    if (wordBreak !== -1) {
      const breakPoint = searchStart + wordBreak + 1;
      return text.slice(start, breakPoint);
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
      return this.cleanupReassembledText(combinedText);
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
  
  /**
   * Pre-process text for optimal chunking
   * @param {string} text - Raw text to process
   * @returns {string} Processed text
   */
  static preprocessText(text) {
    if (typeof text !== 'string') {
      throw new Error('Text must be a string');
    }
    
    // Apply dialog formatting cleanup
    text = this.cleanDialogBreaks(text);
    
    // Normalize line endings
    text = text.replace(/\r\n/g, '\n');
    
    // Remove excessive whitespace but preserve intentional formatting
    text = text.replace(/[ \t]+/g, ' '); // Multiple spaces/tabs to single space
    text = text.replace(/\n[ \t]+/g, '\n'); // Remove leading whitespace on lines
    text = text.replace(/[ \t]+\n/g, '\n'); // Remove trailing whitespace on lines
    
    // Normalize paragraph breaks (max 2 consecutive newlines)
    text = text.replace(/\n{3,}/g, '\n\n');
    
    // Trim overall
    text = text.trim();
    
    return text;
  }
  
  /**
   * Clean up dialog breaks and formatting issues
   * @param {string} text - Text to clean
   * @returns {string} Cleaned text
   */
  static cleanDialogBreaks(text) {
    // Remove awkward breaks in dialog
    text = text.replace(/"\s*\n\s*([a-z])/g, ' $1');
    
    // Fix broken quotes
    text = text.replace(/"\s+"/g, '" "');
    
    // Ensure proper spacing around dialog
    text = text.replace(/([.!?])\s*"\s*([A-Z])/g, '$1" $2');
    
    return text;
  }
  
  /**
   * Clean up reassembled text to fix any artifacts from chunking
   * @param {string} text - Reassembled text
   * @returns {string} Cleaned text
   */
  static cleanupReassembledText(text) {
    // Remove any duplicate spaces that might have been introduced
    text = text.replace(/\s+/g, ' ');
    
    // Fix any broken paragraph formatting
    text = text.replace(/\n{3,}/g, '\n\n');
    
    // Trim
    text = text.trim();
    
    return text;
  }
  
  /**
   * Estimate the number of chunks a piece of content will require
   * @param {string} content - Content to estimate
   * @returns {number} Estimated chunk count
   */
  static estimateChunkCount(content) {
    const processedContent = this.preprocessText(content);
    return Math.ceil(processedContent.length / this.config.targetChunkSize);
  }
  
  /**
   * Calculate the estimated storage cost based on content size
   * @param {string} content - Content to analyze
   * @returns {Object} Cost estimation details
   */
  static estimateStorageCost(content) {
    try {
      const processedContent = this.preprocessText(content);
      const chunkCount = Math.ceil(processedContent.length / this.config.targetChunkSize);
      
      // Get compression stats for better estimation
      const compressionStats = CompressionService.getCompressionStats(processedContent);
      
      // Estimate bytes after compression and base64 encoding
      const estimatedCompressedSize = compressionStats.compressedSize;
      const base64Overhead = 1.33; // Base64 increases size by ~33%
      const estimatedBytes = Math.ceil(estimatedCompressedSize * base64Overhead);
      
      // Cost estimates by blockchain type (in native currency)
      let costPerByte = 0.000000001; // Default value in SOL
      let costPerTransaction = 0.000005; // Base transaction cost
      
      if (this.config.networkName === "bitcoin") {
        costPerByte = 0.00000005; // Higher for Bitcoin (example value)
        costPerTransaction = 0.0001;
      }
      
      const storageCost = estimatedBytes * costPerByte;
      const transactionCost = chunkCount * costPerTransaction;
      const totalCost = storageCost + transactionCost;
      
      return {
        chunkCount,
        originalSize: processedContent.length,
        estimatedCompressedSize,
        estimatedBytes,
        compressionRatio: compressionStats.compressionRatio,
        spaceSaved: compressionStats.percentSaved,
        costs: {
          storage: storageCost,
          transactions: transactionCost,
          total: totalCost,
          currency: this.config.networkName === 'bitcoin' ? 'BTC' : 'SOL'
        }
      };
    } catch (error) {
      console.error('Error estimating storage cost:', error);
      return {
        chunkCount: 0,
        originalSize: 0,
        estimatedCompressedSize: 0,
        estimatedBytes: 0,
        compressionRatio: 1,
        spaceSaved: 0,
        costs: {
          storage: 0,
          transactions: 0,
          total: 0,
          currency: 'SOL'
        }
      };
    }
  }
  
  /**
   * Verify if a glyph's hash is valid (anti-spoofing protection)
   * @param {GlyphChunk} chunk - Chunk to verify
   * @returns {Promise<boolean>} True if hash is valid
   */
  static async verifyGlyphIntegrity(chunk) {
    try {
      const actualHash = await HashingService.hashContent(chunk.content);
      return actualHash === chunk.hash;
    } catch (error) {
      console.error('Error verifying glyph integrity:', error);
      return false;
    }
  }
  
  /**
   * Verify the entire scroll integrity - ensures all glyphs are original
   * @param {Object} manifest - Scroll manifest with chunk info
   * @param {GlyphChunk[]} chunks - Array of actual chunks
   * @returns {Promise<boolean>} True if all chunks are valid
   */
  static async verifyScrollIntegrity(manifest, chunks) {
    try {
      // First check if we have all the chunks
      if (chunks.length !== manifest.totalChunks) {
        console.error('Scroll integrity check failed: Missing chunks');
        return false;
      }
      
      // Create a map of chunks by index
      const chunksMap = new Map();
      chunks.forEach(chunk => chunksMap.set(chunk.index, chunk));
      
      // Verify each chunk in the manifest
      for (const manifestChunk of manifest.chunks) {
        const chunk = chunksMap.get(manifestChunk.index);
        
        if (!chunk) {
          console.error(`Scroll integrity check failed: Missing chunk at index ${manifestChunk.index}`);
          return false;
        }
        
        // Verify the hash matches
        if (chunk.hash !== manifestChunk.hash) {
          console.error(`Scroll integrity check failed: Hash mismatch at index ${manifestChunk.index}`);
          return false;
        }
        
        // Verify the content hash is valid
        const isValid = await this.verifyGlyphIntegrity(chunk);
        if (!isValid) {
          console.error(`Scroll integrity check failed: Content integrity issue at index ${manifestChunk.index}`);
          return false;
        }
      }
      
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
   * @returns {Object} Preview information
   */
  static createChunkingPreview(content) {
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
   * @returns {Promise<boolean>} True if all tests pass
   */
  static async runSelfTest() {
    try {
      console.log('Running MobileGlyphManager self-test...');
      
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
      
      console.log('MobileGlyphManager self-test passed!');
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

// Character count: 15847