import React, { useState, useEffect, useRef } from 'react'
import { 
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  DeviceTabletIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  PlayIcon
} from '@heroicons/react/24/outline'

const LivePreview = ({ project, mode = 'desktop', onModeChange }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const iframeRef = useRef(null)

  const viewportModes = [
    { id: 'desktop', name: 'Desktop', icon: ComputerDesktopIcon, width: '100%', height: '100%' },
    { id: 'tablet', name: 'Tablet', icon: DeviceTabletIcon, width: '768px', height: '1024px' },
    { id: 'mobile', name: 'Mobile', icon: DevicePhoneMobileIcon, width: '375px', height: '812px' }
  ]

  const currentMode = viewportModes.find(m => m.id === mode) || viewportModes[0]

  useEffect(() => {
    if (project && project.files) {
      generatePreview()
    }
  }, [project])

  const generatePreview = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // In a real implementation, this would:
      // 1. Send project files to a build service
      // 2. Get back a preview URL
      // 3. Display the preview in iframe
      
      // For demo purposes, we'll create a simple HTML preview
      const htmlContent = generateHTMLPreview(project)
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
      setIsLoading(false)
    } catch (err) {
      setError('Failed to generate preview')
      setIsLoading(false)
    }
  }

  const generateHTMLPreview = (project) => {
    // Find main files
    const appFile = project.files.find(f => f.path === 'src/App.js' || f.path === 'src/App.jsx')
    const packageFile = project.files.find(f => f.path === 'package.json')
    
    // Extract project info
    let projectInfo = {}
    try {
      if (packageFile) {
        projectInfo = JSON.parse(packageFile.content)
      }
    } catch (e) {
      projectInfo = { name: project.name }
    }

    // Create a simple HTML preview
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectInfo.name || project.name}</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        .preview-container {
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .preview-card {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 600px;
            text-align: center;
        }
        .preview-title {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .preview-description {
            color: #666;
            font-size: 1.2rem;
            margin-bottom: 2rem;
            line-height: 1.6;
        }
        .preview-features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 2rem;
        }
        .feature-card {
            background: #f8fafc;
            padding: 1.5rem;
            border-radius: 8px;
            border: 2px solid #e2e8f0;
        }
        .feature-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
            color: white;
            font-size: 1.5rem;
        }
        .status-badge {
            display: inline-block;
            padding: 0.5rem 1rem;
            background: #10b981;
            color: white;
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 500;
            margin-bottom: 1rem;
        }
    </style>
</head>
<body>
    <div class="preview-container">
        <div class="preview-card">
            <div class="status-badge">✨ Live Preview</div>
            <h1 class="preview-title">${project.name}</h1>
            <p class="preview-description">${project.description}</p>
            
            ${project.template ? `
            <div class="preview-features">
                ${project.template.features.slice(0, 4).map(feature => `
                    <div class="feature-card">
                        <div class="feature-icon">✓</div>
                        <h3 style="margin: 0 0 0.5rem; font-weight: 600;">${feature}</h3>
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            <div style="margin-top: 2rem; padding-top: 2rem; border-top: 2px solid #e2e8f0;">
                <p style="color: #666; font-size: 0.9rem;">
                    🚀 This is a preview of your AI-generated application.<br>
                    The actual app will be built with ${project.template ? project.template.techStack.join(', ') : 'modern web technologies'}.
                </p>
            </div>
        </div>
    </div>
    
    ${appFile ? `
    <script type="text/babel">
        // Your React code would be transpiled and executed here
        console.log('Project files loaded:', ${JSON.stringify(project.files.map(f => f.path))});
    </script>
    ` : ''}
</body>
</html>
    `
  }

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src
    }
  }

  const handleModeChange = (newMode) => {
    onModeChange(newMode)
  }

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No project loaded</h3>
          <p className="text-gray-600">Select a project to see the preview</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* Preview Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-sm font-semibold text-gray-900">Live Preview</h3>
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              {viewportModes.map((viewMode) => {
                const Icon = viewMode.icon
                return (
                  <button
                    key={viewMode.id}
                    onClick={() => handleModeChange(viewMode.id)}
                    className={`p-2 rounded-md transition-colors ${
                      mode === viewMode.id
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title={viewMode.name}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                )
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              {currentMode.width} × {currentMode.height}
            </span>
            <button
              onClick={handleRefresh}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh preview"
            >
              <ArrowPathIcon className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        {isLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating preview...</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={generatePreview}
              className="btn-primary flex items-center space-x-2"
            >
              <PlayIcon className="w-4 h-4" />
              <span>Retry Preview</span>
            </button>
          </div>
        ) : (
          <div 
            className="bg-white rounded-lg shadow-lg overflow-hidden"
            style={{
              width: currentMode.width,
              height: currentMode.height,
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          >
            <iframe
              ref={iframeRef}
              src={previewUrl}
              className="w-full h-full border-0"
              title="Live Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default LivePreview