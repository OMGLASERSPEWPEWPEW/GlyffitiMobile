// src/components/UserSelector.js
// Path: src/components/UserSelector.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import { userTransactionReader } from '../services/blockchain/UserTransactionReader';
import { useWallet } from '../hooks/useWallet';
import { WalletSection } from './publishing/WalletSection';
import userRegistry from '../data/user-registry.json';
import { userSelectorStyles } from '../styles/userSelectorStyles';
import { WalletUpgradePrompt } from './WalletUpgradePrompt';
// Add a state: const [showUpgrade, setShowUpgrade] = useState(false);

/**
 * UserSelector Component
 * Displays current user and allows switching between users
 * Fetches user data directly from blockchain transactions
 * Now includes wallet information using existing WalletSection component
 */
export const UserSelector = ({ isDarkMode = false }) => {
  
  // State for selected user
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserData, setSelectedUserData] = useState(null);
  
  // State for user list modal
  const [modalVisible, setModalVisible] = useState(false);
  const [users, setUsers] = useState([]);
  
  // Loading states
  const [loadingUser, setLoadingUser] = useState(false);
  const [loadingUserData, setLoadingUserData] = useState(false);
  
  // Error state
  const [error, setError] = useState(null);

  const [showUpgrade, setShowUpgrade] = useState(false); 
  // Use existing wallet hook - no need to recreate anything
  const {
    walletStatus,
    walletAddress,
    walletBalance,
    isRequestingAirdrop,
    showWalletUnlock,
    password,
    isLoadingWallet,
    setPassword,
    setShowWalletUnlock,
    handleRequestAirdrop,
    handleWalletAction,
    handleMigration
  } = useWallet();

  /**
   * Initialize component with users from registry
   */
  useEffect(() => {
    loadUsers();
  }, []);

  /**
   * Load users from the registry file
   */
  const loadUsers = () => {
    try {
      console.log('📋 Loading users from registry...');
      
      // Get users from the imported registry
      if (userRegistry && userRegistry.users) {
        setUsers(userRegistry.users);
        
        // Select first user by default if available
        if (userRegistry.users.length > 0 && !selectedUser) {
          handleUserSelect(userRegistry.users[0]);
        }
      } else {
        console.warn('⚠️ No users found in registry');
        setError('No users found. Please create test users first.');
      }
    } catch (error) {
      console.error('❌ Error loading users:', error);
      setError('Failed to load users from registry');
    }
  };

  /**
   * Handle user selection
   * @param {Object} user - User object from registry
   */
  const handleUserSelect = async (user) => {
    try {
      console.log('👤 Selecting user:', user.username);
      setLoadingUserData(true);
      setError(null);
      
      // Set the selected user
      setSelectedUser(user);
      setModalVisible(false);
      
      // Fetch user data from blockchain transaction
      const userData = await userTransactionReader.fetchUserDataFromTransaction(
        user.transactionHash
      );
      
      if (userData) {
        setSelectedUserData(userData);
        console.log('✅ User data loaded:', userData);
      } else {
        setError('Failed to fetch user data from blockchain');
        console.error('❌ No user data returned for:', user.username);
      }
      
    } catch (error) {
      console.error('❌ Error selecting user:', error);
      setError('Failed to load user data');
    } finally {
      setLoadingUserData(false);
    }
  };

  /**
   * Format timestamp for display
   * @param {number} timestamp - Unix timestamp
   * @returns {string} Formatted date string
   */
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  /**
   * Render user item in the selection list
   */
  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={[
        userSelectorStyles.userItem,
        selectedUser?.username === item.username && userSelectorStyles.selectedUserItem,
        { backgroundColor: isDarkMode ? '#374151' : '#f9fafb' }
      ]}
      onPress={() => handleUserSelect(item)}
      activeOpacity={0.7}
    >
      <View style={userSelectorStyles.userItemContent}>
        <Text style={[
          userSelectorStyles.userItemName,
          { color: isDarkMode ? '#e5e7eb' : '#111827' }
        ]}>
          {item.username}
        </Text>
        <Text style={[
          userSelectorStyles.userItemKey,
          { color: isDarkMode ? '#9ca3af' : '#6b7280' }
        ]}>
          {item.publicKey.substring(0, 8)}...
        </Text>
      </View>
      {selectedUser?.username === item.username && (
        <Text style={userSelectorStyles.checkmark}>✓</Text>
      )}
    </TouchableOpacity>
  );

  /**
   * Render main component
   */
  return (
    <View style={userSelectorStyles.container}>
      {/* Current User Button */}
      <TouchableOpacity
        style={[
          userSelectorStyles.currentUserButton,
          { backgroundColor: isDarkMode ? '#374151' : '#ffffff' }
        ]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <View style={userSelectorStyles.currentUserContent}>
          <Text style={[
            userSelectorStyles.currentUserLabel,
            { color: isDarkMode ? '#9ca3af' : '#6b7280' }
          ]}>
            Current User
          </Text>
          <Text style={[
            userSelectorStyles.currentUserName,
            { color: isDarkMode ? '#e5e7eb' : '#111827' }
          ]}>
            {selectedUser ? selectedUser.username : 'Select User'}
          </Text>
          {selectedUser && (
            <Text style={[
              userSelectorStyles.currentUserKey,
              { color: isDarkMode ? '#9ca3af' : '#6b7280' }
            ]}>
              {selectedUser.publicKey.substring(0, 12)}...
            </Text>
          )}
        </View>
        <Text style={[
          userSelectorStyles.switchIcon,
          { color: isDarkMode ? '#9ca3af' : '#6b7280' }
        ]}>
          ▼
        </Text>
      </TouchableOpacity>

      {/* User Data Display */}
      {selectedUser && (
        <View style={[
          userSelectorStyles.userDataContainer,
          { backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb' }
        ]}>
          {loadingUserData ? (
            <View style={userSelectorStyles.loadingContainer}>
              <ActivityIndicator 
                size="small" 
                color={isDarkMode ? '#60a5fa' : '#3b82f6'} 
              />
              <Text style={[
                userSelectorStyles.loadingText,
                { color: isDarkMode ? '#9ca3af' : '#6b7280' }
              ]}>
                Fetching from blockchain...
              </Text>
            </View>
          ) : selectedUserData ? (
            <View style={userSelectorStyles.dataFields}>
              {/* Show all available user data fields dynamically */}
              {Object.entries(selectedUserData).map(([key, value]) => (
                <View key={key} style={userSelectorStyles.dataRow}>
                  <Text style={[
                    userSelectorStyles.dataLabel,
                    { color: isDarkMode ? '#9ca3af' : '#6b7280' }
                  ]}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}:
                  </Text>
                  <Text style={[
                    userSelectorStyles.dataValue,
                    { color: isDarkMode ? '#e5e7eb' : '#111827' }
                  ]}>
                    {key === 'ts' || key === 'createdAt' 
                      ? formatTimestamp(value)
                      : (value ? String(value) : 'N/A')
                    }
                  </Text>
                </View>
              ))}
            </View>
          ) : error ? (
            <View style={userSelectorStyles.errorContainer}>
              <Text style={[
                userSelectorStyles.errorText,
                { color: isDarkMode ? '#f87171' : '#dc2626' }
              ]}>
                {error}
              </Text>
              <TouchableOpacity
                style={userSelectorStyles.retryButton}
                onPress={() => handleUserSelect(selectedUser)}
              >
                <Text style={userSelectorStyles.retryButtonText}>
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      )}

 {/* Wallet Information Display - Use existing WalletSection component */}
      <WalletSection 
        walletStatus={walletStatus}
        walletAddress={walletAddress}
        walletBalance={walletBalance}
        isRequestingAirdrop={isRequestingAirdrop}
        showWalletUnlock={showWalletUnlock}
        password={password}
        isLoading={isLoadingWallet}
        setPassword={setPassword}
        setShowWalletUnlock={setShowWalletUnlock}
        handleRequestAirdrop={handleRequestAirdrop}
        handleWalletAction={handleWalletAction}
        handleMigration={handleMigration}
        isDarkMode={isDarkMode}
      />

      {/* Test button to show upgrade prompt */}
      <TouchableOpacity
        style={{
          backgroundColor: '#3b82f6',
          padding: 12,
          borderRadius: 8,
          marginTop: 16,
          alignItems: 'center'
        }}
        onPress={() => setShowUpgrade(true)}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          🧪 Test Wallet Upgrade
        </Text>
      </TouchableOpacity>

      {/* Wallet Upgrade Prompt */}
      {showUpgrade && (
        <WalletUpgradePrompt 
          onCreateWallet={(password) => {
            console.log('Create wallet with:', password);
            setShowUpgrade(false);
          }}
          onCancel={() => setShowUpgrade(false)}
          isDarkMode={isDarkMode}
        />
      )}

      {/* User Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={userSelectorStyles.modalOverlay}>
          <View style={[
            userSelectorStyles.modalContainer,
            { backgroundColor: isDarkMode ? '#1f2937' : '#ffffff' }
          ]}>
            <View style={userSelectorStyles.modalHeader}>
              <Text style={[
                userSelectorStyles.modalTitle,
                { color: isDarkMode ? '#e5e7eb' : '#111827' }
              ]}>
                Select User
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={userSelectorStyles.closeButton}
              >
                <Text style={[
                  userSelectorStyles.closeButtonText,
                  { color: isDarkMode ? '#9ca3af' : '#6b7280' }
                ]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={users}
              renderItem={renderUserItem}
              keyExtractor={(item) => item.publicKey}
              style={userSelectorStyles.userList}
              ItemSeparatorComponent={() => (
                <View style={[
                  userSelectorStyles.separator,
                  { backgroundColor: isDarkMode ? '#374151' : '#e5e7eb' }
                ]} />
              )}
              ListEmptyComponent={() => (
                <View style={userSelectorStyles.emptyContainer}>
                  <Text style={[
                    userSelectorStyles.emptyText,
                    { color: isDarkMode ? '#9ca3af' : '#6b7280' }
                  ]}>
                    No users found. Please create test users first.
                  </Text>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default UserSelector;

// Character count: 10,067