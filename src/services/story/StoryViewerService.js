// src/services/story/StoryViewerService.js
// Path: src/services/story/StoryViewerService.js
import { chunkReaderService } from './ChunkReaderService';
import { CompressionService } from '../compression/CompressionService';
import { HashingService } from '../hashing/HashingService';

/**
 * Core service for viewing and assembling stories from blockchain chunks
 * Handles serial loading to prevent RPC node blocking
 */
export class StoryViewerService {
  constructor() {
    this.activeStories = new Map(); // Track active story loading sessions
    this.chunkReader = chunkReaderService; // Use singleton instance
  }

  /**
   * Begin loading a story progressively
   * @param {string} storyId - The story identifier
   * @param {Object} manifest - Story manifest with chunk information
   * @param {Function} onChunkLoaded - Callback when each chunk loads (chunkIndex, content, isComplete)
   * @param {Function} onError - Error callback
   * @param {Function} onProgress - Progress callback (loaded, total, percentage)
   * @returns {Promise<void>}
   */
  async loadStoryProgressively(storyId, manifest, onChunkLoaded, onError, onProgress) {
    try {
      console.log(`Starting progressive load for story: ${storyId}`);
      
      // Validate manifest
      if (!this.validateManifest(manifest)) {
        throw new Error('Invalid manifest structure');
      }

      // Initialize loading session
      const session = {
        storyId,
        manifest,
        chunks: new Array(manifest.totalChunks).fill(null),
        loadedCount: 0,
        isActive: true,
        startTime: Date.now()
      };
      
      this.activeStories.set(storyId, session);

      // Load chunks serially
      for (let i = 0; i < manifest.chunks.length; i++) {
        // Check if session was cancelled
        if (!session.isActive) {
          console.log(`Story loading cancelled: ${storyId}`);
          return;
        }

        const chunkInfo = manifest.chunks[i];
        
        try {
          console.log(`Loading chunk ${i + 1}/${manifest.totalChunks} for story: ${storyId}`);
          
          // Load this chunk with rate limiting protection
          const chunkContent = await this.loadSingleChunk(chunkInfo, i);
          
          // Store in session
          session.chunks[chunkInfo.index] = chunkContent;
          session.loadedCount++;

          // Calculate progress
          const progress = Math.round((session.loadedCount / manifest.totalChunks) * 100);
          
          // Call progress callback
          if (onProgress) {
            onProgress(session.loadedCount, manifest.totalChunks, progress);
          }

          // Get the content assembled so far for display
          const assembledContent = this.assembleAvailableContent(session.chunks);
          const isComplete = session.loadedCount === manifest.totalChunks;
          
          // Call chunk loaded callback
          if (onChunkLoaded) {
            onChunkLoaded(chunkInfo.index, assembledContent, isComplete);
          }

          console.log(`📖 Chunk ${chunkInfo.index} loaded, content length: ${assembledContent.length}, complete: ${isComplete}`);

          // Add delay between chunks to prevent RPC rate limiting (unless it's the last chunk)
          if (i < manifest.chunks.length - 1) {
            await this.sleep(800); // 800ms delay between chunks
          }

        } catch (chunkError) {
          console.error(`Error loading chunk ${i} for story ${storyId}:`, chunkError);
          
          // For now, continue with next chunk rather than failing completely
          // This allows partial story viewing even if some chunks fail
          const partialContent = this.assembleAvailableContent(session.chunks);
          if (onChunkLoaded) {
            onChunkLoaded(i, partialContent, false);
          }
          
          // Add longer delay after error (likely rate limiting)
          await this.sleep(2000);
        }
      }

      console.log(`Completed loading story: ${storyId} in ${Date.now() - session.startTime}ms`);
      
    } catch (error) {
      console.error(`Error in progressive story loading for ${storyId}:`, error);
      if (onError) {
        onError(error);
      }
    } finally {
      // Clean up session
      this.activeStories.delete(storyId);
    }
  }

  /**
   * Load a single chunk with integrity verification
   * @param {Object} chunkInfo - Chunk metadata from manifest
   * @param {number} chunkIndex - Index of the chunk being loaded
   * @returns {Promise<string>} Decompressed chunk content
   */
  async loadSingleChunk(chunkInfo, chunkIndex) {
    try {
      // Fetch the raw chunk data from blockchain
      const rawChunkData = await this.chunkReader.fetchChunk(chunkInfo.transactionId);
      
      if (!rawChunkData) {
        throw new Error(`No data found for transaction: ${chunkInfo.transactionId}`);
      }

      // Decompress the chunk
      const decompressedContent = CompressionService.decompress(rawChunkData);
      
      // Verify integrity by checking hash
      const contentHash = await HashingService.hashContent(decompressedContent);
      if (contentHash !== chunkInfo.hash) {
        console.warn(`Hash mismatch for chunk ${chunkIndex}. Expected: ${chunkInfo.hash}, Got: ${contentHash}`);
        // Still return the content, but log the mismatch
      }

      return decompressedContent;
      
    } catch (error) {
      console.error(`Error loading chunk ${chunkIndex}:`, error);
      throw error;
    }
  }

  /**
   * Assemble available content from loaded chunks
   * @param {Array} chunks - Array of chunk contents (may have nulls for unloaded chunks)
   * @returns {string} Assembled content
   */
  assembleAvailableContent(chunks) {
    let assembledContent = '';
    
    // Concatenate all loaded chunks in order
    for (let i = 0; i < chunks.length; i++) {
      if (chunks[i] !== null) {
        assembledContent += chunks[i];
      } else {
        // Add placeholder for unloaded chunks
        assembledContent += '\n\n[Loading additional content...]\n\n';
        break; // Stop at first missing chunk to maintain reading order
      }
    }
    
    return assembledContent;
  }

  /**
   * Cancel loading for a specific story
   * @param {string} storyId - Story to cancel
   */
  cancelStoryLoading(storyId) {
    const session = this.activeStories.get(storyId);
    if (session) {
      session.isActive = false;
      console.log(`Cancelled loading for story: ${storyId}`);
    }
  }

  /**
   * Get loading status for a story
   * @param {string} storyId - Story identifier
   * @returns {Object|null} Loading status or null if not loading
   */
  getLoadingStatus(storyId) {
    const session = this.activeStories.get(storyId);
    if (!session) return null;
    
    return {
      storyId: session.storyId,
      totalChunks: session.manifest.totalChunks,
      loadedChunks: session.loadedCount,
      progress: Math.round((session.loadedCount / session.manifest.totalChunks) * 100),
      isActive: session.isActive,
      elapsedTime: Date.now() - session.startTime
    };
  }

  /**
   * Validate manifest structure
   * @param {Object} manifest - Manifest to validate
   * @returns {boolean} True if valid
   */
  validateManifest(manifest) {
    if (!manifest || typeof manifest !== 'object') {
      console.error('Manifest is not an object');
      return false;
    }

    const requiredFields = ['storyId', 'title', 'totalChunks', 'chunks'];
    for (const field of requiredFields) {
      if (!(field in manifest)) {
        console.error(`Manifest missing required field: ${field}`);
        return false;
      }
    }

    if (!Array.isArray(manifest.chunks)) {
      console.error('Manifest chunks is not an array');
      return false;
    }

    if (manifest.chunks.length !== manifest.totalChunks) {
      console.error('Manifest chunks array length does not match totalChunks');
      return false;
    }

    // Validate each chunk has required fields
    for (let i = 0; i < manifest.chunks.length; i++) {
      const chunk = manifest.chunks[i];
      if (!chunk.transactionId || !chunk.hash || chunk.index === undefined) {
        console.error(`Chunk ${i} missing required fields`);
        return false;
      }
    }

    return true;
  }

  /**
   * Utility sleep function for rate limiting
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get all currently active story loading sessions
   * @returns {Array} Array of active session info
   */
  getActiveLoadingSessions() {
    return Array.from(this.activeStories.values()).map(session => ({
      storyId: session.storyId,
      progress: Math.round((session.loadedCount / session.manifest.totalChunks) * 100),
      elapsedTime: Date.now() - session.startTime
    }));
  }
}

// Create singleton instance
export const storyViewerService = new StoryViewerService();

// Character count: 8158