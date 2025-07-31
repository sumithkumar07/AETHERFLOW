import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CodeBracketIcon,
  RocketLaunchIcon,
  LightBulbIcon,
  BoltIcon,
  ShieldCheckIcon,
  CloudIcon,
  ArrowRightIcon,
  PlayIcon,
  CheckIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import Layout from '../components/Layout/Layout'

const HomePage = () => {
  const features = [
    {
      icon: CodeBracketIcon,
      title: "AI-Powered Development",
      description: "Generate production-ready code with our advanced AI agents specialized in different technologies."
    },
    {
      icon: RocketLaunchIcon,
      title: "Instant Deployment",
      description: "Deploy your applications to the cloud with one click. Support for Vercel, Netlify, and AWS."
    },
    {
      icon: LightBulbIcon,
      title: "Smart Templates",
      description: "Start with professional templates and customize them to your exact requirements."
    },
    {
      icon: BoltIcon,
      title: "Real-time Collaboration",
      description: "Work with your team in real-time with live editing and instant feedback."
    },
    {
      icon: ShieldCheckIcon,
      title: "Enterprise Security",
      description: "Bank-level security with compliance monitoring and automated security checks."
    },
    {
      icon: CloudIcon,
      title: "Cloud Integration",
      description: "Seamlessly integrate with popular cloud services and APIs."
    }
  ]

  const stats = [
    { number: "10K+", label: "Developers" },
    { number: "50K+", label: "Projects Created" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" }
  ]

  const testimonials = [
    {
      content: "AI Code Studio has revolutionized how we build applications. What used to take weeks now takes hours.",
      author: "Sarah Chen",
      role: "CTO at TechFlow",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b12a7f2c?w=64&h=64&fit=crop&crop=face"
    },
    {
      content: "The AI agents are incredibly smart. They understand context and generate exactly what I need.",
      author: "Marcus Rodriguez",
      role: "Full Stack Developer",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face"
    },
    {
      content: "Our team productivity has increased by 300% since switching to AI Code Studio.",
      author: "Emily Watson",
      role: "Engineering Manager",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face"
    }
  ]

  const pricingPlans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for individual developers and small projects",
      features: [
        "5 AI-powered projects",
        "Basic templates",
        "Community support",
        "Standard deployment"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      description: "Ideal for professional developers and growing teams",
      features: [
        "Unlimited projects",
        "Premium templates",
        "Priority support",
        "Advanced deployment",
        "Team collaboration",
        "Custom integrations"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations with advanced requirements",
      features: [
        "Everything in Pro",
        "Dedicated support",
        "Custom AI models",
        "Enterprise security",
        "SLA guarantee",
        "Custom integrations"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ]

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Build Amazing Apps with{' '}
                <span className="text-gradient bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                  AI Tempo
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                From concept to deployment in minutes. Our AI-powered platform helps you build 
                production-ready applications faster than ever before.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <Link
                to="/signup"
                className="btn-primary text-lg px-8 py-4 flex items-center justify-center space-x-2"
              >
                <span>Start Building</span>
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <button className="btn-outline text-lg px-8 py-4 flex items-center justify-center space-x-2">
                <PlayIcon className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-gray-900">
                    {stat.number}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to build faster
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to accelerate your development workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card hover-lift"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by developers worldwide
            </h2>
            <div className="flex justify-center items-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
              <span className="ml-2 text-gray-600">4.9/5 from 2,000+ reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6">"{testimonial.content}"</p>
                <div className="flex items-center space-x-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that's right for you. Always know what you'll pay.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`card relative ${plan.popular ? 'ring-2 ring-primary-600' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-gray-600">{plan.period}</span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan.name === 'Enterprise' ? '/contact' : '/signup'}
                  className={`w-full text-center ${
                    plan.popular 
                      ? 'btn-primary' 
                      : 'btn-outline'
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to build something amazing?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of developers who are already building the future with AI Code Studio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-white text-primary-600 hover:bg-gray-100 font-medium px-8 py-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <span>Start Building for Free</span>
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <Link
                to="/templates"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-medium px-8 py-4 rounded-lg transition-colors duration-200"
              >
                Explore Templates
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  )
}

export default HomePage