import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlusIcon, 
  ChatBubbleLeftRightIcon,
  TrashIcon,
  XMarkIcon
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

  const truncateTitle = (title, maxLength = 30) => {
    if (title.length <= maxLength) return title
    return title.substring(0, maxLength) + '...'
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
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
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
        className="fixed lg:relative z-50 lg:z-0 w-80 h-full bg-white border-r border-gray-200 flex flex-col"
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
            <button
              onClick={onToggle}
              className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          
          <button
            onClick={onNewConversation}
            className="w-full btn-primary flex items-center justify-center space-x-2 py-2.5"
          >
            <PlusIcon className="w-4 h-4" />
            <span>New Conversation</span>
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length > 0 ? (
            <div className="p-2">
              {conversations.map((conversation) => (
                <motion.div
                  key={conversation.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`group relative mb-2 p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                    currentConversation?.id === conversation.id
                      ? 'bg-primary-50 border border-primary-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <ChatBubbleLeftRightIcon className={`w-4 h-4 ${
                        currentConversation?.id === conversation.id
                          ? 'text-primary-600'
                          : 'text-gray-400'
                      }`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-medium truncate ${
                        currentConversation?.id === conversation.id
                          ? 'text-primary-900'
                          : 'text-gray-900'
                      }`}>
                        {truncateTitle(conversation.title)}
                      </h3>
                      
                      {conversation.messages.length > 0 && (
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {conversation.messages[conversation.messages.length - 1].content.substring(0, 50)}...
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">
                          {formatDate(conversation.updatedAt)}
                        </span>
                        
                        <span className="text-xs text-gray-400">
                          {conversation.messages.length} messages
                        </span>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteConversation(conversation.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 text-red-500 rounded transition-all duration-200"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">
                  No conversations yet.
                  <br />
                  Start a new chat to begin!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Powered by AI Code Studio
            </p>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default ChatSidebar