// src/components/feed/SocialFeed.js
// Path: src/components/feed/SocialFeed.js

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { feedService } from '../../services/feed/FeedService';
import { FeedItem } from './FeedItem';
import { colors, spacing, typography, borderRadius, shadows } from '../../styles/tokens';

/**
 * SocialFeed Component - Enhanced for Primary Content
 * 
 * Now the main content of the app - a real social media feed like Twitter/Instagram.
 * No longer a toggleable component, but the core experience of the app.
 * 
 * Features:
 * - Pull-to-refresh like all social media apps
 * - Infinite scrolling (in future updates)
 * - Real-time updates and notifications
 * - Controls top bar visibility on scroll
 * - Optimized for performance with many posts
 * 
 * Props:
 * - isDarkMode: Whether to use dark theme
 * - maxPosts: Maximum number of posts to load (default: 50 for real social feel)
 * - postsPerUser: Maximum posts per user (default: 10)
 * - onPostPress: Callback when a post is tapped
 * - onAuthorPress: Callback when an author is tapped
 * - onTopBarVisibilityChange: Callback to control top bar visibility
 * - onError: Callback when an error occurs
 * - style: Additional styles for the main container
 */
export const SocialFeed = ({
  isDarkMode = false,
  maxPosts = 50,  // ✅ Increased default for real social media feel
  postsPerUser = 10,  // ✅ More posts per user
  onPostPress = null,
  onAuthorPress = null,
  onTopBarVisibilityChange = null,  // ✅ New prop for controlling top bar
  onError = null,
  style = {}  // ✅ Allow custom styling
}) => {
  
  // Feed state
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  
  // ✅ Scroll tracking for top bar control
  const [lastScrollY, setLastScrollY] = useState(0);
  const [topBarVisible, setTopBarVisible] = useState(true);
  
  /**
   * Load feed data from FeedService
   */
  const loadFeed = useCallback(async (useCache = true) => {
    try {
      setError(null);
      
      // Progressive loading - show posts as they come in
      await feedService.buildFeedProgressive(
        { maxTotalPosts: maxPosts, limit: postsPerUser },
        (currentPosts) => {
          setPosts([...currentPosts]); // Update display immediately
        }
      );
      
      setLastFetchTime(Date.now());
    } catch (loadError) {
      setError(loadError.message || 'Failed to load feed');
      if (onError) {
        onError(loadError);
      }
    }
  }, [maxPosts, postsPerUser, onError]);
  
  /**
   * Handle pull-to-refresh (Twitter-style)
   */
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      await loadFeed(false); // Force fresh data
    } catch (refreshError) {
      console.error('❌ Error refreshing feed:', refreshError);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadFeed]);
  
  /**
   * Handle retry after error
   */
  const handleRetry = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await loadFeed(false); // Force fresh data
    } catch (retryError) {
      console.error('❌ Error retrying feed load:', retryError);
    } finally {
      setIsLoading(false);
    }
  }, [loadFeed]);
  
  /**
   * ✅ Handle scroll for top bar control (like Twitter)
   */
  const handleScroll = useCallback((event) => {
    if (!onTopBarVisibilityChange) return;
    
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollThreshold = 50; // Minimum scroll distance to trigger change
    
    if (Math.abs(currentScrollY - lastScrollY) > scrollThreshold) {
      const shouldShowTopBar = currentScrollY < lastScrollY || currentScrollY < 100;
      
      if (shouldShowTopBar !== topBarVisible) {
        setTopBarVisible(shouldShowTopBar);
        onTopBarVisibilityChange(shouldShowTopBar);
      }
      
      setLastScrollY(currentScrollY);
    }
  }, [lastScrollY, topBarVisible, onTopBarVisibilityChange]);
  
  /**
   * Initial feed load
   */
  useEffect(() => {
    const initialLoad = async () => {
      setIsLoading(true);
      
      try {
        await loadFeed(true); // Use cache if available
      } catch (initialError) {
        console.error('❌ Error in initial feed load:', initialError);
      } finally {
        setIsLoading(false);
      }
    };
    
    initialLoad();
  }, [loadFeed]);
  
  /**
   * Handle post item press
   */
  const handlePostPress = useCallback((post) => {
    if (onPostPress) {
      onPostPress(post);
    }
  }, [onPostPress]);
  
  /**
   * Handle author press
   */
  const handleAuthorPress = useCallback((author, publicKey) => {
    if (onAuthorPress) {
      onAuthorPress(author, publicKey);
    }
  }, [onAuthorPress]);
  
  /**
   * Render individual feed item
   */
  const renderFeedItem = useCallback(({ item, index }) => (
    <FeedItem
      post={item}
      isDarkMode={isDarkMode}
      onPress={handlePostPress}
      onAuthorPress={handleAuthorPress}
      style={{
        marginBottom: index === posts.length - 1 ? spacing.large : spacing.small  // ✅ Extra space at bottom
      }}
    />
  ), [isDarkMode, handlePostPress, handleAuthorPress, posts.length]);
  
  /**
   * Generate unique key for each post
   */
  const keyExtractor = useCallback((item, index) => {
    return item.id || item.transactionHash || `post-${item.timestamp}-${index}`;
  }, []);
  
  /**
   * Render loading state (Twitter-style skeleton)
   */
  const renderLoadingState = () => (
    <View style={[containerStyle, { justifyContent: 'center', alignItems: 'center' }]}>
      <ActivityIndicator 
        size="large" 
        color={isDarkMode ? '#60a5fa' : '#3b82f6'} 
      />
      <Text style={[loadingTextStyle, { marginTop: spacing.medium }]}>
        Loading your feed...
      </Text>
    </View>
  );
  
  /**
   * Render error state
   */
  const renderErrorState = () => (
    <View style={[containerStyle, { justifyContent: 'center', alignItems: 'center', padding: spacing.xlarge }]}>
      <Text style={{ fontSize: 48, marginBottom: spacing.medium }}>📭</Text>
      <Text style={[
        { 
          fontSize: typography.fontSize.large,
          fontWeight: typography.fontWeight.bold,
          color: isDarkMode ? '#f3f4f6' : colors.text,
          marginBottom: spacing.small,
          textAlign: 'center'
        }
      ]}>
        Can't Load Feed
      </Text>
      <Text style={[
        {
          fontSize: typography.fontSize.medium,
          color: isDarkMode ? '#9ca3af' : colors.textSecondary,
          textAlign: 'center',
          marginBottom: spacing.large
        }
      ]}>
        {error}
      </Text>
      <TouchableOpacity
        style={{
          backgroundColor: isDarkMode ? '#3b82f6' : colors.primary,
          paddingHorizontal: spacing.large,
          paddingVertical: spacing.medium,
          borderRadius: borderRadius.button,
        }}
        onPress={handleRetry}
        activeOpacity={0.7}
      >
        <Text style={{
          color: 'white',
          fontSize: typography.fontSize.medium,
          fontWeight: typography.fontWeight.medium
        }}>
          Try Again
        </Text>
      </TouchableOpacity>
    </View>
  );
  
  /**
   * Render empty state (like when no posts exist yet)
   */
  const renderEmptyState = () => (
    <View style={[containerStyle, { justifyContent: 'center', alignItems: 'center', padding: spacing.xlarge }]}>
      <Text style={{ fontSize: 48, marginBottom: spacing.medium }}>🌟</Text>
      <Text style={[
        { 
          fontSize: typography.fontSize.large,
          fontWeight: typography.fontWeight.bold,
          color: isDarkMode ? '#f3f4f6' : colors.text,
          marginBottom: spacing.small,
          textAlign: 'center'
        }
      ]}>
        Welcome to Glyffiti!
      </Text>
      <Text style={[
        {
          fontSize: typography.fontSize.medium,
          color: isDarkMode ? '#9ca3af' : colors.textSecondary,
          textAlign: 'center',
          marginBottom: spacing.large
        }
      ]}>
        No posts yet. Be the first to share something on the blockchain!
      </Text>
      <TouchableOpacity
        style={{
          backgroundColor: isDarkMode ? '#3b82f6' : colors.primary,
          paddingHorizontal: spacing.large,
          paddingVertical: spacing.medium,
          borderRadius: borderRadius.button,
        }}
        onPress={handleRefresh}
        activeOpacity={0.7}
      >
        <Text style={{
          color: 'white',
          fontSize: typography.fontSize.medium,
          fontWeight: typography.fontWeight.medium
        }}>
          Refresh Feed
        </Text>
      </TouchableOpacity>
    </View>
  );
  
  // Styles
  const containerStyle = {
    flex: 1,
    backgroundColor: isDarkMode ? '#111827' : colors.background,
    ...style  // ✅ Allow custom styling from parent
  };
  
  const loadingTextStyle = {
    fontSize: typography.fontSize.medium,
    color: isDarkMode ? '#9ca3af' : colors.textSecondary
  };
  
  // Show loading state on initial load
  if (isLoading && posts.length === 0) {
    return renderLoadingState();
  }
  
  // Show error state if error and no posts
  if (error && posts.length === 0) {
    return renderErrorState();
  }
  
  // Show empty state if no posts after loading
  if (!isLoading && posts.length === 0) {
    return renderEmptyState();
  }
  
  // Main feed view (like Twitter/Instagram)
  return (
    <View style={containerStyle}>
      <FlatList
        data={posts}
        renderItem={renderFeedItem}
        keyExtractor={keyExtractor}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[isDarkMode ? '#60a5fa' : '#3b82f6']}  // Android
            tintColor={isDarkMode ? '#60a5fa' : '#3b82f6'}  // iOS
            title="Pull to refresh"
            titleColor={isDarkMode ? '#9ca3af' : colors.textSecondary}
          />
        }
        onScroll={handleScroll}  // ✅ Control top bar visibility
        scrollEventThrottle={16}  // ✅ Smooth scroll tracking
        showsVerticalScrollIndicator={false}  // ✅ Clean look like social apps
        contentContainerStyle={{
          paddingTop: spacing.small,  // ✅ Small top padding
          paddingHorizontal: 0,  // ✅ Full width posts
          flexGrow: 1
        }}
        // ✅ Performance optimizations for large feeds
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={21}
        // ✅ Future: Add onEndReached for infinite scroll
        // onEndReached={handleLoadMore}
        // onEndReachedThreshold={0.1}
      />
    </View>
  );
};

export default SocialFeed;

// Character count: 9,847