import { APIGateway } from '../core/APIGateway'
import { EventBus } from '../core/EventBus'
import { CacheManager } from '../core/CacheManager'

/**
 * Base Repository Class
 * Provides common data access patterns and business logic abstraction
 */
class BaseRepository {
  constructor(resourceName, options = {}) {
    this.resourceName = resourceName
    this.apiGateway = APIGateway.getInstance()
    this.eventBus = EventBus.getInstance()
    this.cache = CacheManager.getInstance()
    
    this.config = {
      baseEndpoint: `/api/${resourceName}`,
      cacheStrategy: 'default',
      cacheTTL: 300000, // 5 minutes
      enableCache: true,
      enableEvents: true,
      retryAttempts: 3,
      ...options
    }
  }

  /**
   * Find all resources with optional filtering and pagination
   * @param {object} options - Query options
   * @returns {Promise<array>} Array of resources
   */
  async findAll(options = {}) {
    const {
      filters = {},
      sort = {},
      pagination = {},
      cache = this.config.enableCache,
      ...requestOptions
    } = options

    try {
      const params = this.buildQueryParams({ filters, sort, pagination })
      
      const data = await this.apiGateway.get(this.config.baseEndpoint, {
        params,
        cache,
        cacheTTL: this.config.cacheTTL,
        cacheStrategy: this.config.cacheStrategy,
        retryAttempts: this.config.retryAttempts,
        ...requestOptions
      })

      // Apply post-processing
      const processedData = Array.isArray(data) ? 
        data.map(item => this.enrichItem(item)) : 
        [this.enrichItem(data)]

      // Emit event
      if (this.config.enableEvents) {
        this.eventBus.emit(`${this.resourceName}.fetched`, {
          count: processedData.length,
          filters,
          timestamp: Date.now()
        })
      }

      return processedData

    } catch (error) {
      this.handleError('findAll', error, { filters, sort, pagination })
      throw error
    }
  }

  /**
   * Find resource by ID
   * @param {string} id - Resource ID
   * @param {object} options - Request options
   * @returns {Promise<object>} Resource object
   */
  async findById(id, options = {}) {
    const {
      cache = this.config.enableCache,
      ...requestOptions
    } = options

    if (!id) {
      throw new Error(`${this.resourceName} ID is required`)
    }

    try {
      const data = await this.apiGateway.get(`${this.config.baseEndpoint}/${id}`, {
        cache,
        cacheTTL: this.config.cacheTTL,
        cacheStrategy: this.config.cacheStrategy,
        retryAttempts: this.config.retryAttempts,
        ...requestOptions
      })

      const processedData = this.enrichItem(data)

      if (this.config.enableEvents) {
        this.eventBus.emit(`${this.resourceName}.found`, {
          id,
          data: processedData,
          timestamp: Date.now()
        })
      }

      return processedData

    } catch (error) {
      this.handleError('findById', error, { id })
      throw error
    }
  }

  /**
   * Create new resource
   * @param {object} data - Resource data
   * @param {object} options - Request options
   * @returns {Promise<object>} Created resource
   */
  async create(data, options = {}) {
    if (!data) {
      throw new Error(`${this.resourceName} data is required`)
    }

    try {
      // Validate data
      this.validateForCreate(data)

      // Process data before sending
      const processedData = this.processForCreate(data)

      const result = await this.apiGateway.post(this.config.baseEndpoint, processedData, {
        retryAttempts: this.config.retryAttempts,
        ...options
      })

      const enrichedResult = this.enrichItem(result)

      // Invalidate cache
      if (this.config.enableCache) {
        await this.invalidateCache()
      }

      // Emit events
      if (this.config.enableEvents) {
        this.eventBus.emit(`${this.resourceName}.created`, {
          data: enrichedResult,
          timestamp: Date.now()
        })
      }

      return enrichedResult

    } catch (error) {
      this.handleError('create', error, { data })
      throw error
    }
  }

  /**
   * Update existing resource
   * @param {string} id - Resource ID
   * @param {object} data - Updated data
   * @param {object} options - Request options
   * @returns {Promise<object>} Updated resource
   */
  async update(id, data, options = {}) {
    if (!id) {
      throw new Error(`${this.resourceName} ID is required`)
    }
    if (!data) {
      throw new Error(`${this.resourceName} data is required`)
    }

    try {
      // Validate data
      this.validateForUpdate(data)

      // Process data before sending
      const processedData = this.processForUpdate(data)

      const result = await this.apiGateway.put(`${this.config.baseEndpoint}/${id}`, processedData, {
        retryAttempts: this.config.retryAttempts,
        ...options
      })

      const enrichedResult = this.enrichItem(result)

      // Invalidate cache
      if (this.config.enableCache) {
        await this.invalidateCache(id)
      }

      // Emit events
      if (this.config.enableEvents) {
        this.eventBus.emit(`${this.resourceName}.updated`, {
          id,
          data: enrichedResult,
          timestamp: Date.now()
        })
      }

      return enrichedResult

    } catch (error) {
      this.handleError('update', error, { id, data })
      throw error
    }
  }

  /**
   * Partially update resource
   * @param {string} id - Resource ID
   * @param {object} data - Partial data
   * @param {object} options - Request options
   * @returns {Promise<object>} Updated resource
   */
  async patch(id, data, options = {}) {
    if (!id) {
      throw new Error(`${this.resourceName} ID is required`)
    }
    if (!data) {
      throw new Error(`${this.resourceName} data is required`)
    }

    try {
      // Validate data
      this.validateForPatch(data)

      // Process data before sending
      const processedData = this.processForPatch(data)

      const result = await this.apiGateway.patch(`${this.config.baseEndpoint}/${id}`, processedData, {
        retryAttempts: this.config.retryAttempts,
        ...options
      })

      const enrichedResult = this.enrichItem(result)

      // Invalidate cache
      if (this.config.enableCache) {
        await this.invalidateCache(id)
      }

      // Emit events
      if (this.config.enableEvents) {
        this.eventBus.emit(`${this.resourceName}.patched`, {
          id,
          data: enrichedResult,
          timestamp: Date.now()
        })
      }

      return enrichedResult

    } catch (error) {
      this.handleError('patch', error, { id, data })
      throw error
    }
  }

  /**
   * Delete resource
   * @param {string} id - Resource ID
   * @param {object} options - Request options
   * @returns {Promise<boolean>} Success status
   */
  async delete(id, options = {}) {
    if (!id) {
      throw new Error(`${this.resourceName} ID is required`)
    }

    try {
      await this.apiGateway.delete(`${this.config.baseEndpoint}/${id}`, {
        retryAttempts: this.config.retryAttempts,
        ...options
      })

      // Invalidate cache
      if (this.config.enableCache) {
        await this.invalidateCache(id)
      }

      // Emit events
      if (this.config.enableEvents) {
        this.eventBus.emit(`${this.resourceName}.deleted`, {
          id,
          timestamp: Date.now()
        })
      }

      return true

    } catch (error) {
      this.handleError('delete', error, { id })
      throw error
    }
  }

  /**
   * Batch operations
   * @param {array} operations - Array of operations
   * @param {object} options - Request options
   * @returns {Promise<array>} Results array
   */
  async batch(operations, options = {}) {
    if (!Array.isArray(operations) || operations.length === 0) {
      throw new Error('Operations array is required')
    }

    try {
      const requests = operations.map(op => ({
        endpoint: this.buildOperationEndpoint(op),
        options: {
          method: op.method || 'GET',
          data: op.data,
          retryAttempts: this.config.retryAttempts,
          ...options
        }
      }))

      const results = await this.apiGateway.batch(requests, {
        maxConcurrent: options.maxConcurrent || 5,
        failFast: options.failFast || false
      })

      // Process results
      const processedResults = results.map((result, index) => {
        if (result.error) {
          return { error: result.error, operation: operations[index] }
        }
        return this.enrichItem(result)
      })

      // Invalidate cache for successful operations
      if (this.config.enableCache) {
        await this.invalidateCache()
      }

      // Emit events
      if (this.config.enableEvents) {
        this.eventBus.emit(`${this.resourceName}.batch_processed`, {
          operationsCount: operations.length,
          successCount: processedResults.filter(r => !r.error).length,
          timestamp: Date.now()
        })
      }

      return processedResults

    } catch (error) {
      this.handleError('batch', error, { operations })
      throw error
    }
  }

  /**
   * Custom query method
   * @param {string} endpoint - Custom endpoint
   * @param {object} options - Request options
   * @returns {Promise<any>} Query result
   */
  async query(endpoint, options = {}) {
    try {
      const fullEndpoint = endpoint.startsWith('/') ? endpoint : `${this.config.baseEndpoint}/${endpoint}`
      
      const result = await this.apiGateway.request(fullEndpoint, {
        cache: options.cache !== false && this.config.enableCache,
        cacheTTL: this.config.cacheTTL,
        cacheStrategy: this.config.cacheStrategy,
        retryAttempts: this.config.retryAttempts,
        ...options
      })

      return result

    } catch (error) {
      this.handleError('query', error, { endpoint, options })
      throw error
    }
  }

  // Protected methods for customization by subclasses

  /**
   * Enrich item with computed properties
   * @param {object} item - Raw item from API
   * @returns {object} Enriched item
   */
  enrichItem(item) {
    if (!item) return item

    return {
      ...item,
      // Add common computed properties
      createdAtFormatted: item.created_at ? new Date(item.created_at).toLocaleString() : null,
      updatedAtFormatted: item.updated_at ? new Date(item.updated_at).toLocaleString() : null,
      isNew: item.created_at ? Date.now() - new Date(item.created_at).getTime() < 86400000 : false, // less than 24h
      // Subclasses can override to add more
      ...this.addCustomEnrichments(item)
    }
  }

  /**
   * Add custom enrichments (override in subclasses)
   * @param {object} item - Item to enrich
   * @returns {object} Additional properties
   */
  addCustomEnrichments(item) {
    return {}
  }

  /**
   * Validate data for create operation
   * @param {object} data - Data to validate
   */
  validateForCreate(data) {
    // Override in subclasses
  }

  /**
   * Validate data for update operation
   * @param {object} data - Data to validate
   */
  validateForUpdate(data) {
    // Override in subclasses
  }

  /**
   * Validate data for patch operation
   * @param {object} data - Data to validate
   */
  validateForPatch(data) {
    // Override in subclasses
  }

  /**
   * Process data before create
   * @param {object} data - Original data
   * @returns {object} Processed data
   */
  processForCreate(data) {
    return {
      ...data,
      created_at: new Date().toISOString()
    }
  }

  /**
   * Process data before update
   * @param {object} data - Original data
   * @returns {object} Processed data
   */
  processForUpdate(data) {
    return {
      ...data,
      updated_at: new Date().toISOString()
    }
  }

  /**
   * Process data before patch
   * @param {object} data - Original data
   * @returns {object} Processed data
   */
  processForPatch(data) {
    return {
      ...data,
      updated_at: new Date().toISOString()
    }
  }

  // Private helper methods

  buildQueryParams({ filters, sort, pagination }) {
    const params = {}

    // Add filters
    if (filters && Object.keys(filters).length > 0) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params[key] = value
        }
      })
    }

    // Add sorting
    if (sort && Object.keys(sort).length > 0) {
      const sortParams = Object.entries(sort)
        .map(([field, direction]) => `${field}:${direction}`)
        .join(',')
      params.sort = sortParams
    }

    // Add pagination
    if (pagination) {
      if (pagination.page) params.page = pagination.page
      if (pagination.limit) params.limit = pagination.limit
      if (pagination.offset) params.offset = pagination.offset
    }

    return params
  }

  buildOperationEndpoint(operation) {
    const { method = 'GET', id, path } = operation
    
    if (path) {
      return path.startsWith('/') ? path : `${this.config.baseEndpoint}/${path}`
    }
    
    if (id && (method === 'GET' || method === 'PUT' || method === 'PATCH' || method === 'DELETE')) {
      return `${this.config.baseEndpoint}/${id}`
    }
    
    return this.config.baseEndpoint
  }

  async invalidateCache(id = null) {
    if (id) {
      // Invalidate specific item
      await this.cache.invalidatePattern(`*${this.config.baseEndpoint}/${id}*`)
    } else {
      // Invalidate all items for this resource
      await this.cache.invalidatePattern(`*${this.config.baseEndpoint}*`)
    }
  }

  handleError(operation, error, context) {
    // Log error with context
    console.error(`${this.resourceName}Repository.${operation} error:`, {
      error: error.message,
      context,
      timestamp: new Date().toISOString()
    })

    // Emit error event
    if (this.config.enableEvents) {
      this.eventBus.emit(`${this.resourceName}.error`, {
        operation,
        error: error.message,
        context,
        timestamp: Date.now()
      })
    }
  }
}

export { BaseRepository }