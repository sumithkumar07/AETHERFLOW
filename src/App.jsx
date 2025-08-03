import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import { useRealTimeStore } from './store/realTimeStore'
import { useEnhancedChatStore } from './store/enhancedChatStore'

// Components
import LoadingStates from './components/LoadingStates'
import Login from './pages/Login'
import MarketingLanding from './components/MarketingLanding'
import ChatHub from './pages/ChatHub'
import EnhancedChatInterface from './components/enhanced/EnhancedChatInterface'
import SmartAnalyticsDashboard from './components/enhanced/SmartAnalyticsDashboard'
import RealTimeCollaboration from './components/advanced/RealTimeCollaboration'
import VisualProgrammingStudio from './components/advanced/VisualProgrammingStudio'
import { EnterpriseDashboard } from './components/enterprise/EnterpriseDashboard'
import SystemDashboard from './components/dashboard/SystemDashboard'
import SystemDashboard from './components/dashboard/SystemDashboard'

// Enhanced Navigation Component
const EnhancedNavigation = () => {
  const { user, logout } = useAuthStore()
  const { systemStatus, notifications, unreadCount } = useRealTimeStore()
  const [activeTab, setActiveTab] = useState('chat')

  const navigationTabs = [
    { id: 'chat', name: 'AI Chat', icon: '💬', path: '/chat' },
    { id: 'analytics', name: 'Analytics', icon: '📊', path: '/analytics' },
    { id: 'collaboration', name: 'Collaboration', icon: '👥', path: '/collaboration' },
    { id: 'visual', name: 'Visual Studio', icon: '🎨', path: '/visual-programming' },
    { id: 'enterprise', name: 'Enterprise', icon: '🏢', path: '/enterprise' },
    { id: 'system', name: 'System', icon: '⚙️', path: '/system' }
  ]

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Aether AI Platform
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Next-generation AI development with unlimited local processing
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1">
            {navigationTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  window.location.hash = tab.path
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
                {tab.id === 'enterprise' && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* System Status */}
            <div className="flex items-center space-x-2">
              {Object.entries(systemStatus).map(([service, status]) => (
                <div
                  key={service}
                  className="flex items-center space-x-1"
                  title={`${service}: ${status}`}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    status === 'online' ? 'bg-green-500' : 
                    status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                </div>
              ))}
            </div>

            {/* Notifications */}
            {unreadCount > 0 && (
              <div className="relative">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </div>
              </div>
            )}

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.name}
              </span>
              <button
                onClick={logout}
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Enhanced Router Component
const EnhancedRouter = () => {
  const [currentView, setCurrentView] = useState('chat')

  // Listen for hash changes to switch views
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1)
      switch (hash) {
        case '/analytics':
          setCurrentView('analytics')
          break
        case '/collaboration':
          setCurrentView('collaboration')
          break
        case '/visual-programming':
          setCurrentView('visual')
          break
        case '/enterprise':
          setCurrentView('enterprise')
          break
        case '/system':
          setCurrentView('system')
          break
        default:
          setCurrentView('chat')
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    handleHashChange() // Initial check

    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <EnhancedNavigation />
      <div className="flex-1 overflow-hidden">
        {currentView === 'chat' && <EnhancedChatInterface projectId="demo-project" />}
        {currentView === 'analytics' && <SmartAnalyticsDashboard />}
        {currentView === 'collaboration' && <RealTimeCollaboration documentId="demo-doc" projectId="demo-project" />}
        {currentView === 'visual' && <VisualProgrammingStudio projectId="demo-project" />}
        {currentView === 'enterprise' && <EnterpriseDashboard />}
        {currentView === 'system' && <SystemDashboard />}
      </div>
    </div>
  )
}

// Main App Component
const App = () => {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    isInitialized,
    initialize: initializeAuth
  } = useAuthStore()
  
  const { initialize: initializeRealTime } = useRealTimeStore()
  const { initialize: initializeChat } = useEnhancedChatStore()

  const [appInitialized, setAppInitialized] = useState(false)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize authentication first
        await initializeAuth()
        
        if (user) {
          // Initialize real-time features and enhanced chat
          await Promise.all([
            initializeRealTime(user.id),
            initializeChat(user.id)
          ])
        }
        
        setAppInitialized(true)
      } catch (error) {
        console.error('App initialization error:', error)
        setAppInitialized(true) // Set to true to prevent infinite loading
      }
    }

    if (!appInitialized) {
      initializeApp()
    }
  }, [user, initializeAuth, initializeRealTime, initializeChat, appInitialized])

  // Show loading while initializing
  if (!isInitialized || !appInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
        <LoadingStates.FullScreen message="Initializing Aether AI Platform..." />
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={
              !isAuthenticated ? (
                <MarketingLanding />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />
          
          <Route 
            path="/auth" 
            element={
              !isAuthenticated ? (
                <Login />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? (
                <EnhancedRouter />
              ) : (
                <Navigate to="/auth" replace />
              )
            } 
          />

          <Route 
            path="/chat" 
            element={
              isAuthenticated ? (
                <EnhancedRouter />
              ) : (
                <Navigate to="/auth" replace />
              )
            } 
          />

          {/* Legacy Route Support */}
          <Route 
            path="/hub" 
            element={
              isAuthenticated ? (
                <ChatHub />
              ) : (
                <Navigate to="/auth" replace />
              )
            } 
          />

          {/* Catch all */}
          <Route 
            path="*" 
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />} 
          />
        </Routes>

        {/* Global Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#1F2937',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#FFFFFF',
              },
            },
            loading: {
              iconTheme: {
                primary: '#3B82F6',
                secondary: '#FFFFFF',
              },
            },
          }}
        />

        {/* Feature Announcement Banner */}
        {isAuthenticated && (
          <div className="fixed bottom-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl shadow-lg backdrop-blur-xl border border-white/20 max-w-md">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-900 font-bold text-sm">✨</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Platform Enhanced!</p>
                <p className="text-xs opacity-90">
                  New features: Real-time collaboration, AI analytics, visual programming studio, and enterprise tools.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Router>
  )
}

export default App