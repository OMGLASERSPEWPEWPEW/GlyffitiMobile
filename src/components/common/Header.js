// src/components/common/Header.js
// Path: src/components/common/Header.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const Header = ({ 
  title, 
  leftAction, 
  rightAction, 
  leftIcon, 
  rightIcon,
  variant = 'standard', // 'standard', 'large', 'compact', 'modal'
  elevated = false,
  transparent = false
}) => {
  const { isDark, components } = useTheme();
  
  // Get pre-computed navigation styles from your design system
  const navStyles = components.navigation;
  
  // Determine which header style to use based on variant
  const getHeaderContainer = () => {
    let baseStyle = navStyles.base; // Base header style
    
    // Apply variant
    switch (variant) {
      case 'large':
        baseStyle = [baseStyle, navStyles.large];
        break;
      case 'compact':
        baseStyle = [baseStyle, navStyles.compact];
        break;
      case 'modal':
        baseStyle = [baseStyle, navStyles.modal];
        break;
      default:
        baseStyle = [baseStyle, navStyles.standard];
    }
    
    // Apply elevation
    if (elevated) {
      baseStyle = [baseStyle, navStyles.elevated];
    }
    
    // Apply transparency
    if (transparent) {
      baseStyle = [baseStyle, navStyles.transparent];
    }
    
    return baseStyle;
  };

  return (
    <View style={getHeaderContainer()}>
      {/* Left Section */}
      <View style={navStyles.leftSection}>
        {leftAction && (
          <TouchableOpacity 
            onPress={leftAction} 
            style={navStyles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            {leftIcon || <Text style={navStyles.iconText}>←</Text>}
          </TouchableOpacity>
        )}
      </View>
      
      {/* Center Section */}
      <View style={navStyles.centerSection}>
        <Text 
          style={navStyles.title}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
      </View>
      
      {/* Right Section */}
      <View style={navStyles.rightSection}>
        {rightAction && (
          <TouchableOpacity 
            onPress={rightAction} 
            style={navStyles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Header action"
          >
            {rightIcon || <Text style={navStyles.iconText}>⚙️</Text>}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default Header;

// Character count: 1,811