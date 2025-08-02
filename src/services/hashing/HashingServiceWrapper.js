// src/services/hashing/HashingServiceWrapper.js
// Path: src/services/hashing/HashingServiceWrapper.js
// Detects environment and loads appropriate hashing implementation

/**
 * Environment detection and dynamic loading of appropriate hashing service
 * This wrapper ensures the correct hashing implementation is used
 * whether in React Native (expo-crypto) or Node.js (crypto)
 */

// Detect if we're in Node.js
const isNode = typeof process !== 'undefined' && 
                process.versions && 
                process.versions.node &&
                typeof window === 'undefined';

// Dynamic import based on environment
let HashingService;

if (isNode) {
  // In Node.js - use built-in crypto
  const module = await import('./HashingService.node.js');
  HashingService = module.HashingService;
} else {
  // In React Native - use expo-crypto
  const module = await import('./HashingService.js');
  HashingService = module.HashingService;
}

// Export the appropriate implementation
export { HashingService };
export default HashingService;

// Character count: 1,054