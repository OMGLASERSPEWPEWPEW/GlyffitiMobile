// src/components/publishing/ProgressBar.js
// Path: src/components/publishing/ProgressBar.js
import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../shared';
import { publishingStyles } from '../../styles/publishingStyles';
import { spacing } from '../../styles/tokens';

export const ProgressBar = ({ publishing, progress, isDarkMode = false }) => {
  if (!publishing || !progress) {
    return null;
  }
  
  const currentGlyph = progress.currentGlyph || 0;
  const totalGlyphs = progress.totalGlyphs || 0;
  const progressPercent = progress.progress || 0;
  const stage = progress.stage || 'publishing';
  
  return (
    <Card
      isDarkMode={isDarkMode}
      borderRadius={8}
      padding={spacing.medium}
      marginBottom={spacing.medium}
      marginHorizontal={0}
    >
      <Text style={[
        publishingStyles.progressTitle,
        { color: isDarkMode ? '#e5e7eb' : '#1a1a1a' }
      ]}>
        {stage === 'preparing' && '📋 Preparing content...'}
        {stage === 'processing' && '🔄 Processing glyphs...'}
        {stage === 'publishing' && `📤 Publishing glyph ${currentGlyph}/${totalGlyphs}...`}
        {stage === 'creating_scroll' && '📜 Creating scroll manifest...'}
        {stage === 'completed' && '✅ Publishing complete!'}
        {stage === 'failed' && '❌ Publishing failed'}
        {!['preparing', 'processing', 'publishing', 'creating_scroll', 'completed', 'failed'].includes(stage) && 
         `📤 Publishing glyph ${currentGlyph}/${totalGlyphs}...`}
      </Text>
      
      <View style={[
        publishingStyles.progressBarContainer,
        { backgroundColor: isDarkMode ? '#374151' : '#e9ecef' }
      ]}>
        <View 
          style={[
            publishingStyles.progressBar,
            { 
              width: `${Math.max(0, Math.min(100, progressPercent))}%`,
              backgroundColor: isDarkMode ? '#10b981' : '#28a745'
            }
          ]}
        />
      </View>
      
      <Text style={[
        publishingStyles.progressText,
        { color: isDarkMode ? '#9ca3af' : '#495057' }
      ]}>
        {progressPercent}% Complete
      </Text>
      
      {progress.compressionStats && (
        <Text style={[
          publishingStyles.compressionText,
          { color: isDarkMode ? '#9ca3af' : '#495057' }
        ]}>
          💾 Compressed {progress.compressionStats.percentSaved}% 
          ({progress.compressionStats.spaceSaved} bytes saved)
        </Text>
      )}
    </Card>
  );
};

// Character count: 1842