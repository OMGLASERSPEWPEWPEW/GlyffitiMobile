// src/styles/utilities/text.js
// Path: src/styles/utilities/text.js

import { StyleSheet, PixelRatio, Dimensions } from 'react-native';
import { 
  lightColors, 
  darkColors, 
  typography, 
  spacing,
  borderRadius 
} from '../tokens';

/**
 * Text utilities - comprehensive typography system
 * Covers all text styling patterns for modern content platforms
 * Inspired by Design Research patterns and FAANG-level typography usage
 * Optimized for stories → videos → music content progression
 * 
 * Usage:
 * - Import specific utilities: textStyles.heading1, textStyles.body
 * - Theme-aware: use getTextStyles(isDark) for proper colors
 * - Combine: [textStyles.heading2, textStyles.centerAlign, textStyles.primaryColor]
 */

// Get screen dimensions for responsive text calculations
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const pixelRatio = PixelRatio.get();

// Text constants for consistent behavior
const textConstants = {
  // Reading optimization (Kindle research inspired)
  reading: {
    optimalLineLength: 680,        // Max characters per line for readability
    optimalLineHeight: 1.6,        // Optimal line height for reading
    minFontSize: 12,               // Minimum readable font size
    maxFontSize: 36,               // Maximum practical font size
    paragraphSpacing: 1.2,         // Spacing between paragraphs
  },
  
  // Responsive breakpoints for text scaling
  breakpoints: {
    small: 320,          // Small phones
    medium: 375,         // Standard phones
    large: 414,          // Large phones
    tablet: 768,         // Tablets
    desktop: 1024,       // Desktop
  },
  
  // Performance thresholds
  performance: {
    maxTextLength: 10000,          // Max text length for performance
    virtualizedThreshold: 100,     // When to use virtualized text
    cacheableLines: 50,            // Number of lines to cache
  },
  
  // Accessibility standards
  accessibility: {
    minContrast: 4.5,              // WCAG AA contrast ratio
    minContrastLarge: 3.0,         // WCAG AA for large text
    largeTextThreshold: 18,        // Font size threshold for large text
    minTouchTarget: 44,            // Minimum touch target for interactive text
  },
  
  // Multi-format text scaling
  formatScaling: {
    story: 1.0,          // Base scaling for stories
    video: 1.2,          // Slightly larger for video UI
    music: 1.4,          // Larger for music player
    captions: 0.9,       // Smaller for captions/subtitles
  },
};

// ====================
// Core Typography Properties
// ====================

// Font family utilities
const fontFamilies = {
  // Base families
  fontSystem: {
    fontFamily: typography.fontFamily,
  },
  
  fontSystemBold: {
    fontFamily: typography.fontFamilyBold || typography.fontFamily,
  },
  
  // Semantic families
  fontSans: {
    fontFamily: typography.fontFamily,
  },
  
  fontMono: {
    fontFamily: 'monospace',
  },
  
  // Content-specific families
  fontReading: {
    fontFamily: typography.fontFamily,
    // Optimized for long-form reading
  },
  
  fontDisplay: {
    fontFamily: typography.fontFamilyBold || typography.fontFamily,
    // For headings and display text
  },
  
  fontUI: {
    fontFamily: typography.fontFamily,
    // For UI elements and controls
  },
};

// Font size utilities
const fontSizes = {
  // Standard scale
  textXs: {
    fontSize: typography.fontSize.small || 12,
    lineHeight: typography.fontSize.small * 1.4 || 16,
  },
  
  textSm: {
    fontSize: typography.fontSize.medium || 14,
    lineHeight: typography.fontSize.medium * 1.4 || 19,
  },
  
  textBase: {
    fontSize: typography.fontSize.body || 16,
    lineHeight: typography.fontSize.body * 1.5 || 24,
  },
  
  textLg: {
    fontSize: typography.fontSize.large || 18,
    lineHeight: typography.fontSize.large * 1.4 || 25,
  },
  
  textXl: {
    fontSize: typography.fontSize.extraLarge || 20,
    lineHeight: typography.fontSize.extraLarge * 1.4 || 28,
  },
  
  text2Xl: {
    fontSize: typography.fontSize.title || 24,
    lineHeight: typography.fontSize.title * 1.2 || 29,
  },
  
  text3Xl: {
    fontSize: typography.fontSize.heading || 32,
    lineHeight: typography.fontSize.heading * 1.1 || 35,
  },
  
  text4Xl: {
    fontSize: 36,
    lineHeight: 40,
  },
  
  text5Xl: {
    fontSize: 48,
    lineHeight: 52,
  },
  
  text6Xl: {
    fontSize: 64,
    lineHeight: 68,
  },
  
  // Responsive sizes
  textResponsiveXs: {
    fontSize: Math.max(10, typography.fontSize.small * (screenWidth / 375)),
    lineHeight: Math.max(14, typography.fontSize.small * 1.4 * (screenWidth / 375)),
  },
  
  textResponsiveSm: {
    fontSize: Math.max(12, typography.fontSize.medium * (screenWidth / 375)),
    lineHeight: Math.max(16, typography.fontSize.medium * 1.4 * (screenWidth / 375)),
  },
  
  textResponsiveBase: {
    fontSize: Math.max(14, typography.fontSize.body * (screenWidth / 375)),
    lineHeight: Math.max(20, typography.fontSize.body * 1.5 * (screenWidth / 375)),
  },
};

// Font weight utilities
const fontWeights = {
  fontThin: {
    fontWeight: '100',
  },
  
  fontExtraLight: {
    fontWeight: '200',
  },
  
  fontLight: {
    fontWeight: typography.fontWeight.light || '300',
  },
  
  fontNormal: {
    fontWeight: typography.fontWeight.normal || '400',
  },
  
  fontMedium: {
    fontWeight: typography.fontWeight.medium || '500',
  },
  
  fontSemiBold: {
    fontWeight: '600',
  },
  
  fontBold: {
    fontWeight: typography.fontWeight.bold || '700',
  },
  
  fontExtraBold: {
    fontWeight: '800',
  },
  
  fontBlack: {
    fontWeight: '900',
  },
};

// Text alignment utilities
const textAlignment = {
  textLeft: {
    textAlign: 'left',
  },
  
  textCenter: {
    textAlign: 'center',
  },
  
  textRight: {
    textAlign: 'right',
  },
  
  textJustify: {
    textAlign: 'justify',
  },
  
  // Responsive alignment
  textStartOnLarge: {
    textAlign: 'left',
    // Would switch to start on larger screens
  },
  
  textCenterOnSmall: {
    textAlign: 'center',
    // Would switch to center on smaller screens
  },
};

// Line height utilities
const lineHeights = {
  leadingNone: {
    lineHeight: 1.0,
  },
  
  leadingTight: {
    lineHeight: typography.lineHeight.tight || 1.2,
  },
  
  leadingSnug: {
    lineHeight: 1.3,
  },
  
  leadingNormal: {
    lineHeight: typography.lineHeight.normal || 1.4,
  },
  
  leadingRelaxed: {
    lineHeight: typography.lineHeight.relaxed || 1.6,
  },
  
  leadingLoose: {
    lineHeight: 1.8,
  },
  
  // Content-optimized line heights
  leadingReading: {
    lineHeight: textConstants.reading.optimalLineHeight,
  },
  
  leadingUI: {
    lineHeight: 1.2,
  },
  
  leadingDisplay: {
    lineHeight: 1.1,
  },
};

// Text decoration utilities
const textDecoration = {
  underline: {
    textDecorationLine: 'underline',
  },
  
  lineThrough: {
    textDecorationLine: 'line-through',
  },
  
  noUnderline: {
    textDecorationLine: 'none',
  },
  
  // Styled underlines
  underlineThick: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    // React Native has limited text decoration support
  },
  
  underlineDotted: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
  },
};

// Text transform utilities
const textTransform = {
  uppercase: {
    textTransform: 'uppercase',
  },
  
  lowercase: {
    textTransform: 'lowercase',
  },
  
  capitalize: {
    textTransform: 'capitalize',
  },
  
  normalCase: {
    textTransform: 'none',
  },
};

// Text color utilities
const textColors = {
  // Base colors
  textPrimary: {
    color: lightColors.text,
  },
  
  textSecondary: {
    color: lightColors.textSecondary,
  },
  
  textTertiary: {
    color: lightColors.textTertiary,
  },
  
  textLight: {
    color: lightColors.textLight,
  },
  
  // Semantic colors
  textSuccess: {
    color: lightColors.success,
  },
  
  textError: {
    color: lightColors.error,
  },
  
  textWarning: {
    color: lightColors.warning,
  },
  
  textInfo: {
    color: lightColors.info,
  },
  
  // Brand colors
  textBrand: {
    color: lightColors.primary,
  },
  
  textAccent: {
    color: lightColors.accent,
  },
  
  // Interactive colors
  textLink: {
    color: lightColors.link,
  },
  
  textLinkHover: {
    color: lightColors.linkHover,
  },
  
  // Contrast colors
  textWhite: {
    color: '#ffffff',
  },
  
  textBlack: {
    color: '#000000',
  },
  
  // Opacity variations
  textOpacity50: {
    opacity: 0.5,
  },
  
  textOpacity75: {
    opacity: 0.75,
  },
  
  textOpacity90: {
    opacity: 0.9,
  },
};

// ====================
// Design Research Inspired Text Patterns
// ====================

// News Feed text patterns (Julie Zhuo's Facebook work)
const newsFeedTextPatterns = {
  // Feed post content
  feedPostContent: {
    fontSize: typography.fontSize.body || 16,
    lineHeight: 1.4,
    color: lightColors.text,
    fontFamily: typography.fontFamily,
  },
  
  // Feed headline
  feedHeadline: {
    fontSize: typography.fontSize.large || 18,
    lineHeight: 1.3,
    fontWeight: typography.fontWeight.bold || '700',
    color: lightColors.text,
    fontFamily: typography.fontFamilyBold || typography.fontFamily,
    marginBottom: spacing.small,
  },
  
  // Feed metadata
  feedMetadata: {
    fontSize: typography.fontSize.small || 12,
    lineHeight: 1.3,
    color: lightColors.textSecondary,
    fontFamily: typography.fontFamily,
  },
  
  // Engagement text
  engagementText: {
    fontSize: typography.fontSize.small || 12,
    lineHeight: 1.2,
    fontWeight: typography.fontWeight.medium || '500',
    color: lightColors.textSecondary,
    fontFamily: typography.fontFamily,
  },
  
  // Sponsored indicator text
  sponsoredText: {
    fontSize: typography.fontSize.small || 12,
    lineHeight: 1.2,
    fontWeight: typography.fontWeight.medium || '500',
    color: lightColors.textTertiary,
    fontFamily: typography.fontFamily,
    textTransform: 'uppercase',
  },
  
  // Algorithm priority text
  priorityText: {
    fontSize: typography.fontSize.small || 12,
    lineHeight: 1.2,
    fontWeight: typography.fontWeight.bold || '700',
    color: lightColors.primary,
    fontFamily: typography.fontFamilyBold || typography.fontFamily,
  },
  
  // Comments text
  commentsText: {
    fontSize: typography.fontSize.medium || 14,
    lineHeight: 1.4,
    color: lightColors.text,
    fontFamily: typography.fontFamily,
  },
  
  // Hashtag text
  hashtagText: {
    fontSize: typography.fontSize.medium || 14,
    lineHeight: 1.4,
    color: lightColors.link,
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.medium || '500',
  },
  
  // Mention text
  mentionText: {
    fontSize: typography.fontSize.medium || 14,
    lineHeight: 1.4,
    color: lightColors.link,
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.medium || '500',
  },
};

// Progressive disclosure text patterns (Snapchat mystery UX)
const progressiveDisclosureTextPatterns = {
  // Mystery hint text
  mysteryHintText: {
    fontSize: typography.fontSize.small || 12,
    lineHeight: 1.3,
    color: lightColors.textSecondary,
    fontFamily: typography.fontFamily,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  
  // Discovery prompt text
  discoveryPromptText: {
    fontSize: typography.fontSize.medium || 14,
    lineHeight: 1.4,
    color: lightColors.primary,
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.medium || '500',
    textAlign: 'center',
  },
  
  // Tutorial instruction text
  tutorialInstructionText: {
    fontSize: typography.fontSize.medium || 14,
    lineHeight: 1.5,
    color: lightColors.text,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
  },
  
  // Hidden feature label
  hiddenFeatureLabel: {
    fontSize: typography.fontSize.small || 12,
    lineHeight: 1.2,
    color: lightColors.textTertiary,
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.medium || '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Exploration instruction
  explorationInstruction: {
    fontSize: typography.fontSize.small || 12,
    lineHeight: 1.4,
    color: lightColors.textSecondary,
    fontFamily: typography.fontFamily,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  
  // Progressive reveal text
  progressiveRevealText: {
    fontSize: typography.fontSize.medium || 14,
    lineHeight: 1.4,
    color: lightColors.text,
    fontFamily: typography.fontFamily,
    opacity: 0,                            // Start hidden
    transform: [{ scale: 0.9 }],           // Animation ready
  },
  
  // Gesture hint text
  gestureHintText: {
    fontSize: typography.fontSize.small || 12,
    lineHeight: 1.3,
    color: lightColors.textLight,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
    opacity: 0.7,
  },
  
  // Secret content text
  secretContentText: {
    fontSize: typography.fontSize.medium || 14,
    lineHeight: 1.4,
    color: lightColors.accent,
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.medium || '500',
  },
};

// AI collaboration text patterns (Jenny Blackburn research)
const aiCollaborationTextPatterns = {
  // AI assistant text
  aiAssistantText: {
    fontSize: typography.fontSize.medium || 14,
    lineHeight: 1.4,
    color: lightColors.primary,
    fontFamily: typography.fontFamily,
    fontStyle: 'italic',
  },
  
  // Human input text
  humanInputText: {
    fontSize: typography.fontSize.body || 16,
    lineHeight: 1.5,
    color: lightColors.text,
    fontFamily: typography.fontFamily,
  },
  
  // AI suggestion text
  aiSuggestionText: {
    fontSize: typography.fontSize.medium || 14,
    lineHeight: 1.4,
    color: lightColors.textSecondary,
    fontFamily: typography.fontFamily,
    backgroundColor: lightColors.backgroundSecondary,
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.extraSmall,
    borderRadius: borderRadius.small,
  },
  
  // Collaborative edit indicator
  collaborativeEditText: {
    fontSize: typography.fontSize.small || 12,
    lineHeight: 1.2,
    color: lightColors.accent,
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.medium || '500',
  },
  
  // AI thinking indicator
  aiThinkingText: {
    fontSize: typography.fontSize.small || 12,
    lineHeight: 1.2,
    color: lightColors.textSecondary,
    fontFamily: typography.fontFamily,
    fontStyle: 'italic',
  },
  
  // Voice command text
  voiceCommandText: {
    fontSize: typography.fontSize.large || 18,
    lineHeight: 1.3,
    color: lightColors.primary,
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.medium || '500',
    textAlign: 'center',
  },
  
  // AI confidence indicator
  aiConfidenceText: {
    fontSize: typography.fontSize.small || 12,
    lineHeight: 1.2,
    color: lightColors.textTertiary,
    fontFamily: typography.fontFamily,
  },
  
  // Multimodal instruction
  multimodalInstructionText: {
    fontSize: typography.fontSize.medium || 14,
    lineHeight: 1.4,
    color: lightColors.textSecondary,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
  },
  
  // Smart autocomplete text
  smartAutocompleteText: {
    fontSize: typography.fontSize.medium || 14,
    lineHeight: 1.4,
    color: lightColors.textLight,
    fontFamily: typography.fontFamily,
    opacity: 0.7,
  },
};

// Creator economy text patterns (Spotify for Artists inspiration)
const creatorEconomyTextPatterns = {
  // Creator dashboard metric
  dashboardMetricText: {
    fontSize: typography.fontSize.title || 24,
    lineHeight: 1.2,
    fontWeight: typography.fontWeight.bold || '700',
    color: lightColors.text,
    fontFamily: typography.fontFamilyBold || typography.fontFamily,
  },
  
  // Revenue display text
  revenueText: {
    fontSize: typography.fontSize.extraLarge || 20,
    lineHeight: 1.2,
    fontWeight: typography.fontWeight.bold || '700',
    color: lightColors.success,
    fontFamily: typography.fontFamilyBold || typography.fontFamily,
  },
  
  // Analytics label
  analyticsLabelText: {
    fontSize: typography.fontSize.small || 12,
    lineHeight: 1.2,
    color: lightColors.textSecondary,
    fontFamily: typography.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Performance indicator
  performanceIndicatorText: {
    fontSize: typography.fontSize.medium || 14,
    lineHeight: 1.3,
    fontWeight: typography.fontWeight.medium || '500',
    color: lightColors.text,
    fontFamily: typography.fontFamily,
  },
  
  // Audience count text
  audienceCountText: {
    fontSize: typography.fontSize.large || 18,
    lineHeight: 1.2,
    fontWeight: typography.fontWeight.bold || '700',
    color: lightColors.primary,
    fontFamily: typography.fontFamilyBold || typography.fontFamily,
  },
  
  // Monetization opportunity text
  monetizationOpportunityText: {
    fontSize: typography.fontSize.medium || 14,
    lineHeight: 1.4,
    color: lightColors.warning,
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.medium || '500',
  },
  
  // Creator tip text
  creatorTipText: {
    fontSize: typography.fontSize.small || 12,
    lineHeight: 1.4,
    color: lightColors.textSecondary,
    fontFamily: typography.fontFamily,
    fontStyle: 'italic',
  },
  
  // Content status text
  contentStatusText: {
    fontSize: typography.fontSize.small || 12,
    lineHeight: 1.2,
    fontWeight: typography.fontWeight.medium || '500',
    color: lightColors.textSecondary,
    fontFamily: typography.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  
  // Collaboration request text
  collaborationRequestText: {
    fontSize: typography.fontSize.medium || 14,
    lineHeight: 1.4,
    color: lightColors.accent,
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.medium || '500',
  },
};

// Cross-device sync text patterns (Kindle inspiration)
const crossDeviceSyncTextPatterns = {
  // Sync status text
  syncStatusText: {
    fontSize: typography.fontSize.small || 12,
    lineHeight: 1.2,
    color: lightColors.primary,
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.medium || '500',
  },
  
  // Continuation prompt text
  continuationPromptText: {
    fontSize: typography.fontSize.medium || 14,
    lineHeight: 1.4,
    color: lightColors.text,
    fontFamily: typography.fontFamily,
  },
  
  // Device indicator text
  deviceIndicatorText: {
    fontSize: typography.fontSize.small || 12,
    lineHeight: 1.2,
    color: lightColors.textSecondary,
    fontFamily: typography.fontFamily,
  },
  
  // Progress sync text
  progressSyncText: {
    fontSize: typography.fontSize.small || 12,
    lineHeight: 1.2,
    color: lightColors.textTertiary,
    fontFamily: typography.fontFamily,
  },
  
  // Reading position text
  readingPositionText: {
    fontSize: typography.fontSize.small || 12,
    lineHeight: 1.2,
    color: lightColors.textLight,
    fontFamily: typography.fontFamily,
    opacity: 0.8,
  },
  
  // Handoff instruction text
  handoffInstructionText: {
    fontSize: typography.fontSize.medium || 14,
    lineHeight: 1.4,
    color: lightColors.textSecondary,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
  },
  
  // Device availability text
  deviceAvailabilityText: {
    fontSize: typography.fontSize.small || 12,
    lineHeight: 1.2,
    color: lightColors.success,
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.medium || '500',
  },
  
  // Sync conflict text
  syncConflictText: {
    fontSize: typography.fontSize.small || 12,
    lineHeight: 1.3,
    color: lightColors.warning,
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.medium || '500',
  },
};

// Multi-format media text patterns (stories → videos → music)
const multiFormatMediaTextPatterns = {
  // Story title text
  storyTitleText: {
    fontSize: typography.fontSize.title || 24,
    lineHeight: 1.3,
    fontWeight: typography.fontWeight.bold || '700',
    color: lightColors.text,
    fontFamily: typography.fontFamilyBold || typography.fontFamily,
    marginBottom: spacing.medium,
  },
  
  // Story body text (reading optimized)
  storyBodyText: {
    fontSize: typography.fontSize.body || 16,
    lineHeight: textConstants.reading.optimalLineHeight,
    color: lightColors.text,
    fontFamily: typography.fontFamily,
    textAlign: 'left',
    maxWidth: textConstants.reading.optimalLineLength,
  },
  
  // Video title text
  videoTitleText: {
    fontSize: typography.fontSize.large || 18,
    lineHeight: 1.3,
    fontWeight: typography.fontWeight.bold || '700',
    color: '#ffffff',                      // White for video overlay
    fontFamily: typography.fontFamilyBold || typography.fontFamily,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  // Video caption text
  videoCaptionText: {
    fontSize: typography.fontSize.medium || 14,
    lineHeight: 1.4,
    color: '#ffffff',
    fontFamily: typography.fontFamily,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.extraSmall,
    borderRadius: borderRadius.small,
  },
  
  // Music track title
  musicTrackTitleText: {
    fontSize: typography.fontSize.large || 18,
    lineHeight: 1.3,
    fontWeight: typography.fontWeight.bold || '700',
    color: lightColors.text,
    fontFamily: typography.fontFamilyBold || typography.fontFamily,
  },
  
  // Music artist text
  musicArtistText: {
    fontSize: typography.fontSize.medium || 14,
    lineHeight: 1.3,
    color: lightColors.textSecondary,
    fontFamily: typography.fontFamily,
  },
  
  // Music time display
  musicTimeText: {
    fontSize: typography.fontSize.small || 12,
    lineHeight: 1.2,
    color: lightColors.textTertiary,
    fontFamily: 'monospace',               // Monospace for time alignment
    fontWeight: typography.fontWeight.medium || '500',
  },
  
  // Playback control text
  playbackControlText: {
    fontSize: typography.fontSize.small || 12,
    lineHeight: 1.2,
    color: lightColors.textSecondary,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
  },
  
  // Format transition text
  formatTransitionText: {
    fontSize: typography.fontSize.medium || 14,
    lineHeight: 1.4,
    color: lightColors.accent,
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.medium || '500',
    textAlign: 'center',
  },
  
  // Audio waveform label
  audioWaveformLabelText: {
    fontSize: typography.fontSize.small || 12,
    lineHeight: 1.2,
    color: lightColors.textLight,
    fontFamily: typography.fontFamily,
    opacity: 0.8,
  },
};

// ====================
// Reading Experience Patterns (Kindle Research Inspired)
// ====================

const readingExperiencePatterns = {
  // Optimized reading text
  readingOptimized: {
    fontSize: typography.fontSize.body || 16,
    lineHeight: textConstants.reading.optimalLineHeight,
    color: lightColors.text,
    fontFamily: typography.fontFamily,
    textAlign: 'left',
    maxWidth: textConstants.reading.optimalLineLength,
    paddingHorizontal: spacing.large,      // 24px for comfortable margins
  },
  
  // Reading title
  readingTitle: {
    fontSize: typography.fontSize.heading || 32,
    lineHeight: 1.2,
    fontWeight: typography.fontWeight.bold || '700',
    color: lightColors.text,
    fontFamily: typography.fontFamilyBold || typography.fontFamily,
    marginBottom: spacing.large,
    textAlign: 'left',
  },
  
  // Reading subtitle
  readingSubtitle: {
    fontSize: typography.fontSize.large || 18,
    lineHeight: 1.3,
    color: lightColors.textSecondary,
    fontFamily: typography.fontFamily,
    fontStyle: 'italic',
    marginBottom: spacing.medium,
    textAlign: 'left',
  },
  
  // Reading metadata
  readingMetadata: {
    fontSize: typography.fontSize.small || 12,
    lineHeight: 1.3,
    color: lightColors.textTertiary,
    fontFamily: typography.fontFamily,
    marginBottom: spacing.large,
  },
  
  // Chapter heading
  chapterHeading: {
    fontSize: typography.fontSize.title || 24,
    lineHeight: 1.2,
    fontWeight: typography.fontWeight.bold || '700',
    color: lightColors.text,
    fontFamily: typography.fontFamilyBold || typography.fontFamily,
    marginTop: spacing.xxlarge,
    marginBottom: spacing.large,
    textAlign: 'left',
  },
  
  // Reading progress text
  readingProgressText: {
    fontSize: typography.fontSize.small || 12,
    lineHeight: 1.2,
    color: lightColors.textLight,
    fontFamily: typography.fontFamily,
    opacity: 0.7,
  },
  
  // Quote text
  quoteText: {
    fontSize: typography.fontSize.body || 16,
    lineHeight: 1.5,
    color: lightColors.textSecondary,
    fontFamily: typography.fontFamily,
    fontStyle: 'italic',
    paddingLeft: spacing.medium,
    borderLeftWidth: 3,
    borderLeftColor: lightColors.border,
  },
  
  // Footnote text
  footnoteText: {
    fontSize: typography.fontSize.small || 12,
    lineHeight: 1.4,
    color: lightColors.textSecondary,
    fontFamily: typography.fontFamily,
  },
  
  // Reading controls text
  readingControlsText: {
    fontSize: typography.fontSize.small || 12,
    lineHeight: 1.2,
    color: lightColors.textSecondary,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
  },
};

// ====================
// Responsive Text Patterns
// ====================

const responsiveTextPatterns = {
  // Mobile-optimized text
  textMobile: {
    fontSize: typography.fontSize.medium || 14,
    lineHeight: 1.4,
    color: lightColors.text,
    fontFamily: typography.fontFamily,
  },
  
  // Tablet-optimized text
  textTablet: {
    fontSize: typography.fontSize.body || 16,
    lineHeight: 1.5,
    color: lightColors.text,
    fontFamily: typography.fontFamily,
  },
  
  // Desktop-optimized text
  textDesktop: {
    fontSize: typography.fontSize.large || 18,
    lineHeight: 1.6,
    color: lightColors.text,
    fontFamily: typography.fontFamily,
  },
  
  // Auto-scaling text
  textAutoScale: {
    fontSize: Math.max(14, typography.fontSize.body * (screenWidth / 375)),
    lineHeight: Math.max(20, typography.fontSize.body * 1.4 * (screenWidth / 375)),
    color: lightColors.text,
    fontFamily: typography.fontFamily,
  },
  
  // High DPI text
  textHighDPI: {
    fontSize: typography.fontSize.body * pixelRatio,
    lineHeight: typography.fontSize.body * 1.4 * pixelRatio,
    color: lightColors.text,
    fontFamily: typography.fontFamily,
  },
};

// ====================
// Accessibility Text Patterns
// ====================

const accessibilityTextPatterns = {
  // High contrast text
  textHighContrast: {
    fontSize: typography.fontSize.body || 16,
    lineHeight: 1.5,
    color: '#000000',
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.bold || '700',
  },
  
  // Large text for accessibility
  textLarge: {
    fontSize: Math.max(18, typography.fontSize.body * 1.2),
    lineHeight: 1.4,
    color: lightColors.text,
    fontFamily: typography.fontFamily,
  },
  
  // Screen reader optimized
  textScreenReader: {
    fontSize: typography.fontSize.body || 16,
    lineHeight: 1.5,
    color: lightColors.text,
    fontFamily: typography.fontFamily,
    // Additional screen reader properties would be handled via accessibilityLabel
  },
  
  // Focus indicator text
  textFocusIndicator: {
    fontSize: typography.fontSize.body || 16,
    lineHeight: 1.5,
    color: lightColors.text,
    fontFamily: typography.fontFamily,
    backgroundColor: lightColors.primary,
    color: '#ffffff',
    paddingHorizontal: spacing.extraSmall,
    paddingVertical: spacing.tiny,
  },
  
  // High visibility text
  textHighVisibility: {
    fontSize: typography.fontSize.large || 18,
    lineHeight: 1.4,
    fontWeight: typography.fontWeight.bold || '700',
    color: lightColors.text,
    fontFamily: typography.fontFamilyBold || typography.fontFamily,
    textShadowColor: lightColors.background,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
};

// Create StyleSheet
export const textStyles = StyleSheet.create({
  // Core typography properties
  ...fontFamilies,
  ...fontSizes,
  ...fontWeights,
  ...textAlignment,
  ...lineHeights,
  ...textDecoration,
  ...textTransform,
  ...textColors,
  
  // Design research patterns
  ...newsFeedTextPatterns,
  ...progressiveDisclosureTextPatterns,
  ...aiCollaborationTextPatterns,
  ...creatorEconomyTextPatterns,
  ...crossDeviceSyncTextPatterns,
  ...multiFormatMediaTextPatterns,
  
  // Reading experience patterns
  ...readingExperiencePatterns,
  
  // Responsive patterns
  ...responsiveTextPatterns,
  
  // Accessibility patterns
  ...accessibilityTextPatterns,
});

// Dark theme text styles
const darkTextStyles = StyleSheet.create({
  // Base colors for dark theme
  textPrimary: {
    color: darkColors.text,
  },
  
  textSecondary: {
    color: darkColors.textSecondary,
  },
  
  textTertiary: {
    color: darkColors.textTertiary,
  },
  
  textLight: {
    color: darkColors.textLight,
  },
  
  // Semantic colors for dark theme
  textSuccess: {
    color: darkColors.success,
  },
  
  textError: {
    color: darkColors.error,
  },
  
  textWarning: {
    color: darkColors.warning,
  },
  
  textInfo: {
    color: darkColors.info,
  },
  
  // Brand colors for dark theme
  textBrand: {
    color: darkColors.primary,
  },
  
  textAccent: {
    color: darkColors.accent,
  },
  
  // Interactive colors for dark theme
  textLink: {
    color: darkColors.link,
  },
  
  textLinkHover: {
    color: darkColors.linkHover,
  },
  
  // News Feed patterns for dark theme
  feedPostContent: {
    ...newsFeedTextPatterns.feedPostContent,
    color: darkColors.text,
  },
  
  feedHeadline: {
    ...newsFeedTextPatterns.feedHeadline,
    color: darkColors.text,
  },
  
  feedMetadata: {
    ...newsFeedTextPatterns.feedMetadata,
    color: darkColors.textSecondary,
  },
  
  engagementText: {
    ...newsFeedTextPatterns.engagementText,
    color: darkColors.textSecondary,
  },
  
  sponsoredText: {
    ...newsFeedTextPatterns.sponsoredText,
    color: darkColors.textTertiary,
  },
  
  priorityText: {
    ...newsFeedTextPatterns.priorityText,
    color: darkColors.primary,
  },
  
  commentsText: {
    ...newsFeedTextPatterns.commentsText,
    color: darkColors.text,
  },
  
  hashtagText: {
    ...newsFeedTextPatterns.hashtagText,
    color: darkColors.link,
  },
  
  mentionText: {
    ...newsFeedTextPatterns.mentionText,
    color: darkColors.link,
  },
  
  // Progressive disclosure patterns for dark theme
  mysteryHintText: {
    ...progressiveDisclosureTextPatterns.mysteryHintText,
    color: darkColors.textSecondary,
  },
  
  discoveryPromptText: {
    ...progressiveDisclosureTextPatterns.discoveryPromptText,
    color: darkColors.primary,
  },
  
  tutorialInstructionText: {
    ...progressiveDisclosureTextPatterns.tutorialInstructionText,
    color: darkColors.text,
  },
  
  hiddenFeatureLabel: {
    ...progressiveDisclosureTextPatterns.hiddenFeatureLabel,
    color: darkColors.textTertiary,
  },
  
  explorationInstruction: {
    ...progressiveDisclosureTextPatterns.explorationInstruction,
    color: darkColors.textSecondary,
  },
  
  progressiveRevealText: {
    ...progressiveDisclosureTextPatterns.progressiveRevealText,
    color: darkColors.text,
  },
  
  gestureHintText: {
    ...progressiveDisclosureTextPatterns.gestureHintText,
    color: darkColors.textLight,
  },
  
  secretContentText: {
    ...progressiveDisclosureTextPatterns.secretContentText,
    color: darkColors.accent,
  },
  
  // AI collaboration patterns for dark theme
  aiAssistantText: {
    ...aiCollaborationTextPatterns.aiAssistantText,
    color: darkColors.primary,
  },
  
  humanInputText: {
    ...aiCollaborationTextPatterns.humanInputText,
    color: darkColors.text,
  },
  
  aiSuggestionText: {
    ...aiCollaborationTextPatterns.aiSuggestionText,
    color: darkColors.textSecondary,
    backgroundColor: darkColors.backgroundSecondary,
  },
  
  collaborativeEditText: {
    ...aiCollaborationTextPatterns.collaborativeEditText,
    color: darkColors.accent,
  },
  
  aiThinkingText: {
    ...aiCollaborationTextPatterns.aiThinkingText,
    color: darkColors.textSecondary,
  },
  
  voiceCommandText: {
    ...aiCollaborationTextPatterns.voiceCommandText,
    color: darkColors.primary,
  },
  
  aiConfidenceText: {
    ...aiCollaborationTextPatterns.aiConfidenceText,
    color: darkColors.textTertiary,
  },
  
  multimodalInstructionText: {
    ...aiCollaborationTextPatterns.multimodalInstructionText,
    color: darkColors.textSecondary,
  },
  
  smartAutocompleteText: {
    ...aiCollaborationTextPatterns.smartAutocompleteText,
    color: darkColors.textLight,
  },
  
  // Creator economy patterns for dark theme
  dashboardMetricText: {
    ...creatorEconomyTextPatterns.dashboardMetricText,
    color: darkColors.text,
  },
  
  revenueText: {
    ...creatorEconomyTextPatterns.revenueText,
    color: darkColors.success,
  },
  
  analyticsLabelText: {
    ...creatorEconomyTextPatterns.analyticsLabelText,
    color: darkColors.textSecondary,
  },
  
  performanceIndicatorText: {
    ...creatorEconomyTextPatterns.performanceIndicatorText,
    color: darkColors.text,
  },
  
  audienceCountText: {
    ...creatorEconomyTextPatterns.audienceCountText,
    color: darkColors.primary,
  },
  
  monetizationOpportunityText: {
    ...creatorEconomyTextPatterns.monetizationOpportunityText,
    color: darkColors.warning,
  },
  
  creatorTipText: {
    ...creatorEconomyTextPatterns.creatorTipText,
    color: darkColors.textSecondary,
  },
  
  contentStatusText: {
    ...creatorEconomyTextPatterns.contentStatusText,
    color: darkColors.textSecondary,
  },
  
  collaborationRequestText: {
    ...creatorEconomyTextPatterns.collaborationRequestText,
    color: darkColors.accent,
  },
  
  // Cross-device sync patterns for dark theme
  syncStatusText: {
    ...crossDeviceSyncTextPatterns.syncStatusText,
    color: darkColors.primary,
  },
  
  continuationPromptText: {
    ...crossDeviceSyncTextPatterns.continuationPromptText,
    color: darkColors.text,
  },
  
  deviceIndicatorText: {
    ...crossDeviceSyncTextPatterns.deviceIndicatorText,
    color: darkColors.textSecondary,
  },
  
  progressSyncText: {
    ...crossDeviceSyncTextPatterns.progressSyncText,
    color: darkColors.textTertiary,
  },
  
  readingPositionText: {
    ...crossDeviceSyncTextPatterns.readingPositionText,
    color: darkColors.textLight,
  },
  
  handoffInstructionText: {
    ...crossDeviceSyncTextPatterns.handoffInstructionText,
    color: darkColors.textSecondary,
  },
  
  deviceAvailabilityText: {
    ...crossDeviceSyncTextPatterns.deviceAvailabilityText,
    color: darkColors.success,
  },
  
  syncConflictText: {
    ...crossDeviceSyncTextPatterns.syncConflictText,
    color: darkColors.warning,
  },
  
  // Multi-format media patterns for dark theme
  storyTitleText: {
    ...multiFormatMediaTextPatterns.storyTitleText,
    color: darkColors.text,
  },
  
  storyBodyText: {
    ...multiFormatMediaTextPatterns.storyBodyText,
    color: darkColors.text,
  },
  
  videoTitleText: {
    ...multiFormatMediaTextPatterns.videoTitleText,
    // Keep white for video overlay
  },
  
  videoCaptionText: {
    ...multiFormatMediaTextPatterns.videoCaptionText,
    // Keep white for video overlay
  },
  
  musicTrackTitleText: {
    ...multiFormatMediaTextPatterns.musicTrackTitleText,
    color: darkColors.text,
  },
  
  musicArtistText: {
    ...multiFormatMediaTextPatterns.musicArtistText,
    color: darkColors.textSecondary,
  },
  
  musicTimeText: {
    ...multiFormatMediaTextPatterns.musicTimeText,
    color: darkColors.textTertiary,
  },
  
  playbackControlText: {
    ...multiFormatMediaTextPatterns.playbackControlText,
    color: darkColors.textSecondary,
  },
  
  formatTransitionText: {
    ...multiFormatMediaTextPatterns.formatTransitionText,
    color: darkColors.accent,
  },
  
  audioWaveformLabelText: {
    ...multiFormatMediaTextPatterns.audioWaveformLabelText,
    color: darkColors.textLight,
  },
  
  // Reading experience patterns for dark theme
  readingOptimized: {
    ...readingExperiencePatterns.readingOptimized,
    color: darkColors.text,
  },
  
  readingTitle: {
    ...readingExperiencePatterns.readingTitle,
    color: darkColors.text,
  },
  
  readingSubtitle: {
    ...readingExperiencePatterns.readingSubtitle,
    color: darkColors.textSecondary,
  },
  
  readingMetadata: {
    ...readingExperiencePatterns.readingMetadata,
    color: darkColors.textTertiary,
  },
  
  chapterHeading: {
    ...readingExperiencePatterns.chapterHeading,
    color: darkColors.text,
  },
  
  readingProgressText: {
    ...readingExperiencePatterns.readingProgressText,
    color: darkColors.textLight,
  },
  
  quoteText: {
    ...readingExperiencePatterns.quoteText,
    color: darkColors.textSecondary,
    borderLeftColor: darkColors.border,
  },
  
  footnoteText: {
    ...readingExperiencePatterns.footnoteText,
    color: darkColors.textSecondary,
  },
  
  readingControlsText: {
    ...readingExperiencePatterns.readingControlsText,
    color: darkColors.textSecondary,
  },
  
  // Responsive patterns for dark theme
  textMobile: {
    ...responsiveTextPatterns.textMobile,
    color: darkColors.text,
  },
  
  textTablet: {
    ...responsiveTextPatterns.textTablet,
    color: darkColors.text,
  },
  
  textDesktop: {
    ...responsiveTextPatterns.textDesktop,
    color: darkColors.text,
  },
  
  textAutoScale: {
    ...responsiveTextPatterns.textAutoScale,
    color: darkColors.text,
  },
  
  textHighDPI: {
    ...responsiveTextPatterns.textHighDPI,
    color: darkColors.text,
  },
  
  // Accessibility patterns for dark theme
  textHighContrast: {
    ...accessibilityTextPatterns.textHighContrast,
    color: '#ffffff',
  },
  
  textLarge: {
    ...accessibilityTextPatterns.textLarge,
    color: darkColors.text,
  },
  
  textScreenReader: {
    ...accessibilityTextPatterns.textScreenReader,
    color: darkColors.text,
  },
  
  textFocusIndicator: {
    ...accessibilityTextPatterns.textFocusIndicator,
    backgroundColor: darkColors.primary,
  },
  
  textHighVisibility: {
    ...accessibilityTextPatterns.textHighVisibility,
    color: darkColors.text,
    textShadowColor: darkColors.background,
  },
});

// Theme-aware text getter
export const getTextStyles = (isDark = false) => {
  const base = textStyles;
  const dark = darkTextStyles;
  
  return {
    // Core typography (same structure for both themes)
    fontSystem: base.fontSystem,
    fontSystemBold: base.fontSystemBold,
    fontSans: base.fontSans,
    fontMono: base.fontMono,
    fontReading: base.fontReading,
    fontDisplay: base.fontDisplay,
    fontUI: base.fontUI,
    
    // Font sizes (same for both themes)
    textXs: base.textXs,
    textSm: base.textSm,
    textBase: base.textBase,
    textLg: base.textLg,
    textXl: base.textXl,
    text2Xl: base.text2Xl,
    text3Xl: base.text3Xl,
    text4Xl: base.text4Xl,
    text5Xl: base.text5Xl,
    text6Xl: base.text6Xl,
    textResponsiveXs: base.textResponsiveXs,
    textResponsiveSm: base.textResponsiveSm,
    textResponsiveBase: base.textResponsiveBase,
    
    // Font weights (same for both themes)
    fontThin: base.fontThin,
    fontExtraLight: base.fontExtraLight,
    fontLight: base.fontLight,
    fontNormal: base.fontNormal,
    fontMedium: base.fontMedium,
    fontSemiBold: base.fontSemiBold,
    fontBold: base.fontBold,
    fontExtraBold: base.fontExtraBold,
    fontBlack: base.fontBlack,
    
    // Text alignment (same for both themes)
    textLeft: base.textLeft,
    textCenter: base.textCenter,
    textRight: base.textRight,
    textJustify: base.textJustify,
    textStartOnLarge: base.textStartOnLarge,
    textCenterOnSmall: base.textCenterOnSmall,
    
    // Line heights (same for both themes)
    leadingNone: base.leadingNone,
    leadingTight: base.leadingTight,
    leadingSnug: base.leadingSnug,
    leadingNormal: base.leadingNormal,
    leadingRelaxed: base.leadingRelaxed,
    leadingLoose: base.leadingLoose,
    leadingReading: base.leadingReading,
    leadingUI: base.leadingUI,
    leadingDisplay: base.leadingDisplay,
    
    // Text decoration (same for both themes)
    underline: base.underline,
    lineThrough: base.lineThrough,
    noUnderline: base.noUnderline,
    underlineThick: base.underlineThick,
    underlineDotted: base.underlineDotted,
    
    // Text transform (same for both themes)
    uppercase: base.uppercase,
    lowercase: base.lowercase,
    capitalize: base.capitalize,
    normalCase: base.normalCase,
    
    // Text colors (theme-aware)
    textPrimary: isDark ? dark.textPrimary : base.textPrimary,
    textSecondary: isDark ? dark.textSecondary : base.textSecondary,
    textTertiary: isDark ? dark.textTertiary : base.textTertiary,
    textLight: isDark ? dark.textLight : base.textLight,
    textSuccess: isDark ? dark.textSuccess : base.textSuccess,
    textError: isDark ? dark.textError : base.textError,
    textWarning: isDark ? dark.textWarning : base.textWarning,
    textInfo: isDark ? dark.textInfo : base.textInfo,
    textBrand: isDark ? dark.textBrand : base.textBrand,
    textAccent: isDark ? dark.textAccent : base.textAccent,
    textLink: isDark ? dark.textLink : base.textLink,
    textLinkHover: isDark ? dark.textLinkHover : base.textLinkHover,
    textWhite: base.textWhite,
    textBlack: base.textBlack,
    textOpacity50: base.textOpacity50,
    textOpacity75: base.textOpacity75,
    textOpacity90: base.textOpacity90,
    
    // News Feed patterns (theme-aware)
    feedPostContent: isDark ? dark.feedPostContent : base.feedPostContent,
    feedHeadline: isDark ? dark.feedHeadline : base.feedHeadline,
    feedMetadata: isDark ? dark.feedMetadata : base.feedMetadata,
    engagementText: isDark ? dark.engagementText : base.engagementText,
    sponsoredText: isDark ? dark.sponsoredText : base.sponsoredText,
    priorityText: isDark ? dark.priorityText : base.priorityText,
    commentsText: isDark ? dark.commentsText : base.commentsText,
    hashtagText: isDark ? dark.hashtagText : base.hashtagText,
    mentionText: isDark ? dark.mentionText : base.mentionText,
    
    // Progressive disclosure patterns (theme-aware)
    mysteryHintText: isDark ? dark.mysteryHintText : base.mysteryHintText,
    discoveryPromptText: isDark ? dark.discoveryPromptText : base.discoveryPromptText,
    tutorialInstructionText: isDark ? dark.tutorialInstructionText : base.tutorialInstructionText,
    hiddenFeatureLabel: isDark ? dark.hiddenFeatureLabel : base.hiddenFeatureLabel,
    explorationInstruction: isDark ? dark.explorationInstruction : base.explorationInstruction,
    progressiveRevealText: isDark ? dark.progressiveRevealText : base.progressiveRevealText,
    gestureHintText: isDark ? dark.gestureHintText : base.gestureHintText,
    secretContentText: isDark ? dark.secretContentText : base.secretContentText,
    
    // AI collaboration patterns (theme-aware)
    aiAssistantText: isDark ? dark.aiAssistantText : base.aiAssistantText,
    humanInputText: isDark ? dark.humanInputText : base.humanInputText,
    aiSuggestionText: isDark ? dark.aiSuggestionText : base.aiSuggestionText,
    collaborativeEditText: isDark ? dark.collaborativeEditText : base.collaborativeEditText,
    aiThinkingText: isDark ? dark.aiThinkingText : base.aiThinkingText,
    voiceCommandText: isDark ? dark.voiceCommandText : base.voiceCommandText,
    aiConfidenceText: isDark ? dark.aiConfidenceText : base.aiConfidenceText,
    multimodalInstructionText: isDark ? dark.multimodalInstructionText : base.multimodalInstructionText,
    smartAutocompleteText: isDark ? dark.smartAutocompleteText : base.smartAutocompleteText,
    
    // Creator economy patterns (theme-aware)
    dashboardMetricText: isDark ? dark.dashboardMetricText : base.dashboardMetricText,
    revenueText: isDark ? dark.revenueText : base.revenueText,
    analyticsLabelText: isDark ? dark.analyticsLabelText : base.analyticsLabelText,
    performanceIndicatorText: isDark ? dark.performanceIndicatorText : base.performanceIndicatorText,
    audienceCountText: isDark ? dark.audienceCountText : base.audienceCountText,
    monetizationOpportunityText: isDark ? dark.monetizationOpportunityText : base.monetizationOpportunityText,
    creatorTipText: isDark ? dark.creatorTipText : base.creatorTipText,
    contentStatusText: isDark ? dark.contentStatusText : base.contentStatusText,
    collaborationRequestText: isDark ? dark.collaborationRequestText : base.collaborationRequestText,
    
    // Cross-device sync patterns (theme-aware)
    syncStatusText: isDark ? dark.syncStatusText : base.syncStatusText,
    continuationPromptText: isDark ? dark.continuationPromptText : base.continuationPromptText,
    deviceIndicatorText: isDark ? dark.deviceIndicatorText : base.deviceIndicatorText,
    progressSyncText: isDark ? dark.progressSyncText : base.progressSyncText,
    readingPositionText: isDark ? dark.readingPositionText : base.readingPositionText,
    handoffInstructionText: isDark ? dark.handoffInstructionText : base.handoffInstructionText,
    deviceAvailabilityText: isDark ? dark.deviceAvailabilityText : base.deviceAvailabilityText,
    syncConflictText: isDark ? dark.syncConflictText : base.syncConflictText,
    
    // Multi-format media patterns (theme-aware)
    storyTitleText: isDark ? dark.storyTitleText : base.storyTitleText,
    storyBodyText: isDark ? dark.storyBodyText : base.storyBodyText,
    videoTitleText: isDark ? dark.videoTitleText : base.videoTitleText,
    videoCaptionText: isDark ? dark.videoCaptionText : base.videoCaptionText,
    musicTrackTitleText: isDark ? dark.musicTrackTitleText : base.musicTrackTitleText,
    musicArtistText: isDark ? dark.musicArtistText : base.musicArtistText,
    musicTimeText: isDark ? dark.musicTimeText : base.musicTimeText,
    playbackControlText: isDark ? dark.playbackControlText : base.playbackControlText,
    formatTransitionText: isDark ? dark.formatTransitionText : base.formatTransitionText,
    audioWaveformLabelText: isDark ? dark.audioWaveformLabelText : base.audioWaveformLabelText,
    
    // Reading experience patterns (theme-aware)
    readingOptimized: isDark ? dark.readingOptimized : base.readingOptimized,
    readingTitle: isDark ? dark.readingTitle : base.readingTitle,
    readingSubtitle: isDark ? dark.readingSubtitle : base.readingSubtitle,
    readingMetadata: isDark ? dark.readingMetadata : base.readingMetadata,
    chapterHeading: isDark ? dark.chapterHeading : base.chapterHeading,
    readingProgressText: isDark ? dark.readingProgressText : base.readingProgressText,
    quoteText: isDark ? dark.quoteText : base.quoteText,
    footnoteText: isDark ? dark.footnoteText : base.footnoteText,
    readingControlsText: isDark ? dark.readingControlsText : base.readingControlsText,
    
    // Responsive patterns (theme-aware)
    textMobile: isDark ? dark.textMobile : base.textMobile,
    textTablet: isDark ? dark.textTablet : base.textTablet,
    textDesktop: isDark ? dark.textDesktop : base.textDesktop,
    textAutoScale: isDark ? dark.textAutoScale : base.textAutoScale,
    textHighDPI: isDark ? dark.textHighDPI : base.textHighDPI,
    
    // Accessibility patterns (theme-aware)
    textHighContrast: isDark ? dark.textHighContrast : base.textHighContrast,
    textLarge: isDark ? dark.textLarge : base.textLarge,
    textScreenReader: isDark ? dark.textScreenReader : base.textScreenReader,
    textFocusIndicator: isDark ? dark.textFocusIndicator : base.textFocusIndicator,
    textHighVisibility: isDark ? dark.textHighVisibility : base.textHighVisibility,
  };
};

// Export text constants for use in other files
export { textConstants };

// Export individual style categories for granular imports
export const coreTextStyles = {
  textBase: textStyles.textBase,
  textLg: textStyles.textLg,
  textXl: textStyles.textXl,
  text2Xl: textStyles.text2Xl,
  text3Xl: textStyles.text3Xl,
  fontNormal: textStyles.fontNormal,
  fontMedium: textStyles.fontMedium,
  fontBold: textStyles.fontBold,
  textLeft: textStyles.textLeft,
  textCenter: textStyles.textCenter,
  textRight: textStyles.textRight,
  leadingNormal: textStyles.leadingNormal,
  leadingRelaxed: textStyles.leadingRelaxed,
};

export const designResearchTextStyles = {
  // News Feed
  feedPostContent: textStyles.feedPostContent,
  feedHeadline: textStyles.feedHeadline,
  feedMetadata: textStyles.feedMetadata,
  
  // Progressive disclosure
  mysteryHintText: textStyles.mysteryHintText,
  discoveryPromptText: textStyles.discoveryPromptText,
  progressiveRevealText: textStyles.progressiveRevealText,
  
  // AI collaboration
  aiAssistantText: textStyles.aiAssistantText,
  aiSuggestionText: textStyles.aiSuggestionText,
  voiceCommandText: textStyles.voiceCommandText,
  
  // Creator economy
  dashboardMetricText: textStyles.dashboardMetricText,
  revenueText: textStyles.revenueText,
  analyticsLabelText: textStyles.analyticsLabelText,
  
  // Cross-device sync
  syncStatusText: textStyles.syncStatusText,
  continuationPromptText: textStyles.continuationPromptText,
  deviceIndicatorText: textStyles.deviceIndicatorText,
  
  // Multi-format media
  storyTitleText: textStyles.storyTitleText,
  storyBodyText: textStyles.storyBodyText,
  videoTitleText: textStyles.videoTitleText,
  musicTrackTitleText: textStyles.musicTrackTitleText,
};

export const readingTextStyles = {
  readingOptimized: textStyles.readingOptimized,
  readingTitle: textStyles.readingTitle,
  readingSubtitle: textStyles.readingSubtitle,
  readingMetadata: textStyles.readingMetadata,
  chapterHeading: textStyles.chapterHeading,
  readingProgressText: textStyles.readingProgressText,
  quoteText: textStyles.quoteText,
  footnoteText: textStyles.footnoteText,
  readingControlsText: textStyles.readingControlsText,
};

export const accessibilityTextStyles = {
  textHighContrast: textStyles.textHighContrast,
  textLarge: textStyles.textLarge,
  textScreenReader: textStyles.textScreenReader,
  textFocusIndicator: textStyles.textFocusIndicator,
  textHighVisibility: textStyles.textHighVisibility,
};

// Utility functions for text calculations
export const textUtils = {
  // Calculate optimal font size for screen
  calculateOptimalFontSize: (baseSize, screenWidth, minSize = 12, maxSize = 36) => {
    const scaleFactor = screenWidth / 375; // Base on iPhone 8 width
    const calculatedSize = baseSize * scaleFactor;
    return Math.max(minSize, Math.min(maxSize, calculatedSize));
  },
  
  // Calculate reading time estimate
  calculateReadingTime: (textLength, wordsPerMinute = 200) => {
    const words = textLength / 5; // Average word length
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes === 1 ? '1 min read' : `${minutes} min read`;
  },
  
  // Calculate optimal line height
  calculateOptimalLineHeight: (fontSize) => {
    if (fontSize <= 12) return fontSize * 1.4;
    if (fontSize <= 16) return fontSize * 1.5;
    if (fontSize <= 24) return fontSize * 1.4;
    return fontSize * 1.2;
  },
  
  // Check if text meets accessibility contrast requirements
  checkContrastRatio: (backgroundColor, textColor) => {
    // Simplified contrast check - would use a proper contrast library in production
    return true; // Placeholder
  },
  
  // Get appropriate text size for content type
  getContentTypeTextSize: (contentType, baseSize = 16) => {
    const scaling = textConstants.formatScaling;
    switch (contentType) {
      case 'story':
        return baseSize * scaling.story;
      case 'video':
        return baseSize * scaling.video;
      case 'music':
        return baseSize * scaling.music;
      case 'captions':
        return baseSize * scaling.captions;
      default:
        return baseSize;
    }
  },
  
  // Create responsive text style
  createResponsiveText: (mobileSize, tabletSize, desktopSize) => {
    // Would use responsive hooks or media queries in practice
    return {
      mobile: { fontSize: mobileSize },
      tablet: { fontSize: tabletSize },
      desktop: { fontSize: desktopSize },
    };
  },
  
  // Truncate text with ellipsis
  truncateText: (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  },
  
  // Calculate text metrics for performance
  calculateTextMetrics: (text, fontSize, fontFamily) => {
    // Would calculate actual text dimensions in practice
    return {
      width: text.length * fontSize * 0.6, // Rough estimate
      height: fontSize * 1.2,
      lineCount: Math.ceil(text.length / 50), // Rough estimate
    };
  },
  
  // Create text style with optimal performance
  createOptimizedTextStyle: (fontSize, color, fontWeight = 'normal') => {
    return {
      fontSize,
      color,
      fontWeight,
      includeFontPadding: false, // Android optimization
      textAlignVertical: 'center', // Android optimization
      // Enable hardware acceleration for animations
      transform: [{ translateZ: 0 }],
    };
  },
};

// 65,847 characters