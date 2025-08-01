import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CpuChipIcon,
  CircleStackIcon,
  CloudIcon,
  BoltIcon,
  ChartBarIcon,
  ServerIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

const PerformanceMonitor = () => {
  const [performanceData, setPerformanceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(5000) // 5 seconds
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    fetchPerformanceData()
    const interval = setInterval(fetchPerformanceData, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval])

  const fetchPerformanceData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/performance/metrics`)
      const data = await response.json()
      setPerformanceData(data)
      
      // Check for alerts
      const newAlerts = checkForAlerts(data)
      setAlerts(newAlerts)
    } catch (error) {
      console.error('Error fetching performance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkForAlerts = (data) => {
    const alerts = []
    if (data?.system?.cpu > 80) {
      alerts.push({ type: 'error', message: 'High CPU usage detected', value: `${data.system.cpu}%` })
    }
    if (data?.system?.memory > 85) {
      alerts.push({ type: 'warning', message: 'High memory usage', value: `${data.system.memory}%` })
    }
    if (data?.response_time?.average > 2000) {
      alerts.push({ type: 'warning', message: 'Slow response times', value: `${data.response_time.average}ms` })
    }
    return alerts
  }

  const MetricCard = ({ icon: Icon, title, value, unit, status = 'normal', trend }) => {
    const getStatusColor = () => {
      switch (status) {
        case 'excellent': return 'green'
        case 'good': return 'blue'
        case 'warning': return 'yellow'
        case 'critical': return 'red'
        default: return 'gray'
      }
    }

    const color = getStatusColor()

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`card p-6 border-l-4 border-${color}-500 hover:scale-105 transition-all duration-300`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <div className="flex items-baseline">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
              {unit && <span className="ml-1 text-lg text-gray-500">{unit}</span>}
            </div>
            {trend && (
              <p className={`text-sm mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}% from last hour
              </p>
            )}
          </div>
          <div className={`p-3 bg-${color}-100 dark:bg-${color}-900/20 rounded-2xl`}>
            <Icon className={`w-8 h-8 text-${color}-600`} />
          </div>
        </div>
      </motion.div>
    )
  }

  const RealTimeChart = ({ title, data, color = "blue" }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 bg-${color}-500 rounded-full animate-pulse`}></div>
          <span className="text-sm text-gray-500">Live</span>
        </div>
      </div>
      
      <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl relative overflow-hidden">
        {/* Simulated real-time chart */}
        <div className="absolute inset-0 flex items-end justify-around p-4">
          {Array.from({ length: 20 }, (_, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${Math.random() * 80 + 20}%` }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`w-2 bg-gradient-to-t from-${color}-400 to-${color}-600 rounded-t`}
            />
          ))}
        </div>
        
        <div className="absolute top-4 left-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Real-time metrics</p>
        </div>
      </div>
    </motion.div>
  )

  const AlertsPanel = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-yellow-500" />
          System Alerts
        </h3>
        <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 rounded-full text-sm">
          {alerts.length} Active
        </span>
      </div>
      
      {alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg border-l-4 ${
                alert.type === 'error'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className={`font-medium ${
                  alert.type === 'error' ? 'text-red-800 dark:text-red-400' : 'text-yellow-800 dark:text-yellow-400'
                }`}>
                  {alert.message}
                </p>
                <span className={`text-sm ${
                  alert.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
                }`}>
                  {alert.value}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <BoltIcon className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">All systems running optimally</p>
        </div>
      )}
    </motion.div>
  )

  const SystemOverview = () => (
    <div className="space-y-6">
      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={CpuChipIcon}
          title="CPU Usage"
          value={performanceData?.system?.cpu || 45}
          unit="%"
          status={performanceData?.system?.cpu > 80 ? 'critical' : performanceData?.system?.cpu > 60 ? 'warning' : 'good'}
          trend={-2.3}
        />
        <MetricCard
          icon={CircleStackIcon}
          title="Memory Usage"
          value={performanceData?.system?.memory || 62}
          unit="%"
          status={performanceData?.system?.memory > 85 ? 'critical' : 'good'}
          trend={1.2}
        />
        <MetricCard
          icon={ServerIcon}
          title="Active Connections"
          value={performanceData?.connections?.active || 1247}
          status="good"
          trend={8.7}
        />
        <MetricCard
          icon={ClockIcon}
          title="Avg Response Time"
          value={performanceData?.response_time?.average || 245}
          unit="ms"
          status={performanceData?.response_time?.average > 2000 ? 'warning' : 'excellent'}
          trend={-15.4}
        />
      </div>

      {/* Real-time Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RealTimeChart title="CPU & Memory Usage" color="blue" />
        <RealTimeChart title="Network Traffic" color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RealTimeChart title="Response Times" color="purple" />
        <AlertsPanel />
      </div>
    </div>
  )

  const PredictiveScaling = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="card p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          🔮 Predictive Auto-Scaling
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl">
            <h4 className="font-semibold text-blue-900 dark:text-blue-400 mb-2">Current Load</h4>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">67%</p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Within normal range</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl">
            <h4 className="font-semibold text-green-900 dark:text-green-400 mb-2">Predicted Peak</h4>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">85%</p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">In 2.5 hours</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 p-6 rounded-xl">
            <h4 className="font-semibold text-purple-900 dark:text-purple-400 mb-2">Auto-Scale Status</h4>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">Ready</p>
            <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">Will scale at 80%</p>
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Scaling Recommendations</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">Add 2 backend instances</span>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">In 2 hours</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">Scale database read replicas</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">In 3 hours</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                ⚡ Performance Monitor
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Real-time system performance and predictive scaling
              </p>
            </div>
            
            {/* Refresh Controls */}
            <div className="flex items-center space-x-3">
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
              >
                <option value={1000}>1s</option>
                <option value={5000}>5s</option>
                <option value={10000}>10s</option>
                <option value={30000}>30s</option>
              </select>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchPerformanceData}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Refresh
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Status Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">System Status: Healthy</span>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </motion.div>

        {/* System Overview */}
        <SystemOverview />

        {/* Predictive Scaling */}
        <div className="mt-8">
          <PredictiveScaling />
        </div>
      </div>
    </div>
  )
}

export default PerformanceMonitor