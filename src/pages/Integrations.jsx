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
  BeakerIcon,
  AdjustmentsHorizontalIcon
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

  // Fallback integration data
  const fallbackIntegrations = [
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Accept payments online with comprehensive payment processing',
      category: 'Payments',
      status: 'available',
      rating: 4.9,
      users: '12K+',
      setup_time: '5 min',
      logo: '💳',
      features: ['Payment Processing', 'Subscription Management', 'Fraud Protection'],
      pricing: 'Free setup, 2.9% per transaction'
    },
    {
      id: 'sendgrid',
      name: 'SendGrid',
      description: 'Reliable email delivery service for transactional and marketing emails',
      category: 'Email',
      status: 'connected',
      rating: 4.7,
      users: '8K+',
      setup_time: '3 min',
      logo: '📧',
      features: ['Email API', 'Analytics', 'Templates'],
      pricing: 'Free up to 100 emails/day'
    },
    {
      id: 'mongodb',
      name: 'MongoDB Atlas',
      description: 'Cloud-native document database service',
      category: 'Database',
      status: 'connected',
      rating: 4.8,
      users: '15K+',
      setup_time: '2 min',
      logo: '🍃',
      features: ['Document Storage', 'Auto-scaling', 'Security'],
      pricing: 'Free tier available'
    },
    {
      id: 'auth0',
      name: 'Auth0',
      description: 'Identity platform for developers and enterprises',
      category: 'Authentication',
      status: 'available',
      rating: 4.6,
      users: '6K+',
      setup_time: '10 min',
      logo: '🔐',
      features: ['Single Sign-On', 'Multi-factor Auth', 'Social Login'],
      pricing: 'Free up to 7,000 active users'
    },
    {
      id: 'vercel',
      name: 'Vercel',
      description: 'Frontend deployment platform with edge network',
      category: 'Deployment',
      status: 'available',
      rating: 4.8,
      users: '20K+',
      setup_time: '2 min',
      logo: '▲',
      features: ['Instant Deployment', 'Edge Network', 'Analytics'],
      pricing: 'Free for personal projects'
    },
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'Access GPT models and AI capabilities',
      category: 'AI',
      status: 'available',
      rating: 4.9,
      users: '25K+',
      setup_time: '5 min',
      logo: '🤖',
      features: ['GPT Models', 'Embeddings', 'Fine-tuning'],
      pricing: 'Pay per usage'
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Version control and collaboration platform',
      category: 'Development',
      status: 'connected',
      rating: 4.7,
      users: '18K+',
      setup_time: '3 min',
      logo: '🐙',
      features: ['Version Control', 'CI/CD', 'Issue Tracking'],
      pricing: 'Free for public repositories'
    },
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      description: 'Web analytics and tracking service',
      category: 'Analytics',
      status: 'available',
      rating: 4.5,
      users: '30K+',
      setup_time: '5 min',
      logo: '📊',
      features: ['User Tracking', 'Conversion Analytics', 'Real-time Data'],
      pricing: 'Free with premium options'
    }
  ]

  useEffect(() => {
    fetchIntegrations()
  }, [])

  const fetchIntegrations = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/integrations')
      setIntegrations(response.data.integrations || [])
    } catch (error) {
      console.log('Using fallback integrations data')
      setIntegrations(fallbackIntegrations)
      // Don't show error toast as fallback data is intentional
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { id: 'all', name: 'All Integrations', icon: LinkIcon, count: integrations.length },
    { id: 'Payments', name: 'Payments & Commerce', icon: CreditCardIcon, count: integrations.filter(i => i.category === 'Payments').length },
    { id: 'Email', name: 'Communication', icon: EnvelopeIcon, count: integrations.filter(i => i.category === 'Email').length },
    { id: 'Database', name: 'Databases', icon: CircleStackIcon, count: integrations.filter(i => i.category === 'Database').length },
    { id: 'Authentication', name: 'Authentication', icon: ShieldCheckIcon, count: integrations.filter(i => i.category === 'Authentication').length },
    { id: 'Deployment', name: 'Deployment', icon: CloudIcon, count: integrations.filter(i => i.category === 'Deployment').length },
    { id: 'AI', name: 'AI & ML', icon: BeakerIcon, count: integrations.filter(i => i.category === 'AI').length },
    { id: 'Development', name: 'Development', icon: LinkIcon, count: integrations.filter(i => i.category === 'Development').length },
    { id: 'Analytics', name: 'Analytics', icon: ChartBarIcon, count: integrations.filter(i => i.category === 'Analytics').length }
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
        return parseInt(b.users?.replace(/\D/g, '') || 0) - parseInt(a.users?.replace(/\D/g, '') || 0)
      case 'rating':
        return (b.rating || 0) - (a.rating || 0)
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  const handleConnect = async (integration) => {
    try {
      // Mock connection process
      toast.loading(`Connecting to ${integration.name}...`)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update integration status
      setIntegrations(prev => prev.map(item => 
        item.id === integration.id 
          ? { ...item, status: 'connected' }
          : item
      ))
      
      toast.dismiss()
      toast.success(`${integration.name} connected successfully!`)
    } catch (error) {
      toast.dismiss()
      toast.error(`Failed to connect to ${integration.name}`)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'available':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'configuring':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  if (loading) {
    return <LoadingStates.FullScreen message="Loading integrations..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mb-6"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <LinkIcon className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Integration Marketplace
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
            >
              Connect your favorite tools and services to supercharge your development workflow.
              Set up integrations in minutes, not hours.
            </motion.p>
          </div>

          {/* Search and Filters */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col lg:flex-row gap-4 items-center justify-between"
          >
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search integrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300/50 dark:border-gray-600/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-900 dark:text-white"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Categories Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:w-80 flex-shrink-0"
          >
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Categories
              </h3>
              <div className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-left transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <span className="text-sm bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                        {category.count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>

          {/* Integrations Grid */}
          <div className="flex-1">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-6 flex items-center justify-between"
            >
              <p className="text-gray-600 dark:text-gray-400">
                {sortedIntegrations.length} integration{sortedIntegrations.length !== 1 ? 's' : ''} found
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {sortedIntegrations.map((integration, index) => (
                <motion.div
                  key={integration.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{integration.logo}</div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {integration.name}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                            <span>{integration.rating}</span>
                            <span>•</span>
                            <span>{integration.users} users</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                        {integration.status === 'connected' ? 'Connected' : 'Available'}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {integration.description}
                    </p>

                    {/* Features */}
                    <div className="mb-4">
                      <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Key Features:</h4>
                      <div className="flex flex-wrap gap-1">
                        {integration.features?.slice(0, 3).map((feature) => (
                          <span
                            key={feature}
                            className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="w-3 h-3" />
                        <span>{integration.setup_time} setup</span>
                      </div>
                      <span className="font-medium">{integration.pricing}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {integration.status === 'connected' ? (
                        <button className="flex-1 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 font-medium py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 cursor-default">
                          <CheckCircleIcon className="w-4 h-4" />
                          <span>Connected</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleConnect(integration)}
                          className="flex-1 btn-primary text-sm py-2.5 flex items-center justify-center space-x-2"
                        >
                          <PlusCircleIcon className="w-4 h-4" />
                          <span>Connect</span>
                        </button>
                      )}
                      <button className="p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <LinkIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Empty State */}
            {sortedIntegrations.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No integrations found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('all')
                  }}
                  className="btn-secondary"
                >
                  Clear Filters
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Integrations