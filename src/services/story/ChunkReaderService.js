// src/services/story/ChunkReaderService.js
// Path: src/services/story/ChunkReaderService.js
import { Connection, clusterApiUrl } from '@solana/web3.js';

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
    
    // Rate limiting configuration
    this.rateLimitConfig = {
      maxRequestsPerSecond: 2, // Conservative rate to avoid blocking
      requestQueue: [],
      isProcessingQueue: false,
      lastRequestTime: 0,
      minRequestInterval: 500, // Minimum 500ms between requests
    };
    
    // Retry configuration
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000, // Start with 1 second delay
      maxDelay: 10000, // Max 10 second delay
    };
    
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
  async fetchChunk(transactionId) {
    // Check cache first
    const cachedData = this.getCachedTransaction(transactionId);
    if (cachedData) {
      console.log(`Using cached data for transaction: ${transactionId}`);
      return cachedData;
    }

    // Add to rate-limited queue
    return new Promise((resolve, reject) => {
      this.rateLimitConfig.requestQueue.push({
        transactionId,
        resolve,
        reject,
        attempts: 0,
        timestamp: Date.now()
      });
      
      this.processRequestQueue();
    });
  }

  /**
   * Process the request queue with rate limiting
   */
  async processRequestQueue() {
    if (this.rateLimitConfig.isProcessingQueue || this.rateLimitConfig.requestQueue.length === 0) {
      return;
    }

    this.rateLimitConfig.isProcessingQueue = true;

    while (this.rateLimitConfig.requestQueue.length > 0) {
      const request = this.rateLimitConfig.requestQueue.shift();
      
      try {
        // Ensure minimum time between requests
        const timeSinceLastRequest = Date.now() - this.rateLimitConfig.lastRequestTime;
        const remainingDelay = this.rateLimitConfig.minRequestInterval - timeSinceLastRequest;
        
        if (remainingDelay > 0) {
          console.log(`Rate limiting: waiting ${remainingDelay}ms before next request`);
          await this.sleep(remainingDelay);
        }

        // Attempt to fetch the transaction
        const result = await this.fetchTransactionWithRetry(request);
        
        // Cache the result
        this.cacheTransaction(request.transactionId, result);
        
        // Update last request time
        this.rateLimitConfig.lastRequestTime = Date.now();
        
        // Resolve the promise
        request.resolve(result);
        
      } catch (error) {
        console.error(`Failed to fetch transaction ${request.transactionId}:`, error);
        request.reject(error);
      }
    }

    this.rateLimitConfig.isProcessingQueue = false;
  }

  /**
   * Fetch transaction with retry logic
   * @param {Object} request - Request object with transactionId and attempt count
   * @returns {Promise<string>} Transaction data
   */
  async fetchTransactionWithRetry(request) {
    const { transactionId } = request;
    
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        console.log(`Fetching transaction ${transactionId} (attempt ${attempt + 1})`);
        
        // Fetch the transaction from Solana
        const transaction = await this.connection.getTransaction(transactionId, {
          encoding: 'base64',
          commitment: 'confirmed',
          maxSupportedTransactionVersion: 0
        });

        if (!transaction) {
          throw new Error(`Transaction not found: ${transactionId}`);
        }

        // Extract the chunk data from the memo instruction
        const chunkData = this.extractChunkDataFromTransaction(transaction);
        
        if (!chunkData) {
          throw new Error(`No chunk data found in transaction: ${transactionId}`);
        }

        console.log(`Successfully fetched chunk from transaction: ${transactionId}`);
        return chunkData;

      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed for ${transactionId}:`, error.message);
        
        if (attempt === this.retryConfig.maxRetries) {
          throw new Error(`Failed to fetch transaction after ${this.retryConfig.maxRetries + 1} attempts: ${error.message}`);
        }

        // Calculate exponential backoff delay
        const delay = Math.min(
          this.retryConfig.baseDelay * Math.pow(2, attempt),
          this.retryConfig.maxDelay
        );
        
        console.log(`Retrying in ${delay}ms...`);
        await this.sleep(delay);
      }
    }
  }

  /**
   * Extract chunk data from a Solana transaction
   * @param {Object} transaction - Solana transaction object
   * @returns {string|null} Extracted chunk data or null
   */
  extractChunkDataFromTransaction(transaction) {
    try {
      // Look for memo instructions in the transaction
      const instructions = transaction.transaction.message.instructions;
      
      for (const instruction of instructions) {
        // Check if this is a memo instruction
        // Memo program ID: MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr
        const memoProgramId = 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr';
        const programId = transaction.transaction.message.accountKeys[instruction.programIdIndex];
        
        if (programId === memoProgramId && instruction.data) {
          // The data should be base64 encoded
          const chunkData = Buffer.from(instruction.data, 'base64').toString('utf8');
          return chunkData;
        }
      }
      
      // Also check meta.logMessages for memo data (alternative approach)
      if (transaction.meta && transaction.meta.logMessages) {
        for (const log of transaction.meta.logMessages) {
          if (log.startsWith('Program log: ')) {
            const memoData = log.substring('Program log: '.length);
            if (memoData && memoData.length > 0) {
              return memoData;
            }
          }
        }
      }
      
      return null;
      
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

    // Check if cache entry is expired
    if (Date.now() - cached.timestamp > this.cacheMaxAge) {
      this.transactionCache.delete(transactionId);
      return null;
    }

    return cached.data;
  }

  /**
   * Clear expired cache entries
   */
  cleanExpiredCache() {
    const now = Date.now();
    for (const [transactionId, cached] of this.transactionCache.entries()) {
      if (now - cached.timestamp > this.cacheMaxAge) {
        this.transactionCache.delete(transactionId);
      }
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getCacheStats() {
    return {
      size: this.transactionCache.size,
      maxSize: this.cacheMaxSize,
      maxAge: this.cacheMaxAge
    };
  }

  /**
   * Get current rate limiting status
   * @returns {Object} Rate limiting status
   */
  getRateLimitStatus() {
    return {
      queueLength: this.rateLimitConfig.requestQueue.length,
      isProcessing: this.rateLimitConfig.isProcessingQueue,
      timeSinceLastRequest: Date.now() - this.rateLimitConfig.lastRequestTime,
      minInterval: this.rateLimitConfig.minRequestInterval
    };
  }

  /**
   * Utility sleep function
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear all caches and reset state
   */
  reset() {
    this.transactionCache.clear();
    this.rateLimitConfig.requestQueue = [];
    this.rateLimitConfig.isProcessingQueue = false;
    this.rateLimitConfig.lastRequestTime = 0;
  }
}

// Export singleton instance
export const chunkReaderService = new ChunkReaderService();

// Clean expired cache entries every 5 minutes
setInterval(() => {
  chunkReaderService.cleanExpiredCache();
}, 5 * 60 * 1000);

// 2,634 characters