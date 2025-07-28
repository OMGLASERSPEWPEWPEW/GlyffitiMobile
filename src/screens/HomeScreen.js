// src/screens/HomeScreen.js  
// Path: src/screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Dimensions
} from 'react-native';
import { Card } from '../components/shared';
import { homeStyles } from '../styles/homeStyles';
import { colors, spacing } from '../styles';
// Temporarily comment out story cache until we fix the dependencies
// import { storyCache } from '../services/story/StoryCache';

const { width } = Dimensions.get('window');

export const HomeScreen = ({ navigation, isDarkMode = false }) => {
  const [cachedStories, setCachedStories] = useState([]);
  const [cacheStats, setCacheStats] = useState(null);

  useEffect(() => {
    // loadCacheData();
  }, []);

  /* Temporarily disabled until dependencies are fixed
  const loadCacheData = async () => {
    try {
      const cached = await storyCache.getAllCachedManifests();
      const stats = await storyCache.getCacheStats();
      setCachedStories(cached.slice(0, 3)); // Show first 3 for preview
      setCacheStats(stats);
    } catch (error) {
      console.error('Error loading cache data:', error);
    }
  };
  */

  const handlePublishing = () => {
    navigation?.navigate('Publishing');
  };

  // Navigate to story discovery (will be enabled later)
  const handleDiscoverStories = () => {
    console.log('Story discovery coming soon!');
    // navigation.navigate('StoryDiscovery', { showCachedOnly: false });
  };

  // Navigate to cached stories (will be enabled later)
  const handleViewCachedStories = () => {
    console.log('Cached stories coming soon!');
    // navigation.navigate('StoryDiscovery', { showCachedOnly: true });
  };

  const handlePlaceholderPress = (feature) => {
    if (feature === 'Library') {
      handleViewCachedStories();
    } else if (feature === 'Discover') {
      handleDiscoverStories();
    } else {
      console.log(`${feature} pressed - coming soon!`);
    }
  };

  return (
    <SafeAreaView style={[
      homeStyles.container,
      isDarkMode && { backgroundColor: '#1f2937' }
    ]}>
      <ScrollView 
        contentContainerStyle={homeStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={homeStyles.header}>
          <Text style={[
            homeStyles.appTitle,
            { color: isDarkMode ? '#3b82f6' : colors.primary }
          ]}>
            Glyffiti
          </Text>
          <Text style={[
            homeStyles.tagline,
            { color: isDarkMode ? '#9ca3af' : colors.textSecondary }
          ]}>
            Decentralized storytelling on Solana
          </Text>
        </View>

        {/* Main Action Section */}
        <View style={homeStyles.mainSection}>
          <Text style={[
            homeStyles.sectionTitle,
            { color: isDarkMode ? '#e5e7eb' : colors.text }
          ]}>
            What would you like to do?
          </Text>
          
          {/* Publishing Button - Main Feature */}
          <Card
            backgroundColor={isDarkMode ? '#3b82f6' : colors.primary}
            borderRadius={16}
            padding={spacing.large}
            shadowColor={isDarkMode ? '#3b82f6' : colors.primary}
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.3}
            shadowRadius={8}
            elevation={8}
            onPress={handlePublishing}
            marginHorizontal={0}
            marginBottom={0}
            isDarkMode={isDarkMode}
          >
            <View style={homeStyles.primaryButtonContent}>
              <Text style={homeStyles.primaryButtonIcon}>📤</Text>
              <View style={homeStyles.primaryButtonTextContainer}>
                <Text style={homeStyles.primaryButtonTitle}>Publishing</Text>
                <Text style={homeStyles.primaryButtonSubtitle}>
                  Write and publish your stories to the blockchain
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Secondary Actions */}
        <View style={homeStyles.secondarySection}>
          <Text style={[
            homeStyles.sectionTitle,
            { color: isDarkMode ? '#e5e7eb' : colors.text }
          ]}>
            Explore
          </Text>
          
          <View style={homeStyles.buttonRow}>
            <View style={homeStyles.secondaryButtonContainer}>
              <Card
                backgroundColor={isDarkMode ? '#374151' : colors.backgroundSecondary}
                borderRadius={12}
                padding={spacing.medium}
                borderWidth={1}
                borderColor={isDarkMode ? '#6b7280' : colors.border}
                onPress={() => handlePlaceholderPress('Discover')}
                marginHorizontal={0}
                marginBottom={0}
                isDarkMode={isDarkMode}
              >
                <View style={homeStyles.secondaryButtonContent}>
                  <Text style={homeStyles.secondaryButtonIcon}>🔍</Text>
                  <Text style={[
                    homeStyles.secondaryButtonText,
                    { color: isDarkMode ? '#e5e7eb' : colors.text }
                  ]}>
                    Discover
                  </Text>
                  <Text style={[
                    homeStyles.comingSoon,
                    { color: isDarkMode ? '#9ca3af' : colors.textLight }
                  ]}>
                    Coming Soon
                  </Text>
                </View>
              </Card>
            </View>
            
            <View style={homeStyles.secondaryButtonContainer}>
              <Card
                backgroundColor={isDarkMode ? '#374151' : colors.backgroundSecondary}
                borderRadius={12}
                padding={spacing.medium}
                borderWidth={1}
                borderColor={isDarkMode ? '#6b7280' : colors.border}
                onPress={() => handlePlaceholderPress('Library')}
                marginHorizontal={0}
                marginBottom={0}
                isDarkMode={isDarkMode}
              >
                <View style={homeStyles.secondaryButtonContent}>
                  <Text style={homeStyles.secondaryButtonIcon}>📚</Text>
                  <Text style={[
                    homeStyles.secondaryButtonText,
                    { color: isDarkMode ? '#e5e7eb' : colors.text }
                  ]}>
                    Library
                  </Text>
                  <Text style={[
                    homeStyles.comingSoon,
                    { color: isDarkMode ? '#9ca3af' : colors.textLight }
                  ]}>
                    Coming Soon
                  </Text>
                </View>
              </Card>
            </View>
          </View>
          
          <View style={homeStyles.buttonRow}>
            <View style={homeStyles.secondaryButtonContainer}>
              <Card
                backgroundColor={isDarkMode ? '#374151' : colors.backgroundSecondary}
                borderRadius={12}
                padding={spacing.medium}
                borderWidth={1}
                borderColor={isDarkMode ? '#6b7280' : colors.border}
                onPress={() => handlePlaceholderPress('Community')}
                marginHorizontal={0}
                marginBottom={0}
                isDarkMode={isDarkMode}
              >
                <View style={homeStyles.secondaryButtonContent}>
                  <Text style={homeStyles.secondaryButtonIcon}>👥</Text>
                  <Text style={[
                    homeStyles.secondaryButtonText,
                    { color: isDarkMode ? '#e5e7eb' : colors.text }
                  ]}>
                    Community
                  </Text>
                  <Text style={[
                    homeStyles.comingSoon,
                    { color: isDarkMode ? '#9ca3af' : colors.textLight }
                  ]}>
                    Coming Soon
                  </Text>
                </View>
              </Card>
            </View>
            
            <View style={homeStyles.secondaryButtonContainer}>
              <Card
                backgroundColor={isDarkMode ? '#374151' : colors.backgroundSecondary}
                borderRadius={12}
                padding={spacing.medium}
                borderWidth={1}
                borderColor={isDarkMode ? '#6b7280' : colors.border}
                onPress={() => handlePlaceholderPress('Profile')}
                marginHorizontal={0}
                marginBottom={0}
                isDarkMode={isDarkMode}
              >
                <View style={homeStyles.secondaryButtonContent}>
                  <Text style={homeStyles.secondaryButtonIcon}>👤</Text>
                  <Text style={[
                    homeStyles.secondaryButtonText,
                    { color: isDarkMode ? '#e5e7eb' : colors.text }
                  ]}>
                    Profile
                  </Text>
                  <Text style={[
                    homeStyles.comingSoon,
                    { color: isDarkMode ? '#9ca3af' : colors.textLight }
                  ]}>
                    Coming Soon
                  </Text>
                </View>
              </Card>
            </View>
          </View>
        </View>

        {/* Getting Started Section */}
        <View style={homeStyles.infoSection}>
          <Text style={[
            homeStyles.sectionTitle,
            { color: isDarkMode ? '#e5e7eb' : colors.text }
          ]}>
            Getting Started
          </Text>
          <Card
            backgroundColor={isDarkMode ? '#374151' : colors.backgroundSecondary}
            borderRadius={12}
            padding={spacing.medium}
            borderWidth={1}
            borderColor={isDarkMode ? '#6b7280' : colors.border}
            marginHorizontal={0}
            marginBottom={0}
            isDarkMode={isDarkMode}
          >
            <View style={homeStyles.infoCardContent}>
              <Text style={homeStyles.infoIcon}>📖</Text>
              <Text style={[
                homeStyles.infoText,
                { color: isDarkMode ? '#9ca3af' : colors.textSecondary }
              ]}>
                Story reading and discovery features are coming soon! For now, you can create and publish your own stories using the Publishing feature.
              </Text>
            </View>
          </Card>
        </View>

        {/* Footer */}
        <View style={homeStyles.footer}>
          <Text style={[
            homeStyles.footerText,
            { color: isDarkMode ? '#9ca3af' : colors.textLight }
          ]}>
            Secure • Decentralized • Permanent
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

// Character count: 7124