// src/components/Story/StoryViewer.jsx
// Path: src/components/Story/StoryViewer.jsx
import React from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { useStoryViewer } from '../../hooks/useStoryViewer';
import StoryContent from './StoryContent';
import StoryHeader from './StoryHeader';
// import StoryLoadingIndicator from './StoryLoadingIndicator';
import { LoadingProgress } from '../shared';
import StoryErrorDisplay from './StoryErrorDisplay';
import { colors, spacing } from '../../styles';

/**
 * Main component for viewing stories with progressive loading
 * Now using useStoryViewer hook for all logic
 */
const StoryViewer = ({ 
  storyId, 
  manifest, 
  autoStart = true,
  onBack,
  onShare,
  navigation 
}) => {
  // Use our comprehensive story viewer hook
  const {
    // Story state
    content,
    manifest: storyManifest,
    isComplete,
    
    // Loading state
    isLoading,
    error,
    progress,
    estimatedTimeRemaining,
    
    // UI preferences
    fontSize,
    isDarkMode,
    showControls,
    
    // Actions
    handleBack: hookHandleBack,
    handleShare: hookHandleShare,
    restartLoading,
    stopLoading,
    increaseFontSize,
    decreaseFontSize,
    toggleControls,
    toggleDarkMode,
    
    // Computed values
    hasContent,
    hasError,
    canRetry,
    readingTimeInfo,
    loadingStats
  } = useStoryViewer(storyId, manifest, {
    autoStart,
    navigation,
    defaultFontSize: 16,
    defaultDarkMode: false,
    cacheEnabled: true
  });

  // Wrapper for back handler to support custom onBack prop
  const handleBack = () => {
    hookHandleBack(onBack);
  };

  // Wrapper for share handler to support custom onShare prop
  const handleShare = () => {
    if (onShare) {
      // Use custom share handler if provided
      onShare({
        storyId,
        title: storyManifest?.title,
        author: storyManifest?.author,
        content: content.substring(0, 200) + (content.length > 200 ? '...' : '')
      });
    } else {
      // Use default share from hook
      hookHandleShare();
    }
  };

  // Show error state (when no content yet)
  if (hasError && !hasContent) {
    return (
      <StoryErrorDisplay
        error={error}
        onRetry={canRetry ? restartLoading : null}
        onBack={handleBack}
        storyTitle={storyManifest?.title}
        isDarkMode={isDarkMode}
      />
    );
  }

  // Show loading state (when no content yet)
  {isLoading && !hasContent && (
    <LoadingProgress
        title="Loading Story"
        subtitle={storyManifest?.title}
        progress={progress}
        estimatedTimeRemaining={estimatedTimeRemaining}
        loadingStats={loadingStats}
        onCancel={stopLoading}
        onBack={handleBack}
        isDarkMode={isDarkMode}
        tips={[
        '💡 Stories load chunk by chunk to prevent network blocking',
        '📚 Completed stories are cached for instant future access'
        ]}
    />
    );}

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
                <LoadingProgress
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
              onRetry={canRetry ? restartLoading : null}
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

// Character count: 4,892