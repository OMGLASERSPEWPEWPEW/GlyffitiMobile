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

      this.processQueue();
    });
  }

  /**
   * Process the rate-limited request queue
   */
  async processQueue() {
    if (this.rateLimitConfig.isProcessingQueue || this.rateLimitConfig.requestQueue.length === 0) {
      return;
    }

    this.rateLimitConfig.isProcessingQueue = true;

    while (this.rateLimitConfig.requestQueue.length > 0) {
      const request = this.rateLimitConfig.requestQueue.shift();
      
      // Ensure minimum interval between requests
      const now = Date.now();
      const timeSinceLastRequest = now - this.rateLimitConfig.lastRequestTime;
      
      if (timeSinceLastRequest < this.rateLimitConfig.minRequestInterval) {
        await this.sleep(this.rateLimitConfig.minRequestInterval - timeSinceLastRequest);
      }

      try {
        const result = await this.fetchSingleChunk(request.transactionId);
        this.cacheTransaction(request.transactionId, result);
        request.resolve(result);
      } catch (error) {
        request.reject(error);
      }

      this.rateLimitConfig.lastRequestTime = Date.now();
    }

    this.rateLimitConfig.isProcessingQueue = false;
  }

  /**
   * Fetch a single chunk with retry logic
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<string>} Chunk data
   */
  async fetchSingleChunk(transactionId) {
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        console.log(`Fetching transaction ${transactionId} (attempt ${attempt + 1})`);
        
        // Fetch the transaction from Solana with the correct parameters
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
      console.log('Extracting chunk data from transaction:', {
        version: transaction.version,
        hasMeta: !!transaction.meta,
        hasTransaction: !!transaction.transaction
      });

      // Handle both legacy and versioned transactions
      const message = transaction.transaction.message;
      const instructions = message.instructions || [];
      
      console.log(`Found ${instructions.length} instructions`);

      // Find memo instruction
      for (let i = 0; i < instructions.length; i++) {
        const instruction = instructions[i];
        
        // Get the program ID from the account keys
        let programId;
        if (message.accountKeys) {
          // Legacy transaction format
          programId = message.accountKeys[instruction.programIdIndex];
        } else if (message.staticAccountKeys) {
          // Versioned transaction format
          programId = message.staticAccountKeys[instruction.programIdIndex];
        }
        
        console.log(`Instruction ${i}: programId=${programId}`);
        
        // Check if this is a memo instruction
        const memoProgramId = 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr';
        if (programId === memoProgramId && instruction.data) {
          console.log('Found memo instruction with data');
          
          // The data is base64 encoded, decode it to get the chunk content
          try {
            const chunkData = Buffer.from(instruction.data, 'base64').toString('utf8');
            console.log(`Extracted chunk data (${chunkData.length} chars):`, chunkData.substring(0, 100) + '...');
            return chunkData;
          } catch (decodeError) {
            console.error('Error decoding instruction data:', decodeError);
          }
        }
      }
      
      // Alternative: Check meta.logMessages for memo data
      if (transaction.meta && transaction.meta.logMessages) {
        console.log('Checking log messages for memo data');
        for (const log of transaction.meta.logMessages) {
          if (log.startsWith('Program log: ')) {
            const memoData = log.substring('Program log: '.length);
            if (memoData && memoData.length > 0) {
              console.log('Found memo data in logs:', memoData.substring(0, 100) + '...');
              return memoData;
            }
          }
        }
      }
      
      console.warn('No memo data found in transaction');
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


// Character count: 8789