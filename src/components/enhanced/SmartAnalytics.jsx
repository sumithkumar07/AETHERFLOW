import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon, 
  UserGroupIcon,
  TrendingUpIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline'
import { useEnterpriseStore } from '../../store/enterpriseStore'

/**
 * Smart Analytics Component - Advanced analytics and insights
 * Connects to /api/analytics/* endpoints
 */
const SmartAnalytics = () => {
  const {
    realTimeMetrics,
    userMetrics,
    featureUsage,
    loading,
    error,
    fetchRealTimeMetrics,
    fetchUserMetrics,
    fetchFeatureUsage,
    trackEvent,
    fetchUserJourney,
    predictChurn,
    getPersonalizedRecommendations
  } = useEnterpriseStore()

  const [selectedTimeRange, setSelectedTimeRange] = useState('7d')
  const [userJourney, setUserJourney] = useState(null)
  const [churnPrediction, setChurnPrediction] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [refreshInterval, setRefreshInterval] = useState(null)

  useEffect(() => {
    // Initial data fetch
    fetchRealTimeMetrics()
    fetchUserMetrics(selectedTimeRange)
    fetchFeatureUsage(selectedTimeRange)
    loadUserJourney()
    loadChurnPrediction()
    loadRecommendations()

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchRealTimeMetrics()
    }, 10000)
    
    setRefreshInterval(interval)
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [selectedTimeRange])

  const loadUserJourney = async () => {
    const result = await fetchUserJourney()
    if (result.success) {
      setUserJourney(result.journey)
    }
  }

  const loadChurnPrediction = async () => {
    const result = await predictChurn()
    if (result.success) {
      setChurnPrediction(result.prediction)
    }
  }

  const loadRecommendations = async () => {
    const result = await getPersonalizedRecommendations()
    if (result.success) {
      setRecommendations(result.recommendations)
    }
  }

  const handleTimeRangeChange = (range) => {
    setSelectedTimeRange(range)
    fetchUserMetrics(range)
    fetchFeatureUsage(range)
  }

  const trackAnalyticsEvent = (eventType, data) => {
    trackEvent(eventType, data, { source: 'smart_analytics' })
  }

  const getChurnRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200'
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200'
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }
    return num?.toString()
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Smart Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              AI-powered insights and predictive analytics
            </p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600 dark:text-gray-300">Time Range:</label>
            <select
              value={selectedTimeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value)}
              className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="text-red-800 dark:text-red-200">{error}</div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Page Views
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatNumber(userMetrics?.page_views)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Sessions
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {userMetrics?.session_count}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Avg Session
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatDuration(userMetrics?.average_session_duration)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUpIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Engagement
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {userMetrics?.engagement_level?.toUpperCase()}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Feature Usage */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Feature Usage Analytics
          </h2>
          
          {featureUsage.features && (
            <div className="space-y-4">
              {featureUsage.features.map((feature, index) => (
                <div key={index} className="relative">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{feature.name}</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {feature.usage_count} uses
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(feature.usage_count / Math.max(...featureUsage.features.map(f => f.usage_count))) * 100}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className="bg-indigo-600 h-2 rounded-full"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>Satisfaction: {feature.user_satisfaction}/5</span>
                    <span className="capitalize">Trend: {feature.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {featureUsage.recommendations && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Recommendations
              </h3>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                {featureUsage.recommendations.map((rec, index) => (
                  <li key={index}>• {rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* AI Interactions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            AI Interactions
          </h2>
          
          {userMetrics?.ai_interactions && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    {userMetrics.ai_interactions.total_messages}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Total Messages
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {userMetrics.ai_interactions.average_response_time}s
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Avg Response Time
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Models Used
                </h3>
                <div className="flex flex-wrap gap-2">
                  {userMetrics.ai_interactions.models_used?.map((model, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    >
                      {model}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Journey */}
        {userJourney && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              User Journey
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Session Duration</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDuration(userJourney.duration)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Pages Visited</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {userJourney.pages_visited?.length || 0}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Goals Completed</p>
                <div className="flex flex-wrap gap-2">
                  {userJourney.goals_completed?.map((goal, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    >
                      {goal}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Churn Prediction */}
        {churnPrediction && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Churn Risk Analysis
            </h2>
            
            <div className="text-center mb-4">
              <div className="text-3xl font-bold mb-2">
                {Math.round(churnPrediction.churn_probability * 100)}%
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${getChurnRiskColor(churnPrediction.risk_level)}`}>
                {churnPrediction.risk_level.toUpperCase()} RISK
              </span>
            </div>

            {churnPrediction.recommendations && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Recommendations
                </h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  {churnPrediction.recommendations.map((rec, index) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Personalized Recommendations */}
      {recommendations.length > 0 && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Personalized Recommendations
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg"
              >
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  {rec.title}
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  {rec.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-indigo-600 dark:text-indigo-400">
                    {rec.category}
                  </span>
                  <button
                    onClick={() => trackAnalyticsEvent('recommendation_clicked', { rec: rec.title })}
                    className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Try it →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SmartAnalytics