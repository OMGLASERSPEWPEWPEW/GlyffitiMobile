// src/components/shared/layout/ContentCard.js
// Path: src/components/shared/layout/ContentCard.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { User, Clock, Eye, Star, Download } from 'lucide-react-native';
import { colors, spacing } from '../../../styles/tokens';
import { cardStyles } from '../../../styles/cardStyles';
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
      style={[cardStyles.contentCard, style]}
      {...cardProps}
    >
      {/* Header: Title and Cache Indicator */}
      <View style={cardStyles.contentHeader}>
        <View style={cardStyles.contentTitleSection}>
          <Text style={[
            cardStyles.contentTitle,
            { color: textColor }
          ]} numberOfLines={2}>
            {title}
          </Text>
          
          {/* Author row */}
          <TouchableOpacity 
            style={cardStyles.contentAuthorRow}
            onPress={onAuthorPress}
            disabled={!onAuthorPress}
          >
            <User size={14} color={subtitleColor} />
            <Text style={[
              cardStyles.contentAuthorText,
              { color: subtitleColor }
            ]}>
              {formatAuthor()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Cache indicator */}
        {showCacheIndicator && isCached && (
          <View style={[
            cardStyles.contentCacheIndicator,
            { backgroundColor: colors.success + '20' }
          ]}>
            <Download size={16} color={colors.success} />
          </View>
        )}

        {/* Bookmark indicator */}
        {isBookmarked && (
          <TouchableOpacity 
            style={cardStyles.contentBookmarkButton}
            onPress={onBookmarkPress}
          >
            <Star size={16} color={colors.warning} />
          </TouchableOpacity>
        )}
      </View>

      {/* Preview text */}
      {previewText && (
        <Text style={[
          cardStyles.contentPreviewText,
          { color: textColor }
        ]}>
          {formatPreviewText()}
        </Text>
      )}

      {/* Metadata row */}
      {showMetadata && (
        <View style={cardStyles.contentMetadataRow}>
          <View style={cardStyles.contentMetadataLeft}>
            {/* Read time */}
            {estimatedReadTime && (
              <View style={cardStyles.contentMetadataItem}>
                <Clock size={12} color={metadataColor} />
                <Text style={[
                  cardStyles.contentMetadataText,
                  { color: metadataColor }
                ]}>
                  {estimatedReadTime}m read
                </Text>
              </View>
            )}

            {/* Views */}
            {views !== undefined && (
              <View style={cardStyles.contentMetadataItem}>
                <Eye size={12} color={metadataColor} />
                <Text style={[
                  cardStyles.contentMetadataText,
                  { color: metadataColor }
                ]}>
                  {formatNumber(views)}
                </Text>
              </View>
            )}

            {/* Likes */}
            {likes !== undefined && (
              <View style={cardStyles.contentMetadataItem}>
                <Star size={12} color={metadataColor} />
                <Text style={[
                  cardStyles.contentMetadataText,
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
              cardStyles.contentTimeAgo,
              { color: metadataColor }
            ]}>
              {timeAgo}
            </Text>
          )}
        </View>
      )}

      {/* Tags */}
      {showTags && tags.length > 0 && (
        <View style={cardStyles.contentTagsContainer}>
          {tags.slice(0, 5).map((tag, index) => (
            <TouchableOpacity
              key={index}
              style={[
                cardStyles.contentTag,
                { backgroundColor: accentColor + '15' }
              ]}
              onPress={() => onTagPress && onTagPress(tag)}
              disabled={!onTagPress}
            >
              <Text style={[
                cardStyles.contentTagText,
                { color: accentColor }
              ]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
          {tags.length > 5 && (
            <View style={[
              cardStyles.contentTag,
              { backgroundColor: metadataColor + '15' }
            ]}>
              <Text style={[
                cardStyles.contentTagText,
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

export default ContentCard;

// Character count: 5479