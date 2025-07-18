// src/components/Story/StoryViewer.jsx
// Path: src/components/Story/StoryViewer.jsx
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { useProgressiveStoryLoad } from '../../hooks/useProgressiveStoryLoad';
import StoryContent from './StoryContent';
import StoryHeader from './StoryHeader';
import StoryLoadingIndicator from './StoryLoadingIndicator';
import StoryErrorDisplay from './StoryErrorDisplay';
import { colors, spacing, typography } from '../../styles';

/**
 * Main component for viewing stories with progressive loading
 * Handles the complete story viewing experience
 */
const StoryViewer = ({ 
  storyId, 
  manifest, 
  autoStart = true,
  onBack,
  onShare,
  navigation 
}) => {
  const [fontSize, setFontSize] = useState(16);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Use our progressive loading hook
  const {
    content,
    manifest: storyManifest,
    isComplete,
    isLoading,
    error,
    progress,
    estimatedTimeRemaining,
    startLoading,
    stopLoading,
    restartLoading,
    getReadingTimeEstimate,
    hasContent,
    hasError,
    canRetry,
    loadingStats
  } = useProgressiveStoryLoad(storyId, manifest, autoStart);

  // Handle back navigation
  const handleBack = () => {
    if (isLoading) {
      Alert.alert(
        'Stop Loading?',
        'The story is still loading. Do you want to stop and go back?',
        [
          { text: 'Continue Loading', style: 'cancel' },
          { 
            text: 'Stop & Go Back', 
            style: 'destructive',
            onPress: () => {
              stopLoading();
              if (onBack) onBack();
              else if (navigation) navigation.goBack();
            }
          }
        ]
      );
    } else {
      if (onBack) onBack();
      else if (navigation) navigation.goBack();
    }
  };

  // Handle retry
  const handleRetry = () => {
    if (canRetry) {
      restartLoading();
    }
  };

  // Handle share functionality
  const handleShare = () => {
    if (storyManifest && onShare) {
      onShare({
        storyId,
        title: storyManifest.title,
        author: storyManifest.author,
        content: content.substring(0, 200) + (content.length > 200 ? '...' : '')
      });
    }
  };

  // Handle font size changes
  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 2, 24));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 2, 12));
  };

  // Toggle controls visibility
  const toggleControls = () => {
    setShowControls(prev => !prev);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Get reading time info
  const readingTimeInfo = getReadingTimeEstimate();

  // Show error state
  if (hasError && !hasContent) {
    return (
      <StoryErrorDisplay
        error={error}
        onRetry={canRetry ? handleRetry : null}
        onBack={handleBack}
        storyTitle={storyManifest?.title}
        isDarkMode={isDarkMode}
      />
    );
  }

  // Show loading state (when no content yet)
  if (isLoading && !hasContent) {
    return (
      <StoryLoadingIndicator
        storyTitle={storyManifest?.title}
        progress={progress}
        estimatedTimeRemaining={estimatedTimeRemaining}
        loadingStats={loadingStats}
        onCancel={stopLoading}
        onBack={handleBack}
        isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <SafeAreaView style={[
      styles.container,
      isDarkMode && styles.containerDark
    ]}>
      {/* Story Header */}
      <StoryHeader
        manifest={storyManifest}
        onBack={handleBack}
        onShare={handleShare}
        onToggleControls={toggleControls}
        showControls={showControls}
        fontSize={fontSize}
        onIncreaseFontSize={increaseFontSize}
        onDecreaseFontSize={decreaseFontSize}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        readingTimeInfo={readingTimeInfo}
        isLoading={isLoading}
        progress={progress}
      />

      {/* Main Content Area */}
      <ScrollView 
        style={[styles.contentContainer, isDarkMode && styles.contentContainerDark]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onTouchStart={toggleControls}
      >
        <StoryContent
          content={content}
          fontSize={fontSize}
          isDarkMode={isDarkMode}
          isComplete={isComplete}
          isLoading={isLoading}
          manifest={storyManifest}
        />
        
        {/* Loading indicator at bottom if still loading */}
        {isLoading && hasContent && (
          <View style={styles.bottomLoadingContainer}>
            <StoryLoadingIndicator
              compact={true}
              progress={progress}
              estimatedTimeRemaining={estimatedTimeRemaining}
              isDarkMode={isDarkMode}
            />
          </View>
        )}
        
        {/* Error indicator at bottom if error occurred during loading */}
        {hasError && hasContent && (
          <View style={styles.bottomErrorContainer}>
            <StoryErrorDisplay
              compact={true}
              error={error}
              onRetry={canRetry ? handleRetry : null}
              isDarkMode={isDarkMode}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
  contentContainer: {
    flex: 1,
  },
  contentContainerDark: {
    backgroundColor: colors.backgroundDark,
  },
  scrollContent: {
    paddingHorizontal: spacing.medium,
    paddingBottom: spacing.large,
  },
  bottomLoadingContainer: {
    marginTop: spacing.large,
    paddingVertical: spacing.medium,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bottomErrorContainer: {
    marginTop: spacing.large,
    paddingVertical: spacing.medium,
    borderTopWidth: 1,
    borderTopColor: colors.error,
  },
});

export default StoryViewer;

// 1,671 characters