// src/components/Story/StoryErrorDisplay.jsx
// Path: src/components/Story/StoryErrorDisplay.jsx
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity } from 'react-native';
import { AlertTriangle, RefreshCw, ArrowLeft, Wifi, Clock } from 'lucide-react-native';
import { colors, spacing } from '../../styles';
import { storyStyles } from '../../styles/storyStyles';
import { Button } from '../shared';

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
  }, [error, shakeAnim]);

  // Fade in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Categorize error types for better user messaging
  const getErrorInfo = (errorMessage) => {
    const msg = errorMessage?.toLowerCase() || '';
    
    if (msg.includes('network') || msg.includes('connection') || msg.includes('timeout')) {
      return {
        type: 'network',
        icon: Wifi,
        title: 'Connection Problem',
        message: 'Unable to connect to the blockchain network. Please check your internet connection.',
        suggestion: 'Try again in a moment, or check your network connection.',
        canRetry: true
      };
    }
    
    if (msg.includes('transaction not found') || msg.includes('not found')) {
      return {
        type: 'not_found',
        icon: AlertTriangle,
        title: 'Story Not Found',
        message: 'This story chunk could not be found on the blockchain.',
        suggestion: 'The story may have been removed or the link is incorrect.',
        canRetry: false
      };
    }
    
    if (msg.includes('rate limit') || msg.includes('too many requests')) {
      return {
        type: 'rate_limit',
        icon: Clock,
        title: 'Loading Too Fast',
        message: 'The network is limiting our requests to prevent overload.',
        suggestion: 'Please wait a moment before trying again.',
        canRetry: true
      };
    }
    
    if (msg.includes('hash mismatch') || msg.includes('integrity')) {
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
      <Animated.View
        style={[
          storyStyles.errorCompactContainer,
          isDarkMode && storyStyles.errorCompactContainerDark,
          { opacity: fadeAnim, transform: [{ translateX: shakeAnim }] }
        ]}
      >
        <View style={storyStyles.errorCompactRow}>
          <ErrorIcon 
            size={16} 
            color={colors.error} 
            style={storyStyles.errorCompactIcon}
          />
          <Text
            style={[
              storyStyles.errorCompactText,
              { color: isDarkMode ? colors.textDark : colors.text }
            ]}
          >
            {errorInfo.title}
          </Text>

          {onRetry && errorInfo.canRetry && (
            <TouchableOpacity onPress={onRetry} style={storyStyles.errorCompactRetryButton}>
              <RefreshCw 
                size={16} 
                color={isDarkMode ? colors.accentDark : colors.accent} 
              />
            </TouchableOpacity>
          )}
        </View>
        
        <Text
          style={[
            storyStyles.errorCompactMessage,
            { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
          ]}
        >
          {errorInfo.message}
        </Text>
      </Animated.View>
    );
  }

  // Full error screen
  return (
    <Animated.View
      style={[
        storyStyles.errorContainer,
        isDarkMode && storyStyles.errorContainerDark,
        { opacity: fadeAnim }
      ]}
    >
      {/* Header with back button */}
      <View style={storyStyles.errorHeader}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={storyStyles.errorBackButton}>
            <ArrowLeft 
              size={24} 
              color={isDarkMode ? colors.textDark : colors.text} 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Main error content */}
      <View style={storyStyles.errorContent}>
        {/* Animated error icon */}
        <Animated.View
          style={[
            storyStyles.errorIcon,
            { transform: [{ translateX: shakeAnim }] }
          ]}
        >
          <ErrorIcon size={64} color={colors.error} />
        </Animated.View>

        {/* Error title */}
        <Text
          style={[
            storyStyles.errorTitle,
            { color: isDarkMode ? colors.textDark : colors.text }
          ]}
        >
          {errorInfo.title}
        </Text>

        {/* Story title if available */}
        {storyTitle && (
          <Text
            style={[
              storyStyles.errorStoryTitle,
              { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
            ]}
          >
            "{storyTitle}"
          </Text>
        )}

        {/* Error message */}
        <Text
          style={[
            storyStyles.errorMessage,
            { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
          ]}
        >
          {errorInfo.message}
        </Text>

        {/* Suggestion */}
        <Text
          style={[
            storyStyles.errorSuggestion,
            { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
          ]}
        >
          {errorInfo.suggestion}
        </Text>

        {/* Action buttons */}
        <View style={storyStyles.errorActionContainer}>
          {onRetry && errorInfo.canRetry && (
            <Button
              title="Try Again"
              onPress={onRetry}
              variant="primary"
              size="medium"
              isDarkMode={isDarkMode}
              icon={<RefreshCw size={20} color="#ffffff" />}
            />
          )}

          {onBack && (
            <Button
              title="Go Back"
              onPress={onBack}
              variant="secondary"
              size="medium"
              isDarkMode={isDarkMode}
            />
          )}
        </View>

        {/* Technical details (expandable) */}
        <View style={storyStyles.errorTechnicalContainer}>
          <Text
            style={[
              storyStyles.errorTechnicalLabel,
              { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
            ]}
          >
            Technical Details:
          </Text>
          <Text
            style={[
              storyStyles.errorTechnicalText,
              { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
            ]}
          >
            {String(error)}
          </Text>
        </View>

        {/* Troubleshooting tips */}
        <View style={storyStyles.errorTipsContainer}>
          <Text
            style={[
              storyStyles.errorTipsTitle,
              { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
            ]}
          >
            Troubleshooting:
          </Text>
          
          {errorInfo.type === 'network' && (
            <>
              <Text style={[storyStyles.errorTipText, { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }]}>
                • Check your internet connection
              </Text>
              <Text style={[storyStyles.errorTipText, { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }]}>
                • Try switching between WiFi and mobile data
              </Text>
              <Text style={[storyStyles.errorTipText, { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }]}>
                • Wait a moment and try again
              </Text>
            </>
          )}
          
          {errorInfo.type === 'rate_limit' && (
            <>
              <Text style={[storyStyles.errorTipText, { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }]}>
                • Wait 30–60 seconds before retrying
              </Text>
              <Text style={[storyStyles.errorTipText, { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }]}>
                • The network automatically protects against overload
              </Text>
            </>
          )}
          
          {errorInfo.type === 'not_found' && (
            <>
              <Text style={[storyStyles.errorTipText, { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }]}>
                • Verify the story link is correct
              </Text>
              <Text style={[storyStyles.errorTipText, { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }]}>
                • The story may have been removed
              </Text>
            </>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

export default StoryErrorDisplay;
