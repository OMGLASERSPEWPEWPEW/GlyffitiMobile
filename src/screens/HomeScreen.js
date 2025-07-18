// src/screens/HomeScreen.js  
// Path: src/screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions
} from 'react-native';
import { homeStyles } from '../styles/homeStyles';
// Temporarily comment out story cache until we fix the dependencies
// import { storyCache } from '../services/story/StoryCache';

const { width } = Dimensions.get('window');

export const HomeScreen = ({ navigation }) => {
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
    <SafeAreaView style={homeStyles.container}>
      <ScrollView 
        contentContainerStyle={homeStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={homeStyles.header}>
          <Text style={homeStyles.appTitle}>Glyffiti</Text>
          <Text style={homeStyles.tagline}>Decentralized storytelling on Solana</Text>
        </View>

        {/* Main Action Section */}
        <View style={homeStyles.mainSection}>
          <Text style={homeStyles.sectionTitle}>What would you like to do?</Text>
          
          {/* Publishing Button - Main Feature */}
          <TouchableOpacity 
            style={homeStyles.primaryButton}
            onPress={handlePublishing}
            activeOpacity={0.7}
          >
            <Text style={homeStyles.primaryButtonIcon}>📤</Text>
            <View style={homeStyles.primaryButtonContent}>
              <Text style={homeStyles.primaryButtonTitle}>Publishing</Text>
              <Text style={homeStyles.primaryButtonSubtitle}>
                Write and publish your stories to the blockchain
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Secondary Actions */}
        <View style={homeStyles.secondarySection}>
          <Text style={homeStyles.sectionTitle}>Explore</Text>
          
          <View style={homeStyles.buttonRow}>
            <TouchableOpacity 
              style={homeStyles.secondaryButton}
              onPress={() => handlePlaceholderPress('Discover')}
              activeOpacity={0.7}
            >
              <Text style={homeStyles.secondaryButtonIcon}>🔍</Text>
              <Text style={homeStyles.secondaryButtonText}>Discover</Text>
              <Text style={homeStyles.comingSoon}>Coming Soon</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={homeStyles.secondaryButton}
              onPress={() => handlePlaceholderPress('Library')}
              activeOpacity={0.7}
            >
              <Text style={homeStyles.secondaryButtonIcon}>📚</Text>
              <Text style={homeStyles.secondaryButtonText}>Library</Text>
              <Text style={homeStyles.comingSoon}>Coming Soon</Text>
            </TouchableOpacity>
          </View>
          
          <View style={homeStyles.buttonRow}>
            <TouchableOpacity 
              style={homeStyles.secondaryButton}
              onPress={() => handlePlaceholderPress('Community')}
              activeOpacity={0.7}
            >
              <Text style={homeStyles.secondaryButtonIcon}>👥</Text>
              <Text style={homeStyles.secondaryButtonText}>Community</Text>
              <Text style={homeStyles.comingSoon}>Coming Soon</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={homeStyles.secondaryButton}
              onPress={() => handlePlaceholderPress('Profile')}
              activeOpacity={0.7}
            >
              <Text style={homeStyles.secondaryButtonIcon}>👤</Text>
              <Text style={homeStyles.secondaryButtonText}>Profile</Text>
              <Text style={homeStyles.comingSoon}>Coming Soon</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Getting Started Section */}
        <View style={homeStyles.infoSection}>
          <Text style={homeStyles.sectionTitle}>Getting Started</Text>
          <View style={homeStyles.infoCard}>
            <Text style={homeStyles.infoIcon}>📖</Text>
            <Text style={homeStyles.infoText}>
              Story reading and discovery features are coming soon! For now, you can create and publish your own stories using the Publishing feature.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={homeStyles.footer}>
          <Text style={homeStyles.footerText}>
            Secure • Decentralized • Permanent
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

// 1,753 characters