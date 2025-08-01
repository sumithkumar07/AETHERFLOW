import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PuzzlePieceIcon,
  LightBulbIcon,
  ArrowTopRightOnSquareIcon,
  SparklesIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  TagIcon,
  BoltIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useProjectStore } from '../store/projectStore'
import toast from 'react-hot-toast'

const SmartIntegrationRecommendations = ({ projectId, projectContext = '' }) => {
  const [recommendations, setRecommendations] = useState([])
  const [popularIntegrations, setPopularIntegrations] = useState([])
  const [oneClickSetups, setOneClickSetups] = useState([])
  const [isVisible, setIsVisible] = useState(false)
  const [installedIntegrations, setInstalledIntegrations] = useState(new Set())

  // Integration database with smart recommendations
  const integrationDatabase = {
    'react': [
      {
        id: 'react-query',
        name: 'TanStack Query',
        description: 'Powerful data synchronization for React',
        category: 'Data Fetching',
        popularity: 95,
        setupTime: '5 min',
        benefits: ['Caching', 'Background Updates', 'Optimistic Updates'],
        compatibility: 100,
        reason: 'Perfect for managing server state in React apps'
      },
      {
        id: 'framer-motion',
        name: 'Framer Motion',
        description: 'Production-ready motion library for React',
        category: 'Animation',
        popularity: 88,
        setupTime: '3 min',
        benefits: ['Smooth Animations', 'Gesture Support', 'Layout Animations'],
        compatibility: 95,
        reason: 'Enhance user experience with beautiful animations'
      }
    ],
    'authentication': [
      {
        id: 'auth0',
        name: 'Auth0',
        description: 'Universal authentication & authorization platform',
        category: 'Authentication',
        popularity: 92,
        setupTime: '10 min',
        benefits: ['Social Login', 'MFA', 'User Management'],
        compatibility: 98,
        reason: 'Comprehensive auth solution for modern apps'
      },
      {
        id: 'clerk',
        name: 'Clerk',
        description: 'Complete authentication and user management',
        category: 'Authentication',
        popularity: 85,
        setupTime: '8 min',
        benefits: ['Pre-built UI', 'Session Management', 'Organizations'],
        compatibility: 95,
        reason: 'Developer-friendly auth with beautiful UI components'
      }
    ],
    'database': [
      {
        id: 'prisma',
        name: 'Prisma',
        description: 'Next-generation ORM for Node.js and TypeScript',
        category: 'Database',
        popularity: 90,
        setupTime: '15 min',
        benefits: ['Type Safety', 'Auto Migrations', 'Query Builder'],
        compatibility: 92,
        reason: 'Type-safe database access with excellent DX'
      },
      {
        id: 'supabase',
        name: 'Supabase',
        description: 'Open source Firebase alternative',
        category: 'Backend as a Service',
        popularity: 87,
        setupTime: '12 min',
        benefits: ['Real-time', 'Auth', 'Storage', 'Edge Functions'],
        compatibility: 94,
        reason: 'Complete backend solution with PostgreSQL'
      }
    ],
    'styling': [
      {
        id: 'tailwindcss',
        name: 'Tailwind CSS',
        description: 'Utility-first CSS framework',
        category: 'Styling',
        popularity: 94,
        setupTime: '7 min',
        benefits: ['Utility Classes', 'Customizable', 'Small Bundle'],
        compatibility: 100,
        reason: 'Rapid UI development with utility classes'
      }
    ],
    'payments': [
      {
        id: 'stripe',
        name: 'Stripe',
        description: 'Complete payments platform',
        category: 'Payments',
        popularity: 96,
        setupTime: '20 min',
        benefits: ['Global Payments', 'Subscriptions', 'Marketplace'],
        compatibility: 98,
        reason: 'Industry-standard payment processing'
      }
    ],
    'analytics': [
      {
        id: 'posthog',
        name: 'PostHog',
        description: 'Product analytics platform',
        category: 'Analytics',
        popularity: 78,
        setupTime: '8 min',
        benefits: ['Event Tracking', 'Feature Flags', 'Session Replay'],
        compatibility: 90,
        reason: 'All-in-one product analytics solution'
      }
    ]
  }

  // Analyze project context and generate recommendations
  useEffect(() => {
    if (!projectContext) return

    const analyzeProjectContext = () => {
      const context = projectContext.toLowerCase()
      const recommendations = []
      let score = 0

      // Detect project patterns and suggest relevant integrations
      const patterns = {
        'react': /react|jsx|component|hook/i,
        'authentication': /auth|login|user|session|jwt/i,
        'database': /database|db|model|query|crud/i,
        'styling': /css|style|design|ui|tailwind/i,
        'payments': /payment|stripe|checkout|billing/i,
        'analytics': /analytics|track|event|metrics/i
      }

      Object.entries(patterns).forEach(([category, pattern]) => {
        if (pattern.test(context)) {
          const categoryIntegrations = integrationDatabase[category] || []
          categoryIntegrations.forEach(integration => {
            const contextScore = calculateContextScore(context, integration)
            recommendations.push({
              ...integration,
              contextScore,
              matchReason: getMatchReason(context, integration, category)
            })
            score += contextScore
          })
        }
      })

      // Sort by context score and compatibility
      recommendations.sort((a, b) => 
        (b.contextScore * b.compatibility) - (a.contextScore * a.compatibility)
      )

      setRecommendations(recommendations.slice(0, 6))
      setIsVisible(recommendations.length > 0)

      // Set popular integrations
      const popular = Object.values(integrationDatabase)
        .flat()
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 4)
      setPopularIntegrations(popular)

      // Set one-click setup integrations
      const oneClick = recommendations.filter(r => 
        parseInt(r.setupTime) <= 10 && r.compatibility >= 95
      ).slice(0, 3)
      setOneClickSetups(oneClick)
    }

    const debounceTimer = setTimeout(analyzeProjectContext, 1000)
    return () => clearTimeout(debounceTimer)
  }, [projectContext])

  const calculateContextScore = (context, integration) => {
    let score = 0
    
    // Check if integration name or description matches context
    if (context.includes(integration.name.toLowerCase())) score += 30
    if (context.includes(integration.category.toLowerCase())) score += 25
    
    // Check benefits alignment
    integration.benefits.forEach(benefit => {
      if (context.includes(benefit.toLowerCase())) score += 15
    })
    
    // Base score from popularity and compatibility
    score += (integration.popularity / 10) + (integration.compatibility / 10)
    
    return score
  }

  const getMatchReason = (context, integration, category) => {
    const reasons = {
      'react': `Detected React patterns - ${integration.name} enhances React development`,
      'authentication': `Auth logic found - ${integration.name} provides secure authentication`,
      'database': `Database operations detected - ${integration.name} optimizes data management`,
      'styling': `UI styling needs - ${integration.name} accelerates design workflow`,
      'payments': `Payment features required - ${integration.name} handles transactions`,
      'analytics': `Analytics implementation - ${integration.name} tracks user behavior`
    }
    return reasons[category] || `${integration.name} is highly compatible with your project`
  }

  const installIntegration = async (integration) => {
    toast.loading(`Setting up ${integration.name}...`)
    
    try {
      // Simulate installation process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setInstalledIntegrations(prev => new Set([...prev, integration.id]))
      toast.dismiss()
      toast.success(`${integration.name} installed successfully!`)
      
      // Add to project context
      // This would typically call an API to add the integration
      console.log('Integration added to project:', integration)
      
    } catch (error) {
      toast.dismiss()
      toast.error(`Failed to install ${integration.name}`)
    }
  }

  const openIntegrationDocs = (integration) => {
    const urls = {
      'react-query': 'https://tanstack.com/query/latest',
      'framer-motion': 'https://www.framer.com/motion/',
      'auth0': 'https://auth0.com/docs',
      'clerk': 'https://clerk.com/docs',
      'prisma': 'https://www.prisma.io/docs',
      'supabase': 'https://supabase.com/docs',
      'tailwindcss': 'https://tailwindcss.com/docs',
      'stripe': 'https://stripe.com/docs',
      'posthog': 'https://posthog.com/docs'
    }
    
    const url = urls[integration.id] || `https://www.npmjs.com/package/${integration.id}`
    window.open(url, '_blank')
  }

  const getPopularityColor = (popularity) => {
    if (popularity >= 90) return 'text-green-600 dark:text-green-400'
    if (popularity >= 80) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Data Fetching': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      'Animation': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      'Authentication': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      'Database': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      'Backend as a Service': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
      'Styling': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
      'Payments': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      'Analytics': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'
    }
    return colors[category] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -300 }}
        className="fixed top-24 left-96 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg z-40 p-4 w-96 max-h-96 overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
              <PuzzlePieceIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                Smart Integrations
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                AI-powered recommendations
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          >
            <XMarkIcon className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* One-Click Setups */}
        {oneClickSetups.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-1">
              <BoltIcon className="w-4 h-4" />
              <span>Quick Setup ({oneClickSetups.length})</span>
            </h4>
            <div className="space-y-2">
              {oneClickSetups.map((integration) => (
                <motion.div
                  key={integration.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                          {integration.name}
                        </h5>
                        <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(integration.category)}`}>
                          {integration.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        {integration.description}
                      </p>
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-3 h-3 text-green-600" />
                          <span className="text-green-600 dark:text-green-400">{integration.setupTime}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <StarIcon className="w-3 h-3 text-yellow-500" />
                          <span className={getPopularityColor(integration.popularity)}>
                            {integration.popularity}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {integration.matchReason}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openIntegrationDocs(integration)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded transition-colors"
                      >
                        <ArrowTopRightOnSquareIcon className="w-3 h-3 inline" />
                      </button>
                      <button
                        onClick={() => installIntegration(integration)}
                        disabled={installedIntegrations.has(integration.id)}
                        className={`text-xs px-3 py-1 rounded transition-colors ${
                          installedIntegrations.has(integration.id)
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        {installedIntegrations.has(integration.id) ? (
                          <><CheckCircleIcon className="w-3 h-3 inline mr-1" />Installed</>
                        ) : (
                          'Quick Install'
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-1">
              <SparklesIcon className="w-4 h-4" />
              <span>AI Recommendations ({recommendations.length})</span>
            </h4>
            <div className="space-y-2">
              {recommendations.slice(0, 4).map((integration) => (
                <motion.div
                  key={integration.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                          {integration.name}
                        </h5>
                        <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(integration.category)}`}>
                          {integration.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {integration.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {integration.benefits.slice(0, 3).map((benefit) => (
                          <span
                            key={benefit}
                            className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center space-x-3 text-xs">
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-500 dark:text-gray-400">{integration.setupTime}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <StarIcon className="w-3 h-3 text-yellow-500" />
                          <span className={getPopularityColor(integration.popularity)}>
                            {integration.popularity}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircleIcon className="w-3 h-3 text-green-500" />
                          <span className="text-green-600 dark:text-green-400">
                            {integration.compatibility}% match
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center space-x-1">
                      <LightBulbIcon className="w-3 h-3" />
                      <span>{integration.reason}</span>
                    </p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openIntegrationDocs(integration)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded transition-colors"
                      >
                        Docs
                      </button>
                      <button
                        onClick={() => installIntegration(integration)}
                        disabled={installedIntegrations.has(integration.id)}
                        className={`text-xs px-3 py-1 rounded transition-colors ${
                          installedIntegrations.has(integration.id)
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        {installedIntegrations.has(integration.id) ? 'Installed' : 'Install'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Popular Integrations */}
        {popularIntegrations.length > 0 && (
          <div className="pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-1">
              <TagIcon className="w-4 h-4" />
              <span>Trending</span>
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {popularIntegrations.map((integration) => (
                <button
                  key={integration.id}
                  onClick={() => openIntegrationDocs(integration)}
                  className="p-2 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50 transition-colors text-left"
                >
                  <h6 className="font-medium text-gray-900 dark:text-white text-xs truncate">
                    {integration.name}
                  </h6>
                  <div className="flex items-center space-x-1 mt-1">
                    <StarIcon className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs text-gray-500">{integration.popularity}%</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default SmartIntegrationRecommendations