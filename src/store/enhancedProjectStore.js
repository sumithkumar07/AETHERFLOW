import { create } from 'zustand'
import axios from 'axios'
import toast from 'react-hot-toast'

// Enhanced project store with smart features
const useEnhancedProjectStore = create((set, get) => ({
  // Extended state from original projectStore
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
  
  // Enhanced features
  projectInsights: {},
  developmentPatterns: {},
  smartSuggestions: [],
  projectHealth: {},
  contextAwareness: {
    currentFocus: null,
    recentActions: [],
    timeSpent: {}
  },
  
  // Smart project analysis
  analyzeProjectHealth: async (projectId) => {
    try {
      const project = get().projects.find(p => p.id === projectId)
      if (!project) return
      
      const health = {
        score: 85,
        issues: [],
        suggestions: [],
        metrics: {
          codeQuality: 90,
          testCoverage: 75,
          performance: 80,
          security: 85,
          maintainability: 88
        }
      }
      
      // Analyze based on tech stack
      if (project.tech_stack?.includes('React')) {
        health.suggestions.push({
          type: 'performance',
          title: 'React Optimization',
          description: 'Consider implementing React.memo for frequently re-rendering components',
          priority: 'medium',
          impact: 'performance'
        })
      }
      
      if (project.tech_stack?.includes('FastAPI')) {
        health.suggestions.push({
          type: 'security',
          title: 'API Security',
          description: 'Implement rate limiting and input validation',
          priority: 'high',
          impact: 'security'
        })
      }
      
      // Check project age and activity
      const lastActivity = new Date(project.updated_at)
      const daysSinceUpdate = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysSinceUpdate > 7) {
        health.issues.push({
          type: 'stale',
          message: 'Project hasn\'t been updated in over a week',
          severity: 'medium'
        })
      }
      
      set(state => ({
        projectHealth: {
          ...state.projectHealth,
          [projectId]: health
        }
      }))
      
      return health
    } catch (error) {
      console.error('Failed to analyze project health:', error)
    }
  },
  
  // Track development patterns
  trackDevelopmentPattern: (projectId, action, context = {}) => {
    const timestamp = Date.now()
    
    set(state => {
      const patterns = state.developmentPatterns[projectId] || {
        sessions: [],
        commonActions: {},
        timePatterns: {},
        flowStates: []
      }
      
      // Track common actions
      patterns.commonActions[action] = (patterns.commonActions[action] || 0) + 1
      
      // Track time patterns
      const hour = new Date().getHours()
      patterns.timePatterns[hour] = (patterns.timePatterns[hour] || 0) + 1
      
      // Track flow states
      if (context.flowState) {
        patterns.flowStates.push({
          state: context.flowState,
          timestamp,
          duration: context.duration || 0
        })
      }
      
      return {
        developmentPatterns: {
          ...state.developmentPatterns,
          [projectId]: patterns
        },
        contextAwareness: {
          ...state.contextAwareness,
          recentActions: [
            { action, timestamp, context },
            ...state.contextAwareness.recentActions.slice(0, 49) // Keep last 50 actions
          ]
        }
      }
    })
  },
  
  // Generate contextual insights
  generateProjectInsights: async (projectId) => {
    try {
      const project = get().projects.find(p => p.id === projectId)
      const patterns = get().developmentPatterns[projectId]
      const health = get().projectHealth[projectId]
      
      if (!project) return
      
      const insights = {
        productivity: {
          score: 85,
          trend: 'improving',
          insights: []
        },
        recommendations: [],
        nextSteps: [],
        timeOptimization: {}
      }
      
      // Productivity insights
      if (patterns?.timePatterns) {
        const mostActiveHour = Object.entries(patterns.timePatterns)
          .sort(([,a], [,b]) => b - a)[0]
        
        if (mostActiveHour) {
          insights.productivity.insights.push(
            `You're most productive at ${mostActiveHour[0]}:00`
          )
        }
      }
      
      // Common action insights
      if (patterns?.commonActions) {
        const topAction = Object.entries(patterns.commonActions)
          .sort(([,a], [,b]) => b - a)[0]
        
        if (topAction) {
          insights.productivity.insights.push(
            `Your most common action is "${topAction[0]}"`
          )
        }
      }
      
      // Recommendations based on project state
      if (project.progress < 30) {
        insights.recommendations.push({
          type: 'planning',
          title: 'Define Core Features',
          description: 'Focus on implementing essential features first',
          priority: 'high'
        })
      } else if (project.progress > 70) {
        insights.recommendations.push({
          type: 'quality',
          title: 'Prepare for Production',
          description: 'Add comprehensive testing and error handling',
          priority: 'high'
        })
      }
      
      // Next steps based on tech stack
      if (project.tech_stack?.includes('React') && project.progress < 50) {
        insights.nextSteps.push('Set up component architecture')
        insights.nextSteps.push('Implement routing and navigation')
      }
      
      set(state => ({
        projectInsights: {
          ...state.projectInsights,
          [projectId]: insights
        }
      }))
      
      return insights
    } catch (error) {
      console.error('Failed to generate insights:', error)
    }
  },
  
  // Smart suggestions based on context
  generateSmartSuggestions: async (projectId, context = {}) => {
    try {
      const project = get().projects.find(p => p.id === projectId)
      const patterns = get().developmentPatterns[projectId]
      const recentActions = get().contextAwareness.recentActions.slice(0, 5)
      
      const suggestions = []
      
      // Based on recent actions
      const hasErrors = recentActions.some(action => 
        action.action.includes('error') || action.action.includes('bug')
      )
      
      if (hasErrors) {
        suggestions.push({
          id: 'debug_session',
          type: 'debugging',
          title: 'Debug Session',
          description: 'Start a focused debugging session',
          action: 'Let me help you systematically debug these issues',
          confidence: 0.9
        })
      }
      
      // Based on project progress
      if (project?.progress > 80 && project.status === 'active') {
        suggestions.push({
          id: 'deployment_prep',
          type: 'deployment',
          title: 'Deployment Preparation',
          description: 'Your project is nearly complete',
          action: 'Help me prepare this project for deployment',
          confidence: 0.85
        })
      }
      
      // Based on time patterns
      if (patterns?.timePatterns) {
        const currentHour = new Date().getHours()
        const activityAtThisHour = patterns.timePatterns[currentHour] || 0
        
        if (activityAtThisHour < 2) {
          suggestions.push({
            id: 'peak_time_suggestion',
            type: 'productivity',
            title: 'Peak Productivity Time',
            description: 'This isn\'t your usual productive hour',
            action: 'Should we focus on lighter tasks or take a break?',
            confidence: 0.7
          })
        }
      }
      
      // Based on tech stack gaps
      if (project?.tech_stack && !project.tech_stack.includes('test')) {
        suggestions.push({
          id: 'add_testing',
          type: 'quality',
          title: 'Add Testing Framework',
          description: 'Improve code reliability with tests',
          action: 'Help me set up testing for this project',
          confidence: 0.8
        })
      }
      
      set({ smartSuggestions: suggestions })
      return suggestions
      
    } catch (error) {
      console.error('Failed to generate smart suggestions:', error)
      return []
    }
  },
  
  // Update context awareness
  updateContextAwareness: (focus, metadata = {}) => {
    set(state => ({
      contextAwareness: {
        ...state.contextAwareness,
        currentFocus: focus,
        timeSpent: {
          ...state.contextAwareness.timeSpent,
          [focus]: (state.contextAwareness.timeSpent[focus] || 0) + 1
        }
      }
    }))
  },
  
  // Predictive features
  predictNextAction: (projectId) => {
    const patterns = get().developmentPatterns[projectId]
    const recentActions = get().contextAwareness.recentActions.slice(0, 3)
    
    if (!patterns || !recentActions.length) return null
    
    // Simple prediction based on common patterns
    const actionSequences = {}
    
    // This would be more sophisticated in a real implementation
    const lastAction = recentActions[0]?.action
    const commonActions = patterns.commonActions || {}
    
    // Find most likely next action
    const possibleNext = Object.entries(commonActions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([action]) => action)
    
    return {
      suggestions: possibleNext,
      confidence: 0.7,
      reasoning: `Based on your common development patterns`
    }
  },
  
  // Get enhanced project data
  getEnhancedProjectData: (projectId) => {
    const state = get()
    const project = state.projects.find(p => p.id === projectId)
    
    if (!project) return null
    
    return {
      ...project,
      insights: state.projectInsights[projectId],
      health: state.projectHealth[projectId],
      patterns: state.developmentPatterns[projectId],
      suggestions: state.smartSuggestions,
      contextAwareness: state.contextAwareness
    }
  },
  
  // Initialize enhanced features for a project
  initializeEnhancedFeatures: async (projectId) => {
    await Promise.all([
      get().analyzeProjectHealth(projectId),
      get().generateProjectInsights(projectId),
      get().generateSmartSuggestions(projectId)
    ])
  },
  
  // Clean up old data
  cleanupOldData: () => {
    set(state => ({
      contextAwareness: {
        ...state.contextAwareness,
        recentActions: state.contextAwareness.recentActions.slice(0, 100)
      }
    }))
  }
}))

export { useEnhancedProjectStore }