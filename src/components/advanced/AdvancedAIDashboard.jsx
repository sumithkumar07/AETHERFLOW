import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CpuChipIcon, 
  BeakerIcon, 
  ChartBarIcon, 
  CloudIcon,
  MicrophoneIcon,
  PresentationChartBarIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline'
import { useAdvancedAIStore } from '../../store/advancedAIStore'
import toast from 'react-hot-toast'

/**
 * Advanced AI Dashboard - Main interface for all advanced AI features
 * Connects to all advanced backend AI services and provides unified interface
 */
const AdvancedAIDashboard = () => {
  const {
    availableModels,
    modelPerformance,
    activeAgents,
    agentOrchestration,
    smartChatHistory,
    voiceCapabilities,
    supportedDiagramTypes,
    realTimeAnalytics,
    loading,
    error,
    initialize,
    fetchAvailableModels,
    fetchModelPerformance,
    fetchActiveAgents,
    smartChat,
    selectOptimalModel,
    fetchVoiceCapabilities
  } = useAdvancedAIStore()

  const [selectedTab, setSelectedTab] = useState('overview')
  const [chatMessage, setChatMessage] = useState('')
  const [selectedTask, setSelectedTask] = useState('')

  useEffect(() => {
    initialize()
  }, [initialize])

  const handleSmartChat = async () => {
    if (!chatMessage.trim()) return
    
    const result = await smartChat(chatMessage, {
      feature: 'dashboard',
      tab: selectedTab
    })
    
    if (result.success) {
      setChatMessage('')
    }
  }

  const handleOptimalModelSelection = async () => {
    if (!selectedTask.trim()) return
    
    const result = await selectOptimalModel(selectedTask)
    if (result.success) {
      toast.success(`Selected optimal model: ${result.model}`)
      setSelectedTask('')
    }
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: PresentationChartBarIcon },
    { id: 'models', name: 'AI Models', icon: CpuChipIcon },
    { id: 'agents', name: 'Multi-Agents', icon: BeakerIcon },
    { id: 'visual', name: 'Visual Programming', icon: CodeBracketIcon },
    { id: 'voice', name: 'Voice Interface', icon: MicrophoneIcon },
    { id: 'analytics', name: 'AI Analytics', icon: ChartBarIcon }
  ]

  if (loading && !availableModels.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Initializing Advanced AI Services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Advanced AI Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Comprehensive AI intelligence and automation platform
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CpuChipIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Available Models
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {availableModels.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BeakerIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Active Agents
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {agentOrchestration.activeAgents || 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CodeBracketIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Diagram Types
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {supportedDiagramTypes.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MicrophoneIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Voice Commands
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {voiceCapabilities.supported_intents?.length || 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`${
                    selectedTab === tab.id
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Smart AI Chat
                </h3>
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Ask anything using advanced AI intelligence..."
                    className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleSmartChat()}
                  />
                  <button
                    onClick={handleSmartChat}
                    disabled={loading || !chatMessage.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Send'}
                  </button>
                </div>
                
                {/* Recent Smart Chat History */}
                {smartChatHistory.length > 0 && (
                  <div className="mt-4 max-h-64 overflow-y-auto space-y-2">
                    {smartChatHistory.slice(-5).map((chat) => (
                      <div key={chat.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          <strong>You:</strong> {chat.message}
                        </div>
                        <div className="text-sm text-gray-800 dark:text-gray-200 mt-1">
                          <strong>AI ({chat.modelUsed}):</strong> {chat.response}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Response time: {chat.processingTime}ms
                          {chat.cached && ' (cached)'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Optimal Model Selection
                </h3>
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={selectedTask}
                    onChange={(e) => setSelectedTask(e.target.value)}
                    placeholder="Describe your task to find the optimal AI model..."
                    className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleOptimalModelSelection}
                    disabled={loading || !selectedTask.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    Find Model
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AI Models Tab */}
          {selectedTab === 'models' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Available AI Models
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableModels.map((model) => (
                  <motion.div
                    key={model.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                  >
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {model.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Max Tokens: {model.max_tokens?.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Cost: ${model.cost_per_token} per token
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {model.specialized_for?.map((specialty) => (
                        <span
                          key={specialty}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 flex justify-between text-sm">
                      <span className="text-gray-500">Speed: {model.speed_score}/10</span>
                      <span className="text-gray-500">Quality: {model.quality_score}/10</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {availableModels.length === 0 && (
                <div className="text-center py-8">
                  <CpuChipIcon className="h-12 w-12 text-gray-400 mx-auto" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No models available
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Loading AI models...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Multi-Agents Tab */}
          {selectedTab === 'agents' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Multi-Agent System
              </h3>
              
              {/* Agent Orchestration Status */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Orchestration Status
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Status</p>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                      {agentOrchestration.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Active Agents</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {agentOrchestration.activeAgents}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Queue Size</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {agentOrchestration.queueSize}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Uptime</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {agentOrchestration.uptime || '0h 0m'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Active Agents */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {agent.name}
                      </h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        agent.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                      }`}>
                        {agent.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {agent.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {agent.capabilities?.map((capability) => (
                        <span
                          key={capability}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                        >
                          {capability}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Voice Interface Tab */}
          {selectedTab === 'voice' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Voice Interface
              </h3>
              
              {voiceCapabilities.supported_intents && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    Supported Voice Commands
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {voiceCapabilities.supported_intents.map((intent) => (
                      <div
                        key={intent.intent}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                      >
                        <h5 className="font-medium text-gray-900 dark:text-white">
                          {intent.intent.replace('_', ' ').toUpperCase()}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {intent.description}
                        </p>
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Examples:</p>
                          <ul className="text-xs text-gray-600 dark:text-gray-300 list-disc list-inside">
                            {intent.examples?.slice(0, 2).map((example, index) => (
                              <li key={index}>"{example}"</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Other tabs can be implemented similarly */}
        </div>
      </div>
    </div>
  )
}

export default AdvancedAIDashboard