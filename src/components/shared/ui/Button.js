// src/components/shared/Button.js
// Path: src/components/shared/Button.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../../styles/tokens';

/**
 * Standardized button component with consistent styling
 * Replaces scattered TouchableOpacity button usage throughout the app
 * Supports multiple variants, sizes, and states
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
  // Get variant-specific colors
  const getVariantColors = () => {
    const variants = {
      primary: {
        background: isDarkMode ? '#3b82f6' : '#007bff',
        backgroundDisabled: '#6c757d',
        text: '#ffffff',
        textDisabled: '#ffffff',
      },
      secondary: {
        background: isDarkMode ? '#6b7280' : '#6c757d',
        backgroundDisabled: '#6c757d',
        text: '#ffffff',
        textDisabled: '#ffffff',
      },
      success: {
        background: isDarkMode ? '#10b981' : '#28a745',
        backgroundDisabled: '#6c757d',
        text: '#ffffff',
        textDisabled: '#ffffff',
      },
      warning: {
        background: isDarkMode ? '#f59e0b' : '#ffc107',
        backgroundDisabled: '#6c757d',
        text: isDarkMode ? '#ffffff' : '#212529',
        textDisabled: '#ffffff',
      },
      danger: {
        background: isDarkMode ? '#ef4444' : '#dc3545',
        backgroundDisabled: '#6c757d',
        text: '#ffffff',
        textDisabled: '#ffffff',
      },
      info: {
        background: isDarkMode ? '#06b6d4' : '#17a2b8',
        backgroundDisabled: '#6c757d',
        text: '#ffffff',
        textDisabled: '#ffffff',
      },
    };
    return variants[variant] || variants.primary;
  };

  // Get size-specific styling
  const getSizeStyles = () => {
    const sizes = {
      small: {
        paddingVertical: spacing.small,
        paddingHorizontal: spacing.medium,
        fontSize: 14,
        borderRadius: 6,
      },
      medium: {
        paddingVertical: spacing.medium,
        paddingHorizontal: spacing.large,
        fontSize: 16,
        borderRadius: 8,
      },
      large: {
        paddingVertical: spacing.large,
        paddingHorizontal: spacing.extraLarge || spacing.large * 1.5,
        fontSize: 18,
        borderRadius: 12,
      },
    };
    return sizes[size] || sizes.medium;
  };

  const variantColors = getVariantColors();
  const sizeStyles = getSizeStyles();
  const isDisabled = disabled || loading;

  // Button style configuration
  const buttonStyle = [
    styles.button,
    {
      backgroundColor: isDisabled ? variantColors.backgroundDisabled : variantColors.background,
      paddingVertical: sizeStyles.paddingVertical,
      paddingHorizontal: sizeStyles.paddingHorizontal,
      borderRadius: sizeStyles.borderRadius,
    },
    isDisabled && styles.disabled,
    style
  ];

  // Text style configuration  
  const buttonTextStyle = [
    styles.buttonText,
    {
      color: isDisabled ? variantColors.textDisabled : variantColors.text,
      fontSize: sizeStyles.fontSize,
    },
    textStyle
  ];

  // Loading text replacement
  const displayText = loading ? '⏳ Loading...' : title;

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={isDisabled ? 1 : activeOpacity}
      {...otherProps}
    >
      {icon && <>{icon}</>}
      {children ? (
        children
      ) : (
        <Text style={buttonTextStyle}>
          {displayText}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    fontFamily: typography.fontFamily,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Button;

// Character count: 3742