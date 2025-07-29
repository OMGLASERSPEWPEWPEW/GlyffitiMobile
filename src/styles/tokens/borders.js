// src/styles/tokens/borders.js
// Path: src/styles/tokens/borders.js

/**
 * Border system - radius, widths, and styles
 * Consistent border styling across all components
 */

// Border radius scale
export const borderRadius = {
  // No radius
  none: 0,
  
  // Standard scale
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  xxl: 16,
  xxxl: 24,
  
  // Semantic names
  small: 4,
  medium: 8,
  large: 12,
  extraLarge: 16,
  
  // Special cases
  full: 9999, // Fully rounded (pills, circular buttons)
  
  // Component-specific radius
  button: 8,
  buttonSmall: 6,
  buttonLarge: 12,
  
  card: 12,
  cardSmall: 8,
  cardLarge: 16,
  
  input: 6,
  inputLarge: 8,
  
  modal: 16,
  sheet: 20, // Bottom sheet, top corners
  
  avatar: 9999, // Circular avatars
  avatarSquare: 8, // Square avatars with slight rounding
  
  badge: 12,
  chip: 16,
  tag: 6,
  
  image: 8,
  imageSmall: 4,
  imageLarge: 12,
  
  toast: 8,
  tooltip: 6,
  
  // Progress bars, indicators
  progress: 4,
  indicator: 2,
};

// Border widths
export const borderWidth = {
  // Standard scale
  none: 0,
  hairline: 0.5,  // Very thin border (iOS hairline)
  thin: 1,        // Standard thin border
  medium: 2,      // Medium border
  thick: 3,       // Thick border
  extraThick: 4,  // Extra thick border
  
  // Semantic names
  default: 1,
  focus: 2,      // For focus states
  error: 2,      // For error states
  divider: 0.5,  // For dividers/separators
};

// Border styles (React Native supports limited border styles)
export const borderStyle = {
  solid: 'solid',
  dashed: 'dashed', // Limited support
  dotted: 'dotted', // Limited support
  none: undefined,
};

// Component-specific border configurations
export const componentBorders = {
  // Buttons
  button: {
    borderRadius: borderRadius.button,
    borderWidth: borderWidth.none,
  },
  
  buttonOutline: {
    borderRadius: borderRadius.button,
    borderWidth: borderWidth.thin,
  },
  
  buttonPressed: {
    borderRadius: borderRadius.button,
    borderWidth: borderWidth.medium,
  },
  
  // Cards
  card: {
    borderRadius: borderRadius.card,
    borderWidth: borderWidth.none,
  },
  
  cardOutline: {
    borderRadius: borderRadius.card,
    borderWidth: borderWidth.thin,
  },
  
  // Inputs
  input: {
    borderRadius: borderRadius.input,
    borderWidth: borderWidth.thin,
  },
  
  inputFocus: {
    borderRadius: borderRadius.input,
    borderWidth: borderWidth.focus,
  },
  
  inputError: {
    borderRadius: borderRadius.input,
    borderWidth: borderWidth.error,
  },
  
  // Modals
  modal: {
    borderRadius: borderRadius.modal,
    borderWidth: borderWidth.none,
  },
  
  // Lists
  listItem: {
    borderRadius: borderRadius.none,
    borderWidth: borderWidth.none,
  },
  
  // Separators
  divider: {
    borderRadius: borderRadius.none,
    borderWidth: borderWidth.divider,
  },
  
  // Images
  image: {
    borderRadius: borderRadius.image,
    borderWidth: borderWidth.none,
  },
  
  avatar: {
    borderRadius: borderRadius.avatar,
    borderWidth: borderWidth.none,
  },
  
  avatarWithBorder: {
    borderRadius: borderRadius.avatar,
    borderWidth: borderWidth.medium,
  },
  
  // Badges and chips
  badge: {
    borderRadius: borderRadius.badge,
    borderWidth: borderWidth.none,
  },
  
  chip: {
    borderRadius: borderRadius.chip,
    borderWidth: borderWidth.thin,
  },
  
  tag: {
    borderRadius: borderRadius.tag,
    borderWidth: borderWidth.none,
  },
  
  // Progress indicators
  progressBar: {
    borderRadius: borderRadius.progress,
    borderWidth: borderWidth.none,
  },
  
  progressContainer: {
    borderRadius: borderRadius.progress,
    borderWidth: borderWidth.thin,
  },
};

// Utility functions for common border combinations
export const createBorder = (width = borderWidth.thin, radius = borderRadius.medium) => ({
  borderWidth: width,
  borderRadius: radius,
});

export const createRoundedBorder = (radius = borderRadius.medium) => ({
  borderRadius: radius,
});

export const createOutlineBorder = (width = borderWidth.thin, radius = borderRadius.medium) => ({
  borderWidth: width,
  borderRadius: radius,
  borderStyle: borderStyle.solid,
});

// Common border combinations as style objects
export const borderPresets = {
  // Card-like borders
  cardSubtle: {
    borderRadius: borderRadius.card,
    borderWidth: borderWidth.hairline,
  },
  
  cardOutline: {
    borderRadius: borderRadius.card,
    borderWidth: borderWidth.thin,
  },
  
  // Button borders
  buttonSolid: {
    borderRadius: borderRadius.button,
    borderWidth: borderWidth.none,
  },
  
  buttonOutline: {
    borderRadius: borderRadius.button,
    borderWidth: borderWidth.thin,
  },
  
  // Input borders
  inputDefault: {
    borderRadius: borderRadius.input,
    borderWidth: borderWidth.thin,
  },
  
  inputFocused: {
    borderRadius: borderRadius.input,
    borderWidth: borderWidth.focus,
  },
  
  // Circular elements
  circular: {
    borderRadius: borderRadius.full,
    borderWidth: borderWidth.none,
  },
  
  circularOutline: {
    borderRadius: borderRadius.full,
    borderWidth: borderWidth.thin,
  },
  
  // Pills (rounded rectangles)
  pill: {
    borderRadius: borderRadius.full,
    borderWidth: borderWidth.none,
  },
  
  pillOutline: {
    borderRadius: borderRadius.full,
    borderWidth: borderWidth.thin,
  },
};

// 4,618 characters