// docs/adr/003-Manifest-Based-Publishing.md
# ADR-003: Manifest-Based Publishing Architecture

**Status:** Accepted

**Date:** 2025-08-25

## Context

The initial architecture for publishing long-form content, as defined in ADR-002, utilized a Unified Merkle Tree. This approach embedded a Merkle proof within each glyph's transaction memo. The goal was to make each glyph independently verifiable against a common root hash.

During implementation, we encountered a critical limitation: the Solana transaction memo size. A standard Solana transaction has a total size limit of 1232 bytes. After accounting for signatures, account keys, and other mandatory fields, the practical limit for memo data is approximately 566 bytes.

Our testing revealed that the Merkle proofs, which consist of multiple 32-byte hashes, added 160-192 bytes of overhead to *every single glyph*. This overhead, combined with the glyph's content, metadata references, and encoding expansion, consistently exceeded the 566-byte limit, making it impossible to publish content. Attempts to mitigate this by drastically reducing chunk size were ineffective, as smaller chunks increased the total number of leaves in the Merkle tree, which in turn increased the size of the proofs, creating a feedback loop.

## Decision

We will pivot from the per-glyph proof model to a **Manifest-Based Publishing Architecture**.

This new architecture separates the verification data from the content data into a two-phase publishing process:

1.  **Manifest Publication:** A single "manifest" transaction is published first. This manifest acts as a "table of contents" for the story. It is a data object containing:
    * Story metadata (author, title, timestamps, etc.).
    * An ordered array of SHA-256 hashes of every content chunk in the story.
    * The transaction signature of this publication becomes the unique `storyId`.

2.  **Glyph Publication:** Following the manifest, each content chunk (glyph) is published in its own separate transaction. The memo for these glyphs is lean, containing:
    * The `storyId` (to link it back to the manifest).
    * The glyph's index and total glyph count.
    * The raw content of the chunk.

Critically, these glyph transactions contain **zero proof overhead**. Verification is handled by clients, who first fetch the trusted manifest and then verify that the hash of each received glyph matches the corresponding hash in the manifest's list.

## Consequences

### Positive

* **Solves Memo Size Limit:** By removing the bulky Merkle proofs, the individual glyph memos are now significantly smaller and will reliably fit within the Solana transaction limit.
* **Drastically Reduced Overhead:** The overhead per glyph is reduced from ~160 bytes to effectively zero, allowing for larger and more efficient content chunks (~250-300 characters).
* **Maintains Strong Integrity:** The entire story remains cryptographically verifiable against the initial manifest transaction. Any tampering with a glyph will result in a hash mismatch.
* **Enables Parallel Fetching:** Readers can fetch the manifest and then fetch all content glyphs simultaneously, leading to a faster content loading experience compared to a traditional linked-list model.

### Negative

* **Increased Base Transaction Cost:** Every story now requires at least one extra transaction (for the manifest). The minimum cost to publish is now two transactions instead of one.
* **Asynchronous Verification:** Verification is no longer self-contained within each glyph. Clients must perform an extra step of fetching the manifest before they can begin fetching and verifying content.
* **Refactoring Effort:** This decision requires a significant refactor of `ChunkManager-M.js`, `ContentService-M.js`, and `PublishingService-M.js`.

## Alternatives Considered

### 1. Maintain Per-Glyph Merkle Proofs

* **Summary:** Continue trying to shrink content chunks until the memo fits.
* **Rejected Because:** Our tests proved this to be unworkable. The smaller the chunks, the larger the proofs become, yielding negligible savings and resulting in an impractically high number of transactions for any given story.

### 2. Revert to Simple Linked-List

* **Summary:** Each glyph transaction points to the hash of the previous one.
* **Rejected Because:** While this has low overhead, it forces a slow, serial fetch-and-verify process. A reader cannot start fetching glyph #10 until they have fetched and verified glyph #9. The manifest model provides the same integrity guarantees while allowing for much faster parallel content loading.

// Character count: 3998