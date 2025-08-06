/**
 * Performance Optimization Components - 2025 Edition
 * Advanced performance monitoring and optimization features
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CpuChipIcon,
  ClockIcon,
  SignalIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  BoltIcon
} from '@heroicons/react/24/outline'

// Performance Monitor Component
export const PerformanceMonitor = ({ onMetricsUpdate }) => {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: 0,
    responseTime: 0,
    loadTime: 0,
    networkLatency: 0
  })
  
  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())
  const animationFrame = useRef(null)
  
  const measureFPS = useCallback(() => {
    const now = performance.now()
    frameCount.current++
    
    if (now - lastTime.current >= 1000) {
      const fps = Math.round((frameCount.current * 1000) / (now - lastTime.current))
      
      setMetrics(prev => {
        const newMetrics = {
          ...prev,
          fps,
          memory: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : 0
        }
        onMetricsUpdate?.(newMetrics)
        return newMetrics
      })
      
      frameCount.current = 0
      lastTime.current = now
    }
    
    animationFrame.current = requestAnimationFrame(measureFPS)
  }, [onMetricsUpdate])
  
  useEffect(() => {
    // Measure initial load time
    if (performance.timing) {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
      setMetrics(prev => ({ ...prev, loadTime }))
    }
    
    // Start FPS monitoring
    animationFrame.current = requestAnimationFrame(measureFPS)
    
    // Monitor network latency
    const measureLatency = async () => {
      try {
        const start = performance.now()
        await fetch('/api/health', { method: 'HEAD' })
        const latency = performance.now() - start
        
        setMetrics(prev => ({ ...prev, networkLatency: Math.round(latency) }))
      } catch (error) {
        console.warn('Network latency measurement failed:', error)
      }
    }
    
    // Measure latency every 30 seconds
    const latencyInterval = setInterval(measureLatency, 30000)
    measureLatency() // Initial measurement
    
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current)
      }
      clearInterval(latencyInterval)
    }
  }, [measureFPS])
  
  const getPerformanceColor = (metric, value) => {
    switch (metric) {
      case 'fps':
        if (value >= 55) return 'text-green-600'
        if (value >= 30) return 'text-yellow-600'
        return 'text-red-600'
      case 'memory':
        if (value <= 50) return 'text-green-600'
        if (value <= 100) return 'text-yellow-600'
        return 'text-red-600'
      case 'networkLatency':
        if (value <= 100) return 'text-green-600'
        if (value <= 300) return 'text-yellow-600'
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
          <CpuChipIcon className="w-4 h-4 mr-2 text-blue-600" />
          Performance Monitor
        </h3>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Real-time
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600 dark:text-gray-400">FPS</span>
          <span className={`text-sm font-medium ${getPerformanceColor('fps', metrics.fps)}`}>
            {metrics.fps}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600 dark:text-gray-400">Memory</span>
          <span className={`text-sm font-medium ${getPerformanceColor('memory', metrics.memory)}`}>
            {metrics.memory}MB
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600 dark:text-gray-400">Load</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {(metrics.loadTime / 1000).toFixed(1)}s
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600 dark:text-gray-400">Ping</span>
          <span className={`text-sm font-medium ${getPerformanceColor('networkLatency', metrics.networkLatency)}`}>
            {metrics.networkLatency}ms
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// Lazy Load Wrapper
export const LazyLoadWrapper = ({ children, placeholder, rootMargin = '100px' }) => {
  const [isInView, setIsInView] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const ref = useRef(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsInView(true)
          setHasLoaded(true)
        }
      },
      { rootMargin }
    )
    
    if (ref.current) {
      observer.observe(ref.current)
    }
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [rootMargin, hasLoaded])
  
  return (
    <div ref={ref}>
      {isInView ? children : placeholder || <div className="h-32 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />}
    </div>
  )
}

// Image Optimization Component
export const OptimizedImage = ({ src, alt, className = '', loading = 'lazy', ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef(null)
  
  const handleLoad = useCallback(() => {
    setIsLoaded(true)
  }, [])
  
  const handleError = useCallback(() => {
    setHasError(true)
  }, [])
  
  // Progressive image loading with blur effect
  const imageClasses = useMemo(() => {
    let classes = `transition-all duration-300 ${className}`
    
    if (!isLoaded && !hasError) {
      classes += ' blur-sm opacity-50'
    } else if (isLoaded) {
      classes += ' blur-0 opacity-100'
    }
    
    return classes
  }, [isLoaded, hasError, className])
  
  if (hasError) {
    return (
      <div className={`bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center ${className}`}>
        <ExclamationTriangleIcon className="w-8 h-8 text-gray-400" />
      </div>
    )
  }
  
  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      loading={loading}
      className={imageClasses}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  )
}

// Code Splitting Component
export const CodeSplitComponent = ({ loader, fallback }) => {
  const [Component, setComponent] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    loader()
      .then(module => {
        setComponent(() => module.default || module)
        setIsLoading(false)
      })
      .catch(err => {
        setError(err)
        setIsLoading(false)
      })
  }, [loader])
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <div className="flex items-center text-red-700 dark:text-red-400">
          <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
          Failed to load component
        </div>
      </div>
    )
  }
  
  if (isLoading) {
    return fallback || (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  
  return Component ? <Component /> : null
}

// Memory Usage Monitor
export const MemoryMonitor = () => {
  const [memoryInfo, setMemoryInfo] = useState(null)
  const [trend, setTrend] = useState([])
  
  useEffect(() => {
    if (!performance.memory) return
    
    const updateMemory = () => {
      const memory = {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576),
        total: Math.round(performance.memory.totalJSHeapSize / 1048576),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
      }
      
      setMemoryInfo(memory)
      setTrend(prev => [...prev.slice(-19), memory.used]) // Keep last 20 points
    }
    
    updateMemory()
    const interval = setInterval(updateMemory, 5000) // Update every 5 seconds
    
    return () => clearInterval(interval)
  }, [])
  
  if (!memoryInfo) return null
  
  const usagePercentage = (memoryInfo.used / memoryInfo.total) * 100
  const getUsageColor = () => {
    if (usagePercentage > 80) return 'text-red-600'
    if (usagePercentage > 60) return 'text-yellow-600'
    return 'text-green-600'
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
          <SignalIcon className="w-4 h-4 mr-2 text-green-600" />
          Memory Usage
        </h3>
        <span className={`text-sm font-medium ${getUsageColor()}`}>
          {usagePercentage.toFixed(1)}%
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>Used: {memoryInfo.used}MB</span>
          <span>Total: {memoryInfo.total}MB</span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full ${
              usagePercentage > 80 ? 'bg-red-500' :
              usagePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${usagePercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        
        {trend.length > 10 && (
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
            Trend: {trend[trend.length - 1] > trend[trend.length - 6] ? 'Increasing' : 'Stable'}
          </div>
        )}
      </div>
    </div>
  )
}

// Network Quality Indicator
export const NetworkQualityIndicator = () => {
  const [quality, setQuality] = useState('good')
  const [latency, setLatency] = useState(0)
  
  useEffect(() => {
    const measureNetworkQuality = async () => {
      try {
        const start = performance.now()
        const response = await fetch('/api/health', { 
          method: 'HEAD',
          cache: 'no-cache'
        })
        const end = performance.now()
        const pingTime = end - start
        
        setLatency(Math.round(pingTime))
        
        if (pingTime < 100) {
          setQuality('excellent')
        } else if (pingTime < 300) {
          setQuality('good')
        } else if (pingTime < 600) {
          setQuality('fair')
        } else {
          setQuality('poor')
        }
      } catch (error) {
        setQuality('offline')
      }
    }
    
    measureNetworkQuality()
    const interval = setInterval(measureNetworkQuality, 10000) // Every 10 seconds
    
    return () => clearInterval(interval)
  }, [])
  
  const getQualityConfig = () => {
    switch (quality) {
      case 'excellent':
        return { color: 'text-green-600', icon: '🟢', label: 'Excellent' }
      case 'good':
        return { color: 'text-green-500', icon: '🟡', label: 'Good' }
      case 'fair':
        return { color: 'text-yellow-500', icon: '🟠', label: 'Fair' }
      case 'poor':
        return { color: 'text-red-500', icon: '🔴', label: 'Poor' }
      case 'offline':
        return { color: 'text-gray-500', icon: '⚫', label: 'Offline' }
      default:
        return { color: 'text-gray-500', icon: '⚫', label: 'Unknown' }
    }
  }
  
  const config = getQualityConfig()
  
  return (
    <div className="inline-flex items-center space-x-2 text-sm">
      <span>{config.icon}</span>
      <span className={config.color}>
        {config.label} ({latency}ms)
      </span>
    </div>
  )
}

// Performance Optimization Tips
export const PerformanceTips = ({ metrics }) => {
  const tips = useMemo(() => {
    const suggestions = []
    
    if (metrics?.fps < 30) {
      suggestions.push({
        type: 'warning',
        message: 'Low frame rate detected. Consider closing other browser tabs.',
        action: 'Optimize'
      })
    }
    
    if (metrics?.memory > 100) {
      suggestions.push({
        type: 'warning',
        message: 'High memory usage. Try refreshing the page.',
        action: 'Refresh'
      })
    }
    
    if (metrics?.networkLatency > 500) {
      suggestions.push({
        type: 'warning',
        message: 'Slow network connection detected.',
        action: 'Check Connection'
      })
    }
    
    if (suggestions.length === 0) {
      suggestions.push({
        type: 'success',
        message: 'Performance is optimal!',
        action: null
      })
    }
    
    return suggestions
  }, [metrics])
  
  return (
    <AnimatePresence mode="wait">
      {tips.map((tip, index) => (
        <motion.div
          key={`${tip.message}-${index}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`p-3 rounded-lg border ${
            tip.type === 'success' 
              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
              : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {tip.type === 'success' ? (
                <CheckCircleIcon className="w-4 h-4 text-green-600 mr-2" />
              ) : (
                <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600 mr-2" />
              )}
              <span className={`text-sm ${
                tip.type === 'success' ? 'text-green-700 dark:text-green-400' : 'text-yellow-700 dark:text-yellow-400'
              }`}>
                {tip.message}
              </span>
            </div>
            
            {tip.action && (
              <button className="text-xs px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                {tip.action}
              </button>
            )}
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  )
}

// Bundle Size Analyzer
export const BundleSizeIndicator = () => {
  const [bundleInfo, setBundleInfo] = useState(null)
  
  useEffect(() => {
    // Estimate bundle size based on loaded resources
    const resources = performance.getEntriesByType('resource')
    let totalSize = 0
    let jsSize = 0
    let cssSize = 0
    
    resources.forEach(resource => {
      if (resource.transferSize) {
        totalSize += resource.transferSize
        
        if (resource.name.includes('.js')) {
          jsSize += resource.transferSize
        } else if (resource.name.includes('.css')) {
          cssSize += resource.transferSize
        }
      }
    })
    
    setBundleInfo({
      total: Math.round(totalSize / 1024), // KB
      js: Math.round(jsSize / 1024),
      css: Math.round(cssSize / 1024)
    })
  }, [])
  
  if (!bundleInfo) return null
  
  return (
    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
      <div className="flex items-center justify-between">
        <span>Bundle Size</span>
        <span className="font-medium">{bundleInfo.total}KB</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="ml-2">JavaScript</span>
        <span>{bundleInfo.js}KB</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="ml-2">CSS</span>
        <span>{bundleInfo.css}KB</span>
      </div>
    </div>
  )
}

export default {
  PerformanceMonitor,
  LazyLoadWrapper,
  OptimizedImage,
  CodeSplitComponent,
  MemoryMonitor,
  NetworkQualityIndicator,
  PerformanceTips,
  BundleSizeIndicator
}