import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MagnifyingGlassIcon,
  SparklesIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  LinkIcon,
  CodeBracketIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useProjectStore } from '../store/projectStore'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const GlobalSmartSearch = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const { projects } = useProjectStore()
  const { isAuthenticated } = useAuthStore()

  // Smart search data sources
  const searchData = {
    projects: projects || [],
    templates: [
      { id: 'react-starter', name: 'React Starter Kit', description: 'Modern React app with Tailwind CSS', category: 'template' },
      { id: 'nextjs-blog', name: 'Next.js Blog', description: 'SEO-optimized blog with MDX', category: 'template' },
      { id: 'vue-dashboard', name: 'Vue Dashboard', description: 'Admin dashboard with Vue 3', category: 'template' },
      { id: 'express-api', name: 'Express API', description: 'RESTful API with authentication', category: 'template' },
      { id: 'python-ml', name: 'Python ML Starter', description: 'Machine learning project setup', category: 'template' },
      { id: 'flutter-app', name: 'Flutter Mobile App', description: 'Cross-platform mobile app', category: 'template' }
    ],
    integrations: [
      { id: 'stripe', name: 'Stripe', description: 'Payment processing integration', category: 'integration' },
      { id: 'auth0', name: 'Auth0', description: 'Authentication and authorization', category: 'integration' },
      { id: 'mongodb', name: 'MongoDB', description: 'NoSQL database integration', category: 'integration' },
      { id: 'openai', name: 'OpenAI', description: 'AI language model integration', category: 'integration' },
      { id: 'sendgrid', name: 'SendGrid', description: 'Email service integration', category: 'integration' },
      { id: 'aws-s3', name: 'AWS S3', description: 'Cloud storage integration', category: 'integration' }
    ],
    commands: [
      { id: 'create-project', name: 'Create New Project', description: 'Start a new development project', category: 'command' },
      { id: 'deploy-project', name: 'Deploy Project', description: 'Deploy your project to production', category: 'command' },
      { id: 'open-settings', name: 'Open Settings', description: 'Configure your preferences', category: 'command' },
      { id: 'view-templates', name: 'Browse Templates', description: 'Explore project templates', category: 'command' }
    ]
  }

  // AI-powered fuzzy search with context understanding
  const performSmartSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    
    try {
      // Simulate AI-powered search with fuzzy matching
      const allItems = [
        ...searchData.projects.map(p => ({ ...p, category: 'project', icon: FolderIcon })),
        ...searchData.templates.map(t => ({ ...t, icon: DocumentDuplicateIcon })),
        ...searchData.integrations.map(i => ({ ...i, icon: LinkIcon })),
        ...searchData.commands.map(c => ({ ...c, icon: SparklesIcon }))
      ]

      const query_lower = searchQuery.toLowerCase()
      const searchResults = allItems
        .map(item => {
          let score = 0
          
          // Exact name match (highest priority)
          if (item.name.toLowerCase().includes(query_lower)) {
            score += 100
          }
          
          // Description match
          if (item.description && item.description.toLowerCase().includes(query_lower)) {
            score += 50
          }
          
          // Category match
          if (item.category && item.category.toLowerCase().includes(query_lower)) {
            score += 30
          }
          
          // Fuzzy matching for typos (basic implementation)
          const nameWords = item.name.toLowerCase().split(' ')
          const queryWords = query_lower.split(' ')
          
          queryWords.forEach(qWord => {
            nameWords.forEach(nWord => {
              if (nWord.startsWith(qWord) || qWord.startsWith(nWord)) {
                score += 25
              }
            })
          })
          
          return { ...item, score }
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8) // Limit results

      setResults(searchResults)
      setSelectedIndex(0)
      
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Search failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSmartSearch(query)
    }, 200)
    
    return () => clearTimeout(timer)
  }, [query])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (results[selectedIndex]) {
            handleSelectResult(results[selectedIndex])
          }
          break
        case 'Escape':
          setIsOpen(false)
          setQuery('')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex])

  // Global shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleGlobalShortcut = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
        setTimeout(() => inputRef.current?.focus(), 100)
      }
    }

    window.addEventListener('keydown', handleGlobalShortcut)
    return () => window.removeEventListener('keydown', handleGlobalShortcut)
  }, [])

  const handleSelectResult = (result) => {
    setIsOpen(false)
    setQuery('')
    
    // Navigate based on result category
    switch (result.category) {
      case 'project':
        navigate(`/chat/${result.id}`)
        break
      case 'template':
        navigate(`/templates`)
        toast.success(`Opening ${result.name} template`)
        break
      case 'integration':
        navigate('/integrations')
        toast.success(`Opening ${result.name} integration`)
        break
      case 'command':
        executeCommand(result.id)
        break
      default:
        break
    }
  }

  const executeCommand = (commandId) => {
    switch (commandId) {
      case 'create-project':
        navigate('/chat')
        break
      case 'deploy-project':
        toast.success('Deploy command triggered')
        break
      case 'open-settings':
        navigate('/settings')
        break
      case 'view-templates':
        navigate('/templates')
        break
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      project: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
      template: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30',
      integration: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
      command: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30'
    }
    return colors[category] || 'text-gray-600 bg-gray-100'
  }

  return (
    <>
      {/* Search Button/Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 group"
      >
        <MagnifyingGlassIcon className="w-4 h-4" />
        <span className="hidden md:block text-sm">Search...</span>
        <span className="hidden md:block text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded ml-2">
          ⌘K
        </span>
      </button>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Search Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -50 }}
              className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl z-50 mx-4"
            >
              {/* Search Header */}
              <div className="flex items-center px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 mr-3" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search projects, templates, integrations..."
                  className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  autoFocus
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Search Results */}
              <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                      <span className="text-gray-600 dark:text-gray-400">Searching...</span>
                    </div>
                  </div>
                ) : results.length > 0 ? (
                  <div className="py-2">
                    {results.map((result, index) => {
                      const Icon = result.icon
                      return (
                        <button
                          key={`${result.category}-${result.id}`}
                          onClick={() => handleSelectResult(result)}
                          className={`w-full flex items-center space-x-3 px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left ${
                            index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                            <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                {result.name}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(result.category)}`}>
                                {result.category}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {result.description}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                ) : query ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <SparklesIcon className="w-8 h-8 text-gray-400 mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">No results found</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Try searching for projects, templates, or integrations
                    </p>
                  </div>
                ) : (
                  <div className="py-6 px-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          Recent Projects
                        </h3>
                        <div className="space-y-2">
                          {searchData.projects.slice(0, 3).map((project) => (
                            <button
                              key={project.id}
                              onClick={() => handleSelectResult({ ...project, category: 'project', icon: FolderIcon })}
                              className="w-full flex items-center space-x-2 text-left text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              <FolderIcon className="w-4 h-4" />
                              <span className="truncate">{project.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          Quick Actions
                        </h3>
                        <div className="space-y-2">
                          {searchData.commands.slice(0, 3).map((command) => (
                            <button
                              key={command.id}
                              onClick={() => handleSelectResult({ ...command, icon: SparklesIcon })}
                              className="w-full flex items-center space-x-2 text-left text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              <SparklesIcon className="w-4 h-4" />
                              <span className="truncate">{command.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Search Footer */}
              <div className="flex items-center justify-between px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200/50 dark:border-gray-700/50 rounded-b-2xl">
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center space-x-1">
                    <span className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">↑↓</span>
                    <span>Navigate</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">↵</span>
                    <span>Select</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">Esc</span>
                    <span>Close</span>
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <SparklesIcon className="w-4 h-4" />
                  <span>AI-Powered Search</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default GlobalSmartSearch