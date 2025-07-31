import React from 'react'
import { motion } from 'framer-motion'

// Full page loading spinner
export const PageLoader = ({ message = "Loading..." }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  </div>
)

// Button loading state
export const ButtonLoader = ({ size = 'sm' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }
  
  return (
    <div className={`loading-spinner ${sizeClasses[size]}`}></div>
  )
}

// Chat message loading
export const ChatLoader = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex justify-start mb-6"
  >
    <div className="flex space-x-3 max-w-3xl">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
        <div className="w-4 h-4 loading-spinner"></div>
      </div>
      <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
          <span className="text-sm text-gray-500">AI is thinking...</span>
        </div>
      </div>
    </div>
  </motion.div>
)

// Skeleton loaders
export const CardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
    <div className="flex items-center space-x-4 mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 rounded"></div>
      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      <div className="h-3 bg-gray-200 rounded w-4/6"></div>
    </div>
    <div className="flex space-x-2 mt-4">
      <div className="h-8 bg-gray-200 rounded w-20"></div>
      <div className="h-8 bg-gray-200 rounded w-16"></div>
    </div>
  </div>
)

export const TemplateSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200"></div>
    <div className="p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="h-6 bg-gray-200 rounded w-16"></div>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
        <div className="h-6 bg-gray-200 rounded w-14"></div>
      </div>
      <div className="flex space-x-2">
        <div className="h-9 bg-gray-200 rounded flex-1"></div>
        <div className="h-9 bg-gray-200 rounded w-12"></div>
      </div>
    </div>
  </div>
)

export const ProjectSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
    </div>
    <div className="flex items-center justify-between text-sm mb-4">
      <div className="h-3 bg-gray-200 rounded w-24"></div>
      <div className="h-3 bg-gray-200 rounded w-16"></div>
    </div>
    <div className="flex flex-wrap gap-1 mb-4">
      <div className="h-5 bg-gray-200 rounded w-12"></div>
      <div className="h-5 bg-gray-200 rounded w-16"></div>
      <div className="h-5 bg-gray-200 rounded w-14"></div>
    </div>
    <div className="flex items-center space-x-2">
      <div className="h-8 bg-gray-200 rounded flex-1"></div>
      <div className="h-8 bg-gray-200 rounded w-10"></div>
      <div className="h-8 bg-gray-200 rounded w-10"></div>
      <div className="h-8 bg-gray-200 rounded w-10"></div>
    </div>
  </div>
)

// Shimmer effect component
export const ShimmerCard = ({ className = "" }) => (
  <div className={`shimmer rounded-lg ${className}`}></div>
)

// Progress bar
export const ProgressBar = ({ progress, className = "" }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <motion.div
      className="bg-primary-600 h-2 rounded-full"
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.5 }}
    />
  </div>
)

// Loading overlay
export const LoadingOverlay = ({ show, message = "Loading..." }) => {
  if (!show) return null
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-lg p-6 text-center min-w-[200px]">
        <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </motion.div>
  )
}

// Status indicator
export const StatusIndicator = ({ status, className = "" }) => {
  const statusClasses = {
    online: 'status-online',
    offline: 'status-offline',
    error: 'status-error',
    loading: 'bg-yellow-500 animate-pulse'
  }
  
  return (
    <span className={`status-dot ${statusClasses[status]} ${className}`}></span>
  )
}

export default {
  PageLoader,
  ButtonLoader,
  ChatLoader,
  CardSkeleton,
  TemplateSkeleton,
  ProjectSkeleton,
  ShimmerCard,
  ProgressBar,
  LoadingOverlay,
  StatusIndicator
}