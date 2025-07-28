// src/styles/publishingStyles.js
// Path: src/styles/publishingStyles.js
import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const publishingStyles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },

  // ScrollView configurations - FIXED FOR PROPER SCROLLING
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 50, // Extra bottom padding for safe area
  },
  bottomSpacer: {
    height: 100, // Ensures last content is accessible
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginLeft: 16,
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#6c757d',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },

  // Wallet Section
  walletContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  walletTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  walletSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 12,
  },
  walletAddress: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#495057',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  walletBalance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#28a745',
    marginBottom: 12,
  },

  // Password input section
  passwordContainer: {
    marginTop: 12,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
  },

  // Buttons
  unlockButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  unlockButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  airdropButton: {
    backgroundColor: '#17a2b8',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  airdropButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  airdropButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  upgradeButton: {
    backgroundColor: '#ffc107',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#212529',
    fontSize: 16,
    fontWeight: '600',
  },

  // Main publish button
  publishButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  publishButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  publishButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Clear button
  clearButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },

  // Progress bar - UPDATED WITH NEW CARD-BASED STYLES
  progressContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#28a745',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
  },
  compressionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#495057',
  },

  // Content sections
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 12,
    fontStyle: 'italic',
  },

  // Content items
  contentItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  publishedContentItem: {
    borderLeftColor: '#28a745',
    backgroundColor: '#f8fff9',
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  contentMeta: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  contentDate: {
    fontSize: 12,
    color: '#868e96',
    marginBottom: 8,
  },
  authorText: {
    fontSize: 12,
    color: '#495057',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  scrollId: {
    fontSize: 11,
    color: '#6c757d',
    fontFamily: 'monospace',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  publishedDate: {
    fontSize: 12,
    color: '#495057',
    marginBottom: 8,
  },
  contentPreview: {
    fontSize: 13,
    color: '#6c757d',
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: 8,
  },

  // Published content specific
  publishedContentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  viewStoryIcon: {
    fontSize: 16,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  statusIndicator: {
    backgroundColor: '#e7f3ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 11,
    color: '#0066cc',
  },

  // Resume button
  resumeButton: {
    backgroundColor: '#007bff',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  resumeButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  resumeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },

  // Card-based content items (for Card component usage)
  contentItemCard: {
    borderLeftWidth: 4,
  },
  publishedNote: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
    color: '#6c757d',
  },

  // Statistics
  statsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },

  // Debug section
  debugSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
});

// Character count: 7024