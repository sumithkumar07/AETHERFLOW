import React, { useEffect, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import Navigation from './components/Navigation'
import LoadingStates from './components/LoadingStates'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'

// Lazy load pages for better performance
const Home = React.lazy(() => import('./pages/Home'))
const Login = React.lazy(() => import('./pages/Login'))
const Signup = React.lazy(() => import('./pages/Signup'))
const ChatHub = React.lazy(() => import('./pages/ChatHub'))
const IndividualProject = React.lazy(() => import('./pages/IndividualProject'))
const Templates = React.lazy(() => import('./pages/Templates'))
const Integrations = React.lazy(() => import('./pages/Integrations'))
const Settings = React.lazy(() => import('./pages/Settings'))
const Profile = React.lazy(() => import('./pages/Profile'))

// Enhanced Protected Route component with proper loading states
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isInitialized } = useAuthStore()
  
  // Show loading while auth is being checked or store is not initialized
  if (isLoading || !isInitialized) {
    return <LoadingStates.FullScreen message="Checking authentication..." />
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// Enhanced Public Route component 
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isInitialized } = useAuthStore()
  
  // Show loading while auth is being checked or store is not initialized
  if (isLoading || !isInitialized) {
    return <LoadingStates.FullScreen message="Loading application..." />
  }
  
  return children
}

// Enhanced loading component with better UX
const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<LoadingStates.PageTransition />}>
    <AnimatePresence mode="wait">
      {children}
    </AnimatePresence>
  </Suspense>
)

function App() {
  const { isAuthenticated, isLoading, isInitialized, initialize } = useAuthStore()
  const { theme, initializeTheme } = useThemeStore()

  useEffect(() => {
    // Initialize theme and authentication on app startup
    const initializeApp = async () => {
      try {
        // Initialize theme first (synchronous)
        initializeTheme()
        
        // Initialize auth store (handles rehydration and validation)
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          initialize()
        }, 10)
        
      } catch (error) {
        console.error('App initialization error:', error)
      }
    }
    
    initializeApp()
  }, [initialize, initializeTheme])

  // Apply theme class to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  // Show loading screen during initial app load and auth check
  if (!isInitialized) {
    return <LoadingStates.FullScreen message="Initializing AI Tempo..." />
  }

  if (isLoading) {
    return <LoadingStates.FullScreen message="Checking authentication..." />
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
        <Navigation />
        
        <main className="relative">
          <SuspenseWrapper>
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/" 
                element={
                  <PublicRoute>
                    <Home />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/signup" 
                element={
                  <PublicRoute>
                    <Signup />
                  </PublicRoute>
                } 
              />
              <Route path="/templates" element={<Templates />} />
              
              {/* Protected Routes */}
              <Route 
                path="/chat" 
                element={
                  <ProtectedRoute>
                    <ChatHub />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/chat/:projectId" 
                element={
                  <ProtectedRoute>
                    <IndividualProject />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/integrations" 
                element={
                  <ProtectedRoute>
                    <Integrations />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch-all redirect - only after auth is determined */}
              <Route 
                path="*" 
                element={
                  <Navigate 
                    to={isAuthenticated ? "/chat" : "/"} 
                    replace 
                  />
                } 
              />
            </Routes>
          </SuspenseWrapper>
        </main>
        
        {/* Enhanced toast notifications with better styling */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              borderRadius: '12px',
              color: '#374151',
              fontSize: '14px',
              maxWidth: '400px',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#ffffff',
              },
              style: {
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                color: '#065f46',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#ffffff',
              },
              style: {
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#7f1d1d',
              },
            },
            loading: {
              iconTheme: {
                primary: '#3B82F6',
                secondary: '#ffffff',
              },
              style: {
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                color: '#1e3a8a',
              },
            },
          }}
        />
        
        {/* Global error boundary fallback */}
        <div id="error-boundary-root" />
        
        {/* Accessibility announcements */}
        <div
          id="a11y-announcer"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />
        
        {/* Development overlay for debugging */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 left-4 bg-black/80 text-white text-xs p-2 rounded font-mono opacity-50 pointer-events-none">
            Auth: {isAuthenticated ? '✅' : '❌'} | 
            Loading: {isLoading ? '⏳' : '✅'} | 
            Init: {isInitialized ? '✅' : '⏳'}
          </div>
        )}
      </div>
    </Router>
  )
}

export default App