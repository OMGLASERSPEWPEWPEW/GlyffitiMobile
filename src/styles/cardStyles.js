// src/styles/cardStyles.js
// Path: src/styles/cardStyles.js
import { StyleSheet } from 'react-native';
import { spacing, typography } from './tokens';

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
    fontSize: 16,
    fontFamily: typography.fontFamilyBold,
    lineHeight: 22,
    marginBottom: spacing.extraSmall,
  },
  contentAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  contentAuthorText: {
    fontSize: 13,
    fontFamily: typography.fontFamily,
    marginLeft: spacing.extraSmall,
  },
  contentCacheIndicator: {
    borderRadius: 12,
    paddingHorizontal: spacing.small,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  contentCacheText: {
    fontSize: 10,
    fontFamily: typography.fontFamily,
    fontWeight: '600',
  },
  contentPreviewContainer: {
    marginBottom: spacing.small,
  },
  contentPreviewText: {
    fontSize: 14,
    fontFamily: typography.fontFamily,
    lineHeight: 20,
  },
  contentMetadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  contentStatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.medium,
  },
  contentMetadataText: {
    fontSize: 12,
    fontFamily: typography.fontFamily,
    marginLeft: 4,
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
    borderRadius: 12,
    paddingHorizontal: spacing.small,
    paddingVertical: 4,
    marginRight: spacing.small,
    marginBottom: spacing.small,
  },
  contentTagText: {
    fontSize: 11,
    fontFamily: typography.fontFamily,
    fontWeight: '500',
  },

  // Base Card styles (if needed)
  baseCard: {
    // Base styles are applied through props in Card component
    // This allows for maximum flexibility while maintaining consistency
  },
});

// Character count: 2687