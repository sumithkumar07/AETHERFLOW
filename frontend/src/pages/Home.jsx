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
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'

const Home = () => {
  const { isAuthenticated } = useAuthStore()
  const [isHovered, setIsHovered] = useState(false)

  // Enhanced 2025 features
  const features = [
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Conversational Development',
      description: 'Build applications through natural conversation with Aether AI. Experience the future of code creation.',
      color: 'from-blue-500 to-cyan-600',
      highlight: 'Voice & Text Enabled',
      badge: '2025'
    },
    {
      icon: UserGroupIcon,
      title: 'Multi-Agent Intelligence',
      description: 'Specialized AI agents work together - developers, designers, testers, and DevOps engineers in perfect harmony.',
      color: 'from-purple-500 to-pink-600',
      highlight: 'Team of AI Experts',
      badge: 'AI'
    },
    {
      icon: CommandLineIcon,
      title: 'Real-time Code Editor',
      description: 'Live code editing with instant preview, AI-powered autocomplete, and collaborative real-time editing.',
      color: 'from-green-500 to-emerald-600',
      highlight: 'Live Collaboration',
      badge: 'LIVE'
    },
    {
      icon: RocketLaunchIcon,
      title: 'Instant AI Deployment',
      description: 'Deploy applications instantly with our AI-optimized cloud infrastructure and global edge network.',
      color: 'from-orange-500 to-red-600',
      highlight: 'One-Click Deploy',
      badge: 'FAST'
    },
    {
      icon: MicrophoneIcon,
      title: 'Voice-to-Code',
      description: 'Speak your ideas and watch them transform into production-ready code. The future of programming is here.',
      color: 'from-indigo-500 to-purple-600',
      highlight: 'Voice Commands',
      badge: 'NEW'
    },
    {
      icon: EyeIcon,
      title: 'AI Code Review',
      description: 'Real-time AI code review with security analysis, performance optimization, and best practice suggestions.',
      color: 'from-teal-500 to-blue-600',
      highlight: 'Smart Analysis',
      badge: 'AI'
    }
  ]

  const stats = [
    { value: '100K+', label: 'AI Developers', color: 'text-blue-600', icon: UserGroupIcon },
    { value: '500K+', label: 'AI Projects Built', color: 'text-purple-600', icon: CodeBracketIcon },
    { value: '99.9%', label: 'AI Uptime', color: 'text-green-600', icon: CheckCircleIcon },
    { value: '24/7', label: 'AI Support', color: 'text-orange-600', icon: BoltIcon }
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'AI Developer',
      company: 'TechCorp 2025',
      content: 'Aether AI transformed my development workflow. Voice-to-code is absolutely revolutionary!',
      avatar: '👩‍💻',
      rating: 5
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Startup Founder',
      company: 'InnovateLab AI',
      content: 'The multi-agent system is like having an entire AI development team. Game-changing technology.',
      avatar: '👨‍🚀',
      rating: 5
    },
    {
      name: 'Emily Johnson',
      role: 'Product Manager',
      company: 'DataFlow AI',
      content: 'From concept to AI-powered deployment in minutes. This is the future of development.',
      avatar: '👩‍💼',
      rating: 5
    }
  ]

  // 2025 AI capabilities showcase
  const aiCapabilities = [
    'Multi-modal AI (Voice, Text, Visual)',
    'Real-time collaborative AI editing',
    'AI-powered deployment optimization',
    'Smart code generation & review',
    'Predictive performance monitoring',
    'AI-driven security scanning'
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Background with AI particles */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
        <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
        {/* AI Particles Effect */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-500/20 rounded-full"
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: 0
              }}
              animate={{ 
                y: [null, -20, 20],
                opacity: [0, 0.7, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 5
              }}
            />
          ))}
        </div>
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
                  <CpuChipIcon className="w-6 h-6 text-blue-500" />
                  <span className="text-sm font-semibold text-gradient">
                    Next-Generation AI Development Platform
                  </span>
                  <span className="px-2 py-1 text-xs font-bold bg-purple-500 text-white rounded-full">
                    2025
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
                Code with
                <span className="block text-gradient animate-pulse-glow">
                  Aether AI
                </span>
              </h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-8 leading-relaxed"
              >
                Transform ideas into production-ready applications through conversation, voice commands, and AI collaboration. 
                <span className="text-blue-600 font-semibold"> Start your 7-day free trial</span> and experience the perfect harmony of next-generation development.
              </motion.p>

              {/* AI Capabilities Pills */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="flex flex-wrap justify-center gap-3 mb-12"
              >
                {aiCapabilities.map((capability, index) => (
                  <span 
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300"
                  >
                    {capability}
                  </span>
                ))}
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
                  <MicrophoneIcon className="w-5 h-5 mr-2" />
                  Start Building with AI
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
                <span>Explore AI Templates</span>
              </Link>
            </motion.div>

            {/* Enhanced Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.4 + index * 0.1, duration: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    className="glass p-6 rounded-2xl text-center hover-lift"
                  >
                    <Icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
                    <div className={`text-3xl font-bold ${stat.color} mb-1`}>
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </motion.div>
                )
              })}
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
              Experience the AI
              <span className="block text-gradient-secondary">
                Revolution
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Discover cutting-edge 2025 features that transform how you build, deploy, and scale applications
              with the power of advanced artificial intelligence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
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
                  <div className="card hover-lift group-hover:shadow-glow overflow-hidden">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-500"
                         style={{
                           background: `linear-gradient(135deg, ${feature.color.replace('from-', '').replace(' to-', ', ')})`
                         }}>
                    </div>
                    
                    <div className="relative z-10">
                      {/* Icon */}
                      <div className={`w-16 h-16 rounded-3xl bg-gradient-to-r ${feature.color} p-4 mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      
                      {/* Badge */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                          {feature.highlight}
                        </div>
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                          feature.badge === '2025' ? 'bg-purple-500 text-white' :
                          feature.badge === 'AI' ? 'bg-blue-500 text-white' :
                          feature.badge === 'LIVE' ? 'bg-red-500 text-white animate-pulse' :
                          feature.badge === 'NEW' ? 'bg-green-500 text-white' :
                          'bg-gray-500 text-white'
                        }`}>
                          {feature.badge}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {feature.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {feature.description}
                      </p>

                      {/* Learn more link */}
                      <div className="mt-4 text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Explore feature
                        <ArrowRightIcon className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 glass">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Loved by AI Developers
              <span className="block text-gradient">Worldwide</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              See what developers are saying about Aether AI's revolutionary capabilities
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="card hover-lift"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic mb-4">
                  "{testimonial.content}"
                </p>
                <div className="flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </motion.div>
            ))}
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
                <CpuChipIcon className="w-10 h-10 text-white" />
              </div>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your
              <span className="block">Development Process?</span>
            </h2>
            <p className="text-xl text-blue-100 mb-12 leading-relaxed">
              Join thousands of developers who've discovered the perfect harmony 
              of AI-powered development. Start building the future today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                to={isAuthenticated ? "/chat" : "/signup"}
                className="inline-flex items-center space-x-3 bg-white text-blue-600 hover:text-blue-700 font-semibold px-10 py-4 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-3xl hover:bg-blue-50 hover:scale-105"
              >
                <MicrophoneIcon className="w-6 h-6" />
                <span>Start Your AI Journey</span>
              </Link>
              
              <Link
                to="/templates"
                className="inline-flex items-center space-x-3 glass border-2 border-white/30 hover:border-white/50 text-white hover:bg-white/10 font-semibold px-10 py-4 rounded-2xl transition-all duration-300 hover:scale-105"
              >
                <DocumentDuplicateIcon className="w-6 h-6" />
                <span>Explore AI Templates</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home