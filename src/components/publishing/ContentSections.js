// src/components/publishing/ContentSections.js
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
  handleResumePublishing 
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
                {item.successfulGlyphs || 0}/{item.totalGlyphs} glyphs published
              </Text>
              <TouchableOpacity 
                style={[
                  publishingStyles.resumeButton,
                  walletStatus !== 'unlocked' && publishingStyles.resumeButtonDisabled
                ]}
                onPress={() => handleResumePublishing(item.id)}
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
                {draft.content.length} characters
              </Text>
            </View>
          ))}
        </View>
      )}
      
      {/* Published Content */}
      {publishedContent.length > 0 && (
        <View style={publishingStyles.section}>
          <Text style={publishingStyles.sectionTitle}>✅ Published ({publishedContent.length})</Text>
          {publishedContent.map((item, index) => (
            <View key={index} style={publishingStyles.contentItem}>
              <Text style={publishingStyles.contentTitle}>{item.title}</Text>
              <Text style={publishingStyles.contentMeta}>
                {item.glyphs?.length || 0} glyphs • {item.transactionIds?.length || 0} transactions
              </Text>
              {item.scrollId && (
                <Text style={publishingStyles.scrollId}>
                  Scroll: {item.scrollId.slice(0, 8)}...
                </Text>
              )}
            </View>
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

// Character count: 2796