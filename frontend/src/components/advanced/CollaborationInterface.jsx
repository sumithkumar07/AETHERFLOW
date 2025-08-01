import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UserGroupIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  CursorArrowRaysIcon,
  ShareIcon,
  BellIcon
} from '@heroicons/react/24/outline'

const CollaborationInterface = ({ projectId, currentUser }) => {
  const [collaborators, setCollaborators] = useState([])
  const [activeDocument, setActiveDocument] = useState(null)
  const [documentContent, setDocumentContent] = useState('')
  const [chatMessages, setChatMessages] = useState([])
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [isVideoActive, setIsVideoActive] = useState(false)
  const [cursors, setCursors] = useState({})
  const [loading, setLoading] = useState(true)
  const editorRef = useRef(null)
  const chatInputRef = useRef(null)

  // Mock data
  const mockCollaborators = [
    {
      id: 'user1',
      name: 'Alice Johnson',
      email: 'alice@company.com',
      avatar: 'A',
      status: 'active',
      cursor: { line: 15, column: 23 },
      selection: { start: 150, end: 167 },
      color: '#FF6B6B',
      lastSeen: new Date()
    },
    {
      id: 'user2', 
      name: 'Bob Smith',
      email: 'bob@company.com',
      avatar: 'B',
      status: 'idle',
      cursor: { line: 8, column: 12 },
      selection: null,
      color: '#4ECDC4',
      lastSeen: new Date(Date.now() - 300000) // 5 minutes ago
    },
    {
      id: 'user3',
      name: 'Carol Davis',
      email: 'carol@company.com',
      avatar: 'C',
      status: 'active',
      cursor: { line: 25, column: 5 },
      selection: { start: 320, end: 340 },
      color: '#45B7D1',
      lastSeen: new Date()
    }
  ]

  const mockChatMessages = [
    {
      id: 1,
      user: { name: 'Alice Johnson', avatar: 'A', color: '#FF6B6B' },
      message: 'Hey everyone! I just updated the authentication logic.',
      timestamp: new Date(Date.now() - 600000),
      type: 'text'
    },
    {
      id: 2,
      user: { name: 'Bob Smith', avatar: 'B', color: '#4ECDC4' },
      message: 'Looks good! Should we also add rate limiting?',
      timestamp: new Date(Date.now() - 480000),
      type: 'text'
    },
    {
      id: 3,
      user: { name: 'Carol Davis', avatar: 'C', color: '#45B7D1' },
      message: 'I can work on the rate limiting. Give me 20 minutes.',
      timestamp: new Date(Date.now() - 120000),
      type: 'text'
    },
    {
      id: 4,
      user: { name: 'System', avatar: '🤖', color: '#9CA3AF' },
      message: 'Carol Davis started editing auth.js',
      timestamp: new Date(Date.now() - 60000),
      type: 'system'
    }
  ]

  useEffect(() => {
    initializeCollaboration()
    // Set up real-time updates
    const interval = setInterval(updateCollaboratorStatus, 2000)
    return () => clearInterval(interval)
  }, [projectId])

  const initializeCollaboration = async () => {
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000))
      setCollaborators(mockCollaborators)
      setChatMessages(mockChatMessages)
      setDocumentContent('// Authentication middleware\nconst authenticateUser = async (req, res, next) => {\n  try {\n    const token = req.headers.authorization?.split(" ")[1];\n    if (!token) {\n      return res.status(401).json({ error: "No token provided" });\n    }\n    \n    const decoded = jwt.verify(token, process.env.JWT_SECRET);\n    req.user = decoded;\n    next();\n  } catch (error) {\n    res.status(401).json({ error: "Invalid token" });\n  }\n};')
      setActiveDocument({ name: 'auth.js', type: 'javascript' })
      setLoading(false)
    } catch (error) {
      console.error('Failed to initialize collaboration:', error)
      setLoading(false)
    }
  }

  const updateCollaboratorStatus = () => {
    // Simulate real-time cursor movements
    setCursors(prev => {
      const newCursors = { ...prev }
      mockCollaborators.forEach(collab => {
        if (collab.status === 'active' && Math.random() > 0.7) {
          newCursors[collab.id] = {
            x: Math.random() * 800,
            y: Math.random() * 400,
            color: collab.color
          }
        }
      })
      return newCursors
    })
  }

  const handleDocumentChange = (newContent) => {
    setDocumentContent(newContent)
    // In real implementation, this would send the change to other collaborators
  }

  const handleSendMessage = (message) => {
    if (!message.trim()) return
    
    const newMessage = {
      id: Date.now(),
      user: { name: currentUser?.name || 'You', avatar: currentUser?.avatar || 'Y', color: '#3B82F6' },
      message: message,
      timestamp: new Date(),
      type: 'text'
    }
    
    setChatMessages(prev => [...prev, newMessage])
    chatInputRef.current.value = ''
  }

  const toggleVoice = () => {
    setIsVoiceActive(!isVoiceActive)
  }

  const toggleVideo = () => {
    setIsVideoActive(!isVideoActive)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'idle': return 'bg-yellow-500'
      case 'away': return 'bg-gray-500'
      default: return 'bg-gray-300'
    }
  }

  const formatTimestamp = (timestamp) => {
    const now = new Date()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
    return timestamp.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Connecting to collaboration session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Collaboration Header */}
      <div className="bg-gray-50 px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <UserGroupIcon className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Live Collaboration</span>
            </div>
            {activeDocument && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 rounded-full">
                <DocumentTextIcon className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700">{activeDocument.name}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleVoice}
              className={`p-2 rounded-lg transition-colors ${
                isVoiceActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <MicrophoneIcon className="w-4 h-4" />
            </button>
            <button
              onClick={toggleVideo}
              className={`p-2 rounded-lg transition-colors ${
                isVideoActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <VideoCameraIcon className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200">
              <ShareIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-96">
        {/* Collaborators Sidebar */}
        <div className="w-64 bg-gray-50 border-r p-4">
          <h4 className="font-medium text-gray-900 mb-3">
            Collaborators ({collaborators.length})
          </h4>
          <div className="space-y-3">
            {collaborators.map((collaborator) => (
              <motion.div
                key={collaborator.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white"
              >
                <div className="relative">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: collaborator.color }}
                  >
                    {collaborator.avatar}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(collaborator.status)} rounded-full border-2 border-white`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {collaborator.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {collaborator.status === 'active' ? (
                      `Line ${collaborator.cursor.line}`
                    ) : (
                      formatTimestamp(collaborator.lastSeen)
                    )}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <div className="flex h-full">
            {/* Document Editor */}
            <div className="flex-1 relative">
              <div className="p-4 h-full">
                <div className="h-full relative">
                  {/* Cursor overlays */}
                  <AnimatePresence>
                    {Object.entries(cursors).map(([userId, cursor]) => (
                      <motion.div
                        key={userId}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute pointer-events-none z-10"
                        style={{
                          left: cursor.x,
                          top: cursor.y,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        <CursorArrowRaysIcon 
                          className="w-4 h-4" 
                          style={{ color: cursor.color }}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Code Editor */}
                  <textarea
                    ref={editorRef}
                    value={documentContent}
                    onChange={(e) => handleDocumentChange(e.target.value)}
                    className="w-full h-full p-3 font-mono text-sm border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Start coding together..."
                  />

                  {/* Selection highlights (simulated) */}
                  {collaborators.map((collab) => 
                    collab.selection && collab.status === 'active' && (
                      <div
                        key={`selection-${collab.id}`}
                        className="absolute pointer-events-none"
                        style={{
                          backgroundColor: `${collab.color}20`,
                          border: `1px solid ${collab.color}`,
                          borderRadius: '2px',
                          top: '40px',
                          left: '50px',
                          width: '120px',
                          height: '20px'
                        }}
                      />
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Chat Panel */}
            <div className="w-80 border-l bg-gray-50">
              <div className="h-full flex flex-col">
                {/* Chat Header */}
                <div className="p-3 border-b bg-white">
                  <div className="flex items-center space-x-2">
                    <ChatBubbleLeftIcon className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-900">Team Chat</span>
                    <div className="flex-1"></div>
                    <BellIcon className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  <AnimatePresence>
                    {chatMessages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex space-x-2 ${
                          message.type === 'system' ? 'justify-center' : ''
                        }`}
                      >
                        {message.type !== 'system' && (
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
                            style={{ backgroundColor: message.user.color }}
                          >
                            {message.user.avatar}
                          </div>
                        )}
                        <div className={`flex-1 ${message.type === 'system' ? 'text-center' : ''}`}>
                          {message.type === 'system' ? (
                            <div className="text-xs text-gray-500 bg-gray-200 rounded-full px-3 py-1 inline-block">
                              {message.message}
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-xs font-medium text-gray-900">
                                  {message.user.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatTimestamp(message.timestamp)}
                                </span>
                              </div>
                              <div className="text-sm text-gray-700 bg-white rounded-lg p-2 shadow-sm">
                                {message.message}
                              </div>
                            </>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Chat Input */}
                <div className="p-3 border-t bg-white">
                  <div className="flex space-x-2">
                    <input
                      ref={chatInputRef}
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSendMessage(e.target.value)
                        }
                      }}
                    />
                    <button
                      onClick={() => handleSendMessage(chatInputRef.current.value)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CollaborationInterface