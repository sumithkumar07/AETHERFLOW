import React, { useState, useEffect } from 'react'
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
  SparklesIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const Subscription = () => {
  const { isAuthenticated, user } = useAuthStore()
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [loading, setLoading] = useState(false)
  const [plans, setPlans] = useState([])
  const [currentSubscription, setCurrentSubscription] = useState(null)
  const [trialStatus, setTrialStatus] = useState(null)

  // Load plans and subscription data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load available plans
        const plansResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/subscription/plans`)
        const plansData = await plansResponse.json()
        
        // Transform plans to frontend format
        const transformedPlans = Object.entries(plansData.plans).map(([key, plan]) => ({
          id: key,
          name: plan.name,
          price: { 
            monthly: plan.price_monthly, 
            yearly: plan.price_yearly 
          },
          description: plan.description,
          features: Object.entries(plan.features).map(([featureKey, value]) => {
            // Format features for display
            switch(featureKey) {
              case 'tokens_per_month':
                return `${(value / 1000).toLocaleString()}K AI Tokens/month`
              case 'max_projects':
                return value === -1 ? 'Unlimited Projects' : `${value} Projects maximum`
              case 'max_team_members':
                return value === -1 ? 'Unlimited Team Members' : `${value} Team Member${value > 1 ? 's' : ''}`
              case 'integrations_limit':
                return value === -1 ? 'Unlimited Integrations' : `${value} Integrations`
              case 'support_level':
                return value === 'email' ? 'Email Support' : 
                       value === 'priority' ? 'Priority Support' : 
                       'Dedicated Account Manager'
              case 'ai_models':
                return `${value.length} AI Model${value.length > 1 ? 's' : ''}`
              case 'analytics':
                return `${value.charAt(0).toUpperCase() + value.slice(1)} Analytics`
              case 'api_access':
                return value ? 'API Access' : null
              case 'custom_domains':
                return value ? 'Custom Domains' : null
              case 'priority_support':
                return value ? 'Priority Support' : null
              case 'dedicated_manager':
                return value ? 'Dedicated Account Manager' : null
              case 'sso':
                return value ? 'SSO & Audit Logs' : null
              case 'audit_logs':
                return null // Combined with SSO
              default:
                return null
            }
          }).filter(Boolean),
          limitations: [],
          popular: key === 'professional',
          current: false,
          color: key === 'professional' ? 'border-primary-500' : 'border-gray-200',
          buttonColor: key === 'basic' ? 'btn-secondary' : 'btn-primary',
          trial: plan.trial || null
        }))

        setPlans(transformedPlans)

        // Load current subscription if authenticated
        if (isAuthenticated) {
          try {
            const subResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/subscription/current`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            })
            
            if (subResponse.ok) {
              const subData = await subResponse.json()
              setCurrentSubscription(subData)
            }
          } catch (error) {
            console.log('No current subscription found')
          }

          // Load trial status
          try {
            const trialResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/subscription/trial/status`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            })
            
            if (trialResponse.ok) {
              const trialData = await trialResponse.json()
              setTrialStatus(trialData)
            }
          } catch (error) {
            console.log('Could not load trial status')
          }
        }
      } catch (error) {
        console.error('Failed to load subscription data:', error)
        toast.error('Failed to load subscription data')
      }
    }

    loadData()
  }, [isAuthenticated])

  const handleSubscribe = async (planId) => {
    if (!isAuthenticated) {
      toast.error('Please login to subscribe')
      return
    }

    setLoading(true)
    try {
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

      const result = await response.json()

      if (response.ok) {
        toast.success(`Successfully subscribed to ${plans.find(p => p.id === planId)?.name} plan!`)
        
        // Reload subscription data
        const subResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/subscription/current`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (subResponse.ok) {
          const subData = await subResponse.json()
          setCurrentSubscription(subData)
        }
      } else {
        throw new Error(result.detail || 'Failed to create subscription')
      }
    } catch (error) {
      console.error('Subscription error:', error)
      toast.error(error.message || 'Subscription failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleTrialConvert = async (planId) => {
    if (!trialStatus?.is_trial_active) {
      toast.error('No active trial to convert')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/subscription/trial/convert`, {
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

      const result = await response.json()

      if (response.ok) {
        toast.success(`Trial successfully converted to ${plans.find(p => p.id === planId)?.name} plan!`)
        
        // Reload data
        window.location.reload()
      } else {
        throw new Error(result.detail || 'Failed to convert trial')
      }
    } catch (error) {
      console.error('Trial conversion error:', error)
      toast.error(error.message || 'Trial conversion failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getButtonText = (plan) => {
    if (loading) return 'Processing...'
    
    if (currentSubscription?.plan === plan.id) {
      return 'Current Plan'
    }
    
    if (trialStatus?.is_trial_active) {
      return `Convert Trial to ${plan.name}`
    }
    
    if (plan.id === 'basic' && !currentSubscription) {
      return 'Start Free Trial'
    }
    
    return `Upgrade to ${plan.name}`
  }

  const handleButtonClick = (plan) => {
    if (currentSubscription?.plan === plan.id) return

    if (trialStatus?.is_trial_active) {
      handleTrialConvert(plan.id)
    } else {
      handleSubscribe(plan.id)
    }
  }

  const features = [
    {
      category: 'AI & Development',
      items: [
        { name: 'AI Tokens/Month', basic: '50K (Trial: 50K/week)', professional: '2M', enterprise: '10M' },
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Trial Status Banner */}
      {trialStatus?.is_trial_active && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-center space-x-3">
              <ClockIcon className="w-5 h-5" />
              <span className="font-medium">
                🎉 Free Trial Active - {trialStatus.trial_days_remaining} days remaining
              </span>
              <span className="text-blue-100">|</span>
              <span className="text-sm">
                Convert to paid plan below to continue after trial
              </span>
            </div>
          </div>
        </div>
      )}

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
                Start with a 7-day free trial, then scale your AI development with plans designed for every stage of your journey.
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

              {plan.trial && plan.id === 'basic' && !currentSubscription && (
                <div className="absolute top-0 left-0 right-0 bg-green-600 text-white text-center py-2 text-sm font-medium">
                  Free 7-Day Trial
                </div>
              )}

              <div className={`p-8 ${plan.popular || (plan.trial && plan.id === 'basic' && !currentSubscription) ? 'pt-12' : ''}`}>
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  
                  <div className="mb-6">
                    {plan.id === 'basic' && !currentSubscription && plan.trial ? (
                      <div>
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          FREE
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                          7-day trial • {(plan.trial.tokens_per_week / 1000).toLocaleString()}K tokens
                        </div>
                        <div className="text-sm text-gray-500 mt-2">
                          Then ${plan.price[billingCycle]}/{billingCycle === 'yearly' ? 'year' : 'month'}
                        </div>
                      </div>
                    ) : (
                      <div>
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
                    )}
                  </div>

                  <button
                    onClick={() => handleButtonClick(plan)}
                    disabled={loading || (currentSubscription?.plan === plan.id)}
                    className={`w-full ${plan.buttonColor} py-3 px-6 font-medium ${
                      (currentSubscription?.plan === plan.id) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      getButtonText(plan)
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
                question: "How does the 7-day free trial work?",
                answer: "New users automatically get 7 days free access to our Basic plan with 50,000 AI tokens. No credit card required. After the trial, you can choose to upgrade to a paid plan."
              },
              {
                question: "Can I change plans anytime?",
                answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately with prorated billing."
              },
              {
                question: "How does token usage work?",
                answer: "Each plan includes a monthly token allowance for AI operations. Tokens reset monthly and unused tokens don't roll over."
              },
              {
                question: "What happens if I exceed my limits?",
                answer: "You'll receive warnings at 80% and 95% usage. At 100%, certain features may be temporarily limited until your next billing cycle or plan upgrade."
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