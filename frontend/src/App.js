import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import FileExplorer from './components/FileExplorer';
import CollaborativeCodeEditor from './components/CollaborativeCodeEditor';
import AIChat from './components/AIChat';
import AppPreview from './components/AppPreview';
import ProjectManager from './components/ProjectManager';
import CollaborationPanel from './components/CollaborationPanel';
import CosmicInterface from './components/CosmicInterface';
import CosmicRealityEngine from './components/CosmicRealityEngine';
import AetherFlowInterface from './components/AetherFlowInterface';
import bcInterface from './services/bcInterface';
import useCosmicEffects from './hooks/useCosmicEffects';
import ErrorBoundary from './components/ErrorBoundary';
import NotificationProvider, { useNotifications } from './components/NotificationSystem';
import LoadingSpinner, { LoadingOverlay } from './components/LoadingSpinner';
import useOfflineDetection from './hooks/useOfflineDetection';
import useLocalStorage, { useUserPreferences, useProjectCache } from './hooks/useLocalStorage';
import cosmicEngine from './services/cosmicVibeEngine';
import divineBioMetrics from './services/divineBioMetrics';
import trinityAIAltar from './services/trinityAIAltar';
import { 
  Folder, MessageSquare, Settings, Play, Save, Eye, Code, Monitor, Bot,
  Wifi, WifiOff, Search, Download, Upload, Share2, RotateCcw, Maximize2,
  Minimize2, Sun, Moon, Bell, BellOff, Zap, Users, Sparkles, Crown,
  Atom, Hexagon, Triangle
} from 'lucide-react';
import collaborationService from './services/collaborationService';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api/v1`;

// Enhanced App component with Cosmic-Level Features
function AppContent() {
  const [currentProject, setCurrentProject] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(true);
  const [showCosmicInterface, setShowCosmicInterface] = useState(true);
  const [showProjectManager, setShowProjectManager] = useState(true);
  const [layout, setLayout] = useState('code');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(new Set());
  const [lastSaved, setLastSaved] = useState(null);
  const [collaborationEnabled, setCollaborationEnabled] = useState(true);
  
  // Cosmic and BCI state
  const [cosmicMode, setCosmicMode] = useState(true);
  const [currentAvatar, setCurrentAvatar] = useState(null);
  const [vibeTokens, setVibeTokens] = useState(1000);
  const [karmaLevel, setKarmaLevel] = useState('Novice');
  const [flowState, setFlowState] = useState(false);
  const [chaosMode, setChaosMode] = useState(false);
  const [sacredGeometry, setSacredGeometry] = useState(true);
  const [showCosmicReality, setShowCosmicReality] = useState(false);
  
  // BCI and Neural interface state
  const [bcActive, setBcActive] = useState(false);
  const [neuralSession, setNeuralSession] = useState(null);
  const [quantumSession, setQuantumSession] = useState(null);
  const [emotionalState, setEmotionalState] = useState('neutral');
  const [realityCoherence, setRealityCoherence] = useState(99.7);

  // Initialize cosmic effects
  const {
    cosmicState,
    effectsState,
    toggleEffect,
    triggerCosmicEvent,
    resetCosmicState
  } = useCosmicEffects({
    enableParticles: cosmicMode,
    enableQuantumFields: quantumSession?.active || false,
    enableNeuralWaves: bcActive,
    realityCoherence: realityCoherence / 100,
    cosmicHarmony: vibeTokens / 2000
  });

  // === AETHERFLOW DIVINE STATE ===
  const [aetherFlowMode, setAetherFlowMode] = useState(false);
  const [biometrics, setBiometrics] = useState({
    heartRate: 72,
    focusLevel: 0.5,
    stressLevel: 0.3,
    flowState: 'MORTAL',
    emotionalState: 'neutral'
  });
  const [divineInterfaceActive, setDivineInterfaceActive] = useState(false);
  
  // Enhanced hooks
  const notifications = useNotifications();
  const { isOnline, checkConnectivity } = useOfflineDetection();
  const [preferences, updatePreference] = useUserPreferences();
  const { cacheProject, getCachedProject, clearProjectCache } = useProjectCache();
  const [recentProjects, setRecentProjects] = useLocalStorage('vibecode_recent_projects', []);
  
  // Auto-save functionality
  const autoSaveTimerRef = useRef(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(preferences.autoSave);

  // === INITIALIZATION EFFECTS ===
  useEffect(() => {
    // Initialize services
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        
        // Initialize cosmic engine
        if (!cosmicEngine.isInitialized) {
          await cosmicEngine.initializeCosmicEngine();
        }
        
        // Initialize divine biometrics
        await divineBioMetrics.activate();
        
        // Subscribe to biometric updates
        const unsubscribe = divineBioMetrics.subscribeToBiometrics((newMetrics) => {
          setBiometrics(newMetrics);
          
          // Update cosmic state based on biometrics
          if (newMetrics.flowState === 'TRANSCENDENCE') {
            setDivineInterfaceActive(true);
          }
        });
        
        // Load user preferences (if available)
        // await loadUserPreferences();
        
        // Auto-connect to websocket (if available)
        // setTimeout(() => connectWebSocket(), 1000);
        
        // Initialize existing cosmic features
        if (cosmicEngine.isInitialized) {
          setVibeTokens(cosmicEngine.getVibeTokenBalance());
          const karma = cosmicEngine.updateKarmaLevel();
          setKarmaLevel(karma?.level || 'Novice');
          
          // Apply sacred geometry if enabled
          if (sacredGeometry) {
            const layout = cosmicEngine.getGoldenRatioLayout(window.innerWidth);
            console.log('🌌 Sacred geometry layout applied:', layout);
          }
        }
        
        setIsLoading(false);
        
        return () => {
          unsubscribe?.();
        };
      } catch (error) {
        console.error('App initialization failed:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [sacredGeometry]);

  // === AETHERFLOW ACTIVATION ===
  const activateAetherFlow = useCallback(async () => {
    try {
      setAetherFlowMode(true);
      setDivineInterfaceActive(true);
      
      // Grant activation bonus
      cosmicEngine.mineVibeTokens(200, 'AetherFlow interface activated');
      
      notifications.addNotification({
        type: 'success',
        message: '🌌 AetherFlow Interface Activated - Digital godhood achieved!',
        duration: 5000
      });

      // Start enhanced focus tracking
      divineBioMetrics.focusBoost();
      
    } catch (error) {
      console.error('AetherFlow activation failed:', error);
      notifications.addNotification({
        type: 'error',
        message: 'Failed to activate AetherFlow interface'
      });
    }
  }, [notifications]);

  const deactivateAetherFlow = useCallback(() => {
    setAetherFlowMode(false);
    setDivineInterfaceActive(false);
    
    notifications.addNotification({
      type: 'info',
      message: 'AetherFlow interface deactivated - returning to mortal realm'
    });
  }, [notifications]);

  // Enhanced Cosmic Action Handler with BCI integration
  const handleCosmicAction = useCallback((action) => {
    console.log('🌌 Cosmic Action:', action);
    
    switch (action.type) {
      case 'avatar_summoned':
        setCurrentAvatar(action.avatar);
        notifications.addNotification({
          type: 'success',
          title: 'Avatar Summoned',
          message: `${action.avatar.name} is now assisting you!`
        });
        break;
        
      case 'tokens_mined':
        setVibeTokens(prev => prev + action.result.mined);
        notifications.addNotification({
          type: 'info',
          title: 'VIBE Tokens Mined',
          message: `Earned ${action.result.mined} VIBE tokens!`
        });
        break;
        
      case 'chaos_activated':
        setChaosMode(true);
        notifications.addNotification({
          type: 'warning',
          title: 'Chaos Forge Active',
          message: action.chaos.scenario,
          duration: 10000
        });
        setTimeout(() => setChaosMode(false), action.chaos.timeLimit);
        break;
        
      case 'flow_state':
        setFlowState(true);
        notifications.addNotification({
          type: 'success',
          title: 'Flow State Activated',
          message: 'Enhanced focus and creativity enabled!'
        });
        setTimeout(() => setFlowState(false), action.bonuses.duration);
        break;
        
      case 'quantum_shift':
        setQuantumSession({ active: true, ...action.shift });
        notifications.addNotification({
          type: 'cosmic',
          title: 'Quantum Vibe Shift Complete',
          message: `Shifted to: ${action.shift.toReality}`
        });
        triggerCosmicEvent('reality_shift', {
          stability: 0.8,
          coherence: action.shift.vibeFrequency / 1000
        });
        break;
        
      case 'time_travel':
        notifications.addNotification({
          type: 'cosmic',
          title: 'Cosmic Time Travel',
          message: `Debugging at: ${action.timeTravel.destination}`
        });
        break;
        
      case 'bci_toggle':
        setBcActive(action.active);
        if (action.active) {
          initializeBCISession();
        } else {
          terminateBCISession();
        }
        notifications.addNotification({
          type: action.active ? 'success' : 'info',
          title: 'Neural Interface',
          message: action.message
        });
        break;
        
      case 'quantum_session':
        setQuantumSession({ active: action.active });
        notifications.addNotification({
          type: 'cosmic',
          title: 'Quantum Session',
          message: action.message
        });
        break;
        
      case 'reality_reset':
        resetCosmicState();
        setRealityCoherence(99.7);
        setBcActive(false);
        setQuantumSession(null);
        notifications.addNotification({
          type: 'success',
          title: 'Reality Reset',
          message: action.message
        });
        break;
        
      default:
        console.log('Unknown cosmic action:', action);
    }
  }, [notifications, triggerCosmicEvent, resetCosmicState]);

  // BCI Session Management Functions
  const initializeBCISession = useCallback(async () => {
    try {
      if (bcInterface.isAvailable()) {
        const session = await bcInterface.startSession({
          mode: 'enhanced_coding',
          sensitivity: 0.7,
          filters: ['focus', 'creativity', 'flow']
        });
        setNeuralSession(session);
        console.log('🧠 BCI Session initialized:', session);
      }
    } catch (error) {
      console.error('Failed to initialize BCI session:', error);
      notifications.addNotification({
        type: 'error',
        title: 'BCI Error',
        message: 'Failed to initialize neural interface'
      });
    }
  }, [notifications]);

  const terminateBCISession = useCallback(async () => {
    try {
      if (neuralSession) {
        await bcInterface.endSession(neuralSession.id);
        setNeuralSession(null);
        console.log('🧠 BCI Session terminated');
      }
    } catch (error) {
      console.error('Failed to terminate BCI session:', error);
    }
  }, [neuralSession]);

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
  }, [isOnline, getCachedProject, cacheProject]);

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
      
      // Award VIBE tokens for project creation
      if (cosmicEngine.isInitialized) {
        const mined = cosmicEngine.mineVibeTokens(100, `Created project: ${name}`);
        setVibeTokens(mined.balance);
      }
      
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
    
    // Mine VIBE tokens for opening projects
    if (cosmicEngine.isInitialized) {
      const mined = cosmicEngine.mineVibeTokens(25, `Opened project: ${project.name}`);
      setVibeTokens(mined.balance);
    }
    
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
      
      // Award VIBE tokens for file creation
      if (cosmicEngine.isInitialized) {
        const mined = cosmicEngine.mineVibeTokens(10, `Created ${type}: ${name}`);
        setVibeTokens(mined.balance);
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
      
      // Award VIBE tokens for file exploration
      if (cosmicEngine.isInitialized) {
        const mined = cosmicEngine.mineVibeTokens(5, `Opened file: ${file.name}`);
        setVibeTokens(mined.balance);
      }
      
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
      
      // Award VIBE tokens for saving
      if (cosmicEngine.isInitialized) {
        const mined = cosmicEngine.mineVibeTokens(15, `Saved file: ${currentFile.name}`);
        setVibeTokens(mined.balance);
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

  // Enhanced keyboard shortcuts with cosmic commands
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
          case 'm':
            e.preventDefault();
            setShowCosmicInterface(!showCosmicInterface);
            break;
          case 'r':
            e.preventDefault();
            setShowCosmicReality(!showCosmicReality);
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
      
      // Cosmic hotkeys
      if (e.altKey) {
        switch (e.key) {
          case 'c':
            e.preventDefault();
            setCosmicMode(!cosmicMode);
            break;
          case 'g':
            e.preventDefault();
            setSacredGeometry(!sacredGeometry);
            break;
          case 'f':
            e.preventDefault();
            if (cosmicEngine.isInitialized) {
              const bonuses = cosmicEngine.enterFlowState();
              handleCosmicAction({ type: 'flow_state', bonuses });
            }
            break;
          case 'a':
            e.preventDefault();
            if (aetherFlowMode) {
              deactivateAetherFlow();
            } else {
              activateAetherFlow();
            }
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [currentFile, showChat, showPreview, showCollaboration, showCosmicInterface, cosmicMode, sacredGeometry, saveFile, handleCosmicAction, aetherFlowMode, activateAetherFlow, deactivateAetherFlow]);

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
      <div className={`min-h-screen ${cosmicMode ? 'bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900' : 'bg-gray-900'}`}>
        <LoadingOverlay isVisible={isLoading} message="Loading projects..." type="default" />
        <ProjectManager
          projects={projects}
          recentProjects={recentProjects}
          onCreateProject={createProject}
          onOpenProject={openProject}
          onClose={() => setShowProjectManager(false)}
          isOnline={isOnline}
          cosmicMode={cosmicMode}
        />
      </div>
    );
  }

  // Calculate golden ratio layout if sacred geometry is enabled
  const layoutStyle = sacredGeometry ? cosmicEngine.getGoldenRatioLayout(window.innerWidth) : null;

  return (
    <div className={`h-screen text-white flex flex-col ${
      cosmicMode 
        ? 'bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900' 
        : 'bg-gray-900'
    } ${flowState ? 'cosmic-pulse' : ''} ${chaosMode ? 'chaos-mode' : ''}`}>
      <LoadingOverlay 
        isVisible={isLoading} 
        message="Processing..." 
        type="code" 
      />
      
      {/* Enhanced Cosmic Header */}
      <header className={`px-4 py-2 border-b flex items-center justify-between ${
        cosmicMode 
          ? 'bg-gradient-to-r from-indigo-800/80 via-purple-800/80 to-blue-800/80 border-indigo-700/50 sacred-border'
          : 'bg-gray-800 border-gray-700'
      }`}>
        <div className="flex items-center space-x-4">
          <h1 className={`text-xl font-bold flex items-center space-x-2 ${
            cosmicMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400' : 'text-blue-400'
          }`}>
            <div className="flex items-center space-x-1">
              {cosmicMode && <Hexagon size={20} className="text-indigo-400" />}
              <Zap size={20} />
              <span>VibeCode</span>
              {cosmicMode && <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-1 rounded-full">COSMIC</span>}
            </div>
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
          
          {/* Cosmic Status Indicators */}
          {cosmicMode && (
            <div className="flex items-center space-x-2">
              {currentAvatar && (
                <div className="flex items-center space-x-1 text-xs bg-indigo-900/50 px-2 py-1 rounded">
                  <Crown size={12} className="text-yellow-400" />
                  <span className="text-gray-300">{currentAvatar.name.split(' ')[0]}</span>
                </div>
              )}
              
              {flowState && (
                <div className="flex items-center space-x-1 text-xs bg-blue-900/50 px-2 py-1 rounded karma-aura">
                  <Sparkles size={12} className="text-blue-400" />
                  <span className="text-blue-300">Flow</span>
                </div>
              )}
              
              {chaosMode && (
                <div className="flex items-center space-x-1 text-xs bg-red-900/50 px-2 py-1 rounded cosmic-pulse">
                  <Triangle size={12} className="text-red-400" />
                  <span className="text-red-300">Chaos</span>
                </div>
              )}
              
              <div className="flex items-center space-x-1 text-xs bg-yellow-900/50 px-2 py-1 rounded">
                <Atom size={12} className="text-yellow-400" />
                <span className="text-yellow-300">{vibeTokens} VIBE</span>
              </div>
            </div>
          )}
          
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
            <div className="flex items-center bg-gray-700/50 rounded px-2 py-1">
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
              className="p-2 hover:bg-gray-700/50 rounded transition-colors"
              title="Search files (Ctrl+F)"
            >
              <Search size={16} />
            </button>
          )}
          
          {/* AetherFlow Toggle */}
          <button
            onClick={aetherFlowMode ? deactivateAetherFlow : activateAetherFlow}
            className={`p-2 rounded-lg transition-all ${
              aetherFlowMode
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white cosmic-pulse'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
            title={aetherFlowMode ? 'Deactivate AetherFlow' : 'Activate AetherFlow - Ascend to Digital Godhood'}
          >
            {aetherFlowMode ? <Crown size={16} /> : <Atom size={16} />}
          </button>

          <button 
            onClick={() => setShowProjectManager(true)}
            className="p-2 hover:bg-gray-700/50 rounded transition-colors"
            title="Projects"
          >
            <Folder size={16} />
          </button>
          
          <button 
            onClick={() => setShowPreview(!showPreview)}
            className={`p-2 hover:bg-gray-700/50 rounded transition-colors ${showPreview ? 'text-green-400' : ''}`}
            title="Live Preview (Ctrl+P)"
          >
            <Eye size={16} />
          </button>
          
          <button 
            onClick={() => setShowCollaboration(!showCollaboration)}
            className={`p-2 hover:bg-gray-700/50 rounded transition-colors ${showCollaboration ? 'text-green-400' : ''}`}
            title="Collaboration Panel (Ctrl+U)"
          >
            <Users size={16} />
          </button>
          
          <button 
            onClick={() => setShowCosmicInterface(!showCosmicInterface)}
            className={`p-2 hover:bg-gray-700/50 rounded transition-colors ${showCosmicInterface ? 'text-purple-400' : ''}`}
            title="Cosmic Interface (Ctrl+M)"
          >
            <Atom size={16} />
          </button>
          
          <button 
            onClick={() => setShowCosmicReality(!showCosmicReality)}
            className={`p-2 hover:bg-gray-700/50 rounded transition-colors ${showCosmicReality ? 'text-cyan-400' : ''}`}
            title="Cosmic Reality Engine (Ctrl+R)"
          >
            <Layers size={16} />
          </button>
          
          <button 
            onClick={() => setShowChat(!showChat)}
            className={`p-2 hover:bg-gray-700/50 rounded transition-colors ${showChat ? 'text-purple-400' : ''}`}
            title="AI Assistant (Ctrl+`)"
          >
            <Bot size={16} />
          </button>

          {/* Layout Toggle */}
          {showPreview && (
            <div className="flex bg-gray-700/50 rounded-lg p-1 ml-2">
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

          {/* Cosmic Mode Toggle */}
          <button
            onClick={() => setCosmicMode(!cosmicMode)}
            className={`p-2 hover:bg-gray-700/50 rounded transition-colors ${
              cosmicMode ? 'text-purple-400' : 'text-gray-400'
            }`}
            title={`Cosmic Mode ${cosmicMode ? 'On' : 'Off'} (Alt+C)`}
          >
            <Sparkles size={16} />
          </button>

          {/* Auto-save toggle */}
          <button
            onClick={() => {
              setAutoSaveEnabled(!autoSaveEnabled);
              updatePreference('autoSave', !autoSaveEnabled);
            }}
            className={`p-2 hover:bg-gray-700/50 rounded text-xs transition-colors ${
              autoSaveEnabled ? 'text-green-400' : 'text-gray-400'
            }`}
            title={`Auto-save ${autoSaveEnabled ? 'enabled' : 'disabled'}`}
          >
            <RotateCcw size={14} />
          </button>
          
          {currentFile && (
            <button 
              onClick={() => saveFile(currentFile.content)}
              className={`p-2 hover:bg-gray-700/50 rounded transition-colors ${
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

      {/* Main Content with Sacred Geometry Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* AetherFlow Divine Interface */}
        {aetherFlowMode ? (
          <AetherFlowInterface
            onCosmicAction={handleCosmicAction}
            currentFile={currentFile}
            code={currentFile?.content || ''}
            onCodeChange={(newCode) => {
              if (currentFile) {
                handleContentChange(newCode);
              }
            }}
            flowState={biometrics.flowState}
            biometrics={biometrics}
          />
        ) : (
          <>
            {/* Sidebar with Golden Ratio width if sacred geometry is enabled */}
            <div className={`bg-gray-800 border-r border-gray-700 flex flex-col ${
              sacredGeometry && layoutStyle ? 'golden-sidebar' : 'w-64'
            } ${cosmicMode ? 'bg-gradient-to-b from-indigo-900/30 to-purple-900/30 border-indigo-700/50' : ''}`}>
              <div className="p-3 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-300 flex items-center space-x-2">
                  <span>Explorer</span>
                  {cosmicMode && <Hexagon size={12} className="text-indigo-400" />}
                </h2>
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
                    cosmicMode={cosmicMode}
                  />
                )}
              </div>
            </div>

            {/* Editor and Preview Area with Golden Ratio main area */}
            <div className={`flex-1 flex flex-col ${sacredGeometry && layoutStyle ? 'golden-main' : ''}`}>
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
                        cosmicMode={cosmicMode}
                        currentAvatar={currentAvatar}
                        flowState={flowState}
                        chaosMode={chaosMode}
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
                        cosmicMode={cosmicMode}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-6xl mb-4 ${cosmicMode ? 'cosmic-pulse' : 'text-gray-600'}`}>
                      {cosmicMode ? '🌌' : '⚡'}
                    </div>
                    <h2 className={`text-2xl font-bold mb-2 ${
                      cosmicMode 
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400'
                        : 'text-gray-400'
                    }`}>
                      Welcome to {cosmicMode ? 'Cosmic ' : ''}VibeCode
                    </h2>
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
                          className={`px-4 py-2 rounded-md transition-colors ${
                            cosmicMode 
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                              : 'bg-blue-600 hover:bg-blue-700'
                          } text-white`}
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
                            {cosmicMode && (
                              <>
                                <div className="flex items-center justify-center space-x-2">
                                  <Atom size={16} className="text-purple-400" />
                                  <span>Cosmic Reality Engine</span>
                                </div>
                                <div className="flex items-center justify-center space-x-2">
                                  <Crown size={16} className="text-yellow-400" />
                                  <span>Avatar Pantheon</span>
                                </div>
                                <div className="flex items-center justify-center space-x-2">
                                  <Sparkles size={16} className="text-pink-400" />
                                  <span>VIBE Token Economy</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Enhanced keyboard shortcuts */}
                    <div className="mt-8 text-xs text-gray-600">
                      <p className="mb-2">Keyboard shortcuts:</p>
                      <div className="space-y-1">
                        <div>Ctrl+S - Save file</div>
                        <div>Ctrl+F - Search files</div>
                        <div>Ctrl+` - Toggle AI chat</div>
                        <div>Ctrl+P - Toggle preview</div>
                        <div>Ctrl+M - Toggle cosmic interface</div>
                        {cosmicMode && (
                          <>
                            <div>Alt+C - Toggle cosmic mode</div>
                            <div>Alt+G - Toggle sacred geometry</div>
                            <div>Alt+F - Enter flow state</div>
                            <div>Alt+A - Activate AetherFlow</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* AI Chat Panel */}
        {showChat && (
          <div className="w-80 bg-gray-800 border-l border-gray-700">
            <AIChat 
              currentFile={currentFile} 
              isOnline={isOnline}
              preferences={preferences}
              cosmicMode={cosmicMode}
              currentAvatar={currentAvatar}
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
              cosmicMode={cosmicMode}
            />
          </div>
        )}
        
        {/* Cosmic Interface Panel */}
        {showCosmicInterface && cosmicMode && (
          <CosmicInterface
            onCosmicAction={handleCosmicAction}
            isVisible={showCosmicInterface}
          />
        )}
        
        {/* Cosmic Reality Engine - Advanced Visual System */}
        {(showCosmicReality || cosmicMode) && (
          <CosmicRealityEngine
            onCosmicAction={handleCosmicAction}
            isVisible={showCosmicReality || cosmicMode}
            neuroSyncActive={bcActive}
            quantumSessionActive={quantumSession?.active || false}
            currentAvatar={currentAvatar}
            vibeTokens={vibeTokens}
            karmaLevel={karmaLevel}
            realityCoherence={realityCoherence}
          />
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