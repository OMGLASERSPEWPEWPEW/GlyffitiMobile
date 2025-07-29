// src/styles/tokens/typography.js
// Path: src/styles/tokens/typography.js

/**
 * Typography system - consolidated font definitions
 * Combines font families, sizes, weights, and line heights
 * Single source of truth for all text styling
 */
export const typography = {
  // Font families
  fontFamily: 'System',
  fontFamilyBold: 'System-Bold',
  
  // Font sizes - using consistent naming
  fontSize: {
    // Standard scale from fonts.js
    small: 12,
    medium: 14,
    large: 18,
    xlarge: 24,
    xxlarge: 32,
    
    // Additional sizes from index.js for story components
    extraLarge: 20,
    title: 24,
    heading: 32,
    
    // Semantic aliases for common use cases
    body: 14,
    caption: 12,
    button: 16,
    input: 16,
  },
  
  // Font weights
  fontWeight: {
    light: '300',
    regular: '400',
    normal: '400', // alias for regular
    medium: '500',
    bold: '700',
  },
  
  // Line heights - relative to font size
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    
    // Absolute line heights for specific cases
    button: 20,
    input: 22,
  },
  
  // Common text style combinations for reuse
  presets: {
    heading1: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 1.2,
      fontFamily: 'System-Bold',
    },
    heading2: {
      fontSize: 24,
      fontWeight: '700',
      lineHeight: 1.2,
      fontFamily: 'System-Bold',
    },
    heading3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 1.3,
      fontFamily: 'System-Bold',
    },
    body: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 1.4,
      fontFamily: 'System',
    },
    bodyLarge: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.5,
      fontFamily: 'System',
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 1.3,
      fontFamily: 'System',
    },
    button: {
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 20,
      fontFamily: 'System',
    },
    buttonSmall: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 18,
      fontFamily: 'System',
    },
  },
};

// Legacy aliases for backward compatibility
// TODO: Update components to use new structure and remove these
export const fonts = {
  sizes: typography.fontSize,
  weights: typography.fontWeight,
};

// 2,156 characters