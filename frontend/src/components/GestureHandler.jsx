import { useEffect, useCallback } from 'react'
import { useSwipeable } from 'react-swipeable'
import { useChatStore } from '../store/chatStore'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'

// Enhanced gesture handling for mobile interactions
export const useGestureHandler = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { agents, selectedAgent, setSelectedAgent, clearMessages } = useChatStore()

  // Swipe handlers for agent navigation
  const handleSwipeLeft = useCallback(() => {
    if (location.pathname === '/chat') {
      const currentIndex = agents.findIndex(a => a.id === selectedAgent)
      const nextIndex = (currentIndex + 1) % agents.length
      const nextAgent = agents[nextIndex]
      
      if (nextAgent) {
        setSelectedAgent(nextAgent.id)
        toast.success(`Switched to ${nextAgent.name}`, { 
          icon: nextAgent.icon || '🤖',
          duration: 1500
        })
      }
    }
  }, [agents, selectedAgent, setSelectedAgent, location.pathname])

  const handleSwipeRight = useCallback(() => {
    if (location.pathname === '/chat') {
      const currentIndex = agents.findIndex(a => a.id === selectedAgent)
      const prevIndex = currentIndex === 0 ? agents.length - 1 : currentIndex - 1
      const prevAgent = agents[prevIndex]
      
      if (prevAgent) {
        setSelectedAgent(prevAgent.id)
        toast.success(`Switched to ${prevAgent.name}`, { 
          icon: prevAgent.icon || '🤖',
          duration: 1500
        })
      }
    }
  }, [agents, selectedAgent, setSelectedAgent, location.pathname])

  // Swipe up to clear chat
  const handleSwipeUp = useCallback(() => {
    if (location.pathname === '/chat') {
      clearMessages()
      toast.success('Chat cleared', { icon: '🧹' })
    }
  }, [clearMessages, location.pathname])

  // Swipe down to navigate back/home
  const handleSwipeDown = useCallback(() => {
    if (location.pathname !== '/') {
      navigate('/')
      toast('Navigated home', { icon: '🏠' })
    }
  }, [navigate, location.pathname])

  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleSwipeLeft,
    onSwipedRight: handleSwipeRight,
    onSwipedUp: handleSwipeUp,
    onSwipedDown: handleSwipeDown,
    preventScrollOnSwipe: false,
    trackMouse: false, // Only track touch on mobile
    delta: 50, // Minimum distance for swipe
    swipeDuration: 500, // Maximum time for swipe
  })

  return swipeHandlers
}

// Touch and gesture feedback component
export const GestureFeedback = ({ isVisible, gesture, onComplete }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onComplete?.()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onComplete])

  if (!isVisible) return null

  const getGestureInfo = (gesture) => {
    switch (gesture) {
      case 'swipe-left':
        return { icon: '👈', text: 'Next Agent', color: 'from-blue-500 to-purple-600' }
      case 'swipe-right':
        return { icon: '👉', text: 'Previous Agent', color: 'from-purple-500 to-pink-600' }
      case 'swipe-up':
        return { icon: '👆', text: 'Clear Chat', color: 'from-red-500 to-orange-600' }
      case 'swipe-down':
        return { icon: '👇', text: 'Go Home', color: 'from-green-500 to-blue-600' }
      default:
        return { icon: '👋', text: 'Gesture', color: 'from-gray-500 to-gray-600' }
    }
  }

  const gestureInfo = getGestureInfo(gesture)

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
      <div className={`bg-gradient-to-r ${gestureInfo.color} text-white px-6 py-3 rounded-full shadow-2xl flex items-center space-x-3 animate-bounce`}>
        <span className="text-2xl">{gestureInfo.icon}</span>
        <span className="font-semibold">{gestureInfo.text}</span>
      </div>
    </div>
  )
}

// Enhanced touch interactions for buttons and interactive elements
export const useTouchFeedback = () => {
  const addTouchRipple = useCallback((element, event) => {
    if (!element || !event.touches) return

    const rect = element.getBoundingClientRect()
    const touch = event.touches[0]
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    // Create ripple effect
    const ripple = document.createElement('div')
    ripple.className = 'absolute rounded-full bg-white/30 pointer-events-none animate-ping'
    ripple.style.left = `${x - 10}px`
    ripple.style.top = `${y - 10}px`
    ripple.style.width = '20px'
    ripple.style.height = '20px'

    element.style.position = 'relative'
    element.appendChild(ripple)

    // Remove ripple after animation
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple)
      }
    }, 600)
  }, [])

  const addHapticFeedback = useCallback((type = 'light') => {
    if ('vibrate' in navigator) {
      switch (type) {
        case 'light':
          navigator.vibrate(10)
          break
        case 'medium':
          navigator.vibrate(20)
          break
        case 'heavy':
          navigator.vibrate([20, 10, 20])
          break
        case 'success':
          navigator.vibrate([10, 50, 10])
          break
        case 'error':
          navigator.vibrate([50, 25, 50, 25, 50])
          break
        default:
          navigator.vibrate(10)
      }
    }
  }, [])

  return { addTouchRipple, addHapticFeedback }
}

// Gesture guide overlay for first-time users
export const GestureGuide = ({ isVisible, onDismiss }) => {
  const gestures = [
    {
      gesture: 'Swipe left/right',
      description: 'Switch between AI agents',
      icon: '👈👉',
      demo: 'swipe-horizontal'
    },
    {
      gesture: 'Swipe up',
      description: 'Clear current conversation',
      icon: '👆',
      demo: 'swipe-up'
    },
    {
      gesture: 'Swipe down',
      description: 'Navigate to home',
      icon: '👇',
      demo: 'swipe-down'
    },
    {
      gesture: 'Long press',
      description: 'Access quick actions',
      icon: '👆⏱️',
      demo: 'long-press'
    }
  ]

  useEffect(() => {
    // Auto-dismiss after 10 seconds
    if (isVisible) {
      const timer = setTimeout(() => {
        onDismiss?.()
        localStorage.setItem('gesture-guide-shown', 'true')
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onDismiss])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Gesture Controls
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Use these gestures for faster navigation
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {gestures.map((item, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl flex-shrink-0">
                {item.icon}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {item.gesture}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {item.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => {
              onDismiss?.()
              localStorage.setItem('gesture-guide-shown', 'true')
            }}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg"
          >
            Got it!
          </button>
          <button
            onClick={() => {
              onDismiss?.()
              localStorage.setItem('gesture-guide-dismissed', 'true')
            }}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  )
}

// Hook to manage gesture guide visibility
export const useGestureGuide = () => {
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('gesture-guide-shown')
    const hasDismissedGuide = localStorage.getItem('gesture-guide-dismissed')
    const isMobile = window.innerWidth < 768

    // Show guide for first-time mobile users
    if (isMobile && !hasSeenGuide && !hasDismissedGuide) {
      const timer = setTimeout(() => {
        setShowGuide(true)
      }, 3000) // Show after 3 seconds
      
      return () => clearTimeout(timer)
    }
  }, [])

  const dismissGuide = useCallback(() => {
    setShowGuide(false)
  }, [])

  return { showGuide, dismissGuide }
}

// Advanced gesture recognition for custom gestures
export const useAdvancedGestures = () => {
  const [gestureState, setGestureState] = useState({
    isGesturing: false,
    startPoint: null,
    currentPoint: null,
    gestureType: null
  })

  const recognizeGesture = useCallback((startPoint, endPoint) => {
    const deltaX = endPoint.x - startPoint.x
    const deltaY = endPoint.y - startPoint.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI)

    // Minimum distance threshold
    if (distance < 50) return null

    // Determine gesture based on angle and distance
    if (Math.abs(angle) < 30) return 'swipe-right'
    if (Math.abs(angle - 180) < 30 || Math.abs(angle + 180) < 30) return 'swipe-left'
    if (angle > -120 && angle < -60) return 'swipe-up'
    if (angle > 60 && angle < 120) return 'swipe-down'
    
    // Diagonal gestures
    if (angle > 30 && angle < 60) return 'swipe-down-right'
    if (angle > 120 && angle < 150) return 'swipe-down-left'
    if (angle > -60 && angle < -30) return 'swipe-up-right'
    if (angle > -150 && angle < -120) return 'swipe-up-left'

    return null
  }, [])

  const handleTouchStart = useCallback((event) => {
    const touch = event.touches[0]
    setGestureState({
      isGesturing: true,
      startPoint: { x: touch.clientX, y: touch.clientY },
      currentPoint: { x: touch.clientX, y: touch.clientY },
      gestureType: null
    })
  }, [])

  const handleTouchMove = useCallback((event) => {
    if (!gestureState.isGesturing) return

    const touch = event.touches[0]
    setGestureState(prev => ({
      ...prev,
      currentPoint: { x: touch.clientX, y: touch.clientY }
    }))
  }, [gestureState.isGesturing])

  const handleTouchEnd = useCallback((callback) => {
    if (!gestureState.isGesturing || !gestureState.startPoint) return

    const gesture = recognizeGesture(gestureState.startPoint, gestureState.currentPoint)
    
    if (gesture && callback) {
      callback(gesture, gestureState.startPoint, gestureState.currentPoint)
    }

    setGestureState({
      isGesturing: false,
      startPoint: null,
      currentPoint: null,
      gestureType: null
    })
  }, [gestureState, recognizeGesture])

  return {
    gestureState,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  }
}