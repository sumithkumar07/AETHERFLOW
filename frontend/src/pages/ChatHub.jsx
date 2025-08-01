import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlusIcon,
  SparklesIcon,
  ArrowRightIcon,
  FolderIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayIcon,
  ShareIcon,
  TrashIcon,
  CodeBracketIcon,
  RocketLaunchIcon,
  DocumentDuplicateIcon,
  UserGroupIcon,
  CommandLineIcon,
  BoltIcon
} from '@heroicons/react/24/outline'
import { useProjectStore } from '../store/projectStore'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const ChatHub = () => {
  const navigate = useNavigate()
  const { projects, createProject, selectProject, deleteProject, isLoading } = useProjectStore()
  const { user } = useAuthStore()
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState('all')

  const handleCreateProject = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    try {
      const projectData = {
        name: input.trim().substring(0, 50) + (input.length > 50 ? '...' : ''),
        description: input.trim(),
        type: 'chat',
        status: 'initializing'
      }
      
      const newProject = await createProject(projectData)
      toast.success('Project created successfully!')
      navigate(`/chat/${newProject.id}`)
    } catch (error) {
      toast.error('Failed to create project')
    }
  }

  const handleProjectClick = (projectId) => {
    selectProject(projectId)
    navigate(`/chat/${projectId}`)
  }

  const handleDeleteProject = async (projectId, projectName, e) => {
    e.stopPropagation()
    if (window.confirm(`Delete "${projectName}"?`)) {
      try {
        await deleteProject(projectId)
        toast.success('Project deleted')
      } catch (error) {
        toast.error('Failed to delete project')
      }
    }
  }

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true
    if (filter === 'active') return ['initializing', 'ready', 'building'].includes(project.status)
    if (filter === 'complete') return project.status === 'deployed'
    return project.status === filter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'initializing': return 'bg-blue-100 text-blue-800'
      case 'ready': return 'bg-green-100 text-green-800'
      case 'building': return 'bg-yellow-100 text-yellow-800'
      case 'deployed': return 'bg-emerald-100 text-emerald-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressDots = (status) => {
    const total = 5
    const filled = {
      'draft': 1,
      'initializing': 2,
      'ready': 3,
      'building': 4,
      'deployed': 5,
      'error': 2
    }[status] || 1

    return Array.from({ length: total }, (_, i) => (
      <div
        key={i}
        className={`w-2 h-2 rounded-full ${
          i < filled ? 'bg-blue-500' : 'bg-gray-300'
        }`}
      />
    ))
  }

  const suggestions = [
    {
      icon: CodeBracketIcon,
      title: "Build a todo app",
      description: "Simple task management with React"
    },
    {
      icon: RocketLaunchIcon,
      title: "Create e-commerce site",
      description: "Online store with payment integration"
    },
    {
      icon: CommandLineIcon,
      title: "API for user management",
      description: "RESTful API with authentication"
    },
    {
      icon: SparklesIcon,
      title: "Landing page for startup",
      description: "Modern marketing website"
    }
  ]

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex">
      {/* Sidebar - Recent Projects */}
      <div className="w-80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col">
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Projects
            </h2>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
              <PlusIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          
          {/* Filters */}
          <div className="flex space-x-2">
            {['all', 'active', 'complete'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  filter === filterType
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  onClick={() => handleProjectClick(project.id)}
                  className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteProject(project.id, project.name, e)}
                      className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-all"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <ClockIcon className="w-4 h-4" />
                      <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>

                  {/* Tech Stack */}
                  {project.techStack && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.techStack.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Progress */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-1">
                      {getProgressDots(project.status)}
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/30 text-blue-700 dark:text-blue-300 text-sm rounded-lg transition-colors">
                        Continue
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg transition-colors">
                        <ShareIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <FolderIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">No projects yet</p>
                <button
                  onClick={() => document.getElementById('project-input').focus()}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Create your first project
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* New Project Button */}
        <div className="p-6 border-t border-gray-200/50 dark:border-gray-700/50">
          <button
            onClick={() => document.getElementById('project-input').focus()}
            className="w-full btn-primary flex items-center justify-center space-x-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  AI Tempo
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Welcome back, {user?.name || 'Developer'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                to="/profile"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                <UserGroupIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </Link>
              <Link
                to="/settings"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Welcome Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl animate-pulse-glow">
              <SparklesIcon className="w-12 h-12 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              🤖 Ready to build something amazing?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              What would you like to build today?
            </p>

            {/* Project Creation Form */}
            <form onSubmit={handleCreateProject} className="mb-8">
              <div className="relative max-w-2xl mx-auto">
                <textarea
                  id="project-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your idea... (e.g., Build a modern e-commerce website with React and Stripe)"
                  className="w-full px-6 py-4 pr-16 border border-gray-300/50 dark:border-gray-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-lg"
                  rows="3"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-3 bottom-3 p-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                >
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Quick Examples */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Examples:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestions.map((suggestion, index) => {
                  const Icon = suggestion.icon
                  return (
                    <motion.button
                      key={index}
                      onClick={() => setInput(suggestion.title)}
                      className="p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-200 text-left group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg group-hover:shadow-xl transition-shadow">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {suggestion.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {suggestion.description}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Featured Templates */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Featured Templates:
              </h3>
              <Link
                to="/templates"
                className="inline-flex items-center space-x-2 btn-secondary"
              >
                <DocumentDuplicateIcon className="w-5 h-5" />
                <span>Browse All Templates</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ChatHub