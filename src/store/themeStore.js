import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Enhanced theme configurations
const THEMES = {
  light: {
    name: 'Light',
    icon: '☀️',
    primary: 'blue',
    background: 'from-slate-50 via-blue-50 to-indigo-50',
    surface: 'white',
    text: 'gray-900'
  },
  dark: {
    name: 'Dark',
    icon: '🌙',
    primary: 'blue',
    background: 'from-gray-900 via-slate-900 to-indigo-950',
    surface: 'gray-800',
    text: 'white'
  },
  auto: {
    name: 'Auto',
    icon: '🌓',
    primary: 'blue',
    background: 'system',
    surface: 'system',
    text: 'system'
  }
}

// System theme detection
const getSystemTheme = () => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

const useThemeStore = create(
  persist(
    (set, get) => ({
      // Enhanced State
      theme: 'light',
      systemTheme: getSystemTheme(),
      previousTheme: 'light',
      isAutoTheme: false,
      
      // Theme customization
      accentColor: 'blue',
      borderRadius: 'medium',
      fontSize: 'medium',
      
      // Animations and effects
      reduceMotion: false,
      highContrast: false,
      
      // Initialize theme with system preference detection
      initializeTheme: () => {
        const savedTheme = localStorage.getItem('ai-tempo-theme') || 'light'
        const systemTheme = getSystemTheme()
        
        set({ 
          systemTheme,
          theme: savedTheme === 'auto' ? systemTheme : savedTheme,
          isAutoTheme: savedTheme === 'auto'
        })
        
        get().applyTheme(savedTheme === 'auto' ? systemTheme : savedTheme)
        
        // Listen for system theme changes
        if (typeof window !== 'undefined') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
          mediaQuery.addEventListener('change', (e) => {
            const newSystemTheme = e.matches ? 'dark' : 'light'
            set({ systemTheme: newSystemTheme })
            
            if (get().isAutoTheme) {
              get().applyTheme(newSystemTheme)
            }
          })
        }
      },
      
      // Enhanced theme application
      applyTheme: (themeName) => {
        const theme = THEMES[themeName] || THEMES.light
        
        if (typeof document !== 'undefined') {
          const root = document.documentElement
          
          // Remove all theme classes
          root.classList.remove('dark', 'light', 'high-contrast')
          
          // Apply new theme
          if (themeName === 'dark') {
            root.classList.add('dark')
          } else {
            root.classList.add('light')
          }
          
          // Apply high contrast if enabled
          if (get().highContrast) {
            root.classList.add('high-contrast')
          }
          
          // Apply custom CSS properties for advanced theming
          root.style.setProperty('--accent-color', get().accentColor)
          root.style.setProperty('--border-radius', get().borderRadius)
          root.style.setProperty('--font-size', get().fontSize)
          
          // Apply motion preferences
          if (get().reduceMotion) {
            root.style.setProperty('--motion-duration', '0.01ms')
          } else {
            root.style.removeProperty('--motion-duration')
          }
        }
      },
      
      // Set theme with persistence
      setTheme: (newTheme) => {
        const previousTheme = get().theme
        
        set({ 
          previousTheme,
          theme: newTheme,
          isAutoTheme: newTheme === 'auto'
        })
        
        const actualTheme = newTheme === 'auto' ? get().systemTheme : newTheme
        get().applyTheme(actualTheme)
        
        // Save to localStorage
        localStorage.setItem('ai-tempo-theme', newTheme)
      },
      
      // Toggle between light and dark (or auto if enabled)
      toggleTheme: () => {
        const { theme, isAutoTheme } = get()
        
        if (isAutoTheme || theme === 'auto') {
          // Cycle: auto -> light -> dark -> auto
          const currentActual = get().systemTheme
          const nextTheme = currentActual === 'dark' ? 'light' : 'dark'
          get().setTheme(nextTheme)
        } else {
          // Simple toggle between light and dark
          const newTheme = theme === 'dark' ? 'light' : 'dark'
          get().setTheme(newTheme)
        }
      },
      
      // Advanced theme options
      setAccentColor: (color) => {
        set({ accentColor: color })
        get().applyTheme(get().theme)
      },
      
      setBorderRadius: (radius) => {
        set({ borderRadius: radius })
        get().applyTheme(get().theme)
      },
      
      setFontSize: (size) => {
        set({ fontSize: size })
        get().applyTheme(get().theme)
      },
      
      // Accessibility options
      toggleHighContrast: () => {
        const newHighContrast = !get().highContrast
        set({ highContrast: newHighContrast })
        get().applyTheme(get().theme)
      },
      
      toggleReduceMotion: () => {
        const newReduceMotion = !get().reduceMotion
        set({ reduceMotion: newReduceMotion })
        get().applyTheme(get().theme)
      },
      
      // Get theme information
      getThemeInfo: (themeName = null) => {
        const currentTheme = themeName || get().theme
        return THEMES[currentTheme] || THEMES.light
      },
      
      // Get all available themes
      getAvailableThemes: () => {
        return Object.entries(THEMES).map(([id, theme]) => ({
          id,
          ...theme
        }))
      },
      
      // Reset to defaults
      resetToDefaults: () => {
        set({
          theme: 'light',
          accentColor: 'blue',
          borderRadius: 'medium',
          fontSize: 'medium',
          reduceMotion: false,
          highContrast: false,
          isAutoTheme: false
        })
        
        get().applyTheme('light')
        localStorage.setItem('ai-tempo-theme', 'light')
      },
      
      // Export/Import theme settings
      exportSettings: () => {
        const settings = {
          theme: get().theme,
          accentColor: get().accentColor,
          borderRadius: get().borderRadius,
          fontSize: get().fontSize,
          reduceMotion: get().reduceMotion,
          highContrast: get().highContrast
        }
        
        return JSON.stringify(settings, null, 2)
      },
      
      importSettings: (settingsJson) => {
        try {
          const settings = JSON.parse(settingsJson)
          
          set({
            theme: settings.theme || 'light',
            accentColor: settings.accentColor || 'blue',
            borderRadius: settings.borderRadius || 'medium',
            fontSize: settings.fontSize || 'medium',
            reduceMotion: settings.reduceMotion || false,
            highContrast: settings.highContrast || false,
            isAutoTheme: settings.theme === 'auto'
          })
          
          get().applyTheme(settings.theme || 'light')
          return { success: true }
        } catch (error) {
          return { success: false, error: 'Invalid settings format' }
        }
      }
    }),
    {
      name: 'ai-tempo-theme-storage',
      partialize: (state) => ({
        theme: state.theme,
        accentColor: state.accentColor,
        borderRadius: state.borderRadius,
        fontSize: state.fontSize,
        reduceMotion: state.reduceMotion,
        highContrast: state.highContrast
      })
    }
  )
)

export { useThemeStore, THEMES }