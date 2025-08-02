import { create } from 'zustand'
import axios from 'axios'
import toast from 'react-hot-toast'

/**
 * Advanced AI Store - Connects to all advanced AI backend services
 * Utilizes: /api/advanced-ai/* endpoints, agents orchestration, and intelligent routing
 */
const useAdvancedAIStore = create((set, get) => ({
  // State for Advanced AI Features
  availableModels: [],
  modelPerformance: {},
  selectedOptimalModel: null,
  smartChatHistory: [],
  batchProcessing: {
    active: false,
    queue: [],
    results: []
  },
  
  // Multi-Agent State
  activeAgents: [],
  agentOrchestration: {
    status: 'idle',
    activeAgents: 0,
    queueSize: 0
  },
  agentTeams: [],
  
  // AI Intelligence State
  architecturalInsights: null,
  smartDocumentation: [],
  themeIntelligence: {},
  codeQualityAnalysis: null,
  
  // Visual Programming State
  supportedDiagramTypes: [],
  diagramAnalysis: {},
  generatedCode: {},
  uploadedDiagrams: [],
  
  // Voice Interface State
  voiceCapabilities: {},
  conversationHistory: [],
  voiceEnabled: false,
  
  // Performance & Analytics
  aiUsageMetrics: {},
  predictiveInsights: {},
  realTimeAnalytics: {},
  
  loading: false,
  error: null,

  // Enhanced AI Chat with Intelligent Routing
  smartChat: async (message, context = {}) => {
    try {
      set({ loading: true, error: null })
      
      const response = await axios.post('/advanced-ai/smart-chat', {
        message,
        context: {
          ...context,
          user_preferences: get().getUserPreferences(),
          conversation_history: get().smartChatHistory.slice(-5)
        }
      })
      
      const aiResponse = {
        id: `smart_${Date.now()}`,
        message,
        response: response.data.response,
        modelUsed: response.data.model_used,
        processingTime: response.data.processing_time,
        cached: response.data.cached,
        timestamp: new Date().toISOString()
      }
      
      set(state => ({
        smartChatHistory: [...state.smartChatHistory, aiResponse],
        loading: false
      }))
      
      toast.success(`Response from ${response.data.model_used} (${response.data.processing_time}ms)`, {
        icon: '🧠'
      })
      
      return { success: true, response: aiResponse }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Smart chat failed'
      set({ error: errorMsg, loading: false })
      toast.error(errorMsg)
      return { success: false, error: errorMsg }
    }
  },

  // Intelligent Model Selection
  selectOptimalModel: async (task, context = {}) => {
    try {
      const response = await axios.post('/advanced-ai/select-optimal-model', {
        task,
        context
      })
      
      set({ selectedOptimalModel: response.data.selected_model })
      
      toast.success(`Optimal model selected: ${response.data.selected_model}`)
      return { success: true, model: response.data.selected_model }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Model selection failed'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  // Batch AI Processing
  batchProcess: async (requests) => {
    try {
      set(state => ({
        batchProcessing: { ...state.batchProcessing, active: true },
        loading: true
      }))
      
      const response = await axios.post('/advanced-ai/batch-process', {
        requests
      })
      
      set(state => ({
        batchProcessing: {
          active: false,
          queue: [],
          results: response.data.results
        },
        loading: false
      }))
      
      toast.success(`Batch processed ${response.data.total_processed} requests`)
      return { success: true, results: response.data.results }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Batch processing failed'
      set(state => ({
        batchProcessing: { ...state.batchProcessing, active: false },
        error: errorMsg,
        loading: false
      }))
      return { success: false, error: errorMsg }
    }
  },

  // Fetch Available AI Models
  fetchAvailableModels: async () => {
    try {
      const response = await axios.get('/advanced-ai/available-models')
      
      set({ 
        availableModels: response.data.models,
        loading: false 
      })
      
      return { success: true, models: response.data.models }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch models'
      set({ error: errorMsg, loading: false })
      return { success: false, error: errorMsg }
    }
  },

  // Get Model Performance Stats
  fetchModelPerformance: async () => {
    try {
      const response = await axios.get('/advanced-ai/model-performance')
      
      set({ modelPerformance: response.data.data })
      return { success: true, performance: response.data.data }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch performance data'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  // Multi-Agent Orchestration
  fetchActiveAgents: async () => {
    try {
      const response = await axios.get('/agents/')
      set({ activeAgents: response.data.agents })
      return { success: true, agents: response.data.agents }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch agents'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  fetchAgentOrchestrationStatus: async () => {
    try {
      const response = await axios.get('/agents/orchestration/status')
      set({ agentOrchestration: response.data })
      return { success: true, status: response.data }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch orchestration status'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  fetchAgentTeams: async () => {
    try {
      const response = await axios.get('/agents/teams')
      set({ agentTeams: response.data })
      return { success: true, teams: response.data }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch agent teams'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  // Architectural Intelligence
  getArchitecturalInsights: async (projectId) => {
    try {
      const response = await axios.get(`/architectural-intelligence/insights/${projectId}`)
      set({ architecturalInsights: response.data })
      return { success: true, insights: response.data }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to get architectural insights'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  // Smart Documentation
  generateSmartDocumentation: async (projectId) => {
    try {
      const response = await axios.get(`/smart-documentation/generate/${projectId}`)
      set(state => ({
        smartDocumentation: [...state.smartDocumentation, response.data]
      }))
      toast.success('Smart documentation generated!')
      return { success: true, documentation: response.data }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to generate documentation'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  // Theme Intelligence
  analyzeTheme: async (projectId) => {
    try {
      const response = await axios.post('/theme-intelligence/analyze', {
        project_id: projectId
      })
      set({ themeIntelligence: response.data })
      return { success: true, analysis: response.data }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Theme analysis failed'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  // Code Quality Analysis
  analyzeCodeQuality: async (projectId) => {
    try {
      const response = await axios.post('/code-quality/analyze', {
        project_id: projectId
      })
      set({ codeQualityAnalysis: response.data })
      toast.success('Code quality analysis completed!')
      return { success: true, analysis: response.data }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Code quality analysis failed'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  // Visual Programming
  fetchSupportedDiagramTypes: async () => {
    try {
      const response = await axios.get('/visual-programming/supported-diagram-types')
      set({ supportedDiagramTypes: response.data.supported_types })
      return { success: true, types: response.data.supported_types }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch diagram types'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  analyzeDiagram: async (diagramData, diagramType = null) => {
    try {
      set({ loading: true })
      
      const response = await axios.post('/visual-programming/analyze-diagram', {
        diagram_data: diagramData,
        diagram_type: diagramType
      })
      
      const analysisId = `analysis_${Date.now()}`
      set(state => ({
        diagramAnalysis: {
          ...state.diagramAnalysis,
          [analysisId]: response.data
        },
        loading: false
      }))
      
      toast.success('Diagram analysis completed!')
      return { success: true, analysis: response.data, id: analysisId }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Diagram analysis failed'
      set({ error: errorMsg, loading: false })
      return { success: false, error: errorMsg }
    }
  },

  generateCodeFromFlowchart: async (flowchartData, language = 'python') => {
    try {
      set({ loading: true })
      
      const response = await axios.post('/visual-programming/generate-code-from-flowchart', {
        flowchart_data: flowchartData,
        target_language: language
      })
      
      const codeId = `code_${Date.now()}`
      set(state => ({
        generatedCode: {
          ...state.generatedCode,
          [codeId]: {
            language,
            code: response.data.code,
            metadata: response.data.metadata
          }
        },
        loading: false
      }))
      
      toast.success(`Code generated in ${language}!`)
      return { success: true, code: response.data, id: codeId }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Code generation failed'
      set({ error: errorMsg, loading: false })
      return { success: false, error: errorMsg }
    }
  },

  generateUIFromWireframe: async (wireframeData, framework = 'react') => {
    try {
      set({ loading: true })
      
      const response = await axios.post('/visual-programming/generate-ui-from-wireframe', {
        wireframe_data: wireframeData,
        framework
      })
      
      const uiId = `ui_${Date.now()}`
      set(state => ({
        generatedCode: {
          ...state.generatedCode,
          [uiId]: {
            type: 'ui_component',
            framework,
            code: response.data.code,
            styles: response.data.styles,
            metadata: response.data.metadata
          }
        },
        loading: false
      }))
      
      toast.success(`UI component generated for ${framework}!`)
      return { success: true, ui: response.data, id: uiId }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'UI generation failed'
      set({ error: errorMsg, loading: false })
      return { success: false, error: errorMsg }
    }
  },

  uploadDiagram: async (file, diagramType = null) => {
    try {
      set({ loading: true })
      
      const formData = new FormData()
      formData.append('file', file)
      if (diagramType) {
        formData.append('diagram_type', diagramType)
      }
      
      const response = await axios.post('/visual-programming/upload-diagram', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      const uploadId = `upload_${Date.now()}`
      set(state => ({
        uploadedDiagrams: [...state.uploadedDiagrams, {
          id: uploadId,
          filename: response.data.filename,
          analysis: response.data.analysis
        }],
        loading: false
      }))
      
      toast.success(`Diagram uploaded and analyzed: ${response.data.filename}`)
      return { success: true, result: response.data, id: uploadId }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Diagram upload failed'
      set({ error: errorMsg, loading: false })
      return { success: false, error: errorMsg }
    }
  },

  // Voice Interface
  fetchVoiceCapabilities: async () => {
    try {
      const response = await axios.get('/voice/voice-capabilities')
      set({ voiceCapabilities: response.data.capabilities })
      return { success: true, capabilities: response.data.capabilities }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch voice capabilities'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  processVoiceCommand: async (textInput) => {
    try {
      set({ loading: true })
      
      const response = await axios.post('/voice/process-voice', null, {
        params: { text_input: textInput }
      })
      
      const voiceResult = {
        id: `voice_${Date.now()}`,
        input: textInput,
        result: response.data.result,
        timestamp: new Date().toISOString()
      }
      
      set(state => ({
        conversationHistory: [...state.conversationHistory, voiceResult],
        loading: false
      }))
      
      toast.success('Voice command processed!')
      return { success: true, result: response.data.result }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Voice command failed'
      set({ error: errorMsg, loading: false })
      return { success: false, error: errorMsg }
    }
  },

  toggleVoice: async (enabled) => {
    try {
      const response = await axios.post('/voice/toggle-voice', null, {
        params: { enabled }
      })
      
      set({ voiceEnabled: enabled })
      toast.success(`Voice ${enabled ? 'enabled' : 'disabled'}`)
      return { success: true }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to toggle voice'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  // Real-time Analytics Integration
  fetchRealTimeAnalytics: async () => {
    try {
      const response = await axios.get('/analytics/dashboard')
      set({ realTimeAnalytics: response.data.dashboard })
      return { success: true, analytics: response.data.dashboard }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch analytics'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  trackAIUsage: async (eventType, data) => {
    try {
      await axios.post('/analytics/track', {
        event_type: eventType,
        data,
        context: {
          feature: 'advanced_ai',
          timestamp: new Date().toISOString()
        }
      })
      
      return { success: true }
    } catch (error) {
      console.error('Analytics tracking failed:', error)
      return { success: false }
    }
  },

  // Utility Functions
  getUserPreferences: () => {
    const state = get()
    return {
      preferred_models: state.availableModels.slice(0, 3).map(m => m.name),
      active_agents: state.activeAgents.map(a => a.id),
      voice_enabled: state.voiceEnabled
    }
  },

  clearError: () => set({ error: null }),
  
  clearHistory: () => set({ 
    smartChatHistory: [], 
    conversationHistory: [] 
  }),

  // Initialize Advanced AI Services
  initialize: async () => {
    try {
      set({ loading: true })
      
      // Fetch all initial data in parallel
      await Promise.all([
        get().fetchAvailableModels(),
        get().fetchModelPerformance(),
        get().fetchActiveAgents(),
        get().fetchAgentOrchestrationStatus(),
        get().fetchAgentTeams(),
        get().fetchSupportedDiagramTypes(),
        get().fetchVoiceCapabilities(),
        get().fetchRealTimeAnalytics()
      ])
      
      set({ loading: false })
      toast.success('Advanced AI services initialized!')
      return { success: true }
    } catch (error) {
      set({ error: 'Failed to initialize advanced AI services', loading: false })
      return { success: false }
    }
  }
}))

export { useAdvancedAIStore }