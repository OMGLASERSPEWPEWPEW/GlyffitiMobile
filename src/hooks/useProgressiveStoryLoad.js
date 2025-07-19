// src/hooks/useProgressiveStoryLoad.js
// Path: src/hooks/useProgressiveStoryLoad.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { storyViewerService } from '../services/story/StoryViewerService';

/**
 * React hook for progressive story loading
 * Manages state for loading stories chunk by chunk with user feedback
 * Updated to work with mobile-compatible StoryViewerService
 * 
 * @param {string} storyId - The story identifier  
 * @param {Object} manifest - Story manifest (optional, will fetch if not provided)
 * @param {boolean} autoStart - Whether to start loading immediately (default: false)
 * @returns {Object} Hook state and control functions
 */
export function useProgressiveStoryLoad(storyId, manifest = null, autoStart = false) {
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [content, setContent] = useState('');
  
  // Progress tracking
  const [progress, setProgress] = useState({
    loaded: 0,
    total: 0,
    percentage: 0
  });
  
  // Story metadata
  const [storyManifest, setStoryManifest] = useState(manifest);
  const [isComplete, setIsComplete] = useState(false);
  
  // Loading session info
  const [loadingStartTime, setLoadingStartTime] = useState(null);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(null);
  
  // Refs to prevent stale closures
  const storyIdRef = useRef(storyId);
  const isLoadingRef = useRef(false);
  
  // Update refs when props change
  useEffect(() => {
    storyIdRef.current = storyId;
  }, [storyId]);
  
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // Callback for when each chunk loads
  const handleChunkLoaded = useCallback((chunkIndex, assembledContent, complete) => {
    // Only update if this is still the current story being loaded
    if (storyIdRef.current === storyId && isLoadingRef.current) {
      console.log(`📖 Chunk ${chunkIndex} loaded, content length: ${assembledContent.length}, complete: ${complete}`);
      setContent(assembledContent);
      setIsComplete(complete);
      
      if (complete) {
        setIsLoading(false);
        console.log(`✅ Story loading completed: ${storyId}`);
      }
    }
  }, [storyId]);

  // Callback for progress updates
  const handleProgress = useCallback((loaded, total, percentage) => {
    // Only update if this is still the current story being loaded
    if (storyIdRef.current === storyId && isLoadingRef.current) {
      console.log(`📊 Progress: ${loaded}/${total} (${percentage}%)`);
      setProgress({ loaded, total, percentage });
      
      // Calculate estimated time remaining based on current progress
      if (loadingStartTime && loaded > 0) {
        const elapsedTime = Date.now() - loadingStartTime;
        const timePerChunk = elapsedTime / loaded;
        const remainingChunks = total - loaded;
        const estimatedRemaining = Math.round((timePerChunk * remainingChunks) / 1000); // in seconds
        
        setEstimatedTimeRemaining(estimatedRemaining);
      }
    }
  }, [storyId, loadingStartTime]);

  // Callback for errors
  const handleError = useCallback((error) => {
    if (storyIdRef.current === storyId) {
      console.error(`❌ Error loading story ${storyId}:`, error);
      setError(error.message || 'Failed to load story');
      setIsLoading(false);
    }
  }, [storyId]);

  // Function to start loading the story
  const startLoading = useCallback(async (manifestToUse = null) => {
    if (!storyId) {
      setError('No story ID provided');
      return;
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
      // Use provided manifest or the one from state
      const manifestToLoad = manifestToUse || storyManifest;
      
      if (!manifestToLoad) {
        throw new Error('No manifest provided. Please provide a manifest to load the story.');
      }

      // Store manifest in state if not already there
      if (!storyManifest) {
        setStoryManifest(manifestToLoad);
      }

      console.log(`📋 Using manifest:`, {
        storyId: manifestToLoad.storyId,
        title: manifestToLoad.title,
        totalChunks: manifestToLoad.totalChunks,
        chunksCount: manifestToLoad.chunks?.length
      });
      
      // Start the progressive loading using updated story viewer service
      await storyViewerService.loadStoryProgressively(
        storyId,
        manifestToLoad,
        handleChunkLoaded,
        handleError,
        handleProgress
      );
      
    } catch (error) {
      console.error(`❌ Error starting story load:`, error);
      handleError(error);
    }
  }, [storyId, storyManifest, handleChunkLoaded, handleError, handleProgress]);

  // Function to stop/cancel loading
  const stopLoading = useCallback(() => {
    if (storyId && isLoading) {
      console.log(`⏹️ Cancelling story loading: ${storyId}`);
      storyViewerService.cancelStoryLoading(storyId);
      setIsLoading(false);
    }
  }, [storyId, isLoading]);

  // Function to restart loading
  const restartLoading = useCallback(() => {
    console.log(`🔄 Restarting story loading: ${storyId}`);
    stopLoading();
    setTimeout(() => {
      startLoading();
    }, 100); // Small delay to ensure cleanup
  }, [stopLoading, startLoading]);

  // Auto-start loading if enabled
  useEffect(() => {
    if (autoStart && storyId && manifest && !isLoading && !content) {
      console.log(`⚡ Auto-starting story load for: ${storyId}`);
      startLoading(manifest);
    }
  }, [autoStart, storyId, manifest, isLoading, content, startLoading]);

  // Cleanup on unmount or storyId change
  useEffect(() => {
    return () => {
      if (storyIdRef.current && isLoadingRef.current) {
        console.log(`🧹 Cleaning up story loading: ${storyIdRef.current}`);
        storyViewerService.cancelStoryLoading(storyIdRef.current);
      }
    };
  }, []);

  // Cancel loading when storyId changes
  useEffect(() => {
    if (isLoading) {
      console.log(`📝 Story ID changed, stopping previous load`);
      stopLoading();
    }
  }, [storyId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Get current loading status from service
  const getDetailedStatus = useCallback(() => {
    if (!storyId) return null;
    return storyViewerService.getLoadingStatus(storyId);
  }, [storyId]);

  // Calculate reading time estimate (assuming 200 words per minute)
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

  return {
    // Content state
    content,
    manifest: storyManifest,
    isComplete,
    
    // Loading state
    isLoading,
    error,
    
    // Progress tracking
    progress,
    estimatedTimeRemaining,
    loadingStartTime,
    
    // Control functions
    startLoading,
    stopLoading,
    restartLoading,
    
    // Utility functions
    getDetailedStatus,
    getReadingTimeEstimate,
    
    // Computed values
    hasContent: content.length > 0,
    hasError: !!error,
    canRetry: !isLoading && !!error,
    
    // Loading statistics
    loadingStats: {
      chunksLoaded: progress.loaded,
      totalChunks: progress.total,
      percentComplete: progress.percentage,
      timeElapsed: loadingStartTime ? Math.round((Date.now() - loadingStartTime) / 1000) : 0,
      estimatedTimeRemaining
    }
  };
}

// Helper hook for loading multiple stories (for story lists)
export function useMultipleStoryLoad(storyIds = []) {
  const [loadingStories, setLoadingStories] = useState(new Set());
  const [loadedStories, setLoadedStories] = useState(new Map());
  const [errors, setErrors] = useState(new Map());

  const loadStory = useCallback((storyId, manifest) => {
    setLoadingStories(prev => new Set([...prev, storyId]));
    setErrors(prev => {
      const newErrors = new Map(prev);
      newErrors.delete(storyId);
      return newErrors;
    });

    storyViewerService.loadStoryProgressively(
      storyId,
      manifest,
      (chunkIndex, content, isComplete) => {
        if (isComplete) {
          setLoadedStories(prev => new Map([...prev, [storyId, content]]));
          setLoadingStories(prev => {
            const newSet = new Set(prev);
            newSet.delete(storyId);
            return newSet;
          });
        }
      },
      (error) => {
        setErrors(prev => new Map([...prev, [storyId, error.message]]));
        setLoadingStories(prev => {
          const newSet = new Set(prev);
          newSet.delete(storyId);
          return newSet;
        });
      }
    );
  }, []);

  return {
    loadStory,
    loadingStories: Array.from(loadingStories),
    loadedStories: Object.fromEntries(loadedStories),
    errors: Object.fromEntries(errors),
    isLoading: loadingStories.size > 0
  };
}

// Character count: 8,158