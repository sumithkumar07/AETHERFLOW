import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UserGroupIcon,
  EyeIcon,
  PencilIcon,
  ChatBubbleLeftIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  ShareIcon,
  XMarkIcon,
  SignalIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const RealTimeCollaboration = ({ 
  projectId, 
  isVisible, 
  onClose, 
  onCollaboratorAction 
}) => {
  const [collaborators, setCollaborators] = useState([])
  const [activeUsers, setActiveUsers] = useState(new Set())
  const [cursors, setCursors] = useState({})
  const [chatMessages, setChatMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [sharingEnabled, setSharingEnabled] = useState(false)
  const { user } = useAuthStore()
  const wsRef = useRef(null)

  useEffect(() => {
    if (isVisible && projectId) {
      initializeCollaboration()
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [isVisible, projectId])

  const initializeCollaboration = async () => {
    try {
      // Initialize WebSocket connection
      const wsUrl = `ws://localhost:8001/ws/collaboration_${projectId}`
      wsRef.current = new WebSocket(wsUrl)
      
      wsRef.current.onopen = () => {
        setConnectionStatus('connected')
        toast.success('Connected to collaboration session')
        
        // Send join message
        sendMessage({
          type: 'join',
          user: {
            id: user.id,
            name: user.name || user.email,
            avatar: user.avatar || `https://ui-avatars.com/api/?name=${user.email}&background=6366f1&color=fff`
          },
          project_id: projectId
        })
      }
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data)
        handleCollaborationMessage(data)
      }
      
      wsRef.current.onclose = () => {
        setConnectionStatus('disconnected')
        toast.error('Disconnected from collaboration session')
      }
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        setConnectionStatus('error')
        toast.error('Collaboration connection failed')
      }
      
    } catch (error) {
      console.error('Failed to initialize collaboration:', error)
      setConnectionStatus('error')
    }
  }

  const handleCollaborationMessage = (data) => {
    switch (data.type) {
      case 'user_joined':
        setCollaborators(prev => {
          const existing = prev.find(c => c.id === data.user.id)
          if (existing) return prev
          return [...prev, { ...data.user, status: 'online', joinedAt: new Date() }]
        })
        setActiveUsers(prev => new Set([...prev, data.user.id]))
        toast.success(`${data.user.name} joined the session`)
        break
        
      case 'user_left':
        setActiveUsers(prev => {
          const newSet = new Set(prev)
          newSet.delete(data.user.id)
          return newSet
        })
        toast(`${data.user.name} left the session`)
        break
        
      case 'cursor_update':
        setCursors(prev => ({
          ...prev,
          [data.user.id]: {
            x: data.cursor.x,
            y: data.cursor.y,
            user: data.user,
            timestamp: Date.now()
          }
        }))
        break
        
      case 'code_change':
        // Handle real-time code changes
        if (onCollaboratorAction) {
          onCollaboratorAction({
            type: 'code_change',
            user: data.user,
            changes: data.changes
          })
        }
        break
        
      case 'chat_message':
        setChatMessages(prev => [...prev, {
          id: Date.now(),
          user: data.user,
          message: data.message,
          timestamp: new Date()
        }])
        break
        
      case 'selection_update':
        // Handle text selection updates
        if (onCollaboratorAction) {
          onCollaboratorAction({
            type: 'selection_update',
            user: data.user,
            selection: data.selection
          })
        }
        break
        
      default:
        console.log('Unknown collaboration message:', data)
    }
  }

  const sendMessage = (data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }

  const sendChatMessage = () => {
    if (!newMessage.trim()) return
    
    sendMessage({
      type: 'chat_message',
      user: {
        id: user.id,
        name: user.name || user.email,
        avatar: user.avatar
      },
      message: newMessage,
      project_id: projectId,
      timestamp: new Date().toISOString()
    })
    
    setNewMessage('')
  }

  const shareScreen = async () => {
    try {
      if (!sharingEnabled) {
        // Request screen sharing
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        })
        
        setSharingEnabled(true)
        toast.success('Screen sharing started')
        
        // Handle stream end
        stream.getVideoTracks()[0].onended = () => {
          setSharingEnabled(false)
          toast('Screen sharing ended')
        }
      } else {
        setSharingEnabled(false)
        toast('Screen sharing stopped')
      }
    } catch (error) {
      console.error('Screen sharing failed:', error)
      toast.error('Failed to start screen sharing')
    }
  }

  const inviteCollaborator = async () => {
    try {
      const inviteLink = `${window.location.origin}/collaborate/${projectId}`
      await navigator.clipboard.writeText(inviteLink)
      toast.success('Collaboration link copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy invite link')
    }
  }

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600'
      case 'connecting': return 'text-yellow-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected'
      case 'connecting': return 'Connecting...'
      case 'error': return 'Connection Error'
      default: return 'Disconnected'
    }
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed right-4 top-20 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl z-40"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <UserGroupIcon className="w-6 h-6 text-blue-500" />
              {activeUsers.size > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">{activeUsers.size}</span>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Live Collaboration
              </h3>
              <div className="flex items-center space-x-2">
                <SignalIcon className={`w-3 h-3 ${getConnectionStatusColor()}`} />
                <span className={`text-xs ${getConnectionStatusColor()}`}>
                  {getConnectionStatusText()}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Active Collaborators */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Active Now ({activeUsers.size})
            </h4>
            <button
              onClick={inviteCollaborator}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Invite Collaborator"
            >
              <ShareIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          
          <div className="space-y-2">
            {collaborators.filter(c => activeUsers.has(c.id)).map((collaborator) => (
              <motion.div
                key={collaborator.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="relative">
                  <img
                    src={collaborator.avatar}
                    alt={collaborator.name}
                    className="w-8 h-8 rounded-full border-2 border-green-400"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-800"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {collaborator.name}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <EyeIcon className="w-3 h-3" />
                    <span>Viewing</span>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" title="Viewing code"></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full" title="Online"></div>
                </div>
              </motion.div>
            ))}
          </div>

          {activeUsers.size === 0 && (
            <div className="text-center py-4">
              <UserGroupIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No active collaborators
              </p>
              <button
                onClick={inviteCollaborator}
                className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Invite someone to collaborate
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={shareScreen}
              className={`p-3 rounded-lg border transition-colors ${
                sharingEnabled
                  ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <ShareIcon className="w-4 h-4 mx-auto mb-1" />
              <span className="text-xs">Share</span>
            </button>
            <button className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <VideoCameraIcon className="w-4 h-4 mx-auto mb-1" />
              <span className="text-xs">Video</span>
            </button>
            <button className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <MicrophoneIcon className="w-4 h-4 mx-auto mb-1" />
              <span className="text-xs">Audio</span>
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="p-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <ChatBubbleLeftIcon className="w-4 h-4 mr-2" />
              Team Chat
            </h4>
            
            <div className="space-y-2 max-h-32 overflow-y-auto mb-3">
              {chatMessages.length === 0 ? (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
                  No messages yet
                </p>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className="text-xs">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {msg.user.name}:
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 ml-1">
                      {msg.message}
                    </span>
                  </div>
                ))
              )}
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendChatMessage}
                disabled={!newMessage.trim()}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Live Cursors Overlay */}
      <div className="fixed inset-0 pointer-events-none z-30">
        {Object.entries(cursors).map(([userId, cursor]) => {
          if (userId === user.id) return null // Don't show own cursor
          
          return (
            <motion.div
              key={userId}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                left: cursor.x,
                top: cursor.y,
                transform: 'translate(-50%, -50%)'
              }}
              className="absolute"
            >
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                  {cursor.user.name}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </AnimatePresence>
  )
}

export default RealTimeCollaboration