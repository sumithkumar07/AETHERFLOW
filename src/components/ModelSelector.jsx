import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDownIcon,
  CpuChipIcon,
  BoltIcon,
  SparklesIcon,
  CheckIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { useChatStore, AI_MODELS } from '../store/chatStore'

const ModelSelector = ({ className = '' }) => {
  const { selectedModel, setSelectedModel, getModelStats } = useChatStore()
  const [isOpen, setIsOpen] = useState(false)
  const [showDetails, setShowDetails] = useState({})
  
  const modelStats = getModelStats()
  const availableModels = Object.entries(AI_MODELS)

  const getSpeedIcon = (speed) => {
    switch (speed) {
      case 'fastest': return <BoltIcon className="w-4 h-4 text-green-500" />
      case 'fast': return <BoltIcon className="w-4 h-4 text-blue-500" />
      case 'medium': return <CpuChipIcon className="w-4 h-4 text-yellow-500" />
      default: return <CpuChipIcon className="w-4 h-4 text-gray-500" />
    }
  }

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'highest': return 'text-purple-600 dark:text-purple-400'
      case 'high': return 'text-blue-600 dark:text-blue-400'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const selectedModelInfo = AI_MODELS[selectedModel]

  return (
    <div className={`relative ${className}`}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <SparklesIcon className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedModelInfo?.name}
            </span>
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              {getSpeedIcon(selectedModelInfo?.speed)}
              <span>{selectedModelInfo?.provider}</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full" />
              <span className={getQualityColor(selectedModelInfo?.quality)}>
                {selectedModelInfo?.quality} quality
              </span>
            </div>
          </div>
        </div>
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDownIcon className="w-5 h-5 text-gray-400" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-2 space-y-1">
              {availableModels.map(([modelId, model], index) => {
                const isSelected = modelId === selectedModel
                const stats = modelStats[modelId]
                
                return (
                  <motion.div
                    key={modelId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative"
                  >
                    <button
                      onClick={() => {
                        setSelectedModel(modelId)
                        setIsOpen(false)
                      }}
                      onMouseEnter={() => setShowDetails({ ...showDetails, [modelId]: true })}
                      onMouseLeave={() => setShowDetails({ ...showDetails, [modelId]: false })}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                        isSelected 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isSelected 
                            ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}>
                          <SparklesIcon className={`w-4 h-4 ${
                            isSelected ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                          }`} />
                        </div>
                        
                        <div className="flex flex-col items-start">
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium ${
                              isSelected 
                                ? 'text-blue-900 dark:text-blue-100' 
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {model.name}
                            </span>
                            {model.cost === 'free' && (
                              <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">
                                FREE
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                            {getSpeedIcon(model.speed)}
                            <span>{model.provider}</span>
                            {stats.usage > 0 && (
                              <>
                                <span className="w-1 h-1 bg-gray-400 rounded-full" />
                                <span>{stats.usage} uses</span>
                                <span className="w-1 h-1 bg-gray-400 rounded-full" />
                                <span>{(stats.avgResponseTime / 1000).toFixed(1)}s avg</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <InformationCircleIcon 
                          className="w-4 h-4 text-gray-400 hover:text-blue-500 transition-colors" 
                        />
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                          >
                            <CheckIcon className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                      </div>
                    </button>

                    {/* Model Details Tooltip */}
                    <AnimatePresence>
                      {showDetails[modelId] && (
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="absolute left-full top-0 ml-2 w-72 bg-gray-900 dark:bg-gray-800 text-white rounded-lg p-4 shadow-2xl z-60 border border-gray-700"
                        >
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-semibold text-sm">{model.name}</h4>
                              <p className="text-xs text-gray-300 mt-1">{model.description}</p>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Speed:</span>
                                <div className="flex items-center space-x-1">
                                  {getSpeedIcon(model.speed)}
                                  <span className="capitalize">{model.speed}</span>
                                </div>
                              </div>
                              
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Quality:</span>
                                <span className={`capitalize ${getQualityColor(model.quality)}`}>
                                  {model.quality}
                                </span>
                              </div>
                              
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Cost:</span>
                                <span className="text-green-400 font-medium uppercase">
                                  {model.cost}
                                </span>
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-xs text-gray-400">Capabilities:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {model.capabilities.map((capability) => (
                                  <span
                                    key={capability}
                                    className="px-2 py-0.5 text-xs bg-gray-800 dark:bg-gray-700 rounded-full"
                                  >
                                    {capability}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            {stats.usage > 0 && (
                              <div className="pt-2 border-t border-gray-700">
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-400">Your Usage:</span>
                                  <span>{stats.usage} messages</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-400">Avg Response:</span>
                                  <span>{(stats.avgResponseTime / 1000).toFixed(1)}s</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
            
            <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-green-800 dark:text-green-300 font-medium">
                  🚀 Unlimited Local AI - No Limits, No Costs, Complete Privacy!
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default ModelSelector