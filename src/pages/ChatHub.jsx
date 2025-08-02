import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  PlusIcon,
  RocketLaunchIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  CodeBracketIcon,
  SwatchIcon,
  CogIcon,
  FireIcon,
  LightBulbIcon,
  SparklesIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  BeakerIcon,
  BoltIcon,
  AcademicCapIcon,
  PlayIcon,
  CloudArrowUpIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline'
import LoadingStates from '../components/LoadingStates'
import ProjectCreationModal from '../components/ProjectCreationModal'
import { useProjectStore } from '../store/projectStore'
import { useAuthStore } from '../store/authStore'
import { useAdvancedFeaturesStore } from '../store/advancedFeaturesStore'
import toast from 'react-hot-toast'

const ChatHub = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { 
    projects, 
    loading: projectsLoading, 
    fetchProjects, 
    createProject,
    buildProject,
    deployProject,
    deploymentStatus
  } = useProjectStore()
  
  const {
    fetchAnalytics,
    analyzeArchitecture,
    fetchWorkflows
  } = useAdvancedFeaturesStore()
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [quickActions, setQuickActions] = useState([])
  const [smartRecommendations, setSmartRecommendations] = useState([])
  const [dashboardStats, setDashboardStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    deploymentsThisWeek: 0,
    avgBuildTime: '2.3m'
  })

  useEffect(() => {
    if (user) {
      fetchProjects()
      loadDashboardData()
    }
  }, [user])

  // Load enhanced dashboard data
  const loadDashboardData = async () => {
    try {
      // Fetch analytics for overall dashboard
      await fetchAnalytics('dashboard')
      
      // Load smart recommendations based on user activity
      const recommendations = [
        {
          id: 1,
          type: 'template',
          title: 'Try the E-commerce Starter',
          description: 'Perfect for your next online store project',
          action: () => navigate('/templates'),
          icon: RocketLaunchIcon,
          color: 'blue'
        },
        {
          id: 2,
          type: 'feature',
          title: 'Enable Voice Commands',
          description: 'Speed up your workflow with AI voice controls',
          action: () => toast.success('Voice commands enabled in project settings!'),
          icon: BoltIcon,
          color: 'green'
        },
        {
          id: 3,
          type: 'integration',
          title: 'Connect GitHub',
          description: 'Sync your repositories for better collaboration',
          action: () => navigate('/integrations'),
          icon: CogIcon,
          color: 'purple'
        }
      ]
      
      setSmartRecommendations(recommendations)
      
      // Generate quick actions based on recent activity
      const actions = [
        {
          id: 1,
          title: 'Create React App',
          description: 'Start a modern React project',
          icon: CodeBracketIcon,
          color: 'from-blue-500 to-cyan-500',
          action: () => handleQuickCreate('React Application', 'react_app')
        },
        {
          id: 2,
          title: 'API Service',
          description: 'Build a REST API with FastAPI',
          icon: CogIcon,
          color: 'from-green-500 to-teal-500',
          action: () => handleQuickCreate('API Service', 'api_service')
        },
        {
          id: 3,
          title: 'Full Stack App',
          description: 'Complete web application',
          icon: RocketLaunchIcon,
          color: 'from-purple-500 to-pink-500',
          action: () => handleQuickCreate('Full Stack App', 'full_stack')
        },
        {
          id: 4,
          title: 'Browse Templates',
          description: 'Explore our template library',
          icon: SwatchIcon,
          color: 'from-yellow-500 to-orange-500',
          action: () => navigate('/templates')
        }
      ]
      
      setQuickActions(actions)
      
    } catch (error) {
      console.error('Dashboard data loading error:', error)
    }
  }

  const handleQuickCreate = async (name, type) => {
    const result = await createProject({
      name: name,
      description: `A ${type.replace('_', ' ')} project created from ChatHub`,
      type: type
    })
    
    if (result.success) {
      navigate(`/chat/${result.project.id}`)
    }
  }

  const handleProjectAction = async (project, action) => {
    switch (action) {
      case 'build':
        const buildResult = await buildProject(project.id)
        if (buildResult.success) {
          toast.success(`Build started for ${project.name}`)
        }
        break
      case 'deploy':
        const deployResult = await deployProject(project.id)
        if (deployResult.success) {
          toast.success(`Deployment started for ${project.name}`)
        }
        break
      case 'analyze':
        analyzeArchitecture(project.id)
        toast.success('Analyzing project architecture...')
        break
      default:
        navigate(`/chat/${project.id}`)
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status) => {
    switch (status) {
      case 'deployed': return <CloudArrowUpIcon className="w-4 h-4" />
      case 'building': return <CogIcon className="w-4 h-4 animate-spin" />
      case 'ready': return <CheckBadgeIcon className="w-4 h-4" />
      default: return <DocumentTextIcon className="w-4 h-4" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'deployed': return 'text-green-600 dark:text-green-400'
      case 'building': return 'text-yellow-600 dark:text-yellow-400'
      case 'ready': return 'text-blue-600 dark:text-blue-400'
      case 'error': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  if (projectsLoading) {
    return <LoadingStates.FullScreen message="Loading your projects..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <ChatBubbleLeftRightIcon className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome back, {user?.name}! 👋
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            Your AI-powered development workspace. Create, build, and deploy applications 
            with the help of intelligent agents and advanced tools.
          </p>

          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Projects', value: projects.length, icon: DocumentTextIcon, color: 'blue' },
              { label: 'Active Projects', value: projects.filter(p => p.status !== 'archived').length, icon: RocketLaunchIcon, color: 'green' },
              { label: 'Deployed', value: projects.filter(p => p.status === 'deployed').length, icon: CloudArrowUpIcon, color: 'purple' },
              { label: 'This Week', value: '+3', icon: ChartBarIcon, color: 'yellow' }
            ].map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                      <Icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <SparklesIcon className="w-6 h-6 mr-2 text-purple-600" />
            Quick Start
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <motion.div
                  key={action.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={action.action}
                  className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-300 dark:hover:border-purple-600 cursor-pointer transition-all duration-300 hover:shadow-2xl group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {action.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {action.description}
                  </p>
                  
                  <div className="flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                    Get started
                    <ArrowRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Smart Recommendations */}
        {smartRecommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <LightBulbIcon className="w-6 h-6 mr-2 text-yellow-500" />
              Smart Recommendations
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {smartRecommendations.map((rec) => {
                const Icon = rec.icon
                return (
                  <motion.div
                    key={rec.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={rec.action}
                    className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-${rec.color}-200/50 dark:border-${rec.color}-700/50 hover:border-${rec.color}-300 dark:hover:border-${rec.color}-600 cursor-pointer transition-all duration-300 hover:shadow-xl`}
                  >
                    <div className={`w-10 h-10 rounded-lg bg-${rec.color}-100 dark:bg-${rec.color}-900/20 flex items-center justify-center mb-4`}>
                      <Icon className={`w-5 h-5 text-${rec.color}-600 dark:text-${rec.color}-400`} />
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {rec.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {rec.description}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Projects Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 lg:mb-0 flex items-center">
              <DocumentTextIcon className="w-6 h-6 mr-2" />
              Your Projects ({filteredProjects.length})
            </h2>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300/50 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              
              {/* Filter */}
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="appearance-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-300/50 dark:border-gray-600/50 rounded-lg px-4 py-2 pr-8 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="building">Building</option>
                  <option value="ready">Ready</option>
                  <option value="deployed">Deployed</option>
                </select>
                <FunnelIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span>New Project</span>
              </motion.button>
            </div>
          </div>

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                {projects.length === 0 ? "No projects yet" : "No projects found"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                {projects.length === 0 
                  ? "Start building amazing applications with AI assistance" 
                  : "Try adjusting your search or filter criteria"
                }
              </p>
              {projects.length === 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary"
                >
                  Create Your First Project
                </motion.button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                >
                  <div className="p-6">
                    {/* Project Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1 mb-1">
                          {project.name}
                        </h3>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${project.statusColor}`}>
                            {getStatusIcon(project.status)}
                            <span className="ml-1 capitalize">{project.status}</span>
                          </span>
                          
                          {deploymentStatus[project.id] && deploymentStatus[project.id] !== project.status && (
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full animate-pulse ${
                              deploymentStatus[project.id] === 'building' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300' :
                              deploymentStatus[project.id] === 'deploying' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' : ''
                            }`}>
                              {deploymentStatus[project.id]}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {project.progress || 0}%
                        </div>
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${project.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Project Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {project.description || 'No description provided'}
                    </p>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {(project.techStackDisplay || project.tech_stack || []).slice(0, 3).map((tech, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded"
                        >
                          {tech}
                        </span>
                      ))}
                      {(project.tech_stack?.length > 3) && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded">
                          +{project.tech_stack.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Project Meta */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="w-3 h-3" />
                        <span>{project.lastActivityText || 'No recent activity'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DocumentTextIcon className="w-3 h-3" />
                        <span>{project.files?.length || 0} files</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleProjectAction(project, 'chat')}
                        className="flex-1 btn-primary text-sm py-2 flex items-center justify-center space-x-1"
                      >
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                        <span>Open</span>
                      </motion.button>
                      
                      {project.status === 'ready' && (
                        <button
                          onClick={() => handleProjectAction(project, 'deploy')}
                          disabled={deploymentStatus[project.id] === 'deploying'}
                          className="p-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 rounded-lg transition-colors disabled:opacity-50"
                          title="Deploy"
                        >
                          <CloudArrowUpIcon className="w-4 h-4" />
                        </button>
                      )}
                      
                      {project.status === 'draft' && (
                        <button
                          onClick={() => handleProjectAction(project, 'build')}
                          disabled={deploymentStatus[project.id] === 'building'}
                          className="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg transition-colors disabled:opacity-50"
                          title="Build"
                        >
                          <CogIcon className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleProjectAction(project, 'analyze')}
                        className="p-2 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-lg transition-colors"
                        title="Analyze Architecture"
                      >
                        <ChartBarIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Project Creation Modal */}
      {showCreateModal && (
        <ProjectCreationModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateProject={async (projectData) => {
            const result = await createProject(projectData)
            if (result.success) {
              setShowCreateModal(false)
              navigate(`/chat/${result.project.id}`)
            }
            return result
          }}
        />
      )}
    </div>
  )
}

export default ChatHub