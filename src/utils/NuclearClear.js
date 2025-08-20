// src/utils/NuclearClear.js
// Path: src/utils/NuclearClear.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StoryHeaderService } from '../services/feed/StoryHeaderService';
import { StorageDiagnostic } from './StorageDiagnostic';

/**
 * Nuclear option - Clear ALL story data from ALL storage locations
 * This examines every key and removes anything story-related
 */
export const nuclearClearStories = async () => {
  try {
    console.log('💥 NUCLEAR CLEAR: Starting complete story data removal...');
    
    // Step 1: Show what we have before
    console.log('📊 BEFORE NUCLEAR CLEAR:');
    await StorageDiagnostic.diagnoseStorage();
    
    // Step 2: Get ALL AsyncStorage keys
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('🔍 Found', allKeys.length, 'total keys:', allKeys);
    
    // Step 3: Identify ALL story-related keys (comprehensive list)
    const storyKeys = allKeys.filter(key => 
      key.includes('story') ||
      key.includes('published') ||
      key.includes('glyffiti_user_story_heads') ||
      key.includes('glyffiti_user_heads') ||
      key.includes('glyffiti_published') ||
      key.includes('glyffiti_scrolls') ||
      key.includes('glyffiti_in_progress') ||
      key.includes('manifests') ||
      key.includes('cache') ||
      key.startsWith('user_') ||
      key.includes('_published_') ||
      key.includes('_story_')
    );
    
    // Step 4: Preserve ONLY wallet data
    const walletKeys = allKeys.filter(key => 
      key.includes('wallet') && !key.includes('story')
    );
    
    console.log('🗑️ Keys to DELETE:', storyKeys);
    console.log('💰 Keys to PRESERVE:', walletKeys);
    
    // Step 5: Use StoryHeaderService reset method
    console.log('🧹 Resetting StoryHeaderService...');
    await StoryHeaderService.resetUserStoryHeads();
    
    // Step 6: Remove all story-related keys
    if (storyKeys.length > 0) {
      console.log('🗑️ Removing', storyKeys.length, 'story-related keys...');
      await AsyncStorage.multiRemove(storyKeys);
    }
    
    // Step 7: Verify complete removal
    console.log('📊 AFTER NUCLEAR CLEAR:');
    await StorageDiagnostic.diagnoseStorage();
    
    // Step 8: Test StoryHeaderService stats
    const stats = await StoryHeaderService.getStats();
    console.log('📊 Final story stats:', stats);
    
    if (stats.totalStories === 0 && stats.activeUsers === 0) {
      console.log('✅ NUCLEAR CLEAR SUCCESSFUL - All stories removed!');
      return true;
    } else {
      console.log('⚠️ NUCLEAR CLEAR INCOMPLETE - Some data remains');
      return false;
    }
    
  } catch (error) {
    console.error('💥 NUCLEAR CLEAR FAILED:', error);
    return false;
  }
};

/**
 * Complete AsyncStorage wipe (absolutely everything)
 */
export const totalWipe = async () => {
  try {
    console.log('💀 TOTAL WIPE: Clearing EVERYTHING from AsyncStorage...');
    
    // Show what we have
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('🔍 Found', allKeys.length, 'keys to delete:', allKeys);
    
    // Nuclear option - clear everything
    await AsyncStorage.clear();
    
    // Verify
    const remainingKeys = await AsyncStorage.getAllKeys();
    console.log('🔍 After wipe:', remainingKeys.length, 'keys remain');
    
    if (remainingKeys.length === 0) {
      console.log('✅ TOTAL WIPE SUCCESSFUL - AsyncStorage is empty!');
      return true;
    } else {
      console.log('⚠️ TOTAL WIPE INCOMPLETE:', remainingKeys);
      return false;
    }
    
  } catch (error) {
    console.error('💀 TOTAL WIPE FAILED:', error);
    return false;
  }
};

export default { nuclearClearStories, totalWipe };