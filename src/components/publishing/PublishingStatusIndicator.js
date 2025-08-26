// src/components/publishing/PublishingStatusIndicator.js
// Path: src/components/publishing/PublishingStatusIndicator.js

import React, { useEffect } from 'react';
import { View, Text, FlatList, LayoutAnimation } from 'react-native';
import { CheckCircle, Loader2, Circle, FileText, Shield, Zap } from 'lucide-react-native';
import { Card } from '../shared';
import { publishingStatusIndicatorStyles } from '../../styles/publishingStatusIndicatorStyles';
import { getColors, spacing, typography } from '../../styles/tokens';

/**
 * Blueprint & Fill Publishing Status Indicator
 * 
 * Displays a beautiful 3-phase publishing visualization that scales from
 * small stories (grid view) to massive novels (progress bar view).
 * 
 * Based on the 3-tier Manifest Tree Architecture:
 * - Phase 1: Create Story Manifest (single manifestRoot hash)
 * - Phase 2: Secure Content Integrity (hash list chunks)  
 * - Phase 3: Publish Story Content (actual content glyphs)
 * 
 * Features:
 * - Checklist view for all phases
 * - Grid view for small stories (<50 chunks)
 * - Progress bar view for large stories (>=50 chunks)
 * - Smooth animations between states
 * - Theme-aware styling
 */

// Phase definitions for the publishing process
const PHASES = [
  { 
    key: 'manifest', 
    label: 'Create Story Manifest',
    icon: FileText,
    description: 'Establishing story identity...'
  },
  { 
    key: 'hashlist', 
    label: 'Secure Content Integrity',
    icon: Shield, 
    description: 'Building cryptographic proofs...'
  },
  { 
    key: 'content', 
    label: 'Publish Story Content',
    icon: Zap,
    description: 'Publishing content to blockchain...'
  }
];

export const PublishingStatusIndicator = ({ 
  progress = {}, 
  isDarkMode = false 
}) => {
  // Get theme-aware colors
  const colors = getColors(isDarkMode);
  const styles = publishingStatusIndicatorStyles(isDarkMode);

  // Extract progress data with defaults
  const {
    phase = 'manifest',
    current = 0,
    total = 0,
    message = '',
    publicationPackage = null
  } = progress;

  // Calculate total content chunks for grid/progress bar decision
  const totalContentChunks = publicationPackage?.summary?.totalChunks || 
                            publicationPackage?.contentChunks?.length || 0;

  // Enable smooth animations when progress changes
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [phase, current, total]);

  // Determine phase status (pending, active, complete)
  const getPhaseStatus = (phaseKey) => {
    const phaseIndex = PHASES.findIndex(p => p.key === phaseKey);
    const currentPhaseIndex = PHASES.findIndex(p => p.key === phase);
    
    if (phaseIndex < currentPhaseIndex) return 'complete';
    if (phaseIndex === currentPhaseIndex) return 'active';
    return 'pending';
  };

  // Render phase status icon
  const renderPhaseIcon = (phaseData, status) => {
    const iconSize = 20;
    let iconColor = colors.textSecondary;
    let IconComponent = Circle;

    switch (status) {
      case 'complete':
        IconComponent = CheckCircle;
        iconColor = colors.success;
        break;
      case 'active':
        IconComponent = Loader2;
        iconColor = colors.primary;
        break;
      case 'pending':
      default:
        IconComponent = Circle;
        iconColor = colors.textSecondary;
        break;
    }

    return (
      <View style={styles.iconContainer}>
        <IconComponent 
          size={iconSize} 
          color={iconColor}
          // Add rotation animation for active loader
          style={status === 'active' ? { 
            transform: [{ 
              rotate: status === 'active' ? '45deg' : '0deg' 
            }] 
          } : undefined}
        />
      </View>
    );
  };

  // Render individual glyph box for grid view
  const renderGlyphBox = ({ item, index }) => {
    // Calculate if this glyph is "published" based on current progress
    // For content phase: current represents glyphs published
    // For earlier phases: all glyphs are "unpublished" until content phase
    // src/components/publishing/PublishingStatusIndicator.js
    const manifestAndHashListSteps = 1 + (publicationPackage?.hashListChunks?.length || 0);
    const completedGlyphs = current - manifestAndHashListSteps;
    const isPublished = phase === 'content' && index < completedGlyphs;
    
    return (
      <View 
        style={[
          styles.glyphBox,
          isPublished && styles.glyphBoxComplete
        ]}
        accessibilityLabel={`Glyph ${index + 1} ${isPublished ? 'published' : 'pending'}`}
      />
    );
  };

  // Render the checklist of phases
  const renderPhaseChecklist = () => (
    <View style={styles.checklistContainer}>
      {PHASES.map((phaseData) => {
        const status = getPhaseStatus(phaseData.key);
        
        return (
          <View key={phaseData.key} style={styles.phaseRow}>
            {renderPhaseIcon(phaseData, status)}
            
            <View style={styles.phaseLabelContainer}>
              <Text 
                style={[
                  styles.phaseLabel,
                  status === 'complete' && styles.phaseLabelComplete,
                  status === 'active' && styles.phaseLabelActive,
                  status === 'pending' && styles.phaseLabelPending
                ]}
                accessibilityRole="text"
              >
                {phaseData.label}
              </Text>
              
              {status === 'active' && (
                <Text style={styles.phaseDescription}>
                  {message || phaseData.description}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );

  // Render content progress visualization (grid or progress bar)
  const renderContentProgress = () => {
    // Only show during content phase
    if (phase !== 'content' || totalContentChunks === 0) {
      return null;
    }

    // Use grid view for small stories, progress bar for large ones
    const useGridView = totalContentChunks < 50;

    if (useGridView) {
      // Grid View: Show individual boxes for each glyph
      const glyphData = Array.from({ length: totalContentChunks }, (_, i) => ({ id: i }));
      
      return (
        <View style={styles.contentProgressContainer}>
          <Text style={styles.contentProgressTitle}>
            Content Progress ({current}/{totalContentChunks})
          </Text>
          
          <View style={styles.glyphGridContainer}>
            <FlatList
              data={glyphData}
              renderItem={renderGlyphBox}
              numColumns={Math.min(8, Math.ceil(Math.sqrt(totalContentChunks)))}
              key={totalContentChunks} // Force re-render if chunk count changes
              scrollEnabled={false}
              contentContainerStyle={styles.glyphGridContent}
              columnWrapperStyle={totalContentChunks > Math.min(8, Math.ceil(Math.sqrt(totalContentChunks))) ? 
                styles.glyphGridRow : undefined}
            />
          </View>
        </View>
      );
    } else {
      // Progress Bar View: Show traditional progress bar for large stories
      const progressPercentage = Math.round((current / totalContentChunks) * 100);
      
      return (
        <View style={styles.contentProgressContainer}>
          <Text style={styles.contentProgressTitle}>
            Publishing Content
          </Text>
          
          <View style={styles.largeProgressBarContainer}>
            <View style={styles.largeProgressBarBackground}>
              <View 
                style={[
                  styles.largeProgressBarFill,
                  { width: `${Math.max(0, Math.min(100, progressPercentage))}%` }
                ]}
              />
            </View>
            
            <Text style={styles.largeProgressBarText}>
              {current} of {totalContentChunks} glyphs published ({progressPercentage}%)
            </Text>
          </View>
        </View>
      );
    }
  };

  return (
    <Card
      isDarkMode={isDarkMode}
      elevation="low"
      variant="default"
      style={styles.container}
    >
      {/* Phase Checklist */}
      {renderPhaseChecklist()}
      
      {/* Content Progress Visualization */}
      {renderContentProgress()}
      
      {/* Debug Info (remove in production) */}
      {__DEV__ && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>
            Phase: {phase} | Progress: {current}/{total} | Chunks: {totalContentChunks}
          </Text>
        </View>
      )}
    </Card>
  );
};

export default PublishingStatusIndicator;

// Character count: 6,847