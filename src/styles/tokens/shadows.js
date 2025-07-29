// src/styles/tokens/shadows.js
// Path: src/styles/tokens/shadows.js

/**
 * Shadow system - elevation and shadow styles
 * Provides cross-platform shadows (iOS shadowColor + Android elevation)
 * Compatible with both light and dark themes
 */

// Base shadow colors
const shadowColors = {
  light: '#000000',
  dark: '#000000',
};

// Shadow presets for different elevation levels
export const shadows = {
  // No shadow
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  // Small shadow - subtle depth
  sm: {
    shadowColor: shadowColors.light,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  // Medium shadow - cards, buttons
  md: {
    shadowColor: shadowColors.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  
  // Large shadow - floating elements
  lg: {
    shadowColor: shadowColors.light,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  
  // Extra large shadow - modals, drawers
  xl: {
    shadowColor: shadowColors.light,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  
  // Double extra large shadow - overlays
  xxl: {
    shadowColor: shadowColors.light,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 16,
  },
};

// Dark theme shadows (higher opacity for visibility)
export const darkShadows = {
  none: shadows.none,
  
  sm: {
    ...shadows.sm,
    shadowOpacity: 0.3,
  },
  
  md: {
    ...shadows.md,
    shadowOpacity: 0.4,
  },
  
  lg: {
    ...shadows.lg,
    shadowOpacity: 0.5,
  },
  
  xl: {
    ...shadows.xl,
    shadowOpacity: 0.6,
  },
  
  xxl: {
    ...shadows.xxl,
    shadowOpacity: 0.7,
  },
};

// Component-specific shadow presets
export const componentShadows = {
  // Card shadows
  card: shadows.sm,
  cardHover: shadows.md,
  cardPressed: shadows.lg,
  
  // Button shadows
  button: shadows.sm,
  buttonHover: shadows.md,
  buttonPressed: {
    shadowColor: shadowColors.light,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  
  // Modal shadows
  modal: shadows.xxl,
  
  // Header/Navigation shadows
  header: {
    shadowColor: shadowColors.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  
  // Floating action button
  fab: shadows.lg,
  fabPressed: shadows.md,
  
  // Tooltip shadows
  tooltip: shadows.md,
  
  // Dropdown/Menu shadows
  dropdown: shadows.lg,
  
  // Input focus shadow (subtle)
  inputFocus: {
    shadowColor: '#667eea', // primary color
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
};

// Dark theme component shadows
export const darkComponentShadows = {
  card: darkShadows.sm,
  cardHover: darkShadows.md,
  cardPressed: darkShadows.lg,
  button: darkShadows.sm,
  buttonHover: darkShadows.md,
  buttonPressed: darkShadows.sm,
  modal: darkShadows.xxl,
  header: darkShadows.md,
  fab: darkShadows.lg,
  fabPressed: darkShadows.md,
  tooltip: darkShadows.md,
  dropdown: darkShadows.lg,
  inputFocus: {
    ...componentShadows.inputFocus,
    shadowColor: '#3b82f6', // primary color for dark theme
  },
};

// Helper function to get theme-appropriate shadows
export const getShadows = (isDark = false) => ({
  shadows: isDark ? darkShadows : shadows,
  componentShadows: isDark ? darkComponentShadows : componentShadows,
});

// Utility function to create custom shadows
export const createShadow = (
  offsetHeight = 2,
  shadowRadius = 4,
  shadowOpacity = 0.15,
  elevation = 4,
  shadowColor = shadowColors.light
) => ({
  shadowColor,
  shadowOffset: { width: 0, height: offsetHeight },
  shadowOpacity,
  shadowRadius,
  elevation,
});

// 3,456 characters