import { create } from 'zustand'

export const useAuthStore = create((set, get) => ({
  isAuthenticated: false,
  user: null,
  loading: false,
  
  login: async (credentials) => {
    set({ loading: true })
    try {
      // Mock authentication for demo - replace with Puter.js in production
      if (credentials.email && credentials.password) {
        const mockUser = {
          id: '1',
          name: credentials.email.split('@')[0],
          email: credentials.email
        }
        
        set({ 
          isAuthenticated: true, 
          user: mockUser,
          loading: false 
        })
        return { success: true }
      } else {
        set({ loading: false })
        return { success: false, error: 'Invalid credentials' }
      }
    } catch (error) {
      set({ loading: false })
      return { success: false, error: error.message }
    }
  },
  
  signup: async (userData) => {
    set({ loading: true })
    try {
      // Mock authentication for demo - replace with Puter.js in production
      if (userData.email && userData.password && userData.name) {
        const mockUser = {
          id: '1',
          name: userData.name,
          email: userData.email
        }
        
        set({ 
          isAuthenticated: true, 
          user: mockUser,
          loading: false 
        })
        return { success: true }
      } else {
        set({ loading: false })
        return { success: false, error: 'Invalid data' }
      }
    } catch (error) {
      set({ loading: false })
      return { success: false, error: error.message }
    }
  },
  
  logout: async () => {
    try {
      await puter.auth.signOut()
      set({ 
        isAuthenticated: false, 
        user: null 
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  },
  
  checkAuth: async () => {
    try {
      const user = await puter.auth.getUser()
      if (user) {
        set({ 
          isAuthenticated: true, 
          user: user 
        })
      }
    } catch (error) {
      console.error('Auth check error:', error)
    }
  }
}))