import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { aiAPI } from '../services/api'
import { websocketService } from '../services/api'
import toast from 'react-hot-toast'

export const useChatStore = create(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversation: null,
      isLoading: false,
      isConnected: false,
      
      // Initialize WebSocket connection
      initializeWebSocket: () => {
        const clientId = Date.now().toString()
        websocketService.connect(clientId)
        
        websocketService.on('connected', () => {
          set({ isConnected: true })
        })
        
        websocketService.on('disconnected', () => {
          set({ isConnected: false })
        })
        
        websocketService.on('message', (data) => {
          if (data.type === 'ai_response') {
            // Handle real-time AI response
            get().addMessage({
              role: 'assistant',
              content: data.content,
              type: 'text',
              timestamp: data.timestamp
            })
            set({ isLoading: false })
          }
        })
      },
      
      loadConversations: async () => {
        try {
          const response = await aiAPI.getConversations()
          set({ conversations: response.conversations })
        } catch (error) {
          console.error('Error loading conversations:', error)
          toast.error('Failed to load conversations')
        }
      },
      
      createConversation: async (title = 'New Conversation', projectId = null) => {
        try {
          const response = await aiAPI.createConversation(title, projectId)
          const newConversation = response
          
          set(state => ({
            conversations: [newConversation, ...state.conversations],
            currentConversation: newConversation
          }))
          
          return newConversation
        } catch (error) {
          console.error('Error creating conversation:', error)
          toast.error('Failed to create conversation')
          return null
        }
      },
      
      selectConversation: async (conversationId) => {
        try {
          const response = await aiAPI.getConversation(conversationId)
          set({ currentConversation: response })
        } catch (error) {
          console.error('Error loading conversation:', error)
          toast.error('Failed to load conversation')
        }
      },
      
      addMessage: (message) => {
        const currentConversation = get().currentConversation
        if (!currentConversation) return
        
        const updatedMessage = {
          ...message,
          id: Date.now().toString(),
          timestamp: message.timestamp || new Date().toISOString()
        }
        
        set(state => ({
          conversations: state.conversations.map(conv => 
            conv._id === currentConversation._id 
              ? {
                  ...conv,
                  messages: [...(conv.messages || []), updatedMessage],
                  updated_at: new Date().toISOString()
                }
              : conv
          ),
          currentConversation: {
            ...currentConversation,
            messages: [...(currentConversation.messages || []), updatedMessage],
            updated_at: new Date().toISOString()
          }
        }))
      },
      
      sendMessage: async (content, context = null) => {
        let currentConversation = get().currentConversation
        
        if (!currentConversation) {
          currentConversation = await get().createConversation()
          if (!currentConversation) return
        }
        
        // Add user message immediately
        get().addMessage({
          role: 'user',
          content,
          type: 'text'
        })
        
        set({ isLoading: true })
        
        try {
          const response = await aiAPI.chat(
            content,
            currentConversation._id,
            context
          )
          
          // Add AI response
          get().addMessage({
            role: 'assistant',
            content: response.response.content,
            type: response.response.type || 'text',
            metadata: response.response.metadata || {}
          })
          
        } catch (error) {
          console.error('AI Error:', error)
          get().addMessage({
            role: 'assistant',
            content: 'Sorry, I encountered an error processing your request. Please try again.',
            type: 'error'
          })
          toast.error('Failed to send message')
        } finally {
          set({ isLoading: false })
        }
      },
      
      deleteConversation: async (conversationId) => {
        try {
          await aiAPI.deleteConversation(conversationId)
          
          set(state => {
            const newConversations = state.conversations.filter(c => c._id !== conversationId)
            const newCurrentConversation = state.currentConversation?._id === conversationId 
              ? (newConversations[0] || null) 
              : state.currentConversation
              
            return {
              conversations: newConversations,
              currentConversation: newCurrentConversation
            }
          })
          
          toast.success('Conversation deleted')
        } catch (error) {
          console.error('Error deleting conversation:', error)
          toast.error('Failed to delete conversation')
        }
      },
      
      clearAllConversations: () => {
        set({
          conversations: [],
          currentConversation: null
        })
      },
      
      // Real-time collaboration
      sendCollaborationMessage: (projectId, message) => {
        websocketService.send({
          type: 'collaboration',
          project_id: projectId,
          message
        })
      }
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversation: state.currentConversation
      })
    }
  )
)