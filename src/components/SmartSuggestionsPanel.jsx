import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LightBulbIcon,
  XMarkIcon,
  ChevronRightIcon,
  SparklesIcon,
  CodeBracketIcon,
  AdjustmentsHorizontalIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useChatStore } from '../store/chatStore'
import { useProjectStore } from '../store/projectStore'

const SmartSuggestionsPanel = ({ isOpen, onToggle, projectId }) => {
  const { currentProject } = useProjectStore()
  const { messages, selectedAgent, selectedModel } = useChatStore()
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)

  // Generate contextual suggestions based on project state and conversation
  useEffect(() => {
    if (isOpen && projectId) {
      generateSuggestions()
    }
  }, [isOpen, projectId, messages, currentProject])

  const generateSuggestions = async () => {
    setLoading(true)
    try {
      // Analyze current context to generate smart suggestions
      const contextualSuggestions = await analyzeProjectContext()
      setSuggestions(contextualSuggestions)
    } catch (error) {
      console.error('Failed to generate suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  const analyzeProjectContext = async () => {
    const lastMessages = messages.slice(-3)
    const techStack = currentProject?.tech_stack || []
    const projectStatus = currentProject?.status || 'active'
    
    // Smart suggestion categories
    const suggestions = []

    // Code quality suggestions
    if (lastMessages.some(msg => msg.content.includes('error') || msg.content.includes('bug'))) {
      suggestions.push({
        id: 'debug_help',
        type: 'debugging',
        title: 'Debug Assistant',
        description: 'Let me help analyze and fix the current issue',
        action: 'Can you help me debug this issue step by step?',
        priority: 'high',
        icon: ExclamationTriangleIcon,
        color: 'text-red-600'
      })
    }

    // Performance optimization
    if (techStack.includes('React') && !suggestions.find(s => s.type === 'performance')) {
      suggestions.push({
        id: 'react_optimization',
        type: 'performance',
        title: 'React Performance',
        description: 'Optimize component rendering and state management',
        action: 'Show me React performance optimization opportunities',
        priority: 'medium',
        icon: AdjustmentsHorizontalIcon,
        color: 'text-blue-600'
      })
    }

    // Best practices
    if (selectedAgent === 'developer') {
      suggestions.push({
        id: 'best_practices',
        type: 'best_practices',
        title: 'Code Best Practices',
        description: 'Review current code for improvement opportunities',
        action: 'Review my current code for best practices and improvements',
        priority: 'medium',
        icon: SparklesIcon,
        color: 'text-purple-600'
      })
    }

    // Feature suggestions based on project type
    if (techStack.includes('FastAPI') || techStack.includes('Express')) {
      suggestions.push({
        id: 'api_security',
        type: 'security',
        title: 'API Security',
        description: 'Implement authentication and security measures',
        action: 'Help me implement proper API security and authentication',
        priority: 'high',
        icon: CodeBracketIcon,
        color: 'text-green-600'
      })
    }

    // Testing suggestions
    if (!techStack.some(tech => tech.toLowerCase().includes('test'))) {
      suggestions.push({
        id: 'add_testing',
        type: 'testing',
        title: 'Add Testing',
        description: 'Set up comprehensive testing for your project',
        action: 'Help me set up testing framework and write tests',
        priority: 'medium',
        icon: CodeBracketIcon,
        color: 'text-indigo-600'
      })
    }

    // Deployment suggestions
    if (projectStatus === 'active' && currentProject?.progress > 70) {
      suggestions.push({
        id: 'deployment_ready',
        type: 'deployment',
        title: 'Ready to Deploy',
        description: 'Your project looks ready for deployment',
        action: 'Help me prepare this project for production deployment',
        priority: 'high',
        icon: SparklesIcon,
        color: 'text-emerald-600'
      })
    }

    return suggestions.slice(0, 5) // Limit to 5 suggestions
  }

  const handleSuggestionClick = (suggestion) => {
    // Auto-fill the chat input with the suggestion
    const chatInput = document.querySelector('textarea[placeholder*="Ask AI"]')
    if (chatInput) {
      chatInput.value = suggestion.action
      chatInput.focus()
      
      // Trigger input event to update React state
      const event = new Event('input', { bubbles: true })
      chatInput.dispatchEvent(event)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
      case 'medium': return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
      default: return 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ duration: 0.3 }}
        className="fixed right-4 top-20 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl z-50 max-h-[calc(100vh-6rem)] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <LightBulbIcon className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Smart Suggestions</h3>
          </div>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-3">
              {suggestions.map((suggestion) => {
                const Icon = suggestion.icon
                return (
                  <motion.button
                    key={suggestion.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full p-3 rounded-lg border text-left transition-all duration-200 hover:shadow-md ${getPriorityColor(suggestion.priority)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className={`w-5 h-5 mt-0.5 ${suggestion.color}`} />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {suggestion.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {suggestion.description}
                        </p>
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                            Try this →
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <LightBulbIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No suggestions available yet. Keep chatting with AI to get personalized recommendations!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Suggestions update based on your conversation context
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default SmartSuggestionsPanel