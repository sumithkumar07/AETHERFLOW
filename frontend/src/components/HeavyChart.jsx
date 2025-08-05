import React from 'react'
import { motion } from 'framer-motion'

// Mock heavy chart component - placeholder for actual chart library
const HeavyChart = ({ data = [], type = 'line', className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white dark:bg-gray-800 rounded-lg border p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Performance Chart
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {type} chart
        </span>
      </div>
      
      {/* Mock chart visualization */}
      <div className="h-64 flex items-end justify-between px-2 space-x-1 bg-gradient-to-t from-blue-50 to-transparent dark:from-blue-900/20 rounded">
        {[65, 85, 75, 95, 80, 70, 90, 85].map((height, index) => (
          <motion.div
            key={index}
            initial={{ height: 0 }}
            animate={{ height: `${height}%` }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="bg-gradient-to-t from-blue-500 to-blue-300 dark:from-blue-600 dark:to-blue-400 rounded-t flex-1 min-h-[4px]"
          />
        ))}
      </div>
      
      <div className="mt-4 flex justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>Jan</span>
        <span>Feb</span>
        <span>Mar</span>
        <span>Apr</span>
        <span>May</span>
        <span>Jun</span>
        <span>Jul</span>
        <span>Aug</span>
      </div>
    </motion.div>
  )
}

export default HeavyChart