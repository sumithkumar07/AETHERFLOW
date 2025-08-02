import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  DevicePhoneMobileIcon,
  CloudArrowDownIcon,
  BellIcon,
  CameraIcon,
  MapPinIcon,
  WifiIcon,
  BatteryIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const PWAEnhancement = () => {
  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [notifications, setNotifications] = useState([])
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [pwaFeatures, setPwaFeatures] = useState({
    notifications: false,
    geolocation: false,
    camera: false,
    offline: false
  })

  // PWA Installation
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
      
      // Show install prompt after a delay
      setTimeout(() => {
        setShowInstallPrompt(true)
      }, 5000)
    }

    const handleAppInstalled = () => {
      setIsInstallable(false)
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
      toast.success('AI Tempo installed successfully!')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  // Online/Offline Detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false)
      toast.success('Connection restored!')
    }

    const handleOffline = () => {
      setIsOffline(true)
      toast.error('You are now offline. Some features may be limited.')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Feature Detection
  useEffect(() => {
    const checkFeatures = async () => {
      const features = {
        notifications: 'Notification' in window,
        geolocation: 'geolocation' in navigator,
        camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
        offline: 'serviceWorker' in navigator
      }
      
      setPwaFeatures(features)
    }

    checkFeatures()
  }, [])

  // Install App
  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    const result = await deferredPrompt.prompt()
    
    if (result.outcome === 'accepted') {
      toast.success('Installing AI Tempo...')
    } else {
      toast.info('Installation cancelled')
    }

    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  // Request Notifications Permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications not supported')
      return
    }

    const permission = await Notification.requestPermission()
    
    if (permission === 'granted') {
      toast.success('Notifications enabled!')
      
      // Send a welcome notification
      new Notification('AI Tempo', {
        body: 'Notifications are now enabled! You\'ll receive updates about your projects.',
        icon: '/favicon.ico'
      })
    } else {
      toast.error('Notification permission denied')
    }
  }

  // Request Geolocation Permission
  const requestGeolocationPermission = () => {
    if (!('geolocation' in navigator)) {
      toast.error('Geolocation not supported')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        toast.success('Location access granted!')
        console.log('Location:', position.coords)
      },
      (error) => {
        toast.error('Location access denied')
        console.error('Geolocation error:', error)
      }
    )
  }

  // Request Camera Permission
  const requestCameraPermission = async () => {
    if (!('mediaDevices' in navigator)) {
      toast.error('Camera not supported')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      toast.success('Camera access granted!')
      
      // Stop the stream immediately (we're just checking permission)
      stream.getTracks().forEach(track => track.stop())
    } catch (error) {
      toast.error('Camera access denied')
      console.error('Camera error:', error)
    }
  }

  // Service Worker Registration
  const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
      toast.error('Service workers not supported')
      return
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      toast.success('Offline mode enabled!')
      console.log('Service worker registered:', registration)
    } catch (error) {
      toast.error('Failed to enable offline mode')
      console.error('Service worker error:', error)
    }
  }

  return (
    <>
      {/* Offline Indicator */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            className="fixed top-0 left-0 right-0 z-50 bg-orange-600 text-white p-3"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
          >
            <div className="flex items-center justify-center space-x-2">
              <WifiIcon className="w-5 h-5" />
              <span className="font-medium">You are offline</span>
              <span className="text-orange-200">- Some features may be limited</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Install Prompt */}
      <AnimatePresence>
        {showInstallPrompt && isInstallable && (
          <motion.div
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
          >
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <DevicePhoneMobileIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Install AI Tempo
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get the full app experience
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInstallPrompt(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span>Offline access</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span>Faster loading</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span>Native experience</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span>Push notifications</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleInstallClick}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Install App
                </button>
                <button
                  onClick={() => setShowInstallPrompt(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PWA Features Panel */}
      <div className="hidden">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Enable Features
          </h3>
          
          <div className="space-y-4">
            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BellIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Notifications</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get updates about your projects
                  </p>
                </div>
              </div>
              <button
                onClick={requestNotificationPermission}
                disabled={!pwaFeatures.notifications}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Enable
              </button>
            </div>

            {/* Geolocation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MapPinIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Location</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    For location-based features
                  </p>
                </div>
              </div>
              <button
                onClick={requestGeolocationPermission}
                disabled={!pwaFeatures.geolocation}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Enable
              </button>
            </div>

            {/* Camera */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CameraIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Camera</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    For visual code generation
                  </p>
                </div>
              </div>
              <button
                onClick={requestCameraPermission}
                disabled={!pwaFeatures.camera}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Enable
              </button>
            </div>

            {/* Offline Mode */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CloudArrowDownIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Offline Mode</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Work without internet connection
                  </p>
                </div>
              </div>
              <button
                onClick={registerServiceWorker}
                disabled={!pwaFeatures.offline}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Enable
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default PWAEnhancement