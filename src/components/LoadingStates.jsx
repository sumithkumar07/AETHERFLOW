import React from 'react'
import { motion } from 'framer-motion'
import { SparklesIcon } from '@heroicons/react/24/outline'

const LoadingStates = {
  // Full screen loading
  FullScreen: ({ message = 'Loading...' }) => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
        >
          <SparklesIcon className="w-8 h-8 text-white" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl font-semibold text-gray-900 dark:text-white mb-2"
        >
          {message}
        </motion.h2>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 200 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto"
        />
      </div>
    </div>
  ),

  // Page transition loading
  PageTransition: () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading page...</p>
      </motion.div>
    </div>
  ),

  // Component loading
  Component: ({ size = 'md', message = 'Loading...' }) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-8 h-8',
      lg: 'w-12 h-12'
    }

    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className={`${sizeClasses[size]} border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-2`}></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
        </div>
      </div>
    )
  },

  // Inline loading
  Inline: ({ message = 'Loading...' }) => (
    <div className="flex items-center space-x-2">
      <div className="w-4 h-4 border-2 border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
      <span className="text-sm text-gray-600 dark:text-gray-400">{message}</span>
    </div>
  ),

  // Button loading
  Button: () => (
    <div className="flex items-center space-x-2">
      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      <span>Loading...</span>
    </div>
  )
}

export default LoadingStates