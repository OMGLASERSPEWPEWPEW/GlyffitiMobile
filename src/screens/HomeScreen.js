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
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { Card, ErrorDisplay, RetryButton, ErrorBoundary } from '../components/shared';
import { UserSelector } from '../components/UserSelector';
import { PostComposer } from '../components/PostComposer';
import { SocialFeed } from '../components/feed/SocialFeed'
import { homeStyles } from '../styles/homeStyles';
import { colors, spacing } from '../styles/tokens';
import { PostHeaderService } from '../services/feed/PostHeaderService'


const { width } = Dimensions.get('window');

export const HomeScreen = ({ navigation, isDarkMode = false }) => {
  const [cachedStories, setCachedStories] = useState([]);
  const [cacheStats, setCacheStats] = useState(null);
  const [loadingError, setLoadingError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserData, setSelectedUserData] = useState(null);
  const [userWalletBalance, setUserWalletBalance] = useState(0);
  const [showFeed, setShowFeed] = useState(false);

  // ✅ ADD: Solana connection for balance updates
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  useEffect(() => {
    // loadCacheData();
  }, []);

  // Updated loadCacheData function with proper error handling
  const loadCacheData = async () => {
    try {
      setLoadingError(null); // Clear any previous errors
      // const cached = await storyCache.getAllCachedManifests();
      // const stats = await storyCache.getCacheStats();
      // setCachedStories(cached.slice(0, 3)); // Show first 3 for preview
      // setCacheStats(stats);
      console.log('Cache data loaded successfully');
    } catch (error) {
      console.error('Error loading cache data:', error);
      setLoadingError({
        type: 'general',
        message: 'Failed to load cached stories. Please try again.'
      });
    }
  };

  // ✅ ADD: Function to refresh user wallet balance
  const loadUserWalletBalance = async (user) => {
    if (!user || !user.publicKey) {
      console.warn('⚠️ Cannot load balance - no user or publicKey');
      return;
    }

    try {
      console.log('💰 Refreshing balance for wallet:', user.publicKey);
      
      // ✅ FIX: Convert string publicKey to PublicKey object
      const publicKeyObj = new PublicKey(user.publicKey);
      const balance = await connection.getBalance(publicKeyObj);
      const balanceSOL = balance / LAMPORTS_PER_SOL;
      
      console.log('💰 Updated balance:', balanceSOL.toFixed(4), 'SOL');
      
      // Update the displayed balance
      setUserWalletBalance(balanceSOL);
      
      return balanceSOL;
    } catch (error) {
      console.error('❌ Error loading wallet balance:', error);
      throw error;
    }
  };

  const handlePublishing = () => {
    navigation?.navigate('Publishing');
  };

  const handlePostCreate = async (result) => {
    if (result.success) {
      console.log('✅ Post created successfully:', result);
      
      // Handle balance refresh if needed
      if (result.shouldRefreshBalance && selectedUser) {
        console.log('💰 Refreshing user balance for:', selectedUser.username);
        try {
          // ✅ FIX: Now this function exists!
          await loadUserWalletBalance(selectedUser);
          console.log('✅ Balance refreshed successfully');
        } catch (error) {
          console.error('❌ Failed to refresh balance:', error);
        }
      }
    } else {
      console.error('❌ Post creation failed:', result.error);
    }
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
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('HomeScreen error:', error);
        setLoadingError({
          type: 'general',
          message: 'An unexpected error occurred on the home screen.'
        });
      }}
      onRetry={() => {
        setLoadingError(null);
        loadCacheData();
      }}
      onFallbackPress={() => navigation?.goBack?.()}
    >
      <SafeAreaView style={[
        homeStyles.container,
        { backgroundColor: isDarkMode ? '#111827' : colors.background }
      ]}>
        <ScrollView
          style={homeStyles.scrollView}
          contentContainerStyle={homeStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={homeStyles.header}>
            <Text style={[
              homeStyles.title,
              { color: isDarkMode ? '#e5e7eb' : colors.text }
            ]}>
              Glyffiti
            </Text>
            <Text style={[
              homeStyles.subtitle,
              { color: isDarkMode ? '#9ca3af' : colors.textSecondary }
            ]}>
              Blockchain Social Network
            </Text>
          </View>

          {/* User Selector Section */}
          <View style={homeStyles.userSection}>
            <Text style={[
              homeStyles.sectionTitle,
              { color: isDarkMode ? '#e5e7eb' : colors.text }
            ]}>
              Active User
            </Text>
            <UserSelector 
              isDarkMode={isDarkMode}
              selectedUser={selectedUser}
              onUserSelect={(user, userData, balance) => {
                setSelectedUser(user)
                setSelectedUserData(userData)
                setUserWalletBalance(balance)
              }} />
          </View>


           {/* Post Creation */}
          <PostComposer
            selectedUser={selectedUser}
            selectedUserData={selectedUserData}
            userWalletBalance={userWalletBalance}
            isDarkMode={isDarkMode}
            onPostCreate={handlePostCreate}
          />

          {/* Social Feed */}
            {showFeed && (
              <SocialFeed
                isDarkMode={isDarkMode}
                maxPosts={20}
                postsPerUser={3}
                onPostPress={(post) => {
                  console.log('Post pressed:', post.author);
                }}
                onAuthorPress={(author, publicKey) => {
                  console.log('Author pressed:', author);
                }}
              />
            )}

          {/* Main Content */}
          <View style={homeStyles.mainContent}>
            {/* Feed Button */}
              <Card
                onPress={() => setShowFeed(!showFeed)}
                backgroundColor={showFeed ? colors.primary : (isDarkMode ? '#374151' : colors.backgroundSecondary)}
                borderRadius={16}
                padding={spacing.large}
                marginHorizontal={0}
                marginBottom={spacing.medium}
                isDarkMode={isDarkMode}
              >
                <View style={homeStyles.publishingCard}>
                  <Text style={homeStyles.publishingIcon}>📰</Text>
                  <View style={homeStyles.publishingContent}>
                    <Text style={homeStyles.publishingTitle}>
                      {showFeed ? 'Hide Feed' : 'Social Feed'}
                    </Text>
                    <Text style={homeStyles.publishingDescription}>
                      {showFeed ? 'Close the social feed' : 'View posts from all users'}
                    </Text>
                  </View>
                  <Text style={homeStyles.arrow}>{showFeed ? '▼' : '→'}</Text>
                </View>
              </Card>
            {/* Publishing Card */}
            <Card
              onPress={handlePublishing}
              backgroundColor={colors.primary}
              borderRadius={16}
              padding={spacing.large}
              marginHorizontal={0}
              marginBottom={spacing.medium}
              isDarkMode={isDarkMode}
            >
              <View style={homeStyles.publishingCard}>
                <Text style={homeStyles.publishingIcon}>✍️</Text>
                <View style={homeStyles.publishingContent}>
                  <Text style={homeStyles.publishingTitle}>
                    Start Publishing
                  </Text>
                  <Text style={homeStyles.publishingDescription}>
                    Create and share your stories on the blockchain
                  </Text>
                </View>
                <Text style={homeStyles.arrow}>→</Text>
              </View>
            </Card>

            {/* Feature Grid */}
            <Text style={[
              homeStyles.sectionTitle,
              { color: isDarkMode ? '#e5e7eb' : colors.text }
            ]}>
              Features
            </Text>
            <View style={homeStyles.featureGrid}>
              {/* Library Card */}
              <View style={homeStyles.featureItem}>
                <Card
                  onPress={() => handlePlaceholderPress('Library')}
                  backgroundColor={isDarkMode ? '#374151' : colors.backgroundSecondary}
                  borderRadius={12}
                  padding={spacing.medium}
                  borderWidth={1}
                  borderColor={isDarkMode ? '#6b7280' : colors.border}
                  marginHorizontal={0}
                  marginBottom={0}
                  isDarkMode={isDarkMode}
                >
                  <View style={homeStyles.featureContent}>
                    <Text style={homeStyles.featureIcon}>📚</Text>
                    <Text style={[
                      homeStyles.featureTitle,
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

              {/* Discover Card */}
              <View style={homeStyles.featureItem}>
                <Card
                  onPress={() => handlePlaceholderPress('Discover')}
                  backgroundColor={isDarkMode ? '#374151' : colors.backgroundSecondary}
                  borderRadius={12}
                  padding={spacing.medium}
                  borderWidth={1}
                  borderColor={isDarkMode ? '#6b7280' : colors.border}
                  marginHorizontal={0}
                  marginBottom={0}
                  isDarkMode={isDarkMode}
                >
                  <View style={homeStyles.featureContent}>
                    <Text style={homeStyles.featureIcon}>🔍</Text>
                    <Text style={[
                      homeStyles.featureTitle,
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

              {/* Network Card */}
              <View style={homeStyles.featureItem}>
                <Card
                  onPress={() => handlePlaceholderPress('Network')}
                  backgroundColor={isDarkMode ? '#374151' : colors.backgroundSecondary}
                  borderRadius={12}
                  padding={spacing.medium}
                  borderWidth={1}
                  borderColor={isDarkMode ? '#6b7280' : colors.border}
                  marginHorizontal={0}
                  marginBottom={0}
                  isDarkMode={isDarkMode}
                >
                  <View style={homeStyles.featureContent}>
                    <Text style={homeStyles.featureIcon}>🌐</Text>
                    <Text style={[
                      homeStyles.featureTitle,
                      { color: isDarkMode ? '#e5e7eb' : colors.text }
                    ]}>
                      Network
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

              {/* Profile Card */}
              <View style={homeStyles.featureItem}>
                <Card
                  onPress={() => handlePlaceholderPress('Profile')}
                  backgroundColor={isDarkMode ? '#374151' : colors.backgroundSecondary}
                  borderRadius={12}
                  padding={spacing.medium}
                  borderWidth={1}
                  borderColor={isDarkMode ? '#6b7280' : colors.border}
                  marginHorizontal={0}
                  marginBottom={0}
                  isDarkMode={isDarkMode}
                >
                  <View style={homeStyles.featureContent}>
                    <Text style={homeStyles.featureIcon}>👤</Text>
                    <Text style={[
                      homeStyles.featureTitle,
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
    </ErrorBoundary>
  );
};

export default HomeScreen;

// Character count: 9013