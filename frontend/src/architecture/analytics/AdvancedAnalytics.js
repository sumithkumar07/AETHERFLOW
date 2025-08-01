import { EventBus } from '../core/EventBus'
import { CacheManager } from '../core/CacheManager'
import { ConfigManager } from '../core/ConfigManager'
import { PerformanceMonitor } from '../core/PerformanceMonitor'

/**
 * Advanced Analytics & Business Intelligence - Phase 5
 * Real-time analytics, predictive insights, and business intelligence
 */
class AdvancedAnalytics {
  constructor() {
    this.eventBus = EventBus.getInstance()
    this.cache = CacheManager.getInstance()
    this.performanceMonitor = PerformanceMonitor.getInstance()
    this.config = ConfigManager.get('analytics', {})
    
    // Data stores
    this.userSessions = new Map()
    this.userJourneys = new Map()
    this.featureUsage = new Map()
    this.conversionFunnels = new Map()
    this.cohortData = new Map()
    this.experimentData = new Map()
    
    // ML Models for predictions
    this.churnPredictionModel = null
    this.recommendationEngine = null
    this.anomalyDetector = null
    
    // Real-time data streams
    this.liveMetrics = new Map()
    this.realtimeConnections = new Set()
    
    this.initialize()
  }

  async initialize() {
    // Set up event listeners
    this.setupEventListeners()
    
    // Initialize ML models
    await this.initializeMLModels()
    
    // Set up real-time processing
    this.startRealtimeProcessing()
    
    // Load historical data
    await this.loadHistoricalData()
    
    console.log('📊 AdvancedAnalytics initialized')
    this.eventBus.emit('analytics.initialized')
  }

  /**
   * Track comprehensive user journey
   */
  trackUserJourney(userId, event, context = {}) {
    const sessionId = this.getOrCreateSession(userId)
    const journey = this.userJourneys.get(userId) || []
    
    const journeyEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      sessionId,
      event,
      context,
      timestamp: Date.now(),
      page: context.page || window.location.pathname,
      referrer: context.referrer || document.referrer,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      sessionTime: this.getSessionDuration(sessionId)
    }
    
    // Add to journey
    journey.push(journeyEvent)
    this.userJourneys.set(userId, journey)
    
    // Update live metrics
    this.updateLiveMetrics('user_events', 1)
    
    // Emit for real-time processing
    this.eventBus.emit('analytics.journey_event', journeyEvent)
    
    // Check for significant events
    this.checkForSignificantEvents(userId, journeyEvent)
    
    return journeyEvent
  }

  /**
   * Advanced feature usage tracking
   */
  trackFeatureUsage(userId, featureName, action, metadata = {}) {
    const featureKey = `${featureName}:${action}`
    const usage = this.featureUsage.get(featureKey) || {
      feature: featureName,
      action,
      totalUses: 0,
      uniqueUsers: new Set(),
      averageDuration: 0,
      successRate: 0,
      errorRate: 0,
      firstSeen: Date.now(),
      lastSeen: null,
      userSegments: new Map(),
      timeDistribution: new Array(24).fill(0),
      dayDistribution: new Array(7).fill(0)
    }
    
    // Update usage metrics
    usage.totalUses++
    usage.uniqueUsers.add(userId)
    usage.lastSeen = Date.now()
    
    // Update time distributions
    const hour = new Date().getHours()
    const day = new Date().getDay()
    usage.timeDistribution[hour]++
    usage.dayDistribution[day]++
    
    // Track by user segment
    const userSegment = this.getUserSegment(userId)
    const segmentCount = usage.userSegments.get(userSegment) || 0
    usage.userSegments.set(userSegment, segmentCount + 1)
    
    // Track success/error rates
    if (metadata.success === true) {
      usage.successRate = (usage.successRate + 1) / 2
    } else if (metadata.success === false) {
      usage.errorRate = (usage.errorRate + 1) / 2
    }
    
    // Track duration
    if (metadata.duration) {
      usage.averageDuration = (usage.averageDuration + metadata.duration) / 2
    }
    
    this.featureUsage.set(featureKey, usage)
    
    // Emit analytics event
    this.eventBus.emit('analytics.feature_used', {
      userId,
      feature: featureName,
      action,
      metadata,
      usage: this.sanitizeUsageData(usage)
    })
    
    return usage
  }

  /**
   * Predictive churn analysis
   */
  async predictUserChurn(userId) {
    try {
      const userFeatures = await this.extractUserFeatures(userId)
      
      if (!this.churnPredictionModel) {
        // Initialize simple churn model
        this.churnPredictionModel = this.createChurnModel()
      }
      
      const churnProbability = this.churnPredictionModel.predict(userFeatures)
      const riskLevel = this.calculateRiskLevel(churnProbability)
      const recommendations = this.generateRetentionRecommendations(userFeatures, churnProbability)
      
      const prediction = {
        userId,
        churnProbability,
        riskLevel,
        recommendations,
        features: userFeatures,
        timestamp: Date.now(),
        modelVersion: this.churnPredictionModel.version
      }
      
      // Cache prediction
      await this.cache.set(`churn_prediction:${userId}`, prediction, 86400000) // 24 hours
      
      // Emit prediction event
      this.eventBus.emit('analytics.churn_predicted', prediction)
      
      return prediction
      
    } catch (error) {
      console.error('Churn prediction failed:', error)
      return {
        userId,
        error: error.message,
        timestamp: Date.now()
      }
    }
  }

  /**
   * Smart recommendation engine
   */
  async getPersonalizedRecommendations(userId, type = 'all') {
    try {
      const userProfile = await this.buildUserProfile(userId)
      const recommendations = {}
      
      if (type === 'all' || type === 'templates') {
        recommendations.templates = await this.recommendTemplates(userProfile)
      }
      
      if (type === 'all' || type === 'integrations') {
        recommendations.integrations = await this.recommendIntegrations(userProfile)
      }
      
      if (type === 'all' || type === 'features') {
        recommendations.features = await this.recommendFeatures(userProfile)
      }
      
      if (type === 'all' || type === 'content') {
        recommendations.content = await this.recommendContent(userProfile)
      }
      
      if (type === 'all' || type === 'optimizations') {
        recommendations.optimizations = await this.identifyOptimizations(userProfile)
      }
      
      // Cache recommendations
      await this.cache.set(`recommendations:${userId}:${type}`, recommendations, 3600000) // 1 hour
      
      this.eventBus.emit('analytics.recommendations_generated', {
        userId,
        type,
        recommendations,
        profile: this.sanitizeUserProfile(userProfile)
      })
      
      return recommendations
      
    } catch (error) {
      console.error('Recommendation generation failed:', error)
      return { error: error.message }
    }
  }

  /**
   * A/B Testing framework
   */
  async getExperiment(experimentName, userId, defaultVariant = 'control') {
    try {
      const experiment = await this.getExperimentConfig(experimentName)
      
      if (!experiment || !experiment.active) {
        return { variant: defaultVariant, experiment: null }
      }
      
      // Check if user is in experiment
      const userSegment = this.getUserSegment(userId)
      if (!this.isUserEligible(userId, userSegment, experiment)) {
        return { variant: defaultVariant, experiment: null }
      }
      
      // Get or assign variant
      let variant = await this.getUserVariant(experimentName, userId)
      
      if (!variant) {
        variant = this.assignVariant(experiment, userId, userSegment)
        await this.storeUserVariant(experimentName, userId, variant)
      }
      
      // Track experiment exposure
      this.trackExperimentExposure(experimentName, userId, variant)
      
      return {
        variant,
        experiment: {
          name: experimentName,
          id: experiment.id,
          description: experiment.description
        }
      }
      
    } catch (error) {
      console.error('Experiment assignment failed:', error)
      return { variant: defaultVariant, experiment: null, error: error.message }
    }
  }

  /**
   * Conversion funnel analysis
   */
  trackConversionStep(userId, funnelName, step, metadata = {}) {
    const funnelKey = `${funnelName}:${userId}`
    const funnel = this.conversionFunnels.get(funnelKey) || {
      funnelName,
      userId,
      steps: [],
      startTime: Date.now(),
      currentStep: null,
      completed: false,
      abandoned: false
    }
    
    const stepData = {
      step,
      timestamp: Date.now(),
      metadata,
      timeFromStart: Date.now() - funnel.startTime,
      timeFromPrevious: funnel.steps.length > 0 ? 
        Date.now() - funnel.steps[funnel.steps.length - 1].timestamp : 0
    }
    
    funnel.steps.push(stepData)
    funnel.currentStep = step
    
    // Check if funnel is completed
    const funnelConfig = this.getFunnelConfig(funnelName)
    if (funnelConfig && step === funnelConfig.finalStep) {
      funnel.completed = true
      funnel.completionTime = Date.now() - funnel.startTime
    }
    
    this.conversionFunnels.set(funnelKey, funnel)
    
    // Update funnel analytics
    this.updateFunnelAnalytics(funnelName, step, stepData)
    
    this.eventBus.emit('analytics.conversion_step', {
      funnelName,
      userId,
      step,
      funnel: funnel,
      metadata
    })
    
    return funnel
  }

  /**
   * Cohort analysis
   */
  async getCohortAnalysis(cohortType = 'weekly', metric = 'retention') {
    try {
      const cohorts = await this.generateCohorts(cohortType)
      const analysis = {}
      
      for (const [cohortId, cohort] of cohorts) {
        analysis[cohortId] = await this.analyzeCohort(cohort, metric)
      }
      
      return {
        cohortType,
        metric,
        cohorts: analysis,
        summary: this.generateCohortSummary(analysis),
        timestamp: Date.now()
      }
      
    } catch (error) {
      console.error('Cohort analysis failed:', error)
      return { error: error.message }
    }
  }

  /**
   * Real-time analytics dashboard data
   */
  getLiveAnalytics() {
    const now = Date.now()
    const last24h = now - 86400000
    const last7d = now - 604800000
    
    return {
      realtime: {
        activeUsers: this.getActiveUsers(300000), // Last 5 minutes
        currentSessions: this.userSessions.size,
        eventsPerMinute: this.getEventsPerMinute(),
        topPages: this.getTopPages(3600000), // Last hour
        topEvents: this.getTopEvents(3600000)
      },
      
      today: {
        pageViews: this.getPageViews(last24h),
        uniqueUsers: this.getUniqueUsers(last24h),
        averageSessionDuration: this.getAverageSessionDuration(last24h),
        bounceRate: this.getBounceRate(last24h),
        conversions: this.getConversions(last24h)
      },
      
      week: {
        users: this.getUniqueUsers(last7d),
        sessions: this.getSessionCount(last7d),
        pageViews: this.getPageViews(last7d),
        averageEngagement: this.getAverageEngagement(last7d),
        topFeatures: this.getTopFeatures(last7d)
      },
      
      performance: this.performanceMonitor.getPerformanceSummary(),
      
      timestamp: now
    }
  }

  /**
   * Anomaly detection
   */
  async detectAnomalies(metric, timeWindow = 3600000) {
    try {
      const data = await this.getMetricData(metric, timeWindow)
      
      if (!this.anomalyDetector) {
        this.anomalyDetector = this.createAnomalyDetector()
      }
      
      const anomalies = this.anomalyDetector.detect(data)
      
      // Alert on significant anomalies
      for (const anomaly of anomalies) {
        if (anomaly.severity > 0.8) {
          this.eventBus.emit('analytics.anomaly_detected', {
            metric,
            anomaly,
            timestamp: Date.now()
          })
        }
      }
      
      return anomalies
      
    } catch (error) {
      console.error('Anomaly detection failed:', error)
      return []
    }
  }

  /**
   * Export analytics data
   */
  async exportData(format = 'json', dateRange = {}, filters = {}) {
    try {
      const { startDate, endDate } = dateRange
      
      const data = {
        userJourneys: this.filterUserJourneys(startDate, endDate, filters),
        featureUsage: this.filterFeatureUsage(startDate, endDate, filters),
        conversionFunnels: this.filterConversionFunnels(startDate, endDate, filters),
        experiments: this.filterExperiments(startDate, endDate, filters),
        cohorts: await this.getCohortAnalysis('weekly'),
        summary: this.generateExportSummary(startDate, endDate, filters)
      }
      
      if (format === 'csv') {
        return this.convertToCSV(data)
      } else if (format === 'xlsx') {
        return this.convertToExcel(data)
      }
      
      return JSON.stringify(data, null, 2)
      
    } catch (error) {
      console.error('Data export failed:', error)
      throw error
    }
  }

  // Machine Learning Models
  createChurnModel() {
    return {
      version: '1.0.0',
      
      predict: (features) => {
        // Simplified churn prediction model
        let score = 0
        
        // Days since last login
        if (features.daysSinceLastLogin > 7) score += 0.3
        if (features.daysSinceLastLogin > 14) score += 0.2
        if (features.daysSinceLastLogin > 30) score += 0.3
        
        // Session frequency
        if (features.averageSessionsPerWeek < 2) score += 0.2
        if (features.averageSessionsPerWeek < 1) score += 0.2
        
        // Feature engagement
        if (features.featuresUsedCount < 3) score += 0.1
        if (features.featuresUsedCount < 2) score += 0.1
        
        // Project activity
        if (features.projectsCreated === 0) score += 0.2
        if (features.daysSinceLastProject > 14) score += 0.1
        
        // Support interactions
        if (features.supportTickets > 2) score += 0.1
        
        return Math.min(score, 1.0)
      }
    }
  }

  createAnomalyDetector() {
    return {
      detect: (data) => {
        const anomalies = []
        
        if (data.length < 10) return anomalies
        
        // Calculate statistical measures
        const mean = data.reduce((sum, val) => sum + val, 0) / data.length
        const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
        const stdDev = Math.sqrt(variance)
        
        // Detect outliers using z-score
        data.forEach((value, index) => {
          const zScore = Math.abs((value - mean) / stdDev)
          
          if (zScore > 2.5) { // 2.5 standard deviations
            anomalies.push({
              index,
              value,
              expected: mean,
              deviation: zScore,
              severity: Math.min(zScore / 3, 1),
              type: value > mean ? 'spike' : 'drop'
            })
          }
        })
        
        return anomalies
      }
    }
  }

  // Utility methods
  getUserSegment(userId) {
    // Simple user segmentation logic
    const user = this.getUserData(userId)
    
    if (!user) return 'unknown'
    
    if (user.isPremium) return 'premium'
    if (user.projectsCount > 10) return 'power_user'
    if (user.daysSinceSignup < 7) return 'new_user'
    if (user.daysSinceSignup < 30) return 'recent_user'
    
    return 'regular_user'
  }

  sanitizeUsageData(usage) {
    return {
      ...usage,
      uniqueUsers: usage.uniqueUsers.size,
      userSegments: Object.fromEntries(usage.userSegments)
    }
  }

  sanitizeUserProfile(profile) {
    // Remove sensitive data before emitting
    const { email, personalInfo, ...safe } = profile
    return safe
  }
}

export { AdvancedAnalytics }