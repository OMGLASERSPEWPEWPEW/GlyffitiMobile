// src/components/shared/feedback/LoadingOverlay.js
// Path: src/components/shared/feedback/LoadingOverlay.js

import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  ActivityIndicator, 
  Animated,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { X } from 'lucide-react-native';
import { getScreenStyles, modalOverlayStyles } from '../../../styles/layouts/screens';
import { getContentStyles } from '../../../styles/components/content';
import { spacing, typography } from '../../../styles/tokens';

const { width, height } = Dimensions.get('window');

/**
 * Full-screen loading overlay component
 * Uses the new styling system with theme-aware modal/overlay patterns
 * Can be modal or absolute positioned
 */
const LoadingOverlay = ({
  visible = false,
  message = 'Loading...',
  subMessage,
  showCancel = false,
  onCancel,
  isDarkMode = false,
  modal = true, // Use Modal component vs absolute positioning
  transparent = true, // Semi-transparent background
  size = 'large', // 'small', 'large'
  color,
  animated = true,
  overlayStyle,
  contentStyle,
  messageStyle,
  backdrop = true // Show backdrop overlay
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Get theme-aware styles
  const screenStyles = getScreenStyles(isDarkMode);
  const contentStyles = getContentStyles(isDarkMode);

  // Determine spinner color from theme or prop
  const spinnerColor = color || (isDarkMode ? '#10b981' : '#3b82f6'); // Using design tokens

  // Animate show/hide
  useEffect(() => {
    if (visible && animated) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (!visible && animated) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // No animation
      fadeAnim.setValue(visible ? 1 : 0);
      scaleAnim.setValue(visible ? 1 : 0.8);
    }
  }, [visible, animated]);

  // Content component using new styling system
  const LoadingContent = () => (
    <Animated.View style={[
      {
        backgroundColor: isDarkMode ? '#374151' : '#ffffff',
        borderRadius: 16,
        paddingVertical: spacing.extraLarge,
        paddingHorizontal: spacing.large,
        minWidth: 200,
        maxWidth: width * 0.8,
        alignItems: 'center',
        // Use new shadow system
        shadowColor: isDarkMode ? '#000000' : '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: isDarkMode ? 0.4 : 0.25,
        shadowRadius: 16,
        elevation: 8,
      },
      animated && {
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }]
      },
      contentStyle
    ]}>
      {/* Cancel button */}
      {showCancel && onCancel && (
        <TouchableOpacity 
          style={{
            position: 'absolute',
            top: spacing.medium,
            right: spacing.medium,
            padding: spacing.small,
            zIndex: 1,
          }}
          onPress={onCancel}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X 
            size={20} 
            color={isDarkMode ? '#9ca3af' : '#6b7280'} 
          />
        </TouchableOpacity>
      )}

      {/* Loading spinner */}
      <ActivityIndicator 
        size={size} 
        color={spinnerColor}
        style={{ marginBottom: spacing.medium }}
      />

      {/* Main message using content styles */}
      <Text style={[
        {
          fontSize: 18,
          fontFamily: typography.fontFamilyBold,
          textAlign: 'center',
          marginBottom: spacing.small,
          color: contentStyles.primaryText.color,
        },
        messageStyle
      ]}>
        {message}
      </Text>

      {/* Sub message using content styles */}
      {subMessage && (
        <Text style={[
          {
            fontSize: 14,
            fontFamily: typography.fontFamily,
            textAlign: 'center',
            opacity: 0.8,
            lineHeight: 20,
            color: contentStyles.secondaryText.color,
          }
        ]}>
          {subMessage}
        </Text>
      )}
    </Animated.View>
  );

  // Backdrop component using new overlay styles
  const Backdrop = () => (
    <Animated.View style={[
      screenStyles.overlay, // Use new overlay style
      {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.large,
        opacity: animated ? fadeAnim : 1
      },
      overlayStyle
    ]}>
      <LoadingContent />
    </Animated.View>
  );

  if (!visible) {
    return null;
  }

  if (modal) {
    return (
      <Modal
        visible={visible}
        transparent={transparent}
        animationType="none" // We handle our own animations
        statusBarTranslucent
      >
        <Backdrop />
      </Modal>
    );
  }

  // Absolute positioned overlay using new positioning system
  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
    }}>
      <Backdrop />
    </View>
  );
};

export default LoadingOverlay;

// Character count: 4,847