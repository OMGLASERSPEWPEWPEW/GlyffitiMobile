// src/components/feed/FeedItem.js
// Path: src/components/feed/FeedItem.js

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity
} from 'react-native';
import { colors, spacing, typography, borderRadius, borderWidth, shadows } from '../../styles/tokens';

/**
 * FeedItem Component
 * 
 * Displays a single post in the social feed. Shows author, content,
 * timestamp, and blockchain transaction info. Designed to be lightweight
 * and performant for use in large feed lists.
 * 
 * Props:
 * - post: Post object from FeedService
 * - isDarkMode: Whether to use dark theme
 * - onPress: Optional callback when post is tapped
 * - onAuthorPress: Optional callback when author name is tapped
 */
export const FeedItem = ({ 
  post, 
  isDarkMode = false, 
  onPress = null,
  onAuthorPress = null 
}) => {
  
  if (!post) {
    return null;
  }
  
  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffMinutes < 1) {
        return 'just now';
      } else if (diffMinutes < 60) {
        return `${diffMinutes}m`;
      } else if (diffHours < 24) {
        return `${diffHours}h`;
      } else if (diffDays < 7) {
        return `${diffDays}d`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      return 'unknown';
    }
  };
  
  /**
   * Truncate long content with ellipsis
   */
  const truncateContent = (content, maxLength = 280) => {
    if (!content || content.length <= maxLength) {
      return content;
    }
    
    return content.substring(0, maxLength).trim() + '...';
  };
  
  /**
   * Get author initials for avatar
   */
  const getAuthorInitials = (username) => {
    if (!username) return '?';
    return username.charAt(0).toUpperCase();
  };
  
  /**
   * Handle post press
   */
  const handlePostPress = () => {
    if (onPress) {
      onPress(post);
    }
  };
  
  /**
   * Handle author press
   */
  const handleAuthorPress = () => {
    if (onAuthorPress) {
      onAuthorPress(post.author, post.authorPublicKey);
    }
  };
  
  const containerStyle = {
    backgroundColor: isDarkMode ? '#1f2937' : colors.background,
    borderColor: isDarkMode ? '#374151' : colors.border,
    borderWidth: borderWidth.hairline,
    borderRadius: borderRadius.medium,
    padding: spacing.medium,
    marginBottom: spacing.small,
    ...shadows.small
  };
  
  const headerStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.small
  };
  
  const avatarStyle = {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: isDarkMode ? '#4b5563' : '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.medium
  };
  
  const avatarTextStyle = {
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.bold,
    color: isDarkMode ? '#f3f4f6' : '#374151'
  };
  
  const authorInfoStyle = {
    flex: 1
  };
  
  const authorNameStyle = {
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.bold,
    color: isDarkMode ? '#f3f4f6' : colors.text,
    marginBottom: 2
  };
  
  const timestampStyle = {
    fontSize: typography.fontSize.small,
    color: isDarkMode ? '#9ca3af' : colors.textSecondary
  };
  
  const contentStyle = {
    fontSize: typography.fontSize.medium,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.medium,
    color: isDarkMode ? '#e5e7eb' : colors.text,
    marginBottom: spacing.small
  };
  
  const footerStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.small,
    borderTopWidth: borderWidth.hairline,
    borderTopColor: isDarkMode ? '#374151' : colors.border
  };
  
  const blockchainInfoStyle = {
    fontSize: typography.fontSize.small,
    color: isDarkMode ? '#60a5fa' : '#3b82f6',
    fontFamily: 'monospace'
  };
  
  const publicKeyStyle = {
    fontSize: typography.fontSize.small,
    color: isDarkMode ? '#9ca3af' : colors.textSecondary,
    fontFamily: 'monospace'
  };
  
  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={handlePostPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {/* Header: Author info and timestamp */}
      <View style={headerStyle}>
        {/* Author avatar */}
        <TouchableOpacity
          style={avatarStyle}
          onPress={handleAuthorPress}
          activeOpacity={onAuthorPress ? 0.7 : 1}
        >
          <Text style={avatarTextStyle}>
            {getAuthorInitials(post.author)}
          </Text>
        </TouchableOpacity>
        
        {/* Author name and timestamp */}
        <View style={authorInfoStyle}>
          <TouchableOpacity
            onPress={handleAuthorPress}
            activeOpacity={onAuthorPress ? 0.7 : 1}
          >
            <Text style={authorNameStyle}>
              {post.author || 'Unknown'}
            </Text>
          </TouchableOpacity>
          <Text style={timestampStyle}>
            {formatTimestamp(post.timestamp)}
          </Text>
        </View>
      </View>
      
      {/* Post content */}
      <Text style={contentStyle}>
        {truncateContent(post.content)}
      </Text>
      
      {/* Footer: Blockchain info */}
      <View style={footerStyle}>
        <Text style={blockchainInfoStyle}>
          tx: {post.transactionHash ? post.transactionHash.substring(0, 8) + '...' : 'unknown'}
        </Text>
        <Text style={publicKeyStyle}>
          {post.authorPublicKey ? post.authorPublicKey.substring(0, 8) + '...' : 'unknown'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default FeedItem;

// Character count: 5,247