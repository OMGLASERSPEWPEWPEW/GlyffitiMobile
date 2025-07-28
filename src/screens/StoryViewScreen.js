// src/screens/StoryViewScreen.js
// Path: src/screens/StoryViewScreen.js
import React from 'react';
import { Alert } from 'react-native';
import StoryViewer from '../components/Story/StoryViewer';
import { ErrorBoundary, ErrorDisplay } from '../components/shared';

/**
 * Screen wrapper for the StoryViewer component
 * Simplified to just handle navigation and validation
 */
export const StoryViewScreen = ({ route, navigation }) => {
  // Extract parameters passed from navigation
  const { storyId, manifest, autoStart = true } = route.params || {};

  // Validate required parameters
  if (!storyId || !manifest) {
    return (
      <ErrorDisplay
        type="validation"
        title="Story Not Found"
        message="Story information is missing. Please try again."
        showGoBack={true}
        onGoBack={() => navigation.goBack()}
        style={{ flex: 1, justifyContent: 'center' }}
      />
    );
  }


  // The StoryViewer component now handles everything internally
  // We just pass the props and let the hook manage all the logic
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('StoryViewer error:', error);
        // Could log to analytics here
      }}
      onFallbackPress={() => navigation.goBack()}
    >
      <StoryViewer
        storyId={storyId}
        manifest={manifest}
        autoStart={autoStart}
        navigation={navigation}
      />
    </ErrorBoundary>
  );
};

export default StoryViewScreen;

// Character count: 872