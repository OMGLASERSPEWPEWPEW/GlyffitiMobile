// src/components/shared/feedback/ErrorBoundary.js
// Path: src/components/shared/feedback/ErrorBoundary.js

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import { colors } from '../../../styles';
import { errorStyles } from '../../../styles/errorStyles';

/**
 * React Error Boundary component that catches JavaScript errors anywhere in the child component tree
 * Displays a fallback UI instead of crashing the entire app
 * 
 * Usage:
 * <ErrorBoundary fallback={<CustomErrorComponent />}>
 *   <ComponentThatMightError />
 * </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log to console in development
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Error info:', errorInfo);
    }

    // Here you could also log to an error reporting service
    // Example: logErrorToService(error, errorInfo);
    
    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    // Reset error state and increment retry count
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));

    // Call onRetry callback if provided
    if (this.props.onRetry) {
      this.props.onRetry(this.state.retryCount + 1);
    }
  };

  render() {
    const { 
      hasError, 
      error, 
      retryCount 
    } = this.state;

    const {
      children,
      fallback,
      showRetry = true,
      maxRetries = 3,
      isDarkMode = false,
      style,
      onFallbackPress
    } = this.props;

    if (hasError) {
      // If a custom fallback is provided, use it
      if (fallback) {
        return fallback;
      }

      // Default fallback UI using errorStyles
      const errorColor = isDarkMode ? '#f87171' : colors.error;

      return (
        <View style={[
          errorStyles.boundaryContainer,
          isDarkMode && errorStyles.boundaryContainerDark,
          style
        ]}>
          <View style={[
            errorStyles.boundaryCard,
            isDarkMode && errorStyles.boundaryCardDark
          ]}>
            {/* Error icon */}
            <AlertTriangle 
              size={48} 
              color={errorColor}
              style={errorStyles.boundaryIcon}
            />

            {/* Error title */}
            <Text style={[
              errorStyles.boundaryTitle,
              isDarkMode && errorStyles.boundaryTitleDark
            ]}>
              Something went wrong
            </Text>

            {/* Error description */}
            <Text style={[
              errorStyles.boundaryDescription,
              isDarkMode && errorStyles.boundaryDescriptionDark
            ]}>
              {error?.message || 'An unexpected error occurred. Please try again.'}
            </Text>

            {/* Development error details */}
            {__DEV__ && error && (
              <Text style={[
                errorStyles.boundaryErrorDetails,
                isDarkMode && errorStyles.boundaryErrorDetailsDark
              ]}>
                {error.toString()}
              </Text>
            )}

            {/* Action buttons */}
            <View style={errorStyles.boundaryActionsContainer}>
              {/* Retry button */}
              {showRetry && retryCount < maxRetries && (
                <TouchableOpacity
                  onPress={this.handleRetry}
                  style={errorStyles.boundaryRetryButton}
                  activeOpacity={0.8}
                >
                  <RefreshCw size={16} color="#ffffff" />
                  <Text style={errorStyles.boundaryButtonText}>
                    Try Again
                  </Text>
                </TouchableOpacity>
              )}

              {/* Custom fallback action */}
              {onFallbackPress && (
                <TouchableOpacity
                  onPress={onFallbackPress}
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
                    Go Back
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Retry count indicator */}
            {retryCount > 0 && (
              <Text style={[
                errorStyles.boundaryRetryCount,
                isDarkMode && errorStyles.boundaryRetryCountDark
              ]}>
                Retry attempt: {retryCount}/{maxRetries}
              </Text>
            )}
          </View>
        </View>
      );
    }

    return children;
  }
}

export default ErrorBoundary;

// Character count: 4151