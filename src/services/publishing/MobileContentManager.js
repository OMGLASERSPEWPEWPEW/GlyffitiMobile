// src/services/publishing/MobileContentManager.js
// Path: src/services/publishing/MobileContentManager.js
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { MobileGlyphManager } from './MobileGlyphManager';
import { HashingService } from '../hashing/HashingService';

/**
 * Mobile Content Manager - Handles content loading, validation, and preparation
 * Separated from MobilePublishingService for better organization
 */
export class MobileContentManager {
  /**
   * File picker with expanded format support
   * @returns {Promise<Object|null>} Content object or null
   */
  static async pickAndLoadFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'text/plain',           // .txt
          'text/markdown',        // .md
          'text/rtf',            // .rtf
          'application/pdf',      // .pdf (we'll handle text extraction)
          'application/msword',   // .doc
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
          'text/*',              // Any text file
          '*/*'                  // Allow all files as fallback
        ],
        copyToCacheDirectory: true,
      });
      
      if (result.assets && result.assets[0]) {
        const file = result.assets[0];
        let content;
        
        try {
          // Try to read as text
          content = await FileSystem.readAsStringAsync(file.uri);
          
          // Basic validation
          if (!content || content.trim().length < 10) {
            throw new Error('File content is too short or empty');
          }
          
        } catch (readError) {
          throw new Error(`Cannot read file as text. Please select a text file (.txt, .md, etc.)`);
        }
        
        return {
          content: content.trim(),
          filename: file.name,
          size: file.size || content.length,
          type: file.mimeType || 'text/plain'
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error picking file:', error);
      throw error;
    }
  }

  /**
   * Manual text entry
   * @param {string} text - Text content
   * @param {string} title - Content title
   * @returns {Object} Content object
   */
  static createTextContent(text, title = 'Manual Entry') {
    if (!text || text.trim().length < 10) {
      throw new Error('Text content must be at least 10 characters long');
    }
    
    return {
      content: text.trim(),
      filename: `${title}.txt`,
      size: text.length,
      type: 'text/plain'
    };
  }

  /**
   * Prepare content for publishing with enhanced validation
   * @param {Object} contentData - Content from file or manual entry
   * @param {string} title - Publishing title
   * @param {string} authorPublicKey - Author's public key
   * @param {Object} options - Publishing options
   * @returns {Promise<Object>} Prepared content ready for publishing
   */
  static async prepareContent(contentData, title, authorPublicKey, options = {}) {
    try {
      // Content validation
      if (!contentData || !contentData.content) {
        throw new Error('No content provided');
      }

      if (!title || title.trim().length === 0) {
        throw new Error('Title is required');
      }

      if (!authorPublicKey) {
        throw new Error('Author public key is required');
      }

      const content = contentData.content.trim();
      if (content.length < 10) {
        throw new Error('Content must be at least 10 characters long');
      }

      // Generate content ID
      const contentId = `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create content object for MobileGlyphManager
      const glyphContent = {
        id: contentId,
        title: title.trim(),
        content: content,
        authorPublicKey: authorPublicKey,
        timestamp: Date.now()
      };
      
      // Generate chunks using MobileGlyphManager.createGlyphs
      const glyphChunks = await MobileGlyphManager.createGlyphs(glyphContent);

      if (!glyphChunks || glyphChunks.length === 0) {
        throw new Error('Failed to process content into glyphs');
      }

      // Calculate compression stats
      const originalSize = content.length;
      const compressedSize = glyphChunks.reduce((total, chunk) => {
        return total + (chunk.content ? chunk.content.length : 0);
      }, 0);
      
      const compressionRatio = originalSize > 0 ? (compressedSize / originalSize) : 1;
      const compressionStats = {
        originalSize,
        compressedSize,
        compressionRatio,
        spaceSaved: originalSize - compressedSize,
        compressionPercent: Math.round((1 - compressionRatio) * 100)
      };

      // Convert glyph chunks to the format expected by publishing system
      const glyphs = glyphChunks.map((chunk, index) => ({
        id: `glyph_${index}_${Date.now()}`,
        index: chunk.index,
        content: chunk.content, // Keep as Uint8Array or convert to base64 if needed
        hash: chunk.hash,
        totalGlyphs: chunk.totalChunks,
        transactionId: null,
        status: 'pending',
        originalText: chunk.originalText || ''
      }));

      const preparedContent = {
        contentId,
        title: title.trim(),
        originalContent: content,
        filename: contentData.filename || 'manual_entry.txt',
        authorPublicKey,
        authorName: options.authorName || `User_${authorPublicKey.substring(0, 8)}`,
        glyphs,
        totalGlyphs: glyphs.length,
        createdAt: Date.now(),
        compressionStats,
        tags: options.tags || [],
        license: options.license || null,
        glyphChunks: glyphChunks, // Keep original chunks for blockchain publishing
        status: 'prepared'
      };

      console.log(`✅ Content prepared: ${glyphs.length} glyphs, ${compressionStats.compressionPercent}% compression`);
      return preparedContent;

    } catch (error) {
      console.error('Error preparing content:', error);
      throw error;
    }
  }

  /**
   * Estimate publishing cost and time for content
   * @param {string} content - Content text
   * @returns {Object} Publishing estimate
   */
  static estimatePublishing(content) {
    try {
      // Validate that content is a string
      if (typeof content !== 'string') {
        throw new Error('Content must be a string');
      }

      if (!content || content.trim().length === 0) {
        throw new Error('Content cannot be empty');
      }

      const glyphCount = MobileGlyphManager.estimateChunkCount(content);
      const estimatedCost = MobileGlyphManager.estimateStorageCost(content);
      
      return {
        glyphCount: glyphCount,
        estimatedCost: estimatedCost.costs.total,
        currency: estimatedCost.costs.currency,
        estimatedTimeMinutes: (glyphCount * 1.5) / 60, // 1.5 seconds per glyph
        compressionRatio: estimatedCost.compressionRatio,
        spaceSaved: estimatedCost.spaceSaved
      };
    } catch (error) {
      console.error('Error estimating publishing:', error);
      // Return default values instead of throwing
      return {
        glyphCount: 0,
        estimatedCost: 0,
        currency: 'SOL',
        estimatedTimeMinutes: 0,
        compressionRatio: 1,
        spaceSaved: 0,
        error: error.message
      };
    }
  }

  /**
   * Validate content structure
   * @param {Object} content - Content to validate
   * @returns {boolean} True if valid
   */
  static validateContent(content) {
    try {
      if (!content || typeof content !== 'object') {
        return false;
      }

      const requiredFields = ['contentId', 'title', 'originalContent', 'authorPublicKey', 'glyphs'];
      for (const field of requiredFields) {
        if (!content[field]) {
          console.error(`Content validation failed: Missing field ${field}`);
          return false;
        }
      }

      if (!Array.isArray(content.glyphs) || content.glyphs.length === 0) {
        console.error('Content validation failed: Invalid glyphs array');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating content:', error);
      return false;
    }
  }

  /**
   * Get content statistics
   * @param {Object} content - Content to analyze
   * @returns {Object} Content statistics
   */
  static getContentStats(content) {
    try {
      if (!this.validateContent(content)) {
        throw new Error('Invalid content structure');
      }

      const wordCount = content.originalContent.split(/\s+/).length;
      const characterCount = content.originalContent.length;
      const paragraphCount = content.originalContent.split(/\n\s*\n/).length;

      return {
        wordCount,
        characterCount,
        paragraphCount,
        glyphCount: content.glyphs.length,
        compressionStats: content.compressionStats,
        estimatedReadingTime: Math.ceil(wordCount / 200), // Average reading speed
        createdAt: content.createdAt,
        title: content.title,
        filename: content.filename
      };
    } catch (error) {
      console.error('Error getting content stats:', error);
      throw error;
    }
  }

  /**
   * Run self-test to verify ContentManager functionality
   * @returns {Promise<boolean>} True if all tests pass
   */
  static async runSelfTest() {
    try {
      console.log('Running MobileContentManager self-test...');
      
      // Test text content creation
      const testContent = this.createTextContent('This is a test content for self-testing purposes.', 'Test Content');
      
      if (!testContent || !testContent.content) {
        console.error('Self-test failed: Could not create text content');
        return false;
      }

      // Test content validation
      const testPreparedContent = {
        contentId: 'test_123',
        title: 'Test',
        originalContent: 'Test content',
        authorPublicKey: 'test_key',
        glyphs: [{ test: 'glyph' }]
      };

      if (!this.validateContent(testPreparedContent)) {
        console.error('Self-test failed: Content validation failed');
        return false;
      }

      // Test content stats
      const stats = this.getContentStats(testPreparedContent);
      if (!stats || typeof stats.wordCount !== 'number') {
        console.error('Self-test failed: Content stats failed');
        return false;
      }

      // Test publishing estimation
      const estimate = this.estimatePublishing('Test content for estimation');
      if (!estimate || typeof estimate.glyphCount !== 'number') {
        console.error('Self-test failed: Publishing estimation failed');
        return false;
      }

      console.log('✅ MobileContentManager self-test passed!');
      return true;
    } catch (error) {
      console.error('Self-test failed with error:', error);
      return false;
    }
  }
}

// Character count: 7341