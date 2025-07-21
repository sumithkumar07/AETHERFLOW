import React, { useState, useCallback, useMemo } from 'react';
import {
  Folder, FolderOpen, File, FileText, FileImage, FileVideo, FileCode,
  Plus, MoreVertical, Edit, Trash2, Copy, Download, Upload, Search,
  ChevronRight, ChevronDown, Dot
} from 'lucide-react';

const FileExplorer = ({
  files = [],
  onCreateFile,
  onOpenFile,
  currentFile,
  searchQuery = '',
  unsavedChanges = new Set(),
  professionalMode = true
}) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createType, setCreateType] = useState('file');
  const [createName, setCreateName] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  // File type icons mapping
  const getFileIcon = useCallback((fileName, type) => {
    if (type === 'folder') {
      return expandedFolders.has(fileName) ? FolderOpen : Folder;
    }

    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
      case 'py':
      case 'java':
      case 'cpp':
      case 'c':
      case 'cs':
      case 'php':
      case 'rb':
      case 'go':
      case 'rs':
      case 'swift':
      case 'kt':
        return FileCode;
      case 'txt':
      case 'md':
      case 'json':
      case 'xml':
      case 'yaml':
      case 'yml':
        return FileText;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
      case 'webp':
        return FileImage;
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'webm':
        return FileVideo;
      default:
        return File;
    }
  }, [expandedFolders]);

  // Build file tree structure
  const fileTree = useMemo(() => {
    const tree = [];
    const processedFiles = new Set();

    // Sort files: folders first, then files, alphabetically
    const sortedFiles = [...files].sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    const buildNode = (file) => {
      if (processedFiles.has(file.id)) return null;
      processedFiles.add(file.id);

      const node = {
        ...file,
        children: []
      };

      if (file.type === 'folder') {
        // Find children of this folder
        const children = sortedFiles.filter(f => f.parent_id === file.id);
        node.children = children.map(child => buildNode(child)).filter(Boolean);
      }

      return node;
    };

    // Get root level items (no parent_id)
    const rootItems = sortedFiles.filter(file => !file.parent_id);
    rootItems.forEach(file => {
      const node = buildNode(file);
      if (node) tree.push(node);
    });

    return tree;
  }, [files]);

  const toggleFolder = useCallback((folderId) => {
    setExpandedFolders(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(folderId)) {
        newExpanded.delete(folderId);
      } else {
        newExpanded.add(folderId);
      }
      return newExpanded;
    });
  }, []);

  const handleContextMenu = useCallback((e, item) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedItem(item);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  }, []);

  const handleCreateSubmit = useCallback((e) => {
    e.preventDefault();
    if (createName.trim()) {
      onCreateFile(createName.trim(), createType, selectedItem?.type === 'folder' ? selectedItem.id : null);
      setCreateName('');
      setShowCreateForm(false);
    }
  }, [createName, createType, onCreateFile, selectedItem]);

  const renderFileItem = useCallback((item, level = 0) => {
    const isSelected = currentFile?.id === item.id;
    const isExpanded = expandedFolders.has(item.id);
    const hasUnsavedChanges = unsavedChanges.has(item.id);
    const Icon = getFileIcon(item.name, item.type);

    return (
      <div key={item.id} className="file-tree-item">
        <div
          className={`file-item ${isSelected ? 'active' : ''}`}
          style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
          onClick={() => item.type === 'file' ? onOpenFile(item) : toggleFolder(item.id)}
          onContextMenu={(e) => handleContextMenu(e, item)}
        >
          {item.type === 'folder' && (
            <div className={`folder-toggle ${isExpanded ? 'expanded' : ''}`}>
              <ChevronRight size={12} />
            </div>
          )}
          
          <Icon size={16} className={`file-icon ${item.type === 'folder' ? 'text-blue-400' : 'text-gray-400'}`} />
          
          <span className="flex-1 text-sm truncate">{item.name}</span>
          
          {hasUnsavedChanges && (
            <Dot size={12} className="text-yellow-400" />
          )}
        </div>

        {item.type === 'folder' && isExpanded && item.children && (
          <div className="folder-children">
            {item.children.map(child => renderFileItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  }, [currentFile, expandedFolders, unsavedChanges, getFileIcon, onOpenFile, toggleFolder, handleContextMenu]);

  return (
    <div className="file-explorer h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-slate-700">
        <h3 className="text-sm font-medium text-gray-300">Files</h3>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => {
              setCreateType('folder');
              setShowCreateForm(true);
            }}
            className="btn btn-ghost btn-sm"
            title="New Folder"
          >
            <Folder size={14} />
          </button>
          <button
            onClick={() => {
              setCreateType('file');
              setShowCreateForm(true);
            }}
            className="btn btn-ghost btn-sm"
            title="New File"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Search */}
      {searchQuery && (
        <div className="p-2 border-b border-slate-700">
          <div className="flex items-center text-xs text-gray-400">
            <Search size={12} className="mr-1" />
            <span>Filtering by: "{searchQuery}"</span>
          </div>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="p-2 border-b border-slate-700">
          <form onSubmit={handleCreateSubmit} className="space-y-2">
            <div className="flex space-x-2">
              <select
                value={createType}
                onChange={(e) => setCreateType(e.target.value)}
                className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-xs text-white"
              >
                <option value="file">File</option>
                <option value="folder">Folder</option>
              </select>
            </div>
            <input
              type="text"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder={`${createType} name...`}
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-xs text-white placeholder-gray-400"
              autoFocus
            />
            <div className="flex space-x-1">
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={!createName.trim()}
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setCreateName('');
                }}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto">
        {fileTree.length > 0 ? (
          <div className="file-tree">
            {fileTree.map(item => renderFileItem(item))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            <Folder size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No files yet</p>
            <button
              onClick={() => {
                setCreateType('file');
                setShowCreateForm(true);
              }}
              className="btn btn-primary btn-sm mt-2"
            >
              Create your first file
            </button>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {showContextMenu && selectedItem && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowContextMenu(false)}
          />
          <div
            className="fixed z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-xl py-1 min-w-32"
            style={{
              left: `${contextMenuPosition.x}px`,
              top: `${contextMenuPosition.y}px`
            }}
          >
            <button
              className="w-full px-3 py-1 text-left text-sm text-gray-300 hover:bg-slate-700 flex items-center space-x-2"
              onClick={() => {
                // Handle rename
                setShowContextMenu(false);
              }}
            >
              <Edit size={12} />
              <span>Rename</span>
            </button>
            <button
              className="w-full px-3 py-1 text-left text-sm text-gray-300 hover:bg-slate-700 flex items-center space-x-2"
              onClick={() => {
                // Handle copy
                setShowContextMenu(false);
              }}
            >
              <Copy size={12} />
              <span>Copy</span>
            </button>
            <button
              className="w-full px-3 py-1 text-left text-sm text-gray-300 hover:bg-slate-700 flex items-center space-x-2"
              onClick={() => {
                // Handle download
                setShowContextMenu(false);
              }}
            >
              <Download size={12} />
              <span>Download</span>
            </button>
            <hr className="my-1 border-slate-600" />
            <button
              className="w-full px-3 py-1 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center space-x-2"
              onClick={() => {
                // Handle delete
                setShowContextMenu(false);
              }}
            >
              <Trash2 size={12} />
              <span>Delete</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FileExplorer;