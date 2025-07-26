import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, Palette } from 'lucide-react';

const ThemeToggle = () => {
  const { currentTheme, themes, switchTheme } = useTheme();

  const getThemeIcon = (themeKey) => {
    switch (themeKey) {
      case 'cosmic':
        return <Palette className="w-4 h-4" />;
      case 'professional':
        return <Moon className="w-4 h-4" />;
      case 'corporate':
        return <Sun className="w-4 h-4" />;
      default:
        return <Palette className="w-4 h-4" />;
    }
  };

  return (
    <div className="theme-toggle-container">
      <div className="theme-selector">
        <div className="theme-selector-label">
          <span className="text-sm font-medium">Theme</span>
        </div>
        <div className="theme-options">
          {Object.entries(themes).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => switchTheme(key)}
              className={`theme-option ${currentTheme === key ? 'active' : ''}`}
              title={theme.name}
            >
              {getThemeIcon(key)}
              <span className="theme-name">{theme.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeToggle;