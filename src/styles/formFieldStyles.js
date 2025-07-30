// src/styles/formFieldStyles.js
// Path: src/styles/formFieldStyles.js
import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from './tokens';

export const formFieldStyles = StyleSheet.create({
  container: {
    marginBottom: spacing.medium,
  },
  label: {
    fontSize: 14,
    fontFamily: typography.fontFamily,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.small,
  },
  labelDark: {
    color: '#e5e7eb',
  },
  required: {
    color: colors.error,
  },
  requiredDark: {
    color: '#ef4444',
  },
  inputContainer: {
    // No styles needed - just a wrapper
  },
  error: {
    fontSize: 12,
    fontFamily: typography.fontFamily,
    color: colors.error,
    marginTop: spacing.small,
    lineHeight: 16,
  },
  errorDark: {
    color: '#ef4444',
  },
  helpText: {
    fontSize: 12,
    fontFamily: typography.fontFamily,
    color: colors.textSecondary,
    marginTop: spacing.small,
    lineHeight: 16,
  },
  helpTextDark: {
    color: '#9ca3af',
  },
});

// Character count: 922