import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  SparklesIcon, 
  CodeBracketIcon, 
  RocketLaunchIcon,
  ChatBubbleLeftRightIcon,
  DocumentDuplicateIcon,
  ArrowRightIcon,
  UserGroupIcon,
  CommandLineIcon,
  BoltIcon,
  StarIcon,
  CheckCircleIcon,
  CpuChipIcon,
  MicrophoneIcon,
  EyeIcon,
  GlobeAltIcon,
  LightBulbIcon,
  PaintBrushIcon,
  BeakerIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'

const EnhancedHome = () => {
  const { isAuthenticated } = useAuthStore()
  const [isHovered, setIsHovered] = useState(false)

  // Enhanced 2025 features with simplified presentation
  const coreFeatures = [
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Enhanced AI Chat',
      description: 'Smart conversation with specialized AI agents that collaborate intelligently',
      color: 'blue',
      badge: 'ENHANCED',
      improvements: ['Multi-agent coordination', 'Smart suggestions', 'Voice interface']
    },
    {
      icon: CpuChipIcon,
      title: 'Intelligent Agents',
      description: 'Specialized AI agents for development, design, testing, and integration',
      color: 'purple',
      badge: 'SMART',
      improvements: ['Agent handoffs', 'Collaboration detection', 'Expert specialization']
    },
    {
      icon: ChartBarIcon,
      title: 'Advanced Analytics',
      description: 'Real-time insights into your development workflow and AI interactions',
      color: 'green',
      badge: 'LIVE',
      improvements: ['Conversation analytics', 'Performance tracking', 'Usage insights']
    },
    {
      icon: BoltIcon,
      title: 'Simplified Workflow',
      description: 'Streamlined navigation and intuitive user experience',
      color: 'orange',
      badge: 'IMPROVED',
      improvements: ['4 main categories', 'Quick access', 'Better organization']
    }
  ]

  const aiCapabilities = [
    { text: 'Multi-agent collaboration', icon: UserGroupIcon, improved: true },
    { text: 'Smart conversation quality', icon: ChatBubbleLeftRightIcon, improved: true },
    { text: 'Intelligent code generation', icon: CodeBracketIcon, improved: true },
    { text: 'Enhanced voice interface', icon: MicrophoneIcon, improved: true },
    { text: 'Real-time collaboration', icon: GlobeAltIcon, improved: true },
    { text: 'Simplified navigation', icon: CommandLineIcon, improved: true }
  ]

  const stats = [
    { value: '4', label: 'Main Categories', color: 'text-blue-600', change: 'down from 9' },
    { value: '5', label: 'AI Agents', color: 'text-purple-600', change: 'enhanced' },
    { value: '99.9%', label: 'Uptime', color: 'text-green-600', change: 'maintained' },
    { value: '50%', label: 'Faster Navigation', color: 'text-orange-600', change: 'improvement' }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
        <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="relative max-w-7xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            {/* Badge */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex justify-center mb-8"
            >
              <div className="glass px-6 py-3 rounded-full border border-white/20 shadow-xl">
                <div className="flex items-center space-x-3">
                  <SparklesIcon className="w-6 h-6 text-blue-500" />
                  <span className="text-sm font-semibold text-gradient">
                    Enhanced AI Platform - Simplified & Powerful
                  </span>
                  <span className="px-2 py-1 text-xs font-bold bg-green-500 text-white rounded-full">
                    ENHANCED
                  </span>
                </div>
              </div>
            </motion.div>
            
            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mb-8"
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-4">
                Aether AI
                <span className="block text-gradient animate-pulse-glow">
                  Enhanced
                </span>
              </h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-8 leading-relaxed"
              >
                Experience the enhanced AI development platform with improved conversation quality, 
                intelligent multi-agent coordination, and simplified workflow structure.
              </motion.p>

              {/* Enhanced Capabilities */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12 max-w-4xl mx-auto"
              >
                {aiCapabilities.map((capability, index) => {
                  const Icon = capability.icon
                  return (
                    <div 
                      key={index}
                      className="flex items-center space-x-2 px-4 py-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 rounded-xl"
                    >
                      <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {capability.text}
                      </span>
                      {capability.improved && (
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      )}
                    </div>
                  )
                })}
              </motion.div>
            </motion.div>
            
            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
            >
              <Link
                to={isAuthenticated ? "/chat" : "/signup"}
                className="group btn-primary text-lg px-10 py-4 shadow-2xl hover:shadow-glow-lg transition-all duration-300 relative overflow-hidden"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <span className="relative z-10 flex items-center">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
                  Try Enhanced AI
                  <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
                {isHovered && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Link>
              
              <Link
                to="/templates"
                className="btn-secondary text-lg px-10 py-4 glass"
              >
                <DocumentDuplicateIcon className="w-5 h-5 mr-2" />
                <span>Browse Templates</span>
              </Link>
            </motion.div>

            {/* Enhanced Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4 + index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  className="glass p-6 rounded-2xl text-center hover-lift"
                >
                  <div className={`text-3xl font-bold ${stat.color} mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {stat.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {stat.change}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              What's Enhanced
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We've improved every aspect of the platform while keeping the functionality you love
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {coreFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="group relative"
                >
                  <div className="card hover-lift group-hover:shadow-glow overflow-hidden h-full">
                    {/* Background gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-${feature.color}-500/5 to-${feature.color}-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}>
                    </div>
                    
                    <div className="relative z-10 h-full flex flex-col">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-16 h-16 rounded-3xl bg-gradient-to-r from-${feature.color}-500 to-${feature.color}-600 p-4 mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          feature.badge === 'ENHANCED' ? 'bg-blue-500 text-white' :
                          feature.badge === 'SMART' ? 'bg-purple-500 text-white' :
                          feature.badge === 'LIVE' ? 'bg-green-500 text-white animate-pulse' :
                          feature.badge === 'IMPROVED' ? 'bg-orange-500 text-white' :
                          'bg-gray-500 text-white'
                        }`}>
                          {feature.badge}
                        </span>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {feature.title}
                        </h3>
                        
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                          {feature.description}
                        </p>

                        {/* Improvements */}
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                            <LightBulbIcon className="w-4 h-4 mr-1 text-yellow-500" />
                            Key Improvements:
                          </div>
                          <ul className="space-y-1">
                            {feature.improvements.map((improvement, idx) => (
                              <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                                <CheckCircleIcon className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                                {improvement}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
        <div className="relative max-w-4xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block mb-8">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center">
                <SparklesIcon className="w-10 h-10 text-white" />
              </div>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Experience the Enhanced
              <span className="block">Aether AI Platform</span>
            </h2>
            <p className="text-xl text-blue-100 mb-12 leading-relaxed">
              Join the next generation of AI-powered development with improved conversation quality, 
              intelligent multi-agent coordination, and a simplified, intuitive interface.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                to={isAuthenticated ? "/chat" : "/signup"}
                className="inline-flex items-center space-x-3 bg-white text-blue-600 hover:text-blue-700 font-semibold px-10 py-4 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-3xl hover:bg-blue-50 hover:scale-105"
              >
                <ChatBubbleLeftRightIcon className="w-6 h-6" />
                <span>Start with Enhanced AI</span>
              </Link>
              
              <Link
                to="/templates"
                className="inline-flex items-center space-x-3 glass border-2 border-white/30 hover:border-white/50 text-white hover:bg-white/10 font-semibold px-10 py-4 rounded-2xl transition-all duration-300 hover:scale-105"
              >
                <DocumentDuplicateIcon className="w-6 h-6" />
                <span>Explore Templates</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default EnhancedHome