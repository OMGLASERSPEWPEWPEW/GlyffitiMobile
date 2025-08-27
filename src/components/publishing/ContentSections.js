// src/components/publishing/ContentSections.js
// Path: src/components/publishing/ContentSections.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
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
      
      {/* Published Content - ENHANCED WITH MANIFEST DETAILS */}
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
          {publishedContent
            .filter(item => item.type !== 'social_post' && !item.socialPost)
            .map((item, index) => {
              const m = normalizeManifest(item.manifest);
              return (
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

                    {/* Glyph information */}
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

                    {/* ===== Manifest Details: printed inline, no modal ===== */}
                    <View style={[
                      styles.manifestBox,
                      { borderColor: isDarkMode ? '#374151' : '#d7dee5', backgroundColor: isDarkMode ? '#0b3b2f' : '#f1fff5' }
                    ]}>
                      <Text style={[
                        styles.manifestTitle,
                        { color: isDarkMode ? '#e5e7eb' : '#1a1a1a' }
                      ]}>
                        Manifest
                      </Text>

                      {/* Friendly rows */}
                      <KV label="storyId" value={item.contentId || item.id || m.storyId || '—'} mono isDarkMode={isDarkMode} />
                      <KV label="author" value={item.authorName || m.author || '—'} isDarkMode={isDarkMode} />
                      <KV label="manifestRoot" value={shorten(m.manifestRoot)} mono isDarkMode={isDarkMode} />
                      <KV label="protocol" value={m.protocol || '—'} isDarkMode={isDarkMode} />
                      <KV label="version" value={m.version || '—'} isDarkMode={isDarkMode} />
                      <KV label="totalContentChunks" value={String(m.totalContentChunks ?? '—')} isDarkMode={isDarkMode} />
                      <KV label="totalHashListChunks" value={String(m.totalHashListChunks ?? '—')} isDarkMode={isDarkMode} />
                      <KV label="contentLength" value={String(m.contentLength ?? '—')} isDarkMode={isDarkMode} />
                      <KV label="estimatedReadTime" value={String(m.estimatedReadTime ?? '—')} isDarkMode={isDarkMode} />
                      <KV label="createdAt" value={m.createdAt ? new Date(m.createdAt).toLocaleString() : '—'} isDarkMode={isDarkMode} />
                      <KV label="publishedAt" value={m.publishedAt ? new Date(m.publishedAt).toLocaleString() : (item.publishedAt ? new Date(item.publishedAt).toLocaleString() : '—')} isDarkMode={isDarkMode} />
                      {m.tags?.length ? <KV label="tags" value={m.tags.join(', ')} isDarkMode={isDarkMode} /> : null}
                      {(m.language || m.genre) ? <KV label="language/genre" value={`${m.language || '—'} / ${m.genre || '—'}`} isDarkMode={isDarkMode} /> : null}

                      {/* Chunk list */}
                      {m.chunks && m.chunks.length > 0 && (
                        <View style={styles.chunkList}>
                          <Text style={[
                            styles.chunkListTitle,
                            { color: isDarkMode ? '#e5e7eb' : '#1a1a1a' }
                          ]}>
                            Chunks
                          </Text>
                          <ScrollView style={{ maxHeight: 140 }} nestedScrollEnabled>
                            {m.chunks.map((c, idx) => (
                              <View key={`${idx}-${c.transactionId || c.txId || c.signature || c}`} style={styles.chunkRow}>
                                <Text style={[styles.mono, styles.chunkIdx, { color: isDarkMode ? '#cbd5e1' : '#334155' }]}>
                                  #{c.index ?? idx}
                                </Text>
                                <View style={{ flex: 1 }}>
                                  <Text style={[styles.mono, { color: isDarkMode ? '#cbd5e1' : '#334155' }]} numberOfLines={1}>
                                    tx: {shorten(c.transactionId || c.txId || c.signature || c)}
                                  </Text>
                                  {c.hash ? (
                                    <Text style={[styles.mono, styles.hashRow, { color: isDarkMode ? '#93c5fd' : '#1e3a8a' }]} numberOfLines={1}>
                                      hash: {shorten(c.hash)}
                                    </Text>
                                  ) : null}
                                </View>
                              </View>
                            ))}
                          </ScrollView>
                        </View>
                      )}

                      {/* Raw JSON */}
                      <Text style={[
                        styles.rawTitle,
                        { color: isDarkMode ? '#e5e7eb' : '#1a1a1a' }
                      ]}>
                        Raw Manifest JSON
                      </Text>
                      <ScrollView horizontal style={styles.rawBox} nestedScrollEnabled>
                        <Text style={[
                          styles.mono,
                          styles.rawText,
                          { color: isDarkMode ? '#cbd5e1' : '#334155' }
                        ]}>
                          {safeStringify(item.manifest)}
                        </Text>
                      </ScrollView>
                    </View>
                    {/* ===== end Manifest Details ===== */}
                  </Card>
                </TouchableOpacity>
              );
            })}
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
      
    </>
  );
};

/** Inline helpers/components */

function KV({ label, value, mono = false, isDarkMode = false }) {
  return (
    <View style={styles.kvRow}>
      <Text style={[
        styles.kKey,
        { color: isDarkMode ? '#cbd5e1' : '#334155' },
        mono && styles.mono
      ]}>
        {label}
      </Text>
      <Text style={[
        styles.kVal,
        { color: isDarkMode ? '#e5e7eb' : '#0f172a' },
        mono && styles.mono
      ]} numberOfLines={2}>
        {value ?? '—'}
      </Text>
    </View>
  );
}

function shorten(v, left = 10, right = 8) {
  if (!v || typeof v !== 'string') return '—';
  if (v.length <= left + right + 3) return v;
  return `${v.slice(0, left)}...${v.slice(-right)}`;
}

function safeStringify(obj) {
  try { return JSON.stringify(obj, null, 2); }
  catch { return String(obj); }
}

function normalizeManifest(manifest) {
  if (!manifest || typeof manifest !== 'object') {
    return {
      storyId: null,
      author: null,
      manifestRoot: null,
      protocol: null,
      version: null,
      totalContentChunks: null,
      totalHashListChunks: null,
      contentLength: null,
      estimatedReadTime: null,
      createdAt: null,
      publishedAt: null,
      tags: [],
      language: null,
      genre: null,
      chunks: []
    };
  }

  const primary = manifest.primary || manifest.primaryManifest || null;

  const chunks = Array.isArray(manifest.chunks)
    ? manifest.chunks.map((c, idx) => {
        if (typeof c === 'string') {
          return { index: idx, transactionId: c, hash: undefined };
        }
        return {
          index: Number.isInteger(c.index) ? c.index : idx,
          transactionId: c.transactionId || c.txId || c.signature || c.sig || '—',
          hash: c.hash
        };
      })
    : [];

  return {
    storyId: manifest.storyId || manifest.contentId || manifest.id || primary?.storyId || null,
    author: manifest.author || manifest.authorName || manifest.authorUsername || manifest.authorPublicKey || primary?.an || primary?.a || null,
    manifestRoot: manifest.manifestRoot || primary?.mr || null,
    protocol: manifest.protocol || primary?.p || null,
    version: manifest.version || primary?.v || null,
    totalContentChunks: manifest.totalChunks ?? (Array.isArray(manifest.chunks) ? manifest.chunks.length : undefined) ?? primary?.tcc ?? null,
    totalHashListChunks: manifest.totalHashListChunks ?? primary?.thlc ?? null,
    contentLength: manifest.contentLength ?? primary?.cl ?? null,
    estimatedReadTime: (manifest.estimatedReadTime != null ? manifest.estimatedReadTime : null) ?? primary?.et ?? null,
    createdAt: manifest.createdAt ?? primary?.ca ?? null,
    publishedAt: manifest.publishedAt ?? primary?.pa ?? null,
    tags: manifest.tags || primary?.tags || [],
    language: manifest.language || primary?.l || null,
    genre: manifest.genre || primary?.g || null,
    chunks
  };
}

const styles = StyleSheet.create({
  manifestBox: {
    marginTop: spacing.medium,
    padding: spacing.medium,
    borderWidth: 1,
    borderRadius: 8,
  },
  manifestTitle: {
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 6,
  },
  kvRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  kKey: {
    width: 150,
    fontSize: 12,
    opacity: 0.9,
  },
  kVal: {
    flex: 1,
    fontSize: 12,
  },
  mono: {
    fontFamily: 'Menlo',
  },
  chunkList: {
    marginTop: spacing.small,
    paddingTop: spacing.small,
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
  },
  chunkListTitle: {
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 4,
  },
  chunkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
  },
  chunkIdx: {
    width: 40,
    fontSize: 12,
    opacity: 0.8,
  },
  hashRow: {
    opacity: 0.85,
  },
  rawTitle: {
    fontWeight: '700',
    fontSize: 13,
    marginTop: spacing.small,
    marginBottom: 4,
  },
  rawBox: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 8,
    backgroundColor: '#ffffffcc',
  },
  rawText: {
    fontSize: 12,
    lineHeight: 16,
    minWidth: 280,
  },
});
