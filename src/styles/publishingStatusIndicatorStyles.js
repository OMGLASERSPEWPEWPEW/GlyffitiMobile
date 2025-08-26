// src/styles/publishingStatusIndicatorStyles.js
// Path: src/styles/publishingStatusIndicatorStyles.js

import { StyleSheet } from 'react-native';
import { getColors, spacing, typography, borderRadius, shadows } from './tokens';

/**
 * Publishing Status Indicator Styles
 * 
 * Theme-aware styles for the Blueprint & Fill publishing visualization component.
 * Handles both small story grid views and large story progress bar views.
 * 
 * Features:
 * - 3-phase checklist styling
 * - Scalable glyph grid (for <50 chunks)  
 * - Large story progress bar (for >=50 chunks)
 * - Smooth animation support
 * - Full theme compatibility
 * 
 * Usage:
 * const styles = publishingStatusIndicatorStyles(isDarkMode);
 */
export const publishingStatusIndicatorStyles = (isDarkMode = false) => {
  const colors = getColors(isDarkMode);
  
  return StyleSheet.create({
    // Main container
    container: {
      marginBottom: spacing.medium,
      marginHorizontal: 0,
    },

    // Phase checklist container
    checklistContainer: {
      marginBottom: spacing.large,
    },

    // Individual phase row
    phaseRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: spacing.medium,
    },

    // Icon container with consistent sizing
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.medium,
      backgroundColor: colors.backgroundSecondary,
    },

    // Phase label container (flex to fill remaining space)
    phaseLabelContainer: {
      flex: 1,
      paddingTop: spacing.extraSmall, // Align with icon center
    },

    // Base phase label styling
    phaseLabel: {
      fontSize: typography.fontSize.medium,
      fontFamily: typography.fontFamilyMedium || typography.fontFamily,
      fontWeight: typography.fontWeight.medium || '500',
      lineHeight: typography.lineHeight.normal * typography.fontSize.medium,
      marginBottom: spacing.extraSmall,
    },

    // Phase label variants based on status
    phaseLabelComplete: {
      color: colors.success,
      fontWeight: typography.fontWeight.semibold || '600',
    },

    phaseLabelActive: {
      color: colors.primary,
      fontWeight: typography.fontWeight.semibold || '600',
    },

    phaseLabelPending: {
      color: colors.textSecondary,
    },

    // Phase description text (shown for active phase)
    phaseDescription: {
      fontSize: typography.fontSize.small,
      fontFamily: typography.fontFamily,
      color: colors.textSecondary,
      lineHeight: typography.lineHeight.normal * typography.fontSize.small,
      fontStyle: 'italic',
    },

    // Content progress section
    contentProgressContainer: {
      marginTop: spacing.medium,
      paddingTop: spacing.medium,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },

    contentProgressTitle: {
      fontSize: typography.fontSize.medium,
      fontFamily: typography.fontFamilyMedium || typography.fontFamily,
      fontWeight: typography.fontWeight.medium || '500',
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.medium,
    },

    // Glyph grid container (for small stories)
    glyphGridContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },

    glyphGridContent: {
      alignItems: 'center',
      justifyContent: 'center',
    },

    glyphGridRow: {
      justifyContent: 'center',
    },

    // Individual glyph box in grid
    glyphBox: {
      width: 16,
      height: 16,
      borderRadius: borderRadius.small,
      backgroundColor: colors.border,
      margin: 2,
      borderWidth: 1,
      borderColor: colors.border,
    },

    // Completed glyph box (lit up)
    glyphBoxComplete: {
      backgroundColor: colors.success,
      borderColor: colors.success,
      // Add subtle glow effect for published glyphs
      shadowColor: colors.success,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 2,
    },

    // Large story progress bar container
    largeProgressBarContainer: {
      alignItems: 'center',
    },

    // Large story progress bar background
    largeProgressBarBackground: {
      width: '100%',
      height: 12,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: borderRadius.medium,
      overflow: 'hidden',
      marginBottom: spacing.medium,
      borderWidth: 1,
      borderColor: colors.border,
    },

    // Large story progress bar fill
    largeProgressBarFill: {
      height: '100%',
      backgroundColor: colors.success,
      borderRadius: borderRadius.medium,
      // Add subtle gradient effect using shadows
      shadowColor: colors.success,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.2,
      shadowRadius: 1,
      elevation: 1,
    },

    // Large story progress bar text
    largeProgressBarText: {
      fontSize: typography.fontSize.small,
      fontFamily: typography.fontFamilyMedium || typography.fontFamily,
      fontWeight: typography.fontWeight.medium || '500',
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: typography.lineHeight.normal * typography.fontSize.small,
    },

    // Debug container (development only)
    debugContainer: {
      marginTop: spacing.large,
      paddingTop: spacing.medium,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      opacity: 0.7,
    },

    debugText: {
      fontSize: typography.fontSize.extraSmall || 10,
      fontFamily: 'monospace',
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 14,
    },

    // Animation states (for LayoutAnimation support)
    animationContainer: {
      // Ensures smooth transitions during state changes
    },

    // Status-specific styling overrides
    statusSuccess: {
      borderLeftWidth: 4,
      borderLeftColor: colors.success,
    },

    statusActive: {
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },

    statusPending: {
      borderLeftWidth: 4,
      borderLeftColor: colors.border,
    },

    // Responsive adjustments for different screen sizes
    compact: {
      // Smaller spacing for compact screens
      marginBottom: spacing.small,
    },

    expanded: {
      // Extra spacing for larger screens
      marginBottom: spacing.large,
    },

    // Accessibility enhancements
    accessibilityFocus: {
      borderWidth: 2,
      borderColor: colors.primary,
      borderRadius: borderRadius.medium,
    },

    // High contrast mode support
    highContrast: {
      borderWidth: 2,
      borderColor: colors.text,
    },
  });
};

// Default export for easy importing
export default publishingStatusIndicatorStyles;

// Character count: 5,847