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
import { colors } from '../../../styles';
import { errorStyles } from '../../../styles/errorStyles';

/**
 * Standardized error display component for showing error states
 * Used for network errors, validation errors, load failures, etc.
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

  // Get error color based on type
  const getErrorColor = () => {
    switch (type) {
      case 'network':
        return isDarkMode ? '#f59e0b' : (colors.warning || '#f59e0b');
      case 'server':
        return isDarkMode ? '#ef4444' : (colors.error || '#ef4444');
      case 'validation':
        return isDarkMode ? '#3b82f6' : (colors.primary || '#3b82f6');
      case 'notFound':
        return isDarkMode ? '#ef4444' : (colors.error || '#ef4444');
      case 'permission':
        return isDarkMode ? '#3b82f6' : (colors.primary || '#3b82f6');
      case 'general':
      default:
        return isDarkMode ? '#ef4444' : (colors.error || '#ef4444');
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

  return (
    <View 
      style={[
        errorStyles.displayContainer,
        isDarkMode && errorStyles.displayContainerDark,
        style
      ]}
      {...props}
    >
      {/* Error icon */}
      {showIcon && (
        <View style={errorStyles.displayIcon}>
          {getErrorIcon()}
        </View>
      )}

      {/* Error title */}
      <Text style={[
        errorStyles.displayTitle,
        isDarkMode && errorStyles.displayTitleDark
      ]}>
        {displayTitle}
      </Text>

      {/* Error message */}
      <Text style={[
        errorStyles.displayMessage,
        isDarkMode && errorStyles.displayMessageDark
      ]}>
        {displayMessage}
      </Text>

      {/* Action buttons */}
      {(showRetry || showGoBack || onCustomAction) && (
        <View style={errorStyles.displayActions}>
          {/* Retry button */}
          {showRetry && onRetry && (
            <TouchableOpacity
              onPress={onRetry}
              style={errorStyles.retryButton}
              activeOpacity={0.8}
            >
              <RefreshCw size={16} color="#ffffff" />
              <Text style={errorStyles.retryButtonText}>
                {retryText}
              </Text>
            </TouchableOpacity>
          )}

          {/* Go back button */}
          {showGoBack && onGoBack && (
            <TouchableOpacity
              onPress={onGoBack}
              style={[
                errorStyles.boundaryFallbackButton,
                isDarkMode && errorStyles.boundaryFallbackButtonDark
              ]}
              activeOpacity={0.8}
            >
              <ArrowLeft size={16} color={isDarkMode ? '#e5e7eb' : colors.text} />
              <Text style={[
                errorStyles.boundaryFallbackButtonText,
                isDarkMode && errorStyles.boundaryFallbackButtonTextDark
              ]}>
                {goBackText}
              </Text>
            </TouchableOpacity>
          )}

          {/* Custom action button */}
          {onCustomAction && customActionText && (
            <TouchableOpacity
              onPress={onCustomAction}
              style={[
                errorStyles.boundaryFallbackButton,
                isDarkMode && errorStyles.boundaryFallbackButtonDark
              ]}
              activeOpacity={0.8}
            >
              <Text style={[
                errorStyles.boundaryFallbackButtonText,
                isDarkMode && errorStyles.boundaryFallbackButtonTextDark
              ]}>
                {customActionText}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default ErrorDisplay;

// Character count: 5087