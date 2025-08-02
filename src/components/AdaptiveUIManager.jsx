import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useChatStore } from '../store/chatStore'
import { useEnhancedProjectStore } from '../store/enhancedProjectStore'

const AdaptiveUIManager = ({ children, projectId, isAdaptiveMode }) => {
  const [uiLayout, setUILayout] = useState('default')
  const [contextualElements, setContextualElements] = useState([])
  const [priorityActions, setPriorityActions] = useState([])
  
  const { messages, selectedAgent, selectedModel } = useChatStore()
  const { getEnhancedProjectData } = useEnhancedProjectStore()

  useEffect(() => {
    if (isAdaptiveMode && projectId) {
      analyzeContextAndAdaptUI()
    }
  }, [isAdaptiveMode, projectId, messages, selectedAgent])

  const analyzeContextAndAdaptUI = () => {
    const projectData = getEnhancedProjectData(projectId)
    const recentMessages = messages.slice(-5)
    
    // Analyze conversation context
    const hasCodeDiscussion = recentMessages.some(msg => 
      msg.content.includes('```') || 
      msg.content.includes('component') || 
      msg.content.includes('function')
    )
    
    const hasDeploymentTalk = recentMessages.some(msg =>
      msg.content.toLowerCase().includes('deploy') ||
      msg.content.toLowerCase().includes('production') ||
      msg.content.toLowerCase().includes('build')
    )
    
    const hasErrorDiscussion = recentMessages.some(msg =>
      msg.content.toLowerCase().includes('error') ||
      msg.content.toLowerCase().includes('bug') ||
      msg.content.toLowerCase().includes('fix')
    )

    // Adapt UI based on context
    let newLayout = 'default'
    let newContextualElements = []
    let newPriorityActions = []

    if (hasCodeDiscussion) {
      newLayout = 'code-focused'
      newContextualElements.push('code-preview', 'file-tree')
      newPriorityActions.push('open-editor', 'run-code')
    }
    
    if (hasDeploymentTalk) {
      newLayout = 'deployment'
      newContextualElements.push('deployment-status', 'environment-health')
      newPriorityActions.push('deploy-staging', 'check-logs')
    }
    
    if (hasErrorDiscussion) {
      newLayout = 'debugging'
      newContextualElements.push('error-console', 'debug-tools')
      newPriorityActions.push('run-tests', 'check-logs', 'analyze-error')
    }

    // Project completion state
    if (projectData?.project?.progress > 80) {
      newContextualElements.push('deployment-ready')
      newPriorityActions.push('prepare-deployment')
    }

    setUILayout(newLayout)
    setContextualElements(newContextualElements)
    setPriorityActions(newPriorityActions)
  }

  const getLayoutStyles = () => {
    if (!isAdaptiveMode) return {}

    switch (uiLayout) {
      case 'code-focused':
        return {
          leftPanelWidth: '320px', // Wider for file tree
          rightPanelWidth: '300px',
          chatPadding: '1rem',
          highlightCodeBlocks: true
        }
      
      case 'deployment':
        return {
          leftPanelWidth: '280px',
          rightPanelWidth: '320px', // Wider for deployment info
          chatPadding: '1rem',
          showDeploymentBar: true
        }
      
      case 'debugging':
        return {
          leftPanelWidth: '300px',
          rightPanelWidth: '350px', // Widest for debug info
          chatPadding: '0.75rem',
          showErrorHighlights: true
        }
      
      default:
        return {
          leftPanelWidth: '280px',
          rightPanelWidth: '280px',
          chatPadding: '1rem'
        }
    }
  }

  const renderContextualFloatingActions = () => {
    if (!isAdaptiveMode || priorityActions.length === 0) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 right-6 z-40 flex flex-col space-y-2"
      >
        {priorityActions.map((action, index) => (
          <motion.button
            key={action}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handlePriorityAction(action)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all"
          >
            {getActionIcon(action)}
            <span className="text-sm font-medium">{getActionLabel(action)}</span>
          </motion.button>
        ))}
      </motion.div>
    )
  }

  const handlePriorityAction = (action) => {
    switch (action) {
      case 'open-editor':
        // Trigger file editor
        break
      case 'run-code':
        // Execute code
        break
      case 'deploy-staging':
        // Deploy to staging
        break
      case 'run-tests':
        // Run test suite
        break
      case 'check-logs':
        // Open logs
        break
      default:
        console.log('Unhandled priority action:', action)
    }
  }

  const getActionIcon = (action) => {
    // Return appropriate icon for each action
    return '⚡'
  }

  const getActionLabel = (action) => {
    const labels = {
      'open-editor': 'Open Editor',
      'run-code': 'Run Code',
      'deploy-staging': 'Deploy',
      'run-tests': 'Run Tests',
      'check-logs': 'Check Logs',
      'analyze-error': 'Debug',
      'prepare-deployment': 'Deploy Ready'
    }
    return labels[action] || action
  }

  const renderContextualHeaders = () => {
    if (!isAdaptiveMode) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 p-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Adaptive Mode: {uiLayout.replace('-', ' ').toUpperCase()}
            </span>
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400">
            Context-aware interface active
          </div>
        </div>
      </motion.div>
    )
  }

  if (!isAdaptiveMode) {
    return children
  }

  const layoutStyles = getLayoutStyles()

  return (
    <div className="adaptive-ui-container" style={{ '--adaptive-layout': uiLayout }}>
      {renderContextualHeaders()}
      
      <div 
        className="flex h-full"
        style={{
          '--left-panel-width': layoutStyles.leftPanelWidth,
          '--right-panel-width': layoutStyles.rightPanelWidth,
          '--chat-padding': layoutStyles.chatPadding
        }}
      >
        {React.cloneElement(children, {
          adaptiveLayout: uiLayout,
          contextualElements,
          layoutStyles
        })}
      </div>

      {renderContextualFloatingActions()}
    </div>
  )
}

export default AdaptiveUIManager