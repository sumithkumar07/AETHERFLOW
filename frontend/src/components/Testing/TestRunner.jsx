import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlayIcon,
  StopIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

const TestRunner = ({ tests = [], onRunTests, onTestComplete }) => {
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState(null)
  const [results, setResults] = useState({})
  const [progress, setProgress] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  
  const intervalRef = useRef(null)

  useEffect(() => {
    if (isRunning && startTime) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime)
      }, 100)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, startTime])

  const runTests = async () => {
    setIsRunning(true)
    setStartTime(Date.now())
    setResults({})
    setProgress(0)
    setCurrentTest(null)

    const testResults = {}
    
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i]
      setCurrentTest(test)
      setProgress((i / tests.length) * 100)

      try {
        const startTestTime = performance.now()
        
        // Run the test
        const result = await runSingleTest(test)
        
        const endTestTime = performance.now()
        const duration = endTestTime - startTestTime

        testResults[test.id] = {
          ...result,
          duration: Math.round(duration),
          timestamp: new Date().toISOString()
        }

        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 200))
        
      } catch (error) {
        testResults[test.id] = {
          status: 'failed',
          error: error.message,
          duration: 0,
          timestamp: new Date().toISOString()
        }
      }
    }

    setResults(testResults)
    setProgress(100)
    setCurrentTest(null)
    setIsRunning(false)
    
    if (onTestComplete) {
      onTestComplete(testResults)
    }
  }

  const runSingleTest = async (test) => {
    // Simulate different types of tests
    switch (test.type) {
      case 'unit':
        return await runUnitTest(test)
      case 'integration':
        return await runIntegrationTest(test)
      case 'e2e':
        return await runE2ETest(test)
      case 'performance':
        return await runPerformanceTest(test)
      default:
        return await runGenericTest(test)
    }
  }

  const runUnitTest = async (test) => {
    // Mock unit test execution
    const success = Math.random() > 0.1 // 90% success rate
    
    if (success) {
      return {
        status: 'passed',
        message: 'All assertions passed',
        assertions: Math.floor(Math.random() * 10) + 1
      }
    } else {
      throw new Error('Assertion failed: Expected true, got false')
    }
  }

  const runIntegrationTest = async (test) => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500))
    
    const success = Math.random() > 0.15 // 85% success rate
    
    if (success) {
      return {
        status: 'passed',
        message: 'API integration successful',
        responseTime: Math.floor(Math.random() * 500) + 100
      }
    } else {
      throw new Error('API call failed: 500 Internal Server Error')
    }
  }

  const runE2ETest = async (test) => {
    // Mock browser automation
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000))
    
    const success = Math.random() > 0.2 // 80% success rate
    
    if (success) {
      return {
        status: 'passed',
        message: 'User flow completed successfully',
        steps: Math.floor(Math.random() * 5) + 3
      }
    } else {
      throw new Error('Element not found: button[data-testid="submit"]')
    }
  }

  const runPerformanceTest = async (test) => {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 800 + 200))
    
    const loadTime = Math.random() * 1000 + 200
    const success = loadTime < 800 // Fail if load time > 800ms
    
    if (success) {
      return {
        status: 'passed',
        message: `Performance within acceptable limits`,
        loadTime: Math.round(loadTime),
        benchmark: '< 800ms'
      }
    } else {
      throw new Error(`Performance degraded: ${Math.round(loadTime)}ms > 800ms`)
    }
  }

  const runGenericTest = async (test) => {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 600 + 300))
    
    const success = Math.random() > 0.1
    
    if (success) {
      return {
        status: 'passed',
        message: 'Test completed successfully'
      }
    } else {
      throw new Error('Generic test failure')
    }
  }

  const stopTests = () => {
    setIsRunning(false)
    setCurrentTest(null)
  }

  const getTestIcon = (testId) => {
    const result = results[testId]
    if (!result) {
      return <ClockIcon className="w-5 h-5 text-gray-400" />
    }
    
    return result.status === 'passed' 
      ? <CheckCircleIcon className="w-5 h-5 text-green-500" />
      : <XCircleIcon className="w-5 h-5 text-red-500" />
  }

  const getTestStatus = (testId) => {
    const result = results[testId]
    if (!result) return 'pending'
    return result.status
  }

  const getTotalResults = () => {
    const resultValues = Object.values(results)
    return {
      total: resultValues.length,
      passed: resultValues.filter(r => r.status === 'passed').length,
      failed: resultValues.filter(r => r.status === 'failed').length,
      duration: Math.max(...resultValues.map(r => r.duration || 0))
    }
  }

  const formatTime = (ms) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const totals = getTotalResults()

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Test Runner</h3>
            <p className="text-sm text-gray-600">
              {tests.length} tests configured
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {isRunning && (
              <div className="text-sm text-gray-600">
                {formatTime(elapsedTime)}
              </div>
            )}
            
            <button
              onClick={isRunning ? stopTests : runTests}
              disabled={tests.length === 0}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isRunning
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-primary-600 hover:bg-primary-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed'
              }`}
            >
              {isRunning ? (
                <>
                  <StopIcon className="w-4 h-4" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <PlayIcon className="w-4 h-4" />
                  <span>Run Tests</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {isRunning && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-primary-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            
            {currentTest && (
              <div className="mt-2 text-sm text-gray-600">
                Running: {currentTest.name}
              </div>
            )}
          </div>
        )}

        {/* Results Summary */}
        {Object.keys(results).length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {totals.passed}
              </div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {totals.failed}
              </div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {formatTime(elapsedTime)}
              </div>
              <div className="text-sm text-gray-600">Duration</div>
            </div>
          </div>
        )}
      </div>

      {/* Test List */}
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {tests.map((test, index) => {
            const status = getTestStatus(test.id)
            const result = results[test.id]
            
            return (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  currentTest?.id === test.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getTestIcon(test.id)}
                    <div>
                      <div className="font-medium text-gray-900">
                        {test.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {test.description}
                      </div>
                      {result?.message && (
                        <div className={`text-sm mt-1 ${
                          status === 'passed' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {result.message}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      status === 'passed' 
                        ? 'bg-green-100 text-green-800'
                        : status === 'failed'
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {status}
                    </div>
                    
                    {result?.duration && (
                      <div className="text-sm text-gray-500 mt-1">
                        {formatTime(result.duration)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional test details */}
                {result && (
                  <div className="mt-3 pl-8">
                    <div className="text-xs text-gray-500 space-x-4">
                      {result.assertions && (
                        <span>{result.assertions} assertions</span>
                      )}
                      {result.responseTime && (
                        <span>{result.responseTime}ms response</span>
                      )}
                      {result.steps && (
                        <span>{result.steps} steps</span>
                      )}
                      {result.loadTime && (
                        <span>{result.loadTime}ms load time</span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>

        {tests.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <InformationCircleIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tests configured
            </h3>
            <p className="text-gray-600">
              Add test configurations to start running automated tests.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TestRunner