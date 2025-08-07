import axios from 'axios'

// Get backend URL from environment
const API_BASE_URL = import.meta.env?.VITE_BACKEND_URL || import.meta.env?.REACT_APP_BACKEND_URL || 'http://localhost:8001'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Enhanced API service with all backend endpoints
class ApiService {
  constructor() {
    this.client = api
    this.baseURL = API_BASE_URL
  }

  // ==================== AI SERVICES ====================
  
  // Enhanced Chat with AI v4 Complete - All 6 Phases (PERFORMANCE OPTIMIZED)
  async enhancedChatComplete(messageData) {
    try {
      const response = await this.client.post('/api/ai/v4/chat/enhanced-complete', messageData)
      return response.data
    } catch (error) {
      // Intelligent fallback to v3 if v4 fails
      console.warn('Enhanced v4 failed, falling back to v3:', error.message)
      return await this.enhancedChatV3(messageData)
    }
  }
  
  // Quick Enhanced Response (PERFORMANCE OPTIMIZED)
  async quickEnhancedResponse(messageData) {
    try {
      const response = await this.client.post('/api/ai/v4/chat/quick-enhanced', messageData)
      return response.data
    } catch (error) {
      // Fallback to standard chat
      console.warn('Quick enhanced failed, falling back to standard:', error.message)
      return await this.chatWithAI(messageData)
    }
  }
  
  // Chat with AI (Standard - preserved for compatibility)
  async chatWithAI(messageData) {
    const response = await this.client.post('/api/ai/chat', messageData)
    return response.data
  }

  // Get available models
  async getAIModels() {
    const response = await this.client.get('/api/ai/models')
    return response.data.models
  }

  // Get available agents
  async getAIAgents() {
    const response = await this.client.get('/api/ai/agents')
    return response.data.agents
  }

  // Get conversations
  async getConversations(params = {}) {
    const response = await this.client.get('/api/ai/conversations', { params })
    return response.data
  }

  // Get specific conversation
  async getConversation(conversationId) {
    const response = await this.client.get(`/api/ai/conversations/${conversationId}`)
    return response.data
  }

  // Create conversation
  async createConversation(conversationData) {
    const response = await this.client.post('/api/ai/conversations', conversationData)
    return response.data
  }

  // ==================== PROJECT SERVICES ====================
  
  // Get projects
  async getProjects(params = {}) {
    const response = await this.client.get('/api/projects', { params })
    return response.data
  }

  // Get specific project
  async getProject(projectId) {
    const response = await this.client.get(`/api/projects/${projectId}`)
    return response.data
  }

  // Create project
  async createProject(projectData) {
    const response = await this.client.post('/api/projects', projectData)
    return response.data
  }

  // Update project
  async updateProject(projectId, updates) {
    const response = await this.client.put(`/api/projects/${projectId}`, updates)
    return response.data
  }

  // Delete project
  async deleteProject(projectId) {
    const response = await this.client.delete(`/api/projects/${projectId}`)
    return response.data
  }

  // Build project
  async buildProject(projectId) {
    const response = await this.client.post(`/api/projects/${projectId}/build`)
    return response.data
  }

  // Deploy project
  async deployProject(projectId) {
    const response = await this.client.post(`/api/projects/${projectId}/deploy`)
    return response.data
  }

  // Get project files
  async getProjectFiles(projectId) {
    const response = await this.client.get(`/api/projects/${projectId}/files`)
    return response.data
  }

  // Save project file
  async saveProjectFile(projectId, fileData) {
    const response = await this.client.post(`/api/projects/${projectId}/files`, fileData)
    return response.data
  }

  // Get project logs
  async getProjectLogs(projectId, limit = 50) {
    const response = await this.client.get(`/api/projects/${projectId}/logs`, { params: { limit } })
    return response.data
  }

  // ==================== TEMPLATE SERVICES ====================
  
  // Get templates
  async getTemplates(params = {}) {
    const response = await this.client.get('/api/templates', { params })
    return response.data
  }

  // Get template categories
  async getTemplateCategories() {
    const response = await this.client.get('/api/templates/categories')
    return response.data
  }

  // Get template details
  async getTemplate(templateId) {
    const response = await this.client.get(`/api/templates/${templateId}`)
    return response.data
  }

  // Use template
  async useTemplate(templateId, projectName) {
    const response = await this.client.post(`/api/templates/${templateId}/use`, { project_name: projectName })
    return response.data
  }

  // ==================== ENTERPRISE SERVICES ====================
  
  // Get enterprise features
  async getEnterpriseFeatures() {
    const response = await this.client.get('/api/enterprise/features')
    return response.data
  }

  // Get enterprise integrations
  async getEnterpriseIntegrations() {
    const response = await this.client.get('/api/enterprise/integrations')
    return response.data
  }

  // Get compliance dashboard
  async getComplianceDashboard() {
    const response = await this.client.get('/api/enterprise/compliance/dashboard')
    return response.data
  }

  // Get automation dashboard
  async getAutomationDashboard() {
    const response = await this.client.get('/api/enterprise/automation/dashboard')
    return response.data
  }

  // ==================== ADVANCED SERVICES ====================
  
  // Advanced AI features
  async getAdvancedAIFeatures() {
    const response = await this.client.get('/api/advanced-ai/features')
    return response.data
  }

  // Analytics
  async getAnalytics(params = {}) {
    const response = await this.client.get('/api/analytics', { params })
    return response.data
  }

  // Performance monitoring
  async getPerformanceMetrics() {
    const response = await this.client.get('/api/performance')
    return response.data
  }

  // Plugin system
  async getPlugins() {
    const response = await this.client.get('/api/plugins')
    return response.data
  }

  // Security features
  async getSecurityStatus() {
    const response = await this.client.get('/api/security/status')
    return response.data
  }

  // Development assistant
  async getDevelopmentInsights(projectId) {
    const response = await this.client.get(`/api/development/insights/${projectId}`)
    return response.data
  }

  // Collaboration features
  async getCollaborationStatus(projectId) {
    const response = await this.client.get(`/api/collaboration/status/${projectId}`)
    return response.data
  }

  // Voice interface
  async getVoiceCapabilities() {
    const response = await this.client.get('/api/voice/capabilities')
    return response.data
  }

  // Workflow automation
  async getWorkflows() {
    const response = await this.client.get('/api/workflows')
    return response.data
  }

  // Smart features
  async getSmartFeatures() {
    const response = await this.client.get('/api/smart-features')
    return response.data
  }

  // Enhanced features
  async getEnhancedFeatures() {
    const response = await this.client.get('/api/enhanced/features')
    return response.data
  }

  // Dashboard analytics
  async getDashboardData() {
    const response = await this.client.get('/api/dashboard')
    return response.data
  }

  // ==================== CUTTING-EDGE SERVICES ====================
  
  // Architectural intelligence
  async getArchitecturalInsights(projectId) {
    const response = await this.client.get(`/api/architectural-intelligence/insights/${projectId}`)
    return response.data
  }

  // Smart documentation
  async getSmartDocumentation(projectId) {
    const response = await this.client.get(`/api/smart-documentation/generate/${projectId}`)
    return response.data
  }

  // Theme intelligence
  async getThemeRecommendations(projectId) {
    const response = await this.client.get(`/api/theme-intelligence/recommendations/${projectId}`)
    return response.data
  }

  // Project migration
  async getMigrationOptions(projectId) {
    const response = await this.client.get(`/api/project-migration/options/${projectId}`)
    return response.data
  }

  // Code quality
  async getCodeQualityReport(projectId) {
    const response = await this.client.get(`/api/code-quality/report/${projectId}`)
    return response.data
  }

  // Workspace optimization
  async getWorkspaceInsights() {
    const response = await this.client.get('/api/workspace-optimization/insights')
    return response.data
  }

  // Experimental sandbox
  async getExperimentalFeatures() {
    const response = await this.client.get('/api/experimental-sandbox/features')
    return response.data
  }

  // Visual programming
  async getVisualProgrammingTools() {
    const response = await this.client.get('/api/visual-programming/tools')
    return response.data
  }

  // ==================== NEW SERVICES ====================
  
  // Video explanations
  async getVideoExplanations(params = {}) {
    const response = await this.client.get('/api/video-explanations', { params })
    return response.data
  }

  // SEO services
  async getSEOAnalysis(projectId) {
    const response = await this.client.get(`/api/seo/analysis/${projectId}`)
    return response.data
  }

  // Internationalization
  async getI18nSupport(projectId) {
    const response = await this.client.get(`/api/i18n/support/${projectId}`)
    return response.data
  }

  // Agent marketplace
  async getAgentMarketplace() {
    const response = await this.client.get('/api/agent-marketplace')
    return response.data
  }

  // Presentations
  async getPresentationTools() {
    const response = await this.client.get('/api/presentations/tools')
    return response.data
  }

  // ==================== AUTH SERVICES ====================
  
  // User profile
  async getUserProfile() {
    const response = await this.client.get('/api/auth/me')
    return response.data
  }

  // Update profile
  async updateProfile(profileData) {
    const response = await this.client.put('/api/auth/profile', profileData)
    return response.data
  }

  // Refresh token
  async refreshToken() {
    const response = await this.client.post('/api/auth/refresh')
    return response.data
  }

  // Create demo user (for development)
  async createDemoUser() {
    const response = await this.client.post('/api/auth/create-demo')
    return response.data
  }
}

// Create singleton instance
const apiService = new ApiService()

export default api
export { apiService, API_BASE_URL }