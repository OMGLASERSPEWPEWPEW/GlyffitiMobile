// __tests__/__mocks__/react-native-get-random-values.js
// Path: __tests__/__mocks__/react-native-get-random-values.js

/**
 * Mock implementation of react-native-get-random-values for testing
 * Provides predictable random values for consistent test results
 */

// Mock the global crypto.getRandomValues function
const mockGetRandomValues = jest.fn((array) => {
  // Fill with predictable values for testing
  for (let i = 0; i < array.length; i++) {
    array[i] = (i * 17) % 256; // Predictable pattern
  }
  return array;
});

// Set up the global crypto object if it doesn't exist
if (typeof global.crypto === 'undefined') {
  global.crypto = {};
}

// Add the getRandomValues method
global.crypto.getRandomValues = mockGetRandomValues;

// Export for direct usage if needed
export default mockGetRandomValues;

// Also export the function for explicit imports
export { mockGetRandomValues as getRandomValues };

// 731 characters