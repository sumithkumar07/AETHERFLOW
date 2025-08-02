import { create } from 'zustand'
import axios from 'axios'
import toast from 'react-hot-toast'

const useProjectStore = create((set, get) => ({
  // State
  projects: [],
  currentProject: null,
  loading: false,
  error: null,

  // Actions
  fetchProjects: async () => {
    try {
      set({ loading: true, error: null })
      const response = await axios.get('/api/projects/')
      const projects = response.data.projects || []
      set({ projects, loading: false })
      return { success: true, projects }
    } catch (error) {
      console.error('Projects fetch error:', error)
      const errorMessage = error.response?.data?.detail || 'Failed to fetch projects'
      set({ error: errorMessage, loading: false })
      return { success: false, error: errorMessage }
    }
  },

  createProject: async (projectData) => {
    try {
      set({ loading: true, error: null })
      const response = await axios.post('/projects', projectData)
      const newProject = response.data
      
      set(state => ({ 
        projects: [newProject, ...state.projects],
        currentProject: newProject,
        loading: false 
      }))
      
      return { success: true, project: newProject }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to create project'
      set({ error: errorMessage, loading: false })
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  },

  fetchProject: async (projectId) => {
    try {
      set({ loading: true, error: null })
      const response = await axios.get(`/projects/${projectId}`)
      const project = response.data
      
      set({ currentProject: project, loading: false })
      return { success: true, project }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to fetch project'
      set({ error: errorMessage, loading: false })
      return { success: false, error: errorMessage }
    }
  },

  updateProject: async (projectId, updates) => {
    try {
      set({ loading: true, error: null })
      const response = await axios.put(`/projects/${projectId}`, updates)
      const updatedProject = response.data
      
      set(state => ({
        projects: state.projects.map(p => p.id === projectId ? updatedProject : p),
        currentProject: state.currentProject?.id === projectId ? updatedProject : state.currentProject,
        loading: false
      }))
      
      return { success: true, project: updatedProject }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to update project'
      set({ error: errorMessage, loading: false })
      return { success: false, error: errorMessage }
    }
  },

  deleteProject: async (projectId) => {
    try {
      set({ loading: true, error: null })
      await axios.delete(`/projects/${projectId}`)
      
      set(state => ({
        projects: state.projects.filter(p => p.id !== projectId),
        currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
        loading: false
      }))
      
      toast.success('Project deleted successfully')
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to delete project'
      set({ error: errorMessage, loading: false })
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  },

  setCurrentProject: (project) => {
    set({ currentProject: project })
  },

  clearError: () => {
    set({ error: null })
  }
}))

export { useProjectStore }