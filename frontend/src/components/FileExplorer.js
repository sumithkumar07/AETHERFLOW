import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  File, 
  Folder, 
  FolderOpen,
  Plus,
  FileText,
  FolderPlus
} from 'lucide-react';

const FileExplorer = ({ files, onCreateFile, onOpenFile, currentFile }) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [showCreateMenu, setShowCreateMenu] = useState(null);

  // Build file tree structure
  const buildFileTree = (files) => {
    const tree = {};
    const items = [...files].sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    items.forEach(file => {
      if (!file.parent_id) {
        tree[file.id] = { ...file, children: [] };
      }
    });

    items.forEach(file => {
      if (file.parent_id && tree[file.parent_id]) {
        tree[file.parent_id].children.push(file);
      }
    });

    return Object.values(tree);
  };

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateFile = (parentId, type) => {
    const name = prompt(`Enter ${type} name:`);
    if (name) {
      onCreateFile(name, type, parentId);
      if (type === 'folder') {
        setExpandedFolders(new Set([...expandedFolders, parentId]));
      }
    }
    setShowCreateMenu(null);
  };

  const FileIcon = ({ file, isOpen }) => {
    if (file.type === 'folder') {
      return isOpen ? <FolderOpen size={16} className="text-blue-400" /> : <Folder size={16} className="text-blue-400" />;
    }
    
    const ext = file.name.split('.').pop()?.toLowerCase();
    const iconMap = {
      'js': '📄',
      'jsx': '⚛️',
      'ts': '🔷',
      'tsx': '⚛️',
      'py': '🐍',
      'html': '🌐',
      'css': '🎨',
      'json': '📋',
      'md': '📝',
      'txt': '📄'
    };
    
    return (
      <span className="text-sm mr-1">
        {iconMap[ext] || '📄'}
      </span>
    );
  };

  const renderFileNode = (file, depth = 0) => {
    const isExpanded = expandedFolders.has(file.id);
    const isSelected = currentFile?.id === file.id;
    const hasChildren = file.children && file.children.length > 0;

    return (
      <div key={file.id}>
        <div 
          className={`flex items-center px-2 py-1 hover:bg-gray-700 cursor-pointer text-sm ${
            isSelected ? 'bg-gray-600' : ''
          }`}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={() => {
            if (file.type === 'folder') {
              toggleFolder(file.id);
            } else {
              onOpenFile(file);
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            if (file.type === 'folder') {
              setShowCreateMenu(showCreateMenu === file.id ? null : file.id);
            }
          }}
        >
          {file.type === 'folder' && (
            <button className="mr-1 text-gray-400 hover:text-white">
              {hasChildren && isExpanded ? (
                <ChevronDown size={14} />
              ) : hasChildren ? (
                <ChevronRight size={14} />
              ) : (
                <div className="w-[14px]" />
              )}
            </button>
          )}
          
          <FileIcon file={file} isOpen={isExpanded} />
          
          <span className="flex-1 truncate text-gray-200">
            {file.name}
          </span>
          
          {file.type === 'folder' && showCreateMenu === file.id && (
            <div className="flex space-x-1 ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreateFile(file.id, 'file');
                }}
                className="p-1 hover:bg-gray-600 rounded"
                title="New file"
              >
                <FileText size={12} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreateFile(file.id, 'folder');
                }}
                className="p-1 hover:bg-gray-600 rounded"
                title="New folder"
              >
                <FolderPlus size={12} />
              </button>
            </div>
          )}
        </div>
        
        {file.type === 'folder' && isExpanded && file.children && (
          <div>
            {file.children
              .sort((a, b) => {
                if (a.type !== b.type) {
                  return a.type === 'folder' ? -1 : 1;
                }
                return a.name.localeCompare(b.name);
              })
              .map(child => renderFileNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const fileTree = buildFileTree(files);

  return (
    <div className="h-full overflow-auto">
      {fileTree.length === 0 ? (
        <div className="p-4 text-center text-gray-500 text-sm">
          <p>No files in project</p>
          <button 
            onClick={() => handleCreateFile(null, 'file')}
            className="mt-2 text-blue-400 hover:text-blue-300"
          >
            Create your first file
          </button>
        </div>
      ) : (
        <div className="py-2">
          {fileTree.map(file => renderFileNode(file))}
        </div>
      )}
      
      {/* Quick create buttons */}
      <div className="p-2 border-t border-gray-700 mt-4">
        <div className="flex space-x-2">
          <button
            onClick={() => handleCreateFile(null, 'file')}
            className="flex-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs flex items-center justify-center space-x-1"
            title="New file"
          >
            <FileText size={12} />
            <span>File</span>
          </button>
          <button
            onClick={() => handleCreateFile(null, 'folder')}
            className="flex-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs flex items-center justify-center space-x-1"
            title="New folder"
          >
            <FolderPlus size={12} />
            <span>Folder</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileExplorer;