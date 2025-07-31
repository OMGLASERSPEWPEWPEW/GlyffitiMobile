// src/components/publishing/ProgressBar.js
// Path: src/components/publishing/ProgressBar.js

import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../shared';
import { getContentStyles } from '../../styles/components/content';
import { getCardStyles } from '../../styles/components/cards';
import { spacing, typography, getColors } from '../../styles/tokens';

export const ProgressBar = ({ publishing, progress, isDarkMode = false }) => {
  if (!publishing || !progress) {
    return null;
  }
  
  const currentGlyph = progress.currentGlyph || 0;
  const totalGlyphs = progress.totalGlyphs || 0;
  const progressPercent = progress.progress || 0;
  const stage = progress.stage || 'publishing';
  
  // Get theme-aware styles
  const colors = getColors(isDarkMode);
  const contentStyles = getContentStyles(isDarkMode);
  const cardStyles = getCardStyles(isDarkMode);
  
  // Progress bar colors using design tokens
  const progressColors = {
    background: colors.backgroundSecondary,
    fill: colors.success,
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

  // Title style - ensuring visibility
  const titleStyle = {
    fontSize: typography.fontSize?.large || 16,
    fontFamily: typography.fontFamilyMedium || typography.fontFamily,
    fontWeight: typography.fontWeight?.semibold || '600',
    color: colors.text, // Use primary text color for maximum visibility
    marginBottom: spacing.medium,
    textAlign: 'center',
    lineHeight: (typography.fontSize?.large || 16) * 1.2,
  };

  // Progress percentage style
  const percentageStyle = {
    fontSize: typography.fontSize?.medium || 14,
    fontFamily: typography.fontFamilyMedium || typography.fontFamily,
    fontWeight: typography.fontWeight?.medium || '500',
    color: colors.textSecondary,
    marginBottom: spacing.small,
    textAlign: 'center',
  };

  // Compression stats style
  const compressionStyle = {
    fontSize: typography.fontSize?.small || 12,
    fontFamily: typography.fontFamily,
    color: colors.textSecondary,
    opacity: 0.8,
    fontStyle: 'italic',
    textAlign: 'center',
  };

  // Progress bar container style
  const progressBarContainerStyle = {
    height: 8,
    backgroundColor: progressColors.background,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.small,
    width: '100%',
  };

  // Progress bar fill style
  const progressBarFillStyle = {
    height: '100%',
    width: `${Math.max(0, Math.min(100, progressPercent))}%`,
    backgroundColor: progressColors.fill,
    borderRadius: 4,
    // Add a subtle transition for smooth progress updates
    transition: 'width 0.3s ease-in-out',
  };

  return (
    <Card
      isDarkMode={isDarkMode}
      elevation="low"
      variant="default"
      style={{
        marginBottom: spacing.medium,
        marginHorizontal: 0,
        paddingHorizontal: spacing.medium,
        paddingVertical: spacing.medium,
      }}
    >
      {/* Progress Title - Made more prominent */}
      <Text 
        style={titleStyle}
        accessibilityLabel={`Publishing status: ${getStatusMessage()}`}
        accessibilityRole="text"
      >
        {getStatusMessage()}
      </Text>
      
      {/* Progress Bar Container */}
      <View 
        style={progressBarContainerStyle}
        accessibilityLabel={`Progress bar at ${progressPercent} percent`}
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: progressPercent
        }}
      >
        {/* Progress Bar Fill */}
        <View style={progressBarFillStyle} />
      </View>
      
      {/* Progress Percentage Text */}
      <Text 
        style={percentageStyle}
        accessibilityLabel={`${progressPercent} percent complete`}
      >
        {progressPercent}% Complete
      </Text>
      
      {/* Glyph Count Display - Extra visibility for debugging */}
      {stage === 'publishing' && totalGlyphs > 0 && (
        <Text 
          style={[
            percentageStyle,
            { 
              fontSize: typography.fontSize?.medium || 14,
              color: colors.text, // Use primary text for better visibility
              marginBottom: spacing.small,
            }
          ]}
          accessibilityLabel={`Publishing glyph ${currentGlyph} of ${totalGlyphs}`}
        >
          Glyph {currentGlyph} of {totalGlyphs}
        </Text>
      )}
      
      {/* Compression Stats (if available) */}
      {progress.compressionStats && (
        <Text 
          style={compressionStyle}
          accessibilityLabel={`Compression saved ${progress.compressionStats.percentSaved} percent, ${progress.compressionStats.spaceSaved} bytes`}
        >
          💾 Compressed {progress.compressionStats.percentSaved}% 
          ({progress.compressionStats.spaceSaved} bytes saved)
        </Text>
      )}
    </Card>
  );
};

// Character count: 4,847