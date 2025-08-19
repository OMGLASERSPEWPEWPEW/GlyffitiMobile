// src/hooks/usePublishing.js
// Path: src/hooks/usePublishing.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import { PublishingService } from '../services/publishing/PublishingService';
import { StorageService } from '../services/storage/StorageService';
import { UserStorageService } from '../services/storage/UserStorageService';
import { useUser } from './useUser';
import { User } from 'lucide-react-native';

/**
 * Custom hook for publishing management
 * Centralizes all publishing-related state and operations
 * @param {Object} walletService - The wallet service instance from useWallet
 * @returns {Object} Publishing state and methods
 */
export const usePublishing = (walletService = null) => {
  // Publishing service instance
  const [publishingService] = useState(() => new PublishingService());
  
  // Core publishing state
  const [isPublishing, setIsPublishing] = useState(false);
  const [progress, setProgress] = useState({
    progress: 0,
    currentGlyph: 0,
    totalGlyphs: 0,
    message: ''
  });
  
  // Content state
  const [drafts, setDrafts] = useState([]);
  const [inProgressContent, setInProgressContent] = useState([]);
  const [publishedContent, setPublishedContent] = useState([]);
  const [publishingStats, setPublishingStats] = useState(null);
  
  // Loading state
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  
  // Refs to prevent duplicate operations
  const contentLoadedRef = useRef(false);
  const publishingRef = useRef(false);
  const { selectedUser } = useUser();
  
  // Update publishing service when wallet changes
  useEffect(() => {
    if (walletService && publishingService) {
      console.log('usePublishing: 🔗 Linking wallet to publishing service...');
      publishingService.setWallet(walletService);
    }
  }, [walletService, publishingService]);
  
  // Load existing content on mount
  useEffect(() => {
 if (selectedUser?.publicKey) {
    loadExistingContent(); // Reload when user changes
    console.log(`usePublishing: Load existing content on mount...${selectedUser}`)
  }
}, [selectedUser?.publicKey]);
  
  /**
   * Load all existing content from storage
   */
  const loadExistingContent = useCallback(async () => {
    if (!selectedUser?.publicKey){
      console.log(`usePublishing: No userSelected: ${selectedUser} PublicKey: ${selectedUser.publicKey}`)
      return;
    } 


    if (contentLoadedRef.current || isLoadingContent) {
      console.log('usePublishing: ⏭️ Skipping duplicate content load');
      return;
    }
    
    try {
      contentLoadedRef.current = true;
      setIsLoadingContent(true);
      console.log('usePublishing: 📚 Loading existing content...');
      
      // Load drafts
      const loadedDrafts = await publishingService.getDrafts();
      console.log(`usePublishing: 📝 Loaded ${loadedDrafts.length} drafts`);
      setDrafts(loadedDrafts);
      
      // Load published content
      const userPublished = await UserStorageService.loadPublishedStories(selectedUser.publicKey);
      setPublishedContent(userPublished);
      console.log(`usePublishing: ✅ Loaded ${userPublished.length} published items`);

      // const published = await publishingService.getPublishedContentArray();
      // console.log(`✅ Loaded ${published.length} published items`);
      // setPublishedContent(published);
      
      // Separate in-progress items
      const inProgress = userPublished.filter(item => 
        item.status === 'publishing' || 
        (item.progress && item.progress < 100)
      );
      setInProgressContent(inProgress);
      
      // Load stats if available
      try {
        const stats = await publishingService.getPublishingStats();
        setPublishingStats(stats);
      } catch (error) {
        console.log('usePublishing: 📊 Publishing stats not available');
      }
      
    } catch (error) {
      console.error('usePublishing: ❌ Error loading content:', error);
      Alert.alert('Error', 'Failed to load existing content');
    } finally {
      setIsLoadingContent(false);
      // Reset flag after delay to allow future refreshes
      setTimeout(() => {
        contentLoadedRef.current = false;
      }, 1000);
    }
  }, [publishingService, isLoadingContent]);
  
  /**
   * Handle file selection
   * @returns {Promise<Object|null>} Selected content or null
   */
  const selectFile = useCallback(async () => {
    try {
      console.log('📄 Opening file picker...');
      const content = await publishingService.pickAndLoadFile();
      
      if (content) {
        console.log('✅ File loaded:', content.filename);
        // Save as draft automatically
        await saveDraft(content);
        return content;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error selecting file:', error);
      Alert.alert('Error', 'Failed to load file: ' + error.message);
      return null;
    }
  }, [publishingService]);
  
  /**
   * Create text content manually
   * @param {string} text - The text content
   * @param {string} title - Content title
   * @returns {Object} Created content
   */
  const createTextContent = useCallback((text, title = 'Manual Entry') => {
    try {
      const content = publishingService.createTextContent(text, title);
      saveDraft(content);
      return content;
    } catch (error) {
      Alert.alert('Error', error.message);
      return null;
    }
  }, [publishingService]);
  
  /**
   * Save content as draft
   * @param {Object} content - Content to save
   */
  const saveDraft = useCallback(async (content) => {
    try {
      const draftContent = {
        ...content,
        id: content.id || `draft_${Date.now()}`,
        status: 'draft',
        savedAt: Date.now()
      };
      
      await StorageService.saveDraft(draftContent);
      setDrafts(prev => [...prev, draftContent]);
      console.log('💾 Draft saved');
      
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  }, []);
  
  /**
   * Delete a draft
   * @param {string} draftId - Draft ID to delete
   */
  const deleteDraft = useCallback(async (draftId) => {
    try {
      await publishingService.deleteDraft(draftId);
      setDrafts(prev => prev.filter(d => d.id !== draftId));
      Alert.alert('Success', 'Draft deleted');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete draft');
    }
  }, [publishingService]);
  
  /**
   * Publish content to blockchain
   * @param {Object} content - Content to publish
   * @param {string} title - Publishing title
   * @param {Object} options - Publishing options
   */
  const publishContent = useCallback(async (content, title, options = {}) => {
    if (!walletService) {
      Alert.alert('Error', 'Please unlock your wallet first');
      return false;
    }
    
    if (publishingRef.current || isPublishing) {
      Alert.alert('Info', 'Publishing already in progress');
      return false;
    }
    
    try {
      publishingRef.current = true;
      setIsPublishing(true);
      setProgress({
        progress: 0,
        currentGlyph: 0,
        totalGlyphs: 0,
        message: 'usePublishing: Preparing content...'
      });
      
      console.log('usePublishing: 🚀 Starting publishing process...');
      
      // Prepare content
      const preparedContent = await publishingService.prepareContent(
        content,
        title,
        options
      );
      
      if (!preparedContent) {
        throw new Error('Failed to prepare content');
      }
      
      // Get wallet keypair
      const keypair = walletService.getWalletKeypair();
      if (!keypair) {
        throw new Error('Failed to get wallet keypair');
      }
      
      // Progress callback
      const onProgress = (progressData) => {
        console.log(`usePublishing: 📊 Publishing progress: ${progressData.currentGlyph}/${progressData.totalGlyphs} (${progressData.progress}%) - ${progressData.stage}`);
  setProgress(progressData);
        setProgress(progressData);
      };
      
      // ✅ FIXED: Call publishContent directly with user context
      const result = await publishingService.publishContent(
        preparedContent,
        onProgress,
        selectedUser?.publicKey  // Pass user public key for scoped storage
      );
      
      if (!result || result.status !== 'completed') {
        throw new Error(result?.error || 'Publishing failed');
      }
      
      console.log('usePublishing: ✅ Publishing completed!', result);
      
      // Update content lists
      await loadExistingContent();
      
      // Remove from drafts if it was a draft
      if (content.id && drafts.some(d => d.id === content.id)) {
        setDrafts(prev => prev.filter(d => d.id !== content.id));
      }
      
      Alert.alert(
        '🎉 Success!',
        `Your content has been published!\n\nScroll ID: ${result.manifest?.scrollId || result.scrollId || 'N/A'}`,
        [
          {
            text: 'View Details',
            onPress: () => {
              // Could navigate to details screen here
              console.log('View details for:', result.manifest);
            }
          },
          { text: 'OK' }
        ]
      );
      
      return true;
      
    } catch (error) {
      console.error('❌ Publishing error:', error);
      Alert.alert(
        'Publishing Failed',
        error.message || 'An error occurred during publishing'
      );
      return false;
      
    } finally {
      publishingRef.current = false;
      setIsPublishing(false);
      setProgress({
        progress: 0,
        currentGlyph: 0,
        totalGlyphs: 0,
        message: ''
      });
    }
  }, [walletService, publishingService, isPublishing, drafts, selectedUser?.publicKey]);
  
  /**
   * Resume publishing for in-progress content
   * @param {string} contentId - Content ID to resume
   */
  const resumePublishing = useCallback(async (contentId) => {
    const content = inProgressContent.find(c => c.contentId === contentId);
    if (!content) {
      Alert.alert('Error', 'Content not found');
      return;
    }
    
    // For now, just restart the publishing
    // In a real implementation, you'd resume from where it left off
    await publishContent(content, content.title, {
      resumeFrom: content.progress?.currentGlyph || 0
    });
  }, [inProgressContent, publishContent]);
  
  /**
   * Delete published content
   * @param {string} contentId - Content ID to delete
   */
  const deletePublishedContent = useCallback(async (contentId) => {
    try {
      const success = await publishingService.deletePublishedContent(contentId);
      if (success) {
        setPublishedContent(prev => prev.filter(c => c.contentId !== contentId));
        Alert.alert('Success', 'Content deleted');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete content');
    }
  }, [publishingService]);
  
  /**
   * Export all data for backup
   * @returns {Promise<string>} Exported data as JSON string
   */
  const exportData = useCallback(async () => {
    try {
      const data = await publishingService.exportAllData();
      Alert.alert('Success', 'Data exported successfully');
      return data;
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
      return null;
    }
  }, [publishingService]);
  
  /**
   * Import data from backup
   * @param {string} jsonData - JSON data to import
   * @param {boolean} merge - Whether to merge with existing data
   */
  const importData = useCallback(async (jsonData, merge = true) => {
    try {
      const result = await publishingService.importData(jsonData, merge);
      await loadExistingContent();
      Alert.alert('Success', `Imported ${result.imported} items`);
    } catch (error) {
      Alert.alert('Error', 'Failed to import data');
    }
  }, [publishingService]);
  
  /**
   * Search content
   * @param {string} searchTerm - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  const searchContent = useCallback(async (searchTerm, options = {}) => {
    try {
      return await publishingService.searchContent(searchTerm, options);
    } catch (error) {
      console.error('Search error:', error);
      return { drafts: [], published: [] };
    }
  }, [publishingService]);
  

    /**
 * Direct pass-through to service's publishContent with user context
 * Maintains compatibility with PublishingScreen
 */
const publishToBlockchain = useCallback(async (content, keypair, onProgress, userPublicKey = null) => {
  if (!content || !keypair) {
    throw new Error('Content and keypair are required');
  }
  
  try {
    publishingRef.current = true;
    setIsPublishing(true);
    
    // Wrap the onProgress to update our hook's state
    const wrappedProgress = (status) => {
      setProgress({
        progress: status.progress || 0,
        currentGlyph: status.currentGlyph || 0,
        totalGlyphs: status.totalGlyphs || 0,
        message: status.message || `Publishing glyph ${status.currentGlyph || 0}/${status.totalGlyphs || 0}...`
      });
      
      // Call original callback if provided
      if (onProgress) onProgress(status);
    };
    
    // Call PublishingService method with user context
    const result = await publishingService.publishContent(
      content,
      wrappedProgress,
      userPublicKey  // Pass user context to the service
    );
    
    // Reload content after successful publish
    if (result && result.status === 'completed') {
      await loadExistingContent();
    }
    
    return result;
    
  } finally {
    publishingRef.current = false;
    setIsPublishing(false);
    if (!isPublishing) {
      setProgress({
        progress: 0,
        currentGlyph: 0,
        totalGlyphs: 0,
        message: ''
      });
    }
  }
}, [publishingService, loadExistingContent, isPublishing, selectedUser?.publicKey]);



  // Computed values
  const hasContent = drafts.length > 0 || publishedContent.length > 0;
  const canPublish = walletService && !isPublishing;
  const totalPublished = publishedContent.length;
  const totalDrafts = drafts.length;
  const hasInProgress = inProgressContent.length > 0;
  
  return {
    // State
    isPublishing,
    progress,
    drafts,
    inProgressContent,
    publishedContent,
    publishingStats,
    isLoadingContent,
    publishToBlockchain,  // Add this line
    publishingService,     // Make sure this is included too
    // Actions
    selectFile,
    createTextContent,
    saveDraft,
    deleteDraft,
    publishContent,
    resumePublishing,
    deletePublishedContent,
    loadExistingContent,
    exportData,
    importData,
    searchContent,
    
    // Computed values
    hasContent,
    canPublish,
    totalPublished,
    totalDrafts,
    hasInProgress,
    
    // Service instance (if needed)
    publishingService
  };
};

// Character count: 11,264