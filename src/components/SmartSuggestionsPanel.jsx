import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LightBulbIcon,
  XMarkIcon,
  SparklesIcon,
  CodeBracketIcon,
  CogIcon,
  BeakerIcon
} from '@heroicons/react/24/outline'
import { useChatStore } from '../store/chatStore'
import { useProjectStore } from '../store/projectStore'

const SmartSuggestionsPanel = ({ 
  isOpen, 
  onToggle, 
  projectId,
  className = '' 
}) => {
  const { selectedAgent, sendMessage } = useChatStore()
  const { currentProject } = useProjectStore()
  
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)

  // Generate contextual suggestions based on project and agent
  useEffect(() => {
    if (isOpen && currentProject) {
      generateSuggestions()
    }
  }, [isOpen, currentProject, selectedAgent, projectId])

  const generateSuggestions = async () => {
    setLoading(true)
    
    try {
      // Simulate AI-powered suggestion generation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const contextualSuggestions = getContextualSuggestions()
      setSuggestions(contextualSuggestions)
    } catch (error) {
      console.error('Failed to generate suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getContextualSuggestions = () => {
    const projectTech = currentProject?.tech_stack || []
    const projectStatus = currentProject?.status || 'draft'
    
    let baseSuggestions = []

    // Agent-specific suggestions
    switch (selectedAgent) {
      case 'developer':
        baseSuggestions = [
          {
            id: 'add_auth',
            icon: CogIcon,
            title: 'Add Authentication',
            description: 'Implement user login and registration system',
            category: 'Security',
            difficulty: 'Medium',
            estimatedTime: '30 minutes',
            tags: ['auth', 'security', 'jwt']
          },
          {
            id: 'setup_db',
            icon: CodeBracketIcon,
            title: 'Database Integration',
            description: 'Set up database models and connections',
            category: 'Backend',
            difficulty: 'Easy',
            estimatedTime: '20 minutes',
            tags: ['database', 'models', 'crud']
          },
          {
            id: 'api_routes',
            icon: SparklesIcon,
            title: 'Create API Routes',
            description: 'Build RESTful API endpoints for your data',
            category: 'Backend',
            difficulty: 'Medium',
            estimatedTime: '45 minutes',
            tags: ['api', 'rest', 'endpoints']
          },
          {
            id: 'error_handling',
            icon: BeakerIcon,
            title: 'Error Handling',
            description: 'Add comprehensive error handling and validation',
            category: 'Quality',
            difficulty: 'Easy',
            estimatedTime: '15 minutes',
            tags: ['errors', 'validation', 'debugging']
          }
        ]
        break

      case 'designer':
        baseSuggestions = [
          {
            id: 'design_system',
            icon: SparklesIcon,
            title: 'Create Design System',
            description: 'Build consistent UI components and styles',
            category: 'Design',
            difficulty: 'Medium',
            estimatedTime: '1 hour',
            tags: ['design-system', 'components', 'consistency']
          },
          {
            id: 'responsive_design',
            icon: CogIcon,
            title: 'Mobile Responsiveness',
            description: 'Optimize layouts for mobile devices',
            category: 'UX',
            difficulty: 'Easy',
            estimatedTime: '30 minutes',
            tags: ['responsive', 'mobile', 'ui']
          },
          {
            id: 'animations',
            icon: BeakerIcon,
            title: 'Add Animations',
            description: 'Enhance user experience with smooth transitions',
            category: 'UX',
            difficulty: 'Medium',
            estimatedTime: '25 minutes',
            tags: ['animations', 'framer-motion', 'ux']
          }
        ]
        break

      case 'tester':
        baseSuggestions = [
          {
            id: 'unit_tests',
            icon: BeakerIcon,
            title: 'Write Unit Tests',
            description: 'Create comprehensive test coverage for components',
            category: 'Testing',
            difficulty: 'Medium',
            estimatedTime: '40 minutes',
            tags: ['testing', 'jest', 'unit-tests']
          },
          {
            id: 'integration_tests',
            icon: CogIcon,
            title: 'API Integration Tests',
            description: 'Test API endpoints and data flow',
            category: 'Testing',
            difficulty: 'Hard',
            estimatedTime: '1 hour',
            tags: ['integration', 'api', 'testing']
          }
        ]
        break

      case 'integrator':
        baseSuggestions = [
          {
            id: 'payment_integration',
            icon: SparklesIcon,
            title: 'Payment Processing',
            description: 'Integrate Stripe or PayPal for payments',
            category: 'Integration',
            difficulty: 'Hard',
            estimatedTime: '2 hours',
            tags: ['payments', 'stripe', 'integration']
          },
          {
            id: 'email_service',
            icon: CogIcon,
            title: 'Email Service',
            description: 'Set up transactional emails with SendGrid',
            category: 'Integration',
            difficulty: 'Medium',
            estimatedTime: '45 minutes',
            tags: ['email', 'sendgrid', 'notifications']
          }
        ]
        break

      default:
        baseSuggestions = [
          {
            id: 'getting_started',
            icon: SparklesIcon,
            title: 'Getting Started',
            description: 'Set up your project structure and dependencies',
            category: 'Setup',
            difficulty: 'Easy',
            estimatedTime: '15 minutes',
            tags: ['setup', 'structure', 'dependencies']
          }
        ]
    }

    // Add project-specific suggestions based on tech stack
    if (projectTech.includes('React')) {
      baseSuggestions.push({
        id: 'react_optimization',
        icon: CodeBracketIcon,
        title: 'React Performance',
        description: 'Optimize React components for better performance',
        category: 'Performance',
        difficulty: 'Medium',
        estimatedTime: '35 minutes',
        tags: ['react', 'performance', 'optimization']
      })
    }

    if (projectTech.includes('FastAPI')) {
      baseSuggestions.push({
        id: 'fastapi_docs',
        icon: BeakerIcon,
        title: 'API Documentation',
        description: 'Auto-generate OpenAPI documentation',
        category: 'Documentation',
        difficulty: 'Easy',
        estimatedTime: '10 minutes',
        tags: ['fastapi', 'docs', 'openapi']
      })
    }

    return baseSuggestions.slice(0, 6) // Limit to 6 suggestions
  }

  const handleSuggestionClick = async (suggestion) => {
    const prompt = `I'd like to ${suggestion.title.toLowerCase()}. ${suggestion.description}. Can you help me implement this step by step?`
    
    await sendMessage({
      content: prompt,
      projectId: projectId,
      agent: selectedAgent
    })
    
    // Close panel after sending suggestion
    onToggle()
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300'
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300'
      case 'Hard': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed top-0 right-0 h-full w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-2xl z-50 overflow-y-auto ${className}`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <LightBulbIcon className="w-6 h-6 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Smart Suggestions
              </h3>
            </div>
            <button
              onClick={onToggle}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            AI-powered suggestions for your {selectedAgent} workflow
          </p>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 h-20 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => {
                const IconComponent = suggestion.icon
                
                return (
                  <motion.button
                    key={suggestion.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {suggestion.title}
                          </h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(suggestion.difficulty)}`}>
                            {suggestion.difficulty}
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {suggestion.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {suggestion.category}
                            </span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ~{suggestion.estimatedTime}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {suggestion.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <SparklesIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                AI-Powered Suggestions
              </span>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              These suggestions are generated based on your project context, tech stack, and current agent specialization.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onToggle}
        className="fixed inset-0 bg-black/20 z-40"
      />
    </AnimatePresence>
  )
}

export default SmartSuggestionsPanel