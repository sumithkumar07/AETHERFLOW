import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import FileExplorer from './components/FileExplorer';
import CollaborativeCodeEditor from './components/CollaborativeCodeEditor';
import AIChat from './components/AIChat';
import AppPreview from './components/AppPreview';
import EnhancedProjectManager from './components/EnhancedProjectManager';
import CollaborationPanel from './components/CollaborationPanel';
import ProfessionalToolsPanel from './components/ProfessionalToolsPanel';
import CommandPalette from './components/CommandPalette';
import IntegratedTerminal from './components/IntegratedTerminal';
import EnhancedStatusBar from './components/EnhancedStatusBar';
import GitIntegrationPanel from './components/GitIntegrationPanel';
import EnhancedSettingsPage from './components/EnhancedSettingsPage';
import GlobalSearchInterface from './components/GlobalSearchInterface';
import DebugInterface from './components/DebugInterface';
import PackageManager from './components/PackageManager';
import EnhancedExtensionsMarketplace from './components/EnhancedExtensionsMarketplace';
import EnhancedTemplatesGallery from './components/EnhancedTemplatesGallery';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import DeploymentDashboard from './components/DeploymentDashboard';
import CommunityDiscovery from './components/CommunityDiscovery';
import AIChatHistory from './components/AIChatHistory';
import ErrorBoundary from './components/ErrorBoundary';
import NotificationProvider, { useNotifications } from './components/NotificationSystem';
import LoadingSpinner, { LoadingOverlay } from './components/LoadingSpinner';
import useOfflineDetection from './hooks/useOfflineDetection';
import useLocalStorage, { useUserPreferences, useProjectCache } from './hooks/useLocalStorage';
import cosmicEngine from './services/cosmicVibeEngine';

// Import 2025 cutting-edge components
import { IDELoadingScreen, CardSkeleton } from './components/EnhancedLoadingComponents';
import { InteractiveButton, InteractiveCard } from './components/MicroInteractions';
import AIPairProgramming from './components/AIPairProgramming';
import VoiceToCode from './components/VoiceToCode';
import { 
  Folder, MessageSquare, Settings, Play, Save, Eye, Code, Monitor, Bot,
  Wifi, WifiOff, Search, Download, Upload, Share2, RotateCcw, Maximize2,
  Minimize2, Sun, Moon, Bell, BellOff, Zap, Users, Sparkles, Crown,
  Layers, Grid3X3, Terminal, GitBranch, Star, Award, Target, Gauge,
  ChevronRight, Menu, X, Plus, Home, Package, BarChart3, Rocket, Clock,
  Brain, Mic, Volume2, VolumeX, Waves
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
  
  // New AETHERFLOW 2025 Features
  const [showExtensionsMarketplace, setShowExtensionsMarketplace] = useState(false);
  const [showTemplatesGallery, setShowTemplatesGallery] = useState(false);
  const [showAnalyticsDashboard, setShowAnalyticsDashboard] = useState(false);
  const [showDeploymentDashboard, setShowDeploymentDashboard] = useState(false);
  const [showCommunityDiscovery, setShowCommunityDiscovery] = useState(false);
  const [showAIChatHistory, setShowAIChatHistory] = useState(false);
  
  // 2025 Cutting-edge Features
  const [showAIPairProgramming, setShowAIPairProgramming] = useState(false);
  const [showVoiceToCode, setShowVoiceToCode] = useState(false);
  const [enhancedUXEnabled, setEnhancedUXEnabled] = useState(true);
  const [appInitialized, setAppInitialized] = useState(false);
  
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

  // Handlers for 2025 cutting-edge features
  const handleCodeGenerated = useCallback((code, position = null) => {
    if (!currentFile || !code) return;
    
    let newContent = currentFile.content;
    
    if (position && position.line !== undefined) {
      // Insert code at specific position
      const lines = newContent.split('\n');
      lines.splice(position.line, 0, code);
      newContent = lines.join('\n');
    } else {
      // Append code at the end
      newContent += '\n\n' + code;
    }
    
    handleContentChange(newContent);
    notifications.success('AI-generated code inserted successfully!');
  }, [currentFile, handleContentChange, notifications]);

  const handleVoiceCommand = useCallback((action, parameters = {}) => {
    console.log('🎤 Voice command:', action, parameters);
    
    switch (action) {
      case 'search':
        setSearchQuery(parameters.query || '');
        setShowSearch(true);
        break;
      case 'open_settings':
        setShowToolsPanel(true);
        break;
      case 'open_file_explorer':
        setSidebarCollapsed(false);
        break;
      case 'file_operation':
        if (parameters.operation === 'save' && currentFile) {
          saveFile(currentFile.content);
        }
        break;
      default:
        console.log('Unknown voice command:', action);
    }
  }, [currentFile, saveFile]);

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
          case 'e':
            e.preventDefault();
            setShowExtensionsMarketplace(!showExtensionsMarketplace);
            break;
          case 't':
            e.preventDefault();
            setShowTemplatesGallery(!showTemplatesGallery);
            break;
          case 'a':
            e.preventDefault();
            setShowAnalyticsDashboard(!showAnalyticsDashboard);
            break;
          case 'd':
            e.preventDefault();
            setShowDeploymentDashboard(!showDeploymentDashboard);
            break;
          case 'c':
            e.preventDefault();
            setShowCommunityDiscovery(!showCommunityDiscovery);
            break;
          case 'h':
            e.preventDefault();
            setShowAIChatHistory(!showAIChatHistory);
            break;
          case 'ai': // Alt+AI (may not work, but keeping for reference)
          case 'i':
            e.preventDefault();
            setShowAIPairProgramming(!showAIPairProgramming);
            break;
          case 'v':
            e.preventDefault();
            setShowVoiceToCode(!showVoiceToCode);
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
  }, [currentFile, showChat, showPreview, sidebarCollapsed, showToolsPanel, focusMode, showTerminal, showGitPanel, showCommandPalette, saveFile, showExtensionsMarketplace, showTemplatesGallery, showAnalyticsDashboard, showDeploymentDashboard, showCommunityDiscovery, showAIChatHistory, showAIPairProgramming, showVoiceToCode]);

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
        <EnhancedProjectManager
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

            {/* New AETHERFLOW 2025 Feature Buttons */}
            <div className="border-l border-gray-600 mx-2 h-6"></div>
            
            <button 
              onClick={() => setShowExtensionsMarketplace(!showExtensionsMarketplace)}
              className={`btn btn-ghost btn-sm ${showExtensionsMarketplace ? 'text-green-400' : ''}`}
              title="Extensions Marketplace (Alt+E)"
            >
              <Package size={16} />
            </button>
            
            <button 
              onClick={() => setShowTemplatesGallery(!showTemplatesGallery)}
              className={`btn btn-ghost btn-sm ${showTemplatesGallery ? 'text-orange-400' : ''}`}
              title="Templates Gallery (Alt+T)"
            >
              <Grid3X3 size={16} />
            </button>
            
            <button 
              onClick={() => setShowAnalyticsDashboard(!showAnalyticsDashboard)}
              className={`btn btn-ghost btn-sm ${showAnalyticsDashboard ? 'text-blue-400' : ''}`}
              title="Analytics Dashboard (Alt+A)"
            >
              <BarChart3 size={16} />
            </button>
            
            <button 
              onClick={() => setShowDeploymentDashboard(!showDeploymentDashboard)}
              className={`btn btn-ghost btn-sm ${showDeploymentDashboard ? 'text-red-400' : ''}`}
              title="Deployment Dashboard (Alt+D)"
            >
              <Rocket size={16} />
            </button>
            
            <button 
              onClick={() => setShowCommunityDiscovery(!showCommunityDiscovery)}
              className={`btn btn-ghost btn-sm ${showCommunityDiscovery ? 'text-yellow-400' : ''}`}
              title="Community Discovery (Alt+C)"
            >
              <Users size={16} />
            </button>
            
            <button 
              onClick={() => setShowAIChatHistory(!showAIChatHistory)}
              className={`btn btn-ghost btn-sm ${showAIChatHistory ? 'text-purple-400' : ''}`}
              title="AI Chat History (Alt+H)"
            >
              <Clock size={16} />
            </button>

            {/* 2025 Cutting-edge Feature Buttons */}
            <div className="border-l border-gray-600 mx-2 h-6"></div>
            
            <button 
              onClick={() => setShowAIPairProgramming(!showAIPairProgramming)}
              className={`btn btn-ghost btn-sm ${showAIPairProgramming ? 'text-green-400' : ''}`}
              title="AI Pair Programming (Alt+AI)"
            >
              <Brain size={16} />
            </button>
            
            <button 
              onClick={() => setShowVoiceToCode(!showVoiceToCode)}
              className={`btn btn-ghost btn-sm ${showVoiceToCode ? 'text-blue-400' : ''}`}
              title="Voice-to-Code (Alt+V)"
            >
              <Mic size={16} />
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
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex overflow-hidden">
          {/* Professional Sidebar */}
          <div className={`professional-sidebar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <div className="sidebar-header">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="btn btn-ghost btn-sm"
                  title="Toggle Sidebar (Ctrl+B)"
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

          {/* Git Panel */}
          {showGitPanel && (
            <GitIntegrationPanel
              isVisible={showGitPanel}
              onToggle={() => setShowGitPanel(!showGitPanel)}
              currentProject={currentProject}
              onCommand={handleCommand}
            />
          )}

          {/* Editor Panel */}
          <div className="editor-panel">
            {currentFile ? (
              <div className="flex-1 flex flex-col">
                {/* Editor Tabs */}
                <div className="editor-tabs">
                  <div className="editor-tab active">
                    <Code size={14} />
                    <span>{currentFile.name}</span>
                    {unsavedChanges.has(currentFile.id) && (
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    )}
                  </div>
                </div>

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

                {/* Keyboard Shortcuts Reference */}
                <div className="mt-8 p-4 bg-slate-800/50 rounded-xl">
                  <h4 className="text-lg font-semibold mb-4 text-center">Keyboard Shortcuts</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Command Palette</span>
                        <span className="text-gray-400">Ctrl+Shift+P</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quick Open</span>
                        <span className="text-gray-400">Ctrl+P</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Toggle Terminal</span>
                        <span className="text-gray-400">Ctrl+`</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Toggle Sidebar</span>
                        <span className="text-gray-400">Ctrl+B</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Save File</span>
                        <span className="text-gray-400">Ctrl+S</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Git Panel</span>
                        <span className="text-gray-400">Ctrl+Shift+G</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Settings</span>
                        <span className="text-gray-400">Ctrl+,</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Focus Mode</span>
                        <span className="text-gray-400">Alt+F</span>
                      </div>
                    </div>
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

        {/* Integrated Terminal */}
        {showTerminal && (
          <IntegratedTerminal
            isVisible={showTerminal}
            onToggle={() => setShowTerminal(!showTerminal)}
            currentProject={currentProject}
            height={terminalHeight}
          />
        )}

        {/* Enhanced Status Bar */}
        <EnhancedStatusBar
          isOnline={isOnline}
          currentFile={currentFile}
          currentProject={currentProject}
          credits={credits}
          userLevel={userLevel}
          notifications={[]}
          autoSaveEnabled={autoSaveEnabled}
          lastSaved={lastSaved}
          unsavedChanges={unsavedChanges}
          collaborators={[]}
          terminalVisible={showTerminal}
          onToggleTerminal={() => setShowTerminal(!showTerminal)}
          onOpenSettings={() => setShowToolsPanel(true)}
          onToggleNotifications={() => {}}
        />
      </div>

      {/* Command Palette */}
      <CommandPalette
        isVisible={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onCommand={handleCommand}
        recentCommands={[]}
        currentProject={currentProject}
        files={files}
      />

      {/* Extensions Marketplace */}
      {showExtensionsMarketplace && (
        <EnhancedExtensionsMarketplace
          onClose={() => setShowExtensionsMarketplace(false)}
          professionalMode={professionalMode}
        />
      )}

      {/* Templates Gallery */}
      {showTemplatesGallery && (
        <TemplatesGallery
          onClose={() => setShowTemplatesGallery(false)}
          onCreateProject={(projectId) => {
            // Handle project creation from template
            setShowTemplatesGallery(false);
            loadProjects(); // Refresh projects
          }}
          professionalMode={professionalMode}
        />
      )}

      {/* Analytics Dashboard */}
      {showAnalyticsDashboard && (
        <AnalyticsDashboard
          onClose={() => setShowAnalyticsDashboard(false)}
          professionalMode={professionalMode}
        />
      )}

      {/* Deployment Dashboard */}
      {showDeploymentDashboard && (
        <DeploymentDashboard
          onClose={() => setShowDeploymentDashboard(false)}
          currentProject={currentProject}
          professionalMode={professionalMode}
        />
      )}

      {/* Community Discovery */}
      {showCommunityDiscovery && (
        <CommunityDiscovery
          onClose={() => setShowCommunityDiscovery(false)}
          professionalMode={professionalMode}
        />
      )}

      {/* AI Chat History */}
      {showAIChatHistory && (
        <AIChatHistory
          onClose={() => setShowAIChatHistory(false)}
          professionalMode={professionalMode}
        />
      )}

      {/* 2025 Cutting-edge Feature Panels */}
      {showAIPairProgramming && (
        <div className="fixed inset-y-0 right-0 w-96 bg-gray-900/95 backdrop-blur-lg border-l border-gray-700 z-40 shadow-2xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">AI Pair Programming</h2>
            <button
              onClick={() => setShowAIPairProgramming(false)}
              className="btn btn-ghost btn-sm"
            >
              <X size={16} />
            </button>
          </div>
          <AIPairProgramming
            currentFile={currentFile}
            onCodeSuggestion={(suggestion) => console.log('AI Suggestion:', suggestion)}
            onInsertCode={handleCodeGenerated}
            professionalMode={professionalMode}
          />
        </div>
      )}

      {showVoiceToCode && (
        <div className="fixed inset-y-0 left-0 w-96 bg-gray-900/95 backdrop-blur-lg border-r border-gray-700 z-40 shadow-2xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Voice-to-Code</h2>
            <button
              onClick={() => setShowVoiceToCode(false)}
              className="btn btn-ghost btn-sm"
            >
              <X size={16} />
            </button>
          </div>
          <VoiceToCode
            currentFile={currentFile}
            onCodeGenerated={handleCodeGenerated}
            onCommandExecuted={handleVoiceCommand}
            professionalMode={professionalMode}
          />
        </div>
      )}

      {/* Enhanced Loading Screen for Initial Load */}
      {!appInitialized && isLoading && (
        <IDELoadingScreen 
          progress={75} 
          stage="Initializing AETHERFLOW 2025 features" 
        />
      )}
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