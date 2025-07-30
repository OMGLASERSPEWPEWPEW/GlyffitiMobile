// src/styles/utilities/index.js
// Path: src/styles/utilities/index.js

/**
 * Utilities barrel export - comprehensive utility system
 * Combines flex, positioning, and text utilities for complete styling solution
 * Inspired by modern content platform UX patterns and Design Research
 * 
 * Usage:
 * - import { flexStyles, positioningStyles, textStyles } from 'src/styles/utilities';
 * - import { utilityPresets, getUtilityStyles } from 'src/styles/utilities';
 * - import { utilityComposer, responsiveUtils } from 'src/styles/utilities';
 */

// ====================
// Core Utility Exports
// ====================

// Flex system exports
export {
  flexStyles,
  getFlexStyles,
  flexConstants,
  coreFlexStyles,
  designResearchFlexStyles,
  commonFlexStyles,
  flexUtils,
} from './flex';

// Positioning system exports
export {
  positioningStyles,
  getPositioningStyles,
  positioningConstants,
  corePositioningStyles,
  zIndexStyles,
  designResearchPositioningStyles,
  modalOverlayStyles,
  floatingElementStyles,
  positioningUtils,
} from './positioning';

// Text system exports
export {
  textStyles,
  getTextStyles,
  textConstants,
  coreTextStyles,
  designResearchTextStyles,
  readingTextStyles,
  accessibilityTextStyles,
  textUtils,
} from './text';

// ====================
// Utility System Integration
// ====================

import { getFlexStyles } from './flex';
import { getPositioningStyles } from './positioning';
import { getTextStyles } from './text';
import { 
  lightColors, 
  darkColors, 
  spacing, 
  shadows, 
  darkShadows,
  borderRadius,
  typography 
} from '../tokens';

/**
 * Complete theme-aware utility system
 * Combines all utility systems with consistent theming
 * @param {boolean} isDark - Dark mode flag
 * @returns {Object} Complete utility system
 */
export const getUtilityStyles = (isDark = false) => {
  return {
    flex: getFlexStyles(isDark),
    positioning: getPositioningStyles(isDark),
    text: getTextStyles(isDark),
    theme: {
      isDark,
      colors: isDark ? darkColors : lightColors,
      shadows: isDark ? darkShadows : shadows,
    },
  };
};

// ====================
// Utility Presets (Design Research Inspired)
// ====================

/**
 * Pre-configured utility combinations for common use cases
 * Based on Design Research patterns from leading platforms
 */
export const utilityPresets = {
  // News Feed pattern (Julie Zhuo's Facebook work)
  newsFeed: (isDark = false) => {
    const flex = getFlexStyles(isDark);
    const positioning = getPositioningStyles(isDark);
    const text = getTextStyles(isDark);
    
    return {
      container: flex.feedContainer,
      item: flex.feedItem,
      header: flex.feedItemHeader,
      content: flex.feedItemContent,
      actions: flex.feedItemActions,
      text: {
        headline: text.feedHeadline,
        content: text.feedPostContent,
        metadata: text.feedMetadata,
        engagement: text.engagementText,
        hashtag: text.hashtagText,
        mention: text.mentionText,
      },
      positioning: {
        floatingAction: positioning.feedFloatingAction,
        overlay: positioning.feedItemOverlay,
        indicators: positioning.engagementIndicators,
        priority: positioning.priorityIndicator,
      },
    };
  },
  
  // Progressive disclosure (Snapchat mystery UX)
  progressiveDiscovery: (isDark = false) => {
    const flex = getFlexStyles(isDark);
    const positioning = getPositioningStyles(isDark);
    const text = getTextStyles(isDark);
    
    return {
      container: flex.mysteryContainer,
      discoveryZone: flex.discoveryZone,
      progressiveReveal: flex.progressiveReveal,
      gestureResponse: flex.gestureResponse,
      text: {
        hint: text.mysteryHintText,
        prompt: text.discoveryPromptText,
        instruction: text.tutorialInstructionText,
        hidden: text.hiddenFeatureLabel,
        exploration: text.explorationInstruction,
        reveal: text.progressiveRevealText,
        gesture: text.gestureHintText,
        secret: text.secretContentText,
      },
      positioning: {
        mysteryZone: positioning.mysteryZone,
        hint: positioning.discoveryHint,
        overlay: positioning.progressiveRevealOverlay,
        prompt: positioning.explorationPrompt,
        gesture: positioning.gestureAreaOverlay,
        spotlight: positioning.tutorialSpotlight,
        indicator: positioning.hiddenFeatureIndicator,
        swipeInstruction: positioning.swipeInstructionOverlay,
      },
    };
  },
  
  // AI collaboration (Jenny Blackburn research)
  aiCollaboration: (isDark = false) => {
    const flex = getFlexStyles(isDark);
    const positioning = getPositioningStyles(isDark);
    const text = getTextStyles(isDark);
    
    return {
      layout: flex.aiAssistantLayout,
      humanArea: flex.humanContentArea,
      assistantPanel: flex.aiAssistantPanel,
      collaborativeSpace: flex.collaborativeSpace,
      suggestions: flex.aiSuggestions,
      multimodal: flex.multimodalInteraction,
      voice: flex.voiceInteraction,
      thinking: flex.aiThinking,
      text: {
        assistant: text.aiAssistantText,
        human: text.humanInputText,
        suggestion: text.aiSuggestionText,
        collaborative: text.collaborativeEditText,
        thinking: text.aiThinkingText,
        voice: text.voiceCommandText,
        confidence: text.aiConfidenceText,
        multimodal: text.multimodalInstructionText,
        autocomplete: text.smartAutocompleteText,
      },
      positioning: {
        panel: positioning.aiAssistantPanel,
        suggestions: positioning.aiSuggestionsPanel,
        thinking: positioning.aiThinkingIndicator,
        cursor: positioning.collaborativeCursor,
        voice: positioning.voiceInteractionOverlay,
        zone: positioning.multimodalZone,
        status: positioning.collaborationStatus,
        smart: positioning.smartSuggestions,
      },
    };
  },
  
  // Creator economy (Spotify for Artists)
  creatorEconomy: (isDark = false) => {
    const flex = getFlexStyles(isDark);
    const positioning = getPositioningStyles(isDark);
    const text = getTextStyles(isDark);
    
    return {
      dashboard: flex.creatorDashboard,
      analytics: flex.analyticsSection,
      card: flex.analyticsCard,
      revenue: flex.revenueTracking,
      audience: flex.audienceInsights,
      performance: flex.contentPerformance,
      tools: flex.creatorTools,
      monetization: flex.monetizationOptions,
      showcase: flex.profileShowcase,
      text: {
        metric: text.dashboardMetricText,
        revenue: text.revenueText,
        label: text.analyticsLabelText,
        performance: text.performanceIndicatorText,
        audience: text.audienceCountText,
        opportunity: text.monetizationOpportunityText,
        tip: text.creatorTipText,
        status: text.contentStatusText,
        collaboration: text.collaborationRequestText,
      },
      positioning: {
        stats: positioning.dashboardFloatingStats,
        notification: positioning.revenueNotificationOverlay,
        tooltip: positioning.analyticsTooltip,
        indicator: positioning.performanceIndicator,
        badge: positioning.monetizationBadge,
        menu: positioning.creatorToolsMenu,
        overlay: positioning.audienceInsightOverlay,
        scheduling: positioning.schedulingIndicator,
        enhancement: positioning.profileEnhancementOverlay,
      },
    };
  },
  
  // Cross-device sync (Kindle inspiration)
  crossDeviceSync: (isDark = false) => {
    const flex = getFlexStyles(isDark);
    const positioning = getPositioningStyles(isDark);
    const text = getTextStyles(isDark);
    
    return {
      indicator: flex.syncIndicator,
      prompt: flex.continuationPrompt,
      handoff: flex.deviceHandoff,
      progress: flex.progressSync,
      settings: flex.multiDeviceSettings,
      content: flex.crossDeviceContent,
      transition: flex.seamlessTransition,
      text: {
        status: text.syncStatusText,
        prompt: text.continuationPromptText,
        device: text.deviceIndicatorText,
        progress: text.progressSyncText,
        position: text.readingPositionText,
        instruction: text.handoffInstructionText,
        availability: text.deviceAvailabilityText,
        conflict: text.syncConflictText,
      },
      positioning: {
        status: positioning.syncStatusIndicator,
        prompt: positioning.deviceContinuationPrompt,
        handoff: positioning.handoffOverlay,
        progress: positioning.progressSyncIndicator,
        availability: positioning.deviceAvailabilityIndicator,
        transition: positioning.seamlessTransitionOverlay,
        position: positioning.readingPositionIndicator,
        notification: positioning.crossDeviceNotification,
      },
    };
  },
  
  // Multi-format media (stories → videos → music)
  multiFormatMedia: (isDark = false) => {
    const flex = getFlexStyles(isDark);
    const positioning = getPositioningStyles(isDark);
    const text = getTextStyles(isDark);
    
    return {
      story: {
        format: flex.storyFormat,
        text: {
          title: text.storyTitleText,
          body: text.storyBodyText,
        },
        positioning: {
          controls: positioning.storyReadingControls,
        },
      },
      video: {
        format: flex.videoFormat,
        text: {
          title: text.videoTitleText,
          caption: text.videoCaptionText,
        },
        positioning: {
          controls: positioning.videoPlayerControls,
          captions: positioning.captionsOverlay,
          progress: positioning.playbackProgressIndicator,
        },
      },
      music: {
        format: flex.musicFormat,
        waveform: flex.audioWaveform,
        controls: flex.mediaControls,
        queue: flex.mediaQueue,
        text: {
          title: text.musicTrackTitleText,
          artist: text.musicArtistText,
          time: text.musicTimeText,
          controls: text.playbackControlText,
          waveform: text.audioWaveformLabelText,
        },
        positioning: {
          controls: positioning.musicPlayerControls,
          waveform: positioning.waveformOverlay,
          volume: positioning.volumeControlOverlay,
          queue: positioning.mediaQueueOverlay,
        },
      },
      transition: {
        format: flex.formatTransition,
        mixed: flex.mixedMediaLayout,
        adaptive: flex.adaptiveFormat,
        text: {
          transition: text.formatTransitionText,
        },
        positioning: {
          overlay: positioning.formatTransitionOverlay,
        },
      },
    };
  },
  
  // Reading experience (Kindle optimization)
  readingExperience: (isDark = false) => {
    const flex = getFlexStyles(isDark);
    const positioning = getPositioningStyles(isDark);
    const text = getTextStyles(isDark);
    
    return {
      layout: flex.storyFormat,
      text: {
        optimized: text.readingOptimized,
        title: text.readingTitle,
        subtitle: text.readingSubtitle,
        metadata: text.readingMetadata,
        chapter: text.chapterHeading,
        progress: text.readingProgressText,
        quote: text.quoteText,
        footnote: text.footnoteText,
        controls: text.readingControlsText,
      },
      positioning: {
        controls: positioning.storyReadingControls,
      },
    };
  },
  
  // Modal and overlay system
  modalSystem: (isDark = false) => {
    const flex = getFlexStyles(isDark);
    const positioning = getPositioningStyles(isDark);
    const text = getTextStyles(isDark);
    
    return {
      layout: flex.modalLayout,
      backdrop: positioning.backdrop,
      modal: positioning.modal,
      modalFullScreen: positioning.modalFullScreen,
      modalBottomSheet: positioning.modalBottomSheet,
      modalCenter: positioning.modalCenter,
      loading: positioning.loadingOverlay,
    };
  },
  
  // Common UI patterns
  commonPatterns: (isDark = false) => {
    const flex = getFlexStyles(isDark);
    const positioning = getPositioningStyles(isDark);
    const text = getTextStyles(isDark);
    
    return {
      // Layout patterns
      centerAll: flex.centerAll,
      header: flex.header,
      contentArea: flex.contentArea,
      footer: flex.footer,
      card: flex.card,
      listItem: flex.listItem,
      
      // Text patterns
      heading: text.text2Xl,
      title: text.textXl,
      body: text.textBase,
      caption: text.textSm,
      label: text.textXs,
      
      // Positioning patterns
      absoluteCenter: positioning.absoluteCenter,
      fullCoverage: positioning.fullCoverage,
      topRight: positioning.topRight,
      bottomLeft: positioning.bottomLeft,
      
      // Interactive elements
      floatingActionButton: positioning.floatingActionButton,
      tooltip: positioning.tooltip,
      toast: positioning.toast,
      snackbar: positioning.snackbar,
    };
  },
};

// ====================
// Responsive Utility Helpers
// ====================

/**
 * Responsive utility system
 * Adapts utilities based on screen size and device capabilities
 */
export const responsiveUtils = {
  // Get responsive flex direction
  getResponsiveFlexDirection: (screenWidth, threshold = 768) => {
    return screenWidth >= threshold ? 'row' : 'column';
  },
  
  // Get responsive text size
  getResponsiveTextSize: (baseSize, screenWidth, minSize = 12, maxSize = 36) => {
    const scaleFactor = screenWidth / 375; // Base on iPhone 8 width
    const calculatedSize = baseSize * scaleFactor;
    return Math.max(minSize, Math.min(maxSize, calculatedSize));
  },
  
  // Get responsive spacing
  getResponsiveSpacing: (baseSpacing, screenWidth) => {
    if (screenWidth >= 1024) return baseSpacing * 1.5; // Desktop
    if (screenWidth >= 768) return baseSpacing * 1.2;  // Tablet
    return baseSpacing; // Mobile
  },
  
  // Get responsive padding
  getResponsivePadding: (screenWidth) => {
    if (screenWidth >= 1024) return spacing.large;     // 24px
    if (screenWidth >= 768) return spacing.medium;     // 16px
    return spacing.small;                               // 8px
  },
  
  // Create responsive utility set
  createResponsiveUtilitySet: (mobileUtils, tabletUtils, desktopUtils) => {
    return {
      mobile: mobileUtils,
      tablet: tabletUtils,
      desktop: desktopUtils,
    };
  },
  
  // Get optimal layout for screen size
  getOptimalLayout: (screenWidth, contentType = 'general') => {
    const layouts = {
      general: {
        mobile: 'column',
        tablet: 'row',
        desktop: 'row',
      },
      reading: {
        mobile: 'column',
        tablet: 'column',
        desktop: 'column',
      },
      dashboard: {
        mobile: 'column',
        tablet: 'row',
        desktop: 'row',
      },
    };
    
    const layout = layouts[contentType] || layouts.general;
    
    if (screenWidth >= 1024) return layout.desktop;
    if (screenWidth >= 768) return layout.tablet;
    return layout.mobile;
  },
};

// ====================
// Animation-Ready Utilities
// ====================

/**
 * Utilities optimized for animations and transitions
 * Based on Material Motion framework principles
 */
export const animationUtils = {
  // Slide animations
  slideTransitions: {
    slideInLeft: {
      transform: [{ translateX: -100 }],
      opacity: 0,
    },
    slideInRight: {
      transform: [{ translateX: 100 }],
      opacity: 0,
    },
    slideInUp: {
      transform: [{ translateY: 100 }],
      opacity: 0,
    },
    slideInDown: {
      transform: [{ translateY: -100 }],
      opacity: 0,
    },
    slideVisible: {
      transform: [{ translateX: 0 }, { translateY: 0 }],
      opacity: 1,
    },
  },
  
  // Scale animations
  scaleTransitions: {
    scaleIn: {
      transform: [{ scale: 0.8 }],
      opacity: 0,
    },
    scaleOut: {
      transform: [{ scale: 1.2 }],
      opacity: 0,
    },
    scaleVisible: {
      transform: [{ scale: 1 }],
      opacity: 1,
    },
  },
  
  // Fade animations
  fadeTransitions: {
    fadeIn: {
      opacity: 0,
    },
    fadeOut: {
      opacity: 0,
    },
    fadeVisible: {
      opacity: 1,
    },
  },
  
  // Progressive disclosure animations
  progressiveDisclosureAnimations: {
    mysteryReveal: {
      initial: {
        opacity: 0.3,
        transform: [{ scale: 0.95 }],
      },
      revealed: {
        opacity: 1,
        transform: [{ scale: 1 }],
      },
    },
    gestureResponse: {
      initial: {
        transform: [{ scale: 1 }],
      },
      active: {
        transform: [{ scale: 1.05 }],
      },
    },
  },
  
  // AI collaboration animations
  aiCollaborationAnimations: {
    aiSuggestionAppear: {
      initial: {
        opacity: 0,
        transform: [{ translateY: 20 }],
      },
      visible: {
        opacity: 1,
        transform: [{ translateY: 0 }],
      },
    },
    thinkingIndicator: {
      animate: {
        opacity: [0.3, 1, 0.3],
        transform: [{ scale: 0.95 }, { scale: 1.05 }, { scale: 0.95 }],
      },
    },
  },
  
  // Cross-device sync animations
  syncAnimations: {
    deviceHandoff: {
      initial: {
        opacity: 0,
        transform: [{ scale: 0.9 }],
      },
      handingOff: {
        opacity: 0.7,
        transform: [{ scale: 1.1 }],
      },
      completed: {
        opacity: 1,
        transform: [{ scale: 1 }],
      },
    },
  },
  
  // Format transition animations
  formatTransitionAnimations: {
    storyToVideo: {
      story: {
        exit: { opacity: 0, transform: [{ scale: 0.8 }] },
      },
      video: {
        enter: { opacity: 1, transform: [{ scale: 1 }] },
      },
    },
    videoToMusic: {
      video: {
        exit: { opacity: 0, transform: [{ translateY: -50 }] },
      },
      music: {
        enter: { opacity: 1, transform: [{ translateY: 0 }] },
      },
    },
  },
};

// ====================
// Utility Composition Helpers
// ====================

/**
 * Utilities for composing and combining different utility systems
 */
export const utilityComposer = {
  // Combine multiple utility styles
  combine: (...utilityStyles) => {
    return utilityStyles.reduce((combined, style) => {
      return { ...combined, ...style };
    }, {});
  },
  
  // Create utility variant
  createVariant: (baseUtility, overrides) => {
    return { ...baseUtility, ...overrides };
  },
  
  // Apply theme to utilities
  applyTheme: (utilities, isDark = false) => {
    const colors = isDark ? darkColors : lightColors;
    const shadows = isDark ? darkShadows : shadows;
    
    return {
      ...utilities,
      color: colors.text,
      backgroundColor: colors.background,
      ...shadows.sm,
    };
  },
  
  // Create responsive utility set
  createResponsiveSet: (mobileUtils, tabletUtils, desktopUtils) => {
    return {
      mobile: mobileUtils,
      tablet: tabletUtils,
      desktop: desktopUtils,
    };
  },
  
  // Merge utility presets
  mergePresets: (preset1, preset2) => {
    return {
      ...preset1,
      ...preset2,
      // Deep merge nested objects
      text: { ...preset1.text, ...preset2.text },
      positioning: { ...preset1.positioning, ...preset2.positioning },
    };
  },
  
  // Create design research pattern
  createDesignPattern: (name, flexStyles, positioningStyles, textStyles) => {
    return {
      name,
      flex: flexStyles,
      positioning: positioningStyles,
      text: textStyles,
    };
  },
  
  // Create accessibility-enhanced utilities
  createAccessibleUtilities: (baseUtilities, options = {}) => {
    const {
      highContrast = false,
      largeText = false,
      reducedMotion = false,
    } = options;
    
    let enhancedUtilities = { ...baseUtilities };
    
    if (highContrast) {
      enhancedUtilities.color = '#000000';
      enhancedUtilities.backgroundColor = '#ffffff';
    }
    
    if (largeText) {
      enhancedUtilities.fontSize = (enhancedUtilities.fontSize || 16) * 1.25;
    }
    
    if (reducedMotion) {
      enhancedUtilities.animationDuration = 0;
      enhancedUtilities.transitionDuration = 0;
    }
    
    return enhancedUtilities;
  },
};

// ====================
// Utility Performance Helpers
// ====================

/**
 * Performance optimization utilities
 * Based on React Native best practices and FAANG performance standards
 */
export const utilityPerformance = {
  // Optimize styles for performance
  optimizeStyles: (styles) => {
    return {
      ...styles,
      // Enable hardware acceleration
      transform: styles.transform || [{ translateZ: 0 }],
      // Optimize text rendering
      includeFontPadding: false,
      textAlignVertical: 'center',
    };
  },
  
  // Create cached style objects
  createCachedStyles: (styleCreator) => {
    const cache = new Map();
    return (params) => {
      const key = JSON.stringify(params);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const styles = styleCreator(params);
      cache.set(key, styles);
      return styles;
    };
  },
  
  // Memory-efficient style creation
  createEfficientStyles: (baseStyles, variants = {}) => {
    const staticStyles = { ...baseStyles };
    return (variant) => {
      return variant ? { ...staticStyles, ...variants[variant] } : staticStyles;
    };
  },
  
  // Batch style updates
  batchStyleUpdates: (updates) => {
    return updates.reduce((batched, update) => {
      return { ...batched, ...update };
    }, {});
  },
  
  // Optimize for virtualization
  optimizeForVirtualization: (itemStyles) => {
    return {
      ...itemStyles,
      overflow: 'hidden',
      flexShrink: 0,
      // Ensure consistent sizing
      minHeight: itemStyles.height || 'auto',
      minWidth: itemStyles.width || 'auto',
    };
  },
};

// ====================
// Utility Validation
// ====================

/**
 * Utility validation system
 * Ensures utilities meet accessibility and usability standards
 */
export const utilityValidation = {
  // Validate accessibility
  validateAccessibility: (styles) => {
    const issues = [];
    
    // Check minimum touch targets
    if (styles.minHeight && styles.minHeight < 44) {
      issues.push('Touch target too small (minimum 44px)');
    }
    
    // Check text contrast (simplified)
    if (styles.color && styles.backgroundColor) {
      // Would use proper contrast calculation in production
      // issues.push('Insufficient color contrast');
    }
    
    // Check text size
    if (styles.fontSize && styles.fontSize < 12) {
      issues.push('Text size too small for accessibility');
    }
    
    return {
      isValid: issues.length === 0,
      issues,
    };
  },
  
  // Validate responsive behavior
  validateResponsive: (mobileStyles, tabletStyles, desktopStyles) => {
    const checks = {
      hasAllBreakpoints: !!(mobileStyles && tabletStyles && desktopStyles),
      consistentProperties: true, // Would check property consistency
      appropriateScaling: true,   // Would check scaling factors
    };
    
    return {
      isValid: Object.values(checks).every(Boolean),
      checks,
    };
  },
  
  // Validate performance
  validatePerformance: (styles) => {
    const warnings = [];
    
    // Check for expensive properties
    if (styles.shadowColor && !styles.elevation) {
      warnings.push('Consider using elevation instead of shadows for better performance');
    }
    
    // Check for unnecessary transforms
    if (styles.transform && styles.transform.length > 3) {
      warnings.push('Too many transforms may impact performance');
    }
    
    return {
      isOptimal: warnings.length === 0,
      warnings,
    };
  },
};

// ====================
// Development Helpers
// ====================

/**
 * Development and debugging utilities
 * Helps developers work with the utility system effectively
 */
export const utilityDevelopment = {
  // Debug utility information
  debugUtility: (utilityName, utility) => {
    if (__DEV__) {
      console.group(`🔧 Utility Debug: ${utilityName}`);
      console.log('Utility structure:', utility);
      console.log('Utility properties:', Object.keys(utility));
      console.log('Utility type:', typeof utility);
      console.groupEnd();
    }
  },
  
  // Measure utility performance
  measureUtility: (utilityFunction) => {
    if (__DEV__) {
      const start = Date.now();
      const result = utilityFunction();
      const end = Date.now();
      console.log(`⚡ Utility calculation took ${end - start}ms`);
      return result;
    }
    return utilityFunction();
  },
  
  // Validate utility tokens
  validateUtilityTokens: (utility) => {
    if (__DEV__) {
      const hasSpacing = utility.padding || utility.margin || utility.gap;
      const hasColors = utility.color || utility.backgroundColor || utility.borderColor;
      const hasTypography = utility.fontSize || utility.fontFamily || utility.fontWeight;
      const hasBorders = utility.borderRadius || utility.borderWidth;
      
      console.log('🔍 Utility token validation:', {
        spacing: hasSpacing,
        colors: hasColors,
        typography: hasTypography,
        borders: hasBorders,
      });
    }
  },
  
  // Create utility documentation
  documentUtility: (utilityName, utility, description) => {
    if (__DEV__) {
      return {
        name: utilityName,
        description,
        properties: Object.keys(utility),
        usage: `import { ${utilityName} } from 'src/styles/utilities';`,
        example: `<View style={${utilityName}.someProperty}>`,
      };
    }
  },
  
  // Generate utility report
  generateUtilityReport: (utilities) => {
    if (__DEV__) {
      const report = {
        totalUtilities: Object.keys(utilities).length,
        byCategory: {},
        performance: {
          cached: 0,
          uncached: 0,
        },
        accessibility: {
          compliant: 0,
          issues: 0,
        },
      };
      
      console.log('📊 Utility System Report:', report);
      return report;
    }
  },
};

// ====================
// Utility System Constants
// ====================

/**
 * Global utility system constants
 * Centralizes important values used across all utility systems
 */
export const utilitySystemConstants = {
  // Version info
  version: '1.0.0',
  
  // Supported platforms
  platforms: ['ios', 'android', 'web'],
  
  // Performance thresholds
  performance: {
    maxUtilityDepth: 5,
    maxCachedUtilities: 100,
    maxAnimationDuration: 500,
    optimalRenderTime: 16, // 60fps = 16ms per frame
  },
  
  // Design system integration
  designSystem: {
    spacingBase: 4,
    typographyScale: 1.25,
    borderRadiusBase: 4,
    shadowBase: 'sm',
  },
  
  // Accessibility requirements
  accessibility: {
    minTouchTarget: 44,
    minContrast: 4.5,
    maxTextWidth: 680,
    minFontSize: 12,
  },
  
  // Responsive breakpoints
  breakpoints: {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
    wide: 1400,
  },
  
  // Animation standards
  animations: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },
};

// ====================
// Default Export
// ====================

/**
 * Default export provides the most commonly used utility functions
 * For quick access to essential utility operations
 */
export default {
  // Core systems
  getUtilityStyles,
  utilityPresets,
  
  // Quick access to theme-aware getters
  flex: getFlexStyles,
  positioning: getPositioningStyles,
  text: getTextStyles,
  
  // Utilities
  responsive: responsiveUtils,
  animations: animationUtils,
  composer: utilityComposer,
  performance: utilityPerformance,
  validation: utilityValidation,
  
  // Development
  debug: utilityDevelopment,
  constants: utilitySystemConstants,
  
  // Common patterns (convenience access)
  common: (isDark = false) => utilityPresets.commonPatterns(isDark),
  modal: (isDark = false) => utilityPresets.modalSystem(isDark),
  reading: (isDark = false) => utilityPresets.readingExperience(isDark),
  
  // Design research patterns (convenience access)
  newsFeed: (isDark = false) => utilityPresets.newsFeed(isDark),
  ai: (isDark = false) => utilityPresets.aiCollaboration(isDark),
  creator: (isDark = false) => utilityPresets.creatorEconomy(isDark),
  sync: (isDark = false) => utilityPresets.crossDeviceSync(isDark),
  media: (isDark = false) => utilityPresets.multiFormatMedia(isDark),
  discovery: (isDark = false) => utilityPresets.progressiveDiscovery(isDark),
};

// 8,947 characters