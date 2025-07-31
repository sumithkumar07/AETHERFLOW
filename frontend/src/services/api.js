import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials)
    return response.data
  },
  
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData)
    return response.data
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me')
    return response.data
  },
  
  refreshToken: async () => {
    const response = await api.post('/api/auth/refresh')
    return response.data
  }
}

// AI API
export const aiAPI = {
  chat: async (message, conversationId = null, context = null) => {
    const response = await api.post('/api/ai/chat', {
      message,
      conversation_id: conversationId,
      context
    })
    return response.data
  },
  
  getConversations: async (limit = 20, offset = 0) => {
    const response = await api.get(`/api/ai/conversations?limit=${limit}&offset=${offset}`)
    return response.data
  },
  
  getConversation: async (conversationId) => {
    const response = await api.get(`/api/ai/conversations/${conversationId}`)
    return response.data
  },
  
  deleteConversation: async (conversationId) => {
    const response = await api.delete(`/api/ai/conversations/${conversationId}`)
    return response.data
  },
  
  createConversation: async (title, projectId = null) => {
    const response = await api.post('/api/ai/conversations', {
      title,
      project_id: projectId
    })
    return response.data
  }
}

// Projects API
export const projectsAPI = {
  getProjects: async (limit = 20, offset = 0, status = null) => {
    const params = new URLSearchParams({ limit, offset })
    if (status) params.append('status', status)
    
    const response = await api.get(`/api/projects?${params}`)
    return response.data
  },
  
  getProject: async (projectId) => {
    const response = await api.get(`/api/projects/${projectId}`)
    return response.data
  },
  
  createProject: async (projectData) => {
    const response = await api.post('/api/projects', projectData)
    return response.data
  },
  
  updateProject: async (projectId, updateData) => {
    const response = await api.put(`/api/projects/${projectId}`, updateData)
    return response.data
  },
  
  deleteProject: async (projectId) => {
    const response = await api.delete(`/api/projects/${projectId}`)
    return response.data
  },
  
  buildProject: async (projectId) => {
    const response = await api.post(`/api/projects/${projectId}/build`)
    return response.data
  },
  
  deployProject: async (projectId) => {
    const response = await api.post(`/api/projects/${projectId}/deploy`)
    return response.data
  },
  
  getProjectFiles: async (projectId) => {
    const response = await api.get(`/api/projects/${projectId}/files`)
    return response.data
  },
  
  saveProjectFile: async (projectId, fileData) => {
    const response = await api.post(`/api/projects/${projectId}/files`, fileData)
    return response.data
  }
}

// Templates API
export const templatesAPI = {
  getTemplates: async (category = null, featured = null, search = null, limit = 20, offset = 0) => {
    const params = new URLSearchParams({ limit, offset })
    if (category) params.append('category', category)
    if (featured !== null) params.append('featured', featured)
    if (search) params.append('search', search)
    
    const response = await api.get(`/api/templates?${params}`)
    return response.data
  },
  
  getTemplate: async (templateId) => {
    const response = await api.get(`/api/templates/${templateId}`)
    return response.data
  },
  
  getFeaturedTemplates: async () => {
    const response = await api.get('/api/templates/featured')
    return response.data
  },
  
  getTemplateCategories: async () => {
    const response = await api.get('/api/templates/categories')
    return response.data
  },
  
  useTemplate: async (templateId) => {
    const response = await api.post(`/api/templates/${templateId}/use`)
    return response.data
  },
  
  createTemplate: async (templateData) => {
    const response = await api.post('/api/templates', templateData)
    return response.data
  },
  
  getUserTemplates: async () => {
    const response = await api.get('/api/templates/user/my-templates')
    return response.data
  }
}

// Integrations API
export const integrationsAPI = {
  getIntegrations: async (category = null, popularOnly = false, freeOnly = false) => {
    const params = new URLSearchParams()
    if (category) params.append('category', category)
    if (popularOnly) params.append('popular_only', 'true')
    if (freeOnly) params.append('free_only', 'true')
    
    const response = await api.get(`/api/integrations?${params}`)
    return response.data
  },
  
  getIntegration: async (integrationId) => {
    const response = await api.get(`/api/integrations/${integrationId}`)
    return response.data
  },
  
  getPopularIntegrations: async () => {
    const response = await api.get('/api/integrations/popular')
    return response.data
  },
  
  getIntegrationCategories: async () => {
    const response = await api.get('/api/integrations/categories')
    return response.data
  },
  
  configureIntegration: async (integrationId, config) => {
    const response = await api.post(`/api/integrations/${integrationId}/configure`, {
      integration_id: integrationId,
      config,
      is_active: true
    })
    return response.data
  },
  
  getUserIntegrations: async () => {
    const response = await api.get('/api/integrations/user/configured')
    return response.data
  },
  
  removeIntegration: async (integrationId) => {
    const response = await api.delete(`/api/integrations/${integrationId}/configure`)
    return response.data
  },
  
  testIntegration: async (integrationId) => {
    const response = await api.post(`/api/integrations/${integrationId}/test`)
    return response.data
  }
}

// WebSocket connection
export class WebSocketService {
  constructor() {
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.listeners = new Map()
  }
  
  connect(clientId) {
    const wsUrl = `${import.meta.env.REACT_APP_WS_URL || 'ws://localhost:8001'}/ws/${clientId}`
    
    this.ws = new WebSocket(wsUrl)
    
    this.ws.onopen = () => {
      console.log('WebSocket connected')
      this.reconnectAttempts = 0
      this.emit('connected')
    }
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.emit('message', data)
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }
    
    this.ws.onclose = () => {
      console.log('WebSocket disconnected')
      this.emit('disconnected')
      this.reconnect(clientId)
    }
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      this.emit('error', error)
    }
  }
  
  reconnect(clientId) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        this.connect(clientId)
      }, this.reconnectDelay * this.reconnectAttempts)
    }
  }
  
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }
  
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }
  
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }
  
  emit(event, data = null) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data))
    }
  }
  
  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

export const websocketService = new WebSocketService()

export default api