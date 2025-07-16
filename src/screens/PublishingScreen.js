// src/screens/PublishingScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { MobilePublishingService } from '../services/publishing/MobilePublishingService';
import { SolanaAirdropService } from '../services/wallet/SolanaAirdropService';
import { ClearPublishedScript } from '../utils/ClearPublishedScript';
import { publishingStyles } from '../styles/publishingStyles';

export const PublishingScreen = () => {
  const [publishing, setPublishing] = useState(false);
  const [progress, setProgress] = useState(null);
  const [publishedContent, setPublishedContent] = useState([]);
  const [inProgressContent, setInProgressContent] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletAddress, setWalletAddress] = useState('');
  
  const publishingService = new MobilePublishingService();
  const airdropService = new SolanaAirdropService();
  
  React.useEffect(() => {
    loadContent();
    loadWalletInfo();
  }, []);
  
  const loadContent = async () => {
    try {
      const published = await publishingService.getPublishedContent();
      const inProgress = await publishingService.getInProgressContent();
      const draftList = await publishingService.getDrafts();
      
      setPublishedContent(published);
      setInProgressContent(inProgress);
      setDrafts(draftList);
    } catch (error) {
      console.error('Error loading content:', error);
    }
  };
  
  const loadWalletInfo = async () => {
    try {
      const publicKey = await publishingService.getWalletPublicKey();
      const keypair = await publishingService.getWalletKeypair();
      const balance = await airdropService.getBalance(keypair.publicKey);
      
      setWalletAddress(publicKey);
      setWalletBalance(balance);
    } catch (error) {
      console.error('Error loading wallet info:', error);
    }
  };
  
  const handleRequestAirdrop = async () => {
    try {
      const keypair = await publishingService.getWalletKeypair();
      
      Alert.alert(
        'Request Devnet SOL',
        'This will request 1 SOL from Solana devnet faucet. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Request', onPress: async () => {
            try {
              await airdropService.requestAirdrop(keypair.publicKey, 1);
              await loadWalletInfo();
              Alert.alert('Success!', '1 SOL has been added to your devnet wallet');
            } catch (error) {
              Alert.alert('Error', 'Airdrop failed: ' + error.message);
            }
          }}
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to request airdrop: ' + error.message);
    }
  };
  
  const handleClearPublished = async () => {
    try {
      const stats = await ClearPublishedScript.getStorageStats();
      
      Alert.alert(
        'Clear Test Data',
        `Current data:\n📚 ${stats.published} published\n⚠️ ${stats.inProgress} in-progress\n📝 ${stats.drafts} drafts\n\nWhat would you like to clear?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clear Published Only', onPress: async () => {
            const success = await ClearPublishedScript.clearOnlyPublished();
            if (success) {
              loadContent();
              Alert.alert('Cleared!', 'Published content cleared');
            }
          }},
          { text: 'Clear All Test Data', style: 'destructive', onPress: async () => {
            const success = await ClearPublishedScript.clearAllPublished();
            if (success) {
              loadContent();
              Alert.alert('Cleared!', 'All test data cleared');
            }
          }}
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to clear data: ' + error.message);
    }
  };
  
  const handlePickAndPublish = async () => {
    try {
      setPublishing(true);
      
      // Check wallet balance first
      const keypair = await publishingService.getWalletKeypair();
      const needsSOL = await airdropService.needsAirdrop(keypair.publicKey, 0.01);
      
      if (needsSOL) {
        Alert.alert(
          'Insufficient SOL',
          'You need SOL to publish transactions. Request devnet SOL first.',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setPublishing(false) },
            { text: 'Request SOL', onPress: () => {
              setPublishing(false);
              handleRequestAirdrop();
            }}
          ]
        );
        return;
      }
      
      // Pick file
      const content = await publishingService.pickAndLoadFile();
      if (!content) {
        setPublishing(false);
        return;
      }
      
      // Show estimate
      const estimate = publishingService.estimatePublishing(content.content);
      
      Alert.alert(
        'Publish to Solana',
        `This will create ${estimate.glyphCount} transactions on Solana devnet.\n\nEstimated cost: ${(estimate.estimatedCost).toFixed(4)} SOL\nEstimated time: ${Math.ceil(estimate.estimatedTimeMinutes)} minutes\n\nProceed?`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setPublishing(false) },
          { text: 'Publish', onPress: () => startPublishing(content) }
        ]
      );
      
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to pick file: ' + error.message);
      setPublishing(false);
    }
  };
  
  const startPublishing = async (content) => {
    try {
      await publishingService.publishContent(content, (status) => {
        console.log('📊 Progress update:', status); // Debug logging
        
        // Force UI update by creating new object
        setProgress({
          ...status,
          timestamp: Date.now() // Force re-render
        });
        
        if (status.stage === 'completed') {
          Alert.alert('Success!', `Content fully published to Solana blockchain!\n\n✅ ${status.successfulGlyphs} glyphs published\n❌ ${status.failedGlyphs} glyphs failed`);
          loadContent(); // Refresh lists
          loadWalletInfo(); // Refresh balance
          setPublishing(false);
          setProgress(null);
        } else if (status.stage === 'partial') {
          Alert.alert('Partial Success', `${status.successfulGlyphs}/${status.totalGlyphs} glyphs published successfully.\n\nYou can resume publishing the remaining glyphs later.`);
          loadContent(); // Refresh lists
          setPublishing(false);
          setProgress(null);
        } else if (status.stage === 'failed') {
          Alert.alert('Error', 'Publishing failed: ' + (status.error || 'Unknown error'));
          setPublishing(false);
          setProgress(null);
        }
      });
      
    } catch (error) {
      console.error('Publishing error:', error);
      Alert.alert('Error', 'Publishing failed: ' + error.message);
      setPublishing(false);
      setProgress(null);
    }
  };
  
  const handleResumePublishing = async (contentId) => {
    try {
      setPublishing(true);
      
      Alert.alert(
        'Resume Publishing',
        'Continue publishing the remaining glyphs?',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setPublishing(false) },
          { text: 'Resume', onPress: async () => {
            try {
              await publishingService.resumePublishing(contentId, (status) => {
                setProgress(status);
                
                if (status.stage === 'completed') {
                  Alert.alert('Success!', 'All remaining glyphs published successfully!');
                  loadContent();
                  setPublishing(false);
                  setProgress(null);
                } else if (status.stage === 'failed') {
                  Alert.alert('Error', 'Resume publishing failed: ' + (status.error || 'Unknown error'));
                  setPublishing(false);
                  setProgress(null);
                }
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to resume publishing: ' + error.message);
              setPublishing(false);
              setProgress(null);
            }
          }}
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to resume publishing: ' + error.message);
      setPublishing(false);
    }
  };
  
  const renderProgressBar = () => {
    if (!progress) return null;
    
    return (
      <View style={publishingStyles.progressContainer}>
        <Text style={publishingStyles.progressTitle}>
          {progress.stage === 'preparing' && '📋 Preparing content...'}
          {progress.stage === 'processing' && '⚙️ Creating glyphs...'}
          {progress.stage === 'publishing' && '🚀 Publishing to blockchain...'}
        </Text>
        
        {progress.totalGlyphs > 0 && (
          <Text style={publishingStyles.progressText}>
            {progress.currentGlyph}/{progress.totalGlyphs} glyphs • {progress.progress}%
          </Text>
        )}
        
        {progress.successfulGlyphs > 0 && (
          <Text style={publishingStyles.progressText}>
            ✅ {progress.successfulGlyphs} published • ❌ {progress.failedGlyphs} failed
          </Text>
        )}
        
        <View style={publishingStyles.progressBarContainer}>
          <View 
            style={[publishingStyles.progressBar, { width: `${progress.progress}%` }]} 
          />
        </View>
      </View>
    );
  };
  
  const getStatusIcon = (item) => {
    if (item.status === 'published' && item.successfulGlyphs === item.totalGlyphs) {
      return '✅';
    } else if (item.successfulGlyphs > 0) {
      return '⚠️';
    } else {
      return '❌';
    }
  };
  
  return (
    <ScrollView style={publishingStyles.container}>
      <Text style={publishingStyles.title}>📖 Glyffiti Publishing</Text>
      
      {/* Wallet Info */}
      <View style={publishingStyles.walletContainer}>
        <Text style={publishingStyles.walletTitle}>💳 Devnet Wallet</Text>
        <Text style={publishingStyles.walletAddress}>
          {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
        </Text>
        <Text style={publishingStyles.walletBalance}>
          Balance: {walletBalance.toFixed(4)} SOL
        </Text>
        
        <TouchableOpacity 
          style={publishingStyles.airdropButton}
          onPress={handleRequestAirdrop}
        >
          <Text style={publishingStyles.airdropButtonText}>🎁 Request 1 SOL</Text>
        </TouchableOpacity>
      </View>
      
      {/* Publish Button */}
      <TouchableOpacity 
        style={[publishingStyles.publishButton, publishing && publishingStyles.publishButtonDisabled]}
        onPress={handlePickAndPublish}
        disabled={publishing}
      >
        <Text style={publishingStyles.publishButtonText}>
          {publishing ? '📤 Publishing...' : '📁 Pick File & Publish'}
        </Text>
      </TouchableOpacity>
      
      {/* Clear Test Data Button */}
      <TouchableOpacity 
        style={publishingStyles.clearButton}
        onPress={handleClearPublished}
      >
        <Text style={publishingStyles.clearButtonText}>🗑️ Clear Test Data</Text>
      </TouchableOpacity>
      
      {/* Progress Bar */}
      {renderProgressBar()}
      
      {/* In Progress Content */}
      {inProgressContent.length > 0 && (
        <View style={publishingStyles.section}>
          <Text style={publishingStyles.sectionTitle}>⚠️ In Progress ({inProgressContent.length})</Text>
          {inProgressContent.map((item, index) => (
            <View key={index} style={publishingStyles.contentItem}>
              <Text style={publishingStyles.contentTitle}>{item.title}</Text>
              <Text style={publishingStyles.contentMeta}>
                {item.successfulGlyphs || 0}/{item.totalGlyphs} glyphs published
              </Text>
              <Text style={publishingStyles.transactionInfo}>
                Started: {new Date(item.startedAt).toLocaleDateString()}
              </Text>
              <TouchableOpacity 
                style={publishingStyles.resumeButton}
                onPress={() => handleResumePublishing(item.id)}
                disabled={publishing}
              >
                <Text style={publishingStyles.resumeButtonText}>▶️ Resume Publishing</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      
      {/* Published Content */}
      <View style={publishingStyles.section}>
        <Text style={publishingStyles.sectionTitle}>✅ Published ({publishedContent.length})</Text>
        {publishedContent.map((item, index) => (
          <View key={index} style={publishingStyles.contentItem}>
            <Text style={publishingStyles.contentTitle}>{getStatusIcon(item)} {item.title}</Text>
            <Text style={publishingStyles.contentMeta}>
              {item.successfulGlyphs}/{item.totalGlyphs} glyphs • {new Date(item.publishedAt).toLocaleDateString()}
            </Text>
            <Text style={publishingStyles.transactionInfo}>
              {item.transactionIds?.length || 0} blockchain transactions
            </Text>
          </View>
        ))}
        {publishedContent.length === 0 && (
          <Text style={publishingStyles.emptyText}>No published content yet</Text>
        )}
      </View>
      
      {/* Drafts */}
      <View style={publishingStyles.section}>
        <Text style={publishingStyles.sectionTitle}>📝 Drafts ({drafts.length})</Text>
        {drafts.map((item, index) => (
          <View key={index} style={publishingStyles.contentItem}>
            <Text style={publishingStyles.contentTitle}>{item.title}</Text>
            <Text style={publishingStyles.contentMeta}>
              Last edited: {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        ))}
        {drafts.length === 0 && (
          <Text style={publishingStyles.emptyText}>No drafts yet</Text>
        )}
      </View>
    </ScrollView>
  );
};

// File length: 8,247 characters