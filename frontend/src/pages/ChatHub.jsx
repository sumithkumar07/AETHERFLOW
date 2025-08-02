import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PaperAirplaneIcon,
  MicrophoneIcon,
  StopIcon,
  CpuChipIcon,
  UserIcon,
  SparklesIcon,
  CommandLineIcon,
  LightBulbIcon,
  BoltIcon,
  EyeIcon,
  SpeakerWaveIcon,
  CodeBracketIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline'
import { useChatStore } from '../store/chatStore'
import { useAuthStore } from '../store/authStore'
import LoadingStates from '../components/LoadingStates'
import toast from 'react-hot-toast'

const ChatHub = () => {
  const { user } = useAuthStore()
  const {
    messages,
    models,
    agents,
    selectedModel,
    selectedAgent,
    isLoading,
    isTyping,
    voiceEnabled,
    isListening,
    multimodalEnabled,
    realTimeCollaboration,
    aiCodeReview,
    sendMessage,
    setSelectedModel,
    setSelectedAgent,
    toggleVoiceEnabled,
    startVoiceRecognition,
    stopVoiceRecognition,
    clearMessages,
    initializeModelsAndAgents
  } = useChatStore()

  const [message, setMessage] = useState('')
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [showAgentSelector, setShowAgentSelector] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    // Initialize models and agents on component mount
    initializeModelsAndAgents()
  }, [initializeModelsAndAgents])

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    // Listen for voice input events
    const handleVoiceInput = (event) => {
      setMessage(event.detail)
    }

    window.addEventListener('voiceInput', handleVoiceInput)
    return () => window.removeEventListener('voiceInput', handleVoiceInput)
  }, [])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim() || isLoading) return

    const messageToSend = message.trim()
    setMessage('')

    try {
      await sendMessage(messageToSend)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleVoiceToggle = () => {
    if (isListening) {
      stopVoiceRecognition()
    } else {
      startVoiceRecognition()
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  const selectedModelData = models.find(m => m.id === selectedModel)
  const selectedAgentData = agents.find(a => a.id === selectedAgent)

  const getMessageIcon = (sender, agent) => {
    if (sender === 'user') return UserIcon
    
    const agentData = agents.find(a => a.id === agent)
    if (agentData?.icon) {
      const iconMap = {
        '💻': CommandLineIcon,
        '🎨': SparklesIcon,
        '🧪': LightBulbIcon,
        '🔗': BoltIcon,
        '📊': EyeIcon
      }
      return iconMap[agentData.icon] || CpuChipIcon
    }
    return CpuChipIcon
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - AI Info */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <CommandLineIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Aether AI Chat
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Next-generation AI development assistant
                  </p>
                </div>
              </div>

              {/* 2025 Features Status */}
              <div className="hidden md:flex items-center space-x-2">
                {voiceEnabled && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <MicrophoneIcon className="w-3 h-3 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-medium text-green-700 dark:text-green-300">Voice</span>
                  </div>
                )}
                {multimodalEnabled && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <EyeIcon className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Multimodal</span>
                  </div>
                )}
                {realTimeCollaboration && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <BoltIcon className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Live</span>
                  </div>
                )}
                {aiCodeReview && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                    <CodeBracketIcon className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                    <span className="text-xs font-medium text-orange-700 dark:text-orange-300">Review</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Model & Agent Selectors */}
            <div className="flex items-center space-x-3">
              {/* Model Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowModelSelector(!showModelSelector)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <CpuChipIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {selectedModelData?.name || 'Select Model'}
                  </span>
                  {selectedModelData?.enhanced_2025 && (
                    <span className="px-1.5 py-0.5 text-xs font-bold bg-purple-500 text-white rounded">
                      2025
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showModelSelector && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 right-0 w-80 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-50"
                    >
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          Select AI Model
                        </h3>
                        {models.map((model) => (
                          <button
                            key={model.id}
                            onClick={() => {
                              setSelectedModel(model.id)
                              setShowModelSelector(false)
                            }}
                            className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                              selectedModel === model.id
                                ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-600'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {model.name}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {model.provider} • {model.speed} • {model.quality}
                                </div>
                              </div>
                              {model.enhanced_2025 && (
                                <span className="px-2 py-1 text-xs font-bold bg-purple-500 text-white rounded">
                                  2025
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {model.description}
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Agent Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowAgentSelector(!showAgentSelector)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-lg">{selectedAgentData?.icon || '🤖'}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {selectedAgentData?.name || 'Select Agent'}
                  </span>
                  {selectedAgentData?.enhanced_2025 && (
                    <span className="px-1.5 py-0.5 text-xs font-bold bg-blue-500 text-white rounded">
                      AI
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showAgentSelector && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 right-0 w-80 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-50"
                    >
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          Select AI Agent
                        </h3>
                        {agents.map((agent) => (
                          <button
                            key={agent.id}
                            onClick={() => {
                              setSelectedAgent(agent.id)
                              setShowAgentSelector(false)
                            }}
                            className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                              selectedAgent === agent.id
                                ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-600'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">{agent.icon}</span>
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {agent.name}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {agent.description}
                                  </div>
                                </div>
                              </div>
                              {agent.enhanced_2025 && (
                                <span className="px-2 py-1 text-xs font-bold bg-blue-500 text-white rounded">
                                  AI
                                </span>
                              )}
                            </div>
                            <div className="mt-2">
                              <div className="flex flex-wrap gap-1">
                                {agent.capabilities?.slice(0, 3).map((capability, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                                  >
                                    {capability}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6 mb-32">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <CommandLineIcon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to Aether AI
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                Start a conversation with our advanced AI agents. Ask questions, request code, 
                or explore ideas with voice commands and real-time collaboration.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <MicrophoneIcon className="w-8 h-8 text-blue-500 mb-3" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Voice Commands</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Use voice-to-code and natural speech
                  </p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <CodeBracketIcon className="w-8 h-8 text-purple-500 mb-3" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">AI Code Review</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Real-time code analysis and suggestions
                  </p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <BoltIcon className="w-8 h-8 text-green-500 mb-3" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Real-time Sync</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Live collaboration and instant updates
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Messages */}
          {messages.map((msg) => {
            const MessageIcon = getMessageIcon(msg.sender, msg.agent)
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start space-x-4 ${
                  msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                    : 'bg-gradient-to-br from-gray-500 to-gray-600'
                }`}>
                  <MessageIcon className="w-6 h-6 text-white" />
                </div>

                <div className={`flex-1 max-w-3xl ${
                  msg.sender === 'user' ? 'text-right' : ''
                }`}>
                  <div className={`inline-block p-4 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : msg.isError
                        ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-100'
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'
                  }`}>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>

                    {msg.enhanced_2025 && msg.sender === 'assistant' && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 text-xs font-bold bg-purple-500 text-white rounded">
                            2025
                          </span>
                          {msg.confidence && (
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              Confidence: {Math.round(msg.confidence * 100)}%
                            </span>
                          )}
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            {msg.model} • {msg.agent}
                          </span>
                        </div>
                      </div>
                    )}

                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Suggestions:</div>
                        <div className="flex flex-wrap gap-2">
                          {msg.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => setMessage(suggestion)}
                              className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`text-xs text-gray-500 dark:text-gray-500 mt-2 ${
                    msg.sender === 'user' ? 'text-right' : ''
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            )
          })}

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-start space-x-4"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
                  <CpuChipIcon className="w-6 h-6 text-white" />
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
                  <div className="flex items-center space-x-2">
                    <LoadingStates.LoadingSpinner size="sm" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Aether AI is thinking with 2025 enhancements...
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-4xl mx-auto p-4">
          <form onSubmit={handleSendMessage} className="relative">
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    voiceEnabled 
                      ? "Type your message or use voice commands..." 
                      : "Type your message to Aether AI..."
                  }
                  className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={message.split('\n').length || 1}
                  disabled={isLoading}
                />

                {/* Voice Button */}
                {voiceEnabled && (
                  <button
                    type="button"
                    onClick={handleVoiceToggle}
                    className={`absolute right-3 top-3 p-2 rounded-lg transition-colors ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {isListening ? (
                      <StopIcon className="w-5 h-5" />
                    ) : (
                      <MicrophoneIcon className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={!message.trim() || isLoading}
                className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <LoadingStates.LoadingSpinner size="sm" color="white" />
                ) : (
                  <PaperAirplaneIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>

          {/* Quick Actions */}
          <div className="flex items-center justify-between mt-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleVoiceEnabled}
                className={`flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                  voiceEnabled ? 'text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                <MicrophoneIcon className="w-4 h-4" />
                <span>Voice</span>
              </button>
              
              <button
                onClick={clearMessages}
                className="flex items-center space-x-1 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <DocumentDuplicateIcon className="w-4 h-4" />
                <span>Clear</span>
              </button>
            </div>

            <div className="text-xs">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </div>
      </div>

      {/* Click outside handlers */}
      {(showModelSelector || showAgentSelector) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowModelSelector(false)
            setShowAgentSelector(false)
          }}
        />
      )}
    </div>
  )
}

export default ChatHub