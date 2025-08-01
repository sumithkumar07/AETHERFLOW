import { EventBus } from './EventBus'
import { ConfigManager } from './ConfigManager'

/**
 * Performance Monitor
 * Tracks API performance, user interactions, and system metrics
 */
class PerformanceMonitor {
  static instance = null

  constructor() {
    this.eventBus = EventBus.getInstance()
    this.config = ConfigManager.get('monitoring')
    this.enabled = this.config.enabled
    
    this.metrics = {
      api: new Map(), // endpoint -> metrics
      pages: new Map(), // page -> metrics
      interactions: new Map(), // interaction -> metrics
      errors: new Map(), // error type -> metrics
      system: {
        memory: [],
        timing: [],
        network: []
      }
    }

    this.currentRequests = new Map() // requestId -> start time
    this.pageLoadStart = Date.now()
    
    if (this.enabled) {
      this.initializePerformanceTracking()
    }
  }

  static getInstance() {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  /**
   * Initialize performance tracking
   */
  initializePerformanceTracking() {
    // Track page performance
    this.trackPagePerformance()
    
    // Track system metrics periodically
    this.startSystemMetricsCollection()
    
    // Listen to events
    this.setupEventListeners()
    
    // Track navigation timing
    this.trackNavigationTiming()
  }

  /**
   * Track API request start
   */
  trackRequestStart(endpoint, requestId) {
    if (!this.enabled) return

    this.currentRequests.set(requestId, {
      endpoint,
      startTime: Date.now(),
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Track successful API request
   */
  trackRequestSuccess(endpoint, duration, status) {
    if (!this.enabled) return

    this.updateAPIMetrics(endpoint, {
      duration,
      status,
      success: true,
      timestamp: Date.now()
    })

    // Emit performance event
    this.eventBus.emit('performance.api.success', {
      endpoint,
      duration,
      status
    })
  }

  /**
   * Track failed API request
   */
  trackRequestError(endpoint, duration, status, error) {
    if (!this.enabled) return

    this.updateAPIMetrics(endpoint, {
      duration,
      status,
      success: false,
      error,
      timestamp: Date.now()
    })

    // Track error metrics
    this.updateErrorMetrics(error, { endpoint, status })

    // Emit performance event
    this.eventBus.emit('performance.api.error', {
      endpoint,
      duration,
      status,
      error
    })
  }

  /**
   * Track cache hit
   */
  trackCacheHit(endpoint) {
    if (!this.enabled) return

    const metrics = this.metrics.api.get(endpoint) || this.createAPIMetrics()
    metrics.cacheHits++
    metrics.lastCacheHit = Date.now()
    this.metrics.api.set(endpoint, metrics)
  }

  /**
   * Track cache miss
   */
  trackCacheMiss(endpoint) {
    if (!this.enabled) return

    const metrics = this.metrics.api.get(endpoint) || this.createAPIMetrics()
    metrics.cacheMisses++
    this.metrics.api.set(endpoint, metrics)
  }

  /**
   * Track page performance
   */
  trackPageLoad(pageName, loadTime) {
    if (!this.enabled) return

    this.updatePageMetrics(pageName, {
      loadTime,
      timestamp: Date.now()
    })

    this.eventBus.emit('performance.page.loaded', {
      page: pageName,
      loadTime
    })
  }

  /**
   * Track user interactions
   */
  trackInteraction(type, details = {}) {
    if (!this.enabled) return

    const interactionKey = `${type}:${details.component || 'unknown'}`
    const metrics = this.metrics.interactions.get(interactionKey) || {
      count: 0,
      totalTime: 0,
      averageTime: 0,
      firstSeen: Date.now(),
      lastSeen: null
    }

    metrics.count++
    metrics.lastSeen = Date.now()
    
    if (details.duration) {
      metrics.totalTime += details.duration
      metrics.averageTime = metrics.totalTime / metrics.count
    }

    this.metrics.interactions.set(interactionKey, metrics)

    // Sample interactions to avoid overwhelming
    if (Math.random() < this.config.sampleRate) {
      this.eventBus.emit('performance.interaction', {
        type,
        details,
        metrics
      })
    }
  }

  /**
   * Track custom metric
   */
  trackCustomMetric(name, value, metadata = {}) {
    if (!this.enabled) return

    this.eventBus.emit('performance.custom', {
      name,
      value,
      metadata,
      timestamp: Date.now()
    })
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    return {
      api: this.getAPIPerformanceSummary(),
      pages: this.getPagePerformanceSummary(),
      interactions: this.getInteractionsSummary(),
      errors: this.getErrorsSummary(),
      system: this.getSystemMetrics(),
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Get API performance metrics
   */
  getAPIPerformanceSummary() {
    const summary = {
      totalRequests: 0,
      averageResponseTime: 0,
      errorRate: 0,
      cacheHitRate: 0,
      endpoints: {}
    }

    let totalDuration = 0
    let totalErrors = 0
    let totalCacheHits = 0
    let totalCacheMisses = 0

    this.metrics.api.forEach((metrics, endpoint) => {
      summary.totalRequests += metrics.count
      totalDuration += metrics.totalDuration
      totalErrors += metrics.errorCount
      totalCacheHits += metrics.cacheHits
      totalCacheMisses += metrics.cacheMisses

      summary.endpoints[endpoint] = {
        count: metrics.count,
        averageResponseTime: metrics.averageResponseTime,
        errorRate: metrics.count > 0 ? (metrics.errorCount / metrics.count) * 100 : 0,
        cacheHitRate: this.calculateCacheHitRate(metrics.cacheHits, metrics.cacheMisses),
        p95ResponseTime: metrics.p95ResponseTime,
        p99ResponseTime: metrics.p99ResponseTime
      }
    })

    if (summary.totalRequests > 0) {
      summary.averageResponseTime = totalDuration / summary.totalRequests
      summary.errorRate = (totalErrors / summary.totalRequests) * 100
    }

    const totalCacheRequests = totalCacheHits + totalCacheMisses
    if (totalCacheRequests > 0) {
      summary.cacheHitRate = (totalCacheHits / totalCacheRequests) * 100
    }

    return summary
  }

  /**
   * Get page performance summary
   */
  getPagePerformanceSummary() {
    const summary = {
      totalPageLoads: 0,
      averageLoadTime: 0,
      pages: {}
    }

    let totalLoadTime = 0

    this.metrics.pages.forEach((metrics, page) => {
      summary.totalPageLoads += metrics.count
      totalLoadTime += metrics.totalLoadTime

      summary.pages[page] = {
        count: metrics.count,
        averageLoadTime: metrics.averageLoadTime,
        p95LoadTime: metrics.p95LoadTime
      }
    })

    if (summary.totalPageLoads > 0) {
      summary.averageLoadTime = totalLoadTime / summary.totalPageLoads
    }

    return summary
  }

  /**
   * Get interactions summary
   */
  getInteractionsSummary() {
    const summary = {
      totalInteractions: 0,
      interactions: {}
    }

    this.metrics.interactions.forEach((metrics, interaction) => {
      summary.totalInteractions += metrics.count
      summary.interactions[interaction] = {
        count: metrics.count,
        averageTime: metrics.averageTime,
        frequency: this.calculateInteractionFrequency(metrics)
      }
    })

    return summary
  }

  /**
   * Get errors summary
   */
  getErrorsSummary() {
    const summary = {
      totalErrors: 0,
      errorTypes: {}
    }

    this.metrics.errors.forEach((metrics, errorType) => {
      summary.totalErrors += metrics.count
      summary.errorTypes[errorType] = {
        count: metrics.count,
        rate: metrics.rate,
        lastOccurrence: new Date(metrics.lastOccurrence).toISOString()
      }
    })

    return summary
  }

  /**
   * Get system metrics
   */
  getSystemMetrics() {
    const memory = this.getCurrentMemoryUsage()
    const timing = this.getNavigationTiming()
    const connection = this.getConnectionInfo()

    return {
      memory,
      timing,
      connection,
      timestamp: Date.now()
    }
  }

  /**
   * Export performance data
   */
  exportData(format = 'json') {
    const data = {
      summary: this.getPerformanceSummary(),
      rawMetrics: {
        api: Object.fromEntries(this.metrics.api),
        pages: Object.fromEntries(this.metrics.pages),
        interactions: Object.fromEntries(this.metrics.interactions),
        errors: Object.fromEntries(this.metrics.errors)
      },
      metadata: {
        exportedAt: new Date().toISOString(),
        sessionId: this.getSessionId(),
        userAgent: navigator.userAgent,
        format
      }
    }

    if (format === 'csv') {
      return this.convertToCSV(data)
    }
    
    return JSON.stringify(data, null, 2)
  }

  // Private helper methods
  updateAPIMetrics(endpoint, data) {
    const metrics = this.metrics.api.get(endpoint) || this.createAPIMetrics()
    
    metrics.count++
    metrics.totalDuration += data.duration
    metrics.averageResponseTime = metrics.totalDuration / metrics.count
    
    if (data.success) {
      metrics.successCount++
    } else {
      metrics.errorCount++
    }
    
    // Update percentiles
    metrics.responseTimes.push(data.duration)
    if (metrics.responseTimes.length > 1000) {
      metrics.responseTimes.shift() // Keep last 1000 measurements
    }
    
    metrics.p95ResponseTime = this.calculatePercentile(metrics.responseTimes, 95)
    metrics.p99ResponseTime = this.calculatePercentile(metrics.responseTimes, 99)
    
    metrics.lastRequest = Date.now()
    
    this.metrics.api.set(endpoint, metrics)
  }

  updatePageMetrics(page, data) {
    const metrics = this.metrics.pages.get(page) || {
      count: 0,
      totalLoadTime: 0,
      averageLoadTime: 0,
      loadTimes: [],
      p95LoadTime: 0,
      firstLoad: Date.now(),
      lastLoad: null
    }
    
    metrics.count++
    metrics.totalLoadTime += data.loadTime
    metrics.averageLoadTime = metrics.totalLoadTime / metrics.count
    metrics.lastLoad = Date.now()
    
    metrics.loadTimes.push(data.loadTime)
    if (metrics.loadTimes.length > 100) {
      metrics.loadTimes.shift()
    }
    
    metrics.p95LoadTime = this.calculatePercentile(metrics.loadTimes, 95)
    
    this.metrics.pages.set(page, metrics)
  }

  updateErrorMetrics(error, context) {
    const errorType = this.categorizeError(error, context)
    const metrics = this.metrics.errors.get(errorType) || {
      count: 0,
      rate: 0,
      contexts: [],
      firstOccurrence: Date.now(),
      lastOccurrence: null
    }
    
    metrics.count++
    metrics.lastOccurrence = Date.now()
    metrics.contexts.push({
      ...context,
      timestamp: Date.now()
    })
    
    // Keep only last 10 contexts
    if (metrics.contexts.length > 10) {
      metrics.contexts.shift()
    }
    
    // Calculate error rate (errors per minute)
    const timeWindow = 60000 // 1 minute
    const recentErrors = metrics.contexts.filter(
      ctx => Date.now() - ctx.timestamp < timeWindow
    ).length
    metrics.rate = recentErrors
    
    this.metrics.errors.set(errorType, metrics)
  }

  createAPIMetrics() {
    return {
      count: 0,
      successCount: 0,
      errorCount: 0,
      totalDuration: 0,
      averageResponseTime: 0,
      responseTimes: [],
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      lastRequest: null,
      lastCacheHit: null
    }
  }

  calculatePercentile(values, percentile) {
    if (values.length === 0) return 0
    
    const sorted = [...values].sort((a, b) => a - b)
    const index = Math.ceil((percentile / 100) * sorted.length) - 1
    return sorted[Math.max(0, index)]
  }

  calculateCacheHitRate(hits, misses) {
    const total = hits + misses
    return total > 0 ? (hits / total) * 100 : 0
  }

  calculateInteractionFrequency(metrics) {
    const timeSpan = metrics.lastSeen - metrics.firstSeen
    return timeSpan > 0 ? metrics.count / (timeSpan / 60000) : 0 // per minute
  }

  categorizeError(error, context) {
    if (context.status >= 400 && context.status < 500) {
      return 'client_error'
    } else if (context.status >= 500) {
      return 'server_error'
    } else if (error.includes('network') || error.includes('connection')) {
      return 'network_error'
    } else if (error.includes('timeout')) {
      return 'timeout_error'
    } else {
      return 'unknown_error'
    }
  }

  trackPagePerformance() {
    // Track initial page load
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0]
      if (navigation) {
        this.trackPageLoad('initial', navigation.loadEventEnd - navigation.loadEventStart)
      }
    }
  }

  trackNavigationTiming() {
    if (typeof window !== 'undefined' && window.performance && window.performance.timing) {
      const timing = window.performance.timing
      const metrics = {
        dns: timing.domainLookupEnd - timing.domainLookupStart,
        connection: timing.connectEnd - timing.connectStart,
        request: timing.responseStart - timing.requestStart,
        response: timing.responseEnd - timing.responseStart,
        dom: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
        load: timing.loadEventEnd - timing.loadEventStart
      }
      
      this.metrics.system.timing.push({
        ...metrics,
        timestamp: Date.now()
      })
    }
  }

  startSystemMetricsCollection() {
    // Collect system metrics every 30 seconds
    setInterval(() => {
      this.collectSystemMetrics()
    }, 30000)
  }

  collectSystemMetrics() {
    const memory = this.getCurrentMemoryUsage()
    if (memory) {
      this.metrics.system.memory.push({
        ...memory,
        timestamp: Date.now()
      })
      
      // Keep only last 100 measurements
      if (this.metrics.system.memory.length > 100) {
        this.metrics.system.memory.shift()
      }
    }
  }

  getCurrentMemoryUsage() {
    if (typeof window !== 'undefined' && window.performance && window.performance.memory) {
      return {
        used: window.performance.memory.usedJSHeapSize,
        total: window.performance.memory.totalJSHeapSize,
        limit: window.performance.memory.jsHeapSizeLimit
      }
    }
    return null
  }

  getNavigationTiming() {
    if (typeof window !== 'undefined' && window.performance) {
      const timing = window.performance.timing
      if (timing) {
        return {
          navigationStart: timing.navigationStart,
          loadComplete: timing.loadEventEnd,
          totalLoadTime: timing.loadEventEnd - timing.navigationStart
        }
      }
    }
    return null
  }

  getConnectionInfo() {
    if (typeof navigator !== 'undefined' && navigator.connection) {
      return {
        type: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
      }
    }
    return null
  }

  setupEventListeners() {
    // Listen to unhandled errors
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.updateErrorMetrics(event.message, {
          source: event.filename,
          line: event.lineno,
          column: event.colno
        })
      })

      // Listen to unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.updateErrorMetrics(event.reason.toString(), {
          type: 'unhandled_promise_rejection'
        })
      })
    }
  }

  getSessionId() {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('perf-session-id')
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionStorage.setItem('perf-session-id', sessionId)
      }
      return sessionId
    }
    return 'unknown'
  }

  convertToCSV(data) {
    // Simple CSV conversion for API metrics
    const headers = ['Endpoint', 'Count', 'Avg Response Time', 'Error Rate', 'Cache Hit Rate']
    const rows = [headers.join(',')]
    
    Object.entries(data.summary.api.endpoints).forEach(([endpoint, metrics]) => {
      rows.push([
        endpoint,
        metrics.count,
        Math.round(metrics.averageResponseTime),
        Math.round(metrics.errorRate * 100) / 100,
        Math.round(metrics.cacheHitRate * 100) / 100
      ].join(','))
    })
    
    return rows.join('\n')
  }
}

export { PerformanceMonitor }