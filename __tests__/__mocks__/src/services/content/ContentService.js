// __tests__/__mocks__/src/services/content/ContentService.js
// Path: __tests__/__mocks__/src/services/content/ContentService.js

/**
 * Mock implementation of ContentService for testing
 * Provides predictable responses for all ContentService methods
 */

export const ContentService = {
  // Content creation methods
  createTextContent: jest.fn((text, title = 'Manual Entry') => ({
    content: text.trim(),
    filename: `${title}.txt`,
    size: text.length,
    type: 'text/plain'
  })),

  pickAndLoadFile: jest.fn(() => Promise.resolve({
    content: 'Mock file content loaded from picker',
    filename: 'mock-file.txt',
    size: 37,
    type: 'text/plain'
  })),

  // Content processing methods  
  prepareContent: jest.fn((contentData, title, authorPublicKey, options = {}) => {
    // Handle invalid input like the real service would
    if (!contentData || !contentData.content) {
      return Promise.reject(new Error('No content provided'));
    }
    if (!title || title.trim().length === 0) {
      return Promise.reject(new Error('Title is required'));
    }
    if (!authorPublicKey) {
      return Promise.reject(new Error('Author public key is required'));
    }
    
    return Promise.resolve({
      contentId: `prepared_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      originalContent: contentData.content,
      glyphs: [
        { 
          index: 0, 
          content: 'mock_compressed_chunk_1',
          hash: 'mock_hash_1',
          transactionId: null
        },
        { 
          index: 1, 
          content: 'mock_compressed_chunk_2', 
          hash: 'mock_hash_2',
          transactionId: null
        }
      ],
      authorPublicKey: authorPublicKey,
      createdAt: Date.now(),
      status: 'prepared',
      compressionType: 'gzip',
      totalChunks: 2
    });
  }),

  validateContent: jest.fn(() => true),

  getContentStats: jest.fn((content) => ({
    characterCount: content?.content?.length || 0,
    wordCount: content?.content?.split(' ').length || 0,
    estimatedChunks: Math.ceil((content?.content?.length || 0) / 500),
    estimatedCost: ((content?.content?.length || 0) / 1000) * 0.001
  })),

  estimatePublishing: jest.fn((content) => ({
    chunks: Math.ceil(content.length / 500),
    estimatedCost: (content.length / 1000) * 0.001,
    estimatedTime: Math.ceil(content.length / 500) * 2
  })),

  // File processing methods
  processPDF: jest.fn(() => Promise.resolve('Mock PDF content extracted')),
  processWordDocument: jest.fn(() => Promise.resolve('Mock Word document content')),
  processRTF: jest.fn(() => 'Mock RTF content processed'),
  cleanText: jest.fn((text) => text.trim()),

  // Utility methods
  runSelfTest: jest.fn(() => Promise.resolve(true)),
  getServiceInfo: jest.fn(() => ({
    name: 'ContentService',
    version: '1.0.0',
    status: 'mock'
  }))
};

export default ContentService;

// 2,224 characters