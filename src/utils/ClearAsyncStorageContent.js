// src/utils/ClearAsyncStorageContent.js
// Path: src/utils/ClearAsyncStorageContent.js

import { ClearPublishedScript } from './ClearPublishedScript';
import { StorageDiagnostic } from './StorageDiagnostic';

/**
 * Safe method to clear only content data from AsyncStorage
 * Preserves wallet data and user settings
 */
export const clearContentOnly = async () => {
  try {
    console.log('🧹 Starting safe content clear...');
    
    // Run diagnostic first to see what we have
    const diagnostic = await StorageDiagnostic.diagnoseStorage();
    console.log('📊 Pre-clear diagnostic:', diagnostic);
    
    // Use the safe clear method that preserves wallets
    const result = await ClearPublishedScript.clearContentOnly();
    
    if (result) {
      console.log('✅ Content cleared successfully');
      
      // Run diagnostic again to confirm
      const postDiagnostic = await StorageDiagnostic.diagnoseStorage();
      console.log('📊 Post-clear diagnostic:', postDiagnostic);
      
      return true;
    } else {
      throw new Error('Clear operation failed');
    }
  } catch (error) {
    console.error('❌ Error clearing content:', error);
    return false;
  }
};

// Export for easy use in your app
export default clearContentOnly;