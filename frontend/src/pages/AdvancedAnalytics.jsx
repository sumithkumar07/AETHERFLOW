import React from 'react'
import EnhancedAnalyticsDashboard from '../components/EnhancedAnalyticsDashboard'
import RealTimeSystemStatus from '../components/RealTimeSystemStatus'

const AdvancedAnalytics = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Real-time System Status Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <RealTimeSystemStatus compact={true} />
      </div>
      
      {/* Main Analytics Dashboard */}
      <EnhancedAnalyticsDashboard />
    </div>
  )
}

export default AdvancedAnalytics