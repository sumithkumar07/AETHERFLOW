import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Architecture, 
  Lightbulb, 
  FileText, 
  TrendingUp, 
  Shield, 
  Code,
  CheckCircle,
  AlertTriangle,
  Info,
  X
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'

const ArchitecturalIntelligence = ({ isVisible, onClose, projectId, codebase = {} }) => {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('analysis')
  const [selectedSuggestion, setSelectedSuggestion] = useState(null)
  const { token } = useAuthStore()

  useEffect(() => {
    if (isVisible && projectId && Object.keys(codebase).length > 0) {
      analyzeProjectStructure()
    }
  }, [isVisible, projectId, codebase])

  const analyzeProjectStructure = async () => {
    setLoading(true)
    try {
      const response = await api.post('/api/architectural-intelligence/analyze-structure', {
        project_id: projectId,
        codebase: codebase
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setAnalysis(response.data.data)
      }
    } catch (error) {
      console.error('Error analyzing project structure:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateDocumentation = async () => {
    try {
      const response = await api.post('/api/architectural-intelligence/generate-documentation', {
        project_id: projectId,
        codebase: codebase
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        // Handle documentation generation
        const documentation = response.data.data.documentation
        // You could open this in a new tab or modal
        downloadDocumentation(documentation)
      }
    } catch (error) {
      console.error('Error generating documentation:', error)
    }
  }

  const downloadDocumentation = (content) => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'architecture-documentation.md'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreIcon = (score) => {
    if (score >= 90) return CheckCircle
    if (score >= 70) return AlertTriangle
    return AlertTriangle
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Architecture className="w-8 h-8 text-white" />
                <div>
                  <h2 className="text-2xl font-bold text-white">Architectural Intelligence</h2>
                  <p className="text-blue-100">AI-powered project structure analysis and optimization</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3">
            <div className="flex space-x-6">
              {[
                { id: 'analysis', label: 'Structure Analysis', icon: TrendingUp },
                { id: 'suggestions', label: 'Improvements', icon: Lightbulb },
                { id: 'documentation', label: 'Documentation', icon: FileText },
                { id: 'patterns', label: 'Best Practices', icon: Shield }
              ].map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Analyzing project structure...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Analysis Tab */}
                {activeTab === 'analysis' && analysis && (
                  <div className="space-y-6">
                    {/* Overall Score */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Architecture Score
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            Overall quality of your project structure
                          </p>
                        </div>
                        <div className="text-center">
                          <div className={`text-4xl font-bold ${getScoreColor(analysis.architecture_score)}`}>
                            {analysis.architecture_score}/100
                          </div>
                          {React.createElement(getScoreIcon(analysis.architecture_score), {
                            className: `w-8 h-8 mx-auto mt-2 ${getScoreColor(analysis.architecture_score)}`
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Structure Suggestions */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                          <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
                          Improvement Suggestions
                        </h4>
                        <div className="space-y-3">
                          {analysis.structure_suggestions?.map((suggestion, index) => (
                            <div
                              key={index}
                              className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-400"
                            >
                              <p className="text-sm text-gray-700 dark:text-gray-300">{suggestion}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                          <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
                          Scaling Predictions
                        </h4>
                        <div className="space-y-3">
                          {analysis.scaling_predictions?.map((prediction, index) => (
                            <div
                              key={index}
                              className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-400"
                            >
                              <p className="text-sm text-gray-700 dark:text-gray-300">{prediction}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Best Practices */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        Recommended Best Practices
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {analysis.best_practices?.map((practice, index) => (
                          <div
                            key={index}
                            className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                          >
                            <p className="text-sm text-gray-700 dark:text-gray-300">{practice}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Documentation Gaps */}
                    {analysis.documentation_needs?.length > 0 && (
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                          <FileText className="w-5 h-5 text-blue-500 mr-2" />
                          Documentation Needs
                        </h4>
                        <div className="space-y-2">
                          {analysis.documentation_needs.map((need, index) => (
                            <div
                              key={index}
                              className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400"
                            >
                              <p className="text-sm text-gray-700 dark:text-gray-300">{need}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Documentation Tab */}
                {activeTab === 'documentation' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Auto-Generate Architecture Documentation
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Create comprehensive documentation based on your project structure and patterns
                      </p>
                      <button
                        onClick={generateDocumentation}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center mx-auto"
                      >
                        <FileText className="w-5 h-5 mr-2" />
                        Generate Documentation
                      </button>
                    </div>

                    {analysis && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Documentation Preview
                        </h4>
                        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border">
                          <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            # Project Architecture Documentation
                            
                            ## Overview
                            Architecture Score: {analysis.architecture_score}/100
                            
                            ## Structure Analysis
                            {analysis.structure_suggestions?.map((suggestion, i) => 
                              `${i + 1}. ${suggestion}`
                            ).join('\n')}
                            
                            ## Scaling Considerations
                            {analysis.scaling_predictions?.map((prediction, i) => 
                              `- ${prediction}`
                            ).join('\n')}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Loading State */}
                {!analysis && !loading && (
                  <div className="text-center py-12">
                    <Architecture className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Provide project codebase to start architectural analysis
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ArchitecturalIntelligence