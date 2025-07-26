/**
 * ⚡ AETHERFLOW Performance Monitoring & Optimization
 * 
 * Comprehensive performance monitoring, optimization, and analytics
 * for the AETHERFLOW VibeCoder platform
 */

import logger from './logger';

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoad: {},
      navigation: {},
      api: {},
      components: {},
      memory: {},
      network: {}
    };
    
    this.observers = new Map();
    this.performanceBuffer = [];
    this.maxBufferSize = 500;
    
    // Performance thresholds
    this.thresholds = {
      pageLoad: 3000,      // 3 seconds
      apiRequest: 1000,    // 1 second
      componentRender: 16, // 16ms (60fps)
      memory: 50,          // 50MB
      fcp: 1800,           // First Contentful Paint
      lcp: 2500,           // Largest Contentful Paint
      fid: 100,            // First Input Delay
      cls: 0.1             // Cumulative Layout Shift
    };
    
    this.initializeMonitoring();
  }

  initializeMonitoring() {
    // Initialize performance observers
    this.initWebVitals();
    this.initResourceObserver();
    this.initNavigationObserver();
    this.initMemoryMonitoring();
    this.initNetworkMonitoring();
    
    // Start periodic monitoring
    this.startPeriodicMonitoring();
    
    logger.info('Performance', 'Performance monitoring initialized');
  }

  // Web Vitals monitoring
  initWebVitals() {
    try {
      // First Contentful Paint
      this.observePerformanceEntry('paint', (entries) => {
        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            this.recordMetric('webVitals', 'fcp', entry.startTime);
            this.checkThreshold('fcp', entry.startTime);
          }
        });
      });

      // Largest Contentful Paint
      this.observePerformanceEntry('largest-contentful-paint', (entries) => {
        entries.forEach(entry => {
          this.recordMetric('webVitals', 'lcp', entry.startTime);
          this.checkThreshold('lcp', entry.startTime);
        });
      });

      // First Input Delay
      this.observePerformanceEntry('first-input', (entries) => {
        entries.forEach(entry => {
          const fid = entry.processingStart - entry.startTime;
          this.recordMetric('webVitals', 'fid', fid);
          this.checkThreshold('fid', fid);
        });
      });

      // Cumulative Layout Shift
      this.observePerformanceEntry('layout-shift', (entries) => {
        let clsValue = 0;
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.recordMetric('webVitals', 'cls', clsValue);
        this.checkThreshold('cls', clsValue);
      });

      logger.debug('Performance', 'Web Vitals monitoring initialized');
    } catch (error) {
      logger.error('Performance', 'Web Vitals initialization failed', error);
    }
  }

  // Resource loading monitoring
  initResourceObserver() {
    try {
      this.observePerformanceEntry('resource', (entries) => {
        entries.forEach(entry => {
          const duration = entry.responseEnd - entry.startTime;
          const resource = {
            name: entry.name,
            type: entry.initiatorType,
            duration,
            size: entry.transferSize,
            timestamp: entry.startTime
          };
          
          this.recordMetric('resources', entry.initiatorType, resource);
          
          // Check for slow resources
          if (duration > 1000) {
            logger.warn('Performance', `Slow resource detected: ${entry.name}`, {
              duration,
              type: entry.initiatorType,
              size: entry.transferSize
            });
          }
        });
      });
    } catch (error) {
      logger.error('Performance', 'Resource observer initialization failed', error);
    }
  }

  // Navigation timing monitoring
  initNavigationObserver() {
    try {
      this.observePerformanceEntry('navigation', (entries) => {
        entries.forEach(entry => {
          const navigation = {
            type: entry.type,
            redirectCount: entry.redirectCount,
            domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
            loadComplete: entry.loadEventEnd - entry.loadEventStart,
            totalTime: entry.loadEventEnd - entry.fetchStart
          };
          
          this.recordMetric('navigation', 'timing', navigation);
          this.checkThreshold('pageLoad', navigation.totalTime);
        });
      });
    } catch (error) {
      logger.error('Performance', 'Navigation observer initialization failed', error);
    }
  }

  // Memory monitoring
  initMemoryMonitoring() {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit,
          timestamp: Date.now()
        };
        
        this.recordMetric('memory', 'heap', memory);
        
        // Check memory usage
        const usedMB = memory.used / (1024 * 1024);
        if (usedMB > this.thresholds.memory) {
          logger.warn('Performance', `High memory usage detected: ${usedMB.toFixed(2)}MB`, memory);
        }
      }, 10000); // Check every 10 seconds
    }
  }

  // Network monitoring
  initNetworkMonitoring() {
    if ('connection' in navigator) {
      const updateConnectionInfo = () => {
        const connection = navigator.connection;
        const networkInfo = {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
          timestamp: Date.now()
        };
        
        this.recordMetric('network', 'connection', networkInfo);
        
        // Warn about slow connections
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          logger.warn('Performance', 'Slow network detected', networkInfo);
        }
      };

      updateConnectionInfo();
      navigator.connection.addEventListener('change', updateConnectionInfo);
    }
  }

  // Generic performance entry observer
  observePerformanceEntry(entryType, callback) {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      
      observer.observe({ entryTypes: [entryType] });
      this.observers.set(entryType, observer);
    } catch (error) {
      logger.error('Performance', `Failed to observe ${entryType}`, error);
    }
  }

  // Start periodic monitoring
  startPeriodicMonitoring() {
    setInterval(() => {
      this.collectSystemMetrics();
      this.analyzePerformanceTrends();
      this.cleanupOldMetrics();
    }, 30000); // Every 30 seconds
  }

  // Collect system metrics
  collectSystemMetrics() {
    const metrics = {
      timestamp: Date.now(),
      performanceNow: performance.now(),
      documentTimeline: performance.timeOrigin,
      resourceCount: performance.getEntriesByType('resource').length,
      navigationCount: performance.getEntriesByType('navigation').length
    };
    
    this.recordMetric('system', 'metrics', metrics);
  }

  // Analyze performance trends
  analyzePerformanceTrends() {
    // Analyze API performance trends
    const apiMetrics = this.metrics.api;
    if (Object.keys(apiMetrics).length > 0) {
      const avgResponseTime = this.calculateAverageResponseTime();
      if (avgResponseTime > this.thresholds.apiRequest) {
        logger.warn('Performance', `API performance degraded: ${avgResponseTime.toFixed(2)}ms average`);
      }
    }

    // Analyze component render performance
    const componentMetrics = this.metrics.components;
    if (Object.keys(componentMetrics).length > 0) {
      const slowComponents = this.findSlowComponents();
      if (slowComponents.length > 0) {
        logger.warn('Performance', 'Slow components detected', slowComponents);
      }
    }
  }

  // Clean up old metrics
  cleanupOldMetrics() {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes
    
    this.performanceBuffer = this.performanceBuffer.filter(
      entry => now - entry.timestamp < maxAge
    );
  }

  // Record performance metric
  recordMetric(category, name, value) {
    const metric = {
      category,
      name,
      value,
      timestamp: Date.now()
    };
    
    if (!this.metrics[category]) {
      this.metrics[category] = {};
    }
    
    if (!this.metrics[category][name]) {
      this.metrics[category][name] = [];
    }
    
    this.metrics[category][name].push(metric);
    
    // Add to buffer
    this.performanceBuffer.push(metric);
    
    // Limit buffer size
    if (this.performanceBuffer.length > this.maxBufferSize) {
      this.performanceBuffer.shift();
    }
  }

  // Check performance thresholds
  checkThreshold(metric, value) {
    const threshold = this.thresholds[metric];
    if (threshold && value > threshold) {
      logger.warn('Performance', `Performance threshold exceeded: ${metric}`, {
        value,
        threshold,
        exceeded: value - threshold
      });
    }
  }

  // API performance tracking
  trackApiRequest(method, url, startTime) {
    const duration = performance.now() - startTime;
    const apiMetric = {
      method,
      url,
      duration,
      timestamp: Date.now()
    };
    
    this.recordMetric('api', 'request', apiMetric);
    this.checkThreshold('apiRequest', duration);
    
    return duration;
  }

  // Component performance tracking
  trackComponentRender(componentName, startTime) {
    const duration = performance.now() - startTime;
    const componentMetric = {
      name: componentName,
      duration,
      timestamp: Date.now()
    };
    
    this.recordMetric('components', 'render', componentMetric);
    this.checkThreshold('componentRender', duration);
    
    return duration;
  }

  // Calculate average response time
  calculateAverageResponseTime() {
    const apiRequests = this.metrics.api?.request || [];
    if (apiRequests.length === 0) return 0;
    
    const totalDuration = apiRequests.reduce((sum, req) => sum + req.value.duration, 0);
    return totalDuration / apiRequests.length;
  }

  // Find slow components
  findSlowComponents() {
    const componentRenders = this.metrics.components?.render || [];
    return componentRenders
      .filter(render => render.value.duration > this.thresholds.componentRender)
      .map(render => ({
        name: render.value.name,
        duration: render.value.duration,
        timestamp: render.timestamp
      }));
  }

  // Get performance report
  getPerformanceReport() {
    return {
      timestamp: Date.now(),
      webVitals: this.getWebVitalsReport(),
      api: this.getApiReport(),
      components: this.getComponentReport(),
      memory: this.getMemoryReport(),
      network: this.getNetworkReport(),
      recommendations: this.getRecommendations()
    };
  }

  // Get Web Vitals report
  getWebVitalsReport() {
    const vitals = this.metrics.webVitals || {};
    return {
      fcp: vitals.fcp?.[vitals.fcp.length - 1]?.value || 0,
      lcp: vitals.lcp?.[vitals.lcp.length - 1]?.value || 0,
      fid: vitals.fid?.[vitals.fid.length - 1]?.value || 0,
      cls: vitals.cls?.[vitals.cls.length - 1]?.value || 0
    };
  }

  // Get API performance report
  getApiReport() {
    const apiRequests = this.metrics.api?.request || [];
    const recentRequests = apiRequests.slice(-50); // Last 50 requests
    
    return {
      totalRequests: apiRequests.length,
      averageResponseTime: this.calculateAverageResponseTime(),
      slowRequests: recentRequests.filter(req => req.value.duration > this.thresholds.apiRequest).length,
      recentRequests: recentRequests.length
    };
  }

  // Get component performance report
  getComponentReport() {
    const componentRenders = this.metrics.components?.render || [];
    const slowComponents = this.findSlowComponents();
    
    return {
      totalRenders: componentRenders.length,
      slowComponents: slowComponents.length,
      averageRenderTime: componentRenders.length > 0 
        ? componentRenders.reduce((sum, render) => sum + render.value.duration, 0) / componentRenders.length
        : 0
    };
  }

  // Get memory report
  getMemoryReport() {
    const memoryMetrics = this.metrics.memory?.heap || [];
    const latest = memoryMetrics[memoryMetrics.length - 1];
    
    return {
      current: latest ? {
        used: latest.value.used,
        total: latest.value.total,
        limit: latest.value.limit,
        usedMB: (latest.value.used / (1024 * 1024)).toFixed(2),
        percentage: ((latest.value.used / latest.value.total) * 100).toFixed(2)
      } : null,
      samples: memoryMetrics.length
    };
  }

  // Get network report
  getNetworkReport() {
    const networkMetrics = this.metrics.network?.connection || [];
    const latest = networkMetrics[networkMetrics.length - 1];
    
    return {
      current: latest ? latest.value : null,
      samples: networkMetrics.length
    };
  }

  // Get performance recommendations
  getRecommendations() {
    const recommendations = [];
    
    // Check Web Vitals
    const vitals = this.getWebVitalsReport();
    if (vitals.fcp > this.thresholds.fcp) {
      recommendations.push({
        type: 'webVitals',
        severity: 'high',
        message: 'First Contentful Paint is slow. Consider optimizing critical rendering path.'
      });
    }
    
    if (vitals.lcp > this.thresholds.lcp) {
      recommendations.push({
        type: 'webVitals',
        severity: 'high',
        message: 'Largest Contentful Paint is slow. Optimize images and critical resources.'
      });
    }
    
    // Check API performance
    const apiReport = this.getApiReport();
    if (apiReport.averageResponseTime > this.thresholds.apiRequest) {
      recommendations.push({
        type: 'api',
        severity: 'medium',
        message: 'API responses are slow. Consider caching and optimization.'
      });
    }
    
    // Check memory usage
    const memoryReport = this.getMemoryReport();
    if (memoryReport.current && parseFloat(memoryReport.current.usedMB) > this.thresholds.memory) {
      recommendations.push({
        type: 'memory',
        severity: 'high',
        message: 'High memory usage detected. Check for memory leaks.'
      });
    }
    
    return recommendations;
  }

  // Export performance data
  exportPerformanceData() {
    const report = this.getPerformanceReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aetherflow-performance-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Cleanup observers
  cleanup() {
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers.clear();
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Export performance utilities
export default performanceMonitor;

export const performance = {
  monitor: performanceMonitor,
  trackApi: (method, url, startTime) => performanceMonitor.trackApiRequest(method, url, startTime),
  trackComponent: (name, startTime) => performanceMonitor.trackComponentRender(name, startTime),
  getReport: () => performanceMonitor.getPerformanceReport(),
  export: () => performanceMonitor.exportPerformanceData()
};