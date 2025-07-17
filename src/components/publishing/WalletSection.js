// src/components/publishing/WalletSection.js
import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { publishingStyles } from '../../styles/publishingStyles';

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
  handleMigration 
}) => {
  if (walletStatus === 'unlocked') {
    return (
      <View style={publishingStyles.walletContainer}>
        <Text style={publishingStyles.walletTitle}>💳 Secure Encrypted Wallet</Text>
        <Text style={publishingStyles.walletAddress}>
          {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
        </Text>
        <Text style={publishingStyles.walletBalance}>
          Balance: {walletBalance.toFixed(4)} SOL
        </Text>
        
        <TouchableOpacity 
          style={[
            publishingStyles.airdropButton,
            isRequestingAirdrop && publishingStyles.airdropButtonDisabled
          ]}
          onPress={handleRequestAirdrop}
          disabled={isRequestingAirdrop}
        >
          <Text style={publishingStyles.airdropButtonText}>
            {isRequestingAirdrop ? '⏳ Requesting...' : '🎁 Request 1 SOL'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (walletStatus === 'migrating') {
    return (
      <View style={publishingStyles.walletContainer}>
        <Text style={publishingStyles.walletTitle}>🔄 Wallet Migration Available</Text>
        <Text style={publishingStyles.walletSubtitle}>
          A security upgrade is available for your wallet
        </Text>
        <TouchableOpacity 
          style={publishingStyles.upgradeButton}
          onPress={handleMigration}
        >
          <Text style={publishingStyles.upgradeButtonText}>🔐 Upgrade Security</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={publishingStyles.walletContainer}>
      <Text style={publishingStyles.walletTitle}>
        {walletStatus === 'none' ? '🔒 No Wallet Found' : '🔒 Wallet Locked'}
      </Text>
      <Text style={publishingStyles.walletSubtitle}>
        {walletStatus === 'none' 
          ? 'Create a wallet to publish content' 
          : 'Unlock your wallet to publish content'}
      </Text>
      
      {showWalletUnlock ? (
        <View style={publishingStyles.passwordContainer}>
          <TextInput
            style={publishingStyles.passwordInput}
            placeholder="Enter password..."
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity 
            style={publishingStyles.unlockButton}
            onPress={handleWalletAction}
            disabled={isLoading}
          >
            <Text style={publishingStyles.unlockButtonText}>
              {isLoading ? '⏳ Processing...' : 
               walletStatus === 'none' ? '🔓 Create Wallet' : '🔓 Unlock'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={publishingStyles.unlockButton}
          onPress={() => setShowWalletUnlock(true)}
        >
          <Text style={publishingStyles.unlockButtonText}>
            {walletStatus === 'none' ? '➕ Create New Wallet' : '🔓 Enter Password'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Character count: 2698