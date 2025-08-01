import { ServiceFactory } from '../services/ServiceFactory'

/**
 * Store Enhancer
 * Utility to enhance existing Zustand stores with service layer capabilities
 */
class StoreEnhancer {
  static serviceFactory = null

  static async initialize() {
    if (!this.serviceFactory) {
      this.serviceFactory = ServiceFactory.getInstance()
      await this.serviceFactory.initialize()
    }
    return this.serviceFactory
  }

  /**
   * Enhance existing store with service layer capabilities
   * @param {Function} useStore - Zustand store hook
   * @param {string} resourceName - Resource name for repository
   * @param {object} options - Enhancement options
   * @returns {object} Enhanced store methods
   */
  static enhanceStore(useStore, resourceName, options = {}) {
    const {
      enableCache = true,
      enableEvents = true,
      enableAnalytics = true,
      enablePerformanceTracking = true
    } = options

    return {
      // Enhanced fetch methods
      async fetchWithService(endpoint, requestOptions = {}) {
        await this.initialize()
        
        const apiGateway = this.serviceFactory.getAPIGateway()
        const performanceMonitor = this.serviceFactory.getPerformanceMonitor()
        
        try {
          if (enablePerformanceTracking) {
            performanceMonitor.trackInteraction('api_call', { endpoint })
          }

          const data = await apiGateway.get(endpoint, {
            cache: enableCache,
            ...requestOptions
          })

          if (enableEvents) {
            const eventBus = this.serviceFactory.getEventBus()
            eventBus.emit(`${resourceName}.fetched`, { 
              endpoint, 
              count: Array.isArray(data) ? data.length : 1 
            })
          }

          return data

        } catch (error) {
          if (enableEvents) {
            const eventBus = this.serviceFactory.getEventBus()
            eventBus.emit(`${resourceName}.fetch_error`, { 
              endpoint, 
              error: error.message 
            })
          }
          throw error
        }
      },

      // Enhanced create method
      async createWithService(data, requestOptions = {}) {
        await this.initialize()
        
        const repository = this.getRepository(resourceName)
        if (repository) {
          return repository.create(data, requestOptions)
        }

        // Fallback to API Gateway
        const apiGateway = this.serviceFactory.getAPIGateway()
        return apiGateway.post(`/api/${resourceName}`, data, requestOptions)
      },

      // Enhanced update method
      async updateWithService(id, data, requestOptions = {}) {
        await this.initialize()
        
        const repository = this.getRepository(resourceName)
        if (repository) {
          return repository.update(id, data, requestOptions)
        }

        // Fallback to API Gateway
        const apiGateway = this.serviceFactory.getAPIGateway()
        return apiGateway.put(`/api/${resourceName}/${id}`, data, requestOptions)
      },

      // Enhanced delete method
      async deleteWithService(id, requestOptions = {}) {
        await this.initialize()
        
        const repository = this.getRepository(resourceName)
        if (repository) {
          return repository.delete(id, requestOptions)
        }

        // Fallback to API Gateway
        const apiGateway = this.serviceFactory.getAPIGateway()
        return apiGateway.delete(`/api/${resourceName}/${id}`, requestOptions)
      },

      // Cache management
      async invalidateCache(pattern = null) {
        await this.initialize()
        
        const cache = this.serviceFactory.getCacheManager()
        const cachePattern = pattern || `*${resourceName}*`
        return cache.invalidatePattern(cachePattern)
      },

      // Event emission
      async emitEvent(eventType, data) {
        await this.initialize()
        
        if (!enableEvents) return
        
        const eventBus = this.serviceFactory.getEventBus()
        eventBus.emit(`${resourceName}.${eventType}`, data)
      },

      // Analytics tracking
      async trackAction(action, properties = {}) {
        await this.initialize()
        
        if (!enableAnalytics) return
        
        const analytics = this.serviceFactory.getAnalyticsService()
        analytics.track(`${resourceName}_${action}`, properties)
      },

      // Performance tracking
      async trackPerformance(action, duration, metadata = {}) {
        await this.initialize()
        
        if (!enablePerformanceTracking) return
        
        const performanceMonitor = this.serviceFactory.getPerformanceMonitor()
        performanceMonitor.trackCustomMetric(
          `${resourceName}_${action}_duration`, 
          duration, 
          metadata
        )
      },

      // Get service instances
      getServices() {
        return this.serviceFactory ? {
          apiGateway: this.serviceFactory.getAPIGateway(),
          cache: this.serviceFactory.getCacheManager(),
          eventBus: this.serviceFactory.getEventBus(),
          analytics: this.serviceFactory.getAnalyticsService(),
          performanceMonitor: this.serviceFactory.getPerformanceMonitor()
        } : null
      },

      // Get repository
      getRepository(name) {
        if (!this.serviceFactory) return null
        
        const repositories = {
          projects: this.serviceFactory.getProjectRepository(),
          users: this.serviceFactory.getUserRepository(),
          templates: this.serviceFactory.getTemplateRepository(),
          integrations: this.serviceFactory.getIntegrationRepository(),
          agents: this.serviceFactory.getAgentRepository()
        }
        
        return repositories[name] || null
      }
    }
  }

  /**
   * Create wrapper for existing store to add service layer methods
   * @param {Function} useStore - Original store hook
   * @param {string} resourceName - Resource name
   * @param {object} options - Enhancement options
   * @returns {Function} Enhanced store hook
   */
  static wrapStore(useStore, resourceName, options = {}) {
    const enhancements = this.enhanceStore(useStore, resourceName, options)
    
    return function useEnhancedStore(selector) {
      const store = useStore(selector)
      
      // Add enhancement methods to store
      if (typeof store === 'object' && store !== null) {
        return {
          ...store,
          ...enhancements
        }
      }
      
      return store
    }
  }

  /**
   * Migrate existing store to use service layer gradually
   * @param {object} storeConfig - Store configuration
   * @param {string} resourceName - Resource name
   * @returns {object} Migration helper methods
   */
  static createMigrationHelper(storeConfig, resourceName) {
    return {
      // Wrapper for API calls that can fallback to original implementation
      async migratedAPICall(newMethod, fallbackMethod, ...args) {
        try {
          await this.initialize()
          return await newMethod(...args)
        } catch (error) {
          console.warn(`Service layer call failed for ${resourceName}, falling back:`, error)
          return await fallbackMethod(...args)
        }
      },

      // Feature flag for gradual migration
      shouldUseServiceLayer(featureName = 'default') {
        try {
          if (!this.serviceFactory) return false
          
          const config = this.serviceFactory.getService('config')
          return config?.isFeatureEnabled(`service_layer_${featureName}`) ?? true
        } catch {
          return false
        }
      },

      // Performance comparison helper
      async comparePerformance(newMethod, oldMethod, ...args) {
        const startTime = Date.now()
        
        try {
          const newResult = await newMethod(...args)
          const newDuration = Date.now() - startTime
          
          const oldStartTime = Date.now()
          const oldResult = await oldMethod(...args)
          const oldDuration = Date.now() - oldStartTime
          
          console.log(`Performance comparison for ${resourceName}:`, {
            new: { duration: newDuration, success: true },
            old: { duration: oldDuration, success: true },
            improvement: oldDuration - newDuration
          })
          
          return newResult
        } catch (error) {
          const errorDuration = Date.now() - startTime
          
          console.warn(`New method failed for ${resourceName}:`, {
            duration: errorDuration,
            error: error.message
          })
          
          return await oldMethod(...args)
        }
      }
    }
  }

  /**
   * Create monitoring dashboard for store performance
   * @param {string} storeName - Store name
   * @returns {object} Monitoring utilities
   */
  static createStoreMonitor(storeName) {
    return {
      async getPerformanceMetrics() {
        await this.initialize()
        
        const performanceMonitor = this.serviceFactory.getPerformanceMonitor()
        const summary = performanceMonitor.getPerformanceSummary()
        
        // Filter metrics for this store
        const storeMetrics = {}
        Object.entries(summary.api.endpoints || {}).forEach(([endpoint, metrics]) => {
          if (endpoint.includes(storeName.toLowerCase())) {
            storeMetrics[endpoint] = metrics
          }
        })
        
        return {
          store: storeName,
          metrics: storeMetrics,
          overall: summary,
          timestamp: new Date().toISOString()
        }
      },

      async getCacheStatistics() {
        await this.initialize()
        
        const cache = this.serviceFactory.getCacheManager()
        return cache.getStats()
      },

      async getEventHistory(limit = 50) {
        await this.initialize()
        
        const eventBus = this.serviceFactory.getEventBus()
        return eventBus.getHistory(limit, storeName.toLowerCase())
      },

      // Export performance data for analysis
      async exportPerformanceData() {
        const metrics = await this.getPerformanceMetrics()
        const cache = await this.getCacheStatistics()
        const events = await this.getEventHistory(100)
        
        return {
          store: storeName,
          exportedAt: new Date().toISOString(),
          metrics,
          cache,
          events
        }
      }
    }
  }
}

export { StoreEnhancer }