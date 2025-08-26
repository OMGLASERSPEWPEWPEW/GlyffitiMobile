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
   * ✅ FIXED: Return actual text chunk, not just calculate position
   * @param {string} text - Full text
   * @param {number} start - Start position
   * @param {number} end - End position
   * @returns {string} Text chunk with natural break
   */
  static findNaturalBreakPoint(text, start, end) {
    // If we're at the end of text, return the remaining text
    if (end >= text.length) {
      return text.slice(start);
    }
    
    // Get the initial target chunk
    const targetChunk = text.slice(start, end);
    
    // Look for natural breaking points within the last 200 characters
    // ✅ FIXED: Search within target chunk, not arbitrary search window
    const searchLength = Math.min(200, targetChunk.length);
    const searchStart = Math.max(0, targetChunk.length - searchLength);
    const searchText = targetChunk.slice(searchStart);
    
    // Priority order: paragraph break, sentence break, word break
    const paragraphBreak = searchText.lastIndexOf('\n\n');
    if (paragraphBreak !== -1) {
      const breakPoint = searchStart + paragraphBreak + 2;
      return targetChunk.slice(0, breakPoint);
    }
    
    const sentenceBreak = searchText.lastIndexOf('. ');
    if (sentenceBreak !== -1) {
      const breakPoint = searchStart + sentenceBreak + 2;
      return targetChunk.slice(0, breakPoint);
    }
    
    // Look for other sentence endings
    const questionBreak = searchText.lastIndexOf('? ');
    if (questionBreak !== -1) {
      const breakPoint = searchStart + questionBreak + 2;
      return targetChunk.slice(0, breakPoint);
    }
    
    const exclamationBreak = searchText.lastIndexOf('! ');
    if (exclamationBreak !== -1) {
      const breakPoint = searchStart + exclamationBreak + 2;
      return targetChunk.slice(0, breakPoint);
    }
    
    const wordBreak = searchText.lastIndexOf(' ');
    if (wordBreak !== -1 && wordBreak > searchLength * 0.5) {
      const breakPoint = searchStart + wordBreak + 1;
      return targetChunk.slice(0, breakPoint);
    }
    
    // ✅ FIXED: If no good break found, return target chunk as-is
    // This prevents infinite loops and ensures all text is captured
    return targetChunk;
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
   * Split text into chunks for merkle tree processing
   * Intelligently splits large content at natural boundaries
   * @param {string} text - Text to chunk
   * @param {number} targetChunkSize - Target size for each chunk (default 250 chars)
   * @returns {string[]} Array of text chunks
   */
  static chunkText(text, targetChunkSize = 250) {
    console.log('TextProcessor.chunkText: Processing text for merkle chunks');
    
    if (!text || typeof text !== 'string') {
      throw new Error('Text must be a non-empty string');
    }
    
    const preprocessed = this.preprocessText(text);
    const chunks = [];
    let currentPosition = 0;
    
    while (currentPosition < preprocessed.length) {
      const remainingLength = preprocessed.length - currentPosition;
      const targetEnd = Math.min(currentPosition + targetChunkSize, preprocessed.length);
      
      let chunkText;
      
      // If this is the last chunk or close to end, take everything remaining
      if (remainingLength <= targetChunkSize * 1.2) {
        chunkText = preprocessed.slice(currentPosition);
      } else {
        // Find natural break point
        chunkText = this.findNaturalBreakPoint(
          preprocessed, 
          currentPosition, 
          targetEnd
        );
      }
      
      chunks.push(chunkText);
      currentPosition += chunkText.length;
    }
    
    console.log(`TextProcessor.chunkText: Created ${chunks.length} chunks from ${preprocessed.length} characters`);
    return chunks;
  }
}

// Character count: 4230