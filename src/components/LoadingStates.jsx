import React from 'react'
import { motion } from 'framer-motion'
import { SparklesIcon } from '@heroicons/react/24/outline'

const LoadingStates = {
  // Enhanced full screen loading with better animations
  FullScreen: ({ message = 'Loading...' }) => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
        >
          <SparklesIcon className="w-10 h-10 text-white" />
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-gray-900 dark:text-white mb-3"
        >
          {message}
        </motion.h2>
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 240 }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "reverse"
          }}
          className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 rounded-full mx-auto shadow-lg"
        />
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-sm text-gray-600 dark:text-gray-400 mt-4"
        >
          Please wait while we set things up...
        </motion.p>
      </div>
    </div>
  ),

  // Enhanced page transition loading
  PageTransition: () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full mx-auto mb-4"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-medium text-gray-700 dark:text-gray-300"
        >
          Loading page...
        </motion.p>
      </motion.div>
    </div>
  ),

  // Enhanced component loading
  Component: ({ size = 'md', message = 'Loading...' }) => {
    const sizeClasses = {
      sm: 'w-6 h-6',
      md: 'w-10 h-10',
      lg: 'w-16 h-16'
    }

    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className={`${sizeClasses[size]} border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-400 rounded-full mx-auto mb-3`}
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-medium text-gray-600 dark:text-gray-400"
          >
            {message}
          </motion.p>
        </div>
      </div>
    )
  },

  // Enhanced inline loading
  Inline: ({ message = 'Loading...' }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center space-x-3 py-2"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400 rounded-full"
      />
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{message}</span>
    </motion.div>
  ),

  // Enhanced button loading
  Button: ({ message = 'Loading...' }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center space-x-2"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
      />
      <span>{message}</span>
    </motion.div>
  ),

  // New: Skeleton loader for content
  Skeleton: ({ lines = 3, className = '' }) => (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.1
          }}
          className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  ),

  // New: Card skeleton
  CardSkeleton: ({ className = '' }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg ${className}`}>
      <motion.div
        initial={{ opacity: 0.6 }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md mb-4 w-3/4"
      />
      <LoadingStates.Skeleton lines={3} />
    </div>
  ),

  // New: Avatar skeleton
  Avatar: ({ size = 'md' }) => {
    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-12 h-12',
      lg: 'w-16 h-16'
    }

    return (
      <motion.div
        initial={{ opacity: 0.6 }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className={`${sizeClasses[size]} bg-gray-200 dark:bg-gray-700 rounded-full`}
      />
    )
  }
}

export default LoadingStates