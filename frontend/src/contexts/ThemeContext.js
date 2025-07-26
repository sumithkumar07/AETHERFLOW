import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme configurations based on professional standards
export const themes = {
  cosmic: {
    name: 'Cosmic',
    class: 'theme-cosmic',
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      background: '#0a0e1a',
      surface: '#1e293b',
      text: '#e2e8f0',
      accent: '#f093fb'
    }
  },
  professional: {
    name: 'Professional Dark',
    class: 'theme-professional',
    colors: {
      primary: '#2563eb',
      secondary: '#1e40af',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      accent: '#3b82f6'
    }
  },
  corporate: {
    name: 'Corporate Light',
    class: 'theme-corporate',
    colors: {
      primary: '#2563eb',
      secondary: '#1d4ed8',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#0f172a',
      accent: '#3b82f6'
    }
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('cosmic');
  
  useEffect(() => {
    // Load theme from localStorage or use default
    const savedTheme = localStorage.getItem('aetherflow_theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    const theme = themes[currentTheme];
    document.body.className = theme.class;
    
    // Set CSS custom properties for the theme
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
    });
    
    // Save to localStorage
    localStorage.setItem('aetherflow_theme', currentTheme);
  }, [currentTheme]);

  const switchTheme = (themeKey) => {
    if (themes[themeKey]) {
      setCurrentTheme(themeKey);
    }
  };

  const value = {
    currentTheme,
    themes,
    switchTheme,
    theme: themes[currentTheme]
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};