import { create } from 'zustand'
import axios from 'axios'
import toast from 'react-hot-toast'

/**
 * Collaboration Store - Real-time collaboration features
 * Utilizes: /api/collaboration/* endpoints and WebSocket connections
 */
const useCollaborationStore = create((set, get) => ({
  // Collaboration State
  activeDocuments: {},
  collaborators: {},
  presence: {},
  operations: [],
  conflicts: [],
  snapshots: {},
  
  // WebSocket State
  connections: {},
  connectionStatus: 'disconnected',
  
  // Activity State
  recentActivity: [],
  onlineUsers: [],
  
  loading: false,
  error: null,

  // Document Operations
  applyOperation: async (documentId, operationData) => {
    try {
      const response = await axios.post(`/collaboration/documents/${documentId}/operations`, operationData)
      
      const operation = {
        id: `op_${Date.now()}`,
        documentId,
        ...operationData,
        result: response.data.result,
        timestamp: new Date().toISOString()
      }
      
      set(state => ({
        operations: [...state.operations, operation]
      }))
      
      return { success: true, operation, result: response.data.result }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Operation failed'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  getDocument: async (documentId) => {
    try {
      set({ loading: true })
      
      const response = await axios.get(`/collaboration/documents/${documentId}`)
      
      set(state => ({
        activeDocuments: {
          ...state.activeDocuments,
          [documentId]: response.data.data
        },
        loading: false
      }))
      
      return { success: true, document: response.data.data }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to get document'
      set({ error: errorMsg, loading: false })
      return { success: false, error: errorMsg }
    }
  },

  updatePresence: async (documentId, presenceData) => {
    try {
      const response = await axios.post(`/collaboration/documents/${documentId}/presence`, presenceData)
      
      set(state => ({
        presence: {
          ...state.presence,
          [documentId]: response.data.presence
        },
        collaborators: {
          ...state.collaborators,
          [documentId]: response.data.collaborators
        }
      }))
      
      return { success: true, presence: response.data.presence }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to update presence'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  getCollaborators: async (documentId) => {
    try {
      const response = await axios.get(`/collaboration/documents/${documentId}/collaborators`)
      
      set(state => ({
        collaborators: {
          ...state.collaborators,
          [documentId]: response.data.collaborators
        }
      }))
      
      return { success: true, collaborators: response.data.collaborators }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to get collaborators'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  createSnapshot: async (documentId, description) => {
    try {
      const response = await axios.post(`/collaboration/documents/${documentId}/snapshots`, {
        description
      })
      
      const snapshot = {
        id: `snap_${Date.now()}`,
        documentId,
        description,
        ...response.data.snapshot,
        timestamp: new Date().toISOString()
      }
      
      set(state => ({
        snapshots: {
          ...state.snapshots,
          [documentId]: [...(state.snapshots[documentId] || []), snapshot]
        }
      }))
      
      toast.success('Snapshot created successfully')
      return { success: true, snapshot }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to create snapshot'
      set({ error: errorMsg })
      toast.error(errorMsg)
      return { success: false, error: errorMsg }
    }
  },

  resolveConflicts: async (documentId, conflictingOperations) => {
    try {
      const response = await axios.post(`/collaboration/documents/${documentId}/conflicts/resolve`, {
        conflicting_operations: conflictingOperations
      })
      
      // Remove resolved conflicts from local state
      set(state => ({
        conflicts: state.conflicts.filter(c => c.documentId !== documentId)
      }))
      
      toast.success('Conflicts resolved successfully')
      return { success: true, resolution: response.data.resolution }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to resolve conflicts'
      set({ error: errorMsg })
      toast.error(errorMsg)
      return { success: false, error: errorMsg }
    }
  },

  // WebSocket Management
  connectToDocument: (documentId) => {
    try {
      const wsUrl = `ws://localhost:8001/api/collaboration/documents/${documentId}/ws`
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        set(state => ({
          connections: {
            ...state.connections,
            [documentId]: ws
          },
          connectionStatus: 'connected'
        }))
        
        console.log(`Connected to document ${documentId}`)
      }
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        get().handleWebSocketMessage(documentId, data)
      }
      
      ws.onclose = () => {
        set(state => {
          const newConnections = { ...state.connections }
          delete newConnections[documentId]
          return {
            connections: newConnections,
            connectionStatus: Object.keys(newConnections).length > 0 ? 'connected' : 'disconnected'
          }
        })
        
        console.log(`Disconnected from document ${documentId}`)
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        set({ error: 'WebSocket connection error' })
      }
      
      return { success: true, connection: ws }
    } catch (error) {
      console.error('Failed to connect to document:', error)
      return { success: false, error: 'Connection failed' }
    }
  },

  disconnectFromDocument: (documentId) => {
    const state = get()
    const connection = state.connections[documentId]
    
    if (connection) {
      connection.close()
      
      set(state => {
        const newConnections = { ...state.connections }
        delete newConnections[documentId]
        return { connections: newConnections }
      })
      
      return { success: true }
    }
    
    return { success: false, error: 'No active connection' }
  },

  handleWebSocketMessage: (documentId, data) => {
    const { type, ...payload } = data
    
    switch (type) {
      case 'operation_result':
        // Handle operation results
        set(state => ({
          operations: [...state.operations, {
            id: `ws_op_${Date.now()}`,
            documentId,
            ...payload.result,
            timestamp: payload.timestamp
          }]
        }))
        break
        
      case 'presence_update':
        // Handle presence updates
        set(state => ({
          presence: {
            ...state.presence,
            [documentId]: payload.presence
          },
          collaborators: {
            ...state.collaborators,
            [documentId]: payload.collaborators
          }
        }))
        break
        
      case 'cursor_update':
        // Handle cursor position updates
        set(state => ({
          presence: {
            ...state.presence,
            [documentId]: {
              ...state.presence[documentId],
              cursors: {
                ...state.presence[documentId]?.cursors,
                [payload.user_id]: {
                  position: payload.position,
                  timestamp: payload.timestamp
                }
              }
            }
          }
        }))
        break
        
      case 'conflict':
        // Handle conflicts
        set(state => ({
          conflicts: [...state.conflicts, {
            id: `conflict_${Date.now()}`,
            documentId,
            ...payload,
            timestamp: new Date().toISOString()
          }]
        }))
        toast.warning('Conflict detected in collaborative document')
        break
        
      case 'error':
        set({ error: payload.message })
        toast.error(payload.message)
        break
        
      default:
        console.log('Unhandled WebSocket message type:', type)
    }
  },

  sendWebSocketMessage: (documentId, message) => {
    const connection = get().connections[documentId]
    
    if (connection && connection.readyState === WebSocket.OPEN) {
      connection.send(JSON.stringify(message))
      return { success: true }
    }
    
    return { success: false, error: 'No active connection' }
  },

  // Activity Management
  fetchActiveSessions: async () => {
    try {
      const response = await axios.get('/collaboration/sessions/active')
      
      set({ 
        recentActivity: response.data.active_sessions.map(session => ({
          ...session,
          type: 'active_session'
        }))
      })
      
      return { success: true, sessions: response.data.active_sessions }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch active sessions'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  fetchCollaborationHistory: async () => {
    try {
      const response = await axios.get('/collaboration/history')
      
      set(state => ({
        recentActivity: [...state.recentActivity, ...response.data.history.map(item => ({
          ...item,
          type: 'history'
        }))]
      }))
      
      return { success: true, history: response.data.history }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch collaboration history'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  // Real-time Operations
  insertText: (documentId, position, text) => {
    const operationData = {
      operation_type: 'insert',
      position,
      content: text,
      document_version: get().activeDocuments[documentId]?.version || 0
    }
    
    // Send via WebSocket for real-time update
    get().sendWebSocketMessage(documentId, {
      type: 'operation',
      operation: operationData
    })
    
    // Also apply via REST API for persistence
    return get().applyOperation(documentId, operationData)
  },

  deleteText: (documentId, position, length) => {
    const operationData = {
      operation_type: 'delete',
      position,
      content: '', // For delete operations
      length,
      document_version: get().activeDocuments[documentId]?.version || 0
    }
    
    get().sendWebSocketMessage(documentId, {
      type: 'operation',
      operation: operationData
    })
    
    return get().applyOperation(documentId, operationData)
  },

  updateCursor: (documentId, position) => {
    get().sendWebSocketMessage(documentId, {
      type: 'cursor',
      position,
      timestamp: new Date().toISOString()
    })
  },

  updateUserPresence: (documentId, presenceData) => {
    get().sendWebSocketMessage(documentId, {
      type: 'presence',
      activity: presenceData
    })
    
    return get().updatePresence(documentId, presenceData)
  },

  // Utility Functions
  getDocumentCollaborators: (documentId) => {
    return get().collaborators[documentId] || []
  },

  getDocumentPresence: (documentId) => {
    return get().presence[documentId] || {}
  },

  getActiveConnection: (documentId) => {
    return get().connections[documentId]
  },

  isConnectedToDocument: (documentId) => {
    const connection = get().connections[documentId]
    return connection && connection.readyState === WebSocket.OPEN
  },

  getConflictsForDocument: (documentId) => {
    return get().conflicts.filter(conflict => conflict.documentId === documentId)
  },

  getSnapshotsForDocument: (documentId) => {
    return get().snapshots[documentId] || []
  },

  clearError: () => set({ error: null }),

  // Cleanup
  disconnectAll: () => {
    const connections = get().connections
    
    Object.keys(connections).forEach(documentId => {
      get().disconnectFromDocument(documentId)
    })
    
    set({
      connections: {},
      connectionStatus: 'disconnected'
    })
  },

  // Initialize Collaboration Services
  initialize: async () => {
    try {
      set({ loading: true })
      
      await Promise.all([
        get().fetchActiveSessions(),
        get().fetchCollaborationHistory()
      ])
      
      set({ loading: false })
      return { success: true }
    } catch (error) {
      set({ error: 'Failed to initialize collaboration services', loading: false })
      return { success: false }
    }
  }
}))

export { useCollaborationStore }