import React, { useState, useEffect } from 'react';
import { 
  Settings, User, Palette, Code, Shield, Bell, Globe, 
  Monitor, Smartphone, Tablet, Eye, EyeOff, Save, RotateCcw,
  Zap, Brain, Users, Database, Cloud, Download, Upload,
  Key, Lock, Unlock, ChevronRight, ChevronDown, X, 
  Moon, Sun, Laptop, Contrast, Volume2, VolumeX, Mic, MicOff,
  Gamepad2, Cpu, MemoryStick, HardDrive, Wifi, Activity,
  CheckCircle2, AlertCircle, Info, Sliders, Brush, Layers,
  Terminal, FileCode, GitBranch, Package, Workflow, Target
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const EnhancedSettingsPage = ({ onClose, userPreferences = {}, onSave }) => {
  const [activeTab, setActiveTab] = useState('appearance');
  const [settings, setSettings] = useState({
    // Appearance Settings
    appearance: {
      theme: 'dark',
      colorScheme: 'cosmic',
      fontSize: 14,
      fontFamily: 'JetBrains Mono',
      lineHeight: 1.5,
      cursorBlinking: 'smooth',
      minimap: true,
      sidebarPosition: 'left',
      panelLayout: 'bottom',
      iconTheme: 'material-cosmic',
      customColors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        accent: '#06b6d4',
        background: '#0f172a',
        surface: '#1e293b',
        text: '#f8fafc'
      }
    },
    
    // Editor Settings
    editor: {
      tabSize: 2,
      insertSpaces: true,
      wordWrap: 'on',
      lineNumbers: 'on',
      folding: true,
      bracketMatching: 'always',
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      autoIndent: 'full',
      formatOnSave: true,
      formatOnType: false,
      trimTrailingWhitespace: true,
      insertFinalNewline: true,
      renderWhitespace: 'selection',
      rulers: [80, 120],
      smoothScrolling: true,
      quickSuggestions: true,
      parameterHints: true,
      autoComplete: 'always',
      emmetEnabled: true
    },

    // AI Assistant Settings
    ai: {
      enabled: true,
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 1000,
      contextLines: 50,
      autoSuggest: true,
      codeCompletion: true,
      codeExplanation: true,
      docGeneration: true,
      refactoring: true,
      testGeneration: true,
      voiceCommands: false,
      customPrompts: [],
      multiModelComparison: true,
      realTimeCollaboration: true
    },

    // Privacy & Security
    privacy: {
      telemetryEnabled: true,
      crashReporting: true,
      usageAnalytics: false,
      codeAnalytics: false,
      shareAnonymousData: false,
      autoUpdate: true,
      betaFeatures: false,
      twoFactorAuth: false,
      sessionTimeout: 60,
      rememberLogin: true,
      encryptLocalStorage: true,
      secureConnection: true,
      dataRetention: 30
    },

    // Performance Settings
    performance: {
      hardwareAcceleration: true,
      maxMemoryUsage: 4096,
      enableCache: true,
      preloadFiles: true,
      lazyLoading: true,
      compressionEnabled: true,
      backgroundSync: true,
      indexingEnabled: true,
      searchIndexSize: 1000,
      maxUndoHistory: 100,
      debounceTime: 300,
      renderingOptimization: 'auto'
    },

    // Notifications
    notifications: {
      enabled: true,
      systemNotifications: true,
      emailNotifications: false,
      pushNotifications: true,
      soundEnabled: true,
      vibrationEnabled: false,
      collaboratorActivity: true,
      deploymentStatus: true,
      errorAlerts: true,
      updateNotifications: true,
      marketplaceUpdates: false,
      weeklyDigest: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    },

    // Collaboration
    collaboration: {
      realTimeEditing: true,
      showCursors: true,
      showSelections: true,
      autoShare: false,
      defaultPermissions: 'view',
      allowAnonymous: false,
      requireApproval: true,
      maxCollaborators: 10,
      activityTracking: true,
      commentNotifications: true,
      mentionNotifications: true,
      conflictResolution: 'manual'
    },

    // Keyboard Shortcuts
    shortcuts: {
      preset: 'vscode',
      customBindings: {},
      enableVimMode: false,
      enableEmacsMode: false,
      multiCursor: true,
      quickOpen: 'Ctrl+P',
      commandPalette: 'Ctrl+Shift+P',
      toggleTerminal: 'Ctrl+`',
      toggleSidebar: 'Ctrl+B',
      saveAll: 'Ctrl+K S',
      formatDocument: 'Shift+Alt+F'
    },

    // Extensions
    extensions: {
      autoUpdate: true,
      checkUpdatesOnStartup: true,
      allowPrerelease: false,
      enableTelemetry: false,
      maxConcurrentInstalls: 3,
      verifySignatures: true,
      sandboxMode: true,
      resourceLimits: {
        memory: 512,
        cpu: 25
      }
    }
  });

  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    // Load user preferences
    if (Object.keys(userPreferences).length > 0) {
      setSettings(prev => ({ ...prev, ...userPreferences }));
    }
    loadUserSettings();
  }, [userPreferences]);

  const loadUserSettings = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/user/settings`);
      if (response.ok) {
        const userSettings = await response.json();
        setSettings(prev => ({ ...prev, ...userSettings }));
      }
    } catch (error) {
      console.error('Failed to load user settings:', error);
    }
  };

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setIsDirty(true);
  };

  const handleNestedSettingChange = (category, parentKey, childKey, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [parentKey]: {
          ...prev[category][parentKey],
          [childKey]: value
        }
      }
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/user/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      if (response.ok) {
        setIsDirty(false);
        onSave && onSave(settings);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSettings({
      // Reset to defaults
      ...settings,
      appearance: {
        ...settings.appearance,
        theme: 'dark',
        colorScheme: 'cosmic',
        fontSize: 14
      }
    });
    setIsDirty(true);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const settingsCategories = [
    { id: 'appearance', name: 'Appearance', icon: Palette, description: 'Theme, colors, and visual customization' },
    { id: 'editor', name: 'Editor', icon: Code, description: 'Code editing preferences and behavior' },
    { id: 'ai', name: 'AI Assistant', icon: Brain, description: 'AI model settings and capabilities' },
    { id: 'privacy', name: 'Privacy & Security', icon: Shield, description: 'Data protection and security settings' },
    { id: 'performance', name: 'Performance', icon: Cpu, description: 'Memory, caching, and optimization' },
    { id: 'notifications', name: 'Notifications', icon: Bell, description: 'Alerts and notification preferences' },
    { id: 'collaboration', name: 'Collaboration', icon: Users, description: 'Real-time editing and sharing' },
    { id: 'shortcuts', name: 'Keyboard Shortcuts', icon: Gamepad2, description: 'Custom key bindings and presets' },
    { id: 'extensions', name: 'Extensions', icon: Package, description: 'Extension management and security' }
  ];

  const AppearanceSettings = () => (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Moon size={20} />
          <span>Theme</span>
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { id: 'light', name: 'Light', icon: Sun, preview: 'bg-white border-gray-200' },
            { id: 'dark', name: 'Dark', icon: Moon, preview: 'bg-slate-900 border-slate-700' },
            { id: 'auto', name: 'Auto', icon: Laptop, preview: 'bg-gradient-to-r from-white to-slate-900 border-slate-400' }
          ].map(theme => (
            <button
              key={theme.id}
              onClick={() => handleSettingChange('appearance', 'theme', theme.id)}
              className={`p-4 rounded-lg border transition-all ${
                settings.appearance.theme === theme.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <div className={`w-full h-12 rounded ${theme.preview} mb-3`}></div>
              <div className="flex items-center justify-center space-x-2">
                <theme.icon size={16} className="text-gray-400" />
                <span className="text-white font-medium">{theme.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Color Scheme */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Brush size={20} />
          <span>Color Scheme</span>
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: 'cosmic', name: 'Cosmic', colors: ['#3b82f6', '#8b5cf6', '#06b6d4'] },
            { id: 'oceanic', name: 'Oceanic', colors: ['#0ea5e9', '#06b6d4', '#10b981'] },
            { id: 'sunset', name: 'Sunset', colors: ['#f59e0b', '#ef4444', '#ec4899'] },
            { id: 'forest', name: 'Forest', colors: ['#10b981', '#059669', '#047857'] }
          ].map(scheme => (
            <button
              key={scheme.id}
              onClick={() => handleSettingChange('appearance', 'colorScheme', scheme.id)}
              className={`p-4 rounded-lg border transition-all ${
                settings.appearance.colorScheme === scheme.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <div className="flex space-x-1 mb-3">
                {scheme.colors.map((color, index) => (
                  <div key={index} className="w-4 h-8 rounded" style={{ backgroundColor: color }}></div>
                ))}
              </div>
              <span className="text-white font-medium">{scheme.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Typography</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Font Family</label>
            <select
              value={settings.appearance.fontFamily}
              onChange={(e) => handleSettingChange('appearance', 'fontFamily', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500"
            >
              <option value="JetBrains Mono">JetBrains Mono</option>
              <option value="Fira Code">Fira Code</option>
              <option value="Source Code Pro">Source Code Pro</option>
              <option value="Monaco">Monaco</option>
              <option value="Consolas">Consolas</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Font Size</label>
            <input
              type="range"
              min="10"
              max="24"
              value={settings.appearance.fontSize}
              onChange={(e) => handleSettingChange('appearance', 'fontSize', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-xs text-gray-400 mt-1">{settings.appearance.fontSize}px</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Line Height</label>
            <input
              type="range"
              min="1.2"
              max="2.0"
              step="0.1"
              value={settings.appearance.lineHeight}
              onChange={(e) => handleSettingChange('appearance', 'lineHeight', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-xs text-gray-400 mt-1">{settings.appearance.lineHeight}</div>
          </div>
        </div>
      </div>

      {/* Layout Options */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Layout</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-white">Show Minimap</label>
            <button
              onClick={() => handleSettingChange('appearance', 'minimap', !settings.appearance.minimap)}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.appearance.minimap ? 'bg-blue-600' : 'bg-slate-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                settings.appearance.minimap ? 'translate-x-6' : 'translate-x-1'
              } mt-0.5`} />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-white">Sidebar Position</label>
            <select
              value={settings.appearance.sidebarPosition}
              onChange={(e) => handleSettingChange('appearance', 'sidebarPosition', e.target.value)}
              className="px-3 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-white">Panel Layout</label>
            <select
              value={settings.appearance.panelLayout}
              onChange={(e) => handleSettingChange('appearance', 'panelLayout', e.target.value)}
              className="px-3 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
            >
              <option value="bottom">Bottom</option>
              <option value="right">Right</option>
              <option value="maximized">Maximized</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const EditorSettings = () => (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Indentation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tab Size</label>
            <select
              value={settings.editor.tabSize}
              onChange={(e) => handleSettingChange('editor', 'tabSize', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            >
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
              <option value="8">8 spaces</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-white">Insert Spaces</label>
            <button
              onClick={() => handleSettingChange('editor', 'insertSpaces', !settings.editor.insertSpaces)}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.editor.insertSpaces ? 'bg-blue-600' : 'bg-slate-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                settings.editor.insertSpaces ? 'translate-x-6' : 'translate-x-1'
              } mt-0.5`} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Code Behavior</h3>
        <div className="space-y-4">
          {[
            { key: 'formatOnSave', label: 'Format on Save' },
            { key: 'trimTrailingWhitespace', label: 'Trim Trailing Whitespace' },
            { key: 'insertFinalNewline', label: 'Insert Final Newline' },
            { key: 'bracketMatching', label: 'Bracket Matching', type: 'select', options: ['always', 'near', 'never'] },
            { key: 'autoClosingBrackets', label: 'Auto Closing Brackets', type: 'select', options: ['always', 'languageDefined', 'beforeWhitespace', 'never'] },
            { key: 'wordWrap', label: 'Word Wrap', type: 'select', options: ['on', 'off', 'wordWrapColumn', 'bounded'] }
          ].map(setting => (
            <div key={setting.key} className="flex items-center justify-between">
              <label className="text-white">{setting.label}</label>
              {setting.type === 'select' ? (
                <select
                  value={settings.editor[setting.key]}
                  onChange={(e) => handleSettingChange('editor', setting.key, e.target.value)}
                  className="px-3 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                >
                  {setting.options.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <button
                  onClick={() => handleSettingChange('editor', setting.key, !settings.editor[setting.key])}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.editor[setting.key] ? 'bg-blue-600' : 'bg-slate-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                    settings.editor[setting.key] ? 'translate-x-6' : 'translate-x-1'
                  } mt-0.5`} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const AISettings = () => (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Brain size={20} />
          <span>AI Model Configuration</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Primary Model</label>
            <select
              value={settings.ai.model}
              onChange={(e) => handleSettingChange('ai', 'model', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            >
              <option value="gpt-4">GPT-4 (OpenAI)</option>
              <option value="claude-3">Claude 3 (Anthropic)</option>
              <option value="gemini-pro">Gemini Pro (Google)</option>
              <option value="codellama">CodeLlama (Meta)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Temperature: {settings.ai.temperature}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.ai.temperature}
              onChange={(e) => handleSettingChange('ai', 'temperature', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-xs text-gray-400 mt-1">
              {settings.ai.temperature < 0.3 ? 'Focused' : settings.ai.temperature < 0.7 ? 'Balanced' : 'Creative'}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">AI Capabilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'autoSuggest', label: 'Auto Suggestions', description: 'Real-time code suggestions' },
            { key: 'codeCompletion', label: 'Code Completion', description: 'Smart autocomplete' },
            { key: 'codeExplanation', label: 'Code Explanation', description: 'Explain complex code' },
            { key: 'docGeneration', label: 'Documentation', description: 'Generate documentation' },
            { key: 'refactoring', label: 'Smart Refactoring', description: 'AI-powered refactoring' },
            { key: 'testGeneration', label: 'Test Generation', description: 'Automatic test creation' }
          ].map(capability => (
            <div key={capability.key} className="flex items-start space-x-3 p-3 bg-slate-700/50 rounded-lg">
              <button
                onClick={() => handleSettingChange('ai', capability.key, !settings.ai[capability.key])}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-1 ${
                  settings.ai[capability.key] ? 'bg-blue-600 border-blue-600' : 'border-slate-500'
                }`}
              >
                {settings.ai[capability.key] && <CheckCircle2 size={12} className="text-white" />}
              </button>
              <div>
                <div className="font-medium text-white">{capability.label}</div>
                <div className="text-sm text-gray-400">{capability.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSettingsContent = () => {
    switch (activeTab) {
      case 'appearance':
        return <AppearanceSettings />;
      case 'editor':
        return <EditorSettings />;
      case 'ai':
        return <AISettings />;
      default:
        return <div className="text-gray-400">Settings for {activeTab} coming soon...</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Settings size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Settings</h1>
              <p className="text-xs text-gray-400">Customize your AETHERFLOW experience</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {isDirty && (
              <div className="flex items-center space-x-2 text-yellow-400 text-sm">
                <AlertCircle size={14} />
                <span>Unsaved changes</span>
              </div>
            )}
            
            <button
              onClick={handleReset}
              className="btn btn-ghost"
              disabled={isLoading}
            >
              <RotateCcw size={16} />
              Reset
            </button>
            
            <button
              onClick={handleSave}
              disabled={!isDirty || isLoading}
              className="btn btn-primary"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save size={16} />
              )}
              Save
            </button>
            
            <button
              onClick={onClose}
              className="btn btn-ghost"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-slate-800 border-r border-slate-700 overflow-y-auto">
          <div className="p-4">
            <div className="space-y-1">
              {settingsCategories.map(category => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveTab(category.id)}
                    className={`w-full flex items-start space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                      activeTab === category.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-slate-700'
                    }`}
                  >
                    <Icon size={20} className="flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{category.name}</div>
                      <div className="text-xs opacity-75 mt-1 line-clamp-2">
                        {category.description}
                      </div>
                    </div>
                    <ChevronRight size={14} className={`flex-shrink-0 mt-1 transition-transform ${
                      activeTab === category.id ? 'rotate-90' : ''
                    }`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-4xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {settingsCategories.find(cat => cat.id === activeTab)?.name}
              </h2>
              <p className="text-gray-400">
                {settingsCategories.find(cat => cat.id === activeTab)?.description}
              </p>
            </div>
            
            {renderSettingsContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSettingsPage;