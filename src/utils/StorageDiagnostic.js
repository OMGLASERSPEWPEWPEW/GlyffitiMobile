// src/utils/StorageDiagnostic.js
// Path: src/utils/StorageDiagnostic.js
// Enhanced version to show ALL storage keys and actual content

import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageDiagnostic {
  /**
   * Get all storage keys and show what's stored where
   */
  static async diagnoseStorage() {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      
      console.log('🔍 STORAGE DIAGNOSTIC REPORT');
      console.log('============================');
      console.log(`Total keys in AsyncStorage: ${allKeys.length}`);
      
      // Categorize keys
      const userKeys = allKeys.filter(key => key.startsWith('user_'));
      const globalKeys = allKeys.filter(key => !key.startsWith('user_'));
      
      console.log(`\n👤 USER-SCOPED KEYS (${userKeys.length}):`);
      if (userKeys.length === 0) {
        console.log('  - No user-specific data found.');
      } else {
        for (const key of userKeys) {
          await this.logKeyDetails(key);
        }
      }
      
      console.log(`\n🌍 GLOBAL KEYS (${globalKeys.length}):`);
      if (globalKeys.length === 0) {
        console.log('  - No global data found.');
      } else {
        // Show ALL global keys, not just "relevant" ones
        for (const key of globalKeys) {
          await this.logKeyDetails(key);
        }
      }
      
      console.log('\n============================\n');
      
      return {
        totalKeys: allKeys.length,
        userScopedKeys: userKeys,
        globalKeys: globalKeys,
        summary: `${userKeys.length} user keys, ${globalKeys.length} global keys`
      };
      
    } catch (error) {
      console.error('❌ Storage diagnostic error:', error);
      return null;
    }
  }

  /**
   * Log detailed information about a specific key
   */
  static async logKeyDetails(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      
      if (!value) {
        console.log(`  - ${key}: (null/empty)`);
        return;
      }

      // Try to parse as JSON
      let data;
      let isJson = true;
      try {
        data = JSON.parse(value);
      } catch (e) {
        isJson = false;
        data = value;
      }

      if (isJson) {
        if (Array.isArray(data)) {
          console.log(`  - ${key}: ${data.length} items (array)`);
          
          // Show first few items with details
          const previewCount = Math.min(3, data.length);
          for (let i = 0; i < previewCount; i++) {
            const item = data[i];
            const preview = this.getItemPreview(item, i + 1);
            console.log(`    ${preview}`);
          }
          
          if (data.length > previewCount) {
            console.log(`    ... and ${data.length - previewCount} more items`);
          }
        } else {
          console.log(`  - ${key}: 1 item (object)`);
          const preview = this.getItemPreview(data, 1);
          console.log(`    ${preview}`);
        }
      } else {
        // Non-JSON data
        const preview = value.length > 50 ? value.substring(0, 50) + '...' : value;
        console.log(`  - ${key}: (string) "${preview}"`);
      }
      
    } catch (error) {
      console.log(`  - ${key}: (error reading) ${error.message}`);
    }
  }

  /**
   * Get a readable preview of an item
   */
  static getItemPreview(item, index) {
    if (!item || typeof item !== 'object') {
      return `${index}. ${item}`;
    }

    // Try different common properties for identification
    const title = item.title || item.name || item.contentId || item.id;
    const type = item.type || item.category;
    const timestamp = item.timestamp ? new Date(item.timestamp).toLocaleDateString() : '';
    
    let preview = `${index}. `;
    
    if (title) {
      preview += `"${title}"`;
    } else {
      preview += 'Untitled';
    }
    
    if (type) {
      preview += ` (${type})`;
    }
    
    if (timestamp) {
      preview += ` [${timestamp}]`;
    }

    // Add any other interesting properties
    const extraProps = [];
    if (item.publicKey) extraProps.push(`key: ${item.publicKey.substring(0, 8)}`);
    if (item.status) extraProps.push(`status: ${item.status}`);
    if (item.glyphCount) extraProps.push(`glyphs: ${item.glyphCount}`);
    if (item.size) extraProps.push(`size: ${item.size}`);
    
    if (extraProps.length > 0) {
      preview += ` {${extraProps.join(', ')}}`;
    }

    return preview;
  }

  /**
   * Show the actual raw content of a specific key
   */
  static async showRawContent(keyName) {
    try {
      console.log(`\n🔍 RAW CONTENT FOR: ${keyName}`);
      console.log('=====================================');
      
      const value = await AsyncStorage.getItem(keyName);
      if (!value) {
        console.log('(Key not found or empty)');
        return;
      }

      // Try to pretty-print JSON
      try {
        const parsed = JSON.parse(value);
        console.log(JSON.stringify(parsed, null, 2));
      } catch (e) {
        // Not JSON, show as-is
        console.log(value);
      }
      
      console.log('=====================================\n');
    } catch (error) {
      console.error(`❌ Error showing raw content for ${keyName}:`, error);
    }
  }

  /**
   * Count total items across all relevant storage keys
   */
  static async getTotalItemCounts() {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      let totalItems = 0;
      const keyCounts = {};

      for (const key of allKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          try {
            const data = JSON.parse(value);
            const count = Array.isArray(data) ? data.length : 1;
            keyCounts[key] = count;
            totalItems += count;
          } catch (e) {
            // Non-JSON data counts as 1 item
            keyCounts[key] = 1;
            totalItems += 1;
          }
        }
      }

      console.log('📊 ITEM COUNT SUMMARY:');
      console.log(`Total items across all keys: ${totalItems}`);
      Object.entries(keyCounts).forEach(([key, count]) => {
        console.log(`  ${key}: ${count} items`);
      });

      return { totalItems, keyCounts };
    } catch (error) {
      console.error('❌ Error counting items:', error);
      return null;
    }
  }
  
  /**
   * Clear all user-scoped storage for testing
   */
  static async clearUserStorage(userPublicKey) {
    const keysToDelete = [
      `user_${userPublicKey}_published_stories`,
      `user_${userPublicKey}_scrolls`
    ];
    
    await AsyncStorage.multiRemove(keysToDelete);
    console.log(`🗑️ Cleared user storage for ${userPublicKey.substring(0, 8)}`);
  }
  
  /**
   * Find specific keys that might contain arrays with many items
   */
  static async investigateArrayKeys() {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      console.log('\n🔍 INVESTIGATING ARRAY KEYS:');
      console.log('============================');
      
      let totalItemsFound = 0;
      const suspiciousKeys = [];
      
      for (const key of allKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          try {
            const data = JSON.parse(value);
            if (Array.isArray(data) && data.length > 1) {
              console.log(`📦 ${key}: ${data.length} items (ARRAY)`);
              totalItemsFound += data.length;
              suspiciousKeys.push({ key, count: data.length, type: 'array' });
              
              // Show first few items
              data.slice(0, 3).forEach((item, index) => {
                const preview = this.getItemPreview(item, index + 1);
                console.log(`    ${preview}`);
              });
              if (data.length > 3) {
                console.log(`    ... and ${data.length - 3} more items`);
              }
            } else if (typeof data === 'object' && data !== null) {
              const objKeys = Object.keys(data);
              if (objKeys.length > 1) {
                console.log(`🗂️ ${key}: ${objKeys.length} properties (OBJECT)`);
                totalItemsFound += objKeys.length;
                suspiciousKeys.push({ key, count: objKeys.length, type: 'object' });
              }
            }
          } catch (e) {
            // Not JSON, skip
          }
        }
      }
      
      console.log(`\n📊 TOTAL ITEMS FOUND: ${totalItemsFound}`);
      console.log('============================\n');
      
      return { totalItemsFound, suspiciousKeys };
    } catch (error) {
      console.error('❌ Error investigating array keys:', error);
      return { totalItemsFound: 0, suspiciousKeys: [] };
    }
  }

  /**
   * Show raw content of keys that might explain the "16 items" discrepancy
   */
  static async investigateDiscrepancy() {
    try {
      console.log('\n🕵️ INVESTIGATING STORAGE DISCREPANCY:');
      console.log('======================================');
      
      // Check all glyffiti keys
      const glyffitiKeys = [
        'glyffiti_published',
        'glyffiti_published_Ew5QUU5SU8a32RzettZsorLd6tranDzMpqGbRMkXXV2Z',
        'glyffiti_scrolls',
        'glyffiti_user_heads',
        'published_content',  // Legacy key
        'story_cache'         // Legacy key
      ];
      
      let totalItems = 0;
      
      for (const key of glyffitiKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          try {
            const data = JSON.parse(value);
            const count = Array.isArray(data) ? data.length : 
                         typeof data === 'object' ? Object.keys(data).length : 1;
            
            console.log(`🔑 ${key}: ${count} items`);
            totalItems += count;
            
            // Show actual data structure
            if (Array.isArray(data)) {
              console.log(`   Type: Array with ${data.length} elements`);
              if (data.length > 0) {
                console.log(`   First item keys: ${Object.keys(data[0] || {}).join(', ')}`);
              }
            } else if (typeof data === 'object') {
              console.log(`   Type: Object with keys: ${Object.keys(data).join(', ')}`);
            }
          } catch (e) {
            console.log(`🔑 ${key}: (invalid JSON)`);
          }
        }
      }
      
      console.log(`\n🎯 TOTAL ITEMS IN GLYFFITI KEYS: ${totalItems}`);
      console.log('======================================\n');
      
      return totalItems;
      
    } catch (error) {
      console.error('❌ Error investigating discrepancy:', error);
      return 0;
    }
  }

  /**
   * Migrate global content to user storage
   */
  static async migrateGlobalToUser(userPublicKey) {
    try {
      console.log('🔄 Starting migration from global to user storage...');
      
      // Load global published content
      const globalContent = await AsyncStorage.getItem('published_content');
      if (!globalContent) {
        console.log('No global content to migrate');
        return;
      }
      
      const content = JSON.parse(globalContent);
      const userKey = `user_${userPublicKey}_published_stories`;
      
      // Save to user storage
      await AsyncStorage.setItem(userKey, JSON.stringify(content));
      
      console.log(`✅ Migrated ${content.length} items to user storage`);
      return content.length;
      
    } catch (error) {
      console.error('❌ Migration error:', error);
      return 0;
    }
  }
}

// File length: ~6,200 characters