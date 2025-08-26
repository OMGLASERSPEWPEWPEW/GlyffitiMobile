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
 * Prepares a complete 3-tier publication package for a given piece of content,
 * ready to be sent to the publishing service.
 *
 * @param {string} content - The raw text content to be published.
 * @param {string} title - The title for the story.
 * @param {string} authorPublicKey - The public key of the content's author.
 * @param {Object} options - Additional publishing options.
 * @param {string[]} options.tags - Content tags for discovery.
 * @param {string} options.genre - Content genre.
 * @param {number|null} options.reGlyphCap - The maximum number of re-glyphs allowed.
 * @param {boolean} options.isNSFW - NSFW content flag.
 * @returns {Promise<Object>} A promise that resolves to the complete 3-tier publication package.
 */
static async prepareContentForManifestPublishing(content, title, authorPublicKey, options = {}) {
    console.log('ContentService-M.js: prepareContentForManifestPublishing: Preparing content for 3-tier manifest publishing');
    console.log('  Title:', title);
    console.log('  Author:', authorPublicKey);
    console.log('  Content length:', content.length, 'characters');
    console.log('  Options:', options);

    // Validate inputs
    if (!content) {
      throw new Error('Content is required for manifest publishing');
    }
    
    if (!title || title.trim().length === 0) {
      throw new Error('Title is required for manifest publishing');
    }
    
    if (!authorPublicKey) {
      throw new Error('Author public key is required for manifest publishing');
    }

    // Call the ChunkManager to process the content and create the 3-tier publication package
    const publicationPackage = await ChunkManagerM.prepareStoryForManifestPublishing(
      content,
      title.trim(),
      authorPublicKey.trim(),
      {
        tags: options.tags || [],
        genre: options.genre || null,
        reGlyphCap: options.reGlyphCap || null,
        isNSFW: options.isNSFW || false,
        license: options.license || 'CC0'
      }
    );

    // Add additional metadata to the package for backward compatibility
    const finalPackage = {
      ...publicationPackage,
      // Keep reGlyphCap at top level for backward compatibility
      reGlyphCap: options.reGlyphCap || null,
      authorPublicKey: authorPublicKey.trim(),
      publishingOptions: options
    };
    
    console.log('ContentService-M.js: prepareContentForManifestPublishing: 3-tier content successfully prepared');
    console.log('  Total content chunks:', finalPackage.summary.totalContentChunks);
    console.log('  Total hash list chunks:', finalPackage.summary.totalHashListChunks);
    console.log('  Manifest root:', finalPackage.summary.manifestRoot.substring(0, 16) + '...');
    console.log('  Manifest hash:', finalPackage.summary.manifestHash.substring(0, 16) + '...');
    
    return finalPackage;
  }
}

export default ContentServiceM;

// Character count: 2,718