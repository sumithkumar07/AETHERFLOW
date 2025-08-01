import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  XMarkIcon,
  PlayIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CodeBracketIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const CodeEditor = ({ code, onChange, onClose }) => {
  const [activeTab, setActiveTab] = useState('code')
  const [language, setLanguage] = useState('javascript')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const textareaRef = useRef(null)

  const languages = [
    { id: 'javascript', name: 'JavaScript', ext: '.js' },
    { id: 'typescript', name: 'TypeScript', ext: '.ts' },
    { id: 'python', name: 'Python', ext: '.py' },
    { id: 'html', name: 'HTML', ext: '.html' },
    { id: 'css', name: 'CSS', ext: '.css' },
    { id: 'json', name: 'JSON', ext: '.json' },
    { id: 'markdown', name: 'Markdown', ext: '.md' }
  ]

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [code])

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code)
    toast.success('Code copied to clipboard!')
  }

  const handleDownloadCode = () => {
    const selectedLang = languages.find(lang => lang.id === language)
    const filename = `code${selectedLang?.ext || '.txt'}`
    
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success(`Code downloaded as ${filename}`)
  }

  const handleRunCode = () => {
    toast.success('Code execution started!')
    // Add code execution logic here
  }

  const tabs = [
    { id: 'code', name: 'Code', icon: CodeBracketIcon },
    { id: 'preview', name: 'Preview', icon: EyeIcon },
    { id: 'settings', name: 'Settings', icon: AdjustmentsHorizontalIcon }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`${isFullscreen ? 'fixed inset-0 z-50' : 'h-full'} bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CodeBracketIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Code Editor</h3>
          </div>
          
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRunCode}
            className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
            title="Run Code"
          >
            <PlayIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopyCode}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Copy Code"
          >
            <DocumentDuplicateIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownloadCode}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Download Code"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Close Editor"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-gray-200/50 dark:border-gray-700/50">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'code' && (
          <div className="h-full">
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => onChange(e.target.value)}
              placeholder="// Your code will appear here..."
              className="w-full h-full p-4 bg-transparent text-gray-900 dark:text-white font-mono text-sm resize-none focus:outline-none"
              style={{ minHeight: '100%' }}
            />
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="h-full p-4">
            <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <EyeIcon className="w-12 h-12 mx-auto mb-2" />
                <p>Code preview will appear here</p>
                <p className="text-sm">Run your code to see the output</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="h-full p-4">
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Editor Settings
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Font Size
                    </span>
                    <select className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                      <option value="12">12px</option>
                      <option value="14" selected>14px</option>
                      <option value="16">16px</option>
                      <option value="18">18px</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Theme
                    </span>
                    <select className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto" selected>Auto</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Word Wrap
                    </span>
                    <button className="relative inline-flex h-5 w-9 items-center rounded-full bg-blue-600 transition-colors">
                      <span className="inline-block h-3 w-3 transform translate-x-5 rounded-full bg-white transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default CodeEditor