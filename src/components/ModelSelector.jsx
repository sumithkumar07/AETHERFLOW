import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon, SparklesIcon, CheckIcon } from '@heroicons/react/24/outline'

const ModelSelector = ({ selectedModel, onModelChange }) => {
  const [isOpen, setIsOpen] = useState(false)

  const models = [
    {
      id: 'gpt-4.1-nano',
      name: 'GPT-4.1 Nano',
      provider: 'OpenAI',
      description: 'Fast and efficient for most coding tasks',
      color: 'bg-green-100 text-green-800',
      icon: '🚀'
    },
    {
      id: 'claude-sonnet-4',
      name: 'Claude Sonnet 4',
      provider: 'Anthropic',
      description: 'Excellent for complex reasoning and analysis',
      color: 'bg-purple-100 text-purple-800',
      icon: '🧠'
    },
    {
      id: 'google/gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      provider: 'Google',
      description: 'Great for creative and multimodal tasks',
      color: 'bg-blue-100 text-blue-800',
      icon: '⚡'
    },
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'OpenAI',
      description: 'Most capable model for complex tasks',
      color: 'bg-orange-100 text-orange-800',
      icon: '💫'
    }
  ]

  const selectedModelData = models.find(m => m.id === selectedModel) || models[0]

  const handleModelSelect = (model) => {
    onModelChange(model.id)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
      >
        <span className="text-lg">{selectedModelData.icon}</span>
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-gray-900">
            {selectedModelData.name}
          </span>
          <span className="text-xs text-gray-500">
            {selectedModelData.provider}
          </span>
        </div>
        <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

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
              className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-20 overflow-hidden"
            >
              <div className="p-2">
                <div className="mb-2">
                  <h3 className="text-sm font-semibold text-gray-900 px-3 py-2">
                    Select AI Model
                  </h3>
                </div>
                
                {models.map((model) => (
                  <motion.button
                    key={model.id}
                    onClick={() => handleModelSelect(model)}
                    className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                      selectedModel === model.id
                        ? 'bg-primary-50 border border-primary-200'
                        : 'hover:bg-gray-50'
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-xl mt-0.5">{model.icon}</span>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">
                            {model.name}
                          </h4>
                          {selectedModel === model.id && (
                            <CheckIcon className="w-4 h-4 text-primary-600" />
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${model.color}`}>
                            {model.provider}
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-600 mt-2">
                          {model.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
              
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <SparklesIcon className="w-4 h-4 text-primary-600" />
                  <span className="text-xs text-gray-600">
                    Powered by Puter.js - Free & Unlimited
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