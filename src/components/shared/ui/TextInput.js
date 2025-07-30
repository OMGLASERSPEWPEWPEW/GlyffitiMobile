// src/components/shared/ui/TextInput.js
// Path: src/components/shared/ui/TextInput.js
import React, { useState } from 'react';
import { View, TextInput as RNTextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Eye, EyeOff, Search, X } from 'lucide-react-native';
import { colors, spacing, typography } from '../../../styles/tokens';

/**
 * Standardized text input component with consistent styling
 * Replaces scattered TextInput usage throughout the app
 * Supports password fields, search inputs, validation states, and icons
 */
const TextInput = ({
  value,
  onChangeText,
  placeholder,
  placeholderTextColor,
  variant = 'default', // 'default', 'search', 'password'
  state = 'normal', // 'normal', 'error', 'success', 'disabled'
  size = 'medium', // 'small', 'medium', 'large'
  isDarkMode = false,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  autoCapitalize = 'sentences',
  autoCorrect = true,
  keyboardType = 'default',
  returnKeyType = 'done',
  clearButtonMode = 'never', // iOS only: 'never', 'while-editing', 'unless-editing', 'always'
  secureTextEntry: forcedSecureTextEntry,
  leftIcon,
  rightIcon,
  onRightIconPress,
  onClear,
  style,
  inputStyle,
  containerStyle,
  showPasswordToggle = true, // For password variant
  editable = true,
  ...otherProps
}) => {
  // Internal state for password visibility
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  // Determine if this should be a secure text entry
  const isPasswordVariant = variant === 'password';
  const secureTextEntry = isPasswordVariant ? 
    (forcedSecureTextEntry !== undefined ? forcedSecureTextEntry : !isPasswordVisible) : 
    forcedSecureTextEntry;

  // Get variant-specific configuration
  const getVariantConfig = () => {
    const configs = {
      default: {
        borderRadius: 8,
        paddingHorizontal: spacing.medium,
        leftIcon: null,
        showClearButton: false,
      },
      search: {
        borderRadius: 25,
        paddingHorizontal: spacing.medium,
        leftIcon: <Search size={20} />,
        showClearButton: true,
      },
      password: {
        borderRadius: 8,
        paddingHorizontal: spacing.medium,
        leftIcon: null,
        showClearButton: false,
      },
    };
    return configs[variant] || configs.default;
  };

  // Get state-specific colors
  const getStateColors = () => {
    const stateColors = {
      normal: {
        border: isDarkMode ? '#6b7280' : colors.border,
        background: isDarkMode ? '#374151' : '#ffffff',
        text: isDarkMode ? '#e5e7eb' : colors.text,
        placeholder: isDarkMode ? '#9ca3af' : colors.textSecondary,
      },
      error: {
        border: isDarkMode ? '#ef4444' : colors.error,
        background: isDarkMode ? '#374151' : '#ffffff',
        text: isDarkMode ? '#e5e7eb' : colors.text,
        placeholder: isDarkMode ? '#9ca3af' : colors.textSecondary,
      },
      success: {
        border: isDarkMode ? '#10b981' : colors.success,
        background: isDarkMode ? '#374151' : '#ffffff',
        text: isDarkMode ? '#e5e7eb' : colors.text,
        placeholder: isDarkMode ? '#9ca3af' : colors.textSecondary,
      },
      disabled: {
        border: isDarkMode ? '#4b5563' : '#e9ecef',
        background: isDarkMode ? '#1f2937' : '#f8f9fa',
        text: isDarkMode ? '#6b7280' : '#6c757d',
        placeholder: isDarkMode ? '#6b7280' : '#6c757d',
      },
    };
    return stateColors[disabled ? 'disabled' : state] || stateColors.normal;
  };

  // Get size-specific styling
  const getSizeStyles = () => {
    const sizes = {
      small: {
        paddingVertical: spacing.small,
        fontSize: 14,
        minHeight: 36,
      },
      medium: {
        paddingVertical: spacing.medium,
        fontSize: 16,
        minHeight: 44,
      },
      large: {
        paddingVertical: spacing.large,
        fontSize: 18,
        minHeight: 52,
      },
    };
    return sizes[size] || sizes.medium;
  };

  const variantConfig = getVariantConfig();
  const stateColors = getStateColors();
  const sizeStyles = getSizeStyles();

  // Icon color
  const iconColor = stateColors.placeholder;

  // Container style
  const containerStyles = [
    styles.container,
    {
      borderColor: stateColors.border,
      backgroundColor: stateColors.background,
      borderRadius: variantConfig.borderRadius,
      paddingHorizontal: variantConfig.paddingHorizontal,
      paddingVertical: sizeStyles.paddingVertical,
      minHeight: multiline ? undefined : sizeStyles.minHeight,
    },
    disabled && styles.disabledContainer,
    containerStyle
  ];

  // Input style
  const textInputStyles = [
    styles.input,
    {
      color: stateColors.text,
      fontSize: sizeStyles.fontSize,
    },
    inputStyle
  ];

  // Handle clear button press
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChangeText('');
    }
  };

  // Handle password toggle
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // Determine right icon
  let finalRightIcon = rightIcon;
  if (isPasswordVariant && showPasswordToggle) {
    finalRightIcon = (
      <TouchableOpacity 
        onPress={togglePasswordVisibility}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {isPasswordVisible ? (
          <EyeOff size={20} color={iconColor} />
        ) : (
          <Eye size={20} color={iconColor} />
        )}
      </TouchableOpacity>
    );
  } else if (variant === 'search' && variantConfig.showClearButton && value && value.length > 0) {
    finalRightIcon = (
      <TouchableOpacity 
        onPress={handleClear}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <X size={16} color={iconColor} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={[containerStyles, style]}>
      {/* Left icon */}
      {(leftIcon || variantConfig.leftIcon) && (
        <View style={styles.leftIconContainer}>
          {leftIcon || (
            React.cloneElement(variantConfig.leftIcon, { color: iconColor })
          )}
        </View>
      )}

      {/* Text input */}
      <RNTextInput
        style={textInputStyles}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor || stateColors.placeholder}
        secureTextEntry={secureTextEntry}
        editable={editable && !disabled}
        multiline={multiline}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        keyboardType={keyboardType}
        returnKeyType={returnKeyType}
        clearButtonMode={clearButtonMode}
        {...otherProps}
      />

      {/* Right icon */}
      {finalRightIcon && (
        <View style={styles.rightIconContainer}>
          {typeof finalRightIcon === 'function' ? finalRightIcon() : finalRightIcon}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  disabledContainer: {
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontFamily: typography.fontFamily,
    textAlignVertical: 'center',
  },
  leftIconContainer: {
    marginRight: spacing.small,
  },
  rightIconContainer: {
    marginLeft: spacing.small,
  },
});

export default TextInput;

// Character count: 6241