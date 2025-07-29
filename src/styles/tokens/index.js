// src/styles/tokens/index.js
// Path: src/styles/tokens/index.js

// 1) IMPORT tokens so they exist in local scope
import { typography } from './typography';
import { spacing, margins, paddings } from './spacing';
import { colors, lightColors, darkColors, palette, getColors } from './colors';
import { shadows, elevations, darkShadows, getShadows } from './shadows';
import { borderRadius, borderWidth, borderStyle } from './borders';

// 2) Re-export them for consumers of the tokens barrel
export { typography };
export { spacing, margins, paddings };
export { colors, lightColors, darkColors, palette, getColors };
export { shadows, elevations, darkShadows, getShadows };
export { borderRadius, borderWidth, borderStyle };

// 3) Optional frozen aggregate object (handy for debugging or single import)
const _tokens = {
  typography,
  spacing,
  margins,
  paddings,
  colors,
  lightColors,
  darkColors,
  palette,
  getColors,
  shadows,
  elevations,
  darkShadows,
  getShadows,
  borderRadius,
  borderWidth,
  borderStyle,
};

export const tokens = Object.freeze(_tokens);

// 869 characters