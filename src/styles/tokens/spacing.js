// src/styles/tokens/spacing.js
// Path: src/styles/tokens/spacing.js

/**
 * Spacing system - consistent spacing scale based on 4px grid
 * Provides both numerical values and semantic names
 */

// Base spacing unit (4px)
const base = 4;

// Comprehensive spacing scale
export const spacing = {
  // Numerical scale (0-20)
  0: 0,
  1: base * 1,      // 4px
  2: base * 2,      // 8px  
  3: base * 3,      // 12px
  4: base * 4,      // 16px
  5: base * 5,      // 20px
  6: base * 6,      // 24px
  8: base * 8,      // 32px
  10: base * 10,    // 40px
  12: base * 12,    // 48px
  16: base * 16,    // 64px
  20: base * 20,    // 80px
  24: base * 24,    // 96px
  32: base * 32,    // 128px
  
  // Semantic names (backward compatible with your existing system)
  none: 0,
  tiny: base * 1,       // 4px
  extraSmall: base * 2, // 8px - new addition
  small: base * 2,      // 8px - your existing
  medium: base * 4,     // 16px - your existing  
  large: base * 6,      // 24px - your existing
  xlarge: base * 8,     // 32px - your existing
  xxlarge: base * 12,   // 48px - your existing
  xxxlarge: base * 16,  // 64px - new addition
  
  // Component-specific spacing
  buttonPadding: {
    small: { vertical: base * 2, horizontal: base * 3 },    // 8px, 12px
    medium: { vertical: base * 3, horizontal: base * 4 },   // 12px, 16px
    large: { vertical: base * 4, horizontal: base * 6 },    // 16px, 24px
  },
  
  cardPadding: {
    small: base * 3,    // 12px
    medium: base * 4,   // 16px
    large: base * 6,    // 24px
  },
  
  screenPadding: {
    horizontal: base * 4,  // 16px
    vertical: base * 6,    // 24px
  },
  
  listItem: {
    padding: base * 4,     // 16px
    marginBottom: base * 2, // 8px
  },
  
  input: {
    padding: base * 3,     // 12px
    marginBottom: base * 4, // 16px
  },
  
  section: {
    marginBottom: base * 6, // 24px
    paddingVertical: base * 4, // 16px
  },
};

// Margin utilities
export const margins = {
  // All sides
  xs: spacing.extraSmall,
  sm: spacing.small,
  md: spacing.medium,
  lg: spacing.large,
  xl: spacing.xlarge,
  
  // Directional margins
  top: {
    xs: { marginTop: spacing.extraSmall },
    sm: { marginTop: spacing.small },
    md: { marginTop: spacing.medium },
    lg: { marginTop: spacing.large },
    xl: { marginTop: spacing.xlarge },
  },
  
  bottom: {
    xs: { marginBottom: spacing.extraSmall },
    sm: { marginBottom: spacing.small },
    md: { marginBottom: spacing.medium },
    lg: { marginBottom: spacing.large },
    xl: { marginBottom: spacing.xlarge },
  },
  
  horizontal: {
    xs: { marginHorizontal: spacing.extraSmall },
    sm: { marginHorizontal: spacing.small },
    md: { marginHorizontal: spacing.medium },
    lg: { marginHorizontal: spacing.large },
    xl: { marginHorizontal: spacing.xlarge },
  },
  
  vertical: {
    xs: { marginVertical: spacing.extraSmall },
    sm: { marginVertical: spacing.small },
    md: { marginVertical: spacing.medium },
    lg: { marginVertical: spacing.large },
    xl: { marginVertical: spacing.xlarge },
  },
};

// Padding utilities
export const paddings = {
  // All sides
  xs: spacing.extraSmall,
  sm: spacing.small,
  md: spacing.medium,
  lg: spacing.large,
  xl: spacing.xlarge,
  
  // Directional paddings
  top: {
    xs: { paddingTop: spacing.extraSmall },
    sm: { paddingTop: spacing.small },
    md: { paddingTop: spacing.medium },
    lg: { paddingTop: spacing.large },
    xl: { paddingTop: spacing.xlarge },
  },
  
  bottom: {
    xs: { paddingBottom: spacing.extraSmall },
    sm: { paddingBottom: spacing.small },
    md: { paddingBottom: spacing.medium },
    lg: { paddingBottom: spacing.large },
    xl: { paddingBottom: spacing.xlarge },
  },
  
  horizontal: {
    xs: { paddingHorizontal: spacing.extraSmall },
    sm: { paddingHorizontal: spacing.small },
    md: { paddingHorizontal: spacing.medium },
    lg: { paddingHorizontal: spacing.large },
    xl: { paddingHorizontal: spacing.xlarge },
  },
  
  vertical: {
    xs: { paddingVertical: spacing.extraSmall },
    sm: { paddingVertical: spacing.small },
    md: { paddingVertical: spacing.medium },
    lg: { paddingVertical: spacing.large },
    xl: { paddingVertical: spacing.xlarge },
  },
};

// Helper functions
export const getSpacing = (multiplier) => base * multiplier;

// Gap utilities for Flexbox/Grid (when React Native supports it)
export const gaps = {
  xs: spacing.extraSmall,
  sm: spacing.small,
  md: spacing.medium,
  lg: spacing.large,
  xl: spacing.xlarge,
};

// 4,063 characters