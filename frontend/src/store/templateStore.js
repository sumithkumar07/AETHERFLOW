import { create } from 'zustand'
import { templatesAPI } from '../services/api'
import toast from 'react-hot-toast'

export const useTemplateStore = create((set, get) => ({
  templates: [],
  featuredTemplates: [],
  categories: [],
  loading: false,
  searchQuery: '',
  selectedCategory: null,
  
  loadTemplates: async (category = null, featured = null, search = null) => {
    set({ loading: true })
    try {
      const response = await templatesAPI.getTemplates(category, featured, search)
      set({ 
        templates: response.templates,
        categories: response.categories,
        loading: false 
      })
    } catch (error) {
      console.error('Error loading templates:', error)
      toast.error('Failed to load templates')
      set({ loading: false })
    }
  },
  
  loadFeaturedTemplates: async () => {
    try {
      const response = await templatesAPI.getFeaturedTemplates()
      set({ featuredTemplates: response.templates })
    } catch (error) {
      console.error('Error loading featured templates:', error)
    }
  },
  
  loadCategories: async () => {
    try {
      const response = await templatesAPI.getTemplateCategories()
      set({ categories: response.categories })
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  },
  
  getTemplate: async (templateId) => {
    try {
      const response = await templatesAPI.getTemplate(templateId)
      return response.template
    } catch (error) {
      console.error('Error loading template:', error)
      toast.error('Failed to load template')
      return null
    }
  },
  
  useTemplate: async (templateId) => {
    try {
      await templatesAPI.useTemplate(templateId)
      
      // Update download count in local state
      set(state => ({
        templates: state.templates.map(t => 
          t._id === templateId 
            ? { ...t, downloads: t.downloads + 1 }
            : t
        ),
        featuredTemplates: state.featuredTemplates.map(t => 
          t._id === templateId 
            ? { ...t, downloads: t.downloads + 1 }
            : t
        )
      }))
      
      toast.success('Template usage recorded!')
    } catch (error) {
      console.error('Error using template:', error)
      toast.error('Failed to record template usage')
    }
  },
  
  searchTemplates: async (query) => {
    set({ searchQuery: query, loading: true })
    await get().loadTemplates(get().selectedCategory, null, query)
  },
  
  filterByCategory: async (category) => {
    set({ selectedCategory: category, loading: true })
    await get().loadTemplates(category, null, get().searchQuery)
  },
  
  clearFilters: async () => {
    set({ searchQuery: '', selectedCategory: null })
    await get().loadTemplates()
  }
}))