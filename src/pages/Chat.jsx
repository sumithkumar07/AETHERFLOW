import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  PaperAirplaneIcon, 
  PlusIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  CodeBracketIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { useChatStore } from '../store/chatStore'
import ChatSidebar from '../components/ChatSidebar'
import ChatMessage from '../components/ChatMessage'
import toast from 'react-hot-toast'

const Chat = () => {
  const {
    conversations,
    currentConversation,
    isLoading,
    createConversation,
    selectConversation,
    sendMessage,
    deleteConversation
  } = useChatStore()

  const [input, setInput] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentConversation?.messages])

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [input])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const message = input.trim()
    setInput('')
    
    if (!currentConversation) {
      createConversation('New Chat')
    }

    try {
      await sendMessage(message)
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  const handleNewChat = () => {
    createConversation()
    setInput('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const suggestions = [
    {
      icon: CodeBracketIcon,
      title: "Build a React App",
      description: "Create a modern React application with routing and state management"
    },
    {
      icon: SparklesIcon,
      title: "Add Authentication",
      description: "Integrate user login and signup functionality"
    },
    {
      icon: DocumentTextIcon,
      title: "Create API Endpoints",
      description: "Build RESTful API with database integration"
    }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        conversations={conversations}
        currentConversation={currentConversation}
        onSelectConversation={selectConversation}
        onNewConversation={handleNewChat}
        onDeleteConversation={deleteConversation}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {currentConversation?.title || 'AI Code Studio'}
                </h1>
                <p className="text-sm text-gray-500">
                  AI-powered development assistant
                </p>
              </div>
            </div>
            <button
              onClick={handleNewChat}
              className="btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="w-4 h-4" />
              <span className="hidden sm:block">New Chat</span>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {currentConversation?.messages?.length > 0 ? (
            <div className="max-w-4xl mx-auto py-6 px-4">
              {currentConversation.messages.map((message, index) => (
                <ChatMessage
                  key={message.id || index}
                  message={message}
                  isLast={index === currentConversation.messages.length - 1}
                />
              ))}
              {isLoading && (
                <div className="flex justify-start mb-6">
                  <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-sm text-gray-500">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            // Welcome Screen
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="max-w-2xl text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <SparklesIcon className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Welcome to AI Code Studio
                </h2>
                <p className="text-gray-600 mb-8">
                  Start a conversation to build amazing applications with AI assistance.
                  I can help you create full-stack apps, add integrations, and deploy instantly.
                </p>

                {/* Suggestion Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {suggestions.map((suggestion, index) => {
                    const Icon = suggestion.icon
                    return (
                      <motion.button
                        key={index}
                        onClick={() => setInput(suggestion.title)}
                        className="p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200 text-left"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon className="w-6 h-6 text-primary-600 mb-2" />
                        <h3 className="font-medium text-gray-900 mb-1">
                          {suggestion.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {suggestion.description}
                        </p>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Describe the application you want to build..."
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none max-h-32"
                    rows="1"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="absolute right-3 bottom-3 p-1.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white rounded-lg transition-colors duration-200"
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat