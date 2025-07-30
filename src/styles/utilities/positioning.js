// src/styles/utilities/positioning.js
// Path: src/styles/utilities/positioning.js

import { StyleSheet, Dimensions } from 'react-native';
import { 
  lightColors, 
  darkColors, 
  spacing, 
  shadows,
  darkShadows,
  borderRadius,
  getShadows 
} from '../tokens';

/**
 * Positioning utilities - comprehensive positioning system
 * Covers all positioning patterns for modern content platforms
 * Inspired by Design Research patterns and FAANG-level positioning usage
 * Optimized for stories → videos → music content progression
 * 
 * Usage:
 * - Import specific utilities: positioningStyles.absolute, positioningStyles.overlay
 * - Theme-aware: use getPositioningStyles(isDark) for proper styling
 * - Combine: [positioningStyles.absolute, positioningStyles.topRight, positioningStyles.zIndex100]
 */

// Get screen dimensions for positioning calculations
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Positioning constants for consistent behavior
const positioningConstants = {
  // Z-index hierarchy (inspired by Material Design)
  zIndex: {
    base: 0,
    background: -1,
    content: 1,
    elevated: 10,
    dropdown: 100,
    sticky: 200,
    overlay: 500,
    modal: 1000,
    popover: 1100,
    tooltip: 1200,
    toast: 1300,
    loading: 1400,
    maximum: 9999,
  },
  
  // Common positions as percentages
  positions: {
    center: 50,
    quarter: 25,
    threeQuarter: 75,
    oneThird: 33.333,
    twoThird: 66.666,
  },
  
  // Safe area considerations
  safeArea: {
    top: 44,          // iOS status bar
    bottom: 34,       // iOS home indicator
    sides: 0,         // No safe area on sides
  },
  
  // Performance thresholds
  performance: {
    maxZIndex: 1500,           // Maximum recommended z-index
    maxOverlays: 5,            // Maximum simultaneous overlays
    animationDuration: 300,    // Standard animation duration
  },
  
  // Accessibility considerations
  accessibility: {
    minTouchTarget: 44,        // Minimum touch target size
    maxModalWidth: '90%',      // Maximum modal width for readability
    optimalModalHeight: '80%', // Optimal modal height
  },
};

// ====================
// Core Positioning Properties
// ====================

// Basic position utilities
const basicPosition = {
  // Position types
  static: {
    position: 'static',
  },
  
  relative: {
    position: 'relative',
  },
  
  absolute: {
    position: 'absolute',
  },
  
  // Note: React Native doesn't support 'fixed' positioning
  // We simulate it with absolute positioning at the app root level
  fixed: {
    position: 'absolute',
    // Would be positioned relative to app root container
  },
  
  // Sticky positioning simulation
  sticky: {
    position: 'absolute',
    // Simulated sticky behavior through scroll events
  },
};

// Directional positioning utilities
const directionalPosition = {
  // Top positions
  top0: {
    top: 0,
  },
  
  topAuto: {
    top: 'auto',
  },
  
  topSafe: {
    top: positioningConstants.safeArea.top,
  },
  
  topSmall: {
    top: spacing.small,                    // 8px
  },
  
  topMedium: {
    top: spacing.medium,                   // 16px
  },
  
  topLarge: {
    top: spacing.large,                    // 24px
  },
  
  topCenter: {
    top: '50%',
    transform: [{ translateY: -50 }],
  },
  
  // Right positions
  right0: {
    right: 0,
  },
  
  rightAuto: {
    right: 'auto',
  },
  
  rightSmall: {
    right: spacing.small,                  // 8px
  },
  
  rightMedium: {
    right: spacing.medium,                 // 16px
  },
  
  rightLarge: {
    right: spacing.large,                  // 24px
  },
  
  rightCenter: {
    right: '50%',
    transform: [{ translateX: 50 }],
  },
  
  // Bottom positions
  bottom0: {
    bottom: 0,
  },
  
  bottomAuto: {
    bottom: 'auto',
  },
  
  bottomSafe: {
    bottom: positioningConstants.safeArea.bottom,
  },
  
  bottomSmall: {
    bottom: spacing.small,                 // 8px
  },
  
  bottomMedium: {
    bottom: spacing.medium,                // 16px
  },
  
  bottomLarge: {
    bottom: spacing.large,                 // 24px
  },
  
  bottomCenter: {
    bottom: '50%',
    transform: [{ translateY: 50 }],
  },
  
  // Left positions
  left0: {
    left: 0,
  },
  
  leftAuto: {
    left: 'auto',
  },
  
  leftSmall: {
    left: spacing.small,                   // 8px
  },
  
  leftMedium: {
    left: spacing.medium,                  // 16px
  },
  
  leftLarge: {
    left: spacing.large,                   // 24px
  },
  
  leftCenter: {
    left: '50%',
    transform: [{ translateX: -50 }],
  },
};

// Combined position utilities
const combinedPosition = {
  // Corner positions
  topLeft: {
    top: 0,
    left: 0,
  },
  
  topRight: {
    top: 0,
    right: 0,
  },
  
  bottomLeft: {
    bottom: 0,
    left: 0,
  },
  
  bottomRight: {
    bottom: 0,
    right: 0,
  },
  
  // Edge positions
  topFull: {
    top: 0,
    left: 0,
    right: 0,
  },
  
  rightFull: {
    top: 0,
    right: 0,
    bottom: 0,
  },
  
  bottomFull: {
    bottom: 0,
    left: 0,
    right: 0,
  },
  
  leftFull: {
    top: 0,
    left: 0,
    bottom: 0,
  },
  
  // Full coverage
  fullCoverage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  
  // Center positioning
  absoluteCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [
      { translateX: -50 },
      { translateY: -50 },
    ],
  },
  
  // Safe area positions
  safeTopLeft: {
    top: positioningConstants.safeArea.top,
    left: spacing.medium,                  // 16px
  },
  
  safeTopRight: {
    top: positioningConstants.safeArea.top,
    right: spacing.medium,                 // 16px
  },
  
  safeBottomLeft: {
    bottom: positioningConstants.safeArea.bottom,
    left: spacing.medium,                  // 16px
  },
  
  safeBottomRight: {
    bottom: positioningConstants.safeArea.bottom,
    right: spacing.medium,                 // 16px
  },
};

// Z-index utilities
const zIndexUtilities = {
  zIndexBase: {
    zIndex: positioningConstants.zIndex.base,
  },
  
  zIndexBackground: {
    zIndex: positioningConstants.zIndex.background,
  },
  
  zIndexContent: {
    zIndex: positioningConstants.zIndex.content,
  },
  
  zIndexElevated: {
    zIndex: positioningConstants.zIndex.elevated,
  },
  
  zIndexDropdown: {
    zIndex: positioningConstants.zIndex.dropdown,
  },
  
  zIndexSticky: {
    zIndex: positioningConstants.zIndex.sticky,
  },
  
  zIndexOverlay: {
    zIndex: positioningConstants.zIndex.overlay,
  },
  
  zIndexModal: {
    zIndex: positioningConstants.zIndex.modal,
  },
  
  zIndexPopover: {
    zIndex: positioningConstants.zIndex.popover,
  },
  
  zIndexTooltip: {
    zIndex: positioningConstants.zIndex.tooltip,
  },
  
  zIndexToast: {
    zIndex: positioningConstants.zIndex.toast,
  },
  
  zIndexLoading: {
    zIndex: positioningConstants.zIndex.loading,
  },
  
  zIndexMaximum: {
    zIndex: positioningConstants.zIndex.maximum,
  },
};

// ====================
// Design Research Inspired Positioning Patterns
// ====================

// News Feed positioning patterns (Julie Zhuo's Facebook work)
const newsFeedPositioningPatterns = {
  // Feed scroll position tracking
  feedScrollPosition: {
    position: 'relative',
    zIndex: positioningConstants.zIndex.content,
  },
  
  // Floating action button (for creating posts)
  feedFloatingAction: {
    position: 'absolute',
    bottom: spacing.large,                 // 24px
    right: spacing.medium,                 // 16px
    zIndex: positioningConstants.zIndex.elevated,
    ...shadows.lg,
  },
  
  // Feed item overlay (for interactions)
  feedItemOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: positioningConstants.zIndex.overlay,
    backgroundColor: lightColors.overlay,
  },
  
  // Engagement indicators positioning
  engagementIndicators: {
    position: 'absolute',
    bottom: spacing.small,                 // 8px
    left: spacing.medium,                  // 16px
    zIndex: positioningConstants.zIndex.content,
  },
  
  // Algorithm priority indicator
  priorityIndicator: {
    position: 'absolute',
    top: spacing.small,                    // 8px
    right: spacing.small,                  // 8px
    zIndex: positioningConstants.zIndex.elevated,
  },
  
  // Infinite scroll loading
  infiniteScrollLoading: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: positioningConstants.zIndex.content,
  },
  
  // News Feed stories bar
  storiesBar: {
    position: 'sticky',
    top: 0,
    zIndex: positioningConstants.zIndex.sticky,
    backgroundColor: lightColors.background,
  },
  
  // Sponsored content indicator
  sponsoredIndicator: {
    position: 'absolute',
    top: spacing.extraSmall,               // 8px
    right: spacing.medium,                 // 16px
    zIndex: positioningConstants.zIndex.content,
  },
};

// Progressive disclosure positioning patterns (Snapchat mystery UX)
const progressiveDisclosurePositioningPatterns = {
  // Mystery discovery zone
  mysteryZone: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '15%',                          // 15% discovery zone
    zIndex: positioningConstants.zIndex.content,
  },
  
  // Discovery hint positioning
  discoveryHint: {
    position: 'absolute',
    bottom: spacing.large,                 // 24px
    right: spacing.medium,                 // 16px
    zIndex: positioningConstants.zIndex.elevated,
    opacity: 0.6,
  },
  
  // Progressive reveal overlay
  progressiveRevealOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: positioningConstants.zIndex.overlay,
    backgroundColor: lightColors.backdrop,
  },
  
  // Exploration prompt
  explorationPrompt: {
    position: 'absolute',
    bottom: spacing.large,                 // 24px
    left: '50%',
    transform: [{ translateX: -50 }],
    zIndex: positioningConstants.zIndex.popover,
  },
  
  // Gesture area overlay
  gestureAreaOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: positioningConstants.zIndex.content - 1,
    backgroundColor: 'transparent',
  },
  
  // Tutorial spotlight
  tutorialSpotlight: {
    position: 'absolute',
    zIndex: positioningConstants.zIndex.tutorial || 1500,
    borderRadius: borderRadius.full,       // Circular spotlight
  },
  
  // Hidden feature indicator
  hiddenFeatureIndicator: {
    position: 'absolute',
    top: '50%',
    right: 0,
    transform: [{ translateY: -50 }],
    zIndex: positioningConstants.zIndex.elevated,
    opacity: 0.3,
  },
  
  // Swipe instruction overlay
  swipeInstructionOverlay: {
    position: 'absolute',
    bottom: spacing.xxlarge,               // 48px
    left: 0,
    right: 0,
    zIndex: positioningConstants.zIndex.tooltip,
  },
};

// AI collaboration positioning patterns (Jenny Blackburn research)
const aiCollaborationPositioningPatterns = {
  // AI assistant panel positioning
  aiAssistantPanel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 320,                            // Assistant panel width
    zIndex: positioningConstants.zIndex.elevated,
    transform: [{ translateX: 320 }],      // Hidden by default
  },
  
  // AI suggestions floating panel
  aiSuggestionsPanel: {
    position: 'absolute',
    bottom: spacing.large,                 // 24px
    left: spacing.medium,                  // 16px
    right: spacing.medium,                 // 16px
    zIndex: positioningConstants.zIndex.popover,
    maxHeight: '40%',                      // Don't overwhelm interface
    ...shadows.xl,
  },
  
  // AI thinking indicator
  aiThinkingIndicator: {
    position: 'absolute',
    top: spacing.medium,                   // 16px
    left: spacing.medium,                  // 16px
    zIndex: positioningConstants.zIndex.content,
  },
  
  // Collaborative cursor tracking
  collaborativeCursor: {
    position: 'absolute',
    zIndex: positioningConstants.zIndex.elevated,
    // Position will be set dynamically based on user interaction
  },
  
  // Voice interaction overlay
  voiceInteractionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: positioningConstants.zIndex.modal,
    backgroundColor: lightColors.surface,
    borderTopLeftRadius: borderRadius.modal,   // 16px
    borderTopRightRadius: borderRadius.modal,  // 16px
  },
  
  // Multimodal interaction zones
  multimodalZone: {
    position: 'relative',
    zIndex: positioningConstants.zIndex.content,
  },
  
  // AI collaboration status
  collaborationStatus: {
    position: 'absolute',
    top: spacing.small,                    // 8px
    right: spacing.medium,                 // 16px
    zIndex: positioningConstants.zIndex.elevated,
  },
  
  // Smart suggestions positioning
  smartSuggestions: {
    position: 'absolute',
    top: '100%',                           // Below trigger element
    left: 0,
    right: 0,
    zIndex: positioningConstants.zIndex.dropdown,
    marginTop: spacing.extraSmall,         // 8px
    ...shadows.md,
  },
};

// Creator economy positioning patterns (Spotify for Artists inspiration)
const creatorEconomyPositioningPatterns = {
  // Creator dashboard floating stats
  dashboardFloatingStats: {
    position: 'absolute',
    top: spacing.medium,                   // 16px
    right: spacing.medium,                 // 16px
    zIndex: positioningConstants.zIndex.elevated,
    ...shadows.sm,
  },
  
  // Revenue notification overlay
  revenueNotificationOverlay: {
    position: 'absolute',
    top: spacing.large,                    // 24px
    left: spacing.medium,                  // 16px
    right: spacing.medium,                 // 16px
    zIndex: positioningConstants.zIndex.toast,
  },
  
  // Analytics tooltip positioning
  analyticsTooltip: {
    position: 'absolute',
    zIndex: positioningConstants.zIndex.tooltip,
    // Position calculated relative to chart elements
  },
  
  // Performance indicator
  performanceIndicator: {
    position: 'absolute',
    top: spacing.small,                    // 8px
    left: spacing.small,                   // 8px
    zIndex: positioningConstants.zIndex.content,
  },
  
  // Monetization opportunity badge
  monetizationBadge: {
    position: 'absolute',
    top: -spacing.small,                   // -8px (overlap)
    right: -spacing.small,                 // -8px (overlap)
    zIndex: positioningConstants.zIndex.elevated,
  },
  
  // Creator tools floating menu
  creatorToolsMenu: {
    position: 'absolute',
    bottom: spacing.large,                 // 24px
    right: spacing.medium,                 // 16px
    zIndex: positioningConstants.zIndex.dropdown,
  },
  
  // Audience insight overlay
  audienceInsightOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: positioningConstants.zIndex.overlay,
    backgroundColor: lightColors.backdrop,
  },
  
  // Content scheduling indicator
  schedulingIndicator: {
    position: 'absolute',
    bottom: spacing.small,                 // 8px
    right: spacing.small,                  // 8px
    zIndex: positioningConstants.zIndex.content,
  },
  
  // Creator profile enhancement overlay
  profileEnhancementOverlay: {
    position: 'absolute',
    top: '25%',
    left: spacing.medium,                  // 16px
    right: spacing.medium,                 // 16px
    zIndex: positioningConstants.zIndex.modal,
    ...shadows.xl,
  },
};

// Cross-device sync positioning patterns (Kindle inspiration)
const crossDeviceSyncPositioningPatterns = {
  // Sync status indicator
  syncStatusIndicator: {
    position: 'absolute',
    top: positioningConstants.safeArea.top + spacing.small, // Status bar + 8px
    right: spacing.medium,                 // 16px
    zIndex: positioningConstants.zIndex.elevated,
  },
  
  // Device continuation prompt
  deviceContinuationPrompt: {
    position: 'absolute',
    top: '30%',
    left: spacing.medium,                  // 16px
    right: spacing.medium,                 // 16px
    zIndex: positioningConstants.zIndex.modal,
    ...shadows.lg,
  },
  
  // Cross-device handoff overlay
  handoffOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: positioningConstants.zIndex.overlay,
    backgroundColor: lightColors.surface,
    borderTopLeftRadius: borderRadius.modal,   // 16px
    borderTopRightRadius: borderRadius.modal,  // 16px
  },
  
  // Progress sync indicator
  progressSyncIndicator: {
    position: 'absolute',
    bottom: spacing.medium,                // 16px
    left: spacing.medium,                  // 16px
    zIndex: positioningConstants.zIndex.content,
  },
  
  // Device availability indicator
  deviceAvailabilityIndicator: {
    position: 'absolute',
    top: spacing.medium,                   // 16px
    left: spacing.medium,                  // 16px
    zIndex: positioningConstants.zIndex.elevated,
  },
  
  // Seamless transition overlay
  seamlessTransitionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: positioningConstants.zIndex.overlay,
    backgroundColor: lightColors.overlay,
  },
  
  // Reading position indicator
  readingPositionIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 4,                              // Thin progress bar
    zIndex: positioningConstants.zIndex.content,
  },
  
  // Cross-device notification
  crossDeviceNotification: {
    position: 'absolute',
    top: spacing.large,                    // 24px
    left: spacing.medium,                  // 16px
    right: spacing.medium,                 // 16px
    zIndex: positioningConstants.zIndex.toast,
  },
};

// Multi-format media positioning patterns (stories → videos → music)
const multiFormatMediaPositioningPatterns = {
  // Story reading controls
  storyReadingControls: {
    position: 'absolute',
    top: positioningConstants.safeArea.top,
    left: 0,
    right: 0,
    zIndex: positioningConstants.zIndex.overlay,
    backgroundColor: 'transparent',
  },
  
  // Video player controls
  videoPlayerControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: positioningConstants.zIndex.elevated,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  
  // Music player floating controls
  musicPlayerControls: {
    position: 'absolute',
    bottom: positioningConstants.safeArea.bottom + spacing.medium, // Safe area + 16px
    left: spacing.medium,                  // 16px
    right: spacing.medium,                 // 16px
    zIndex: positioningConstants.zIndex.elevated,
    ...shadows.xl,
  },
  
  // Format transition overlay
  formatTransitionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: positioningConstants.zIndex.modal,
    backgroundColor: lightColors.backdrop,
  },
  
  // Media queue overlay
  mediaQueueOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '70%',
    zIndex: positioningConstants.zIndex.modal,
    backgroundColor: lightColors.surface,
    borderTopLeftRadius: borderRadius.modal,   // 16px
    borderTopRightRadius: borderRadius.modal,  // 16px
  },
  
  // Waveform visualization overlay
  waveformOverlay: {
    position: 'absolute',
    bottom: spacing.large,                 // 24px
    left: spacing.medium,                  // 16px
    right: spacing.medium,                 // 16px
    height: 60,                            // Waveform height
    zIndex: positioningConstants.zIndex.content,
  },
  
  // Playback progress indicator
  playbackProgressIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,                             // Thin progress bar
    zIndex: positioningConstants.zIndex.elevated,
  },
  
  // Volume control overlay
  volumeControlOverlay: {
    position: 'absolute',
    right: spacing.medium,                 // 16px
    bottom: spacing.large,                 // 24px
    zIndex: positioningConstants.zIndex.elevated,
  },
  
  // Captions overlay (for video)
  captionsOverlay: {
    position: 'absolute',
    bottom: spacing.xxlarge,               // 48px (above controls)
    left: spacing.medium,                  // 16px
    right: spacing.medium,                 // 16px
    zIndex: positioningConstants.zIndex.content,
  },
};

// ====================
// Common Positioning Patterns
// ====================

// Modal and overlay positioning
const modalOverlayPositioning = {
  // Standard modal
  modal: {
    position: 'absolute',
    top: '10%',
    left: '5%',
    right: '5%',
    bottom: '10%',
    zIndex: positioningConstants.zIndex.modal,
    ...shadows.xxl,
  },
  
  // Full screen modal
  modalFullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: positioningConstants.zIndex.modal,
  },
  
  // Bottom sheet modal
  modalBottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '80%',
    zIndex: positioningConstants.zIndex.modal,
    borderTopLeftRadius: borderRadius.modal,   // 16px
    borderTopRightRadius: borderRadius.modal,  // 16px
  },
  
  // Center modal
  modalCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [
      { translateX: -50 },
      { translateY: -50 },
    ],
    zIndex: positioningConstants.zIndex.modal,
    maxWidth: positioningConstants.accessibility.maxModalWidth,
    maxHeight: positioningConstants.accessibility.optimalModalHeight,
  },
  
  // Backdrop overlay
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: positioningConstants.zIndex.overlay,
    backgroundColor: lightColors.backdrop,
  },
  
  // Loading overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: positioningConstants.zIndex.loading,
    backgroundColor: lightColors.overlay,
  },
};

// Floating elements positioning
const floatingElementsPositioning = {
  // Floating action button
  floatingActionButton: {
    position: 'absolute',
    bottom: spacing.large,                 // 24px
    right: spacing.medium,                 // 16px
    zIndex: positioningConstants.zIndex.elevated,
    ...shadows.lg,
  },
  
  // Tooltip positioning
  tooltip: {
    position: 'absolute',
    zIndex: positioningConstants.zIndex.tooltip,
    ...shadows.md,
  },
  
  // Popover positioning
  popover: {
    position: 'absolute',
    zIndex: positioningConstants.zIndex.popover,
    ...shadows.lg,
  },
  
  // Toast notification
  toast: {
    position: 'absolute',
    top: positioningConstants.safeArea.top + spacing.medium, // Safe area + 16px
    left: spacing.medium,                  // 16px
    right: spacing.medium,                 // 16px
    zIndex: positioningConstants.zIndex.toast,
    ...shadows.md,
  },
  
  // Snackbar
  snackbar: {
    position: 'absolute',
    bottom: positioningConstants.safeArea.bottom + spacing.medium, // Safe area + 16px
    left: spacing.medium,                  // 16px
    right: spacing.medium,                 // 16px
    zIndex: positioningConstants.zIndex.toast,
    ...shadows.md,
  },
  
  // Floating panel
  floatingPanel: {
    position: 'absolute',
    top: spacing.large,                    // 24px
    right: spacing.medium,                 // 16px
    zIndex: positioningConstants.zIndex.elevated,
    ...shadows.lg,
  },
};

// Sticky positioning simulation
const stickyPositioning = {
  // Sticky header
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: positioningConstants.zIndex.sticky,
    backgroundColor: lightColors.background,
  },
  
  // Sticky footer
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: positioningConstants.zIndex.sticky,
    backgroundColor: lightColors.background,
  },
  
  // Sticky sidebar
  stickySidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,                            // Standard sidebar width
    zIndex: positioningConstants.zIndex.sticky,
    backgroundColor: lightColors.surface,
  },
  
  // Sticky tab bar
  stickyTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: positioningConstants.zIndex.sticky,
    backgroundColor: lightColors.surface,
  },
  
  // Sticky search bar
  stickySearchBar: {
    position: 'absolute',
    top: positioningConstants.safeArea.top,
    left: 0,
    right: 0,
    zIndex: positioningConstants.zIndex.sticky,
    backgroundColor: lightColors.background,
  },
};

// Create StyleSheet
export const positioningStyles = StyleSheet.create({
  // Core positioning properties
  ...basicPosition,
  ...directionalPosition,
  ...combinedPosition,
  ...zIndexUtilities,
  
  // Design research patterns
  ...newsFeedPositioningPatterns,
  ...progressiveDisclosurePositioningPatterns,
  ...aiCollaborationPositioningPatterns,
  ...creatorEconomyPositioningPatterns,
  ...crossDeviceSyncPositioningPatterns,
  ...multiFormatMediaPositioningPatterns,
  
  // Common patterns
  ...modalOverlayPositioning,
  ...floatingElementsPositioning,
  ...stickyPositioning,
});

// Dark theme positioning styles
const darkPositioningStyles = StyleSheet.create({
  // Feed item overlay with dark theme
  feedItemOverlay: {
    ...newsFeedPositioningPatterns.feedItemOverlay,
    backgroundColor: darkColors.overlay,
  },
  
  // Stories bar with dark theme
  storiesBar: {
    ...newsFeedPositioningPatterns.storiesBar,
    backgroundColor: darkColors.background,
  },
  
  // Progressive reveal overlay with dark theme
  progressiveRevealOverlay: {
    ...progressiveDisclosurePositioningPatterns.progressiveRevealOverlay,
    backgroundColor: darkColors.backdrop,
  },
  
  // Voice interaction overlay with dark theme
  voiceInteractionOverlay: {
    ...aiCollaborationPositioningPatterns.voiceInteractionOverlay,
    backgroundColor: darkColors.surface,
  },
  
  // Handoff overlay with dark theme
  handoffOverlay: {
    ...crossDeviceSyncPositioningPatterns.handoffOverlay,
    backgroundColor: darkColors.surface,
  },
  
  // Format transition overlay with dark theme
  formatTransitionOverlay: {
    ...multiFormatMediaPositioningPatterns.formatTransitionOverlay,
    backgroundColor: darkColors.backdrop,
  },
  
  // Media queue overlay with dark theme
  mediaQueueOverlay: {
    ...multiFormatMediaPositioningPatterns.mediaQueueOverlay,
    backgroundColor: darkColors.surface,
  },
  
  // Backdrop with dark theme
  backdrop: {
    ...modalOverlayPositioning.backdrop,
    backgroundColor: darkColors.backdrop,
  },
  
  // Loading overlay with dark theme
  loadingOverlay: {
    ...modalOverlayPositioning.loadingOverlay,
    backgroundColor: darkColors.overlay,
  },
  
  // Sticky header with dark theme
  stickyHeader: {
    ...stickyPositioning.stickyHeader,
    backgroundColor: darkColors.background,
  },
  
  // Sticky footer with dark theme
  stickyFooter: {
    ...stickyPositioning.stickyFooter,
    backgroundColor: darkColors.background,
  },
  
  // Sticky sidebar with dark theme
  stickySidebar: {
    ...stickyPositioning.stickySidebar,
    backgroundColor: darkColors.surface,
  },
  
  // Sticky tab bar with dark theme
  stickyTabBar: {
    ...stickyPositioning.stickyTabBar,
    backgroundColor: darkColors.surface,
  },
  
  // Sticky search bar with dark theme
  stickySearchBar: {
    ...stickyPositioning.stickySearchBar,
    backgroundColor: darkColors.background,
  },
});

// Theme-aware positioning getter
export const getPositioningStyles = (isDark = false) => {
  const base = positioningStyles;
  const dark = darkPositioningStyles;
  
  return {
    // Core positioning (same for both themes)
    static: base.static,
    relative: base.relative,
    absolute: base.absolute,
    fixed: base.fixed,
    sticky: base.sticky,
    
    // Directional positioning
    top0: base.top0,
    topAuto: base.topAuto,
    topSafe: base.topSafe,
    topSmall: base.topSmall,
    topMedium: base.topMedium,
    topLarge: base.topLarge,
    topCenter: base.topCenter,
    right0: base.right0,
    rightAuto: base.rightAuto,
    rightSmall: base.rightSmall,
    rightMedium: base.rightMedium,
    rightLarge: base.rightLarge,
    rightCenter: base.rightCenter,
    bottom0: base.bottom0,
    bottomAuto: base.bottomAuto,
    bottomSafe: base.bottomSafe,
    bottomSmall: base.bottomSmall,
    bottomMedium: base.bottomMedium,
    bottomLarge: base.bottomLarge,
    bottomCenter: base.bottomCenter,
    left0: base.left0,
    leftAuto: base.leftAuto,
    leftSmall: base.leftSmall,
    leftMedium: base.leftMedium,
    leftLarge: base.leftLarge,
    leftCenter: base.leftCenter,
    
    // Combined positioning
    topLeft: base.topLeft,
    topRight: base.topRight,
    bottomLeft: base.bottomLeft,
    bottomRight: base.bottomRight,
    topFull: base.topFull,
    rightFull: base.rightFull,
    bottomFull: base.bottomFull,
    leftFull: base.leftFull,
    fullCoverage: base.fullCoverage,
    absoluteCenter: base.absoluteCenter,
    safeTopLeft: base.safeTopLeft,
    safeTopRight: base.safeTopRight,
    safeBottomLeft: base.safeBottomLeft,
    safeBottomRight: base.safeBottomRight,
    
    // Z-index utilities
    zIndexBase: base.zIndexBase,
    zIndexBackground: base.zIndexBackground,
    zIndexContent: base.zIndexContent,
    zIndexElevated: base.zIndexElevated,
    zIndexDropdown: base.zIndexDropdown,
    zIndexSticky: base.zIndexSticky,
    zIndexOverlay: base.zIndexOverlay,
    zIndexModal: base.zIndexModal,
    zIndexPopover: base.zIndexPopover,
    zIndexTooltip: base.zIndexTooltip,
    zIndexToast: base.zIndexToast,
    zIndexLoading: base.zIndexLoading,
    zIndexMaximum: base.zIndexMaximum,
    
    // News Feed patterns
    feedScrollPosition: base.feedScrollPosition,
    feedFloatingAction: base.feedFloatingAction,
    feedItemOverlay: isDark ? dark.feedItemOverlay : base.feedItemOverlay,
    engagementIndicators: base.engagementIndicators,
    priorityIndicator: base.priorityIndicator,
    infiniteScrollLoading: base.infiniteScrollLoading,
    storiesBar: isDark ? dark.storiesBar : base.storiesBar,
    sponsoredIndicator: base.sponsoredIndicator,
    
    // Progressive disclosure patterns
    mysteryZone: base.mysteryZone,
    discoveryHint: base.discoveryHint,
    progressiveRevealOverlay: isDark ? dark.progressiveRevealOverlay : base.progressiveRevealOverlay,
    explorationPrompt: base.explorationPrompt,
    gestureAreaOverlay: base.gestureAreaOverlay,
    tutorialSpotlight: base.tutorialSpotlight,
    hiddenFeatureIndicator: base.hiddenFeatureIndicator,
    swipeInstructionOverlay: base.swipeInstructionOverlay,
    
    // AI collaboration patterns (theme-aware)
    aiAssistantPanel: base.aiAssistantPanel,
    aiSuggestionsPanel: base.aiSuggestionsPanel,
    aiThinkingIndicator: base.aiThinkingIndicator,
    collaborativeCursor: base.collaborativeCursor,
    voiceInteractionOverlay: isDark ? dark.voiceInteractionOverlay : base.voiceInteractionOverlay,
    multimodalZone: base.multimodalZone,
    collaborationStatus: base.collaborationStatus,
    smartSuggestions: base.smartSuggestions,
    
    // Creator economy patterns
    dashboardFloatingStats: base.dashboardFloatingStats,
    revenueNotificationOverlay: base.revenueNotificationOverlay,
    analyticsTooltip: base.analyticsTooltip,
    performanceIndicator: base.performanceIndicator,
    monetizationBadge: base.monetizationBadge,
    creatorToolsMenu: base.creatorToolsMenu,
    audienceInsightOverlay: base.audienceInsightOverlay,
    schedulingIndicator: base.schedulingIndicator,
    profileEnhancementOverlay: base.profileEnhancementOverlay,
    
    // Cross-device sync patterns (theme-aware)
    syncStatusIndicator: base.syncStatusIndicator,
    deviceContinuationPrompt: base.deviceContinuationPrompt,
    handoffOverlay: isDark ? dark.handoffOverlay : base.handoffOverlay,
    progressSyncIndicator: base.progressSyncIndicator,
    deviceAvailabilityIndicator: base.deviceAvailabilityIndicator,
    seamlessTransitionOverlay: base.seamlessTransitionOverlay,
    readingPositionIndicator: base.readingPositionIndicator,
    crossDeviceNotification: base.crossDeviceNotification,
    
    // Multi-format media patterns (theme-aware)
    storyReadingControls: base.storyReadingControls,
    videoPlayerControls: base.videoPlayerControls,
    musicPlayerControls: base.musicPlayerControls,
    formatTransitionOverlay: isDark ? dark.formatTransitionOverlay : base.formatTransitionOverlay,
    mediaQueueOverlay: isDark ? dark.mediaQueueOverlay : base.mediaQueueOverlay,
    waveformOverlay: base.waveformOverlay,
    playbackProgressIndicator: base.playbackProgressIndicator,
    volumeControlOverlay: base.volumeControlOverlay,
    captionsOverlay: base.captionsOverlay,
    
    // Modal and overlay patterns (theme-aware)
    modal: base.modal,
    modalFullScreen: base.modalFullScreen,
    modalBottomSheet: base.modalBottomSheet,
    modalCenter: base.modalCenter,
    backdrop: isDark ? dark.backdrop : base.backdrop,
    loadingOverlay: isDark ? dark.loadingOverlay : base.loadingOverlay,
    
    // Floating elements
    floatingActionButton: base.floatingActionButton,
    tooltip: base.tooltip,
    popover: base.popover,
    toast: base.toast,
    snackbar: base.snackbar,
    floatingPanel: base.floatingPanel,
    
    // Sticky positioning (theme-aware)
    stickyHeader: isDark ? dark.stickyHeader : base.stickyHeader,
    stickyFooter: isDark ? dark.stickyFooter : base.stickyFooter,
    stickySidebar: isDark ? dark.stickySidebar : base.stickySidebar,
    stickyTabBar: isDark ? dark.stickyTabBar : base.stickyTabBar,
    stickySearchBar: isDark ? dark.stickySearchBar : base.stickySearchBar,
  };
};

// Export positioning constants for use in other files
export { positioningConstants };

// Export individual style categories for granular imports
export const corePositioningStyles = {
  static: positioningStyles.static,
  relative: positioningStyles.relative,
  absolute: positioningStyles.absolute,
  fixed: positioningStyles.fixed,
  sticky: positioningStyles.sticky,
  topLeft: positioningStyles.topLeft,
  topRight: positioningStyles.topRight,
  bottomLeft: positioningStyles.bottomLeft,
  bottomRight: positioningStyles.bottomRight,
  absoluteCenter: positioningStyles.absoluteCenter,
  fullCoverage: positioningStyles.fullCoverage,
};

export const zIndexStyles = {
  zIndexBase: positioningStyles.zIndexBase,
  zIndexContent: positioningStyles.zIndexContent,
  zIndexElevated: positioningStyles.zIndexElevated,
  zIndexDropdown: positioningStyles.zIndexDropdown,
  zIndexSticky: positioningStyles.zIndexSticky,
  zIndexOverlay: positioningStyles.zIndexOverlay,
  zIndexModal: positioningStyles.zIndexModal,
  zIndexPopover: positioningStyles.zIndexPopover,
  zIndexTooltip: positioningStyles.zIndexTooltip,
  zIndexToast: positioningStyles.zIndexToast,
  zIndexLoading: positioningStyles.zIndexLoading,
  zIndexMaximum: positioningStyles.zIndexMaximum,
};

export const designResearchPositioningStyles = {
  // News Feed
  feedFloatingAction: positioningStyles.feedFloatingAction,
  feedItemOverlay: positioningStyles.feedItemOverlay,
  engagementIndicators: positioningStyles.engagementIndicators,
  
  // Progressive disclosure
  mysteryZone: positioningStyles.mysteryZone,
  discoveryHint: positioningStyles.discoveryHint,
  progressiveRevealOverlay: positioningStyles.progressiveRevealOverlay,
  
  // AI collaboration
  aiAssistantPanel: positioningStyles.aiAssistantPanel,
  aiSuggestionsPanel: positioningStyles.aiSuggestionsPanel,
  voiceInteractionOverlay: positioningStyles.voiceInteractionOverlay,
  
  // Creator economy
  dashboardFloatingStats: positioningStyles.dashboardFloatingStats,
  revenueNotificationOverlay: positioningStyles.revenueNotificationOverlay,
  creatorToolsMenu: positioningStyles.creatorToolsMenu,
  
  // Cross-device sync
  syncStatusIndicator: positioningStyles.syncStatusIndicator,
  deviceContinuationPrompt: positioningStyles.deviceContinuationPrompt,
  handoffOverlay: positioningStyles.handoffOverlay,
  
  // Multi-format media
  storyReadingControls: positioningStyles.storyReadingControls,
  videoPlayerControls: positioningStyles.videoPlayerControls,
  musicPlayerControls: positioningStyles.musicPlayerControls,
};

export const modalOverlayStyles = {
  modal: positioningStyles.modal,
  modalFullScreen: positioningStyles.modalFullScreen,
  modalBottomSheet: positioningStyles.modalBottomSheet,
  modalCenter: positioningStyles.modalCenter,
  backdrop: positioningStyles.backdrop,
  loadingOverlay: positioningStyles.loadingOverlay,
};

export const floatingElementStyles = {
  floatingActionButton: positioningStyles.floatingActionButton,
  tooltip: positioningStyles.tooltip,
  popover: positioningStyles.popover,
  toast: positioningStyles.toast,
  snackbar: positioningStyles.snackbar,
  floatingPanel: positioningStyles.floatingPanel,
};

// Utility functions for positioning calculations
export const positioningUtils = {
  // Calculate position based on trigger element
  calculateTooltipPosition: (triggerRect, tooltipSize, placement = 'top') => {
    const placements = {
      top: {
        top: triggerRect.top - tooltipSize.height - spacing.extraSmall,
        left: triggerRect.left + (triggerRect.width / 2) - (tooltipSize.width / 2),
      },
      bottom: {
        top: triggerRect.bottom + spacing.extraSmall,
        left: triggerRect.left + (triggerRect.width / 2) - (tooltipSize.width / 2),
      },
      left: {
        top: triggerRect.top + (triggerRect.height / 2) - (tooltipSize.height / 2),
        left: triggerRect.left - tooltipSize.width - spacing.extraSmall,
      },
      right: {
        top: triggerRect.top + (triggerRect.height / 2) - (tooltipSize.height / 2),
        left: triggerRect.right + spacing.extraSmall,
      },
    };
    return placements[placement] || placements.top;
  },
  
  // Calculate safe area positioning
  calculateSafeAreaPosition: (basePosition, safeAreaInsets) => {
    return {
      top: (basePosition.top || 0) + (safeAreaInsets.top || 0),
      right: (basePosition.right || 0) + (safeAreaInsets.right || 0),
      bottom: (basePosition.bottom || 0) + (safeAreaInsets.bottom || 0),
      left: (basePosition.left || 0) + (safeAreaInsets.left || 0),
    };
  },
  
  // Calculate optimal z-index
  calculateOptimalZIndex: (context) => {
    const contextZIndex = {
      content: positioningConstants.zIndex.content,
      navigation: positioningConstants.zIndex.elevated,
      overlay: positioningConstants.zIndex.overlay,
      modal: positioningConstants.zIndex.modal,
      system: positioningConstants.zIndex.toast,
    };
    return contextZIndex[context] || positioningConstants.zIndex.content;
  },
  
  // Create responsive positioning
  createResponsivePosition: (mobilePosition, tabletPosition, desktopPosition) => {
    // Would use responsive hooks or media queries in practice
    return {
      mobile: mobilePosition,
      tablet: tabletPosition,
      desktop: desktopPosition,
    };
  },
  
  // Calculate center position
  calculateCenterPosition: (containerSize, elementSize) => {
    return {
      top: (containerSize.height - elementSize.height) / 2,
      left: (containerSize.width - elementSize.width) / 2,
    };
  },
  
  // Ensure position stays within bounds
  constrainPosition: (position, bounds) => {
    return {
      top: Math.max(0, Math.min(position.top, bounds.height)),
      left: Math.max(0, Math.min(position.left, bounds.width)),
      right: position.right,
      bottom: position.bottom,
    };
  },
  
  // Create animation-ready positioning
  createAnimatedPosition: (startPosition, endPosition, progress) => {
    return {
      top: startPosition.top + (endPosition.top - startPosition.top) * progress,
      left: startPosition.left + (endPosition.left - startPosition.left) * progress,
      opacity: progress,
      transform: [
        { scale: 0.9 + (0.1 * progress) },
      ],
    };
  },
};

// 38,967 characters