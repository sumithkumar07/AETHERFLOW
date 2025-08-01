import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  SparklesIcon,
  CodeBracketIcon,
  RocketLaunchIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  PlayIcon,
  StarIcon,
  ClockIcon,
  UserGroupIcon,
  TagIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { useProjectStore } from '../store/projectStore'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const Templates = () => {
  const navigate = useNavigate()
  const { createProject } = useProjectStore()
  const { isAuthenticated } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popular')

  const categories = [
    { id: 'all', name: 'All Templates', count: 24 },
    { id: 'web-apps', name: 'Web Apps', count: 8 },
    { id: 'mobile', name: 'Mobile', count: 6 },
    { id: 'apis', name: 'APIs', count: 5 },
    { id: 'ecommerce', name: 'E-commerce', count: 3 },
    { id: 'ai', name: 'AI & ML', count: 2 }
  ]

  const templates = [
    {
      id: 1,
      name: 'Modern E-commerce Store',
      description: 'Full-featured online store with payment integration, product management, and user authentication.',
      category: 'ecommerce',
      techStack: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      difficulty: 'Intermediate',
      rating: 4.8,
      downloads: 1247,
      preview: '/templates/ecommerce-preview.jpg',
      author: 'AI Tempo Team',
      lastUpdated: '2024-01-15',
      features: ['Payment Integration', 'Admin Dashboard', 'Responsive Design', 'SEO Optimized'],
      estimatedTime: '2-3 hours'
    },
    {
      id: 2,
      name: 'Task Management App',
      description: 'Clean and intuitive todo application with real-time collaboration and project organization.',
      category: 'web-apps',
      techStack: ['React', 'FastAPI', 'PostgreSQL', 'WebSocket'],
      difficulty: 'Beginner',
      rating: 4.6,
      downloads: 892,
      preview: '/templates/todo-preview.jpg',
      author: 'Community',
      lastUpdated: '2024-01-12',
      features: ['Real-time Sync', 'Team Collaboration', 'Progress Tracking', 'Mobile Ready'],
      estimatedTime: '1-2 hours'
    },
    {
      id: 3,
      name: 'RESTful API Starter',
      description: 'Production-ready API template with authentication, documentation, and testing setup.',
      category: 'apis',
      techStack: ['FastAPI', 'MongoDB', 'JWT', 'Docker'],
      difficulty: 'Intermediate',
      rating: 4.9,
      downloads: 2103,
      preview: '/templates/api-preview.jpg',
      author: 'AI Tempo Team',
      lastUpdated: '2024-01-10',
      features: ['Auto Documentation', 'JWT Auth', 'Rate Limiting', 'Testing Suite'],
      estimatedTime: '30-60 min'
    },
    {
      id: 4,
      name: 'AI Chat Interface',
      description: 'Modern chat interface with AI integration, message history, and real-time responses.',
      category: 'ai',
      techStack: ['React', 'Python', 'OpenAI', 'WebSocket'],
      difficulty: 'Advanced',
      rating: 4.7,
      downloads: 674,
      preview: '/templates/ai-chat-preview.jpg',
      author: 'Community',
      lastUpdated: '2024-01-08',
      features: ['AI Integration', 'Message History', 'Real-time', 'Customizable'],
      estimatedTime: '3-4 hours'
    },
    {
      id: 5,
      name: 'Portfolio Website',
      description: 'Beautiful responsive portfolio template with animations and contact forms.',
      category: 'web-apps',
      techStack: ['React', 'Tailwind', 'Framer Motion', 'Netlify'],
      difficulty: 'Beginner',
      rating: 4.5,
      downloads: 1567,
      preview: '/templates/portfolio-preview.jpg',
      author: 'AI Tempo Team',
      lastUpdated: '2024-01-05',
      features: ['Responsive Design', 'Animations', 'Contact Form', 'SEO Ready'],
      estimatedTime: '1-2 hours'
    },
    {
      id: 6,
      name: 'Social Media Dashboard',
      description: 'Analytics dashboard for social media metrics with charts and real-time data.',
      category: 'web-apps',
      techStack: ['React', 'Chart.js', 'Node.js', 'Redis'],
      difficulty: 'Intermediate',
      rating: 4.4,
      downloads: 523,
      preview: '/templates/dashboard-preview.jpg',
      author: 'Community',
      lastUpdated: '2024-01-03',
      features: ['Real-time Data', 'Interactive Charts', 'Export Reports', 'Multi-platform'],
      estimatedTime: '2-3 hours'
    }
  ]

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.techStack.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.downloads - a.downloads
      case 'rating':
        return b.rating - a.rating
      case 'recent':
        return new Date(b.lastUpdated) - new Date(a.lastUpdated)
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  const handleUseTemplate = async (template) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to use templates')
      navigate('/login')
      return
    }

    try {
      const projectData = {
        name: `${template.name} Project`,
        description: template.description,
        type: 'template',
        templateId: template.id,
        techStack: template.techStack,
        status: 'initializing'
      }
      
      const newProject = await createProject(projectData)
      toast.success('Template project created!')
      navigate(`/chat/${newProject.id}`)
    } catch (error) {
      toast.error('Failed to create project from template')
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mb-6"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <DocumentDuplicateIcon className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Template Gallery
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
            >
              Jump-start your development with our curated collection of professional templates. 
              Each template is production-ready and fully customizable.
            </motion.p>
          </div>

          {/* Search and Filters */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col lg:flex-row gap-4 items-center justify-between"
          >
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300/50 dark:border-gray-600/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-900 dark:text-white"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="recent">Recently Updated</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Categories Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:w-64 flex-shrink-0"
          >
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Categories
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span>{category.name}</span>
                    <span className="text-sm bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Templates Grid */}
          <div className="flex-1">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-6 flex items-center justify-between"
            >
              <p className="text-gray-600 dark:text-gray-400">
                {sortedTemplates.length} template{sortedTemplates.length !== 1 ? 's' : ''} found
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div 
                key={`${selectedCategory}-${searchQuery}-${sortBy}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {sortedTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  >
                    {/* Template Preview */}
                    <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="text-white text-center">
                          <CodeBracketIcon className="w-12 h-12 mx-auto mb-2 opacity-80" />
                          <p className="text-sm opacity-80">Preview Coming Soon</p>
                        </div>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                          {template.difficulty}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {template.name}
                        </h3>
                        <div className="flex items-center space-x-1 text-yellow-500">
                          <StarIcon className="w-4 h-4 fill-current" />
                          <span className="text-sm font-medium">{template.rating}</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {template.description}
                      </p>

                      {/* Tech Stack */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {template.techStack.slice(0, 4).map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded"
                          >
                            {tech}
                          </span>
                        ))}
                        {template.techStack.length > 4 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded">
                            +{template.techStack.length - 4}
                          </span>
                        )}
                      </div>

                      {/* Features */}
                      <div className="mb-4">
                        <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Key Features:</h4>
                        <div className="flex flex-wrap gap-1">
                          {template.features.slice(0, 2).map((feature) => (
                            <span
                              key={feature}
                              className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded"
                            >
                              {feature}
                            </span>
                          ))}
                          {template.features.length > 2 && (
                            <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded">
                              +{template.features.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <UserGroupIcon className="w-3 h-3" />
                            <span>{template.downloads}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="w-3 h-3" />
                            <span>{template.estimatedTime}</span>
                          </div>
                        </div>
                        <span>by {template.author}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUseTemplate(template)}
                          className="flex-1 btn-primary text-sm py-2.5 flex items-center justify-center space-x-2"
                        >
                          <RocketLaunchIcon className="w-4 h-4" />
                          <span>Use Template</span>
                        </button>
                        <button className="p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <EyeIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Empty State */}
            {sortedTemplates.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <DocumentDuplicateIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No templates found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                  }}
                  className="btn-secondary"
                >
                  Clear Filters
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Don't see what you need?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Create a custom project with AI assistance or request a new template.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/chat"
                className="inline-flex items-center space-x-2 bg-white/90 hover:bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl"
              >
                <SparklesIcon className="w-5 h-5" />
                <span>Create with AI</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <button className="inline-flex items-center space-x-2 bg-transparent border-2 border-white/30 hover:border-white/50 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 backdrop-blur-xl">
                <DocumentDuplicateIcon className="w-5 h-5" />
                <span>Request Template</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Templates