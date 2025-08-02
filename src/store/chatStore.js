import { create } from 'zustand'
import axios from 'axios'
import toast from 'react-hot-toast'

// Enhanced AI models with local Ollama configurations
const AI_MODELS = {
  'codellama:13b': {
    name: 'CodeLlama 13B',
    provider: 'Meta (Local)',
    description: 'Specialized for code generation, debugging, and software architecture',
    capabilities: ['code', 'debugging', 'architecture', 'best-practices'],
    speed: 'medium',
    quality: 'highest',
    cost: 'free',
    icon: '💻',
    type: 'coding',
    size: '13B',
    unlimited: true,
    local: true
  },
  'llama3.1:8b': {
    name: 'LLaMA 3.1 8B',
    provider: 'Meta (Local)',
    description: 'Excellent general-purpose model for various tasks',
    capabilities: ['general', 'analysis', 'creative', 'reasoning'],
    speed: 'fast',
    quality: 'high',
    cost: 'free',
    icon: '🧠',
    type: 'general',
    size: '8B',
    unlimited: true,
    local: true
  },
  'deepseek-coder:6.7b': {
    name: 'DeepSeek Coder 6.7B',
    provider: 'DeepSeek (Local)',
    description: 'Fast responses for quick coding tasks and completion',
    capabilities: ['code', 'completion', 'quick-fixes', 'snippets'],
    speed: 'fastest',
    quality: 'high',
    cost: 'free',
    icon: '⚡',
    type: 'coding-fast',
    size: '6.7B',
    unlimited: true,
    local: true
  }
}

// Enhanced agent configurations
const AI_AGENTS = {
  developer: {
    name: 'Developer Agent',
    icon: '💻',
    description: 'Expert in coding, debugging, and software architecture',
    capabilities: ['Full-stack development', 'Code review', 'Architecture', 'Debugging'],
    prompt: 'You are an expert software developer with deep knowledge of modern programming languages, frameworks, and best practices.',
    color: 'text-blue-600 dark:text-blue-400'
  },
  designer: {
    name: 'Designer Agent',
    icon: '🎨',
    description: 'UI/UX design specialist with modern design principles',
    capabilities: ['UI/UX Design', 'Design Systems', 'User Research', 'Prototyping'],
    prompt: 'You are a senior UI/UX designer with expertise in modern design principles, user experience, and design systems.',
    color: 'text-purple-600 dark:text-purple-400'
  },
  tester: {
    name: 'QA Agent',
    icon: '🧪',
    description: 'Quality assurance and testing specialist',
    capabilities: ['Test Strategy', 'Automation', 'Bug Analysis', 'Performance Testing'],
    prompt: 'You are a senior QA engineer specializing in test automation, quality assurance, and comprehensive testing strategies.',
    color: 'text-green-600 dark:text-green-400'
  },
  integrator: {
    name: 'Integration Agent',
    icon: '🔗',
    description: 'Third-party integration and API specialist',
    capabilities: ['API Integration', 'Third-party Services', 'Data Migration', 'System Architecture'],
    prompt: 'You are an integration specialist with expertise in connecting systems, APIs, and third-party services.',
    color: 'text-orange-600 dark:text-orange-400'
  },
  analyst: {
    name: 'Business Analyst',
    icon: '📊',
    description: 'Business requirements and data analysis expert',
    capabilities: ['Requirements Analysis', 'Data Analysis', 'Process Optimization', 'Reporting'],
    prompt: 'You are a senior business analyst with expertise in requirements gathering, process optimization, and data-driven insights.',
    color: 'text-indigo-600 dark:text-indigo-400'
  }
}

const useChatStore = create((set, get) => ({
  // Enhanced State
  messages: [],
  conversations: [],
  currentConversation: null,
  loading: false,
  error: null,
  selectedModel: 'gpt-4.1-nano',
  selectedAgent: 'developer',
  
  // Enhanced AI state
  aiThinking: false,
  modelStats: {
    'gpt-4.1-nano': { usage: 0, avgResponseTime: 0, successRate: 100 },
    'claude-sonnet-4': { usage: 0, avgResponseTime: 0, successRate: 100 },
    'gemini-2.5-flash': { usage: 0, avgResponseTime: 0, successRate: 100 },
    'gpt-4': { usage: 0, avgResponseTime: 0, successRate: 100 }
  },
  
  // Context and conversation history
  conversationContext: [],
  maxContextLength: 10,
  
  // Real-time typing indicators
  isAITyping: false,
  typingTimeout: null,
  
  // Advanced features
  smartSuggestions: [],
  codeAnalysisResults: null,
  projectInsights: null,

  // Enhanced Actions
  sendMessage: async (messageData) => {
    const startTime = Date.now()
    
    try {
      set({ 
        loading: true, 
        aiThinking: true,
        isAITyping: true,
        error: null 
      })
      
      // Add user message to local state immediately with enhanced metadata
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
          sentiment: 'neutral',
          codeBlocks: get().extractCodeBlocks(messageData.content)
        }
      }
      
      set(state => ({
        messages: [...state.messages, userMessage],
        conversationContext: [...state.conversationContext.slice(-get().maxContextLength), userMessage]
      }))
      
      // Enhanced request with context and agent-specific prompting
      const requestPayload = {
        message: messageData.content,
        model: messageData.model || get().selectedModel,
        agent: messageData.agent || get().selectedAgent,
        project_id: messageData.projectId,
        conversation_id: get().currentConversation?.id,
        context: get().conversationContext.slice(-5), // Last 5 messages for context
        agent_prompt: AI_AGENTS[messageData.agent || get().selectedAgent]?.prompt,
        enhanced_features: {
          code_analysis: true,
          context_awareness: true,
          follow_up_suggestions: true,
          smart_completions: true,
          project_context: messageData.projectId ? true : false
        }
      }
      
      const response = await axios.post('/api/ai/chat', requestPayload)
      const responseTime = Date.now() - startTime
      
      // Enhanced AI message with metadata
      const aiMessage = {
        id: `ai_${Date.now()}`,
        content: response.data.response,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        model: response.data.model_used || messageData.model || get().selectedModel,
        agent: messageData.agent || get().selectedAgent,
        metadata: {
          responseTime,
          wordCount: response.data.response.split(' ').length,
          hasCode: response.data.response.includes('```'),
          confidence: response.data.confidence || 0.95,
          suggestions: response.data.suggestions || [],
          usage: response.data.usage || {},
          codeBlocks: get().extractCodeBlocks(response.data.response)
        }
      }
      
      // Update model statistics
      const currentModel = messageData.model || get().selectedModel
      set(state => ({
        messages: [...state.messages, aiMessage],
        conversationContext: [...state.conversationContext, aiMessage],
        loading: false,
        aiThinking: false,
        isAITyping: false,
        smartSuggestions: response.data.suggestions || [],
        modelStats: {
          ...state.modelStats,
          [currentModel]: {
            usage: state.modelStats[currentModel].usage + 1,
            avgResponseTime: (state.modelStats[currentModel].avgResponseTime + responseTime) / 2,
            successRate: Math.min(100, state.modelStats[currentModel].successRate + 0.5)
          }
        }
      }))
      
      // Success feedback with enhanced information
      if (responseTime < 3000) {
        toast.success(`${AI_MODELS[currentModel].name} responded in ${(responseTime / 1000).toFixed(1)}s`, {
          duration: 2000,
          icon: AI_MODELS[currentModel].icon
        })
      }
      
      return { success: true, message: aiMessage, responseTime }
      
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to send message'
      
      // Update model failure stats
      const currentModel = messageData.model || get().selectedModel
      set(state => ({ 
        error: errorMessage, 
        loading: false,
        aiThinking: false,
        isAITyping: false,
        modelStats: {
          ...state.modelStats,
          [currentModel]: {
            ...state.modelStats[currentModel],
            successRate: Math.max(0, state.modelStats[currentModel].successRate - 2)
          }
        }
      }))
      
      // Enhanced error handling with user-friendly messages
      let userFriendlyError = errorMessage
      if (error.response?.status === 429) {
        userFriendlyError = 'AI is busy right now. Please try again in a moment.'
      } else if (error.response?.status >= 500) {
        userFriendlyError = 'AI service is temporarily unavailable. Switching to backup model...'
        // Auto-retry with different model
        setTimeout(() => get().autoRetryWithFallbackModel(messageData), 2000)
      }
      
      toast.error(userFriendlyError, {
        duration: 5000,
        icon: '⚠️'
      })
      return { success: false, error: errorMessage }
    }
  },

  // Auto-retry with fallback model
  autoRetryWithFallbackModel: async (messageData) => {
    const currentModel = messageData.model || get().selectedModel
    const modelStats = get().modelStats
    
    // Sort models by success rate and response time
    const availableModels = Object.entries(modelStats)
      .filter(([model]) => model !== currentModel)
      .sort(([,a], [,b]) => (b.successRate - a.successRate) || (a.avgResponseTime - b.avgResponseTime))
    
    if (availableModels.length > 0) {
      const fallbackModel = availableModels[0][0]
      toast.loading(`Retrying with ${AI_MODELS[fallbackModel].name}...`, { duration: 3000 })
      
      return await get().sendMessage({
        ...messageData,
        model: fallbackModel
      })
    }
  },

  // Enhanced message fetching with conversation history
  fetchMessages: async (projectId) => {
    try {
      set({ loading: true, error: null })
      const response = await axios.get(`/api/ai/conversations?project_id=${projectId}`)
      
      const messages = response.data.messages || []
      const conversations = response.data.conversations || []
      
      // Process and enhance message metadata
      const enhancedMessages = messages.map(msg => ({
        ...msg,
        metadata: {
          wordCount: msg.content?.split(' ').length || 0,
          hasCode: msg.content?.includes('```') || false,
          codeBlocks: get().extractCodeBlocks(msg.content || ''),
          ...msg.metadata
        }
      }))
      
      set({ 
        messages: enhancedMessages,
        conversations,
        conversationContext: enhancedMessages.slice(-get().maxContextLength),
        loading: false 
      })
      
      return { success: true, messages: enhancedMessages, conversations }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to fetch messages'
      set({ error: errorMessage, loading: false })
      return { success: false, error: errorMessage }
    }
  },

  // Enhanced model selection with performance optimization
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

  // Enhanced agent selection
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

  // Get smart suggestions based on context
  getSmartSuggestions: () => {
    const state = get()
    const lastMessage = state.messages[state.messages.length - 1]
    
    if (!lastMessage || lastMessage.sender !== 'assistant') {
      return []
    }
    
    const suggestions = state.smartSuggestions
    if (suggestions && suggestions.length > 0) {
      return suggestions
    }
    
    // Fallback suggestions based on content
    const content = lastMessage.content.toLowerCase()
    const contextualSuggestions = []
    
    if (content.includes('error') || content.includes('bug')) {
      contextualSuggestions.push(
        "How can I debug this issue?",
        "What are common causes of this error?",
        "Can you help me fix this?"
      )
    } else if (content.includes('code') || content.includes('function')) {
      contextualSuggestions.push(
        "Can you explain this code?",
        "How can I optimize this?",
        "What are best practices here?"
      )
    } else {
      contextualSuggestions.push(
        "Can you provide more details?",
        "What's the next step?",
        "Any alternatives to consider?"
      )
    }
    
    return contextualSuggestions.slice(0, 3)
  },

  // Code analysis functionality
  analyzeCode: async (code, language) => {
    try {
      // This would integrate with code analysis backend service
      const mockAnalysis = {
        complexity: Math.floor(Math.random() * 10) + 1,
        issues: Math.floor(Math.random() * 5),
        suggestions: [
          "Consider using async/await for better readability",
          "Add error handling for API calls",
          "Extract reusable functions"
        ],
        performance: Math.floor(Math.random() * 30) + 70,
        security: Math.floor(Math.random() * 20) + 80
      }
      
      set({ codeAnalysisResults: mockAnalysis })
      
      return { success: true, analysis: mockAnalysis }
    } catch (error) {
      return { success: false, error: 'Code analysis failed' }
    }
  },

  // Project insights
  generateProjectInsights: async (projectId) => {
    try {
      // This would integrate with analytics backend
      const mockInsights = {
        codeQuality: Math.floor(Math.random() * 30) + 70,
        testCoverage: Math.floor(Math.random() * 40) + 60,
        performance: Math.floor(Math.random() * 25) + 75,
        recommendations: [
          "Add more unit tests to improve coverage",
          "Consider implementing caching for better performance",
          "Review error handling across the application"
        ],
        trends: {
          activity: Array.from({ length: 7 }, () => Math.floor(Math.random() * 100)),
          quality: Array.from({ length: 7 }, () => Math.floor(Math.random() * 20) + 80)
        }
      }
      
      set({ projectInsights: mockInsights })
      
      return { success: true, insights: mockInsights }
    } catch (error) {
      return { success: false, error: 'Failed to generate insights' }
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

  // Get model information
  getModelInfo: (modelId) => {
    return AI_MODELS[modelId] || null
  },

  // Get agent information
  getAgentInfo: (agentId) => {
    return AI_AGENTS[agentId] || null
  },

  // Get all available models
  getAvailableModels: () => {
    return Object.entries(AI_MODELS).map(([id, model]) => ({
      id,
      ...model
    }))
  },

  // Get all available agents
  getAvailableAgents: () => {
    return Object.entries(AI_AGENTS).map(([id, agent]) => ({
      id,
      ...agent
    }))
  },

  // Get model performance stats
  getModelStats: () => {
    return get().modelStats
  },

  // Enhanced conversation management
  createConversation: async (projectId, title) => {
    try {
      const response = await axios.post('/api/ai/conversations', {
        project_id: projectId,
        title: title || `Conversation ${Date.now()}`
      })
      
      const newConversation = response.data
      set(state => ({
        conversations: [newConversation, ...state.conversations],
        currentConversation: newConversation
      }))
      
      return { success: true, conversation: newConversation }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to create conversation'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  },

  // Switch conversation
  switchConversation: async (conversationId) => {
    try {
      set({ loading: true })
      const response = await axios.get(`/api/ai/conversations/${conversationId}`)
      
      const conversation = response.data
      const messages = conversation.messages || []
      
      set({
        currentConversation: conversation,
        messages,
        conversationContext: messages.slice(-get().maxContextLength),
        loading: false
      })
      
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to switch conversation'
      set({ error: errorMessage, loading: false })
      return { success: false, error: errorMessage }
    }
  },

  // Enhanced message management
  deleteMessage: (messageId) => {
    set(state => ({
      messages: state.messages.filter(msg => msg.id !== messageId),
      conversationContext: state.conversationContext.filter(msg => msg.id !== messageId)
    }))
    toast.success('Message deleted')
  },

  // Copy message content
  copyMessage: (messageId) => {
    const message = get().messages.find(msg => msg.id === messageId)
    if (message) {
      navigator.clipboard.writeText(message.content)
      toast.success('Message copied to clipboard', { icon: '📋' })
    }
  },

  // Regenerate AI response
  regenerateResponse: async (messageId) => {
    const state = get()
    const messageIndex = state.messages.findIndex(msg => msg.id === messageId)
    
    if (messageIndex > 0) {
      const previousUserMessage = state.messages[messageIndex - 1]
      if (previousUserMessage && previousUserMessage.sender === 'user') {
        // Remove the old AI response
        set(state => ({
          messages: state.messages.filter(msg => msg.id !== messageId)
        }))
        
        // Resend the user message
        return await get().sendMessage({
          content: previousUserMessage.content,
          model: previousUserMessage.model,
          agent: previousUserMessage.agent
        })
      }
    }
    
    return { success: false, error: 'Cannot regenerate this message' }
  },

  // Export conversation
  exportConversation: (format = 'json') => {
    const state = get()
    const exportData = {
      conversation: state.currentConversation,
      messages: state.messages,
      metadata: {
        exportedAt: new Date().toISOString(),
        messageCount: state.messages.length,
        modelStats: state.modelStats,
        selectedModel: state.selectedModel,
        selectedAgent: state.selectedAgent
      }
    }
    
    const dataStr = format === 'json' 
      ? JSON.stringify(exportData, null, 2)
      : state.messages.map(msg => `${msg.sender}: ${msg.content}`).join('\n\n')
    
    const dataBlob = new Blob([dataStr], { type: 'text/plain' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ai_tempo_conversation_${Date.now()}.${format}`
    link.click()
    
    toast.success(`Conversation exported as ${format.toUpperCase()}`)
  },

  // Clear messages
  clearMessages: () => {
    set({ 
      messages: [], 
      currentConversation: null,
      conversationContext: [],
      smartSuggestions: [],
      codeAnalysisResults: null
    })
    toast.success('Conversation cleared')
  },

  // Clear errors
  clearError: () => {
    set({ error: null })
  },

  // Reset AI thinking state
  resetAIState: () => {
    set({ 
      aiThinking: false,
      isAITyping: false,
      loading: false
    })
  },

  // Clear conversation context
  clearConversationContext: () => {
    set({ conversationContext: [] })
  }
}))

export { useChatStore, AI_MODELS, AI_AGENTS }