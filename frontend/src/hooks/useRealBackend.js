// React Hook for Real Backend Integration
// Eliminates mock data and connects to actual 60+ backend services

import { useState, useEffect, useCallback } from 'react'
import realAPI from '../services/realAPI'
import toast from 'react-hot-toast'

export const useRealBackend = () => {
  const [backendStatus, setBackendStatus] = useState({
    connected: false,
    servicesHealth: 0,
    totalServices: 0,
    loading: true
  })

  const [services, setServices] = useState({
    voice: null,
    advancedAI: null,
    enterprise: null,
    analytics: null,
    performance: null,
    visual: null,
    collaboration: null,
    security: null,
    workflows: null,
    architectural: null
  })

  // Check backend connection and service health
  const checkBackendHealth = useCallback(async () => {
    try {
      setBackendStatus(prev => ({ ...prev, loading: true }))
      
      const healthCheck = await realAPI.checkAllServicesHealth()
      
      setBackendStatus({
        connected: true,
        servicesHealth: healthCheck.overall_health,
        totalServices: healthCheck.total_services,
        healthyServices: healthCheck.healthy_services,
        failedServices: healthCheck.failed_services,
        loading: false,
        lastCheck: new Date().toISOString()
      })

      if (healthCheck.overall_health > 80) {
        toast.success(`🎉 ${healthCheck.healthy_services}/${healthCheck.total_services} backend services are healthy!`)
      } else if (healthCheck.overall_health > 50) {
        toast.warn(`⚠️ ${healthCheck.healthy_services}/${healthCheck.total_services} backend services healthy`)
      } else {
        toast.error(`❌ Backend services degraded: ${healthCheck.healthy_services}/${healthCheck.total_services} healthy`)
      }

      return healthCheck

    } catch (error) {
      console.error('Backend health check failed:', error)
      setBackendStatus({
        connected: false,
        servicesHealth: 0,
        totalServices: 0,
        loading: false,
        error: error.message
      })
      toast.error('Backend connection failed - using fallback data')
      return null
    }
  }, [])

  // Load specific service data
  const loadServiceData = useCallback(async (serviceName, loader) => {
    try {
      const data = await loader()
      setServices(prev => ({
        ...prev,
        [serviceName]: { data, loaded: true, error: null }
      }))
      return data
    } catch (error) {
      console.warn(`${serviceName} service failed:`, error)
      setServices(prev => ({
        ...prev,
        [serviceName]: { data: null, loaded: true, error: error.message }
      }))
      return null
    }
  }, [])

  // Real service loaders
  const loadVoiceCapabilities = useCallback(() => 
    loadServiceData('voice', () => realAPI.getVoiceCapabilities()), [loadServiceData])

  const loadAdvancedAI = useCallback(() => 
    loadServiceData('advancedAI', () => realAPI.getAdvancedAIModels()), [loadServiceData])

  const loadEnterpriseFeatures = useCallback(() => 
    loadServiceData('enterprise', () => realAPI.getEnterpriseFeatures()), [loadServiceData])

  const loadAnalyticsDashboard = useCallback(() => 
    loadServiceData('analytics', () => realAPI.getAnalyticsDashboard()), [loadServiceData])

  const loadPerformanceMetrics = useCallback(() => 
    loadServiceData('performance', () => realAPI.getPerformanceMetrics()), [loadServiceData])

  const loadVisualProgramming = useCallback(() => 
    loadServiceData('visual', () => realAPI.getSupportedDiagramTypes()), [loadServiceData])

  const loadCollaborationStatus = useCallback(() => 
    loadServiceData('collaboration', () => realAPI.getActiveCollaborationSessions()), [loadServiceData])

  const loadSecurityDashboard = useCallback(() => 
    loadServiceData('security', () => realAPI.getSecurityScore()), [loadServiceData])

  const loadWorkflowAutomation = useCallback(() => 
    loadServiceData('workflows', () => realAPI.getWorkflows()), [loadServiceData])

  const loadArchitecturalIntelligence = useCallback(async (projectId) => 
    loadServiceData('architectural', () => 
      projectId ? realAPI.analyzeProjectStructure(projectId) : Promise.resolve({ available: true })
    ), [loadServiceData])

  // Load all services at once
  const loadAllServices = useCallback(async (projectId = null) => {
    console.log('🔄 Loading all backend services...')
    
    const loaders = [
      loadVoiceCapabilities(),
      loadAdvancedAI(),
      loadEnterpriseFeatures(),
      loadAnalyticsDashboard(),
      loadPerformanceMetrics(),
      loadVisualProgramming(),
      loadCollaborationStatus(),
      loadSecurityDashboard(),
      loadWorkflowAutomation(),
      loadArchitecturalIntelligence(projectId)
    ]

    await Promise.allSettled(loaders)
    
    const loadedServices = Object.values(services).filter(s => s?.loaded).length
    console.log(`✅ Loaded ${loadedServices}/10 backend services`)
    
    if (loadedServices > 7) {
      toast.success(`🚀 ${loadedServices}/10 advanced services loaded!`)
    }
  }, [
    loadVoiceCapabilities, loadAdvancedAI, loadEnterpriseFeatures,
    loadAnalyticsDashboard, loadPerformanceMetrics, loadVisualProgramming,
    loadCollaborationStatus, loadSecurityDashboard, loadWorkflowAutomation,
    loadArchitecturalIntelligence, services
  ])

  // Initialize on mount
  useEffect(() => {
    checkBackendHealth()
  }, [checkBackendHealth])

  return {
    // Backend status
    backendStatus,
    services,
    
    // Health check
    checkBackendHealth,
    
    // Individual service loaders
    loadVoiceCapabilities,
    loadAdvancedAI,
    loadEnterpriseFeatures,
    loadAnalyticsDashboard,
    loadPerformanceMetrics,
    loadVisualProgramming,
    loadCollaborationStatus,
    loadSecurityDashboard,
    loadWorkflowAutomation,
    loadArchitecturalIntelligence,
    
    // Batch loader
    loadAllServices,
    
    // Direct API access
    api: realAPI
  }
}

// Hook for specific service data with automatic loading
export const useServiceData = (serviceName, loader, dependencies = []) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true

    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const result = await loader()
        
        if (mounted) {
          setData(result)
          setLoading(false)
        }
      } catch (err) {
        if (mounted) {
          setError(err.message)
          setLoading(false)
          console.warn(`${serviceName} failed:`, err)
        }
      }
    }

    loadData()

    return () => {
      mounted = false
    }
  }, dependencies)

  return { data, loading, error, reload: () => setLoading(true) }
}

// Specialized hooks for common use cases
export const useVoiceCapabilities = () => {
  return useServiceData('voice', () => realAPI.getVoiceCapabilities())
}

export const useAdvancedAI = () => {
  return useServiceData('advancedAI', () => realAPI.getAdvancedAIModels())
}

export const useEnterpriseFeatures = () => {
  return useServiceData('enterprise', () => realAPI.getEnterpriseFeatures())
}

export const useAnalyticsDashboard = () => {
  return useServiceData('analytics', () => realAPI.getAnalyticsDashboard())
}

export const usePerformanceMetrics = () => {
  return useServiceData('performance', () => realAPI.getPerformanceMetrics())
}

export const useRealTimeUpdates = (endpoints, interval = 30000) => {
  const [data, setData] = useState({})
  const [lastUpdate, setLastUpdate] = useState(null)

  useEffect(() => {
    const updateData = async () => {
      try {
        const results = await realAPI.batchApiCall(
          endpoints.map(endpoint => ({ endpoint }))
        )
        
        const newData = results.reduce((acc, result) => {
          if (result.success) {
            acc[result.endpoint] = result.data
          }
          return acc
        }, {})
        
        setData(newData)
        setLastUpdate(new Date().toISOString())
      } catch (error) {
        console.warn('Real-time update failed:', error)
      }
    }

    // Initial load
    updateData()
    
    // Set up interval
    const intervalId = setInterval(updateData, interval)
    
    return () => clearInterval(intervalId)
  }, [endpoints, interval])

  return { data, lastUpdate }
}