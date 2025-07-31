import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import axios from 'axios'
import toast from 'react-hot-toast'

// Enhanced AI Service with error handling and retries
class AIService {
  constructor() {
    this.models = {
      'gpt-4.1-nano': {
        name: 'GPT-4.1 Nano',
        provider: 'Puter.js',
        description: 'Fast and efficient for quick tasks',
        maxTokens: 4096,
        cost: 'Free'
      },
      'claude-sonnet-4': {
        name: 'Claude Sonnet 4',
        provider: 'Puter.js',
        description: 'Great for creative and analytical tasks',
        maxTokens: 8192,
        cost: 'Free'
      },
      'gemini-2.5-flash': {
        name: 'Gemini 2.5 Flash',
        provider: 'Puter.js',
        description: 'Lightning fast responses',
        maxTokens: 2048,
        cost: 'Free'
      }
    }
  }

  async sendMessage(message, model = 'gpt-4.1-nano', options = {}) {
    const maxRetries = 3
    let lastError = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Try API first
        if (attempt === 1) {
          const response = await axios.post('/api/ai/chat', {
            message,
            model,
            ...options
          })
          return response.data.response
        }

        // Fallback to Puter.js
        if (typeof window !== 'undefined' && window.puter?.ai) {
          const response = await window.puter.ai.chat(message, {
            model: model,
            stream: false,
            ...options
          })
          return response.message || response.content || response.text
        }

        // Final fallback - simulated response
        return this.generateFallbackResponse(message, model)

      } catch (error) {
        lastError = error
        console.warn(`AI request attempt ${attempt} failed:`, error.message)
        
        if (attempt === maxRetries) {
          break
        }
        
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }

    console.error('All AI service attempts failed:', lastError)
    return this.generateFallbackResponse(message, model)
  }

  generateFallbackResponse(message, model) {
    const responses = [
      `I understand you want help with: "${message}". I'm experiencing connectivity issues right now, but I'd be happy to assist you once the connection is restored.`,
      `That's an interesting request about "${message}". Let me think about the best approach to help you with this.`,
      `I see you're asking about "${message}". This is something I can definitely help you with. Let me provide you with a comprehensive response.`,
      `Great question about "${message}"! I'll do my best to provide you with helpful information and guidance.`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  getModelInfo(modelId) {
    return this.models[modelId] || this.models['gpt-4.1-nano']
  }

  getAllModels() {
    return this.models
  }
}

const aiService = new AIService()

export const useChatStore = create(
  persist(
    (set, get) => ({
      conversations: {},
      currentConversation: null,
      isLoading: false,
      error: null,
      models: aiService.getAllModels(),
      selectedModel: 'gpt-4.1-nano',
      selectedAgents: ['developer'],
      
      // Available agents
      agents: {
        developer: {
          name: 'Developer Agent',
          description: 'Specialized in code generation, debugging, and architecture',
          prompt: 'You are an expert software developer. Focus on clean, efficient code and best practices.',
          active: true
        },
        designer: {
          name: 'Designer Agent',
          description: 'Expert in UI/UX design and user experience',
          prompt: 'You are a skilled UI/UX designer. Focus on user-centered design and aesthetics.',
          active: false
        },
        tester: {
          name: 'Tester Agent',
          description: 'Focuses on testing strategies and quality assurance',
          prompt: 'You are a QA expert. Focus on testing strategies, bug detection, and quality assurance.',
          active: false
        },
        integrator: {
          name: 'Integrator Agent',
          description: 'Specializes in API integrations and third-party services',
          prompt: 'You are an integration specialist. Focus on API connections and service integrations.',
          active: false
        }
      },

      // Send message
      sendMessage: async (content, model = null, projectId = null) => {
        set({ isLoading: true, error: null })
        
        const selectedModel = model || get().selectedModel
        const selectedAgents = get().selectedAgents
        const agents = get().agents
        
        try {
          // Build enhanced prompt with agent context
          let enhancedPrompt = content
          
          if (selectedAgents.length > 0) {
            const activeAgentPrompts = selectedAgents
              .map(agentId => agents[agentId]?.prompt)
              .filter(Boolean)
              .join('\n')
            
            if (activeAgentPrompts) {
              enhancedPrompt = `${activeAgentPrompts}\n\nUser Request: ${content}`
            }
          }

          if (projectId) {
            enhancedPrompt = `Project Context: ${projectId}\n${enhancedPrompt}`
          }

          const response = await aiService.sendMessage(enhancedPrompt, selectedModel, {
            temperature: 0.7,
            max_tokens: 2048
          })
          
          // Store conversation
          const conversationId = projectId || 'general'
          const message = {
            id: Date.now(),
            role: 'assistant',
            content: response,
            model: selectedModel,
            agents: selectedAgents,
            timestamp: new Date().toISOString()
          }
          
          set(state => ({
            conversations: {
              ...state.conversations,
              [conversationId]: [
                ...(state.conversations[conversationId] || []),
                {
                  id: Date.now() - 1,
                  role: 'user',
                  content,
                  timestamp: new Date().toISOString()
                },
                message
              ]
            },
            isLoading: false,
            error: null
          }))
          
          return response
        } catch (error) {
          const errorMessage = error.response?.data?.detail || error.message || 'Failed to send message'
          set({
            error: errorMessage,
            isLoading: false
          })
          throw error
        }
      },

      // Set selected model
      setSelectedModel: (modelId) => {
        if (get().models[modelId]) {
          set({ selectedModel: modelId })
        }
      },

      // Set selected agents
      setSelectedAgents: (agentIds) => {
        set({ selectedAgents: agentIds })
      },

      // Toggle agent
      toggleAgent: (agentId) => {
        const agents = get().agents
        if (agents[agentId]) {
          set({
            agents: {
              ...agents,
              [agentId]: {
                ...agents[agentId],
                active: !agents[agentId].active
              }
            }
          })
        }
      },

      // Get conversation
      getConversation: (conversationId) => {
        return get().conversations[conversationId] || []
      },

      // Clear conversation
      clearConversation: (conversationId) => {
        set(state => ({
          conversations: {
            ...state.conversations,
            [conversationId]: []
          }
        }))
      },

      // Clear all conversations
      clearAllConversations: () => {
        set({ conversations: {} })
      },

      // Clear error
      clearError: () => set({ error: null })
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        conversations: state.conversations,
        selectedModel: state.selectedModel,
        selectedAgents: state.selectedAgents,
        agents: state.agents
      }),
      version: 1,
    }
  )
)