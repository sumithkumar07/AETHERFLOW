import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeftIcon,
  PlayIcon,
  RocketLaunchIcon,
  ShareIcon,
  Cog6ToothIcon,
  CloudArrowUpIcon,
  FolderIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  ChartBarIcon,
  LinkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { useProjectStore } from '../store/projectStore'
import { useChatStore } from '../store/chatStore'
import ChatMessage from '../components/ChatMessage'
import ModelSelector from '../components/ModelSelector'
import AgentSelector from '../components/AgentSelector'
import AICodeAssistant from '../components/AICodeAssistant'
import CollaborationIndicators from '../components/CollaborationIndicators'
import toast from 'react-hot-toast'

const IndividualProject = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { projects, currentProject, selectProject, updateProject, deployProject, isLoading } = useProjectStore()
  const { sendMessage, isLoading: isChatLoading } = useChatStore()
  
  const [input, setInput] = useState('')
  const [selectedModel, setSelectedModel] = useState('gpt-4.1-nano')
  const [selectedAgents, setSelectedAgents] = useState(['developer'])
  const [conversation, setConversation] = useState([])
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const project = currentProject || projects.find(p => p.id === projectId)

  useEffect(() => {
    if (projectId && !currentProject) {
      selectProject(projectId)
    }
  }, [projectId, currentProject, selectProject])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [input])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || isChatLoading) return

    const message = input.trim()
    setInput('')
    
    // Add user message to conversation
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString()
    }
    setConversation(prev => [...prev, userMessage])

    try {
      // Enhanced message with agent context and project context
      const enhancedMessage = `Project: ${project?.name || 'Untitled'}\nAgents: ${selectedAgents.join(', ')}\nRequest: ${message}`
      const response = await sendMessage(enhancedMessage, selectedModel)
      
      // Add AI response to conversation
      const aiMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      }
      setConversation(prev => [...prev, aiMessage])
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  const handleDeploy = async () => {
    if (!project) return
    try {
      await deployProject(project.id)
      toast.success('Deployment started!')
    } catch (error) {
      toast.error('Failed to deploy project')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'initializing': return 'text-blue-600'
      case 'ready': return 'text-green-600'
      case 'building': return 'text-yellow-600'
      case 'deployed': return 'text-emerald-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'initializing': return <ClockIcon className="w-4 h-4" />
      case 'ready': return <CheckCircleIcon className="w-4 h-4" />
      case 'building': return <PlayIcon className="w-4 h-4" />
      case 'deployed': return <CheckCircleIcon className="w-4 h-4" />
      case 'error': return <ExclamationCircleIcon className="w-4 h-4" />
      default: return <ClockIcon className="w-4 h-4" />
    }
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <FolderIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Project not found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The project you're looking for doesn't exist</p>
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
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/chat')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {project.name}
                </h1>
                <div className={`flex items-center space-x-2 text-sm ${getStatusColor(project.status)}`}>
                  {getStatusIcon(project.status)}
                  <span className="capitalize">{project.status}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDeploy}
              disabled={isLoading || project.status === 'building'}
              className="btn-secondary flex items-center space-x-2"
            >
              <RocketLaunchIcon className="w-4 h-4" />
              <span>Deploy</span>
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
              <ShareIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
              <Cog6ToothIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Three-Panel Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Project Structure & Tools */}
        <div className="w-72 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col">
          {/* Project Structure */}
          <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <FolderIcon className="w-4 h-4 mr-2" />
              Project Structure
            </h3>
            <div className="space-y-1 text-sm">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <DocumentTextIcon className="w-4 h-4" />
                <span>package.json</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 ml-2">
                <FolderIcon className="w-4 h-4" />
                <span>src/</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 ml-4">
                <FolderIcon className="w-4 h-4" />
                <span>components/</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 ml-4">
                <FolderIcon className="w-4 h-4" />
                <span>pages/</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 ml-4">
                <FolderIcon className="w-4 h-4" />
                <span>hooks/</span>
              </div>
            </div>
          </div>

          {/* Development Tools */}
          <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              🛠️ Development Tools
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-800 dark:text-green-300">Live Preview</span>
                  <span className="text-xs text-green-600 dark:text-green-400">Running</span>
                </div>
                <button className="w-full py-1.5 px-3 bg-green-100 hover:bg-green-200 dark:bg-green-800/30 dark:hover:bg-green-700/30 text-green-800 dark:text-green-300 text-sm rounded-md transition-colors">
                  Open Preview
                </button>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">📦 Dependencies</h4>
                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <div>react: ^18.2</div>
                  <div>tailwindcss: ^3.3</div>
                  <div>framer-motion: ^10.16</div>
                </div>
                <button className="mt-2 w-full py-1.5 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-300 text-sm rounded-md transition-colors flex items-center justify-center space-x-1">
                  <PlusIcon className="w-3 h-3" />
                  <span>Add Package</span>
                </button>
              </div>
            </div>
          </div>

          {/* Testing & Deployment */}
          <div className="p-4 flex-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              🧪 Testing & Deployment
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Tests</span>
                  <span className="text-xs text-green-600 dark:text-green-400">12/15 passing</span>
                </div>
                <button className="w-full py-1.5 px-3 bg-blue-100 hover:bg-blue-200 dark:bg-blue-800/30 dark:hover:bg-blue-700/30 text-blue-800 dark:text-blue-300 text-sm rounded-md transition-colors">
                  Run All Tests
                </button>
              </div>

              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-800 dark:text-purple-300">Deployment</span>
                  <span className="text-xs text-purple-600 dark:text-purple-400">Ready</span>
                </div>
                <button 
                  onClick={handleDeploy}
                  className="w-full py-1.5 px-3 bg-purple-100 hover:bg-purple-200 dark:bg-purple-800/30 dark:hover:bg-purple-700/30 text-purple-800 dark:text-purple-300 text-sm rounded-md transition-colors"
                >
                  Deploy Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel - Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            {conversation.length > 0 ? (
              <div className="max-w-4xl mx-auto space-y-6">
                <AnimatePresence>
                  {conversation.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <ChatMessage message={message} />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isChatLoading && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          <div className="typing-dot"></div>
                          <div className="typing-dot"></div>
                          <div className="typing-dot"></div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          AI agents working...
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-2xl">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <CodeBracketIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    Let's build {project.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    I'm here to help you develop, test, and deploy your project. What would you like to work on?
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <button 
                      onClick={() => setInput('Help me set up the project structure')}
                      className="p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-lg border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 transition-colors text-left"
                    >
                      Set up project structure
                    </button>
                    <button 
                      onClick={() => setInput('Create the main components')}
                      className="p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-lg border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 transition-colors text-left"
                    >
                      Create main components
                    </button>
                    <button 
                      onClick={() => setInput('Add styling and design')}
                      className="p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-lg border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 transition-colors text-left"
                    >
                      Add styling and design
                    </button>
                    <button 
                      onClick={() => setInput('Help with testing and deployment')}
                      className="p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-lg border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 transition-colors text-left"
                    >
                      Testing and deployment
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 p-4">
            <div className="max-w-4xl mx-auto">
              {/* Agent and Model Selectors */}
              <div className="flex items-center justify-between mb-4">
                <AgentSelector 
                  selectedAgents={selectedAgents}
                  onAgentsChange={setSelectedAgents}
                />
                <ModelSelector 
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                />
              </div>
              
              <form onSubmit={handleSendMessage} className="relative">
                <div className="flex items-end space-x-3">
                  <div className="flex-1 relative">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask for help with your project, request code changes, or describe what you want to build..."
                      className="w-full px-4 py-4 pr-16 border border-gray-300/50 dark:border-gray-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-lg"
                      rows="1"
                      disabled={isChatLoading}
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isChatLoading}
                      className="absolute right-3 bottom-3 p-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                    >
                      <PaperAirplaneIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Press Enter to send • Shift+Enter for new line • Using {selectedAgents.join(' + ')} agents
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* Right Panel - Project Context */}
        <div className="w-64 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-l border-gray-200/50 dark:border-gray-700/50 flex flex-col">
          {/* Project Context */}
          <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              🎯 Project Context
            </h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Current Focus:</h4>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Initial setup</li>
                  <li>• Component structure</li>
                  <li>• UI design</li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Tech Stack:</h4>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• React 18</li>
                  <li>• Tailwind CSS</li>
                  <li>• Framer Motion</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Active Agents */}
          <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              🤖 Active Agents
            </h3>
            <div className="space-y-2">
              {selectedAgents.map((agent) => (
                <div key={agent} className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-300 capitalize">
                      {agent}
                    </span>
                    <span className="text-xs text-green-600 dark:text-green-400">Active</span>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {agent === 'developer' ? 'Code & Build' : 
                     agent === 'designer' ? 'UI & UX' :
                     agent === 'tester' ? 'Test & QA' : 'Integration'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Project Metrics */}
          <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              📊 Project Metrics
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Progress:</span>
                <span className="font-medium text-gray-900 dark:text-white">25%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Files:</span>
                <span className="font-medium text-gray-900 dark:text-white">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tests:</span>
                <span className="font-medium text-green-600 dark:text-green-400">12/15</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Build:</span>
                <span className="font-medium text-green-600 dark:text-green-400">Success</span>
              </div>
            </div>
          </div>

          {/* Integrations */}
          <div className="p-4 flex-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              🔗 Integrations
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">MongoDB</span>
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Tailwind</span>
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Puter.js AI</span>
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Smart Enhancements */}
      {/* Real-Time Collaboration Indicators */}
      <CollaborationIndicators projectId={project.id} />
      
      {/* AI Code Assistant - Floating */}
      <AICodeAssistant 
        projectId={project.id} 
        projectName={project.name} 
      />
    </div>
  )
}

export default IndividualProject