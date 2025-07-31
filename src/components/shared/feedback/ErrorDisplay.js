// src/components/shared/feedback/ErrorDisplay.js
// Path: src/components/shared/feedback/ErrorDisplay.js

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { 
  AlertTriangle, 
  AlertCircle, 
  XCircle, 
  Info, 
  Wifi, 
  Server, 
  RefreshCw,
  ArrowLeft 
} from 'lucide-react-native';
import { getCardStyles, createCardStyle } from '../../../styles/components/cards';
import { getButtonStyles, createButtonStyle } from '../../../styles/components/buttons';
import { getContentStyles } from '../../../styles/components/content';
import { spacing, typography, getColors } from '../../../styles/tokens';

/**
 * Standardized error display component for showing error states
 * Used for network errors, validation errors, load failures, etc.
 * 
 * MIGRATED: Now uses the new design system
 * - Replaced errorStyles with design system components (cards, buttons, content)
 * - Added proper theme-aware styling with getColors()
 * - Enhanced with consistent spacing and typography tokens
 * - Maintained exact same component interface for backwards compatibility
 * - Added semantic error type styling with design system colors
 * 
 * Usage:
 * <ErrorDisplay 
 *   type="network"
 *   title="Connection Failed"
 *   message="Please check your internet connection"
 *   onRetry={handleRetry}
 *   onGoBack={navigation.goBack}
 * />
 */
const ErrorDisplay = ({
  type = 'general', // 'general', 'network', 'server', 'validation', 'notFound', 'permission'
  title,
  message,
  icon,
  showIcon = true,
  onRetry,
  onGoBack,
  onCustomAction,
  customActionText,
  retryText = 'Try Again',
  goBackText = 'Go Back',
  showRetry = true,
  showGoBack = false,
  isDarkMode = false,
  style,
  ...props
}) => {
  // Get theme-aware styles from design system
  const colors = getColors(isDarkMode);
  const cardStyles = getCardStyles(isDarkMode);
  const buttonStyles = getButtonStyles(isDarkMode);
  const contentStyles = getContentStyles(isDarkMode);

  // Get error color based on type using design system colors
  const getErrorColor = () => {
    switch (type) {
      case 'network':
        return colors.warning;
      case 'server':
        return colors.error;
      case 'validation':
        return colors.primary;
      case 'notFound':
        return colors.error;
      case 'permission':
        return colors.primary;
      case 'general':
      default:
        return colors.error;
    }
  };

  // Get error background color with opacity for subtle indication
  const getErrorBackgroundColor = () => {
    const baseColor = getErrorColor();
    // Add subtle background tint based on error type
    switch (type) {
      case 'network':
        return isDarkMode ? colors.surface : colors.backgroundSecondary;
      case 'server':
        return isDarkMode ? colors.surface : colors.backgroundSecondary;
      case 'validation':
        return isDarkMode ? colors.surface : colors.backgroundSecondary;
      case 'notFound':
        return isDarkMode ? colors.surface : colors.backgroundSecondary;
      case 'permission':
        return isDarkMode ? colors.surface : colors.backgroundSecondary;
      case 'general':
      default:
        return isDarkMode ? colors.surface : colors.backgroundSecondary;
    }
  };

  // Get icon based on error type
  const getErrorIcon = () => {
    if (icon) return icon;

    const iconProps = {
      size: 48,
      color: getErrorColor(),
    };

    switch (type) {
      case 'network':
        return <Wifi {...iconProps} />;
      case 'server':
        return <Server {...iconProps} />;
      case 'validation':
        return <AlertCircle {...iconProps} />;
      case 'notFound':
        return <XCircle {...iconProps} />;
      case 'permission':
        return <Info {...iconProps} />;
      case 'general':
      default:
        return <AlertTriangle {...iconProps} />;
    }
  };

  // Get default titles and messages based on type
  const getDefaultContent = () => {
    switch (type) {
      case 'network':
        return {
          title: title || 'Connection Problem',
          message: message || 'Please check your internet connection and try again.'
        };
      case 'server':
        return {
          title: title || 'Server Error',
          message: message || 'Something went wrong on our end. Please try again later.'
        };
      case 'validation':
        return {
          title: title || 'Invalid Input',
          message: message || 'Please check your input and try again.'
        };
      case 'notFound':
        return {
          title: title || 'Not Found',
          message: message || 'The content you\'re looking for could not be found.'
        };
      case 'permission':
        return {
          title: title || 'Access Denied',
          message: message || 'You don\'t have permission to access this content.'
        };
      case 'general':
      default:
        return {
          title: title || 'Something went wrong',
          message: message || 'An unexpected error occurred. Please try again.'
        };
    }
  };

  const { title: displayTitle, message: displayMessage } = getDefaultContent();

  // Create error card style with subtle type-based styling
  const errorCardStyle = createCardStyle({
    variant: 'elevated',
    size: 'medium',
    isDark: isDarkMode
  });

  // Create retry button style
  const retryButtonStyle = createButtonStyle({
    variant: 'primary',
    size: 'medium',
    isDark: isDarkMode
  });

  // Create secondary button style for go back/custom actions
  const secondaryButtonStyle = createButtonStyle({
    variant: 'outline',
    size: 'medium',
    isDark: isDarkMode
  });

  // Container styles
  const containerStyle = [
    errorCardStyle,
    {
      alignItems: 'center',
      backgroundColor: getErrorBackgroundColor(),
      paddingHorizontal: spacing.large,
      paddingVertical: spacing.extraLarge,
      maxWidth: 400,
      width: '100%',
    },
    style
  ];

  // Icon container styles
  const iconContainerStyle = {
    marginBottom: spacing.medium,
  };

  // Title styles using content system
  const titleStyle = [
    contentStyles.heading3,
    {
      textAlign: 'center',
      marginBottom: spacing.small,
      color: colors.text,
    }
  ];

  // Message styles using content system
  const messageStyle = [
    contentStyles.body,
    {
      textAlign: 'center',
      lineHeight: typography.lineHeight?.relaxed || 22,
      marginBottom: spacing.large,
      color: colors.textSecondary,
    }
  ];

  // Actions container
  const actionsContainerStyle = {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.medium,
    width: '100%',
    flexWrap: 'wrap',
  };

  // Button container for consistent sizing
  const buttonContainerStyle = {
    minWidth: 120,
    flex: showRetry && (showGoBack || onCustomAction) ? 1 : 0,
  };

  return (
    <View 
      style={containerStyle}
      accessibilityRole="alert"
      accessibilityLabel={`Error: ${displayTitle}`}
      {...props}
    >
      {/* Error icon */}
      {showIcon && (
        <View style={iconContainerStyle}>
          {getErrorIcon()}
        </View>
      )}

      {/* Error title */}
      <Text style={titleStyle}>
        {displayTitle}
      </Text>

      {/* Error message */}
      <Text style={messageStyle}>
        {displayMessage}
      </Text>

      {/* Action buttons */}
      {(showRetry || showGoBack || onCustomAction) && (
        <View style={actionsContainerStyle}>
          {/* Retry button */}
          {showRetry && onRetry && (
            <View style={buttonContainerStyle}>
              <TouchableOpacity
                onPress={onRetry}
                style={retryButtonStyle}
                activeOpacity={0.8}
                accessibilityLabel="Retry"
                accessibilityHint="Attempts to reload or retry the failed operation"
              >
                <RefreshCw size={16} color={colors.white} />
                <Text style={[
                  buttonStyles.text.primary,
                  { marginLeft: spacing.small }
                ]}>
                  {retryText}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Go back button */}
          {showGoBack && onGoBack && (
            <View style={buttonContainerStyle}>
              <TouchableOpacity
                onPress={onGoBack}
                style={secondaryButtonStyle}
                activeOpacity={0.8}
                accessibilityLabel="Go Back"
                accessibilityHint="Returns to the previous screen"
              >
                <ArrowLeft size={16} color={colors.text} />
                <Text style={[
                  buttonStyles.text.outline,
                  { marginLeft: spacing.small }
                ]}>
                  {goBackText}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Custom action button */}
          {onCustomAction && customActionText && (
            <View style={buttonContainerStyle}>
              <TouchableOpacity
                onPress={onCustomAction}
                style={secondaryButtonStyle}
                activeOpacity={0.8}
                accessibilityLabel={customActionText}
                accessibilityHint="Performs a custom action"
              >
                <Text style={buttonStyles.text.outline}>
                  {customActionText}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default ErrorDisplay;

// Character count: 8,891