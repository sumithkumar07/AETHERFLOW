import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDownIcon,
  CodeBracketIcon,
  PaintBrushIcon,
  BeakerIcon,
  LinkIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'
import { useChatStore } from '../store/chatStore'

const AgentSelector = () => {
  const { selectedAgent, setSelectedAgent } = useChatStore()
  const [isOpen, setIsOpen] = useState(false)

  const agents = [
    {
      id: 'developer',
      name: 'Developer Agent',
      description: 'Code generation, debugging, and architecture',
      icon: CodeBracketIcon,
      color: 'from-blue-500 to-cyan-600',
      specialties: ['React', 'Python', 'FastAPI', 'Database Design']
    },
    {
      id: 'designer',
      name: 'Designer Agent',
      description: 'UI/UX design, styling, and user experience',
      icon: PaintBrushIcon,
      color: 'from-purple-500 to-pink-600',
      specialties: ['Tailwind CSS', 'Figma', 'Design Systems', 'Accessibility']
    },
    {
      id: 'tester',
      name: 'Tester Agent',
      description: 'Testing strategies, QA, and bug detection',
      icon: BeakerIcon,
      color: 'from-green-500 to-emerald-600',
      specialties: ['Unit Testing', 'E2E Testing', 'Performance', 'Security']
    },
    {
      id: 'integrator',
      name: 'Integrator Agent',
      description: 'API integrations and third-party services',
      icon: LinkIcon,
      color: 'from-orange-500 to-red-600',
      specialties: ['REST APIs', 'GraphQL', 'Webhooks', 'Authentication']
    },
    {
      id: 'orchestrator',
      name: 'Team Orchestrator',
      description: 'Project management and team coordination',
      icon: UserGroupIcon,
      color: 'from-indigo-500 to-purple-600',
      specialties: ['Planning', 'Coordination', 'Reviews', 'Architecture']
    },
    {
      id: 'devops',
      name: 'DevOps Agent',
      description: 'Deployment, monitoring, and infrastructure',
      icon: WrenchScrewdriverIcon,
      color: 'from-gray-500 to-slate-600',
      specialties: ['Docker', 'CI/CD', 'Monitoring', 'Cloud Services']
    }
  ]

  const currentAgent = agents.find(a => a.id === selectedAgent) || agents[0]
  const CurrentIcon = currentAgent.icon

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${currentAgent.color} p-1 flex items-center justify-center`}>
          <CurrentIcon className="w-4 h-4 text-white" />
        </div>
        <div className="text-left">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {currentAgent.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Active
          </div>
        </div>
        <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50"
          >
            <div className="p-2">
              {agents.map((agent) => {
                const Icon = agent.icon
                return (
                  <button
                    key={agent.id}
                    onClick={() => {
                      setSelectedAgent(agent.id)
                      setIsOpen(false)
                    }}
                    className={`w-full flex items-start space-x-3 p-3 rounded-lg transition-colors text-left ${
                      selectedAgent === agent.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${agent.color} p-1.5 flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">{agent.name}</span>
                        {selectedAgent === agent.id && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-2">
                        {agent.description}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {agent.specialties.slice(0, 3).map((specialty, index) => (
                          <span
                            key={index}
                            className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                          >
                            {specialty}
                          </span>
                        ))}
                        {agent.specialties.length > 3 && (
                          <span className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                            +{agent.specialties.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Switch agents anytime for specialized assistance
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
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