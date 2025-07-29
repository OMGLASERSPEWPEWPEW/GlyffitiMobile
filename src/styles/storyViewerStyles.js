// src/styles/storyViewerStyles.js
// Path: src/styles/storyViewerStyles.js
import { StyleSheet } from 'react-native';
import { colors, spacing } from '.';

export const storyViewerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerDark: {
    backgroundColor: colors.backgroundDark,
  },
  contentContainer: {
    flex: 1,
  },
  contentContainerDark: {
    backgroundColor: colors.backgroundDark,
  },
  scrollContent: {
    paddingHorizontal: spacing.medium,
    paddingBottom: spacing.large,
  },
  bottomLoadingContainer: {
    marginTop: spacing.large,
    paddingVertical: spacing.medium,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bottomLoadingContainerDark: {
    borderTopColor: '#374151',
  },
  bottomErrorContainer: {
    marginTop: spacing.large,
    paddingVertical: spacing.medium,
    borderTopWidth: 1,
    borderTopColor: colors.error,
  },
  bottomErrorContainerDark: {
    borderTopColor: '#ef4444',
  },
  fullScreenError: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.large,
  },
  compactErrorContainer: {
    marginVertical: spacing.small,
    borderRadius: 8,
    overflow: 'hidden',
  },
});

// Character count: 1086