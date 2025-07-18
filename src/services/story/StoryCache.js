// src/services/story/StoryCache.js
// Path: src/services/story/StoryCache.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CompressionService } from '../compression/CompressionService';

/**
 * Persistent caching service for stories
 * Handles storage, retrieval, and management of cached story content
 */
export class StoryCache {
  constructor() {
    this.STORAGE_PREFIX = '@glyffiti_story_cache_';
    this.MANIFEST_KEY = '@glyffiti_manifests';
    this.CACHE_STATS_KEY = '@glyffiti_cache_stats';
    
    // Cache configuration
    this.MAX_CACHE_SIZE_MB = 50; // Maximum cache size in MB
    this.MAX_STORIES = 100; // Maximum number of cached stories
    this.CACHE_VERSION = '1.0';
    
    // In-memory cache for quick access
    this.memoryCache = new Map();
    this.manifestCache = new Map();
    
    // Initialize cache
    this.initializeCache();
  }

  /**
   * Initialize the cache system
   */
  async initializeCache() {
    try {
      // Load manifests into memory
      await this.loadManifestsToMemory();
      
      // Clean up expired or invalid entries
      await this.cleanupCache();
      
      console.log('Story cache initialized successfully');
    } catch (error) {
      console.error('Error initializing story cache:', error);
    }
  }

  /**
   * Cache a complete story
   * @param {string} storyId - Story identifier
   * @param {Object} manifest - Story manifest
   * @param {string} content - Complete story content
   * @returns {Promise<boolean>} Success status
   */
  async cacheStory(storyId, manifest, content) {
    try {
      // Validate inputs
      if (!storyId || !manifest || !content) {
        throw new Error('Missing required parameters for caching');
      }

      // Check cache size limits
      const canCache = await this.checkCacheSpace(content);
      if (!canCache) {
        console.warn('Cache space full, cleaning old entries...');
        await this.cleanOldEntries();
      }

      // Compress content for storage
      const compressedContent = CompressionService.compress(content);
      
      // Create cache entry
      const cacheEntry = {
        storyId,
        manifest,
        content: compressedContent,
        originalSize: content.length,
        compressedSize: compressedContent.length,
        cachedAt: Date.now(),
        lastAccessed: Date.now(),
        accessCount: 0,
        version: this.CACHE_VERSION
      };

      // Store in AsyncStorage
      const storageKey = this.getStorageKey(storyId);
      await AsyncStorage.setItem(storageKey, JSON.stringify(cacheEntry));

      // Update in-memory cache
      this.memoryCache.set(storyId, {
        ...cacheEntry,
        content: content // Keep uncompressed in memory
      });

      // Update manifest cache
      this.manifestCache.set(storyId, manifest);
      await this.saveManifestsToStorage();

      // Update cache statistics
      await this.updateCacheStats();

      console.log(`Story cached successfully: ${storyId}`);
      return true;

    } catch (error) {
      console.error(`Error caching story ${storyId}:`, error);
      return false;
    }
  }

  /**
   * Retrieve a cached story
   * @param {string} storyId - Story identifier
   * @returns {Promise<Object|null>} Cached story data or null
   */
  async getCachedStory(storyId) {
    try {
      // Check memory cache first
      const memoryEntry = this.memoryCache.get(storyId);
      if (memoryEntry) {
        // Update access stats
        memoryEntry.lastAccessed = Date.now();
        memoryEntry.accessCount++;
        
        return {
          manifest: memoryEntry.manifest,
          content: memoryEntry.content,
          metadata: {
            cachedAt: memoryEntry.cachedAt,
            lastAccessed: memoryEntry.lastAccessed,
            accessCount: memoryEntry.accessCount
          }
        };
      }

      // Load from AsyncStorage
      const storageKey = this.getStorageKey(storyId);
      const cachedData = await AsyncStorage.getItem(storageKey);
      
      if (!cachedData) {
        return null;
      }

      const cacheEntry = JSON.parse(cachedData);
      
      // Validate cache entry
      if (!this.validateCacheEntry(cacheEntry)) {
        console.warn(`Invalid cache entry for story: ${storyId}`);
        await this.removeCachedStory(storyId);
        return null;
      }

      // Decompress content
      const decompressedContent = CompressionService.decompress(cacheEntry.content);
      
      // Update access stats
      cacheEntry.lastAccessed = Date.now();
      cacheEntry.accessCount = (cacheEntry.accessCount || 0) + 1;
      
      // Update storage with new access stats
      await AsyncStorage.setItem(storageKey, JSON.stringify(cacheEntry));

      // Add to memory cache
      this.memoryCache.set(storyId, {
        ...cacheEntry,
        content: decompressedContent
      });

      return {
        manifest: cacheEntry.manifest,
        content: decompressedContent,
        metadata: {
          cachedAt: cacheEntry.cachedAt,
          lastAccessed: cacheEntry.lastAccessed,
          accessCount: cacheEntry.accessCount
        }
      };

    } catch (error) {
      console.error(`Error retrieving cached story ${storyId}:`, error);
      return null;
    }
  }

  /**
   * Check if a story is cached
   * @param {string} storyId - Story identifier
   * @returns {Promise<boolean>} True if cached
   */
  async isStoryCached(storyId) {
    // Check memory cache first
    if (this.memoryCache.has(storyId)) {
      return true;
    }

    // Check manifest cache
    if (this.manifestCache.has(storyId)) {
      return true;
    }

    // Check AsyncStorage
    try {
      const storageKey = this.getStorageKey(storyId);
      const cachedData = await AsyncStorage.getItem(storageKey);
      return cachedData !== null;
    } catch (error) {
      console.error(`Error checking cache for story ${storyId}:`, error);
      return false;
    }
  }

  /**
   * Remove a story from cache
   * @param {string} storyId - Story identifier
   * @returns {Promise<boolean>} Success status
   */
  async removeCachedStory(storyId) {
    try {
      // Remove from memory cache
      this.memoryCache.delete(storyId);
      this.manifestCache.delete(storyId);

      // Remove from AsyncStorage
      const storageKey = this.getStorageKey(storyId);
      await AsyncStorage.removeItem(storageKey);

      // Update manifests in storage
      await this.saveManifestsToStorage();

      // Update cache stats
      await this.updateCacheStats();

      console.log(`Removed story from cache: ${storyId}`);
      return true;

    } catch (error) {
      console.error(`Error removing cached story ${storyId}:`, error);
      return false;
    }
  }

  /**
   * Get all cached story manifests
   * @returns {Promise<Array>} Array of manifests
   */
  async getAllCachedManifests() {
    try {
      // Return from memory cache if available
      if (this.manifestCache.size > 0) {
        return Array.from(this.manifestCache.values());
      }

      // Load from storage
      const manifestsData = await AsyncStorage.getItem(this.MANIFEST_KEY);
      if (manifestsData) {
        const manifests = JSON.parse(manifestsData);
        
        // Update memory cache
        manifests.forEach(manifest => {
          this.manifestCache.set(manifest.storyId, manifest);
        });

        return manifests;
      }

      return [];

    } catch (error) {
      console.error('Error getting cached manifests:', error);
      return [];
    }
  }

  /**
   * Get cache statistics
   * @returns {Promise<Object>} Cache statistics
   */
  async getCacheStats() {
    try {
      const statsData = await AsyncStorage.getItem(this.CACHE_STATS_KEY);
      let stats = statsData ? JSON.parse(statsData) : {};

      // Calculate current stats
      const cachedStories = await this.getAllCachedManifests();
      const totalSizeMB = await this.calculateTotalCacheSize();

      const currentStats = {
        totalStories: cachedStories.length,
        totalSizeMB: totalSizeMB,
        maxSizeMB: this.MAX_CACHE_SIZE_MB,
        maxStories: this.MAX_STORIES,
        utilizationPercent: Math.round((totalSizeMB / this.MAX_CACHE_SIZE_MB) * 100),
        lastUpdated: Date.now(),
        ...stats
      };

      // Save updated stats
      await AsyncStorage.setItem(this.CACHE_STATS_KEY, JSON.stringify(currentStats));

      return currentStats;

    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        totalStories: 0,
        totalSizeMB: 0,
        maxSizeMB: this.MAX_CACHE_SIZE_MB,
        maxStories: this.MAX_STORIES,
        utilizationPercent: 0,
        lastUpdated: Date.now()
      };
    }
  }

  /**
   * Clear all cached stories
   * @returns {Promise<boolean>} Success status
   */
  async clearCache() {
    try {
      // Get all cached story IDs
      const manifests = await this.getAllCachedManifests();
      
      // Remove each story
      for (const manifest of manifests) {
        await this.removeCachedStory(manifest.storyId);
      }

      // Clear memory caches
      this.memoryCache.clear();
      this.manifestCache.clear();

      // Remove manifests storage
      await AsyncStorage.removeItem(this.MANIFEST_KEY);
      await AsyncStorage.removeItem(this.CACHE_STATS_KEY);

      console.log('Cache cleared successfully');
      return true;

    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }

  // Private helper methods

  getStorageKey(storyId) {
    return `${this.STORAGE_PREFIX}${storyId}`;
  }

  async loadManifestsToMemory() {
    const manifests = await this.getAllCachedManifests();
    manifests.forEach(manifest => {
      this.manifestCache.set(manifest.storyId, manifest);
    });
  }

  async saveManifestsToStorage() {
    const manifests = Array.from(this.manifestCache.values());
    await AsyncStorage.setItem(this.MANIFEST_KEY, JSON.stringify(manifests));
  }

  validateCacheEntry(entry) {
    return entry && 
           entry.storyId && 
           entry.manifest && 
           entry.content &&
           entry.version === this.CACHE_VERSION;
  }

  async checkCacheSpace(content) {
    const stats = await this.getCacheStats();
    const contentSizeMB = (content.length / 1024 / 1024);
    
    return (stats.totalSizeMB + contentSizeMB) <= this.MAX_CACHE_SIZE_MB &&
           stats.totalStories < this.MAX_STORIES;
  }

  async cleanOldEntries() {
    // Implementation for cleaning old cache entries based on access patterns
    // This would remove least recently used entries
    console.log('Cleaning old cache entries...');
  }

  async calculateTotalCacheSize() {
    // Calculate total cache size in MB
    let totalSize = 0;
    
    for (const [storyId] of this.manifestCache) {
      try {
        const storageKey = this.getStorageKey(storyId);
        const data = await AsyncStorage.getItem(storageKey);
        if (data) {
          totalSize += data.length;
        }
      } catch (error) {
        console.error(`Error calculating size for ${storyId}:`, error);
      }
    }

    return totalSize / 1024 / 1024; // Convert to MB
  }

  async updateCacheStats() {
    await this.getCacheStats(); // This will update and save stats
  }

  async cleanupCache() {
    // Remove invalid or expired entries
    const manifests = await this.getAllCachedManifests();
    
    for (const manifest of manifests) {
      const cached = await this.getCachedStory(manifest.storyId);
      if (!cached) {
        this.manifestCache.delete(manifest.storyId);
      }
    }

    await this.saveManifestsToStorage();
  }
}

// Export singleton instance
export const storyCache = new StoryCache();

// 3,472 characters