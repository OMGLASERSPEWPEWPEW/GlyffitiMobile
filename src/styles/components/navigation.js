// src/styles/components/navigation.js
// Path: src/styles/components/navigation.js

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
  getColors,
  getShadows 
} from '../tokens';

/**
 * Navigation styles - comprehensive navigation system
 * All navigation elements, layouts, and states in one place
 * Uses design tokens for consistency and theming support
 * 
 * Usage:
 * - Import specific styles: navigationStyles.header, navigationStyles.tabBar
 * - Theme-aware: use getNavigationStyles(isDark) for proper colors
 * - Combine: [navigationStyles.header, navigationStyles.elevated]
 */

// Base navigation constants
const navigationConstants = {
  // Standard heights (following platform conventions)
  headerHeight: 56,           // Standard header height
  headerHeightLarge: 72,      // Large header (with subtitle)
  tabBarHeight: 60,           // Bottom tab bar height
  tabBarHeightCompact: 50,    // Compact tab bar
  searchBarHeight: 44,        // Search input height
  
  // Touch targets (Apple HIG minimum)
  minTouchTarget: 44,
  
  // Safe area considerations
  statusBarHeight: 24,        // Estimated status bar height
  
  // Animation timings
  transitionDuration: 250,
  quickTransition: 150,
  slowTransition: 350,
};

// Header variants
const headerStyles = {
  // Base header container
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: navigationConstants.headerHeight,
    paddingHorizontal: spacing.medium,       // 16px
    borderBottomWidth: borderWidth.hairline, // 0.5px
  },
  
  // Header size variants
  standard: {
    height: navigationConstants.headerHeight,
    paddingVertical: spacing.small,          // 8px
  },
  
  large: {
    height: navigationConstants.headerHeightLarge,
    paddingVertical: spacing.medium,         // 16px
  },
  
  compact: {
    height: 48,
    paddingVertical: spacing.extraSmall,     // 8px
  },
  
  // Header style variants
  elevated: {
    borderBottomWidth: 0,
    ...shadows.md,
  },
  
  transparent: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  
  floating: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  
  modal: {
    borderBottomWidth: 0,
    borderTopLeftRadius: borderRadius.modal,     // 16px
    borderTopRightRadius: borderRadius.modal,    // 16px
  },
  
  search: {
    paddingHorizontal: spacing.small,            // 8px
    height: navigationConstants.searchBarHeight + (spacing.small * 2), // 44px + 16px
  },
  
  // Header sections
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  
  centerSection: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  
  // Title styles
  title: {
    fontSize: typography.fontSize.large,        // 18px
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,     // 700
    lineHeight: typography.lineHeight.tight,    // 1.2
    textAlign: 'center',
  },
  
  titleLarge: {
    fontSize: typography.fontSize.title,        // 24px
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,     // 700
    lineHeight: typography.lineHeight.tight,    // 1.2
  },
  
  titleSmall: {
    fontSize: typography.fontSize.medium,       // 14px
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.medium,   // 500
    lineHeight: typography.lineHeight.tight,    // 1.2
  },
  
  subtitle: {
    fontSize: typography.fontSize.small,        // 12px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.regular,  // 400
    lineHeight: typography.lineHeight.normal,   // 1.4
    opacity: 0.7,
    marginTop: spacing.tiny,                    // 4px
  },
};

// Navigation buttons and actions
const actionStyles = {
  // Base action button
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: navigationConstants.minTouchTarget,  // 44px
    minHeight: navigationConstants.minTouchTarget, // 44px
    borderRadius: borderRadius.button,             // 8px
  },
  
  // Action button sizes
  actionSmall: {
    minWidth: 36,
    minHeight: 36,
    borderRadius: borderRadius.sm,               // 4px
  },
  
  actionLarge: {
    minWidth: 52,
    minHeight: 52,
    borderRadius: borderRadius.lg,               // 8px
  },
  
  // Action button variants
  actionGhost: {
    backgroundColor: 'transparent',
  },
  
  actionFilled: {
    paddingHorizontal: spacing.medium,           // 16px
  },
  
  actionClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Icon styles
  actionIcon: {
    width: 24,
    height: 24,
  },
  
  actionIconSmall: {
    width: 20,
    height: 20,
  },
  
  actionIconLarge: {
    width: 28,
    height: 28,
  },
  
  // Back button specific
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.small,              // 8px
    paddingRight: spacing.small,                 // 8px
  },
  
  backButtonText: {
    fontSize: typography.fontSize.medium,        // 14px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.medium,    // 500
    marginLeft: spacing.tiny,                    // 4px
  },
};

// Tab bar styles
const tabBarStyles = {
  // Base tab bar container
  base: {
    flexDirection: 'row',
    height: navigationConstants.tabBarHeight,    // 60px
    borderTopWidth: borderWidth.hairline,        // 0.5px
    paddingBottom: spacing.small,                // 8px (for safe area)
    paddingTop: spacing.extraSmall,              // 8px
  },
  
  // Tab bar variants
  standard: {
    height: navigationConstants.tabBarHeight,
  },
  
  compact: {
    height: navigationConstants.tabBarHeightCompact,
    paddingBottom: spacing.tiny,                 // 4px
    paddingTop: spacing.tiny,                    // 4px
  },
  
  elevated: {
    borderTopWidth: 0,
    ...shadows.md,
  },
  
  floating: {
    position: 'absolute',
    bottom: spacing.medium,                      // 16px
    left: spacing.medium,                        // 16px
    right: spacing.medium,                       // 16px
    borderRadius: borderRadius.large,            // 12px
    borderTopWidth: 0,
    ...shadows.lg,
  },
  
  // Individual tab styles
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.extraSmall,         // 8px
    paddingHorizontal: spacing.tiny,             // 4px
  },
  
  tabActive: {
    // Active state styling applied via theme colors
  },
  
  tabInactive: {
    opacity: 0.6,
  },
  
  tabDisabled: {
    opacity: 0.3,
  },
  
  // Tab content
  tabIcon: {
    width: 24,
    height: 24,
    marginBottom: spacing.tiny,                  // 4px
  },
  
  tabIconSmall: {
    width: 20,
    height: 20,
    marginBottom: spacing.tiny,                  // 4px
  },
  
  tabIconLarge: {
    width: 28,
    height: 28,
    marginBottom: spacing.tiny,                  // 4px
  },
  
  tabLabel: {
    fontSize: typography.fontSize.small,         // 12px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.medium,    // 500
    textAlign: 'center',
    lineHeight: 14,
  },
  
  tabLabelCompact: {
    fontSize: 10,
    lineHeight: 12,
  },
  
  // Tab badge (notification indicator)
  tabBadge: {
    position: 'absolute',
    top: spacing.tiny,                           // 4px
    right: '30%',
    backgroundColor: lightColors.error,          // Will be overridden by theme
    borderRadius: borderRadius.full,             // Circular
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.tiny,             // 4px
  },
  
  tabBadgeText: {
    fontSize: 10,
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.bold,      // 700
    color: palette.white,
    textAlign: 'center',
  },
};

// Breadcrumb navigation
const breadcrumbStyles = {
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.medium,           // 16px
    paddingVertical: spacing.small,              // 8px
    borderBottomWidth: borderWidth.hairline,     // 0.5px
  },
  
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  itemText: {
    fontSize: typography.fontSize.small,         // 12px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.regular,   // 400
  },
  
  itemActive: {
    fontWeight: typography.fontWeight.medium,    // 500
  },
  
  separator: {
    fontSize: typography.fontSize.small,         // 12px
    marginHorizontal: spacing.small,             // 8px
    opacity: 0.5,
  },
};

// Menu and dropdown styles
const menuStyles = {
  // Menu container
  container: {
    borderRadius: borderRadius.medium,           // 8px
    paddingVertical: spacing.small,              // 8px
    minWidth: 200,
    maxWidth: 300,
    ...shadows.lg,
  },
  
  // Menu items
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.medium,           // 16px
    paddingVertical: spacing.small,              // 8px
    minHeight: navigationConstants.minTouchTarget, // 44px
  },
  
  itemActive: {
    // Active state styling applied via theme colors
  },
  
  itemDisabled: {
    opacity: 0.5,
  },
  
  itemDanger: {
    // Danger state styling applied via theme colors
  },
  
  // Menu item content
  itemIcon: {
    width: 20,
    height: 20,
    marginRight: spacing.small,                  // 8px
  },
  
  itemText: {
    flex: 1,
    fontSize: typography.fontSize.medium,        // 14px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.regular,   // 400
  },
  
  itemSubtext: {
    fontSize: typography.fontSize.small,         // 12px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.regular,   // 400
    opacity: 0.7,
    marginTop: spacing.tiny,                     // 4px
  },
  
  itemShortcut: {
    fontSize: typography.fontSize.small,         // 12px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.regular,   // 400
    opacity: 0.5,
    marginLeft: spacing.medium,                  // 16px
  },
  
  // Menu divider
  divider: {
    height: borderWidth.hairline,                // 0.5px
    marginVertical: spacing.small,               // 8px
    marginHorizontal: spacing.medium,            // 16px
  },
  
  // Menu section
  section: {
    paddingTop: spacing.small,                   // 8px
  },
  
  sectionHeader: {
    paddingHorizontal: spacing.medium,           // 16px
    paddingVertical: spacing.extraSmall,         // 8px
  },
  
  sectionTitle: {
    fontSize: typography.fontSize.small,         // 12px
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,      // 700
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.7,
  },
};

// Floating Action Button (FAB)
const fabStyles = {
  // Base FAB
  base: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  
  // FAB sizes
  small: {
    width: 40,
    height: 40,
    borderRadius: 20,
    ...shadows.md,
  },
  
  large: {
    width: 72,
    height: 72,
    borderRadius: 36,
    ...shadows.xl,
  },
  
  // FAB positions
  bottomRight: {
    bottom: spacing.large,                       // 24px
    right: spacing.large,                        // 24px
  },
  
  bottomCenter: {
    bottom: spacing.large,                       // 24px
    alignSelf: 'center',
  },
  
  bottomLeft: {
    bottom: spacing.large,                       // 24px
    left: spacing.large,                         // 24px
  },
  
  // FAB with tab bar offset
  withTabBar: {
    bottom: navigationConstants.tabBarHeight + spacing.large, // 60px + 24px
  },
  
  // Extended FAB (with text)
  extended: {
    width: 'auto',
    flexDirection: 'row',
    paddingHorizontal: spacing.large,            // 24px
    minWidth: 120,
  },
  
  extendedIcon: {
    marginRight: spacing.small,                  // 8px
  },
  
  extendedText: {
    fontSize: typography.fontSize.medium,        // 14px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.medium,    // 500
  },
  
  // FAB states
  pressed: {
    transform: [{ scale: 0.95 }],
    ...shadows.md,
  },
};

// Search bar styles
const searchStyles = {
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: navigationConstants.searchBarHeight, // 44px
    paddingHorizontal: spacing.medium,           // 16px
    borderRadius: borderRadius.full,             // Pill shape
    borderWidth: borderWidth.thin,               // 1px
  },
  
  containerFocused: {
    borderWidth: borderWidth.focus,              // 2px
  },
  
  input: {
    flex: 1,
    fontSize: typography.fontSize.medium,        // 14px
    fontFamily: typography.fontFamily,
    paddingHorizontal: spacing.small,            // 8px
    paddingVertical: 0,
    margin: 0,
  },
  
  icon: {
    width: 20,
    height: 20,
    marginRight: spacing.small,                  // 8px
  },
  
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.small,                   // 8px
  },
  
  suggestions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderRadius: borderRadius.medium,           // 8px
    marginTop: spacing.tiny,                     // 4px
    maxHeight: 200,
    ...shadows.lg,
  },
  
  suggestion: {
    paddingHorizontal: spacing.medium,           // 16px
    paddingVertical: spacing.small,              // 8px
    borderBottomWidth: borderWidth.hairline,     // 0.5px
  },
  
  suggestionLast: {
    borderBottomWidth: 0,
  },
  
  suggestionText: {
    fontSize: typography.fontSize.medium,        // 14px
    fontFamily: typography.fontFamily,
  },
};

// Progress indicators for navigation
const progressStyles = {
  // Linear progress bar (for page loading)
  progressBar: {
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  
  // Step indicator (for multi-step flows)
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.medium,           // 16px
    paddingVertical: spacing.large,              // 24px
  },
  
  step: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: borderWidth.thin,               // 1px
  },
  
  stepActive: {
    borderWidth: 0,
  },
  
  stepCompleted: {
    borderWidth: 0,
  },
  
  stepText: {
    fontSize: typography.fontSize.small,         // 12px
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.bold,      // 700
  },
  
  stepConnector: {
    flex: 1,
    height: borderWidth.thin,                    // 1px
    marginHorizontal: spacing.small,             // 8px
  },
  
  stepLabel: {
    position: 'absolute',
    top: 40,
    left: -50,
    right: -50,
    textAlign: 'center',
    fontSize: typography.fontSize.small,         // 12px
    fontFamily: typography.fontFamily,
  },
};

// Create light theme navigation styles
const createLightNavigationStyles = () => {
  const colors = lightColors;
  
  return {
    // Header colors
    headerBackground: { backgroundColor: colors.surface },
    headerBackgroundTransparent: { backgroundColor: 'rgba(255, 255, 255, 0.95)' },
    headerBorder: { borderBottomColor: colors.border },
    headerTitle: { color: colors.text },
    headerSubtitle: { color: colors.textSecondary },
    
    // Action colors
    actionNormal: { color: colors.primary },
    actionPressed: { backgroundColor: colors.backgroundSecondary },
    actionDisabled: { color: colors.textTertiary },
    backButtonText: { color: colors.primary },
    
    // Tab bar colors
    tabBarBackground: { backgroundColor: colors.surface },
    tabBarBorder: { borderTopColor: colors.border },
    tabActive: { color: colors.primary },
    tabInactive: { color: colors.textSecondary },
    tabBadge: { backgroundColor: colors.error },
    
    // Menu colors
    menuBackground: { backgroundColor: colors.surface },
    menuBorder: { borderColor: colors.border },
    menuItem: { color: colors.text },
    menuItemActive: { 
      backgroundColor: colors.backgroundSecondary,
      color: colors.primary,
    },
    menuItemHover: { backgroundColor: colors.backgroundSecondary },
    menuItemDanger: { color: colors.error },
    menuDivider: { backgroundColor: colors.border },
    menuSectionTitle: { color: colors.textSecondary },
    
    // FAB colors
    fabPrimary: { backgroundColor: colors.primary },
    fabSecondary: { backgroundColor: colors.surface },
    fabText: { color: palette.white },
    fabIcon: { color: palette.white },
    
    // Search colors
    searchBackground: { backgroundColor: colors.surface },
    searchBorder: { borderColor: colors.border },
    searchBorderFocused: { borderColor: colors.primary },
    searchText: { color: colors.text },
    searchPlaceholder: { color: colors.textSecondary },
    searchIcon: { color: colors.textSecondary },
    searchSuggestionBg: { backgroundColor: colors.surface },
    searchSuggestionBorder: { borderBottomColor: colors.border },
    searchSuggestionText: { color: colors.text },
    
    // Breadcrumb colors
    breadcrumbBackground: { backgroundColor: colors.backgroundSecondary },
    breadcrumbBorder: { borderBottomColor: colors.border },
    breadcrumbText: { color: colors.textSecondary },
    breadcrumbActive: { color: colors.text },
    breadcrumbSeparator: { color: colors.textTertiary },
    
    // Progress colors
    progressBackground: { backgroundColor: colors.border },
    progressFill: { backgroundColor: colors.primary },
    stepInactive: { 
      backgroundColor: colors.surface,
      borderColor: colors.border,
      color: colors.textSecondary,
    },
    stepActive: { 
      backgroundColor: colors.primary,
      color: palette.white,
    },
    stepCompleted: { 
      backgroundColor: colors.success,
      color: palette.white,
    },
    stepConnector: { backgroundColor: colors.border },
    stepLabel: { color: colors.textSecondary },
  };
};

// Create dark theme navigation styles
const createDarkNavigationStyles = () => {
  const colors = darkColors;
  
  return {
    // Header colors
    headerBackground: { backgroundColor: colors.surface },
    headerBackgroundTransparent: { backgroundColor: 'rgba(31, 41, 55, 0.95)' },
    headerBorder: { borderBottomColor: colors.border },
    headerTitle: { color: colors.text },
    headerSubtitle: { color: colors.textSecondary },
    
    // Action colors
    actionNormal: { color: colors.primary },
    actionPressed: { backgroundColor: colors.backgroundSecondary },
    actionDisabled: { color: colors.textTertiary },
    backButtonText: { color: colors.primary },
    
    // Tab bar colors
    tabBarBackground: { backgroundColor: colors.surface },
    tabBarBorder: { borderTopColor: colors.border },
    tabActive: { color: colors.primary },
    tabInactive: { color: colors.textSecondary },
    tabBadge: { backgroundColor: colors.error },
    
    // Menu colors
    menuBackground: { backgroundColor: colors.surface },
    menuBorder: { borderColor: colors.border },
    menuItem: { color: colors.text },
    menuItemActive: { 
      backgroundColor: colors.backgroundSecondary,
      color: colors.primary,
    },
    menuItemHover: { backgroundColor: colors.backgroundSecondary },
    menuItemDanger: { color: colors.error },
    menuDivider: { backgroundColor: colors.border },
    menuSectionTitle: { color: colors.textSecondary },
    
    // FAB colors
    fabPrimary: { backgroundColor: colors.primary },
    fabSecondary: { backgroundColor: colors.surface },
    fabText: { color: palette.white },
    fabIcon: { color: palette.white },
    
    // Search colors
    searchBackground: { backgroundColor: colors.surface },
    searchBorder: { borderColor: colors.border },
    searchBorderFocused: { borderColor: colors.primary },
    searchText: { color: colors.text },
    searchPlaceholder: { color: colors.textSecondary },
    searchIcon: { color: colors.textSecondary },
    searchSuggestionBg: { backgroundColor: colors.surface },
    searchSuggestionBorder: { borderBottomColor: colors.border },
    searchSuggestionText: { color: colors.text },
    
    // Breadcrumb colors
    breadcrumbBackground: { backgroundColor: colors.backgroundSecondary },
    breadcrumbBorder: { borderBottomColor: colors.border },
    breadcrumbText: { color: colors.textSecondary },
    breadcrumbActive: { color: colors.text },
    breadcrumbSeparator: { color: colors.textTertiary },
    
    // Progress colors
    progressBackground: { backgroundColor: colors.border },
    progressFill: { backgroundColor: colors.primary },
    stepInactive: { 
      backgroundColor: colors.surface,
      borderColor: colors.border,
      color: colors.textSecondary,
    },
    stepActive: { 
      backgroundColor: colors.primary,
      color: palette.white,
    },
    stepCompleted: { 
      backgroundColor: colors.success,
      color: palette.white,
    },
    stepConnector: { backgroundColor: colors.border },
    stepLabel: { color: colors.textSecondary },
  };
};

// Default navigation styles (light theme)
export const navigationStyles = StyleSheet.create({
  // Base styles
  ...headerStyles,
  ...actionStyles,
  ...tabBarStyles,
  ...breadcrumbStyles,
  ...menuStyles,
  ...fabStyles,
  ...searchStyles,
  ...progressStyles,
  
  // Light theme colors
  ...createLightNavigationStyles(),
  
  // Animation styles
  slideIn: {
    transform: [{ translateX: 0 }],
  },
  
  slideOut: {
    transform: [{ translateX: 300 }],
  },
  
  fadeIn: {
    opacity: 1,
  },
  
  fadeOut: {
    opacity: 0,
  },
});

// Theme-aware navigation styles
export const getNavigationStyles = (isDark = false) => {
  const themeColors = isDark ? createDarkNavigationStyles() : createLightNavigationStyles();
  const themeShadows = isDark ? darkShadows : shadows;
  
  // Update shadow-dependent styles for theme
  const themedStyles = {
    ...navigationStyles,
    ...themeColors,
    
    // Update shadows
    elevated: {
      ...navigationStyles.elevated,
      ...themeShadows.md,
    },
    
    fabBase: {
      ...navigationStyles.base,
      ...themeShadows.lg,
    },
    
    fabSmall: {
      ...navigationStyles.small,
      ...themeShadows.md,
    },
    
    fabLarge: {
      ...navigationStyles.large,
      ...themeShadows.xl,
    },
    
    menuContainer: {
      ...navigationStyles.container,
      ...themeShadows.lg,
    },
    
    searchSuggestions: {
      ...navigationStyles.suggestions,
      ...themeShadows.lg,
    },
  };
  
  return themedStyles;
};

// Utility functions for navigation styling
export const createHeaderStyle = (variant = 'standard', elevated = false, isDark = false) => {
  const styles = getNavigationStyles(isDark);
  
  const baseStyle = styles.base;
  const variantStyle = styles[variant];
  const elevationStyle = elevated ? styles.elevated : { borderBottomColor: styles.headerBorder.borderBottomColor };
  const backgroundStyle = styles.headerBackground;
  
  return [baseStyle, variantStyle, elevationStyle, backgroundStyle];
};

export const createTabBarStyle = (variant = 'standard', floating = false, isDark = false) => {
  const styles = getNavigationStyles(isDark);
  
  const baseStyle = styles.base;
  const variantStyle = styles[variant];
  const floatingStyle = floating ? styles.floating : {};
  const backgroundStyle = styles.tabBarBackground;
  const borderStyle = floating ? {} : styles.tabBarBorder;
  
  return [baseStyle, variantStyle, floatingStyle, backgroundStyle, borderStyle];
};

export const createFABStyle = (size = 'base', position = 'bottomRight', withTabBar = false, isDark = false) => {
  const styles = getNavigationStyles(isDark);
  
  const baseStyle = styles.fabBase;
  const sizeStyle = styles[size === 'base' ? 'base' : size];
  const positionStyle = styles[position];
  const offsetStyle = withTabBar ? styles.withTabBar : {};
  const colorStyle = styles.fabPrimary;
  
  return [baseStyle, sizeStyle, positionStyle, offsetStyle, colorStyle];
};

// Navigation preset combinations for common use cases
export const navigationPresets = {
  // Standard app header
  appHeader: (isDark = false) => createHeaderStyle('standard', false, isDark),
  
  // Modal header
  modalHeader: (isDark = false) => createHeaderStyle('modal', false, isDark),
  
  // Search header
  searchHeader: (isDark = false) => createHeaderStyle('search', false, isDark),
  
  // Elevated header (for scrolled content)
  elevatedHeader: (isDark = false) => createHeaderStyle('standard', true, isDark),
  
  // Bottom tab bar
  bottomTabs: (isDark = false) => createTabBarStyle('standard', false, isDark),
  
  // Floating tab bar
  floatingTabs: (isDark = false) => createTabBarStyle('standard', true, isDark),
  
  // Primary FAB
  primaryFAB: (isDark = false) => createFABStyle('base', 'bottomRight', true, isDark),
  
  // Small FAB
  smallFAB: (isDark = false) => createFABStyle('small', 'bottomRight', true, isDark),
  
  // Floating header (overlay)
  floatingHeader: (isDark = false) => {
    const styles = getNavigationStyles(isDark);
    return [styles.floating, styles.headerBackgroundTransparent];
  },
};

// Export individual style objects for direct import
export const lightNavigationStyles = createLightNavigationStyles();
export const darkNavigationStyles = createDarkNavigationStyles();

// Navigation constants for external use
export { navigationConstants };

// Helper functions for navigation calculations
export const getHeaderHeight = (variant = 'standard') => {
  switch (variant) {
    case 'large': return navigationConstants.headerHeightLarge;
    case 'compact': return 48;
    default: return navigationConstants.headerHeight;
  }
};

export const getTabBarHeight = (variant = 'standard') => {
  switch (variant) {
    case 'compact': return navigationConstants.tabBarHeightCompact;
    default: return navigationConstants.tabBarHeight;
  }
};

export const getSafeAreaInsets = () => ({
  top: navigationConstants.statusBarHeight,
  bottom: navigationConstants.tabBarHeight,
  left: 0,
  right: 0,
});

// Animation helpers
export const navigationAnimations = {
  slideRight: {
    transform: [{ translateX: 300 }],
    opacity: 0,
  },
  slideLeft: {
    transform: [{ translateX: -300 }],
    opacity: 0,
  },
  slideUp: {
    transform: [{ translateY: 300 }],
    opacity: 0,
  },
  slideDown: {
    transform: [{ translateY: -300 }],
    opacity: 0,
  },
  fade: {
    opacity: 0,
  },
  scale: {
    transform: [{ scale: 0.9 }],
    opacity: 0,
  },
};

// 12,634 characters