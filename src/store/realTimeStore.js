import { create } from 'zustand'
import axios from 'axios'
import toast from 'react-hot-toast'

/**
 * Real-time Store - Manages WebSocket connections and real-time features
 * Connects to WebSocket endpoints and provides real-time updates across the platform
 */

class EnhancedWebSocketManager {
  constructor() {
    this.connections = new Map()
    this.subscribers = new Map()
    this.reconnectAttempts = new Map()
    this.maxReconnectAttempts = 5
    this.heartbeatInterval = null
  }

  connect(connectionId, url, userId) {
    if (this.connections.has(connectionId)) {
      this.disconnect(connectionId)
    }

    try {
      const ws = new WebSocket(url)
      this.connections.set(connectionId, ws)
      this.reconnectAttempts.set(connectionId, 0)

      ws.onopen = () => {
        console.log(`✅ WebSocket connected: ${connectionId}`)
        
        // Send authentication
        ws.send(JSON.stringify({
          type: 'auth',
          userId: userId,
          connectionId: connectionId
        }))

        // Start heartbeat
        this.startHeartbeat(connectionId)
        
        this.notifySubscribers(connectionId, {
          type: 'connection_status',
          status: 'connected',
          connectionId
        })
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          this.notifySubscribers(connectionId, message)
        } catch (error) {
          console.error(`WebSocket message parse error for ${connectionId}:`, error)
        }
      }

      ws.onclose = () => {
        console.log(`WebSocket disconnected: ${connectionId}`)
        this.stopHeartbeat(connectionId)
        this.reconnect(connectionId, url, userId)
        
        this.notifySubscribers(connectionId, {
          type: 'connection_status',
          status: 'disconnected',
          connectionId
        })
      }

      ws.onerror = (error) => {
        console.error(`WebSocket error for ${connectionId}:`, error)
        this.notifySubscribers(connectionId, {
          type: 'connection_error',
          error: error.message,
          connectionId
        })
      }

    } catch (error) {
      console.error(`Failed to create WebSocket connection ${connectionId}:`, error)
    }
  }

  reconnect(connectionId, url, userId) {
    const attempts = this.reconnectAttempts.get(connectionId) || 0
    
    if (attempts < this.maxReconnectAttempts) {
      const timeout = Math.pow(2, attempts) * 1000
      this.reconnectAttempts.set(connectionId, attempts + 1)
      
      setTimeout(() => {
        console.log(`Reconnecting ${connectionId}... Attempt ${attempts + 1}`)
        this.connect(connectionId, url, userId)
      }, timeout)
    } else {
      console.log(`Max reconnection attempts reached for ${connectionId}`)
      this.notifySubscribers(connectionId, {
        type: 'connection_failed',
        connectionId
      })
    }
  }

  subscribe(connectionId, callback) {
    if (!this.subscribers.has(connectionId)) {
      this.subscribers.set(connectionId, new Set())
    }
    this.subscribers.get(connectionId).add(callback)
    
    return () => {
      const connectionSubscribers = this.subscribers.get(connectionId)
      if (connectionSubscribers) {
        connectionSubscribers.delete(callback)
      }
    }
  }

  notifySubscribers(connectionId, message) {
    const connectionSubscribers = this.subscribers.get(connectionId)
    if (connectionSubscribers) {
      connectionSubscribers.forEach(callback => {
        try {
          callback(message)
        } catch (error) {
          console.error(`Subscriber error for ${connectionId}:`, error)
        }
      })
    }
  }

  send(connectionId, message) {
    const ws = this.connections.get(connectionId)
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
      return true
    }
    return false
  }

  startHeartbeat(connectionId) {
    const interval = setInterval(() => {
      if (!this.send(connectionId, { type: 'ping' })) {
        clearInterval(interval)
      }
    }, 30000) // 30 seconds

    this.heartbeatInterval = interval
  }

  stopHeartbeat(connectionId) {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  disconnect(connectionId) {
    const ws = this.connections.get(connectionId)
    if (ws) {
      ws.close()
      this.connections.delete(connectionId)
    }
    
    this.stopHeartbeat(connectionId)
    this.subscribers.delete(connectionId)
    this.reconnectAttempts.delete(connectionId)
  }

  disconnectAll() {
    for (const connectionId of this.connections.keys()) {
      this.disconnect(connectionId)
    }
  }
}

const useRealTimeStore = create((set, get) => ({
  // WebSocket Manager
  wsManager: new EnhancedWebSocketManager(),
  
  // Connection State
  connections: new Map(),
  connectionStatus: {},
  
  // Real-time Features
  liveCollaboration: {
    activeUsers: [],
    cursors: {},
    selections: {},
    documents: {}
  },
  
  // Live Analytics
  realTimeMetrics: {
    activeUsers: 0,
    messagesPerSecond: 0,
    systemLoad: 0,
    responseTime: 0
  },
  
  // Notifications
  notifications: [],
  unreadCount: 0,
  
  // System Status
  systemStatus: {
    backend: 'online',
    database: 'online',
    ai_services: 'online',
    websocket: 'connecting'
  },
  
  loading: false,
  error: null,

  // Initialize Real-time Features
  initialize: async (userId) => {
    try {
      set({ loading: true })
      
      // Connect to main WebSocket
      const mainWsUrl = `ws://localhost:8001/ws/${userId}`
      get().wsManager.connect('main', mainWsUrl, userId)
      
      // Subscribe to main connection
      get().wsManager.subscribe('main', (message) => {
        get().handleMainWebSocketMessage(message)
      })
      
      // Connect to collaboration WebSocket
      const collaborationWsUrl = `ws://localhost:8001/collaboration/ws/${userId}`
      get().wsManager.connect('collaboration', collaborationWsUrl, userId)
      
      // Subscribe to collaboration connection
      get().wsManager.subscribe('collaboration', (message) => {
        get().handleCollaborationMessage(message)
      })
      
      // Connect to analytics WebSocket for real-time metrics
      const analyticsWsUrl = `ws://localhost:8001/analytics/ws/${userId}`
      get().wsManager.connect('analytics', analyticsWsUrl, userId)
      
      // Subscribe to analytics connection
      get().wsManager.subscribe('analytics', (message) => {
        get().handleAnalyticsMessage(message)
      })
      
      set({ 
        loading: false,
        systemStatus: {
          ...get().systemStatus,
          websocket: 'connected'
        }
      })
      
      // Start periodic system status checks
      get().startSystemStatusMonitoring()
      
      toast.success('Real-time features connected!', {
        duration: 3000,
        icon: '🔗'
      })
      
      return { success: true }
    } catch (error) {
      const errorMsg = error.message || 'Failed to initialize real-time features'
      set({ 
        error: errorMsg, 
        loading: false,
        systemStatus: {
          ...get().systemStatus,
          websocket: 'error'
        }
      })
      return { success: false, error: errorMsg }
    }
  },

  // Handle main WebSocket messages
  handleMainWebSocketMessage: (message) => {
    const { type, data } = message
    
    switch (type) {
      case 'connection_status':
        set(state => ({
          connectionStatus: {
            ...state.connectionStatus,
            main: data.status
          }
        }))
        break
        
      case 'system_notification':
        get().addNotification({
          id: Date.now(),
          type: data.type || 'info',
          title: data.title,
          message: data.message,
          timestamp: new Date().toISOString(),
          read: false
        })
        break
        
      case 'user_activity':
        set(state => ({
          realTimeMetrics: {
            ...state.realTimeMetrics,
            activeUsers: data.activeUsers || state.realTimeMetrics.activeUsers
          }
        }))
        break
        
      case 'system_metrics':
        set(state => ({
          realTimeMetrics: {
            ...state.realTimeMetrics,
            ...data
          }
        }))
        break
        
      default:
        console.log('Unhandled main WebSocket message:', type, data)
    }
  },

  // Handle collaboration WebSocket messages
  handleCollaborationMessage: (message) => {
    const { type, data } = message
    
    switch (type) {
      case 'user_joined':
        set(state => ({
          liveCollaboration: {
            ...state.liveCollaboration,
            activeUsers: [
              ...state.liveCollaboration.activeUsers.filter(u => u.id !== data.user.id),
              data.user
            ]
          }
        }))
        
        if (data.user.id !== get().currentUserId) {
          toast.success(`${data.user.name} joined the session`, { icon: '👋' })
        }
        break
        
      case 'user_left':
        set(state => ({
          liveCollaboration: {
            ...state.liveCollaboration,
            activeUsers: state.liveCollaboration.activeUsers.filter(u => u.id !== data.user.id)
          }
        }))
        break
        
      case 'cursor_update':
        set(state => ({
          liveCollaboration: {
            ...state.liveCollaboration,
            cursors: {
              ...state.liveCollaboration.cursors,
              [data.userId]: data.cursor
            }
          }
        }))
        break
        
      case 'selection_update':
        set(state => ({
          liveCollaboration: {
            ...state.liveCollaboration,
            selections: {
              ...state.liveCollaboration.selections,
              [data.userId]: data.selection
            }
          }
        }))
        break
        
      case 'document_change':
        get().handleDocumentChange(data)
        break
        
      default:
        console.log('Unhandled collaboration message:', type, data)
    }
  },

  // Handle analytics WebSocket messages
  handleAnalyticsMessage: (message) => {
    const { type, data } = message
    
    switch (type) {
      case 'real_time_metrics':
        set(state => ({
          realTimeMetrics: {
            ...state.realTimeMetrics,
            ...data
          }
        }))
        break
        
      case 'performance_alert':
        get().addNotification({
          id: Date.now(),
          type: 'warning',
          title: 'Performance Alert',
          message: data.message,
          timestamp: new Date().toISOString(),
          read: false,
          category: 'performance'
        })
        break
        
      case 'user_behavior':
        // Handle user behavior analytics
        console.log('User behavior data:', data)
        break
        
      default:
        console.log('Unhandled analytics message:', type, data)
    }
  },

  // Document Collaboration
  handleDocumentChange: (data) => {
    const { documentId, changes, userId, timestamp } = data
    
    set(state => ({
      liveCollaboration: {
        ...state.liveCollaboration,
        documents: {
          ...state.liveCollaboration.documents,
          [documentId]: {
            ...state.liveCollaboration.documents[documentId],
            lastChange: {
              changes,
              userId,
              timestamp
            }
          }
        }
      }
    }))
  },

  joinCollaborationSession: (sessionId, documentId) => {
    const success = get().wsManager.send('collaboration', {
      type: 'join_session',
      sessionId,
      documentId
    })
    
    if (success) {
      toast.success('Joined collaboration session', { icon: '🤝' })
    }
  },

  leaveCollaborationSession: (sessionId) => {
    const success = get().wsManager.send('collaboration', {
      type: 'leave_session',
      sessionId
    })
    
    if (success) {
      toast.success('Left collaboration session', { icon: '👋' })
    }
  },

  broadcastCursorPosition: (documentId, position) => {
    get().wsManager.send('collaboration', {
      type: 'cursor_update',
      documentId,
      position
    })
  },

  broadcastSelection: (documentId, selection) => {
    get().wsManager.send('collaboration', {
      type: 'selection_update', 
      documentId,
      selection
    })
  },

  broadcastDocumentChange: (documentId, changes) => {
    get().wsManager.send('collaboration', {
      type: 'document_change',
      documentId,
      changes,
      timestamp: new Date().toISOString()
    })
  },

  // Notifications Management
  addNotification: (notification) => {
    set(state => ({
      notifications: [notification, ...state.notifications.slice(0, 49)], // Keep last 50
      unreadCount: state.unreadCount + 1
    }))
    
    // Show toast for important notifications
    if (notification.type === 'error' || notification.type === 'warning') {
      toast.error(notification.message, {
        duration: 5000,
        icon: notification.type === 'error' ? '❌' : '⚠️'
      })
    }
  },

  markNotificationAsRead: (notificationId) => {
    set(state => ({
      notifications: state.notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1)
    }))
  },

  markAllNotificationsAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0
    }))
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 })
  },

  // System Status Monitoring
  startSystemStatusMonitoring: () => {
    const checkInterval = setInterval(async () => {
      try {
        const response = await axios.get('/api/health')
        const systemData = response.data
        
        set(state => ({
          systemStatus: {
            ...state.systemStatus,
            backend: systemData.status === 'healthy' ? 'online' : 'degraded',
            database: systemData.services?.database === 'connected' ? 'online' : 'offline',
            ai_services: systemData.services?.ai === 'available' ? 'online' : 'offline'
          },
          realTimeMetrics: {
            ...state.realTimeMetrics,
            responseTime: Date.now() - checkInterval
          }
        }))
        
      } catch (error) {
        console.error('System status check failed:', error)
        set(state => ({
          systemStatus: {
            ...state.systemStatus,
            backend: 'offline'
          }
        }))
      }
    }, 30000) // Check every 30 seconds
    
    return () => clearInterval(checkInterval)
  },

  // Real-time Analytics
  fetchLiveMetrics: async () => {
    try {
      const response = await axios.get('/api/performance/metrics')
      const metrics = response.data
      
      set(state => ({
        realTimeMetrics: {
          ...state.realTimeMetrics,
          systemLoad: metrics.system?.cpu || 0,
          memoryUsage: metrics.system?.memory || 0,
          activeConnections: metrics.connections?.active || 0,
          responseTime: metrics.response_time?.average || 0
        }
      }))
      
      return { success: true, metrics }
    } catch (error) {
      console.error('Failed to fetch live metrics:', error)
      return { success: false, error: error.message }
    }
  },

  // Connection Management
  reconnectConnection: (connectionId) => {
    const connection = get().connections.get(connectionId)
    if (connection) {
      get().wsManager.reconnect(connectionId, connection.url, connection.userId)
    }
  },

  getConnectionStatus: (connectionId) => {
    return get().connectionStatus[connectionId] || 'disconnected'
  },

  // Cleanup
  disconnect: () => {
    get().wsManager.disconnectAll()
    set({
      connections: new Map(),
      connectionStatus: {},
      liveCollaboration: {
        activeUsers: [],
        cursors: {},
        selections: {},
        documents: {}
      },
      systemStatus: {
        ...get().systemStatus,
        websocket: 'disconnected'
      }
    })
  },

  // Utility
  clearError: () => set({ error: null }),
  
  setCurrentUserId: (userId) => set({ currentUserId: userId })
}))

export { useRealTimeStore }