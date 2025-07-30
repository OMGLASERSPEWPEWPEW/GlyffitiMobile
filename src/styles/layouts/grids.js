// src/styles/layouts/grids.js
// Path: src/styles/layouts/grids.js

import { StyleSheet, Dimensions } from 'react-native';
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
 * Grid styles - comprehensive grid layout system
 * Flexbox-based grid systems for React Native
 * Uses design tokens for consistency and theming support
 * 
 * Usage:
 * - Import specific styles: gridStyles.container, gridStyles.item
 * - Theme-aware: use getGridStyles(isDark) for proper colors
 * - Combine: [gridStyles.container, gridStyles.twoColumn, gridStyles.gapped]
 */

// Get screen dimensions for responsive calculations
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Grid constants
const gridConstants = {
  // Breakpoints (for responsive behavior)
  breakpoints: {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
    wide: 1200,
  },
  
  // Standard column counts
  columns: {
    mobile: 1,      // Single column on mobile
    tablet: 2,      // Two columns on tablet
    desktop: 3,     // Three columns on desktop
    wide: 4,        // Four columns on wide screens
  },
  
  // Grid gutters (spacing between items)
  gutters: {
    none: 0,
    tight: spacing.extraSmall,    // 8px
    normal: spacing.small,        // 8px
    comfortable: spacing.medium,  // 16px
    spacious: spacing.large,      // 24px
    loose: spacing.xlarge,        // 32px
  },
  
  // Aspect ratios for grid items
  aspectRatios: {
    square: 1,          // 1:1
    landscape: 1.5,     // 3:2
    portrait: 0.75,     // 3:4
    wide: 1.77,         // 16:9
    card: 1.4,          // Standard card ratio
    story: 0.5625,     // 9:16 (story/mobile)
  },
  
  // Minimum item sizes
  minItemWidth: 120,    // Minimum grid item width
  minItemHeight: 80,    // Minimum grid item height
  
  // Maximum items per row
  maxItemsPerRow: 6,
};

// Base grid container styles
const baseGridContainer = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
};

// Grid container variants
const gridContainers = {
  // Standard grid container
  container: {
    ...baseGridContainer,
  },
  
  // Auto-sizing grid (items size themselves)
  containerAuto: {
    ...baseGridContainer,
    justifyContent: 'space-between',
  },
  
  // Centered grid
  containerCentered: {
    ...baseGridContainer,
    justifyContent: 'center',
  },
  
  // Evenly spaced grid
  containerEvenly: {
    ...baseGridContainer,
    justifyContent: 'space-evenly',
  },
  
  // Right-aligned grid
  containerRight: {
    ...baseGridContainer,
    justifyContent: 'flex-end',
  },
  
  // Vertical grid (column layout)
  containerVertical: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  
  // Masonry-style grid (staggered heights)
  containerMasonry: {
    ...baseGridContainer,
    alignItems: 'flex-start',
  },
  
  // Dense grid (fills gaps)
  containerDense: {
    ...baseGridContainer,
    alignItems: 'stretch',
  },
  
  // Uniform grid (all items same size)
  containerUniform: {
    ...baseGridContainer,
    alignItems: 'stretch',
  },
};

// Gutter variants (spacing between items)
const gutterVariants = {
  // No spacing
  gapNone: {
    marginHorizontal: 0,
    marginVertical: 0,
  },
  
  // Tight spacing
  gapTight: {
    marginHorizontal: -gridConstants.gutters.tight / 2,    // -4px
    marginVertical: -gridConstants.gutters.tight / 2,      // -4px
  },
  
  // Normal spacing
  gapNormal: {
    marginHorizontal: -gridConstants.gutters.normal / 2,   // -4px
    marginVertical: -gridConstants.gutters.normal / 2,     // -4px
  },
  
  // Comfortable spacing
  gapComfortable: {
    marginHorizontal: -gridConstants.gutters.comfortable / 2,  // -8px
    marginVertical: -gridConstants.gutters.comfortable / 2,    // -8px
  },
  
  // Spacious spacing
  gapSpacious: {
    marginHorizontal: -gridConstants.gutters.spacious / 2,     // -12px
    marginVertical: -gridConstants.gutters.spacious / 2,       // -12px
  },
  
  // Loose spacing
  gapLoose: {
    marginHorizontal: -gridConstants.gutters.loose / 2,        // -16px
    marginVertical: -gridConstants.gutters.loose / 2,          // -16px
  },
};

// Column layout variants
const columnLayouts = {
  // Single column (mobile default)
  oneColumn: {
    // Container gets full width, items get 100%
  },
  
  // Two columns
  twoColumn: {
    // Items will be 50% width minus gutters
  },
  
  // Three columns
  threeColumn: {
    // Items will be 33.33% width minus gutters
  },
  
  // Four columns
  fourColumn: {
    // Items will be 25% width minus gutters
  },
  
  // Five columns
  fiveColumn: {
    // Items will be 20% width minus gutters
  },
  
  // Six columns
  sixColumn: {
    // Items will be 16.66% width minus gutters
  },
  
  // Auto columns (fit as many as possible)
  autoColumn: {
    // Items size based on content and min width
  },
};

// Grid item base styles
const baseGridItem = {
  flexShrink: 0,
  flexGrow: 0,
};

// Grid item variants
const gridItems = {
  // Basic grid item
  item: {
    ...baseGridItem,
  },
  
  // Full width item (spans all columns)
  itemFull: {
    ...baseGridItem,
    flexBasis: '100%',
    width: '100%',
  },
  
  // Half width item
  itemHalf: {
    ...baseGridItem,
    flexBasis: '50%',
    width: '50%',
  },
  
  // Third width item
  itemThird: {
    ...baseGridItem,
    flexBasis: '33.333%',
    width: '33.333%',
  },
  
  // Quarter width item
  itemQuarter: {
    ...baseGridItem,
    flexBasis: '25%',
    width: '25%',
  },
  
  // Two thirds width item
  itemTwoThirds: {
    ...baseGridItem,
    flexBasis: '66.666%',
    width: '66.666%',
  },
  
  // Three quarters width item
  itemThreeQuarters: {
    ...baseGridItem,
    flexBasis: '75%',
    width: '75%',
  },
  
  // Auto sizing item (content-based)
  itemAuto: {
    ...baseGridItem,
    flexBasis: 'auto',
    flexGrow: 1,
  },
  
  // Fixed size items (common sizes)
  itemSmall: {
    ...baseGridItem,
    width: 80,
    height: 80,
  },
  
  itemMedium: {
    ...baseGridItem,
    width: 120,
    height: 120,
  },
  
  itemLarge: {
    ...baseGridItem,
    width: 160,
    height: 160,
  },
  
  // Square aspect ratio items
  itemSquare: {
    ...baseGridItem,
    aspectRatio: gridConstants.aspectRatios.square,
  },
  
  // Landscape aspect ratio items
  itemLandscape: {
    ...baseGridItem,
    aspectRatio: gridConstants.aspectRatios.landscape,
  },
  
  // Portrait aspect ratio items
  itemPortrait: {
    ...baseGridItem,
    aspectRatio: gridConstants.aspectRatios.portrait,
  },
  
  // Wide aspect ratio items (video/banner)
  itemWide: {
    ...baseGridItem,
    aspectRatio: gridConstants.aspectRatios.wide,
  },
  
  // Story aspect ratio items
  itemStory: {
    ...baseGridItem,
    aspectRatio: gridConstants.aspectRatios.story,
  },
};

// Grid item spacing (margins for gutters)
const itemSpacing = {
  // No spacing
  spacingNone: {
    margin: 0,
  },
  
  // Tight spacing
  spacingTight: {
    marginHorizontal: gridConstants.gutters.tight / 2,     // 4px
    marginVertical: gridConstants.gutters.tight / 2,       // 4px
  },
  
  // Normal spacing
  spacingNormal: {
    marginHorizontal: gridConstants.gutters.normal / 2,    // 4px
    marginVertical: gridConstants.gutters.normal / 2,      // 4px
  },
  
  // Comfortable spacing
  spacingComfortable: {
    marginHorizontal: gridConstants.gutters.comfortable / 2,  // 8px
    marginVertical: gridConstants.gutters.comfortable / 2,    // 8px
  },
  
  // Spacious spacing
  spacingSpacious: {
    marginHorizontal: gridConstants.gutters.spacious / 2,     // 12px
    marginVertical: gridConstants.gutters.spacious / 2,       // 12px
  },
  
  // Loose spacing
  spacingLoose: {
    marginHorizontal: gridConstants.gutters.loose / 2,        // 16px
    marginVertical: gridConstants.gutters.loose / 2,          // 16px
  },
};

// Responsive grid systems
const responsiveGrids = {
  // Responsive container (adapts to screen size)
  responsive: {
    ...baseGridContainer,
  },
  
  // Mobile-first responsive
  responsiveMobile: {
    ...baseGridContainer,
    // Single column by default
  },
  
  // Tablet responsive
  responsiveTablet: {
    ...baseGridContainer,
    // Two columns on tablet and up
  },
  
  // Desktop responsive
  responsiveDesktop: {
    ...baseGridContainer,
    // Three columns on desktop and up
  },
  
  // Card grid (responsive cards)
  cardGrid: {
    ...baseGridContainer,
    justifyContent: 'space-between',
  },
  
  // List grid (vertical list with optional columns)
  listGrid: {
    flexDirection: 'column',
  },
  
  // Gallery grid (photo gallery style)
  galleryGrid: {
    ...baseGridContainer,
    alignItems: 'flex-start',
  },
  
  // Feed grid (social media feed style)
  feedGrid: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
};

// Calculate responsive item widths
const calculateItemWidth = (columns, gutter = gridConstants.gutters.normal) => {
  const availableWidth = screenWidth - (gutter * (columns + 1));
  return availableWidth / columns;
};

// Generate responsive item styles
const generateResponsiveItems = () => {
  const responsiveItems = {};
  
  // Generate for different column counts
  [1, 2, 3, 4, 5, 6].forEach(columnCount => {
    // Calculate width for each gutter size
    Object.keys(gridConstants.gutters).forEach(gutterKey => {
      const gutter = gridConstants.gutters[gutterKey];
      const itemWidth = calculateItemWidth(columnCount, gutter);
      
      responsiveItems[`item${columnCount}Col${gutterKey.charAt(0).toUpperCase() + gutterKey.slice(1)}`] = {
        ...baseGridItem,
        width: itemWidth,
        flexBasis: itemWidth,
      };
    });
  });
  
  return responsiveItems;
};

// Special grid patterns
const specialGrids = {
  // Staggered grid (alternating sizes)
  staggered: {
    ...baseGridContainer,
  },
  
  // Mosaic grid (varied sizes like Pinterest)
  mosaic: {
    ...baseGridContainer,
    alignItems: 'flex-start',
  },
  
  // Bento grid (dashboard style)
  bento: {
    ...baseGridContainer,
    alignItems: 'stretch',
  },
  
  // Timeline grid (chronological layout)
  timeline: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  
  // Carousel grid (horizontal scrolling)
  carousel: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'nowrap',
  },
  
  // Infinite grid (for virtualization)
  infinite: {
    ...baseGridContainer,
  },
};

// Progressive disclosure grids (Snapchat mystery UX inspiration)
const progressiveDisclosureGrids = {
  // Mystery grid (content reveals through interaction)
  mysteryGrid: {
    ...baseGridContainer,
    position: 'relative',
  },
  
  // Exploration grid (discovers content through gestures)
  explorationGrid: {
    ...baseGridContainer,
    overflow: 'hidden',
  },
  
  // Reveal on scroll grid
  revealOnScrollGrid: {
    ...baseGridContainer,
    opacity: 0.3,                             // Start dimmed
  },
  
  // Gesture-activated grid
  gestureGrid: {
    ...baseGridContainer,
    transform: [{ scale: 0.95 }],             // Slightly smaller until interaction
  },
  
  // Hidden content grid (swipe to reveal)
  hiddenContentGrid: {
    ...baseGridContainer,
    position: 'relative',
  },
  
  // Progressive load grid (loads more on interaction)
  progressiveLoadGrid: {
    ...baseGridContainer,
    alignItems: 'flex-start',
  },
  
  // Discovery hint grid
  discoveryHintGrid: {
    ...baseGridContainer,
    position: 'relative',
  },
};

// AI-curated grids (Jenny Blackburn research inspired)
const aiCuratedGrids = {
  // AI recommendation grid
  aiRecommendationGrid: {
    ...baseGridContainer,
    backgroundColor: lightColors.backgroundSecondary,
    borderRadius: borderRadius.card,          // 12px
    padding: spacing.small,                   // 8px
    ...shadows.sm,
  },
  
  // Personalized content grid
  personalizedGrid: {
    ...baseGridContainer,
    padding: spacing.small,                   // 8px
  },
  
  // AI-optimized layout grid
  aiOptimizedGrid: {
    ...baseGridContainer,
    justifyContent: 'space-between',          // AI determines optimal spacing
  },
  
  // Smart priority grid (AI prioritizes content)
  smartPriorityGrid: {
    ...baseGridContainer,
    alignItems: 'flex-start',
  },
  
  // Adaptive learning grid
  adaptiveLearningGrid: {
    ...baseGridContainer,
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.medium,        // 8px
    padding: spacing.extraSmall,              // 8px
  },
  
  // Collaborative filtering grid
  collaborativeFilteringGrid: {
    ...baseGridContainer,
    borderWidth: borderWidth.hairline,        // 0.5px
    borderColor: lightColors.primary,
    borderRadius: borderRadius.card,          // 12px
    padding: spacing.small,                   // 8px
  },
  
  // AI suggestion overlay grid
  aiSuggestionGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    ...baseGridContainer,
    backgroundColor: lightColors.overlay,
    zIndex: 100,
  },
};

// Creator economy grids (Spotify for Artists inspiration)
const creatorEconomyGrids = {
  // Creator showcase grid
  creatorShowcaseGrid: {
    ...baseGridContainer,
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.card,          // 12px
    padding: spacing.medium,                  // 16px
    ...shadows.md,
  },
  
  // Analytics data grid
  analyticsGrid: {
    ...baseGridContainer,
    backgroundColor: lightColors.backgroundSecondary,
    borderRadius: borderRadius.small,         // 4px
    padding: spacing.small,                   // 8px
  },
  
  // Revenue tracking grid
  revenueGrid: {
    ...baseGridContainer,
    backgroundColor: lightColors.surface,
    borderLeftWidth: borderWidth.thick,       // 3px
    borderLeftColor: lightColors.success,
    padding: spacing.medium,                  // 16px
    ...shadows.sm,
  },
  
  // Audience insight grid
  audienceGrid: {
    ...baseGridContainer,
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.card,          // 12px
    padding: spacing.medium,                  // 16px
    ...shadows.sm,
  },
  
  // Content performance grid
  performanceGrid: {
    ...baseGridContainer,
    backgroundColor: lightColors.backgroundSecondary,
    borderRadius: borderRadius.medium,        // 8px
    padding: spacing.small,                   // 8px
    borderWidth: borderWidth.hairline,        // 0.5px
    borderColor: lightColors.border,
  },
  
  // Monetization opportunity grid
  monetizationGrid: {
    ...baseGridContainer,
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.card,          // 12px
    padding: spacing.large,                   // 24px
    borderTopWidth: borderWidth.medium,       // 2px
    borderTopColor: lightColors.warning,
    ...shadows.lg,
  },
  
  // Creator collaboration grid
  collaborationGrid: {
    ...baseGridContainer,
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.card,          // 12px
    padding: spacing.medium,                  // 16px
    borderWidth: borderWidth.thin,            // 1px
    borderColor: lightColors.primary,
    ...shadows.sm,
  },
};

// Cross-device sync grids (Kindle inspiration)
const crossDeviceSyncGrids = {
  // Synchronized position grid
  syncPositionGrid: {
    ...baseGridContainer,
    position: 'relative',
  },
  
  // Cross-device continuation grid
  continuationGrid: {
    ...baseGridContainer,
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.card,          // 12px
    padding: spacing.medium,                  // 16px
    borderLeftWidth: borderWidth.thick,       // 3px
    borderLeftColor: lightColors.primary,
    ...shadows.sm,
  },
  
  // Device handoff grid
  handoffGrid: {
    ...baseGridContainer,
    backgroundColor: lightColors.backgroundSecondary,
    borderRadius: borderRadius.medium,        // 8px
    padding: spacing.small,                   // 8px
    position: 'relative',
  },
  
  // Progress sync indicator grid
  progressSyncGrid: {
    ...baseGridContainer,
    borderTopWidth: borderWidth.medium,       // 2px
    borderTopColor: lightColors.primary,
    paddingTop: spacing.small,                // 8px
  },
  
  // Multi-device layout grid
  multiDeviceGrid: {
    ...baseGridContainer,
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.card,          // 12px
    padding: spacing.medium,                  // 16px
    ...shadows.sm,
  },
  
  // Seamless transition grid
  transitionGrid: {
    ...baseGridContainer,
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.large,         // 12px
    padding: spacing.large,                   // 24px
    ...shadows.md,
  },
};

// Multi-format media grids (stories → videos → music)
const multiFormatMediaGrids = {
  // Story format grid
  storyFormatGrid: {
    ...baseGridContainer,
    backgroundColor: lightColors.background,
    paddingHorizontal: spacing.large,         // 24px - reading optimized
  },
  
  // Video format grid
  videoFormatGrid: {
    ...baseGridContainer,
    backgroundColor: '#000000',               // Black background for video
    borderRadius: borderRadius.card,          // 12px
    overflow: 'hidden',
  },
  
  // Music format grid
  musicFormatGrid: {
    ...baseGridContainer,
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.card,          // 12px
    padding: spacing.medium,                  // 16px
    ...shadows.lg,
  },
  
  // Audio waveform grid
  audioWaveformGrid: {
    ...baseGridContainer,
    backgroundColor: lightColors.backgroundSecondary,
    borderRadius: borderRadius.small,         // 4px
    padding: spacing.small,                   // 8px
    minHeight: 60,                            // Waveform height
  },
  
  // Mixed media grid (handles all formats)
  mixedMediaGrid: {
    ...baseGridContainer,
    backgroundColor: lightColors.background,
    position: 'relative',
  },
  
  // Format transition grid
  formatTransitionGrid: {
    ...baseGridContainer,
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.card,          // 12px
    padding: spacing.medium,                  // 16px
    ...shadows.md,
    transform: [{ scale: 1 }],                // Animation ready
  },
  
  // Adaptive format grid (changes based on content)
  adaptiveFormatGrid: {
    ...baseGridContainer,
    backgroundColor: lightColors.background,
    borderRadius: borderRadius.medium,        // 8px
    padding: spacing.small,                   // 8px
  },
};

// Algorithm-optimized grids (News Feed patterns)
const algorithmOptimizedGrids = {
  // News Feed style grid
  newsFeedGrid: {
    ...baseGridContainer,
    backgroundColor: lightColors.background,
    paddingHorizontal: spacing.small,         // 8px - tight for feed
  },
  
  // Engagement optimized grid
  engagementGrid: {
    ...baseGridContainer,
    backgroundColor: lightColors.backgroundSecondary,
    borderRadius: borderRadius.card,          // 12px
    padding: spacing.medium,                  // 16px
    ...shadows.sm,
  },
  
  // Algorithmic priority grid
  algorithmicPriorityGrid: {
    ...baseGridContainer,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  
  // User behavior optimized grid
  behaviorOptimizedGrid: {
    ...baseGridContainer,
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.medium,        // 8px
    padding: spacing.small,                   // 8px
  },
  
  // Viral content grid
  viralContentGrid: {
    ...baseGridContainer,
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.card,          // 12px
    padding: spacing.medium,                  // 16px
    borderTopWidth: borderWidth.medium,       // 2px
    borderTopColor: lightColors.secondary,
    ...shadows.lg,
  },
  
  // Trending content grid
  trendingGrid: {
    ...baseGridContainer,
    backgroundColor: lightColors.backgroundSecondary,
    borderRadius: borderRadius.card,          // 12px
    padding: spacing.medium,                  // 16px
    borderWidth: borderWidth.thin,            // 1px
    borderColor: lightColors.primary,
    ...shadows.md,
  },
  
  // Personalization grid
  personalizationGrid: {
    ...baseGridContainer,
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.large,         // 12px
    padding: spacing.large,                   // 24px
    ...shadows.sm,
  },
  
  // Discovery algorithm grid
  discoveryAlgorithmGrid: {
    ...baseGridContainer,
    backgroundColor: lightColors.backgroundSecondary,
    borderRadius: borderRadius.card,          // 12px
    padding: spacing.medium,                  // 16px
    borderLeftWidth: borderWidth.thick,       // 3px
    borderLeftColor: lightColors.accent,
  },
};

// Grid content styles
const gridContent = {
  // Grid with cards
  cardContent: {
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.card,        // 12px
    padding: spacing.medium,               // 16px
    ...shadows.sm,
  },
  
  // Grid with images
  imageContent: {
    borderRadius: borderRadius.image,      // 8px
    overflow: 'hidden',
    backgroundColor: lightColors.surfaceSecondary,
  },
  
  // Grid with text content
  textContent: {
    padding: spacing.small,                // 8px
  },
  
  // Grid with interactive content
  interactiveContent: {
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.card,       // 12px
    padding: spacing.medium,              // 16px
    ...shadows.sm,
    // Touch feedback will be added via activeOpacity
  },
  
  // Grid with media content
  mediaContent: {
    backgroundColor: lightColors.surfaceSecondary,
    borderRadius: borderRadius.image,     // 8px
    overflow: 'hidden',
    aspectRatio: gridConstants.aspectRatios.landscape,
  },
  
  // Grid with overlay content
  overlayContent: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: borderRadius.card,      // 12px
  },
  
  overlayContentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: lightColors.overlay,
    paddingHorizontal: spacing.small,     // 8px
    paddingVertical: spacing.extraSmall,  // 8px
  },
  
  // Progressive disclosure content
  mysteryContent: {
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.card,      // 12px
    padding: spacing.medium,              // 16px
    opacity: 0.7,                         // Partially hidden
    transform: [{ scale: 0.95 }],         // Slightly smaller
  },
  
  discoveryContent: {
    backgroundColor: lightColors.backgroundSecondary,
    borderRadius: borderRadius.medium,    // 8px
    padding: spacing.small,               // 8px
    borderWidth: borderWidth.hairline,    // 0.5px
    borderColor: lightColors.primary,
  },
  
  // AI-curated content
  aiRecommendedContent: {
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.card,      // 12px
    padding: spacing.medium,              // 16px
    borderTopWidth: borderWidth.medium,   // 2px
    borderTopColor: lightColors.accent,
    ...shadows.sm,
  },
  
  personalizedContent: {
    backgroundColor: lightColors.backgroundSecondary,
    borderRadius: borderRadius.medium,    // 8px
    padding: spacing.small,               // 8px
    borderLeftWidth: borderWidth.thin,    // 1px
    borderLeftColor: lightColors.primary,
  },
  
  // Creator economy content
  creatorContent: {
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.card,      // 12px
    padding: spacing.large,               // 24px
    borderWidth: borderWidth.thin,        // 1px
    borderColor: lightColors.border,
    ...shadows.md,
  },
  
  analyticsContent: {
    backgroundColor: lightColors.backgroundSecondary,
    borderRadius: borderRadius.small,     // 4px
    padding: spacing.medium,              // 16px
    borderTopWidth: borderWidth.medium,   // 2px
    borderTopColor: lightColors.success,
  },
  
  // Cross-device content
  syncedContent: {
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.card,      // 12px
    padding: spacing.medium,              // 16px
    borderLeftWidth: borderWidth.thick,   // 3px
    borderLeftColor: lightColors.primary,
    ...shadows.sm,
  },
  
  handoffContent: {
    backgroundColor: lightColors.backgroundSecondary,
    borderRadius: borderRadius.medium,    // 8px
    padding: spacing.small,               // 8px
    borderWidth: borderWidth.hairline,    // 0.5px
    borderColor: lightColors.border,
  },
  
  // Multi-format content
  storyContent: {
    backgroundColor: lightColors.background,
    borderRadius: borderRadius.medium,    // 8px
    padding: spacing.large,               // 24px
    maxWidth: gridConstants.aspectRatios.story * 400, // Reading width
  },
  
  videoContent: {
    backgroundColor: '#000000',           // Black for video
    borderRadius: borderRadius.card,      // 12px
    overflow: 'hidden',
    aspectRatio: gridConstants.aspectRatios.landscape,
  },
  
  musicContent: {
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.card,      // 12px
    padding: spacing.medium,              // 16px
    aspectRatio: gridConstants.aspectRatios.square,
    ...shadows.lg,
  },
  
  // Algorithm-optimized content
  feedContent: {
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.card,      // 12px
    padding: spacing.medium,              // 16px
    marginBottom: spacing.small,          // 8px
    ...shadows.sm,
  },
  
  trendingContent: {
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.card,      // 12px
    padding: spacing.medium,              // 16px
    borderTopWidth: borderWidth.medium,   // 2px
    borderTopColor: lightColors.warning,
    ...shadows.md,
  },
  
  viralContent: {
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.card,      // 12px
    padding: spacing.large,               // 24px
    borderWidth: borderWidth.medium,      // 2px
    borderColor: lightColors.secondary,
    ...shadows.lg,
  },
};

// Create StyleSheet
export const gridStyles = StyleSheet.create({
  // Grid containers
  ...gridContainers,
  
  // Gutter variants
  ...gutterVariants,
  
  // Column layouts
  ...columnLayouts,
  
  // Grid items
  ...gridItems,
  
  // Item spacing
  ...itemSpacing,
  
  // Responsive grids
  ...responsiveGrids,
  
  // Special grids
  ...specialGrids,
  
  // Progressive disclosure grids
  ...progressiveDisclosureGrids,
  
  // AI-curated grids
  ...aiCuratedGrids,
  
  // Creator economy grids
  ...creatorEconomyGrids,
  
  // Cross-device sync grids
  ...crossDeviceSyncGrids,
  
  // Multi-format media grids
  ...multiFormatMediaGrids,
  
  // Algorithm-optimized grids
  ...algorithmOptimizedGrids,
  
  // Grid content
  ...gridContent,
  
  // Add generated responsive items
  ...generateResponsiveItems(),
});

// Dark theme grid styles
const darkGridStyles = StyleSheet.create({
  // Content styles for dark theme
  cardContent: {
    ...gridContent.cardContent,
    backgroundColor: darkColors.surface,
    ...darkShadows.sm,
  },
  
  imageContent: {
    ...gridContent.imageContent,
    backgroundColor: darkColors.surfaceSecondary,
  },
  
  interactiveContent: {
    ...gridContent.interactiveContent,
    backgroundColor: darkColors.surface,
    ...darkShadows.sm,
  },
  
  mediaContent: {
    ...gridContent.mediaContent,
    backgroundColor: darkColors.surfaceSecondary,
  },
  
  overlayContent: {
    ...gridContent.overlayContent,
  },
  
  overlayContentOverlay: {
    ...gridContent.overlayContentOverlay,
    backgroundColor: darkColors.overlay,
  },
  
  // Progressive disclosure content
  mysteryContent: {
    ...gridContent.mysteryContent,
    backgroundColor: darkColors.surface,
  },
  
  discoveryContent: {
    ...gridContent.discoveryContent,
    backgroundColor: darkColors.backgroundSecondary,
    borderColor: darkColors.primary,
  },
  
  // AI-curated content
  aiRecommendedContent: {
    ...gridContent.aiRecommendedContent,
    backgroundColor: darkColors.surface,
    borderTopColor: darkColors.accent,
    ...darkShadows.sm,
  },
  
  personalizedContent: {
    ...gridContent.personalizedContent,
    backgroundColor: darkColors.backgroundSecondary,
    borderLeftColor: darkColors.primary,
  },
  
  // Creator economy content
  creatorContent: {
    ...gridContent.creatorContent,
    backgroundColor: darkColors.surface,
    borderColor: darkColors.border,
    ...darkShadows.md,
  },
  
  analyticsContent: {
    ...gridContent.analyticsContent,
    backgroundColor: darkColors.backgroundSecondary,
    borderTopColor: darkColors.success,
  },
  
  // Cross-device content
  syncedContent: {
    ...gridContent.syncedContent,
    backgroundColor: darkColors.surface,
    borderLeftColor: darkColors.primary,
    ...darkShadows.sm,
  },
  
  handoffContent: {
    ...gridContent.handoffContent,
    backgroundColor: darkColors.backgroundSecondary,
    borderColor: darkColors.border,
  },
  
  // Multi-format content
  storyContent: {
    ...gridContent.storyContent,
    backgroundColor: darkColors.background,
  },
  
  videoContent: {
    ...gridContent.videoContent,
    // Keep black for video content
  },
  
  musicContent: {
    ...gridContent.musicContent,
    backgroundColor: darkColors.surface,
    ...darkShadows.lg,
  },
  
  // Algorithm-optimized content
  feedContent: {
    ...gridContent.feedContent,
    backgroundColor: darkColors.surface,
    ...darkShadows.sm,
  },
  
  trendingContent: {
    ...gridContent.trendingContent,
    backgroundColor: darkColors.surface,
    borderTopColor: darkColors.warning,
    ...darkShadows.md,
  },
  
  viralContent: {
    ...gridContent.viralContent,
    backgroundColor: darkColors.surface,
    borderColor: darkColors.secondary,
    ...darkShadows.lg,
  },
  
  // Grid containers for dark theme
  aiRecommendationGrid: {
    ...aiCuratedGrids.aiRecommendationGrid,
    backgroundColor: darkColors.backgroundSecondary,
    ...darkShadows.sm,
  },
  
  adaptiveLearningGrid: {
    ...aiCuratedGrids.adaptiveLearningGrid,
    backgroundColor: darkColors.surface,
  },
  
  collaborativeFilteringGrid: {
    ...aiCuratedGrids.collaborativeFilteringGrid,
    borderColor: darkColors.primary,
  },
  
  aiSuggestionGrid: {
    ...aiCuratedGrids.aiSuggestionGrid,
    backgroundColor: darkColors.overlay,
  },
  
  // Creator economy grids
  creatorShowcaseGrid: {
    ...creatorEconomyGrids.creatorShowcaseGrid,
    backgroundColor: darkColors.surface,
    ...darkShadows.md,
  },
  
  analyticsGrid: {
    ...creatorEconomyGrids.analyticsGrid,
    backgroundColor: darkColors.backgroundSecondary,
  },
  
  revenueGrid: {
    ...creatorEconomyGrids.revenueGrid,
    backgroundColor: darkColors.surface,
    borderLeftColor: darkColors.success,
    ...darkShadows.sm,
  },
  
  audienceGrid: {
    ...creatorEconomyGrids.audienceGrid,
    backgroundColor: darkColors.surface,
    ...darkShadows.sm,
  },
  
  performanceGrid: {
    ...creatorEconomyGrids.performanceGrid,
    backgroundColor: darkColors.backgroundSecondary,
    borderColor: darkColors.border,
  },
  
  monetizationGrid: {
    ...creatorEconomyGrids.monetizationGrid,
    backgroundColor: darkColors.surface,
    borderTopColor: darkColors.warning,
    ...darkShadows.lg,
  },
  
  collaborationGrid: {
    ...creatorEconomyGrids.collaborationGrid,
    backgroundColor: darkColors.surface,
    borderColor: darkColors.primary,
    ...darkShadows.sm,
  },
  
  // Cross-device sync grids
  continuationGrid: {
    ...crossDeviceSyncGrids.continuationGrid,
    backgroundColor: darkColors.surface,
    borderLeftColor: darkColors.primary,
    ...darkShadows.sm,
  },
  
  handoffGrid: {
    ...crossDeviceSyncGrids.handoffGrid,
    backgroundColor: darkColors.backgroundSecondary,
  },
  
  progressSyncGrid: {
    ...crossDeviceSyncGrids.progressSyncGrid,
    borderTopColor: darkColors.primary,
  },
  
  multiDeviceGrid: {
    ...crossDeviceSyncGrids.multiDeviceGrid,
    backgroundColor: darkColors.surface,
    ...darkShadows.sm,
  },
  
  transitionGrid: {
    ...crossDeviceSyncGrids.transitionGrid,
    backgroundColor: darkColors.surface,
    ...darkShadows.md,
  },
  
  // Multi-format media grids
  storyFormatGrid: {
    ...multiFormatMediaGrids.storyFormatGrid,
    backgroundColor: darkColors.background,
  },
  
  musicFormatGrid: {
    ...multiFormatMediaGrids.musicFormatGrid,
    backgroundColor: darkColors.surface,
    ...darkShadows.lg,
  },
  
  audioWaveformGrid: {
    ...multiFormatMediaGrids.audioWaveformGrid,
    backgroundColor: darkColors.backgroundSecondary,
  },
  
  formatTransitionGrid: {
    ...multiFormatMediaGrids.formatTransitionGrid,
    backgroundColor: darkColors.surface,
    ...darkShadows.md,
  },
  
  adaptiveFormatGrid: {
    ...multiFormatMediaGrids.adaptiveFormatGrid,
    backgroundColor: darkColors.background,
  },
  
  // Algorithm-optimized grids
  newsFeedGrid: {
    ...algorithmOptimizedGrids.newsFeedGrid,
    backgroundColor: darkColors.background,
  },
  
  engagementGrid: {
    ...algorithmOptimizedGrids.engagementGrid,
    backgroundColor: darkColors.backgroundSecondary,
    ...darkShadows.sm,
  },
  
  behaviorOptimizedGrid: {
    ...algorithmOptimizedGrids.behaviorOptimizedGrid,
    backgroundColor: darkColors.surface,
  },
  
  viralContentGrid: {
    ...algorithmOptimizedGrids.viralContentGrid,
    backgroundColor: darkColors.surface,
    borderTopColor: darkColors.secondary,
    ...darkShadows.lg,
  },
  
  trendingGrid: {
    ...algorithmOptimizedGrids.trendingGrid,
    backgroundColor: darkColors.backgroundSecondary,
    borderColor: darkColors.primary,
    ...darkShadows.md,
  },
  
  personalizationGrid: {
    ...algorithmOptimizedGrids.personalizationGrid,
    backgroundColor: darkColors.surface,
    ...darkShadows.sm,
  },
  
  discoveryAlgorithmGrid: {
    ...algorithmOptimizedGrids.discoveryAlgorithmGrid,
    backgroundColor: darkColors.backgroundSecondary,
    borderLeftColor: darkColors.accent,
  },
});

// Theme-aware grid getter
export const getGridStyles = (isDark = false) => {
  const base = gridStyles;
  const dark = darkGridStyles;
  
  return {
    // Containers
    container: base.container,
    containerAuto: base.containerAuto,
    containerCentered: base.containerCentered,
    containerEvenly: base.containerEvenly,
    containerRight: base.containerRight,
    containerVertical: base.containerVertical,
    containerMasonry: base.containerMasonry,
    containerDense: base.containerDense,
    containerUniform: base.containerUniform,
    
    // Gutters
    gapNone: base.gapNone,
    gapTight: base.gapTight,
    gapNormal: base.gapNormal,
    gapComfortable: base.gapComfortable,
    gapSpacious: base.gapSpacious,
    gapLoose: base.gapLoose,
    
    // Items
    item: base.item,
    itemFull: base.itemFull,
    itemHalf: base.itemHalf,
    itemThird: base.itemThird,
    itemQuarter: base.itemQuarter,
    itemTwoThirds: base.itemTwoThirds,
    itemThreeQuarters: base.itemThreeQuarters,
    itemAuto: base.itemAuto,
    itemSmall: base.itemSmall,
    itemMedium: base.itemMedium,
    itemLarge: base.itemLarge,
    itemSquare: base.itemSquare,
    itemLandscape: base.itemLandscape,
    itemPortrait: base.itemPortrait,
    itemWide: base.itemWide,
    itemStory: base.itemStory,
    
    // Spacing
    spacingNone: base.spacingNone,
    spacingTight: base.spacingTight,
    spacingNormal: base.spacingNormal,
    spacingComfortable: base.spacingComfortable,
    spacingSpacious: base.spacingSpacious,
    spacingLoose: base.spacingLoose,
    
    // Responsive
    responsive: base.responsive,
    responsiveMobile: base.responsiveMobile,
    responsiveTablet: base.responsiveTablet,
    responsiveDesktop: base.responsiveDesktop,
    cardGrid: base.cardGrid,
    listGrid: base.listGrid,
    galleryGrid: base.galleryGrid,
    feedGrid: base.feedGrid,
    
    // Special
    staggered: base.staggered,
    mosaic: base.mosaic,
    bento: base.bento,
    timeline: base.timeline,
    carousel: base.carousel,
    infinite: base.infinite,
    
    // Progressive disclosure grids
    mysteryGrid: base.mysteryGrid,
    explorationGrid: base.explorationGrid,
    revealOnScrollGrid: base.revealOnScrollGrid,
    gestureGrid: base.gestureGrid,
    hiddenContentGrid: base.hiddenContentGrid,
    progressiveLoadGrid: base.progressiveLoadGrid,
    discoveryHintGrid: base.discoveryHintGrid,
    
    // AI-curated grids (theme-aware)
    aiRecommendationGrid: isDark ? dark.aiRecommendationGrid : base.aiRecommendationGrid,
    personalizedGrid: base.personalizedGrid,
    aiOptimizedGrid: base.aiOptimizedGrid,
    smartPriorityGrid: base.smartPriorityGrid,
    adaptiveLearningGrid: isDark ? dark.adaptiveLearningGrid : base.adaptiveLearningGrid,
    collaborativeFilteringGrid: isDark ? dark.collaborativeFilteringGrid : base.collaborativeFilteringGrid,
    aiSuggestionGrid: isDark ? dark.aiSuggestionGrid : base.aiSuggestionGrid,
    
    // Creator economy grids (theme-aware)
    creatorShowcaseGrid: isDark ? dark.creatorShowcaseGrid : base.creatorShowcaseGrid,
    analyticsGrid: isDark ? dark.analyticsGrid : base.analyticsGrid,
    revenueGrid: isDark ? dark.revenueGrid : base.revenueGrid,
    audienceGrid: isDark ? dark.audienceGrid : base.audienceGrid,
    performanceGrid: isDark ? dark.performanceGrid : base.performanceGrid,
    monetizationGrid: isDark ? dark.monetizationGrid : base.monetizationGrid,
    collaborationGrid: isDark ? dark.collaborationGrid : base.collaborationGrid,
    
    // Cross-device sync grids (theme-aware)
    syncPositionGrid: base.syncPositionGrid,
    continuationGrid: isDark ? dark.continuationGrid : base.continuationGrid,
    handoffGrid: isDark ? dark.handoffGrid : base.handoffGrid,
    progressSyncGrid: isDark ? dark.progressSyncGrid : base.progressSyncGrid,
    multiDeviceGrid: isDark ? dark.multiDeviceGrid : base.multiDeviceGrid,
    transitionGrid: isDark ? dark.transitionGrid : base.transitionGrid,
    
    // Multi-format media grids (theme-aware)
    storyFormatGrid: isDark ? dark.storyFormatGrid : base.storyFormatGrid,
    videoFormatGrid: base.videoFormatGrid, // Always black
    musicFormatGrid: isDark ? dark.musicFormatGrid : base.musicFormatGrid,
    audioWaveformGrid: isDark ? dark.audioWaveformGrid : base.audioWaveformGrid,
    mixedMediaGrid: base.mixedMediaGrid,
    formatTransitionGrid: isDark ? dark.formatTransitionGrid : base.formatTransitionGrid,
    adaptiveFormatGrid: isDark ? dark.adaptiveFormatGrid : base.adaptiveFormatGrid,
    
    // Algorithm-optimized grids (theme-aware)
    newsFeedGrid: isDark ? dark.newsFeedGrid : base.newsFeedGrid,
    engagementGrid: isDark ? dark.engagementGrid : base.engagementGrid,
    algorithmicPriorityGrid: base.algorithmicPriorityGrid,
    behaviorOptimizedGrid: isDark ? dark.behaviorOptimizedGrid : base.behaviorOptimizedGrid,
    viralContentGrid: isDark ? dark.viralContentGrid : base.viralContentGrid,
    trendingGrid: isDark ? dark.trendingGrid : base.trendingGrid,
    personalizationGrid: isDark ? dark.personalizationGrid : base.personalizationGrid,
    discoveryAlgorithmGrid: isDark ? dark.discoveryAlgorithmGrid : base.discoveryAlgorithmGrid,
    
    // Content (theme-aware)
    cardContent: isDark ? dark.cardContent : base.cardContent,
    imageContent: isDark ? dark.imageContent : base.imageContent,
    textContent: base.textContent,
    interactiveContent: isDark ? dark.interactiveContent : base.interactiveContent,
    mediaContent: isDark ? dark.mediaContent : base.mediaContent,
    overlayContent: isDark ? dark.overlayContent : base.overlayContent,
    overlayContentOverlay: isDark ? dark.overlayContentOverlay : base.overlayContentOverlay,
    
    // Progressive disclosure content (theme-aware)
    mysteryContent: isDark ? dark.mysteryContent : base.mysteryContent,
    discoveryContent: isDark ? dark.discoveryContent : base.discoveryContent,
    
    // AI-curated content (theme-aware)
    aiRecommendedContent: isDark ? dark.aiRecommendedContent : base.aiRecommendedContent,
    personalizedContent: isDark ? dark.personalizedContent : base.personalizedContent,
    
    // Creator economy content (theme-aware)
    creatorContent: isDark ? dark.creatorContent : base.creatorContent,
    analyticsContent: isDark ? dark.analyticsContent : base.analyticsContent,
    
    // Cross-device content (theme-aware)
    syncedContent: isDark ? dark.syncedContent : base.syncedContent,
    handoffContent: isDark ? dark.handoffContent : base.handoffContent,
    
    // Multi-format content (theme-aware)
    storyContent: isDark ? dark.storyContent : base.storyContent,
    videoContent: isDark ? dark.videoContent : base.videoContent,
    musicContent: isDark ? dark.musicContent : base.musicContent,
    
    // Algorithm-optimized content (theme-aware)
    feedContent: isDark ? dark.feedContent : base.feedContent,
    trendingContent: isDark ? dark.trendingContent : base.trendingContent,
    viralContent: isDark ? dark.viralContent : base.viralContent,
  };
};

// Export grid constants for use in other files
export { gridConstants };

// Export individual style categories for granular imports
export const gridContainerStyles = {
  container: gridStyles.container,
  containerAuto: gridStyles.containerAuto,
  containerCentered: gridStyles.containerCentered,
  containerEvenly: gridStyles.containerEvenly,
  containerRight: gridStyles.containerRight,
  containerVertical: gridStyles.containerVertical,
  containerMasonry: gridStyles.containerMasonry,
  containerDense: gridStyles.containerDense,
  containerUniform: gridStyles.containerUniform,
};

export const gridItemStyles = {
  item: gridStyles.item,
  itemFull: gridStyles.itemFull,
  itemHalf: gridStyles.itemHalf,
  itemThird: gridStyles.itemThird,
  itemQuarter: gridStyles.itemQuarter,
  itemTwoThirds: gridStyles.itemTwoThirds,
  itemThreeQuarters: gridStyles.itemThreeQuarters,
  itemAuto: gridStyles.itemAuto,
  itemSquare: gridStyles.itemSquare,
  itemLandscape: gridStyles.itemLandscape,
  itemPortrait: gridStyles.itemPortrait,
  itemWide: gridStyles.itemWide,
  itemStory: gridStyles.itemStory,
};

export const gridSpacingStyles = {
  gapNone: gridStyles.gapNone,
  gapTight: gridStyles.gapTight,
  gapNormal: gridStyles.gapNormal,
  gapComfortable: gridStyles.gapComfortable,
  gapSpacious: gridStyles.gapSpacious,
  gapLoose: gridStyles.gapLoose,
  spacingNone: gridStyles.spacingNone,
  spacingTight: gridStyles.spacingTight,
  spacingNormal: gridStyles.spacingNormal,
  spacingComfortable: gridStyles.spacingComfortable,
  spacingSpacious: gridStyles.spacingSpacious,
  spacingLoose: gridStyles.spacingLoose,
};

// Utility functions for grid calculations
export const gridUtils = {
  // Calculate number of columns that fit in available width
  calculateColumns: (itemWidth, gutter = gridConstants.gutters.normal) => {
    const availableWidth = screenWidth - (gutter * 2); // Account for side margins
    return Math.floor(availableWidth / (itemWidth + gutter));
  },
  
  // Calculate item width for given number of columns
  calculateItemWidth,
  
  // Get responsive column count based on screen width
  getResponsiveColumns: () => {
    if (screenWidth >= gridConstants.breakpoints.wide) {
      return gridConstants.columns.wide;      // 4 columns
    } else if (screenWidth >= gridConstants.breakpoints.desktop) {
      return gridConstants.columns.desktop;   // 3 columns
    } else if (screenWidth >= gridConstants.breakpoints.tablet) {
      return gridConstants.columns.tablet;    // 2 columns
    } else {
      return gridConstants.columns.mobile;    // 1 column
    }
  },
  
  // Generate grid item style for specific column count
  generateItemStyle: (columns, gutter = gridConstants.gutters.normal) => {
    const itemWidth = calculateItemWidth(columns, gutter);
    return {
      width: itemWidth,
      flexBasis: itemWidth,
      marginHorizontal: gutter / 2,
      marginVertical: gutter / 2,
    };
  },
  
  // Create aspect ratio style
  createAspectRatio: (ratio) => ({
    aspectRatio: ratio,
  }),
  
  // Create fixed size style
  createFixedSize: (width, height = width) => ({
    width,
    height,
  }),
};

// 41,263 characters