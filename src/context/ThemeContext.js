// src/context/ThemeContext.js
// Path: src/context/ThemeContext.js
import React, { createContext, useContext, useState, useMemo } from 'react';
import { lightColors, darkColors } from '../styles/tokens';
import { getTheme, lightTheme, darkTheme } from '../styles/base/themes';
import { getComponentStyles } from '../styles/components';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  
  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Memoize theme object to prevent unnecessary re-renders
  const theme = useMemo(() => {
    // Get comprehensive theme configuration
    const fullTheme = isDark ? darkTheme : lightTheme;
    
    // Get all component styles for current theme
    const componentStyles = getComponentStyles(isDark);
    
    return {
      // Basic theme info
      isDark,
      mode: isDark ? 'dark' : 'light',
      toggleTheme,
      
      // Raw color tokens (for direct access)
      colors: isDark ? darkColors : lightColors,
      
      // Comprehensive theme object
      theme: fullTheme,
      
      // Pre-computed component styles
      components: componentStyles,
      
      // Helper functions for components
      getColor: (colorPath) => {
        const pathArray = colorPath.split('.');
        let value = fullTheme.colors;
        for (const key of pathArray) {
          value = value?.[key];
          if (value === undefined) break;
        }
        return value;
      },
      
      getShadow: (shadowName) => {
        return fullTheme.shadows?.[shadowName] || fullTheme.shadows?.none;
      },
      
      // Backward compatibility
      primary: isDark ? darkColors.primary : lightColors.primary,
      background: isDark ? darkColors.background : lightColors.background,
      text: isDark ? darkColors.text : lightColors.text,
      textSecondary: isDark ? darkColors.textSecondary : lightColors.textSecondary,
    };
  }, [isDark]);
  
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Additional hook for just getting theme-aware styles
export const useThemedStyles = () => {
  const { isDark, components } = useTheme();
  return { isDark, styles: components };
};

// Hook for getting specific component styles
export const useComponentStyles = (componentName) => {
  const { components } = useTheme();
  return components[componentName] || {};
};

// Character count: 2089