// src/utils/ClearPublishedScript.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export class ClearPublishedScript {
  
  // Clear all published content (for testing)
  static async clearAllPublished() {
    try {
      await AsyncStorage.removeItem('published_content');
      await AsyncStorage.removeItem('in_progress_content');
      await AsyncStorage.removeItem('draft_content');
      
      console.log('✅ All published content cleared');
      return true;
    } catch (error) {
      console.error('❌ Error clearing published content:', error);
      return false;
    }
  }
  
  // Clear only published content (keep drafts and in-progress)
  static async clearOnlyPublished() {
    try {
      await AsyncStorage.removeItem('published_content');
      console.log('✅ Published content cleared (kept drafts and in-progress)');
      return true;
    } catch (error) {
      console.error('❌ Error clearing published content:', error);
      return false;
    }
  }
  
  // Clear only in-progress content (for testing interruptions)
  static async clearInProgress() {
    try {
      await AsyncStorage.removeItem('in_progress_content');
      console.log('✅ In-progress content cleared');
      return true;
    } catch (error) {
      console.error('❌ Error clearing in-progress content:', error);
      return false;
    }
  }
  
  // Get stats about stored data
  static async getStorageStats() {
    try {
      const published = await AsyncStorage.getItem('published_content');
      const inProgress = await AsyncStorage.getItem('in_progress_content');
      const drafts = await AsyncStorage.getItem('draft_content');
      
      const publishedCount = published ? JSON.parse(published).length : 0;
      const inProgressCount = inProgress ? JSON.parse(inProgress).length : 0;
      const draftCount = drafts ? JSON.parse(drafts).length : 0;
      
      const stats = {
        published: publishedCount,
        inProgress: inProgressCount,
        drafts: draftCount,
        total: publishedCount + inProgressCount + draftCount
      };
      
      console.log('📊 Storage Stats:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error getting storage stats:', error);
      return null;
    }
  }
  
  // Reset wallet (for testing)
  static async clearWallet() {
    try {
      await AsyncStorage.removeItem('solana_wallet');
      console.log('🔑 Wallet cleared - new wallet will be generated');
      return true;
    } catch (error) {
      console.error('❌ Error clearing wallet:', error);
      return false;
    }
  }
  
  // Nuclear option - clear everything
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
}

// File length: 2,147 characters