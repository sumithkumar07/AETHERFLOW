import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  PlayIcon,
  InformationCircleIcon,
  LightBulbIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { createPortal } from 'react-dom'

const InteractiveTour = ({ isActive, onComplete, onSkip, tourSteps = [] }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [highlightElement, setHighlightElement] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const overlayRef = useRef(null)

  const defaultTourSteps = [
    {
      target: '[data-tour="global-search"]',
      title: 'Global Search',
      description: 'Press Cmd/Ctrl + K to search across all your projects, code, and templates instantly.',
      placement: 'bottom',
      action: 'Try pressing Cmd/Ctrl + K',
      highlight: true
    },
    {
      target: '[data-tour="ai-assistant"]',
      title: 'AI Code Assistant',
      description: 'Your floating AI assistant helps with code optimization, debugging, and suggestions.',
      placement: 'left',
      action: 'Click to open AI assistant',
      highlight: true
    },
    {
      target: '[data-tour="collaboration"]',
      title: 'Live Collaboration',
      description: 'See real-time cursors and collaborate with team members instantly.',
      placement: 'bottom',
      highlight: true
    },
    {
      target: '[data-tour="project-creation"]',
      title: 'Smart Project Creation',
      description: 'Describe your project in natural language and watch AI generate everything.',
      placement: 'top',
      action: 'Try creating a project',
      highlight: true
    },
    {
      target: '[data-tour="version-control"]',
      title: 'Intelligent Backups',
      description: 'Automatic version control with smart commit messages and easy restoration.',
      placement: 'right',
      highlight: true
    }
  ]

  const steps = tourSteps.length > 0 ? tourSteps : defaultTourSteps

  useEffect(() => {
    if (isActive) {
      setIsVisible(true)
      startTour()
    } else {
      setIsVisible(false)
      cleanup()
    }

    return cleanup
  }, [isActive])

  useEffect(() => {
    if (isActive && isVisible) {
      updateHighlight()
    }
  }, [currentStep, isActive, isVisible])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isActive) return

      switch (e.key) {
        case 'Escape':
          handleSkip()
          break
        case 'ArrowRight':
        case ' ':
          e.preventDefault()
          handleNext()
          break
        case 'ArrowLeft':
          e.preventDefault()
          handlePrevious()
          break
        case 'Enter':
          e.preventDefault()
          if (steps[currentStep]?.action) {
            executeStepAction()
          } else {
            handleNext()
          }
          break
      }
    }

    if (isActive) {
      document.addEventListener('keydown', handleKeyPress)
      return () => document.removeEventListener('keydown', handleKeyPress)
    }
  }, [isActive, currentStep])

  const startTour = () => {
    setCurrentStep(0)
    // Add tour overlay styles
    document.body.style.overflow = 'hidden'
    document.body.setAttribute('data-tour-active', 'true')
  }

  const cleanup = () => {
    // Remove tour overlay styles
    document.body.style.overflow = ''
    document.body.removeAttribute('data-tour-active')
    
    // Clear highlights
    setHighlightElement(null)
    
    // Remove tour-specific classes
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight')
    })
  }

  const updateHighlight = () => {
    const step = steps[currentStep]
    if (!step) return

    // Clear previous highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight')
    })

    // Find and highlight target element
    const targetElement = document.querySelector(step.target)
    if (targetElement) {
      targetElement.classList.add('tour-highlight')
      setHighlightElement(targetElement)
      
      // Calculate tooltip position
      const rect = targetElement.getBoundingClientRect()
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
      
      let top, left
      
      switch (step.placement) {
        case 'top':
          top = rect.top + scrollTop - 10
          left = rect.left + scrollLeft + rect.width / 2
          break
        case 'bottom':
          top = rect.bottom + scrollTop + 10
          left = rect.left + scrollLeft + rect.width / 2
          break
        case 'left':
          top = rect.top + scrollTop + rect.height / 2
          left = rect.left + scrollLeft - 10
          break
        case 'right':
          top = rect.top + scrollTop + rect.height / 2
          left = rect.right + scrollLeft + 10
          break
        default:
          top = rect.bottom + scrollTop + 10
          left = rect.left + scrollLeft + rect.width / 2
      }
      
      setTooltipPosition({ top, left })
      
      // Scroll element into view
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      })
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleComplete = () => {
    cleanup()
    onComplete?.()
  }

  const handleSkip = () => {
    cleanup()
    onSkip?.()
  }

  const executeStepAction = () => {
    const step = steps[currentStep]
    const targetElement = document.querySelector(step.target)
    
    if (targetElement) {
      // Simulate click on target element
      targetElement.click()
      
      // Wait a bit then continue tour
      setTimeout(() => {
        handleNext()
      }, 1000)
    }
  }

  const currentStepData = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0

  if (!isActive || !isVisible || !currentStepData) return null

  return createPortal(
    <>
      {/* Overlay */}
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
        style={{ pointerEvents: 'none' }}
      />
      
      {/* Highlight cutout */}
      {highlightElement && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed z-[10000] pointer-events-none"
          style={{
            top: highlightElement.getBoundingClientRect().top - 8,
            left: highlightElement.getBoundingClientRect().left - 8,
            width: highlightElement.getBoundingClientRect().width + 16,
            height: highlightElement.getBoundingClientRect().height + 16,
            border: '3px solid #3B82F6',
            borderRadius: '12px',
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.3), 0 0 0 9999px rgba(0, 0, 0, 0.6)',
            background: 'transparent'
          }}
        />
      )}

      {/* Tour Tooltip */}
      <AnimatePresence>
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed z-[10001] max-w-sm"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            transform: 'translate(-50%, 0)',
            pointerEvents: 'auto'
          }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <LightBulbIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{currentStepData.title}</h3>
                    <p className="text-xs text-blue-100">
                      Step {currentStep + 1} of {steps.length}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSkip}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                {currentStepData.description}
              </p>

              {currentStepData.action && (
                <div className="mb-4">
                  <button
                    onClick={executeStepAction}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors text-sm"
                  >
                    <PlayIcon className="w-4 h-4" />
                    <span>{currentStepData.action}</span>
                  </button>
                </div>
              )}

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={isFirstStep}
                  className="flex items-center space-x-1 px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSkip}
                    className="px-3 py-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-sm"
                  >
                    Skip Tour
                  </button>
                  
                  <button
                    onClick={handleNext}
                    className="flex items-center space-x-1 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
                  >
                    <span>{isLastStep ? 'Complete' : 'Next'}</span>
                    {isLastStep ? (
                      <CheckIcon className="w-4 h-4" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tooltip arrow */}
          <div 
            className="absolute w-0 h-0"
            style={{
              top: currentStepData.placement === 'bottom' ? '-8px' : 
                   currentStepData.placement === 'top' ? '100%' : '50%',
              left: currentStepData.placement === 'right' ? '-8px' : 
                    currentStepData.placement === 'left' ? '100%' : '50%',
              transform: currentStepData.placement === 'top' || currentStepData.placement === 'bottom' ? 'translateX(-50%)' : 'translateY(-50%)',
              borderLeft: currentStepData.placement === 'right' ? '8px solid transparent' : 
                         currentStepData.placement === 'left' ? '8px solid white' : 'none',
              borderRight: currentStepData.placement === 'left' ? '8px solid transparent' : 
                          currentStepData.placement === 'right' ? '8px solid white' : 'none',
              borderTop: currentStepData.placement === 'bottom' ? '8px solid white' : 
                        currentStepData.placement === 'top' ? '8px solid transparent' : 'none',
              borderBottom: currentStepData.placement === 'top' ? '8px solid white' : 
                           currentStepData.placement === 'bottom' ? '8px solid transparent' : 'none',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Keyboard shortcuts hint */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[10001] bg-black/80 text-white px-4 py-2 rounded-lg text-sm"
        style={{ pointerEvents: 'auto' }}
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <kbd className="px-2 py-1 bg-white/20 rounded text-xs">←→</kbd>
            <span className="text-xs">Navigate</span>
          </div>
          <div className="flex items-center space-x-1">
            <kbd className="px-2 py-1 bg-white/20 rounded text-xs">Enter</kbd>
            <span className="text-xs">Action</span>
          </div>
          <div className="flex items-center space-x-1">
            <kbd className="px-2 py-1 bg-white/20 rounded text-xs">Esc</kbd>
            <span className="text-xs">Skip</span>
          </div>
        </div>
      </motion.div>
    </>,
    document.body
  )
}

export default InteractiveTour