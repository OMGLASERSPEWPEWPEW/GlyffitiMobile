// __tests__/setup.js
// Path: __tests__/setup.js

/**
 * Global test setup file
 * Runs before every test to set up mocks and global configurations
 * This ensures consistent testing environment across all tests
 */

// Mock React Native's Alert for testing
import { Alert } from 'react-native';

// Note: React Native Testing Library v12.4+ includes built-in Jest matchers
// No need to import additional matchers

// Global console setup for better test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Suppress known React Native warnings during tests
console.error = (...args) => {
  // Suppress common React Native testing warnings
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
     args[0].includes('Warning: React.createFactory() is deprecated') ||
     args[0].includes('componentWillReceiveProps has been renamed'))
  ) {
    return;
  }
  originalConsoleError.call(console, ...args);
};

console.warn = (...args) => {
  // Suppress common warnings during testing
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: componentWillMount has been renamed') ||
     args[0].includes('source.uri should not be an empty string'))
  ) {
    return;
  }
  originalConsoleWarn.call(console, ...args);
};

// Mock Alert.alert globally
jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
  // For testing, we just log the alert instead of showing it
  console.log('MOCK ALERT:', { title, message, buttons });
  
  // If there are buttons, simulate pressing the first one
  if (buttons && buttons.length > 0 && buttons[0].onPress) {
    buttons[0].onPress();
  }
});

// Mock setTimeout/clearTimeout for faster tests
global.setTimeout = jest.fn((callback) => {
  if (typeof callback === 'function') {
    callback();
  }
  return 'mock-timeout-id';
});

global.clearTimeout = jest.fn();

// Mock setInterval/clearInterval
global.setInterval = jest.fn((callback) => {
  if (typeof callback === 'function') {
    callback();
  }
  return 'mock-interval-id';
});

global.clearInterval = jest.fn();

// Global test utilities
global.testUtils = {
  // Helper to create mock content objects
  createMockContent: (overrides = {}) => ({
    contentId: 'test_content_' + Date.now(),
    title: 'Test Content',
    originalContent: 'This is test content for testing purposes.',
    authorPublicKey: 'test_author_public_key_12345678',
    createdAt: Date.now(),
    version: '1.0.0',
    ...overrides
  }),
  
  // Helper to create mock published content
  createMockPublishedContent: (overrides = {}) => ({
    contentId: 'test_published_' + Date.now(),
    title: 'Test Published Content',
    originalContent: 'This is published test content.',
    glyphs: [
      { index: 0, transactionId: 'mock_tx_1', hash: 'mock_hash_1' },
      { index: 1, transactionId: 'mock_tx_2', hash: 'mock_hash_2' }
    ],
    authorPublicKey: 'test_author_public_key_12345678',
    createdAt: Date.now(),
    publishedAt: Date.now(),
    compressionType: 'gzip',
    status: 'published',
    ...overrides
  }),
  
  // Helper to create mock scroll manifest
  createMockScrollManifest: (overrides = {}) => ({
    storyId: 'test_story_' + Date.now(),
    title: 'Test Story',
    author: 'test_author...12345678',
    authorPublicKey: 'test_author_public_key_12345678',
    glyphs: [
      { index: 0, transactionId: 'mock_tx_1', hash: 'mock_hash_1' },
      { index: 1, transactionId: 'mock_tx_2', hash: 'mock_hash_2' }
    ],
    timestamp: Date.now(),
    previewText: 'This is a preview of the test story...',
    tags: ['test', 'story'],
    version: '1.0.0',
    ...overrides
  }),
  
  // Helper to wait for async operations
  waitFor: (ms = 0) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Helper to create promises that resolve/reject for testing
  createResolvedPromise: (value) => Promise.resolve(value),
  createRejectedPromise: (error) => Promise.reject(error)
};

// Global test constants
global.testConstants = {
  MOCK_WALLET_PUBLIC_KEY: 'test_wallet_public_key_abcdef1234567890',
  MOCK_TRANSACTION_ID: 'mock_transaction_id_1234567890abcdef',
  MOCK_HASH: 'mock_content_hash_abcdef1234567890',
  MOCK_CONTENT_ID: 'test_content_id_1234567890',
  MOCK_STORY_ID: 'test_story_id_1234567890'
};

// Clean up after each test
afterEach(() => {
  // Clear all mocks after each test
  jest.clearAllMocks();
  
  // Reset any global state if needed
  // This ensures tests don't interfere with each other
});

// Setup complete
console.log('🧪 Test setup complete - Ready for testing!');

// 4,425 characters