import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { 
  SparklesIcon,
  RocketLaunchIcon,
  ChatBubbleLeftRightIcon,
  CodeBracketIcon,
  UserGroupIcon,
  BoltIcon,
  CheckIcon,
  PlayIcon,
  ArrowRightIcon,
  StarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { useAuthStore } from '../store/authStore'
import SEOHead from './SEOHead'

const MarketingLanding = () => {
  const [stats, setStats] = useState({
    activeProjects: '15,247',
    developers: '2,100+',
    templates: '50+',
    satisfaction: '98%'
  })

  const features = [
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Conversational Coding',
      description: 'Build applications by simply describing what you want. Our AI understands context and generates production-ready code.',
      gradient: 'from-blue-500 to-cyan-600',
      demo: 'Watch Demo'
    },
    {
      icon: UserGroupIcon,
      title: 'Multi-Agent Intelligence',
      description: 'Work with specialized AI agents - developers, designers, testers - each expert in their domain.',
      gradient: 'from-purple-500 to-pink-600',
      demo: 'Try Agents'
    },
    {
      icon: BoltIcon,
      title: 'Instant Deployment',
      description: 'From idea to live application in minutes. Deploy with confidence using our automated infrastructure.',
      gradient: 'from-green-500 to-emerald-600',
      demo: 'See Deployment'
    },
    {
      icon: CodeBracketIcon,
      title: 'Visual Programming',
      description: 'Draw diagrams, sketch interfaces, or upload screenshots - watch them transform into working applications.',
      gradient: 'from-orange-500 to-red-600',
      demo: 'Try Visual Mode'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Startup Founder',
      image: '/images/testimonial-1.jpg',
      content: 'AI Tempo transformed how I build products. What used to take months now takes days. The quality is incredible.',
      rating: 5,
      company: 'TechFlow'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Senior Developer',
      image: '/images/testimonial-2.jpg',
      content: 'The multi-agent system is a game-changer. Having specialized AI for different tasks feels like working with a full team.',
      rating: 5,
      company: 'DevCorp'
    },
    {
      name: 'Emily Johnson',
      role: 'Product Manager',
      image: '/images/testimonial-3.jpg',
      content: 'Finally, a platform where I can prototype ideas without waiting for developers. The conversational interface is intuitive.',
      rating: 5,
      company: 'InnovateLab'
    }
  ]

  const pricingPlans = [
    {
      name: 'Free',
      price: '0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        '5 projects per month',
        'Basic AI agents',
        'Community templates',
        'Email support'
      ],
      cta: 'Start Free',
      popular: false
    },
    {
      name: 'Pro',
      price: '29',
      period: 'month',
      description: 'For serious developers',
      features: [
        'Unlimited projects',
        'Advanced AI agents',
        'Premium templates',
        'Priority support',
        'Custom integrations',
        'Team collaboration'
      ],
      cta: 'Start Pro Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      description: 'For organizations',
      features: [
        'Everything in Pro',
        'Custom AI training',
        'White-label options',
        'Dedicated support',
        'SLA guarantees',
        'Advanced security'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      <SEOHead
        title="Transform Ideas into Apps Through Conversation"
        description="Build production-ready applications through natural conversation with AI. Multi-agent collaboration, visual programming, and instant deployment. Start building for free."
        keywords={['AI development platform', 'conversational coding', 'AI-powered development', 'natural language programming', 'visual programming', 'instant deployment']}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-8">
                <SparklesIcon className="w-4 h-4 mr-2" />
                Powered by Advanced AI • 100% Production Ready
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
                Code with{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Tempo
                </span>
              </h1>

              <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
                Build applications through conversation. Deploy with a thought. 
                Experience the rhythm of AI-powered development.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                <Link 
                  to="/chat" 
                  className="btn-primary text-lg px-8 py-4 flex items-center space-x-2"
                >
                  <RocketLaunchIcon className="w-5 h-5" />
                  <span>Start Coding Now</span>
                </Link>
                
                <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <PlayIcon className="w-5 h-5" />
                  <span>Watch 2-min Demo</span>
                </button>
              </div>

              {/* Live Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
                {[
                  { label: 'Active Projects', value: stats.activeProjects },
                  { label: 'Developers', value: stats.developers },
                  { label: 'Templates', value: stats.templates },
                  { label: 'Satisfaction', value: stats.satisfaction }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Animated Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Revolutionary Development Experience
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Experience the future of software development with AI that understands your vision and brings it to life.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} p-3 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                        {feature.description}
                      </p>
                      <button className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 flex items-center group">
                        {feature.demo}
                        <ArrowRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Loved by Developers Worldwide
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Join thousands of developers who are building faster with AI Tempo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIconSolid key={i} className="w-5 h-5 text-yellow-400" />
                  ))}
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-900 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-300">
              Start free, scale as you grow. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl p-8 ${
                  plan.popular 
                    ? 'ring-2 ring-blue-500 scale-105 shadow-2xl' 
                    : 'border border-gray-200 dark:border-gray-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {plan.price === 'Custom' ? '' : '$'}{plan.price}
                    </span>
                    {plan.price !== 'Custom' && (
                      <span className="text-gray-500 dark:text-gray-400">/{plan.period}</span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  plan.popular
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}>
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-8">
            Ready to Transform Your Development Process?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of developers who are building the future with AI Tempo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/signup" 
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              Start Building for Free
            </Link>
            <Link 
              to="/templates" 
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Explore Templates
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default MarketingLanding