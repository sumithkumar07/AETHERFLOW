import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HandRaisedIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  HomeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const GestureNavigation = ({ isEnabled = true, onGesture }) => {
  const navigate = useNavigate()
  const [isGestureMode, setIsGestureMode] = useState(false)
  const [currentGesture, setCurrentGesture] = useState('')
  const [gesturePreview, setGesturePreview] = useState(null)
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 })
  const [touchCurrent, setTouchCurrent] = useState({ x: 0, y: 0 })
  const [isDrawing, setIsDrawing] = useState(false)
  const gestureRef = useRef(null)
  const gesturePathRef = useRef([])
  const gestureTimeoutRef = useRef(null)

  // Gesture patterns
  const gesturePatterns = {
    swipe_left: { action: 'navigate_back', icon: ArrowLeftIcon, description: 'Go back' },
    swipe_right: { action: 'navigate_forward', icon: ArrowRightIcon, description: 'Go forward' },
    swipe_up: { action: 'scroll_top', icon: ArrowUpIcon, description: 'Scroll to top' },
    swipe_down: { action: 'open_search', icon: MagnifyingGlassIcon, description: 'Open search' },
    circle: { action: 'open_settings', icon: Cog6ToothIcon, description: 'Open settings' },
    double_tap: { action: 'home', icon: HomeIcon, description: 'Go home' },
    long_press: { action: 'context_menu', icon: ChatBubbleLeftRightIcon, description: 'Context menu' }
  }

  // Initialize gesture detection
  useEffect(() => {
    if (!isEnabled) return

    const handleKeyDown = (e) => {
      // Enable gesture mode with G key
      if (e.key === 'g' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        setIsGestureMode(!isGestureMode)
        toast.success(isGestureMode ? 'Gesture mode disabled' : 'Gesture mode enabled')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isEnabled, isGestureMode])

  // Touch event handlers
  const handleTouchStart = useCallback((e) => {
    if (!isGestureMode) return
    
    const touch = e.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
    setTouchCurrent({ x: touch.clientX, y: touch.clientY })
    setIsDrawing(true)
    gesturePathRef.current = [{ x: touch.clientX, y: touch.clientY }]
    
    // Clear any existing gesture timeout
    if (gestureTimeoutRef.current) {
      clearTimeout(gestureTimeoutRef.current)
    }
  }, [isGestureMode])

  const handleTouchMove = useCallback((e) => {
    if (!isGestureMode || !isDrawing) return
    
    const touch = e.touches[0]
    setTouchCurrent({ x: touch.clientX, y: touch.clientY })
    gesturePathRef.current.push({ x: touch.clientX, y: touch.clientY })
    
    // Analyze gesture in real-time
    const gesture = analyzeGesture(gesturePathRef.current)
    if (gesture) {
      setCurrentGesture(gesture)
      setGesturePreview(gesturePatterns[gesture])
    }
  }, [isGestureMode, isDrawing])

  const handleTouchEnd = useCallback(() => {
    if (!isGestureMode || !isDrawing) return
    
    setIsDrawing(false)
    
    // Execute gesture after a short delay
    gestureTimeoutRef.current = setTimeout(() => {
      if (currentGesture) {
        executeGesture(currentGesture)
        setCurrentGesture('')
        setGesturePreview(null)
      }
    }, 200)
  }, [isGestureMode, isDrawing, currentGesture])

  // Mouse event handlers for desktop
  const handleMouseDown = useCallback((e) => {
    if (!isGestureMode) return
    
    setTouchStart({ x: e.clientX, y: e.clientY })
    setTouchCurrent({ x: e.clientX, y: e.clientY })
    setIsDrawing(true)
    gesturePathRef.current = [{ x: e.clientX, y: e.clientY }]
  }, [isGestureMode])

  const handleMouseMove = useCallback((e) => {
    if (!isGestureMode || !isDrawing) return
    
    setTouchCurrent({ x: e.clientX, y: e.clientY })
    gesturePathRef.current.push({ x: e.clientX, y: e.clientY })
    
    const gesture = analyzeGesture(gesturePathRef.current)
    if (gesture) {
      setCurrentGesture(gesture)
      setGesturePreview(gesturePatterns[gesture])
    }
  }, [isGestureMode, isDrawing])

  const handleMouseUp = useCallback(() => {
    if (!isGestureMode || !isDrawing) return
    
    setIsDrawing(false)
    
    gestureTimeoutRef.current = setTimeout(() => {
      if (currentGesture) {
        executeGesture(currentGesture)
        setCurrentGesture('')
        setGesturePreview(null)
      }
    }, 200)
  }, [isGestureMode, isDrawing, currentGesture])

  // Attach event listeners
  useEffect(() => {
    if (!isGestureMode) return

    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isGestureMode, handleTouchStart, handleTouchMove, handleTouchEnd, handleMouseDown, handleMouseMove, handleMouseUp])

  // Analyze gesture pattern
  const analyzeGesture = (path) => {
    if (path.length < 10) return null

    const start = path[0]
    const end = path[path.length - 1]
    const deltaX = end.x - start.x
    const deltaY = end.y - start.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    // Minimum distance threshold
    if (distance < 50) return null

    // Analyze swipe direction
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI)
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > 0) return 'swipe_right'
      else return 'swipe_left'
    } else {
      // Vertical swipe
      if (deltaY > 0) return 'swipe_down'
      else return 'swipe_up'
    }
  }

  // Execute gesture action
  const executeGesture = (gesture) => {
    const pattern = gesturePatterns[gesture]
    if (!pattern) return

    toast.success(`Gesture: ${pattern.description}`)

    switch (pattern.action) {
      case 'navigate_back':
        window.history.back()
        break
      case 'navigate_forward':
        window.history.forward()
        break
      case 'scroll_top':
        window.scrollTo({ top: 0, behavior: 'smooth' })
        break
      case 'open_search':
        // Trigger global search
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
        break
      case 'open_settings':
        navigate('/settings')
        break
      case 'home':
        navigate('/')
        break
      case 'context_menu':
        // Open context menu or command palette
        onGesture?.(gesture)
        break
    }
  }

  // Generate SVG path for gesture trail
  const generateGesturePath = () => {
    if (gesturePathRef.current.length < 2) return ''
    
    const pathCommands = gesturePathRef.current.map((point, index) => {
      return index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`
    })
    
    return pathCommands.join(' ')
  }

  if (!isEnabled) return null

  return (
    <>
      {/* Gesture Mode Indicator */}
      <AnimatePresence>
        {isGestureMode && (
          <motion.div
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
              <HandRaisedIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Gesture Mode Active</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gesture Preview */}
      <AnimatePresence>
        {gesturePreview && isDrawing && (
          <motion.div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <gesturePreview.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {gesturePreview.description}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Release to execute
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gesture Trail */}
      {isDrawing && gesturePathRef.current.length > 1 && (
        <svg
          className="fixed inset-0 pointer-events-none z-40"
          width="100vw"
          height="100vh"
        >
          <path
            d={generateGesturePath()}
            stroke="rgba(59, 130, 246, 0.6)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Gesture endpoint */}
          <circle
            cx={touchCurrent.x}
            cy={touchCurrent.y}
            r="8"
            fill="rgba(59, 130, 246, 0.8)"
            stroke="white"
            strokeWidth="2"
          />
        </svg>
      )}

      {/* Gesture Help Panel */}
      <AnimatePresence>
        {isGestureMode && (
          <motion.div
            className="fixed bottom-4 right-4 z-40"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-xl max-w-xs">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                Gesture Commands
              </h3>
              <div className="space-y-2 text-sm">
                {Object.entries(gesturePatterns).slice(0, 4).map(([key, pattern]) => {
                  const Icon = pattern.icon
                  return (
                    <div key={key} className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <Icon className="w-4 h-4" />
                      <span>{pattern.description}</span>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Press Ctrl/Cmd + G to toggle
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default GestureNavigation