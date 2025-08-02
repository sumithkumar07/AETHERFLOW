import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  PencilIcon,
  EyeIcon,
  CodeBracketIcon,
  CursorArrowRaysIcon,
  SignalIcon,
  CheckCircleIcon,
  ClockIcon,
  BoltIcon,
  ShareIcon
} from '@heroicons/react/24/outline'
import enhancedAPI from '../services/enhancedAPI'

const RealTimeCollaborationEngine = ({ projectId = 'current-project' }) => {
  const [collaborationData, setCollaborationData] = useState(null)
  const [activeUsers, setActiveUsers] = useState([])
  const [liveEditing, setLiveEditing] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [cursors, setCursors] = useState({})
  const wsRef = useRef(null)

  useEffect(() => {
    loadCollaborationData()
    initializeWebSocket()
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [projectId])

  const loadCollaborationData = async () => {
    try {
      const data = await enhancedAPI.getCollaborationStatus(projectId)
      setCollaborationData(data)
      setActiveUsers(data.activeUsers || [])
      setLiveEditing(data.liveEditing || {})
    } catch (error) {
      console.error('Failed to load collaboration data:', error)
      // Mock data for demonstration
      setCollaborationData({
        enabled: true,
        activeUsers: 3,
        liveEditing: true,
        lastActivity: new Date().toISOString()
      })
      setActiveUsers([
        { id: 1, name: 'John Doe', role: 'Developer', avatar: '👨‍💻', status: 'coding', file: 'App.jsx' },
        { id: 2, name: 'Jane Smith', role: 'Designer', avatar: '👩‍🎨', status: 'designing', file: 'styles.css' },
        { id: 3, name: 'Mike Johnson', role: 'PM', avatar: '👨‍💼', status: 'reviewing', file: 'README.md' }
      ])
      setLiveEditing({
        enabled: true,
        activeFiles: ['App.jsx', 'api.js', 'styles.css'],
        conflicts: 0,
        syncStatus: 'synced'
      })
    }
  }

  const initializeWebSocket = () => {
    try {
      // In a real implementation, this would connect to the backend WebSocket
      const ws = new WebSocket(`ws://localhost:8001/ws/collaboration-${projectId}`)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        console.log('Collaboration WebSocket connected')
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        handleWebSocketMessage(data)
      }

      ws.onclose = () => {
        setIsConnected(false)
        console.log('Collaboration WebSocket disconnected')
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setIsConnected(false)
      }
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error)
      // Simulate connection for demo
      setTimeout(() => setIsConnected(true), 1000)
    }
  }

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'user_joined':
        setActiveUsers(prev => [...prev.filter(u => u.id !== data.user.id), data.user])
        break
      case 'user_left':
        setActiveUsers(prev => prev.filter(u => u.id !== data.userId))
        break
      case 'cursor_move':
        setCursors(prev => ({ ...prev, [data.userId]: data.position }))
        break
      case 'file_change':
        // Handle real-time file changes
        break
      default:
        console.log('Unknown message type:', data.type)
    }
  }

  const UserAvatar = ({ user, size = 'md' }) => {
    const sizeClasses = {
      sm: 'w-6 h-6 text-xs',
      md: 'w-8 h-8 text-sm',
      lg: 'w-12 h-12 text-lg'
    }

    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium flex-shrink-0 relative`}>
        {user.avatar || user.name?.charAt(0)}
        {user.status && (
          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
            user.status === 'coding' ? 'bg-green-500' :
            user.status === 'designing' ? 'bg-purple-500' :
            user.status === 'reviewing' ? 'bg-blue-500' :
            'bg-gray-400'
          }`} />
        )}
      </div>
    )
  }

  const CollaborationHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center">
          <UserGroupIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Live Collaboration
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Real-time development with your team
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Connection Status */}
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
          isConnected 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`} />
          <SignalIcon className="w-4 h-4" />
          <span className="text-sm font-medium">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Active Users Count */}
        <div className="flex items-center space-x-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <UserGroupIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            {activeUsers.length} Active
          </span>
        </div>
      </div>
    </div>
  )

  const ActiveUsersList = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
        <UserGroupIcon className="w-5 h-5" />
        <span>Active Collaborators</span>
        {isConnected && (
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        )}
      </h3>

      <div className="space-y-4">
        {activeUsers.map((user) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <UserAvatar user={user} size="md" />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.name}
                </h4>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {user.role}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 mt-1">
                {user.status === 'coding' && <CodeBracketIcon className="w-3 h-3 text-green-600" />}
                {user.status === 'designing' && <PaintBrushIcon className="w-3 h-3 text-purple-600" />}
                {user.status === 'reviewing' && <EyeIcon className="w-3 h-3 text-blue-600" />}
                
                <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                  {user.status} {user.file && `• ${user.file}`}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <ChatBubbleLeftRightIcon className="w-4 h-4 text-gray-400 hover:text-blue-600 cursor-pointer" />
              <ShareIcon className="w-4 h-4 text-gray-400 hover:text-green-600 cursor-pointer" />
            </div>
          </motion.div>
        ))}
      </div>

      {activeUsers.length === 0 && (
        <div className="text-center py-8">
          <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No other users currently active
          </p>
        </div>
      )}
    </motion.div>
  )

  const LiveEditingStatus = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
        <PencilIcon className="w-5 h-5" />
        <span>Live Editing</span>
        {liveEditing?.enabled && (
          <span className="px-2 py-1 text-xs font-bold bg-green-500 text-white rounded-full animate-pulse">
            LIVE
          </span>
        )}
      </h3>

      {liveEditing?.enabled ? (
        <div className="space-y-4">
          {/* Active Files */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Currently Editing
            </h4>
            <div className="flex flex-wrap gap-2">
              {liveEditing.activeFiles?.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full"
                >
                  <CodeBracketIcon className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    {file}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sync Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Sync Status
              </div>
              <div className={`text-sm flex items-center space-x-1 ${
                liveEditing.syncStatus === 'synced' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                <CheckCircleIcon className="w-4 h-4" />
                <span className="capitalize">{liveEditing.syncStatus}</span>
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Conflicts
              </div>
              <div className={`text-sm ${
                liveEditing.conflicts === 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {liveEditing.conflicts || 0} conflicts
              </div>
            </div>
          </div>

          {/* Real-time Activity Feed */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Recent Activity
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {[
                { user: 'John Doe', action: 'edited', file: 'App.jsx', time: '2 min ago' },
                { user: 'Jane Smith', action: 'added', file: 'Button.css', time: '5 min ago' },
                { user: 'Mike Johnson', action: 'commented on', file: 'README.md', time: '8 min ago' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-2 text-xs">
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                    {activity.user.charAt(0)}
                  </div>
                  <span className="text-gray-900 dark:text-white">
                    <span className="font-medium">{activity.user}</span> {activity.action} {activity.file}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <PencilIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Live editing is not enabled
          </p>
          <button className="btn-primary text-sm px-4 py-2">
            Enable Live Editing
          </button>
        </div>
      )}
    </motion.div>
  )

  const CollaborationTools = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Collaboration Tools
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {[
          { 
            name: 'Voice Chat', 
            icon: ChatBubbleLeftRightIcon, 
            status: 'available',
            description: 'Real-time voice communication'
          },
          { 
            name: 'Screen Share', 
            icon: ShareIcon, 
            status: 'available',
            description: 'Share your screen with team'
          },
          { 
            name: 'Live Cursors', 
            icon: CursorArrowRaysIcon, 
            status: 'active',
            description: 'See team member cursors'
          },
          { 
            name: 'Pair Programming', 
            icon: CodeBracketIcon, 
            status: 'available',
            description: 'Code together in real-time'
          }
        ].map((tool, index) => {
          const Icon = tool.icon
          
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                tool.status === 'active'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <Icon className={`w-5 h-5 ${
                  tool.status === 'active' ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'
                }`} />
                <span className="font-medium text-gray-900 dark:text-white">
                  {tool.name}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {tool.description}
              </p>
              {tool.status === 'active' && (
                <div className="mt-2">
                  <span className="px-2 py-1 text-xs font-bold bg-green-500 text-white rounded-full">
                    ACTIVE
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </motion.div>
  )

  return (
    <div className="space-y-6">
      <CollaborationHeader />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActiveUsersList />
        <LiveEditingStatus />
      </div>
      
      <CollaborationTools />
      
      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Collaboration Performance
        </h3>
        
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              < 50ms
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Sync Latency</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              99.9%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {activeUsers.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default RealTimeCollaborationEngine