import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AcademicCapIcon,
  LightBulbIcon,
  PlayIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  XMarkIcon,
  EyeIcon,
  HandRaisedIcon,
  CursorArrowRaysIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const SmartOnboarding = () => {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [interactionTour, setInteractionTour] = useState(null)
  const [helpOverlay, setHelpOverlay] = useState(null)
  const { user } = useAuthStore()

  // Onboarding steps
  const onboardingSteps = [
    {
      id: 'welcome',
      title: 'Welcome to AI Tempo!',
      description: 'Let\'s take a quick tour of your new development workspace.',
      action: 'Get Started',
      highlight: null,
      tips: ['Navigate with ease', 'AI-powered assistance', 'Real-time collaboration']
    },
    {
      id: 'global-search',
      title: 'Global Smart Search',
      description: 'Press Cmd/Ctrl + K anywhere to search projects, templates, and integrations.',
      action: 'Try Search',
      highlight: 'header nav',
      tips: ['Instant results', 'AI-powered context', 'Cross-platform search']
    },
    {
      id: 'ai-assistant',
      title: 'AI Code Assistant',
      description: 'Your personal AI helper appears in project workspaces for code optimization and debugging.',
      action: 'See Assistant',
      highlight: '.ai-assistant-trigger',
      tips: ['Real-time suggestions', 'Code optimization', 'Bug prevention']
    },
    {
      id: 'collaboration',
      title: 'Real-time Collaboration',
      description: 'See teammates\' cursors and activity in real-time when working on projects.',
      action: 'View Collaboration',
      highlight: '.collaboration-panel',
      tips: ['Live cursors', 'Activity feed', 'Team awareness']
    },
    {
      id: 'voice-commands',
      title: 'Voice Code Review',
      description: 'Use voice commands like "explain this code" or "find bugs" for hands-free development.',
      action: 'Try Voice',
      highlight: '.voice-control',
      tips: ['Hands-free coding', 'Voice explanations', 'Accessibility features']
    },
    {
      id: 'smart-features',
      title: 'Smart Enhancement Layer',
      description: 'Discover performance optimization, error prevention, and learning suggestions.',
      action: 'Explore Features',
      highlight: '.smart-features',
      tips: ['Performance insights', 'Error prevention', 'Contextual learning']
    }
  ]

  // Interactive feature discovery
  const featureDiscovery = [
    {
      selector: 'button[data-search]',
      title: 'Global Search',
      description: 'Search across all your projects and resources',
      position: 'bottom'
    },
    {
      selector: '.project-workspace',
      title: 'AI Assistant',
      description: 'Get intelligent code suggestions and optimizations',
      position: 'left'
    },
    {
      selector: '.collaboration-indicators',
      title: 'Live Collaboration',
      description: 'See team activity and collaborate in real-time',
      position: 'bottom-left'
    },
    {
      selector: '.performance-optimizer',
      title: 'Performance Insights',
      description: 'Optimize your application performance automatically',
      position: 'top'
    }
  ]

  // Initialize onboarding
  useEffect(() => {
    const shouldShowOnboarding = () => {
      // Check if user is new or hasn't completed onboarding
      const hasSeenOnboarding = localStorage.getItem('ai-tempo-onboarding-completed')
      const isNewUser = !user?.lastLogin || 
        (new Date() - new Date(user.lastLogin)) < 24 * 60 * 60 * 1000

      return !hasSeenOnboarding && isNewUser
    }

    if (shouldShowOnboarding()) {
      setTimeout(() => setIsActive(true), 2000) // Show after 2 seconds
    }

    // Context-aware help system
    const showContextualHelp = () => {
      const currentPage = window.location.pathname
      const timeOnPage = Date.now()

      setTimeout(() => {
        if (window.location.pathname === currentPage && 
            !localStorage.getItem(`help-shown-${currentPage}`)) {
          
          const pageHelp = {
            '/chat': {
              title: 'Project Workspace',
              tips: ['Create new projects', 'Use AI assistance', 'Collaborate with team'],
              trigger: 'idle-5s'
            },
            '/templates': {
              title: 'Template Gallery',
              tips: ['Browse templates', 'Filter by technology', 'Quick project start'],
              trigger: 'idle-10s'
            },
            '/integrations': {
              title: 'Integration Marketplace',
              tips: ['Discover integrations', 'One-click setup', 'AI recommendations'],
              trigger: 'idle-8s'
            }
          }

          const help = pageHelp[currentPage]
          if (help && Math.random() > 0.6) { // 40% chance
            setHelpOverlay(help)
            localStorage.setItem(`help-shown-${currentPage}`, 'true')
          }
        }
      }, 8000) // Show after 8 seconds of being on page
    }

    showContextualHelp()
  }, [user])

  const nextStep = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]))
    
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeOnboarding()
    }
  }

  const skipOnboarding = () => {
    localStorage.setItem('ai-tempo-onboarding-skipped', 'true')
    setIsActive(false)
  }

  const completeOnboarding = () => {
    localStorage.setItem('ai-tempo-onboarding-completed', 'true')
    setIsActive(false)
    toast.success('Welcome to AI Tempo! You\'re all set to start building amazing projects.')
  }

  const triggerInteractiveTour = () => {
    // Start interactive feature discovery
    setInteractionTour({
      currentFeature: 0,
      features: featureDiscovery
    })
  }

  const highlightElement = (selector) => {
    if (!selector) return

    try {
      const element = document.querySelector(selector)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.classList.add('onboarding-highlight')
        
        setTimeout(() => {
          element.classList.remove('onboarding-highlight')
        }, 3000)
      }
    } catch (error) {
      console.error('Element highlight error:', error)
    }
  }

  const executeStepAction = () => {
    const step = onboardingSteps[currentStep]
    
    switch (step.id) {
      case 'global-search':
        // Simulate Cmd+K press
        const event = new KeyboardEvent('keydown', {
          key: 'k',
          metaKey: true,
          ctrlKey: true
        })
        window.dispatchEvent(event)
        break
      
      case 'ai-assistant':
        triggerInteractiveTour()
        break
      
      case 'collaboration':
        highlightElement('.collaboration-panel, .collaboration-indicators')
        break
      
      case 'voice-commands':
        highlightElement('.voice-control, [data-voice-control]')
        break
      
      case 'smart-features':
        // Show all smart feature highlights
        const features = ['.performance-optimizer', '.error-prevention', '.learning-assistant']
        features.forEach((feature, index) => {
          setTimeout(() => highlightElement(feature), index * 500)
        })
        break
    }
    
    nextStep()
  }

  const currentStepData = onboardingSteps[currentStep]

  return (
    <>
      {/* Main Onboarding Modal */}
      <AnimatePresence>
        {isActive && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            
            {/* Onboarding Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl z-50 p-6 w-full max-w-md mx-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                    <AcademicCapIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Smart Onboarding
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Step {currentStep + 1} of {onboardingSteps.length}
                    </p>
                  </div>
                </div>
                <button
                  onClick={skipOnboarding}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  <XMarkIcon className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {currentStepData.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {currentStepData.description}
                </p>

                {/* Tips */}
                {currentStepData.tips && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center space-x-1">
                      <LightBulbIcon className="w-4 h-4" />
                      <span>Key Features:</span>
                    </h4>
                    <ul className="space-y-1">
                      {currentStepData.tips.map((tip, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm text-blue-700 dark:text-blue-300">
                          <CheckCircleIcon className="w-3 h-3" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <button
                  onClick={skipOnboarding}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Skip Tour
                </button>
                <div className="flex items-center space-x-3">
                  {currentStep > 0 && (
                    <button
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      Previous
                    </button>
                  )}
                  <button
                    onClick={executeStepAction}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2 text-sm"
                  >
                    <span>{currentStepData.action}</span>
                    {currentStep === onboardingSteps.length - 1 ? (
                      <CheckCircleIcon className="w-4 h-4" />
                    ) : (
                      <ArrowRightIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Interactive Feature Tour */}
      <AnimatePresence>
        {interactionTour && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 pointer-events-none"
          >
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
            
            {/* Feature Highlight */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute top-20 right-4 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4 max-w-sm pointer-events-auto"
            >
              <div className="flex items-center space-x-2 mb-2">
                <CursorArrowRaysIcon className="w-5 h-5 text-blue-500" />
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Interactive Discovery
                </h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Click on highlighted elements to discover features as you explore!
              </p>
              <button
                onClick={() => setInteractionTour(null)}
                className="w-full px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-800/30 transition-colors"
              >
                Start Exploring
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contextual Help Overlay */}
      <AnimatePresence>
        {helpOverlay && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-4 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4 max-w-xs z-40"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <SparklesIcon className="w-4 h-4 text-purple-500" />
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  {helpOverlay.title}
                </h4>
              </div>
              <button
                onClick={() => setHelpOverlay(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              >
                <XMarkIcon className="w-3 h-3 text-gray-400" />
              </button>
            </div>
            <ul className="space-y-1 mb-3">
              {helpOverlay.tips.map((tip, index) => (
                <li key={index} className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                  <EyeIcon className="w-3 h-3" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setHelpOverlay(null)}
              className="w-full px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs hover:bg-purple-200 dark:hover:bg-purple-800/30 transition-colors"
            >
              Got it!
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global CSS for highlighting */}
      <style jsx global>{`
        .onboarding-highlight {
          position: relative;
          z-index: 45;
          animation: highlight-pulse 2s ease-in-out;
          border-radius: 8px;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3);
        }
        
        @keyframes highlight-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>
    </>
  )
}

export default SmartOnboarding