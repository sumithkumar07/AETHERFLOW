import React, { useEffect, Suspense, useState, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import Navigation from './components/Navigation'
import LoadingStates from './components/LoadingStates'
import GlobalSearch from './components/GlobalSearch'
import SmartOnboarding from './components/SmartOnboarding'
import GamificationSystem from './components/GamificationSystem'
import InteractiveTour from './components/InteractiveTour'
import PWAEnhancement from './components/PWAEnhancement'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'

// NEW: Import Enterprise Architecture Provider
// import { ArchitectureProvider } from './architecture'

// Import pages directly instead of lazy loading for debugging
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ChatHub from './pages/ChatHub'
import IndividualProject from './pages/IndividualProject'
import Templates from './pages/Templates'
import Integrations from './pages/Integrations'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import Projects from './pages/Projects'
import Deploy from './pages/Deploy'
import Agents from './pages/Agents'
import Enterprise from './pages/Enterprise'
import Subscription from './pages/Subscription'
import AdvancedFeatures from './pages/AdvancedFeatures'
import AdvancedAnalytics from './pages/AdvancedAnalytics'
import PerformanceMonitor from './pages/PerformanceMonitor'

// Simplified Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isInitialized } = useAuthStore()
  
  // Show loading during initialization or auth operations
  if (!isInitialized || isLoading) {
    return <LoadingStates.FullScreen message="Checking authentication..." />
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// Simplified Public Route component 
const PublicRoute = ({ children }) => {
  const { isLoading } = useAuthStore()
  
  // Show loading only during actual auth operations
  if (isLoading) {
    return <LoadingStates.FullScreen message="Loading..." />
  }
  
  return children
}

// Enhanced loading component with better UX
const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
          <LoadingStates.LoadingSpinner size="lg" color="white" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Loading...
        </p>
      </motion.div>
    </div>
  }>
    <AnimatePresence mode="wait">
      {children}
    </AnimatePresence>
  </Suspense>
)

// Main App Component wrapped with Enterprise Architecture
function AppContent() {
  const { isAuthenticated, isLoading, token, initialize, isInitialized: authInitialized } = useAuthStore()
  const { theme, initializeTheme } = useThemeStore()
  const [isInitialized, setIsInitialized] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)
  const [isGamificationOpen, setIsGamificationOpen] = useState(false)
  const [isTourActive, setIsTourActive] = useState(false)
  const initializationAttempted = useRef(false)

  useEffect(() => {
    // Initialize theme and authentication on app startup
    const initializeApp = async () => {
      // Prevent multiple initialization attempts
      if (initializationAttempted.current) return
      initializationAttempted.current = true
      
      try {
        // Initialize theme first (synchronous)
        initializeTheme()
        
        // Initialize auth store
        await initialize()
        
        // Check if user needs onboarding
        const hasSeenOnboarding = localStorage.getItem('ai-tempo-onboarding-complete')
        if (!hasSeenOnboarding && isAuthenticated) {
          setTimeout(() => setIsOnboardingOpen(true), 2000)
        }
        
        // Register service worker for PWA
        registerServiceWorker()
        
        // Mark as initialized
        setIsInitialized(true)
        
      } catch (error) {
        console.error('App initialization error:', error)
        setIsInitialized(true) // Initialize anyway to prevent infinite loading
      }
    }
    
    initializeApp()
  }, [initialize, initializeTheme, isAuthenticated])

  // Apply theme class to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyboardShortcuts = (e) => {
      // Global Search: Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
      
      // Gamification Panel: Cmd/Ctrl + G
      if ((e.metaKey || e.ctrlKey) && e.key === 'g') {
        e.preventDefault()
        if (isAuthenticated) {
          setIsGamificationOpen(true)
        }
      }
      
      // Help/Tour: Shift + ?
      if (e.shiftKey && e.key === '?') {
        e.preventDefault()
        setIsTourActive(true)
      }
    }

    document.addEventListener('keydown', handleKeyboardShortcuts)
    return () => document.removeEventListener('keydown', handleKeyboardShortcuts)
  }, [isAuthenticated])

  // Service Worker Registration
  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.log('Service Worker registered successfully:', registration)
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New update available
              if (confirm('A new version is available. Reload to update?')) {
                window.location.reload()
              }
            }
          })
        })
      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    }
  }

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    localStorage.setItem('ai-tempo-onboarding-complete', 'true')
    setIsOnboardingOpen(false)
    
    // Start the interactive tour after onboarding
    setTimeout(() => setIsTourActive(true), 1000)
  }

  // Handle onboarding skip
  const handleOnboardingSkip = () => {
    localStorage.setItem('ai-tempo-onboarding-complete', 'true')
    setIsOnboardingOpen(false)
  }

  // Handle tour completion
  const handleTourComplete = () => {
    setIsTourActive(false)
  }

  // Handle tour skip
  const handleTourSkip = () => {
    setIsTourActive(false)
  }

  // Show loading screen during initial app load
  if (!isInitialized) {
    return <LoadingStates.FullScreen message="Initializing AI Tempo..." />
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
        <Navigation />
        
        <main className="relative">
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
              path="/projects" 
              element={
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/projects/:projectId" 
              element={
                <ProtectedRoute>
                  <IndividualProject />
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
              path="/agents" 
              element={
                <ProtectedRoute>
                  <Agents />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/deploy" 
              element={
                <ProtectedRoute>
                  <Deploy />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/enterprise" 
              element={
                <ProtectedRoute>
                  <Enterprise />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/advanced" 
              element={
                <ProtectedRoute>
                  <AdvancedFeatures />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <AdvancedAnalytics />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/performance" 
              element={
                <ProtectedRoute>
                  <PerformanceMonitor />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/subscription" 
              element={
                <ProtectedRoute>
                  <Subscription />
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
        </main>
        
        {/* Global Components */}
        <GlobalSearch 
          isOpen={isSearchOpen} 
          onClose={() => setIsSearchOpen(false)} 
        />
        
        <SmartOnboarding
          isVisible={isOnboardingOpen}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
        
        <GamificationSystem
          isVisible={isGamificationOpen}
          onClose={() => setIsGamificationOpen(false)}
        />
        
        <InteractiveTour
          isActive={isTourActive}
          onComplete={handleTourComplete}
          onSkip={handleTourSkip}
        />
        
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
            App Init: {isInitialized ? '✅' : '⏳'} |
            Auth Init: {authInitialized ? '✅' : '⏳'} |
            Token: {token ? '✅' : '❌'}
          </div>
        )}
      </div>
    </Router>
  )
}

// Main App Component (temporarily without Enterprise Architecture Provider)
function App() {
  return (
    <AppContent />
  )
}

export default App