// src/styles/navigation.js
// Path: src/styles/navigation.js

import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from './tokens';

export const navigationStyles = StyleSheet.create({
  // Top Bar Styles
  topBar: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 1000,
  },
  
  topBarDark: {
    backgroundColor: '#111827',
    borderBottomColor: '#374151',
  },
  
  topBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    minHeight: 56,
  },
  
  topBarTitle: {
    fontSize: typography.fontSize.large,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    letterSpacing: -0.5,
  },
  
  topBarTitleDark: {
    color: '#e5e7eb',
  },
  
  // Bottom Bar Styles
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    zIndex: 1000,
  },
  
  bottomBarDark: {
    backgroundColor: '#111827',
    borderTopColor: '#374151',
  },
  
  bottomBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: spacing.small,
    paddingHorizontal: spacing.small,
  },
  
  bottomBarTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.small,
  },
  
  bottomBarIcon: {
    fontSize: 24,
    marginBottom: 2,
  },
  
  bottomBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  bottomBarLabelActive: {
    color: colors.primary,
  },
  
  bottomBarLabelActiveDark: {
    color: '#3b82f6',
  },
  
  bottomBarLabelInactive: {
    color: colors.textSecondary,
  },
  
  bottomBarLabelInactiveDark: {
    color: '#9ca3af',
  },
  
  // Animation Styles
  animatedTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  
  // Screen Content with Bars
  screenWithBars: {
    flex: 1,
    paddingTop: 56, // Top bar height
    paddingBottom: 80, // Bottom bar height
  },
  
  // Safe Area Adjustments
  safeAreaTop: {
    paddingTop: spacing.medium,
  },
  
  safeAreaBottom: {
    paddingBottom: spacing.medium,
  },
});

// Constants for layout calculations
export const NAVIGATION_CONSTANTS = {
  TOP_BAR_HEIGHT: 56,
  BOTTOM_BAR_HEIGHT: 80,
  ANIMATION_DURATION: 200,
  SCROLL_THRESHOLD: 50,
  HIDE_THRESHOLD: 100,
};

// Character count: 2507