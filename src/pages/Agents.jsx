import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  PlusIcon, 
  PlayIcon,
  PauseIcon,
  TrashIcon,
  CogIcon,
  UserGroupIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import axios from 'axios'
import toast from 'react-hot-toast'

const Agents = () => {
  const { user } = useAuthStore()
  const [agents, setAgents] = useState([])
  const [agentTeams, setAgentTeams] = useState([])
  const [orchestrationStatus, setOrchestrationStatus] = useState({})
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState(null)

  const agentTypes = [
    { id: 'developer', name: 'Developer', icon: '💻', description: 'Specialized in code generation and development' },
    { id: 'integrator', name: 'Integrator', icon: '🔗', description: 'Handles API and system integrations' },
    { id: 'tester', name: 'Tester', icon: '🧪', description: 'Automated testing and quality assurance' },
    { id: 'deployer', name: 'Deployer', icon: '🚀', description: 'Deployment and infrastructure management' },
    { id: 'analyst', name: 'Analyst', icon: '📊', description: 'Business analysis and requirements gathering' },
    { id: 'security', name: 'Security', icon: '🔒', description: 'Security analysis and compliance' },
    { id: 'coordinator', name: 'Coordinator', icon: '🎯', description: 'Orchestrates multi-agent workflows' }
  ]

  useEffect(() => {
    fetchAgents()
    fetchAgentTeams()
    fetchOrchestrationStatus()
  }, [])

  const fetchAgents = async () => {
    try {
      const response = await axios.get('/api/agents')
      setAgents(response.data)
    } catch (error) {
      toast.error('Failed to fetch agents')
    }
  }

  const fetchAgentTeams = async () => {
    try {
      const response = await axios.get('/api/agents/teams')
      setAgentTeams(response.data)
    } catch (error) {
      console.error('Failed to fetch teams:', error)
    }
  }

  const fetchOrchestrationStatus = async () => {
    try {
      const response = await axios.get('/api/agents/orchestration/status')
      setOrchestrationStatus(response.data)
    } catch (error) {
      console.error('Failed to fetch orchestration status:', error)
    } finally {
      setLoading(false)
    }
  }

  const createAgent = async (agentData) => {
    try {
      const response = await axios.post('/api/agents', agentData)
      setAgents([...agents, response.data])
      toast.success(`Agent ${response.data.name} created successfully!`)
      setShowCreateModal(false)
    } catch (error) {
      toast.error('Failed to create agent')
    }
  }

  const deleteAgent = async (agentId) => {
    if (!confirm('Are you sure you want to delete this agent?')) return

    try {
      await axios.delete(`/api/agents/${agentId}`)
      setAgents(agents.filter(agent => agent.id !== agentId))
      toast.success('Agent deleted successfully')
    } catch (error) {
      toast.error('Failed to delete agent')
    }
  }

  const orchestrateTask = async (taskDescription) => {
    try {
      const response = await axios.post('/api/agents/orchestrate', {
        description: taskDescription
      })
      
      toast.success('Multi-agent task orchestration started!')
      
      // Refresh orchestration status
      fetchOrchestrationStatus()
      
      return response.data
    } catch (error) {
      toast.error('Failed to orchestrate task')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'idle': return 'text-blue-600 bg-blue-100'
      case 'busy': return 'text-yellow-600 bg-yellow-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getAgentTypeInfo = (type) => {
    return agentTypes.find(t => t.id === type) || agentTypes[0]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Multi-Agent System</h1>
              <p className="text-gray-600">Manage your AI agents and orchestrate complex workflows</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowTeamModal(true)}
                className="btn-secondary flex items-center space-x-2"
              >
                <UserGroupIcon className="w-5 h-5" />
                <span>Create Team</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Create Agent</span>
              </button>
            </div>
          </div>
        </div>

        {/* Orchestration Status Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <UserGroupIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Agents</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orchestrationStatus.active_agents || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-100">
                <ChartBarIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Queued Tasks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orchestrationStatus.queued_tasks || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orchestrationStatus.system_health === 'healthy' ? '✓' : '⚠️'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100">
                <ClockIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Teams</p>
                <p className="text-2xl font-bold text-gray-900">{agentTeams.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Orchestration */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Task Orchestration</h2>
            <p className="text-sm text-gray-600">Describe a complex task to orchestrate multiple agents</p>
          </div>
          <div className="p-6">
            <OrchestrationForm onOrchestrate={orchestrateTask} />
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {agents.map((agent) => {
            const typeInfo = getAgentTypeInfo(agent.type)
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{typeInfo.icon}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                        <p className="text-sm text-gray-600">{typeInfo.name}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(agent.status)}`}>
                      {agent.status}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">{agent.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Created {new Date(agent.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedAgent(agent)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded"
                      >
                        <CogIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteAgent(agent.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Agent Teams */}
        {agentTeams.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Agent Teams</h2>
              <p className="text-sm text-gray-600">Coordinated teams for complex workflows</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agentTeams.map((team) => (
                  <div key={team.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{team.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{team.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {team.agents.length} agents
                      </span>
                      <span className="text-xs text-gray-500">
                        Created {new Date(team.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateAgentModal
          agentTypes={agentTypes}
          onClose={() => setShowCreateModal(false)}
          onCreate={createAgent}
        />
      )}

      {showTeamModal && (
        <CreateTeamModal
          agents={agents}
          onClose={() => setShowTeamModal(false)}
          onCreate={(teamData) => {
            // Handle team creation
            console.log('Create team:', teamData)
            setShowTeamModal(false)
          }}
        />
      )}
    </div>
  )
}

// Orchestration Form Component
const OrchestrationForm = ({ onOrchestrate }) => {
  const [taskDescription, setTaskDescription] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!taskDescription.trim()) return

    setIsProcessing(true)
    try {
      await onOrchestrate(taskDescription)
      setTaskDescription('')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={taskDescription}
        onChange={(e) => setTaskDescription(e.target.value)}
        placeholder="Describe a complex task that requires multiple specialized agents (e.g., 'Build a full-stack e-commerce application with React frontend, Node.js backend, and automated testing')"
        className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        disabled={isProcessing}
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!taskDescription.trim() || isProcessing}
          className="btn-primary flex items-center space-x-2 disabled:opacity-50"
        >
          <PlayIcon className="w-4 h-4" />
          <span>{isProcessing ? 'Orchestrating...' : 'Orchestrate Task'}</span>
        </button>
      </div>
    </form>
  )
}

// Create Agent Modal Component
const CreateAgentModal = ({ agentTypes, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'developer',
    description: '',
    configuration: {}
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onCreate(formData)
  }

  const selectedType = agentTypes.find(type => type.id === formData.type)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Create New Agent</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Agent Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter agent name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Agent Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {agentTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.name}
                </option>
              ))}
            </select>
            {selectedType && (
              <p className="text-sm text-gray-600 mt-1">{selectedType.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              rows="3"
              placeholder="Describe what this agent will do"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Create Agent
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Create Team Modal Component
const CreateTeamModal = ({ agents, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    agents: [],
    workflow_config: {
      coordination_style: 'collaborative',
      communication_frequency: 'real_time'
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onCreate(formData)
  }

  const toggleAgent = (agentId) => {
    const updatedAgents = formData.agents.includes(agentId)
      ? formData.agents.filter(id => id !== agentId)
      : [...formData.agents, agentId]
    
    setFormData({...formData, agents: updatedAgents})
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Create Agent Team</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter team name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              rows="3"
              placeholder="Describe the team's purpose"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Agents ({formData.agents.length} selected)
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {agents.map((agent) => (
                <label key={agent.id} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.agents.includes(agent.id)}
                    onChange={() => toggleAgent(agent.id)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-900">{agent.name}</span>
                  <span className="text-xs text-gray-500">({agent.type})</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formData.agents.length === 0}
              className="btn-primary disabled:opacity-50"
            >
              Create Team
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Agents