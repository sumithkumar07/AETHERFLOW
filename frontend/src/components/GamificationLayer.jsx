import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrophyIcon,
  FireIcon,
  ChartBarIcon,
  StarIcon,
  BoltIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const GamificationLayer = () => {
  const [userStats, setUserStats] = useState({})
  const [achievements, setAchievements] = useState([])
  const [dailyStreak, setDailyStreak] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [leaderboard, setLeaderboard] = useState([])
  const [currentChallenge, setCurrentChallenge] = useState(null)
  const { user } = useAuthStore()

  // Initialize gamification data
  useEffect(() => {
    const initializeGamification = () => {
      // Mock user statistics
      const stats = {
        totalProjects: Math.floor(Math.random() * 20) + 5,
        linesOfCode: Math.floor(Math.random() * 10000) + 2000,
        bugsFixed: Math.floor(Math.random() * 50) + 10,
        featuresShipped: Math.floor(Math.random() * 30) + 8,
        collaborations: Math.floor(Math.random() * 15) + 3,
        codeReviews: Math.floor(Math.random() * 40) + 15,
        level: Math.floor(Math.random() * 10) + 1,
        xp: Math.floor(Math.random() * 5000) + 1200,
        nextLevelXP: 5000,
        rank: Math.floor(Math.random() * 100) + 1
      }
      setUserStats(stats)

      // Mock achievements
      const mockAchievements = [
        {
          id: 'first-project',
          name: 'Hello World',
          description: 'Created your first project',
          icon: '🎯',
          rarity: 'common',
          unlockedAt: new Date(Date.now() - 86400000 * 7),
          xpReward: 100
        },
        {
          id: 'speed-demon',
          name: 'Speed Demon',
          description: 'Completed a project in under 2 hours',
          icon: '⚡',
          rarity: 'rare',
          unlockedAt: new Date(Date.now() - 86400000 * 3),
          xpReward: 250
        },
        {
          id: 'bug-hunter',
          name: 'Bug Hunter',
          description: 'Fixed 10 bugs in a single session',
          icon: '🐛',
          rarity: 'epic',
          unlockedAt: new Date(Date.now() - 86400000 * 1),
          xpReward: 500
        },
        {
          id: 'collaborator',
          name: 'Team Player',
          description: 'Collaborated on 5 different projects',
          icon: '🤝',
          rarity: 'uncommon',
          unlockedAt: null, // Not unlocked yet
          xpReward: 200
        },
        {
          id: 'streak-master',
          name: 'Streak Master',
          description: 'Code for 7 consecutive days',
          icon: '🔥',
          rarity: 'legendary',
          unlockedAt: null,
          xpReward: 1000
        }
      ]
      setAchievements(mockAchievements)

      // Set daily streak
      setDailyStreak(Math.floor(Math.random() * 15) + 1)

      // Mock leaderboard
      const mockLeaderboard = [
        { rank: 1, name: 'Alex Chen', xp: 12500, avatar: '👨‍💻', streak: 21 },
        { rank: 2, name: 'Sarah Wilson', xp: 11200, avatar: '👩‍💼', streak: 15 },
        { rank: 3, name: 'Mike Johnson', xp: 9800, avatar: '👨‍🎨', streak: 8 },
        { rank: 4, name: user?.name || 'You', xp: stats.xp, avatar: '👤', streak: dailyStreak },
        { rank: 5, name: 'Emma Davis', xp: 8900, avatar: '👩‍🔬', streak: 12 }
      ]
      setLeaderboard(mockLeaderboard)

      // Current challenge
      const challenges = [
        {
          id: 'weekly-builder',
          name: 'Weekly Builder',
          description: 'Create 3 projects this week',
          progress: 2,
          target: 3,
          timeLeft: '2 days',
          reward: '300 XP + Badge',
          difficulty: 'medium'
        },
        {
          id: 'optimization-guru',
          name: 'Optimization Guru',
          description: 'Improve 5 project performance scores',
          progress: 1,
          target: 5,
          timeLeft: '5 days',
          reward: '500 XP + Title',
          difficulty: 'hard'
        }
      ]
      setCurrentChallenge(challenges[Math.floor(Math.random() * challenges.length)])
    }

    initializeGamification()

    // Show gamification layer occasionally
    const showTimer = setTimeout(() => {
      if (Math.random() > 0.3) { // 70% chance to show
        setIsVisible(true)
      }
    }, 5000)

    return () => clearTimeout(showTimer)
  }, [user, dailyStreak])

  // Simulate achievement unlock
  const unlockAchievement = (achievement) => {
    if (achievement.unlockedAt) return

    setAchievements(prev => 
      prev.map(a => 
        a.id === achievement.id 
          ? { ...a, unlockedAt: new Date() }
          : a
      )
    )

    setUserStats(prev => ({
      ...prev,
      xp: prev.xp + achievement.xpReward
    }))

    toast.custom((t) => (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.8 }}
        className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white p-4 rounded-lg shadow-xl max-w-sm"
      >
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{achievement.icon}</div>
          <div>
            <h3 className="font-bold">Achievement Unlocked!</h3>
            <p className="text-sm opacity-90">{achievement.name}</p>
            <p className="text-xs opacity-75">+{achievement.xpReward} XP</p>
          </div>
        </div>
      </motion.div>
    ), { duration: 4000 })
  }

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      uncommon: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      rare: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      epic: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      legendary: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
    }
    return colors[rarity] || colors.common
  }

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'text-green-600 dark:text-green-400',
      medium: 'text-yellow-600 dark:text-yellow-400',
      hard: 'text-red-600 dark:text-red-400'
    }
    return colors[difficulty] || colors.medium
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -300 }}
        className="fixed bottom-6 left-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg z-40 p-4 w-80 max-h-96 overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
              <TrophyIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                Developer Stats
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Level {userStats.level}</span>
                <div className="flex items-center space-x-1">
                  <FireIcon className="w-3 h-3 text-orange-500" />
                  <span className="text-xs text-orange-600 dark:text-orange-400">{dailyStreak} day streak</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          >
            <XMarkIcon className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* XP Progress */}
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Experience</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {userStats.xp?.toLocaleString()} / {userStats.nextLevelXP?.toLocaleString()} XP
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((userStats.xp || 0) / (userStats.nextLevelXP || 5000)) * 100}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="font-bold text-gray-900 dark:text-white">{userStats.totalProjects}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Projects</div>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="font-bold text-gray-900 dark:text-white">{userStats.bugsFixed}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Bugs Fixed</div>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="font-bold text-gray-900 dark:text-white">{userStats.linesOfCode?.toLocaleString()}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Lines of Code</div>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="font-bold text-gray-900 dark:text-white">#{userStats.rank}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Global Rank</div>
          </div>
        </div>

        {/* Current Challenge */}
        {currentChallenge && (
          <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center space-x-1">
              <BoltIcon className="w-4 h-4" />
              <span>Active Challenge</span>
            </h4>
            <div className="mb-2">
              <h5 className="font-medium text-gray-800 dark:text-gray-200 text-sm">{currentChallenge.name}</h5>
              <p className="text-xs text-gray-600 dark:text-gray-400">{currentChallenge.description}</p>
            </div>
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">Progress</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {currentChallenge.progress}/{currentChallenge.target}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
                  style={{ width: `${(currentChallenge.progress / currentChallenge.target) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                <ClockIcon className="w-3 h-3 text-gray-500" />
                <span className="text-gray-500 dark:text-gray-400">{currentChallenge.timeLeft} left</span>
              </div>
              <span className="text-green-600 dark:text-green-400 font-medium">{currentChallenge.reward}</span>
            </div>
          </div>
        )}

        {/* Recent Achievements */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center space-x-1">
            <StarIcon className="w-4 h-4" />
            <span>Achievements</span>
          </h4>
          <div className="space-y-2">
            {achievements.slice(0, 3).map((achievement) => (
              <div
                key={achievement.id}
                className={`p-2 rounded-lg border transition-all duration-200 ${
                  achievement.unlockedAt
                    ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700'
                    : 'border-gray-200 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700 opacity-60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-lg">{achievement.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h6 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {achievement.name}
                      </h6>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      {achievement.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-yellow-600 dark:text-yellow-400">
                        +{achievement.xpReward} XP
                      </span>
                      {achievement.unlockedAt ? (
                        <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                          <CheckCircleIcon className="w-3 h-3" />
                          <span className="text-xs">Unlocked</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => unlockAchievement(achievement)}
                          className="text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded transition-colors"
                        >
                          Unlock
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mini Leaderboard */}
        <div className="pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center space-x-1">
            <UserGroupIcon className="w-4 h-4" />
            <span>Leaderboard</span>
          </h4>
          <div className="space-y-1">
            {leaderboard.slice(0, 5).map((player) => (
              <div
                key={player.rank}
                className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                  player.name === (user?.name || 'You')
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <div className={`text-sm font-bold ${
                  player.rank === 1 ? 'text-yellow-600' :
                  player.rank === 2 ? 'text-gray-500' :
                  player.rank === 3 ? 'text-amber-700' : 'text-gray-400'
                }`}>
                  #{player.rank}
                </div>
                <div className="text-sm">{player.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
                    {player.name}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{player.xp.toLocaleString()} XP</span>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <FireIcon className="w-3 h-3 text-orange-500" />
                      <span>{player.streak}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default GamificationLayer