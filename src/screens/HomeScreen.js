// src/screens/HomeScreen.js
// Path: src/screens/HomeScreen.js

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Dimensions,
  Animated
} from 'react-native';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { Card, ErrorDisplay, RetryButton, ErrorBoundary } from '../components/shared';
import { PostComposer } from '../components/PostComposer';
import { SocialFeed } from '../components/feed/SocialFeed';
import { TopBar } from '../components/navigation/TopBar';
import { BottomBar } from '../components/navigation/BottomBar';
import { AnimatedScrollView } from '../components/navigation/AnimatedScrollView';
import { UserPanel, UserSelectorPanel } from '../components/panels';
import { homeStyles } from '../styles/homeStyles';
import { colors, spacing } from '../styles/tokens';
import { PostHeaderService } from '../services/feed/PostHeaderService';
import { userTransactionReader } from '../services/blockchain/UserTransactionReader';

const { width } = Dimensions.get('window');

export const HomeScreen = ({ navigation, isDarkMode = false }) => {
  const [cachedStories, setCachedStories] = useState([]);
  const [cacheStats, setCacheStats] = useState(null);
  const [loadingError, setLoadingError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserData, setSelectedUserData] = useState(null);
  const [userWalletBalance, setUserWalletBalance] = useState(0);
  const [showFeed, setShowFeed] = useState(false);
  const [topBarVisible, setTopBarVisible] = useState(true);
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [showUserSelectorPanel, setShowUserSelectorPanel] = useState(false);

  // Animated value for top bar
  const topBarAnimation = useRef(new Animated.Value(1)).current;

  // Solana connection for balance updates
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  useEffect(() => {
    // loadCacheData();
    console.log('🚀 HomeScreen mounted, loading default user...');
    
    // Add a small delay to ensure all imports are fully loaded
    const timer = setTimeout(() => {
      loadDefaultUser();
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  // Load Alice as the default user on app start
  const loadDefaultUser = async () => {
    try {
      console.log('🔄 Loading default user (Alice)...');
      
      // Wait a bit to ensure all imports are ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Test imports first
      console.log('🧪 Testing imports...');
      console.log('- userTransactionReader:', !!userTransactionReader);
      console.log('- Connection:', !!connection);
      console.log('- PublicKey:', !!PublicKey);
      console.log('- LAMPORTS_PER_SOL:', LAMPORTS_PER_SOL);
      
      // Import user registry data with error handling
      let userRegistry;
      try {
        userRegistry = require('../data/user-registry.json');
        console.log('📋 Registry loaded successfully');
      } catch (importError) {
        console.error('❌ Failed to import user registry:', importError);
        return;
      }
      
      console.log('📋 Users found:', userRegistry.users?.length);
      
      if (!userRegistry.users || userRegistry.users.length === 0) {
        console.error('❌ No users in registry');
        return;
      }
      
      // Find Alice in the user registry  
      const alice = userRegistry.users.find(user => 
        user.username?.toLowerCase() === 'alice'
      );
      
      if (!alice) {
        console.error('❌ Alice not found in user registry');
        console.log('Available users:', userRegistry.users.map(u => u.username));
        return;
      }
      
      console.log('👤 Found Alice in registry:', alice.username);
      console.log('🔑 Alice public key:', alice.publicKey);
      console.log('📝 Alice transaction:', alice.transactionHash);
      
      // Test connection first
      try {
        const version = await connection.getVersion();
        console.log('✅ Connection test successful:', version);
      } catch (connError) {
        console.error('❌ Connection test failed:', connError);
        return;
      }
      
      // Fetch Alice's data from blockchain
      console.log('🔍 Fetching Alice blockchain data...');
      const userData = await userTransactionReader.fetchUserDataFromTransaction(
        alice.transactionHash
      );
      
      if (!userData) {
        console.error('❌ Failed to load Alice data from blockchain');
        return;
      }
      
      console.log('✅ Alice blockchain data loaded:', userData);
      
      // Load Alice's wallet balance
      console.log('💰 Loading Alice balance...');
      const freshBalance = await connection.getBalance(new PublicKey(alice.publicKey));
      const freshBalanceSOL = freshBalance / LAMPORTS_PER_SOL;
      console.log('💰 Alice balance:', freshBalanceSOL, 'SOL');
      
      // Set Alice as the selected user
      setSelectedUser(alice);
      setSelectedUserData(userData);
      setUserWalletBalance(freshBalanceSOL);
      
      console.log('✅ Alice set as default user successfully!');
      
    } catch (error) {
      console.error('❌ Error loading default user:', error);
      console.log('Error details:', error.message);
      console.log('Error stack:', error.stack);
    }
  };

  // Animate top bar visibility
  useEffect(() => {
    Animated.timing(topBarAnimation, {
      toValue: topBarVisible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [topBarVisible]);

  const loadCacheData = async () => {
    try {
      setLoadingError(null);
      console.log('Cache data loaded successfully');
    } catch (error) {
      console.error('Error loading cache data:', error);
      setLoadingError({
        type: 'general',
        message: 'Failed to load cached stories. Please try again.'
      });
    }
  };

  const handleRetry = () => {
    setLoadingError(null);
    loadCacheData();
  };

  const handlePublishing = () => {
    console.log('Opening publishing screen...');
    navigation.navigate('Publishing');
  };

  const handlePostCreate = async (postData) => {
    console.log('Post created:', postData);
    try {
      // Handle post creation logic here
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLogoPress = () => {
    console.log('Glyffiti logo pressed - opening compose modal');
    navigation.navigate('ComposeModal', {
      selectedUser,
      selectedUserData,
      userWalletBalance,
      onPostCreate: handlePostCreate
    });
  };

  const handleLongPressMenu = (action) => {
    console.log('Long press menu action:', action);
    
    switch (action) {
      case 'post':
        navigation.navigate('ComposeModal', {
          selectedUser,
          selectedUserData,
          userWalletBalance,
          onPostCreate: handlePostCreate
        });
        break;
      case 'publish':
        navigation.navigate('Publishing');
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const handleTopBarVisibilityChange = (visible) => {
    setTopBarVisible(visible);
  };

  const handleUserTap = () => {
    console.log('User avatar tapped - showing user panel');
    setShowUserPanel(true);
  };

  const handleUserLongPress = () => {
    console.log('User avatar long pressed - showing user selector');
    setShowUserSelectorPanel(true);
  };

  const handleUserSelect = (user, userData, balance) => {
    console.log('User selected:', user.username);
    setSelectedUser(user);
    setSelectedUserData(userData);
    setUserWalletBalance(balance);
  };

  const handleCloseUserPanel = () => {
    setShowUserPanel(false);
  };

  const handleCloseUserSelectorPanel = () => {
    setShowUserSelectorPanel(false);
  };

  // Function to refresh a user's balance
  const refreshUserBalance = async (user) => {
    if (!user || !user.publicKey) {
      console.warn('⚠️ Cannot refresh balance - no user or publicKey');
      return;
    }

    try {
      console.log('💰 Refreshing balance for:', user.username);
      const balance = await connection.getBalance(new PublicKey(user.publicKey));
      const balanceSOL = balance / LAMPORTS_PER_SOL;
      
      console.log('💰 Updated balance:', balanceSOL.toFixed(4), 'SOL');
      
      // Update the state if this is the currently selected user
      if (selectedUser && selectedUser.publicKey === user.publicKey) {
        setUserWalletBalance(balanceSOL);
      }
      
      return balanceSOL;
    } catch (error) {
      console.error('❌ Error refreshing balance:', error);
      throw error;
    }
  };

  // Calculate bottom bar height for padding (now with overflowing logo)
  const BOTTOM_BAR_HEIGHT = 80;

  if (loadingError) {
    return (
      <ErrorBoundary>
        <SafeAreaView style={[
          homeStyles.container,
          { backgroundColor: isDarkMode ? '#111827' : colors.background }
        ]}>
          <TopBar 
            title="Glyffiti"
            subtitle="Blockchain Social Network"
            selectedUser={selectedUser}
            onUserTap={handleUserTap}
            onUserLongPress={handleUserLongPress}
            isDarkMode={isDarkMode}
          />
          <View style={{ flex: 1, justifyContent: 'center', padding: spacing.large }}>
            <ErrorDisplay
              type={loadingError.type}
              title="Unable to Load Content"
              message={loadingError.message}
              onRetry={handleRetry}
              isDarkMode={isDarkMode}
            />
          </View>
          <BottomBar 
            onLogoPress={handleLogoPress}
            onLongPressMenu={handleLongPressMenu}
            isDarkMode={isDarkMode}
          />
        </SafeAreaView>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('HomeScreen error boundary caught:', error);
        console.error('Error info:', errorInfo);
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
        {/* Animated Top Bar */}
        <Animated.View style={{
          transform: [{ translateY: topBarAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [-100, 0],
          })}],
          opacity: topBarAnimation,
        }}>
          <TopBar 
            title="Glyffiti"
            selectedUser={selectedUser}
            onUserTap={handleUserTap}
            onUserLongPress={handleUserLongPress}
            isDarkMode={isDarkMode}
          />
        </Animated.View>

        {/* Main Content with Animated Scroll */}
        <AnimatedScrollView
          style={homeStyles.scrollView}
          contentContainerStyle={[
            homeStyles.scrollContent,
            { paddingBottom: BOTTOM_BAR_HEIGHT + spacing.large }
          ]}
          onTopBarVisibilityChange={handleTopBarVisibilityChange}
        >
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
          </View>
        </AnimatedScrollView>

        {/* Sticky Bottom Bar */}
        <BottomBar 
          onLogoPress={handleLogoPress}
          onLongPressMenu={handleLongPressMenu}
          isDarkMode={isDarkMode}
        />

        {/* User Panels */}
        <UserPanel
          visible={showUserPanel}
          selectedUser={selectedUser}
          selectedUserData={selectedUserData}
          userWalletBalance={userWalletBalance}
          onClose={handleCloseUserPanel}
          onUserBalanceUpdate={refreshUserBalance}
          isDarkMode={isDarkMode}
        />

        <UserSelectorPanel
          visible={showUserSelectorPanel}
          selectedUser={selectedUser}
          onUserSelect={handleUserSelect}
          onClose={handleCloseUserSelectorPanel}
          isDarkMode={isDarkMode}
        />
      </SafeAreaView>
    </ErrorBoundary>
  );
};

export default HomeScreen;

// Character count: 10919