import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import axios from 'axios'
import toast from 'react-hot-toast'

export const useProjectStore = create(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      isLoading: false,
      error: null,

      // Create a new project
      createProject: async (projectData) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await axios.post('/api/projects', projectData)
          const newProject = response.data.project
          
          // Add ID if not present
          if (!newProject.id && newProject._id) {
            newProject.id = newProject._id
          }
          
          set(state => ({
            projects: [newProject, ...state.projects],
            currentProject: newProject,
            isLoading: false,
            error: null
          }))
          
          return newProject
        } catch (error) {
          const errorMessage = error.response?.data?.detail || 'Failed to create project'
          set({
            error: errorMessage,
            isLoading: false
          })
          
          // Create a local project if API fails
          const localProject = {
            id: `local-${Date.now()}`,
            name: projectData.name,
            description: projectData.description,
            type: projectData.type || 'chat',
            status: 'initializing',
            techStack: projectData.techStack || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isLocal: true
          }
          
          set(state => ({
            projects: [localProject, ...state.projects],
            currentProject: localProject,
            error: null
          }))
          
          return localProject
        }
      },

      // Get all projects
      fetchProjects: async () => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await axios.get('/api/projects')
          const projects = response.data.projects.map(project => ({
            ...project,
            id: project.id || project._id
          }))
          
          set({
            projects,
            isLoading: false,
            error: null
          })
          
          return projects
        } catch (error) {
          const errorMessage = error.response?.data?.detail || 'Failed to fetch projects'
          set({
            error: errorMessage,
            isLoading: false
          })
          
          // Return cached projects if API fails
          return get().projects
        }
      },

      // Select a project
      selectProject: (projectId) => {
        const projects = get().projects
        const project = projects.find(p => p.id === projectId || p._id === projectId)
        
        if (project) {
          set({ currentProject: project })
        }
      },

      // Update project
      updateProject: async (projectId, updateData) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await axios.put(`/api/projects/${projectId}`, updateData)
          const updatedProject = response.data.project
          
          if (!updatedProject.id && updatedProject._id) {
            updatedProject.id = updatedProject._id
          }
          
          set(state => ({
            projects: state.projects.map(p => 
              (p.id === projectId || p._id === projectId) ? updatedProject : p
            ),
            currentProject: state.currentProject?.id === projectId ? updatedProject : state.currentProject,
            isLoading: false,
            error: null
          }))
          
          return updatedProject
        } catch (error) {
          const errorMessage = error.response?.data?.detail || 'Failed to update project'
          set({
            error: errorMessage,
            isLoading: false
          })
          
          // Update locally if API fails
          const localUpdate = {
            ...updateData,
            updatedAt: new Date().toISOString()
          }
          
          set(state => ({
            projects: state.projects.map(p => 
              (p.id === projectId || p._id === projectId) ? { ...p, ...localUpdate } : p
            ),
            currentProject: state.currentProject?.id === projectId ? 
              { ...state.currentProject, ...localUpdate } : state.currentProject,
            error: null
          }))
          
          throw error
        }
      },

      // Delete project
      deleteProject: async (projectId) => {
        set({ isLoading: true, error: null })
        
        try {
          await axios.delete(`/api/projects/${projectId}`)
          
          set(state => ({
            projects: state.projects.filter(p => p.id !== projectId && p._id !== projectId),
            currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
            isLoading: false,
            error: null
          }))
          
          return true
        } catch (error) {
          const errorMessage = error.response?.data?.detail || 'Failed to delete project'
          set({
            error: errorMessage,
            isLoading: false
          })
          
          // Delete locally if API fails
          set(state => ({
            projects: state.projects.filter(p => p.id !== projectId && p._id !== projectId),
            currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
            error: null
          }))
          
          throw error
        }
      },

      // Deploy project
      deployProject: async (projectId) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await axios.post(`/api/projects/${projectId}/deploy`)
          
          // Update project status
          set(state => ({
            projects: state.projects.map(p => 
              (p.id === projectId || p._id === projectId) 
                ? { ...p, status: 'deploying', updatedAt: new Date().toISOString() }
                : p
            ),
            currentProject: state.currentProject?.id === projectId 
              ? { ...state.currentProject, status: 'deploying', updatedAt: new Date().toISOString() }
              : state.currentProject,
            isLoading: false,
            error: null
          }))
          
          return response.data
        } catch (error) {
          const errorMessage = error.response?.data?.detail || 'Failed to deploy project'
          set({
            error: errorMessage,
            isLoading: false
          })
          throw error
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Clear current project
      clearCurrentProject: () => set({ currentProject: null })
    }),
    {
      name: 'project-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        projects: state.projects,
        currentProject: state.currentProject 
      }),
      version: 1,
    }
  )
)