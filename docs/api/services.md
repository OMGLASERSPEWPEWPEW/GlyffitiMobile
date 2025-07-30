# GlyffitiMobile Service API Documentation

**File:** `docs/api/services.md`  
**Path:** `docs/api/services.md`

This document provides a comprehensive reference for all service APIs in the GlyffitiMobile application. These services handle content processing, storage, compression, and blockchain publishing for the multi-format content platform.

## Table of Contents

- [Storage Services](#storage-services)
  - [StorageService](#storageservice)
- [Content Services](#content-services)
  - [ContentService](#contentservice)
  - [CompressionService](#compressionservice)
- [Glyph Services](#glyph-services)
  - [GlyphService](#glyphservice)
  - [GlyphValidator](#glyphvalidator)
- [Blockchain Services](#blockchain-services)
  - [SolanaPublisher](#solanapublisher)
- [Utility Services](#utility-services)
  - [HashingService](#hashingservice)
  - [TextProcessor](#textprocessor)

---

## Storage Services

### StorageService

**Path:** `src/services/storage/StorageService.js`

Main storage facade that coordinates between specialized storage services. Provides unified interface for all storage operations.

#### Constants

```javascript
StorageService.STORAGE_KEYS = {
  IN_PROGRESS: 'glyffiti_in_progress',
  PUBLISHED: 'glyffiti_published',
  SCROLLS: 'glyffiti_scrolls'
}
```

#### In-Progress Content Methods

```javascript
// Save in-progress content with duplicate prevention
StorageService.saveInProgressContent(content: Object): Promise<boolean>

// Update in-progress content
StorageService.updateInProgressContent(
  contentId: string,
  glyphs: Array,
  successfulGlyphs: number,
  failedGlyphs: number
): Promise<boolean>

// Get all in-progress content as object
StorageService.getInProgressContent(): Promise<Object>

// Get in-progress content as array
StorageService.getInProgressContentArray(): Promise<Array>

// Remove specific in-progress content
StorageService.removeInProgressContent(contentId: string): Promise<boolean>
```

#### Published Content Methods

```javascript
// Save published content
StorageService.savePublishedContent(content: Object): Promise<boolean>

// Get all published content
StorageService.getPublishedContent(): Promise<Object>

// Get published content as array
StorageService.getPublishedContentArray(): Promise<Array>

// Delete specific published content
StorageService.deletePublishedContent(contentId: string): Promise<boolean>

// Get published content by ID
StorageService.getPublishedContentById(contentId: string): Promise<Object|null>
```

#### Scroll Methods

```javascript
// Create scroll from published content
StorageService.createScrollFromPublishedContent(content: Object): Promise<Object>

// Save scroll locally
StorageService.saveScrollLocally(manifest: Object): Promise<boolean>

// Get all scrolls
StorageService.getAllScrolls(): Promise<Object>

// Get scrolls as array
StorageService.getScrollsArray(): Promise<Array>

// Get scroll by story ID
StorageService.getScrollByStoryId(storyId: string): Promise<Object|null>

// Delete scroll
StorageService.deleteScroll(storyId: string): Promise<boolean>
```

#### Management Methods

```javascript
// Clear all storage
StorageService.clearAllStorage(): Promise<Object>

// Get storage overview
StorageService.getStorageOverview(): Promise<Object>

// Export all data
StorageService.exportAllData(): Promise<Object>

// Import data
StorageService.importData(importData: Object): Promise<Object>

// Run self-test
StorageService.runSelfTest(): Promise<boolean>
```

---

## Content Services

### ContentService

**Path:** `src/services/content/ContentService.js`

Handles content loading, processing, and preparation for publishing.

#### Content Creation Methods

```javascript
// Create content from text
ContentService.createTextContent(text: string, title?: string): Object

// Load content from file
ContentService.loadFromFile(fileUri: string): Promise<Object>

// Load content from document
ContentService.loadFromDocument(documentResult: Object): Promise<Object>
```

#### Content Processing Methods

```javascript
// Prepare content for publishing
ContentService.prepareContent(
  content: string,
  title: string,
  authorPublicKey: string
): Promise<Object>

// Validate prepared content
ContentService.validateContent(content: Object): boolean

// Get content statistics
ContentService.getContentStats(content: Object): Object

// Estimate publishing requirements
ContentService.estimatePublishing(content: string): Object
```

#### File Processing Methods

```javascript
// Process PDF file
ContentService.processPDF(arrayBuffer: ArrayBuffer): Promise<string>

// Process Word document
ContentService.processWordDocument(arrayBuffer: ArrayBuffer): Promise<string>

// Process RTF document
ContentService.processRTF(text: string): string

// Clean text content
ContentService.cleanText(text: string): string
```

#### Utility Methods

```javascript
// Run self-test
ContentService.runSelfTest(): Promise<boolean>

// Get service information
ContentService.getServiceInfo(): Object
```

---

### CompressionService

**Path:** `src/services/compression/CompressionService.js`

Provides text compression and decompression using the pako library.

#### Core Compression Methods

```javascript
// Compress text to Uint8Array
CompressionService.compress(text: string): Uint8Array

// Decompress Uint8Array to text
CompressionService.decompress(compressedData: Uint8Array): string

// Compress text to Base64 string
CompressionService.compressToBase64(text: string): string

// Decompress from Base64 string
CompressionService.decompressFromBase64(base64String: string): string
```

#### Utility Methods

```javascript
// Get compression statistics
CompressionService.getCompressionStats(text: string): Object

// Estimate compressed size
CompressionService.estimateCompressedSize(text: string): number

// Convert between formats
CompressionService.uint8ArrayToBase64(uint8Array: Uint8Array): string
CompressionService.base64ToUint8Array(base64String: string): Uint8Array
```

#### Batch Processing Methods

```javascript
// Compress multiple text chunks
CompressionService.compressChunks(textChunks: Array<string>): Array<Uint8Array>

// Decompress multiple chunks
CompressionService.decompressChunks(compressedChunks: Array<Uint8Array>): Array<string>
```

#### Testing Methods

```javascript
// Run self-test with sample data
CompressionService.runSelfTest(): boolean
```

---

## Glyph Services

### GlyphService

**Path:** `src/services/glyph/GlyphService.js`

Handles conversion of content into blockchain-storable chunks (glyphs) with compression and integrity checking.

#### Configuration

```javascript
// Configure for specific blockchain
GlyphService.configure(blockchain: string): void

// Available configurations
GlyphService.config = {
  maxMemoSize: number,      // Maximum size for memo field
  maxCompressedSize: number, // Maximum size after compression
  targetChunkSize: number,   // Target size for text chunks
  networkName: string       // Network name
}
```

#### Content Processing Methods

```javascript
// Convert content to glyph chunks
GlyphService.createGlyphs(content: GlyphContent): Promise<GlyphChunk[]>

// Pre-process text for optimal chunking
GlyphService.preprocessText(text: string): string

// Clean dialog breaks and formatting
GlyphService.cleanDialogBreaks(text: string): string

// Estimate chunk count
GlyphService.estimateChunkCount(content: string): number
```

#### Content Assembly Methods

```javascript
// Reassemble content from chunks
GlyphService.reassembleContent(chunks: GlyphChunk[]): Promise<string>

// Decode blockchain glyph
GlyphService.decodeGlyphFromBlockchain(base64Data: string): string

// Clean reassembled text
GlyphService.cleanupReassembledText(text: string): string
```

#### Cost Estimation Methods

```javascript
// Calculate storage cost estimate
GlyphService.estimateStorageCost(content: string): Object
```

#### Validation Methods

```javascript
// Verify glyph integrity
GlyphService.verifyGlyphIntegrity(glyph: GlyphChunk): Promise<boolean>

// Verify scroll integrity
GlyphService.verifyScrollIntegrity(glyphs: GlyphChunk[]): Promise<boolean>

// Create chunking preview
GlyphService.createChunkingPreview(content: string): Object
```

#### Testing Methods

```javascript
// Run comprehensive self-test
GlyphService.runSelfTest(): Promise<boolean>
```

---

### GlyphValidator

**Path:** `src/services/glyph/validation/GlyphValidator.js`

Specialized validation service for glyph integrity and content verification.

#### Validation Methods

```javascript
// Verify single glyph integrity
GlyphValidator.verifyGlyphIntegrity(glyph: GlyphChunk): Promise<boolean>

// Verify complete scroll integrity
GlyphValidator.verifyScrollIntegrity(glyphs: GlyphChunk[]): Promise<boolean>

// Create content chunking preview
GlyphValidator.createChunkingPreview(content: string, config: BlockchainConfig): Object
```

#### Testing Methods

```javascript
// Run validation self-test
GlyphValidator.runSelfTest(config: BlockchainConfig): Promise<boolean>
```

---

## Blockchain Services

### SolanaPublisher

**Path:** `src/services/blockchain/solana/SolanaPublisher.js`

Handles Solana-specific blockchain publishing operations.

#### Configuration

```javascript
// Constructor creates connection to Solana devnet
new SolanaPublisher()
```

#### Publishing Methods

```javascript
// Publish content to Solana blockchain
SolanaPublisher.publishContent(
  content: Object,
  keypair: Object,
  onProgress?: Function
): Promise<Object>

// Get publishing status
SolanaPublisher.getPublishingStatus(contentId: string): Object

// Cancel active publishing
SolanaPublisher.cancelPublishing(contentId: string): Promise<boolean>
```

#### Progress Tracking

```javascript
// Progress callback receives status object:
{
  contentId: string,
  stage: string,
  progress: number,
  currentGlyph: number,
  totalGlyphs: number,
  successfulGlyphs: number,
  failedGlyphs: number,
  transactionIds: Array<string>,
  compressionStats: Object,
  error: string|null
}
```

---

## Utility Services

### HashingService

**Path:** `src/services/hashing/HashingService.js`

Provides content hashing for integrity verification.

#### Hashing Methods

```javascript
// Hash content for integrity verification
HashingService.hashContent(content: Uint8Array): Promise<string>
```

### TextProcessor

**Path:** `src/services/glyph/processing/TextProcessor.js`

Specialized text processing for optimal blockchain storage.

#### Processing Methods

```javascript
// Pre-process text for chunking
TextProcessor.preprocessText(text: string): string

// Clean dialog breaks
TextProcessor.cleanDialogBreaks(text: string): string

// Clean reassembled text
TextProcessor.cleanupReassembledText(text: string): string

// Estimate chunk count
TextProcessor.estimateChunkCount(content: string, chunkSize: number): number
```

---

## Type Definitions

### GlyphChunk

```typescript
interface GlyphChunk {
  index: number;           // Position in sequence
  totalChunks: number;     // Total number of chunks
  content: Uint8Array;     // Compressed content data
  hash: string;            // Content hash for verification
  originalText?: string;   // Original text before compression
}
```

### GlyphContent

```typescript
interface GlyphContent {
  id: string;              // Unique content identifier
  title: string;           // Content title
  content: string;         // Text content
  authorPublicKey: string; // Author's public key
  timestamp: number;       // Creation timestamp
  chunks?: GlyphChunk[];   // Generated chunks
}
```

### BlockchainConfig

```typescript
interface BlockchainConfig {
  maxMemoSize: number;        // Maximum size in bytes for memo field
  maxCompressedSize: number;  // Maximum size after compression
  targetChunkSize: number;    // Target size for text chunks before compression
  networkName: string;       // Network name (e.g., "solana", "bitcoin")
}
```

---

## Error Handling

All service methods follow consistent error handling patterns:

- **Synchronous methods**: Throw Error objects with descriptive messages
- **Asynchronous methods**: Return rejected Promises with Error objects
- **Boolean methods**: Return `false` on failure, log errors to console
- **Object methods**: Return error objects with `error` property when applicable

### Common Error Types

```javascript
// Storage errors
"Content not found"
"Storage operation failed"
"Invalid content format"

// Compression errors
"Compression failed"
"Decompression failed"
"Invalid compressed data"

// Glyph errors
"Missing chunk at index X"
"Invalid hash for chunk X"
"Failed to reassemble content"

// Blockchain errors
"No wallet keypair provided"
"Transaction failed"
"Insufficient funds"
```

---

## Performance Considerations

### Async Operations
- All file operations are asynchronous
- Storage operations use AsyncStorage (persistent)
- Blockchain operations include progress callbacks
- Large content processing is chunked

### Memory Management
- Large files are processed in chunks
- Compression reduces memory footprint
- Content is cleaned up after processing
- Services include self-test methods for verification

### Caching Strategy
- Published content is cached locally
- In-progress content persists across app restarts
- Scrolls are stored for offline access
- Compression statistics are cached

---

## Service Dependencies

```
StorageService
├── InProgressStorage
├── PublishedStorage
└── ScrollStorage

ContentService
├── CompressionService
└── File System APIs

GlyphService
├── CompressionService
├── HashingService
├── TextProcessor
├── ChunkManager
├── ContentAssembler
└── GlyphValidator

SolanaPublisher
├── StorageService
├── CompressionService
└── Solana Web3.js
```

---

## Testing

All services include self-test methods:

```javascript
// Run all service tests
const results = await Promise.all([
  StorageService.runSelfTest(),
  ContentService.runSelfTest(),
  CompressionService.runSelfTest(),
  GlyphService.runSelfTest()
]);

console.log('All tests passed:', results.every(result => result === true));
```

---

## Version Information

- **API Version**: 1.0.0
- **Last Updated**: 2025-07-29
- **Compatibility**: React Native 0.79.5, Expo 53

---

*This documentation is automatically maintained. For implementation details, see the individual service files in the codebase.*

**Character count: 11,248**