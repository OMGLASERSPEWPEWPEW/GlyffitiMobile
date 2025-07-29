// src/styles/homeStyles.js
// Path: src/styles/homeStyles.js
import { StyleSheet, Dimensions } from 'react-native';
// Import directly to avoid circular reference issues
import { colors, spacing } from '.';

const { width } = Dimensions.get('window');

export const homeStyles = StyleSheet.create({
  // Base container styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.medium,
    paddingBottom: spacing.large,
  },

  // Header section
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xxlarge || 48,
    paddingHorizontal: spacing.medium,
  },
  appTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.small,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },

  // Section styles
  mainSection: {
    marginBottom: spacing.large,
  },
  secondarySection: {
    marginBottom: spacing.large,
  },
  infoSection: {
    marginBottom: spacing.large,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.medium,
    textAlign: 'center',
  },

  // Primary button content (for Card component usage)
  primaryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryButtonIcon: {
    fontSize: 32,
    marginRight: spacing.medium,
  },
  primaryButtonTextContainer: {
    flex: 1,
  },
  primaryButtonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  primaryButtonSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    lineHeight: 20,
  },

  // Secondary buttons grid
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.medium,
  },
  secondaryButtonContainer: {
    width: (width - 52) / 2, // Account for padding and gap
  },
  secondaryButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  secondaryButtonIcon: {
    fontSize: 24,
    marginBottom: spacing.small,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  comingSoon: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Info card content (for Card component usage)
  infoCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: spacing.medium,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.large,
    paddingHorizontal: spacing.medium,
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
});

// Character count: 2896