import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PuzzlePieceIcon, 
  StarIcon, 
  CloudArrowDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

const PluginMarketplace = ({ onInstallPlugin, installedPlugins = [] }) => {
  const [plugins, setPlugins] = useState([])
  const [loading, setLoading] = useState(true) 
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [installing, setInstalling] = useState({})

  const categories = [
    { id: 'all', name: 'All Plugins', count: 24 },
    { id: 'integration', name: 'Integrations', count: 8 },
    { id: 'workflow', name: 'Workflows', count: 6 },
    { id: 'ui_component', name: 'UI Components', count: 4 },
    { id: 'data_processor', name: 'Data Processing', count: 3 },
    { id: 'analytics', name: 'Analytics', count: 3 }
  ]

  const mockPlugins = [
    {
      id: 'stripe-integration',
      name: 'Stripe Payment Integration',
      description: 'Complete payment processing with webhooks, subscriptions, and invoice management',
      author: 'PaymentCorp',
      version: '2.1.4',
      rating: 4.8,
      downloads: 12500,
      category: 'integration',
      tags: ['payments', 'e-commerce', 'stripe'],
      icon: '💳',
      features: ['Payment Processing', 'Webhook Handling', 'Subscription Management'],
      price: 'Free',
      verified: true,
      lastUpdated: '2 days ago'
    },
    {
      id: 'slack-notifications',
      name: 'Slack Notifications',
      description: 'Send project updates, build notifications, and alerts directly to Slack channels',
      author: 'CommunicationTools',
      version: '1.5.2',
      rating: 4.6,
      downloads: 8900,
      category: 'workflow',
      tags: ['notifications', 'slack', 'communication'],
      icon: '📢',
      features: ['Channel Notifications', 'Custom Messages', 'Rich Formatting'],  
      price: 'Free',
      verified: true,
      lastUpdated: '1 week ago'
    },
    {
      id: 'analytics-dashboard',
      name: 'Advanced Analytics Dashboard',
      description: 'Comprehensive analytics with user behavior tracking, conversion funnels, and custom metrics',
      author: 'DataViz Pro',
      version: '3.0.1',
      rating: 4.9,
      downloads: 15600,
      category: 'analytics',
      tags: ['analytics', 'dashboard', 'metrics'],
      icon: '📊',
      features: ['Real-time Analytics', 'Custom Metrics', 'Export Reports'],
      price: '$19/month',
      verified: true,
      lastUpdated: '3 days ago'
    },
    {
      id: 'ai-code-review',
      name: 'AI Code Review Assistant',
      description: 'Automated code review with AI-powered suggestions for improvements and bug detection',
      author: 'DevTools AI',
      version: '1.2.0',
      rating: 4.7,
      downloads: 6700,
      category: 'workflow',
      tags: ['ai', 'code-review', 'automation'],
      icon: '🤖',
      features: ['Code Analysis', 'Bug Detection', 'Improvement Suggestions'],
      price: '$29/month',
      verified: false,
      lastUpdated: '5 days ago'
    },
    {
      id: 'database-backup',
      name: 'Automated Database Backup',
      description: 'Schedule automatic backups with encryption, compression, and cloud storage integration',
      author: 'BackupSolutions',
      version: '2.3.1',
      rating: 4.5,
      downloads: 4300,
      category: 'data_processor',
      tags: ['backup', 'database', 'automation'],
      icon: '💾',
      features: ['Scheduled Backups', 'Encryption', 'Cloud Storage'],
      price: '$15/month',
      verified: true,
      lastUpdated: '4 days ago'
    },
    {
      id: 'custom-theme-builder',
      name: 'Custom Theme Builder',
      description: 'Visual theme editor with real-time preview and custom CSS generation',
      author: 'DesignTools',
      version: '1.8.3',
      rating: 4.3,
      downloads: 3200,
      category: 'ui_component',
      tags: ['themes', 'ui', 'customization'],
      icon: '🎨',
      features: ['Visual Editor', 'Real-time Preview', 'CSS Export'],
      price: 'Free',
      verified: true,
      lastUpdated: '1 week ago'
    }
  ]

  useEffect(() => {
    loadPlugins()
  }, [])

  const loadPlugins = async () => {
    try {
      // Try to load from API first
      const response = await pluginAPI.getMarketplace()
      
      if (response.data.success) {
        setPlugins(response.data.plugins)
      } else {
        // Fallback to mock data
        await new Promise(resolve => setTimeout(resolve, 1000))
        setPlugins(mockPlugins)
      }
      setLoading(false)
    } catch (error) {
      console.error('Failed to load plugins:', error)
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPlugins(mockPlugins)
      setLoading(false)
    }
  }

  const handleInstallPlugin = async (plugin) => {
    setInstalling(prev => ({ ...prev, [plugin.id]: true }))
    
    try {
      // Simulate installation
      await new Promise(resolve => setTimeout(resolve, 2000))
      onInstallPlugin(plugin)
    } catch (error) {
      console.error('Failed to install plugin:', error)
    } finally {
      setInstalling(prev => ({ ...prev, [plugin.id]: false }))
    }
  }

  const filteredPlugins = plugins.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory
    
    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.downloads - a.downloads
      case 'rating':
        return b.rating - a.rating
      case 'recent':
        return new Date(b.lastUpdated) - new Date(a.lastUpdated)
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span key={index}>
        {index < Math.floor(rating) ? (
          <StarSolidIcon className="w-4 h-4 text-yellow-400" />
        ) : (
          <StarIcon className="w-4 h-4 text-gray-300" />
        )}
      </span>
    ))
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border p-6">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>  
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Plugin Marketplace</h2>
          <p className="text-gray-600">Extend your platform with powerful integrations</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <PuzzlePieceIcon className="w-5 h-5" />
          <span>{installedPlugins.length} plugins installed</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search plugins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name} ({category.count})
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="popular">Most Popular</option>
          <option value="rating">Highest Rated</option>
          <option value="recent">Recently Updated</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>

      {/* Plugin Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredPlugins.map((plugin) => {
            const isInstalled = installedPlugins.includes(plugin.id)
            const isInstalling = installing[plugin.id]

            return (
              <motion.div
                key={plugin.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  {/* Plugin Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{plugin.icon}</div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">{plugin.name}</h3>
                          {plugin.verified && (
                            <CheckCircleIcon className="w-5 h-5 text-blue-500" title="Verified Plugin" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500">by {plugin.author}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{plugin.price}</div>
                      <div className="text-xs text-gray-500">v{plugin.version}</div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {plugin.description}
                  </p>

                  {/* Rating and Downloads */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      <div className="flex">
                        {renderStars(plugin.rating)}
                      </div>
                      <span className="text-sm text-gray-600 ml-1">
                        {plugin.rating} ({plugin.downloads.toLocaleString()})
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Updated {plugin.lastUpdated}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {plugin.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Features */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Key Features</h4>
                    <ul className="space-y-1">
                      {plugin.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Install Button */}
                  <button
                    onClick={() => handleInstallPlugin(plugin)}
                    disabled={isInstalled || isInstalling}
                    className={`
                      w-full px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2
                      ${isInstalled 
                        ? 'bg-green-100 text-green-700 cursor-not-allowed' 
                        : isInstalling
                        ? 'bg-blue-100 text-blue-700 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                      }
                    `}
                  >
                    {isInstalled ? (
                      <>
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>Installed</span>
                      </>
                    ) : isInstalling ? (
                      <>
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Installing...</span>
                      </>
                    ) : (
                      <>
                        <CloudArrowDownIcon className="w-4 h-4" />
                        <span>Install Plugin</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* No Results */}
      {filteredPlugins.length === 0 && (
        <div className="text-center py-12">
          <PuzzlePieceIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No plugins found</h3>
          <p className="text-gray-600">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  )
}

export default PluginMarketplace