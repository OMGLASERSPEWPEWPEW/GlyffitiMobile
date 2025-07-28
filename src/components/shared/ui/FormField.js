// src/components/shared/ui/FormField.js
// Path: src/components/shared/ui/FormField.js
import React from 'react';
import { View, Text } from 'react-native';
import { formFieldStyles } from '../../../styles/formFieldStyles';

/**
 * Form field wrapper component with label and error message
 * Wraps any input component with consistent label and validation display
 * Keeps forms organized with proper spacing and error states
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
}) => {
  return (
    <View style={[formFieldStyles.container, style]}>
      {/* Label */}
      {label && (
        <Text style={[
          formFieldStyles.label,
          isDarkMode && formFieldStyles.labelDark,
          labelStyle
        ]}>
          {label}
          {required && showRequiredAsterisk && (
            <Text style={[
              formFieldStyles.required,
              isDarkMode && formFieldStyles.requiredDark
            ]}>
              {' *'}
            </Text>
          )}
        </Text>
      )}

      {/* Input Field (children) */}
      <View style={formFieldStyles.inputContainer}>
        {children}
      </View>

      {/* Error Message */}
      {error && (
        <Text style={[
          formFieldStyles.error,
          isDarkMode && formFieldStyles.errorDark,
          errorStyle
        ]}>
          {error}
        </Text>
      )}

      {/* Help Text */}
      {helpText && !error && (
        <Text style={[
          formFieldStyles.helpText,
          isDarkMode && formFieldStyles.helpTextDark,
          helpStyle
        ]}>
          {helpText}
        </Text>
      )}
    </View>
  );
};

export default FormField;

// Character count: 1242