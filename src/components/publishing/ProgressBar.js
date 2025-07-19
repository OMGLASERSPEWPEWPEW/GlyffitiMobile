// src/components/publishing/ProgressBar.js
// Path: src/components/publishing/ProgressBar.js
import React from 'react';
import { View, Text } from 'react-native';
import { publishingStyles } from '../../styles/publishingStyles';

export const ProgressBar = ({ publishing, progress }) => {
  if (!publishing || !progress) {
    return null;
  }
  
  const currentGlyph = progress.currentGlyph || 0;
  const totalGlyphs = progress.totalGlyphs || 0;
  const progressPercent = progress.progress || 0;
  const stage = progress.stage || 'publishing';
  
  return (
    <View style={publishingStyles.progressContainer}>
      <Text style={publishingStyles.progressTitle}>
        {stage === 'preparing' && '📋 Preparing content...'}
        {stage === 'processing' && '🔄 Processing glyphs...'}
        {stage === 'publishing' && `📤 Publishing glyph ${currentGlyph}/${totalGlyphs}...`}
        {stage === 'creating_scroll' && '📜 Creating scroll manifest...'}
        {stage === 'completed' && '✅ Publishing complete!'}
        {stage === 'failed' && '❌ Publishing failed'}
        {!['preparing', 'processing', 'publishing', 'creating_scroll', 'completed', 'failed'].includes(stage) && 
         `📤 Publishing glyph ${currentGlyph}/${totalGlyphs}...`}
      </Text>
      
      <View style={publishingStyles.progressBarContainer}>
        <View 
          style={[
            publishingStyles.progressBar,
            { width: `${Math.max(0, Math.min(100, progressPercent))}%` }
          ]}
        />
      </View>
      
      <Text style={publishingStyles.progressText}>
        {progressPercent}% Complete
      </Text>
      
      {progress.compressionStats && (
        <Text style={publishingStyles.compressionText}>
          💾 Compressed {progress.compressionStats.percentSaved}% 
          ({progress.compressionStats.spaceSaved} bytes saved)
        </Text>
      )}
    </View>
  );
};

// Character count: 1585