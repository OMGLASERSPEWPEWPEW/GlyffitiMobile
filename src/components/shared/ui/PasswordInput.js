// src/components/shared/ui/PasswordInput.js
// Path: src/components/shared/ui/PasswordInput.js
import React from 'react';
import TextInput from './TextInput';

/**
 * Specialized password input component
 * Wrapper around TextInput with password-specific defaults
 * Replaces manual secureTextEntry TextInput usage
 */
const PasswordInput = ({
  placeholder = 'Enter password...',
  autoCapitalize = 'none',
  autoCorrect = false,
  returnKeyType = 'done',
  variant = 'password',
  showPasswordToggle = true,
  ...otherProps
}) => {
  return (
    <TextInput
      variant={variant}
      placeholder={placeholder}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      returnKeyType={returnKeyType}
      showPasswordToggle={showPasswordToggle}
      {...otherProps}
    />
  );
};

export default PasswordInput;

// Character count: 635