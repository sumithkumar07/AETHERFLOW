/**
 * Gradual Migration Utility
 * Helps migrate existing stores and components to use the new architecture gradually
 */

import { ServiceFactory } from '../services/ServiceFactory'
import { useAuthStore } from '../../store/authStore'

/**
 * Migration Helper Class
 * Provides utilities to gradually migrate existing code to use service layer
 */
class GradualMigration {
  static migrations = new Map()
  static serviceFactory = null

  static async initialize() {
    if (!this.serviceFactory) {
      this.serviceFactory = ServiceFactory.getInstance()
      await this.serviceFactory.initialize()
    }
  }

  /**
   * Create a migration-aware API call
   * Tries new service layer first, falls back to original implementation
   */
  static async migratedAPICall(newImplementation, fallbackImplementation, ...args) {
    try {
      await this.initialize()
      
      // Try new service layer implementation
      const result = await newImplementation(...args)
      
      // Track successful migration usage
      this.trackMigrationSuccess('api_call')
      
      return result
    } catch (error) {
      console.warn('Service layer call failed, falling back to original:', error)
      
      // Track fallback usage
      this.trackMigrationFallback('api_call', error.message)
      
      // Use original implementation
      return await fallbackImplementation(...args)
    }
  }

  /**
   * Create enhanced version of existing auth store
   * Maintains compatibility while adding new features
   */
  static createEnhancedAuthStore() {
    const originalStore = useAuthStore
    
    return function useHybridAuthStore(selector) {
      const originalState = originalStore(selector)
      
      // Add service layer enhancements
      const enhancements = {
        // Enhanced login with service layer
        loginEnhanced: async (credentials) => {
          return GradualMigration.migratedAPICall(
            // New service layer implementation
            async () => {
              await GradualMigration.initialize()
              const authService = GradualMigration.serviceFactory.getAuthService()
              const apiGateway = GradualMigration.serviceFactory.getAPIGateway()
              
              const response = await apiGateway.post('/auth/login', credentials, {
                cache: false,
                retryAttempts: 1
              })
              
              // Update original store state
              originalState.user = response.user
              originalState.token = response.access_token
              originalState.isAuthenticated = true
              
              return { success: true, user: response.user }
            },
            // Fallback to original implementation
            () => originalState.login(credentials)
          )
        },

        // Enhanced data fetching
        fetchWithCache: async (endpoint, options = {}) => {
          return GradualMigration.migratedAPICall(
            // New implementation with caching
            async () => {
              await GradualMigration.initialize()
              const apiGateway = GradualMigration.serviceFactory.getAPIGateway()
              
              return apiGateway.get(endpoint, {
                cache: true,
                cacheTTL: 300000,
                ...options
              })
            },
            // Fallback to axios direct call
            async () => {
              const axios = (await import('axios')).default
              const response = await axios.get(endpoint, options)
              return response.data
            }
          )
        },

        // Service layer status
        getServiceLayerStatus: () => ({
          available: Boolean(GradualMigration.serviceFactory),
          initialized: GradualMigration.serviceFactory?.initialized || false,
          services: GradualMigration.serviceFactory ? 
            Object.keys(GradualMigration.serviceFactory.getAllServices()) : []
        }),

        // Migration metrics
        getMigrationMetrics: () => GradualMigration.getMigrationMetrics()
      }

      // Return original state with enhancements
      if (typeof originalState === 'object' && originalState !== null) {
        return {
          ...originalState,
          ...enhancements
        }
      }

      return originalState
    }
  }

  /**
   * Create project store migration
   */
  static createEnhancedProjectStore(originalStore) {
    return function useEnhancedProjectStore(selector) {
      const originalState = originalStore(selector)
      
      const enhancements = {
        // Enhanced project fetching with caching and events
        fetchProjectsEnhanced: async (options = {}) => {
          return GradualMigration.migratedAPICall(
            // New repository-based implementation
            async () => {
              await GradualMigration.initialize()
              const projectRepository = GradualMigration.serviceFactory.getProjectRepository()
              
              const projects = await projectRepository.findAll({
                cache: true,
                filters: options.filters,
                sort: options.sort,
                pagination: options.pagination
              })
              
              // Update original store
              if (originalState.setProjects) {
                originalState.setProjects(projects)
              }
              
              return projects
            },
            // Fallback to original implementation
            () => originalState.fetchProjects ? originalState.fetchProjects(options) : []
          )
        },

        // Enhanced project creation
        createProjectEnhanced: async (projectData) => {
          return GradualMigration.migratedAPICall(
            // New service layer implementation
            async () => {
              await GradualMigration.initialize()
              const projectService = GradualMigration.serviceFactory.getProjectService()
              
              const project = await projectService.createProject(projectData)
              
              // Update original store
              if (originalState.addProject) {
                originalState.addProject(project)
              }
              
              return project
            },
            // Fallback to original implementation
            () => originalState.createProject ? originalState.createProject(projectData) : null
          )
        },

        // Analytics integration
        trackProjectAction: async (action, projectId) => {
          try {
            await GradualMigration.initialize()
            const analytics = GradualMigration.serviceFactory.getAnalyticsService()
            analytics.track(`project_${action}`, { project_id: projectId })
          } catch (error) {
            console.warn('Analytics tracking failed:', error)
          }
        }
      }

      return typeof originalState === 'object' && originalState !== null
        ? { ...originalState, ...enhancements }
        : originalState
    }
  }

  /**
   * Feature flag system for gradual rollout
   */
  static shouldUseServiceLayer(feature = 'default') {
    try {
      if (!this.serviceFactory) return false
      
      // Get feature flags from config
      const config = this.serviceFactory.getService('config')
      const featureFlags = {
        auth: true,
        projects: true,
        templates: true,
        integrations: true,
        ai: true,
        caching: true,
        analytics: true,
        default: true
      }
      
      return featureFlags[feature] ?? featureFlags.default
    } catch {
      return false
    }
  }

  /**
   * Performance comparison utility
   */
  static async compareImplementations(feature, newImpl, oldImpl, ...args) {
    const results = {
      feature,
      timestamp: Date.now(),
      new: null,
      old: null,
      winner: null,
      improvement: null
    }

    try {
      // Test new implementation
      const newStart = performance.now()
      const newResult = await newImpl(...args)
      const newDuration = performance.now() - newStart
      
      results.new = {
        duration: newDuration,
        success: true,
        result: newResult
      }

      // Test old implementation
      const oldStart = performance.now()
      const oldResult = await oldImpl(...args)
      const oldDuration = performance.now() - oldStart
      
      results.old = {
        duration: oldDuration,
        success: true,
        result: oldResult
      }

      // Calculate improvement
      results.improvement = ((oldDuration - newDuration) / oldDuration) * 100
      results.winner = newDuration < oldDuration ? 'new' : 'old'

      console.log(`Performance comparison for ${feature}:`, results)
      
      return results.winner === 'new' ? newResult : oldResult

    } catch (error) {
      console.warn(`Implementation comparison failed for ${feature}:`, error)
      
      // Return old implementation result as fallback
      try {
        return await oldImpl(...args)
      } catch (fallbackError) {
        throw error // Throw original error
      }
    }
  }

  /**
   * Migration tracking methods
   */
  static trackMigrationSuccess(feature) {
    const current = this.migrations.get(feature) || { successes: 0, fallbacks: 0, errors: [] }
    current.successes++
    this.migrations.set(feature, current)
  }

  static trackMigrationFallback(feature, error) {
    const current = this.migrations.get(feature) || { successes: 0, fallbacks: 0, errors: [] }
    current.fallbacks++
    current.errors.push({ error, timestamp: Date.now() })
    
    // Keep only last 10 errors
    if (current.errors.length > 10) {
      current.errors.shift()
    }
    
    this.migrations.set(feature, current)
  }

  static getMigrationMetrics() {
    const metrics = {}
    
    this.migrations.forEach((data, feature) => {
      const total = data.successes + data.fallbacks
      metrics[feature] = {
        ...data,
        total,
        successRate: total > 0 ? (data.successes / total) * 100 : 0,
        fallbackRate: total > 0 ? (data.fallbacks / total) * 100 : 0
      }
    })
    
    return {
      byFeature: metrics,
      overall: this.calculateOverallMetrics(metrics),
      timestamp: Date.now()
    }
  }

  static calculateOverallMetrics(featureMetrics) {
    const features = Object.values(featureMetrics)
    const totals = features.reduce(
      (acc, feature) => ({
        successes: acc.successes + feature.successes,
        fallbacks: acc.fallbacks + feature.fallbacks,
        total: acc.total + feature.total
      }),
      { successes: 0, fallbacks: 0, total: 0 }
    )

    return {
      ...totals,
      successRate: totals.total > 0 ? (totals.successes / totals.total) * 100 : 0,
      fallbackRate: totals.total > 0 ? (totals.fallbacks / totals.total) * 100 : 0,
      migrationHealth: totals.total > 0 ? 
        (totals.successes > totals.fallbacks ? 'good' : 'needs_attention') : 'no_data'
    }
  }

  /**
   * Cleanup method
   */
  static reset() {
    this.migrations.clear()
    this.serviceFactory = null
  }
}

/**
 * React Hook for Migration Support
 */
export const useMigration = (feature) => {
  const [isServiceLayerAvailable, setIsServiceLayerAvailable] = React.useState(false)
  const [migrationMetrics, setMigrationMetrics] = React.useState(null)

  React.useEffect(() => {
    const checkServiceLayer = async () => {
      try {
        await GradualMigration.initialize()
        setIsServiceLayerAvailable(true)
        setMigrationMetrics(GradualMigration.getMigrationMetrics())
      } catch (error) {
        setIsServiceLayerAvailable(false)
      }
    }

    checkServiceLayer()
    
    // Update metrics periodically
    const interval = setInterval(() => {
      setMigrationMetrics(GradualMigration.getMigrationMetrics())
    }, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return {
    isServiceLayerAvailable,
    shouldUseServiceLayer: GradualMigration.shouldUseServiceLayer(feature),
    migrationMetrics,
    compareImplementations: GradualMigration.compareImplementations,
    migratedAPICall: GradualMigration.migratedAPICall
  }
}

export { GradualMigration }