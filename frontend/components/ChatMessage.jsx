import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  UserIcon, 
  SparklesIcon, 
  ClipboardIcon,
  CodeBracketIcon,
  PlayIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const ChatMessage = ({ message, isLast, onCodeUpdate }) => {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const isError = message.error

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy')
    }
  }

  const extractCode = (content) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    const matches = []
    let match
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      matches.push({
        language: match[1] || 'text',
        code: match[2].trim()
      })
    }
    
    return matches
  }

  const formatContent = (content) => {
    // Enhanced code block detection with syntax highlighting
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    const inlineCodeRegex = /`([^`]+)`/g
    
    let formattedContent = content
    
    // Replace code blocks with enhanced styling
    formattedContent = formattedContent.replace(codeBlockRegex, (match, language, code) => {
      const codeId = Math.random().toString(36).substr(2, 9)
      return `
        <div class="code-block-container my-4">
          <div class="flex items-center justify-between bg-gray-800 dark:bg-gray-900 px-4 py-2 rounded-t-lg">
            <span class="text-xs text-gray-300 font-medium">${language || 'Code'}</span>
            <div class="flex items-center space-x-2">
              <button onclick="copyCode('${codeId}')" class="text-gray-400 hover:text-white transition-colors p-1 rounded">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
              </button>
              <button onclick="runCode('${codeId}')" class="text-gray-400 hover:text-green-400 transition-colors p-1 rounded">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m2-10v18a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2h12a2 2 0 012 2z"></path>
                </svg>
              </button>
            </div>
          </div>
          <pre id="${codeId}" class="bg-gray-900 dark:bg-black text-green-400 p-4 rounded-b-lg overflow-x-auto font-mono text-sm"><code>${code.trim()}</code></pre>
        </div>
      `
    })
    
    // Replace inline code with better styling
    formattedContent = formattedContent.replace(inlineCodeRegex, (match, code) => {
      return `<code class="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded font-mono text-sm">${code}</code>`
    })
    
    // Enhanced text formatting
    formattedContent = formattedContent
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/\n\n/g, '</p><p class="mb-2">')
      .replace(/\n/g, '<br>')
    
    return `<p class="mb-2">${formattedContent}</p>`
  }

  const codeBlocks = extractCode(message.content)

  // Add global functions for code actions
  React.useEffect(() => {
    window.copyCode = (codeId) => {
      const codeElement = document.getElementById(codeId)
      if (codeElement) {
        copyToClipboard(codeElement.textContent)
      }
    }
    
    window.runCode = (codeId) => {
      const codeElement = document.getElementById(codeId)
      if (codeElement && onCodeUpdate) {
        onCodeUpdate(codeElement.textContent)
        toast.success('Code sent to editor!')
      }
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex space-x-3 max-w-4xl ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
            isUser 
              ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
              : isError 
                ? 'bg-gradient-to-br from-red-500 to-pink-600' 
                : 'bg-gradient-to-br from-gray-600 to-gray-700 dark:from-gray-700 dark:to-gray-800'
          }`}
        >
          {isUser ? (
            <UserIcon className="w-5 h-5 text-white" />
          ) : (
            <SparklesIcon className="w-5 h-5 text-white" />
          )}
        </motion.div>

        {/* Message Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`group relative max-w-none ${
            isUser 
              ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg' 
              : isError 
                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white shadow-xl'
          } rounded-2xl px-6 py-4`}
        >
          
          {/* Action Buttons */}
          {!isUser && (
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity duration-200">
              <button
                onClick={() => copyToClipboard(message.content)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Copy message"
              >
                {copied ? (
                  <CheckIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <ClipboardIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                )}
              </button>
              
              {codeBlocks.length > 0 && (
                <button
                  onClick={() => {
                    if (onCodeUpdate) {
                      onCodeUpdate(codeBlocks[0].code)
                      toast.success('Code sent to editor!')
                    }
                  }}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Send to code editor"
                >
                  <CodeBracketIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              )}
            </div>
          )}

          {/* Message Text */}
          <div 
            className={`prose prose-sm max-w-none ${
              isUser 
                ? 'prose-invert' 
                : 'prose-gray dark:prose-invert'
            }`}
            style={{ 
              color: 'inherit',
              maxWidth: 'none'
            }}
            dangerouslySetInnerHTML={{ 
              __html: formatContent(message.content) 
            }}
          />

          {/* Message Info */}
          <div className={`flex items-center justify-between mt-3 pt-2 border-t ${
            isUser 
              ? 'border-white/20' 
              : 'border-gray-200 dark:border-gray-700'
          }`}>
            <div className={`text-xs ${
              isUser 
                ? 'text-white/70' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {new Date(message.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
              {message.model && !isUser && (
                <span className="ml-2">• {message.model}</span>
              )}
            </div>
            
            {isError && (
              <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-full">
                Error
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default ChatMessage