// src/components/shared/layout/StatusCard.js
// Path: src/components/shared/layout/StatusCard.js
import React from 'react';
import { View, Text } from 'react-native';
import { getCardStyles, getCardTextColors } from '../../../styles/components';
import { spacing } from '../../../styles/tokens';
import Card from './Card';
import Button from '../ui/Button';

/**
 * Status card component for displaying status information
 * Used for wallet status, publishing status, connection status, etc.
 * Supports different status types with appropriate styling and actions
 * 
 * MIGRATED: Now uses the new design system card components
 * - Replaced broken cardStyles import with getCardStyles()
 * - Replaced manual status colors with design system status variants
 * - Added proper theme-aware styling
 * - Maintained exact same component interface for backwards compatibility
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
  // Get theme-aware card styles and text colors
  const cardStyles = getCardStyles(isDarkMode);
  const textColors = getCardTextColors(isDarkMode);

  // Map status to card variant and button variant
  const mapStatusToVariant = (statusType) => {
    const statusMap = {
      success: 'success',
      warning: 'warning', 
      error: 'error',
      info: 'info',
      default: 'default'
    };
    return statusMap[statusType] || 'default';
  };

  // Map status to button variant (preserve original button logic)
  const mapStatusToButtonVariant = (statusType) => {
    const buttonMap = {
      error: 'danger',     // Map error -> danger for button (as in original)
      warning: 'warning',
      success: 'success',
      info: 'primary',     // Map info -> primary for button
      default: 'primary'
    };
    return buttonMap[statusType] || 'primary';
  };

  const cardVariant = mapStatusToVariant(status);
  const buttonVariant = mapStatusToButtonVariant(status);

  // Get appropriate text colors from design system
  const getTitleColor = () => {
    // For status cards, use primary text color (title should be prominent)
    return textColors.primary;
  };

  const getSubtitleColor = () => {
    // For subtitles, use secondary text color
    return textColors.secondary;
  };

  const getContentColor = () => {
    // For content, use primary text color for readability
    return textColors.primary;
  };

  // Create card style for status variant
  const cardStyle = [
    cardVariant !== 'default' && cardStyles[cardVariant],
    style
  ];

  // Text styles from design system
  const titleTextStyle = [
    cardStyles.title || {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: spacing.extraSmall || 4,
    },
    { color: getTitleColor() },
    titleStyle
  ];

  const subtitleTextStyle = [
    cardStyles.subtitle || {
      fontSize: 14,
      fontWeight: '400',
      marginBottom: spacing.small || 8,
    },
    { color: getSubtitleColor() },
    subtitleStyle
  ];

  const contentTextStyle = [
    cardStyles.body || {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    { color: getContentColor() },
  ];

  return (
    <Card
      isDarkMode={isDarkMode}
      variant={cardVariant}
      elevation="low"
      style={cardStyle}
      {...cardProps}
    >
      {/* Title */}
      {title && (
        <Text style={titleTextStyle}>
          {title}
        </Text>
      )}

      {/* Subtitle */}
      {subtitle && (
        <Text style={subtitleTextStyle}>
          {subtitle}
        </Text>
      )}

      {/* Content */}
      {content && (
        <View style={[
          { marginBottom: spacing.small || 8 },
          contentStyle
        ]}>
          {typeof content === 'string' ? (
            <Text style={contentTextStyle}>
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
          variant={buttonVariant}
          size="medium"
          isDarkMode={isDarkMode}
          style={[
            { marginTop: spacing.small || 8 },
            actionStyle
          ]}
        />
      )}
    </Card>
  );
};

export default StatusCard;

// Character count: 3,693