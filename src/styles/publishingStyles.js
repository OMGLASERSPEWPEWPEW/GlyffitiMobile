// src/styles/publishingStyles.js
import { StyleSheet } from 'react-native';

// Add these styles to your publishingStyles.js file

const additionalWalletStyles = {
  // Wallet unlock section
  walletSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  
  unlockSection: {
    width: '100%',
    marginTop: 12,
  },
  
  unlockButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 12,
  },
  
  showUnlockButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
  },
  
  showUnlockButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  unlockButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  
  unlockButtonDisabled: {
    backgroundColor: '#ccc',
  },
  
  unlockButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  cancelButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  upgradeButton: {
    backgroundColor: '#ffc107',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
  },
  
  upgradeButtonText: {
    color: '#212529',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Enhanced existing styles
  passwordInput: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  
  publishButtonDisabled: {
    backgroundColor: '#e9ecef',
    opacity: 0.6,
  },
  
  resumeButtonDisabled: {
    backgroundColor: '#e9ecef',
    opacity: 0.6,
  },
};

// Additional styles to add to src/styles/publishingStyles.js

const additionalStyles = {
  // Password Input Styles
  passwordContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    alignItems: 'center',
  },
  passwordTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  passwordSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  passwordInput: {
    width: '100%',
    height: 50,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  passwordButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  passwordButtonDisabled: {
    backgroundColor: '#ccc',
  },
  passwordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },

  // Enhanced Progress Styles
  progressContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: '#28a745',
    textAlign: 'center',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 4,
  },
  compressionText: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Statistics Styles
  statsContainer: {
    backgroundColor: '#e8f4fd',
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  statsText: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    marginBottom: 4,
  },

  // Content Item Enhancements
  resumeButton: {
    backgroundColor: '#28a745',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  resumeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollIdText: {
    fontSize: 10,
    color: '#6c757d',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  moreText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },

  // Enhanced Section Styles
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  contentItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  contentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  contentMeta: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },

  // Wallet Container Enhancement
  walletContainer: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    alignItems: 'center',
  },
  walletTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  walletAddress: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  walletBalance: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 12,
  },
};

export const publishingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 50, // Account for status bar
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 20,
    textAlign: 'center',
  },
  walletContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  walletTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  walletAddress: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'monospace',
    marginBottom: 5,
  },
  walletBalance: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#28a745',
  },
  airdropButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  airdropButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  publishButton: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  publishButtonDisabled: {
    backgroundColor: '#ccc',
  },
  publishButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#667eea',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 4,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  contentItem: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  contentMeta: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  transactionInfo: {
    fontSize: 11,
    color: '#28a745',
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  resumeButton: {
    backgroundColor: '#ff9500',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 8,
  },
  resumeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

// File length: 2,347 characters