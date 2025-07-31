import React from 'react'
import { motion } from 'framer-motion'
import { UserIcon, SparklesIcon, ClipboardIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const ChatMessage = ({ message, isLast }) => {
  const isUser = message.role === 'user'
  const isError = message.type === 'error'

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy')
    }
  }

  const formatContent = (content) => {
    // Simple code block detection
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    const inlineCodeRegex = /`([^`]+)`/g
    
    let formattedContent = content
    
    // Replace code blocks
    formattedContent = formattedContent.replace(codeBlockRegex, (match, language, code) => {
      return `<pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto my-4 font-mono text-sm"><code>${code.trim()}</code></pre>`
    })
    
    // Replace inline code
    formattedContent = formattedContent.replace(inlineCodeRegex, (match, code) => {
      return `<code class="bg-gray-100 text-gray-800 px-2 py-1 rounded font-mono text-sm">${code}</code>`
    })
    
    // Replace line breaks
    formattedContent = formattedContent.replace(/\n/g, '<br>')
    
    return formattedContent
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex space-x-3 max-w-3xl ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-primary-100' 
            : isError 
              ? 'bg-red-100' 
              : 'bg-gray-100'
        }`}>
          {isUser ? (
            <UserIcon className="w-5 h-5 text-primary-600" />
          ) : (
            <SparklesIcon className={`w-5 h-5 ${isError ? 'text-red-600' : 'text-gray-600'}`} />
          )}
        </div>

        {/* Message Content */}
        <div className={`group relative ${
          isUser 
            ? 'bg-primary-600 text-white' 
            : isError 
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-white border border-gray-200 text-gray-900'
        } rounded-2xl px-4 py-3 shadow-sm`}>
          
          {/* Copy Button */}
          {!isUser && (
            <button
              onClick={() => copyToClipboard(message.content)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all duration-200"
            >
              <ClipboardIcon className="w-4 h-4 text-gray-500" />
            </button>
          )}

          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: formatContent(message.content) 
            }}
          />

          {/* Timestamp */}
          <div className={`text-xs mt-2 ${
            isUser 
              ? 'text-primary-200' 
              : 'text-gray-400'
          }`}>
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ChatMessage