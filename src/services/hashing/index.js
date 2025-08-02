// src/services/hashing/index.js
// Path: src/services/hashing/index.js
// Environment detection wrapper for HashingService

/**
 * Detect environment and export appropriate HashingService
 * This allows the same code to work in both Node.js and React Native
 */

// Check if we're in Node.js
const isNode = typeof process !== 'undefined' && 
               process.versions && 
               process.versions.node &&
               typeof window === 'undefined';

let HashingService;

if (isNode) {
  // Node.js environment - use crypto module
  const crypto = await import('crypto');
  
  HashingService = {
    async hashContent(content) {
      try {
        if (!content || !(content instanceof Uint8Array)) {
          throw new Error('Content must be a Uint8Array');
        }
        const hash = crypto.createHash('sha256');
        hash.update(Buffer.from(content));
        return hash.digest('hex');
      } catch (error) {
        console.error('HashingService error:', error);
        throw new Error(`Failed to hash content: ${error.message}`);
      }
    }
  };
} else {
  // React Native environment - use expo-crypto
  const expoCrypto = await import('expo-crypto');
  
  HashingService = {
    async hashContent(content) {
      try {
        if (!content || !(content instanceof Uint8Array)) {
          throw new Error('Content must be a Uint8Array');
        }
        const hash = await expoCrypto.digestStringAsync(
          expoCrypto.CryptoDigestAlgorithm.SHA256,
          Buffer.from(content).toString('base64'),
          { encoding: expoCrypto.CryptoEncoding.HEX }
        );
        return hash;
      } catch (error) {
        console.error('HashingService error:', error);
        throw new Error(`Failed to hash content: ${error.message}`);
      }
    }
  };
}

export { HashingService };
export default HashingService;

// Character count: 1,723