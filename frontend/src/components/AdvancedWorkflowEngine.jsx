import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CogIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  RocketLaunchIcon,
  CodeBracketIcon,
  BeakerIcon,
  DocumentCheckIcon,
  ArrowPathIcon,
  BoltIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'
import enhancedAPI from '../services/enhancedAPI'

const AdvancedWorkflowEngine = () => {
  const [workflows, setWorkflows] = useState([])
  const [automation, setAutomation] = useState(null)
  const [triggers, setTriggers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedWorkflow, setSelectedWorkflow] = useState(null)

  useEffect(() => {
    loadWorkflowData()
  }, [])

  const loadWorkflowData = async () => {
    try {
      setLoading(true)
      const data = await enhancedAPI.getWorkflowAutomation()
      setWorkflows(data.workflows || [])
      setAutomation(data.automation || {})
      setTriggers(data.triggers || [])
      
      // Add mock data if empty
      if (!data.workflows || data.workflows.length === 0) {
        setWorkflows(getMockWorkflows())
        setAutomation({ enabled: true, active: 12, efficiency: 94 })
        setTriggers(['push', 'pull_request', 'merge', 'deploy', 'schedule'])
      }
    } catch (error) {
      console.error('Failed to load workflow data:', error)
      setWorkflows(getMockWorkflows())
      setAutomation({ enabled: true, active: 12, efficiency: 94 })
      setTriggers(['push', 'pull_request', 'merge', 'deploy', 'schedule'])
    } finally {
      setLoading(false)
    }
  }

  const getMockWorkflows = () => [
    {
      id: 1,
      name: 'CI/CD Pipeline',
      description: 'Automated build, test, and deployment pipeline',
      status: 'active',
      type: 'deployment',
      runs: 145,
      successRate: 98.2,
      avgDuration: '4m 32s',
      lastRun: '2 hours ago',
      triggers: ['push', 'pull_request'],
      steps: [
        { name: 'Checkout Code', status: 'completed', duration: '15s' },
        { name: 'Install Dependencies', status: 'completed', duration: '1m 20s' },
        { name: 'Run Tests', status: 'completed', duration: '2m 45s' },
        { name: 'Build Application', status: 'running', duration: '45s' },
        { name: 'Deploy to Staging', status: 'pending', duration: '-' }
      ]
    },
    {
      id: 2,
      name: 'Code Quality Check',
      description: 'Automated code review and quality analysis',
      status: 'active',
      type: 'quality',
      runs: 89,
      successRate: 96.7,
      avgDuration: '2m 15s',
      lastRun: '45 minutes ago',
      triggers: ['push'],
      steps: [
        { name: 'Lint Code', status: 'completed', duration: '30s' },
        { name: 'Security Scan', status: 'completed', duration: '1m 15s' },
        { name: 'Performance Check', status: 'completed', duration: '30s' }
      ]
    },
    {
      id: 3,
      name: 'Auto Testing Suite',
      description: 'Comprehensive automated testing pipeline',
      status: 'active',
      type: 'testing',
      runs: 234,
      successRate: 99.1,
      avgDuration: '8m 45s',
      lastRun: '1 hour ago',
      triggers: ['push', 'schedule'],
      steps: [
        { name: 'Unit Tests', status: 'completed', duration: '3m 20s' },
        { name: 'Integration Tests', status: 'completed', duration: '4m 15s' },
        { name: 'E2E Tests', status: 'completed', duration: '1m 10s' }
      ]
    },
    {
      id: 4,
      name: 'Documentation Generator',
      description: 'Automatic documentation generation and updates',
      status: 'paused',
      type: 'documentation',
      runs: 56,
      successRate: 94.6,
      avgDuration: '1m 45s',
      lastRun: '3 days ago',
      triggers: ['merge'],
      steps: [
        { name: 'Extract Comments', status: 'completed', duration: '25s' },
        { name: 'Generate Docs', status: 'completed', duration: '1m 20s' }
      ]
    },
    {
      id: 5,
      name: 'Security Audit',
      description: 'Daily security vulnerability assessment',
      status: 'active',
      type: 'security',
      runs: 28,
      successRate: 100,
      avgDuration: '15m 30s',
      lastRun: '12 hours ago',
      triggers: ['schedule'],
      steps: [
        { name: 'Dependency Scan', status: 'completed', duration: '5m 15s' },
        { name: 'Code Analysis', status: 'completed', duration: '8m 45s' },
        { name: 'Report Generation', status: 'completed', duration: '1m 30s' }
      ]
    }
  ]

  const getWorkflowIcon = (type) => {
    switch (type) {
      case 'deployment': return RocketLaunchIcon
      case 'testing': return BeakerIcon
      case 'quality': return CheckCircleIcon
      case 'security': return ExclamationTriangleIcon
      case 'documentation': return DocumentCheckIcon
      default: return CogIcon
    }
  }

  const getWorkflowColor = (type) => {
    switch (type) {
      case 'deployment': return 'from-blue-500 to-cyan-600'
      case 'testing': return 'from-green-500 to-emerald-600'
      case 'quality': return 'from-purple-500 to-pink-600'
      case 'security': return 'from-red-500 to-orange-600'
      case 'documentation': return 'from-indigo-500 to-purple-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const WorkflowCard = ({ workflow }) => {
    const Icon = getWorkflowIcon(workflow.type)
    const color = getWorkflowColor(workflow.type)

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className={`card p-6 cursor-pointer transition-all duration-300 ${
          selectedWorkflow?.id === workflow.id ? 'ring-2 ring-blue-500 shadow-lg' : 'hover-lift'
        }`}
        onClick={() => setSelectedWorkflow(workflow)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${color} p-3 shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              workflow.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
              workflow.status === 'paused' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
              'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            }`}>
              {workflow.status}
            </span>
            {workflow.status === 'active' && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {workflow.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {workflow.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Runs</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {workflow.runs?.toLocaleString() || '0'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
              <div className="text-lg font-semibold text-green-600">
                {workflow.successRate || 0}%
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <ClockIcon className="w-3 h-3" />
              <span>Avg: {workflow.avgDuration}</span>
            </div>
            <span>Last: {workflow.lastRun}</span>
          </div>

          {/* Triggers */}
          <div className="flex flex-wrap gap-1">
            {workflow.triggers?.map((trigger, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
              >
                {trigger}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    )
  }

  const WorkflowDetails = ({ workflow }) => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="card p-6 sticky top-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Workflow Details
        </h3>
        <button
          onClick={() => setSelectedWorkflow(null)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          ×
        </button>
      </div>

      <div className="space-y-6">
        {/* Workflow Info */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">{workflow.name}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {workflow.description}
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Type</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                {workflow.type}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Status</div>
              <div className={`text-sm font-medium capitalize ${
                workflow.status === 'active' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {workflow.status}
              </div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Pipeline Steps</h4>
          <div className="space-y-3">
            {workflow.steps?.map((step, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  step.status === 'completed' ? 'bg-green-500' :
                  step.status === 'running' ? 'bg-blue-500 animate-pulse' :
                  step.status === 'failed' ? 'bg-red-500' :
                  'bg-gray-300'
                }`}>
                  {step.status === 'completed' && <CheckCircleIcon className="w-4 h-4 text-white" />}
                  {step.status === 'running' && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                  {step.status === 'failed' && <ExclamationTriangleIcon className="w-4 h-4 text-white" />}
                  {step.status === 'pending' && <div className="w-2 h-2 bg-gray-600 rounded-full" />}
                </div>
                
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {step.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Duration: {step.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          {workflow.status === 'active' ? (
            <button className="btn-secondary text-sm px-4 py-2 flex items-center space-x-2">
              <PauseIcon className="w-4 h-4" />
              <span>Pause</span>
            </button>
          ) : (
            <button className="btn-primary text-sm px-4 py-2 flex items-center space-x-2">
              <PlayIcon className="w-4 h-4" />
              <span>Start</span>
            </button>
          )}
          
          <button className="btn-secondary text-sm px-4 py-2 flex items-center space-x-2">
            <ArrowPathIcon className="w-4 h-4" />
            <span>Run Now</span>
          </button>
        </div>
      </div>
    </motion.div>
  )

  const AutomationOverview = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6 mb-8"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
        <BoltIcon className="w-5 h-5" />
        <span>Automation Overview</span>
        {automation?.enabled && (
          <span className="px-2 py-1 text-xs font-bold bg-green-500 text-white rounded-full">
            ENABLED
          </span>
        )}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center">
            <CogIcon className="w-8 h-8 text-white" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {workflows.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Workflows</div>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
            <CheckCircleIcon className="w-8 h-8 text-white" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {workflows.filter(w => w.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Active Workflows</div>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
            <ChartBarIcon className="w-8 h-8 text-white" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {automation?.efficiency || 94}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Efficiency Rate</div>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
            <BoltIcon className="w-8 h-8 text-white" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {workflows.reduce((sum, w) => sum + (w.runs || 0), 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Runs</div>
        </div>
      </div>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl animate-pulse" />
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-4" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
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
            <AdjustmentsHorizontalIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Workflow Automation
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Intelligent automation and CI/CD pipeline management
            </p>
          </div>
        </div>

        <button
          onClick={loadWorkflowData}
          className="btn-secondary text-sm px-4 py-2"
        >
          <ArrowPathIcon className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Automation Overview */}
      <AutomationOverview />

      {/* Workflows Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`${selectedWorkflow ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workflows.map((workflow) => (
              <WorkflowCard key={workflow.id} workflow={workflow} />
            ))}
          </div>
        </div>

        {/* Workflow Details Sidebar */}
        {selectedWorkflow && (
          <div className="lg:col-span-1">
            <WorkflowDetails workflow={selectedWorkflow} />
          </div>
        )}
      </div>
    </div>
  )
}

export default AdvancedWorkflowEngine