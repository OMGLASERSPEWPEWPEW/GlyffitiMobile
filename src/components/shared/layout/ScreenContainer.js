// src/components/shared/layout/ScreenContainer.js
// Path: src/components/shared/layout/ScreenContainer.js

import React from 'react';
import { SafeAreaView } from 'react-native';
import { getContainerStyles } from '../../../styles/layouts';

/**
 * ScreenContainer Component
 * 
 * Unified screen container that provides consistent:
 * - SafeAreaView handling
 * - Theme-aware background colors  
 * - Proper container styling using design tokens
 * - Flexible container variants (screen, screenSafe, screenFull, etc.)
 * 
 * This replaces the manual SafeAreaView + style combinations used across screens
 * and centralizes the container logic for better consistency and maintainability.
 * 
 * Logic is separated from UX - this only handles the foundational container
 * structure. Specific screen layouts will be handled by other components.
 */
const ScreenContainer = ({
  children,
  isDarkMode = false,
  variant = 'screen', // 'screen', 'screenSafe', 'screenFull', 'screenModal', 'screenTabbed', 'screenScrollable'
  style = {},
  ...safeAreaProps
}) => {
  
  // Get theme-aware container styles using the existing design system
  const containerStyles = getContainerStyles(isDarkMode);
  
  // Select the appropriate container variant
  const baseContainerStyle = containerStyles[variant] || containerStyles.screen;
  
  return (
    <SafeAreaView 
      style={[
        baseContainerStyle,
        style
      ]}
      {...safeAreaProps}
    >
      {children}
    </SafeAreaView>
  );
};

export default ScreenContainer;

// Character count: 1,503