// Real-Time Backend Hook
// Connects React components to ALL 60+ backend services with real-time updates
// Makes the Aether AI Platform truly functional with live data

import { useState, useEffect, useCallback, useRef } from 'react'
import realTimeIntegration from '../services/realTimeIntegration'
import { useAuthStore } from '../store/authStore'

export const useRealTimeBackend = (services = []) => {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [connected, setConnected] = useState(false)
  const [serviceHealth, setServiceHealth] = useState({})
  
  const { isAuthenticated } = useAuthStore()
  const mounted = useRef(true)
  const eventHandlers = useRef(new Map())

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  // Initialize real-time integration
  useEffect(() => {
    if (!isAuthenticated) return

    const initializeRealTime = async () => {
      try {
        setLoading(true)
        console.log('🚀 Initializing real-time backend connection...')
        
        const success = await realTimeIntegration.initialize()
        
        if (mounted.current) {
          setConnected(success)
          if (success) {
            console.log('✅ Real-time backend connected - ALL SERVICES AVAILABLE!')
            await loadInitialData()
          } else {
            setError('Failed to connect to backend services')
          }
        }
      } catch (err) {
        if (mounted.current) {
          setError(err.message)
          setConnected(false)
        }
      } finally {
        if (mounted.current) {
          setLoading(false)
        }
      }
    }

    initializeRealTime()

    // Cleanup on unmount
    return () => {
      if (eventHandlers.current) {
        eventHandlers.current.forEach((handler, event) => {
          realTimeIntegration.off(event, handler)
        })
        eventHandlers.current.clear()
      }
    }
  }, [isAuthenticated])

  // Set up real-time event listeners
  useEffect(() => {
    if (!connected) return

    // Service health updates
    const handleServicesChecked = (health) => {
      if (mounted.current) {
        setServiceHealth(health)
        updateData('serviceHealth', health)
      }
    }

    // Performance updates
    const handlePerformanceUpdate = (metrics) => {
      if (mounted.current) {
        updateData('performance', metrics)
      }
    }

    // Analytics updates
    const handleAnalyticsUpdate = (analytics) => {
      if (mounted.current) {
        updateData('analytics', analytics)
      }
    }

    // AI status updates
    const handleAIStatusUpdate = (aiStatus) => {
      if (mounted.current) {
        updateData('ai', aiStatus)
      }
    }

    // Collaboration updates
    const handleCollaborationUpdate = (collaboration) => {
      if (mounted.current) {
        updateData('collaboration', collaboration)
      }
    }

    // System alerts
    const handleSystemAlert = (alert) => {
      if (mounted.current) {
        updateData('alerts', prev => [...(prev || []), alert])
      }
    }

    // Register event handlers
    const handlers = {
      'servicesChecked': handleServicesChecked,
      'performanceUpdate': handlePerformanceUpdate,
      'analyticsUpdate': handleAnalyticsUpdate,
      'aiStatusUpdate': handleAIStatusUpdate,
      'collaborationUpdate': handleCollaborationUpdate,
      'systemAlert': handleSystemAlert
    }

    Object.entries(handlers).forEach(([event, handler]) => {
      realTimeIntegration.on(event, handler)
      eventHandlers.current.set(event, handler)
    })

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        realTimeIntegration.off(event, handler)
      })
    }
  }, [connected])

  const loadInitialData = async () => {
    try {
      const overview = await realTimeIntegration.getPlatformOverview()
      
      if (mounted.current) {
        setData(overview)
        setServiceHealth(overview.services || {})
      }
    } catch (err) {
      if (mounted.current) {
        setError(`Failed to load platform data: ${err.message}`)
      }
    }
  }

  const updateData = useCallback((key, value) => {
    setData(prev => ({
      ...prev,
      [key]: typeof value === 'function' ? value(prev[key]) : value,
      lastUpdated: new Date().toISOString()
    }))
  }, [])

  // Refresh all data
  const refresh = useCallback(async () => {
    if (!connected) return

    try {
      setLoading(true)
      await loadInitialData()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [connected])

  // Get specific service data
  const getServiceData = useCallback(async (serviceName) => {
    if (!connected) return null

    try {
      switch (serviceName) {
        case 'enterprise':
          return await realTimeIntegration.getEnterpriseFeatures()
        case 'analytics':
          return await realTimeIntegration.getAdvancedAnalytics()
        case 'performance':
          return await realTimeIntegration.getPerformanceInsights()
        case 'ai':
          return await realTimeIntegration.getMultiAgentCoordination()
        case 'collaboration':
          return await realTimeIntegration.getCollaborationStatus()
        default:
          return data[serviceName] || null
      }
    } catch (err) {
      console.error(`Failed to get ${serviceName} data:`, err)
      return null
    }
  }, [connected, data])

  // Send real-time updates
  const sendUpdate = useCallback((type, payload) => {
    if (realTimeIntegration.websocket && realTimeIntegration.websocket.readyState === WebSocket.OPEN) {
      realTimeIntegration.websocket.send(JSON.stringify({ type, payload }))
      return true
    }
    return false
  }, [])

  return {
    // Data
    data,
    serviceHealth,
    
    // State
    loading,
    error,
    connected,
    
    // Actions
    refresh,
    getServiceData,
    sendUpdate,
    
    // Real-time helpers
    isServiceHealthy: (service) => serviceHealth.services?.[service]?.status === 'healthy',
    getOverallHealth: () => serviceHealth.percentage || 0,
    getHealthyServicesCount: () => serviceHealth.healthy || 0,
    getTotalServicesCount: () => serviceHealth.total || 0,
    
    // Data accessors with fallbacks
    getAnalytics: () => data.analytics || {},
    getPerformance: () => data.performance || {},
    getAIStatus: () => data.ai || { agents: [] },
    getEnterprise: () => data.enterprise || { features: { available: false } },
    getCollaboration: () => data.collaboration || { sessions: { active_sessions: [] } },
    getAlerts: () => data.alerts || [],
    
    // Computed values
    isFullyOperational: connected && (serviceHealth.percentage || 0) > 80,
    hasAnyAlerts: (data.alerts?.length || 0) > 0,
    allServicesConnected: data.allServicesConnected || false
  }
}

// Hook for specific service integration
export const useServiceIntegration = (serviceName) => {
  const {
    data,
    loading,
    error,
    connected,
    getServiceData,
    isServiceHealthy
  } = useRealTimeBackend([serviceName])
  
  const [serviceData, setServiceData] = useState(null)
  const [serviceLoading, setServiceLoading] = useState(false)
  
  const loadServiceData = useCallback(async () => {
    setServiceLoading(true)
    try {
      const result = await getServiceData(serviceName)
      setServiceData(result)
    } catch (err) {
      console.error(`Service ${serviceName} error:`, err)
    } finally {
      setServiceLoading(false)
    }
  }, [serviceName, getServiceData])
  
  useEffect(() => {
    if (connected) {
      loadServiceData()
    }
  }, [connected, loadServiceData])
  
  return {
    data: serviceData || data[serviceName],
    loading: loading || serviceLoading,
    error,
    connected,
    healthy: isServiceHealthy(`/api/${serviceName}`),
    refresh: loadServiceData
  }
}

// Analytics specific hook
export const useAnalytics = () => {
  return useServiceIntegration('analytics')
}

// Performance monitoring hook
export const usePerformanceMonitoring = () => {
  return useServiceIntegration('performance')
}

// Enterprise features hook
export const useEnterpriseFeatures = () => {
  return useServiceIntegration('enterprise')
}

// AI services hook
export const useAIServices = () => {
  return useServiceIntegration('ai')
}

// Collaboration hook
export const useCollaboration = (projectId = null) => {
  const { data, ...rest } = useServiceIntegration('collaboration')
  
  const [projectCollaboration, setProjectCollaboration] = useState(null)
  
  useEffect(() => {
    if (projectId && rest.connected) {
      realTimeIntegration.getCollaborationStatus(projectId)
        .then(setProjectCollaboration)
        .catch(console.error)
    }
  }, [projectId, rest.connected])
  
  return {
    ...rest,
    data: projectId ? projectCollaboration : data,
    projectId
  }
}

export default useRealTimeBackend