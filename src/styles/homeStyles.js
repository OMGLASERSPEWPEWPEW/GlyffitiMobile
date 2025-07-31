// src/styles/homeStyles.js
// Path: src/styles/homeStyles.js

/**
 * Home screen styles - MIGRATED to the new token-based design system.
 * -------------------------------------------------------------------
 * Goals:
 *  - Self-contained: imports ONLY tokens. No ThemeContext, no component/layout factories.
 *  - Backward-compatible style keys used by HomeScreen.js.
 *  - No RN-unsupported props (e.g., avoid `gap` for older RN).
 *  - All magic numbers replaced with spacing/typography/border tokens.
 *
 * If you later want theme-aware variants, expose `getHomeStyles(isDark?: boolean)`
 * that only switches between token sets (e.g., light/dark) without importing
 * component style factories or hooks.
 */

import { StyleSheet, Dimensions } from 'react-native';

// IMPORTANT: import ONLY tokens here to avoid pulling in ThemeContext or sub-style factories.
import {
  colors,        // current theme colors object exposed by your tokens
  spacing,       // 4px scale
  typography,    // font sizes, weights, line-heights, families
  borderRadius,  // radius scale (e.g., sm/md/lg)
  borderWidth,   // hairline/thin/...
  shadows        // platform-friendly shadow presets
} from './tokens';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Helper: two-up button width using current screen width and tokenized paddings.
 * We avoid `gap` (not supported on older RN) and rely on `justifyContent: 'space-between'`
 * + fixed widths, which creates a consistent gutter.
 */
const twoUpWidth = () => {
  const horizontalPagePadding = spacing.medium * 2; // left + right padding in section
  const interItemGutter = spacing.small;            // target horizontal gap
  return (screenWidth - horizontalPagePadding - interItemGutter) / 2;
};

export const homeStyles = StyleSheet.create({
  // ----------------------------------
  // Screen container
  // ----------------------------------
  container: {
    flex: 1,
    backgroundColor: colors.background, // token
  },

  scrollContainer: {
    flexGrow: 1,
    paddingBottom: spacing.large,
  },

  // ----------------------------------
  // Header
  // ----------------------------------
  header: {
    paddingHorizontal: spacing.medium,
    paddingTop: spacing.xlarge,
    paddingBottom: spacing.medium,
    alignItems: 'center',
    // A subtle visual division helps hierarchy without hard-coding hex
    borderBottomWidth: borderWidth.hairline,
    borderBottomColor: colors.border,
    marginBottom: spacing.large,
  },

  appTitle: {
    fontSize: typography.fontSize.heading,          // e.g., 28
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,         // 700
    textAlign: 'center',
    marginBottom: spacing.small,
    color: colors.text,                             // primary text token
    // Keep letterSpacing subtle; tokens may not include it
    // (safe to keep as a small numeric tweak)
    letterSpacing: -0.5,
  },

  tagline: {
    fontSize: typography.fontSize.medium,           // ~14
    fontFamily: typography.fontFamily,
    textAlign: 'center',
    color: colors.textSecondary,
    opacity: 0.9,
    lineHeight: typography.lineHeight.relaxed,
  },

  // ----------------------------------
  // Sections
  // ----------------------------------
  mainSection: {
    paddingHorizontal: spacing.medium,
    marginBottom: spacing.xlarge,
  },

  secondarySection: {
    paddingHorizontal: spacing.medium,
    marginBottom: spacing.xlarge,
  },

  sectionTitle: {
    fontSize: typography.fontSize.large,            // ~18
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.medium,
    color: colors.text,
    letterSpacing: -0.3,
  },

  // ----------------------------------
  // Primary CTA (inside your Card)
  // ----------------------------------
  primaryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.medium,
  },

  primaryButtonIcon: {
    // If you’re using an actual icon component, place size there.
    // This is for emoji/text icons.
    fontSize: 32,
    lineHeight: 36,
    marginRight: spacing.medium,
  },

  primaryButtonTextContainer: {
    flex: 1,
  },

  primaryButtonTitle: {
    fontSize: typography.fontSize.large,            // ~18
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,
    color: colors.onPrimary ?? '#FFFFFF',           // text on primary bg; fallback to white
    marginBottom: spacing.extraSmall,
    letterSpacing: -0.2,
  },

  primaryButtonSubtitle: {
    fontSize: typography.fontSize.medium,           // ~14
    fontFamily: typography.fontFamily,
    color: colors.onPrimary ?? '#FFFFFF',
    opacity: 0.95,
    lineHeight: typography.lineHeight.normal,
  },

  // ----------------------------------
  // Secondary grid (two-up cards)
  // ----------------------------------
  secondaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    // No 'gap' to keep RN-compat; bottom spacing handled on tiles
  },

  secondaryButton: {
    width: twoUpWidth(),                 // responsive width
    minHeight: 90,
    borderRadius: borderRadius.lg,       // consistent token
    marginBottom: spacing.small,         // vertical gap between rows
    // Shadow is generally set on the Card component; include a light preset if needed:
    // ...(shadows.low || {}),
  },

  secondaryButtonContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.medium,
  },

  secondaryButtonIcon: {
    fontSize: 24,
    lineHeight: 28,
    marginBottom: spacing.small,
    color: colors.icon ?? colors.text,   // optional icon token
  },

  secondaryButtonText: {
    fontSize: typography.fontSize.medium,      // ~14
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.medium,  // 500
    textAlign: 'center',
    color: colors.text,
    lineHeight: typography.lineHeight.tight,
  },

  comingSoon: {
    fontSize: typography.fontSize.small, // ~12
    fontFamily: typography.fontFamily,
    fontStyle: 'italic',
    color: colors.textTertiary,
    opacity: 0.8,
    marginTop: spacing.extraSmall,
    textAlign: 'center',
  },

  // ----------------------------------
  // Getting Started / Info area
  // ----------------------------------
  infoSection: {
    paddingHorizontal: spacing.medium,
    marginBottom: spacing.xlarge,
  },

  infoCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  infoIcon: {
    fontSize: 24,
    lineHeight: 28,
    marginRight: spacing.medium,
    color: colors.primary,
  },

  infoText: {
    flex: 1,
    fontSize: typography.fontSize.medium,
    fontFamily: typography.fontFamily,
    lineHeight: typography.lineHeight.relaxed,
    color: colors.textSecondary,
  },

  // ----------------------------------
  // Footer
  // ----------------------------------
  footer: {
    paddingHorizontal: spacing.medium,
    paddingTop: spacing.large,
    paddingBottom: spacing.xlarge,
    alignItems: 'center',
    borderTopWidth: borderWidth.hairline,
    borderTopColor: colors.border,
    marginTop: spacing.large,
  },

  footerText: {
    fontSize: typography.fontSize.small,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
    color: colors.textTertiary,
    opacity: 0.9,
    letterSpacing: 0.4,
  },

  // ----------------------------------
  // Optional: shadow presets if you want to consume them from here
  // (Your Card component already handles shadows; keep these for convenience.)
  // ----------------------------------
  shadowLow: {
    ...(shadows?.low || {}),
  },
  shadowMedium: {
    ...(shadows?.medium || {}),
  },
});
