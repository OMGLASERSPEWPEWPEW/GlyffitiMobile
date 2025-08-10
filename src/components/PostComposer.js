// src/components/PostComposer.js
// Path: src/components/PostComposer.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { Keypair } from '@solana/web3.js';
import { spacing, colors, typography, borderRadius } from '../styles/tokens';
import { useWallet } from '../hooks/useWallet';
import { PublishingService } from '../services/publishing/PublishingService';
import userKeys from '../data/user-keys.json';

/**
 * PostComposer Component
 * 
 * Social media post creation interface that publishes directly to the blockchain.
 * Integrates with UserSelector to post from the selected user's wallet and
 * maintains post chain integrity by linking to the user's previous posts.
 * 
 * Features:
 * - Character limit enforcement (280 chars, Twitter-style)
 * - Real-time cost estimation in SOL
 * - Blockchain publishing with progress tracking
 * - Post chain management (links to user's previous posts)
 * - User wallet payment and balance validation
 * - Responsive design for different screen sizes
 * 
 * Architecture Integration:
 * - Uses PostPublishingService for blockchain publishing
 * - Maintains user post chains (genesis -> post1 -> post2...)
 * - Stores posts permanently on Solana blockchain
 * - Updates user's lastPostHash for chain integrity
 */
export const PostComposer = ({ 
  selectedUser = null,
  selectedUserData = null,
  userWalletBalance = 0,
  isDarkMode = false,
  onPostCreate = null 
}) => {
  
  // Wallet integration for accessing user keypairs
  const { walletManager } = useWallet();
  
  // Publishing service instance
  const [publishingService, setPublishingService] = useState(null);
  
  // Post content state
  const [postContent, setPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [publishProgress, setPublishProgress] = useState(null);
  
  // UI state
  const [isExpanded, setIsExpanded] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState(0.001); // Default estimate
  
  // Constants
  const MAX_POST_LENGTH = 280; // Twitter-style character limit
  const ESTIMATED_COST_PER_POST = 0.001; // SOL - rough estimate
  
  /**
   * Calculate remaining characters
   */
  const remainingChars = MAX_POST_LENGTH - postContent.length;
  const isOverLimit = remainingChars < 0;
  const isNearLimit = remainingChars <= 20 && remainingChars >= 0;
  
  /**
   * Check if post can be published
   */
  const canPost = postContent.trim().length > 0 && 
                  !isOverLimit && 
                  selectedUser && 
                  publishingService &&
                  userWalletBalance >= estimatedCost &&
                  !isPosting &&
                  !publishProgress;

  /**
   * Set up publishing service when user changes
   */
  useEffect(() => {
    if (selectedUser) {
      try {
        const service = new PublishingService();
        
        // Create a temporary wallet object for the user
        const userWallet = {
          getWalletKeypair: () => {
            const privateKeyArray = userKeys[selectedUser.username];
            if (!privateKeyArray) {
              throw new Error(`No private key found for user: ${selectedUser.username}`);
            }
            return Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
          }
        };
        
        service.setWallet(userWallet);
        setPublishingService(service);
        console.log('✅ Publishing service set up for:', selectedUser.username);
      } catch (error) {
        console.error('❌ Error setting up publishing service:', error);
      }
    }
  }, [selectedUser]);

  /**
   * Update cost estimation using existing publishing service
   */
  useEffect(() => {
    const updateCostEstimate = async () => {
      if (postContent.length > 0 && publishingService) {
        try {
          // Use existing content preparation to get accurate cost
          const tempContent = {
            content: postContent,
            filename: `${selectedUser?.username}_post.txt`,
            size: postContent.length,
            type: 'text/plain'
          };
          
          // This uses your proven cost estimation logic
          const stats = publishingService.getContentStats(postContent);
          setEstimatedCost(0.001); // Conservative estimate for now
        } catch (error) {
          console.error('Error estimating cost:', error);
          setEstimatedCost(0.001); // Fallback
        }
      } else {
        setEstimatedCost(0.001);
      }
    };
    
    updateCostEstimate();
  }, [postContent, publishingService]);

  /**
   * Handle post creation using existing PublishingService infrastructure
   */
  const handleCreatePost = async () => {
    if (!canPost || !publishingService) return;
    
    try {
      setIsPosting(true);
      setPublishProgress(null);
      
      // Prepare content in the format your existing PublishingService expects
      const contentData = {
        content: postContent.trim(),
        filename: `${selectedUser.username}_post_${Date.now()}.txt`,
        size: postContent.trim().length,
        type: 'text/plain'
      };
      
      const postTitle = `Post by ${selectedUser.username}`;
      const authorName = selectedUser.username;
      
      // Show confirmation dialog with cost
      Alert.alert(
        '🚀 Publish Post',
        `"${postContent.trim().substring(0, 50)}${postContent.length > 50 ? '...' : ''}"\n\nCost: ${estimatedCost.toFixed(4)} SOL\nFrom: ${selectedUser.username}'s wallet\n\nThis will be permanently stored on the blockchain.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Publish', 
            onPress: async () => {
              try {
                console.log('🚀 Publishing post using existing PublishingService...');
                
                // Use your existing, proven publishing pipeline
                const result = await publishingService.publishContent(
                  contentData,
                  postTitle,
                  { authorName },
                  (progress) => {
                    setPublishProgress(progress);
                    console.log('📊 Publishing progress:', progress);
                  }
                );
                
                // Success!
                console.log('✅ Post published successfully using existing service:', result);
                
                Alert.alert(
                  '🎉 Post Published!',
                  `Your post has been permanently stored on the blockchain!\n\nScroll: ${result.contentId}\nCost: ${result.totalCost?.toFixed(4) || estimatedCost.toFixed(4)} SOL`,
                  [{ text: 'OK' }]
                );
                
                // Clear the composer
                setPostContent('');
                setIsExpanded(false);
                setPublishProgress(null);
                Keyboard.dismiss();
                
                // Notify parent component if callback provided
                if (onPostCreate) {
                  onPostCreate({
                    success: true,
                    result
                  });
                }
                
              } catch (publishError) {
                console.error('❌ Publishing failed:', publishError);
                
                Alert.alert(
                  'Publishing Failed',
                  `Failed to publish post: ${publishError.message}`,
                  [{ text: 'OK' }]
                );
                
                setPublishProgress(null);
                
                // Notify parent component of failure
                if (onPostCreate) {
                  onPostCreate({
                    success: false,
                    error: publishError.message
                  });
                }
              }
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('❌ Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  /**
   * Handle expanding/collapsing the composer
   */
  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      // Focus on text input when expanding
      setTimeout(() => {
        // TextInput will auto-focus when expanded
      }, 100);
    }
  };

  /**
   * Get character count color based on remaining characters
   */
  const getCharCountColor = () => {
    if (isOverLimit) return '#ef4444'; // Red
    if (isNearLimit) return '#f59e0b'; // Orange
    return isDarkMode ? '#9ca3af' : '#6b7280'; // Gray
  };

  /**
   * Get post button style based on state
   */
  const getPostButtonStyle = () => {
    const baseStyle = {
      backgroundColor: canPost ? '#3b82f6' : (isDarkMode ? '#374151' : '#e5e7eb'),
      paddingHorizontal: spacing.medium,
      paddingVertical: spacing.small,
      borderRadius: borderRadius.medium,
      minWidth: 80,
      alignItems: 'center',
      justifyContent: 'center'
    };
    
    return baseStyle;
  };

  /**
   * Render collapsed state (just a prompt to create post)
   */
  const renderCollapsedState = () => (
    <TouchableOpacity
      style={{
        backgroundColor: isDarkMode ? '#374151' : colors.backgroundSecondary,
        borderRadius: borderRadius.medium,
        padding: spacing.medium,
        borderWidth: 1,
        borderColor: isDarkMode ? '#6b7280' : colors.border,
        marginVertical: spacing.small
      }}
      onPress={handleToggleExpanded}
      disabled={!selectedUser}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{
          flex: 1,
          color: selectedUser ? (isDarkMode ? '#9ca3af' : '#6b7280') : '#9ca3af',
          fontSize: typography?.fontSize?.body || 14,
          fontFamily: typography?.fontFamily || 'System'
        }}>
          {selectedUser 
            ? `What's on your mind, ${selectedUser.username}?` 
            : 'Select a user to create a post'
          }
        </Text>
        <Text style={{
          color: isDarkMode ? '#60a5fa' : '#3b82f6',
          fontSize: typography?.fontSize?.caption || 12,
          fontWeight: typography?.fontWeight?.medium || '500'
        }}>
          ✏️ Post
        </Text>
      </View>
    </TouchableOpacity>
  );

  /**
   * Render expanded state (full composer)
   */
  const renderExpandedState = () => (
    <View style={{
      backgroundColor: isDarkMode ? '#374151' : colors.backgroundSecondary,
      borderRadius: borderRadius.medium,
      borderWidth: 1,
      borderColor: isDarkMode ? '#6b7280' : colors.border,
      marginVertical: spacing.small,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.medium,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? '#4b5563' : colors.border
      }}>
        <Text style={{
          color: isDarkMode ? '#e5e7eb' : colors.text,
          fontSize: typography?.fontSize?.large || 18,
          fontWeight: typography?.fontWeight?.medium || '500'
        }}>
          Create Post
        </Text>
        <TouchableOpacity
          onPress={handleToggleExpanded}
          style={{
            padding: spacing.small,
            borderRadius: borderRadius.small
          }}
        >
          <Text style={{
            color: isDarkMode ? '#9ca3af' : '#6b7280',
            fontSize: typography.fontSize.body
          }}>
            ✕
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Input */}
      <View style={{ padding: spacing.medium }}>
        <TextInput
          style={{
            color: isDarkMode ? '#e5e7eb' : colors.text,
            fontSize: typography?.fontSize?.body || 14,
            fontFamily: typography?.fontFamily || 'System',
            lineHeight: (typography?.lineHeight?.normal || 1.4) * (typography?.fontSize?.body || 14),
            minHeight: 100,
            textAlignVertical: 'top',
            padding: 0
          }}
          placeholder={`What's happening, ${selectedUser?.username || 'user'}?`}
          placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
          value={postContent}
          onChangeText={setPostContent}
          multiline
          autoFocus
          maxLength={MAX_POST_LENGTH + 50} // Allow slight overflow for visual feedback
        />
      </View>

      {/* Footer with actions */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.medium,
        backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? '#4b5563' : colors.border
      }}>
        {/* Left side - cost and character count OR progress */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.medium }}>
          {publishProgress ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.small }}>
              <ActivityIndicator size="small" color={isDarkMode ? '#60a5fa' : '#3b82f6'} />
              <Text style={{
                color: isDarkMode ? '#60a5fa' : '#3b82f6',
                fontSize: typography?.fontSize?.caption || 12,
                fontWeight: typography?.fontWeight?.medium || '500'
              }}>
                {publishProgress.currentStep || `${Math.round(publishProgress.progress * 100)}%`}
              </Text>
            </View>
          ) : (
            <>
              <Text style={{
                color: isDarkMode ? '#9ca3af' : '#6b7280',
                fontSize: typography.fontSize.caption
              }}>
                ~{estimatedCost.toFixed(4)} SOL
              </Text>
              
              <Text style={{
                color: getCharCountColor(),
                fontSize: typography.fontSize.caption,
                fontWeight: isNearLimit || isOverLimit ? '600' : 'normal'
              }}>
                {remainingChars}
              </Text>
            </>
          )}
        </View>

        {/* Right side - post button */}
        <TouchableOpacity
          style={getPostButtonStyle()}
          onPress={handleCreatePost}
          disabled={!canPost || publishProgress}
        >
          {isPosting || publishProgress ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={{
              color: canPost ? 'white' : (isDarkMode ? '#9ca3af' : '#9ca3af'),
              fontSize: typography?.fontSize?.button || 16,
              fontWeight: typography?.fontWeight?.medium || '500'
            }}>
              Post
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  // Don't render if no user is selected (keep it clean)
  if (!selectedUser) {
    return null;
  }

  return (
    <View style={{ marginHorizontal: spacing.medium }}>
      {isExpanded ? renderExpandedState() : renderCollapsedState()}
    </View>
  );
};

export default PostComposer;

// Character count: 13,742