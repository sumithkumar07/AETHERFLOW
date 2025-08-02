import { create } from 'zustand'
import axios from 'axios'
import toast from 'react-hot-toast'

const useTemplateStore = create((set, get) => ({
  // State
  templates: [],
  categories: [],
  selectedTemplate: null,
  loading: false,
  error: null,
  filters: {
    category: null,
    featured: null,
    search: '',
    difficulty: null
  },

  // Actions
  fetchTemplates: async (options = {}) => {
    try {
      set({ loading: true, error: null })
      
      const params = new URLSearchParams()
      if (options.category) params.append('category', options.category)
      if (options.featured !== undefined) params.append('featured', options.featured)
      if (options.search) params.append('search', options.search)
      if (options.limit) params.append('limit', options.limit)
      
      const response = await axios.get(`/api/templates/?${params.toString()}`)
      const templates = response.data.templates || []
      
      // Enhanced templates with computed fields
      const enhancedTemplates = templates.map(template => ({
        ...template,
        difficultyColor: get().getDifficultyColor(template.difficulty),
        setupTimeText: get().formatSetupTime(template.setup_time),
        popularityScore: get().calculatePopularityScore(template),
        techStackDisplay: template.tech_stack?.slice(0, 4) || []
      }))
      
      set({ templates: enhancedTemplates, loading: false })
      return { success: true, templates: enhancedTemplates }
    } catch (error) {
      console.error('Templates fetch error:', error)
      const errorMessage = error.response?.data?.detail || 'Failed to fetch templates'
      set({ error: errorMessage, loading: false })
      return { success: false, error: errorMessage }
    }
  },

  fetchCategories: async () => {
    try {
      const response = await axios.get('/api/templates/categories')
      const categories = response.data.categories || []
      
      set({ categories })
      return { success: true, categories }
    } catch (error) {
      console.error('Categories fetch error:', error)
      return { success: false, error: error.response?.data?.detail || 'Failed to fetch categories' }
    }
  },

  fetchTemplateDetails: async (templateId) => {
    try {
      set({ loading: true, error: null })
      const response = await axios.get(`/api/templates/${templateId}`)
      const template = response.data.template
      
      // Enhanced template with additional computed fields
      const enhancedTemplate = {
        ...template,
        difficultyColor: get().getDifficultyColor(template.difficulty),
        setupTimeText: get().formatSetupTime(template.setup_time),
        popularityScore: get().calculatePopularityScore(template),
        techStackDisplay: template.tech_stack || [],
        estimatedFiles: get().estimateFileCount(template),
        complexityLevel: get().getComplexityLevel(template)
      }
      
      set({ selectedTemplate: enhancedTemplate, loading: false })
      return { success: true, template: enhancedTemplate }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to fetch template details'
      set({ error: errorMessage, loading: false })
      return { success: false, error: errorMessage }
    }
  },

  useTemplate: async (templateId, projectName) => {
    try {
      set({ loading: true, error: null })
      const response = await axios.post(`/api/templates/${templateId}/use`, {
        project_name: projectName
      })
      
      const project = response.data.project
      set({ loading: false })
      
      toast.success(`Project "${projectName}" created from template!`)
      return { success: true, project }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to create project from template'
      set({ error: errorMessage, loading: false })
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  },

  // Enhanced Filter Actions
  setFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }))
    
    // Auto-fetch with new filters
    get().fetchTemplates(get().filters)
  },

  clearFilters: () => {
    set({
      filters: {
        category: null,
        featured: null,
        search: '',
        difficulty: null
      }
    })
    
    // Fetch all templates
    get().fetchTemplates()
  },

  searchTemplates: async (searchTerm) => {
    try {
      set({ loading: true })
      const response = await axios.get(`/api/templates/?search=${encodeURIComponent(searchTerm)}`)
      const templates = response.data.templates || []
      
      const enhancedTemplates = templates.map(template => ({
        ...template,
        difficultyColor: get().getDifficultyColor(template.difficulty),
        setupTimeText: get().formatSetupTime(template.setup_time),
        popularityScore: get().calculatePopularityScore(template),
        techStackDisplay: template.tech_stack?.slice(0, 4) || []
      }))
      
      set({ 
        templates: enhancedTemplates, 
        loading: false,
        filters: { ...get().filters, search: searchTerm }
      })
      
      return { success: true, templates: enhancedTemplates }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Search failed'
      set({ error: errorMessage, loading: false })
      return { success: false, error: errorMessage }
    }
  },

  getFeaturedTemplates: async () => {
    try {
      const response = await axios.get('/api/templates/?featured=true&limit=6')
      const templates = response.data.templates || []
      
      return { success: true, templates }
    } catch (error) {
      return { success: false, error: 'Failed to fetch featured templates' }
    }
  },

  getPopularTemplates: async () => {
    try {
      // This would sort by downloads or usage
      const response = await axios.get('/api/templates/?limit=8')
      const templates = response.data.templates || []
      
      // Sort by downloads (mock sorting)
      const sortedTemplates = templates.sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
      
      return { success: true, templates: sortedTemplates }
    } catch (error) {
      return { success: false, error: 'Failed to fetch popular templates' }
    }
  },

  getRecentTemplates: async () => {
    try {
      const response = await axios.get('/api/templates/?limit=6')
      const templates = response.data.templates || []
      
      // Sort by creation date (mock sorting)
      const sortedTemplates = templates.sort((a, b) => 
        new Date(b.created_at || 0) - new Date(a.created_at || 0)
      )
      
      return { success: true, templates: sortedTemplates }
    } catch (error) {
      return { success: false, error: 'Failed to fetch recent templates' }
    }
  },

  // Utility Functions
  getDifficultyColor: (difficulty) => {
    const colors = {
      'Beginner': 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300',
      'Intermediate': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300',
      'Advanced': 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
    }
    return colors[difficulty] || colors['Beginner']
  },

  formatSetupTime: (setupTime) => {
    if (!setupTime) return 'Quick setup'
    
    // Convert various formats to consistent display
    const time = setupTime.toLowerCase()
    
    if (time.includes('minute')) return setupTime
    if (time.includes('hour')) return setupTime
    if (time.includes('min')) return setupTime
    
    // Default formatting
    return `${setupTime} setup`
  },

  calculatePopularityScore: (template) => {
    const downloads = template.downloads || 0
    const rating = template.rating || 0
    
    // Simple popularity algorithm
    return Math.floor((downloads * 0.7) + (rating * 100))
  },

  estimateFileCount: (template) => {
    // Estimate based on template type and complexity
    const baseFiles = {
      'react_app': 8,
      'api_service': 6,
      'full_stack': 15,
      'static_site': 4,
      'mobile_app': 12
    }
    
    const base = baseFiles[template.type] || 8
    const techStackMultiplier = (template.tech_stack?.length || 3) * 0.5
    
    return Math.floor(base + techStackMultiplier)
  },

  getComplexityLevel: (template) => {
    const difficulty = template.difficulty
    const techStackCount = template.tech_stack?.length || 0
    const featuresCount = template.features?.length || 0
    
    let complexity = 1
    
    if (difficulty === 'Advanced') complexity += 2
    else if (difficulty === 'Intermediate') complexity += 1
    
    if (techStackCount > 5) complexity += 1
    if (featuresCount > 8) complexity += 1
    
    const levels = ['Simple', 'Moderate', 'Complex', 'Advanced', 'Expert']
    return levels[Math.min(complexity, 4)] || 'Moderate'
  },

  // Enhanced Template Analytics
  trackTemplateView: async (templateId) => {
    try {
      // This would track template views for analytics
      console.log(`Tracking view for template: ${templateId}`)
      
      // Update local state to reflect view
      set(state => ({
        templates: state.templates.map(template => 
          template.id === templateId 
            ? { ...template, views: (template.views || 0) + 1 }
            : template
        )
      }))
    } catch (error) {
      console.error('Failed to track template view:', error)
    }
  },

  trackTemplateUse: async (templateId) => {
    try {
      // This would track template usage for analytics
      console.log(`Tracking usage for template: ${templateId}`)
      
      // Update local state to reflect usage
      set(state => ({
        templates: state.templates.map(template => 
          template.id === templateId 
            ? { ...template, usage_count: (template.usage_count || 0) + 1 }
            : template
        )
      }))
    } catch (error) {
      console.error('Failed to track template usage:', error)
    }
  },

  // State Management
  setSelectedTemplate: (template) => {
    set({ selectedTemplate: template })
  },

  clearSelectedTemplate: () => {
    set({ selectedTemplate: null })
  },

  clearError: () => {
    set({ error: null })
  },

  // Real-time Features
  subscribeToTemplateUpdates: () => {
    // This would subscribe to WebSocket updates for new templates
    console.log('Subscribing to template updates...')
  },

  unsubscribeFromTemplateUpdates: () => {
    // This would unsubscribe from WebSocket updates
    console.log('Unsubscribing from template updates...')
  }
}))

export { useTemplateStore }