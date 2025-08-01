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
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'

const Home = () => {
  const { isAuthenticated } = useAuthStore()
  const [isHovered, setIsHovered] = useState(false)

  const features = [
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Conversational Coding',
      description: 'Build applications through natural conversation with advanced AI agents that understand your vision.',
      color: 'from-blue-500 to-cyan-600',
      highlight: 'Natural Language → Code'
    },
    {
      icon: UserGroupIcon,
      title: 'Multi-Agent Intelligence',
      description: 'Specialized AI agents work together - developers, designers, testers, and DevOps engineers.',
      color: 'from-purple-500 to-pink-600',
      highlight: 'Team of AI Experts'
    },
    {
      icon: CommandLineIcon,
      title: 'Live Code Editor',
      description: 'Real-time code editing with instant preview, execution, and intelligent autocomplete.',
      color: 'from-green-500 to-emerald-600',
      highlight: 'Real-time Preview'
    },
    {
      icon: RocketLaunchIcon,
      title: 'Instant Deployment',
      description: 'Deploy your applications instantly with our cloud infrastructure and global CDN.',
      color: 'from-orange-500 to-red-600',
      highlight: 'One-Click Deploy'
    }
  ]

  const stats = [
    { value: '50K+', label: 'Developers', color: 'text-blue-600', icon: UserGroupIcon },
    { value: '200K+', label: 'Projects Built', color: 'text-purple-600', icon: CodeBracketIcon },
    { value: '99.9%', label: 'Uptime', color: 'text-green-600', icon: CheckCircleIcon },
    { value: '24/7', label: 'AI Support', color: 'text-orange-600', icon: BoltIcon }
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Full-Stack Developer',
      company: 'TechCorp',
      content: 'AI Tempo transformed how I build applications. What used to take weeks now takes hours.',
      avatar: '👩‍💻'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Startup Founder',
      company: 'InnovateLab',
      content: 'The multi-agent system is incredible. It\'s like having an entire development team at your fingertips.',
      avatar: '👨‍🚀'
    },
    {
      name: 'Emily Johnson',
      role: 'Product Manager',
      company: 'DataFlow',
      content: 'From concept to deployment in minutes, not months. This is the future of development.',
      avatar: '👩‍💼'
    }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
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
                    Next-Gen AI Development Platform
                  </span>
                  <BoltIcon className="w-5 h-5 text-yellow-500" />
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
                  AI Tempo
                </span>
              </h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed"
              >
                Transform ideas into production-ready applications through natural conversation. 
                Experience the perfect rhythm of AI-powered development.
              </motion.p>
            </motion.div>
            
            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
            >
              <Link
                to={isAuthenticated ? "/chat" : "/signup"}
                className="group btn-primary text-lg px-10 py-4 shadow-2xl hover:shadow-glow-lg transition-all duration-300"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <span>Start Building</span>
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
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
              transition={{ delay: 1, duration: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2 + index * 0.1, duration: 0.5 }}
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

      {/* Features Section */}
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
              Feel the Development
              <span className="block text-gradient-secondary">
                Tempo
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Experience the perfect harmony of AI-assisted development with intelligent agents,
              real-time collaboration, and instant deployment.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                      
                      {/* Highlight badge */}
                      <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full mb-4">
                        {feature.highlight}
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {feature.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {feature.description}
                      </p>

                      {/* Learn more link */}
                      <div className="mt-4 text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Learn more
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

      {/* Testimonials Section */}
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
              Loved by Developers
              <span className="block text-gradient">Worldwide</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              See what developers are saying about AI Tempo
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
                <p className="text-gray-700 dark:text-gray-300 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
                <RocketLaunchIcon className="w-10 h-10 text-white" />
              </div>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your
              <span className="block">Development Process?</span>
            </h2>
            <p className="text-xl text-blue-100 mb-12 leading-relaxed">
              Join thousands of developers who've discovered the perfect rhythm 
              of AI-powered development. Start building the future today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                to={isAuthenticated ? "/chat" : "/signup"}
                className="inline-flex items-center space-x-3 bg-white text-blue-600 hover:text-blue-700 font-semibold px-10 py-4 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-3xl hover:bg-blue-50 hover:scale-105"
              >
                <CodeBracketIcon className="w-6 h-6" />
                <span>Start Your Journey</span>
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

export default Home