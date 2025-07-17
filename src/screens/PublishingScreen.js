// src/screens/PublishingScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { MobilePublishingService } from '../services/publishing/MobilePublishingService';
import { MobileWalletService } from '../services/wallet/MobileWalletService';
import { MigrationHelper } from '../utils/MigrationHelper';
import { publishingStyles } from '../styles/publishingStyles';
import { WalletSection } from '../components/publishing/WalletSection';
import { ProgressBar } from '../components/publishing/ProgressBar';
import { ContentSections } from '../components/publishing/ContentSections';
import { createWalletHandlers } from '../utils/publishing/walletHandlers';
import { createPublishingHandlers } from '../utils/publishing/publishingHandlers';

export const PublishingScreen = ({ navigation }) => {
  // State variables
  const [publishing, setPublishing] = useState(false);
  const [progress, setProgress] = useState(null);
  const [publishedContent, setPublishedContent] = useState([]);
  const [inProgressContent, setInProgressContent] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletService, setWalletService] = useState(null);
  const [publishingService, setPublishingService] = useState(null);
  const [showWalletUnlock, setShowWalletUnlock] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [publishingStats, setPublishingStats] = useState(null);
  const [walletStatus, setWalletStatus] = useState('unknown');
  const [isRequestingAirdrop, setIsRequestingAirdrop] = useState(false);
  
  // Helper functions
  const loadWalletInfo = async (wallet, logContext = null) => {
    try {
      const balance = await wallet.getBalance(logContext);
      setWalletBalance(balance.available);
    } catch (error) {
      console.error('Error loading wallet info:', error);
    }
  };
  
  const loadContent = async (pubService) => {
    try {
      const published = await pubService.getPublishedContent();
      const inProgress = await pubService.getInProgressContent();
      const draftList = await pubService.getDrafts();
      
      let stats = null;
      try {
        stats = await pubService.getPublishingStats();
      } catch (error) {
        console.log('Publishing stats not available without enhanced features');
      }
      
      setPublishedContent(published);
      setInProgressContent(inProgress);
      setDrafts(draftList);
      setPublishingStats(stats);
    } catch (error) {
      console.error('Error loading content:', error);
    }
  };

  const refreshContent = async () => {
    if (publishingService) {
      await loadContent(publishingService);
    }
  };

  // Initialize handlers
  const walletHandlers = createWalletHandlers({
    setIsLoading,
    setWalletService,
    setWalletAddress,
    setWalletStatus,
    setPublishingService,
    setShowWalletUnlock,
    setPassword,
    loadWalletInfo
  });

  const publishingHandlers = createPublishingHandlers(
    {
      setPublishing,
      setProgress,
      setIsRequestingAirdrop,
      loadWalletInfo,
      refreshContent,
      setShowWalletUnlock
    },
    {
      walletService,
      publishingService,
      isRequestingAirdrop
    }
  );

  // Auto-refresh balance when wallet is unlocked
  useEffect(() => {
    if (walletStatus === 'unlocked' && walletService) {
      const interval = setInterval(async () => {
        try {
          await loadWalletInfo(walletService);
        } catch (error) {
          console.log('Error refreshing balance:', error);
        }
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [walletStatus, walletService]);

  const initializeServices = async () => {
    try {
      setIsLoading(true);
      
      // Always initialize publishing service first
      const pubService = new MobilePublishingService();
      setPublishingService(pubService);
      
      // Load content that doesn't require wallet
      try {
        await loadContent(pubService);
      } catch (error) {
        console.log('Some content requires wallet unlock');
      }
      
      // Check if migration is needed
      const migrationNeeded = await MigrationHelper.needsMigration();
      if (migrationNeeded) {
        setWalletStatus('migrating');
        setIsLoading(false);
        return;
      }
      
      // Check if we have any wallets
      const availableWallets = await MobileWalletService.getAvailableWallets();
      if (availableWallets.length === 0) {
        setWalletStatus('none');
      } else {
        setWalletStatus('locked');
        console.log(`Found ${availableWallets.length} existing wallet(s)`);
      }
      
      setIsLoading(false);
      
    } catch (error) {
      console.error('Error initializing services:', error);
      setWalletStatus('none');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeServices();
  }, []);

  const handleBack = () => {
    navigation?.goBack();
  };

  const handleWalletAction = async () => {
    await walletHandlers.handleWalletAction(password, walletStatus);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={publishingStyles.loadingContainer}>
        <Text style={publishingStyles.loadingText}>⏳ Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={publishingStyles.container}>
      {/* Back Button */}
      <View style={publishingStyles.headerRow}>
        <TouchableOpacity 
          style={publishingStyles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Text style={publishingStyles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={publishingStyles.scrollContainer}>
        <Text style={publishingStyles.header}>📜 Glyffiti Publishing</Text>
        
        {/* Wallet Section */}
        <WalletSection 
          walletStatus={walletStatus}
          walletAddress={walletAddress}
          walletBalance={walletBalance}
          isRequestingAirdrop={isRequestingAirdrop}
          showWalletUnlock={showWalletUnlock}
          password={password}
          isLoading={isLoading}
          setPassword={setPassword}
          setShowWalletUnlock={setShowWalletUnlock}
          handleRequestAirdrop={publishingHandlers.handleRequestAirdrop}
          handleWalletAction={handleWalletAction}
          handleMigration={walletHandlers.handleMigration}
        />
        
        {/* Main Publish Button */}
        <TouchableOpacity 
          style={[
            publishingStyles.publishButton,
            (publishing || walletStatus !== 'unlocked') && publishingStyles.publishButtonDisabled
          ]}
          onPress={publishingHandlers.handlePickAndPublish}
          disabled={publishing || walletStatus !== 'unlocked'}
        >
          <Text style={publishingStyles.publishButtonText}>
            {publishing ? '📤 Publishing...' : 
             walletStatus !== 'unlocked' ? '🔒 Unlock Wallet to Publish' :
             '📁 Pick File & Publish'}
          </Text>
        </TouchableOpacity>
        
        {/* Clear Test Data Button */}
        <TouchableOpacity 
          style={publishingStyles.clearButton}
          onPress={publishingHandlers.handleClearPublished}
        >
          <Text style={publishingStyles.clearButtonText}>🗑️ Clear Test Data</Text>
        </TouchableOpacity>
        
        {/* Progress Bar */}
        <ProgressBar publishing={publishing} progress={progress} />
        
        {/* Content Sections */}
        <ContentSections 
          inProgressContent={inProgressContent}
          drafts={drafts}
          publishedContent={publishedContent}
          publishingStats={publishingStats}
          walletStatus={walletStatus}
          publishing={publishing}
          handleResumePublishing={publishingHandlers.handleResumePublishing}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

// Character count: 4247