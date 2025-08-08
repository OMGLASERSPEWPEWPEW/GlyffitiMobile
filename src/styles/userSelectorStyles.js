// src/styles/userSelectorStyles.js
// Path: src/styles/userSelectorStyles.js

import { StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, typography, borderRadius, borderWidth, shadows } from './tokens';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Styles for UserSelector component
 * Follows the established token-based design system
 */
export const userSelectorStyles = StyleSheet.create({
  container: {
    marginBottom: spacing.large,
  },

  // Current User Button Styles
  currentUserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.medium,
    borderRadius: borderRadius.medium,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    ...shadows.small,
  },

  currentUserContent: {
    flex: 1,
  },

  currentUserLabel: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.small / 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  currentUserName: {
    fontSize: typography.fontSize.large,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.small / 2,
  },

  currentUserKey: {
    fontSize: typography.fontSize.small,
  },

  switchIcon: {
    fontSize: typography.fontSize.medium,
    marginLeft: spacing.small,
  },

  // User Data Container Styles
  userDataContainer: {
    marginTop: spacing.medium,
    padding: spacing.medium,
    borderRadius: borderRadius.medium,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.medium,
  },

  loadingText: {
    marginLeft: spacing.small,
    fontSize: typography.fontSize.small,
  },

  dataFields: {
    // Container for data rows
  },

  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.tiny,
    borderBottomWidth: borderWidth.hairline,
    borderBottomColor: colors.border + '20', // 20% opacity
  },

  dataLabel: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.medium,
    width: 100,
  },

  dataValue: {
    flex: 1,
    fontSize: typography.fontSize.small,
  },

  // Error Container Styles
  errorContainer: {
    alignItems: 'center',
    padding: spacing.medium,
  },

  errorText: {
    fontSize: typography.fontSize.small,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.small,
  },

  retryButton: {
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.small,
  },

  retryButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.medium,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    maxHeight: screenWidth * 0.8,
    borderTopLeftRadius: borderRadius.large,
    borderTopRightRadius: borderRadius.large,
    paddingBottom: spacing.xlarge,
    ...shadows.large,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.medium,
    borderBottomWidth: borderWidth.thin,
    borderBottomColor: colors.border,
  },

  modalTitle: {
    fontSize: typography.fontSize.large,
    fontWeight: typography.fontWeight.bold,
  },

  closeButton: {
    padding: spacing.small,
  },

  closeButtonText: {
    fontSize: typography.fontSize.xlarge,
    fontWeight: typography.fontWeight.bold,
  },

  // User List Styles
  userList: {
    maxHeight: screenWidth * 0.6,
  },

  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.medium,
    marginHorizontal: spacing.medium,
    marginVertical: spacing.tiny,
    borderRadius: borderRadius.small,
  },

  selectedUserItem: {
    borderWidth: borderWidth.thin,
    borderColor: colors.primary,
  },

  userItemContent: {
    flex: 1,
  },

  userItemName: {
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.tiny / 2,
  },

  userItemKey: {
    fontSize: typography.fontSize.small,
  },

  checkmark: {
    fontSize: typography.fontSize.large,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
    marginLeft: spacing.small,
  },

  separator: {
    height: borderWidth.hairline,
    marginHorizontal: spacing.medium,
  },

  // Empty State Styles
  emptyContainer: {
    padding: spacing.xlarge,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyText: {
    fontSize: typography.fontSize.small,
    textAlign: 'center',
    lineHeight: typography.fontSize.small * 1.5,
  },
});

// Character count: 4321