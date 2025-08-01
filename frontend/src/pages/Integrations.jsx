import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LinkIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  EnvelopeIcon,
  CloudIcon,
  CircleStackIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  Cog6ToothIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const Integrations = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [installedIntegrations, setInstalledIntegrations] = useState(['stripe', 'mongodb', 'puter-ai'])

  const categories = [
    { id: 'all', name: 'All Integrations', icon: LinkIcon, count: 25 },
    { id: 'payments', name: 'Payments & Commerce', icon: CreditCardIcon, count: 4 },
    { id: 'auth', name: 'Authentication', icon: ShieldCheckIcon, count: 5 },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon, count: 4 },
    { id: 'communication', name: 'Communication', icon: EnvelopeIcon, count: 3 },
    { id: 'infrastructure', name: 'Infrastructure', icon: CloudIcon, count: 5 },
    { id: 'databases', name: 'Databases', icon: CircleStackIcon, count: 3 },
    { id: 'ai', name: 'AI Services', icon: SparklesIcon, count: 1 }
  ]

  const integrations = [
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Accept payments online and in person with Stripe\'s powerful payment processing platform.',
      category: 'payments',
      logo: '💳',
      provider: 'Stripe, Inc.',
      pricing: 'Free to start',
      features: ['Payment Processing', 'Subscription Billing', 'Fraud Prevention', 'Global Payments'],
      difficulty: 'Beginner',
      setupTime: '5-10 min',
      documentation: 'https://stripe.com/docs',
      status: 'connected',
      healthStatus: 'healthy',
      lastUsed: '2024-01-15'
    },
    {
      id: 'auth0',
      name: 'Auth0',
      description: 'Universal authentication & authorization platform for web, mobile and legacy applications.',
      category: 'auth',
      logo: '🔐',
      provider: 'Auth0, Inc.',
      pricing: 'Free up to 7,000 users',
      features: ['Single Sign-On', 'Multi-factor Auth', 'Social Login', 'User Management'],
      difficulty: 'Intermediate',
      setupTime: '10-15 min',
      documentation: 'https://auth0.com/docs',
      status: 'available',
      healthStatus: null,
      lastUsed: null
    },
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      description: 'Understand your customers across devices and platforms with advanced analytics.',
      category: 'analytics',
      logo: '📊',
      provider: 'Google',
      pricing: 'Free',
      features: ['Traffic Analysis', 'User Behavior', 'Conversion Tracking', 'Real-time Data'],
      difficulty: 'Beginner',
      setupTime: '5 min',
      documentation: 'https://developers.google.com/analytics',
      status: 'available',
      healthStatus: null,
      lastUsed: null
    },
    {
      id: 'sendgrid',
      name: 'SendGrid',
      description: 'Deliver your transactional and marketing emails through one reliable platform.',
      category: 'communication',
      logo: '📧',
      provider: 'Twilio SendGrid',
      pricing: 'Free up to 100 emails/day',
      features: ['Email Delivery', 'Templates', 'Analytics', 'A/B Testing'],
      difficulty: 'Beginner',
      setupTime: '5-10 min',
      documentation: 'https://docs.sendgrid.com',
      status: 'available',
      healthStatus: null,
      lastUsed: null
    },
    {
      id: 'aws-s3',
      name: 'AWS S3',
      description: 'Scalable object storage service for backup, data archiving, and analytics.',
      category: 'infrastructure',
      logo: '☁️',
      provider: 'Amazon Web Services',
      pricing: 'Pay as you go',
      features: ['Object Storage', 'Data Backup', 'Content Distribution', 'Security'],
      difficulty: 'Intermediate',
      setupTime: '15-20 min',
      documentation: 'https://docs.aws.amazon.com/s3',
      status: 'available',
      healthStatus: null,
      lastUsed: null
    },
    {
      id: 'mongodb',
      name: 'MongoDB Atlas',
      description: 'Global cloud database service for modern applications with automatic scaling.',
      category: 'databases',
      logo: '🍃',
      provider: 'MongoDB, Inc.',
      pricing: 'Free tier available',
      features: ['Document Database', 'Auto Scaling', 'Global Clusters', 'Built-in Security'],
      difficulty: 'Beginner',
      setupTime: '5-10 min',
      documentation: 'https://docs.mongodb.com',
      status: 'connected',
      healthStatus: 'healthy',
      lastUsed: '2024-01-15'
    },
    {
      id: 'puter-ai',
      name: 'Puter.js AI',
      description: 'Free AI service providing access to multiple language models without API keys.',
      category: 'ai',
      logo: '🤖',
      provider: 'Puter.js',
      pricing: 'Free',
      features: ['Multiple AI Models', 'No API Keys', 'Real-time Responses', 'Easy Integration'],
      difficulty: 'Beginner',
      setupTime: '2-5 min',
      documentation: 'https://puter.js.org/docs',
      status: 'connected',
      healthStatus: 'healthy',
      lastUsed: '2024-01-15'
    },
    {
      id: 'vercel',
      name: 'Vercel',
      description: 'Frontend cloud platform for static sites and serverless functions deployment.',
      category: 'infrastructure',
      logo: '▲',
      provider: 'Vercel, Inc.',
      pricing: 'Free tier available',
      features: ['Static Hosting', 'Serverless Functions', 'Edge Network', 'Git Integration'],
      difficulty: 'Beginner',
      setupTime: '5 min',
      documentation: 'https://vercel.com/docs',
      status: 'available',
      healthStatus: null,
      lastUsed: null
    }
  ]

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.features.some(feature => feature.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const handleConnect = async (integrationId) => {
    toast.success(`Connecting to ${integrations.find(i => i.id === integrationId)?.name}...`)
    // Simulate connection process
    setTimeout(() => {
      setInstalledIntegrations(prev => [...prev, integrationId])
      toast.success('Integration connected successfully!')
    }, 2000)
  }

  const handleDisconnect = async (integrationId) => {
    if (window.confirm('Are you sure you want to disconnect this integration?')) {
      setInstalledIntegrations(prev => prev.filter(id => id !== integrationId))
      toast.success('Integration disconnected')
    }
  }

  const handleConfigure = (integrationId) => {
    toast.info(`Opening configuration for ${integrations.find(i => i.id === integrationId)?.name}`)
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getStatusIcon = (status, healthStatus) => {
    if (status === 'connected') {
      if (healthStatus === 'healthy') {
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      } else {
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
      }
    }
    return null
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
              Integrations Marketplace
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
            >
              Connect your projects to powerful third-party services with one-click integrations. 
              Everything you need to build, deploy, and scale your applications.
            </motion.p>
          </div>

          {/* Search */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-md mx-auto"
          >
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
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
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 sticky top-8">
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
                        <span>{category.name}</span>
                      </div>
                      <span className="text-sm bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                        {category.count}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Connected Integrations Summary */}
              <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Connected ({installedIntegrations.length})
                </h4>
                <div className="space-y-2">
                  {installedIntegrations.map((integrationId) => {
                    const integration = integrations.find(i => i.id === integrationId)
                    if (!integration) return null
                    return (
                      <div key={integrationId} className="flex items-center space-x-2 text-sm">
                        <span className="text-lg">{integration.logo}</span>
                        <span className="text-gray-700 dark:text-gray-300">{integration.name}</span>
                        {getStatusIcon(integration.status, integration.healthStatus)}
                      </div>
                    )
                  })}
                </div>
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
                {filteredIntegrations.length} integration{filteredIntegrations.length !== 1 ? 's' : ''} available
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div 
                key={`${selectedCategory}-${searchQuery}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 xl:grid-cols-2 gap-6"
              >
                {filteredIntegrations.map((integration, index) => {
                  const isConnected = installedIntegrations.includes(integration.id)
                  return (
                    <motion.div
                      key={integration.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xl transition-all duration-300 p-6 group"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-3xl">{integration.logo}</div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {integration.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              by {integration.provider}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(integration.status, integration.healthStatus)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(integration.difficulty)}`}>
                            {integration.difficulty}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {integration.description}
                      </p>

                      {/* Features */}
                      <div className="mb-4">
                        <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Key Features:</h4>
                        <div className="flex flex-wrap gap-1">
                          {integration.features.slice(0, 3).map((feature) => (
                            <span
                              key={feature}
                              className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded"
                            >
                              {feature}
                            </span>
                          ))}
                          {integration.features.length > 3 && (
                            <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded">
                              +{integration.features.length - 3}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                        <div className="flex items-center space-x-3">
                          <span>Setup: {integration.setupTime}</span>
                          <span>{integration.pricing}</span>
                        </div>
                        {integration.lastUsed && (
                          <span>Last used: {integration.lastUsed}</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        {isConnected ? (
                          <>
                            <button
                              onClick={() => handleConfigure(integration.id)}
                              className="flex-1 btn-secondary text-sm py-2.5 flex items-center justify-center space-x-2"
                            >
                              <Cog6ToothIcon className="w-4 h-4" />
                              <span>Configure</span>
                            </button>
                            <button
                              onClick={() => handleDisconnect(integration.id)}
                              className="p-2.5 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleConnect(integration.id)}
                              className="flex-1 btn-primary text-sm py-2.5 flex items-center justify-center space-x-2"
                            >
                              <PlusIcon className="w-4 h-4" />
                              <span>Connect</span>
                            </button>
                            <a
                              href={integration.documentation}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              <EyeIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </a>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            </AnimatePresence>

            {/* Empty State */}
            {filteredIntegrations.length === 0 && (
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
                  Try adjusting your search or category filter.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
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