// src/services/glyph/GlyphService.js
// Path: src/services/glyph/GlyphService.js
import { CompressionService } from '../compression/CompressionService';
import { HashingService } from '../hashing/HashingService';
import { TextProcessor } from './processing/TextProcessor';
import { ChunkManager } from './processing/ChunkManager';
import { ContentAssembler } from './assembly/ContentAssembler';
import { GlyphValidator } from './validation/GlyphValidator';

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
export class GlyphService {
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
    return await ChunkManager.createGlyphs(content, this.config);
  }
  
  /**
   * Find natural breaking points in text to avoid splitting words/sentences
   * @param {string} text - Full text
   * @param {number} start - Start position
   * @param {number} end - End position
   * @returns {string} Text chunk with natural break
   */
  static findNaturalBreakPoint(text, start, end) {
    return TextProcessor.findNaturalBreakPoint(text, start, end);
  }
  
  /**
   * Split an oversized chunk into smaller pieces
   * @param {string} chunkText - Text that's too large
   * @param {number} originalIndex - Original chunk index
   * @param {number} totalChunks - Total chunks count
   * @returns {Promise<GlyphChunk[]>} Array of smaller chunks
   */
  static async splitOversizedChunk(chunkText, originalIndex, totalChunks) {
    return await ChunkManager.splitOversizedChunk(chunkText, originalIndex, totalChunks, this.config);
  }
  
  /**
   * Reassemble content from chunks with integrity verification
   * @param {GlyphChunk[]} chunks - Array of glyph chunks
   * @returns {Promise<string>} Reassembled text content
   */
  static async reassembleContent(chunks) {
    return await ContentAssembler.reassembleContent(chunks);
  }
  
  /**
   * Decode a base64-encoded compressed glyph from the blockchain
   * @param {string} base64Data - Base64 encoded compressed data
   * @returns {string} Decompressed text content
   */
  static decodeGlyphFromBlockchain(base64Data) {
    return ContentAssembler.decodeGlyphFromBlockchain(base64Data);
  }
  
  /**
   * Pre-process text for optimal chunking
   * @param {string} text - Raw text to process
   * @returns {string} Processed text
   */
  static preprocessText(text) {
    return TextProcessor.preprocessText(text);
  }
  
  /**
   * Clean up dialog breaks and formatting issues
   * @param {string} text - Text to clean
   * @returns {string} Cleaned text
   */
  static cleanDialogBreaks(text) {
    return TextProcessor.cleanDialogBreaks(text);
  }
  
  /**
   * Clean up reassembled text to fix any artifacts from chunking
   * @param {string} text - Reassembled text
   * @returns {string} Cleaned text
   */
  static cleanupReassembledText(text) {
    return TextProcessor.cleanupReassembledText(text);
  }
  
  /**
   * Estimate the number of chunks a piece of content will require
   * @param {string} content - Content to estimate
   * @returns {number} Estimated chunk count
   */
  static estimateChunkCount(content) {
    return TextProcessor.estimateChunkCount(content, this.config.targetChunkSize);
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
        compressionRatio: 0,
        spaceSaved: 0,
        costs: {
          storage: 0,
          transactions: 0,
          total: 0,
          currency: 'SOL'
        },
        error: error.message
      };
    }
  }
  
  /**
   * Verify integrity of a glyph chunk
   * @param {GlyphChunk} glyph - Glyph to verify
   * @returns {Promise<boolean>} True if valid
   */
  static async verifyGlyphIntegrity(glyph) {
    return await GlyphValidator.verifyGlyphIntegrity(glyph);
  }
  
  /**
   * Verify integrity of an entire scroll (all glyphs)
   * @param {GlyphChunk[]} glyphs - Array of glyphs to verify
   * @returns {Promise<boolean>} True if all glyphs are valid
   */
  static async verifyScrollIntegrity(glyphs) {
    return await GlyphValidator.verifyScrollIntegrity(glyphs);
  }
  
  /**
   * Create a preview of content showing chunking breakdown
   * @param {string} content - Content to preview
   * @returns {Object} Preview information
   */
  static createChunkingPreview(content) {
    return GlyphValidator.createChunkingPreview(content, this.config);
  }
  
  /**
   * Run self-test to verify GlyphManager functionality
   * @returns {Promise<boolean>} True if all tests pass
   */
  static async runSelfTest() {
    return await GlyphValidator.runSelfTest(this.config);
  }
}

// Character count: 7806