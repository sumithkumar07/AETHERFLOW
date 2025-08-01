import { create } from 'zustand'
import axios from 'axios'
import toast from 'react-hot-toast'

// Get backend URL from environment
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001'

// Configure axios defaults
axios.defaults.baseURL = `${BACKEND_URL}/api`
axios.defaults.headers.common['Content-Type'] = 'application/json'

// Simple, working auth store without persist middleware
const useSimpleAuthStore = create((set, get) => ({
  // State
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: true, // Always initialized
  error: null,

  // Initialize - check localStorage for existing auth
  initialize: () => {
    try {
      const token = localStorage.getItem('ai-tempo-token')
      const user = localStorage.getItem('ai-tempo-user')
      
      if (token && user) {
        const parsedUser = JSON.parse(user)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        set({
          token,
          user: parsedUser,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true
        })
      } else {
        set({
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true
        })
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      set({
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: null
      })
    }
  },

  // Login
  login: async (credentials) => {
    try {
      set({ isLoading: true, error: null })
      
      const response = await axios.post('/auth/login', credentials)
      const { user, access_token } = response.data
      
      // Set authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      // Save to localStorage
      localStorage.setItem('ai-tempo-token', access_token)
      localStorage.setItem('ai-tempo-user', JSON.stringify(user))
      
      set({
        user,
        token: access_token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      })
      
      toast.success(`Welcome back, ${user.name}!`)
      return { success: true, user }
      
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Login failed'
      
      set({
        error: errorMessage,
        isLoading: false
      })
      
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  },

  // Logout
  logout: async () => {
    try {
      // Clear axios header
      delete axios.defaults.headers.common['Authorization']
      
      // Clear localStorage
      localStorage.removeItem('ai-tempo-token')
      localStorage.removeItem('ai-tempo-user')
      
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      })
      
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  }
}))

export { useSimpleAuthStore }