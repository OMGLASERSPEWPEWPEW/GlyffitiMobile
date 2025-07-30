// src/styles/layouts/containers.js
// Path: src/styles/layouts/containers.js

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
 * Container styles - comprehensive container layout system
 * All container layouts, screen containers, and content areas
 * Uses design tokens for consistency and theming support
 * 
 * Usage:
 * - Import specific styles: containerStyles.screen, containerStyles.section
 * - Theme-aware: use getContainerStyles(isDark) for proper colors
 * - Combine: [containerStyles.screen, containerStyles.safe, containerStyles.padded]
 */

// Container constants
const containerConstants = {
  // Maximum content widths (responsive design)
  maxContentWidth: 1200,      // Desktop max width
  maxMobileWidth: 480,        // Mobile breakpoint
  maxTabletWidth: 768,        // Tablet breakpoint
  
  // Minimum touch targets
  minTouchHeight: 44,         // Apple HIG minimum
  minTouchWidth: 44,
  
  // Common ratios
  goldenRatio: 1.618,         // For aspect ratios
  cardAspectRatio: 1.5,       // Standard card aspect ratio
};

// Base container styles
const baseContainer = {
  flex: 1,
  backgroundColor: lightColors.background,
};

// Screen-level containers (top-level layout containers)
const screenContainers = {
  // Standard screen container
  screen: {
    ...baseContainer,
    paddingHorizontal: spacing.medium,       // 16px
    paddingVertical: spacing.small,          // 8px
  },
  
  // Safe area screen (handles notches, status bars)
  screenSafe: {
    ...baseContainer,
    paddingTop: spacing.large,               // 24px - accounts for status bar
    paddingHorizontal: spacing.medium,       // 16px
    paddingBottom: spacing.medium,           // 16px
  },
  
  // Full screen (edge-to-edge)
  screenFull: {
    ...baseContainer,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  
  // Modal screen container
  screenModal: {
    ...baseContainer,
    borderTopLeftRadius: borderRadius.modal,   // 16px
    borderTopRightRadius: borderRadius.modal,  // 16px
    paddingHorizontal: spacing.large,          // 24px
    paddingVertical: spacing.large,            // 24px
    maxHeight: '90%',                          // Leave space for backdrop
  },
  
  // Tabbed screen (with tab bar)
  screenTabbed: {
    ...baseContainer,
    paddingHorizontal: spacing.medium,         // 16px
    paddingVertical: spacing.small,            // 8px
    paddingBottom: spacing.xxlarge,            // Account for tab bar (48px)
  },
  
  // Scrollable screen
  screenScrollable: {
    flexGrow: 1,
    backgroundColor: lightColors.background,
    paddingBottom: spacing.large,              // 24px - bottom spacing
  },
  
  // Split screen (tablet/desktop)
  screenSplit: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: lightColors.background,
  },
  
  screenSplitLeft: {
    flex: 1,
    paddingRight: spacing.small,               // 8px
  },
  
  screenSplitRight: {
    flex: 1,
    paddingLeft: spacing.small,                // 8px
  },
};

// Content area containers (within screens)
const contentContainers = {
  // Main content area
  content: {
    flex: 1,
    paddingHorizontal: spacing.medium,         // 16px
    paddingVertical: spacing.small,            // 8px
  },
  
  // Content with max width (responsive)
  contentConstrained: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: containerConstants.maxContentWidth,
    paddingHorizontal: spacing.medium,         // 16px
  },
  
  // Centered content
  contentCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.large,          // 24px
    paddingVertical: spacing.large,            // 24px
  },
  
  // Story content (reading optimized)
  contentReading: {
    flex: 1,
    paddingHorizontal: spacing.large,          // 24px - wider margins for reading
    paddingVertical: spacing.medium,           // 16px
    lineHeight: typography.lineHeight.relaxed, // 1.6 - better for reading
  },
  
  // List content
  contentList: {
    flex: 1,
    paddingHorizontal: spacing.small,          // 8px - lists handle their own spacing
  },
  
  // Grid content
  contentGrid: {
    flex: 1,
    paddingHorizontal: spacing.extraSmall,     // 8px - grids need tighter spacing
  },
  
  // Header content area
  contentHeader: {
    paddingHorizontal: spacing.medium,         // 16px
    paddingVertical: spacing.small,            // 8px
    borderBottomWidth: borderWidth.hairline,   // 0.5px
    borderBottomColor: lightColors.border,
  },
  
  // Footer content area
  contentFooter: {
    paddingHorizontal: spacing.medium,         // 16px
    paddingVertical: spacing.small,            // 8px
    borderTopWidth: borderWidth.hairline,      // 0.5px
    borderTopColor: lightColors.border,
  },
};

// Section containers (organize content within areas)
const sectionContainers = {
  // Standard section
  section: {
    marginBottom: spacing.large,               // 24px
    paddingVertical: spacing.medium,           // 16px
  },
  
  // Section with background
  sectionCard: {
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.card,           // 12px
    padding: spacing.medium,                   // 16px
    marginBottom: spacing.medium,              // 16px
    ...shadows.sm,
  },
  
  // Highlighted section
  sectionHighlight: {
    backgroundColor: lightColors.surfaceSecondary,
    borderLeftWidth: borderWidth.thick,        // 3px
    borderLeftColor: lightColors.primary,
    paddingHorizontal: spacing.medium,         // 16px
    paddingVertical: spacing.small,            // 8px
    marginBottom: spacing.medium,              // 16px
  },
  
  // Compact section
  sectionCompact: {
    marginBottom: spacing.medium,              // 16px
    paddingVertical: spacing.small,            // 8px
  },
  
  // Spacious section
  sectionSpacious: {
    marginBottom: spacing.xxlarge,             // 48px
    paddingVertical: spacing.large,            // 24px
  },
  
  // Inline section (horizontal)
  sectionInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.small,            // 8px
    marginBottom: spacing.medium,              // 16px
  },
  
  // Group sections together
  sectionGroup: {
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.card,           // 12px
    padding: spacing.small,                    // 8px
    marginBottom: spacing.large,               // 24px
    ...shadows.sm,
  },
};

// Special purpose containers
const specialContainers = {
  // Loading state container
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.large,          // 24px
    paddingVertical: spacing.large,            // 24px
  },
  
  // Error state container
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.large,          // 24px
    paddingVertical: spacing.large,            // 24px
  },
  
  // Empty state container
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.large,          // 24px
    paddingVertical: spacing.xxlarge,          // 48px
  },
  
  // Overlay container
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: lightColors.overlay,      // rgba with transparency
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  
  // Backdrop container (for modals)
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: lightColors.backdrop,     // Darker overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Floating container (for FABs, tooltips)
  floating: {
    position: 'absolute',
    zIndex: 999,
    ...shadows.lg,
  },
  
  // Sticky container (headers, toolbars)
  sticky: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: lightColors.background,
    borderBottomWidth: borderWidth.hairline,   // 0.5px
    borderBottomColor: lightColors.border,
  },
  
  // Drawer container
  drawer: {
    flex: 1,
    backgroundColor: lightColors.surface,
    paddingHorizontal: spacing.medium,         // 16px
    paddingVertical: spacing.large,            // 24px
  },
  
  // Sidebar container (tablet/desktop)
  sidebar: {
    width: 280,                                // Standard sidebar width
    backgroundColor: lightColors.surface,
    borderRightWidth: borderWidth.hairline,    // 0.5px
    borderRightColor: lightColors.border,
    paddingHorizontal: spacing.medium,         // 16px
    paddingVertical: spacing.large,            // 24px
  },
};

// Progressive disclosure containers (Snapchat mystery UX inspiration)
const progressiveDisclosureContainers = {
  // Mystery zone (hidden functionality area)
  mysteryZone: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '15%',                              // 15% of screen for discoverable features
    height: '100%',
    backgroundColor: 'transparent',
    zIndex: 50,
  },
  
  // Discovery hint container
  discoveryHint: {
    position: 'absolute',
    bottom: spacing.large,                     // 24px
    right: spacing.medium,                     // 16px
    width: 4,
    height: 40,
    backgroundColor: lightColors.primary,
    borderRadius: 2,
    opacity: 0.6,
    zIndex: 60,
  },
  
  // Progressive reveal container
  progressiveReveal: {
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.card,           // 12px
    padding: spacing.medium,                   // 16px
    marginBottom: spacing.medium,              // 16px
    transform: [{ scale: 0 }],                 // Start hidden, animate in
    opacity: 0,
  },
  
  // Exploration prompt
  explorationPrompt: {
    position: 'absolute',
    bottom: spacing.large,                     // 24px
    left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: lightColors.surface,
    paddingHorizontal: spacing.medium,         // 16px
    paddingVertical: spacing.small,            // 8px
    borderRadius: borderRadius.full,           // Pill shape
    ...shadows.md,
    zIndex: 70,
  },
  
  // Gesture discovery zone
  gestureZone: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 1,                                 // Below content, above background
  },
  
  // Tutorial overlay
  tutorialOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: lightColors.backdrop,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1100,                              // Above everything
  },
};

// AI collaboration containers (Jenny Blackburn research inspired)
const aiCollaborationContainers = {
  // AI assistant sidebar
  aiAssistant: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 320,                                // Assistant panel width
    backgroundColor: lightColors.surface,
    borderLeftWidth: borderWidth.hairline,     // 0.5px
    borderLeftColor: lightColors.border,
    paddingHorizontal: spacing.medium,         // 16px
    paddingVertical: spacing.large,            // 24px
    zIndex: 800,
    transform: [{ translateX: 320 }],          // Hidden by default
  },
  
  // AI suggestions floating panel
  aiSuggestions: {
    position: 'absolute',
    bottom: spacing.large,                     // 24px
    left: spacing.medium,                      // 16px
    right: spacing.medium,                     // 16px
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.modal,          // 16px
    paddingHorizontal: spacing.medium,         // 16px
    paddingVertical: spacing.large,            // 24px
    maxHeight: 300,                            // Scrollable if needed
    ...shadows.xl,
    zIndex: 900,
  },
  
  // Multimodal interaction area
  aiMultimodal: {
    flex: 1,
    backgroundColor: lightColors.background,
    paddingHorizontal: spacing.large,          // 24px
    paddingVertical: spacing.medium,           // 16px
    position: 'relative',
  },
  
  // Voice interaction overlay
  aiVoiceOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: lightColors.surface,
    borderTopLeftRadius: borderRadius.modal,   // 16px
    borderTopRightRadius: borderRadius.modal,  // 16px
    paddingHorizontal: spacing.large,          // 24px
    paddingVertical: spacing.large,            // 24px
    ...shadows.xl,
    zIndex: 950,
  },
  
  // Collaborative editing space
  aiCollaborativeSpace: {
    flex: 1,
    backgroundColor: lightColors.backgroundSecondary,
    paddingHorizontal: spacing.large,          // 24px
    paddingVertical: spacing.medium,           // 16px
    borderRadius: borderRadius.card,           // 12px
    marginHorizontal: spacing.medium,          // 16px
    position: 'relative',
  },
  
  // AI thinking indicator
  aiThinking: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightColors.surface,
    paddingHorizontal: spacing.medium,         // 16px
    paddingVertical: spacing.small,            // 8px
    borderRadius: borderRadius.full,           // Pill shape
    alignSelf: 'flex-start',
    ...shadows.sm,
  },
};

// Creator economy containers (Spotify for Artists inspiration)
const creatorEconomyContainers = {
  // Creator dashboard
  creatorDashboard: {
    flex: 1,
    backgroundColor: lightColors.backgroundSecondary,
    paddingHorizontal: spacing.medium,         // 16px
    paddingTop: spacing.large,                 // 24px
  },
  
  // Analytics container
  analyticsContainer: {
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.card,           // 12px
    padding: spacing.medium,                   // 16px
    marginBottom: spacing.medium,              // 16px
    ...shadows.sm,
  },
  
  // Revenue container
  revenueContainer: {
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.card,           // 12px
    padding: spacing.large,                    // 24px
    marginBottom: spacing.medium,              // 16px
    borderLeftWidth: borderWidth.thick,        // 3px
    borderLeftColor: lightColors.success,
    ...shadows.sm,
  },
  
  // Audience insights
  audienceInsights: {
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.card,           // 12px
    padding: spacing.medium,                   // 16px
    marginBottom: spacing.medium,              // 16px
    ...shadows.sm,
  },
  
  // Content management area
  contentManagement: {
    flex: 1,
    backgroundColor: lightColors.background,
    paddingHorizontal: spacing.medium,         // 16px
    paddingVertical: spacing.small,            // 8px
  },
  
  // Publishing workflow
  publishingWorkflow: {
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.modal,          // 16px
    padding: spacing.large,                    // 24px
    marginHorizontal: spacing.medium,          // 16px
    marginBottom: spacing.large,               // 24px
    ...shadows.lg,
  },
  
  // Creator profile showcase
  creatorShowcase: {
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.card,           // 12px
    padding: spacing.large,                    // 24px
    marginBottom: spacing.large,               // 24px
    ...shadows.md,
  },
};

// Cross-device sync containers (Kindle inspiration)
const crossDeviceSyncContainers = {
  // Sync indicator
  syncIndicator: {
    position: 'absolute',
    top: spacing.medium,                       // 16px
    right: spacing.medium,                     // 16px
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.full,           // Circular
    padding: spacing.small,                    // 8px
    ...shadows.sm,
    zIndex: 200,
  },
  
  // Continuation prompt
  continuationPrompt: {
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.card,           // 12px
    padding: spacing.large,                    // 24px
    marginHorizontal: spacing.medium,          // 16px
    marginBottom: spacing.large,               // 24px
    borderLeftWidth: borderWidth.thick,        // 3px
    borderLeftColor: lightColors.primary,
    ...shadows.md,
  },
  
  // Device handoff
  deviceHandoff: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: lightColors.surface,
    borderTopLeftRadius: borderRadius.modal,   // 16px
    borderTopRightRadius: borderRadius.modal,  // 16px
    paddingHorizontal: spacing.large,          // 24px
    paddingVertical: spacing.large,            // 24px
    ...shadows.xl,
    zIndex: 1000,
  },
  
  // Progress sync
  progressSync: {
    backgroundColor: lightColors.backgroundSecondary,
    borderRadius: borderRadius.card,           // 12px
    padding: spacing.medium,                   // 16px
    marginHorizontal: spacing.medium,          // 16px
    marginBottom: spacing.medium,              // 16px
    borderWidth: borderWidth.hairline,         // 0.5px
    borderColor: lightColors.border,
  },
  
  // Cross-device settings
  crossDeviceSettings: {
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.card,           // 12px
    padding: spacing.medium,                   // 16px
    marginBottom: spacing.medium,              // 16px
    ...shadows.sm,
  },
};

// Multi-format media containers (stories → videos → music)
const mediaContainers = {
  // Story reader container
  storyReader: {
    flex: 1,
    backgroundColor: lightColors.background,
    paddingHorizontal: spacing.large,          // 24px - reading optimized
    paddingVertical: spacing.medium,           // 16px
    maxWidth: containerConstants.maxContentWidth * 0.7, // 70% for readability
    alignSelf: 'center',
  },
  
  // Video player container
  videoPlayer: {
    backgroundColor: '#000000',                // Black for video
    borderRadius: borderRadius.card,           // 12px
    overflow: 'hidden',
    marginHorizontal: spacing.small,           // 8px
    marginBottom: spacing.medium,              // 16px
    aspectRatio: containerConstants.goldenRatio, // 16:9
  },
  
  // Music player container
  musicPlayer: {
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.card,           // 12px
    padding: spacing.large,                    // 24px
    marginHorizontal: spacing.medium,          // 16px
    marginBottom: spacing.medium,              // 16px
    ...shadows.lg,
    aspectRatio: 1,                            // Square for album art
  },
  
  // Audio waveform container
  audioWaveform: {
    backgroundColor: lightColors.backgroundSecondary,
    borderRadius: borderRadius.small,          // 4px
    paddingHorizontal: spacing.medium,         // 16px
    paddingVertical: spacing.small,            // 8px
    marginVertical: spacing.medium,            // 16px
    minHeight: 60,                             // Waveform height
  },
  
  // Media controls overlay
  mediaControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: lightColors.surface + 'E6', // 90% opacity
    paddingHorizontal: spacing.medium,         // 16px
    paddingVertical: spacing.small,            // 8px
    borderBottomLeftRadius: borderRadius.card, // 12px
    borderBottomRightRadius: borderRadius.card, // 12px
  },
  
  // Media queue
  mediaQueue: {
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.card,           // 12px
    padding: spacing.medium,                   // 16px
    marginHorizontal: spacing.medium,          // 16px
    marginBottom: spacing.medium,              // 16px
    maxHeight: 300,                            // Scrollable
    ...shadows.sm,
  },
  
  // Format transition container (stories → videos → music)
  formatTransition: {
    backgroundColor: lightColors.backgroundSecondary,
    borderRadius: borderRadius.modal,          // 16px
    padding: spacing.large,                    // 24px
    marginHorizontal: spacing.medium,          // 16px
    marginVertical: spacing.large,             // 24px
    ...shadows.md,
  },
};

// Algorithm-optimized containers (News Feed patterns)
const algorithmOptimizedContainers = {
  // Feed optimization zone
  feedZone: {
    flex: 1,
    backgroundColor: lightColors.background,
    paddingHorizontal: spacing.small,          // 8px - tight for feed items
  },
  
  // Recommendation container
  recommendationContainer: {
    backgroundColor: lightColors.backgroundSecondary,
    borderRadius: borderRadius.card,           // 12px
    padding: spacing.medium,                   // 16px
    marginHorizontal: spacing.medium,          // 16px
    marginBottom: spacing.medium,              // 16px
    borderLeftWidth: borderWidth.thin,         // 1px
    borderLeftColor: lightColors.primary,
  },
  
  // Personalization area
  personalizationArea: {
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.card,           // 12px
    padding: spacing.large,                    // 24px
    marginBottom: spacing.large,               // 24px
    ...shadows.sm,
  },
  
  // Engagement optimization zone
  engagementZone: {
    paddingHorizontal: spacing.medium,         // 16px
    paddingVertical: spacing.small,            // 8px
    borderTopWidth: borderWidth.hairline,      // 0.5px
    borderTopColor: lightColors.border,
    backgroundColor: lightColors.backgroundSecondary,
  },
  
  // Content prioritization area
  contentPriority: {
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.card,           // 12px
    padding: spacing.medium,                   // 16px
    marginHorizontal: spacing.small,           // 8px
    marginBottom: spacing.small,               // 8px
    ...shadows.sm,
  },
  
  // Discovery algorithm container
  discoveryAlgorithm: {
    backgroundColor: lightColors.backgroundSecondary,
    borderRadius: borderRadius.large,          // 12px
    padding: spacing.large,                    // 24px
    marginBottom: spacing.large,               // 24px
    borderWidth: borderWidth.hairline,         // 0.5px
    borderColor: lightColors.border,
  },
};

// Utility containers for common patterns
const utilityContainers = {
  // Flex row with center alignment
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Flex row with space between
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  // Flex row with space around
  rowAround: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  
  // Flex column with center alignment
  columnCenter: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Flex column with space between
  columnBetween: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  
  // Wrap content (for grids, tags)
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  
  // Absolute positioned (full overlay)
  absoluteFull: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  // Relative positioned
  relative: {
    position: 'relative',
  },
  
  // Hidden container (for animations)
  hidden: {
    opacity: 0,
    pointerEvents: 'none',
  },
  
  // Visible container
  visible: {
    opacity: 1,
    pointerEvents: 'auto',
  },
};

// Create StyleSheet
export const containerStyles = StyleSheet.create({
  // Screen containers
  ...screenContainers,
  
  // Content containers
  ...contentContainers,
  
  // Section containers
  ...sectionContainers,
  
  // Special containers
  ...specialContainers,
  
  // Progressive disclosure containers
  ...progressiveDisclosureContainers,
  
  // AI collaboration containers
  ...aiCollaborationContainers,
  
  // Creator economy containers
  ...creatorEconomyContainers,
  
  // Cross-device sync containers
  ...crossDeviceSyncContainers,
  
  // Multi-format media containers
  ...mediaContainers,
  
  // Algorithm-optimized containers
  ...algorithmOptimizedContainers,
  
  // Utility containers
  ...utilityContainers,
});

// Dark theme container styles
const darkContainerStyles = StyleSheet.create({
  // Override screen containers for dark theme
  screen: {
    ...screenContainers.screen,
    backgroundColor: darkColors.background,
  },
  
  screenSafe: {
    ...screenContainers.screenSafe,
    backgroundColor: darkColors.background,
  },
  
  screenFull: {
    ...screenContainers.screenFull,
    backgroundColor: darkColors.background,
  },
  
  screenModal: {
    ...screenContainers.screenModal,
    backgroundColor: darkColors.surface,
  },
  
  screenTabbed: {
    ...screenContainers.screenTabbed,
    backgroundColor: darkColors.background,
  },
  
  screenScrollable: {
    ...screenContainers.screenScrollable,
    backgroundColor: darkColors.background,
  },
  
  screenSplit: {
    ...screenContainers.screenSplit,
    backgroundColor: darkColors.background,
  },
  
  // Content containers
  content: {
    ...contentContainers.content,
    backgroundColor: darkColors.background,
  },
  
  contentConstrained: {
    ...contentContainers.contentConstrained,
    backgroundColor: darkColors.background,
  },
  
  contentCentered: {
    ...contentContainers.contentCentered,
    backgroundColor: darkColors.background,
  },
  
  contentHeader: {
    ...contentContainers.contentHeader,
    borderBottomColor: darkColors.border,
    backgroundColor: darkColors.surface,
  },
  
  contentFooter: {
    ...contentContainers.contentFooter,
    borderTopColor: darkColors.border,
    backgroundColor: darkColors.surface,
  },
  
  // Section containers
  sectionCard: {
    ...sectionContainers.sectionCard,
    backgroundColor: darkColors.surface,
    ...darkShadows.sm,
  },
  
  sectionHighlight: {
    ...sectionContainers.sectionHighlight,
    backgroundColor: darkColors.surfaceSecondary,
    borderLeftColor: darkColors.primary,
  },
  
  sectionGroup: {
    ...sectionContainers.sectionGroup,
    backgroundColor: darkColors.surface,
    ...darkShadows.sm,
  },
  
  // Special containers
  overlay: {
    ...specialContainers.overlay,
    backgroundColor: darkColors.overlay,
  },
  
  backdrop: {
    ...specialContainers.backdrop,
    backgroundColor: darkColors.backdrop,
  },
  
  sticky: {
    ...specialContainers.sticky,
    backgroundColor: darkColors.background,
    borderBottomColor: darkColors.border,
  },
  
  drawer: {
    ...specialContainers.drawer,
    backgroundColor: darkColors.surface,
  },
  
  sidebar: {
    ...specialContainers.sidebar,
    backgroundColor: darkColors.surface,
    borderRightColor: darkColors.border,
  },
  
  // Progressive disclosure containers
  discoveryHint: {
    ...progressiveDisclosureContainers.discoveryHint,
    backgroundColor: darkColors.primary,
  },
  
  progressiveReveal: {
    ...progressiveDisclosureContainers.progressiveReveal,
    backgroundColor: darkColors.surface,
  },
  
  explorationPrompt: {
    ...progressiveDisclosureContainers.explorationPrompt,
    backgroundColor: darkColors.surface,
    ...darkShadows.md,
  },
  
  tutorialOverlay: {
    ...progressiveDisclosureContainers.tutorialOverlay,
    backgroundColor: darkColors.backdrop,
  },
  
  // AI collaboration containers
  aiAssistant: {
    ...aiCollaborationContainers.aiAssistant,
    backgroundColor: darkColors.surface,
    borderLeftColor: darkColors.border,
  },
  
  aiSuggestions: {
    ...aiCollaborationContainers.aiSuggestions,
    backgroundColor: darkColors.surface,
    ...darkShadows.xl,
  },
  
  aiMultimodal: {
    ...aiCollaborationContainers.aiMultimodal,
    backgroundColor: darkColors.background,
  },
  
  aiVoiceOverlay: {
    ...aiCollaborationContainers.aiVoiceOverlay,
    backgroundColor: darkColors.surface,
    ...darkShadows.xl,
  },
  
  aiCollaborativeSpace: {
    ...aiCollaborationContainers.aiCollaborativeSpace,
    backgroundColor: darkColors.backgroundSecondary,
  },
  
  aiThinking: {
    ...aiCollaborationContainers.aiThinking,
    backgroundColor: darkColors.surface,
    ...darkShadows.sm,
  },
  
  // Creator economy containers
  creatorDashboard: {
    ...creatorEconomyContainers.creatorDashboard,
    backgroundColor: darkColors.backgroundSecondary,
  },
  
  analyticsContainer: {
    ...creatorEconomyContainers.analyticsContainer,
    backgroundColor: darkColors.surface,
    ...darkShadows.sm,
  },
  
  revenueContainer: {
    ...creatorEconomyContainers.revenueContainer,
    backgroundColor: darkColors.surface,
    borderLeftColor: darkColors.success,
    ...darkShadows.sm,
  },
  
  audienceInsights: {
    ...creatorEconomyContainers.audienceInsights,
    backgroundColor: darkColors.surface,
    ...darkShadows.sm,
  },
  
  contentManagement: {
    ...creatorEconomyContainers.contentManagement,
    backgroundColor: darkColors.background,
  },
  
  publishingWorkflow: {
    ...creatorEconomyContainers.publishingWorkflow,
    backgroundColor: darkColors.surface,
    ...darkShadows.lg,
  },
  
  creatorShowcase: {
    ...creatorEconomyContainers.creatorShowcase,
    backgroundColor: darkColors.surface,
    ...darkShadows.md,
  },
  
  // Cross-device sync containers
  syncIndicator: {
    ...crossDeviceSyncContainers.syncIndicator,
    backgroundColor: darkColors.surface,
    ...darkShadows.sm,
  },
  
  continuationPrompt: {
    ...crossDeviceSyncContainers.continuationPrompt,
    backgroundColor: darkColors.surface,
    borderLeftColor: darkColors.primary,
    ...darkShadows.md,
  },
  
  deviceHandoff: {
    ...crossDeviceSyncContainers.deviceHandoff,
    backgroundColor: darkColors.surface,
    ...darkShadows.xl,
  },
  
  progressSync: {
    ...crossDeviceSyncContainers.progressSync,
    backgroundColor: darkColors.backgroundSecondary,
    borderColor: darkColors.border,
  },
  
  crossDeviceSettings: {
    ...crossDeviceSyncContainers.crossDeviceSettings,
    backgroundColor: darkColors.surface,
    ...darkShadows.sm,
  },
  
  // Multi-format media containers
  storyReader: {
    ...mediaContainers.storyReader,
    backgroundColor: darkColors.background,
  },
  
  musicPlayer: {
    ...mediaContainers.musicPlayer,
    backgroundColor: darkColors.surface,
    ...darkShadows.lg,
  },
  
  audioWaveform: {
    ...mediaContainers.audioWaveform,
    backgroundColor: darkColors.backgroundSecondary,
  },
  
  mediaControls: {
    ...mediaContainers.mediaControls,
    backgroundColor: darkColors.surface + 'E6', // 90% opacity
  },
  
  mediaQueue: {
    ...mediaContainers.mediaQueue,
    backgroundColor: darkColors.surface,
    ...darkShadows.sm,
  },
  
  formatTransition: {
    ...mediaContainers.formatTransition,
    backgroundColor: darkColors.backgroundSecondary,
    ...darkShadows.md,
  },
  
  // Algorithm-optimized containers
  feedZone: {
    ...algorithmOptimizedContainers.feedZone,
    backgroundColor: darkColors.background,
  },
  
  recommendationContainer: {
    ...algorithmOptimizedContainers.recommendationContainer,
    backgroundColor: darkColors.backgroundSecondary,
    borderLeftColor: darkColors.primary,
  },
  
  personalizationArea: {
    ...algorithmOptimizedContainers.personalizationArea,
    backgroundColor: darkColors.surface,
    ...darkShadows.sm,
  },
  
  engagementZone: {
    ...algorithmOptimizedContainers.engagementZone,
    borderTopColor: darkColors.border,
    backgroundColor: darkColors.backgroundSecondary,
  },
  
  contentPriority: {
    ...algorithmOptimizedContainers.contentPriority,
    backgroundColor: darkColors.surface,
    ...darkShadows.sm,
  },
  
  discoveryAlgorithm: {
    ...algorithmOptimizedContainers.discoveryAlgorithm,
    backgroundColor: darkColors.backgroundSecondary,
    borderColor: darkColors.border,
  },
});

// Theme-aware container getter
export const getContainerStyles = (isDark = false) => {
  const base = containerStyles;
  const dark = darkContainerStyles;
  
  return {
    // Screen containers
    screen: isDark ? dark.screen : base.screen,
    screenSafe: isDark ? dark.screenSafe : base.screenSafe,
    screenFull: isDark ? dark.screenFull : base.screenFull,
    screenModal: isDark ? dark.screenModal : base.screenModal,
    screenTabbed: isDark ? dark.screenTabbed : base.screenTabbed,
    screenScrollable: isDark ? dark.screenScrollable : base.screenScrollable,
    screenSplit: isDark ? dark.screenSplit : base.screenSplit,
    screenSplitLeft: base.screenSplitLeft,
    screenSplitRight: base.screenSplitRight,
    
    // Content containers
    content: isDark ? dark.content : base.content,
    contentConstrained: isDark ? dark.contentConstrained : base.contentConstrained,
    contentCentered: isDark ? dark.contentCentered : base.contentCentered,
    contentReading: base.contentReading,
    contentList: base.contentList,
    contentGrid: base.contentGrid,
    contentHeader: isDark ? dark.contentHeader : base.contentHeader,
    contentFooter: isDark ? dark.contentFooter : base.contentFooter,
    
    // Section containers
    section: base.section,
    sectionCard: isDark ? dark.sectionCard : base.sectionCard,
    sectionHighlight: isDark ? dark.sectionHighlight : base.sectionHighlight,
    sectionCompact: base.sectionCompact,
    sectionSpacious: base.sectionSpacious,
    sectionInline: base.sectionInline,
    sectionGroup: isDark ? dark.sectionGroup : base.sectionGroup,
    
    // Special containers
    loading: base.loading,
    error: base.error,
    empty: base.empty,
    overlay: isDark ? dark.overlay : base.overlay,
    backdrop: isDark ? dark.backdrop : base.backdrop,
    floating: base.floating,
    sticky: isDark ? dark.sticky : base.sticky,
    drawer: isDark ? dark.drawer : base.drawer,
    sidebar: isDark ? dark.sidebar : base.sidebar,
    
    // Progressive disclosure containers
    mysteryZone: base.mysteryZone,
    discoveryHint: isDark ? dark.discoveryHint : base.discoveryHint,
    progressiveReveal: isDark ? dark.progressiveReveal : base.progressiveReveal,
    explorationPrompt: isDark ? dark.explorationPrompt : base.explorationPrompt,
    gestureZone: base.gestureZone,
    tutorialOverlay: isDark ? dark.tutorialOverlay : base.tutorialOverlay,
    
    // AI collaboration containers
    aiAssistant: isDark ? dark.aiAssistant : base.aiAssistant,
    aiSuggestions: isDark ? dark.aiSuggestions : base.aiSuggestions,
    aiMultimodal: isDark ? dark.aiMultimodal : base.aiMultimodal,
    aiVoiceOverlay: isDark ? dark.aiVoiceOverlay : base.aiVoiceOverlay,
    aiCollaborativeSpace: isDark ? dark.aiCollaborativeSpace : base.aiCollaborativeSpace,
    aiThinking: isDark ? dark.aiThinking : base.aiThinking,
    
    // Creator economy containers
    creatorDashboard: isDark ? dark.creatorDashboard : base.creatorDashboard,
    analyticsContainer: isDark ? dark.analyticsContainer : base.analyticsContainer,
    revenueContainer: isDark ? dark.revenueContainer : base.revenueContainer,
    audienceInsights: isDark ? dark.audienceInsights : base.audienceInsights,
    contentManagement: isDark ? dark.contentManagement : base.contentManagement,
    publishingWorkflow: isDark ? dark.publishingWorkflow : base.publishingWorkflow,
    creatorShowcase: isDark ? dark.creatorShowcase : base.creatorShowcase,
    
    // Cross-device sync containers
    syncIndicator: isDark ? dark.syncIndicator : base.syncIndicator,
    continuationPrompt: isDark ? dark.continuationPrompt : base.continuationPrompt,
    deviceHandoff: isDark ? dark.deviceHandoff : base.deviceHandoff,
    progressSync: isDark ? dark.progressSync : base.progressSync,
    crossDeviceSettings: isDark ? dark.crossDeviceSettings : base.crossDeviceSettings,
    
    // Multi-format media containers
    storyReader: isDark ? dark.storyReader : base.storyReader,
    videoPlayer: base.videoPlayer, // Always black
    musicPlayer: isDark ? dark.musicPlayer : base.musicPlayer,
    audioWaveform: isDark ? dark.audioWaveform : base.audioWaveform,
    mediaControls: isDark ? dark.mediaControls : base.mediaControls,
    mediaQueue: isDark ? dark.mediaQueue : base.mediaQueue,
    formatTransition: isDark ? dark.formatTransition : base.formatTransition,
    
    // Algorithm-optimized containers
    feedZone: isDark ? dark.feedZone : base.feedZone,
    recommendationContainer: isDark ? dark.recommendationContainer : base.recommendationContainer,
    personalizationArea: isDark ? dark.personalizationArea : base.personalizationArea,
    engagementZone: isDark ? dark.engagementZone : base.engagementZone,
    contentPriority: isDark ? dark.contentPriority : base.contentPriority,
    discoveryAlgorithm: isDark ? dark.discoveryAlgorithm : base.discoveryAlgorithm,
    
    // Utility containers (same for both themes)
    rowCenter: base.rowCenter,
    rowBetween: base.rowBetween,
    rowAround: base.rowAround,
    columnCenter: base.columnCenter,
    columnBetween: base.columnBetween,
    wrap: base.wrap,
    absoluteFull: base.absoluteFull,
    relative: base.relative,
    hidden: base.hidden,
    visible: base.visible,
  };
};

// Export container constants for use in other files
export { containerConstants };

// Export individual style categories for granular imports
export const screenStyles = {
  screen: containerStyles.screen,
  screenSafe: containerStyles.screenSafe,
  screenFull: containerStyles.screenFull,
  screenModal: containerStyles.screenModal,
  screenTabbed: containerStyles.screenTabbed,
  screenScrollable: containerStyles.screenScrollable,
  screenSplit: containerStyles.screenSplit,
  screenSplitLeft: containerStyles.screenSplitLeft,
  screenSplitRight: containerStyles.screenSplitRight,
};

export const contentStyles = {
  content: containerStyles.content,
  contentConstrained: containerStyles.contentConstrained,
  contentCentered: containerStyles.contentCentered,
  contentReading: containerStyles.contentReading,
  contentList: containerStyles.contentList,
  contentGrid: containerStyles.contentGrid,
  contentHeader: containerStyles.contentHeader,
  contentFooter: containerStyles.contentFooter,
};

export const sectionStyles = {
  section: containerStyles.section,
  sectionCard: containerStyles.sectionCard,
  sectionHighlight: containerStyles.sectionHighlight,
  sectionCompact: containerStyles.sectionCompact,
  sectionSpacious: containerStyles.sectionSpacious,
  sectionInline: containerStyles.sectionInline,
  sectionGroup: containerStyles.sectionGroup,
};

// 31,847 characters