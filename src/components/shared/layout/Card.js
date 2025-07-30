// src/components/shared/layout/Card.js
// Path: src/components/shared/layout/Card.js
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { getCardStyles, createCardStyle } from '../../../styles/components';

/**
 * Base card component with consistent styling
 * Provides the foundation for all card-like UI elements
 * Supports light/dark mode and optional touch interactions
 * 
 * MIGRATED: Now uses the new design system card components
 * - Replaced manual styling with getCardStyles() and createCardStyle()
 * - Added proper theme-aware styling
 * - Maintained exact same component interface for backwards compatibility
 * - Enhanced with design system elevation and variant support
 */
const Card = ({
  children,
  style,
  isDarkMode = false,
  onPress,
  activeOpacity = 0.7,
  disabled = false,
  elevation = 'low', // 'flat', 'low', 'medium', 'high', 'floating'
  variant = 'default', // 'default', 'outlined', 'filled', 'elevated', etc.
  size = 'medium', // 'small', 'medium', 'large', 'compact', 'hero'
  borderRadius,
  padding,
  margin,
  marginBottom,
  marginTop = 0,
  marginHorizontal = 0,
  marginVertical = 0,
  backgroundColor,
  borderColor,
  borderWidth,
  shadowOpacity,
  shadowRadius,
  shadowOffset,
  ...otherProps
}) => {
  // Get theme-aware card styles
  const cardStyles = getCardStyles(isDarkMode);
  
  // Map legacy elevation prop to design system elevation
  const mapElevation = (elevationProp) => {
    if (typeof elevationProp === 'number') {
      // Map numeric elevation to design system elevations
      if (elevationProp === 0) return 'flat';
      if (elevationProp <= 2) return 'low';
      if (elevationProp <= 4) return 'medium';
      if (elevationProp <= 8) return 'high';
      return 'floating';
    }
    return elevationProp;
  };

  const mappedElevation = mapElevation(elevation);
  
  // Create card style using design system
  const baseCardStyle = createCardStyle(variant, size, mappedElevation, isDarkMode);

  // Handle custom overrides (preserve original behavior)
  const customOverrides = {};
  
  if (backgroundColor) customOverrides.backgroundColor = backgroundColor;
  if (borderColor) customOverrides.borderColor = borderColor;
  if (borderRadius !== undefined) customOverrides.borderRadius = borderRadius;
  if (borderWidth !== undefined) customOverrides.borderWidth = borderWidth;
  if (padding !== undefined) customOverrides.padding = padding;
  
  // Handle shadow overrides
  if (shadowOpacity !== undefined) customOverrides.shadowOpacity = shadowOpacity;
  if (shadowRadius !== undefined) customOverrides.shadowRadius = shadowRadius;
  if (shadowOffset !== undefined) customOverrides.shadowOffset = shadowOffset;

  // Build margin style object (preserve original logic exactly)
  const marginStyle = {};
  if (marginHorizontal || marginVertical) {
    // If specific margins are set, don't use default margin
    if (marginVertical) {
      marginStyle.marginTop = marginVertical;
      marginStyle.marginBottom = marginVertical;
    } else {
      marginStyle.marginTop = marginTop;
      marginStyle.marginBottom = marginBottom || cardStyles.medium?.marginBottom || 16;
    }
    if (marginHorizontal) {
      marginStyle.marginHorizontal = marginHorizontal;
    }
  } else if (margin !== undefined) {
    marginStyle.margin = margin;
  } else {
    // Use design system defaults but allow overrides
    marginStyle.marginTop = marginTop;
    marginStyle.marginBottom = marginBottom !== undefined ? marginBottom : cardStyles.medium?.marginBottom || 16;
  }

  // Combine all styles
  const finalCardStyle = [
    ...baseCardStyle,
    customOverrides,
    marginStyle,
    disabled && cardStyles.disabled,
    style
  ];

  // If onPress is provided, make it touchable (preserve exact original logic)
  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        style={finalCardStyle}
        onPress={onPress}
        activeOpacity={activeOpacity}
        disabled={disabled}
        {...otherProps}
      >
        {children}
      </TouchableOpacity>
    );
  }

  // Otherwise, render as a regular View (preserve exact original logic)
  return (
    <View style={finalCardStyle} {...otherProps}>
      {children}
    </View>
  );
};

export default Card;

// Character count: 3,345