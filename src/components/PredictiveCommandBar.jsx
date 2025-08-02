import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CommandLineIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { useChatStore } from '../store/chatStore'
import { useEnhancedProjectStore } from '../store/enhancedProjectStore'

const PredictiveCommandBar = ({ projectId, onCommand, isVisible = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [predictions, setPredictions] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentCommands, setRecentCommands] = useState([])

  const { messages, selectedAgent } = useChatStore()
  const { predictNextAction, getEnhancedProjectData } = useEnhancedProjectStore()
  const inputRef = useRef(null)

  useEffect(() => {
    const handleKeyboard = (e) => {
      if (e.metaKey && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      } else if (e.key === 'Escape') {
        setIsOpen(false)
        setQuery('')
      }
    }

    document.addEventListener('keydown', handleKeyboard)
    return () => document.removeEventListener('keydown', handleKeyboard)
  }, [])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (query.length > 0) {
      generatePredictions()
    } else {
      loadRecentCommands()
    }
  }, [query, projectId])

  const generatePredictions = () => {
    const projectData = getEnhancedProjectData(projectId)
    const lowerQuery = query.toLowerCase()
    
    const allCommands = [
      // Development commands
      { command: 'Create a new component', category: 'Development', icon: '⚛️' },
      { command: 'Add authentication', category: 'Development', icon: '🔐' },
      { command: 'Set up database connection', category: 'Development', icon: '🗄️' },
      { command: 'Implement API endpoints', category: 'Development', icon: '🔌' },
      { command: 'Add error handling', category: 'Development', icon: '⚠️' },
      
      // Testing commands
      { command: 'Write unit tests', category: 'Testing', icon: '🧪' },
      { command: 'Run all tests', category: 'Testing', icon: '▶️' },
      { command: 'Check test coverage', category: 'Testing', icon: '📊' },
      
      // Deployment commands
      { command: 'Deploy to staging', category: 'Deployment', icon: '🚀' },
      { command: 'Deploy to production', category: 'Deployment', icon: '🌟' },
      { command: 'Check deployment status', category: 'Deployment', icon: '📋' },
      
      // Debugging commands
      { command: 'Debug the current error', category: 'Debugging', icon: '🐛' },
      { command: 'Analyze performance issues', category: 'Debugging', icon: '⚡' },
      { command: 'Check application logs', category: 'Debugging', icon: '📝' },
      
      // Code quality
      { command: 'Review code quality', category: 'Quality', icon: '✨' },
      { command: 'Optimize performance', category: 'Quality', icon: '🚄' },
      { command: 'Refactor this code', category: 'Quality', icon: '🔄' },
      
      // Project management
      { command: 'Show project status', category: 'Project', icon: '📈' },
      { command: 'Update dependencies', category: 'Project', icon: '📦' },
      { command: 'Generate documentation', category: 'Project', icon: '📚' }
    ]

    // Filter commands based on query
    let filteredCommands = allCommands.filter(cmd =>
      cmd.command.toLowerCase().includes(lowerQuery) ||
      cmd.category.toLowerCase().includes(lowerQuery)
    )

    // Add smart predictions based on project context
    const smartPredictions = generateSmartPredictions(projectData, lowerQuery)
    filteredCommands = [...smartPredictions, ...filteredCommands]

    // Sort by relevance
    filteredCommands.sort((a, b) => {
      const aIndex = a.command.toLowerCase().indexOf(lowerQuery)
      const bIndex = b.command.toLowerCase().indexOf(lowerQuery)
      if (aIndex !== bIndex) return aIndex - bIndex
      return a.command.length - b.command.length
    })

    setPredictions(filteredCommands.slice(0, 8))
    setSelectedIndex(0)
  }

  const generateSmartPredictions = (projectData, query) => {
    const predictions = []
    const recentMessages = messages.slice(-3)
    
    // Context-aware suggestions
    if (recentMessages.some(msg => msg.content.includes('error'))) {
      predictions.push({
        command: `Help me fix the ${query || 'current'} error`,
        category: 'Smart',
        icon: '🤖',
        confidence: 0.9
      })
    }
    
    if (query.includes('deploy') && projectData?.project?.progress > 70) {
      predictions.push({
        command: 'Prepare this project for production deployment',
        category: 'Smart',
        icon: '🎯',
        confidence: 0.85
      })
    }
    
    if (query.includes('test') && !projectData?.project?.tech_stack?.includes('test')) {
      predictions.push({
        command: 'Set up testing framework for this project',
        category: 'Smart',
        icon: '🧠',
        confidence: 0.8
      })
    }

    return predictions
  }

  const loadRecentCommands = () => {
    const saved = localStorage.getItem(`recent_commands_${projectId}`)
    const recent = saved ? JSON.parse(saved) : []
    setRecentCommands(recent.slice(0, 5))
    setPredictions(recent.slice(0, 5))
  }

  const saveRecentCommand = (command) => {
    const saved = localStorage.getItem(`recent_commands_${projectId}`)
    const recent = saved ? JSON.parse(saved) : []
    
    const updated = [
      { command, timestamp: Date.now(), category: 'Recent', icon: '🕒' },
      ...recent.filter(r => r.command !== command).slice(0, 9)
    ]
    
    localStorage.setItem(`recent_commands_${projectId}`, JSON.stringify(updated))
  }

  const handleCommand = (command) => {
    saveRecentCommand(command)
    onCommand?.(command)
    setIsOpen(false)
    setQuery('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, predictions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (predictions[selectedIndex]) {
        handleCommand(predictions[selectedIndex].command)
      }
    }
  }

  const getCommandShortcut = (command) => {
    if (command.includes('deploy')) return '⌘D'
    if (command.includes('test')) return '⌘T'
    if (command.includes('debug')) return '⌘B'
    return null
  }

  if (!isVisible && !isOpen) return null

  return (
    <>
      {/* Trigger Button */}
      {isVisible && !isOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 shadow-lg z-50 flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <CommandLineIcon className="w-4 h-4" />
          <span className="text-sm">Search commands...</span>
          <span className="text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">⌘K</span>
        </motion.button>
      )}

      {/* Command Palette */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />

            {/* Command Palette */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
            >
              {/* Search Input */}
              <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 mr-3" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search commands or describe what you want to do..."
                  className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <span className="text-xs text-gray-400 ml-2">ESC to close</span>
              </div>

              {/* Command List */}
              <div className="max-h-96 overflow-y-auto">
                {predictions.length > 0 ? (
                  <div className="py-2">
                    {predictions.map((prediction, index) => (
                      <motion.button
                        key={`${prediction.command}-${index}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => handleCommand(prediction.command)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                          index === selectedIndex
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{prediction.icon}</span>
                          <div>
                            <div className="font-medium">{prediction.command}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {prediction.category}
                              {prediction.confidence && (
                                <span className="ml-2">
                                  {Math.round(prediction.confidence * 100)}% match
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getCommandShortcut(prediction.command) && (
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                              {getCommandShortcut(prediction.command)}
                            </span>
                          )}
                          <ArrowRightIcon className="w-3 h-3 text-gray-400" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                    <SparklesIcon className="w-8 h-8 mx-auto mb-2" />
                    <p>No commands found</p>
                    <p className="text-sm">Try searching for "deploy", "test", or "create"</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span>↑↓ Navigate</span>
                    <span>↵ Execute</span>
                    <span>ESC Cancel</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <SparklesIcon className="w-3 h-3" />
                    <span>AI-powered suggestions</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default PredictiveCommandBar