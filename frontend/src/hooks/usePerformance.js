import { useState, useEffect, useRef, useCallback } from 'react'

// Performance monitoring hook
export const usePerformance = (componentName = 'Component') => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    mountTime: 0,
    updateCount: 0,
    errorCount: 0
  })
  
  const mountTime = useRef(performance.now())
  const renderStart = useRef(performance.now())
  const updateCount = useRef(0)
  const errorCount = useRef(0)

  useEffect(() => {
    // Component mounted
    const mountEnd = performance.now()
    const totalMountTime = mountEnd - mountTime.current
    
    setMetrics(prev => ({
      ...prev,
      mountTime: totalMountTime
    }))

    // Performance observer for long tasks
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.duration > 50) { // Long task > 50ms
            console.warn(`Long task detected in ${componentName}:`, entry.duration)
          }
        })
      })
      
      try {
        observer.observe({ entryTypes: ['longtask'] })
      } catch (e) {
        // Longtask not supported
      }

      return () => observer.disconnect()
    }
  }, [componentName])

  useEffect(() => {
    // Track renders
    const renderEnd = performance.now()
    const renderTime = renderEnd - renderStart.current
    updateCount.current += 1
    
    setMetrics(prev => ({
      ...prev,
      renderTime,
      updateCount: updateCount.current
    }))
    
    renderStart.current = performance.now()
  })

  const logError = useCallback((error) => {
    errorCount.current += 1
    setMetrics(prev => ({
      ...prev,
      errorCount: errorCount.current
    }))
    
    // Send to monitoring service
    console.error(`Error in ${componentName}:`, error)
  }, [componentName])

  const measureOperation = useCallback((operationName, fn) => {
    const start = performance.now()
    const result = fn()
    const end = performance.now()
    
    console.log(`${componentName} - ${operationName}: ${end - start}ms`)
    return result
  }, [componentName])

  return {
    metrics,
    logError,
    measureOperation
  }
}

// API performance monitoring hook
export const useApiPerformance = () => {
  const [apiMetrics, setApiMetrics] = useState({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    slowRequests: 0
  })

  const requestTimes = useRef([])

  const trackRequest = useCallback(async (requestPromise, endpoint = 'unknown') => {
    const startTime = performance.now()
    
    try {
      const result = await requestPromise
      const endTime = performance.now()
      const responseTime = endTime - startTime
      
      // Update metrics
      requestTimes.current.push(responseTime)
      
      // Keep only last 100 requests
      if (requestTimes.current.length > 100) {
        requestTimes.current = requestTimes.current.slice(-100)
      }
      
      const averageResponseTime = requestTimes.current.reduce((a, b) => a + b, 0) / requestTimes.current.length
      const slowRequests = requestTimes.current.filter(time => time > 1000).length
      
      setApiMetrics(prev => ({
        totalRequests: prev.totalRequests + 1,
        successfulRequests: prev.successfulRequests + 1,
        failedRequests: prev.failedRequests,
        averageResponseTime,
        slowRequests
      }))

      // Log slow requests
      if (responseTime > 1000) {
        console.warn(`Slow API request to ${endpoint}: ${responseTime}ms`)
      }

      return result
    } catch (error) {
      const endTime = performance.now()
      const responseTime = endTime - startTime
      
      setApiMetrics(prev => ({
        totalRequests: prev.totalRequests + 1,
        successfulRequests: prev.successfulRequests,
        failedRequests: prev.failedRequests + 1,
        averageResponseTime: prev.averageResponseTime,
        slowRequests: prev.slowRequests
      }))

      console.error(`API request failed for ${endpoint} (${responseTime}ms):`, error)
      throw error
    }
  }, [])

  return {
    apiMetrics,
    trackRequest
  }
}

// Memory usage monitoring hook
export const useMemoryMonitoring = () => {
  const [memoryInfo, setMemoryInfo] = useState({
    usedJSHeapSize: 0,
    totalJSHeapSize: 0,
    jsHeapSizeLimit: 0,
    memoryUsagePercent: 0
  })

  useEffect(() => {
    const updateMemoryInfo = () => {
      if (performance.memory) {
        const memory = performance.memory
        const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
        
        setMemoryInfo({
          usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1048576), // MB
          totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1048576), // MB
          jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
          memoryUsagePercent: Math.round(usagePercent)
        })

        // Warn about high memory usage
        if (usagePercent > 80) {
          console.warn(`High memory usage detected: ${usagePercent.toFixed(1)}%`)
        }
      }
    }

    // Update immediately
    updateMemoryInfo()

    // Update every 30 seconds
    const interval = setInterval(updateMemoryInfo, 30000)

    return () => clearInterval(interval)
  }, [])

  return memoryInfo
}

// Bundle size monitoring
export const useBundleAnalytics = () => {
  const [bundleMetrics, setBundleMetrics] = useState({
    loadedChunks: [],
    totalBundleSize: 0,
    cachedResources: 0,
    networkResources: 0
  })

  useEffect(() => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        
        const resources = entries.filter(entry => 
          entry.entryType === 'resource' && 
          (entry.name.includes('.js') || entry.name.includes('.css'))
        )

        const totalSize = resources.reduce((total, resource) => {
          return total + (resource.transferSize || 0)
        }, 0)

        const cachedCount = resources.filter(r => r.transferSize === 0).length
        const networkCount = resources.filter(r => r.transferSize > 0).length

        setBundleMetrics({
          loadedChunks: resources.map(r => ({
            name: r.name.split('/').pop(),
            size: Math.round((r.transferSize || 0) / 1024), // KB
            cached: r.transferSize === 0,
            loadTime: r.responseEnd - r.responseStart
          })),
          totalBundleSize: Math.round(totalSize / 1024), // KB
          cachedResources: cachedCount,
          networkResources: networkCount
        })
      })

      try {
        observer.observe({ entryTypes: ['resource'] })
      } catch (e) {
        console.warn('Resource timing not supported')
      }

      return () => observer.disconnect()
    }
  }, [])

  return bundleMetrics
}

// Performance debugging hook
export const usePerformanceDebugger = (enabled = false) => {
  const [debugInfo, setDebugInfo] = useState({
    slowComponents: [],
    memoryLeaks: [],
    recommendations: []
  })

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const checkPerformance = () => {
      const recommendations = []
      
      // Check for React DevTools
      if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        recommendations.push('React DevTools detected - use Profiler for detailed component analysis')
      }

      // Check for memory usage
      if (performance.memory) {
        const usagePercent = (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
        if (usagePercent > 70) {
          recommendations.push(`High memory usage (${usagePercent.toFixed(1)}%) - check for memory leaks`)
        }
      }

      // Check for large DOM
      const domNodes = document.querySelectorAll('*').length
      if (domNodes > 1500) {
        recommendations.push(`Large DOM detected (${domNodes} nodes) - consider virtualization`)
      }

      setDebugInfo(prev => ({
        ...prev,
        recommendations
      }))
    }

    checkPerformance()
    const interval = setInterval(checkPerformance, 30000)

    return () => clearInterval(interval)
  }, [enabled])

  return debugInfo
}