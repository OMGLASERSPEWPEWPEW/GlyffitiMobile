// src/components/Story/StoryHeader.jsx
// Path: src/components/Story/StoryHeader.jsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { 
  ArrowLeft,
  Share2,
  Settings,
  Plus,
  Minus,
  Moon,
  Sun,
  Clock,
  Download
} from 'lucide-react-native';
import { colors, spacing, typography } from '../../styles/tokens';

/**
 * Header component for story viewing with controls and metadata
 * Provides navigation, sharing, and reading customization options
 */
const StoryHeader = ({
  manifest,
  onBack,
  onShare,
  onToggleControls,
  showControls = false,
  fontSize = 16,
  onIncreaseFontSize,
  onDecreaseFontSize,
  isDarkMode = false,
  onToggleDarkMode,
  readingTimeInfo,
  isLoading = false,
  progress = { loaded: 0, total: 0, percentage: 0 }
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Animate controls visibility
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: showControls ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showControls]);

  // Animate progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress.percentage / 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress.percentage]);

  // Auto-hide controls after inactivity
  useEffect(() => {
    if (showControls) {
      const timer = setTimeout(() => {
        if (onToggleControls) {
          onToggleControls();
        }
      }, 5000); // Hide after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [showControls, onToggleControls]);

  // Format author name
  const getAuthorDisplay = () => {
    if (!manifest) return '';
    
    const author = manifest.author || 'Unknown Author';
    const publicKey = manifest.authorPublicKey;
    
    // If author name is same as truncated public key, show truncated key
    if (publicKey && author === publicKey) {
      return `${publicKey.substring(0, 6)}...${publicKey.substring(-4)}`;
    }
    
    return author;
  };

  // Get reading progress text
  const getProgressText = () => {
    if (isLoading) {
      return `Loading ${progress.loaded}/${progress.total} chunks`;
    }
    
    if (readingTimeInfo) {
      return readingTimeInfo.readingTimeText;
    }
    
    return '';
  };

  return (
    <View style={[
      styles.container,
      isDarkMode && styles.containerDark
    ]}>
      {/* Main header bar */}
      <View style={styles.mainHeader}>
        {/* Left section - Back button */}
        <TouchableOpacity 
          onPress={onBack}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft 
            size={24} 
            color={isDarkMode ? colors.textDark : colors.text} 
          />
        </TouchableOpacity>

        {/* Center section - Story info */}
        <View style={styles.centerSection}>
          {manifest && (
            <>
              <Text 
                style={[
                  styles.storyTitle,
                  { color: isDarkMode ? colors.textDark : colors.text }
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {manifest.title}
              </Text>
              <Text 
                style={[
                  styles.authorName,
                  { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
                ]}
                numberOfLines={1}
              >
                by {getAuthorDisplay()}
              </Text>
            </>
          )}
        </View>

        {/* Right section - Action buttons */}
        <View style={styles.rightSection}>
          {onShare && (
            <TouchableOpacity 
              onPress={onShare}
              style={styles.actionButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Share2 
                size={22} 
                color={isDarkMode ? colors.textDark : colors.text} 
              />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            onPress={onToggleControls}
            style={styles.actionButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Settings 
              size={22} 
              color={isDarkMode ? colors.textDark : colors.text} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress bar for loading */}
      {isLoading && (
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
        </View>
      )}

      {/* Reading info bar */}
      <View style={styles.infoBar}>
        <View style={styles.infoLeft}>
          {isLoading && (
            <View style={styles.loadingIndicator}>
              <Download 
                size={14} 
                color={isDarkMode ? colors.accentDark : colors.accent} 
              />
              <Text style={[
                styles.loadingText,
                { color: isDarkMode ? colors.accentDark : colors.accent }
              ]}>
                Loading...
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.infoRight}>
          {readingTimeInfo && !isLoading && (
            <View style={styles.readingTimeContainer}>
              <Clock 
                size={12} 
                color={isDarkMode ? colors.textSecondaryDark : colors.textSecondary} 
              />
              <Text style={[
                styles.readingTimeText,
                { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
              ]}>
                {readingTimeInfo.readingTimeText}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Expandable controls panel */}
      <Animated.View 
        style={[
          styles.controlsPanel,
          isDarkMode && styles.controlsPanelDark,
          {
            opacity: slideAnim,
            transform: [{
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-100, 0]
              })
            }]
          }
        ]}
        pointerEvents={showControls ? 'auto' : 'none'}
      >
        {/* Font size controls */}
        <View style={styles.controlGroup}>
          <Text style={[
            styles.controlLabel,
            { color: isDarkMode ? colors.textDark : colors.text }
          ]}>
            Font Size
          </Text>
          <View style={styles.fontControls}>
            <TouchableOpacity 
              onPress={onDecreaseFontSize}
              style={[
                styles.fontButton,
                isDarkMode && styles.fontButtonDark
              ]}
              disabled={fontSize <= 12}
            >
              <Minus 
                size={16} 
                color={fontSize <= 12 
                  ? (isDarkMode ? colors.textSecondaryDark : colors.textSecondary)
                  : (isDarkMode ? colors.textDark : colors.text)
                } 
              />
            </TouchableOpacity>
            
            <Text style={[
              styles.fontSizeDisplay,
              { color: isDarkMode ? colors.textDark : colors.text }
            ]}>
              {fontSize}px
            </Text>
            
            <TouchableOpacity 
              onPress={onIncreaseFontSize}
              style={[
                styles.fontButton,
                isDarkMode && styles.fontButtonDark
              ]}
              disabled={fontSize >= 24}
            >
              <Plus 
                size={16} 
                color={fontSize >= 24 
                  ? (isDarkMode ? colors.textSecondaryDark : colors.textSecondary)
                  : (isDarkMode ? colors.textDark : colors.text)
                } 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Theme toggle */}
        <View style={styles.controlGroup}>
          <Text style={[
            styles.controlLabel,
            { color: isDarkMode ? colors.textDark : colors.text }
          ]}>
            Theme
          </Text>
          <TouchableOpacity 
            onPress={onToggleDarkMode}
            style={[
              styles.themeButton,
              isDarkMode && styles.themeButtonDark
            ]}
          >
            {isDarkMode ? (
              <Sun size={16} color={colors.textDark} />
            ) : (
              <Moon size={16} color={colors.text} />
            )}
            <Text style={[
              styles.themeButtonText,
              { color: isDarkMode ? colors.textDark : colors.text }
            ]}>
              {isDarkMode ? 'Light' : 'Dark'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Story metadata */}
        {manifest && (
          <View style={styles.metadataGroup}>
            <Text style={[
              styles.metadataLabel,
              { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
            ]}>
              Story Details
            </Text>
            <Text style={[
              styles.metadataText,
              { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
            ]}>
              {manifest.totalChunks} chunks • Published {new Date(manifest.timestamp).toLocaleDateString()}
            </Text>
            {readingTimeInfo && (
              <Text style={[
                styles.metadataText,
                { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
              ]}>
                {readingTimeInfo.wordCount} words
              </Text>
            )}
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  containerDark: {
    backgroundColor: colors.backgroundDark,
    borderBottomColor: colors.borderDark,
  },
  mainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.medium,
    minHeight: 56,
  },
  backButton: {
    padding: spacing.small,
    marginRight: spacing.small,
  },
  centerSection: {
    flex: 1,
    marginHorizontal: spacing.small,
  },
  storyTitle: {
    fontSize: 18,
    fontFamily: typography.fontFamilyBold,
    marginBottom: 2,
  },
  authorName: {
    fontSize: 14,
    fontFamily: typography.fontFamily,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: spacing.small,
    marginLeft: spacing.small,
  },
  progressContainer: {
    paddingHorizontal: spacing.medium,
    paddingBottom: spacing.small,
  },
  progressBar: {
    height: 2,
    backgroundColor: colors.border,
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressBarDark: {
    backgroundColor: colors.borderDark,
  },
  progressFill: {
    height: '100%',
    borderRadius: 1,
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.medium,
    paddingBottom: spacing.small,
  },
  infoLeft: {
    flex: 1,
  },
  infoRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
    fontFamily: typography.fontFamily,
    marginLeft: spacing.extraSmall,
  },
  readingTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readingTimeText: {
    fontSize: 12,
    fontFamily: typography.fontFamily,
    marginLeft: spacing.extraSmall,
  },
  controlsPanel: {
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.medium,
  },
  controlsPanelDark: {
    backgroundColor: colors.backgroundDark,
    borderTopColor: colors.borderDark,
  },
  controlGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.medium,
  },
  controlLabel: {
    fontSize: 14,
    fontFamily: typography.fontFamilyBold,
  },
  fontControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fontButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontButtonDark: {
    backgroundColor: colors.borderDark,
  },
  fontSizeDisplay: {
    fontSize: 14,
    fontFamily: typography.fontFamily,
    marginHorizontal: spacing.medium,
    minWidth: 40,
    textAlign: 'center',
  },
  themeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderRadius: 16,
    backgroundColor: colors.border,
  },
  themeButtonDark: {
    backgroundColor: colors.borderDark,
  },
  themeButtonText: {
    fontSize: 14,
    fontFamily: typography.fontFamily,
    marginLeft: spacing.small,
  },
  metadataGroup: {
    marginTop: spacing.small,
    paddingTop: spacing.medium,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  metadataLabel: {
    fontSize: 12,
    fontFamily: typography.fontFamilyBold,
    marginBottom: spacing.small,
  },
  metadataText: {
    fontSize: 12,
    fontFamily: typography.fontFamily,
    marginBottom: spacing.extraSmall,
  },
});

export default StoryHeader;

// 3,127 characters