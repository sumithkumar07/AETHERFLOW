import React from 'react'
import { motion } from 'framer-motion'
import { SparklesIcon, CodeBracketIcon, RocketLaunchIcon } from '@heroicons/react/24/outline'

// Skeleton loading components
export const ProjectCardSkeleton = () => (
  <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 animate-pulse">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full mb-1"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
      </div>
      <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
    </div>
    <div className="flex items-center justify-between mb-3">
      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
      <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
    </div>
    <div className="flex space-x-1 mb-3">
      <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
      <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
      <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-14"></div>
    </div>
    <div className="flex items-center justify-between">
      <div className="flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        ))}
      </div>
      <div className="flex space-x-2">
        <div className="h-7 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
        <div className="h-7 bg-gray-300 dark:bg-gray-600 rounded w-7"></div>
      </div>
    </div>
  </div>
)

export const TemplateCardSkeleton = () => (
  <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden animate-pulse">
    <div className="aspect-video bg-gray-300 dark:bg-gray-600"></div>
    <div className="p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-8"></div>
        </div>
      </div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full mb-1"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3 mb-4"></div>
      <div className="flex flex-wrap gap-1 mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
        ))}
      </div>
      <div className="flex items-center space-x-2">
        <div className="h-9 bg-gray-300 dark:bg-gray-600 rounded flex-1"></div>
        <div className="h-9 bg-gray-300 dark:bg-gray-600 rounded w-9"></div>
      </div>
    </div>
  </div>
)

export const IntegrationCardSkeleton = () => (
  <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div>
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-1"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
      </div>
    </div>
    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full mb-1"></div>
    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
    <div className="flex flex-wrap gap-1 mb-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
      ))}
    </div>
    <div className="flex items-center justify-between text-xs mb-4">
      <div className="flex items-center space-x-3">
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
      </div>
      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
    </div>
    <div className="flex items-center space-x-2">
      <div className="h-9 bg-gray-300 dark:bg-gray-600 rounded flex-1"></div>
      <div className="h-9 bg-gray-300 dark:bg-gray-600 rounded w-9"></div>
    </div>
  </div>
)

// Loading spinner components
export const LoadingSpinner = ({ size = 'md', color = 'blue' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const colorClasses = {
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    green: 'text-green-600',
    red: 'text-red-600'
  }

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`${sizeClasses[size]} ${colorClasses[color]}`}
    >
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </motion.div>
  )
}

// Pulsing dots loader
export const PulsingDots = ({ color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
    green: 'bg-green-600',
    gray: 'bg-gray-600'
  }

  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`w-2 h-2 rounded-full ${colorClasses[color]}`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.5, 1]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  )
}

// AI thinking animation
export const AIThinking = () => (
  <motion.div 
    className="flex items-center space-x-3 text-gray-600 dark:text-gray-400"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
      <SparklesIcon className="w-4 h-4 text-white" />
    </div>
    <div className="flex flex-col">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">AI is thinking</span>
        <PulsingDots color="blue" />
      </div>
      <motion.div
        className="text-xs text-gray-500 dark:text-gray-500"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Processing your request...
      </motion.div>
    </div>
  </motion.div>
)

// Page loading component
export const PageLoader = ({ message = "Loading..." }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
    <motion.div 
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
        <LoadingSpinner size="lg" color="white" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {message}
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        Please wait while we prepare everything for you
      </p>
    </motion.div>
  </div>
)

// Project building animation
export const ProjectBuilding = ({ projectName }) => (
  <motion.div 
    className="flex items-center space-x-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
  >
    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
      <CodeBracketIcon className="w-5 h-5 text-white" />
    </div>
    <div className="flex-1">
      <h4 className="font-medium text-gray-900 dark:text-white">
        Building {projectName}
      </h4>
      <div className="flex items-center space-x-2 mt-1">
        <motion.div
          className="w-2 h-2 bg-yellow-500 rounded-full"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Compiling and optimizing...
        </span>
      </div>
    </div>
    <PulsingDots color="yellow" />
  </motion.div>
)

// Project deploying animation
export const ProjectDeploying = ({ projectName }) => (
  <motion.div 
    className="flex items-center space-x-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
  >
    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
      <RocketLaunchIcon className="w-5 h-5 text-white" />
    </div>
    <div className="flex-1">
      <h4 className="font-medium text-gray-900 dark:text-white">
        Deploying {projectName}
      </h4>
      <div className="flex items-center space-x-2 mt-1">
        <motion.div
          className="w-2 h-2 bg-green-500 rounded-full"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Publishing to the cloud...
        </span>
      </div>
    </div>
    <PulsingDots color="green" />
  </motion.div>
)

// Empty state component
export const EmptyState = ({ 
  icon: Icon = SparklesIcon,
  title = "Nothing here yet",
  description = "Get started by creating something new",
  actionLabel = "Get Started",
  onAction = () => {}
}) => (
  <motion.div 
    className="text-center py-12"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-6 opacity-60">
      <Icon className="w-8 h-8 text-white" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
      {description}
    </p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="btn-primary"
      >
        {actionLabel}
      </button>
    )}
  </motion.div>
)

// Error state component
export const ErrorState = ({ 
  title = "Something went wrong",
  description = "We encountered an error. Please try again.",
  actionLabel = "Try Again",
  onAction = () => {}
}) => (
  <motion.div 
    className="text-center py-12"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
      {description}
    </p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="btn-secondary"
      >
        {actionLabel}
      </button>
    )}
  </motion.div>
)

// Full screen loading components
export const FullScreen = () => (
  <PageLoader message="Loading Application..." />
)

export const PageTransition = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="xl" color="blue" />
  </div>
)

// Default export with all components
const LoadingStates = {
  ProjectCardSkeleton,
  TemplateCardSkeleton,
  IntegrationCardSkeleton,
  LoadingSpinner,
  PulsingDots,
  AIThinking,
  PageLoader,
  ProjectBuilding,
  ProjectDeploying,
  EmptyState,
  ErrorState,
  FullScreen,
  PageTransition
}

export default LoadingStates