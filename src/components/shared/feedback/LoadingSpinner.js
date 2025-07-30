// src/components/shared/LoadingSpinner.js
// Path: src/components/shared/LoadingSpinner.js
import React, { useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, Animated } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

/**
 * Standardized loading spinner component
 * Leverages your comprehensive design system for perfect theming
 * Automatically adapts to theme changes
 */
const LoadingSpinner = ({
  size = 'large', // 'small', 'large'
  color,
  message = 'Loading...',
  showMessage = true,
  style,
  messageStyle,
  animated = true,
  inline = false, // For inline usage within other components
  variant = 'default', // 'default', 'overlay', 'card'
}) => {
  const { isDark, colors, components } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Get your comprehensive component styles
  const contentStyles = components.content;
  const cardStyles = components.cards;

  // Determine colors automatically from your theme system
  const spinnerColor = color || colors.primary;
  const backgroundColor = colors.background;
  const textColor = colors.textSecondary;

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

  // Get container style using your comprehensive card/layout system
  const getContainerStyle = () => {
    const baseStyle = {
      justifyContent: 'center',
      alignItems: 'center',
    };

    if (inline) {
      return [
        baseStyle,
        {
          paddingVertical: 16, // From your spacing tokens
        },
        style
      ];
    }

    // Use your card system for different variants
    switch (variant) {
      case 'overlay':
        return [
          baseStyle,
          {
            flex: 1,
            backgroundColor: colors.backdrop || backgroundColor + 'CC',
            paddingVertical: 24,
          },
          style
        ];
      
      case 'card':
        return [
          baseStyle,
          cardStyles.base,
          cardStyles.medium,
          cardStyles.elevated,
          style
        ];
      
      default:
        return [
          baseStyle,
          {
            flex: 1,
            backgroundColor: backgroundColor,
            paddingVertical: 24,
          },
          style
        ];
    }
  };

  // Use your content typography system for the message
  const getMessageStyle = () => {
    return [
      contentStyles.body, // Your comprehensive typography
      {
        color: textColor,
        textAlign: 'center',
        marginTop: 16,
      },
      messageStyle
    ];
  };

  const content = (
    <>
      <ActivityIndicator 
        size={size} 
        color={spinnerColor}
        style={{ marginBottom: 16 }}
      />
      
      {showMessage && message && (
        <Text style={getMessageStyle()}>
          {message}
        </Text>
      )}
    </>
  );

  const containerStyle = getContainerStyle();

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

export default LoadingSpinner;

// Character count: 2,685