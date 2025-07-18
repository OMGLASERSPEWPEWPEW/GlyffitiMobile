// src/screens/StoryDiscoveryScreen.js
// Path: src/screens/StoryDiscoveryScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  TextInput,
  StatusBar
} from 'react-native';
import { ArrowLeft, Search, Filter } from 'lucide-react-native';
import StoryDiscoveryList from '../components/Story/StoryDiscoveryList';
import { colors, spacing, typography } from '../styles';

/**
 * Screen for discovering and browsing stories
 * Includes search, filtering, and navigation to story viewer
 */
export const StoryDiscoveryScreen = ({ navigation, route }) => {
  const { showCachedOnly = false } = route.params || {};
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [isDarkMode, setIsDarkMode] = useState(false); // You can connect this to your theme system
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Handle story selection - navigate to story viewer
  const handleStorySelect = (story, isCached) => {
    console.log('Selected story:', story.storyId, 'Cached:', isCached);
    
    navigation.navigate('StoryView', {
      storyId: story.storyId,
      manifest: story,
      autoStart: true
    });
  };

  // Handle back navigation
  const handleBack = () => {
    navigation.goBack();
  };

  // Sort options
  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'author', label: 'Author A-Z' }
  ];

  return (
    <SafeAreaView style={[
      styles.container,
      isDarkMode && styles.containerDark
    ]}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={isDarkMode ? colors.backgroundDark : colors.background}
      />
      
      {/* Header */}
      <View style={[
        styles.header,
        isDarkMode && styles.headerDark
      ]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft 
            size={24} 
            color={isDarkMode ? colors.textDark : colors.text} 
          />
        </TouchableOpacity>
        
        <Text style={[
          styles.headerTitle,
          { color: isDarkMode ? colors.textDark : colors.text }
        ]}>
          {showCachedOnly ? 'My Stories' : 'Discover Stories'}
        </Text>
        
        <TouchableOpacity 
          onPress={() => setShowFilterMenu(!showFilterMenu)} 
          style={styles.filterButton}
        >
          <Filter 
            size={24} 
            color={isDarkMode ? colors.textDark : colors.text} 
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[
        styles.searchContainer,
        isDarkMode && styles.searchContainerDark
      ]}>
        <Search 
          size={20} 
          color={isDarkMode ? colors.textSecondaryDark : colors.textSecondary}
          style={styles.searchIcon} 
        />
        <TextInput
          style={[
            styles.searchInput,
            { color: isDarkMode ? colors.textDark : colors.text }
          ]}
          placeholder="Search stories..."
          placeholderTextColor={isDarkMode ? colors.textSecondaryDark : colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Filter Menu */}
      {showFilterMenu && (
        <View style={[
          styles.filterMenu,
          isDarkMode && styles.filterMenuDark
        ]}>
          <Text style={[
            styles.filterLabel,
            { color: isDarkMode ? colors.textDark : colors.text }
          ]}>
            Sort by:
          </Text>
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.filterOption,
                sortBy === option.value && styles.filterOptionSelected,
                sortBy === option.value && isDarkMode && styles.filterOptionSelectedDark
              ]}
              onPress={() => {
                setSortBy(option.value);
                setShowFilterMenu(false);
              }}
            >
              <Text style={[
                styles.filterOptionText,
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
      <StoryDiscoveryList
        onStorySelect={handleStorySelect}
        isDarkMode={isDarkMode}
        showCachedOnly={showCachedOnly}
        searchQuery={searchQuery}
        sortBy={sortBy}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerDark: {
    backgroundColor: colors.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerDark: {
    borderBottomColor: colors.borderDark,
  },
  backButton: {
    padding: spacing.small,
    marginRight: spacing.small,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: typography.fontFamilyBold,
    textAlign: 'center',
  },
  filterButton: {
    padding: spacing.small,
    marginLeft: spacing.small,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.medium,
    marginVertical: spacing.small,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    backgroundColor: colors.surface,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchContainerDark: {
    backgroundColor: colors.surfaceDark,
    borderColor: colors.borderDark,
  },
  searchIcon: {
    marginRight: spacing.small,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: typography.fontFamily,
  },
  filterMenu: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.medium,
    marginBottom: spacing.small,
    borderRadius: 8,
    padding: spacing.medium,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterMenuDark: {
    backgroundColor: colors.surfaceDark,
    borderColor: colors.borderDark,
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: typography.fontFamilyBold,
    marginBottom: spacing.small,
  },
  filterOption: {
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.medium,
    borderRadius: 6,
    marginBottom: spacing.extraSmall,
  },
  filterOptionSelected: {
    backgroundColor: colors.accent + '20',
  },
  filterOptionSelectedDark: {
    backgroundColor: colors.accentDark + '20',
  },
  filterOptionText: {
    fontSize: 14,
    fontFamily: typography.fontFamily,
  },
});

export default StoryDiscoveryScreen;

// 2,129 characters