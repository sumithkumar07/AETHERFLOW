import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PuzzlePieceIcon,
  StarIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ClockIcon,
  FireIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TagIcon,
  UserGroupIcon,
  CodeBracketIcon,
  CpuChipIcon,
  ChartBarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import realTimeAPI from '../services/realTimeAPI'
import toast from 'react-hot-toast'

const AdvancedPluginMarketplace = ({ className = '' }) => {
  const [marketplace, setMarketplace] = useState({
    featured: [],
    categories: [],
    installed: [],
    available: [],
    trending: []
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popularity')
  const [installing, setInstalling] = useState(new Set())

  useEffect(() => {
    loadMarketplace()
  }, [])

  const loadMarketplace = async () => {
    try {
      setLoading(true)
      const data = await realTimeAPI.getPluginMarketplace()
      setMarketplace(data)
    } catch (error) {
      console.error('Failed to load plugin marketplace:', error)
      setMarketplace(getMockMarketplace())
    } finally {
      setLoading(false)
    }
  }

  const getMockMarketplace = () => ({
    featured: [
      {
        id: 'github-integration',
        name: 'GitHub Integration Pro',
        description: 'Complete GitHub integration with PR management, issue tracking, and automated workflows',
        author: 'Aether Team',
        category: 'integrations',
        icon: '🐙',
        version: '2.1.0',
        downloads: 50000,
        rating: 4.8,
        reviews: 1250,
        price: 'free',
        tags: ['git', 'github', 'pr', 'ci/cd'],
        features: ['Pull Request Management', 'Issue Tracking', 'Automated Workflows', 'Branch Protection'],
        screenshots: [],
        installed: true,
        verified: true
      },
      {
        id: 'ai-code-review',
        name: 'AI Code Review Assistant',
        description: 'Intelligent code review powered by advanced AI models with security scanning',
        author: 'AI Labs',
        category: 'ai-tools',
        icon: '🤖',
        version: '1.5.3',
        downloads: 35000,
        rating: 4.6,
        reviews: 890,
        price: 'premium',
        tags: ['ai', 'code-review', 'security', 'quality'],
        features: ['AI-Powered Review', 'Security Scanning', 'Performance Analysis', 'Best Practices'],
        screenshots: [],
        installed: false,
        verified: true
      },
      {
        id: 'slack-notifications',
        name: 'Smart Slack Notifications',
        description: 'Intelligent Slack integration with customizable alerts and team collaboration',
        author: 'Communication Co',
        category: 'integrations',
        icon: '💬',
        version: '3.0.1',
        downloads: 28000,
        rating: 4.5,
        reviews: 645,
        price: 'free',
        tags: ['slack', 'notifications', 'team', 'alerts'],
        features: ['Smart Filtering', 'Custom Templates', 'Team Mentions', 'Thread Management'],
        screenshots: [],
        installed: false,
        verified: true
      }
    ],
    categories: [
      { id: 'all', name: 'All Plugins', count: 156, icon: PuzzlePieceIcon },
      { id: 'integrations', name: 'Integrations', count: 45, icon: CodeBracketIcon },
      { id: 'ai-tools', name: 'AI Tools', count: 32, icon: CpuChipIcon },
      { id: 'development', name: 'Development', count: 28, icon: CodeBracketIcon },
      { id: 'analytics', name: 'Analytics', count: 19, icon: ChartBarIcon },
      { id: 'security', name: 'Security', count: 16, icon: ShieldCheckIcon },
      { id: 'productivity', name: 'Productivity', count: 16, icon: FireIcon }
    ],
    installed: ['github-integration'],
    trending: ['ai-code-review', 'smart-testing', 'auto-deploy'],
    available: 156
  })

  const installPlugin = async (plugin) => {
    if (installing.has(plugin.id)) return

    setInstalling(prev => new Set([...prev, plugin.id]))
    
    try {
      toast.loading(`Installing ${plugin.name}...`, { id: plugin.id })
      
      // Simulate installation process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update marketplace state
      setMarketplace(prev => ({
        ...prev,
        installed: [...prev.installed, plugin.id],
        featured: prev.featured.map(p => 
          p.id === plugin.id ? { ...p, installed: true } : p
        )
      }))
      
      toast.success(`${plugin.name} installed successfully!`, { id: plugin.id })
      
    } catch (error) {
      console.error('Plugin installation failed:', error)
      toast.error(`Failed to install ${plugin.name}`, { id: plugin.id })
    } finally {
      setInstalling(prev => {
        const newSet = new Set(prev)
        newSet.delete(plugin.id)
        return newSet
      })
    }
  }

  const uninstallPlugin = async (plugin) => {
    try {
      toast.loading(`Uninstalling ${plugin.name}...`, { id: plugin.id })
      
      // Simulate uninstallation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMarketplace(prev => ({
        ...prev,
        installed: prev.installed.filter(id => id !== plugin.id),
        featured: prev.featured.map(p => 
          p.id === plugin.id ? { ...p, installed: false } : p
        )
      }))
      
      toast.success(`${plugin.name} uninstalled successfully!`, { id: plugin.id })
      
    } catch (error) {
      console.error('Plugin uninstallation failed:', error)
      toast.error(`Failed to uninstall ${plugin.name}`, { id: plugin.id })
    }
  }

  const filteredPlugins = marketplace.featured.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plugin.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const sortedPlugins = [...filteredPlugins].sort((a, b) => {
    switch (sortBy) {
      case 'popularity':
        return b.downloads - a.downloads
      case 'rating':
        return b.rating - a.rating
      case 'recent':
        return new Date(b.updated || 0) - new Date(a.updated || 0)
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  const PluginCard = ({ plugin }) => {
    const isInstalling = installing.has(plugin.id)
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-lg transition-all duration-300 group"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
              {plugin.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {plugin.name}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <span>by {plugin.author}</span>
                {plugin.verified && (
                  <CheckCircleIcon className="w-4 h-4 text-blue-500" title="Verified Publisher" />
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {plugin.rating}
            </span>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {plugin.description}
        </p>

        {/* Plugin Stats */}
        <div className="flex items-center justify-between mb-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <DownloadIcon className="w-3 h-3" />
            <span>{plugin.downloads.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <UserGroupIcon className="w-3 h-3" />
            <span>{plugin.reviews} reviews</span>
          </div>
          <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
            v{plugin.version}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {plugin.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-lg"
            >
              {tag}
            </span>
          ))}
          {plugin.tags.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +{plugin.tags.length - 3} more
            </span>
          )}
        </div>

        {/* Features */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Key Features</h4>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            {plugin.features.slice(0, 2).map((feature, index) => (
              <li key={index} className="flex items-center space-x-1">
                <div className="w-1 h-1 bg-blue-500 rounded-full" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between">
          <div className="text-sm">
            {plugin.price === 'free' ? (
              <span className="text-green-600 dark:text-green-400 font-medium">Free</span>
            ) : (
              <span className="text-blue-600 dark:text-blue-400 font-medium">Premium</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {plugin.installed ? (
              <button
                onClick={() => uninstallPlugin(plugin)}
                className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-medium rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                Uninstall
              </button>
            ) : (
              <button
                onClick={() => installPlugin(plugin)}
                disabled={isInstalling}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center space-x-1"
              >
                {isInstalling ? (
                  <>
                    <ClockIcon className="w-4 h-4 animate-spin" />
                    <span>Installing...</span>
                  </>
                ) : (
                  <>
                    <DownloadIcon className="w-4 h-4" />
                    <span>Install</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  const CategoryFilter = () => (
    <div className="flex flex-wrap gap-2 mb-6">
      {marketplace.categories.map(category => {
        const Icon = category.icon
        return (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{category.name}</span>
            <span className="text-xs opacity-75">({category.count})</span>
          </button>
        )
      })}
    </div>
  )

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading marketplace...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Plugin Marketplace</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Extend Aether AI with powerful plugins and integrations
          </p>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <PuzzlePieceIcon className="w-4 h-4" />
          <span>{marketplace.available} plugins available</span>
          <span>•</span>
          <span>{marketplace.installed.length} installed</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search plugins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="popularity">Most Popular</option>
          <option value="rating">Highest Rated</option>
          <option value="recent">Recently Updated</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>

      {/* Category Filter */}
      <CategoryFilter />

      {/* Trending Section */}
      {marketplace.trending.length > 0 && selectedCategory === 'all' && !searchQuery && (
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <FireIcon className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Trending Now</h3>
          </div>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {marketplace.trending.map(pluginId => {
              const plugin = marketplace.featured.find(p => p.id === pluginId)
              if (!plugin) return null
              
              return (
                <div key={plugin.id} className="flex-shrink-0 w-64">
                  <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{plugin.icon}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{plugin.name}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {plugin.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Plugin Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {sortedPlugins.map(plugin => (
            <PluginCard key={plugin.id} plugin={plugin} />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {sortedPlugins.length === 0 && (
        <div className="text-center py-12">
          <PuzzlePieceIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
            No plugins found
          </h3>
          <p className="text-gray-500 dark:text-gray-500">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  )
}

export default AdvancedPluginMarketplace