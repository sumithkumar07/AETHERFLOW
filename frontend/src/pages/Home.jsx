import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring } from 'framer-motion'
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
  BoltIcon,
  StarIcon,
  CheckCircleIcon,
  LightBulbIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'

const Home = () => {
  const { isAuthenticated } = useAuthStore()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  // Mouse tracking for hero glow effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const features = [
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Conversational Coding',
      description: 'Build applications through natural conversation with advanced AI agents that understand your vision.',
      color: 'from-blue-500 to-cyan-600',
      delay: 0.1,
      highlight: 'Natural Language → Code'
    },
    {
      icon: UserGroupIcon,
      title: 'Multi-Agent Intelligence',
      description: 'Specialized AI agents work together - developers, designers, testers, and DevOps engineers.',
      color: 'from-purple-500 to-pink-600',
      delay: 0.2,
      highlight: 'Team of AI Experts'
    },
    {
      icon: CommandLineIcon,
      title: 'Live Code Editor',
      description: 'Real-time code editing with instant preview, execution, and intelligent autocomplete.',
      color: 'from-green-500 to-emerald-600',
      delay: 0.3,
      highlight: 'Real-time Preview'
    },
    {
      icon: RocketLaunchIcon,
      title: 'Instant Deployment',
      description: 'Deploy your applications instantly with our cloud infrastructure and global CDN.',
      color: 'from-orange-500 to-red-600',
      delay: 0.4,
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  const floatVariants = {
    initial: { y: 0 },
    animate: {
      y: [-5, 5, -5],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Ccircle cx="7" cy="7" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-20"
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight 
              }}
              animate={{
                y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
                x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth]
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Badge */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex justify-center mb-8"
            >
              <div className="glass-strong px-6 py-3 rounded-full border border-white/20 shadow-glow">
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <SparklesIcon className="w-6 h-6 text-blue-500" />
                  </motion.div>
                  <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Next-Gen AI Development Platform
                  </span>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <BoltIcon className="w-5 h-5 text-yellow-500" />
                  </motion.div>
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
              <h1 className="heading-xl text-gray-900 dark:text-white mb-4">
                Code with
                <motion.span 
                  className="block text-gradient animate-glow"
                  animate={{ 
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  AI Tempo
                </motion.span>
              </h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="body-large text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-12"
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
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={isAuthenticated ? "/chat" : "/signup"}
                  className="group btn-primary text-lg px-10 py-4 shadow-2xl hover:shadow-glow-lg transition-all duration-300"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <span>Start Building</span>
                  <motion.div
                    animate={{ x: isHovered ? 5 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </motion.div>
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/templates"
                  className="btn-secondary text-lg px-10 py-4 glass-strong"
                >
                  <DocumentDuplicateIcon className="w-5 h-5 mr-2" />
                  <span>Explore Templates</span>
                </Link>
              </motion.div>
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
                    className="glass p-6 rounded-2xl text-center hover:shadow-glow transition-all duration-300"
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
            <h2 className="heading-lg text-gray-900 dark:text-white mb-6">
              Feel the Development
              <span className="block text-gradient-secondary animate-breathe">
                Tempo
              </span>
            </h2>
            <p className="body-large text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Experience the perfect harmony of AI-assisted development with intelligent agents,
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
                  <motion.div 
                    className="card-elevated hover-lift group-hover:shadow-glow overflow-hidden"
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-500"
                         style={{
                           background: `linear-gradient(135deg, ${feature.color.replace('from-', '').replace(' to-', ', ')})`
                         }}>
                    </div>
                    
                    <div className="relative z-10">
                      {/* Icon */}
                      <motion.div 
                        className={`w-16 h-16 rounded-3xl bg-gradient-to-r ${feature.color} p-4 mb-6 shadow-lg group-hover:shadow-xl`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </motion.div>
                      
                      {/* Highlight badge */}
                      <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full mb-4">
                        {feature.highlight}
                      </div>
                      
                      <h3 className="heading-md text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {feature.title}
                      </h3>
                      
                      <p className="body-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                        {feature.description}
                      </p>

                      {/* Learn more link */}
                      <motion.div 
                        className="mt-4 text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={{ x: -10 }}
                        whileHover={{ x: 0 }}
                      >
                        Learn more
                        <ArrowRightIcon className="w-4 h-4 ml-1" />
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              )
            })}
          </motion.div>
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
            <h2 className="heading-lg text-gray-900 dark:text-white mb-6">
              Loved by Developers
              <span className="block text-gradient">Worldwide</span>
            </h2>
            <p className="body-large text-gray-600 dark:text-gray-300">
              See what developers are saying about AI Tempo
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
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
          </motion.div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 bg-gradient-mesh">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
        <div className="relative max-w-4xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              variants={floatVariants}
              initial="initial"
              animate="animate"
              className="inline-block mb-8"
            >
              <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center">
                <RocketLaunchIcon className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            <h2 className="heading-lg text-white mb-6">
              Ready to Transform Your
              <span className="block">Development Process?</span>
            </h2>
            <p className="body-large text-blue-100 mb-12 leading-relaxed">
              Join thousands of developers who've discovered the perfect rhythm 
              of AI-powered development. Start building the future today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={isAuthenticated ? "/chat" : "/signup"}
                  className="inline-flex items-center space-x-3 bg-white text-blue-600 hover:text-blue-700 font-semibold px-10 py-4 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-3xl hover:bg-blue-50"
                >
                  <CodeBracketIcon className="w-6 h-6" />
                  <span>Start Your Journey</span>
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/templates"
                  className="inline-flex items-center space-x-3 glass-strong border-2 border-white/30 hover:border-white/50 text-white hover:bg-white/10 font-semibold px-10 py-4 rounded-2xl transition-all duration-300"
                >
                  <DocumentDuplicateIcon className="w-6 h-6" />
                  <span>Explore Templates</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home