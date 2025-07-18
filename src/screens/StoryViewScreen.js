// src/screens/StoryViewScreen.js
// Path: src/screens/StoryViewScreen.js
import React from 'react';
import { Share, Alert } from 'react-native';
import StoryViewer from '../components/Story/StoryViewer';

/**
 * Screen wrapper for the StoryViewer component
 * Handles navigation integration and sharing functionality
 */
export const StoryViewScreen = ({ route, navigation }) => {
  // Extract parameters passed from navigation
  const { storyId, manifest, autoStart = true } = route.params || {};

  // Handle back navigation
  const handleBack = () => {
    navigation.goBack();
  };

  // Handle story sharing
  const handleShare = async (storyData) => {
    try {
      const shareContent = {
        title: `"${storyData.title}" by ${storyData.author}`,
        message: `Check out this story on Glyffiti: "${storyData.title}" by ${storyData.author}\n\n${storyData.content}`,
        // You can add a URL here when you have a web version
        // url: `https://glyffiti.com/story/${storyData.storyId}`
      };

      const result = await Share.share(shareContent);
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Story shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dialog dismissed');
      }
    } catch (error) {
      console.error('Error sharing story:', error);
      Alert.alert('Error', 'Failed to share story. Please try again.');
    }
  };

  // Validate required parameters
  if (!storyId || !manifest) {
    Alert.alert(
      'Error',
      'Story information is missing. Please try again.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
    return null;
  }

  return (
    <StoryViewer
      storyId={storyId}
      manifest={manifest}
      autoStart={autoStart}
      onBack={handleBack}
      onShare={handleShare}
      navigation={navigation}
    />
  );
};

export default StoryViewScreen;

// 1,769 characters