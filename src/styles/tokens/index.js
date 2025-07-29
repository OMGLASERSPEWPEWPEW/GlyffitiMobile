// src/styles/tokens/index.js
// Path: src/styles/tokens/index.js

/**
 * Design tokens - centralized export
 * Single import point for all design system tokens
 */

// Import for the convenience object
import { 
  colors as colorsImport, 
  lightColors, 
  darkColors, 
  palette, 
  getColors 
} from './colors';

import { 
  typography as typographyImport, 
  fonts 
} from './typography';

import { 
  spacing as spacingImport, 
  margins, 
  paddings, 
  gaps, 
  getSpacing 
} from './spacing';

import { 
  shadows as shadowsImport, 
  darkShadows, 
  componentShadows, 
  darkComponentShadows, 
  getShadows, 
  createShadow 
} from './shadows';

import { 
  borderRadius as borderRadiusImport, 
  borderWidth as borderWidthImport, 
  borderStyle as borderStyleImport, 
  componentBorders, 
  borderPresets, 
  createBorder, 
  createRoundedBorder, 
  createOutlineBorder 
} from './borders';

// Re-export all tokens
export { 
  colorsImport as colors, 
  lightColors, 
  darkColors, 
  palette, 
  getColors 
} from './colors';

export { 
  typographyImport as typography, 
  fonts 
} from './typography';

export { 
  spacingImport as spacing, 
  margins, 
  paddings, 
  gaps, 
  getSpacing 
} from './spacing';

export { 
  shadowsImport as shadows, 
  darkShadows, 
  componentShadows, 
  darkComponentShadows, 
  getShadows, 
  createShadow 
} from './shadows';

export { 
  borderRadiusImport as borderRadius, 
  borderWidthImport as borderWidth, 
  borderStyleImport as borderStyle, 
  componentBorders, 
  borderPresets, 
  createBorder, 
  createRoundedBorder, 
  createOutlineBorder 
} from './borders';

// Convenience object for importing everything at once
export const tokens = {
  colors: colorsImport,
  typography: typographyImport, 
  spacing: spacingImport,
  shadows: shadowsImport,
  borderRadius: borderRadiusImport,
  borderWidth: borderWidthImport,
  borderStyle: borderStyleImport,
};

// Theme-aware token getter
export const getTokens = (isDark = false) => ({
  colors: getColors(isDark),
  shadows: getShadows(isDark).shadows,
  componentShadows: getShadows(isDark).componentShadows,
  typography: typographyImport,
  spacing: spacingImport,
  borderRadius: borderRadiusImport,
  borderWidth: borderWidthImport,
  borderStyle: borderStyleImport,
});

// 2,348 characters