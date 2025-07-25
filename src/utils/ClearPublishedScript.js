// src/utils/ClearPublishedScript.js
// Path: src/utils/ClearPublishedScript.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MobileStorageManager } from '../services/publishing/MobileStorageManager';
import { MobileScrollManager } from '../services/publishing/MobileScrollManager';
import { StorageService } from '../services/storage/StorageService';

export class ClearPublishedScript {
  
  /**
   * Main clear method - uses the new storage managers
   * This is the method called by the "Clear Test Data" button
   */
  static async clearAll() {
    try {
      console.log('🧹 Starting comprehensive data clear...');
      
      // Use the new StorageService to clear all publishing data
      const storageResult = await StorageService.clearAllStorage();
      
      if (!storageResult) {
        throw new Error('Failed to clear storage via StorageService');
      }
      
      // Also clear any legacy storage keys
      await this.clearLegacyStorage();
      
      console.log('✅ All test data cleared successfully');
      return true;
    } catch (error) {
      console.error('❌ Error in clearAll:', error);
      throw error; // Re-throw to show proper error to user
    }
  }
  
  /**
   * Clear legacy storage keys that might still exist
   */
  static async clearLegacyStorage() {
    try {
      const legacyKeys = [
        'published_content',
        'in_progress_content', 
        'draft_content',
        'glyffiti_drafts', // Old draft storage
        'story_cache', // Old story cache
        '@glyffiti_story_cache_manifests', // Old manifest cache
        '@glyffiti_cache_stats' // Old cache stats
      ];
      
      await AsyncStorage.multiRemove(legacyKeys);
      console.log('🗑️ Legacy storage keys cleared');
      return true;
    } catch (error) {
      console.error('❌ Error clearing legacy storage:', error);
      return false;
    }
  }
  
  // Keep existing methods for backward compatibility
  
  /**
   * Clear all published content (for testing)
   */
  static async clearAllPublished() {
    try {
      // Use new storage manager
      const published = await StorageService.getPublishedContent();
      const publishedIds = Object.keys(published);
      
      for (const contentId of publishedIds) {
        await StorageService.deletePublishedContent(contentId);
      }
      
      console.log('✅ All published content cleared');
      return true;
    } catch (error) {
      console.error('❌ Error clearing published content:', error);
      return false;
    }
  }
  
  /**
   * Clear only published content (keep drafts and in-progress)
   */
  static async clearOnlyPublished() {
    try {
      return await this.clearAllPublished();
    } catch (error) {
      console.error('❌ Error clearing published content:', error);
      return false;
    }
  }
  
  /**
   * Clear only in-progress content (for testing interruptions)
   */
  static async clearInProgress() {
    try {
      // Use new storage manager
      const inProgress = await StorageService.getInProgressContent();
      const inProgressIds = Object.keys(inProgress);
      
      for (const contentId of inProgressIds) {
        await StorageService.removeInProgressContent(contentId);
      }
      
      console.log('✅ In-progress content cleared');
      return true;
    } catch (error) {
      console.error('❌ Error clearing in-progress content:', error);
      return false;
    }
  }
  
  /**
   * Clear all scroll manifests
   */
  static async clearScrolls() {
    try {
      const scrolls = await StorageService.getAllScrolls();
      const scrollIds = Object.keys(scrolls);
      
      for (const scrollId of scrollIds) {
        await StorageService.deleteScroll(scrollId);
      }
      
      console.log('✅ All scroll manifests cleared');
      return true;
    } catch (error) {
      console.error('❌ Error clearing scrolls:', error);
      return false;
    }
  }
  
  /**
   * Get comprehensive stats about stored data
   */
  static async getStorageStats() {
    try {
      // Use new storage manager for comprehensive stats
      const stats = await StorageService.getStorageStats();
      
      // Also get scroll stats
      const scrolls = await StorageService.getAllScrolls();
      const scrollCount = Object.keys(scrolls).length;
      
      const comprehensiveStats = {
        ...stats,
        scrolls: scrollCount,
        totalItems: stats.totalItems + scrollCount
      };
      
      console.log('📊 Comprehensive Storage Stats:', comprehensiveStats);
      return comprehensiveStats;
    } catch (error) {
      console.error('❌ Error getting storage stats:', error);
      return {
        inProgress: 0,
        published: 0,
        scrolls: 0,
        totalItems: 0,
        error: error.message
      };
    }
  }
  
  /**
   * Reset wallet (for testing) - DANGEROUS!
   */
  static async clearWallet() {
    try {
      // Clear all wallet-related storage
      const walletKeys = [
        'solana_wallet',
        'glyffiti_wallets',
        'wallet_storage',
        'encrypted_wallets'
      ];
      
      await AsyncStorage.multiRemove(walletKeys);
      console.log('🔑 Wallet storage cleared - new wallet will be generated');
      return true;
    } catch (error) {
      console.error('❌ Error clearing wallet:', error);
      return false;
    }
  }
  
  /**
   * Nuclear option - clear everything including wallet
   * WARNING: This will delete ALL app data!
   */
  static async clearEverything() {
    try {
      await AsyncStorage.clear();
      console.log('💥 EVERYTHING CLEARED - Fresh start');
      return true;
    } catch (error) {
      console.error('❌ Error clearing everything:', error);
      return false;
    }
  }
  
  /**
   * Safe clear - only clear content data, preserve wallet and settings
   */
  static async clearContentOnly() {
    try {
      console.log('🧹 Clearing content data only (preserving wallet)...');
      
      // Clear content using storage managers
      await StorageService.clearAllStorage();
      
      // Clear legacy content keys but preserve wallet
      const contentKeys = [
        'published_content',
        'in_progress_content', 
        'draft_content',
        'glyffiti_drafts',
        'story_cache',
        '@glyffiti_story_cache_manifests',
        '@glyffiti_cache_stats'
      ];
      
      await AsyncStorage.multiRemove(contentKeys);
      
      console.log('✅ Content data cleared (wallet preserved)');
      return true;
    } catch (error) {
      console.error('❌ Error clearing content data:', error);
      return false;
    }
  }
  
  /**
   * Run diagnostic to show what data exists
   */
  static async runDiagnostic() {
    try {
      console.log('🔍 Running storage diagnostic...');
      
      // Get all AsyncStorage keys
      const allKeys = await AsyncStorage.getAllKeys();
      console.log('📋 All storage keys:', allKeys);
      
      // Get comprehensive stats
      const stats = await this.getStorageStats();
      console.log('📊 Storage stats:', stats);
      
      // Check for legacy keys
      const legacyKeys = allKeys.filter(key => 
        key.includes('published_content') || 
        key.includes('draft_content') ||
        key.includes('story_cache')
      );
      
      if (legacyKeys.length > 0) {
        console.log('⚠️ Found legacy storage keys:', legacyKeys);
      }
      
      return {
        allKeys,
        stats,
        legacyKeys,
        totalKeys: allKeys.length
      };
    } catch (error) {
      console.error('❌ Error running diagnostic:', error);
      return { error: error.message };
    }
  }
}

// Character count: 6847