// src/services/publishing/ContentService.js
// Path: src/services/publishing/ContentService.js
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { MobileGlyphManager } from '../publishing/MobileGlyphManager';

/**
 * Content Service - Handles content loading, validation, and preparation
 * Consolidates content-related functionality for better organization
 */
export class ContentService {
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
          'text/rtf',             // .rtf
          'application/pdf',      // .pdf (text extraction handled elsewhere)
          'application/msword',   // .doc
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
          'text/*'                // Any text file
        ],
        copyToCacheDirectory: true,
        multiple: false
      });

      if (result.canceled) {
        return null;
      }

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

      // ✅ FIX #1: Normalize glyphs to what MobileBlockchainPublisher expects
      const glyphs = glyphChunks.map((chunk, index) => ({
        id: `glyph_${index}_${Date.now()}`,
        index: (typeof chunk.index === 'number') ? chunk.index : index,
        content: chunk.content,
        hash: chunk.hash,
        totalGlyphs: glyphChunks.length,
        transactionId: null,
        status: 'pending',
        originalText: chunk.originalText || ''
      }));

      // Calculate compression stats
      const originalSize = content.length;
      const compressedSize = glyphChunks.reduce((total, chunk) => {
        return total + (chunk.content ? chunk.content.length : 0);
      }, 0);
      
      const compressionRatio = originalSize > 0 ? 
        (compressedSize / originalSize).toFixed(2) : 0;
      
      const percentSaved = originalSize > 0 ? 
        ((1 - compressedSize / originalSize) * 100).toFixed(1) : 0;

      // Create final content object
      const preparedContent = {
        contentId,
        title: title.trim(),
        originalContent: content,
        authorPublicKey,
        authorName: options.authorName || 'Anonymous',
        timestamp: Date.now(),
        createdAt: new Date().toISOString(),
        metadata: {
          filename: contentData.filename,
          size: contentData.size,
          type: contentData.type,
          wordCount: content.split(/\s+/).length,
          characterCount: content.length,
          estimatedReadingTime: Math.ceil(content.split(/\s+/).length / 200)
        },
        // ✅ FIX #2: Use normalized glyphs, also include raw chunks & totalGlyphs
        glyphs: glyphs,
        glyphChunks,
        totalGlyphs: glyphs.length,

        compressionStats: {
          originalSize,
          compressedSize,
          compressionRatio: parseFloat(compressionRatio),
          percentSaved: parseFloat(percentSaved)
        }
      };

      console.log(`✅ Content prepared successfully:`);
      console.log(`   - Content ID: ${contentId}`);
      console.log(`   - Title: ${title}`);
      console.log(`   - Glyphs: ${glyphChunks.length}`);
      console.log(`   - Compression: ${percentSaved}% saved`);

      return preparedContent;
    } catch (error) {
      console.error('Error preparing content:', error);
      throw error;
    }
  }

  /**
   * Estimate publishing requirements for content
   * @param {string} contentText - Content to estimate
   * @returns {Promise<Object>} Estimate data
   */
  static async estimatePublishing(contentText) {
    try {
      if (!contentText || contentText.trim().length === 0) {
        throw new Error('No content provided for estimation');
      }

      const tempContent = {
        id: 'temp_estimate',
        title: 'Temp',
        content: contentText.trim(),
        authorPublicKey: 'temp_key',
        timestamp: Date.now()
      };

      const glyphChunks = await MobileGlyphManager.createGlyphs(tempContent);
      const glyphCount = glyphChunks.length;

      // Estimate cost (placeholder - replace with actual fee logic)
      const estimatedCost = {
        lamports: glyphCount * 5000,
        sol: (glyphCount * 5000) / 1_000_000_000,
        compressionRatio: glyphCount > 0 ? glyphChunks.reduce((sum, g) => sum + (g.content?.length || 0), 0) / contentText.length : 1,
        spaceSaved: Math.max(0, contentText.length - glyphChunks.reduce((sum, g) => sum + (g.content?.length || 0), 0))
      };

      return {
        glyphCount,
        estimatedCost: estimatedCost.sol,
        currency: 'SOL',
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
        filename: content.metadata?.filename || 'N/A'
      };
    } catch (error) {
      console.error('Error getting content stats:', error);
      throw error;
    }
  }

  /**
   * Run self-test to verify ContentService functionality
   * @returns {Promise<boolean>} True if all tests pass
   */
  static async runSelfTest() {
    try {
      console.log('Running ContentService self-test...');
      
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

      console.log('✅ ContentService self-test passed!');
      return true;
    } catch (error) {
      console.error('Self-test failed with error:', error);
      return false;
    }
  }

  /**
   * Get service information
   * @returns {Object} Service information
   */
  static getServiceInfo() {
    return {
      name: 'ContentService',
      version: '1.0.0',
      capabilities: [
        'File loading with format support',
        'Manual text entry',
        'Content preparation and validation',
        'Publishing estimation',
        'Content statistics',
        'Compression analysis'
      ],
      supportedFormats: [
        '.txt', '.md', '.rtf', '.pdf', '.doc', '.docx'
      ]
    };
  }
}

// Character count: 10831
