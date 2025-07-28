// src/components/shared/ContentCard.js
// Path: src/components/shared/ContentCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { User, Clock, Eye, Star, Download, Book } from 'lucide-react-native';
import { colors, spacing, typography } from '../../../styles';
import Card from './Card';

/**
 * Content card component for displaying content previews
 * Used for stories, articles, posts, etc. in discovery lists
 * Supports metadata, tags, author info, and various content types
 */
const ContentCard = ({
  title,
  author,
  authorPublicKey,
  previewText,
  timeAgo,
  estimatedReadTime,
  views,
  likes,
  tags = [],
  isCached = false,
  isBookmarked = false,
  showMetadata = true,
  showTags = true,
  showCacheIndicator = true,
  onPress,
  onAuthorPress,
  onTagPress,
  onBookmarkPress,
  isDarkMode = false,
  style,
  maxPreviewLength = 150,
  ...cardProps
}) => {
  // Color configuration
  const textColor = isDarkMode ? '#e5e7eb' : colors.text;
  const subtitleColor = isDarkMode ? '#9ca3af' : colors.textSecondary;
  const metadataColor = isDarkMode ? '#9ca3af' : colors.textSecondary;
  const accentColor = isDarkMode ? '#3b82f6' : colors.primary;

  // Format author display
  const formatAuthor = () => {
    if (!author || author === authorPublicKey) {
      return authorPublicKey ? 
        `${authorPublicKey.substring(0, 6)}...${authorPublicKey.substring(-4)}` : 
        'Unknown Author';
    }
    return author;
  };

  // Truncate preview text if needed
  const formatPreviewText = () => {
    if (!previewText) return '';
    if (previewText.length <= maxPreviewLength) return previewText;
    return previewText.substring(0, maxPreviewLength) + '...';
  };

  // Format numbers (views, likes) for display
  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Card
      isDarkMode={isDarkMode}
      onPress={onPress}
      style={[styles.contentCard, style]}
      {...cardProps}
    >
      {/* Header: Title and Cache Indicator */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={[
            styles.title,
            { color: textColor }
          ]} numberOfLines={2}>
            {title}
          </Text>
          
          {/* Author row */}
          <TouchableOpacity 
            style={styles.authorRow}
            onPress={onAuthorPress}
            disabled={!onAuthorPress}
          >
            <User size={14} color={subtitleColor} />
            <Text style={[
              styles.authorText,
              { color: subtitleColor }
            ]}>
              {formatAuthor()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Cache indicator */}
        {showCacheIndicator && isCached && (
          <View style={[
            styles.cacheIndicator,
            { backgroundColor: colors.success + '20' }
          ]}>
            <Download size={16} color={colors.success} />
          </View>
        )}

        {/* Bookmark indicator */}
        {isBookmarked && (
          <TouchableOpacity 
            style={styles.bookmarkButton}
            onPress={onBookmarkPress}
          >
            <Star size={16} color={colors.warning} />
          </TouchableOpacity>
        )}
      </View>

      {/* Preview text */}
      {previewText && (
        <Text style={[
          styles.previewText,
          { color: textColor }
        ]}>
          {formatPreviewText()}
        </Text>
      )}

      {/* Metadata row */}
      {showMetadata && (
        <View style={styles.metadataRow}>
          <View style={styles.metadataLeft}>
            {/* Read time */}
            {estimatedReadTime && (
              <View style={styles.metadataItem}>
                <Clock size={12} color={metadataColor} />
                <Text style={[
                  styles.metadataText,
                  { color: metadataColor }
                ]}>
                  {estimatedReadTime}m read
                </Text>
              </View>
            )}

            {/* Views */}
            {views !== undefined && (
              <View style={styles.metadataItem}>
                <Eye size={12} color={metadataColor} />
                <Text style={[
                  styles.metadataText,
                  { color: metadataColor }
                ]}>
                  {formatNumber(views)}
                </Text>
              </View>
            )}

            {/* Likes */}
            {likes !== undefined && (
              <View style={styles.metadataItem}>
                <Star size={12} color={metadataColor} />
                <Text style={[
                  styles.metadataText,
                  { color: metadataColor }
                ]}>
                  {formatNumber(likes)}
                </Text>
              </View>
            )}
          </View>

          {/* Time ago */}
          {timeAgo && (
            <Text style={[
              styles.timeAgo,
              { color: metadataColor }
            ]}>
              {timeAgo}
            </Text>
          )}
        </View>
      )}

      {/* Tags */}
      {showTags && tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {tags.slice(0, 5).map((tag, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.tag,
                { backgroundColor: accentColor + '15' }
              ]}
              onPress={() => onTagPress && onTagPress(tag)}
              disabled={!onTagPress}
            >
              <Text style={[
                styles.tagText,
                { color: accentColor }
              ]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
          {tags.length > 5 && (
            <View style={[
              styles.tag,
              { backgroundColor: metadataColor + '15' }
            ]}>
              <Text style={[
                styles.tagText,
                { color: metadataColor }
              ]}>
                +{tags.length - 5}
              </Text>
            </View>
          )}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  contentCard: {
    // Additional card-specific styling handled by Card component
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.small,
  },
  titleSection: {
    flex: 1,
    marginRight: spacing.small,
  },
  title: {
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
    marginLeft: spacing.small,
  },
  bookmarkButton: {
    padding: spacing.small,
    marginLeft: spacing.small,
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
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.extraSmall,
    borderRadius: 12,
    marginRight: spacing.small,
    marginBottom: spacing.extraSmall,
  },
  tagText: {
    fontSize: 11,
    fontFamily: typography.fontFamily,
  },
});

export default ContentCard;

// Character count: 6951