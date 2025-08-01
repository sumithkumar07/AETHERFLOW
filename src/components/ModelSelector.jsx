import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDownIcon,
  SparklesIcon,
  BoltIcon,
  CpuChipIcon,
  BeakerIcon
} from '@heroicons/react/24/outline'
import { useChatStore } from '../store/chatStore'

const ModelSelector = () => {
  const { selectedModel, setSelectedModel } = useChatStore()
  const [isOpen, setIsOpen] = useState(false)

  const models = [
    {
      id: 'gpt-4.1-nano',
      name: 'GPT-4.1 Nano',
      provider: 'OpenAI',
      description: 'Fast and efficient for most tasks',
      icon: BoltIcon,
      color: 'from-green-500 to-emerald-600',
      free: true
    },
    {
      id: 'claude-sonnet-4',
      name: 'Claude Sonnet 4',
      provider: 'Anthropic',
      description: 'Excellent for complex reasoning',
      icon: SparklesIcon,
      color: 'from-purple-500 to-pink-600',
      free: true
    },
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      provider: 'Google',
      description: 'Great for creative tasks',
      icon: BeakerIcon,
      color: 'from-blue-500 to-cyan-600',
      free: true
    },
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'OpenAI',
      description: 'Most capable general model',
      icon: CpuChipIcon,
      color: 'from-orange-500 to-red-600',
      free: true
    }
  ]

  const currentModel = models.find(m => m.id === selectedModel) || models[0]
  const CurrentIcon = currentModel.icon

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${currentModel.color} p-1 flex items-center justify-center`}>
          <CurrentIcon className="w-4 h-4 text-white" />
        </div>
        <div className="text-left">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {currentModel.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {currentModel.provider}
          </div>
        </div>
        <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50"
          >
            <div className="p-2">
              {models.map((model) => {
                const Icon = model.icon
                return (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id)
                      setIsOpen(false)
                    }}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors text-left ${
                      selectedModel === model.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${model.color} p-1.5 flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{model.name}</span>
                        {model.free && (
                          <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded">
                            FREE
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {model.provider} • {model.description}
                      </div>
                    </div>
                    {selectedModel === model.id && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </button>
                )
              })}
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                All models are free via Puter.js integration
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
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