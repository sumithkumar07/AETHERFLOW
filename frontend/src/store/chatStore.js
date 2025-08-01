import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import axios from 'axios'
import toast from 'react-hot-toast'

// AI Models configuration
const AI_MODELS = {
  'gpt-4.1-nano': {
    name: 'GPT-4.1 Nano',
    provider: 'Puter.js',
    description: 'Fast and efficient for most tasks',
    cost: 'Free',
    capabilities: ['code', 'text', 'analysis'],
    contextLength: 8192,
    speed: 'fast'
  },
  'claude-sonnet-4': {
    name: 'Claude Sonnet 4',
    provider: 'Puter.js',
    description: 'Excellent for complex reasoning',
    cost: 'Free',
    capabilities: ['code', 'text', 'analysis', 'reasoning'],
    contextLength: 200000,
    speed: 'medium'
  },
  'gemini-2.5-flash': {
    name: 'Gemini 2.5 Flash',
    provider: 'Puter.js',
    description: 'Lightning fast responses',
    cost: 'Free',
    capabilities: ['code', 'text', 'multimodal'],
    contextLength: 32768,
    speed: 'very-fast'
  },
  'gpt-4': {
    name: 'GPT-4',
    provider: 'Puter.js',
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
  optimizer: {
    name: 'Optimizer',
    icon: '⚡',
    description: 'Performance optimization and scaling',
    capabilities: ['optimization', 'performance', 'scaling', 'monitoring'],
    specialization: 'Performance tuning and scalability'
  },
  security: {
    name: 'Security',
    icon: '🔒',
    description: 'Security analysis and compliance',
    capabilities: ['security', 'compliance', 'audit', 'vulnerability'],
    specialization: 'Security assessment and compliance'
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
                role: msg.type === 'user' ? 'user' : 'assistant',
                content: msg.content
              }))

            // Send to AI service
            const payload = {
              message: content,
              model: activeModel,
              agents: activeAgents,
              context: recentMessages,
              project_id: projectId,
              settings: {
                temperature: settings.temperature,
                max_tokens: settings.maxTokens,
                stream: options.stream || false
              }
            }

            let response
            if (options.stream) {
              response = await get().handleStreamingResponse(conversationId, payload)
            } else {
              const apiResponse = await axios.post('/ai/chat', payload)
              response = apiResponse.data.response
            }

            // Add AI response
            const aiMessage = {
              id: (Date.now() + 1).toString(),
              type: 'assistant',
              content: response,
              timestamp: new Date().toISOString(),
              model: activeModel,
              agents: [...activeAgents],
              usage: apiResponse?.data?.usage || null
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
            const errorMessage = error.response?.data?.detail || 'Failed to send message'
            
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

        handleStreamingResponse: async (conversationId, payload) => {
          try {
            set((state) => {
              state.isStreaming = true
              state.streamingMessage = {
                id: Date.now().toString(),
                type: 'assistant',
                content: '',
                timestamp: new Date().toISOString(),
                model: payload.model,
                agents: [...payload.agents],
                streaming: true
              }
            })

            const response = await fetch('/api/ai/chat/stream', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${useAuthStore.getState().token}`
              },
              body: JSON.stringify(payload)
            })

            if (!response.ok) {
              throw new Error('Streaming request failed')
            }

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let fullContent = ''

            while (true) {
              const { done, value } = await reader.read()
              
              if (done) break

              const chunk = decoder.decode(value)
              const lines = chunk.split('\n')

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6))
                    
                    if (data.content) {
                      fullContent += data.content
                      
                      set((state) => {
                        if (state.streamingMessage) {
                          state.streamingMessage.content = fullContent
                        }
                      })
                    }
                    
                    if (data.done) {
                      // Finalize streaming message
                      const finalMessage = {
                        ...get().streamingMessage,
                        content: fullContent,
                        streaming: false,
                        usage: data.usage || null
                      }

                      set((state) => {
                        state.conversations[conversationId].messages.push(finalMessage)
                        state.conversations[conversationId].updated_at = new Date().toISOString()
                        state.isStreaming = false
                        state.streamingMessage = null
                        state.isLoading = false
                      })
                      
                      return fullContent
                    }
                  } catch (parseError) {
                    console.error('Error parsing streaming data:', parseError)
                  }
                }
              }
            }

            return fullContent

          } catch (error) {
            set((state) => {
              state.isStreaming = false
              state.streamingMessage = null
              state.error = 'Streaming failed'
            })
            throw error
          }
        },

        setActiveModel: (modelId) => {
          if (AI_MODELS[modelId]) {
            set((state) => {
              state.activeModel = modelId
            })
          }
        },

        setActiveAgents: (agents) => {
          const validAgents = agents.filter(agent => AGENT_TYPES[agent])
          if (validAgents.length > 0) {
            set((state) => {
              state.activeAgents = validAgents
            })
          }
        },

        addAgent: (agentType) => {
          if (AGENT_TYPES[agentType] && !get().activeAgents.includes(agentType)) {
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
            await axios.delete(`/ai/conversations/${conversationId}`)
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
            if (!conversation) return

            await axios.post('/ai/conversations', {
              id: conversationId,
              project_id: conversation.projectId,
              messages: conversation.messages,
              model: conversation.model,
              agents: conversation.agents,
              settings: conversation.settings,
              created_at: conversation.created_at,
              updated_at: conversation.updated_at
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
            const response = await axios.get('/ai/conversations', { params })
            const conversations = response.data

            set((state) => {
              conversations.forEach(conversation => {
                state.conversations[conversation.id] = conversation
              })
            })

            return conversations
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
        getAvailableModels: () => AI_MODELS,
        getAvailableAgents: () => AGENT_TYPES,
        
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
        version: 1
      }
    ),
    {
      name: 'chat-store'
    }
  )
)

export { useChatStore, AI_MODELS, AGENT_TYPES }