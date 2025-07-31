import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import axios from 'axios'
import toast from 'react-hot-toast'

// Configure axios defaults
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'
axios.defaults.baseURL = API_BASE_URL

// Request interceptor to add auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth-token')
      localStorage.removeItem('auth-storage')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login function
      login: async (email, password) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await axios.post('/api/auth/login', {
            email,
            password
          })
          
          const { access_token, user } = response.data
          
          // Store token
          localStorage.setItem('auth-token', access_token)
          
          set({
            user,
            token: access_token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
          
          toast.success(`Welcome back, ${user.name}!`)
          return true
        } catch (error) {
          const errorMessage = error.response?.data?.detail || 'Login failed'
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null
          })
          toast.error(errorMessage)
          throw error
        }
      },

      // Register function
      register: async (name, email, password) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await axios.post('/api/auth/register', {
            name,
            email,
            password
          })
          
          const { access_token, user } = response.data
          
          // Store token
          localStorage.setItem('auth-token', access_token)
          
          set({
            user,
            token: access_token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
          
          toast.success(`Welcome to AI Tempo, ${user.name}!`)
          return true
        } catch (error) {
          const errorMessage = error.response?.data?.detail || 'Registration failed'
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null
          })
          toast.error(errorMessage)
          throw error
        }
      },

      // Quick demo login
      demoLogin: async () => {
        return get().login('demo@aicodestudio.com', 'demo123')
      },

      // Logout function
      logout: () => {
        localStorage.removeItem('auth-token')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        })
        toast.success('Logged out successfully')
      },

      // Check authentication status
      checkAuth: async () => {
        const token = localStorage.getItem('auth-token')
        
        if (!token) {
          set({ isAuthenticated: false, user: null, token: null })
          return false
        }

        try {
          const response = await axios.get('/api/auth/me')
          const user = response.data
          
          set({
            user,
            token,
            isAuthenticated: true,
            error: null
          })
          
          return true
        } catch (error) {
          // Token is invalid
          localStorage.removeItem('auth-token')
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null
          })
          return false
        }
      },

      // Update profile
      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await axios.put('/api/auth/profile', profileData)
          const updatedUser = response.data.user
          
          set({
            user: updatedUser,
            isLoading: false,
            error: null
          })
          
          return updatedUser
        } catch (error) {
          const errorMessage = error.response?.data?.detail || 'Profile update failed'
          set({
            error: errorMessage,
            isLoading: false
          })
          throw error
        }
      },

      // Clear error
      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
      version: 1,
    }
  )
)