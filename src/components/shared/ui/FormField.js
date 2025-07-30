// src/components/shared/ui/FormField.js
// Path: src/components/shared/ui/FormField.js
import React from 'react';
import { View, Text } from 'react-native';
import { getFormStyles, createLabelStyle, getFormAccessibilityProps } from '../../../styles/components';

/**
 * Form field wrapper component with label and error message
 * Wraps any input component with consistent label and validation display
 * Keeps forms organized with proper spacing and error states
 * 
 * MIGRATED: Now uses the new design system form components
 * - Replaced formFieldStyles with getFormStyles()
 * - Added proper theme-aware styling
 * - Enhanced accessibility support
 */
const FormField = ({
  label,
  error,
  helpText,
  required = false,
  isDarkMode = false,
  children,
  style,
  labelStyle,
  errorStyle,
  helpStyle,
  showRequiredAsterisk = true,
  size = 'medium', // 'small', 'medium', 'large'
  state, // Auto-derived from error but can be overridden
}) => {
  // Get theme-aware form styles
  const formStyles = getFormStyles(isDarkMode);
  
  // Determine field state (normal, error, success, warning)
  const fieldState = state || (error ? 'error' : 'normal');
  
  // Get label styles with proper state and theme
  const labelStyles = createLabelStyle(fieldState, 'base', isDarkMode);
  
  // Get accessibility props
  const accessibilityProps = getFormAccessibilityProps(fieldState, label, error, helpText);
  
  return (
    <View style={[formStyles.fieldGroup, style]} {...accessibilityProps}>
      {/* Label */}
      {label && (
        <Text style={[
          labelStyles,
          labelStyle
        ]}>
          {label}
          {required && showRequiredAsterisk && (
            <Text style={[
              formStyles.labelRequired,
              { color: formStyles.requiredColor }
            ]}>
              {' *'}
            </Text>
          )}
        </Text>
      )}

      {/* Input Field (children) */}
      <View style={formStyles.inputContainer}>
        {children}
      </View>

      {/* Error Message */}
      {error && (
        <Text style={[
          formStyles.errorText,
          errorStyle
        ]}>
          {error}
        </Text>
      )}

      {/* Help Text */}
      {helpText && !error && (
        <Text style={[
          formStyles.helpText,
          helpStyle
        ]}>
          {helpText}
        </Text>
      )}
    </View>
  );
};

export default FormField;

// Character count: 1,847