import { create } from 'zustand'

export const useChatStore = create((set, get) => ({
  conversations: [],
  currentConversation: null,
  isLoading: false,
  
  createConversation: (title = 'New Conversation') => {
    const newConversation = {
      id: Date.now().toString(),
      title,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    set(state => ({
      conversations: [newConversation, ...state.conversations],
      currentConversation: newConversation
    }))
    
    return newConversation
  },
  
  selectConversation: (conversationId) => {
    const conversation = get().conversations.find(c => c.id === conversationId)
    if (conversation) {
      set({ currentConversation: conversation })
    }
  },
  
  addMessage: (message) => {
    const currentConversation = get().currentConversation
    if (!currentConversation) return
    
    const updatedMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    }
    
    set(state => ({
      conversations: state.conversations.map(conv => 
        conv.id === currentConversation.id 
          ? {
              ...conv,
              messages: [...conv.messages, updatedMessage],
              updatedAt: new Date().toISOString()
            }
          : conv
      ),
      currentConversation: {
        ...currentConversation,
        messages: [...currentConversation.messages, updatedMessage],
        updatedAt: new Date().toISOString()
      }
    }))
  },
  
  sendMessage: async (content, model = 'gpt-4.1-nano') => {
    const currentConversation = get().currentConversation
    if (!currentConversation) {
      get().createConversation()
    }
    
    // Add user message
    get().addMessage({
      role: 'user',
      content,
      type: 'text'
    })
    
    set({ isLoading: true })
    
    try {
      // Enhanced prompt for AI Code Studio
      const enhancedPrompt = `You are an expert AI development assistant for AI Code Studio, a platform similar to Emergent.ai. You help developers build applications through conversation.

User Request: ${content}

Please provide a helpful response that includes:
1. Clear explanation of what you can help with
2. Code examples when relevant (use proper markdown formatting)
3. Step-by-step guidance
4. Best practices and recommendations
5. Ask follow-up questions to better understand their needs

Focus on practical, actionable advice for building modern web applications, APIs, and integrations.`
      
      // Use Puter.js AI
      const response = await window.puter.ai.chat(enhancedPrompt, { 
        model: model,
        temperature: 0.7,
        max_tokens: 2000
      })
      
      let aiContent = ''
      
      // Handle different response formats based on model
      if (response.message && response.message.content) {
        if (Array.isArray(response.message.content)) {
          aiContent = response.message.content[0].text || response.message.content[0]
        } else {
          aiContent = response.message.content
        }
      } else if (response.content) {
        aiContent = response.content
      } else if (typeof response === 'string') {
        aiContent = response
      } else {
        aiContent = response.choices?.[0]?.message?.content || JSON.stringify(response)
      }
      
      // Add AI response
      get().addMessage({
        role: 'assistant',
        content: aiContent,
        type: 'text',
        model: model
      })
      
    } catch (error) {
      console.error('Puter.js AI Error:', error)
      
      // Fallback response with helpful information
      const fallbackResponse = `I'm your AI development assistant! I can help you with:

🚀 **Application Development:**
• React, Vue, Angular frontends
• Node.js, Python, FastAPI backends
• Database design and integration
• Authentication systems

💻 **Code Generation:**
• Components and functions
• API endpoints and routes
• Database models and queries
• Complete project structures

🔧 **Integrations & Deployment:**
• Third-party service integrations
• Cloud deployment strategies
• CI/CD pipeline setup
• Performance optimization

What would you like to build today? Be specific about your requirements and I'll provide detailed guidance!`

      get().addMessage({
        role: 'assistant',
        content: fallbackResponse,
        type: 'text',
        error: true
      })
    } finally {
      set({ isLoading: false })
    }
  },
  
  deleteConversation: (conversationId) => {
    set(state => {
      const newConversations = state.conversations.filter(c => c.id !== conversationId)
      const newCurrentConversation = state.currentConversation?.id === conversationId 
        ? (newConversations[0] || null) 
        : state.currentConversation
        
      return {
        conversations: newConversations,
        currentConversation: newCurrentConversation
      }
    })
  },
  
  clearAllConversations: () => {
    set({
      conversations: [],
      currentConversation: null
    })
  }
}))