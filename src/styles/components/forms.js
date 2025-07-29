// src/styles/components/forms.js
// Path: src/styles/components/forms.js

import { StyleSheet } from 'react-native';
import { 
  lightColors, 
  darkColors, 
  palette, 
  typography, 
  spacing, 
  shadows, 
  darkShadows,
  borderRadius, 
  borderWidth,
  getColors 
} from '../tokens';

/**
 * Form styles - comprehensive form system
 * All form elements, layouts, and states in one place
 * Uses design tokens for consistency and theming support
 * 
 * Usage:
 * - Import specific styles: formStyles.input, formStyles.label
 * - Theme-aware: use getFormStyles(isDark) for proper colors
 * - Combine: [formStyles.input, formStyles.medium, formStyles.error]
 */

// Base form element styles
const baseFormElement = {
  fontFamily: typography.fontFamily,
  includeFontPadding: false, // Android: removes extra padding
  textAlignVertical: 'center', // Android: better text alignment
};

// Input field base styles
const baseInput = {
  ...baseFormElement,
  borderStyle: 'solid',
  borderWidth: borderWidth.thin,
  
  // Accessibility
  accessible: true,
  
  // Touch target (Apple HIG minimum)
  minHeight: 44,
  
  // Animation-ready
  transitionProperty: 'border-color, background-color, box-shadow',
  transitionDuration: '150ms',
};

// Size variants for inputs
const inputSizes = {
  small: {
    paddingHorizontal: spacing.small,         // 8px
    paddingVertical: spacing.extraSmall,      // 8px
    fontSize: typography.fontSize.small,      // 12px
    lineHeight: typography.lineHeight.normal, // 1.4
    minHeight: 36,
    borderRadius: borderRadius.inputSmall || borderRadius.sm, // 4px
  },
  
  medium: {
    paddingHorizontal: spacing.medium,        // 16px
    paddingVertical: spacing.small,           // 8px
    fontSize: typography.fontSize.medium,     // 14px
    lineHeight: typography.lineHeight.normal, // 1.4
    minHeight: 44,
    borderRadius: borderRadius.input,         // 6px
  },
  
  large: {
    paddingHorizontal: spacing.large,         // 24px
    paddingVertical: spacing.medium,          // 16px
    fontSize: typography.fontSize.large,      // 18px
    lineHeight: typography.lineHeight.normal, // 1.4
    minHeight: 52,
    borderRadius: borderRadius.inputLarge || borderRadius.lg, // 8px
  },
  
  // Special size for search inputs
  search: {
    paddingHorizontal: spacing.large,         // 24px
    paddingVertical: spacing.small,           // 8px
    fontSize: typography.fontSize.medium,     // 14px
    lineHeight: typography.lineHeight.normal, // 1.4
    minHeight: 44,
    borderRadius: borderRadius.full,          // Pill shape
  },
};

// Input variant styles
const inputVariants = {
  // Default text input
  default: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Search input with icon space
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.xlarge, // Extra space for search icon
  },
  
  // Password input with toggle space
  password: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.xlarge, // Extra space for eye icon
  },
  
  // Textarea/multiline
  textarea: {
    alignItems: 'flex-start',
    paddingTop: spacing.medium,
    minHeight: 80,
  },
  
  // Inline input (minimal styling)
  inline: {
    borderWidth: 0,
    borderBottomWidth: borderWidth.thin,
    borderRadius: 0,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  
  // Filled input (background instead of border)
  filled: {
    borderWidth: 0,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.medium,
  },
};

// Label styles
const labelStyles = {
  base: {
    fontSize: typography.fontSize.small,       // 12px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.medium,  // 500
    lineHeight: typography.lineHeight.normal,  // 1.4
    marginBottom: spacing.extraSmall,          // 8px
  },
  
  large: {
    fontSize: typography.fontSize.medium,      // 14px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.medium,  // 500
    lineHeight: typography.lineHeight.normal,  // 1.4
    marginBottom: spacing.small,               // 8px
  },
  
  required: {
    color: lightColors.error, // Will be overridden by theme
  },
  
  optional: {
    fontWeight: typography.fontWeight.regular, // 400
    opacity: 0.7,
  },
  
  inline: {
    flex: 1,
    marginBottom: 0,
    marginRight: spacing.medium,
  },
};

// Help text and error message styles
const helperTextStyles = {
  base: {
    fontSize: typography.fontSize.small,       // 12px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.regular, // 400
    lineHeight: 16,
    marginTop: spacing.extraSmall,             // 8px
  },
  
  error: {
    color: lightColors.error, // Will be overridden by theme
  },
  
  success: {
    color: lightColors.success, // Will be overridden by theme
  },
  
  warning: {
    color: lightColors.warning, // Will be overridden by theme
  },
  
  help: {
    opacity: 0.7,
  },
};

// Form group and layout styles
const formLayouts = {
  // Form containers
  form: {
    paddingHorizontal: spacing.medium,         // 16px
    paddingVertical: spacing.large,            // 24px
  },
  
  formCompact: {
    paddingHorizontal: spacing.medium,         // 16px
    paddingVertical: spacing.medium,           // 16px
  },
  
  formWide: {
    paddingHorizontal: spacing.xlarge,         // 32px
    paddingVertical: spacing.large,            // 24px
  },
  
  // Field groups
  fieldGroup: {
    marginBottom: spacing.medium,              // 16px
  },
  
  fieldGroupCompact: {
    marginBottom: spacing.small,               // 8px
  },
  
  fieldGroupSpaced: {
    marginBottom: spacing.large,               // 24px
  },
  
  // Inline field groups (label and input on same row)
  fieldInline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.medium,              // 16px
  },
  
  // Field sections with headers
  fieldSection: {
    marginBottom: spacing.xlarge,              // 32px
  },
  
  fieldSectionHeader: {
    marginBottom: spacing.medium,              // 16px
    paddingBottom: spacing.small,              // 8px
    borderBottomWidth: borderWidth.hairline,   // 0.5px
  },
  
  fieldSectionTitle: {
    fontSize: typography.fontSize.large,       // 18px
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,    // 700
    marginBottom: spacing.tiny,                // 4px
  },
  
  fieldSectionSubtitle: {
    fontSize: typography.fontSize.small,       // 12px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.regular, // 400
    opacity: 0.7,
  },
  
  // Button groups in forms
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: spacing.xlarge,                 // 32px
    paddingTop: spacing.large,                 // 24px
    borderTopWidth: borderWidth.hairline,      // 0.5px
  },
  
  formActionsSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xlarge,                 // 32px
    paddingTop: spacing.large,                 // 24px
    borderTopWidth: borderWidth.hairline,      // 0.5px
  },
  
  formActionsStacked: {
    marginTop: spacing.xlarge,                 // 32px
    paddingTop: spacing.large,                 // 24px
    borderTopWidth: borderWidth.hairline,      // 0.5px
  },
  
  // Action button spacing
  actionButton: {
    marginLeft: spacing.medium,                // 16px
  },
  
  actionButtonFirst: {
    marginLeft: 0,
  },
  
  actionButtonStacked: {
    marginBottom: spacing.medium,              // 16px
    marginLeft: 0,
  },
};

// Icon styles for form inputs
const iconStyles = {
  leftIcon: {
    position: 'absolute',
    left: spacing.medium,                      // 16px
    zIndex: 1,
  },
  
  rightIcon: {
    position: 'absolute',
    right: spacing.medium,                     // 16px
    zIndex: 1,
  },
  
  searchIcon: {
    position: 'absolute',
    left: spacing.medium,                      // 16px
    zIndex: 1,
  },
  
  clearIcon: {
    position: 'absolute',
    right: spacing.medium,                     // 16px
    zIndex: 1,
    padding: spacing.tiny,                     // 4px
  },
  
  passwordToggle: {
    position: 'absolute',
    right: spacing.medium,                     // 16px
    zIndex: 1,
    padding: spacing.tiny,                     // 4px
  },
};

// Checkbox and radio styles
const selectionStyles = {
  // Checkbox container
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.medium,              // 16px
  },
  
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.sm,             // 4px
    borderWidth: borderWidth.thin,             // 1px
    marginRight: spacing.small,                // 8px
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  checkboxLarge: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.md,             // 6px
    marginRight: spacing.medium,               // 16px
  },
  
  checkboxSmall: {
    width: 16,
    height: 16,
    borderRadius: borderRadius.xs,             // 2px
    marginRight: spacing.extraSmall,           // 8px
  },
  
  // Radio button container
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.medium,              // 16px
  },
  
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10, // Always circular
    borderWidth: borderWidth.thin,             // 1px
    marginRight: spacing.small,                // 8px
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  radioLarge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: spacing.medium,               // 16px
  },
  
  radioSmall: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: spacing.extraSmall,           // 8px
  },
  
  // Inner dot for radio
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  radioDotLarge: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  
  radioDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  
  // Selection labels
  selectionLabel: {
    flex: 1,
    fontSize: typography.fontSize.medium,      // 14px
    fontFamily: typography.fontFamily,
    lineHeight: typography.lineHeight.normal,  // 1.4
  },
  
  selectionLabelSmall: {
    fontSize: typography.fontSize.small,       // 12px
  },
  
  selectionLabelLarge: {
    fontSize: typography.fontSize.large,       // 18px
  },
};

// Switch/Toggle styles
const switchStyles = {
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.medium,              // 16px
  },
  
  switchTrack: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
  },
  
  switchTrackLarge: {
    width: 60,
    height: 36,
    borderRadius: 18,
  },
  
  switchTrackSmall: {
    width: 40,
    height: 24,
    borderRadius: 12,
  },
  
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    position: 'absolute',
    top: 2,
    left: 2,
    ...shadows.sm,
  },
  
  switchThumbLarge: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  
  switchThumbSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  
  switchThumbActive: {
    left: 22, // 50 - 26 - 2
  },
  
  switchThumbActiveLarge: {
    left: 26, // 60 - 32 - 2
  },
  
  switchThumbActiveSmall: {
    left: 18, // 40 - 20 - 2
  },
  
  switchLabel: {
    flex: 1,
    fontSize: typography.fontSize.medium,      // 14px
    fontFamily: typography.fontFamily,
    marginRight: spacing.medium,               // 16px
  },
};

// Create light theme form styles
const createLightFormStyles = () => {
  const colors = lightColors;
  
  return {
    // Input states
    inputNormal: {
      borderColor: colors.border,
      backgroundColor: colors.surface,
      color: colors.text,
    },
    
    inputFocused: {
      borderColor: colors.primary,
      borderWidth: borderWidth.focus,           // 2px
      backgroundColor: colors.surface,
      color: colors.text,
      ...shadows.sm,
    },
    
    inputError: {
      borderColor: colors.error,
      borderWidth: borderWidth.focus,           // 2px
      backgroundColor: colors.surface,
      color: colors.text,
    },
    
    inputSuccess: {
      borderColor: colors.success,
      backgroundColor: colors.surface,
      color: colors.text,
    },
    
    inputWarning: {
      borderColor: colors.warning,
      backgroundColor: colors.surface,
      color: colors.text,
    },
    
    inputDisabled: {
      borderColor: colors.border,
      backgroundColor: colors.backgroundSecondary,
      color: colors.textTertiary,
      opacity: 0.6,
    },
    
    // Filled variant states
    filledNormal: {
      backgroundColor: colors.backgroundSecondary,
      color: colors.text,
    },
    
    filledFocused: {
      backgroundColor: colors.backgroundSecondary,
      color: colors.text,
      borderBottomWidth: borderWidth.focus,     // 2px
      borderBottomColor: colors.primary,
    },
    
    filledError: {
      backgroundColor: colors.errorBg,
      color: colors.text,
      borderBottomWidth: borderWidth.focus,     // 2px
      borderBottomColor: colors.error,
    },
    
    // Placeholder colors
    placeholder: {
      color: colors.textSecondary,
    },
    
    placeholderDisabled: {
      color: colors.textTertiary,
    },
    
    // Label colors
    label: {
      color: colors.text,
    },
    
    labelFocused: {
      color: colors.primary,
    },
    
    labelError: {
      color: colors.error,
    },
    
    labelRequired: {
      color: colors.error,
    },
    
    labelDisabled: {
      color: colors.textTertiary,
    },
    
    // Helper text colors
    helpText: {
      color: colors.textSecondary,
    },
    
    errorText: {
      color: colors.error,
    },
    
    successText: {
      color: colors.success,
    },
    
    warningText: {
      color: colors.warning,
    },
    
    // Selection control colors
    checkboxUnchecked: {
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    
    checkboxChecked: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    
    checkboxDisabled: {
      borderColor: colors.border,
      backgroundColor: colors.backgroundSecondary,
      opacity: 0.6,
    },
    
    radioUnchecked: {
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    
    radioChecked: {
      borderColor: colors.primary,
      backgroundColor: colors.surface,
    },
    
    radioDot: {
      backgroundColor: colors.primary,
    },
    
    radioDisabled: {
      borderColor: colors.border,
      backgroundColor: colors.backgroundSecondary,
      opacity: 0.6,
    },
    
    // Switch colors
    switchTrackOff: {
      backgroundColor: colors.border,
    },
    
    switchTrackOn: {
      backgroundColor: colors.primary,
    },
    
    switchTrackDisabled: {
      backgroundColor: colors.backgroundSecondary,
      opacity: 0.6,
    },
    
    switchThumb: {
      backgroundColor: colors.surface,
    },
    
    switchThumbDisabled: {
      backgroundColor: colors.textTertiary,
    },
    
    // Icon colors
    iconNormal: {
      color: colors.textSecondary,
    },
    
    iconFocused: {
      color: colors.primary,
    },
    
    iconError: {
      color: colors.error,
    },
    
    iconDisabled: {
      color: colors.textTertiary,
    },
    
    // Form section colors
    sectionBorder: {
      borderBottomColor: colors.border,
    },
    
    actionsBorder: {
      borderTopColor: colors.border,
    },
  };
};

// Create dark theme form styles
const createDarkFormStyles = () => {
  const colors = darkColors;
  
  return {
    // Input states
    inputNormal: {
      borderColor: colors.border,
      backgroundColor: colors.surface,
      color: colors.text,
    },
    
    inputFocused: {
      borderColor: colors.primary,
      borderWidth: borderWidth.focus,           // 2px
      backgroundColor: colors.surface,
      color: colors.text,
      ...darkShadows.sm,
    },
    
    inputError: {
      borderColor: colors.error,
      borderWidth: borderWidth.focus,           // 2px
      backgroundColor: colors.surface,
      color: colors.text,
    },
    
    inputSuccess: {
      borderColor: colors.success,
      backgroundColor: colors.surface,
      color: colors.text,
    },
    
    inputWarning: {
      borderColor: colors.warning,
      backgroundColor: colors.surface,
      color: colors.text,
    },
    
    inputDisabled: {
      borderColor: colors.border,
      backgroundColor: colors.backgroundSecondary,
      color: colors.textTertiary,
      opacity: 0.6,
    },
    
    // Filled variant states
    filledNormal: {
      backgroundColor: colors.backgroundSecondary,
      color: colors.text,
    },
    
    filledFocused: {
      backgroundColor: colors.backgroundSecondary,
      color: colors.text,
      borderBottomWidth: borderWidth.focus,     // 2px
      borderBottomColor: colors.primary,
    },
    
    filledError: {
      backgroundColor: colors.errorBg,
      color: colors.text,
      borderBottomWidth: borderWidth.focus,     // 2px
      borderBottomColor: colors.error,
    },
    
    // Placeholder colors
    placeholder: {
      color: colors.textSecondary,
    },
    
    placeholderDisabled: {
      color: colors.textTertiary,
    },
    
    // Label colors
    label: {
      color: colors.text,
    },
    
    labelFocused: {
      color: colors.primary,
    },
    
    labelError: {
      color: colors.error,
    },
    
    labelRequired: {
      color: colors.error,
    },
    
    labelDisabled: {
      color: colors.textTertiary,
    },
    
    // Helper text colors
    helpText: {
      color: colors.textSecondary,
    },
    
    errorText: {
      color: colors.error,
    },
    
    successText: {
      color: colors.success,
    },
    
    warningText: {
      color: colors.warning,
    },
    
    // Selection control colors
    checkboxUnchecked: {
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    
    checkboxChecked: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    
    checkboxDisabled: {
      borderColor: colors.border,
      backgroundColor: colors.backgroundSecondary,
      opacity: 0.6,
    },
    
    radioUnchecked: {
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    
    radioChecked: {
      borderColor: colors.primary,
      backgroundColor: colors.surface,
    },
    
    radioDot: {
      backgroundColor: colors.primary,
    },
    
    radioDisabled: {
      borderColor: colors.border,
      backgroundColor: colors.backgroundSecondary,
      opacity: 0.6,
    },
    
    // Switch colors
    switchTrackOff: {
      backgroundColor: colors.border,
    },
    
    switchTrackOn: {
      backgroundColor: colors.primary,
    },
    
    switchTrackDisabled: {
      backgroundColor: colors.backgroundSecondary,
      opacity: 0.6,
    },
    
    switchThumb: {
      backgroundColor: colors.surface,
    },
    
    switchThumbDisabled: {
      backgroundColor: colors.textTertiary,
    },
    
    // Icon colors
    iconNormal: {
      color: colors.textSecondary,
    },
    
    iconFocused: {
      color: colors.primary,
    },
    
    iconError: {
      color: colors.error,
    },
    
    iconDisabled: {
      color: colors.textTertiary,
    },
    
    // Form section colors
    sectionBorder: {
      borderBottomColor: colors.border,
    },
    
    actionsBorder: {
      borderTopColor: colors.border,
    },
  };
};

// Default form styles (light theme)
export const formStyles = StyleSheet.create({
  // Base styles
  baseInput,
  baseFormElement,
  
  // Input sizes
  inputSmall: inputSizes.small,
  inputMedium: inputSizes.medium,
  inputLarge: inputSizes.large,
  inputSearch: inputSizes.search,
  
  // Input variants
  inputDefault: inputVariants.default,
  inputSearch: inputVariants.search,
  inputPassword: inputVariants.password,
  inputTextarea: inputVariants.textarea,
  inputInline: inputVariants.inline,
  inputFilled: inputVariants.filled,
  
  // Labels
  ...labelStyles,
  
  // Helper text
  ...helperTextStyles,
  
  // Form layouts
  ...formLayouts,
  
  // Icons
  ...iconStyles,
  
  // Selection controls
  ...selectionStyles,
  
  // Switches
  ...switchStyles,
  
  // Light theme colors
  ...createLightFormStyles(),
  
  // Common states
  loading: {
    opacity: 0.7,
  },
  
  disabled: {
    opacity: 0.6,
  },
  
  readonly: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
});

// Theme-aware form styles
export const getFormStyles = (isDark = false) => {
  const themeColors = isDark ? createDarkFormStyles() : createLightFormStyles();
  
  return {
    ...formStyles,
    ...themeColors,
  };
};

// Utility functions for form styling
export const createInputStyle = (size = 'medium', variant = 'default', state = 'normal', isDark = false) => {
  const styles = getFormStyles(isDark);
  
  const baseStyle = styles.baseInput;
  const sizeStyle = styles[`input${size.charAt(0).toUpperCase() + size.slice(1)}`];
  const variantStyle = styles[`input${variant.charAt(0).toUpperCase() + variant.slice(1)}`];
  const stateStyle = styles[`input${state.charAt(0).toUpperCase() + state.slice(1)}`];
  
  return [baseStyle, sizeStyle, variantStyle, stateStyle];
};

export const createLabelStyle = (state = 'normal', size = 'base', isDark = false) => {
  const styles = getFormStyles(isDark);
  
  const baseStyle = size === 'large' ? styles.large : styles.base;
  const stateStyle = styles[`label${state.charAt(0).toUpperCase() + state.slice(1)}`];
  
  return [baseStyle, stateStyle];
};

// Form preset combinations for common use cases
export const formPresets = {
  // Standard forms
  standard: (isDark = false) => ({
    container: [formStyles.form],
    field: [formStyles.fieldGroup],
    input: createInputStyle('medium', 'default', 'normal', isDark),
    label: createLabelStyle('normal', 'base', isDark),
  }),
  
  // Compact forms
  compact: (isDark = false) => ({
    container: [formStyles.formCompact],
    field: [formStyles.fieldGroupCompact],
    input: createInputStyle('small', 'default', 'normal', isDark),
    label: createLabelStyle('normal', 'base', isDark),
  }),
  
  // Search forms
  search: (isDark = false) => ({
    container: [formStyles.formCompact],
    field: [formStyles.fieldGroup],
    input: createInputStyle('medium', 'search', 'normal', isDark),
    label: createLabelStyle('normal', 'base', isDark),
  }),
  
  // Settings forms
  settings: (isDark = false) => ({
    container: [formStyles.form],
    section: [formStyles.fieldSection],
    sectionHeader: [formStyles.fieldSectionHeader],
    field: [formStyles.fieldGroup],
    input: createInputStyle('medium', 'default', 'normal', isDark),
    label: createLabelStyle('normal', 'base', isDark),
  }),
  
  // Login/auth forms
  auth: (isDark = false) => ({
    container: [formStyles.form],
    field: [formStyles.fieldGroupSpaced],
    input: createInputStyle('large', 'default', 'normal', isDark),
    label: createLabelStyle('normal', 'large', isDark),
    actions: [formStyles.formActionsStacked],
  }),
  
  // Inline forms
  inline: (isDark = false) => ({
    container: [formStyles.formCompact],
    field: [formStyles.fieldInline],
    input: createInputStyle('medium', 'default', 'normal', isDark),
    label: createLabelStyle('normal', 'base', isDark),
    actions: [formStyles.formActions],
  }),
};

// Export individual style objects for direct import
export const lightFormStyles = createLightFormStyles();
export const darkFormStyles = createDarkFormStyles();

// Form validation helpers
export const getValidationColors = (isDark = false) => {
  const colors = isDark ? darkColors : lightColors;
  
  return {
    normal: colors.border,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    focus: colors.primary,
  };
};

// Accessibility helpers
export const getFormAccessibilityProps = (state, label, error, helpText) => {
  return {
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: helpText,
    accessibilityState: {
      invalid: state === 'error',
      disabled: state === 'disabled',
    },
    accessibilityValue: error ? { text: error } : undefined,
  };
};

// 11,892 characters