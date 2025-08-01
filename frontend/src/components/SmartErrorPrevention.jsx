import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  BugAntIcon,
  LightBulbIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const SmartErrorPrevention = ({ 
  codeContent = "", 
  fileType = "javascript", 
  isActive = false,
  onErrorsDetected,
  position = { top: 20, right: 20 }
}) => {
  const [errors, setErrors] = useState([])
  const [warnings, setWarnings] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState('errors')
  const [expandedItems, setExpandedItems] = useState(new Set())
  const [analysisHistory, setAnalysisHistory] = useState([])
  const { user } = useAuthStore()
  const analysisTimeoutRef = useRef(null)

  // Real-time analysis with debouncing
  useEffect(() => {
    if (!isActive || !codeContent.trim()) return

    // Clear previous timeout
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current)
    }

    // Debounce analysis
    analysisTimeoutRef.current = setTimeout(() => {
      performRealTimeAnalysis()
    }, 1000) // Wait 1 second after user stops typing

    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current)
      }
    }
  }, [codeContent, fileType, isActive])

  const performRealTimeAnalysis = async () => {
    if (!codeContent.trim()) return

    setIsAnalyzing(true)
    try {
      // Get real-time warnings
      const warningsResponse = await fetch('/api/error-prevention/realtime-warnings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          code_fragment: codeContent,
          cursor_position: codeContent.length,
          file_type: fileType
        })
      })

      const warningsData = await warningsResponse.json()
      setWarnings(warningsData.warnings || [])

      // Get comprehensive analysis if enough code
      if (codeContent.length > 100) {
        const analysisResponse = await fetch('/api/error-prevention/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`
          },
          body: JSON.stringify({
            code: codeContent,
            file_type: fileType
          })
        })

        const analysisData = await analysisResponse.json()
        const detectedErrors = analysisData.errors || []
        setErrors(detectedErrors)

        // Add to history
        const analysisRecord = {
          id: Date.now(),
          timestamp: new Date(),
          errors: detectedErrors.length,
          warnings: warningsData.warnings?.length || 0,
          fileType: fileType
        }
        setAnalysisHistory(prev => [analysisRecord, ...prev.slice(0, 4)]) // Keep last 5

        // Notify parent component
        if (onErrorsDetected) {
          onErrorsDetected({
            errors: detectedErrors,
            warnings: warningsData.warnings || []
          })
        }

        // Auto-expand if critical errors found
        const criticalErrors = detectedErrors.filter(e => e.severity === 'high')
        if (criticalErrors.length > 0 && !isExpanded) {
          setIsExpanded(true)
          toast.error(`${criticalErrors.length} critical issue(s) detected!`)
        }
      }

    } catch (error) {
      console.error('Failed to analyze code:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200 dark:bg-red-900/20 dark:border-red-800'
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
      case 'low': return 'text-green-600 bg-green-100 border-green-200 dark:bg-green-900/20 dark:border-green-800'
      default: return 'text-gray-600 bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return <ExclamationTriangleIcon className="w-4 h-4" />
      case 'medium': return <ExclamationTriangleIcon className="w-4 h-4" />
      case 'low': return <BugAntIcon className="w-4 h-4" />
      default: return <BugAntIcon className="w-4 h-4" />
    }
  }

  const toggleExpanded = (itemId) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  const getSuggestedFix = async (error) => {
    try {
      const response = await fetch('/api/error-prevention/suggest-fixes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          error_data: error,
          code_context: codeContent
        })
      })

      const data = await response.json()
      const fixes = data.fixes || []
      
      if (fixes.length > 0) {
        toast.success(`${fixes.length} fix suggestion(s) available`)
        // You could show these in a modal or update the error item
      }
    } catch (error) {
      console.error('Failed to get fix suggestions:', error)
    }
  }

  const getErrorStats = () => {
    const criticalCount = errors.filter(e => e.severity === 'high').length
    const warningCount = warnings.length + errors.filter(e => e.severity === 'medium').length
    const infoCount = errors.filter(e => e.severity === 'low').length
    
    return { criticalCount, warningCount, infoCount }
  }

  const { criticalCount, warningCount, infoCount } = getErrorStats()
  const totalIssues = errors.length + warnings.length

  if (!isActive || totalIssues === 0) {
    // Show minimal indicator when no issues
    return isActive ? (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ top: position.top, right: position.right }}
        className="fixed z-40 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-full p-2"
      >
        <ShieldCheckIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
      </motion.div>
    ) : null
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ top: position.top, right: position.right }}
      className="fixed z-40"
    >
      {/* Compact Indicator */}
      <motion.div
        className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl"
        layoutId="error-prevention-panel"
      >
        {!isExpanded ? (
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center space-x-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-colors"
          >
            <div className="relative">
              {criticalCount > 0 ? (
                <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
              ) : warningCount > 0 ? (
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
              ) : (
                <ShieldCheckIcon className="w-6 h-6 text-green-500" />
              )}
              
              {isAnalyzing && (
                <div className="absolute -top-1 -right-1 w-3 h-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>

            <div className="text-left">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {totalIssues} Issues
                </span>
                {isAnalyzing && (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
              <div className="flex space-x-2 text-xs">
                {criticalCount > 0 && (
                  <span className="text-red-600 dark:text-red-400">{criticalCount} critical</span>
                )}
                {warningCount > 0 && (
                  <span className="text-yellow-600 dark:text-yellow-400">{warningCount} warnings</span>
                )}
                {infoCount > 0 && (
                  <span className="text-blue-600 dark:text-blue-400">{infoCount} info</span>
                )}
              </div>
            </div>
          </button>
        ) : (
          <div className="w-96">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="w-6 h-6 text-blue-500" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Smart Error Prevention
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Real-time code analysis
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {isAnalyzing && (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                )}
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600 dark:text-red-400">
                    {criticalCount}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Critical</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                    {warningCount}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Warnings</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {infoCount}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Info</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200/50 dark:border-gray-700/50">
              <button
                onClick={() => setActiveTab('errors')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'errors'
                    ? 'text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Errors ({errors.length})
              </button>
              <button
                onClick={() => setActiveTab('warnings')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'warnings'
                    ? 'text-yellow-600 dark:text-yellow-400 border-b-2 border-yellow-600 dark:border-yellow-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Warnings ({warnings.length})
              </button>
            </div>

            {/* Content */}
            <div className="max-h-80 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="p-4 space-y-3"
                >
                  {(activeTab === 'errors' ? errors : warnings).length === 0 ? (
                    <div className="text-center py-6">
                      <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        No {activeTab} found! Your code looks good.
                      </p>
                    </div>
                  ) : (
                    (activeTab === 'errors' ? errors : warnings).map((item, index) => (
                      <motion.div
                        key={`${activeTab}-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div 
                          className="p-3 cursor-pointer"
                          onClick={() => toggleExpanded(`${activeTab}-${index}`)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <div className={`p-1 rounded ${getSeverityColor(item.severity)}`}>
                                {getSeverityIcon(item.severity)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {item.message}
                                </p>
                                {item.line && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Line {item.line} • {item.type}
                                  </p>
                                )}
                              </div>
                            </div>
                            {expandedItems.has(`${activeTab}-${index}`) ? 
                              <ChevronUpIcon className="w-4 h-4 text-gray-400 flex-shrink-0" /> :
                              <ChevronDownIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            }
                          </div>
                        </div>

                        <AnimatePresence>
                          {expandedItems.has(`${activeTab}-${index}`) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="border-t border-gray-200 dark:border-gray-700 p-3"
                            >
                              {item.suggestion && (
                                <div className="mb-3">
                                  <p className="text-xs font-medium text-gray-900 dark:text-white mb-1">
                                    Suggestion:
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {item.suggestion}
                                  </p>
                                </div>
                              )}
                              
                              <div className="flex justify-between items-center">
                                <button
                                  onClick={() => getSuggestedFix(item)}
                                  className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800/30 transition-colors"
                                >
                                  Get Fix Suggestions
                                </button>
                                
                                <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                                  <ClockIcon className="w-3 h-3" />
                                  <span>Just now</span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Last scan: {isAnalyzing ? 'Analyzing...' : 'Just now'}</span>
                <div className="flex items-center space-x-1">
                  <ShieldCheckIcon className="w-3 h-3" />
                  <span>AI-powered analysis</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default SmartErrorPrevention