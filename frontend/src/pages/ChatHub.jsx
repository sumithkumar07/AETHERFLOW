import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PaperAirplaneIcon,
  MicrophoneIcon,
  StopIcon,
  UserGroupIcon,
  CpuChipIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  CodeBracketIcon,
  DocumentDuplicateIcon,
  BoltIcon,
  EyeIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import { useChatStore } from '../store/chatStore'
import ChatMessage from '../components/ChatMessage'
import MultiAgentSystem from '../components/MultiAgentSystem'
import AgentSelector from '../components/AgentSelector'
import ModelSelector from '../components/ModelSelector'
import VoiceInterface from '../components/VoiceInterface'
import LoadingStates from '../components/LoadingStates'
import enhancedAPI from '../services/enhancedAPI'

const ChatHub = () => {
  const { user } = useAuthStore()
  const { 
    messages, 
    isLoading, 
    selectedModel, 
    selectedAgent,
    addMessage, 
    setLoading,
    models,
    agents
  } = useChatStore()

  const [inputMessage, setInputMessage] = useState('')
  const [isVoiceRecording, setIsVoiceRecording] = useState(false)
  const [showMultiAgent, setShowMultiAgent] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const [voiceCapabilities, setVoiceCapabilities] = useState(null)
  const [aiIntelligence, setAiIntelligence] = useState(null)
  
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const mediaRecorderRef = useRef(null)

  useEffect(() => {
    scrollToBottom()
    loadVoiceCapabilities()
    loadAIIntelligence()
  }, [messages])

  useEffect(() => {
    // Focus input on component mount
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadVoiceCapabilities = async () => {
    try {
      const capabilities = await enhancedAPI.getVoiceCapabilities()
      setVoiceCapabilities(capabilities)
    } catch (error) {
      console.error('Failed to load voice capabilities:', error)
    }
  }

  const loadAIIntelligence = async () => {
    try {
      const intelligence = await enhancedAPI.getMultiAgentSystem()
      setAiIntelligence(intelligence)
    } catch (error) {
      console.error('Failed to load AI intelligence:', error)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
      user: user?.name || 'You'
    }

    addMessage(userMessage)
    setInputMessage('')
    setLoading(true)

    try {
      // Use enhanced streaming API for real-time responses
      await enhancedAPI.streamChatWithAI(
        {
          message: inputMessage.trim(),
          model: selectedModel?.id || 'gpt-4.1-nano',
          agent: selectedAgent?.id || 'general',
          context: {
            conversation_id: 'current-session',
            user_id: user?.id,
            multiAgent: showMultiAgent,
            capabilities: voiceCapabilities?.available
          }
        },
        handleStreamingResponse
      )
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        error: true
      }
      addMessage(errorMessage)
    } finally {
      setLoading(false)
      setStreamingMessage('')
    }
  }

  const handleStreamingResponse = (chunk) => {
    if (chunk.type === 'chunk') {
      setStreamingMessage(prev => prev + chunk.content)
    } else if (chunk.type === 'complete') {
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: streamingMessage || chunk.content,
        timestamp: new Date().toISOString(),
        model: selectedModel?.name || 'GPT-4.1-nano',
        agent: selectedAgent?.name || 'AI Assistant',
        enhanced: true
      }
      addMessage(assistantMessage)
      setStreamingMessage('')
    }
  }

  const handleVoiceRecord = async () => {
    if (!voiceCapabilities?.available) {
      alert('Voice feature is not available. Please check your microphone permissions.')
      return
    }

    if (!isVoiceRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder

        const audioChunks = []
        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data)
        }

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
          await processVoiceInput(audioBlob)
          stream.getTracks().forEach(track => track.stop())
        }

        mediaRecorder.start()
        setIsVoiceRecording(true)
      } catch (error) {
        console.error('Voice recording error:', error)
        alert('Unable to access microphone. Please check your permissions.')
      }
    } else {
      mediaRecorderRef.current?.stop()
      setIsVoiceRecording(false)
    }
  }

  const processVoiceInput = async (audioBlob) => {
    try {
      setLoading(true)
      const result = await enhancedAPI.processVoiceCommand(audioBlob)
      
      if (result.success && result.transcript) {
        setInputMessage(result.transcript)
        
        // If voice command is recognized, auto-send
        if (result.isCommand) {
          setTimeout(() => {
            handleSendMessage({ preventDefault: () => {} })
          }, 100)
        }
      } else {
        console.error('Voice processing failed:', result.error)
      }
    } catch (error) {
      console.error('Voice processing error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAgentResponse = (response) => {
    const agentMessage = {
      id: Date.now(),
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
      agent: 'Multi-Agent System',
      enhanced: true,
      multiAgent: true
    }
    addMessage(agentMessage)
  }

  const ChatInterface = () => (
    <div className="flex flex-col h-full">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center animate-pulse-glow">
            <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              AI Chat Hub
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Powered by {selectedModel?.name || 'Advanced AI'} • {selectedAgent?.name || 'General Assistant'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Voice Capability Indicator */}
          {voiceCapabilities?.available && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <SpeakerWaveIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium text-green-700 dark:text-green-300">
                Voice Enabled
              </span>
            </div>
          )}

          {/* Multi-Agent Toggle */}
          <button
            onClick={() => setShowMultiAgent(!showMultiAgent)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
              showMultiAgent
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
            }`}
          >
            <UserGroupIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Multi-Agent</span>
            {aiIntelligence?.agents?.length > 0 && (
              <span className="px-1.5 py-0.5 text-xs font-bold bg-blue-500 text-white rounded-full">
                {aiIntelligence.agents.length}
              </span>
            )}
          </button>

          {/* Model Selector */}
          <ModelSelector />
          
          {/* Agent Selector */}
          <AgentSelector />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse-glow"
              >
                <SparklesIcon className="w-10 h-10 text-white" />
              </motion.div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Welcome to Aether AI Chat Hub
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                  Experience next-generation AI conversation with multi-agent intelligence, 
                  voice commands, and real-time collaboration.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-lg w-full">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <CodeBracketIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-blue-900 dark:text-blue-100">Code Generation</span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Generate production-ready code in any language
                  </p>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <MicrophoneIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="font-medium text-purple-900 dark:text-purple-100">Voice Commands</span>
                  </div>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Speak your ideas and watch them come to life
                  </p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <UserGroupIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-green-900 dark:text-green-100">Multi-Agent System</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Collaborate with specialized AI experts
                  </p>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <BoltIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <span className="font-medium text-orange-900 dark:text-orange-100">Real-time Streaming</span>
                  </div>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Get instant responses as they're generated
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              
              {/* Streaming Message */}
              {streamingMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex space-x-4"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CpuChipIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 max-w-3xl">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">AI Assistant</span>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {streamingMessage}
                        <span className="inline-block w-2 h-5 bg-blue-500 animate-pulse ml-1"></span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {isLoading && !streamingMessage && <LoadingStates.TypingIndicator />}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Enhanced Input Area */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <form onSubmit={handleSendMessage} className="space-y-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage(e)
                  }
                }}
                placeholder={
                  voiceCapabilities?.available 
                    ? "Type your message or use voice commands..."
                    : "Type your message..."
                }
                rows={1}
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[48px] max-h-32"
                style={{ 
                  height: 'auto',
                  minHeight: '48px'
                }}
                onInput={(e) => {
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'
                }}
              />
              
              {/* Voice Input Button */}
              {voiceCapabilities?.available && (
                <button
                  type="button"
                  onClick={handleVoiceRecord}
                  disabled={isLoading}
                  className={`absolute right-12 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all duration-200 ${
                    isVoiceRecording
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }`}
                >
                  {isVoiceRecording ? (
                    <StopIcon className="w-5 h-5" />
                  ) : (
                    <MicrophoneIcon className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="btn-primary p-3 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {isLoading ? (
                <LoadingStates.LoadingSpinner size="sm" color="white" />
              ) : (
                <PaperAirplaneIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setInputMessage("Help me build a React component")}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full transition-colors"
            >
              <CodeBracketIcon className="w-4 h-4 mr-1 inline" />
              Build Component
            </button>
            <button
              type="button"
              onClick={() => setInputMessage("Review my code for best practices")}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full transition-colors"
            >
              <EyeIcon className="w-4 h-4 mr-1 inline" />
              Code Review
            </button>
            <button
              type="button"
              onClick={() => setInputMessage("Generate documentation for my project")}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full transition-colors"
            >
              <DocumentDuplicateIcon className="w-4 h-4 mr-1 inline" />
              Generate Docs
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      <div className="max-w-7xl mx-auto h-screen flex">
        {/* Main Chat Interface */}
        <div className={`flex-1 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 ${
          showMultiAgent ? 'mr-96' : ''
        }`}>
          <ChatInterface />
        </div>

        {/* Multi-Agent System Sidebar */}
        <AnimatePresence>
          {showMultiAgent && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="w-96 fixed right-0 top-0 bottom-0 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 overflow-y-auto z-40"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">Multi-Agent System</h3>
                <button
                  onClick={() => setShowMultiAgent(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ×
                </button>
              </div>
              <MultiAgentSystem onAgentResponse={handleAgentResponse} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voice Interface */}
        <VoiceInterface />
      </div>
    </div>
  )
}

export default ChatHub