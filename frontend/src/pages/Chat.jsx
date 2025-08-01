import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PaperAirplaneIcon, 
  PlusIcon,
  SparklesIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  UserGroupIcon,
  MicrophoneIcon,
  StopIcon,
  CommandLineIcon,
  PlayIcon,
  EyeIcon,
  ShareIcon
} from '@heroicons/react/24/outline'
import { useChatStore } from '../store/chatStore'
import ChatSidebar from '../components/ChatSidebar'
import ChatMessage from '../components/ChatMessage'
import ModelSelector from '../components/ModelSelector'
import CodeEditor from '../components/CodeEditor'
import AgentSelector from '../components/AgentSelector'
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
  const [selectedModel, setSelectedModel] = useState('gpt-4.1-nano')
  const [selectedAgents, setSelectedAgents] = useState([])
  const [showCodeEditor, setShowCodeEditor] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [codePreview, setCodePreview] = useState('')
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
      // Enhanced message with agent context
      const enhancedMessage = selectedAgents.length > 0 
        ? `[Using agents: ${selectedAgents.join(', ')}] ${message}`
        : message

      await sendMessage(enhancedMessage, selectedModel)
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  const handleNewChat = () => {
    createConversation()
    setInput('')
    setCodePreview('')
    setShowCodeEditor(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleVoiceInput = () => {
    if (!isRecording) {
      // Start voice recording
      setIsRecording(true)
      toast.success('Voice recording started!')
      // Add voice recognition logic here
    } else {
      // Stop voice recording
      setIsRecording(false)
      toast.success('Voice recording stopped!')
    }
  }

  const suggestions = [
    {
      icon: CodeBracketIcon,
      title: "Build a Modern Web App",
      description: "Create a full-stack application with React, Node.js, and MongoDB",
      agents: ['developer', 'integrator']
    },
    {
      icon: UserGroupIcon,
      title: "Multi-Agent Development",
      description: "Orchestrate multiple AI agents for complex project development",
      agents: ['coordinator', 'developer', 'tester']
    },
    {
      icon: SparklesIcon,
      title: "Add AI Features",
      description: "Integrate AI capabilities like chat, image generation, or analysis",
      agents: ['developer', 'ai-specialist']
    },
    {
      icon: DocumentTextIcon,
      title: "API Development",
      description: "Build RESTful APIs with authentication and database integration",
      agents: ['developer', 'security']
    }
  ]

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
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
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl lg:hidden"
              >
                <SparklesIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentConversation?.title || 'Tempo AI Assistant'}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedAgents.length > 0 
                      ? `Using ${selectedAgents.length} AI agent${selectedAgents.length > 1 ? 's' : ''}`
                      : 'AI-powered development assistant'
                    }
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {currentConversation?.messages?.length > 0 && (
                <>
                  <button
                    onClick={() => setShowCodeEditor(!showCodeEditor)}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200"
                    title="Toggle Code Editor"
                  >
                    <CommandLineIcon className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-all duration-200"
                    title="Preview Code"
                  >
                    <PlayIcon className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all duration-200"
                    title="Share Conversation"
                  >
                    <ShareIcon className="w-5 h-5" />
                  </button>
                </>
              )}
              <button
                onClick={handleNewChat}
                className="btn-primary flex items-center space-x-2"
              >
                <PlusIcon className="w-4 h-4" />
                <span className="hidden sm:block">New Chat</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Messages Area */}
        <div className="flex-1 flex">
          {/* Chat Messages */}
          <div className={`flex-1 overflow-y-auto ${showCodeEditor ? 'w-1/2' : 'w-full'}`}>
            {currentConversation?.messages?.length > 0 ? (
              <div className="max-w-4xl mx-auto py-6 px-4">
                <AnimatePresence>
                  {currentConversation.messages.map((message, index) => (
                    <motion.div
                      key={message.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChatMessage
                        message={message}
                        isLast={index === currentConversation.messages.length - 1}
                        onCodeUpdate={setCodePreview}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-start mb-6"
                  >
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          <div className="typing-dot"></div>
                          <div className="typing-dot"></div>
                          <div className="typing-dot"></div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedAgents.length > 0 
                            ? `${selectedAgents.join(' + ')} working...`
                            : 'AI is thinking...'
                          }
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              // Welcome Screen
              <div className="flex-1 flex items-center justify-center p-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-3xl text-center"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl animate-pulse-glow">
                    <SparklesIcon className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Welcome to Tempo AI
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                    Your AI-powered coding companion. Build applications, write code, and deploy projects 
                    through natural conversation with intelligent multi-agent assistance.
                  </p>

                  {/* Suggestion Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {suggestions.map((suggestion, index) => {
                      const Icon = suggestion.icon
                      return (
                        <motion.button
                          key={index}
                          onClick={() => {
                            setInput(suggestion.title)
                            setSelectedAgents(suggestion.agents)
                          }}
                          className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xl transition-all duration-300 text-left group"
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-start space-x-4">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {suggestion.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                {suggestion.description}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {suggestion.agents.map((agent) => (
                                  <span
                                    key={agent}
                                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-lg"
                                  >
                                    {agent}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                </motion.div>
              </div>
            )}
          </div>

          {/* Code Editor Panel */}
          <AnimatePresence>
            {showCodeEditor && (
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className="w-1/2 border-l border-gray-200/50 dark:border-gray-700/50"
              >
                <CodeEditor 
                  code={codePreview}
                  onChange={setCodePreview}
                  onClose={() => setShowCodeEditor(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 p-4"
        >
          <div className="max-w-4xl mx-auto">
            {/* Agent and Model Selectors */}
            <div className="flex items-center justify-between mb-4">
              <AgentSelector 
                selectedAgents={selectedAgents}
                onAgentsChange={setSelectedAgents}
              />
              <ModelSelector 
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
              />
            </div>
            
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Describe what you want to build, or ask for help with your code..."
                    className="w-full px-4 py-4 pr-20 border border-gray-300/50 dark:border-gray-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-lg"
                    rows="1"
                    disabled={isLoading}
                  />
                  <div className="absolute right-3 bottom-3 flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleVoiceInput}
                      className={`p-2 rounded-xl transition-all duration-200 ${
                        isRecording
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      title={isRecording ? 'Stop Recording' : 'Voice Input'}
                    >
                      {isRecording ? (
                        <StopIcon className="w-4 h-4" />
                      ) : (
                        <MicrophoneIcon className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                    >
                      <PaperAirplaneIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Press Enter to send • Shift+Enter for new line • 
                {selectedAgents.length > 0 && ` Using ${selectedAgents.length} AI agent${selectedAgents.length > 1 ? 's' : ''} • `}
                Powered by Tempo AI
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Chat