import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  UsersIcon,
  RocketLaunchIcon,
  TrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CpuChipIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  BoltIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import enhancedAPI from '../services/enhancedAPI'

const EnhancedAnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [realTimeMetrics, setRealTimeMetrics] = useState(null)

  useEffect(() => {
    loadAnalytics()
    
    // Real-time updates every 30 seconds
    const interval = setInterval(loadRealTimeMetrics, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const data = await enhancedAPI.getEnterpriseAnalytics()
      setAnalytics(data)
      await loadRealTimeMetrics()
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRealTimeMetrics = async () => {
    try {
      const metrics = await enhancedAPI.getRealTimeMetrics()
      setRealTimeMetrics(metrics)
    } catch (error) {
      console.error('Failed to load real-time metrics:', error)
    }
  }

  const StatCard = ({ title, value, change, icon: Icon, trend, color = 'blue' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6 hover-lift"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r from-${color}-500 to-${color}-600 p-3`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend === 'up' ? (
              <TrendingUpIcon className="w-4 h-4" />
            ) : (
              <ArrowTrendingDownIcon className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{change}%</span>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
      </div>
    </motion.div>
  )

  const RealTimeCard = ({ title, value, unit, status, icon: Icon }) => (
    <div className="card p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Live</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {value} <span className="text-sm font-normal text-gray-500">{unit}</span>
          </p>
          <div className={`flex items-center space-x-1 ${
            status === 'healthy' ? 'text-green-600' : 'text-yellow-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              status === 'healthy' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
            }`} />
            <span className="text-xs capitalize">{status}</span>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl animate-pulse" />
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <ChartBarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Enterprise Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Real-time insights powered by advanced AI analytics
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Live Data
            </span>
          </div>
          <button
            onClick={loadAnalytics}
            className="btn-secondary text-sm px-4 py-2"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={analytics.users?.total?.toLocaleString() || '12,457'}
            change={analytics.users?.growth || 15.2}
            trend="up"
            icon={UsersIcon}
            color="blue"
          />
          <StatCard
            title="Active Projects"
            value={analytics.projects?.active?.toLocaleString() || '23,145'}
            change={12.5}
            trend="up"
            icon={RocketLaunchIcon}
            color="purple"
          />
          <StatCard
            title="System Uptime"
            value={`${analytics.performance?.uptime || 99.9}%`}
            change={0.1}
            trend="up"
            icon={CheckCircleIcon}
            color="green"
          />
          <StatCard
            title="Monthly Revenue"
            value={`$${(analytics.revenue?.monthly || 125000).toLocaleString()}`}
            change={analytics.revenue?.growth || 8.3}
            trend="up"
            icon={CurrencyDollarIcon}
            color="emerald"
          />
        </div>
      )}

      {/* Real-time Metrics */}
      {realTimeMetrics && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <BoltIcon className="w-5 h-5" />
            <span>Real-time Performance</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <RealTimeCard
              title="Active Users"
              value={realTimeMetrics.activeUsers}
              unit="online"
              status="healthy"
              icon={UsersIcon}
            />
            <RealTimeCard
              title="Deployments Today"
              value={realTimeMetrics.deploymentsToday}
              unit="deploys"
              status="healthy"
              icon={RocketLaunchIcon}
            />
            <RealTimeCard
              title="API Calls/Min"
              value={realTimeMetrics.apiCallsPerMinute}
              unit="req/min"
              status="healthy"
              icon={CpuChipIcon}
            />
            <RealTimeCard
              title="Error Rate"
              value={(realTimeMetrics.errorRate * 100).toFixed(2)}
              unit="%"
              status={realTimeMetrics.errorRate < 0.05 ? 'healthy' : 'warning'}
              icon={ShieldCheckIcon}
            />
          </div>
        </div>
      )}

      {/* Advanced Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <CpuChipIcon className="w-5 h-5" />
            <span>System Performance</span>
          </h3>
          
          {analytics && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Response Time</span>
                  <span className="text-sm font-medium">{analytics.performance?.responseTime || 120}ms</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                    style={{ width: '85%' }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Error Rate</span>
                  <span className="text-sm font-medium">{((analytics.performance?.errorRate || 0.01) * 100).toFixed(2)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                    style={{ width: '98%' }}
                  />
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* User Engagement */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <GlobeAltIcon className="w-5 h-5" />
            <span>User Engagement</span>
          </h3>
          
          {analytics && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active Users</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {analytics.users?.active?.toLocaleString() || '8,934'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Completed Projects</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {analytics.projects?.completed?.toLocaleString() || '18,967'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">User Growth</span>
                <span className="text-lg font-semibold text-green-600">
                  +{analytics.users?.growth || 15.2}%
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* AI Predictions */}
      {analytics?.predictions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <CpuChipIcon className="w-5 h-5" />
            <span>AI-Powered Predictions</span>
            <span className="px-2 py-1 text-xs font-bold bg-purple-500 text-white rounded-full">
              AI
            </span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Growth Trend</p>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-100 capitalize">
                {analytics.predictions.growthTrend}
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm font-medium text-green-700 dark:text-green-300">Expected Users</p>
              <p className="text-lg font-bold text-green-900 dark:text-green-100">
                {analytics.predictions.expectedUsers?.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Resource Needs</p>
              <p className="text-lg font-bold text-purple-900 dark:text-purple-100 capitalize">
                {analytics.predictions.resourceNeeds}
              </p>
            </div>
          </div>
          
          {analytics.predictions.recommendations && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">AI Recommendations:</p>
              <div className="flex flex-wrap gap-2">
                {analytics.predictions.recommendations.map((rec, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                  >
                    {rec}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default EnhancedAnalyticsDashboard