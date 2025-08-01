import { EventBus } from '../core/EventBus'
import { CacheManager } from '../core/CacheManager'
import { PerformanceMonitor } from '../core/PerformanceMonitor'

/**
 * Real-Time Collaboration Engine - Phase 10
 * Live collaboration with operational transformation and presence awareness
 */
class CollaborationEngine {
  constructor() {
    this.eventBus = EventBus.getInstance()
    this.cache = CacheManager.getInstance()
    this.performanceMonitor = PerformanceMonitor.getInstance()
    
    // Collaboration state
    this.documents = new Map()
    this.userSessions = new Map()
    this.presenceData = new Map()
    
    // Operational transformation
    this.operationQueue = new Map()
    this.transformEngine = null
    
    // Conflict resolution
    this.conflictResolver = null
    
    // Real-time connection management
    this.connections = new Set()
    this.rooms = new Map()
    
    this.initialize()
  }

  async initialize() {
    // Initialize transformation engine
    this.initializeTransformEngine()
    
    // Initialize conflict resolver
    this.initializeConflictResolver()
    
    // Set up real-time connections
    this.setupRealtimeConnections()
    
    // Start presence tracking
    this.startPresenceTracking()
    
    console.log('👥 CollaborationEngine initialized')
    this.eventBus.emit('collaboration.initialized')
  }

  /**
   * Join a collaboration session
   */
  async joinSession(sessionId, userId, userInfo = {}) {
    try {
      // Create or get session
      let session = this.userSessions.get(sessionId)
      if (!session) {
        session = this.createSession(sessionId)
        this.userSessions.set(sessionId, session)
      }
      
      // Add user to session
      session.participants.set(userId, {
        userId,
        userInfo,
        joinedAt: Date.now(),
        lastActivity: Date.now(),
        cursor: null,
        selection: null,
        permissions: this.getUserPermissions(userId, sessionId)
      })
      
      // Initialize user presence
      this.initializeUserPresence(sessionId, userId, userInfo)
      
      // Sync current document state
      const documentState = await this.syncDocumentState(sessionId, userId)
      
      // Emit join event
      this.eventBus.emit('collaboration.user_joined', {
        sessionId,
        userId,
        userInfo,
        participants: Array.from(session.participants.keys())
      })
      
      // Broadcast to other participants
      this.broadcastToSession(sessionId, {
        type: 'user_joined',
        userId,
        userInfo,
        timestamp: Date.now()
      }, userId)
      
      return {
        sessionId,
        documentState,
        participants: this.getSessionParticipants(sessionId),
        permissions: session.participants.get(userId).permissions
      }
      
    } catch (error) {
      console.error('Failed to join collaboration session:', error)
      throw error
    }
  }

  /**
   * Leave collaboration session
   */
  async leaveSession(sessionId, userId) {
    try {
      const session = this.userSessions.get(sessionId)
      if (!session) return
      
      // Remove user from session
      session.participants.delete(userId)
      
      // Clean up user presence
      this.cleanupUserPresence(sessionId, userId)
      
      // Emit leave event
      this.eventBus.emit('collaboration.user_left', {
        sessionId,
        userId,
        remainingParticipants: Array.from(session.participants.keys())
      })
      
      // Broadcast to remaining participants
      this.broadcastToSession(sessionId, {
        type: 'user_left',
        userId,
        timestamp: Date.now()
      })
      
      // Clean up empty sessions
      if (session.participants.size === 0) {
        this.cleanupSession(sessionId)
      }
      
    } catch (error) {
      console.error('Failed to leave collaboration session:', error)
      throw error
    }
  }

  /**
   * Apply operation with operational transformation
   */
  async applyOperation(sessionId, userId, operation) {
    try {
      const session = this.userSessions.get(sessionId)
      if (!session) {
        throw new Error('Session not found')
      }
      
      const participant = session.participants.get(userId)
      if (!participant) {
        throw new Error('User not in session')
      }
      
      // Check permissions
      if (!this.canPerformOperation(participant.permissions, operation)) {
        throw new Error('Insufficient permissions')
      }
      
      // Get current document
      const document = this.documents.get(sessionId)
      if (!document) {
        throw new Error('Document not found')
      }
      
      // Transform operation against pending operations
      const transformedOperation = await this.transformOperation(
        operation,
        document.pendingOperations,
        userId
      )
      
      // Apply transformed operation
      const result = this.applyTransformedOperation(transformedOperation, document)
      
      // Update document state
      document.content = result.newContent
      document.version++
      document.lastModified = Date.now()
      document.lastModifiedBy = userId
      
      // Add to operation history
      document.operationHistory.push({
        operation: transformedOperation,
        userId,
        timestamp: Date.now(),
        version: document.version
      })
      
      // Keep history size manageable
      if (document.operationHistory.length > 1000) {
        document.operationHistory.shift()
      }
      
      // Update user activity
      participant.lastActivity = Date.now()
      
      // Broadcast operation to other participants
      this.broadcastToSession(sessionId, {
        type: 'operation',
        operation: transformedOperation,
        userId,
        version: document.version,
        timestamp: Date.now()
      }, userId)
      
      // Emit operation applied event
      this.eventBus.emit('collaboration.operation_applied', {
        sessionId,
        userId,
        operation: transformedOperation,
        result
      })
      
      return {
        success: true,
        operation: transformedOperation,
        version: document.version,
        result
      }
      
    } catch (error) {
      console.error('Failed to apply operation:', error)
      
      // Emit operation failed event
      this.eventBus.emit('collaboration.operation_failed', {
        sessionId,
        userId,
        operation,
        error: error.message
      })
      
      throw error
    }
  }

  /**
   * Update user presence (cursor, selection, etc.)
   */
  async updatePresence(sessionId, userId, presenceData) {
    try {
      const session = this.userSessions.get(sessionId)
      const participant = session?.participants.get(userId)
      
      if (!participant) {
        throw new Error('User not in session')
      }
      
      // Update participant presence
      Object.assign(participant, {
        cursor: presenceData.cursor,
        selection: presenceData.selection,
        viewportBounds: presenceData.viewportBounds,
        currentFile: presenceData.currentFile,
        lastActivity: Date.now()
      })
      
      // Update global presence data
      this.presenceData.set(`${sessionId}:${userId}`, {
        ...presenceData,
        userId,
        sessionId,
        timestamp: Date.now()
      })
      
      // Broadcast presence update
      this.broadcastToSession(sessionId, {
        type: 'presence_update',
        userId,
        presence: presenceData,
        timestamp: Date.now()
      }, userId)
      
      // Emit presence update event
      this.eventBus.emit('collaboration.presence_updated', {
        sessionId,
        userId,
        presence: presenceData
      })
      
    } catch (error) {
      console.error('Failed to update presence:', error)
      throw error
    }
  }

  /**
   * Handle conflicts and merge resolution
   */
  async resolveConflict(sessionId, conflictData) {
    try {
      if (!this.conflictResolver) {
        throw new Error('Conflict resolver not initialized')
      }
      
      const resolution = await this.conflictResolver.resolve(conflictData)
      
      // Apply conflict resolution
      const document = this.documents.get(sessionId)
      if (document) {
        document.content = resolution.resolvedContent
        document.version++
        document.conflictResolutions.push({
          conflict: conflictData,
          resolution,
          timestamp: Date.now()
        })
      }
      
      // Broadcast resolution to all participants
      this.broadcastToSession(sessionId, {
        type: 'conflict_resolved',
        resolution,
        timestamp: Date.now()
      })
      
      this.eventBus.emit('collaboration.conflict_resolved', {
        sessionId,
        conflict: conflictData,
        resolution
      })
      
      return resolution
      
    } catch (error) {
      console.error('Failed to resolve conflict:', error)
      throw error
    }
  }

  /**
   * Get collaboration analytics
   */
  getCollaborationAnalytics(sessionId, timeRange = 3600000) {
    try {
      const session = this.userSessions.get(sessionId)
      const document = this.documents.get(sessionId)
      
      if (!session || !document) {
        return { error: 'Session or document not found' }
      }
      
      const now = Date.now()
      const startTime = now - timeRange
      
      // Filter operations within time range
      const recentOperations = document.operationHistory.filter(
        op => op.timestamp >= startTime
      )
      
      // Calculate metrics
      const analytics = {
        session: {
          id: sessionId,
          participantCount: session.participants.size,
          duration: now - session.createdAt,
          isActive: session.participants.size > 0
        },
        
        document: {
          version: document.version,
          totalOperations: document.operationHistory.length,
          recentOperations: recentOperations.length,
          lastModified: document.lastModified,
          conflicts: document.conflictResolutions.length
        },
        
        activity: {
          operationsPerUser: this.calculateOperationsPerUser(recentOperations),
          operationsOverTime: this.calculateOperationsOverTime(recentOperations),
          mostActiveUsers: this.getMostActiveUsers(session, recentOperations),
          collaborationIntensity: this.calculateCollaborationIntensity(recentOperations)
        },
        
        performance: {
          averageOperationTime: this.calculateAverageOperationTime(recentOperations),
          conflictRate: this.calculateConflictRate(document),
          syncLatency: this.calculateAverageSyncLatency(sessionId)
        },
        
        timeRange: {
          start: startTime,
          end: now,
          duration: timeRange
        }
      }
      
      return analytics
      
    } catch (error) {
      console.error('Failed to get collaboration analytics:', error)
      return { error: error.message }
    }
  }

  // Operational Transformation Engine
  initializeTransformEngine() {
    this.transformEngine = {
      // Transform operation against a set of concurrent operations
      transform: (operation, concurrentOps, userId) => {
        let transformedOp = { ...operation }
        
        // Apply transformation for each concurrent operation
        for (const concurrentOp of concurrentOps) {
          if (concurrentOp.userId !== userId) {
            transformedOp = this.transformOperationPair(transformedOp, concurrentOp)
          }
        }
        
        return transformedOp
      },
      
      // Transform two operations against each other
      transformOperationPair: (op1, op2) => {
        // Implementation depends on operation types
        if (op1.type === 'insert' && op2.type === 'insert') {
          return this.transformInsertInsert(op1, op2)
        } else if (op1.type === 'delete' && op2.type === 'delete') {
          return this.transformDeleteDelete(op1, op2)
        } else if (op1.type === 'insert' && op2.type === 'delete') {
          return this.transformInsertDelete(op1, op2)
        } else if (op1.type === 'delete' && op2.type === 'insert') {
          return this.transformDeleteInsert(op1, op2)
        }
        
        return op1 // No transformation needed
      }
    }
  }

  async transformOperation(operation, pendingOperations, userId) {
    if (!this.transformEngine) {
      return operation
    }
    
    return this.transformEngine.transform(operation, pendingOperations, userId)
  }

  applyTransformedOperation(operation, document) {
    const { type, position, content, length } = operation
    let newContent = document.content
    
    try {
      switch (type) {
        case 'insert':
          newContent = newContent.slice(0, position) + content + newContent.slice(position)
          break
          
        case 'delete':
          newContent = newContent.slice(0, position) + newContent.slice(position + length)
          break
          
        case 'replace':
          newContent = newContent.slice(0, position) + content + newContent.slice(position + length)
          break
          
        default:
          throw new Error(`Unknown operation type: ${type}`)
      }
      
      return {
        success: true,
        newContent,
        operation
      }
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        newContent: document.content
      }
    }
  }

  // Conflict Resolution
  initializeConflictResolver() {
    this.conflictResolver = {
      resolve: async (conflictData) => {
        const { operations, conflictType, document } = conflictData
        
        switch (conflictType) {
          case 'concurrent_edit':
            return this.resolveConcurrentEdit(operations, document)
            
          case 'version_mismatch':
            return this.resolveVersionMismatch(operations, document)
            
          case 'permission_conflict':
            return this.resolvePermissionConflict(operations, document)
            
          default:
            return this.resolveGenericConflict(operations, document)
        }
      }
    }
  }

  async resolveConcurrentEdit(operations, document) {
    // Three-way merge approach
    const baseContent = document.content
    const mergedContent = await this.performThreeWayMerge(baseContent, operations)
    
    return {
      type: 'concurrent_edit',
      resolvedContent: mergedContent,
      strategy: 'three_way_merge',
      confidence: this.calculateMergeConfidence(mergedContent, operations)
    }
  }

  // Real-time connection management
  setupRealtimeConnections() {
    // In a real implementation, this would set up WebSocket connections
    // For now, we'll simulate with event-based communication
    
    this.eventBus.subscribe('collaboration.connect', (event) => {
      this.handleConnectionRequest(event.data)
    })
    
    this.eventBus.subscribe('collaboration.disconnect', (event) => {
      this.handleDisconnection(event.data)
    })
  }

  broadcastToSession(sessionId, message, excludeUserId = null) {
    const session = this.userSessions.get(sessionId)
    if (!session) return
    
    session.participants.forEach((participant, userId) => {
      if (userId !== excludeUserId) {
        this.sendToUser(userId, {
          sessionId,
          ...message
        })
      }
    })
  }

  sendToUser(userId, message) {
    // In real implementation, this would send via WebSocket
    this.eventBus.emit(`collaboration.message.${userId}`, message)
  }

  // Utility methods
  createSession(sessionId) {
    const session = {
      id: sessionId,
      createdAt: Date.now(),
      participants: new Map(),
      settings: {
        maxParticipants: 10,
        allowAnonymous: false,
        requirePermissions: true
      }
    }
    
    // Create corresponding document
    this.documents.set(sessionId, {
      id: sessionId,
      content: '',
      version: 0,
      createdAt: Date.now(),
      lastModified: Date.now(),
      lastModifiedBy: null,
      operationHistory: [],
      pendingOperations: [],
      conflictResolutions: []
    })
    
    return session
  }

  getUserPermissions(userId, sessionId) {
    // In real implementation, this would check against permission system
    return {
      canEdit: true,
      canComment: true,
      canShare: false,
      canManage: false
    }
  }

  canPerformOperation(permissions, operation) {
    switch (operation.type) {
      case 'insert':
      case 'delete':
      case 'replace':
        return permissions.canEdit
        
      case 'comment':
        return permissions.canComment
        
      case 'share':
        return permissions.canShare
        
      default:
        return false
    }
  }

  calculateCollaborationIntensity(operations) {
    if (operations.length === 0) return 0
    
    const timeSpan = Math.max(
      operations[operations.length - 1].timestamp - operations[0].timestamp,
      1
    )
    
    return operations.length / (timeSpan / 1000) // Operations per second
  }

  calculateAverageOperationTime(operations) {
    if (operations.length < 2) return 0
    
    const intervals = []
    for (let i = 1; i < operations.length; i++) {
      intervals.push(operations[i].timestamp - operations[i - 1].timestamp)
    }
    
    return intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
  }
}

export { CollaborationEngine }