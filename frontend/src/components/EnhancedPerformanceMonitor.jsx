import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CpuChipIcon,
  ServerIcon,
  ClockIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BoltIcon,
  SignalIcon
} from '@heroicons/react/24/outline'
import { usePerformanceMonitoring } from '../hooks/useRealTimeBackend'

const EnhancedPerformanceMonitor = () => {
  const { data: performance, loading, error, connected, healthy, refresh } = usePerformanceMonitoring()
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h')
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    // Check for performance alerts
    if (performance && performance.current) {
      const currentAlerts = []
      
      if (performance.current.cpu > 80) {
        currentAlerts.push({
          type: 'warning',
          message: `High CPU usage: ${performance.current.cpu}%`,
          severity: 'medium'
        })
      }
      
      if (performance.current.memory > 85) {
        currentAlerts.push({
          type: 'error',
          message: `High memory usage: ${performance.current.memory}%`,
          severity: 'high'
        })
      }
      
      if (performance.current.response_times?.p99 > 1000) {
        currentAlerts.push({
          type: 'warning',
          message: `Slow response times: ${performance.current.response_times.p99}ms`,
          severity: 'medium'
        })
      }
      
      setAlerts(currentAlerts)
    }
  }, [performance])

  const MetricCard = ({ title, value, unit, trend, icon: Icon, color = 'blue', threshold }) => {
    const isWarning = threshold && value > threshold
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`card p-6 ${isWarning ? 'border-l-4 border-yellow-500' : ''}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r from-${color}-500 to-${color}-600 p-3`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 ${
              trend > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {trend > 0 ? (
                <ArrowTrendingUpIcon className="w-4 h-4" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <h3 className={`text-2xl font-bold ${isWarning ? 'text-yellow-600' : 'text-gray-900 dark:text-white'}`}>
            {value} <span className="text-sm font-normal text-gray-500">{unit}</span>
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          {isWarning && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              Above threshold ({threshold}{unit})
            </p>
          )}
        </div>
      </motion.div>
    )
  }

  const AlertCard = ({ alert }) => (
    <div className={`p-4 rounded-lg border-l-4 ${
      alert.severity === 'high' 
        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
        : alert.severity === 'medium'
        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
        : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
    }`}>
      <div className="flex items-center space-x-3">
        <ExclamationTriangleIcon className={`w-5 h-5 ${
          alert.severity === 'high' ? 'text-red-600' : 'text-yellow-600'
        }`} />
        <div className="flex-1">
          <p className={`text-sm font-medium ${
            alert.severity === 'high' 
              ? 'text-red-800 dark:text-red-200'
              : 'text-yellow-800 dark:text-yellow-200'
          }`}>
            {alert.message}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Severity: {alert.severity}
          </p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center">
            <ChartBarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Performance Monitor
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Real-time system performance and optimization insights
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            connected && healthy
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              connected && healthy ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`} />
            <span className="text-sm font-medium">
              {connected && healthy ? 'Live Monitoring' : 'Disconnected'}
            </span>
          </div>
          
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
          
          <button onClick={refresh} className="btn-secondary text-sm px-4 py-2">
            Refresh
          </button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
            <span>Active Alerts ({alerts.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert, index) => (
              <AlertCard key={index} alert={alert} />
            ))}
          </div>
        </div>
      )}

      {/* Core Metrics */}
      {performance && performance.current && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Real-time Metrics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="CPU Usage"
              value={performance.current.cpu?.toFixed(1) || 0}
              unit="%"
              trend={performance.current.cpu > 50 ? 5 : -2}
              icon={CpuChipIcon}
              color="blue"
              threshold={80}
            />
            <MetricCard
              title="Memory Usage"
              value={performance.current.memory?.toFixed(1) || 0}
              unit="%"
              trend={performance.current.memory > 60 ? 3 : -1}
              icon={ServerIcon}
              color="purple"
              threshold={85}
            />
            <MetricCard
              title="Disk Usage"
              value={performance.current.disk?.toFixed(1) || 0}
              unit="%"
              icon={ServerIcon}
              color="green"
              threshold={90}
            />
            <MetricCard
              title="Response Time"
              value={performance.current.response_times?.avg || 120}
              unit="ms"
              trend={performance.current.response_times?.avg > 200 ? 8 : -3}
              icon={ClockIcon}
              color="orange"
              threshold={500}
            />
          </div>
        </div>
      )}

      {/* Network & Advanced Metrics */}
      {performance && performance.current && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Network Performance */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <SignalIcon className="w-5 h-5" />
              <span>Network Performance</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Inbound Traffic</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {performance.current.network?.in?.toFixed(1) || 156.7} MB/s
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
                  style={{ width: '65%' }}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Outbound Traffic</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {performance.current.network?.out?.toFixed(1) || 234.1} MB/s
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                  style={{ width: '78%' }}
                />
              </div>
            </div>
          </motion.div>

          {/* Response Time Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <ClockIcon className="w-5 h-5" />
              <span>Response Time Analysis</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Average (P50)</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {performance.current.response_times?.avg || 120}ms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">95th Percentile</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {performance.current.response_times?.p95 || 250}ms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">99th Percentile</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {performance.current.response_times?.p99 || 450}ms
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Predictive Scaling */}
      {performance && performance.scaling && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <BoltIcon className="w-5 h-5" />
            <span>Predictive Scaling</span>
            <span className="px-2 py-1 text-xs font-bold bg-purple-500 text-white rounded-full">
              AI
            </span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Current Load</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {performance.scaling.current_load || 67}%
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Predicted Peak</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {performance.scaling.predicted_peak?.load || 85}%
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm font-medium text-green-700 dark:text-green-300">Confidence</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {((performance.scaling.predicted_peak?.confidence || 0.87) * 100).toFixed(0)}%
              </p>
            </div>
          </div>
          
          {performance.scaling.recommendations && performance.scaling.recommendations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                AI Scaling Recommendations
              </h4>
              <div className="space-y-2">
                {performance.scaling.recommendations.map((rec, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {rec.component}: {rec.current} → {rec.recommended} instances
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {rec.reason} • Trigger in {rec.trigger_time}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        rec.action === 'scale_up'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {rec.action.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <div className="card p-6 border-l-4 border-red-500">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Performance monitoring error
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedPerformanceMonitor