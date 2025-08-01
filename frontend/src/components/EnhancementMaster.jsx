import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

// Import all enhancement components
import { ThemeAdaptationProvider } from './SmartThemeAdapter'
import SmartThemeAdapter from './SmartThemeAdapter'
import VoiceCodeReview from './VoiceCodeReview'
import SmartErrorPrevention from './SmartErrorPrevention'
import ContextualLearningAssistant from './ContextualLearningAssistant'
import SmartIntegrationRecommendations from './SmartIntegrationRecommendations'
import PerformanceOptimizer from './PerformanceOptimizer'
import GamificationLayer from './GamificationLayer'
import SmartOnboarding from './SmartOnboarding'
import SmartTemplateGenerator from './SmartTemplateGenerator'

const EnhancementMaster = ({ children, projectId = null, projectData = null }) => {
  const [activeEnhancements, setActiveEnhancements] = useState(new Set())
  const [contextualData, setContextualData] = useState({})
  const [performanceVisible, setPerformanceVisible] = useState(false)
  const location = useLocation()
  const { isAuthenticated, user } = useAuthStore()

  // Initialize enhancements based on context
  useEffect(() => {
    if (!isAuthenticated) return

    const initializeEnhancements = () => {
      const currentPath = location.pathname
      const enhancements = new Set()

      // Always active enhancements
      enhancements.add('theme-adaptation')
      enhancements.add('gamification')
      enhancements.add('onboarding')

      // Context-specific enhancements
      if (currentPath.includes('/chat') || projectId) {
        enhancements.add('voice-code-review')
        enhancements.add('error-prevention')
        enhancements.add('learning-assistant')
        enhancements.add('template-generator')
        
        // Project workspace specific
        if (projectId) {
          enhancements.add('integration-recommendations')
        }
      }

      // Performance optimizer - show periodically
      if (Math.random() > 0.7 && currentPath.includes('/chat')) {
        setTimeout(() => setPerformanceVisible(true), 10000) // Show after 10 seconds
      }

      setActiveEnhancements(enhancements)
    }

    initializeEnhancements()
  }, [location.pathname, projectId, isAuthenticated])

  // Update contextual data based on current context
  useEffect(() => {
    const updateContextualData = () => {
      // Simulate gathering contextual information
      const context = {
        currentPage: location.pathname,
        userActivity: 'coding', // This would come from activity tracking
        projectContext: projectData ? {
          name: projectData.name || 'Current Project',
          language: projectData.language || 'JavaScript',
          framework: projectData.framework || 'React',
          complexity: projectData.complexity || 'medium'
        } : null,
        codeContext: projectData?.currentCode || '',
        timestamp: new Date()
      }

      setContextualData(context)
    }

    updateContextualData()

    // Update context periodically
    const interval = setInterval(updateContextualData, 30000) // Every 30 seconds
    return () => clearInterval(interval)
  }, [location.pathname, projectData])

  // Enhancement configuration
  const enhancementConfig = {
    'theme-adaptation': {
      component: SmartThemeAdapter,
      props: {},
      wrapper: ThemeAdaptationProvider
    },
    'voice-code-review': {
      component: VoiceCodeReview,
      props: {
        projectId: projectId || 'demo-project',
        projectName: contextualData.projectContext?.name || 'Demo Project'
      }
    },
    'error-prevention': {
      component: SmartErrorPrevention,
      props: {
        projectId: projectId || 'demo-project',
        currentCode: contextualData.codeContext
      }
    },
    'learning-assistant': {
      component: ContextualLearningAssistant,
      props: {
        projectId: projectId || 'demo-project',
        currentContext: contextualData.codeContext
      }
    },
    'integration-recommendations': {
      component: SmartIntegrationRecommendations,
      props: {
        projectId: projectId || 'demo-project',
        projectContext: contextualData.codeContext
      }
    },
    'gamification': {
      component: GamificationLayer,
      props: {}
    },
    'onboarding': {
      component: SmartOnboarding,
      props: {}
    },
    'template-generator': {
      component: SmartTemplateGenerator,
      props: {
        projectId: projectId || 'demo-project',
        projectData: contextualData.projectContext
      }
    }
  }

  // Render enhancement components
  const renderEnhancement = (enhancementKey) => {
    if (!activeEnhancements.has(enhancementKey)) return null

    const config = enhancementConfig[enhancementKey]
    if (!config) return null

    const Component = config.component
    const props = config.props || {}

    return (
      <Component
        key={enhancementKey}
        {...props}
      />
    )
  }

  // Wrapper for theme adaptation
  const ThemeWrapper = ({ children }) => {
    if (activeEnhancements.has('theme-adaptation')) {
      const config = enhancementConfig['theme-adaptation']
      const Wrapper = config.wrapper
      return (
        <Wrapper>
          {children}
          <SmartThemeAdapter />
        </Wrapper>
      )
    }
    return children
  }

  return (
    <ThemeWrapper>
      {/* Main App Content */}
      {children}

      {/* Enhancement Components */}
      {renderEnhancement('voice-code-review')}
      {renderEnhancement('error-prevention')}
      {renderEnhancement('learning-assistant')}
      {renderEnhancement('integration-recommendations')}
      {renderEnhancement('gamification')}
      {renderEnhancement('onboarding')}
      {renderEnhancement('template-generator')}

      {/* Performance Optimizer Modal */}
      <PerformanceOptimizer
        projectId={projectId || 'demo-project'}
        isVisible={performanceVisible}
        onClose={() => setPerformanceVisible(false)}
      />

      {/* Enhancement Coordination Logic */}
      <EnhancementCoordinator
        activeEnhancements={activeEnhancements}
        contextualData={contextualData}
        onEnhancementToggle={(enhancement, enabled) => {
          setActiveEnhancements(prev => {
            const newSet = new Set(prev)
            if (enabled) {
              newSet.add(enhancement)
            } else {
              newSet.delete(enhancement)
            }
            return newSet
          })
        }}
      />
    </ThemeWrapper>
  )
}

// Coordination component to manage enhancement interactions
const EnhancementCoordinator = ({ activeEnhancements, contextualData, onEnhancementToggle }) => {
  useEffect(() => {
    // Smart enhancement coordination logic
    const coordinateEnhancements = () => {
      // Example: If error prevention is active and finds many errors, 
      // boost learning assistant priority
      if (activeEnhancements.has('error-prevention') && 
          activeEnhancements.has('learning-assistant')) {
        
        // Enhanced coordination logic would go here
        console.log('Coordinating error prevention with learning assistant')
      }

      // Example: If user is inactive, reduce enhancement visibility
      const lastActivity = contextualData.timestamp
      const now = new Date()
      const inactiveTime = now - lastActivity

      if (inactiveTime > 300000) { // 5 minutes
        // Gradually reduce enhancement visibility
        console.log('User inactive, reducing enhancement visibility')
      }

      // Example: Performance optimization timing
      if (contextualData.userActivity === 'debugging' &&
          !activeEnhancements.has('error-prevention')) {
        onEnhancementToggle('error-prevention', true)
      }
    }

    const interval = setInterval(coordinateEnhancements, 10000) // Every 10 seconds
    return () => clearInterval(interval)
  }, [activeEnhancements, contextualData, onEnhancementToggle])

  return null // This is a logic-only component
}

export default EnhancementMaster