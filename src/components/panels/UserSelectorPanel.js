// src/components/panels/UserSelectorPanel.js
// Path: src/components/panels/UserSelectorPanel.js

import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  Animated, 
  Dimensions,
  ActivityIndicator 
} from 'react-native';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { userTransactionReader } from '../../services/blockchain/UserTransactionReader';
import { colors, spacing, typography } from '../../styles/tokens';
import userRegistry from '../../data/user-registry.json';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const UserSelectorPanel = ({ 
  visible = false,
  selectedUser = null,
  onUserSelect,
  onClose,
  isDarkMode = false 
}) => {
  const slideAnim = useRef(new Animated.Value(-screenWidth * 0.85)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const [users, setUsers] = useState([]);
  const [loadingUser, setLoadingUser] = useState(false);
  const [error, setError] = useState(null);

  const PANEL_WIDTH = screenWidth * 0.85;
  const BOTTOM_BAR_HEIGHT = 80;

  // Solana connection for getting user balances
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  useEffect(() => {
    if (visible) {
      loadUsers();
      // Slide in from left
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide out to left
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -PANEL_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const loadUsers = async () => {
    try {
      console.log('📋 Loading users from registry...');
      setError(null);
      
      if (userRegistry && userRegistry.users && userRegistry.users.length > 0) {
        setUsers(userRegistry.users);
        console.log('✅ Loaded users:', userRegistry.users.length);
      } else {
        setError('No users found in registry. Please create test users first.');
      }
    } catch (error) {
      console.error('❌ Error loading users:', error);
      setError('Failed to load users from registry');
    }
  };

  const handleUserSelect = async (user) => {
    try {
      console.log('👤 Selecting user:', user.username);
      setLoadingUser(true);
      setError(null);
      
      // Fetch user data from blockchain transaction
      const userData = await userTransactionReader.fetchUserDataFromTransaction(
        user.transactionHash
      );
      
      if (userData) {
        console.log('✅ User data loaded:', userData);
        
        // Load the user's wallet balance
        const freshBalance = await connection.getBalance(new PublicKey(user.publicKey));
        const freshBalanceSOL = freshBalance / LAMPORTS_PER_SOL;

        // Call the parent callback with all user data
        if (onUserSelect) {
          onUserSelect(user, userData, freshBalanceSOL);
        }
        
        // Close the panel
        onClose();
      } else {
        setError('Failed to fetch user data from blockchain');
        console.error('❌ No user data returned for:', user.username);
      }
      
    } catch (error) {
      console.error('❌ Error selecting user:', error);
      setError('Failed to load user data');
    } finally {
      setLoadingUser(false);
    }
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={[
        panelStyles.userItem,
        selectedUser?.username === item.username && panelStyles.selectedUserItem,
        { backgroundColor: isDarkMode ? '#374151' : '#f9fafb' }
      ]}
      onPress={() => handleUserSelect(item)}
      activeOpacity={0.7}
      disabled={loadingUser}
    >
      <View style={panelStyles.userAvatar}>
        <Text style={panelStyles.userAvatarText}>
          {item.username?.charAt(0).toUpperCase() || '?'}
        </Text>
      </View>
      
      <View style={panelStyles.userItemContent}>
        <Text style={[
          panelStyles.userItemName,
          { color: isDarkMode ? '#e5e7eb' : '#111827' }
        ]}>
          {item.username}
        </Text>
        <Text style={[
          panelStyles.userItemKey,
          { color: isDarkMode ? '#9ca3af' : '#6b7280' }
        ]}>
          {item.publicKey.substring(0, 8)}...
        </Text>
      </View>
      
      {selectedUser?.username === item.username && (
        <Text style={panelStyles.checkmark}>✓</Text>
      )}
    </TouchableOpacity>
  );

  const panelStyles = {
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 999,
    },
    panel: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: PANEL_WIDTH,
      height: screenHeight - BOTTOM_BAR_HEIGHT,
      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
      borderTopRightRadius: 16,
      borderBottomRightRadius: 16,
      zIndex: 1000,
      shadowColor: '#000',
      shadowOffset: {
        width: 2,
        height: 0,
      },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 5,
    },
    header: {
      paddingTop: insets.top + spacing.medium,
      paddingHorizontal: spacing.large,
      paddingBottom: spacing.medium,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#374151' : '#e5e7eb',
    },
    headerTitle: {
      fontSize: typography.fontSize.large,
      fontWeight: typography.fontWeight.bold,
      color: isDarkMode ? '#e5e7eb' : '#111827',
      marginBottom: spacing.small,
    },
    closeButton: {
      position: 'absolute',
      top: insets.top + spacing.medium,
      right: spacing.large,
      padding: spacing.small,
    },
    closeButtonText: {
      fontSize: 20,
      color: isDarkMode ? '#9ca3af' : '#6b7280',
    },
    userList: {
      flex: 1,
      paddingHorizontal: spacing.medium,
    },
    userItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.medium,
      marginVertical: spacing.small,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
    },
    selectedUserItem: {
      backgroundColor: isDarkMode ? '#3b82f6' : colors.primary,
      borderColor: isDarkMode ? '#3b82f6' : colors.primary,
    },
    userAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: isDarkMode ? '#3b82f6' : colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.medium,
    },
    userAvatarText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    userItemContent: {
      flex: 1,
    },
    userItemName: {
      fontSize: typography.fontSize.medium,
      fontWeight: typography.fontWeight.bold,
      marginBottom: spacing.small / 2,
    },
    userItemKey: {
      fontSize: typography.fontSize.small,
    },
    checkmark: {
      fontSize: 20,
      color: '#ffffff',
      fontWeight: 'bold',
    },
    separator: {
      height: 1,
      backgroundColor: isDarkMode ? '#374151' : '#e5e7eb',
      marginHorizontal: spacing.medium,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: spacing.xlarge,
    },
    emptyText: {
      fontSize: typography.fontSize.medium,
      color: isDarkMode ? '#9ca3af' : '#6b7280',
      textAlign: 'center',
    },
    errorContainer: {
      paddingHorizontal: spacing.large,
      paddingVertical: spacing.medium,
    },
    errorText: {
      fontSize: typography.fontSize.medium,
      color: '#ef4444',
      textAlign: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  };

  if (!visible) return null;

  return (
    <>
      <Animated.View 
        style={[panelStyles.overlay, { opacity: overlayAnim }]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <TouchableOpacity 
          style={{ flex: 1 }} 
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>
      
      <Animated.View 
        style={[
          panelStyles.panel,
          { transform: [{ translateX: slideAnim }] }
        ]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <View style={panelStyles.header}>
          <Text style={panelStyles.headerTitle}>Select User</Text>
          <TouchableOpacity 
            style={panelStyles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={panelStyles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={panelStyles.errorContainer}>
            <Text style={panelStyles.errorText}>{error}</Text>
          </View>
        ) : loadingUser ? (
          <View style={panelStyles.loadingContainer}>
            <ActivityIndicator 
              size="large" 
              color={isDarkMode ? '#3b82f6' : colors.primary} 
            />
            <Text style={[
              panelStyles.emptyText,
              { marginTop: spacing.medium }
            ]}>
              Loading user data...
            </Text>
          </View>
        ) : (
          <FlatList
            data={users}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.publicKey}
            style={panelStyles.userList}
            ItemSeparatorComponent={() => (
              <View style={panelStyles.separator} />
            )}
            ListEmptyComponent={() => (
              <View style={panelStyles.emptyContainer}>
                <Text style={panelStyles.emptyText}>
                  No users found. Please create test users first.
                </Text>
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </Animated.View>
    </>
  );
};

// Character count: 8889