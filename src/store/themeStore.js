import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useThemeStore = create(
  persist(
    (set, get) => ({
      // State
      theme: 'light', // 'light' | 'dark' | 'system'
      systemTheme: 'light',
      
      // Actions
      setTheme: (newTheme) => {
        set({ theme: newTheme })
        get().applyTheme(newTheme)
      },

      toggleTheme: () => {
        const currentTheme = get().theme
        const newTheme = currentTheme === 'light' ? 'dark' : 'light'
        get().setTheme(newTheme)
      },

      applyTheme: (theme) => {
        const root = document.documentElement
        
        if (theme === 'system') {
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          if (systemPrefersDark) {
            root.classList.add('dark')
          } else {
            root.classList.remove('dark')
          }
        } else if (theme === 'dark') {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
      },

      initializeTheme: () => {
        const state = get()
        
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = (e) => {
          set({ systemTheme: e.matches ? 'dark' : 'light' })
          if (state.theme === 'system') {
            state.applyTheme('system')
          }
        }
        
        mediaQuery.addEventListener('change', handleChange)
        set({ systemTheme: mediaQuery.matches ? 'dark' : 'light' })
        
        // Apply current theme
        state.applyTheme(state.theme)
      }
    }),
    {
      name: 'ai-tempo-theme',
      partialize: (state) => ({ theme: state.theme })
    }
  )
)

export { useThemeStore }