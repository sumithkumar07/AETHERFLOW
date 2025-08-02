import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  XMarkIcon,
  RocketLaunchIcon,
  CodeBracketIcon,
  CogIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import LoadingStates from './LoadingStates'
import toast from 'react-hot-toast'

const ProjectCreationModal = ({ isOpen, onClose, onCreateProject }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'react_app',
    requirements: ''
  })
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const projectTypes = [
    {
      id: 'react_app',
      name: 'React Application',
      description: 'Modern React app with hooks and modern features',
      icon: CodeBracketIcon,
      color: 'blue',
      techStack: ['React', 'JavaScript', 'Tailwind CSS']
    },
    {
      id: 'full_stack',
      name: 'Full Stack Application',
      description: 'Complete web application with frontend and backend',
      icon: RocketLaunchIcon,
      color: 'purple',
      techStack: ['React', 'FastAPI', 'MongoDB']
    },
    {
      id: 'api_service',
      name: 'API Service',
      description: 'RESTful API service with database integration',
      icon: CogIcon,
      color: 'green',
      techStack: ['FastAPI', 'Python', 'MongoDB']
    },
    {
      id: 'static_site',
      name: 'Static Website',
      description: 'Fast, SEO-friendly static website',
      icon: GlobeAltIcon,
      color: 'yellow',
      techStack: ['HTML', 'CSS', 'JavaScript']
    },
    {
      id: 'mobile_app',
      name: 'Mobile Application',
      description: 'Cross-platform mobile application',
      icon: DevicePhoneMobileIcon,
      color: 'pink',
      techStack: ['React Native', 'Expo', 'JavaScript']
    }
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Please enter a project name')
      return
    }

    if (!formData.description.trim()) {
      toast.error('Please enter a project description')
      return
    }

    setLoading(true)
    
    try {
      const result = await onCreateProject(formData)
      
      if (result.success) {
        toast.success('Project created successfully!')
        onClose()
        // Reset form
        setFormData({
          name: '',
          description: '',
          type: 'react_app',
          requirements: ''
        })
        setStep(1)
      } else {
        toast.error(result.error || 'Failed to create project')
      }
    } catch (error) {
      console.error('Project creation error:', error)
      toast.error('An error occurred while creating the project')
    } finally {
      setLoading(false)
    }
  }

  const selectedType = projectTypes.find(type => type.id === formData.type)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Create New Project
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Step {step} of 2
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              {/* Project Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Project Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {projectTypes.map((type) => {
                    const Icon = type.icon
                    const isSelected = formData.type === type.id
                    
                    return (
                      <motion.div
                        key={type.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleInputChange('type', type.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? `border-${type.color}-500 bg-${type.color}-50 dark:bg-${type.color}-900/20`
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 bg-${type.color}-100 dark:bg-${type.color}-900/30 rounded-lg flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 text-${type.color}-600 dark:text-${type.color}-400`} />
                          </div>
                          <div>
                            <h3 className={`font-semibold text-sm ${
                              isSelected 
                                ? `text-${type.color}-900 dark:text-${type.color}-100` 
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {type.name}
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {type.description}
                            </p>
                          </div>
                        </div>
                        
                        {/* Tech Stack */}
                        <div className="mt-3 flex flex-wrap gap-1">
                          {type.techStack.map((tech, index) => (
                            <span
                              key={index}
                              className={`px-2 py-0.5 text-xs rounded ${
                                isSelected
                                  ? `bg-${type.color}-100 text-${type.color}-700 dark:bg-${type.color}-900/40 dark:text-${type.color}-300`
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                              }`}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Selected Type Preview */}
              {selectedType && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 bg-${selectedType.color}-50 dark:bg-${selectedType.color}-900/20 rounded-lg border border-${selectedType.color}-200 dark:border-${selectedType.color}-800`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 bg-${selectedType.color}-100 dark:bg-${selectedType.color}-900/30 rounded-lg flex items-center justify-center`}>
                      <selectedType.icon className={`w-4 h-4 text-${selectedType.color}-600 dark:text-${selectedType.color}-400`} />
                    </div>
                    <div>
                      <h4 className={`font-medium text-${selectedType.color}-900 dark:text-${selectedType.color}-100`}>
                        {selectedType.name}
                      </h4>
                      <p className={`text-sm text-${selectedType.color}-700 dark:text-${selectedType.color}-300`}>
                        {selectedType.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Continue Button */}
              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200"
                >
                  Continue
                </motion.button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {/* Project Details */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="My Awesome Project"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Description *
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what your project will do..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Requirements
                  <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">(Optional)</span>
                </label>
                <textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  placeholder="Any specific requirements, features, or constraints..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              {/* Project Summary */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Project Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Type:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{selectedType?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tech Stack:</span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedType?.techStack.join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Features:</span>
                    <span className="text-gray-900 dark:text-white">AI-powered development</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
                >
                  Back
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || !formData.name.trim() || !formData.description.trim()}
                  className="px-8 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <RocketLaunchIcon className="w-4 h-4" />
                      <span>Create Project</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  )
}

export default ProjectCreationModal