// src/services/story/StoryViewerService-M.js
// NOTE: This is the complete file. Replaces the current -M service.
// It adds progressive loading compatible with useStoryViewer and only
// accepts the g-mt-v1 glyph protocol.

import { chunkReaderService } from './ChunkReaderService';
import { CompressionService } from '../compression/CompressionService';
import { TextProcessor } from '../glyph/processing/TextProcessor';

// If/when you re-enable proof checks, wire MerkleBuilder-M back in
// import MerkleBuilderM from '../merkle/MerkleBuilder-M';
// import { UserStorageService } from '../storage/UserStorageService';

const PROTOCOL = 'g-mt-v1';

class StoryViewerServiceM {
  // Track active progressive sessions by storyId
  static _active = new Map();

  /**
   * Progressive loader compatible with the legacy StoryViewerService API.
   * - Decodes each memo as a g-mt-v1 glyph JSON and appends glyph.c (text).
   * - Accepts manifests whose chunks are either txid strings OR objects with
   *   { transactionId | txId, index? }.
   */
  static async loadStoryProgressively(storyId, manifest, onChunkLoaded, onError, onProgress) {
    try {
      console.log(`Starting progressive load for story: ${storyId}`);

      // Normalize manifest (support both shapes)
      const normalized = StoryViewerServiceM._normalizeManifest(manifest);

      // Create session
      const session = {
        storyId,
        manifest: normalized,
        chunks: new Array(normalized.totalChunks).fill(null),
        loadedCount: 0,
        isActive: true,
        startTime: Date.now(),
      };

      this._active.set(storyId, session);

      // Serially read each tx and reassemble in glyph-index order
      for (let i = 0; i < normalized.chunks.length; i++) {
        if (!session.isActive) {
          console.log(`Story loading cancelled: ${storyId}`);
          return;
        }

        const { transactionId, index: indexFromManifest } = normalized.chunks[i];

        try {
          console.log(`Loading chunk ${i + 1}/${normalized.totalChunks} for story: ${storyId}`);
          const glyph = await this._fetchAndDecodeGlyph(transactionId);
          if (!glyph) throw new Error(`Failed to decode glyph for ${transactionId}`);

          const glyphIndex = Number.isInteger(glyph.index)
            ? glyph.index
            : (Number.isInteger(indexFromManifest) ? indexFromManifest : i);

          // Place text content by glyph index
          session.chunks[glyphIndex] = glyph.content;
          session.loadedCount++;

          // Progress callback
          const progressPercent = Math.round((session.loadedCount / normalized.totalChunks) * 100);
          if (onProgress) onProgress(session.loadedCount, normalized.totalChunks, progressPercent);

          // Assemble up to first missing piece to preserve reading order
          const assembled = StoryViewerServiceM._assembleAvailable(session.chunks);
          const isComplete = session.loadedCount === normalized.totalChunks;

          if (onChunkLoaded) onChunkLoaded(glyphIndex, assembled, isComplete);

          console.log(
            `📖 Chunk ${glyphIndex} loaded, content length: ${assembled.length}, complete: ${isComplete}`
          );

          // Gentle pacing to avoid RPC throttling
          if (i < normalized.chunks.length - 1) {
            await StoryViewerServiceM._sleep(800);
          }
        } catch (chunkErr) {
          console.error(`Error loading chunk ${i} for story ${storyId}:`, chunkErr);

          // Surface partial content so the reader can continue
          const partial = StoryViewerServiceM._assembleAvailable(session.chunks);
          if (onChunkLoaded) onChunkLoaded(i, partial, false);

          // Slightly longer pause after an error
          await StoryViewerServiceM._sleep(2000);
        }
      }

      console.log(`Completed loading story: ${storyId} in ${Date.now() - session.startTime}ms`);
    } catch (err) {
      console.error(`Error in progressive story loading for ${storyId}:`, err);
      if (onError) onError(err);
    } finally {
      this._active.delete(storyId);
    }
  }

  static cancelStoryLoading(storyId) {
    const session = this._active.get(storyId);
    if (session) {
      session.isActive = false;
      console.log(`Cancelled loading for story: ${storyId}`);
    }
  }

  static getLoadingStatus(storyId) {
    const session = this._active.get(storyId);
    if (!session) return null;
    return {
      storyId: session.storyId,
      totalChunks: session.manifest.totalChunks,
      loadedChunks: session.loadedCount,
      progress: Math.round((session.loadedCount / session.manifest.totalChunks) * 100),
      isActive: session.isActive,
      elapsedTime: Date.now() - session.startTime,
    };
  }

  // ===== Private helpers =====

  static _normalizeManifest(manifest) {
    if (!manifest || typeof manifest !== 'object') {
      throw new Error('Manifest is not an object');
    }
    if (!Array.isArray(manifest.chunks) || manifest.chunks.length === 0) {
      throw new Error('Manifest has no chunks');
    }

    // Accept string[] (txids) or object[]
    const chunksAsObjects = manifest.chunks.map((c, idx) => {
      if (typeof c === 'string') {
        return { transactionId: c, index: idx };
      }
      const tx =
        c.transactionId ??
        c.txId ??
        c.signature ??
        c.sig ??
        null;
      if (!tx) throw new Error(`Chunk ${idx} missing transaction id`);
      const index = Number.isInteger(c.index) ? c.index : idx;
      return { transactionId: tx, index };
    });

    const total = Number.isInteger(manifest.totalChunks)
      ? manifest.totalChunks
      : chunksAsObjects.length;

    return {
      ...manifest,
      chunks: chunksAsObjects,
      totalChunks: total,
    };
  }

  static _assembleAvailable(chunks) {
    let out = '';
    for (let i = 0; i < chunks.length; i++) {
      if (chunks[i] == null) {
        out += '\n\n[Loading additional content...]\n\n';
        break;
      }
      out += chunks[i];
    }
    return out;
  }

  static _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Fetch + decode a single glyph memo:
   *  - Fetch memo bytes
   *  - Decompress to JSON string
   *  - Parse and verify protocol/type
   *  - Return { content, index, total, sid }
   */
  static async _fetchAndDecodeGlyph(transactionId) {
    try {
      // chunkReaderService returns memo bytes (already base64-decoded from the wire)
      const memoBytes = await chunkReaderService.fetchChunk(transactionId);
      if (!memoBytes || memoBytes.length === 0) throw new Error('Empty memo');

      const json = CompressionService.decompress(memoBytes); // string
      const glyph = JSON.parse(json);

      // Enforce the single protocol
      if (glyph.p !== PROTOCOL || glyph.t !== 'glyph') {
        throw new Error(`Unsupported glyph protocol or type: ${glyph.p}/${glyph.t}`);
      }

      return {
        content: glyph.c,
        index: Number(glyph.i),
        total: Number(glyph.tc),
        sid: glyph.sid,
      };
    } catch (error) {
      console.error(
        `StoryViewerService-M: Failed to decode glyph for TX_ID ${transactionId}:`,
        error
      );
      return null;
    }
  }

  // ===== Non-progressive method left here for future proofing =====
  // If you later want one-shot fetch+verify of a single glyph against a Merkle root,
  // bring back MerkleBuilderM + UserStorageService and reconstruct leaves here.
  // static async fetchAndVerifyStory(firstGlyphTxId, authorPublicKey) { ... }
}

export default StoryViewerServiceM;
