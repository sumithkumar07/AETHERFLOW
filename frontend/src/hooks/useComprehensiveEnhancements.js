/**
 * Comprehensive Enhancements Hook - 2025 Edition
 * Advanced hooks for performance, accessibility, and user experience enhancements
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    memory: 0,
    fps: 0,
    loadTime: 0,
    renderTime: 0,
    networkLatency: 0
  })
  
  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())
  const animationFrame = useRef(null)
  
  const measureFPS = useCallback(() => {
    const now = performance.now()
    frameCount.current++
    
    if (now - lastTime.current >= 1000) {
      const fps = Math.round((frameCount.current * 1000) / (now - lastTime.current))
      
      setMetrics(prev => ({
        ...prev,
        fps,
        memory: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : 0
      }))
      
      frameCount.current = 0
      lastTime.current = now
    }
    
    animationFrame.current = requestAnimationFrame(measureFPS)
  }, [])
  
  useEffect(() => {
    // Measure initial load time
    const loadTime = performance.timing ? 
      performance.timing.loadEventEnd - performance.timing.navigationStart : 0
    
    setMetrics(prev => ({ ...prev, loadTime }))
    
    // Start FPS monitoring
    animationFrame.current = requestAnimationFrame(measureFPS)
    
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current)
      }
    }
  }, [measureFPS])
  
  return metrics
}

// Enhanced keyboard shortcuts hook
export const useKeyboardShortcuts = () => {
  const shortcuts = useRef(new Map())
  const [activeShortcuts, setActiveShortcuts] = useState([])
  
  const registerShortcut = useCallback((key, callback, options = {}) => {
    const {
      description = '',
      ctrlKey = false,
      altKey = false,
      shiftKey = false,
      preventDefault = true,
      enabled = true
    } = options
    
    const shortcutId = `${ctrlKey ? 'ctrl+' : ''}${altKey ? 'alt+' : ''}${shiftKey ? 'shift+' : ''}${key}`
    
    shortcuts.current.set(shortcutId, {
      key,
      callback,
      description,
      ctrlKey,
      altKey,
      shiftKey,
      preventDefault,
      enabled
    })
    
    setActiveShortcuts(Array.from(shortcuts.current.keys()))
    
    return () => {
      shortcuts.current.delete(shortcutId)
      setActiveShortcuts(Array.from(shortcuts.current.keys()))
    }
  }, [])
  
  const getShortcutsList = useCallback(() => {
    return Array.from(shortcuts.current.entries()).map(([id, shortcut]) => ({
      id,
      ...shortcut
    }))
  }, [])
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Skip if typing in input fields
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        return
      }
      
      const shortcutId = `${e.ctrlKey ? 'ctrl+' : ''}${e.altKey ? 'alt+' : ''}${e.shiftKey ? 'shift+' : ''}${e.key.toLowerCase()}`
      
      const shortcut = shortcuts.current.get(shortcutId)
      if (shortcut && shortcut.enabled) {
        if (shortcut.preventDefault) {
          e.preventDefault()
        }
        shortcut.callback(e)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  return {
    registerShortcut,
    getShortcutsList,
    activeShortcuts
  }
}

// Voice recognition hook with enhanced error handling
export const useVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState(null)
  const [isSupported, setIsSupported] = useState(false)
  
  const recognition = useRef(null)
  
  const announce = useCallback((message, priority = 'polite') => {
    window.dispatchEvent(new CustomEvent('ai-announcement', {
      detail: { message, priority }
    }))
  }, [])
  
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (SpeechRecognition) {
      setIsSupported(true)
      
      recognition.current = new SpeechRecognition()
      recognition.current.continuous = false
      recognition.current.interimResults = true
      recognition.current.lang = 'en-US'
      
      recognition.current.onstart = () => {
        setIsListening(true)
        setError(null)
        announce('Voice recognition started', 'polite')
      }
      
      recognition.current.onresult = (event) => {
        const result = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('')
        
        setTranscript(result)
      }
      
      recognition.current.onerror = (event) => {
        setError(event.error)
        setIsListening(false)
        
        let errorMessage = 'Voice recognition error'
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.'
            break
          case 'audio-capture':
            errorMessage = 'Microphone not accessible. Please check permissions.'
            break
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please enable in browser settings.'
            break
          case 'network':
            errorMessage = 'Network error. Please check your connection.'
            break
          default:
            errorMessage = `Voice recognition failed: ${event.error}`
        }
        
        announce(errorMessage, 'assertive')
      }
      
      recognition.current.onend = () => {
        setIsListening(false)
        announce('Voice recognition stopped', 'polite')
      }
    } else {
      setIsSupported(false)
    }
    
    return () => {
      if (recognition.current) {
        recognition.current.stop()
      }
    }
  }, [announce])
  
  const startListening = useCallback(() => {
    if (recognition.current && !isListening) {
      setTranscript('')
      setError(null)
      recognition.current.start()
    }
  }, [isListening])
  
  const stopListening = useCallback(() => {
    if (recognition.current && isListening) {
      recognition.current.stop()
    }
  }, [isListening])
  
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])
  
  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    toggleListening
  }
}

// Responsive design hook with advanced breakpoint detection
export const useResponsiveDesign = () => {
  const [breakpoint, setBreakpoint] = useState('md')
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  })
  const [orientation, setOrientation] = useState('portrait')
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  
  const breakpoints = useMemo(() => ({
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  }), [])
  
  const getCurrentBreakpoint = useCallback((width) => {
    const entries = Object.entries(breakpoints).reverse()
    for (const [name, minWidth] of entries) {
      if (width >= minWidth) {
        return name
      }
    }
    return 'xs'
  }, [breakpoints])
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setDimensions({ width, height })
      setBreakpoint(getCurrentBreakpoint(width))
      setOrientation(width > height ? 'landscape' : 'portrait')
    }
    
    const detectTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }
    
    handleResize()
    detectTouch()
    
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [getCurrentBreakpoint])
  
  const isBreakpoint = useCallback((bp) => {
    return breakpoint === bp
  }, [breakpoint])
  
  const isBreakpointUp = useCallback((bp) => {
    return breakpoints[breakpoint] >= breakpoints[bp]
  }, [breakpoint, breakpoints])
  
  const isBreakpointDown = useCallback((bp) => {
    return breakpoints[breakpoint] <= breakpoints[bp]
  }, [breakpoint, breakpoints])
  
  return {
    breakpoint,
    dimensions,
    orientation,
    isTouchDevice,
    isBreakpoint,
    isBreakpointUp,
    isBreakpointDown,
    isMobile: isBreakpointDown('sm'),
    isTablet: isBreakpoint('md'),
    isDesktop: isBreakpointUp('lg')
  }
}

// Enhanced theme hook with system preference detection
export const useEnhancedTheme = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    return localStorage.getItem('theme') || 'system'
  })
  
  const [effectiveTheme, setEffectiveTheme] = useState('light')
  const [systemPreferences, setSystemPreferences] = useState({
    prefersDark: false,
    prefersReducedMotion: false,
    prefersHighContrast: false
  })
  
  useEffect(() => {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)')
    
    const updatePreferences = () => {
      setSystemPreferences({
        prefersDark: darkModeQuery.matches,
        prefersReducedMotion: reducedMotionQuery.matches,
        prefersHighContrast: highContrastQuery.matches
      })
    }
    
    updatePreferences()
    
    darkModeQuery.addEventListener('change', updatePreferences)
    reducedMotionQuery.addEventListener('change', updatePreferences)
    highContrastQuery.addEventListener('change', updatePreferences)
    
    return () => {
      darkModeQuery.removeEventListener('change', updatePreferences)
      reducedMotionQuery.removeEventListener('change', updatePreferences)
      highContrastQuery.removeEventListener('change', updatePreferences)
    }
  }, [])
  
  useEffect(() => {
    let newEffectiveTheme = theme
    
    if (theme === 'system') {
      newEffectiveTheme = systemPreferences.prefersDark ? 'dark' : 'light'
    }
    
    setEffectiveTheme(newEffectiveTheme)
    localStorage.setItem('theme', theme)
    
    // Apply theme to document
    document.documentElement.classList.toggle('dark', newEffectiveTheme === 'dark')
    document.documentElement.classList.toggle('reduced-motion', systemPreferences.prefersReducedMotion)
    document.documentElement.classList.toggle('high-contrast', systemPreferences.prefersHighContrast)
  }, [theme, systemPreferences])
  
  const toggleTheme = useCallback(() => {
    const themeOrder = ['light', 'dark', 'system']
    const currentIndex = themeOrder.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themeOrder.length
    setTheme(themeOrder[nextIndex])
  }, [theme])
  
  return {
    theme,
    effectiveTheme,
    systemPreferences,
    setTheme,
    toggleTheme,
    isDark: effectiveTheme === 'dark',
    isLight: effectiveTheme === 'light'
  }
}

// Local Storage hook with enhanced error handling
export const useEnhancedLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return defaultValue
    }
  })
  
  const setStoredValue = useCallback((valueToStore) => {
    try {
      setValue(valueToStore)
      
      const valueToStoreString = typeof valueToStore === 'function' 
        ? JSON.stringify(valueToStore(value))
        : JSON.stringify(valueToStore)
        
      window.localStorage.setItem(key, valueToStoreString)
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, value])
  
  const removeStoredValue = useCallback(() => {
    try {
      setValue(defaultValue)
      window.localStorage.removeItem(key)
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, defaultValue])
  
  return [value, setStoredValue, removeStoredValue]
}

// Debounce hook for performance optimization
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  
  return debouncedValue
}

// Intersection Observer hook
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [entry, setEntry] = useState(null)
  const ref = useRef(null)
  
  useEffect(() => {
    if (!ref.current) return
    
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
      setEntry(entry)
    }, options)
    
    observer.observe(ref.current)
    
    return () => {
      observer.disconnect()
    }
  }, [options])
  
  return [ref, isIntersecting, entry]
}

// Network status hook
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [connectionType, setConnectionType] = useState(null)
  const [effectiveType, setEffectiveType] = useState(null)
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Get connection info if available
    if ('connection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
      setConnectionType(connection.type)
      setEffectiveType(connection.effectiveType)
      
      const updateConnectionInfo = () => {
        setConnectionType(connection.type)
        setEffectiveType(connection.effectiveType)
      }
      
      connection.addEventListener('change', updateConnectionInfo)
      
      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
        connection.removeEventListener('change', updateConnectionInfo)
      }
    }
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  return {
    isOnline,
    connectionType,
    effectiveType,
    isSlowConnection: effectiveType === 'slow-2g' || effectiveType === '2g'
  }
}

export default {
  usePerformanceMonitor,
  useKeyboardShortcuts,
  useVoiceRecognition,
  useResponsiveDesign,
  useEnhancedTheme,
  useEnhancedLocalStorage,
  useDebounce,
  useIntersectionObserver,
  useNetworkStatus
}