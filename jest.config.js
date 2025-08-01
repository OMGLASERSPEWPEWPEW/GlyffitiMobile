// jest.config.js
// Path: jest.config.js
// Jest configuration for GlyffitiMobile React Native app
// Moved from package.json to keep package.json clean

module.exports = {
  // React Native preset with all the necessary transformers
  preset: 'react-native',
  
  // Setup files to run after test environment is set up
  setupFilesAfterEnv: [
    '<rootDir>/__tests__/setup.js'
  ],
  
  // Transform patterns - tells Jest which node_modules to transform
  // React Native and Expo modules need to be transformed
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|@react-native-async-storage)/)'
  ],
  
  // Module name mapping for mocking
  moduleNameMapper: {
    '@react-native-async-storage/async-storage': '<rootDir>/__tests__/__mocks__/@react-native-async-storage/async-storage.js'
  },
  
  // Test environment
  testEnvironment: 'node',
  
  // Verbose output for detailed test results
  verbose: true,
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/**/__tests__/**',
    '!src/**/node_modules/**'
  ],
  
  // Coverage thresholds (optional - uncomment to enforce minimum coverage)
  // coverageThreshold: {
  //   global: {
  //     branches: 80,
  //     functions: 80,
  //     lines: 80,
  //     statements: 80
  //   }
  // },
  
  // Coverage output directory
  coverageDirectory: 'coverage',
  
  // Coverage reporters
  coverageReporters: [
    'html',
    'text',
    'lcov'
  ]
};

// Character count: 1,347