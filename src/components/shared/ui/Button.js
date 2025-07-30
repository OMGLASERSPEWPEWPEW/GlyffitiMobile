// src/components/shared/ui/Button.js
// Path: src/components/shared/ui/Button.js
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { getButtonStyles, createButtonStyle } from '../../../styles/components';

/**
 * Standardized button component with consistent styling
 * Replaces scattered TouchableOpacity button usage throughout the app
 * Supports multiple variants, sizes, and states
 * 
 * MIGRATED: Now uses the new design system button components
 * - Replaced manual styling with getButtonStyles() and createButtonStyle()
 * - Added proper theme-aware styling
 * - Maintained exact same component interface for backwards compatibility
 */
const Button = ({
  title,
  onPress,
  variant = 'primary', // 'primary', 'secondary', 'success', 'warning', 'danger', 'info'
  size = 'medium', // 'small', 'medium', 'large'
  disabled = false,
  loading = false,
  isDarkMode = false,
  style,
  textStyle,
  icon,
  children,
  activeOpacity = 0.7,
  ...otherProps
}) => {
  // Map legacy variant names to new design system variants
  const mapVariant = (originalVariant) => {
    const variantMap = {
      primary: 'primary',
      secondary: 'secondary', 
      success: 'success',
      warning: 'warning',
      danger: 'error',    // Map danger -> error
      info: 'primary',    // Map info -> primary (closest match)
    };
    return variantMap[originalVariant] || 'primary';
  };

  // Get theme-aware button styles
  const buttonStyles = getButtonStyles(isDarkMode);
  const isDisabled = disabled || loading;
  const mappedVariant = mapVariant(variant);

  // Create button style using design system
  const buttonStyle = createButtonStyle(mappedVariant, size, isDarkMode);
  
  // Get text styles from the design system
  const textSizeMap = {
    small: buttonStyles.textSmall,
    medium: buttonStyles.textMedium,
    large: buttonStyles.textLarge,
  };

  // Build final styles
  const finalButtonStyle = [
    ...buttonStyle,
    isDisabled && buttonStyles.disabled,
    loading && buttonStyles.loading,
    style
  ];

  const finalTextStyle = [
    buttonStyles.text,
    textSizeMap[size] || textSizeMap.medium,
    textStyle
  ];

  // Loading text replacement - preserve exact original behavior
  const displayText = loading ? '⏳ Loading...' : title;

  return (
    <TouchableOpacity
      style={finalButtonStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={isDisabled ? 1 : activeOpacity}
      {...otherProps}
    >
      {icon && <>{icon}</>}
      {children ? (
        children
      ) : (
        <Text style={finalTextStyle}>
          {displayText}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;

// Character count: 2,157