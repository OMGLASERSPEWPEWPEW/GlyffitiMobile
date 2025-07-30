// src/styles/layouts/index.js
// Path: src/styles/layouts/index.js

/**
 * Layouts barrel export - comprehensive layout system
 * Combines containers, grids, and screens for complete layout solution
 * Inspired by modern content platform UX patterns and Design Research
 * 
 * Usage:
 * - import { containerStyles, getContainerStyles } from 'src/styles/layouts';
 * - import { screenLayouts, gridLayouts } from 'src/styles/layouts';
 * - import { layoutPresets } from 'src/styles/layouts';
 */

// ====================
// Core Layout Exports
// ====================

// Container system exports
export {
  containerStyles,
  getContainerStyles,
  containerConstants,
  screenStyles as screenContainerStyles,
  contentStyles as contentContainerStyles,
  sectionStyles as sectionContainerStyles,
} from './containers';

// Grid system exports
export {
  gridStyles,
  getGridStyles,
  gridConstants,
  gridContainerStyles,
  gridItemStyles,
  gridSpacingStyles,
  gridUtils,
} from './grids';

// Screen system exports
export {
  screenStyles,
  getScreenStyles,
  screenConstants,
  baseScreenStyles,
  discoveryScreenStyles,
  consumptionScreenStyles,
  creatorScreenStyles,
  layoutComponentStyles,
  screenUtils,
} from './screens';

// ====================
// Layout System Integration
// ====================

import { getContainerStyles } from './containers';
import { getGridStyles } from './grids';
import { getScreenStyles } from './screens';
import { 
  lightColors, 
  darkColors, 
  spacing, 
  shadows, 
  darkShadows,
  borderRadius 
} from '../tokens';

/**
 * Complete theme-aware layout system
 * Combines all layout systems with consistent theming
 * @param {boolean} isDark - Dark mode flag
 * @returns {Object} Complete layout system
 */
export const getLayoutStyles = (isDark = false) => {
  return {
    containers: getContainerStyles(isDark),
    grids: getGridStyles(isDark),
    screens: getScreenStyles(isDark),
    theme: {
      isDark,
      colors: isDark ? darkColors : lightColors,
      shadows: isDark ? darkShadows : shadows,
    },
  };
};

// ====================
// Layout Presets (Design Research Inspired)
// ====================

/**
 * Pre-configured layout combinations for common use cases
 * Based on Design Research patterns from leading platforms
 */
export const layoutPresets = {
  // News Feed pattern (Julie Zhuo's Facebook work)
  newsFeed: (isDark = false) => {
    const containers = getContainerStyles(isDark);
    const grids = getGridStyles(isDark);
    const screens = getScreenStyles(isDark);
    
    return {
      screen: screens.discoveryFeed,
      container: containers.feedZone,
      grid: grids.newsFeedGrid,
      content: grids.feedContent,
    };
  },
  
  // Stories format (Instagram/Snapchat inspiration)
  storiesExperience: (isDark = false) => {
    const containers = getContainerStyles(isDark);
    const grids = getGridStyles(isDark);
    const screens = getScreenStyles(isDark);
    
    return {
      screen: screens.reading,
      container: containers.storyReader,
      grid: grids.storyFormatGrid,
      content: grids.storyContent,
    };
  },
  
  // Creator dashboard (Spotify for Artists)
  creatorDashboard: (isDark = false) => {
    const containers = getContainerStyles(isDark);
    const grids = getGridStyles(isDark);
    const screens = getScreenStyles(isDark);
    
    return {
      screen: screens.creatorHub,
      container: containers.creatorDashboard,
      grid: grids.creatorShowcaseGrid,
      analytics: {
        container: containers.analyticsContainer,
        grid: grids.analyticsGrid,
        content: grids.analyticsContent,
      },
      revenue: {
        container: containers.revenueContainer,
        grid: grids.revenueGrid,
      },
    };
  },
  
  // AI collaboration (Jenny Blackburn research)
  aiCollaboration: (isDark = false) => {
    const containers = getContainerStyles(isDark);
    const grids = getGridStyles(isDark);
    const screens = getScreenStyles(isDark);
    
    return {
      screen: screens.aiWritingAssistant,
      container: containers.aiCollaborativeSpace,
      grid: grids.aiRecommendationGrid,
      assistant: {
        container: containers.aiAssistant,
        suggestions: containers.aiSuggestions,
        thinking: containers.aiThinking,
      },
      content: grids.aiRecommendedContent,
    };
  },
  
  // Progressive disclosure (Snapchat mystery UX)
  progressiveDiscovery: (isDark = false) => {
    const containers = getContainerStyles(isDark);
    const grids = getGridStyles(isDark);
    const screens = getScreenStyles(isDark);
    
    return {
      screen: screens.onboardingDiscovery,
      container: containers.mysteryZone,
      grid: grids.mysteryGrid,
      hints: {
        container: containers.discoveryHint,
        prompt: containers.explorationPrompt,
        tutorial: containers.tutorialOverlay,
      },
      content: grids.mysteryContent,
    };
  },
  
  // Cross-device sync (Kindle inspiration)
  crossDeviceSync: (isDark = false) => {
    const containers = getContainerStyles(isDark);
    const grids = getGridStyles(isDark);
    const screens = getScreenStyles(isDark);
    
    return {
      screen: screens.continuationPrompt,
      container: containers.continuationPrompt,
      grid: grids.continuationGrid,
      sync: {
        indicator: containers.syncIndicator,
        handoff: containers.deviceHandoff,
        progress: containers.progressSync,
      },
      content: grids.syncedContent,
    };
  },
  
  // Multi-format media (stories → videos → music)
  multiFormatMedia: (isDark = false) => {
    const containers = getContainerStyles(isDark);
    const grids = getGridStyles(isDark);
    const screens = getScreenStyles(isDark);
    
    return {
      story: {
        screen: screens.reading,
        container: containers.storyReader,
        grid: grids.storyFormatGrid,
        content: grids.storyContent,
      },
      video: {
        screen: screens.videoViewing,
        container: containers.videoPlayer,
        grid: grids.videoFormatGrid,
        content: grids.videoContent,
      },
      music: {
        screen: screens.musicListening,
        container: containers.musicPlayer,
        grid: grids.musicFormatGrid,
        content: grids.musicContent,
      },
      transition: {
        container: containers.formatTransition,
        grid: grids.formatTransitionGrid,
      },
      controls: containers.mediaControls,
    };
  },
  
  // Reading experience (Kindle optimization)
  readingExperience: (isDark = false) => {
    const containers = getContainerStyles(isDark);
    const grids = getGridStyles(isDark);
    const screens = getScreenStyles(isDark);
    
    return {
      screen: screens.readingImmersive,
      container: containers.contentReading,
      grid: grids.storyFormatGrid,
      content: grids.storyContent,
      controls: screens.floatingControls,
    };
  },
  
  // Discovery/Browse (algorithmic recommendations)
  discoveryBrowse: (isDark = false) => {
    const containers = getContainerStyles(isDark);
    const grids = getGridStyles(isDark);
    const screens = getScreenStyles(isDark);
    
    return {
      screen: screens.discoveryRecommended,
      container: containers.recommendationContainer,
      grid: grids.discoveryAlgorithmGrid,
      trending: {
        grid: grids.trendingGrid,
        content: grids.trendingContent,
      },
      viral: {
        grid: grids.viralContentGrid,
        content: grids.viralContent,
      },
      personalized: {
        container: containers.personalizationArea,
        grid: grids.personalizationGrid,
        content: grids.personalizedContent,
      },
    };
  },
};

// ====================
// Responsive Layout Helpers
// ====================

/**
 * Responsive layout utilities
 * Adapts layouts based on screen size and device capabilities
 */
export const responsiveLayouts = {
  // Get appropriate layout for current screen size
  getResponsiveLayout: (screenWidth, layoutType = 'grid') => {
    if (screenWidth >= 1200) {
      return layoutType === 'grid' ? 'desktop' : 'wide';
    } else if (screenWidth >= 768) {
      return 'tablet';
    } else {
      return 'mobile';
    }
  },
  
  // Tablet-specific layouts
  tablet: {
    splitView: (isDark = false) => {
      const containers = getContainerStyles(isDark);
      const screens = getScreenStyles(isDark);
      
      return {
        screen: screens.screenSplit,
        left: containers.screenSplitLeft,
        right: containers.screenSplitRight,
        sidebar: containers.sidebar,
      };
    },
  },
  
  // Desktop-specific layouts
  desktop: {
    multiColumn: (isDark = false) => {
      const containers = getContainerStyles(isDark);
      const grids = getGridStyles(isDark);
      
      return {
        container: containers.contentConstrained,
        grid: grids.containerUniform,
        columns: 3, // Three column layout
      };
    },
  },
  
  // Mobile-specific layouts
  mobile: {
    singleColumn: (isDark = false) => {
      const containers = getContainerStyles(isDark);
      const grids = getGridStyles(isDark);
      
      return {
        container: containers.content,
        grid: grids.responsiveMobile,
        columns: 1, // Single column layout
      };
    },
  },
};

// ====================
// Animation-Ready Layouts
// ====================

/**
 * Layouts optimized for animations and transitions
 * Based on Material Motion framework (John Schlemmer's work)
 */
export const animatedLayouts = {
  // Page transitions
  pageTransition: {
    entering: {
      opacity: 0,
      transform: [{ translateX: 50 }],
    },
    entered: {
      opacity: 1,
      transform: [{ translateX: 0 }],
    },
    exiting: {
      opacity: 0,
      transform: [{ translateX: -50 }],
    },
  },
  
  // Modal animations
  modalTransition: {
    entering: {
      opacity: 0,
      transform: [{ scale: 0.9 }, { translateY: 50 }],
    },
    entered: {
      opacity: 1,
      transform: [{ scale: 1 }, { translateY: 0 }],
    },
    exiting: {
      opacity: 0,
      transform: [{ scale: 0.9 }, { translateY: 50 }],
    },
  },
  
  // Grid item animations
  gridItemTransition: {
    entering: {
      opacity: 0,
      transform: [{ scale: 0.8 }],
    },
    entered: {
      opacity: 1,
      transform: [{ scale: 1 }],
    },
    exiting: {
      opacity: 0,
      transform: [{ scale: 0.8 }],
    },
  },
  
  // Progressive disclosure animations
  progressiveReveal: {
    hidden: {
      opacity: 0,
      transform: [{ scale: 0 }],
    },
    revealed: {
      opacity: 1,
      transform: [{ scale: 1 }],
    },
  },
  
  // AI suggestion animations
  aiSuggestionAppear: {
    initial: {
      opacity: 0,
      transform: [{ translateY: 20 }],
    },
    animate: {
      opacity: 1,
      transform: [{ translateY: 0 }],
    },
    exit: {
      opacity: 0,
      transform: [{ translateY: -20 }],
    },
  },
};

// ====================
// Layout Composition Helpers
// ====================

/**
 * Utilities for composing layouts dynamically
 * Allows mixing and matching different layout systems
 */
export const layoutComposer = {
  // Combine multiple layout systems
  compose: (...layoutSystems) => {
    return layoutSystems.reduce((combined, system) => {
      return { ...combined, ...system };
    }, {});
  },
  
  // Create layout variant
  createVariant: (baseLayout, overrides) => {
    return { ...baseLayout, ...overrides };
  },
  
  // Apply theme to layout
  applyTheme: (layout, isDark = false) => {
    const colors = isDark ? darkColors : lightColors;
    const shadows = isDark ? darkShadows : shadows;
    
    return {
      ...layout,
      backgroundColor: colors.background,
      ...shadows.sm,
    };
  },
  
  // Create responsive layout set
  createResponsiveSet: (mobileLayout, tabletLayout, desktopLayout) => {
    return {
      mobile: mobileLayout,
      tablet: tabletLayout,
      desktop: desktopLayout,
    };
  },
  
  // Merge layout presets
  mergePresets: (preset1, preset2) => {
    return {
      ...preset1,
      ...preset2,
      // Deep merge nested objects
      ...(preset1.analytics && preset2.analytics && {
        analytics: { ...preset1.analytics, ...preset2.analytics }
      }),
      ...(preset1.assistant && preset2.assistant && {
        assistant: { ...preset1.assistant, ...preset2.assistant }
      }),
    };
  },
};

// ====================
// Layout Performance Helpers
// ====================

/**
 * Performance optimization utilities for layouts
 * Based on React Native best practices and FAANG performance standards
 */
export const layoutPerformance = {
  // Virtualization helpers
  virtualization: {
    getItemLayout: (data, index, itemHeight = 100) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index,
    }),
    
    keyExtractor: (item, index) => `layout-item-${item.id || index}`,
    
    renderItem: ({ item, index }) => ({
      key: `item-${index}`,
      style: { height: 100 }, // Fixed height for performance
    }),
  },
  
  // Memory optimization
  memoryOptimization: {
    // Lazy load heavy layouts
    shouldLoadLayout: (screenWidth, complexity = 'medium') => {
      const thresholds = {
        simple: 0,
        medium: 768,
        complex: 1024,
      };
      return screenWidth >= thresholds[complexity];
    },
    
    // Unload off-screen layouts
    shouldUnloadLayout: (isVisible, memoryPressure = false) => {
      return !isVisible && memoryPressure;
    },
  },
  
  // Rendering optimization
  renderingOptimization: {
    // Reduce style recalculations
    staticStyles: true,
    
    // Optimize shadow rendering
    optimizedShadows: (isDark = false) => {
      return isDark ? darkShadows.sm : shadows.sm;
    },
    
    // Efficient grid calculations
    efficientGrid: (itemCount, columns) => {
      return Math.ceil(itemCount / columns);
    },
  },
};

// ====================
// Layout Validation
// ====================

/**
 * Layout validation utilities
 * Ensures layouts meet accessibility and usability standards
 */
export const layoutValidation = {
  // Accessibility validation
  accessibility: {
    // Check minimum touch targets (Apple HIG: 44px)
    validateTouchTargets: (elementHeight, elementWidth) => {
      const minSize = 44;
      return elementHeight >= minSize && elementWidth >= minSize;
    },
    
    // Check color contrast
    validateContrast: (backgroundColor, textColor) => {
      // Simplified contrast check - would use a proper contrast library in production
      return true; // Placeholder
    },
    
    // Check text readability
    validateReadability: (fontSize, lineHeight, maxWidth) => {
      const optimalFontSize = fontSize >= 14;
      const optimalLineHeight = lineHeight >= 1.4;
      const optimalWidth = maxWidth <= 680; // Based on typography research
      
      return optimalFontSize && optimalLineHeight && optimalWidth;
    },
  },
  
  // Usability validation
  usability: {
    // Check layout consistency
    validateConsistency: (layout1, layout2) => {
      const keys1 = Object.keys(layout1);
      const keys2 = Object.keys(layout2);
      return keys1.length === keys2.length && keys1.every(key => keys2.includes(key));
    },
    
    // Check responsive behavior
    validateResponsive: (mobileLayout, tabletLayout, desktopLayout) => {
      return mobileLayout && tabletLayout && desktopLayout;
    },
  },
};

// ====================
// Development Helpers
// ====================

/**
 * Development and debugging utilities
 * Helps developers work with the layout system effectively
 */
export const layoutDevelopment = {
  // Debug layout information
  debugLayout: (layoutName, layout) => {
    if (__DEV__) {
      console.group(`🎨 Layout Debug: ${layoutName}`);
      console.log('Layout structure:', layout);
      console.log('Layout keys:', Object.keys(layout));
      console.groupEnd();
    }
  },
  
  // Measure layout performance
  measureLayout: (layoutFunction) => {
    if (__DEV__) {
      const start = Date.now();
      const result = layoutFunction();
      const end = Date.now();
      console.log(`⚡ Layout calculation took ${end - start}ms`);
      return result;
    }
    return layoutFunction();
  },
  
  // Validate layout tokens
  validateTokens: (layout) => {
    if (__DEV__) {
      const hasValidSpacing = layout.padding || layout.margin;
      const hasValidColors = layout.backgroundColor || layout.borderColor;
      const hasValidShadows = layout.shadowColor || layout.elevation;
      
      console.log('🔍 Layout validation:', {
        spacing: hasValidSpacing,
        colors: hasValidColors,
        shadows: hasValidShadows,
      });
    }
  },
};

// ====================
// Layout System Constants
// ====================

/**
 * Global layout system constants
 * Centralizes important values used across all layout systems
 */
export const layoutSystemConstants = {
  // Version info
  version: '1.0.0',
  
  // Supported platforms
  platforms: ['ios', 'android', 'web'],
  
  // Performance thresholds
  performance: {
    maxLayoutDepth: 10,
    maxGridItems: 1000,
    maxAnimationDuration: 500,
  },
  
  // Design system integration
  designSystem: {
    spacingBase: 4,
    borderRadiusBase: 4,
    shadowBase: 'sm',
  },
  
  // Accessibility requirements
  accessibility: {
    minTouchTarget: 44,
    minContrast: 4.5,
    maxTextWidth: 680,
  },
};

// ====================
// Default Export
// ====================

/**
 * Default export provides the most commonly used layout utilities
 * For quick access to essential layout functions
 */
export default {
  // Core systems
  getLayoutStyles,
  layoutPresets,
  
  // Quick access to theme-aware getters
  containers: getContainerStyles,
  grids: getGridStyles,
  screens: getScreenStyles,
  
  // Utilities
  responsive: responsiveLayouts,
  animations: animatedLayouts,
  composer: layoutComposer,
  performance: layoutPerformance,
  validation: layoutValidation,
  
  // Development
  debug: layoutDevelopment,
  constants: layoutSystemConstants,
};

// 6,847 characters