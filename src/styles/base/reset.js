// src/styles/base/reset.js
// Path: src/styles/base/reset.js

import { StyleSheet } from 'react-native';
import { typography, lightColors, darkColors } from '../tokens';

/**
 * Base reset styles - foundation styles applied globally
 * Provides consistent defaults across the entire application
 * Similar to CSS reset but for React Native
 */

export const resetStyles = StyleSheet.create({
  // Base container reset
  container: {
    flex: 1,
    backgroundColor: lightColors?.background || '#ffffff',
  },
  
  // Base text reset - ensures consistent text rendering
  text: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.body || 14,
    fontWeight: typography.fontWeight.regular || '400',
    lineHeight: typography.lineHeight.normal || 1.4,
    color: lightColors?.text || '#333333',
    includeFontPadding: false, // Android: removes extra padding
    textAlignVertical: 'center', // Android: better text alignment
  },
  
  // Heading text reset
  heading: {
    fontFamily: typography.fontFamilyBold || typography.fontFamily,
    fontWeight: typography.fontWeight.bold || '700',
    lineHeight: typography.lineHeight.tight || 1.2,
    color: lightColors?.text || '#333333',
    includeFontPadding: false,
  },
  
  // Button text reset
  buttonText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.button || 16,
    fontWeight: typography.fontWeight.medium || '500',
    lineHeight: typography.lineHeight.button || 20,
    textAlign: 'center',
    includeFontPadding: false,
  },
  
  // Input reset
  input: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.input || 16,
    fontWeight: typography.fontWeight.regular || '400',
    lineHeight: typography.lineHeight.input || 22,
    includeFontPadding: false,
    paddingVertical: 0, // Remove default padding
  },
  
  // Image reset
  image: {
    resizeMode: 'cover',
  },
  
  // ScrollView reset
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  
  // SafeAreaView reset
  safeArea: {
    flex: 1,
    backgroundColor: lightColors?.background || '#ffffff',
  },
  
  // Touchable feedback reset
  touchable: {
    activeOpacity: 0.7, // Consistent touch feedback
  },
  
  // Modal backdrop reset
  modalBackdrop: {
    flex: 1,
    backgroundColor: lightColors?.overlay || 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Card reset
  card: {
    backgroundColor: lightColors?.surface || '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  
  // Divider reset
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: lightColors?.border || '#e5e7eb',
  },
  
  // List reset
  list: {
    backgroundColor: 'transparent',
  },
  
  // Flex helpers (commonly needed)
  flex1: {
    flex: 1,
  },
  
  flexRow: {
    flexDirection: 'row',
  },
  
  flexColumn: {
    flexDirection: 'column',
  },
  
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  centerVertical: {
    justifyContent: 'center',
  },
  
  centerHorizontal: {
    alignItems: 'center',
  },
  
  spaceBetween: {
    justifyContent: 'space-between',
  },
  
  spaceAround: {
    justifyContent: 'space-around',
  },
  
  spaceEvenly: {
    justifyContent: 'space-evenly',
  },
  
  // Position helpers
  absolute: {
    position: 'absolute',
  },
  
  relative: {
    position: 'relative',
  },
  
  // Visibility helpers
  hidden: {
    opacity: 0,
  },
  
  visible: {
    opacity: 1,
  },
  
  // Overflow helpers
  overflowHidden: {
    overflow: 'hidden',
  },
  
  overflowVisible: {
    overflow: 'visible',
  },
});

// Dark theme reset styles
export const darkResetStyles = StyleSheet.create({
  container: {
    ...resetStyles.container,
    backgroundColor: darkColors?.background || '#111827',
  },
  
  text: {
    ...resetStyles.text,
    color: darkColors?.text || '#e5e7eb',
  },
  
  heading: {
    ...resetStyles.heading,
    color: darkColors?.text || '#e5e7eb',
  },
  
  safeArea: {
    ...resetStyles.safeArea,
    backgroundColor: darkColors?.background || '#111827',
  },
  
  modalBackdrop: {
    ...resetStyles.modalBackdrop,
    backgroundColor: darkColors?.overlay || 'rgba(0, 0, 0, 0.75)',
  },
  
  card: {
    ...resetStyles.card,
    backgroundColor: darkColors?.surface || '#1f2937',
  },
  
  divider: {
    ...resetStyles.divider,
    backgroundColor: darkColors?.border || '#374151',
  },
});

// Helper function to get theme-appropriate reset styles
export const getResetStyles = (isDark = false) => {
  const base = resetStyles;
  const dark = darkResetStyles;
  
  return {
    container: isDark ? dark.container : base.container,
    text: isDark ? dark.text : base.text,
    heading: isDark ? dark.heading : base.heading,
    buttonText: base.buttonText, // Same for both themes
    input: base.input, // Same for both themes
    image: base.image,
    scrollView: base.scrollView,
    safeArea: isDark ? dark.safeArea : base.safeArea,
    touchable: base.touchable,
    modalBackdrop: isDark ? dark.modalBackdrop : base.modalBackdrop,
    card: isDark ? dark.card : base.card,
    divider: isDark ? dark.divider : base.divider,
    list: base.list,
    
    // Layout helpers (same for both themes)
    flex1: base.flex1,
    flexRow: base.flexRow,
    flexColumn: base.flexColumn,
    center: base.center,
    centerVertical: base.centerVertical,
    centerHorizontal: base.centerHorizontal,
    spaceBetween: base.spaceBetween,
    spaceAround: base.spaceAround,
    spaceEvenly: base.spaceEvenly,
    absolute: base.absolute,
    relative: base.relative,
    hidden: base.hidden,
    visible: base.visible,
    overflowHidden: base.overflowHidden,
    overflowVisible: base.overflowVisible,
  };
};

// Export individual style categories for granular imports
export const layoutStyles = {
  flex1: resetStyles.flex1,
  flexRow: resetStyles.flexRow,
  flexColumn: resetStyles.flexColumn,
  center: resetStyles.center,
  centerVertical: resetStyles.centerVertical,
  centerHorizontal: resetStyles.centerHorizontal,
  spaceBetween: resetStyles.spaceBetween,
  spaceAround: resetStyles.spaceAround,
  spaceEvenly: resetStyles.spaceEvenly,
  absolute: resetStyles.absolute,
  relative: resetStyles.relative,
};

export const utilityStyles = {
  hidden: resetStyles.hidden,
  visible: resetStyles.visible,
  overflowHidden: resetStyles.overflowHidden,
  overflowVisible: resetStyles.overflowVisible,
};

// 4,892 characters