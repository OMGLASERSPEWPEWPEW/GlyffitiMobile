// src/components/shared/feedback/RetryButton.js
// Path: src/components/shared/feedback/RetryButton.js

import React, { useState } from 'react';
import { Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { RefreshCw, RotateCcw, Repeat } from 'lucide-react-native';
import { errorStyles } from '../../../styles/errorStyles';

/**
 * Reusable retry button component with loading states and customizable behavior
 * Used throughout the app for consistent retry patterns
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
  variant = 'primary', // 'primary', 'secondary'
  isDarkMode = false,
  style,
  textStyle,
  onRetryStart,
  onRetryComplete,
  onMaxRetriesReached,
  ...touchableProps
}) => {
  const [isAutoLoading, setIsAutoLoading] = useState(false);

  // Determine if button should be disabled
  const isDisabled = disabled || 
    (autoDisableOnMax && maxRetries && retryCount >= maxRetries) ||
    loading || 
    isAutoLoading;

  // Determine if button should show loading state
  const isLoading = loading || isAutoLoading;

  // Get icon component
  const getIcon = () => {
    if (!showIcon || icon === 'none') return null;

    const iconSize = size === 'small' ? 14 : size === 'large' ? 18 : 16;
    const iconColor = isDisabled ? '#ffffff' : '#ffffff';

    if (React.isValidElement(icon)) {
      return icon;
    }

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

  // Get button styles based on size and variant
  const getButtonStyle = () => {
    let baseStyle = errorStyles.retryButton;

    if (isDisabled) {
      baseStyle = [baseStyle, errorStyles.retryButtonDisabled];
    } else if (isLoading) {
      baseStyle = [baseStyle, errorStyles.retryButtonLoading];
    }

    // Size modifications
    if (size === 'small') {
      baseStyle = [baseStyle, {
        paddingHorizontal: 12,
        paddingVertical: 8,
        minWidth: 80,
      }];
    } else if (size === 'large') {
      baseStyle = [baseStyle, {
        paddingHorizontal: 24,
        paddingVertical: 16,
        minWidth: 140,
      }];
    }

    // Variant modifications
    if (variant === 'secondary') {
      baseStyle = [baseStyle, {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: isDarkMode ? '#6b7280' : '#d1d5db',
      }];
    }

    return baseStyle;
  };

  // Get text styles
  const getTextStyle = () => {
    let baseStyle = errorStyles.retryButtonText;

    if (isDisabled) {
      baseStyle = [baseStyle, errorStyles.retryButtonTextDisabled];
    }

    // Size modifications
    if (size === 'small') {
      baseStyle = [baseStyle, { fontSize: 14 }];
    } else if (size === 'large') {
      baseStyle = [baseStyle, { fontSize: 18 }];
    }

    // Variant modifications
    if (variant === 'secondary') {
      baseStyle = [baseStyle, {
        color: isDarkMode ? '#e5e7eb' : '#374151',
      }];
    }

    return baseStyle;
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

  return (
    <TouchableOpacity
      onPress={handleRetry}
      disabled={isDisabled}
      style={[getButtonStyle(), style]}
      activeOpacity={isDisabled ? 1 : 0.8}
      {...touchableProps}
    >
      {/* Loading spinner or icon */}
      {isLoading ? (
        <ActivityIndicator size="small" color="#ffffff" />
      ) : (
        getIcon()
      )}

      {/* Button text */}
      <Text style={[getTextStyle(), textStyle]}>
        {getDisplayText()}
      </Text>
    </TouchableOpacity>
  );
};

export default RetryButton;

// Character count: 4729