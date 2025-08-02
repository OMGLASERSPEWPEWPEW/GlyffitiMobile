// src/services/hashing/HashingService.node.js
// Path: src/services/hashing/HashingService.node.js
// Node.js version of HashingService for deployment scripts

import crypto from 'crypto';

/**
 * Node.js Hashing Service - Provides same interface as expo-crypto version
 * Used by deployment scripts and other Node.js environments
 */
export class HashingService {
  /**
   * Hash content using SHA-256
   * @param {Uint8Array} content - Content to hash
   * @returns {Promise<string>} Hex-encoded hash
   */
  static async hashContent(content) {
    try {
      if (!content || !(content instanceof Uint8Array)) {
        throw new Error('Content must be a Uint8Array');
      }

      // Create hash using Node.js crypto
      const hash = crypto.createHash('sha256');
      hash.update(Buffer.from(content));
      const hashBuffer = hash.digest();
      
      // Convert to hex string (matching expo-crypto format)
      return hashBuffer.toString('hex');
    } catch (error) {
      console.error('HashingService error:', error);
      throw new Error(`Failed to hash content: ${error.message}`);
    }
  }

  /**
   * Run self-test to verify hashing functionality
   * @returns {Promise<boolean>} True if test passes
   */
  static async runSelfTest() {
    try {
      console.log('🧪 Running Node.js HashingService self-test...');
      
      // Test data
      const testData = new TextEncoder().encode('Hello, Glyffiti!');
      const testArray = new Uint8Array(testData);
      
      // Hash the test data
      const hash = await this.hashContent(testArray);
      
      // Verify hash format (should be 64 character hex string)
      if (typeof hash !== 'string' || hash.length !== 64 || !/^[0-9a-f]+$/.test(hash)) {
        throw new Error('Invalid hash format');
      }
      
      // Verify deterministic hashing
      const hash2 = await this.hashContent(testArray);
      if (hash !== hash2) {
        throw new Error('Hashing is not deterministic');
      }
      
      console.log('✅ Node.js HashingService self-test passed');
      console.log(`📊 Test hash: ${hash.substring(0, 16)}...`);
      
      return true;
    } catch (error) {
      console.error('❌ Node.js HashingService self-test failed:', error);
      return false;
    }
  }
}

// Character count: 2,293