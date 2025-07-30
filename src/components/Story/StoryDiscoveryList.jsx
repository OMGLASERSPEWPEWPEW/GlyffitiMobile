// src/components/Story/StoryDiscoveryList.jsx
// Path: src/components/Story/StoryDiscoveryList.jsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl
} from 'react-native';
import { LoadingSpinner, ContentCard } from '../shared';
import { Book } from 'lucide-react-native';
import { colors, spacing, typography } from '../../styles/tokens';
import { storyCache } from '../../services/story/StoryCache';

/**
 * Component for discovering and browsing available stories
 * Handles both cached stories and discovery of new content
 */
const StoryDiscoveryList = ({
  onStorySelect,
  isDarkMode = false,
  showCachedOnly = false,
  searchQuery = '',
  sortBy = 'recent' // 'recent', 'popular', 'title', 'author'
}) => {
  const [stories, setStories] = useState([]);
  const [cachedStories, setCachedStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cacheStats, setCacheStats] = useState(null);

  // Load stories on component mount
  useEffect(() => {
    loadStories();
    loadCacheData();
  }, [showCachedOnly, searchQuery, sortBy]);

  // Load available stories
  const loadStories = async () => {
    try {
      setLoading(true);
      
      if (showCachedOnly) {
        // Load only cached stories
        const cached = await storyCache.getAllCachedManifests();
        setStories(processFeedData(cached));
      } else {
        // Load discovery feed (this would normally come from your story discovery service)
        // For now, we'll combine cached stories with mock discovery data
        const cached = await storyCache.getAllCachedManifests();
        const mockData = generateMockDiscoveryData();
        const combined = [...cached, ...mockData];
        setStories(processFeedData(combined));
      }
    } catch (error) {
      console.error('Error loading stories:', error);
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  // Load cache data for statistics
  const loadCacheData = async () => {
    try {
      const cached = await storyCache.getAllCachedManifests();
      setCachedStories(cached);
      
      const stats = await storyCache.getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Error loading cache data:', error);
      setCachedStories([]);
      setCacheStats({ totalStories: 0, totalSizeMB: 0 });
    }
  };

  // Process and filter story data
  const processFeedData = (data) => {
    let processed = [...data];

    // Apply search filter
    if (searchQuery.trim()) {
      processed = processed.filter(story => 
        story.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        processed.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        break;
      case 'popular':
        processed.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'title':
        processed.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'author':
        processed.sort((a, b) => (a.author || '').localeCompare(b.author || ''));
        break;
    }

    return processed;
  };

  // Generate mock discovery data (replace with real discovery service)
  const generateMockDiscoveryData = () => {
    return [
      {
        storyId: 'discovery_1',
        title: 'The Digital Nomad\'s Journey',
        author: 'CryptoWriter',
        authorPublicKey: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        totalChunks: 8,
        timestamp: Date.now() - 86400000, // 1 day ago
        previewText: 'A tale of adventure through the decentralized web...',
        tags: ['adventure', 'technology'],
        views: 1542,
        likes: 89,
        estimatedReadTime: 12
      },
      {
        storyId: 'discovery_2',
        title: 'Midnight in the Metaverse',
        author: 'VirtualScribe',
        authorPublicKey: '7YbF3kLMnHgSeRAQpF5VJqXgF8sM9WkN3LxbQyXtREDX',
        totalChunks: 15,
        timestamp: Date.now() - 172800000, // 2 days ago
        previewText: 'When reality blends with virtual worlds, anything is possible...',
        tags: ['sci-fi', 'metaverse'],
        views: 3421,
        likes: 234,
        estimatedReadTime: 18
      }
    ];
  };

  // Handle story selection
  const handleStorySelect = async (story) => {
    // Check if story is cached
    const isCached = await storyCache.isStoryCached(story.storyId);
    
    if (onStorySelect) {
      onStorySelect(story, isCached);
    }
  };

  // Handle pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStories();
    await loadCacheData();
    setRefreshing(false);
  };

  // Format time ago
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  // Render individual story item using ContentCard
  const renderStoryItem = ({ item: story }) => {
    const isCached = cachedStories.some(cached => cached.storyId === story.storyId);
    
    return (
      <ContentCard
        title={story.title}
        author={story.author}
        authorPublicKey={story.authorPublicKey}
        previewText={story.previewText}
        timeAgo={formatTimeAgo(story.timestamp)}
        estimatedReadTime={story.estimatedReadTime}
        views={story.views}
        likes={story.likes}
        tags={story.tags || []}
        isCached={isCached}
        onPress={() => handleStorySelect(story)}
        isDarkMode={isDarkMode}
        marginHorizontal={0} // Remove horizontal margin since parent has padding
        marginBottom={spacing.medium}
      />
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    const emptyTitle = showCachedOnly ? 'No Cached Stories' : 'No Stories Found';
    const emptyMessage = showCachedOnly 
      ? 'You haven\'t cached any stories yet. Browse the discovery feed to find stories to download.'
      : searchQuery 
        ? 'Try adjusting your search terms or browse all stories.'
        : 'Check your connection and try refreshing.';

    return (
      <View style={styles.emptyContainer}>
        <Book 
          size={48} 
          color={isDarkMode ? colors.textSecondaryDark : colors.textSecondary} 
        />
        <Text style={[
          styles.emptyTitle,
          { color: isDarkMode ? colors.textDark : colors.text }
        ]}>
          {emptyTitle}
        </Text>
        <Text style={[
          styles.emptyText,
          { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
        ]}>
          {emptyMessage}
        </Text>
      </View>
    );
  };

  // Render header with cache statistics
  const renderHeader = () => {
    if (!showCachedOnly || !cacheStats) return null;

    return (
      <View style={[
        styles.headerContainer,
        isDarkMode && styles.headerContainerDark
      ]}>
        <Text style={[
          styles.headerTitle,
          { color: isDarkMode ? colors.textDark : colors.text }
        ]}>
          Cached Stories
        </Text>
        <Text style={[
          styles.headerStats,
          { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
        ]}>
          {cacheStats.totalStories} stories • {cacheStats.totalSizeMB.toFixed(1)}MB used
        </Text>
      </View>
    );
  };

  return (
    <View style={[
      styles.container,
      isDarkMode && styles.containerDark
    ]}>
      <FlatList
        data={stories}
        renderItem={renderStoryItem}
        keyExtractor={(item) => item.storyId}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[isDarkMode ? colors.accentDark : colors.accent]}
            tintColor={isDarkMode ? colors.accentDark : colors.accent}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
      
      {loading && stories.length === 0 && (
        <LoadingSpinner
            message="Loading stories..."
            isDarkMode={isDarkMode}
            inline={false}
            animated={true}
        />
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerDark: {
    backgroundColor: colors.backgroundDark,
  },
  listContent: {
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
  },
  headerContainer: {
    paddingVertical: spacing.medium,
    paddingHorizontal: spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.small,
  },
  headerContainerDark: {
    borderBottomColor: colors.borderDark,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: typography.fontFamilyBold,
    marginBottom: spacing.extraSmall,
  },
  headerStats: {
    fontSize: 12,
    fontFamily: typography.fontFamily,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.extraLarge * 2,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: typography.fontFamilyBold,
    marginTop: spacing.large,
    marginBottom: spacing.small,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 250,
  },
});

export default StoryDiscoveryList;

// Character count: 8127