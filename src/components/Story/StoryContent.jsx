// src/components/Story/StoryContent.jsx
// Path: src/components/Story/StoryContent.jsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../styles';

/**
 * Component for rendering story content with proper formatting
 * Handles markdown-like formatting and progressive loading states
 */
const StoryContent = ({
  content,
  fontSize = 16,
  isDarkMode = false,
  isComplete = false,
  isLoading = false,
  manifest = null
}) => {
  
  // Process content for display
  const processedContent = useMemo(() => {
    if (!content) return '';
    
    // Basic text processing - can be enhanced later
    let processed = content;
    
    // Remove loading placeholder text if present
    processed = processed.replace(/\n\n\[Loading additional content\.\.\.\]\n\n/g, '');
    
    // Basic paragraph separation
    processed = processed.replace(/\n\n/g, '\n\n');
    
    // Remove excessive whitespace
    processed = processed.replace(/\n{3,}/g, '\n\n');
    
    return processed.trim();
  }, [content]);

  // Split content into paragraphs for better rendering
  const paragraphs = useMemo(() => {
    if (!processedContent) return [];
    
    return processedContent
      .split('\n\n')
      .filter(paragraph => paragraph.trim().length > 0)
      .map(paragraph => paragraph.trim());
  }, [processedContent]);

  // Calculate reading progress
  const readingProgress = useMemo(() => {
    if (!manifest) return null;
    
    const wordCount = processedContent.split(/\s+/).length;
    const estimatedWordsPerMinute = 200;
    const estimatedReadingTime = Math.ceil(wordCount / estimatedWordsPerMinute);
    
    return {
      wordCount,
      estimatedReadingTime,
      paragraphs: paragraphs.length
    };
  }, [processedContent, paragraphs.length, manifest]);

  // Dynamic styles based on props
  const contentStyles = [
    styles.contentText,
    {
      fontSize: fontSize,
      lineHeight: fontSize * 1.6,
      color: isDarkMode ? colors.textDark : colors.text,
    }
  ];

  const paragraphStyles = [
    styles.paragraph,
    {
      marginBottom: spacing.medium,
    }
  ];

  // Render loading state
  if (!content && isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[
          styles.loadingText,
          { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
        ]}>
          Loading story content...
        </Text>
        {manifest && (
          <Text style={[
            styles.storyInfo,
            { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
          ]}>
            "{manifest.title}" by {manifest.author}
          </Text>
        )}
      </View>
    );
  }

  // Render empty state
  if (!content && !isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[
          styles.emptyText,
          { color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary }
        ]}>
          No content available
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Story Title */}
      {manifest && (
        <View style={styles.titleContainer}>
          <Text style={[
            styles.title,
            {
              fontSize: fontSize + 8,
              color: isDarkMode ? colors.textDark : colors.text,
            }
          ]}>
            {manifest.title}
          </Text>
          
          <Text style={[
            styles.author,
            {
              fontSize: fontSize - 2,
              color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary,
            }
          ]}>
            by {manifest.author}
          </Text>
          
          {readingProgress && (
            <Text style={[
              styles.readingInfo,
              {
                fontSize: fontSize - 4,
                color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary,
              }
            ]}>
              {readingProgress.wordCount} words • {readingProgress.estimatedReadingTime} min read
            </Text>
          )}
        </View>
      )}

      {/* Story Content */}
      <View style={styles.contentContainer}>
        {paragraphs.map((paragraph, index) => (
          <Text
            key={index}
            style={[contentStyles, paragraphStyles]}
            selectable={true}
          >
            {paragraph}
          </Text>
        ))}
        
        {/* Loading indicator if still loading */}
        {isLoading && !isComplete && (
          <View style={styles.loadingMoreContainer}>
            <Text style={[
              styles.loadingMoreText,
              {
                fontSize: fontSize - 2,
                color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary,
              }
            ]}>
              Loading more content...
            </Text>
            <View style={[
              styles.loadingDots,
              { backgroundColor: isDarkMode ? colors.accentDark : colors.accent }
            ]} />
          </View>
        )}
        
        {/* Completion indicator */}
        {isComplete && (
          <View style={styles.completionContainer}>
            <Text style={[
              styles.completionText,
              {
                fontSize: fontSize - 2,
                color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary,
              }
            ]}>
              • • •
            </Text>
            <Text style={[
              styles.completionSubtext,
              {
                fontSize: fontSize - 4,
                color: isDarkMode ? colors.textSecondaryDark : colors.textSecondary,
              }
            ]}>
              Story complete
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    marginBottom: spacing.large,
    paddingBottom: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontFamily: typography.fontFamilyBold,
    marginBottom: spacing.small,
    textAlign: 'left',
  },
  author: {
    fontFamily: typography.fontFamily,
    fontStyle: 'italic',
    marginBottom: spacing.extraSmall,
  },
  readingInfo: {
    fontFamily: typography.fontFamily,
    opacity: 0.7,
  },
  contentContainer: {
    flex: 1,
  },
  contentText: {
    fontFamily: typography.fontFamily,
    textAlign: 'left',
  },
  paragraph: {
    // marginBottom applied dynamically
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.extraLarge,
  },
  loadingText: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    marginBottom: spacing.small,
  },
  storyInfo: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.extraLarge,
  },
  emptyText: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
  },
  loadingMoreContainer: {
    alignItems: 'center',
    paddingVertical: spacing.large,
    marginTop: spacing.medium,
  },
  loadingMoreText: {
    fontFamily: typography.fontFamily,
    marginBottom: spacing.small,
  },
  loadingDots: {
    width: 40,
    height: 3,
    borderRadius: 1.5,
    opacity: 0.6,
  },
  completionContainer: {
    alignItems: 'center',
    paddingVertical: spacing.large,
    marginTop: spacing.large,
  },
  completionText: {
    fontFamily: typography.fontFamily,
    marginBottom: spacing.extraSmall,
    opacity: 0.7,
  },
  completionSubtext: {
    fontFamily: typography.fontFamily,
    opacity: 0.5,
  },
});

export default StoryContent;

// 2,065 characters