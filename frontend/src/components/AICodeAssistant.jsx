import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  SparklesIcon,
  CodeBracketIcon,
  LightBulbIcon,
  XMarkIcon,
  ChatBubbleLeftIcon,
  CommandLineIcon,
  DocumentTextIcon,
  PaperAirplaneIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const AICodeAssistant = ({ projectId, projectName }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [conversation, setConversation] = useState([])
  const inputRef = useRef(null)
  const messagesRef = useRef(null)

  // Smart code suggestions based on context
  const contextualSuggestions = [
    {
      id: 'optimize',
      title: 'Optimize Performance',
      description: 'Analyze code for performance improvements',
      icon: LightBulbIcon,
      prompt: 'Analyze the current code for performance bottlenecks and suggest optimizations'
    },
    {
      id: 'debug',
      title: 'Debug Issues',
      description: 'Help identify and fix bugs',
      icon: CommandLineIcon,
      prompt: 'Help me debug any issues in the current code and suggest fixes'
    },
    {
      id: 'refactor',
      title: 'Code Refactoring',
      description: 'Improve code structure and readability',
      icon: CodeBracketIcon,
      prompt: 'Suggest refactoring improvements for better code organization'
    },
    {
      id: 'document',
      title: 'Add Documentation',
      description: 'Generate comments and documentation',
      icon: DocumentTextIcon,
      prompt: 'Generate comprehensive documentation and comments for the current code'
    }
  ]

  // Auto-expand when first opened
  useEffect(() => {
    if (isOpen && conversation.length === 0) {
      setTimeout(() => setIsExpanded(true), 300)
    }
  }, [isOpen, conversation.length])

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [conversation])

  // Simulate AI-powered code analysis and suggestions
  const getSmartSuggestions = async (context) => {
    setIsLoading(true)
    try {
      // Simulate AI analysis delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const contextSuggestions = [
        'Consider using useMemo to optimize expensive calculations',
        'This component could benefit from error boundaries',
        'Add loading states for better user experience',
        'Consider implementing code splitting for better performance'
      ]
      
      setSuggestions(contextSuggestions)
    } catch (error) {
      console.error('Failed to get suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (message) => {
    if (!message.trim()) return
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    }
    
    setConversation(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    
    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const aiResponse = {
        id: Date.now() + 1,
        type: 'assistant',
        content: generateContextualResponse(message),
        timestamp: new Date(),
        suggestions: ['Apply this change', 'Show example', 'Explain more']
      }
      
      setConversation(prev => [...prev, aiResponse])
    } catch (error) {
      toast.error('Failed to get AI response')
    } finally {
      setIsLoading(false)
    }
  }

  const generateContextualResponse = (userMessage) => {
    const responses = {
      'optimize': `I've analyzed your ${projectName} project and found several optimization opportunities:

1. **Component Memoization**: Use React.memo for components that receive the same props
2. **State Updates**: Batch related state updates to reduce re-renders
3. **Bundle Size**: Consider code splitting for routes and heavy components

Here's an example optimization:

\`\`\`jsx
// Before
const ExpensiveComponent = ({ data, filters }) => {
  const processedData = processLargeData(data, filters)
  return <div>{/* render */}</div>
}

// After
const ExpensiveComponent = React.memo(({ data, filters }) => {
  const processedData = useMemo(() => 
    processLargeData(data, filters), [data, filters]
  )
  return <div>{/* render */}</div>
})
\`\`\``,
      
      'debug': `Let me help you debug the current issues in ${projectName}:

**Common Issues Found:**
1. **Missing Error Handling**: Add try-catch blocks for API calls
2. **Memory Leaks**: Cleanup effects and event listeners
3. **State Race Conditions**: Use useCallback for event handlers

**Quick Fix Example:**
\`\`\`jsx
useEffect(() => {
  const controller = new AbortController()
  
  fetchData({ signal: controller.signal })
    .catch(err => {
      if (err.name !== 'AbortError') {
        console.error('Fetch failed:', err)
      }
    })
  
  return () => controller.abort()
}, [])
\`\`\``,
      
      'default': `I'm here to help with your ${projectName} project! I can assist with:

• **Code Review**: Analyze your code for improvements
• **Bug Fixing**: Help identify and resolve issues  
• **Performance**: Optimize for better user experience
• **Best Practices**: Suggest modern development patterns

What specific aspect would you like help with?`
    }
    
    for (const [key, response] of Object.entries(responses)) {
      if (userMessage.toLowerCase().includes(key)) {
        return response
      }
    }
    
    return responses.default
  }

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion.prompt)
  }

  const handleQuickAction = (action) => {
    switch (action) {
      case 'Apply this change':
        toast.success('Changes applied to your code')
        break
      case 'Show example':
        toast.success('Code example copied to clipboard')
        break
      case 'Explain more':
        handleSendMessage('Can you explain this in more detail?')
        break
    }
  }

  return (
    <>
      {/* Floating Assistant Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 z-40 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SparklesIcon className="w-6 h-6 text-white group-hover:animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* AI Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              width: isExpanded ? 480 : 320,
              height: isExpanded ? 600 : 400
            }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className={`fixed bottom-6 right-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl z-40 flex flex-col transition-all duration-300`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    AI Code Assistant
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {projectName}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
                >
                  {isExpanded ? (
                    <ArrowsPointingInIcon className="w-4 h-4" />
                  ) : (
                    <ArrowsPointingOutIcon className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {conversation.length === 0 ? (
                /* Welcome Screen */
                <div className="flex-1 p-4 space-y-4">
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <CodeBracketIcon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Ready to help!
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      I can help optimize, debug, and improve your code
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {contextualSuggestions.map((suggestion) => {
                      const Icon = suggestion.icon
                      return (
                        <button
                          key={suggestion.id}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="p-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl border border-gray-200/50 dark:border-gray-700/50 transition-colors text-left group"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="p-1.5 bg-white dark:bg-gray-700 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                              <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {suggestion.title}
                              </h5>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {suggestion.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                /* Conversation */
                <div 
                  ref={messagesRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                >
                  {conversation.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${
                        message.type === 'user' 
                          ? 'bg-blue-500 text-white rounded-2xl rounded-br-sm' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl rounded-bl-sm'
                      } px-4 py-3`}>
                        <div className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </div>
                        {message.suggestions && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {message.suggestions.map((suggestion) => (
                              <button
                                key={suggestion}
                                onClick={() => handleQuickAction(suggestion)}
                                className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Analyzing...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Input Area */}
              <div className="border-t border-gray-200/50 dark:border-gray-700/50 p-4">
                <div className="flex items-end space-x-2">
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage(input)
                        }
                      }}
                      placeholder="Ask about your code..."
                      className="w-full px-3 py-2 pr-10 bg-gray-50 dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      rows="2"
                      disabled={isLoading}
                    />
                    <button
                      onClick={() => handleSendMessage(input)}
                      disabled={!input.trim() || isLoading}
                      className="absolute right-2 bottom-2 p-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                    >
                      <PaperAirplaneIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Press Enter to send • Shift+Enter for new line
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AICodeAssistant