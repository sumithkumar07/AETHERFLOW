import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CubeIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
  TrashIcon,
  PlusIcon,
  Cog6ToothIcon,
  ClockIcon,
  CpuChipIcon,
  CircleStackIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SignalIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const ContainerManager = ({ isVisible, onClose, projectId }) => {
  const [containers, setContainers] = useState([])
  const [images, setImages] = useState([])
  const [selectedContainer, setSelectedContainer] = useState(null)
  const [logs, setLogs] = useState('')
  const [activeTab, setActiveTab] = useState('containers')
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Mock data - replace with real Docker API calls
  useEffect(() => {
    if (isVisible) {
      setContainers([
        {
          id: 'cont_1',
          name: 'ai-tempo-frontend',
          image: 'node:18-alpine',
          status: 'running',
          uptime: '2h 30m',
          ports: ['3000:3000'],
          cpu: '0.5%',
          memory: '125MB',
          created: '2025-02-01T10:30:00Z'
        },
        {
          id: 'cont_2', 
          name: 'ai-tempo-backend',
          image: 'python:3.11-slim',
          status: 'running',
          uptime: '2h 30m',
          ports: ['8001:8001'],
          cpu: '1.2%',
          memory: '89MB',
          created: '2025-02-01T10:30:00Z'
        },
        {
          id: 'cont_3',
          name: 'mongodb',
          image: 'mongo:7.0',
          status: 'running',
          uptime: '2h 35m',
          ports: ['27017:27017'],
          cpu: '0.8%',
          memory: '156MB',
          created: '2025-02-01T10:25:00Z'
        },
        {
          id: 'cont_4',
          name: 'redis-cache',
          image: 'redis:7-alpine',
          status: 'stopped',
          uptime: '0m',
          ports: ['6379:6379'],
          cpu: '0%',
          memory: '0MB',
          created: '2025-02-01T09:15:00Z'
        }
      ])

      setImages([
        { id: 'img_1', name: 'node:18-alpine', size: '174MB', created: '2025-01-20' },
        { id: 'img_2', name: 'python:3.11-slim', size: '126MB', created: '2025-01-20' },
        { id: 'img_3', name: 'mongo:7.0', size: '695MB', created: '2025-01-18' },
        { id: 'img_4', name: 'redis:7-alpine', size: '28MB', created: '2025-01-18' }
      ])
    }
  }, [isVisible])

  const handleContainerAction = async (containerId, action) => {
    setIsLoading(true)
    try {
      // Mock API calls
      switch (action) {
        case 'start':
          setContainers(prev => prev.map(c => 
            c.id === containerId ? { ...c, status: 'running', uptime: '0m' } : c
          ))
          toast.success('Container started successfully')
          break
        case 'stop':
          setContainers(prev => prev.map(c => 
            c.id === containerId ? { ...c, status: 'stopped', uptime: '0m' } : c
          ))
          toast.success('Container stopped successfully')
          break
        case 'restart':
          setContainers(prev => prev.map(c => 
            c.id === containerId ? { ...c, status: 'running', uptime: '0m' } : c
          ))
          toast.success('Container restarted successfully')
          break
        case 'remove':
          setContainers(prev => prev.filter(c => c.id !== containerId))
          toast.success('Container removed successfully')
          break
      }
    } catch (error) {
      toast.error(`Failed to ${action} container`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewLogs = (container) => {
    setSelectedContainer(container)
    setLogs(`[${new Date().toISOString()}] Container ${container.name} started
[${new Date().toISOString()}] Listening on port ${container.ports[0]?.split(':')[0] || '8000'}
[${new Date().toISOString()}] Application ready
[${new Date().toISOString()}] Health check passed`)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'stopped': return 'text-gray-600 bg-gray-100 dark:bg-gray-700'
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      default: return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return <CheckCircleIcon className="w-4 h-4" />
      case 'stopped': return <StopIcon className="w-4 h-4" />
      case 'error': return <ExclamationTriangleIcon className="w-4 h-4" />
      default: return <ClockIcon className="w-4 h-4" />
    }
  }

  if (!isVisible) return null

  return (
    <motion.div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-7xl h-[80vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <CubeIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Container Manager
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage Docker containers and images
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span>New Container</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="px-6 flex space-x-8">
            {['containers', 'images'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex h-full">
          {/* Main Panel */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'containers' && (
              <div className="h-full overflow-y-auto p-6">
                <div className="grid gap-4">
                  {containers.map((container) => (
                    <motion.div
                      key={container.id}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6"
                      whileHover={{ y: -2, shadow: "0 8px 25px rgba(0,0,0,0.1)" }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                            <CubeIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {container.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {container.image}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(container.status)}`}>
                            {getStatusIcon(container.status)}
                            <span className="capitalize">{container.status}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            {container.status === 'stopped' ? (
                              <button
                                onClick={() => handleContainerAction(container.id, 'start')}
                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                title="Start"
                              >
                                <PlayIcon className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleContainerAction(container.id, 'stop')}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Stop"
                              >
                                <StopIcon className="w-4 h-4" />
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleContainerAction(container.id, 'restart')}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                              title="Restart"
                            >
                              <ArrowPathIcon className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => handleViewLogs(container)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="View Logs"
                            >
                              <SignalIcon className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => handleContainerAction(container.id, 'remove')}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Remove"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
                            <p className="font-medium text-gray-900 dark:text-white">{container.uptime}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <CpuChipIcon className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">CPU</p>
                            <p className="font-medium text-gray-900 dark:text-white">{container.cpu}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <CircleStackIcon className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Memory</p>
                            <p className="font-medium text-gray-900 dark:text-white">{container.memory}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Cog6ToothIcon className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Ports</p>
                            <p className="font-medium text-gray-900 dark:text-white">{container.ports.join(', ')}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'images' && (
              <div className="h-full overflow-y-auto p-6">
                <div className="grid gap-4">
                  {images.map((image) => (
                    <motion.div
                      key={image.id}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6"
                      whileHover={{ y: -2 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                            <CircleStackIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {image.name}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                              <span>Size: {image.size}</span>
                              <span>Created: {image.created}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                            <PlayIcon className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Logs */}
          {selectedContainer && (
            <div className="w-96 border-l border-gray-200 dark:border-gray-700 flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Logs: {selectedContainer.name}
                </h3>
              </div>
              <div className="flex-1 p-4">
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-full overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{logs}</pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ContainerManager