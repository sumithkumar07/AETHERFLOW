import { useState, useEffect, useCallback, useRef } from 'react'

// Performance monitoring hook
export const usePerformanceMonitor = (componentName) => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    mountTime: 0,
    updateCount: 0,
    memoryUsage: 0
  })
  
  const renderStartRef = useRef(0)
  const mountTimeRef = useRef(0)
  const updateCountRef = useRef(0)
  
  // Start measuring on component mount
  useEffect(() => {
    mountTimeRef.current = performance.now()
    
    return () => {
      const mountTime = performance.now() - mountTimeRef.current
      if (process.env.NODE_ENV === 'development' && mountTime > 100) {
        console.warn(`🐌 ${componentName} was mounted for ${mountTime.toFixed(2)}ms`)
      }
    }
  }, [componentName])
  
  // Measure render performance
  useEffect(() => {
    renderStartRef.current = performance.now()
  })
  
  useEffect(() => {
    const renderTime = performance.now() - renderStartRef.current
    updateCountRef.current += 1
    
    // Get memory usage if available
    const memory = performance.memory || {}
    const memoryUsage = memory.usedJSHeapSize ? 
      Math.round(memory.usedJSHeapSize / 1024 / 1024) : 0
    
    setMetrics(prev => ({
      renderTime,
      mountTime: performance.now() - mountTimeRef.current,
      updateCount: updateCountRef.current,
      memoryUsage
    }))
    
    // Warn about slow renders in development
    if (process.env.NODE_ENV === 'development' && renderTime > 16) {
      console.warn(`🐌 ${componentName} render took ${renderTime.toFixed(2)}ms (>16ms)`)
    }
  })
  
  return metrics
}

// Debounced value hook for performance optimization
export const useDebounce = (value, delay = 300) => {
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

// Throttled callback hook
export const useThrottle = (callback, delay = 100) => {
  const lastCallRef = useRef(0)
  
  return useCallback((...args) => {
    const now = Date.now()
    
    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now
      callback(...args)
    }
  }, [callback, delay])
}

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (options = {}) => {
  const [ref, setRef] = useState(null)
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  
  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '50px',
    ...options
  }
  
  useEffect(() => {
    if (!ref) return
    
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
      
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true)
      }
    }, defaultOptions)
    
    observer.observe(ref)
    
    return () => observer.disconnect()
  }, [ref, hasIntersected, defaultOptions])
  
  return { ref: setRef, isIntersecting, hasIntersected }
}

// Local storage hook with JSON serialization
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })
  
  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      if (valueToStore === undefined) {
        window.localStorage.removeItem(key)
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])
  
  return [storedValue, setValue]
}

// Window size hook for responsive design
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false
  })
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setWindowSize({
        width,
        height,
        isMobile: width < 640,
        isTablet: width >= 640 && width < 1024,
        isDesktop: width >= 1024
      })
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  return windowSize
}

// Media query hook
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches
    }
    return false
  })
  
  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    
    const handleChange = (e) => {
      setMatches(e.matches)
    }
    
    mediaQuery.addListener(handleChange)
    setMatches(mediaQuery.matches)
    
    return () => mediaQuery.removeListener(handleChange)
  }, [query])
  
  return matches
}

// Online status hook
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  return isOnline
}

// Keyboard shortcut hook
export const useKeyboardShortcut = (keys, callback, deps = []) => {
  useEffect(() => {
    const handleKeyPress = (event) => {
      const pressedKeys = []
      
      if (event.ctrlKey) pressedKeys.push('ctrl')
      if (event.metaKey) pressedKeys.push('cmd')
      if (event.shiftKey) pressedKeys.push('shift')
      if (event.altKey) pressedKeys.push('alt')
      
      pressedKeys.push(event.key.toLowerCase())
      
      const shortcut = Array.isArray(keys) ? keys : [keys]
      const normalizedShortcut = shortcut.map(key => key.toLowerCase())
      
      if (normalizedShortcut.every(key => pressedKeys.includes(key))) {
        event.preventDefault()
        callback(event)
      }
    }
    
    document.addEventListener('keydown', handleKeyPress)
    
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [keys, callback, ...deps])
}

// Async state hook with loading and error handling
export const useAsyncState = (initialValue = null) => {
  const [state, setState] = useState({
    data: initialValue,
    loading: false,
    error: null
  })
  
  const execute = useCallback(async (asyncFunction) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const result = await asyncFunction()
      setState({ data: result, loading: false, error: null })
      return result
    } catch (error) {
      setState({ data: null, loading: false, error })
      throw error
    }
  }, [])
  
  const reset = useCallback(() => {
    setState({ data: initialValue, loading: false, error: null })
  }, [initialValue])
  
  return { ...state, execute, reset }
}

// Previous value hook
export const usePrevious = (value) => {
  const ref = useRef()
  
  useEffect(() => {
    ref.current = value
  })
  
  return ref.current
}

// Update effect hook (useEffect that skips first render)
export const useUpdateEffect = (effect, deps) => {
  const isFirstRender = useRef(true)
  
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    
    return effect()
  }, deps)
}

// Animation frame hook for smooth animations
export const useAnimationFrame = (callback, dependency = null) => {
  const requestRef = useRef()
  const previousTimeRef = useRef()
  
  const animate = (time) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current
      callback(deltaTime)
    }
    previousTimeRef.current = time
    requestRef.current = requestAnimationFrame(animate)
  }
  
  useEffect(() => {
    if (dependency !== null) {
      requestRef.current = requestAnimationFrame(animate)
    }
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [dependency])
}

// Idle detection hook
export const useIdleDetection = (timeout = 300000) => { // 5 minutes default
  const [isIdle, setIsIdle] = useState(false)
  const timeoutRef = useRef()
  
  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    setIsIdle(false)
    
    timeoutRef.current = setTimeout(() => {
      setIsIdle(true)
    }, timeout)
  }, [timeout])
  
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    
    events.forEach(event => {
      document.addEventListener(event, resetTimeout, true)
    })
    
    resetTimeout()
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimeout, true)
      })
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [resetTimeout])
  
  return isIdle
}

// Copy to clipboard hook
export const useCopyToClipboard = () => {
  const [copiedText, setCopiedText] = useState(null)
  
  const copy = useCallback(async (text) => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported')
      return false
    }
    
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(text)
      return true
    } catch (error) {
      console.warn('Copy failed', error)
      setCopiedText(null)
      return false
    }
  }, [])
  
  return { copiedText, copy }
}