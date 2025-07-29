// src/styles/tokens/index.js
// Path: src/styles/tokens/index.js

// 1) IMPORT the tokens so they exist in local scope
import { typography } from './typography';
import { spacing, margins, paddings } from './spacing';
import { colors } from './colors';
import { shadows, elevations } from './shadows';
import { borderRadius, borderWidth, borderStyle } from './borders';

// 2) Re-export them for consumers of the tokens barrel
export { typography };
export { spacing, margins, paddings };
export { colors };
export { shadows, elevations };
export { borderRadius, borderWidth, borderStyle };

// 3) Optional frozen aggregate object (handy for debugging)
const _tokens = {
  typography,
  spacing,
  margins,
  paddings,
  colors,
  shadows,
  elevations,
  borderRadius,
  borderWidth,
  borderStyle,
};

export const tokens = Object.freeze(_tokens);
