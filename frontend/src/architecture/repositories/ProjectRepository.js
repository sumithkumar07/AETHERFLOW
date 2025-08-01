import { BaseRepository } from './BaseRepository'

/**
 * Project Repository
 * Handles project-specific data access and business logic
 */
class ProjectRepository extends BaseRepository {
  constructor() {
    super('projects', {
      cacheStrategy: 'projects',
      cacheTTL: 300000, // 5 minutes
      enableCache: true,
      enableEvents: true
    })
  }

  /**
   * Find projects by user ID
   * @param {string} userId - User ID
   * @param {object} options - Query options
   * @returns {Promise<array>} User's projects
   */
  async findByUserId(userId, options = {}) {
    if (!userId) {
      throw new Error('User ID is required')
    }

    return this.findAll({
      filters: { user_id: userId },
      ...options
    })
  }

  /**
   * Find projects by technology stack
   * @param {string|array} techStack - Technology stack(s)
   * @param {object} options - Query options
   * @returns {Promise<array>} Projects using the tech stack
   */
  async findByTechStack(techStack, options = {}) {
    const stackArray = Array.isArray(techStack) ? techStack : [techStack]
    
    return this.findAll({
      filters: { tech_stack: stackArray.join(',') },
      ...options
    })
  }

  /**
   * Find projects by status
   * @param {string} status - Project status
   * @param {object} options - Query options
   * @returns {Promise<array>} Projects with the specified status
   */
  async findByStatus(status, options = {}) {
    return this.findAll({
      filters: { status },
      ...options
    })
  }

  /**
   * Find recent projects
   * @param {number} days - Number of days to look back
   * @param {object} options - Query options
   * @returns {Promise<array>} Recent projects
   */
  async findRecent(days = 7, options = {}) {
    const since = new Date()
    since.setDate(since.getDate() - days)

    return this.findAll({
      filters: { created_since: since.toISOString() },
      sort: { created_at: 'desc' },
      ...options
    })
  }

  /**
   * Search projects by name or description
   * @param {string} query - Search query
   * @param {object} options - Query options
   * @returns {Promise<array>} Matching projects
   */
  async search(query, options = {}) {
    if (!query || query.trim().length === 0) {
      return []
    }

    return this.findAll({
      filters: { search: query.trim() },
      ...options
    })
  }

  /**
   * Get project statistics
   * @param {string} userId - User ID (optional)
   * @returns {Promise<object>} Project statistics
   */
  async getStatistics(userId = null) {
    try {
      const endpoint = userId ? `/statistics?user_id=${userId}` : '/statistics'
      
      const stats = await this.query(endpoint, {
        cache: true,
        cacheTTL: 600000 // 10 minutes
      })

      return this.enrichStatistics(stats)

    } catch (error) {
      this.handleError('getStatistics', error, { userId })
      throw error
    }
  }

  /**
   * Clone project
   * @param {string} projectId - Project ID to clone
   * @param {object} overrides - Project property overrides
   * @returns {Promise<object>} Cloned project
   */
  async clone(projectId, overrides = {}) {
    if (!projectId) {
      throw new Error('Project ID is required')
    }

    try {
      const result = await this.apiGateway.post(`${this.config.baseEndpoint}/${projectId}/clone`, overrides, {
        retryAttempts: this.config.retryAttempts
      })

      const enrichedResult = this.enrichItem(result)

      // Invalidate cache
      if (this.config.enableCache) {
        await this.invalidateCache()
      }

      // Emit events
      if (this.config.enableEvents) {
        this.eventBus.emit('projects.cloned', {
          originalId: projectId,
          clonedProject: enrichedResult,
          timestamp: Date.now()
        })
      }

      return enrichedResult

    } catch (error) {
      this.handleError('clone', error, { projectId, overrides })
      throw error
    }
  }

  /**
   * Deploy project
   * @param {string} projectId - Project ID
   * @param {object} deploymentConfig - Deployment configuration
   * @returns {Promise<object>} Deployment result
   */
  async deploy(projectId, deploymentConfig = {}) {
    if (!projectId) {
      throw new Error('Project ID is required')
    }

    try {
      const result = await this.apiGateway.post(`${this.config.baseEndpoint}/${projectId}/deploy`, deploymentConfig, {
        retryAttempts: 1, // Deployment should not be retried automatically
        timeout: 120000 // 2 minutes timeout for deployment
      })

      // Emit events
      if (this.config.enableEvents) {
        this.eventBus.emit('projects.deployed', {
          projectId,
          deploymentConfig,
          result,
          timestamp: Date.now()
        })
      }

      return result

    } catch (error) {
      this.handleError('deploy', error, { projectId, deploymentConfig })
      throw error
    }
  }

  /**
   * Get project files
   * @param {string} projectId - Project ID
   * @param {object} options - Query options
   * @returns {Promise<array>} Project files
   */
  async getFiles(projectId, options = {}) {
    if (!projectId) {
      throw new Error('Project ID is required')
    }

    try {
      const files = await this.query(`${projectId}/files`, {
        cache: true,
        cacheTTL: 60000, // 1 minute (files change frequently)
        ...options
      })

      return files.map(file => this.enrichFile(file))

    } catch (error) {
      this.handleError('getFiles', error, { projectId })
      throw error
    }
  }

  /**
   * Update project file
   * @param {string} projectId - Project ID
   * @param {string} filePath - File path
   * @param {string} content - File content
   * @param {object} options - Request options
   * @returns {Promise<object>} Updated file
   */
  async updateFile(projectId, filePath, content, options = {}) {
    if (!projectId || !filePath || content === undefined) {
      throw new Error('Project ID, file path, and content are required')
    }

    try {
      const result = await this.apiGateway.put(`${this.config.baseEndpoint}/${projectId}/files`, {
        path: filePath,
        content
      }, {
        retryAttempts: this.config.retryAttempts,
        ...options
      })

      // Invalidate file cache
      if (this.config.enableCache) {
        await this.cache.invalidatePattern(`*${this.config.baseEndpoint}/${projectId}/files*`)
      }

      // Emit events
      if (this.config.enableEvents) {
        this.eventBus.emit('projects.file_updated', {
          projectId,
          filePath,
          timestamp: Date.now()
        })
      }

      return this.enrichFile(result)

    } catch (error) {
      this.handleError('updateFile', error, { projectId, filePath })
      throw error
    }
  }

  // Override base methods for project-specific logic

  addCustomEnrichments(project) {
    return {
      // Project-specific computed properties
      displayName: this.formatProjectName(project),
      statusColor: this.getStatusColor(project.status),
      isRecent: this.isRecentProject(project.created_at),
      progressPercentage: this.calculateProgress(project),
      estimatedCompletion: this.estimateCompletion(project),
      techStackList: this.parseTechStack(project.tech_stack),
      canDeploy: this.canDeploy(project),
      hasFiles: project.file_count > 0,
      lastActivityFormatted: project.last_activity ? 
        this.formatRelativeTime(project.last_activity) : null
    }
  }

  validateForCreate(data) {
    const required = ['name', 'description']
    const missing = required.filter(field => !data[field])
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`)
    }

    if (data.name.length < 3) {
      throw new Error('Project name must be at least 3 characters long')
    }

    if (data.description.length < 10) {
      throw new Error('Project description must be at least 10 characters long')
    }
  }

  validateForUpdate(data) {
    if (data.name && data.name.length < 3) {
      throw new Error('Project name must be at least 3 characters long')
    }

    if (data.description && data.description.length < 10) {
      throw new Error('Project description must be at least 10 characters long')
    }
  }

  processForCreate(data) {
    return {
      ...super.processForCreate(data),
      status: data.status || 'draft',
      tech_stack: Array.isArray(data.tech_stack) ? data.tech_stack.join(',') : data.tech_stack,
      visibility: data.visibility || 'private',
      file_count: 0,
      last_activity: new Date().toISOString()
    }
  }

  processForUpdate(data) {
    const processed = super.processForUpdate(data)
    
    if (data.tech_stack && Array.isArray(data.tech_stack)) {
      processed.tech_stack = data.tech_stack.join(',')
    }
    
    processed.last_activity = new Date().toISOString()
    
    return processed
  }

  // Private helper methods

  formatProjectName(project) {
    if (!project.name) return 'Untitled Project'
    
    // Capitalize first letter of each word
    return project.name
      .split(/[-_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  getStatusColor(status) {
    const colors = {
      draft: '#6B7280',      // gray
      active: '#3B82F6',     // blue
      completed: '#10B981',  // green
      deployed: '#8B5CF6',   // purple
      archived: '#9CA3AF',   // light gray
      error: '#EF4444'       // red
    }
    return colors[status] || colors.draft
  }

  isRecentProject(createdAt) {
    if (!createdAt) return false
    const daysDiff = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
    return daysDiff <= 7
  }

  calculateProgress(project) {
    // Simple progress calculation based on status and file count
    const statusProgress = {
      draft: 10,
      active: 50,
      completed: 90,
      deployed: 100,
      archived: 100,
      error: 0
    }
    
    let progress = statusProgress[project.status] || 0
    
    // Adjust based on file count
    if (project.file_count > 0) {
      progress = Math.max(progress, 20)
    }
    
    return Math.min(progress, 100)
  }

  estimateCompletion(project) {
    if (project.status === 'completed' || project.status === 'deployed') {
      return null
    }
    
    // Simple estimation based on current progress
    const progress = this.calculateProgress(project)
    if (progress === 0) return null
    
    const createdAt = new Date(project.created_at)
    const now = new Date()
    const elapsed = now - createdAt
    const total = elapsed / (progress / 100)
    const remaining = total - elapsed
    
    if (remaining <= 0) return null
    
    const estimatedCompletion = new Date(now.getTime() + remaining)
    return estimatedCompletion.toISOString()
  }

  parseTechStack(techStack) {
    if (!techStack) return []
    
    if (Array.isArray(techStack)) {
      return techStack
    }
    
    return techStack.split(',').map(tech => tech.trim()).filter(Boolean)
  }

  canDeploy(project) {
    return project.status === 'completed' && project.file_count > 0
  }

  formatRelativeTime(timestamp) {
    const now = new Date()
    const time = new Date(timestamp)
    const diff = now - time
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    
    return time.toLocaleDateString()
  }

  enrichStatistics(stats) {
    return {
      ...stats,
      totalProjectsFormatted: stats.total_projects?.toLocaleString() || '0',
      avgCompletionTime: this.calculateAverageCompletionTime(stats),
      popularTechStacks: this.formatPopularTechStacks(stats.tech_stack_distribution),
      statusDistribution: this.calculateStatusPercentages(stats.status_distribution),
      productivityScore: this.calculateProductivityScore(stats)
    }
  }

  calculateAverageCompletionTime(stats) {
    if (!stats.completed_projects || !stats.avg_completion_days) {
      return null
    }
    
    return `${Math.round(stats.avg_completion_days)} days`
  }

  formatPopularTechStacks(distribution) {
    if (!distribution || !Array.isArray(distribution)) {
      return []
    }
    
    return distribution
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(item => ({
        name: item.tech_stack,
        count: item.count,
        percentage: Math.round((item.count / distribution.reduce((sum, d) => sum + d.count, 0)) * 100)
      }))
  }

  calculateStatusPercentages(distribution) {
    if (!distribution || !Array.isArray(distribution)) {
      return {}
    }
    
    const total = distribution.reduce((sum, item) => sum + item.count, 0)
    const percentages = {}
    
    distribution.forEach(item => {
      percentages[item.status] = Math.round((item.count / total) * 100)
    })
    
    return percentages
  }

  calculateProductivityScore(stats) {
    // Simple productivity score based on completion rate and activity
    const completionRate = stats.total_projects > 0 ? 
      (stats.completed_projects / stats.total_projects) * 100 : 0
    
    const recentActivity = stats.projects_last_30_days || 0
    const activityScore = Math.min(recentActivity * 10, 50) // Max 50 points for activity
    
    return Math.round(completionRate * 0.7 + activityScore * 0.3)
  }

  enrichFile(file) {
    return {
      ...file,
      sizeFormatted: this.formatFileSize(file.size),
      languageFromExtension: this.getLanguageFromExtension(file.path),
      isImage: this.isImageFile(file.path),
      isCode: this.isCodeFile(file.path),
      lastModifiedFormatted: file.last_modified ? 
        new Date(file.last_modified).toLocaleString() : null
    }
  }

  formatFileSize(bytes) {
    if (!bytes) return '0 B'
    
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  getLanguageFromExtension(filePath) {
    const ext = filePath.split('.').pop().toLowerCase()
    const languageMap = {
      js: 'JavaScript',
      jsx: 'React',
      ts: 'TypeScript',
      tsx: 'React TypeScript',
      py: 'Python',
      html: 'HTML',
      css: 'CSS',
      scss: 'Sass',
      json: 'JSON',
      md: 'Markdown',
      yml: 'YAML',
      yaml: 'YAML'
    }
    return languageMap[ext] || 'Text'
  }

  isImageFile(filePath) {
    const ext = filePath.split('.').pop().toLowerCase()
    return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)
  }

  isCodeFile(filePath) {
    const ext = filePath.split('.').pop().toLowerCase()
    return ['js', 'jsx', 'ts', 'tsx', 'py', 'html', 'css', 'scss', 'json'].includes(ext)
  }
}

export { ProjectRepository }