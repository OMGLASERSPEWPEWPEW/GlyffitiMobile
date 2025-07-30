// src/styles/components/buttons.js
// Path: src/styles/components/buttons.js

import { StyleSheet } from 'react-native';
import { 
  lightColors, 
  darkColors, 
  palette, 
  typography, 
  spacing, 
  shadows, 
  darkShadows,
  borderRadius, 
  borderWidth,
  getColors 
} from '../tokens';

/**
 * Button styles - comprehensive button system
 * All button variants, sizes, and states in one place
 * Uses design tokens for consistency and theming support
 * 
 * FIXED: Reordered functions to fix hoisting issues
 * - Theme creation functions defined first
 * - StyleSheet.create() called last
 * - All dependencies properly ordered
 * 
 * Usage:
 * - Import specific styles: buttonStyles.primary, buttonStyles.small
 * - Theme-aware: use getButtonStyles(isDark) for proper colors
 * - Combine: [buttonStyles.base, buttonStyles.primary, buttonStyles.large]
 */

// =============================================================================
// BASE STYLES AND CONSTANTS (DEFINED FIRST)
// =============================================================================

// Base button styles (shared across all variants)
const baseButton = {
  // Layout
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  
  // Typography
  fontFamily: typography.fontFamily,
  fontWeight: typography.fontWeight.medium,
  
  // Accessibility & UX
  minHeight: 44, // Apple HIG minimum touch target
  
  // Animation-ready
  borderWidth: borderWidth.none,
  borderStyle: 'solid',
  
  // Prevent text selection on web
  userSelect: 'none',
};

// Size variants
const sizes = {
  small: {
    paddingVertical: spacing.extraSmall,     // 8px
    paddingHorizontal: spacing.small,        // 8px
    borderRadius: borderRadius.buttonSmall,  // 6px
    fontSize: typography.fontSize.small,     // 12px
    lineHeight: typography.lineHeight.button, // 20px
    minHeight: 36,
  },
  
  medium: {
    paddingVertical: spacing.small,          // 8px
    paddingHorizontal: spacing.medium,       // 16px
    borderRadius: borderRadius.button,       // 8px
    fontSize: typography.fontSize.medium,    // 14px
    lineHeight: typography.lineHeight.button, // 24px
    minHeight: 44,
  },
  
  large: {
    paddingVertical: spacing.medium,         // 16px
    paddingHorizontal: spacing.large,        // 24px
    borderRadius: borderRadius.buttonLarge,  // 12px
    fontSize: typography.fontSize.large,     // 16px
    lineHeight: typography.lineHeight.button, // 28px
    minHeight: 56,
  },
  
  // Icon button sizes
  icon: {
    width: 44,
    height: 44,
    padding: 0,
    borderRadius: borderRadius.button,
  },
  
  iconSmall: {
    width: 36,
    height: 36,
    padding: 0,
    borderRadius: borderRadius.buttonSmall,
  },
  
  iconLarge: {
    width: 56,
    height: 56,
    padding: 0,
    borderRadius: borderRadius.buttonLarge,
  },
  
  // Full width
  fullWidth: {
    width: '100%',
  },
};

// =============================================================================
// THEME VARIANT FUNCTIONS (DEFINED BEFORE USE)
// =============================================================================

// Light theme button variants
const createLightButtonStyles = () => {
  const colors = lightColors;
  
  return {
    // Variant: Primary
    primary: {
      backgroundColor: colors.primary,
      color: palette.white,
      ...shadows.button,
    },
    primaryHover: {
      backgroundColor: colors.primaryDark,
    },
    primaryActive: {
      backgroundColor: colors.primaryDark,
      ...shadows.buttonPressed,
    },
    primaryDisabled: {
      backgroundColor: colors.disabled,
      color: colors.textDisabled,
    },
    
    // Variant: Secondary
    secondary: {
      backgroundColor: colors.surface,
      color: colors.text,
      borderWidth: borderWidth.thin,
      borderColor: colors.border,
    },
    secondaryHover: {
      backgroundColor: colors.surfaceHover,
      borderColor: colors.borderDark,
    },
    secondaryActive: {
      backgroundColor: colors.surfacePressed,
    },
    secondaryDisabled: {
      backgroundColor: colors.disabled,
      color: colors.textDisabled,
      borderColor: colors.border,
    },
    
    // Variant: Success
    success: {
      backgroundColor: colors.success,
      color: palette.white,
    },
    successHover: {
      backgroundColor: colors.successDark,
    },
    successDisabled: {
      backgroundColor: colors.disabled,
      color: colors.textDisabled,
    },
    
    // Variant: Error/Danger
    error: {
      backgroundColor: colors.error,
      color: palette.white,
    },
    errorHover: {
      backgroundColor: colors.errorDark,
    },
    errorDisabled: {
      backgroundColor: colors.disabled,
      color: colors.textDisabled,
    },
    danger: {
      backgroundColor: colors.error,
      color: palette.white,
    },
    
    // Variant: Warning
    warning: {
      backgroundColor: colors.warning,
      color: colors.text,
    },
    warningHover: {
      backgroundColor: colors.warningDark,
    },
    warningDisabled: {
      backgroundColor: colors.disabled,
      color: colors.textDisabled,
    },
    
    // Variant: Info
    info: {
      backgroundColor: colors.info,
      color: palette.white,
    },
    infoHover: {
      backgroundColor: colors.infoDark,
    },
    infoDisabled: {
      backgroundColor: colors.disabled,
      color: colors.textDisabled,
    },
    
    // Variant: Ghost (transparent background)
    ghost: {
      backgroundColor: 'transparent',
      color: colors.text,
    },
    ghostHover: {
      backgroundColor: colors.surfaceHover,
    },
    ghostActive: {
      backgroundColor: colors.surfacePressed,
    },
    ghostDisabled: {
      color: colors.textDisabled,
    },
    
    // Variant: Link (text only)
    link: {
      backgroundColor: 'transparent',
      color: colors.link,
      paddingHorizontal: 0,
      paddingVertical: 0,
      minHeight: 'auto',
    },
    linkHover: {
      color: colors.linkHover,
      textDecorationLine: 'underline',
    },
    linkDisabled: {
      color: colors.textDisabled,
    },
    
    // Variant: Outline
    outline: {
      backgroundColor: 'transparent',
      borderWidth: borderWidth.thin,
      borderColor: colors.primary,
      color: colors.primary,
    },
    outlineHover: {
      backgroundColor: colors.primary,
      color: palette.white,
    },
    outlineDisabled: {
      borderColor: colors.disabled,
      color: colors.textDisabled,
    },
  };
};

// Dark theme button variants
const createDarkButtonStyles = () => {
  const colors = darkColors;
  
  return {
    // Variant: Primary
    primary: {
      backgroundColor: colors.primary,
      color: palette.white,
      ...darkShadows.button,
    },
    primaryHover: {
      backgroundColor: colors.primaryLight,
    },
    primaryActive: {
      backgroundColor: colors.primaryLight,
      ...darkShadows.buttonPressed,
    },
    primaryDisabled: {
      backgroundColor: colors.disabled,
      color: colors.textDisabled,
    },
    
    // Variant: Secondary
    secondary: {
      backgroundColor: colors.surface,
      color: colors.text,
      borderWidth: borderWidth.thin,
      borderColor: colors.border,
    },
    secondaryHover: {
      backgroundColor: colors.surfaceHover,
      borderColor: colors.borderLight,
    },
    secondaryActive: {
      backgroundColor: colors.surfacePressed,
    },
    secondaryDisabled: {
      backgroundColor: colors.disabled,
      color: colors.textDisabled,
      borderColor: colors.border,
    },
    
    // Variant: Success
    success: {
      backgroundColor: colors.success,
      color: palette.white,
    },
    successHover: {
      backgroundColor: colors.successLight,
    },
    successDisabled: {
      backgroundColor: colors.disabled,
      color: colors.textDisabled,
    },
    
    // Variant: Error/Danger
    error: {
      backgroundColor: colors.error,
      color: palette.white,
    },
    errorHover: {
      backgroundColor: colors.errorLight,
    },
    errorDisabled: {
      backgroundColor: colors.disabled,
      color: colors.textDisabled,
    },
    danger: {
      backgroundColor: colors.error,
      color: palette.white,
    },
    
    // Variant: Warning
    warning: {
      backgroundColor: colors.warning,
      color: palette.black,
    },
    warningHover: {
      backgroundColor: colors.warningLight,
    },
    warningDisabled: {
      backgroundColor: colors.disabled,
      color: colors.textDisabled,
    },
    
    // Variant: Info
    info: {
      backgroundColor: colors.info,
      color: palette.white,
    },
    infoHover: {
      backgroundColor: colors.infoLight,
    },
    infoDisabled: {
      backgroundColor: colors.disabled,
      color: colors.textDisabled,
    },
    
    // Variant: Ghost (transparent background)
    ghost: {
      backgroundColor: 'transparent',
      color: colors.text,
    },
    ghostHover: {
      backgroundColor: colors.surfaceHover,
    },
    ghostActive: {
      backgroundColor: colors.surfacePressed,
    },
    ghostDisabled: {
      color: colors.textDisabled,
    },
    
    // Variant: Link (text only)
    link: {
      backgroundColor: 'transparent',
      color: colors.link,
      paddingHorizontal: 0,
      paddingVertical: 0,
      minHeight: 'auto',
    },
    linkHover: {
      color: colors.linkHover,
      textDecorationLine: 'underline',
    },
    linkDisabled: {
      color: colors.textDisabled,
    },
    
    // Variant: Outline
    outline: {
      backgroundColor: 'transparent',
      borderWidth: borderWidth.thin,
      borderColor: colors.primary,
      color: colors.primary,
    },
    outlineHover: {
      backgroundColor: colors.primary,
      color: palette.white,
    },
    outlineDisabled: {
      borderColor: colors.disabled,
      color: colors.textDisabled,
    },
  };
};

// =============================================================================
// MAIN STYLESHEETS (CREATED AFTER FUNCTIONS ARE DEFINED)
// =============================================================================

// Default button styles (light theme)
export const buttonStyles = StyleSheet.create({
  // Base
  base: baseButton,
  
  // Sizes
  small: sizes.small,
  medium: sizes.medium,
  large: sizes.large,
  icon: sizes.icon,
  iconSmall: sizes.iconSmall,
  iconLarge: sizes.iconLarge,
  fullWidth: sizes.fullWidth,
  
  // Light theme variants (NOW SAFE TO CALL)
  ...createLightButtonStyles(),
  
  // State styles
  loading: {
    opacity: 0.7,
  },
  
  disabled: {
    opacity: 0.6,
  },
  
  // Text styles
  text: {
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
    includeFontPadding: false, // Android: removes extra padding
  },
  
  textSmall: {
    fontSize: typography.fontSize.small,
    lineHeight: typography.lineHeight.button,
  },
  
  textMedium: {
    fontSize: typography.fontSize.medium,
    lineHeight: typography.lineHeight.button,
  },
  
  textLarge: {
    fontSize: typography.fontSize.large,
    lineHeight: typography.lineHeight.button,
  },
  
  // Icon styles
  iconLeft: {
    marginRight: spacing.extraSmall,
  },
  
  iconOnly: {
    marginRight: 0,
  },
  
  iconRight: {
    marginLeft: spacing.extraSmall,
    marginRight: 0,
  },
});

// =============================================================================
// THEME-AWARE FUNCTIONS
// =============================================================================

// Theme-aware button styles
export const getButtonStyles = (isDark = false) => {
  const themeVariants = isDark ? createDarkButtonStyles() : createLightButtonStyles();
  
  return {
    ...buttonStyles,
    ...themeVariants,
  };
};

// Utility functions for common button combinations
export const createButtonStyle = (variant = 'primary', size = 'medium', isDark = false) => {
  const styles = getButtonStyles(isDark);
  
  return [
    styles.base,
    styles[size],
    styles[variant],
  ];
};

export const createIconButtonStyle = (variant = 'primary', size = 'medium', isDark = false) => {
  const styles = getButtonStyles(isDark);
  const iconSize = size === 'small' ? 'iconSmall' : size === 'large' ? 'iconLarge' : 'icon';
  
  return [
    styles.base,
    styles[iconSize],
    styles[variant],
  ];
};

// =============================================================================
// PRESETS AND CONVENIENCE EXPORTS
// =============================================================================

// Button preset combinations for common use cases
export const buttonPresets = {
  // Primary CTAs
  primaryCTA: (isDark = false) => createButtonStyle('primary', 'large', isDark),
  primaryAction: (isDark = false) => createButtonStyle('primary', 'medium', isDark),
  
  // Secondary actions
  secondaryAction: (isDark = false) => createButtonStyle('secondary', 'medium', isDark),
  secondarySmall: (isDark = false) => createButtonStyle('secondary', 'small', isDark),
  
  // Destructive actions
  delete: (isDark = false) => createButtonStyle('error', 'medium', isDark),
  deleteSmall: (isDark = false) => createButtonStyle('error', 'small', isDark),
  
  // Navigation
  back: (isDark = false) => createIconButtonStyle('ghost', 'medium', isDark),
  close: (isDark = false) => createIconButtonStyle('ghost', 'small', isDark),
  
  // Social actions
  like: (isDark = false) => createButtonStyle('ghost', 'small', isDark),
  share: (isDark = false) => createButtonStyle('success', 'small', isDark),
  
  // Forms
  submit: (isDark = false) => createButtonStyle('primary', 'large', isDark),
  cancel: (isDark = false) => createButtonStyle('secondary', 'medium', isDark),
  
  // Links
  textLink: (isDark = false) => createButtonStyle('link', 'medium', isDark),
  inlineLink: (isDark = false) => createButtonStyle('link', 'small', isDark),
};

// Export individual style objects for direct import (NOW SAFE TO CREATE)
export const lightButtonStyles = createLightButtonStyles();
export const darkButtonStyles = createDarkButtonStyles();

// Character count: 9,889