# ADR-002: Unified Merkle Publishing Architecture

**Status:** Proposed
**Date:** 2025-08-21
**Replaces:** ADR-001 (Sequential Hash Chaining)

---

## 1. Context

The foundational premise of Glyffiti is to create a permanent, censorship-resistant, and verifiable on-chain social graph. Our initial architecture, which relied on sequential `previousHash` links and off-chain manifests, failed to meet this standard. It was brittle, complex to verify, and—most critically—did not cryptographically prove authorship. An attacker could replicate content and forge a valid-looking chain under their own identity, undermining the entire system's trust.

We require a new architecture that achieves the following core objectives:

* **Absolute Integrity:** Every piece of content must have an unbreakable, mathematically verifiable link to its author and the Glyffiti platform, using only on-chain data.
* **Scalability:** The system must handle content of all sizes, from short social posts to novels and large media files, without compromising security or efficiency.
* **Economic Enablement:** The architecture must provide a foundation for a new creator economy, allowing authors to control the scarcity of their work and enable novel revenue models.
* **Content Discovery:** The system should include a lightweight, on-chain mechanism for content discovery and recommendation that respects the decentralized nature of the platform.

This ADR outlines the decision to adopt a **Unified Merkle Tree Architecture** as the single, comprehensive solution to these challenges.

---

## 2. Decision

We will replace the sequential hash-chaining system with a Unified Merkle Tree architecture for all content publishing. This new system is built on four key pillars: The Unified Tree, Chunked Trees for large content, Creator-Controlled Scarcity, and an embedded Metadata Vector for discovery.

### 2.1. The Unified Merkle Tree

For any given piece of content, we will construct a single Merkle tree. The leaf nodes of this tree are ordered specifically to create a definitive, collision-resistant fingerprint.

**Leaf Node Structure:**
`[GlyffitiGenesisHash, UserGenesisHash, MetadataVectorHash, ...ContentGlyphHashes]`

1.  **Glyffiti Genesis Hash (Index 0):** A constant, platform-wide hash. Its presence proves the content is part of the Glyffiti ecosystem.
2.  **User Genesis Hash (Index 1):** The unique hash from the author's own genesis block. Its presence is the cryptographic proof of authorship.
3.  **Metadata Vector Hash (Index 2):** The SHA-256 hash of the 11-dimensional metadata vector (see 2.4). This binds the content's semantic fingerprint to its cryptographic identity.
4.  **Content Glyph Hashes (Index 3+):** The SHA-256 hashes of each individual glyph (content chunk).

The resulting root of this tree is the **Unified Root**. This single hash is the canonical, verifiable identifier for the content, binding its platform, author, metadata, and substance into one cryptographic seal.

### 2.2. Chunked Merkle Trees for Large Content

To support content of any length (e.g., novels, audiobooks), we will implement an automated chunking system.

* A `MAX_GLYPHS_PER_TREE` constant will be defined (e.g., 100 glyphs).
* If a piece of content exceeds this limit, it will be broken into multiple sequential chunks.
* Each chunk will be formed into its own **Unified Merkle Tree** as described in 2.1, resulting in multiple Unified Roots.
* A final **Meta-Tree** is then constructed where the leaf nodes are the Unified Roots of each content chunk.
* The root of this Meta-Tree becomes the **Story Root**, which serves as the top-level identifier for the entire collection.

This allows for verification at two levels: any individual glyph can be proven to belong to its chunk, and any chunk can be proven to belong to the complete story.

### 2.3. Creator-Controlled Scarcity (Re-Glyphing)

To empower creators and build a foundation for a true creator economy, the system will include a mechanism for controlling digital scarcity.

* At the time of publishing, the author will specify a `reGlyphCap`: a number defining the maximum number of times the community can "re-glyph" (officially copy and republish) their work.
* This cap (e.g., 1, 100, 10,000, or `null` for unlimited) will be stored as part of the on-chain data for the first glyph.
* This mechanism transforms content from a simple broadcast into a digitally scarce asset, creating opportunities for primary and secondary markets where early supporters can participate in the value they help create.

### 2.4. 11-Dimensional Metadata Vector

To facilitate content discovery without relying on centralized servers or complex, high-dimension AI embeddings, we will generate and store a simple metadata vector for each piece of content.

* The vector will consist of **11 floating-point numbers**, representing 11 distinct, unlabeled dimensions of the content.
* The meaning of these dimensions will be determined and evolved by the client application (e.g., mapping to concepts like tone, genre, or topic), allowing for flexibility.
* The hash of this vector is included as a leaf in the Unified Merkle Tree, ensuring that the metadata can never be separated from or altered independently of the content it describes. This provides a lightweight, on-chain foundation for semantic search, recommendation engines, and content clustering.

---

## 3. Consequences

### Positive

* **Absolute Verifiability:** Forgery of authorship or content is now mathematically impossible. A single Unified Root is all that is needed to prove a glyph's authenticity, authorship, and platform origin.
* **Radical System Simplification:** The entire complex, stateful logic of managing `previousHash` chains is eliminated. Verification is now a pure, stateless mathematical function.
* **True Digital Scarcity:** The `reGlyphCap` feature introduces author-controlled scarcity, a primitive for building robust creator economies, fan ownership, and novel monetization models.
* **Infinite Scalability:** The chunking and meta-tree architecture allows Glyffiti to support content of any size, from a single glyph to epic-length novels or hours-long audio, using the same fundamental security model.
* **Lightweight & Flexible Discovery:** The 11D vector provides a powerful tool for building discovery features without the overhead of large AI models or centralized indexing services.
* **Enables Core Mission:** This architecture makes cross-chain "re-glyphing" a reality. As long as the content and author genesis are identical, the Unified Root will be the same, allowing for verifiable content mirroring across different blockchains.

### Negative

* **Requires Full System Replacement:** This is a fundamental shift, not an iterative change. It necessitates a complete rewrite of the core services for content processing, publishing, and verification. As we have no legacy content, this is a one-time engineering cost.
* **Increased Data Payload:** Each glyph must now store a Merkle proof instead of a single hash. For a 15-glyph story (~4 sibling hashes), this is ~128 bytes, a reasonable trade-off for absolute security.
* **Increased Verification Complexity:** For consumers of the data, verifying large, chunked content requires an additional step of first verifying the chunk against the Story Root, then the glyph against the chunk's Unified Root.

---

## 4. Implementation Plan

We will create a new suite of services, suffixed with `-M`, to build this architecture in parallel without disrupting any existing (albeit soon-to-be-deprecated) functionality.

* **`src/services/merkle/MerkleBuilder-M.js`**
    * **Responsibility:** A pure, stateless utility for all cryptographic hash and tree operations.
    * **Functions:** `buildTree(leaves)`, `getRoot(tree)`, `getProof(tree, leafIndex)`, `verifyProof(leaf, proof, root)`.

* **`src/services/metadata/MetadataService-M.js`** (New Service)
    * **Responsibility:** Generates the 11-dimensional metadata vector from raw content.
    * **Functions:** `generateVector(content): Promise<number[]>`.

* **`src/services/glyph/processing/ChunkManager-M.js`**
    * **Responsibility:** The core orchestrator. Manages chunking, tree construction, and glyph packaging.
    * **Functions:** `createUnifiedGlyphSet(content, userGenesis, glyffitiGenesis, metadataVector)` which will handle auto-chunking and the creation of both Unified Trees and the final Meta-Tree if necessary.

* **`src/services/content/ContentService-M.js`**
    * **Responsibility:** High-level service that prepares any piece of content for publishing.
    * **Functions:** `prepareContentForPublishing(contentData, authorPublicKey, reGlyphCap)` which will orchestrate calls to the metadata and chunking services to produce a final package ready for the blockchain.

* **`src/services/publishing/PublishingService-M.js`**
    * **Responsibility:** Manages the on-chain submission of prepared glyphs.
    * **Functions:** `publishContent(preparedContent)` which will handle the logic of iterating through chunks (if any) and posting all required transactions for a complete piece of content.

* **`src/services/story/StoryViewerService-M.js`**
    * **Responsibility:** Fetches, verifies, and assembles content for display.
    * **Functions:** `fetchAndVerifyStory(firstGlyphTxId)` which will be updated to handle the two-level verification process required for chunked content, ensuring every single piece of data is authentic before it is displayed to the user.