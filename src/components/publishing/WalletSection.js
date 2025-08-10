// src/components/publishing/WalletSection.js
// Path: src/components/publishing/WalletSection.js

import React from 'react';
import { View, Text } from 'react-native';
import { StatusCard, FormField, PasswordInput } from '../shared';
import { getContentStyles } from '../../styles/components/content';
import { getCardStyles } from '../../styles/components/cards';
import { spacing, typography, lightColors, darkColors } from '../../styles/tokens';

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
  isDarkMode = false,
  customTitle = null,  // New prop for custom wallet titles
  bypassLock = false,
  hideActionButton = false,     // New prop
  customActionText = null    // New prop to bypass lock and always show wallet info
}) => {
  
  // Get theme-aware styles
  const contentStyles = getContentStyles(isDarkMode);
  const cardStyles = getCardStyles(isDarkMode);

  // Wallet address display styles using design tokens
  const walletAddressStyle = {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '500',
    backgroundColor: isDarkMode ? darkColors.backgroundSecondary : lightColors.backgroundSecondary,
    color: contentStyles.primaryText.color,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderRadius: 6,
    textAlign: 'center',
    marginBottom: spacing.small,
    fontFamily: 'monospace', // For better address readability
  };

  // Wallet balance styles using success color from design tokens
  const walletBalanceStyle = {
    fontFamily: typography.fontFamilyBold || typography.fontFamily,
    fontSize: 16,
    fontWeight: '600',
    color: isDarkMode ? darkColors.success : lightColors.success,
    textAlign: 'center',
    marginTop: spacing.small,
  };

  // Determine the wallet title
  const walletTitle = customTitle || '💳 The Glyffiti Wallet';

  // Unlocked wallet state OR bypass lock for user wallets
  if (walletStatus === 'unlocked' || bypassLock) {
    return (
      <StatusCard
        title={walletTitle}
        status="success"
        actionText={hideActionButton ? undefined : (customActionText || (isRequestingAirdrop ? '⏳ Processing...' : '🎁 Request 1 SOL'))}
        onActionPress={hideActionButton ? undefined : handleRequestAirdrop}
        actionDisabled={isRequestingAirdrop}
        actionLoading={isRequestingAirdrop}
        isDarkMode={isDarkMode}
      >
        {/* Show address if available */}
        {walletAddress && (
          <Text style={walletAddressStyle}>
            {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
          </Text>
        )}
        
        {/* Show balance if available */}
        {typeof walletBalance === 'number' && (
          <Text style={walletBalanceStyle}>
            Balance: {walletBalance.toFixed(5)} SOL
          </Text>
        )}
        
        {/* Show status if bypassing lock and not actually unlocked */}
        {bypassLock && walletStatus !== 'unlocked' && (
          <Text style={{
            fontSize: 12,
            color: isDarkMode ? '#9ca3af' : '#6b7280',
            textAlign: 'center',
            marginTop: 4,
            fontStyle: 'italic'
          }}>
            Status: {walletStatus} (showing for development)
          </Text>
        )}

        {/* Show loading state for user wallet balance */}
        {isLoading && (
          <Text style={{
            fontSize: 12,
            color: isDarkMode ? '#60a5fa' : '#3b82f6',
            textAlign: 'center',
            marginTop: 4,
            fontStyle: 'italic'
          }}>
            Loading balance...
          </Text>
        )}
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
  
  // Locked or no wallet state (only shown when not bypassing lock)
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
      actionDisabled={isLoading}
      actionLoading={isLoading}
      isDarkMode={isDarkMode}
    >
      {/* Password input field (only shown when unlocking) */}
      {showWalletUnlock && (
        <View style={{ marginTop: spacing.medium }}>
          <PasswordInput
            placeholder={isNoWallet ? "Create a strong password" : "Enter your password"}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            autoCapitalize="none"
            autoCorrect={false}
            style={{
              marginBottom: spacing.medium,
            }}
            isDarkMode={isDarkMode}
          />
          
          {/* Helper text using content styles */}
          <Text style={[
            {
              fontSize: 13,
              fontFamily: typography.fontFamily,
              textAlign: 'center',
              opacity: 0.8,
              lineHeight: 18,
              color: contentStyles.secondaryText.color,
            }
          ]}>
            {isNoWallet 
              ? "Your wallet will be encrypted and stored securely on this device"
              : "Enter your password to unlock your encrypted wallet"
            }
          </Text>
        </View>
      )}
    </StatusCard>
  );
};

// Character count: 5,089