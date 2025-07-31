import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { create } from 'zustand'
import toast from 'react-hot-toast'

// Enhanced notification store
export const useNotificationStore = create((set, get) => ({
  notifications: [],
  
  addNotification: (notification) => {
    const id = Date.now().toString()
    const newNotification = {
      id,
      ...notification,
      timestamp: new Date(),
      read: false
    }
    
    set(state => ({
      notifications: [newNotification, ...state.notifications]
    }))
    
    // Auto-remove after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        get().removeNotification(id)
      }, notification.duration || 5000)
    }
    
    return id
  },
  
  removeNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }))
  },
  
  markAsRead: (id) => {
    set(state => ({
      notifications: state.notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    }))
  },
  
  clearAll: () => {
    set({ notifications: [] })
  },
  
  getUnreadCount: () => {
    return get().notifications.filter(n => !n.read).length
  }
}))

// Success notification
export const showSuccess = (message, options = {}) => {
  const { addNotification } = useNotificationStore.getState()
  
  toast.success(message, {
    icon: '✅',
    style: {
      background: 'rgba(16, 185, 129, 0.1)',
      color: 'rgb(16, 185, 129)',
      border: '1px solid rgba(16, 185, 129, 0.2)',
    },
    ...options
  })
  
  return addNotification({
    type: 'success',
    title: 'Success',
    message,
    ...options
  })
}

// Error notification
export const showError = (message, options = {}) => {
  const { addNotification } = useNotificationStore.getState()
  
  toast.error(message, {
    icon: '❌',
    style: {
      background: 'rgba(239, 68, 68, 0.1)',
      color: 'rgb(239, 68, 68)',
      border: '1px solid rgba(239, 68, 68, 0.2)',
    },
    duration: 6000,
    ...options
  })
  
  return addNotification({
    type: 'error',
    title: 'Error',
    message,
    duration: 6000,
    ...options
  })
}

// Warning notification
export const showWarning = (message, options = {}) => {
  const { addNotification } = useNotificationStore.getState()
  
  toast(message, {
    icon: '⚠️',
    style: {
      background: 'rgba(245, 158, 11, 0.1)',
      color: 'rgb(245, 158, 11)',
      border: '1px solid rgba(245, 158, 11, 0.2)',
    },
    ...options
  })
  
  return addNotification({
    type: 'warning',
    title: 'Warning',
    message,
    ...options
  })
}

// Info notification
export const showInfo = (message, options = {}) => {
  const { addNotification } = useNotificationStore.getState()
  
  toast(message, {
    icon: 'ℹ️',
    style: {
      background: 'rgba(59, 130, 246, 0.1)',
      color: 'rgb(59, 130, 246)',
      border: '1px solid rgba(59, 130, 246, 0.2)',
    },
    ...options
  })
  
  return addNotification({
    type: 'info',
    title: 'Info',
    message,
    ...options
  })
}

// Loading notification
export const showLoading = (message, options = {}) => {
  const { addNotification } = useNotificationStore.getState()
  
  const toastId = toast.loading(message, {
    style: {
      background: 'rgba(107, 114, 128, 0.1)',
      color: 'rgb(107, 114, 128)',
      border: '1px solid rgba(107, 114, 128, 0.2)',
    },
    ...options
  })
  
  const notificationId = addNotification({
    type: 'loading',
    title: 'Loading',
    message,
    duration: 0, // Don't auto-remove
    toastId,
    ...options
  })
  
  return { notificationId, toastId }
}

// Update loading notification
export const updateLoading = (toastId, message, type = 'success') => {
  const { removeNotification } = useNotificationStore.getState()
  
  if (type === 'success') {
    toast.success(message, { id: toastId })
  } else if (type === 'error') {
    toast.error(message, { id: toastId })
  } else {
    toast(message, { id: toastId })
  }
  
  // Find and remove the loading notification
  const notifications = useNotificationStore.getState().notifications
  const loadingNotification = notifications.find(n => n.toastId === toastId)
  if (loadingNotification) {
    removeNotification(loadingNotification.id)
  }
}

// Notification component
export const NotificationItem = ({ notification, onRemove, onMarkAsRead }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
      case 'info':
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />
      case 'loading':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5"
          >
            <div className="w-full h-full border-2 border-gray-400 border-t-transparent rounded-full"></div>
          </motion.div>
        )
      default:
        return <InformationCircleIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      case 'loading':
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className={`p-4 rounded-lg border ${getBgColor(notification.type)} ${
        !notification.read ? 'ring-2 ring-blue-500/20' : ''
      }`}
      onClick={() => !notification.read && onMarkAsRead(notification.id)}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {getIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              {notification.title}
            </h4>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove(notification.id)
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {notification.message}
          </p>
          
          {notification.action && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                notification.action.onClick()
              }}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium mt-2"
            >
              {notification.action.label}
            </button>
          )}
          
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            {notification.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Notification center component
export const NotificationCenter = ({ isOpen, onClose }) => {
  const { notifications, removeNotification, markAsRead, clearAll } = useNotificationStore()

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-hidden"
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="absolute right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-700"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h3>
            <div className="flex items-center space-x-2">
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <AnimatePresence>
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRemove={removeNotification}
                  onMarkAsRead={markAsRead}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  All caught up!
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No new notifications
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Notification bell icon with badge
export const NotificationBell = ({ onClick }) => {
  const { notifications } = useNotificationStore()
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM21 3l-6 6m0 0L9 3m6 6V3m0 6l6 6" />
      </svg>
      
      {unreadCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </motion.span>
      )}
    </button>
  )
}