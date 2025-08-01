import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import toast from 'react-hot-toast'
import { ServiceFactory } from '../services/ServiceFactory'

/**
 * Enhanced Auth Store with Service Layer Integration
 * Backwards compatible with existing authStore while adding enterprise patterns
 */

// Initialize service factory
let serviceFactory = null
let authService = null
let eventBus = null

const initializeServices = async () => {
  if (!serviceFactory) {
    serviceFactory = ServiceFactory.getInstance()
    await serviceFactory.initialize()
    authService = serviceFactory.getAuthService()
    eventBus = serviceFactory.getEventBus()
  }
}

// Enhanced auth store with service layer integration
const useEnhancedAuthStore = create(
  persist(
    (set, get) => ({
      // Existing state (preserved for compatibility)
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,
      loginAttempts: 0,
      lastLoginAttempt: null,

      // Enhanced state
      authMetrics: {
        loginCount: 0,
        lastLogin: null,
        sessionDuration: 0,
        failedAttempts: 0
      },
      
      // Services (injected)
      _services: null,

      // Enhanced actions with service layer
      login: async (credentials) => {
        try {
          await initializeServices()
          set({ isLoading: true, error: null })

          // Use service layer for login
          const api = serviceFactory.getAPIGateway()
          const response = await api.post('/auth/login', credentials, {
            cache: false, // Never cache login requests
            retryAttempts: 1 // Don't retry login failures
          })

          const { user, access_token, refresh_token } = response

          const authData = {
            user,
            token: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            loginAttempts: 0,
            lastLoginAttempt: null,
            authMetrics: {
              ...get().authMetrics,
              loginCount: get().authMetrics.loginCount + 1,
              lastLogin: Date.now(),
              failedAttempts: 0
            }
          }

          set(authData)

          // Emit success event
          eventBus.emit('auth.login.success', {
            user,
            timestamp: Date.now(),
            method: 'credentials'
          })

          // Track analytics
          const analytics = serviceFactory.getAnalyticsService()
          analytics.track('user_login', {
            user_id: user.id,
            login_method: 'credentials'
          })

          toast.success(`Welcome back, ${user.name}!`)
          return { success: true, user }

        } catch (error) {
          const errorMessage = error.message || error.response?.data?.detail || 'Login failed'
          const newAttempts = get().loginAttempts + 1

          set({
            error: errorMessage,
            isLoading: false,
            loginAttempts: newAttempts,
            lastLoginAttempt: Date.now(),
            authMetrics: {
              ...get().authMetrics,
              failedAttempts: get().authMetrics.failedAttempts + 1
            }
          })

          // Emit error event
          if (eventBus) {
            eventBus.emit('auth.login.error', {
              error: errorMessage,
              attempts: newAttempts,
              timestamp: Date.now()
            })
          }

          toast.error(errorMessage)
          return { success: false, error: errorMessage }
        }
      },

      register: async (userData) => {
        try {
          await initializeServices()
          set({ isLoading: true, error: null })

          const api = serviceFactory.getAPIGateway()
          const response = await api.post('/auth/register', userData, {
            cache: false,
            retryAttempts: 1
          })

          const { user, access_token, refresh_token } = response

          set({
            user,
            token: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            authMetrics: {
              ...get().authMetrics,
              loginCount: 1,
              lastLogin: Date.now(),
              failedAttempts: 0
            }
          })

          // Emit events
          eventBus.emit('auth.register.success', {
            user,
            timestamp: Date.now()
          })

          const analytics = serviceFactory.getAnalyticsService()
          analytics.track('user_register', {
            user_id: user.id,
            registration_method: 'form'
          })

          toast.success(`Welcome to AI Tempo, ${user.name}!`)
          return { success: true, user }

        } catch (error) {
          const errorMessage = error.message || error.response?.data?.detail || 'Registration failed'

          set({
            error: errorMessage,
            isLoading: false
          })

          if (eventBus) {
            eventBus.emit('auth.register.error', {
              error: errorMessage,
              timestamp: Date.now()
            })
          }

          toast.error(errorMessage)
          return { success: false, error: errorMessage }
        }
      },

      logout: async () => {
        try {
          await initializeServices()
          
          // Calculate session duration
          const sessionStart = get().authMetrics.lastLogin
          const sessionDuration = sessionStart ? Date.now() - sessionStart : 0

          // Attempt server logout
          if (get().token) {
            try {
              const api = serviceFactory.getAPIGateway()
              await api.post('/auth/logout', {
                refresh_token: get().refreshToken
              })
            } catch (error) {
              console.warn('Server logout failed:', error)
            }
          }

          // Update metrics before clearing state
          const finalMetrics = {
            ...get().authMetrics,
            sessionDuration: sessionDuration
          }

          // Clear state
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            loginAttempts: 0,
            lastLoginAttempt: null,
            authMetrics: {
              ...finalMetrics,
              lastLogin: null
            }
          })

          // Emit events
          eventBus.emit('auth.logout.success', {
            sessionDuration,
            timestamp: Date.now()
          })

          const analytics = serviceFactory.getAnalyticsService()
          analytics.track('user_logout', {
            session_duration: sessionDuration
          })

          // Clear service layer caches
          const cache = serviceFactory.getCacheManager()
          await cache.invalidatePattern('*user*')
          await cache.invalidatePattern('*auth*')

          toast.success('Logged out successfully')

        } catch (error) {
          console.error('Logout error:', error)
          
          // Force clear state even if logout fails
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
        }
      },

      // Enhanced initialization with service layer
      initialize: async () => {
        try {
          await initializeServices()
          
          const { token } = get()

          if (!token) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
              isInitialized: true
            })
            return false
          }

          // Use service layer for auth check
          const isValid = await get().checkAuthSilent()

          set(state => ({
            ...state,
            isInitialized: true
          }))

          return isValid

        } catch (error) {
          console.error('Auth initialization error:', error)
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

      // Enhanced auth check with service layer
      checkAuth: async () => {
        try {
          await initializeServices()
          
          const { token } = get()

          if (!token) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null
            })
            return false
          }

          set({ isLoading: true, error: null })

          // Use enhanced auth service
          const user = await authService.getCurrentUser()

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })

          return true

        } catch (error) {
          console.error('Auth check failed:', error)

          // Try refresh token
          if (get().refreshToken) {
            const refreshSuccess = await get().refreshAccessToken()
            if (refreshSuccess) {
              return true
            }
          }

          // Clear invalid auth
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

      // Enhanced silent auth check
      checkAuthSilent: async () => {
        try {
          await initializeServices()
          
          const { token, isAuthenticated, user } = get()

          if (!token) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null
            })
            return false
          }

          // Skip validation if already authenticated with user data
          if (isAuthenticated && user) {
            return true
          }

          // Use cached user data if available
          const cache = serviceFactory.getCacheManager()
          const cachedUser = await cache.get(`user:${token}`)
          
          if (cachedUser) {
            set({
              user: cachedUser,
              isAuthenticated: true,
              isLoading: false,
              error: null
            })
            return true
          }

          // Validate with server
          const userData = await authService.getCurrentUser()

          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })

          // Cache user data
          await cache.set(`user:${token}`, userData, 300000) // 5 minutes

          return true

        } catch (error) {
          // Only clear state for actual auth failures
          if (error.response?.status === 401 && !get().isAuthenticated) {
            if (get().refreshToken) {
              try {
                const refreshSuccess = await get().refreshAccessToken()
                if (refreshSuccess) return true
              } catch (refreshError) {
                console.error('Token refresh failed:', refreshError)
              }
            }

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

      // Enhanced token refresh with service layer
      refreshAccessToken: async () => {
        try {
          await initializeServices()
          
          const { refreshToken } = get()

          if (!refreshToken) {
            throw new Error('No refresh token available')
          }

          const response = await authService.refreshToken()
          const { access_token, refresh_token: newRefreshToken } = response

          set({
            token: access_token,
            refreshToken: newRefreshToken || refreshToken,
            error: null
          })

          // Update cached user data with new token
          const cache = serviceFactory.getCacheManager()
          if (get().user) {
            await cache.set(`user:${access_token}`, get().user, 300000)
          }

          return true

        } catch (error) {
          console.error('Token refresh failed:', error)
          get().logout()
          return false
        }
      },

      // Enhanced profile update with service layer
      updateProfile: async (profileData) => {
        try {
          await initializeServices()
          set({ isLoading: true, error: null })

          const api = serviceFactory.getAPIGateway()
          const response = await api.put('/auth/profile', profileData)
          const updatedUser = response

          set({
            user: updatedUser,
            isLoading: false,
            error: null
          })

          // Update cache
          if (get().token) {
            const cache = serviceFactory.getCacheManager()
            await cache.set(`user:${get().token}`, updatedUser, 300000)
            await cache.invalidatePattern('*user*') // Invalidate related caches
          }

          // Emit event
          eventBus.emit('auth.profile.updated', {
            user: updatedUser,
            changes: profileData,
            timestamp: Date.now()
          })

          toast.success('Profile updated successfully')
          return { success: true, user: updatedUser }

        } catch (error) {
          const errorMessage = error.message || 'Profile update failed'

          set({
            error: errorMessage,
            isLoading: false
          })

          toast.error(errorMessage)
          return { success: false, error: errorMessage }
        }
      },

      // Demo login with enhanced tracking
      demoLogin: async () => {
        const analytics = serviceFactory?.getAnalyticsService()
        analytics?.track('demo_login_attempted')
        
        return get().login({
          email: 'demo@aicodestudio.com',
          password: 'demo123'
        })
      },

      // Enhanced utility methods
      getAuthMetrics: () => get().authMetrics,
      
      getSessionDuration: () => {
        const lastLogin = get().authMetrics.lastLogin
        return lastLogin ? Date.now() - lastLogin : 0
      },

      isRateLimited: () => {
        const { loginAttempts, lastLoginAttempt } = get()
        const now = Date.now()
        const fiveMinutes = 5 * 60 * 1000
        
        return loginAttempts >= 5 && (now - lastLoginAttempt) < fiveMinutes
      },

      getRateLimitTime: () => {
        const { lastLoginAttempt } = get()
        const now = Date.now()
        const fiveMinutes = 5 * 60 * 1000
        const timeLeft = fiveMinutes - (now - lastLoginAttempt)
        
        return Math.max(0, Math.ceil(timeLeft / 1000))
      },

      clearError: () => set({ error: null }),

      // Service integration methods
      _initializeServices: initializeServices,
      
      getServices: () => ({
        factory: serviceFactory,
        auth: authService,
        eventBus: eventBus
      })
    }),
    {
      name: 'ai-tempo-auth-enhanced',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        loginAttempts: state.loginAttempts,
        lastLoginAttempt: state.lastLoginAttempt,
        authMetrics: state.authMetrics
      }),
      version: 4,
      migrate: (persistedState, version) => {
        if (version < 4) {
          return {
            ...persistedState,
            authMetrics: {
              loginCount: 0,
              lastLogin: null,
              sessionDuration: 0,
              failedAttempts: 0,
              ...persistedState.authMetrics
            }
          }
        }
        return persistedState
      }
    }
  )
)

export { useEnhancedAuthStore }