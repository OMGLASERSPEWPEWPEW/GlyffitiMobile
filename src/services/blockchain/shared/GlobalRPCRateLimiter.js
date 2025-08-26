// src/services/blockchain/shared/GlobalRPCRateLimiter.js
// Path: src/services/blockchain/shared/GlobalRPCRateLimiter.js

/**
 * Global RPC Rate Limiter Service
 * 
 * Ensures all blockchain services share the same rate limits to prevent
 * aggregate 429 errors when multiple services hit the same RPC endpoint.
 * 
 * This is a singleton that enforces global rate limiting across:
 * - ChunkReaderService
 * - PublishingService 
 * - SolanaPublisher
 * - Any other blockchain operations
 */
export class GlobalRPCRateLimiter {
  constructor() {
    this.rateLimitConfig = {
      // Very conservative to avoid 429s - can increase later if stable
      maxRequestsPerSecond: 1, // Start with 1 req/sec for all services combined
      minRequestInterval: 1000, // 1 second between ANY blockchain request
      requestQueue: [],
      isProcessingQueue: false,
      lastRequestTime: 0,
      activeRequests: 0,
      maxConcurrentRequests: 2, // Absolute max concurrent operations
    };
    
    // Retry configuration for failed requests
    this.retryConfig = {
      maxRetries: 5, // Increased retries since we're being more conservative
      baseDelay: 2000, // Start with 2 second delay
      maxDelay: 30000, // Max 30 second delay for really bad rate limiting
    };
    
    // Request statistics
    this.stats = {
      totalRequests: 0,
      successful: 0,
      failed: 0,
      rateLimited: 0,
      retriesUsed: 0,
      averageWaitTime: 0
    };
    
    console.log('GlobalRPCRateLimiter: GlobalRPCRateLimiter: Initialized with', this.rateLimitConfig.maxRequestsPerSecond, 'req/sec limit');
  }
  
  /**
   * Execute a blockchain operation with global rate limiting
   * @param {Function} operation - Async function that makes the RPC call
   * @param {string} description - Description for logging
   * @param {string} serviceId - ID of the calling service (for stats)
   * @returns {Promise} Result of the operation
   */
  async executeWithRateLimit(operation, description = 'RPC operation', serviceId = 'unknown') {
    return new Promise((resolve, reject) => {
      this.rateLimitConfig.requestQueue.push({
        operation,
        description,
        serviceId,
        resolve,
        reject,
        queuedAt: Date.now(),
        retryAttempt: 0
      });
      
      this.processQueue();
    });
  }
  
  /**
   * Process the global rate-limited queue
   * @private
   */
  async processQueue() {
    if (this.rateLimitConfig.isProcessingQueue || this.rateLimitConfig.requestQueue.length === 0) {
      return;
    }
    
    // Prevent multiple queue processors
    this.rateLimitConfig.isProcessingQueue = true;
    
    while (this.rateLimitConfig.requestQueue.length > 0 && 
           this.rateLimitConfig.activeRequests < this.rateLimitConfig.maxConcurrentRequests) {
      
      const request = this.rateLimitConfig.requestQueue.shift();
      
      // Enforce minimum interval between requests
      const now = Date.now();
      const timeSinceLastRequest = now - this.rateLimitConfig.lastRequestTime;
      
      if (timeSinceLastRequest < this.rateLimitConfig.minRequestInterval) {
        const waitTime = this.rateLimitConfig.minRequestInterval - timeSinceLastRequest;
        console.log(`GlobalRPCRateLimiter: processQueue: Waiting ${waitTime}ms before ${request.description} (${request.serviceId})`);
        await this.sleep(waitTime);
      }
      
      // Execute the request
      this.executeRequest(request);
      this.rateLimitConfig.lastRequestTime = Date.now();
    }
    
    this.rateLimitConfig.isProcessingQueue = false;
    
    // If there are still items in queue, schedule another process
    if (this.rateLimitConfig.requestQueue.length > 0) {
      setTimeout(() => this.processQueue(), this.rateLimitConfig.minRequestInterval);
    }
  }
  
  /**
   * Execute a single request with retry logic
   * @param {Object} request - Request object from queue
   * @private
   */
  async executeRequest(request) {
    this.rateLimitConfig.activeRequests++;
    this.stats.totalRequests++;
    
    const startTime = Date.now();
    
    try {
      console.log(`GlobalRPCRateLimiter: executeRequest: Starting ${request.description} (${request.serviceId}, attempt ${request.retryAttempt + 1})`);
      
      const result = await request.operation();
      
      // Success!
      const waitTime = Date.now() - request.queuedAt;
      this.stats.successful++;
      this.stats.averageWaitTime = (this.stats.averageWaitTime + waitTime) / 2;
      
      console.log(`GlobalRPCRateLimiter: executeRequest: ✅ ${request.description} completed (waited ${waitTime}ms)`);
      request.resolve(result);
      
    } catch (error) {
      console.error(`GlobalRPCRateLimiter: executeRequest: ❌ ${request.description} failed:`, error.message);
      
      // Check if this is a rate limit error
      const isRateLimit = this.isRateLimitError(error);
      
      if (isRateLimit) {
        this.stats.rateLimited++;
        console.warn(`GlobalRPCRateLimiter: executeRequest: 🐢 Rate limit detected for ${request.description}`);
      }
      
      // Retry logic
      if (request.retryAttempt < this.retryConfig.maxRetries && (isRateLimit || this.isRetryableError(error))) {
        this.stats.retriesUsed++;
        
        // Calculate exponential backoff delay
        const backoffDelay = Math.min(
          this.retryConfig.baseDelay * Math.pow(2, request.retryAttempt),
          this.retryConfig.maxDelay
        );
        
        // For rate limit errors, use longer delays
        const finalDelay = isRateLimit ? Math.max(backoffDelay, 5000) : backoffDelay;
        
        console.log(`GlobalRPCRateLimiter: executeRequest: 🔄 Retrying ${request.description} in ${finalDelay}ms (attempt ${request.retryAttempt + 1}/${this.retryConfig.maxRetries})`);
        
        // Re-queue with incremented retry count
        request.retryAttempt++;
        
        setTimeout(() => {
          this.rateLimitConfig.requestQueue.unshift(request); // Add to front of queue for retry
          this.processQueue();
        }, finalDelay);
        
      } else {
        // Max retries exceeded or non-retryable error
        this.stats.failed++;
        console.error(`GlobalRPCRateLimiter: executeRequest: 💀 ${request.description} failed permanently after ${request.retryAttempt + 1} attempts`);
        request.reject(error);
      }
    } finally {
      this.rateLimitConfig.activeRequests--;
    }
  }
  
  /**
   * Check if error is a rate limit error
   * @param {Error} error - Error to check
   * @returns {boolean} True if rate limit error
   * @private
   */
  isRateLimitError(error) {
    const message = error.message.toLowerCase();
    const code = error.code || error.statusCode || error.status;
    
    return code === 429 || 
           message.includes('429') ||
           message.includes('rate limit') ||
           message.includes('too many requests') ||
           message.includes('exceeded');
  }
  
  /**
   * Check if error is retryable
   * @param {Error} error - Error to check  
   * @returns {boolean} True if retryable
   * @private
   */
  isRetryableError(error) {
    const message = error.message.toLowerCase();
    const code = error.code || error.statusCode || error.status;
    
    // Rate limit errors are always retryable
    if (this.isRateLimitError(error)) {
      return true;
    }
    
    // Network/connection errors are retryable
    return code >= 500 || 
           message.includes('network') ||
           message.includes('timeout') ||
           message.includes('connection') ||
           message.includes('ENOTFOUND') ||
           message.includes('ECONNRESET');
  }
  
  /**
   * Sleep utility
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} Promise that resolves after delay
   * @private
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Get current rate limiter statistics
   * @returns {Object} Stats object
   */
  getStats() {
    return {
      ...this.stats,
      queueLength: this.rateLimitConfig.requestQueue.length,
      activeRequests: this.rateLimitConfig.activeRequests,
      rateLimitConfig: { ...this.rateLimitConfig }
    };
  }
  
  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalRequests: 0,
      successful: 0,
      failed: 0,
      rateLimited: 0,
      retriesUsed: 0,
      averageWaitTime: 0
    };
    console.log('GlobalRPCRateLimiter: resetStats: Statistics reset');
  }
  
  /**
   * Update rate limiting configuration
   * @param {Object} newConfig - New configuration values
   */
  updateRateConfig(newConfig) {
    const oldConfig = { ...this.rateLimitConfig };
    this.rateLimitConfig = { ...this.rateLimitConfig, ...newConfig };
    
    // Update derived values
    if (newConfig.maxRequestsPerSecond) {
      this.rateLimitConfig.minRequestInterval = Math.ceil(1000 / newConfig.maxRequestsPerSecond);
    }
    
    console.log('GlobalRPCRateLimiter: updateRateConfig: Updated rate config:', {
      old: { 
        maxRequestsPerSecond: oldConfig.maxRequestsPerSecond,
        minRequestInterval: oldConfig.minRequestInterval,
        maxConcurrentRequests: oldConfig.maxConcurrentRequests
      },
      new: {
        maxRequestsPerSecond: this.rateLimitConfig.maxRequestsPerSecond,
        minRequestInterval: this.rateLimitConfig.minRequestInterval,
        maxConcurrentRequests: this.rateLimitConfig.maxConcurrentRequests
      }
    });
  }
  
  /**
   * Emergency brake - pause all operations
   * @param {number} pauseDurationMs - How long to pause
   */
  async emergencyPause(pauseDurationMs = 10000) {
    console.warn(`GlobalRPCRateLimiter: emergencyPause: 🚨 Emergency pause activated for ${pauseDurationMs}ms`);
    const originalMinInterval = this.rateLimitConfig.minRequestInterval;
    
    this.rateLimitConfig.minRequestInterval = pauseDurationMs;
    
    setTimeout(() => {
      this.rateLimitConfig.minRequestInterval = originalMinInterval;
      console.log('GlobalRPCRateLimiter: emergencyPause: ✅ Emergency pause lifted');
    }, pauseDurationMs);
  }
}

// Export singleton instance
export const globalRPCRateLimiter = new GlobalRPCRateLimiter();

// Character count: 4738