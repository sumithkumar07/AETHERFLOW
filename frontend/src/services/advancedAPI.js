import api from './api'

// Advanced AI Router APIs
export const aiRouterAPI = {
  // Get available models
  getAvailableModels: () => api.get('/api/advanced-ai/available-models'),
  
  // Select optimal model for task
  selectOptimalModel: (task, context) => 
    api.post('/api/advanced-ai/select-optimal-model', { task, context }),
  
  // Smart chat with AI routing
  smartChat: (message, context) => 
    api.post('/api/advanced-ai/smart-chat', { message, context }),
  
  // Get model performance stats
  getModelPerformance: () => api.get('/api/advanced-ai/model-performance'),
  
  // Batch process requests
  batchProcess: (requests) => 
    api.post('/api/advanced-ai/batch-process', { requests })
}

// Analytics APIs
export const analyticsAPI = {
  // Get real-time dashboard
  getDashboard: () => api.get('/api/analytics/dashboard'),
  
  // Track event
  trackEvent: (eventType, data, context) => 
    api.post('/api/analytics/track', { event_type: eventType, data, context }),
  
  // Get user journey
  getUserJourney: () => api.get('/api/analytics/user-journey'),
  
  // Get user profile
  getUserProfile: () => api.get('/api/analytics/user-profile'),
  
  // Get churn prediction
  getChurnPrediction: () => api.get('/api/analytics/churn-prediction'),
  
  // Get personalized recommendations
  getRecommendations: () => api.get('/api/analytics/recommendations'),
  
  // Get A/B test variant
  getABTestVariant: (experimentName) => 
    api.get(`/api/analytics/ab-test/${experimentName}`),
  
  // Get user metrics
  getUserMetrics: (timeRange = '7d') => 
    api.get(`/api/analytics/metrics?time_range=${timeRange}`),
  
  // Get feature usage analytics
  getFeatureUsage: (timeRange = '7d') => 
    api.get(`/api/analytics/feature-usage?time_range=${timeRange}`)
}

// Plugin System APIs
export const pluginAPI = {
  // Get installed plugins
  getInstalledPlugins: () => api.get('/api/plugins/'),
  
  // Install plugin
  installPlugin: (pluginData) => api.post('/api/plugins/install', pluginData),
  
  // Uninstall plugin
  uninstallPlugin: (pluginName) => api.delete(`/api/plugins/${pluginName}`),
  
  // Get plugin UI for location
  getPluginUI: (location) => api.get(`/api/plugins/ui/${location}`),
  
  // Get plugin marketplace
  getMarketplace: () => api.get('/api/plugins/marketplace'),
  
  // Create workflow
  createWorkflow: (workflowData) => 
    api.post('/api/plugins/workflows/create', workflowData),
  
  // Execute workflow
  executeWorkflow: (workflowName, data) => 
    api.post(`/api/plugins/workflows/${workflowName}/execute`, { data })
}

// Security APIs
export const securityAPI = {
  // Get security dashboard
  getDashboard: () => api.get('/api/security/dashboard'),
  
  // Get threat assessment
  getThreatAssessment: () => api.get('/api/security/threats'),
  
  // Get audit logs
  getAuditLogs: (page = 1, limit = 50) => 
    api.get(`/api/security/audit-logs?page=${page}&limit=${limit}`),
  
  // Get compliance status
  getComplianceStatus: () => api.get('/api/security/compliance'),
  
  // Get zero trust status
  getZeroTrustStatus: () => api.get('/api/security/zero-trust'),
  
  // Report security incident
  reportIncident: (incidentData) => 
    api.post('/api/security/incidents', incidentData)
}

// Development Assistant APIs
export const developmentAPI = {
  // Analyze code
  analyzeCode: (codeData) => api.post('/api/development/analyze', codeData),
  
  // Get code suggestions
  getSuggestions: (context) => api.post('/api/development/suggestions', context),
  
  // Generate tests
  generateTests: (codeData) => api.post('/api/development/generate-tests', codeData),
  
  // Generate documentation
  generateDocs: (codeData) => api.post('/api/development/generate-docs', codeData),
  
  // Performance analysis
  analyzePerformance: (codeData) => api.post('/api/development/performance', codeData),
  
  // Bug detection
  detectBugs: (codeData) => api.post('/api/development/detect-bugs', codeData)
}

// Collaboration APIs
export const collaborationAPI = {
  // Get project collaborators
  getCollaborators: (projectId) => 
    api.get(`/api/collaboration/projects/${projectId}/collaborators`),
  
  // Join collaboration session
  joinSession: (projectId, userData) => 
    api.post(`/api/collaboration/projects/${projectId}/join`, userData),
  
  // Leave collaboration session
  leaveSession: (projectId) => 
    api.post(`/api/collaboration/projects/${projectId}/leave`),
  
  // Send document update
  sendDocumentUpdate: (projectId, documentId, changes) => 
    api.post(`/api/collaboration/projects/${projectId}/documents/${documentId}/update`, changes),
  
  // Get document history
  getDocumentHistory: (projectId, documentId) => 
    api.get(`/api/collaboration/projects/${projectId}/documents/${documentId}/history`),
  
  // Send chat message
  sendChatMessage: (projectId, message) => 
    api.post(`/api/collaboration/projects/${projectId}/chat`, message),
  
  // Get chat history
  getChatHistory: (projectId) => 
    api.get(`/api/collaboration/projects/${projectId}/chat`)
}

// Voice Interface APIs
export const voiceAPI = {
  // Process voice command
  processVoiceCommand: (audioData) => 
    api.post('/api/voice/process', { audio: audioData }),
  
  // Get voice settings
  getVoiceSettings: () => api.get('/api/voice/settings'),
  
  // Update voice settings
  updateVoiceSettings: (settings) => 
    api.put('/api/voice/settings', settings),
  
  // Get supported languages
  getSupportedLanguages: () => api.get('/api/voice/languages')
}

// Workflow Automation APIs
export const workflowAPI = {
  // Get all workflows
  getWorkflows: () => api.get('/api/workflows/'),
  
  // Create workflow
  createWorkflow: (workflowData) => 
    api.post('/api/workflows/', workflowData),
  
  // Update workflow
  updateWorkflow: (workflowId, workflowData) => 
    api.put(`/api/workflows/${workflowId}`, workflowData),
  
  // Delete workflow
  deleteWorkflow: (workflowId) => 
    api.delete(`/api/workflows/${workflowId}`),
  
  // Execute workflow
  executeWorkflow: (workflowId, data) => 
    api.post(`/api/workflows/${workflowId}/execute`, { data }),
  
  // Get workflow execution history
  getExecutionHistory: (workflowId) => 
    api.get(`/api/workflows/${workflowId}/history`)
}