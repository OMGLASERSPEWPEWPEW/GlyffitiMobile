// src/services/publishing/__tests__/PublishingService.test.js
// Path: src/services/publishing/__tests__/PublishingService.test.js

/**
 * PublishingService Tests
 * 
 * Tests the core publishing workflow - the heart of your app!
 * This ensures content can be properly processed, prepared, and published to blockchain
 * 
 * Test Coverage:
 * - Wallet management and integration
 * - Content creation and preparation  
 * - Publishing workflow orchestration
 * - Error handling and edge cases
 * - Storage integration
 * - Progress tracking
 */

import { PublishingService } from '../PublishingService';
import { ContentService } from '../../content/ContentService';
import { BlockchainService } from '../../blockchain/BlockchainService';
import { StorageService } from '../../storage/StorageService';

// Mock all the dependencies
jest.mock('../../content/ContentService');
jest.mock('../../blockchain/BlockchainService');
jest.mock('../../storage/StorageService');

describe('PublishingService', () => {
  let publishingService;
  let mockWallet;
  let mockKeypair;

  // Setup before each test
  beforeEach(() => {
    // Create fresh service instance
    publishingService = new PublishingService();
    
    // Create mock wallet
    mockWallet = {
      getWalletPublicKey: jest.fn(() => 'mock_public_key_12345678'),
      getWalletKeypair: jest.fn(() => mockKeypair),
      isConnected: jest.fn(() => true)
    };
    
    // Create mock keypair
    mockKeypair = {
      publicKey: 'mock_public_key_12345678',
      secretKey: 'mock_secret_key'
    };

    // Clear all mocks
    jest.clearAllMocks();
  });

  // Test suite for Wallet Management
  describe('Wallet Management', () => {
    
    it('should set and get wallet correctly', () => {
      // Act
      publishingService.setWallet(mockWallet);
      const retrievedWallet = publishingService.getCurrentWallet();

      // Assert
      expect(retrievedWallet).toBe(mockWallet);
    });

    it('should return null when no wallet is set', () => {
      // Act
      const wallet = publishingService.getCurrentWallet();

      // Assert
      expect(wallet).toBeNull();
    });

    it('should update wallet when called multiple times', () => {
      // Arrange
      const secondMockWallet = { getWalletPublicKey: () => 'different_key' };

      // Act
      publishingService.setWallet(mockWallet);
      publishingService.setWallet(secondMockWallet);
      const finalWallet = publishingService.getCurrentWallet();

      // Assert
      expect(finalWallet).toBe(secondMockWallet);
      expect(finalWallet).not.toBe(mockWallet);
    });

  });

  // Test suite for Content Creation
  describe('Content Creation', () => {
    
    it('should create text content using ContentService', () => {
      // Arrange
      const mockTextContent = {
        content: 'Test content for publishing',
        filename: 'Test Story.txt',
        size: 26,
        type: 'text/plain'
      };
      ContentService.createTextContent.mockReturnValue(mockTextContent);

      // Act
      const result = publishingService.createTextContent('Test content for publishing', 'Test Story');

      // Assert
      expect(ContentService.createTextContent).toHaveBeenCalledWith('Test content for publishing', 'Test Story');
      expect(result).toEqual(mockTextContent);
    });

    it('should handle file picking and loading', async () => {
      // Arrange
      publishingService.setWallet(mockWallet);
      const mockFileContent = {
        content: 'File content from picker',
        filename: 'picked-file.txt',
        size: 24,
        type: 'text/plain'
      };
      ContentService.pickAndLoadFile.mockResolvedValue(mockFileContent);

      // Act
      const result = await publishingService.pickAndLoadFile();

      // Assert
      expect(ContentService.pickAndLoadFile).toHaveBeenCalled();
      expect(result).toHaveProperty('content', 'File content from picker');
      expect(result).toHaveProperty('title', 'picked-file'); // Should remove extension
      expect(result).toHaveProperty('authorPublicKey', 'mock_public_key_12345678');
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('createdAt');
    });

    it('should return null when file picking fails', async () => {
      // Arrange
      ContentService.pickAndLoadFile.mockResolvedValue(null);

      // Act
      const result = await publishingService.pickAndLoadFile();

      // Assert
      expect(result).toBeNull();
    });

    it('should handle file picking without wallet', async () => {
      // Arrange - No wallet set
      const mockFileContent = {
        content: 'Content without wallet',
        filename: 'test.txt',
        size: 20,
        type: 'text/plain'
      };
      ContentService.pickAndLoadFile.mockResolvedValue(mockFileContent);

      // Act
      const result = await publishingService.pickAndLoadFile();

      // Assert
      expect(result).toHaveProperty('authorPublicKey', 'unknown');
    });

  });

  // Test suite for Content Preparation
  describe('Content Preparation', () => {
    
    beforeEach(() => {
      publishingService.setWallet(mockWallet);
    });

    it('should prepare content for publishing', async () => {
      // Arrange
      const contentData = {
        content: 'Story content to prepare for blockchain publishing',
        filename: 'story.txt',
        size: 50,
        type: 'text/plain'
      };
      
      const mockPreparedContent = {
        contentId: 'prepared_content_123',
        title: 'Test Story',
        originalContent: contentData.content,
        glyphs: [
          { index: 0, content: 'compressed_chunk_1', hash: 'hash_1' },
          { index: 1, content: 'compressed_chunk_2', hash: 'hash_2' }
        ],
        authorPublicKey: 'mock_public_key_12345678',
        createdAt: expect.any(Number)
      };

      ContentService.prepareContent.mockResolvedValue(mockPreparedContent);

      // Act
      const result = await publishingService.prepareContent(contentData, 'Test Story');

      // Assert
      expect(ContentService.prepareContent).toHaveBeenCalledWith(
        contentData,
        'Test Story',
        'mock_public_key_12345678',
        expect.any(Object)
      );
      expect(result).toEqual(mockPreparedContent);
    });

    it('should throw error when preparing content without wallet', async () => {
      // Arrange
      publishingService.setWallet(null); // Remove wallet
      const contentData = { content: 'test content' };

      // Act & Assert
      await expect(publishingService.prepareContent(contentData, 'Test')).rejects.toThrow('No wallet connected');
    });

    it('should throw error when preparing invalid content', async () => {
      // Arrange - Test what PublishingService should validate before calling ContentService
      
      // Test 1: null contentData should fail immediately
      await expect(publishingService.prepareContent(null, 'Test')).rejects.toThrow();
      
      // Test 2: empty object should fail 
      await expect(publishingService.prepareContent({}, 'Test')).rejects.toThrow();
      
      // Test 3: object without content should fail
      await expect(publishingService.prepareContent({ filename: 'test.txt' }, 'Test')).rejects.toThrow();
    });

  });

  // Test suite for Publishing Operations
  describe('Publishing Operations', () => {
    
    beforeEach(() => {
      publishingService.setWallet(mockWallet);
    });

    it('should publish already prepared content', async () => {
      // Arrange
      const preparedContent = {
        contentId: 'content_123',
        title: 'Test Story',
        content: 'Story content',
        glyphs: [
          { index: 0, content: 'chunk_1', hash: 'hash_1' },
          { index: 1, content: 'chunk_2', hash: 'hash_2' }
        ],
        authorPublicKey: 'mock_public_key_12345678'
      };

      const mockPublishResult = {
        success: true,
        contentId: 'content_123',
        transactionIds: ['tx_1', 'tx_2'],
        totalGlyphs: 2,
        publishedGlyphs: 2
      };

      BlockchainService.prototype.publishContent.mockResolvedValue(mockPublishResult);

      const mockProgressCallback = jest.fn();

      // Act
      const result = await publishingService.publishContent(preparedContent, mockProgressCallback);

      // Assert
      expect(BlockchainService.prototype.publishContent).toHaveBeenCalledWith(
        preparedContent,
        mockKeypair,
        mockProgressCallback
      );
      expect(result).toEqual(mockPublishResult);
    });

    it('should prepare and publish unprepared content', async () => {
      // Arrange
      const rawContent = {
        title: 'Raw Story',
        content: 'This content needs to be prepared first',
        filename: 'raw.txt'
      };

      const mockPreparedContent = {
        contentId: 'prepared_456',
        title: 'Raw Story',
        content: rawContent.content,
        glyphs: [{ index: 0, content: 'chunk', hash: 'hash' }],
        authorPublicKey: 'mock_public_key_12345678'
      };

      const mockPublishResult = {
        success: true,
        contentId: 'prepared_456',
        transactionIds: ['tx_1']
      };

      // Mock the preparation and publishing
      ContentService.prepareContent.mockResolvedValue(mockPreparedContent);
      BlockchainService.prototype.publishContent.mockResolvedValue(mockPublishResult);

      // Act
      const result = await publishingService.publishContent(rawContent);

      // Assert
      expect(ContentService.prepareContent).toHaveBeenCalled();
      expect(BlockchainService.prototype.publishContent).toHaveBeenCalledWith(
        mockPreparedContent,
        mockKeypair,
        null
      );
      expect(result).toEqual(mockPublishResult);
    });

    it('should throw error when publishing without wallet', async () => {
      // Arrange
      publishingService.setWallet(null);
      const content = { title: 'Test', content: 'test content' };

      // Act & Assert
      await expect(publishingService.publishContent(content)).rejects.toThrow('No wallet connected');
    });

    it('should throw error when publishing invalid content', async () => {
      // Act & Assert
      await expect(publishingService.publishContent(null)).rejects.toThrow('No valid content to publish');
      await expect(publishingService.publishContent({})).rejects.toThrow('No valid content to publish');
    });

    it('should throw error when wallet has no keypair', async () => {
      // Arrange
      mockWallet.getWalletKeypair.mockReturnValue(null);
      const content = { title: 'Test', content: 'test content' };

      // Act & Assert
      await expect(publishingService.publishContent(content)).rejects.toThrow('Unable to access wallet keypair');
    });

  });

  // Test suite for Publishing Status Management
  describe('Publishing Status Management', () => {
    
    beforeEach(() => {
      publishingService.setWallet(mockWallet);
    });

    it('should get publishing status', () => {
      // Arrange
      const mockStatus = {
        contentId: 'content_123',
        stage: 'publishing',
        progress: 50,
        currentGlyph: 1,
        totalGlyphs: 2
      };
      BlockchainService.prototype.getPublishingStatus.mockReturnValue(mockStatus);

      // Act
      const status = publishingService.getPublishingStatus('content_123');

      // Assert
      expect(BlockchainService.prototype.getPublishingStatus).toHaveBeenCalledWith('content_123');
      expect(status).toEqual(mockStatus);
    });

    it('should resume publishing', async () => {
      // Arrange
      const mockResumeResult = {
        success: true,
        contentId: 'content_123',
        resumedFromGlyph: 3
      };
      BlockchainService.prototype.resumePublishing.mockResolvedValue(mockResumeResult);

      const mockProgressCallback = jest.fn();

      // Act
      const result = await publishingService.resumePublishing('content_123', mockProgressCallback);

      // Assert
      expect(BlockchainService.prototype.resumePublishing).toHaveBeenCalledWith(
        'content_123',
        mockKeypair,
        mockProgressCallback
      );
      expect(result).toEqual(mockResumeResult);
    });

    it('should cancel publishing', async () => {
      // Arrange
      BlockchainService.prototype.cancelPublishing.mockResolvedValue(true);

      // Act
      const result = await publishingService.cancelPublishing('content_123');

      // Assert
      expect(BlockchainService.prototype.cancelPublishing).toHaveBeenCalledWith('content_123');
      expect(result).toBe(true);
    });

    it('should get active publishing operations', () => {
      // Arrange
      const mockActiveOperations = [
        { contentId: 'content_1', stage: 'preparing' },
        { contentId: 'content_2', stage: 'publishing' }
      ];
      BlockchainService.prototype.getActivePublishing.mockReturnValue(mockActiveOperations);

      // Act
      const activeOps = publishingService.getActivePublishing();

      // Assert
      expect(BlockchainService.prototype.getActivePublishing).toHaveBeenCalled();
      expect(activeOps).toEqual(mockActiveOperations);
    });

    it('should throw error when resuming without wallet', async () => {
      // Arrange
      publishingService.setWallet(null);

      // Act & Assert
      await expect(publishingService.resumePublishing('content_123')).rejects.toThrow('No wallet connected');
    });

  });

  // Test suite for Storage Integration
  describe('Storage Integration', () => {
    
    it('should get in-progress content', async () => {
      // Arrange
      const mockInProgressContent = [
        { contentId: 'draft_1', title: 'Draft Story 1' },
        { contentId: 'draft_2', title: 'Draft Story 2' }
      ];
      StorageService.getInProgressContentArray.mockResolvedValue(mockInProgressContent);

      // Act
      const result = await publishingService.getInProgressContent();

      // Assert
      expect(StorageService.getInProgressContentArray).toHaveBeenCalled();
      expect(result).toEqual(mockInProgressContent);
    });

    it('should get published content', async () => {
      // Arrange
      const mockPublishedContent = [
        { contentId: 'pub_1', title: 'Published Story 1' },
        { contentId: 'pub_2', title: 'Published Story 2' }
      ];
      StorageService.getPublishedContentArray.mockResolvedValue(mockPublishedContent);

      // Act
      const result = await publishingService.getPublishedContent();

      // Assert
      expect(StorageService.getPublishedContentArray).toHaveBeenCalled();
      expect(result).toEqual(mockPublishedContent);
    });

  });

  // Test suite for Content Statistics
  describe('Content Statistics', () => {
    
    it('should get content statistics', () => {
      // Arrange
      const content = { title: 'Test', content: 'Test content for stats' };
      const mockStats = {
        characterCount: 23,
        wordCount: 4,
        estimatedChunks: 1,
        estimatedCost: 0.001
      };
      ContentService.getContentStats.mockReturnValue(mockStats);

      // Act
      const stats = publishingService.getContentStats(content);

      // Assert
      expect(ContentService.getContentStats).toHaveBeenCalledWith(content);
      expect(stats).toEqual(mockStats);
    });

  });

  // Test suite for Error Handling
  describe('Error Handling', () => {
    
    beforeEach(() => {
      publishingService.setWallet(mockWallet);
    });

    it('should handle ContentService errors during preparation', async () => {
      // Arrange
      const contentData = { content: 'test content' };
      ContentService.prepareContent.mockRejectedValue(new Error('Content preparation failed'));

      // Act & Assert
      await expect(publishingService.prepareContent(contentData, 'Test')).rejects.toThrow('Content preparation failed');
    });

    it('should handle BlockchainService errors during publishing', async () => {
      // Arrange
      const preparedContent = {
        title: 'Test',
        content: 'test',
        glyphs: [{ index: 0, content: 'chunk' }]
      };
      BlockchainService.prototype.publishContent.mockRejectedValue(new Error('Blockchain publishing failed'));

      // Act & Assert
      await expect(publishingService.publishContent(preparedContent)).rejects.toThrow('Blockchain publishing failed');
    });

    it('should handle file loading errors', async () => {
      // Arrange
      ContentService.pickAndLoadFile.mockRejectedValue(new Error('File loading failed'));

      // Act & Assert
      await expect(publishingService.pickAndLoadFile()).rejects.toThrow('File loading failed');
    });

  });

  // Test suite for Integration Scenarios
  describe('Integration Scenarios', () => {
    
    beforeEach(() => {
      publishingService.setWallet(mockWallet);
    });

    it('should handle complete publishing workflow', async () => {
      // Arrange - Simulate complete workflow
      const fileContent = {
        content: 'Complete story content for end-to-end testing',
        filename: 'complete-story.txt',
        size: 50,
        type: 'text/plain'
      };

      const preparedContent = {
        contentId: 'complete_123',
        title: 'Complete Story',
        content: fileContent.content,
        glyphs: [
          { index: 0, content: 'chunk_1', hash: 'hash_1' },
          { index: 1, content: 'chunk_2', hash: 'hash_2' }
        ],
        authorPublicKey: 'mock_public_key_12345678'
      };

      const publishResult = {
        success: true,
        contentId: 'complete_123',
        transactionIds: ['tx_1', 'tx_2'],
        totalGlyphs: 2,
        publishedGlyphs: 2
      };

      // Mock all the services
      ContentService.pickAndLoadFile.mockResolvedValue(fileContent);
      ContentService.prepareContent.mockResolvedValue(preparedContent);
      BlockchainService.prototype.publishContent.mockResolvedValue(publishResult);

      const progressCallback = jest.fn();

      // Act - Complete workflow
      const loadedFile = await publishingService.pickAndLoadFile();
      const prepared = await publishingService.prepareContent(
        { 
          content: loadedFile.content,
          filename: loadedFile.filename,
          size: loadedFile.size,
          type: loadedFile.type
        },
        'Complete Story'
      );
      const published = await publishingService.publishContent(prepared, progressCallback);

      // Assert - Verify complete workflow
      expect(loadedFile).toHaveProperty('content', fileContent.content);
      expect(prepared).toEqual(preparedContent);
      expect(published).toEqual(publishResult);
      expect(ContentService.pickAndLoadFile).toHaveBeenCalled();
      expect(ContentService.prepareContent).toHaveBeenCalled();
      expect(BlockchainService.prototype.publishContent).toHaveBeenCalledWith(
        preparedContent,
        mockKeypair,
        progressCallback
      );
    });

  });

});

// 18,876 characters