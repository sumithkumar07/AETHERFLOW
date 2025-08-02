import { create } from 'zustand'
import axios from 'axios'
import toast from 'react-hot-toast'

// Advanced Features Store - Connects to all the backend services
const useAdvancedFeaturesStore = create((set, get) => ({
  // State for various advanced features
  analytics: {
    data: null,
    loading: false,
    error: null
  },
  
  voiceInterface: {
    isListening: false,
    isSupported: false,
    transcript: '',
    commands: [],
    error: null
  },
  
  workflowAutomation: {
    workflows: [],
    activeWorkflows: [],
    templates: [],
    loading: false,
    error: null
  },
  
  visualProgramming: {
    canvas: null,
    nodes: [],
    connections: [],
    isActive: false,
    error: null
  },
  
  experimentalSandbox: {
    experiments: [],
    activeExperiment: null,
    results: [],
    loading: false,
    error: null
  },
  
  architecturalIntelligence: {
    suggestions: [],
    analysis: null,
    recommendations: [],
    loading: false,
    error: null
  },
  
  themeIntelligence: {
    adaptiveThemes: [],
    currentTheme: null,
    preferences: {},
    loading: false,
    error: null
  },
  
  performanceOptimization: {
    metrics: null,
    recommendations: [],
    optimizations: [],
    loading: false,
    error: null
  },

  // Analytics & Intelligence Actions
  fetchAnalytics: async (projectId) => {
    try {
      set(state => ({
        analytics: { ...state.analytics, loading: true, error: null }
      }))
      
      const response = await axios.get(`/api/analytics/dashboard/${projectId}`)
      
      set(state => ({
        analytics: {
          ...state.analytics,
          data: response.data,
          loading: false
        }
      }))
      
      return { success: true, data: response.data }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to fetch analytics'
      set(state => ({
        analytics: { ...state.analytics, error: errorMessage, loading: false }
      }))
      return { success: false, error: errorMessage }
    }
  },

  // Voice Interface Actions
  initializeVoiceInterface: async () => {
    try {
      const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
      
      if (!isSupported) {
        set(state => ({
          voiceInterface: {
            ...state.voiceInterface,
            isSupported: false,
            error: 'Speech recognition not supported in this browser'
          }
        }))
        return { success: false, error: 'Not supported' }
      }
      
      // Initialize voice commands
      const response = await axios.get('/api/voice/commands')
      
      set(state => ({
        voiceInterface: {
          ...state.voiceInterface,
          isSupported: true,
          commands: response.data.commands || []
        }
      }))
      
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to initialize voice interface'
      set(state => ({
        voiceInterface: { ...state.voiceInterface, error: errorMessage }
      }))
      return { success: false, error: errorMessage }
    }
  },
  
  startVoiceListening: () => {
    const isSupported = get().voiceInterface.isSupported
    if (!isSupported) {
      toast.error('Voice recognition not supported')
      return
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    
    recognition.onstart = () => {
      set(state => ({
        voiceInterface: { ...state.voiceInterface, isListening: true }
      }))
      toast.success('Voice recognition started', { icon: '🎤' })
    }
    
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('')
      
      set(state => ({
        voiceInterface: { ...state.voiceInterface, transcript }
      }))
    }
    
    recognition.onerror = (event) => {
      set(state => ({
        voiceInterface: {
          ...state.voiceInterface,
          isListening: false,
          error: event.error
        }
      }))
      toast.error(`Voice recognition error: ${event.error}`)
    }
    
    recognition.onend = () => {
      set(state => ({
        voiceInterface: { ...state.voiceInterface, isListening: false }
      }))
    }
    
    recognition.start()
    return recognition
  },
  
  stopVoiceListening: (recognition) => {
    if (recognition) {
      recognition.stop()
    }
    
    set(state => ({
      voiceInterface: { ...state.voiceInterface, isListening: false }
    }))
  },
  
  processVoiceCommand: async (command) => {
    try {
      const response = await axios.post('/api/voice/process', { command })
      
      toast.success(`Command processed: ${response.data.action}`, { icon: '✅' })
      
      return { success: true, action: response.data.action }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to process voice command'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  },

  // Workflow Automation Actions
  fetchWorkflows: async () => {
    try {
      set(state => ({
        workflowAutomation: { ...state.workflowAutomation, loading: true, error: null }
      }))
      
      const response = await axios.get('/api/workflows/')
      
      set(state => ({
        workflowAutomation: {
          ...state.workflowAutomation,
          workflows: response.data.workflows || [],
          loading: false
        }
      }))
      
      return { success: true, workflows: response.data.workflows }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to fetch workflows'
      set(state => ({
        workflowAutomation: { ...state.workflowAutomation, error: errorMessage, loading: false }
      }))
      return { success: false, error: errorMessage }
    }
  },
  
  createWorkflow: async (workflowData) => {
    try {
      const response = await axios.post('/api/workflows/', workflowData)
      
      set(state => ({
        workflowAutomation: {
          ...state.workflowAutomation,
          workflows: [response.data, ...state.workflowAutomation.workflows]
        }
      }))
      
      toast.success('Workflow created successfully!')
      
      return { success: true, workflow: response.data }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to create workflow'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  },
  
  executeWorkflow: async (workflowId, parameters = {}) => {
    try {
      const response = await axios.post(`/api/workflows/${workflowId}/execute`, parameters)
      
      set(state => ({
        workflowAutomation: {
          ...state.workflowAutomation,
          activeWorkflows: [...state.workflowAutomation.activeWorkflows, workflowId]
        }
      }))
      
      toast.success('Workflow execution started!')
      
      return { success: true, execution: response.data }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to execute workflow'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  },

  // Visual Programming Actions
  initializeVisualProgramming: async (projectId) => {
    try {
      const response = await axios.get(`/api/visual-programming/canvas/${projectId}`)
      
      set(state => ({
        visualProgramming: {
          ...state.visualProgramming,
          canvas: response.data.canvas,
          nodes: response.data.nodes || [],
          connections: response.data.connections || [],
          isActive: true
        }
      }))
      
      return { success: true, canvas: response.data.canvas }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to initialize visual programming'
      set(state => ({
        visualProgramming: { ...state.visualProgramming, error: errorMessage }
      }))
      return { success: false, error: errorMessage }
    }
  },
  
  addVisualNode: async (nodeData) => {
    try {
      const response = await axios.post('/api/visual-programming/nodes', nodeData)
      
      set(state => ({
        visualProgramming: {
          ...state.visualProgramming,
          nodes: [...state.visualProgramming.nodes, response.data]
        }
      }))
      
      return { success: true, node: response.data }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to add node'
      return { success: false, error: errorMessage }
    }
  },

  // Experimental Sandbox Actions
  fetchExperiments: async () => {
    try {
      set(state => ({
        experimentalSandbox: { ...state.experimentalSandbox, loading: true, error: null }
      }))
      
      const response = await axios.get('/api/experimental-sandbox/experiments')
      
      set(state => ({
        experimentalSandbox: {
          ...state.experimentalSandbox,
          experiments: response.data.experiments || [],
          loading: false
        }
      }))
      
      return { success: true, experiments: response.data.experiments }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to fetch experiments'
      set(state => ({
        experimentalSandbox: { ...state.experimentalSandbox, error: errorMessage, loading: false }
      }))
      return { success: false, error: errorMessage }
    }
  },
  
  runExperiment: async (experimentId, parameters) => {
    try {
      const response = await axios.post(`/api/experimental-sandbox/experiments/${experimentId}/run`, parameters)
      
      set(state => ({
        experimentalSandbox: {
          ...state.experimentalSandbox,
          activeExperiment: experimentId,
          results: [...state.experimentalSandbox.results, response.data]
        }
      }))
      
      toast.success('Experiment started successfully!')
      
      return { success: true, result: response.data }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to run experiment'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  },

  // Architectural Intelligence Actions
  analyzeArchitecture: async (projectId) => {
    try {
      set(state => ({
        architecturalIntelligence: { ...state.architecturalIntelligence, loading: true, error: null }
      }))
      
      const response = await axios.post(`/api/architectural-intelligence/analyze`, { project_id: projectId })
      
      set(state => ({
        architecturalIntelligence: {
          ...state.architecturalIntelligence,
          analysis: response.data.analysis,
          suggestions: response.data.suggestions || [],
          recommendations: response.data.recommendations || [],
          loading: false
        }
      }))
      
      return { success: true, analysis: response.data.analysis }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to analyze architecture'
      set(state => ({
        architecturalIntelligence: { ...state.architecturalIntelligence, error: errorMessage, loading: false }
      }))
      return { success: false, error: errorMessage }
    }
  },

  // Theme Intelligence Actions
  fetchAdaptiveThemes: async () => {
    try {
      set(state => ({
        themeIntelligence: { ...state.themeIntelligence, loading: true, error: null }
      }))
      
      const response = await axios.get('/api/theme-intelligence/adaptive-themes')
      
      set(state => ({
        themeIntelligence: {
          ...state.themeIntelligence,
          adaptiveThemes: response.data.themes || [],
          loading: false
        }
      }))
      
      return { success: true, themes: response.data.themes }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to fetch adaptive themes'
      set(state => ({
        themeIntelligence: { ...state.themeIntelligence, error: errorMessage, loading: false }
      }))
      return { success: false, error: errorMessage }
    }
  },
  
  applyAdaptiveTheme: async (themeId, preferences) => {
    try {
      const response = await axios.post(`/api/theme-intelligence/apply/${themeId}`, preferences)
      
      set(state => ({
        themeIntelligence: {
          ...state.themeIntelligence,
          currentTheme: response.data.theme,
          preferences: response.data.preferences
        }
      }))
      
      toast.success('Adaptive theme applied!')
      
      return { success: true, theme: response.data.theme }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to apply theme'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  },

  // Performance Optimization Actions
  analyzePerformance: async (projectId) => {
    try {
      set(state => ({
        performanceOptimization: { ...state.performanceOptimization, loading: true, error: null }
      }))
      
      const response = await axios.post(`/api/performance/analyze`, { project_id: projectId })
      
      set(state => ({
        performanceOptimization: {
          ...state.performanceOptimization,
          metrics: response.data.metrics,
          recommendations: response.data.recommendations || [],
          loading: false
        }
      }))
      
      return { success: true, metrics: response.data.metrics }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to analyze performance'
      set(state => ({
        performanceOptimization: { ...state.performanceOptimization, error: errorMessage, loading: false }
      }))
      return { success: false, error: errorMessage }
    }
  },
  
  applyOptimizations: async (projectId, optimizations) => {
    try {
      const response = await axios.post(`/api/performance/optimize/${projectId}`, { optimizations })
      
      set(state => ({
        performanceOptimization: {
          ...state.performanceOptimization,
          optimizations: [...state.performanceOptimization.optimizations, ...optimizations]
        }
      }))
      
      toast.success('Performance optimizations applied!')
      
      return { success: true, results: response.data }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to apply optimizations'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  },

  // Clear functions for all features
  clearAnalytics: () => {
    set(state => ({
      analytics: { ...state.analytics, data: null, error: null }
    }))
  },
  
  clearVoiceInterface: () => {
    set(state => ({
      voiceInterface: {
        ...state.voiceInterface,
        transcript: '',
        error: null,
        isListening: false
      }
    }))
  },
  
  clearWorkflows: () => {
    set(state => ({
      workflowAutomation: {
        ...state.workflowAutomation,
        activeWorkflows: [],
        error: null
      }
    }))
  },
  
  clearExperiments: () => {
    set(state => ({
      experimentalSandbox: {
        ...state.experimentalSandbox,
        activeExperiment: null,
        results: [],
        error: null
      }
    }))
  }
}))

export { useAdvancedFeaturesStore }