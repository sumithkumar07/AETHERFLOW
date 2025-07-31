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
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'

const Home = () => {
  const { isAuthenticated } = useAuthStore()

  const features = [
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'AI-Powered Chat',
      description: 'Build applications through natural conversation with our advanced AI assistant.',
      color: 'from-blue-500 to-purple-600'
    },
    {
      icon: DocumentDuplicateIcon,
      title: 'Ready-to-Use Templates',
      description: 'Start with professional templates and customize them to your needs.',
      color: 'from-green-500 to-teal-600'
    },
    {
      icon: CubeTransparentIcon,
      title: 'Seamless Integrations',
      description: 'Connect with databases, authentication, payments, and more with one click.',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: RocketLaunchIcon,
      title: 'Instant Deployment',
      description: 'Deploy your applications instantly with our cloud infrastructure.',
      color: 'from-orange-500 to-red-600'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
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
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-purple-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200">
                <SparklesIcon className="w-5 h-5 text-primary-600" />
                <span className="text-sm font-medium text-gray-700">Next Generation AI Development</span>
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Build Apps with
              <span className="block gradient-text">AI Conversations</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              The most advanced AI-powered development platform. Create full-stack applications, 
              integrate services, and deploy instantly - all through natural conversation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to={isAuthenticated ? "/chat" : "/signup"}
                className="group btn-primary text-lg px-8 py-4 flex items-center space-x-2"
              >
                <span>Start Building</span>
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/templates"
                className="btn-secondary text-lg px-8 py-4 flex items-center space-x-2"
              >
                <DocumentDuplicateIcon className="w-5 h-5" />
                <span>Browse Templates</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Build
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features that make application development faster, easier, and more enjoyable.
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
                  className="relative group"
                >
                  <div className="card hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} p-3 mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Development?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of developers building the future with AI-powered development.
            </p>
            <Link
              to={isAuthenticated ? "/chat" : "/signup"}
              className="inline-flex items-center space-x-2 bg-white text-primary-600 hover:bg-gray-50 font-semibold px-8 py-4 rounded-lg transition-colors duration-200"
            >
              <CodeBracketIcon className="w-5 h-5" />
              <span>Start Your First Project</span>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home