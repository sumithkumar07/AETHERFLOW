import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  PlayIcon,
  DocumentTextIcon,
  FolderIcon,
  CodeBracketIcon,
  EyeIcon,
  RocketLaunchIcon,
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  CloudArrowUpIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { useProjectStore } from '../store/projectStore'
import CodeEditor from '../components/CodeEditor'
import FileExplorer from '../components/FileExplorer'
import LivePreview from '../components/LivePreview'
import toast from 'react-hot-toast'

const ProjectEditor = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { 
    projects, 
    currentProject, 
    selectProject, 
    updateProjectFile, 
    deployProject,
    isLoading 
  } = useProjectStore()
  
  const [selectedFile, setSelectedFile] = useState(null)
  const [activeTab, setActiveTab] = useState('editor')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [previewMode, setPreviewMode] = useState('desktop')

  const project = currentProject || projects.find(p => p.id === projectId)

  useEffect(() => {
    if (projectId && !currentProject) {
      selectProject(projectId)
    }
  }, [projectId, currentProject, selectProject])

  useEffect(() => {
    if (project?.files?.length > 0 && !selectedFile) {
      // Auto-select the main file
      const mainFile = project.files.find(f => f.path === 'src/App.js') || project.files[0]
      setSelectedFile(mainFile)
    }
  }, [project?.files, selectedFile])

  const handleFileSelect = (file) => {
    setSelectedFile(file)
    setActiveTab('editor')
  }

  const handleFileCreate = () => {
    const fileName = prompt('Enter file name (e.g., components/Header.js):')
    if (fileName) {
      const newFile = {
        path: fileName,
        content: `// ${fileName}\n\n`,
        language: fileName.endsWith('.js') || fileName.endsWith('.jsx') ? 'javascript' : 'text'
      }
      updateProjectFile(project.id, fileName, newFile.content)
      setSelectedFile(newFile)
      toast.success(`Created ${fileName}`)
    }
  }

  const handleFileDelete = (filePath) => {
    if (window.confirm(`Are you sure you want to delete ${filePath}?`)) {
      // Implementation would involve removing file from project
      toast.success(`Deleted ${filePath}`)
    }
  }

  const handleCodeChange = (newContent) => {
    if (selectedFile && project) {
      updateProjectFile(project.id, selectedFile.path, newContent)
      setSelectedFile({
        ...selectedFile,
        content: newContent
      })
    }
  }

  const handleSave = () => {
    if (selectedFile && project) {
      updateProjectFile(project.id, selectedFile.path, selectedFile.content)
      toast.success('File saved successfully')
    }
  }

  const handleDeploy = async () => {
    if (!project) return
    
    try {
      await deployProject(project.id)
      toast.success('Deployment started! Check your project status.')
    } catch (error) {
      toast.error('Failed to start deployment')
    }
  }

  const handleRun = () => {
    setActiveTab('preview')
    toast.success('Running your application...')
  }

  const handleExport = () => {
    // Create downloadable zip of project files
    const projectData = {
      name: project.name,
      files: project.files
    }
    
    const blob = new Blob([JSON.stringify(projectData, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.name.replace(/\s+/g, '-')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Project exported successfully')
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FolderIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Project not found</h3>
          <p className="text-gray-600 mb-4">The project you're looking for doesn't exist</p>
          <button 
            onClick={() => navigate('/projects')}
            className="btn-primary"
          >
            Back to Projects
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/projects')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{project.name}</h1>
              <p className="text-sm text-gray-500">
                {project.status === 'ready' ? '● Ready' : 
                 project.status === 'building' ? '● Building...' :
                 project.status === 'deploying' ? '● Deploying...' :
                 project.status === 'deployed' ? '✓ Deployed' : 
                 `● ${project.status}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRun}
              className="btn-secondary flex items-center space-x-2"
              disabled={!project.files?.length}
            >
              <PlayIcon className="w-4 h-4" />
              <span>Run</span>
            </button>
            
            <button
              onClick={handleDeploy}
              className="btn-primary flex items-center space-x-2"
              disabled={isLoading || project.status === 'deploying'}
            >
              <RocketLaunchIcon className="w-4 h-4" />
              <span>Deploy</span>
            </button>
            
            <div className="relative">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - File Explorer */}
        <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-0'
        } overflow-hidden`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Files</h3>
              <div className="flex space-x-1">
                <button
                  onClick={handleFileCreate}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="New File"
                >
                  <PlusIcon className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded lg:hidden"
                >
                  <ArrowLeftIcon className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
            
            <FileExplorer
              files={project.files || []}
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
              onFileDelete={handleFileDelete}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Bar */}
          <div className="bg-white border-b border-gray-200">
            <div className="flex items-center justify-between px-4">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'editor'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <CodeBracketIcon className="w-4 h-4" />
                    <span>Editor</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'preview'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <EyeIcon className="w-4 h-4" />
                    <span>Preview</span>
                  </div>
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                {!sidebarOpen && (
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FolderIcon className="w-4 h-4 text-gray-600" />
                  </button>
                )}
                
                <button
                  onClick={handleSave}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Save
                </button>
                
                <button
                  onClick={handleExport}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Export Project"
                >
                  <CloudArrowUpIcon className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'editor' ? (
              <div className="h-full">
                {selectedFile ? (
                  <CodeEditor
                    file={selectedFile}
                    onChange={handleCodeChange}
                    language={selectedFile.language}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No file selected</h3>
                      <p className="text-gray-600">Select a file from the sidebar to start editing</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <LivePreview 
                project={project}
                mode={previewMode}
                onModeChange={setPreviewMode}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectEditor