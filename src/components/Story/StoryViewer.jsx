// src/components/Story/StoryViewer.jsx
// Path: src/components/Story/StoryViewer.jsx

import React from 'react';
import { View, ScrollView, SafeAreaView } from 'react-native';
import { useStoryViewer } from '../../hooks/useStoryViewer';
import StoryContent from './StoryContent';
import StoryHeader from './StoryHeader';
import { LoadingProgress, ErrorDisplay, ErrorBoundary, RetryButton } from '../shared';
import { colors, spacing } from '../../styles/tokens';
import { storyViewerStyles } from '../../styles/storyViewerStyles';

/**
 * Main component for viewing stories with progressive loading
 * Now using useStoryViewer hook for all logic and new error boundary components
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

  // Helper function to determine error type based on error object
  const getErrorType = (error) => {
    if (!error) return 'general';
    
    const errorMessage = error.message?.toLowerCase() || '';
    
    if (errorMessage.includes('network') || errorMessage.includes('connection') || errorMessage.includes('fetch')) {
      return 'network';
    }
    if (errorMessage.includes('manifest') || errorMessage.includes('format') || errorMessage.includes('parse')) {
      return 'validation';
    }
    if (errorMessage.includes('server') || errorMessage.includes('500') || errorMessage.includes('503')) {
      return 'server';
    }
    if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      return 'notFound';
    }
    
    return 'general';
  };

  // Helper function to get appropriate error message
  const getErrorMessage = (error) => {
    if (!error) return 'An unexpected error occurred while loading this story.';
    
    const errorType = getErrorType(error);
    
    switch (errorType) {
      case 'network':
        return 'Unable to connect to the story server. Please check your internet connection and try again.';
      case 'validation':
        return 'The story format appears to be invalid or corrupted. Please try again.';
      case 'server':
        return 'The story server is currently unavailable. Please try again later.';
      case 'notFound':
        return 'This story could not be found. It may have been removed or moved.';
      default:
        return error.message || 'An unexpected error occurred while loading this story.';
    }
  };

  // Helper function to get error title
  const getErrorTitle = (error) => {
    const errorType = getErrorType(error);
    
    switch (errorType) {
      case 'network':
        return 'Connection Problem';
      case 'validation':
        return 'Story Format Error';
      case 'server':
        return 'Server Error';
      case 'notFound':
        return 'Story Not Found';
      default:
        return 'Story Loading Failed';
    }
  };

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
      <View style={storyViewerStyles.fullScreenError}>
        <ErrorDisplay
          type={getErrorType(error)}
          title={getErrorTitle(error)}
          message={getErrorMessage(error)}
          onRetry={canRetry ? restartLoading : undefined}
          showGoBack={true}
          onGoBack={handleBack}
          isDarkMode={isDarkMode}
        />
      </View>
    );
  }

  // Show loading state (when no content yet)
  if (isLoading && !hasContent) {
    return (
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
    );
  }

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('StoryViewer error boundary caught:', error);
        console.error('Error info:', errorInfo);
        // Could log to analytics here
      }}
      onFallbackPress={handleBack}
      isDarkMode={isDarkMode}
    >
      <SafeAreaView style={[
        storyViewerStyles.container,
        isDarkMode && storyViewerStyles.containerDark
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
          style={[
            storyViewerStyles.contentContainer, 
            isDarkMode && storyViewerStyles.contentContainerDark
          ]}
          contentContainerStyle={storyViewerStyles.scrollContent}
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
            <View style={[
              storyViewerStyles.bottomLoadingContainer,
              isDarkMode && storyViewerStyles.bottomLoadingContainerDark
            ]}>
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
            <View style={[
              storyViewerStyles.bottomErrorContainer,
              isDarkMode && storyViewerStyles.bottomErrorContainerDark
            ]}>
              <View style={storyViewerStyles.compactErrorContainer}>
                <ErrorDisplay
                  type={getErrorType(error)}
                  title={getErrorTitle(error)}
                  message={getErrorMessage(error)}
                  onRetry={canRetry ? restartLoading : undefined}
                  showRetry={canRetry}
                  showGoBack={false}
                  isDarkMode={isDarkMode}
                  style={{ 
                    borderRadius: 8,
                    marginHorizontal: 0,
                    padding: spacing.medium 
                  }}
                />
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ErrorBoundary>
  );
};

export default StoryViewer;

// Character count: 6247