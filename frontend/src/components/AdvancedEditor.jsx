import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  DocumentTextIcon,
  CodeBracketIcon,
  PlayIcon,
  StopIcon
} from '@heroicons/react/24/outline'

// Mock advanced editor component - placeholder for actual editor
const AdvancedEditor = ({ 
  initialValue = '', 
  language = 'javascript',
  onChange = () => {},
  onRun = () => {},
  className = ''
}) => {
  const [code, setCode] = useState(initialValue)
  const [isRunning, setIsRunning] = useState(false)
  const textareaRef = useRef(null)

  const handleCodeChange = (e) => {
    const newCode = e.target.value
    setCode(newCode)
    onChange(newCode)
  }

  const handleRun = () => {
    setIsRunning(true)
    onRun(code)
    // Simulate execution time
    setTimeout(() => setIsRunning(false), 2000)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = textareaRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = code.substring(0, start) + '  ' + code.substring(end)
      setCode(newValue)
      onChange(newValue)
      
      // Restore cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      }, 0)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
    >
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <CodeBracketIcon className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {language} Editor
          </span>
        </div>
        
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded transition-colors"
        >
          {isRunning ? (
            <>
              <StopIcon className="w-4 h-4" />
              <span>Running...</span>
            </>
          ) : (
            <>
              <PlayIcon className="w-4 h-4" />
              <span>Run</span>
            </>
          )}
        </button>
      </div>

      {/* Editor Content */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleCodeChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter your code here..."
          className="w-full h-64 p-4 bg-gray-900 text-green-400 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            tabSize: 2
          }}
        />
        
        {/* Line numbers (mock) */}
        <div className="absolute left-2 top-4 text-gray-500 text-sm font-mono select-none pointer-events-none">
          {code.split('\n').map((_, index) => (
            <div key={index} className="leading-6">
              {index + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center justify-between">
          <span>Lines: {code.split('\n').length} | Characters: {code.length}</span>
          <span className="capitalize">{language}</span>
        </div>
      </div>
    </motion.div>
  )
}

export default AdvancedEditor