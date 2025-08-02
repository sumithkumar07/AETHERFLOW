import React, { useEffect, Suspense, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { HelmetProvider } from 'react-helmet-async'
import I18nProvider from './components/i18n/I18nProvider'
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
const EnhancedFeaturesDemo = React.lazy(() => import('./components/EnhancedFeaturesDemo'))

// Enhanced Protected Route component with better state management
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isInitialized, lastSuccessfulLogin, authOperationInProgress } = useAuthStore()
  
  // Show loading while auth is being checked, store is not initialized, or auth operation in progress
  if (isLoading || !isInitialized || authOperationInProgress) {
    return <LoadingStates.FullScreen message="Verifying authentication..." />
  }
  
  // If recently logged in (within 5 seconds), show loading briefly to prevent flash
  if (lastSuccessfulLogin && (Date.now() - lastSuccessfulLogin) < 5000 && !isAuthenticated) {
    return <LoadingStates.FullScreen message="Completing authentication..." />
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// Enhanced Public Route component with smart loading
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isInitialized, authOperationInProgress } = useAuthStore()
  
  // Show loading while auth is being checked, during initialization, or during auth operations
  if (isLoading || !isInitialized || authOperationInProgress) {
    return <LoadingStates.FullScreen message="Loading application..." />
  }
  
  return children
}

// Enhanced loading component with better animations
const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<LoadingStates.PageTransition />}>
    <AnimatePresence mode="wait">
      {children}
    </AnimatePresence>
  </Suspense>
)

function App() {
  const { theme, initializeTheme } = useThemeStore()
  const { initialize, isInitialized } = useAuthStore()
  const initializationRef = useRef(false)

  // Initialize theme only
  useEffect(() => {
    try {
      initializeTheme()
    } catch (error) {
      console.error('Theme initialization error:', error)
    }
  }, [initializeTheme])

  // Apply theme class to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  // Enhanced auth initialization with race condition prevention
  useEffect(() => {
    // Prevent multiple initialization attempts
    if (initializationRef.current || isInitialized) {
      return
    }
    
    initializationRef.current = true
    
    // Small delay to ensure all components are mounted
    const initTimeout = setTimeout(() => {
      initialize()
    }, 100)

    return () => {
      clearTimeout(initTimeout)
    }
  }, [initialize, isInitialized])

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 transition-all duration-500">
        <Navigation />
        
        <main className="relative">
          <SuspenseWrapper>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
              <Route path="/templates" element={<PublicRoute><Templates /></PublicRoute>} />
              <Route path="/demo" element={<PublicRoute><EnhancedFeaturesDemo /></PublicRoute>} />
              
              {/* Protected routes */}
              <Route path="/chat" element={<ProtectedRoute><ChatHub /></ProtectedRoute>} />
              <Route path="/chat/:projectId" element={<ProtectedRoute><IndividualProject /></ProtectedRoute>} />
              <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              
              {/* Catch all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
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
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 20px 32px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.08)',
              borderRadius: '16px',
              color: '#374151',
              fontSize: '14px',
              maxWidth: '420px',
              padding: '16px 20px',
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
        
        {/* Enhanced development overlay */}
        {process.env.NODE_ENV === 'development' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            className="fixed bottom-4 left-4 bg-black/90 text-white text-xs p-3 rounded-lg font-mono pointer-events-none border border-white/20 backdrop-blur-sm"
          >
            <div>Auth: {useAuthStore.getState().isAuthenticated ? '✅' : '❌'}</div>
            <div>Theme: {theme}</div>
            <div>Mode: ENHANCED</div>
          </motion.div>
        )}
      </div>
    </Router>
  )
}

export default App