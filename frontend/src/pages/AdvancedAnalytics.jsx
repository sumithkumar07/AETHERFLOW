import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  CpuChipIcon,
  UserGroupIcon,
  ClockIcon,
  LightBulbIcon,
  TrendingUpIcon,
  EyeIcon,
  BoltIcon
} from '@heroicons/react/24/outline'

const AdvancedAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/dashboard/analytics/dashboard?range=${timeRange}`)
      const data = await response.json()
      setAnalyticsData(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const StatCard = ({ icon: Icon, title, value, change, color = "blue" }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`card p-6 hover:scale-105 transition-all duration-300 border-l-4 border-${color}-500`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
              <ChartBarIcon className="w-4 h-4 mr-1" />
              {change > 0 ? '+' : ''}{change}% vs last period
            </p>
          )}
        </div>
        <div className={`p-3 bg-${color}-100 dark:bg-${color}-900/20 rounded-2xl`}>
          <Icon className={`w-8 h-8 text-${color}-600`} />
        </div>
      </div>
    </motion.div>
  )

  const RealtimeChart = ({ title, data, type = "line" }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <ChartBarIcon className="w-16 h-16 text-blue-500 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Interactive Chart</p>
          <p className="text-sm text-gray-500">Real-time data visualization</p>
        </div>
      </div>
    </motion.div>
  )

  const AIInsights = () => (
    <motion.div
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={CpuChipIcon}
          title="AI Requests"
          value="12,847"
          change={23.5}
          color="purple"
        />
        <StatCard
          icon={BoltIcon}
          title="Avg Response Time"
          value="1.2s"
          change={-15.3}
          color="green"
        />
        <StatCard
          icon={LightBulbIcon}
          title="Model Accuracy"
          value="94.2%"
          change={2.1}
          color="yellow"
        />
        <StatCard
          icon={TrendingUpIcon}
          title="Success Rate"
          value="98.7%"
          change={1.2}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RealtimeChart title="AI Model Performance" />
        <RealtimeChart title="Request Volume" />
      </div>

      {/* AI Model Router Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          🤖 Intelligent AI Router Performance
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { model: 'GPT-4o Mini', usage: '45%', performance: '98.2%', cost: '$12.34' },
            { model: 'Claude Sonnet', usage: '32%', performance: '96.8%', cost: '$23.67' },
            { model: 'Gemini Flash', usage: '23%', performance: '94.5%', cost: '$8.90' }
          ].map((model, index) => (
            <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-xl">
              <h4 className="font-semibold text-gray-900 dark:text-white">{model.model}</h4>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Usage</span>
                  <span className="text-sm font-medium">{model.usage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Performance</span>
                  <span className="text-sm font-medium text-green-600">{model.performance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cost</span>
                  <span className="text-sm font-medium">{model.cost}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )

  const UserBehavior = () => (
    <motion.div
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={UserGroupIcon}
          title="Active Users"
          value="2,847"
          change={12.3}
          color="blue"
        />
        <StatCard
          icon={ClockIcon}
          title="Avg Session"
          value="24m"
          change={8.7}
          color="indigo"
        />
        <StatCard
          icon={EyeIcon}
          title="Page Views"
          value="45,231"
          change={15.2}
          color="cyan"
        />
        <StatCard
          icon={BoltIcon}
          title="Engagement"
          value="87.3%"
          change={5.1}
          color="teal"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RealtimeChart title="User Journey Flow" />
        <RealtimeChart title="Feature Usage Heatmap" />
      </div>

      {/* Adaptive UI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          🎨 Adaptive UI Personalization
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">User Behavior Patterns</h4>
            {[
              { type: 'Power User', count: 342, percentage: 45 },
              { type: 'Regular User', count: 567, percentage: 35 },
              { type: 'Casual User', count: 234, percentage: 20 }
            ].map((pattern, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{pattern.type}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${pattern.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{pattern.count}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">Personalization Impact</h4>
            <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-xl">
              <div className="text-2xl font-bold text-green-600">+34%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">User Engagement Increase</div>
            </div>
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">-18%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Task Completion Time</div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )

  const SecurityInsights = () => (
    <motion.div
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={BoltIcon}
          title="Threats Blocked"
          value="127"
          change={-23.1}
          color="red"
        />
        <StatCard
          icon={EyeIcon}
          title="Security Score"
          value="98.9%"
          change={2.3}
          color="green"
        />
        <StatCard
          icon={UserGroupIcon}
          title="Verified Users"
          value="2,715"
          change={5.7}
          color="blue"
        />
        <StatCard
          icon={ClockIcon}
          title="Avg Auth Time"
          value="0.8s"
          change={-12.5}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RealtimeChart title="Security Events Timeline" />
        <RealtimeChart title="Compliance Status" />
      </div>

      {/* Zero Trust Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          🔒 Zero Trust Security Gateway
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
            <h4 className="font-semibold text-green-800 dark:text-green-400">Behavioral Analysis</h4>
            <p className="text-green-600 dark:text-green-300 text-2xl font-bold mt-2">Active</p>
            <p className="text-sm text-green-600 dark:text-green-400">Real-time monitoring</p>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
            <h4 className="font-semibold text-blue-800 dark:text-blue-400">Threat Detection</h4>
            <p className="text-blue-600 dark:text-blue-300 text-2xl font-bold mt-2">99.8%</p>
            <p className="text-sm text-blue-600 dark:text-blue-400">Accuracy rate</p>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
            <h4 className="font-semibold text-purple-800 dark:text-purple-400">Compliance</h4>
            <p className="text-purple-600 dark:text-purple-300 text-2xl font-bold mt-2">GDPR</p>
            <p className="text-sm text-purple-600 dark:text-purple-400">SOC2, HIPAA ready</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'ai', name: 'AI Insights', icon: CpuChipIcon },
    { id: 'users', name: 'User Behavior', icon: UserGroupIcon },
    { id: 'security', name: 'Security', icon: BoltIcon }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            📊 Advanced Analytics & Intelligence
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Real-time insights powered by AI and machine learning
          </p>
        </motion.div>

        {/* Time Range Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex space-x-2">
            {['24h', '7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  timeRange === range
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && <AIInsights />}
          {activeTab === 'ai' && <AIInsights />}
          {activeTab === 'users' && <UserBehavior />}
          {activeTab === 'security' && <SecurityInsights />}
        </div>
      </div>
    </div>
  )
}

export default AdvancedAnalytics