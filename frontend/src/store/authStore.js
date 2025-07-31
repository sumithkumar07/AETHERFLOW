import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      loading: false,
      
      login: async (credentials) => {
        set({ loading: true })
        try {
          const response = await authAPI.login(credentials)
          
          // Store token
          localStorage.setItem('auth_token', response.access_token)
          localStorage.setItem('user', JSON.stringify(response.user))
          
          set({ 
            isAuthenticated: true, 
            user: response.user,
            loading: false 
          })
          
          return { success: true }
        } catch (error) {
          set({ loading: false })
          const errorMessage = error.response?.data?.detail || 'Login failed'
          return { success: false, error: errorMessage }
        }
      },
      
      register: async (userData) => {
        set({ loading: true })
        try {
          const response = await authAPI.register(userData)
          
          // Store token
          localStorage.setItem('auth_token', response.access_token)
          localStorage.setItem('user', JSON.stringify(response.user))
          
          set({ 
            isAuthenticated: true, 
            user: response.user,
            loading: false 
          })
          
          return { success: true }
        } catch (error) {
          set({ loading: false })
          const errorMessage = error.response?.data?.detail || 'Registration failed'
          return { success: false, error: errorMessage }
        }
      },
      
      logout: () => {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        set({ 
          isAuthenticated: false, 
          user: null 
        })
        toast.success('Logged out successfully')
      },
      
      checkAuth: async () => {
        const token = localStorage.getItem('auth_token')
        const userData = localStorage.getItem('user')
        
        if (token && userData) {
          try {
            // Verify token is still valid
            const user = await authAPI.getCurrentUser()
            set({ 
              isAuthenticated: true, 
              user: user 
            })
          } catch (error) {
            // Token expired or invalid
            get().logout()
          }
        }
      },
      
      updateUser: (userData) => {
        set(state => ({
          user: { ...state.user, ...userData }
        }))
        localStorage.setItem('user', JSON.stringify({ ...get().user, ...userData }))
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated,
        user: state.user 
      }),
    }
  )
)