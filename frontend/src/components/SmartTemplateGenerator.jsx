import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  DocumentDuplicateIcon,
  SparklesIcon,
  CodeBracketIcon,
  RocketLaunchIcon,
  CheckCircleIcon,
  ClockIcon,
  TagIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  PlayIcon
} from '@heroicons/react/24/outline'
import { useProjectStore } from '../store/projectStore'
import toast from 'react-hot-toast'

const SmartTemplateGenerator = ({ projectId, projectData = null }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [generatedTemplates, setGeneratedTemplates] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [templatePatterns, setTemplatePatterns] = useState([])
  const { projects } = useProjectStore()

  // Auto-detect template generation opportunities
  useEffect(() => {
    if (!projectData || !projects) return

    const analyzeProjectForTemplates = () => {
      // Analyze project structure and patterns
      const patterns = []
      
      // Check if project has reusable patterns
      if (projectData.components && projectData.components.length > 5) {
        patterns.push({
          type: 'component-library',
          description: 'Reusable component library detected',
          confidence: 0.85,
          benefits: ['Consistent UI', 'Faster development', 'Maintainable code']
        })
      }

      if (projectData.routes && projectData.routes.length > 3) {
        patterns.push({
          type: 'routing-pattern',
          description: 'Standard routing structure found',
          confidence: 0.78,
          benefits: ['Navigation consistency', 'SEO optimization', 'User experience']
        })
      }

      if (projectData.api && projectData.api.endpoints > 10) {
        patterns.push({
          type: 'api-integration',
          description: 'Comprehensive API integration pattern',
          confidence: 0.92,
          benefits: ['API best practices', 'Error handling', 'Performance optimization']
        })
      }

      setTemplatePatterns(patterns)
      
      // Show generator if patterns found
      if (patterns.length > 0 && Math.random() > 0.4) {
        setTimeout(() => setIsVisible(true), 3000)
      }
    }

    analyzeProjectForTemplates()
  }, [projectData, projects])

  const generateTemplate = async (pattern) => {
    setIsGenerating(true)
    
    try {
      // Simulate AI template generation
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const templates = {
        'component-library': {
          name: 'React Component Library',
          description: 'Production-ready component library with Storybook',
          category: 'UI Framework',
          techStack: ['React', 'TypeScript', 'Storybook', 'Tailwind CSS'],
          features: [
            'Pre-built components',
            'TypeScript definitions',
            'Storybook documentation',
            'Tailwind CSS styling',
            'Jest testing setup'
          ],
          generatedFiles: [
            'components/Button/Button.tsx',
            'components/Input/Input.tsx',
            'components/Modal/Modal.tsx',
            'stories/Button.stories.tsx',
            'tests/Button.test.tsx',
            'package.json',
            'tsconfig.json'
          ],
          estimatedSetupTime: '10 minutes',
          popularity: 94
        },
        'routing-pattern': {
          name: 'React Router Template',
          description: 'Modern React routing with authentication and guards',
          category: 'Navigation',
          techStack: ['React', 'React Router', 'TypeScript', 'Context API'],
          features: [
            'Route-based code splitting',
            'Authentication guards',
            'Nested routing',
            'Error boundaries',
            'Loading states'
          ],
          generatedFiles: [
            'routes/AppRouter.tsx',
            'routes/ProtectedRoute.tsx',
            'pages/Home.tsx',
            'pages/Dashboard.tsx',
            'contexts/AuthContext.tsx',
            'hooks/useAuth.ts'
          ],
          estimatedSetupTime: '15 minutes',
          popularity: 87
        },
        'api-integration': {
          name: 'API Integration Kit',
          description: 'Complete API integration with React Query and TypeScript',
          category: 'Backend Integration',
          techStack: ['React', 'React Query', 'Axios', 'TypeScript'],
          features: [
            'API client configuration',
            'React Query setup',
            'Type-safe requests',
            'Error handling',
            'Caching strategies'
          ],
          generatedFiles: [
            'api/client.ts',
            'api/types.ts',
            'hooks/useApi.ts',
            'queries/userQueries.ts',
            'queries/projectQueries.ts',
            'utils/errorHandler.ts'
          ],
          estimatedSetupTime: '20 minutes',
          popularity: 91
        }
      }
      
      const template = templates[pattern.type]
      if (template) {
        setGeneratedTemplates(prev => [...prev, {
          id: Date.now().toString(),
          ...template,
          pattern,
          createdAt: new Date(),
          projectOrigin: projectData.name
        }])
      }
      
      toast.success('Template generated successfully!')
      
    } catch (error) {
      console.error('Template generation error:', error)
      toast.error('Failed to generate template')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadTemplate = async (template) => {
    toast.loading('Preparing template download...')
    
    try {
      // Simulate template packaging
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real implementation, this would generate and download a zip file
      const templateData = {
        name: template.name,
        version: '1.0.0',
        description: template.description,
        files: template.generatedFiles,
        dependencies: template.techStack,
        setup: {
          commands: [
            'npm install',
            'npm run dev'
          ],
          notes: [
            'Update configuration files with your API endpoints',
            'Customize styling to match your brand',
            'Review and modify components as needed'
          ]
        }
      }
      
      // Create downloadable content
      const blob = new Blob([JSON.stringify(templateData, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `${template.name.replace(/\s+/g, '-').toLowerCase()}-template.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.dismiss()
      toast.success('Template downloaded!')
      
    } catch (error) {
      toast.dismiss()
      toast.error('Download failed')
    }
  }

  const useTemplate = async (template) => {
    toast.loading('Setting up new project from template...')
    
    try {
      // Simulate project creation from template
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Navigate to new project (in real app)
      toast.dismiss()
      toast.success(`New project created from ${template.name}!`)
      
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to create project')
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      'UI Framework': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      'Navigation': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      'Backend Integration': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      'Full Stack': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
    }
    return colors[category] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-6 right-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg z-40 p-4 w-96 max-h-[32rem] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg">
              <DocumentDuplicateIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                Smart Template Generator
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                AI-powered template extraction
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

        {/* Pattern Detection */}
        {templatePatterns.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-1">
              <SparklesIcon className="w-4 h-4" />
              <span>Detected Patterns ({templatePatterns.length})</span>
            </h4>
            <div className="space-y-2">
              {templatePatterns.map((pattern, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                        {pattern.description}
                      </h5>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${
                            pattern.confidence > 0.8 ? 'bg-green-500' :
                            pattern.confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {Math.round(pattern.confidence * 100)}% confidence
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {pattern.benefits.map((benefit) => (
                      <span
                        key={benefit}
                        className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => generateTemplate(pattern)}
                    disabled={isGenerating}
                    className="w-full text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <RocketLaunchIcon className="w-4 h-4" />
                        <span>Generate Template</span>
                      </>
                    )}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Generated Templates */}
        {generatedTemplates.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center space-x-1">
              <CodeBracketIcon className="w-4 h-4" />
              <span>Generated Templates ({generatedTemplates.length})</span>
            </h4>
            <div className="space-y-3">
              {generatedTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-4 hover:border-green-300 dark:hover:border-green-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                          {template.name}
                        </h5>
                        <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(template.category)}`}>
                          {template.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {template.description}
                      </p>
                      <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-3 h-3" />
                          <span>{template.estimatedSetupTime}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircleIcon className="w-3 h-3" />
                          <span>{template.generatedFiles.length} files</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-green-600 dark:text-green-400">
                            {template.popularity}% popular
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tech Stack */}
                  <div className="mb-3">
                    <h6 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tech Stack:
                    </h6>
                    <div className="flex flex-wrap gap-1">
                      {template.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-4">
                    <h6 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Features:
                    </h6>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      {template.features.slice(0, 3).map((feature) => (
                        <li key={feature} className="flex items-center space-x-2">
                          <CheckCircleIcon className="w-3 h-3 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      {template.features.length > 3 && (
                        <li className="text-gray-500">
                          +{template.features.length - 3} more features
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => downloadTemplate(template)}
                      className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg transition-colors flex items-center justify-center space-x-1"
                    >
                      <ArrowDownTrayIcon className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                    <button
                      onClick={() => useTemplate(template)}
                      className="flex-1 text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center space-x-1"
                    >
                      <PlayIcon className="w-3 h-3" />
                      <span>Use Template</span>
                    </button>
                  </div>

                  {/* Origin Info */}
                  <div className="mt-3 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Generated from: <span className="font-medium">{template.projectOrigin}</span>
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {templatePatterns.length === 0 && generatedTemplates.length === 0 && (
          <div className="text-center py-8">
            <DocumentDuplicateIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              No Patterns Detected
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Build more features in your project to generate reusable templates
            </p>
            <button
              onClick={() => setIsVisible(false)}
              className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/30 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default SmartTemplateGenerator