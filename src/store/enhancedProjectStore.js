import { create } from 'zustand'
import axios from 'axios'
import toast from 'react-hot-toast'

// Enhanced Project Store - Connects to advanced backend features
const useEnhancedProjectStore = create((set, get) => ({
  // Enhanced project features state
  enhancedFeatures: {
    contextAwareness: true,
    smartSuggestions: true,
    flowStateTracking: true,
    voiceCommands: false,
    visualProgramming: false,
    architecturalIntelligence: true
  },
  
  developmentPatterns: [],
  contextAwareness: {
    currentContext: null,
    sessionData: {},
    userPreferences: {}
  },
  
  smartInsights: {
    projectHealth: null,
    codeQuality: null,
    performanceMetrics: null,
    securityAnalysis: null
  },
  
  collaborationData: {
    activeSessions: [],
    sharedContext: {},
    teamActivity: []
  },
  
  workflowAutomation: {
    activeWorkflows: [],
    automationTriggers: [],
    customRules: []
  },

  // Actions
  initializeEnhancedFeatures: async (projectId) => {
    try {
      // Initialize enhanced features for project
      const response = await axios.post('/api/enhanced/initialize', {
        project_id: projectId,
        features: get().enhancedFeatures
      })
      
      if (response.data.success) {
        set(state => ({
          contextAwareness: {
            ...state.contextAwareness,
            currentContext: response.data.context
          }
        }))
      }
      
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Enhanced features initialization error:', error)
      return { success: false, error: error.response?.data?.detail || 'Initialization failed' }
    }
  },

  trackDevelopmentPattern: async (projectId, action, metadata = {}) => {
    try {
      const patternData = {
        project_id: projectId,
        action,
        metadata: {
          timestamp: new Date().toISOString(),
          ...metadata
        }
      }
      
      // Add to local patterns immediately
      set(state => ({
        developmentPatterns: [...state.developmentPatterns, patternData].slice(-100) // Keep last 100 patterns
      }))
      
      // Send to backend for analysis
      await axios.post('/api/enhanced/track-pattern', patternData)
      
      return { success: true }
    } catch (error) {
      console.error('Pattern tracking error:', error)
      return { success: false, error: error.response?.data?.detail }
    }
  },

  updateContextAwareness: async (contextType, contextData) => {
    try {
      const response = await axios.post('/api/enhanced/context', {
        context_type: contextType,
        context_data: contextData,
        timestamp: new Date().toISOString()
      })
      
      set(state => ({
        contextAwareness: {
          ...state.contextAwareness,
          currentContext: response.data.context,
          sessionData: {
            ...state.contextAwareness.sessionData,
            [contextType]: contextData
          }
        }
      }))
      
      return { success: true, context: response.data.context }
    } catch (error) {
      console.error('Context awareness error:', error)
      return { success: false, error: error.response?.data?.detail }
    }
  },

  generateSmartInsights: async (projectId) => {
    try {
      const response = await axios.post('/api/enhanced/insights', {
        project_id: projectId,
        analysis_types: ['health', 'quality', 'performance', 'security']
      })
      
      set(state => ({
        smartInsights: {
          ...state.smartInsights,
          ...response.data.insights
        }
      }))
      
      // Show key insights as notifications
      if (response.data.insights.projectHealth?.score < 70) {
        toast.warning('Project health needs attention', { icon: '⚠️' })
      }
      
      if (response.data.insights.codeQuality?.issues > 5) {
        toast.info(`Found ${response.data.insights.codeQuality.issues} code quality issues`, { icon: '🔍' })
      }
      
      return { success: true, insights: response.data.insights }
    } catch (error) {
      console.error('Smart insights error:', error)
      return { success: false, error: error.response?.data?.detail }
    }
  },

  setupCollaboration: async (projectId, collaborators = []) => {
    try {
      const response = await axios.post('/api/enhanced/collaboration', {
        project_id: projectId,
        collaborators,
        features: ['real_time_sync', 'shared_context', 'live_cursors']
      })
      
      set(state => ({
        collaborationData: {
          ...state.collaborationData,
          activeSessions: response.data.sessions || [],
          sharedContext: response.data.context || {}
        }
      }))
      
      toast.success('Collaboration features enabled!', { icon: '👥' })
      
      return { success: true, collaboration: response.data }
    } catch (error) {
      console.error('Collaboration setup error:', error)
      return { success: false, error: error.response?.data?.detail }
    }
  },

  createWorkflowAutomation: async (projectId, workflow) => {
    try {
      const response = await axios.post('/api/enhanced/workflows', {
        project_id: projectId,
        workflow: {
          name: workflow.name,
          triggers: workflow.triggers,
          actions: workflow.actions,
          conditions: workflow.conditions || []
        }
      })
      
      set(state => ({
        workflowAutomation: {
          ...state.workflowAutomation,
          activeWorkflows: [...state.workflowAutomation.activeWorkflows, response.data.workflow]
        }
      }))
      
      toast.success(`Workflow "${workflow.name}" created!`, { icon: '⚙️' })
      
      return { success: true, workflow: response.data.workflow }
    } catch (error) {
      console.error('Workflow creation error:', error)
      return { success: false, error: error.response?.data?.detail }
    }
  },

  toggleEnhancedFeature: async (featureName, enabled) => {
    try {
      set(state => ({
        enhancedFeatures: {
          ...state.enhancedFeatures,
          [featureName]: enabled
        }
      }))
      
      // Persist to backend
      await axios.post('/api/enhanced/features', {
        feature: featureName,
        enabled,
        timestamp: new Date().toISOString()
      })
      
      const featureNames = {
        contextAwareness: 'Context Awareness',
        smartSuggestions: 'Smart Suggestions',
        flowStateTracking: 'Flow State Tracking',
        voiceCommands: 'Voice Commands',
        visualProgramming: 'Visual Programming',
        architecturalIntelligence: 'Architectural Intelligence'
      }
      
      toast.success(`${featureNames[featureName]} ${enabled ? 'enabled' : 'disabled'}!`)
      
      return { success: true }
    } catch (error) {
      console.error('Feature toggle error:', error)
      return { success: false, error: error.response?.data?.detail }
    }
  },

  getEnhancedProjectData: (projectId) => {
    const state = get()
    
    return {
      enhancedFeatures: state.enhancedFeatures,
      developmentPatterns: state.developmentPatterns.filter(p => p.project_id === projectId),
      contextData: state.contextAwareness,
      insights: state.smartInsights,
      collaboration: state.collaborationData,
      workflows: state.workflowAutomation.activeWorkflows.filter(w => w.project_id === projectId)
    }
  },

  // Performance optimization
  optimizeProjectPerformance: async (projectId, optimizations = []) => {
    try {
      const response = await axios.post(`/api/enhanced/optimize/${projectId}`, {
        optimizations,
        auto_apply: true
      })
      
      set(state => ({
        smartInsights: {
          ...state.smartInsights,
          performanceMetrics: response.data.metrics
        }
      }))
      
      if (response.data.improvements_applied > 0) {
        toast.success(`Applied ${response.data.improvements_applied} performance optimizations!`, { icon: '⚡' })
      }
      
      return { success: true, optimizations: response.data }
    } catch (error) {
      console.error('Performance optimization error:', error)
      return { success: false, error: error.response?.data?.detail }
    }
  },

  // Security analysis
  runSecurityAnalysis: async (projectId) => {
    try {
      const response = await axios.post(`/api/enhanced/security-analysis/${projectId}`)
      
      set(state => ({
        smartInsights: {
          ...state.smartInsights,
          securityAnalysis: response.data.analysis
        }
      }))
      
      const criticalIssues = response.data.analysis.issues?.filter(i => i.severity === 'critical').length || 0
      if (criticalIssues > 0) {
        toast.error(`Found ${criticalIssues} critical security issue${criticalIssues > 1 ? 's' : ''}`, { icon: '🔒' })
      } else {
        toast.success('No critical security issues found', { icon: '✅' })
      }
      
      return { success: true, analysis: response.data.analysis }
    } catch (error) {
      console.error('Security analysis error:', error)
      return { success: false, error: error.response?.data?.detail }
    }
  },

  // AI-powered code review
  requestAICodeReview: async (projectId, files = []) => {
    try {
      const response = await axios.post('/api/enhanced/ai-review', {
        project_id: projectId,
        files,
        review_types: ['code_quality', 'best_practices', 'security', 'performance']
      })
      
      const review = response.data.review
      
      // Show review summary
      toast.success(`AI review complete: ${review.suggestions?.length || 0} suggestions`, { 
        icon: '🤖',
        duration: 5000
      })
      
      return { success: true, review }
    } catch (error) {
      console.error('AI code review error:', error)
      return { success: false, error: error.response?.data?.detail }
    }
  },

  // Export project data
  exportProjectData: async (projectId, format = 'json') => {
    try {
      const enhancedData = get().getEnhancedProjectData(projectId)
      
      const exportData = {
        project_id: projectId,
        enhanced_features: enhancedData,
        export_timestamp: new Date().toISOString(),
        format
      }
      
      // Create downloadable file
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ai_tempo_enhanced_${projectId}_${Date.now()}.json`
      link.click()
      
      toast.success('Enhanced project data exported!', { icon: '📁' })
      
      return { success: true }
    } catch (error) {
      console.error('Export error:', error)
      return { success: false, error: 'Failed to export project data' }
    }
  },

  // Clear functions
  clearDevelopmentPatterns: () => {
    set({ developmentPatterns: [] })
  },
  
  clearContextData: () => {
    set(state => ({
      contextAwareness: {
        ...state.contextAwareness,
        sessionData: {},
        currentContext: null
      }
    }))
  },
  
  clearInsights: () => {
    set({
      smartInsights: {
        projectHealth: null,
        codeQuality: null,
        performanceMetrics: null,
        securityAnalysis: null
      }
    })
  },
  
  resetEnhancedFeatures: () => {
    set({
      enhancedFeatures: {
        contextAwareness: true,
        smartSuggestions: true,
        flowStateTracking: true,
        voiceCommands: false,
        visualProgramming: false,
        architecturalIntelligence: true
      }
    })
  }
}))

export { useEnhancedProjectStore }