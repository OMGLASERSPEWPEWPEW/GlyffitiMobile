// src/components/overlays/PostComposerOverlay.js
// Path: src/components/overlays/PostComposerOverlay.js

import React, { useRef, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../styles/tokens';

const { width: screenWidth } = Dimensions.get('window');

export const PostComposerOverlay = ({ 
  visible = false,
  selectedUser = null,
  selectedUserData = null,
  userWalletBalance = 0,
  onClose,
  onPostCreate,
  isDarkMode = false 
}) => {
  const slideAnim = useRef(new Animated.Value(300)).current; // Start below screen
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const [postContent, setPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Constants
  const MAX_POST_LENGTH = 280; // Twitter-style character limit
  const ESTIMATED_COST_PER_POST = 0.001; // SOL - rough estimate
  
  // Calculate remaining characters
  const remainingChars = MAX_POST_LENGTH - postContent.length;
  const isOverLimit = remainingChars < 0;
  const isNearLimit = remainingChars <= 20 && remainingChars > 0;
  const canPost = postContent.trim().length > 0 && !isOverLimit && selectedUser && !isPosting;

  useEffect(() => {
    if (visible) {
      // Slide up from bottom
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide down to bottom
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handlePost = async () => {
    if (!canPost) return;

    try {
      setIsPosting(true);
      
      const postData = {
        content: postContent.trim(),
        user: selectedUser,
        timestamp: Date.now(),
      };

      if (onPostCreate) {
        const result = await onPostCreate(postData);
        if (result?.success) {
          setPostContent(''); // Clear the composer
          onClose(); // Close the overlay
        }
      }
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleClose = () => {
    setPostContent(''); // Clear content when closing
    onClose();
  };

  const overlayStyles = {
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 2000,
    },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    composer: {
      position: 'absolute',
      bottom: 200, // Raised higher to avoid keyboard
      left: spacing.medium,
      right: spacing.medium,
      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
      borderRadius: 16,
      padding: spacing.large,
      maxHeight: 300,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: -4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.medium,
    },
    title: {
      fontSize: typography.fontSize.large,
      fontWeight: typography.fontWeight.bold,
      color: isDarkMode ? '#e5e7eb' : '#111827',
    },
    closeButton: {
      padding: spacing.small,
    },
    closeButtonText: {
      fontSize: 18,
      color: isDarkMode ? '#9ca3af' : '#6b7280',
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.medium,
    },
    userAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: isDarkMode ? '#3b82f6' : colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.small,
    },
    userAvatarText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    userName: {
      fontSize: typography.fontSize.medium,
      fontWeight: typography.fontWeight.medium,
      color: isDarkMode ? '#e5e7eb' : '#111827',
    },
    textInput: {
      minHeight: 80,
      fontSize: typography.fontSize.medium,
      color: isDarkMode ? '#e5e7eb' : '#111827',
      backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
      borderRadius: 8,
      padding: spacing.medium,
      marginBottom: spacing.medium,
      textAlignVertical: 'top',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    charCount: {
      fontSize: typography.fontSize.small,
      color: isOverLimit ? '#ef4444' : 
            isNearLimit ? '#f59e0b' : 
            isDarkMode ? '#9ca3af' : '#6b7280',
    },
    postButton: {
      backgroundColor: canPost ? 
        (isDarkMode ? '#3b82f6' : colors.primary) : 
        (isDarkMode ? '#374151' : '#e5e7eb'),
      paddingHorizontal: spacing.large,
      paddingVertical: spacing.small,
      borderRadius: 20,
      minWidth: 80,
      alignItems: 'center',
    },
    postButtonText: {
      fontSize: typography.fontSize.medium,
      fontWeight: typography.fontWeight.bold,
      color: canPost ? '#ffffff' : 
        (isDarkMode ? '#6b7280' : '#9ca3af'),
    },
    costInfo: {
      fontSize: typography.fontSize.small,
      color: isDarkMode ? '#9ca3af' : '#6b7280',
      marginTop: spacing.small,
    },
  };

  if (!visible) return null;

  return (
    <View style={overlayStyles.container} pointerEvents={visible ? 'auto' : 'none'}>
      {/* Backdrop */}
      <Animated.View 
        style={[overlayStyles.backdrop, { opacity: overlayAnim }]}
      >
        <TouchableOpacity 
          style={{ flex: 1 }} 
          onPress={handleClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Composer */}
      <Animated.View 
        style={[
          overlayStyles.composer,
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        {/* Header */}
        <View style={overlayStyles.header}>
          <Text style={overlayStyles.title}>New Post</Text>
          <TouchableOpacity 
            style={overlayStyles.closeButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Text style={overlayStyles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* User Info */}
        {selectedUser && (
          <View style={overlayStyles.userInfo}>
            <View style={overlayStyles.userAvatar}>
              <Text style={overlayStyles.userAvatarText}>
                {selectedUser.username?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
            <Text style={overlayStyles.userName}>
              {selectedUser.username}
            </Text>
          </View>
        )}

        {/* Text Input */}
        <TextInput
          style={overlayStyles.textInput}
          placeholder="What's happening?"
          placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
          value={postContent}
          onChangeText={setPostContent}
          multiline
          autoFocus
          maxLength={MAX_POST_LENGTH + 50} // Allow over-typing to show error
        />

        {/* Footer */}
        <View style={overlayStyles.footer}>
          <View>
            <Text style={overlayStyles.charCount}>
              {remainingChars} characters remaining
            </Text>
            <Text style={overlayStyles.costInfo}>
              Est. cost: ~{ESTIMATED_COST_PER_POST} SOL
            </Text>
          </View>

          <TouchableOpacity
            style={overlayStyles.postButton}
            onPress={handlePost}
            disabled={!canPost}
            activeOpacity={0.7}
          >
            {isPosting ? (
              <ActivityIndicator 
                size="small" 
                color="#ffffff" 
              />
            ) : (
              <Text style={overlayStyles.postButtonText}>
                Post
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

// Character count: 7458