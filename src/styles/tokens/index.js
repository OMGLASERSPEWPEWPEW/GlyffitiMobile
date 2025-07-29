// src/styles/tokens/index.js
// Path: src/styles/tokens/index.js

/**
 * Design tokens - centralized export
 * Single import point for all design system tokens
 */

// Export all tokens
export { 
  colors, 
  lightColors, 
  darkColors, 
  palette, 
  getColors 
} from './colors';

export { 
  typography, 
  fonts 
} from './typography';

export { 
  spacing, 
  margins, 
  paddings, 
  gaps, 
  getSpacing 
} from './spacing';

export { 
  shadows, 
  darkShadows, 
  componentShadows, 
  darkComponentShadows, 
  getShadows, 
  createShadow 
} from './shadows';

export { 
  borderRadius, 
  borderWidth, 
  borderStyle, 
  componentBorders, 
  borderPresets, 
  createBorder, 
  createRoundedBorder, 
  createOutlineBorder 
} from './borders';

// Convenience object for importing everything at once
export const tokens = {
  colors,
  typography, 
  spacing,
  shadows,
  borderRadius,
  borderWidth,
  borderStyle,
};

// Theme-aware token getter
export const getTokens = (isDark = false) => ({
  colors: getColors(isDark),
  shadows: getShadows(isDark).shadows,
  componentShadows: getShadows(isDark).componentShadows,
  typography,
  spacing,
  borderRadius,
  borderWidth,
  borderStyle,
});

// 1,138 characters