import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BoltIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CpuChipIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  ArrowTrendingUpIcon,
  XMarkIcon,
  PlayIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const PerformanceOptimizer = ({ projectId, isVisible = false, onClose }) => {
  const [performanceMetrics, setPerformanceMetrics] = useState({})
  const [optimizations, setOptimizations] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeOptimizations, setActiveOptimizations] = useState(new Set())
  const [performanceScore, setPerformanceScore] = useState(0)

  // Simulate performance analysis
  useEffect(() => {
    if (!isVisible) return

    const analyzePerformance = async () => {
      setIsAnalyzing(true)
      
      try {
        // Simulate performance analysis delay
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Mock performance metrics
        const metrics = {
          lighthouse: {
            performance: Math.floor(Math.random() * 30) + 60,
            accessibility: Math.floor(Math.random() * 20) + 80,
            seo: Math.floor(Math.random() * 25) + 75,
            bestPractices: Math.floor(Math.random() * 20) + 80
          },
          vitals: {
            lcp: (Math.random() * 2 + 1.5).toFixed(1), // Largest Contentful Paint
            fid: (Math.random() * 80 + 20).toFixed(0), // First Input Delay
            cls: (Math.random() * 0.2 + 0.05).toFixed(3), // Cumulative Layout Shift
            fcp: (Math.random() * 1.5 + 1).toFixed(1), // First Contentful Paint
            ttfb: (Math.random() * 400 + 200).toFixed(0) // Time to First Byte
          },
          bundleSize: {
            total: Math.floor(Math.random() * 500) + 800,
            javascript: Math.floor(Math.random() * 300) + 400,
            css: Math.floor(Math.random() * 100) + 50,
            images: Math.floor(Math.random() * 200) + 100
          },
          pageSpeed: {
            desktop: Math.floor(Math.random() * 20) + 70,
            mobile: Math.floor(Math.random() * 25) + 60
          }
        }
        
        setPerformanceMetrics(metrics)
        
        // Generate optimization suggestions based on metrics
        const suggestions = []
        
        if (metrics.lighthouse.performance < 80) {
          suggestions.push({
            id: 'lazy-loading',
            title: 'Implement Lazy Loading',
            description: 'Load images and components only when needed',
            impact: 'High',
            effort: 'Medium',
            estimatedImprovement: '+12-18 points',
            category: 'Loading',
            priority: 1,
            implementation: 'Add React.lazy() and Intersection Observer API'
          })
        }
        
        if (parseFloat(metrics.vitals.lcp) > 2.5) {
          suggestions.push({
            id: 'image-optimization',
            title: 'Optimize Images',
            description: 'Compress and use modern formats (WebP, AVIF)',
            impact: 'High',
            effort: 'Low',
            estimatedImprovement: '-0.8s LCP',
            category: 'Images',
            priority: 1,
            implementation: 'Use next/image or react-image-optimize'
          })
        }
        
        if (metrics.bundleSize.javascript > 500) {
          suggestions.push({
            id: 'code-splitting',
            title: 'Code Splitting',
            description: 'Split bundles by routes and features',
            impact: 'High',
            effort: 'High',
            estimatedImprovement: `-${Math.floor(metrics.bundleSize.javascript * 0.3)}KB`,
            category: 'Bundle',
            priority: 2,
            implementation: 'Implement dynamic imports and route-based splitting'
          })
        }
        
        if (parseFloat(metrics.vitals.cls) > 0.1) {
          suggestions.push({
            id: 'layout-stability',
            title: 'Fix Layout Shifts',
            description: 'Reserve space for dynamic content',
            impact: 'Medium',
            effort: 'Medium',
            estimatedImprovement: '-0.08 CLS',
            category: 'Layout',
            priority: 2,
            implementation: 'Add aspect-ratio and skeleton loaders'
          })
        }
        
        suggestions.push({
          id: 'resource-hints',
          title: 'Add Resource Hints',
          description: 'Preload critical resources and DNS prefetch',
          impact: 'Medium',
          effort: 'Low',
          estimatedImprovement: '-0.3s FCP',
          category: 'Loading',
          priority: 3,
          implementation: 'Add <link rel="preload"> and <link rel="dns-prefetch">'
        })
        
        suggestions.push({
          id: 'service-worker',
          title: 'Service Worker Caching',
          description: 'Cache static assets and API responses',
          impact: 'High',
          effort: 'High',
          estimatedImprovement: '+25 points (repeat visits)',
          category: 'Caching',
          priority: 2,
          implementation: 'Implement Workbox for cache strategies'
        })
        
        suggestions.push({
          id: 'critical-css',
          title: 'Critical CSS Inline',
          description: 'Inline above-the-fold CSS',
          impact: 'Medium',
          effort: 'Medium',
          estimatedImprovement: '-0.4s FCP',
          category: 'Styling',
          priority: 3,
          implementation: 'Extract and inline critical CSS'
        })
        
        setOptimizations(suggestions)
        
        // Calculate overall performance score
        const avgLighthouse = Object.values(metrics.lighthouse).reduce((a, b) => a + b, 0) / 4
        setPerformanceScore(Math.round(avgLighthouse))
        
      } catch (error) {
        console.error('Performance analysis error:', error)
        toast.error('Failed to analyze performance')
      } finally {
        setIsAnalyzing(false)
      }
    }

    analyzePerformance()
  }, [isVisible])

  const applyOptimization = async (optimization) => {
    setActiveOptimizations(prev => new Set([...prev, optimization.id]))
    toast.loading(`Applying ${optimization.title}...`)
    
    try {
      // Simulate optimization application
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      toast.dismiss()
      toast.success(`${optimization.title} applied successfully!`)
      
      // Update performance metrics (simulate improvement)
      setPerformanceMetrics(prev => {
        const newMetrics = { ...prev }
        
        // Simulate metric improvements
        if (optimization.id === 'lazy-loading') {
          newMetrics.lighthouse.performance = Math.min(100, prev.lighthouse.performance + 15)
        } else if (optimization.id === 'image-optimization') {
          newMetrics.vitals.lcp = Math.max(1.0, parseFloat(prev.vitals.lcp) - 0.8).toFixed(1)
        } else if (optimization.id === 'code-splitting') {
          newMetrics.bundleSize.javascript = Math.max(200, prev.bundleSize.javascript - 150)
        }
        
        return newMetrics
      })
      
      // Update overall score
      setPerformanceScore(prev => Math.min(100, prev + Math.floor(Math.random() * 8) + 5))
      
    } catch (error) {
      toast.dismiss()
      toast.error(`Failed to apply ${optimization.title}`)
      setActiveOptimizations(prev => {
        const newSet = new Set(prev)
        newSet.delete(optimization.id)
        return newSet
      })
    }
  }

  const getImpactColor = (impact) => {
    const colors = {
      'High': 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
      'Medium': 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
      'Low': 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
    }
    return colors[impact] || colors.Medium
  }

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400'
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getMetricStatus = (metric, value, thresholds) => {
    const numValue = parseFloat(value)
    if (numValue <= thresholds.good) return { status: 'good', color: 'text-green-600 dark:text-green-400' }
    if (numValue <= thresholds.needs_improvement) return { status: 'needs-improvement', color: 'text-yellow-600 dark:text-yellow-400' }
    return { status: 'poor', color: 'text-red-600 dark:text-red-400' }
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <BoltIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Performance Optimizer
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                AI-powered performance analysis and optimization
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Score:</span>
                <span className={`text-2xl font-bold ${getScoreColor(performanceScore)}`}>
                  {performanceScore}
                </span>
              </div>
              {isAnalyzing && (
                <div className="flex items-center space-x-2 mt-1">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                  <span className="text-xs text-gray-500">Analyzing...</span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <div className="space-y-6">
              {/* Lighthouse Scores */}
              {performanceMetrics.lighthouse && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                    <ChartBarIcon className="w-5 h-5" />
                    <span>Lighthouse Scores</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(performanceMetrics.lighthouse).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className={`text-2xl font-bold ${getScoreColor(value)}`}>
                          {value}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Core Web Vitals */}
              {performanceMetrics.vitals && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                    <CpuChipIcon className="w-5 h-5" />
                    <span>Core Web Vitals</span>
                  </h3>
                  <div className="space-y-3">
                    {[
                      { key: 'lcp', label: 'LCP', value: performanceMetrics.vitals.lcp, unit: 's', thresholds: { good: 2.5, needs_improvement: 4 } },
                      { key: 'fid', label: 'FID', value: performanceMetrics.vitals.fid, unit: 'ms', thresholds: { good: 100, needs_improvement: 300 } },
                      { key: 'cls', label: 'CLS', value: performanceMetrics.vitals.cls, unit: '', thresholds: { good: 0.1, needs_improvement: 0.25 } },
                      { key: 'fcp', label: 'FCP', value: performanceMetrics.vitals.fcp, unit: 's', thresholds: { good: 1.8, needs_improvement: 3 } },
                      { key: 'ttfb', label: 'TTFB', value: performanceMetrics.vitals.ttfb, unit: 'ms', thresholds: { good: 200, needs_improvement: 500 } }
                    ].map((metric) => {
                      const status = getMetricStatus(metric.key, metric.value, metric.thresholds)
                      return (
                        <div key={metric.key} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</span>
                          <span className={`font-medium ${status.color}`}>
                            {metric.value}{metric.unit}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Bundle Size */}
              {performanceMetrics.bundleSize && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                    <GlobeAltIcon className="w-5 h-5" />
                    <span>Bundle Analysis</span>
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(performanceMetrics.bundleSize).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{key}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{value}KB</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Optimizations */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <ArrowTrendingUpIcon className="w-5 h-5" />
                <span>Optimization Opportunities ({optimizations.length})</span>
              </h3>
              <div className="space-y-3">
                {optimizations.map((optimization) => {
                  const isActive = activeOptimizations.has(optimization.id)
                  return (
                    <motion.div
                      key={optimization.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {optimization.title}
                            </h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(optimization.impact)}`}>
                              {optimization.impact}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {optimization.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs">
                            <div className="flex items-center space-x-1">
                              <ClockIcon className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-500">{optimization.effort} effort</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ArrowTrendingUpIcon className="w-3 h-3 text-green-500" />
                              <span className="text-green-600 dark:text-green-400">
                                {optimization.estimatedImprovement}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded p-2 mb-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <strong>Implementation:</strong> {optimization.implementation}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                          {optimization.category}
                        </span>
                        <button
                          onClick={() => applyOptimization(optimization)}
                          disabled={isActive}
                          className={`text-sm px-4 py-2 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 cursor-not-allowed'
                              : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }`}
                        >
                          {isActive ? (
                            <>
                              <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                              Applied
                            </>
                          ) : (
                            <>
                              <PlayIcon className="w-4 h-4 inline mr-1" />
                              Apply Fix
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default PerformanceOptimizer