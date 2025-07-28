// src/styles/cardStyles.js
// Path: src/styles/cardStyles.js
import { StyleSheet } from 'react-native';
import { spacing, typography } from './index';

export const cardStyles = StyleSheet.create({
  // StatusCard styles
  statusCard: {
    // Additional card-specific styling can go here
  },
  statusTitle: {
    fontSize: 18,
    fontFamily: typography.fontFamilyBold,
    marginBottom: spacing.small,
  },
  statusSubtitle: {
    fontSize: 14,
    fontFamily: typography.fontFamily,
    marginBottom: spacing.medium,
    lineHeight: 20,
  },
  statusContentContainer: {
    marginBottom: spacing.medium,
  },
  statusContent: {
    fontSize: 14,
    fontFamily: typography.fontFamily,
    lineHeight: 20,
  },

  // ContentCard styles
  contentCard: {
    // Additional card-specific styling handled by Card component
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.small,
  },
  contentTitleSection: {
    flex: 1,
    marginRight: spacing.small,
  },
  contentTitle: {
    fontSize: 18,
    fontFamily: typography.fontFamilyBold,
    lineHeight: 24,
    marginBottom: spacing.extraSmall,
  },
  contentAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentAuthorText: {
    fontSize: 14,
    fontFamily: typography.fontFamily,
    marginLeft: spacing.extraSmall,
  },
  contentCacheIndicator: {
    padding: spacing.small,
    borderRadius: 20,
    marginLeft: spacing.small,
  },
  contentBookmarkButton: {
    padding: spacing.small,
    marginLeft: spacing.small,
  },
  contentPreviewText: {
    fontSize: 14,
    fontFamily: typography.fontFamily,
    lineHeight: 20,
    marginBottom: spacing.medium,
  },
  contentMetadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  contentMetadataLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentMetadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.medium,
  },
  contentMetadataText: {
    fontSize: 12,
    fontFamily: typography.fontFamily,
    marginLeft: spacing.extraSmall,
  },
  contentTimeAgo: {
    fontSize: 12,
    fontFamily: typography.fontFamily,
  },
  contentTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.small,
  },
  contentTag: {
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.extraSmall,
    borderRadius: 12,
    marginRight: spacing.small,
    marginBottom: spacing.extraSmall,
  },
  contentTagText: {
    fontSize: 11,
    fontFamily: typography.fontFamily,
  },

  // Base Card styles (if needed)
  baseCard: {
    // Base styles are applied through props in Card component
    // This allows for maximum flexibility while maintaining consistency
  },
});

// Character count: 2687