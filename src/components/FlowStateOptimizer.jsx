import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BoltIcon,
  ChartBarIcon,
  LightBulbIcon,
  FireIcon,
  BeakerIcon
} from '@heroicons/react/24/outline'
import { useAdvancedFeaturesStore } from '../store/advancedFeaturesStore'

const FlowStateOptimizer = ({ projectId }) => {
  const { 
    performanceOptimization,
    analyzePerformance,
    applyOptimizations
  } = useAdvancedFeaturesStore()

  const [flowMetrics, setFlowMetrics] = useState({
    focusLevel: 85,
    productivityScore: 92,
    distractionLevel: 15,
    flowState: 'optimal',
    sessionTime: '2h 15m',
    completedTasks: 8
  })

  const [optimizationSuggestions, setOptimizationSuggestions] = useState([
    {
      id: 1,
      type: 'focus',
      title: 'Minimize notifications',
      description: 'Disable non-essential notifications during deep work',
      impact: 'high',
      timeToApply: '30s'
    },
    {
      id: 2,
      type: 'environment',
      title: 'Optimize workspace theme',
      description: 'Switch to focus-enhancing color scheme',
      impact: 'medium',
      timeToApply: '10s'
    },
    {
      id: 3,
      type: 'workflow',
      title: 'Enable auto-save',
      description: 'Reduce cognitive load with automatic saving',
      impact: 'medium',
      timeToApply: '5s'
    }
  ])

  useEffect(() => {
    if (projectId) {
      analyzePerformance(projectId)
    }
  }, [projectId])

  const getFlowStateColor = (state) => {
    switch (state) {
      case 'optimal': return 'text-green-600 dark:text-green-400'
      case 'good': return 'text-blue-600 dark:text-blue-400'
      case 'moderate': return 'text-yellow-600 dark:text-yellow-400'
      case 'low': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getFlowStateIcon = (state) => {
    switch (state) {
      case 'optimal': return <FireIcon className="w-5 h-5" />
      case 'good': return <BoltIcon className="w-5 h-5" />
      case 'moderate': return <ChartBarIcon className="w-5 h-5" />
      case 'low': return <BeakerIcon className="w-5 h-5" />
      default: return <ChartBarIcon className="w-5 h-5" />
    }
  }

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const handleApplyOptimization = (optimizationId) => {
    setOptimizationSuggestions(prev => 
      prev.filter(opt => opt.id !== optimizationId)
    )
    
    // Update flow metrics optimistically
    setFlowMetrics(prev => ({
      ...prev,
      focusLevel: Math.min(100, prev.focusLevel + 5),
      productivityScore: Math.min(100, prev.productivityScore + 3),
      distractionLevel: Math.max(0, prev.distractionLevel - 5)
    }))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <BoltIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="font-medium text-gray-900 dark:text-white">Flow State</h3>
      </div>
      
      {/* Flow State Overview */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={getFlowStateColor(flowMetrics.flowState)}>
              {getFlowStateIcon(flowMetrics.flowState)}
            </div>
            <span className={`font-semibold capitalize ${getFlowStateColor(flowMetrics.flowState)}`}>
              {flowMetrics.flowState} Flow
            </span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {flowMetrics.sessionTime}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {flowMetrics.focusLevel}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Focus Level</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {flowMetrics.productivityScore}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Productivity</div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>Focus</span>
              <span>{flowMetrics.focusLevel}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <motion.div 
                className="bg-green-500 h-1.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${flowMetrics.focusLevel}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>Productivity</span>
              <span>{flowMetrics.productivityScore}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <motion.div 
                className="bg-blue-500 h-1.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${flowMetrics.productivityScore}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800 flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Tasks completed</span>
          <span className="font-semibold text-gray-900 dark:text-white">{flowMetrics.completedTasks}</span>
        </div>
      </div>

      {/* Optimization Suggestions */}
      {optimizationSuggestions.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <LightBulbIcon className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Optimization Suggestions
            </span>
          </div>
          
          <div className="space-y-2">
            {optimizationSuggestions.map((suggestion) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {suggestion.title}
                      </h4>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getImpactColor(suggestion.impact)}`}>
                        {suggestion.impact}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {suggestion.description}
                    </p>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      Takes {suggestion.timeToApply}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleApplyOptimization(suggestion.id)}
                    className="ml-3 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium transition-colors"
                  >
                    Apply
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Metrics from Backend */}
      {performanceOptimization.metrics && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Performance Analysis
          </h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Load Time</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {performanceOptimization.metrics.loadTime || 'N/A'}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Memory Usage</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {performanceOptimization.metrics.memoryUsage || 'N/A'}MB
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FlowStateOptimizer