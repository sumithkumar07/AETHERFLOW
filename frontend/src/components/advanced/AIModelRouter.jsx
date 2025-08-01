import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChartBarIcon, CpuChipIcon, SparklesIcon, ClockIcon } from '@heroicons/react/24/outline'
import { aiRouterAPI } from '../../services/advancedAPI'
import toast from 'react-hot-toast'

const AIModelRouter = ({ onModelSelect, currentModel = 'gpt-4o-mini' }) => {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [performance, setPerformance] = useState({})
  const [recommendations, setRecommendations] = useState([])

  const modelCapabilities = {
    'gpt-4o-mini': {
      name: 'GPT-4 Mini',
      provider: 'OpenAI',
      cost: 0.00015,
      speed: 9.0,
      quality: 7.0,
      strengths: ['Fast', 'Efficient', 'General'],
      color: 'bg-green-500',
      icon: SparklesIcon,
      bestFor: ['Quick responses', 'Simple tasks', 'Chat']
    },
    'gpt-4': {
      name: 'GPT-4',
      provider: 'OpenAI', 
      cost: 0.03,
      speed: 6.0,
      quality: 9.5,
      strengths: ['Creative', 'Complex reasoning', 'High quality'],
      color: 'bg-purple-500',
      icon: SparklesIcon,
      bestFor: ['Creative writing', 'Complex analysis', 'Planning']
    },
    'claude-3-sonnet': {
      name: 'Claude 3 Sonnet',
      provider: 'Anthropic',
      cost: 0.015,
      speed: 7.0,
      quality: 9.0,
      strengths: ['Code', 'Analysis', 'Large context'],
      color: 'bg-blue-500',
      icon: CpuChipIcon,
      bestFor: ['Code generation', 'Debugging', 'Technical docs']
    },
    'gemini-2.5-flash': {
      name: 'Gemini 2.5 Flash',
      provider: 'Google',
      cost: 0.0001,
      speed: 8.5,
      quality: 8.0,
      strengths: ['Multimodal', 'Fast', 'Large context'],  
      color: 'bg-orange-500',
      icon: ChartBarIcon,
      bestFor: ['Data analysis', 'Multimodal tasks', 'Speed']
    }
  }

  useEffect(() => {
    loadModels()
    loadPerformanceData()
    loadRecommendations()
  }, [])

  const loadModels = async () => {
    try {
      // Try to load models from API
      const response = await aiRouterAPI.getAvailableModels()
      
      if (response.data.success) {
        const apiModels = response.data.models
        // Convert API response to local format
        const modelList = apiModels.map(model => model.name)
        setModels(modelList)
        
        // Update model capabilities with API data
        apiModels.forEach(apiModel => {
          if (modelCapabilities[apiModel.name]) {
            modelCapabilities[apiModel.name] = {
              ...modelCapabilities[apiModel.name],
              cost: apiModel.cost_per_token,
              speed: apiModel.speed_score,
              quality: apiModel.quality_score,
              strengths: apiModel.strengths,
              bestFor: apiModel.specialized_for.map(task => 
                task.replace('_', ' ').toLowerCase()
              )
            }
          }
        })
      } else {
        // Fallback to local data
        setModels(Object.keys(modelCapabilities))
      }
      setLoading(false)
    } catch (error) {
      console.error('Failed to load models:', error)
      // Fallback to local data
      setModels(Object.keys(modelCapabilities))
      setLoading(false)
    }
  }

  const loadPerformanceData = async () => {
    try {
      // Try to load performance data from API
      const response = await aiRouterAPI.getModelPerformance()
      
      if (response.data.success) {
        const perfData = response.data.data
        setPerformance(perfData.performance_history || {
          'gpt-4o-mini': { responseTime: 1.2, successRate: 98.5, usage: 45 },
          'gpt-4': { responseTime: 3.8, successRate: 96.2, usage: 23 },
          'claude-3-sonnet': { responseTime: 2.1, successRate: 97.8, usage: 31 },
          'gemini-2.5-flash': { responseTime: 1.8, successRate: 95.1, usage: 28 }
        })
      } else {
        // Fallback to mock data
        setPerformance({
          'gpt-4o-mini': { responseTime: 1.2, successRate: 98.5, usage: 45 },
          'gpt-4': { responseTime: 3.8, successRate: 96.2, usage: 23 },
          'claude-3-sonnet': { responseTime: 2.1, successRate: 97.8, usage: 31 },
          'gemini-2.5-flash': { responseTime: 1.8, successRate: 95.1, usage: 28 }
        })
      }
    } catch (error) {
      console.error('Failed to load performance data:', error)
      // Fallback to mock data
      setPerformance({
        'gpt-4o-mini': { responseTime: 1.2, successRate: 98.5, usage: 45 },
        'gpt-4': { responseTime: 3.8, successRate: 96.2, usage: 23 },
        'claude-3-sonnet': { responseTime: 2.1, successRate: 97.8, usage: 31 },
        'gemini-2.5-flash': { responseTime: 1.8, successRate: 95.1, usage: 28 }
      })
    }
  }

  const loadRecommendations = async () => {
    // Simulate AI recommendations
    setRecommendations([
      {
        model: 'claude-3-sonnet',
        reason: 'Best for your current coding task',
        confidence: 0.92
      },
      {
        model: 'gpt-4o-mini', 
        reason: 'Fastest response for simple queries',
        confidence: 0.87
      }
    ])
  }

  const handleModelSelect = (modelId) => {
    onModelSelect(modelId)
  }

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-sm border">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">AI Model Router</h3>
          <p className="text-sm text-gray-600">Intelligent model selection for optimal performance</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <ClockIcon className="w-4 h-4" />
          <span>Auto-optimization enabled</span>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Smart Recommendations</h4>
          <div className="space-y-2">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-800">
                    {modelCapabilities[rec.model]?.name}: {rec.reason}
                  </span>
                </div>
                <span className="text-xs text-blue-600">
                  {Math.round(rec.confidence * 100)}% confidence
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Model Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {models.map((modelId) => {
            const model = modelCapabilities[modelId]
            const perf = performance[modelId] || {}
            const isSelected = currentModel === modelId
            const IconComponent = model.icon

            return (
              <motion.div
                key={modelId}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`
                  relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-lg' 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }
                `}
                onClick={() => handleModelSelect(modelId)}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}

                {/* Model header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 ${model.color} rounded-lg`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{model.name}</h4>
                      <p className="text-sm text-gray-500">{model.provider}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      ${model.cost.toFixed(5)}/1K tokens
                    </div>
                  </div>
                </div>

                {/* Performance metrics */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {model.speed}/10
                    </div>
                    <div className="text-xs text-gray-500">Speed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {model.quality}/10
                    </div>
                    <div className="text-xs text-gray-500">Quality</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {perf.responseTime || '--'}s
                    </div>
                    <div className="text-xs text-gray-500">Response</div>
                  </div>
                </div>

                {/* Strengths */}
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {model.strengths.map((strength, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                      >
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Best for */}
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Best for:</span> {model.bestFor.join(', ')}
                </div>

                {/* Real-time metrics */}
                {perf.successRate && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Success Rate</span>
                      <span className="font-medium">{perf.successRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Usage Today</span>
                      <span className="font-medium">{perf.usage} requests</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Performance Overview */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Performance Overview</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">156</div>
            <div className="text-gray-500">Total Requests</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">97.2%</div>
            <div className="text-gray-500">Avg Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">2.1s</div>
            <div className="text-gray-500">Avg Response Time</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-purple-600">$2.34</div>
            <div className="text-gray-500">Cost Today</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIModelRouter