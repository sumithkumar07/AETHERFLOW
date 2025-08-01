import { APIGateway } from '../core/APIGateway'
import { EventBus } from '../core/EventBus'
import { CacheManager } from '../core/CacheManager'
import { ConfigManager } from '../core/ConfigManager'
import { PerformanceMonitor } from '../core/PerformanceMonitor'

// Repository imports
import { ProjectRepository } from '../repositories/ProjectRepository'
import { BaseRepository } from '../repositories/BaseRepository'

/**
 * Service Factory
 * Centralized factory for creating and managing service instances
 */
class ServiceFactory {
  static instance = null
  static services = new Map()
  static repositories = new Map()

  constructor() {
    this.initializationPromise = null
    this.initialized = false
  }

  static getInstance() {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory()
    }
    return ServiceFactory.instance
  }

  /**
   * Initialize all core services
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) {
      return Promise.resolve()
    }

    if (this.initializationPromise) {
      return this.initializationPromise
    }

    this.initializationPromise = this._performInitialization()
    return this.initializationPromise
  }

  async _performInitialization() {
    try {
      console.log('🏗️ ServiceFactory: Initializing core services...')

      // Initialize core services in order
      await this._initializeCoreServices()

      // Initialize repositories
      await this._initializeRepositories()

      // Initialize business services
      await this._initializeBusinessServices()

      // Setup service health monitoring
      this._setupServiceMonitoring()

      this.initialized = true
      console.log('✅ ServiceFactory: All services initialized successfully')

      // Emit initialization complete event
      const eventBus = this.getEventBus()
      eventBus.emit('services.initialized', {
        timestamp: Date.now(),
        services: Array.from(ServiceFactory.services.keys()),
        repositories: Array.from(ServiceFactory.repositories.keys())
      })

    } catch (error) {
      console.error('❌ ServiceFactory: Initialization failed:', error)
      throw error
    }
  }

  async _initializeCoreServices() {
    // These are singletons that auto-initialize
    const eventBus = EventBus.getInstance()
    const cacheManager = CacheManager.getInstance()
    const apiGateway = APIGateway.getInstance()
    const performanceMonitor = PerformanceMonitor.getInstance()

    // Initialize cache manager
    await cacheManager.initialize?.()

    ServiceFactory.services.set('eventBus', eventBus)
    ServiceFactory.services.set('cacheManager', cacheManager)
    ServiceFactory.services.set('apiGateway', apiGateway)
    ServiceFactory.services.set('performanceMonitor', performanceMonitor)

    console.log('✅ Core services initialized')
  }

  async _initializeRepositories() {
    // Create repository instances
    const projectRepository = new ProjectRepository()
    
    // Add more repositories as needed
    const userRepository = new BaseRepository('users', {
      cacheStrategy: 'user',
      cacheTTL: 3600000 // 1 hour
    })

    const templateRepository = new BaseRepository('templates', {
      cacheStrategy: 'templates',
      cacheTTL: 7200000 // 2 hours
    })

    const integrationRepository = new BaseRepository('integrations', {
      cacheStrategy: 'integrations',
      cacheTTL: 1800000 // 30 minutes
    })

    const agentRepository = new BaseRepository('agents', {
      cacheStrategy: 'default',
      cacheTTL: 600000 // 10 minutes
    })

    // Store repositories
    ServiceFactory.repositories.set('projects', projectRepository)
    ServiceFactory.repositories.set('users', userRepository)
    ServiceFactory.repositories.set('templates', templateRepository)
    ServiceFactory.repositories.set('integrations', integrationRepository)
    ServiceFactory.repositories.set('agents', agentRepository)

    console.log('✅ Repositories initialized')
  }

  async _initializeBusinessServices() {
    // AI Service
    const aiService = this._createAIService()
    
    // Project Service  
    const projectService = this._createProjectService()
    
    // Authentication Service
    const authService = this._createAuthService()
    
    // Notification Service
    const notificationService = this._createNotificationService()

    // Analytics Service
    const analyticsService = this._createAnalyticsService()

    ServiceFactory.services.set('ai', aiService)
    ServiceFactory.services.set('projects', projectService)
    ServiceFactory.services.set('auth', authService)
    ServiceFactory.services.set('notifications', notificationService)
    ServiceFactory.services.set('analytics', analyticsService)

    console.log('✅ Business services initialized')
  }

  _setupServiceMonitoring() {
    const eventBus = this.getEventBus()
    const performanceMonitor = this.getPerformanceMonitor()

    // Monitor service health
    setInterval(() => {
      this._performHealthCheck()
    }, 60000) // Every minute

    // Listen for service errors
    eventBus.subscribe('*.error', (event) => {
      console.warn(`Service error in ${event.type}:`, event.data)
      performanceMonitor.trackCustomMetric('service_error', 1, {
        service: event.type,
        error: event.data.error
      })
    })
  }

  async _performHealthCheck() {
    const healthStatus = {
      timestamp: Date.now(),
      services: {},
      overall: 'healthy'
    }

    // Check API Gateway health
    try {
      const apiGateway = this.getAPIGateway()
      const health = await apiGateway.healthCheck()
      healthStatus.services.api = health.healthy ? 'healthy' : 'unhealthy'
    } catch (error) {
      healthStatus.services.api = 'unhealthy'
      healthStatus.overall = 'degraded'
    }

    // Check cache health
    try {
      const cache = this.getCacheManager()
      const stats = cache.getStats()
      healthStatus.services.cache = stats.hitRate > 0 ? 'healthy' : 'degraded'
    } catch (error) {
      healthStatus.services.cache = 'unhealthy'
      healthStatus.overall = 'degraded'
    }

    // Emit health status
    const eventBus = this.getEventBus()
    eventBus.emit('services.health_check', healthStatus)

    return healthStatus
  }

  // Core service getters
  getEventBus() {
    return ServiceFactory.services.get('eventBus') || EventBus.getInstance()
  }

  getCacheManager() {
    return ServiceFactory.services.get('cacheManager') || CacheManager.getInstance()
  }

  getAPIGateway() {
    return ServiceFactory.services.get('apiGateway') || APIGateway.getInstance()
  }

  getPerformanceMonitor() {
    return ServiceFactory.services.get('performanceMonitor') || PerformanceMonitor.getInstance()
  }

  // Repository getters
  getProjectRepository() {
    return ServiceFactory.repositories.get('projects')
  }

  getUserRepository() {
    return ServiceFactory.repositories.get('users')
  }

  getTemplateRepository() {
    return ServiceFactory.repositories.get('templates')
  }

  getIntegrationRepository() {
    return ServiceFactory.repositories.get('integrations')
  }

  getAgentRepository() {
    return ServiceFactory.repositories.get('agents')
  }

  // Business service getters
  getAIService() {
    return ServiceFactory.services.get('ai')
  }

  getProjectService() {
    return ServiceFactory.services.get('projects')
  }

  getAuthService() {
    return ServiceFactory.services.get('auth')
  }

  getNotificationService() {
    return ServiceFactory.services.get('notifications')
  }

  getAnalyticsService() {
    return ServiceFactory.services.get('analytics')
  }

  // Service creators
  _createAIService() {
    return {
      config: ConfigManager.get('ai'),
      eventBus: this.getEventBus(),
      cache: this.getCacheManager(),
      api: this.getAPIGateway(),

      async processMessage(message, context = {}) {
        try {
          const result = await this.api.post('/ai/chat', {
            message,
            context,
            model: this.config.defaultModel
          }, {
            cache: true,
            cacheTTL: 3600000, // 1 hour for AI responses
            cacheStrategy: 'ai_responses'
          })

          this.eventBus.emit('ai.message_processed', {
            message,
            result,
            timestamp: Date.now()
          })

          return result
        } catch (error) {
          this.eventBus.emit('ai.error', { error: error.message, message })
          throw error
        }
      },

      async generateCode(prompt, language = 'javascript') {
        try {
          const result = await this.api.post('/ai/generate', {
            prompt,
            language,
            model: this.config.defaultModel
          })

          this.eventBus.emit('ai.code_generated', {
            prompt,
            language,
            result,
            timestamp: Date.now()
          })

          return result
        } catch (error) {
          this.eventBus.emit('ai.error', { error: error.message, prompt })
          throw error
        }
      }
    }
  }

  _createProjectService() {
    const repository = this.getProjectRepository()
    
    return {
      repository,
      eventBus: this.getEventBus(),
      cache: this.getCacheManager(),

      async createProject(data) {
        // Add business logic here
        const enrichedData = {
          ...data,
          created_via: 'service_layer',
          initial_setup_completed: false
        }

        const project = await repository.create(enrichedData)
        
        // Trigger post-creation workflows
        this.eventBus.emit('projects.created', { project })
        
        return project
      },

      async deployProject(projectId, config = {}) {
        const project = await repository.findById(projectId)
        
        if (!project) {
          throw new Error('Project not found')
        }

        // Add deployment business logic
        const deploymentResult = await repository.deploy(projectId, {
          ...config,
          deployment_requested_at: new Date().toISOString()
        })

        return deploymentResult
      },

      async getProjectAnalytics(projectId) {
        // Combine project data with analytics
        const project = await repository.findById(projectId)
        const analytics = await this._getProjectAnalytics(projectId)
        
        return {
          project,
          analytics,
          combined_at: new Date().toISOString()
        }
      },

      async _getProjectAnalytics(projectId) {
        // Mock analytics - in real implementation, this would call analytics service
        return {
          views: Math.floor(Math.random() * 1000),
          deployments: Math.floor(Math.random() * 10),
          last_activity: new Date().toISOString()
        }
      }
    }
  }

  _createAuthService() {
    return {
      eventBus: this.getEventBus(),
      api: this.getAPIGateway(),

      async getCurrentUser() {
        try {
          const user = await this.api.get('/auth/me', {
            cache: true,
            cacheTTL: 300000 // 5 minutes
          })
          
          this.eventBus.emit('auth.user_fetched', { user })
          return user
        } catch (error) {
          this.eventBus.emit('auth.error', { error: error.message })
          throw error
        }
      },

      async refreshToken() {
        try {
          const result = await this.api.post('/auth/refresh')
          
          this.eventBus.emit('auth.token_refreshed', { result })
          return result
        } catch (error) {
          this.eventBus.emit('auth.error', { error: error.message })
          throw error
        }
      }
    }
  }

  _createNotificationService() {
    return {
      eventBus: this.getEventBus(),
      notifications: [],

      show(type, message, options = {}) {
        const notification = {
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type,
          message,
          timestamp: Date.now(),
          ...options
        }

        this.notifications.push(notification)
        this.eventBus.emit('notifications.show', notification)

        // Auto-remove after duration
        if (options.duration !== 0) {
          setTimeout(() => {
            this.remove(notification.id)
          }, options.duration || 4000)
        }

        return notification.id
      },

      remove(id) {
        const index = this.notifications.findIndex(n => n.id === id)
        if (index > -1) {
          const removed = this.notifications.splice(index, 1)[0]
          this.eventBus.emit('notifications.remove', removed)
        }
      },

      clear() {
        this.notifications = []
        this.eventBus.emit('notifications.clear')
      }
    }
  }

  _createAnalyticsService() {
    return {
      eventBus: this.getEventBus(),
      performanceMonitor: this.getPerformanceMonitor(),

      track(event, properties = {}) {
        const trackingData = {
          event,
          properties: {
            ...properties,
            timestamp: Date.now(),
            session_id: this._getSessionId(),
            user_agent: navigator.userAgent
          }
        }

        this.eventBus.emit('analytics.track', trackingData)
        this.performanceMonitor.trackCustomMetric('analytics_event', 1, { event })
      },

      page(name, properties = {}) {
        this.track('page_view', {
          page_name: name,
          ...properties
        })
      },

      _getSessionId() {
        let sessionId = sessionStorage.getItem('analytics_session_id')
        if (!sessionId) {
          sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          sessionStorage.setItem('analytics_session_id', sessionId)
        }
        return sessionId
      }
    }
  }

  // Utility methods
  getService(name) {
    return ServiceFactory.services.get(name)
  }

  getRepository(name) {
    return ServiceFactory.repositories.get(name)
  }

  getAllServices() {
    return Object.fromEntries(ServiceFactory.services)
  }

  getAllRepositories() {
    return Object.fromEntries(ServiceFactory.repositories)
  }

  getServiceHealth() {
    return this._performHealthCheck()
  }

  // Cleanup method
  destroy() {
    ServiceFactory.services.clear()
    ServiceFactory.repositories.clear()
    this.initialized = false
    this.initializationPromise = null
  }
}

export { ServiceFactory }