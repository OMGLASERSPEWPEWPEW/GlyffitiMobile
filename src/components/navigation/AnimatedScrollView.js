// src/components/navigation/AnimatedScrollView.js
// Path: src/components/navigation/AnimatedScrollView.js

import React, { useRef, useState } from 'react';
import { ScrollView, Animated } from 'react-native';

export const AnimatedScrollView = ({ 
  children, 
  onTopBarVisibilityChange,
  style,
  contentContainerStyle,
  ...scrollViewProps 
}) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const [topBarVisible, setTopBarVisible] = useState(true);
  
  // Threshold for when to hide/show the top bar
  const SCROLL_THRESHOLD = 50;
  const HIDE_THRESHOLD = 100; // Hide after scrolling down this much
  
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        const scrollDelta = currentScrollY - lastScrollY.current;
        
        // Only react to significant scroll movements
        if (Math.abs(scrollDelta) > 5) {
          // Scrolling down and past threshold - hide top bar
          if (scrollDelta > 0 && currentScrollY > HIDE_THRESHOLD && topBarVisible) {
            setTopBarVisible(false);
            onTopBarVisibilityChange?.(false);
          }
          // Scrolling up or near top - show top bar
          else if ((scrollDelta < -10 || currentScrollY < SCROLL_THRESHOLD) && !topBarVisible) {
            setTopBarVisible(true);
            onTopBarVisibilityChange?.(true);
          }
          
          lastScrollY.current = currentScrollY;
        }
      },
    }
  );

  return (
    <ScrollView
      style={style}
      contentContainerStyle={contentContainerStyle}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      {...scrollViewProps}
    >
      {children}
    </ScrollView>
  );
};

// Character count: 1726