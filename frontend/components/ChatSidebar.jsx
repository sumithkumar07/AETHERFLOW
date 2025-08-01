import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlusIcon, 
  ChatBubbleLeftRightIcon,
  TrashIcon,
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

const ChatSidebar = ({ 
  isOpen, 
  onToggle, 
  conversations, 
  currentConversation, 
  onSelectConversation, 
  onNewConversation, 
  onDeleteConversation 
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date

    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const truncateTitle = (title, maxLength = 25) => {
    if (title.length <= maxLength) return title
    return title.substring(0, maxLength) + '...'
  }

  const getLastMessagePreview = (messages) => {
    if (messages.length === 0) return 'No messages yet'
    const lastMessage = messages[messages.length - 1]
    const content = lastMessage.content.replace(/```[\s\S]*?```/g, '[Code]')
    return content.length > 40 ? content.substring(0, 40) + '...' : content
  }

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: isOpen ? 0 : -320,
          opacity: isOpen ? 1 : 0
        }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className="fixed lg:relative z-50 lg:z-0 w-80 h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col"
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <SparklesIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chats</h2>
            </div>
            <button
              onClick={onToggle}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl lg:hidden transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNewConversation}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl py-3 px-4 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <PlusIcon className="w-4 h-4" />
            <span className="font-medium">New Chat</span>
          </motion.button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length > 0 ? (
            <div className="p-2 space-y-1">
              <AnimatePresence>
                {conversations.map((conversation, index) => (
                  <motion.div
                    key={conversation.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                      currentConversation?.id === conversation.id
                        ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 shadow-sm'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent'
                    }`}
                    onClick={() => onSelectConversation(conversation.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`p-2 rounded-lg ${
                          currentConversation?.id === conversation.id
                            ? 'bg-blue-100 dark:bg-blue-800'
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          <ChatBubbleLeftRightIcon className={`w-4 h-4 ${
                            currentConversation?.id === conversation.id
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-500 dark:text-gray-400'
                          }`} />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-sm font-medium truncate ${
                          currentConversation?.id === conversation.id
                            ? 'text-blue-900 dark:text-blue-100'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {truncateTitle(conversation.title)}
                        </h3>
                        
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                          {getLastMessagePreview(conversation.messages)}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {formatDate(conversation.updatedAt)}
                          </span>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {conversation.messages.length}
                            </span>
                            
                            {/* Delete Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteConversation(conversation.id)
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 rounded-lg transition-all duration-200"
                            >
                              <TrashIcon className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ChatBubbleLeftRightIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
                  No conversations yet
                  <br />
                  <span className="text-xs">Start chatting to see your history</span>
                </p>
              </motion.div>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Powered by <span className="font-medium text-blue-600 dark:text-blue-400">Tempo AI</span>
            </p>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default ChatSidebar