import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MagnifyingGlassIcon,
  XMarkIcon,
  FolderIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  SparklesIcon,
  ClockIcon,
  TagIcon,
  ArrowRightIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const GlobalSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [searchType, setSearchType] = useState('all')
  const [recentSearches, setRecentSearches] = useState(['React components', 'API endpoints', 'authentication'])
  const inputRef = useRef(null)
  const navigate = useNavigate()

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return

      switch (e.key) {
        case 'Escape':
          onClose()
          break
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
            handleResultClick(results[selectedIndex])
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex, onClose])

  // AI-powered search
  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      // Simulate AI-powered search with contextual results
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockResults = [
        {
          id: 1,
          type: 'project',
          title: 'E-commerce Dashboard',
          description: 'React-based admin dashboard with analytics',
          path: '/projects/ecommerce-dashboard',
          icon: FolderIcon,
          category: 'Projects',
          relevance: 95,
          lastModified: '2 hours ago',
          tags: ['React', 'Dashboard', 'Analytics']
        },
        {
          id: 2,
          type: 'code',
          title: 'UserAuthentication.jsx',
          description: 'Authentication component with JWT integration',
          path: '/projects/auth-app/src/components/UserAuthentication.jsx',
          icon: CodeBracketIcon,
          category: 'Code Files',
          relevance: 92,
          lastModified: '1 day ago',
          tags: ['Auth', 'JWT', 'React']
        },
        {
          id: 3,
          type: 'template',
          title: 'Modern SaaS Template',
          description: 'Complete SaaS starter with authentication and billing',
          path: '/templates/saas-template',
          icon: DocumentTextIcon,
          category: 'Templates',
          relevance: 88,
          lastModified: '3 days ago',
          tags: ['SaaS', 'Billing', 'Starter']
        },
        {
          id: 4,
          type: 'function',
          title: 'generateApiKey()',
          description: 'Utility function to generate secure API keys',
          path: '/projects/utils/apiKey.js:line 45',
          icon: CommandLineIcon,
          category: 'Functions',
          relevance: 85,
          lastModified: '5 days ago',
          tags: ['Security', 'API', 'Utilities']
        },
        {
          id: 5,
          type: 'integration',
          title: 'Stripe Payment Integration',
          description: 'Complete Stripe integration with webhooks',
          path: '/integrations/stripe',
          icon: SparklesIcon,
          category: 'Integrations',
          relevance: 82,
          lastModified: '1 week ago',
          tags: ['Payment', 'Stripe', 'Webhooks']
        }
      ].filter(result => 
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )

      setResults(mockResults)
      setSelectedIndex(0)
    } catch (error) {
      toast.error('Search failed')
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        performSearch(query)
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleResultClick = (result) => {
    // Add to recent searches
    setRecentSearches(prev => {
      const updated = [query, ...prev.filter(search => search !== query)].slice(0, 5)
      return updated
    })

    // Navigate based on result type
    switch (result.type) {
      case 'project':
        navigate(result.path)
        break
      case 'code':
        // Open code file in editor
        navigate(`/editor${result.path}`)
        break
      case 'template':
        navigate(result.path)
        break
      case 'integration':
        navigate(`/integrations/${result.path.split('/').pop()}`)
        break
      default:
        navigate(result.path)
    }
    
    onClose()
    toast.success(`Opening ${result.title}`)
  }

  const getResultIcon = (result) => {
    const Icon = result.icon
    return <Icon className="w-5 h-5" />
  }

  const getRelevanceColor = (relevance) => {
    if (relevance >= 90) return 'text-green-600 dark:text-green-400'
    if (relevance >= 80) return 'text-blue-600 dark:text-blue-400'
    if (relevance >= 70) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl mx-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl overflow-hidden"
        >
          {/* Search Header */}
          <div className="flex items-center p-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-3 flex-1">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects, code, templates, integrations..."
                className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg"
              />
              {isLoading && (
                <div className="w-5 h-5">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Search Filters */}
          <div className="flex items-center space-x-2 p-4 border-b border-gray-200/50 dark:border-gray-700/50">
            {['all', 'projects', 'code', 'templates', 'integrations'].map((type) => (
              <button
                key={type}
                onClick={() => setSearchType(type)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors capitalize ${
                  searchType === type
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto">
            {query && results.length > 0 ? (
              <div className="p-2">
                {results.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleResultClick(result)}
                    className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                      index === selectedIndex
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      index === selectedIndex 
                        ? 'bg-blue-100 dark:bg-blue-800/30' 
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      {getResultIcon(result)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                          {result.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-medium ${getRelevanceColor(result.relevance)}`}>
                            {result.relevance}%
                          </span>
                          <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-2">
                        {result.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {result.category}
                          </span>
                          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-500">
                            <ClockIcon className="w-3 h-3" />
                            <span>{result.lastModified}</span>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          {result.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : query && !isLoading ? (
              <div className="p-8 text-center">
                <MagnifyingGlassIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No results found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try different keywords or check your spelling
                </p>
              </div>
            ) : (
              /* Recent Searches & Suggestions */
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Recent Searches
                </h3>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(search)}
                      className="flex items-center space-x-3 w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
                    >
                      <ClockIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">{search}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setQuery('recent projects')}
                      className="p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                    >
                      <FolderIcon className="w-5 h-5 text-blue-500 mb-2" />
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Recent Projects</div>
                    </button>
                    <button
                      onClick={() => setQuery('code snippets')}
                      className="p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                    >
                      <CodeBracketIcon className="w-5 h-5 text-green-500 mb-2" />
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Code Snippets</div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs">↵</kbd>
                <span>to select</span>
              </div>
              <div className="flex items-center space-x-1">
                <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs">↑↓</kbd>
                <span>to navigate</span>
              </div>
              <div className="flex items-center space-x-1">
                <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs">esc</kbd>
                <span>to close</span>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
              <SparklesIcon className="w-3 h-3" />
              <span>AI-powered search</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default GlobalSearch