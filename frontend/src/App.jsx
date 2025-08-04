import React, { useEffect, Suspense, useState, useRef, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { ErrorBoundary } from 'react-error-boundary'

// Enhanced imports
import ModernNavigation from './components/ModernNavigation'
import { SkipLink, ScreenReaderOnly } from './components/AccessibleComponents'
import { PerformanceMetrics, OptimizedLoader } from './components/PerformanceOptimizedComponents'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'
import { useChatStore } from './store/chatStore'
import { useProjectStore } from './store/projectStore'
import realTimeAPI from './services/realTimeAPI'
import realTimeIntegration from './services/realTimeIntegration'

// Lazy loaded pages for better performance
const EnhancedHome = lazy(() => import('./pages/EnhancedHome'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const ChatHub = lazy(() => import('./pages/ChatHub'))
const IndividualProject = lazy(() => import('./pages/IndividualProject'))
const Templates = lazy(() => import('./pages/Templates'))
const Integrations = lazy(() => import('./pages/Integrations'))
const Settings = lazy(() => import('./pages/Settings'))
const Profile = lazy(() => import('./pages/Profile'))
const Projects = lazy(() => import('./pages/Projects'))
const Deploy = lazy(() => import('./pages/Deploy'))
const Agents = lazy(() => import('./pages/Agents'))
const Enterprise = lazy(() => import('./pages/Enterprise'))
const Subscription = lazy(() => import('./pages/Subscription'))
const SubscriptionDashboard = lazy(() => import('./pages/SubscriptionDashboard'))
const EnhancedAdvancedFeatures = lazy(() => import('./pages/EnhancedAdvancedFeatures'))
const AdvancedAnalytics = lazy(() => import('./pages/AdvancedAnalytics'))
const PerformanceMonitor = lazy(() => import('./pages/PerformanceMonitor'))
const EnhancedWorkflowsPage = lazy(() => import('./pages/EnhancedWorkflowsPage'))

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
        An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
      </p>
      <div className="space-y-3">
        <button
          onClick={resetErrorBoundary}
          className="w-full btn-primary"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="w-full btn-secondary"
        >
          Refresh Page
        </button>
      </div>
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-6 text-left">
          <summary className="cursor-pointer text-sm font-medium text-gray-500 dark:text-gray-400">
            Error Details (Development)
          </summary>
          <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-auto">
            {error?.stack}
          </pre>
        </details>
      )}
    </div>
  </div>
)

// Enhanced Loading Component with better UX
const EnhancedSuspenseWrapper = ({ children, fallbackMessage = "Loading..." }) => (
  <Suspense fallback={
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
      <motion.div 
        className="text-center max-w-sm"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Enhanced Loading Animation */}
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
            <OptimizedLoader size="large" color="white" />
          </div>
          
          {/* Pulse Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-3xl opacity-30"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Aether AI
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {fallbackMessage}
        </p>
        
        {/* Progress Indicator */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </div>
  }>
    <AnimatePresence mode="wait">
      {children}
    </AnimatePresence>
  </Suspense>
)

// Enhanced Protected Route with better loading states
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isInitialized } = useAuthStore()
  
  if (!isInitialized || isLoading) {
    return (
      <EnhancedSuspenseWrapper fallbackMessage="Verifying authentication...">
        <div />
      </EnhancedSuspenseWrapper>
    )
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

// Enhanced Public Route
const PublicRoute = ({ children }) => {
  const { isLoading } = useAuthStore()
  
  if (isLoading) {
    return (
      <EnhancedSuspenseWrapper fallbackMessage="Loading application...">
        <div />
      </EnhancedSuspenseWrapper>
    )
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

// Main App Component with Enhanced Performance and Accessibility
function AppContent() {
  const { 
    isAuthenticated, 
    isLoading, 
    token, 
    initialize, 
    isInitialized: authInitialized 
  } = useAuthStore()
  
  const { theme, initializeTheme } = useThemeStore()
  const { initializeModelsAndAgents } = useChatStore()
  const { fetchProjects } = useProjectStore()
  
  const [isInitialized, setIsInitialized] = useState(false)
  const [realTimeConnected, setRealTimeConnected] = useState(false)
  const [initializationProgress, setInitializationProgress] = useState(0)
  const [currentInitStep, setCurrentInitStep] = useState('Starting...')
  
  const initializationAttempted = useRef(false)
  const startTime = useRef(performance.now())

  // Enhanced initialization with progress tracking
  useEffect(() => {
    const initializeApp = async () => {
      if (initializationAttempted.current) return
      initializationAttempted.current = true
      
      console.log('🚀 Starting Enhanced Aether AI initialization...')
      
      const steps = [
        { name: 'Theme System', fn: () => initializeTheme() },
        { name: 'Authentication', fn: () => initialize() },
        { name: 'AI Models & Agents', fn: () => initializeModelsAndAgents() },
        { name: 'Real-time Services', fn: async () => {
          try {
            await realTimeAPI.initializeWebSocket('main-app-client')
            const rtStatus = await realTimeIntegration.initialize()
            setRealTimeConnected(rtStatus)
            return rtStatus
          } catch (error) {
            console.warn('Real-time services unavailable:', error)
            return false
          }
        }},
        { name: 'User Projects', fn: async () => {
          if (isAuthenticated) {
            await fetchProjects({ limit: 10 })
          }
        }}
      ]
      
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i]
        setCurrentInitStep(step.name)
        setInitializationProgress((i / steps.length) * 100)
        
        try {
          await step.fn()
          console.log(`✅ ${step.name} initialized`)
        } catch (error) {
          console.warn(`⚠️ ${step.name} initialization failed:`, error)
        }
        
        // Small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      setInitializationProgress(100)
      setCurrentInitStep('Complete')
      
      // Performance monitoring
      const initTime = performance.now() - startTime.current
      console.log(`✅ Aether AI Enhanced initialization complete in ${initTime.toFixed(2)}ms`)
      
      // Check for onboarding
      if (isAuthenticated && !localStorage.getItem('aether-ai-onboarding-complete')) {
        setTimeout(() => {
          // Onboarding logic would go here
          console.log('🎯 User onboarding available')
        }, 1000)
      }
      
      setIsInitialized(true)
    }
    
    initializeApp()
  }, [initialize, initializeTheme, initializeModelsAndAgents, fetchProjects, isAuthenticated])

  // Apply theme with smooth transition
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    
    // Add theme transition class
    document.documentElement.style.setProperty('--theme-transition', 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)')
  }, [theme])

  // Enhanced global keyboard shortcuts
  useEffect(() => {
    const handleKeyboardShortcuts = (e) => {
      // Skip if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return
      }

      // Global shortcuts
      if (e.key === 'Escape') {
        // Close any open modals/overlays
        document.dispatchEvent(new CustomEvent('closeAllModals'))
      }
      
      // Debug mode toggle (Shift + Ctrl + D)
      if (e.shiftKey && e.ctrlKey && e.key === 'D' && process.env.NODE_ENV === 'development') {
        e.preventDefault()
        document.body.classList.toggle('debug-mode')
      }
    }

    document.addEventListener('keydown', handleKeyboardShortcuts)
    return () => document.removeEventListener('keydown', handleKeyboardShortcuts)
  }, [])

  // Service Worker Registration for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js')
          console.log('SW registered: ', registration)
          
          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Show update notification
                  console.log('New version available')
                }
              })
            }
          })
        } catch (error) {
          console.log('SW registration failed: ', error)
        }
      })
    }
  }, [])

  // Show enhanced loading screen during initial app load
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
        <motion.div 
          className="text-center max-w-lg w-full px-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Logo and Branding */}
          <motion.div
            className="relative mb-8"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
              <OptimizedLoader size="large" color="white" />
            </div>
            
            {/* Animated rings */}
            <motion.div
              className="absolute inset-0 border-4 border-blue-200 dark:border-blue-800 rounded-3xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Aether AI Enhanced
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Initializing next-generation AI capabilities...
          </p>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {currentInitStep}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round(initializationProgress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 h-3 rounded-full shadow-sm"
                initial={{ width: "0%" }}
                animate={{ width: `${initializationProgress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
          
          {/* Status Indicators */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-center space-x-2 p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>GROQ AI Connected</span>
            </div>
            <div className="flex items-center justify-center space-x-2 p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl">
              <div className={`w-2 h-2 rounded-full ${realTimeConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
              <span>Real-time {realTimeConnected ? 'Active' : 'Loading...'}</span>
            </div>
          </div>
          
          <ScreenReaderOnly>
            Loading Aether AI Enhanced platform. Current step: {currentInitStep}. 
            Progress: {Math.round(initializationProgress)} percent complete.
          </ScreenReaderOnly>
        </motion.div>
      </div>
    )
  }

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('App Error:', error, errorInfo)
        // Here you could send error to monitoring service
      }}
    >
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
          {/* Accessibility: Skip to main content */}
          <SkipLink />
          
          {/* Enhanced Navigation */}
          <ModernNavigation />
          
          {/* Main Content Area */}
          <main id="main-content" className="relative">
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/" 
                element={
                  <PublicRoute>
                    <EnhancedSuspenseWrapper fallbackMessage="Loading home page...">
                      <EnhancedHome />
                    </EnhancedSuspenseWrapper>
                  </PublicRoute>
                } 
              />
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <EnhancedSuspenseWrapper fallbackMessage="Loading login...">
                      <Login />
                    </EnhancedSuspenseWrapper>
                  </PublicRoute>
                } 
              />
              <Route 
                path="/signup" 
                element={
                  <PublicRoute>
                    <EnhancedSuspenseWrapper fallbackMessage="Loading signup...">
                      <Signup />
                    </EnhancedSuspenseWrapper>
                  </PublicRoute>
                } 
              />
              <Route 
                path="/templates" 
                element={
                  <EnhancedSuspenseWrapper fallbackMessage="Loading templates...">
                    <Templates />
                  </EnhancedSuspenseWrapper>
                } 
              />
              
              {/* Protected Routes */}
              <Route 
                path="/chat" 
                element={
                  <ProtectedRoute>
                    <EnhancedSuspenseWrapper fallbackMessage="Loading AI chat...">
                      <ChatHub />
                    </EnhancedSuspenseWrapper>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/projects" 
                element={
                  <ProtectedRoute>
                    <EnhancedSuspenseWrapper fallbackMessage="Loading projects...">
                      <Projects />
                    </EnhancedSuspenseWrapper>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/workflows" 
                element={
                  <ProtectedRoute>
                    <EnhancedSuspenseWrapper fallbackMessage="Loading workflows...">
                      <EnhancedWorkflowsPage />
                    </EnhancedSuspenseWrapper>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/projects/:projectId" 
                element={
                  <ProtectedRoute>
                    <EnhancedSuspenseWrapper fallbackMessage="Loading project...">
                      <IndividualProject />
                    </EnhancedSuspenseWrapper>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/chat/:projectId" 
                element={
                  <ProtectedRoute>
                    <EnhancedSuspenseWrapper fallbackMessage="Loading project chat...">
                      <IndividualProject />
                    </EnhancedSuspenseWrapper>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/agents" 
                element={
                  <ProtectedRoute>
                    <EnhancedSuspenseWrapper fallbackMessage="Loading AI agents...">
                      <Agents />
                    </EnhancedSuspenseWrapper>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/deploy" 
                element={
                  <ProtectedRoute>
                    <EnhancedSuspenseWrapper fallbackMessage="Loading deployment...">
                      <Deploy />
                    </EnhancedSuspenseWrapper>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/enterprise" 
                element={
                  <ProtectedRoute>
                    <EnhancedSuspenseWrapper fallbackMessage="Loading enterprise features...">
                      <Enterprise />
                    </EnhancedSuspenseWrapper>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/advanced" 
                element={
                  <ProtectedRoute>
                    <EnhancedSuspenseWrapper fallbackMessage="Loading advanced features...">
                      <EnhancedAdvancedFeatures />
                    </EnhancedSuspenseWrapper>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/analytics" 
                element={
                  <ProtectedRoute>
                    <EnhancedSuspenseWrapper fallbackMessage="Loading analytics...">
                      <AdvancedAnalytics />
                    </EnhancedSuspenseWrapper>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/performance" 
                element={
                  <ProtectedRoute>
                    <EnhancedSuspenseWrapper fallbackMessage="Loading performance monitor...">
                      <PerformanceMonitor />
                    </EnhancedSuspenseWrapper>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/subscription" 
                element={
                  <ProtectedRoute>
                    <EnhancedSuspenseWrapper fallbackMessage="Loading subscription...">
                      <Subscription />
                    </EnhancedSuspenseWrapper>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/subscription/dashboard" 
                element={
                  <ProtectedRoute>
                    <EnhancedSuspenseWrapper fallbackMessage="Loading subscription dashboard...">
                      <SubscriptionDashboard />
                    </EnhancedSuspenseWrapper>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/integrations" 
                element={
                  <ProtectedRoute>
                    <EnhancedSuspenseWrapper fallbackMessage="Loading integrations...">
                      <Integrations />
                    </EnhancedSuspenseWrapper>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <EnhancedSuspenseWrapper fallbackMessage="Loading settings...">
                      <Settings />
                    </EnhancedSuspenseWrapper>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <EnhancedSuspenseWrapper fallbackMessage="Loading profile...">
                      <Profile />
                    </EnhancedSuspenseWrapper>
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
          
          {/* Performance Metrics (Development Only) */}
          <PerformanceMetrics />
          
          {/* Live Region for Accessibility Announcements */}
          <div
            id="a11y-announcer"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          />
          
          {/* Enhanced Development Info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed bottom-4 left-4 bg-black/90 text-white text-xs p-3 rounded-xl font-mono opacity-75 hover:opacity-100 transition-opacity z-40 max-w-xs">
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>Auth: {isAuthenticated ? '✅' : '❌'}</div>
                <div>Loading: {isLoading ? '⏳' : '✅'}</div>
                <div>Init: {isInitialized ? '✅' : '⏳'}</div>
                <div>Theme: {theme}</div>
                <div>Real-time: {realTimeConnected ? '✅' : '❌'}</div>
                <div>PWA: {'serviceWorker' in navigator ? '✅' : '❌'}</div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-600 text-center text-[8px] text-purple-400">
                Aether AI Enhanced v2.0
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