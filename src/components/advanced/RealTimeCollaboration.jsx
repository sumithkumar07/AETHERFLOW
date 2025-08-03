import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UserGroupIcon,
  PencilIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  CursorArrowRaysIcon,
  ShareIcon,
  CheckCircleIcon,
  ClockIcon,
  VideoCameraIcon,
  MicrophoneIcon
} from '@heroicons/react/24/outline'
import { useRealTimeStore } from '../../store/realTimeStore'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

/**
 * Real-time Collaboration Component
 * Provides live collaboration features including cursor tracking, document editing, and user presence
 */
const RealTimeCollaboration = ({ documentId, projectId }) => {
  const { user } = useAuthStore()
  const {
    liveCollaboration,
    joinCollaborationSession,
    leaveCollaborationSession,
    broadcastCursorPosition,
    broadcastSelection,
    broadcastDocumentChange,
    notifications,
    addNotification
  } = useRealTimeStore()

  const [document, setDocument] = useState({ content: '', title: 'Untitled Document' })
  const [isEditing, setIsEditing] = useState(false)
  const [selection, setSelection] = useState(null)
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [collaborationMode, setCollaborationMode] = useState('edit') // 'edit', 'review', 'present'
  const [showPresence, setShowPresence] = useState(true)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')

  const editorRef = useRef(null)
  const cursorRef = useRef(null)
  const sessionId = `${projectId}-${documentId}`

  useEffect(() => {
    // Join collaboration session
    joinCollaborationSession(sessionId, documentId)
    
    // Initialize document
    loadDocument()
    
    // Setup cursor tracking
    setupCursorTracking()
    
    return () => {
      leaveCollaborationSession(sessionId)
    }
  }, [sessionId, documentId])

  const loadDocument = async () => {
    // This would load the document from the backend
    const mockDocument = {
      id: documentId,
      title: 'Project Specification',
      content: `# Project Specification

## Overview
This document outlines the requirements and architecture for our AI-powered development platform.

## Features
- Real-time collaboration
- AI-powered code generation
- Advanced analytics dashboard
- Visual programming interface

## Technical Requirements
- React 18+ frontend
- FastAPI backend
- MongoDB database
- WebSocket real-time communication

## Architecture
The system follows a microservices architecture with the following components:
1. Frontend Application (React)
2. Backend API (FastAPI)
3. Database (MongoDB)
4. Real-time Service (WebSocket)
5. AI Service (Ollama Integration)

## Implementation Plan
1. Phase 1: Core Infrastructure
2. Phase 2: AI Integration
3. Phase 3: Advanced Features
4. Phase 4: Optimization & Scaling`,
      lastModified: new Date(),
      collaborators: liveCollaboration.activeUsers
    }
    
    setDocument(mockDocument)
  }

  const setupCursorTracking = () => {
    const handleMouseMove = (e) => {
      const newPosition = { x: e.clientX, y: e.clientY }
      setCursorPosition(newPosition)
      
      // Broadcast cursor position to other users
      broadcastCursorPosition(documentId, {
        x: e.clientX,
        y: e.clientY,
        user: {
          id: user.id,
          name: user.name,
          color: getUserColor(user.id)
        }
      })
    }

    const handleSelectionChange = () => {
      const sel = window.getSelection()
      if (sel.rangeCount > 0) {
        const range = sel.getRangeAt(0)
        const selectionData = {
          start: range.startOffset,
          end: range.endOffset,
          text: sel.toString(),
          user: {
            id: user.id,
            name: user.name,
            color: getUserColor(user.id)
          }
        }
        setSelection(selectionData)
        broadcastSelection(documentId, selectionData)
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('selectionchange', handleSelectionChange)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('selectionchange', handleSelectionChange)
    }
  }

  const getUserColor = (userId) => {
    const colors = [
      '#3B82F6', // blue
      '#10B981', // green
      '#F59E0B', // yellow
      '#EF4444', // red
      '#8B5CF6', // purple
      '#F97316', // orange
      '#06B6D4', // cyan
      '#84CC16'  // lime
    ]
    const index = userId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
    return colors[index % colors.length]
  }

  const handleContentChange = (newContent) => {
    setDocument(prev => ({ ...prev, content: newContent }))
    
    // Broadcast document change
    broadcastDocumentChange(documentId, {
      type: 'content_change',
      content: newContent,
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name
      }
    })
  }

  const handleModeChange = (mode) => {
    setCollaborationMode(mode)
    
    addNotification({
      id: Date.now(),
      type: 'info',
      title: 'Mode Changed',
      message: `Switched to ${mode} mode`,
      timestamp: new Date().toISOString(),
      read: false
    })
  }

  const sendChatMessage = () => {
    if (!chatInput.trim()) return

    const message = {
      id: Date.now(),
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar
      },
      content: chatInput.trim(),
      timestamp: new Date(),
      type: 'message'
    }

    setChatMessages(prev => [...prev, message])
    setChatInput('')

    // Broadcast chat message to other collaborators
    broadcastDocumentChange(documentId, {
      type: 'chat_message',
      message: message
    })

    toast.success('Message sent to collaborators', { icon: '💬' })
  }

  const renderCollaboratorCursors = () => {
    return Object.entries(liveCollaboration.cursors).map(([userId, cursor]) => {
      if (userId === user.id) return null

      return (
        <motion.div
          key={userId}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed pointer-events-none z-50"
          style={{
            left: cursor.x,
            top: cursor.y,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="relative">
            <CursorArrowRaysIcon
              className="w-5 h-5"
              style={{ color: cursor.user?.color || '#3B82F6' }}
            />
            <div
              className="absolute top-6 left-0 px-2 py-1 rounded text-xs text-white whitespace-nowrap"
              style={{ backgroundColor: cursor.user?.color || '#3B82F6' }}
            >
              {cursor.user?.name || 'Anonymous'}
            </div>
          </div>
        </motion.div>
      )
    })
  }

  const renderSelections = () => {
    return Object.entries(liveCollaboration.selections).map(([userId, selection]) => {
      if (userId === user.id || !selection?.text) return null

      return (
        <div
          key={userId}
          className="absolute pointer-events-none"
          style={{
            backgroundColor: `${selection.user?.color || '#3B82F6'}20`,
            border: `1px solid ${selection.user?.color || '#3B82F6'}`
          }}
        >
          <span className="text-xs font-medium" style={{ color: selection.user?.color }}>
            {selection.user?.name} selected: "{selection.text.substring(0, 50)}..."
          </span>
        </div>
      )
    })
  }

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <DocumentTextIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {document.title}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last modified: {document.lastModified?.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Collaboration Controls */}
            <div className="flex items-center space-x-3">
              {/* Mode Selector */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {['edit', 'review', 'present'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleModeChange(mode)}
                    className={`px-3 py-1 text-sm rounded-md capitalize transition-colors ${
                      collaborationMode === mode
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Share Button */}
              <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                <ShareIcon className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Collaborators Bar */}
          {showPresence && liveCollaboration.activeUsers.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active collaborators:</span>
                <div className="flex -space-x-2">
                  {liveCollaboration.activeUsers.slice(0, 5).map((collaborator) => (
                    <div
                      key={collaborator.id}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-800"
                      title={`${collaborator.name} - ${collaborator.status || 'Online'}`}
                    >
                      {collaborator.name?.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {liveCollaboration.activeUsers.length > 5 && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs font-medium border-2 border-white dark:border-gray-800">
                      +{liveCollaboration.activeUsers.length - 5}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600">Live</span>
                </div>
                <button
                  onClick={() => setShowPresence(!showPresence)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <EyeIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Document Editor */}
        <div className="flex-1 relative">
          <div className="h-full p-6 overflow-y-auto">
            <textarea
              ref={editorRef}
              value={document.content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full h-full min-h-96 bg-transparent border-none outline-none resize-none text-gray-900 dark:text-white font-mono text-sm leading-relaxed"
              placeholder="Start typing your document..."
              spellCheck={true}
              onFocus={() => setIsEditing(true)}
              onBlur={() => setIsEditing(false)}
            />
          </div>

          {/* Collaborator Cursors */}
          <AnimatePresence>
            {renderCollaboratorCursors()}
          </AnimatePresence>

          {/* Selections */}
          {renderSelections()}

          {/* Real-time Indicators */}
          <div className="absolute top-4 right-4 flex flex-col space-y-2">
            {Object.values(liveCollaboration.cursors).map((cursor, index) => (
              cursor.user?.id !== user.id && (
                <motion.div
                  key={cursor.user?.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-lg border border-gray-200 dark:border-gray-700"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cursor.user?.color }}
                  ></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    {cursor.user?.name} is here
                  </span>
                </motion.div>
              )
            ))}
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-2">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span>Mode: {collaborationMode}</span>
              <span>Words: {document.content.split(' ').length}</span>
              <span>Characters: {document.content.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              {isEditing && (
                <div className="flex items-center space-x-1">
                  <PencilIcon className="w-3 h-3" />
                  <span>Editing</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <CheckCircleIcon className="w-3 h-3 text-green-500" />
                <span>Saved</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collaboration Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <UserGroupIcon className="w-5 h-5 mr-2" />
            Collaboration
          </h2>
        </div>

        {/* Active Users */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Active Users ({liveCollaboration.activeUsers.length})
          </h3>
          <div className="space-y-2">
            {liveCollaboration.activeUsers.map((user) => (
              <div key={user.id} className="flex items-center space-x-3">
                <div
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium"
                  style={{ backgroundColor: getUserColor(user.id) }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user.status || 'Online'}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
              Chat
            </h3>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <AnimatePresence>
              {chatMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex space-x-2 ${
                    message.user.id === user.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.user.id !== user.id && (
                    <div
                      className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
                      style={{ backgroundColor: getUserColor(message.user.id) }}
                    >
                      {message.user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div
                    className={`max-w-xs rounded-lg px-3 py-2 ${
                      message.user.id === user.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-75 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {message.user.id === user.id && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                      {message.user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
              />
              <button
                onClick={sendChatMessage}
                disabled={!chatInput.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RealTimeCollaboration