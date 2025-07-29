// src/components/common/Header.js
// Path: src/components/common/Header.js

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../styles';

const Header = ({ title, leftAction, rightAction, leftIcon, rightIcon }) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        {leftAction && (
          <TouchableOpacity onPress={leftAction} style={styles.iconButton}>
            {leftIcon || <Text style={styles.iconText}>←</Text>}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.centerContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.rightContainer}>
        {rightAction && (
          <TouchableOpacity onPress={rightAction} style={styles.iconButton}>
            {rightIcon || <Text style={styles.iconText}>⚙️</Text>}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  leftContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerContainer: {
    flex: 2,
    alignItems: 'center',
  },
  rightContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: typography.fontSize?.lg ?? 18, // was fonts.sizes.large
    color: colors.text,
    // Prefer explicit family from tokens over weights when you have dedicated faces:
    fontFamily: typography.fontFamilyBold ?? typography.fontFamily,
    // If you rely on weights instead of font families, also set:
    fontWeight: typography.fontWeight?.bold ?? '700',
  },
  iconButton: {
    padding: spacing.small,
  },
  iconText: {
    fontSize: typography.fontSize?.lg ?? 18, // was fonts.sizes.large
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight?.medium ?? '600',
  },
});

export default Header;
