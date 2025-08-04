import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CreditCardIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  BoltIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import UsageDashboard from '../components/UsageDashboard'
import toast from 'react-hot-toast'

const SubscriptionDashboard = () => {
  const { user, token } = useAuthStore()
  const [subscription, setSubscription] = useState(null)
  const [usage, setUsage] = useState(null)
  const [warnings, setWarnings] = useState([])
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)

  useEffect(() => {
    if (user && token) {
      fetchSubscriptionData()
      fetchUsageData()
      fetchWarnings()
    }
  }, [user, token])

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/subscription/current`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSubscription(data)
      } else if (response.status === 404) {
        setSubscription(null) // No subscription found
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
    }
  }

  const fetchUsageData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/subscription/usage`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsage(data)
      }
    } catch (error) {
      console.error('Failed to fetch usage:', error)
    }
  }

  const fetchWarnings = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/subscription/usage/warnings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setWarnings(data.warnings || [])
      }
    } catch (error) {
      console.error('Failed to fetch warnings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (newPlan) => {
    setUpgrading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/subscription/upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ new_plan: newPlan })
      })
      
      if (response.ok) {
        toast.success('Subscription upgraded successfully!')
        await fetchSubscriptionData()
        await fetchUsageData()
      } else {
        const error = await response.json()
        toast.error(error.detail || 'Failed to upgrade subscription')
      }
    } catch (error) {
      toast.error('Failed to upgrade subscription')
    } finally {
      setUpgrading(false)
    }
  }

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600 bg-red-100'
    if (percentage >= 75) return 'text-orange-600 bg-orange-100'
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  const getProgressBarColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-orange-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const formatUsageValue = (value, type) => {
    if (type === 'tokens_per_month') {
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
      return value.toString()
    }
    return value.toString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-spin">
            <BoltIcon className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Loading subscription data...</p>
        </div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <CreditCardIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Active Subscription</h2>
          <p className="text-gray-600 mb-6">You need an active subscription to use Aether AI features.</p>
          <button
            onClick={() => window.location.href = '/subscription'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Choose a Plan
          </button>
        </div>
      </div>
    )
  }

  const planConfig = subscription.plan_config || {}

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Subscription Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your Aether AI subscription and monitor usage</p>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="mb-8">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
              <div className="flex">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Usage Warnings ({warnings.length})
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    {warnings.map((warning, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span>•</span>
                        <span>{warning.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Plan */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  subscription.status === 'active' ? 'bg-green-100 text-green-800' : 
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {subscription.status}
                </div>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 capitalize">
                  {subscription.plan} Plan
                </h3>
                <div className="text-3xl font-bold text-blue-600 mt-2">
                  ${planConfig.price_monthly || 0}
                  <span className="text-sm font-normal text-gray-500">/month</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  <span>Billing: {subscription.billing_interval}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  <span>Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}</span>
                </div>
              </div>

              {subscription.plan !== 'enterprise' && (
                <div className="mt-6">
                  <button
                    onClick={() => handleUpgrade(subscription.plan === 'basic' ? 'professional' : 'enterprise')}
                    disabled={upgrading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center"
                  >
                    {upgrading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <ArrowUpIcon className="w-4 h-4 mr-2" />
                        Upgrade Plan
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Usage Statistics</h2>
                <div className="text-sm text-gray-500">
                  Current billing period
                </div>
              </div>

              {usage && (
                <div className="space-y-6">
                  {Object.entries(usage.usage_percentage).map(([key, percentage]) => {
                    const limit = usage.limits[key]
                    const current = usage.current_usage[`${key}_used`] || 0
                    const displayKey = key.replace('_', ' ').replace('per month', '/month').toUpperCase()
                    
                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">{displayKey}</span>
                          <span className={`text-sm px-2 py-1 rounded-full ${getUsageColor(percentage)}`}>
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(percentage)}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{formatUsageValue(current, key)} used</span>
                          <span>
                            {limit === -1 ? 'Unlimited' : `${formatUsageValue(limit, key)} limit`}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => window.location.href = '/subscription/billing'}
                  className="flex items-center justify-center space-x-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-3 rounded-lg transition-colors"
                >
                  <CurrencyDollarIcon className="w-5 h-5" />
                  <span>Billing History</span>
                </button>
                <button
                  onClick={() => window.location.href = '/subscription/analytics'}
                  className="flex items-center justify-center space-x-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-3 rounded-lg transition-colors"
                >
                  <ChartBarIcon className="w-5 h-5" />
                  <span>Usage Analytics</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Usage Dashboard */}
        <div className="mt-8">
          <UsageDashboard />
        </div>
      </div>
    </div>
  )
}

export default SubscriptionDashboard