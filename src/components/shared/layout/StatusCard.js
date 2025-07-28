// src/components/shared/StatusCard.js
// Path: src/components/shared/StatusCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../../../styles';
import Card from './Card';

/**
 * Status card component for displaying status information
 * Used for wallet status, publishing status, connection status, etc.
 * Supports different status types with appropriate styling and actions
 */
const StatusCard = ({
  title,
  subtitle,
  content,
  status = 'default', // 'success', 'warning', 'error', 'info', 'default'
  actionText,
  onActionPress,
  actionDisabled = false,
  actionLoading = false,
  isDarkMode = false,
  style,
  titleStyle,
  subtitleStyle,
  contentStyle,
  actionStyle,
  children,
  ...cardProps
}) => {
  // Status-based styling
  const getStatusColors = () => {
    const baseColors = {
      success: {
        background: isDarkMode ? '#065f46' + '40' : colors.success + '20',
        border: isDarkMode ? '#10b981' : colors.success,
        text: isDarkMode ? '#10b981' : colors.success,
        action: isDarkMode ? '#10b981' : colors.success,
      },
      warning: {
        background: isDarkMode ? '#92400e' + '40' : colors.warning + '20',
        border: isDarkMode ? '#f59e0b' : colors.warning,
        text: isDarkMode ? '#f59e0b' : colors.warning,
        action: isDarkMode ? '#f59e0b' : colors.warning,
      },
      error: {
        background: isDarkMode ? '#991b1b' + '40' : colors.error + '20',
        border: isDarkMode ? '#ef4444' : colors.error,
        text: isDarkMode ? '#ef4444' : colors.error,
        action: isDarkMode ? '#ef4444' : colors.error,
      },
      info: {
        background: isDarkMode ? '#1e40af' + '40' : colors.primary + '20',
        border: isDarkMode ? '#3b82f6' : colors.primary,
        text: isDarkMode ? '#3b82f6' : colors.primary,
        action: isDarkMode ? '#3b82f6' : colors.primary,
      },
      default: {
        background: isDarkMode ? '#374151' : '#ffffff',
        border: isDarkMode ? '#6b7280' : colors.border,
        text: isDarkMode ? '#e5e7eb' : colors.text,
        action: isDarkMode ? '#3b82f6' : colors.primary,
      },
    };

    return baseColors[status] || baseColors.default;
  };

  const statusColors = getStatusColors();
  const textColor = isDarkMode ? '#e5e7eb' : colors.text;
  const subtitleColor = isDarkMode ? '#9ca3af' : colors.textSecondary;

  // Action button styling
  const getActionButtonStyle = () => {
    const baseStyle = [styles.actionButton];
    
    if (actionDisabled || actionLoading) {
      baseStyle.push(styles.actionButtonDisabled);
      return baseStyle;
    }

    // Status-specific action button styling
    switch (status) {
      case 'success':
        return [...baseStyle, { backgroundColor: statusColors.action }];
      case 'warning':
        return [...baseStyle, { backgroundColor: statusColors.action }];
      case 'error':
        return [...baseStyle, { backgroundColor: statusColors.action }];
      case 'info':
        return [...baseStyle, { backgroundColor: statusColors.action }];
      default:
        return [...baseStyle, { backgroundColor: statusColors.action }];
    }
  };

  const getActionTextStyle = () => {
    if (actionDisabled || actionLoading) {
      return [styles.actionButtonText, styles.actionButtonTextDisabled];
    }
    return [styles.actionButtonText, { color: '#ffffff' }];
  };

  return (
    <Card
      isDarkMode={isDarkMode}
      backgroundColor={statusColors.background}
      borderColor={statusColors.border}
      style={[styles.statusCard, style]}
      {...cardProps}
    >
      {/* Title */}
      {title && (
        <Text style={[
          styles.title,
          { color: textColor },
          titleStyle
        ]}>
          {title}
        </Text>
      )}

      {/* Subtitle */}
      {subtitle && (
        <Text style={[
          styles.subtitle,
          { color: subtitleColor },
          subtitleStyle
        ]}>
          {subtitle}
        </Text>
      )}

      {/* Content */}
      {content && (
        <View style={[styles.contentContainer, contentStyle]}>
          {typeof content === 'string' ? (
            <Text style={[
              styles.content,
              { color: textColor }
            ]}>
              {content}
            </Text>
          ) : (
            content
          )}
        </View>
      )}

      {/* Custom children */}
      {children}

      {/* Action button */}
      {actionText && onActionPress && (
        <TouchableOpacity
          style={[...getActionButtonStyle(), actionStyle]}
          onPress={onActionPress}
          disabled={actionDisabled || actionLoading}
        >
          <Text style={getActionTextStyle()}>
            {actionLoading ? '⏳ Loading...' : actionText}
          </Text>
        </TouchableOpacity>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  statusCard: {
    // Additional card-specific styling can go here
  },
  title: {
    fontSize: 18,
    fontFamily: typography.fontFamilyBold,
    marginBottom: spacing.small,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: typography.fontFamily,
    marginBottom: spacing.medium,
    lineHeight: 20,
  },
  contentContainer: {
    marginBottom: spacing.medium,
  },
  content: {
    fontSize: 14,
    fontFamily: typography.fontFamily,
    lineHeight: 20,
  },
  actionButton: {
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.medium,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.small,
  },
  actionButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: typography.fontFamily,
    fontWeight: '500',
  },
  actionButtonTextDisabled: {
    color: '#9ca3af',
  },
});

export default StatusCard;

// Character count: 4954