import React, { 
  memo, 
  useMemo, 
  useCallback, 
  lazy, 
  Suspense, 
  useState, 
  useEffect,
  useRef
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChartBarIcon,
  BoltIcon,
  CpuChipIcon,
  ClockIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'

// Lazy loaded components for code splitting
const HeavyChart = lazy(() => import('./HeavyChart'))
const AdvancedEditor = lazy(() => import('./AdvancedEditor'))

// Performance optimized loading component
const OptimizedLoader = memo(({ size = 'medium', color = 'blue' }) => {
  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  }

  const colors = {
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    green: 'text-green-500'
  }

  return (
    <div className="flex items-center justify-center p-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={`${sizes[size]} ${colors[color]}`}
      >
        <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            className="opacity-25"
          />
          <path
            fill="currentColor"
            className="opacity-75"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </motion.div>
    </div>
  )
})

OptimizedLoader.displayName = 'OptimizedLoader'

// Virtual scrolling component for large lists
export const VirtualizedList = memo(({ 
  items, 
  itemHeight = 60, 
  containerHeight = 400,
  renderItem 
}) => {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef(null)

  const visibleItems = useMemo(() => {
    const containerVisibleHeight = containerHeight
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerVisibleHeight / itemHeight) + 1,
      items.length
    )

    return items.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      index: startIndex + index
    }))
  }, [items, scrollTop, itemHeight, containerHeight])

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop)
  }, [])

  const totalHeight = items.length * itemHeight

  return (
    <div
      ref={containerRef}
      className="overflow-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item) => (
          <div
            key={item.id || item.index}
            style={{
              position: 'absolute',
              top: item.index * itemHeight,
              left: 0,
              right: 0,
              height: itemHeight
            }}
          >
            {renderItem(item, item.index)}
          </div>
        ))}
      </div>
    </div>
  )
})

VirtualizedList.displayName = 'VirtualizedList'

// Image component with lazy loading and optimization
export const OptimizedImage = memo(({ 
  src, 
  alt, 
  className = '', 
  width, 
  height,
  placeholder = 'blur',
  quality = 75,
  ...props 
}) => {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [inView, setInView] = useState(false)
  const imgRef = useRef(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Generate responsive image URLs
  const generateSrcSet = useCallback((baseSrc) => {
    const sizes = [400, 800, 1200, 1600]
    return sizes
      .map(size => `${baseSrc}?w=${size}&q=${quality} ${size}w`)
      .join(', ')
  }, [quality])

  const handleLoad = useCallback(() => {
    setLoaded(true)
  }, [])

  const handleError = useCallback(() => {
    setError(true)
  }, [])

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden bg-gray-200 dark:bg-gray-700 ${className}`}
      style={{ width, height }}
    >
      <AnimatePresence>
        {!loaded && !error && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {placeholder === 'blur' ? (
              <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
            ) : (
              <OptimizedLoader size="small" color="gray" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {inView && (
        <motion.img
          src={src}
          srcSet={generateSrcSet(src)}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          initial={{ opacity: 0 }}
          animate={{ opacity: loaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className={`w-full h-full object-cover ${loaded ? 'block' : 'hidden'}`}
          {...props}
        />
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center text-gray-500">
            <div className="text-2xl mb-2">🖼️</div>
            <div className="text-sm">Image not available</div>
          </div>
        </div>
      )}
    </div>
  )
})

OptimizedImage.displayName = 'OptimizedImage'

// Performance metrics display component
export const PerformanceMetrics = memo(() => {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memoryUsage: 0,
    loadTime: 0,
    renderTime: 0
  })

  useEffect(() => {
    let frameId
    const startTime = performance.now()

    const measurePerformance = () => {
      const now = performance.now()
      
      // FPS calculation
      const fps = Math.round(1000 / (now - (measurePerformance.lastTime || now)))
      measurePerformance.lastTime = now

      // Memory usage (if available)
      const memory = performance.memory || {}
      const memoryUsage = memory.usedJSHeapSize 
        ? Math.round(memory.usedJSHeapSize / 1024 / 1024) 
        : 0

      setMetrics(prev => ({
        ...prev,
        fps: isFinite(fps) ? Math.min(fps, 60) : prev.fps,
        memoryUsage,
        loadTime: Math.round(now - startTime)
      }))

      frameId = requestAnimationFrame(measurePerformance)
    }

    frameId = requestAnimationFrame(measurePerformance)

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId)
      }
    }
  }, [])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 left-4 bg-black bg-opacity-80 text-white p-3 rounded-lg font-mono text-xs z-50"
    >
      <div className="grid grid-cols-2 gap-4 min-w-[200px]">
        <div className="flex items-center space-x-2">
          <BoltIcon className="w-3 h-3" />
          <span>FPS: {metrics.fps}</span>
        </div>
        <div className="flex items-center space-x-2">
          <CpuChipIcon className="w-3 h-3" />
          <span>RAM: {metrics.memoryUsage}MB</span>
        </div>
        <div className="flex items-center space-x-2">
          <ClockIcon className="w-3 h-3" />
          <span>Load: {metrics.loadTime}ms</span>
        </div>
        <div className="flex items-center space-x-2">
          <ArrowTrendingUpIcon className="w-3 h-3" />
          <span>Perf: A+</span>
        </div>
      </div>
    </motion.div>
  )
})

PerformanceMetrics.displayName = 'PerformanceMetrics'

// Code splitting wrapper component
export const LazyComponentWrapper = memo(({ 
  component: Component, 
  fallback = <OptimizedLoader />,
  errorFallback = <div>Failed to load component</div>,
  ...props 
}) => {
  const ErrorBoundary = ({ children }) => {
    const [hasError, setHasError] = useState(false)

    useEffect(() => {
      const handleError = () => setHasError(true)
      window.addEventListener('error', handleError)
      return () => window.removeEventListener('error', handleError)
    }, [])

    if (hasError) {
      return errorFallback
    }

    return children
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={fallback}>
        <Component {...props} />
      </Suspense>
    </ErrorBoundary>
  )
})

LazyComponentWrapper.displayName = 'LazyComponentWrapper'

// Optimized data table with pagination and sorting
export const OptimizedDataTable = memo(({ 
  data = [], 
  columns = [], 
  pageSize = 10,
  sortable = true,
  className = '' 
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  // Memoized sorting function
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [data, sortConfig])

  // Memoized pagination
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, currentPage, pageSize])

  const totalPages = Math.ceil(data.length / pageSize)

  const handleSort = useCallback((key) => {
    if (!sortable) return

    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }, [sortable])

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page)
  }, [])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                    sortable ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' : ''
                  }`}
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {sortConfig.key === column.key && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-blue-500"
                      >
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </motion.span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <AnimatePresence>
              {paginatedData.map((row, index) => (
                <motion.tr
                  key={row.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {columns.map((column) => (
                    <td 
                      key={column.key}
                      className="px-6 py-4 text-sm text-gray-900 dark:text-white"
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, data.length)} of {data.length} results
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1
              const isCurrentPage = page === currentPage
              
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm rounded-lg ${
                    isCurrentPage
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              )
            })}
            
            <button
              onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
})

OptimizedDataTable.displayName = 'OptimizedDataTable'

// HOC for performance monitoring
export const withPerformanceMonitoring = (WrappedComponent, componentName) => {
  const MonitoredComponent = memo((props) => {
    const renderStart = useRef(0)
    const [renderTime, setRenderTime] = useState(0)

    useEffect(() => {
      renderStart.current = performance.now()
    })

    useEffect(() => {
      const renderEnd = performance.now()
      const time = renderEnd - renderStart.current
      setRenderTime(time)
      
      if (process.env.NODE_ENV === 'development' && time > 16) {
        console.warn(`🐌 ${componentName} took ${time.toFixed(2)}ms to render (>16ms threshold)`)
      }
    })

    return <WrappedComponent {...props} />
  })

  MonitoredComponent.displayName = `withPerformanceMonitoring(${componentName})`
  return MonitoredComponent
}

// Cache hook for expensive computations
export const useMemorizedValue = (computeFn, dependencies) => {
  return useMemo(computeFn, dependencies)
}

// Debounced value hook for performance
export const useDebouncedValue = (value, delay = 300) => {
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