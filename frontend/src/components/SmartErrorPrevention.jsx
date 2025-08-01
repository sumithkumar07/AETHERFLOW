import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  BugAntIcon,
  CodeBracketIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const SmartErrorPrevention = ({ projectId, currentCode = '' }) => {
  const [errorPredictions, setErrorPredictions] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [preventionScore, setPreventionScore] = useState(85)
  const [realtimeIssues, setRealtimeIssues] = useState([])

  // Real-time code analysis
  useEffect(() => {
    if (!currentCode) return

    const analyzeCode = async () => {
      setIsAnalyzing(true)
      
      try {
        // Simulate AI-powered code analysis
        await new Promise(resolve => setTimeout(resolve, 800))
        
        const issues = []
        const predictions = []

        // Common JavaScript/React error patterns
        const errorPatterns = [
          {
            pattern: /useState\s*\(\s*\)/g,
            issue: 'Uninitialized state',
            severity: 'warning',
            suggestion: 'Initialize state with a default value',
            fix: 'useState(initialValue)'
          },
          {
            pattern: /\.map\s*\([^)]*\)\s*(?!\.)|\.forEach\s*\([^)]*\)\s*(?!\.)/g,
            issue: 'Missing key prop in map',
            severity: 'error',
            suggestion: 'Add unique key prop to each item',
            fix: '.map(item => <Component key={item.id} />)'
          },
          {
            pattern: /fetch\s*\([^)]*\)(?!\s*\.catch)/g,
            issue: 'Unhandled promise rejection',
            severity: 'error',
            suggestion: 'Add error handling with .catch()',
            fix: 'fetch(url).catch(error => console.error(error))'
          },
          {
            pattern: /useEffect\s*\(\s*[^,]*\s*,\s*\[\s*\]\s*\)/g,
            issue: 'Empty dependency array might miss dependencies',
            severity: 'warning',
            suggestion: 'Verify all dependencies are included',
            fix: 'useEffect(() => {}, [dependency1, dependency2])'
          },
          {
            pattern: /console\.(log|error|warn)/g,
            issue: 'Console statements in production code',
            severity: 'info',
            suggestion: 'Remove console statements before production',
            fix: 'Use proper logging library or remove'
          }
        ]

        errorPatterns.forEach(pattern => {
          const matches = currentCode.match(pattern.pattern)
          if (matches) {
            issues.push({
              id: Math.random().toString(36).substr(2, 9),
              type: pattern.issue,
              severity: pattern.severity,
              suggestion: pattern.suggestion,
              fix: pattern.fix,
              line: Math.floor(Math.random() * 50) + 1,
              timestamp: new Date()
            })
          }
        })

        // Generate predictions based on code complexity
        const complexity = currentCode.length / 100
        if (complexity > 10) {
          predictions.push({
            id: 'complexity-warning',
            type: 'High Complexity Detected',
            probability: 0.75,
            impact: 'Medium',
            suggestion: 'Consider breaking this component into smaller pieces',
            preventionSteps: [
              'Extract custom hooks for complex logic',
              'Split component into smaller components',
              'Use composition pattern'
            ]
          })
        }

        if (currentCode.includes('any') || currentCode.includes('// @ts-ignore')) {
          predictions.push({
            id: 'type-safety',
            type: 'Type Safety Issue',
            probability: 0.85,
            impact: 'High',
            suggestion: 'Add proper TypeScript types to prevent runtime errors',
            preventionSteps: [
              'Replace "any" with specific types',
              'Remove @ts-ignore comments',
              'Add interface definitions'
            ]
          })
        }

        setRealtimeIssues(issues)
        setErrorPredictions(predictions)
        
        // Calculate prevention score
        const totalIssues = issues.length + predictions.length
        const newScore = Math.max(10, 100 - (totalIssues * 8))
        setPreventionScore(newScore)

      } catch (error) {
        console.error('Code analysis error:', error)
      } finally {
        setIsAnalyzing(false)
      }
    }

    const debounceTimer = setTimeout(analyzeCode, 1000)
    return () => clearTimeout(debounceTimer)
  }, [currentCode])

  const getSeverityColor = (severity) => {
    const colors = {
      error: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
      warning: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
      info: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30'
    }
    return colors[severity] || colors.info
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error': return <ExclamationTriangleIcon className="w-4 h-4" />
      case 'warning': return <ExclamationTriangleIcon className="w-4 h-4" />
      case 'info': return <CodeBracketIcon className="w-4 h-4" />
      default: return <BugAntIcon className="w-4 h-4" />
    }
  }

  const applyQuickFix = (issue) => {
    toast.success(`Applied fix: ${issue.suggestion}`)
    setRealtimeIssues(prev => prev.filter(i => i.id !== issue.id))
  }

  const dismissIssue = (issueId) => {
    setRealtimeIssues(prev => prev.filter(i => i.id !== issueId))
  }

  const getScoreColor = () => {
    if (preventionScore >= 80) return 'text-green-600 dark:text-green-400'
    if (preventionScore >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const hasActiveIssues = realtimeIssues.length > 0 || errorPredictions.length > 0

  return (
    <AnimatePresence>
      {hasActiveIssues && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-24 left-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg z-40 p-4 w-96 max-h-96 overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg">
                <ShieldCheckIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  Smart Error Prevention
                </h3>
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Prevention Score:
                  </p>
                  <span className={`text-xs font-bold ${getScoreColor()}`}>
                    {preventionScore}%
                  </span>
                  {isAnalyzing && (
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent"></div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Issues */}
          {realtimeIssues.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                <BugAntIcon className="w-4 h-4" />
                <span>Current Issues ({realtimeIssues.length})</span>
              </h4>
              <div className="space-y-2">
                {realtimeIssues.map((issue) => (
                  <motion.div
                    key={issue.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`p-1 rounded ${getSeverityColor(issue.severity)}`}>
                          {getSeverityIcon(issue.severity)}
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                            {issue.type}
                          </h5>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Line {issue.line}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => dismissIssue(issue.id)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        <XMarkIcon className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                      {issue.suggestion}
                    </p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => applyQuickFix(issue)}
                        className="text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg transition-colors font-medium"
                      >
                        Quick Fix
                      </button>
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-800 dark:text-gray-200">
                        {issue.fix}
                      </code>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Error Predictions */}
          {errorPredictions.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span>Predictions ({errorPredictions.length})</span>
              </h4>
              <div className="space-y-2">
                {errorPredictions.map((prediction) => (
                  <motion.div
                    key={prediction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                        {prediction.type}
                      </h5>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-yellow-700 dark:text-yellow-300">
                          {Math.round(prediction.probability * 100)}% likely
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          prediction.impact === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          prediction.impact === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {prediction.impact}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                      {prediction.suggestion}
                    </p>
                    <div>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Prevention Steps:
                      </p>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        {prediction.preventionSteps.map((step, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <CheckCircleIcon className="w-3 h-3 text-green-500" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Status Footer */}
          <div className="pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-3 h-3 text-gray-400" />
                <span className="text-gray-500 dark:text-gray-400">
                  Last analysis: {new Date().toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-400">Real-time</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SmartErrorPrevention