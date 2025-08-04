import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CheckIcon,
  XMarkIcon,
  StarIcon,
  BoltIcon,
  ShieldCheckIcon,
  CubeTransparentIcon,
  UserGroupIcon,
  ChartBarIcon,
  CloudIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const Subscription = () => {
  const { isAuthenticated, user } = useAuthStore()
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [loading, setLoading] = useState(false)

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: { monthly: 19, yearly: 190 },
      description: 'Perfect for individual developers getting started',
      features: [
        '500K AI Tokens/month',
        '10 Projects maximum',
        'Basic AI Models',
        'Email Support', 
        'Basic Templates (10)',
        'Basic Integrations (5)',
        '1GB Storage',
        'Community Access'
      ],
      limitations: [],
      popular: false,
      current: false,
      color: 'border-gray-200',
      buttonColor: 'btn-secondary'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: { monthly: 49, yearly: 490 },
      description: 'Advanced features for professional developers and small teams',
      features: [
        'Everything in Basic',
        '2M AI Tokens/month',
        '50 Projects maximum',
        '5 Team Members',
        'Advanced AI Models',
        'Priority Support',
        'Advanced Templates (50+)',
        'Advanced Integrations (50+)',
        '10GB Storage',
        'API Access',
        'Custom Domains',
        'Advanced Analytics'
      ],
      limitations: [],
      popular: true,
      current: false,
      color: 'border-primary-500',
      buttonColor: 'btn-primary'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: { monthly: 179, yearly: 1790 },
      description: 'Complete solution for teams and organizations',
      features: [
        'Everything in Professional',
        '10M AI Tokens/month',
        'Unlimited Projects',
        'Unlimited Team Members',
        'Premium AI Models',
        'Dedicated Account Manager',
        '24/7 Priority Support',
        'Custom AI Training',
        'Unlimited Integrations',
        '100GB Storage',
        'Enterprise Analytics',
        'SSO & Audit Logs',
        'SLA Guarantees',
        'Custom Deployment'
      ],
      limitations: [],
      popular: false,
      current: false,
      color: 'border-purple-500',
      buttonColor: 'btn-primary'
    }
  ]

  const features = [
    {
      category: 'AI & Development',
      items: [
        { name: 'AI Tokens/Month', basic: '500K', professional: '2M', enterprise: '10M' },
        { name: 'AI Models Available', basic: 'Basic (4)', professional: 'Advanced (10+)', enterprise: 'Premium + Custom' },
        { name: 'Code Generation', basic: true, professional: true, enterprise: true },
        { name: 'Custom AI Training', basic: false, professional: false, enterprise: true },
        { name: 'Multi-Agent System', basic: false, professional: 'Basic', enterprise: 'Advanced' }
      ]
    },
    {
      category: 'Projects & Templates',
      items: [
        { name: 'Max Projects', basic: '10', professional: '50', enterprise: 'Unlimited' },
        { name: 'Templates Available', basic: '10 Basic', professional: '50+ Advanced', enterprise: 'Unlimited + Custom' },
        { name: 'Custom Templates', basic: false, professional: true, enterprise: true },
        { name: 'Project Analytics', basic: 'Basic', professional: 'Advanced', enterprise: 'Enterprise' }
      ]
    },
    {
      category: 'Integrations & Storage',
      items: [
        { name: 'Integrations', basic: '5 Basic', professional: '50 Advanced', enterprise: 'Unlimited' },
        { name: 'Storage Space', basic: '1GB', professional: '10GB', enterprise: '100GB' },
        { name: 'API Access', basic: false, professional: true, enterprise: true },
        { name: 'Custom Domains', basic: false, professional: true, enterprise: true }
      ]
    },
    {
      category: 'Team & Collaboration',
      items: [
        { name: 'Team Members', basic: '1', professional: '5', enterprise: 'Unlimited' },
        { name: 'Real-time Collaboration', basic: false, professional: true, enterprise: true },
        { name: 'Role-based Access', basic: false, professional: 'Basic', enterprise: 'Advanced' },
        { name: 'Team Analytics', basic: false, professional: true, enterprise: true }
      ]
    },
    {
      category: 'Support & Security',
      items: [
        { name: 'Support Level', basic: 'Email', professional: 'Priority Email', enterprise: 'Dedicated Manager' },
        { name: '24/7 Support', basic: false, professional: false, enterprise: true },
        { name: 'Enterprise Security', basic: false, professional: 'Basic', enterprise: 'Advanced' },
        { name: 'SSO & Audit Logs', basic: false, professional: false, enterprise: true },
        { name: 'SLA Guarantee', basic: false, professional: false, enterprise: true }
      ]
    }
  ]

  const formatFeatureValue = (value) => {
    if (value === true) return <CheckIcon className="w-5 h-5 text-green-500" />
    if (value === false) return <XMarkIcon className="w-5 h-5 text-gray-300" />
    return <span className="text-sm text-gray-700">{value}</span>
  }

  const handleSubscribe = async (planId) => {
    if (!isAuthenticated) {
      toast.error('Please login to subscribe')
      return
    }

    setLoading(true)
    try {
      // TODO: Integrate with Lemon Squeezy when ready
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/subscription/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          plan: planId,
          billing_interval: billingCycle === 'yearly' ? 'yearly' : 'monthly'
        })
      })

      if (response.ok) {
        toast.success(`Successfully subscribed to ${plans.find(p => p.id === planId)?.name} plan!`)
        // Redirect to billing dashboard or refresh user data
      } else {
        throw new Error('Failed to create subscription')
      }
    } catch (error) {
      console.error('Subscription error:', error)
      toast.error('Subscription system coming soon! We\'ll notify you when it\'s ready.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Choose Your Plan
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Scale your AI development with plans designed for every stage of your journey.
                From individual projects to enterprise solutions.
              </p>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center space-x-4 mb-8">
                <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
                  Monthly
                </span>
                <button
                  onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    billingCycle === 'yearly' ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
                  Yearly
                </span>
                {billingCycle === 'yearly' && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Save 20%
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative bg-white rounded-2xl shadow-sm border-2 ${plan.color} ${
                plan.popular ? 'shadow-lg scale-105' : ''
              } overflow-hidden`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-primary-600 text-white text-center py-2 text-sm font-medium">
                  Most Popular
                </div>
              )}

              <div className={`p-8 ${plan.popular ? 'pt-12' : ''}`}>
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      ${plan.price[billingCycle]}
                    </span>
                    <span className="text-gray-500 ml-2">
                      /{billingCycle === 'yearly' ? 'year' : 'month'}
                    </span>
                    {billingCycle === 'yearly' && plan.price.yearly > 0 && (
                      <div className="text-sm text-green-600 font-medium mt-1">
                        Save ${(plan.price.monthly * 12) - plan.price.yearly}/year
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading || plan.current}
                    className={`w-full ${plan.buttonColor} py-3 px-6 font-medium ${
                      plan.current ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : plan.current ? (
                      'Current Plan'
                    ) : plan.id === 'free' ? (
                      'Get Started Free'
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </button>
                </div>

                {/* Features List */}
                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3">
                      <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.limitations.map((limitation, limitationIndex) => (
                    <div key={limitationIndex} className="flex items-start space-x-3">
                      <XMarkIcon className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-500">{limitation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Compare All Features</h2>
            <p className="text-gray-600 mt-1">Detailed comparison of features across all plans</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Features
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Basic
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Professional
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {features.map((category, categoryIndex) => (
                  <React.Fragment key={categoryIndex}>
                    <tr className="bg-gray-50">
                      <td colSpan="4" className="px-6 py-3 text-sm font-semibold text-gray-900">
                        {category.category}
                      </td>
                    </tr>
                    {category.items.map((item, itemIndex) => (
                      <tr key={itemIndex}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {formatFeatureValue(item.basic)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {formatFeatureValue(item.professional)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {formatFeatureValue(item.enterprise)}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Enterprise CTA */}
        <div className="mt-16 bg-gradient-to-r from-primary-600 to-purple-700 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Need a Custom Solution?
          </h2>
          <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
            We offer custom enterprise solutions with dedicated support, 
            custom integrations, and tailored pricing for large organizations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary-600 hover:bg-gray-50 font-semibold px-6 py-3 rounded-lg transition-colors">
              Contact Sales
            </button>
            <button className="border border-white text-white hover:bg-white hover:text-primary-600 font-semibold px-6 py-3 rounded-lg transition-colors">
              Schedule Demo
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                question: "Can I change plans anytime?",
                answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."
              },
              {
                question: "Is there a free trial?",
                answer: "Our Developer plan is completely free forever. You can upgrade to paid plans when you need more features."
              },
              {
                question: "What AI models are included?",
                answer: "All plans include access to Puter.js AI with GPT-4.1 Nano, Claude Sonnet 4, Gemini 2.5 Flash, and GPT-4 models at no additional cost."
              },
              {
                question: "Do you offer refunds?",
                answer: "Yes, we offer a 30-day money-back guarantee on all paid plans. No questions asked."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Subscription