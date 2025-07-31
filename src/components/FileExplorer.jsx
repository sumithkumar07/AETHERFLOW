import React, { useState } from 'react'
import { 
  FolderIcon,
  FolderOpenIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  PhotoIcon,
  CogIcon,
  TrashIcon,
  ChevronRightIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'

const FileExplorer = ({ files = [], selectedFile, onFileSelect, onFileDelete }) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set(['src', 'public']))

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    
    switch (ext) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return CodeBracketIcon
      case 'json':
      case 'config':
        return CogIcon
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return PhotoIcon
      default:
        return DocumentTextIcon
    }
  }

  const organizeFiles = (files) => {
    const organized = {}
    
    files.forEach(file => {
      const parts = file.path.split('/')
      let current = organized
      
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          // This is a file
          if (!current._files) current._files = []
          current._files.push(file)
        } else {
          // This is a folder
          if (!current[part]) {
            current[part] = {}
          }
          current = current[part]
        }
      })
    })
    
    return organized
  }

  const toggleFolder = (folderPath) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath)
    } else {
      newExpanded.add(folderPath)
    }
    setExpandedFolders(newExpanded)
  }

  const renderFileTree = (node, basePath = '', level = 0) => {
    const items = []
    
    // Render folders first
    Object.keys(node).forEach(key => {
      if (key === '_files') return
      
      const folderPath = basePath ? `${basePath}/${key}` : key
      const isExpanded = expandedFolders.has(folderPath)
      const ChevronIcon = isExpanded ? ChevronDownIcon : ChevronRightIcon
      const FolderIconComponent = isExpanded ? FolderOpenIcon : FolderIcon
      
      items.push(
        <div key={folderPath}>
          <div
            className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer group"
            style={{ paddingLeft: `${level * 12 + 8}px` }}
            onClick={() => toggleFolder(folderPath)}
          >
            <ChevronIcon className="w-3 h-3 text-gray-400" />
            <FolderIconComponent className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-700 flex-1">{key}</span>
          </div>
          
          {isExpanded && (
            <div>
              {renderFileTree(node[key], folderPath, level + 1)}
            </div>
          )}
        </div>
      )
    })
    
    // Render files
    if (node._files) {
      node._files.forEach(file => {
        const FileIcon = getFileIcon(file.path)
        const fileName = file.path.split('/').pop()
        const isSelected = selectedFile?.path === file.path
        
        items.push(
          <div
            key={file.path}
            className={`flex items-center space-x-2 px-2 py-1 rounded cursor-pointer group ${
              isSelected ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
            }`}
            style={{ paddingLeft: `${level * 12 + 20}px` }}
            onClick={() => onFileSelect(file)}
          >
            <FileIcon className={`w-4 h-4 ${isSelected ? 'text-primary-600' : 'text-gray-500'}`} />
            <span className={`text-sm flex-1 ${isSelected ? 'font-medium' : 'text-gray-700'}`}>
              {fileName}
            </span>
            {onFileDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onFileDelete(file.path)
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                title="Delete file"
              >
                <TrashIcon className="w-3 h-3 text-red-500" />
              </button>
            )}
          </div>
        )
      })
    }
    
    return items
  }

  const organizedFiles = organizeFiles(files)

  return (
    <div className="space-y-1">
      {files.length === 0 ? (
        <div className="text-center py-8">
          <FolderIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No files yet</p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {renderFileTree(organizedFiles)}
        </div>
      )}
    </div>
  )
}

export default FileExplorer