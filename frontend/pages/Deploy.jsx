import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  RocketLaunchIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  CloudIcon,
  GlobeAltIcon,
  CodeBracketIcon,
  ArrowTopRightOnSquareIcon,
  DocumentDuplicateIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { useProjectStore } from '../store/projectStore'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const Deploy = () => {
  const { projects, deployProject, isLoading } = useProjectStore()
  const { isAuthenticated } = useAuthStore()
  const [selectedPlatform, setSelectedPlatform] = useState('vercel')
  const [deploymentStatus, setDeploymentStatus] = useState({})

  const deploymentPlatforms = [
    {
      id: 'vercel',
      name: 'Vercel',
      description: 'Optimal for React, Next.js, and static sites',
      icon: '▲',
      color: 'bg-black text-white',
      features: ['Automatic HTTPS', 'Global CDN', 'Custom Domains', 'Analytics'],
      buildTime: '~2 minutes',
      pricing: 'Free tier available'
    },
    {
      id: 'netlify',
      name: 'Netlify',
      description: 'Great for static sites and JAMstack apps',
      icon: '◆',
      color: 'bg-teal-600 text-white',
      features: ['Form Handling', 'Split Testing', 'Edge Functions', 'CMS Integration'],
      buildTime: '~3 minutes',
      pricing: 'Free tier available'
    },
    {
      id: 'railway',
      name: 'Railway',
      description: 'Perfect for full-stack applications',
      icon: '🚄',
      color: 'bg-purple-600 text-white',
      features: ['Database Hosting', 'Environment Variables', 'Custom Domains', 'Monitoring'],
      buildTime: '~4 minutes',
      pricing: 'Pay per usage'
    },
    {
      id: 'heroku',
      name: 'Heroku',
      description: 'Traditional PaaS with extensive add-ons',
      icon: '⬢',
      color: 'bg-indigo-600 text-white',
      features: ['Add-on Ecosystem', 'CI/CD Integration', 'Multi-language Support', 'Scaling'],
      buildTime: '~5 minutes',
      pricing: 'Free tier limited'
    }
  ]

  const readyProjects = projects.filter(p => p.status === 'ready')
  const selectedPlatformData = deploymentPlatforms.find(p => p.id === selectedPlatform)

  const handleDeploy = async (projectId, projectName) => {
    try {
      setDeploymentStatus(prev => ({ ...prev, [projectId]: 'deploying' }))
      await deployProject(projectId, selectedPlatform)
      setDeploymentStatus(prev => ({ ...prev, [projectId]: 'success' }))
      toast.success(`${projectName} deployed successfully to ${selectedPlatformData.name}!`)
    } catch (error) {
      setDeploymentStatus(prev => ({ ...prev, [projectId]: 'error' }))
      toast.error(`Failed to deploy ${projectName}`)
    }
  }

  const handleQuickDeploy = async (projectId) => {
    const project = projects.find(p => p.id === projectId)
    if (project) {
      await handleDeploy(projectId, project.name)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RocketLaunchIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Deploy Your Apps</h3>
          <p className="text-gray-600 mb-4">Please login to deploy your projects</p>
          <Link to="/login" className="btn-primary">
            Login to Continue
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Deploy Your Applications
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Deploy your AI-generated applications to the cloud with one click. 
              Choose from the best hosting platforms for your needs.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {readyProjects.length === 0 ? (
          <div className="text-center py-12">
            <RocketLaunchIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects ready for deployment</h3>
            <p className="text-gray-600 mb-6">Create and build your first project to get started with deployment</p>
            <div className="flex justify-center space-x-3">
              <Link to="/chat" className="btn-primary">
                Start Building
              </Link>
              <Link to="/templates" className="btn-secondary">
                Use Template
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Platform Selection */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose Deployment Platform</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {deploymentPlatforms.map((platform) => (
                  <motion.div
                    key={platform.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedPlatform === platform.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPlatform(platform.id)}
                  >
                    <div className="text-center">
                      <div className={`w-12 h-12 rounded-lg ${platform.color} flex items-center justify-center mx-auto mb-3 text-lg font-bold`}>
                        {platform.icon}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{platform.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{platform.description}</p>
                      
                      <div className="space-y-2 text-xs text-gray-500">
                        <div className="flex items-center justify-center space-x-1">
                          <Cog6ToothIcon className="w-3 h-3" />
                          <span>{platform.buildTime}</span>
                        </div>
                        <div>{platform.pricing}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {selectedPlatformData && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {selectedPlatformData.name} Features
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {selectedPlatformData.features.map((feature) => (
                      <div key={feature} className="flex items-center space-x-1 text-sm text-gray-600">
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Projects Ready for Deployment */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Ready to Deploy</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {readyProjects.map((project) => {
                  const status = deploymentStatus[project.id]
                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {project.name}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {project.description}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
                            <CheckCircleIcon className="w-4 h-4" />
                            <span>Ready</span>
                          </div>
                        </div>

                        {/* Tech Stack */}
                        {project.template?.techStack && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-1">
                              {project.template.techStack.slice(0, 3).map((tech) => (
                                <span
                                  key={tech}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Deployment Status */}
                        {status && (
                          <div className="mb-4">
                            {status === 'deploying' && (
                              <div className="flex items-center space-x-2 text-blue-600">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="text-sm">Deploying to {selectedPlatformData.name}...</span>
                              </div>
                            )}
                            {status === 'success' && (
                              <div className="flex items-center space-x-2 text-green-600">
                                <CheckCircleIcon className="w-4 h-4" />
                                <span className="text-sm">Deployed successfully!</span>
                                <button className="text-blue-600 hover:text-blue-800">
                                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                            {status === 'error' && (
                              <div className="flex items-center space-x-2 text-red-600">
                                <ExclamationCircleIcon className="w-4 h-4" />
                                <span className="text-sm">Deployment failed</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDeploy(project.id, project.name)}
                            disabled={isLoading || status === 'deploying'}
                            className="flex-1 btn-primary text-sm py-2 flex items-center justify-center space-x-2"
                          >
                            <RocketLaunchIcon className="w-4 h-4" />
                            <span>
                              {status === 'deploying' ? 'Deploying...' : `Deploy to ${selectedPlatformData.name}`}
                            </span>
                          </button>
                          
                          <Link
                            to={`/projects/${project.id}`}
                            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            title="Edit Project"
                          >
                            <CodeBracketIcon className="w-4 h-4 text-gray-600" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Deployment Guide */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Deployment Process</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <CodeBracketIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">1. Build Preparation</h3>
                  <p className="text-sm text-gray-600">
                    Your project files are optimized and prepared for deployment
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <CloudIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">2. Cloud Deployment</h3>
                  <p className="text-sm text-gray-600">
                    Files are uploaded and deployed to your chosen platform
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <GlobeAltIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">3. Live & Accessible</h3>
                  <p className="text-sm text-gray-600">
                    Your application is live and accessible worldwide
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Deploy