// src/services/glyph/processing/ChunkManager-M.js
// Path: src/services/glyph/processing/ChunkManager-M.js

import { TextProcessor } from './TextProcessor';
import StoryManifest from '../../blockchain/shared/models/StoryManifest';
import MerkleBuilderM from '../../merkle/MerkleBuilder-M';
import { HashingService } from '../../hashing/HashingService';

// Maximum characters per content chunk for optimal blockchain storage
const MAX_CHUNK_SIZE = 280;

// Maximum hashes per hash list chunk (7 hashes * 64 chars = 448 chars, safe for 566 byte limit)
const MAX_HASHES_PER_CHUNK = 5;

/**
 * 3-Tier Manifest Tree Content Manager
 * 
 * Implements the scalable 3-tier architecture:
 * Tier 1: Primary Manifest (single manifestRoot hash)
 * Tier 2: Hash List Chunks (arrays of content chunk hashes)  
 * Tier 3: Content Glyphs (actual story content)
 * 
 * Based on ADR-003: Manifest-Based Publishing Architecture (3-Tier Enhancement)
 */
class ChunkManagerM {
  /**
   * Prepares raw content for 3-tier manifest publishing by chunking content,
   * building a manifest tree from chunk hashes, and creating the complete
   * publication package with all three tiers.
   * 
   * @param {string} content - The raw text content to be published
   * @param {string} title - Story title for the manifest
   * @param {string} authorPublicKey - Author's public key
   * @param {Object} options - Additional publishing options
   * @param {string[]} options.tags - Content tags for discovery
   * @param {string} options.genre - Content genre
   * @param {number|null} options.reGlyphCap - Maximum re-glyph count
   * @param {boolean} options.isNSFW - NSFW content flag
   * @returns {Promise<Object>} 3-tier publication package
   */
  static async prepareStoryForManifestPublishing(content, title, authorPublicKey, options = {}) {
    console.log('ChunkManager-M.js: prepareStoryForManifestPublishing: Starting 3-tier preparation');
    console.log('ChunkManager-M.js: prepareStoryForManifestPublishing: Content length:', content.length, 'characters');
    
    // Validate required inputs
    if (!content || content.trim().length === 0) {
      throw new Error('Content is required and cannot be empty');
    }
    
    if (!title || title.trim().length === 0) {
      throw new Error('Title is required for story manifest');
    }
    
    if (!authorPublicKey || authorPublicKey.trim().length === 0) {
      throw new Error('Author public key is required for story manifest');
    }

    // === TIER 3: Process and chunk the content ===
    const contentChunks = this._chunkContentForManifest(content);
    console.log('ChunkManager-M.js: prepareStoryForManifestPublishing: Created', contentChunks.length, 'content chunks');

    // === TIER 2: Create hash list from content chunks ===
    console.log('ChunkManager-M.js: prepareStoryForManifestPublishing: Computing chunk hashes');
    const contentChunkHashes = await Promise.all(
      contentChunks.map(async (chunk, index) => {
        const hash = await HashingService.hashContent(chunk);
        console.log('ChunkManager-M.js: prepareStoryForManifestPublishing: Chunk', index, 'hash:', hash.substring(0, 16) + '...');
        return hash;
      })
    );

    // Build Merkle tree from chunk hashes to get manifest root
    console.log('ChunkManager-M.js: prepareStoryForManifestPublishing: Building manifest tree from', contentChunkHashes.length, 'chunk hashes');
    const manifestTree = await MerkleBuilderM.buildTree(contentChunkHashes);
    const manifestRoot = manifestTree.root;
    console.log('ChunkManager-M.js: prepareStoryForManifestPublishing: Manifest root:', manifestRoot.substring(0, 16) + '...');

    // Chunk the hash list for blockchain storage
    const hashListChunks = this._chunkHashList(contentChunkHashes);
    console.log('ChunkManager-M.js: prepareStoryForManifestPublishing: Created', hashListChunks.length, 'hash list chunks');

    // === TIER 1: Create the primary manifest ===
    const manifest = StoryManifest.fromManifestTree(
      title.trim(),
      authorPublicKey.trim(),
      manifestRoot,
      contentChunks.length,
      hashListChunks.length,
      content.length,
      {
        tags: options.tags || [],
        genre: options.genre || null,
        reGlyphCap: options.reGlyphCap || null,
        firstChunk: contentChunks[0], // For preview text generation
        metadata: {
          isNSFW: options.isNSFW || false,
          license: options.license || 'CC0'
        }
      }
    );

    // Validate the manifest
    const validation = manifest.validate();
    if (!validation.isValid) {
      console.error('ChunkManager-M.js: prepareStoryForManifestPublishing: Manifest validation failed:', validation.errors);
      throw new Error(`Manifest validation failed: ${validation.errors.join(', ')}`);
    }

    // === Prepare the complete 3-tier publication package ===
    const publicationPackage = {
      primaryManifest: manifest,
      hashListChunks: hashListChunks,
      contentChunks: contentChunks,
      manifestTree: manifestTree, // Include tree for verification purposes
      summary: {
        title: manifest.title,
        author: manifest.authorPublicKey,
        totalContentChunks: manifest.totalContentChunks,
        totalHashListChunks: manifest.totalHashListChunks,
        contentLength: manifest.contentLength,
        estimatedReadTime: manifest.estimatedReadTime,
        manifestRoot: manifestRoot,
        manifestHash: await manifest.getManifestHash()
      }
    };

    console.log('ChunkManager-M.js: prepareStoryForManifestPublishing: 3-tier publication package prepared successfully');
    console.log('ChunkManager-M.js: prepareStoryForManifestPublishing: Manifest root:', manifestRoot.substring(0, 16) + '...');
    console.log('ChunkManager-M.js: prepareStoryForManifestPublishing: Hash list chunks:', hashListChunks.length);
    console.log('ChunkManager-M.js: prepareStoryForManifestPublishing: Content chunks:', contentChunks.length);
    
    return publicationPackage;
  }

  /**
   * Chunk content into optimal sizes for blockchain storage
   * @param {string} content - Raw content to chunk
   * @returns {string[]} Array of content chunks
   * @private
   */
  static _chunkContentForManifest(content) {
    console.log('ChunkManager-M.js: _chunkContentForManifest: Chunking content');
    
    // Pre-process the content to normalize whitespace and formatting
    const processedContent = TextProcessor.preprocessText(content);
    
    const chunks = [];
    let currentPosition = 0;
    
    while (currentPosition < processedContent.length) {
      const remainingLength = processedContent.length - currentPosition;
      
      // If remaining content is small, take it all
      if (remainingLength <= MAX_CHUNK_SIZE) {
        const finalChunk = processedContent.slice(currentPosition);
        if (finalChunk.trim().length > 0) {
          chunks.push(finalChunk);
        }
        break;
      }
      
      // Find optimal chunk boundary
      const targetEnd = currentPosition + MAX_CHUNK_SIZE;
      const chunk = TextProcessor.findNaturalBreakPoint(processedContent, currentPosition, targetEnd);
      
      if (chunk.trim().length > 0) {
        chunks.push(chunk);
      }
      
      currentPosition += chunk.length;
      
      // Safety check to prevent infinite loops
      if (chunk.length === 0) {
        console.warn('ChunkManager-M.js: _chunkContentForManifest: Zero-length chunk detected, forcing advancement');
        currentPosition = Math.min(currentPosition + 1, processedContent.length);
      }
    }
    
    console.log('ChunkManager-M.js: _chunkContentForManifest: Created', chunks.length, 'chunks');
    return chunks;
  }

  /**
   * Chunk hash list into blockchain-compatible chunks
   * @param {string[]} hashList - Array of SHA-256 hashes
   * @returns {string[][]} Array of hash list chunks
   * @private
   */
  static _chunkHashList(hashList) {
    console.log('ChunkManager-M.js: _chunkHashList: Chunking', hashList.length, 'hashes into safe memo sizes');
    
    const hashListChunks = [];
    
    for (let i = 0; i < hashList.length; i += MAX_HASHES_PER_CHUNK) {
      const chunk = hashList.slice(i, i + MAX_HASHES_PER_CHUNK);
      hashListChunks.push(chunk);
      console.log('ChunkManager-M.js: _chunkHashList: Hash list chunk', hashListChunks.length - 1, 'contains', chunk.length, 'hashes');
    }
    
    console.log('ChunkManager-M.js: _chunkHashList: Created', hashListChunks.length, 'hash list chunks');
    return hashListChunks;
  }

  /**
   * Verify content chunks against a manifest tree
   * @param {string[]} contentChunks - Array of content chunks
   * @param {string[][]} hashListChunks - Array of hash list chunks from blockchain
   * @param {string} manifestRoot - Expected manifest root hash
   * @returns {Promise<Object>} Verification result with details
   */
  static async verifyManifestTree(contentChunks, hashListChunks, manifestRoot) {
    console.log('ChunkManager-M.js: verifyManifestTree: Verifying 3-tier manifest tree');
    console.log('ChunkManager-M.js: verifyManifestTree: Content chunks:', contentChunks.length);
    console.log('ChunkManager-M.js: verifyManifestTree: Hash list chunks:', hashListChunks.length);
    
    try {
      // Step 1: Reconstruct full hash list from chunks
      const reconstructedHashList = hashListChunks.flat();
      console.log('ChunkManager-M.js: verifyManifestTree: Reconstructed', reconstructedHashList.length, 'hashes');
      
      // Step 2: Verify content chunks match the hash list
      if (contentChunks.length !== reconstructedHashList.length) {
        return {
          isValid: false,
          error: `Chunk count mismatch: expected ${reconstructedHashList.length}, got ${contentChunks.length}`,
          stage: 'content_verification'
        };
      }
      
      const mismatchedIndices = [];
      for (let i = 0; i < contentChunks.length; i++) {
        const expectedHash = reconstructedHashList[i];
        const actualHash = await HashingService.hashContent(contentChunks[i]);
        
        if (actualHash !== expectedHash) {
          console.warn('ChunkManager-M.js: verifyManifestTree: Content hash mismatch at index', i);
          mismatchedIndices.push(i);
        }
      }
      
      if (mismatchedIndices.length > 0) {
        return {
          isValid: false,
          error: `Content verification failed for ${mismatchedIndices.length} chunks`,
          stage: 'content_verification',
          mismatchedIndices
        };
      }
      
      // Step 3: Verify manifest tree root
      const manifestTree = await MerkleBuilderM.buildTree(reconstructedHashList);
      const calculatedRoot = manifestTree.root;
      
      if (calculatedRoot !== manifestRoot) {
        return {
          isValid: false,
          error: `Manifest root mismatch: expected ${manifestRoot.substring(0, 16)}..., got ${calculatedRoot.substring(0, 16)}...`,
          stage: 'manifest_verification'
        };
      }
      
      console.log('ChunkManager-M.js: verifyManifestTree: All verifications passed');
      return {
        isValid: true,
        stage: 'complete',
        verifiedChunks: contentChunks.length,
        manifestRoot: calculatedRoot
      };
      
    } catch (error) {
      console.error('ChunkManager-M.js: verifyManifestTree: Verification error:', error);
      return {
        isValid: false,
        error: `Verification failed: ${error.message}`,
        stage: 'error'
      };
    }
  }

  /**
   * Calculate optimal chunk size based on content characteristics
   * @param {string} content - Content to analyze
   * @returns {number} Recommended chunk size
   */
  static calculateOptimalChunkSize(content) {
    console.log('ChunkManager-M.js: calculateOptimalChunkSize: Analyzing content for optimal chunking');
    
    // Analyze content density and structure
    const averageWordLength = content.split(/\s+/).reduce((sum, word) => sum + word.length, 0) / content.split(/\s+/).length;
    const paragraphCount = content.split(/\n\s*\n/).length;
    const sentenceCount = content.split(/[.!?]+/).length;
    
    console.log('ChunkManager-M.js: calculateOptimalChunkSize: Avg word length:', averageWordLength.toFixed(1));
    console.log('ChunkManager-M.js: calculateOptimalChunkSize: Paragraphs:', paragraphCount);
    console.log('ChunkManager-M.js: calculateOptimalChunkSize: Sentences:', sentenceCount);
    
    // Adjust chunk size based on content characteristics
    let optimalSize = MAX_CHUNK_SIZE;
    
    // Shorter chunks for dense technical content
    if (averageWordLength > 8) {
      optimalSize = Math.floor(MAX_CHUNK_SIZE * 0.8);
    }
    
    // Slightly longer chunks for conversational content
    if (averageWordLength < 5) {
      optimalSize = Math.floor(MAX_CHUNK_SIZE * 1.1);
    }
    
    console.log('ChunkManager-M.js: calculateOptimalChunkSize: Recommended size:', optimalSize);
    return Math.min(optimalSize, MAX_CHUNK_SIZE); // Never exceed maximum
  }

  /**
   * Get statistics about the 3-tier publication package
   * @param {Object} publicationPackage - The 3-tier package
   * @returns {Object} Comprehensive statistics
   */
  static getPublicationStatistics(publicationPackage) {
    console.log('ChunkManager-M.js: getPublicationStatistics: Analyzing 3-tier package statistics');
    
    const { primaryManifest, hashListChunks, contentChunks } = publicationPackage;
    
    // Content chunk analysis
    const contentSizes = contentChunks.map(chunk => chunk.length);
    const totalContentSize = contentSizes.reduce((sum, size) => sum + size, 0);
    
    // Hash list analysis
    const hashListSizes = hashListChunks.map(chunk => chunk.length);
    const totalHashes = hashListSizes.reduce((sum, size) => sum + size, 0);
    
    // Transaction cost estimation
    const totalTransactions = 1 + hashListChunks.length + contentChunks.length; // manifest + hash lists + content
    
    const stats = {
      // Tier breakdown
      primaryManifest: {
        transactions: 1,
        manifestRoot: primaryManifest.manifestRoot.substring(0, 16) + '...'
      },
      hashLists: {
        transactions: hashListChunks.length,
        totalHashes: totalHashes,
        averageHashesPerChunk: Math.round(totalHashes / hashListChunks.length),
        maxHashesPerChunk: Math.max(...hashListSizes),
        minHashesPerChunk: Math.min(...hashListSizes)
      },
      content: {
        transactions: contentChunks.length,
        totalCharacters: totalContentSize,
        averageChunkSize: Math.round(totalContentSize / contentChunks.length),
        maxChunkSize: Math.max(...contentSizes),
        minChunkSize: Math.min(...contentSizes)
      },
      // Overall metrics
      total: {
        transactions: totalTransactions,
        estimatedCostSOL: totalTransactions * 0.000005,
        estimatedPublishTimeSeconds: totalTransactions * 1.5, // Faster with concurrency
        memoryEfficiency: `${Math.round((totalContentSize / (totalContentSize + totalHashes * 64)) * 100)}%`
      }
    };
    
    console.log('ChunkManager-M.js: getPublicationStatistics: Statistics calculated');
    console.log('ChunkManager-M.js: getPublicationStatistics: Total transactions:', stats.total.transactions);
    
    return stats;
  }

  /**
   * Reconstruct original content from chunks in correct order
   * @param {string[]} chunks - Array of content chunks in order
   * @returns {string} Reconstructed content
   */
  static reconstructContent(chunks) {
    console.log('ChunkManager-M.js: reconstructContent: Reconstructing content from', chunks.length, 'chunks');
    
    if (!chunks || chunks.length === 0) {
      return '';
    }
    
    // Simply join chunks - they should maintain proper boundaries
    const reconstructed = chunks.join('');
    console.log('ChunkManager-M.js: reconstructContent: Reconstructed', reconstructed.length, 'characters');
    
    return reconstructed;
  }

  /**
   * Estimate optimal configuration for large content
   * @param {number} contentLength - Total content length in characters
   * @returns {Object} Optimization recommendations
   */
  static estimateOptimalConfiguration(contentLength) {
    console.log('ChunkManager-M.js: estimateOptimalConfiguration: Analyzing', contentLength, 'characters');
    
    const estimatedContentChunks = Math.ceil(contentLength / MAX_CHUNK_SIZE);
    const estimatedHashListChunks = Math.ceil(estimatedContentChunks / MAX_HASHES_PER_CHUNK);
    const totalTransactions = 1 + estimatedHashListChunks + estimatedContentChunks;
    
    const config = {
      contentLength,
      estimatedContentChunks,
      estimatedHashListChunks,
      totalTransactions,
      architecture: '3-tier',
      recommendations: {
        chunkSize: this.calculateOptimalChunkSize('sample content'),
        hashesPerChunk: MAX_HASHES_PER_CHUNK,
        concurrencyLevel: Math.min(5, Math.max(2, Math.floor(totalTransactions / 10)))
      },
      costs: {
        estimatedSOL: totalTransactions * 0.000005,
        estimatedUSD: totalTransactions * 0.000005 * 200, // Rough SOL price
        estimatedTimeMinutes: Math.ceil(totalTransactions * 1.5 / 60)
      }
    };
    
    console.log('ChunkManager-M.js: estimateOptimalConfiguration: Configuration estimated:', config);
    return config;
  }
}

export default ChunkManagerM;

// Character count: 9952