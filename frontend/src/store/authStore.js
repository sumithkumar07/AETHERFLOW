import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import axios from 'axios'
import toast from 'react-hot-toast'

// Get backend URL from environment
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'

// Configure axios defaults
axios.defaults.baseURL = `${BACKEND_URL}/api`
axios.defaults.headers.common['Content-Type'] = 'application/json'

// Enhanced and robust auth store for Aether AI
const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,
      loginAttempts: 0,
      lastLoginAttempt: null,

      // Actions
      login: async (credentials) => {
        try {
          set({ isLoading: true, error: null })
          
          const response = await axios.post('/auth/login', credentials)
          const { user, access_token, refresh_token, token_type } = response.data
          
          // Set authorization header for future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
          
          set({
            user,
            token: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            loginAttempts: 0,
            lastLoginAttempt: null
          })
          
          toast.success(`Welcome back to Aether AI, ${user.name}!`)
          return { success: true, user }
          
        } catch (error) {
          const errorMessage = error.response?.data?.detail || 'Login failed'
          const newAttempts = get().loginAttempts + 1
          
          set({
            error: errorMessage,
            isLoading: false,
            loginAttempts: newAttempts,
            lastLoginAttempt: Date.now()
          })
          
          toast.error(errorMessage)
          return { success: false, error: errorMessage }
        }
      },

      register: async (userData) => {
        try {
          set({ isLoading: true, error: null })
          
          const response = await axios.post('/auth/register', userData)
          const { user, access_token, refresh_token } = response.data
          
          // Set authorization header for future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
          
          set({
            user,
            token: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
          
          toast.success(`Welcome to Aether AI, ${user.name}! 🚀`)
          return { success: true, user }
          
        } catch (error) {
          const errorMessage = error.response?.data?.detail || 'Registration failed'
          
          set({
            error: errorMessage,
            isLoading: false
          })
          
          toast.error(errorMessage)
          return { success: false, error: errorMessage }
        }
      },

      logout: async () => {
        try {
          // Attempt to logout from server
          if (get().token) {
            await axios.post('/auth/logout', {
              refresh_token: get().refreshToken
            })
          }
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          // Clear client state regardless of server response
          delete axios.defaults.headers.common['Authorization']
          
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            loginAttempts: 0,
            lastLoginAttempt: null
          })
          
          toast.success('Logged out from Aether AI successfully')
        }
      },

      // Initialize auth store with timeout and error handling
      initialize: async () => {
        try {
          const { token } = get()
          console.log('🔑 Initializing Aether AI auth, token exists:', !!token)
          
          // If no token exists, we're not authenticated
          if (!token) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
              isInitialized: true
            })
            console.log('No token found, initialization complete (unauthenticated)')
            return false
          }
          
          // If we have a token, validate it silently with timeout
          console.log('Token found, validating with Aether AI...')
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Auth validation timeout')), 10000)
          )
          
          const validationPromise = get().checkAuthSilent()
          
          let isValid = false
          try {
            isValid = await Promise.race([validationPromise, timeoutPromise])
            console.log('Aether AI token validation result:', isValid)
          } catch (error) {
            console.error('Token validation failed or timed out:', error)
            // Clear invalid token
            set({
              user: null,
              token: null,
              refreshToken: null,
              isAuthenticated: false,
              isLoading: false,
              error: null
            })
          }
          
          set({
            ...get(),
            isInitialized: true
          })
          
          console.log('✅ Aether AI auth initialization complete, authenticated:', isValid)
          return isValid
        } catch (error) {
          console.error('Aether AI auth initialization error:', error)
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            isInitialized: true
          })
          return false
        }
      },

      // Simplified auth check - no complex initialization
      checkAuth: async () => {
        const { token } = get()
        
        // If no token exists, not authenticated
        if (!token) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
          return false
        }
        
        try {
          set({ isLoading: true, error: null })
          
          // Try to validate token with backend
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          const response = await axios.get('/auth/me')
          const user = response.data
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
          
          return true
          
        } catch (error) {
          console.error('Auth check failed:', error)
          
          // Try to refresh token if available
          if (get().refreshToken) {
            const refreshSuccess = await get().refreshAccessToken()
            if (refreshSuccess) {
              return true
            }
          }
          
          // Clear invalid auth state
          delete axios.defaults.headers.common['Authorization']
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
          
          return false
        }
      },

      // Silent auth check for initialization (doesn't set loading state)
      checkAuthSilent: async () => {
        const { token, isAuthenticated, user } = get()
        
        // If no token exists, not authenticated
        if (!token) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
          return false
        }
        
        // If already authenticated with user data, skip validation for now
        if (isAuthenticated && user) {
          return true
        }
        
        try {
          // Don't set loading state during silent check
          set({ error: null })
          
          // Try to validate token with backend
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          const response = await axios.get('/auth/me')
          const userData = response.data
          
          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
          
          return true
          
        } catch (error) {
          console.error('Silent auth check failed:', error)
          
          // Only clear auth state if it's a clear authentication failure
          if (error.response?.status === 401 && !get().isAuthenticated) {
            // Try to refresh token if available
            if (get().refreshToken) {
              try {
                const refreshSuccess = await get().refreshAccessToken()
                if (refreshSuccess) {
                  return true
                }
              } catch (refreshError) {
                console.error('Token refresh failed during silent check:', refreshError)
              }
            }
            
            // Clear invalid auth state only if we weren't already authenticated
            delete axios.defaults.headers.common['Authorization']
            set({
              user: null,
              token: null,
              refreshToken: null,
              isAuthenticated: false,
              isLoading: false,
              error: null
            })
          }
          
          return false
        }
      },

      refreshAccessToken: async () => {
        try {
          const { refreshToken } = get()
          
          if (!refreshToken) {
            throw new Error('No refresh token available')
          }
          
          const response = await axios.post('/auth/refresh', {
            refresh_token: refreshToken
          })
          
          const { access_token, refresh_token: newRefreshToken } = response.data
          
          // Update tokens
          axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
          
          set({
            token: access_token,
            refreshToken: newRefreshToken || refreshToken,
            error: null
          })
          
          return true
          
        } catch (error) {
          console.error('Token refresh failed:', error)
          
          // Force logout on refresh failure
          get().logout()
          return false
        }
      },

      updateProfile: async (profileData) => {
        try {
          set({ isLoading: true, error: null })
          
          const response = await axios.put('/auth/profile', profileData)
          const updatedUser = response.data
          
          set({
            user: updatedUser,
            isLoading: false,
            error: null
          })
          
          toast.success('Profile updated successfully')
          return { success: true, user: updatedUser }
          
        } catch (error) {
          const errorMessage = error.response?.data?.detail || 'Profile update failed'
          
          set({
            error: errorMessage,
            isLoading: false
          })
          
          toast.error(errorMessage)
          return { success: false, error: errorMessage }
        }
      },

      changePassword: async (passwordData) => {
        try {
          set({ isLoading: true, error: null })
          
          await axios.post('/auth/change-password', passwordData)
          
          set({
            isLoading: false,
            error: null
          })
          
          toast.success('Password changed successfully')
          return { success: true }
          
        } catch (error) {
          const errorMessage = error.response?.data?.detail || 'Password change failed'
          
          set({
            error: errorMessage,
            isLoading: false
          })
          
          toast.error(errorMessage)
          return { success: false, error: errorMessage }
        }
      },

      requestPasswordReset: async (email) => {
        try {
          set({ isLoading: true, error: null })
          
          await axios.post('/auth/forgot-password', { email })
          
          set({
            isLoading: false,
            error: null
          })
          
          toast.success('Password reset email sent')
          return { success: true }
          
        } catch (error) {
          const errorMessage = error.response?.data?.detail || 'Password reset request failed'
          
          set({
            error: errorMessage,
            isLoading: false
          })
          
          toast.error(errorMessage)
          return { success: false, error: errorMessage }
        }
      },

      resetPassword: async (token, newPassword) => {
        try {
          set({ isLoading: true, error: null })
          
          await axios.post('/auth/reset-password', {
            token,
            new_password: newPassword
          })
          
          set({
            isLoading: false,
            error: null
          })
          
          toast.success('Password reset successfully')
          return { success: true }
          
        } catch (error) {
          const errorMessage = error.response?.data?.detail || 'Password reset failed'
          
          set({
            error: errorMessage,
            isLoading: false
          })
          
          toast.error(errorMessage)
          return { success: false, error: errorMessage }
        }
      },

      // Enhanced demo login for Aether AI
      demoLogin: async () => {
        return get().login({
          email: 'demo@aicodestudio.com',
          password: 'demo123'
        })
      },

      // Clear errors
      clearError: () => {
        set({ error: null })
      },

      // Check if user is rate limited
      isRateLimited: () => {
        const { loginAttempts, lastLoginAttempt } = get()
        const now = Date.now()
        const fiveMinutes = 5 * 60 * 1000
        
        return loginAttempts >= 5 && (now - lastLoginAttempt) < fiveMinutes
      },

      // Get time until rate limit expires
      getRateLimitTime: () => {
        const { lastLoginAttempt } = get()
        const now = Date.now()
        const fiveMinutes = 5 * 60 * 1000
        const timeLeft = fiveMinutes - (now - lastLoginAttempt)
        
        return Math.max(0, Math.ceil(timeLeft / 1000))
      }
    }),
    {
      name: 'aether-ai-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        loginAttempts: state.loginAttempts,
        lastLoginAttempt: state.lastLoginAttempt
      }),
      version: 4,
      migrate: (persistedState, version) => {
        // Handle migration from older versions
        if (version < 4) {
          return {
            ...persistedState,
            refreshToken: persistedState.refreshToken || null,
            loginAttempts: persistedState.loginAttempts || 0,
            lastLoginAttempt: persistedState.lastLoginAttempt || null
          }
        }
        return persistedState
      }
    }
  )
)

// Enhanced Axios interceptors for automatic token refresh
let isRefreshing = false
let refreshSubscribers = []

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb)
}

const onRefreshed = (token) => {
  refreshSubscribers.map(cb => cb(token))
  refreshSubscribers = []
}

// Request interceptor
axios.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(axios(originalRequest))
          })
        })
      }
      
      originalRequest._retry = true
      isRefreshing = true
      
      try {
        const success = await useAuthStore.getState().refreshAccessToken()
        
        if (success) {
          const newToken = useAuthStore.getState().token
          isRefreshing = false
          onRefreshed(newToken)
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return axios(originalRequest)
        }
      } catch (refreshError) {
        isRefreshing = false
        useAuthStore.getState().logout()
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

export { useAuthStore }