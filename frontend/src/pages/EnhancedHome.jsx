import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  SparklesIcon, 
  ChatBubbleLeftRightIcon,
  RocketLaunchIcon,
  DocumentDuplicateIcon,
  ArrowRightIcon,
  UserGroupIcon,
  CommandLineIcon,
  BoltIcon,
  CheckCircleIcon,
  CpuChipIcon,
  EyeIcon,
  GlobeAltIcon,
  LightBulbIcon,
  PaintBrushIcon,
  BeakerIcon,
  ChartBarIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import CompetitiveFeatures from '../components/CompetitiveFeatures'

const EnhancedHome = () => {
  const { isAuthenticated } = useAuthStore()
  const [isHovered, setIsHovered] = useState(false)
  const [showCompetitiveFeatures, setShowCompetitiveFeatures] = useState(false)

  // Enhanced 2025 features with simplified presentation
  const coreFeatures = [
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Multi-Agent AI Chat',
      description: 'Coordinate with 5 specialized AI agents: Developer, Designer, Architect, Tester, and Project Manager',
      color: 'blue',
      badge: 'ENHANCED',
      improvements: ['Intelligent agent handoff', 'Real-time collaboration', 'Context-aware responses']
    },
    {
      icon: CpuChipIcon,
      title: 'Smart Coordination',
      description: 'Agents automatically collaborate and hand off tasks based on your needs',
      color: 'purple',
      badge: 'SMART',
      improvements: ['Auto agent selection', 'Seamless handoffs', 'Conversation summarization']
    },
    {
      icon: RocketLaunchIcon,
      title: 'Lightning Fast',
      description: 'Powered by Groq API with sub-2 second response times and smart model routing',
      color: 'green',
      badge: 'FAST',
      improvements: ['10x faster responses', 'Cost optimization', '4 ultra-fast models']
    },
    {
      icon: BoltIcon,
      title: 'Simplified Interface',
      description: 'Streamlined 4-category navigation designed for maximum productivity',
      color: 'orange',
      badge: 'SIMPLE',
      improvements: ['4 main categories', 'Intuitive workflows', 'Enhanced UX patterns']
    }
  ]

  const aiAgents = [
    { name: 'Dev', role: 'Developer', icon: CommandLineIcon, specialty: 'Clean code & architecture', color: 'blue' },
    { name: 'Luna', role: 'Designer', icon: PaintBrushIcon, specialty: 'UI/UX & accessibility', color: 'pink' },
    { name: 'Atlas', role: 'Architect', icon: CpuChipIcon, specialty: 'System design & scalability', color: 'purple' },
    { name: 'Quinn', role: 'Tester', icon: BeakerIcon, specialty: 'Quality assurance & testing', color: 'green' },
    { name: 'Sage', role: 'Project Manager', icon: UserGroupIcon, specialty: 'Coordination & delivery', color: 'orange' }
  ]

  const stats = [
    { value: '5', label: 'AI Agents', color: 'text-blue-600', change: 'enhanced coordination' },
    { value: '<2s', label: 'Response Time', color: 'text-green-600', change: '10x faster' },
    { value: '4', label: 'Categories', color: 'text-purple-600', change: 'simplified from 9' },
    { value: '85%', label: 'Cost Savings', color: 'text-orange-600', change: 'vs GPU setup' }
  ]

  const capabilities = [
    { text: 'Multi-agent conversations', icon: UserGroupIcon, enhanced: true },
    { text: 'Intelligent handoffs', icon: ArrowRightIcon, enhanced: true },
    { text: 'Context-aware responses', icon: LightBulbIcon, enhanced: true },
    { text: 'Real-time collaboration', icon: GlobeAltIcon, enhanced: true },
    { text: 'Smart model routing', icon: BoltIcon, enhanced: true },
    { text: 'Simplified workflows', icon: CheckCircleIcon, enhanced: true }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden pt-16">
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
                    Enhanced Multi-Agent AI Platform
                  </span>
                  <span className="px-2 py-1 text-xs font-bold bg-green-500 text-white rounded-full animate-pulse">
                    V3.0
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
                Experience intelligent multi-agent collaboration with 5 specialized AI experts working together to deliver exceptional results at lightning speed.
              </motion.p>

              {/* Enhanced Capabilities Grid */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12 max-w-4xl mx-auto"
              >
                {capabilities.map((capability, index) => {
                  const Icon = capability.icon
                  return (
                    <div 
                      key={index}
                      className="flex items-center space-x-2 px-4 py-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200"
                    >
                      <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {capability.text}
                      </span>
                      {capability.enhanced && (
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
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
                  <UserGroupIcon className="w-5 h-5 mr-2" />
                  Start Multi-Agent Chat
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
                <span>Explore Templates</span>
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

      {/* AI Agents Section */}
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
              Meet Your AI Team
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              5 specialized AI agents work together intelligently, handling tasks from development to deployment
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {aiAgents.map((agent, index) => {
              const Icon = agent.icon
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
                    <div className={`absolute inset-0 bg-gradient-to-br from-${agent.color}-500/5 to-${agent.color}-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}>
                    </div>
                    
                    <div className="relative z-10 text-center">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r from-${agent.color}-500 to-${agent.color}-600 p-4 mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 mx-auto`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {agent.name}
                      </h3>
                      
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        {agent.role}
                      </p>
                      
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {agent.specialty}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-cyan-600/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Enhanced Capabilities
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Every aspect improved for better performance, usability, and developer experience
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
                    <div className={`absolute inset-0 bg-gradient-to-br from-${feature.color}-500/5 to-${feature.color}-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}>
                    </div>
                    
                    <div className="relative z-10 h-full flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-16 h-16 rounded-3xl bg-gradient-to-r from-${feature.color}-500 to-${feature.color}-600 p-4 mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          feature.badge === 'ENHANCED' ? 'bg-blue-500 text-white' :
                          feature.badge === 'SMART' ? 'bg-purple-500 text-white' :
                          feature.badge === 'FAST' ? 'bg-green-500 text-white animate-pulse' :
                          feature.badge === 'SIMPLE' ? 'bg-orange-500 text-white' :
                          'bg-gray-500 text-white'
                        }`}>
                          {feature.badge}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {feature.title}
                        </h3>
                        
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                          {feature.description}
                        </p>

                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                            <LightBulbIcon className="w-4 h-4 mr-1 text-yellow-500" />
                            Key Enhancements:
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
              Ready to Experience
              <span className="block">Enhanced AI Collaboration?</span>
            </h2>
            <p className="text-xl text-blue-100 mb-12 leading-relaxed">
              Join the next generation of AI-powered development with intelligent multi-agent coordination, 
              lightning-fast responses, and a beautifully simplified interface.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                to={isAuthenticated ? "/chat" : "/signup"}
                className="inline-flex items-center space-x-3 bg-white text-blue-600 hover:text-blue-700 font-semibold px-10 py-4 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-3xl hover:bg-blue-50 hover:scale-105"
              >
                <UserGroupIcon className="w-6 h-6" />
                <span>Start Multi-Agent Chat</span>
              </Link>
              
              <Link
                to="/templates"
                className="inline-flex items-center space-x-3 glass border-2 border-white/30 hover:border-white/50 text-white hover:bg-white/10 font-semibold px-10 py-4 rounded-2xl transition-all duration-300 hover:scale-105"
              >
                <DocumentDuplicateIcon className="w-6 h-6" />
                <span>Browse Templates</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default EnhancedHome