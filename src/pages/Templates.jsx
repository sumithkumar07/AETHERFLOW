import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  SparklesIcon, 
  CodeBracketIcon, 
  RocketLaunchIcon,
  DocumentDuplicateIcon,
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  CubeTransparentIcon,
  PlayIcon,
  EyeIcon,
  StarIcon,
  ClockIcon,
  UsersIcon,
  TagIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import { useProjectStore } from '../store/projectStore'
import toast from 'react-hot-toast'

const Templates = () => {
  const { isAuthenticated } = useAuthStore()
  const { createProjectFromTemplate, isLoading } = useProjectStore()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = [
    { id: 'all', name: 'All Templates', icon: DocumentDuplicateIcon },
    { id: 'web-apps', name: 'Web Apps', icon: CodeBracketIcon },
    { id: 'e-commerce', name: 'E-Commerce', icon: ShoppingBagIcon },
    { id: 'ai-powered', name: 'AI Powered', icon: SparklesIcon },
    { id: 'dashboards', name: 'Dashboards', icon: CubeTransparentIcon },
    { id: 'chat-apps', name: 'Chat Apps', icon: ChatBubbleLeftRightIcon }
  ]

  const templates = [
    {
      id: 'react-ecommerce',
      name: 'E-Commerce Store',
      description: 'Complete e-commerce solution with shopping cart, payments, and admin dashboard',
      category: 'e-commerce',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
      tags: ['React', 'Stripe', 'MongoDB', 'Authentication'],
      difficulty: 'Intermediate',
      buildTime: '2-3 hours',
      popularity: 4.8,
      downloads: 1200,
      features: ['Product Catalog', 'Shopping Cart', 'Payment Integration', 'User Authentication', 'Admin Panel'],
      techStack: ['React', 'Node.js', 'MongoDB', 'Stripe API', 'Tailwind CSS']
    },
    {
      id: 'ai-chat-assistant',
      name: 'AI Chat Assistant',
      description: 'Intelligent chat application with multiple AI models and conversation management',
      category: 'ai-powered',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
      tags: ['AI', 'Chat', 'Puter.js', 'Real-time'],
      difficulty: 'Advanced',
      buildTime: '3-4 hours',
      popularity: 4.9,
      downloads: 2100,
      features: ['Multiple AI Models', 'Real-time Chat', 'Conversation History', 'File Upload', 'Voice Messages'],
      techStack: ['React', 'FastAPI', 'Puter.js', 'WebSocket', 'MongoDB']
    },
    {
      id: 'saas-dashboard',
      name: 'SaaS Dashboard',
      description: 'Professional SaaS application with analytics, user management, and billing',
      category: 'dashboards',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
      tags: ['SaaS', 'Analytics', 'Billing', 'Multi-tenant'],
      difficulty: 'Advanced',
      buildTime: '4-5 hours',
      popularity: 4.7,
      downloads: 890,
      features: ['User Management', 'Analytics Dashboard', 'Subscription Billing', 'Team Collaboration', 'API Management'],
      techStack: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'Chart.js']
    },
    {
      id: 'blog-platform',
      name: 'Blog Platform',
      description: 'Modern blog platform with CMS, SEO optimization, and social features',
      category: 'web-apps',
      image: 'https://images.unsplash.com/photo-1486312338219-ce68e2c93e44?w=400&h=300&fit=crop',
      tags: ['Blog', 'CMS', 'SEO', 'Social'],
      difficulty: 'Beginner',
      buildTime: '1-2 hours',
      popularity: 4.6,
      downloads: 1800,
      features: ['Rich Text Editor', 'SEO Optimization', 'Social Sharing', 'Comment System', 'Author Profiles'],
      techStack: ['React', 'Node.js', 'MongoDB', 'Next.js', 'Tailwind CSS']
    },
    {
      id: 'task-manager',
      name: 'Task Management App',
      description: 'Collaborative task management with kanban boards, deadlines, and team features',
      category: 'web-apps',
      image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop',
      tags: ['Productivity', 'Kanban', 'Team', 'Real-time'],
      difficulty: 'Intermediate',
      buildTime: '2-3 hours',
      popularity: 4.5,
      downloads: 1400,
      features: ['Kanban Boards', 'Team Collaboration', 'Deadline Tracking', 'File Attachments', 'Activity Timeline'],
      techStack: ['React', 'FastAPI', 'PostgreSQL', 'WebSocket', 'Material-UI']
    },
    {
      id: 'social-media-app',
      name: 'Social Media Platform',
      description: 'Full-featured social media app with posts, messaging, and real-time notifications',
      category: 'web-apps',
      image: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=400&h=300&fit=crop',
      tags: ['Social', 'Real-time', 'Messaging', 'Media'],
      difficulty: 'Advanced',
      buildTime: '5-6 hours',
      popularity: 4.8,
      downloads: 950,
      features: ['User Profiles', 'Posts & Stories', 'Real-time Messaging', 'Notifications', 'Media Upload'],
      techStack: ['React', 'Node.js', 'MongoDB', 'Socket.io', 'Cloudinary']
    }
  ]

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const handleUseTemplate = async (template) => {
    if (!isAuthenticated) {
      toast.error('Please login to use templates')
      return
    }

    try {
      await createProjectFromTemplate(template.id, {
        name: `${template.name} Project`,
        description: template.description,
        template: template
      })
      toast.success(`Creating project from ${template.name}...`)
    } catch (error) {
      toast.error('Failed to create project from template')
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Application Templates
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start building faster with our professionally designed templates. 
              Each template includes complete source code, documentation, and deployment guides.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SparklesIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group"
            >
              {/* Template Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={template.image}
                  alt={template.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 flex space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(template.difficulty)}`}>
                    {template.difficulty}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 flex items-center space-x-4 text-white text-sm">
                  <div className="flex items-center space-x-1">
                    <StarIcon className="w-4 h-4" />
                    <span>{template.popularity}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <UsersIcon className="w-4 h-4" />
                    <span>{template.downloads}</span>
                  </div>
                </div>
              </div>

              {/* Template Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {template.name}
                  </h3>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <ClockIcon className="w-4 h-4" />
                    <span>{template.buildTime}</span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {template.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {template.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                  {template.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                      +{template.tags.length - 3} more
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUseTemplate(template)}
                    disabled={isLoading}
                    className="flex-1 btn-primary flex items-center justify-center space-x-2 text-sm py-2"
                  >
                    <PlayIcon className="w-4 h-4" />
                    <span>Use Template</span>
                  </button>
                  <button
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Preview"
                  >
                    <EyeIcon className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <DocumentDuplicateIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Templates