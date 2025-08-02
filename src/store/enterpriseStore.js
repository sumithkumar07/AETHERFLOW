import { create } from 'zustand'
import axios from 'axios'
import toast from 'react-hot-toast'

/**
 * Enterprise Store - Connects to all enterprise backend services
 * Utilizes: /api/enterprise/*, /api/analytics/*, /api/security/*, /api/performance/*
 */
const useEnterpriseStore = create((set, get) => ({
  // Enterprise Features State
  enterpriseFeatures: [],
  enterpriseIntegrations: [],
  complianceDashboard: {},
  automationDashboard: {},
  
  // Analytics & Performance State
  realTimeMetrics: {},
  performanceHistory: [],
  predictiveScaling: {},
  activeAlerts: [],
  featureUsage: {},
  userMetrics: {},
  
  // Security & Compliance State
  securityScore: {},
  auditLog: [],
  complianceStatus: {},
  threatAlerts: [],
  dataClassification: {},
  
  // Collaboration State
  activeSessions: [],
  collaborationHistory: [],
  
  // Workflow Automation State
  workflows: [],
  workflowMetrics: {},
  
  loading: false,
  error: null,

  // Enterprise Features
  fetchEnterpriseFeatures: async () => {
    try {
      set({ loading: true, error: null })
      const response = await axios.get('/enterprise/features')
      
      set({ 
        enterpriseFeatures: response.data.features,
        loading: false 
      })
      
      return { success: true, features: response.data.features }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch enterprise features'
      set({ error: errorMsg, loading: false })
      return { success: false, error: errorMsg }
    }
  },

  fetchEnterpriseIntegrations: async () => {
    try {
      const response = await axios.get('/enterprise/integrations')
      
      set({ enterpriseIntegrations: response.data.integrations })
      return { success: true, integrations: response.data.integrations }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch enterprise integrations'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  fetchComplianceDashboard: async () => {
    try {
      const response = await axios.get('/enterprise/compliance/dashboard')
      
      set({ complianceDashboard: response.data })
      return { success: true, dashboard: response.data }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch compliance dashboard'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  fetchAutomationDashboard: async () => {
    try {
      const response = await axios.get('/enterprise/automation/dashboard')
      
      set({ automationDashboard: response.data })
      return { success: true, dashboard: response.data }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch automation dashboard'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  // Analytics & Performance
  fetchRealTimeMetrics: async () => {
    try {
      const response = await axios.get('/performance/metrics')
      
      set({ realTimeMetrics: response.data })
      return { success: true, metrics: response.data }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch real-time metrics'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  fetchPerformanceHistory: async (hours = 24) => {
    try {
      const response = await axios.get(`/performance/history?hours=${hours}`)
      
      set({ performanceHistory: response.data.data })
      return { success: true, history: response.data.data }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch performance history'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  fetchPredictiveScaling: async () => {
    try {
      const response = await axios.get('/performance/scaling')
      
      set({ predictiveScaling: response.data })
      return { success: true, scaling: response.data }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch predictive scaling'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  triggerScalingAction: async (actionData) => {
    try {
      set({ loading: true })
      
      const response = await axios.post('/performance/scaling/trigger', actionData)
      
      set({ loading: false })
      toast.success('Scaling action triggered successfully!')
      return { success: true, result: response.data }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to trigger scaling action'
      set({ error: errorMsg, loading: false })
      toast.error(errorMsg)
      return { success: false, error: errorMsg }
    }
  },

  fetchActiveAlerts: async () => {
    try {
      const response = await axios.get('/performance/alerts')
      
      set({ activeAlerts: response.data.alerts })
      return { success: true, alerts: response.data.alerts }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch active alerts'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  updateAlertThresholds: async (thresholds) => {
    try {
      const response = await axios.put('/performance/alerts/thresholds', thresholds)
      
      toast.success('Alert thresholds updated!')
      return { success: true, thresholds: response.data.thresholds }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to update alert thresholds'
      set({ error: errorMsg })
      toast.error(errorMsg)
      return { success: false, error: errorMsg }
    }
  },

  fetchAnalyticsDashboard: async () => {
    try {
      const response = await axios.get('/analytics/dashboard')
      
      set({ realTimeMetrics: response.data.dashboard })
      return { success: true, dashboard: response.data.dashboard }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch analytics dashboard'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  trackEvent: async (eventType, data, context = {}) => {
    try {
      await axios.post('/analytics/track', {
        event_type: eventType,
        data,
        context
      })
      
      return { success: true }
    } catch (error) {
      console.error('Event tracking failed:', error)
      return { success: false }
    }
  },

  fetchUserJourney: async () => {
    try {
      const response = await axios.get('/analytics/user-journey')
      
      return { success: true, journey: response.data.journey }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch user journey'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  fetchUserProfile: async () => {
    try {
      const response = await axios.get('/analytics/user-profile')
      
      return { success: true, profile: response.data.profile }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch user profile'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  predictChurn: async () => {
    try {
      const response = await axios.get('/analytics/churn-prediction')
      
      return { success: true, prediction: response.data }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to predict churn'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  getPersonalizedRecommendations: async () => {
    try {
      const response = await axios.get('/analytics/recommendations')
      
      return { success: true, recommendations: response.data.recommendations }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to get recommendations'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  fetchUserMetrics: async (timeRange = '7d') => {
    try {
      const response = await axios.get(`/analytics/metrics?time_range=${timeRange}`)
      
      set({ userMetrics: response.data.metrics })
      return { success: true, metrics: response.data.metrics }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch user metrics'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  fetchFeatureUsage: async (timeRange = '7d') => {
    try {
      const response = await axios.get(`/analytics/feature-usage?time_range=${timeRange}`)
      
      set({ featureUsage: response.data.feature_usage })
      return { success: true, usage: response.data.feature_usage }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch feature usage'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  // Security & Compliance
  validateAccessRequest: async (resource, action, metadata = {}) => {
    try {
      const response = await axios.post('/security/validate-access', {
        resource,
        action,
        metadata
      })
      
      return { success: true, validation: response.data.validation_result }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Access validation failed'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  fetchSecurityScore: async () => {
    try {
      const response = await axios.get('/security/security-score')
      
      set({ securityScore: response.data.security_score })
      return { success: true, score: response.data.security_score }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch security score'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  fetchAuditLog: async (limit = 50) => {
    try {
      const response = await axios.get(`/security/audit-log?limit=${limit}`)
      
      set({ auditLog: response.data.audit_log })
      return { success: true, log: response.data.audit_log }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch audit log'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  classifyData: async (data, context = {}) => {
    try {
      const response = await axios.post('/security/classify-data', {
        data,
        context
      })
      
      return { success: true, classification: response.data.classification }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Data classification failed'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  handleDataSubjectRequest: async (requestType, details = {}) => {
    try {
      const response = await axios.post('/security/data-subject-request', {
        type: requestType,
        details
      })
      
      toast.success(`Data subject request (${requestType}) processed successfully`)
      return { success: true, result: response.data.result }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Data subject request failed'
      set({ error: errorMsg })
      toast.error(errorMsg)
      return { success: false, error: errorMsg }
    }
  },

  fetchComplianceStatus: async () => {
    try {
      const response = await axios.get('/security/compliance-status')
      
      set({ complianceStatus: response.data.compliance_status })
      return { success: true, status: response.data.compliance_status }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch compliance status'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  fetchThreatAlerts: async () => {
    try {
      const response = await axios.get('/security/threat-alerts')
      
      set({ threatAlerts: response.data.alerts })
      return { success: true, alerts: response.data.alerts }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch threat alerts'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  resolveThreatAlert: async (alertId, resolutionNotes) => {
    try {
      const response = await axios.post(`/security/alerts/${alertId}/resolve`, {
        notes: resolutionNotes
      })
      
      // Update local state
      set(state => ({
        threatAlerts: state.threatAlerts.map(alert =>
          alert.id === alertId 
            ? { ...alert, resolved: true, resolution_notes: resolutionNotes }
            : alert
        )
      }))
      
      toast.success('Threat alert resolved successfully')
      return { success: true, result: response.data }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to resolve threat alert'
      set({ error: errorMsg })
      toast.error(errorMsg)
      return { success: false, error: errorMsg }
    }
  },

  // Collaboration
  fetchActiveSessions: async () => {
    try {
      const response = await axios.get('/collaboration/sessions/active')
      
      set({ activeSessions: response.data.active_sessions })
      return { success: true, sessions: response.data.active_sessions }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch active sessions'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  fetchCollaborationHistory: async () => {
    try {
      const response = await axios.get('/collaboration/history')
      
      set({ collaborationHistory: response.data.history })
      return { success: true, history: response.data.history }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch collaboration history'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  getDocumentCollaborators: async (documentId) => {
    try {
      const response = await axios.get(`/collaboration/documents/${documentId}/collaborators`)
      
      return { success: true, collaborators: response.data.collaborators }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch collaborators'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  updatePresence: async (documentId, presenceData) => {
    try {
      const response = await axios.post(`/collaboration/documents/${documentId}/presence`, presenceData)
      
      return { success: true, presence: response.data.presence }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to update presence'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  createDocumentSnapshot: async (documentId, description) => {
    try {
      const response = await axios.post(`/collaboration/documents/${documentId}/snapshots`, {
        description
      })
      
      toast.success('Document snapshot created successfully')
      return { success: true, snapshot: response.data.snapshot }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to create snapshot'
      set({ error: errorMsg })
      toast.error(errorMsg)
      return { success: false, error: errorMsg }
    }
  },

  // Workflow Management
  fetchWorkflows: async () => {
    try {
      const response = await axios.get('/workflows')
      
      set({ workflows: response.data.workflows })
      return { success: true, workflows: response.data.workflows }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch workflows'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  fetchWorkflowMetrics: async () => {
    try {
      const response = await axios.get('/workflows/automation/dashboard')
      
      set({ workflowMetrics: response.data })
      return { success: true, metrics: response.data }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch workflow metrics'
      set({ error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  // Utility Functions
  clearError: () => set({ error: null }),

  refreshAllData: async () => {
    try {
      set({ loading: true })
      
      await Promise.all([
        get().fetchEnterpriseFeatures(),
        get().fetchRealTimeMetrics(),
        get().fetchSecurityScore(),
        get().fetchActiveSessions(),
        get().fetchActiveAlerts()
      ])
      
      set({ loading: false })
      toast.success('Enterprise data refreshed!')
      return { success: true }
    } catch (error) {
      set({ error: 'Failed to refresh enterprise data', loading: false })
      return { success: false }
    }
  },

  // Initialize Enterprise Services
  initialize: async () => {
    try {
      set({ loading: true })
      
      // Fetch all initial enterprise data in parallel
      await Promise.all([
        get().fetchEnterpriseFeatures(),
        get().fetchEnterpriseIntegrations(),
        get().fetchComplianceDashboard(),
        get().fetchAutomationDashboard(),
        get().fetchRealTimeMetrics(),
        get().fetchAnalyticsDashboard(),
        get().fetchSecurityScore(),
        get().fetchComplianceStatus(),
        get().fetchActiveSessions(),
        get().fetchWorkflows()
      ])
      
      set({ loading: false })
      toast.success('Enterprise services initialized!')
      return { success: true }
    } catch (error) {
      set({ error: 'Failed to initialize enterprise services', loading: false })
      return { success: false }
    }
  }
}))

export { useEnterpriseStore }