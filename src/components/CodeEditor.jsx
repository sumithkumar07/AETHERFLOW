import React, { useState, useEffect, useRef } from 'react'
import { 
  DocumentDuplicateIcon,
  CheckIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline'

const CodeEditor = ({ file, onChange, language = 'javascript' }) => {
  const [content, setContent] = useState(file?.content || '')
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (file) {
      setContent(file.content || '')
    }
  }, [file])

  const handleContentChange = (e) => {
    const newContent = e.target.value
    setContent(newContent)
    if (onChange) {
      onChange(newContent)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleKeyDown = (e) => {
    // Tab handling for proper indentation
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = textareaRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newContent = content.substring(0, start) + '  ' + content.substring(end)
      setContent(newContent)
      onChange && onChange(newContent)
      
      // Restore cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      }, 0)
    }
  }

  const getLanguageClass = (lang) => {
    const languageMap = {
      javascript: 'language-javascript',
      jsx: 'language-jsx',
      typescript: 'language-typescript',
      css: 'language-css',
      html: 'language-html',
      json: 'language-json',
      markdown: 'language-markdown'
    }
    return languageMap[lang] || 'language-text'
  }

  const getLineNumbers = () => {
    const lines = content.split('\n')
    return lines.map((_, index) => index + 1).join('\n')
  }

  if (!file) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <CodeBracketIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No file selected</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 text-gray-100">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="ml-4 text-sm text-gray-300">{file.path}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400 uppercase">{language}</span>
          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-gray-700 rounded transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <CheckIcon className="w-4 h-4 text-green-400" />
            ) : (
              <DocumentDuplicateIcon className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line Numbers */}
        <div className="bg-gray-800 text-gray-500 text-sm font-mono p-4 select-none border-r border-gray-700 min-w-[60px]">
          <pre className="leading-6">{getLineNumbers()}</pre>
        </div>
        
        {/* Code Area */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            className="w-full h-full p-4 bg-transparent text-gray-100 font-mono text-sm leading-6 resize-none focus:outline-none"
            placeholder="Start typing your code..."
            spellCheck={false}
            style={{
              tabSize: 2,
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace'
            }}
          />
          
          {/* Syntax highlighting overlay would go here in a real implementation */}
          <div className="absolute inset-0 pointer-events-none">
            <pre className={`p-4 text-transparent font-mono text-sm leading-6 ${getLanguageClass(language)}`}>
              <code>{content}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 text-xs text-gray-400">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span>Lines: {content.split('\n').length}</span>
            <span>Characters: {content.length}</span>
            <span>Language: {language}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>UTF-8</span>
            <span>•</span>
            <span>LF</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CodeEditor