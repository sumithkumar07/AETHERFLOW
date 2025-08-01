import { EventBus } from '../core/EventBus'
import { CacheManager } from '../core/CacheManager'
import { ConfigManager } from '../core/ConfigManager'
import { PerformanceMonitor } from '../core/PerformanceMonitor'

/**
 * Intelligent AI Router - Phase 3
 * Smart AI model selection, optimization, and response caching with learning
 */
class IntelligentAIRouter {
  constructor() {
    this.eventBus = EventBus.getInstance()
    this.cache = CacheManager.getInstance()
    this.performanceMonitor = PerformanceMonitor.getInstance()
    this.config = ConfigManager.get('ai')
    
    // Model capabilities and performance profiles
    this.models = {
      'gpt-4o-mini': {
        speed: 0.9,
        cost: 0.1,
        quality: 0.7,
        capabilities: ['chat', 'simple-code', 'quick-analysis'],
        maxTokens: 16384,
        avgResponseTime: 800,
        costPerToken: 0.00015
      },
      'gpt-4': {
        speed: 0.4,
        cost: 0.8,
        quality: 0.95,
        capabilities: ['complex-reasoning', 'advanced-code', 'analysis'],
        maxTokens: 8192,
        avgResponseTime: 3000,
        costPerToken: 0.003
      },
      'claude-3-sonnet': {
        speed: 0.6,
        cost: 0.6,
        quality: 0.9,
        capabilities: ['code', 'creative', 'long-context'],
        maxTokens: 200000,
        avgResponseTime: 2000,
        costPerToken: 0.0015
      },
      'gemini-pro': {
        speed: 0.8,
        cost: 0.3,
        quality: 0.8,
        capabilities: ['multimodal', 'reasoning', 'code'],
        maxTokens: 32768,
        avgResponseTime: 1200,
        costPerToken: 0.0005
      }
    }
    
    // Learning system for model performance
    this.modelPerformance = new Map()
    this.userPreferences = new Map()
    this.responseQuality = new Map()
    
    // Semantic similarity engine
    this.semanticCache = new Map()
    this.similarityThreshold = 0.8
    
    this.initializeRouter()
  }

  async initializeRouter() {
    // Load historical performance data
    await this.loadModelPerformance()
    
    // Set up learning listeners
    this.setupLearningSystem()
    
    console.log('🤖 IntelligentAIRouter initialized with', Object.keys(this.models).length, 'models')
  }

  /**
   * Main router method - selects optimal model for task
   */
  async routeRequest(prompt, context = {}) {
    try {
      // Analyze the request
      const analysis = await this.analyzeRequest(prompt, context)
      
      // Check semantic similarity cache first
      const cachedResponse = await this.checkSemanticCache(prompt, analysis)
      if (cachedResponse) {
        this.eventBus.emit('ai.cache_hit', { prompt, model: cachedResponse.model })
        return cachedResponse
      }
      
      // Select optimal model
      const selectedModel = this.selectOptimalModel(analysis, context)
      
      // Execute with fallback chain
      const response = await this.executeWithFallback(prompt, selectedModel, analysis, context)
      
      // Cache response for future similarity matching
      await this.cacheSemanticResponse(prompt, response, analysis)
      
      // Learn from this interaction
      this.recordInteraction(prompt, response, selectedModel, analysis)
      
      return response
      
    } catch (error) {
      console.error('AI Router error:', error)
      this.eventBus.emit('ai.router_error', { error, prompt })
      throw error
    }
  }

  /**
   * Analyze request to determine complexity and requirements
   */
  async analyzeRequest(prompt, context) {
    const analysis = {
      complexity: this.calculateComplexity(prompt),
      taskType: this.classifyTask(prompt),
      urgency: context.urgency || 'normal',
      quality: context.quality || 'balanced',
      budget: context.budget || 'normal',
      hasCode: this.detectCodeContent(prompt),
      isCreative: this.detectCreativeTask(prompt),
      requiresReasoning: this.detectReasoningTask(prompt),
      estimatedTokens: this.estimateTokenUsage(prompt),
      userPreferences: await this.getUserPreferences(context.userId)
    }
    
    return analysis
  }

  /**
   * Select optimal model based on analysis and constraints
   */
  selectOptimalModel(analysis, context = {}) {
    const candidates = Object.entries(this.models)
      .filter(([model, spec]) => this.isModelSuitable(model, spec, analysis))
      .map(([model, spec]) => ({
        model,
        spec,
        score: this.calculateModelScore(model, spec, analysis, context)
      }))
      .sort((a, b) => b.score - a.score)
    
    if (candidates.length === 0) {
      return this.config.defaultModel || 'gpt-4o-mini'
    }
    
    const selected = candidates[0].model
    
    // Emit selection event for learning
    this.eventBus.emit('ai.model_selected', {
      model: selected,
      analysis,
      alternatives: candidates.slice(1, 3),
      reason: this.explainSelection(selected, analysis)
    })
    
    return selected
  }

  /**
   * Execute request with intelligent fallback chain
   */
  async executeWithFallback(prompt, primaryModel, analysis, context) {
    const fallbackChain = this.buildFallbackChain(primaryModel, analysis)
    let lastError = null
    
    for (const model of fallbackChain) {
      try {
        const startTime = Date.now()
        
        // Execute the request
        const response = await this.callModel(model, prompt, context)
        
        const duration = Date.now() - startTime
        
        // Track performance
        this.updateModelPerformance(model, {
          success: true,
          duration,
          tokens: response.usage?.total_tokens || this.estimateTokenUsage(prompt),
          quality: await this.estimateResponseQuality(response, analysis)
        })
        
        this.performanceMonitor.trackCustomMetric('ai_response_time', duration, {
          model,
          complexity: analysis.complexity,
          task_type: analysis.taskType
        })
        
        return {
          ...response,
          model,
          duration,
          analysis,
          fallbacksUsed: fallbackChain.indexOf(model)
        }
        
      } catch (error) {
        lastError = error
        console.warn(`Model ${model} failed, trying next in chain:`, error.message)
        
        // Track failure
        this.updateModelPerformance(model, {
          success: false,
          error: error.message,
          timestamp: Date.now()
        })
        
        continue
      }
    }
    
    throw new Error(`All models in fallback chain failed. Last error: ${lastError?.message}`)
  }

  /**
   * Semantic similarity caching system
   */
  async checkSemanticCache(prompt, analysis) {
    const promptEmbedding = await this.generateEmbedding(prompt)
    
    for (const [cachedPrompt, cachedData] of this.semanticCache) {
      const similarity = this.calculateCosineSimilarity(promptEmbedding, cachedData.embedding)
      
      if (similarity > this.similarityThreshold) {
        // Check if context is compatible
        if (this.isContextCompatible(analysis, cachedData.analysis)) {
          // Adapt cached response to current context
          const adaptedResponse = await this.adaptCachedResponse(
            cachedData.response, 
            analysis, 
            cachedData.analysis
          )
          
          return {
            ...adaptedResponse,
            cached: true,
            similarity,
            originalPrompt: cachedPrompt
          }
        }
      }
    }
    
    return null
  }

  /**
   * Cache response with semantic indexing
   */
  async cacheSemanticResponse(prompt, response, analysis) {
    try {
      const embedding = await this.generateEmbedding(prompt)
      
      this.semanticCache.set(prompt, {
        response,
        analysis,
        embedding,
        timestamp: Date.now(),
        usage: 1
      })
      
      // Cleanup old cache entries
      if (this.semanticCache.size > 1000) {
        this.cleanupSemanticCache()
      }
      
    } catch (error) {
      console.warn('Failed to cache semantic response:', error)
    }
  }

  /**
   * AI Response Quality Assessment
   */
  async assessResponseQuality(response, prompt, analysis) {
    const metrics = {
      relevance: await this.calculateRelevance(response.content, prompt),
      coherence: this.calculateCoherence(response.content),
      completeness: this.calculateCompleteness(response.content, analysis),
      accuracy: analysis.hasCode ? await this.validateCode(response.content) : 1.0,
      creativity: analysis.isCreative ? this.calculateCreativity(response.content) : 1.0,
      safety: await this.checkContentSafety(response.content)
    }
    
    const overallScore = Object.values(metrics).reduce((sum, score) => sum + score, 0) / Object.keys(metrics).length
    
    // Store quality assessment for learning
    this.responseQuality.set(response.id || Date.now(), {
      metrics,
      overallScore,
      model: response.model,
      analysis,
      timestamp: Date.now()
    })
    
    return { ...metrics, overallScore }
  }

  /**
   * Personalized Model Recommendations
   */
  async getPersonalizedRecommendations(userId, taskType) {
    const userPrefs = await this.getUserPreferences(userId)
    const taskHistory = await this.getUserTaskHistory(userId, taskType)
    
    const recommendations = Object.entries(this.models)
      .map(([model, spec]) => ({
        model,
        spec,
        personalizedScore: this.calculatePersonalizedScore(model, spec, userPrefs, taskHistory),
        reasons: this.explainPersonalizedRecommendation(model, userPrefs, taskHistory)
      }))
      .sort((a, b) => b.personalizedScore - a.personalizedScore)
    
    return recommendations.slice(0, 3)
  }

  // Helper methods for analysis
  calculateComplexity(prompt) {
    const factors = {
      length: Math.min(prompt.length / 1000, 1),
      keywords: this.countComplexKeywords(prompt) / 10,
      questions: (prompt.match(/\?/g) || []).length / 5,
      context: this.hasContextRequirements(prompt) ? 0.3 : 0,
      multiStep: this.requiresMultipleSteps(prompt) ? 0.4 : 0
    }
    
    return Math.min(Object.values(factors).reduce((sum, val) => sum + val, 0), 1)
  }

  classifyTask(prompt) {
    const patterns = {
      'code-generation': /write|code|function|class|component|implement/i,
      'code-review': /review|analyze|debug|fix|error/i,
      'creative-writing': /write|story|poem|creative|blog|article/i,
      'analysis': /analyze|explain|understand|summarize|compare/i,
      'reasoning': /solve|calculate|logic|reason|think/i,
      'conversation': /chat|talk|discuss|conversation/i,
      'translation': /translate|convert|transform/i,
      'research': /research|find|search|investigate/i
    }
    
    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(prompt)) return type
    }
    
    return 'general'
  }

  detectCodeContent(prompt) {
    const codeIndicators = [
      /```[\s\S]*```/,
      /function\s+\w+\s*\(/,
      /class\s+\w+/,
      /import\s+\w+/,
      /const\s+\w+\s*=/,
      /<\w+.*?>/,
      /{\s*\w+:\s*\w+/
    ]
    
    return codeIndicators.some(pattern => pattern.test(prompt))
  }

  detectCreativeTask(prompt) {
    const creativeKeywords = [
      'creative', 'story', 'poem', 'blog', 'article', 'write',
      'imagine', 'design', 'brainstorm', 'innovate', 'artistic'
    ]
    
    return creativeKeywords.some(keyword => 
      prompt.toLowerCase().includes(keyword)
    )
  }

  detectReasoningTask(prompt) {
    const reasoningKeywords = [
      'solve', 'calculate', 'logic', 'reason', 'think', 'deduce',
      'conclude', 'infer', 'analyze', 'evaluate', 'compare'
    ]
    
    return reasoningKeywords.some(keyword => 
      prompt.toLowerCase().includes(keyword)
    )
  }

  estimateTokenUsage(prompt) {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(prompt.length / 4)
  }

  isModelSuitable(model, spec, analysis) {
    // Check if model can handle the task type
    const hasRequiredCapability = analysis.taskType === 'general' || 
      spec.capabilities.some(cap => analysis.taskType.includes(cap.replace('-', '_')))
    
    // Check token limits
    const fitsTokenLimit = analysis.estimatedTokens <= spec.maxTokens
    
    return hasRequiredCapability && fitsTokenLimit
  }

  calculateModelScore(model, spec, analysis, context) {
    const weights = context.weights || {
      speed: 0.3,
      cost: 0.2,
      quality: 0.4,
      suitability: 0.1
    }
    
    // Get historical performance
    const performance = this.getModelPerformance(model)
    
    const scores = {
      speed: this.normalizeSpeed(spec.avgResponseTime, analysis.urgency),
      cost: this.normalizeCost(spec.costPerToken, analysis.estimatedTokens, context.budget),
      quality: spec.quality * (performance.averageQuality || 1),
      suitability: this.calculateSuitability(spec, analysis)
    }
    
    return Object.entries(scores)
      .reduce((total, [metric, score]) => total + (score * weights[metric]), 0)
  }

  buildFallbackChain(primaryModel, analysis) {
    const allModels = Object.keys(this.models)
    const fallbackChain = [primaryModel]
    
    // Add suitable alternatives
    const alternatives = allModels
      .filter(model => model !== primaryModel)
      .filter(model => this.isModelSuitable(model, this.models[model], analysis))
      .sort((a, b) => {
        const scoreA = this.calculateModelScore(a, this.models[a], analysis)
        const scoreB = this.calculateModelScore(b, this.models[b], analysis)
        return scoreB - scoreA
      })
    
    fallbackChain.push(...alternatives.slice(0, 2))
    
    // Always include a reliable fallback
    if (!fallbackChain.includes('gpt-4o-mini')) {
      fallbackChain.push('gpt-4o-mini')
    }
    
    return fallbackChain
  }

  async callModel(model, prompt, context) {
    // This would integrate with actual AI services
    // For now, simulate the call structure
    
    const startTime = Date.now()
    
    // Simulate API call based on model characteristics
    const modelSpec = this.models[model]
    const simulatedLatency = modelSpec.avgResponseTime * (0.8 + Math.random() * 0.4)
    
    await new Promise(resolve => setTimeout(resolve, simulatedLatency))
    
    // Simulate response
    const response = {
      id: `response_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: `AI response generated by ${model} for: ${prompt.substring(0, 100)}...`,
      model,
      usage: {
        prompt_tokens: this.estimateTokenUsage(prompt),
        completion_tokens: Math.floor(this.estimateTokenUsage(prompt) * 0.7),
        total_tokens: Math.floor(this.estimateTokenUsage(prompt) * 1.7)
      },
      timestamp: Date.now(),
      duration: Date.now() - startTime
    }
    
    return response
  }

  // Learning and adaptation methods
  setupLearningSystem() {
    // Learn from user feedback
    this.eventBus.subscribe('ai.feedback', (event) => {
      this.recordUserFeedback(event.data)
    })
    
    // Learn from user behavior
    this.eventBus.subscribe('ai.interaction', (event) => {
      this.recordUserInteraction(event.data)
    })
    
    // Adapt models based on performance
    setInterval(() => {
      this.adaptModelSelection()
    }, 300000) // Every 5 minutes
  }

  recordInteraction(prompt, response, model, analysis) {
    const interaction = {
      prompt,
      response: response.content,
      model,
      analysis,
      timestamp: Date.now(),
      duration: response.duration,
      tokens: response.usage?.total_tokens
    }
    
    this.eventBus.emit('ai.interaction_recorded', interaction)
  }

  recordUserFeedback(feedback) {
    const { responseId, rating, comment, userId } = feedback
    
    // Update model performance based on feedback
    if (this.responseQuality.has(responseId)) {
      const quality = this.responseQuality.get(responseId)
      quality.userRating = rating
      quality.userComment = comment
      
      // Update model performance statistics
      this.updateModelPerformance(quality.model, {
        userFeedback: rating,
        timestamp: Date.now()
      })
    }
    
    // Update user preferences
    this.updateUserPreferences(userId, feedback)
  }

  updateModelPerformance(model, metrics) {
    const current = this.modelPerformance.get(model) || {
      totalCalls: 0,
      successCount: 0,
      averageLatency: 0,
      averageQuality: 0,
      costEfficiency: 0,
      userSatisfaction: 0,
      errors: []
    }
    
    if (metrics.success !== undefined) {
      current.totalCalls++
      if (metrics.success) current.successCount++
    }
    
    if (metrics.duration) {
      current.averageLatency = (current.averageLatency + metrics.duration) / 2
    }
    
    if (metrics.quality) {
      current.averageQuality = (current.averageQuality + metrics.quality) / 2
    }
    
    if (metrics.userFeedback) {
      current.userSatisfaction = (current.userSatisfaction + metrics.userFeedback) / 2
    }
    
    if (metrics.error) {
      current.errors.push({
        error: metrics.error,
        timestamp: metrics.timestamp
      })
      
      // Keep only last 10 errors
      if (current.errors.length > 10) {
        current.errors.shift()
      }
    }
    
    this.modelPerformance.set(model, current)
  }

  // Advanced features
  async generateEmbedding(text) {
    // Simplified embedding generation (in production, use actual embedding service)
    const words = text.toLowerCase().split(/\s+/)
    const embedding = new Array(384).fill(0)
    
    words.forEach((word, index) => {
      const hash = this.simpleHash(word)
      embedding[hash % 384] += 1
    })
    
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
    return embedding.map(val => val / (magnitude || 1))
  }

  calculateCosineSimilarity(a, b) {
    if (a.length !== b.length) return 0
    
    let dotProduct = 0
    let normA = 0
    let normB = 0
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  simpleHash(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  // Export and import methods for persistence
  exportConfiguration() {
    return {
      models: this.models,
      modelPerformance: Object.fromEntries(this.modelPerformance),
      userPreferences: Object.fromEntries(this.userPreferences),
      semanticCache: Array.from(this.semanticCache.entries()).slice(-100), // Last 100 entries
      timestamp: Date.now()
    }
  }

  importConfiguration(config) {
    if (config.modelPerformance) {
      this.modelPerformance = new Map(Object.entries(config.modelPerformance))
    }
    
    if (config.userPreferences) {
      this.userPreferences = new Map(Object.entries(config.userPreferences))
    }
    
    if (config.semanticCache) {
      this.semanticCache = new Map(config.semanticCache)
    }
  }

  // Analytics and reporting
  getAnalytics() {
    return {
      models: this.getModelAnalytics(),
      performance: this.getPerformanceAnalytics(),
      usage: this.getUsageAnalytics(),
      quality: this.getQualityAnalytics(),
      costs: this.getCostAnalytics()
    }
  }

  getModelAnalytics() {
    const analytics = {}
    
    this.modelPerformance.forEach((metrics, model) => {
      analytics[model] = {
        ...metrics,
        successRate: metrics.totalCalls > 0 ? metrics.successCount / metrics.totalCalls : 0,
        errorRate: metrics.errors.length / metrics.totalCalls,
        efficiency: metrics.averageQuality / (metrics.averageLatency / 1000), // Quality per second
      }
    })
    
    return analytics
  }
}

export { IntelligentAIRouter }