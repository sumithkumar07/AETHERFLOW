import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'system', // 'light', 'dark', 'system'
      systemTheme: 'light',
      
      // Initialize theme based on system preference or saved setting
      initializeTheme: () => {
        const { theme } = get()
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        
        set({ systemTheme: systemPrefersDark ? 'dark' : 'light' })
        
        // Apply theme to document
        const effectiveTheme = theme === 'system' 
          ? (systemPrefersDark ? 'dark' : 'light')
          : theme
          
        if (effectiveTheme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = (e) => {
          const newSystemTheme = e.matches ? 'dark' : 'light'
          set({ systemTheme: newSystemTheme })
          
          // Apply system theme if user hasn't set a preference
          if (get().theme === 'system') {
            if (newSystemTheme === 'dark') {
              document.documentElement.classList.add('dark')
            } else {
              document.documentElement.classList.remove('dark')
            }
          }
        }
        
        mediaQuery.addEventListener('change', handleChange)
        
        // Cleanup function
        return () => mediaQuery.removeEventListener('change', handleChange)
      },
      
      // Set theme (light, dark, or system)
      setTheme: (newTheme) => {
        set({ theme: newTheme })
        
        const { systemTheme } = get()
        const effectiveTheme = newTheme === 'system' ? systemTheme : newTheme
        
        if (effectiveTheme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        
        // Dispatch custom event for theme change
        window.dispatchEvent(new CustomEvent('themechange', { 
          detail: { theme: newTheme, effectiveTheme } 
        }))
      },
      
      // Toggle between light and dark (ignores system)
      toggleTheme: () => {
        const { theme, systemTheme } = get()
        const currentEffectiveTheme = theme === 'system' ? systemTheme : theme
        const newTheme = currentEffectiveTheme === 'dark' ? 'light' : 'dark'
        get().setTheme(newTheme)
      },
      
      // Get the current effective theme
      getEffectiveTheme: () => {
        const { theme, systemTheme } = get()
        return theme === 'system' ? systemTheme : theme
      },
      
      // Check if current theme is dark
      isDark: () => {
        return get().getEffectiveTheme() === 'dark'
      },
      
      // Theme preferences for different components
      preferences: {
        animations: true,
        reducedMotion: false,
        highContrast: false,
        fontSize: 'medium', // 'small', 'medium', 'large'
      },
      
      // Update preferences
      updatePreferences: (newPreferences) => {
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences }
        }))
        
        // Apply accessibility preferences
        const { preferences } = get()
        
        if (preferences.reducedMotion) {
          document.documentElement.style.setProperty('--animation-duration', '0.01ms')
        } else {
          document.documentElement.style.removeProperty('--animation-duration')
        }
        
        if (preferences.highContrast) {
          document.documentElement.classList.add('high-contrast')
        } else {
          document.documentElement.classList.remove('high-contrast')
        }
        
        // Set font size
        document.documentElement.setAttribute('data-font-size', preferences.fontSize)
      },
      
      // Reset to defaults
      reset: () => {
        set({
          theme: 'system',
          preferences: {
            animations: true,
            reducedMotion: false,
            highContrast: false,
            fontSize: 'medium',
          }
        })
        get().initializeTheme()
      }
    }),
    {
      name: 'ai-tempo-theme',
      partialize: (state) => ({
        theme: state.theme,
        preferences: state.preferences,
      }),
      version: 1,
      migrate: (persistedState, version) => {
        // Handle migration from older versions
        if (version === 0) {
          // Convert old boolean theme to new string format
          const oldState = persistedState
          return {
            ...oldState,
            theme: oldState.isDark ? 'dark' : 'light',
            preferences: {
              animations: true,
              reducedMotion: false,
              highContrast: false,
              fontSize: 'medium',
            }
          }
        }
        return persistedState
      }
    }
  )
)

export { useThemeStore }