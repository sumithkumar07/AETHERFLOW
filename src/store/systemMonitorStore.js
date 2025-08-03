import { create } from 'zustand'
import axios from 'axios'
import toast from 'react-hot-toast'

// Enhanced System Monitor Store for comprehensive backend service tracking
const useSystemMonitorStore = create((set, get) => ({
  // Core Service Status
  services: {
    // Core API Services
    auth: { status: 'unknown', uptime: 0, responseTime: 0 },
    ai: { status: 'unknown', uptime: 0, responseTime: 0 },
    projects: { status: 'unknown', uptime: 0, responseTime: 0 },
    templates: { status: 'unknown', uptime: 0, responseTime: 0 },
    integrations: { status: 'unknown', uptime: 0, responseTime: 0 },
    
    // Advanced AI Services
    multiAgent: { status: 'unknown', uptime: 0, responseTime: 0 },
    enhancedAI: { status: 'unknown', uptime: 0, responseTime: 0 },
    advancedAI: { status: 'unknown', uptime: 0, responseTime: 0 },
    intelligentRouter: { status: 'unknown', uptime: 0, responseTime: 0 },
    
    // Enterprise Features
    enterprise: { status: 'unknown', uptime: 0, responseTime: 0 },
    analytics: { status: 'unknown', uptime: 0, responseTime: 0 },
    performance: { status: 'unknown', uptime: 0, responseTime: 0 },
    security: { status: 'unknown', uptime: 0, responseTime: 0 },
    collaboration: { status: 'unknown', uptime: 0, responseTime: 0 },
    
    // Specialized Services
    voice: { status: 'unknown', uptime: 0, responseTime: 0 },
    workflows: { status: 'unknown', uptime: 0, responseTime: 0 },
    visualProgramming: { status: 'unknown', uptime: 0, responseTime: 0 },
    codeQuality: { status: 'unknown', uptime: 0, responseTime: 0 },
    
    // Database & Infrastructure
    database: { status: 'unknown', uptime: 0, responseTime: 0 },
    websocket: { status: 'unknown', uptime: 0, responseTime: 0 },
    redis: { status: 'unknown', uptime: 0, responseTime: 0 },
    
    // Cutting-edge Services
    architecturalIntelligence: { status: 'unknown', uptime: 0, responseTime: 0 },
    smartDocumentation: { status: 'unknown', uptime: 0, responseTime: 0 },
    themeIntelligence: { status: 'unknown', uptime: 0, responseTime: 0 },
    projectMigration: { status: 'unknown', uptime: 0, responseTime: 0 },
    workspaceOptimization: { status: 'unknown', uptime: 0, responseTime: 0 },
    experimentalSandbox: { status: 'unknown', uptime: 0, responseTime: 0 },
    communityIntelligence: { status: 'unknown', uptime: 0, responseTime: 0 },
    
    // Advanced Enhancement Services
    videoExplanations: { status: 'unknown', uptime: 0, responseTime: 0 },
    seo: { status: 'unknown', uptime: 0, responseTime: 0 },
    i18n: { status: 'unknown', uptime: 0, responseTime: 0 },
    agentMarketplace: { status: 'unknown', uptime: 0, responseTime: 0 },
    presentations: { status: 'unknown', uptime: 0, responseTime: 0 }
  },

  // Service Endpoints Mapping
  serviceEndpoints: {
    auth: '/api/auth/health',
    ai: '/api/ai/status',
    projects: '/api/projects/health',
    templates: '/api/templates/health',
    integrations: '/api/integrations/health',
    
    multiAgent: '/api/agents/health',
    enhancedAI: '/api/enhanced/health',
    advancedAI: '/api/advanced-ai/health',
    intelligentRouter: '/api/ai/router/status',
    
    enterprise: '/api/enterprise/health',
    analytics: '/api/analytics/health',
    performance: '/api/performance/health',
    security: '/api/security/health',
    collaboration: '/api/collaboration/health',
    
    voice: '/api/voice/health',
    workflows: '/api/workflows/health',
    visualProgramming: '/api/visual-programming/health',
    codeQuality: '/api/code-quality/health',
    
    database: '/api/health',
    websocket: '/ws/health',
    redis: '/api/cache/health',
    
    architecturalIntelligence: '/api/architectural-intelligence/health',
    smartDocumentation: '/api/smart-documentation/health',
    themeIntelligence: '/api/theme-intelligence/health',
    projectMigration: '/api/project-migration/health',
    workspaceOptimization: '/api/workspace-optimization/health',
    experimentalSandbox: '/api/experimental-sandbox/health',
    communityIntelligence: '/api/community-intelligence/health',
    
    videoExplanations: '/api/video-explanations/health',
    seo: '/api/seo/health',
    i18n: '/api/i18n/health',
    agentMarketplace: '/api/agent-marketplace/health',
    presentations: '/api/presentations/health'
  },

  // System Performance Metrics
  systemMetrics: {
    totalRequests: 0,
    successRate: 0,
    avgResponseTime: 0,
    errorRate: 0,
    uptime: 0,
    activeConnections: 0,
    memoryUsage: 0,
    cpuUsage: 0
  },

  // Monitoring State
  isMonitoring: false,
  monitoringInterval: null,
  lastHealthCheck: null,
  alertsEnabled: true,
  performanceThreshold: 5000, // 5s response time threshold

  // Feature Utilization Tracking
  featureUsage: {
    aiChat: { count: 0, lastUsed: null, avgResponseTime: 0 },
    visualProgramming: { count: 0, lastUsed: null, avgResponseTime: 0 },
    collaboration: { count: 0, lastUsed: null, avgResponseTime: 0 },
    analytics: { count: 0, lastUsed: null, avgResponseTime: 0 },
    enterprise: { count: 0, lastUsed: null, avgResponseTime: 0 },
    voice: { count: 0, lastUsed: null, avgResponseTime: 0 },
    workflows: { count: 0, lastUsed: null, avgResponseTime: 0 }
  },

  loading: false,
  error: null,

  // Initialize comprehensive monitoring
  startMonitoring: () => {
    const state = get()
    
    if (state.isMonitoring) {
      console.log('System monitoring already active')
      return
    }

    console.log('🔍 Starting comprehensive system monitoring...')
    
    // Initial health check
    get().performHealthCheck()
    
    // Set up periodic monitoring (every 30 seconds)
    const interval = setInterval(() => {
      get().performHealthCheck()
    }, 30000)
    
    set({
      isMonitoring: true,
      monitoringInterval: interval
    })

    toast.success('System monitoring activated', {
      duration: 3000,
      icon: '🔍'
    })
  },

  stopMonitoring: () => {
    const state = get()
    
    if (state.monitoringInterval) {
      clearInterval(state.monitoringInterval)
    }
    
    set({
      isMonitoring: false,
      monitoringInterval: null
    })

    toast.info('System monitoring stopped', {
      duration: 2000,
      icon: '⏹️'
    })
  },

  // Comprehensive health check of all services
  performHealthCheck: async () => {
    const startTime = Date.now()
    const state = get()
    
    try {
      set({ loading: true, error: null })
      
      const healthChecks = await Promise.allSettled(
        Object.entries(state.serviceEndpoints).map(async ([serviceName, endpoint]) => {
          const serviceStartTime = Date.now()
          
          try {
            const response = await axios.get(endpoint, { 
              timeout: 10000,
              headers: { 'Cache-Control': 'no-cache' }
            })
            
            const responseTime = Date.now() - serviceStartTime
            
            return {
              service: serviceName,
              status: 'healthy',
              responseTime,
              uptime: response.data?.uptime || 0,
              data: response.data
            }
          } catch (error) {
            const responseTime = Date.now() - serviceStartTime
            
            return {
              service: serviceName,
              status: error.response?.status === 404 ? 'not-implemented' : 'unhealthy',
              responseTime,
              uptime: 0,
              error: error.message
            }
          }
        })
      )

      // Process health check results
      const updatedServices = {}
      let totalResponseTime = 0
      let healthyCount = 0
      let totalCount = 0

      healthChecks.forEach((result) => {
        if (result.status === 'fulfilled') {
          const { service, status, responseTime, uptime, data, error } = result.value
          
          updatedServices[service] = {
            status,
            responseTime,
            uptime,
            lastChecked: new Date().toISOString(),
            data: data || {},
            error: error || null
          }

          totalResponseTime += responseTime
          totalCount++
          
          if (status === 'healthy') {
            healthyCount++
          }

          // Alert for slow services
          if (status === 'healthy' && responseTime > state.performanceThreshold && state.alertsEnabled) {
            toast.warning(`${service} is responding slowly (${responseTime}ms)`, {
              duration: 4000,
              icon: '⚠️'
            })
          }
        }
      })

      // Calculate system metrics
      const systemMetrics = {
        totalRequests: state.systemMetrics.totalRequests + totalCount,
        successRate: totalCount > 0 ? (healthyCount / totalCount) * 100 : 0,
        avgResponseTime: totalCount > 0 ? totalResponseTime / totalCount : 0,
        errorRate: totalCount > 0 ? ((totalCount - healthyCount) / totalCount) * 100 : 0,
        uptime: Date.now() - startTime,
        activeConnections: healthyCount,
        lastHealthCheck: new Date().toISOString()
      }

      set({
        services: { ...state.services, ...updatedServices },
        systemMetrics,
        lastHealthCheck: new Date().toISOString(),
        loading: false
      })

      // Success feedback for comprehensive health check
      const healthyServices = healthyCount
      const totalServices = totalCount
      const avgTime = Math.round(systemMetrics.avgResponseTime)
      
      console.log(`✅ Health check completed: ${healthyServices}/${totalServices} services healthy (avg: ${avgTime}ms)`)
      
      return {
        success: true,
        healthyServices,
        totalServices,
        averageResponseTime: avgTime
      }

    } catch (error) {
      const errorMsg = 'System health check failed'
      console.error(errorMsg, error)
      
      set({
        error: errorMsg,
        loading: false
      })

      if (state.alertsEnabled) {
        toast.error('System health check failed', {
          duration: 5000,
          icon: '🚨'
        })
      }

      return { success: false, error: errorMsg }
    }
  },

  // Get service status summary
  getServiceSummary: () => {
    const services = get().services
    const summary = {
      total: Object.keys(services).length,
      healthy: 0,
      unhealthy: 0,
      notImplemented: 0,
      unknown: 0
    }

    Object.values(services).forEach(service => {
      switch (service.status) {
        case 'healthy':
          summary.healthy++
          break
        case 'unhealthy':
          summary.unhealthy++
          break
        case 'not-implemented':
          summary.notImplemented++
          break
        default:
          summary.unknown++
      }
    })

    return summary
  },

  // Get performance insights
  getPerformanceInsights: () => {
    const services = get().services
    const metrics = get().systemMetrics
    
    const insights = {
      slowestServices: Object.entries(services)
        .filter(([_, service]) => service.status === 'healthy')
        .sort((a, b) => b[1].responseTime - a[1].responseTime)
        .slice(0, 5)
        .map(([name, service]) => ({
          name,
          responseTime: service.responseTime
        })),
      
      fastestServices: Object.entries(services)
        .filter(([_, service]) => service.status === 'healthy')
        .sort((a, b) => a[1].responseTime - b[1].responseTime)
        .slice(0, 5)
        .map(([name, service]) => ({
          name,
          responseTime: service.responseTime
        })),
      
      systemHealth: {
        overallStatus: metrics.successRate > 80 ? 'excellent' : 
                     metrics.successRate > 60 ? 'good' : 
                     metrics.successRate > 40 ? 'fair' : 'poor',
        successRate: metrics.successRate,
        avgResponseTime: metrics.avgResponseTime,
        recommendations: get().generateRecommendations()
      }
    }

    return insights
  },

  // Generate system improvement recommendations
  generateRecommendations: () => {
    const services = get().services
    const metrics = get().systemMetrics
    const recommendations = []

    // Performance recommendations
    if (metrics.avgResponseTime > 3000) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        title: 'Optimize Response Times',
        description: `Average response time is ${Math.round(metrics.avgResponseTime)}ms. Consider caching and optimization.`
      })
    }

    // Service availability recommendations
    const unhealthyServices = Object.entries(services)
      .filter(([_, service]) => service.status === 'unhealthy')
    
    if (unhealthyServices.length > 0) {
      recommendations.push({
        type: 'availability',
        priority: 'critical',
        title: 'Fix Unhealthy Services',
        description: `${unhealthyServices.length} services are unhealthy: ${unhealthyServices.map(([name]) => name).join(', ')}`
      })
    }

    // Feature utilization recommendations
    const underutilizedFeatures = Object.entries(get().featureUsage)
      .filter(([_, usage]) => usage.count < 5)
      .map(([feature]) => feature)

    if (underutilizedFeatures.length > 0) {
      recommendations.push({
        type: 'utilization',
        priority: 'medium',
        title: 'Explore Underutilized Features',
        description: `Consider exploring: ${underutilizedFeatures.join(', ')}`
      })
    }

    return recommendations
  },

  // Track feature usage
  trackFeatureUsage: (feature, responseTime = 0) => {
    set(state => ({
      featureUsage: {
        ...state.featureUsage,
        [feature]: {
          count: (state.featureUsage[feature]?.count || 0) + 1,
          lastUsed: new Date().toISOString(),
          avgResponseTime: responseTime > 0 ? 
            ((state.featureUsage[feature]?.avgResponseTime || 0) + responseTime) / 2 : 
            state.featureUsage[feature]?.avgResponseTime || 0
        }
      }
    }))
  },

  // Toggle alerts
  toggleAlerts: () => {
    set(state => ({ alertsEnabled: !state.alertsEnabled }))
    
    const enabled = get().alertsEnabled
    toast.success(`System alerts ${enabled ? 'enabled' : 'disabled'}`, {
      duration: 2000,
      icon: enabled ? '🔔' : '🔕'
    })
  },

  // Manual service test
  testService: async (serviceName) => {
    const state = get()
    const endpoint = state.serviceEndpoints[serviceName]
    
    if (!endpoint) {
      toast.error(`Unknown service: ${serviceName}`)
      return { success: false, error: 'Unknown service' }
    }

    try {
      set({ loading: true })
      
      const startTime = Date.now()
      const response = await axios.get(endpoint, { timeout: 10000 })
      const responseTime = Date.now() - startTime
      
      set(state => ({
        services: {
          ...state.services,
          [serviceName]: {
            status: 'healthy',
            responseTime,
            uptime: response.data?.uptime || 0,
            lastChecked: new Date().toISOString(),
            data: response.data || {}
          }
        },
        loading: false
      }))

      toast.success(`${serviceName} is healthy (${responseTime}ms)`, {
        duration: 3000,
        icon: '✅'
      })

      return { success: true, responseTime, data: response.data }
      
    } catch (error) {
      const responseTime = Date.now() - Date.now()
      
      set(state => ({
        services: {
          ...state.services,
          [serviceName]: {
            status: 'unhealthy',
            responseTime,
            uptime: 0,
            lastChecked: new Date().toISOString(),
            error: error.message
          }
        },
        loading: false
      }))

      toast.error(`${serviceName} test failed: ${error.message}`, {
        duration: 5000,
        icon: '❌'
      })

      return { success: false, error: error.message }
    }
  },

  // Export system report
  exportSystemReport: () => {
    const state = get()
    const report = {
      timestamp: new Date().toISOString(),
      services: state.services,
      systemMetrics: state.systemMetrics,
      featureUsage: state.featureUsage,
      serviceSummary: get().getServiceSummary(),
      performanceInsights: get().getPerformanceInsights(),
      recommendations: get().generateRecommendations()
    }

    // Create downloadable report
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `aether-ai-system-report-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    toast.success('System report exported', {
      duration: 3000,
      icon: '📊'
    })
  },

  // Reset all metrics
  reset: () => {
    set({
      services: Object.keys(get().services).reduce((acc, key) => {
        acc[key] = { status: 'unknown', uptime: 0, responseTime: 0 }
        return acc
      }, {}),
      systemMetrics: {
        totalRequests: 0,
        successRate: 0,
        avgResponseTime: 0,
        errorRate: 0,
        uptime: 0,
        activeConnections: 0,
        memoryUsage: 0,
        cpuUsage: 0
      },
      featureUsage: Object.keys(get().featureUsage).reduce((acc, key) => {
        acc[key] = { count: 0, lastUsed: null, avgResponseTime: 0 }
        return acc
      }, {}),
      lastHealthCheck: null,
      error: null
    })

    toast.success('System metrics reset', {
      duration: 2000,
      icon: '🔄'
    })
  }
}))

export { useSystemMonitorStore }