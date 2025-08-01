import React, { useState, useEffect, useContext, createContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  SwatchIcon,
  CpuChipIcon,
  LightBulbIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'

// Context for theme adaptation
const ThemeAdaptationContext = createContext()

export const useThemeAdaptation = () => {
  const context = useContext(ThemeAdaptationContext)
  if (!context) {
    throw new Error('useThemeAdaptation must be used within ThemeAdaptationProvider')
  }
  return context
}

export const ThemeAdaptationProvider = ({ children }) => {
  const [adaptiveSettings, setAdaptiveSettings] = useState({
    autoTheme: true,
    layoutDensity: 'comfortable',
    colorPreference: 'dynamic',
    usagePatterns: {},
    recommendations: []
  })

  const { user } = useAuthStore()
  const { theme, setTheme } = useThemeStore()

  // Smart theme adaptation logic
  useEffect(() => {
    const analyzeUsagePatterns = () => {
      const now = new Date()
      const hour = now.getHours()
      
      // Time-based theme adaptation
      if (adaptiveSettings.autoTheme) {
        if (hour >= 6 && hour < 18) {
          // Daytime - suggest light theme
          if (theme === 'dark') {
            setAdaptiveSettings(prev => ({
              ...prev,
              recommendations: [...prev.recommendations, {
                type: 'theme',
                suggestion: 'Switch to light theme for better daytime visibility',
                action: () => setTheme('light')
              }]
            }))
          }
        } else {
          // Evening/Night - suggest dark theme  
          if (theme === 'light') {
            setAdaptiveSettings(prev => ({
              ...prev,
              recommendations: [...prev.recommendations, {
                type: 'theme', 
                suggestion: 'Switch to dark theme to reduce eye strain',
                action: () => setTheme('dark')
              }]
            }))
          }
        }
      }

      // Track usage patterns
      const currentPage = window.location.pathname
      const timestamp = Date.now()
      
      setAdaptiveSettings(prev => ({
        ...prev,
        usagePatterns: {
          ...prev.usagePatterns,
          [currentPage]: {
            lastVisit: timestamp,
            count: (prev.usagePatterns[currentPage]?.count || 0) + 1
          }
        }
      }))
    }

    const interval = setInterval(analyzeUsagePatterns, 30000) // Check every 30 seconds
    analyzeUsagePatterns() // Initial check

    return () => clearInterval(interval)
  }, [adaptiveSettings.autoTheme, theme, setTheme])

  // Generate layout recommendations based on usage
  useEffect(() => {
    const generateLayoutRecommendations = () => {
      const { usagePatterns } = adaptiveSettings
      const frequentPages = Object.entries(usagePatterns)
        .sort(([,a], [,b]) => b.count - a.count)
        .slice(0, 3)

      if (frequentPages.length > 0) {
        setAdaptiveSettings(prev => ({
          ...prev,
          recommendations: [
            ...prev.recommendations.filter(r => r.type !== 'layout'),
            {
              type: 'layout',
              suggestion: `Optimize layout for your most used pages: ${frequentPages.map(([path]) => path.replace('/', '')).join(', ')}`,
              action: () => console.log('Layout optimization applied')
            }
          ]
        }))
      }
    }

    const timeout = setTimeout(generateLayoutRecommendations, 60000) // After 1 minute
    return () => clearTimeout(timeout)
  }, [adaptiveSettings.usagePatterns])

  const value = {
    adaptiveSettings,
    setAdaptiveSettings,
    applyRecommendation: (recommendation) => {
      recommendation.action()
      setAdaptiveSettings(prev => ({
        ...prev,
        recommendations: prev.recommendations.filter(r => r !== recommendation)
      }))
    }
  }

  return (
    <ThemeAdaptationContext.Provider value={value}>
      {children}
    </ThemeAdaptationContext.Provider>
  )
}

const SmartThemeAdapter = () => {
  const { adaptiveSettings, applyRecommendation } = useThemeAdaptation()
  const [isVisible, setIsVisible] = useState(false)

  // Show adapter when there are recommendations
  useEffect(() => {
    setIsVisible(adaptiveSettings.recommendations.length > 0)
  }, [adaptiveSettings.recommendations.length])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed top-24 right-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg z-40 p-4 w-80"
      >
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
            <SwatchIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              Smart Adaptations
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Personalized recommendations
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {adaptiveSettings.recommendations.map((recommendation, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {recommendation.type === 'theme' ? (
                      <LightBulbIcon className="w-4 h-4 text-yellow-500" />
                    ) : recommendation.type === 'layout' ? (
                      <AdjustmentsHorizontalIcon className="w-4 h-4 text-blue-500" />
                    ) : (
                      <CpuChipIcon className="w-4 h-4 text-purple-500" />
                    )}
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {recommendation.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    {recommendation.suggestion}
                  </p>
                  <button
                    onClick={() => applyRecommendation(recommendation)}
                    className="text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg transition-colors font-medium"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Usage Statistics */}
        <div className="mt-4 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center space-x-2 mb-2">
            <EyeIcon className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Usage Insights
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p>Most visited: {Object.keys(adaptiveSettings.usagePatterns).length} pages tracked</p>
            <p className="flex items-center space-x-1 mt-1">
              <ClockIcon className="w-3 h-3" />
              <span>Adaptive theme: {adaptiveSettings.autoTheme ? 'Active' : 'Disabled'}</span>
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default SmartThemeAdapter