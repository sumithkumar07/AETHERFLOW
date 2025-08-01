import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Sparkles, 
  Download, 
  RefreshCw, 
  BookOpen,
  Code,
  MessageSquare,
  Settings,
  X,
  Copy,
  Check
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'

const SmartDocumentationEngine = ({ isVisible, onClose, code = '', fileType = 'javascript' }) => {
  const [documentation, setDocumentation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('realtime')
  const [realtimeDoc, setRealtimeDoc] = useState(null)
  const [copied, setCopied] = useState(false)
  const { token } = useAuthStore()
  const codeRef = useRef('')

  useEffect(() => {
    codeRef.current = code
    if (isVisible && code && code.length > 50) {
      generateRealtimeDocumentation()
    }
  }, [isVisible, code, fileType])

  const generateRealtimeDocumentation = async () => {
    setLoading(true)
    try {
      const response = await api.post('/api/smart-documentation/realtime-documentation', {
        code: code,
        file_type: fileType,
        context: { projectContext: 'web_application' }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setRealtimeDoc(response.data.data)
      }
    } catch (error) {
      console.error('Error generating realtime documentation:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateReadme = async () => {
    setLoading(true)
    try {
      const response = await api.post('/api/smart-documentation/generate-readme', {
        project_data: {
          name: 'AI Tempo Project',
          description: 'AI-powered development platform',
          tech_stack: [fileType, 'react', 'node'],
          repository_url: 'https://github.com/user/project'
        }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setDocumentation(response.data.data.readme)
        setActiveTab('readme')
      }
    } catch (error) {
      console.error('Error generating README:', error)
    } finally {
      setLoading(false)
    }
  }

  const suggestInlineComments = async () => {
    setLoading(true)
    try {
      const response = await api.post('/api/smart-documentation/suggest-comments', {
        code: code,
        file_type: fileType
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setDocumentation(response.data.data.suggestions)
        setActiveTab('comments')
      }
    } catch (error) {
      console.error('Error suggesting comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadDocumentation = (content, filename = 'documentation.md') => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
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
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-8 h-8 text-white" />
                <div>
                  <h2 className="text-2xl font-bold text-white">Smart Documentation Engine</h2>
                  <p className="text-indigo-100">AI-powered documentation generation and enhancement</p>
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
            <div className="flex space-x-4 overflow-x-auto">
              {[
                { id: 'realtime', label: 'Real-time Analysis', icon: RefreshCw },
                { id: 'readme', label: 'README Generator', icon: FileText },
                { id: 'comments', label: 'Smart Comments', icon: MessageSquare },
                { id: 'api', label: 'API Docs', icon: Code }
              ].map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-indigo-600 text-white'
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
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Generating smart documentation...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Real-time Analysis Tab */}
                {activeTab === 'realtime' && (
                  <div className="space-y-6">
                    {realtimeDoc ? (
                      <>
                        {/* Documentation Coverage */}
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Documentation Coverage
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400">
                                Current documentation quality score
                              </p>
                            </div>
                            <div className="text-center">
                              <div className="text-4xl font-bold text-green-600">
                                {Math.round(realtimeDoc.documentation_coverage || 75)}%
                              </div>
                              <div className="text-sm text-gray-500 mt-1">Coverage</div>
                            </div>
                          </div>
                        </div>

                        {/* Function Documentation */}
                        {realtimeDoc.function_docs?.length > 0 && (
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                              <Code className="w-5 h-5 text-blue-500 mr-2" />
                              Function Documentation
                            </h4>
                            <div className="space-y-4">
                              {realtimeDoc.function_docs.map((func, index) => (
                                <div
                                  key={index}
                                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-medium text-gray-900 dark:text-white">
                                      {func.name}()
                                    </h5>
                                    <button
                                      onClick={() => copyToClipboard(func.description)}
                                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    >
                                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                  </div>
                                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                                    {func.description}
                                  </p>
                                  {func.parameters?.length > 0 && (
                                    <div className="mb-2">
                                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Parameters:
                                      </span>
                                      <div className="mt-1 space-y-1">
                                        {func.parameters.map((param, i) => (
                                          <div key={i} className="text-sm text-gray-600 dark:text-gray-400">
                                            <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">
                                              {param.name}
                                            </code>
                                            <span className="text-gray-500"> - {param.description}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Auto-generated Comments */}
                        {realtimeDoc.auto_comments?.length > 0 && (
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                              <MessageSquare className="w-5 h-5 text-green-500 mr-2" />
                              Suggested Comments
                            </h4>
                            <div className="space-y-3">
                              {realtimeDoc.auto_comments.map((comment, index) => (
                                <div
                                  key={index}
                                  className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-400"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                      Line {comment.line}
                                    </span>
                                    <button
                                      onClick={() => copyToClipboard(comment.comment)}
                                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    >
                                      <Copy className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">
                                    {comment.comment}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                          Provide code to generate real-time documentation analysis
                        </p>
                        <button
                          onClick={generateRealtimeDocumentation}
                          className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          Analyze Code
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* README Generator Tab */}
                {activeTab === 'readme' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Auto-Generate README
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Create comprehensive README files from your code structure
                      </p>
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={generateReadme}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                        >
                          <Sparkles className="w-5 h-5 mr-2" />
                          Generate README
                        </button>
                        {documentation && (
                          <button
                            onClick={() => downloadDocumentation(documentation, 'README.md')}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                          >
                            <Download className="w-5 h-5 mr-2" />
                            Download
                          </button>
                        )}
                      </div>
                    </div>

                    {documentation && activeTab === 'readme' && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Generated README.md
                          </h4>
                          <button
                            onClick={() => copyToClipboard(documentation)}
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                          </button>
                        </div>
                        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border max-h-96 overflow-y-auto">
                          <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {documentation}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Comments Tab */}
                {activeTab === 'comments' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <MessageSquare className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Smart Comment Suggestions
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Get AI-powered suggestions for inline code comments
                      </p>
                      <button
                        onClick={suggestInlineComments}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center mx-auto"
                      >
                        <MessageSquare className="w-5 h-5 mr-2" />
                        Suggest Comments
                      </button>
                    </div>

                    {documentation && activeTab === 'comments' && Array.isArray(documentation) && (
                      <div className="space-y-4">
                        {documentation.map((suggestion, index) => (
                          <div
                            key={index}
                            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Line {suggestion.line_number}
                              </span>
                              <button
                                onClick={() => copyToClipboard(suggestion.suggested_comment)}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="mb-3">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Original Line:
                              </span>
                              <div className="bg-gray-100 dark:bg-gray-700 rounded p-2 mt-1">
                                <code className="text-sm text-gray-800 dark:text-gray-200">
                                  {suggestion.original_line}
                                </code>
                              </div>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Suggested Comment:
                              </span>
                              <div className="bg-green-50 dark:bg-green-900/20 rounded p-2 mt-1">
                                <code className="text-sm text-green-800 dark:text-green-200">
                                  {suggestion.suggested_comment}
                                </code>
                              </div>
                            </div>
                            {suggestion.complexity_reason && (
                              <div className="mt-3">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  Reason:
                                </span>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {suggestion.complexity_reason}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* No content state */}
                {!realtimeDoc && !documentation && !loading && (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Start by providing code or selecting a documentation type
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

export default SmartDocumentationEngine