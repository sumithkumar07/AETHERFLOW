import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AcademicCapIcon,
  BookOpenIcon,
  LightBulbIcon,
  PlayIcon,
  StarIcon,
  TrophyIcon,
  ClockIcon,
  XMarkIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const ContextualLearningAssistant = ({ 
  isVisible, 
  onClose, 
  currentCode = "",
  userActivity = {} 
}) => {
  const [activeTab, setActiveTab] = useState('suggestions')
  const [suggestions, setSuggestions] = useState([])
  const [tutorials, setTutorials] = useState([])
  const [challenges, setChallenges] = useState([])
  const [skillAssessment, setSkillAssessment] = useState(null)
  const [learningPath, setLearningPath] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuthStore()

  useEffect(() => {
    if (isVisible) {
      fetchContextualSuggestions()
    }
  }, [isVisible, currentCode])

  const fetchContextualSuggestions = async () => {
    if (!currentCode.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/learning/contextual-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          current_code: currentCode,
          user_activity: userActivity
        })
      })

      const data = await response.json()
      setSuggestions(data.suggestions || [])
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTutorials = async (topic) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/learning/tutorials?topic=${encodeURIComponent(topic)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      })

      const data = await response.json()
      setTutorials(data.tutorials || [])
    } catch (error) {
      console.error('Failed to fetch tutorials:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchChallenges = async (technology = 'javascript') => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/learning/challenges?technology=${technology}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      })

      const data = await response.json()
      setChallenges(data.challenges || [])
    } catch (error) {
      console.error('Failed to fetch challenges:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const assessSkills = async () => {
    if (!currentCode.trim()) {
      toast.error('Add some code to assess your skills')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/learning/skill-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          code_samples: [currentCode],
          technology: 'javascript'
        })
      })

      const data = await response.json()
      setSkillAssessment(data.assessment)
      setActiveTab('assessment')
      toast.success('Skill assessment completed!')
    } catch (error) {
      console.error('Failed to assess skills:', error)
      toast.error('Failed to assess skills')
    } finally {
      setIsLoading(false)
    }
  }

  const generateLearningPath = async () => {
    if (!skillAssessment) {
      toast.error('Complete skill assessment first')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/learning/learning-path', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          goals: ['improve_coding_skills', 'learn_best_practices'],
          current_skills: skillAssessment.skill_breakdown,
          time_commitment: 'moderate'
        })
      })

      const data = await response.json()
      setLearningPath(data.learning_path)
      setActiveTab('path')
      toast.success('Personalized learning path generated!')
    } catch (error) {
      console.error('Failed to generate learning path:', error)
      toast.error('Failed to generate learning path')
    } finally {
      setIsLoading(false)
    }
  }

  const startTutorial = (tutorial) => {
    toast.success(`Starting: ${tutorial.title}`)
    // This would integrate with your tutorial system
  }

  const startChallenge = (challenge) => {
    toast.success(`Challenge accepted: ${challenge.title}`)
    // This would integrate with your coding challenge system
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/30'
      case 'intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
      case 'advanced': return 'text-red-600 bg-red-100 dark:bg-red-900/30'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800'
    }
  }

  const getSkillLevelColor = (level) => {
    switch (level) {
      case 'expert': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30'
      case 'advanced': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
      case 'intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
      case 'beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/30'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800'
    }
  }

  const renderSuggestions = () => (
    <div className="space-y-4">
      {suggestions.length === 0 ? (
        <div className="text-center py-8">
          <LightBulbIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No learning suggestions available yet
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Start coding to get personalized learning recommendations
          </p>
        </div>
      ) : (
        suggestions.map((suggestion, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${suggestion.type === 'tutorial' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-purple-100 dark:bg-purple-900/30'}`}>
                  {suggestion.type === 'tutorial' ? 
                    <BookOpenIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /> :
                    <TrophyIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  }
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {suggestion.title}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${suggestion.relevance === 'high' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                      {suggestion.relevance} relevance
                    </span>
                    {suggestion.estimated_time && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <ClockIcon className="w-3 h-3" />
                        <span>{suggestion.estimated_time}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => suggestion.type === 'tutorial' ? fetchTutorials(suggestion.title) : startChallenge(suggestion)}
                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {suggestion.description}
            </p>
          </motion.div>
        ))
      )}
    </div>
  )

  const renderTutorials = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Interactive Tutorials
        </h3>
        <div className="flex space-x-2">
          {['React', 'JavaScript', 'Node.js'].map((topic) => (
            <button
              key={topic}
              onClick={() => fetchTutorials(topic)}
              className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {tutorials.length === 0 ? (
        <div className="text-center py-8">
          <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Select a topic to view tutorials
          </p>
        </div>
      ) : (
        tutorials.map((tutorial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {tutorial.title}
                </h4>
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(tutorial.difficulty)}`}>
                    {tutorial.difficulty}
                  </span>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <ClockIcon className="w-3 h-3" />
                    <span>{tutorial.duration}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {tutorial.description}
                </p>
              </div>
              <button
                onClick={() => startTutorial(tutorial)}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlayIcon className="w-4 h-4" />
                <span className="text-sm">Start</span>
              </button>
            </div>
            {tutorial.steps && tutorial.steps.length > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {tutorial.steps.length} steps • Interactive learning
              </div>
            )}
          </motion.div>
        ))
      )}
    </div>
  )

  const renderChallenges = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Coding Challenges
        </h3>
        <button
          onClick={() => fetchChallenges('javascript')}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          Refresh Challenges
        </button>
      </div>

      {challenges.length === 0 ? (
        <div className="text-center py-8">
          <TrophyIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No challenges loaded yet
          </p>
          <button
            onClick={() => fetchChallenges('javascript')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Load Challenges
          </button>
        </div>
      ) : (
        challenges.map((challenge, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {challenge.title}
                </h4>
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <ClockIcon className="w-3 h-3" />
                    <span>{challenge.estimated_time}</span>
                  </div>
                  {challenge.skills_practiced && (
                    <div className="flex space-x-1">
                      {challenge.skills_practiced.slice(0, 2).map((skill, i) => (
                        <span key={i} className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {challenge.description}
                </p>
                {challenge.hints && challenge.hints.length > 0 && (
                  <details className="text-xs text-gray-500 dark:text-gray-400">
                    <summary className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                      {challenge.hints.length} hints available
                    </summary>
                    <ul className="mt-2 space-y-1 ml-4">
                      {challenge.hints.map((hint, i) => (
                        <li key={i}>• {hint}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
              <button
                onClick={() => startChallenge(challenge)}
                className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <TrophyIcon className="w-4 h-4" />
                <span className="text-sm">Challenge</span>
              </button>
            </div>
          </motion.div>
        ))
      )}
    </div>
  )

  const renderSkillAssessment = () => (
    <div className="space-y-4">
      {!skillAssessment ? (
        <div className="text-center py-8">
          <AcademicCapIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Get a personalized skill assessment
          </p>
          <button
            onClick={assessSkills}
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Analyzing...' : 'Assess My Skills'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overall Level */}
          <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {skillAssessment.overall_level}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your current skill level
            </p>
          </div>

          {/* Skill Breakdown */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              Skill Breakdown
            </h4>
            <div className="space-y-3">
              {Object.entries(skillAssessment.skill_breakdown || {}).map(([skill, data]) => (
                <div key={skill} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {skill.replace('_', ' ')}
                    </span>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${getSkillLevelColor(data.level)}`}>
                        {data.level}
                      </span>
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`w-3 h-3 ${i < Math.floor(data.score / 2) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {data.score}/10
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {skillAssessment.recommended_next_steps && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Recommended Next Steps
              </h4>
              <div className="space-y-2">
                {skillAssessment.recommended_next_steps.map((step, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <LightBulbIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={generateLearningPath}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Generating...' : 'Generate Learning Path'}
          </button>
        </div>
      )}
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
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <AcademicCapIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Learning Assistant
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Personalized skill development and learning
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
            {['suggestions', 'tutorials', 'challenges', 'assessment'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab === 'suggestions' && '💡'} 
                {tab === 'tutorials' && '📚'} 
                {tab === 'challenges' && '🏆'} 
                {tab === 'assessment' && '🎓'} 
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                <span className="text-gray-600 dark:text-gray-400">Loading...</span>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'suggestions' && renderSuggestions()}
                {activeTab === 'tutorials' && renderTutorials()}
                {activeTab === 'challenges' && renderChallenges()}
                {activeTab === 'assessment' && renderSkillAssessment()}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ContextualLearningAssistant