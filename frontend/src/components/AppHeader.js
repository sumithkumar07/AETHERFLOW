/**
 * 🚀 AETHERFLOW App Header Component
 * 
 * Professional header with navigation, breadcrumbs, and status indicators
 * Extracted from main App.js for better maintainability
 */

import React from 'react';
import { 
  Zap, Home, ChevronRight, Bot, Star, Award, Wifi, WifiOff, 
  Search, Terminal, GitBranch, Folder, Eye, Users, Settings,
  Package, Grid3X3, BarChart3, Rocket, Clock, Brain, Mic,
  Code, Monitor, Save
} from 'lucide-react';
import logger from '../utils/logger';

const AppHeader = ({
  currentProject,
  currentFile,
  unsavedChanges,
  lastSaved,
  currentAssistant,
  focusMode,
  credits,
  userLevel,
  isOnline,
  searchQuery,
  showSearch,
  setSearchQuery,
  setShowSearch,
  layout,
  setLayout,
  showPreview,
  showTerminal,
  showGitPanel,
  showCollaboration,
  showChat,
  showToolsPanel,
  showExtensionsMarketplace,
  showTemplatesGallery,
  showAnalyticsDashboard,
  showDeploymentDashboard,
  showCommunityDiscovery,
  showAIChatHistory,
  showAIPairProgramming,
  showVoiceToCode,
  onToggleTerminal,
  onToggleGitPanel,
  onTogglePreview,
  onToggleCollaboration,
  onToggleChat,
  onToggleToolsPanel,
  onToggleExtensionsMarketplace,
  onToggleTemplatesGallery,
  onToggleAnalyticsDashboard,
  onToggleDeploymentDashboard,
  onToggleCommunityDiscovery,
  onToggleAIChatHistory,
  onToggleAIPairProgramming,
  onToggleVoiceToCode,
  onOpenCommandPalette,
  onOpenProjectManager,
  onSaveFile
}) => {
  React.useEffect(() => {
    logger.debug('AppHeader', 'Header component mounted');
  }, []);

  const handleSearchToggle = () => {
    logger.user('AppHeader', 'Search toggle clicked');
    setShowSearch(!showSearch);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    logger.user('AppHeader', 'Search query changed', { query });
  };

  const handleSearchBlur = () => {
    if (!searchQuery) {
      setShowSearch(false);
    }
  };

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
    logger.user('AppHeader', 'Layout changed', { layout: newLayout });
  };

  return (
    <header className="professional-header">
      <div className="header-content">
        {/* Left section - Logo and breadcrumbs */}
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
        
        {/* Right section - Status indicators and controls */}
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
                <Star size={12} className="text-green-400" />
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
                  onChange={handleSearchChange}
                  className="bg-transparent text-white text-sm outline-none w-32"
                  onBlur={handleSearchBlur}
                  autoFocus
                />
              </div>
            </div>
          )}
          
          {/* Action buttons */}
          <button 
            onClick={onToggleTerminal}
            className={`btn btn-ghost btn-sm ${showTerminal ? 'text-green-400' : ''}`}
            title="Toggle Terminal (Ctrl+`)"
          >
            <Terminal size={16} />
          </button>

          <button 
            onClick={onToggleGitPanel}
            className={`btn btn-ghost btn-sm ${showGitPanel ? 'text-purple-400' : ''}`}
            title="Source Control (Ctrl+Shift+G)"
          >
            <GitBranch size={16} />
          </button>
          
          <button 
            onClick={onOpenCommandPalette}
            className="btn btn-ghost btn-sm"
            title="Command Palette (Ctrl+Shift+P)"
          >
            <Search size={16} />
          </button>
          
          <button 
            onClick={onOpenProjectManager}
            className="btn btn-ghost btn-sm"
            title="Projects"
          >
            <Folder size={16} />
          </button>
          
          <button 
            onClick={onTogglePreview}
            className={`btn btn-ghost btn-sm ${showPreview ? 'text-green-400' : ''}`}
            title="Live Preview (Ctrl+P)"
          >
            <Eye size={16} />
          </button>
          
          <button 
            onClick={onToggleCollaboration}
            className={`btn btn-ghost btn-sm ${showCollaboration ? 'text-green-400' : ''}`}
            title="Collaboration"
          >
            <Users size={16} />
          </button>
          
          <button 
            onClick={onToggleChat}
            className={`btn btn-ghost btn-sm ${showChat ? 'text-blue-400' : ''}`}
            title="AI Assistant (Ctrl+J)"
          >
            <Bot size={16} />
          </button>
          
          <button 
            onClick={onToggleToolsPanel}
            className={`btn btn-ghost btn-sm ${showToolsPanel ? 'text-purple-400' : ''}`}
            title="Professional Tools (Ctrl+,)"
          >
            <Settings size={16} />
          </button>

          {/* AETHERFLOW 2025 Feature Buttons */}
          <div className="border-l border-gray-600 mx-2 h-6"></div>
          
          <button 
            onClick={onToggleExtensionsMarketplace}
            className={`btn btn-ghost btn-sm ${showExtensionsMarketplace ? 'text-green-400' : ''}`}
            title="Extensions Marketplace (Alt+E)"
          >
            <Package size={16} />
          </button>
          
          <button 
            onClick={onToggleTemplatesGallery}
            className={`btn btn-ghost btn-sm ${showTemplatesGallery ? 'text-orange-400' : ''}`}
            title="Templates Gallery (Alt+T)"
          >
            <Grid3X3 size={16} />
          </button>
          
          <button 
            onClick={onToggleAnalyticsDashboard}
            className={`btn btn-ghost btn-sm ${showAnalyticsDashboard ? 'text-blue-400' : ''}`}
            title="Analytics Dashboard (Alt+A)"
          >
            <BarChart3 size={16} />
          </button>
          
          <button 
            onClick={onToggleDeploymentDashboard}
            className={`btn btn-ghost btn-sm ${showDeploymentDashboard ? 'text-red-400' : ''}`}
            title="Deployment Dashboard (Alt+D)"
          >
            <Rocket size={16} />
          </button>
          
          <button 
            onClick={onToggleCommunityDiscovery}
            className={`btn btn-ghost btn-sm ${showCommunityDiscovery ? 'text-yellow-400' : ''}`}
            title="Community Discovery (Alt+C)"
          >
            <Users size={16} />
          </button>
          
          <button 
            onClick={onToggleAIChatHistory}
            className={`btn btn-ghost btn-sm ${showAIChatHistory ? 'text-purple-400' : ''}`}
            title="AI Chat History (Alt+H)"
          >
            <Clock size={16} />
          </button>

          {/* 2025 Cutting-edge Feature Buttons */}
          <div className="border-l border-gray-600 mx-2 h-6"></div>
          
          <button 
            onClick={onToggleAIPairProgramming}
            className={`btn btn-ghost btn-sm ${showAIPairProgramming ? 'text-green-400' : ''}`}
            title="AI Pair Programming (Alt+I)"
          >
            <Brain size={16} />
          </button>
          
          <button 
            onClick={onToggleVoiceToCode}
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
                  onClick={() => handleLayoutChange(id)}
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

          {/* Save button */}
          {currentFile && (
            <button 
              onClick={onSaveFile}
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
  );
};

export default AppHeader;