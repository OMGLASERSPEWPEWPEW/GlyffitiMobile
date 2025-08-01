// src/services/glyph/processing/TextProcessor.js
// Path: src/services/glyph/processing/TextProcessor.js

/**
 * Text Processing - Handles text preprocessing, cleaning, and natural break finding
 * Extracted from GlyphService.js for better organization
 */
export class TextProcessor {
  /**
   * Pre-process text for optimal chunking
   * @param {string} text - Raw text to process
   * @returns {string} Processed text
   */
  static preprocessText(text) {
    if (typeof text !== 'string') {
      throw new Error('Text must be a string');
    }
    
    // Apply dialog formatting cleanup
    text = this.cleanDialogBreaks(text);
    
    // Normalize line endings
    text = text.replace(/\r\n/g, '\n');
    
    // Remove excessive whitespace but preserve intentional formatting
    text = text.replace(/[ \t]+/g, ' '); // Multiple spaces/tabs to single space
    text = text.replace(/\n[ \t]+/g, '\n'); // Remove leading whitespace on lines
    text = text.replace(/[ \t]+\n/g, '\n'); // Remove trailing whitespace on lines
    
    // Normalize paragraph breaks (max 2 consecutive newlines)
    text = text.replace(/\n{3,}/g, '\n\n');
    
    // Trim overall
    text = text.trim();
    
    return text;
  }
  
  /**
   * Clean up dialog breaks and formatting issues
   * @param {string} text - Text to clean
   * @returns {string} Cleaned text
   */
  static cleanDialogBreaks(text) {
    // Remove awkward breaks in dialog
    text = text.replace(/"\s*\n\s*([a-z])/g, ' $1');
    
    // Fix broken quotes
    text = text.replace(/"\s+"/g, '" "');
    
    // Ensure proper spacing around dialog
    text = text.replace(/([.!?])\s*"\s*([A-Z])/g, '$1" $2');
    
    return text;
  }
  
  /**
   * Find natural breaking points in text to avoid splitting words/sentences
   * @param {string} text - Full text
   * @param {number} start - Start position
   * @param {number} end - End position
   * @returns {string} Text chunk with natural break
   */
  static findNaturalBreakPoint(text, start, end) {
    const originalChunk = text.slice(start, end);
    
    // If we're at the end of text, return as-is
    if (end >= text.length) {
      return originalChunk;
    }
    
    // Look for natural breaking points within the last 100 characters
    const searchStart = Math.max(start, end - 100);
    const searchText = text.slice(searchStart, end);
    
    // Priority order: paragraph break, sentence break, word break
    const paragraphBreak = searchText.lastIndexOf('\n\n');
    if (paragraphBreak !== -1) {
      const breakPoint = searchStart + paragraphBreak + 2;
      return text.slice(start, breakPoint);
    }
    
    const sentenceBreak = searchText.lastIndexOf('.');
    if (sentenceBreak !== -1) {
      const breakPoint = searchStart + sentenceBreak + 2;
      return text.slice(start, breakPoint);
    }
    
    const wordBreak = searchText.lastIndexOf(' ');
    if (wordBreak !== -1) {
      const breakPoint = searchStart + wordBreak + 1;
      return text.slice(start, breakPoint);
    }
    
    // No natural break found, return original chunk
    return originalChunk;
  }
  
  /**
   * Clean up reassembled text to fix any artifacts from chunking
   * @param {string} text - Reassembled text
   * @returns {string} Cleaned text
   */
  static cleanupReassembledText(text) {
    // Remove any duplicate spaces that might have been introduced
    text = text.replace(/\s+/g, ' ');
    
    // Fix any broken paragraph formatting
    text = text.replace(/\n{3,}/g, '\n\n');
    
    // Trim
    text = text.trim();
    
    return text;
  }
  
  /**
   * Estimate the number of chunks a piece of content will require
   * @param {string} content - Content to estimate
   * @param {number} targetChunkSize - Target size for chunks
   * @returns {number} Estimated chunk count
   */
  static estimateChunkCount(content, targetChunkSize) {
    const processedContent = this.preprocessText(content);
    return Math.ceil(processedContent.length / targetChunkSize);
  }
}

// Character count: 3426