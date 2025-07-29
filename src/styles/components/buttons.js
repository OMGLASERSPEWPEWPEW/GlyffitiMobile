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
 * Usage:
 * - Import specific styles: buttonStyles.primary, buttonStyles.small
 * - Theme-aware: use getButtonStyles(isDark) for proper colors
 * - Combine: [buttonStyles.base, buttonStyles.primary, buttonStyles.large]
 */

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
    lineHeight: typography.lineHeight.button, // 20px
    minHeight: 44,
  },
  
  large: {
    paddingVertical: spacing.medium,         // 16px
    paddingHorizontal: spacing.large,        // 24px
    borderRadius: borderRadius.buttonLarge,  // 12px
    fontSize: typography.fontSize.large,     // 18px
    lineHeight: typography.lineHeight.button, // 20px
    minHeight: 52,
  },
  
  // Special sizes
  icon: {
    width: 44,
    height: 44,
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderRadius: borderRadius.button,       // 8px
    minHeight: 44,
  },
  
  iconSmall: {
    width: 36,
    height: 36,
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderRadius: borderRadius.buttonSmall,  // 6px
    minHeight: 36,
  },
  
  iconLarge: {
    width: 52,
    height: 52,
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderRadius: borderRadius.buttonLarge,  // 12px
    minHeight: 52,
  },
  
  // Full width
  fullWidth: {
    alignSelf: 'stretch',
    width: '100%',
  },
};

// Create light theme button styles
const createLightButtonStyles = () => {
  const colors = lightColors;
  
  return {
    // Variant: Primary (main CTA buttons)
    primary: {
      backgroundColor: colors.primary,
      color: palette.white,
      ...shadows.sm,
    },
    primaryHover: {
      backgroundColor: colors.primaryHover,
      ...shadows.md,
    },
    primaryActive: {
      backgroundColor: colors.primaryActive,
      ...shadows.sm,
    },
    primaryDisabled: {
      backgroundColor: colors.primaryDisabled,
      color: colors.textTertiary,
      ...shadows.none,
    },
    
    // Variant: Secondary (less prominent actions)
    secondary: {
      backgroundColor: colors.surface,
      borderWidth: borderWidth.thin,
      borderColor: colors.border,
      color: colors.text,
      ...shadows.sm,
    },
    secondaryHover: {
      backgroundColor: colors.backgroundSecondary,
      borderColor: colors.primary,
      ...shadows.md,
    },
    secondaryActive: {
      backgroundColor: colors.border,
    },
    secondaryDisabled: {
      backgroundColor: colors.backgroundSecondary,
      borderColor: colors.primaryDisabled,
      color: colors.textTertiary,
      ...shadows.none,
    },
    
    // Variant: Success (positive actions)
    success: {
      backgroundColor: colors.success,
      color: palette.white,
      ...shadows.sm,
    },
    successHover: {
      backgroundColor: palette.green600,
      ...shadows.md,
    },
    
    // Variant: Error/Destructive (dangerous actions)
    error: {
      backgroundColor: colors.error,
      color: palette.white,
      ...shadows.sm,
    },
    errorHover: {
      backgroundColor: palette.red600,
      ...shadows.md,
    },
    
    // Variant: Warning (caution actions)
    warning: {
      backgroundColor: colors.warning,
      color: colors.text,
      ...shadows.sm,
    },
    warningHover: {
      backgroundColor: palette.yellow600,
      ...shadows.md,
    },
    
    // Variant: Ghost (minimal styling)
    ghost: {
      backgroundColor: 'transparent',
      color: colors.primary,
    },
    ghostHover: {
      backgroundColor: colors.backgroundSecondary,
    },
    ghostActive: {
      backgroundColor: colors.border,
    },
    
    // Variant: Link (text-like button)
    link: {
      backgroundColor: 'transparent',
      color: colors.link,
      paddingVertical: spacing.tiny,
      paddingHorizontal: spacing.tiny,
      minHeight: 'auto',
    },
    linkHover: {
      color: colors.linkHover,
      textDecorationLine: 'underline',
    },
    
    // Variant: Outline (border-only)
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
  };
};

// Create dark theme button styles
const createDarkButtonStyles = () => {
  const colors = darkColors;
  
  return {
    // Variant: Primary
    primary: {
      backgroundColor: colors.primary,
      color: palette.white,
      ...darkShadows.sm,
    },
    primaryHover: {
      backgroundColor: colors.primaryHover,
      ...darkShadows.md,
    },
    primaryActive: {
      backgroundColor: colors.primaryActive,
      ...darkShadows.sm,
    },
    primaryDisabled: {
      backgroundColor: colors.primaryDisabled,
      color: colors.textTertiary,
      ...darkShadows.none,
    },
    
    // Variant: Secondary
    secondary: {
      backgroundColor: colors.surface,
      borderWidth: borderWidth.thin,
      borderColor: colors.border,
      color: colors.text,
      ...darkShadows.sm,
    },
    secondaryHover: {
      backgroundColor: colors.backgroundSecondary,
      borderColor: colors.primary,
      ...darkShadows.md,
    },
    secondaryActive: {
      backgroundColor: colors.border,
    },
    secondaryDisabled: {
      backgroundColor: colors.backgroundSecondary,
      borderColor: colors.primaryDisabled,
      color: colors.textTertiary,
      ...darkShadows.none,
    },
    
    // Variant: Success
    success: {
      backgroundColor: colors.success,
      color: palette.white,
      ...darkShadows.sm,
    },
    successHover: {
      backgroundColor: palette.green400,
      ...darkShadows.md,
    },
    
    // Variant: Error/Destructive
    error: {
      backgroundColor: colors.error,
      color: palette.white,
      ...darkShadows.sm,
    },
    errorHover: {
      backgroundColor: palette.red400,
      ...darkShadows.md,
    },
    
    // Variant: Warning
    warning: {
      backgroundColor: colors.warning,
      color: colors.background, // Dark text on yellow
      ...darkShadows.sm,
    },
    warningHover: {
      backgroundColor: palette.yellow400,
      ...darkShadows.md,
    },
    
    // Variant: Ghost
    ghost: {
      backgroundColor: 'transparent',
      color: colors.primary,
    },
    ghostHover: {
      backgroundColor: colors.backgroundSecondary,
    },
    ghostActive: {
      backgroundColor: colors.border,
    },
    
    // Variant: Link
    link: {
      backgroundColor: 'transparent',
      color: colors.link,
      paddingVertical: spacing.tiny,
      paddingHorizontal: spacing.tiny,
      minHeight: 'auto',
    },
    linkHover: {
      color: colors.linkHover,
      textDecorationLine: 'underline',
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
  };
};

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
  
  // Light theme variants
  ...createLightButtonStyles(),
  
  // State styles
  loading: {
    opacity: 0.7,
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
  icon: {
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

// Export individual style objects for direct import
export const lightButtonStyles = createLightButtonStyles();
export const darkButtonStyles = createDarkButtonStyles();

// 7,847 characters