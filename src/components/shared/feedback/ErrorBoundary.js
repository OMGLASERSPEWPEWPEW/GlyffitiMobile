// src/components/shared/feedback/ErrorBoundary.js
// Path: src/components/shared/feedback/ErrorBoundary.js

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import { getCardStyles, createCardStyle } from '../../../styles/components/cards';
import { getButtonStyles, createButtonStyle } from '../../../styles/components/buttons';
import { getContentStyles } from '../../../styles/components/content';
import { spacing, typography, getColors } from '../../../styles/tokens';

/**
 * React Error Boundary component that catches JavaScript errors anywhere in the child component tree
 * Displays a fallback UI instead of crashing the entire app
 * 
 * MIGRATED: Now uses the new design system
 * - Replaced errorStyles with design system components (cards, buttons, content)
 * - Added proper theme-aware styling with getColors()
 * - Maintained exact same component interface for backwards compatibility
 * - Enhanced with design system elevation and variant support
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

      // Get theme-aware styles from design system
      const colors = getColors(isDarkMode);
      const cardStyles = getCardStyles(isDarkMode);
      const buttonStyles = getButtonStyles(isDarkMode);
      const contentStyles = getContentStyles(isDarkMode);

      // Create specialized card style for error boundary
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

      // Create fallback button style
      const fallbackButtonStyle = createButtonStyle({
        variant: 'outline',
        size: 'medium',
        isDark: isDarkMode
      });

      // Container styles using design system
      const containerStyle = {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
        paddingHorizontal: spacing.large,
        paddingVertical: spacing.extraLarge,
      };

      // Content card styles
      const cardContainerStyle = [
        errorCardStyle,
        {
          alignItems: 'center',
          maxWidth: 350,
          width: '100%',
          paddingHorizontal: spacing.large,
          paddingVertical: spacing.extraLarge,
        }
      ];

      // Error icon styles
      const iconStyle = {
        marginBottom: spacing.medium,
      };

      // Title styles using content system
      const titleStyle = [
        contentStyles.heading2,
        {
          textAlign: 'center',
          marginBottom: spacing.small,
          color: colors.text,
        }
      ];

      // Description styles using content system
      const descriptionStyle = [
        contentStyles.body,
        {
          textAlign: 'center',
          lineHeight: typography.lineHeight?.relaxed || 22,
          marginBottom: spacing.large,
          color: colors.textSecondary,
        }
      ];

      // Error details styles (monospace for technical details)
      const errorDetailsStyle = {
        fontSize: typography.fontSize?.small || 12,
        fontFamily: typography.fontFamilyMono || typography.fontFamily,
        color: colors.textSecondary,
        textAlign: 'left',
        backgroundColor: colors.backgroundSecondary,
        paddingHorizontal: spacing.medium,
        paddingVertical: spacing.medium,
        borderRadius: spacing.small,
        marginBottom: spacing.large,
        alignSelf: 'stretch',
      };

      // Actions container
      const actionsContainerStyle = {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.medium,
        width: '100%',
      };

      // Retry count style
      const retryCountStyle = [
        contentStyles.caption,
        {
          marginTop: spacing.medium,
          textAlign: 'center',
          color: colors.textTertiary,
        }
      ];

      return (
        <View style={[containerStyle, style]}>
          <View style={cardContainerStyle}>
            {/* Error icon */}
            <AlertTriangle 
              size={48} 
              color={colors.error}
              style={iconStyle}
            />

            {/* Error title */}
            <Text style={titleStyle}>
              Something went wrong
            </Text>

            {/* Error description */}
            <Text style={descriptionStyle}>
              {error?.message || 'An unexpected error occurred. Please try again.'}
            </Text>

            {/* Error details in development */}
            {__DEV__ && error && (
              <Text style={errorDetailsStyle}>
                {error.toString()}
                {error.stack && `\n${error.stack.slice(0, 300)}...`}
              </Text>
            )}

            {/* Action buttons */}
            <View style={actionsContainerStyle}>
              {/* Retry button */}
              {showRetry && retryCount < maxRetries && (
                <TouchableOpacity
                  style={[retryButtonStyle, { flex: 1 }]}
                  onPress={this.handleRetry}
                  activeOpacity={0.8}
                  accessibilityLabel="Retry"
                  accessibilityHint="Attempts to fix the error and reload the component"
                >
                  <RefreshCw size={16} color={colors.white} />
                  <Text style={[
                    buttonStyles.text.primary,
                    { marginLeft: spacing.small }
                  ]}>
                    Retry
                  </Text>
                </TouchableOpacity>
              )}

              {/* Fallback button */}
              {onFallbackPress && (
                <TouchableOpacity
                  style={[fallbackButtonStyle, { flex: 1 }]}
                  onPress={onFallbackPress}
                  activeOpacity={0.8}
                  accessibilityLabel="Go Back"
                  accessibilityHint="Returns to the previous screen"
                >
                  <Text style={buttonStyles.text.outline}>
                    Go Back
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Retry count indicator */}
            {retryCount > 0 && (
              <Text style={retryCountStyle}>
                Retry attempts: {retryCount}/{maxRetries}
              </Text>
            )}

            {/* Max retries reached message */}
            {retryCount >= maxRetries && (
              <Text style={[
                descriptionStyle,
                { 
                  marginTop: spacing.medium,
                  color: colors.error,
                  fontSize: typography.fontSize?.small || 14
                }
              ]}>
                Maximum retry attempts reached. Please restart the app or contact support.
              </Text>
            )}
          </View>
        </View>
      );
    }

    // Normal render - no error
    return children;
  }
}

export default ErrorBoundary;

// Character count: 7,892