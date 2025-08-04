import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BoltIcon,
  CpuChipIcon,
  ServerIcon,
  CircleStackIcon, // DatabaseIcon replacement
  CloudIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'

const UsageDashboard = () => {
  const { isAuthenticated } = useAuthStore()
  const [usageData, setUsageData] = useState(null)
  const [trialStatus, setTrialStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUsageData = async () => {
      if (!isAuthenticated) return
      
      try {
        setLoading(true)
        
        // Load current usage stats
        const usageResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/subscription/usage`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (usageResponse.ok) {
          const usage = await usageResponse.json()
          setUsageData(usage)
        }

        // Load trial status
        const trialResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/subscription/trial/status`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (trialResponse.ok) {
          const trial = await trialResponse.json()
          setTrialStatus(trial)
        }
      } catch (error) {
        console.error('Failed to load usage data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUsageData()
  }, [isAuthenticated])

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString()
  }

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 75) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <BoltIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Login Required
        </h3>
        <p className="text-gray-600">
          Please login to view your usage dashboard
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!usageData && !trialStatus) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Subscription Found
        </h3>
        <p className="text-gray-600 mb-4">
          Start your 7-day free trial to access AI features
        </p>
        <a 
          href="/subscription"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <SparklesIcon className="w-4 h-4 mr-2" />
          Start Free Trial
        </a>
      </div>
    )
  }

  const usageItems = [
    {
      key: 'tokens_used',
      name: 'AI Tokens',
      icon: CpuChipIcon,
      current: usageData?.current_usage?.tokens_used || 0,
      limit: usageData?.limits?.tokens_per_month || 50000,
      unit: 'tokens',
      description: 'Used for AI model interactions'
    },
    {
      key: 'projects_created',
      name: 'Projects',
      icon: ServerIcon,
      current: usageData?.current_usage?.projects_created || 0,
      limit: usageData?.limits?.max_projects || 3,
      unit: 'projects',
      description: 'Number of projects created'
    },
    {
      key: 'storage_used',
      name: 'Storage',
      icon: CircleStackIcon, // Updated from DatabaseIcon
      current: usageData?.current_usage?.storage_used || 0,
      limit: usageData?.limits?.storage_gb || 0.5,
      unit: 'GB',
      description: 'File and data storage used'
    },
    {
      key: 'bandwidth_used',
      name: 'Bandwidth',
      icon: CloudIcon,
      current: usageData?.current_usage?.bandwidth_used || 0,
      limit: usageData?.limits?.bandwidth_gb || 5,
      unit: 'GB',
      description: 'Data transfer used'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Trial Status Card */}
      {trialStatus?.is_trial_active && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ClockIcon className="w-8 h-8" />
              <div>
                <h3 className="text-xl font-bold">Free Trial Active</h3>
                <p className="text-blue-100">
                  {trialStatus.trial_days_remaining} days remaining
                </p>
              </div>
            </div>
            <a 
              href="/subscription"
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Upgrade Now
            </a>
          </div>
        </motion.div>
      )}

      {/* Usage Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-2" />
            Usage Overview
          </h2>
          {trialStatus?.is_trial_active && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              Trial Period
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {usageItems.map((item) => {
            const Icon = item.icon
            const percentage = item.limit > 0 ? Math.min((item.current / item.limit) * 100, 100) : 0
            
            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${getUsageColor(percentage)}`}>
                    {percentage.toFixed(0)}%
                  </span>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>
                      {formatNumber(item.current)} / {item.limit === -1 ? '∞' : formatNumber(item.limit)} {item.unit}
                    </span>
                    {item.limit > 0 && item.current < item.limit && (
                      <span className="text-gray-500">
                        {formatNumber(item.limit - item.current)} remaining
                      </span>
                    )}
                  </div>
                  
                  {item.limit > 0 ? (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(percentage)}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  ) : (
                    <div className="w-full bg-green-100 rounded-full h-2">
                      <div className="h-2 rounded-full bg-green-500 w-full" />
                    </div>
                  )}
                </div>

                {percentage >= 90 && item.limit > 0 && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">Usage limit almost reached</span>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Billing Cycle Info */}
      {usageData && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Current Billing Cycle
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Cycle Started</p>
                <p className="font-medium text-gray-900">
                  {new Date(usageData.billing_cycle_start).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ClockIcon className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">
                  {trialStatus?.is_trial_active ? 'Trial Ends' : 'Next Billing'}
                </p>
                <p className="font-medium text-gray-900">
                  {new Date(usageData.billing_cycle_end).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade CTA */}
      {trialStatus?.is_trial_active && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">Enjoying your trial?</h3>
          <p className="text-purple-100 mb-4">
            Upgrade to a paid plan to continue accessing AI features after your trial ends
          </p>
          <a 
            href="/subscription"
            className="inline-flex items-center px-6 py-3 bg-white text-purple-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <SparklesIcon className="w-5 h-5 mr-2" />
            View Plans & Upgrade
          </a>
        </div>
      )}
    </div>
  )
}

export default UsageDashboard