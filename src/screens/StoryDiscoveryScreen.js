// src/screens/StoryDiscoveryScreen.js
// Path: src/screens/StoryDiscoveryScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity,
  StatusBar,
  Alert
} from 'react-native';
import { ArrowLeft, Search, Filter } from 'lucide-react-native';
import StoryDiscoveryList from '../components/Story/StoryDiscoveryList';
import { colors, spacing, typography } from '../styles/tokens';
import { storyDiscoveryStyles } from '../styles/storyDiscoveryStyles';
import { FormField, TextInput, ErrorBoundary, ErrorDisplay, RetryButton } from '../components/shared';

/**
 * Screen for discovering and browsing stories
 * Includes search, filtering, and navigation to story viewer with error boundary integration
 */
export const StoryDiscoveryScreen = ({ navigation, route }) => {
  const { showCachedOnly = false } = route.params || {};
  
  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [isDarkMode, setIsDarkMode] = useState(false); // You can connect this to your theme system
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Error state management
  const [loadingError, setLoadingError] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [navigationError, setNavigationError] = useState(null);

  // Handle story selection - navigate to story viewer with error handling
  const handleStorySelect = async (story, isCached) => {
    try {
      console.log('Selected story:', story.storyId, 'Cached:', isCached);
      setNavigationError(null);

      // Validate story data before navigation
      if (!story || !story.storyId) {
        throw new Error('Invalid story data');
      }

      // Validate manifest data
      if (!story.manifest && !isCached) {
        throw new Error('Story manifest is missing');
      }

      navigation.navigate('StoryView', {
        storyId: story.storyId,
        manifest: story,
        autoStart: true
      });

    } catch (error) {
      console.error('❌ Error navigating to story:', error);
      setNavigationError({
        type: 'general',
        message: 'Failed to open story. Please try again.'
      });
      
      Alert.alert(
        'Story Loading Error',
        'There was a problem opening this story. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigation.goBack();
  };

  // Handle search with error handling
  const handleSearchChange = (query) => {
    try {
      setSearchError(null);
      setSearchQuery(query);
    } catch (error) {
      console.error('❌ Search error:', error);
      setSearchError({
        type: 'general',
        message: 'Search failed. Please try again.'
      });
    }
  };

  // Handle sort change with error handling  
  const handleSortChange = (newSortBy) => {
    try {
      setSortBy(newSortBy);
      setShowFilterMenu(false);
      setLoadingError(null); // Clear any loading errors when changing sort
    } catch (error) {
      console.error('❌ Sort change error:', error);
      Alert.alert('Error', 'Failed to change sort order. Please try again.');
    }
  };

  // Handle story list errors
  const handleStoryListError = (error) => {
    console.error('❌ Story list error:', error);
    setLoadingError({
      type: 'network',
      message: 'Failed to load stories. Please check your connection and try again.'
    });
  };

  // Retry loading stories
  const retryLoadStories = () => {
    setLoadingError(null);
    // The StoryDiscoveryList component should handle the retry internally
  };

  // Sort options
  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'author', label: 'Author A-Z' }
  ];

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('StoryDiscoveryScreen error:', error);
        setLoadingError({
          type: 'general',
          message: 'An unexpected error occurred in the discovery screen.'
        });
      }}
      onRetry={() => {
        setLoadingError(null);
        setSearchError(null);
        setNavigationError(null);
      }}
      onFallbackPress={() => navigation.goBack()}
      isDarkMode={isDarkMode}
    >
      <SafeAreaView style={[
        storyDiscoveryStyles.container,
        isDarkMode && storyDiscoveryStyles.containerDark
      ]}>
        <StatusBar 
          barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
          backgroundColor={isDarkMode ? colors.backgroundDark : colors.background}
        />
        
        {/* Header */}
        <View style={[
          storyDiscoveryStyles.header,
          isDarkMode && storyDiscoveryStyles.headerDark
        ]}>
          <TouchableOpacity onPress={handleBack} style={storyDiscoveryStyles.backButton}>
            <ArrowLeft 
              size={24} 
              color={isDarkMode ? colors.textDark : colors.text} 
            />
          </TouchableOpacity>
          
          <Text style={[
            storyDiscoveryStyles.headerTitle,
            { color: isDarkMode ? colors.textDark : colors.text }
          ]}>
            {showCachedOnly ? 'My Stories' : 'Discover Stories'}
          </Text>
          
          <TouchableOpacity 
            onPress={() => setShowFilterMenu(!showFilterMenu)} 
            style={storyDiscoveryStyles.filterButton}
          >
            <Filter 
              size={24} 
              color={isDarkMode ? colors.textDark : colors.text} 
            />
          </TouchableOpacity>
        </View>

        {/* Loading error display */}
        {loadingError && (
          <ErrorDisplay
            type={loadingError.type}
            title="Loading Error"
            message={loadingError.message}
            onRetry={retryLoadStories}
            isDarkMode={isDarkMode}
            style={storyDiscoveryStyles.loadingErrorContainer}
          />
        )}

        {/* Search Bar */}
        <FormField isDarkMode={isDarkMode} style={storyDiscoveryStyles.searchContainer}>
          <TextInput
            variant="search"
            placeholder="Search stories..."
            value={searchQuery}
            onChangeText={handleSearchChange}
            isDarkMode={isDarkMode}
          />
        </FormField>

        {/* Search error display */}
        {searchError && (
          <ErrorDisplay
            type={searchError.type}
            title="Search Error"
            message={searchError.message}
            onRetry={() => setSearchError(null)}
            showRetry={false}
            isDarkMode={isDarkMode}
            style={storyDiscoveryStyles.searchErrorContainer}
          />
        )}

        {/* Filter Menu */}
        {showFilterMenu && (
          <View style={[
            storyDiscoveryStyles.filterMenu,
            isDarkMode && storyDiscoveryStyles.filterMenuDark
          ]}>
            <Text style={[
              storyDiscoveryStyles.filterLabel,
              { color: isDarkMode ? colors.textDark : colors.text }
            ]}>
              Sort by:
            </Text>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  storyDiscoveryStyles.filterOption,
                  sortBy === option.value && storyDiscoveryStyles.filterOptionSelected,
                  sortBy === option.value && isDarkMode && storyDiscoveryStyles.filterOptionSelectedDark
                ]}
                onPress={() => handleSortChange(option.value)}
              >
                <Text style={[
                  storyDiscoveryStyles.filterOptionText,
                  { color: isDarkMode ? colors.textDark : colors.text },
                  sortBy === option.value && { color: isDarkMode ? colors.accentDark : colors.accent }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Story List */}
        <View style={storyDiscoveryStyles.contentContainer}>
          {!loadingError && (
            <StoryDiscoveryList
              onStorySelect={handleStorySelect}
              onError={handleStoryListError}
              isDarkMode={isDarkMode}
              showCachedOnly={showCachedOnly}
              searchQuery={searchQuery}
              sortBy={sortBy}
            />
          )}
        </View>
      </SafeAreaView>
    </ErrorBoundary>
  );
};

export default StoryDiscoveryScreen;

// Character count: 6247