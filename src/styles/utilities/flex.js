// src/styles/utilities/flex.js
// Path: src/styles/utilities/flex.js

import { StyleSheet } from 'react-native';
import { 
  lightColors, 
  darkColors, 
  spacing, 
  typography,
  getShadows 
} from '../tokens';

/**
 * Flex utilities - comprehensive flexbox system
 * Covers all flexbox patterns for modern content platforms
 * Inspired by Design Research patterns and FAANG-level flex usage
 * Optimized for stories → videos → music content progression
 * 
 * Usage:
 * - Import specific utilities: flexStyles.row, flexStyles.center
 * - Theme-aware: use getFlexStyles(isDark) for proper styling
 * - Combine: [flexStyles.row, flexStyles.spaceBetween, flexStyles.itemsCenter]
 */

// Flex constants for consistent behavior
const flexConstants = {
  // Standard flex values
  flexValues: {
    none: 0,
    shrink: 0,
    grow: 1,
    full: 1,
    auto: 'auto',
  },
  
  // Gap values (when React Native supports gap)
  gaps: {
    none: 0,
    xs: spacing.extraSmall,    // 8px
    sm: spacing.small,         // 8px
    md: spacing.medium,        // 16px
    lg: spacing.large,         // 24px
    xl: spacing.xlarge,        // 32px
  },
  
  // Aspect ratios for flex items
  aspectRatios: {
    square: 1,          // 1:1
    video: 16/9,        // 16:9
    story: 9/16,        // 9:16 (vertical)
    card: 3/2,          // 3:2
    wide: 21/9,         // Ultrawide
  },
  
  // Performance thresholds
  performance: {
    maxFlexItems: 1000,         // Maximum items in flex container
    maxNestingDepth: 6,         // Maximum flex nesting
    minTouchTarget: 44,         // Minimum touch target size
  },
};

// ====================
// Core Flex Properties
// ====================

// Flex direction utilities
const flexDirection = {
  // Basic directions
  row: {
    flexDirection: 'row',
  },
  
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  
  column: {
    flexDirection: 'column',
  },
  
  columnReverse: {
    flexDirection: 'column-reverse',
  },
  
  // Responsive directions
  rowOnLarge: {
    flexDirection: 'column',
    // Would switch to row on larger screens
  },
  
  columnOnSmall: {
    flexDirection: 'row',
    // Would switch to column on smaller screens
  },
};

// Flex wrap utilities
const flexWrap = {
  noWrap: {
    flexWrap: 'nowrap',
  },
  
  wrap: {
    flexWrap: 'wrap',
  },
  
  wrapReverse: {
    flexWrap: 'wrap-reverse',
  },
  
  // Performance-optimized wrap
  wrapOptimized: {
    flexWrap: 'wrap',
    overflow: 'hidden',  // Prevent layout thrashing
  },
};

// Flex grow/shrink utilities
const flexGrowShrink = {
  // Grow utilities
  grow: {
    flexGrow: 1,
  },
  
  growNone: {
    flexGrow: 0,
  },
  
  grow2: {
    flexGrow: 2,
  },
  
  grow3: {
    flexGrow: 3,
  },
  
  // Shrink utilities
  shrink: {
    flexShrink: 1,
  },
  
  shrinkNone: {
    flexShrink: 0,
  },
  
  shrink2: {
    flexShrink: 2,
  },
  
  // Combined flex utilities
  flex1: {
    flex: 1,
  },
  
  flexAuto: {
    flex: 1,
    flexBasis: 'auto',
  },
  
  flexNone: {
    flex: 0,
    flexBasis: 'auto',
  },
  
  flexInitial: {
    flex: 0,
    flexBasis: 'auto',
    flexGrow: 0,
    flexShrink: 1,
  },
};

// Justify content utilities
const justifyContent = {
  // Standard justification
  justifyStart: {
    justifyContent: 'flex-start',
  },
  
  justifyEnd: {
    justifyContent: 'flex-end',
  },
  
  justifyCenter: {
    justifyContent: 'center',
  },
  
  justifyBetween: {
    justifyContent: 'space-between',
  },
  
  justifyAround: {
    justifyContent: 'space-around',
  },
  
  justifyEvenly: {
    justifyContent: 'space-evenly',
  },
  
  // Content-specific justification
  justifyContentStart: {
    justifyContent: 'flex-start',
  },
  
  justifyContentEnd: {
    justifyContent: 'flex-end',
  },
};

// Align items utilities
const alignItems = {
  // Standard alignment
  itemsStart: {
    alignItems: 'flex-start',
  },
  
  itemsEnd: {
    alignItems: 'flex-end',
  },
  
  itemsCenter: {
    alignItems: 'center',
  },
  
  itemsBaseline: {
    alignItems: 'baseline',
  },
  
  itemsStretch: {
    alignItems: 'stretch',
  },
  
  // Content-specific alignment
  itemsContentStart: {
    alignItems: 'flex-start',
  },
  
  itemsContentEnd: {
    alignItems: 'flex-end',
  },
};

// Align self utilities
const alignSelf = {
  selfAuto: {
    alignSelf: 'auto',
  },
  
  selfStart: {
    alignSelf: 'flex-start',
  },
  
  selfEnd: {
    alignSelf: 'flex-end',
  },
  
  selfCenter: {
    alignSelf: 'center',
  },
  
  selfBaseline: {
    alignSelf: 'baseline',
  },
  
  selfStretch: {
    alignSelf: 'stretch',
  },
};

// ====================
// Design Research Inspired Flex Patterns
// ====================

// News Feed flex patterns (Julie Zhuo's Facebook work)
const newsFeedFlexPatterns = {
  // Feed container
  feedContainer: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  
  // Feed item layout
  feedItem: {
    flexDirection: 'column',
    alignItems: 'stretch',
    marginBottom: spacing.medium,        // 16px
  },
  
  // Feed item header
  feedItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.medium,   // 16px
    paddingVertical: spacing.small,      // 8px
  },
  
  // Feed item content
  feedItemContent: {
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingHorizontal: spacing.medium,   // 16px
  },
  
  // Feed item actions
  feedItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.medium,   // 16px
    paddingVertical: spacing.small,      // 8px
  },
  
  // Engagement indicators
  engagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  
  // Algorithmic priority layout
  algorithmicPriority: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    // Higher priority items get more space
  },
};

// Progressive disclosure flex patterns (Snapchat mystery UX)
const progressiveDisclosureFlexPatterns = {
  // Mystery container
  mysteryContainer: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    position: 'relative',
    overflow: 'hidden',
  },
  
  // Discovery zone
  discoveryZone: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '15%',                        // 15% discovery zone
  },
  
  // Progressive reveal
  progressiveReveal: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,                          // Start hidden
    transform: [{ scale: 0.9 }],         // Slightly smaller
  },
  
  // Gesture response
  gestureResponse: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ scale: 1 }],           // Responsive to touch
  },
  
  // Exploration prompt
  explorationPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: spacing.large,               // 24px
    left: '50%',
    transform: [{ translateX: -50 }],
  },
  
  // Tutorial overlay
  tutorialOverlay: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  // Hidden feature container
  hiddenFeature: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    opacity: 0.6,                        // Partially visible
  },
};

// AI collaboration flex patterns (Jenny Blackburn research)
const aiCollaborationFlexPatterns = {
  // AI assistant layout
  aiAssistantLayout: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  
  // Main content area (human)
  humanContentArea: {
    flex: 2,                             // Takes 2/3 of space
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  
  // AI assistant panel
  aiAssistantPanel: {
    flex: 1,                             // Takes 1/3 of space
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    borderLeftWidth: 1,
    borderLeftColor: lightColors.border,
  },
  
  // Collaborative editing space
  collaborativeSpace: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  
  // AI suggestions overlay
  aiSuggestions: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '50%',                    // Don't overwhelm the interface
  },
  
  // Multimodal interaction
  multimodalInteraction: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  // Voice interaction overlay
  voiceInteraction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  
  // AI thinking indicator
  aiThinking: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
};

// Creator economy flex patterns (Spotify for Artists inspiration)
const creatorEconomyFlexPatterns = {
  // Creator dashboard layout
  creatorDashboard: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  
  // Analytics section
  analyticsSection: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  
  // Analytics card
  analyticsCard: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    flexBasis: '48%',                    // Two cards per row with gap
    minWidth: 200,                       // Minimum width for readability
  },
  
  // Revenue tracking
  revenueTracking: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  // Audience insights
  audienceInsights: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  
  // Content performance
  contentPerformance: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  
  // Creator tools
  creatorTools: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  
  // Monetization options
  monetizationOptions: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  
  // Creator profile showcase
  profileShowcase: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
};

// Cross-device sync flex patterns (Kindle inspiration)
const crossDeviceSyncFlexPatterns = {
  // Sync indicator layout
  syncIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: spacing.medium,                 // 16px
    right: spacing.medium,               // 16px
  },
  
  // Continuation prompt
  continuationPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  // Device handoff layout
  deviceHandoff: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Progress synchronization
  progressSync: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  // Multi-device settings
  multiDeviceSettings: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  
  // Cross-device content
  crossDeviceContent: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  
  // Seamless transition
  seamlessTransition: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ scale: 1 }],           // Animation ready
  },
};

// Multi-format media flex patterns (stories → videos → music)
const multiFormatMediaFlexPatterns = {
  // Story format layout
  storyFormat: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.large,    // 24px - reading optimized
  },
  
  // Video format layout
  videoFormat: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',          // Black for video
  },
  
  // Music format layout
  musicFormat: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  // Audio waveform layout
  audioWaveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,                       // Waveform height
  },
  
  // Media controls
  mediaControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  
  // Format transition
  formatTransition: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ scale: 1 }],           // Animation ready
  },
  
  // Mixed media layout
  mixedMediaLayout: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  
  // Adaptive format layout
  adaptiveFormat: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  
  // Media queue
  mediaQueue: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    maxHeight: 300,                      // Scrollable
  },
};

// ====================
// Common Flex Patterns
// ====================

// Layout patterns used across multiple contexts
const commonFlexPatterns = {
  // Center everything
  centerAll: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Header layout
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.medium,   // 16px
    paddingVertical: spacing.small,      // 8px
  },
  
  // Content area
  contentArea: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  
  // Footer layout
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.medium,   // 16px
    paddingVertical: spacing.small,      // 8px
  },
  
  // Card layout
  card: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  
  // List item
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.medium,   // 16px
    paddingVertical: spacing.small,      // 8px
    minHeight: flexConstants.performance.minTouchTarget, // 44px
  },
  
  // Split layout
  splitLayout: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  
  // Stacked layout
  stackedLayout: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  
  // Sidebar layout
  sidebarLayout: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  
  // Modal layout
  modalLayout: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
};

// ====================
// Responsive Flex Patterns
// ====================

// Flex patterns that adapt to different screen sizes
const responsiveFlexPatterns = {
  // Mobile-first responsive
  responsiveMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  
  // Tablet responsive
  responsiveTablet: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  
  // Desktop responsive
  responsiveDesktop: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    flexWrap: 'nowrap',
  },
  
  // Auto-responsive (adapts based on content)
  autoResponsive: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  
  // Responsive grid
  responsiveGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
};

// ====================
// Performance-Optimized Flex Patterns
// ====================

// Flex patterns optimized for performance
const performanceFlexPatterns = {
  // Virtualized list
  virtualizedList: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  
  // Efficient grid
  efficientGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    overflow: 'hidden',
  },
  
  // Lazy loading container
  lazyLoadingContainer: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    minHeight: 100,                      // Placeholder height
  },
  
  // Memory efficient
  memoryEfficient: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    maxHeight: 500,                      // Limit memory usage
    overflow: 'hidden',
  },
  
  // Animation optimized
  animationOptimized: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    transform: [{ translateZ: 0 }],      // Force hardware acceleration
  },
};

// Create StyleSheet
export const flexStyles = StyleSheet.create({
  // Core flex properties
  ...flexDirection,
  ...flexWrap,
  ...flexGrowShrink,
  ...justifyContent,
  ...alignItems,
  ...alignSelf,
  
  // Design research patterns
  ...newsFeedFlexPatterns,
  ...progressiveDisclosureFlexPatterns,
  ...aiCollaborationFlexPatterns,
  ...creatorEconomyFlexPatterns,
  ...crossDeviceSyncFlexPatterns,
  ...multiFormatMediaFlexPatterns,
  
  // Common patterns
  ...commonFlexPatterns,
  ...responsiveFlexPatterns,
  ...performanceFlexPatterns,
});

// Dark theme flex styles (minimal since flex is mostly layout)
const darkFlexStyles = StyleSheet.create({
  // AI assistant panel with dark theme
  aiAssistantPanel: {
    ...aiCollaborationFlexPatterns.aiAssistantPanel,
    borderLeftColor: darkColors.border,
  },
  
  // Creator dashboard with dark styling
  creatorDashboard: {
    ...creatorEconomyFlexPatterns.creatorDashboard,
    backgroundColor: darkColors.backgroundSecondary,
  },
  
  // Video format (always black)
  videoFormat: {
    ...multiFormatMediaFlexPatterns.videoFormat,
    backgroundColor: '#000000',
  },
});

// Theme-aware flex getter
export const getFlexStyles = (isDark = false) => {
  const base = flexStyles;
  const dark = darkFlexStyles;
  
  return {
    // Core flex properties (same for both themes)
    row: base.row,
    rowReverse: base.rowReverse,
    column: base.column,
    columnReverse: base.columnReverse,
    rowOnLarge: base.rowOnLarge,
    columnOnSmall: base.columnOnSmall,
    
    // Flex wrap
    noWrap: base.noWrap,
    wrap: base.wrap,
    wrapReverse: base.wrapReverse,
    wrapOptimized: base.wrapOptimized,
    
    // Flex grow/shrink
    grow: base.grow,
    growNone: base.growNone,
    grow2: base.grow2,
    grow3: base.grow3,
    shrink: base.shrink,
    shrinkNone: base.shrinkNone,
    shrink2: base.shrink2,
    flex1: base.flex1,
    flexAuto: base.flexAuto,
    flexNone: base.flexNone,
    flexInitial: base.flexInitial,
    
    // Justify content
    justifyStart: base.justifyStart,
    justifyEnd: base.justifyEnd,
    justifyCenter: base.justifyCenter,
    justifyBetween: base.justifyBetween,
    justifyAround: base.justifyAround,
    justifyEvenly: base.justifyEvenly,
    justifyContentStart: base.justifyContentStart,
    justifyContentEnd: base.justifyContentEnd,
    
    // Align items
    itemsStart: base.itemsStart,
    itemsEnd: base.itemsEnd,
    itemsCenter: base.itemsCenter,
    itemsBaseline: base.itemsBaseline,
    itemsStretch: base.itemsStretch,
    itemsContentStart: base.itemsContentStart,
    itemsContentEnd: base.itemsContentEnd,
    
    // Align self
    selfAuto: base.selfAuto,
    selfStart: base.selfStart,
    selfEnd: base.selfEnd,
    selfCenter: base.selfCenter,
    selfBaseline: base.selfBaseline,
    selfStretch: base.selfStretch,
    
    // News Feed patterns
    feedContainer: base.feedContainer,
    feedItem: base.feedItem,
    feedItemHeader: base.feedItemHeader,
    feedItemContent: base.feedItemContent,
    feedItemActions: base.feedItemActions,
    engagementRow: base.engagementRow,
    algorithmicPriority: base.algorithmicPriority,
    
    // Progressive disclosure patterns
    mysteryContainer: base.mysteryContainer,
    discoveryZone: base.discoveryZone,
    progressiveReveal: base.progressiveReveal,
    gestureResponse: base.gestureResponse,
    explorationPrompt: base.explorationPrompt,
    tutorialOverlay: base.tutorialOverlay,
    hiddenFeature: base.hiddenFeature,
    
    // AI collaboration patterns (theme-aware)
    aiAssistantLayout: base.aiAssistantLayout,
    humanContentArea: base.humanContentArea,
    aiAssistantPanel: isDark ? dark.aiAssistantPanel : base.aiAssistantPanel,
    collaborativeSpace: base.collaborativeSpace,
    aiSuggestions: base.aiSuggestions,
    multimodalInteraction: base.multimodalInteraction,
    voiceInteraction: base.voiceInteraction,
    aiThinking: base.aiThinking,
    
    // Creator economy patterns (theme-aware)
    creatorDashboard: isDark ? dark.creatorDashboard : base.creatorDashboard,
    analyticsSection: base.analyticsSection,
    analyticsCard: base.analyticsCard,
    revenueTracking: base.revenueTracking,
    audienceInsights: base.audienceInsights,
    contentPerformance: base.contentPerformance,
    creatorTools: base.creatorTools,
    monetizationOptions: base.monetizationOptions,
    profileShowcase: base.profileShowcase,
    
    // Cross-device sync patterns
    syncIndicator: base.syncIndicator,
    continuationPrompt: base.continuationPrompt,
    deviceHandoff: base.deviceHandoff,
    progressSync: base.progressSync,
    multiDeviceSettings: base.multiDeviceSettings,
    crossDeviceContent: base.crossDeviceContent,
    seamlessTransition: base.seamlessTransition,
    
    // Multi-format media patterns (theme-aware)
    storyFormat: base.storyFormat,
    videoFormat: isDark ? dark.videoFormat : base.videoFormat,
    musicFormat: base.musicFormat,
    audioWaveform: base.audioWaveform,
    mediaControls: base.mediaControls,
    formatTransition: base.formatTransition,
    mixedMediaLayout: base.mixedMediaLayout,
    adaptiveFormat: base.adaptiveFormat,
    mediaQueue: base.mediaQueue,
    
    // Common patterns
    centerAll: base.centerAll,
    header: base.header,
    contentArea: base.contentArea,
    footer: base.footer,
    card: base.card,
    listItem: base.listItem,
    splitLayout: base.splitLayout,
    stackedLayout: base.stackedLayout,
    sidebarLayout: base.sidebarLayout,
    modalLayout: base.modalLayout,
    
    // Responsive patterns
    responsiveMobile: base.responsiveMobile,
    responsiveTablet: base.responsiveTablet,
    responsiveDesktop: base.responsiveDesktop,
    autoResponsive: base.autoResponsive,
    responsiveGrid: base.responsiveGrid,
    
    // Performance patterns
    virtualizedList: base.virtualizedList,
    efficientGrid: base.efficientGrid,
    lazyLoadingContainer: base.lazyLoadingContainer,
    memoryEfficient: base.memoryEfficient,
    animationOptimized: base.animationOptimized,
  };
};

// Export flex constants for use in other files
export { flexConstants };

// Export individual style categories for granular imports
export const coreFlexStyles = {
  row: flexStyles.row,
  rowReverse: flexStyles.rowReverse,
  column: flexStyles.column,
  columnReverse: flexStyles.columnReverse,
  wrap: flexStyles.wrap,
  noWrap: flexStyles.noWrap,
  grow: flexStyles.grow,
  shrink: flexStyles.shrink,
  flex1: flexStyles.flex1,
  justifyCenter: flexStyles.justifyCenter,
  justifyBetween: flexStyles.justifyBetween,
  itemsCenter: flexStyles.itemsCenter,
  itemsStretch: flexStyles.itemsStretch,
};

export const designResearchFlexStyles = {
  // News Feed
  feedContainer: flexStyles.feedContainer,
  feedItem: flexStyles.feedItem,
  feedItemHeader: flexStyles.feedItemHeader,
  
  // Progressive disclosure
  mysteryContainer: flexStyles.mysteryContainer,
  discoveryZone: flexStyles.discoveryZone,
  progressiveReveal: flexStyles.progressiveReveal,
  
  // AI collaboration
  aiAssistantLayout: flexStyles.aiAssistantLayout,
  collaborativeSpace: flexStyles.collaborativeSpace,
  aiSuggestions: flexStyles.aiSuggestions,
  
  // Creator economy
  creatorDashboard: flexStyles.creatorDashboard,
  analyticsSection: flexStyles.analyticsSection,
  revenueTracking: flexStyles.revenueTracking,
  
  // Cross-device sync
  syncIndicator: flexStyles.syncIndicator,
  continuationPrompt: flexStyles.continuationPrompt,
  deviceHandoff: flexStyles.deviceHandoff,
  
  // Multi-format media
  storyFormat: flexStyles.storyFormat,
  videoFormat: flexStyles.videoFormat,
  musicFormat: flexStyles.musicFormat,
};

export const commonFlexStyles = {
  centerAll: flexStyles.centerAll,
  header: flexStyles.header,
  contentArea: flexStyles.contentArea,
  footer: flexStyles.footer,
  card: flexStyles.card,
  listItem: flexStyles.listItem,
  splitLayout: flexStyles.splitLayout,
  stackedLayout: flexStyles.stackedLayout,
};

// Utility functions for flex calculations
export const flexUtils = {
  // Calculate flex basis for responsive items
  calculateFlexBasis: (itemCount, columns) => {
    const percentage = (100 / columns) - 2; // Account for margins
    return `${percentage}%`;
  },
  
  // Get optimal flex direction for screen size
  getOptimalDirection: (screenWidth, threshold = 768) => {
    return screenWidth >= threshold ? 'row' : 'column';
  },
  
  // Create responsive flex style
  createResponsiveFlex: (mobileDirection, desktopDirection) => {
    return {
      flexDirection: mobileDirection,
      // Would use media queries in web or responsive hooks in React Native
    };
  },
  
  // Calculate optimal flex grow values
  calculateFlexGrow: (priority) => {
    const growValues = {
      low: 0.5,
      normal: 1,
      high: 2,
      priority: 3,
    };
    return growValues[priority] || 1;
  },
  
  // Create safe flex container (prevents overflow)
  createSafeFlexContainer: (direction = 'column') => {
    return {
      flexDirection: direction,
      alignItems: 'stretch',
      justifyContent: 'flex-start',
      overflow: 'hidden',
      minHeight: 0, // Prevents flex item from overflowing
      minWidth: 0,
    };
  },
  
  // Create performance-optimized flex item
  createOptimizedFlexItem: (flexValue = 1) => {
    return {
      flex: flexValue,
      minHeight: 0,
      minWidth: 0,
      // Enable hardware acceleration for animations
      transform: [{ translateZ: 0 }],
    };
  },
};

// 39,142 characters