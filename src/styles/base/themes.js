// src/styles/base/themes.js
// Path: src/styles/base/themes.js

import { 
  lightColors,
  darkColors,
  palette,
  typography, 
  spacing, 
  shadows, 
  borderRadius, 
  borderWidth, 
  borderStyle,
  darkShadows,
  getShadows 
} from '../tokens';

/**
 * Theme system - complete light and dark theme configurations
 * Builds comprehensive themes from design tokens
 * Single source of truth for all theme-related styling
 */

// Base theme structure (shared between light and dark)
const baseTheme = {
  // Typography (same across themes)
  typography,
  
  // Spacing (same across themes)
  spacing,
  
  // Borders (same across themes)
  borders: {
    radius: borderRadius,
    width: borderWidth,
    style: borderStyle,
  },
  
  // Common component configurations
  components: {
    // Button configurations
    button: {
      borderRadius: borderRadius.button,
      minHeight: 44, // Apple HIG minimum touch target
      paddingHorizontal: spacing.medium,
      paddingVertical: spacing.small,
    },
    
    // Card configurations
    card: {
      borderRadius: borderRadius.card,
      padding: spacing.medium,
      marginBottom: spacing.medium,
    },
    
    // Input configurations
    input: {
      borderRadius: borderRadius.input,
      paddingHorizontal: spacing.medium,
      paddingVertical: spacing.small,
      minHeight: 44,
      borderWidth: borderWidth.default,
    },
    
    // Header configurations
    header: {
      height: 56, // Standard header height
      paddingHorizontal: spacing.medium,
      paddingVertical: spacing.small,
    },
    
    // Modal configurations
    modal: {
      borderRadius: borderRadius.modal,
      padding: spacing.large,
      maxWidth: 400,
    },
    
    // List configurations
    list: {
      paddingHorizontal: spacing.medium,
      paddingVertical: spacing.small,
    },
    
    // Navigation configurations
    navigation: {
      tabBarHeight: 60,
      headerHeight: 56,
    },
  },
  
  // Animation/transition timings (same across themes)
  animations: {
    fast: 150,
    normal: 250,
    slow: 350,
    verySlow: 500,
  },
  
  // Z-index layers
  zIndex: {
    background: -1,
    content: 0,
    sticky: 10,
    fixed: 100,
    modal: 1000,
    tooltip: 1100,
    toast: 1200,
    loading: 1300,
  },
};

// Light theme configuration
export const lightTheme = {
  ...baseTheme,
  mode: 'light',
  
  // Colors for light theme
  colors: {
    ...lightColors,
    
    // Component-specific color overrides for light theme
    input: {
      background: lightColors.surface,
      border: lightColors.border,
      borderFocus: lightColors.primary,
      borderError: lightColors.error,
      text: lightColors.text,
      placeholder: lightColors.textTertiary,
    },
    
    button: {
      primary: {
        background: lightColors.primary,
        backgroundHover: lightColors.primaryHover,
        backgroundActive: lightColors.primaryActive,
        backgroundDisabled: lightColors.primaryDisabled,
        text: palette?.white || '#ffffff',
        textDisabled: palette?.gray500 || '#6b7280',
      },
      secondary: {
        background: lightColors.surface,
        backgroundHover: lightColors.backgroundSecondary,
        backgroundActive: lightColors.border,
        backgroundDisabled: lightColors.primaryDisabled,
        text: lightColors.text,
        textDisabled: lightColors.textTertiary,
        border: lightColors.border,
      },
      success: {
        background: lightColors.success,
        text: palette?.white || '#ffffff',
      },
      error: {
        background: lightColors.error,
        text: palette?.white || '#ffffff',
      },
      warning: {
        background: lightColors.warning,
        text: lightColors.text,
      },
    },
    
    card: {
      background: lightColors.surface,
      border: lightColors.border,
      shadow: palette?.black || '#000000',
    },
    
    navigation: {
      background: lightColors.surface,
      border: lightColors.border,
      activeTab: lightColors.primary,
      inactiveTab: lightColors.textSecondary,
    },
    
    status: {
      online: lightColors.success,
      offline: lightColors.textTertiary,
      away: lightColors.warning,
      busy: lightColors.error,
    },
  },
  
  // Shadows for light theme
  shadows: getShadows(false).shadows,
  componentShadows: getShadows(false).componentShadows,
};

// Dark theme configuration
export const darkTheme = {
  ...baseTheme,
  mode: 'dark',
  
  // Colors for dark theme
  colors: {
    ...darkColors,
    
    // Component-specific color overrides for dark theme
    input: {
      background: darkColors.surface,
      border: darkColors.border,
      borderFocus: darkColors.primary,
      borderError: darkColors.error,
      text: darkColors.text,
      placeholder: darkColors.textTertiary,
    },
    
    button: {
      primary: {
        background: darkColors.primary,
        backgroundHover: darkColors.primaryHover,
        backgroundActive: darkColors.primaryActive,
        backgroundDisabled: darkColors.primaryDisabled,
        text: palette?.white || '#ffffff',
        textDisabled: palette?.gray500 || '#6b7280',
      },
      secondary: {
        background: darkColors.surface,
        backgroundHover: darkColors.backgroundSecondary,
        backgroundActive: darkColors.border,
        backgroundDisabled: darkColors.primaryDisabled,
        text: darkColors.text,
        textDisabled: darkColors.textTertiary,
        border: darkColors.border,
      },
      success: {
        background: darkColors.success,
        text: palette?.white || '#ffffff',
      },
      error: {
        background: darkColors.error,
        text: palette?.white || '#ffffff',
      },
      warning: {
        background: darkColors.warning,
        text: darkColors.text,
      },
    },
    
    card: {
      background: darkColors.surface,
      border: darkColors.border,
      shadow: palette?.black || '#000000',
    },
    
    navigation: {
      background: darkColors.surface,
      border: darkColors.border,
      activeTab: darkColors.primary,
      inactiveTab: darkColors.textSecondary,
    },
    
    status: {
      online: darkColors.success,
      offline: darkColors.textTertiary,
      away: darkColors.warning,
      busy: darkColors.error,
    },
  },
  
  // Shadows for dark theme
  shadows: getShadows(true).shadows,
  componentShadows: getShadows(true).componentShadows,
};

// Theme utilities
export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

// Helper function to get theme by mode
export const getTheme = (mode = 'light') => {
  return themes[mode] || themes.light;
};

// Helper function to create custom theme variations
export const createTheme = (mode, overrides = {}) => {
  const baseThemeConfig = mode === 'dark' ? darkTheme : lightTheme;
  
  return {
    ...baseThemeConfig,
    ...overrides,
    colors: {
      ...baseThemeConfig.colors,
      ...overrides.colors,
    },
    components: {
      ...baseThemeConfig.components,
      ...overrides.components,
    },
  };
};

// Helper to interpolate theme values (useful for animations)
export const interpolateTheme = (lightValue, darkValue, isDark) => {
  return isDark ? darkValue : lightValue;
};

// Common theme queries (for conditional styling)
export const themeQueries = {
  // Check if current theme is dark
  isDark: (theme) => theme?.mode === 'dark',
  
  // Check if current theme is light
  isLight: (theme) => theme?.mode === 'light',
  
  // Get appropriate color for theme
  getColor: (theme, colorPath) => {
    const pathArray = colorPath.split('.');
    let value = theme?.colors;
    
    for (const key of pathArray) {
      value = value?.[key];
      if (value === undefined) break;
    }
    
    return value;
  },
  
  // Get appropriate shadow for theme
  getShadow: (theme, shadowName) => {
    return theme?.shadows?.[shadowName] || theme?.shadows?.none;
  },
  
  // Get component shadow for theme
  getComponentShadow: (theme, componentName) => {
    return theme?.componentShadows?.[componentName] || theme?.shadows?.none;
  },
};

// Export theme constants for quick access
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
};

// Default theme (light)
export const defaultTheme = lightTheme;

// 7,344 characters