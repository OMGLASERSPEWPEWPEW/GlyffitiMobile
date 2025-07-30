// src/styles/layouts/screens.js
// Path: src/styles/layouts/screens.js

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
 * Screen styles - comprehensive screen layout system
 * Covers all major screen patterns for multi-format content platform
 * Inspired by News Feed, Stories, Creator Tools, and AI collaboration patterns
 * Designed for stories → videos → music content progression
 * 
 * Usage:
 * - Import specific styles: screenStyles.discovery, screenStyles.reading
 * - Theme-aware: use getScreenStyles(isDark) for proper colors
 * - Combine: [screenStyles.base, screenStyles.safe, screenStyles.padded]
 */

// Get screen dimensions for responsive calculations
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Screen constants (inspired by design research)
const screenConstants = {
  // Layout dimensions
  headerHeight: 56,           // Standard header height
  headerHeightLarge: 72,      // Large header with subtitle
  tabBarHeight: 60,           // Bottom navigation
  floatingControlsHeight: 80, // Floating media controls
  
  // Content dimensions (optimized for reading - Kindle research)
  optimalReadingWidth: 680,   // Typography research optimal width
  maxContentWidth: 1200,      // Desktop max width
  storyMaxWidth: 800,         // Story content max width
  
  // Media aspect ratios (multi-format support)
  aspectRatios: {
    story: 16/9,              // Horizontal story format
    video: 16/9,              // Video content
    videoVertical: 9/16,      // Vertical/mobile video
    music: 1,                 // Square album art
    card: 3/2,                // Content card ratio
  },
  
  // Breakpoints for responsive behavior
  breakpoints: {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
    wide: 1400,
  },
  
  // Safe area considerations
  statusBarHeight: 44,        // iOS status bar
  homeIndicatorHeight: 34,    // iOS home indicator
  
  // Progressive disclosure zones (Snapchat mystery UX inspiration)
  discoveryZones: {
    primary: 0.6,            // 60% of screen for main content
    secondary: 0.25,         // 25% for secondary actions
    mystery: 0.15,           // 15% for hidden/discoverable features
  },
};

// Base screen styles (foundation for all screens)
const baseScreens = {
  // Universal base screen
  base: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
  
  // Safe area aware base (handles notches, status bars)
  safe: {
    flex: 1,
    backgroundColor: lightColors.background,
    paddingTop: spacing.medium,         // 16px - status bar buffer
  },
  
  // Full edge-to-edge screen
  fullscreen: {
    flex: 1,
    backgroundColor: lightColors.background,
    paddingTop: 0,
    paddingHorizontal: 0,
  },
  
  // Modal screen base
  modal: {
    flex: 1,
    backgroundColor: lightColors.surface,
    borderTopLeftRadius: borderRadius.modal,    // 16px
    borderTopRightRadius: borderRadius.modal,   // 16px
    paddingTop: spacing.medium,                 // 16px
  },
  
  // Overlay screen (for floating content)
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: lightColors.backdrop,      // Semi-transparent
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
};

// Discovery/Feed screens (News Feed pattern inspiration)
const discoveryScreens = {
  // Main discovery feed (Instagram/Facebook Feed pattern)
  discoveryFeed: {
    flex: 1,
    backgroundColor: lightColors.background,
    paddingHorizontal: spacing.small,           // 8px - content spacing
  },
  
  // Search and browse
  discoverySearch: {
    flex: 1,
    backgroundColor: lightColors.background,
    paddingTop: spacing.medium,                 // 16px
    paddingHorizontal: spacing.medium,          // 16px
  },
  
  // Trending content
  discoveryTrending: {
    flex: 1,
    backgroundColor: lightColors.background,
    paddingHorizontal: spacing.small,           // 8px
  },
  
  // Category browsing
  discoveryCategory: {
    flex: 1,
    backgroundColor: lightColors.background,
    paddingHorizontal: spacing.medium,          // 16px
  },
  
  // Algorithmic recommendations (AI-powered)
  discoveryRecommended: {
    flex: 1,
    backgroundColor: lightColors.backgroundSecondary,
    paddingHorizontal: spacing.small,           // 8px
  },
  
  // Stories-style horizontal discovery
  discoveryStories: {
    backgroundColor: lightColors.background,
    paddingHorizontal: spacing.medium,          // 16px
    paddingVertical: spacing.small,             // 8px
    borderBottomWidth: borderWidth.hairline,    // 0.5px
    borderBottomColor: lightColors.border,
  },
};

// Content consumption screens (multi-format: stories, videos, music)
const consumptionScreens = {
  // Reading screen (optimized for stories - Kindle research inspired)
  reading: {
    flex: 1,
    backgroundColor: lightColors.background,
    paddingHorizontal: spacing.large,           // 24px - optimal reading margins
    paddingVertical: spacing.medium,            // 16px
    maxWidth: screenConstants.optimalReadingWidth,
    alignSelf: 'center',
  },
  
  // Immersive reading (full-screen stories)
  readingImmersive: {
    flex: 1,
    backgroundColor: lightColors.background,
    paddingHorizontal: spacing.xlarge,          // 32px - wider margins
    paddingVertical: spacing.large,             // 24px
  },
  
  // Video viewing screen (landscape optimized)
  videoViewing: {
    flex: 1,
    backgroundColor: '#000000',                 // Black for video
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Video viewing (portrait/mobile)
  videoViewingPortrait: {
    flex: 1,
    backgroundColor: lightColors.background,
    paddingHorizontal: spacing.small,           // 8px
  },
  
  // Music listening screen
  musicListening: {
    flex: 1,
    backgroundColor: lightColors.surface,
    paddingHorizontal: spacing.large,           // 24px
    paddingVertical: spacing.large,             // 24px
    justifyContent: 'space-between',
  },
  
  // Audio-only content (podcasts, audiobooks)
  audioListening: {
    flex: 1,
    backgroundColor: lightColors.backgroundSecondary,
    paddingHorizontal: spacing.large,           // 24px
    justifyContent: 'center',
  },
  
  // Cross-device continuation (Kindle-style sync)
  continuationPrompt: {
    flex: 1,
    backgroundColor: lightColors.background,
    paddingHorizontal: spacing.large,           // 24px
    paddingVertical: spacing.large,             // 24px
    justifyContent: 'center',
    alignItems: 'center',
  },
};

// Creator screens (Spotify for Artists inspiration)
const creatorScreens = {
  // Content creation hub
  creatorHub: {
    flex: 1,
    backgroundColor: lightColors.surface,
    paddingHorizontal: spacing.medium,          // 16px
    paddingTop: spacing.large,                  // 24px
  },
  
  // Story/article editor
  creatorEditor: {
    flex: 1,
    backgroundColor: lightColors.background,
    paddingHorizontal: spacing.large,           // 24px - editor spacing
    paddingVertical: spacing.medium,            // 16px
  },
  
  // Media editor (future: video/music)
  creatorMediaEditor: {
    flex: 1,
    backgroundColor: '#000000',                 // Dark for media editing
    paddingHorizontal: spacing.medium,          // 16px
    paddingVertical: spacing.small,             // 8px
  },
  
  // Publishing workflow
  creatorPublishing: {
    flex: 1,
    backgroundColor: lightColors.background,
    paddingHorizontal: spacing.medium,          // 16px
    paddingVertical: spacing.large,             // 24px
  },
  
  // Analytics dashboard
  creatorAnalytics: {
    flex: 1,
    backgroundColor: lightColors.backgroundSecondary,
    paddingHorizontal: spacing.medium,          // 16px
    paddingTop: spacing.large,                  // 24px
  },
  
  // Creator profile/settings
  creatorProfile: {
    flex: 1,
    backgroundColor: lightColors.background,
    paddingHorizontal: spacing.medium,          // 16px
  },
  
  // Monetization/earnings
  creatorMonetization: {
    flex: 1,
    backgroundColor: lightColors.surface,
    paddingHorizontal: spacing.medium,          // 16px
    paddingTop: spacing.large,                  // 24px
  },
};

// AI collaboration screens (Jenny Blackburn research inspired)
const aiCollaborationScreens = {
  // AI writing assistant
  aiWritingAssistant: {
    flex: 1,
    backgroundColor: lightColors.background,
    paddingHorizontal: spacing.large,           // 24px
    paddingVertical: spacing.medium,            // 16px
  },
  
  // AI content suggestions
  aiSuggestions: {
    backgroundColor: lightColors.surface,
    borderTopLeftRadius: borderRadius.modal,    // 16px
    borderTopRightRadius: borderRadius.modal,   // 16px
    paddingHorizontal: spacing.medium,          // 16px
    paddingVertical: spacing.large,             // 24px
    maxHeight: screenHeight * 0.7,              // 70% of screen
  },
  
  // AI curation interface
  aiCuration: {
    flex: 1,
    backgroundColor: lightColors.backgroundSecondary,
    paddingHorizontal: spacing.medium,          // 16px
    paddingTop: spacing.large,                  // 24px
  },
  
  // Multimodal AI interaction (voice + touch)
  aiMultimodal: {
    flex: 1,
    backgroundColor: lightColors.background,
    paddingHorizontal: spacing.large,           // 24px
    justifyContent: 'space-between',
  },
  
  // AI collaboration session
  aiCollaboration: {
    flex: 1,
    backgroundColor: lightColors.surface,
    paddingHorizontal: spacing.medium,          // 16px
    paddingVertical: spacing.large,             // 24px
  },
};

// Social/Profile screens
const socialScreens = {
  // User profile
  profile: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
  
  // Profile header area
  profileHeader: {
    backgroundColor: lightColors.surface,
    paddingHorizontal: spacing.medium,          // 16px
    paddingVertical: spacing.large,             // 24px
    borderBottomWidth: borderWidth.hairline,    // 0.5px
    borderBottomColor: lightColors.border,
  },
  
  // Content grid area
  profileContent: {
    flex: 1,
    backgroundColor: lightColors.background,
    paddingHorizontal: spacing.small,           // 8px
    paddingTop: spacing.medium,                 // 16px
  },
  
  // Following/followers
  socialConnections: {
    flex: 1,
    backgroundColor: lightColors.background,
    paddingHorizontal: spacing.medium,          // 16px
  },
  
  // Social activity feed
  socialActivity: {
    flex: 1,
    backgroundColor: lightColors.backgroundSecondary,
    paddingHorizontal: spacing.small,           // 8px
  },
  
  // Comments/discussions
  socialDiscussion: {
    flex: 1,
    backgroundColor: lightColors.background,
    paddingHorizontal: spacing.medium,          // 16px
    paddingBottom: spacing.large,               // 24px - keyboard space
  },
};

// Onboarding/Tutorial screens (progressive disclosure)
const onboardingScreens = {
  // Welcome/intro
  onboardingWelcome: {
    flex: 1,
    backgroundColor: lightColors.surface,
    paddingHorizontal: spacing.large,           // 24px
    paddingVertical: spacing.xxlarge,           // 48px
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Feature tutorial (mystery UX pattern)
  onboardingTutorial: {
    flex: 1,
    backgroundColor: lightColors.background,
    paddingHorizontal: spacing.medium,          // 16px
    paddingVertical: spacing.large,             // 24px
  },
  
  // Progressive disclosure tutorial
  onboardingDiscovery: {
    flex: 1,
    backgroundColor: lightColors.backgroundSecondary,
    position: 'relative',
  },
  
  // Preference setup
  onboardingPreferences: {
    flex: 1,
    backgroundColor: lightColors.background,
    paddingHorizontal: spacing.medium,          // 16px
    paddingVertical: spacing.large,             // 24px
  },
  
  // Content type selection (stories, videos, music)
  onboardingContentTypes: {
    flex: 1,
    backgroundColor: lightColors.surface,
    paddingHorizontal: spacing.large,           // 24px
    paddingVertical: spacing.large,             // 24px
  },
};

// Settings/Preferences screens
const settingsScreens = {
  // Main settings
  settings: {
    flex: 1,
    backgroundColor: lightColors.backgroundSecondary,
    paddingHorizontal: spacing.medium,          // 16px
  },
  
  // Reading preferences
  settingsReading: {
    flex: 1,
    backgroundColor: lightColors.background,
    paddingHorizontal: spacing.medium,          // 16px
    paddingVertical: spacing.large,             // 24px
  },
  
  // Media preferences (video/audio settings)
  settingsMedia: {
    flex: 1,
    backgroundColor: lightColors.background,
    paddingHorizontal: spacing.medium,          // 16px
    paddingVertical: spacing.large,             // 24px
  },
  
  // Privacy/security
  settingsPrivacy: {
    flex: 1,
    backgroundColor: lightColors.surface,
    paddingHorizontal: spacing.medium,          // 16px
  },
  
  // Accessibility
  settingsAccessibility: {
    flex: 1,
    backgroundColor: lightColors.background,
    paddingHorizontal: spacing.medium,          // 16px
    paddingVertical: spacing.large,             // 24px
  },
  
  // Account management
  settingsAccount: {
    flex: 1,
    backgroundColor: lightColors.backgroundSecondary,
    paddingHorizontal: spacing.medium,          // 16px
  },
};

// System state screens (loading, error, empty)
const systemStateScreens = {
  // Loading states
  loading: {
    flex: 1,
    backgroundColor: lightColors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.large,           // 24px
  },
  
  // Content loading (progressive)
  loadingContent: {
    flex: 1,
    backgroundColor: lightColors.background,
    paddingHorizontal: spacing.large,           // 24px
    paddingVertical: spacing.medium,            // 16px
  },
  
  // Error states
  error: {
    flex: 1,
    backgroundColor: lightColors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.large,           // 24px
    paddingVertical: spacing.large,             // 24px
  },
  
  // Network error
  errorNetwork: {
    flex: 1,
    backgroundColor: lightColors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.large,           // 24px
  },
  
  // Empty states
  empty: {
    flex: 1,
    backgroundColor: lightColors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.large,           // 24px
    paddingVertical: spacing.xxlarge,           // 48px
  },
  
  // No content available
  emptyContent: {
    flex: 1,
    backgroundColor: lightColors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.large,           // 24px
  },
  
  // Offline state
  offline: {
    flex: 1,
    backgroundColor: lightColors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.large,           // 24px
    paddingVertical: spacing.large,             // 24px
  },
};

// Specialized layout components
const layoutComponents = {
  // Header layouts
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: screenConstants.headerHeight,
    paddingHorizontal: spacing.medium,          // 16px
    borderBottomWidth: borderWidth.hairline,    // 0.5px
    borderBottomColor: lightColors.border,
    backgroundColor: lightColors.background,
  },
  
  headerLarge: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    height: screenConstants.headerHeightLarge,
    paddingHorizontal: spacing.medium,          // 16px
    paddingVertical: spacing.small,             // 8px
    borderBottomWidth: borderWidth.hairline,    // 0.5px
    borderBottomColor: lightColors.border,
    backgroundColor: lightColors.background,
  },
  
  // Floating header (for immersive content)
  headerFloating: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: screenConstants.headerHeight,
    paddingHorizontal: spacing.medium,          // 16px
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  
  // Content area layouts
  contentArea: {
    flex: 1,
    paddingHorizontal: spacing.medium,          // 16px
    paddingVertical: spacing.small,             // 8px
  },
  
  contentAreaWide: {
    flex: 1,
    maxWidth: screenConstants.maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.medium,          // 16px
    paddingVertical: spacing.small,             // 8px
  },
  
  contentAreaReading: {
    flex: 1,
    maxWidth: screenConstants.storyMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.large,           // 24px
    paddingVertical: spacing.medium,            // 16px
  },
  
  // Footer/bottom layouts
  footer: {
    paddingHorizontal: spacing.medium,          // 16px
    paddingVertical: spacing.medium,            // 16px
    borderTopWidth: borderWidth.hairline,       // 0.5px
    borderTopColor: lightColors.border,
    backgroundColor: lightColors.surface,
  },
  
  // Floating controls (for media)
  floatingControls: {
    position: 'absolute',
    bottom: spacing.large,                      // 24px
    left: spacing.medium,                       // 16px
    right: spacing.medium,                      // 16px
    height: screenConstants.floatingControlsHeight,
    backgroundColor: lightColors.surface,
    borderRadius: borderRadius.card,            // 12px
    paddingHorizontal: spacing.medium,          // 16px
    paddingVertical: spacing.small,             // 8px
    ...shadows.lg,
    zIndex: 200,
  },
  
  // Tab bar
  tabBar: {
    flexDirection: 'row',
    height: screenConstants.tabBarHeight,
    backgroundColor: lightColors.surface,
    borderTopWidth: borderWidth.hairline,       // 0.5px
    borderTopColor: lightColors.border,
    paddingBottom: spacing.small,               // 8px (safe area)
  },
  
  // Modal layouts
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: lightColors.backdrop,
  },
  
  modalContent: {
    backgroundColor: lightColors.surface,
    borderTopLeftRadius: borderRadius.modal,    // 16px
    borderTopRightRadius: borderRadius.modal,   // 16px
    paddingHorizontal: spacing.large,           // 24px
    paddingVertical: spacing.large,             // 24px
    maxHeight: '80%',
  },
  
  // Progressive disclosure elements (mystery UX)
  discoveryHint: {
    position: 'absolute',
    bottom: spacing.large,                      // 24px
    right: spacing.medium,                      // 16px
    width: 4,
    height: 40,
    backgroundColor: lightColors.primary,
    borderRadius: 2,
    opacity: 0.6,
  },
  
  swipeIndicator: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    backgroundColor: lightColors.border,
    borderRadius: 2,
    marginVertical: spacing.small,              // 8px
  },
};

// Create StyleSheet
export const screenStyles = StyleSheet.create({
  // Base screens
  ...baseScreens,
  
  // Discovery screens
  ...discoveryScreens,
  
  // Consumption screens
  ...consumptionScreens,
  
  // Creator screens
  ...creatorScreens,
  
  // AI collaboration screens
  ...aiCollaborationScreens,
  
  // Social screens
  ...socialScreens,
  
  // Onboarding screens
  ...onboardingScreens,
  
  // Settings screens
  ...settingsScreens,
  
  // System state screens
  ...systemStateScreens,
  
  // Layout components
  ...layoutComponents,
});

// Dark theme screen styles
const darkScreenStyles = StyleSheet.create({
  // Base screens
  base: {
    ...baseScreens.base,
    backgroundColor: darkColors.background,
  },
  
  safe: {
    ...baseScreens.safe,
    backgroundColor: darkColors.background,
  },
  
  fullscreen: {
    ...baseScreens.fullscreen,
    backgroundColor: darkColors.background,
  },
  
  modal: {
    ...baseScreens.modal,
    backgroundColor: darkColors.surface,
  },
  
  overlay: {
    ...baseScreens.overlay,
    backgroundColor: darkColors.backdrop,
  },
  
  // Discovery screens
  discoveryFeed: {
    ...discoveryScreens.discoveryFeed,
    backgroundColor: darkColors.background,
  },
  
  discoverySearch: {
    ...discoveryScreens.discoverySearch,
    backgroundColor: darkColors.background,
  },
  
  discoveryRecommended: {
    ...discoveryScreens.discoveryRecommended,
    backgroundColor: darkColors.backgroundSecondary,
  },
  
  discoveryStories: {
    ...discoveryScreens.discoveryStories,
    backgroundColor: darkColors.background,
    borderBottomColor: darkColors.border,
  },
  
  // Consumption screens
  reading: {
    ...consumptionScreens.reading,
    backgroundColor: darkColors.background,
  },
  
  readingImmersive: {
    ...consumptionScreens.readingImmersive,
    backgroundColor: darkColors.background,
  },
  
  videoViewingPortrait: {
    ...consumptionScreens.videoViewingPortrait,
    backgroundColor: darkColors.background,
  },
  
  musicListening: {
    ...consumptionScreens.musicListening,
    backgroundColor: darkColors.surface,
  },
  
  audioListening: {
    ...consumptionScreens.audioListening,
    backgroundColor: darkColors.backgroundSecondary,
  },
  
  // Creator screens
  creatorHub: {
    ...creatorScreens.creatorHub,
    backgroundColor: darkColors.surface,
  },
  
  creatorEditor: {
    ...creatorScreens.creatorEditor,
    backgroundColor: darkColors.background,
  },
  
  creatorAnalytics: {
    ...creatorScreens.creatorAnalytics,
    backgroundColor: darkColors.backgroundSecondary,
  },
  
  // AI screens
  aiWritingAssistant: {
    ...aiCollaborationScreens.aiWritingAssistant,
    backgroundColor: darkColors.background,
  },
  
  aiSuggestions: {
    ...aiCollaborationScreens.aiSuggestions,
    backgroundColor: darkColors.surface,
  },
  
  aiCuration: {
    ...aiCollaborationScreens.aiCuration,
    backgroundColor: darkColors.backgroundSecondary,
  },
  
  // Layout components
  header: {
    ...layoutComponents.header,
    backgroundColor: darkColors.background,
    borderBottomColor: darkColors.border,
  },
  
  headerLarge: {
    ...layoutComponents.headerLarge,
    backgroundColor: darkColors.background,
    borderBottomColor: darkColors.border,
  },
  
  footer: {
    ...layoutComponents.footer,
    backgroundColor: darkColors.surface,
    borderTopColor: darkColors.border,
  },
  
  floatingControls: {
    ...layoutComponents.floatingControls,
    backgroundColor: darkColors.surface,
    ...darkShadows.lg,
  },
  
  tabBar: {
    ...layoutComponents.tabBar,
    backgroundColor: darkColors.surface,
    borderTopColor: darkColors.border,
  },
  
  modalContent: {
    ...layoutComponents.modalContent,
    backgroundColor: darkColors.surface,
  },
  
  discoveryHint: {
    ...layoutComponents.discoveryHint,
    backgroundColor: darkColors.primary,
  },
  
  swipeIndicator: {
    ...layoutComponents.swipeIndicator,
    backgroundColor: darkColors.border,
  },
});

// Theme-aware screen getter
export const getScreenStyles = (isDark = false) => {
  const base = screenStyles;
  const dark = darkScreenStyles;
  
  return {
    // Base screens
    base: isDark ? dark.base : base.base,
    safe: isDark ? dark.safe : base.safe,
    fullscreen: isDark ? dark.fullscreen : base.fullscreen,
    modal: isDark ? dark.modal : base.modal,
    overlay: isDark ? dark.overlay : base.overlay,
    
    // Discovery screens
    discoveryFeed: isDark ? dark.discoveryFeed : base.discoveryFeed,
    discoverySearch: isDark ? dark.discoverySearch : base.discoverySearch,
    discoveryTrending: base.discoveryTrending,
    discoveryCategory: base.discoveryCategory,
    discoveryRecommended: isDark ? dark.discoveryRecommended : base.discoveryRecommended,
    discoveryStories: isDark ? dark.discoveryStories : base.discoveryStories,
    
    // Consumption screens
    reading: isDark ? dark.reading : base.reading,
    readingImmersive: isDark ? dark.readingImmersive : base.readingImmersive,
    videoViewing: base.videoViewing, // Always black
    videoViewingPortrait: isDark ? dark.videoViewingPortrait : base.videoViewingPortrait,
    musicListening: isDark ? dark.musicListening : base.musicListening,
    audioListening: isDark ? dark.audioListening : base.audioListening,
    continuationPrompt: base.continuationPrompt,
    
    // Creator screens
    creatorHub: isDark ? dark.creatorHub : base.creatorHub,
    creatorEditor: isDark ? dark.creatorEditor : base.creatorEditor,
    creatorMediaEditor: base.creatorMediaEditor, // Always dark
    creatorPublishing: base.creatorPublishing,
    creatorAnalytics: isDark ? dark.creatorAnalytics : base.creatorAnalytics,
    creatorProfile: base.creatorProfile,
    creatorMonetization: base.creatorMonetization,
    
    // AI collaboration screens
    aiWritingAssistant: isDark ? dark.aiWritingAssistant : base.aiWritingAssistant,
    aiSuggestions: isDark ? dark.aiSuggestions : base.aiSuggestions,
    aiCuration: isDark ? dark.aiCuration : base.aiCuration,
    aiMultimodal: base.aiMultimodal,
    aiCollaboration: base.aiCollaboration,
    
    // Social screens
    profile: base.profile,
    profileHeader: base.profileHeader,
    profileContent: base.profileContent,
    socialConnections: base.socialConnections,
    socialActivity: base.socialActivity,
    socialDiscussion: base.socialDiscussion,
    
    // Onboarding screens
    onboardingWelcome: base.onboardingWelcome,
    onboardingTutorial: base.onboardingTutorial,
    onboardingDiscovery: base.onboardingDiscovery,
    onboardingPreferences: base.onboardingPreferences,
    onboardingContentTypes: base.onboardingContentTypes,
    
    // Settings screens
    settings: base.settings,
    settingsReading: base.settingsReading,
    settingsMedia: base.settingsMedia,
    settingsPrivacy: base.settingsPrivacy,
    settingsAccessibility: base.settingsAccessibility,
    settingsAccount: base.settingsAccount,
    
    // System state screens
    loading: base.loading,
    loadingContent: base.loadingContent,
    error: base.error,
    errorNetwork: base.errorNetwork,
    empty: base.empty,
    emptyContent: base.emptyContent,
    offline: base.offline,
    
    // Layout components
    header: isDark ? dark.header : base.header,
    headerLarge: isDark ? dark.headerLarge : base.headerLarge,
    headerFloating: base.headerFloating,
    contentArea: base.contentArea,
    contentAreaWide: base.contentAreaWide,
    contentAreaReading: base.contentAreaReading,
    footer: isDark ? dark.footer : base.footer,
    floatingControls: isDark ? dark.floatingControls : base.floatingControls,
    tabBar: isDark ? dark.tabBar : base.tabBar,
    modalContainer: base.modalContainer,
    modalContent: isDark ? dark.modalContent : base.modalContent,
    discoveryHint: isDark ? dark.discoveryHint : base.discoveryHint,
    swipeIndicator: isDark ? dark.swipeIndicator : base.swipeIndicator,
  };
};

// Export screen constants for use in other files
export { screenConstants };

// Export individual style categories for granular imports
export const baseScreenStyles = {
  base: screenStyles.base,
  safe: screenStyles.safe,
  fullscreen: screenStyles.fullscreen,
  modal: screenStyles.modal,
  overlay: screenStyles.overlay,
};

export const discoveryScreenStyles = {
  discoveryFeed: screenStyles.discoveryFeed,
  discoverySearch: screenStyles.discoverySearch,
  discoveryTrending: screenStyles.discoveryTrending,
  discoveryCategory: screenStyles.discoveryCategory,
  discoveryRecommended: screenStyles.discoveryRecommended,
  discoveryStories: screenStyles.discoveryStories,
};

export const consumptionScreenStyles = {
  reading: screenStyles.reading,
  readingImmersive: screenStyles.readingImmersive,
  videoViewing: screenStyles.videoViewing,
  videoViewingPortrait: screenStyles.videoViewingPortrait,
  musicListening: screenStyles.musicListening,
  audioListening: screenStyles.audioListening,
  continuationPrompt: screenStyles.continuationPrompt,
};

export const creatorScreenStyles = {
  creatorHub: screenStyles.creatorHub,
  creatorEditor: screenStyles.creatorEditor,
  creatorMediaEditor: screenStyles.creatorMediaEditor,
  creatorPublishing: screenStyles.creatorPublishing,
  creatorAnalytics: screenStyles.creatorAnalytics,
  creatorProfile: screenStyles.creatorProfile,
  creatorMonetization: screenStyles.creatorMonetization,
};

export const layoutComponentStyles = {
  header: screenStyles.header,
  headerLarge: screenStyles.headerLarge,
  headerFloating: screenStyles.headerFloating,
  contentArea: screenStyles.contentArea,
  contentAreaWide: screenStyles.contentAreaWide,
  contentAreaReading: screenStyles.contentAreaReading,
  footer: screenStyles.footer,
  floatingControls: screenStyles.floatingControls,
  tabBar: screenStyles.tabBar,
  modalContainer: screenStyles.modalContainer,
  modalContent: screenStyles.modalContent,
  discoveryHint: screenStyles.discoveryHint,
  swipeIndicator: screenStyles.swipeIndicator,
};

// Utility functions for screen calculations
export const screenUtils = {
  // Check if screen is tablet sized
  isTablet: () => screenWidth >= screenConstants.breakpoints.tablet,
  
  // Check if screen is desktop sized
  isDesktop: () => screenWidth >= screenConstants.breakpoints.desktop,
  
  // Get optimal content width for current screen
  getOptimalContentWidth: () => {
    if (screenWidth >= screenConstants.breakpoints.desktop) {
      return screenConstants.maxContentWidth;
    } else if (screenWidth >= screenConstants.breakpoints.tablet) {
      return screenWidth * 0.8; // 80% of screen on tablet
    } else {
      return screenWidth - (spacing.medium * 2); // Mobile with margins
    }
  },
  
  // Get reading optimized width
  getReadingWidth: () => {
    return Math.min(screenConstants.optimalReadingWidth, screenWidth - (spacing.large * 2));
  },
  
  // Calculate safe area top padding
  getSafeAreaTop: () => {
    // This would typically come from react-native-safe-area-context
    // For now, return estimated values
    return screenHeight > 800 ? screenConstants.statusBarHeight : spacing.medium;
  },
  
  // Get appropriate header height for screen size
  getHeaderHeight: (isLarge = false) => {
    if (isLarge) {
      return screenConstants.headerHeightLarge;
    }
    return screenConstants.headerHeight;
  },
  
  // Calculate content area height (screen minus chrome)
  getContentHeight: (hasHeader = true, hasTabBar = false, hasFloatingControls = false) => {
    let availableHeight = screenHeight;
    
    if (hasHeader) {
      availableHeight -= screenConstants.headerHeight;
    }
    
    if (hasTabBar) {
      availableHeight -= screenConstants.tabBarHeight;
    }
    
    if (hasFloatingControls) {
      availableHeight -= screenConstants.floatingControlsHeight + spacing.large;
    }
    
    // Account for safe areas
    availableHeight -= screenConstants.statusBarHeight + screenConstants.homeIndicatorHeight;
    
    return Math.max(availableHeight, 200); // Minimum height
  },
  
  // Progressive disclosure helper
  getDiscoveryZone: (zone) => {
    const zones = screenConstants.discoveryZones;
    switch (zone) {
      case 'primary':
        return screenHeight * zones.primary;
      case 'secondary':
        return screenHeight * zones.secondary;
      case 'mystery':
        return screenHeight * zones.mystery;
      default:
        return screenHeight;
    }
  },
};

// 28,451 characters