import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import FileExplorer from './components/FileExplorer';
import CollaborativeCodeEditor from './components/CollaborativeCodeEditor';
import AIChat from './components/AIChat';
import AppPreview from './components/AppPreview';
import ProjectManager from './components/ProjectManager';
import CollaborationPanel from './components/CollaborationPanel';
import ErrorBoundary from './components/ErrorBoundary';
import NotificationProvider, { useNotifications } from './components/NotificationSystem';
import LoadingSpinner, { LoadingOverlay } from './components/LoadingSpinner';
import useOfflineDetection from './hooks/useOfflineDetection';
import { useLocalStorage, useUserPreferences, useProjectCache } from './hooks/useLocalStorage';
import { 
  Folder, MessageSquare, Settings, Play, Save, Eye, Code, Monitor, Bot,
  Wifi, WifiOff, Search, Download, Upload, Share2, RotateCcw, Maximize2,
  Minimize2, Sun, Moon, Bell, BellOff, Zap, Users
} from 'lucide-react';
import collaborationService from './services/collaborationService';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api/v1`;

// Enhanced App component with production features
function AppContent() {
  const [currentProject, setCurrentProject] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(true);
  const [showProjectManager, setShowProjectManager] = useState(true);
  const [layout, setLayout] = useState('code');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(new Set());
  const [lastSaved, setLastSaved] = useState(null);
  const [collaborationEnabled, setCollaborationEnabled] = useState(true);
  
  // Enhanced hooks
  const notifications = useNotifications();
  const { isOnline, checkConnectivity } = useOfflineDetection();
  const [preferences, updatePreference] = useUserPreferences();
  const { cacheProject, getCachedProject, clearProjectCache } = useProjectCache();
  const [recentProjects, setRecentProjects] = useLocalStorage('vibecode_recent_projects', []);
  
  // Auto-save functionality
  const autoSaveTimerRef = useRef(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(preferences.autoSave);

  // Load projects with caching and error handling
  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (!isOnline) {
        // Load from cache when offline
        const cachedProjects = Object.values(getCachedProject('all') || {});
        if (cachedProjects.length > 0) {
          setProjects(cachedProjects);
          notifications.info('Loaded projects from cache (offline mode)');
          return;
        }
      }

      const response = await fetch(`${API}/projects`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setProjects(data);
      
      // Cache projects for offline use
      cacheProject('all', data);
      
      if (!isOnline) {
        notifications.success('Projects loaded successfully');
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      notifications.error(`Failed to load projects: ${error.message}`);
      
      // Try to load from cache on error
      const cachedProjects = getCachedProject('all');
      if (cachedProjects) {
        setProjects(cachedProjects);
        notifications.warning('Loaded cached projects due to connection error');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isOnline, getCachedProject, cacheProject, notifications]);

  // Load project files with enhanced error handling
  const loadProjectFiles = useCallback(async () => {
    if (!currentProject) return;
    
    try {
      setIsLoading(true);
      
      // Check cache first
      const cachedFiles = getCachedProject(currentProject.id);
      if (cachedFiles && !isOnline) {
        setFiles(cachedFiles.files || []);
        notifications.info('Loaded files from cache (offline mode)');
        return;
      }

      const response = await fetch(`${API}/projects/${currentProject.id}/files`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setFiles(data);
      
      // Update cache
      cacheProject(currentProject.id, { ...currentProject, files: data });
      
    } catch (error) {
      console.error('Error loading files:', error);
      notifications.error(`Failed to load files: ${error.message}`);
      
      // Try cache on error
      const cachedProject = getCachedProject(currentProject.id);
      if (cachedProject?.files) {
        setFiles(cachedProject.files);
        notifications.warning('Loaded cached files due to connection error');
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentProject, isOnline, getCachedProject, cacheProject, notifications]);

  // Enhanced project creation with validation
  const createProject = useCallback(async (name, description) => {
    if (!name.trim()) {
      notifications.error('Project name cannot be empty');
      return null;
    }

    if (name.length > 100) {
      notifications.error('Project name is too long (max 100 characters)');
      return null;
    }

    try {
      setIsLoading(true);
      
      if (!isOnline) {
        notifications.error('Cannot create projects while offline');
        return null;
      }

      const response = await fetch(`${API}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description?.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const project = await response.json();
      setProjects(prev => [project, ...prev]);
      setCurrentProject(project);
      
      // Update recent projects
      setRecentProjects(prev => {
        const filtered = prev.filter(p => p.id !== project.id);
        return [project, ...filtered].slice(0, 10);
      });
      
      // Clear cache to force reload
      clearProjectCache('all');
      
      notifications.success(`Project "${name}" created successfully!`, {
        action: {
          label: 'Open',
          onClick: () => openProject(project)
        }
      });
      
      return project;
    } catch (error) {
      console.error('Error creating project:', error);
      notifications.error(`Failed to create project: ${error.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isOnline, notifications, setRecentProjects, clearProjectCache]);

  // Enhanced project opening with recent tracking
  const openProject = useCallback((project) => {
    setCurrentProject(project);
    setCurrentFile(null);
    setUnsavedChanges(new Set());
    
    // Update recent projects
    setRecentProjects(prev => {
      const filtered = prev.filter(p => p.id !== project.id);
      return [project, ...filtered].slice(0, 10);
    });
    
    notifications.ai(`Opened project: ${project.name}`, {
      title: 'Project Loaded'
    });
  }, [setRecentProjects, notifications]);

  // Enhanced file creation
  const createFile = useCallback(async (name, type, parentId = null) => {
    if (!currentProject) return null;
    
    if (!name.trim()) {
      notifications.error('File name cannot be empty');
      return null;
    }

    try {
      setIsLoading(true);
      
      if (!isOnline) {
        notifications.error('Cannot create files while offline');
        return null;
      }

      const response = await fetch(`${API}/projects/${currentProject.id}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), type, parent_id: parentId, content: '' })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const file = await response.json();
      setFiles(prev => [...prev, file]);
      
      if (type === 'file') {
        setCurrentFile(file);
      }
      
      // Clear project cache
      clearProjectCache(currentProject.id);
      
      notifications.success(`${type === 'file' ? 'File' : 'Folder'} "${name}" created successfully!`);
      return file;
    } catch (error) {
      console.error('Error creating file:', error);
      notifications.error(`Failed to create ${type}: ${error.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentProject, isOnline, notifications, clearProjectCache]);

  // Enhanced file opening
  const openFile = useCallback(async (file) => {
    if (file.type !== 'file') return;
    
    try {
      setIsLoading(true);
      
      // Check if file has unsaved changes
      if (unsavedChanges.has(file.id)) {
        const confirmDiscard = window.confirm(
          'You have unsaved changes in the current file. Do you want to discard them?'
        );
        if (!confirmDiscard) {
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch(`${API}/files/${file.id}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const fileData = await response.json();
      setCurrentFile(fileData);
      
      // Remove from unsaved changes if it was there
      setUnsavedChanges(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });
      
      notifications.ai(`Opened file: ${file.name}`);
    } catch (error) {
      console.error('Error opening file:', error);
      notifications.error(`Failed to open file: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [unsavedChanges, notifications]);

  // Enhanced save functionality with auto-save
  const saveFile = useCallback(async (content, showNotification = true) => {
    if (!currentFile) return false;
    
    try {
      if (!isOnline) {
        notifications.error('Cannot save files while offline');
        return false;
      }

      const response = await fetch(`${API}/files/${currentFile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      setCurrentFile({ ...currentFile, content });
      setLastSaved(new Date());
      
      // Remove from unsaved changes
      setUnsavedChanges(prev => {
        const newSet = new Set(prev);
        newSet.delete(currentFile.id);
        return newSet;
      });
      
      if (showNotification) {
        notifications.success('File saved successfully!');
      }
      
      return true;
    } catch (error) {
      console.error('Error saving file:', error);
      notifications.error(`Failed to save file: ${error.message}`);
      return false;
    }
  }, [currentFile, isOnline, notifications]);

  // Auto-save functionality
  const scheduleAutoSave = useCallback(() => {
    if (!autoSaveEnabled || !currentFile) return;
    
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    autoSaveTimerRef.current = setTimeout(() => {
      saveFile(currentFile.content, false);
    }, preferences.autoSaveInterval);
  }, [autoSaveEnabled, currentFile, saveFile, preferences.autoSaveInterval]);

  // Enhanced content change handler
  const handleContentChange = useCallback((content) => {
    if (!currentFile) return;
    
    setCurrentFile({ ...currentFile, content });
    
    // Mark as unsaved
    setUnsavedChanges(prev => new Set(prev).add(currentFile.id));
    
    // Schedule auto-save
    if (autoSaveEnabled) {
      scheduleAutoSave();
    }
  }, [currentFile, autoSaveEnabled, scheduleAutoSave]);

  // Search functionality
  const filteredFiles = files.filter(file => 
    searchQuery === '' || 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            if (currentFile) {
              saveFile(currentFile.content);
            }
            break;
          case 'f':
            e.preventDefault();
            setShowSearch(true);
            break;
          case '`':
            e.preventDefault();
            setShowChat(!showChat);
            break;
          case 'p':
            e.preventDefault();
            setShowPreview(!showPreview);
            break;
          case 'u':
            e.preventDefault();
            setShowCollaboration(!showCollaboration);
            break;
          case 'n':
            if (e.shiftKey) {
              e.preventDefault();
              setShowProjectManager(true);
            }
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [currentFile, showChat, showPreview, saveFile]);

  // Load projects on startup
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Load files when project changes
  useEffect(() => {
    if (currentProject) {
      loadProjectFiles();
      setShowProjectManager(false);
    }
  }, [currentProject, loadProjectFiles]);

  // Cleanup auto-save timer
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Warn about unsaved changes before leaving
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (unsavedChanges.size > 0) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [unsavedChanges]);

  // Project manager view
  if (showProjectManager) {
    return (
      <div className="min-h-screen bg-gray-900">
        <LoadingOverlay isVisible={isLoading} message="Loading projects..." type="default" />
        <ProjectManager
          projects={projects}
          recentProjects={recentProjects}
          onCreateProject={createProject}
          onOpenProject={openProject}
          onClose={() => setShowProjectManager(false)}
          isOnline={isOnline}
        />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      <LoadingOverlay 
        isVisible={isLoading} 
        message="Processing..." 
        type="code" 
      />
      
      {/* Enhanced Header */}
      <header className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-blue-400 flex items-center space-x-2">
            <Zap size={20} />
            <span>VibeCode</span>
          </h1>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">
              {currentProject ? currentProject.name : 'No project'}
            </span>
            
            {currentFile && (
              <>
                <span className="text-gray-500">/</span>
                <span className="text-sm text-gray-300">
                  {currentFile.name}
                  {unsavedChanges.has(currentFile.id) && (
                    <span className="text-yellow-400 ml-1">•</span>
                  )}
                </span>
              </>
            )}
            
            {lastSaved && (
              <span className="text-xs text-gray-500">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
          
          {/* Connection status */}
          <div className="flex items-center space-x-1">
            {isOnline ? (
              <Wifi size={14} className="text-green-400" title="Online" />
            ) : (
              <WifiOff size={14} className="text-red-400" title="Offline" />
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Search */}
          {showSearch && (
            <div className="flex items-center bg-gray-700 rounded px-2 py-1">
              <Search size={14} className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-white text-sm outline-none w-32"
                onBlur={() => {
                  if (!searchQuery) setShowSearch(false);
                }}
                autoFocus
              />
            </div>
          )}
          
          {!showSearch && (
            <button 
              onClick={() => setShowSearch(true)}
              className="p-2 hover:bg-gray-700 rounded"
              title="Search files (Ctrl+F)"
            >
              <Search size={16} />
            </button>
          )}
          
          <button 
            onClick={() => setShowProjectManager(true)}
            className="p-2 hover:bg-gray-700 rounded"
            title="Projects"
          >
            <Folder size={16} />
          </button>
          
          <button 
            onClick={() => setShowPreview(!showPreview)}
            className={`p-2 hover:bg-gray-700 rounded ${showPreview ? 'text-green-400' : ''}`}
            title="Live Preview (Ctrl+P)"
          >
            <Eye size={16} />
          </button>
          
          <button 
            onClick={() => setShowCollaboration(!showCollaboration)}
            className={`p-2 hover:bg-gray-700 rounded ${showCollaboration ? 'text-green-400' : ''}`}
            title="Collaboration Panel (Ctrl+U)"
          >
            <Users size={16} />
          </button>
          
          <button 
            onClick={() => setShowChat(!showChat)}
            className={`p-2 hover:bg-gray-700 rounded ${showChat ? 'text-purple-400' : ''}`}
            title="AI Assistant (Ctrl+`)"
          >
            <Bot size={16} />
          </button>

          {/* Layout Toggle */}
          {showPreview && (
            <div className="flex bg-gray-700 rounded-lg p-1 ml-2">
              {[
                { id: 'code', label: 'Code', icon: Code },
                { id: 'split', label: 'Split', icon: Monitor },
                { id: 'preview', label: 'Preview', icon: Eye }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setLayout(id)}
                  className={`px-2 py-1 rounded text-xs flex items-center space-x-1 transition-colors ${
                    layout === id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Icon size={12} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Auto-save toggle */}
          <button
            onClick={() => {
              setAutoSaveEnabled(!autoSaveEnabled);
              updatePreference('autoSave', !autoSaveEnabled);
            }}
            className={`p-2 hover:bg-gray-700 rounded text-xs ${
              autoSaveEnabled ? 'text-green-400' : 'text-gray-400'
            }`}
            title={`Auto-save ${autoSaveEnabled ? 'enabled' : 'disabled'}`}
          >
            <RotateCcw size={14} />
          </button>
          
          {currentFile && (
            <button 
              onClick={() => saveFile(currentFile.content)}
              className={`p-2 hover:bg-gray-700 rounded ${
                unsavedChanges.has(currentFile.id) 
                  ? 'text-green-400' 
                  : 'text-gray-400'
              }`}
              disabled={!unsavedChanges.has(currentFile.id)}
              title="Save File (Ctrl+S)"
            >
              <Save size={16} />
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="p-3 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-300">Explorer</h2>
            <span className="text-xs text-gray-500">
              {files.length} item{files.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex-1 overflow-auto">
            {currentProject && (
              <FileExplorer
                files={searchQuery ? filteredFiles : files}
                onCreateFile={createFile}
                onOpenFile={openFile}
                currentFile={currentFile}
                searchQuery={searchQuery}
                unsavedChanges={unsavedChanges}
              />
            )}
          </div>
        </div>

        {/* Editor and Preview Area */}
        <div className="flex-1 flex flex-col">
          {currentFile ? (
            <div className="flex-1 flex">
              {/* Code Editor */}
              {(layout === 'code' || layout === 'split') && (
                <div className={layout === 'split' ? 'flex-1' : 'w-full'}>
                  <CollaborativeCodeEditor
                    file={currentFile}
                    onSave={saveFile}
                    onContentChange={handleContentChange}
                    preferences={preferences}
                    isOnline={isOnline}
                    autoSaveEnabled={autoSaveEnabled}
                  />
                </div>
              )}
              
              {/* Live Preview */}
              {showPreview && (layout === 'preview' || layout === 'split') && (
                <div className={layout === 'split' ? 'flex-1 border-l border-gray-700' : 'w-full'}>
                  <AppPreview
                    currentFile={currentFile}
                    files={files}
                    project={currentProject}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <div className="text-6xl text-gray-600 mb-4">⚡</div>
                <h2 className="text-2xl font-bold text-gray-400 mb-2">Welcome to VibeCode</h2>
                <p className="text-gray-500 mb-6">
                  {currentProject 
                    ? 'Select a file from the explorer to start coding'
                    : 'Create or select a project to get started'
                  }
                </p>
                
                {/* Quick actions */}
                <div className="flex flex-col space-y-2 max-w-sm mx-auto">
                  {!currentProject && (
                    <button
                      onClick={() => setShowProjectManager(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                      Open Project Manager
                    </button>
                  )}
                  
                  {currentProject && (
                    <div className="text-sm text-gray-600">
                      <p className="mb-3">✨ Available features:</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-center space-x-2">
                          <Bot size={16} className="text-purple-400" />
                          <span>meta-llama/llama-4-maverick AI Assistant</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <Eye size={16} className="text-green-400" />
                          <span>Real-time Live Preview</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <Code size={16} className="text-blue-400" />
                          <span>Advanced Code Completion</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <Zap size={16} className="text-yellow-400" />
                          <span>Performance Analysis</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Keyboard shortcuts */}
                <div className="mt-8 text-xs text-gray-600">
                  <p className="mb-2">Keyboard shortcuts:</p>
                  <div className="space-y-1">
                    <div>Ctrl+S - Save file</div>
                    <div>Ctrl+F - Search files</div>
                    <div>Ctrl+` - Toggle AI chat</div>
                    <div>Ctrl+P - Toggle preview</div>
                    <div>Ctrl+U - Toggle collaboration</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Chat Panel */}
        {showChat && (
          <div className="w-80 bg-gray-800 border-l border-gray-700">
            <AIChat 
              currentFile={currentFile} 
              isOnline={isOnline}
              preferences={preferences}
            />
          </div>
        )}
        
        {/* Collaboration Panel */}
        {showCollaboration && (
          <div className="w-80">
            <CollaborationPanel
              project={currentProject}
              currentFile={currentFile}
              isVisible={showCollaboration}
              onToggle={() => setShowCollaboration(!showCollaboration)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Main App component with error boundary and providers
function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;