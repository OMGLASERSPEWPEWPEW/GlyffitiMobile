// __tests__/__mocks__/expo-document-picker.js
// Path: __tests__/__mocks__/expo-document-picker.js

/**
 * Mock implementation of Expo DocumentPicker for testing
 * Simulates file picking without actual file system interaction
 */

export const getDocumentAsync = jest.fn(async (options = {}) => {
  // Simulate successful file selection
  return Promise.resolve({
    type: 'success',
    name: 'mock-document.txt',
    size: 1024,
    uri: 'mock://document/path',
    mimeType: 'text/plain'
  });
});

export const DocumentPickerOptions = {
  copyToCacheDirectory: true,
  type: '*/*',
  multiple: false
};

// Default export
const DocumentPicker = {
  getDocumentAsync,
  DocumentPickerOptions
};

export default DocumentPicker;

// 642 characters