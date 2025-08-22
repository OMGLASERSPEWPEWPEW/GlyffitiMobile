// src/services/publishing/PublishingService-M.js
import { blockchainServices } from '../blockchain/BlockchainService';

/**
 * Manages the process of taking prepared Merkle-based content and publishing
 * it to the blockchain.
 */
class PublishingServiceM {
  /**
   * Serializes a glyph object into a JSON string suitable for a transaction memo.
   * Uses short keys to conserve space.
   * @param {object} glyph - The prepared glyph object from ChunkManagerM.
   * @param {number|null} reGlyphCap - The re-glyph cap for the story.
   * @returns {string} A JSON string representing the memo.
   * @private
   */
  static _serializeGlyphToMemo(glyph, reGlyphCap) {
    const memoObject = {
      p: 'glyffiti-m-v1', // Protocol: glyffiti-merkle-version-1
      i: glyph.index,
      t: glyph.totalGlyphs,
      r: glyph.unifiedRoot,
      c: glyph.content,
      pr: glyph.merkleProof,
    };

    // As per ADR-002, the re-glyph cap is only included in the first glyph
    // to save space on subsequent transactions.
    if (glyph.index === 0 && reGlyphCap !== null) {
      memoObject.rgc = reGlyphCap;
    }

    return JSON.stringify(memoObject);
  }

  /**
   * Publishes a story prepared with the Unified Merkle Tree architecture.
   * @param {object} preparedMerkleContent - The package from ContentServiceM.
   * @param {object} keypair - The user's wallet keypair for signing transactions.
   * @param {function(object): void} [onProgress] - Optional callback for progress updates.
   * Receives an object like { current, total }.
   * @returns {Promise<string[]>} A promise that resolves to an array of transaction IDs.
   */
  static async publishStory(preparedMerkleContent, keypair, onProgress) {
    console.log('PublishingService-M.js: publishStory: Beginning Merkle story publication.');
    const { glyphs, reGlyphCap } = preparedMerkleContent;
    const totalGlyphs = glyphs.length;
    const transactionIds = [];

    // Get the default blockchain publisher (e.g., SolanaPublisher)
    const publisher = blockchainServices.getPublisher();

    // We must publish glyphs sequentially to maintain order and for simpler recovery.
    for (let i = 0; i < totalGlyphs; i++) {
      const glyph = glyphs[i];
      console.log(`PublishingService-M.js: publishStory: Publishing glyph ${i + 1} of ${totalGlyphs}.`);

      if (onProgress) {
        onProgress({ current: i, total: totalGlyphs });
      }

      // 1. Serialize the glyph data into a compact memo string.
      const memo = this._serializeGlyphToMemo(glyph, reGlyphCap);

      // In a real scenario, we would check memo size against the blockchain limit here.
      // For now, we assume it fits.

      // 2. Publish the single transaction.
      // We are assuming a method `publishSingleTransaction` exists on the publisher,
      // which is a reasonable abstraction.
      const txId = await publisher.publishSingleTransaction(memo, keypair);
      transactionIds.push(txId);
      console.log(`PublishingService-M.js: publishStory: Glyph ${i + 1} published with TX ID: ${txId}`);
    }

    if (onProgress) {
      onProgress({ current: totalGlyphs, total: totalGlyphs });
    }

    console.log('PublishingService-M.js: publishStory: Merkle story publication complete.');
    return transactionIds;
  }
}

export default PublishingServiceM;

// 3159