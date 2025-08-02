import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  UserGroupIcon,
  CodeBracketIcon,
  SparklesIcon,
  PlusIcon,
  HeartIcon,
  DownloadIcon,
  TagIcon,
  CheckBadgeIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import SEOHead from '../components/SEOHead'
import LoadingStates from '../components/LoadingStates'

const AgentMarketplace = () => {
  const [agents, setAgents] = useState([])
  const [featuredAgents, setFeaturedAgents] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('rating')
  const [favorites, setFavorites] = useState(new Set())

  useEffect(() => {
    fetchMarketplaceData()
  }, [selectedCategory, sortBy, searchQuery])

  const fetchMarketplaceData = async () => {
    setLoading(true)
    try {
      // Fetch agents
      const agentsResponse = await fetch(
        `/api/agent-marketplace/agents?${new URLSearchParams({
          ...(selectedCategory !== 'all' && { category: selectedCategory }),
          ...(searchQuery && { search: searchQuery }),
          sort_by: sortBy,
          sort_order: 'desc',
          limit: '20'
        })}`
      )
      
      if (agentsResponse.ok) {
        const agentsData = await agentsResponse.json()
        setAgents(agentsData)
      }

      // Fetch featured agents
      const featuredResponse = await fetch('/api/agent-marketplace/featured')
      if (featuredResponse.ok) {
        const featuredData = await featuredResponse.json()
        setFeaturedAgents(featuredData)
      }

      // Fetch categories
      const categoriesResponse = await fetch('/api/agent-marketplace/categories')
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData.categories)
      }

    } catch (error) {
      console.error('Failed to fetch marketplace data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = (agentId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(agentId)) {
        newFavorites.delete(agentId)
      } else {
        newFavorites.add(agentId)
      }
      return newFavorites
    })
  }

  const getCategoryIcon = (category) => {
    const icons = {
      development: CodeBracketIcon,
      design: SparklesIcon,
      testing: CheckBadgeIcon,
      marketing: UserGroupIcon,
      analytics: TrophyIcon
    }
    return icons[category] || CodeBracketIcon
  }

  const renderAgentCard = (agent, featured = false) => {
    const CategoryIcon = getCategoryIcon(agent.category)
    
    return (
      <motion.div
        key={agent.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, scale: 1.02 }}
        className={`group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 overflow-hidden ${
          featured ? 'ring-2 ring-yellow-400 bg-gradient-to-br from-yellow-50 via-white to-purple-50 dark:from-yellow-900/20 dark:via-gray-800 dark:to-purple-900/20' : ''
        }`}
      >
        {/* Featured Badge */}
        {featured && (
          <div className="absolute top-3 right-3 z-10">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <TrophyIcon className="w-3 h-3 mr-1" />
              Featured
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Agent Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                featured 
                  ? 'from-yellow-400 to-orange-500' 
                  : 'from-blue-500 to-purple-600'
              } p-3 group-hover:scale-110 transition-transform`}>
                <CategoryIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {agent.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  by {agent.creator_name}
                  {agent.is_verified && (
                    <CheckBadgeIcon className="w-4 h-4 ml-1 text-blue-500" />
                  )}
                </p>
              </div>
            </div>
            
            {/* Favorite Button */}
            <button
              onClick={() => toggleFavorite(agent.id)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {favorites.has(agent.id) ? (
                <HeartIconSolid className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">
            {agent.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {agent.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium"
              >
                {tag}
              </span>
            ))}
            {agent.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                +{agent.tags.length - 3}
              </span>
            )}
          </div>

          {/* Capabilities */}
          <div className="mb-4">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Key Capabilities:
            </div>
            <div className="space-y-1">
              {agent.capabilities.slice(0, 2).map((capability, index) => (
                <div key={index} className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                  <div className="w-1 h-1 bg-blue-500 rounded-full mr-2"></div>
                  {capability.name}
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <StarIconSolid className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="font-medium">{agent.rating}</span>
              </div>
              <div className="flex items-center">
                <DownloadIcon className="w-4 h-4 mr-1" />
                <span>{agent.usage_count.toLocaleString()}</span>
              </div>
            </div>
            <div className="text-right">
              {agent.price > 0 ? (
                <span className="font-bold text-green-600 dark:text-green-400">
                  ${agent.price}/month
                </span>
              ) : (
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  Free
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <button className="flex-1 btn-primary text-sm py-2 px-4">
              Use Agent
            </button>
            <button className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Preview
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  if (loading) {
    return <LoadingStates.FullScreen message="Loading Agent Marketplace..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      <SEOHead
        title="Agent Marketplace"
        description="Discover and use powerful AI agents created by the community. From development tools to design assistants, find the perfect AI agent for your workflow."
        keywords={['AI agents', 'marketplace', 'custom agents', 'AI tools', 'development agents']}
      />

      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Agent Marketplace
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Discover powerful AI agents created by our community. From specialized developers to creative designers, find the perfect AI assistant for any task.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="rating">Highest Rated</option>
              <option value="usage">Most Popular</option>
              <option value="created">Newest</option>
              <option value="name">Name A-Z</option>
            </select>

            {/* Create Agent Button */}
            <button className="btn-primary flex items-center space-x-2 px-6 py-3">
              <PlusIcon className="w-5 h-5" />
              <span>Create Agent</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Agents */}
        {featuredAgents.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <TrophyIcon className="w-6 h-6 mr-2 text-yellow-500" />
                Featured Agents
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {featuredAgents.length} featured
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredAgents.slice(0, 6).map(agent => renderAgentCard(agent, true))}
            </div>
          </section>
        )}

        {/* All Agents */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {searchQuery ? `Search Results for "${searchQuery}"` : 'All Agents'}
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {agents.length} agents found
            </span>
          </div>

          {agents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {agents.map(agent => renderAgentCard(agent))}
            </div>
          ) : (
            <div className="text-center py-12">
              <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                No agents found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchQuery 
                  ? 'Try adjusting your search terms or filters.'
                  : 'Be the first to create an agent for this category!'}
              </p>
              <button className="btn-primary">
                Create Your First Agent
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default AgentMarketplace