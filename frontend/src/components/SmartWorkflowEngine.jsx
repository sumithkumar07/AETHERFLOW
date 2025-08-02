import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowPathIcon,
  PlayIcon,
  StopIcon,
  PlusIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChartBarIcon,
  CodeBracketIcon,
  BoltIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import realTimeAPI from '../services/realTimeAPI'
import toast from 'react-hot-toast'

const SmartWorkflowEngine = ({ className = '' }) => {
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  const [executingWorkflows, setExecutingWorkflows] = useState(new Set())
  const [workflowStats, setWorkflowStats] = useState({})
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    trigger: 'manual',
    actions: []
  })

  useEffect(() => {
    loadWorkflows()
    // Set up real-time workflow status updates
    const interval = setInterval(loadWorkflows, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadWorkflows = async () => {
    try {
      const data = await realTimeAPI.getWorkflowEngine()
      setWorkflows(data.workflows || [])
      setWorkflowStats(data.statistics || {})
      setLoading(false)
    } catch (error) {
      console.error('Failed to load workflows:', error)
      setWorkflows(getMockWorkflows())
      setLoading(false)
    }
  }

  const getMockWorkflows = () => [
    {
      id: 1,
      name: 'CI/CD Pipeline',
      description: 'Automated build, test, and deployment pipeline',
      status: 'active',
      trigger: 'push',
      runs: 145,
      success: 98,
      lastRun: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      duration: '2m 30s',
      actions: [
        { id: 1, name: 'Build', type: 'build', status: 'completed' },
        { id: 2, name: 'Test', type: 'test', status: 'completed' },
        { id: 3, name: 'Deploy', type: 'deploy', status: 'completed' }
      ],
      metrics: {
        averageDuration: '2m 45s',
        failureRate: 2,
        trendsUp: true
      }
    },
    {
      id: 2,
      name: 'Code Review Assistant',
      description: 'Automated code quality checks and review assignments',
      status: 'active',
      trigger: 'pull_request',
      runs: 89,
      success: 95,
      lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      duration: '45s',
      actions: [
        { id: 1, name: 'Quality Check', type: 'analysis', status: 'completed' },
        { id: 2, name: 'Assign Reviewer', type: 'notification', status: 'completed' },
        { id: 3, name: 'Security Scan', type: 'security', status: 'completed' }
      ],
      metrics: {
        averageDuration: '1m 15s',
        failureRate: 5,
        trendsUp: false
      }
    },
    {
      id: 3,
      name: 'Auto Testing Suite',
      description: 'Comprehensive testing with unit, integration, and E2E tests',
      status: 'active',
      trigger: 'schedule',
      runs: 234,
      success: 92,
      lastRun: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      duration: '8m 20s',
      actions: [
        { id: 1, name: 'Unit Tests', type: 'test', status: 'completed' },
        { id: 2, name: 'Integration Tests', type: 'test', status: 'completed' },
        { id: 3, name: 'E2E Tests', type: 'test', status: 'completed' },
        { id: 4, name: 'Generate Report', type: 'report', status: 'completed' }
      ],
      metrics: {
        averageDuration: '7m 30s',
        failureRate: 8,
        trendsUp: true
      }
    },
    {
      id: 4,
      name: 'Smart Deployment',
      description: 'Intelligent deployment with rollback capabilities',
      status: 'paused',
      trigger: 'manual',
      runs: 67,
      success: 96,
      lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      duration: '5m 10s',
      actions: [
        { id: 1, name: 'Pre-Deploy Check', type: 'validation', status: 'pending' },
        { id: 2, name: 'Deploy to Staging', type: 'deploy', status: 'pending' },
        { id: 3, name: 'Health Check', type: 'monitoring', status: 'pending' },
        { id: 4, name: 'Deploy to Production', type: 'deploy', status: 'pending' }
      ],
      metrics: {
        averageDuration: '4m 45s',
        failureRate: 4,
        trendsUp: false
      }
    }
  ]

  const executeWorkflow = async (workflow) => {
    if (executingWorkflows.has(workflow.id)) return

    setExecutingWorkflows(prev => new Set([...prev, workflow.id]))
    
    try {
      toast.loading(`Executing ${workflow.name}...`, { id: workflow.id })
      
      // Simulate workflow execution
      for (let i = 0; i < workflow.actions.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Update action status
        setWorkflows(prev => prev.map(w => 
          w.id === workflow.id 
            ? {
                ...w,
                actions: w.actions.map((action, index) => 
                  index <= i ? { ...action, status: 'completed' } : action
                )
              }
            : w
        ))
      }
      
      // Update workflow stats
      setWorkflows(prev => prev.map(w => 
        w.id === workflow.id 
          ? {
              ...w,
              runs: w.runs + 1,
              lastRun: new Date().toISOString(),
              status: 'active'
            }
          : w
      ))
      
      toast.success(`${workflow.name} executed successfully!`, { id: workflow.id })
      
    } catch (error) {
      console.error('Workflow execution failed:', error)
      toast.error(`${workflow.name} execution failed`, { id: workflow.id })
    } finally {
      setExecutingWorkflows(prev => {
        const newSet = new Set(prev)
        newSet.delete(workflow.id)
        return newSet
      })
    }
  }

  const toggleWorkflow = async (workflowId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active'
    
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId ? { ...w, status: newStatus } : w
    ))
    
    toast.success(`Workflow ${newStatus === 'active' ? 'activated' : 'paused'}`)
  }

  const createWorkflow = async () => {
    if (!newWorkflow.name.trim()) {
      toast.error('Workflow name is required')
      return
    }

    const workflow = {
      id: Date.now(),
      ...newWorkflow,
      status: 'active',
      runs: 0,
      success: 100,
      lastRun: null,
      duration: '0s',
      actions: newWorkflow.actions.length > 0 ? newWorkflow.actions : [
        { id: 1, name: 'Default Action', type: 'custom', status: 'pending' }
      ],
      metrics: {
        averageDuration: '0s',
        failureRate: 0,
        trendsUp: true
      }
    }

    setWorkflows(prev => [...prev, workflow])
    setShowCreateModal(false)
    setNewWorkflow({ name: '', description: '', trigger: 'manual', actions: [] })
    
    toast.success(`Workflow "${workflow.name}" created successfully!`)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'paused':
        return <StopIcon className="w-5 h-5 text-yellow-500" />
      case 'failed':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getActionIcon = (type) => {
    switch (type) {
      case 'build':
        return <CogIcon className="w-4 h-4 text-blue-500" />
      case 'test':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />
      case 'deploy':
        return <CloudArrowUpIcon className="w-4 h-4 text-purple-500" />
      case 'notification':
        return <BellIcon className="w-4 h-4 text-orange-500" />
      case 'analysis':
        return <ChartBarIcon className="w-4 h-4 text-indigo-500" />
      case 'security':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
      default:
        return <DocumentTextIcon className="w-4 h-4 text-gray-500" />
    }
  }

  const WorkflowCard = ({ workflow }) => {
    const isExecuting = executingWorkflows.has(workflow.id)
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-lg transition-all duration-300"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getStatusIcon(workflow.status)}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {workflow.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {workflow.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleWorkflow(workflow.id, workflow.status)}
              className={`p-2 rounded-lg transition-colors ${
                workflow.status === 'active'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
              title={workflow.status === 'active' ? 'Pause workflow' : 'Activate workflow'}
            >
              {workflow.status === 'active' ? (
                <StopIcon className="w-4 h-4" />
              ) : (
                <PlayIcon className="w-4 h-4" />
              )}
            </button>
            
            <button
              onClick={() => executeWorkflow(workflow)}
              disabled={isExecuting || workflow.status === 'paused'}
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
              title="Execute workflow"
            >
              {isExecuting ? (
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
              ) : (
                <BoltIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Workflow Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {workflow.runs}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Runs</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {workflow.success}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {workflow.duration}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Last Duration</div>
          </div>
        </div>

        {/* Actions Pipeline */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Actions</h4>
          <div className="flex items-center space-x-2 overflow-x-auto">
            {workflow.actions.map((action, index) => (
              <div key={action.id} className="flex items-center space-x-2 flex-shrink-0">
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                  action.status === 'completed' 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : action.status === 'running'
                      ? 'bg-blue-100 dark:bg-blue-900/30 animate-pulse'
                      : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  {getActionIcon(action.type)}
                </div>
                {index < workflow.actions.length - 1 && (
                  <div className="w-4 h-0.5 bg-gray-300 dark:bg-gray-600" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Trigger Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <span>Trigger:</span>
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
              {workflow.trigger}
            </span>
          </div>
          
          {workflow.lastRun && (
            <div className="text-gray-500 dark:text-gray-400">
              Last run: {new Date(workflow.lastRun).toLocaleString()}
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  const CreateWorkflowModal = () => (
    <AnimatePresence>
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create New Workflow
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Workflow Name
                </label>
                <input
                  type="text"
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter workflow name..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newWorkflow.description}
                  onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Describe what this workflow does..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Trigger
                </label>
                <select
                  value={newWorkflow.trigger}
                  onChange={(e) => setNewWorkflow(prev => ({ ...prev, trigger: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="manual">Manual</option>
                  <option value="push">Git Push</option>
                  <option value="pull_request">Pull Request</option>
                  <option value="schedule">Schedule</option>
                  <option value="webhook">Webhook</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createWorkflow}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Create Workflow
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-12 ${className}`}>
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading workflows...</span>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Workflow Engine</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Automated workflows for CI/CD, testing, and deployment
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Create Workflow</span>
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center space-x-2">
            <ArrowPathIcon className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Workflows</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {workflows.length}
          </div>
        </div>
        
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {workflows.filter(w => w.status === 'active').length}
          </div>
        </div>
        
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center space-x-2">
            <BoltIcon className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Runs</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {workflows.reduce((sum, w) => sum + w.runs, 0)}
          </div>
        </div>
        
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {workflows.length > 0 
              ? Math.round(workflows.reduce((sum, w) => sum + w.success, 0) / workflows.length)
              : 0
            }%
          </div>
        </div>
      </div>

      {/* Workflows Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence>
          {workflows.map(workflow => (
            <WorkflowCard key={workflow.id} workflow={workflow} />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {workflows.length === 0 && (
        <div className="text-center py-12">
          <ArrowPathIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
            No workflows yet
          </h3>
          <p className="text-gray-500 dark:text-gray-500 mb-4">
            Create your first automated workflow to get started
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Create Your First Workflow
          </button>
        </div>
      )}

      <CreateWorkflowModal />
    </div>
  )
}

export default SmartWorkflowEngine