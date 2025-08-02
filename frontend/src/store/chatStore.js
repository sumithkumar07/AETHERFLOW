import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import axios from 'axios'
import toast from 'react-hot-toast'

// Get backend URL from environment
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'

// Enhanced Aether AI Chat Store with 2025 capabilities
const useChatStore = create(
  persist(
    (set, get) => ({
      // State
      messages: [],
      conversations: [],
      currentConversationId: null,
      models: [],
      agents: [],
      selectedModel: 'gpt-4-turbo',
      selectedAgent: 'developer',
      isLoading: false,
      isTyping: false,
      error: null,
      
      // 2025 Enhanced Features
      voiceEnabled: false,
      isListening: false,
      voiceToTextActive: false,
      multimodalEnabled: true,
      realTimeCollaboration: true,
      aiCodeReview: true,
      predictiveAssistance: true,

      // Actions
      initializeModelsAndAgents: async () => {
        try {
          console.log('🤖 Initializing Aether AI models and agents...')
          
          // Fetch available models
          const modelsResponse = await axios.get(`${BACKEND_URL}/api/ai/models`)
          const agentsResponse = await axios.get(`${BACKEND_URL}/api/ai/agents`)
          
          const models = modelsResponse.data?.models || []
          const agents = agentsResponse.data?.agents || []
          
          set({
            models: models.map(model => ({
              ...model,
              enhanced_2025: true,
              voice_enabled: true,
              multimodal: true
            })),
            agents: agents.map(agent => ({
              ...agent,
              enhanced_2025: true,
              voice_capable: true,
              collaboration_ready: true
            }))
          })
          
          console.log(`✅ Loaded ${models.length} models and ${agents.length} agents`)
          
        } catch (error) {
          console.error('Failed to initialize models and agents:', error)
          
          // Fallback to enhanced mock data
          set({
            models: [
              {
                id: 'gpt-4-turbo',
                name: 'GPT-4 Turbo',
                provider: 'OpenAI',
                description: 'Most advanced GPT-4 model with 2025 enhancements',
                capabilities: ['code', 'analysis', 'creative', 'voice', 'multimodal'],
                speed: 'fast',
                quality: 'highest',
                cost: 'premium',
                enhanced_2025: true,
                voice_enabled: true,
                multimodal: true
              },
              {
                id: 'claude-sonnet-3.5',
                name: 'Claude Sonnet 3.5',
                provider: 'Anthropic',
                description: '2025 enhanced Claude with superior reasoning',
                capabilities: ['code', 'analysis', 'reasoning', 'creative', 'voice'],
                speed: 'medium',
                quality: 'highest',
                cost: 'premium',
                enhanced_2025: true,
                voice_enabled: true,
                multimodal: true
              },
              {
                id: 'gemini-2.0-pro',
                name: 'Gemini 2.0 Pro',
                provider: 'Google',
                description: '2025 Gemini with advanced multimodal capabilities',
                capabilities: ['code', 'analysis', 'multimodal', 'voice', 'vision'],
                speed: 'fastest',
                quality: 'high',
                cost: 'standard',
                enhanced_2025: true,
                voice_enabled: true,
                multimodal: true
              }
            ],
            agents: [
              {
                id: 'developer',
                name: 'Aether Developer',
                icon: '💻',
                description: 'Expert in 2025 development practices with AI-powered coding',
                capabilities: ['Full-stack development', 'AI-assisted coding', 'Real-time collaboration', 'Voice coding'],
                enhanced_2025: true,
                voice_capable: true,
                collaboration_ready: true
              },
              {
                id: 'designer',
                name: 'Aether Designer', 
                icon: '🎨',
                description: 'Advanced UI/UX designer with 2025 design principles',
                capabilities: ['AI-powered design', 'Accessibility-first', 'Real-time prototyping', 'Voice feedback'],
                enhanced_2025: true,
                voice_capable: true,
                collaboration_ready: true
              },
              {
                id: 'tester',
                name: 'Aether QA',
                icon: '🧪', 
                description: 'AI-powered testing and quality assurance specialist',
                capabilities: ['AI test generation', 'Automated testing', 'Performance analysis', 'Security scanning'],
                enhanced_2025: true,
                voice_capable: true,
                collaboration_ready: true
              },
              {
                id: 'integrator',
                name: 'Aether Integration',
                icon: '🔗',
                description: 'Advanced integration and API specialist for 2025', 
                capabilities: ['AI-powered integrations', 'Real-time data sync', 'Cloud-native architecture', 'Voice commands'],
                enhanced_2025: true,
                voice_capable: true,
                collaboration_ready: true
              },
              {
                id: 'analyst',
                name: 'Aether Analyst',
                icon: '📊',
                description: 'AI-enhanced business and data analysis expert',
                capabilities: ['AI insights', 'Predictive analytics', 'Business optimization', 'Voice reporting'],
                enhanced_2025: true,
                voice_capable: true,
                collaboration_ready: true
              }
            ]
          })
        }
      },

      sendMessage: async (message, projectId = null) => {
        try {
          const { selectedModel, selectedAgent, currentConversationId } = get()
          
          set({ isLoading: true, isTyping: true, error: null })

          // Add user message immediately
          const userMessage = {
            id: `user_${Date.now()}`,
            content: message,
            sender: 'user',
            timestamp: new Date().toISOString(),
            model: selectedModel,
            agent: selectedAgent,
            enhanced_2025: true
          }

          set(state => ({
            messages: [...state.messages, userMessage]
          }))

          // Prepare context from recent messages
          const context = get().messages.slice(-10).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content
          }))

          // Call Aether AI backend
          const response = await axios.post(`${BACKEND_URL}/api/ai/chat`, {
            message,
            model: selectedModel,
            agent: selectedAgent,
            project_id: projectId,
            conversation_id: currentConversationId,
            context,
            enhanced_features: {
              voice_enabled: get().voiceEnabled,
              multimodal: get().multimodalEnabled,
              real_time_collaboration: get().realTimeCollaboration,
              ai_code_review: get().aiCodeReview,
              year: 2025
            }
          })

          const aiResponse = response.data

          // Add AI response
          const assistantMessage = {
            id: `ai_${Date.now()}`,
            content: aiResponse.response,
            sender: 'assistant',
            timestamp: new Date().toISOString(),
            model: aiResponse.model_used || selectedModel,
            agent: selectedAgent,
            confidence: aiResponse.confidence,
            suggestions: aiResponse.suggestions || [],
            metadata: aiResponse.metadata || {},
            enhanced_2025: true
          }

          set(state => ({
            messages: [...state.messages, assistantMessage],
            currentConversationId: aiResponse.conversation_id || currentConversationId,
            isLoading: false,
            isTyping: false
          }))

          return assistantMessage

        } catch (error) {
          console.error('Failed to send message:', error)
          
          set({
            isLoading: false,
            isTyping: false,
            error: error.response?.data?.detail || 'Failed to send message'
          })

          // Add error message with enhanced features
          const errorMessage = {
            id: `error_${Date.now()}`,
            content: `I apologize, but I encountered an issue processing your request. This might be due to network connectivity or service availability. Please try again.

**Aether AI Status:**
- Voice recognition: ${get().voiceEnabled ? '✅ Available' : '❌ Disabled'}
- Multimodal processing: ${get().multimodalEnabled ? '✅ Ready' : '❌ Limited'}
- Real-time collaboration: ${get().realTimeCollaboration ? '✅ Active' : '❌ Offline'}

Would you like to try a different approach or check your connection?`,
            sender: 'assistant',
            timestamp: new Date().toISOString(),
            model: get().selectedModel,
            agent: get().selectedAgent,
            isError: true,
            enhanced_2025: true
          }

          set(state => ({
            messages: [...state.messages, errorMessage]
          }))

          toast.error('Failed to connect to Aether AI')
          throw error
        }
      },

      // Enhanced voice functionality for 2025
      startVoiceRecognition: async () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
          toast.error('Voice recognition not supported in this browser')
          return
        }

        try {
          set({ isListening: true, voiceToTextActive: true })
          
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
          const recognition = new SpeechRecognition()
          
          recognition.continuous = true
          recognition.interimResults = true
          recognition.lang = 'en-US'
          
          recognition.onresult = (event) => {
            let transcript = ''
            for (let i = event.resultIndex; i < event.results.length; i++) {
              transcript += event.results[i][0].transcript
            }
            
            // Trigger voice input event
            window.dispatchEvent(new CustomEvent('voiceInput', { detail: transcript }))
          }
          
          recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error)
            set({ isListening: false, voiceToTextActive: false })
            toast.error('Voice recognition error: ' + event.error)
          }
          
          recognition.onend = () => {
            set({ isListening: false, voiceToTextActive: false })
          }
          
          recognition.start()
          toast.success('🎤 Voice recognition started - speak your message!')
          
        } catch (error) {
          console.error('Voice recognition failed:', error)
          set({ isListening: false, voiceToTextActive: false })
          toast.error('Failed to start voice recognition')
        }
      },

      stopVoiceRecognition: () => {
        set({ isListening: false, voiceToTextActive: false })
        toast.info('Voice recognition stopped')
      },

      // Load conversations
      loadConversations: async (projectId = null) => {
        try {
          const params = projectId ? { project_id: projectId } : {}
          const response = await axios.get(`${BACKEND_URL}/api/ai/conversations`, { params })
          
          set({
            conversations: response.data.conversations || [],
            messages: response.data.messages || []
          })
          
        } catch (error) {
          console.error('Failed to load conversations:', error)
          set({ error: 'Failed to load conversations' })
        }
      },

      // Create new conversation
      createConversation: async (title, projectId = null) => {
        try {
          const response = await axios.post(`${BACKEND_URL}/api/ai/conversations`, {
            title,
            project_id: projectId
          })
          
          const conversation = response.data
          
          set(state => ({
            conversations: [conversation, ...state.conversations],
            currentConversationId: conversation._id,
            messages: []
          }))
          
          return conversation
          
        } catch (error) {
          console.error('Failed to create conversation:', error)
          toast.error('Failed to create conversation')
          throw error
        }
      },

      // Switch conversation
      switchConversation: async (conversationId) => {
        try {
          const response = await axios.get(`${BACKEND_URL}/api/ai/conversations/${conversationId}`)
          const conversation = response.data
          
          set({
            currentConversationId: conversationId,
            messages: conversation.messages || []
          })
          
        } catch (error) {
          console.error('Failed to switch conversation:', error)
          toast.error('Failed to load conversation')
        }
      },

      // Clear messages
      clearMessages: () => {
        set({ 
          messages: [],
          currentConversationId: null
        })
      },

      // Set selected model with 2025 enhancements
      setSelectedModel: (modelId) => {
        const model = get().models.find(m => m.id === modelId)
        if (model) {
          set({ 
            selectedModel: modelId,
            voiceEnabled: model.voice_enabled || false,
            multimodalEnabled: model.multimodal || false
          })
          toast.success(`Switched to ${model.name} with 2025 enhancements`)
        }
      },

      // Set selected agent
      setSelectedAgent: (agentId) => {
        const agent = get().agents.find(a => a.id === agentId)
        if (agent) {
          set({ selectedAgent: agentId })
          toast.success(`Switched to ${agent.name} agent`)
        }
      },

      // Enhanced 2025 feature toggles
      toggleVoiceEnabled: () => {
        set(state => ({ voiceEnabled: !state.voiceEnabled }))
        toast.success(`Voice recognition ${get().voiceEnabled ? 'enabled' : 'disabled'}`)
      },

      toggleMultimodal: () => {
        set(state => ({ multimodalEnabled: !state.multimodalEnabled }))
        toast.success(`Multimodal AI ${get().multimodalEnabled ? 'enabled' : 'disabled'}`)
      },

      toggleRealTimeCollaboration: () => {
        set(state => ({ realTimeCollaboration: !state.realTimeCollaboration }))
        toast.success(`Real-time collaboration ${get().realTimeCollaboration ? 'enabled' : 'disabled'}`)
      },

      toggleAICodeReview: () => {
        set(state => ({ aiCodeReview: !state.aiCodeReview }))
        toast.success(`AI code review ${get().aiCodeReview ? 'enabled' : 'disabled'}`)
      },

      // Generate code with AI
      generateCode: async (requirements, language = 'python') => {
        try {
          set({ isLoading: true })
          
          const response = await axios.post(`${BACKEND_URL}/api/ai/generate-code`, {
            requirements,
            language,
            enhanced_2025: true,
            voice_enabled: get().voiceEnabled,
            ai_review: get().aiCodeReview
          })
          
          set({ isLoading: false })
          return response.data
          
        } catch (error) {
          console.error('Code generation failed:', error)
          set({ isLoading: false, error: 'Code generation failed' })
          throw error
        }
      },

      // Clear error
      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'aether-ai-chat',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedModel: state.selectedModel,
        selectedAgent: state.selectedAgent,
        voiceEnabled: state.voiceEnabled,
        multimodalEnabled: state.multimodalEnabled,
        realTimeCollaboration: state.realTimeCollaboration,
        aiCodeReview: state.aiCodeReview
      }),
      version: 2
    }
  )
)

export { useChatStore }