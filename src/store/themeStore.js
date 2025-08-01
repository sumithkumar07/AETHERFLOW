import { create } from 'zustand'

const useThemeStore = create((set, get) => ({
  theme: 'light', // Simplified to just 'light' or 'dark'
  
  // Initialize theme
  initializeTheme: () => {
    // For now, just use light theme
    document.documentElement.classList.remove('dark')
    set({ theme: 'light' })
  },
  
  // Set theme (light or dark)
  setTheme: (newTheme) => {
    set({ theme: newTheme })
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  },
  
  // Toggle between light and dark
  toggleTheme: () => {
    const { theme } = get()
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    get().setTheme(newTheme)
  }
}))

export { useThemeStore }