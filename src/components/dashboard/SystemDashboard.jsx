import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  CpuChipIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  BoltIcon,
  RocketLaunchIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  BellIcon,
  BellSlashIcon
} from '@heroicons/react/24/outline'
import { useSystemMonitorStore } from '../../store/systemMonitorStore'
import toast from 'react-hot-toast'

const SystemDashboard = () => {
  const {
    services,
    systemMetrics,
    isMonitoring,
    loading,
    alertsEnabled,
    lastHealthCheck,
    startMonitoring,
    stopMonitoring,
    performHealthCheck,
    getServiceSummary,
    getPerformanceInsights,
    toggleAlerts,
    exportSystemReport,
    testService
  } = useSystemMonitorStore()

  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedService, setExpandedService] = useState(null)

  useEffect(() => {
    // Auto-start monitoring when component mounts
    if (!isMonitoring) {
      startMonitoring()
    }

    return () => {
      // Don't stop monitoring on unmount to keep it running globally
    }
  }, [isMonitoring, startMonitoring])

  const serviceSummary = getServiceSummary()
  const performanceInsights = getPerformanceInsights()

  // Service categories for better organization
  const serviceCategories = {
    all: 'All Services',
    core: 'Core API Services',
    ai: 'AI & ML Services', 
    enterprise: 'Enterprise Features',
    advanced: 'Advanced Features',
    infrastructure: 'Infrastructure'
  }

  const categorizedServices = {
    core: ['auth', 'ai', 'projects', 'templates', 'integrations'],
    ai: ['multiAgent', 'enhancedAI', 'advancedAI', 'intelligentRouter', 'voice'],
    enterprise: ['enterprise', 'analytics', 'performance', 'security', 'collaboration'],
    advanced: ['workflows', 'visualProgramming', 'codeQuality', 'architecturalIntelligence', 'smartDocumentation'],
    infrastructure: ['database', 'websocket', 'redis']
  }

  const getFilteredServices = () => {
    if (selectedCategory === 'all') {
      return Object.entries(services)
    }
    
    const categoryServices = categorizedServices[selectedCategory] || []
    return Object.entries(services).filter(([name]) => categoryServices.includes(name))
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'unhealthy':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      case 'not-implemented':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'unhealthy':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'not-implemented':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const formatResponseTime = (time) => {
    if (time < 1000) {
      return `${Math.round(time)}ms`
    }
    return `${(time / 1000).toFixed(1)}s`
  }

  const handleServiceTest = async (serviceName) => {
    toast.loading(`Testing ${serviceName}...`, { duration: 2000 })
    await testService(serviceName)
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            System Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive monitoring of all backend services and system health
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleAlerts}
            className={`p-2 rounded-lg transition-colors ${
              alertsEnabled 
                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-500'
            }`}
            title={`${alertsEnabled ? 'Disable' : 'Enable'} alerts`}
          >
            {alertsEnabled ? <BellIcon className="w-5 h-5" /> : <BellSlashIcon className="w-5 h-5" />}
          </button>
          
          <button
            onClick={performHealthCheck}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          <button
            onClick={exportSystemReport}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            <span>Export</span>
          </button>
          
          <button
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isMonitoring 
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <Cog6ToothIcon className="w-4 h-4" />
            <span>{isMonitoring ? 'Stop' : 'Start'} Monitor</span>
          </button>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Healthy Services</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {serviceSummary.healthy}/{serviceSummary.total}
              </p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(serviceSummary.healthy / serviceSummary.total) * 100}%` }}
              ></div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {systemMetrics.successRate.toFixed(1)}%
              </p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-blue-500" />
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${systemMetrics.successRate}%` }}
              ></div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatResponseTime(systemMetrics.avgResponseTime)}
              </p>
            </div>
            <BoltIcon className="w-8 h-8 text-purple-500" />
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {systemMetrics.avgResponseTime < 1000 ? 'Excellent' : 
               systemMetrics.avgResponseTime < 3000 ? 'Good' : 
               systemMetrics.avgResponseTime < 5000 ? 'Fair' : 'Needs Improvement'}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Status</p>
              <p className={`text-2xl font-bold ${
                performanceInsights.systemHealth.overallStatus === 'excellent' ? 'text-green-600 dark:text-green-400' :
                performanceInsights.systemHealth.overallStatus === 'good' ? 'text-blue-600 dark:text-blue-400' :
                performanceInsights.systemHealth.overallStatus === 'fair' ? 'text-yellow-600 dark:text-yellow-400' :
                'text-red-600 dark:text-red-400'
              }`}>
                {performanceInsights.systemHealth.overallStatus.toUpperCase()}
              </p>
            </div>
            <RocketLaunchIcon className={`w-8 h-8 ${
              performanceInsights.systemHealth.overallStatus === 'excellent' ? 'text-green-500' :
              performanceInsights.systemHealth.overallStatus === 'good' ? 'text-blue-500' :
              performanceInsights.systemHealth.overallStatus === 'fair' ? 'text-yellow-500' :
              'text-red-500'
            }`} />
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Last check: {lastHealthCheck ? new Date(lastHealthCheck).toLocaleTimeString() : 'Never'}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Service Category Filter */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(serviceCategories).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === key
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredServices().map(([serviceName, serviceData]) => (
          <motion.div
            key={serviceName}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getStatusIcon(serviceData.status)}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                  {serviceName.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(serviceData.status)}`}>
                {serviceData.status}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Response Time</span>
                <span className={`text-sm font-medium ${
                  serviceData.responseTime < 1000 ? 'text-green-600 dark:text-green-400' :
                  serviceData.responseTime < 3000 ? 'text-blue-600 dark:text-blue-400' :
                  'text-yellow-600 dark:text-yellow-400'
                }`}>
                  {formatResponseTime(serviceData.responseTime)}
                </span>
              </div>
              
              {serviceData.uptime > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Uptime</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {Math.round(serviceData.uptime / 1000)}s
                  </span>
                </div>
              )}
              
              {serviceData.lastChecked && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Last Checked</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(serviceData.lastChecked).toLocaleTimeString()}
                  </span>
                </div>
              )}
              
              {serviceData.error && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{serviceData.error}</p>
                </div>
              )}
              
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleServiceTest(serviceName)}
                  disabled={loading}
                  className="w-full px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Test Service
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Slowest Services */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Slowest Services</h3>
          <div className="space-y-3">
            {performanceInsights.slowestServices.map((service, index) => (
              <div key={service.name} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {service.name.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="text-sm text-yellow-600 dark:text-yellow-400">
                  {formatResponseTime(service.responseTime)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Fastest Services */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Fastest Services</h3>
          <div className="space-y-3">
            {performanceInsights.fastestServices.map((service, index) => (
              <div key={service.name} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {service.name.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="text-sm text-green-600 dark:text-green-400">
                  {formatResponseTime(service.responseTime)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Recommendations */}
      {performanceInsights.systemHealth.recommendations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recommendations</h3>
          <div className="space-y-4">
            {performanceInsights.systemHealth.recommendations.map((rec, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                rec.priority === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
                rec.priority === 'high' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
                'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
              }`}>
                <div className="flex items-start space-x-3">
                  {rec.priority === 'critical' ? 
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5" /> :
                    rec.priority === 'high' ? 
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mt-0.5" /> :
                    <BoltIcon className="w-5 h-5 text-blue-500 mt-0.5" />
                  }
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{rec.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rec.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SystemDashboard