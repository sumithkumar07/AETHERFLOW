// Advanced Performance Optimization Utilities
import { lazy, memo, useMemo, useCallback, useRef, useEffect, useState } from 'react'

// Lazy loading with error boundaries and loading states
export const createLazyComponent = (importFunc, fallback = null) => {
  return lazy(() =>
    importFunc().catch((error) => {
      console.error('Failed to load component:', error)
      return { default: () => fallback || <div>Failed to load component</div> }
    })
  )
}

// Smart memoization hook with deep comparison option
export const useSmartMemo = (factory, deps, deepCompare = false) => {
  const previousDeps = useRef()
  const previousValue = useRef()

  const areDepsEqual = useCallback((prevDeps, nextDeps) => {
    if (!prevDeps || !nextDeps) return false
    if (prevDeps.length !== nextDeps.length) return false

    if (deepCompare) {
      return prevDeps.every((dep, index) => 
        JSON.stringify(dep) === JSON.stringify(nextDeps[index])
      )
    } else {
      return prevDeps.every((dep, index) => dep === nextDeps[index])
    }
  }, [deepCompare])

  if (!areDepsEqual(previousDeps.current, deps)) {
    previousValue.current = factory()
    previousDeps.current = deps
  }

  return previousValue.current
}

// Debounced state hook for expensive operations
export const useDebouncedState = (initialValue, delay = 300) => {
  const [value, setValue] = useState(initialValue)
  const [debouncedValue, setDebouncedValue] = useState(initialValue)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return [value, debouncedValue, setValue]
}

// Intersection observer hook for lazy loading
export const useIntersectionObserver = (
  elementRef,
  options = { threshold: 0.1, rootMargin: '50px' }
) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
      if (entry.isIntersecting) {
        setHasIntersected(true)
      }
    }, options)

    observer.observe(element)

    return () => observer.unobserve(element)
  }, [options])

  return { isIntersecting, hasIntersected }
}

// Virtual scrolling hook for large lists
export const useVirtualScrolling = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length - 1
    )
    return { startIndex, endIndex }
  }, [scrollTop, itemHeight, containerHeight, items.length])

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1)
      .map((item, index) => ({
        ...item,
        index: visibleRange.startIndex + index
      }))
  }, [items, visibleRange])

  const totalHeight = items.length * itemHeight
  const offsetY = visibleRange.startIndex * itemHeight

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop
  }
}

// Image preloading utility
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// Batch image preloading
export const preloadImages = async (sources, options = {}) => {
  const { 
    concurrency = 3, 
    onProgress = () => {}, 
    onError = () => {} 
  } = options

  let loaded = 0
  let errors = 0
  const results = []

  // Process images in batches
  for (let i = 0; i < sources.length; i += concurrency) {
    const batch = sources.slice(i, i + concurrency)
    const promises = batch.map(async (src) => {
      try {
        const img = await preloadImage(src)
        loaded++
        onProgress({ loaded, errors, total: sources.length })
        return { src, success: true, image: img }
      } catch (error) {
        errors++
        onError(error, src)
        onProgress({ loaded, errors, total: sources.length })
        return { src, success: false, error }
      }
    })

    const batchResults = await Promise.all(promises)
    results.push(...batchResults)
  }

  return results
}

// Code splitting utility
export const createAsyncComponent = (importFunc, options = {}) => {
  const {
    loading: LoadingComponent = () => <div>Loading...</div>,
    error: ErrorComponent = ({ error, retry }) => (
      <div>
        Error loading component: {error.message}
        <button onClick={retry}>Retry</button>
      </div>
    ),
    timeout = 10000
  } = options

  return memo((props) => {
    const [state, setState] = useState({ 
      component: null, 
      loading: true, 
      error: null 
    })

    const loadComponent = useCallback(async () => {
      setState({ component: null, loading: true, error: null })

      const timeoutId = setTimeout(() => {
        setState(prev => prev.loading ? {
          component: null,
          loading: false,
          error: new Error('Component load timeout')
        } : prev)
      }, timeout)

      try {
        const module = await importFunc()
        clearTimeout(timeoutId)
        setState({ 
          component: module.default || module, 
          loading: false, 
          error: null 
        })
      } catch (error) {
        clearTimeout(timeoutId)
        setState({ component: null, loading: false, error })
      }
    }, [])

    useEffect(() => {
      loadComponent()
    }, [loadComponent])

    if (state.loading) return <LoadingComponent />
    if (state.error) return <ErrorComponent error={state.error} retry={loadComponent} />
    if (state.component) {
      const Component = state.component
      return <Component {...props} />
    }

    return null
  })
}

// Resource preloading hook
export const useResourcePreloader = () => {
  const [preloadedResources] = useState(new Map())

  const preloadResource = useCallback(async (url, type = 'fetch') => {
    if (preloadedResources.has(url)) {
      return preloadedResources.get(url)
    }

    let promise
    switch (type) {
      case 'image':
        promise = preloadImage(url)
        break
      case 'fetch':
        promise = fetch(url).then(res => res.json())
        break
      case 'module':
        promise = import(url)
        break
      default:
        promise = fetch(url)
    }

    preloadedResources.set(url, promise)
    return promise
  }, [preloadedResources])

  const getPreloadedResource = useCallback((url) => {
    return preloadedResources.get(url)
  }, [preloadedResources])

  return { preloadResource, getPreloadedResource }
}

// Performance monitoring hook
export const usePerformanceMonitor = (componentName) => {
  const renderCount = useRef(0)
  const lastRender = useRef(performance.now())
  
  useEffect(() => {
    renderCount.current++
    const now = performance.now()
    const timeSinceLastRender = now - lastRender.current
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} - Render #${renderCount.current}, Time: ${timeSinceLastRender.toFixed(2)}ms`)
    }
    
    lastRender.current = now
  })

  const markMilestone = useCallback((name) => {
    if (process.env.NODE_ENV === 'development') {
      performance.mark(`${componentName}-${name}`)
    }
  }, [componentName])

  return { renderCount: renderCount.current, markMilestone }
}

// Bundle size analyzer (development only)
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV !== 'development') return

  const getResourceSize = (url) => {
    const link = document.querySelector(`link[href="${url}"], script[src="${url}"]`)
    if (!link) return 0
    
    return fetch(url)
      .then(response => response.blob())
      .then(blob => blob.size)
      .catch(() => 0)
  }

  const scripts = Array.from(document.querySelectorAll('script[src]'))
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))

  Promise.all([
    ...scripts.map(script => getResourceSize(script.src)),
    ...styles.map(style => getResourceSize(style.href))
  ]).then(sizes => {
    const totalSize = sizes.reduce((sum, size) => sum + size, 0)
    console.log('Bundle Analysis:', {
      totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
      scripts: scripts.length,
      styles: styles.length,
      breakdown: sizes.map((size, index) => ({
        resource: index < scripts.length 
          ? scripts[index].src 
          : styles[index - scripts.length].href,
        size: `${(size / 1024).toFixed(2)} KB`
      }))
    })
  })
}

// Memory usage monitor
export const useMemoryMonitor = (interval = 5000) => {
  const [memoryInfo, setMemoryInfo] = useState(null)

  useEffect(() => {
    if (!performance.memory) return

    const updateMemoryInfo = () => {
      setMemoryInfo({
        used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
      })
    }

    updateMemoryInfo()
    const intervalId = setInterval(updateMemoryInfo, interval)

    return () => clearInterval(intervalId)
  }, [interval])

  return memoryInfo
}

// Critical resource prioritization
export const prioritizeResource = (url, priority = 'high') => {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = url
  link.as = 'fetch'
  link.crossOrigin = 'anonymous'
  
  // Set fetchpriority if supported
  if ('fetchPriority' in link) {
    link.fetchPriority = priority
  }
  
  document.head.appendChild(link)
}

// Service Worker management
export const useServiceWorker = () => {
  const [registration, setRegistration] = useState(null)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => {
          setRegistration(reg)
          
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true)
              }
            })
          })
        })
        .catch(error => console.error('SW registration failed:', error))
    }
  }, [])

  const updateApp = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }, [registration])

  return { updateAvailable, updateApp }
}

export default {
  createLazyComponent,
  useSmartMemo,
  useDebouncedState,
  useIntersectionObserver,
  useVirtualScrolling,
  preloadImage,
  preloadImages,
  createAsyncComponent,
  useResourcePreloader,
  usePerformanceMonitor,
  analyzeBundleSize,
  useMemoryMonitor,
  prioritizeResource,
  useServiceWorker
}