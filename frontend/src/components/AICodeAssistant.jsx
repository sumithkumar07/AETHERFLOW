import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  SparklesIcon,
  LightBulbIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlayIcon,
  StopIcon,
  MicrophoneIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const AICodeAssistant = ({ 
  isVisible, 
  onClose, 
  codeContext = "", 
  cursorPosition = 0,
  fileType = "javascript" 
}) => {
  const [activeTab, setActiveTab] = useState('completions')
  const [completions, setCompletions] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [expandedItems, setExpandedItems] = useState(new Set())
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const { user } = useAuthStore()

  // Auto-fetch completions when context changes
  useEffect(() => {
    if (isVisible && codeContext) {
      fetchCompletions()
    }
  }, [isVisible, codeContext, cursorPosition])

  const fetchCompletions = async () => {
    if (!codeContext.trim()) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai-completion/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          code_context: codeContext,
          cursor_position: cursorPosition,
          file_type: fileType
        })
      })

      const data = await response.json()
      setCompletions(data.completions || [])
    } catch (error) {
      console.error('Failed to fetch completions:', error)
      toast.error('Failed to get AI completions')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSuggestions = async (issueType = 'optimization') => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai-completion/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          code_context: codeContext,
          issue_type: issueType
        })
      })

      const data = await response.json()
      setSuggestions(data.suggestions || [])
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
      toast.error('Failed to get AI suggestions')
    } finally {
      setIsLoading(false)
    }
  }

  const generateDocumentation = async () => {
    if (!codeContext.trim()) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai-completion/documentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          code_snippet: codeContext,
          language: fileType
        })
      })

      const data = await response.json()
      
      // Display documentation in a readable format
      if (data.documentation) {
        setActiveTab('documentation')
        // You could store this in state and display it
        toast.success('Documentation generated!')
      }
    } catch (error) {
      console.error('Failed to generate documentation:', error)
      toast.error('Failed to generate documentation')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleExpanded = (itemId) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  const handleCompletionSelect = (completion) => {
    // This would integrate with your code editor
    toast.success(`Applied: ${completion.text}`)
    
    // Learn from user selection
    fetch('/api/ai-completion/learn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.token}`
      },
      body: JSON.stringify({
        context: { code_context: codeContext, cursor_position: cursorPosition },
        selected_completion: completion
      })
    }).catch(console.error)
  }

  const startVoiceExplanation = () => {
    setIsVoiceActive(true)
    // This would integrate with the voice code review service
    toast.success('Voice explanation started')
    
    // Simulate voice explanation
    setTimeout(() => {
      setIsVoiceActive(false)
      toast.success('Voice explanation completed')
    }, 5000)
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-100 border-green-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const renderCompletions = () => (
    <div className="space-y-3">
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Getting AI suggestions...</span>
        </div>
      ) : completions.length > 0 ? (
        completions.map((completion, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer transition-all"
            onClick={() => handleCompletionSelect(completion)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <CodeBracketIcon className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {completion.type}
                </span>
                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                  {Math.round(completion.score * 100)}% match
                </span>
              </div>
            </div>
            <code className="text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 p-2 rounded block mb-2">
              {completion.text}
            </code>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {completion.description}
            </p>
          </motion.div>
        ))
      ) : (
        <div className="text-center py-8">
          <CodeBracketIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Start typing to get AI-powered code completions
          </p>
        </div>
      )}
    </div>
  )

  const renderSuggestions = () => (
    <div className="space-y-3">
      <div className="flex space-x-2 mb-4">
        {['optimization', 'readability', 'security', 'best_practice'].map((type) => (
          <button
            key={type}
            onClick={() => fetchSuggestions(type)}
            className="px-3 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors capitalize"
          >
            {type.replace('_', ' ')}
          </button>
        ))}
      </div>

      {suggestions.length > 0 ? (
        suggestions.map((suggestion, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div 
              className="p-4 cursor-pointer"
              onClick={() => toggleExpanded(`suggestion-${index}`)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <LightBulbIcon className="w-5 h-5 text-yellow-500" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {suggestion.title}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full border ${getSeverityColor(suggestion.impact)}`}>
                        {suggestion.impact} impact
                      </span>
                      <span className="text-xs text-gray-500">
                        {suggestion.type}
                      </span>
                    </div>
                  </div>
                </div>
                {expandedItems.has(`suggestion-${index}`) ? 
                  <ChevronUpIcon className="w-4 h-4 text-gray-400" /> :
                  <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                }
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {suggestion.description}
              </p>
            </div>

            <AnimatePresence>
              {expandedItems.has(`suggestion-${index}`) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Before:</h5>
                      <code className="text-xs text-gray-800 dark:text-gray-200 bg-red-50 dark:bg-red-900/20 p-2 rounded block">
                        {suggestion.before}
                      </code>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">After:</h5>
                      <code className="text-xs text-gray-800 dark:text-gray-200 bg-green-50 dark:bg-green-900/20 p-2 rounded block">
                        {suggestion.after}
                      </code>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))
      ) : (
        <div className="text-center py-8">
          <LightBulbIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Select a category to get smart suggestions
          </p>
        </div>
      )}
    </div>
  )

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-4xl max-h-[90vh] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  AI Code Assistant
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Get intelligent code completions and suggestions
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={startVoiceExplanation}
                className={`p-2 rounded-xl transition-colors ${
                  isVoiceActive 
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}
              >
                <MicrophoneIcon className="w-5 h-5" />
              </button>
              <button
                onClick={generateDocumentation}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                title="Generate Documentation"
              >
                <DocumentTextIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200/50 dark:border-gray-700/50">
            <button
              onClick={() => setActiveTab('completions')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'completions'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              🤖 Completions
            </button>
            <button
              onClick={() => {
                setActiveTab('suggestions')
                if (suggestions.length === 0) fetchSuggestions()
              }}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'suggestions'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              💡 Suggestions
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'completions' ? renderCompletions() : renderSuggestions()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs">Tab</kbd>
                <span>to accept</span>
              </div>
              <div className="flex items-center space-x-1">
                <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs">Esc</kbd>
                <span>to close</span>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
              <SparklesIcon className="w-3 h-3" />
              <span>Powered by AI</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AICodeAssistant