// src/styles/components/cards.js
// Path: src/styles/components/cards.js

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
 * Card styles - comprehensive card system
 * All card variants, sizes, and states in one place
 * Uses design tokens for consistency and theming support
 * 
 * Usage:
 * - Import specific styles: cardStyles.base, cardStyles.elevated
 * - Theme-aware: use getCardStyles(isDark) for proper colors
 * - Combine: [cardStyles.base, cardStyles.medium, cardStyles.status]
 */

// Base card styles (shared across all variants)
const baseCard = {
  // Layout
  borderStyle: 'solid',
  overflow: 'hidden',
  
  // Accessibility
  accessible: true,
  
  // Animation-ready
  borderWidth: borderWidth.hairline,
};

// Size variants
const sizes = {
  small: {
    borderRadius: borderRadius.cardSmall,    // 8px
    padding: spacing.small,                  // 8px
    marginBottom: spacing.small,             // 8px
  },
  
  medium: {
    borderRadius: borderRadius.card,         // 12px
    padding: spacing.medium,                 // 16px
    marginBottom: spacing.medium,            // 16px
  },
  
  large: {
    borderRadius: borderRadius.cardLarge,    // 16px
    padding: spacing.large,                  // 24px
    marginBottom: spacing.large,             // 24px
  },
  
  // Special sizes
  compact: {
    borderRadius: borderRadius.cardSmall,    // 8px
    padding: spacing.extraSmall,             // 8px
    marginBottom: spacing.extraSmall,        // 8px
  },
  
  hero: {
    borderRadius: borderRadius.cardLarge,    // 16px
    padding: spacing.xlarge,                 // 32px
    marginBottom: spacing.xlarge,            // 32px
  },
  
  // No padding variant (for image cards, etc.)
  noPadding: {
    borderRadius: borderRadius.card,         // 12px
    padding: 0,
    marginBottom: spacing.medium,            // 16px
  },
  
  // Full width variant
  fullWidth: {
    alignSelf: 'stretch',
    width: '100%',
    marginHorizontal: 0,
  },
};

// Elevation/Shadow variants
const elevations = {
  flat: {
    ...shadows.none,
    borderWidth: borderWidth.hairline,
  },
  
  low: {
    ...shadows.sm,
    borderWidth: borderWidth.none,
  },
  
  medium: {
    ...shadows.md,
    borderWidth: borderWidth.none,
  },
  
  high: {
    ...shadows.lg,
    borderWidth: borderWidth.none,
  },
  
  floating: {
    ...shadows.xl,
    borderWidth: borderWidth.none,
  },
};

// Dark theme elevations
const darkElevations = {
  flat: {
    ...darkShadows.none,
    borderWidth: borderWidth.hairline,
  },
  
  low: {
    ...darkShadows.sm,
    borderWidth: borderWidth.none,
  },
  
  medium: {
    ...darkShadows.md,
    borderWidth: borderWidth.none,
  },
  
  high: {
    ...darkShadows.lg,
    borderWidth: borderWidth.none,
  },
  
  floating: {
    ...darkShadows.xl,
    borderWidth: borderWidth.none,
  },
};

// Create light theme card styles
const createLightCardStyles = () => {
  const colors = lightColors;
  
  return {
    // Base variants
    default: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    
    outlined: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: borderWidth.thin,
    },
    
    filled: {
      backgroundColor: colors.backgroundSecondary,
      borderColor: colors.border,
    },
    
    elevated: {
      backgroundColor: colors.surface,
      borderColor: 'transparent',
      ...shadows.md,
    },
    
    // Status variants
    success: {
      backgroundColor: colors.successBg,
      borderColor: colors.success,
      borderWidth: borderWidth.thin,
      borderLeftWidth: borderWidth.thick, // Accent border
      borderLeftColor: colors.success,
    },
    
    warning: {
      backgroundColor: colors.warningBg,
      borderColor: colors.warning,
      borderWidth: borderWidth.thin,
      borderLeftWidth: borderWidth.thick,
      borderLeftColor: colors.warning,
    },
    
    error: {
      backgroundColor: colors.errorBg,
      borderColor: colors.error,
      borderWidth: borderWidth.thin,
      borderLeftWidth: borderWidth.thick,
      borderLeftColor: colors.error,
    },
    
    info: {
      backgroundColor: colors.infoBg,
      borderColor: colors.info,
      borderWidth: borderWidth.thin,
      borderLeftWidth: borderWidth.thick,
      borderLeftColor: colors.info,
    },
    
    // Interactive variants
    interactive: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    
    interactiveHover: {
      backgroundColor: colors.backgroundSecondary,
      borderColor: colors.primary,
      ...shadows.md,
    },
    
    interactiveActive: {
      backgroundColor: colors.backgroundSecondary,
      borderColor: colors.primaryActive,
      ...shadows.sm,
      transform: [{ scale: 0.98 }],
    },
    
    // Special variants
    gradient: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      // Note: Use LinearGradient component for actual gradient background
    },
    
    glass: {
      backgroundColor: colors.surface + '80', // 50% opacity
      borderColor: colors.border + '60',      // 37.5% opacity
      backdropFilter: 'blur(10px)', // Web only
    },
    
    modal: {
      backgroundColor: colors.surface,
      borderColor: 'transparent',
      ...shadows.xxl,
    },
  };
};

// Create dark theme card styles
const createDarkCardStyles = () => {
  const colors = darkColors;
  
  return {
    // Base variants
    default: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    
    outlined: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: borderWidth.thin,
    },
    
    filled: {
      backgroundColor: colors.backgroundSecondary,
      borderColor: colors.border,
    },
    
    elevated: {
      backgroundColor: colors.surface,
      borderColor: 'transparent',
      ...darkShadows.md,
    },
    
    // Status variants
    success: {
      backgroundColor: colors.successBg,
      borderColor: colors.success,
      borderWidth: borderWidth.thin,
      borderLeftWidth: borderWidth.thick,
      borderLeftColor: colors.success,
    },
    
    warning: {
      backgroundColor: colors.warningBg,
      borderColor: colors.warning,
      borderWidth: borderWidth.thin,
      borderLeftWidth: borderWidth.thick,
      borderLeftColor: colors.warning,
    },
    
    error: {
      backgroundColor: colors.errorBg,
      borderColor: colors.error,
      borderWidth: borderWidth.thin,
      borderLeftWidth: borderWidth.thick,
      borderLeftColor: colors.error,
    },
    
    info: {
      backgroundColor: colors.infoBg,
      borderColor: colors.info,
      borderWidth: borderWidth.thin,
      borderLeftWidth: borderWidth.thick,
      borderLeftColor: colors.info,
    },
    
    // Interactive variants
    interactive: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    
    interactiveHover: {
      backgroundColor: colors.backgroundSecondary,
      borderColor: colors.primary,
      ...darkShadows.md,
    },
    
    interactiveActive: {
      backgroundColor: colors.backgroundSecondary,
      borderColor: colors.primaryActive,
      ...darkShadows.sm,
      transform: [{ scale: 0.98 }],
    },
    
    // Special variants
    gradient: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },
    
    glass: {
      backgroundColor: colors.surface + '80',
      borderColor: colors.border + '60',
      backdropFilter: 'blur(10px)',
    },
    
    modal: {
      backgroundColor: colors.surface,
      borderColor: 'transparent',
      ...darkShadows.xxl,
    },
  };
};

// Content-specific styles (for card content layout)
const contentStyles = {
  // Headers
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.small,
  },
  
  headerTitle: {
    flex: 1,
    marginRight: spacing.small,
  },
  
  headerAction: {
    alignItems: 'flex-end',
  },
  
  // Content sections
  content: {
    marginBottom: spacing.medium,
  },
  
  contentCompact: {
    marginBottom: spacing.small,
  },
  
  // Footers
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.small,
  },
  
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Metadata
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.extraSmall,
  },
  
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.medium,
  },
  
  // Tags
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.small,
  },
  
  tag: {
    backgroundColor: lightColors.backgroundSecondary,
    borderRadius: borderRadius.chip,
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.tiny,
    marginRight: spacing.extraSmall,
    marginBottom: spacing.extraSmall,
  },
  
  tagDark: {
    backgroundColor: darkColors.backgroundSecondary,
  },
  
  // Indicators
  indicator: {
    borderRadius: borderRadius.chip,
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.tiny,
    alignSelf: 'flex-start',
  },
  
  // Dividers
  divider: {
    height: borderWidth.hairline,
    backgroundColor: lightColors.border,
    marginVertical: spacing.medium,
  },
  
  dividerDark: {
    backgroundColor: darkColors.border,
  },
};

// Typography styles for card content
const cardTypography = {
  // Titles
  titleLarge: {
    fontSize: typography.fontSize.title,      // 24px
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    marginBottom: spacing.small,
  },
  
  titleMedium: {
    fontSize: typography.fontSize.large,      // 18px
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    marginBottom: spacing.small,
  },
  
  titleSmall: {
    fontSize: typography.fontSize.medium,     // 14px
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.tight,
    marginBottom: spacing.extraSmall,
  },
  
  // Subtitles
  subtitle: {
    fontSize: typography.fontSize.medium,     // 14px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.normal,
    marginBottom: spacing.medium,
  },
  
  subtitleSmall: {
    fontSize: typography.fontSize.small,      // 12px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.normal,
    marginBottom: spacing.small,
  },
  
  // Body text
  body: {
    fontSize: typography.fontSize.medium,     // 14px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.relaxed,
  },
  
  bodySmall: {
    fontSize: typography.fontSize.small,      // 12px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.normal,
  },
  
  // Metadata
  caption: {
    fontSize: typography.fontSize.small,      // 12px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.normal,
    opacity: 0.7,
  },
  
  label: {
    fontSize: typography.fontSize.small,      // 12px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.normal,
  },
  
  // Tags
  tagText: {
    fontSize: 11,
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.tight,
  },
};

// Default card styles (light theme)
export const cardStyles = StyleSheet.create({
  // Base
  base: baseCard,
  
  // Sizes
  small: sizes.small,
  medium: sizes.medium,
  large: sizes.large,
  compact: sizes.compact,
  hero: sizes.hero,
  noPadding: sizes.noPadding,
  fullWidth: sizes.fullWidth,
  
  // Elevations (light theme)
  flat: elevations.flat,
  low: elevations.low,
  elevated: elevations.medium,
  high: elevations.high,
  floating: elevations.floating,
  
  // Light theme variants
  ...createLightCardStyles(),
  
  // Content layout styles
  ...contentStyles,
  
  // Typography styles
  ...cardTypography,
  
  // State styles
  loading: {
    opacity: 0.7,
  },
  
  disabled: {
    opacity: 0.6,
  },
  
  selected: {
    borderColor: lightColors.primary,
    borderWidth: borderWidth.focus,
  },
  
  focused: {
    borderColor: lightColors.primary,
    borderWidth: borderWidth.focus,
    shadowColor: lightColors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});

// Theme-aware card styles
export const getCardStyles = (isDark = false) => {
  const themeVariants = isDark ? createDarkCardStyles() : createLightCardStyles();
  const themeElevations = isDark ? darkElevations : elevations;
  
  // Update content styles for dark theme
  const themeContentStyles = {
    ...contentStyles,
    tag: isDark ? { ...contentStyles.tag, ...contentStyles.tagDark } : contentStyles.tag,
    divider: isDark ? { ...contentStyles.divider, ...contentStyles.dividerDark } : contentStyles.divider,
  };
  
  return {
    ...cardStyles,
    ...themeVariants,
    ...themeElevations,
    ...themeContentStyles,
    
    // Theme-specific state styles
    selected: {
      ...cardStyles.selected,
      borderColor: isDark ? darkColors.primary : lightColors.primary,
    },
    
    focused: {
      ...cardStyles.focused,
      borderColor: isDark ? darkColors.primary : lightColors.primary,
      shadowColor: isDark ? darkColors.primary : lightColors.primary,
    },
  };
};

// Utility functions for common card combinations
export const createCardStyle = (variant = 'default', size = 'medium', elevation = 'low', isDark = false) => {
  const styles = getCardStyles(isDark);
  
  return [
    styles.base,
    styles[size],
    styles[elevation],
    styles[variant],
  ];
};

// Card preset combinations for common use cases
export const cardPresets = {
  // Content cards
  contentCard: (isDark = false) => createCardStyle('default', 'medium', 'low', isDark),
  heroCard: (isDark = false) => createCardStyle('elevated', 'hero', 'high', isDark),
  
  // Status cards
  statusSuccess: (isDark = false) => createCardStyle('success', 'medium', 'flat', isDark),
  statusWarning: (isDark = false) => createCardStyle('warning', 'medium', 'flat', isDark),
  statusError: (isDark = false) => createCardStyle('error', 'medium', 'flat', isDark),
  statusInfo: (isDark = false) => createCardStyle('info', 'medium', 'flat', isDark),
  
  // Interactive cards
  button: (isDark = false) => createCardStyle('interactive', 'medium', 'low', isDark),
  buttonCompact: (isDark = false) => createCardStyle('interactive', 'small', 'low', isDark),
  
  // Special cards
  modal: (isDark = false) => createCardStyle('modal', 'large', 'floating', isDark),
  floating: (isDark = false) => createCardStyle('elevated', 'medium', 'floating', isDark),
  
  // Lists
  listItem: (isDark = false) => createCardStyle('outlined', 'compact', 'flat', isDark),
  listItemInteractive: (isDark = false) => createCardStyle('interactive', 'compact', 'flat', isDark),
  
  // Images
  imageCard: (isDark = false) => createCardStyle('elevated', 'noPadding', 'low', isDark),
  
  // Settings/form sections
  section: (isDark = false) => createCardStyle('filled', 'medium', 'flat', isDark),
};

// Export individual style objects for direct import
export const lightCardStyles = createLightCardStyles();
export const darkCardStyles = createDarkCardStyles();

// Typography color helpers
export const getCardTextColors = (isDark = false) => {
  const colors = isDark ? darkColors : lightColors;
  
  return {
    title: colors.text,
    subtitle: colors.textSecondary,
    body: colors.text,
    caption: colors.textTertiary,
    label: colors.text,
    tag: colors.textSecondary,
    metadata: colors.textSecondary,
  };
};

// 9,234 characters