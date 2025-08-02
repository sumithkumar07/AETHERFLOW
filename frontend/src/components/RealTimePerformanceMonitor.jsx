import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CpuChipIcon,
  ServerIcon,
  ChartBarIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import realTimeAPI from '../services/realTimeAPI'

const RealTimePerformanceMonitor = ({ className = '', compact = false }) => {
  const [metrics, setMetrics] = useState({})
  const [alerts, setAlerts] = useState([])
  const [history, setHistory] = useState({
    cpu: [],
    memory: [],
    network: [],
    responseTime: []
  })
  const [isConnected, setIsConnected] = useState(false)
  const intervalRef = useRef(null)
  const maxHistoryLength = 50

  useEffect(() => {
    initializeMonitoring()
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const initializeMonitoring = async () => {
    try {
      // Initial load
      await loadMetrics()
      setIsConnected(true)
      
      // Set up real-time updates every 2 seconds
      intervalRef.current = setInterval(loadMetrics, 2000)
      
      // Subscribe to real-time performance updates
      window.addEventListener('realtime-performance', handleRealtimeUpdate)
      
    } catch (error) {
      console.error('Performance monitoring initialization failed:', error)
      setIsConnected(false)
    }
  }

  const loadMetrics = async () => {
    try {
      const data = await realTimeAPI.getRealTimePerformanceMetrics()
      setMetrics(data)
      
      // Update history
      updateHistory('cpu', data.cpu || 0)
      updateHistory('memory', data.memory || 0)
      updateHistory('network', (data.network?.in || 0) + (data.network?.out || 0))
      updateHistory('responseTime', data.responseTime || 0)
      
      // Check for alerts
      checkForAlerts(data)
      
    } catch (error) {
      console.error('Failed to load performance metrics:', error)
      setIsConnected(false)
    }
  }

  const handleRealtimeUpdate = (event) => {
    const data = event.detail
    setMetrics(data)
    
    // Update history with real-time data
    updateHistory('cpu', data.cpu || 0)
    updateHistory('memory', data.memory || 0)
    updateHistory('network', (data.network?.in || 0) + (data.network?.out || 0))
    updateHistory('responseTime', data.responseTime || 0)
    
    checkForAlerts(data)
  }

  const updateHistory = (metric, value) => {
    setHistory(prev => {
      const newHistory = { ...prev }
      newHistory[metric] = [...(prev[metric] || []), value].slice(-maxHistoryLength)
      return newHistory
    })
  }

  const checkForAlerts = (data) => {
    const newAlerts = []
    
    if (data.cpu > 80) {
      newAlerts.push({
        id: 'cpu-high',
        type: 'warning',
        message: `High CPU usage: ${data.cpu}%`,
        timestamp: new Date().toISOString()
      })
    }
    
    if (data.memory > 85) {
      newAlerts.push({
        id: 'memory-high',
        type: 'error',
        message: `High memory usage: ${data.memory}%`,
        timestamp: new Date().toISOString()
      })
    }
    
    if (data.responseTime > 1000) {
      newAlerts.push({
        id: 'response-slow',
        type: 'warning',
        message: `Slow response time: ${data.responseTime}ms`,
        timestamp: new Date().toISOString()
      })
    }
    
    if (data.errorRate > 0.05) {
      newAlerts.push({
        id: 'error-rate-high',
        type: 'error',
        message: `High error rate: ${(data.errorRate * 100).toFixed(2)}%`,
        timestamp: new Date().toISOString()
      })
    }
    
    setAlerts(newAlerts)
  }

  const getMetricTrend = (metricHistory) => {
    if (metricHistory.length < 2) return 'stable'
    
    const recent = metricHistory.slice(-5)
    const older = metricHistory.slice(-10, -5)
    
    if (recent.length === 0 || older.length === 0) return 'stable'
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100
    
    if (change > 5) return 'up'
    if (change < -5) return 'down'
    return 'stable'
  }

  const MetricCard = ({ title, value, unit, icon: Icon, color, trend, history }) => {
    const trendDirection = getMetricTrend(history)
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${compact ? 'p-3' : 'p-4'} bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${color} p-2 flex items-center justify-center`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          
          <div className="flex items-center space-x-1">
            {trendDirection === 'up' && (
              <ArrowTrendingUpIcon className="w-4 h-4 text-red-500" />
            )}
            {trendDirection === 'down' && (
              <ArrowTrendingDownIcon className="w-4 h-4 text-green-500" />
            )}
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-baseline space-x-1">
            <span className={`${compact ? 'text-lg' : 'text-2xl'} font-bold text-gray-900 dark:text-white`}>
              {typeof value === 'number' ? value.toFixed(1) : value}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{unit}</span>
          </div>
          <p className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-gray-600 dark:text-gray-400`}>
            {title}
          </p>
        </div>
        
        {/* Mini Chart */}
        {history && history.length > 1 && (
          <div className="mt-2 h-8 flex items-end space-x-1 overflow-hidden">
            {history.slice(-10).map((val, index) => (
              <div
                key={index}
                className={`flex-1 bg-gradient-to-t ${color} opacity-60 rounded-sm min-h-1`}
                style={{ height: `${Math.max((val / Math.max(...history)) * 100, 10)}%` }}
              />
            ))}
          </div>
        )}
      </motion.div>
    )
  }

  const AlertBanner = ({ alerts }) => {
    if (alerts.length === 0) return null
    
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-red-50 dark:from-yellow-900/20 dark:to-red-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl"
      >
        <div className="flex items-center space-x-2">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <span className="font-semibold text-yellow-800 dark:text-yellow-300">
            Performance Alerts ({alerts.length})
          </span>
        </div>
        <div className="mt-2 space-y-1">
          {alerts.slice(0, 3).map((alert) => (
            <div key={alert.id} className="flex items-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                alert.type === 'error' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <span className="text-gray-700 dark:text-gray-300">{alert.message}</span>
            </div>
          ))}
        </div>
      </motion.div>
    )
  }

  if (compact) {
    return (
      <div className={`space-y-3 ${className}`}>
        <AlertBanner alerts={alerts} />
        
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            title="CPU Usage"
            value={metrics.cpu || 0}
            unit="%"
            icon={CpuChipIcon}
            color="from-blue-500 to-cyan-600"
            history={history.cpu}
          />
          <MetricCard
            title="Memory"
            value={metrics.memory || 0}
            unit="%"
            icon={ServerIcon}
            color="from-green-500 to-emerald-600"
            history={history.memory}
          />
        </div>
        
        <div className="flex items-center justify-center space-x-4 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {isConnected ? 'Live' : 'Disconnected'}
            </span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {metrics.timestamp ? new Date(metrics.timestamp).toLocaleTimeString() : '--:--:--'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Real-Time Performance Monitor
        </h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
      
      <AlertBanner alerts={alerts} />
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="CPU Usage"
          value={metrics.cpu || 0}
          unit="%"
          icon={CpuChipIcon}
          color="from-blue-500 to-cyan-600"
          history={history.cpu}
        />
        <MetricCard
          title="Memory Usage"
          value={metrics.memory || 0}
          unit="%"
          icon={ServerIcon}
          color="from-green-500 to-emerald-600"
          history={history.memory}
        />
        <MetricCard
          title="Network I/O"
          value={((metrics.network?.in || 0) + (metrics.network?.out || 0))}
          unit="MB/s"
          icon={ChartBarIcon}
          color="from-purple-500 to-pink-600"
          history={history.network}
        />
        <MetricCard
          title="Response Time"
          value={metrics.responseTime || 0}
          unit="ms"
          icon={ClockIcon}
          color="from-orange-500 to-red-600"
          history={history.responseTime}
        />
      </div>
      
      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50"
        >
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">System Health</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Throughput</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {metrics.throughput || 0} req/s
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Error Rate</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {((metrics.errorRate || 0) * 100).toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Connections</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {metrics.activeConnections || 0}
              </span>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50"
        >
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Recent Activity</h4>
          <div className="space-y-2">
            {alerts.length === 0 ? (
              <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircleIcon className="w-4 h-4" />
                <span>All systems operating normally</span>
              </div>
            ) : (
              alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-center space-x-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${
                    alert.type === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                  }`} />
                  <span className="text-gray-600 dark:text-gray-400">{alert.message}</span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default RealTimePerformanceMonitor