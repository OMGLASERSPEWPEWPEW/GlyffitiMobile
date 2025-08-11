// src/components/panels/UserPanel.js
// Path: src/components/panels/UserPanel.js

import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Animated, 
  Dimensions,
  StatusBar,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../styles/tokens';
import { useWallet } from '../../hooks/useWallet';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const UserPanel = ({ 
  visible = false,
  selectedUser = null,
  selectedUserData = null,
  userWalletBalance = 0,
  onClose,
  onUserBalanceUpdate,
  isDarkMode = false 
}) => {
  const slideAnim = useRef(new Animated.Value(-screenWidth * 0.85)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  // Get system wallet information
  const {
    walletStatus,
    walletAddress,
    walletBalance,
    isLoadingWallet,
    transferSOL
  } = useWallet();

  const PANEL_WIDTH = screenWidth * 0.85;
  const BOTTOM_BAR_HEIGHT = 80;

  const handleSendSOL = async () => {
    if (!selectedUser || !selectedUser.publicKey) {
      Alert.alert('Error', 'No user selected');
      return;
    }

    if (walletStatus !== 'unlocked') {
      Alert.alert('Error', 'System wallet must be unlocked first');
      return;
    }

    Alert.alert(
      '🎁 Send SOL',
      `Send 1 SOL from Glyffiti System Wallet to ${selectedUser.username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send', 
          onPress: async () => {
            const success = await transferSOL(selectedUser.publicKey, 1);
            if (success && onUserBalanceUpdate) {
              // Refresh the user's balance after successful transfer
              console.log('💰 Refreshing user balance after SOL transfer...');
              await onUserBalanceUpdate(selectedUser);
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    if (visible) {
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

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    try {
      // Handle both Unix timestamps (seconds) and JavaScript timestamps (milliseconds)
      const date = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (e) {
      return 'Invalid date';
    }
  };

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
    content: {
      flex: 1,
      paddingHorizontal: spacing.large,
    },
    userInfoSection: {
      paddingVertical: spacing.large,
    },
    userAvatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isDarkMode ? '#3b82f6' : colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.medium,
      alignSelf: 'center',
    },
    userAvatarText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    userName: {
      fontSize: typography.fontSize.large,
      fontWeight: typography.fontWeight.bold,
      color: isDarkMode ? '#e5e7eb' : '#111827',
      textAlign: 'center',
      marginBottom: spacing.small,
    },
    userBalance: {
      fontSize: typography.fontSize.medium,
      color: isDarkMode ? '#9ca3af' : '#6b7280',
      textAlign: 'center',
      marginBottom: spacing.large,
    },
    sectionTitle: {
      fontSize: typography.fontSize.medium,
      fontWeight: typography.fontWeight.bold,
      color: isDarkMode ? '#e5e7eb' : '#111827',
      marginBottom: spacing.medium,
      marginTop: spacing.large,
    },
    dataRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: spacing.small,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#374151' : '#f3f4f6',
    },
    dataLabel: {
      fontSize: typography.fontSize.small,
      color: isDarkMode ? '#9ca3af' : '#6b7280',
      flex: 1,
    },
    dataValue: {
      fontSize: typography.fontSize.small,
      color: isDarkMode ? '#e5e7eb' : '#111827',
      flex: 2,
      textAlign: 'right',
    },
    publicKeyContainer: {
      backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
      padding: spacing.medium,
      borderRadius: 8,
      marginTop: spacing.medium,
    },
    publicKeyTitle: {
      fontSize: typography.fontSize.small,
      fontWeight: typography.fontWeight.medium,
      color: isDarkMode ? '#9ca3af' : '#6b7280',
      marginBottom: spacing.small,
    },
    publicKeyText: {
      fontSize: typography.fontSize.small,
      color: isDarkMode ? '#e5e7eb' : '#111827',
      fontFamily: 'monospace',
      lineHeight: 20,
    },
    sendButton: {
      paddingVertical: spacing.medium,
      paddingHorizontal: spacing.large,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonText: {
      fontSize: typography.fontSize.medium,
      fontWeight: typography.fontWeight.bold,
      color: '#ffffff',
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
          <Text style={panelStyles.headerTitle}>User Profile</Text>
          <TouchableOpacity 
            style={panelStyles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={panelStyles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={panelStyles.content} showsVerticalScrollIndicator={false}>
          {selectedUser && (
            <>
              {/* User Info Section */}
              <View style={panelStyles.userInfoSection}>
                <View style={panelStyles.userAvatar}>
                  <Text style={panelStyles.userAvatarText}>
                    {selectedUser.username?.charAt(0).toUpperCase() || '?'}
                  </Text>
                </View>
                <Text style={panelStyles.userName}>{selectedUser.username}</Text>
                <Text style={panelStyles.userBalance}>
                  Balance: {userWalletBalance.toFixed(4)} SOL
                </Text>
              </View>

              {/* Genesis Block Data */}
              <Text style={panelStyles.sectionTitle}>Genesis Block Data</Text>
              
              {selectedUserData ? (
                <>
                  <View style={panelStyles.dataRow}>
                    <Text style={panelStyles.dataLabel}>Username</Text>
                    <Text style={panelStyles.dataValue}>{selectedUserData.alias}</Text>
                  </View>
                  
                  <View style={panelStyles.dataRow}>
                    <Text style={panelStyles.dataLabel}>Creation Date</Text>
                    <Text style={panelStyles.dataValue}>
                      {formatTimestamp(selectedUserData.ts)}
                    </Text>
                  </View>
                  
                  <View style={panelStyles.dataRow}>
                    <Text style={panelStyles.dataLabel}>Content Type</Text>
                    <Text style={panelStyles.dataValue}>{selectedUserData.kind}</Text>
                  </View>
                  
                  {selectedUserData.parent && (
                    <View style={panelStyles.dataRow}>
                      <Text style={panelStyles.dataLabel}>Parent Genesis</Text>
                      <Text style={panelStyles.dataValue}>
                        {selectedUserData.parent}...
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                <Text style={[panelStyles.dataValue, { textAlign: 'left' }]}>
                  Loading genesis block data...
                </Text>
              )}

              {/* Public Key */}
              <View style={panelStyles.publicKeyContainer}>
                <Text style={panelStyles.publicKeyTitle}>Public Key</Text>
                <Text style={panelStyles.publicKeyText}>
                  {selectedUser.publicKey}
                </Text>
              </View>

              {/* Transaction Hash */}
              {selectedUser.transactionHash && (
                <View style={panelStyles.publicKeyContainer}>
                  <Text style={panelStyles.publicKeyTitle}>Genesis Transaction</Text>
                  <Text style={panelStyles.publicKeyText}>
                    {selectedUser.transactionHash}
                  </Text>
                </View>
              )}

              {/* System Wallet Section */}
              <Text style={[panelStyles.sectionTitle, { marginTop: spacing.xlarge }]}>
                Glyffiti System Wallet
              </Text>
              
              <View style={panelStyles.dataRow}>
                <Text style={panelStyles.dataLabel}>Status</Text>
                <Text style={panelStyles.dataValue}>
                  {walletStatus === 'unlocked' ? '✅ Ready' : 
                   walletStatus === 'locked' ? '🔒 Locked' : 
                   isLoadingWallet ? '⏳ Loading...' : '❌ Not Ready'}
                </Text>
              </View>
              
              {walletBalance !== undefined && (
                <View style={panelStyles.dataRow}>
                  <Text style={panelStyles.dataLabel}>Balance</Text>
                  <Text style={panelStyles.dataValue}>{walletBalance.toFixed(4)} SOL</Text>
                </View>
              )}
              
              {walletAddress && (
                <View style={panelStyles.publicKeyContainer}>
                  <Text style={panelStyles.publicKeyTitle}>System Wallet Address</Text>
                  <Text style={panelStyles.publicKeyText}>
                    {walletAddress}
                  </Text>
                </View>
              )}

              {/* Send SOL Button */}
              {walletStatus === 'unlocked' && selectedUser && (
                <TouchableOpacity
                  style={[
                    panelStyles.sendButton,
                    { 
                      backgroundColor: isDarkMode ? '#3b82f6' : colors.primary,
                      marginTop: spacing.medium
                    }
                  ]}
                  onPress={handleSendSOL}
                  activeOpacity={0.7}
                >
                  <Text style={panelStyles.sendButtonText}>
                    🎁 Send 1 SOL to {selectedUser.username}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </ScrollView>
      </Animated.View>
    </>
  );
};

// Character count: 9436