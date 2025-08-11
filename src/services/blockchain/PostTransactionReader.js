// src/services/blockchain/PostTransactionReader.js
// Path: src/services/blockchain/PostTransactionReader.js

import { Connection } from '@solana/web3.js';
import { SolanaMemoBuilder } from './solana/utils/SolanaMemoBuilder';
import bs58 from 'bs58';
import { CompressionService } from '../compression/CompressionService';

/**
 * Service for reading post transaction data directly from the blockchain
 * Posts are stored as compressed glyph data with metadata including previousPostHash
 * 
 * Post storage format:
 * 1. Full glyph structure (with metadata) is stored as JSON
 * 2. JSON is compressed using CompressionService
 * 3. Compressed data is base64 encoded
 * 4. Base64 string is stored in memo instruction
 * 
 * Decoding process:
 * 1. Base58 decode RPC data → Base64 string  
 * 2. Base64 decode → Compressed Uint8Array
 * 3. Decompress → JSON string
 * 4. Parse JSON → Full glyph structure with previousPostHash
 */
export class PostTransactionReader {
  constructor() {
    // Use devnet for development
    this.connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    
    // Use existing SolanaMemoBuilder for consistent memo finding
    this.memoBuilder = new SolanaMemoBuilder(this.connection);
    
    // Cache for transaction data to avoid repeated fetches
    this.transactionCache = new Map();
    this.cacheMaxAge = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Read and parse a single post from a blockchain transaction
   * @param {string} transactionHash - Transaction hash to read
   * @param {string} username - Username for logging
   * @param {string} publicKey - Author's public key
   * @returns {Promise<Object|null>} Parsed post object or null
   */
  async readPostFromTransaction(transactionHash, username, publicKey) {
    try {
      console.log(`📖 Reading post transaction: ${transactionHash.substring(0, 8)}...`);
      
      // Check cache first
      const cached = this.getCachedTransaction(transactionHash);
      if (cached) {
        console.log('✅ Using cached post data');
        return cached;
      }

      // Wait for transaction indexing
      console.log('⏳ Waiting 3 seconds for transaction indexing...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Get transaction details from Solana
      const transaction = await this.connection.getTransaction(transactionHash, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0
      });
      
      if (!transaction || !transaction.meta) {
        console.warn(`⚠️ Transaction not found: ${transactionHash.substring(0, 8)}`);
        return null;
      }
      
      // Find memo instruction (same logic as SolanaMemoBuilder)
      const ix = (transaction.transaction.message.instructions || [])
        .find(ix => {
          const pid = ix.programId ||
            (ix.programIdIndex != null
              ? transaction.transaction.message.accountKeys[ix.programIdIndex]
              : null);
          return pid && (
            (typeof pid === 'string' && pid === this.memoBuilder.MEMO_PROGRAM_ID.toBase58()) ||
            (pid.equals && pid.equals(this.memoBuilder.MEMO_PROGRAM_ID))
          );
        });
      
      if (!ix) {
        console.warn(`⚠️ No memo instruction found in transaction: ${transactionHash.substring(0, 8)}`);
        return null;
      }

      // RPC returns instruction data as a Base58 string
      const rpcDataString = typeof ix.data === 'string'
        ? ix.data
        : Buffer.from(ix.data).toString('utf8');
      console.log(`📝 RPC gave base58 string (${rpcDataString.length} chars)`);

      // Step 1: Base58-decode the RPC string to get the memo content
      let memoBytes;
      try {
        memoBytes = bs58.decode(rpcDataString);
        console.log(`🔄 Base58 → memo bytes: ${memoBytes.length} bytes`);
      } catch {
        throw new Error('RPC data was not valid base58');
      }

      // Step 2: Convert memo bytes to UTF-8 string (this should be base64)
      const base64String = Buffer.from(memoBytes).toString('utf8').trim();
      console.log(`📄 Memo content (base64): ${base64String.length} chars`);

      // Step 3: Base64 decode to get compressed glyph data
      let compressedData;
      try {
        compressedData = CompressionService.base64ToUint8Array(base64String);
        console.log(`📦 Base64 → compressed data: ${compressedData.length} bytes`);
      } catch (error) {
        console.error('❌ Failed to decode base64:', error);
        throw new Error('Invalid base64 data in memo');
      }

      // Step 4: Decompress to get original glyph JSON data
      let decompressedJson;
      try {
        decompressedJson = CompressionService.decompress(compressedData);
        console.log(`🔓 Decompressed JSON: ${decompressedJson.length} chars`);
        console.log(`📝 JSON preview: "${decompressedJson.substring(0, 100)}..."`);
      } catch (error) {
        console.error('❌ Failed to decompress glyph data:', error);
        
        // 🔄 FALLBACK: Try to treat as plain text content (backward compatibility)
        try {
          const fallbackContent = CompressionService.decompress(compressedData);
          console.log('🔄 Falling back to plain text content');
          return await this.createFallbackPost(fallbackContent, transactionHash, username, publicKey, transaction);
        } catch (fallbackError) {
          throw new Error('Invalid compressed data in memo');
        }
      }

      // Step 5: Parse JSON to get full glyph structure
      let glyphStructure;
      try {
        glyphStructure = JSON.parse(decompressedJson);
        console.log(`📊 Parsed glyph structure:`, {
          hasGlyphs: !!glyphStructure.glyphs,
          glyphCount: glyphStructure.glyphs?.length || 0,
          hasContent: !!glyphStructure.content
        });
      } catch (error) {
        console.error('❌ Failed to parse glyph JSON:', error);
        
        // 🔄 FALLBACK: Treat as plain text content
        console.log('🔄 Falling back to plain text content');
        return await this.createFallbackPost(decompressedJson, transactionHash, username, publicKey, transaction);
      }

      // Step 6: Extract post data from glyph structure
      let postContent = '';
      let previousPostHash = null;

      if (glyphStructure.glyphs && Array.isArray(glyphStructure.glyphs)) {
        // ✅ NEW: Extract content and previousPostHash from glyph structure
        const firstGlyph = glyphStructure.glyphs[0];
        if (firstGlyph) {
          postContent = firstGlyph.content || glyphStructure.content || '';
          previousPostHash = firstGlyph.previousPostHash || null;
          
          console.log(`🔗 Chain link found: previousPostHash = ${previousPostHash || 'null (first post)'}`);
        }
      } else if (glyphStructure.content) {
        // Direct content field
        postContent = glyphStructure.content;
        console.log('📝 Using direct content field');
      } else {
        // Last resort: treat whole thing as content
        postContent = decompressedJson;
        console.log('📝 Using entire JSON as content');
      }

      if (!postContent || postContent.trim().length === 0) {
        throw new Error('No content found in glyph structure');
      }

      // Get timestamp from block time
      const timestamp = transaction.blockTime ?
        transaction.blockTime * 1000 : // Convert to milliseconds
        Date.now(); // Fallback to current time
      
      // ✅ FIXED: Create post object with proper previousPostHash
      const post = {
        id: `post_${username}_${timestamp}`,
        transactionHash: transactionHash,
        author: username,
        authorPublicKey: publicKey,
        content: postContent.trim(),
        title: `Post by ${username}`,
        timestamp: timestamp,
        previousPostHash: previousPostHash, // ✅ Now properly extracted from blockchain data!
        blockTime: transaction.blockTime,
        slot: transaction.slot,
        glyphData: {
          compressedSize: compressedData.length,
          originalSize: decompressedJson.length,
          compressionRatio: compressedData.length / decompressedJson.length,
          hasMetadata: !!glyphStructure.glyphs
        }
      };
      
      // Cache the result
      this.cacheTransaction(transactionHash, post);
      
      console.log(`📄 Post read for ${username}:`, {
        hash: transactionHash.substring(0, 8) + '...',
        contentLength: post.content.length,
        content: post.content.substring(0, 30) + '...',
        timestamp: new Date(timestamp).toISOString(),
        previousPostHash: previousPostHash ? previousPostHash.substring(0, 8) + '...' : 'null',
        chainContinues: !!previousPostHash
      });
      
      return post;
      
    } catch (error) {
      console.error(`❌ Error reading post transaction ${transactionHash.substring(0, 8)}:`, error);
      return null;
    }
  }

  /**
   * Create fallback post for backward compatibility with plain text content
   * @param {string} content - Plain text content  
   * @param {string} transactionHash - Transaction hash
   * @param {string} username - Username
   * @param {string} publicKey - Public key
   * @param {Object} transaction - Full transaction object
   * @returns {Promise<Object>} Post object
   */
  async createFallbackPost(content, transactionHash, username, publicKey, transaction) {
    const timestamp = transaction.blockTime ?
      transaction.blockTime * 1000 :
      Date.now();
    
    console.log('🔄 Creating fallback post (no chain linking available)');
    
    return {
      id: `post_${username}_${timestamp}`,
      transactionHash: transactionHash,
      author: username,
      authorPublicKey: publicKey,
      content: content.trim(),
      title: `Post by ${username}`,
      timestamp: timestamp,
      previousPostHash: null, // ⚠️ No chain linking for fallback posts
      blockTime: transaction.blockTime,
      slot: transaction.slot,
      glyphData: {
        compressedSize: content.length,
        originalSize: content.length,
        compressionRatio: 1.0,
        hasMetadata: false,
        isFallback: true
      }
    };
  }

  /**
   * Get cached transaction data
   * @param {string} transactionHash - Transaction hash
   * @returns {Object|null} Cached data or null
   */
  getCachedTransaction(transactionHash) {
    const cached = this.transactionCache.get(transactionHash);
    if (!cached) return null;
    
    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.cacheMaxAge) {
      this.transactionCache.delete(transactionHash);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Cache transaction data
   * @param {string} transactionHash - Transaction hash
   * @param {Object} data - Data to cache
   */
  cacheTransaction(transactionHash, data) {
    this.transactionCache.set(transactionHash, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear transaction cache
   */
  clearCache() {
    this.transactionCache.clear();
  }

  /**
   * Test connection to Solana network
   * @returns {Promise<boolean>} True if connection is working
   */
  async testConnection() {
    try {
      const version = await this.connection.getVersion();
      console.log('✅ Post reader Solana connection test successful:', version);
      return true;
    } catch (error) {
      console.error('❌ Post reader Solana connection test failed:', error);
      return false;
    }
  }

  /**
   * Debug: Read raw memo data from transaction (for debugging)
   * @param {string} transactionHash - Transaction hash
   * @returns {Promise<Object|null>} Raw memo data
   */
  async debugReadRawMemo(transactionHash) {
    try {
      const transaction = await this.connection.getTransaction(transactionHash, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0
      });
      
      if (!transaction) return null;
      
      const ix = (transaction.transaction.message.instructions || [])
        .find(ix => {
          const pid = ix.programId ||
            (ix.programIdIndex != null
              ? transaction.transaction.message.accountKeys[ix.programIdIndex]
              : null);
          return pid && (
            (typeof pid === 'string' && pid === this.memoBuilder.MEMO_PROGRAM_ID.toBase58()) ||
            (pid.equals && pid.equals(this.memoBuilder.MEMO_PROGRAM_ID))
          );
        });
      
      if (!ix) return null;
      
      const rpcDataString = typeof ix.data === 'string'
        ? ix.data
        : Buffer.from(ix.data).toString('utf8');
      
      const memoBytes = bs58.decode(rpcDataString);
      const memoString = Buffer.from(memoBytes).toString('utf8');
      
      return {
        transactionHash,
        rpcDataString,
        rpcDataLength: rpcDataString.length,
        memoBytes: Array.from(memoBytes),
        memoBytesLength: memoBytes.length,
        memoString,
        memoStringLength: memoString.length,
        blockTime: transaction.blockTime
      };
      
    } catch (error) {
      console.error('Debug read failed:', error);
      return { error: error.message };
    }
  }
}

// Export singleton instance
export const postTransactionReader = new PostTransactionReader();

// Character count: 11,547