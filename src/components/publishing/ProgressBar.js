// src/components/publishing/ProgressBar.js
import React from 'react';
import { View, Text } from 'react-native';
import { publishingStyles } from '../../styles/publishingStyles';

export const ProgressBar = ({ publishing, progress }) => {
  if (!publishing || !progress) return null;
  
  return (
    <View style={publishingStyles.progressContainer}>
      <Text style={publishingStyles.progressTitle}>
        {progress.stage === 'preparing' && '📋 Preparing content...'}
        {progress.stage === 'processing' && '🔄 Processing glyphs...'}
        {progress.stage === 'publishing' && `📤 Publishing glyph ${progress.currentGlyph}/${progress.totalGlyphs}...`}
        {progress.stage === 'completed' && '✅ Publishing complete!'}
        {progress.stage === 'failed' && '❌ Publishing failed'}
      </Text>
      
      <View style={publishingStyles.progressBar}>
        <View 
          style={[
            publishingStyles.progressFill,
            { width: `${progress.progress}%` }
          ]}
        />
      </View>
      
      <Text style={publishingStyles.progressText}>
        {progress.progress}% Complete
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

// Character count: 1158