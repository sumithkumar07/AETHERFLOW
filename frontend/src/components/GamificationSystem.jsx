import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrophyIcon,
  FireIcon,
  StarIcon,
  BoltIcon,
  RocketLaunchIcon,
  CodeBracketIcon,
  CheckCircleIcon,
  XMarkIcon,
  SparklesIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  LightBulbIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { 
  TrophyIcon as TrophyIconSolid,
  FireIcon as FireIconSolid,
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const GamificationSystem = ({ isVisible, onClose }) => {
  const [activeTab, setActiveTab] = useState('achievements')
  const [userStats, setUserStats] = useState({
    level: 12,
    xp: 2840,
    xpToNext: 1160,
    streak: 7,
    totalProjects: 23,
    completedProjects: 15,
    codeLines: 15420,
    collaborations: 8,
    aiInteractions: 156
  })
  const { user } = useAuthStore()

  // Achievements system
  const achievements = [
    {
      id: 'first-project',
      title: 'First Steps',
      description: 'Created your first AI-powered project',
      icon: RocketLaunchIcon,
      category: 'milestone',
      xp: 100,
      unlocked: true,
      rarity: 'common',
      unlockedAt: '2024-03-15'
    },
    {
      id: 'code-master',
      title: 'Code Master',
      description: 'Written over 10,000 lines of code',
      icon: CodeBracketIcon,
      category: 'skill',
      xp: 500,
      unlocked: true,
      rarity: 'rare',
      unlockedAt: '2024-03-20'
    },
    {
      id: 'ai-whisperer',
      title: 'AI Whisperer',
      description: 'Had 100+ successful AI conversations',
      icon: SparklesIcon,
      category: 'ai',
      xp: 300,
      unlocked: true,
      rarity: 'uncommon',
      unlockedAt: '2024-03-18'
    },
    {
      id: 'streak-champion',
      title: 'Streak Champion',
      description: 'Maintained a 30-day coding streak',
      icon: FireIcon,
      category: 'consistency',
      xp: 1000,
      unlocked: false,
      rarity: 'legendary',
      progress: 7,
      target: 30
    },
    {
      id: 'collaboration-hero',
      title: 'Collaboration Hero',
      description: 'Collaborated on 10+ projects',
      icon: UserGroupIcon,
      category: 'social',
      xp: 400,
      unlocked: false,
      rarity: 'rare',
      progress: 8,
      target: 10
    },
    {
      id: 'template-creator',
      title: 'Template Creator',
      description: 'Created 5 reusable project templates',
      icon: LightBulbIcon,
      category: 'creation',
      xp: 600,
      unlocked: false,
      rarity: 'epic',
      progress: 2,
      target: 5
    },
    {
      id: 'security-champion',
      title: 'Security Champion',
      description: 'Implemented security best practices in all projects',
      icon: ShieldCheckIcon,
      category: 'security',
      xp: 800,
      unlocked: false,
      rarity: 'epic',
      progress: 12,
      target: 20
    }
  ]

  // Level system
  const levelInfo = {
    current: userStats.level,
    title: getLevelTitle(userStats.level),
    xp: userStats.xp,
    xpToNext: userStats.xpToNext,
    totalXpForNext: 4000,
    benefits: [
      'Access to premium AI models',
      'Advanced collaboration features',
      'Priority support',
      'Custom themes and UI'
    ]
  }

  // Streak system
  const streakInfo = {
    current: userStats.streak,
    best: 15,
    isActive: true,
    multiplier: getStreakMultiplier(userStats.streak),
    nextReward: getNextStreakReward(userStats.streak)
  }

  function getLevelTitle(level) {
    if (level >= 50) return 'AI Master'
    if (level >= 25) return 'Code Architect'
    if (level >= 15) return 'Senior Developer'
    if (level >= 10) return 'Developer'
    if (level >= 5) return 'Junior Developer'
    return 'Newcomer'
  }

  function getStreakMultiplier(streak) {
    if (streak >= 30) return 3.0
    if (streak >= 14) return 2.0
    if (streak >= 7) return 1.5
    return 1.0
  }

  function getNextStreakReward(streak) {
    if (streak < 7) return 'XP Boost (7 days)'
    if (streak < 14) return 'Double XP (14 days)'
    if (streak < 30) return 'Triple XP (30 days)'
    return 'Legendary Badge (50 days)'
  }

  function getRarityColor(rarity) {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600'
      case 'uncommon': return 'from-green-400 to-green-600'
      case 'rare': return 'from-blue-400 to-blue-600'
      case 'epic': return 'from-purple-400 to-purple-600'
      case 'legendary': return 'from-yellow-400 to-orange-500'
      default: return 'from-gray-400 to-gray-600'
    }
  }

  const renderAchievements = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
          <TrophyIconSolid className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {achievements.filter(a => a.unlocked).length}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400">Unlocked</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
          <StarIconSolid className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {achievements.reduce((sum, a) => sum + (a.unlocked ? a.xp : 0), 0)}
          </div>
          <div className="text-sm text-purple-600 dark:text-purple-400">Total XP</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
          <CheckCircleIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {Math.round((achievements.filter(a => a.unlocked).length / achievements.length) * 100)}%
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">Complete</div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl border-2 transition-all duration-300 ${
              achievement.unlocked
                ? 'bg-white dark:bg-gray-800 border-green-200 dark:border-green-800 shadow-lg'
                : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 opacity-75'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${getRarityColor(achievement.rarity)} shadow-lg`}>
                <achievement.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-semibold ${
                    achievement.unlocked 
                      ? 'text-gray-900 dark:text-white' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {achievement.title}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      achievement.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                      achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                      achievement.rarity === 'uncommon' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {achievement.rarity}
                    </span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      +{achievement.xp} XP
                    </span>
                  </div>
                </div>
                <p className={`text-sm mb-3 ${
                  achievement.unlocked 
                    ? 'text-gray-600 dark:text-gray-400' 
                    : 'text-gray-500 dark:text-gray-500'
                }`}>
                  {achievement.description}
                </p>
                
                {achievement.unlocked ? (
                  <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                    <CheckCircleIcon className="w-4 h-4" />
                    <span className="text-sm">Unlocked on {achievement.unlockedAt}</span>
                  </div>
                ) : achievement.progress !== undefined ? (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {achievement.progress}/{achievement.target}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-500">
                    Keep building to unlock!
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const renderProgress = () => (
    <div className="space-y-6">
      {/* Level Progress */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold">Level {levelInfo.current}</h3>
            <p className="text-blue-100">{levelInfo.title}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{levelInfo.xp.toLocaleString()}</div>
            <div className="text-blue-100">Total XP</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress to Level {levelInfo.current + 1}</span>
            <span>{levelInfo.xpToNext.toLocaleString()} XP needed</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div 
              className="bg-white h-3 rounded-full transition-all duration-500"
              style={{ width: `${((levelInfo.totalXpForNext - levelInfo.xpToNext) / levelInfo.totalXpForNext) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Streak System */}
      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <FireIconSolid className="w-8 h-8 text-orange-500" />
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {streakInfo.current} Day Streak
            </h3>
            <p className="text-orange-600 dark:text-orange-400">
              {streakInfo.multiplier}x XP Multiplier Active
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {streakInfo.current}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Current</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {streakInfo.best}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Best</div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Next Reward: {streakInfo.nextReward}
          </div>
          <div className="text-xs text-gray-500">
            Keep your streak going to unlock better rewards!
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
          <RocketLaunchIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {userStats.totalProjects}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Projects</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
          <CodeBracketIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {userStats.codeLines.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Lines</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
          <SparklesIcon className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {userStats.aiInteractions}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">AI Chats</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
          <UserGroupIcon className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {userStats.collaborations}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Collabs</div>
        </div>
      </div>
    </div>
  )

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-4xl max-h-[90vh] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <TrophyIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Progress & Achievements
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Track your development journey
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200/50 dark:border-gray-700/50">
            <button
              onClick={() => setActiveTab('achievements')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'achievements'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              🏆 Achievements
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'progress'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              📊 Progress
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'achievements' ? renderAchievements() : renderProgress()}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default GamificationSystem