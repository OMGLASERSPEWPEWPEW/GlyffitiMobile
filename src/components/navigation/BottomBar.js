// src/components/navigation/BottomBar.js
// Path: src/components/navigation/BottomBar.js

import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { colors, spacing } from '../../styles/tokens';

const { width: screenWidth } = Dimensions.get('window');

export const BottomBar = ({ 
  onLogoPress,
  onLongPressMenu,
  onHomePress,
  showFooterText = true,
  isDarkMode = false,
  customRadialButtons = null 
}) => {
  const insets = useSafeAreaInsets();
  const [showRadialMenu, setShowRadialMenu] = useState(false);
  
  // Animation values
  const radialMenuOpacity = useRef(new Animated.Value(0)).current;
  const radialMenuScale = useRef(new Animated.Value(0.3)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const bottomBarStyles = {
    container: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: isDarkMode ? '#111827' : colors.background,
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? '#374151' : colors.border,
      paddingBottom: insets.bottom,
      zIndex: 1000,
      alignItems: 'center',
    },
    logoContainer: {
      position: 'absolute',
      top: -20, // Overflow into the feed area
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoButton: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 5,
      zIndex: 1002,
    },
    spacer: {
      height: 44, // Space for the overflowing logo
    },
    footerText: {
      fontSize: 11,
      color: isDarkMode ? '#6b7280' : colors.textLight,
      textAlign: 'center',
      paddingTop: spacing.small,
      paddingBottom: spacing.small,
      opacity: 0.8,
    },
    // Radial Menu Styles
    radialMenuOverlay: {
      position: 'absolute',
      top: -80, // Same as main button position
      left: 88, // Center on the main button (64px button / 2)
      width: 200,
      height: 200,
      // backgroundColor: 'rgba(255, 0, 0, 0.3)',  *debugging only*
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1001,
    },
    radialMenuContainer: {
      position: 'relative',
      width: 200,
      height: 200,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radialButton: {
      position: 'absolute',
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 4,
    },
    // Position buttons around the main button's orbit
    topButton: {
      top: 0, // Position above the main button
      left: 72, // Centered horizontally
    },
    rightButton: {
      top: 40, // Slightly lower for 2 o'clock position  
      left: 130, // To the right for 2 o'clock position
    },
    leftButton: {
      top: 40, // Slightly lower for 10 o'clock position  
      left: 14, // To the left for 10 o'clock position
    },
    radialButtonText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: isDarkMode ? '#e5e7eb' : '#374151',
      marginTop: 2,
    },
    backgroundOverlay: {
      position: 'absolute',
      top: -400,
      left: -screenWidth / 2 + 32,
      width: screenWidth,
      height: 400,
      backgroundColor: 'transparent', // Made transparent as requested
      zIndex: 1000,
    },
  };

  useEffect(() => {
    if (showRadialMenu) {
      // Animate in
      Animated.parallel([
        Animated.timing(radialMenuOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(radialMenuScale, {
          toValue: 1,
          tension: 150,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(radialMenuOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(radialMenuScale, {
          toValue: 0.3,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showRadialMenu]);

  const handleLogoPress = () => {
    if (showRadialMenu) {
      setShowRadialMenu(false);
      return;
    }
    
    if (onLogoPress) {
      onLogoPress();
    }
  };

  const handleLogoLongPress = () => {
    setShowRadialMenu(true);
  };

  const handleRadialAction = (action) => {
    setShowRadialMenu(false);
    
    setTimeout(() => {
      if (onLongPressMenu) {
        onLongPressMenu(action);
      }
    }, 150); // Wait for animation to complete
  };

  const closeRadialMenu = () => {
    setShowRadialMenu(false);
  };

  // Blue ring logo component
  const BlueRingLogo = ({ size = 48 }) => (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path 
        d="M24 4C12.95 4 4 12.95 4 24C4 35.05 12.95 44 24 44C35.05 44 44 35.05 44 24C44 12.95 35.05 4 24 4ZM24 36C17.37 36 12 30.63 12 24C12 17.37 17.37 12 24 12C30.63 12 36 17.37 36 24C36 30.63 30.63 36 24 36Z"
        fill="#3b82f6"
      />
    </Svg>
  );

  // Post icon (simple plus)
  const PostIcon = ({ size = 24 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path 
        d="M12 5V19M5 12H19"
        stroke={isDarkMode ? '#e5e7eb' : '#374151'}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );

  // Publish icon (document with arrow)
  const PublishIcon = ({ size = 24 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path 
        d="M14 2H6C4.89 2 4 2.89 4 4V20C4 21.11 4.89 22 6 22H18C19.11 22 20 21.11 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z"
        fill={isDarkMode ? '#e5e7eb' : '#374151'}
      />
      <Path 
        d="M12 11L16 15L12 19M8 15H16"
        stroke={isDarkMode ? '#1f2937' : '#ffffff'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

  // Clear icon (trash/reset icon)
  const ClearIcon = ({ size = 24 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path 
        d="M3 6H5H21"
        stroke={isDarkMode ? '#e5e7eb' : '#374151'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path 
        d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
        stroke={isDarkMode ? '#e5e7eb' : '#374151'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path 
        d="M10 11V17"
        stroke={isDarkMode ? '#e5e7eb' : '#374151'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path 
        d="M14 11V17"
        stroke={isDarkMode ? '#e5e7eb' : '#374151'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

  // File picker icon (folder with arrow)
  const FileIcon = ({ size = 24 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path 
        d="M10 4H4C2.89 4 2 4.89 2 6V18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V8C22 6.89 21.11 6 20 6H12L10 4Z"
        fill={isDarkMode ? '#e5e7eb' : '#374151'}
      />
      <Path 
        d="M12 11L16 15L12 19M8 15H16"
        stroke={isDarkMode ? '#1f2937' : '#ffffff'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

  // Helper function to get icon component from string
  const getIconComponent = (iconName, size = 24) => {
    switch (iconName) {
      case 'file':
        return <FileIcon size={size} />;
      case 'clear':
        return <ClearIcon size={size} />;
      case 'post':
        return <PostIcon size={size} />;
      case 'publish':
        return <PublishIcon size={size} />;
      default:
        return <PostIcon size={size} />; // Default fallback
    }
  };

  return (
    <View style={bottomBarStyles.container}>
      {/* Left Navigation - Home Button */}
      <View style={{
        position: 'absolute',
        left: spacing.large, // 24px from left edge
        top: spacing.small,  // 8px from top
        zIndex: 1001,
      }}>
        <TouchableOpacity
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 3,
          }}
          onPress={onHomePress}
          activeOpacity={0.7}
        >
          <Text style={{
            fontSize: 20,
            color: isDarkMode ? '#e5e7eb' : '#374151'
          }}>🏠</Text>
        </TouchableOpacity>
      </View>
      
      {/* Background overlay when radial menu is open */}
      {showRadialMenu && (
        <Animated.View 
          style={[
            bottomBarStyles.backgroundOverlay,
            { opacity: overlayOpacity }
          ]}
        >
          <TouchableOpacity 
            style={{ flex: 1, width: '100%' }}
            onPress={closeRadialMenu}
            activeOpacity={1}
          />
        </Animated.View>
      )}

     {/* Radial Menu */}
      {showRadialMenu && (
        <Animated.View 
          style={[
            bottomBarStyles.radialMenuOverlay,
            {
              opacity: radialMenuOpacity,
              transform: [{ scale: radialMenuScale }]
            }
          ]}
        >
          <View style={bottomBarStyles.radialMenuContainer}>
            {/* Top Button */}
            <TouchableOpacity
              style={[bottomBarStyles.radialButton, bottomBarStyles.topButton]}
              onPress={() => handleRadialAction(customRadialButtons?.top?.action || 'post')}
              activeOpacity={0.7}
            >
              {customRadialButtons?.top?.icon 
                ? (typeof customRadialButtons.top.icon === 'string' 
                    ? getIconComponent(customRadialButtons.top.icon, 24)
                    : customRadialButtons.top.icon)
                : <PostIcon size={24} />
              }
              <Text style={bottomBarStyles.radialButtonText}>
                {customRadialButtons?.top?.label || 'Post'}
              </Text>
            </TouchableOpacity>

            {/* Right Button */}
            <TouchableOpacity
              style={[bottomBarStyles.radialButton, bottomBarStyles.rightButton]}
              onPress={() => handleRadialAction(customRadialButtons?.right?.action || 'publish')}
              activeOpacity={0.7}
            >
              {customRadialButtons?.right?.icon 
                ? (typeof customRadialButtons.right.icon === 'string' 
                    ? getIconComponent(customRadialButtons.right.icon, 20)
                    : customRadialButtons.right.icon)
                : <PublishIcon size={20} />
              }
              <Text style={bottomBarStyles.radialButtonText}>
                {customRadialButtons?.right?.label || 'Pub'}
              </Text>
            </TouchableOpacity>

            {/* Left Button */}
            <TouchableOpacity
              style={[bottomBarStyles.radialButton, bottomBarStyles.leftButton]}
              onPress={() => handleRadialAction(customRadialButtons?.left?.action || 'clear')}
              activeOpacity={0.7}
            >
              {customRadialButtons?.left?.icon 
                ? (typeof customRadialButtons.left.icon === 'string' 
                    ? getIconComponent(customRadialButtons.left.icon, 20)
                    : customRadialButtons.left.icon)
                : <ClearIcon size={20} />
              }
              <Text style={bottomBarStyles.radialButtonText}>
                {customRadialButtons?.left?.label || 'Reset'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
      
      {/* Logo Button - Main circle */}
      <View style={bottomBarStyles.logoContainer}>
        <TouchableOpacity
          style={bottomBarStyles.logoButton}
          onPress={handleLogoPress}
          onLongPress={handleLogoLongPress}
          delayLongPress={500}
          activeOpacity={0.7}
        >
          <BlueRingLogo size={48} />
        </TouchableOpacity>
      </View>
      
      {/* Spacer for logo overflow */}
      <View style={bottomBarStyles.spacer} />
      
      {/* Footer Text */}
      {showFooterText && (
        <Text style={bottomBarStyles.footerText}>
          Secure • Decentralized • Permanent
        </Text>
      )}
    </View>
  );
};

// Character count: 8,539