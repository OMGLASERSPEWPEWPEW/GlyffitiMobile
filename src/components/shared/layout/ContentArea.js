// src/components/shared/layout/ContentArea.js
// Path: src/components/shared/layout/ContentArea.js

import React from 'react';
import { ScrollView, View } from 'react-native';
import { getContainerStyles } from '../../../styles/layouts/containers';
import { spacing } from '../../../styles/tokens';
import { AnimatedScrollView } from '../../navigation/AnimatedScrollView';

/**
 * ContentArea Component
 * 
 * Unified content container that provides consistent:
 * - Scroll behavior (standard, tracked, or static)
 * - Content padding and safe area handling
 * - Theme-aware styling using design tokens
 * - Bottom bar safe area (when needed)
 * 
 * This replaces manual ScrollView setups and provides consistent
 * content area behavior across all screens.
 * 
 * Variants:
 * - 'scroll': Standard ScrollView (PublishingScreen style)
 * - 'tracked': Scroll with TopBar visibility tracking (HomeScreen style)  
 * - 'static': No scrolling, just a container
 * - 'feed': Optimized for feed content (used by SocialFeed internally)
 */
const ContentArea = ({
  children,
  variant = 'scroll', // 'scroll', 'tracked', 'static', 'feed'
  isDarkMode = false,
  onTopBarVisibilityChange = null,
  withBottomBarPadding = false,
  style = {},
  contentContainerStyle = {},
  ...scrollProps
}) => {
  
  // Get theme-aware content styles
  const contentStyles = getContainerStyles(isDarkMode);
  
  // Calculate bottom padding for bottom bar
  const BOTTOM_BAR_HEIGHT = 80;
  const bottomPadding = withBottomBarPadding ? BOTTOM_BAR_HEIGHT + spacing.small : spacing.large;
  
  // Base content container styles
  const baseContentStyle = [
    {
      flexGrow: 1,
      paddingHorizontal: spacing.medium, // 16px consistent padding
      paddingTop: spacing.small,         // 8px top padding
      paddingBottom: bottomPadding,      // Dynamic bottom padding
    },
    contentContainerStyle
  ];
  
  // Container style for static variant
  const staticContainerStyle = [
    contentStyles.content,
    {
      flex: 1,
      paddingHorizontal: spacing.medium,
      paddingVertical: spacing.small,
    },
    style
  ];
  
  // Render based on variant
  switch (variant) {
    case 'tracked':
      // Scroll with TopBar visibility tracking (HomeScreen style)
      return (
        <AnimatedScrollView
          style={[{ flex: 1 }, style]}
          contentContainerStyle={baseContentStyle}
          onTopBarVisibilityChange={onTopBarVisibilityChange}
          showsVerticalScrollIndicator={false}
          {...scrollProps}
        >
          {children}
        </AnimatedScrollView>
      );
      
    case 'static':
      // No scrolling, just a container
      return (
        <View style={staticContainerStyle}>
          {children}
        </View>
      );
      
    case 'feed':
      // Feed variant returns children as-is (SocialFeed handles its own scrolling)
      return (
        <View style={[{ flex: 1 }, style]}>
          {children}
        </View>
      );
      
    case 'scroll':
    default:
      // Standard ScrollView (PublishingScreen style)
      return (
        <ScrollView
          style={[{ flex: 1 }, style]}
          contentContainerStyle={baseContentStyle}
          showsVerticalScrollIndicator={false}
          {...scrollProps}
        >
          {children}
        </ScrollView>
      );
  }
};

export default ContentArea;

// Character count: 2,926