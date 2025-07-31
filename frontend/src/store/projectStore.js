import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { projectsAPI } from '../services/api'
import toast from 'react-hot-toast'

export const useProjectStore = create(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      loading: false,
      
      loadProjects: async (status = null) => {
        set({ loading: true })
        try {
          const response = await projectsAPI.getProjects(20, 0, status)
          set({ projects: response.projects, loading: false })
        } catch (error) {
          console.error('Error loading projects:', error)
          toast.error('Failed to load projects')
          set({ loading: false })
        }
      },
      
      createProject: async (projectData) => {
        set({ loading: true })
        try {
          const response = await projectsAPI.createProject(projectData)
          const newProject = response.project
          
          set(state => ({
            projects: [newProject, ...state.projects],
            currentProject: newProject,
            loading: false
          }))
          
          toast.success('Project created successfully!')
          return newProject
        } catch (error) {
          console.error('Error creating project:', error)
          toast.error('Failed to create project')
          set({ loading: false })
          return null
        }
      },
      
      selectProject: async (projectId) => {
        set({ loading: true })
        try {
          const response = await projectsAPI.getProject(projectId)
          set({ currentProject: response.project, loading: false })
        } catch (error) {
          console.error('Error loading project:', error)
          toast.error('Failed to load project')
          set({ loading: false })
        }
      },
      
      updateProject: async (projectId, updateData) => {
        try {
          const response = await projectsAPI.updateProject(projectId, updateData)
          const updatedProject = response.project
          
          set(state => ({
            projects: state.projects.map(p => 
              p._id === projectId ? updatedProject : p
            ),
            currentProject: state.currentProject?._id === projectId 
              ? updatedProject 
              : state.currentProject
          }))
          
          toast.success('Project updated successfully!')
          return updatedProject
        } catch (error) {
          console.error('Error updating project:', error)
          toast.error('Failed to update project')
          return null
        }
      },
      
      deleteProject: async (projectId) => {
        try {
          await projectsAPI.deleteProject(projectId)
          
          set(state => ({
            projects: state.projects.filter(p => p._id !== projectId),
            currentProject: state.currentProject?._id === projectId 
              ? null 
              : state.currentProject
          }))
          
          toast.success('Project deleted successfully!')
        } catch (error) {
          console.error('Error deleting project:', error)
          toast.error('Failed to delete project')
        }
      },
      
      buildProject: async (projectId) => {
        try {
          await projectsAPI.buildProject(projectId)
          
          // Update project status
          set(state => ({
            projects: state.projects.map(p => 
              p._id === projectId 
                ? { ...p, status: 'building' }
                : p
            ),
            currentProject: state.currentProject?._id === projectId
              ? { ...state.currentProject, status: 'building' }
              : state.currentProject
          }))
          
          toast.success('Build started!')
        } catch (error) {
          console.error('Error building project:', error)
          toast.error('Failed to start build')
        }
      },
      
      deployProject: async (projectId) => {
        try {
          await projectsAPI.deployProject(projectId)
          toast.success('Deployment started!')
        } catch (error) {
          console.error('Error deploying project:', error)
          toast.error('Failed to start deployment')
        }
      },
      
      saveProjectFile: async (projectId, fileData) => {
        try {
          await projectsAPI.saveProjectFile(projectId, fileData)
          
          // Update project files in state
          set(state => ({
            currentProject: state.currentProject?._id === projectId
              ? {
                  ...state.currentProject,
                  files: state.currentProject.files?.map(f => 
                    f.path === fileData.path ? fileData : f
                  ).concat(
                    state.currentProject.files?.find(f => f.path === fileData.path) ? [] : [fileData]
                  ) || [fileData]
                }
              : state.currentProject
          }))
          
          toast.success('File saved!')
        } catch (error) {
          console.error('Error saving file:', error)
          toast.error('Failed to save file')
        }
      },
      
      getProjectFiles: async (projectId) => {
        try {
          const response = await projectsAPI.getProjectFiles(projectId)
          return response.files
        } catch (error) {
          console.error('Error loading project files:', error)
          toast.error('Failed to load project files')
          return []
        }
      }
    }),
    {
      name: 'project-storage',
      partialize: (state) => ({
        projects: state.projects,
        currentProject: state.currentProject
      })
    }
  )
)