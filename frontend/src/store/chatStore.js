import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import axios from 'axios'
import toast from 'react-hot-toast'
import puterAI from '../services/puterAI'

// Get backend URL from environment
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'

// Enhanced Aether AI Chat Store with 2025 capabilities + Puter.js FREE AI
const useChatStore = create(
  persist(
    (set, get) => ({
      // State
      messages: [],
      conversations: [],
      currentConversationId: null,
      models: [],
      agents: [],
      selectedModel: 'gpt-4.1-nano',
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
      
      // Puter.js FREE AI Integration
      puterAIEnabled: true,
      puterAIAvailable: false,
      freeAIAccess: true,

      // Actions
      initializeModelsAndAgents: async () => {
        try {
          console.log('🤖 Initializing Aether AI models and agents with FREE Puter.js access...')
          
          // Initialize Puter.js AI Service first
          const puterAvailable = await puterAI.initialize()
          set({ puterAIAvailable: puterAvailable })
          
          if (puterAvailable) {
            console.log('🎉 Puter.js initialized - FREE unlimited AI access enabled!')
            toast.success('🆓 FREE unlimited AI access enabled via Puter.js!')
          }
          
          // Get Puter.js models
          const puterModels = puterAI.getAvailableModels()
          
          // Fetch available models from backend (fallback)
          let backendModels = []
          let backendAgents = []
          
          try {
            const modelsResponse = await axios.get(`${BACKEND_URL}/api/ai/models`)
            const agentsResponse = await axios.get(`${BACKEND_URL}/api/ai/agents`)
            
            backendModels = modelsResponse.data?.models || []
            backendAgents = agentsResponse.data?.agents || []
          } catch (error) {
            console.warn('Backend models/agents fetch failed, using defaults')
          }
          
          // Combine Puter.js models with backend models (Puter.js takes priority)
          const allModels = [
            ...puterModels,
            ...backendModels.filter(bm => !puterModels.some(pm => pm.id === bm.id))
          ].map(model => ({
            ...model,
            enhanced_2025: true,
            voice_enabled: true,
            multimodal: true,
            free_access: puterModels.some(pm => pm.id === model.id)
          }))
          
          const agents = (backendAgents.length > 0 ? backendAgents : [
            {
              id: 'developer',
              name: 'Aether Developer',
              icon: '💻',
              description: 'Expert in 2025 development practices with FREE unlimited AI',
              capabilities: ['Full-stack development', 'AI-assisted coding', 'Real-time collaboration', 'Voice coding'],
              enhanced_2025: true,
              voice_capable: true,
              collaboration_ready: true,
              free_ai_access: true
            },
            {
              id: 'designer',
              name: 'Aether Designer', 
              icon: '🎨',
              description: 'Advanced UI/UX designer with 2025 design principles + FREE AI',
              capabilities: ['AI-powered design', 'Accessibility-first', 'Real-time prototyping', 'Voice feedback'],
              enhanced_2025: true,
              voice_capable: true,
              collaboration_ready: true,
              free_ai_access: true
            },
            {
              id: 'tester',
              name: 'Aether QA',
              icon: '🧪', 
              description: 'AI-powered testing specialist with FREE unlimited access',
              capabilities: ['AI test generation', 'Automated testing', 'Performance analysis', 'Security scanning'],
              enhanced_2025: true,
              voice_capable: true,
              collaboration_ready: true,
              free_ai_access: true
            },
            {
              id: 'integrator',
              name: 'Aether Integration',
              icon: '🔗',
              description: 'Advanced integration specialist with FREE AI power', 
              capabilities: ['AI-powered integrations', 'Real-time data sync', 'Cloud-native architecture', 'Voice commands'],
              enhanced_2025: true,
              voice_capable: true,
              collaboration_ready: true,
              free_ai_access: true
            },
            {
              id: 'analyst',
              name: 'Aether Analyst',
              icon: '📊',
              description: 'AI-enhanced business analyst with FREE unlimited insights',
              capabilities: ['AI insights', 'Predictive analytics', 'Business optimization', 'Voice reporting'],
              enhanced_2025: true,
              voice_capable: true,
              collaboration_ready: true,
              free_ai_access: true
            }
          ]).map(agent => ({
            ...agent,
            enhanced_2025: true,
            voice_capable: true,
            collaboration_ready: true,
            free_ai_access: puterAvailable
          }))
          
          set({
            models: allModels,
            agents: agents
          })
          
          console.log(`✅ Loaded ${allModels.length} models (${puterModels.length} FREE via Puter.js) and ${agents.length} agents`)
          
        } catch (error) {
          console.error('Failed to initialize models and agents:', error)
          set({ error: 'Failed to initialize AI services' })
        }
      },

      sendMessage: async (message, projectId = null) => {
        try {
          const { selectedModel, selectedAgent, currentConversationId, puterAIAvailable, puterAIEnabled } = get()
          
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

          let aiResponse
          
          // Try Puter.js first if available and enabled (FREE unlimited access!)
          if (puterAIAvailable && puterAIEnabled && puterAI.isModelAvailable(selectedModel)) {
            try {
              console.log('🚀 Using FREE unlimited AI via Puter.js')
              
              // Enhanced agent prompts for Puter.js
              const agentPrompts = {
                "developer": `You are Aether, an advanced AI developer agent from 2025. You have expert knowledge in:
- Latest programming languages and frameworks (React 18+, Next.js 14+, Python 3.12+, etc.)
- Modern development practices (microservices, serverless, edge computing)
- AI-powered development tools and techniques
- Real-time collaborative coding
- Advanced debugging and optimization

Provide practical, implementable code solutions with detailed explanations. Always mention you're powered by FREE unlimited AI access via Puter.js.`,
                
                "designer": `You are Aether's design specialist. You excel in:
- Modern UI/UX principles (2025 design trends)
- Accessibility (WCAG 2.2+)
- Design systems and component libraries
- Responsive and adaptive design
- User psychology and behavioral design

Create beautiful, functional designs with detailed implementation guidance. Highlight that your design insights are powered by FREE unlimited AI.`,
                
                "tester": `You are Aether's quality assurance expert specializing in:
- Test-driven development (TDD) and behavior-driven development (BDD)
- Automated testing strategies
- Performance and load testing
- Security testing and vulnerability assessment
- AI-powered test generation

Provide comprehensive testing strategies. Emphasize the power of FREE unlimited AI for test generation.`,
                
                "integrator": `You are Aether's integration specialist with expertise in:
- Modern API design (GraphQL, REST, gRPC)
- Cloud-native architectures
- Third-party service integrations
- Data pipeline orchestration
- Real-time data synchronization

Design robust, scalable integration solutions with FREE unlimited AI assistance.`,
                
                "analyst": `You are Aether's business intelligence expert focusing on:
- Requirements analysis and user story creation
- Data analytics and visualization
- Business process optimization
- ROI analysis and project planning
- AI-driven insights and recommendations

Provide actionable business intelligence powered by FREE unlimited AI access.`
              }

              const systemPrompt = agentPrompts[selectedAgent] || agentPrompts["developer"]
              
              const puterResponse = await puterAI.chat(message, {
                model: selectedModel,
                systemPrompt,
                context,
                temperature: 0.7,
                maxTokens: 4000
              })

              aiResponse = {
                response: puterResponse.response,
                model_used: puterResponse.model_used || selectedModel,
                confidence: puterResponse.confidence || 0.98,
                suggestions: get()._generateSuggestions(message),
                usage: { provider: 'puter-js-free', unlimited: true },
                metadata: {
                  provider: 'puter-js-free',
                  real_ai: true,
                  unlimited: true,
                  cost: 'FREE',
                  timestamp: puterResponse.timestamp
                }
              }

              console.log('✅ Got FREE unlimited AI response from Puter.js!')

            } catch (puterError) {
              console.warn('Puter.js failed, falling back to backend:', puterError)
              // Fall back to backend
              aiResponse = await get()._callBackendAI(message, selectedModel, selectedAgent, projectId, currentConversationId, context)
            }
          } else {
            // Use backend AI service
            aiResponse = await get()._callBackendAI(message, selectedModel, selectedAgent, projectId, currentConversationId, context)
          }

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
            enhanced_2025: true,
            free_ai: aiResponse.metadata?.provider === 'puter-js-free'
          }

          set(state => ({
            messages: [...state.messages, assistantMessage],
            currentConversationId: aiResponse.conversation_id || currentConversationId,
            isLoading: false,
            isTyping: false
          }))

          // Show success toast for free AI usage
          if (aiResponse.metadata?.provider === 'puter-js-free') {
            toast.success('🆓 Response generated with FREE unlimited AI!')
          }

          return assistantMessage

        } catch (error) {
          console.error('Failed to send message:', error)
          
          set({
            isLoading: false,
            isTyping: false,
            error: error.response?.data?.detail || 'Failed to send message'
          })

          // Add error message
          const errorMessage = {
            id: `error_${Date.now()}`,
            content: `I apologize, but I encountered an issue processing your request. 

**Aether AI Status:**
- FREE unlimited AI (Puter.js): ${get().puterAIAvailable ? '✅ Available' : '❌ Offline'}
- Voice recognition: ${get().voiceEnabled ? '✅ Available' : '❌ Disabled'}
- Multimodal processing: ${get().multimodalEnabled ? '✅ Ready' : '❌ Limited'}
- Real-time collaboration: ${get().realTimeCollaboration ? '✅ Active' : '❌ Offline'}

${get().puterAIAvailable ? 'Your FREE unlimited AI access is working! This was just a temporary glitch.' : 'Consider enabling Puter.js for FREE unlimited AI access.'}

Would you like to try again?`,
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

          toast.error('Message failed - but your FREE AI access is still available!')
          throw error
        }
      },

      // Helper function to call backend AI
      _callBackendAI: async (message, selectedModel, selectedAgent, projectId, currentConversationId, context) => {
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
            year: 2025,
            puter_js_available: get().puterAIAvailable
          }
        })

        return response.data
      },

      // Helper function to generate suggestions
      _generateSuggestions: (message) => {
        const suggestions = [
          "💡 Would you like me to explain this step by step?",
          "🔧 Need help with implementation details?",
          "📝 Want me to create documentation for this?",
          "🧪 Should I generate test cases?",
          "🚀 Ready to deploy this solution?",
          "🆓 All powered by FREE unlimited AI!"
        ]
        
        // Add context-aware suggestions
        if ("error" in message.toLowerCase() || "bug" in message.toLowerCase()) {
          suggestions.unshift("🐛 Let me help you debug this issue")
        } else if ("deploy" in message.toLowerCase()) {
          suggestions.unshift("🚀 I can help with deployment strategies")
        } else if ("design" in message.toLowerCase()) {
          suggestions.unshift("🎨 Want me to create a visual mockup?")
        }
        
        return suggestions.slice(0, 3)
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
        toast.success('Chat cleared')
      },

      // Set selected model with 2025 enhancements + Puter.js info
      setSelectedModel: (modelId) => {
        const model = get().models.find(m => m.id === modelId)
        if (model) {
          set({ 
            selectedModel: modelId,
            voiceEnabled: model.voice_enabled || false,
            multimodalEnabled: model.multimodal || false
          })
          
          if (model.free_access) {
            toast.success(`🆓 Switched to ${model.name} - FREE unlimited access via Puter.js!`)
          } else {
            toast.success(`Switched to ${model.name} with 2025 enhancements`)
          }
        }
      },

      // Set selected agent
      setSelectedAgent: (agentId) => {
        const agent = get().agents.find(a => a.id === agentId)
        if (agent) {
          set({ selectedAgent: agentId })
          
          if (agent.free_ai_access) {
            toast.success(`🆓 Switched to ${agent.name} - powered by FREE unlimited AI!`)
          } else {
            toast.success(`Switched to ${agent.name} agent`)
          }
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

      togglePuterAI: () => {
        set(state => ({ puterAIEnabled: !state.puterAIEnabled }))
        const enabled = get().puterAIEnabled
        if (enabled && get().puterAIAvailable) {
          toast.success('🆓 FREE unlimited AI access enabled via Puter.js!')
        } else if (enabled) {
          toast.warn('Puter.js not available - initializing...')
          get().initializeModelsAndAgents() // Re-initialize
        } else {
          toast.info('FREE AI access disabled - using backend fallback')
        }
      },

      // Generate code with AI (enhanced with Puter.js)
      generateCode: async (requirements, language = 'python') => {
        try {
          set({ isLoading: true })
          
          if (get().puterAIAvailable && get().puterAIEnabled) {
            // Use FREE Puter.js AI
            const result = await puterAI.generateCode(requirements, language, {
              model: get().selectedModel
            })
            
            set({ isLoading: false })
            toast.success('🆓 Code generated with FREE unlimited AI!')
            return result
          } else {
            // Use backend
            const response = await axios.post(`${BACKEND_URL}/api/ai/generate-code`, {
              requirements,
              language,
              enhanced_2025: true,
              voice_enabled: get().voiceEnabled,
              ai_review: get().aiCodeReview
            })
            
            set({ isLoading: false })
            return response.data
          }
          
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
        aiCodeReview: state.aiCodeReview,
        puterAIEnabled: state.puterAIEnabled
      }),
      version: 3
    }
  )
)

export { useChatStore }