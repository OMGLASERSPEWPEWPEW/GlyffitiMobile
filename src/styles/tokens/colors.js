// src/styles/tokens/colors.js
// Path: src/styles/tokens/colors.js

/**
 * Color system - complete palette with semantic naming
 * Supports light/dark themes and component-specific colors
 */

// Base color palette
const palette = {
  // Grays
  white: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  black: '#000000',
  
  // Primary colors (your existing brand colors)
  blue50: '#eff6ff',
  blue100: '#dbeafe',
  blue200: '#bfdbfe',
  blue300: '#93c5fd',
  blue400: '#60a5fa',
  blue500: '#3b82f6',
  blue600: '#667eea', // your existing primary
  blue700: '#764ba2', // your existing primaryDark
  blue800: '#1e40af',
  blue900: '#1e3a8a',
  
  // Secondary colors (your existing secondary)
  pink50: '#fdf2f8',
  pink100: '#fce7f3',
  pink200: '#fbcfe8',
  pink300: '#f9a8d4',
  pink400: '#f472b6',
  pink500: '#f093fb', // your existing secondary
  pink600: '#ec4899',
  pink700: '#be185d',
  pink800: '#9d174d',
  pink900: '#831843',
  
  // Status colors
  red50: '#fef2f2',
  red500: '#ef4444',
  red600: '#dc3545',
  red700: '#ff6b6b', // your existing error/like
  
  green50: '#f0fdf4',
  green500: '#22c55e',
  green600: '#16a34a',
  green700: '#51cf66', // your existing success/share
  
  yellow50: '#fffbeb',
  yellow500: '#eab308',
  yellow600: '#ca8a04',
  yellow700: '#ffd43b', // your existing warning
  
  cyan500: '#06b6d4',
  cyan600: '#0891b2',
};

// Light theme colors (semantic naming)
export const lightColors = {
  // Backgrounds
  background: palette.white,
  backgroundSecondary: palette.gray50,
  surface: palette.white,
  surfaceSecondary: palette.gray50,
  
  // Text
  text: palette.gray800,
  textSecondary: palette.gray600,
  textTertiary: palette.gray500,
  textLight: palette.gray400,
  
  // Borders & Dividers
  border: palette.gray200,
  borderSecondary: palette.gray100,
  divider: palette.gray100,
  
  // Interactive
  primary: palette.blue600,
  primaryHover: palette.blue700,
  primaryActive: palette.blue800,
  primaryDisabled: palette.gray300,
  
  secondary: palette.pink500,
  secondaryHover: palette.pink600,
  secondaryActive: palette.pink700,
  
  // Accent/Link
  accent: palette.blue500,
  accentHover: palette.blue600,
  link: palette.blue600,
  linkHover: palette.blue700,
  
  // Status
  success: palette.green700,
  successBg: palette.green50,
  error: palette.red700,
  errorBg: palette.red50,
  warning: palette.yellow700,
  warningBg: palette.yellow50,
  info: palette.cyan500,
  infoBg: palette.blue50,
  
  // Social/Interaction
  like: palette.red700,
  share: palette.green700,
  comment: palette.blue600,
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.25)',
  backdrop: 'rgba(0, 0, 0, 0.75)',
};

// Dark theme colors
export const darkColors = {
  // Backgrounds
  background: palette.gray900,
  backgroundSecondary: palette.gray800,
  surface: palette.gray800,
  surfaceSecondary: palette.gray700,
  
  // Text
  text: palette.gray100,
  textSecondary: palette.gray300,
  textTertiary: palette.gray400,
  textLight: palette.gray500,
  
  // Borders & Dividers
  border: palette.gray600,
  borderSecondary: palette.gray700,
  divider: palette.gray700,
  
  // Interactive
  primary: palette.blue400,
  primaryHover: palette.blue300,
  primaryActive: palette.blue200,
  primaryDisabled: palette.gray600,
  
  secondary: palette.pink400,
  secondaryHover: palette.pink300,
  secondaryActive: palette.pink200,
  
  // Accent/Link
  accent: palette.blue400,
  accentHover: palette.blue300,
  link: palette.blue400,
  linkHover: palette.blue300,
  
  // Status
  success: palette.green500,
  successBg: 'rgba(34, 197, 94, 0.1)',
  error: palette.red500,
  errorBg: 'rgba(239, 68, 68, 0.1)',
  warning: palette.yellow500,
  warningBg: 'rgba(234, 179, 8, 0.1)',
  info: palette.cyan500,
  infoBg: 'rgba(59, 130, 246, 0.1)',
  
  // Social/Interaction
  like: palette.red500,
  share: palette.green500,
  comment: palette.blue400,
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.75)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  backdrop: 'rgba(0, 0, 0, 0.9)',
};

// Default export maintains backward compatibility
export const colors = lightColors;

// Export palette for direct access to raw colors
export { palette };

// Theme-aware color getter (for future theme context)
export const getColors = (isDark = false) => isDark ? darkColors : lightColors;

// Legacy aliases for backward compatibility
// TODO: Update components to use semantic colors and remove these
colors.primaryDark = lightColors.primaryHover;
colors.background = lightColors.background;
colors.backgroundSecondary = lightColors.backgroundSecondary;
colors.text = lightColors.text;
colors.textSecondary = lightColors.textSecondary;
colors.textLight = lightColors.textLight;
colors.border = lightColors.border;
colors.error = lightColors.error;
colors.success = lightColors.success;
colors.warning = lightColors.warning;
colors.like = lightColors.like;
colors.share = lightColors.share;
colors.comment = lightColors.comment;

// 4,892 characters