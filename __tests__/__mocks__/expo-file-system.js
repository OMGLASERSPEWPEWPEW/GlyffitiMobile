// __tests__/__mocks__/expo-file-system.js
// Path: __tests__/__mocks__/expo-file-system.js

/**
 * Mock implementation of Expo FileSystem for testing
 * Simulates file system operations without actual file I/O
 */

export const readAsStringAsync = jest.fn(async (fileUri, options = {}) => {
  // Return mock file content based on URI
  if (fileUri.includes('.txt')) {
    return Promise.resolve('Mock text file content from FileSystem');
  }
  if (fileUri.includes('.json')) {
    return Promise.resolve('{"mock": "json content"}');
  }
  return Promise.resolve('Mock file content');
});

export const writeAsStringAsync = jest.fn(async (fileUri, contents, options = {}) => {
  // Simulate successful write
  return Promise.resolve();
});

export const deleteAsync = jest.fn(async (fileUri, options = {}) => {
  // Simulate successful deletion
  return Promise.resolve();
});

export const makeDirectoryAsync = jest.fn(async (fileUri, options = {}) => {
  // Simulate successful directory creation
  return Promise.resolve();
});

export const getInfoAsync = jest.fn(async (fileUri, options = {}) => {
  // Return mock file info
  return Promise.resolve({
    exists: true,
    uri: fileUri,
    size: 1024,
    isDirectory: false,
    modificationTime: Date.now()
  });
});

export const documentDirectory = 'mock://document/directory/';
export const cacheDirectory = 'mock://cache/directory/';

// Default export
const FileSystem = {
  readAsStringAsync,
  writeAsStringAsync,
  deleteAsync,
  makeDirectoryAsync,
  getInfoAsync,
  documentDirectory,
  cacheDirectory
};

export default FileSystem;

// 1,406 characters