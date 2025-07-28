// src/components/publishing/WalletSection.js
// Path: src/components/publishing/WalletSection.js
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { StatusCard } from '../shared';
import { colors, spacing, typography } from '../../styles';

export const WalletSection = ({ 
  walletStatus, 
  walletAddress, 
  walletBalance, 
  isRequestingAirdrop,
  showWalletUnlock,
  password,
  isLoading,
  setPassword,
  setShowWalletUnlock,
  handleRequestAirdrop,
  handleWalletAction,
  handleMigration,
  isDarkMode = false 
}) => {
  // Unlocked wallet state
  if (walletStatus === 'unlocked') {
    return (
      <StatusCard
        title="💳 Secure Encrypted Wallet"
        status="success"
        actionText={isRequestingAirdrop ? '⏳ Requesting...' : '🎁 Request 1 SOL'}
        onActionPress={handleRequestAirdrop}
        actionDisabled={isRequestingAirdrop}
        actionLoading={isRequestingAirdrop}
        isDarkMode={isDarkMode}
      >
        {/* Wallet address */}
        <Text style={[
          styles.walletAddress,
          { 
            color: isDarkMode ? '#e5e7eb' : colors.text,
            backgroundColor: isDarkMode ? '#374151' : colors.backgroundSecondary 
          }
        ]}>
          {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
        </Text>
        
        {/* Wallet balance */}
        <Text style={[
          styles.walletBalance,
          { color: colors.success }
        ]}>
          Balance: {walletBalance.toFixed(4)} SOL
        </Text>
      </StatusCard>
    );
  }
  
  // Migration available state
  if (walletStatus === 'migrating') {
    return (
      <StatusCard
        title="🔄 Wallet Migration Available"
        subtitle="A security upgrade is available for your wallet"
        status="warning"
        actionText="🔐 Upgrade Security"
        onActionPress={handleMigration}
        isDarkMode={isDarkMode}
      />
    );
  }
  
  // Locked or no wallet state
  const isNoWallet = walletStatus === 'none';
  const title = isNoWallet ? '🔒 No Wallet Found' : '🔒 Wallet Locked';
  const subtitle = isNoWallet 
    ? 'Create a wallet to publish content' 
    : 'Unlock your wallet to publish content';

  return (
    <StatusCard
      title={title}
      subtitle={subtitle}
      status="info"
      actionText={
        showWalletUnlock 
          ? (isLoading ? '⏳ Processing...' : (isNoWallet ? '🔓 Create Wallet' : '🔓 Unlock'))
          : (isNoWallet ? '➕ Create New Wallet' : '🔓 Enter Password')
      }
      onActionPress={showWalletUnlock ? handleWalletAction : () => setShowWalletUnlock(true)}
      actionDisabled={isLoading || (showWalletUnlock && !password.trim())}
      actionLoading={isLoading}
      isDarkMode={isDarkMode}
    >
      {/* Password input when unlocking */}
      {showWalletUnlock && (
        <View style={styles.passwordContainer}>
          <TextInput
            style={[
              styles.passwordInput,
              {
                backgroundColor: isDarkMode ? '#374151' : colors.backgroundSecondary,
                borderColor: isDarkMode ? '#6b7280' : colors.border,
                color: isDarkMode ? '#e5e7eb' : colors.text,
              }
            ]}
            placeholder="Enter password..."
            placeholderTextColor={isDarkMode ? '#9ca3af' : colors.textSecondary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>
      )}
    </StatusCard>
  );
};

const styles = StyleSheet.create({
  walletAddress: {
    fontSize: 14,
    fontFamily: 'monospace',
    padding: spacing.small,
    borderRadius: 6,
    marginBottom: spacing.small,
    textAlign: 'center',
  },
  walletBalance: {
    fontSize: 16,
    fontFamily: typography.fontFamily,
    fontWeight: '600',
    marginBottom: spacing.small,
    textAlign: 'center',
  },
  passwordContainer: {
    marginTop: spacing.medium,
  },
  passwordInput: {
    fontSize: 16,
    fontFamily: typography.fontFamily,
    padding: spacing.medium,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: spacing.small,
  },
});

// Character count: 3416