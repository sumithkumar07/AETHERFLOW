import { create } from 'zustand'
import toast from 'react-hot-toast'

const useEnhancedProjectStore = create((set, get) => ({
  // Enhanced project state
  enhancedProjects: new Map(),
  developmentPatterns: {},
  contextAwareness: {},
  flowState: {},
  loading: false,

  // Initialize enhanced features for a project
  initializeEnhancedFeatures: async (projectId) => {
    if (!projectId) return

    const state = get()
    if (state.enhancedProjects.has(projectId)) return

    try {
      // Initialize enhanced project data
      const enhancedData = {
        id: projectId,
        initialized: true,
        contextAwareness: {
          currentFocus: 'general',
          workingMemory: [],
          recentActions: [],
          userPreferences: {}
        },
        developmentPatterns: {
          codingHours: {},
          productivePeriods: [],
          preferences: {},
          workflowOptimizations: []
        },
        flowState: {
          currentSession: null,
          sessionHistory: [],
          focusMetrics: {},
          productivityScore: 0
        },
        smartSuggestions: {
          suggestions: [],
          lastUpdated: null,
          userFeedback: {}
        },
        voiceCommands: {
          enabled: false,
          customCommands: [],
          usage: {}
        }
      }

      set(state => ({
        enhancedProjects: new Map(state.enhancedProjects).set(projectId, enhancedData)
      }))

      toast.success('Enhanced features initialized', { duration: 2000 })
      
    } catch (error) {
      console.error('Failed to initialize enhanced features:', error)
      toast.error('Failed to initialize enhanced features')
    }
  },

  // Track development patterns
  trackDevelopmentPattern: (projectId, action, data) => {
    if (!projectId) return

    const state = get()
    const project = state.enhancedProjects.get(projectId)
    
    if (!project) {
      get().initializeEnhancedFeatures(projectId)
      return
    }

    try {
      const timestamp = new Date().toISOString()
      const pattern = {
        action,
        data,
        timestamp,
        hour: new Date().getHours(),
        dayOfWeek: new Date().getDay()
      }

      // Update development patterns
      const updatedProject = {
        ...project,
        developmentPatterns: {
          ...project.developmentPatterns,
          recentActions: [
            pattern,
            ...project.developmentPatterns.recentActions.slice(0, 49) // Keep last 50
          ]
        }
      }

      set(state => ({
        enhancedProjects: new Map(state.enhancedProjects).set(projectId, updatedProject)
      }))

      // Analyze patterns for insights
      get().analyzePatterns(projectId)

    } catch (error) {
      console.error('Failed to track development pattern:', error)
    }
  },

  // Analyze development patterns for insights
  analyzePatterns: (projectId) => {
    const state = get()
    const project = state.enhancedProjects.get(projectId)
    if (!project) return

    try {
      const actions = project.developmentPatterns.recentActions || []
      if (actions.length < 5) return // Need at least 5 actions for analysis

      // Analyze productive hours
      const hourlyActivity = actions.reduce((acc, action) => {
        acc[action.hour] = (acc[action.hour] || 0) + 1
        return acc
      }, {})

      const mostProductiveHour = Object.entries(hourlyActivity)
        .sort(([,a], [,b]) => b - a)[0]

      // Analyze common action patterns
      const actionTypes = actions.reduce((acc, action) => {
        acc[action.action] = (acc[action.action] || 0) + 1
        return acc
      }, {})

      // Update insights
      const insights = {
        mostProductiveHour: mostProductiveHour ? parseInt(mostProductiveHour[0]) : null,
        commonActions: Object.entries(actionTypes).sort(([,a], [,b]) => b - a).slice(0, 3),
        totalActions: actions.length,
        lastAnalyzed: new Date().toISOString()
      }

      const updatedProject = {
        ...project,
        developmentPatterns: {
          ...project.developmentPatterns,
          insights
        }
      }

      set(state => ({
        enhancedProjects: new Map(state.enhancedProjects).set(projectId, updatedProject)
      }))

    } catch (error) {
      console.error('Failed to analyze patterns:', error)
    }
  },

  // Update context awareness
  updateContextAwareness: (projectId, context, data) => {
    if (!projectId) return

    const state = get()
    const project = state.enhancedProjects.get(projectId)
    
    if (!project) {
      get().initializeEnhancedFeatures(projectId)
      return
    }

    try {
      const updatedProject = {
        ...project,
        contextAwareness: {
          ...project.contextAwareness,
          currentFocus: context,
          lastUpdate: new Date().toISOString(),
          ...data
        }
      }

      set(state => ({
        enhancedProjects: new Map(state.enhancedProjects).set(projectId, updatedProject)
      }))

    } catch (error) {
      console.error('Failed to update context awareness:', error)
    }
  },

  // Update flow state
  updateFlowState: (projectId, metrics) => {
    if (!projectId) return

    const state = get()
    const project = state.enhancedProjects.get(projectId)
    
    if (!project) {
      get().initializeEnhancedFeatures(projectId)
      return
    }

    try {
      const currentSession = project.flowState.currentSession || {
        id: `session_${Date.now()}`,
        startTime: new Date().toISOString(),
        actions: [],
        focusScore: 0
      }

      const updatedSession = {
        ...currentSession,
        ...metrics,
        lastUpdate: new Date().toISOString()
      }

      const updatedProject = {
        ...project,
        flowState: {
          ...project.flowState,
          currentSession: updatedSession,
          lastUpdate: new Date().toISOString()
        }
      }

      set(state => ({
        enhancedProjects: new Map(state.enhancedProjects).set(projectId, updatedProject)
      }))

    } catch (error) {
      console.error('Failed to update flow state:', error)
    }
  },

  // Generate smart suggestions
  generateSmartSuggestions: async (projectId, context = {}) => {
    if (!projectId) return []

    const state = get()
    const project = state.enhancedProjects.get(projectId)
    
    if (!project) {
      await get().initializeEnhancedFeatures(projectId)
      return []
    }

    try {
      // Generate contextual suggestions based on patterns and current state
      const patterns = project.developmentPatterns || {}
      const contextAware = project.contextAwareness || {}
      
      const suggestions = []

      // Pattern-based suggestions
      if (patterns.insights?.mostProductiveHour !== null) {
        const currentHour = new Date().getHours()
        const productiveHour = patterns.insights.mostProductiveHour
        
        if (Math.abs(currentHour - productiveHour) <= 1) {
          suggestions.push({
            id: 'productive_time',
            type: 'timing',
            title: 'Peak Productivity Time',
            message: `This is typically your most productive hour. Consider tackling complex tasks now.`,
            priority: 'medium',
            confidence: 0.8
          })
        }
      }

      // Context-based suggestions
      if (contextAware.currentFocus === 'project_workspace') {
        suggestions.push({
          id: 'workspace_focus',
          type: 'workflow',
          title: 'Workspace Optimization',
          message: 'Consider organizing your panels for better workflow.',
          priority: 'low',
          confidence: 0.6
        })
      }

      // Recent activity suggestions
      const recentActions = patterns.recentActions || []
      if (recentActions.length > 0) {
        const lastAction = recentActions[0]
        if (lastAction.action === 'chat_interaction' && Date.now() - new Date(lastAction.timestamp).getTime() > 300000) {
          suggestions.push({
            id: 'continue_work',
            type: 'workflow',
            title: 'Continue Previous Work',
            message: 'You were working on something 5 minutes ago. Want to continue?',
            priority: 'high',
            confidence: 0.9
          })
        }
      }

      // Update project with suggestions
      const updatedProject = {
        ...project,
        smartSuggestions: {
          ...project.smartSuggestions,
          suggestions,
          lastUpdated: new Date().toISOString()
        }
      }

      set(state => ({
        enhancedProjects: new Map(state.enhancedProjects).set(projectId, updatedProject)
      }))

      return suggestions

    } catch (error) {
      console.error('Failed to generate smart suggestions:', error)
      return []
    }
  },

  // Get enhanced project data
  getEnhancedProjectData: (projectId) => {
    const state = get()
    return state.enhancedProjects.get(projectId) || null
  },

  // Get development patterns
  getDevelopmentPatterns: (projectId) => {
    const project = get().getEnhancedProjectData(projectId)
    return project?.developmentPatterns || {}
  },

  // Get context awareness data
  getContextAwareness: (projectId) => {
    const project = get().getEnhancedProjectData(projectId)
    return project?.contextAwareness || {}
  },

  // Get flow state data
  getFlowState: (projectId) => {
    const project = get().getEnhancedProjectData(projectId)
    return project?.flowState || {}
  },

  // Get smart suggestions
  getSmartSuggestions: (projectId) => {
    const project = get().getEnhancedProjectData(projectId)
    return project?.smartSuggestions?.suggestions || []
  },

  // End current flow session
  endFlowSession: (projectId) => {
    if (!projectId) return

    const state = get()
    const project = state.enhancedProjects.get(projectId)
    
    if (!project || !project.flowState.currentSession) return

    try {
      const session = project.flowState.currentSession
      const endTime = new Date().toISOString()
      const duration = new Date(endTime).getTime() - new Date(session.startTime).getTime()

      const completedSession = {
        ...session,
        endTime,
        duration,
        completed: true
      }

      const updatedProject = {
        ...project,
        flowState: {
          ...project.flowState,
          currentSession: null,
          sessionHistory: [
            completedSession,
            ...project.flowState.sessionHistory.slice(0, 9) // Keep last 10 sessions
          ]
        }
      }

      set(state => ({
        enhancedProjects: new Map(state.enhancedProjects).set(projectId, updatedProject)
      }))

      toast.success(`Flow session completed: ${Math.floor(duration / 60000)} minutes`)

    } catch (error) {
      console.error('Failed to end flow session:', error)
    }
  },

  // Clear enhanced data for project
  clearEnhancedData: (projectId) => {
    if (!projectId) return

    set(state => {
      const newMap = new Map(state.enhancedProjects)
      newMap.delete(projectId)
      return { enhancedProjects: newMap }
    })
  },

  // Export enhanced data
  exportEnhancedData: (projectId) => {
    const project = get().getEnhancedProjectData(projectId)
    if (!project) return null

    const exportData = {
      projectId,
      enhancedData: project,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `enhanced_project_data_${projectId}_${Date.now()}.json`
    link.click()
    
    URL.revokeObjectURL(url)
    toast.success('Enhanced project data exported')
  },

  // Import enhanced data
  importEnhancedData: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          
          if (data.projectId && data.enhancedData) {
            set(state => ({
              enhancedProjects: new Map(state.enhancedProjects).set(data.projectId, data.enhancedData)
            }))
            
            toast.success('Enhanced project data imported')
            resolve(data)
          } else {
            reject(new Error('Invalid data format'))
          }
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }
}))

export { useEnhancedProjectStore }