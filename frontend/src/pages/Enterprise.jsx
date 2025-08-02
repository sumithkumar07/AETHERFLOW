import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheckIcon,
  ChartBarIcon,
  CogIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  DocumentCheckIcon,
  BoltIcon
} from '@heroicons/react/24/outline'
import RealTimeSystemStatus from '../components/RealTimeSystemStatus'
import EnhancedAnalyticsDashboard from '../components/EnhancedAnalyticsDashboard'
import { useEnterpriseFeatures } from '../hooks/useRealTimeBackend'

const Enterprise = () => {
  const { data: enterprise, loading, connected, healthy } = useEnterpriseFeatures()
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'security', name: 'Security & Compliance', icon: ShieldCheckIcon },
    { id: 'automation', name: 'Automation', icon: CogIcon },
    { id: 'collaboration', name: 'Team Collaboration', icon: UserGroupIcon },
    { id: 'analytics', name: 'Advanced Analytics', icon: ChartBarIcon }
  ]

  const FeatureCard = ({ title, description, status, icon: Icon }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6 hover-lift"
    >
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-3">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
            status === 'active' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
          }`}>
            {status === 'active' ? 'Active' : 'Configuring'}
          </span>
        </div>
      </div>
    </motion.div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Enterprise Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card p-6">
                <div className="flex items-center space-x-3">
                  <BuildingOfficeIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Enterprise Plan
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Full access to all features
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="card p-6">
                <div className="flex items-center space-x-3">
                  <UserGroupIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Team Members
                    </h3>
                    <p className="text-2xl font-bold text-green-600">
                      {enterprise?.team_size || 25}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="card p-6">
                <div className="flex items-center space-x-3">
                  <ShieldCheckIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Security Score
                    </h3>
                    <p className="text-2xl font-bold text-purple-600">
                      {enterprise?.security_score || 96}%
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="card p-6">
                <div className="flex items-center space-x-3">
                  <BoltIcon className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Automations
                    </h3>
                    <p className="text-2xl font-bold text-orange-600">
                      {enterprise?.active_automations || 12}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enterprise Features */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Enterprise Features
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FeatureCard
                  title="Advanced Security"
                  description="Zero-trust security, SOC2 compliance, audit logs"
                  status="active"
                  icon={ShieldCheckIcon}
                />
                <FeatureCard
                  title="Team Collaboration"
                  description="Real-time collaboration, role management, project sharing"
                  status="active"
                  icon={UserGroupIcon}
                />
                <FeatureCard
                  title="Enterprise Integrations"
                  description="SSO, LDAP, custom integrations, API access"
                  status="active"
                  icon={GlobeAltIcon}
                />
                <FeatureCard
                  title="Compliance Dashboard"
                  description="GDPR, SOC2, ISO27001 compliance monitoring"
                  status="active"
                  icon={DocumentCheckIcon}
                />
                <FeatureCard
                  title="Advanced Analytics"
                  description="Custom dashboards, usage analytics, performance insights"
                  status="active"
                  icon={ChartBarIcon}
                />
                <FeatureCard
                  title="Workflow Automation"
                  description="Custom workflows, automated deployments, CI/CD"
                  status="active"
                  icon={BoltIcon}
                />
              </div>
            </div>
          </div>
        )
      
      case 'security':
        return (
          <div className="space-y-8">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Security & Compliance Dashboard
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-medium text-green-700 dark:text-green-300">GDPR Compliance</h4>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">98%</p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-700 dark:text-blue-300">SOC2 Certified</h4>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">96%</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="font-medium text-purple-700 dark:text-purple-300">ISO27001</h4>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">94%</p>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'automation':
        return (
          <div className="space-y-8">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Automation Dashboard
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Manage and monitor enterprise automation workflows.
              </p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-700 dark:text-blue-300">Active Workflows</h4>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {enterprise?.active_automations || 12}
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-medium text-green-700 dark:text-green-300">Success Rate</h4>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {enterprise?.automation_success_rate || 98}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'collaboration':
        return (
          <div className="space-y-8">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Team Collaboration
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Real-time collaboration features for enterprise teams.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="font-medium text-purple-700 dark:text-purple-300">Active Sessions</h4>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {enterprise?.active_sessions || 8}
                  </p>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <h4 className="font-medium text-orange-700 dark:text-orange-300">Team Projects</h4>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {enterprise?.team_projects || 45}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'analytics':
        return <EnhancedAnalyticsDashboard />
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Real-time System Status Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <RealTimeSystemStatus compact={true} />
      </div>
      
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <BuildingOfficeIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Enterprise Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Advanced features and management for enterprise teams
              </p>
            </div>
          </div>
          
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            connected && healthy
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              connected && healthy ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`} />
            <span className="text-sm font-medium">
              Enterprise Services
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
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
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Enterprise