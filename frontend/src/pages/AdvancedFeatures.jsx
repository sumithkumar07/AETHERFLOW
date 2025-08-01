import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CpuChipIcon,
  PuzzlePieceIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  SparklesIcon,
  CodeBracketIcon,
  UserGroupIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

// Import advanced components
import AIModelRouter from '../components/advanced/AIModelRouter'
import PluginMarketplace from '../components/advanced/PluginMarketplace'
import AnalyticsDashboard from '../components/advanced/AnalyticsDashboard'
import SecurityDashboard from '../components/advanced/SecurityDashboard'
import CollaborationInterface from '../components/advanced/CollaborationInterface'

const AdvancedFeatures = () => {
  const [activeTab, setActiveTab] = useState('ai-router')
  const [currentModel, setCurrentModel] = useState('gpt-4o-mini')
  const [installedPlugins, setInstalledPlugins] = useState(['stripe-integration'])
  const [features, setFeatures] = useState({})

  const tabs = [
    { 
      id: 'ai-router', 
      name: 'AI Router', 
      icon: CpuChipIcon,
      description: 'Smart AI model selection and optimization'
    },
    { 
      id: 'plugins', 
      name: 'Plugin System', 
      icon: PuzzlePieceIcon,
      description: 'Hot-pluggable integrations and workflows'
    },
    { 
      id: 'analytics', 
      name: 'Analytics', 
      icon: ChartBarIcon,
      description: 'Advanced analytics and business intelligence'
    },
    { 
      id: 'security', 
      name: 'Security', 
      icon: ShieldCheckIcon,
      description: 'Zero-trust security and compliance'
    },
    { 
      id: 'performance', 
      name: 'Performance', 
      icon: RocketLaunchIcon,
      description: 'Performance optimization and auto-scaling'
    },
    { 
      id: 'ux', 
      name: 'User Experience', 
      icon: SparklesIcon,
      description: 'Adaptive UI and personalization'
    },
    { 
      id: 'development', 
      name: 'Dev Assistant', 
      icon: CodeBracketIcon,
      description: 'AI-powered development assistance'
    },
    { 
      id: 'collaboration', 
      name: 'Collaboration', 
      icon: UserGroupIcon,
      description: 'Real-time collaboration and editing'
    }
  ]

  useEffect(() => {
    loadFeatureData()
  }, [])

  const loadFeatureData = async () => {
    // Load feature configurations and status
    setFeatures({
      aiRouter: { enabled: true, configured: true },
      plugins: { enabled: true, installed: installedPlugins.length },
      analytics: { enabled: true, tracking: true },
      security: { enabled: true, threats: 0 },
      performance: { enabled: true, optimization: 'auto' },
      ux: { enabled: true, personalization: true },
      development: { enabled: true, assistant: true },
      collaboration: { enabled: true, realtime: true }
    })
  }

  const handleModelSelect = (modelId) => {
    setCurrentModel(modelId)
    // In real implementation, this would update the global AI configuration
    console.log('Selected model:', modelId)
  }

  const handleInstallPlugin = (plugin) => {
    setInstalledPlugins(prev => [...prev, plugin.id])
    // In real implementation, this would install the plugin
    console.log('Installing plugin:', plugin)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'ai-router':
        return (
          <AIModelRouter 
            currentModel={currentModel}
            onModelSelect={handleModelSelect}
          />
        )

      case 'plugins':
        return (
          <PluginMarketplace 
            installedPlugins={installedPlugins}
            onInstallPlugin={handleInstallPlugin}
          />
        )

      case 'analytics':
        return <AnalyticsDashboard />

      case 'security':
        return <SecurityDashboard />

      case 'performance':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Optimization</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">127ms</div>
                  <div className="text-gray-500">Avg Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">99.9%</div>
                  <div className="text-gray-500">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">Auto</div>
                  <div className="text-gray-500">Scaling Status</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h4 className="font-semibold text-gray-900 mb-3">Auto-Scaling Status</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Load</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-green-500"></div>
                    </div>
                    <span className="text-sm font-medium">75%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Instances</span>
                  <span className="text-sm font-medium">3 / 5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Next Scale Check</span>
                  <span className="text-sm font-medium">2 minutes</span>
                </div>
              </div>
            </div>
          </div>
        )

      case 'ux':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Adaptive User Experience</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Personalization Engine</div>
                    <div className="text-sm text-gray-600">Customizes interface based on user behavior</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-600">Active</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Voice Interface</div>
                    <div className="text-sm text-gray-600">Natural language commands and responses</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-600">Ready</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Accessibility Enhancer</div>
                    <div className="text-sm text-gray-600">Automatic accessibility improvements</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-600">Enabled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'development':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Development Assistant</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Code Analysis</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Quality Score</span>
                      <span className="font-medium text-green-600">8.7/10</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Bugs Detected</span>
                      <span className="font-medium text-yellow-600">3 minor</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Test Coverage</span>
                      <span className="font-medium text-blue-600">92%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Smart Suggestions</h4>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 bg-blue-50 rounded">
                      <div className="font-medium text-blue-900">Performance Optimization</div>
                      <div className="text-blue-700">Consider caching API responses</div>
                    </div>
                    <div className="p-2 bg-green-50 rounded">
                      <div className="font-medium text-green-900">Code Quality</div>
                      <div className="text-green-700">Add error handling to async functions</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'collaboration':
        return (
          <CollaborationInterface 
            projectId="demo-project"
            currentUser={{ name: 'Demo User', avatar: 'D' }}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Features</h1>
            <p className="text-lg text-gray-600">
              Enterprise-grade capabilities for maximum productivity
            </p>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-6">
            {tabs.map((tab) => {
              const IconComponent = tab.icon
              const isActive = activeTab === tab.id
              const feature = features[tab.id.replace('-', '').replace('dev', 'development')]

              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    p-4 rounded-xl border-2 text-left transition-all duration-200 relative
                    ${isActive 
                      ? 'border-blue-500 bg-blue-50 shadow-lg' 
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Status indicator */}
                  {feature?.enabled && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}

                  <IconComponent className={`w-6 h-6 mb-2 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  <div className={`font-medium text-sm ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                    {tab.name}
                  </div>
                  <div className={`text-xs ${isActive ? 'text-blue-600' : 'text-gray-500'} line-clamp-2`}>
                    {tab.description}
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderTabContent()}
        </motion.div>
      </div>
    </div>
  )
}

export default AdvancedFeatures