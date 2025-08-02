import React, { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  PhotoIcon, 
  CodeBracketIcon, 
  CpuChipIcon,
  DocumentIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline'
import { useAdvancedAIStore } from '../../store/advancedAIStore'
import toast from 'react-hot-toast'

/**
 * Visual Programming Component - Upload and analyze diagrams to generate code
 * Connects to /api/visual-programming/* endpoints
 */
const VisualProgramming = () => {
  const {
    supportedDiagramTypes,
    diagramAnalysis,
    generatedCode,
    uploadedDiagrams,
    loading,
    error,
    fetchSupportedDiagramTypes,
    analyzeDiagram,
    generateCodeFromFlowchart,
    generateUIFromWireframe,
    uploadDiagram,
    clearError
  } = useAdvancedAIStore()

  const [selectedDiagramType, setSelectedDiagramType] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('python')
  const [selectedFramework, setSelectedFramework] = useState('react')
  const fileInputRef = useRef(null)

  React.useEffect(() => {
    fetchSupportedDiagramTypes()
  }, [fetchSupportedDiagramTypes])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback(async (e) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length === 0) {
      toast.error('Please drop image files only')
      return
    }
    
    for (const file of imageFiles) {
      await handleFileUpload(file)
    }
  }, [selectedDiagramType])

  const handleFileUpload = async (file) => {
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    
    const result = await uploadDiagram(file, selectedDiagramType)
    
    if (result.success) {
      toast.success(`Diagram uploaded and analyzed successfully!`)
    } else {
      toast.error(result.error || 'Failed to upload diagram')
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const generateFlowchartCode = async (analysisId) => {
    const analysis = diagramAnalysis[analysisId]
    if (!analysis) return
    
    const result = await generateCodeFromFlowchart(analysis, selectedLanguage)
    
    if (result.success) {
      toast.success(`Code generated in ${selectedLanguage}!`)
    }
  }

  const generateWireframeUI = async (analysisId) => {
    const analysis = diagramAnalysis[analysisId]
    if (!analysis) return
    
    const result = await generateUIFromWireframe(analysis, selectedFramework)
    
    if (result.success) {
      toast.success(`UI component generated for ${selectedFramework}!`)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Code copied to clipboard!')
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Visual Programming
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Upload diagrams and convert them to executable code using AI
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex justify-between">
            <div className="text-red-800 dark:text-red-200">{error}</div>
            <button onClick={clearError} className="text-red-600 hover:text-red-800">
              ×
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Upload Diagram
            </h2>

            {/* Diagram Type Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Diagram Type (Optional)
              </label>
              <select
                value={selectedDiagramType}
                onChange={(e) => setSelectedDiagramType(e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Auto-detect</option>
                {supportedDiagramTypes.map((type) => (
                  <option key={type.type} value={type.type}>
                    {type.type.charAt(0).toUpperCase() + type.type.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragOver
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Drop your diagram here
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                or click to browse files
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading}
              >
                {loading ? 'Uploading...' : 'Choose File'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Code Generation Options */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Code Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  UI Framework
                </label>
                <select
                  value={selectedFramework}
                  onChange={(e) => setSelectedFramework(e.target.value)}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="react">React</option>
                  <option value="vue">Vue.js</option>
                  <option value="angular">Angular</option>
                  <option value="html">HTML/CSS</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Supported Types */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Supported Diagrams
            </h3>
            <div className="space-y-3">
              {supportedDiagramTypes.map((type) => (
                <div key={type.type} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                    {type.type.replace('_', ' ')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {type.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {type.capabilities?.slice(0, 3).map((capability) => (
                      <span
                        key={capability}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                      >
                        {capability.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {Object.keys(diagramAnalysis).length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Analysis Results
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(diagramAnalysis).map(([analysisId, analysis]) => (
              <motion.div
                key={analysisId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Diagram Analysis
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => generateFlowchartCode(analysisId)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      <CodeBracketIcon className="h-4 w-4 inline mr-1" />
                      Generate Code
                    </button>
                    <button
                      onClick={() => generateWireframeUI(analysisId)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      <CpuChipIcon className="h-4 w-4 inline mr-1" />
                      Generate UI
                    </button>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <pre className="whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(analysis, null, 2)}
                  </pre>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Generated Code */}
      {Object.keys(generatedCode).length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Generated Code
          </h2>
          <div className="space-y-6">
            {Object.entries(generatedCode).map(([codeId, codeData]) => (
              <motion.div
                key={codeId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {codeData.type === 'ui_component' ? 'UI Component' : 'Generated Code'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Language: {codeData.language || codeData.framework}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(codeData.code)}
                    className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                  >
                    <DocumentIcon className="h-4 w-4 inline mr-1" />
                    Copy Code
                  </button>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-green-400 text-sm">
                    <code>{codeData.code}</code>
                  </pre>
                </div>

                {codeData.styles && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Styles
                    </h4>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-blue-400 text-sm">
                        <code>{codeData.styles}</code>
                      </pre>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Upload History */}
      {uploadedDiagrams.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Upload History
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedDiagrams.map((upload) => (
              <div
                key={upload.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {upload.filename}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Uploaded and analyzed
                    </p>
                  </div>
                  <ArrowUpTrayIcon className="h-5 w-5 text-green-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default VisualProgramming