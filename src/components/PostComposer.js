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
import { PostHeaderService } from '../services/feed/PostHeaderService';
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
 * - Uses PublishingService for blockchain publishing
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
  const { walletService } = useWallet();
  
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
  const isNearLimit = remainingChars <= 20 && remainingChars > 0;
  const canPost = postContent.trim().length > 0 && !isOverLimit && selectedUser && !isPosting;

  /**
   * Set up publishing service when user is selected
   */
  useEffect(() => {
    const setupPublishingService = async () => {
      console.log('🔵 setupPublishingService called');
      console.log('🔵 selectedUser:', selectedUser?.username);
      
      if (selectedUser) {
        try {
          console.log('✅ Setting up publishing service for:', selectedUser.username);
          
          // Create and configure publishing service
          console.log('🔵 Creating new PublishingService...');
          const service = new PublishingService();
          console.log('🔵 PublishingService created:', !!service);
          
          // ✅ FIX: Create Alice's individual wallet instead of using system wallet
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
          
          console.log('🔵 Setting Alice\'s wallet on service...');
          service.setWallet(userWallet);
          console.log('🔵 Alice\'s wallet set successfully');
          
          console.log('🔵 Setting publishingService state...');
          setPublishingService(service);
          console.log('✅ Publishing service setup complete for:', selectedUser.username);
          console.log('💰 Alice will pay for her own posts with wallet:', selectedUser.publicKey);
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
   * Estimate cost for current post content
   */
  useEffect(() => {
    const updateCostEstimate = () => {
      if (postContent.trim().length > 0 && publishingService) {
        try {
          // ✅ FIX: Use estimatePublishing instead of getContentStats for cost estimation
          // estimatePublishing only needs the text content, not a full content object
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
   * Handle post creation using existing PublishingService infrastructure
   */
  const handleCreatePost = async () => {
    console.log('🔵 handleCreatePost called');
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
      
      // ✅ FIX #2: Create complete content object with all required fields
      const contentData = {
        content: postContent.trim(),
        title: `Post by ${selectedUser.username}`,
        filename: `${selectedUser.username}_post_${Date.now()}.txt`,
        size: postContent.trim().length,
        type: 'text/plain',
        authorName: selectedUser.username,
        socialPost: true
      };
      
      console.log('🔵 Content data created:', contentData);
      console.log('🔵 Showing confirmation dialog...');
      
      // Show confirmation dialog with cost
      Alert.alert(
        '🚀 Publish Post',
        `"${postContent.trim().substring(0, 50)}${postContent.length > 50 ? '...' : ''}"\n\nCost: ${estimatedCost.toFixed(5)} SOL\nFrom: ${selectedUser.username}'s wallet\n\nThis will be permanently stored on the blockchain.`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => {
            console.log('🔵 User cancelled post');
            setIsPosting(false);
          }},
          { 
            text: 'Publish', 
            onPress: async () => {
              try {
                console.log('🚀 User confirmed - Publishing post using existing PublishingService...');
                console.log('🔵 Publishing service type:', typeof publishingService);
                console.log('🔵 Publishing service methods:', Object.getOwnPropertyNames(publishingService));
                
                // ✅ ADD: Debug which wallet the publishing service will actually use
                const currentWallet = publishingService.getCurrentWallet();
                console.log('🔍 PublishingService current wallet:', !!currentWallet);
                if (currentWallet && currentWallet.getWalletKeypair) {
                  const keypair = currentWallet.getWalletKeypair();
                  console.log('🔍 Wallet keypair public key:', keypair.publicKey.toBase58());
                  console.log('🔍 Expected Alice key:', selectedUser.publicKey);
                  console.log('🔍 Keys match:', keypair.publicKey.toBase58() === selectedUser.publicKey);
                }
                
                // ✅ FIX #3: Use correct PublishingService method signature
                // publishContent(content, onProgress) - only 2 parameters
                const result = await publishingService.publishContent(
                  contentData,
                  (progress) => {
                    console.log('📊 Publishing progress:', progress);
                    setPublishProgress(progress);
                  }
                );
                
                // Success!
                console.log('✅ Post published successfully using existing service:', result);

                await PostHeaderService.updateUserHead(
                    selectedUser.publicKey,
                    selectedUser.username,
                    result.transactionIds[0]
                );
                
                Alert.alert(
                  '🎉 Post Published!',
                  `Your post has been permanently stored on the blockchain!\n\nScroll: ${result.contentId}\nCost: ${result.totalCost?.toFixed(5) || estimatedCost.toFixed(5)} SOL`,
                  [{ text: 'OK' }]
                );
                
                // Clear the composer
                setPostContent('');
                setIsExpanded(false);
                setPublishProgress(null);
                Keyboard.dismiss();
                
                // ✅ FIX: Notify parent to refresh Alice's balance since she paid for this post
                if (onPostCreate) {
                  onPostCreate({
                    success: true,
                    result,
                    shouldRefreshBalance: true, // Signal that Alice's balance changed
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
                
                // Notify parent component of failure
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
        backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
        borderColor: isDarkMode ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        borderRadius: borderRadius.large,
        paddingHorizontal: spacing.medium,
        paddingVertical: spacing.medium,
        marginVertical: spacing.small
      }}
      onPress={handleToggleExpanded}
      activeOpacity={0.7}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* User avatar placeholder */}
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: isDarkMode ? '#4b5563' : '#d1d5db',
          marginRight: spacing.medium,
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Text style={{
            color: isDarkMode ? '#f3f4f6' : '#374151',
            fontSize: 16,
            fontWeight: '600'
          }}>
            {selectedUser?.username?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
        
        {/* Prompt text */}
        <Text style={{
          color: isDarkMode ? '#9ca3af' : '#6b7280',
          fontSize: typography?.fontSize?.body || 16,
          flex: 1
        }}>
          What's happening?
        </Text>
        
        {/* Estimated cost indicator */}
        <Text style={{
          color: isDarkMode ? '#60a5fa' : '#3b82f6',
          fontSize: typography?.fontSize?.caption || 12,
          fontWeight: '500'
        }}>
          ~{estimatedCost.toFixed(5)} SOL
        </Text>
      </View>
    </TouchableOpacity>
  );

  /**
   * Render expanded state (full composer)
   */
  const renderExpandedState = () => (
    <View style={{
      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
      borderColor: isDarkMode ? '#374151' : '#e5e7eb',
      borderWidth: 1,
      borderRadius: borderRadius.large,
      padding: spacing.medium,
      marginVertical: spacing.small,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3
    }}>
      {/* Header with user info and close button */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.medium
      }}>
        {/* User avatar */}
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: isDarkMode ? '#4b5563' : '#d1d5db',
          marginRight: spacing.medium,
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Text style={{
            color: isDarkMode ? '#f3f4f6' : '#374151',
            fontSize: 16,
            fontWeight: '600'
          }}>
            {selectedUser?.username?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
        
        {/* User info */}
        <View style={{ flex: 1 }}>
          <Text style={{
            color: isDarkMode ? '#f3f4f6' : '#111827',
            fontSize: typography?.fontSize?.body || 16,
            fontWeight: '600'
          }}>
            {selectedUser?.username || 'Unknown User'}
          </Text>
          <Text style={{
            color: isDarkMode ? '#9ca3af' : '#6b7280',
            fontSize: typography?.fontSize?.caption || 12
          }}>
            Balance: {userWalletBalance.toFixed(5)} SOL
          </Text>
        </View>
        
        {/* Close button */}
        <TouchableOpacity
          onPress={handleToggleExpanded}
          style={{
            padding: spacing.small,
            borderRadius: borderRadius.small
          }}
        >
          <Text style={{
            color: isDarkMode ? '#9ca3af' : '#6b7280',
            fontSize: 18,
            fontWeight: '600'
          }}>
            ×
          </Text>
        </TouchableOpacity>
      </View>

      {/* Text input */}
      <TextInput
        style={{
          fontSize: typography?.fontSize?.body || 16,
          color: isDarkMode ? '#f3f4f6' : '#111827',
          textAlignVertical: 'top',
          paddingHorizontal: 0,
          paddingVertical: spacing.small,
          minHeight: 100,
          maxHeight: 200
        }}
        multiline
        placeholder="What's happening?"
        placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
        value={postContent}
        onChangeText={setPostContent}
        maxLength={MAX_POST_LENGTH + 50} // Allow slight overrun for visual feedback
        autoFocus={true}
        textAlign="left"
      />

      {/* Footer with stats and post button */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: spacing.medium,
        paddingTop: spacing.medium,
        borderTopColor: isDarkMode ? '#374151' : '#e5e7eb',
        borderTopWidth: 1
      }}>
        {/* Left side - cost and character count */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.medium
        }}>
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
                ~{estimatedCost.toFixed(5)} SOL
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

// Character count: 13,247