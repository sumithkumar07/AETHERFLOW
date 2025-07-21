import React, { useState, useEffect } from 'react';
import { 
  Wifi, WifiOff, GitBranch, GitCommit, AlertTriangle, CheckCircle,
  Clock, Cpu, HardDrive, Zap, Users, Bell, BellOff, Settings,
  Activity, Database, Globe, Lock, Unlock, Star, Award, Target,
  Code, FileText, Folder, Terminal, Play, Pause, Square
} from 'lucide-react';

const EnhancedStatusBar = ({
  isOnline = true,
  currentFile = null,
  currentProject = null,
  credits = 0,
  userLevel = 'Developer',
  notifications = [],
  autoSaveEnabled = true,
  lastSaved = null,
  unsavedChanges = new Set(),
  collaborators = [],
  terminalVisible = false,
  onToggleTerminal,
  onOpenSettings,
  onToggleNotifications
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemStats, setSystemStats] = useState({
    cpu: 45,
    memory: 62,
    disk: 38
  });
  const [gitStatus, setGitStatus] = useState({
    branch: 'main',
    ahead: 0,
    behind: 0,
    modified: 3,
    staged: 1
  });

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Simulate system stats updates
  useEffect(() => {
    const timer = setInterval(() => {
      setSystemStats(prev => ({
        cpu: Math.max(20, Math.min(80, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(30, Math.min(85, prev.memory + (Math.random() - 0.5) * 5)),
        disk: prev.disk
      }));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const getFileInfo = () => {
    if (!currentFile) return null;
    
    const extension = currentFile.name.split('.').pop()?.toLowerCase();
    const language = {
      'js': 'JavaScript',
      'jsx': 'JavaScript React', 
      'ts': 'TypeScript',
      'tsx': 'TypeScript React',
      'py': 'Python',
      'java': 'Java',
      'css': 'CSS',
      'scss': 'SCSS',
      'html': 'HTML',
      'json': 'JSON',
      'md': 'Markdown'
    }[extension] || 'Text';

    return {
      language,
      lines: (currentFile.content || '').split('\n').length,
      size: new Blob([currentFile.content || '']).size
    };
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const fileInfo = getFileInfo();

  return (
    <div className="flex items-center justify-between px-4 py-1 bg-slate-800 border-t border-slate-700 text-xs text-slate-400 select-none">
      {/* Left Section - File & Project Info */}
      <div className="flex items-center space-x-4">
        {/* Connection Status */}
        <div className={`flex items-center space-x-1 ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
          {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>

        {/* Project Info */}
        {currentProject && (
          <div className="flex items-center space-x-1">
            <Folder size={12} className="text-blue-400" />
            <span>{currentProject.name}</span>
          </div>
        )}

        {/* Git Status */}
        {currentProject && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <GitBranch size={12} className="text-purple-400" />
              <span>{gitStatus.branch}</span>
            </div>
            {gitStatus.modified > 0 && (
              <div className="flex items-center space-x-1 text-yellow-400">
                <GitCommit size={12} />
                <span>{gitStatus.modified}M</span>
              </div>
            )}
            {gitStatus.staged > 0 && (
              <div className="flex items-center space-x-1 text-green-400">
                <CheckCircle size={12} />
                <span>{gitStatus.staged}S</span>
              </div>
            )}
          </div>
        )}

        {/* File Info */}
        {fileInfo && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Code size={12} className="text-cyan-400" />
              <span>{fileInfo.language}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FileText size={12} />
              <span>{fileInfo.lines} lines</span>
            </div>
            <div className="flex items-center space-x-1">
              <HardDrive size={12} />
              <span>{formatBytes(fileInfo.size)}</span>
            </div>
          </div>
        )}

        {/* Unsaved Changes Indicator */}
        {unsavedChanges.size > 0 && (
          <div className="flex items-center space-x-1 text-yellow-400">
            <AlertTriangle size={12} />
            <span>{unsavedChanges.size} unsaved</span>
          </div>
        )}

        {/* Auto-save Status */}
        {autoSaveEnabled && lastSaved && (
          <div className="flex items-center space-x-1 text-green-400">
            <Clock size={12} />
            <span>Auto-saved {formatTime(lastSaved)}</span>
          </div>
        )}
      </div>

      {/* Center Section - System Stats */}
      <div className="flex items-center space-x-4">
        {/* CPU Usage */}
        <div className="flex items-center space-x-1">
          <Cpu size={12} className={`${systemStats.cpu > 70 ? 'text-red-400' : systemStats.cpu > 50 ? 'text-yellow-400' : 'text-green-400'}`} />
          <span>CPU {systemStats.cpu}%</span>
        </div>

        {/* Memory Usage */}
        <div className="flex items-center space-x-1">
          <Activity size={12} className={`${systemStats.memory > 80 ? 'text-red-400' : systemStats.memory > 60 ? 'text-yellow-400' : 'text-green-400'}`} />
          <span>RAM {systemStats.memory}%</span>
        </div>

        {/* Disk Usage */}
        <div className="flex items-center space-x-1">
          <HardDrive size={12} className="text-blue-400" />
          <span>Disk {systemStats.disk}%</span>
        </div>
      </div>

      {/* Right Section - User & Status */}
      <div className="flex items-center space-x-4">
        {/* Collaborators */}
        {collaborators.length > 0 && (
          <div className="flex items-center space-x-1">
            <Users size={12} className="text-indigo-400" />
            <span>{collaborators.length} online</span>
          </div>
        )}

        {/* Credits */}
        <div className="flex items-center space-x-1 text-yellow-400">
          <Star size={12} />
          <span>{credits}</span>
        </div>

        {/* User Level */}
        <div className="flex items-center space-x-1 text-purple-400">
          <Award size={12} />
          <span>{userLevel}</span>
        </div>

        {/* Terminal Toggle */}
        <button
          onClick={onToggleTerminal}
          className={`flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-700 transition-colors ${
            terminalVisible ? 'text-green-400 bg-slate-700/50' : 'text-slate-400'
          }`}
          title={terminalVisible ? 'Hide Terminal' : 'Show Terminal'}
        >
          <Terminal size={12} />
          <span>Terminal</span>
        </button>

        {/* Notifications */}
        <button
          onClick={onToggleNotifications}
          className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-700 transition-colors relative"
          title="Notifications"
        >
          {notifications.length > 0 ? <Bell size={12} className="text-blue-400" /> : <BellOff size={12} />}
          {notifications.length > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
              {notifications.length > 9 ? '9+' : notifications.length}
            </div>
          )}
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-700 transition-colors"
          title="Settings"
        >
          <Settings size={12} />
        </button>

        {/* Current Time */}
        <div className="flex items-center space-x-1 text-slate-500">
          <Clock size={12} />
          <span>{formatTime(currentTime)}</span>
        </div>

        {/* Environment Indicator */}
        <div className="flex items-center space-x-1 text-green-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>DEV</span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedStatusBar;