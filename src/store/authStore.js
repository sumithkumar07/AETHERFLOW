import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Demo credentials for instant access
const DEMO_CREDENTIALS = {
  email: 'demo@aicodestudio.com',
  password: 'demo123'
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      loading: false,
      
      login: async (credentials) => {
        set({ loading: true })
        try {
          // Check demo credentials first
          if (credentials.email === DEMO_CREDENTIALS.email && 
              credentials.password === DEMO_CREDENTIALS.password) {
            const demoUser = {
              id: 'demo-user-1',
              name: 'AI Tempo Demo User',
              email: credentials.email,
              avatar: null,
              isDemo: true
            }
            
            set({ 
              isAuthenticated: true, 
              user: demoUser,
              loading: false 
            })
            
            // Store session in localStorage for persistence
            localStorage.setItem('aicodestudio_session', JSON.stringify({
              user: demoUser,
              isAuthenticated: true,
              timestamp: Date.now()
            }))
            
            return { success: true }
          }
          
          // Regular authentication for any other valid email/password
          if (credentials.email && credentials.password && credentials.password.length >= 6) {
            const user = {
              id: `user-${Date.now()}`,
              name: credentials.email.split('@')[0] || 'User',
              email: credentials.email,
              avatar: null,
              isDemo: false
            }
            
            set({ 
              isAuthenticated: true, 
              user: user,
              loading: false 
            })
            
            // Store session in localStorage for persistence
            localStorage.setItem('aicodestudio_session', JSON.stringify({
              user: user,
              isAuthenticated: true,
              timestamp: Date.now()
            }))
            
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
          if (userData.email && userData.password && userData.name) {
            const user = {
              id: `user-${Date.now()}`,
              name: userData.name,
              email: userData.email,
              avatar: null,
              isDemo: false
            }
            
            set({ 
              isAuthenticated: true, 
              user: user,
              loading: false 
            })
            
            // Store session in localStorage for persistence
            localStorage.setItem('aicodestudio_session', JSON.stringify({
              user: user,
              isAuthenticated: true,
              timestamp: Date.now()
            }))
            
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
      
      logout: () => {
        try {
          // Clear session from localStorage
          localStorage.removeItem('aicodestudio_session')
          
          set({ 
            isAuthenticated: false, 
            user: null 
          })
        } catch (error) {
          console.error('Logout error:', error)
        }
      },
      
      checkAuth: () => {
        try {
          const session = localStorage.getItem('aicodestudio_session')
          if (session) {
            const parsedSession = JSON.parse(session)
            // Check if session is not older than 30 days
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
            if (parsedSession.timestamp > thirtyDaysAgo) {
              set({ 
                isAuthenticated: true, 
                user: parsedSession.user 
              })
              return true
            } else {
              // Session expired, clear it
              localStorage.removeItem('aicodestudio_session')
            }
          }
          return false
        } catch (error) {
          console.error('Auth check error:', error)
          return false
        }
      },

      // Demo login helper
      loginDemo: async () => {
        return get().login(DEMO_CREDENTIALS)
      }
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated, 
        user: state.user 
      })
    }
  )
)