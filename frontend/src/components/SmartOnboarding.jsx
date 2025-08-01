import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  SparklesIcon,
  XMarkIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  CheckIcon,
  PlayIcon,
  BookOpenIcon,
  CodeBracketIcon,
  RocketLaunchIcon,
  LightBulbIcon,
  UserIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const SmartOnboarding = ({ isVisible, onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [isInteractive, setIsInteractive] = useState(true)
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const onboardingSteps = [
    {
      id: 'welcome',
      title: 'Welcome to AI Tempo! 👋',
      description: 'Let\'s get you started with the most advanced AI development platform',
      icon: SparklesIcon,
      type: 'intro',
      content: {
        highlights: [
          'Multi-model AI integration with free access',
          'Real-time collaboration features',
          'Advanced project management tools',
          'Professional templates and integrations'
        ]
      },
      action: 'Get Started',
      position: 'center'
    },
    {
      id: 'navigation',
      title: 'Master the Navigation',
      description: 'Learn how to navigate between different sections efficiently',
      icon: UserIcon,
      type: 'tour',
      content: {
        targets: [
          { selector: '[data-tour="nav-home"]', title: 'Homepage', description: 'Your starting point' },
          { selector: '[data-tour="nav-chat"]', title: 'Chat Hub', description: 'Manage all your projects' },
          { selector: '[data-tour="nav-templates"]', title: 'Templates', description: 'Start with proven templates' },
          { selector: '[data-tour="nav-integrations"]', title: 'Integrations', description: 'Connect third-party services' }
        ]
      },
      action: 'Explore Navigation',
      position: 'overlay'
    },
    {
      id: 'project-creation',
      title: 'Create Your First Project',
      description: 'Experience the power of AI-driven project creation',
      icon: CodeBracketIcon,
      type: 'interactive',
      content: {
        demo: true,
        steps: [
          'Navigate to Chat Hub',
          'Describe your project idea',
          'Select AI models and agents',
          'Watch AI generate your project'
        ]
      },
      action: 'Create Project',
      position: 'sidebar'
    },
    {
      id: 'ai-features',
      title: 'AI-Powered Development',
      description: 'Discover advanced AI features that accelerate your workflow',
      icon: SparklesIcon,
      type: 'showcase',
      content: {
        features: [
          {
            name: 'Multi-Model Selection',
            description: 'Choose from GPT-4, Claude, Gemini, and more',
            demo: 'model-selector'
          },
          {
            name: 'Multi-Agent System',
            description: 'Developer, Designer, Tester, and Integrator agents',
            demo: 'agent-selector'
          },
          {
            name: 'Real-time Collaboration',
            description: 'See live cursors and collaborate in real-time',
            demo: 'collaboration'
          },
          {
            name: 'Smart Code Assistant',
            description: 'Get contextual code suggestions and optimizations',
            demo: 'code-assistant'
          }
        ]
      },
      action: 'Try AI Features',
      position: 'center'
    },
    {
      id: 'productivity-tips',
      title: 'Productivity Supercharge',
      description: 'Learn pro tips to maximize your development speed',
      icon: LightBulbIcon,
      type: 'tips',
      content: {
        tips: [
          {
            title: 'Global Search',
            description: 'Press Cmd/Ctrl + K to search across all projects, code, and templates',
            shortcut: '⌘K',
            icon: '🔍'
          },
          {
            title: 'Quick Project Creation',
            description: 'Use natural language to describe complex projects',
            shortcut: 'Natural Language',
            icon: '💬'
          },
          {
            title: 'Template Power',
            description: 'Start with production-ready templates to save hours',
            shortcut: 'Browse Templates',
            icon: '📋'
          },
          {
            title: 'Voice Commands',
            description: 'Use voice input for hands-free coding and reviews',
            shortcut: 'Voice Interface',
            icon: '🎤'
          }
        ]
      },
      action: 'Got It!',
      position: 'center'
    },
    {
      id: 'personalization',
      title: 'Personalize Your Experience',
      description: 'Customize AI Tempo to match your preferences',
      icon: Cog6ToothIcon,
      type: 'settings',
      content: {
        settings: [
          { name: 'Theme', options: ['Light', 'Dark', 'Auto'], current: 'Dark' },
          { name: 'Default AI Model', options: ['GPT-4.1 Nano', 'Claude Sonnet', 'Gemini Flash'], current: 'GPT-4.1 Nano' },
          { name: 'Collaboration', options: ['On', 'Off'], current: 'On' },
          { name: 'Notifications', options: ['All', 'Important', 'Off'], current: 'Important' }
        ]
      },
      action: 'Customize',
      position: 'center'
    },
    {
      id: 'completion',
      title: 'You\'re All Set! 🎉',
      description: 'Welcome to the future of AI-powered development',
      icon: RocketLaunchIcon,
      type: 'completion',
      content: {
        achievements: [
          'Mastered navigation and core features',
          'Created your development workspace',
          'Learned advanced AI capabilities',
          'Discovered productivity shortcuts',
          'Personalized your experience'
        ],
        nextSteps: [
          { action: 'Create Your First Project', path: '/chat' },
          { action: 'Browse Templates', path: '/templates' },
          { action: 'Explore Integrations', path: '/integrations' },
          { action: 'Join Community', path: '/community' }
        ]
      },
      action: 'Start Building',
      position: 'center'
    }
  ]

  const currentStepData = onboardingSteps[currentStep]
  const isLastStep = currentStep === onboardingSteps.length - 1
  const isFirstStep = currentStep === 0

  // Auto-advance for showcase steps
  useEffect(() => {
    if (currentStepData?.type === 'showcase' && isInteractive) {
      const timer = setTimeout(() => {
        if (!isLastStep) {
          handleNext()
        }
      }, 8000) // Auto-advance after 8 seconds
      
      return () => clearTimeout(timer)
    }
  }, [currentStep, currentStepData, isLastStep, isInteractive])

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]))
    
    if (isLastStep) {
      onComplete()
      toast.success('Welcome to AI Tempo! 🚀')
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSkip = () => {
    onSkip()
    toast('Onboarding skipped - you can restart it anytime in settings')
  }

  const handleStepClick = (stepIndex) => {
    setCurrentStep(stepIndex)
  }

  const renderStepContent = () => {
    switch (currentStepData.type) {
      case 'intro':
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <SparklesIcon className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-4">
              {currentStepData.content.highlights.map((highlight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl"
                >
                  <CheckIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{highlight}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )

      case 'showcase':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentStepData.content.features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.3 }}
                  className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                >
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {feature.description}
                  </p>
                  <button className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/30 transition-colors">
                    Try Demo
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )

      case 'tips':
        return (
          <div className="space-y-4">
            {currentStepData.content.tips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
              >
                <div className="text-2xl">{tip.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {tip.title}
                    </h4>
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs font-mono">
                      {tip.shortcut}
                    </kbd>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {tip.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )

      case 'completion':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <CheckIcon className="w-10 h-10 text-white" />
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                🏆 What You've Mastered:
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {currentStepData.content.achievements.map((achievement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg"
                  >
                    <CheckIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{achievement}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                🚀 Quick Start Options:
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {currentStepData.content.nextSteps.map((step, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      navigate(step.path)
                      onComplete()
                    }}
                    className="p-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-800/30 rounded-xl transition-colors text-center"
                  >
                    <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      {step.action}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center py-8">
            <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Step content will be displayed here
            </p>
          </div>
        )
    }
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-4xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <currentStepData.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {currentStepData.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Step {currentStep + 1} of {onboardingSteps.length}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSkip}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Skip Tour
              </button>
              <button
                onClick={handleSkip}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex items-center space-x-2">
              {onboardingSteps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'bg-blue-500 shadow-lg shadow-blue-500/30'
                      : index < currentStep
                      ? 'bg-green-500'
                      : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Welcome</span>
              <span>Setup Complete</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
                {currentStepData.description}
              </p>
              {renderStepContent()}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
            <button
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {currentStep + 1} / {onboardingSteps.length}
              </div>
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span>{isLastStep ? 'Complete Setup' : currentStepData.action}</span>
                {isLastStep ? (
                  <CheckIcon className="w-4 h-4" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default SmartOnboarding