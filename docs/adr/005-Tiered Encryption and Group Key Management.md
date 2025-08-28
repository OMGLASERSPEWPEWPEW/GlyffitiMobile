### Architectural Decision Record 005: Tiered Encryption and Group Key Management

**Status:** Proposed

**Date:** 2025-08-27

**Context:**

The Glyffiti platform needs to support content encryption that is both scalable and flexible. Creators require the ability to publish content exclusively for specific fan tiers (e.g., subscribers, followers). They also need a mechanism to revoke access for individual users (blocking) without affecting the entire group.

The current `SecurityService.js` provides a foundation for user-specific AES-GCM encryption but lacks a mechanism for managing shared, group-level keys. A previously considered model, encrypting content with each follower's public key, was determined to be unscalable, computationally expensive, and would generate excessive data overhead, especially for creators with millions of followers.

The chosen solution must support:
1.  Encrypting a single piece of content once, regardless of audience size.
2.  Securely distributing access keys to a large, dynamic group of users.
3.  Efficiently revoking access for a user from future content via key rotation.
4.  Minimal processing overhead on the creator's device during publishing.
5.  Minimal data overhead per transaction on the blockchain.

**Decision:**

We will implement a **Tiered Symmetric Key Encryption Model** managed by a new server-side **`GroupKeyService`** and a client-side library to interact with it. This model introduces two layers of symmetric keys:

1.  **`ContentKey`**: A single-use, randomly generated AES-256 key created on the creator's device for each new story. The story content is encrypted *once* with this key.
2.  **`GroupKey`**: A long-lived AES-256 key that represents an access tier (e.g., "CreatorX-Tier1-Fans"). This key is generated and managed by the server-side `GroupKeyService`.

The `ContentKey` is encrypted with the appropriate `GroupKey`, and this encrypted `ContentKey` is stored alongside the encrypted content.

The workflow is as follows:

* **Key Distribution (e.g., on Subscription):**
    1.  When a fan subscribes to a creator's tier, their client requests the current `GroupKey` for that tier from the `GroupKeyService`.
    2.  The server verifies the fan's subscription.
    3.  The server encrypts the `GroupKey` using the fan's public key (already known to the system) and sends it to the fan's device.
    4.  The fan's device decrypts the `GroupKey` with their private key and stores it securely using `expo-secure-store`. This is a one-time operation per subscription or key rotation.

* **Publishing Workflow:**
    1.  The creator's client generates a new `ContentKey`.
    2.  The client encrypts the story content with this `ContentKey`.
    3.  The client fetches the relevant `GroupKey` (or uses a cached version), encrypts the `ContentKey` with it, and attaches this to the manifest.
    4.  The encrypted content is uploaded to storage, and the manifest (containing the encrypted `ContentKey`) is published to the blockchain.

* **Viewing Workflow:**
    1.  A fan's client downloads the encrypted story and its manifest.
    2.  It uses its securely stored `GroupKey` to decrypt the encrypted `ContentKey` from the manifest.
    3.  It then uses the decrypted `ContentKey` to decrypt and display the story.

* **Access Revocation (Key Rotation):**
    1.  When a creator blocks a user, the `GroupKeyService` is notified.
    2.  The service generates a *new* `GroupKey` for that tier.
    3.  It then proactively distributes this new `GroupKey` to all *current, valid* members of the tier (excluding the blocked user).
    4.  All future content for that tier is published using the new `GroupKey`. The blocked user never receives this new key and cannot decrypt future content.

**Diagram:**
```mermaid
sequenceDiagram
    participant FanClient as Fan's App
    participant CreatorClient as Creator's App
    participant GroupKeyService as GroupKeyService (Server)
    participant Storage
    participant Blockchain

    box "One-Time Setup / Key Distribution"
        FanClient->>+GroupKeyService: Request GroupKey for Tier X
        GroupKeyService->>GroupKeyService: Verify Subscription
        GroupKeyService-->>-FanClient: Encrypted GroupKey (using Fan's Public Key)
        FanClient->>FanClient: Decrypt and Store GroupKey securely
    end

    box "Publishing a Story"
        CreatorClient->>CreatorClient: Generate new ContentKey
        CreatorClient->>CreatorClient: Encrypt Story with ContentKey
        CreatorClient->>CreatorClient: Encrypt ContentKey with GroupKey
        CreatorClient->>+Storage: Upload Encrypted Story
        Storage-->>-CreatorClient: Storage URI
        CreatorClient->>+Blockchain: Publish Manifest (includes URI, Encrypted ContentKey)
        Blockchain-->>-CreatorClient: Transaction Success
    end

    box "Viewing a Story"
        FanClient->>+Blockchain: Fetch Manifest
        Blockchain-->>-FanClient: Manifest
        FanClient->>+Storage: Download Encrypted Story
        Storage-->>-FanClient: Encrypted Story
        FanClient->>FanClient: Use stored GroupKey to decrypt ContentKey
        FanClient->>FanClient: Use ContentKey to decrypt Story
    end