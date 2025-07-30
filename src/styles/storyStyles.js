// src/styles/storyStyles.js
// Path: src/styles/storyStyles.js
import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from './tokens';
import { getScreenStyles } from './layouts/screens';
import { getCardStyles } from './components/cards';
import { getButtonStyles } from './components/buttons';

export const storyStyles = StyleSheet.create({
  // StoryErrorDisplay styles - using your new token system
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorContainerDark: {
    backgroundColor: colors.backgroundDark,
  },
  
  errorHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.medium,
    paddingTop: spacing.medium,
  },
  
  errorBackButton: {
    padding: spacing.small,
  },
  
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.large,
  },
  
  errorIcon: {
    marginBottom: spacing.large,
  },
  
  errorTitle: {
    fontSize: typography.fontSize.title,
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.medium,
    color: colors.text,
  },
  
  errorStoryTitle: {
    fontSize: typography.fontSize.medium,
    fontFamily: typography.fontFamily,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: spacing.medium,
    color: colors.textSecondary,
  },
  
  errorMessage: {
    fontSize: typography.fontSize.medium,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
    marginBottom: spacing.medium,
    lineHeight: typography.lineHeight.relaxed,
    color: colors.text,
  },
  
  errorSuggestion: {
    fontSize: typography.fontSize.small,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
    marginBottom: spacing.large,
    opacity: 0.8,
    lineHeight: typography.lineHeight.normal,
    color: colors.textSecondary,
  },
  
  errorActionContainer: {
    flexDirection: 'row',
    marginBottom: spacing.large,
    gap: spacing.medium,
  },
  
  errorTechnicalContainer: {
    marginTop: spacing.large,
    paddingTop: spacing.medium,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    width: '100%',
  },
  
  errorTechnicalLabel: {
    fontSize: typography.fontSize.small,
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.small,
    opacity: 0.7,
    color: colors.textTertiary,
  },
  
  errorTechnicalText: {
    fontSize: 11,
    fontFamily: 'monospace',
    opacity: 0.6,
    backgroundColor: colors.border + '30',
    padding: spacing.small,
    borderRadius: 4,
    color: colors.textSecondary,
  },
  
  errorTipsContainer: {
    marginTop: spacing.medium,
    width: '100%',
  },
  
  errorTipsTitle: {
    fontSize: typography.fontSize.small,
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.small,
    opacity: 0.7,
    color: colors.textTertiary,
  },
  
  errorTipText: {
    fontSize: 11,
    fontFamily: typography.fontFamily,
    marginBottom: spacing.extraSmall,
    opacity: 0.6,
    lineHeight: typography.lineHeight.normal,
    color: colors.textSecondary,
  },

  // Story reader styles
  readerContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  readerContent: {
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.large,
  },
  
  storyTitle: {
    fontSize: typography.fontSize.heading,
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.medium,
    lineHeight: typography.lineHeight.tight,
    color: colors.text,
  },
  
  storyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.large,
    paddingBottom: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  
  authorInfo: {
    flex: 1,
  },
  
  authorName: {
    fontSize: typography.fontSize.medium,
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  
  publishDate: {
    fontSize: typography.fontSize.small,
    fontFamily: typography.fontFamily,
    color: colors.textSecondary,
    marginTop: 2,
  },
  
  storyStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.medium,
  },
  
  statItem: {
    alignItems: 'center',
  },
  
  statNumber: {
    fontSize: typography.fontSize.small,
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  
  statLabel: {
    fontSize: typography.fontSize.small,
    fontFamily: typography.fontFamily,
    color: colors.textSecondary,
  },
  
  // Story content
  storyBody: {
    fontSize: typography.fontSize.medium,
    fontFamily: typography.fontFamily,
    lineHeight: typography.lineHeight.relaxed,
    color: colors.text,
    marginBottom: spacing.medium,
  },
  
  storyParagraph: {
    marginBottom: spacing.medium,
  },
  
  // Story navigation
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.medium,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  
  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  
  loadingText: {
    fontSize: typography.fontSize.medium,
    fontFamily: typography.fontFamily,
    color: colors.textSecondary,
    marginTop: spacing.medium,
  },
});

// Theme-aware getter function
export const getStoryStyles = (isDark = false) => {
  return {
    ...storyStyles,
    // Theme-specific overrides
    errorContainer: {
      ...storyStyles.errorContainer,
      backgroundColor: isDark ? colors.backgroundDark : colors.background,
    },
    readerContainer: {
      ...storyStyles.readerContainer,
      backgroundColor: isDark ? colors.backgroundDark : colors.background,
    },
    loadingContainer: {
      ...storyStyles.loadingContainer,
      backgroundColor: isDark ? colors.backgroundDark : colors.background,
    },
  };
};

// Helper function to get story styles that leverage your component system
export const getStoryComponentStyles = (isDark = false) => {
  const screenStyles = getScreenStyles(isDark);
  const cardStyles = getCardStyles(isDark);
  const buttonStyles = getButtonStyles(isDark);
  
  return {
    // Use your screen layout system
    container: [screenStyles.reading, screenStyles.safe],
    
    // Use your card system for meta information
    metaCard: cardStyles.compact,
    
    // Use your button system for navigation
    navButton: buttonStyles.secondary,
    backButton: [buttonStyles.secondary, buttonStyles.small],
    
    // Combine with story-specific styles
    ...getStoryStyles(isDark),
  };
};

// Character count: 6,043