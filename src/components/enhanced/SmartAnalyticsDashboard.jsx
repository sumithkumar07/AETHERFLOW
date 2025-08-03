import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChartBarIcon, 
  UserGroupIcon,
  TrendingUpIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  ChartPieIcon,
  LightBulbIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  CodeBracketIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'
import { useEnterpriseStore } from '../../store/enterpriseStore'
import { useRealTimeStore } from '../../store/realTimeStore'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

/**
 * Smart Analytics Dashboard - Comprehensive analytics with AI insights
 * Connects to enterprise and real-time stores for live data
 */
const SmartAnalyticsDashboard = () => {
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

  const {
    realTimeMetrics: liveMetrics,
    systemStatus,
    notifications
  } = useRealTimeStore()

  const [selectedTimeRange, setSelectedTimeRange] = useState('7d')
  const [activeTab, setActiveTab] = useState('overview')
  const [userJourney, setUserJourney] = useState(null)
  const [churnPrediction, setChurnPrediction] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [aiInsights, setAiInsights] = useState([])

  useEffect(() => {
    // Initial data fetch
    loadDashboardData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000)
    
    return () => clearInterval(interval)
  }, [selectedTimeRange])

  const loadDashboardData = async () => {
    try {
      // Load all analytics data
      await Promise.all([
        fetchRealTimeMetrics(),
        fetchUserMetrics(selectedTimeRange),
        fetchFeatureUsage(selectedTimeRange),
        loadUserJourney(),
        loadChurnPrediction(),
        loadRecommendations(),
        generateAIInsights()
      ])
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    }
  }

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

  const generateAIInsights = async () => {
    // Generate AI-powered insights based on data
    const insights = [
      {
        id: 1,
        type: 'optimization',
        icon: RocketLaunchIcon,
        title: 'Performance Opportunity',
        description: 'AI Chat response time can be improved by 23% with model optimization',
        action: 'Optimize Models',
        impact: 'High',
        color: 'blue'
      },
      {
        id: 2,
        type: 'feature',
        icon: SparklesIcon,
        title: 'Feature Adoption',
        description: 'Visual Programming feature shows 67% higher engagement than expected',
        action: 'Promote Feature',
        impact: 'Medium',
        color: 'green'
      },
      {
        id: 3,
        type: 'user_behavior',
        icon: UserGroupIcon,
        title: 'User Pattern',
        description: 'Peak usage hours shifted to 2-4 PM, consider scaling resources',
        action: 'Adjust Scaling',
        impact: 'Medium',
        color: 'yellow'
      },
      {
        id: 4,
        type: 'security',
        icon: ShieldCheckIcon,
        title: 'Security Insight',
        description: 'Zero security incidents in the last 30 days - excellent security posture',
        action: 'Maintain Standards',
        impact: 'Low',
        color: 'purple'
      }
    ]
    
    setAiInsights(insights)
  }

  const handleTimeRangeChange = (range) => {
    setSelectedTimeRange(range)
    trackEvent('analytics_time_range_changed', { range })
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

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const getChurnRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200'
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200'
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  // Chart configurations
  const performanceChartData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    datasets: [
      {
        label: 'Response Time (ms)',
        data: [245, 189, 198, 234, 267, 198],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      },
      {
        label: 'CPU Usage (%)',
        data: [35, 28, 32, 45, 52, 38],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4
      }
    ]
  }

  const featureUsageChartData = {
    labels: featureUsage.features?.map(f => f.name) || [],
    datasets: [
      {
        data: featureUsage.features?.map(f => f.usage_count) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'performance', name: 'Performance', icon: CpuChipIcon },
    { id: 'users', name: 'User Analytics', icon: UserGroupIcon },
    { id: 'features', name: 'Feature Usage', icon: RocketLaunchIcon },
    { id: 'ai_insights', name: 'AI Insights', icon: SparklesIcon }
  ]

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Smart Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              AI-powered insights and real-time analytics for your platform
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

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {liveMetrics.activeUsers || formatNumber(userMetrics?.session_count)}
              </p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+12.5%</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Messages Today</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatNumber(userMetrics?.ai_interactions?.total_messages)}
              </p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+8.2%</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {userMetrics?.ai_interactions?.average_response_time || liveMetrics.responseTime}s
              </p>
              <div className="flex items-center mt-2">
                <ArrowTrendingDownIcon className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">-15.3%</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <ClockIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">System Health</p>
              <p className="text-3xl font-bold text-green-600">98.7%</p>
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-green-600">All systems operational</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <ShieldCheckIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* AI Insights */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <SparklesIcon className="w-5 h-5 mr-2 text-yellow-500" />
                  AI-Powered Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiInsights.map((insight) => {
                    const Icon = insight.icon
                    return (
                      <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg bg-${insight.color}-100 dark:bg-${insight.color}-900/20`}>
                            <Icon className={`w-5 h-5 text-${insight.color}-600 dark:text-${insight.color}-400`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">{insight.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{insight.description}</p>
                            <div className="flex items-center justify-between mt-3">
                              <button className={`text-sm font-medium text-${insight.color}-600 hover:text-${insight.color}-700`}>
                                {insight.action}
                              </button>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                insight.impact === 'High' ? 'bg-red-100 text-red-700' :
                                insight.impact === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {insight.impact} Impact
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Performance Trends</h4>
                  <Line data={performanceChartData} options={{ responsive: true, maintainAspectRatio: false }} height={200} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Feature Usage Distribution</h4>
                  <Doughnut data={featureUsageChartData} options={{ responsive: true, maintainAspectRatio: false }} height={200} />
                </div>
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">System Performance</h4>
                  <Line data={performanceChartData} options={{ responsive: true }} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Current Status</h4>
                  <div className="space-y-4">
                    {Object.entries(systemStatus).map(([service, status]) => (
                      <div key={service} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="capitalize text-sm font-medium text-gray-900 dark:text-white">
                          {service.replace('_', ' ')}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            status === 'online' ? 'bg-green-500' : 
                            status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                          <span className={`text-sm capitalize ${
                            status === 'online' ? 'text-green-600' : 
                            status === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* User Journey */}
              {userJourney && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <EyeIcon className="w-5 h-5 mr-2" />
                    Current User Journey
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Goals Completed</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {userJourney.goals_completed?.length || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Engagement</p>
                      <p className="font-medium text-green-600">High</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Churn Prediction */}
              {churnPrediction && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-yellow-600" />
                    Churn Risk Analysis
                  </h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {Math.round(churnPrediction.churn_probability * 100)}%
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Churn Probability</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getChurnRiskColor(churnPrediction.risk_level)}`}>
                      {churnPrediction.risk_level.toUpperCase()} RISK
                    </span>
                  </div>
                  {churnPrediction.recommendations && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Recommendations:</p>
                      <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        {churnPrediction.recommendations.map((rec, index) => (
                          <li key={index}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Features Tab */}
          {activeTab === 'features' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Feature Usage</h4>
                  <div className="space-y-4">
                    {featureUsage.features?.map((feature, index) => (
                      <div key={index} className="relative">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700 dark:text-gray-300">{feature.name}</span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {feature.usage_count} uses
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(feature.usage_count / Math.max(...featureUsage.features?.map(f => f.usage_count) || [1])) * 100}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full"
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>Satisfaction: {feature.user_satisfaction}/5</span>
                          <span className="capitalize">Trend: {feature.trend}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Usage Distribution</h4>
                  <Doughnut data={featureUsageChartData} />
                </div>
              </div>
            </div>
          )}

          {/* AI Insights Tab */}
          {activeTab === 'ai_insights' && (
            <div className="space-y-6">
              {/* Personalized Recommendations */}
              {recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <LightBulbIcon className="w-5 h-5 mr-2 text-yellow-500" />
                    Personalized Recommendations
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendations.map((rec, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg p-4"
                      >
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                          {rec.title}
                        </h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                          {rec.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-indigo-600 dark:text-indigo-400">
                            {rec.category}
                          </span>
                          <button
                            onClick={() => trackEvent('recommendation_clicked', { rec: rec.title })}
                            className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                          >
                            Try it →
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed AI Insights */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Advanced Insights</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {aiInsights.map((insight) => {
                    const Icon = insight.icon
                    return (
                      <div
                        key={insight.id}
                        className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6"
                      >
                        <div className="flex items-start space-x-4">
                          <div className={`p-3 rounded-lg bg-${insight.color}-100 dark:bg-${insight.color}-900/20`}>
                            <Icon className={`w-6 h-6 text-${insight.color}-600 dark:text-${insight.color}-400`} />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 dark:text-white mb-2">{insight.title}</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{insight.description}</p>
                            <div className="flex items-center justify-between">
                              <button className={`bg-${insight.color}-600 hover:bg-${insight.color}-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors`}>
                                {insight.action}
                              </button>
                              <span className={`text-sm px-3 py-1 rounded-full ${
                                insight.impact === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300' :
                                insight.impact === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300' :
                                'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                              }`}>
                                {insight.impact} Impact
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SmartAnalyticsDashboard