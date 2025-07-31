import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light',
      
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: newTheme })
        
        // Apply theme to document
        if (typeof window !== 'undefined') {
          if (newTheme === 'dark') {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
      },
      
      setTheme: (theme) => {
        set({ theme })
        
        // Apply theme to document
        if (typeof window !== 'undefined') {
          if (theme === 'dark') {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
      },
      
      initializeTheme: () => {
        const theme = get().theme
        
        // Initialize theme on page load
        if (typeof window !== 'undefined') {
          // Check system preference if no stored theme
          if (!localStorage.getItem('theme-storage')) {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            const initialTheme = systemPrefersDark ? 'dark' : 'light'
            set({ theme: initialTheme })
            
            if (initialTheme === 'dark') {
              document.documentElement.classList.add('dark')
            }
          } else {
            // Apply stored theme
            if (theme === 'dark') {
              document.documentElement.classList.add('dark')
            } else {
              document.documentElement.classList.remove('dark')
            }
          }
        }
      }
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
)