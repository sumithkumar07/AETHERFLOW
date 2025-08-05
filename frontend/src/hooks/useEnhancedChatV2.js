import { useState, useRef, useCallback, useEffect } from 'react'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { toast } from 'react-hot-toast'
import { apiService } from '../services/api'

// Enhanced Chat Store with Advanced State Management
const useEnhancedChatStore = create(
  devtools(
    persist(
      (set, get) => ({
        // Core state
        messages: [],
        isLoading: false,
        error: null,
        
        // Enhanced features
        selectedAgent: 'developer',
        selectedModel: 'llama-3.1-70b-versatile',
        collaborationMode: true,
        multiAgentMode: false,
        
        // Agent and model data
        agents: [],
        models: [],
        
        // Conversation management
        currentConversationId: null,
        conversations: [],
        conversationInsights: null,
        
        // Advanced features
        agentCoordination: null,
        smartSuggestions: [],
        conversationQuality: {},
        
        // Voice integration
        isListening: false,
        voiceEnabled: false,
        
        // Performance tracking
        responseTime: null,
        tokenUsage: { input: 0, output: 0, total: 0 },
        
        // Actions
        setMessages: (messages) => set({ messages }, false, 'setMessages'),
        setLoading: (isLoading) => set({ isLoading }, false, 'setLoading'),
        setError: (error) => set({ error }, false, 'setError'),
        
        addMessage: (message) => set(
          (state) => ({ 
            messages: [...state.messages, { 
              ...message, 
              id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              timestamp: new Date().toISOString()
            }] 
          }),
          false,
          'addMessage'
        ),
        
        updateLastMessage: (updates) => set(
          (state) => {
            const messages = [...state.messages]
            const lastIndex = messages.length - 1
            if (lastIndex >= 0) {
              messages[lastIndex] = { ...messages[lastIndex], ...updates }
            }
            return { messages }
          },
          false,
          'updateLastMessage'
        ),
        
        clearMessages: () => set(
          { 
            messages: [], 
            currentConversationId: null,
            conversationInsights: null,
            agentCoordination: null
          },
          false,
          'clearMessages'
        ),
        
        // Enhanced agent management
        setSelectedAgent: (agent) => set({ selectedAgent: agent }, false, 'setSelectedAgent'),
        setSelectedModel: (model) => set({ selectedModel: model }, false, 'setSelectedModel'),
        setCollaborationMode: (mode) => set({ collaborationMode: mode }, false, 'setCollaborationMode'),
        setMultiAgentMode: (mode) => set({ multiAgentMode: mode }, false, 'setMultiAgentMode'),
        
        // Initialize agents and models
        initializeModelsAndAgents: async () => {
          try {
            const [modelsResponse, agentsResponse] = await Promise.all([
              apiService.getAIModels(),
              apiService.getAIAgents()
            ])
            
            set({ 
              models: modelsResponse || [],
              agents: agentsResponse || []
            }, false, 'initializeModelsAndAgents')
            
          } catch (error) {
            console.error('Failed to initialize models and agents:', error)
            toast.error('Failed to load AI configuration')
          }
        },
        
        // Enhanced message sending with coordination
        sendMessage: async (messageData) => {
          const state = get()
          const startTime = Date.now()
          
          set({ isLoading: true, error: null }, false, 'sendMessage:start')
          
          // Add user message
          const userMessage = {
            content: messageData.message,
            sender: 'user',
            agent: messageData.agent || state.selectedAgent,
            model: messageData.model || state.selectedModel
          }
          
          state.addMessage(userMessage)
          
          try {
            // Use advanced AI chat endpoint
            const response = await fetch(`${apiService.baseURL}/api/enhanced-ai/advanced-chat`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                message: messageData.message,
                agent: messageData.agent || state.selectedAgent,
                model: messageData.model || state.selectedModel,
                conversation_id: state.currentConversationId,
                project_id: messageData.project_id,
                enable_coordination: state.collaborationMode,
                multi_agent_mode: state.multiAgentMode,
                preferences: {
                  collaboration_mode: state.collaborationMode,
                  voice_enabled: state.voiceEnabled
                }
              })
            })
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            }
            
            const data = await response.json()
            const responseTime = Date.now() - startTime
            
            // Add AI response message
            const aiMessage = {
              content: data.response,
              sender: 'assistant',
              agent: data.agent,
              agent_name: data.agent,
              model_used: data.model_used,
              confidence: data.confidence,
              suggestions: data.suggestions || [],
              agent_insights: data.agent_insights || [],
              next_actions: data.next_actions || [],
              collaboration_opportunities: data.collaboration_opportunities || [],
              metadata: {
                ...data.metadata,
                enhanced_features: {
                  suggestions: data.suggestions || [],
                  agent_insights: data.agent_insights || [],
                  next_actions: data.next_actions || [],
                  collaboration_opportunities: data.collaboration_opportunities || []
                }
              }
            }
            
            state.addMessage(aiMessage)
            
            // Update state with enhanced data
            set({
              isLoading: false,
              currentConversationId: data.conversation_id,
              agentCoordination: data.multi_agent_coordination,
              conversationQuality: data.conversation_quality,
              smartSuggestions: data.suggestions || [],
              responseTime,
              tokenUsage: {
                input: data.metadata?.input_tokens || 0,
                output: data.metadata?.output_tokens || 0,
                total: data.metadata?.tokens_used || 0
              }
            }, false, 'sendMessage:success')
            
            return data
            
          } catch (error) {
            console.error('Send message error:', error)
            set({ 
              isLoading: false, 
              error: error.message || 'Failed to send message' 
            }, false, 'sendMessage:error')
            
            toast.error('Failed to send message. Please try again.')
            throw error
          }
        },
        
        // Multi-agent collaboration
        initiateMultiAgentChat: async (message, options = {}) => {
          try {
            const response = await fetch(`${apiService.baseURL}/api/enhanced-ai/multi-agent-chat`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                message,
                task_complexity: options.complexity || 'auto',
                preferred_agents: options.agents || [],
                project_id: options.project_id,
                conversation_id: get().currentConversationId
              })
            })
            
            const data = await response.json()
            
            set({
              agentCoordination: {
                workflow_id: data.workflow_id,
                agents_assigned: data.agents_assigned,
                coordination_plan: data.coordination_plan,
                task_analysis: data.task_analysis
              },
              multiAgentMode: true
            }, false, 'initiateMultiAgentChat')
            
            return data
            
          } catch (error) {
            console.error('Multi-agent chat error:', error)
            toast.error('Failed to initialize multi-agent collaboration')
            throw error
          }
        },
        
        // Get conversation analysis
        analyzeConversation: async (conversationId, depth = 'standard') => {
          try {
            const response = await fetch(`${apiService.baseURL}/api/enhanced-ai/conversation-analysis`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                conversation_id: conversationId || get().currentConversationId,
                analysis_depth: depth
              })
            })
            
            const data = await response.json()
            
            set({
              conversationInsights: data.insights
            }, false, 'analyzeConversation')
            
            return data
            
          } catch (error) {
            console.error('Conversation analysis error:', error)
            throw error
          }
        },
        
        // Get intelligent suggestions
        getSmartSuggestions: async (context = {}) => {
          try {
            const state = get()
            const params = new URLSearchParams({
              context: context.message || '',
              agent: context.agent || state.selectedAgent,
              complexity: context.complexity || 'medium'
            })
            
            const response = await fetch(
              `${apiService.baseURL}/api/enhanced-ai/intelligent-suggestions?${params}`,
              {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              }
            )
            
            const data = await response.json()
            
            set({
              smartSuggestions: data.suggestions || []
            }, false, 'getSmartSuggestions')
            
            return data
            
          } catch (error) {
            console.error('Smart suggestions error:', error)
            return { suggestions: [] }
          }
        },
        
        // Voice integration
        setVoiceEnabled: (enabled) => set({ voiceEnabled: enabled }, false, 'setVoiceEnabled'),
        setIsListening: (listening) => set({ isListening: listening }, false, 'setIsListening'),
        
        startVoiceRecognition: () => {
          if ('webkitSpeechRecognition' in window) {
            set({ isListening: true }, false, 'startVoiceRecognition')
            // Voice recognition logic handled in component
          } else {
            toast.error('Voice recognition not supported in this browser')
          }
        },
        
        stopVoiceRecognition: () => {
          set({ isListening: false }, false, 'stopVoiceRecognition')
        },
        
        // Agent handoff
        requestAgentHandoff: async (fromAgent, toAgent, context = '') => {
          try {
            const response = await fetch(`${apiService.baseURL}/api/enhanced-ai/agent-handoff`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                conversation_id: get().currentConversationId,
                from_agent: fromAgent,
                to_agent: toAgent,
                context
              })
            })
            
            const data = await response.json()
            
            if (data.success) {
              set({ selectedAgent: data.new_agent }, false, 'requestAgentHandoff')
              toast.success(`Successfully handed off to ${data.new_agent} agent`)
            }
            
            return data
            
          } catch (error) {
            console.error('Agent handoff error:', error)
            toast.error('Failed to handoff to new agent')
          }
        },
        
        // Coordination status
        getCoordinationStatus: async (workflowId) => {
          try {
            const response = await fetch(
              `${apiService.baseURL}/api/enhanced-ai/coordination-status/${workflowId}`,
              {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              }
            )
            
            return await response.json()
            
          } catch (error) {
            console.error('Coordination status error:', error)
            return null
          }
        }
      }),
      {
        name: 'enhanced-chat-v2',
        partialize: (state) => ({
          selectedAgent: state.selectedAgent,
          selectedModel: state.selectedModel,
          collaborationMode: state.collaborationMode,
          multiAgentMode: state.multiAgentMode,
          voiceEnabled: state.voiceEnabled,
          conversations: state.conversations
        })
      }
    ),
    { name: 'enhanced-chat-store' }
  )
)

// Enhanced Chat Hook with Advanced Features
export const useEnhancedChatV2 = () => {
  const store = useEnhancedChatStore()
  const [localState, setLocalState] = useState({
    inputValue: '',
    isRecording: false,
    suggestions: []
  })
  
  // Speech recognition setup
  const recognition = useRef(null)
  const speechSynthesis = useRef(null)
  
  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognition.current = new SpeechRecognition()
      recognition.current.continuous = false
      recognition.current.interimResults = true
      recognition.current.lang = 'en-US'
      
      recognition.current.onstart = () => {
        store.setIsListening(true)
        setLocalState(prev => ({ ...prev, isRecording: true }))
      }
      
      recognition.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('')
        
        setLocalState(prev => ({ ...prev, inputValue: transcript }))
      }
      
      recognition.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        store.setIsListening(false)
        setLocalState(prev => ({ ...prev, isRecording: false }))
        toast.error('Voice recognition failed')
      }
      
      recognition.current.onend = () => {
        store.setIsListening(false)
        setLocalState(prev => ({ ...prev, isRecording: false }))
      }
    }
    
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesis.current = window.speechSynthesis
    }
  }, [store])
  
  // Advanced message sending with preprocessing
  const sendEnhancedMessage = useCallback(async (message, options = {}) => {
    if (!message.trim()) return
    
    try {
      // Pre-process message for better AI understanding
      const enhancedMessage = {
        message: message.trim(),
        agent: options.agent || store.selectedAgent,
        model: options.model || store.selectedModel,
        project_id: options.projectId,
        collaboration_mode: store.collaborationMode,
        multi_agent_mode: store.multiAgentMode,
        ...options
      }
      
      // Get smart suggestions before sending
      await store.getSmartSuggestions({ message, agent: enhancedMessage.agent })
      
      // Send message with enhanced features
      const response = await store.sendMessage(enhancedMessage)
      
      // Clear input
      setLocalState(prev => ({ ...prev, inputValue: '' }))
      
      // Speak response if voice is enabled and synthesis available
      if (store.voiceEnabled && speechSynthesis.current && response.response) {
        const utterance = new SpeechSynthesisUtterance(response.response)
        utterance.rate = 0.9
        utterance.pitch = 1
        speechSynthesis.current.speak(utterance)
      }
      
      return response
      
    } catch (error) {
      console.error('Enhanced message send error:', error)
      throw error
    }
  }, [store])
  
  // Start voice input
  const startVoiceInput = useCallback(() => {
    if (recognition.current) {
      recognition.current.start()
    } else {
      toast.error('Voice input not supported')
    }
  }, [])
  
  // Stop voice input
  const stopVoiceInput = useCallback(() => {
    if (recognition.current) {
      recognition.current.stop()
    }
  }, [])
  
  // Toggle collaboration mode
  const toggleCollaborationMode = useCallback(() => {
    const newMode = !store.collaborationMode
    store.setCollaborationMode(newMode)
    toast.success(`Collaboration mode ${newMode ? 'enabled' : 'disabled'}`)
  }, [store.collaborationMode])
  
  // Switch agent with context preservation
  const switchAgent = useCallback(async (newAgent, reason = '') => {
    const oldAgent = store.selectedAgent
    store.setSelectedAgent(newAgent)
    
    // Optional: Send context message about agent switch
    if (store.currentConversationId && reason) {
      const contextMessage = `Switching from ${oldAgent} to ${newAgent} agent. Context: ${reason}`
      await sendEnhancedMessage(contextMessage, { 
        agent: newAgent,
        system_message: true 
      })
    }
    
    toast.success(`Switched to ${newAgent} agent`)
  }, [store, sendEnhancedMessage])
  
  // Get contextual suggestions
  const getContextualSuggestions = useCallback(async (context = '') => {
    try {
      const suggestions = await store.getSmartSuggestions({
        message: context,
        agent: store.selectedAgent
      })
      
      setLocalState(prev => ({ 
        ...prev, 
        suggestions: suggestions.suggestions || [] 
      }))
      
      return suggestions
      
    } catch (error) {
      console.error('Failed to get suggestions:', error)
      return { suggestions: [] }
    }
  }, [store])
  
  // Performance metrics
  const getPerformanceMetrics = useCallback(() => {
    return {
      responseTime: store.responseTime,
      tokenUsage: store.tokenUsage,
      messagesCount: store.messages.length,
      conversationQuality: store.conversationQuality,
      agentCoordination: store.agentCoordination
    }
  }, [store])
  
  return {
    // Core state
    ...store,
    
    // Local state
    inputValue: localState.inputValue,
    setInputValue: (value) => setLocalState(prev => ({ ...prev, inputValue: value })),
    isRecording: localState.isRecording,
    suggestions: localState.suggestions,
    
    // Enhanced actions
    sendEnhancedMessage,
    startVoiceInput,
    stopVoiceInput,
    toggleCollaborationMode,
    switchAgent,
    getContextualSuggestions,
    getPerformanceMetrics,
    
    // Utility functions
    canUseVoice: !!recognition.current,
    canUseSpeech: !!speechSynthesis.current,
    
    // Computed values
    hasActiveCoordination: !!store.agentCoordination,
    isMultiAgentActive: store.multiAgentMode && !!store.agentCoordination,
    conversationLength: store.messages.length,
    currentAgent: store.agents.find(agent => agent.id === store.selectedAgent),
    currentModel: store.models.find(model => model.id === store.selectedModel)
  }
}

export default useEnhancedChatV2