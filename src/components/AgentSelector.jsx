import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDownIcon,
  CheckIcon,
  StarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import { useChatStore, AI_AGENTS } from '../store/chatStore'

const AgentSelector = ({ className = '' }) => {
  const { selectedAgent, setSelectedAgent } = useChatStore()
  const [isOpen, setIsOpen] = useState(false)
  const [showDetails, setShowDetails] = useState({})
  
  const availableAgents = Object.entries(AI_AGENTS)
  const selectedAgentInfo = AI_AGENTS[selectedAgent]

  const getAgentColor = (agentId) => {
    const colors = {
      developer: 'from-blue-500 to-cyan-500',
      designer: 'from-purple-500 to-pink-500',
      tester: 'from-green-500 to-emerald-500',
      integrator: 'from-orange-500 to-red-500',
      analyst: 'from-indigo-500 to-purple-500'
    }
    return colors[agentId] || 'from-gray-500 to-gray-600'
  }

  return (
    <div className={`relative ${className}`}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 bg-gradient-to-br ${getAgentColor(selectedAgent)} rounded-lg flex items-center justify-center text-lg`}>
            {selectedAgentInfo?.icon}
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedAgentInfo?.name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {selectedAgentInfo?.capabilities[0]} • {selectedAgentInfo?.capabilities.length} skills
            </span>
          </div>
        </div>
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDownIcon className="w-5 h-5 text-gray-400" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-2 space-y-1">
              {availableAgents.map(([agentId, agent], index) => {
                const isSelected = agentId === selectedAgent
                
                return (
                  <motion.div
                    key={agentId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative"
                  >
                    <button
                      onClick={() => {
                        setSelectedAgent(agentId)
                        setIsOpen(false)
                      }}
                      onMouseEnter={() => setShowDetails({ ...showDetails, [agentId]: true })}
                      onMouseLeave={() => setShowDetails({ ...showDetails, [agentId]: false })}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                        isSelected 
                          ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 bg-gradient-to-br ${getAgentColor(agentId)} rounded-lg flex items-center justify-center text-lg ${
                          isSelected ? 'shadow-lg' : ''
                        }`}>
                          {agent.icon}
                        </div>
                        
                        <div className="flex flex-col items-start">
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium ${
                              isSelected 
                                ? 'text-purple-900 dark:text-purple-100' 
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {agent.name}
                            </span>
                            {agentId === 'developer' && (
                              <StarIcon className="w-3 h-3 text-yellow-500 fill-current" title="Most Popular" />
                            )}
                          </div>
                          
                          <p className="text-xs text-gray-500 dark:text-gray-400 text-left">
                            {agent.description}
                          </p>
                          
                          <div className="flex items-center space-x-1 mt-1">
                            <UserGroupIcon className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {agent.capabilities.length} capabilities
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center"
                        >
                          <CheckIcon className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </button>

                    {/* Agent Details Tooltip */}
                    <AnimatePresence>
                      {showDetails[agentId] && (
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="absolute left-full top-0 ml-2 w-80 bg-gray-900 dark:bg-gray-800 text-white rounded-lg p-4 shadow-2xl z-60 border border-gray-700"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 bg-gradient-to-br ${getAgentColor(agentId)} rounded-lg flex items-center justify-center text-xl`}>
                                {agent.icon}
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm flex items-center space-x-2">
                                  <span>{agent.name}</span>
                                  {agentId === 'developer' && (
                                    <StarIcon className="w-3 h-3 text-yellow-500 fill-current" />
                                  )}
                                </h4>
                                <p className="text-xs text-gray-300">{agent.description}</p>
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-xs text-gray-400 font-medium">Core Capabilities:</span>
                              <div className="grid grid-cols-2 gap-1 mt-2">
                                {agent.capabilities.map((capability, i) => (
                                  <motion.div
                                    key={capability}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="px-2 py-1 text-xs bg-gray-800 dark:bg-gray-700 rounded-md text-center"
                                  >
                                    {capability}
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="pt-2 border-t border-gray-700">
                              <span className="text-xs text-gray-400">Specialization:</span>
                              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                                {agent.prompt.substring(0, 120)}...
                              </p>
                            </div>
                            
                            {agentId === selectedAgent && (
                              <div className="flex items-center space-x-2 px-2 py-1 bg-purple-900/30 rounded-md">
                                <CheckIcon className="w-3 h-3 text-purple-400" />
                                <span className="text-xs text-purple-300">Currently Active</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                <UserGroupIcon className="w-4 h-4" />
                <span>Multi-Agent AI System</span>
                <span className="w-1 h-1 bg-gray-400 rounded-full" />
                <span>Specialized Expertise</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
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