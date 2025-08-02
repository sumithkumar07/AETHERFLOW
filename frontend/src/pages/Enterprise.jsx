import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BuildingOfficeIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  UsersIcon,
  CpuChipIcon,
  ServerIcon,
  DocumentCheckIcon,
  GlobeAltIcon,
  LockClosedIcon,
  CloudIcon,
  CogIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import enhancedAPI from '../services/enhancedAPI'
import EnhancedAnalyticsDashboard from '../components/EnhancedAnalyticsDashboard'
import LoadingStates from '../components/LoadingStates'

const Enterprise = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [enterpriseData, setEnterpriseData] = useState(null)
  const [securityData, setSecurityData] = useState(null)
  const [complianceData, setComplianceData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEnterpriseData()
  }, [])

  const loadEnterpriseData = async () => {
    try {
      setLoading(true)
      
      const [enterprise, security, analytics] = await Promise.all([
        enhancedAPI.api.getEnterpriseFeatures().catch(() => getMockEnterpriseData()),
        enhancedAPI.getSecurityDashboard(),
        enhancedAPI.getEnterpriseAnalytics()
      ])

      setEnterpriseData({ ...enterprise, analytics })
      setSecurityData(security)
      setComplianceData(security.compliance)
      
    } catch (error) {
      console.error('Failed to load enterprise data:', error)
      setEnterpriseData(getMockEnterpriseData())
      setSecurityData(getMockSecurityData())
    } finally {
      setLoading(false)
    }
  }

  const getMockEnterpriseData = () => ({
    subscription: { plan: 'Enterprise Pro', users: 500, features: 'unlimited' },
    organizations: { total: 15, active: 12, regions: 8 },
    integrations: { active: 24, available: 156, custom: 8 },
    sso: { enabled: true, providers: ['Azure AD', 'Okta', 'Google Workspace'] },
    api: { calls: 1250000, limit: 'unlimited', performance: 99.9 },
    support: { tier: '24/7 Premium', response: '< 1 hour', satisfaction: 98 }
  })

  const getMockSecurityData = () => ({
    status: 'secure',
    score: 96,
    vulnerabilities: 0,
    compliance: {
      gdpr: { status: 'compliant', score: 98 },
      soc2: { status: 'certified', score: 96 },
      iso27001: { status: 'compliant', score: 94 },
      hipaa: { status: 'compliant', score: 97 }
    },
    threats: { level: 'low', blocked: 145, incidents: 0 },
    audits: { passed: 22, warnings: 2, critical: 0 }
  })

  const tabs = [
    {
      id: 'dashboard',
      name: 'Overview',
      icon: ChartBarIcon,
      description: 'Enterprise analytics and metrics'
    },
    {
      id: 'security',
      name: 'Security',
      icon: ShieldCheckIcon,
      description: 'Security status and compliance'
    },
    {
      id: 'integrations',
      name: 'Integrations',
      icon: CogIcon,
      description: 'Third-party integrations and APIs'
    },
    {
      id: 'compliance',
      name: 'Compliance',
      icon: DocumentCheckIcon,
      description: 'Regulatory compliance and audits'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: ChartBarIcon,
      description: 'Advanced analytics dashboard'
    }
  ]

  const MetricCard = ({ title, value, icon: Icon, color, trend, description }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card p-6 hover-lift"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${color} p-3`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className="text-right">
            <div className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
        {description && (
          <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
        )}
      </div>
    </motion.div>
  )

  const OverviewTab = () => (
    <div className="space-y-8">
      {/* Key Metrics */}
      {enterpriseData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Active Organizations"
            value={enterpriseData.organizations?.active || 12}
            icon={BuildingOfficeIcon}
            color="from-blue-500 to-cyan-600"
            trend={8.5}
            description="Organizations using the platform"
          />
          <MetricCard
            title="Total Users"
            value={enterpriseData.subscription?.users?.toLocaleString() || '500'}
            icon={UsersIcon}
            color="from-green-500 to-emerald-600"
            trend={12.3}
            description="Licensed enterprise users"
          />
          <MetricCard
            title="API Performance"
            value={`${enterpriseData.api?.performance || 99.9}%`}
            icon={ServerIcon}
            color="from-purple-500 to-pink-600"
            trend={0.2}
            description="API uptime and reliability"
          />
          <MetricCard
            title="Security Score"
            value={`${securityData?.score || 96}/100`}
            icon={ShieldCheckIcon}
            color="from-orange-500 to-red-600"
            trend={2.1}
            description="Overall security rating"
          />
        </div>
      )}

      {/* Feature Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <CpuChipIcon className="w-5 h-5" />
            <span>Enterprise Features</span>
            <span className="px-2 py-1 text-xs font-bold bg-green-500 text-white rounded-full">
              ACTIVE
            </span>
          </h3>
          
          <div className="space-y-4">
            {[
              { name: 'Single Sign-On (SSO)', status: 'active', providers: 3 },
              { name: 'Advanced Analytics', status: 'active', features: 'unlimited' },
              { name: 'Custom Integrations', status: 'active', count: 24 },
              { name: 'Priority Support', status: 'active', tier: '24/7' },
              { name: 'Compliance Monitoring', status: 'active', standards: 4 },
              { name: 'Audit Logging', status: 'active', retention: '7 years' }
            ].map((feature, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    feature.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                  }`} />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {feature.name}
                  </span>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {feature.providers && `${feature.providers} providers`}
                  {feature.features && feature.features}
                  {feature.count && `${feature.count} active`}
                  {feature.tier && feature.tier}
                  {feature.standards && `${feature.standards} standards`}
                  {feature.retention && feature.retention}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <GlobeAltIcon className="w-5 h-5" />
            <span>Global Deployment</span>
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {enterpriseData?.organizations?.regions || 8}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Regions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  99.9%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Global Uptime</div>
              </div>
            </div>
            
            <div className="space-y-2">
              {[
                { region: 'North America', status: 'operational', latency: '12ms' },
                { region: 'Europe', status: 'operational', latency: '18ms' },
                { region: 'Asia Pacific', status: 'operational', latency: '24ms' },
                { region: 'Latin America', status: 'operational', latency: '31ms' }
              ].map((region, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm text-gray-900 dark:text-white">{region.region}</span>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{region.latency}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )

  const SecurityTab = () => (
    <div className="space-y-8">
      {/* Security Overview */}
      {securityData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Security Score"
            value={`${securityData.score}/100`}
            icon={ShieldCheckIcon}
            color="from-green-500 to-emerald-600"
            description="Overall security rating"
          />
          <MetricCard
            title="Active Threats"
            value={securityData.threats?.incidents || 0}
            icon={ExclamationTriangleIcon}
            color="from-red-500 to-pink-600"
            description="Current security incidents"
          />
          <MetricCard
            title="Threats Blocked"
            value={securityData.threats?.blocked || 145}
            icon={CheckCircleIcon}
            color="from-blue-500 to-cyan-600"
            description="Threats blocked today"
          />
          <MetricCard
            title="Vulnerabilities"
            value={securityData.vulnerabilities || 0}
            icon={LockClosedIcon}
            color="from-purple-500 to-indigo-600"
            description="Open security vulnerabilities"
          />
        </div>
      )}

      {/* Security Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Security Monitoring
          </h3>
          
          <div className="space-y-4">
            {[
              { name: 'Real-time Threat Detection', status: 'active', coverage: '100%' },
              { name: 'Automated Security Scanning', status: 'active', frequency: 'continuous' },
              { name: 'Vulnerability Assessment', status: 'active', last: '2 hours ago' },
              { name: 'Incident Response System', status: 'active', response: '< 5 min' },
              { name: 'Security Information and Event Management', status: 'active', events: '24/7' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {item.coverage || item.frequency || item.last || item.response || item.events}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Security Events
          </h3>
          
          <div className="space-y-3">
            {[
              { type: 'info', message: 'Security scan completed successfully', time: '5 min ago' },
              { type: 'warning', message: 'Unusual login pattern detected and blocked', time: '12 min ago' },
              { type: 'success', message: 'All compliance checks passed', time: '1 hour ago' },
              { type: 'info', message: 'Security policy updated', time: '2 hours ago' },
              { type: 'success', message: 'Threat intelligence feed updated', time: '4 hours ago' }
            ].map((event, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  event.type === 'success' ? 'bg-green-500' :
                  event.type === 'warning' ? 'bg-yellow-500' :
                  event.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">{event.message}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    {event.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )

  const ComplianceTab = () => (
    <div className="space-y-8">
      {/* Compliance Status */}
      {complianceData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(complianceData).map(([standard, data], index) => (
            <MetricCard
              key={standard}
              title={standard.toUpperCase()}
              value={`${data.score}/100`}
              icon={DocumentCheckIcon}
              color={
                index % 4 === 0 ? 'from-blue-500 to-cyan-600' :
                index % 4 === 1 ? 'from-green-500 to-emerald-600' :
                index % 4 === 2 ? 'from-purple-500 to-pink-600' :
                'from-orange-500 to-red-600'
              }
              description={`${data.status} compliance status`}
            />
          ))}
        </div>
      )}

      {/* Compliance Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8"
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Compliance Framework Overview
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {complianceData && Object.entries(complianceData).map(([standard, data], index) => (
              <div key={standard} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{standard.toUpperCase()}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    data.status === 'compliant' || data.status === 'certified' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                  }`}>
                    {data.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Compliance Score</span>
                    <span className="font-medium text-gray-900 dark:text-white">{data.score}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                      style={{ width: `${data.score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">Recent Audit Activities</h4>
            {[
              { activity: 'SOC 2 Type II audit completed', status: 'completed', date: '2024-01-15' },
              { activity: 'GDPR data processing assessment', status: 'in-progress', date: '2024-01-20' },
              { activity: 'ISO 27001 annual review', status: 'scheduled', date: '2024-02-01' },
              { activity: 'HIPAA security rule evaluation', status: 'completed', date: '2024-01-10' }
            ].map((audit, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{audit.activity}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{audit.date}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  audit.status === 'completed' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                  audit.status === 'in-progress'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                }`}>
                  {audit.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 p-8">
        <LoadingStates.FullScreen message="Loading enterprise features..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl flex items-center justify-center">
              <BuildingOfficeIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Enterprise Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Advanced enterprise features and analytics
              </p>
            </div>
          </div>
          
          <button
            onClick={loadEnterpriseData}
            className="btn-secondary text-sm px-4 py-2"
          >
            Refresh Data
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {activeTab === 'dashboard' && <OverviewTab />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'compliance' && <ComplianceTab />}
          {activeTab === 'analytics' && <EnhancedAnalyticsDashboard />}
          {activeTab === 'integrations' && (
            <div className="card p-8 text-center">
              <CogIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Integrations Dashboard
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Integration management interface coming soon
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Enterprise