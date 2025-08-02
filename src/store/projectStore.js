import { create } from 'zustand'
import axios from 'axios'
import toast from 'react-hot-toast'

const useProjectStore = create((set, get) => ({
  // Enhanced State
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
  projectMetrics: {},
  buildLogs: [],
  deploymentStatus: {},
  
  // Actions
  fetchProjects: async () => {
    try {
      set({ loading: true, error: null })
      const response = await axios.get('/api/projects/')
      const projects = response.data.projects || []
      
      // Enhanced projects with computed fields
      const enhancedProjects = projects.map(project => ({
        ...project,
        progress: get().calculateProjectProgress(project),
        lastActivityText: get().getLastActivityText(project.updated_at),
        techStackDisplay: project.tech_stack?.slice(0, 3) || [],
        statusColor: get().getStatusColor(project.status)
      }))
      
      set({ projects: enhancedProjects, loading: false })
      return { success: true, projects: enhancedProjects }
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
      
      // Enhanced project data with AI suggestions
      const enhancedProjectData = {
        ...projectData,
        type: get().inferProjectType(projectData.description),
        requirements: projectData.description, // Use description as initial requirements
        tech_stack: get().suggestTechStack(projectData.description)
      }
      
      const response = await axios.post('/api/projects/', enhancedProjectData)
      const newProject = response.data.project
      
      // Enhanced project with computed fields
      const enhancedProject = {
        ...newProject,
        progress: 0,
        lastActivityText: 'Just created',
        techStackDisplay: newProject.tech_stack?.slice(0, 3) || [],
        statusColor: get().getStatusColor(newProject.status)
      }
      
      set(state => ({
        projects: [enhancedProject, ...state.projects],
        loading: false
      }))
      
      toast.success('Project created successfully!')
      return { success: true, project: enhancedProject }
    } catch (error) {
      console.error('Project creation error:', error)
      const errorMessage = error.response?.data?.detail || 'Failed to create project'
      set({ error: errorMessage, loading: false })
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  },

  fetchProject: async (projectId) => {
    try {
      set({ loading: true, error: null })
      const response = await axios.get(`/api/projects/${projectId}`)
      const project = response.data.project
      
      // Enhanced project with additional data
      const enhancedProject = {
        ...project,
        progress: get().calculateProjectProgress(project),
        lastActivityText: get().getLastActivityText(project.updated_at),
        techStackDisplay: project.tech_stack?.slice(0, 5) || [],
        statusColor: get().getStatusColor(project.status)
      }
      
      set({ currentProject: enhancedProject, loading: false })
      
      // Fetch additional project data in parallel
      get().fetchProjectMetrics(projectId)
      get().fetchBuildLogs(projectId)
      
      return { success: true, project: enhancedProject }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to fetch project'
      set({ error: errorMessage, loading: false })
      return { success: false, error: errorMessage }
    }
  },

  updateProject: async (projectId, updates) => {
    try {
      set({ loading: true, error: null })
      const response = await axios.put(`/api/projects/${projectId}`, updates)
      const updatedProject = response.data.project
      
      const enhancedProject = {
        ...updatedProject,
        progress: get().calculateProjectProgress(updatedProject),
        lastActivityText: get().getLastActivityText(updatedProject.updated_at),
        techStackDisplay: updatedProject.tech_stack?.slice(0, 3) || [],
        statusColor: get().getStatusColor(updatedProject.status)
      }
      
      set(state => ({
        projects: state.projects.map(p => p.id === projectId ? enhancedProject : p),
        currentProject: state.currentProject?.id === projectId ? enhancedProject : state.currentProject,
        loading: false
      }))
      
      toast.success('Project updated successfully!')
      return { success: true, project: enhancedProject }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to update project'
      set({ error: errorMessage, loading: false })
      return { success: false, error: errorMessage }
    }
  },

  deleteProject: async (projectId) => {
    try {
      set({ loading: true, error: null })
      await axios.delete(`/api/projects/${projectId}`)
      
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

  // Enhanced Actions for Full Backend Integration

  buildProject: async (projectId) => {
    try {
      set({ loading: true })
      const response = await axios.post(`/api/projects/${projectId}/build`)
      
      set(state => ({
        deploymentStatus: {
          ...state.deploymentStatus,
          [projectId]: 'building'
        },
        loading: false
      }))
      
      toast.success('Build started successfully!')
      
      // Poll build status
      get().pollBuildStatus(projectId)
      
      return { success: true, status: response.data.status }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to start build'
      set({ error: errorMessage, loading: false })
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  },

  deployProject: async (projectId) => {
    try {
      set({ loading: true })
      const response = await axios.post(`/api/projects/${projectId}/deploy`)
      
      set(state => ({
        deploymentStatus: {
          ...state.deploymentStatus,
          [projectId]: 'deploying'
        },
        loading: false
      }))
      
      toast.success('Deployment started successfully!')
      
      // Poll deployment status
      get().pollDeploymentStatus(projectId)
      
      return { success: true, status: response.data.status }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to start deployment'
      set({ error: errorMessage, loading: false })
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  },

  fetchProjectFiles: async (projectId) => {
    try {
      const response = await axios.get(`/api/projects/${projectId}/files`)
      const files = response.data.files || []
      
      set(state => ({
        currentProject: {
          ...state.currentProject,
          files: files,
          fileTree: get().buildFileTree(files)
        }
      }))
      
      return { success: true, files }
    } catch (error) {
      console.error('Files fetch error:', error)
      return { success: false, error: error.response?.data?.detail || 'Failed to fetch files' }
    }
  },

  saveProjectFile: async (projectId, fileData) => {
    try {
      const response = await axios.post(`/api/projects/${projectId}/files`, fileData)
      
      toast.success(`File saved: ${fileData.path}`)
      
      // Refresh files
      get().fetchProjectFiles(projectId)
      
      return { success: true, file: response.data.file }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to save file'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  },

  fetchBuildLogs: async (projectId) => {
    try {
      const response = await axios.get(`/api/projects/${projectId}/logs`)
      const logs = response.data.logs || []
      
      set({ buildLogs: logs })
      
      return { success: true, logs }
    } catch (error) {
      console.error('Build logs fetch error:', error)
      return { success: false, error: error.response?.data?.detail }
    }
  },

  // Enhanced AI-Powered Project Actions

  generateProjectFile: async (projectId, fileRequest) => {
    try {
      set({ loading: true })
      const response = await axios.post(`/api/projects/${projectId}/generate-file`, fileRequest)
      
      toast.success(`Generated file: ${fileRequest.path}`)
      
      // Refresh project files
      await get().fetchProjectFiles(projectId)
      
      set({ loading: false })
      return { success: true, file: response.data.file }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to generate file'
      set({ error: errorMessage, loading: false })
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  },

  enhanceProjectWithAI: async (projectId, enhancementRequest) => {
    try {
      set({ loading: true })
      const response = await axios.post(`/api/projects/${projectId}/ai-enhance`, enhancementRequest)
      
      toast.success('Project enhanced with AI!')
      
      // Refresh project data
      await get().fetchProject(projectId)
      await get().fetchProjectFiles(projectId)
      
      set({ loading: false })
      return { success: true, enhancement: response.data }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to enhance project'
      set({ error: errorMessage, loading: false })
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  },

  getAICodeReview: async (projectId) => {
    try {
      set({ loading: true })
      const response = await axios.post(`/api/projects/${projectId}/code-review`)
      
      set({ loading: false })
      return { success: true, review: response.data }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to get code review'
      set({ error: errorMessage, loading: false })
      return { success: false, error: errorMessage }
    }
  },

  applyAIAutoFix: async (projectId, fixRequest) => {
    try {
      set({ loading: true })
      const response = await axios.post(`/api/projects/${projectId}/auto-fix`, fixRequest)
      
      if (response.data.code_updated) {
        toast.success('Auto-fix applied successfully!')
        await get().fetchProjectFiles(projectId)
      } else {
        toast.success('Fix analysis completed')
      }
      
      set({ loading: false })
      return { success: true, fix: response.data }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to apply auto-fix'
      set({ error: errorMessage, loading: false })
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  },

  createProjectFromTemplate: async (templateId, projectName) => {
    try {
      set({ loading: true, error: null })
      const response = await axios.post(`/api/templates/${templateId}/use`, {
        project_name: projectName
      })
      
      const newProject = response.data.project
      
      // Enhanced project with computed fields
      const enhancedProject = {
        ...newProject,
        progress: get().calculateProjectProgress(newProject),
        lastActivityText: 'Created from template',
        techStackDisplay: newProject.tech_stack?.slice(0, 3) || [],
        statusColor: get().getStatusColor(newProject.status)
      }
      
      set(state => ({
        projects: [enhancedProject, ...state.projects],
        loading: false
      }))
      
      toast.success(`Project created from template!`)
      return { success: true, project: enhancedProject }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to create project from template'
      set({ error: errorMessage, loading: false })
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  },

  getProjectPreviewUrl: (projectId) => {
    // This would connect to the preview service
    return `http://localhost:3001/preview/${projectId}`
  },

  // Real-time collaboration features
  connectToProjectRoom: (projectId) => {
    // This would connect to WebSocket for real-time updates
    console.log(`Connecting to project room: ${projectId}`)
  },

  disconnectFromProjectRoom: (projectId) => {
    // This would disconnect from WebSocket
    console.log(`Disconnecting from project room: ${projectId}`)
  },

  // Utility Functions

  calculateProjectProgress: (project) => {
    if (!project) return 0
    
    let progress = 0
    
    // Base progress from status
    switch (project.status) {
      case 'draft': progress = 10; break
      case 'building': progress = 50; break
      case 'ready': progress = 75; break
      case 'deployed': progress = 100; break
      default: progress = 5
    }
    
    // Additional progress from files
    const filesCount = project.files?.length || 0
    progress += Math.min(filesCount * 2, 15)
    
    // Additional progress from tech stack
    const techStackCount = project.tech_stack?.length || 0
    progress += Math.min(techStackCount * 3, 10)
    
    return Math.min(progress, 100)
  },

  getLastActivityText: (updatedAt) => {
    if (!updatedAt) return 'No activity'
    
    const now = new Date()
    const updated = new Date(updatedAt)
    const diffMs = now - updated
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return updated.toLocaleDateString()
  },

  getStatusColor: (status) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      'building': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300',
      'ready': 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
      'deployed': 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300',
      'error': 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
    }
    return colors[status] || colors['draft']
  },

  inferProjectType: (description) => {
    const desc = description.toLowerCase()
    
    if (desc.includes('api') || desc.includes('backend')) return 'api_service'
    if (desc.includes('mobile') || desc.includes('app')) return 'mobile_app'
    if (desc.includes('full stack') || desc.includes('fullstack')) return 'full_stack'
    if (desc.includes('website') || desc.includes('landing')) return 'static_site'
    
    return 'react_app' // Default
  },

  suggestTechStack: (description) => {
    const desc = description.toLowerCase()
    const techStack = ['React'] // Default
    
    if (desc.includes('typescript') || desc.includes('ts')) techStack.push('TypeScript')
    if (desc.includes('tailwind')) techStack.push('Tailwind CSS')
    if (desc.includes('api') || desc.includes('backend')) techStack.push('FastAPI', 'MongoDB')
    if (desc.includes('auth')) techStack.push('JWT Authentication')
    if (desc.includes('payment') || desc.includes('stripe')) techStack.push('Stripe')
    if (desc.includes('real-time') || desc.includes('chat')) techStack.push('WebSockets')
    
    return techStack
  },

  buildFileTree: (files) => {
    const tree = {}
    
    files.forEach(file => {
      const pathParts = file.path.split('/')
      let current = tree
      
      pathParts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = index === pathParts.length - 1 ? file : {}
        }
        current = current[part]
      })
    })
    
    return tree
  },

  pollBuildStatus: async (projectId) => {
    const maxAttempts = 30
    let attempts = 0
    
    const poll = async () => {
      if (attempts >= maxAttempts) return
      
      try {
        const project = await get().fetchProject(projectId)
        if (project.success) {
          const status = project.project.status
          
          if (status === 'ready') {
            set(state => ({
              deploymentStatus: {
                ...state.deploymentStatus,
                [projectId]: 'ready'
              }
            }))
            toast.success('Build completed successfully!', { icon: '🎉' })
            return
          } else if (status === 'error') {
            set(state => ({
              deploymentStatus: {
                ...state.deploymentStatus,
                [projectId]: 'error'
              }
            }))
            toast.error('Build failed. Check logs for details.')
            return
          }
        }
        
        attempts++
        setTimeout(poll, 3000) // Poll every 3 seconds
      } catch (error) {
        console.error('Build status poll error:', error)
      }
    }
    
    setTimeout(poll, 3000)
  },

  pollDeploymentStatus: async (projectId) => {
    const maxAttempts = 30
    let attempts = 0
    
    const poll = async () => {
      if (attempts >= maxAttempts) return
      
      try {
        const project = await get().fetchProject(projectId)
        if (project.success) {
          const status = project.project.status
          
          if (status === 'deployed') {
            set(state => ({
              deploymentStatus: {
                ...state.deploymentStatus,
                [projectId]: 'deployed'
              }
            }))
            toast.success('Deployment completed successfully!', { icon: '🚀' })
            return
          } else if (status === 'error') {
            set(state => ({
              deploymentStatus: {
                ...state.deploymentStatus,
                [projectId]: 'error'
              }
            }))
            toast.error('Deployment failed. Check logs for details.')
            return
          }
        }
        
        attempts++
        setTimeout(poll, 5000) // Poll every 5 seconds
      } catch (error) {
        console.error('Deployment status poll error:', error)
      }
    }
    
    setTimeout(poll, 5000)
  },

  setCurrentProject: (project) => {
    set({ currentProject: project })
  },

  clearError: () => {
    set({ error: null })
  },

  resetDeploymentStatus: (projectId) => {
    set(state => ({
      deploymentStatus: {
        ...state.deploymentStatus,
        [projectId]: null
      }
    }))
  }
}))

export { useProjectStore }