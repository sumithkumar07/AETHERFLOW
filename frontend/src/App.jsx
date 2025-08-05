import React, { useEffect, Suspense, useState, useRef, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { ErrorBoundary } from 'react-error-boundary'

// Enhanced imports
import SimplifiedNavigation from './components/SimplifiedNavigation'
import { SkipLink, ScreenReaderOnly } from './components/AccessibleComponents'
import { PerformanceMetrics } from './components/PerformanceOptimizedComponents'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'
import { useChatStore } from './store/chatStore'
import { useProjectStore } from './store/projectStore'

// Simplified lazy loaded pages for better performance
const EnhancedHome = lazy(() => import('./pages/EnhancedHome'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const ChatHub = lazy(() => import('./pages/ChatHub'))
const Projects = lazy(() => import('./pages/Projects'))
const Templates = lazy(() => import('./pages/Templates'))
const Settings = lazy(() => import('./pages/Settings'))

// Simple loading component instead of heavy OptimizedLoader
const SimpleLoader = ({ message = "Loading..." }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
    <motion.div 
      className="text-center max-w-sm"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl mb-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-3 border-white border-t-transparent rounded-full"
        />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Aether AI
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        {message}
      </p>
    </motion.div>
  </div>
)

// Enhanced Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <span className="text-2xl">⚠️</span>
      </motion.div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Something went wrong
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        The application encountered an error. Let's try to recover.
      </p>
      <div className="space-y-3">
        <button
          onClick={resetErrorBoundary}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  </div>
)

// Simplified Suspense Wrapper
const SimpleSuspenseWrapper = ({ children, fallbackMessage = "Loading..." }) => (
  <Suspense fallback={<SimpleLoader message={fallbackMessage} />}>
    <AnimatePresence mode="wait">
      {children}
    </AnimatePresence>
  </Suspense>
)

// Enhanced Protected Route
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore()
  
  if (isLoading) {
    return <SimpleLoader message="Verifying authentication..." />
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

// Public Route with faster loading
const PublicRoute = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

// Main App Component - OPTIMIZED FOR PERFORMANCE
function AppContent() {
  const { 
    isAuthenticated, 
    isLoading, 
    initialize
  } = useAuthStore()
  
  const { theme, initializeTheme } = useThemeStore()
  const { initializeModelsAndAgents } = useChatStore()
  const { fetchProjects } = useProjectStore()
  
  const [isInitialized, setIsInitialized] = useState(false)
  const initializationAttempted = useRef(false)

  // SIMPLIFIED & FAST initialization
  useEffect(() => {
    const initializeApp = async () => {
      if (initializationAttempted.current) return
      initializationAttempted.current = true
      
      console.log('🚀 Starting Aether AI Enhanced initialization...')
      
      try {
        // Initialize core services in parallel for speed
        await Promise.all([
          initializeTheme(),
          initialize(),
          initializeModelsAndAgents()
        ])
        
        // Optional: Load user projects only if authenticated
        if (isAuthenticated) {
          fetchProjects({ limit: 5 }).catch(console.warn)
        }
        
        console.log('✅ Aether AI initialization complete')
        setIsInitialized(true)
        
      } catch (error) {
        console.warn('⚠️ Some services failed to initialize:', error)
        // Continue anyway - app should work with degraded functionality
        setIsInitialized(true)
      }
    }
    
    initializeApp()
  }, [initialize, initializeTheme, initializeModelsAndAgents, fetchProjects, isAuthenticated])

  // Apply theme efficiently
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyboardShortcuts = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return
      }

      // Global shortcuts
      if (e.key === 'Escape') {
        document.dispatchEvent(new CustomEvent('closeAllModals'))
      }
      
      // Quick navigation shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault()
            window.location.href = isAuthenticated ? '/chat' : '/'
            break
          case '2':
            e.preventDefault()
            if (isAuthenticated) window.location.href = '/projects'
            break
          case '3':
            e.preventDefault()
            window.location.href = '/templates'
            break
          case ',':
            e.preventDefault()
            if (isAuthenticated) window.location.href = '/settings'
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyboardShortcuts)
    return () => document.removeEventListener('keydown', handleKeyboardShortcuts)
  }, [isAuthenticated])

  // Show loading only briefly
  if (!isInitialized) {
    return <SimpleLoader message="Starting Aether AI..." />
  }

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('App Error:', error, errorInfo)
      }}
    >
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
          {/* Accessibility: Skip to main content */}
          <SkipLink />
          
          {/* Simplified Navigation */}
          <SimplifiedNavigation />
          
          {/* Main Content Area */}
          <main id="main-content" className="relative">
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/" 
                element={
                  <PublicRoute>
                    <SimpleSuspenseWrapper fallbackMessage="Loading home...">
                      <EnhancedHome />
                    </SimpleSuspenseWrapper>
                  </PublicRoute>
                } 
              />
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <SimpleSuspenseWrapper fallbackMessage="Loading login...">
                      <Login />
                    </SimpleSuspenseWrapper>
                  </PublicRoute>
                } 
              />
              <Route 
                path="/signup" 
                element={
                  <PublicRoute>
                    <SimpleSuspenseWrapper fallbackMessage="Loading signup...">
                      <Signup />
                    </SimpleSuspenseWrapper>
                  </PublicRoute>
                } 
              />
              <Route 
                path="/templates" 
                element={
                  <SimpleSuspenseWrapper fallbackMessage="Loading templates...">
                    <Templates />
                  </SimpleSuspenseWrapper>
                } 
              />
              
              {/* Protected Routes - SIMPLIFIED STRUCTURE */}
              <Route 
                path="/chat" 
                element={
                  <ProtectedRoute>
                    <SimpleSuspenseWrapper fallbackMessage="Loading AI chat...">
                      <ChatHub />
                    </SimpleSuspenseWrapper>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/projects" 
                element={
                  <ProtectedRoute>
                    <SimpleSuspenseWrapper fallbackMessage="Loading projects...">
                      <Projects />
                    </SimpleSuspenseWrapper>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <SimpleSuspenseWrapper fallbackMessage="Loading settings...">
                      <Settings />
                    </SimpleSuspenseWrapper>
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch-all redirect */}
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
          </main>
          
          {/* Enhanced Toast Notifications */}
          <Toaster 
            position="top-right"
            containerClassName="z-50"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                borderRadius: '16px',
                color: '#374151',
                fontSize: '14px',
                maxWidth: '400px',
                fontWeight: '500'
              }
            }}
          />
          
          {/* Performance Metrics (Development Only) */}
          <PerformanceMetrics />
          
          {/* Live Region for Accessibility */}
          <div
            id="a11y-announcer"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          />
          
          {/* Simplified Development Info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed bottom-4 left-4 bg-black/90 text-white text-xs p-2 rounded-lg font-mono opacity-75 hover:opacity-100 transition-opacity z-40">
              <div className="flex space-x-4 text-[10px]">
                <span>Auth: {isAuthenticated ? '✅' : '❌'}</span>
                <span>Theme: {theme}</span>
                <span>Enhanced v2.1</span>
              </div>
            </div>
          )}
        </div>
      </Router>
    </ErrorBoundary>
  )
}

// Main App Component
function App() {
  return <AppContent />
}

export default App