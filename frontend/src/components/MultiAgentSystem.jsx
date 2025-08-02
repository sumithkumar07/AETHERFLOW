import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserGroupIcon,
  CodeBracketIcon,
  PaintBrushIcon,
  BeakerIcon,
  ServerIcon,
  CpuChipIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  BoltIcon,
  SparklesIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import enhancedAPI from '../services/enhancedAPI'

const MultiAgentSystem = ({ projectId, onAgentResponse }) => {
  const [agents, setAgents] = useState([])
  const [orchestration, setOrchestration] = useState(null)
  const [activeAgents, setActiveAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState(null)

  useEffect(() => {
    loadMultiAgentSystem()
    
    // Real-time updates every 15 seconds
    const interval = setInterval(loadAgentStatus, 15000)
    return () => clearInterval(interval)
  }, [])

  const loadMultiAgentSystem = async () => {
    try {
      setLoading(true)
      const data = await enhancedAPI.getMultiAgentSystem()
      setAgents(data.agents || [])
      setOrchestration(data.orchestration || {})
      
      // Initialize with mock agents if none available
      if (!data.agents || data.agents.length === 0) {
        setAgents(getMockAgents())
      }
    } catch (error) {
      console.error('Failed to load multi-agent system:', error)
      setAgents(getMockAgents())
    } finally {
      setLoading(false)
    }
  }

  const loadAgentStatus = async () => {
    try {
      const capabilities = await enhancedAPI.getAgentCapabilities()
      const activeAgentsList = Object.entries(capabilities)
        .filter(([_, agent]) => agent.active)
        .map(([name, agent]) => ({ name, ...agent }))
      
      setActiveAgents(activeAgentsList)
    } catch (error) {
      console.error('Failed to load agent status:', error)
    }
  }

  const getMockAgents = () => [
    {
      id: 'developer',
      name: 'AI Developer',
      type: 'Developer',
      status: 'active',
      capabilities: ['React', 'Node.js', 'Python', 'FastAPI'],
      experience: 'Senior',
      tasksCompleted: 1247,
      efficiency: 94,
      icon: CodeBracketIcon,
      color: 'from-blue-500 to-cyan-600',
      description: 'Expert in full-stack development, specializing in modern web technologies and API design.'
    },
    {
      id: 'designer',
      name: 'AI Designer',
      type: 'Designer',
      status: 'active',
      capabilities: ['UI/UX', 'Responsive Design', 'Brand Identity', 'Prototyping'],
      experience: 'Senior',
      tasksCompleted: 892,
      efficiency: 97,
      icon: PaintBrushIcon,
      color: 'from-purple-500 to-pink-600',
      description: 'Creates beautiful, user-centered designs with modern aesthetics and exceptional usability.'
    },
    {
      id: 'tester',
      name: 'AI QA Engineer',
      type: 'Quality Assurance',
      status: 'active',
      capabilities: ['Unit Testing', 'E2E Testing', 'Performance Testing', 'Security Testing'],
      experience: 'Expert',
      tasksCompleted: 2156,
      efficiency: 99,
      icon: BeakerIcon,
      color: 'from-green-500 to-emerald-600',
      description: 'Ensures code quality through comprehensive testing strategies and automated test suites.'
    },
    {
      id: 'devops',
      name: 'AI DevOps Engineer',
      type: 'DevOps',
      status: 'active',
      capabilities: ['Docker', 'Kubernetes', 'CI/CD', 'Monitoring'],
      experience: 'Expert',
      tasksCompleted: 834,
      efficiency: 96,
      icon: ServerIcon,
      color: 'from-orange-500 to-red-600',
      description: 'Manages deployment pipelines, infrastructure, and ensures smooth production operations.'
    },
    {
      id: 'architect',
      name: 'AI Architect',
      type: 'System Architect',
      status: 'active',
      capabilities: ['System Design', 'Microservices', 'Scalability', 'Performance'],
      experience: 'Principal',
      tasksCompleted: 456,
      efficiency: 98,
      icon: CpuChipIcon,
      color: 'from-indigo-500 to-purple-600',
      description: 'Designs robust, scalable architectures and provides technical leadership for complex projects.'
    },
    {
      id: 'pm',
      name: 'AI Project Manager',
      type: 'Project Manager',
      status: 'active',
      capabilities: ['Agile', 'Scrum', 'Risk Management', 'Team Coordination'],
      experience: 'Senior',
      tasksCompleted: 623,
      efficiency: 93,
      icon: UserGroupIcon,
      color: 'from-teal-500 to-blue-600',
      description: 'Coordinates team efforts, manages timelines, and ensures project success through effective leadership.'
    }
  ]

  const AgentCard = ({ agent, isActive, onClick }) => {
    const Icon = agent.icon

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        className={`card p-6 cursor-pointer transition-all duration-300 ${
          isActive ? 'ring-2 ring-blue-500 shadow-lg' : 'hover-lift'
        }`}
        onClick={() => onClick(agent)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${agent.color} p-3 shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              agent.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`} />
            <span className={`text-xs font-medium ${
              agent.status === 'active' ? 'text-green-600' : 'text-gray-500'
            }`}>
              {agent.status === 'active' ? 'Active' : 'Idle'}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {agent.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {agent.type} • {agent.experience} Level
            </p>
          </div>

          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {agent.description}
          </p>

          <div className="flex flex-wrap gap-1 mb-3">
            {agent.capabilities?.slice(0, 3).map((capability, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
              >
                {capability}
              </span>
            ))}
            {agent.capabilities?.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                +{agent.capabilities.length - 3} more
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Tasks Completed</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {agent.tasksCompleted?.toLocaleString() || '0'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Efficiency</p>
              <p className="text-lg font-semibold text-green-600">
                {agent.efficiency || 0}%
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  const OrchestrationPanel = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
        <Cog6ToothIcon className="w-5 h-5" />
        <span>AI Orchestration Engine</span>
        <span className="px-2 py-1 text-xs font-bold bg-blue-500 text-white rounded-full">
          LIVE
        </span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
            <CheckCircleIcon className="w-8 h-8 text-white" />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
            Coordination Status
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
            {orchestration?.coordination || 'Intelligent'}
          </p>
          <div className="mt-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                style={{ width: '95%' }}
              />
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center">
            <BoltIcon className="w-8 h-8 text-white" />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
            System Efficiency
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {orchestration?.efficiency || 95}%
          </p>
          <div className="mt-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                style={{ width: `${orchestration?.efficiency || 95}%` }}
              />
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
            <SparklesIcon className="w-8 h-8 text-white" />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
            AI Intelligence
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Advanced
          </p>
          <div className="mt-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full animate-pulse"
                style={{ width: '98%' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
        <h5 className="font-medium text-gray-900 dark:text-white mb-2">
          Current Orchestration Status
        </h5>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          All agents are operating in perfect harmony. The system is automatically distributing tasks 
          based on agent expertise and current workload. Real-time collaboration is active across 
          all development phases.
        </p>
      </div>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl animate-pulse" />
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-4" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <UserGroupIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Multi-Agent AI System
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Specialized AI agents working together in perfect harmony
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              {agents.filter(a => a.status === 'active').length} Active
            </span>
          </div>
          <button
            onClick={loadMultiAgentSystem}
            className="btn-secondary text-sm px-4 py-2"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Orchestration Panel */}
      <OrchestrationPanel />

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            isActive={selectedAgent?.id === agent.id}
            onClick={setSelectedAgent}
          />
        ))}
      </div>

      {/* Agent Details Modal */}
      <AnimatePresence>
        {selectedAgent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedAgent(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="card max-w-2xl w-full p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 rounded-3xl bg-gradient-to-r ${selectedAgent.color} p-4`}>
                    <selectedAgent.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedAgent.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedAgent.type} • {selectedAgent.experience} Level
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedAgent.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Capabilities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.capabilities?.map((capability, index) => (
                      <span
                        key={index}
                        className="px-3 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-lg"
                      >
                        {capability}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Performance</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Efficiency</span>
                          <span className="text-sm font-medium">{selectedAgent.efficiency}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                            style={{ width: `${selectedAgent.efficiency}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Statistics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedAgent.tasksCompleted?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                        <span className={`text-sm font-medium capitalize ${
                          selectedAgent.status === 'active' ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {selectedAgent.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="btn-secondary px-6 py-2"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      if (onAgentResponse) {
                        onAgentResponse(`Activated ${selectedAgent.name} for specialized tasks`)
                      }
                      setSelectedAgent(null)
                    }}
                    className="btn-primary px-6 py-2"
                  >
                    <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                    Collaborate
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MultiAgentSystem