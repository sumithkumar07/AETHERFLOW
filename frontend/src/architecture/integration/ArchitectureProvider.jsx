import React, { createContext, useContext, useEffect, useState } from 'react'
import { ServiceFactory } from '../services/ServiceFactory'
import { EventBus } from '../core/EventBus'

/**
 * Architecture Provider
 * Provides enterprise architecture services to the entire React app
 */

const ArchitectureContext = createContext(null)

export const useArchitecture = () => {
  const context = useContext(ArchitectureContext)
  if (!context) {
    throw new Error('useArchitecture must be used within an ArchitectureProvider')
  }
  return context
}

export const ArchitectureProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [serviceFactory, setServiceFactory] = useState(null)
  const [services, setServices] = useState(null)

  useEffect(() => {
    initializeArchitecture()
  }, [])

  const initializeArchitecture = async () => {
    try {
      console.log('🏗️ ArchitectureProvider: Initializing enterprise services...')
      setIsLoading(true)
      setError(null)

      // Initialize service factory
      const factory = ServiceFactory.getInstance()
      await factory.initialize()

      // Get all services
      const allServices = {
        // Core services
        apiGateway: factory.getAPIGateway(),
        cache: factory.getCacheManager(),
        eventBus: factory.getEventBus(),
        performanceMonitor: factory.getPerformanceMonitor(),

        // Repositories
        projectRepository: factory.getProjectRepository(),
        userRepository: factory.getUserRepository(),
        templateRepository: factory.getTemplateRepository(),
        integrationRepository: factory.getIntegrationRepository(),
        agentRepository: factory.getAgentRepository(),

        // Business services
        aiService: factory.getAIService(),
        projectService: factory.getProjectService(),
        authService: factory.getAuthService(),
        notificationService: factory.getNotificationService(),
        analyticsService: factory.getAnalyticsService()
      }

      setServiceFactory(factory)
      setServices(allServices)
      setIsInitialized(true)

      // Set up global event listeners
      setupGlobalEventListeners(allServices.eventBus)

      // Set up error boundaries
      setupErrorHandling(allServices.eventBus)

      // Track initialization
      allServices.analyticsService.track('architecture_initialized', {
        timestamp: Date.now(),
        services_count: Object.keys(allServices).length
      })

      console.log('✅ ArchitectureProvider: Initialization complete')

    } catch (err) {
      console.error('❌ ArchitectureProvider: Initialization failed:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const setupGlobalEventListeners = (eventBus) => {
    // Listen for critical system events
    eventBus.subscribe('*.error', (event) => {
      console.error('System error:', event)
      // Could integrate with external error reporting here
    })

    // Listen for performance issues
    eventBus.subscribe('performance.*', (event) => {
      if (event.data.duration > 5000) { // Slow request (>5s)
        console.warn('Slow operation detected:', event)
      }
    })

    // Listen for cache events (in development)
    if (process.env.NODE_ENV === 'development') {
      eventBus.subscribe('cache.*', (event) => {
        console.log('Cache event:', event.type, event.data)
      })
    }

    // Listen for authentication events
    eventBus.subscribe('auth.*', (event) => {
      console.log('Auth event:', event.type)
      
      if (event.type === 'auth.login.success') {
        // Clear caches on login to ensure fresh data
        services?.cache?.clear()
      }
    })
  }

  const setupErrorHandling = (eventBus) => {
    // Global error handler
    window.addEventListener('error', (event) => {
      eventBus.emit('global.error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      })
    })

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      eventBus.emit('global.unhandled_rejection', {
        reason: event.reason,
        promise: event.promise
      })
    })
  }

  // Context value
  const contextValue = {
    // State
    isInitialized,
    isLoading,
    error,
    
    // Service factory
    serviceFactory,
    
    // Direct service access
    services,
    
    // Convenience methods
    api: services?.apiGateway,
    cache: services?.cache,
    events: services?.eventBus,
    analytics: services?.analyticsService,
    performance: services?.performanceMonitor,
    
    // Repository access
    repositories: {
      projects: services?.projectRepository,
      users: services?.userRepository,
      templates: services?.templateRepository,
      integrations: services?.integrationRepository,
      agents: services?.agentRepository
    },
    
    // Business services
    ai: services?.aiService,
    auth: services?.authService,
    notifications: services?.notificationService,
    
    // Utility methods
    async reinitialize() {
      await initializeArchitecture()
    },
    
    getServiceHealth() {
      return serviceFactory?.getServiceHealth()
    },
    
    exportDiagnostics() {
      if (!services) return null
      
      return {
        initialized: isInitialized,
        error,
        timestamp: new Date().toISOString(),
        performance: services.performanceMonitor.getPerformanceSummary(),
        cache: services.cache.getStats(),
        events: services.eventBus.getStats(),
        serviceHealth: serviceFactory.getServiceHealth()
      }
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Initializing Enterprise Architecture...
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-red-900 mb-2">
            Architecture Initialization Failed
          </h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={initializeArchitecture}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transitions-colors"
          >
            Retry Initialization
          </button>
        </div>
      </div>
    )
  }

  return (
    <ArchitectureContext.Provider value={contextValue}>
      {children}
      
      {/* Development tools */}
      {process.env.NODE_ENV === 'development' && (
        <ArchitectureDevelopmentTools services={services} />
      )}
    </ArchitectureContext.Provider>
  )
}

// Development tools component
const ArchitectureDevelopmentTools = ({ services }) => {
  const [showTools, setShowTools] = useState(false)
  const [activeTab, setActiveTab] = useState('performance')

  if (!showTools) {
    return (
      <button
        onClick={() => setShowTools(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 z-50"
        title="Show Architecture Tools"
      >
        🏗️
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-md z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-sm">Architecture Tools</h3>
        <button
          onClick={() => setShowTools(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="flex space-x-2 mb-3 text-xs">
        <button
          onClick={() => setActiveTab('performance')}
          className={`px-2 py-1 rounded ${activeTab === 'performance' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
        >
          Performance
        </button>
        <button
          onClick={() => setActiveTab('cache')}
          className={`px-2 py-1 rounded ${activeTab === 'cache' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
        >
          Cache
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-2 py-1 rounded ${activeTab === 'events' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
        >
          Events
        </button>
      </div>
      
      <div className="text-xs">
        {activeTab === 'performance' && (
          <PerformancePanel performanceMonitor={services?.performanceMonitor} />
        )}
        {activeTab === 'cache' && (
          <CachePanel cache={services?.cache} />
        )}
        {activeTab === 'events' && (
          <EventsPanel eventBus={services?.eventBus} />
        )}
      </div>
    </div>
  )
}

const PerformancePanel = ({ performanceMonitor }) => {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (performanceMonitor) {
      setStats(performanceMonitor.getPerformanceSummary())
      
      const interval = setInterval(() => {
        setStats(performanceMonitor.getPerformanceSummary())
      }, 5000)
      
      return () => clearInterval(interval)
    }
  }, [performanceMonitor])

  if (!stats) return <div>Loading...</div>

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <div className="font-medium">API Calls</div>
          <div>{stats.api.totalRequests}</div>
        </div>
        <div>
          <div className="font-medium">Avg Response</div>
          <div>{Math.round(stats.api.averageResponseTime)}ms</div>
        </div>
        <div>
          <div className="font-medium">Error Rate</div>
          <div>{stats.api.errorRate.toFixed(1)}%</div>
        </div>
        <div>
          <div className="font-medium">Cache Hit</div>
          <div>{stats.api.cacheHitRate.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  )
}

const CachePanel = ({ cache }) => {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (cache) {
      setStats(cache.getStats())
      
      const interval = setInterval(() => {
        setStats(cache.getStats())
      }, 2000)
      
      return () => clearInterval(interval)
    }
  }, [cache])

  if (!stats) return <div>Loading...</div>

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <div className="font-medium">Hit Rate</div>
          <div>{stats.hitRate}%</div>
        </div>
        <div>
          <div className="font-medium">Entries</div>
          <div>{stats.memoryEntries}</div>
        </div>
        <div>
          <div className="font-medium">Hits</div>
          <div>{stats.hits}</div>
        </div>
        <div>
          <div className="font-medium">Misses</div>
          <div>{stats.misses}</div>
        </div>
      </div>
      <button
        onClick={() => cache.clear()}
        className="bg-red-500 text-white px-2 py-1 rounded text-xs"
      >
        Clear Cache
      </button>
    </div>
  )
}

const EventsPanel = ({ eventBus }) => {
  const [stats, setStats] = useState(null)
  const [recentEvents, setRecentEvents] = useState([])

  useEffect(() => {
    if (eventBus) {
      setStats(eventBus.getStats())
      setRecentEvents(eventBus.getHistory(5))
      
      const interval = setInterval(() => {
        setStats(eventBus.getStats())
        setRecentEvents(eventBus.getHistory(5))
      }, 3000)
      
      return () => clearInterval(interval)
    }
  }, [eventBus])

  if (!stats) return <div>Loading...</div>

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <div className="font-medium">Events</div>
          <div>{stats.eventsEmitted}</div>
        </div>
        <div>
          <div className="font-medium">Subscribers</div>
          <div>{stats.subscriberCount}</div>
        </div>
      </div>
      <div className="mb-2">
        <div className="font-medium mb-1">Recent Events:</div>
        {recentEvents.map((event, i) => (
          <div key={i} className="text-xs text-gray-600 truncate">
            {event.type}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ArchitectureProvider