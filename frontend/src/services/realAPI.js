// Real API Integration - Connects Frontend to ALL 60+ Backend Services
// This eliminates mock data and makes the app "actually functional"

import axios from 'axios'

// Get backend URL from environment
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'

class RealAPIService {
  constructor() {
    this.client = axios.create({
      baseURL: BACKEND_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    // Add request interceptor for auth
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('aether-ai-token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })
    
    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.warn('API Error:', error.response?.status, error.response?.data)
        return Promise.reject(error)
      }
    )
  }

  // ==================== VOICE INTERFACE (REAL) ====================
  async getVoiceCapabilities() {
    const response = await this.client.get('/api/voice/voice-capabilities')
    return response.data
  }

  async processVoiceCommand(audioBlob) {
    const formData = new FormData()
    formData.append('audio', audioBlob)
    
    const response = await this.client.post('/api/voice/process-audio', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  }

  // ==================== ADVANCED AI SERVICES (REAL) ====================
  async getAdvancedAIModels() {
    const response = await this.client.get('/api/advanced-ai/available-models')
    return response.data
  }

  async selectOptimalModel(requirements) {
    const response = await this.client.post('/api/advanced-ai/select-optimal-model', requirements)
    return response.data
  }

  async smartChatWithAI(messageData) {
    const response = await this.client.post('/api/advanced-ai/smart-chat', messageData)
    return response.data
  }

  async batchProcessRequests(requests) {
    const response = await this.client.post('/api/advanced-ai/batch-process', { requests })
    return response.data
  }

  // ==================== AGENT MARKETPLACE (REAL) ====================
  async getAgentMarketplace() {
    const response = await this.client.get('/api/agent-marketplace/agents')
    return response.data
  }

  async getAgentCategories() {
    const response = await this.client.get('/api/agent-marketplace/categories')
    return response.data
  }

  async getFeaturedAgents() {
    const response = await this.client.get('/api/agent-marketplace/featured')
    return response.data
  }

  async useAgent(agentId) {
    const response = await this.client.post(`/api/agent-marketplace/agents/${agentId}/use`)
    return response.data
  }

  // ==================== ENTERPRISE ANALYTICS (REAL) ====================
  async getEnterpriseFeatures() {
    const response = await this.client.get('/api/enterprise/features')
    return response.data
  }

  async getComplianceDashboard() {
    const response = await this.client.get('/api/enterprise/compliance/dashboard')
    return response.data
  }

  async getAutomationDashboard() {
    const response = await this.client.get('/api/enterprise/automation/dashboard')
    return response.data
  }

  async getEnterpriseIntegrations() {
    const response = await this.client.get('/api/enterprise/integrations')
    return response.data
  }

  // ==================== ANALYTICS & INTELLIGENCE (REAL) ====================
  async getAnalyticsDashboard() {
    const response = await this.client.get('/api/dashboard/analytics/dashboard')
    return response.data
  }

  async getRealtimeAnalytics() {
    const response = await this.client.get('/api/dashboard/analytics/realtime')
    return response.data
  }

  async getAIPerformanceMetrics() {
    const response = await this.client.get('/api/dashboard/analytics/ai-performance')
    return response.data
  }

  async getUserInsights() {
    const response = await this.client.get('/api/dashboard/analytics/user-insights')
    return response.data
  }

  async getPredictions() {
    const response = await this.client.get('/api/dashboard/analytics/predictions')
    return response.data
  }

  // ==================== PERFORMANCE MONITORING (REAL) ====================
  async getPerformanceMetrics() {
    const response = await this.client.get('/api/performance/metrics')
    return response.data
  }

  async getPerformanceAlerts() {
    const response = await this.client.get('/api/performance/alerts')
    return response.data
  }

  async getPerformanceHistory() {
    const response = await this.client.get('/api/performance/history')
    return response.data
  }

  async getScalingMetrics() {
    const response = await this.client.get('/api/performance/scaling')
    return response.data
  }

  // ==================== VISUAL PROGRAMMING (REAL) ====================
  async getSupportedDiagramTypes() {
    const response = await this.client.get('/api/visual-programming/supported-diagram-types')
    return response.data
  }

  async uploadDiagram(diagramFile) {
    const formData = new FormData()
    formData.append('diagram', diagramFile)
    
    const response = await this.client.post('/api/visual-programming/upload-diagram', formData)
    return response.data
  }

  async generateCodeFromFlowchart(diagramId, options) {
    const response = await this.client.post('/api/visual-programming/generate-code-from-flowchart', {
      diagram_id: diagramId,
      ...options
    })
    return response.data
  }

  async generateUIFromWireframe(diagramId, framework) {
    const response = await this.client.post('/api/visual-programming/generate-ui-from-wireframe', {
      diagram_id: diagramId,
      framework
    })
    return response.data
  }

  // ==================== COLLABORATION ENGINE (REAL) ====================
  async getActiveCollaborationSessions() {
    const response = await this.client.get('/api/collaboration/sessions/active')
    return response.data
  }

  async getOnlineUsers(projectId) {
    const response = await this.client.get(`/api/collaboration/online-users/${projectId}`)
    return response.data
  }

  async getProjectActivity(projectId) {
    const response = await this.client.get(`/api/collaboration/activity/${projectId}`)
    return response.data
  }

  async sendCursorUpdate(projectId, cursorData) {
    const response = await this.client.post('/api/collaboration/cursor-update', {
      project_id: projectId,
      ...cursorData
    })
    return response.data
  }

  // ==================== SECURITY & COMPLIANCE (REAL) ====================
  async getSecurityScore() {
    const response = await this.client.get('/api/security/security-score')
    return response.data
  }

  async getThreatAlerts() {
    const response = await this.client.get('/api/security/threat-alerts')
    return response.data
  }

  async getComplianceStatus() {
    const response = await this.client.get('/api/security/compliance-status')
    return response.data
  }

  async getAuditLog() {
    const response = await this.client.get('/api/security/audit-log')
    return response.data
  }

  // ==================== ENHANCED SERVICES (REAL) ====================
  
  // Video Explanations
  async getVideoExplanations() {
    const response = await this.client.get('/api/video-explanations/videos')
    return response.data
  }

  async generateVideoExplanation(type, content) {
    const response = await this.client.post('/api/video-explanations/tutorial', {
      type,
      content
    })
    return response.data
  }

  // SEO Services
  async analyzeSEO(pageData) {
    const response = await this.client.post('/api/seo/analyze-content', pageData)
    return response.data
  }

  async getSEOHealthCheck() {
    const response = await this.client.get('/api/seo/seo-health-check')
    return response.data
  }

  async getKeywordSuggestions(topic) {
    const response = await this.client.get(`/api/seo/keywords/suggestions?topic=${topic}`)
    return response.data
  }

  // Internationalization
  async getSupportedLanguages() {
    const response = await this.client.get('/api/i18n/languages')
    return response.data
  }

  async translateText(text, targetLanguage) {
    const response = await this.client.post('/api/i18n/translate/text', {
      text,
      target_language: targetLanguage
    })
    return response.data
  }

  async getTranslationStats() {
    const response = await this.client.get('/api/i18n/stats')
    return response.data
  }

  // Presentations
  async getPresentationTemplates() {
    const response = await this.client.get('/api/presentations/templates')
    return response.data
  }

  async generatePresentation(type, data) {
    const response = await this.client.post('/api/presentations/generate', {
      type,
      data
    })
    return response.data
  }

  // ==================== WORKFLOW AUTOMATION (REAL) ====================
  async getWorkflows() {
    const response = await this.client.get('/api/workflows/workflows')
    return response.data
  }

  async triggerWorkflow(workflowId, data) {
    const response = await this.client.post(`/api/workflows/workflows/${workflowId}/trigger`, data)
    return response.data
  }

  async getWorkflowExecutions(workflowId) {
    const response = await this.client.get(`/api/workflows/workflows/${workflowId}/executions`)
    return response.data
  }

  // ==================== ARCHITECTURAL INTELLIGENCE (REAL) ====================
  async analyzeProjectStructure(projectId) {
    const response = await this.client.post('/api/architectural-intelligence/analyze-structure', {
      project_id: projectId
    })
    return response.data
  }

  async suggestArchitecture(requirements) {
    const response = await this.client.post('/api/architectural-intelligence/suggest-structure', requirements)
    return response.data
  }

  async generateDocumentation(projectData) {
    const response = await this.client.post('/api/architectural-intelligence/generate-documentation', projectData)
    return response.data
  }

  // ==================== BATCH OPERATIONS FOR EFFICIENCY ====================
  async batchApiCall(endpoints) {
    const promises = endpoints.map(({ endpoint, method = 'GET', data }) => {
      switch (method.toLowerCase()) {
        case 'post':
          return this.client.post(endpoint, data).catch(e => ({ error: e.message }))
        case 'put':
          return this.client.put(endpoint, data).catch(e => ({ error: e.message }))
        case 'delete':
          return this.client.delete(endpoint).catch(e => ({ error: e.message }))
        default:
          return this.client.get(endpoint).catch(e => ({ error: e.message }))
      }
    })
    
    const results = await Promise.allSettled(promises)
    return results.map((result, index) => ({
      endpoint: endpoints[index].endpoint,
      success: result.status === 'fulfilled' && !result.value.error,
      data: result.status === 'fulfilled' ? result.value.data || result.value : null,
      error: result.status === 'rejected' ? result.reason.message : result.value?.error
    }))
  }

  // ==================== HEALTH CHECK FOR ALL SERVICES ====================
  async checkAllServicesHealth() {
    const services = [
      '/api/voice/voice-capabilities',
      '/api/advanced-ai/available-models',
      '/api/enterprise/features',
      '/api/dashboard/analytics/dashboard',
      '/api/performance/metrics',
      '/api/visual-programming/supported-diagram-types',
      '/api/collaboration/sessions/active',
      '/api/security/security-score',
      '/api/workflows/workflows/capabilities',
      '/api/architectural-intelligence/health'
    ]

    const results = await this.batchApiCall(
      services.map(endpoint => ({ endpoint }))
    )

    return {
      total_services: services.length,
      healthy_services: results.filter(r => r.success).length,
      failed_services: results.filter(r => !r.success).length,
      services: results.reduce((acc, result) => {
        acc[result.endpoint] = {
          status: result.success ? 'healthy' : 'failed',
          error: result.error || null
        }
        return acc
      }, {}),
      overall_health: results.filter(r => r.success).length / services.length * 100
    }
  }
}

// Create singleton instance
const realAPI = new RealAPIService()

export default realAPI
export { RealAPIService }