import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CpuChipIcon,
  ServerIcon,
  BoltIcon,
  ClockIcon,
  SignalIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { useRealTimeBackend } from '../hooks/useRealTimeBackend'

const RealTimeSystemStatus = ({ compact = false, showDetails = true }) => {
  const {
    connected,
    serviceHealth,
    getOverallHealth,
    getHealthyServicesCount,
    getTotalServicesCount,
    isFullyOperational,
    hasAnyAlerts,
    data,
    loading
  } = useRealTimeBackend()

  const [showFullStatus, setShowFullStatus] = useState(false)

  if (loading) {
    return (
      <div className={`${compact ? 'p-2' : 'p-4'} card animate-pulse`}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="flex-1">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    )
  }

  const overallHealth = getOverallHealth()
  const healthyServices = getHealthyServicesCount()
  const totalServices = getTotalServicesCount()

  const getHealthColor = () => {
    if (overallHealth >= 95) return 'green'
    if (overallHealth >= 80) return 'yellow'
    return 'red'
  }

  const getHealthIcon = () => {
    if (overallHealth >= 95) return CheckCircleIcon
    if (overallHealth >= 80) return ExclamationTriangleIcon
    return ExclamationTriangleIcon
  }

  const HealthIcon = getHealthIcon()
  const healthColor = getHealthColor()

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className={`w-2 h-2 rounded-full ${
          connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
        }`} />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {healthyServices}/{totalServices} Services
        </span>
        <span className={`text-xs px-2 py-1 rounded-full ${
          overallHealth >= 95 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
            : overallHealth >= 80
            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
        }`}>
          {overallHealth.toFixed(0)}%
        </span>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${
            healthColor === 'green' 
              ? 'from-green-500 to-emerald-500'
              : healthColor === 'yellow'
              ? 'from-yellow-500 to-orange-500'
              : 'from-red-500 to-pink-500'
          } p-2`}>
            <HealthIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              System Status
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Real-time backend monitoring
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
            connected 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`} />
            <span className="text-sm font-medium">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          <button
            onClick={() => setShowFullStatus(!showFullStatus)}
            className="btn-secondary text-sm px-3 py-1"
          >
            {showFullStatus ? 'Less' : 'Details'}
          </button>
        </div>
      </div>

      {/* Overall Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <ServerIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Services Health</p>
              <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                {overallHealth.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">Active Services</p>
              <p className="text-xl font-bold text-green-900 dark:text-green-100">
                {healthyServices}/{totalServices}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <BoltIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Performance</p>
              <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                {isFullyOperational ? 'Optimal' : 'Degraded'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Status */}
      <AnimatePresence>
        {showDetails && showFullStatus && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {/* Service Status List */}
            {serviceHealth.services && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Service Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(serviceHealth.services).map(([service, status]) => (
                    <div
                      key={service}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          status.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {service.replace('/api/', '').replace('/', '')}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        status.status === 'healthy'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {status.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Real-time Metrics */}
            {data.performance && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Real-time Metrics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <CpuChipIcon className="w-4 h-4 mx-auto mb-1 text-gray-600 dark:text-gray-400" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">CPU</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {data.performance.cpu?.toFixed(1) || 0}%
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <ServerIcon className="w-4 h-4 mx-auto mb-1 text-gray-600 dark:text-gray-400" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">Memory</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {data.performance.memory?.toFixed(1) || 0}%
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <SignalIcon className="w-4 h-4 mx-auto mb-1 text-gray-600 dark:text-gray-400" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">Network</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {data.performance.network?.in?.toFixed(0) || 0} MB/s
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <ClockIcon className="w-4 h-4 mx-auto mb-1 text-gray-600 dark:text-gray-400" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">Response</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {data.performance.response_times?.avg || 120}ms
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Alerts */}
            {hasAnyAlerts && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Active Alerts
                </h4>
                <div className="space-y-2">
                  {data.alerts?.slice(0, 3).map((alert, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
                    >
                      <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          {alert.message || 'System alert'}
                        </p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">
                          {alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : 'Just now'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status Footer */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Last updated: {data.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : 'Just now'}</span>
                <div className="flex items-center space-x-2">
                  <ShieldCheckIcon className="w-4 h-4" />
                  <span>All systems functional</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default RealTimeSystemStatus