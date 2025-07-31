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
  
  sendMessage: async (content) => {
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
      // Mock AI response for demo - replace with Puter.js AI in production
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
      
      let response = "I'm a demo AI assistant! I can help you build applications with code. "
      
      if (content.toLowerCase().includes('react')) {
        response = `I can help you build a React application! Here's a basic structure:

\`\`\`jsx
import React from 'react';

function App() {
  return (
    <div className="App">
      <h1>Welcome to your React App!</h1>
      <p>Let's build something amazing together!</p>
    </div>
  );
}

export default App;
\`\`\`

What specific features would you like to add to your React app?`
      } else if (content.toLowerCase().includes('api') || content.toLowerCase().includes('backend')) {
        response = `I can help you create API endpoints! Here's a FastAPI example:

\`\`\`python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.get("/users/{user_id}")
def read_user(user_id: int):
    return {"user_id": user_id, "name": "Demo User"}
\`\`\`

Would you like me to add authentication, database integration, or other features?`
      } else if (content.toLowerCase().includes('database')) {
        response = `I can help you set up a database! Here are some options:

1. **MongoDB** - NoSQL, great for flexible schemas
2. **PostgreSQL** - Powerful relational database
3. **SQLite** - Lightweight, perfect for development

Which database would you prefer? I can show you how to integrate it with your application.`
      } else {
        response += "I can help you with:\n\n• React/Vue/Angular frontends\n• Node.js/Python backends\n• Database integration\n• API development\n• Authentication systems\n• Deployment strategies\n\nWhat would you like to build today?"
      }
      
      // Add AI response
      get().addMessage({
        role: 'assistant',
        content: response,
        type: 'text'
      })
      
    } catch (error) {
      console.error('AI Error:', error)
      get().addMessage({
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        type: 'error'
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