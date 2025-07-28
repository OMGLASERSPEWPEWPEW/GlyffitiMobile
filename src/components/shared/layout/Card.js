// src/components/shared/Card.js
// Path: src/components/shared/Card.js
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing } from '../../../styles';

/**
 * Base card component with consistent styling
 * Provides the foundation for all card-like UI elements
 * Supports light/dark mode and optional touch interactions
 */
const Card = ({
  children,
  style,
  isDarkMode = false,
  onPress,
  activeOpacity = 0.7,
  disabled = false,
  elevation = 2,
  borderRadius = 12,
  padding = spacing.medium,
  margin = spacing.medium,
  marginBottom = spacing.medium,
  marginTop = 0,
  marginHorizontal = 0,
  marginVertical = 0,
  backgroundColor,
  borderColor,
  borderWidth = 1,
  shadowOpacity = 0.1,
  shadowRadius = 4,
  shadowOffset = { width: 0, height: 2 },
  ...otherProps
}) => {
  // Determine colors based on theme
  const cardBackgroundColor = backgroundColor || (isDarkMode ? '#374151' : '#ffffff');
  const cardBorderColor = borderColor || (isDarkMode ? '#6b7280' : colors.border);
  const cardShadowColor = isDarkMode ? '#000000' : '#000000';

  // Build margin style object
  const marginStyle = {
    margin: marginHorizontal || marginVertical ? 0 : margin,
    marginBottom: marginVertical || marginBottom,
    marginTop: marginVertical || marginTop,
    marginHorizontal: marginHorizontal,
    marginVertical: marginVertical,
  };

  // Card style configuration
  const cardStyle = [
    styles.card,
    {
      backgroundColor: cardBackgroundColor,
      borderColor: cardBorderColor,
      borderWidth: borderWidth,
      borderRadius: borderRadius,
      padding: padding,
      shadowColor: cardShadowColor,
      shadowOffset: shadowOffset,
      shadowOpacity: shadowOpacity,
      shadowRadius: shadowRadius,
      elevation: elevation, // Android shadow
    },
    marginStyle,
    style
  ];

  // If onPress is provided, make it touchable
  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={activeOpacity}
        disabled={disabled}
        {...otherProps}
      >
        {children}
      </TouchableOpacity>
    );
  }

  // Otherwise, render as a regular View
  return (
    <View style={cardStyle} {...otherProps}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    // Base styles are applied through props
    // This allows for maximum flexibility while maintaining consistency
  },
});

export default Card;

// Character count: 2240