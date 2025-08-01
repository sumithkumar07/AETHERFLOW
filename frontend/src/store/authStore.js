import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'
import toast from 'react-hot-toast'

// Get backend URL from environment
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'

// Configure axios defaults
axios.defaults.baseURL = `${BACKEND_URL}/api`

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      isHydrated: false, // Track if store has been hydrated from localStorage
      error: null,

      // Actions
      login: async (credentials) => {
        try {
          console.log('🔄 Login attempt started:', credentials.email)
          set({ isLoading: true, error: null })
          
          const response = await axios.post('/auth/login', credentials)
          console.log('✅ Login response:', response.data)
          
          const { user, access_token } = response.data
          
          // Set authorization header for future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
          
          const newState = {
            user,
            token: access_token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          }
          
          console.log('🔄 Setting new auth state:', newState)
          set(newState)
          
          // Verify state was set
          const currentState = get()
          console.log('✅ Current state after set:', { 
            isAuthenticated: currentState.isAuthenticated, 
            user: currentState.user?.email,
            token: currentState.token ? 'present' : 'missing'
          })
          
          toast.success(`Welcome back, ${user.name}!`)
          return { success: true, user }
          
        } catch (error) {
          console.error('❌ Login error:', error)
          const errorMessage = error.response?.data?.detail || 'Login failed'
          
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null
          })
          
          toast.error(errorMessage)
          return { success: false, error: errorMessage }
        }
      },

      logout: () => {
        delete axios.defaults.headers.common['Authorization']
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        })
        
        toast.success('Logged out successfully')
      },

      checkAuth: async () => {
        try {
          const { token, isHydrated } = get()
          console.log('🔄 Checking auth, token present:', !!token, 'hydrated:', isHydrated)
          
          // Don't check auth until store is hydrated
          if (!isHydrated) {
            console.log('⏳ Store not hydrated yet, skipping auth check')
            return false
          }
          
          if (!token) {
            console.log('❌ No token found after hydration')
            set({ isLoading: false, isAuthenticated: false })
            return false
          }
          
          // Set authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          // Verify token with server
          const response = await axios.get('/auth/me')
          const user = response.data
          console.log('✅ Auth check successful:', user.email)
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
          
          return true
          
        } catch (error) {
          console.error('❌ Auth check failed:', error)
          
          // Clear invalid auth state
          delete axios.defaults.headers.common['Authorization']
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
          
          return false
        }
      },

      // Demo login for testing
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

      // Internal action to mark store as hydrated
      _setHydrated: () => {
        console.log('🔄 Store hydration complete')
        set({ isHydrated: true })
      }
    }),
    {
      name: 'ai-tempo-auth-v2',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state, error) => {
        console.log('🔄 Rehydrating auth store...')
        if (error) {
          console.error('❌ Rehydration error:', error)
        } else {
          console.log('✅ Rehydration complete:', {
            hasUser: !!state?.user,
            hasToken: !!state?.token,
            isAuthenticated: state?.isAuthenticated
          })
          
          // Mark store as hydrated and trigger auth check
          const store = useAuthStore.getState()
          store._setHydrated()
          
          // If we have a token after rehydration, set up axios and verify
          if (state?.token) {
            console.log('🔄 Setting up axios with rehydrated token')
            axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
            // Trigger auth check after hydration
            setTimeout(() => {
              store.checkAuth()
            }, 100)
          } else {
            // No token, mark as not loading
            useAuthStore.setState({ isLoading: false })
          }
        }
      }
    }
  )
)

export { useAuthStore }