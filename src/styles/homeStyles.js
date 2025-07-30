// src/styles/homeStyles.js
// Path: src/styles/homeStyles.js
import { StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, typography } from './tokens';
import { getScreenStyles } from './layouts/screens';
import { getCardStyles } from './components/cards';

const { width: screenWidth } = Dimensions.get('window');

export const homeStyles = StyleSheet.create({
  // Container styles - leverage your screen layout system
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: spacing.large,
  },
  
  // Header section
  header: {
    paddingHorizontal: spacing.medium,
    paddingTop: spacing.large,
    paddingBottom: spacing.medium,
    alignItems: 'center',
  },
  
  appTitle: {
    fontSize: typography.fontSize.heading,
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.small,
  },
  
  tagline: {
    fontSize: typography.fontSize.medium,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
    opacity: 0.8,
  },
  
  // Main sections
  mainSection: {
    paddingHorizontal: spacing.medium,
    marginBottom: spacing.large,
  },
  
  secondarySection: {
    paddingHorizontal: spacing.medium,
    marginBottom: spacing.large,
  },
  
  sectionTitle: {
    fontSize: typography.fontSize.large,
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.medium,
  },
  
  // Primary button content (for the main Publishing card)
  primaryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  primaryButtonIcon: {
    fontSize: 32,
    marginRight: spacing.medium,
  },
  
  primaryButtonTextContainer: {
    flex: 1,
  },
  
  primaryButtonTitle: {
    fontSize: typography.fontSize.large,
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,
    color: '#ffffff',
    marginBottom: spacing.extraSmall,
  },
  
  primaryButtonSubtitle: {
    fontSize: typography.fontSize.medium,
    fontFamily: typography.fontFamily,
    color: '#ffffff',
    opacity: 0.9,
    lineHeight: typography.lineHeight.normal,
  },
  
  // Secondary buttons grid
  secondaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.small,
  },
  
  secondaryButton: {
    width: (screenWidth - (spacing.medium * 2) - spacing.small) / 2,
    minHeight: 80,
  },
  
  secondaryButtonContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  secondaryButtonIcon: {
    fontSize: 24,
    marginBottom: spacing.small,
  },
  
  secondaryButtonText: {
    fontSize: typography.fontSize.medium,
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },
  
  // Additional features section
  featuresSection: {
    paddingHorizontal: spacing.medium,
  },
  
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  
  featureIcon: {
    fontSize: 20,
    marginRight: spacing.medium,
    width: 24,
    textAlign: 'center',
  },
  
  featureTextContainer: {
    flex: 1,
  },
  
  featureTitle: {
    fontSize: typography.fontSize.medium,
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.medium,
    marginBottom: 2,
  },
  
  featureDescription: {
    fontSize: typography.fontSize.small,
    fontFamily: typography.fontFamily,
    opacity: 0.7,
    lineHeight: typography.lineHeight.normal,
  },
  
  // Status/info sections
  statusSection: {
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.medium,
    backgroundColor: colors.backgroundSecondary,
    marginVertical: spacing.medium,
    borderRadius: 8,
    marginHorizontal: spacing.medium,
  },
  
  statusText: {
    fontSize: typography.fontSize.small,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
    opacity: 0.8,
  },
});

// Helper functions to get theme-aware versions
export const getHomeStyles = (isDark = false) => {
  // You can extend this to use your theme system
  const screenStyles = getScreenStyles(isDark);
  const cardStyles = getCardStyles(isDark);
  
  return {
    ...homeStyles,
    // Override colors for dark theme
    container: {
      ...homeStyles.container,
      backgroundColor: isDark ? colors.backgroundDark : colors.background,
    },
    // Add more theme-aware overrides as needed
  };
};

// Character count: 4,342