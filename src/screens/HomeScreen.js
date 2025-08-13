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
import { ErrorDisplay, RetryButton, ErrorBoundary, ScreenContainer, ContentArea } from '../components/shared';
import { SocialFeed } from '../components/feed/SocialFeed';
import { TopBar } from '../components/navigation/TopBar';
import { BottomBar } from '../components/navigation/BottomBar';
import { UserPanel, UserSelectorPanel } from '../components/panels';
import { homeStyles } from '../styles/homeStyles';
import { colors, spacing } from '../styles/tokens';
import { PostHeaderService } from '../services/feed/PostHeaderService';
import { userTransactionReader } from '../services/blockchain/UserTransactionReader';
import { useUser } from '../hooks/useUser';

const { width } = Dimensions.get('window');

export const HomeScreen = ({ navigation, isDarkMode = false }) => {
  const [cachedStories, setCachedStories] = useState([]);
  const [cacheStats, setCacheStats] = useState(null);
  const [loadingError, setLoadingError] = useState(null);
  const [topBarVisible, setTopBarVisible] = useState(true);
  const [feedKey, setFeedKey] = useState(0);


  // User management via shared context
  const {
    selectedUser,
    selectedUserData,
    userWalletBalance,
    showUserPanel,
    showUserSelectorPanel,
    handleUserTap,
    handleUserLongPress,
    handleUserSelect,
    handleCloseUserPanel,
    handleCloseUserSelectorPanel,
    refreshUserBalance
  } = useUser();
  
  const topBarAnimation = useRef(new Animated.Value(1)).current;

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
        navigation.navigate('Publishing', {
          selectedUser,
          selectedUserData,
          userWalletBalance
        });
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

  // Calculate bottom bar height for padding
  const BOTTOM_BAR_HEIGHT = 80;

  if (loadingError) {
    return (
      <ErrorBoundary>
        <ScreenContainer isDarkMode={isDarkMode} variant="screenSafe">
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
            onHomePress={() => {
              // Already on home - could scroll to top or do nothing
              console.log('Already on home screen');
            }}
            isDarkMode={isDarkMode}
          />
        </ScreenContainer>
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
      <ScreenContainer isDarkMode={isDarkMode} variant="screenSafe">
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
        <ContentArea 
          variant="feed" 
          isDarkMode={isDarkMode}
          withBottomBarPadding={true}
        >
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
        </ContentArea>

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
      </ScreenContainer>
    </ErrorBoundary>
  );
};

export default HomeScreen;

// Character count: 8,876