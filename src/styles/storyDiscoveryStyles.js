// src/styles/storyDiscoveryStyles.js
// Path: src/styles/storyDiscoveryStyles.js
import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from './tokens';

export const storyDiscoveryStyles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerDark: {
    backgroundColor: colors.backgroundDark,
  },

  // Header section
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

  // Search section
  searchContainer: {
    marginHorizontal: spacing.medium,
    marginVertical: spacing.small,
  },

  // Filter menu
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

  // Error states
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.large,
  },
  loadingErrorContainer: {
    margin: spacing.medium,
    marginTop: spacing.large,
  },
  searchErrorContainer: {
    margin: spacing.medium,
    paddingVertical: spacing.large,
  },

  // Content areas
  contentContainer: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
});

// Character count: 1847