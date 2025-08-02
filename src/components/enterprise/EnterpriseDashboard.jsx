import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ShieldCheckIcon, 
  ChartBarIcon, 
  CogIcon, 
  UsersIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import { useEnterpriseStore } from '../../store/enterpriseStore'

/**
 * Enterprise Dashboard - Main interface for all enterprise features
 * Connects to enterprise, analytics, security, performance, and compliance services
 */
const EnterpriseDashboard = () => {
  const {
    enterpriseFeatures,
    complianceDashboard,
    automationDashboard,
    realTimeMetrics,
    securityScore,
    threatAlerts,
    activeSessions,
    workflows,
    loading,
    error,
    initialize,
    fetchComplianceDashboard,
    fetchAutomationDashboard,
    fetchRealTimeMetrics,
    fetchSecurityScore,
    fetchThreatAlerts,
    fetchActiveSessions,
    refreshAllData
  } = useEnterpriseStore()

  const [selectedTab, setSelectedTab] = useState('overview')
  const [refreshInterval, setRefreshInterval] = useState(null)

  useEffect(() => {
    initialize()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      refreshAllData()
    }, 30000)
    
    setRefreshInterval(interval)
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [initialize, refreshAllData])

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BuildingOfficeIcon },
    { id: 'compliance', name: 'Compliance', icon: ShieldCheckIcon },
    { id: 'automation', name: 'Automation', icon: CogIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'security', name: 'Security', icon: ExclamationTriangleIcon },
    { id: 'collaboration', name: 'Collaboration', icon: UsersIcon }
  ]

  const getComplianceStatusColor = (status) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200'
      case 'in_progress': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200'
      case 'not_compliant': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const getAlertSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  if (loading && !enterpriseFeatures.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Initializing Enterprise Services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Enterprise Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Comprehensive enterprise management and monitoring
          </p>
        </div>
        <button
          onClick={refreshAllData}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Compliance Score
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {complianceDashboard.overview?.compliance_score || 0}%
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CogIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Active Workflows
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {automationDashboard.overview?.active_workflows || 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Security Alerts
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {threatAlerts.filter(alert => !alert.resolved).length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Active Sessions
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {activeSessions.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`${
                    selectedTab === tab.id
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Performance */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    System Performance
                  </h3>
                  {realTimeMetrics.system && (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">CPU Usage</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {realTimeMetrics.system.cpu}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${realTimeMetrics.system.cpu}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Memory Usage</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {realTimeMetrics.system.memory}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${realTimeMetrics.system.memory}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Security Overview */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Security Overview
                  </h3>
                  {securityScore.overall_score && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Overall Security Score</span>
                        <span className="text-2xl font-bold text-green-600">
                          {securityScore.overall_score}/100
                        </span>
                      </div>
                      
                      {securityScore.factors && Object.entries(securityScore.factors).map(([factor, score]) => (
                        <div key={factor} className="flex justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-300 capitalize">
                            {factor.replace('_', ' ')}
                          </span>
                          <span className="text-xs font-medium text-gray-900 dark:text-white">
                            {score}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {securityScore.recent_activities?.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-shrink-0">
                        {activity.risk_level === 'low' ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        ) : (
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.activity}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {activity.location} • {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Compliance Tab */}
          {selectedTab === 'compliance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Compliance Status
              </h3>
              
              {complianceDashboard.frameworks && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {complianceDashboard.frameworks.map((framework) => (
                    <motion.div
                      key={framework.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {framework.name}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full capitalize ${getComplianceStatusColor(framework.status)}`}>
                          {framework.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">Coverage</span>
                          <span className="font-medium text-gray-900 dark:text-white">{framework.coverage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full" 
                            style={{ width: `${framework.coverage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="mt-3 text-sm">
                        <p className="text-gray-600 dark:text-gray-300">
                          {framework.requirements_met}/{framework.total_requirements} requirements met
                        </p>
                        {framework.issues?.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-red-600 dark:text-red-400">
                              Issues: {framework.issues.join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Automation Tab */}
          {selectedTab === 'automation' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Workflow Automation
              </h3>
              
              {automationDashboard.overview && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    Automation Overview
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Active Workflows</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {automationDashboard.overview.active_workflows}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Success Rate</p>
                      <p className="text-xl font-bold text-green-600">
                        {automationDashboard.overview.success_rate}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Avg Execution Time</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {automationDashboard.overview.avg_execution_time}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">24h Executions</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {automationDashboard.overview.last_24h_executions}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {automationDashboard.workflows && (
                <div className="space-y-4">
                  {automationDashboard.workflows.map((workflow) => (
                    <div key={workflow.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {workflow.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {workflow.description}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          workflow.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                        }`}>
                          {workflow.status}
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-300">Success Rate</p>
                          <p className="font-medium text-gray-900 dark:text-white">{workflow.success_rate}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-300">Executions</p>
                          <p className="font-medium text-gray-900 dark:text-white">{workflow.executions}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-300">Last Run</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {new Date(workflow.last_run).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {selectedTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Security Monitoring
              </h3>
              
              {/* Threat Alerts */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                  Active Threat Alerts
                </h4>
                {threatAlerts.length > 0 ? (
                  <div className="space-y-3">
                    {threatAlerts.filter(alert => !alert.resolved).map((alert) => (
                      <div key={alert.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${getAlertSeverityColor(alert.severity)}`}>
                                {alert.severity}
                              </span>
                              <h5 className="font-medium text-gray-900 dark:text-white">
                                {alert.type.replace('_', ' ').toUpperCase()}
                              </h5>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {alert.description}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {new Date(alert.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                            Resolve
                          </button>
                        </div>
                        {alert.details && (
                          <div className="mt-3 text-xs text-gray-600 dark:text-gray-300">
                            <pre className="whitespace-pre-wrap">{JSON.stringify(alert.details, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShieldCheckIcon className="h-12 w-12 text-green-400 mx-auto" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      No active threats
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Your system is secure
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EnterpriseDashboard