// __tests__/__mocks__/expo-crypto.js
// Path: __tests__/__mocks__/expo-crypto.js

/**
 * Mock implementation of Expo Crypto for testing
 * Provides predictable crypto functions for consistent test results
 */

/**
 * Generate a random UUID v4 string
 * @returns {string} Mock UUID
 */
const randomUUID = jest.fn(() => {
  // Return a predictable UUID for testing
  return 'test-uuid-1234-5678-9abc-def012345678';
});

/**
 * Generate cryptographically secure random bytes
 * @param {number} byteCount - Number of bytes to generate
 * @returns {Uint8Array} Mock random bytes
 */
const getRandomBytes = jest.fn((byteCount) => {
  // Return predictable bytes for testing
  const bytes = new Uint8Array(byteCount);
  for (let i = 0; i < byteCount; i++) {
    bytes[i] = (i * 17) % 256; // Predictable pattern
  }
  return bytes;
});

/**
 * Generate a random base64 string
 * @param {number} byteCount - Number of random bytes to generate
 * @returns {string} Base64 encoded random string
 */
const getRandomBytesAsync = jest.fn(async (byteCount) => {
  const bytes = getRandomBytes(byteCount);
  // Convert to base64
  return Buffer.from(bytes).toString('base64');
});

/**
 * Digest data using specified algorithm
 * @param {string} algorithm - Hash algorithm (SHA256, MD5, etc.)
 * @param {string|Uint8Array} data - Data to hash
 * @param {Object} options - Encoding options
 * @returns {Promise<string>} Hash result
 */
const digestStringAsync = jest.fn(async (algorithm, data, options = {}) => {
  // Return predictable hash for testing
  const encoding = options.encoding || 'hex';
  const mockHash = 'mock_hash_' + algorithm.toLowerCase() + '_' + data.length;
  
  if (encoding === 'base64') {
    return Buffer.from(mockHash).toString('base64');
  }
  
  return mockHash;
});

// Export all crypto functions
export {
  randomUUID,
  getRandomBytes,
  getRandomBytesAsync,
  digestStringAsync
};

// Default export for compatibility
export default {
  randomUUID,
  getRandomBytes,
  getRandomBytesAsync,
  digestStringAsync
};

// 1,640 characters