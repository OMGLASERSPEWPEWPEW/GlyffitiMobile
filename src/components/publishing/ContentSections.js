// src/components/publishing/ContentSections.js
// Path: src/components/publishing/ContentSections.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { publishingStyles } from '../../styles/publishingStyles';

export const ContentSections = ({ 
  inProgressContent = [], 
  drafts = [], 
  publishedContent = [], 
  publishingStats,
  walletStatus,
  publishing,
  handleResumePublishing,
  handleViewStory // New prop for viewing published stories
}) => {
  return (
    <>
      {/* In Progress Content */}
      {inProgressContent.length > 0 && (
        <View style={publishingStyles.section}>
          <Text style={publishingStyles.sectionTitle}>⚠️ In Progress ({inProgressContent.length})</Text>
          {inProgressContent.map((item, index) => (
            <View key={`inprogress-${item.contentId || index}`} style={publishingStyles.contentItem}>
              <Text style={publishingStyles.contentTitle}>{item.title || 'Untitled'}</Text>
              <Text style={publishingStyles.contentMeta}>
                {item.successfulGlyphs || 0}/{item.totalGlyphs || item.glyphs?.length || 0} glyphs published
              </Text>
              {item.lastUpdated && (
                <Text style={publishingStyles.contentDate}>
                  Last updated: {new Date(item.lastUpdated).toLocaleDateString()}
                </Text>
              )}
              <TouchableOpacity 
                style={[
                  publishingStyles.resumeButton,
                  walletStatus !== 'unlocked' && publishingStyles.resumeButtonDisabled
                ]}
                onPress={() => handleResumePublishing(item.contentId || item.id)}
                disabled={publishing || walletStatus !== 'unlocked'}
              >
                <Text style={publishingStyles.resumeButtonText}>
                  {walletStatus !== 'unlocked' ? '🔒 Unlock to Resume' : '▶️ Resume Publishing'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      
      {/* Drafts */}
      {drafts.length > 0 && (
        <View style={publishingStyles.section}>
          <Text style={publishingStyles.sectionTitle}>📝 Drafts ({drafts.length})</Text>
          {drafts.map((draft, index) => (
            <View key={`draft-${draft.id || index}`} style={publishingStyles.contentItem}>
              <Text style={publishingStyles.contentTitle}>{draft.title || 'Untitled Draft'}</Text>
              <Text style={publishingStyles.contentMeta}>
                {draft.content?.length || 0} characters
              </Text>
              {draft.lastUpdated && (
                <Text style={publishingStyles.contentDate}>
                  Last updated: {new Date(draft.lastUpdated).toLocaleDateString()}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
      
      {/* Published Content - ENHANCED WITH BETTER DISPLAY */}
      {publishedContent.length > 0 && (
        <View style={publishingStyles.section}>
          <Text style={publishingStyles.sectionTitle}>✅ Published ({publishedContent.length})</Text>
          <Text style={publishingStyles.sectionSubtitle}>
            Tap any story to read it
          </Text>
          {publishedContent.map((item, index) => (
            <TouchableOpacity 
              key={`published-${item.contentId || index}`}
              style={[
                publishingStyles.contentItem,
                publishingStyles.publishedContentItem // Enhanced style for published items
              ]}
              onPress={() => handleViewStory && handleViewStory(item)}
              activeOpacity={0.7}
            >
              <View style={publishingStyles.publishedContentHeader}>
                <Text style={publishingStyles.contentTitle}>
                  {item.title || 'Untitled Story'}
                </Text>
                <Text style={publishingStyles.viewStoryIcon}>👁️</Text>
              </View>
              
              {/* Author info */}
              {item.authorName && (
                <Text style={publishingStyles.authorText}>
                  by {item.authorName}
                </Text>
              )}
              
              {/* Content statistics */}
              <Text style={publishingStyles.contentMeta}>
                {item.glyphs?.length || item.totalGlyphs || 0} glyphs • {item.transactionIds?.length || 0} transactions
              </Text>
              
              {/* Scroll ID if available */}
              {item.scrollId && (
                <Text style={publishingStyles.scrollId}>
                  Scroll: {item.scrollId.slice(0, 12)}...
                </Text>
              )}
              
              {/* Published date */}
              {item.publishedAt && (
                <Text style={publishingStyles.publishedDate}>
                  Published: {new Date(item.publishedAt).toLocaleDateString()} at {new Date(item.publishedAt).toLocaleTimeString()}
                </Text>
              )}
              
              {/* Content preview if available */}
              {item.originalContent && (
                <Text style={publishingStyles.contentPreview} numberOfLines={2}>
                  {item.originalContent.length > 100 
                    ? item.originalContent.substring(0, 100) + '...' 
                    : item.originalContent}
                </Text>
              )}
              
              {/* Status indicators */}
              <View style={publishingStyles.statusRow}>
                {item.manifest && (
                  <View style={publishingStyles.statusIndicator}>
                    <Text style={publishingStyles.statusText}>📜 Has Manifest</Text>
                  </View>
                )}
                {item.transactionIds && item.transactionIds.length > 0 && (
                  <View style={publishingStyles.statusIndicator}>
                    <Text style={publishingStyles.statusText}>⛓️ On Chain</Text>
                  </View>
                )}
              </View>
              
              {/* Tap to view indicator */}
              <Text style={publishingStyles.tapToViewText}>
                📖 Tap to read story
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      {/* Empty state for published content */}
      {publishedContent.length === 0 && (
        <View style={publishingStyles.section}>
          <Text style={publishingStyles.sectionTitle}>✅ Published (0)</Text>
          <View style={publishingStyles.emptyState}>
            <Text style={publishingStyles.emptyStateIcon}>📚</Text>
            <Text style={publishingStyles.emptyStateTitle}>No Published Stories</Text>
            <Text style={publishingStyles.emptyStateText}>
              Stories you publish will appear here. Once published, you can tap them to read and share.
            </Text>
          </View>
        </View>
      )}
      
      {/* Publishing Statistics */}
      {publishingStats && (
        <View style={publishingStyles.statsContainer}>
          <Text style={publishingStyles.statsTitle}>📊 Publishing Statistics</Text>
          <View style={publishingStyles.statsGrid}>
            <View style={publishingStyles.statItem}>
              <Text style={publishingStyles.statNumber}>
                {publishingStats.totalPublished || 0}
              </Text>
              <Text style={publishingStyles.statLabel}>Published</Text>
            </View>
            <View style={publishingStyles.statItem}>
              <Text style={publishingStyles.statNumber}>
                {publishingStats.totalGlyphs || 0}
              </Text>
              <Text style={publishingStyles.statLabel}>Glyphs</Text>
            </View>
            <View style={publishingStyles.statItem}>
              <Text style={publishingStyles.statNumber}>
                {publishingStats.successRate || 100}%
              </Text>
              <Text style={publishingStyles.statLabel}>Success Rate</Text>
            </View>
            <View style={publishingStyles.statItem}>
              <Text style={publishingStyles.statNumber}>
                {(publishingStats.totalCost || 0).toFixed(4)}
              </Text>
              <Text style={publishingStyles.statLabel}>SOL Spent</Text>
            </View>
          </View>
        </View>
      )}
      
      {/* Debug Info (only in development) */}
      {__DEV__ && (
        <View style={publishingStyles.debugSection}>
          <Text style={publishingStyles.debugTitle}>🔧 Debug Info</Text>
          <Text style={publishingStyles.debugText}>
            In Progress: {inProgressContent.length}
          </Text>
          <Text style={publishingStyles.debugText}>
            Drafts: {drafts.length}
          </Text>
          <Text style={publishingStyles.debugText}>
            Published: {publishedContent.length}
          </Text>
          <Text style={publishingStyles.debugText}>
            Publishing: {publishing ? 'Yes' : 'No'}
          </Text>
          <Text style={publishingStyles.debugText}>
            Wallet: {walletStatus}
          </Text>
        </View>
      )}
    </>
  );
};

// Character count: 6,247