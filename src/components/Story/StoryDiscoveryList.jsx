// src/components/Story/StoryDiscoveryList.jsx
// Path: src/components/Story/StoryDiscoveryList.jsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl
} from 'react-native';
import { LoadingSpinner } from '../shared';
import { Book, Clock, User, Download, Eye, Star } from 'lucide-react-native';
import { colors, spacing, typography } from '../../styles';
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
        const mockDiscovery = generateMockDiscoveryData();
        const combined = [...cached, ...mockDiscovery];
        setStories(processFeedData(combined));
      }
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load cache statistics
  const loadCacheData = async () => {
    try {
      const cached = await storyCache.getAllCachedManifests();
      const stats = await storyCache.getCacheStats();
      setCachedStories(cached);
      setCacheStats(stats);
    } catch (error) {
      console.error('Error loading cache data:', error);
    }
  };

  // Process and sort feed data
  const processFeedData = (rawData) => {
    let processed = rawData.filter(story => {
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          story.title?.toLowerCase().includes(query) ||
          story.author?.toLowerCase().includes(query)
        );
      }
      return true;
    });

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        processed.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        break;
      case 'title':
        processed.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'author':
        processed.sort((a, b) => (a.author || '').localeCompare(b.author || ''));
        break;
      case 'popular':
        // Sort by a popularity metric (mock for now)
        processed.sort((a, b) => (b.views || 0) - (a.views || 0));
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

  // Format author display
  const formatAuthor = (author, publicKey) => {
    if (!author || author === publicKey) {
      return publicKey ? 
        `${publicKey.substring(0, 6)}...${publicKey.substring(-4)}` : 
        'Unknown Author';
    }
    return author;
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

  // Render individual story item
  const renderStoryItem = ({ item: story }) => {
    const isCached = cachedStories.some(cached => cached.storyId === story.storyId);
    
    return (
      <TouchableOpacity 
        style={[
          styles.storyCard,
          isDarkMode && styles.storyCardDark
        ]}
        onPress={() => handleStorySelect(story)}
        activeOpacity={0.7}
      >
        {/* Story header */}
        <View style={styles.storyHeader}>
          <View style={styles.storyTitleSection}>
            <Text 
              style={[
                styles.storyTitle,
                { color: isDarkMode ? colors.textDark : colors.text }
              ]}
              numberOfLines={2}
            >
              {story.title}
            </Text>
            <View style={styles.authorRow}>
              <User 
                size={12} 
                color={isDarkMode ? colors.textSecondaryDark : colors.textSecondary} 
              />
              <Text style={[
                styles.authorText,
                { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
              ]}>
                {formatAuthor(story.author, story.authorPublicKey)}
              </Text>
            </View>
          </View>
          
          {/* Cache indicator */}
          {isCached && (
            <View style={styles.cacheIndicator}>
              <Download 
                size={16} 
                color={isDarkMode ? colors.successDark : colors.success} 
              />
            </View>
          )}
        </View>

        {/* Story preview */}
        {story.previewText && (
          <Text 
            style={[
              styles.previewText,
              { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
            ]}
            numberOfLines={2}
          >
            {story.previewText}
          </Text>
        )}

        {/* Story metadata */}
        <View style={styles.metadataRow}>
          <View style={styles.metadataLeft}>
            <View style={styles.metadataItem}>
              <Book size={12} color={isDarkMode ? colors.textSecondaryDark : colors.textSecondary} />
              <Text style={[
                styles.metadataText,
                { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
              ]}>
                {story.totalChunks} chunks
              </Text>
            </View>
            
            {story.estimatedReadTime && (
              <View style={styles.metadataItem}>
                <Clock size={12} color={isDarkMode ? colors.textSecondaryDark : colors.textSecondary} />
                <Text style={[
                  styles.metadataText,
                  { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
                ]}>
                  {story.estimatedReadTime} min
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.metadataRight}>
            {story.views && (
              <View style={styles.metadataItem}>
                <Eye size={12} color={isDarkMode ? colors.textSecondaryDark : colors.textSecondary} />
                <Text style={[
                  styles.metadataText,
                  { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
                ]}>
                  {story.views}
                </Text>
              </View>
            )}
            
            <Text style={[
              styles.timeAgo,
              { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
            ]}>
              {formatTimeAgo(story.timestamp)}
            </Text>
          </View>
        </View>

        {/* Tags */}
        {story.tags && story.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {story.tags.slice(0, 3).map((tag, index) => (
              <View 
                key={index}
                style={[
                  styles.tag,
                  isDarkMode && styles.tagDark
                ]}
              >
                <Text style={[
                  styles.tagText,
                  { color: isDarkMode ? colors.accentDark : colors.accent }
                ]}>
                  #{tag}
                </Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Book 
        size={48} 
        color={isDarkMode ? colors.textSecondaryDark : colors.textSecondary} 
      />
      <Text style={[
        styles.emptyTitle,
        { color: isDarkMode ? colors.textDark : colors.text }
      ]}>
        {showCachedOnly ? 'No Cached Stories' : 'No Stories Found'}
      </Text>
      <Text style={[
        styles.emptyText,
        { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
      ]}>
        {showCachedOnly 
          ? 'Stories you read will be cached here for offline access'
          : searchQuery 
            ? 'Try a different search term'
            : 'Check back later for new stories'
        }
      </Text>
    </View>
  );

  // Render cache stats header
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
  storyCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.medium,
    marginBottom: spacing.medium,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  storyCardDark: {
    backgroundColor: colors.surfaceDark,
    borderColor: colors.borderDark,
    shadowColor: colors.shadowDark,
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.small,
  },
  storyTitleSection: {
    flex: 1,
    marginRight: spacing.small,
  },
  storyTitle: {
    fontSize: 18,
    fontFamily: typography.fontFamilyBold,
    lineHeight: 24,
    marginBottom: spacing.extraSmall,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorText: {
    fontSize: 14,
    fontFamily: typography.fontFamily,
    marginLeft: spacing.extraSmall,
  },
  cacheIndicator: {
    padding: spacing.small,
    borderRadius: 20,
    backgroundColor: colors.success + '20',
  },
  previewText: {
    fontSize: 14,
    fontFamily: typography.fontFamily,
    lineHeight: 20,
    marginBottom: spacing.medium,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  metadataLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.medium,
  },
  metadataText: {
    fontSize: 12,
    fontFamily: typography.fontFamily,
    marginLeft: spacing.extraSmall,
  },
  timeAgo: {
    fontSize: 12,
    fontFamily: typography.fontFamily,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.small,
  },
  tag: {
    backgroundColor: colors.accent + '15',
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.extraSmall,
    borderRadius: 12,
    marginRight: spacing.small,
    marginBottom: spacing.extraSmall,
  },
  tagDark: {
    backgroundColor: colors.accentDark + '15',
  },
  tagText: {
    fontSize: 11,
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

// 3,647 characters