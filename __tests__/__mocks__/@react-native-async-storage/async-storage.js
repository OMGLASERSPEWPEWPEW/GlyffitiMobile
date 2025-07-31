// __tests__/__mocks__/@react-native-async-storage/async-storage.js
// Path: __tests__/__mocks__/@react-native-async-storage/async-storage.js

/**
 * Mock implementation of React Native AsyncStorage for testing
 * Simulates the real AsyncStorage behavior but stores data in memory
 * This allows tests to run without actual device storage
 */

class MockAsyncStorage {
  constructor() {
    this.storage = new Map();
  }

  /**
   * Store a string value with the given key
   * @param {string} key - Storage key
   * @param {string} value - Value to store (must be string)
   * @returns {Promise<void>}
   */
  async setItem(key, value) {
    if (typeof key !== 'string') {
      throw new Error('Key must be a string');
    }
    
    if (typeof value !== 'string') {
      throw new Error('Value must be a string');
    }
    
    this.storage.set(key, value);
    return Promise.resolve();
  }

  /**
   * Get a string value for the given key
   * @param {string} key - Storage key
   * @returns {Promise<string|null>} The value or null if not found
   */
  async getItem(key) {
    if (typeof key !== 'string') {
      throw new Error('Key must be a string');
    }
    
    const value = this.storage.get(key);
    return Promise.resolve(value !== undefined ? value : null);
  }

  /**
   * Remove an item for the given key
   * @param {string} key - Storage key
   * @returns {Promise<void>}
   */
  async removeItem(key) {
    if (typeof key !== 'string') {
      throw new Error('Key must be a string');
    }
    
    this.storage.delete(key);
    return Promise.resolve();
  }

  /**
   * Merge an existing value with an input value
   * @param {string} key - Storage key  
   * @param {string} value - Value to merge (JSON string)
   * @returns {Promise<void>}
   */
  async mergeItem(key, value) {
    if (typeof key !== 'string') {
      throw new Error('Key must be a string');
    }
    
    if (typeof value !== 'string') {
      throw new Error('Value must be a string');
    }
    
    const existingValue = await this.getItem(key);
    let mergedValue;
    
    if (existingValue) {
      try {
        const existingObj = JSON.parse(existingValue);
        const newObj = JSON.parse(value);
        mergedValue = JSON.stringify({ ...existingObj, ...newObj });
      } catch (error) {
        // If either value isn't valid JSON, just use the new value
        mergedValue = value;
      }
    } else {
      mergedValue = value;
    }
    
    this.storage.set(key, mergedValue);
    return Promise.resolve();
  }

  /**
   * Clear all storage
   * @returns {Promise<void>}
   */
  async clear() {
    this.storage.clear();
    return Promise.resolve();
  }

  /**
   * Get all keys
   * @returns {Promise<string[]>} Array of all keys
   */
  async getAllKeys() {
    return Promise.resolve(Array.from(this.storage.keys()));
  }

  /**
   * Get multiple items
   * @param {string[]} keys - Array of keys to get
   * @returns {Promise<Array<[string, string|null]>>} Array of [key, value] pairs
   */
  async multiGet(keys) {
    if (!Array.isArray(keys)) {
      throw new Error('Keys must be an array');
    }
    
    const results = [];
    for (const key of keys) {
      const value = await this.getItem(key);
      results.push([key, value]);
    }
    
    return Promise.resolve(results);
  }

  /**
   * Set multiple items
   * @param {Array<[string, string]>} keyValuePairs - Array of [key, value] pairs
   * @returns {Promise<void>}
   */
  async multiSet(keyValuePairs) {
    if (!Array.isArray(keyValuePairs)) {
      throw new Error('KeyValuePairs must be an array');
    }
    
    for (const [key, value] of keyValuePairs) {
      await this.setItem(key, value);
    }
    
    return Promise.resolve();
  }

  /**
   * Remove multiple items
   * @param {string[]} keys - Array of keys to remove
   * @returns {Promise<void>}
   */
  async multiRemove(keys) {
    if (!Array.isArray(keys)) {
      throw new Error('Keys must be an array');
    }
    
    for (const key of keys) {
      await this.removeItem(key);
    }
    
    return Promise.resolve();
  }

  /**
   * Merge multiple items
   * @param {Array<[string, string]>} keyValuePairs - Array of [key, value] pairs
   * @returns {Promise<void>}
   */
  async multiMerge(keyValuePairs) {
    if (!Array.isArray(keyValuePairs)) {
      throw new Error('KeyValuePairs must be an array');
    }
    
    for (const [key, value] of keyValuePairs) {
      await this.mergeItem(key, value);
    }
    
    return Promise.resolve();
  }

  // Test utility methods (not part of real AsyncStorage)
  
  /**
   * Get the current storage state (for testing)
   * @returns {Object} Current storage as plain object
   */
  __getStorageState() {
    const state = {};
    for (const [key, value] of this.storage.entries()) {
      state[key] = value;
    }
    return state;
  }

  /**
   * Set the storage state directly (for testing)
   * @param {Object} state - State to set
   */
  __setStorageState(state) {
    this.storage.clear();
    for (const [key, value] of Object.entries(state)) {
      this.storage.set(key, value);
    }
  }

  /**
   * Reset storage to empty state (for testing)
   */
  __reset() {
    this.storage.clear();
  }
}

// Create a singleton instance
const mockAsyncStorage = new MockAsyncStorage();

// Export the mock with the same interface as real AsyncStorage
export default mockAsyncStorage;

// Also export individual methods for destructuring imports
export const {
  setItem,
  getItem,
  removeItem,
  mergeItem,
  clear,
  getAllKeys,
  multiGet,
  multiSet,
  multiRemove,
  multiMerge
} = mockAsyncStorage;

// 5,456 characters