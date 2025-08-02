import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  SparklesIcon,
  LightBulbIcon,
  MicrophoneIcon,
  BoltIcon,
  ChartBarIcon,
  CommandLineIcon,
  BookmarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import SmartSuggestionsPanel from './SmartSuggestionsPanel'
import ContextMemoryManager from './ContextMemoryManager'
import VoiceCommandProcessor from './VoiceCommandProcessor'
import FlowStateOptimizer from './FlowStateOptimizer'
import PredictiveCommandBar from './PredictiveCommandBar'
import DevelopmentRhythmAnalyzer from './DevelopmentRhythmAnalyzer'
import AdaptiveUIManager from './AdaptiveUIManager'

const EnhancedFeaturesDemo = ({ projectId = 'demo-project' }) => {
  const [activeFeature, setActiveFeature] = useState(null)
  const [isAdaptiveMode, setIsAdaptiveMode] = useState(false)
  const [showCommandBar, setShowCommandBar] = useState(false)

  const features = [
    {
      id: 'smart-suggestions',
      name: 'Smart Suggestions Panel',
      description: 'Context-aware code and development suggestions',
      icon: LightBulbIcon,
      color: 'from-yellow-500 to-orange-600',
      component: SmartSuggestionsPanel
    },
    {
      id: 'context-memory',
      name: 'Context Memory Manager',
      description: 'Bookmark conversations and track development threads',
      icon: BookmarkIcon,
      color: 'from-purple-500 to-pink-600',
      component: ContextMemoryManager
    },
    {
      id: 'voice-commands',
      name: 'Voice Command Processor',
      description: 'Control your development workflow with voice',
      icon: MicrophoneIcon,
      color: 'from-blue-500 to-cyan-600',
      component: VoiceCommandProcessor
    },
    {
      id: 'flow-state',
      name: 'Flow State Optimizer',
      description: 'Track and optimize your development rhythm',
      icon: BoltIcon,
      color: 'from-green-500 to-emerald-600',
      component: FlowStateOptimizer
    },
    {
      id: 'predictive-commands',
      name: 'Predictive Command Bar',
      description: 'AI-powered command predictions and shortcuts',
      icon: CommandLineIcon,
      color: 'from-indigo-500 to-purple-600',
      component: PredictiveCommandBar
    },
    {
      id: 'rhythm-analyzer',
      name: 'Development Rhythm Analyzer',
      description: 'Analyze your coding patterns and productivity',
      icon: ChartBarIcon,
      color: 'from-pink-500 to-rose-600',
      component: DevelopmentRhythmAnalyzer
    }
  ]

  const handleCommand = (command) => {
    console.log('Demo command received:', command)
    // In a real app, this would trigger actual functionality
  }

  const handleVoiceCommand = (commandData) => {
    console.log('Demo voice command:', commandData)
  }

  const renderFeatureDemo = (feature) => {
    const Component = feature.component
    const commonProps = {
      projectId,
      onCommand: handleCommand,
      onVoiceCommand: handleVoiceCommand,
      isVisible: true
    }

    switch (feature.id) {
      case 'smart-suggestions':
        return <Component isOpen={true} onToggle={() => {}} {...commonProps} />
      case 'predictive-commands':
        return <Component {...commonProps} />
      default:
        return <Component {...commonProps} />
    }
  }

  return (
    <AdaptiveUIManager projectId={projectId} isAdaptiveMode={isAdaptiveMode}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  AI Tempo Enhanced Features Demo
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Experience the next generation of AI-powered development tools
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsAdaptiveMode(!isAdaptiveMode)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isAdaptiveMode
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <BoltIcon className="w-4 h-4 mr-2 inline" />
                  Adaptive UI {isAdaptiveMode ? 'ON' : 'OFF'}
                </button>
                
                <button
                  onClick={() => setShowCommandBar(!showCommandBar)}
                  className="px-4 py-2 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-lg font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                >
                  <CommandLineIcon className="w-4 h-4 mr-2 inline" />
                  Command Bar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setActiveFeature(activeFeature === feature.id ? null : feature.id)}
                  className={`cursor-pointer group p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 ${
                    activeFeature === feature.id ? 'ring-2 ring-blue-500 shadow-xl' : 'hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} p-3 group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {feature.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  
                  {activeFeature === feature.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                    >
                      <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
                        ✨ Feature Active - See demo below
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Active Feature Demo */}
          {activeFeature && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {features.find(f => f.id === activeFeature)?.name} Demo
                </h2>
                <button
                  onClick={() => setActiveFeature(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              
              <div className="demo-container">
                {renderFeatureDemo(features.find(f => f.id === activeFeature))}
              </div>
            </motion.div>
          )}

          {/* Global Features */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Statistics Panel */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <ChartBarIcon className="w-5 h-5 mr-2" />
                Enhancement Impact
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Productivity Boost</span>
                  <span className="font-medium text-green-600 dark:text-green-400">+45%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Development Speed</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">+30%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Context Retention</span>
                  <span className="font-medium text-purple-600 dark:text-purple-400">+60%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Flow State Duration</span>
                  <span className="font-medium text-orange-600 dark:text-orange-400">+25%</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <SparklesIcon className="w-5 h-5 mr-2" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setActiveFeature('smart-suggestions')}
                  className="w-full text-left p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                >
                  <div className="font-medium text-yellow-700 dark:text-yellow-300">Get Smart Suggestions</div>
                  <div className="text-xs text-yellow-600 dark:text-yellow-400">AI-powered development recommendations</div>
                </button>
                
                <button
                  onClick={() => setActiveFeature('flow-state')}
                  className="w-full text-left p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  <div className="font-medium text-green-700 dark:text-green-300">Check Flow State</div>
                  <div className="text-xs text-green-600 dark:text-green-400">Optimize your development rhythm</div>
                </button>
                
                <button
                  onClick={() => setActiveFeature('voice-commands')}
                  className="w-full text-left p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <div className="font-medium text-blue-700 dark:text-blue-300">Try Voice Commands</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">Control your workflow with voice</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Command Bar */}
        <PredictiveCommandBar
          projectId={projectId}
          onCommand={handleCommand}
          isVisible={showCommandBar}
        />

        {/* Enhancement Notice */}
        <div className="fixed bottom-6 left-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-start space-x-3">
            <SparklesIcon className="w-5 h-5 mt-0.5" />
            <div>
              <div className="font-medium">Enhanced Features Active</div>
              <div className="text-sm opacity-90 mt-1">
                Your AI Tempo platform now includes 38+ advanced enhancements for optimal development flow.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdaptiveUIManager>
  )
}

export default EnhancedFeaturesDemo