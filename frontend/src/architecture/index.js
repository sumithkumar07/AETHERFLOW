/**
 * Enterprise Architecture Export Index
 * Central export point for all architecture components
 */

// Core Services
export { APIGateway } from './core/APIGateway'
export { CacheManager } from './core/CacheManager'
export { ConfigManager } from './core/ConfigManager'
export { EventBus } from './core/EventBus'
export { RetryManager } from './core/RetryManager'
export { PerformanceMonitor } from './core/PerformanceMonitor'

// Repository Pattern
export { BaseRepository } from './repositories/BaseRepository'
export { ProjectRepository } from './repositories/ProjectRepository'

// Service Layer
export { ServiceFactory } from './services/ServiceFactory'

// Integration Utilities
export { useEnhancedAuthStore } from './integration/EnhancedAuthStore'
export { StoreEnhancer } from './integration/StoreEnhancer'
export { ArchitectureProvider, useArchitecture } from './integration/ArchitectureProvider'

// Convenience hooks and utilities
export const useServices = () => {
  const { services } = useArchitecture()
  return services
}

export const useRepository = (name) => {
  const { repositories } = useArchitecture()
  return repositories[name]
}

export const useAPI = () => {
  const { api } = useArchitecture()
  return api
}

export const useCache = () => {
  const { cache } = useArchitecture()
  return cache
}

export const useEvents = () => {
  const { events } = useArchitecture()
  return events
}

export const useAnalytics = () => {
  const { analytics } = useArchitecture()
  return analytics
}

export const usePerformance = () => {
  const { performance } = useArchitecture()
  return performance
}

// Architecture utilities
export const createEnhancedStore = (storeConfig, resourceName, options = {}) => {
  return StoreEnhancer.wrapStore(storeConfig, resourceName, options)
}

export const withServiceLayer = (component, options = {}) => {
  return function ServiceLayerWrapper(props) {
    const architecture = useArchitecture()
    
    return component({
      ...props,
      services: architecture.services,
      api: architecture.api,
      cache: architecture.cache,
      events: architecture.events,
      analytics: architecture.analytics
    })
  }
}