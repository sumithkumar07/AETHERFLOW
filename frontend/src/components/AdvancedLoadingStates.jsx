import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CpuChipIcon,
  BoltIcon,
  SparklesIcon,
  CircleStackIcon,
  CloudIcon,
  CodeBracketIcon,
  PaintBrushIcon,
  BeakerIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

// Enhanced loading spinner with customizable appearance
export const AdvancedSpinner = ({ 
  size = 'md',
  color = 'blue',
  variant = 'default',
  className = ''
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const colorClasses = {
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    green: 'text-green-500',
    red: 'text-red-500',
    yellow: 'text-yellow-500',
    cyan: 'text-cyan-500'
  }

  if (variant === 'dots') {
    return (
      <div className={`flex space-x-1 ${className}`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2
            }}
            className={`${sizeClasses.sm} ${colorClasses[color].replace('text-', 'bg-')} rounded-full`}
          />
        ))}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity
        }}
        className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full border-2 border-current ${className}`}
      />
    )
  }

  // Default spinner
  return (
    <motion.svg
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
      className={`${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        className="opacity-25"
      />
      <path
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        className="opacity-75"
      />
    </motion.svg>
  )
}

// Skeleton loader with realistic content shapes
export const SkeletonLoader = ({ 
  variant = 'text',
  lines = 3,
  className = '',
  animate = true
}) => {
  const animationClasses = animate 
    ? 'animate-pulse' 
    : ''

  const variants = {
    text: (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`h-4 bg-gray-200 dark:bg-gray-700 rounded ${animationClasses}`}
            style={{ 
              width: i === lines - 1 ? '75%' : '100%' 
            }}
          />
        ))}
      </div>
    ),
    card: (
      <div className={`p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg ${className}`}>
        <div className={`h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 ${animationClasses}`} />
        <div className={`h-6 bg-gray-200 dark:bg-gray-700 rounded mb-3 ${animationClasses}`} />
        <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 ${animationClasses}`} />
      </div>
    ),
    profile: (
      <div className={`flex items-center space-x-4 ${className}`}>
        <div className={`w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full ${animationClasses}`} />
        <div className="space-y-2 flex-1">
          <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 ${animationClasses}`} />
          <div className={`h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 ${animationClasses}`} />
        </div>
      </div>
    ),
    table: (
      <div className={`space-y-4 ${className}`}>
        {/* Header */}
        <div className={`h-6 bg-gray-200 dark:bg-gray-700 rounded ${animationClasses}`} />
        {/* Rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <div
                key={j}
                className={`h-4 bg-gray-200 dark:bg-gray-700 rounded ${animationClasses}`}
              />
            ))}
          </div>
        ))}
      </div>
    )
  }

  return variants[variant] || variants.text
}

// Advanced loading screen with progress and context
export const AdvancedLoadingScreen = ({ 
  message = 'Loading...',
  submessage = '',
  progress = 0,
  showProgress = true,
  context = 'general',
  steps = [],
  currentStep = 0,
  className = ''
}) => {
  const [displayedProgress, setDisplayedProgress] = useState(0)

  // Animate progress updates
  useEffect(() => {
    const timer = setInterval(() => {
      setDisplayedProgress(prev => {
        if (prev < progress) {
          return Math.min(prev + 2, progress)
        }
        return prev
      })
    }, 50)

    return () => clearInterval(timer)
  }, [progress])

  // Context-specific icons and colors
  const contextConfig = {
    ai: {
      icon: CpuChipIcon,
      color: 'from-blue-500 to-purple-600',
      bgColor: 'from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950'
    },
    chat: {
      icon: SparklesIcon,
      color: 'from-cyan-500 to-blue-600',
      bgColor: 'from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950'
    },
    development: {
      icon: CodeBracketIcon,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950'
    },
    design: {
      icon: PaintBrushIcon,
      color: 'from-pink-500 to-rose-600',
      bgColor: 'from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950'
    },
    testing: {
      icon: BeakerIcon,
      color: 'from-orange-500 to-red-600',
      bgColor: 'from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950'
    },
    collaboration: {
      icon: UserGroupIcon,
      color: 'from-indigo-500 to-purple-600',
      bgColor: 'from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950'
    },
    analytics: {
      icon: ChartBarIcon,
      color: 'from-violet-500 to-purple-600',
      bgColor: 'from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950'
    },
    general: {
      icon: BoltIcon,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950'
    }
  }

  const config = contextConfig[context] || contextConfig.general
  const Icon = config.icon

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.bgColor} flex items-center justify-center p-4 ${className}`}>
      <div className="text-center max-w-md w-full">
        {/* Main loading icon */}
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1.5, repeat: Infinity }
          }}
          className="mb-8"
        >
          <div className={`w-20 h-20 bg-gradient-to-br ${config.color} rounded-3xl flex items-center justify-center mx-auto shadow-2xl`}>
            <Icon className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        {/* Loading message */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
        >
          {message}
        </motion.h2>

        {submessage && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 dark:text-gray-400 mb-6"
          >
            {submessage}
          </motion.p>
        )}

        {/* Progress bar */}
        {showProgress && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Progress
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round(displayedProgress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: `${displayedProgress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`bg-gradient-to-r ${config.color} h-2 rounded-full`}
              />
            </div>
          </div>
        )}

        {/* Step indicators */}
        {steps.length > 0 && (
          <div className="space-y-3">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  index < currentStep
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                    : index === currentStep
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index < currentStep
                    ? 'bg-green-500 text-white'
                    : index === currentStep
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                }`}>
                  {index < currentStep ? '✓' : index + 1}
                </div>
                <span className="text-sm font-medium">{step}</span>
                {index === currentStep && (
                  <AdvancedSpinner size="xs" variant="dots" />
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Floating particles for visual enhancement */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [-20, -40, -20],
                x: [0, Math.random() * 40 - 20, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
              className={`absolute w-2 h-2 bg-gradient-to-r ${config.color} rounded-full`}
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${50 + Math.random() * 30}%`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Smart loading wrapper that shows different states
export const SmartLoader = ({ 
  isLoading,
  error,
  empty = false,
  emptyMessage = 'No data available',
  errorTitle = 'Something went wrong',
  children,
  skeleton = 'text',
  className = ''
}) => {
  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <span className="text-2xl">⚠️</span>
        </motion.div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {errorTitle}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {typeof error === 'string' ? error : 'An unexpected error occurred'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={className}>
        <SkeletonLoader variant={skeleton} />
      </div>
    )
  }

  if (empty) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CircleStackIcon className="w-8 h-8 text-gray-400" />
        </motion.div>
        <p className="text-gray-600 dark:text-gray-400">
          {emptyMessage}
        </p>
      </div>
    )
  }

  return children
}

export default {
  AdvancedSpinner,
  SkeletonLoader,
  AdvancedLoadingScreen,
  SmartLoader
}