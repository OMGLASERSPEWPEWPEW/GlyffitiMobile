// src/components/Story/StoryLoadingIndicator.jsx
// Path: src/components/Story/StoryLoadingIndicator.jsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { X, Clock, Download } from 'lucide-react-native';
import { colors, spacing, typography } from '../../styles';

/**
 * Animated loading indicator for story loading progress
 * Shows progress, time estimates, and allows cancellation
 */
const StoryLoadingIndicator = ({
  storyTitle,
  progress = { loaded: 0, total: 0, percentage: 0 },
  estimatedTimeRemaining,
  loadingStats,
  onCancel,
  onBack,
  isDarkMode = false,
  compact = false
}) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animate progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress.percentage / 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress.percentage]);

  // Pulse animation for loading state
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  // Fade in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  // Format time remaining
  const formatTimeRemaining = (seconds) => {
    if (!seconds || seconds <= 0) return 'Calculating...';
    
    if (seconds < 60) {
      return `${seconds}s remaining`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0 
        ? `${minutes}m ${remainingSeconds}s remaining`
        : `${minutes}m remaining`;
    }
  };

  // Calculate loading speed
  const getLoadingSpeed = () => {
    if (!loadingStats || !loadingStats.timeElapsed || loadingStats.chunksLoaded === 0) {
      return 'Calculating speed...';
    }
    
    const chunksPerSecond = loadingStats.chunksLoaded / (loadingStats.timeElapsed / 1000);
    return `${chunksPerSecond.toFixed(1)} chunks/sec`;
  };

  // Compact version for bottom of story
  if (compact) {
    return (
      <Animated.View style={[
        styles.compactContainer,
        isDarkMode && styles.compactContainerDark,
        { opacity: fadeAnim }
      ]}>
        <View style={styles.compactRow}>
          <Download 
            size={16} 
            color={isDarkMode ? colors.accentDark : colors.accent} 
            style={styles.compactIcon}
          />
          <Text style={[
            styles.compactText,
            { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
          ]}>
            Loading {progress.loaded}/{progress.total} chunks
          </Text>
          <Text style={[
            styles.compactPercentage,
            { color: isDarkMode ? colors.accentDark : colors.accent }
          ]}>
            {progress.percentage}%
          </Text>
        </View>
        
        <View style={[
          styles.compactProgressBar,
          isDarkMode && styles.compactProgressBarDark
        ]}>
          <Animated.View 
            style={[
              styles.compactProgressFill,
              { 
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                }),
                backgroundColor: isDarkMode ? colors.accentDark : colors.accent
              }
            ]} 
          />
        </View>
      </Animated.View>
    );
  }

  // Full loading screen
  return (
    <Animated.View style={[
      styles.container,
      isDarkMode && styles.containerDark,
      { opacity: fadeAnim }
    ]}>
      {/* Header with cancel button */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <X 
              size={24} 
              color={isDarkMode ? colors.textDark : colors.text} 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Main loading content */}
      <View style={styles.content}>
        {/* Animated loading icon */}
        <Animated.View style={[
          styles.loadingIcon,
          {
            opacity: pulseAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 1]
            }),
            transform: [{
              scale: pulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1.2]
              })
            }]
          }
        ]}>
          <Download 
            size={48} 
            color={isDarkMode ? colors.accentDark : colors.accent} 
          />
        </Animated.View>

        {/* Story title */}
        {storyTitle && (
          <Text style={[
            styles.storyTitle,
            { color: isDarkMode ? colors.textDark : colors.text }
          ]}>
            {storyTitle}
          </Text>
        )}

        {/* Loading message */}
        <Text style={[
          styles.loadingMessage,
          { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
        ]}>
          Loading story content...
        </Text>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={[
            styles.progressBar,
            isDarkMode && styles.progressBarDark
          ]}>
            <Animated.View 
              style={[
                styles.progressFill,
                { 
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  }),
                  backgroundColor: isDarkMode ? colors.accentDark : colors.accent
                }
              ]} 
            />
          </View>
          
          <Text style={[
            styles.progressText,
            { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
          ]}>
            {progress.loaded} of {progress.total} chunks ({progress.percentage}%)
          </Text>
        </View>

        {/* Time and speed stats */}
        <View style={styles.statsContainer}>
          {estimatedTimeRemaining && (
            <View style={styles.statRow}>
              <Clock 
                size={16} 
                color={isDarkMode ? colors.textSecondaryDark : colors.textSecondary} 
              />
              <Text style={[
                styles.statText,
                { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
              ]}>
                {formatTimeRemaining(estimatedTimeRemaining)}
              </Text>
            </View>
          )}
          
          <Text style={[
            styles.speedText,
            { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
          ]}>
            {getLoadingSpeed()}
          </Text>
        </View>

        {/* Loading tips */}
        <View style={styles.tipsContainer}>
          <Text style={[
            styles.tipText,
            { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
          ]}>
            💡 Stories load chunk by chunk to prevent network blocking
          </Text>
          <Text style={[
            styles.tipText,
            { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
          ]}>
            📚 Completed stories are cached for instant future access
          </Text>
        </View>

        {/* Cancel button */}
        {onCancel && (
          <TouchableOpacity 
            style={[
              styles.cancelButton,
              isDarkMode && styles.cancelButtonDark
            ]} 
            onPress={onCancel}
          >
            <Text style={[
              styles.cancelButtonText,
              { color: isDarkMode ? colors.textDark : colors.text }
            ]}>
              Cancel Loading
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerDark: {
    backgroundColor: colors.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.medium,
    paddingTop: spacing.medium,
  },
  backButton: {
    padding: spacing.small,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.large,
  },
  loadingIcon: {
    marginBottom: spacing.large,
  },
  storyTitle: {
    fontSize: 24,
    fontFamily: typography.fontFamilyBold,
    textAlign: 'center',
    marginBottom: spacing.medium,
  },
  loadingMessage: {
    fontSize: 16,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
    marginBottom: spacing.large,
  },
  progressContainer: {
    width: '100%',
    marginBottom: spacing.large,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.small,
  },
  progressBarDark: {
    backgroundColor: colors.borderDark,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
  },
  statsContainer: {
    alignItems: 'center',
    marginBottom: spacing.large,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  statText: {
    fontSize: 14,
    fontFamily: typography.fontFamily,
    marginLeft: spacing.small,
  },
  speedText: {
    fontSize: 12,
    fontFamily: typography.fontFamily,
    opacity: 0.7,
  },
  tipsContainer: {
    marginBottom: spacing.extraLarge,
  },
  tipText: {
    fontSize: 12,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
    marginBottom: spacing.small,
    opacity: 0.7,
  },
  cancelButton: {
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonDark: {
    borderColor: colors.borderDark,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
  },
  // Compact styles
  compactContainer: {
    backgroundColor: colors.background,
    paddingVertical: spacing.medium,
    paddingHorizontal: spacing.medium,
    borderRadius: 8,
    marginVertical: spacing.small,
  },
  compactContainerDark: {
    backgroundColor: colors.backgroundDark,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  compactIcon: {
    marginRight: spacing.small,
  },
  compactText: {
    flex: 1,
    fontSize: 14,
    fontFamily: typography.fontFamily,
  },
  compactPercentage: {
    fontSize: 14,
    fontFamily: typography.fontFamilyBold,
  },
  compactProgressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  compactProgressBarDark: {
    backgroundColor: colors.borderDark,
  },
  compactProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default StoryLoadingIndicator;

// 2,887 characters