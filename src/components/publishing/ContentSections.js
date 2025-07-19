// src/components/publishing/ContentSections.js
// Path: src/components/publishing/ContentSections.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { publishingStyles } from '../../styles/publishingStyles';

export const ContentSections = ({ 
  inProgressContent, 
  drafts, 
  publishedContent, 
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
            <View key={index} style={publishingStyles.contentItem}>
              <Text style={publishingStyles.contentTitle}>{item.title}</Text>
              <Text style={publishingStyles.contentMeta}>
                {item.successfulGlyphs || 0}/{item.totalGlyphs || item.glyphs?.length || 0} glyphs published
              </Text>
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
            <View key={index} style={publishingStyles.contentItem}>
              <Text style={publishingStyles.contentTitle}>{draft.title}</Text>
              <Text style={publishingStyles.contentMeta}>
                {draft.content?.length || 0} characters
              </Text>
            </View>
          ))}
        </View>
      )}
      
      {/* Published Content - NOW CLICKABLE */}
      {publishedContent.length > 0 && (
        <View style={publishingStyles.section}>
          <Text style={publishingStyles.sectionTitle}>✅ Published ({publishedContent.length})</Text>
          {publishedContent.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                publishingStyles.contentItem,
                publishingStyles.publishedContentItem // New style for published items
              ]}
              onPress={() => handleViewStory && handleViewStory(item)}
              activeOpacity={0.7}
            >
              <View style={publishingStyles.publishedContentHeader}>
                <Text style={publishingStyles.contentTitle}>{item.title}</Text>
                <Text style={publishingStyles.viewStoryIcon}>👁️</Text>
              </View>
              
              <Text style={publishingStyles.contentMeta}>
                {item.glyphs?.length || item.totalGlyphs || 0} glyphs • {item.transactionIds?.length || 0} transactions
              </Text>
              
              {item.scrollId && (
                <Text style={publishingStyles.scrollId}>
                  Scroll: {item.scrollId.slice(0, 8)}...
                </Text>
              )}
              
              {item.publishedAt && (
                <Text style={publishingStyles.publishedDate}>
                  Published: {new Date(item.publishedAt).toLocaleDateString()}
                </Text>
              )}
              
              {/* Tap to view indicator */}
              <Text style={publishingStyles.tapToViewText}>
                📖 Tap to read story
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      {/* Publishing Statistics */}
      {publishingStats && (
        <View style={publishingStyles.statsContainer}>
          <Text style={publishingStyles.statsTitle}>📊 Publishing Statistics</Text>
          <Text style={publishingStyles.statsText}>
            Total Published: {publishingStats.totalPublished}
          </Text>
          <Text style={publishingStyles.statsText}>
            Total Glyphs: {publishingStats.totalGlyphs}
          </Text>
          <Text style={publishingStyles.statsText}>
            Success Rate: {publishingStats.successRate}%
          </Text>
          <Text style={publishingStyles.statsText}>
            Total Cost: {publishingStats.totalCost.toFixed(6)} SOL
          </Text>
        </View>
      )}
    </>
  );
};

// Character count: 3718