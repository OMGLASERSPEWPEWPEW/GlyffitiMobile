// __tests__/__mocks__/expo-secure-store.js
// Path: __tests__/__mocks__/expo-secure-store.js

/**
 * Mock implementation of Expo SecureStore for testing
 * Simulates secure storage without actually storing sensitive data during tests
 */

const mockStorage = new Map();

export const setItemAsync = jest.fn(async (key, value, options = {}) => {
  if (typeof key !== 'string') {
    throw new Error('Key must be a string');
  }
  if (typeof value !== 'string') {
    throw new Error('Value must be a string');
  }
  
  mockStorage.set(key, value);
  return Promise.resolve();
});

export const getItemAsync = jest.fn(async (key, options = {}) => {
  if (typeof key !== 'string') {
    throw new Error('Key must be a string');
  }
  
  const value = mockStorage.get(key);
  return Promise.resolve(value || null);
});

export const deleteItemAsync = jest.fn(async (key, options = {}) => {
  if (typeof key !== 'string') {
    throw new Error('Key must be a string');
  }
  
  mockStorage.delete(key);
  return Promise.resolve();
});

export const isAvailableAsync = jest.fn(async () => {
  return Promise.resolve(true);
});

// Test utilities (not part of real SecureStore API)
export const __clearMockStorage = () => {
  mockStorage.clear();
};

export const __getMockStorageState = () => {
  const state = {};
  for (const [key, value] of mockStorage.entries()) {
    state[key] = value;
  }
  return state;
};

// Default export
const SecureStore = {
  setItemAsync,
  getItemAsync,
  deleteItemAsync,
  isAvailableAsync,
  __clearMockStorage,
  __getMockStorageState
};

export default SecureStore;

// 1,370 characters