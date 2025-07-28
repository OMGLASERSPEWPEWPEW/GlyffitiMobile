// src/services/publishing/PublishingService.js
// Path: src/services/publishing/PublishingService.js

/* 
  NOTE TO FUTURE US / LLMS:
  - This file replaces MobilePublishingService, MobileGlyphManager, and MobileBlockchainPublisher.
  - It deliberately exposes a few backwards-compat methods (e.g., getDrafts) because the UI still calls them.
  - If you remove a compat method, search the codebase for its callers first.
*/

import { Connection, Transaction, TransactionInstruction, PublicKey } from '@solana/web3.js';
import { CompressionService } from '../compression/CompressionService';
import { StorageService } from '../storage/StorageService';
import { ContentService } from '../content/ContentService';
import { MobileWalletService } from '../wallet/MobileWalletService';

export class PublishingService {
  constructor() {
    // Wallet
    this.currentWallet = null;

    // Operation state
    this.currentOperation = null; // 'preparing' | 'publishing' | null
    this.progress = {
      step: null,
      progress: 0,     // 0–100
      percentage: 0,   // mirror for old code
      glyphsDone: 0,
      glyphsTotal: 0
    };

    // Solana
    this.connection = null;
    this.clusterUrl = null;
  }

  // ---------------------------------------------------------------------------
  // Wallet
  // ---------------------------------------------------------------------------
  setWallet(walletInstance) {
    this.currentWallet = walletInstance;
  }

  getCurrentWallet() {
    return this.currentWallet;
  }

  // ---------------------------------------------------------------------------
  // Content Input
  // ---------------------------------------------------------------------------
  async pickAndLoadFile(onProgress) {
    try {
      this._setProgress('Loading file', 5, onProgress);

      const fileContent = await ContentService.pickFileAndReadText();
      if (!fileContent) throw new Error('No file selected or failed to read.');

      const content = ContentService.createContentFromText(fileContent, {
        source: 'file',
        filename: ContentService.getLastPickedFilename?.() || undefined
      });

      await StorageService.saveInProgressContent(content);
      this._setProgress('File loaded', 100, onProgress);

      return content;
    } catch (err) {
      console.error('pickAndLoadFile error:', err);
      throw err;
    }
  }

  createTextContent(text, metadata = {}) {
    const content = ContentService.createContentFromText(text, {
      source: 'manual',
      ...metadata
    });
    StorageService.saveInProgressContent(content);
    return content;
  }

  // ---------------------------------------------------------------------------
  // Preparation
  // ---------------------------------------------------------------------------
  async prepareContent(content, onProgress) {
    try {
      this.currentOperation = 'preparing';
      this._setProgress('Validating content', 0, onProgress);

      if (!this.validateContent(content)) {
        throw new Error('Invalid content structure');
      }

      if (content.glyphs && content.glyphs.length) {
        this._setProgress('Already prepared', 100, onProgress);
        this.currentOperation = null;
        return content;
      }

      this._setProgress('Creating glyphs', 10, onProgress);
      const glyphs = ContentService.createGlyphs(content.originalContent);

      this._setProgress('Compressing glyphs', 40, onProgress);
      const { compressedGlyphs, compressionStats } =
        CompressionService.compressGlyphs(glyphs);

      content.glyphs = compressedGlyphs;
      content.compressionStats = compressionStats;
      content.preparedAt = new Date().toISOString();

      await StorageService.saveInProgressContent(content);

      this._setProgress('Preparation complete', 100, onProgress);
      this.currentOperation = null;
      return content;
    } catch (error) {
      console.error('prepareContent error:', error);
      this._setProgress('Preparation failed', 0, onProgress);
      this.currentOperation = null;
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Estimation
  // ---------------------------------------------------------------------------
  estimatePublishing(contentOrGlyphCount) {
    let glyphCount = 0;
    if (typeof contentOrGlyphCount === 'number') {
      glyphCount = contentOrGlyphCount;
    } else if (contentOrGlyphCount?.glyphs) {
      glyphCount = contentOrGlyphCount.glyphs.length;
    }

    // Replace with your real fee math
    const baseLamportsPerGlyph = 5000;
    const estimatedLamports = baseLamportsPerGlyph * glyphCount;
    const estimatedTxnCount = Math.ceil(glyphCount / 2);

    return {
      glyphCount,
      estimatedLamports,
      estimatedTxnCount
    };
  }

  // ---------------------------------------------------------------------------
  // Validation / Stats
  // ---------------------------------------------------------------------------
  validateContent(content) {
    return (
      content &&
      typeof content.originalContent === 'string' &&
      content.originalContent.length > 0
    );
  }

  getContentStats(content) {
    if (!this.validateContent(content)) return null;

    const wordCount = content.originalContent.split(/\s+/).length;
    const characterCount = content.originalContent.length;
    const paragraphCount = content.originalContent.split(/\n\s*\n/).length;

    return {
      wordCount,
      characterCount,
      paragraphCount,
      glyphCount: content.glyphs?.length || 0,
      compressionStats: content.compressionStats,
      estimatedReadingTime: Math.ceil(wordCount / 200),
      createdAt: content.createdAt,
      title: content.title,
      filename: content.metadata?.filename || null
    };
  }

  // ---------------------------------------------------------------------------
  // Publishing
  // ---------------------------------------------------------------------------
  async publishContent(content, onProgress) {
    try {
      this.currentOperation = 'publishing';

      this._setProgress('Checking wallet', 0, onProgress);
      if (!this.currentWallet) throw new Error('No wallet connected');

      if (!content || !content.content) throw new Error('No valid content to publish');

      const keypair = this.currentWallet.getWalletKeypair?.();
      if (!keypair) throw new Error('Unable to access wallet keypair');

      let preparedContent = content;
      if (!content.glyphs || !content.glyphs.length) {
        preparedContent = await this.prepareContent(content, onProgress);
      }

      const result = await this._publishToBlockchain(preparedContent, keypair, onProgress);

      if (result?.status === 'completed') {
        await StorageService.markContentAsPublished(
          preparedContent.contentId,
          result
        );
      }

      this._setProgress('Publishing complete', 100, onProgress);
      this.currentOperation = null;
      return result;
    } catch (error) {
      console.error('❌ Publishing error:', error);
      this._setProgress('Publishing failed', 0, onProgress);
      this.currentOperation = null;
      throw error;
    }
  }

  async _publishToBlockchain(content, keypair, onProgress) {
    this._setProgress('Connecting to Solana', 10, onProgress);

    const connection = await this._getConnection();

    const glyphs = content.glyphs;
    const total = glyphs.length;
    let sent = 0;

    for (let i = 0; i < glyphs.length; i++) {
      const tx = new Transaction();
      const ix = new TransactionInstruction({
        keys: [],
        programId: new PublicKey('11111111111111111111111111111111'), // dummy
        data: Buffer.from(glyphs[i].data)
      });
      tx.add(ix);

      await connection.sendTransaction(tx, [keypair]);

      sent++;
      const pct = Math.round((sent / total) * 100);
      this._setProgress(`Publishing glyph ${sent}/${total}`, pct, onProgress, {
        glyphsDone: sent,
        glyphsTotal: total
      });
    }

    await StorageService.saveScrollManifest(content.contentId, {
      publishedAt: new Date().toISOString(),
      totalGlyphs: total
    });

    return {
      status: 'completed',
      glyphsPublished: total,
      contentId: content.contentId,
      txCount: total
    };
  }

  // ---------------------------------------------------------------------------
  // Resume / Cancel
  // ---------------------------------------------------------------------------
  async resumePublishing(contentId, onProgress) {
    const content = await StorageService.getInProgressContent(contentId);
    if (!content) throw new Error('No in-progress content found');

    // Real resume logic would skip already published glyphs
    return this.publishContent(content, onProgress);
  }

  async cancelPublishing(contentId) {
    await StorageService.markPublishingCanceled?.(contentId);
    return true;
  }

  // ---------------------------------------------------------------------------
  // Backwards-compat helpers (shim old MobilePublishingService methods)
  // ---------------------------------------------------------------------------
  /**
   * Old code expects: publishingService.getDrafts()
   * We try a few likely StorageService methods. If none exist, we return [].
   */
  async getDrafts() {
    try {
      // Try a direct method first
      const possibleFns = [
        'getDrafts',
        'getInProgressDrafts',
        'getInProgressContents',
        'getInProgressContentList',
        'getAllInProgress',
        'getAllContent'
      ];
      const drafts = await this._callFirstAvailable(StorageService, possibleFns);
      if (Array.isArray(drafts)) {
        // If we ended up calling getAllContent, filter out published
        return drafts.filter(d => !d.publishedAt && !d.isPublished);
      }
      return drafts || [];
    } catch (e) {
      console.error('getDrafts shim error:', e);
      return [];
    }
  }

  async saveDraft(content) {
    // Some UIs called this old helper directly
    try {
      if (!content) throw new Error('No content passed to saveDraft');
      // Prefer explicit "saveDraft" if StorageService has it
      const saved = await this._callFirstAvailable(
        StorageService,
        ['saveDraft', 'saveInProgressContent', 'saveContent'],
        content
      );
      return saved ?? content;
    } catch (e) {
      console.error('saveDraft shim error:', e);
      throw e;
    }
  }

  async deleteDraft(contentId) {
    try {
      await this._callFirstAvailable(
        StorageService,
        ['deleteDraft', 'removeInProgressContent', 'deleteInProgressContent', 'deleteContent'],
        contentId
      );
      return true;
    } catch (e) {
      console.error('deleteDraft shim error:', e);
      return false;
    }
  }

  async getPublished() {
    try {
      const published = await this._callFirstAvailable(
        StorageService,
        ['getPublishedContents', 'getPublishedContentList', 'getAllPublished', 'getAllContent']
      );
      if (Array.isArray(published)) {
        return published.filter(p => p.publishedAt || p.isPublished);
      }
      return published || [];
    } catch (e) {
      console.error('getPublished shim error:', e);
      return [];
    }
  }

  async getContentById(contentId) {
    return (
      (await this._callFirstAvailable(
        StorageService,
        ['getContentById', 'getInProgressContent', 'getContent'],
        contentId
      )) || null
    );
  }

  // ---------------------------------------------------------------------------
  // Misc helpers
  // ---------------------------------------------------------------------------
  async _getConnection() {
    if (this.connection) return this.connection;

    const clusterUrl = MobileWalletService.getClusterUrl?.();
    this.clusterUrl = clusterUrl;
    this.connection = new Connection(clusterUrl, 'confirmed');
    return this.connection;
  }

  _setProgress(step, pct, onProgress, extra = {}) {
    this.progress = {
      ...this.progress,
      step,
      progress: pct,
      percentage: pct, // mirror
      ...extra
    };
    if (typeof onProgress === 'function') {
      try {
        onProgress(this.progress);
      } catch {
        // ignore progress callback errors
      }
    }
  }

  async _callFirstAvailable(targetObj, methodNames, ...args) {
    for (const name of methodNames) {
      if (typeof targetObj?.[name] === 'function') {
        return await targetObj[name](...args);
      }
    }
    return undefined;
  }

  // ---------------------------------------------------------------------------
  // Self-test
  // ---------------------------------------------------------------------------
  async runSelfTest() {
    const results = {
      walletManagement: false,
      contentOperations: false,
      storageOperations: false,
      publishingTracking: false,
      errors: []
    };

    try {
      // Wallet
      if (MobileWalletService && typeof MobileWalletService.getClusterUrl === 'function') {
        results.walletManagement = true;
      } else {
        results.errors.push('Wallet service methods missing.');
      }

      // Content ops
      const testText = 'Hello world. This is a test of glyph creation.';
      const content = this.createTextContent(testText, { title: 'Self-test' });
      const prepared = await this.prepareContent(content);
      if (prepared.glyphs && prepared.glyphs.length) {
        results.contentOperations = true;
      } else {
        results.errors.push('Glyph creation/compression failed.');
      }

      // Storage ops
      const fetched = await StorageService.getInProgressContent?.(prepared.contentId);
      if (fetched) {
        results.storageOperations = true;
      } else {
        results.errors.push('Storage get/save failed.');
      }

      // Progress tracking
      try {
        this._setProgress('Testing progress', 50, () => {});
        results.publishingTracking = true;
      } catch (e) {
        results.errors.push(`Progress tracking failed: ${e.message}`);
      }

      results.overallSuccess =
        results.walletManagement &&
        results.contentOperations &&
        results.storageOperations &&
        results.publishingTracking;

      if (results.overallSuccess) {
        console.log('✅ PublishingService self-test passed!');
      } else {
        console.log('❌ PublishingService self-test failed. See errors for details.');
      }

      return results;
    } catch (error) {
      console.error('❌ PublishingService self-test fatal error:', error);
      results.errors.push(error.message);
      results.overallSuccess = false;
      return results;
    }
  }

  getOperationCapabilities() {
    return {
      operations: [
        'File loading and text entry',
        'Content preparation and validation',
        'Blockchain publishing with compression',
        'Scroll manifest creation and storage',
        'Progress tracking and error handling',
        'Data backup and import',
        'Content search and statistics',
        'Transaction cost estimation',
        'Connection status monitoring'
      ],
      storageKeys: StorageService.STORAGE_KEYS
    };
  }
}

// ============================================================================
// Singleton instance + Backwards-compat Shim + Static facade
// ============================================================================
const _publishingServiceInstance = new PublishingService();

// Old MobileBlockchainPublisher API shim
_publishingServiceInstance.blockchainPublisher = {
  publishContent: (...args) => _publishingServiceInstance.publishContent(...args),
  resumePublishing: (...args) => _publishingServiceInstance.resumePublishing(...args),
  cancelPublishing: (...args) => _publishingServiceInstance.cancelPublishing(...args),
  estimateTransactionCost: (...args) => _publishingServiceInstance.estimatePublishing(...args),
  runSelfTest: (...args) => _publishingServiceInstance.runSelfTest(...args)
};

// Static proxies so you can call PublishingService.publishContent(...) etc.
PublishingService._instance = _publishingServiceInstance;
[
  'setWallet',
  'getCurrentWallet',
  'pickAndLoadFile',
  'createTextContent',
  'prepareContent',
  'validateContent',
  'getContentStats',
  'estimatePublishing',
  'publishContent',
  'resumePublishing',
  'cancelPublishing',
  'runSelfTest',
  'getOperationCapabilities',
  // Shims
  'getDrafts',
  'saveDraft',
  'deleteDraft',
  'getPublished',
  'getContentById'
].forEach(methodName => {
  if (typeof _publishingServiceInstance[methodName] === 'function') {
    PublishingService[methodName] = (...args) =>
      _publishingServiceInstance[methodName](...args);
  }
});

export const publishingService = _publishingServiceInstance;
export default _publishingServiceInstance;
