// src/styles/base/index.js
// Path: src/styles/base/index.js

/**
 * Base styles barrel export
 * Provides foundation styles and theme system
 * Import from here for all base styling needs
 */

// Reset styles
export {
  resetStyles,
  darkResetStyles,
  getResetStyles,
  layoutStyles,
  utilityStyles,
} from './reset';

// Theme system
export {
  lightTheme,
  darkTheme,
  themes,
  getTheme,
  createTheme,
  interpolateTheme,
  themeQueries,
  THEME_MODES,
  defaultTheme,
} from './themes';

// Common style mixins and helpers
export const styleMixins = {
  // Text truncation
  textTruncate: {
    overflow: 'hidden',
    // Note: React Native doesn't support text-overflow, use numberOfLines prop
  },
  
  // Center content absolutely
  centerAbsolute: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [
      { translateX: -50 },
      { translateY: -50 },
    ],
  },
  
  // Full size overlay
  fullOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  // Screen padding (safe area aware)
  screenPadding: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  
  // Card elevation
  cardElevation: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Focus ring (for accessibility)
  focusRing: {
    borderWidth: 2,
    borderColor: '#3b82f6', // Primary color
  },
  
  // Disabled state
  disabled: {
    opacity: 0.6,
  },
  
  // Loading state
  loading: {
    opacity: 0.7,
  },
};

// Common component base styles
export const componentBases = {
  // Interactive element base
  interactive: {
    cursor: 'pointer', // Web only, ignored on mobile
    userSelect: 'none', // Web only, ignored on mobile
  },
  
  // Input base
  inputBase: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 44, // Accessibility minimum
  },
  
  // Button base
  buttonBase: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44, // Accessibility minimum
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  // Card base
  cardBase: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Modal base
  modalBase: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    maxWidth: 400,
    width: '90%',
    maxHeight: '80%',
  },
  
  // List item base
  listItemBase: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  
  // Avatar base
  avatarBase: {
    borderRadius: 9999, // Circular
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Badge base
  badgeBase: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 24,
    minHeight: 24,
  },
};

// Animation presets
export const animationPresets = {
  // Fade in/out
  fadeIn: {
    opacity: 1,
  },
  fadeOut: {
    opacity: 0,
  },
  
  // Scale animations
  scaleIn: {
    transform: [{ scale: 1 }],
  },
  scaleOut: {
    transform: [{ scale: 0.95 }],
  },
  
  // Slide animations
  slideInUp: {
    transform: [{ translateY: 0 }],
  },
  slideOutDown: {
    transform: [{ translateY: 100 }],
  },
  
  slideInLeft: {
    transform: [{ translateX: 0 }],
  },
  slideOutRight: {
    transform: [{ translateX: 100 }],
  },
};

// Responsive breakpoints (for web or tablet support)
export const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  large: 1200,
};

// Helper functions for responsive design
export const responsiveHelpers = {
  // Get style based on screen width
  getResponsiveStyle: (styles, width) => {
    if (width >= breakpoints.large) return styles.large || styles.desktop || styles.tablet || styles.mobile;
    if (width >= breakpoints.desktop) return styles.desktop || styles.tablet || styles.mobile;
    if (width >= breakpoints.tablet) return styles.tablet || styles.mobile;
    return styles.mobile;
  },
  
  // Check if device is tablet size or larger
  isTabletOrLarger: (width) => width >= breakpoints.tablet,
  
  // Check if device is desktop size or larger
  isDesktopOrLarger: (width) => width >= breakpoints.desktop,
};

// Platform-specific helpers
export const platformHelpers = {
  // iOS specific styles
  ios: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  // Android specific styles
  android: {
    elevation: 3,
  },
  
  // Web specific styles
  web: {
    cursor: 'pointer',
    userSelect: 'none',
    outline: 'none',
  },
};

// Accessibility helpers
export const a11yHelpers = {
  // Screen reader only (visually hidden but accessible)
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
  },
  
  // Focus visible (for keyboard navigation)
  focusVisible: {
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderStyle: 'solid',
  },
  
  // High contrast mode helpers
  highContrast: {
    borderWidth: 1,
    borderColor: '#000000',
  },
  
  // Minimum touch target size
  minTouchTarget: {
    minWidth: 44,
    minHeight: 44,
  },
};

// Export grouped helpers for convenience
export const helpers = {
  mixins: styleMixins,
  components: componentBases,
  animations: animationPresets,
  responsive: responsiveHelpers,
  platform: platformHelpers,
  accessibility: a11yHelpers,
  breakpoints,
};

// 4,836 characters