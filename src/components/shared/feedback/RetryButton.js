// src/components/shared/feedback/RetryButton.js
// Path: src/components/shared/feedback/RetryButton.js

import React, { useState } from 'react';
import { Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { RefreshCw, RotateCcw, Repeat } from 'lucide-react-native';
import { getButtonStyles, createButtonStyle } from '../../../styles/components/buttons';
import { getContentStyles } from '../../../styles/components/content';
import { spacing, typography, getColors } from '../../../styles/tokens';

/**
 * Reusable retry button component with loading states and customizable behavior
 * Used throughout the app for consistent retry patterns
 * 
 * MIGRATED: Now uses the new design system
 * - Replaced errorStyles with design system button components
 * - Added proper theme-aware styling with getColors() and getButtonStyles()
 * - Enhanced with design system button variants and sizes
 * - Maintained exact same component interface for backwards compatibility
 * - Improved accessibility with proper button states and feedback
 * 
 * Usage:
 * <RetryButton 
 *   onRetry={handleRetry}
 *   retryCount={attempts}
 *   maxRetries={3}
 *   disabled={false}
 * />
 */
const RetryButton = ({
  onRetry,
  text = 'Try Again',
  loadingText = 'Retrying...',
  icon = 'refresh', // 'refresh', 'rotate', 'repeat', 'none', or custom component
  showIcon = true,
  disabled = false,
  loading = false,
  retryCount = 0,
  maxRetries = null,
  showRetryCount = false,
  autoDisableOnMax = true,
  autoLoading = false, // Automatically show loading state during retry
  autoLoadingDuration = 2000,
  size = 'medium', // 'small', 'medium', 'large'
  variant = 'primary', // 'primary', 'secondary', 'outline', 'ghost'
  isDarkMode = false,
  style,
  textStyle,
  onRetryStart,
  onRetryComplete,
  onMaxRetriesReached,
  ...touchableProps
}) => {
  const [isAutoLoading, setIsAutoLoading] = useState(false);

  // Get theme-aware styles from design system
  const colors = getColors(isDarkMode);
  const buttonStyles = getButtonStyles(isDarkMode);
  const contentStyles = getContentStyles(isDarkMode);

  // Determine if button should be disabled
  const isDisabled = disabled || 
    (autoDisableOnMax && maxRetries && retryCount >= maxRetries) ||
    loading || 
    isAutoLoading;

  // Determine if button should show loading state
  const isLoading = loading || isAutoLoading;

  // Map size to design system size
  const getDesignSystemSize = () => {
    switch (size) {
      case 'small':
        return 'small';
      case 'large':
        return 'large';
      case 'medium':
      default:
        return 'medium';
    }
  };

  // Map variant to design system variant
  const getDesignSystemVariant = () => {
    switch (variant) {
      case 'secondary':
        return 'secondary';
      case 'outline':
        return 'outline';
      case 'ghost':
        return 'ghost';
      case 'primary':
      default:
        return 'primary';
    }
  };

  // Create button style using design system
  const designSystemButtonStyle = createButtonStyle({
    variant: getDesignSystemVariant(),
    size: getDesignSystemSize(),
    state: isDisabled ? 'disabled' : isLoading ? 'loading' : 'normal',
    isDark: isDarkMode
  });

  // Get icon component
  const getIcon = () => {
    if (!showIcon || icon === 'none') return null;

    // Get icon size based on design system button size
    const iconSize = size === 'small' ? 14 : size === 'large' ? 18 : 16;
    
    // Get icon color based on button variant and state
    const getIconColor = () => {
      if (isDisabled) {
        return variant === 'primary' ? colors.white : colors.textTertiary;
      }
      
      switch (variant) {
        case 'primary':
          return colors.white;
        case 'secondary':
          return colors.white;
        case 'outline':
          return colors.primary;
        case 'ghost':
          return colors.primary;
        default:
          return colors.white;
      }
    };

    const iconColor = getIconColor();

    // Return custom icon if provided
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon, { 
        size: iconSize, 
        color: iconColor 
      });
    }

    // Return built-in icon based on type
    switch (icon) {
      case 'rotate':
        return <RotateCcw size={iconSize} color={iconColor} />;
      case 'repeat':
        return <Repeat size={iconSize} color={iconColor} />;
      case 'refresh':
      default:
        return <RefreshCw size={iconSize} color={iconColor} />;
    }
  };

  // Handle retry press
  const handleRetry = async () => {
    if (isDisabled || !onRetry) return;

    // Check max retries
    if (maxRetries && retryCount >= maxRetries) {
      if (onMaxRetriesReached) {
        onMaxRetriesReached(retryCount);
      }
      return;
    }

    // Start retry
    if (onRetryStart) {
      onRetryStart(retryCount + 1);
    }

    // Auto loading state
    if (autoLoading) {
      setIsAutoLoading(true);
    }

    try {
      await onRetry(retryCount + 1);
    } catch (error) {
      console.warn('RetryButton: onRetry threw an error:', error);
    } finally {
      // Complete auto loading
      if (autoLoading) {
        setTimeout(() => {
          setIsAutoLoading(false);
          if (onRetryComplete) {
            onRetryComplete(retryCount + 1);
          }
        }, autoLoadingDuration);
      } else if (onRetryComplete) {
        onRetryComplete(retryCount + 1);
      }
    }
  };

  // Get display text
  const getDisplayText = () => {
    if (isLoading && loadingText) {
      return loadingText;
    }

    let displayText = text;

    if (showRetryCount && retryCount > 0) {
      displayText += ` (${retryCount}${maxRetries ? `/${maxRetries}` : ''})`;
    }

    return displayText;
  };

  // Get text style based on button variant
  const getTextStyle = () => {
    const baseTextStyle = variant === 'primary' ? 
      buttonStyles.text.primary : 
      variant === 'secondary' ? 
        buttonStyles.text.secondary :
        variant === 'outline' ?
          buttonStyles.text.outline :
          buttonStyles.text.ghost;

    // Apply size-specific text styling
    const sizeStyles = {
      fontSize: size === 'small' ? 
        typography.fontSize?.small || 14 : 
        size === 'large' ? 
          typography.fontSize?.large || 18 : 
          typography.fontSize?.medium || 16,
      fontFamily: typography.fontFamilyMedium || typography.fontFamily,
    };

    return [baseTextStyle, sizeStyles, textStyle];
  };

  // Container style combining design system button with custom spacing for icon+text
  const containerStyle = [
    designSystemButtonStyle,
    {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.small, // Consistent spacing between icon and text
      minWidth: size === 'small' ? 80 : size === 'large' ? 140 : 120, // Minimum width for usability
    },
    style
  ];

  // Get appropriate loading spinner color
  const getSpinnerColor = () => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return colors.white;
      case 'outline':
      case 'ghost':
        return colors.primary;
      default:
        return colors.white;
    }
  };

  return (
    <TouchableOpacity
      onPress={handleRetry}
      disabled={isDisabled}
      style={containerStyle}
      activeOpacity={isDisabled ? 1 : 0.8}
      accessibilityLabel={`${getDisplayText()}${retryCount > 0 ? `, attempt ${retryCount}` : ''}`}
      accessibilityHint={isDisabled ? 
        maxRetries && retryCount >= maxRetries ? 
          'Maximum retry attempts reached' : 
          'Retry button is disabled' :
        'Tap to retry the failed operation'
      }
      accessibilityRole="button"
      accessibilityState={{
        disabled: isDisabled,
        busy: isLoading
      }}
      {...touchableProps}
    >
      {/* Loading spinner or icon */}
      {isLoading ? (
        <ActivityIndicator 
          size="small" 
          color={getSpinnerColor()} 
          accessibilityLabel="Loading"
        />
      ) : (
        getIcon()
      )}

      {/* Button text */}
      <Text style={getTextStyle()}>
        {getDisplayText()}
      </Text>
    </TouchableOpacity>
  );
};

export default RetryButton;

// Character count: 7,892