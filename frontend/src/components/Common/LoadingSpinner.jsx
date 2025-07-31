import React from 'react'
import { motion } from 'framer-motion'

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  text = null,
  fullScreen = false,
  overlay = false 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const colorClasses = {
    primary: 'border-primary-600',
    white: 'border-white',
    gray: 'border-gray-600',
    red: 'border-red-600',
    green: 'border-green-600',
    blue: 'border-blue-600'
  }

  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div 
        className={`
          ${sizeClasses[size]} 
          border-2 
          ${colorClasses[color]} 
          border-t-transparent 
          rounded-full 
          animate-spin
        `}
      />
      {text && (
        <p className={`text-sm ${color === 'white' ? 'text-white' : 'text-gray-600'} font-medium`}>
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        {spinner}
      </div>
    )
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
        {spinner}
      </div>
    )
  }

  return spinner
}

// Skeleton Loading Component
export const SkeletonLoader = ({ 
  lines = 3, 
  className = "",
  animate = true 
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <motion.div
          key={index}
          className={`bg-gray-200 rounded h-4 ${animate ? 'animate-pulse' : ''}`}
          style={{ width: `${100 - (index * 10)}%` }}
          initial={animate ? { opacity: 0.3 } : {}}
          animate={animate ? { opacity: [0.3, 0.7, 0.3] } : {}}
          transition={animate ? { 
            duration: 1.5, 
            repeat: Infinity,
            delay: index * 0.1 
          } : {}}
        />
      ))}
    </div>
  )
}

// Card Skeleton Loader
export const CardSkeleton = ({ count = 1 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
          <div className="h-3 bg-gray-200 rounded w-full mb-2" />
          <div className="h-3 bg-gray-200 rounded w-5/6 mb-4" />
          <div className="h-8 bg-gray-200 rounded w-24" />
        </div>
      ))}
    </div>
  )
}

// Page Loading Component
export const PageLoader = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-3 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"
        />
        <h2 className="text-lg font-medium text-gray-900 mb-2">
          {message}
        </h2>
        <p className="text-gray-500 text-sm">
          Please wait while we prepare everything for you...
        </p>
      </div>
    </div>
  )
}

export default LoadingSpinner