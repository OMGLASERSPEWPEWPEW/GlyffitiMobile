// src/styles/components/index.js
// Path: src/styles/components/index.js

/**
 * Components styles barrel export
 * Central hub for all component styling needs
 * Provides individual component styles and cross-component utilities
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
    
    // Apply theme to all presets
    themed: {
      buttons: Object.fromEntries(
        Object.entries(buttonPresets).map(([key, preset]) => [key, preset(isDark)])
      ),
      cards: Object.fromEntries(
        Object.entries(cardPresets).map(([key, preset]) => [key, preset(isDark)])
      ),
      content: Object.fromEntries(
        Object.entries(contentPresets).map(([key, preset]) => [key, preset(isDark)])
      ),
      forms: Object.fromEntries(
        Object.entries(formPresets).map(([key, preset]) => [key, preset(isDark)])
      ),
      navigation: Object.fromEntries(
        Object.entries(navigationPresets).map(([key, preset]) => [key, preset(isDark)])
      ),
    },
  };
};

/**
 * Create a complete UI kit with all styled components
 * @param {boolean} isDark - Whether to use dark theme
 * @returns {Object} Complete styled component kit
 */
export const createUIKit = (isDark = false) => {
  const styles = getComponentStyles(isDark);
  const presets = getComponentPresets(isDark);
  
  return {
    // Individual component styles
    ...styles,
    
    // Preset combinations
    presets: presets.themed,
    
    // Common UI patterns
    patterns: {
      // Modal with header and actions
      modal: {
        header: styles.navigation.modalHeader,
        content: styles.cards.modal,
        actions: styles.forms.formActions,
        backdrop: styles.navigation.modalBackdrop,
      },
      
      // Form with validation
      form: {
        container: styles.forms.form,
        field: styles.forms.fieldGroup,
        input: styles.forms.inputNormal,
        label: styles.forms.label,
        error: styles.forms.errorText,
        submit: presets.themed.buttons.submit,
        cancel: presets.themed.buttons.cancel,
      },
      
      // Content list item
      listItem: {
        container: presets.themed.cards.listItem,
        title: styles.content.titleSmall,
        subtitle: styles.content.subtitle,
        metadata: styles.content.metadata,
        action: styles.navigation.actionButton,
      },
      
      // Search interface
      search: {
        header: styles.navigation.searchHeader,
        input: styles.forms.inputSearch,
        suggestions: styles.navigation.searchSuggestions,
        results: presets.themed.cards.contentCard,
      },
      
      // Reading experience
      reading: {
        header: presets.themed.navigation.floatingHeader,
        content: presets.themed.content.story,
        controls: styles.navigation.floating,
        progress: styles.navigation.progressBar,
      },
      
      // Settings interface
      settings: {
        section: presets.themed.forms.settings,
        header: styles.forms.fieldSectionHeader,
        item: styles.forms.fieldInline,
        toggle: styles.forms.switchContainer,
        divider: styles.forms.divider,
      },
    },
    
    // Theme info
    theme: {
      isDark,
      mode: isDark ? 'dark' : 'light',
    },
  };
};

// =============================================================================
// COMPONENT STYLE COLLECTIONS
// =============================================================================

/**
 * All default component styles (light theme)
 * Convenient for importing all default styles at once
 */
export const defaultComponentStyles = {
  buttons: buttonStyles,
  cards: cardStyles,
  content: contentStyles,
  forms: formStyles,
  navigation: navigationStyles,
};

/**
 * All light theme component styles
 * Explicit light theme versions
 */
export const lightComponentStyles = {
  buttons: lightButtonStyles,
  cards: lightCardStyles,
  content: lightContentStyles,
  forms: lightFormStyles,
  navigation: lightNavigationStyles,
};

/**
 * All dark theme component styles
 * Explicit dark theme versions
 */
export const darkComponentStyles = {
  buttons: darkButtonStyles,
  cards: darkCardStyles,
  content: darkContentStyles,
  forms: darkFormStyles,
  navigation: darkNavigationStyles,
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
 * @returns {Object} Combined button and card styles
 */
export const createButtonCard = (
  buttonVariant = 'primary',
  buttonSize = 'medium',
  cardVariant = 'default',
  isDark = false
) => {
  return {
    card: createCardStyle(cardVariant, 'medium', 'low', isDark),
    button: createButtonStyle(buttonVariant, buttonSize, isDark),
  };
};

/**
 * Create a complete form field with label, input, and validation
 * @param {string} inputVariant - Input variant ('default', 'search', 'password')
 * @param {string} inputSize - Input size ('small', 'medium', 'large')
 * @param {string} state - Input state ('normal', 'error', 'success', 'warning')
 * @param {boolean} isDark - Whether to use dark theme
 * @returns {Object} Complete form field styles
 */
export const createFormField = (
  inputVariant = 'default',
  inputSize = 'medium',
  state = 'normal',
  isDark = false
) => {
  const formStyles = getFormStyles(isDark);
  
  return {
    container: formStyles.fieldGroup,
    label: createLabelStyle(state, 'base', isDark),
    input: createInputStyle(inputSize, inputVariant, state, isDark),
    error: [formStyles.base, formStyles.errorText],
    help: [formStyles.base, formStyles.helpText],
  };
};

/**
 * Create a complete content card with all elements
 * @param {string} cardVariant - Card variant ('default', 'elevated', etc.)
 * @param {string} titleLevel - Title level ('small', 'medium', 'large')
 * @param {boolean} isDark - Whether to use dark theme
 * @returns {Object} Complete content card styles
 */
export const createContentCard = (
  cardVariant = 'default',
  titleLevel = 'medium',
  isDark = false
) => {
  const cardStyles = getCardStyles(isDark);
  const contentStyles = getContentStyles(isDark);
  
  return {
    container: createCardStyle(cardVariant, 'medium', 'low', isDark),
    header: cardStyles.header,
    title: createTitleStyle(titleLevel, isDark),
    subtitle: [contentStyles.subtitle, contentStyles.secondaryText],
    content: [contentStyles.body, contentStyles.primaryText],
    metadata: [contentStyles.metadata, contentStyles.tertiaryText],
    tags: cardStyles.tagsContainer,
    tag: [cardStyles.tag, cardStyles.tagText],
    footer: cardStyles.footer,
  };
};

/**
 * Create a complete navigation header with all elements
 * @param {string} headerVariant - Header variant ('standard', 'large', 'modal')
 * @param {boolean} elevated - Whether header should be elevated
 * @param {boolean} isDark - Whether to use dark theme
 * @returns {Object} Complete navigation header styles
 */
export const createNavigationHeader = (
  headerVariant = 'standard',
  elevated = false,
  isDark = false
) => {
  const navStyles = getNavigationStyles(isDark);
  
  return {
    container: createHeaderStyle(headerVariant, elevated, isDark),
    leftSection: navStyles.leftSection,
    centerSection: navStyles.centerSection,
    rightSection: navStyles.rightSection,
    title: [navStyles.title, navStyles.headerTitle],
    subtitle: [navStyles.subtitle, navStyles.headerSubtitle],
    backButton: [navStyles.backButton, navStyles.backButtonText],
    actionButton: [navStyles.actionButton, navStyles.actionNormal],
  };
};

// =============================================================================
// THEME SWITCHING UTILITIES
// =============================================================================

/**
 * Create theme-switching styles for components
 * Returns both light and dark versions for easy switching
 * @returns {Object} Both light and dark theme styles
 */
export const createThemeSwitchableStyles = () => {
  return {
    light: {
      components: getComponentStyles(false),
      presets: getComponentPresets(false).themed,
      uiKit: createUIKit(false),
    },
    dark: {
      components: getComponentStyles(true),
      presets: getComponentPresets(true).themed,
      uiKit: createUIKit(true),
    },
    
    // Helper to get current theme
    getCurrent: (isDark) => isDark ? this.dark : this.light,
  };
};

/**
 * Interpolate between light and dark theme styles
 * Useful for animated theme transitions
 * @param {number} progress - Animation progress (0 = light, 1 = dark)
 * @returns {Object} Interpolated styles (basic implementation)
 */
export const interpolateThemeStyles = (progress = 0) => {
  // This is a basic implementation - you might want to enhance this
  // for actual animated theme transitions
  const isDark = progress > 0.5;
  return getComponentStyles(isDark);
};

// =============================================================================
// ACCESSIBILITY UTILITIES
// =============================================================================

/**
 * Get accessibility props for all components
 * @param {Object} options - Accessibility options
 * @returns {Object} Accessibility props for components
 */
export const getComponentAccessibilityProps = (options = {}) => {
  const {
    reducedMotion = false,
    highContrast = false,
    largeText = false,
  } = options;
  
  return {
    // Reduce animations if needed
    animations: reducedMotion ? { duration: 0 } : navigationAnimations,
    
    // High contrast adjustments
    contrast: highContrast ? {
      borderWidth: borderWidth.focus, // Thicker borders
      shadowOpacity: 0.3, // Stronger shadows
    } : {},
    
    // Large text adjustments
    typography: largeText ? {
      fontSize: {
        scale: 1.2, // 20% larger text
      },
      lineHeight: {
        scale: 1.3, // More line height for readability
      },
    } : {},
  };
};

// =============================================================================
// VALIDATION AND HELPERS
// =============================================================================

/**
 * Validate component style configuration
 * Helps catch common styling mistakes
 * @param {Object} config - Style configuration to validate
 * @returns {Object} Validation results
 */
export const validateStyleConfig = (config) => {
  const warnings = [];
  const errors = [];
  
  // Check for common issues
  if (config.button && !config.button.minHeight) {
    warnings.push('Button missing minHeight - may not meet accessibility standards');
  }
  
  if (config.input && config.input.minHeight < 44) {
    warnings.push('Input height < 44px - may not meet Apple HIG standards');
  }
  
  if (config.navigation && !config.navigation.elevation && !config.navigation.borderWidth) {
    warnings.push('Navigation header has no visual separation');
  }
  
  return {
    isValid: errors.length === 0,
    warnings,
    errors,
  };
};

/**
 * Get component style documentation
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
 * 
 * PRESET COLLECTIONS:
 * - buttonPresets, cardPresets, contentPresets, formPresets, navigationPresets
 * - getComponentPresets() - all presets for theme
 * 
 * UI KIT BUILDERS:
 * - createUIKit() - complete styled component kit
 * - createButtonCard(), createFormField(), createContentCard(), createNavigationHeader()
 * 
 * THEME UTILITIES:
 * - createThemeSwitchableStyles(), interpolateThemeStyles()
 * - lightComponentStyles, darkComponentStyles
 * 
 * ACCESSIBILITY:
 * - getComponentAccessibilityProps(), getFormAccessibilityProps()
 * 
 * DOCUMENTATION:
 * - getStyleDocumentation(), validateStyleConfig()
 */

// 5,247 characters