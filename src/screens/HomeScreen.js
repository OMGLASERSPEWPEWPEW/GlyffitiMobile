// src/screens/HomeScreen.js
// Path: src/screens/HomeScreen.js

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Dimensions,
  Animated,
  Alert
} from 'react-native';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { ErrorDisplay, RetryButton, ErrorBoundary } from '../components/shared';
import { SocialFeed } from '../components/feed/SocialFeed';
import { TopBar } from '../components/navigation/TopBar';
import { BottomBar } from '../components/navigation/BottomBar';
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
  const [topBarVisible, setTopBarVisible] = useState(true);
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [showUserSelectorPanel, setShowUserSelectorPanel] = useState(false);
  const [feedKey, setFeedKey] = useState(0);

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
      
      // Load Alice user from registry
      const aliceData = {
        username: "alice",
        publicKey: "7mtV5uLWCS81RnTXzRXZapjvskAXEFsm7HLa7gAyG4rd",
        transactionHash: "4htDXYW1mVL8FN96HAEn3o9U7dN6vssvoYMSNUjz9rkTaQJAMb4pXn3C5a2ezALC8Dy5y5v852KM34yZCbP275b3",
        parentGenesis: "3gR3czdawhptXjPhzbMDtys9S6UYDE7XQNFEA1T1nqPcRYKpmCBL7Dw8ew43KCHjtFmHPEzUQuB7LJcYT8Tc9oYL",
        createdAt: "2025-08-06T21:27:52.155Z",
        explorer: "https://explorer.solana.com/tx/4htDXYW1mVL8FN96HAEn3o9U7dN6vssvoYMSNUjz9rkTaQJAMb4pXn3C5a2ezALC8Dy5y5v852KM34yZCbP275b3?cluster=devnet"
      };
      
      console.log('🔵 Setting Alice as selected user...');
      setSelectedUser(aliceData);
      
      // Load user data from blockchain
      const userData = await userTransactionReader.fetchUserDataFromTransaction(
        aliceData.transactionHash
      );
      
      if (userData) {
        setSelectedUserData(userData);
        console.log('✅ Alice user data loaded:', userData);
      }
      
      // Load wallet balance
      const balance = await connection.getBalance(new PublicKey(aliceData.publicKey));
      const balanceSOL = balance / LAMPORTS_PER_SOL;
      setUserWalletBalance(balanceSOL);
      
      console.log('💰 Alice balance loaded:', balanceSOL.toFixed(4), 'SOL');
      console.log('✅ Default user setup complete');
      
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

  const handlePostCreate = async (postData) => {
    console.log('Post created:', postData);
    try {
      // Handle post creation logic here
      // Refresh user balance after post creation
      if (postData.shouldRefreshBalance && selectedUser) {
        await refreshUserBalance(selectedUser);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleClearSocialPosts = async () => {
  Alert.alert(
    'Reset Social Feed',
    'This will reset all user feed head pointers back to genesis, clearing social feeds while preserving user accounts. This action cannot be undone.\n\nAre you sure you want to continue?',
    [
      {
        text: 'Cancel',
        style: 'cancel'
      },
      {
        text: 'Reset Feed',
        style: 'destructive',
        onPress: async () => {
          try {
            console.log('🔄 Starting to reset all social feed head pointers...');
            
            const success = await PostHeaderService.resetAllUserHeads();
            
            if (success) {
              // Force the SocialFeed to refresh by clearing its cache
              setFeedKey(prev => prev + 1);
              
              Alert.alert(
                'Success',
                'All social feed head pointers have been reset to genesis. User accounts are preserved but feeds will start fresh.',
                [{ text: 'OK' }]
              );
              console.log('✅ Social feed head pointers reset successfully');
            } else {
              Alert.alert('Error', 'Failed to reset social feed head pointers. Please try again.');
            }
          } catch (error) {
            console.error('❌ Error resetting social feed head pointers:', error);
            Alert.alert('Error', 'An unexpected error occurred while resetting social feed head pointers.');
          }
        }
      }
    ],
    { cancelable: true }
  );
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
        // Keep this navigation for long-form content publishing
        navigation.navigate('Publishing');
        break;
      case 'clear':
      // Reset social feed head pointers back to genesis (preserves users)
        handleClearSocialPosts();
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

  // Calculate bottom bar height for padding
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

        {/* Social Feed */}
        <SocialFeed
          key={feedKey}
          isDarkMode={isDarkMode}
          maxPosts={50}  
          postsPerUser={10}  
          onPostPress={(post) => {
            console.log('Post pressed:', post.author);
            // TODO: Navigate to post detail screen
          }}
          onAuthorPress={(author, publicKey) => {
            console.log('Author pressed:', author);
            // TODO: Navigate to user profile screen
          }}
          onTopBarVisibilityChange={handleTopBarVisibilityChange}  
          style={{ 
            flex: 1,  // ✅ Take up all available space
            paddingBottom: BOTTOM_BAR_HEIGHT + spacing.small  
          }}
        />

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

// Character count: 8,876