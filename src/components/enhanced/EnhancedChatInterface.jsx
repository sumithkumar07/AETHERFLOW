import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PaperAirplaneIcon,
  MicrophoneIcon,
  StopIcon,
  CodeBracketIcon,
  SparklesIcon,
  ClipboardDocumentIcon,
  ArrowPathIcon,
  EllipsisHorizontalIcon,
  UserIcon,
  CpuChipIcon,
  LightBulbIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { useEnhancedChatStore, AI_MODELS, AI_AGENTS } from '../../store/enhancedChatStore'
import { useAuthStore } from '../../store/authStore'
import { useRealTimeStore } from '../../store/realTimeStore'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

/**
 * Enhanced Chat Interface - Advanced AI chat with real-time features
 * Integrates with EnhancedChatStore and RealTimeStore for full functionality
 */
const EnhancedChatInterface = ({ projectId }) => {
  const { user } = useAuthStore()
  const {
    messages,
    selectedModel,
    selectedAgent,
    availableModels,
    modelStatus,
    loading,
    aiThinking,
    typingIndicator,
    isStreaming,
    streamingResponse,
    smartSuggestions,
    conversationAnalytics,
    collaborators,
    realTimeEnabled,
    sendMessage,
    setSelectedModel,
    setSelectedAgent,
    fetchAvailableModels,
    downloadModel,
    getSmartSuggestions,
    initialize,
    disconnect
  } = useEnhancedChatStore()

  const {
    liveCollaboration,
    realTimeMetrics,
    systemStatus
  } = useRealTimeStore()

  const [input, setInput] = useState('')
  const [isVoiceRecording, setIsVoiceRecording] = useState(false)
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [showAgentSelector, setShowAgentSelector] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const voiceRecognitionRef = useRef(null)

  // Initialize enhanced chat
  useEffect(() => {
    if (user) {
      initialize(user.id)
      fetchAvailableModels()
    }
    
    return () => {
      disconnect()
    }
  }, [user, initialize, disconnect])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingResponse])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const messageContent = input.trim()
    setInput('')

    await sendMessage({
      content: messageContent,
      model: selectedModel,
      agent: selectedAgent,
      projectId: projectId
    })
  }

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error('Voice input not supported in this browser')
      return
    }

    if (isVoiceRecording) {
      voiceRecognitionRef.current?.stop()
      setIsVoiceRecording(false)
      return
    }

    const recognition = new window.webkitSpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsVoiceRecording(true)
      toast.success('Listening...', { icon: '🎤' })
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
    }

    recognition.onerror = () => {
      setIsVoiceRecording(false)
      toast.error('Voice recognition failed')
    }

    recognition.onend = () => {
      setIsVoiceRecording(false)
    }

    voiceRecognitionRef.current = recognition
    recognition.start()
  }

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion)
    inputRef.current?.focus()
  }

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content)
    toast.success('Message copied!', { icon: '📋' })
  }

  const renderMessage = (message) => {
    const isUser = message.sender === 'user'
    const model = AI_MODELS[message.model] || AI_MODELS[selectedModel]
    const agent = AI_AGENTS[selectedAgent]

    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex max-w-4xl ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
          {/* Avatar */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            isUser 
              ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
              : `bg-gradient-to-br ${model.color} text-white`
          }`}>
            {isUser ? (
              <UserIcon className="w-5 h-5" />
            ) : (
              <span className="text-sm font-medium">{model.icon}</span>
            )}
          </div>

          {/* Message Content */}
          <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
            {/* Message Header */}
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {isUser ? user?.name : `${model.name} (${agent.name})`}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
              {message.metadata?.responseTime && (
                <span className="text-xs text-green-500">
                  {(message.metadata.responseTime / 1000).toFixed(1)}s
                </span>
              )}
            </div>

            {/* Message Bubble */}
            <div className={`relative rounded-2xl px-4 py-3 max-w-3xl ${
              isUser
                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
            }`}>
              {/* Content */}
              <div className={`prose prose-sm ${
                isUser 
                  ? 'prose-invert'
                  : 'prose-gray dark:prose-invert'
              } max-w-none`}>
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-lg my-2"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      )
                    }
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>

              {/* Message Actions */}
              {!isUser && (
                <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => copyMessage(message.content)}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center space-x-1"
                  >
                    <ClipboardDocumentIcon className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                  
                  {message.metadata?.confidence && (
                    <div className="text-xs text-gray-500 flex items-center space-x-1">
                      <span>Confidence: {Math.round(message.metadata.confidence * 100)}%</span>
                    </div>
                  )}
                  
                  {message.metadata?.codeBlocks?.length > 0 && (
                    <div className="text-xs text-blue-500 flex items-center space-x-1">
                      <CodeBracketIcon className="w-3 h-3" />
                      <span>{message.metadata.codeBlocks.length} code block{message.metadata.codeBlocks.length > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Message Metadata */}
            {message.metadata?.wordCount && (
              <div className="text-xs text-gray-400 mt-1">
                {message.metadata.wordCount} words
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      {/* Enhanced Header */}
      <div className="flex-shrink-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Model Selector */}
            <div className="relative">
              <button
                onClick={() => setShowModelSelector(!showModelSelector)}
                className="flex items-center space-x-2 bg-gradient-to-br from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                <CpuChipIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{AI_MODELS[selectedModel]?.name || 'Select Model'}</span>
              </button>
              
              <AnimatePresence>
                {showModelSelector && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-12 left-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-2 min-w-64 z-50"
                  >
                    {availableModels.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id)
                          setShowModelSelector(false)
                        }}
                        className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          selectedModel === model.id ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{model.icon || '🤖'}</span>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{model.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{model.provider}</div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className={`text-xs px-2 py-1 rounded ${
                              model.available 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                            }`}>
                              {model.available ? 'Ready' : 'Offline'}
                            </span>
                            {model.unlimited && (
                              <span className="text-xs text-blue-500 mt-1">Unlimited</span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                    
                    {availableModels.some(model => !model.available) && (
                      <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 px-3 py-1">
                          Download missing models to unlock full capabilities
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Agent Selector */}
            <div className="relative">
              <button
                onClick={() => setShowAgentSelector(!showAgentSelector)}
                className="flex items-center space-x-2 bg-gradient-to-br from-green-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                <span className="text-lg">{AI_AGENTS[selectedAgent]?.icon || '🤖'}</span>
                <span className="text-sm font-medium">{AI_AGENTS[selectedAgent]?.name || 'Select Agent'}</span>
              </button>
              
              <AnimatePresence>
                {showAgentSelector && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-12 left-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-2 min-w-72 z-50"
                  >
                    {Object.entries(AI_AGENTS).map(([agentId, agent]) => (
                      <button
                        key={agentId}
                        onClick={() => {
                          setSelectedAgent(agentId)
                          setShowAgentSelector(false)
                        }}
                        className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          selectedAgent === agentId ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-xl">{agent.icon}</span>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">{agent.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">{agent.description}</div>
                            <div className="flex flex-wrap gap-1">
                              {agent.capabilities?.slice(0, 3).map((capability) => (
                                <span
                                  key={capability}
                                  className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded"
                                >
                                  {capability}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center space-x-3">
            {/* Real-time Status */}
            {realTimeEnabled && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Real-time</span>
              </div>
            )}

            {/* Active Collaborators */}
            {liveCollaboration.activeUsers.length > 0 && (
              <div className="flex items-center space-x-1">
                <div className="flex -space-x-1">
                  {liveCollaboration.activeUsers.slice(0, 3).map((user) => (
                    <div
                      key={user.id}
                      className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-800"
                      title={user.name}
                    >
                      {user.name?.charAt(0)}
                    </div>
                  ))}
                </div>
                {liveCollaboration.activeUsers.length > 3 && (
                  <span className="text-xs text-gray-500">+{liveCollaboration.activeUsers.length - 3}</span>
                )}
              </div>
            )}

            {/* Analytics Toggle */}
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="View Analytics"
            >
              <ChartBarIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Analytics Panel */}
        <AnimatePresence>
          {showAnalytics && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{conversationAnalytics.totalMessages}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Total Messages</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{conversationAnalytics.avgResponseTime.toFixed(1)}s</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Avg Response</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{conversationAnalytics.satisfactionScore}/5</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Satisfaction</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{realTimeMetrics.activeUsers}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Active Users</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => renderMessage(message))}
        </AnimatePresence>

        {/* Streaming Response */}
        {isStreaming && streamingResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start mb-4"
          >
            <div className="flex max-w-4xl flex-row items-start space-x-3">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${AI_MODELS[selectedModel].color} text-white`}>
                <span className="text-sm font-medium">{AI_MODELS[selectedModel].icon}</span>
              </div>
              <div className="flex flex-col items-start">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 max-w-3xl">
                  <div className="prose prose-sm prose-gray dark:prose-invert max-w-none">
                    <ReactMarkdown>{streamingResponse}</ReactMarkdown>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="animate-pulse flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">Streaming...</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* AI Thinking Indicator */}
        {(aiThinking || typingIndicator) && !isStreaming && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start mb-4"
          >
            <div className="flex items-start space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${AI_MODELS[selectedModel].color} text-white`}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <SparklesIcon className="w-5 h-5" />
                </motion.div>
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {AI_MODELS[selectedModel].name} is thinking...
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Smart Suggestions */}
      {smartSuggestions.length > 0 && (
        <div className="flex-shrink-0 px-4 pb-2">
          <div className="flex items-center space-x-2 mb-2">
            <LightBulbIcon className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Smart Suggestions</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {smartSuggestions.slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg border border-yellow-200 dark:border-yellow-800 hover:shadow-md transition-all text-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex-shrink-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 p-4">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`flex-shrink-0 p-3 rounded-xl transition-all ${
              isVoiceRecording
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
            }`}
            title={isVoiceRecording ? 'Stop recording' : 'Voice input'}
          >
            {isVoiceRecording ? (
              <StopIcon className="w-5 h-5" />
            ) : (
              <MicrophoneIcon className="w-5 h-5" />
            )}
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask ${AI_MODELS[selectedModel]?.name} anything...`}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              rows="3"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e)
                }
              }}
              disabled={loading}
            />
            
            {/* Character Count */}
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              {input.length}/2000
            </div>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white p-3 rounded-xl transition-all disabled:cursor-not-allowed"
            title="Send message (Enter)"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>

        {/* Status Bar */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <span>
              Model: {AI_MODELS[selectedModel]?.name} • 
              Agent: {AI_AGENTS[selectedAgent]?.name}
            </span>
            {modelStatus.unlimited_usage && (
              <span className="text-green-500">• Unlimited Usage</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {Object.entries(systemStatus).map(([service, status]) => (
              <div key={service} className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${
                  status === 'online' ? 'bg-green-500' : 
                  status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="capitalize">{service}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedChatInterface