// src/components/publishing/ProgressBar.js
// Path: src/components/publishing/ProgressBar.js

import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../shared';
import { getContentStyles, createTitleStyle } from '../../styles/components/content';
import { getCardStyles } from '../../styles/components/cards';
import { spacing, lightColors, darkColors } from '../../styles/tokens';

export const ProgressBar = ({ publishing, progress, isDarkMode = false }) => {
  if (!publishing || !progress) {
    return null;
  }
  
  const currentGlyph = progress.currentGlyph || 0;
  const totalGlyphs = progress.totalGlyphs || 0;
  const progressPercent = progress.progress || 0;
  const stage = progress.stage || 'publishing';
  
  // Get theme-aware styles
  const contentStyles = getContentStyles(isDarkMode);
  const cardStyles = getCardStyles(isDarkMode);
  
  // Progress bar colors using design tokens
  const progressColors = {
    background: isDarkMode ? darkColors.backgroundSecondary : lightColors.backgroundSecondary,
    fill: isDarkMode ? darkColors.success : lightColors.success,
  };

  // Status message based on stage
  const getStatusMessage = () => {
    switch (stage) {
      case 'preparing':
        return '📋 Preparing content...';
      case 'processing':
        return '🔄 Processing glyphs...';
      case 'publishing':
        return `📤 Publishing glyph ${currentGlyph}/${totalGlyphs}...`;
      case 'creating_scroll':
        return '📜 Creating scroll manifest...';
      case 'completed':
        return '✅ Publishing complete!';
      case 'failed':
        return '❌ Publishing failed';
      default:
        return `📤 Publishing glyph ${currentGlyph}/${totalGlyphs}...`;
    }
  };

  return (
    <Card
      isDarkMode={isDarkMode}
      borderRadius={8}
      padding={spacing.medium}
      marginBottom={spacing.medium}
      marginHorizontal={0}
    >
      {/* Progress Title using content styles */}
      <Text style={[
        createTitleStyle('small', isDarkMode),
        {
          marginBottom: spacing.medium,
          fontSize: 16,
          fontWeight: '600',
        }
      ]}>
        {getStatusMessage()}
      </Text>
      
      {/* Progress Bar Container */}
      <View style={{
        height: 8,
        backgroundColor: progressColors.background,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: spacing.small,
      }}>
        {/* Progress Bar Fill */}
        <View style={{
          height: '100%',
          width: `${Math.max(0, Math.min(100, progressPercent))}%`,
          backgroundColor: progressColors.fill,
          borderRadius: 4,
          // Smooth transition animation would go here in a real app
        }} />
      </View>
      
      {/* Progress Percentage Text */}
      <Text style={[
        {
          color: contentStyles.secondaryText.color,
          fontSize: 14,
          fontWeight: '500',
          marginBottom: spacing.small,
        }
      ]}>
        {progressPercent}% Complete
      </Text>
      
      {/* Compression Stats (if available) */}
      {progress.compressionStats && (
        <Text style={[
          {
            color: contentStyles.secondaryText.color,
            fontSize: 13,
            opacity: 0.8,
            fontStyle: 'italic',
          }
        ]}>
          💾 Compressed {progress.compressionStats.percentSaved}% 
          ({progress.compressionStats.spaceSaved} bytes saved)
        </Text>
      )}
    </Card>
  );
};

// Character count: 2,867