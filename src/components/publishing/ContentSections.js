// src/components/publishing/ContentSections.js
// Path: src/components/publishing/ContentSections.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card, Button } from '../shared';
import { publishingStyles } from '../../styles/publishingStyles';
import { spacing } from '../../styles/tokens';

export const ContentSections = ({ 
  inProgressContent = [], 
  drafts = [], 
  publishedContent = [], 
  publishingStats,
  walletStatus,
  publishing,
  handleResumePublishing,
  handleViewStory, // New prop for viewing published stories
  isDarkMode = false
}) => {
  return (
    <>
      {/* In Progress Content */}
      {inProgressContent.length > 0 && (
        <Card
          isDarkMode={isDarkMode}
          borderRadius={12}
          padding={spacing.medium}
          marginBottom={spacing.medium}
          marginHorizontal={0}
        >
          <Text style={[
            publishingStyles.sectionTitle,
            { color: isDarkMode ? '#e5e7eb' : '#1a1a1a' }
          ]}>
            ⚠️ In Progress ({inProgressContent.length})
          </Text>
          {inProgressContent.map((item, index) => (
            <Card
              key={`inprogress-${item.contentId || index}`}
              backgroundColor={isDarkMode ? '#374151' : '#f8f9fa'}
              borderRadius={8}
              padding={spacing.medium}
              marginBottom={spacing.medium}
              marginHorizontal={0}
              borderWidth={0}
              style={[
                publishingStyles.contentItemCard,
                { borderLeftColor: isDarkMode ? '#3b82f6' : '#007bff' }
              ]}
            >
              <Text style={[
                publishingStyles.contentTitle,
                { color: isDarkMode ? '#e5e7eb' : '#1a1a1a' }
              ]}>
                {item.title || 'Untitled'}
              </Text>
              <Text style={[
                publishingStyles.contentMeta,
                { color: isDarkMode ? '#9ca3af' : '#6c757d' }
              ]}>
                {item.successfulGlyphs || 0}/{item.totalGlyphs || item.glyphs?.length || 0} glyphs published
              </Text>
              {item.lastUpdated && (
                <Text style={[
                  publishingStyles.contentDate,
                  { color: isDarkMode ? '#9ca3af' : '#868e96' }
                ]}>
                  Last updated: {new Date(item.lastUpdated).toLocaleDateString()}
                </Text>
              )}
              <Button
                title={walletStatus !== 'unlocked' ? '🔒 Unlock to Resume' : '▶️ Resume Publishing'}
                onPress={() => handleResumePublishing(item.contentId || item.id)}
                disabled={publishing || walletStatus !== 'unlocked'}
                variant={walletStatus !== 'unlocked' ? 'secondary' : 'primary'}
                size="medium"
                isDarkMode={isDarkMode}
                style={publishingStyles.resumeButton}
              />
            </Card>
          ))}
        </Card>
      )}
      
      {/* Drafts */}
      {drafts.length > 0 && (
        <Card
          isDarkMode={isDarkMode}
          borderRadius={12}
          padding={spacing.medium}
          marginBottom={spacing.medium}
          marginHorizontal={0}
        >
          <Text style={[
            publishingStyles.sectionTitle,
            { color: isDarkMode ? '#e5e7eb' : '#1a1a1a' }
          ]}>
            📝 Drafts ({drafts.length})
          </Text>
          {drafts.map((draft, index) => (
            <Card
              key={`draft-${draft.id || index}`}
              backgroundColor={isDarkMode ? '#374151' : '#f8f9fa'}
              borderRadius={8}
              padding={spacing.medium}
              marginBottom={spacing.medium}
              marginHorizontal={0}
              borderWidth={0}
              style={[
                publishingStyles.contentItemCard,
                { borderLeftColor: isDarkMode ? '#3b82f6' : '#007bff' }
              ]}
            >
              <Text style={[
                publishingStyles.contentTitle,
                { color: isDarkMode ? '#e5e7eb' : '#1a1a1a' }
              ]}>
                {draft.title || 'Untitled Draft'}
              </Text>
              <Text style={[
                publishingStyles.contentMeta,
                { color: isDarkMode ? '#9ca3af' : '#6c757d' }
              ]}>
                {draft.content?.length || 0} characters
              </Text>
              {draft.lastUpdated && (
                <Text style={[
                  publishingStyles.contentDate,
                  { color: isDarkMode ? '#9ca3af' : '#868e96' }
                ]}>
                  Last updated: {new Date(draft.lastUpdated).toLocaleDateString()}
                </Text>
              )}
            </Card>
          ))}
        </Card>
      )}
      
      {/* Published Content - ENHANCED WITH BETTER DISPLAY */}
      {publishedContent.length > 0 && (
        <Card
          isDarkMode={isDarkMode}
          borderRadius={12}
          padding={spacing.medium}
          marginBottom={spacing.medium}
          marginHorizontal={0}
        >
          <Text style={[
            publishingStyles.sectionTitle,
            { color: isDarkMode ? '#e5e7eb' : '#1a1a1a' }
          ]}>
            ✅ Published ({publishedContent.length})
          </Text>
          <Text style={[
            publishingStyles.sectionSubtitle,
            { color: isDarkMode ? '#9ca3af' : '#6c757d' }
          ]}>
            Tap any story to read it
          </Text>
          {publishedContent.map((item, index) => (
            <TouchableOpacity 
              key={`published-${item.contentId || index}`}
              onPress={() => handleViewStory && handleViewStory(item)}
              activeOpacity={0.7}
            >
              <Card
                backgroundColor={isDarkMode ? '#065f46' : '#f8fff9'}
                borderRadius={8}
                padding={spacing.medium}
                marginBottom={spacing.medium}
                marginHorizontal={0}
                borderWidth={0}
                style={[
                  publishingStyles.contentItemCard,
                  { borderLeftColor: isDarkMode ? '#10b981' : '#28a745' }
                ]}
              >
                <View style={publishingStyles.publishedContentHeader}>
                  <Text style={[
                    publishingStyles.contentTitle,
                    { color: isDarkMode ? '#e5e7eb' : '#1a1a1a' }
                  ]}>
                    {item.title || 'Untitled Story'}
                  </Text>
                  <Text style={publishingStyles.viewStoryIcon}>👁️</Text>
                </View>
                
                {/* Author info */}
                {item.authorName && (
                  <Text style={[
                    publishingStyles.authorText,
                    { color: isDarkMode ? '#9ca3af' : '#495057' }
                  ]}>
                    by {item.authorName}
                  </Text>
                )}

                {/* Glyph information - RESTORED */}
                {(item.totalGlyphs || item.successfulGlyphs || item.glyphs?.length) && (
                  <Text style={[
                    publishingStyles.contentMeta,
                    { color: isDarkMode ? '#9ca3af' : '#6c757d' }
                  ]}>
                    {item.successfulGlyphs || item.totalGlyphs || item.glyphs?.length || 0} glyphs published
                  </Text>
                )}
                
                {/* Scroll ID */}
                {item.scrollId && (
                  <Text style={[
                    publishingStyles.scrollId,
                    { 
                      color: isDarkMode ? '#9ca3af' : '#6c757d',
                      backgroundColor: isDarkMode ? '#6b7280' : '#e9ecef'
                    }
                  ]}>
                    ID: {item.scrollId.slice(0, 8)}...
                  </Text>
                )}
                
                {/* Published date */}
                {item.publishedAt && (
                  <Text style={[
                    publishingStyles.publishedDate,
                    { color: isDarkMode ? '#9ca3af' : '#495057' }
                  ]}>
                    Published: {new Date(item.publishedAt).toLocaleDateString()}
                  </Text>
                )}
                
                {/* Content preview */}
                {item.contentPreview && (
                  <Text style={[
                    publishingStyles.contentPreview,
                    { color: isDarkMode ? '#9ca3af' : '#6c757d' }
                  ]}>
                    {item.contentPreview}
                  </Text>
                )}
                
                {/* Publishing status indicators */}
                {item.status && (
                  <View style={publishingStyles.statusRow}>
                    <View style={[
                      publishingStyles.statusIndicator,
                      { backgroundColor: isDarkMode ? '#1e40af' : '#e7f3ff' }
                    ]}>
                      <Text style={[
                        publishingStyles.statusText,
                        { color: isDarkMode ? '#93c5fd' : '#0066cc' }
                      ]}>
                        {item.status}
                      </Text>
                    </View>
                    {item.glyphCount && (
                      <View style={[
                        publishingStyles.statusIndicator,
                        { backgroundColor: isDarkMode ? '#065f46' : '#e7f5e7' }
                      ]}>
                        <Text style={[
                          publishingStyles.statusText,
                          { color: isDarkMode ? '#34d399' : '#28a745' }
                        ]}>
                          {item.glyphCount} glyphs
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          ))}
          <Text style={[
            publishingStyles.publishedNote,
            { color: isDarkMode ? '#9ca3af' : '#6c757d' }
          ]}>
            Once published, you can tap them to read and share.
          </Text>
        </Card>
      )}
      
      {/* Publishing Statistics */}
      {publishingStats && (
        <Card
          isDarkMode={isDarkMode}
          borderRadius={12}
          padding={spacing.medium}
          marginBottom={spacing.medium}
          marginHorizontal={0}
        >
          <Text style={[
            publishingStyles.statsTitle,
            { color: isDarkMode ? '#e5e7eb' : '#1a1a1a' }
          ]}>
            📊 Publishing Statistics
          </Text>
          <View style={publishingStyles.statsGrid}>
            <View style={publishingStyles.statItem}>
              <Text style={[
                publishingStyles.statNumber,
                { color: isDarkMode ? '#e5e7eb' : '#1a1a1a' }
              ]}>
                {publishingStats.totalPublished || 0}
              </Text>
              <Text style={[
                publishingStyles.statLabel,
                { color: isDarkMode ? '#9ca3af' : '#6c757d' }
              ]}>
                Published
              </Text>
            </View>
            <View style={publishingStyles.statItem}>
              <Text style={[
                publishingStyles.statNumber,
                { color: isDarkMode ? '#e5e7eb' : '#1a1a1a' }
              ]}>
                {publishingStats.totalGlyphs || 0}
              </Text>
              <Text style={[
                publishingStyles.statLabel,
                { color: isDarkMode ? '#9ca3af' : '#6c757d' }
              ]}>
                Glyphs
              </Text>
            </View>
            <View style={publishingStyles.statItem}>
              <Text style={[
                publishingStyles.statNumber,
                { color: isDarkMode ? '#e5e7eb' : '#1a1a1a' }
              ]}>
                {publishingStats.successRate || 100}%
              </Text>
              <Text style={[
                publishingStyles.statLabel,
                { color: isDarkMode ? '#9ca3af' : '#6c757d' }
              ]}>
                Success Rate
              </Text>
            </View>
            <View style={publishingStyles.statItem}>
              <Text style={[
                publishingStyles.statNumber,
                { color: isDarkMode ? '#e5e7eb' : '#1a1a1a' }
              ]}>
                {(publishingStats.totalCost || 0).toFixed(4)}
              </Text>
              <Text style={[
                publishingStyles.statLabel,
                { color: isDarkMode ? '#9ca3af' : '#6c757d' }
              ]}>
                SOL Spent
              </Text>
            </View>
          </View>
        </Card>
      )}
      
      {/* Debug Info (only in development) */}
      {__DEV__ && (
        <Card
          isDarkMode={isDarkMode}
          borderRadius={12}
          padding={spacing.medium}
          marginBottom={spacing.medium}
          marginHorizontal={0}
        >
          <Text style={[
            publishingStyles.debugTitle,
            { color: isDarkMode ? '#e5e7eb' : '#1a1a1a' }
          ]}>
            🔧 Debug Info
          </Text>
          <Text style={[
            publishingStyles.debugText,
            { color: isDarkMode ? '#9ca3af' : '#6c757d' }
          ]}>
            In Progress: {inProgressContent.length}
          </Text>
          <Text style={[
            publishingStyles.debugText,
            { color: isDarkMode ? '#9ca3af' : '#6c757d' }
          ]}>
            Drafts: {drafts.length}
          </Text>
          <Text style={[
            publishingStyles.debugText,
            { color: isDarkMode ? '#9ca3af' : '#6c757d' }
          ]}>
            Published: {publishedContent.length}
          </Text>
          <Text style={[
            publishingStyles.debugText,
            { color: isDarkMode ? '#9ca3af' : '#6c757d' }
          ]}>
            Publishing: {publishing ? 'Yes' : 'No'}
          </Text>
          <Text style={[
            publishingStyles.debugText,
            { color: isDarkMode ? '#9ca3af' : '#6c757d' }
          ]}>
            Wallet: {walletStatus}
          </Text>
        </Card>
      )}
    </>
  );
};

// Character count: 8542