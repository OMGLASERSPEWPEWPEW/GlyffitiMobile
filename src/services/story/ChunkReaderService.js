// src/services/story/ChunkReaderService.js
// Path: src/services/story/ChunkReaderService.js
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { globalRPCRateLimiter } from '../blockchain/shared/GlobalRPCRateLimiter';
import bs58 from 'bs58';

/**
 * Service for reading individual chunks from blockchain transactions
 * Includes rate limiting and retry logic to prevent RPC node blocking
 */
export class ChunkReaderService {
  constructor() {
    // Initialize Solana connection
    this.connection = new Connection(
      process.env.REACT_APP_SOLANA_RPC_URL || clusterApiUrl('devnet'),
      'confirmed'
    );
    
    // Memo program ID for finding memo instructions
    this.MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
    
    // Cache for recently fetched transactions to avoid redundant requests
    this.transactionCache = new Map();
    this.cacheMaxSize = 100;
    this.cacheMaxAge = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Fetch a chunk from a blockchain transaction with rate limiting
   * @param {string} transactionId - Transaction ID containing the chunk
   * @returns {Promise<string>} Raw chunk data
   */
  // REPLACE ENTIRE METHOD WITH:
async fetchChunk(transactionId) {
  // Check cache first
  const cachedData = this.getCachedTransaction(transactionId);
  if (cachedData) {
    console.log(`ChunkReaderService: fetchChunk: Using cached data for transaction: ${transactionId}`);
    return cachedData;
  }

  // Use global rate limiter for the actual operation
  const result = await globalRPCRateLimiter.executeWithRateLimit(
    () => this.fetchSingleChunk(transactionId),
    `fetch chunk ${transactionId.substring(0, 8)}...`,
    'ChunkReaderService'
  );
  
  // Cache the result
  this.cacheTransaction(transactionId, result);
  return result;
}


  /**
   * Fetch a single chunk with retry logic
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<string>} Chunk data
   */
  // REPLACE fetchSingleChunk METHOD WITH:
async fetchSingleChunk(transactionId) {
  console.log(`ChunkReaderService: fetchSingleChunk: Fetching transaction ${transactionId}`);
  
  // Make the actual RPC call - GlobalRPCRateLimiter handles retries
  const transaction = await this.connection.getParsedTransaction(transactionId, {
    maxSupportedTransactionVersion: 0
  });

  if (!transaction) {
    throw new Error(`Transaction not found: ${transactionId}`);
  }

  // Extract chunk data from memo instruction
  const chunkData = this.extractChunkDataFromTransaction(transaction);
  
  if (!chunkData) {
    throw new Error(`No chunk data found in transaction: ${transactionId}`);
  }

  console.log(`ChunkReaderService: fetchSingleChunk: Successfully fetched chunk from transaction: ${transactionId}`);
  return chunkData;
}

  /**
   * Extract chunk data from a Solana transaction (matching TypeScript implementation)
   * @param {Object} transaction - Solana transaction object
   * @returns {string|null} Extracted chunk data or null
   */
  extractChunkDataFromTransaction(transaction) {
    try {
      console.log('Extracting chunk data from transaction:', {
        version: transaction.version,
        hasMeta: !!transaction.meta,
        hasTransaction: !!transaction.transaction
      });

      const instructions = transaction.transaction.message.instructions;
      console.log('All instructions:', instructions.map((ix, index) => ({
        index,
        programId: ix.programId,
        hasData: !!ix.data,
        dataLength: ix.data ? ix.data.length : 0,
        keys: ix.keys || []
      })));

      // Find the memo instruction with more detailed logging
      let memoInstruction = null;
      for (let i = 0; i < instructions.length; i++) {
        const ix = instructions[i];
        console.log(`Checking instruction ${i}:`, {
          programId: ix.programId,
          memoProgramId: this.MEMO_PROGRAM_ID.toString(),
          isMatch: ix.programId === this.MEMO_PROGRAM_ID.toString(),
          hasData: !!ix.data
        });

        // Check both string comparison and PublicKey comparison
        if (ix.programId === this.MEMO_PROGRAM_ID.toString() || 
            (ix.programId && new PublicKey(ix.programId).equals(this.MEMO_PROGRAM_ID))) {
          memoInstruction = ix;
          console.log('Found memo instruction at index:', i);
          break;
        }
      }

      // Handle both raw data and parsed memo instructions
      let memoData = null;
      
      if (memoInstruction.data) {
        // Raw instruction data (using bs58 decode like TypeScript)
        console.log('Using raw data field');
        memoData = new TextDecoder().decode(Buffer.from(bs58.decode(memoInstruction.data)));
      } else if (memoInstruction.parsed) {
        // Parsed memo instruction - data is already base64 decoded
        console.log('Using parsed field');
        memoData = memoInstruction.parsed;
      } else {
        console.error('No memo instruction data found. Instruction:', memoInstruction);
        throw new Error('No memo instruction or data found');
      }

      if (!memoData) {
        console.error('No memo data extracted. Instructions:', instructions);
        throw new Error('No memo data found');
      }

      console.log('Found memo data:', {
        source: memoInstruction.data ? 'raw data' : 'parsed field',
        dataLength: memoData.length,
        dataPreview: memoData.substring(0, 50) + '...'
      });

      // Check if this appears to be base64 encoded compressed data
      const isBase64 = /^[A-Za-z0-9+/]+=*$/.test(memoData.trim());
      console.log('Appears to be base64 encoded:', isBase64);

      // The decompression service expects Uint8Array, so convert base64 string to Uint8Array
      if (isBase64) {
        try {
          // Convert base64 string to Uint8Array (matching TypeScript implementation)
          const binaryData = atob(memoData.trim());
          const uint8Array = new Uint8Array(binaryData.length);
          for (let i = 0; i < binaryData.length; i++) {
            uint8Array[i] = binaryData.charCodeAt(i);
          }
          console.log('Converted base64 to Uint8Array, length:', uint8Array.length);
          return uint8Array;
        } catch (error) {
          console.error('Error converting base64 to Uint8Array:', error);
          throw new Error('Failed to convert base64 data to Uint8Array');
        }
      } else {
        // If not base64, convert string to Uint8Array
        console.log('Converting string to Uint8Array');
        return new TextEncoder().encode(memoData);
      }
      
    } catch (error) {
      console.error('Error extracting chunk data from transaction:', error);
      return null;
    }
  }

  /**
   * Cache transaction data
   * @param {string} transactionId - Transaction ID
   * @param {string} data - Transaction data to cache
   */
  cacheTransaction(transactionId, data) {
    // Remove oldest entries if cache is full
    if (this.transactionCache.size >= this.cacheMaxSize) {
      const oldestKey = this.transactionCache.keys().next().value;
      this.transactionCache.delete(oldestKey);
    }

    this.transactionCache.set(transactionId, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Get cached transaction data if available and not expired
   * @param {string} transactionId - Transaction ID
   * @returns {string|null} Cached data or null
   */
  getCachedTransaction(transactionId) {
    const cached = this.transactionCache.get(transactionId);
    
    if (!cached) {
      return null;
    }

    // Check if cache entry has expired
    if (Date.now() - cached.timestamp > this.cacheMaxAge) {
      this.transactionCache.delete(transactionId);
      return null;
    }

    return cached.data;
  }

  /**
   * Clear all cached transactions
   */
  clearCache() {
    this.transactionCache.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return {
      size: this.transactionCache.size,
      maxSize: this.cacheMaxSize,
      maxAge: this.cacheMaxAge
    };
  }

  /**
   * Sleep utility function
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} Promise that resolves after the specified time
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Test connection to Solana network
   * @returns {Promise<boolean>} True if connection is working
   */
  async testConnection() {
    try {
      const version = await this.connection.getVersion();
      console.log('Solana connection test successful:', version);
      return true;
    } catch (error) {
      console.error('Solana connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance for use across the app
export const chunkReaderService = new ChunkReaderService();

// Character count: 9853