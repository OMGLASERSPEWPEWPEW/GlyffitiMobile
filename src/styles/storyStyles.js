// src/styles/storyStyles.js
// Path: src/styles/storyStyles.js
import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from './index';

export const storyStyles = StyleSheet.create({
  // StoryErrorDisplay styles
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
    fontSize: 24,
    fontFamily: typography.fontFamilyBold,
    textAlign: 'center',
    marginBottom: spacing.medium,
  },
  errorStoryTitle: {
    fontSize: 16,
    fontFamily: typography.fontFamily,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: spacing.medium,
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
    marginBottom: spacing.medium,
    lineHeight: 24,
  },
  errorSuggestion: {
    fontSize: 14,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
    marginBottom: spacing.large,
    opacity: 0.8,
    lineHeight: 20,
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
    fontSize: 12,
    fontFamily: typography.fontFamilyBold,
    marginBottom: spacing.small,
    opacity: 0.7,
  },
  errorTechnicalText: {
    fontSize: 11,
    fontFamily: 'monospace',
    opacity: 0.6,
    backgroundColor: colors.border + '30',
    padding: spacing.small,
    borderRadius: 4,
  },
  errorTipsContainer: {
    marginTop: spacing.medium,
    width: '100%',
  },
  errorTipsTitle: {
    fontSize: 12,
    fontFamily: typography.fontFamilyBold,
    marginBottom: spacing.small,
    opacity: 0.7,
  },
  errorTipText: {
    fontSize: 11,
    fontFamily: typography.fontFamily,
    marginBottom: spacing.extraSmall,
    opacity: 0.6,
    lineHeight: 16,
  },

  // Compact error styles
  errorCompactContainer: {
    backgroundColor: colors.error + '10',
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    paddingVertical: spacing.medium,
    paddingHorizontal: spacing.medium,
    borderRadius: 4,
    marginVertical: spacing.small,
  },
  errorCompactContainerDark: {
    backgroundColor: colors.error + '20',
  },
  errorCompactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  errorCompactIcon: {
    marginRight: spacing.small,
  },
  errorCompactText: {
    flex: 1,
    fontSize: 14,
    fontFamily: typography.fontFamilyBold,
  },
  errorCompactRetryButton: {
    padding: spacing.small,
  },
  errorCompactMessage: {
    fontSize: 12,
    fontFamily: typography.fontFamily,
    lineHeight: 16,
  },

  // Future story component styles can go here:
  // StoryHeader styles (when we move them)
  // storyHeaderContainer: { ... },
  
  // StoryContent styles (when we move them)  
  // storyContentContainer: { ... },
  
  // StoryViewer styles (when we move them)
  // storyViewerContainer: { ... },
});

// Character count: 2846