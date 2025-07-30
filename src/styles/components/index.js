// src/styles/components/index.js
// Path: src/styles/components/index.js

/**
 * Components styles barrel export
 * Central hub for all component styling needs
 * Provides individual component styles and cross-component utilities
 * 
 * FIXED: Removed defaultComponentStyles, lightComponentStyles, and darkComponentStyles
 * exports that were causing initialization order issues
 * 
 * Usage Examples:
 * 
 * // Import individual component styles
 * import { buttonStyles, cardStyles } from '@/styles/components';
 * 
 * // Import theme-aware functions
 * import { getComponentStyles } from '@/styles/components';
 * const styles = getComponentStyles(isDark);
 * 
 * // Import specific utilities
 * import { createButtonStyle, cardPresets } from '@/styles/components';
 * 
 * // Import everything for comprehensive access
 * import * as componentStyles from '@/styles/components';
 */

// =============================================================================
// INDIVIDUAL COMPONENT EXPORTS
// =============================================================================

// Buttons
export {
  buttonStyles,
  getButtonStyles,
  createButtonStyle,
  createIconButtonStyle,
  buttonPresets,
  lightButtonStyles,
  darkButtonStyles,
} from './buttons';

// Cards  
export {
  cardStyles,
  getCardStyles,
  createCardStyle,
  cardPresets,
  lightCardStyles,
  darkCardStyles,
  getCardTextColors,
} from './cards';

// Content
export {
  contentStyles,
  getContentStyles,
  createReadingStyle,
  createTitleStyle,
  contentPresets,
  lightContentStyles,
  darkContentStyles,
  getContentTextColors,
  getOptimalReadingWidth,
  getOptimalLineHeight,
  getOptimalParagraphSpacing,
} from './content';

// Forms
export {
  formStyles,
  getFormStyles,
  createInputStyle,
  createLabelStyle,
  formPresets,
  lightFormStyles,
  darkFormStyles,
  getValidationColors,
  getFormAccessibilityProps,
} from './forms';

// Navigation
export {
  navigationStyles,
  getNavigationStyles,
  createHeaderStyle,
  createTabBarStyle,
  createFABStyle,
  navigationPresets,
  lightNavigationStyles,
  darkNavigationStyles,
  navigationConstants,
  getHeaderHeight,
  getTabBarHeight,
  getSafeAreaInsets,
  navigationAnimations,
} from './navigation';

// =============================================================================
// CROSS-COMPONENT UTILITIES
// =============================================================================

/**
 * Get all component styles for a specific theme
 * @param {boolean} isDark - Whether to use dark theme
 * @returns {Object} All component styles with theme applied
 */
export const getComponentStyles = (isDark = false) => {
  return {
    // Component styles
    buttons: getButtonStyles(isDark),
    cards: getCardStyles(isDark),
    content: getContentStyles(isDark),
    forms: getFormStyles(isDark),
    navigation: getNavigationStyles(isDark),
    
    // Convenience getters
    get button() { return this.buttons; },
    get card() { return this.cards; },
    get form() { return this.forms; },
    get nav() { return this.navigation; },
  };
};

/**
 * Get all component presets for a specific theme
 * @param {boolean} isDark - Whether to use dark theme  
 * @returns {Object} All component presets with theme applied
 */
export const getComponentPresets = (isDark = false) => {
  return {
    buttons: buttonPresets,
    cards: cardPresets,
    content: contentPresets,
    forms: formPresets,
    navigation: navigationPresets,
    
    // Theme-aware preset getters
    getButtonPreset: (preset) => buttonPresets[preset]?.(isDark),
    getCardPreset: (preset) => cardPresets[preset]?.(isDark),
    getContentPreset: (preset) => contentPresets[preset]?.(isDark),
    getFormPreset: (preset) => formPresets[preset]?.(isDark),
    getNavigationPreset: (preset) => navigationPresets[preset]?.(isDark),
  };
};

/**
 * Create themed component styles on demand
 * @param {boolean} isDark - Whether to use dark theme
 * @returns {Object} Theme configuration
 */
export const createThemeComponents = (isDark = false) => {
  return {
    styles: getComponentStyles(isDark),
    presets: getComponentPresets(isDark),
    colors: getAllTextColors(isDark),
    theme: isDark ? 'dark' : 'light',
  };
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get text colors for all components in specified theme
 * @param {boolean} isDark - Whether to use dark theme
 * @returns {Object} Text colors for all components
 */
export const getAllTextColors = (isDark = false) => {
  return {
    content: getContentTextColors(isDark),
    cards: getCardTextColors(isDark),
    validation: getValidationColors(isDark),
  };
};

/**
 * Create a complete button with card container
 * @param {string} buttonVariant - Button variant ('primary', 'secondary', etc.)
 * @param {string} buttonSize - Button size ('small', 'medium', 'large')
 * @param {string} cardVariant - Card variant ('default', 'elevated', etc.)
 * @param {boolean} isDark - Whether to use dark theme
 * @returns {Object} Combined styles for button in card
 */
export const createButtonInCard = (
  buttonVariant = 'primary',
  buttonSize = 'medium', 
  cardVariant = 'default',
  isDark = false
) => {
  return {
    card: createCardStyle(cardVariant, 'medium', isDark),
    button: createButtonStyle(buttonVariant, buttonSize, isDark),
  };
};

/**
 * Create a form field with all necessary styles
 * @param {string} inputSize - Input size ('small', 'medium', 'large')
 * @param {string} state - Field state ('normal', 'error', 'success', etc.)
 * @param {boolean} isDark - Whether to use dark theme
 * @returns {Object} Complete form field styles
 */
export const createFormField = (
  inputSize = 'medium',
  state = 'normal',
  isDark = false
) => {
  const formStyles = getFormStyles(isDark);
  
  return {
    container: formStyles.fieldGroup,
    label: createLabelStyle(state, 'base', isDark),
    input: createInputStyle(state, inputSize, isDark),
    error: formStyles.errorText,
    help: formStyles.helpText,
  };
};

/**
 * Get documentation for all component styles
 * Useful for style guides and documentation
 * @returns {Object} Documentation for all component styles
 */
export const getStyleDocumentation = () => {
  return {
    buttons: {
      description: 'Comprehensive button system with variants, sizes, and states',
      variants: ['primary', 'secondary', 'success', 'error', 'warning', 'ghost', 'link', 'outline'],
      sizes: ['small', 'medium', 'large', 'icon', 'iconSmall', 'iconLarge'],
      states: ['normal', 'hover', 'active', 'disabled', 'loading'],
    },
    
    cards: {
      description: 'Flexible card system for content containers',
      variants: ['default', 'outlined', 'filled', 'elevated', 'success', 'warning', 'error', 'info'],
      sizes: ['small', 'medium', 'large', 'compact', 'hero'],
      elevations: ['flat', 'low', 'medium', 'high', 'floating'],
    },
    
    content: {
      description: 'Typography and content layout system',
      typography: ['heading1', 'heading2', 'heading3', 'title', 'subtitle', 'body', 'caption'],
      layouts: ['article', 'reading', 'preview', 'listItem'],
      readingSizes: ['tiny', 'small', 'medium', 'large', 'extraLarge', 'huge'],
    },
    
    forms: {
      description: 'Complete form system with inputs, validation, and layouts',
      inputs: ['default', 'search', 'password', 'textarea', 'inline', 'filled'],
      sizes: ['small', 'medium', 'large'],
      states: ['normal', 'focused', 'error', 'success', 'warning', 'disabled'],
    },
    
    navigation: {
      description: 'Navigation system with headers, tabs, menus, and FABs',
      headers: ['standard', 'large', 'compact', 'modal', 'search', 'floating'],
      tabs: ['standard', 'compact', 'elevated', 'floating'],
      fabs: ['small', 'base', 'large', 'extended'],
    },
  };
};

// =============================================================================
// EXPORT SUMMARY
// =============================================================================

/**
 * Complete export summary for reference:
 * 
 * COMPONENT STYLES:
 * - buttonStyles, cardStyles, contentStyles, formStyles, navigationStyles
 * 
 * THEME FUNCTIONS:
 * - getButtonStyles(), getCardStyles(), getContentStyles(), getFormStyles(), getNavigationStyles()
 * - getComponentStyles() - all components for theme
 * 
 * UTILITY FUNCTIONS:
 * - createButtonStyle(), createCardStyle(), createInputStyle(), createHeaderStyle(), etc.
 * - createButtonInCard(), createFormField()
 * - getAllTextColors(), getStyleDocumentation()
 * 
 * PRESETS:
 * - buttonPresets, cardPresets, contentPresets, formPresets, navigationPresets
 * - getComponentPresets() - all presets with theme support
 * 
 * THEME EXPORTS:
 * - lightButtonStyles, darkButtonStyles (same pattern for all components)
 * - createThemeComponents() - complete theme configuration
 */

// Character count: 6,547