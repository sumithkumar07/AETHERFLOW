import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import FileExplorer from './components/FileExplorer';
import CollaborativeCodeEditor from './components/CollaborativeCodeEditor';
import AIChat from './components/AIChat';
import AppPreview from './components/AppPreview';
import ProjectManager from './components/ProjectManager';
import CollaborationPanel from './components/CollaborationPanel';
import ProfessionalToolsPanel from './components/ProfessionalToolsPanel';
import CommandPalette from './components/CommandPalette';
import IntegratedTerminal from './components/IntegratedTerminal';
import EnhancedStatusBar from './components/EnhancedStatusBar';
import GitIntegrationPanel from './components/GitIntegrationPanel';
import ErrorBoundary from './components/ErrorBoundary';
import NotificationProvider, { useNotifications } from './components/NotificationSystem';
import LoadingSpinner, { LoadingOverlay } from './components/LoadingSpinner';
import useOfflineDetection from './hooks/useOfflineDetection';
import useLocalStorage, { useUserPreferences, useProjectCache } from './hooks/useLocalStorage';
import cosmicEngine from './services/cosmicVibeEngine';
import { 
  Folder, MessageSquare, Settings, Play, Save, Eye, Code, Monitor, Bot,
  Wifi, WifiOff, Search, Download, Upload, Share2, RotateCcw, Maximize2,
  Minimize2, Sun, Moon, Bell, BellOff, Zap, Users, Sparkles, Crown,
  Layers, Grid3X3, Terminal, GitBranch, Star, Award, Target, Gauge,
  ChevronRight, Menu, X, Plus, Home
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api/v1`;

// Professional App Component with Modern Design
function AppContent() {
  // Core state
  const [currentProject, setCurrentProject] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(true);
  const [showToolsPanel, setShowToolsPanel] = useState(false);
  const [showProjectManager, setShowProjectManager] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [layout, setLayout] = useState('code');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showGitPanel, setShowGitPanel] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(300);
  
  // Professional UI state
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(new Set());
  const [lastSaved, setLastSaved] = useState(null);
  
  // Professional features (transformed from cosmic)
  const [darkMode, setDarkMode] = useState(true);
  const [credits, setCredits] = useState(1000);
  const [userLevel, setUserLevel] = useState('Developer');
  const [focusMode, setFocusMode] = useState(false);
  const [currentAssistant, setCurrentAssistant] = useState(null);
  const [professionalMode, setProfessionalMode] = useState(true);
  
  // Enhanced hooks
  const notifications = useNotifications();
  const { isOnline, checkConnectivity } = useOfflineDetection();
  const [preferences, updatePreference] = useUserPreferences();
  const { cacheProject, getCachedProject, clearProjectCache } = useProjectCache();
  const [recentProjects, setRecentProjects] = useLocalStorage('aetherflow_recent_projects', []);
  
  // Auto-save functionality
  const autoSaveTimerRef = useRef(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(preferences.autoSave ?? true);

  // Initialize services
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        
        // Initialize enhanced engine (keeping backend functionality)
        if (!cosmicEngine.isInitialized) {
          await cosmicEngine.initializeCosmicEngine();
        }
        
        if (cosmicEngine.isInitialized) {
          setCredits(cosmicEngine.getVibeTokenBalance());
          const karma = cosmicEngine.updateKarmaLevel();
          setUserLevel(mapKarmaToLevel(karma?.level || 'Novice'));
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('App initialization failed:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Map cosmic levels to professional levels
  const mapKarmaToLevel = (karmaLevel) => {
    const levelMap = {
      'Novice': 'Junior Developer',
      'Apprentice': 'Developer', 
      'Journeyman': 'Senior Developer',
      'Expert': 'Lead Developer',
      'Master': 'Principal Engineer',
      'Grandmaster': 'Staff Engineer',
      'Cosmic Entity': 'Distinguished Engineer'
    };
    return levelMap[karmaLevel] || 'Developer';
  };

  // Professional Action Handler (transformed from cosmic handler)
  const handleProfessionalAction = useCallback((action) => {
    console.log('🚀 Professional Action:', action);
    
    switch (action.type) {
      case 'assistant_activated':
        setCurrentAssistant(action.assistant);
        notifications.addNotification({
          type: 'success',
          title: 'AI Assistant Activated',
          message: `${action.assistant.name} is now assisting you!`
        });
        break;
        
      case 'credits_earned':
        setCredits(prev => prev + action.result.earned);
        notifications.addNotification({
          type: 'info',
          title: 'Credits Earned',
          message: `Earned ${action.result.earned} credits!`
        });
        break;
        
      case 'stress_test_activated':
        notifications.addNotification({
          type: 'warning',
          title: 'Stress Test Active',
          message: action.test.scenario,
          duration: 10000
        });
        break;
        
      case 'focus_mode_activated':
        setFocusMode(true);
        notifications.addNotification({
          type: 'success',
          title: 'Focus Mode Activated',
          message: 'Enhanced productivity mode enabled!'
        });
        setTimeout(() => setFocusMode(false), action.bonuses?.duration || 30000);
        break;
        
      case 'code_analysis':
        notifications.addNotification({
          type: 'info',
          title: 'Code Analysis Complete',
          message: `Analysis: ${action.analysis.summary}`
        });
        break;
        
      default:
        console.log('Unknown professional action:', action);
    }
  }, [notifications]);

  // Load projects with caching and error handling
  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (!isOnline) {
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
      cacheProject('all', data);
      
    } catch (error) {
      console.error('Error loading projects:', error);
      notifications.error(`Failed to load projects: ${error.message}`);
      
      const cachedProjects = getCachedProject('all');
      if (cachedProjects) {
        setProjects(cachedProjects);
        notifications.warning('Loaded cached projects due to connection error');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isOnline, getCachedProject, cacheProject, notifications]);

  // Load project files
  const loadProjectFiles = useCallback(async () => {
    if (!currentProject) return;
    
    try {
      setIsLoading(true);
      
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
      cacheProject(currentProject.id, { ...currentProject, files: data });
      
    } catch (error) {
      console.error('Error loading files:', error);
      notifications.error(`Failed to load files: ${error.message}`);
      
      const cachedProject = getCachedProject(currentProject.id);
      if (cachedProject?.files) {
        setFiles(cachedProject.files);
        notifications.warning('Loaded cached files due to connection error');
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentProject, isOnline, getCachedProject, cacheProject, notifications]);

  // Create project
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
      
      setRecentProjects(prev => {
        const filtered = prev.filter(p => p.id !== project.id);
        return [project, ...filtered].slice(0, 10);
      });
      
      clearProjectCache('all');
      
      // Award credits for project creation
      if (cosmicEngine.isInitialized) {
        const mined = cosmicEngine.mineVibeTokens(100, `Created project: ${name}`);
        setCredits(mined.balance);
      }
      
      notifications.success(`Project "${name}" created successfully!`);
      return project;
    } catch (error) {
      console.error('Error creating project:', error);
      notifications.error(`Failed to create project: ${error.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isOnline, notifications, setRecentProjects, clearProjectCache]);

  // Open project
  const openProject = useCallback((project) => {
    setCurrentProject(project);
    setCurrentFile(null);
    setUnsavedChanges(new Set());
    
    setRecentProjects(prev => {
      const filtered = prev.filter(p => p.id !== project.id);
      return [project, ...filtered].slice(0, 10);
    });
    
    if (cosmicEngine.isInitialized) {
      const mined = cosmicEngine.mineVibeTokens(25, `Opened project: ${project.name}`);
      setCredits(mined.balance);
    }
    
    notifications.info(`Opened project: ${project.name}`);
  }, [setRecentProjects, notifications]);

  // Create file
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
      
      clearProjectCache(currentProject.id);
      
      if (cosmicEngine.isInitialized) {
        const mined = cosmicEngine.mineVibeTokens(10, `Created ${type}: ${name}`);
        setCredits(mined.balance);
      }
      
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

  // Open file
  const openFile = useCallback(async (file) => {
    if (file.type !== 'file') return;
    
    try {
      setIsLoading(true);
      
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
      
      setUnsavedChanges(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });
      
      if (cosmicEngine.isInitialized) {
        const mined = cosmicEngine.mineVibeTokens(5, `Opened file: ${file.name}`);
        setCredits(mined.balance);
      }
      
    } catch (error) {
      console.error('Error opening file:', error);
      notifications.error(`Failed to open file: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [unsavedChanges, notifications]);

  // Save file
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
      
      setUnsavedChanges(prev => {
        const newSet = new Set(prev);
        newSet.delete(currentFile.id);
        return newSet;
      });
      
      if (cosmicEngine.isInitialized) {
        const mined = cosmicEngine.mineVibeTokens(15, `Saved file: ${currentFile.name}`);
        setCredits(mined.balance);
      }
      
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

  // Content change handler
  const handleContentChange = useCallback((content) => {
    if (!currentFile) return;
    
    setCurrentFile({ ...currentFile, content });
    setUnsavedChanges(prev => new Set(prev).add(currentFile.id));
    
    if (autoSaveEnabled) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      autoSaveTimerRef.current = setTimeout(() => {
        saveFile(content, false);
      }, 2000);
    }
  }, [currentFile, autoSaveEnabled, saveFile]);

  // Handle commands from palette and other sources
  const handleCommand = useCallback((command) => {
    console.log('🎯 Executing command:', command);
    
    switch (command.id) {
      case 'file.new':
        createFile('untitled.js', 'file');
        break;
      case 'file.save':
        if (currentFile) saveFile(currentFile.content);
        break;
      case 'view.terminal':
        setShowTerminal(!showTerminal);
        break;
      case 'view.sidebar':
        setSidebarCollapsed(!sidebarCollapsed);
        break;
      case 'view.preview':
        setShowPreview(!showPreview);
        break;
      case 'view.commandPalette':
        setShowCommandPalette(true);
        break;
      case 'git.status':
        setShowGitPanel(true);
        break;
      case 'tools.settings':
        setShowToolsPanel(true);
        break;
      default:
        if (command.id.startsWith('file.open.')) {
          openFile(command.file);
        } else {
          handleProfessionalAction(command);
        }
    }
  }, [createFile, saveFile, currentFile, showTerminal, sidebarCollapsed, showPreview, openFile, handleProfessionalAction]);

  // Search functionality
  const filteredFiles = files.filter(file => 
    searchQuery === '' || 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Professional keyboard shortcuts
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
          case 'p':
            if (e.shiftKey) {
              e.preventDefault();
              setShowCommandPalette(true);
            } else {
              e.preventDefault();
              setShowPreview(!showPreview);
            }
            break;
          case '`':
            e.preventDefault();
            setShowTerminal(!showTerminal);
            break;
          case 'j':
            e.preventDefault();
            setShowChat(!showChat);
            break;
          case 'b':
            e.preventDefault();
            setSidebarCollapsed(!sidebarCollapsed);
            break;
          case 'g':
            if (e.shiftKey) {
              e.preventDefault();
              setShowGitPanel(!showGitPanel);
            }
            break;
          case ',':
            e.preventDefault();
            setShowToolsPanel(!showToolsPanel);
            break;
          default:
            break;
        }
      }
      
      if (e.altKey) {
        switch (e.key) {
          case 'f':
            e.preventDefault();
            setFocusMode(!focusMode);
            break;
          default:
            break;
        }
      }

      if (e.key === 'Escape') {
        setShowCommandPalette(false);
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [currentFile, showChat, showPreview, sidebarCollapsed, showToolsPanel, focusMode, showTerminal, showGitPanel, showCommandPalette, saveFile]);

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

  // Project manager view
  if (showProjectManager) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-900">
        <LoadingOverlay isVisible={isLoading} message="Loading projects..." />
        <ProjectManager
          projects={projects}
          recentProjects={recentProjects}
          onCreateProject={createProject}
          onOpenProject={openProject}
          onClose={() => setShowProjectManager(false)}
          isOnline={isOnline}
          professionalMode={true}
        />
      </div>
    );
  }

  return (
    <div className={`h-screen text-white flex flex-col bg-gradient-to-br from-slate-900 to-gray-900 ${focusMode ? 'focus-mode' : ''}`}>
      <LoadingOverlay isVisible={isLoading} message="Processing..." />
      
      {/* Professional Header */}
      <header className="professional-header">
        <div className="header-content">
          <div className="flex items-center space-x-4">
            <div className="logo">
              <Zap size={24} />
              <span>AETHERFLOW</span>
            </div>
            
            <nav className="breadcrumb">
              <Home size={16} />
              {currentProject && (
                <>
                  <ChevronRight size={16} className="breadcrumb-separator" />
                  <span>{currentProject.name}</span>
                </>
              )}
              {currentFile && (
                <>
                  <ChevronRight size={16} className="breadcrumb-separator" />
                  <span className="flex items-center gap-1">
                    {currentFile.name}
                    {unsavedChanges.has(currentFile.id) && (
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    )}
                  </span>
                </>
              )}
            </nav>
            
            {lastSaved && (
              <span className="text-xs text-gray-400">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Status indicators */}
            <div className="flex items-center space-x-2">
              {currentAssistant && (
                <div className="flex items-center space-x-1 text-xs bg-blue-600/20 px-2 py-1 rounded-md">
                  <Bot size={12} className="text-blue-400" />
                  <span className="text-blue-300">{currentAssistant.name}</span>
                </div>
              )}
              
              {focusMode && (
                <div className="flex items-center space-x-1 text-xs bg-green-600/20 px-2 py-1 rounded-md">
                  <Target size={12} className="text-green-400" />
                  <span className="text-green-300">Focus</span>
                </div>
              )}
              
              <div className="credits-display">
                <Star size={12} />
                <span>{credits}</span>
              </div>
              
              <div className="flex items-center space-x-1 text-xs bg-purple-600/20 px-2 py-1 rounded-md">
                <Award size={12} className="text-purple-400" />
                <span className="text-purple-300">{userLevel}</span>
              </div>
              
              <div className="status-item">
                {isOnline ? (
                  <Wifi size={14} className="text-green-400" />
                ) : (
                  <WifiOff size={14} className="text-red-400" />
                )}
              </div>
            </div>
            
            {/* Search */}
            {showSearch && (
              <div className="glass-surface px-3 py-1">
                <div className="flex items-center">
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
              </div>
            )}
            
            {/* Action buttons */}
            <button 
              onClick={() => setShowTerminal(!showTerminal)}
              className={`btn btn-ghost btn-sm ${showTerminal ? 'text-green-400' : ''}`}
              title="Toggle Terminal (Ctrl+`)"
            >
              <Terminal size={16} />
            </button>

            <button 
              onClick={() => setShowGitPanel(!showGitPanel)}
              className={`btn btn-ghost btn-sm ${showGitPanel ? 'text-purple-400' : ''}`}
              title="Source Control (Ctrl+Shift+G)"
            >
              <GitBranch size={16} />
            </button>
            
            <button 
              onClick={() => setShowCommandPalette(true)}
              className="btn btn-ghost btn-sm"
              title="Command Palette (Ctrl+Shift+P)"
            >
              <Search size={16} />
            </button>
            
            <button 
              onClick={() => setShowProjectManager(true)}
              className="btn btn-ghost btn-sm"
              title="Projects"
            >
              <Folder size={16} />
            </button>
            
            <button 
              onClick={() => setShowPreview(!showPreview)}
              className={`btn btn-ghost btn-sm ${showPreview ? 'text-green-400' : ''}`}
              title="Live Preview (Ctrl+P)"
            >
              <Eye size={16} />
            </button>
            
            <button 
              onClick={() => setShowCollaboration(!showCollaboration)}
              className={`btn btn-ghost btn-sm ${showCollaboration ? 'text-green-400' : ''}`}
              title="Collaboration"
            >
              <Users size={16} />
            </button>
            
            <button 
              onClick={() => setShowChat(!showChat)}
              className={`btn btn-ghost btn-sm ${showChat ? 'text-blue-400' : ''}`}
              title="AI Assistant (Ctrl+`)"
            >
              <Bot size={16} />
            </button>
            
            <button 
              onClick={() => setShowToolsPanel(!showToolsPanel)}
              className={`btn btn-ghost btn-sm ${showToolsPanel ? 'text-purple-400' : ''}`}
              title="Professional Tools (Ctrl+,)"
            >
              <Settings size={16} />
            </button>

            {/* Layout toggle */}
            {showPreview && (
              <div className="flex bg-gray-700/50 rounded-lg p-1">
                {[
                  { id: 'code', label: 'Code', icon: Code },
                  { id: 'split', label: 'Split', icon: Monitor },
                  { id: 'preview', label: 'Preview', icon: Eye }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setLayout(id)}
                    className={`px-2 py-1 rounded text-xs flex items-center space-x-1 transition-all ${
                      layout === id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <Icon size={12} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}

            {currentFile && (
              <button 
                onClick={() => saveFile(currentFile.content)}
                className={`btn btn-sm ${
                  unsavedChanges.has(currentFile.id) 
                    ? 'btn-primary' 
                    : 'btn-ghost'
                }`}
                disabled={!unsavedChanges.has(currentFile.id)}
                title="Save File (Ctrl+S)"
              >
                <Save size={16} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Professional Sidebar */}
        <div className={`professional-sidebar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="sidebar-header">
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="btn btn-ghost btn-sm"
              >
                {sidebarCollapsed ? <Menu size={16} /> : <X size={16} />}
              </button>
              {!sidebarCollapsed && (
                <>
                  <h2 className="text-sm font-medium text-gray-300">Explorer</h2>
                  <span className="text-xs text-gray-500 ml-auto">
                    {files.length} item{files.length !== 1 ? 's' : ''}
                  </span>
                </>
              )}
            </div>
          </div>
          
          {!sidebarCollapsed && (
            <div className="sidebar-content">
              {currentProject && (
                <FileExplorer
                  files={searchQuery ? filteredFiles : files}
                  onCreateFile={createFile}
                  onOpenFile={openFile}
                  currentFile={currentFile}
                  searchQuery={searchQuery}
                  unsavedChanges={unsavedChanges}
                  professionalMode={true}
                />
              )}
            </div>
          )}
        </div>

        {/* Editor Panel */}
        <div className="editor-panel">
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
                    professionalMode={true}
                    currentAssistant={currentAssistant}
                    focusMode={focusMode}
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
                    professionalMode={true}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="welcome-screen">
              <div className="welcome-logo">
                <Zap />
              </div>
              <h1 className="welcome-title">Welcome to AETHERFLOW</h1>
              <p className="welcome-subtitle">
                Professional development environment for modern developers
              </p>
              
              <div className="quick-actions">
                {!currentProject ? (
                  <button
                    onClick={() => setShowProjectManager(true)}
                    className="feature-card hover:border-primary-500 cursor-pointer"
                  >
                    <div className="feature-icon">
                      <Folder size={24} />
                    </div>
                    <h3 className="font-semibold mb-2">Open Project</h3>
                    <p className="text-sm text-gray-400">Start coding with an existing project</p>
                  </button>
                ) : (
                  <button
                    onClick={() => createFile('index.js', 'file')}
                    className="feature-card hover:border-primary-500 cursor-pointer"
                  >
                    <div className="feature-icon">
                      <Plus size={24} />
                    </div>
                    <h3 className="font-semibold mb-2">New File</h3>
                    <p className="text-sm text-gray-400">Create a new file to start coding</p>
                  </button>
                )}
                
                <div className="feature-card">
                  <div className="feature-icon">
                    <Bot size={24} />
                  </div>
                  <h3 className="font-semibold mb-2">AI Assistant</h3>
                  <p className="text-sm text-gray-400">Get help with coding and debugging</p>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon">
                    <Eye size={24} />
                  </div>
                  <h3 className="font-semibold mb-2">Live Preview</h3>
                  <p className="text-sm text-gray-400">See your changes in real-time</p>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon">
                    <Users size={24} />
                  </div>
                  <h3 className="font-semibold mb-2">Collaboration</h3>
                  <p className="text-sm text-gray-400">Work together with your team</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Assistant Panel */}
        {showChat && (
          <div className="ai-panel">
            <AIChat 
              currentFile={currentFile} 
              isOnline={isOnline}
              preferences={preferences}
              professionalMode={true}
              currentAssistant={currentAssistant}
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
              professionalMode={true}
            />
          </div>
        )}
        
        {/* Professional Tools Panel */}
        {showToolsPanel && (
          <ProfessionalToolsPanel
            onAction={handleProfessionalAction}
            isVisible={showToolsPanel}
            onClose={() => setShowToolsPanel(false)}
            credits={credits}
            userLevel={userLevel}
            currentAssistant={currentAssistant}
          />
        )}
      </div>
      
      {/* Status Bar */}
      <div className="status-bar">
        <div className="flex items-center space-x-4">
          <div className="status-item">
            <div className={`status-indicator ${isOnline ? 'status-online' : 'status-offline'}`}></div>
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          
          {currentFile && (
            <div className="status-item">
              <Code size={12} />
              <span>{currentFile.name}</span>
            </div>
          )}
          
          <div className="status-item">
            <Gauge size={12} />
            <span>{userLevel}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {autoSaveEnabled && (
            <div className="status-item">
              <RotateCcw size={12} />
              <span>Auto-save on</span>
            </div>
          )}
          
          <div className="status-item">
            <Star size={12} />
            <span>{credits} credits</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App component with providers
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