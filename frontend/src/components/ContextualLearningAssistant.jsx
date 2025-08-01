import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AcademicCapIcon,
  BookOpenIcon,
  PlayIcon,
  TrophyIcon,
  ChartBarIcon,
  LightBulbIcon,
  ArrowTopRightOnSquareIcon,
  XMarkIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const ContextualLearningAssistant = ({ projectId, currentContext = '' }) => {
  const [suggestions, setSuggestions] = useState([])
  const [skillProgress, setSkillProgress] = useState({})
  const [activeTutorials, setActiveTutorials] = useState([])
  const [learningPath, setLearningPath] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  // Learning content database
  const learningContent = {
    'react': {
      name: 'React Development',
      tutorials: [
        {
          id: 'react-hooks',
          title: 'Mastering React Hooks',
          difficulty: 'Intermediate',
          duration: '45 min',
          description: 'Learn advanced hook patterns and custom hooks',
          url: 'https://react.dev/learn/hooks-overview',
          skills: ['useState', 'useEffect', 'custom hooks']
        },
        {
          id: 'react-performance',
          title: 'React Performance Optimization',
          difficulty: 'Advanced',
          duration: '60 min',
          description: 'Optimize your React apps for better performance',
          url: 'https://react.dev/learn/render-and-commit',
          skills: ['React.memo', 'useMemo', 'useCallback']
        }
      ]
    },
    'javascript': {
      name: 'Modern JavaScript',
      tutorials: [
        {
          id: 'async-js',
          title: 'Async JavaScript Patterns',
          difficulty: 'Intermediate',
          duration: '40 min',
          description: 'Master promises, async/await, and error handling',
          url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous',
          skills: ['Promises', 'async/await', 'error handling']
        },
        {
          id: 'es6-features',
          title: 'ES6+ Features Deep Dive',
          difficulty: 'Intermediate',
          duration: '50 min',
          description: 'Explore modern JavaScript features and syntax',
          url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
          skills: ['destructuring', 'arrow functions', 'modules']
        }
      ]
    },
    'typescript': {
      name: 'TypeScript',
      tutorials: [
        {
          id: 'ts-basics',
          title: 'TypeScript Fundamentals',
          difficulty: 'Beginner',
          duration: '30 min',
          description: 'Get started with TypeScript basics',
          url: 'https://www.typescriptlang.org/docs/',
          skills: ['types', 'interfaces', 'generics']
        }
      ]
    },
    'testing': {
      name: 'Testing',
      tutorials: [
        {
          id: 'react-testing',
          title: 'Testing React Components',
          difficulty: 'Intermediate',
          duration: '35 min',
          description: 'Learn to test React components effectively',
          url: 'https://testing-library.com/docs/react-testing-library/intro/',
          skills: ['Jest', 'React Testing Library', 'unit tests']
        }
      ]
    }
  }

  // Analyze current context and suggest learning materials
  useEffect(() => {
    if (!currentContext) return

    const analyzeContext = () => {
      const suggestions = []
      const context = currentContext.toLowerCase()

      // Detect technologies and patterns
      const technologies = {
        'react': /use(state|effect|context|callback|memo)|jsx|component/i,
        'javascript': /function|const|let|var|async|await|promise/i,
        'typescript': /interface|type\s|generic|enum/i,
        'testing': /test|spec|describe|it\(|expect/i,
        'css': /css|style|tailwind|flexbox|grid/i,
        'api': /fetch|api|endpoint|rest|graphql/i
      }

      Object.entries(technologies).forEach(([tech, pattern]) => {
        if (pattern.test(context)) {
          const content = learningContent[tech]
          if (content) {
            content.tutorials.forEach(tutorial => {
              suggestions.push({
                ...tutorial,
                category: tech,
                categoryName: content.name,
                relevanceScore: calculateRelevanceScore(context, tutorial),
                timestamp: new Date()
              })
            })
          }
        }
      })

      // Sort by relevance
      suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore)
      setSuggestions(suggestions.slice(0, 4))
      setIsVisible(suggestions.length > 0)

      // Generate learning path
      if (suggestions.length > 0) {
        generateLearningPath(suggestions)
      }
    }

    const debounceTimer = setTimeout(analyzeContext, 1000)
    return () => clearTimeout(debounceTimer)
  }, [currentContext])

  // Update skill progress simulation
  useEffect(() => {
    const updateSkillProgress = () => {
      const skills = ['React', 'JavaScript', 'TypeScript', 'Testing', 'Performance']
      const progress = {}
      
      skills.forEach(skill => {
        progress[skill] = {
          level: Math.floor(Math.random() * 100) + 1,
          xp: Math.floor(Math.random() * 1000),
          nextLevelXP: 1000,
          streak: Math.floor(Math.random() * 7) + 1
        }
      })
      
      setSkillProgress(progress)
    }

    updateSkillProgress()
  }, [])

  const calculateRelevanceScore = (context, tutorial) => {
    let score = 0
    
    // Check if tutorial skills match current context
    tutorial.skills.forEach(skill => {
      if (context.toLowerCase().includes(skill.toLowerCase())) {
        score += 30
      }
    })
    
    // Check difficulty appropriateness
    if (tutorial.difficulty === 'Intermediate') score += 20
    if (tutorial.difficulty === 'Beginner') score += 15
    if (tutorial.difficulty === 'Advanced') score += 25
    
    // Random relevance factor
    score += Math.random() * 20
    
    return score
  }

  const generateLearningPath = (suggestions) => {
    const path = {
      title: 'Recommended Learning Path',
      estimatedTime: suggestions.reduce((total, s) => total + parseInt(s.duration), 0),
      steps: suggestions.map((suggestion, index) => ({
        id: suggestion.id,
        order: index + 1,
        title: suggestion.title,
        duration: suggestion.duration,
        completed: Math.random() > 0.7
      }))
    }
    
    setLearningPath(path)
  }

  const startTutorial = (tutorial) => {
    setActiveTutorials(prev => [...prev, {
      ...tutorial,
      startTime: new Date(),
      progress: 0
    }])
    toast.success(`Started: ${tutorial.title}`)
  }

  const openTutorial = (tutorial) => {
    window.open(tutorial.url, '_blank')
    startTutorial(tutorial)
  }

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Beginner': 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
      'Intermediate': 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
      'Advanced': 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
    }
    return colors[difficulty] || colors.Beginner
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed top-96 right-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg z-40 p-4 w-80 max-h-96 overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
              <AcademicCapIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                Learning Assistant
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Contextual learning suggestions
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          >
            <XMarkIcon className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Skill Progress Overview */}
        {Object.keys(skillProgress).length > 0 && (
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-1">
              <ChartBarIcon className="w-4 h-4" />
              <span>Skill Progress</span>
            </h4>
            <div className="space-y-2">
              {Object.entries(skillProgress).slice(0, 3).map(([skill, data]) => (
                <div key={skill} className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">{skill}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                        style={{ width: `${data.level}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{data.level}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contextual Suggestions */}
        {suggestions.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-1">
              <LightBulbIcon className="w-4 h-4" />
              <span>Suggested Tutorials ({suggestions.length})</span>
            </h4>
            <div className="space-y-2">
              {suggestions.map((suggestion) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {suggestion.title}
                      </h5>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(suggestion.difficulty)}`}>
                          {suggestion.difficulty}
                        </span>
                        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                          <ClockIcon className="w-3 h-3" />
                          <span>{suggestion.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    {suggestion.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {suggestion.skills.slice(0, 2).map((skill) => (
                        <span
                          key={skill}
                          className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => openTutorial(suggestion)}
                      className="flex items-center space-x-1 text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <PlayIcon className="w-3 h-3" />
                      <span>Start</span>
                      <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Active Tutorials */}
        {activeTutorials.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-1">
              <BookOpenIcon className="w-4 h-4" />
              <span>Active Learning ({activeTutorials.length})</span>
            </h4>
            <div className="space-y-2">
              {activeTutorials.map((tutorial) => (
                <div
                  key={tutorial.id}
                  className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-green-800 dark:text-green-300 truncate">
                      {tutorial.title}
                    </span>
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-1.5 bg-green-200 dark:bg-green-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{ width: `${tutorial.progress || 15}%` }}
                      />
                    </div>
                    <span className="text-xs text-green-600 dark:text-green-400">
                      {tutorial.progress || 15}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Learning Path */}
        {learningPath && (
          <div className="pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-1">
              <TrophyIcon className="w-4 h-4" />
              <span>Learning Path</span>
            </h4>
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              <p>{learningPath.title}</p>
              <p className="flex items-center space-x-1 mt-1">
                <ClockIcon className="w-3 h-3" />
                <span>Est. {learningPath.estimatedTime} minutes</span>
              </p>
            </div>
            <div className="space-y-1">
              {learningPath.steps.slice(0, 3).map((step) => (
                <div key={step.id} className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    step.completed 
                      ? 'bg-green-100 border-green-500 dark:bg-green-900/30 dark:border-green-400' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {step.completed && <CheckCircleIcon className="w-3 h-3 text-green-600 dark:text-green-400" />}
                  </div>
                  <span className={`text-xs ${
                    step.completed 
                      ? 'text-green-700 dark:text-green-400 line-through' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default ContextualLearningAssistant