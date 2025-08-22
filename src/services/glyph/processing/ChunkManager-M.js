// src/services/glyph/processing/ChunkManager-M.js
import MerkleBuilderM from '../../merkle/MerkleBuilder-M';
import MetadataServiceM from '../../metadata/MetadataService-M';
import { TextProcessor } from './TextProcessor';


// Per ADR-002, this constant defines the maximum number of glyphs
// before we switch to a chunked "meta-tree" approach.
const MAX_GLYPHS_PER_TREE = 100;

/**
 * Orchestrates the creation of cryptographically verifiable glyphs using the
 * Unified Merkle Tree architecture. This is the replacement for the legacy ChunkManager.
 */
class ChunkManagerM {
  /**
   * Processes raw content and prepares a complete, verifiable set of glyphs
   * ready for publishing.
   * @param {string} content The raw text content of the story or post.
   * @param {string} userGenesisHash The author's unique genesis hash.
   * @param {string} glyffitiGenesisHash The platform's global genesis hash.
   * @returns {Promise<Array<Object>>} A promise that resolves to an array of packaged glyph objects.
   * Each object contains its content, index, the unifiedRoot, and its specific merkleProof.
   */
  static async createUnifiedGlyphs(content, userGenesisHash, glyffitiGenesisHash) {
    console.log('ChunkManager-M.js: createUnifiedGlyphs: Starting glyph creation process.');

    if (!content || !userGenesisHash || !glyffitiGenesisHash) {
      throw new Error('Content, userGenesisHash, and glyffitiGenesisHash are all required.');
    }

    // 1. Process raw text into content chunks
    const contentChunks = TextProcessor.chunkText(content);
    console.log(`ChunkManager-M.js: createUnifiedGlyphs: Content split into ${contentChunks.length} chunks.`);

    // FUTURE: Implement logic for large content using meta-trees as per ADR-002
    if (contentChunks.length > MAX_GLYPHS_PER_TREE) {
        // For now, we'll throw an error. Later, this will trigger the meta-tree logic.
        console.error(`ChunkManager-M.js: createUnifiedGlyphs: Content exceeds MAX_GLYPHS_PER_TREE of ${MAX_GLYPHS_PER_TREE}. Meta-tree logic not yet implemented.`);
        throw new Error('Content is too large for a single Merkle tree. Chunking logic is pending.');
    }

    // 2. Generate the 11-dimensional metadata vector
    const metadataVector = await MetadataServiceM.generateVector(content);
    // Convert the vector to a deterministic string for hashing. JSON is perfect for this.
    const metadataVectorString = JSON.stringify(metadataVector);

    // 3. Construct the final, ordered array of leaf data for the Merkle tree
    const leafData = [
      glyffitiGenesisHash,      // Index 0
      userGenesisHash,          // Index 1
      metadataVectorString,     // Index 2
      ...contentChunks          // Index 3+
    ];
    console.log('ChunkManager-M.js: createUnifiedGlyphs: Assembled leaf data for Merkle tree.');

    // 4. Build the full Merkle Tree
    const merkleTree = await MerkleBuilderM.buildTree(leafData);
    const unifiedRoot = merkleTree.root;

    // 5. Generate a packaged glyph object for each content chunk
    const packagedGlyphs = [];
    for (let i = 0; i < contentChunks.length; i++) {
      const contentChunk = contentChunks[i];
      // The leaf index in the tree is offset by 3 (Glyffiti, User, Metadata)
      const leafIndexInTree = i + 3;
      const merkleProof = MerkleBuilderM.getProof(merkleTree, leafIndexInTree);

      packagedGlyphs.push({
        content: contentChunk,
        index: i,
        totalGlyphs: contentChunks.length,
        unifiedRoot: unifiedRoot,
        merkleProof: merkleProof,
      });
    }

    console.log('ChunkManager-M.js: createUnifiedGlyphs: Successfully packaged all glyphs with proofs.');
    return packagedGlyphs;
  }
}

export default ChunkManagerM;

// 3409