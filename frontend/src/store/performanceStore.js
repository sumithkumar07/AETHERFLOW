import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Performance monitoring store for real-time metrics
const usePerformanceStore = create(
  persist(
    (set, get) => ({
      // Performance metrics state
      metrics: {
        lastResponseTime: null,
        averageResponseTime: null,
        totalMessages: 0,
        totalErrors: 0,
        uptime: null,
        memoryUsage: null,
        cpuUsage: null,
        cacheHitRate: null,
        activeConnections: 0
      },
      
      // Historical data for trends
      responseTimeHistory: [],
      performanceTrend: [],
      alerts: [],
      
      // Performance monitoring flags
      monitoringEnabled: true,
      alertThresholds: {
        responseTime: 2000, // 2 seconds
        errorRate: 5, // 5%
        memoryUsage: 512 // 512MB
      },

      // Actions
      updateMetrics: (newMetrics = {}) => {
        const currentMetrics = get().metrics
        const updatedMetrics = { ...currentMetrics, ...newMetrics }
        
        // Update response time history
        if (newMetrics.lastResponseTime) {
          const history = get().responseTimeHistory
          const newHistory = [...history, {
            time: new Date().toISOString(),
            responseTime: newMetrics.lastResponseTime,
            timestamp: Date.now()
          }].slice(-50) // Keep last 50 entries
          
          // Calculate average response time
          const avgResponseTime = newHistory.reduce((sum, entry) => sum + entry.responseTime, 0) / newHistory.length
          updatedMetrics.averageResponseTime = avgResponseTime
          
          set({ 
            metrics: updatedMetrics,
            responseTimeHistory: newHistory
          })
          
          // Check for performance alerts
          get().checkPerformanceAlerts(updatedMetrics)
        } else {
          set({ metrics: updatedMetrics })
        }
      },

      // Real-time performance monitoring
      startPerformanceMonitoring: () => {
        if (!get().monitoringEnabled) return
        
        const interval = setInterval(() => {
          // Simulate system metrics collection
          const metrics = {
            uptime: Math.floor(performance.now() / 1000),
            memoryUsage: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : null,
            timestamp: new Date().toISOString()
          }
          
          get().updateMetrics(metrics)
        }, 5000) // Update every 5 seconds
        
        // Store interval ID for cleanup
        set({ monitoringInterval: interval })
      },

      stopPerformanceMonitoring: () => {
        const interval = get().monitoringInterval
        if (interval) {
          clearInterval(interval)
          set({ monitoringInterval: null })
        }
      },

      // Performance trend analysis
      getPerformanceTrend: (minutes = 15) => {
        const history = get().responseTimeHistory
        const cutoffTime = Date.now() - (minutes * 60 * 1000)
        
        return history
          .filter(entry => entry.timestamp > cutoffTime)
          .map(entry => ({
            time: new Date(entry.time).toLocaleTimeString(),
            responseTime: entry.responseTime,
            performance: entry.responseTime < 1000 ? 'excellent' : 
                        entry.responseTime < 2000 ? 'good' : 'slow'
          }))
      },

      // Performance alerts system
      checkPerformanceAlerts: (metrics) => {
        const alerts = get().alerts
        const thresholds = get().alertThresholds
        const newAlerts = []

        // Response time alerts
        if (metrics.lastResponseTime > thresholds.responseTime) {
          newAlerts.push({
            id: `response_time_${Date.now()}`,
            type: 'warning',
            title: 'Slow Response Time',
            message: `Response took ${Math.round(metrics.lastResponseTime)}ms (threshold: ${thresholds.responseTime}ms)`,
            timestamp: new Date().toISOString(),
            severity: metrics.lastResponseTime > thresholds.responseTime * 2 ? 'high' : 'medium'
          })
        }

        // Error rate alerts
        if (metrics.totalMessages > 0) {
          const errorRate = (metrics.totalErrors / metrics.totalMessages) * 100
          if (errorRate > thresholds.errorRate) {
            newAlerts.push({
              id: `error_rate_${Date.now()}`,
              type: 'error',
              title: 'High Error Rate',
              message: `Error rate is ${errorRate.toFixed(1)}% (threshold: ${thresholds.errorRate}%)`,
              timestamp: new Date().toISOString(),
              severity: 'high'
            })
          }
        }

        // Memory usage alerts
        if (metrics.memoryUsage > thresholds.memoryUsage) {
          newAlerts.push({
            id: `memory_${Date.now()}`,
            type: 'warning',
            title: 'High Memory Usage',
            message: `Memory usage is ${metrics.memoryUsage}MB (threshold: ${thresholds.memoryUsage}MB)`,
            timestamp: new Date().toISOString(),
            severity: 'medium'
          })
        }

        if (newAlerts.length > 0) {
          const allAlerts = [...alerts, ...newAlerts].slice(-10) // Keep last 10 alerts
          set({ alerts: allAlerts })
        }
      },

      // Get optimization suggestions
      getOptimizationSuggestions: () => {
        const metrics = get().metrics
        const history = get().responseTimeHistory
        const suggestions = []

        // Response time optimizations
        if (metrics.averageResponseTime > 1500) {
          suggestions.push({
            type: 'performance',
            title: 'Optimize Response Times',
            description: 'Consider implementing response caching or switching to faster AI models',
            impact: 'High',
            effort: 'Medium',
            priority: metrics.averageResponseTime > 3000 ? 'high' : 'medium'
          })
        }

        // Memory optimization
        if (metrics.memoryUsage > 400) {
          suggestions.push({
            type: 'memory',
            title: 'Optimize Memory Usage',
            description: 'Clean up conversation history and implement better garbage collection',
            impact: 'Medium',
            effort: 'Low',
            priority: 'medium'
          })
        }

        // Error rate optimization
        if (metrics.totalErrors > 0 && metrics.totalMessages > 10) {
          const errorRate = (metrics.totalErrors / metrics.totalMessages) * 100
          if (errorRate > 2) {
            suggestions.push({
              type: 'reliability',
              title: 'Improve Error Handling',
              description: 'Implement better error recovery and fallback mechanisms',
              impact: 'High',
              effort: 'High',
              priority: 'high'
            })
          }
        }

        // Performance trend analysis
        if (history.length >= 10) {
          const recentTrend = history.slice(-10)
          const isGettingSlower = recentTrend.some((entry, index) => 
            index > 0 && entry.responseTime > recentTrend[index - 1].responseTime * 1.2
          )
          
          if (isGettingSlower) {
            suggestions.push({
              type: 'trend',
              title: 'Performance Degradation Detected',
              description: 'Response times are trending upward, investigate potential causes',
              impact: 'High',
              effort: 'Medium',
              priority: 'high'
            })
          }
        }

        return suggestions.sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        })
      },

      // Performance reporting
      generatePerformanceReport: () => {
        const metrics = get().metrics
        const history = get().responseTimeHistory
        const alerts = get().alerts
        const suggestions = get().getOptimizationSuggestions()

        return {
          timestamp: new Date().toISOString(),
          summary: {
            averageResponseTime: metrics.averageResponseTime,
            totalMessages: metrics.totalMessages,
            totalErrors: metrics.totalErrors,
            errorRate: metrics.totalMessages > 0 ? (metrics.totalErrors / metrics.totalMessages) * 100 : 0,
            uptime: metrics.uptime,
            memoryUsage: metrics.memoryUsage
          },
          performance: {
            responseTimeHistory: history.slice(-20),
            performanceTrend: get().getPerformanceTrend(30),
            healthScore: get().calculateHealthScore()
          },
          alerts: alerts.slice(-5),
          suggestions: suggestions.slice(0, 3),
          recommendations: get().getPerformanceRecommendations()
        }
      },

      // Calculate overall health score
      calculateHealthScore: () => {
        const metrics = get().metrics
        let score = 100

        // Response time impact
        if (metrics.averageResponseTime > 3000) score -= 30
        else if (metrics.averageResponseTime > 2000) score -= 20
        else if (metrics.averageResponseTime > 1000) score -= 10

        // Error rate impact
        if (metrics.totalMessages > 0) {
          const errorRate = (metrics.totalErrors / metrics.totalMessages) * 100
          if (errorRate > 10) score -= 40
          else if (errorRate > 5) score -= 20
          else if (errorRate > 2) score -= 10
        }

        // Memory usage impact
        if (metrics.memoryUsage > 800) score -= 20
        else if (metrics.memoryUsage > 600) score -= 10

        return Math.max(0, Math.round(score))
      },

      // Performance recommendations
      getPerformanceRecommendations: () => {
        const healthScore = get().calculateHealthScore()
        const metrics = get().metrics

        if (healthScore >= 90) {
          return {
            status: 'excellent',
            message: 'Performance is excellent! Consider implementing advanced caching for even better results.',
            actions: ['Enable response caching', 'Implement predictive loading']
          }
        } else if (healthScore >= 75) {
          return {
            status: 'good',
            message: 'Performance is good with room for optimization.',
            actions: ['Optimize response times', 'Monitor trends closely']
          }
        } else if (healthScore >= 50) {
          return {
            status: 'needs_improvement',
            message: 'Performance needs improvement to ensure good user experience.',
            actions: ['Investigate slow responses', 'Implement error recovery', 'Optimize memory usage']
          }
        } else {
          return {
            status: 'critical',
            message: 'Performance is critical and requires immediate attention.',
            actions: ['Emergency performance review', 'Check system resources', 'Implement immediate fixes']
          }
        }
      },

      // Clear performance data
      clearPerformanceData: () => {
        set({
          responseTimeHistory: [],
          performanceTrend: [],
          alerts: [],
          metrics: {
            lastResponseTime: null,
            averageResponseTime: null,
            totalMessages: 0,
            totalErrors: 0,
            uptime: null,
            memoryUsage: null,
            cpuUsage: null,
            cacheHitRate: null,
            activeConnections: 0
          }
        })
      },

      // Record error for tracking
      recordError: (error, context = {}) => {
        const metrics = get().metrics
        get().updateMetrics({
          totalErrors: metrics.totalErrors + 1
        })
        
        // Add error to alerts if severe
        if (context.severity === 'high') {
          const alerts = get().alerts
          const errorAlert = {
            id: `error_${Date.now()}`,
            type: 'error',
            title: 'Application Error',
            message: error.message || 'An unexpected error occurred',
            timestamp: new Date().toISOString(),
            severity: 'high',
            context
          }
          
          set({ alerts: [...alerts, errorAlert].slice(-10) })
        }
      },

      // Export performance data
      exportPerformanceData: () => {
        const data = {
          metrics: get().metrics,
          responseTimeHistory: get().responseTimeHistory,
          alerts: get().alerts,
          report: get().generatePerformanceReport(),
          exportedAt: new Date().toISOString()
        }
        
        return JSON.stringify(data, null, 2)
      }
    }),
    {
      name: 'aether-ai-performance',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        metrics: state.metrics,
        responseTimeHistory: state.responseTimeHistory.slice(-20), // Only persist recent history
        alertThresholds: state.alertThresholds,
        monitoringEnabled: state.monitoringEnabled
      }),
      version: 1
    }
  )
)

export { usePerformanceStore }