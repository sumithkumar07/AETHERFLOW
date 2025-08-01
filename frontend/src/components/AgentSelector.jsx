import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UserGroupIcon,
  ChevronDownIcon,
  CheckIcon,
  SparklesIcon,
  CogIcon,
  BeakerIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline'

const AgentSelector = ({ selectedAgents, onAgentsChange }) => {
  const [isOpen, setIsOpen] = useState(false)

  const agents = [
    { 
      id: 'developer', 
      name: 'Developer', 
      icon: CommandLineIcon, 
      color: 'from-green-500 to-emerald-600',
      description: 'Code generation, debugging, and development' 
    },
    { 
      id: 'designer', 
      name: 'Designer', 
      icon: SparklesIcon, 
      color: 'from-pink-500 to-rose-600',
      description: 'UI/UX design and styling' 
    },
    { 
      id: 'integrator', 
      name: 'Integrator', 
      icon: CogIcon, 
      color: 'from-blue-500 to-cyan-600',
      description: 'API integrations and connections' 
    },
    { 
      id: 'tester', 
      name: 'Tester', 
      icon: BeakerIcon, 
      color: 'from-yellow-500 to-orange-600',
      description: 'Testing and quality assurance' 
    },
    { 
      id: 'deployer', 
      name: 'Deployer', 
      icon: RocketLaunchIcon, 
      color: 'from-purple-500 to-violet-600',
      description: 'Deployment and infrastructure' 
    },
    { 
      id: 'security', 
      name: 'Security', 
      icon: ShieldCheckIcon, 
      color: 'from-red-500 to-pink-600',
      description: 'Security analysis and compliance' 
    },
    { 
      id: 'analyst', 
      name: 'Analyst', 
      icon: ChartBarIcon, 
      color: 'from-indigo-500 to-blue-600',
      description: 'Requirements analysis and planning' 
    }
  ]

  const toggleAgent = (agentId) => {
    const newSelectedAgents = selectedAgents.includes(agentId)
      ? selectedAgents.filter(id => id !== agentId)
      : [...selectedAgents, agentId]
    
    onAgentsChange(newSelectedAgents)
  }

  const getSelectedAgentNames = () => {
    return agents
      .filter(agent => selectedAgents.includes(agent.id))
      .map(agent => agent.name)
      .join(', ')
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200"
      >
        <UserGroupIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {selectedAgents.length > 0 
            ? `${selectedAgents.length} Agent${selectedAgents.length > 1 ? 's' : ''}`
            : 'Select Agents'
          }
        </span>
        <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 z-50 max-h-96 overflow-y-auto"
          >
            <div className="p-4">
              <div className="mb-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  AI Agents
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Select specialized agents to help with your task
                </p>
              </div>
              
              <div className="space-y-2">
                {agents.map((agent) => {
                  const Icon = agent.icon
                  const isSelected = selectedAgents.includes(agent.id)
                  
                  return (
                    <motion.button
                      key={agent.id}
                      onClick={() => toggleAgent(agent.id)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${agent.color} shadow-md`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {agent.name}
                          </h4>
                          {isSelected && (
                            <CheckIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {agent.description}
                        </p>
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              {selectedAgents.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Selected: {getSelectedAgentNames()}
                    </span>
                    <button
                      onClick={() => onAgentsChange([])}
                      className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                    >
                      Clear All
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default AgentSelector