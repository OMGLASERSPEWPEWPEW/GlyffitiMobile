// src/services/content/ContentService-M.js
// Path: src/services/content/ContentService-M.js

import ChunkManagerM from '../glyph/processing/ChunkManager-M';

/**
 * A high-level service for preparing content for publishing using the new
 * Unified Merkle Tree architecture. This service uses actual genesis data
 * from the user registry.
 */
class ContentServiceM {
  /**
   * Prepares a complete package of glyphs for a given piece of content,
   * ready to be sent to the publishing service.
   *
   * @param {string} content - The raw text content to be published.
   * @param {string} authorPublicKey - The public key of the content's author.
   * @param {string} userGenesisHash - The user's genesis transaction hash.
   * @param {string} glyffitiGenesisHash - The platform's genesis transaction hash.
   * @param {number|null} reGlyphCap - The maximum number of re-glyphs allowed.
   * @returns {Promise<Object>} A promise that resolves to the complete package.
   */
  static async prepareContentForMerklePublishing(content, authorPublicKey, userGenesisHash, glyffitiGenesisHash, reGlyphCap = null) {
    console.log('ContentService-M.js: prepareContentForMerklePublishing: Preparing content');
    console.log('  Author:', authorPublicKey);
    console.log('  User Genesis:', userGenesisHash?.substring(0, 16) + '...');
    console.log('  Glyffiti Genesis:', glyffitiGenesisHash?.substring(0, 16) + '...');

    // Validate inputs
    if (!content) {
      throw new Error('Content is required for merkle publishing');
    }
    
    if (!authorPublicKey) {
      throw new Error('Author public key is required for merkle publishing');
    }
    
    if (!userGenesisHash) {
      throw new Error('User genesis hash is required for merkle publishing');
    }
    
    if (!glyffitiGenesisHash) {
      throw new Error('Glyffiti genesis hash is required for merkle publishing');
    }

    // Call the ChunkManager to process the content and create the glyph set
    // The merkle tree will use the actual transaction hashes as the genesis identifiers
    const preparedGlyphs = await ChunkManagerM.createUnifiedGlyphs(
      content,
      userGenesisHash,      // User's genesis transaction hash
      glyffitiGenesisHash   // Platform's genesis transaction hash
    );

    // Return the complete package, ready for the publishing service
    const finalPackage = {
      glyphs: preparedGlyphs,
      reGlyphCap: reGlyphCap,
      authorPublicKey: authorPublicKey,
      userGenesisHash: userGenesisHash,
      glyffitiGenesisHash: glyffitiGenesisHash
    };
    
    console.log('ContentService-M.js: prepareContentForMerklePublishing: Content successfully prepared for Merkle publishing.');
    console.log('  Total glyphs:', preparedGlyphs.length);
    
    return finalPackage;
  }
}

export default ContentServiceM;

// Character count: 2,718