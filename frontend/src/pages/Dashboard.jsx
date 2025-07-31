import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  PlusIcon,
  RocketLaunchIcon,
  CodeBracketIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import { useProjectStore } from '../store/projectStore'
import { useChatStore } from '../store/chatStore'
import { useTemplateStore } from '../store/templateStore'
import { formatDistanceToNow } from 'date-fns'

const Dashboard = () => {
  const { user } = useAuthStore()
  const { projects, loadProjects } = useProjectStore()
  const { conversations, loadConversations } = useChatStore()
  const { featuredTemplates, loadFeaturedTemplates } = useTemplateStore()

  useEffect(() => {
    loadProjects()
    loadConversations()
    loadFeaturedTemplates()
  }, [])

  const recentProjects = projects.slice(0, 3)
  const recentConversations = conversations.slice(0, 3)

  const stats = [
    {
      name: 'Total Projects',
      value: projects.length,
      icon: CodeBracketIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Deployed Apps',
      value: projects.filter(p => p.status === 'deployed').length,
      icon: RocketLaunchIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Conversations',
      value: conversations.length,
      icon: ChartBarIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      name: 'This Month',
      value: projects.filter(p => {
        const created = new Date(p.created_at)
        const now = new Date()
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
      }).length,
      icon: ClockIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'deployed':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />
      case 'building':
        return <ClockIcon className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
      default:
        return <CodeBracketIcon className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your projects today.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card"
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
                <div className="flex space-x-2">
                  <Link
                    to="/chat"
                    className="btn-primary text-sm flex items-center space-x-2"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>New Project</span>
                  </Link>
                  <Link
                    to="/templates"
                    className="btn-secondary text-sm"
                  >
                    Browse Templates
                  </Link>
                </div>
              </div>

              {recentProjects.length > 0 ? (
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <motion.div
                      key={project._id}
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <CodeBracketIcon className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{project.name}</h3>
                          <p className="text-sm text-gray-600">
                            {project.description || 'No description'}
                          </p>
                          <p className="text-xs text-gray-400">
                            Updated {formatDistanceToNow(new Date(project.updated_at))} ago
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(project.status)}
                        <span className="text-sm capitalize text-gray-600">
                          {project.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CodeBracketIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                  <p className="text-gray-600 mb-4">
                    Create your first project to get started building amazing applications.
                  </p>
                  <Link to="/chat" className="btn-primary">
                    Create Your First Project
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Conversations */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Chats</h3>
              {recentConversations.length > 0 ? (
                <div className="space-y-3">
                  {recentConversations.map((conv) => (
                    <Link
                      key={conv._id}
                      to={`/chat?conversation=${conv._id}`}
                      className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <h4 className="font-medium text-gray-900 text-sm truncate">
                        {conv.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(conv.updated_at))} ago
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm">No conversations yet</p>
                  <Link to="/chat" className="text-primary-600 text-sm hover:text-primary-700">
                    Start your first chat
                  </Link>
                </div>
              )}
            </div>

            {/* Featured Templates */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Templates</h3>
              {featuredTemplates.slice(0, 3).map((template) => (
                <Link
                  key={template._id}
                  to={`/templates/${template._id}`}
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors mb-3 last:mb-0"
                >
                  <h4 className="font-medium text-gray-900 text-sm">
                    {template.name}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {template.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                      {template.category.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {template.downloads} downloads
                    </span>
                  </div>
                </Link>
              ))}
              <Link
                to="/templates"
                className="block text-center text-primary-600 text-sm hover:text-primary-700 mt-4"
              >
                View All Templates →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard