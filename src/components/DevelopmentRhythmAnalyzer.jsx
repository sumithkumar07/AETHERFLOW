import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon,
  ClockIcon,
  BoltIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  FireIcon
} from '@heroicons/react/24/outline'
import { useChatStore } from '../store/chatStore'
import { useEnhancedProjectStore } from '../store/enhancedProjectStore'

const DevelopmentRhythmAnalyzer = ({ projectId }) => {
  const [rhythmData, setRhythmData] = useState({
    currentTempo: 'moderate',
    productivity: 75,
    peakHours: [],
    streakDays: 0,
    insights: []
  })
  
  const [weeklyPattern, setWeeklyPattern] = useState([])
  const [codingStreak, setCodingStreak] = useState(0)

  const { messages } = useChatStore()
  const { developmentPatterns, getEnhancedProjectData } = useEnhancedProjectStore()

  useEffect(() => {
    if (projectId) {
      analyzeRhythm()
    }
  }, [projectId, messages])

  const analyzeRhythm = () => {
    const patterns = developmentPatterns[projectId]
    const projectData = getEnhancedProjectData(projectId)
    
    if (!patterns || !messages.length) return

    // Analyze message timing patterns
    const messageTimes = messages.map(msg => new Date(msg.timestamp))
    const hourlyActivity = analyzeHourlyActivity(messageTimes)
    const dailyActivity = analyzeDailyActivity(messageTimes)
    
    // Calculate current tempo
    const recentActivity = messages.slice(-10)
    const avgTimeBetweenMessages = calculateAverageTimeBetween(recentActivity)
    const currentTempo = determineTempoFromInterval(avgTimeBetweenMessages)
    
    // Find peak productivity hours
    const peakHours = findPeakHours(hourlyActivity)
    
    // Calculate productivity score
    const productivity = calculateProductivityScore(patterns, messages)
    
    // Generate insights
    const insights = generateRhythmInsights({
      hourlyActivity,
      dailyActivity,
      currentTempo,
      productivity,
      peakHours
    })

    setRhythmData({
      currentTempo,
      productivity,
      peakHours,
      insights
    })

    setWeeklyPattern(dailyActivity)
    setCodingStreak(calculateCodingStreak(messageTimes))
  }

  const analyzeHourlyActivity = (timestamps) => {
    const hourlyCount = new Array(24).fill(0)
    
    timestamps.forEach(timestamp => {
      const hour = timestamp.getHours()
      hourlyCount[hour]++
    })
    
    return hourlyCount.map((count, hour) => ({
      hour,
      activity: count,
      percentage: Math.round((count / timestamps.length) * 100)
    }))
  }

  const analyzeDailyActivity = (timestamps) => {
    const last7Days = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dayActivity = timestamps.filter(ts => 
        ts.toDateString() === date.toDateString()
      ).length
      
      last7Days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        activity: dayActivity,
        isToday: i === 0
      })
    }
    
    return last7Days
  }

  const calculateAverageTimeBetween = (recentMessages) => {
    if (recentMessages.length < 2) return 0
    
    let totalTime = 0
    for (let i = 1; i < recentMessages.length; i++) {
      const prev = new Date(recentMessages[i - 1].timestamp)
      const curr = new Date(recentMessages[i].timestamp)
      totalTime += curr - prev
    }
    
    return totalTime / (recentMessages.length - 1)
  }

  const determineTempoFromInterval = (avgInterval) => {
    const minutes = avgInterval / (1000 * 60)
    
    if (minutes < 2) return 'rapid'
    if (minutes < 10) return 'fast'
    if (minutes < 30) return 'moderate'
    if (minutes < 60) return 'slow'
    return 'deliberate'
  }

  const findPeakHours = (hourlyActivity) => {
    const sorted = [...hourlyActivity].sort((a, b) => b.activity - a.activity)
    return sorted.slice(0, 3).map(item => ({
      hour: item.hour,
      activity: item.activity,
      label: formatHour(item.hour)
    }))
  }

  const calculateProductivityScore = (patterns, messages) => {
    if (!patterns || !messages.length) return 50

    const recentMessages = messages.slice(-20)
    let score = 50

    // Bonus for consistent activity
    const avgMessagesPerHour = recentMessages.length / 2 // Assuming 2-hour window
    if (avgMessagesPerHour > 3) score += 15
    if (avgMessagesPerHour > 5) score += 10

    // Bonus for code-related messages
    const codeMessages = recentMessages.filter(msg => 
      msg.content.includes('```') || 
      msg.content.includes('implement') ||
      msg.content.includes('create')
    ).length
    score += (codeMessages / recentMessages.length) * 20

    // Bonus for flow state indicators
    const quickResponses = recentMessages.filter((msg, idx) => {
      if (idx === 0) return false
      const timeDiff = new Date(msg.timestamp) - new Date(recentMessages[idx - 1].timestamp)
      return timeDiff < 60000 // Less than 1 minute
    }).length
    score += (quickResponses / recentMessages.length) * 15

    return Math.min(Math.max(Math.round(score), 0), 100)
  }

  const calculateCodingStreak = (timestamps) => {
    if (!timestamps.length) return 0

    let streak = 0
    const today = new Date()
    const oneDayMs = 24 * 60 * 60 * 1000

    for (let i = 0; i < 30; i++) { // Check last 30 days
      const checkDate = new Date(today.getTime() - (i * oneDayMs))
      const hasActivity = timestamps.some(ts => 
        ts.toDateString() === checkDate.toDateString()
      )
      
      if (hasActivity) {
        streak++
      } else if (i > 0) { // Allow one gap day
        break
      }
    }

    return streak
  }

  const generateRhythmInsights = ({ hourlyActivity, currentTempo, productivity, peakHours }) => {
    const insights = []

    // Tempo insights
    if (currentTempo === 'rapid') {
      insights.push({
        type: 'tempo',
        message: '🔥 You\'re in rapid development mode! Great for prototyping.',
        level: 'positive'
      })
    } else if (currentTempo === 'deliberate') {
      insights.push({
        type: 'tempo',
        message: '🤔 Taking time to think through solutions - quality over speed.',
        level: 'neutral'
      })
    }

    // Productivity insights
    if (productivity > 80) {
      insights.push({
        type: 'productivity',
        message: '⚡ High productivity detected! You\'re in the zone.',
        level: 'positive'
      })
    } else if (productivity < 40) {
      insights.push({
        type: 'productivity',
        message: '💡 Consider taking a break or switching tasks to regain momentum.',
        level: 'suggestion'
      })
    }

    // Peak hours insight
    if (peakHours.length > 0) {
      const topHour = peakHours[0]
      insights.push({
        type: 'timing',
        message: `🌟 Your peak productivity is around ${topHour.label}`,
        level: 'info'
      })
    }

    return insights
  }

  const formatHour = (hour) => {
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:00 ${period}`
  }

  const getTempoColor = (tempo) => {
    const colors = {
      rapid: 'text-red-600 dark:text-red-400',
      fast: 'text-orange-600 dark:text-orange-400',
      moderate: 'text-blue-600 dark:text-blue-400',
      slow: 'text-yellow-600 dark:text-yellow-400',
      deliberate: 'text-purple-600 dark:text-purple-400'
    }
    return colors[tempo] || 'text-gray-600 dark:text-gray-400'
  }

  const getTempoIcon = (tempo) => {
    switch (tempo) {
      case 'rapid': return <FireIcon className="w-4 h-4" />
      case 'fast': return <BoltIcon className="w-4 h-4" />
      default: return <ChartBarIcon className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Current Rhythm */}
      <div className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-lg border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900 dark:text-white">Development Rhythm</h3>
          <div className={`flex items-center space-x-1 ${getTempoColor(rhythmData.currentTempo)}`}>
            {getTempoIcon(rhythmData.currentTempo)}
            <span className="text-sm font-medium capitalize">{rhythmData.currentTempo}</span>
          </div>
        </div>

        {/* Productivity Score */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">Productivity</span>
            <span className="text-gray-900 dark:text-white">{rhythmData.productivity}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${rhythmData.productivity}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        {/* Coding Streak */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Coding Streak</span>
          <div className="flex items-center space-x-1">
            <FireIcon className="w-4 h-4 text-orange-500" />
            <span className="text-gray-900 dark:text-white font-medium">
              {codingStreak} day{codingStreak !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Weekly Pattern */}
      <div className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-lg border border-gray-200/50 dark:border-gray-700/50">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Weekly Pattern</h4>
        <div className="flex items-end justify-between space-x-1 h-16">
          {weeklyPattern.map((day, index) => (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(day.activity * 8, 4)}px` }}
              transition={{ delay: index * 0.1 }}
              className={`flex-1 rounded-t ${
                day.isToday 
                  ? 'bg-blue-500' 
                  : day.activity > 0 
                    ? 'bg-gray-400 dark:bg-gray-600' 
                    : 'bg-gray-200 dark:bg-gray-800'
              }`}
              title={`${day.date}: ${day.activity} messages`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          {weeklyPattern.map((day, index) => (
            <span key={index} className={day.isToday ? 'font-medium text-blue-600 dark:text-blue-400' : ''}>
              {day.date}
            </span>
          ))}
        </div>
      </div>

      {/* Peak Hours */}
      {rhythmData.peakHours.length > 0 && (
        <div className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-lg border border-gray-200/50 dark:border-gray-700/50">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Peak Hours</h4>
          <div className="space-y-2">
            {rhythmData.peakHours.slice(0, 2).map((peak, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{peak.label}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                    <div 
                      className="bg-green-500 h-1 rounded-full"
                      style={{ width: `${(peak.activity / Math.max(...rhythmData.peakHours.map(p => p.activity))) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{peak.activity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      {rhythmData.insights.length > 0 && (
        <div className="space-y-2">
          {rhythmData.insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className={`p-3 rounded-lg text-sm ${
                insight.level === 'positive' 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : insight.level === 'suggestion'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                    : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
              }`}
            >
              {insight.message}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DevelopmentRhythmAnalyzer