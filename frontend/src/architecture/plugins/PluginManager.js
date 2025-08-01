import { EventBus } from '../core/EventBus'
import { ConfigManager } from '../core/ConfigManager'
import { PerformanceMonitor } from '../core/PerformanceMonitor'

/**
 * Plugin Manager - Phase 4
 * Hot-pluggable extension system for unlimited scalability
 */
class PluginManager {
  constructor() {
    this.eventBus = EventBus.getInstance()
    this.performanceMonitor = PerformanceMonitor.getInstance()
    this.config = ConfigManager.get('plugins', {})
    
    this.plugins = new Map()
    this.hooks = new Map()
    this.uiComponents = new Map()
    this.apiExtensions = new Map()
    this.workflows = new Map()
    
    this.pluginState = new Map()
    this.dependencies = new Map()
    this.sandboxes = new Map()
    
    this.initializeManager()
  }

  async initializeManager() {
    // Set up plugin sandboxing
    this.setupSandboxing()
    
    // Load core plugins
    await this.loadCorePlugins()
    
    // Set up hot reload in development
    if (process.env.NODE_ENV === 'development') {
      this.setupHotReload()
    }
    
    console.log('🔌 PluginManager initialized')
    this.eventBus.emit('plugins.manager_initialized')
  }

  /**
   * Register a plugin with the system
   */
  async registerPlugin(pluginConfig) {
    try {
      // Validate plugin configuration
      this.validatePluginConfig(pluginConfig)
      
      // Check dependencies
      await this.checkDependencies(pluginConfig)
      
      // Create plugin sandbox
      const sandbox = this.createPluginSandbox(pluginConfig)
      
      // Initialize plugin
      const plugin = await this.initializePlugin(pluginConfig, sandbox)
      
      // Register plugin components
      this.registerPluginHooks(plugin)
      this.registerPluginUI(plugin)
      this.registerPluginAPI(plugin)
      this.registerPluginWorkflows(plugin)
      
      // Store plugin
      this.plugins.set(plugin.id, plugin)
      this.sandboxes.set(plugin.id, sandbox)
      
      // Update plugin state
      this.updatePluginState(plugin.id, 'active')
      
      // Emit registration event
      this.eventBus.emit('plugins.registered', {
        plugin: plugin.metadata,
        timestamp: Date.now()
      })
      
      console.log(`✅ Plugin registered: ${plugin.metadata.name} v${plugin.metadata.version}`)
      
      return plugin.id
      
    } catch (error) {
      console.error('Failed to register plugin:', error)
      this.eventBus.emit('plugins.registration_failed', {
        plugin: pluginConfig.metadata?.name,
        error: error.message
      })
      throw error
    }
  }

  /**
   * Unregister plugin
   */
  async unregisterPlugin(pluginId) {
    try {
      const plugin = this.plugins.get(pluginId)
      if (!plugin) {
        throw new Error(`Plugin ${pluginId} not found`)
      }
      
      // Call plugin cleanup
      if (plugin.cleanup) {
        await plugin.cleanup()
      }
      
      // Remove plugin hooks
      this.unregisterPluginHooks(pluginId)
      this.unregisterPluginUI(pluginId)
      this.unregisterPluginAPI(pluginId)
      this.unregisterPluginWorkflows(pluginId)
      
      // Destroy sandbox
      this.destroyPluginSandbox(pluginId)
      
      // Remove from registry
      this.plugins.delete(pluginId)
      this.sandboxes.delete(pluginId)
      this.pluginState.delete(pluginId)
      
      this.eventBus.emit('plugins.unregistered', {
        pluginId,
        timestamp: Date.now()
      })
      
      console.log(`❌ Plugin unregistered: ${pluginId}`)
      
    } catch (error) {
      console.error('Failed to unregister plugin:', error)
      throw error
    }
  }

  /**
   * Execute plugin hook
   */
  async executeHook(hookName, data = {}, options = {}) {
    const hooks = this.hooks.get(hookName) || []
    const results = []
    
    const {
      parallel = false,
      timeout = 5000,
      continueOnError = true
    } = options
    
    if (parallel) {
      // Execute hooks in parallel
      const promises = hooks.map(async hook => {
        try {
          return await this.executeHookWithTimeout(hook, data, timeout)
        } catch (error) {
          if (continueOnError) {
            console.warn(`Hook ${hookName} failed for plugin ${hook.pluginId}:`, error)
            return { error: error.message, pluginId: hook.pluginId }
          }
          throw error
        }
      })
      
      const settled = await Promise.allSettled(promises)
      results.push(...settled.map(result => 
        result.status === 'fulfilled' ? result.value : { error: result.reason }
      ))
      
    } else {
      // Execute hooks sequentially
      let currentData = data
      
      for (const hook of hooks) {
        try {
          const result = await this.executeHookWithTimeout(hook, currentData, timeout)
          results.push(result)
          
          // Allow hooks to transform data for next hook
          if (result && typeof result === 'object' && !result.error) {
            currentData = { ...currentData, ...result }
          }
          
        } catch (error) {
          if (continueOnError) {
            console.warn(`Hook ${hookName} failed for plugin ${hook.pluginId}:`, error)
            results.push({ error: error.message, pluginId: hook.pluginId })
          } else {
            throw error
          }
        }
      }
    }
    
    // Emit hook execution event
    this.eventBus.emit('plugins.hook_executed', {
      hookName,
      results,
      pluginsInvolved: hooks.map(h => h.pluginId),
      timestamp: Date.now()
    })
    
    return results
  }

  /**
   * Render plugin UI components for specific location
   */
  renderPluginUI(location, context = {}) {
    const components = this.uiComponents.get(location) || []
    
    return components
      .filter(comp => this.isPluginActive(comp.pluginId))
      .filter(comp => this.shouldRenderComponent(comp, context))
      .map(comp => {
        try {
          return {
            id: `plugin-ui-${comp.pluginId}-${comp.id}`,
            pluginId: comp.pluginId,
            component: comp.render(context),
            metadata: comp.metadata
          }
        } catch (error) {
          console.error(`Failed to render UI component for plugin ${comp.pluginId}:`, error)
          return {
            id: `plugin-error-${comp.pluginId}`,
            pluginId: comp.pluginId,
            component: this.renderErrorComponent(error, comp),
            metadata: { error: true }
          }
        }
      })
  }

  /**
   * Execute plugin API extension
   */
  async executeAPIExtension(endpoint, method, data, context) {
    const extensions = this.apiExtensions.get(`${method}:${endpoint}`) || []
    
    for (const extension of extensions) {
      if (this.isPluginActive(extension.pluginId)) {
        try {
          const result = await extension.handler(data, context)
          if (result !== undefined) {
            return result
          }
        } catch (error) {
          console.error(`API extension failed for plugin ${extension.pluginId}:`, error)
          // Continue to next extension
        }
      }
    }
    
    return null
  }

  /**
   * Execute workflow
   */
  async executeWorkflow(workflowId, data = {}, options = {}) {
    const workflow = this.workflows.get(workflowId)
    if (!workflow || !this.isPluginActive(workflow.pluginId)) {
      throw new Error(`Workflow ${workflowId} not found or inactive`)
    }
    
    try {
      const startTime = Date.now()
      
      // Execute workflow steps
      const result = await this.executeWorkflowSteps(workflow, data, options)
      
      const duration = Date.now() - startTime
      
      // Track performance
      this.performanceMonitor.trackCustomMetric('plugin_workflow_duration', duration, {
        workflowId,
        pluginId: workflow.pluginId,
        steps: workflow.steps.length
      })
      
      this.eventBus.emit('plugins.workflow_executed', {
        workflowId,
        pluginId: workflow.pluginId,
        duration,
        result,
        timestamp: Date.now()
      })
      
      return result
      
    } catch (error) {
      this.eventBus.emit('plugins.workflow_failed', {
        workflowId,
        pluginId: workflow.pluginId,
        error: error.message,
        timestamp: Date.now()
      })
      throw error
    }
  }

  /**
   * Plugin marketplace and discovery
   */
  async discoverPlugins(query = {}) {
    const {
      category,
      tags,
      search,
      author,
      rating,
      featured
    } = query
    
    // In production, this would query a plugin marketplace API
    const mockPlugins = [
      {
        id: 'slack-integration',
        name: 'Slack Integration',
        description: 'Send notifications and share projects to Slack',
        version: '1.2.0',
        author: 'AI Tempo Team',
        category: 'communication',
        tags: ['slack', 'notifications', 'sharing'],
        rating: 4.8,
        downloads: 15420,
        featured: true,
        screenshots: ['/plugins/slack/screenshot1.png'],
        readme: 'https://github.com/ai-tempo/plugin-slack/blob/main/README.md'
      },
      {
        id: 'github-sync',
        name: 'GitHub Sync',
        description: 'Synchronize projects with GitHub repositories',
        version: '2.1.0',
        author: 'Community',
        category: 'version-control',
        tags: ['github', 'git', 'sync', 'backup'],
        rating: 4.6,
        downloads: 8930,
        featured: false
      },
      {
        id: 'ai-code-review',
        name: 'AI Code Review',
        description: 'Automated code review with AI suggestions',
        version: '1.0.5',
        author: 'DevTools Inc',
        category: 'ai-tools',
        tags: ['ai', 'code-review', 'quality', 'suggestions'],
        rating: 4.9,
        downloads: 23100,
        featured: true
      }
    ]
    
    // Filter plugins based on query
    let filtered = mockPlugins
    
    if (category) {
      filtered = filtered.filter(p => p.category === category)
    }
    
    if (tags && tags.length > 0) {
      filtered = filtered.filter(p => 
        tags.some(tag => p.tags.includes(tag))
      )
    }
    
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.tags.some(tag => tag.includes(searchLower))
      )
    }
    
    if (author) {
      filtered = filtered.filter(p => p.author === author)
    }
    
    if (rating) {
      filtered = filtered.filter(p => p.rating >= rating)
    }
    
    if (featured) {
      filtered = filtered.filter(p => p.featured)
    }
    
    return {
      plugins: filtered,
      total: filtered.length,
      query,
      timestamp: Date.now()
    }
  }

  /**
   * Install plugin from marketplace
   */
  async installPlugin(pluginId, version = 'latest') {
    try {
      // Download plugin package
      const pluginPackage = await this.downloadPlugin(pluginId, version)
      
      // Verify plugin signature
      await this.verifyPluginSignature(pluginPackage)
      
      // Install dependencies
      await this.installPluginDependencies(pluginPackage)
      
      // Register plugin
      const registeredId = await this.registerPlugin(pluginPackage)
      
      this.eventBus.emit('plugins.installed', {
        pluginId: registeredId,
        marketplace: { pluginId, version },
        timestamp: Date.now()
      })
      
      return registeredId
      
    } catch (error) {
      console.error('Failed to install plugin:', error)
      this.eventBus.emit('plugins.installation_failed', {
        pluginId,
        version,
        error: error.message
      })
      throw error
    }
  }

  // Core plugin implementations
  getCorePlugins() {
    return [
      {
        id: 'core-notifications',
        metadata: {
          name: 'Core Notifications',
          version: '1.0.0',
          description: 'Built-in notification system',
          author: 'AI Tempo'
        },
        hooks: {
          'project.created': async (data) => {
            return { notification: `Project "${data.project.name}" created successfully!` }
          },
          'ai.response.generated': async (data) => {
            if (data.duration > 10000) {
              return { notification: 'AI response took longer than expected' }
            }
          }
        },
        ui: {
          'notification-center': {
            render: (context) => `<div class="notification">${context.message}</div>`
          }
        }
      },
      {
        id: 'core-analytics',
        metadata: {
          name: 'Core Analytics',
          version: '1.0.0',
          description: 'Built-in analytics tracking',
          author: 'AI Tempo'
        },
        hooks: {
          'user.action': async (data) => {
            // Track user actions
            console.log('Analytics:', data)
            return { tracked: true }
          }
        },
        workflows: {
          'track-user-journey': {
            steps: [
              { action: 'capture-event' },
              { action: 'enrich-data' },
              { action: 'store-analytics' }
            ]
          }
        }
      },
      {
        id: 'core-performance',
        metadata: {
          name: 'Core Performance Monitor',
          version: '1.0.0',
          description: 'Built-in performance monitoring',
          author: 'AI Tempo'
        },
        hooks: {
          'api.request.start': async (data) => {
            return { startTime: Date.now() }
          },
          'api.request.end': async (data) => {
            const duration = Date.now() - data.startTime
            if (duration > 5000) {
              return { alert: 'Slow API request detected' }
            }
          }
        }
      }
    ]
  }

  // Plugin sandbox and security
  createPluginSandbox(pluginConfig) {
    const sandbox = {
      id: pluginConfig.id || `plugin_${Date.now()}`,
      
      // Limited API access
      api: {
        eventBus: {
          emit: (event, data) => this.eventBus.emit(`plugin.${sandbox.id}.${event}`, data),
          subscribe: (event, handler) => this.eventBus.subscribe(`plugin.${sandbox.id}.${event}`, handler)
        },
        
        storage: {
          get: (key) => this.getPluginStorage(sandbox.id, key),
          set: (key, value) => this.setPluginStorage(sandbox.id, key, value),
          delete: (key) => this.deletePluginStorage(sandbox.id, key)
        },
        
        http: {
          request: async (options) => this.makePluginHTTPRequest(sandbox.id, options)
        },
        
        ui: {
          showNotification: (message, type) => this.eventBus.emit('notifications.show', { message, type }),
          showModal: (content) => this.eventBus.emit('ui.modal.show', { content })
        }
      },
      
      // Resource limits
      limits: {
        memory: 50 * 1024 * 1024, // 50MB
        cpu: 100, // 100ms max execution time
        storage: 10 * 1024 * 1024, // 10MB storage
        network: 1000 // 1000 requests per hour
      },
      
      // Security context
      permissions: pluginConfig.permissions || [],
      
      // Resource usage tracking
      usage: {
        memory: 0,
        cpu: 0,
        storage: 0,
        network: 0
      }
    }
    
    return sandbox
  }

  // Plugin management utilities
  getPluginStatus(pluginId) {
    const plugin = this.plugins.get(pluginId)
    const sandbox = this.sandboxes.get(pluginId)
    
    if (!plugin) {
      return { status: 'not_found' }
    }
    
    return {
      status: this.pluginState.get(pluginId) || 'unknown',
      metadata: plugin.metadata,
      usage: sandbox?.usage,
      health: this.checkPluginHealth(pluginId),
      lastActivity: plugin.lastActivity
    }
  }

  getAllPlugins() {
    const plugins = []
    
    this.plugins.forEach((plugin, id) => {
      plugins.push({
        id,
        ...this.getPluginStatus(id)
      })
    })
    
    return plugins
  }

  getPluginAnalytics() {
    return {
      totalPlugins: this.plugins.size,
      activePlugins: Array.from(this.pluginState.values()).filter(state => state === 'active').length,
      hookExecutions: this.getHookExecutionStats(),
      performance: this.getPluginPerformanceStats(),
      errors: this.getPluginErrors()
    }
  }

  // Plugin development utilities
  createPluginTemplate(type = 'basic') {
    const templates = {
      basic: {
        id: 'my-plugin',
        metadata: {
          name: 'My Plugin',
          version: '1.0.0',
          description: 'A basic plugin template',
          author: 'Your Name'
        },
        hooks: {
          'example.hook': async (data) => {
            console.log('Hook executed:', data)
            return { success: true }
          }
        },
        initialize: async (sandbox) => {
          console.log('Plugin initialized')
        },
        cleanup: async () => {
          console.log('Plugin cleanup')
        }
      },
      
      ui: {
        id: 'my-ui-plugin',
        metadata: {
          name: 'My UI Plugin',
          version: '1.0.0',
          description: 'A plugin with UI components',
          author: 'Your Name'
        },
        ui: {
          'sidebar': {
            render: (context) => `
              <div class="plugin-widget">
                <h3>My Plugin Widget</h3>
                <p>Context: ${JSON.stringify(context)}</p>
              </div>
            `
          }
        }
      },
      
      workflow: {
        id: 'my-workflow-plugin',
        metadata: {
          name: 'My Workflow Plugin',
          version: '1.0.0',
          description: 'A plugin with custom workflows',
          author: 'Your Name'
        },
        workflows: {
          'my-workflow': {
            name: 'My Custom Workflow',
            description: 'Automates a custom process',
            steps: [
              { action: 'validate-input' },
              { action: 'process-data' },
              { action: 'generate-output' }
            ]
          }
        }
      }
    }
    
    return templates[type] || templates.basic
  }
}

export { PluginManager }