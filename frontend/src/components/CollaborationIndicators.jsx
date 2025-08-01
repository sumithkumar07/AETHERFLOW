import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UserIcon,
  EyeIcon,
  PencilIcon,
  CursorArrowRaysIcon,
  WifiIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'

const CollaborationIndicators = ({ projectId }) => {
  const [onlineUsers, setOnlineUsers] = useState([])
  const [userCursors, setUserCursors] = useState([])
  const [realtimeActivity, setRealtimeActivity] = useState([])
  const { user } = useAuthStore()

  // Simulate real-time collaboration data
  useEffect(() => {
    // Simulate online users
    const mockUsers = [
      { 
        id: 'user2', 
        name: 'Alex Chen', 
        avatar: '👨‍💻', 
        status: 'editing', 
        color: '#3B82F6',
        lastActive: new Date(),
        currentFile: 'components/App.jsx'
      },
      { 
        id: 'user3', 
        name: 'Sarah Wilson', 
        avatar: '👩‍💼', 
        status: 'viewing', 
        color: '#10B981',
        lastActive: new Date(Date.now() - 30000),
        currentFile: 'styles/index.css'
      },
      { 
        id: 'user4', 
        name: 'Mike Johnson', 
        avatar: '👨‍🎨', 
        status: 'idle', 
        color: '#F59E0B',
        lastActive: new Date(Date.now() - 120000),
        currentFile: null
      }
    ]

    setOnlineUsers(mockUsers)

    // Simulate cursor positions
    const mockCursors = [
      {
        id: 'user2',
        x: Math.random() * 800,
        y: Math.random() * 600,
        user: mockUsers[0]
      },
      {
        id: 'user3', 
        x: Math.random() * 800,
        y: Math.random() * 600,
        user: mockUsers[1]
      }
    ]

    setUserCursors(mockCursors)

    // Simulate real-time activity
    const activities = [
      { id: 1, user: 'Alex Chen', action: 'Started editing App.jsx', timestamp: new Date() },
      { id: 2, user: 'Sarah Wilson', action: 'Added new styles', timestamp: new Date(Date.now() - 60000) },
      { id: 3, user: 'Mike Johnson', action: 'Opened project', timestamp: new Date(Date.now() - 180000) }
    ]

    setRealtimeActivity(activities)

    // Simulate cursor movement
    const cursorInterval = setInterval(() => {
      setUserCursors(prev => 
        prev.map(cursor => ({
          ...cursor,
          x: Math.max(0, Math.min(800, cursor.x + (Math.random() - 0.5) * 100)),
          y: Math.max(0, Math.min(600, cursor.y + (Math.random() - 0.5) * 100))
        }))
      )
    }, 2000)

    return () => clearInterval(cursorInterval)
  }, [projectId])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'editing': return <PencilIcon className="w-3 h-3" />
      case 'viewing': return <EyeIcon className="w-3 h-3" />
      case 'idle': return <UserIcon className="w-3 h-3" />
      default: return <UserIcon className="w-3 h-3" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'editing': return 'bg-green-500'
      case 'viewing': return 'bg-blue-500'  
      case 'idle': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const formatTimeAgo = (timestamp) => {
    const diff = Date.now() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    return `${Math.floor(minutes / 60)}h ago`
  }

  return (
    <>
      {/* Live Cursors Overlay */}
      <div className="fixed inset-0 pointer-events-none z-30">
        <AnimatePresence>
          {userCursors.map((cursor) => (
            <motion.div
              key={cursor.id}
              animate={{ x: cursor.x, y: cursor.y }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute pointer-events-none"
            >
              {/* Cursor */}
              <div 
                className="relative"
                style={{ color: cursor.user.color }}
              >
                <CursorArrowRaysIcon 
                  className="w-6 h-6" 
                  style={{ color: cursor.user.color }}
                />
                
                {/* User Label */}
                <div 
                  className="absolute top-6 left-2 px-2 py-1 rounded-lg text-white text-xs font-medium whitespace-nowrap shadow-lg"
                  style={{ backgroundColor: cursor.user.color }}
                >
                  <div className="flex items-center space-x-1">
                    <span>{cursor.user.avatar}</span>
                    <span>{cursor.user.name}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Collaboration Panel - Top Right */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-20 right-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg z-40 p-4 w-80"
      >
        {/* Online Users */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <WifiIcon className="w-4 h-4 text-green-500" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Live Collaboration
              </span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
              <UsersIcon className="w-3 h-3" />
              <span>{onlineUsers.length + 1} online</span>
            </div>
          </div>
        </div>

        {/* User List */}
        <div className="space-y-2 mb-4">
          {/* Current User */}
          <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">
                  {user?.name || 'You'}
                </div>
                <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400">
                  <PencilIcon className="w-3 h-3" />
                  <span>Editing</span>
                </div>
              </div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Owner</span>
          </div>

          {/* Other Users */}
          {onlineUsers.map((collaborator) => (
            <motion.div
              key={collaborator.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: collaborator.color }}
                  >
                    {collaborator.avatar}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(collaborator.status)} border-2 border-white dark:border-gray-900 rounded-full`}></div>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    {collaborator.name}
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                    {getStatusIcon(collaborator.status)}
                    <span className="capitalize">{collaborator.status}</span>
                    {collaborator.currentFile && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-24">{collaborator.currentFile}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-400">
                {formatTimeAgo(collaborator.lastActive)}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-3">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Recent Activity
          </h4>
          <div className="space-y-1">
            {realtimeActivity.slice(0, 3).map((activity) => (
              <div key={activity.id} className="text-xs text-gray-600 dark:text-gray-400">
                <span className="font-medium">{activity.user}</span>
                <span className="text-gray-500 dark:text-gray-500"> {activity.action}</span>
                <span className="text-gray-400 dark:text-gray-600 ml-1">
                  • {formatTimeAgo(activity.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center justify-center space-x-2 mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Connected to live session
          </span>
        </div>
      </motion.div>
    </>
  )
}

export default CollaborationIndicators