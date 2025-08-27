// src/hooks/useStoryViewer.js
// Path: src/hooks/useStoryViewer.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, Share } from 'react-native';
import StoryViewerServiceM from '../services/story/StoryViewerService-M';
import { storyCache } from '../services/story/StoryCache';

/**
 * Custom hook for story viewing functionality
 * Centralizes all story viewer logic including progressive loading, caching, and UI controls
 * @param {string} initialStoryId - Initial story ID
 * @param {Object} initialManifest - Initial story manifest
 * @param {Object} options - Configuration options
 * @returns {Object} Story viewer state and methods
 */
export const useStoryViewer = (initialStoryId = null, initialManifest = null, options = {}) => {
  const {
    autoStart = true,
    cacheEnabled = true,
    defaultFontSize = 16,
    defaultDarkMode = false,
    navigation = null
  } = options;

  // Core story state
  const [storyId, setStoryId] = useState(initialStoryId);
  const [manifest, setManifest] = useState(initialManifest);
  const [content, setContent] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({
    loaded: 0,
    total: 0,
    percentage: 0
  });
  const [loadingStartTime, setLoadingStartTime] = useState(null);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(null);
  
  // UI preferences
  const [fontSize, setFontSize] = useState(defaultFontSize);
  const [isDarkMode, setIsDarkMode] = useState(defaultDarkMode);
  const [showControls, setShowControls] = useState(false);
  
  // Cache state
  const [isCached, setIsCached] = useState(false);
  const [cacheStats, setCacheStats] = useState(null);
  
  // Refs for cleanup and state tracking
  const storyIdRef = useRef(storyId);
  const isLoadingRef = useRef(false);
  const autoStartRef = useRef(autoStart);
  
  // Update refs when values change
  useEffect(() => {
    storyIdRef.current = storyId;
  }, [storyId]);
  
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // ====================
  // Cache Management
  // ====================
  
  /**
   * Check if story is cached
   */
  const checkCache = useCallback(async () => {
    if (!storyId || !cacheEnabled) return false;
    
    try {
      const cached = await storyCache.isStoryCached(storyId);
      setIsCached(cached);
      return cached;
    } catch (error) {
      console.error('Error checking cache:', error);
      return false;
    }
  }, [storyId, cacheEnabled]);
  
  /**
   * Load story from cache
   */
  const loadFromCache = useCallback(async () => {
    if (!storyId || !cacheEnabled) return false;
    
    try {
      const cachedData = await storyCache.getCachedStory(storyId);
      if (cachedData) {
        setContent(cachedData.content);
        setManifest(cachedData.manifest);
        setIsComplete(true);
        setIsCached(true);
        console.log(`✅ Story loaded from cache: ${storyId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading from cache:', error);
      return false;
    }
  }, [storyId, cacheEnabled]);
  
  /**
   * Save story to cache
   */
  const saveToCache = useCallback(async () => {
    if (!storyId || !manifest || !content || !isComplete || !cacheEnabled) return;
    
    try {
      await storyCache.cacheStory(storyId, manifest, content);
      setIsCached(true);
      console.log(`💾 Story cached: ${storyId}`);
    } catch (error) {
      console.error('Error caching story:', error);
    }
  }, [storyId, manifest, content, isComplete, cacheEnabled]);

  // ====================
  // Progressive Loading
  // ====================
  
  /**
   * Handle chunk loaded callback
   */
  const handleChunkLoaded = useCallback((chunkIndex, assembledContent, complete) => {
    if (storyIdRef.current === storyId && isLoadingRef.current) {
      setContent(assembledContent);
      setIsComplete(complete);
      
      if (complete) {
        setIsLoading(false);
        console.log(`✅ Story loading completed: ${storyId}`);
        // Save to cache when complete
        if (cacheEnabled) {
          saveToCache();
        }
      }
    }
  }, [storyId, cacheEnabled, saveToCache]);
  
  /**
   * Handle progress updates
   */
  const handleProgress = useCallback((loaded, total, percentage) => {
    if (storyIdRef.current === storyId && isLoadingRef.current) {
      setProgress({ loaded, total, percentage });
      
      // Calculate estimated time remaining
      if (loadingStartTime && loaded > 0) {
        const elapsedTime = Date.now() - loadingStartTime;
        const timePerChunk = elapsedTime / loaded;
        const remainingChunks = total - loaded;
        const estimatedRemaining = Math.round((timePerChunk * remainingChunks) / 1000);
        setEstimatedTimeRemaining(estimatedRemaining);
      }
    }
  }, [storyId, loadingStartTime]);
  
  /**
   * Handle loading errors
   */
  const handleError = useCallback((error) => {
    if (storyIdRef.current === storyId) {
      console.error(`❌ Error loading story ${storyId}:`, error);
      setError(error.message || 'Failed to load story');
      setIsLoading(false);
    }
  }, [storyId]);
  
  /**
   * Start loading story
   */
  const startLoading = useCallback(async (manifestToUse = null) => {
    if (!storyId) {
      setError('No story ID provided');
      return;
    }
    
    // Check cache first
    if (cacheEnabled) {
      const loadedFromCache = await loadFromCache();
      if (loadedFromCache) {
        return; // Successfully loaded from cache
      }
    }
    
    console.log(`🚀 Starting to load story: ${storyId}`);
    
    // Reset state
    setIsLoading(true);
    setError(null);
    setContent('');
    setIsComplete(false);
    setProgress({ loaded: 0, total: 0, percentage: 0 });
    setLoadingStartTime(Date.now());
    setEstimatedTimeRemaining(null);
    
    try {
      const manifestToLoad = manifestToUse || manifest;
      
      if (!manifestToLoad) {
        throw new Error('No manifest provided');
      }
      
      // Store manifest if not already set
      if (!manifest) {
        setManifest(manifestToLoad);
      }
      
      const fixedManifest = (() => {
        const m = manifestToLoad;
          if (!m || !Array.isArray(m.chunks)) throw new Error('Invalid manifest structure');
            if (typeof m.totalChunks !== 'number' || m.totalChunks !== m.chunks.length) {
              return { ...m, totalChunks: m.chunks.length };
            }
            return m;
          })();

      // Start progressive loading
      await StoryViewerServiceM.loadStoryProgressively(
        storyId,
        fixedManifest,
        handleChunkLoaded,
        handleError,
        handleProgress
      );
      
    } catch (error) {
      handleError(error);
    }
  }, [storyId, manifest, cacheEnabled, loadFromCache, handleChunkLoaded, handleError, handleProgress]);
  


  
  /**
   * Stop loading
   */
  const stopLoading = useCallback(() => {
    if (storyId && isLoading) {
      console.log(`⏹️ Cancelling story loading: ${storyId}`);
      StoryViewerServiceM.cancelStoryLoading(storyId);
      setIsLoading(false);
    }
  }, [storyId, isLoading]);
  
  /**
   * Restart loading
   */
  const restartLoading = useCallback(() => {
    console.log(`🔄 Restarting story loading: ${storyId}`);
    stopLoading();
    setTimeout(() => {
      startLoading();
    }, 100);
  }, [stopLoading, startLoading]);

  // ====================
  // UI Controls
  // ====================
  
  /**
   * Increase font size
   */
  const increaseFontSize = useCallback(() => {
    setFontSize(prev => Math.min(prev + 2, 24));
  }, []);
  
  /**
   * Decrease font size
   */
  const decreaseFontSize = useCallback(() => {
    setFontSize(prev => Math.max(prev - 2, 12));
  }, []);
  
  /**
   * Toggle controls visibility
   */
  const toggleControls = useCallback(() => {
    setShowControls(prev => !prev);
  }, []);
  
  /**
   * Toggle dark mode
   */
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  // ====================
  // Navigation & Sharing
  // ====================
  
  /**
   * Handle back navigation
   */
  const handleBack = useCallback((onBack) => {
    if (isLoading) {
      Alert.alert(
        'Stop Loading?',
        'The story is still loading. Do you want to stop and go back?',
        [
          { text: 'Continue Loading', style: 'cancel' },
          { 
            text: 'Stop & Go Back', 
            style: 'destructive',
            onPress: () => {
              stopLoading();
              if (onBack) onBack();
              else if (navigation) navigation.goBack();
            }
          }
        ]
      );
    } else {
      if (onBack) onBack();
      else if (navigation) navigation.goBack();
    }
  }, [isLoading, stopLoading, navigation]);
  
  /**
   * Handle story sharing
   */
  const handleShare = useCallback(async () => {
    if (!manifest) {
      Alert.alert('Error', 'Story information not available');
      return;
    }
    
    try {
      const shareContent = {
        title: `"${manifest.title}" by ${manifest.author}`,
        message: `Check out this story on Glyffiti: "${manifest.title}" by ${manifest.author}\n\n${
          content.substring(0, 200) + (content.length > 200 ? '...' : '')
        }`,
      };
      
      const result = await Share.share(shareContent);
      
      if (result.action === Share.sharedAction) {
        console.log('Story shared successfully');
      }
    } catch (error) {
      console.error('Error sharing story:', error);
      Alert.alert('Error', 'Failed to share story');
    }
  }, [manifest, content]);

  // ====================
  // Utility Functions
  // ====================
  
  /**
   * Get reading time estimate
   */
  const getReadingTimeEstimate = useCallback(() => {
    if (!content) return null;
    
    const wordCount = content.split(/\s+/).length;
    const readingTimeMinutes = Math.ceil(wordCount / 200);
    
    return {
      wordCount,
      readingTimeMinutes,
      readingTimeText: readingTimeMinutes === 1 ? '1 min read' : `${readingTimeMinutes} min read`
    };
  }, [content]);
  
  /**
   * Get loading statistics
   */
  const getLoadingStats = useCallback(() => {
    return {
      chunksLoaded: progress.loaded,
      totalChunks: progress.total,
      percentComplete: progress.percentage,
      timeElapsed: loadingStartTime ? Math.round((Date.now() - loadingStartTime) / 1000) : 0,
      estimatedTimeRemaining
    };
  }, [progress, loadingStartTime, estimatedTimeRemaining]);
  
  /**
   * Load a new story
   */
  const loadStory = useCallback((newStoryId, newManifest) => {
    if (isLoading) {
      stopLoading();
    }
    
    setStoryId(newStoryId);
    setManifest(newManifest);
    setContent('');
    setIsComplete(false);
    setError(null);
    
    // Auto-start if enabled
    if (autoStartRef.current) {
      setTimeout(() => {
        startLoading(newManifest);
      }, 100);
    }
  }, [isLoading, stopLoading, startLoading]);

  // ====================
  // Effects
  // ====================
  
  // Auto-start loading if enabled
  useEffect(() => {
    if (autoStart && storyId && manifest && !isLoading && !content && !error) {
      console.log(`⚡ Auto-starting story load for: ${storyId}`);
      startLoading(manifest);
    }
  }, [autoStart, storyId, manifest, isLoading, content, error, startLoading]);
  
  // Check cache when story changes
  useEffect(() => {
    if (storyId) {
      checkCache();
    }
  }, [storyId, checkCache]);
  
  // Update cache stats periodically
  useEffect(() => {
    const updateCacheStats = async () => {
      if (cacheEnabled) {
        const stats = await storyCache.getCacheStats();
        setCacheStats(stats);
      }
    };
    
    updateCacheStats();
    const interval = setInterval(updateCacheStats, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [cacheEnabled]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (storyIdRef.current && isLoadingRef.current) {
        console.log(`🧹 Cleaning up story loading: ${storyIdRef.current}`);
        StoryViewerServiceM.cancelStoryLoading(storyIdRef.current);
      }
    };
  }, []);
  
  // Cancel loading when story changes
  useEffect(() => {
    if (isLoading && storyId !== storyIdRef.current) {
      console.log(`📝 Story ID changed, stopping previous load`);
      stopLoading();
    }
  }, [storyId, isLoading, stopLoading]);

  // ====================
  // Return Interface
  // ====================
  
  return {
    // Story state
    storyId,
    manifest,
    content,
    isComplete,
    
    // Loading state
    isLoading,
    error,
    progress,
    estimatedTimeRemaining,
    loadingStartTime,
    
    // UI preferences
    fontSize,
    isDarkMode,
    showControls,
    
    // Cache state
    isCached,
    cacheStats,
    
    // Core actions
    startLoading,
    stopLoading,
    restartLoading,
    loadStory,
    
    // UI controls
    increaseFontSize,
    decreaseFontSize,
    toggleControls,
    toggleDarkMode,
    
    // Navigation & sharing
    handleBack,
    handleShare,
    
    // Utility functions
    getReadingTimeEstimate,
    getLoadingStats,
    checkCache,
    loadFromCache,
    saveToCache,
    
    // Computed values
    hasContent: content.length > 0,
    hasError: !!error,
    canRetry: !isLoading && !!error,
    readingTimeInfo: getReadingTimeEstimate(),
    loadingStats: getLoadingStats()
  };
};

// Character count: 13,847