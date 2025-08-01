/**
 * Configuration Manager
 * Centralized configuration management with environment-based overrides
 */
class ConfigManager {
  static config = {
    // API Configuration
    api: {
      baseURL: import.meta.env.VITE_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || 'http://localhost:8001',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      maxRetryDelay: 5000,
      endpoints: {
        auth: '/api/auth',
        projects: '/api/projects',
        ai: '/api/ai',
        templates: '/api/templates',
        integrations: '/api/integrations',
        agents: '/api/agents',
        enterprise: '/api/enterprise'
      }
    },

    // Cache Configuration
    cache: {
      defaultTTL: 300000, // 5 minutes
      maxMemoryEntries: 1000,
      cleanupInterval: 300000, // 5 minutes
      strategies: {
        aggressive: { ttl: 3600000, storage: 'both' }, // 1 hour
        standard: { ttl: 300000, storage: 'memory' }, // 5 minutes
        minimal: { ttl: 60000, storage: 'memory' } // 1 minute
      }
    },

    // Monitoring Configuration
    monitoring: {
      enabled: import.meta.env.NODE_ENV === 'production' || import.meta.env.VITE_ENABLE_MONITORING === 'true',
      sampleRate: parseFloat(import.meta.env.VITE_MONITORING_SAMPLE_RATE) || 0.1,
      maxEvents: 1000,
      flushInterval: 30000, // 30 seconds
      endpoints: {
        errors: '/api/monitoring/errors',
        performance: '/api/monitoring/performance',
        events: '/api/monitoring/events'
      }
    },

    // AI Configuration
    ai: {
      defaultModel: 'gpt-4o-mini',
      fallbackModels: ['claude-3-sonnet', 'gemini-2.5-flash'],
      maxContextLength: 10,
      responseTimeout: 45000,
      streamingEnabled: true,
      models: {
        'gpt-4o-mini': {
          maxTokens: 16384,
          temperature: 0.7,
          capabilities: ['chat', 'code', 'analysis']
        },
        'claude-3-sonnet': {
          maxTokens: 200000,
          temperature: 0.7,
          capabilities: ['chat', 'code', 'analysis', 'creative']
        },
        'gpt-4': {
          maxTokens: 8192,
          temperature: 0.7,
          capabilities: ['chat', 'code', 'analysis', 'reasoning']
        }
      }
    },

    // Performance Configuration
    performance: {
      enableServiceWorker: true,
      enableCodeSplitting: true,
      enableImageOptimization: true,
      lazyLoadThreshold: 100, // pixels
      virtualScrollThreshold: 1000, // items
      debounceDelay: 300, // ms
      throttleDelay: 100, // ms
      metrics: {
        trackPageViews: true,
        trackUserInteractions: true,
        trackAPIPerformance: true,
        trackErrorRates: true
      }
    },

    // Security Configuration
    security: {
      enableCSP: true,
      enableXSSProtection: true,
      maxFileUploadSize: 10 * 1024 * 1024, // 10MB
      allowedFileTypes: ['image/*', 'text/*', 'application/json'],
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
      tokenRefreshThreshold: 5 * 60 * 1000 // 5 minutes before expiry
    },

    // Feature Flags
    features: {
      enableAdvancedAI: import.meta.env.VITE_ENABLE_ADVANCED_AI === 'true',
      enableCollaboration: import.meta.env.VITE_ENABLE_COLLABORATION === 'true',
      enableEnterprise: import.meta.env.VITE_ENABLE_ENTERPRISE === 'true',
      enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
      enableExperimentalFeatures: import.meta.env.VITE_ENABLE_EXPERIMENTAL === 'true'
    },

    // UI Configuration
    ui: {
      theme: {
        default: 'system',
        enableThemeToggle: true,
        enableCustomThemes: false
      },
      animation: {
        enableAnimations: true,
        duration: 300,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
      },
      layout: {
        maxWidth: '1200px',
        sidebarWidth: '280px',
        headerHeight: '64px',
        footerHeight: '80px'
      },
      notifications: {
        position: 'top-right',
        duration: 4000,
        maxVisible: 3
      }
    },

    // Development Configuration
    development: {
      enableDebugMode: import.meta.env.NODE_ENV === 'development',
      enableMockData: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
      enablePerformancePanel: import.meta.env.VITE_ENABLE_PERF_PANEL === 'true',
      logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
      enableHotReload: true
    }
  }

  /**
   * Get configuration value using dot notation
   * @param {string} path - Configuration path (e.g., 'api.timeout')
   * @param {any} defaultValue - Default value if path not found
   * @returns {any} Configuration value
   */
  static get(path, defaultValue = null) {
    try {
      return path.split('.').reduce((obj, key) => {
        return obj && obj[key] !== undefined ? obj[key] : defaultValue
      }, this.config)
    } catch (error) {
      console.warn(`ConfigManager: Failed to get config for path "${path}"`, error)
      return defaultValue
    }
  }

  /**
   * Set configuration value using dot notation
   * @param {string} path - Configuration path
   * @param {any} value - Value to set
   */
  static set(path, value) {
    try {
      const keys = path.split('.')
      const lastKey = keys.pop()
      const target = keys.reduce((obj, key) => {
        if (!obj[key] || typeof obj[key] !== 'object') {
          obj[key] = {}
        }
        return obj[key]
      }, this.config)
      
      target[lastKey] = value
    } catch (error) {
      console.error(`ConfigManager: Failed to set config for path "${path}"`, error)
    }
  }

  /**
   * Check if a feature is enabled
   * @param {string} featureName - Feature name
   * @returns {boolean} True if feature is enabled
   */
  static isFeatureEnabled(featureName) {
    return this.get(`features.${featureName}`, false)
  }

  /**
   * Get API endpoint URL
   * @param {string} endpoint - Endpoint name
   * @returns {string} Full endpoint URL
   */
  static getApiEndpoint(endpoint) {
    const baseURL = this.get('api.baseURL')
    const endpointPath = this.get(`api.endpoints.${endpoint}`, `/${endpoint}`)
    return `${baseURL}${endpointPath}`
  }

  /**
   * Get environment-specific configuration
   * @returns {object} Environment configuration
   */
  static getEnvironmentConfig() {
    const env = import.meta.env.NODE_ENV || 'development'
    
    return {
      environment: env,
      isProduction: env === 'production',
      isDevelopment: env === 'development',
      isTest: env === 'test',
      baseURL: this.get('api.baseURL'),
      enableDebug: this.get('development.enableDebugMode'),
      enableMocking: this.get('development.enableMockData')
    }
  }

  /**
   * Validate configuration for required values
   * @returns {object} Validation results
   */
  static validateConfig() {
    const errors = []
    const warnings = []

    // Required configurations
    const required = [
      'api.baseURL',
      'api.timeout',
      'cache.defaultTTL'
    ]

    required.forEach(path => {
      if (this.get(path) === null || this.get(path) === undefined) {
        errors.push(`Missing required config: ${path}`)
      }
    })

    // Validate API URL format
    const apiURL = this.get('api.baseURL')
    if (apiURL && !apiURL.match(/^https?:\/\/.+/)) {
      warnings.push('API baseURL should include protocol (http:// or https://)')
    }

    // Validate timeout values
    const timeout = this.get('api.timeout')
    if (timeout && (timeout < 1000 || timeout > 120000)) {
      warnings.push('API timeout should be between 1 and 120 seconds')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Get runtime configuration info
   * @returns {object} Runtime configuration
   */
  static getRuntimeInfo() {
    return {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      language: typeof navigator !== 'undefined' ? navigator.language : null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString(),
      config: {
        environment: this.getEnvironmentConfig(),
        features: this.get('features'),
        performance: this.get('performance.metrics')
      }
    }
  }

  /**
   * Override configuration with runtime values
   * @param {object} overrides - Configuration overrides
   */
  static override(overrides) {
    try {
      this.config = this.deepMerge(this.config, overrides)
    } catch (error) {
      console.error('ConfigManager: Failed to apply overrides', error)
    }
  }

  /**
   * Reset configuration to defaults
   */
  static reset() {
    // Note: This would require storing original config
    console.warn('ConfigManager: Reset not implemented. Please refresh the page.')
  }

  // Private helper methods
  static deepMerge(target, source) {
    const result = { ...target }
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    }
    
    return result
  }
}

export { ConfigManager }