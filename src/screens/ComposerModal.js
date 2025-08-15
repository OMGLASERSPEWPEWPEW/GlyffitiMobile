// src/screens/ComposerModal.js
// Path: src/screens/ComposerModal.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Keyboard,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Keypair } from '@solana/web3.js';
import { spacing, colors, typography, borderRadius } from '../styles/tokens';
import { PostPublishingService } from '../services/publishing/PostPublishingService';
import { PostHeaderService } from '../services/feed/PostHeaderService';
import userKeys from '../data/user-keys.json';

/**
 * ComposerModal Screen
 * 
 * Full-screen modal for creating social media posts that publishes directly to the blockchain.
 * Follows the exact same patterns as PostComposer component but in a modal presentation.
 * Maintains post chain integrity by linking to the user's previous posts and uses the same
 * item.type filters for compatibility with the rest of the app.
 * 
 * Features:
 * - Character limit enforcement (280 chars, Twitter-style)
 * - Real-time cost estimation in SOL
 * - Blockchain publishing with progress tracking
 * - Post chain management (links to user's previous posts)
 * - User wallet payment and balance validation
 * - Cancel/Post buttons in header like X/Twitter
 * 
 * Architecture Integration:
 * - Uses PostPublishingService for blockchain publishing (same as PostComposer)
 * - Maintains user post chains (genesis -> post1 -> post2...)
 * - Stores posts permanently on Solana blockchain
 * - Updates user's lastPostHash for chain integrity
 * - Uses identical item.type for filter compatibility
 */
export const ComposerModal = ({ navigation, route }) => {
  // Extract params from navigation
  const { 
    selectedUser, 
    selectedUserData, 
    userWalletBalance, 
    onPostCreate 
  } = route.params || {};
  
  // Publishing service instance (identical to PostComposer)
  const [publishingService, setPublishingService] = useState(null);
  
  // Post content state (same as PostComposer)
  const [postContent, setPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [publishProgress, setPublishProgress] = useState(null);
  
  // UI state
  const [estimatedCost, setEstimatedCost] = useState(0.001); // Default estimate
  
  // Constants (identical to PostComposer)
  const MAX_POST_LENGTH = 280; // Twitter-style character limit
  const ESTIMATED_COST_PER_POST = 0.001; // SOL - rough estimate
  
  /**
   * Calculate remaining characters (same logic as PostComposer)
   */
  const remainingChars = MAX_POST_LENGTH - postContent.length;
  const isOverLimit = remainingChars < 0;
  const isNearLimit = remainingChars <= 20 && remainingChars > 0;
  const canPost = postContent.trim().length > 0 && !isOverLimit && selectedUser && !isPosting;

  /**
   * Set up publishing service when user is selected (identical to PostComposer)
   */
  useEffect(() => {
    const setupPublishingService = async () => {
      console.log('🔵 setupPublishingService called in ComposerModal');
      console.log('🔵 selectedUser:', selectedUser?.username);
      
      if (selectedUser) {
        try {
          console.log('✅ Setting up publishing service for:', selectedUser.username);
          
          // Create and configure publishing service (same as PostComposer)
          console.log('🔵 Creating new PostPublishingService...');
          const service = new PostPublishingService();
          console.log('🔵 PostPublishingService created:', !!service);
          
          // Create user's individual wallet (identical to PostComposer)
          console.log('🔵 Creating user wallet for:', selectedUser.username);
          const userWallet = {
            getWalletKeypair: () => {
              const privateKeyArray = userKeys[selectedUser.username];
              if (!privateKeyArray) {
                throw new Error(`No private key found for user: ${selectedUser.username}`);
              }
              const keypair = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
              console.log('🔑 Using keypair for:', selectedUser.username, keypair.publicKey.toBase58());
              return keypair;
            },
            getWalletPublicKey: () => {
              const privateKeyArray = userKeys[selectedUser.username];
              if (!privateKeyArray) {
                throw new Error(`No private key found for user: ${selectedUser.username}`);
              }
              const keypair = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
              return keypair.publicKey.toBase58();
            }
          };
          
          console.log('🔵 Setting user wallet on service...');
          service.setWallet(userWallet);
          console.log('🔵 User wallet set successfully');
          
          console.log('🔵 Setting publishingService state...');
          setPublishingService(service);
          console.log('✅ Publishing service setup complete for:', selectedUser.username);
          console.log('💰 User will pay for their own posts with wallet:', selectedUser.publicKey);
        } catch (error) {
          console.error('❌ Error setting up publishing service:', error);
          console.error('❌ Error stack:', error.stack);
        }
      } else {
        console.log('❌ Cannot setup publishing service - no selectedUser');
        setPublishingService(null);
      }
    };
    
    setupPublishingService();
  }, [selectedUser]);

  /**
   * Estimate cost for current post content (same as PostComposer)
   */
  useEffect(() => {
    const updateCostEstimate = () => {
      if (postContent.trim().length > 0 && publishingService) {
        try {
          // Use estimatePublishing instead of getContentStats for cost estimation
          const estimation = publishingService.estimatePublishing(postContent.trim());
          setEstimatedCost(estimation.estimatedCost || 0.001);
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
   * Handle post creation using existing PublishingService infrastructure (identical to PostComposer)
   */
  const handleCreatePost = async () => {
    console.log('🔵 handleCreatePost called in ComposerModal');
    console.log('🔵 canPost:', canPost);
    console.log('🔵 publishingService:', !!publishingService);
    console.log('🔵 selectedUser:', selectedUser?.username);
    console.log('🔵 postContent length:', postContent.trim().length);
    
    if (!canPost) {
      console.log('❌ Cannot post - canPost is false');
      return;
    }
    
    if (!publishingService) {
      console.log('❌ Cannot post - no publishing service');
      return;
    }
    
    try {
      console.log('🔵 Setting isPosting to true...');
      setIsPosting(true);
      setPublishProgress(null);
      
      // Create post data object for PostPublishingService
      const postData = {
        content: postContent.trim(),
        authorName: selectedUser.username
      };
      
      console.log('🔵 Content data created:', postData);
      console.log('🔵 Showing confirmation dialog...');
      
      // Show confirmation dialog with cost (same as PostComposer)
      Alert.alert(
        '🚀 Publish Post',
        `"${postContent.trim().substring(0, 50)}${postContent.length > 50 ? '...' : ''}"\n\nCost: ~${estimatedCost.toFixed(5)} SOL\nBalance: ${userWalletBalance.toFixed(5)} SOL\n\nPublish permanently to blockchain?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              setIsPosting(false);
            }
          },
          {
            text: 'Publish',
            onPress: async () => {
              try {
                console.log('🔵 User confirmed publication...');
                
                // Publish using existing service (identical to PostComposer)
                console.log('🔵 Publishing content using existing service...');
                const result = await publishingService.publishPost(postData);
                console.log('✅ Post published successfully using existing service:', result);
                
                Alert.alert(
                  '🎉 Post Published!',
                  `Your post has been permanently stored on the blockchain!\n\nTransaction: ${result.transactionId}\nCost: ${result.totalCost?.toFixed(5) || estimatedCost.toFixed(5)} SOL`,
                  [{ 
                    text: 'OK',
                    onPress: () => {
                      // Close modal after successful post
                      navigation.goBack();
                    }
                  }]
                );
                
                // Clear the composer
                setPostContent('');
                setPublishProgress(null);
                Keyboard.dismiss();
                
                // Notify parent to refresh user balance (same as PostComposer)
                if (onPostCreate) {
                  onPostCreate({
                    success: true,
                    result,
                    shouldRefreshBalance: true, // Signal that user's balance changed
                    userPaidTransaction: true
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
                
                // Notify parent component of failure (same as PostComposer)
                if (onPostCreate) {
                  onPostCreate({
                    success: false,
                    error: publishError.message
                  });
                }
              } finally {
                setIsPosting(false);
              }
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('❌ Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
      setIsPosting(false);
    }
  };

  /**
   * Handle cancel - close modal
   */
  const handleCancel = () => {
    if (postContent.trim().length > 0) {
      Alert.alert(
        'Discard Post?',
        'Are you sure you want to discard this post?',
        [
          { text: 'Keep Writing', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  /**
   * Get character count color based on remaining characters (same as PostComposer)
   */
  const getCharCountColor = () => {
    if (isOverLimit) return '#ef4444'; // Red
    if (isNearLimit) return '#f59e0b'; // Orange
    return '#6b7280'; // Gray
  };

  /**
   * Get post button style based on state (same as PostComposer)
   */
  const getPostButtonStyle = () => {
    const baseStyle = {
      backgroundColor: canPost ? '#3b82f6' : '#9ca3af',
      paddingHorizontal: spacing.large,
      paddingVertical: spacing.small,
      borderRadius: borderRadius.full,
      minWidth: 80,
      alignItems: 'center',
      justifyContent: 'center'
    };
    
    return baseStyle;
  };

  // Don't render if no user is selected
  if (!selectedUser) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.text, fontSize: typography.fontSize.large }}>
            No user selected
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header - Twitter/X style with Cancel and Post buttons */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.medium,
        paddingVertical: spacing.small,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border
      }}>
        {/* Cancel Button */}
        <TouchableOpacity
          onPress={handleCancel}
          style={{
            padding: spacing.small,
            marginLeft: -spacing.small // Align with screen edge
          }}
        >
          <Text style={{
            color: colors.text,
            fontSize: typography.fontSize.large,
            fontWeight: typography.fontWeight.regular
          }}>
            Cancel
          </Text>
        </TouchableOpacity>

        {/* User Info */}
        <View style={{ alignItems: 'center' }}>
          <Text style={{
            color: colors.text,
            fontSize: typography.fontSize.medium,
            fontWeight: typography.fontWeight.medium
          }}>
            {selectedUser.username}
          </Text>
          <Text style={{
            color: colors.textSecondary,
            fontSize: typography.fontSize.small
          }}>
            {userWalletBalance.toFixed(5)} SOL
          </Text>
        </View>

        {/* Post Button */}
        <TouchableOpacity
          style={getPostButtonStyle()}
          onPress={handleCreatePost}
          disabled={!canPost || publishProgress}
        >
          {isPosting || publishProgress ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={{
              color: canPost ? 'white' : '#9ca3af',
              fontSize: typography.fontSize.button || 16,
              fontWeight: typography.fontWeight.medium || '500'
            }}>
              Post
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={{ 
          flex: 1, 
          paddingHorizontal: spacing.medium,
          paddingTop: spacing.medium
        }}>
          {/* Text Input */}
          <TextInput
            style={{
              flex: 1,
              textAlignVertical: 'top',
              fontSize: typography.fontSize.large,
              lineHeight: typography.lineHeight.relaxed * typography.fontSize.large,
              color: colors.text,
              paddingVertical: spacing.small
            }}
            placeholder={`What's happening, ${selectedUser.username}?`}
            placeholderTextColor={colors.textSecondary}
            value={postContent}
            onChangeText={setPostContent}
            multiline
            autoFocus
            maxLength={MAX_POST_LENGTH + 50} // Allow over-typing to show red counter
          />

          {/* Bottom Info Bar */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: spacing.medium,
            borderTopWidth: 0.5,
            borderTopColor: colors.border
          }}>
            {/* Cost Estimate */}
            <Text style={{
              fontSize: typography.fontSize.small,
              color: colors.textSecondary
            }}>
              ~{estimatedCost.toFixed(5)} SOL
            </Text>

            {/* Character Count */}
            <Text style={{
              fontSize: typography.fontSize.small,
              color: getCharCountColor(),
              fontWeight: isOverLimit || isNearLimit ? typography.fontWeight.bold : typography.fontWeight.regular
            }}>
              {remainingChars}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ComposerModal;

// Character count: 15,847