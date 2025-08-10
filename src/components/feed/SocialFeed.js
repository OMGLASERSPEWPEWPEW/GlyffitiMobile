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
 * SocialFeed Component
 * 
 * Main feed component that displays a scrollable list of posts from all users.
 * Uses FeedService to fetch posts and FeedItem to render individual posts.
 * Includes pull-to-refresh, loading states, and error handling.
 * 
 * Props:
 * - isDarkMode: Whether to use dark theme
 * - maxPosts: Maximum number of posts to load (default: 20)
 * - postsPerUser: Maximum posts per user (default: 3)
 * - onPostPress: Callback when a post is tapped
 * - onAuthorPress: Callback when an author is tapped
 * - onError: Callback when an error occurs
 */
export const SocialFeed = ({
  isDarkMode = false,
  maxPosts = 20,
  postsPerUser = 3,
  onPostPress = null,
  onAuthorPress = null,
  onError = null
}) => {
  
  // Feed state
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  
  /**
   * Load feed data from FeedService
   */
  const loadFeed = useCallback(async (useCache = true) => {
    try {
      setError(null);
      
      const feedOptions = {
        maxTotalPosts: maxPosts,
        limit: postsPerUser,
        useCache: useCache
      };
      
      const feedPosts = await feedService.buildFeed(feedOptions);
      
      setPosts(feedPosts);
      setLastFetchTime(Date.now());
      
      console.log('📰 Feed loaded:', {
        postsCount: feedPosts.length,
        fromCache: useCache && feedService.isCacheValid()
      });
      
    } catch (loadError) {
      console.error('❌ Error loading feed:', loadError);
      setError(loadError.message || 'Failed to load feed');
      
      if (onError) {
        onError(loadError);
      }
    }
  }, [maxPosts, postsPerUser, onError]);
  
  /**
   * Handle pull-to-refresh
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
  const renderFeedItem = useCallback(({ item }) => (
    <FeedItem
      post={item}
      isDarkMode={isDarkMode}
      onPress={handlePostPress}
      onAuthorPress={handleAuthorPress}
    />
  ), [isDarkMode, handlePostPress, handleAuthorPress]);
  
  /**
   * Generate unique key for each post
   */
  const keyExtractor = useCallback((item) => {
    return item.id || item.transactionHash || `post-${item.timestamp}`;
  }, []);
  
  /**
   * Render loading state
   */
  const renderLoadingState = () => (
    <View style={loadingContainerStyle}>
      <ActivityIndicator 
        size="large" 
        color={isDarkMode ? '#60a5fa' : '#3b82f6'} 
      />
      <Text style={loadingTextStyle}>
        Loading posts...
      </Text>
    </View>
  );
  
  /**
   * Render error state
   */
  const renderErrorState = () => (
    <View style={errorContainerStyle}>
      <Text style={errorIconStyle}>⚠️</Text>
      <Text style={errorTitleStyle}>
        Feed Error
      </Text>
      <Text style={errorMessageStyle}>
        {error}
      </Text>
      <TouchableOpacity
        style={retryButtonStyle}
        onPress={handleRetry}
        activeOpacity={0.7}
      >
        <Text style={retryButtonTextStyle}>
          Try Again
        </Text>
      </TouchableOpacity>
    </View>
  );
  
  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View style={emptyContainerStyle}>
      <Text style={emptyIconStyle}>📭</Text>
      <Text style={emptyTitleStyle}>
        No Posts Yet
      </Text>
      <Text style={emptyMessageStyle}>
        Be the first to post something! Create a post to start building the social feed.
      </Text>
      <TouchableOpacity
        style={refreshButtonStyle}
        onPress={handleRefresh}
        activeOpacity={0.7}
      >
        <Text style={refreshButtonTextStyle}>
          Refresh Feed
        </Text>
      </TouchableOpacity>
    </View>
  );
  
  /**
   * Render list header with stats
   */
  const renderListHeader = () => {
    if (posts.length === 0) return null;
    
    return (
      <View style={headerContainerStyle}>
        <Text style={headerTextStyle}>
          {posts.length} post{posts.length !== 1 ? 's' : ''}
          {lastFetchTime && (
            <Text style={headerSubtextStyle}>
              {' • '}{new Date(lastFetchTime).toLocaleTimeString()}
            </Text>
          )}
        </Text>
      </View>
    );
  };
  
  // Styles
  const containerStyle = {
    flex: 1,
    backgroundColor: isDarkMode ? '#111827' : colors.background
  };
  
  const loadingContainerStyle = {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xlarge
  };
  
  const loadingTextStyle = {
    marginTop: spacing.medium,
    fontSize: typography.fontSize.medium,
    color: isDarkMode ? '#9ca3af' : colors.textSecondary
  };
  
  const errorContainerStyle = {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xlarge
  };
  
  const errorIconStyle = {
    fontSize: 48,
    marginBottom: spacing.medium
  };
  
  const errorTitleStyle = {
    fontSize: typography.fontSize.large,
    fontWeight: typography.fontWeight.bold,
    color: isDarkMode ? '#f3f4f6' : colors.text,
    marginBottom: spacing.small,
    textAlign: 'center'
  };
  
  const errorMessageStyle = {
    fontSize: typography.fontSize.medium,
    color: isDarkMode ? '#9ca3af' : colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.medium,
    marginBottom: spacing.large
  };
  
  const retryButtonStyle = {
    backgroundColor: isDarkMode ? '#374151' : colors.primary,
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    borderRadius: borderRadius.medium,
    ...shadows.small
  };
  
  const retryButtonTextStyle = {
    color: isDarkMode ? '#f3f4f6' : 'white',
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.medium
  };
  
  const emptyContainerStyle = {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xlarge
  };
  
  const emptyIconStyle = {
    fontSize: 64,
    marginBottom: spacing.large
  };
  
  const emptyTitleStyle = {
    fontSize: typography.fontSize.large,
    fontWeight: typography.fontWeight.bold,
    color: isDarkMode ? '#f3f4f6' : colors.text,
    marginBottom: spacing.small,
    textAlign: 'center'
  };
  
  const emptyMessageStyle = {
    fontSize: typography.fontSize.medium,
    color: isDarkMode ? '#9ca3af' : colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.medium,
    marginBottom: spacing.large,
    maxWidth: 280
  };
  
  const refreshButtonStyle = {
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: isDarkMode ? '#374151' : colors.border
  };
  
  const refreshButtonTextStyle = {
    color: isDarkMode ? '#60a5fa' : colors.primary,
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.medium
  };
  
  const headerContainerStyle = {
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? '#374151' : colors.border
  };
  
  const headerTextStyle = {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.medium,
    color: isDarkMode ? '#9ca3af' : colors.textSecondary,
    textAlign: 'center'
  };
  
  const headerSubtextStyle = {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.regular,
    color: isDarkMode ? '#6b7280' : colors.textLight
  };
  
  const listContainerStyle = {
    padding: spacing.medium
  };
  
  // Render main content
  if (isLoading && !isRefreshing && posts.length === 0) {
    return (
      <View style={containerStyle}>
        {renderLoadingState()}
      </View>
    );
  }
  
  if (error && posts.length === 0) {
    return (
      <View style={containerStyle}>
        {renderErrorState()}
      </View>
    );
  }
  
  if (posts.length === 0) {
    return (
      <View style={containerStyle}>
        {renderEmptyState()}
      </View>
    );
  }
  
  return (
    <View style={containerStyle}>
      <FlatList
        data={posts}
        renderItem={renderFeedItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderListHeader}
        contentContainerStyle={listContainerStyle}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[isDarkMode ? '#60a5fa' : '#3b82f6']}
            tintColor={isDarkMode ? '#60a5fa' : '#3b82f6'}
            title="Pull to refresh"
            titleColor={isDarkMode ? '#9ca3af' : colors.textSecondary}
          />
        }
        removeClippedSubviews={true} // Performance optimization
        maxToRenderPerBatch={10}     // Performance optimization
        windowSize={10}              // Performance optimization
      />
    </View>
  );
};

export default SocialFeed;

// Character count: 10,247