import React from 'react'
import { motion } from 'framer-motion'
import { ArrowPathIcon, SparklesIcon } from '@heroicons/react/24/outline'

const LoadingStates = {
  // Full screen loading
  FullScreen: ({ message = "Loading..." }) => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 mx-auto mb-4"
        >
          <SparklesIcon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
        </motion.div>
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-lg text-gray-600 dark:text-gray-400"
        >
          {message}
        </motion.p>
      </div>
    </div>
  ),

  // Page transition loading
  PageTransition: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center space-y-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8"
        >
          <ArrowPathIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </motion.div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading page...</p>
      </motion.div>
    </div>
  ),

  // Inline loading for messages
  Inline: ({ message = "Processing..." }) => (
    <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="w-5 h-5"
      >
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </motion.div>
      <span className="text-sm text-blue-700 dark:text-blue-300">{message}</span>
    </div>
  ),

  // Button loading state
  Button: ({ size = 'medium' }) => {
    const sizeClasses = {
      small: 'w-3 h-3',
      medium: 'w-4 h-4', 
      large: 'w-5 h-5'
    }

    return (
      <div className={`${sizeClasses[size]} border-2 border-white border-t-transparent rounded-full animate-spin`}></div>
    )
  },

  // Skeleton loading for content
  Skeleton: ({ className = '', lines = 3 }) => (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`bg-gray-200 dark:bg-gray-700 rounded h-4 mb-2 ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  ),

  // Card skeleton
  CardSkeleton: ({ count = 1 }) => (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  ),

  // Dots loading animation
  Dots: ({ size = 'medium', color = 'blue' }) => {
    const sizeClasses = {
      small: 'w-1 h-1',
      medium: 'w-2 h-2',
      large: 'w-3 h-3'
    }

    const colorClasses = {
      blue: 'bg-blue-600',
      gray: 'bg-gray-400',
      white: 'bg-white'
    }

    return (
      <div className="flex items-center space-x-1">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full`}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: index * 0.2
            }}
          />
        ))}
      </div>
    )
  }
}

export default LoadingStates