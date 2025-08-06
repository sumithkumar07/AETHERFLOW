/**
 * Comprehensive API Service - 2025 Edition
 * Enhanced API service with performance optimization, error handling, and accessibility features
 */

import axios from 'axios'

class ComprehensiveAPIService {
  constructor() {
    this.baseURL = import.meta.env.VITE_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'
    this.apiClient = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 seconds timeout
      headers: {
        'Content-Type': 'application/json',
      }
    })

    this.setupInterceptors()
    this.requestCache = new Map()
    this.performanceMetrics = {
      totalRequests: 0,
      successfulRequests: 0,
      averageResponseTime: 0,
      errorRate: 0
    }
  }

  setupInterceptors() {
    // Request interceptor
    this.apiClient.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('authToken')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        
        // Add request timestamp for performance tracking
        config.metadata = { startTime: new Date() }
        this.performanceMetrics.totalRequests++
        
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.apiClient.interceptors.response.use(
      (response) => {
        // Calculate response time
        const endTime = new Date()
        const startTime = response.config.metadata.startTime
        const duration = endTime - startTime
        
        // Update performance metrics
        this.performanceMetrics.successfulRequests++
        this.updateAverageResponseTime(duration)
        
        // Add performance data to response
        response.performanceData = {
          responseTime: duration,
          timestamp: endTime.toISOString()
        }
        
        return response
      },
      (error) => {
        // Update error rate
        this.updateErrorRate()
        
        // Enhanced error handling
        if (error.response) {
          // Server responded with error status
          const errorData = {
            status: error.response.status,
            message: error.response.data?.detail || error.response.data?.message || 'Server error',
            timestamp: new Date().toISOString()
          }
          
          // Handle specific error codes
          switch (error.response.status) {
            case 401:
              // Unauthorized - clear auth token and redirect to login
              localStorage.removeItem('authToken')
              window.dispatchEvent(new CustomEvent('auth-error'))
              break
            case 429:
              // Rate limited
              errorData.retryAfter = error.response.headers['retry-after']
              break
            case 503:
              // Service unavailable
              errorData.retryable = true
              break
          }
          
          error.enhancedData = errorData
        } else if (error.request) {
          // Network error
          error.enhancedData = {
            type: 'network',
            message: 'Network error - please check your connection',
            timestamp: new Date().toISOString(),
            retryable: true
          }
        }
        
        return Promise.reject(error)
      }
    )
  }

  updateAverageResponseTime(newTime) {
    const { successfulRequests, averageResponseTime } = this.performanceMetrics
    this.performanceMetrics.averageResponseTime = 
      (averageResponseTime * (successfulRequests - 1) + newTime) / successfulRequests
  }

  updateErrorRate() {
    const { totalRequests, successfulRequests } = this.performanceMetrics
    const errors = totalRequests - successfulRequests
    this.performanceMetrics.errorRate = (errors / totalRequests) * 100
  }

  // Enhanced AI Chat Methods
  async enhancedChat(message, options = {}) {
    const startTime = performance.now()
    
    try {
      const requestData = {
        message,
        session_id: options.sessionId,
        user_id: options.userId || 'anonymous',
        agent_preference: options.agentPreference,
        intelligence_level: options.intelligenceLevel || 'enhanced',
        include_suggestions: options.includeSuggestions !== false,
        include_collaboration: options.includeCollaboration !== false
      }

      const response = await this.apiClient.post('/api/ai/comprehensive/chat/enhanced', requestData)
      
      const endTime = performance.now()
      const responseTime = endTime - startTime
      
      // Enhance response with performance data
      return {
        ...response.data,
        performance: {
          responseTime: responseTime,
          networkTime: response.performanceData?.responseTime || 0,
          processingTime: responseTime - (response.performanceData?.responseTime || 0)
        }
      }
    } catch (error) {
      console.error('Enhanced chat error:', error)
      throw this.enhanceError(error)
    }
  }

  async quickChat(message, options = {}) {
    const startTime = performance.now()
    
    try {
      const requestData = {
        message,
        user_id: options.userId || 'anonymous'
      }

      const response = await this.apiClient.post('/api/ai/comprehensive/chat/quick', requestData)
      
      const endTime = performance.now()
      const responseTime = endTime - startTime
      
      return {
        ...response.data,
        performance: {
          responseTime: responseTime,
          networkTime: response.performanceData?.responseTime || 0,
          targetAchieved: responseTime < 2000 // 2 second target
        }
      }
    } catch (error) {
      console.error('Quick chat error:', error)
      throw this.enhanceError(error)
    }
  }

  async getEnhancedAgents() {
    const cacheKey = 'enhanced-agents'
    
    // Check cache first
    if (this.isRequestCached(cacheKey, 600000)) { // 10 minutes cache
      return this.requestCache.get(cacheKey).data
    }
    
    try {
      const response = await this.apiClient.get('/api/ai/comprehensive/agents/enhanced')
      
      // Cache the response
      this.requestCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      })
      
      return response.data
    } catch (error) {
      console.error('Get enhanced agents error:', error)
      throw this.enhanceError(error)
    }
  }

  // Caching mechanism for GET requests
  getCacheKey(url, params) {
    return `${url}?${new URLSearchParams(params).toString()}`
  }

  isRequestCached(key, maxAge = 300000) { // 5 minutes default
    const cached = this.requestCache.get(key)
    if (!cached) return false
    
    const age = Date.now() - cached.timestamp
    return age < maxAge
  }

  // Enhanced error handling
  enhanceError(error) {
    const enhanced = {
      ...error,
      timestamp: new Date().toISOString(),
      userMessage: this.getUserFriendlyMessage(error),
      retryable: this.isRetryable(error),
      suggestions: this.getErrorSuggestions(error)
    }
    
    return enhanced
  }

  getUserFriendlyMessage(error) {
    if (error.enhancedData?.message) {
      return error.enhancedData.message
    }
    
    if (error.response?.status) {
      switch (error.response.status) {
        case 400:
          return 'Invalid request. Please check your input and try again.'
        case 401:
          return 'Authentication required. Please sign in.'
        case 403:
          return 'Access denied. You may not have permission for this action.'
        case 404:
          return 'The requested resource was not found.'
        case 429:
          return 'Too many requests. Please wait a moment before trying again.'
        case 500:
          return 'Server error. Our team has been notified.'
        case 503:
          return 'Service temporarily unavailable. Please try again shortly.'
        default:
          return 'Something went wrong. Please try again.'
      }
    }
    
    if (error.code === 'NETWORK_ERROR') {
      return 'Network connection error. Please check your internet connection.'
    }
    
    return 'An unexpected error occurred. Please try again.'
  }

  isRetryable(error) {
    if (error.enhancedData?.retryable) {
      return true
    }
    
    // Retry on network errors and server errors (5xx)
    return !error.response || error.response.status >= 500
  }

  getErrorSuggestions(error) {
    const suggestions = []
    
    if (error.code === 'NETWORK_ERROR') {
      suggestions.push('Check your internet connection')
      suggestions.push('Try refreshing the page')
    } else if (error.response?.status === 401) {
      suggestions.push('Sign in to your account')
      suggestions.push('Check if your session has expired')
    } else if (error.response?.status === 429) {
      suggestions.push('Wait a few seconds before trying again')
      suggestions.push('Reduce the frequency of your requests')
    } else if (error.response?.status >= 500) {
      suggestions.push('Try again in a few minutes')
      suggestions.push('Contact support if the problem persists')
    }
    
    return suggestions
  }

  // Cache management
  clearCache() {
    this.requestCache.clear()
  }

  // Performance optimization
  enablePerformanceOptimizations() {
    // Setup periodic cache cleanup
    setInterval(() => {
      this.cleanupExpiredCache()
    }, 300000) // 5 minutes
  }

  cleanupExpiredCache(maxAge = 300000) { // 5 minutes
    const now = Date.now()
    
    for (const [key, cached] of this.requestCache.entries()) {
      if (now - cached.timestamp > maxAge) {
        this.requestCache.delete(key)
      }
    }
  }
}

// Create and export singleton instance
const comprehensiveAPI = new ComprehensiveAPIService()

// Enable performance optimizations
comprehensiveAPI.enablePerformanceOptimizations()

export default comprehensiveAPI

// Export specific methods for convenience
export const {
  enhancedChat,
  quickChat,
  getEnhancedAgents
} = comprehensiveAPI