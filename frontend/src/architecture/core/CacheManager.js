import { EventBus } from './EventBus'
import { ConfigManager } from './ConfigManager'

/**
 * Intelligent Cache Manager
 * Handles memory and localStorage caching with smart invalidation strategies
 */
class CacheManager {
  static instance = null

  constructor() {
    this.memoryCache = new Map()
    this.storageCache = new StorageAdapter('localStorage')
    this.eventBus = EventBus.getInstance()
    this.config = ConfigManager.get('cache')
    
    // Cache strategies configuration
    this.strategies = {
      user: { ttl: 3600000, storage: 'memory', maxSize: 50 }, // 1 hour
      projects: { ttl: 300000, storage: 'both', maxSize: 200 }, // 5 minutes  
      ai_responses: { ttl: 86400000, storage: 'localStorage', maxSize: 500 }, // 24 hours
      templates: { ttl: 7200000, storage: 'localStorage', maxSize: 100 }, // 2 hours
      integrations: { ttl: 1800000, storage: 'both', maxSize: 100 }, // 30 minutes
      default: { ttl: 300000, storage: 'memory', maxSize: 1000 } // 5 minutes
    }

    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0
    }

    this.setupCleanupInterval()
  }

  static getInstance() {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  /**
   * Set value in cache with intelligent strategy selection
   */
  async set(key, value, ttl = null, strategy = 'default') {
    const config = this.strategies[strategy] || this.strategies.default
    const finalTTL = ttl || config.ttl
    
    const cacheEntry = {
      value,
      expires: Date.now() + finalTTL,
      created: Date.now(),
      hits: 0,
      strategy,
      size: this.calculateSize(value)
    }

    try {
      // Memory cache
      if (config.storage === 'memory' || config.storage === 'both') {
        await this.setMemoryCache(key, cacheEntry, config)
      }

      // Storage cache
      if (config.storage === 'localStorage' || config.storage === 'both') {
        await this.storageCache.set(key, cacheEntry)
      }

      this.stats.sets++
      this.eventBus.emit('cache.set', { key, strategy, ttl: finalTTL })
      
      return true
    } catch (error) {
      console.error('Cache set error:', error)
      return false
    }
  }

  /**
   * Get value from cache with fallback logic
   */
  async get(key) {
    try {
      // Try memory cache first (fastest)
      let entry = this.memoryCache.get(key)
      let source = 'memory'

      // Fallback to storage cache
      if (!entry) {
        entry = await this.storageCache.get(key)
        source = 'storage'
        
        // Promote frequently accessed items to memory
        if (entry && !this.isExpired(entry)) {
          entry.hits++
          if (entry.hits > 3) { // Promote after 3 hits
            this.memoryCache.set(key, entry)
          }
        }
      }

      // Check expiration
      if (!entry || this.isExpired(entry)) {
        if (entry) {
          await this.delete(key) // Clean up expired entry
        }
        this.stats.misses++
        return null
      }

      // Update hit statistics
      entry.hits++
      entry.lastAccess = Date.now()
      this.stats.hits++

      this.eventBus.emit('cache.hit', { key, source, hits: entry.hits })
      return entry.value

    } catch (error) {
      console.error('Cache get error:', error)
      this.stats.misses++
      return null
    }
  }

  /**
   * Check if key exists in cache
   */
  async has(key) {
    const value = await this.get(key)
    return value !== null
  }

  /**
   * Delete specific key from cache
   */
  async delete(key) {
    try {
      let deleted = false

      if (this.memoryCache.has(key)) {
        this.memoryCache.delete(key)
        deleted = true
      }

      const storageDeleted = await this.storageCache.delete(key)
      deleted = deleted || storageDeleted

      if (deleted) {
        this.stats.deletes++
        this.eventBus.emit('cache.delete', { key })
      }

      return deleted
    } catch (error) {
      console.error('Cache delete error:', error)
      return false
    }
  }

  /**
   * Invalidate cache entries matching pattern
   */
  async invalidatePattern(pattern) {
    try {
      let deletedCount = 0
      const regex = new RegExp(pattern.replace(/\*/g, '.*'))

      // Clear from memory cache
      for (const key of this.memoryCache.keys()) {
        if (regex.test(key)) {
          this.memoryCache.delete(key)
          deletedCount++
        }
      }

      // Clear from storage cache
      const storageDeletedCount = await this.storageCache.invalidatePattern(pattern)
      deletedCount += storageDeletedCount

      this.stats.deletes += deletedCount
      this.eventBus.emit('cache.pattern_invalidated', { pattern, count: deletedCount })

      return deletedCount
    } catch (error) {
      console.error('Cache pattern invalidation error:', error)
      return 0
    }
  }

  /**
   * Clear all cache entries
   */
  async clear() {
    try {
      const memoryCount = this.memoryCache.size
      this.memoryCache.clear()
      
      const storageCount = await this.storageCache.clear()
      
      const totalCount = memoryCount + storageCount
      this.stats.deletes += totalCount
      
      this.eventBus.emit('cache.cleared', { count: totalCount })
      return totalCount
    } catch (error) {
      console.error('Cache clear error:', error)
      return 0
    }
  }

  /**
   * Get cache statistics and health information
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0

    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryEntries: this.memoryCache.size,
      storageEntries: this.storageCache.size(),
      memorySize: this.calculateMemoryCacheSize(),
      strategies: Object.keys(this.strategies)
    }
  }

  /**
   * Optimize cache by removing least recently used items
   */
  async optimize() {
    let optimized = 0
    
    // Optimize memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (this.isExpired(entry) || this.shouldEvict(entry)) {
        this.memoryCache.delete(key)
        optimized++
      }
    }

    // Optimize storage cache
    const storageOptimized = await this.storageCache.optimize()
    optimized += storageOptimized

    this.stats.evictions += optimized
    this.eventBus.emit('cache.optimized', { count: optimized })

    return optimized
  }

  // Private helper methods
  async setMemoryCache(key, entry, config) {
    // Check if we need to make room
    if (this.memoryCache.size >= config.maxSize) {
      await this.evictLRU(config.maxSize * 0.8) // Remove 20% when full
    }

    this.memoryCache.set(key, entry)
  }

  async evictLRU(targetSize) {
    const entries = Array.from(this.memoryCache.entries())
    
    // Sort by last access time (least recently used first)
    entries.sort((a, b) => {
      const aTime = a[1].lastAccess || a[1].created
      const bTime = b[1].lastAccess || b[1].created
      return aTime - bTime
    })

    let evicted = 0
    while (this.memoryCache.size > targetSize && evicted < entries.length) {
      const [key] = entries[evicted]
      this.memoryCache.delete(key)
      evicted++
    }

    this.stats.evictions += evicted
    return evicted
  }

  isExpired(entry) {
    return Date.now() > entry.expires
  }

  shouldEvict(entry) {
    const age = Date.now() - entry.created
    const lastAccess = entry.lastAccess || entry.created
    const timeSinceLastAccess = Date.now() - lastAccess

    // Evict if not accessed in 10 minutes and low hits
    return timeSinceLastAccess > 600000 && entry.hits < 2
  }

  calculateSize(value) {
    if (typeof value === 'string') {
      return value.length * 2 // Approximate UTF-16 encoding
    }
    
    try {
      return JSON.stringify(value).length * 2
    } catch {
      return 100 // Fallback estimate
    }
  }

  calculateMemoryCacheSize() {
    let totalSize = 0
    for (const entry of this.memoryCache.values()) {
      totalSize += entry.size || 0
    }
    return totalSize
  }

  setupCleanupInterval() {
    // Clean up expired entries every 5 minutes
    setInterval(() => {
      this.optimize()
    }, 300000)
  }
}

/**
 * Storage Adapter for localStorage with error handling
 */
class StorageAdapter {
  constructor(storageType = 'localStorage') {
    this.storage = storageType === 'localStorage' ? localStorage : sessionStorage
    this.prefix = 'ai-tempo-cache:'
  }

  async set(key, value) {
    try {
      const serialized = JSON.stringify(value)
      this.storage.setItem(this.prefix + key, serialized)
      return true
    } catch (error) {
      console.warn('Storage set failed:', error)
      return false
    }
  }

  async get(key) {
    try {
      const item = this.storage.getItem(this.prefix + key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.warn('Storage get failed:', error)
      return null
    }
  }

  async delete(key) {
    try {
      this.storage.removeItem(this.prefix + key)
      return true
    } catch (error) {
      console.warn('Storage delete failed:', error)
      return false
    }
  }

  async invalidatePattern(pattern) {
    try {
      let deletedCount = 0
      const regex = new RegExp(pattern.replace(/\*/g, '.*'))
      const keysToDelete = []

      // Find matching keys
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i)
        if (key && key.startsWith(this.prefix)) {
          const unprefixedKey = key.slice(this.prefix.length)
          if (regex.test(unprefixedKey)) {
            keysToDelete.push(key)
          }
        }
      }

      // Delete matching keys
      keysToDelete.forEach(key => {
        this.storage.removeItem(key)
        deletedCount++
      })

      return deletedCount
    } catch (error) {
      console.warn('Storage pattern invalidation failed:', error)
      return 0
    }
  }

  async clear() {
    try {
      let deletedCount = 0
      const keysToDelete = []

      // Find all our keys
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i)
        if (key && key.startsWith(this.prefix)) {
          keysToDelete.push(key)
        }
      }

      // Delete our keys
      keysToDelete.forEach(key => {
        this.storage.removeItem(key)
        deletedCount++
      })

      return deletedCount
    } catch (error) {
      console.warn('Storage clear failed:', error)
      return 0
    }
  }

  size() {
    try {
      let count = 0
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i)
        if (key && key.startsWith(this.prefix)) {
          count++
        }
      }
      return count
    } catch (error) {
      return 0
    }
  }

  async optimize() {
    // For localStorage, we can't really optimize much
    // Just remove expired entries if they have expiry data
    let optimized = 0
    const keysToDelete = []

    try {
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i)
        if (key && key.startsWith(this.prefix)) {
          const item = this.storage.getItem(key)
          if (item) {
            try {
              const parsed = JSON.parse(item)
              if (parsed.expires && Date.now() > parsed.expires) {
                keysToDelete.push(key)
              }
            } catch (e) {
              // Invalid JSON, remove it
              keysToDelete.push(key)
            }
          }
        }
      }

      keysToDelete.forEach(key => {
        this.storage.removeItem(key)
        optimized++
      })

    } catch (error) {
      console.warn('Storage optimization failed:', error)
    }

    return optimized
  }
}

export { CacheManager }