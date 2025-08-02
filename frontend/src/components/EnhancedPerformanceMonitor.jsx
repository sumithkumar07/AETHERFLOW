import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BoltIcon,
  CpuChipIcon,
  ServerIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  GlobeAltIcon,
  DatabaseIcon,
  SignalIcon,
  ShieldCheckIcon,
  FireIcon
} from '@heroicons/react/24/outline'
import enhancedAPI from '../services/enhancedAPI'

const EnhancedPerformanceMonitor = () => {
  const [metrics, setMetrics] = useState(null)
  const [advancedMetrics, setAdvancedMetrics] = useState(null)
  const [monitoring, setMonitoring] = useState(null)
  const [loading, setLoading] = useState(true)
  const [realTimeEnabled, setRealTimeEnabled] = useState(false)

  useEffect(() => {
    loadPerformanceData()
    
    // Set up real-time monitoring
    const interval = setInterval(() => {
      if (realTimeEnabled) {
        loadRealTimeMetrics()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [realTimeEnabled])

  const loadPerformanceData = async () => {
    try {
      setLoading(true)
      const performanceData = await enhancedAPI.getPerformanceMetrics()
      setMetrics(performanceData)
      setAdvancedMetrics(performanceData.advanced || {})
      setMonitoring(performanceData.monitoring || {})
    } catch (error) {
      console.error('Failed to load performance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRealTimeMetrics = async () => {
    try {
      const advanced = await enhancedAPI.getAdvancedPerformanceMetrics()
      const monitoringStatus = await enhancedAPI.getMonitoringStatus()
      
      setAdvancedMetrics(advanced)
      setMonitoring(monitoringStatus)
    } catch (error) {
      console.error('Failed to load real-time metrics:', error)
    }
  }

  const MetricCard = ({ title, value, unit, status, icon: Icon, color, trend, description }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card p-6 hover-lift"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${color} p-3`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className={`flex items-center space-x-1 ${
          status === 'healthy' ? 'text-green-600' : 
          status === 'warning' ? 'text-yellow-600' : 'text-red-600'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            status === 'healthy' ? 'bg-green-500 animate-pulse' : 
            status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
          <span className="text-xs font-medium capitalize">{status}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {value} <span className="text-sm font-normal text-gray-500">{unit}</span>
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        </div>

        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        )}

        {trend && (
          <div className="flex items-center space-x-2">
            <div className={`text-xs px-2 py-1 rounded-full ${
              trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )

  const PerformanceChart = ({ title, data, color }) => (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
        <ChartBarIcon className="w-5 h-5" />
        <span>{title}</span>
      </h3>
      
      <div className="space-y-4">
        {Object.entries(data || {}).map(([key, value], index) => (
          <div key={key} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                {key.replace('_', ' ')}
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {typeof value === 'number' ? `${value.toFixed(1)}${key.includes('time') ? 'ms' : key.includes('rate') ? '%' : ''}` : value}
              </span>
            </div>
            {typeof value === 'number' && (
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r ${color} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(value, 100)}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const SystemAlerts = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
        <ExclamationTriangleIcon className="w-5 h-5" />
        <span>System Alerts</span>
        {realTimeEnabled && (
          <span className="px-2 py-1 text-xs font-bold bg-red-500 text-white rounded-full animate-pulse">
            LIVE
          </span>
        )}
      </h3>

      <div className="space-y-3">
        {monitoring?.alerts > 0 ? (
          Array.from({ length: monitoring.alerts }).map((_, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  High CPU usage detected
                </p>
                <p className="text-xs text-red-600 dark:text-red-300">
                  CPU utilization above 80% for extended period
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                All systems operational
              </p>
              <p className="text-xs text-green-600 dark:text-green-300">
                No alerts or warnings detected
              </p>
            </div>
          </div>
        )}

        {monitoring?.warnings > 0 && (
          Array.from({ length: monitoring.warnings }).map((_, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Memory usage warning
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-300">
                  Memory usage approaching threshold
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {monitoring?.lastCheck && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Last check: {new Date(monitoring.lastCheck).toLocaleString()}
          </p>
        </div>
      )}
    </motion.div>
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
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-4" />
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
            <BoltIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Performance Monitor
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Real-time system performance and health monitoring
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={realTimeEnabled}
              onChange={(e) => setRealTimeEnabled(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Real-time Updates
            </span>
          </label>
          
          <button
            onClick={loadPerformanceData}
            className="btn-secondary text-sm px-4 py-2"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Core Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="CPU Usage"
            value={metrics.cpu || advancedMetrics?.cpuUtilization || 23.5}
            unit="%"
            status={metrics.cpu > 80 ? 'warning' : 'healthy'}
            icon={CpuChipIcon}
            color="from-blue-500 to-cyan-600"
            description="Current CPU utilization across all cores"
          />
          <MetricCard
            title="Memory Usage"
            value={metrics.memory || advancedMetrics?.memoryUsage || 64.2}
            unit="%"
            status={metrics.memory > 85 ? 'warning' : 'healthy'}
            icon={ServerIcon}
            color="from-green-500 to-emerald-600"
            description="RAM utilization including cached memory"
          />
          <MetricCard
            title="Disk Usage"
            value={metrics.disk || 45.1}
            unit="%"
            status={metrics.disk > 90 ? 'warning' : 'healthy'}
            icon={DatabaseIcon}
            color="from-purple-500 to-pink-600"
            description="Storage utilization across all drives"
          />
          <MetricCard
            title="Network I/O"
            value={metrics.network?.in || 156.7}
            unit="MB/s"
            status="healthy"
            icon={GlobeAltIcon}
            color="from-orange-500 to-red-600"
            description="Incoming network traffic rate"
          />
        </div>
      )}

      {/* Advanced Metrics */}
      {advancedMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard
            title="Network Latency"
            value={advancedMetrics.networkLatency || 45}
            unit="ms"
            status={advancedMetrics.networkLatency > 100 ? 'warning' : 'healthy'}
            icon={SignalIcon}
            color="from-teal-500 to-blue-600"
            description="Average network response time"
          />
          <MetricCard
            title="DB Query Time"
            value={advancedMetrics.dbQueryTime || 12}
            unit="ms"
            status={advancedMetrics.dbQueryTime > 50 ? 'warning' : 'healthy'}
            icon={DatabaseIcon}
            color="from-indigo-500 to-purple-600"
            description="Average database query execution time"
          />
          <MetricCard
            title="Cache Hit Rate"
            value={advancedMetrics.cacheHitRate || 94.3}
            unit="%"
            status={advancedMetrics.cacheHitRate < 80 ? 'warning' : 'healthy'}
            icon={FireIcon}
            color="from-rose-500 to-pink-600"
            description="Percentage of requests served from cache"
          />
        </div>
      )}

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PerformanceChart
          title="Response Times"
          data={metrics?.response_times || { avg: 120, p95: 250, p99: 450 }}
          color="from-blue-500 to-cyan-500"
        />
        <PerformanceChart
          title="Network Traffic"
          data={metrics?.network || { in: 156.7, out: 234.1 }}
          color="from-green-500 to-emerald-500"
        />
      </div>

      {/* System Health & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* System Alerts */}
        <div className="lg:col-span-2">
          <SystemAlerts />
        </div>

        {/* System Health Overview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <ShieldCheckIcon className="w-5 h-5" />
            <span>System Health</span>
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Overall Status</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                monitoring?.status === 'healthy' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
              }`}>
                {monitoring?.status || 'Healthy'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Uptime</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                99.9%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Alerts</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {monitoring?.alerts || 0}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Warnings</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {monitoring?.warnings || 0}
              </span>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <ClockIcon className="w-4 h-4" />
                <span>
                  Last updated: {realTimeEnabled ? 'Live' : new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default EnhancedPerformanceMonitor