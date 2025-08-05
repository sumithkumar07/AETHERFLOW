import React, { useState, useEffect, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bars3Icon,
  XMarkIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  DeviceTabletIcon
} from '@heroicons/react/24/outline'

// Breakpoint context for responsive design
const ResponsiveContext = createContext()

export const useResponsive = () => {
  const context = useContext(ResponsiveContext)
  if (!context) {
    throw new Error('useResponsive must be used within ResponsiveProvider')
  }
  return context
}

// Responsive provider with advanced breakpoint detection
export const ResponsiveProvider = ({ children }) => {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  })

  const [device, setDevice] = useState('desktop')
  const [orientation, setOrientation] = useState('landscape')

  // Breakpoint definitions (following Tailwind CSS)
  const breakpoints = {
    xs: 475,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  }

  // Device detection logic
  const detectDevice = (width) => {
    if (width < breakpoints.sm) return 'mobile'
    if (width < breakpoints.lg) return 'tablet'
    return 'desktop'
  }

  // Update viewport and device information
  const updateViewport = () => {
    const width = window.innerWidth
    const height = window.innerHeight
    
    setViewport({ width, height })
    setDevice(detectDevice(width))
    setOrientation(width > height ? 'landscape' : 'portrait')
  }

  useEffect(() => {
    updateViewport()
    
    const handleResize = () => {
      updateViewport()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Utility functions for responsive checks
  const isMobile = device === 'mobile'
  const isTablet = device === 'tablet'
  const isDesktop = device === 'desktop'
  const isTouch = 'ontouchstart' in window
  const isSmallScreen = viewport.width < breakpoints.md
  const isMediumScreen = viewport.width >= breakpoints.md && viewport.width < breakpoints.xl
  const isLargeScreen = viewport.width >= breakpoints.xl

  // Breakpoint utilities
  const isAbove = (breakpoint) => viewport.width >= breakpoints[breakpoint]
  const isBelow = (breakpoint) => viewport.width < breakpoints[breakpoint]
  const isBetween = (min, max) => viewport.width >= breakpoints[min] && viewport.width < breakpoints[max]

  const contextValue = {
    viewport,
    device,
    orientation,
    isMobile,
    isTablet,
    isDesktop,
    isTouch,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    isAbove,
    isBelow,
    isBetween,
    breakpoints
  }

  return (
    <ResponsiveContext.Provider value={contextValue}>
      {children}
    </ResponsiveContext.Provider>
  )
}

// Enhanced Container with responsive behavior
export const ResponsiveContainer = ({ 
  children, 
  maxWidth = 'xl',
  padding = true,
  center = true,
  className = '',
  ...props 
}) => {
  const { isSmallScreen, isMediumScreen } = useResponsive()

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  }

  const paddingClasses = padding 
    ? isSmallScreen 
      ? 'px-4 py-4' 
      : isMediumScreen 
        ? 'px-6 py-6' 
        : 'px-8 py-8'
    : ''

  return (
    <div
      className={`
        ${maxWidthClasses[maxWidth] || maxWidthClasses.xl} 
        ${center ? 'mx-auto' : ''} 
        ${paddingClasses} 
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

// Mobile-first grid system
export const ResponsiveGrid = ({ 
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 6,
  className = '',
  ...props 
}) => {
  const { isMobile, isTablet } = useResponsive()

  const getColumns = () => {
    if (isMobile) return cols.mobile || 1
    if (isTablet) return cols.tablet || cols.mobile || 2
    return cols.desktop || cols.tablet || cols.mobile || 3
  }

  const gridColumns = getColumns()
  const gapClass = `gap-${gap}`

  return (
    <div
      className={`
        grid grid-cols-${gridColumns} ${gapClass} ${className}
      `}
      style={{
        gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`
      }}
      {...props}
    >
      {children}
    </div>
  )
}

// Responsive navigation drawer/sidebar
export const ResponsiveNavigation = ({ 
  isOpen, 
  onClose, 
  children,
  position = 'left',
  overlay = true,
  className = ''
}) => {
  const { isMobile, isTablet } = useResponsive()
  const shouldShowDrawer = isMobile || isTablet

  if (!shouldShowDrawer) {
    // Desktop: show as regular sidebar
    return (
      <nav className={`${className}`}>
        {children}
      </nav>
    )
  }

  // Mobile/Tablet: show as drawer
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          {overlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
          )}

          {/* Drawer */}
          <motion.nav
            initial={{ 
              x: position === 'left' ? '-100%' : '100%',
              opacity: 0 
            }}
            animate={{ 
              x: 0,
              opacity: 1 
            }}
            exit={{ 
              x: position === 'left' ? '-100%' : '100%',
              opacity: 0 
            }}
            transition={{ 
              type: 'spring',
              damping: 25,
              stiffness: 200
            }}
            className={`
              fixed top-0 ${position === 'left' ? 'left-0' : 'right-0'} 
              h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 
              border-r dark:border-gray-800 shadow-2xl z-50
              ${className}
            `}
          >
            {/* Close button */}
            <div className="flex justify-end p-4">
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close navigation"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation content */}
            <div className="px-4 pb-4">
              {children}
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  )
}

// Responsive card with adaptive layout
export const ResponsiveCard = ({ 
  children, 
  variant = 'elevated',
  padding = 'normal',
  className = '',
  ...props 
}) => {
  const { isSmallScreen } = useResponsive()

  const variants = {
    flat: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700',
    glass: 'bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/50',
    gradient: 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg'
  }

  const paddingClasses = {
    none: '',
    tight: isSmallScreen ? 'p-3' : 'p-4',
    normal: isSmallScreen ? 'p-4' : 'p-6',
    loose: isSmallScreen ? 'p-6' : 'p-8'
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`
        ${variants[variant]} 
        ${paddingClasses[padding]} 
        rounded-xl transition-all duration-200 ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Responsive text that adapts to screen size
export const ResponsiveText = ({ 
  children,
  variant = 'body',
  className = '',
  ...props 
}) => {
  const { isSmallScreen, isMediumScreen } = useResponsive()

  const variants = {
    h1: isSmallScreen 
      ? 'text-2xl font-bold' 
      : isMediumScreen 
        ? 'text-3xl font-bold' 
        : 'text-4xl font-bold',
    h2: isSmallScreen 
      ? 'text-xl font-semibold' 
      : isMediumScreen 
        ? 'text-2xl font-semibold' 
        : 'text-3xl font-semibold',
    h3: isSmallScreen 
      ? 'text-lg font-medium' 
      : 'text-xl font-medium',
    h4: isSmallScreen 
      ? 'text-base font-medium' 
      : 'text-lg font-medium',
    body: 'text-sm md:text-base',
    caption: 'text-xs md:text-sm',
    large: isSmallScreen 
      ? 'text-lg' 
      : 'text-xl'
  }

  const Component = variant.startsWith('h') ? variant : 'p'

  return (
    <Component
      className={`${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}

// Responsive image with adaptive sizing
export const ResponsiveImage = ({ 
  src, 
  alt, 
  aspectRatio = '16/9',
  sizes = '100vw',
  className = '',
  ...props 
}) => {
  const { isSmallScreen } = useResponsive()
  const [loaded, setLoaded] = useState(false)

  const aspectRatioClasses = {
    '1/1': 'aspect-square',
    '4/3': 'aspect-4/3', 
    '16/9': 'aspect-video',
    '21/9': 'aspect-21/9'
  }

  return (
    <div className={`${aspectRatioClasses[aspectRatio]} overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        sizes={sizes}
        onLoad={() => setLoaded(true)}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ 
          opacity: loaded ? 1 : 0, 
          scale: loaded ? 1 : 1.1 
        }}
        transition={{ duration: 0.3 }}
        className="w-full h-full object-cover"
        {...props}
      />
      
      {/* Loading placeholder */}
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

// Device indicator for development/debugging
export const DeviceIndicator = ({ show = process.env.NODE_ENV === 'development' }) => {
  const { device, viewport, orientation } = useResponsive()

  if (!show) return null

  const deviceIcons = {
    mobile: DevicePhoneMobileIcon,
    tablet: DeviceTabletIcon,
    desktop: ComputerDesktopIcon
  }

  const DeviceIcon = deviceIcons[device]

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-3 rounded-lg font-mono z-50 backdrop-blur-sm">
      <div className="flex items-center space-x-2 mb-1">
        <DeviceIcon className="w-4 h-4" />
        <span className="capitalize">{device}</span>
      </div>
      <div>
        {viewport.width} x {viewport.height}
      </div>
      <div className="capitalize text-gray-300">
        {orientation}
      </div>
    </div>
  )
}

export default {
  ResponsiveProvider,
  useResponsive,
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveNavigation,
  ResponsiveCard,
  ResponsiveText,
  ResponsiveImage,
  DeviceIndicator
}