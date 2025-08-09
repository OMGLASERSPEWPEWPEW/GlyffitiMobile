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
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { userTransactionReader } from '../services/blockchain/UserTransactionReader';
import { useWallet } from '../hooks/useWallet';
import { WalletSection } from './publishing/WalletSection';
import userRegistry from '../data/user-registry.json';
import { userSelectorStyles } from '../styles/userSelectorStyles';
import { WalletUpgradePrompt } from './WalletUpgradePrompt';

/**
 * UserSelector Component
 * Displays current user and allows switching between users
 * Fetches user data directly from blockchain transactions
 * Shows each user's individual wallet balance
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
  const [loadingUserBalance, setLoadingUserBalance] = useState(false);
  
  // Error state
  const [error, setError] = useState(null);
  
  // User wallet state
  const [userWalletBalance, setUserWalletBalance] = useState(0);
  const [userWalletAddress, setUserWalletAddress] = useState('');
  
  // UI state
  const [showUserData, setShowUserData] = useState(false); // Collapsed by default
  
  // System wallet hook (for comparison/development)
  const {
    walletStatus: systemWalletStatus,
    walletAddress: systemWalletAddress,
    walletBalance: systemWalletBalance,
    isRequestingAirdrop: systemIsRequestingAirdrop,
    showWalletUnlock: systemShowWalletUnlock,
    password: systemPassword,
    isLoadingWallet: systemIsLoadingWallet,
    setPassword: systemSetPassword,
    setShowWalletUnlock: systemSetShowWalletUnlock,
    handleRequestAirdrop: systemHandleRequestAirdrop,
    handleWalletAction: systemHandleWalletAction,
    handleMigration: systemHandleMigration,
    createPersonalWallet
  } = useWallet();

  // Solana connection for getting user balances
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  /**
   * Initialize component with users from registry
   */
  useEffect(() => {
    loadUsers();
  }, []);

  /**
 * Load user's wallet balance from their public key (from registry)
 */
const loadUserWalletBalance = async (user) => {
  if (!user || !user.publicKey) {
    console.warn('⚠️ No user or public key found');
    setUserWalletBalance(0);
    setUserWalletAddress('Not available');
    return;
  }

  try {
    setLoadingUserBalance(true);
    
    console.log(`💰 Getting balance for ${user.username}'s wallet: ${user.publicKey}`);
    
    // Get balance using the publicKey directly from registry
    const lamports = await connection.getBalance(new PublicKey(user.publicKey));
    const sol = lamports / LAMPORTS_PER_SOL;
    
    console.log(`💰 ${user.username}'s Balance: ${sol.toFixed(4)} SOL`);
    
    setUserWalletBalance(sol);
    setUserWalletAddress(user.publicKey); // Use registry publicKey
    
  } catch (error) {
    console.error('❌ Error loading user wallet balance:', error);
    setUserWalletBalance(0);
    setUserWalletAddress('Error loading address');
  } finally {
    setLoadingUserBalance(false);
  }
};

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
      
      // Reset wallet data
      setUserWalletBalance(0);
      setUserWalletAddress('');
      
      // Fetch user data from blockchain transaction
      const userData = await userTransactionReader.fetchUserDataFromTransaction(
        user.transactionHash
      );
      
      if (userData) {
        setSelectedUserData(userData);
        console.log('✅ User data loaded:', userData);
        
        // Load the user's wallet balance
        await loadUserWalletBalance(user);
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

        {/* Collapsible User Data Display */}
      {selectedUser && (
        <View style={[
          userSelectorStyles.userDataContainer,
          { backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb' }
        ]}>
          {/* Collapsible Header */}
          <TouchableOpacity
            style={userSelectorStyles.dataRow}
            onPress={() => setShowUserData(!showUserData)}
            activeOpacity={0.7}
          >
            <Text style={[
              userSelectorStyles.dataLabel,
              { 
                color: isDarkMode ? '#9ca3af' : '#6b7280',
                fontWeight: 'bold'
              }
            ]}>
              Genesis Block Data
            </Text>
            <Text style={[
              userSelectorStyles.dataValue,
              { color: isDarkMode ? '#9ca3af' : '#6b7280' }
            ]}>
              {showUserData ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>

          {/* Expandable Content */}
          {showUserData && (
            <>
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
            </>
          )}
        </View>
      )}


      {/* User's Personal Wallet Display */}
      {selectedUser && (
        <WalletSection 
          walletStatus="unlocked" // Always show as unlocked for user wallets
          walletAddress={userWalletAddress}
          walletBalance={userWalletBalance}
          isRequestingAirdrop={false}
          showWalletUnlock={false}
          password=""
          isLoading={loadingUserBalance}
          setPassword={() => {}}
          setShowWalletUnlock={() => {}}
          handleRequestAirdrop={() => Alert.alert('Info', `Send SOL directly to ${selectedUser.username}'s address: ${userWalletAddress}`)}
          handleWalletAction={() => {}}
          handleMigration={() => {}}
          isDarkMode={isDarkMode}
          customTitle={`💳 ${selectedUser.username}'s Wallet`} // Custom title for each user
          bypassLock={true} // Always show wallet info
        />
      )}

      {/* System Wallet Display (for development/comparison) */}
      <WalletSection 
        walletStatus={systemWalletStatus}
        walletAddress={systemWalletAddress}
        walletBalance={systemWalletBalance}
        isRequestingAirdrop={systemIsRequestingAirdrop}
        showWalletUnlock={systemShowWalletUnlock}
        password={systemPassword}
        isLoading={systemIsLoadingWallet}
        setPassword={systemSetPassword}
        setShowWalletUnlock={systemSetShowWalletUnlock}
        handleRequestAirdrop={systemHandleRequestAirdrop}
        handleWalletAction={systemHandleWalletAction}
        handleMigration={systemHandleMigration}
        isDarkMode={isDarkMode}
        customTitle="💳 The Glyffiti Wallet" // System wallet
        bypassLock={false} // Use normal lock behavior for system wallet
      />


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

// Character count: 11,589