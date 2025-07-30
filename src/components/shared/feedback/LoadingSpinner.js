// src/components/shared/LoadingSpinner.js
// Path: src/components/shared/LoadingSpinner.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { colors, spacing, typography } from '../../../styles/tokens';

/**
 * Standardized loading spinner component
 * Replaces scattered ActivityIndicator usage throughout the app
 * Supports light/dark mode and various sizes
 */
const LoadingSpinner = ({
  size = 'large', // 'small', 'large'
  color,
  message = 'Loading...',
  showMessage = true,
  isDarkMode = false,
  style,
  messageStyle,
  animated = true,
  inline = false // For inline usage within other components
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Determine color based on theme if not provided
  const spinnerColor = color || (isDarkMode ? colors.accentDark : colors.accent);
  const textColor = isDarkMode ? colors.textSecondaryDark : colors.textSecondary;

  // Fade in animation
  useEffect(() => {
    if (animated) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(1);
    }
  }, [animated]);

  const containerStyle = inline 
    ? [styles.inlineContainer, style]
    : [
        styles.container,
        isDarkMode && styles.containerDark,
        style
      ];

  const content = (
    <>
      <ActivityIndicator 
        size={size} 
        color={spinnerColor}
        style={styles.spinner}
      />
      
      {showMessage && message && (
        <Text style={[
          styles.message,
          { color: textColor },
          messageStyle
        ]}>
          {message}
        </Text>
      )}
    </>
  );

  if (animated) {
    return (
      <Animated.View style={[
        containerStyle,
        { opacity: fadeAnim }
      ]}>
        {content}
      </Animated.View>
    );
  }

  return (
    <View style={containerStyle}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingVertical: spacing.large,
  },
  containerDark: {
    backgroundColor: colors.backgroundDark,
  },
  inlineContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.medium,
  },
  spinner: {
    marginBottom: spacing.medium,
  },
  message: {
    fontSize: 16,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
    marginTop: spacing.small,
  },
});

export default LoadingSpinner;

// Character count: 2089