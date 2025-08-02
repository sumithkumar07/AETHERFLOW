import React from 'react'
import MultiAgentCoordinator from '../components/MultiAgentCoordinator'
import RealTimeSystemStatus from '../components/RealTimeSystemStatus'

const Agents = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Real-time System Status Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <RealTimeSystemStatus compact={true} />
      </div>
      
      {/* Multi-Agent Coordinator */}
      <MultiAgentCoordinator />
    </div>
  )
}

export default Agents