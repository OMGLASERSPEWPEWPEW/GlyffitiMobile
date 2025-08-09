// src/components/WalletUpgradePrompt.js
// Path: src/components/WalletUpgradePrompt.js

import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { StatusCard, PasswordInput } from './shared';
import { spacing, typography } from '../styles/tokens';
import { getContentStyles } from '../styles/components/content';

/**
 * WalletUpgradePrompt Component
 * Prompts users to create their personal wallet for posting
 * Handles the upgrade flow from system wallet to personal wallet
 */
export const WalletUpgradePrompt = ({ 
  onCreateWallet, 
  onCancel, 
  isLoading = false,
  isDarkMode = false 
}) => {
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Get theme-aware styles
  const contentStyles = getContentStyles(isDarkMode);

  /**
   * Handle create wallet button press
   */
  const handleCreateWallet = () => {
    if (!showPasswordInput) {
      setShowPasswordInput(true);
      return;
    }

    // Validate passwords
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Call the parent function with the password
    onCreateWallet(password);
  };

  /**
   * Handle cancel - reset state and call parent
   */
  const handleCancel = () => {
    setShowPasswordInput(false);
    setPassword('');
    setConfirmPassword('');
    onCancel();
  };

  return (
    <StatusCard
      title="💰 Ready to Post?"
      subtitle={
        showPasswordInput 
          ? "Create a secure password for your personal wallet"
          : "Creating posts costs SOL. Create your personal wallet to get started."
      }
      status="info"
      actionText={
        isLoading 
          ? '⏳ Creating Wallet...'
          : showPasswordInput 
          ? '🔓 Create Personal Wallet'
          : '🆙 Upgrade Wallet'
      }
      onActionPress={handleCreateWallet}
      actionDisabled={isLoading}
      actionLoading={isLoading}
      secondaryActionText={showPasswordInput ? 'Cancel' : 'Maybe Later'}
      onSecondaryActionPress={handleCancel}
      isDarkMode={isDarkMode}
    >
      {/* Password input fields - only shown when user clicks upgrade */}
      {showPasswordInput && (
        <View style={{ marginTop: spacing.medium }}>
          {/* Main password input */}
          <PasswordInput
            placeholder="Create a strong password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            autoCapitalize="none"
            autoCorrect={false}
            style={{ marginBottom: spacing.medium }}
            isDarkMode={isDarkMode}
          />
          
          {/* Confirm password input */}
          <PasswordInput
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={true}
            autoCapitalize="none"
            autoCorrect={false}
            style={{ marginBottom: spacing.medium }}
            isDarkMode={isDarkMode}
          />
          
          {/* Helper text */}
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
            Your personal wallet will be encrypted and stored securely on this device. 
            You'll use this for posting content and managing your SOL.
          </Text>

          {/* Benefits list */}
          <View style={{ 
            marginTop: spacing.medium,
            paddingLeft: spacing.small 
          }}>
            <Text style={[
              {
                fontSize: 12,
                fontFamily: typography.fontFamily,
                color: contentStyles.secondaryText.color,
                marginBottom: spacing.tiny,
              }
            ]}>
              ✅ Post your own content
            </Text>
            <Text style={[
              {
                fontSize: 12,
                fontFamily: typography.fontFamily,
                color: contentStyles.secondaryText.color,
                marginBottom: spacing.tiny,
              }
            ]}>
              ✅ Earn SOL from readers
            </Text>
            <Text style={[
              {
                fontSize: 12,
                fontFamily: typography.fontFamily,
                color: contentStyles.secondaryText.color,
                marginBottom: spacing.tiny,
              }
            ]}>
              ✅ Full control of your wallet
            </Text>
            <Text style={[
              {
                fontSize: 12,
                fontFamily: typography.fontFamily,
                color: contentStyles.secondaryText.color,
              }
            ]}>
              ✅ Keep browsing for free anytime
            </Text>
          </View>
        </View>
      )}

      {/* Initial benefits - shown before password input */}
      {!showPasswordInput && (
        <View style={{ 
          marginTop: spacing.medium,
          paddingHorizontal: spacing.small 
        }}>
          <Text style={[
            {
              fontSize: 14,
              fontFamily: typography.fontFamily,
              color: contentStyles.primaryText.color,
              textAlign: 'center',
              marginBottom: spacing.small,
            }
          ]}>
            Why upgrade to a personal wallet?
          </Text>
          
          <Text style={[
            {
              fontSize: 12,
              fontFamily: typography.fontFamily,
              color: contentStyles.secondaryText.color,
              marginBottom: spacing.tiny,
              textAlign: 'center',
            }
          ]}>
            💝 Post your stories and earn SOL
          </Text>
          <Text style={[
            {
              fontSize: 12,
              fontFamily: typography.fontFamily,
              color: contentStyles.secondaryText.color,
              marginBottom: spacing.tiny,
              textAlign: 'center',
            }
          ]}>
            🔒 Your wallet, your control
          </Text>
          <Text style={[
            {
              fontSize: 12,
              fontFamily: typography.fontFamily,
              color: contentStyles.secondaryText.color,
              textAlign: 'center',
            }
          ]}>
            📖 Continue browsing for free anytime
          </Text>
        </View>
      )}
    </StatusCard>
  );
};

// Character count: 5,247