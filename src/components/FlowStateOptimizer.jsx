import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BoltIcon,
  ChartBarIcon,
  ClockIcon,
  FireIcon,
  LightBulbIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'
import { format, subHours, subDays } from 'date-fns'

const FlowStateOptimizer = ({ projectId, className = '' }) => {
  const [flowData, setFlowData] = useState(null)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [productivity, setProductivity] = useState('medium')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFlowData()
    
    // Update flow data periodically
    const interval = setInterval(loadFlowData, 30000) // 30 seconds
    return () => clearInterval(interval)
  }, [projectId])

  const loadFlowData = async () => {
    try {
      // Simulate loading flow state data
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Generate demo flow state data
      const now = new Date()
      const mockFlowData = {
        currentSession: {
          startTime: subHours(now, 2).toISOString(),
          focusScore: 82,
          productivity: 'high',
          interruptions: 3,
          deepWorkMinutes: 95
        },
        todayStats: {
          totalFocusTime: 245, // minutes
          flowSessions: 4,
          averageFocusScore: 78,
          bestSession: { score: 92, duration: 45 }
        },
        weeklyTrend: [
          { day: 'Mon', focusTime: 180, score: 75 },
          { day: 'Tue', focusTime: 220, score: 82 },
          { day: 'Wed', focusTime: 245, score: 78 },
          { day: 'Thu', focusTime: 190, score: 71 },
          { day: 'Fri', focusTime: 265, score: 85 },
          { day: 'Sat', focusTime: 120, score: 65 },
          { day: 'Sun', focusTime: 160, score: 70 }
        ],
        suggestions: [
          {
            type: 'break',
            message: 'Consider taking a 5-minute break to maintain focus',
            priority: 'medium'
          },
          {
            type: 'environment',
            message: 'You work best in 90-minute focused sessions',
            priority: 'low'
          },
          {
            type: 'timing',
            message: 'Your peak productivity is between 10am-12pm',
            priority: 'high'
          }
        ],
        achievements: [
          { id: 'deep_work_master', name: 'Deep Work Master', earned: true, date: subDays(now, 1) },
          { id: 'focus_streak', name: '7-Day Focus Streak', earned: true, date: subDays(now, 3) },
          { id: 'flow_state', name: 'Flow State Expert', earned: false, progress: 75 }
        ]
      }

      setFlowData(mockFlowData)
      setCurrentStreak(7) // Demo 7-day streak
      setProductivity(mockFlowData.currentSession.productivity)
    } catch (error) {
      console.error('Failed to load flow data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProductivityColor = (level) => {
    switch (level) {
      case 'high': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300'
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300'
      case 'low': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getFocusScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600' 
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (!flowData) return null

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-2">
        <BoltIcon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Flow State
        </h3>
      </div>

      {/* Current Session */}
      <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Current Session
          </h4>
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getProductivityColor(productivity)}`}>
            {productivity} productivity
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-gray-600 dark:text-gray-400">Focus Score</div>
            <div className={`text-lg font-semibold ${getFocusScoreColor(flowData.currentSession.focusScore)}`}>
              {flowData.currentSession.focusScore}/100
            </div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">Deep Work</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {flowData.currentSession.deepWorkMinutes}m
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>Session Progress</span>
            <span>{Math.min(100, (flowData.currentSession.deepWorkMinutes / 90) * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (flowData.currentSession.deepWorkMinutes / 90) * 100)}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-center space-x-2 mb-1">
            <ClockIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">Total Focus</span>
          </div>
          <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
            {Math.floor(flowData.todayStats.totalFocusTime / 60)}h {flowData.todayStats.totalFocusTime % 60}m
          </div>
        </div>
        
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
          <div className="flex items-center space-x-2 mb-1">
            <FireIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs text-green-700 dark:text-green-300 font-medium">Streak</span>
          </div>
          <div className="text-lg font-bold text-green-900 dark:text-green-100">
            {currentStreak} days
          </div>
        </div>
      </div>

      {/* Weekly Trend Chart */}
      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-3">
          <ChartBarIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-xs font-medium text-gray-900 dark:text-white">Weekly Trend</span>
        </div>
        
        <div className="flex items-end justify-between space-x-1 h-16">
          {flowData.weeklyTrend.map((day, index) => (
            <div key={day.day} className="flex flex-col items-center flex-1">
              <motion.div
                className="w-full bg-purple-200 dark:bg-purple-800 rounded-t"
                initial={{ height: 0 }}
                animate={{ height: `${(day.focusTime / 300) * 100}%` }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                style={{ maxHeight: '48px' }}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {day.day}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <LightBulbIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          <span className="text-xs font-medium text-gray-900 dark:text-white">AI Insights</span>
        </div>
        
        {flowData.suggestions.slice(0, 2).map((suggestion, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-2 rounded-lg text-xs ${
              suggestion.priority === 'high' 
                ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700'
                : suggestion.priority === 'medium'
                ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700'
                : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {suggestion.message}
          </motion.div>
        ))}
      </div>

      {/* Achievements */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <TrophyIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          <span className="text-xs font-medium text-gray-900 dark:text-white">Achievements</span>
        </div>
        
        <div className="space-y-1">
          {flowData.achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                achievement.earned 
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>{achievement.earned ? '🏆' : '⏳'}</span>
                <span>{achievement.name}</span>
              </span>
              {achievement.earned ? (
                <span className="text-xs opacity-75">
                  {format(new Date(achievement.date), 'MMM d')}
                </span>
              ) : (
                <span className="text-xs">
                  {achievement.progress}%
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FlowStateOptimizer