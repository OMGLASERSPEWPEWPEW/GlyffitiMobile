// src/services/content/ContentService-M.js
import ChunkManagerM from '../glyph/processing/ChunkManager-M';
import { blockchainServices } from '../blockchain/BlockchainService';

/**
 * A high-level service for preparing content for publishing using the new
 * Unified Merkle Tree architecture. This service replaces the legacy ContentService.
 */
class ContentServiceM {
  /**
   * Prepares a complete package of glyphs for a given piece of content,
   * ready to be sent to the publishing service.
   *
   * @param {string} content - The raw text content to be published.
   * @param {string} authorPublicKey - The public key of the content's author.
   * @param {number|null} reGlyphCap - The maximum number of re-glyphs allowed.
   * @returns {Promise<Object>} A promise that resolves to the complete package,
   * including the array of prepared glyphs and any top-level metadata.
   */
  static async prepareContentForMerklePublishing(content, authorPublicKey, reGlyphCap = null) {
    console.log('ContentService-M.js: prepareContentForMerklePublishing: Preparing content for author:', authorPublicKey);

    // 1. Fetch the user's full genesis block object from the blockchain.
    const userGenesisBlock = await blockchainServices.retrieveUserGenesisBlock(authorPublicKey);

    if (!userGenesisBlock) {
      console.error('ContentService-M.js: prepareContentForMerklePublishing: Failed to retrieve user genesis block.');
      throw new Error('Could not find the user\'s genesis block on-chain.');
    }
    console.log('ContentService-M.js: prepareContentForMerklePublishing: Retrieved user genesis block.');

    // 2. Extract the required hashes from the genesis block object.
    const userGenesisHash = await userGenesisBlock.getHash();
    const glyffitiGenesisHash = userGenesisBlock.getParentHash(); // The user's parent is the platform's genesis.

    if (!glyffitiGenesisHash || !userGenesisHash) {
      console.error('ContentService-M.js: prepareContentForMerklePublishing: Failed to extract one or more genesis hashes from the block.');
      throw new Error('Could not extract required genesis hashes for publishing.');
    }

    // 3. Call the ChunkManager to process the content and create the glyph set.
    const preparedGlyphs = await ChunkManagerM.createUnifiedGlyphs(
      content,
      userGenesisHash,
      glyffitiGenesisHash
    );

    // 4. Return the complete package, ready for the publishing service.
    const finalPackage = {
      glyphs: preparedGlyphs,
      reGlyphCap: reGlyphCap,
    };
    
    console.log('ContentService-M.js: prepareContentForMerklePublishing: Content successfully prepared for Merkle publishing.');
    return finalPackage;
  }
}

export default ContentServiceM;

// 2276