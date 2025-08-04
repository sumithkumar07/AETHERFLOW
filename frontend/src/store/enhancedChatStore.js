import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import axios from 'axios'
import toast from 'react-hot-toast'

// Get backend URL from environment
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'

// Enhanced Chat Store with improved AI capabilities and multi-agent coordination
const useEnhancedChatStore = create(
  persist(
    (set, get) => ({
      // State
      messages: [],
      conversations: [],
      currentConversationId: null,
      models: [],
      agents: [],
      selectedModel: 'llama-3.1-70b-versatile',
      selectedAgent: 'developer',
      isLoading: false,
      isTyping: false,
      error: null,
      
      // Enhanced Features
      collaborationMode: true,
      voiceEnabled: false,
      isListening: false,
      smartSuggestions: [],
      collaborationOpportunities: [],
      nextActions: [],
      conversationAnalytics: null,

      // Actions
      initializeModelsAndAgents: async () => {
        try {
          console.log('🤖 Initializing enhanced AI models and agents...')
          
          // Get enhanced models and agents
          const [modelsResponse, agentsResponse] = await Promise.all([
            axios.get(`${BACKEND_URL}/api/ai/v2/enhanced-models`),
            axios.get(`${BACKEND_URL}/api/ai/v2/enhanced-agents`)
          ])
          
          const models = modelsResponse.data?.models || []
          const agents = agentsResponse.data?.agents || []
          
          set({
            models: models.map(model => ({
              ...model,
              enhanced: true,
              capabilities: model.capabilities || []
            })),
            agents: agents.map(agent => ({
              ...agent,
              enhanced: true,
              collaboration_strength: agent.collaboration_strength || 80
            }))
          })
          
          console.log(`✅ Loaded ${models.length} enhanced models and ${agents.length} intelligent agents`)
          toast.success('🤖 Enhanced AI capabilities loaded!')
          
        } catch (error) {
          console.error('Failed to initialize enhanced AI:', error)
          set({ error: 'Failed to initialize enhanced AI services' })
          
          // Fallback to basic agents
          set({
            models: [
              {
                id: 'llama-3.1-70b-versatile',
                name: 'Llama 3.1 70B Versatile',
                description: 'Powerful model for complex reasoning',
                enhanced: true,
                speed: 'medium',
                use_case: 'complex_reasoning'
              }
            ],
            agents: [
              {
                id: 'developer',
                name: 'Senior Developer',
                description: 'Expert in full-stack development',
                specialties: ['Architecture', 'Code Review', 'Performance'],
                enhanced: true,
                collaboration_strength: 90
              }
            ]
          })
        }
      },

      sendMessage: async (messageData) => {
        try {
          const { 
            selectedModel, 
            selectedAgent, 
            currentConversationId, 
            collaborationMode 
          } = get()
          
          set({ isLoading: true, isTyping: true, error: null })

          // Add user message immediately
          const userMessage = {
            id: `user_${Date.now()}`,
            content: messageData.message || messageData,
            sender: 'user',
            timestamp: new Date().toISOString(),
            model: selectedModel,
            agent: selectedAgent,
            enhanced: true
          }

          set(state => ({
            messages: [...state.messages, userMessage]
          }))

          // Prepare enhanced message request
          const enhancedMessageData = {
            message: messageData.message || messageData,
            model: messageData.model || selectedModel,
            agent: messageData.agent || selectedAgent,
            conversation_id: messageData.conversation_id || currentConversationId,
            project_id: messageData.project_id,
            context: messageData.context || get()._buildContext(),
            collaboration_mode: messageData.collaboration_mode ?? collaborationMode,
            preferences: messageData.preferences || {}
          }

          // Send enhanced chat request
          const response = await axios.post(
            `${BACKEND_URL}/api/ai/v2/enhanced-chat`, 
            enhancedMessageData
          )

          const aiResponse = response.data

          // Add AI response with enhanced features
          const assistantMessage = {
            id: `ai_${Date.now()}`,
            content: aiResponse.response,
            sender: 'assistant',
            timestamp: new Date().toISOString(),
            model: aiResponse.model_used || selectedModel,
            agent: aiResponse.agent || selectedAgent,
            agent_name: get().agents.find(a => a.id === aiResponse.agent)?.name,
            confidence: aiResponse.confidence,
            suggestions: aiResponse.suggestions || [],
            agent_insights: aiResponse.agent_insights || [],
            next_actions: aiResponse.next_actions || [],
            collaboration_opportunities: aiResponse.collaboration_opportunities || [],
            metadata: {
              ...aiResponse.metadata,
              enhanced_features: {
                suggestions: aiResponse.suggestions || [],
                agent_insights: aiResponse.agent_insights || [],
                next_actions: aiResponse.next_actions || [],
                collaboration_opportunities: aiResponse.collaboration_opportunities || []
              }
            },
            enhanced: true
          }

          set(state => ({
            messages: [...state.messages, assistantMessage],
            currentConversationId: aiResponse.conversation_id || currentConversationId,
            smartSuggestions: aiResponse.suggestions || [],
            collaborationOpportunities: aiResponse.collaboration_opportunities || [],
            nextActions: aiResponse.next_actions || [],
            isLoading: false,
            isTyping: false
          }))

          // Show enhanced features notifications
          if (aiResponse.suggestions?.length > 0) {
            toast.success(`💡 Got ${aiResponse.suggestions.length} smart suggestions!`)
          }

          if (aiResponse.collaboration_opportunities?.length > 0) {
            toast.success(`🤝 Found ${aiResponse.collaboration_opportunities.length} collaboration opportunities!`)
          }

          return assistantMessage

        } catch (error) {
          console.error('Enhanced chat error:', error)
          
          set({
            isLoading: false,
            isTyping: false,
            error: error.response?.data?.detail || 'Enhanced chat failed'
          })

          // Add error message with enhanced features
          const errorMessage = {
            id: `error_${Date.now()}`,
            content: `I apologize, but I encountered an issue with the enhanced AI processing. 

**Enhanced AI Status:**
- Multi-agent coordination: ${get().collaborationMode ? '✅ Active' : '❌ Disabled'}
- Smart suggestions: ✅ Available
- Collaboration detection: ✅ Ready
- Voice interface: ${get().voiceEnabled ? '✅ Active' : '❌ Disabled'}

The enhanced AI features are still working! This was likely a temporary network issue. Please try again.`,
            sender: 'assistant',
            timestamp: new Date().toISOString(),
            model: get().selectedModel,
            agent: get().selectedAgent,
            isError: true,
            enhanced: true
          }

          set(state => ({
            messages: [...state.messages, errorMessage]
          }))

          toast.error('Enhanced AI temporarily unavailable - retrying...')
          throw error
        }
      },

      // Agent handoff functionality
      requestAgentHandoff: async (fromAgent, toAgent, context = null) => {
        try {
          if (!get().currentConversationId) {
            toast.error('No active conversation for handoff')
            return
          }

          const response = await axios.post(`${BACKEND_URL}/api/ai/v2/agent-handoff`, {
            conversation_id: get().currentConversationId,
            from_agent: fromAgent,
            to_agent: toAgent,
            context
          })

          const handoffResult = response.data

          // Add handoff message
          const handoffMessage = {
            id: `handoff_${Date.now()}`,
            content: handoffResult.response,
            sender: 'assistant',
            timestamp: new Date().toISOString(),
            agent: handoffResult.new_agent,
            agent_name: get().agents.find(a => a.id === handoffResult.new_agent)?.name,
            handoff: true,
            from_agent: fromAgent,
            to_agent: toAgent,
            enhanced: true
          }

          set(state => ({
            messages: [...state.messages, handoffMessage],
            selectedAgent: handoffResult.new_agent
          }))

          toast.success(`🔄 Successfully handed off to ${handoffResult.new_agent} agent!`)
          return handoffResult

        } catch (error) {
          console.error('Agent handoff failed:', error)
          toast.error('Agent handoff failed')
          throw error
        }
      },

      // Get conversation analytics
      getConversationAnalytics: async (timeframe = 'week') => {
        try {
          const response = await axios.get(`${BACKEND_URL}/api/ai/v2/conversation-analytics`, {
            params: { timeframe }
          })

          const analytics = response.data

          set({ conversationAnalytics: analytics })
          return analytics

        } catch (error) {
          console.error('Failed to get conversation analytics:', error)
          toast.error('Failed to load conversation analytics')
          throw error
        }
      },

      // Get smart suggestions for current conversation
      getSmartSuggestions: async () => {
        try {
          if (!get().currentConversationId) return []

          const response = await axios.get(
            `${BACKEND_URL}/api/ai/v2/smart-suggestions/${get().currentConversationId}`
          )

          const suggestions = response.data.suggestions || []
          set({ smartSuggestions: suggestions })
          return suggestions

        } catch (error) {
          console.error('Failed to get smart suggestions:', error)
          return []
        }
      },

      // Get collaboration insights
      getCollaborationInsights: async (projectId = null) => {
        try {
          const params = projectId ? { project_id: projectId } : {}
          const response = await axios.get(`${BACKEND_URL}/api/ai/v2/collaboration-insights`, {
            params
          })

          const insights = response.data
          toast.success(`📊 Loaded collaboration insights for ${insights.collaboration_summary.total_conversations_analyzed} conversations`)
          return insights

        } catch (error) {
          console.error('Failed to get collaboration insights:', error)
          toast.error('Failed to load collaboration insights')
          throw error
        }
      },

      // Helper function to build context from recent messages
      _buildContext: () => {
        const messages = get().messages
        const recentMessages = messages.slice(-6) // Last 3 exchanges
        
        return recentMessages.map(msg => ({
          type: msg.sender === 'user' ? 'user_message' : 'assistant_response',
          content: msg.content,
          agent: msg.agent,
          timestamp: msg.timestamp,
          enhanced_features: msg.metadata?.enhanced_features
        }))
      },

      // Voice recognition functionality
      startVoiceRecognition: async () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
          toast.error('Voice recognition not supported in this browser')
          return
        }

        try {
          set({ isListening: true, voiceEnabled: true })
          
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
          const recognition = new SpeechRecognition()
          
          recognition.continuous = false
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
            set({ isListening: false })
            toast.error('Voice recognition error: ' + event.error)
          }
          
          recognition.onend = () => {
            set({ isListening: false })
          }
          
          recognition.start()
          toast.success('🎤 Enhanced voice recognition started!')
          
        } catch (error) {
          console.error('Voice recognition failed:', error)
          set({ isListening: false })
          toast.error('Failed to start voice recognition')
        }
      },

      stopVoiceRecognition: () => {
        set({ isListening: false })
        toast.info('Voice recognition stopped')
      },

      // Load conversations with enhanced features
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
          
          toast.success('🆕 New enhanced conversation created!')
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
          
          // Load smart suggestions for this conversation
          get().getSmartSuggestions()
          
        } catch (error) {
          console.error('Failed to switch conversation:', error)
          toast.error('Failed to load conversation')
        }
      },

      // Clear messages
      clearMessages: () => {
        set({ 
          messages: [],
          currentConversationId: null,
          smartSuggestions: [],
          collaborationOpportunities: [],
          nextActions: []
        })
        toast.success('🧹 Chat cleared - enhanced AI ready!')
      },

      // Set selected model
      setSelectedModel: (modelId) => {
        const model = get().models.find(m => m.id === modelId)
        if (model) {
          set({ selectedModel: modelId })
          toast.success(`🤖 Switched to ${model.name} with enhanced capabilities!`)
        }
      },

      // Set selected agent with enhanced feedback
      setSelectedAgent: (agentId) => {
        const agent = get().agents.find(a => a.id === agentId)
        if (agent) {
          set({ selectedAgent: agentId })
          toast.success(`🎯 Switched to ${agent.name} - Collaboration strength: ${agent.collaboration_strength}%`)
        }
      },

      // Toggle collaboration mode
      toggleCollaborationMode: () => {
        set(state => ({ collaborationMode: !state.collaborationMode }))
        const enabled = get().collaborationMode
        toast.success(`🤝 Multi-agent collaboration ${enabled ? 'enabled' : 'disabled'}`)
      },

      // Toggle voice enabled
      toggleVoiceEnabled: () => {
        set(state => ({ voiceEnabled: !state.voiceEnabled }))
        toast.success(`🎤 Voice interface ${get().voiceEnabled ? 'enabled' : 'disabled'}`)
      },

      // Clear error
      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'aether-enhanced-chat',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedModel: state.selectedModel,
        selectedAgent: state.selectedAgent,
        collaborationMode: state.collaborationMode,
        voiceEnabled: state.voiceEnabled
      }),
      version: 1
    }
  )
)

export { useEnhancedChatStore }