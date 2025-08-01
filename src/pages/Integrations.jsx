import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusCircleIcon,
  LinkIcon,
  CreditCardIcon,
  EnvelopeIcon,
  CircleStackIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CloudIcon,
  BeakerIcon
} from '@heroicons/react/24/outline'
import LoadingStates from '../components/LoadingStates'
import toast from 'react-hot-toast'
import axios from 'axios'

const Integrations = () => {
  const [integrations, setIntegrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popular')

  useEffect(() => {
    fetchIntegrations()
  }, [])

  const fetchIntegrations = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/integrations')
      setIntegrations(response.data)
    } catch (error) {
      toast.error('Failed to fetch integrations')
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { id: 'all', name: 'All Integrations', icon: LinkIcon, count: integrations.length },
    { id: 'Payments', name: 'Payments & Commerce', icon: CreditCardIcon, count: integrations.filter(i => i.category === 'Payments').length },
    { id: 'Email', name: 'Communication', icon: EnvelopeIcon, count: integrations.filter(i => i.category === 'Email').length },
    { id: 'Database', name: 'Databases', icon: CircleStackIcon, count: integrations.filter(i => i.category === 'Database').length },
    { id: 'Security', name: 'Authentication & Security', icon: ShieldCheckIcon, count: integrations.filter(i => i.category === 'Security').length },
    { id: 'Analytics', name: 'Analytics & Monitoring', icon: ChartBarIcon, count: integrations.filter(i => i.category === 'Analytics').length },
    { id: 'Cloud', name: 'Infrastructure', icon: CloudIcon, count: integrations.filter(i => i.category === 'Cloud').length },
    { id: 'AI', name: 'AI Services', icon: BeakerIcon, count: integrations.filter(i => i.category === 'AI').length }
  ]

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedIntegrations = [...filteredIntegrations].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.installs - a.installs
      case 'rating':
        return b.rating - a.rating
      case 'name':
        return a.name.localeCompare(b.name)
      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at)
      default:
        return 0
    }
  })

  const handleInstallIntegration = async (integration) => {
    try {
      toast.success(`${integration.name} integration configured successfully!`)
    } catch (error) {
      toast.error('Failed to install integration')
    }
  }

  if (loading) {
    return <LoadingStates.FullScreen message="Loading integrations..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <LinkIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Integration Marketplace
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Connect your applications with powerful third-party services. 
            One-click integrations with comprehensive configuration management.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:w-80">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card sticky top-24"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Categories</h2>
              
              <div className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedCategory === category.id
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5" />
                        <span>{category.name}</span>
                      </div>
                      <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Quick Stats */}
              <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Integration Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Available</span>
                    <span className="font-medium text-gray-900 dark:text-white">{integrations.length}+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Free Integrations</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {integrations.filter(i => i.pricing?.includes('Free')).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Avg. Setup Time</span>
                    <span className="font-medium text-gray-900 dark:text-white">< 15 min</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Filter Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card mb-8"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search integrations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <FunnelIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="pl-10 pr-8 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    >
                      <option value="popular">Most Popular</option>
                      <option value="rating">Highest Rated</option>
                      <option value="name">Name (A-Z)</option>
                      <option value="newest">Newest</option>
                    </select>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {sortedIntegrations.length} integrations
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Integrations Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {sortedIntegrations.map((integration, index) => (
                <motion.div
                  key={integration.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (index % 6) }}
                  className="card hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  onClick={() => handleInstallIntegration(integration)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl flex items-center justify-center text-2xl">
                        {integration.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {integration.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {integration.provider}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {integration.rating}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {integration.description}
                  </p>

                  {/* Features */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1 mb-3">
                      {integration.features?.slice(0, 3).map((feature, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded"
                        >
                          {feature}
                        </span>
                      ))}
                      {integration.features?.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded">
                          +{integration.features.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>{integration.setup_complexity} setup</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>{integration.installs?.toLocaleString()} installs</span>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="mb-4">
                    <div className="text-sm font-medium text-green-600 dark:text-green-400">
                      {integration.pricing}
                    </div>
                  </div>

                  {/* Action Button */}
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 group-hover:scale-[1.02]">
                    <PlusCircleIcon className="w-4 h-4" />
                    <span>Install Integration</span>
                  </button>
                </motion.div>
              ))}
            </motion.div>

            {/* Empty State */}
            {sortedIntegrations.length === 0 && (
              <div className="text-center py-12">
                <LinkIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  No integrations found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Integrations