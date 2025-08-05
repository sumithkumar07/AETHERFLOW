import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  RocketLaunchIcon, 
  CommandLineIcon, 
  BrainIcon,
  BugAntIcon,
  CodeBracketIcon,
  RectangleStackIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { competitiveAPI, enhancedTemplatesAPI, autonomousPlanningAPI } from '../services/competitiveAPI'

const CompetitiveFeatures = ({ isVisible = false, onClose }) => {
  const [activeFeature, setActiveFeature] = useState(null)
  const [featuresStatus, setFeaturesStatus] = useState({})
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)

  // Competitive features configuration
  const competitiveFeatures = [
    {
      id: 'autonomous_planning',
      name: 'Natural Language Planning',
      description: 'Devin-like autonomous task planning with AI roadmaps',
      icon: BrainIcon,
      color: 'from-purple-500 to-pink-500',
      features: [
        'Break large goals into tasks autonomously',
        'Memory agent with roadmap reasoning', 
        'Conversational project management',
        'Multi-phase project planning'
      ],
      status: 'active'
    },
    {
      id: 'git_cicd',
      name: 'Git & CI/CD Integration',
      description: 'GitHub push, auto-deploy, PR creation like Devin',
      icon: RocketLaunchIcon,
      color: 'from-blue-500 to-cya n-500',
      features: [
        'GitHub push & auto-deploy',
        'CI/CD pipeline automation',
        'Version control UI',
        'Auto-PR creation'
      ],
      status: 'active'
    },
    {
      id: 'memory_system',
      name: 'Long-Term Memory',
      description: 'Session memory and project recall like Emergent',
      icon: DocumentTextIcon,
      color: 'from-green-500 to-emerald-500',
      features: [
        'Session memory storage',
        'Long-term project recall',
        'User preference learning',
        'Context-aware responses'
      ],
      status: 'active'
    },
    {
      id: 'conversational_debugging',
      name: 'Conversational Debugging',
      description: 'Natural language debugging and replay features',
      icon: BugAntIcon,
      color: 'from-red-500 to-orange-500',
      features: [
        'Natural language debugging',
        'Build replay functionality',
        'Error analysis & fixes',
        'Debug session history'
      ],
      status: 'active'
    },
    {
      id: 'enhanced_editor',
      name: 'VS Code Integration',
      description: 'Real-time pair programming & IDE plugins',
      icon: CodeBracketIcon,
      color: 'from-indigo-500 to-purple-500',
      features: [
        'VS Code extension',
        'Real-time collaboration',
        'Native file editing',
        'Session syncing'
      ],
      status: 'active'
    },
    {
      id: 'enhanced_templates',
      name: 'Enhanced Templates',
      description: '25+ production-ready templates vs 6 current',
      icon: RectangleStackIcon,
      color: 'from-yellow-500 to-orange-500',
      features: [
        '25+ professional templates',
        'Category organization',
        'Custom template generation',
        'AI-powered customization'
      ],
      status: 'active'
    }
  ]

  useEffect(() => {
    const loadCompetitiveStatus = async () => {
      setLoading(true)
      try {
        // Load competitive features status
        const status = await competitiveAPI.getCompetitiveStatus()
        setFeaturesStatus(status)

        // Load enhanced templates sample
        const templatesData = await enhancedTemplatesAPI.getPopularTemplates(6)
        setTemplates(templatesData || [])
      } catch (error) {
        console.error('Failed to load competitive features:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isVisible) {
      loadCompetitiveStatus()
    }
  }, [isVisible])

  const handleFeatureClick = (feature) => {
    setActiveFeature(activeFeature?.id === feature.id ? null : feature)
  }

  const handleCreateRoadmap = async () => {
    try {
      const roadmap = await autonomousPlanningAPI.createRoadmap(
        'Build a competitive AI development platform',
        'complex',
        'normal',
        { competitive_features: true }
      )
      console.log('Roadmap created:', roadmap)
      // Show success message or navigate to roadmap view
    } catch (error) {
      console.error('Failed to create roadmap:', error)
    }
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Competitive Features</h2>
                <p className="text-blue-100 mt-1">Advanced capabilities to compete with Devin & other AI platforms</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-blue-100">Templates Available</div>
                  <div className="text-xl font-bold">{featuresStatus.template_count || 0}</div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Features List */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    🚀 All Features Active & Ready
                  </h3>
                  
                  {competitiveFeatures.map((feature) => {
                    const Icon = feature.icon
                    const isActive = activeFeature?.id === feature.id
                    
                    return (
                      <motion.div
                        key={feature.id}
                        className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                          isActive 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        onClick={() => handleFeatureClick(feature)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start space-x-4">
                          <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.color}`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {feature.name}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                <ChevronRightIcon 
                                  className={`w-5 h-5 text-gray-400 transition-transform ${
                                    isActive ? 'rotate-90' : ''
                                  }`} 
                                />
                              </div>
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                              {feature.description}
                            </p>
                            
                            <AnimatePresence>
                              {isActive && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-4 space-y-2"
                                >
                                  {feature.features.map((item, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                      <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                                      <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                                    </div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Quick Actions & Status */}
                <div className="space-y-6">
                  {/* System Status */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">System Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Template Service</span>
                        <div className={`w-3 h-3 rounded-full ${
                          featuresStatus.templates_service ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Categories Loaded</span>
                        <div className={`w-3 h-3 rounded-full ${
                          featuresStatus.categories_loaded ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Total Templates</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {featuresStatus.template_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h4>
                    <div className="space-y-3">
                      <button
                        onClick={handleCreateRoadmap}
                        className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <BrainIcon className="w-4 h-4" />
                        <span>Create AI Roadmap</span>
                      </button>
                      
                      <button
                        onClick={() => window.open('/templates', '_blank')}
                        className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <RectangleStackIcon className="w-4 h-4" />
                        <span>Browse Templates</span>
                      </button>
                      
                      <button
                        onClick={() => console.log('Opening VS Code integration...')}
                        className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <CodeBracketIcon className="w-4 h-4" />
                        <span>VS Code Setup</span>
                      </button>
                    </div>
                  </div>

                  {/* Popular Templates Preview */}
                  {templates.length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Popular Templates</h4>
                      <div className="space-y-2">
                        {templates.slice(0, 3).map((template, index) => (
                          <div key={template.id || index} className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                              <RectangleStackIcon className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {template.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                ⭐ {template.rating} • {template.download_count} downloads
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default CompetitiveFeatures