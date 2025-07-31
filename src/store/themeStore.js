import { create } from 'zustand'

export const useThemeStore = create((set, get) => ({
  theme: typeof window !== 'undefined' && localStorage.getItem('theme') || 'light',
  
  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light'
    set({ theme: newTheme })
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme)
    }
    
    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  },
  
  setTheme: (theme) => {
    set({ theme })
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme)
    }
    
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  },
  
  initializeTheme: () => {
    const theme = get().theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
}))