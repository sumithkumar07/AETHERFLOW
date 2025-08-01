import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  PlusIcon, 
  ChatBubbleLeftRightIcon,
  FolderIcon,
  ClockIcon,
  CodeBracketIcon,
  RocketLaunchIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import { useProjectStore } from '../store/projectStore'
import LoadingStates from '../components/LoadingStates'
import toast from 'react-hot-toast'

const ChatHub = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { projects, loading, fetchProjects, createProject } = useProjectStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [projectIdea, setProjectIdea] = useState('')
  const [creatingProject, setCreatingProject] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleCreateProject = async (e) => {
    e.preventDefault()
    
    if (!projectIdea.trim()) {
      toast.error('Please describe your project idea')
      return
    }

    setCreatingProject(true)
    try {
      const result = await createProject({
        name: projectIdea.slice(0, 50),
        description: projectIdea,
        tech_stack: ['React', 'FastAPI', 'MongoDB'],
        status: 'active'
      })

      if (result.success) {
        toast.success('Project created successfully!')
        navigate(`/chat/${result.project.id}`)
      } else {
        toast.error(result.error || 'Failed to create project')
      }
    } catch (error) {
      toast.error('Failed to create project')
    } finally {
      setCreatingProject(false)
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filter === 'all') return matchesSearch
    if (filter === 'active') return matchesSearch && project.status === 'active'
    if (filter === 'complete') return matchesSearch && project.status === 'completed'
    
    return matchesSearch
  })

  const quickSuggestions = [
    "Build a modern e-commerce platform",
    "Create a social media dashboard",
    "Develop a task management app",
    "Build an AI-powered chat bot"
  ]

  if (loading) {
    return <LoadingStates.FullScreen message="Loading your projects..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.name || 'Developer'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ready to build something amazing? Start a new project or continue where you left off.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Projects */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card h-fit sticky top-24"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <FolderIcon className="w-5 h-5 mr-2" />
                  Recent Projects
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {projects.length} projects
                </span>
              </div>

              {/* Search and Filter */}
              <div className="space-y-3 mb-6">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-2">
                  {['all', 'active', 'complete'].map((filterOption) => (
                    <button
                      key={filterOption}
                      onClick={() => setFilter(filterOption)}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                        filter === filterOption
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                      }`}
                    >
                      {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Projects List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <motion.div
                      key={project.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to={`/chat/${project.id}`}
                        className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                            {project.name}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            project.status === 'active' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {project.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {project.tech_stack?.slice(0, 2).map((tech) => (
                              <span
                                key={tech}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <ClockIcon className="w-3 h-3 mr-1" />
                            {new Date(project.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FolderIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchTerm ? 'No projects found' : 'No projects yet'}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Main Content - Project Creation */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <PlusIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Ready to build something amazing?
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Describe your project idea and let our AI agents help you bring it to life.
                </p>
              </div>

              {/* Project Creation Form */}
              <form onSubmit={handleCreateProject} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    What would you like to build today?
                  </label>
                  <textarea
                    value={projectIdea}
                    onChange={(e) => setProjectIdea(e.target.value)}
                    placeholder="Describe your project idea in detail... The more context you provide, the better our AI can assist you!"
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creatingProject || !projectIdea.trim()}
                  className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {creatingProject ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Creating Project...</span>
                    </>
                  ) : (
                    <>
                      <RocketLaunchIcon className="w-5 h-5" />
                      <span>Start Building</span>
                    </>
                  )}
                </button>
              </form>

              {/* Quick Suggestions */}
              <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Quick suggestions:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {quickSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setProjectIdea(suggestion)}
                      className="text-left p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Featured Templates */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Or start with a template
                  </h3>
                  <Link
                    to="/templates"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    View all templates →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: 'React Starter Kit', description: 'Modern React app with authentication' },
                    { name: 'E-commerce Store', description: 'Full-featured online store' }
                  ].map((template, index) => (
                    <Link
                      key={index}
                      to="/templates"
                      className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg hover:shadow-md transition-shadow border border-blue-100 dark:border-blue-800"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <CodeBracketIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {template.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {template.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatHub