import { create } from 'zustand'
import axios from 'axios'
import toast from 'react-hot-toast'

// Get backend URL from environment - check both possible env var names
const BACKEND_URL = import.meta.env.REACT_APP_BACKEND_URL || 
                   import.meta.env.VITE_BACKEND_URL || 
                   process.env.REACT_APP_BACKEND_URL ||
                   'http://localhost:8001'

// Configure axios defaults
axios.defaults.baseURL = `${BACKEND_URL}/api`
axios.defaults.headers.common['Content-Type'] = 'application/json'

console.log('🔧 Auth Store initialized with Backend URL:', BACKEND_URL)

// Enhanced auth store with race condition prevention and improved state management
const useAuthStore = create((set, get) => ({
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
  
  // Race condition prevention state
  isLoggingIn: false,
  lastSuccessfulLogin: null,
  initializationAttempted: false,
  authOperationInProgress: false,

  // Enhanced initialize method with race condition prevention
  initialize: async () => {
    const state = get()
    
    // Prevent initialization if auth operation is in progress or recently successful login
    if (state.authOperationInProgress || state.isLoggingIn) {
      console.log('🔒 Auth operation in progress, skipping initialization')
      return
    }
    
    // Prevent overriding recent successful login (within 10 seconds)
    if (state.lastSuccessfulLogin && (Date.now() - state.lastSuccessfulLogin) < 10000) {
      console.log('🔒 Recent successful login detected, skipping initialization override')
      return
    }
    
    // Mark as attempting initialization
    if (state.initializationAttempted) {
      console.log('🔒 Initialization already attempted')
      return
    }
    
    set({ 
      initializationAttempted: true,
      authOperationInProgress: true,
      isLoading: true 
    })

    try {
      const storedToken = localStorage.getItem('ai-tempo-token')
      const storedUser = localStorage.getItem('ai-tempo-user')
      const storedRefresh = localStorage.getItem('ai-tempo-refresh')
      
      if (storedToken && storedUser) {
        const user = JSON.parse(storedUser)
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
        
        // Set initial auth state
        set({
          token: storedToken,
          user: user,
          refreshToken: storedRefresh,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
          authOperationInProgress: false
        })
        
        // Validate token silently in background
        get().checkAuthSilent()
      } else {
        set({
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
          authOperationInProgress: false
        })
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error)
      set({
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        authOperationInProgress: false,
        error: 'Initialization failed'
      })
    }
  },

  // Enhanced login with proper state management
  login: async (credentials) => {
    const state = get()
    
    // Prevent concurrent login attempts
    if (state.isLoggingIn || state.authOperationInProgress) {
      return { success: false, error: 'Authentication already in progress' }
    }

    try {
      set({ 
        isLoading: true, 
        isLoggingIn: true,
        authOperationInProgress: true,
        error: null 
      })
      
      const response = await axios.post('/auth/login', credentials)
      const { user, access_token, refresh_token } = response.data
      
      // Set authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      // Save to localStorage
      localStorage.setItem('ai-tempo-token', access_token)
      localStorage.setItem('ai-tempo-user', JSON.stringify(user))
      if (refresh_token) {
        localStorage.setItem('ai-tempo-refresh', refresh_token)
      }
      
      const now = Date.now()
      
      set({
        user,
        token: access_token,
        refreshToken: refresh_token,
        isAuthenticated: true,
        isLoading: false,
        isLoggingIn: false,
        isInitialized: true,
        authOperationInProgress: false,
        error: null,
        loginAttempts: 0,
        lastLoginAttempt: null,
        lastSuccessfulLogin: now
      })
      
      toast.success(`Welcome back, ${user.name}!`)
      return { success: true, user }
      
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Login failed'
      const newAttempts = get().loginAttempts + 1
      
      set({
        error: errorMessage,
        isLoading: false,
        isLoggingIn: false,
        authOperationInProgress: false,
        isInitialized: true,
        loginAttempts: newAttempts,
        lastLoginAttempt: Date.now()
      })
      
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  },

  // Enhanced register with proper state management
  register: async (userData) => {
    const state = get()
    
    if (state.authOperationInProgress) {
      return { success: false, error: 'Authentication operation in progress' }
    }

    try {
      set({ 
        isLoading: true,
        authOperationInProgress: true,
        error: null 
      })
      
      const response = await axios.post('/auth/register', userData)
      const { user, access_token, refresh_token } = response.data
      
      // Set authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      // Save to localStorage
      localStorage.setItem('ai-tempo-token', access_token)
      localStorage.setItem('ai-tempo-user', JSON.stringify(user))
      if (refresh_token) {
        localStorage.setItem('ai-tempo-refresh', refresh_token)
      }
      
      set({
        user,
        token: access_token,
        refreshToken: refresh_token,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        authOperationInProgress: false,
        error: null,
        lastSuccessfulLogin: Date.now()
      })
      
      toast.success(`Welcome to AI Tempo, ${user.name}!`)
      return { success: true, user }
      
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Registration failed'
      
      set({
        error: errorMessage,
        isLoading: false,
        isInitialized: true,
        authOperationInProgress: false
      })
      
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  },

  // Enhanced logout
  logout: async () => {
    set({ authOperationInProgress: true })
    
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
      // Clear client state and localStorage
      delete axios.defaults.headers.common['Authorization']
      
      localStorage.removeItem('ai-tempo-token')
      localStorage.removeItem('ai-tempo-user')
      localStorage.removeItem('ai-tempo-refresh')
      
      set({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: null,
        loginAttempts: 0,
        lastLoginAttempt: null,
        lastSuccessfulLogin: null,
        initializationAttempted: false,
        authOperationInProgress: false
      })
      
      toast.success('Logged out successfully')
    }
  },

  // Enhanced silent auth check with recent login preservation
  checkAuthSilent: async () => {
    const state = get()
    
    // Don't interrupt ongoing operations
    if (state.authOperationInProgress || state.isLoading) {
      return state.isAuthenticated
    }
    
    const { token, lastSuccessfulLogin } = state
    
    // If no token exists, quietly fail
    if (!token) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: null
      })
      return false
    }
    
    // If recent successful login (within 5 minutes), skip validation to prevent disruption
    if (lastSuccessfulLogin && (Date.now() - lastSuccessfulLogin) < 300000) {
      console.log('🔒 Recent successful login, skipping silent auth check')
      return state.isAuthenticated
    }
    
    try {
      // Quiet background validation
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      const response = await axios.get('/auth/me')
      const user = response.data
      
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null
      })
      
      return true
      
    } catch (error) {
      console.error('Silent auth check failed:', error)
      
      // If recent successful login, preserve auth state despite error
      if (lastSuccessfulLogin && (Date.now() - lastSuccessfulLogin) < 60000) {
        console.log('🔒 Preserving auth state due to recent successful login')
        return state.isAuthenticated
      }
      
      // Try to refresh token if available
      if (get().refreshToken) {
        const refreshSuccess = await get().refreshAccessToken()
        if (refreshSuccess) {
          return true
        }
      }
      
      // Only clear auth state if it's been a while since last successful login
      if (!lastSuccessfulLogin || (Date.now() - lastSuccessfulLogin) > 60000) {
        delete axios.defaults.headers.common['Authorization']
        
        localStorage.removeItem('ai-tempo-token')
        localStorage.removeItem('ai-tempo-user')
        localStorage.removeItem('ai-tempo-refresh')
        
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
          error: null
        })
      }
      
      return false
    }
  },

  // Expose public checkAuth for backward compatibility
  checkAuth: async () => {
    return get().checkAuthSilent()
  },

  // Enhanced token refresh
  refreshAccessToken: async () => {
    const state = get()
    
    if (state.authOperationInProgress) {
      return false
    }

    try {
      set({ authOperationInProgress: true })
      
      const { refreshToken } = state
      
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }
      
      const response = await axios.post('/auth/refresh', {
        refresh_token: refreshToken
      })
      
      const { access_token, refresh_token: newRefreshToken } = response.data
      
      // Update tokens
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      localStorage.setItem('ai-tempo-token', access_token)
      if (newRefreshToken) {
        localStorage.setItem('ai-tempo-refresh', newRefreshToken)
      }
      
      set({
        token: access_token,
        refreshToken: newRefreshToken || refreshToken,
        error: null,
        authOperationInProgress: false,
        lastSuccessfulLogin: Date.now()
      })
      
      return true
      
    } catch (error) {
      console.error('Token refresh failed:', error)
      
      set({ authOperationInProgress: false })
      
      // Force logout on refresh failure
      get().logout()
      return false
    }
  },

  // Enhanced profile update
  updateProfile: async (profileData) => {
    try {
      set({ isLoading: true, error: null })
      
      const response = await axios.put('/auth/profile', profileData)
      const updatedUser = response.data
      
      // Update localStorage
      localStorage.setItem('ai-tempo-user', JSON.stringify(updatedUser))
      
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

  // Enhanced password change
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

  // Password reset request
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

  // Password reset
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

  // Enhanced demo login with direct API call
  demoLogin: async () => {
    const state = get()
    
    // Prevent concurrent login attempts
    if (state.isLoggingIn || state.authOperationInProgress) {
      return { success: false, error: 'Authentication already in progress' }
    }

    try {
      set({ 
        isLoading: true, 
        isLoggingIn: true,
        authOperationInProgress: true,
        error: null 
      })
      
      // Try demo-login endpoint first
      let response
      try {
        response = await axios.post('/auth/demo-login')
      } catch (demoError) {
        // Fallback to regular login with demo credentials
        console.log('Demo login endpoint failed, trying regular login:', demoError.message)
        response = await axios.post('/auth/login', {
          email: 'demo@aicodestudio.com',
          password: 'demo123'
        })
      }
      
      const { user, access_token, refresh_token } = response.data
      
      // Set authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      // Save to localStorage
      localStorage.setItem('ai-tempo-token', access_token)
      localStorage.setItem('ai-tempo-user', JSON.stringify(user))
      if (refresh_token) {
        localStorage.setItem('ai-tempo-refresh', refresh_token)
      }
      
      const now = Date.now()
      
      set({
        user,
        token: access_token,
        refreshToken: refresh_token,
        isAuthenticated: true,
        isLoading: false,
        isLoggingIn: false,
        isInitialized: true,
        authOperationInProgress: false,
        error: null,
        loginAttempts: 0,
        lastLoginAttempt: null,
        lastSuccessfulLogin: now
      })
      
      toast.success(`Welcome to Aether AI Platform, ${user.name}! 🎉`)
      return { success: true, user }
      
    } catch (error) {
      console.error('Demo login failed:', error)
      const errorMessage = error.response?.data?.detail || 'Demo login failed'
      
      set({
        error: errorMessage,
        isLoading: false,
        isLoggingIn: false,
        authOperationInProgress: false,
        isInitialized: true
      })
      
      toast.error(`Demo login failed: ${errorMessage}`)
      return { success: false, error: errorMessage }
    }
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
  },

  // Reset initialization state (for testing or debugging)
  resetInitialization: () => {
    set({ 
      initializationAttempted: false,
      authOperationInProgress: false,
      isLoggingIn: false
    })
  }
}))

// Enhanced axios interceptors with better error handling
let isRefreshing = false
let refreshSubscribers = []

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb)
}

const onRefreshed = (token) => {
  refreshSubscribers.map(cb => cb(token))
  refreshSubscribers = []
}

// Enhanced request interceptor
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

// Enhanced response interceptor with intelligent retry logic
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const authStore = useAuthStore.getState()
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't refresh if we just had a successful login
      if (authStore.lastSuccessfulLogin && (Date.now() - authStore.lastSuccessfulLogin) < 30000) {
        console.log('🔒 Recent successful login, skipping token refresh')
        return Promise.reject(error)
      }
      
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
        const success = await authStore.refreshAccessToken()
        
        if (success) {
          const newToken = useAuthStore.getState().token
          isRefreshing = false
          onRefreshed(newToken)
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return axios(originalRequest)
        }
      } catch (refreshError) {
        isRefreshing = false
        console.error('Token refresh failed in interceptor:', refreshError)
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

export { useAuthStore }