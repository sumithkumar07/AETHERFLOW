import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PaperAirplaneIcon,
  MicrophoneIcon,
  StopIcon,
  SparklesIcon,
  CpuChipIcon,
  UserGroupIcon,
  CodeBracketIcon,
  PaintBrushIcon,
  BeakerIcon,
  ChartBarIcon,
  LightBulbIcon,
  ArrowPathIcon,
  HandRaisedIcon,
  EyeIcon,
  ClipboardDocumentIcon,
  ShareIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import { useEnhancedChatStore } from '../store/enhancedChatStore'
import toast from 'react-hot-toast'

const EnhancedAIChat = () => {
  const { user } = useAuthStore()
  const { 
    messages, 
    isLoading, 
    models, 
    agents, 
    sendMessage, 
    initializeModelsAndAgents,
    clearMessages,
    selectedAgent,
    selectedModel,
    setSelectedAgent,
    collaborationMode,
    toggleCollaborationMode,
    requestAgentHandoff,
    startVoiceRecognition,
    stopVoiceRecognition,
    isListening
  } = useEnhancedChatStore()

  const [inputMessage, setInputMessage] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [conversationId, setConversationId] = useState(null)
  
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const recognition = useRef(null)

  // Enhanced agent configurations with better UI
  const enhancedAgents = [
    {
      id: 'developer',
      name: 'Senior Developer',
      icon: CodeBracketIcon,
      color: 'blue',
      description: 'Expert in full-stack development, architecture, and best practices',
      specialties: ['Architecture', 'Code Review', 'Performance', 'Security'],
      personality: 'Technical expert with 10+ years experience'
    },
    {
      id: 'designer',
      name: 'UI/UX Designer',
      icon: PaintBrushIcon,
      color: 'purple',
      description: 'Creative designer focused on user experience and modern aesthetics',
      specialties: ['UI Design', 'UX Research', 'Design Systems', 'Accessibility'],
      personality: 'Creative and user-focused'
    },
    {
      id: 'tester',
      name: 'QA Engineer',
      icon: BeakerIcon,
      color: 'green',
      description: 'Quality assurance specialist ensuring robust applications',
      specialties: ['Test Strategy', 'Automation', 'Bug Detection', 'Performance Testing'],
      personality: 'Meticulous and quality-focused'
    },
    {
      id: 'integrator',
      name: 'Integration Specialist',
      icon: UserGroupIcon,
      color: 'orange',
      description: 'Expert in connecting systems and third-party services',
      specialties: ['API Integration', 'Database Design', 'System Architecture', 'Data Flow'],
      personality: 'Systems thinking and connectivity expert'
    },
    {
      id: 'analyst',
      name: 'Business Analyst',
      icon: ChartBarIcon,
      color: 'cyan',
      description: 'Strategic thinker translating business needs into technical solutions',
      specialties: ['Requirements Analysis', 'User Stories', 'Process Optimization', 'Strategy'],
      personality: 'Strategic and business-focused'
    }
  ]

  // Smart suggestions based on context
  const smartSuggestions = [
    {
      text: "Help me build a modern React component",
      category: "Development",
      agent: "developer",
      icon: CodeBracketIcon
    },
    {
      text: "Design a user-friendly dashboard interface",
      category: "Design",
      agent: "designer", 
      icon: PaintBrushIcon
    },
    {
      text: "Create a comprehensive testing strategy",
      category: "Testing",
      agent: "tester",
      icon: BeakerIcon
    },
    {
      text: "Integrate with third-party payment API",
      category: "Integration",
      agent: "integrator",
      icon: UserGroupIcon
    },
    {
      text: "Analyze user requirements and create stories",
      category: "Analysis",
      agent: "analyst",
      icon: ChartBarIcon
    }
  ]

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (models.length === 0 || agents.length === 0) {
      initializeModelsAndAgents()
    }
  }, [models, agents, initializeModelsAndAgents])

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognition.current = new SpeechRecognition()
      recognition.current.continuous = false
      recognition.current.interimResults = true
      recognition.current.lang = 'en-US'

      recognition.current.onstart = () => {
        setIsListening(true)
      }

      recognition.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('')

        setInputMessage(transcript)
      }

      recognition.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        toast.error('Voice recognition failed. Please try again.')
      }

      recognition.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const messageText = inputMessage.trim()
    setInputMessage('')
    setShowSuggestions(false)

    try {
      // Enhanced message sending with collaboration mode
      const response = await sendMessage({
        message: messageText,
        agent: selectedAgent,
        model: selectedModel,
        conversation_id: conversationId,
        collaboration_mode: collaborationMode,
        enhanced: true
      })

      // Set conversation ID from response
      if (response?.conversation_id && !conversationId) {
        setConversationId(response.conversation_id)
      }

    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message. Please try again.')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const startVoiceRecognition = () => {
    if (recognition.current && !isListening) {
      recognition.current.start()
    }
  }

  const stopVoiceRecognition = () => {
    if (recognition.current && isListening) {
      recognition.current.stop()
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion.text)
    setSelectedAgent(suggestion.agent)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const handleAgentHandoff = (newAgent) => {
    setSelectedAgent(newAgent)
    toast.success(`Switched to ${enhancedAgents.find(a => a.id === newAgent)?.name}`)
  }

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content)
    toast.success('Message copied to clipboard!')
  }

  const currentAgent = enhancedAgents.find(agent => agent.id === selectedAgent) || enhancedAgents[0]

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      {/* Enhanced Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 bg-gradient-to-br from-${currentAgent.color}-500 to-${currentAgent.color}-600 rounded-2xl flex items-center justify-center shadow-lg`}>
              <currentAgent.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {currentAgent.name}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentAgent.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Collaboration:
              </label>
              <button
                onClick={() => setCollaborationMode(!collaborationMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  collaborationMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    collaborationMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <button
              onClick={clearMessages}
              className="btn-secondary flex items-center space-x-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>New Chat</span>
            </button>
          </div>
        </div>

        {/* Agent Specialties */}
        <div className="mt-4 flex flex-wrap gap-2">
          {currentAgent.specialties.map((specialty, index) => (
            <span
              key={index}
              className={`px-3 py-1 text-xs font-medium bg-${currentAgent.color}-100 dark:bg-${currentAgent.color}-900/30 text-${currentAgent.color}-700 dark:text-${currentAgent.color}-300 rounded-full`}
            >
              {specialty}
            </span>
          ))}
        </div>
      </div>

      {/* Agent Selection Bar */}
      <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-b border-gray-200/30 dark:border-gray-700/30 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2 overflow-x-auto">
            {enhancedAgents.map((agent) => {
              const Icon = agent.icon
              const isSelected = agent.id === selectedAgent
              
              return (
                <motion.button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    isSelected
                      ? `bg-${agent.color}-100 dark:bg-${agent.color}-900/30 text-${agent.color}-700 dark:text-${agent.color}-300 ring-2 ring-${agent.color}-200 dark:ring-${agent.color}-800`
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{agent.name}</span>
                </motion.button>
              )
            })}
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {messages.length} messages
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.length === 0 && showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Welcome Message */}
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <SparklesIcon className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to Enhanced AI Chat
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Chat with specialized AI agents, get intelligent suggestions, and experience 
                seamless multi-agent collaboration for your development needs.
              </p>
            </div>

            {/* Smart Suggestions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <LightBulbIcon className="w-5 h-5 mr-2 text-yellow-500" />
                Smart Suggestions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {smartSuggestions.map((suggestion, index) => {
                  const Icon = suggestion.icon
                  return (
                    <motion.button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="card p-4 text-left hover-lift group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:shadow-lg transition-shadow">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                            {suggestion.category}
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {suggestion.text}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Messages */}
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-4xl ${message.sender === 'user' ? 'ml-12' : 'mr-12'}`}>
                {message.sender === 'assistant' && (
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-6 h-6 bg-gradient-to-br from-${currentAgent.color}-500 to-${currentAgent.color}-600 rounded-lg flex items-center justify-center`}>
                      <currentAgent.icon className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {message.agent_name || currentAgent.name}
                    </span>
                    {message.model_used && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        • {message.model_used}
                      </span>
                    )}
                  </div>
                )}

                <div
                  className={`rounded-2xl px-6 py-4 shadow-lg ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    {message.content}
                  </div>

                  {/* Enhanced Features */}
                  {message.sender === 'assistant' && message.metadata?.enhanced_features && (
                    <div className="mt-4 space-y-3">
                      {/* Suggestions */}
                      {message.metadata.enhanced_features.suggestions?.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            <SparklesIcon className="w-4 h-4 mr-1" />
                            Smart Suggestions
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {message.metadata.enhanced_features.suggestions.map((suggestion, idx) => (
                              <button
                                key={idx}
                                onClick={() => setInputMessage(suggestion.text)}
                                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                              >
                                {suggestion.text}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Collaboration Opportunities */}
                      {message.metadata.enhanced_features.collaboration_opportunities?.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            <HandRaisedIcon className="w-4 h-4 mr-1" />
                            Collaboration Opportunities
                          </div>
                          <div className="space-y-2">
                            {message.metadata.enhanced_features.collaboration_opportunities.map((opp, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {opp.reason}
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">
                                    Specialties: {opp.specialties}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleAgentHandoff(opp.agent)}
                                  className="btn-secondary text-xs px-3 py-1"
                                >
                                  Switch to {opp.agent}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Next Actions */}
                      {message.metadata.enhanced_features.next_actions?.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            <EyeIcon className="w-4 h-4 mr-1" />
                            Recommended Next Steps
                          </div>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            {message.metadata.enhanced_features.next_actions.map((action, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message Actions */}
                  {message.sender === 'assistant' && (
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>Confidence: {Math.round((message.confidence || 0.95) * 100)}%</span>
                        {message.metadata?.tokens_used && (
                          <span>• {message.metadata.tokens_used} tokens</span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => copyMessage(message.content)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          title="Copy message"
                        >
                          <ClipboardDocumentIcon className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          title="Share message"
                        >
                          <ShareIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="max-w-4xl mr-12">
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-6 h-6 bg-gradient-to-br from-${currentAgent.color}-500 to-${currentAgent.color}-600 rounded-lg flex items-center justify-center`}>
                  <currentAgent.icon className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {currentAgent.name} is thinking...
                </span>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl px-6 py-4 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Input Area */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <div className="relative">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Ask ${currentAgent.name} anything...`}
                  className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  rows="3"
                  style={{ minHeight: '60px', maxHeight: '120px' }}
                />
                
                {/* Voice Input Button */}
                <motion.button
                  onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                  className={`absolute right-3 top-3 p-2 rounded-xl transition-colors ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title={isListening ? 'Stop listening' : 'Start voice input'}
                >
                  {isListening ? (
                    <StopIcon className="w-5 h-5" />
                  ) : (
                    <MicrophoneIcon className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
              
              {/* Input Footer */}
              <div className="flex items-center justify-between mt-2 px-2">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Press Enter to send, Shift+Enter for new line
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {inputMessage.length}/2000
                </div>
              </div>
            </div>

            {/* Send Button */}
            <motion.button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className={`p-4 rounded-2xl transition-all duration-300 shadow-lg ${
                inputMessage.trim() && !isLoading
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl hover:scale-105'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
              whileHover={inputMessage.trim() && !isLoading ? { scale: 1.05 } : {}}
              whileTap={inputMessage.trim() && !isLoading ? { scale: 0.95 } : {}}
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedAIChat