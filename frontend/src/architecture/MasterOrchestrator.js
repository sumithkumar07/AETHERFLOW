import { ServiceFactory } from './services/ServiceFactory'
import { IntelligentAIRouter } from './ai/IntelligentAIRouter'
import { PluginManager } from './plugins/PluginManager'
import { AdvancedAnalytics } from './analytics/AdvancedAnalytics'
import { ZeroTrustGateway } from './security/ZeroTrustGateway'
import { PredictiveScaler } from './performance/PredictiveScaler'
import { AdaptiveUI } from './ux/AdaptiveUI'
import { DevelopmentAssistant } from './dev/DevelopmentAssistant'
import { CollaborationEngine } from './collaboration/CollaborationEngine'
import { EventBus } from './core/EventBus'
import { ConfigManager } from './core/ConfigManager'

/**
 * Master Orchestrator - Enterprise Architecture Coordinator
 * Manages all enterprise systems and their interactions
 */
class MasterOrchestrator {
  static instance = null

  constructor() {
    if (MasterOrchestrator.instance) {
      return MasterOrchestrator.instance
    }

    this.eventBus = EventBus.getInstance()
    this.initialized = false
    this.systems = new Map()
    this.systemHealth = new Map()
    
    // System dependency graph
    this.dependencies = new Map([
      ['serviceFactory', []],
      ['aiRouter', ['serviceFactory']],
      ['pluginManager', ['serviceFactory']],
      ['analytics', ['serviceFactory']],
      ['security', ['serviceFactory']],
      ['performance', ['serviceFactory', 'analytics']],
      ['adaptiveUI', ['serviceFactory', 'analytics']],
      ['devAssistant', ['serviceFactory', 'aiRouter']],
      ['collaboration', ['serviceFactory', 'security']]
    ])

    MasterOrchestrator.instance = this
  }

  static getInstance() {
    if (!MasterOrchestrator.instance) {
      MasterOrchestrator.instance = new MasterOrchestrator()
    }
    return MasterOrchestrator.instance
  }

  /**
   * Initialize all enterprise systems in dependency order
   */
  async initialize() {
    if (this.initialized) {
      return { success: true, message: 'Already initialized' }
    }

    try {
      console.log('🚀 MasterOrchestrator: Starting enterprise system initialization...')
      
      // Initialize systems in dependency order
      const initializationOrder = this.calculateInitializationOrder()
      const initializationResults = new Map()

      for (const systemName of initializationOrder) {
        try {
          console.log(`🔧 Initializing ${systemName}...`)
          
          const system = await this.initializeSystem(systemName)
          this.systems.set(systemName, system)
          
          // Health check
          const health = await this.checkSystemHealth(systemName, system)
          this.systemHealth.set(systemName, health)
          
          initializationResults.set(systemName, {
            success: true,
            system,
            health,
            timestamp: Date.now()
          })
          
          console.log(`✅ ${systemName} initialized successfully`)
          
        } catch (error) {
          console.error(`❌ Failed to initialize ${systemName}:`, error)
          
          initializationResults.set(systemName, {
            success: false,
            error: error.message,
            timestamp: Date.now()
          })
          
          // Check if this system is critical
          if (this.isCriticalSystem(systemName)) {
            throw new Error(`Critical system ${systemName} failed to initialize: ${error.message}`)
          }
        }
      }

      // Set up inter-system communication
      this.setupInterSystemCommunication()
      
      // Start system monitoring
      this.startSystemMonitoring()
      
      // Start optimization routines
      this.startOptimizationRoutines()
      
      this.initialized = true
      
      // Emit initialization complete event
      this.eventBus.emit('master.initialization_complete', {
        systems: Array.from(this.systems.keys()),
        results: Object.fromEntries(initializationResults),
        timestamp: Date.now()
      })
      
      console.log('🎉 MasterOrchestrator: All systems initialized successfully!')
      
      return {
        success: true,
        systems: Array.from(this.systems.keys()),
        results: Object.fromEntries(initializationResults),
        message: 'Enterprise architecture fully operational'
      }
      
    } catch (error) {
      console.error('💥 MasterOrchestrator: Initialization failed:', error)
      
      this.eventBus.emit('master.initialization_failed', {
        error: error.message,
        timestamp: Date.now()
      })
      
      return {
        success: false,
        error: error.message,
        systems: Object.fromEntries(this.systems),
        message: 'Enterprise architecture initialization failed'
      }
    }
  }

  /**
   * Get comprehensive system status
   */
  async getSystemStatus() {
    const status = {
      masterOrchestrator: {
        initialized: this.initialized,
        systemCount: this.systems.size,
        healthySystemCount: 0,
        uptime: Date.now() - (this.initializationTime || Date.now())
      },
      systems: {},
      overall: {
        status: 'unknown',
        score: 0,
        recommendations: []
      },
      timestamp: Date.now()
    }

    // Check each system
    for (const [systemName, system] of this.systems) {
      try {
        const health = await this.checkSystemHealth(systemName, system)
        status.systems[systemName] = health
        
        if (health.status === 'healthy') {
          status.masterOrchestrator.healthySystemCount++
        }
      } catch (error) {
        status.systems[systemName] = {
          status: 'error',
          error: error.message,
          timestamp: Date.now()
        }
      }
    }

    // Calculate overall status
    const healthyRatio = status.masterOrchestrator.healthySystemCount / status.masterOrchestrator.systemCount
    
    if (healthyRatio >= 0.9) {
      status.overall.status = 'excellent'
      status.overall.score = 95
    } else if (healthyRatio >= 0.8) {
      status.overall.status = 'good'
      status.overall.score = 85
    } else if (healthyRatio >= 0.7) {
      status.overall.status = 'fair'
      status.overall.score = 70
    } else {
      status.overall.status = 'poor'
      status.overall.score = 50
    }

    return status
  }

  /**
   * Execute cross-system optimization
   */
  async optimizeEnterpriseSystems() {
    try {
      console.log('🔄 Starting enterprise-wide optimization...')
      
      const optimizations = await Promise.allSettled([
        this.optimizePerformance(),
        this.optimizeUserExperience(),
        this.optimizeSecurity(),
        this.optimizeCollaboration(),
        this.optimizeDeveloperExperience()
      ])

      const results = {
        performance: this.getOptimizationResult(optimizations[0]),
        userExperience: this.getOptimizationResult(optimizations[1]),
        security: this.getOptimizationResult(optimizations[2]),
        collaboration: this.getOptimizationResult(optimizations[3]),
        developerExperience: this.getOptimizationResult(optimizations[4])
      }

      this.eventBus.emit('master.optimization_complete', {
        results,
        timestamp: Date.now()
      })

      return results
      
    } catch (error) {
      console.error('Optimization failed:', error)
      return { error: error.message }
    }
  }

  /**
   * Intelligent system orchestration
   */
  async orchestrateIntelligentWorkflow(workflowType, context = {}) {
    try {
      switch (workflowType) {
        case 'smart_development':
          return this.orchestrateSmartDevelopment(context)
          
        case 'adaptive_user_experience':
          return this.orchestrateAdaptiveUX(context)
          
        case 'predictive_scaling':
          return this.orchestratePredictiveScaling(context)
          
        case 'collaborative_intelligence':
          return this.orchestrateCollaborativeIntelligence(context)
          
        default:
          throw new Error(`Unknown workflow type: ${workflowType}`)
      }
    } catch (error) {
      console.error('Workflow orchestration failed:', error)
      return { error: error.message }
    }
  }

  // System initialization methods
  async initializeSystem(systemName) {
    switch (systemName) {
      case 'serviceFactory':
        const serviceFactory = ServiceFactory.getInstance()
        await serviceFactory.initialize()
        return serviceFactory

      case 'aiRouter':
        const aiRouter = new IntelligentAIRouter()
        await aiRouter.initialize()
        return aiRouter

      case 'pluginManager':
        const pluginManager = new PluginManager()
        await pluginManager.initialize()
        return pluginManager

      case 'analytics':
        const analytics = new AdvancedAnalytics()
        await analytics.initialize()
        return analytics

      case 'security':
        const security = new ZeroTrustGateway()
        await security.initialize()
        return security

      case 'performance':
        const performance = new PredictiveScaler()
        await performance.initialize()
        return performance

      case 'adaptiveUI':
        const adaptiveUI = new AdaptiveUI()
        await adaptiveUI.initialize()
        return adaptiveUI

      case 'devAssistant':
        const devAssistant = new DevelopmentAssistant()
        await devAssistant.initialize()
        return devAssistant

      case 'collaboration':
        const collaboration = new CollaborationEngine()
        await collaboration.initialize()
        return collaboration

      default:
        throw new Error(`Unknown system: ${systemName}`)
    }
  }

  // Cross-system optimization methods
  async optimizePerformance() {
    const performance = this.systems.get('performance')
    const analytics = this.systems.get('analytics')
    
    if (!performance || !analytics) {
      return { error: 'Required systems not available' }
    }

    // Get performance insights from analytics
    const performanceInsights = await analytics.getPerformanceInsights()
    
    // Apply predictive scaling
    const scalingResults = await performance.analyzeAndScale()
    
    // Optimize based on insights
    const optimizations = await performance.optimizeResources(
      performanceInsights.currentUsage,
      scalingResults.predictions
    )

    return {
      insights: performanceInsights,
      scaling: scalingResults,
      optimizations,
      timestamp: Date.now()
    }
  }

  async optimizeUserExperience() {
    const adaptiveUI = this.systems.get('adaptiveUI')
    const analytics = this.systems.get('analytics')
    
    if (!adaptiveUI || !analytics) {
      return { error: 'Required systems not available' }
    }

    // Get user behavior insights
    const userInsights = await analytics.getUserBehaviorInsights()
    
    // Apply UI adaptations for each user segment
    const adaptations = await Promise.all(
      userInsights.segments.map(segment =>
        adaptiveUI.customizeInterface(segment.userId, {
          segment: segment.segment,
          preferences: segment.preferences
        })
      )
    )

    return {
      insights: userInsights,
      adaptations,
      timestamp: Date.now()
    }
  }

  // Workflow orchestration methods
  async orchestrateSmartDevelopment(context) {
    const { code, projectId, userId } = context
    
    const devAssistant = this.systems.get('devAssistant')
    const aiRouter = this.systems.get('aiRouter')
    const analytics = this.systems.get('analytics')
    
    if (!devAssistant || !aiRouter || !analytics) {
      throw new Error('Required systems not available')
    }

    // Analyze code
    const codeAnalysis = await devAssistant.analyzeCode(code, context)
    
    // Get AI suggestions for improvements
    const aiSuggestions = await aiRouter.routeRequest(
      `Analyze this code and suggest improvements: ${code}`,
      { userId, type: 'code_review' }
    )
    
    // Generate tests
    const tests = await devAssistant.generateTests(code, context)
    
    // Generate documentation
    const documentation = await devAssistant.generateDocumentation(code, context)
    
    // Track development activity
    analytics.trackDevelopmentActivity(userId, {
      projectId,
      codeAnalysis,
      improvements: aiSuggestions,
      testsGenerated: tests.tests.unit.length
    })

    return {
      codeAnalysis,
      aiSuggestions,
      tests,
      documentation,
      workflow: 'smart_development',
      timestamp: Date.now()
    }
  }

  // Utility methods
  calculateInitializationOrder() {
    const visited = new Set()
    const order = []
    
    const visit = (systemName) => {
      if (visited.has(systemName)) return
      
      const deps = this.dependencies.get(systemName) || []
      deps.forEach(dep => visit(dep))
      
      visited.add(systemName)
      order.push(systemName)
    }
    
    Array.from(this.dependencies.keys()).forEach(visit)
    return order
  }

  async checkSystemHealth(systemName, system) {
    try {
      const startTime = Date.now()
      
      // Basic health check
      const isResponding = typeof system === 'object' && system !== null
      
      // System-specific health checks
      let specificHealth = { status: 'unknown' }
      
      if (system.getHealthStatus) {
        specificHealth = await system.getHealthStatus()
      } else if (system.getStats) {
        const stats = await system.getStats()
        specificHealth = { status: 'healthy', stats }
      }
      
      const responseTime = Date.now() - startTime
      
      return {
        systemName,
        responding: isResponding,
        responseTime,
        status: specificHealth.status || (isResponding ? 'healthy' : 'unhealthy'),
        details: specificHealth,
        timestamp: Date.now()
      }
      
    } catch (error) {
      return {
        systemName,
        responding: false,
        status: 'error',
        error: error.message,
        timestamp: Date.now()
      }
    }
  }

  isCriticalSystem(systemName) {
    const criticalSystems = ['serviceFactory', 'security', 'analytics']
    return criticalSystems.includes(systemName)
  }

  setupInterSystemCommunication() {
    // Set up event-based communication between systems
    this.eventBus.subscribe('ai.*', (event) => {
      this.handleAIEvent(event)
    })
    
    this.eventBus.subscribe('security.*', (event) => {
      this.handleSecurityEvent(event)
    })
    
    this.eventBus.subscribe('performance.*', (event) => {
      this.handlePerformanceEvent(event)
    })
  }

  startSystemMonitoring() {
    // Monitor system health every 30 seconds
    setInterval(async () => {
      const status = await this.getSystemStatus()
      
      if (status.overall.status === 'poor') {
        this.eventBus.emit('master.health_alert', {
          severity: 'high',
          status,
          timestamp: Date.now()
        })
      }
    }, 30000)
  }

  startOptimizationRoutines() {
    // Run optimization every 5 minutes
    setInterval(async () => {
      await this.optimizeEnterpriseSystems()
    }, 300000)
  }

  getOptimizationResult(settledPromise) {
    if (settledPromise.status === 'fulfilled') {
      return settledPromise.value
    } else {
      return { error: settledPromise.reason.message }
    }
  }

  // Event handlers
  handleAIEvent(event) {
    // Route AI events to relevant systems
    if (event.type.includes('performance')) {
      const performance = this.systems.get('performance')
      if (performance) {
        performance.handleAIEvent?.(event)
      }
    }
  }

  handleSecurityEvent(event) {
    // Handle security events across systems
    if (event.type.includes('threat')) {
      this.eventBus.emit('master.security_alert', {
        severity: 'high',
        event,
        timestamp: Date.now()
      })
    }
  }

  handlePerformanceEvent(event) {
    // Handle performance events
    if (event.type.includes('degradation')) {
      const adaptiveUI = this.systems.get('adaptiveUI')
      if (adaptiveUI) {
        adaptiveUI.handlePerformanceDegradation?.(event)
      }
    }
  }
}

export { MasterOrchestrator }