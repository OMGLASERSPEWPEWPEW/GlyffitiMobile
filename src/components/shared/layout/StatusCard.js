// src/components/shared/layout/StatusCard.js
// Path: src/components/shared/layout/StatusCard.js
import React from 'react';
import { View, Text } from 'react-native';
import { colors, spacing } from '../../../styles/tokens';
import { cardStyles } from '../../../styles/cardStyles';
import Card from './Card';
import Button from '../ui/Button';

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
      },
      warning: {
        background: isDarkMode ? '#92400e' + '40' : colors.warning + '20',
        border: isDarkMode ? '#f59e0b' : colors.warning,
        text: isDarkMode ? '#f59e0b' : colors.warning,
      },
      error: {
        background: isDarkMode ? '#991b1b' + '40' : colors.error + '20',
        border: isDarkMode ? '#ef4444' : colors.error,
        text: isDarkMode ? '#ef4444' : colors.error,
      },
      info: {
        background: isDarkMode ? '#1e40af' + '40' : colors.primary + '20',
        border: isDarkMode ? '#3b82f6' : colors.primary,
        text: isDarkMode ? '#3b82f6' : colors.primary,
      },
      default: {
        background: isDarkMode ? '#374151' : '#ffffff',
        border: isDarkMode ? '#6b7280' : colors.border,
        text: isDarkMode ? '#e5e7eb' : colors.text,
      },
    };

    return baseColors[status] || baseColors.default;
  };

  const statusColors = getStatusColors();
  const textColor = isDarkMode ? '#e5e7eb' : colors.text;
  const subtitleColor = isDarkMode ? '#9ca3af' : colors.textSecondary;

  return (
    <Card
      isDarkMode={isDarkMode}
      backgroundColor={statusColors.background}
      borderColor={statusColors.border}
      style={[cardStyles.statusCard, style]}
      {...cardProps}
    >
      {/* Title */}
      {title && (
        <Text style={[
          cardStyles.statusTitle,
          { color: textColor },
          titleStyle
        ]}>
          {title}
        </Text>
      )}

      {/* Subtitle */}
      {subtitle && (
        <Text style={[
          cardStyles.statusSubtitle,
          { color: subtitleColor },
          subtitleStyle
        ]}>
          {subtitle}
        </Text>
      )}

      {/* Content */}
      {content && (
        <View style={[cardStyles.statusContentContainer, contentStyle]}>
          {typeof content === 'string' ? (
            <Text style={[
              cardStyles.statusContent,
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
        <Button
          title={actionText}
          onPress={onActionPress}
          disabled={actionDisabled || actionLoading}
          loading={actionLoading}
          variant={status === 'error' ? 'danger' : 
                  status === 'warning' ? 'warning' : 
                  status === 'success' ? 'success' : 'primary'}
          size="medium"
          isDarkMode={isDarkMode}
          style={[{ marginTop: spacing.small }, actionStyle]}
        />
      )}
    </Card>
  );
};

export default StatusCard;

// Character count: 3025