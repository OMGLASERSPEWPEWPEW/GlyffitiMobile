// src/services/compression/CompressionService.js
import pako from 'pako';

/**
 * Service for compressing and decompressing content
 * Uses pako library for gzip compression (React Native compatible)
 */
export class CompressionService {
  
  /**
   * Compress text data using gzip compression
   * @param {string} data - Text data to compress
   * @returns {Uint8Array} - Compressed data as byte array
   */
  static compress(data) {
    try {
      if (typeof data !== 'string') {
        throw new Error('Data must be a string');
      }
      
      // Convert string to bytes first
      const textEncoder = new TextEncoder();
      const dataBytes = textEncoder.encode(data);
      
      // Compress using pako (gzip compression)
      const compressed = pako.deflate(dataBytes, {
        level: 6, // Good balance of compression vs speed
        windowBits: 15,
        memLevel: 8
      });
      
      return compressed;
    } catch (error) {
      console.error('Compression error:', error);
      throw new Error('Failed to compress data: ' + error.message);
    }
  }

  /**
   * Decompress gzip compressed data back to text
   * @param {Uint8Array} compressedData - Compressed data
   * @returns {string} - Decompressed text
   */
  static decompress(compressedData) {
    try {
      if (!(compressedData instanceof Uint8Array)) {
        throw new Error('Compressed data must be Uint8Array');
      }
      
      // Decompress using pako
      const decompressed = pako.inflate(compressedData);
      
      // Convert bytes back to string
      const textDecoder = new TextDecoder();
      return textDecoder.decode(decompressed);
    } catch (error) {
      console.error('Decompression error:', error);
      throw new Error('Failed to decompress data: ' + error.message);
    }
  }

  /**
   * Compress data and return as base64 string (for blockchain storage)
   * @param {string} data - Text data to compress
   * @returns {string} - Base64 encoded compressed data
   */
  static compressToBase64(data) {
    try {
      const compressed = this.compress(data);
      return this.uint8ArrayToBase64(compressed);
    } catch (error) {
      console.error('Base64 compression error:', error);
      throw new Error('Failed to compress to base64: ' + error.message);
    }
  }

  /**
   * Decompress base64 encoded compressed data
   * @param {string} base64Data - Base64 encoded compressed data
   * @returns {string} - Decompressed text
   */
  static decompressFromBase64(base64Data) {
    try {
      const compressed = this.base64ToUint8Array(base64Data);
      return this.decompress(compressed);
    } catch (error) {
      console.error('Base64 decompression error:', error);
      throw new Error('Failed to decompress from base64: ' + error.message);
    }
  }

  /**
   * Get compression ratio for given data
   * @param {string} originalData - Original text data
   * @returns {Object} - Compression statistics
   */
  static getCompressionStats(originalData) {
    try {
      const originalSize = new TextEncoder().encode(originalData).length;
      const compressed = this.compress(originalData);
      const compressedSize = compressed.length;
      const compressionRatio = originalSize > 0 ? (compressedSize / originalSize) : 1;
      const spaceSaved = originalSize - compressedSize;
      const percentSaved = originalSize > 0 ? ((spaceSaved / originalSize) * 100) : 0;

      return {
        originalSize,
        compressedSize,
        compressionRatio: Math.round(compressionRatio * 100) / 100,
        spaceSaved,
        percentSaved: Math.round(percentSaved * 100) / 100
      };
    } catch (error) {
      console.error('Error calculating compression stats:', error);
      return {
        originalSize: 0,
        compressedSize: 0,
        compressionRatio: 1,
        spaceSaved: 0,
        percentSaved: 0
      };
    }
  }

  /**
   * Check if compression is beneficial for given data
   * @param {string} data - Data to check
   * @param {number} [threshold=0.8] - Compression ratio threshold (below this is beneficial)
   * @returns {boolean} - True if compression saves significant space
   */
  static isCompressionBeneficial(data, threshold = 0.8) {
    try {
      const stats = this.getCompressionStats(data);
      return stats.compressionRatio < threshold;
    } catch (error) {
      console.error('Error checking compression benefit:', error);
      return false;
    }
  }

  /**
   * Compress data only if beneficial, otherwise return original
   * @param {string} data - Data to potentially compress
   * @param {number} [threshold=0.8] - Compression ratio threshold
   * @returns {Object} - Result with data and compression flag
   */
  static smartCompress(data, threshold = 0.8) {
    try {
      if (this.isCompressionBeneficial(data, threshold)) {
        return {
          data: this.compressToBase64(data),
          isCompressed: true,
          originalSize: new TextEncoder().encode(data).length,
          compressedSize: this.compress(data).length
        };
      } else {
        return {
          data: data,
          isCompressed: false,
          originalSize: new TextEncoder().encode(data).length,
          compressedSize: new TextEncoder().encode(data).length
        };
      }
    } catch (error) {
      console.error('Smart compression error:', error);
      return {
        data: data,
        isCompressed: false,
        originalSize: 0,
        compressedSize: 0
      };
    }
  }

  /**
   * Decompress data if it was compressed, otherwise return as-is
   * @param {string} data - Data to potentially decompress
   * @param {boolean} isCompressed - Whether the data is compressed
   * @returns {string} - Decompressed or original data
   */
  static smartDecompress(data, isCompressed) {
    try {
      if (isCompressed) {
        return this.decompressFromBase64(data);
      } else {
        return data;
      }
    } catch (error) {
      console.error('Smart decompression error:', error);
      throw new Error('Failed to decompress data: ' + error.message);
    }
  }

  /**
   * Estimate compressed size without actually compressing
   * Uses heuristics for quick estimation
   * @param {string} data - Data to estimate compression for
   * @returns {number} - Estimated compressed size in bytes
   */
  static estimateCompressedSize(data) {
    try {
      const originalSize = new TextEncoder().encode(data).length;
      
      // Simple heuristic based on text characteristics
      // This is much faster than actual compression for size estimation
      
      // Count repeated patterns
      const uniqueChars = new Set(data).size;
      const totalChars = data.length;
      const repetitionRatio = uniqueChars / totalChars;
      
      // Estimate compression ratio based on text characteristics
      let estimatedRatio;
      if (repetitionRatio < 0.1) {
        // Very repetitive text compresses well
        estimatedRatio = 0.3;
      } else if (repetitionRatio < 0.3) {
        // Moderately repetitive
        estimatedRatio = 0.5;
      } else if (repetitionRatio < 0.6) {
        // Normal text
        estimatedRatio = 0.7;
      } else {
        // Random or unique text doesn't compress well
        estimatedRatio = 0.9;
      }
      
      return Math.round(originalSize * estimatedRatio);
    } catch (error) {
      console.error('Error estimating compressed size:', error);
      return new TextEncoder().encode(data).length; // Return original size as fallback
    }
  }

  /**
   * Validate compressed data integrity
   * @param {Uint8Array} compressedData - Compressed data to validate
   * @returns {boolean} - True if data appears to be valid compressed data
   */
  static validateCompressedData(compressedData) {
    try {
      if (!(compressedData instanceof Uint8Array)) {
        return false;
      }
      
      if (compressedData.length < 2) {
        return false; // Too small to be valid compressed data
      }
      
      // Try to decompress - if it fails, data is invalid
      this.decompress(compressedData);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Convert Uint8Array to base64 string
   * @param {Uint8Array} uint8Array - Byte array to convert
   * @returns {string} - Base64 encoded string
   */
  static uint8ArrayToBase64(uint8Array) {
    try {
      // Convert Uint8Array to binary string
      let binaryString = '';
      const chunkSize = 0x8000; // Process in chunks to avoid call stack overflow
      
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, i + chunkSize);
        binaryString += String.fromCharCode.apply(null, chunk);
      }
      
      // Use btoa for base64 encoding (available in React Native)
      return btoa(binaryString);
    } catch (error) {
      console.error('Error converting to base64:', error);
      throw new Error('Failed to convert to base64: ' + error.message);
    }
  }

  /**
   * Convert base64 string to Uint8Array
   * @param {string} base64 - Base64 encoded string
   * @returns {Uint8Array} - Byte array
   */
  static base64ToUint8Array(base64) {
    try {
      // Decode base64 to binary string
      const binaryString = atob(base64);
      
      // Convert to Uint8Array
      const uint8Array = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }
      
      return uint8Array;
    } catch (error) {
      console.error('Error converting from base64:', error);
      throw new Error('Failed to convert from base64: ' + error.message);
    }
  }

  /**
   * Compress multiple text chunks efficiently
   * @param {string[]} chunks - Array of text chunks
   * @returns {Uint8Array[]} - Array of compressed chunks
   */
  static compressChunks(chunks) {
    try {
      if (!Array.isArray(chunks)) {
        throw new Error('Chunks must be an array');
      }
      
      return chunks.map((chunk, index) => {
        try {
          return this.compress(chunk);
        } catch (error) {
          console.error(`Error compressing chunk ${index}:`, error);
          throw new Error(`Failed to compress chunk ${index}: ${error.message}`);
        }
      });
    } catch (error) {
      console.error('Error compressing chunks:', error);
      throw error;
    }
  }

  /**
   * Decompress multiple compressed chunks
   * @param {Uint8Array[]} compressedChunks - Array of compressed chunks
   * @returns {string[]} - Array of decompressed text chunks
   */
  static decompressChunks(compressedChunks) {
    try {
      if (!Array.isArray(compressedChunks)) {
        throw new Error('Compressed chunks must be an array');
      }
      
      return compressedChunks.map((chunk, index) => {
        try {
          return this.decompress(chunk);
        } catch (error) {
          console.error(`Error decompressing chunk ${index}:`, error);
          throw new Error(`Failed to decompress chunk ${index}: ${error.message}`);
        }
      });
    } catch (error) {
      console.error('Error decompressing chunks:', error);
      throw error;
    }
  }

  /**
   * Test compression and decompression with sample data
   * Useful for verifying the service works correctly
   * @returns {boolean} - True if test passes
   */
  static runSelfTest() {
    try {
      const testData = 'This is a test string for compression. It should compress and decompress correctly. Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
      
      console.log('Running CompressionService self-test...');
      
      // Test basic compression/decompression
      const compressed = this.compress(testData);
      const decompressed = this.decompress(compressed);
      
      if (decompressed !== testData) {
        console.error('Self-test failed: Basic compression/decompression mismatch');
        return false;
      }
      
      // Test base64 compression/decompression
      const base64Compressed = this.compressToBase64(testData);
      const base64Decompressed = this.decompressFromBase64(base64Compressed);
      
      if (base64Decompressed !== testData) {
        console.error('Self-test failed: Base64 compression/decompression mismatch');
        return false;
      }
      
      // Test compression stats
      const stats = this.getCompressionStats(testData);
      if (stats.originalSize === 0 || stats.compressedSize === 0) {
        console.error('Self-test failed: Invalid compression stats');
        return false;
      }
      
      console.log('CompressionService self-test passed!');
      console.log(`Original size: ${stats.originalSize} bytes`);
      console.log(`Compressed size: ${stats.compressedSize} bytes`);
      console.log(`Compression ratio: ${stats.compressionRatio}`);
      console.log(`Space saved: ${stats.percentSaved}%`);
      
      return true;
    } catch (error) {
      console.error('Self-test failed with error:', error);
      return false;
    }
  }
}

// Character count: 10856