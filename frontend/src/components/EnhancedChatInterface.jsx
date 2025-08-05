import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PaperAirplaneIcon,
  MicrophoneIcon,
  StopIcon,
  SparklesIcon,
  CpuChipIcon,
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useChatStore } from '../store/chatStore'
import { useAuthStore } from '../store/authStore'
import { usePerformanceStore } from '../store/performanceStore'
import toast from 'react-hot-toast'

const EnhancedChatInterface = () => {
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [showAgentSelector, setShowAgentSelector] = useState(false)
  const [showPerformancePanel, setShowPerformancePanel] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const recognition = useRef(null)
  
  const { 
    messages, 
    agents, 
    selectedAgent, 
    isLoading, 
    isTyping,
    sendMessage, 
    setSelectedAgent,
    voiceEnabled,
    startVoiceRecognition,
    stopVoiceRecognition,
    isListening
  } = useChatStore()
  
  const { user } = useAuthStore()
  const { 
    metrics, 
    updateMetrics, 
    getPerformanceTrend 
  } = usePerformanceStore()

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize performance monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      updateMetrics()
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [updateMetrics])

  // Enhanced voice recognition with better UX
  const handleVoiceRecording = useCallback(async () => {
    if (!voiceEnabled) {
      toast.error('Voice recognition not available')
      return
    }

    if (isRecording) {
      setIsRecording(false)
      stopVoiceRecognition()
    } else {
      try {
        setIsRecording(true)
        await startVoiceRecognition()
        
        // Listen for voice input events
        const handleVoiceInput = (event) => {
          if (event.detail) {
            setMessage(prev => prev + ' ' + event.detail)
          }
        }
        
        window.addEventListener('voiceInput', handleVoiceInput)
        
        // Auto-stop after 30 seconds
        setTimeout(() => {
          setIsRecording(false)
          stopVoiceRecognition()
          window.removeEventListener('voiceInput', handleVoiceInput)
        }, 30000)
        
      } catch (error) {
        setIsRecording(false)
        toast.error('Voice recording failed: ' + error.message)
      }
    }
  }, [voiceEnabled, isRecording, startVoiceRecognition, stopVoiceRecognition])

  // Enhanced message sending with performance tracking
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim() || isLoading) return

    const startTime = performance.now()
    
    try {
      const currentMessage = message
      setMessage('')
      
      await sendMessage(currentMessage)
      
      const responseTime = performance.now() - startTime
      updateMetrics({ 
        lastResponseTime: responseTime,
        totalMessages: messages.length + 1
      })
      
      // Show performance feedback if response is slow
      if (responseTime > 3000) {
        toast('Response took longer than expected', { icon: '⏱️' })
      } else if (responseTime < 1000) {
        toast('Lightning fast response!', { icon: '⚡' })
      }
      
    } catch (error) {
      toast.error('Failed to send message: ' + error.message)
      setMessage(message) // Restore message on error
    }
  }

  // Enhanced agent selection with visual feedback
  const handleAgentSelection = (agentId) => {
    setSelectedAgent(agentId)
    setShowAgentSelector(false)
    
    const agent = agents.find(a => a.id === agentId)
    if (agent) {
      toast.success(`Switched to ${agent.name}`, { 
        icon: agent.icon || '🤖',
        duration: 2000
      })
    }
  }

  // Smart suggestions based on conversation context
  const getSmartSuggestions = () => {
    const recentMessages = messages.slice(-3)
    const hasCode = recentMessages.some(m => 
      m.content.includes('```') || 
      m.content.includes('function') || 
      m.content.includes('class')
    )
    const hasDesign = recentMessages.some(m => 
      m.content.toLowerCase().includes('design') || 
      m.content.toLowerCase().includes('ui') ||
      m.content.toLowerCase().includes('interface')
    )

    const suggestions = []
    
    if (hasCode) {
      suggestions.push('🧪 Generate tests for this code')
      suggestions.push('📝 Add documentation')
      suggestions.push('🔍 Review code quality')
    }
    
    if (hasDesign) {
      suggestions.push('🎨 Create component mockup')
      suggestions.push('♿ Check accessibility')
      suggestions.push('📱 Make it responsive')
    }
    
    suggestions.push('🚀 Deploy this solution')
    suggestions.push('💡 Explain step by step')
    
    return suggestions.slice(0, 4)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + Enter to send
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleSendMessage(e)
      }
      
      // Ctrl/Cmd + / to focus input
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      
      // Escape to clear input
      if (e.key === 'Escape') {
        setMessage('')
        inputRef.current?.blur()
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [handleSendMessage])

  const currentAgent = agents.find(a => a.id === selectedAgent) || agents[0]
  const smartSuggestions = getSmartSuggestions()

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      {/* Enhanced Header with Performance Metrics */}
      <div className="flex-shrink-0 border-b border-white/10 bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            {/* Agent Selector */}
            <div className="relative">
              <motion.button
                onClick={() => setShowAgentSelector(!showAgentSelector)}
                className="flex items-center space-x-3 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200 shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-2xl">{currentAgent?.icon || '🤖'}</span>
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {currentAgent?.name || 'Select Agent'}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {currentAgent?.specialties?.[0] || 'AI Assistant'}
                  </div>
                </div>
                <ArrowRightIcon className={`w-4 h-4 transition-transform ${showAgentSelector ? 'rotate-90' : ''}`} />
              </motion.button>

              {/* Agent Selection Dropdown */}
              <AnimatePresence>
                {showAgentSelector && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 w-80 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-xl z-50"
                  >
                    <div className="p-2">
                      {agents.map((agent) => (
                        <motion.button
                          key={agent.id}
                          onClick={() => handleAgentSelection(agent.id)}
                          className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                            selectedAgent === agent.id 
                              ? 'bg-blue-500/20 border border-blue-500/30' 
                              : 'hover:bg-white/50 dark:hover:bg-gray-700/50'
                          }`}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <span className="text-xl">{agent.icon}</span>
                          <div className="text-left flex-1">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {agent.name}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {agent.description}
                            </div>
                          </div>
                          {selectedAgent === agent.id && (
                            <CheckCircleIcon className="w-4 h-4 text-blue-500" />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Multi-Agent Coordination Indicator */}
            {messages.length > 0 && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg">
                <UserGroupIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                  Multi-Agent Active
                </span>
              </div>
            )}
          </div>

          {/* Performance Panel Toggle */}
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={() => setShowPerformancePanel(!showPerformancePanel)}
              className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
            >
              <ChartBarIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium text-green-700 dark:text-green-300">
                {metrics.lastResponseTime ? `${Math.round(metrics.lastResponseTime)}ms` : 'Performance'}
              </span>
            </motion.button>

            {metrics.lastResponseTime && (
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                metrics.lastResponseTime < 1000 
                  ? 'bg-green-500/20 text-green-700 dark:text-green-300' 
                  : metrics.lastResponseTime < 2000
                  ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300'
                  : 'bg-red-500/20 text-red-700 dark:text-red-300'
              }`}>
                <ClockIcon className="w-3 h-3" />
                <span>{metrics.lastResponseTime < 1000 ? '⚡ Fast' : metrics.lastResponseTime < 2000 ? '⏱️ Good' : '🐌 Slow'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Performance Panel */}
        <AnimatePresence>
          {showPerformancePanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/10"
            >
              <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {metrics.totalMessages || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Messages</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    {metrics.lastResponseTime ? `${Math.round(metrics.lastResponseTime)}ms` : '—'}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {agents.length}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Active Agents</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    99.9%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Uptime</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${
                msg.sender === 'user' 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' 
                  : 'bg-white/60 dark:bg-gray-800/60 text-gray-900 dark:text-white'
              } backdrop-blur-sm border border-white/20 rounded-2xl p-4 shadow-lg`}>
                
                {/* Agent indicator for AI messages */}
                {msg.sender === 'assistant' && (
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{currentAgent?.icon || '🤖'}</span>
                    <span className="text-sm font-semibold opacity-75">
                      {msg.agent ? agents.find(a => a.id === msg.agent)?.name : currentAgent?.name}
                    </span>
                    {msg.metadata?.coordination_plan && (
                      <div className="flex items-center space-x-1">
                        <UserGroupIcon className="w-3 h-3 opacity-50" />
                        <span className="text-xs opacity-50">Multi-Agent</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {msg.content}
                </div>

                {/* Performance indicators */}
                {msg.metadata?.performance_metrics && (
                  <div className="mt-2 pt-2 border-t border-white/20">
                    <div className="flex items-center space-x-4 text-xs opacity-75">
                      <span>
                        ⚡ {Math.round(msg.metadata.performance_metrics.response_time * 1000)}ms
                      </span>
                      {msg.metadata.performance_metrics.agents_involved > 1 && (
                        <span>
                          👥 {msg.metadata.performance_metrics.agents_involved} agents
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Smart suggestions */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <div className="text-xs opacity-75 mb-2">Suggestions:</div>
                    <div className="flex flex-wrap gap-1">
                      {msg.suggestions.slice(0, 3).map((suggestion, i) => (
                        <motion.button
                          key={i}
                          onClick={() => setMessage(suggestion.replace(/^[^\s]+\s/, ''))}
                          className="text-xs px-2 py-1 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator with agent activity */}
        <AnimatePresence>
          {(isLoading || isTyping) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-start"
            >
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{currentAgent?.icon || '🤖'}</span>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {currentAgent?.name || 'AI'}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    <motion.div
                      className="w-2 h-2 bg-blue-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-purple-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-green-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {isTyping ? 'Processing with AI...' : 'Thinking...'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Smart Suggestions Bar */}
      {smartSuggestions.length > 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-2 border-t border-white/10"
        >
          <div className="flex items-center space-x-2 overflow-x-auto">
            <SparklesIcon className="w-4 h-4 text-purple-500 flex-shrink-0" />
            <div className="flex space-x-2">
              {smartSuggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  onClick={() => {
                    setMessage(suggestion.replace(/^[^\s]+\s/, ''))
                    inputRef.current?.focus()
                  }}
                  className="px-3 py-1 text-sm bg-white/40 dark:bg-gray-800/40 hover:bg-white/60 dark:hover:bg-gray-800/60 border border-white/20 rounded-full transition-all duration-200 whitespace-nowrap"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Enhanced Input Area */}
      <div className="flex-shrink-0 p-4 border-t border-white/10 bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl">
        <form onSubmit={handleSendMessage} className="space-y-3">
          {/* Main Input */}
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage(e)
                  }
                }}
                placeholder={`Message ${currentAgent?.name || 'AI'}...`}
                className="w-full px-4 py-3 pr-24 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                rows={message.includes('\n') ? 3 : 1}
                disabled={isLoading}
              />
              
              {/* Input controls */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                {/* Voice input button */}
                {voiceEnabled && (
                  <motion.button
                    type="button"
                    onClick={handleVoiceRecording}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      isRecording || isListening
                        ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30'
                        : 'hover:bg-white/40 dark:hover:bg-gray-700/40 text-gray-600 dark:text-gray-400'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={isLoading}
                  >
                    {isRecording || isListening ? (
                      <StopIcon className="w-4 h-4" />
                    ) : (
                      <MicrophoneIcon className="w-4 h-4" />
                    )}
                  </motion.button>
                )}
                
                {/* Send button */}
                <motion.button
                  type="submit"
                  disabled={!message.trim() || isLoading}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    message.trim() && !isLoading
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                  whileHover={message.trim() && !isLoading ? { scale: 1.1 } : {}}
                  whileTap={message.trim() && !isLoading ? { scale: 0.9 } : {}}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <CpuChipIcon className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <PaperAirplaneIcon className="w-4 h-4" />
                  )}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Input hints */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span>Press <kbd className="px-1 py-0.5 bg-white/20 rounded">⌘ Enter</kbd> to send</span>
              {voiceEnabled && (
                <span>Click <MicrophoneIcon className="w-3 h-3 inline mx-1" /> for voice input</span>
              )}
            </div>
            {message.length > 0 && (
              <span className={`${message.length > 1000 ? 'text-red-500' : ''}`}>
                {message.length}/2000
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default EnhancedChatInterface