import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  DocumentTextIcon,
  CogIcon,
  PlayIcon,
  CodeBracketIcon,
  ChartBarIcon,
  UsersIcon,
  CloudArrowUpIcon,
  BeakerIcon,
  PaintBrushIcon,
  EyeIcon,
  FolderTreeIcon,
  WrenchScrewdriverIcon,
  LightBulbIcon,
  MicrophoneIcon,
  BoltIcon,
  RocketLaunchIcon,
  BuildingStorefrontIcon,
  CircleStackIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { useProjectStore } from '../store/projectStore'
import { useChatStore } from '../store/chatStore'
import { useEnhancedProjectStore } from '../store/enhancedProjectStore'
import { useAdvancedFeaturesStore } from '../store/advancedFeaturesStore'
import LoadingStates from '../components/LoadingStates'
import ChatMessage from '../components/ChatMessage'
import ModelSelector from '../components/ModelSelector'
import AgentSelector from '../components/AgentSelector'
import SmartSuggestionsPanel from '../components/SmartSuggestionsPanel'
import ContextMemoryManager from '../components/ContextMemoryManager'
import VoiceCommandProcessor from '../components/VoiceCommandProcessor'
import FlowStateOptimizer from '../components/FlowStateOptimizer'
import toast from 'react-hot-toast'

const IndividualProject = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  
  // Core stores
  const { 
    currentProject, 
    fetchProject, 
    loading: projectLoading,
    buildProject,
    deployProject,
    fetchProjectFiles,
    projectMetrics,
    buildLogs,
    deploymentStatus
  } = useProjectStore()
  
  const { 
    messages, 
    loading: chatLoading, 
    sendMessage, 
    fetchMessages,
    selectedModel,
    selectedAgent,
    getSmartSuggestions,
    analyzeCode,
    generateProjectInsights
  } = useChatStore()
  
  // Enhanced features store
  const { 
    initializeEnhancedFeatures, 
    trackDevelopmentPattern,
    updateContextAwareness,
    getEnhancedProjectData
  } = useEnhancedProjectStore()
  
  // Advanced features store
  const {
    fetchAnalytics,
    initializeVoiceInterface,
    fetchWorkflows,
    analyzeArchitecture,
    fetchAdaptiveThemes,
    analyzePerformance
  } = useAdvancedFeaturesStore()
  
  const [message, setMessage] = useState('')
  const [activePanel, setActivePanel] = useState('structure')
  const [rightPanelTab, setRightPanelTab] = useState('context')
  
  // Enhancement feature toggles
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(false)
  const [showVoiceCommands, setShowVoiceCommands] = useState(false)
  const [adaptiveMode, setAdaptiveMode] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)

  // Initialize everything when project loads
  useEffect(() => {
    if (projectId) {
      // Core initialization
      fetchProject(projectId)
      fetchMessages(projectId)
      
      // Enhanced features initialization
      initializeEnhancedFeatures(projectId)
      updateContextAwareness('project_workspace', { projectId })
      
      // Advanced features initialization
      fetchAnalytics(projectId)
      initializeVoiceInterface()
      fetchWorkflows()
      analyzeArchitecture(projectId)
      fetchAdaptiveThemes()
      analyzePerformance(projectId)
      
      // Generate project insights
      generateProjectInsights(projectId)
    }
  }, [projectId])

  // Track user interactions for flow state analysis
  useEffect(() => {
    if (projectId && messages.length > 0) {
      trackDevelopmentPattern(projectId, 'chat_interaction', {
        messageCount: messages.length,
        activeAgent: selectedAgent,
        selectedModel: selectedModel
      })
    }
  }, [messages.length, projectId, selectedAgent, selectedModel, trackDevelopmentPattern])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!message.trim()) return
    
    // Track development pattern
    trackDevelopmentPattern(projectId, 'send_message', {
      messageLength: message.length,
      hasCode: message.includes('```'),
      agent: selectedAgent
    })
    
    const result = await sendMessage({
      content: message,
      projectId: projectId,
      model: selectedModel,
      agent: selectedAgent
    })
    
    if (result.success) {
      setMessage('')
    } else {
      toast.error(result.error || 'Failed to send message')
    }
  }

  const handleVoiceCommand = async (commandData) => {
    switch (commandData.action) {
      case 'show_files':
        setActivePanel('structure')
        await fetchProjectFiles(projectId)
        break
      case 'run_tests':
        setActivePanel('testing')
        toast.success('Running tests...')
        break
      case 'start_build':
        await handleBuildProject()
        break
      case 'deploy':
        await handleDeployProject()
        break
      case 'chat_hub':
        navigate('/chat')
        break
      case 'show_analytics':
        setRightPanelTab('analytics')
        setShowAnalytics(true)
        break
      default:
        console.log('Unhandled voice command:', commandData)
    }
  }

  const handleBuildProject = async () => {
    const result = await buildProject(projectId)
    if (result.success) {
      setActivePanel('tools')
      toast.success('Build started! Check the logs for progress.')
    }
  }

  const handleDeployProject = async () => {
    const result = await deployProject(projectId)
    if (result.success) {
      setActivePanel('deployment')
      toast.success('Deployment started! Check status for updates.')
    }
  }

  const handleQuickAction = (action) => {
    switch (action) {
      case 'analyze_code':
        if (currentProject?.files?.length > 0) {
          const firstFile = currentProject.files[0]
          analyzeCode(firstFile.content, firstFile.language)
          setRightPanelTab('analysis')
        }
        break
      case 'optimize_performance':
        analyzePerformance(projectId)
        setRightPanelTab('performance')
        break
      case 'generate_insights':
        generateProjectInsights(projectId)
        setRightPanelTab('insights')
        break
      default:
        console.log('Unknown quick action:', action)
    }
  }

  const leftPanelItems = [
    { id: 'structure', name: 'Project Structure', icon: FolderTreeIcon, count: currentProject?.files?.length || 0 },
    { id: 'tools', name: 'Development Tools', icon: WrenchScrewdriverIcon, count: 4 },
    { id: 'testing', name: 'Testing Suite', icon: BeakerIcon, count: projectMetrics[projectId]?.testCount || 0 },
    { id: 'deployment', name: 'Deployment', icon: CloudArrowUpIcon, status: deploymentStatus[projectId] },
    { id: 'design', name: 'Design System', icon: PaintBrushIcon, count: 3 }
  ]

  const rightPanelItems = [
    { id: 'context', name: 'Project Context', icon: DocumentTextIcon },
    { id: 'agents', name: 'Active Agents', icon: UsersIcon },
    { id: 'metrics', name: 'Project Metrics', icon: ChartBarIcon },
    { id: 'integrations', name: 'Integrations', icon: CogIcon },
    { id: 'activity', name: 'Recent Activity', icon: EyeIcon },
    { id: 'memory', name: 'Context Memory', icon: DocumentTextIcon },
    { id: 'flow', name: 'Flow State', icon: BoltIcon },
    { id: 'voice', name: 'Voice Commands', icon: MicrophoneIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'workflows', name: 'Workflows', icon: ArrowPathIcon },
    { id: 'architecture', name: 'Architecture', icon: BuildingStorefrontIcon }
  ]

  if (projectLoading) {
    return <LoadingStates.FullScreen message="Loading project..." />
  }

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Project not found</h2>
          <button
            onClick={() => navigate('/chat')}
            className="btn-primary"
          >
            Back to Chat Hub
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      <div className="flex h-screen">
        {/* Left Panel - Enhanced Project Management */}
        <div className="w-80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 overflow-y-auto">
          <div className="p-6">
            {/* Project Header */}
            <div className="mb-6">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {currentProject.name}
              </h1>
              <div className="flex items-center space-x-2 mb-3">
                <span className={`px-2 py-1 text-xs rounded-full ${currentProject.statusColor}`}>
                  {currentProject.status}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {currentProject.progress || 0}% complete
                </span>
              </div>
              
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBuildProject}
                  disabled={deploymentStatus[projectId] === 'building'}
                  className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 flex items-center space-x-1"
                >
                  <RocketLaunchIcon className="w-3 h-3" />
                  <span>{deploymentStatus[projectId] === 'building' ? 'Building...' : 'Build'}</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeployProject}
                  disabled={deploymentStatus[projectId] === 'deploying' || currentProject.status !== 'ready'}
                  className="px-3 py-1.5 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 flex items-center space-x-1"
                >
                  <CloudArrowUpIcon className="w-3 h-3" />
                  <span>{deploymentStatus[projectId] === 'deploying' ? 'Deploying...' : 'Deploy'}</span>
                </motion.button>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="space-y-2">
              {leftPanelItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePanel(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activePanel === item.id
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </div>
                    {item.count !== undefined && (
                      <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                        {item.count}
                      </span>
                    )}
                    {item.status && (
                      <div className={`w-2 h-2 rounded-full ${
                        item.status === 'deployed' ? 'bg-green-500' :
                        item.status === 'building' || item.status === 'deploying' ? 'bg-yellow-500 animate-pulse' :
                        item.status === 'error' ? 'bg-red-500' : 'bg-gray-400'
                      }`} />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Active Panel Content */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                {leftPanelItems.find(item => item.id === activePanel)?.name}
              </h3>
              
              {activePanel === 'structure' && (
                <div className="space-y-2 text-sm">
                  {currentProject.files && currentProject.files.length > 0 ? (
                    currentProject.files.slice(0, 5).map((file, index) => (
                      <div key={index} className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <DocumentTextIcon className="w-4 h-4" />
                        <span className="font-mono text-xs">{file.path}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <FolderTreeIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500 dark:text-gray-500">No files yet</p>
                    </div>
                  )}
                </div>
              )}

              {activePanel === 'tools' && (
                <div className="space-y-3">
                  <button 
                    onClick={() => handleQuickAction('analyze_code')}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 w-full text-left"
                  >
                    <PlayIcon className="w-4 h-4" />
                    <span>Live Preview</span>
                  </button>
                  <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 w-full text-left">
                    <CodeBracketIcon className="w-4 h-4" />
                    <span>Code Editor</span>
                  </button>
                  <button 
                    onClick={() => handleQuickAction('optimize_performance')}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 w-full text-left"
                  >
                    <BoltIcon className="w-4 h-4" />
                    <span>Performance</span>
                  </button>
                  <button 
                    onClick={() => handleQuickAction('generate_insights')}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 w-full text-left"
                  >
                    <LightBulbIcon className="w-4 h-4" />
                    <span>AI Insights</span>
                  </button>
                </div>
              )}

              {activePanel === 'testing' && (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tests Passing</span>
                    <span className="text-green-600 dark:text-green-400">
                      {projectMetrics[projectId]?.testsPassing || '12'}/
                      {projectMetrics[projectId]?.totalTests || '12'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Coverage</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {projectMetrics[projectId]?.testCoverage || '85'}%
                    </span>
                  </div>
                  <button className="w-full mt-3 px-3 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium transition-colors">
                    Run All Tests
                  </button>
                </div>
              )}

              {activePanel === 'deployment' && (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      deploymentStatus[projectId] === 'deployed' ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <span className="text-gray-600 dark:text-gray-400">
                      Production: {deploymentStatus[projectId] === 'deployed' ? 'Live' : 'Not deployed'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      deploymentStatus[projectId] === 'building' ? 'bg-yellow-500 animate-pulse' : 'bg-gray-400'
                    }`} />
                    <span className="text-gray-600 dark:text-gray-400">
                      Build: {deploymentStatus[projectId] === 'building' ? 'In progress' : 'Ready'}
                    </span>
                  </div>
                  
                  {buildLogs.length > 0 && (
                    <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs font-mono max-h-32 overflow-y-auto">
                      {buildLogs.slice(-5).map((log, index) => (
                        <div key={index} className="text-gray-600 dark:text-gray-400">
                          {log.message}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activePanel === 'design' && (
                <div className="space-y-2 text-sm">
                  <div className="text-gray-600 dark:text-gray-400">Color Palette</div>
                  <div className="flex space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded shadow-sm"></div>
                    <div className="w-4 h-4 bg-purple-500 rounded shadow-sm"></div>
                    <div className="w-4 h-4 bg-green-500 rounded shadow-sm"></div>
                    <div className="w-4 h-4 bg-yellow-500 rounded shadow-sm"></div>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 mt-2">Typography</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Inter, system-ui, sans-serif</div>
                  <div className="text-gray-600 dark:text-gray-400 mt-2">Components</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {currentProject.techStackDisplay?.includes('React') ? 'React Components' : 'Web Components'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center Panel - AI Conversation */}
        <div className="flex-1 flex flex-col">
          {/* Enhanced Header */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <ModelSelector />
                <AgentSelector />
              </div>
              <div className="flex items-center space-x-3">
                {/* Smart Suggestions Toggle */}
                <button
                  onClick={() => setShowSmartSuggestions(!showSmartSuggestions)}
                  className={`p-2 rounded-lg transition-colors ${
                    showSmartSuggestions
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  title="Smart Suggestions"
                >
                  <LightBulbIcon className="w-5 h-5" />
                </button>
                
                {/* Adaptive Mode Toggle */}
                <button
                  onClick={() => setAdaptiveMode(!adaptiveMode)}
                  className={`p-2 rounded-lg transition-colors ${
                    adaptiveMode
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  title="Adaptive Interface"
                >
                  <BoltIcon className="w-5 h-5" />
                </button>

                {/* Voice Commands Toggle */}
                <button
                  onClick={() => setShowVoiceCommands(!showVoiceCommands)}
                  className={`p-2 rounded-lg transition-colors ${
                    showVoiceCommands
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  title="Voice Commands"
                >
                  <MicrophoneIcon className="w-5 h-5" />
                </button>
                
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {messages.length} messages
                </div>
              </div>
            </div>
          </div>

          {/* Smart Suggestions Panel */}
          {showSmartSuggestions && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border-b border-yellow-200 dark:border-yellow-800">
              <SmartSuggestionsPanel suggestions={getSmartSuggestions()} onSuggestionClick={setMessage} />
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  Start building with AI
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Ask questions, request features, or get help with your {currentProject.name} project.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    "How do I add authentication?",
                    "Create a new component",
                    "Set up the database connection",
                    "Add styling with Tailwind",
                    "Implement error handling",
                    "Optimize performance"
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setMessage(suggestion)}
                      className="px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <ChatMessage
                  key={index}
                  message={msg}
                  isUser={msg.sender === 'user'}
                />
              ))
            )}
            
            {chatLoading && (
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">AI</span>
                </div>
                <div className="flex-1">
                  <LoadingStates.Inline message="AI is thinking..." />
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Message Input */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-4">
              <div className="flex-1">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Ask ${selectedAgent} agent anything about ${currentProject.name}...`}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage(e)
                    }
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={!message.trim() || chatLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Panel - Enhanced Project Context */}
        <div className="w-80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-l border-gray-200/50 dark:border-gray-700/50 overflow-y-auto">
          <div className="p-6">
            {/* Enhanced Tabbed Interface */}
            <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
              {rightPanelItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setRightPanelTab(item.id)}
                    className={`flex items-center space-x-1 px-2 py-2 text-xs font-medium rounded-t-lg transition-colors ${
                      rightPanelTab === item.id
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-b-2 border-blue-500'
                        : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span className="hidden sm:inline">{item.name.split(' ')[0]}</span>
                  </button>
                )
              })}
            </div>

            {/* Enhanced Tab Content */}
            <div className="space-y-6">
              {rightPanelTab === 'context' && (
                <>
                  {/* Tech Stack */}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentProject.tech_stack?.map((tech, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded"
                        >
                          {tech}
                        </span>
                      )) || (
                        <span className="text-sm text-gray-500 dark:text-gray-400">No tech stack defined</span>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Project Metrics */}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">Project Metrics</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Files</span>
                        <span className="text-gray-900 dark:text-white">
                          {currentProject.files?.length || projectMetrics[projectId]?.filesCount || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="text-gray-900 dark:text-white">{currentProject.progress || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Lines of Code</span>
                        <span className="text-gray-900 dark:text-white">
                          {projectMetrics[projectId]?.linesOfCode || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Last Activity</span>
                        <span className="text-gray-900 dark:text-white">
                          {currentProject.lastActivityText || '2h ago'}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {rightPanelTab === 'agents' && (
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Active Agents</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Developer Agent</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        selectedAgent === 'designer' ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Designer Agent</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        selectedAgent === 'tester' ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">QA Agent</span>
                    </div>
                  </div>
                </div>
              )}

              {rightPanelTab === 'memory' && (
                <ContextMemoryManager projectId={projectId} />
              )}

              {rightPanelTab === 'flow' && (
                <FlowStateOptimizer projectId={projectId} />
              )}

              {rightPanelTab === 'voice' && (
                <VoiceCommandProcessor 
                  projectId={projectId} 
                  onCommand={handleVoiceCommand}
                />
              )}

              {rightPanelTab === 'activity' && (
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Recent Activity</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-gray-700 dark:text-gray-300">Updated project dependencies</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-gray-700 dark:text-gray-300">Added authentication module</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">15 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-gray-700 dark:text-gray-300">Build completed successfully</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {rightPanelTab === 'analytics' && showAnalytics && (
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Analytics Dashboard</h3>
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Performance Score</div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">94</div>
                      <div className="text-xs text-blue-700 dark:text-blue-400">+5% from last week</div>
                    </div>
                    
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-sm font-medium text-green-900 dark:text-green-300">Code Quality</div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">A+</div>
                      <div className="text-xs text-green-700 dark:text-green-400">Excellent</div>
                    </div>
                  </div>
                </div>
              )}

              {rightPanelTab === 'integrations' && (
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Connected Services</h3>
                  <div className="space-y-2">
                    {[
                      { name: 'GitHub', status: 'connected', color: 'green' },
                      { name: 'MongoDB', status: 'connected', color: 'green' },
                      { name: 'Vercel', status: 'available', color: 'gray' }
                    ].map((integration, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{integration.name}</span>
                        <div className={`w-2 h-2 rounded-full bg-${integration.color}-500`}></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IndividualProject