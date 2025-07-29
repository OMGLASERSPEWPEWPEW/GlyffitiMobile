// src/styles/index.js
// Path: src/styles/index.js

// Central facade for design tokens and style helpers.
// Keep this file thin to avoid circular imports.

// Import the specific modules we use in this file:
import { typography } from './tokens/typography';
import { colors } from './tokens/colors';
import { spacing } from './tokens/spacing';
import { shadows } from './tokens/shadows';
import { borderRadius, borderWidth, borderStyle } from './tokens/borders';

// Re-export all tokens so callers can do:
//   import { colors, spacing, typography } from 'src/styles';
export * from './tokens';

export * from './base';

// ----- Temporary back-compat alias for { fonts } -----
export const fonts = {
  family: {
    regular: typography.fontFamily,
    bold: typography.fontFamilyBold ?? typography.fontFamily,
  },
  sizes: typography.fontSize ?? typography.sizes ?? {},
  weights: typography.fontWeight ?? typography.weights ?? {},
  lineHeights: typography.lineHeight ?? typography.lineHeights ?? {},
  textStyles: typography.textStyles ?? {},
};
// -----------------------------------------------------

// Optional theme helper (light/dark)
// Only reference token modules directly to avoid cycles.
export function buildTheme(mode = 'light') {
  const palette = colors?.[mode] ?? colors;

  return {
    mode,
    colors: palette,
    spacing,
    shadows,
    radius: borderRadius,
    borderWidth,
    borderStyle,
    typography, // expose full typography
    fonts,      // back-compat; remove after migration
  };
}
