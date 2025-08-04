import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bars3Icon, 
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  DeviceTabletIcon
} from '@heroicons/react/24/outline'

const ResponsiveLayout = ({ children, sidebar, sidebarWidth = 280, collapsible = true }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [screenSize, setScreenSize] = useState('desktop')
  const [isMobile, setIsMobile] = useState(false)

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      
      if (width < 640) {
        setScreenSize('mobile')
        setIsMobile(true)
        setSidebarOpen(false) // Auto-close sidebar on mobile
      } else if (width < 1024) {
        setScreenSize('tablet')
        setIsMobile(true)
        setSidebarOpen(false)
      } else {
        setScreenSize('desktop')
        setIsMobile(false)
        setSidebarOpen(true) // Auto-open sidebar on desktop
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const getScreenIcon = () => {
    switch (screenSize) {
      case 'mobile':
        return <DevicePhoneMobileIcon className="w-4 h-4" />
      case 'tablet':
        return <DeviceTabletIcon className="w-4 h-4" />
      default:
        return <ComputerDesktopIcon className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
      {/* Sidebar for desktop/tablet */}
      {sidebar && (
        <>
          {/* Desktop/Tablet Sidebar */}
          <AnimatePresence>
            {sidebarOpen && !isMobile && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: sidebarWidth, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="hidden sm:flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg"
                style={{ minWidth: sidebarWidth }}
              >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    {getScreenIcon()}
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {screenSize.charAt(0).toUpperCase() + screenSize.slice(1)} View
                    </span>
                  </div>
                  
                  {collapsible && (
                    <motion.button
                      onClick={toggleSidebar}
                      className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 overflow-y-auto">
                  {sidebar}
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Responsive Layout</span>
                    <span className="capitalize">{screenSize}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Sidebar Overlay */}
          <AnimatePresence>
            {sidebarOpen && isMobile && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={toggleSidebar}
                  className="fixed inset-0 z-40 bg-black bg-opacity-50 sm:hidden"
                />
                
                {/* Mobile Sidebar */}
                <motion.div
                  initial={{ x: -sidebarWidth }}
                  animate={{ x: 0 }}
                  exit={{ x: -sidebarWidth }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-gray-800 shadow-xl sm:hidden"
                  style={{ width: Math.min(sidebarWidth, window.innerWidth * 0.8) }}
                >
                  {/* Mobile Sidebar Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                      <DevicePhoneMobileIcon className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        Mobile Menu
                      </span>
                    </div>
                    
                    <motion.button
                      onClick={toggleSidebar}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {/* Mobile Sidebar Content */}
                  <div className="flex-1 overflow-y-auto">
                    {sidebar}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar (for mobile sidebar toggle) */}
        {sidebar && (
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sm:hidden">
            <motion.button
              onClick={toggleSidebar}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bars3Icon className="w-5 h-5" />
            </motion.button>
            
            <div className="flex items-center space-x-2">
              {getScreenIcon()}
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {screenSize.charAt(0).toUpperCase() + screenSize.slice(1)}
              </span>
            </div>
          </div>
        )}

        {/* Collapsed Sidebar Toggle (Desktop) */}
        {sidebar && !sidebarOpen && !isMobile && collapsible && (
          <motion.button
            onClick={toggleSidebar}
            className="fixed left-4 top-1/2 z-30 p-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            style={{ transform: 'translateY(-50%)' }}
            whileHover={{ scale: 1.05, x: 4 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ChevronRightIcon className="w-4 h-4" />
          </motion.button>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto focus:outline-none">
          <div className={`h-full ${
            screenSize === 'mobile' ? 'px-4 py-4' : 
            screenSize === 'tablet' ? 'px-6 py-6' : 
            'px-8 py-8'
          }`}>
            {children}
          </div>
        </main>

        {/* Responsive Design Indicator (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 flex items-center space-x-2 px-3 py-2 bg-black bg-opacity-75 text-white text-xs rounded-lg font-mono z-50"
          >
            {getScreenIcon()}
            <span>{screenSize}</span>
            <span>•</span>
            <span>{window.innerWidth}px</span>
            {sidebarOpen && <span>• Sidebar Open</span>}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default ResponsiveLayout

// Higher-order component for easy integration
export const withResponsiveLayout = (Component, layoutProps = {}) => {
  return (props) => (
    <ResponsiveLayout {...layoutProps}>
      <Component {...props} />
    </ResponsiveLayout>
  )
}

// Hook for responsive utilities
export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState('desktop')
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setDimensions({ width, height })
      
      if (width < 640) {
        setScreenSize('mobile')
      } else if (width < 1024) {
        setScreenSize('tablet')
      } else {
        setScreenSize('desktop')
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    screenSize,
    dimensions,
    isMobile: screenSize === 'mobile',
    isTablet: screenSize === 'tablet',
    isDesktop: screenSize === 'desktop',
    isMobileOrTablet: ['mobile', 'tablet'].includes(screenSize)
  }
}