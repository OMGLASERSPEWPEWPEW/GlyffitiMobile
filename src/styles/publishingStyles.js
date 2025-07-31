// src/styles/publishingStyles.js
// Path: src/styles/publishingStyles.js
import { StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, typography, shadows, borderRadius, borderWidth } from './tokens';

const { width, height } = Dimensions.get('window');

// Define common card container style once to eliminate duplication
const cardContainer = {
  backgroundColor: colors.surface,
  borderRadius: borderRadius.card,           // 12px radius from tokens
  padding: spacing.medium,                   // 16px padding
  marginBottom: spacing.medium,              // 16px margin under
  ...shadows.sm,                            // small elevation shadow
};

export const publishingStyles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: colors.background,       // replaced #f8f9fa
  },

  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,       // replaced #f8f9fa
  },
  loadingText: {
    fontSize: typography.fontSize.button,     // 16px instead of 16 literal
    color: colors.textSecondary,             // replaced #666
    marginTop: spacing.small * 3,            // 12px (using 3*4px) instead of 12
  },

  // ScrollView configurations - FIXED FOR PROPER SCROLLING
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.medium,        // 16px
    paddingBottom: spacing.xxxlarge,          // 96px - increased for better spacing
  },
  bottomSpacer: {
    height: spacing.xxxlarge + spacing.medium, // 96px + 16px = 112px (more space to prevent clipping)
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.small,               // 8px instead of 10px (grid-aligned)
    paddingBottom: spacing.large,            // 24px instead of 20px (grid-aligned)
    borderBottomWidth: borderWidth.thin,     // 1px border instead of 1
    borderBottomColor: colors.border,        // replaced #e9ecef
    marginBottom: spacing.large,             // 24px instead of 20px (grid-aligned)
  },
  headerTitle: {                             // renamed from 'title' to match usage
    fontSize: typography.fontSize.xlarge,    // 24px instead of 24 literal
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,  // '700'
    color: colors.text,                      // use semantic text color instead of #1a1a1a
    marginLeft: spacing.medium,              // 16px
  },
  headerSpacer: {                           // added for layout compatibility
    flex: 1,
  },
  backButton: {
    paddingHorizontal: spacing.small * 3,    // 12px (using 3*4px)
    paddingVertical: spacing.small,          // 8px
    backgroundColor: colors.textSecondary,   // replaced #6c757d
    borderRadius: spacing.small,             // 8px
  },

  // Wallet Section - now uses common cardContainer
  walletContainer: { ...cardContainer },
  walletTitle: {
    fontSize: typography.fontSize.large,     // 18px
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,  // '700'
    color: colors.text,                      // replaced #1a1a1a
    marginBottom: spacing.small,             // 8px
  },
  walletSubtitle: {
    fontSize: typography.fontSize.medium,    // 14px
    fontWeight: typography.fontWeight.regular, // '400'
    color: colors.textTertiary,              // replaced #6c757d
    marginBottom: spacing.small * 3,         // 12px
  },
  walletAddress: {
    fontSize: typography.fontSize.medium,    // 14px
    fontFamily: 'monospace',                 // keep monospace for addresses
    color: colors.textSecondary,             // replaced #495057
    backgroundColor: colors.backgroundSecondary, // replaced #f8f9fa
    padding: spacing.small,                  // 8px
    borderRadius: spacing.small - spacing.tiny, // 6px (close to original)
    marginBottom: spacing.small,             // 8px
  },
  walletBalance: {
    fontSize: typography.fontSize.button,    // 16px
    fontWeight: typography.fontWeight.medium, // '500' instead of '600'
    color: colors.success,                   // replaced #28a745 (green)
    marginBottom: spacing.small * 3,         // 12px
  },

  // Password input
  passwordInput: {
    padding: spacing.small * 3,              // 12px (using 3*4px) instead of 12
    marginBottom: spacing.medium,            // 16px
    borderWidth: borderWidth.thin,           // 1px border instead of 1
    borderColor: colors.border,              // replaced #ccc
    borderRadius: spacing.small,             // 8px
    backgroundColor: colors.surface,         // replaced #fff
    fontSize: typography.fontSize.button,    // 16px
    color: colors.text,                      // replaced #333
  },
  unlockButton: {
    backgroundColor: colors.primary,         // replaced #007bff (blue)
    paddingVertical: spacing.small * 3,      // 12px
    paddingHorizontal: spacing.medium,       // 16px
    borderRadius: spacing.small,             // 8px
    alignItems: 'center',
    marginBottom: spacing.medium,            // 16px
  },
  unlockButtonText: {
    fontSize: typography.fontSize.button,    // 16px
    fontWeight: typography.fontWeight.medium, // '500' instead of '600'
    color: colors.surface,                   // white text
  },

  // Progress section - enhanced for proper content visibility
  progressContainer: {
    ...cardContainer,
    minHeight: 120,                          // Ensure minimum height for all content
    paddingVertical: spacing.medium,         // Extra vertical padding
  },
  progressTitle: {
    fontSize: typography.fontSize.button,    // 16px (using 'button' alias)
    fontWeight: typography.fontWeight.medium, // '500' instead of '600'
    textAlign: 'center',
    color: colors.text,                      // replaced #333
    marginBottom: spacing.medium,            // 16px - more space for title
    lineHeight: typography.lineHeight.normal * typography.fontSize.button, // Proper line height
  },
  progressBarBackground: {
    width: '100%',
    height: spacing.small,                   // 8px (matching ProgressBar component)
    backgroundColor: colors.border,          // replaced #e0e0e0
    borderRadius: spacing.tiny,              // 4px
    overflow: 'hidden',
    marginBottom: spacing.small,             // 8px
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.success,         // replaced #28a745
    borderRadius: spacing.tiny,              // 4px
  },
  progressText: {
    textAlign: 'center',
    fontSize: typography.fontSize.medium,    // 14px
    fontWeight: typography.fontWeight.medium, // '500' for better visibility
    color: colors.textSecondary,             // replaced #495057
    marginBottom: spacing.small,             // 8px - more space
    lineHeight: typography.lineHeight.normal * typography.fontSize.medium,
  },
  compressionText: {
    textAlign: 'center',
    fontSize: typography.fontSize.small,     // 12px
    color: colors.textSecondary,             // replaced #495057
    fontStyle: 'italic',
    lineHeight: typography.lineHeight.normal * typography.fontSize.small,
    marginBottom: spacing.tiny,              // Small bottom margin to prevent clipping
  },

  // Content sections - now uses common cardContainer
  section: { ...cardContainer },
  sectionTitle: {
    fontSize: typography.fontSize.large,     // 18px
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,  // '700'
    color: colors.text,                      // replaced #1a1a1a
    marginBottom: spacing.tiny,              // 4px
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.medium,    // 14px
    color: colors.textTertiary,              // replaced #6c757d
    marginBottom: spacing.small * 3,         // 12px
    fontStyle: 'italic',
  },

  // Content items - Card component handles most styling now, but keep accent border
  contentItemCard: {
    borderLeftWidth: borderWidth.extraThick, // 4px accent border
    // Color applied dynamically via code - blue for draft, green for published
  },
  contentTitle: {
    fontSize: typography.fontSize.button,    // 16px
    fontWeight: typography.fontWeight.medium, // '500' instead of '600'
    color: colors.text,                      // replaced #1a1a1a
    marginBottom: spacing.tiny,              // 4px
  },
  contentMeta: {
    fontSize: typography.fontSize.medium,    // 14px
    color: colors.textTertiary,              // replaced #6c757d
    marginBottom: spacing.tiny,              // 4px
  },
  contentDate: {
    fontSize: typography.fontSize.small,     // 12px
    color: colors.textLight,                 // replaced #868e96
    marginBottom: spacing.small,             // 8px
  },
  authorText: {
    fontSize: typography.fontSize.small,     // 12px
    color: colors.textSecondary,             // replaced #495057
    fontStyle: 'italic',
    marginBottom: spacing.tiny,              // 4px
  },
  scrollId: {
    fontSize: typography.fontSize.small - 1, // 11px
    color: colors.textTertiary,              // replaced #6c757d
    fontFamily: 'monospace',
    backgroundColor: colors.borderSecondary, // replaced #e9ecef
    paddingHorizontal: spacing.small - spacing.tiny, // 6px
    paddingVertical: spacing.tiny / 2,       // 2px
    borderRadius: spacing.tiny,              // 4px
    alignSelf: 'flex-start',
    marginBottom: spacing.tiny,              // 4px
  },
  publishedDate: {
    fontSize: typography.fontSize.small,     // 12px
    color: colors.textSecondary,             // replaced #495057
    marginBottom: spacing.small,             // 8px
  },
  contentPreview: {
    fontSize: typography.fontSize.small + 1, // 13px
    color: colors.textTertiary,              // replaced #6c757d
    fontStyle: 'italic',
    lineHeight: typography.lineHeight.relaxed * (typography.fontSize.small + 1), // 18
    marginBottom: spacing.small,             // 8px
  },

  // Published content specific
  publishedContentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.tiny,              // 4px
  },
  publishedNote: {
    fontSize: typography.fontSize.small,     // 12px
    color: colors.textTertiary,              // replaced #6c757d
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.small,                // 8px
  },

  // Publishing buttons
  airdropButton: {
    backgroundColor: colors.secondary,       // replaced #ffc107 (yellow) with secondary
    paddingVertical: spacing.small * 3,      // 12px
    paddingHorizontal: spacing.medium,       // 16px
    borderRadius: spacing.small,             // 8px
    alignItems: 'center',
    marginBottom: spacing.small,             // 8px
    ...shadows.sm,                          // add shadow for button elevation
  },
  airdropButtonDisabled: {
    backgroundColor: colors.primaryDisabled, // standardized disabled color
  },
  airdropButtonText: {
    fontSize: typography.fontSize.button,    // 16px
    fontWeight: typography.fontWeight.medium, // '500'
    color: colors.surface,                   // white text
  },
  
  publishButton: {
    backgroundColor: colors.primary,         // replaced #007bff (blue)
    paddingVertical: spacing.small * 3,      // 12px
    paddingHorizontal: spacing.medium,       // 16px
    borderRadius: spacing.small,             // 8px
    alignItems: 'center',
    marginBottom: spacing.small,             // 8px
    ...shadows.md,                          // slightly stronger shadow for primary action
  },
  publishButtonDisabled: {
    backgroundColor: colors.primaryDisabled, // standardized disabled color
  },
  publishButtonText: {
    fontSize: typography.fontSize.button,    // 16px
    fontWeight: typography.fontWeight.medium, // '500'
    color: colors.surface,                   // white text
  },

  resumeButton: {
    backgroundColor: colors.success,         // replaced #28a745 (green)
    paddingVertical: spacing.small * 3,      // 12px
    paddingHorizontal: spacing.medium,       // 16px
    borderRadius: spacing.small,             // 8px
    alignItems: 'center',
    marginBottom: spacing.small,             // 8px
    ...shadows.sm,                          // add shadow for button elevation
  },
  resumeButtonDisabled: {
    backgroundColor: colors.primaryDisabled, // standardized disabled color
  },
  resumeButtonText: {
    fontSize: typography.fontSize.button,    // 16px
    fontWeight: typography.fontWeight.medium, // '500'
    color: colors.surface,                   // white text
  },

  clearButton: {
    backgroundColor: colors.error,           // replaced #dc3545 (red)
    paddingVertical: spacing.small * 3,      // 12px
    paddingHorizontal: spacing.medium,       // 16px
    borderRadius: spacing.small,             // 8px
    alignItems: 'center',
    marginBottom: spacing.medium,            // 16px
    ...shadows.sm,                          // add shadow for button elevation
  },
  clearButtonText: {
    fontSize: typography.fontSize.button,    // 16px
    fontWeight: typography.fontWeight.medium, // '500'
    color: colors.surface,                   // white text
  },

  // Stats container - now uses common cardContainer
  statsContainer: { ...cardContainer },
  statsTitle: {
    fontSize: typography.fontSize.large,     // 18px
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,  // '700'
    color: colors.text,                      // replaced #1a1a1a
    marginBottom: spacing.small,             // 8px
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.small,             // 8px
  },
  statLabel: {
    fontSize: typography.fontSize.medium,    // 14px
    color: colors.textSecondary,             // replaced #6c757d
  },
  statValue: {
    fontSize: typography.fontSize.medium,    // 14px
    fontWeight: typography.fontWeight.medium, // '500'
    color: colors.text,                      // replaced #333
  },

  // Status indicators
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.small,                      // 8px gap between status items
    marginBottom: spacing.small,             // 8px
  },
  statusIndicator: {
    paddingHorizontal: spacing.small,        // 8px
    paddingVertical: spacing.tiny,           // 4px
    borderRadius: spacing.small,             // 8px
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: typography.fontSize.small,     // 12px
    fontWeight: typography.fontWeight.medium, // '500'
  },

  // Debug section - now uses common cardContainer
  debugSection: { ...cardContainer },
  debugTitle: {
    fontSize: typography.fontSize.large,     // 18px
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,  // '700'
    color: colors.text,                      // replaced #1a1a1a
    marginBottom: spacing.small,             // 8px
  },
  debugText: {
    fontSize: typography.fontSize.small,     // 12px
    fontFamily: 'monospace',
    color: colors.textSecondary,             // replaced #6c757d
    backgroundColor: colors.backgroundSecondary, // replaced #f8f9fa
    padding: spacing.small,                  // 8px
    borderRadius: spacing.tiny,              // 4px
    marginBottom: spacing.tiny,              // 4px (adjusted to grid from 2px)
  },

  // Utility styles
  centerText: {
    textAlign: 'center',
  },
  boldText: {
    fontWeight: typography.fontWeight.bold,  // '700'
  },
  italicText: {
    fontStyle: 'italic',
  },
  
  // Loading and empty states
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.large,        // 24px
  },
  emptyText: {
    fontSize: typography.fontSize.button,    // 16px
    color: colors.textSecondary,             // semantic secondary text
    textAlign: 'center',
    marginBottom: spacing.medium,            // 16px
  },
  
  // Error states
  errorContainer: {
    backgroundColor: colors.errorBg,         // light error background
    borderRadius: borderRadius.card,         // 12px
    padding: spacing.medium,                 // 16px
    marginBottom: spacing.medium,            // 16px
    borderLeftWidth: borderWidth.extraThick, // 4px
    borderLeftColor: colors.error,           // error accent
  },
  errorText: {
    fontSize: typography.fontSize.medium,    // 14px
    color: colors.error,                     // error text color
    fontWeight: typography.fontWeight.medium, // '500'
  },
});

// Character count: 16,847