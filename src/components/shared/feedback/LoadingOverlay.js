// src/components/shared/LoadingOverlay.js
// Path: src/components/shared/LoadingOverlay.js
import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  ActivityIndicator, 
  Animated,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { X } from 'lucide-react-native';
import { colors, spacing, typography } from '../../../styles';

const { width, height } = Dimensions.get('window');

/**
 * Full-screen loading overlay component
 * Used for blocking operations that need to prevent user interaction
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

  // Determine colors
  const spinnerColor = color || (isDarkMode ? colors.accentDark : colors.accent);
  const textColor = isDarkMode ? colors.textDark : colors.text;
  const subTextColor = isDarkMode ? colors.textSecondaryDark : colors.textSecondary;
  const backdropColor = isDarkMode 
    ? 'rgba(0, 0, 0, 0.8)' 
    : 'rgba(0, 0, 0, 0.5)';

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

  // Content component
  const LoadingContent = () => (
    <Animated.View style={[
      styles.content,
      isDarkMode && styles.contentDark,
      animated && {
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }]
      },
      contentStyle
    ]}>
      {/* Cancel button */}
      {showCancel && onCancel && (
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={onCancel}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X 
            size={20} 
            color={isDarkMode ? colors.textSecondaryDark : colors.textSecondary} 
          />
        </TouchableOpacity>
      )}

      {/* Loading spinner */}
      <ActivityIndicator 
        size={size} 
        color={spinnerColor}
        style={styles.spinner}
      />

      {/* Main message */}
      <Text style={[
        styles.message,
        { color: textColor },
        messageStyle
      ]}>
        {message}
      </Text>

      {/* Sub message */}
      {subMessage && (
        <Text style={[
          styles.subMessage,
          { color: subTextColor }
        ]}>
          {subMessage}
        </Text>
      )}
    </Animated.View>
  );

  // Backdrop component
  const Backdrop = () => (
    <Animated.View style={[
      styles.backdrop,
      {
        backgroundColor: backdrop ? backdropColor : 'transparent',
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

  // Absolute positioned overlay
  return (
    <View style={styles.absoluteContainer}>
      <Backdrop />
    </View>
  );
};

const styles = StyleSheet.create({
  absoluteContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.large,
  },
  content: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: spacing.extraLarge,
    paddingHorizontal: spacing.large,
    minWidth: 200,
    maxWidth: width * 0.8,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  contentDark: {
    backgroundColor: colors.surfaceDark,
  },
  cancelButton: {
    position: 'absolute',
    top: spacing.medium,
    right: spacing.medium,
    padding: spacing.small,
    zIndex: 1,
  },
  spinner: {
    marginBottom: spacing.medium,
  },
  message: {
    fontSize: 18,
    fontFamily: typography.fontFamilyBold,
    textAlign: 'center',
    marginBottom: spacing.small,
  },
  subMessage: {
    fontSize: 14,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 20,
  },
});

export default LoadingOverlay;

// Character count: 4667