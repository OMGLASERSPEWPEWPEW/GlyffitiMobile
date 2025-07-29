// src/styles/components/content.js
// Path: src/styles/components/content.js

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
 * Content styles - comprehensive content display system
 * All content typography, layouts, and states in one place
 * Uses design tokens for consistency and theming support
 * 
 * Usage:
 * - Import specific styles: contentStyles.title, contentStyles.body
 * - Theme-aware: use getContentStyles(isDark) for proper colors
 * - Combine: [contentStyles.article, contentStyles.readable]
 */

// Typography hierarchy for content
const contentTypography = {
  // Headings (content titles, story titles)
  heading1: {
    fontSize: typography.fontSize.heading,      // 32px
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    marginBottom: spacing.large,
  },
  
  heading2: {
    fontSize: typography.fontSize.title,        // 24px
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    marginBottom: spacing.medium,
  },
  
  heading3: {
    fontSize: typography.fontSize.extraLarge,   // 20px
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    marginBottom: spacing.medium,
  },
  
  heading4: {
    fontSize: typography.fontSize.large,        // 18px
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    marginBottom: spacing.small,
  },
  
  // Titles (shorter content titles)
  titleLarge: {
    fontSize: typography.fontSize.title,        // 24px
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    marginBottom: spacing.small,
  },
  
  titleMedium: {
    fontSize: typography.fontSize.large,        // 18px
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    marginBottom: spacing.small,
  },
  
  titleSmall: {
    fontSize: typography.fontSize.medium,       // 14px
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.tight,
    marginBottom: spacing.extraSmall,
  },
  
  // Subtitles
  subtitle: {
    fontSize: typography.fontSize.medium,       // 14px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.normal,
    marginBottom: spacing.medium,
    fontStyle: 'italic',
  },
  
  // Body text (reading content)
  body: {
    fontSize: typography.fontSize.medium,       // 14px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.relaxed,
    marginBottom: spacing.medium,
  },
  
  bodyLarge: {
    fontSize: typography.fontSize.large,        // 18px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.relaxed,
    marginBottom: spacing.medium,
  },
  
  bodySmall: {
    fontSize: typography.fontSize.small,        // 12px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.normal,
    marginBottom: spacing.small,
  },
  
  // Emphasis
  emphasis: {
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.medium,
    fontStyle: 'italic',
  },
  
  strong: {
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,
  },
  
  // Metadata text
  metadata: {
    fontSize: typography.fontSize.small,        // 12px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.normal,
    opacity: 0.7,
  },
  
  caption: {
    fontSize: typography.fontSize.small,        // 12px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.normal,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  
  label: {
    fontSize: typography.fontSize.small,        // 12px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.normal,
  },
};

// Reading experience variants (different font sizes for readability)
const readingSizes = {
  tiny: {
    fontSize: 12,
    lineHeight: 18, // 1.5
  },
  
  small: {
    fontSize: 14,
    lineHeight: 21, // 1.5
  },
  
  medium: {
    fontSize: 16,
    lineHeight: 25.6, // 1.6
  },
  
  large: {
    fontSize: 18,
    lineHeight: 28.8, // 1.6
  },
  
  extraLarge: {
    fontSize: 20,
    lineHeight: 32, // 1.6
  },
  
  huge: {
    fontSize: 24,
    lineHeight: 38.4, // 1.6
  },
};

// Content layout variants
const layouts = {
  // Article layouts
  article: {
    paddingHorizontal: spacing.large,           // 24px
    paddingVertical: spacing.medium,            // 16px
  },
  
  articleCompact: {
    paddingHorizontal: spacing.medium,          // 16px
    paddingVertical: spacing.small,             // 8px
  },
  
  articleWide: {
    paddingHorizontal: spacing.xlarge,          // 32px
    paddingVertical: spacing.large,             // 24px
  },
  
  // Reading layouts
  reading: {
    paddingHorizontal: spacing.large,           // 24px
    paddingVertical: spacing.medium,            // 16px
    maxWidth: 680, // Optimal reading width
  },
  
  readingNarrow: {
    paddingHorizontal: spacing.medium,          // 16px
    paddingVertical: spacing.medium,            // 16px
    maxWidth: 560,
  },
  
  readingWide: {
    paddingHorizontal: spacing.xlarge,          // 32px
    paddingVertical: spacing.large,             // 24px
    maxWidth: 800,
  },
  
  // Preview layouts
  preview: {
    paddingHorizontal: spacing.medium,          // 16px
    paddingVertical: spacing.small,             // 8px
  },
  
  previewCard: {
    padding: spacing.medium,                    // 16px
    borderRadius: borderRadius.card,            // 12px
  },
  
  // List item layouts
  listItem: {
    paddingHorizontal: spacing.medium,          // 16px
    paddingVertical: spacing.medium,            // 16px
    borderBottomWidth: borderWidth.hairline,
  },
  
  listItemCompact: {
    paddingHorizontal: spacing.medium,          // 16px
    paddingVertical: spacing.small,             // 8px
    borderBottomWidth: borderWidth.hairline,
  },
};

// Content element styles
const elements = {
  // Paragraphs
  paragraph: {
    marginBottom: spacing.medium,               // 16px
    textAlign: 'left',
  },
  
  paragraphCompact: {
    marginBottom: spacing.small,                // 8px
    textAlign: 'left',
  },
  
  paragraphSpaced: {
    marginBottom: spacing.large,                // 24px
    textAlign: 'left',
  },
  
  // Quotes
  quote: {
    paddingLeft: spacing.medium,                // 16px
    paddingRight: spacing.medium,               // 16px
    paddingVertical: spacing.medium,            // 16px
    marginVertical: spacing.medium,             // 16px
    borderLeftWidth: borderWidth.thick,         // 3px
    fontStyle: 'italic',
  },
  
  blockquote: {
    paddingHorizontal: spacing.large,           // 24px
    paddingVertical: spacing.large,             // 24px
    marginVertical: spacing.large,              // 24px
    borderLeftWidth: borderWidth.thick,         // 3px
    fontStyle: 'italic',
    fontSize: typography.fontSize.large,        // 18px
    lineHeight: typography.lineHeight.relaxed,
  },
  
  // Code elements
  code: {
    fontFamily: 'monospace',
    fontSize: typography.fontSize.small,        // 12px
    paddingHorizontal: spacing.tiny,            // 4px
    paddingVertical: spacing.tiny,              // 4px
    borderRadius: borderRadius.sm,              // 4px
  },
  
  codeBlock: {
    fontFamily: 'monospace',
    fontSize: typography.fontSize.small,        // 12px
    padding: spacing.medium,                    // 16px
    marginVertical: spacing.medium,             // 16px
    borderRadius: borderRadius.medium,          // 8px
    lineHeight: typography.lineHeight.normal,
  },
  
  // Lists
  listContainer: {
    marginVertical: spacing.medium,             // 16px
  },
  
  listItem: {
    flexDirection: 'row',
    marginBottom: spacing.small,                // 8px
  },
  
  listBullet: {
    width: spacing.medium,                      // 16px
    fontSize: typography.fontSize.medium,       // 14px
  },
  
  listText: {
    flex: 1,
    fontSize: typography.fontSize.medium,       // 14px
    lineHeight: typography.lineHeight.normal,
  },
  
  // Dividers
  divider: {
    height: borderWidth.hairline,               // 0.5px
    marginVertical: spacing.large,              // 24px
  },
  
  dividerThick: {
    height: borderWidth.thin,                   // 1px
    marginVertical: spacing.large,              // 24px
  },
  
  // Spacers
  spacerSmall: {
    height: spacing.small,                      // 8px
  },
  
  spacerMedium: {
    height: spacing.medium,                     // 16px
  },
  
  spacerLarge: {
    height: spacing.large,                      // 24px
  },
};

// Metadata and info elements
const metadata = {
  // Author information
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.small,                // 8px
  },
  
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: spacing.extraSmall,            // 8px
  },
  
  authorName: {
    fontSize: typography.fontSize.small,        // 12px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.medium,
  },
  
  authorHandle: {
    fontSize: typography.fontSize.small,        // 12px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.regular,
    opacity: 0.7,
  },
  
  // Timestamps
  timestamp: {
    fontSize: typography.fontSize.small,        // 12px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.regular,
    opacity: 0.6,
  },
  
  // Reading information
  readingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.small,              // 8px
  },
  
  readingTime: {
    fontSize: typography.fontSize.small,        // 12px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.regular,
    opacity: 0.7,
  },
  
  wordCount: {
    fontSize: typography.fontSize.small,        // 12px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.regular,
    opacity: 0.7,
  },
  
  // Statistics
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.small,              // 8px
  },
  
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.medium,                // 16px
  },
  
  statIcon: {
    marginRight: spacing.tiny,                  // 4px
  },
  
  statText: {
    fontSize: typography.fontSize.small,        // 12px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.regular,
  },
  
  // Tags
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: spacing.small,              // 8px
  },
  
  tag: {
    paddingHorizontal: spacing.small,           // 8px
    paddingVertical: spacing.tiny,              // 4px
    marginRight: spacing.extraSmall,            // 8px
    marginBottom: spacing.extraSmall,           // 8px
    borderRadius: borderRadius.chip,            // 16px
  },
  
  tagText: {
    fontSize: 11,
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.medium,
  },
  
  // Status indicators
  statusIndicator: {
    paddingHorizontal: spacing.small,           // 8px
    paddingVertical: spacing.tiny,              // 4px
    borderRadius: borderRadius.badge,           // 12px
    alignSelf: 'flex-start',
  },
  
  statusText: {
    fontSize: 10,
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
};

// State styles (loading, empty, error)
const states = {
  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxlarge,           // 48px
  },
  
  loadingText: {
    fontSize: typography.fontSize.medium,       // 14px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.regular,
    marginBottom: spacing.small,                // 8px
    textAlign: 'center',
  },
  
  loadingSubtext: {
    fontSize: typography.fontSize.small,        // 12px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.regular,
    opacity: 0.7,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // Loading more content
  loadingMoreContainer: {
    alignItems: 'center',
    paddingVertical: spacing.large,             // 24px
    marginTop: spacing.medium,                  // 16px
  },
  
  loadingDots: {
    width: 40,
    height: 3,
    borderRadius: 1.5,
    opacity: 0.6,
    marginTop: spacing.small,                   // 8px
  },
  
  // Empty states
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxlarge,           // 48px
    paddingHorizontal: spacing.large,           // 24px
  },
  
  emptyTitle: {
    fontSize: typography.fontSize.large,        // 18px
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.small,                // 8px
    textAlign: 'center',
  },
  
  emptyText: {
    fontSize: typography.fontSize.medium,       // 14px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.regular,
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal,
  },
  
  // Completion states
  completionContainer: {
    alignItems: 'center',
    paddingVertical: spacing.large,             // 24px
    marginTop: spacing.large,                   // 24px
  },
  
  completionText: {
    fontSize: typography.fontSize.medium,       // 14px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.regular,
    marginBottom: spacing.extraSmall,           // 8px
    opacity: 0.7,
    textAlign: 'center',
  },
  
  completionSubtext: {
    fontSize: typography.fontSize.small,        // 12px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.regular,
    opacity: 0.5,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // Error states
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxlarge,           // 48px
    paddingHorizontal: spacing.large,           // 24px
  },
  
  errorTitle: {
    fontSize: typography.fontSize.large,        // 18px
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.small,                // 8px
    textAlign: 'center',
  },
  
  errorText: {
    fontSize: typography.fontSize.medium,       // 14px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.regular,
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal,
    marginBottom: spacing.medium,               // 16px
  },
  
  errorSubtext: {
    fontSize: typography.fontSize.small,        // 12px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.regular,
    opacity: 0.7,
    textAlign: 'center',
    fontStyle: 'italic',
  },
};

// Create light theme content styles
const createLightContentStyles = () => {
  const colors = lightColors;
  
  return {
    // Text colors
    primaryText: { color: colors.text },
    secondaryText: { color: colors.textSecondary },
    tertiaryText: { color: colors.textTertiary },
    lightText: { color: colors.textLight },
    
    // Background colors
    background: { backgroundColor: colors.background },
    surface: { backgroundColor: colors.surface },
    
    // Interactive colors
    link: { color: colors.link },
    linkHover: { color: colors.linkHover },
    
    // Element colors
    quote: {
      borderLeftColor: colors.primary,
      backgroundColor: colors.backgroundSecondary,
    },
    
    blockquote: {
      borderLeftColor: colors.primary,
      backgroundColor: colors.infoBg,
    },
    
    code: {
      backgroundColor: colors.backgroundSecondary,
      color: colors.textSecondary,
    },
    
    codeBlock: {
      backgroundColor: colors.backgroundSecondary,
      borderColor: colors.border,
      borderWidth: borderWidth.hairline,
    },
    
    divider: {
      backgroundColor: colors.border,
    },
    
    // Tag colors
    tag: {
      backgroundColor: colors.backgroundSecondary,
      color: colors.textSecondary,
    },
    
    tagActive: {
      backgroundColor: colors.primary,
      color: palette.white,
    },
    
    // Status colors
    statusSuccess: {
      backgroundColor: colors.success,
      color: palette.white,
    },
    
    statusWarning: {
      backgroundColor: colors.warning,
      color: colors.text,
    },
    
    statusError: {
      backgroundColor: colors.error,
      color: palette.white,
    },
    
    statusInfo: {
      backgroundColor: colors.info,
      color: palette.white,
    },
    
    statusDefault: {
      backgroundColor: colors.textTertiary,
      color: palette.white,
    },
    
    // Loading colors
    loadingDots: {
      backgroundColor: colors.primary,
    },
  };
};

// Create dark theme content styles
const createDarkContentStyles = () => {
  const colors = darkColors;
  
  return {
    // Text colors
    primaryText: { color: colors.text },
    secondaryText: { color: colors.textSecondary },
    tertiaryText: { color: colors.textTertiary },
    lightText: { color: colors.textLight },
    
    // Background colors
    background: { backgroundColor: colors.background },
    surface: { backgroundColor: colors.surface },
    
    // Interactive colors
    link: { color: colors.link },
    linkHover: { color: colors.linkHover },
    
    // Element colors
    quote: {
      borderLeftColor: colors.primary,
      backgroundColor: colors.backgroundSecondary,
    },
    
    blockquote: {
      borderLeftColor: colors.primary,
      backgroundColor: colors.infoBg,
    },
    
    code: {
      backgroundColor: colors.backgroundSecondary,
      color: colors.textSecondary,
    },
    
    codeBlock: {
      backgroundColor: colors.backgroundSecondary,
      borderColor: colors.border,
      borderWidth: borderWidth.hairline,
    },
    
    divider: {
      backgroundColor: colors.border,
    },
    
    // Tag colors
    tag: {
      backgroundColor: colors.backgroundSecondary,
      color: colors.textSecondary,
    },
    
    tagActive: {
      backgroundColor: colors.primary,
      color: palette.white,
    },
    
    // Status colors
    statusSuccess: {
      backgroundColor: colors.success,
      color: palette.white,
    },
    
    statusWarning: {
      backgroundColor: colors.warning,
      color: colors.background, // Dark text on yellow
    },
    
    statusError: {
      backgroundColor: colors.error,
      color: palette.white,
    },
    
    statusInfo: {
      backgroundColor: colors.info,
      color: palette.white,
    },
    
    statusDefault: {
      backgroundColor: colors.textTertiary,
      color: palette.white,
    },
    
    // Loading colors
    loadingDots: {
      backgroundColor: colors.primary,
    },
  };
};

// Default content styles (light theme)
export const contentStyles = StyleSheet.create({
  // Typography
  ...contentTypography,
  
  // Reading sizes
  readingTiny: readingSizes.tiny,
  readingSmall: readingSizes.small,
  readingMedium: readingSizes.medium,
  readingLarge: readingSizes.large,
  readingExtraLarge: readingSizes.extraLarge,
  readingHuge: readingSizes.huge,
  
  // Layouts
  ...layouts,
  
  // Elements
  ...elements,
  
  // Metadata
  ...metadata,
  
  // States
  ...states,
  
  // Light theme colors
  ...createLightContentStyles(),
});

// Theme-aware content styles
export const getContentStyles = (isDark = false) => {
  const themeColors = isDark ? createDarkContentStyles() : createLightContentStyles();
  
  return {
    ...contentStyles,
    ...themeColors,
  };
};

// Utility functions for content styling
export const createReadingStyle = (fontSize = 16, isDark = false) => {
  const styles = getContentStyles(isDark);
  
  return [
    styles.body,
    {
      fontSize: fontSize,
      lineHeight: fontSize * 1.6, // Optimal reading line height
      color: isDark ? darkColors.text : lightColors.text,
    }
  ];
};

export const createTitleStyle = (level = 'medium', isDark = false) => {
  const styles = getContentStyles(isDark);
  const titleStyles = {
    large: styles.titleLarge,
    medium: styles.titleMedium,
    small: styles.titleSmall,
  };
  
  return [
    titleStyles[level] || titleStyles.medium,
    {
      color: isDark ? darkColors.text : lightColors.text,
    }
  ];
};

// Content preset combinations for common use cases
export const contentPresets = {
  // Article reading
  article: (isDark = false) => ({
    container: [contentStyles.article, getContentStyles(isDark).background],
    title: createTitleStyle('large', isDark),
    body: createReadingStyle(16, isDark),
  }),
  
  // Story reading  
  story: (isDark = false) => ({
    container: [contentStyles.reading, getContentStyles(isDark).background],
    title: createTitleStyle('large', isDark),
    body: createReadingStyle(16, isDark),
    paragraph: [contentStyles.paragraph],
  }),
  
  // Content preview
  preview: (isDark = false) => ({
    container: [contentStyles.previewCard, getContentStyles(isDark).surface],
    title: createTitleStyle('medium', isDark),
    body: createReadingStyle(14, isDark),
  }),
  
  // List item
  listItem: (isDark = false) => ({
    container: [contentStyles.listItem, { borderBottomColor: isDark ? darkColors.border : lightColors.border }],
    title: createTitleStyle('small', isDark),
    metadata: [contentStyles.metadata, getContentStyles(isDark).secondaryText],
  }),
  
  // Loading state
  loading: (isDark = false) => ({
    container: [contentStyles.loadingContainer, getContentStyles(isDark).background],
    text: [contentStyles.loadingText, getContentStyles(isDark).secondaryText],
    subtext: [contentStyles.loadingSubtext, getContentStyles(isDark).tertiaryText],
  }),
  
  // Empty state
  empty: (isDark = false) => ({
    container: [contentStyles.emptyContainer, getContentStyles(isDark).background],
    title: [contentStyles.emptyTitle, getContentStyles(isDark).primaryText],
    text: [contentStyles.emptyText, getContentStyles(isDark).secondaryText],
  }),
};

// Export individual style objects for direct import
export const lightContentStyles = createLightContentStyles();
export const darkContentStyles = createDarkContentStyles();

// Typography helpers
export const getContentTextColors = (isDark = false) => {
  const colors = isDark ? darkColors : lightColors;
  
  return {
    primary: colors.text,
    secondary: colors.textSecondary,
    tertiary: colors.textTertiary,
    light: colors.textLight,
    link: colors.link,
    linkHover: colors.linkHover,
  };
};

// Reading experience helpers
export const getOptimalReadingWidth = () => 680; // Based on typography research
export const getOptimalLineHeight = (fontSize) => fontSize * 1.6; // 1.6 ratio for readability
export const getOptimalParagraphSpacing = (fontSize) => fontSize * 1.2; // Related to font size

// 11,247 characters