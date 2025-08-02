import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  StarIcon,
  ClockIcon,
  UserIcon,
  ArrowDownTrayIcon,
  CodeBracketIcon,
  RocketLaunchIcon,
  HeartIcon,
  EyeIcon,
  TagIcon,
  DocumentTextIcon,
  PlayIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid, HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import LoadingStates from '../components/LoadingStates'
import { useAuthStore } from '../store/authStore'
import { useProjectStore } from '../store/projectStore'
import axios from 'axios'
import toast from 'react-hot-toast'

const Templates = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { createProject } = useProjectStore()
  
  const [templates, setTemplates] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [favorites, setFavorites] = useState(new Set())
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [usingTemplate, setUsingTemplate] = useState(null)

  useEffect(() => {
    fetchTemplates()
    fetchCategories()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/templates/', {
        params: {
          category: selectedCategory === 'all' ? null : selectedCategory,
          search: searchTerm || null,
          limit: 50
        }
      })
      
      const templatesData = response.data.templates || []
      
      // Enhance templates with computed fields
      const enhancedTemplates = templatesData.map(template => ({
        ...template,
        isFavorite: favorites.has(template.id),
        difficultyColor: getDifficultyColor(template.difficulty),
        setupTimeText: getSetupTimeText(template.setup_time),
        ratingStars: generateRatingStars(template.rating),
        downloadText: formatDownloads(template.downloads)
      }))
      
      setTemplates(enhancedTemplates)
    } catch (error) {
      console.error('Templates fetch error:', error)
      toast.error('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/templates/categories')
      setCategories(response.data.categories || [])
    } catch (error) {
      console.error('Categories fetch error:', error)
      // Use fallback categories
      setCategories([
        { name: 'Web Apps', count: 15, slug: 'web-apps' },
        { name: 'E-commerce', count: 8, slug: 'e-commerce' },
        { name: 'Productivity', count: 12, slug: 'productivity' },
        { name: 'Content Management', count: 6, slug: 'content-management' },
        { name: 'Analytics', count: 4, slug: 'analytics' },
        { name: 'Backend', count: 7, slug: 'backend' }
      ])
    }
  }

  const handleUseTemplate = async (template) => {
    if (!user) {
      toast.error('Please sign in to use templates')
      navigate('/login')
      return
    }

    try {
      setUsingTemplate(template.id)
      
      // Use the backend template API to create project
      const response = await axios.post(`/api/templates/${template.id}/use`, {
        project_name: `${template.name} Project`
      })
      
      if (response.data.project) {
        toast.success(`Project created from ${template.name}!`)
        navigate(`/chat/${response.data.project.id}`)
      }
    } catch (error) {
      console.error('Template use error:', error)
      toast.error(error.response?.data?.detail || 'Failed to create project from template')
    } finally {
      setUsingTemplate(null)
    }
  }

  const toggleFavorite = (templateId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(templateId)) {
        newFavorites.delete(templateId)
        toast.success('Removed from favorites')
      } else {
        newFavorites.add(templateId)
        toast.success('Added to favorites')
      }
      return newFavorites
    })
    
    // Update template in the list
    setTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, isFavorite: !template.isFavorite }
        : template
    ))
  }

  const filteredTemplates = templates
    .filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || 
                             template.category.toLowerCase() === selectedCategory.toLowerCase()
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.downloads - a.downloads
        case 'rating':
          return b.rating - a.rating
        case 'recent':
          return new Date(b.updated_at) - new Date(a.updated_at)
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

  // Utility functions
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'text-green-600 dark:text-green-400'
      case 'intermediate': return 'text-yellow-600 dark:text-yellow-400'
      case 'advanced': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getSetupTimeText = (setupTime) => {
    if (!setupTime) return 'Quick setup'
    return setupTime.replace('minutes', 'min').replace('hours', 'hr')
  }

  const generateRatingStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating || 0)
    const hasHalfStar = (rating || 0) % 1 >= 0.5
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarIconSolid key={i} className="w-4 h-4 text-yellow-500" />)
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarIconSolid key={i} className="w-4 h-4 text-yellow-300" />)
      } else {
        stars.push(<StarIcon key={i} className="w-4 h-4 text-gray-300" />)
      }
    }
    return stars
  }

  const formatDownloads = (downloads) => {
    if (!downloads) return '0'
    if (downloads >= 1000) return `${(downloads / 1000).toFixed(1)}k`
    return downloads.toString()
  }

  if (loading) {
    return <LoadingStates.FullScreen message="Loading templates..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      {/* Enhanced Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mb-6"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                <CodeBracketIcon className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Project Templates
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
            >
              Jump-start your next project with our curated collection of professional templates.
              Built by experts, ready to deploy.
            </motion.p>
          </div>

          {/* Enhanced Search and Filters */}
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Advanced Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300/50 dark:border-gray-600/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-900 dark:text-white"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="recent">Recently Updated</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Enhanced Categories Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:w-80 flex-shrink-0"
          >
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <TagIcon className="w-5 h-5 mr-2" />
                Categories
              </h3>
              
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-left transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <DocumentTextIcon className="w-5 h-5" />
                    <span className="font-medium">All Templates</span>
                  </div>
                  <span className="text-sm bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                    {templates.length}
                  </span>
                </button>
                
                {categories.map((category) => (
                  <button
                    key={category.slug}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-left transition-colors ${
                      selectedCategory === category.name
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 rounded bg-gradient-to-br from-purple-500 to-pink-500"></div>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <span className="text-sm bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Templates</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{templates.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Free Templates</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">{templates.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Your Favorites</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">{favorites.size}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Templates Grid */}
          <div className="flex-1">
            {filteredTemplates.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <CodeBracketIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  No templates found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('all')
                  }}
                  className="btn-secondary"
                >
                  Clear Filters
                </button>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {filteredTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                  >
                    {/* Template Preview Image */}
                    <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 overflow-hidden">
                      {template.image_url ? (
                        <img 
                          src={template.image_url} 
                          alt={template.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <CodeBracketIcon className="w-16 h-16 text-purple-400" />
                        </div>
                      )}
                      
                      {/* Overlay Actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
                        <button
                          onClick={() => setPreviewTemplate(template)}
                          className="p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors"
                          title="Preview"
                        >
                          <EyeIcon className="w-5 h-5 text-white" />
                        </button>
                        <button
                          onClick={() => handleUseTemplate(template)}
                          disabled={usingTemplate === template.id}
                          className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50"
                          title="Use Template"
                        >
                          {usingTemplate === template.id ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <PlayIcon className="w-5 h-5 text-white" />
                          )}
                        </button>
                      </div>

                      {/* Featured Badge */}
                      {template.featured && (
                        <div className="absolute top-3 left-3">
                          <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full">
                            FEATURED
                          </span>
                        </div>
                      )}

                      {/* Favorite Button */}
                      <div className="absolute top-3 right-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorite(template.id)
                          }}
                          className="p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors"
                        >
                          {template.isFavorite ? (
                            <HeartIconSolid className="w-5 h-5 text-red-500" />
                          ) : (
                            <HeartIcon className="w-5 h-5 text-white" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Template Content */}
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {template.name}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center space-x-1">
                              {template.ratingStars}
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {template.rating?.toFixed(1)}
                              </span>
                            </div>
                            <span className="text-gray-300 dark:text-gray-600">•</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {template.downloadText} downloads
                            </span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${template.difficultyColor} bg-gray-100 dark:bg-gray-800`}>
                          {template.difficulty}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {template.description}
                      </p>

                      {/* Tech Stack */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {template.tech_stack?.slice(0, 3).map((tech, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded"
                            >
                              {tech}
                            </span>
                          ))}
                          {template.tech_stack?.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded">
                              +{template.tech_stack.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Features */}
                      {template.features && template.features.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Key Features:</h4>
                          <ul className="space-y-1">
                            {template.features.slice(0, 2).map((feature, i) => (
                              <li key={i} className="flex items-center space-x-2">
                                <CheckCircleIcon className="w-3 h-3 text-green-500 flex-shrink-0" />
                                <span className="text-xs text-gray-600 dark:text-gray-400">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-3 h-3" />
                          <span>{template.setupTimeText} setup</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <UserIcon className="w-3 h-3" />
                          <span>{template.author}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleUseTemplate(template)}
                          disabled={usingTemplate === template.id}
                          className="flex-1 btn-primary text-sm py-2.5 flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                          {usingTemplate === template.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Creating...</span>
                            </>
                          ) : (
                            <>
                              <RocketLaunchIcon className="w-4 h-4" />
                              <span>Use Template</span>
                            </>
                          )}
                        </motion.button>
                        
                        <button 
                          onClick={() => setPreviewTemplate(template)}
                          className="p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          title="Preview"
                        >
                          <EyeIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        
                        <button 
                          onClick={() => toggleFavorite(template.id)}
                          className="p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          title={template.isFavorite ? "Remove from favorites" : "Add to favorites"}
                        >
                          {template.isFavorite ? (
                            <HeartIconSolid className="w-4 h-4 text-red-500" />
                          ) : (
                            <HeartIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {previewTemplate.name}
                </h2>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {previewTemplate.image_url && (
                <img 
                  src={previewTemplate.image_url} 
                  alt={previewTemplate.name}
                  className="w-full h-48 object-cover rounded-lg mb-6"
                />
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                  <p className="text-gray-600 dark:text-gray-400">{previewTemplate.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Tech Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {previewTemplate.tech_stack?.map((tech, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 text-sm rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {previewTemplate.features && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Features</h3>
                    <ul className="space-y-2">
                      {previewTemplate.features.map((feature, i) => (
                        <li key={i} className="flex items-center space-x-2">
                          <CheckCircleIcon className="w-5 h-5 text-green-500" />
                          <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>{previewTemplate.setupTimeText}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      <span>{previewTemplate.downloadText} downloads</span>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setPreviewTemplate(null)
                      handleUseTemplate(previewTemplate)
                    }}
                    className="btn-primary"
                  >
                    Use This Template
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Templates