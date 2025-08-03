import { create } from 'zustand'
import axios from 'axios'
import toast from 'react-hot-toast'

// Real-time WebSocket connection for enhanced chat
class WebSocketManager {
  constructor() {
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectTimeout = null
    this.subscribers = new Set()
  }

  connect(userId) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return

    try {
      const wsUrl = `ws://localhost:8001/ws/${userId}`
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected for real-time chat')
        this.reconnectAttempts = 0
        toast.success('Real-time chat connected', { 
          duration: 2000,
          icon: '🔗'
        })
      }

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          this.notifySubscribers(message)
        } catch (error) {
          console.error('WebSocket message parse error:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.reconnect(userId)
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    } catch (error) {
      console.error('WebSocket connection error:', error)
    }
  }

  reconnect(userId) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      this.reconnectTimeout = setTimeout(() => {
        console.log(`Reconnecting WebSocket... Attempt ${this.reconnectAttempts}`)
        this.connect(userId)
      }, Math.pow(2, this.reconnectAttempts) * 1000)
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  notifySubscribers(message) {
    this.subscribers.forEach(callback => {
      try {
        callback(message)
      } catch (error) {
        console.error('WebSocket subscriber error:', error)
      }
    })
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }
    if (this.ws) {
      this.ws.close()
    }
    this.subscribers.clear()
  }
}

// Enhanced AI Models with real backend integration
const AI_MODELS = {
  'codellama:13b': {
    name: 'CodeLlama 13B',
    provider: 'Meta (Local)',
    icon: '🔧',
    description: 'Specialized for code generation, debugging, and software architecture',
    capabilities: ['code', 'debugging', 'architecture', 'best-practices'],
    speed: 'medium',
    quality: 'highest',
    cost: 'free',
    unlimited: true,
    local: true,
    color: 'from-blue-500 to-cyan-500'
  },
  'llama3.1:8b': {
    name: 'LLaMA 3.1 8B',
    provider: 'Meta (Local)', 
    icon: '🧠',
    description: 'Excellent general-purpose model for various tasks',
    capabilities: ['general', 'analysis', 'creative', 'reasoning'],
    speed: 'fast',
    quality: 'high',
    cost: 'free',
    unlimited: true,
    local: true,
    color: 'from-green-500 to-teal-500'
  },
  'deepseek-coder:6.7b': {
    name: 'DeepSeek Coder 6.7B',
    provider: 'DeepSeek (Local)',
    icon: '⚡',
    description: 'Fast responses for quick coding tasks and completion',
    capabilities: ['code', 'completion', 'quick-fixes', 'snippets'],
    speed: 'fastest',
    quality: 'high',
    cost: 'free',
    unlimited: true,
    local: true,
    color: 'from-purple-500 to-pink-500'
  }
}

// Enhanced AI Agents with specialized capabilities
const AI_AGENTS = {
  developer: {
    name: 'Developer Agent',
    icon: '💻',
    description: 'Expert in coding, debugging, and software architecture using CodeLlama',
    capabilities: ['Full-stack development', 'Code review', 'Architecture', 'Debugging'],
    recommended_model: 'codellama:13b',
    color: 'blue',
    prompt: 'You are an expert software developer with deep knowledge of modern web technologies, best practices, and architectural patterns. Help users build high-quality applications.'
  },
  architect: {
    name: 'System Architect',
    icon: '🏗️',
    description: 'AI-powered architectural intelligence and system design expert',
    capabilities: ['System Architecture', 'Scalability Design', 'Performance Optimization', 'Database Design'],
    recommended_model: 'codellama:13b',
    color: 'indigo',
    prompt: 'You are a senior system architect focused on scalable, maintainable, and performant system design. Provide architectural guidance and best practices.'
  },
  designer: {
    name: 'UI/UX Designer',
    icon: '🎨',
    description: 'UI/UX design specialist with modern design principles using LLaMA',
    capabilities: ['UI/UX Design', 'Design Systems', 'User Research', 'Prototyping'],
    recommended_model: 'llama3.1:8b',
    color: 'pink',
    prompt: 'You are a creative UI/UX designer with expertise in modern design principles, user experience, and design systems. Help create beautiful and functional interfaces.'
  },
  analyst: {
    name: 'Business Analyst',
    icon: '📊',
    description: 'Business requirements and data analysis expert using LLaMA',
    capabilities: ['Requirements Analysis', 'Data Analysis', 'Process Optimization', 'Reporting'],
    recommended_model: 'llama3.1:8b',
    color: 'green',
    prompt: 'You are a business analyst expert in gathering requirements, analyzing data, and optimizing business processes. Help translate business needs into technical solutions.'
  },
  tester: {
    name: 'QA Specialist',
    icon: '🧪',
    description: 'Quality assurance and testing specialist using CodeLlama',
    capabilities: ['Test Strategy', 'Automation', 'Bug Analysis', 'Performance Testing'],
    recommended_model: 'codellama:13b',
    color: 'yellow',
    prompt: 'You are a QA specialist focused on comprehensive testing strategies, automation, and quality assurance. Help ensure high-quality software delivery.'
  }
}

const useEnhancedChatStore = create((set, get) => ({
  // Enhanced State
  messages: [],
  conversations: [],
  currentConversation: null,
  conversationContext: [],
  
  // AI Configuration
  selectedModel: 'codellama:13b',
  selectedAgent: 'developer',
  availableModels: [],
  modelStatus: {},
  
  // Enhanced Features
  streamingResponse: null,
  isStreaming: false,
  aiThinking: false,
  typingIndicator: false,
  
  // Real-time Features
  wsManager: new WebSocketManager(),
  realTimeEnabled: false,
  collaborators: [],
  
  // Analytics & Insights
  conversationAnalytics: {
    totalMessages: 0,
    avgResponseTime: 0,
    modelUsage: {},
    topTopics: [],
    satisfactionScore: 4.8
  },
  
  // Smart Features
  smartSuggestions: [],
  contextualHelp: [],
  codeAnalysis: null,
  autoComplete: '',
  
  loading: false,
  error: null,

  // Enhanced Initialization
  initialize: async (userId) => {
    try {
      set({ loading: true })
      
      // Fetch available models and their status
      const modelsResponse = await axios.get('/api/ai/models')
      const agentsResponse = await axios.get('/api/ai/agents')
      const statusResponse = await axios.get('/api/ai/status')
      
      set({
        availableModels: modelsResponse.data.models,
        modelStatus: statusResponse.data,
        loading: false
      })
      
      // Initialize WebSocket for real-time features
      if (userId) {
        get().wsManager.connect(userId)
        get().wsManager.subscribe((message) => {
          get().handleWebSocketMessage(message)
        })
        set({ realTimeEnabled: true })
      }
      
      // Load conversation analytics
      get().loadConversationAnalytics()
      
      toast.success('Enhanced AI Chat initialized!', {
        duration: 3000,
        icon: '🚀'
      })
      
      return { success: true }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to initialize enhanced chat'
      set({ error: errorMsg, loading: false })
      return { success: false, error: errorMsg }
    }
  },

  // Enhanced Message Sending with Streaming
  sendMessage: async (messageData) => {
    const startTime = Date.now()
    
    try {
      set({ 
        loading: true, 
        aiThinking: true,
        typingIndicator: true,
        error: null,
        streamingResponse: null,
        isStreaming: false
      })
      
      // Add user message immediately
      const userMessage = {
        id: `user_${Date.now()}`,
        content: messageData.content,
        sender: 'user',
        timestamp: new Date().toISOString(),
        model: messageData.model || get().selectedModel,
        agent: messageData.agent || get().selectedAgent,
        metadata: {
          wordCount: messageData.content.split(' ').length,
          hasCode: messageData.content.includes('```'),
          codeBlocks: get().extractCodeBlocks(messageData.content)
        }
      }
      
      set(state => ({
        messages: [...state.messages, userMessage],
        conversationContext: [...state.conversationContext.slice(-10), userMessage]
      }))
      
      // Prepare enhanced request with full context
      const requestPayload = {
        message: messageData.content,
        model: messageData.model || get().selectedModel,
        agent: messageData.agent || get().selectedAgent,
        project_id: messageData.projectId,
        conversation_id: get().currentConversation?.id,
        context: get().conversationContext.slice(-5),
        agent_prompt: AI_AGENTS[messageData.agent || get().selectedAgent]?.prompt,
        enhanced_features: {
          code_analysis: true,
          context_awareness: true,
          follow_up_suggestions: true,
          smart_completions: true,
          streaming: true,
          real_time: get().realTimeEnabled
        }
      }
      
      // Send via WebSocket for real-time streaming if available
      if (get().realTimeEnabled && get().wsManager.ws?.readyState === WebSocket.OPEN) {
        get().wsManager.send({
          type: 'chat',
          ...requestPayload
        })
        
        set({ 
          isStreaming: true,
          streamingResponse: ''
        })
      } else {
        // Fallback to HTTP request
        const response = await axios.post('/api/ai/chat', requestPayload)
        get().handleChatResponse(response.data, startTime)
      }
      
      return { success: true }
      
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to send message'
      set({ 
        error: errorMessage, 
        loading: false,
        aiThinking: false,
        typingIndicator: false,
        isStreaming: false
      })
      
      toast.error(errorMessage, { duration: 5000 })
      return { success: false, error: errorMessage }
    }
  },

  // Handle WebSocket messages for real-time features
  handleWebSocketMessage: (message) => {
    const { type, content, metadata } = message
    
    switch (type) {
      case 'ai_response':
        get().handleChatResponse(message, Date.now())
        break
        
      case 'streaming_chunk':
        set(state => ({
          streamingResponse: (state.streamingResponse || '') + content,
          typingIndicator: true
        }))
        break
        
      case 'streaming_complete':
        const finalResponse = {
          response: get().streamingResponse,
          model_used: metadata?.model_used,
          confidence: metadata?.confidence || 0.95,
          suggestions: metadata?.suggestions || [],
          usage: metadata?.usage || {}
        }
        get().handleChatResponse(finalResponse, Date.now())
        set({ isStreaming: false, streamingResponse: null })
        break
        
      case 'collaboration':
        get().handleCollaborationMessage(message)
        break
        
      case 'typing_indicator':
        set({ typingIndicator: true })
        setTimeout(() => set({ typingIndicator: false }), 3000)
        break
        
      default:
        console.log('Unknown WebSocket message type:', type)
    }
  },

  // Handle chat response (both HTTP and WebSocket)
  handleChatResponse: (responseData, startTime) => {
    const responseTime = Date.now() - startTime
    
    const aiMessage = {
      id: `ai_${Date.now()}`,
      content: responseData.response,
      sender: 'assistant',
      timestamp: new Date().toISOString(),
      model: responseData.model_used || get().selectedModel,
      agent: get().selectedAgent,
      metadata: {
        responseTime,
        wordCount: responseData.response.split(' ').length,
        hasCode: responseData.response.includes('```'),
        confidence: responseData.confidence || 0.95,
        suggestions: responseData.suggestions || [],
        usage: responseData.usage || {},
        codeBlocks: get().extractCodeBlocks(responseData.response)
      }
    }
    
    set(state => ({
      messages: [...state.messages, aiMessage],
      conversationContext: [...state.conversationContext, aiMessage],
      loading: false,
      aiThinking: false,
      typingIndicator: false,
      smartSuggestions: responseData.suggestions || [],
      conversationAnalytics: {
        ...state.conversationAnalytics,
        totalMessages: state.conversationAnalytics.totalMessages + 1,
        avgResponseTime: (state.conversationAnalytics.avgResponseTime + responseTime) / 2
      }
    }))
    
    // Success feedback
    const model = AI_MODELS[responseData.model_used] || AI_MODELS[get().selectedModel]
    if (responseTime < 3000) {
      toast.success(`${model.name} responded in ${(responseTime / 1000).toFixed(1)}s`, {
        duration: 2000,
        icon: model.icon
      })
    }
  },

  // Enhanced Model Management
  fetchAvailableModels: async () => {
    try {
      const response = await axios.get('/api/ai/models')
      const statusResponse = await axios.get('/api/ai/status')
      
      set({
        availableModels: response.data.models,
        modelStatus: statusResponse.data
      })
      
      return { success: true, models: response.data.models }
    } catch (error) {
      console.error('Failed to fetch models:', error)
      return { success: false, error: error.message }
    }
  },

  downloadModel: async (modelName) => {
    try {
      set({ loading: true })
      
      toast.loading(`Downloading ${modelName}...`, { duration: 10000 })
      
      const response = await axios.post(`/api/ai/models/${modelName}/download`)
      
      set({ loading: false })
      
      if (response.data.success) {
        toast.success(`${modelName} downloaded successfully!`)
        get().fetchAvailableModels() // Refresh model status
      } else {
        toast.error(`Failed to download ${modelName}`)
      }
      
      return response.data
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Model download failed'
      set({ loading: false })
      toast.error(errorMsg)
      return { success: false, error: errorMsg }
    }
  },

  // Conversation Management
  fetchConversations: async (projectId) => {
    try {
      set({ loading: true })
      
      const queryParam = projectId ? `?project_id=${projectId}` : ''
      const response = await axios.get(`/api/ai/conversations${queryParam}`)
      
      const messages = response.data.messages || []
      const conversations = response.data.conversations || []
      
      set({
        messages: messages.map(msg => ({
          ...msg,
          metadata: {
            ...msg.metadata,
            codeBlocks: get().extractCodeBlocks(msg.content || '')
          }
        })),
        conversations,
        conversationContext: messages.slice(-10),
        loading: false
      })
      
      return { success: true, conversations }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch conversations'
      set({ error: errorMsg, loading: false })
      return { success: false, error: errorMsg }
    }
  },

  createConversation: async (projectId, title) => {
    try {
      const response = await axios.post('/api/ai/conversations', {
        project_id: projectId,
        title: title || `New Conversation`
      })
      
      const newConversation = response.data
      set(state => ({
        conversations: [newConversation, ...state.conversations],
        currentConversation: newConversation
      }))
      
      return { success: true, conversation: newConversation }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to create conversation'
      toast.error(errorMsg)
      return { success: false, error: errorMsg }
    }
  },

  // Advanced Features
  getSmartSuggestions: () => {
    const state = get()
    const lastMessage = state.messages[state.messages.length - 1]
    
    if (!lastMessage || lastMessage.sender !== 'assistant') {
      return state.smartSuggestions
    }
    
    return state.smartSuggestions.slice(0, 3)
  },

  generateCodeSuggestions: async (code, language) => {
    try {
      // This would integrate with advanced AI features
      const mockSuggestions = [
        {
          type: 'optimization',
          title: 'Performance Optimization',
          description: 'Use async/await for better performance',
          code: '// Optimized version\nawait fetchData()'
        },
        {
          type: 'security',
          title: 'Security Enhancement',
          description: 'Add input validation',
          code: '// Add validation\nif (!input || typeof input !== "string") throw new Error("Invalid input")'
        },
        {
          type: 'best-practice',
          title: 'Best Practice',
          description: 'Extract to reusable function',
          code: '// Extracted function\nconst processData = (data) => { ... }'
        }
      ]
      
      return { success: true, suggestions: mockSuggestions }
    } catch (error) {
      return { success: false, error: 'Failed to generate code suggestions' }
    }
  },

  analyzeConversation: async () => {
    const messages = get().messages
    const analysis = {
      messageCount: messages.length,
      averageMessageLength: messages.reduce((sum, msg) => sum + msg.content.length, 0) / messages.length,
      codeBlockCount: messages.reduce((sum, msg) => sum + (msg.metadata?.codeBlocks?.length || 0), 0),
      topTopics: ['React Development', 'API Integration', 'Database Design'],
      sentiment: 'positive',
      engagement: 'high'
    }
    
    set(state => ({
      conversationAnalytics: {
        ...state.conversationAnalytics,
        ...analysis
      }
    }))
    
    return analysis
  },

  // Collaboration Features
  handleCollaborationMessage: (message) => {
    const { projectId, collaborator, action, data } = message
    
    switch (action) {
      case 'join':
        set(state => ({
          collaborators: [...state.collaborators.filter(c => c.id !== collaborator.id), collaborator]
        }))
        toast.success(`${collaborator.name} joined the chat`, { icon: '👋' })
        break
        
      case 'leave':
        set(state => ({
          collaborators: state.collaborators.filter(c => c.id !== collaborator.id)
        }))
        break
        
      case 'typing':
        // Show typing indicator for collaborator
        toast.loading(`${collaborator.name} is typing...`, { duration: 2000 })
        break
        
      default:
        console.log('Unknown collaboration action:', action)
    }
  },

  // Utility Functions
  extractCodeBlocks: (content) => {
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g
    const blocks = []
    let match
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      blocks.push({
        language: match[1] || 'text',
        code: match[2].trim()
      })
    }
    
    return blocks
  },

  loadConversationAnalytics: async () => {
    // This would load real analytics from backend
    const mockAnalytics = {
      totalMessages: 145,
      avgResponseTime: 2.3,
      modelUsage: {
        'codellama:13b': 78,
        'llama3.1:8b': 45,
        'deepseek-coder:6.7b': 22
      },
      topTopics: ['React Development', 'API Integration', 'Database Design', 'UI/UX'],
      satisfactionScore: 4.8
    }
    
    set({ conversationAnalytics: mockAnalytics })
  },

  // Model and Agent Selection
  setSelectedModel: (model) => {
    const modelInfo = AI_MODELS[model]
    if (modelInfo) {
      set({ selectedModel: model })
      toast.success(`Switched to ${modelInfo.name}`, {
        duration: 2000,
        icon: modelInfo.icon
      })
    }
  },

  setSelectedAgent: (agent) => {
    const agentInfo = AI_AGENTS[agent]
    if (agentInfo) {
      set({ selectedAgent: agent })
      toast.success(`Now using ${agentInfo.name}`, {
        duration: 2000,
        icon: agentInfo.icon
      })
    }
  },

  // Cleanup
  disconnect: () => {
    get().wsManager.disconnect()
    set({ 
      realTimeEnabled: false,
      collaborators: [],
      isStreaming: false,
      streamingResponse: null
    })
  },

  clearMessages: () => {
    set({ 
      messages: [], 
      currentConversation: null,
      conversationContext: [],
      smartSuggestions: []
    })
  },

  clearError: () => set({ error: null })
}))

export { useEnhancedChatStore, AI_MODELS, AI_AGENTS }