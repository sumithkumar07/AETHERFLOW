import React from 'react'
import { motion } from 'framer-motion'
import { 
  LightBulbIcon, 
  SparklesIcon,
  ArrowRightIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

const SmartSuggestionsPanel = ({ suggestions = [], onSuggestionClick }) => {
  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="text-center">
          <LightBulbIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No suggestions available
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 mb-4">
        <SparklesIcon className="w-5 h-5 text-yellow-500" />
        <h3 className="font-medium text-gray-900 dark:text-white">
          Smart Suggestions
        </h3>
        <div className="flex-1 h-px bg-gradient-to-r from-yellow-300 to-transparent"></div>
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSuggestionClick && onSuggestionClick(suggestion)}
            className="group inline-flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 hover:border-yellow-300 dark:hover:border-yellow-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:text-yellow-800 dark:hover:text-yellow-200 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <LightBulbIcon className="w-4 h-4 text-yellow-500 group-hover:text-yellow-600" />
            <span className="font-medium">{suggestion}</span>
            <ArrowRightIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </motion.button>
        ))}
      </div>

      <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-start space-x-2">
          <ClockIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
              AI-Powered Suggestions
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              These suggestions are generated based on your current context, conversation history, and project requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SmartSuggestionsPanel