import React from 'react'
import EnhancedPerformanceMonitor from '../components/EnhancedPerformanceMonitor'
import RealTimeSystemStatus from '../components/RealTimeSystemStatus'

const PerformanceMonitor = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Real-time System Status Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <RealTimeSystemStatus compact={true} />
      </div>
      
      {/* Main Performance Monitor */}
      <EnhancedPerformanceMonitor />
    </div>
  )
}

export default PerformanceMonitor