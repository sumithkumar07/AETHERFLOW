/**
 * Retry Manager
 * Intelligent retry logic with exponential backoff and circuit breaker pattern
 */
class RetryManager {
  static instance = null

  constructor() {
    this.circuitBreakers = new Map() // endpoint -> circuit breaker state
    this.retryStats = new Map() // endpoint -> retry statistics
    this.config = {
      maxRetries: 3,
      baseDelay: 1000, // 1 second
      maxDelay: 30000, // 30 seconds
      backoffMultiplier: 2,
      jitterMax: 100, // Random jitter up to 100ms
      circuitBreakerThreshold: 5, // failures before opening circuit
      circuitBreakerTimeout: 60000, // 1 minute
      retryableStatuses: [408, 429, 500, 502, 503, 504],
      retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', 'CONNECTION_REFUSED']
    }
  }

  static getInstance() {
    if (!RetryManager.instance) {
      RetryManager.instance = new RetryManager()
    }
    return RetryManager.instance
  }

  /**
   * Execute function with retry logic
   * @param {function} fn - Function to execute
   * @param {number} maxRetries - Maximum retry attempts
   * @param {object} options - Additional options
   * @returns {Promise} Result of function execution
   */
  async execute(fn, maxRetries = null, options = {}) {
    const {
      endpoint = 'unknown',
      backoffMultiplier = this.config.backoffMultiplier,
      baseDelay = this.config.baseDelay,
      maxDelay = this.config.maxDelay,
      jitter = true,
      circuitBreaker = true
    } = options

    const retries = maxRetries !== null ? maxRetries : this.config.maxRetries
    
    // Check circuit breaker
    if (circuitBreaker && this.isCircuitOpen(endpoint)) {
      throw new Error(`Circuit breaker open for endpoint: ${endpoint}`)
    }

    let lastError = null
    let attempt = 0

    while (attempt <= retries) {
      try {
        const result = await fn()
        
        // Success - reset circuit breaker
        if (circuitBreaker) {
          this.recordSuccess(endpoint)
        }
        
        // Update retry stats
        this.updateRetryStats(endpoint, attempt, true)
        
        return result

      } catch (error) {
        lastError = error
        attempt++

        // Check if error is retryable
        if (!this.isRetryableError(error) || attempt > retries) {
          // Record failure for circuit breaker
          if (circuitBreaker) {
            this.recordFailure(endpoint)
          }
          
          // Update retry stats
          this.updateRetryStats(endpoint, attempt - 1, false)
          
          throw error
        }

        // Calculate delay with exponential backoff
        const delay = this.calculateDelay(attempt, baseDelay, backoffMultiplier, maxDelay, jitter)
        
        // Log retry attempt
        console.warn(`Retry attempt ${attempt}/${retries} for ${endpoint} after ${delay}ms`, {
          error: error.message,
          status: error.response?.status
        })

        // Wait before retry
        await this.delay(delay)
      }
    }

    // All retries exhausted
    throw lastError
  }

  /**
   * Execute multiple functions with retry logic
   * @param {array} functions - Array of functions to execute
   * @param {object} options - Execution options
   * @returns {Promise<array>} Results array
   */
  async executeAll(functions, options = {}) {
    const {
      failFast = false,
      maxConcurrent = 5
    } = options

    const chunks = this.chunkArray(functions, maxConcurrent)
    const results = []

    for (const chunk of chunks) {
      try {
        const chunkPromises = chunk.map(({ fn, retries, options: fnOptions }) =>
          this.execute(fn, retries, fnOptions)
        )

        if (failFast) {
          const chunkResults = await Promise.all(chunkPromises)
          results.push(...chunkResults)
        } else {
          const chunkResults = await Promise.allSettled(chunkPromises)
          results.push(...chunkResults.map(result => 
            result.status === 'fulfilled' ? result.value : { error: result.reason }
          ))
        }
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
   * Check if error is retryable
   * @param {Error} error - Error to check
   * @returns {boolean} True if error is retryable
   */
  isRetryableError(error) {
    // Check HTTP status codes
    if (error.response?.status) {
      return this.config.retryableStatuses.includes(error.response.status)
    }

    // Check error types
    if (error.code) {
      return this.config.retryableErrors.includes(error.code)
    }

    // Check error messages
    const message = error.message.toLowerCase()
    return message.includes('network') ||
           message.includes('timeout') ||
           message.includes('connection') ||
           message.includes('aborted')
  }

  /**
   * Calculate delay with exponential backoff and jitter
   * @param {number} attempt - Current attempt number
   * @param {number} baseDelay - Base delay in milliseconds
   * @param {number} multiplier - Backoff multiplier
   * @param {number} maxDelay - Maximum delay
   * @param {boolean} jitter - Whether to add jitter
   * @returns {number} Delay in milliseconds
   */
  calculateDelay(attempt, baseDelay, multiplier, maxDelay, jitter) {
    let delay = baseDelay * Math.pow(multiplier, attempt - 1)
    
    // Cap at max delay
    delay = Math.min(delay, maxDelay)
    
    // Add jitter to prevent thundering herd
    if (jitter) {
      const jitterAmount = Math.random() * this.config.jitterMax
      delay += jitterAmount
    }
    
    return Math.floor(delay)
  }

  /**
   * Circuit breaker methods
   */
  isCircuitOpen(endpoint) {
    const breaker = this.circuitBreakers.get(endpoint)
    if (!breaker) return false

    if (breaker.state === 'open') {
      // Check if timeout has passed
      if (Date.now() - breaker.openedAt > this.config.circuitBreakerTimeout) {
        breaker.state = 'half-open'
        breaker.halfOpenAt = Date.now()
        return false
      }
      return true
    }

    return false
  }

  recordSuccess(endpoint) {
    const breaker = this.circuitBreakers.get(endpoint)
    if (breaker) {
      breaker.failures = 0
      breaker.successes++
      
      if (breaker.state === 'half-open') {
        breaker.state = 'closed'
        breaker.closedAt = Date.now()
      }
    }
  }

  recordFailure(endpoint) {
    let breaker = this.circuitBreakers.get(endpoint)
    if (!breaker) {
      breaker = {
        state: 'closed',
        failures: 0,
        successes: 0,
        openedAt: null,
        closedAt: null,
        halfOpenAt: null
      }
      this.circuitBreakers.set(endpoint, breaker)
    }

    breaker.failures++

    // Open circuit if threshold exceeded
    if (breaker.failures >= this.config.circuitBreakerThreshold) {
      breaker.state = 'open'
      breaker.openedAt = Date.now()
    }
  }

  /**
   * Update retry statistics
   */
  updateRetryStats(endpoint, attempts, success) {
    let stats = this.retryStats.get(endpoint)
    if (!stats) {
      stats = {
        totalRequests: 0,
        totalRetries: 0,
        successCount: 0,
        failureCount: 0,
        averageAttempts: 0
      }
      this.retryStats.set(endpoint, stats)
    }

    stats.totalRequests++
    stats.totalRetries += attempts
    
    if (success) {
      stats.successCount++
    } else {
      stats.failureCount++
    }

    stats.averageAttempts = stats.totalRetries / stats.totalRequests
  }

  /**
   * Get retry statistics
   * @param {string} endpoint - Specific endpoint or null for all
   * @returns {object} Retry statistics
   */
  getStats(endpoint = null) {
    if (endpoint) {
      return {
        endpoint,
        retryStats: this.retryStats.get(endpoint) || null,
        circuitBreaker: this.circuitBreakers.get(endpoint) || null
      }
    }

    // Return all stats
    const allStats = {}
    
    this.retryStats.forEach((stats, ep) => {
      allStats[ep] = {
        retryStats: stats,
        circuitBreaker: this.circuitBreakers.get(ep) || null
      }
    })

    return allStats
  }

  /**
   * Reset circuit breaker for endpoint
   * @param {string} endpoint - Endpoint to reset
   */
  resetCircuitBreaker(endpoint) {
    this.circuitBreakers.delete(endpoint)
  }

  /**
   * Reset all circuit breakers
   */
  resetAllCircuitBreakers() {
    this.circuitBreakers.clear()
  }

  /**
   * Get circuit breaker status
   * @returns {object} Circuit breaker status
   */
  getCircuitBreakerStatus() {
    const status = {}
    
    this.circuitBreakers.forEach((breaker, endpoint) => {
      status[endpoint] = {
        state: breaker.state,
        failures: breaker.failures,
        successes: breaker.successes,
        openedAt: breaker.openedAt ? new Date(breaker.openedAt).toISOString() : null,
        timeSinceOpened: breaker.openedAt ? Date.now() - breaker.openedAt : null
      }
    })

    return status
  }

  // Helper methods
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  chunkArray(array, size) {
    const chunks = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  /**
   * Configure retry manager
   * @param {object} config - Configuration options
   */
  configure(config) {
    this.config = { ...this.config, ...config }
  }

  /**
   * Create a retry-enabled function wrapper
   * @param {function} fn - Function to wrap
   * @param {object} options - Default retry options
   * @returns {function} Wrapped function
   */
  wrap(fn, options = {}) {
    return (...args) => {
      return this.execute(() => fn(...args), options.maxRetries, options)
    }
  }
}

export { RetryManager }