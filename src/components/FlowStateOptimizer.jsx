import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ClockIcon,
  ChartBarIcon,
  BoltIcon,
  PauseIcon,
  EyeSlashIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'
import { useChatStore } from '../store/chatStore'
import { useProjectStore } from '../store/projectStore'

const FlowStateOptimizer = ({ projectId }) => {
  const [flowState, setFlowState] = useState('neutral') // neutral, entering, flow, disrupted
  const [sessionTime, setSessionTime] = useState(0)
  const [focusScore, setFocusScore] = useState(0)
  const [suggestedBreak, setSuggestedBreak] = useState(false)
  const [distractionFreeMode, setDistractionFreeMode] = useState(false)
  const [flowMetrics, setFlowMetrics] = useState({
    messagesPerMinute: 0,
    responseTime: 0,
    contextSwitches: 0,
    deepWorkTime: 0
  })

  const { messages } = useChatStore()
  const { currentProject } = useProjectStore()
  const sessionStartRef = useRef(Date.now())
  const lastActivityRef = useRef(Date.now())
  const flowStartRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => {
      updateFlowState()
      updateSessionTime()
      analyzeFocusPatterns()
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [messages])

  const updateSessionTime = () => {
    const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000)
    setSessionTime(elapsed)
  }

  const updateFlowState = () => {
    const now = Date.now()
    const timeSinceLastActivity = now - lastActivityRef.current
    const recentMessages = messages.slice(-5)
    
    // Analyze activity patterns
    let newFlowState = 'neutral'
    let newFocusScore = 50

    // Calculate messages per minute
    const last10Minutes = messages.filter(msg => 
      (now - new Date(msg.timestamp).getTime()) < 600000
    )
    const messagesPerMinute = last10Minutes.length / 10

    // Analyze conversation depth
    const hasDeepConversation = recentMessages.some(msg => 
      msg.content.length > 100 && 
      (msg.content.includes('implement') || msg.content.includes('create') || msg.content.includes('help'))
    )

    // Analyze response patterns
    const quickResponses = recentMessages.filter((msg, idx) => {
      if (idx === 0) return false
      const timeDiff = new Date(msg.timestamp) - new Date(recentMessages[idx - 1].timestamp)
      return timeDiff < 30000 // Less than 30 seconds
    }).length

    // Flow state detection
    if (messagesPerMinute > 2 && hasDeepConversation && quickResponses > 2) {
      newFlowState = 'flow'
      newFocusScore = Math.min(95, focusScore + 5)
      
      if (!flowStartRef.current) {
        flowStartRef.current = now
      }
    } else if (messagesPerMinute > 1 && hasDeepConversation) {
      newFlowState = 'entering'
      newFocusScore = Math.min(80, focusScore + 2)
    } else if (timeSinceLastActivity > 300000) { // 5 minutes idle
      newFlowState = 'disrupted'
      newFocusScore = Math.max(20, focusScore - 10)
      flowStartRef.current = null
    }

    // Break suggestion logic
    const flowDuration = flowStartRef.current ? (now - flowStartRef.current) / 1000 / 60 : 0
    if (flowDuration > 90 && !suggestedBreak) { // 90 minutes of flow
      setSuggestedBreak(true)
    }

    setFlowState(newFlowState)
    setFocusScore(newFocusScore)
    setFlowMetrics({
      messagesPerMinute: messagesPerMinute.toFixed(1),
      responseTime: calculateAverageResponseTime(),
      contextSwitches: calculateContextSwitches(),
      deepWorkTime: flowDuration
    })

    lastActivityRef.current = now
  }

  const calculateAverageResponseTime = () => {
    const aiMessages = messages.filter(msg => msg.sender === 'assistant').slice(-5)
    if (aiMessages.length === 0) return 0
    
    const totalResponseTime = aiMessages.reduce((sum, msg) => {
      return sum + (msg.metadata?.responseTime || 0)
    }, 0)
    
    return Math.round(totalResponseTime / aiMessages.length / 1000) // Convert to seconds
  }

  const calculateContextSwitches = () => {
    let switches = 0
    const recentMessages = messages.slice(-10)
    
    for (let i = 1; i < recentMessages.length; i++) {
      const current = recentMessages[i].content.toLowerCase()
      const previous = recentMessages[i - 1].content.toLowerCase()
      
      // Simple context switch detection
      const contextKeywords = ['help', 'create', 'build', 'fix', 'deploy', 'test']
      const currentContext = contextKeywords.find(keyword => current.includes(keyword))
      const previousContext = contextKeywords.find(keyword => previous.includes(keyword))
      
      if (currentContext && previousContext && currentContext !== previousContext) {
        switches++
      }
    }
    
    return switches
  }

  const analyzeFocusPatterns = () => {
    // This would integrate with browser APIs or user tracking to understand focus patterns
    // For now, we'll simulate based on activity
    const isActiveSession = messages.length > 0 && 
      (Date.now() - new Date(messages[messages.length - 1].timestamp).getTime()) < 60000
    
    if (isActiveSession && flowState === 'flow') {
      // User is in deep work
      setFlowMetrics(prev => ({
        ...prev,
        deepWorkTime: prev.deepWorkTime + 0.1
      }))
    }
  }

  const dismissBreakSuggestion = () => {
    setSuggestedBreak(false)
  }

  const takeBreak = () => {
    setSuggestedBreak(false)
    setFlowState('neutral')
    setFocusScore(50)
    flowStartRef.current = null
    // Could integrate with system notifications or other break tools
  }

  const toggleDistractionFreeMode = () => {
    setDistractionFreeMode(!distractionFreeMode)
    // This would hide/minimize UI elements in the parent component
  }

  const getFlowStateColor = () => {
    switch (flowState) {
      case 'flow': return 'text-green-600 dark:text-green-400'
      case 'entering': return 'text-yellow-600 dark:text-yellow-400'
      case 'disrupted': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getFlowStateIcon = () => {
    switch (flowState) {
      case 'flow': return <BoltIcon className="w-4 h-4" />
      case 'entering': return <AdjustmentsHorizontalIcon className="w-4 h-4" />
      case 'disrupted': return <PauseIcon className="w-4 h-4" />
      default: return <ChartBarIcon className="w-4 h-4" />
    }
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m ${secs}s`
  }

  return (
    <div className="space-y-4">
      {/* Flow State Indicator */}
      <div className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-lg border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={getFlowStateColor()}>
              {getFlowStateIcon()}
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Flow State
            </span>
          </div>
          <span className={`text-sm font-medium capitalize ${getFlowStateColor()}`}>
            {flowState}
          </span>
        </div>
        
        {/* Focus Score */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>Focus Score</span>
            <span>{focusScore}/100</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
              initial={{ width: '50%' }}
              animate={{ width: `${focusScore}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Session Metrics */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Session Time</span>
            <div className="font-medium text-gray-900 dark:text-white">
              {formatTime(sessionTime)}
            </div>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Messages/min</span>
            <div className="font-medium text-gray-900 dark:text-white">
              {flowMetrics.messagesPerMinute}
            </div>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Avg Response</span>
            <div className="font-medium text-gray-900 dark:text-white">
              {flowMetrics.responseTime}s
            </div>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Deep Work</span>
            <div className="font-medium text-gray-900 dark:text-white">
              {Math.round(flowMetrics.deepWorkTime)}m
            </div>
          </div>
        </div>
      </div>

      {/* Break Suggestion */}
      <AnimatePresence>
        {suggestedBreak && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
          >
            <div className="flex items-start space-x-3">
              <ClockIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Time for a break?
                </h4>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  You've been in flow state for {Math.round(flowMetrics.deepWorkTime)} minutes. 
                  Consider taking a short break to maintain productivity.
                </p>
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={takeBreak}
                    className="px-3 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded text-xs hover:bg-yellow-300 dark:hover:bg-yellow-700 transition-colors"
                  >
                    Take Break
                  </button>
                  <button
                    onClick={dismissBreakSuggestion}
                    className="px-3 py-1 text-yellow-700 dark:text-yellow-300 text-xs hover:underline"
                  >
                    Not Now
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Focus Tools */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600 dark:text-gray-400">Focus Tools</span>
        <button
          onClick={toggleDistractionFreeMode}
          className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-xs transition-colors ${
            distractionFreeMode
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <EyeSlashIcon className="w-3 h-3" />
          <span>Distraction-Free</span>
        </button>
      </div>
    </div>
  )
}

export default FlowStateOptimizer