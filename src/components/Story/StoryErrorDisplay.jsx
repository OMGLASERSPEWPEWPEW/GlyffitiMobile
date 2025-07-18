// src/components/Story/StoryErrorDisplay.jsx
// Path: src/components/Story/StoryErrorDisplay.jsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { AlertTriangle, RefreshCw, ArrowLeft, Wifi, Clock } from 'lucide-react-native';
import { colors, spacing, typography } from '../../styles';

/**
 * Error display component for story loading failures
 * Provides contextual error messages and recovery options
 */
const StoryErrorDisplay = ({
  error,
  onRetry,
  onBack,
  storyTitle,
  isDarkMode = false,
  compact = false
}) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Shake animation for error state
  useEffect(() => {
    const shakeAnimation = Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]);

    shakeAnimation.start();
  }, [error]);

  // Fade in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  // Categorize error types for better user messaging
  const getErrorInfo = (errorMessage) => {
    const error = errorMessage?.toLowerCase() || '';
    
    if (error.includes('network') || error.includes('connection') || error.includes('timeout')) {
      return {
        type: 'network',
        icon: Wifi,
        title: 'Connection Problem',
        message: 'Unable to connect to the blockchain network. Please check your internet connection.',
        suggestion: 'Try again in a moment, or check your network connection.',
        canRetry: true
      };
    }
    
    if (error.includes('transaction not found') || error.includes('not found')) {
      return {
        type: 'not_found',
        icon: AlertTriangle,
        title: 'Story Not Found',
        message: 'This story chunk could not be found on the blockchain.',
        suggestion: 'The story may have been removed or the link is incorrect.',
        canRetry: false
      };
    }
    
    if (error.includes('rate limit') || error.includes('too many requests')) {
      return {
        type: 'rate_limit',
        icon: Clock,
        title: 'Loading Too Fast',
        message: 'The network is limiting our requests to prevent overload.',
        suggestion: 'Please wait a moment before trying again.',
        canRetry: true
      };
    }
    
    if (error.includes('hash mismatch') || error.includes('integrity')) {
      return {
        type: 'integrity',
        icon: AlertTriangle,
        title: 'Content Verification Failed',
        message: 'The story content appears to have been modified or corrupted.',
        suggestion: 'This could indicate tampering. Use caution if retrying.',
        canRetry: true
      };
    }
    
    // Generic error
    return {
      type: 'generic',
      icon: AlertTriangle,
      title: 'Loading Error',
      message: errorMessage || 'An unexpected error occurred while loading the story.',
      suggestion: 'Please try again. If the problem persists, the story may be unavailable.',
      canRetry: true
    };
  };

  const errorInfo = getErrorInfo(error);
  const ErrorIcon = errorInfo.icon;

  // Compact version for inline errors
  if (compact) {
    return (
      <Animated.View style={[
        styles.compactContainer,
        isDarkMode && styles.compactContainerDark,
        { 
          opacity: fadeAnim,
          transform: [{ translateX: shakeAnim }]
        }
      ]}>
        <View style={styles.compactRow}>
          <ErrorIcon 
            size={16} 
            color={colors.error} 
            style={styles.compactIcon}
          />
          <Text style={[
            styles.compactText,
            { color: isDarkMode ? colors.textDark : colors.text }
          ]}>
            {errorInfo.title}
          </Text>
          {onRetry && errorInfo.canRetry && (
            <TouchableOpacity onPress={onRetry} style={styles.compactRetryButton}>
              <RefreshCw 
                size={16} 
                color={isDarkMode ? colors.accentDark : colors.accent} 
              />
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={[
          styles.compactMessage,
          { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
        ]}>
          {errorInfo.message}
        </Text>
      </Animated.View>
    );
  }

  // Full error screen
  return (
    <Animated.View style={[
      styles.container,
      isDarkMode && styles.containerDark,
      { opacity: fadeAnim }
    ]}>
      {/* Header with back button */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft 
              size={24} 
              color={isDarkMode ? colors.textDark : colors.text} 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Main error content */}
      <View style={styles.content}>
        {/* Animated error icon */}
        <Animated.View style={[
          styles.errorIcon,
          {
            transform: [{ translateX: shakeAnim }]
          }
        ]}>
          <ErrorIcon 
            size={64} 
            color={colors.error} 
          />
        </Animated.View>

        {/* Error title */}
        <Text style={[
          styles.errorTitle,
          { color: isDarkMode ? colors.textDark : colors.text }
        ]}>
          {errorInfo.title}
        </Text>

        {/* Story title if available */}
        {storyTitle && (
          <Text style={[
            styles.storyTitle,
            { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
          ]}>
            "{storyTitle}"
          </Text>
        )}

        {/* Error message */}
        <Text style={[
          styles.errorMessage,
          { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
        ]}>
          {errorInfo.message}
        </Text>

        {/* Suggestion */}
        <Text style={[
          styles.suggestion,
          { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
        ]}>
          {errorInfo.suggestion}
        </Text>

        {/* Action buttons */}
        <View style={styles.actionContainer}>
          {onRetry && errorInfo.canRetry && (
            <TouchableOpacity 
              style={[
                styles.retryButton,
                isDarkMode && styles.retryButtonDark
              ]} 
              onPress={onRetry}
            >
              <RefreshCw 
                size={20} 
                color={isDarkMode ? colors.accentDark : colors.accent} 
                style={styles.buttonIcon}
              />
              <Text style={[
                styles.retryButtonText,
                { color: isDarkMode ? colors.accentDark : colors.accent }
              ]}>
                Try Again
              </Text>
            </TouchableOpacity>
          )}

          {onBack && (
            <TouchableOpacity 
              style={[
                styles.backButtonFull,
                isDarkMode && styles.backButtonFullDark
              ]} 
              onPress={onBack}
            >
              <Text style={[
                styles.backButtonText,
                { color: isDarkMode ? colors.textDark : colors.text }
              ]}>
                Go Back
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Technical details (expandable) */}
        <View style={styles.technicalContainer}>
          <Text style={[
            styles.technicalLabel,
            { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
          ]}>
            Technical Details:
          </Text>
          <Text style={[
            styles.technicalText,
            { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
          ]}>
            {error}
          </Text>
        </View>

        {/* Troubleshooting tips */}
        <View style={styles.tipsContainer}>
          <Text style={[
            styles.tipsTitle,
            { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
          ]}>
            Troubleshooting:
          </Text>
          
          {errorInfo.type === 'network' && (
            <>
              <Text style={[styles.tipText, { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }]}>
                • Check your internet connection
              </Text>
              <Text style={[styles.tipText, { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }]}>
                • Try switching between WiFi and mobile data
              </Text>
              <Text style={[styles.tipText, { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }]}>
                • Wait a moment and try again
              </Text>
            </>
          )}
          
          {errorInfo.type === 'rate_limit' && (
            <>
              <Text style={[styles.tipText, { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }]}>
                • Wait 30-60 seconds before retrying
              </Text>
              <Text style={[styles.tipText, { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }]}>
                • The network automatically protects against overload
              </Text>
            </>
          )}
          
          {errorInfo.type === 'not_found' && (
            <>
              <Text style={[styles.tipText, { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }]}>
                • Verify the story link is correct
              </Text>
              <Text style={[styles.tipText, { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }]}>
                • The story may have been removed
              </Text>
            </>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerDark: {
    backgroundColor: colors.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.medium,
    paddingTop: spacing.medium,
  },
  backButton: {
    padding: spacing.small,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.large,
  },
  errorIcon: {
    marginBottom: spacing.large,
  },
  errorTitle: {
    fontSize: 24,
    fontFamily: typography.fontFamilyBold,
    textAlign: 'center',
    marginBottom: spacing.medium,
  },
  storyTitle: {
    fontSize: 16,
    fontFamily: typography.fontFamily,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: spacing.medium,
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
    marginBottom: spacing.medium,
    lineHeight: 24,
  },
  suggestion: {
    fontSize: 14,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
    marginBottom: spacing.large,
    opacity: 0.8,
    lineHeight: 20,
  },
  actionContainer: {
    flexDirection: 'row',
    marginBottom: spacing.large,
    gap: spacing.medium,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    borderRadius: 8,
    backgroundColor: colors.accent + '20',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  retryButtonDark: {
    backgroundColor: colors.accentDark + '20',
    borderColor: colors.accentDark,
  },
  buttonIcon: {
    marginRight: spacing.small,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: typography.fontFamilyBold,
  },
  backButtonFull: {
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonFullDark: {
    borderColor: colors.borderDark,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: typography.fontFamily,
  },
  technicalContainer: {
    marginTop: spacing.large,
    paddingTop: spacing.medium,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    width: '100%',
  },
  technicalLabel: {
    fontSize: 12,
    fontFamily: typography.fontFamilyBold,
    marginBottom: spacing.small,
    opacity: 0.7,
  },
  technicalText: {
    fontSize: 11,
    fontFamily: 'monospace',
    opacity: 0.6,
    backgroundColor: colors.border + '30',
    padding: spacing.small,
    borderRadius: 4,
  },
  tipsContainer: {
    marginTop: spacing.medium,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 12,
    fontFamily: typography.fontFamilyBold,
    marginBottom: spacing.small,
    opacity: 0.7,
  },
  tipText: {
    fontSize: 11,
    fontFamily: typography.fontFamily,
    marginBottom: spacing.extraSmall,
    opacity: 0.6,
    lineHeight: 16,
  },
  // Compact styles
  compactContainer: {
    backgroundColor: colors.error + '10',
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    paddingVertical: spacing.medium,
    paddingHorizontal: spacing.medium,
    borderRadius: 4,
    marginVertical: spacing.small,
  },
  compactContainerDark: {
    backgroundColor: colors.error + '20',
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  compactIcon: {
    marginRight: spacing.small,
  },
  compactText: {
    flex: 1,
    fontSize: 14,
    fontFamily: typography.fontFamilyBold,
  },
  compactRetryButton: {
    padding: spacing.small,
  },
  compactMessage: {
    fontSize: 12,
    fontFamily: typography.fontFamily,
    lineHeight: 16,
  },
});

export default StoryErrorDisplay;

// 3,459 characters