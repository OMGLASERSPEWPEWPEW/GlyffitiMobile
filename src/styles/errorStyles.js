// src/styles/errorStyles.js
// Path: src/styles/errorStyles.js
import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from './index';

export const errorStyles = StyleSheet.create({
  // ErrorBoundary styles
  boundaryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.large,
  },
  boundaryContainerDark: {
    backgroundColor: '#1f2937',
  },
  boundaryCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.extraLarge,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    maxWidth: 350,
    width: '100%',
  },
  boundaryCardDark: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
  },
  boundaryIcon: {
    marginBottom: spacing.medium,
  },
  boundaryTitle: {
    fontSize: 20,
    fontFamily: typography.fontFamilyBold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.small,
  },
  boundaryTitleDark: {
    color: '#e5e7eb',
  },
  boundaryDescription: {
    fontSize: 16,
    fontFamily: typography.fontFamily,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.large,
  },
  boundaryDescriptionDark: {
    color: '#9ca3af',
  },
  boundaryErrorDetails: {
    fontSize: 12,
    fontFamily: typography.fontFamilyMono || typography.fontFamily,
    color: colors.textSecondary,
    textAlign: 'left',
    backgroundColor: '#f3f4f6',
    padding: spacing.medium,
    borderRadius: 8,
    marginBottom: spacing.large,
    alignSelf: 'stretch',
  },
  boundaryErrorDetailsDark: {
    backgroundColor: '#374151',
    color: '#9ca3af',
  },
  boundaryActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.medium,
    width: '100%',
  },
  boundaryRetryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
    flex: 1,
    justifyContent: 'center',
  },
  boundaryFallbackButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boundaryFallbackButtonDark: {
    borderColor: '#6b7280',
  },
  boundaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: typography.fontFamilyMedium || typography.fontFamily,
  },
  boundaryFallbackButtonText: {
    color: colors.text,
    fontSize: 16,
    fontFamily: typography.fontFamily,
  },
  boundaryFallbackButtonTextDark: {
    color: '#e5e7eb',
  },
  boundaryRetryCount: {
    fontSize: 12,
    fontFamily: typography.fontFamily,
    color: colors.textSecondary,
    marginTop: spacing.medium,
    textAlign: 'center',
  },
  boundaryRetryCountDark: {
    color: '#9ca3af',
  },

  // ErrorDisplay styles
  displayContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.large,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  displayContainerDark: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
  },
  displayIcon: {
    marginBottom: spacing.medium,
  },
  displayTitle: {
    fontSize: 18,
    fontFamily: typography.fontFamilyBold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.small,
  },
  displayTitleDark: {
    color: '#e5e7eb',
  },
  displayMessage: {
    fontSize: 14,
    fontFamily: typography.fontFamily,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.medium,
  },
  displayMessageDark: {
    color: '#9ca3af',
  },
  displayActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.medium,
    width: '100%',
  },

  // RetryButton styles
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.small,
    minWidth: 120,
  },
  retryButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.6,
  },
  retryButtonLoading: {
    backgroundColor: colors.primary,
    opacity: 0.8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: typography.fontFamilyMedium || typography.fontFamily,
  },
  retryButtonTextDisabled: {
    color: '#ffffff',
    opacity: 0.7,
  },
  retryButtonIcon: {
    // Icon styles handled by component
  },

  // Status-based error styles
  errorSuccess: {
    borderColor: colors.success || '#10b981',
    backgroundColor: colors.success ? colors.success + '10' : '#10b98110',
  },
  errorWarning: {
    borderColor: colors.warning || '#f59e0b',
    backgroundColor: colors.warning ? colors.warning + '10' : '#f59e0b10',
  },
  errorDanger: {
    borderColor: colors.error || '#ef4444',
    backgroundColor: colors.error ? colors.error + '10' : '#ef444410',
  },
  errorInfo: {
    borderColor: colors.primary || '#3b82f6',
    backgroundColor: colors.primary ? colors.primary + '10' : '#3b82f610',
  },

  // Text colors for different error types
  errorSuccessText: {
    color: colors.success || '#10b981',
  },
  errorWarningText: {
    color: colors.warning || '#f59e0b',
  },
  errorDangerText: {
    color: colors.error || '#ef4444',
  },
  errorInfoText: {
    color: colors.primary || '#3b82f6',
  },

  // Dark mode variants for status colors
  errorSuccessTextDark: {
    color: '#10b981',
  },
  errorWarningTextDark: {
    color: '#f59e0b',
  },
  errorDangerTextDark: {
    color: '#ef4444',
  },
  errorInfoTextDark: {
    color: '#3b82f6',
  },
});

// Character count: 5247