// src/services/hashing/HashingService.js
import * as Crypto from 'expo-crypto';

/**
 * Service for creating and verifying content hashes
 * Uses expo-crypto for SHA-256 hashing
 */
export class HashingService {
  
  /**
   * Create a SHA-256 hash of content
   * @param {string|Uint8Array} content - Content to hash
   * @returns {Promise<string>} - Hex encoded hash
   */
  static async hashContent(content) {
    try {
      let data;
      
      if (typeof content === 'string') {
        // If string, use it directly
        data = content;
      } else if (content instanceof Uint8Array) {
        // If Uint8Array, convert to base64 for hashing
        data = this.uint8ArrayToBase64(content);
      } else {
        throw new Error('Content must be string or Uint8Array');
      }

      // Use expo-crypto to create SHA-256 hash
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        data,
        { encoding: Crypto.CryptoEncoding.HEX }
      );
      
      return hash;
    } catch (error) {
      console.error('Error hashing content:', error);
      throw new Error('Failed to hash content: ' + error.message);
    }
  }

  /**
   * Verify if content matches a given hash
   * @param {string|Uint8Array} content - Content to verify
   * @param {string} hash - Expected hash (hex encoded)
   * @returns {Promise<boolean>} - True if hash matches
   */
  static async verifyHash(content, hash) {
    try {
      const calculatedHash = await this.hashContent(content);
      return calculatedHash.toLowerCase() === hash.toLowerCase();
    } catch (error) {
      console.error('Error verifying hash:', error);
      return false;
    }
  }

  /**
   * Create a content fingerprint for integrity checking
   * This creates a shorter hash suitable for quick verification
   * @param {string} content - Content to fingerprint
   * @returns {Promise<string>} - Short fingerprint (first 16 chars of hash)
   */
  static async createFingerprint(content) {
    try {
      const fullHash = await this.hashContent(content);
      return fullHash.substring(0, 16);
    } catch (error) {
      console.error('Error creating fingerprint:', error);
      throw new Error('Failed to create fingerprint: ' + error.message);
    }
  }

  /**
   * Verify a content fingerprint
   * @param {string} content - Content to verify
   * @param {string} fingerprint - Expected fingerprint
   * @returns {Promise<boolean>} - True if fingerprint matches
   */
  static async verifyFingerprint(content, fingerprint) {
    try {
      const calculatedFingerprint = await this.createFingerprint(content);
      return calculatedFingerprint.toLowerCase() === fingerprint.toLowerCase();
    } catch (error) {
      console.error('Error verifying fingerprint:', error);
      return false;
    }
  }

  /**
   * Create a merkle-style hash for a list of content chunks
   * Useful for verifying integrity of multiple glyphs
   * @param {string[]} contentArray - Array of content strings
   * @returns {Promise<string>} - Combined hash
   */
  static async hashContentArray(contentArray) {
    try {
      if (!Array.isArray(contentArray) || contentArray.length === 0) {
        throw new Error('Content array must be non-empty array');
      }

      // Hash each piece individually
      const individualHashes = [];
      for (const content of contentArray) {
        const hash = await this.hashContent(content);
        individualHashes.push(hash);
      }

      // Create a combined hash of all individual hashes
      const combinedHashInput = individualHashes.join('');
      return await this.hashContent(combinedHashInput);
    } catch (error) {
      console.error('Error hashing content array:', error);
      throw new Error('Failed to hash content array: ' + error.message);
    }
  }

  /**
   * Create a time-based hash that includes timestamp
   * Useful for creating unique identifiers
   * @param {string} content - Content to hash
   * @param {number} [timestamp] - Optional timestamp (defaults to now)
   * @returns {Promise<string>} - Time-based hash
   */
  static async createTimestampedHash(content, timestamp) {
    try {
      const ts = timestamp || Date.now();
      const timestampedContent = `${content}_${ts}`;
      return await this.hashContent(timestampedContent);
    } catch (error) {
      console.error('Error creating timestamped hash:', error);
      throw new Error('Failed to create timestamped hash: ' + error.message);
    }
  }

  /**
   * Generate a content ID from title and author
   * Creates a consistent identifier for content
   * @param {string} title - Content title
   * @param {string} authorPublicKey - Author's public key
   * @param {number} [timestamp] - Optional timestamp
   * @returns {Promise<string>} - Content ID
   */
  static async generateContentId(title, authorPublicKey, timestamp) {
    try {
      const ts = timestamp || Date.now();
      const contentString = `${title}_${authorPublicKey}_${ts}`;
      const hash = await this.hashContent(contentString);
      
      // Return first 16 characters for a shorter ID
      return `glyph_${hash.substring(0, 16)}`;
    } catch (error) {
      console.error('Error generating content ID:', error);
      throw new Error('Failed to generate content ID: ' + error.message);
    }
  }

  /**
   * Helper function to convert Uint8Array to base64
   * @param {Uint8Array} uint8Array - Byte array to convert
   * @returns {string} - Base64 encoded string
   */
  static uint8ArrayToBase64(uint8Array) {
    // Convert Uint8Array to regular array, then to string
    const binaryString = String.fromCharCode.apply(null, uint8Array);
    
    // Use btoa for base64 encoding (available in React Native)
    return btoa(binaryString);
  }

  /**
   * Helper function to convert base64 to Uint8Array
   * @param {string} base64 - Base64 encoded string
   * @returns {Uint8Array} - Byte array
   */
  static base64ToUint8Array(base64) {
    // Decode base64 to binary string
    const binaryString = atob(base64);
    
    // Convert to Uint8Array
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }
    
    return uint8Array;
  }

  /**
   * Create a collision-resistant hash using content + random salt
   * Useful when you need to ensure uniqueness
   * @param {string} content - Content to hash
   * @returns {Promise<{hash: string, salt: string}>} - Hash and salt
   */
  static async createSaltedHash(content) {
    try {
      // Generate random salt using expo-crypto
      const saltBytes = await Crypto.getRandomBytesAsync(16);
      const salt = this.uint8ArrayToBase64(saltBytes);
      
      // Create hash with content + salt
      const saltedContent = `${content}_${salt}`;
      const hash = await this.hashContent(saltedContent);
      
      return { hash, salt };
    } catch (error) {
      console.error('Error creating salted hash:', error);
      throw new Error('Failed to create salted hash: ' + error.message);
    }
  }

  /**
   * Verify a salted hash
   * @param {string} content - Original content
   * @param {string} hash - Expected hash
   * @param {string} salt - Salt used for hashing
   * @returns {Promise<boolean>} - True if hash matches
   */
  static async verifySaltedHash(content, hash, salt) {
    try {
      const saltedContent = `${content}_${salt}`;
      const calculatedHash = await this.hashContent(saltedContent);
      return calculatedHash.toLowerCase() === hash.toLowerCase();
    } catch (error) {
      console.error('Error verifying salted hash:', error);
      return false;
    }
  }
}

// Character count: 6247