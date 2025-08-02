import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  SparklesIcon, 
  CodeBracketIcon, 
  RocketLaunchIcon,
  ChatBubbleLeftRightIcon,
  DocumentDuplicateIcon,
  CubeTransparentIcon,
  ArrowRightIcon,
  UserGroupIcon,
  CommandLineIcon,
  BoltIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'

const Home = () => {
  const { isAuthenticated } = useAuthStore()

  const features = [
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Conversational Coding',
      description: 'Build applications through natural conversation with advanced AI agents.',
      color: 'from-blue-500 to-cyan-600',
      delay: 0.1
    },
    {
      icon: UserGroupIcon,
      title: 'Multi-Agent Intelligence',
      description: 'Specialized AI agents work together - developers, designers, testers, and more.',
      color: 'from-purple-500 to-pink-600',
      delay: 0.2
    },
    {
      icon: CommandLineIcon,
      title: 'Live Code Editor',
      description: 'Real-time code editing with instant preview and execution capabilities.',
      color: 'from-green-500 to-emerald-600',
      delay: 0.3
    },
    {
      icon: RocketLaunchIcon,
      title: 'Instant Deployment',
      description: 'Deploy your applications instantly with our cloud infrastructure.',
      color: 'from-orange-500 to-red-600',
      delay: 0.4
    }
  ]

  const stats = [
    { value: '10K+', label: 'Developers', color: 'text-blue-600' },
    { value: '50K+', label: 'Projects Built', color: 'text-purple-600' },
    { value: '99.9%', label: 'Uptime', color: 'text-green-600' },
    { value: '24/7', label: 'AI Support', color: 'text-orange-600' }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 dark:from-blue-950/50 dark:via-gray-900 dark:to-purple-950/50"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex justify-center mb-8"
            >
              <div className="flex items-center space-x-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl px-6 py-3 rounded-full border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                <SparklesIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Next-Gen AI Development Platform
                </span>
                <BoltIcon className="w-5 h-5 text-yellow-500" />
              </div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6"
            >
              Code with
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent animate-pulse-glow">
                AI Tempo
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              Build applications through conversation. Deploy with a thought. 
              Experience the rhythm of AI-powered development.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <Link
                to={isAuthenticated ? "/chat" : "/signup"}
                className="group btn-primary text-lg px-8 py-4 flex items-center space-x-3 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
              >
                <span>Start Coding</span>
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/demo"
                className="btn-secondary text-lg px-8 py-4 flex items-center space-x-3 backdrop-blur-xl"
              >
                <SparklesIcon className="w-5 h-5" />
                <span>Try Enhanced Features</span>
              </Link>
              
              <Link
                to="/templates"
                className="btn-secondary text-lg px-8 py-4 flex items-center space-x-3 backdrop-blur-xl"
              >
                <DocumentDuplicateIcon className="w-5 h-5" />
                <span>Explore Templates</span>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                  className="text-center"
                >
                  <div className={`text-3xl font-bold ${stat.color} mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Feel the Development
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Tempo
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Experience the perfect rhythm of AI-assisted development with intelligent agents,
              real-time collaboration, and instant deployment.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group relative"
                >
                  <div className="card hover:shadow-2xl transition-all duration-500 group-hover:scale-[1.02] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-500"
                         style={{
                           background: `linear-gradient(135deg, ${feature.color.replace('from-', '').replace(' to-', ', ')})`
                         }}>
                    </div>
                    
                    <div className="relative">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.color} p-4 mb-6 shadow-xl group-hover:shadow-2xl transition-shadow duration-300`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {feature.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Find Your
              <span className="block">Coding Tempo?</span>
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Join thousands of developers who've discovered the perfect rhythm 
              of AI-powered development. Start building today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to={isAuthenticated ? "/chat" : "/signup"}
                className="inline-flex items-center space-x-3 bg-white/90 hover:bg-white text-blue-600 hover:text-blue-700 font-semibold px-8 py-4 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                <CodeBracketIcon className="w-6 h-6" />
                <span>Start Your Journey</span>
              </Link>
              
              <Link
                to="/templates"
                className="inline-flex items-center space-x-3 bg-transparent border-2 border-white/30 hover:border-white/50 text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-2xl transition-all duration-300 backdrop-blur-xl"
              >
                <DocumentDuplicateIcon className="w-6 h-6" />
                <span>View Examples</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home