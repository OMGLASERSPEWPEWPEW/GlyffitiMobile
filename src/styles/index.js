// src/styles/index.js
// Path: src/styles/index.js

// Simple exports without circular references
export { colors } from './colors';
export { fonts } from './fonts';
export { spacing } from './spacing';

// Typography mapping for story components (define inline to avoid circular refs)
export const typography = {
  fontFamily: 'System',
  fontFamilyBold: 'System-Bold',
  
  sizes: {
    small: 12,
    medium: 14,
    large: 18,
    extraLarge: 20,
    title: 24,
    heading: 32,
  },
  
  weights: {
    normal: '400',
    medium: '500',
    bold: '700',
  },
  
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

// 238 characters