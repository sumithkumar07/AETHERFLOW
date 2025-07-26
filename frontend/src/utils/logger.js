/**
 * 🚀 AETHERFLOW Enhanced Logging System
 * 
 * Production-ready logging utility that replaces console.log statements
 * with proper logging levels, filtering, and cosmic-level enhancements
 */

class AetherFlowLogger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.logLevels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3,
      COSMIC: 4
    };
    this.currentLevel = this.isDevelopment ? this.logLevels.DEBUG : this.logLevels.INFO;
    this.logBuffer = [];
    this.maxBufferSize = 1000;
    
    // Performance monitoring
    this.performanceMarkers = new Map();
    
    // Initialize cosmic logging
    this.initCosmicLogging();
  }

  initCosmicLogging() {
    // Add cosmic styling for development
    if (this.isDevelopment) {
      this.cosmicStyles = {
        error: 'color: #ff6b6b; font-weight: bold; background: #2d1b1b; padding: 2px 4px; border-radius: 3px;',
        warn: 'color: #ffd93d; font-weight: bold; background: #2d2516; padding: 2px 4px; border-radius: 3px;',
        info: 'color: #74c0fc; font-weight: bold; background: #0f172a; padding: 2px 4px; border-radius: 3px;',
        debug: 'color: #51cf66; font-weight: bold; background: #1a2e1a; padding: 2px 4px; border-radius: 3px;',
        cosmic: 'color: #d946ef; font-weight: bold; background: #2d1b2d; padding: 2px 4px; border-radius: 3px; text-shadow: 0 0 10px #d946ef;'
      };
    }
  }

  shouldLog(level) {
    return this.logLevels[level] <= this.currentLevel;
  }

  formatMessage(level, component, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      component,
      message,
      data,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Add to buffer for potential remote logging
    this.logBuffer.push(logEntry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }

    return logEntry;
  }

  error(component, message, error = null) {
    if (!this.shouldLog('ERROR')) return;
    
    const logEntry = this.formatMessage('ERROR', component, message, error);
    
    if (this.isDevelopment) {
      console.error(
        `%c🚨 AETHERFLOW ERROR [${component}]`,
        this.cosmicStyles.error,
        message,
        error || ''
      );
    } else {
      // In production, send to monitoring service
      this.sendToMonitoring(logEntry);
    }
  }

  warn(component, message, data = null) {
    if (!this.shouldLog('WARN')) return;
    
    const logEntry = this.formatMessage('WARN', component, message, data);
    
    if (this.isDevelopment) {
      console.warn(
        `%c⚠️  AETHERFLOW WARN [${component}]`,
        this.cosmicStyles.warn,
        message,
        data || ''
      );
    } else {
      this.sendToMonitoring(logEntry);
    }
  }

  info(component, message, data = null) {
    if (!this.shouldLog('INFO')) return;
    
    const logEntry = this.formatMessage('INFO', component, message, data);
    
    if (this.isDevelopment) {
      console.info(
        `%c💡 AETHERFLOW INFO [${component}]`,
        this.cosmicStyles.info,
        message,
        data || ''
      );
    } else {
      this.sendToMonitoring(logEntry);
    }
  }

  debug(component, message, data = null) {
    if (!this.shouldLog('DEBUG')) return;
    
    const logEntry = this.formatMessage('DEBUG', component, message, data);
    
    if (this.isDevelopment) {
      console.debug(
        `%c🔍 AETHERFLOW DEBUG [${component}]`,
        this.cosmicStyles.debug,
        message,
        data || ''
      );
    }
  }

  cosmic(component, message, data = null) {
    if (!this.shouldLog('COSMIC')) return;
    
    const logEntry = this.formatMessage('COSMIC', component, message, data);
    
    if (this.isDevelopment) {
      console.log(
        `%c🌌 AETHERFLOW COSMIC [${component}]`,
        this.cosmicStyles.cosmic,
        message,
        data || ''
      );
    }
  }

  // Performance monitoring utilities
  startPerformanceTimer(name) {
    this.performanceMarkers.set(name, performance.now());
    if (this.isDevelopment) {
      console.time(`⚡ ${name}`);
    }
  }

  endPerformanceTimer(name) {
    const startTime = this.performanceMarkers.get(name);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.performanceMarkers.delete(name);
      
      if (this.isDevelopment) {
        console.timeEnd(`⚡ ${name}`);
      }
      
      // Log performance metrics
      this.debug('Performance', `${name} completed in ${duration.toFixed(2)}ms`);
      
      // Send to monitoring if duration is significant
      if (duration > 1000) {
        this.warn('Performance', `Slow operation detected: ${name}`, { duration });
      }
      
      return duration;
    }
    return 0;
  }

  // Group related logs
  group(title) {
    if (this.isDevelopment) {
      console.group(`🌟 ${title}`);
    }
  }

  groupEnd() {
    if (this.isDevelopment) {
      console.groupEnd();
    }
  }

  // Cosmic-specific logging methods
  vibeActivity(component, activity, tokens = 0) {
    this.cosmic(component, `VIBE Activity: ${activity}`, { tokens });
  }

  karmaEvent(component, event, level = 'Unknown') {
    this.cosmic(component, `Karma Event: ${event}`, { level });
  }

  avatarAction(component, avatar, action) {
    this.cosmic(component, `Avatar Action: ${avatar} - ${action}`);
  }

  quantumEvent(component, event, reality = 'Current') {
    this.cosmic(component, `Quantum Event: ${event}`, { reality });
  }

  // Network request logging
  apiRequest(component, method, url, duration = 0) {
    this.debug(component, `API ${method} ${url}`, { duration });
  }

  apiError(component, method, url, error, status = 0) {
    this.error(component, `API Error ${method} ${url}`, { error, status });
  }

  // User interaction logging
  userAction(component, action, data = null) {
    this.info(component, `User Action: ${action}`, data);
  }

  // Send logs to monitoring service (production)
  sendToMonitoring(logEntry) {
    // This would integrate with services like Sentry, LogRocket, etc.
    // For now, we'll store in localStorage for later retrieval
    try {
      const storedLogs = JSON.parse(localStorage.getItem('aetherflow_logs') || '[]');
      storedLogs.push(logEntry);
      
      // Keep only last 100 logs in localStorage
      if (storedLogs.length > 100) {
        storedLogs.splice(0, storedLogs.length - 100);
      }
      
      localStorage.setItem('aetherflow_logs', JSON.stringify(storedLogs));
    } catch (e) {
      // Fallback to console if localStorage fails
      console.error('Failed to store log entry:', e);
    }
  }

  // Get logs for debugging or monitoring
  getLogs(level = null) {
    if (level) {
      return this.logBuffer.filter(log => log.level === level);
    }
    return [...this.logBuffer];
  }

  // Clear log buffer
  clearLogs() {
    this.logBuffer = [];
    localStorage.removeItem('aetherflow_logs');
  }

  // Export logs for analysis
  exportLogs() {
    const logs = this.getLogs();
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aetherflow-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Create singleton instance
const logger = new AetherFlowLogger();

// Export both the instance and the class
export default logger;
export { AetherFlowLogger };

// Helper function for quick logging
export const log = {
  error: (component, message, error) => logger.error(component, message, error),
  warn: (component, message, data) => logger.warn(component, message, data),
  info: (component, message, data) => logger.info(component, message, data),
  debug: (component, message, data) => logger.debug(component, message, data),
  cosmic: (component, message, data) => logger.cosmic(component, message, data),
  perf: {
    start: (name) => logger.startPerformanceTimer(name),
    end: (name) => logger.endPerformanceTimer(name)
  },
  user: (component, action, data) => logger.userAction(component, action, data),
  api: {
    request: (component, method, url, duration) => logger.apiRequest(component, method, url, duration),
    error: (component, method, url, error, status) => logger.apiError(component, method, url, error, status)
  },
  vibe: (component, activity, tokens) => logger.vibeActivity(component, activity, tokens),
  karma: (component, event, level) => logger.karmaEvent(component, event, level),
  avatar: (component, avatar, action) => logger.avatarAction(component, avatar, action),
  quantum: (component, event, reality) => logger.quantumEvent(component, event, reality)
};