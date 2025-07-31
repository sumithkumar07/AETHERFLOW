import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CubeTransparentIcon,
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  LinkIcon,
  ShieldCheckIcon,
  BoltIcon,
  CloudIcon,
  CreditCardIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const Integrations = () => {
  const { isAuthenticated } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [userIntegrations, setUserIntegrations] = useState([])
  const [loading, setLoading] = useState(false)

  const categories = [
    { id: 'all', name: 'All Categories', icon: CubeTransparentIcon },
    { id: 'ai', name: 'AI & ML', icon: BoltIcon },
    { id: 'database', name: 'Databases', icon: CloudIcon },
    { id: 'payment', name: 'Payments', icon: CreditCardIcon },
    { id: 'communication', name: 'Communication', icon: ChatBubbleLeftRightIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'auth', name: 'Authentication', icon: ShieldCheckIcon }
  ]

  const availableIntegrations = [
    {
      id: 'stripe',
      name: 'Stripe',
      category: 'payment',
      description: 'Accept payments online with Stripe\'s powerful payment platform',
      logo: '💳',
      status: 'available',
      popularity: 4.9,
      setupTime: '5 minutes',
      features: ['Credit Cards', 'Subscriptions', 'Webhooks', 'International'],
      pricing: 'Free (2.9% + 30¢ per transaction)'
    },
    {
      id: 'openai',
      name: 'OpenAI',
      category: 'ai',
      description: 'Integrate GPT models for natural language processing and generation',
      logo: '🤖',
      status: 'available',
      popularity: 4.8,
      setupTime: '2 minutes',
      features: ['GPT-4', 'Text Generation', 'Code Completion', 'Embeddings'],
      pricing: 'Pay per token'
    },
    {
      id: 'mongodb',
      name: 'MongoDB Atlas',
      category: 'database',
      description: 'Cloud-hosted MongoDB database with global clusters',
      logo: '🍃',
      status: 'configured',
      popularity: 4.7,
      setupTime: '10 minutes',
      features: ['Global Clusters', 'Auto-scaling', 'Security', 'Analytics'],
      pricing: 'Free tier available'
    },
    {
      id: 'auth0',
      name: 'Auth0',
      category: 'auth',
      description: 'Complete authentication and authorization platform',
      logo: '🔐',
      status: 'available',
      popularity: 4.6,
      setupTime: '15 minutes',
      features: ['Social Login', 'Multi-factor Auth', 'SSO', 'User Management'],
      pricing: 'Free up to 7,000 users'
    },
    {
      id: 'sendgrid',
      name: 'SendGrid',
      category: 'communication',
      description: 'Email delivery service for transactional and marketing emails',
      logo: '📧',
      status: 'available',
      popularity: 4.5,
      setupTime: '8 minutes',
      features: ['Transactional Email', 'Marketing Campaigns', 'Analytics', 'Templates'],
      pricing: 'Free up to 100 emails/day'
    },
    {
      id: 'twilio',
      name: 'Twilio',
      category: 'communication',
      description: 'SMS, voice, and video communication APIs',
      logo: '📱',
      status: 'available',
      popularity: 4.4,
      setupTime: '12 minutes',
      features: ['SMS', 'Voice Calls', 'Video', 'Programmable Chat'],
      pricing: 'Pay as you go'
    },
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      category: 'analytics',
      description: 'Web analytics service for tracking user behavior',
      logo: '📊',
      status: 'available',
      popularity: 4.8,
      setupTime: '5 minutes',
      features: ['User Tracking', 'Conversion Tracking', 'Custom Events', 'Real-time Data'],
      pricing: 'Free'
    },
    {
      id: 'slack',
      name: 'Slack',
      category: 'communication',
      description: 'Team communication and collaboration platform',
      logo: '💬',
      status: 'available',
      popularity: 4.6,
      setupTime: '7 minutes',
      features: ['Channels', 'Direct Messages', 'File Sharing', 'App Integrations'],
      pricing: 'Free tier available'
    }
  ]

  const filteredIntegrations = availableIntegrations.filter(integration => {
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getStatusConfig = (status) => {
    switch (status) {
      case 'configured':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'Configured' }
      case 'connecting':
        return { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, text: 'Connecting' }
      case 'error':
        return { color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon, text: 'Error' }
      default:
        return { color: 'bg-blue-100 text-blue-800', icon: LinkIcon, text: 'Available' }
    }
  }

  const handleIntegrationSetup = async (integration) => {
    if (!isAuthenticated) {
      toast.error('Please login to configure integrations')
      return
    }

    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setUserIntegrations(prev => [...prev, integration.id])
      toast.success(`${integration.name} integration configured successfully!`)
    } catch (error) {
      toast.error(`Failed to configure ${integration.name}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveIntegration = async (integrationId) => {
    if (window.confirm('Are you sure you want to remove this integration?')) {
      setUserIntegrations(prev => prev.filter(id => id !== integrationId))
      toast.success('Integration removed successfully')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <CubeTransparentIcon className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Unlock Powerful Integrations</h2>
          <p className="text-gray-600 mb-6">
            Connect your applications with hundreds of services and APIs to supercharge your development workflow.
          </p>
          <div className="space-y-3">
            <a href="/login" className="btn-primary block">
              Sign In to Get Started
            </a>
            <a href="/signup" className="btn-secondary block">
              Create Free Account
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Service Integrations
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connect your applications with powerful third-party services. 
              One-click setup with automatic configuration and monitoring.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 lg:max-w-md">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 whitespace-nowrap">Filter by:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Pills */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map(category => {
            const Icon = category.icon
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary-100 text-primary-700 border border-primary-200'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{category.name}</span>
              </button>
            )
          })}
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((integration) => {
            const statusConfig = getStatusConfig(integration.status)
            const StatusIcon = statusConfig.icon
            const isConfigured = userIntegrations.includes(integration.id) || integration.status === 'configured'

            return (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group"
              >
                {/* Integration Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{integration.logo}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {integration.name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.text}
                          </span>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <span>⭐ {integration.popularity}</span>
                            <span>•</span>
                            <span>⏱️ {integration.setupTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {integration.description}
                  </p>

                  {/* Features */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {integration.features.slice(0, 3).map((feature) => (
                        <span
                          key={feature}
                          className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {feature}
                        </span>
                      ))}
                      {integration.features.length > 3 && (
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{integration.features.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="mb-4 text-xs text-gray-500">
                    <span className="font-medium">Pricing:</span> {integration.pricing}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    {isConfigured ? (
                      <>
                        <button
                          className="flex-1 bg-green-50 text-green-700 border border-green-200 font-medium py-2 px-4 rounded-lg text-sm cursor-default"
                        >
                          <CheckCircleIcon className="w-4 h-4 inline mr-2" />
                          Configured
                        </button>
                        <button
                          onClick={() => handleRemoveIntegration(integration.id)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors text-sm"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleIntegrationSetup(integration)}
                          disabled={loading}
                          className="flex-1 btn-primary text-sm py-2 flex items-center justify-center space-x-2"
                        >
                          <PlusIcon className="w-4 h-4" />
                          <span>Setup</span>
                        </button>
                        <button
                          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                          title="Learn More"
                        >
                          <DocumentTextIcon className="w-4 h-4 text-gray-600" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="text-center py-12">
            <CubeTransparentIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations found</h3>
            <p className="text-gray-600">Try adjusting your search or category filter</p>
          </div>
        )}

        {/* Popular Integrations CTA */}
        <div className="mt-12 bg-gradient-to-r from-primary-600 to-purple-700 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Need a Custom Integration?
          </h2>
          <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
            Can't find the service you need? Our team can help you build custom integrations 
            for any API or service. Get in touch to discuss your requirements.
          </p>
          <button className="bg-white text-primary-600 hover:bg-gray-50 font-semibold px-6 py-3 rounded-lg transition-colors">
            Request Custom Integration
          </button>
        </div>
      </div>
    </div>
  )
}

export default Integrations