import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { apiService } from '../services/api'
import toast from 'react-hot-toast'

// AI Models configuration
const AI_MODELS = {
  'gpt-4.1-nano': {
    name: 'GPT-4.1 Nano',
    provider: 'OpenAI',
    description: 'Fast and efficient for most tasks',
    cost: 'Free',
    capabilities: ['code', 'text', 'analysis'],
    contextLength: 8192,
    speed: 'fast'
  },
  'claude-sonnet-4': {
    name: 'Claude Sonnet 4',
    provider: 'Anthropic',
    description: 'Excellent for complex reasoning',
    cost: 'Free',
    capabilities: ['code', 'text', 'analysis', 'reasoning'],
    contextLength: 200000,
    speed: 'medium'
  },
  'gemini-2.5-flash': {
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    description: 'Lightning fast responses',
    cost: 'Free',
    capabilities: ['code', 'text', 'multimodal'],
    contextLength: 32768,
    speed: 'very-fast'
  },
  'gpt-4': {
    name: 'GPT-4',
    provider: 'OpenAI',
    description: 'Most capable model for complex tasks',
    cost: 'Free',
    capabilities: ['code', 'text', 'analysis', 'reasoning'],
    contextLength: 128000,
    speed: 'slow'
  }
}

// Agent types configuration
const AGENT_TYPES = {
  developer: {
    name: 'Developer',
    icon: '💻',
    description: 'Code generation, debugging, and optimization',
    capabilities: ['coding', 'debugging', 'architecture', 'testing'],
    specialization: 'Full-stack development and system design'
  },
  designer: {
    name: 'Designer',
    icon: '🎨',
    description: 'UI/UX design and styling',
    capabilities: ['ui-design', 'ux-research', 'styling', 'wireframing'],
    specialization: 'User interface and experience design'
  },
  tester: {
    name: 'Tester',
    icon: '🧪',
    description: 'Test creation and quality assurance',
    capabilities: ['testing', 'qa', 'automation', 'validation'],
    specialization: 'Test automation and quality assurance'
  },
  integrator: {
    name: 'Integrator',
    icon: '🔌',
    description: 'API integration and third-party services',
    capabilities: ['integration', 'apis', 'webhooks', 'services'],
    specialization: 'Third-party integrations and API development'
  },
  analyst: {
    name: 'Analyst',
    icon: '📊',
    description: 'Business analysis and requirements gathering',
    capabilities: ['analysis', 'requirements', 'optimization', 'reporting'],
    specialization: 'Business requirements and data analysis'
  }
}

const useChatStore = create(
  devtools(
    persist(
      immer((set, get) => ({
        // State
        conversations: {},
        currentConversation: null,
        activeModel: 'gpt-4.1-nano',
        activeAgents: ['developer'],
        isLoading: false,
        isStreaming: false,
        error: null,
        streamingMessage: null,
        messageQueue: [],
        settings: {
          autoSave: true,
          showTimestamps: false,
          enableMarkdown: true,
          codeHighlighting: true,
          maxContextLength: 50,
          temperature: 0.7,
          maxTokens: 2048
        },
        availableModels: [],
        availableAgents: [],

        // Initialize models and agents from backend
        initializeModelsAndAgents: async () => {
          try {
            const [modelsResponse, agentsResponse] = await Promise.all([
              apiService.getAIModels(),
              apiService.getAIAgents()
            ])

            set((state) => {
              state.availableModels = modelsResponse
              state.availableAgents = agentsResponse
            })

          } catch (error) {
            console.error('Failed to initialize models and agents:', error)
            // Use fallback data
            set((state) => {
              state.availableModels = Object.values(AI_MODELS)
              state.availableAgents = Object.values(AGENT_TYPES)
            })
          }
        },

        // Actions
        sendMessage: async (content, projectId = null, options = {}) => {
          try {
            const conversationId = projectId || 'general'
            const { activeModel, activeAgents, settings } = get()

            set((state) => {
              state.isLoading = true
              state.error = null
              state.streamingMessage = null
            })

            // Create conversation if it doesn't exist
            if (!get().conversations[conversationId]) {
              set((state) => {
                state.conversations[conversationId] = {
                  id: conversationId,
                  projectId,
                  messages: [],
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  model: activeModel,
                  agents: [...activeAgents],
                  settings: { ...settings }
                }
              })
            }

            // Add user message
            const userMessage = {
              id: Date.now().toString(),
              type: 'user',
              content,
              timestamp: new Date().toISOString(),
              agents: [...activeAgents],
              model: activeModel
            }

            set((state) => {
              state.conversations[conversationId].messages.push(userMessage)
              state.conversations[conversationId].updated_at = new Date().toISOString()
              state.currentConversation = conversationId
            })

            // Prepare context with recent messages
            const conversation = get().conversations[conversationId]
            const recentMessages = conversation.messages
              .slice(-settings.maxContextLength)
              .map(msg => ({
                sender: msg.type,
                content: msg.content
              }))

            // Send to AI service with proper payload structure
            const payload = {
              message: content,
              model: activeModel,
              agent: activeAgents[0], // Use primary agent
              context: recentMessages,
              project_id: projectId,
              conversation_id: conversationId,
              enhanced_features: {
                temperature: settings.temperature,
                max_tokens: settings.maxTokens
              }
            }

            // Call the actual backend AI service
            const apiResponse = await apiService.chatWithAI(payload)
            const response = apiResponse.response

            // Add AI response
            const aiMessage = {
              id: (Date.now() + 1).toString(),
              type: 'assistant',
              content: response,
              timestamp: new Date().toISOString(),
              model: apiResponse.model_used || activeModel,
              agents: [...activeAgents],
              usage: apiResponse.usage || null,
              metadata: apiResponse.metadata || {},
              confidence: apiResponse.confidence || 0.9,
              suggestions: apiResponse.suggestions || []
            }

            set((state) => {
              state.conversations[conversationId].messages.push(aiMessage)
              state.conversations[conversationId].updated_at = new Date().toISOString()
              state.isLoading = false
              state.error = null
            })

            // Auto-save if enabled
            if (settings.autoSave) {
              get().saveConversation(conversationId)
            }

            return response

          } catch (error) {
            const errorMessage = error.response?.data?.detail || error.message || 'Failed to send message'
            
            set((state) => {
              state.error = errorMessage
              state.isLoading = false
              state.isStreaming = false
              state.streamingMessage = null
            })

            toast.error(errorMessage)
            throw error
          }
        },

        setActiveModel: (modelId) => {
          const { availableModels } = get()
          const isValidModel = availableModels.some(model => model.id === modelId) || AI_MODELS[modelId]
          
          if (isValidModel) {
            set((state) => {
              state.activeModel = modelId
            })
          }
        },

        setActiveAgents: (agents) => {
          const { availableAgents } = get()
          const validAgents = agents.filter(agent => 
            availableAgents.some(a => a.id === agent) || AGENT_TYPES[agent]
          )
          
          if (validAgents.length > 0) {
            set((state) => {
              state.activeAgents = validAgents
            })
          }
        },

        addAgent: (agentType) => {
          const { availableAgents, activeAgents } = get()
          const isValidAgent = availableAgents.some(a => a.id === agentType) || AGENT_TYPES[agentType]
          
          if (isValidAgent && !activeAgents.includes(agentType)) {
            set((state) => {
              state.activeAgents.push(agentType)
            })
          }
        },

        removeAgent: (agentType) => {
          const currentAgents = get().activeAgents
          if (currentAgents.length > 1) {
            set((state) => {
              state.activeAgents = state.activeAgents.filter(agent => agent !== agentType)
            })
          }
        },

        createConversation: (projectId = null, initialMessage = null) => {
          const conversationId = projectId || `conversation_${Date.now()}`
          const { activeModel, activeAgents, settings } = get()

          const conversation = {
            id: conversationId,
            projectId,
            messages: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            model: activeModel,
            agents: [...activeAgents],
            settings: { ...settings }
          }

          if (initialMessage) {
            conversation.messages.push({
              id: Date.now().toString(),
              type: 'user',
              content: initialMessage,
              timestamp: new Date().toISOString(),
              agents: [...activeAgents],
              model: activeModel
            })
          }

          set((state) => {
            state.conversations[conversationId] = conversation
            state.currentConversation = conversationId
          })

          return conversationId
        },

        switchConversation: (conversationId) => {
          if (get().conversations[conversationId]) {
            set((state) => {
              state.currentConversation = conversationId
            })
          }
        },

        deleteConversation: async (conversationId) => {
          try {
            // Delete from server if it exists
            await apiService.client.delete(`/api/ai/conversations/${conversationId}`)
          } catch (error) {
            console.error('Error deleting conversation from server:', error)
          }

          set((state) => {
            delete state.conversations[conversationId]
            
            if (state.currentConversation === conversationId) {
              const remainingConversations = Object.keys(state.conversations)
              state.currentConversation = remainingConversations.length > 0 
                ? remainingConversations[0] 
                : null
            }
          })

          toast.success('Conversation deleted')
        },

        clearConversation: (conversationId) => {
          set((state) => {
            if (state.conversations[conversationId]) {
              state.conversations[conversationId].messages = []
              state.conversations[conversationId].updated_at = new Date().toISOString()
            }
          })
        },

        saveConversation: async (conversationId) => {
          try {
            const conversation = get().conversations[conversationId]
            if (!conversation) return false

            await apiService.createConversation({
              title: conversation.messages[0]?.content?.substring(0, 50) || 'Untitled',
              project_id: conversation.projectId
            })

            return true
          } catch (error) {
            console.error('Error saving conversation:', error)
            return false
          }
        },

        loadConversations: async (projectId = null) => {
          try {
            const params = projectId ? { project_id: projectId } : {}
            const response = await apiService.getConversations(params)
            
            const conversationsData = response.conversations || []
            const messages = response.messages || []

            set((state) => {
              conversationsData.forEach(conversation => {
                state.conversations[conversation._id] = {
                  id: conversation._id,
                  projectId: conversation.project_id,
                  messages: conversation.messages || [],
                  created_at: conversation.created_at,
                  updated_at: conversation.updated_at,
                  model: 'gpt-4.1-nano',
                  agents: ['developer'],
                  settings: get().settings
                }
              })

              // If we have messages for a general conversation
              if (messages.length > 0 && !projectId) {
                const generalConversation = 'general'
                if (!state.conversations[generalConversation]) {
                  state.conversations[generalConversation] = {
                    id: generalConversation,
                    projectId: null,
                    messages: [],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    model: 'gpt-4.1-nano',
                    agents: ['developer'],
                    settings: get().settings
                  }
                }
                
                state.conversations[generalConversation].messages = messages.map(msg => ({
                  id: msg.id,
                  type: msg.sender === 'user' ? 'user' : 'assistant',
                  content: msg.content,
                  timestamp: msg.timestamp,
                  model: msg.model || 'gpt-4.1-nano',
                  agents: [msg.agent || 'developer']
                }))
              }
            })

            return conversationsData
          } catch (error) {
            console.error('Error loading conversations:', error)
            return []
          }
        },

        updateSettings: (newSettings) => {
          set((state) => {
            state.settings = { ...state.settings, ...newSettings }
          })
        },

        exportConversation: (conversationId, format = 'json') => {
          const conversation = get().conversations[conversationId]
          if (!conversation) return null

          switch (format) {
            case 'json':
              return JSON.stringify(conversation, null, 2)
            
            case 'markdown':
              const markdown = conversation.messages
                .map(msg => {
                  const timestamp = new Date(msg.timestamp).toLocaleString()
                  const header = msg.type === 'user' ? '## User' : '## Assistant'
                  return `${header} (${timestamp})\n\n${msg.content}\n\n---\n`
                })
                .join('\n')
              
              return `# Conversation Export\n\n**Created:** ${new Date(conversation.created_at).toLocaleString()}\n**Model:** ${conversation.model}\n**Agents:** ${conversation.agents.join(', ')}\n\n---\n\n${markdown}`
            
            case 'text':
              return conversation.messages
                .map(msg => {
                  const timestamp = new Date(msg.timestamp).toLocaleString()
                  return `[${timestamp}] ${msg.type.toUpperCase()}: ${msg.content}`
                })
                .join('\n\n')
            
            default:
              return null
          }
        },

        getConversationStats: (conversationId) => {
          const conversation = get().conversations[conversationId]
          if (!conversation) return null

          const messages = conversation.messages
          const userMessages = messages.filter(m => m.type === 'user')
          const assistantMessages = messages.filter(m => m.type === 'assistant')
          
          const totalTokens = messages.reduce((sum, msg) => {
            return sum + (msg.usage?.total_tokens || 0)
          }, 0)

          const totalChars = messages.reduce((sum, msg) => {
            return sum + msg.content.length
          }, 0)

          return {
            totalMessages: messages.length,
            userMessages: userMessages.length,
            assistantMessages: assistantMessages.length,
            totalTokens,
            totalChars,
            averageMessageLength: messages.length > 0 ? Math.round(totalChars / messages.length) : 0,
            duration: new Date(conversation.updated_at) - new Date(conversation.created_at),
            modelsUsed: [...new Set(messages.map(m => m.model).filter(Boolean))],
            agentsUsed: [...new Set(messages.flatMap(m => m.agents || []))]
          }
        },

        // Utility functions
        getAvailableModels: () => {
          const { availableModels } = get()
          return availableModels.length > 0 ? availableModels : Object.values(AI_MODELS)
        },
        
        getAvailableAgents: () => {
          const { availableAgents } = get()
          return availableAgents.length > 0 ? availableAgents : Object.values(AGENT_TYPES)
        },
        
        clearError: () => {
          set((state) => {
            state.error = null
          })
        },

        reset: () => {
          set((state) => {
            state.conversations = {}
            state.currentConversation = null
            state.isLoading = false
            state.isStreaming = false
            state.error = null
            state.streamingMessage = null
            state.messageQueue = []
          })
        }
      })),
      {
        name: 'ai-tempo-chat',
        partialize: (state) => ({
          conversations: state.conversations,
          currentConversation: state.currentConversation,
          activeModel: state.activeModel,
          activeAgents: state.activeAgents,
          settings: state.settings
        }),
        version: 2
      }
    ),
    {
      name: 'chat-store'
    }
  )
)

export { useChatStore, AI_MODELS, AGENT_TYPES }