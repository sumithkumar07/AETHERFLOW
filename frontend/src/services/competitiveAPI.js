import axios from 'axios'

// Get backend URL from environment variables
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'

// Create axios instance with default config
const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle API errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ========================================
// 1. AUTONOMOUS PLANNING SERVICE
// ========================================
export const autonomousPlanningAPI = {
  // Create AI-generated project roadmap
  createRoadmap: async (goal, complexity = 'medium', timeline = 'flexible', context = {}) => {
    const response = await api.post('/api/planning/create-roadmap', {
      goal,
      complexity,
      timeline,
      context
    })
    return response.data
  },

  // Get all user roadmaps
  getRoadmaps: async () => {
    const response = await api.get('/api/planning/roadmaps')
    return response.data
  },

  // Get specific roadmap
  getRoadmap: async (roadmapId) => {
    const response = await api.get(`/api/planning/roadmap/${roadmapId}`)
    return response.data
  },

  // Update task status
  updateTaskStatus: async (roadmapId, taskId, status) => {
    const response = await api.put(`/api/planning/roadmap/${roadmapId}/task/${taskId}`, null, {
      params: { status }
    })
    return response.data
  },

  // Update roadmap progress
  updateProgress: async (roadmapId) => {
    const response = await api.post(`/api/planning/roadmap/${roadmapId}/progress`)
    return response.data
  }
}

// ========================================
// 2. GIT & CI/CD INTEGRATION SERVICE
// ========================================
export const gitCICDAPI = {
  // Create GitHub repository
  createRepo: async (repoConfig, githubToken) => {
    const response = await api.post('/api/git/create-repo', repoConfig, {
      params: { github_token: githubToken }
    })
    return response.data
  },

  // Setup CI/CD pipeline
  setupPipeline: async (pipelineConfig) => {
    const response = await api.post('/api/git/setup-pipeline', pipelineConfig)
    return response.data
  },

  // Deploy to platform
  deployToPlat: async (deploymentConfig, projectPath) => {
    const response = await api.post('/api/git/deploy', deploymentConfig, {
      params: { project_path: projectPath }
    })
    return response.data
  },

  // Create pull request
  createPR: async (repoName, branch, title, description, githubToken) => {
    const response = await api.post('/api/git/create-pr', null, {
      params: { repo_name: repoName, branch, title, description, github_token: githubToken }
    })
    return response.data
  },

  // Get user repositories
  getRepositories: async () => {
    const response = await api.get('/api/git/repositories')
    return response.data
  },

  // Get CI/CD pipelines
  getPipelines: async () => {
    const response = await api.get('/api/git/pipelines')
    return response.data
  },

  // Get deployments
  getDeployments: async () => {
    const response = await api.get('/api/git/deployments')
    return response.data
  }
}

// ========================================
// 3. LONG-TERM MEMORY SERVICE
// ========================================
export const memoryAPI = {
  // Store conversation in memory
  storeConversation: async (conversationId, messages) => {
    const response = await api.post('/api/memory/store-conversation', null, {
      params: { conversation_id: conversationId, messages: JSON.stringify(messages) }
    })
    return response.data
  },

  // Store project insights
  storeProject: async (projectData) => {
    const response = await api.post('/api/memory/store-project', projectData)
    return response.data
  },

  // Get relevant memories
  getRelevantMemories: async (query, context = null, limit = 10) => {
    const response = await api.get('/api/memory/relevant-memories', {
      params: { query, context: context ? JSON.stringify(context) : null, limit }
    })
    return response.data
  },

  // Get user profile
  getUserProfile: async () => {
    const response = await api.get('/api/memory/profile')
    return response.data
  },

  // Enhance response with memory
  enhanceResponse: async (message, conversationId) => {
    const response = await api.post('/api/memory/enhance-response', null, {
      params: { message, conversation_id: conversationId }
    })
    return response.data
  },

  // Get user memories
  getMemories: async (memoryType = null, limit = 20) => {
    const response = await api.get('/api/memory/memories', {
      params: { memory_type: memoryType, limit }
    })
    return response.data
  }
}

// ========================================
// 4. CONVERSATIONAL DEBUGGING SERVICE
// ========================================
export const debugAPI = {
  // Start debug session
  startSession: async (errorDescription, context) => {
    const response = await api.post('/api/debug/start-session', null, {
      params: { error_description: errorDescription, context: JSON.stringify(context) }
    })
    return response.data
  },

  // Continue debug conversation
  continueConversation: async (sessionId, userMessage) => {
    const response = await api.post(`/api/debug/session/${sessionId}/continue`, null, {
      params: { user_message: userMessage }
    })
    return response.data
  },

  // Run debug test
  runTest: async (sessionId, testConfig) => {
    const response = await api.post(`/api/debug/session/${sessionId}/test`, testConfig)
    return response.data
  },

  // Get fix suggestions
  suggestFix: async (sessionId) => {
    const response = await api.post(`/api/debug/session/${sessionId}/suggest-fix`)
    return response.data
  },

  // Replay debug session
  replaySession: async (sessionId) => {
    const response = await api.get(`/api/debug/session/${sessionId}/replay`)
    return response.data
  },

  // Get debug sessions
  getSessions: async () => {
    const response = await api.get('/api/debug/sessions')
    return response.data
  },

  // Update session status
  updateSessionStatus: async (sessionId, status) => {
    const response = await api.put(`/api/debug/session/${sessionId}/status`, null, {
      params: { status }
    })
    return response.data
  }
}

// ========================================
// 5. ENHANCED EDITOR SERVICE
// ========================================
export const editorAPI = {
  // Create editor session
  createSession: async (files) => {
    const response = await api.post('/api/editor/create-session', { files })
    return response.data
  },

  // Get code suggestions
  getCodeSuggestions: async (sessionId, filePath, line, column, context = '') => {
    const response = await api.get(`/api/editor/session/${sessionId}/suggestions`, {
      params: { file_path: filePath, line, column, context }
    })
    return response.data
  },

  // Apply code change
  applyCodeChange: async (sessionId, filePath, change) => {
    const response = await api.post(`/api/editor/session/${sessionId}/apply-change`, {
      file_path: filePath,
      change
    })
    return response.data
  },

  // Generate VS Code extension
  generateVSCodeExtension: async (userPreferences) => {
    const response = await api.post('/api/editor/generate-vscode-extension', { user_preferences: userPreferences })
    return response.data
  },

  // Sync with VS Code
  syncWithVSCode: async (sessionId, vscodeState) => {
    const response = await api.post(`/api/editor/session/${sessionId}/sync-vscode`, { vscode_state: vscodeState })
    return response.data
  },

  // Get editor sessions
  getSessions: async () => {
    const response = await api.get('/api/editor/sessions')
    return response.data
  }
}

// ========================================
// 6. ENHANCED TEMPLATES SERVICE
// ========================================
export const enhancedTemplatesAPI = {
  // Get template categories
  getCategories: async () => {
    const response = await api.get('/api/templates/enhanced/categories')
    return response.data
  },

  // Initialize template library
  initializeTemplates: async () => {
    const response = await api.get('/api/templates/enhanced/initialize')
    return response.data
  },

  // Generate custom template
  generateCustomTemplate: async (requirements) => {
    const response = await api.post('/api/templates/enhanced/generate-custom', requirements)
    return response.data
  },

  // Customize existing template
  customizeTemplate: async (templateId, customizations) => {
    const response = await api.post(`/api/templates/enhanced/customize/${templateId}`, customizations)
    return response.data
  },

  // Get user templates
  getUserTemplates: async () => {
    const response = await api.get('/api/templates/enhanced/user-templates')
    return response.data
  },

  // Get popular templates
  getPopularTemplates: async (limit = 12) => {
    const response = await api.get('/api/templates/enhanced/popular', {
      params: { limit }
    })
    return response.data
  },

  // Get templates by category
  getTemplatesByCategory: async (category, limit = 20) => {
    const response = await api.get(`/api/templates/enhanced/by-category/${category}`, {
      params: { limit }
    })
    return response.data
  },

  // Get template details
  getTemplateDetails: async (templateId) => {
    const response = await api.get(`/api/templates/enhanced/${templateId}`)
    return response.data
  },

  // Download template
  downloadTemplate: async (templateId) => {
    const response = await api.post(`/api/templates/enhanced/${templateId}/download`)
    return response.data
  }
}

// ========================================
// COMPETITIVE FEATURES HELPER
// ========================================
export const competitiveAPI = {
  // Check feature availability
  checkFeatureAvailability: async () => {
    try {
      const features = {
        autonomous_planning: true,
        git_cicd: true,
        memory_system: true,
        conversational_debugging: true,
        enhanced_editor: true,
        enhanced_templates: true
      }
      
      return { available: true, features }
    } catch (error) {
      console.error('Feature check failed:', error)
      return { available: false, features: {} }
    }
  },

  // Get competitive features status
  getCompetitiveStatus: async () => {
    try {
      // Test all services
      const [templates, categories] = await Promise.allSettled([
        enhancedTemplatesAPI.getPopularTemplates(3),
        enhancedTemplatesAPI.getCategories()
      ])

      return {
        templates_service: templates.status === 'fulfilled',
        categories_loaded: categories.status === 'fulfilled',
        template_count: templates.status === 'fulfilled' ? templates.value?.length || 0 : 0,
        category_count: categories.status === 'fulfilled' ? categories.value?.length || 0 : 0,
        last_check: new Date().toISOString()
      }
    } catch (error) {
      console.error('Competitive status check failed:', error)
      return {
        templates_service: false,
        categories_loaded: false,
        template_count: 0,
        category_count: 0,
        error: error.message
      }
    }
  }
}

// Export all APIs as default
export default {
  autonomousPlanningAPI,
  gitCICDAPI,
  memoryAPI,
  debugAPI,
  editorAPI,
  enhancedTemplatesAPI,
  competitiveAPI
}