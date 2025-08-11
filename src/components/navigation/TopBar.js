// src/components/navigation/TopBar.js
// Path: src/components/navigation/TopBar.js

import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../../styles/tokens';

export const TopBar = ({ 
  title = "Glyffiti", 
  subtitle = "Blockchain Social Network",
  showBackButton = false,
  onBackPress,
  rightComponent,
  selectedUser = null,
  onUserTap,
  onUserLongPress,
  isDarkMode = false,
  style = {} 
}) => {
  const insets = useSafeAreaInsets();
  
  const topBarStyles = {
    container: {
      backgroundColor: isDarkMode ? '#111827' : colors.background,
      paddingTop: insets.top,
      paddingHorizontal: spacing.medium,
      paddingBottom: spacing.small,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#374151' : colors.border,
      zIndex: 1000,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: subtitle ? spacing.small : 0,
    },
    leftSection: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    centerSection: {
      flex: 2,
      alignItems: 'center',
    },
    rightSection: {
      flex: 1,
      alignItems: 'flex-end',
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDarkMode ? '#e5e7eb' : colors.text,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 14,
      color: isDarkMode ? '#9ca3af' : colors.textSecondary,
      textAlign: 'center',
      opacity: 0.9,
    },
    backButton: {
      padding: spacing.small,
      marginRight: spacing.small,
    },
    backButtonText: {
      fontSize: 18,
      color: isDarkMode ? '#e5e7eb' : colors.primary,
    },
    userAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDarkMode ? '#3b82f6' : colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.small,
    },
    userAvatarText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    userPlaceholder: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDarkMode ? '#374151' : '#e5e7eb',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.small,
    },
    userPlaceholderText: {
      fontSize: 16,
      color: isDarkMode ? '#9ca3af' : '#6b7280',
    },
  };

  const getUserInitial = () => {
    if (selectedUser?.username) {
      return selectedUser.username.charAt(0).toUpperCase();
    }
    return '?';
  };

  return (
    <>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={isDarkMode ? '#111827' : colors.background}
      />
      <View style={[topBarStyles.container, style]}>
        <View style={topBarStyles.topRow}>
          <View style={topBarStyles.leftSection}>
            {showBackButton && (
              <TouchableOpacity 
                style={topBarStyles.backButton}
                onPress={onBackPress}
                activeOpacity={0.7}
              >
                <Text style={topBarStyles.backButtonText}>←</Text>
              </TouchableOpacity>
            )}
            
            {/* User Avatar */}
            <TouchableOpacity
              style={selectedUser ? topBarStyles.userAvatar : topBarStyles.userPlaceholder}
              onPress={onUserTap}
              onLongPress={onUserLongPress}
              activeOpacity={0.7}
              delayLongPress={500}
            >
              <Text style={selectedUser ? topBarStyles.userAvatarText : topBarStyles.userPlaceholderText}>
                {getUserInitial()}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={topBarStyles.centerSection}>
            <Text style={topBarStyles.title}>{title}</Text>
          </View>
          
          <View style={topBarStyles.rightSection}>
            {rightComponent}
          </View>
        </View>
        
        {/* Subtitle Row */}
        {subtitle && (
          <Text style={topBarStyles.subtitle}>{subtitle}</Text>
        )}
      </View>
    </>
  );
};

// Character count: 4324