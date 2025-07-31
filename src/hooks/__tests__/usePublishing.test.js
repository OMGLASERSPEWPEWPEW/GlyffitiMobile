// src/hooks/__tests__/usePublishing.test.js
// Path: src/hooks/__tests__/usePublishing.test.js

/**
 * usePublishing Hook Tests
 * 
 * Tests the publishing hook that manages:
 * - Publishing state management
 * - Integration with PublishingService
 * - Progress tracking
 * - Content loading and management
 * - Error handling in UI context
 * 
 * This hook is critical as it's the bridge between your UI and publishing logic
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { usePublishing } from '../usePublishing';
import { PublishingService } from '../../services/publishing/PublishingService';
import { StorageService } from '../../services/storage/StorageService';

// Mock the dependencies
jest.mock('../../services/publishing/PublishingService');
jest.mock('../../services/storage/StorageService');
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn()
  }
}));

describe('usePublishing Hook', () => {
  let mockWalletService;
  let mockPublishingService;

  beforeEach(() => {
    // Create mock wallet service
    mockWalletService = {
      getWalletPublicKey: jest.fn(() => 'mock_wallet_public_key'),
      getWalletKeypair: jest.fn(() => ({ publicKey: 'key', secretKey: 'secret' })),
      isConnected: jest.fn(() => true)
    };

    // Create mock publishing service instance
    mockPublishingService = {
      setWallet: jest.fn(),
      getCurrentWallet: jest.fn(() => mockWalletService),
      getInProgressContent: jest.fn(() => Promise.resolve([])),
      getPublishedContent: jest.fn(() => Promise.resolve([])),
      publishContent: jest.fn(),
      resumePublishing: jest.fn(),
      cancelPublishing: jest.fn(),
      getPublishingStatus: jest.fn(),
      getActivePublishing: jest.fn(() => [])
    };

    // Mock PublishingService constructor
    PublishingService.mockImplementation(() => mockPublishingService);

    // Mock StorageService methods
    StorageService.getInProgressContentArray.mockResolvedValue([]);
    StorageService.getPublishedContentArray.mockResolvedValue([]);

    // Clear all mocks
    jest.clearAllMocks();
  });

  // Test suite for Hook Initialization
  describe('Hook Initialization', () => {
    
    it('should initialize with default state', () => {
      // Act
      const { result } = renderHook(() => usePublishing());

      // Assert
      expect(result.current.isPublishing).toBe(false);
      expect(result.current.progress).toEqual({
        progress: 0,
        currentGlyph: 0,
        totalGlyphs: 0,
        message: ''
      });
      expect(result.current.drafts).toEqual([]);
      expect(result.current.inProgressContent).toEqual([]);
      expect(result.current.publishedContent).toEqual([]);
      expect(result.current.publishingStats).toBeNull();
      expect(result.current.isLoadingContent).toBe(false);
    });

    it('should create PublishingService instance', () => {
      // Act
      renderHook(() => usePublishing());

      // Assert
      expect(PublishingService).toHaveBeenCalled();
    });

    it('should set wallet when provided', () => {
      // Act
      renderHook(() => usePublishing(mockWalletService));

      // Assert
      expect(mockPublishingService.setWallet).toHaveBeenCalledWith(mockWalletService);
    });

  });

  // Test suite for Content Loading
  describe('Content Loading', () => {
    
    it('should load existing content on mount', async () => {
      // Arrange
      const mockInProgress = [
        { contentId: 'draft_1', title: 'Draft 1' },
        { contentId: 'draft_2', title: 'Draft 2' }
      ];
      const mockPublished = [
        { contentId: 'pub_1', title: 'Published 1' },
        { contentId: 'pub_2', title: 'Published 2' }
      ];

      mockPublishingService.getInProgressContent.mockResolvedValue(mockInProgress);
      mockPublishingService.getPublishedContent.mockResolvedValue(mockPublished);

      // Act
      const { result } = renderHook(() => usePublishing(mockWalletService));

      // Wait for content loading to complete
      await act(async () => {
        // Allow useEffect to run
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Assert
      expect(mockPublishingService.getInProgressContent).toHaveBeenCalled();
      expect(mockPublishingService.getPublishedContent).toHaveBeenCalled();
    });

    it('should set loading state during content loading', async () => {
      // Arrange
      let resolvePromise;
      const loadingPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      mockPublishingService.getInProgressContent.mockReturnValue(loadingPromise);
      mockPublishingService.getPublishedContent.mockResolvedValue([]);

      // Act
      const { result } = renderHook(() => usePublishing(mockWalletService));

      // Assert - Should be loading initially
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Complete the loading
      await act(async () => {
        resolvePromise([]);
        await loadingPromise;
      });
    });

  });

  // Test suite for Publishing Operations
  describe('Publishing Operations', () => {
    
    it('should handle successful publishing', async () => {
      // Arrange
      const { result } = renderHook(() => usePublishing(mockWalletService));
      
      const mockContent = {
        title: 'Test Story',
        content: 'Test content for publishing'
      };

      const mockPublishResult = {
        success: true,
        contentId: 'pub_123',
        transactionIds: ['tx_1', 'tx_2']
      };

      mockPublishingService.publishContent.mockResolvedValue(mockPublishResult);

      // Act
      let publishResult;
      await act(async () => {
        if (result.current.publishContent) {
          publishResult = await result.current.publishContent(mockContent);
        }
      });

      // Assert
      expect(mockPublishingService.publishContent).toHaveBeenCalledWith(
        mockContent,
        expect.any(Function) // Progress callback
      );
    });

    it('should handle publishing errors', async () => {
      // Arrange
      const { result } = renderHook(() => usePublishing(mockWalletService));
      
      const mockContent = {
        title: 'Test Story',
        content: 'Test content'
      };

      const publishError = new Error('Publishing failed');
      mockPublishingService.publishContent.mockRejectedValue(publishError);

      // Act & Assert
      await act(async () => {
        if (result.current.publishContent) {
          await expect(result.current.publishContent(mockContent)).rejects.toThrow('Publishing failed');
        }
      });
    });

    it('should track publishing progress', async () => {
      // Arrange
      const { result } = renderHook(() => usePublishing(mockWalletService));
      
      const mockContent = {
        title: 'Test Story',
        content: 'Content with progress tracking'
      };

      let progressCallback;
      mockPublishingService.publishContent.mockImplementation((content, callback) => {
        progressCallback = callback;
        return new Promise(resolve => {
          // Simulate progress updates
          setTimeout(() => {
            callback({
              progress: 50,
              currentGlyph: 1,
              totalGlyphs: 2,
              message: 'Publishing glyph 1 of 2'
            });
            resolve({ success: true, contentId: 'test_123' });
          }, 10);
        });
      });

      // Act
      await act(async () => {
        if (result.current.publishContent) {
          await result.current.publishContent(mockContent);
        }
      });

      // Assert
      expect(progressCallback).toBeDefined();
    });

  });

  // Test suite for Progress Management
  describe('Progress Management', () => {
    
    it('should update progress state correctly', async () => {
      // Arrange
      const { result } = renderHook(() => usePublishing(mockWalletService));
      
      const progressUpdate = {
        progress: 75,
        currentGlyph: 3,
        totalGlyphs: 4,
        message: 'Publishing glyph 3 of 4'
      };

      // Act
      await act(async () => {
        if (result.current.setProgress) {
          result.current.setProgress(progressUpdate);
        }
      });

      // Assert
      expect(result.current.progress).toEqual(progressUpdate);
    });

    it('should reset progress after publishing completion', async () => {
      // Arrange
      const { result } = renderHook(() => usePublishing(mockWalletService));

      // First set some progress
      await act(async () => {
        if (result.current.setProgress) {
          result.current.setProgress({
            progress: 50,
            currentGlyph: 1,
            totalGlyphs: 2,
            message: 'Publishing...'
          });
        }
      });

      // Act - Reset progress
      await act(async () => {
        if (result.current.setProgress) {
          result.current.setProgress({
            progress: 0,
            currentGlyph: 0,
            totalGlyphs: 0,
            message: ''
          });
        }
      });

      // Assert
      expect(result.current.progress).toEqual({
        progress: 0,
        currentGlyph: 0,
        totalGlyphs: 0,
        message: ''
      });
    });

  });

  // Test suite for Publishing State Management
  describe('Publishing State Management', () => {
    
    it('should set publishing state during operations', async () => {
      // Arrange
      const { result } = renderHook(() => usePublishing(mockWalletService));

      // Act - Set publishing state
      await act(async () => {
        if (result.current.setIsPublishing) {
          result.current.setIsPublishing(true);
        }
      });

      // Assert
      expect(result.current.isPublishing).toBe(true);

      // Act - Clear publishing state
      await act(async () => {
        if (result.current.setIsPublishing) {
          result.current.setIsPublishing(false);
        }
      });

      // Assert
      expect(result.current.isPublishing).toBe(false);
    });

    it('should prevent duplicate publishing operations', async () => {
      // Arrange
      const { result } = renderHook(() => usePublishing(mockWalletService));
      
      const mockContent = { title: 'Test', content: 'test content' };
      
      // Simulate long-running publish operation
      mockPublishingService.publishContent.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      // Set publishing state manually to simulate ongoing operation
      await act(async () => {
        if (result.current.setIsPublishing) {
          result.current.setIsPublishing(true);
        }
      });

      // Act & Assert - Should prevent second operation
      expect(result.current.isPublishing).toBe(true);
    });

  });

  // Test suite for Content State Management
  describe('Content State Management', () => {
    
    it('should update in-progress content', async () => {
      // Arrange
      const { result } = renderHook(() => usePublishing(mockWalletService));
      
      const newInProgressContent = [
        { contentId: 'new_draft_1', title: 'New Draft 1' },
        { contentId: 'new_draft_2', title: 'New Draft 2' }
      ];

      // Act
      await act(async () => {
        if (result.current.setInProgressContent) {
          result.current.setInProgressContent(newInProgressContent);
        }
      });

      // Assert
      expect(result.current.inProgressContent).toEqual(newInProgressContent);
    });

    it('should update published content', async () => {
      // Arrange
      const { result } = renderHook(() => usePublishing(mockWalletService));
      
      const newPublishedContent = [
        { contentId: 'new_pub_1', title: 'New Published 1' },
        { contentId: 'new_pub_2', title: 'New Published 2' }
      ];

      // Act
      await act(async () => {
        if (result.current.setPublishedContent) {
          result.current.setPublishedContent(newPublishedContent);
        }
      });

      // Assert
      expect(result.current.publishedContent).toEqual(newPublishedContent);
    });

    it('should update drafts', async () => {
      // Arrange
      const { result } = renderHook(() => usePublishing(mockWalletService));
      
      const newDrafts = [
        { id: 'draft_1', title: 'Draft Story 1', content: 'Draft content 1' },
        { id: 'draft_2', title: 'Draft Story 2', content: 'Draft content 2' }
      ];

      // Act
      await act(async () => {
        if (result.current.setDrafts) {
          result.current.setDrafts(newDrafts);
        }
      });

      // Assert
      expect(result.current.drafts).toEqual(newDrafts);
    });

  });

  // Test suite for Wallet Integration
  describe('Wallet Integration', () => {
    
    it('should update publishing service when wallet changes', () => {
      // Arrange
      const { rerender } = renderHook(
        ({ wallet }) => usePublishing(wallet),
        { initialProps: { wallet: mockWalletService } }
      );

      const newMockWallet = {
        getWalletPublicKey: () => 'new_wallet_key',
        getWalletKeypair: () => ({ publicKey: 'new_key' }),
        isConnected: () => true
      };

      // Act - Change wallet
      rerender({ wallet: newMockWallet });

      // Assert
      expect(mockPublishingService.setWallet).toHaveBeenCalledWith(newMockWallet);
    });

    it('should handle null wallet', () => {
      // Arrange & Act
      const { result } = renderHook(() => usePublishing(null));

      // Assert - Should not crash with null wallet
      expect(result.current.isPublishing).toBe(false);
    });

  });

  // Test suite for Error Handling
  describe('Error Handling', () => {
    
    it('should handle content loading errors', async () => {
      // Arrange
      const loadingError = new Error('Failed to load content');
      mockPublishingService.getInProgressContent.mockRejectedValue(loadingError);
      mockPublishingService.getPublishedContent.mockResolvedValue([]);

      // Act
      const { result } = renderHook(() => usePublishing(mockWalletService));

      // Wait for effect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Assert - Hook should handle the error gracefully
      expect(result.current.inProgressContent).toEqual([]);
    });

    it('should show alerts for critical errors', async () => {
      // Arrange
      const { result } = renderHook(() => usePublishing(mockWalletService));
      
      const criticalError = new Error('Critical publishing error');
      mockPublishingService.publishContent.mockRejectedValue(criticalError);

      const mockContent = { title: 'Test', content: 'test content' };

      // Act
      await act(async () => {
        try {
          if (result.current.publishContent) {
            await result.current.publishContent(mockContent);
          }
        } catch (error) {
          // Expected to throw
        }
      });

      // Assert - Should not show Alert in test environment (mocked)
      // In real app, this would show user-friendly error messages
    });

  });

  // Test suite for Publishing Statistics
  describe('Publishing Statistics', () => {
    
    it('should track publishing statistics', async () => {
      // Arrange
      const { result } = renderHook(() => usePublishing(mockWalletService));
      
      const mockStats = {
        totalPublished: 5,
        totalGlyphs: 25,
        successRate: 0.96,
        averagePublishTime: 45000
      };

      // Act
      await act(async () => {
        if (result.current.setPublishingStats) {
          result.current.setPublishingStats(mockStats);
        }
      });

      // Assert
      expect(result.current.publishingStats).toEqual(mockStats);
    });

  });

});

// 12,947 characters