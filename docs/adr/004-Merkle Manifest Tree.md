// docs/adr/004-Scalable-Publishing-with-Manifest-Tree.md
# ADR-004: Scalable Publishing with a Three-Tier Manifest Tree

**Status:** Accepted

**Date:** 2025-08-25

## Context

This ADR supersedes the flat-manifest approach detailed in `ADR-003`.

The evolution of our publishing architecture has been driven by the Solana memo size limit (~566 bytes):
1.  **ADR-002 (Merkle Proofs-per-Glyph):** This failed because the proof overhead (~160 bytes) added to each content chunk was too large.
2.  **ADR-003 (Flat Manifest):** This approach moved all verification data into a single "manifest" transaction containing a flat list of all content chunk hashes. Implementation and testing revealed this was also not scalable. A story with more than 8-9 chunks would create a `chunkHashes` array that, by itself, exceeded the memo size limit.

The core problem remains: we need an architecture where the primary, discoverable transaction for a story has a **fixed and small size**, regardless of whether the story is a 10-line poem or a 100,000-word novel.

## Decision

We will adopt a **three-tier manifest tree architecture** for publishing all long-form content. This architecture provides infinite scalability by ensuring the root transaction is always a constant, small size.

The three tiers are:

1.  **Tier 1: The Primary Manifest (Root of Trust)**
    * A single Solana transaction whose signature becomes the unique, shareable `storyId`.
    * The memo is extremely small and contains essential metadata (e.g., title, author public key) and, most importantly, a single **`manifestRoot`**.
    * The `manifestRoot` is the Merkle root of the *complete, ordered list of all content chunk hashes*.

2.  **Tier 2: The Hash List Chunks (Table of Contents)**
    * The complete list of `contentChunkHashes` is chunked into one or more secondary transactions.
    * Each of these transactions is linked back to the `storyId`.
    * This allows the full "table of contents" for the story to be of arbitrary length, stored efficiently across multiple transactions.

3.  **Tier 3: The Content Glyphs (The Pages)**
    * The individual chunks of the story's content are published in their own transactions.
    * Each of these transactions is also linked back to the `storyId`.

This structure ensures that the on-chain "entry point" to any story is a single, lightweight transaction.

## Consequences

### Positive

* **Infinite Scalability:** The Primary Manifest's size is constant, regardless of the story's length. A novel with thousands of chunks will have the same primary manifest size as a short poem. This permanently solves the memo size issue.
* **Maintains Verifiability:** The entire story remains cryptographically secure. A reader fetches the `manifestRoot` from the trusted Primary Manifest, assembles the full hash list from Tier 2, and verifies that its Merkle root matches.
* **Enables High Performance:** Both the Hash List Chunks (Tier 2) and the Content Glyphs (Tier 3) can be fetched in parallel after the primary manifest is retrieved, ensuring a fast content loading experience for the user.

### Negative

* **Increased Architectural Complexity:** The publishing and reading logic is more complex than a simple flat manifest, involving a three-step fetch-and-verify process for readers (fetch primary, fetch hash lists, fetch content).
* **Higher Base Transaction Cost:** The minimum number of transactions for a story is now three (1 primary manifest, 1 hash list chunk, 1 content glyph). This increases the minimum on-chain cost to publish.
* **Increased Client-Side Logic:** The client application bears the responsibility of assembling the hash list chunks and verifying them against the `manifestRoot` before fetching and displaying the content.

## Alternatives Considered

### 1. Chained (Linked-List) Manifests

* **Summary:** Instead of a Merkle root, the first manifest chunk would point to the transaction ID of the second, and so on.
* **Rejected Because:** This forces a slow, serial fetching of the hash lists. The manifest tree structure allows for parallel fetching, providing a significantly better user experience for loading content.

// Character count: 3995