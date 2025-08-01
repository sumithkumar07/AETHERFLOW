/**
 * Enterprise Event Bus
 * Centralized event-driven communication system with middleware support
 */
class EventBus {
  static instance = null

  constructor() {
    this.subscribers = new Map() // eventType -> array of handlers
    this.middleware = [] // Global middleware functions
    this.eventHistory = [] // Event history for debugging
    this.maxHistorySize = 1000
    this.stats = {
      eventsEmitted: 0,
      eventsProcessed: 0,
      errors: 0,
      subscriberCount: 0
    }
  }

  static getInstance() {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus()
    }
    return EventBus.instance
  }

  /**
   * Subscribe to an event
   * @param {string} eventType - Event type to subscribe to
   * @param {function} handler - Event handler function
   * @param {object} options - Subscription options
   * @returns {function} Unsubscribe function
   */
  subscribe(eventType, handler, options = {}) {
    const {
      once = false,
      priority = 0,
      context = null,
      filter = null,
      id = null
    } = options

    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, [])
    }

    const subscription = {
      handler,
      once,
      priority,
      context,
      filter,
      id: id || this.generateSubscriptionId(),
      subscribedAt: Date.now(),
      callCount: 0,
      lastCalled: null
    }

    const subscribers = this.subscribers.get(eventType)
    subscribers.push(subscription)
    
    // Sort by priority (higher priority first)
    subscribers.sort((a, b) => b.priority - a.priority)

    this.stats.subscriberCount++

    // Return unsubscribe function
    return () => this.unsubscribe(eventType, subscription.id)
  }

  /**
   * Subscribe to an event once
   * @param {string} eventType - Event type
   * @param {function} handler - Event handler
   * @param {object} options - Additional options
   * @returns {function} Unsubscribe function
   */
  once(eventType, handler, options = {}) {
    return this.subscribe(eventType, handler, { ...options, once: true })
  }

  /**
   * Unsubscribe from an event
   * @param {string} eventType - Event type
   * @param {string} subscriptionId - Subscription ID
   * @returns {boolean} True if unsubscribed successfully
   */
  unsubscribe(eventType, subscriptionId) {
    if (!this.subscribers.has(eventType)) {
      return false
    }

    const subscribers = this.subscribers.get(eventType)
    const initialLength = subscribers.length
    
    // Remove subscription by ID
    const filteredSubscribers = subscribers.filter(sub => sub.id !== subscriptionId)
    this.subscribers.set(eventType, filteredSubscribers)

    const removed = initialLength > filteredSubscribers.length
    if (removed) {
      this.stats.subscriberCount--
    }

    return removed
  }

  /**
   * Unsubscribe all handlers for an event type
   * @param {string} eventType - Event type
   * @returns {number} Number of subscribers removed
   */
  unsubscribeAll(eventType) {
    if (!this.subscribers.has(eventType)) {
      return 0
    }

    const count = this.subscribers.get(eventType).length
    this.subscribers.delete(eventType)
    this.stats.subscriberCount -= count
    
    return count
  }

  /**
   * Emit an event
   * @param {string} eventType - Event type
   * @param {any} data - Event data
   * @param {object} metadata - Event metadata
   * @returns {Promise<boolean>} True if event was processed successfully
   */
  async emit(eventType, data = null, metadata = {}) {
    const event = this.createEvent(eventType, data, metadata)
    
    try {
      // Process middleware
      const processedEvent = await this.processMiddleware(event)
      if (processedEvent === false) {
        return false // Middleware canceled the event
      }

      // Store in history
      this.addToHistory(processedEvent)

      // Get subscribers
      const subscribers = this.subscribers.get(eventType) || []
      
      if (subscribers.length === 0) {
        this.stats.eventsEmitted++
        return true
      }

      // Process subscribers
      await this.processSubscribers(processedEvent, subscribers)

      this.stats.eventsEmitted++
      this.stats.eventsProcessed++

      return true

    } catch (error) {
      this.stats.errors++
      console.error(`EventBus: Error processing event "${eventType}":`, error)
      
      // Emit error event (if not already an error event to prevent loops)
      if (eventType !== 'eventbus.error') {
        this.emit('eventbus.error', { originalEvent: event, error }, { source: 'EventBus' })
      }
      
      return false
    }
  }

  /**
   * Emit event synchronously (use with caution)
   * @param {string} eventType - Event type
   * @param {any} data - Event data
   * @param {object} metadata - Event metadata
   */
  emitSync(eventType, data = null, metadata = {}) {
    const event = this.createEvent(eventType, data, metadata)
    
    try {
      // Process middleware synchronously
      const processedEvent = this.processMiddlewareSync(event)
      if (processedEvent === false) {
        return false
      }

      // Store in history
      this.addToHistory(processedEvent)

      // Get and process subscribers synchronously
      const subscribers = this.subscribers.get(eventType) || []
      this.processSubscribersSync(processedEvent, subscribers)

      this.stats.eventsEmitted++
      this.stats.eventsProcessed++

      return true

    } catch (error) {
      this.stats.errors++
      console.error(`EventBus: Error processing sync event "${eventType}":`, error)
      return false
    }
  }

  /**
   * Add global middleware
   * @param {function} middlewareFunc - Middleware function
   * @returns {function} Remove middleware function
   */
  use(middlewareFunc) {
    this.middleware.push(middlewareFunc)
    
    // Return function to remove middleware
    return () => {
      const index = this.middleware.indexOf(middlewareFunc)
      if (index > -1) {
        this.middleware.splice(index, 1)
      }
    }
  }

  /**
   * Get event statistics
   * @returns {object} Event bus statistics
   */
  getStats() {
    return {
      ...this.stats,
      eventTypes: this.subscribers.size,
      historySize: this.eventHistory.length,
      middlewareCount: this.middleware.length
    }
  }

  /**
   * Get event history
   * @param {number} limit - Maximum number of events to return
   * @param {string} eventType - Filter by event type
   * @returns {array} Event history
   */
  getHistory(limit = 100, eventType = null) {
    let history = [...this.eventHistory]
    
    if (eventType) {
      history = history.filter(event => event.type === eventType)
    }
    
    return history.slice(-limit).reverse()
  }

  /**
   * Clear event history
   */
  clearHistory() {
    this.eventHistory = []
  }

  /**
   * Get all subscribers for debugging
   * @returns {object} Subscribers by event type
   */
  getSubscribers() {
    const result = {}
    
    this.subscribers.forEach((subscribers, eventType) => {
      result[eventType] = subscribers.map(sub => ({
        id: sub.id,
        priority: sub.priority,
        once: sub.once,
        callCount: sub.callCount,
        subscribedAt: new Date(sub.subscribedAt).toISOString(),
        lastCalled: sub.lastCalled ? new Date(sub.lastCalled).toISOString() : null
      }))
    })
    
    return result
  }

  // Private methods
  createEvent(eventType, data, metadata) {
    return {
      type: eventType,
      data,
      metadata: {
        ...metadata,
        timestamp: Date.now(),
        id: this.generateEventId(),
        source: metadata.source || 'unknown'
      }
    }
  }

  async processMiddleware(event) {
    let processedEvent = event
    
    for (const middleware of this.middleware) {
      try {
        const result = await middleware(processedEvent)
        if (result === false) {
          return false // Cancel event
        }
        if (result && typeof result === 'object') {
          processedEvent = result // Transform event
        }
      } catch (error) {
        console.error('EventBus: Middleware error:', error)
        // Continue with other middleware
      }
    }
    
    return processedEvent
  }

  processMiddlewareSync(event) {
    let processedEvent = event
    
    for (const middleware of this.middleware) {
      try {
        const result = middleware(processedEvent)
        if (result === false) {
          return false
        }
        if (result && typeof result === 'object') {
          processedEvent = result
        }
      } catch (error) {
        console.error('EventBus: Sync middleware error:', error)
      }
    }
    
    return processedEvent
  }

  async processSubscribers(event, subscribers) {
    const toRemove = []
    
    for (const subscription of subscribers) {
      try {
        // Apply filter if present
        if (subscription.filter && !subscription.filter(event)) {
          continue
        }

        // Call handler
        if (subscription.context) {
          await subscription.handler.call(subscription.context, event)
        } else {
          await subscription.handler(event)
        }

        // Update statistics
        subscription.callCount++
        subscription.lastCalled = Date.now()

        // Mark for removal if once
        if (subscription.once) {
          toRemove.push(subscription.id)
        }

      } catch (error) {
        console.error(`EventBus: Subscriber error for event "${event.type}":`, error)
        this.stats.errors++
      }
    }

    // Remove one-time subscribers
    toRemove.forEach(id => {
      this.unsubscribe(event.type, id)
    })
  }

  processSubscribersSync(event, subscribers) {
    const toRemove = []
    
    for (const subscription of subscribers) {
      try {
        if (subscription.filter && !subscription.filter(event)) {
          continue
        }

        if (subscription.context) {
          subscription.handler.call(subscription.context, event)
        } else {
          subscription.handler(event)
        }

        subscription.callCount++
        subscription.lastCalled = Date.now()

        if (subscription.once) {
          toRemove.push(subscription.id)
        }

      } catch (error) {
        console.error(`EventBus: Sync subscriber error for event "${event.type}":`, error)
        this.stats.errors++
      }
    }

    // Remove one-time subscribers
    toRemove.forEach(id => {
      this.unsubscribe(event.type, id)
    })
  }

  addToHistory(event) {
    this.eventHistory.push(event)
    
    // Trim history if too large
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift()
    }
  }

  generateEventId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  generateSubscriptionId() {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

export { EventBus }