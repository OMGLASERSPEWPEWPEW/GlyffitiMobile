// src/screens/StoryViewScreen.js
// Path: src/screens/StoryViewScreen.js
import React from 'react';
import { Alert } from 'react-native';
import StoryViewer from '../components/Story/StoryViewer';

/**
 * Screen wrapper for the StoryViewer component
 * Simplified to just handle navigation and validation
 */
export const StoryViewScreen = ({ route, navigation }) => {
  // Extract parameters passed from navigation
  const { storyId, manifest, autoStart = true } = route.params || {};

  // Validate required parameters
  if (!storyId || !manifest) {
    Alert.alert(
      'Error',
      'Story information is missing. Please try again.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
    return null;
  }

  // The StoryViewer component now handles everything internally
  // We just pass the props and let the hook manage all the logic
  return (
    <StoryViewer
      storyId={storyId}
      manifest={manifest}
      autoStart={autoStart}
      navigation={navigation}
    />
  );
};

export default StoryViewScreen;

// Character count: 872