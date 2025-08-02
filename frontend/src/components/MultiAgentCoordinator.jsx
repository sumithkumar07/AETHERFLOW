import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CpuChipIcon,
  UserGroupIcon,
  BoltIcon,
  ChatBubbleLeftRightIcon,
  CodeBracketIcon,
  PaintBrushIcon,
  BeakerIcon,
  CogIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useAIServices } from '../hooks/useRealTimeBackend'

const MultiAgentCoordinator = () => {
  const { data: aiServices, loading, error, connected, healthy, refresh } = useAIServices()
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [activeTask, setActiveTask] = useState(null)
  const [collaborationMode, setCollaborationMode] = useState('sequential')

  const agentIcons = {
    developer: CodeBracketIcon,
    designer: PaintBrushIcon,
    tester: BeakerIcon,
    integrator: CogIcon,
    analyst: ChatBubbleLeftRightIcon
  }

  const agentColors = {
    developer: 'blue',
    designer: 'purple',
    tester: 'green',
    integrator: 'orange',
    analyst: 'pink'
  }

  const AgentCard = ({ agent, isActive, onClick }) => {
    const Icon = agentIcons[agent.id] || CpuChipIcon
    const color = agentColors[agent.id] || 'gray'
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => onClick(agent)}
        className={`card p-6 cursor-pointer transition-all duration-200 ${
          isActive 
            ? `ring-2 ring-${color}-500 shadow-lg` 
            : 'hover:shadow-md'
        }`}
      >
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r from-${color}-500 to-${color}-600 p-3 relative`}>
            <Icon className="w-6 h-6 text-white" />
            {agent.status === 'active' && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {agent.name || agent.id}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {agent.description || `AI ${agent.id} specialist`}
            </p>
            <div className="flex items-center space-x-4 mt-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                agent.status === 'active'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
              }`}>
                {agent.status || 'Active'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Model: {agent.model || 'codellama:13b'}
              </span>
            </div>
          </div>
          
          {agent.capabilities && (
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {agent.capabilities.length} Skills
              </p>
              <div className="flex items-center space-x-1 mt-1">
                {agent.capabilities.slice(0, 3).map((skill, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 text-xs bg-${color}-100 text-${color}-700 dark:bg-${color}-900/30 dark:text-${color}-300 rounded`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  const CollaborationModeSelector = () => (
    <div className="card p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Collaboration Mode
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { id: 'sequential', name: 'Sequential', description: 'One agent at a time' },
          { id: 'parallel', name: 'Parallel', description: 'Multiple agents simultaneously' },
          { id: 'collaborative', name: 'Collaborative', description: 'Agents work together' }
        ].map((mode) => (
          <button
            key={mode.id}
            onClick={() => setCollaborationMode(mode.id)}
            className={`p-3 rounded-lg text-left transition-all ${
              collaborationMode === mode.id
                ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                : 'bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700/50'
            }`}
          >
            <p className="font-medium text-gray-900 dark:text-white">{mode.name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{mode.description}</p>
          </button>
        ))}
      </div>
    </div>
  )

  const TaskCoordinator = () => (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
        <UserGroupIcon className="w-5 h-5" />
        <span>Multi-Agent Task Coordination</span>
      </h3>
      
      {activeTask ? (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100">Active Task</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">{activeTask.description}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-xs text-blue-600 dark:text-blue-400">
                Mode: {collaborationMode}
              </span>
              <span className="text-xs text-blue-600 dark:text-blue-400">
                Agents: {activeTask.agents?.length || 0}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            {activeTask.agents?.map((agentId, index) => (
              <div key={agentId} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {agentId} Agent
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Processing task step {index + 1}
                  </p>
                </div>
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
              </div>
            ))}
          </div>
          
          <button
            onClick={() => setActiveTask(null)}
            className="w-full btn-secondary"
          >
            Stop Task
          </button>
        </div>
      ) : (
        <div className="text-center py-8">
          <UserGroupIcon className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No active multi-agent task
          </p>
          <button
            onClick={() => setActiveTask({
              description: 'Build a complete React component with tests and documentation',
              agents: ['developer', 'tester', 'designer']
            })}
            className="btn-primary"
          >
            Start Multi-Agent Task
          </button>
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl animate-pulse" />
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
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
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center">
            <UserGroupIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Multi-Agent Coordinator
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Orchestrate AI agents for complex development tasks
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            connected && healthy
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              connected && healthy ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`} />
            <span className="text-sm font-medium">
              {connected && healthy ? 'Agents Online' : 'Disconnected'}
            </span>
          </div>
          <button onClick={refresh} className="btn-secondary text-sm px-4 py-2">
            Refresh
          </button>
        </div>
      </div>

      {/* System Status */}
      {aiServices && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6">
            <div className="flex items-center space-x-3">
              <CpuChipIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Active Agents
                </h3>
                <p className="text-2xl font-bold text-blue-600">
                  {aiServices.agents?.length || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center space-x-3">
              <BoltIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Capabilities
                </h3>
                <p className="text-2xl font-bold text-purple-600">
                  {aiServices.capabilities?.total || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center space-x-3">
              <ClockIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Workflows
                </h3>
                <p className="text-2xl font-bold text-green-600">
                  {aiServices.workflows?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collaboration Mode */}
      <CollaborationModeSelector />

      {/* Agent Grid */}
      {aiServices && aiServices.agents && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Available AI Agents
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiServices.agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                isActive={selectedAgent?.id === agent.id}
                onClick={setSelectedAgent}
              />
            ))}
          </div>
        </div>
      )}

      {/* Task Coordination */}
      <TaskCoordinator />

      {/* Agent Details Modal */}
      <AnimatePresence>
        {selectedAgent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedAgent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedAgent.name || selectedAgent.id} Agent
                </h2>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Capabilities
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedAgent.capabilities?.map((capability, index) => (
                      <span
                        key={index}
                        className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm"
                      >
                        {capability}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Configuration
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Model:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {selectedAgent.model || 'codellama:13b'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                        <span className={`font-medium ${
                          selectedAgent.status === 'active' ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {selectedAgent.status || 'Active'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Specialization:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {selectedAgent.id}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setActiveTask({
                        description: `Task assigned to ${selectedAgent.name || selectedAgent.id} agent`,
                        agents: [selectedAgent.id]
                      })
                      setSelectedAgent(null)
                    }}
                    className="btn-primary flex-1"
                  >
                    Assign Task
                  </button>
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="btn-secondary flex-1"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <div className="card p-6 border-l-4 border-red-500">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Multi-agent coordination error
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MultiAgentCoordinator