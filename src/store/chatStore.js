import { create } from 'zustand'
import axios from 'axios'
import toast from 'react-hot-toast'

const useChatStore = create((set, get) => ({
  // State
  messages: [],
  conversations: [],
  currentConversation: null,
  loading: false,
  error: null,
  selectedModel: 'gpt-4.1-nano',
  selectedAgent: 'developer',

  // Actions
  sendMessage: async (messageData) => {
    try {
      set({ loading: true, error: null })
      
      // Add user message to local state immediately
      const userMessage = {
        id: Date.now().toString(),
        content: messageData.content,
        sender: 'user',
        timestamp: new Date().toISOString(),
        model: messageData.model,
        agent: messageData.agent
      }
      
      set(state => ({
        messages: [...state.messages, userMessage]
      }))
      
      // Send to backend
      const response = await axios.post('/ai/chat', {
        message: messageData.content,
        model: messageData.model || get().selectedModel,
        agent: messageData.agent || get().selectedAgent,
        project_id: messageData.projectId,
        conversation_id: get().currentConversation?.id
      })
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: response.data.response,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        model: response.data.model_used,
        agent: messageData.agent || get().selectedAgent
      }
      
      set(state => ({
        messages: [...state.messages, aiMessage],
        loading: false
      }))
      
      return { success: true, message: aiMessage }
      
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to send message'
      set({ error: errorMessage, loading: false })
      return { success: false, error: errorMessage }
    }
  },

  fetchMessages: async (projectId) => {
    try {
      set({ loading: true, error: null })
      const response = await axios.get(`/ai/conversations?project_id=${projectId}`)
      
      // For now, we'll use a simple message structure
      // In a real app, you'd fetch actual conversation history
      set({ 
        messages: response.data.messages || [],
        conversations: response.data.conversations || [],
        loading: false 
      })
      
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to fetch messages'
      set({ error: errorMessage, loading: false })
      return { success: false, error: errorMessage }
    }
  },

  setSelectedModel: (model) => {
    set({ selectedModel: model })
  },

  setSelectedAgent: (agent) => {
    set({ selectedAgent: agent })
  },

  clearMessages: () => {
    set({ messages: [], currentConversation: null })
  },

  clearError: () => {
    set({ error: null })
  }
}))

export { useChatStore }