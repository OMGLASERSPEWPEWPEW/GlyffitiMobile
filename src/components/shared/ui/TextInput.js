// src/components/shared/ui/TextInput.js
// Path: src/components/shared/ui/TextInput.js
import React, { useState } from 'react';
import { View, TextInput as RNTextInput, TouchableOpacity } from 'react-native';
import { Eye, EyeOff, Search, X } from 'lucide-react-native';
import { getFormStyles, createInputStyle, getValidationColors } from '../../../styles/components';

/**
 * Standardized text input component with consistent styling
 * Replaces scattered TextInput usage throughout the app
 * Supports password fields, search inputs, validation states, and icons
 * 
 * MIGRATED: Now uses the new design system form components
 * - Replaced manual styling with getFormStyles() and createInputStyle()
 * - Added proper theme-aware styling
 * - Maintained exact same component interface for backwards compatibility
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

  // Get theme-aware form styles
  const formStyles = getFormStyles(isDarkMode);
  const validationColors = getValidationColors(isDarkMode);
  
  // Map state to validation state if needed
  const inputState = disabled ? 'disabled' : state;
  
  // Create input styles using design system
  const inputStyles = createInputStyle(size, variant, inputState, isDarkMode);

  // Get variant-specific configuration (preserve original logic)
  const getVariantConfig = () => {
    const configs = {
      default: {
        leftIcon: null,
        showClearButton: false,
      },
      search: {
        leftIcon: <Search size={20} />,
        showClearButton: true,
      },
      password: {
        leftIcon: null,
        showClearButton: false,
      },
    };
    return configs[variant] || configs.default;
  };

  const variantConfig = getVariantConfig();

  // Get placeholder color from validation colors
  const getPlaceholderColor = () => {
    if (placeholderTextColor) return placeholderTextColor;
    
    // Use design system colors
    if (inputState === 'error') return validationColors.error;
    if (inputState === 'success') return validationColors.success;
    if (inputState === 'disabled') return formStyles.placeholderDisabled?.color || '#9ca3af';
    
    return formStyles.placeholderNormal?.color || (isDarkMode ? '#9ca3af' : '#6b7280');
  };

  // Get icon color based on state
  const getIconColor = () => {
    if (inputState === 'error') return validationColors.error;
    if (inputState === 'success') return validationColors.success;
    if (inputState === 'disabled') return formStyles.iconDisabled?.color || '#9ca3af';
    
    return formStyles.iconNormal?.color || (isDarkMode ? '#9ca3af' : '#6b7280');
  };

  // Container style - combine design system with custom overrides
  const containerStyles = [
    formStyles.inputContainer || {},
    ...inputStyles,
    multiline && { minHeight: undefined, paddingVertical: formStyles.inputMedium?.paddingVertical || 12 },
    containerStyle
  ];

  // Input style - preserve original input styling approach
  const textInputStyles = [
    formStyles.baseInput || {},
    {
      flex: 1,
      // Remove padding since container handles it
      paddingHorizontal: 0,
      paddingVertical: 0,
      // Let design system handle colors, but allow overrides
      borderWidth: 0, // Container handles border
    },
    inputStyle
  ];

  // Handle clear button press - preserve exact original logic
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChangeText('');
    }
  };

  // Handle password toggle - preserve exact original logic
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // Determine icons - preserve exact original logic
  const iconColor = getIconColor();
  
  // Left icon
  const finalLeftIcon = leftIcon || variantConfig.leftIcon;
  
  // Right icon - password toggle takes precedence
  let finalRightIcon = rightIcon;
  if (isPasswordVariant && showPasswordToggle) {
    finalRightIcon = (
      <TouchableOpacity 
        onPress={togglePasswordVisibility}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={formStyles.iconButton || {}}
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
        style={formStyles.iconButton || {}}
      >
        <X size={20} color={iconColor} />
      </TouchableOpacity>
    );
  } else if (rightIcon && onRightIconPress) {
    finalRightIcon = (
      <TouchableOpacity 
        onPress={onRightIconPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={formStyles.iconButton || {}}
      >
        {rightIcon}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[containerStyles, style]}>
      {/* Left Icon */}
      {finalLeftIcon && (
        <View style={formStyles.iconLeft || { marginRight: 8 }}>
          {React.cloneElement(finalLeftIcon, { 
            color: finalLeftIcon.props.color || iconColor 
          })}
        </View>
      )}

      {/* Text Input */}
      <RNTextInput
        style={textInputStyles}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={getPlaceholderColor()}
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

      {/* Right Icon */}
      {finalRightIcon && (
        <View style={formStyles.iconRight || { marginLeft: 8 }}>
          {finalRightIcon}
        </View>
      )}
    </View>
  );
};

export default TextInput;

// Character count: 5,845