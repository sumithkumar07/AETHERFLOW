import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CloudArrowDownIcon,
  CheckCircleIcon,
  XMarkIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  BoltIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

// PWA Install Prompt Component
export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isInWebAppManifest = window.navigator.standalone === true
    
    if (isStandalone || isInWebAppManifest) {
      setIsInstalled(true)
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Show install prompt after a delay (better UX)
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallPrompt(true)
        }
      }, 10000) // Show after 10 seconds
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      toast.success('🚀 Aether AI installed successfully!')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isInstalled])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast.error('Install not available. Try using Chrome or Edge browser.')
      return
    }

    try {
      // Show the install prompt
      deferredPrompt.prompt()
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        toast.success('🎉 Installing Aether AI...')
      } else {
        toast('Maybe next time! You can always install later.', { icon: '👋' })
      }
      
      // Clear the deferred prompt
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
      
    } catch (error) {
      console.error('Error installing PWA:', error)
      toast.error('Installation failed. Please try again.')
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Don't show again for 24 hours
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString())
  }

  // Don't show if already installed or recently dismissed
  const dismissedTime = localStorage.getItem('pwa-prompt-dismissed')
  const dayInMs = 24 * 60 * 60 * 1000
  const recentlyDismissed = dismissedTime && (Date.now() - parseInt(dismissedTime)) < dayInMs

  if (isInstalled || !showInstallPrompt || recentlyDismissed) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50"
      >
        <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-500 p-[1px] rounded-xl shadow-2xl">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 backdrop-blur-xl">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <DevicePhoneMobileIcon className="w-5 h-5 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Install Aether AI
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  Get the app experience with offline support, faster loading, and native features.
                </p>
                
                <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <BoltIcon className="w-3 h-3" />
                  <span>Faster</span>
                  <span>•</span>
                  <GlobeAltIcon className="w-3 h-3" />
                  <span>Offline</span>
                  <span>•</span>
                  <span>Native</span>
                </div>
                
                <div className="flex items-center space-x-2 mt-3">
                  <motion.button
                    onClick={handleInstallClick}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <CloudArrowDownIcon className="w-3 h-3" />
                    <span>Install</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={handleDismiss}
                    className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Maybe later
                  </motion.button>
                </div>
              </div>
              
              <motion.button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <XMarkIcon className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Offline Status Indicator
export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showOfflineMessage, setShowOfflineMessage] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineMessage(false)
      toast.success('🌐 Back online! Full functionality restored.', { duration: 3000 })
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineMessage(true)
      toast.error('📱 You\'re offline. Limited functionality available.', { duration: 5000 })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initial check
    if (!navigator.onLine) {
      setShowOfflineMessage(true)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!showOfflineMessage) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-4 left-4 right-4 z-50 flex justify-center"
    >
      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-lg backdrop-blur-sm flex items-center space-x-2">
        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium">
          Offline mode - Some features may be limited
        </span>
      </div>
    </motion.div>
  )
}

// App Update Available Prompt
export const UpdatePrompt = () => {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)
  const [registration, setRegistration] = useState(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Listen for service worker updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (registration && registration.waiting) {
          setShowUpdatePrompt(true)
        }
      })

      // Check for waiting service worker
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg)
        if (reg.waiting) {
          setShowUpdatePrompt(true)
        }
      })
    }
  }, [registration])

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      setShowUpdatePrompt(false)
      toast.success('🔄 Updating... Please refresh the page.')
      
      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  }

  const handleDismiss = () => {
    setShowUpdatePrompt(false)
  }

  if (!showUpdatePrompt) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed top-4 right-4 z-50 max-w-sm"
    >
      <div className="bg-gradient-to-br from-green-500 via-blue-500 to-purple-600 p-[1px] rounded-xl shadow-2xl">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 backdrop-blur-xl">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="w-4 h-4 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Update Available
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                A new version of Aether AI is ready with improvements and new features.
              </p>
              
              <div className="flex items-center space-x-2 mt-3">
                <motion.button
                  onClick={handleUpdate}
                  className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-blue-600 text-white text-xs font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Update Now
                </motion.button>
                
                <motion.button
                  onClick={handleDismiss}
                  className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Later
                </motion.button>
              </div>
            </div>
            
            <motion.button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <XMarkIcon className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Network Status Component
export const NetworkStatus = () => {
  const [connectionType, setConnectionType] = useState('unknown')
  const [effectiveType, setEffectiveType] = useState('4g')

  useEffect(() => {
    const updateConnectionInfo = () => {
      if ('connection' in navigator) {
        const conn = navigator.connection
        setConnectionType(conn.type || 'unknown')
        setEffectiveType(conn.effectiveType || '4g')
      }
    }

    updateConnectionInfo()

    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', updateConnectionInfo)
      return () => {
        navigator.connection.removeEventListener('change', updateConnectionInfo)
      }
    }
  }, [])

  // Show warning for slow connections
  if (effectiveType === 'slow-2g' || effectiveType === '2g') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40"
      >
        <div className="bg-orange-500/10 border border-orange-500/20 text-orange-700 dark:text-orange-300 px-3 py-2 rounded-lg backdrop-blur-sm flex items-center space-x-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium">
            Slow connection detected - Optimized for low bandwidth
          </span>
        </div>
      </motion.div>
    )
  }

  return null
}

// PWA Features Showcase
export const PWAFeatures = ({ isVisible, onClose }) => {
  const features = [
    {
      icon: BoltIcon,
      title: 'Lightning Fast',
      description: 'Instant loading and smooth performance with advanced caching',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      icon: GlobeAltIcon,
      title: 'Works Offline',
      description: 'Continue working even without internet connection',
      color: 'from-green-400 to-blue-500'
    },
    {
      icon: DevicePhoneMobileIcon,
      title: 'Native Experience',
      description: 'App-like experience with push notifications and home screen icon',
      color: 'from-purple-400 to-pink-500'
    }
  ]

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Enhanced Experience
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Install Aether AI for the best possible experience
            </p>
          </div>

          <div className="space-y-4 mb-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3"
                >
                  <div className={`w-8 h-8 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <div className="flex space-x-3">
            <motion.button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Get Started
            </motion.button>
            <motion.button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Maybe Later
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}