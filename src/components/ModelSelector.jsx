import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon, SparklesIcon, CheckIcon, CpuChipIcon } from '@heroicons/react/24/outline'

const ModelSelector = ({ selectedModel, onModelChange }) => {
  const [isOpen, setIsOpen] = useState(false)

  const models = [
    {
      id: 'gpt-4.1-nano',
      name: 'GPT-4.1 Nano',
      provider: 'OpenAI',
      description: 'Fast and efficient for most coding tasks',
      speed: 'Very Fast',
      quality: 'High',
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      icon: '🚀',
      recommended: true
    },
    {
      id: 'claude-sonnet-4',
      name: 'Claude Sonnet 4',
      provider: 'Anthropic',
      description: 'Excellent for complex reasoning and analysis',
      speed: 'Fast',
      quality: 'Very High',
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      icon: '🧠'
    },
    {
      id: 'google/gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      provider: 'Google',
      description: 'Great for creative and multimodal tasks',
      speed: 'Very Fast',
      quality: 'High',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      icon: '⚡'
    },
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'OpenAI',
      description: 'Most capable model for complex tasks',
      speed: 'Medium',
      quality: 'Very High',
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      icon: '💫'
    }
  ]

  const selectedModelData = models.find(m => m.id === selectedModel) || models[0]

  const handleModelSelect = (model) => {
    onModelChange(model.id)
    setIsOpen(false)
  }

  const getSpeedColor = (speed) => {
    switch (speed) {
      case 'Very Fast': return 'text-green-600 dark:text-green-400'
      case 'Fast': return 'text-blue-600 dark:text-blue-400'
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'Very High': return 'text-purple-600 dark:text-purple-400'
      case 'High': return 'text-blue-600 dark:text-blue-400'
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 shadow-lg"
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">{selectedModelData.icon}</span>
          <CpuChipIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </div>
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {selectedModelData.name}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {selectedModelData.provider}
          </span>
        </div>
        {selectedModelData.recommended && (
          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-medium">
            Recommended
          </span>
        )}
        <ChevronDownIcon className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", bounce: 0, duration: 0.2 }}
              className="absolute top-full right-0 mt-2 w-96 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 z-20 overflow-hidden"
            >
              <div className="p-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                    <SparklesIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span>Select AI Model</span>
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Choose the best model for your task
                  </p>
                </div>
                
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {models.map((model) => (
                    <motion.button
                      key={model.id}
                      onClick={() => handleModelSelect(model)}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-200 border ${
                        selectedModel === model.id
                          ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 shadow-md'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <span className="text-2xl mt-1">{model.icon}</span>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                {model.name}
                              </h4>
                              {model.recommended && (
                                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-medium">
                                  Recommended
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${model.color}`}>
                                {model.provider}
                              </span>
                            </div>
                            
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                              {model.description}
                            </p>
                            
                            {/* Model Stats */}
                            <div className="flex items-center space-x-4 text-xs">
                              <div className="flex items-center space-x-1">
                                <span className="text-gray-500 dark:text-gray-400">Speed:</span>
                                <span className={`font-medium ${getSpeedColor(model.speed)}`}>
                                  {model.speed}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-gray-500 dark:text-gray-400">Quality:</span>
                                <span className={`font-medium ${getQualityColor(model.quality)}`}>
                                  {model.quality}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {selectedModel === model.id && (
                          <CheckIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <div className="px-4 py-3 bg-gray-50/80 dark:bg-gray-900/50 border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <SparklesIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Powered by Puter.js
                    </span>
                  </div>
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Free & Unlimited
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ModelSelector