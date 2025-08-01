import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import axios from 'axios'
import toast from 'react-hot-toast'

const useProjectStore = create(
  devtools(
    persist(
      immer((set, get) => ({
        // State
        projects: [],
        currentProject: null,
        isLoading: false,
        error: null,
        filters: {
          status: 'all',
          type: 'all',
          sortBy: 'updated',
          sortOrder: 'desc'
        },
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          hasMore: false
        },

        // Actions
        fetchProjects: async (options = {}) => {
          try {
            set((state) => {
              state.isLoading = true
              state.error = null
            })

            const { filters, pagination } = get()
            const params = {
              page: options.page || pagination.page,
              limit: options.limit || pagination.limit,
              status: options.status || filters.status,
              type: options.type || filters.type,
              sort_by: options.sortBy || filters.sortBy,
              sort_order: options.sortOrder || filters.sortOrder,
              ...options.params
            }

            const response = await axios.get('/projects', { params })
            const { projects, total, page, has_more } = response.data

            set((state) => {
              if (options.append) {
                state.projects.push(...projects)
              } else {
                state.projects = projects
              }
              
              state.pagination = {
                page,
                limit: params.limit,
                total,
                hasMore: has_more
              }
              
              state.isLoading = false
              state.error = null
            })

            return { success: true, projects }

          } catch (error) {
            const errorMessage = error.response?.data?.detail || 'Failed to fetch projects'
            
            set((state) => {
              state.error = errorMessage
              state.isLoading = false
            })

            toast.error(errorMessage)
            return { success: false, error: errorMessage }
          }
        },

        createProject: async (projectData) => {
          try {
            set((state) => {
              state.isLoading = true
              state.error = null
            })

            const response = await axios.post('/projects', {
              ...projectData,
              status: 'initializing',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })

            const newProject = response.data

            set((state) => {
              state.projects.unshift(newProject)
              state.currentProject = newProject
              state.isLoading = false
              state.error = null
            })

            toast.success('Project created successfully!')
            return newProject

          } catch (error) {
            const errorMessage = error.response?.data?.detail || 'Failed to create project'
            
            set((state) => {
              state.error = errorMessage
              state.isLoading = false
            })

            toast.error(errorMessage)
            throw error
          }
        },

        updateProject: async (projectId, updates) => {
          try {
            set((state) => {
              state.isLoading = true
              state.error = null
            })

            const response = await axios.put(`/projects/${projectId}`, {
              ...updates,
              updated_at: new Date().toISOString()
            })

            const updatedProject = response.data

            set((state) => {
              const index = state.projects.findIndex(p => p.id === projectId)
              if (index !== -1) {
                state.projects[index] = updatedProject
              }
              
              if (state.currentProject?.id === projectId) {
                state.currentProject = updatedProject
              }
              
              state.isLoading = false
              state.error = null
            })

            toast.success('Project updated successfully!')
            return updatedProject

          } catch (error) {
            const errorMessage = error.response?.data?.detail || 'Failed to update project'
            
            set((state) => {
              state.error = errorMessage
              state.isLoading = false
            })

            toast.error(errorMessage)
            throw error
          }
        },

        deleteProject: async (projectId) => {
          try {
            set((state) => {
              state.isLoading = true
              state.error = null
            })

            await axios.delete(`/projects/${projectId}`)

            set((state) => {
              state.projects = state.projects.filter(p => p.id !== projectId)
              
              if (state.currentProject?.id === projectId) {
                state.currentProject = null
              }
              
              state.isLoading = false
              state.error = null
            })

            toast.success('Project deleted successfully!')
            return true

          } catch (error) {
            const errorMessage = error.response?.data?.detail || 'Failed to delete project'
            
            set((state) => {
              state.error = errorMessage
              state.isLoading = false
            })

            toast.error(errorMessage)
            throw error
          }
        },

        selectProject: async (projectId) => {
          try {
            set((state) => {
              state.isLoading = true
              state.error = null
            })

            // Check if project is already in local state
            const existingProject = get().projects.find(p => p.id === projectId)
            
            if (existingProject) {
              set((state) => {
                state.currentProject = existingProject
                state.isLoading = false
              })
              return existingProject
            }

            // Fetch project from server
            const response = await axios.get(`/projects/${projectId}`)
            const project = response.data

            set((state) => {
              state.currentProject = project
              
              // Add to projects list if not already there
              const existingIndex = state.projects.findIndex(p => p.id === projectId)
              if (existingIndex === -1) {
                state.projects.unshift(project)
              } else {
                state.projects[existingIndex] = project
              }
              
              state.isLoading = false
              state.error = null
            })

            return project

          } catch (error) {
            const errorMessage = error.response?.data?.detail || 'Failed to load project'
            
            set((state) => {
              state.error = errorMessage
              state.isLoading = false
              state.currentProject = null
            })

            toast.error(errorMessage)
            throw error
          }
        },

        deployProject: async (projectId, deploymentConfig = {}) => {
          try {
            set((state) => {
              state.isLoading = true
              state.error = null
            })

            const response = await axios.post(`/projects/${projectId}/deploy`, deploymentConfig)
            const deployment = response.data

            // Update project status
            set((state) => {
              const index = state.projects.findIndex(p => p.id === projectId)
              if (index !== -1) {
                state.projects[index].status = 'deploying'
                state.projects[index].deployment = deployment
              }
              
              if (state.currentProject?.id === projectId) {
                state.currentProject.status = 'deploying'
                state.currentProject.deployment = deployment
              }
              
              state.isLoading = false
              state.error = null
            })

            toast.success('Deployment started!')
            return deployment

          } catch (error) {
            const errorMessage = error.response?.data?.detail || 'Failed to deploy project'
            
            set((state) => {
              state.error = errorMessage
              state.isLoading = false
            })

            toast.error(errorMessage)
            throw error
          }
        },

        duplicateProject: async (projectId, newName) => {
          try {
            const response = await axios.post(`/projects/${projectId}/duplicate`, {
              name: newName
            })

            const duplicatedProject = response.data

            set((state) => {
              state.projects.unshift(duplicatedProject)
            })

            toast.success('Project duplicated successfully!')
            return duplicatedProject

          } catch (error) {
            const errorMessage = error.response?.data?.detail || 'Failed to duplicate project'
            toast.error(errorMessage)
            throw error
          }
        },

        archiveProject: async (projectId) => {
          try {
            await axios.post(`/projects/${projectId}/archive`)

            set((state) => {
              const index = state.projects.findIndex(p => p.id === projectId)
              if (index !== -1) {
                state.projects[index].status = 'archived'
                state.projects[index].archived_at = new Date().toISOString()
              }
              
              if (state.currentProject?.id === projectId) {
                state.currentProject.status = 'archived'
                state.currentProject.archived_at = new Date().toISOString()
              }
            })

            toast.success('Project archived successfully!')
            return true

          } catch (error) {
            const errorMessage = error.response?.data?.detail || 'Failed to archive project'
            toast.error(errorMessage)
            throw error
          }
        },

        restoreProject: async (projectId) => {
          try {
            await axios.post(`/projects/${projectId}/restore`)

            set((state) => {
              const index = state.projects.findIndex(p => p.id === projectId)
              if (index !== -1) {
                state.projects[index].status = 'ready'
                delete state.projects[index].archived_at
              }
              
              if (state.currentProject?.id === projectId) {
                state.currentProject.status = 'ready'
                delete state.currentProject.archived_at
              }
            })

            toast.success('Project restored successfully!')
            return true

          } catch (error) {
            const errorMessage = error.response?.data?.detail || 'Failed to restore project'
            toast.error(errorMessage)
            throw error
          }
        },

        // Filters and sorting
        setFilters: (newFilters) => {
          set((state) => {
            state.filters = { ...state.filters, ...newFilters }
            state.pagination.page = 1 // Reset to first page
          })
        },

        resetFilters: () => {
          set((state) => {
            state.filters = {
              status: 'all',
              type: 'all',
              sortBy: 'updated',
              sortOrder: 'desc'
            }
            state.pagination.page = 1
          })
        },

        // Pagination
        setPage: (page) => {
          set((state) => {
            state.pagination.page = page
          })
        },

        loadMore: async () => {
          const { pagination, isLoading } = get()
          
          if (isLoading || !pagination.hasMore) {
            return
          }

          return get().fetchProjects({
            page: pagination.page + 1,
            append: true
          })
        },

        // Search
        searchProjects: async (query) => {
          return get().fetchProjects({
            params: { search: query },
            page: 1
          })
        },

        // Project stats
        getProjectStats: () => {
          const { projects } = get()
          
          const stats = {
            total: projects.length,
            active: projects.filter(p => ['initializing', 'ready', 'building'].includes(p.status)).length,
            deployed: projects.filter(p => p.status === 'deployed').length,
            archived: projects.filter(p => p.status === 'archived').length,
            byType: {},
            byTechStack: {}
          }
          
          projects.forEach(project => {
            // Count by type
            stats.byType[project.type] = (stats.byType[project.type] || 0) + 1
            
            // Count by tech stack
            if (project.techStack) {
              project.techStack.forEach(tech => {
                stats.byTechStack[tech] = (stats.byTechStack[tech] || 0) + 1
              })
            }
          })
          
          return stats
        },

        // Clear state
        clearError: () => {
          set((state) => {
            state.error = null
          })
        },

        clearCurrentProject: () => {
          set((state) => {
            state.currentProject = null
          })
        },

        reset: () => {
          set((state) => {
            state.projects = []
            state.currentProject = null
            state.isLoading = false
            state.error = null
            state.filters = {
              status: 'all',
              type: 'all',
              sortBy: 'updated',
              sortOrder: 'desc'
            }
            state.pagination = {
              page: 1,
              limit: 20,
              total: 0,
              hasMore: false
            }
          })
        }
      })),
      {
        name: 'ai-tempo-projects',
        partialize: (state) => ({
          projects: state.projects,
          currentProject: state.currentProject,
          filters: state.filters,
          pagination: state.pagination
        }),
        version: 1
      }
    ),
    {
      name: 'project-store'
    }
  )
)

export { useProjectStore }