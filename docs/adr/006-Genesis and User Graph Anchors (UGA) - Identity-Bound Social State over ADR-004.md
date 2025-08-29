ADR-006: Genesis & User Graph Anchors (UGA) — Identity-Bound Social State over ADR-004

Status: Proposed
Date: 2025-08-27
Supersedes/clarifies: ADR-005 variants (Identity-Bound Manifest Tree, Genesis-Anchored Publishing)
Depends on: ADR-004 (Three-Tier Manifest Tree)
Author(s): Glyffiti Core

1) Context

ADR-004 solved Solana memo limits for long-form publishing by introducing a constant-size Primary Manifest that commits to an arbitrarily large story via a Merkle “hash list” + content glyphs. Two ADR-005 drafts explored binding content to author and platform with a tiny identity layer:

(a) Replace the manifest root with an identity-bound root (pure but breaking).

(b) Keep manifestRoot and add an identityRoot (easy rollout).

Both ADR-005s remain content-centric. Our broader vision is a unified, evolving social graph per user (posts, replies, likes/reactions, follows, stories, profile, revocations) that is verifiably part of Glyffiti with tiny on-chain cost and serverless (relay-assisted) distribution.

We want:

A platform root of trust (Glyffiti Genesis).

A per-user root of trust (User Genesis) bound to the platform.

A scalable way for every user to publish periodic, tiny on-chain checkpoints of their entire social state, while keeping all membership proofs off-chain and small.

Seamless reuse of ADR-004 for long-form stories.

This ADR defines that architecture.

2) Decision (high-level)

Introduce three permanent primitives and a fixed, structured Merkle layout:

Glyffiti Genesis (G₀) — One-time, well-known on-chain transaction that defines the platform. We reference its 32-byte hash glyffitiGenesisHash.

User Genesis (U₀) — One on-chain transaction per user binding userPubKey to Glyffiti via:

userGenesisHash = H( "UGEN" || userPubKey || glyffitiGenesisHash || userGenesisMeta )


(Meta may include recovery keys, handle, version, etc.)

User Graph Anchors (UGAᵢ) — Tiny, periodic on-chain checkpoints of a user’s entire social state at time i. Each UGA publishes:

UGRᵢ — UserGraphRoot: a structured Merkle over lane roots (POSTS, REPLIES, LIKES, FOLLOWS, STORIES, PROFILE, REVOCATIONS, …).

identityRootᵢ — a 3-leaf Merkle that binds (UGRᵢ, U₀, G₀) in that fixed order.

(Optional) prevUGA to form a chain for easy sync.

Verification for any item (e.g., a post, reply, or a story manifest) is:

item  → chunkRoot → laneRoot → UGRᵢ → identityRootᵢ (on-chain)
                                   ↘︎ U₀ (on-chain)
                                     G₀ (on-chain)


All proofs are off-chain (served by any relay); on-chain memos carry only tiny roots.

3) Architecture Overview
3.1 Hash & Merkle Conventions (normative)

Hash function: BLAKE3-256, 32-byte output.

Domain separation: prefix every leaf with a 4-byte ASCII tag + 0x00:

"ITEM\0", "CHNK\0", "LANE\0", "UGEN\0", "UGR \0", "IDEN\0", etc.

Leaf hash: H( tag || payload ).

Inner node hash: H( 0x01 || left || right ) (binary Merkle).

Three-leaf tree (identityRoot): fixed order [UGR, U₀, G₀]:

a = H(0x01 || hash(UGR) || hash(U₀))

identityRoot = H(0x01 || a || hash(G₀))

Deterministic order and tags prevent cross-type collisions and malleability.

3.2 Structured Merkle for User Graph Root (UGR)

UGRᵢ is a fixed-shape Merkle whose children are ((in order, expanded to 32 lanes for future-proofing)):

1. `POSTS` lane root
2. `REPLIES` lane root
3. `LIKES/REACTIONS` lane root
4. `FOLLOWS` lane root
5. `STORIES` lane root (references ADR-004 manifestRoots)
6. `PROFILE` lane root
7. `REVOCATIONS` lane root
8. `BOOKMARKS` lane root (formerly `RESERVED`)
9. ... 32. `RESERVED` (zero-hash sentinels for forward compatibility)

Each lane root is itself a Merkle over chunk roots (Chunked Merkle Array, CMA). Each chunk is a Merkle over items (append-only), and items include prev pointers for streaming UX.

This shape yields small, predictable proofs and stable layout over time.

3.3 Lanes & Items (normative item sketches)

POSTS item leaf:
H("ITEM\0" || "POST" || itemId || prevId || timestamp || bodyHash || metaHash)

REPLIES item leaf:
H("ITEM\0" || "REPL" || replyId || parentId || prevId || timestamp || bodyHash || metaHash)

LIKES item leaf:
H("ITEM\0" || "LIKE" || targetId || timestamp || reactionKind)

FOLLOWS item leaf:
H("ITEM\0" || "FOLL" || toUserGenesisHash || timestamp)

STORIES item leaf:
H("ITEM\0" || "STOR" || contentId || manifestRoot || timestamp || metaHash)

PROFILE item leaf:
H("ITEM\0" || "PROF" || field || valueHash || timestamp)

REVOCATIONS item leaf:
H("ITEM\0" || "REVO" || targetKind || targetId || reasonHash || timestamp)

Chunk roots: H("CHNK\0" || MerkleRoot(items_in_chunk))
Lane roots: H("LANE\0" || MerkleRoot(chunkRoots))
UGR: H("UGR \0" || MerkleRoot(8 lane roots in order))

Note: bodyHash, metaHash, and story content remain in off-chain storage (object store/IPFS/Arweave). Only roots/IDs go on chain.

UGR: H("UGR \0" || MerkleRoot(32 lane roots in order))

3.4 On-chain Commitments (normative)

Glyffiti Genesis (G₀):

Memo includes {"v":1,"kind":"G0","hash":"<32B hex>","created":<unix>}

Clients pin the transaction ID + hash.

User Genesis (U₀):

Memo includes:

{
  "v": 1,
  "kind": "U0",
  "userPubKey": "<base58>",
  "glyffitiGenesis": "<32B hex>",
  "userGenesisMeta": { "recovery": ["<pubkey>", ...], "handle":"@name", "ver":1 },
  "userGenesisHash": "<32B hex>"
}


User Graph Anchor (UGAᵢ):

Memo includes (CBOR or JSON; CBOR preferred later):

{
  "v": 1,
  "kind": "UGA",
  "userGenesis": "<32B hex>",
  "glyffitiGenesis": "<32B hex>",
  "userGraphRoot": "<32B hex>",     // UGRᵢ
  "identityRoot": "<32B hex>",      // Merkle3(UGRᵢ, U₀, G₀)
  "prev": "<txid-or-null>",
  "epoch": "2025-08-27T00:00:00Z",
  "ts": 1756272000
}


Entire memo typically ~170–220 bytes.

All proofs remain off-chain. On-chain memos carry only hashes and a few fields.

4) Encoding (CBOR) — OPTIONAL NOW, RECOMMENDED NEXT

We will start with compact JSON (ease of debugging) and plan a migration to deterministic CBOR:

Canonical CBOR (CTAP2’s preferred encoding):

Sorted map keys (lexicographic by byte string).

Fixed key names (v, kind, userGenesis, etc.).

Byte budget: CBOR typically reduces memo size by ~20–35% for the same content.

Hash preimage: Always hash the binary CBOR; never re-serialize JSON for hashing.

This ADR treats CBOR as recommended but non-blocking for initial implementation.

5) Operational Details
5.1 Cadence

Default: daily UGA per user.

High-traffic creators: hourly UGA.

Cost: ~200 B per UGA memo. Even at 5,000 followed accounts, readers fetch ≈ 1 MB/day of anchors—trivial.

5.2 Chunking

POSTS/REPLIES/LIKES/FOLLOWS: chunk size 256 items.

STORIES: chunk size 32 (fewer items, but heavier story proofs via ADR-004).

Relays can bundle multiproofs for items sharing the same chunk/lane/UGR to reduce total proof bytes.

5.3 Gossip / P2P

Untrusted relays carry:

UGAAnnounce( txid, identityRoot, epoch )

LaneHeader( laneKind, chunkIndex, chunkRoot, items[], merkleNodes[] )

ItemBundle( items[], optional bodies/media URIs )

MultiProof( serialized nodes for item→chunk→lane→UGR→identity )

KeyRotate( tierId, epoch, wrappedKeys[] ) (see §7)

Clients verify everything locally before accepting.

6) Verification (normative outline)

To verify a post p from user U at epoch i:

Fetch the latest UGA tx for U. Parse (identityRootᵢ, userGenesis, glyffitiGenesis).

Check userGenesis tx exists and binds userPubKey to glyffitiGenesis (U₀ → G₀).

3. Verify multiproof:
    * `p ∈ chunkRoot[k]` (8 sibling hashes for a 256-item chunk).
    * `chunkRoot[k] ∈ laneRoot_posts` (depth ≈ 2–3).
    * `laneRoot_posts ∈ UGRᵢ` (depth 5 fixed-shape tree).
    * `UGRᵢ` with `(U₀, G₀) → identityRootᵢ`. Must match on-chain.

(If story) verify ADR-004 path:

manifestRoot from STORIES lane leaf; then hash-list chunks → glyph(s).

Typical proof bytes (excluding item body):

Post/Reply: ~0.45–0.55 KB

Story leaf (excluding ADR-004 content proof): ~0.30–0.35 KB

Phones/laptops can validate tens of thousands/day easily.

7) Tiered Encryption & Blocking (alignment with ADR-005-Encryption)

This ADR integrates cleanly with your encryption plan:

Epoched GroupKeys: tie tier key epochs to UGA epochs (or rotate ad-hoc on block).

LKH (Logical Key Hierarchy): for each tier, maintain a balanced member key tree; on block/revoke, update O(log N) nodes, send O(log N) wrapped keys.

Device delivery: HPKE (X25519+HKDF-SHA256+ChaCha20-Poly1305).

Content: AES-256-GCM (or XChaCha20-Poly1305).

Revocation semantics: forward secrecy (future content). Past decrypts remain with the recipient—expected.

Include key-rotation statements in the REVOCATIONS lane (signed meta) so moderation is verifiable and replicable.

8) Security & Privacy

Sybil/spam: require U₀ (small on-chain cost), optionally light PoW on posts, and trust-weighted relay rate limiting. Feeds/ranking consider web-of-trust edges and karma.

Graph inference: cadence + chunking bucket activity; consider batching and epoch windows to reduce timing leakage.

Tamper resistance: fixed structure, domain-separated hashes, and on-chain identity roots prevent equivocation by relays.

DoS: clients cap per-source announcements; relays throttle per-identity.

9) Consequences
Positive

Unified, evolving social root per user with explicit platform membership.

Tiny on-chain cost; small, cacheable proofs; serverless operation.

Cleanly reuses ADR-004 for long-form stories.

Natural fit for tiered encryption and verifiable moderation.

Negative

More moving parts (G₀, U₀, UGA chain, lanes, chunks).

Publisher/relay coordination to include recent items in the next UGA.

Neutral

Choosing CBOR improves efficiency but can follow JSON MVP.

10) Alternatives Considered

Per-item on-chain proofs
— Non-starter (memo bloat, fee amplification).

Pure linked-list lanes (no anchors)
— Great for streaming; lacks succinct, universal proofs without walking history or trusting an indexer.

Only identity-binding at content batch time (ADR-005)
— Solves authorship for stories; does not cover the whole social graph.

Centralized registry
— Violates serverless/trustless goals.

11) Implementation Plan (files & milestones)

Paths assume the existing React Native + TypeScript app and JS services. Adjust as needed.

Milestone A — Primitives & Hashing

src/crypto/Hash.ts — BLAKE3-256 wrapper, domain tags, Merkle helpers.

src/crypto/Merkle.ts — leaf/hash builders, fixed-shape UGR, Merkle3.

Milestone B — Genesis & Anchors

src/services/genesis/GlyffitiGenesisService.ts — read/pin G₀.

src/services/genesis/UserGenesisService.ts — create/read U₀; compute userGenesisHash.

src/services/graph/UserGraphAnchorService.ts — build lanes → chunks → UGRᵢ; publish UGA memo; fetch latest UGA.

Milestone C — Lanes & Storage

src/services/graph/lanes/LaneManager.ts — append items, manage chunk rollover (default sizes: 256/32).

src/services/graph/lanes/LaneHeaderCodec.ts — (JSON now; CBOR later) serialize chunk headers.

src/services/storage/ObjectStore.ts — put/get chunk headers & item bodies by content hash.

Milestone D — Verification

src/services/verification/GraphVerifier.ts — verify item→chunk→lane→UGR→identityRootᵢ; story path via ADR-004.

src/services/verification/MultiProofCodec.ts — compact multiproof bundling.

Milestone E — Gossip (Relay-assisted)

src/services/gossip/Messages.ts — UGAAnnounce, LaneHeader, ItemBundle, MultiProof, KeyRotate, ModStatement.

src/services/gossip/RelayClient.ts — subscribe/publish, trust-weighting hooks.

Milestone F — Encryption hooks (ties to ADR-005-Encryption)

src/services/keys/GroupKeyServiceClient.ts — HPKE get/rotate; LKH nodes.

src/services/content/Encryptor.ts — AES-GCM / XChaCha20-Poly1305.

Milestone G — UI & DevEx

Show “Verified by identityRoot@epoch” badges, lane headers, and proof timings in dev builds.

12) Mermaid Diagrams
12.1 User Graph & Identity Root
flowchart TD
  G0["Glyffiti Genesis (G₀)"]
  U0["User Genesis (U₀)"]

  subgraph UGA["UGAᵢ (on-chain memo)"]
    IR["identityRootᵢ = Merkle3(UGRᵢ, U₀, G₀)"]
    UGR["UserGraphRoot UGRᵢ"]
  end

  subgraph UGR_Shape["UGRᵢ (fixed-shape Merkle, 32 lanes)"]
    P["POSTS lane root"]
    R["REPLIES lane root"]
    L["LIKES lane root"]
    F["FOLLOWS lane root"]
    S["STORIES lane root"]
    PR["PROFILE lane root"]
    V["REVOCATIONS lane root"]
    B["BOOKMARKS lane root"]
    Z["... RESERVED (24)"]
  end

  G0 --> U0
  U0 --> UGA
  UGA --> UGR
  UGR --> P & R & L & F & S & PR & V & B & Z

12.2 Lane Structure
flowchart LR
  subgraph Lane["POSTS Lane"]
    CR0["chunkRoot[0]"]
    CR1["chunkRoot[1]"]
    CR2["chunkRoot[2]"]
    CR3["chunkRoot[3]"]
  end

  LR["laneRoot_posts = Merkle(CHNK roots)"] --> Lane
  I998["post p-0998 (prev -> p-0997)"] --> CR3

13) Open Questions

CBOR timing: do we switch memos to CBOR now or after JSON MVP?

MMR vs CMA: for lanes with extremely high volume, should we prefer an MMR (Merkle Mountain Range) to minimize updates to upper nodes? (Either is compatible with this ADR.)

Epoch policy: per-time (hourly/daily) vs per-N-changes? (Both work; time-based is simpler to reason about.)

14) Acceptance Criteria / Success Metrics

Correctness: Any item renders with a successful verification path item→chunk→lane→UGR→identityRootᵢ (on-chain) in <10 ms on mid-tier phone.

Efficiency: UGA memo ≤ 220 bytes; average text post end-to-end (payload + proof) ≤ 1.5 KB.

Scalability: 5,000-follow feed daily sync ≤ 40 MB for text-dominant usage; media dominates as expected.

Security: Zero successful equivocation (relay or client) after verification rules enforced.

Encryption: Tiered access with LKH rotations enforces forward secrecy for future content post-block.

15) Rationale

This ADR unifies the content scalability of ADR-004 with explicit, trustless identity binding and a succinct social-state commitment. It borrows the best UX of linked-list lanes for streaming, while giving users and relays a cryptographic spine (UGA) to prevent equivocation, enable portable trust, and keep the chain cost negligible.

Result: a serverless (relay-assisted) social + publishing platform where creators own their work, fans verify authenticity locally, and the network scales to millions of users with commodity bandwidth.