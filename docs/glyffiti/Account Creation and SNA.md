Glyffiti Account Creation & Social Network Architecture

Introduction and Key Concept Overview

Glyffiti is envisioned as a decentralized social network built on blockchain and peer-to-peer (P2P) technology. The core idea is that each user account corresponds to a unique “genesis block” in a global social graph, linked back to Glyffiti’s own genesis record. All user activity – posts, messages, interactions – will cryptographically link to that user’s genesis block, forming a secure chain of events much like how Bitcoin links blocks via hashes
binance.com
. In essence, Glyffiti treats social content as transactions in a big blockchain-like graph, ensuring tamper-evident history and user ownership of data. This document details an implementation plan for Glyffiti’s account creation (both in-app on an iPhone and on-chain in the blockchain), as well as the scaffolding needed to let users post content or communicate. We also address App Store compatibility, meaning we incorporate features like user blocking, content moderation, and privacy to meet Apple’s guidelines. The goal is to provide a comprehensive blueprint (~5,000 words) that could guide an LLM (or a developer) to implement the system precisely. Key points from prior discussions:
Blockchain Basis (Genesis Blocks): Glyffiti will start with a global genesis on-chain transaction that serves as the root of the social network. Each user who joins creates their own user genesis block (account identity) that is cryptographically linked to the global genesis. This structure is analogous to Bitcoin’s genesis and subsequent blocks, enabling a chain of trust
binance.com
. Over time, a large graph of interconnected blocks (users and their content) emerges.
Initial Target Chain: The implementation will use Solana (“SOL”) blockchain for now, with the intention to expand to other chains later. Solana is chosen for its high throughput and low cost, which are suitable for social media scale
irjmets.com
. The design will remain as chain-agnostic as possible to allow future multi-chain support.
User Account Creation: We need a process to generate accounts that creates a wallet/seed for each user and registers them on-chain. Initially, we’ll develop a script or backend process to generate new user keys and on-chain accounts (to get the architecture right) before integrating this with the client UI.
Content Posting & P2P Network: Once accounts exist, users should be able to post messages or other content (images, etc.) to Glyffiti. Every piece of content or communication a user creates will be linked to their account chain. The network of posts, replies, etc., will be distributed P2P (no central server), and we’ll design scaffolding so that content can propagate and be stored either on-chain or via decentralized means. All content should be end-to-end encrypted by default for privacy – though the default setting will be “public” (meaning any member of Glyffiti can decrypt/read it, as if it were posted openly).
Privacy and Encryption Model: Even public posts will use an “envelope” model of encryption for consistency, though in the public case, every user can open the envelope. Private or group posts will be encrypted such that only intended recipients can decrypt (achieved by sharing keys appropriately). The system should be flexible to allow content visibility changes (e.g. making a post private or blocking users from viewing your content by changing encryption keys).
App Store Compliance: As a social networking app, we must incorporate features for content moderation and user safety. Apple’s App Store guidelines (section 1.2 on User-Generated Content) require apps to have: a method to filter objectionable content, a reporting mechanism, the ability for users to block other users, and contact information for support
developer.apple.com
. We will ensure Glyffiti’s design includes user blocking (with potentially encryption-based enforcement), content reporting, and other moderation scaffolds. (We note that truly decentralized networks pose challenges for moderation, but at minimum the client app can implement these features in a way acceptable to Apple’s review.)
With these points in mind, the following sections break down the architecture and implementation plan in detail. We use clear headings and step-by-step lists to organize the solution, covering on-chain logic, in-app functionality, data structures, and user flows.
Blockchain Architecture: Global Genesis, User Chains, and Social Graph

1. Global Genesis Block: At the foundation of Glyffiti’s on-chain design is a global genesis transaction/block. This could be a special transaction that initializes the Glyffiti protocol on the blockchain (for example, deploying a smart contract or creating a registry account). It contains or references the initial state of the social network. All user accounts will ultimately link back to this genesis. Conceptually, think of it as block #0 of the social network – much like Bitcoin’s genesis block that every Bitcoin traces back to
binance.com
.
The global genesis might store a master list or root hash of authorized user accounts, or simply act as an agreed starting hash to which user chains will refer. It defines the “universe” of Glyffiti on that chain.
For instance, if using a custom smart contract, the contract’s deployment could serve as this genesis event, after which user accounts are created via the contract. Or if using existing chain features, we might designate a specific ledger entry as the root.
2. User Genesis Blocks (Account Identity): When a new user creates an account, we generate a user genesis block for them on-chain that ties into the global genesis. In practice, this user genesis is realized by an on-chain transaction (or a state creation in a contract) that includes the new user’s public key and any initial profile data, and a reference/link to the global genesis.
Each user is identified by a unique blockchain address (public key) which serves as their identity
irjmets.com
. This public key is generated from the user’s wallet/seed and is stored on-chain as part of their account record. The blockchain provides each account with a unique address that acts as the user’s decentralized identifier
irjmets.com
.
The user’s genesis transaction will typically include:
The user’s public key (for identity and verification).
Optionally, a username or profile info (could be stored in an on-chain profile object or omitted at genesis and set later).
A reference to the global genesis (this could be implicit, e.g. by calling a function on the Glyffiti contract which knows the genesis, or explicit by including a parent hash field equal to the global genesis hash).
A unique hash or ID for this user genesis itself (often the transaction hash can serve as the user genesis ID).
By linking to the global genesis, all user blocks form a tree/graph rooted at that genesis. This means if you traverse backward from any user’s genesis through its parent link, you reach the global root. In graph terms, all user nodes hang off the global node. This gives a unified social graph structure where everything is connected.
3. User Activity Blocks (Posts, etc.): Once a user has a genesis block (their account), any content they create will be recorded as subsequent blocks/events tied to that account. Essentially, each user’s feed is an append-only chain of messages starting from their genesis. Every new post or action by the user can include a reference to the previous post’s hash, forming a sequential chain for that user
ssbc.github.io
. This per-user chain is analogous to each user maintaining their own blockchain of updates:
The first post a user makes would reference their user genesis (or have previous = userGenesisHash). The second post references the first post’s hash, and so on. In this way, each message (except the first one) references the ID of the previous message, allowing a chain to be constructed back to the first message in the feed
ssbc.github.io
. This is similar to Secure Scuttlebutt and other log-based social systems: it ensures no one can alter or reorder their past posts without breaking the chain’s hash continuity.
All these user chains still ultimately tie into the global graph because the user genesis is anchored to the global root. If needed, one can traverse: Post -> previous post -> ... -> user genesis -> global genesis.
The collection of all these chains (one per user) forms the social graph of Glyffiti. Users might also interact with each other’s chains (e.g. a reply or follow might create a cross-link between two chains), which further creates a web of connections. Initially, we focus on the basic posting; relationship edges like follows can be added similarly (e.g. a “follow” action could be a special type of transaction linking one user’s chain to another’s genesis or content).
4. Categories and Sub-Graphs (Future Expansion): In earlier discussions, we touched on categories – possibly thematic groupings or sub-networks within Glyffiti. The architecture can accommodate categories as another layer in the graph. For example:
We could define category nodes that hang off the global genesis (like “Sports”, “Music”, or any user-created group). A category could be represented on-chain by an identifier or even its own genesis block (if categories need their own chain of events).
Users could then link their content to a category. For instance, a post could reference not only the user’s previous post but also a category block (meaning “this post belongs to category X”). Alternatively, users joining a category might produce a link between their user block and the category node.
While categories were discussed, they may not be implemented in the first iteration. The design is flexible enough that we can introduce category linking later without fundamental changes to user account creation. For now, one can consider categories as an organizational concept on top of the user graph (perhaps handled off-chain or in metadata initially).
5. The Big Graph: As more users join and post, Glyffiti’s data will form a massive directed graph of interconnected blocks:
Nodes in this graph include the global genesis, user genesis blocks, and content blocks.
Edges include the “account creation” link (user genesis -> global genesis), “post” links (post -> previous post or user genesis), and potentially “interaction” links (like replies or likes referencing target content, not in scope for initial implementation).
Because everything is recorded on a blockchain, the entire graph is decentralized and open: any node (running the appropriate software) can hold a full copy of the data and verify it. This means anyone can traverse the network’s social graph data, similar to how one can run a Bitcoin node and inspect all transactions
docs.deso.org
. This decentralization ensures no single entity can silently censor or alter the social graph – if a post or user exists on chain, everyone’s copy reflects that. It’s censorship-resistant by design
medium.com
binance.com
.
Figure: Conceptual diagram of the Glyffiti social graph. Below is a conceptual illustration (for reference) of users linking to the global genesis and their posts chaining together. Each hexagon could represent a block (user or content), and lines indicate cryptographic links. (This is a generic image highlighting decentralized social connections.) Blockchain-based social network concept (illustrative): Users (represented by icons) are connected via a decentralized network. Each user’s data is stored as blocks (hexagons) on-chain, forming an interconnected graph with no central server. (The actual implementation will be code-centric rather than visual, but it’s useful to imagine the structure visually: a hub (genesis) with spokes (users), and each spoke has a chain of content nodes attached.)
On-Chain Account Creation Process (Solana Implementation)

Now we dive into how to implement account creation on-chain. We will describe this in the context of Solana (the initial target blockchain) and outline the transactions and smart contract (on-chain program) logic required. The approach will be modular so that other chains could be supported in the future with minimal changes.
2.1 Solana as the Base Layer
We choose Solana for the initial implementation due to its speed and low fees, which are important for a social network where potentially every post is an on-chain transaction. Solana’s blockchain can handle high throughput and offers cost-efficient transactions
irjmets.com
, making it suitable for recording many small social actions. (In a traditional blockchain like Ethereum, posting each message on-chain would be prohibitively expensive; Solana mitigates that with fractions-of-a-cent transaction costs.) Solana Accounts & Programs: In Solana’s architecture, data is stored in accounts (not to be confused with user accounts – here “accounts” mean allocated storage on chain tied to a public key) and logic is implemented in programs (smart contracts). We will create a Solana program called something like glyffiti_program that will manage the user registry and posts.
2.2 Smart Contract: User Registry and Post Log
We design a Solana program to handle two primary functions:
Registering a new user (creating a user account record on-chain).
Submitting a new post or content (creating a post record linked to a user).
User Registration (Create User): The program will expose an instruction, say CreateUser, which a new user calls to register themselves. When an LLM or client calls this, the following happens:
The user (client app) generates a new keypair (more on key generation in the next section). The public key (let’s call it userPubKey) will identify them.
The client sends a transaction to the Solana network calling glyffiti_program.CreateUser, signing it with userPubKey (so the signature proves ownership of that key). This transaction might include:
The userPubKey as one of the accounts (the account to be created or initialized).
Some lamports (Solana tokens) to fund the new account’s rent (Solana requires accounts to maintain a minimum balance to stay alive on chain).
Possibly a piece of data for the user’s profile (for example, we could allow an optional username or display name to be set at creation).
The global genesis reference: The program might have stored internally the globalGenesisKey or hash when it was deployed. We don’t necessarily need to pass this in each time; the program can link new users to the global root by default (for example, by adding the new user’s key to a list in the program’s state or by emitting an event that includes the global genesis hash).
The CreateUser handler in the program will:
Allocate a user account data space on chain (e.g., a fixed-size struct) to store this user’s info.
Store the user’s public key (though the account’s public key is already the user’s identity; we might duplicate it in data for convenience).
Initialize fields: e.g. lastPostHash = null (no posts yet), userName = <provided name> or leave blank, userPubKey = ... etc.
Optionally, maintain a global registry (the program could append the new user’s public key or account address to a global list of users kept in the program’s state for discovery purposes).
Mark the user account as initialized. The account’s address on Solana can be derived from the user’s public key or be a program-derived address – design choice: we could simply use the user’s own key as the account’s address (the user “owns” their account data). Alternatively, we use a Program Derived Address (PDA) that is deterministic from, say, a seed like ["glyffiti_user", userPubKey], so that the program controls the account. For simplicity, let’s assume the user’s own key will be the account; the program will require that the signer userPubKey matches the account being created to ensure people only create their own record.
Link to global genesis: We might not explicitly store a pointer to the global genesis for each user (since it’s common to all), but we could log an event. For example, the program can emit a Solana log event: UserCreated(userPubKey, global_genesis_hash). This log indicates that userPubKey’s genesis is now connected to the global genesis. This is mainly for off-chain indexing; the link is conceptually always true by design of the program.
The result is that on chain, there is now a user account associated with userPubKey. This is the user’s genesis block data. We can treat the creation transaction’s signature or hash as the user genesis hash in the social graph (for example, if we need to refer to this genesis event in other structures, we have it recorded in the chain’s transaction history).
Post Submission (Create Post): The program also provides an instruction CreatePost (or multiple variants for different content types) for when a user wants to publish content.
The user (already registered) will prepare their content. For now, assume it’s a text post or a reference to an image/video (image/video content might be stored off-chain with a hash on-chain to save space – more on that later).
The client will include in the transaction:
The user’s account (so the program knows which user is posting; the user’s account was created in the previous step).
The content data or a hash of it. Because blockchain storage is costly, if content is large, we might store only a hash or an IPFS CID pointing to the content. In the initial simple implementation, content could be a short string and can be stored directly.
A reference to the previous post. This could be the hash of the user’s last post, or the account address of the last post if each post is stored in its own account. Design options:
Option A: Log-only posts: We don’t create a new account for each post; we simply emit an event or log containing the post content and link. In this case, the transaction itself acts as the “post record”, identified by its signature/hash. The user’s account data would have a field lastPostHash which we update to the current transaction’s hash. That effectively links the chain. The downside is retrieving old posts might require scanning the chain’s history or an off-chain index, since they’re only in logs.
Option B: Dedicated post accounts: We allocate a new small account on-chain for each post to store its content and metadata (previous hash, timestamp, etc.). This is more data heavy, but makes it easier to fetch posts by querying accounts. Solana’s account model might make this tricky at huge scale (tens of millions of posts), and one must pay rent for each post account. We might lean to Option A for efficiency, at least initially.
The program will verify that the signer corresponds to the user account (i.e., the userPubKey trying to post indeed has a registered user account). Then:
It checks the user’s stored lastPostHash (if any). The new post’s previous field must match the current last post (this ensures the user isn’t forking their chain or inserting old posts out of order).
If matches (or if lastPostHash is null meaning this is the first post), the program accepts the post.
It updates the user account’s lastPostHash to the hash of this new post (ensuring future posts link correctly).
It emits a PostCreated event containing userPubKey, the new post’s hash (which could just be the transaction signature), and perhaps the first several bytes of content or a content hash, plus the previous hash.
If using Option B (post accounts), the program would create a new account (perhaps a PDA derived from user key and a sequence number) to store the post content. The previous link would be stored in that account data too.
After this transaction, the new post is on-chain. Because the user signed it and the program enforced linking, we have a verifiable chain:
Anyone can see that post X for user Y has a previous = Y’s last post and thus reconstruct Y’s timeline by following the chain of previous pointers back to the genesis (which for the first post would show previous = userGenesis or be null indicating genesis).
The data is immutable – if the user (or anyone) tried to modify an old post or remove it, it would break the hash chain integrity. Also, on most blockchains data cannot be truly deleted, which in our context means posts are permanent unless we programmatically allow deletion (which we likely won’t, to keep history auditable).
Data Structures (Solana specific): We can summarize the on-chain data structure in pseudo-code form for clarity:
Global State (in program account): (Optional)
struct GlobalState {
    // This could store a global genesis hash or admin info. 
    // Possibly a list of all users (vector of pubkeys) for easy iteration.
    // For MVP, we might not store all users here due to size; indexing can be off-chain.
    admin_pubkey: Pubkey,  // perhaps for moderation powers if any
    user_count: u64,       // number of users registered (for metrics)
    // ... other global config if needed
}
We may decide not to use a global state account if unnecessary; Solana programs can be stateless except for the accounts they manage.
User Account Data:
struct UserProfile {
    owner_pubkey: Pubkey,       // the user's public key (should match the account’s authority)
    username: [char; 32],       // optional username or display (fixed size string)
    bio: [char; 128],           // optional bio or profile info (just as an example)
    last_post_hash: [u8; 32],   // hash (or signature) of the user's most recent post
    // encryption public keys, etc., could be stored if using special keys for content
    // (for now, the owner_pubkey is also used for verifying identity and deriving encryption keys)
}
This profile is stored in a Solana account owned by the glyffiti_program. The owner_pubkey here is redundant if the account’s address is derived from the user’s key, but we include it for completeness. We also include fields for future use (like profile text). The size of this data structure matters for Solana (rent cost), but it’s quite small. If we allow variable-length fields like username, we might have to use pointers or a separate account for profile metadata – to keep things simple, we use fixed-size fields or require that profile text be short.
Post Record (if using accounts for posts):
struct PostRecord {
    author_pubkey: Pubkey,
    previous_post_hash: [u8; 32],  // hash of previous post in author’s chain (or null if first post)
    timestamp: u64,               // block time or provided timestamp
    content_ref: [u8; 64],        // could store either the actual text (if small) 
                                  // or a hash/pointer (e.g., IPFS CID) to the content
    encrypted: bool,             // flag if content_ref is encrypted data
    // If encrypted, the actual decryption key or strategy is not stored here (would be shared off-chain to recipients).
}
Each such PostRecord would be stored in an account whose address might be derived from (user, sequence) or (user, postHash). Alternatively, we skip this and rely on events.
Given the tradeoffs, we might implement a hybrid approach:
Use Solana log events for posts in early development (to avoid creating too many accounts). Off-chain indexers or the client app can collect these events to construct feeds.
The user’s profile account stores last_post_hash to enforce ordering and maybe a last_post_timestamp.
If needed, we can later migrate to actual on-chain storage for posts or use a scalable off-chain storage with merkle proofs.
2.3 Ensuring Security and Integrity On-Chain
The on-chain logic will ensure only valid actions occur:
Only the user’s own key can create their user account and post in their feed. This is guaranteed by requiring the transaction to be signed by the user’s key and checking that against the stored identity. As a result, each feed is unforgeable by others
scuttlebot.io
 – only Alice can append to Alice’s chain, Bob to Bob’s chain, etc.
The hash linking means if someone tries to insert or remove a post in the middle, the chain of hashes will not match up. The program storing last_post_hash helps with this by only accepting a new post if it matches the known latest hash, thereby preventing history from being altered or forked on a single user’s feed.
Because all posts and accounts are signed and on-chain, any node can verify the data integrity. If a malicious client tried to fabricate a user or post that wasn’t actually created on-chain, other clients will not see it in the ledger. The blockchain consensus assures global ordering and visibility of events.
2.4 Example Flow On-Chain
To illustrate, imagine a new user “Alice” joining Glyffiti:
Alice’s app generates her keypair (say A_pub / A_priv). We’ll detail this in the next (In-App) section.
The app sends a CreateUser transaction with A_pub. The Glyffiti program creates a UserProfile account for Alice:
Sets owner_pubkey = A_pub, username = (maybe "Alice"), last_post_hash = null.
Emits event: “UserCreated: A_pub linked to GlobalGenesis”.
Later, Alice writes her first post “Hello World!”. The app prepares a CreatePost call:
It fills previous_post_hash = null (since last_post_hash was null for first post).
Content could be included directly (e.g., in a memo or in the instruction data).
Signs with A_priv.
The program sees owner_pubkey = A_pub matches the signer, and previous_post_hash matches Alice’s current last_post_hash (both null).
It updates Alice’s last_post_hash to the new post’s hash (let’s call it H1).
Emits event: “PostCreated: author=A_pub, hash=H1, prev=null, content_ref=<hash or snippet>”.
Alice’s second post “My second post”:
App calls CreatePost with previous_post_hash = H1.
Program verifies it matches Alice’s last_post_hash (which is H1 now).
Accepts, updates last_post_hash to H2, emits event with prev=H1, etc.
If Bob later replies to Alice (if we implement replies), Bob’s post might include a reference to Alice’s post hash H2 to indicate a reply. That would form a cross-link, but such details can be added once basic posting works.
At the end of this, on chain we have:
A UserProfile for Alice (with last_post_hash = H2).
Two post events or records for Alice (H1 -> null, H2 -> H1). Anyone can fetch these from the chain and reconstruct that Alice has two posts in order.
In-App Account Creation (iPhone Client Perspective)

Next, we outline how the client application (specifically the iOS app) will handle user account creation. This includes generating cryptographic keys, interacting with the blockchain, and storing credentials securely on the device. We also keep in mind App Store guidelines and user experience (since managing keys can be tricky for users).
3.1 Generating the User’s Keypair (Wallet Seed)
When the user opens Glyffiti for the first time and chooses to create an account, the app will need to generate a wallet seed and keypair. This is analogous to creating a new cryptocurrency wallet:
We use a strong source of randomness to create a seed (e.g., 256-bit random number). On iOS, we can use Security framework or CryptoKit to get cryptographically secure random bytes.
Using this seed, we derive a public/private keypair. Glyffiti likely uses Ed25519 keys (which is what Solana uses for account signing). The app can use a library (for example, Solana’s official SDK or a libsodium wrapper) to generate an Ed25519 keypair from the seed.
Optionally, we can present the user with a mnemonic phrase (e.g., a 12- or 24-word seed phrase) which encodes that seed. This way the user can back up their account. Many crypto wallets do this. For a seamless social app experience, we might simplify and not show the phrase unless the user explicitly wants to back up or transfer their account. But from a best practice standpoint, giving the user a recovery phrase (and urging them to save it) is good to ensure they can restore their account if they lose the device.
No personal information (email, phone, etc.) is required at signup – the identity is purely the cryptographic key. This is a privacy win: users can set up accounts without divulging any personally identifiable information, thanks to public-key cryptography serving as authentication
medium.com
.
The app will securely store the private key. On iOS, the best place is the Keychain, which is encrypted and protected by the device’s security (and optionally the user’s passcode/biometric). We might also leverage the Secure Enclave for signing operations if we want even higher security (the Secure Enclave can store a private key such that it can perform signatures but the raw key can’t be extracted). However, using the Secure Enclave might complicate deriving the key from a mnemonic. A simpler route: store the seed in Keychain, and when needing to sign, retrieve it (Keychain will require user auth if configured) and then sign in software.
We ensure that the app is compliant with Apple’s encryption export rules – standard libraries (like CryptoKit, CommonCrypto, or libsodium) are typically classified as offering exempt encryption (since they’re publicly available and not custom military tech). We’ll mark the app uses encryption in the App Store submission (which is required by law), but no special permission should be needed as this is common in messaging apps.
User Experience Consideration: The account creation should feel easy. Possibly:
The user opens the app, taps “Create Account”.
The app quickly generates the key in the background.
It may immediately prompt the user to choose a username/display name that will be associated with their profile. (This username can be stored on-chain in their profile if desired, or off-chain. We can also allow anonymity by skipping username or allowing duplicates, since the true identity is the key.)
The app might then show a “Recovery Phrase” screen with 12 words and ask the user to save them somewhere safe (with the option to skip or remind later, if we think that’s too heavy for initial onboarding).
After that, the account is technically created locally. But it’s not yet on-chain. We need to register it on the blockchain next.
3.2 Registering the Account On-Chain via the App
Once the app has a keypair for the user, it must perform the on-chain registration (the CreateUser call described in the previous section). Steps the app will take:
Establish network connection: The app will connect to the Solana network (likely via an RPC node). For mainnet it would use a remote RPC endpoint. During development, a testnet or localnet might be used. The app might use a library like Solana Web3 (for JavaScript if a React Native app) or a Swift Solana SDK if a native iOS app. Given we want iPhone compatibility, a native Swift implementation using something like Solana.swift SDK is likely.
Compose the transaction: Using the SDK, the app composes a CreateUser instruction for the glyffiti_program. This includes specifying the program’s public key, the accounts involved, and any input data (like the chosen username).
It will indicate that a new account should be created (for the user profile). In Solana, creating an account requires specifying the space needed and the owner program. Our glyffiti_program might provide a helper or we manually add a SystemProgram::CreateAccount instruction followed by our program’s CreateUser instruction to initialize it.
The newAccountPubKey will be the same as the user’s public key if we decided the user’s own keypair will hold their profile. (This is convenient: the user then owns their profile account directly. Alternatively, the program could be the owner, but we still want the user to be the one who signs to create it.)
Provide the necessary lamports for rent-exemption. The app can either require the user to fund their wallet first or, more user-friendly, Glyffiti might maintain a faucet or service that funds new user accounts with the minimal rent (since it’s a small amount of SOL). A strategy could be: if the user’s wallet has zero SOL (very likely for a new user who hasn’t interacted with crypto), the app could call a backend service that sends, say, 0.002 SOL to the new user just for the creation. This is a detail to manage so that the user isn’t stuck. (Apple might consider this gifting of crypto acceptable as long as it’s free and not purchasing crypto in-app, which would be disallowed. We are just facilitating a network fee.)
Sign and send: The app uses the user’s private key to sign the transaction. This happens within the app (the key is in Keychain, but accessible to our code for signing, unless using Secure Enclave where we call its API to sign).
Confirmation: The transaction is submitted to the network. The app waits for confirmation that the transaction was finalized. Once confirmed, the user’s account exists on-chain.
Store Account Info: The app now knows the user’s on-chain account (it’s basically the same as their pubkey). It can store the user’s credentials in the app’s storage (private key in Keychain as mentioned, maybe also store the public key and username in UserDefaults or a database for quick access).
Feedback to user: The UI can now proceed, perhaps taking the user to the main feed or profile screen. From the user’s perspective, they might not even realize a blockchain transaction occurred (the app can abstract it). If the process takes a few seconds, a loading indicator “Creating your account…” can be shown.
Edge Cases & Reliability:
If the network call fails or times out, the app should retry or present an error (“Network issue, please try again”). We should ensure idempotence – if a CreateUser transaction partially went through or the user is unsure, we might need to query if their account actually got created. Because if the transaction succeeded but the app didn’t get the response, sending it again would either fail (duplicate) or could create a weird state. One approach: the program could prevent duplicate accounts with the same pubkey (obviously, it should). The app could query the chain for UserProfile(A_pub) existence; if found, then even if confirmation was missed, the account is there and we proceed.
We should handle the case of username collisions (if we decide to enforce unique usernames on-chain). It might be easier not to enforce uniqueness on-chain, to avoid complicating the transaction. We can allow duplicates or do uniqueness off-chain if at all.
If using a backend faucet for funding fees, ensure it’s secure (only fund new accounts once, and not abusable). Possibly tie it to the device or have a simple captcha. But since each account is one small airdrop, risk is low.
After this registration, the user’s device holds:
userPubKey (public identity, possibly shown in UI as their address or a short fingerprint).
userPrivKey (securely stored).
The app can now fetch any existing content (though as a new user there is none yet) and allow the user to start posting.
3.3 Posting Content via the App
The process for posting content from the app involves preparing the data (and encryption if needed), then sending a transaction similar to the above:
User writes a post: In the UI, the user enters text or selects a photo to share. Suppose Alice writes "Hello world!" and hits send.
Determine recipients / visibility: The app will decide if this post is public or private. By default, we assume public (anyone on Glyffiti can view). If the user had options like "friends-only" or specific recipients, the app would collect those recipient public keys here.
Encryption (if applicable):
If public: No encryption is actually needed (or we use a standardized public encryption key that everyone has – which effectively means it’s not confidential). In practice, we might simply not encrypt public posts, just sign them (the signature is already inherent).
If private/group: The app will encrypt the content so that only intended recipients (and the sender) can decrypt. This could be done using each recipient’s public key (asymmetric encryption) or a symmetric key shared among the group.
For one-to-one messages, the app can do an EC Diffie-Hellman between the sender’s private key and recipient’s public key to derive a symmetric key, then use a symmetric cipher (say AES) to encrypt the message. The recipient can derive the same key with their private key and sender’s public key and decrypt. This is essentially how many E2E messaging protocols bootstrap encryption (Oliveira, etc.), and Ed25519 keys can be converted to X25519 for ECDH if needed.
For group messages, one naive method: encrypt the message separately for each recipient’s public key and include each encrypted blob in the transaction (or a single blob encrypted with a one-time symmetric key, and that key itself encrypted to each recipient’s pubkey – known as envelope encryption). However, managing group keys and re-encrypting if group membership changes (e.g., someone is blocked/removed) can be complex. Initially, we may avoid implementing group-specific privacy beyond “everyone or specific one-to-one DM”.
The outcome is either cleartext content (public case) or an encrypted blob plus some metadata on how to decrypt (like which keys it’s for, or an indicator that it’s encrypted).
We will also mark an encrypted flag for the content if posting on chain, so other clients know they need to attempt decryption. For instance, in the on-chain PostRecord, encrypted: true and maybe an indicator of encryption scheme (e.g., “sealed box for recipient X”). In Secure Scuttlebutt, encrypted messages are denoted by a .box suffix and are base64 strings
ssbc.github.io
; we can do something similar (like store encrypted content as base64 and set a flag)
ssbc.github.io
.
Compose post transaction: The app calls the Solana glyffiti_program.CreatePost instruction. It provides:
Alice’s UserProfile account.
The previous_post_hash (the app should have stored the last post’s hash locally or it can fetch it from chain by reading Alice’s UserProfile.last_post_hash).
The content payload: If small enough, it could be embedded directly in the instruction data (Solana permits a few hundred bytes in a transaction). If it’s larger or binary (like an image), the app would likely upload the image to IPFS or a cloud storage and then include just a reference (like an IPFS CID or URL hash) in the transaction. For text, we can include it directly or also use IPFS for consistency – but text is usually fine on chain if short.
A flag or metadata if the content is encrypted and if so, perhaps include a symmetric key encrypted for the user themselves (since the user’s own private key might be needed to decrypt their copy unless they keep the plain text).
Sign with Alice’s key and send the transaction.
Network confirmation: Once the transaction is confirmed, the new post is on-chain. The app updates Alice’s local state:
It can update the cached last_post_hash to the new one (so next time it doesn’t have to wait to fetch from chain).
It adds the post to the UI feed (optimistically, even before confirmation, one could show it, but marking unconfirmed). After confirmation, ensure it’s finalized.
Broadcast via P2P: In addition to relying on the blockchain, the app could also propagate the new post to peers or a content distribution network for speed. For example, if Glyffiti uses a pub/sub or gossip network, when Alice posts, her app could immediately send the post to connected peers so they see it quickly without waiting for on-chain finality. This is an advanced optimization – initial implementation may skip direct P2P gossip and just use the blockchain as the source of truth that others poll or subscribe to.
3.4 Secure Storage and Multi-Device Access
On the iPhone, after creation:
Alice’s private key is in the Keychain. It’s accessible only to Glyffiti app (and not to other apps). The Keychain item can be configured to require user authentication (FaceID/TouchID) each time it’s accessed, for extra security, though that might make frequent posting cumbersome. We might instead lock it behind the device unlock (so if phone is unlocked, the app can use it).
If Alice wants to use her account on another device (say an iPad or a new phone), she would need the recovery seed. The app should provide a way (in settings) to export the seed phrase or key. Then on the new device, she would input/import it, and the app would regenerate the same keypair. Since the account is already on-chain, the new device doesn’t call CreateUser again; it simply loads the existing profile (by public key) and can start posting with the same identity.
We must caution the user that losing the key means losing access – there is no “forgot password” in a decentralized system. This is another reason we might want the user to save the recovery phrase at account creation. It’s a trade-off between user-friendliness and true decentralization. Some projects opt for social recovery or linking an email for key recovery (but that introduces trust in a server). Given the scope, we assume tech-savvy users who can manage a seed phrase, or we provide clear warnings.
3.5 Compatibility with iPhone App Store Guidelines
From an app implementation standpoint:
Cryptography Declaration: As mentioned, we’ll declare usage of encryption in the app submission. Using standard libraries like CommonCrypto or CryptoKit typically passes the guidelines (which require not exporting to embargoed countries, etc., but Apple’s form covers that).
App Store Review Considerations: Apple might question an app that creates cryptocurrency accounts. However, many Solana apps and wallets exist on iOS. The key is to clarify we are a social app using blockchain for data, not a trading app. We do not facilitate purchase of tokens for real money within the app (which would require in-app purchase compliance). If any cryptocurrency (like SOL for fees) is needed, we must not sell it in-app. We either give it for free (faucet) or require the user to transfer from outside. Apple allows wallets and crypto apps as long as they’re not selling tokens as a way to unlock content without Apple’s payment system. Since our token (SOL) is for network fees and not something we are selling, it should be fine. Also, if Glyffiti in future had its own token or NFTs for content, we have to be careful: Apple now allows NFTs display but if they are used to unlock features, that might have to go through IAP or be freely given.
Performance: Solana transactions are fast (finality often in seconds). However, the app should handle cases where the user has poor internet or the blockchain is congested. Including robust error messages and maybe transaction status tracking (retry or show pending state) is important for good UX.
At this point, after account creation and posting features are implemented in-app, the user can create an account and publish content from their iPhone which goes directly onto the blockchain. Next, we will discuss how the social content distribution works and how encryption & blocking are managed, which ties the on-chain and in-app pieces together with P2P networking and compliance.
Content Distribution, P2P Network, and Reading Posts

Glyffiti aims to use a peer-to-peer network for distributing content, rather than a centralized server. This means once posts are on-chain, users (or their apps/nodes) should propagate and fetch them in a decentralized manner. We outline how users will get each other’s posts and how the “feed” might be constructed, as well as how P2P aspects and caching play a role.
4.1 Retrieving and Viewing Content
There are a couple of ways to get the data for a user’s feed:
Directly from the Blockchain: Since all posts are recorded on-chain, one straightforward method is for the app to query the blockchain for new content. For example, it could use Solana RPC’s logs subscription or account subscription:
Subscribe to the global program’s events or to the set of user accounts of interest. The app might maintain a list of followed user accounts and subscribe to changes in those accounts (which would notify when last_post_hash changes, but not the content itself unless we had a post account).
Or subscribe to program logs filtering for PostCreated events. If Solana’s RPC allows filtering by program, the app can get a stream of all new posts globally. Then it can decide which to show (for instance, maybe show all if it’s a global feed, or filter by follows if we implement that).
P2P Gossip Network: Glyffiti can also run a separate overlay network where users’ devices connect and relay messages (somewhat like Scuttlebutt or BitTorrent for social data). Possibly using something like libp2p or even simple WebSockets to known peers. This is a complex subsystem; initially, using the blockchain as the “source of truth” and relying on its decentralization might suffice, albeit with some centralization on RPC providers.
Hybrid (Indexers): In practice, many decentralized apps use indexing services (like The Graph or custom indexers) to make querying easier. We might deploy a service that listens to all Glyffiti-related chain events and populates a database for queries (e.g., to quickly fetch all posts from people you follow, or search). While this reintroduces some centralization, it can be an optional enhancement for user convenience. The core data is still on-chain and can be independently verified; the indexer just caches it. For our spec, it’s enough to note this as a possibility but not required for minimal functionality.
Displaying the Feed: The app will have a main feed UI (like a timeline):
If we have a concept of “following” specific users, the feed might show posts from those users. The app would then specifically retrieve posts from those users’ chains. If every post references the previous, one could fetch the latest for each followed user and walk backward until you have enough posts or reach ones you’ve seen. Alternatively, the indexer approach could directly give you an aggregated timeline sorted by time.
If initially we implement a global feed (all public posts by everyone), that could be overwhelming but for a small network it’s easiest: just show all posts by creation time. The app can get the latest posts by listening to events.
Each post on screen will have the content (decrypted if needed) and the author info. The app may need to fetch the author’s profile (username, etc.) from chain (which is in the UserProfile account).
For media content: If a post contains images/videos, likely the on-chain data is a URL or hash. The app will detect that and fetch the actual media from the appropriate network (could be IPFS – we’d integrate an IPFS HTTP gateway call, or from a cloud CDN if used). Caching these in the app is advisable (images can be stored in temp/cache directory for quick reload).
Verification: Because content comes from the chain, it’s inherently verified by signatures. The app should still verify signatures on the content it retrieves (though if it’s from a trusted RPC, less an issue; but if from P2P, definitely verify). For example, if a post event includes the author pubkey and content hash, the app can trust it since the event was emitted by our program which only emits valid signed posts. In a full P2P scenario, if a peer sends you a purported post, you’d verify the signature with the author’s pubkey to ensure it’s legitimate and not forged. This ensures authenticity – only the owner of a feed can produce valid messages for that feed
scuttlebot.io
.
Ordering: Each user’s posts are inherently ordered by their chain sequence. But if we are mixing multiple users in one feed, we might order by timestamp. Since blockchain posts have block timestamps, we can use those. However, block time isn’t perfectly sequential for different users (two posts could be in same block or out-of-order by chain time vs logical time). But as a social app, using the timestamp (or block slot) is fine for sorting approximate recency.
Scalability: If the network grows large, retrieving everything on-chain might become too heavy for a mobile device. That’s where either a selective sync or an indexer is needed. Possibly each client could filter to only fetch data from people they care about. In the beginning, global volume is low so a simple approach works.
4.2 Peer-to-Peer Layer (Future Considerations)
While the blockchain provides global consistency, a pure on-chain approach means every post has to wait for a transaction. To improve real-time experience and reduce load, a P2P overlay can be used:
Each Glyffiti app instance could connect to a few peers (random or known bootstrap nodes) and exchange new post announcements. For example, when Alice’s app submits a post to Solana, it simultaneously sends a P2P message “NewPost: {author: A_pub, hash: H2, prev: H1, content: ...}” to peers. Peers can then retrieve the content (if included or via the hash from the chain).
If Bob’s app is connected and receives this, it can show Alice’s post immediately (marked as unconfirmed maybe). It would later see the on-chain confirmation to finalize it. If a post never gets confirmed (maybe dropped transaction), the app might remove or mark it as failed.
This requires some networking code (could use a distributed pub-sub like IPFS PubSub or a custom WebSocket mesh). Given time constraints, the initial release might skip or simplify this.
4.3 Content Storage: On-Chain vs Off-Chain
We should clarify what data is stored on-chain:
Text posts: short text (a few hundred characters) can be stored directly on-chain (Solana’s transaction or account). This ensures full decentralization. It costs a small fee but with Solana it’s minor for small data.
Images/Videos: These are large (MBs), not feasible to store directly on-chain for every post. Instead, we use off-chain storage:
A decentralized choice is IPFS or Arweave. The app can upload the image to IPFS (via an API to an IPFS node or a public gateway) and obtain a content hash (CID). That CID is then put on-chain in the post record. Anyone can use the CID to retrieve the image from IPFS. The downside is persistence – IPFS doesn’t guarantee your data stays unless a node pins it. Arweave provides permanent storage for a fee; we could integrate that for important media. For now, IPFS with perhaps Glyffiti running its own pinning node would work.
Alternatively, a centralized approach is to upload images to a cloud storage (AWS S3 or similar) and store the URL. This is simpler but introduces centralization (if our server goes down, images disappear). Given the spirit of decentralization, IPFS is preferred for at least a semi-decentralized solution.
Profile pictures or profile data: Similar strategy – small text (like display name) on-chain, larger data (profile avatar image) via IPFS.
Encryption for media: If images are meant to be private (e.g., shared only with friends), the app should encrypt the image file before uploading to IPFS. Then share the decryption key only with recipients (the IPFS hash is of the encrypted blob). That way, even though the encrypted image is publicly hosted, only intended users can decrypt it. This aligns with the “everything encrypted by default” philosophy for privacy.
In summary, the content scaffolding is:
On-chain: essential metadata and pointers (and small content).
Off-chain distributed storage: heavy content, possibly encrypted.
Encryption & Privacy Model

Everything in Glyffiti is designed to be end-to-end encrypted, except where we deliberately make it public. Here we detail how encryption keys are managed and how privacy can be ensured, including what happens when a user wants to block someone (which might involve encryption changes).
5.1 Public vs Private Content
As noted, public content is readable by anyone on the network. Implementation-wise, this can be treated as unencrypted (plaintext) content on-chain. It is still digitally signed by the user’s key to prove authenticity
ssbc.github.io
, but not encrypted. Anyone can fetch it and read it. The term “everyone gets an envelope” was used – in practice, if we treat it literally, it would mean the message is encrypted but the decryption key is shared with everyone. That is equivalent to not encrypting at all (or encrypting with a well-known public key that everyone possesses). So for efficiency, we will not encrypt public posts; we simply mark them as public. This keeps things simple and accessible. For private content, encryption is essential:
If Alice wants to send a private message to Bob, Alice’s app will encrypt the message with Bob’s public key (so that only Bob’s private key can decrypt). This can be done using an encryption scheme like Nacl Box (Curve25519 key exchange + XSalsa20-Poly1305 encryption) which is used in many secure messaging systems. In fact, we can convert the Ed25519 keys to X25519 and use the libsodium sealed box functions – these use Diffie-Hellman to produce a shared key and encrypt the message such that only Bob can open it. The content field on-chain would then be that ciphertext, likely base64 encoded, and we’d set a flag encrypted = true
ssbc.github.io
.
Bob’s app, when reading that post, sees encrypted = true and knows it must decrypt using Bob’s private key. If the decryption succeeds, it displays the plaintext. If Bob was not actually an intended recipient, the decryption would fail (or yield gibberish), and the app can then conclude the content wasn’t meant for Bob. If a post is not intended for the current user, the UI might simply not show it or show it as “Encrypted post not for you.”
For group encryption (e.g., Alice shares a post with a set of 5 friends only), an efficient way is to generate a one-time symmetric key for that post and then encrypt that symmetric key separately to each friend’s public key, storing those encrypted keys as part of the post metadata (or on-chain, if small). Then the content is encrypted with the symmetric key. Each friend finds the key meant for them, decrypts it with their private key, then decrypts the content. This avoids encrypting the whole large content multiple times. However, this adds complexity and data overhead (one encrypted key per recipient).
Initially, we might avoid multi-recipient encryption by simply deciding that truly private content will be one-to-one (DMs), and “friends-only” posts might not be implemented until later. If we do implement “friends-only” broadcast, the above key sharing method would be used.
5.2 User Blocking via Encryption
One novel idea raised was using encryption changes to implement user blocking. The notion is:
If Alice wants to block Bob from seeing her future posts, and if those posts are not completely public, she could achieve that by not sharing encryption keys with Bob going forward.
In a fully public system, blocking someone from viewing content is hard (since content is public, a blocked user could just log out or use another client to see it). However, blocking is still useful to stop direct harassment (e.g., prevent Bob from commenting on Alice or messaging Alice). We’ll discuss blocking enforcement in the next section (Moderation).
If we imagine a scenario where, say, by default posts were encrypted for all “friends” or all “followers” rather than public, then blocking someone could mean you remove them from the encryption recipients list so they literally can’t decrypt your posts anymore. This provides a strong guarantee they cannot read future content.
It was questioned: “I think we have to [change encryption keys], don’t we, if we want users to block others by encryption?” This implies a system where, for example, a group of authorized viewers has a shared key which must be rotated when someone is removed. Indeed, in group chat encryption, when someone is removed, it’s common to generate new group keys so the removed participant can’t decrypt new messages.
For Glyffiti, implementing that from the start might be overkill if most content is just public. But let’s outline how it could work:
Suppose we have a concept of “my followers can see my posts, but non-followers cannot.” Then Alice would maintain an access control list (list of authorized user public keys). For each post, the encryption would be targeted to that list.
If Alice blocks Bob, she’d remove Bob from her authorized list and perhaps change some group encryption key. Future posts would exclude Bob (so Bob’s app would see encrypted content that it cannot decrypt – effectively gibberish, enforcing the block).
Additionally, if content was completely p2p and not on a public ledger, Alice’s device could just not send content to Bob’s device. But since here content is on a blockchain, Bob can always fetch the ciphertext from the chain; encryption is the only barrier to reading it.
There is an edge: Bob could create a new account to circumvent being blocked, if content remains broadly accessible. True prevention may require a more advanced protocol or central moderation (like banning Bob’s IP or something, which is not decentralized).
In summary, encryption-based blocking is relevant mostly when content isn’t intended to be public to the whole world. In our initial design, content is largely public (or individually shared). So blocking will be implemented at the app level (UI ignoring Bob, and preventing Bob from contacting Alice, etc.) rather than by encryption, at least in MVP. We can mention it as a future security enhancement: e.g., “In a future iteration, if we enable private circles, blocking a user will ensure they are no longer included in the encryption recipient list of any of your future posts, effectively preventing them from accessing your content.”
5.3 Key Management Summary
Each user has a primary identity keypair (the one generated at account creation). We are leveraging that for multiple purposes:
To sign all on-chain actions (account creation, posts) – this provides authenticity and integrity.
To serve (possibly) as the base for encryption keys: With Ed25519 keys, we can derive a corresponding X25519 key (there are libraries to convert). That X25519 key can perform Diffie-Hellman to create shared secrets with other users. This means we don’t need a separate “encryption public key” for each user; the identity key can do it. However, using the same key for both signing and encryption is sometimes discouraged in crypto practice (because signing keys are long-term and one might prefer using session keys for actual encryption). Alternatively:
We could generate an additional keypair for encryption purposes (like an “encryption subkey”) and publish its public key in the user’s profile. This would allow rotating encryption keys without changing identity. But to keep it simple, we will use the identity key for now.
Keys are stored client-side; the blockchain does not hold private keys. Public keys are public by nature (and visible as your address).
If a user’s key is compromised, that is akin to account compromise. There is no easy recovery (since the attacker can impersonate and you can’t just reset a password). The only recourse would be to register a new account and inform connections, or if we built a recovery mechanism via smart contract (like a social recovery where a set of trusted contacts could sign to move your account to a new key – advanced feature, not in initial plan).
5.4 Default Encryption Setting
By default, Glyffiti will treat posts as public. So, although “everything should be encrypted,” the default encryption will effectively be a no-op (plaintext) for broad sharing. We interpret the instruction as designing the system capable of encryption, with encryption being the norm for private messages, but not forcing encryption when not needed. This approach has advantages:
It’s easier for new users – they don’t have to deal with keys for every post or adding friends to lists to ensure delivery.
Public content fosters community-wide discovery (like how tweets are generally public).
It sidesteps the complexity of key distribution for every piece of content initially.
However, the system is built such that:
If Alice chooses, she could post something encrypted to only Bob. The UI could have a “Send as direct message” or “Post to friends only” toggle.
We ensure that even for public posts, we maintain the envelope structure: e.g., data fields and APIs treat content similarly whether encrypted or not. This means the transition to more encryption is smooth. For example, we might always encapsulate content in a data structure that includes a field visibility: public/friends/direct and then handle encryption accordingly. Public means no encryption keys needed, direct means one key (recipient), etc.
In summary, our encryption model gives users control over privacy on a per-post or per-message basis, and lays groundwork that only intended parties can read private communications
irjmets.com
. It also acknowledges that fully preventing a blocked/determined user from seeing public info is outside the scope of crypto and rather a social/UX enforcement issue.
User Blocking, Reporting, and Moderation (App Store Compliance)

Finally, we address the features needed to make the app compliant with App Store rules and to create a safe user environment: blocking users, content moderation, and reporting
developer.apple.com
. These are crucial for any social platform, decentralized or not, especially since Apple will reject social apps that lack these controls.
6.1 User Blocking
Blocking allows a user to stop another user from interacting with them or viewing their content (to the extent possible):
In the Glyffiti app, there will be an option like “Block User” accessible perhaps from that user’s profile or a menu on a post/comment.
When Alice blocks Bob:
Alice’s app will add Bob’s identifier (public key) to Alice’s blocked list. This list can be maintained locally in the app’s storage (which is simplest and private to Alice), or we could record it on-chain in Alice’s profile (which makes it visible that Alice blocked Bob, which might not be desirable and also could be used for moderation, but it exposes social graph info).
The app UI will from then on filter out any content from Bob. That means Bob’s posts won’t appear in Alice’s feed or search results; Bob’s profile might appear as “Blocked user” if she tries to view it. Essentially, Alice “ignores” Bob.
Additionally, the app will prevent Bob from initiating contact with Alice through the UI. For example, if Bob tries to send a direct message to Alice, the app (on Bob’s side) could check if Alice has blocked him – but since Alice’s block list is local, Bob’s app might not know. So instead, when Bob attempts to DM Alice, either:
The DM goes through on-chain, but Alice’s app will refuse to show it or alert her (effectively dropping it).
Or we implement a stronger rule: maybe the Glyffiti program could enforce that if a user has blocked another, it refuses to deliver DMs. This would require storing block info on-chain or in a shared place. It’s complex because it requires consensus on what “blocked” means on a decentralized network. A simpler approach: treat DMs like posts that are encrypted for the recipient. If Alice blocked Bob, she simply will not decrypt or show Bob’s messages. Bob might still post them (wasting his effort but she won’t see).
If we integrate encryption for content and Alice’s posts were not fully public, as discussed, Alice would exclude Bob from now on (so Bob can’t decrypt new stuff).
Blocking should also ideally hide Alice’s content from Bob. As discussed, if content is public, we can’t completely stop Bob from creating another account or using a different client to view public data. But within our app, we will implement that if Bob is logged in and Bob has been blocked by Alice:
Bob’s app will not allow him to comment on Alice’s posts (maybe the app can check if the author blocked you by some mechanism – which again implies knowledge of block list).
Bob’s feed might still show Alice’s posts if they’re global/public (because Bob’s app doesn’t know he’s blocked unless we make that info available). Actually, this is tricky – perhaps we do store a minimal on-chain indicator of blocks. For instance, a user profile could have a “block list hash” or something (conceivably a hash of the list for privacy or a bloom filter). But that’s probably overkill and leaking info.
We might accept that if Alice blocks Bob, the primary effect is Bob can’t effectively contact or bother Alice (which is still a win). Bob might still passively read public posts – which is similar to Twitter’s model (blocked user can’t interact, but if they log out or use third-party they might still read tweets).
Implementation storage: likely each user’s block list is just kept client-side for now. In a truly decentralized approach, one might propagate block info so that, for example, other clients could know to not forward Bob’s messages to Alice. But without centralized servers, it’s hard to propagate that. We can do something: if our P2P network has friend graphs, when Alice blocks Bob, maybe Alice’s peer connection to Bob is dropped. But in our design, peers aren’t directly connected by friendship necessarily.
Given the complexity, we start with the simplest: block = local ignore. It satisfies Apple’s requirement that “the ability to block abusive users from the service” is present
developer.apple.com
, because from Alice’s perspective in the app, Bob disappears.
6.2 Content Reporting and Filtering
Reporting: Users need a way to report offensive content or users. We will include:
A “Report” button on posts and perhaps user profiles. When a user taps report, we should let them specify a reason (spam, hate speech, etc.).
Since there’s no central admin in a pure decentralized network, this is tricky. However, Apple’s guideline doesn’t say the moderation must be decentralized – it just says there must be a mechanism to report and a timely response to concerns
developer.apple.com
. This implies the app developers (us) should receive these reports and act on them (or community moderators).
So likely, Glyffiti will have a moderation backend that collects reports. Perhaps the app, when you report a post, will send an HTTPS request to our server with details (post hash, reporter, reason). The developers can then review it. If the content indeed violates terms, what can we do?
We can’t delete it from the blockchain (impossible). But we can update our app to filter that content globally (like maintaining a list of banned content hashes that the app refuses to display). Essentially, the app could have a hardcoded or remotely fetched list of “banned posts/users” and not show them. This is similar to how some decentralized platforms handle moderation – they don’t remove data from the source, but the official client filters it out.
We can also choose to ban a user in the app: e.g., if someone is posting illegal content, we could add their pubkey to a blacklist that the app uses to hide all their content (and maybe prevent new accounts by that person if known).
These steps reintroduce a degree of centralized moderation, but likely necessary to satisfy Apple and general law (e.g., CSAM cannot be allowed, etc.). The data is on-chain, but our app at least should not display or spread illicit content.
This also means our UI needs a way to get updates to the moderation list. We could bake a list into each app update (not very responsive) or fetch from an API at startup (more dynamic). Possibly use the blockchain itself to store moderation flags (like a special “moderator account” could publish a list of banned hashes on chain that everyone’s app checks). That would be a clever decentralized way, though it relies on users trusting those moderator postings.
As a simpler path, an off-chain mod list fetch is fine (maybe not fully decentralized, but pragmatic).
We will provide contact info for users (e.g., in the app’s about or settings, list a support email or link)
developer.apple.com
.
Filtering Objectionable Content: Apple requires a “method for filtering objectionable material from being posted”. This doesn’t necessarily mean automated filtering (the guideline clarifies it could be post-fact removal)
developer.apple.com
. Initially, we might not implement automated filters (like scanning text for slurs), but we do implement:
The reporting mechanism (so objectionable material can be flagged and then we, as moderators, can filter it).
Possibly a client-side filter for obvious things: e.g., do not allow posts with certain banned words or too many unprintable characters. But this can be bypassed by advanced users and is a bit out-of-scope unless we integrate some library. We might leave heavy filtering to user reports and moderation actions.
User Privacy vs Moderation: It’s worth noting, if content is end-to-end encrypted (like a private DM), how can we moderate it? We can’t read it to know if it’s objectionable. This is the same issue as in apps like WhatsApp – the platform can’t easily moderate encrypted chats. For public or group posts, since they could be visible to everyone (and likely unencrypted in those cases), moderation can act on them. For truly private messages, we might rely on users blocking/reporting a user itself if they send harassing DMs, even if we can’t see the message content. If Alice reports Bob for harassment in DMs, we as devs might not see the exact content (unless we build a feature to allow attaching decrypted content with consent – unlikely). We may simply warn/ban Bob if multiple reports come or suggest Alice block Bob. App Store Note: The presence of strong encryption in the app should be fine (lots of messaging apps do that), but Apple expects that even with encryption, there’s some mechanism to deal with abuse. As long as we have reporting and block, we likely satisfy them on that front. Apple Review might ask: “If content is decentralized and you cannot delete it, how do you remove objectionable content?” We would answer that the client app (and any of our official nodes) will filter it once reported (and we have an admin ability to push filters). It’s a grey area but many web3 apps have faced this. Since we’re documenting an internal plan, we acknowledge this difficulty and plan to manage it at the client level.
6.3 Compliance Recap
To ensure we clearly cover each point of Apple’s UGC rules
developer.apple.com
:
Filtering: Our approach is manual filtering via moderation after the fact (and possibly some client word filters). No open slurs or porn will be allowed on the official app – if found, we add it to the block list so it’s filtered.
Reporting: Provided via UI, sending to a moderation team.
Blocking: Implemented in-app as described (user can block others, preventing content and contact).
Contact Info: We will include a visible contact (like “Contact us at support@glyffiti.com” in settings or App Store metadata). Also, Terms of Service and community guidelines can be provided to users (Apple often wants to see that too in an app with UGC). We should prepare a simple ToS stating users own their data, can’t post illegal stuff, etc.
By incorporating these, the app should be eligible for App Store. It’s important we note that timely response means if someone reports content, we actually act. So in practice, the devs need to monitor reports channel and update the app’s filter lists as needed. This is an operational aspect outside of code, but worth mentioning.
Conclusion and Next Steps

In this document, we detailed the design for Glyffiti’s account creation and content posting system, covering both on-chain and in-app components, with careful consideration for privacy, security, and App Store compliance. To summarize the implementation plan:
Blockchain Setup: Deploy the Glyffiti smart contract (on Solana for now) that handles user registration and posting. Establish the global genesis (likely the contract initialization or a known constant).
Account Creation: Users generate an Ed25519 keypair in-app (their decentralized identity). The app then sends a CreateUser transaction to register this identity on-chain, linking it to the global genesis. The user’s profile (public key, optional username, etc.) is stored on-chain in a UserProfile account
irjmets.com
. This serves as the user’s genesis block in the social graph.
Content Posting: Users can create posts which are recorded as events or records on-chain. Each post references the user’s previous post, forming an immutable chain per user
ssbc.github.io
. Posts can include text or media references, and can be marked public or encrypted for specific recipients. The blockchain ensures authenticity (via signatures) and order. Large media content is stored off-chain (e.g., IPFS) with hashes on-chain for integrity.
Encryption Framework: All private communications are end-to-end encrypted. Public posts are by default plaintext (with signatures). The system allows encrypting posts so only authorized users can read them
irjmets.com
. In practice, direct messages are encrypted with the recipient’s key, and future expansions could encrypt friend-circle posts with shared keys. We maintain flexibility to incorporate encryption-based access control as needed.
User Blocking & Moderation: The app includes critical social features like blocking, reporting, and content filtering to meet safety requirements
developer.apple.com
. Blocking is implemented by hiding blocked users’ content and preventing interactions. Reports are sent to a moderation service which can then propagate content bans via app updates or on-chain flags. The app will filter out any globally banned content to keep the experience safe. We ensure that users can control their experience (e.g., block abusive users, who then cannot reach them) and that we as developers can react to misuse of the platform in line with legal and platform policies.
Scalability and Future: The design is made to be extensible. While we start on Solana (for performance
irjmets.com
), the concepts would allow integrating other chains (e.g., Ethereum or custom chains) by writing similar contracts on those platforms. The “intention to expand” is kept in mind by abstracting chain-specific details in the code (perhaps using a thin layer so an LLM or developer could swap out Solana-specific calls with Ethereum web3 calls in future). Additionally, features like categories or a richer social graph (follows, likes, etc.) can be layered on by utilizing the existing framework of on-chain events and linking structures.
Development Strategy: We will implement the on-chain logic and a basic script first (for testing). For example, using the Solana CLI/SDK to simulate creating a few user accounts and posts on a devnet, ensuring the contract logic works. Then we integrate it into the mobile app. The iOS app will use the Solana SDK to create and sign transactions. We will thoroughly test account creation flows, including edge cases like duplicate registration, lost connection, etc., and posting flows (including encryption correctness – making sure only intended recipients can decrypt). The script and tests will also cover reading back the posts from chain to verify the linking and content integrity.
LLM Guidance: This detailed specification can guide an LLM-based code generator (or a developer) to implement the system. It provides the exact steps and structures needed – from generating keys in the app, to calling specific on-chain instructions, to handling the encryption, to managing local state and UI updates. For instance, an LLM could be prompted to “write a Solana Anchor program for the described user registration and posting logic” using the above details, and “generate Swift code to create a new keypair and call the program’s endpoint from an iOS app”. The scaffolding is explicitly laid out for both sides.
In conclusion, by following this plan, we will create a decentralized social networking backbone where users have control of their identity (via blockchain keys), content is secured and owned by the users (no central server deletion or control), and yet the user experience remains familiar (with features like blocking and reporting to maintain a civil environment). Glyffiti will start as a Solana-based platform but is architected to grow into a broader, chain-agnostic social graph. We have balanced the openness of decentralization with the practical requirements of platform policies and user safety, aiming to deliver a cutting-edge Web3 social app that can pass App Store review and provide a safe, user-friendly experience. Through this architecture, Glyffiti will realize a “really big graph” of content and connections – essentially a social network on blockchain – with each user’s journey beginning at the moment they create that first account block linked to the genesis, and from there writing their story onto an immutable, interconnected ledger. The next steps would be coding according to this spec, testing each component (account creation, posting, reading, encryption, blocking), and iterating on any issues discovered. By following the outlined approach, an LLM or engineering team has a clear blueprint to implement Glyffiti’s core functionality from end to end. References:
Bitcoin-like architecture for social data (DeSo example): “Its architecture is similar to Bitcoin, but with a larger scale and throughput, and can better support complex social media data, such as posts, user profiles... And like Bitcoin, DeSo is completely open source.”
binance.com
Decentralized identity via blockchain address: “The blockchain provides a unique address for each registered account, which is used as the user's identity in this framework. Furthermore, user profiles are encrypted and stored on the blockchain...”
irjmets.com
Solana for fast, cost-efficient transactions: “Solana blockchain, which is known for its cost‑efficiency and fast transaction processing.”
irjmets.com
Append-only log of user feed with hash chaining: “Once a message is posted it cannot be modified. Each message (except the first one) references the ID of the previous message, allowing a chain to be constructed back to the first message in the feed.”
ssbc.github.io
Public-key crypto for accounts (no PII needed): “Blockchain-powered social networks use public-key cryptography to... allow users to set up accounts and use the platform without divulging personal identifiable information.”
medium.com
App Store UGC requirements (filter, report, block, contact): “Apps with user-generated content... must include: a method for filtering objectionable material..., a mechanism to report offensive content..., the ability to block abusive users..., [and] published contact information so users can reach you.”
developer.apple.com
Privacy of content via encryption on chain: “The post is stored on the blockchain and encrypted to ensure privacy and security. The post is associated with the user's identity and can be accessed by authorized users.”