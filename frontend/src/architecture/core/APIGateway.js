import axios from 'axios'
import { CacheManager } from './CacheManager'
import { RetryManager } from './RetryManager'
import { PerformanceMonitor } from './PerformanceMonitor'
import { ConfigManager } from './ConfigManager'
import { EventBus } from './EventBus'

/**
 * Enterprise API Gateway
 * Centralizes all API communication with caching, retry logic, monitoring, and error handling
 */
class APIGateway {
  static instance = null

  constructor() {
    this.cache = CacheManager.getInstance()
    this.retry = RetryManager.getInstance()
    this.monitor = PerformanceMonitor.getInstance()
    this.eventBus = EventBus.getInstance()
    this.config = ConfigManager.get('api')
    
    this.setupAxiosInterceptors()
  }

  static getInstance() {
    if (!APIGateway.instance) {
      APIGateway.instance = new APIGateway()
    }
    return APIGateway.instance
  }

  setupAxiosInterceptors() {
    // Request interceptor
    axios.interceptors.request.use(
      (config) => {
        const requestId = this.generateRequestId()
        config.metadata = { 
          requestId, 
          startTime: Date.now(),
          endpoint: config.url 
        }
        
        // Add monitoring
        this.monitor.trackRequestStart(config.url, requestId)
        
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor
    axios.interceptors.response.use(
      (response) => {
        const duration = Date.now() - response.config.metadata.startTime
        
        // Track successful request
        this.monitor.trackRequestSuccess(
          response.config.metadata.endpoint,
          duration,
          response.status
        )

        return response
      },
      (error) => {
        const duration = error.config?.metadata ? 
          Date.now() - error.config.metadata.startTime : 0
        
        // Track failed request
        this.monitor.trackRequestError(
          error.config?.metadata?.endpoint || 'unknown',
          duration,
          error.response?.status || 0,
          error.message
        )

        return Promise.reject(error)
      }
    )
  }

  /**
   * Enhanced request method with caching, retry, and monitoring
   */
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      data = null,
      params = {},
      cache = false,
      cacheTTL = 300000, // 5 minutes default
      cacheStrategy = 'default',
      retryAttempts = null,
      timeout = null,
      skipAuth = false,
      ...restOptions
    } = options

    // Generate cache key for GET requests
    const cacheKey = cache ? this.generateCacheKey(endpoint, method, params, data) : null
    
    // Try cache first for GET requests
    if (cache && method === 'GET' && cacheKey) {
      const cached = await this.cache.get(cacheKey)
      if (cached) {
        this.monitor.trackCacheHit(endpoint)
        this.eventBus.emit('api.cache.hit', { endpoint, cacheKey })
        return cached
      }
      this.monitor.trackCacheMiss(endpoint)
    }

    // Prepare request config
    const requestConfig = {
      url: endpoint,
      method,
      data,
      params,
      timeout: timeout || this.config.timeout,
      ...restOptions
    }

    // Add authentication if not skipped
    if (!skipAuth) {
      const token = this.getAuthToken()
      if (token) {
        requestConfig.headers = {
          ...requestConfig.headers,
          Authorization: `Bearer ${token}`
        }
      }
    }

    try {
      // Execute request with retry logic
      const response = await this.retry.execute(
        () => axios.request(requestConfig),
        retryAttempts || this.config.retryAttempts
      )

      // Cache successful GET responses
      if (cache && method === 'GET' && cacheKey && response.data) {
        await this.cache.set(cacheKey, response.data, cacheTTL, cacheStrategy)
        this.eventBus.emit('api.cache.set', { endpoint, cacheKey, data: response.data })
      }

      // Emit success event
      this.eventBus.emit('api.request.success', {
        endpoint,
        method,
        status: response.status,
        cached: false
      })

      return response.data

    } catch (error) {
      // Enhanced error handling
      const enhancedError = this.enhanceError(error, endpoint, method)
      
      // Emit error event
      this.eventBus.emit('api.request.error', {
        endpoint,
        method,
        error: enhancedError,
        status: error.response?.status
      })

      throw enhancedError
    }
  }

  /**
   * Convenience methods for different HTTP verbs
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' })
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', data })
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', data })
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: 'PATCH', data })
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' })
  }

  /**
   * Batch requests with intelligent batching
   */
  async batch(requests, options = {}) {
    const {
      maxConcurrent = 5,
      failFast = false
    } = options

    const chunks = this.chunkArray(requests, maxConcurrent)
    const results = []

    for (const chunk of chunks) {
      try {
        const chunkResults = await Promise.all(
          chunk.map(req => this.request(req.endpoint, req.options))
        )
        results.push(...chunkResults)
      } catch (error) {
        if (failFast) {
          throw error
        }
        results.push({ error: error.message })
      }
    }

    return results
  }

  /**
   * Cache invalidation methods
   */
  async invalidateCache(pattern) {
    await this.cache.invalidatePattern(pattern)
    this.eventBus.emit('api.cache.invalidated', { pattern })
  }

  async invalidateEndpoint(endpoint) {
    const pattern = this.generateCacheKeyPattern(endpoint)
    await this.invalidateCache(pattern)
  }

  /**
   * Health check method
   */
  async healthCheck() {
    try {
      const response = await this.request('/api/health', {
        timeout: 5000,
        retryAttempts: 1,
        skipAuth: true
      })
      return { healthy: true, data: response }
    } catch (error) {
      return { healthy: false, error: error.message }
    }
  }

  // Private helper methods
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  generateCacheKey(endpoint, method, params, data) {
    const key = `api:${method}:${endpoint}`
    const paramString = Object.keys(params).length > 0 ? 
      `:params:${JSON.stringify(params)}` : ''
    const dataString = data ? `:data:${JSON.stringify(data)}` : ''
    
    return `${key}${paramString}${dataString}`
  }

  generateCacheKeyPattern(endpoint) {
    return `api:*:${endpoint}*`
  }

  getAuthToken() {
    // Integration with existing auth store
    if (typeof window !== 'undefined' && window.localStorage) {
      const authData = localStorage.getItem('ai-tempo-auth')
      if (authData) {
        try {
          const parsed = JSON.parse(authData)
          return parsed.state?.token
        } catch (e) {
          return null
        }
      }
    }
    return null
  }

  enhanceError(error, endpoint, method) {
    const enhancedError = new Error(error.message)
    enhancedError.name = 'APIGatewayError'
    enhancedError.originalError = error
    enhancedError.endpoint = endpoint
    enhancedError.method = method
    enhancedError.status = error.response?.status
    enhancedError.statusText = error.response?.statusText
    enhancedError.timestamp = new Date().toISOString()
    enhancedError.requestId = error.config?.metadata?.requestId

    // Add contextual information
    if (error.response?.status === 401) {
      enhancedError.type = 'AUTHENTICATION_REQUIRED'
      enhancedError.message = 'Authentication required. Please log in again.'
    } else if (error.response?.status === 403) {
      enhancedError.type = 'PERMISSION_DENIED'
      enhancedError.message = 'Permission denied. You don\'t have access to this resource.'
    } else if (error.response?.status >= 500) {
      enhancedError.type = 'SERVER_ERROR'
      enhancedError.message = 'Server error. Please try again later.'
    } else if (error.code === 'NETWORK_ERROR') {
      enhancedError.type = 'NETWORK_ERROR'
      enhancedError.message = 'Network error. Please check your connection.'
    }

    return enhancedError
  }

  chunkArray(array, size) {
    const chunks = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }
}

export { APIGateway }