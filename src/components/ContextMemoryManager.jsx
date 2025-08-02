import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BookmarkIcon,
  ClockIcon,
  TagIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'
import { useChatStore } from '../store/chatStore'
import toast from 'react-hot-toast'

const ContextMemoryManager = ({ projectId }) => {
  const { messages } = useChatStore()
  const [bookmarkedMessages, setBookmarkedMessages] = useState([])
  const [contextThreads, setContextThreads] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedThread, setSelectedThread] = useState(null)

  useEffect(() => {
    loadBookmarkedMessages()
    generateContextThreads()
  }, [projectId, messages])

  const loadBookmarkedMessages = () => {
    const saved = localStorage.getItem(`bookmarks_${projectId}`)
    if (saved) {
      setBookmarkedMessages(JSON.parse(saved))
    }
  }

  const saveBookmarkedMessages = (bookmarks) => {
    localStorage.setItem(`bookmarks_${projectId}`, JSON.stringify(bookmarks))
    setBookmarkedMessages(bookmarks)
  }

  const generateContextThreads = () => {
    if (messages.length < 2) return

    const threads = []
    let currentThread = []
    let threadTopic = null

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i]
      
      // Analyze message to determine if it starts a new context thread
      const isNewTopic = analyzeTopicChange(message, messages[i - 1])
      
      if (isNewTopic && currentThread.length > 0) {
        threads.push({
          id: `thread_${threads.length}`,
          topic: threadTopic,
          messages: [...currentThread],
          timestamp: currentThread[0].timestamp,
          messageCount: currentThread.length
        })
        currentThread = []
        threadTopic = null
      }
      
      currentThread.push(message)
      
      // Extract topic from first user message in thread
      if (!threadTopic && message.sender === 'user') {
        threadTopic = extractTopic(message.content)
      }
    }
    
    // Add the last thread
    if (currentThread.length > 0) {
      threads.push({
        id: `thread_${threads.length}`,
        topic: threadTopic || 'General Discussion',
        messages: [...currentThread],
        timestamp: currentThread[0].timestamp,
        messageCount: currentThread.length
      })
    }

    setContextThreads(threads.reverse()) // Most recent first
  }

  const analyzeTopicChange = (currentMessage, previousMessage) => {
    if (!previousMessage || !currentMessage) return false
    
    // Simple topic change detection based on keywords
    const topicKeywords = [
      'help me', 'how do i', 'create', 'build', 'implement', 
      'add', 'setup', 'configure', 'debug', 'fix', 'deploy'
    ]
    
    const currentHasKeywords = topicKeywords.some(keyword => 
      currentMessage.content.toLowerCase().includes(keyword)
    )
    
    const isLongGap = new Date(currentMessage.timestamp) - new Date(previousMessage.timestamp) > 300000 // 5 minutes
    
    return currentHasKeywords || isLongGap
  }

  const extractTopic = (content) => {
    const firstSentence = content.split('.')[0].split('?')[0]
    if (firstSentence.length > 50) {
      return firstSentence.substring(0, 47) + '...'
    }
    return firstSentence
  }

  const bookmarkMessage = (messageId) => {
    const message = messages.find(msg => msg.id === messageId)
    if (!message) return

    const isBookmarked = bookmarkedMessages.some(bm => bm.id === messageId)
    
    if (isBookmarked) {
      const updated = bookmarkedMessages.filter(bm => bm.id !== messageId)
      saveBookmarkedMessages(updated)
      toast.success('Bookmark removed')
    } else {
      const bookmark = {
        id: messageId,
        content: message.content,
        timestamp: message.timestamp,
        sender: message.sender,
        topic: extractTopic(message.content)
      }
      saveBookmarkedMessages([...bookmarkedMessages, bookmark])
      toast.success('Message bookmarked')
    }
  }

  const isMessageBookmarked = (messageId) => {
    return bookmarkedMessages.some(bm => bm.id === messageId)
  }

  const removeBookmark = (bookmarkId) => {
    const updated = bookmarkedMessages.filter(bm => bm.id !== bookmarkId)
    saveBookmarkedMessages(updated)
    toast.success('Bookmark removed')
  }

  const filteredBookmarks = bookmarkedMessages.filter(bookmark =>
    bookmark.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bookmark.topic.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const jumpToMessage = (messageId) => {
    const messageElement = document.getElementById(`message-${messageId}`)
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      messageElement.classList.add('highlight-message')
      setTimeout(() => {
        messageElement.classList.remove('highlight-message')
      }, 2000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Context Threads */}
      <div>
        <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
          <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
          Conversation Threads
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {contextThreads.map((thread) => (
            <motion.button
              key={thread.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedThread(selectedThread === thread.id ? null : thread.id)}
              className={`w-full p-3 rounded-lg border text-left transition-all duration-200 ${
                selectedThread === thread.id
                  ? 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20'
                  : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                    {thread.topic}
                  </h4>
                  <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    <span>{new Date(thread.timestamp).toLocaleTimeString()}</span>
                    <span className="ml-2">• {thread.messageCount} messages</span>
                  </div>
                </div>
              </div>
              
              {selectedThread === thread.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="space-y-1">
                    {thread.messages.slice(-3).map((msg, idx) => (
                      <div key={idx} className="text-xs">
                        <span className={msg.sender === 'user' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}>
                          {msg.sender === 'user' ? 'You: ' : 'AI: '}
                        </span>
                        <span className="text-gray-600 dark:text-gray-300">
                          {msg.content.length > 60 ? msg.content.substring(0, 60) + '...' : msg.content}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Bookmarked Messages */}
      <div>
        <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
          <BookmarkIcon className="w-4 h-4 mr-2" />
          Bookmarked Messages ({bookmarkedMessages.length})
        </h3>
        
        {/* Search */}
        <div className="relative mb-3">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search bookmarks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Bookmarks List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredBookmarks.length > 0 ? (
            filteredBookmarks.map((bookmark) => (
              <motion.div
                key={bookmark.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-1">
                      <TagIcon className="w-3 h-3 text-yellow-600 dark:text-yellow-400 mr-1" />
                      <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
                        {bookmark.topic}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {bookmark.content}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(bookmark.timestamp).toLocaleString()}
                      </span>
                      <button
                        onClick={() => jumpToMessage(bookmark.id)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Jump to message
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeBookmark(bookmark.id)}
                    className="ml-2 p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <TrashIcon className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-6">
              <BookmarkIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {searchTerm ? 'No bookmarks match your search' : 'No bookmarked messages yet'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Enhanced ChatMessage component with bookmark functionality
export const EnhancedChatMessage = ({ message, isUser, onBookmark }) => {
  const [showActions, setShowActions] = useState(false)
  
  return (
    <div 
      id={`message-${message.id}`}
      className="enhanced-message"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Original ChatMessage content with added bookmark button */}
      {showActions && !isUser && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => onBookmark(message.id)}
          className="absolute -right-2 -top-2 p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-md hover:shadow-lg transition-all"
        >
          <BookmarkIcon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
        </motion.button>
      )}
    </div>
  )
}

export default ContextMemoryManager