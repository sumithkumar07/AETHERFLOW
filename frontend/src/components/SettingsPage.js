import React, { useState, useCallback } from 'react';
import { 
  Settings, X, Monitor, Keyboard, Palette, Shield, Zap, Brain,
  Globe, Bell, Save, RotateCcw, Download, Upload, User, Lock,
  Code, Eye, Volume2, Accessibility, Smartphone, Cpu
} from 'lucide-react';

const SettingsPage = ({ isVisible, onClose, preferences = {}, onUpdatePreference }) => {
  const [activeTab, setActiveTab] = useState('editor');
  const [localPreferences, setLocalPreferences] = useState({
    // Editor settings
    fontSize: 14,
    fontFamily: 'JetBrains Mono',
    tabSize: 2,
    wordWrap: true,
    lineNumbers: true,
    minimap: true,
    autoSave: true,
    formatOnSave: true,
    
    // Theme settings
    theme: 'aetherflow-dark',
    colorScheme: 'professional',
    glassMorphism: true,
    animations: true,
    accentColor: '#6366f1',
    
    // AI settings
    aiModel: 'meta-llama/llama-4-maverick',
    aiSuggestions: true,
    contextAware: true,
    aiVoice: false,
    aiPersonality: 'professional',
    
    // Performance settings
    autoComplete: true,
    syntaxHighlighting: true,
    errorChecking: true,
    backgroundSync: true,
    cacheEnabled: true,
    
    // Privacy settings
    analytics: true,
    crashReporting: true,
    dataCollection: false,
    shareUsage: false,
    
    // Collaboration settings
    showCursors: true,
    sharePresence: true,
    notifications: true,
    soundEffects: false,
    
    ...preferences
  });

  const settingsTabs = [
    { id: 'editor', label: 'Editor', icon: Code },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'ai', label: 'AI Assistant', icon: Brain },
    { id: 'performance', label: 'Performance', icon: Cpu },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'collaboration', label: 'Collaboration', icon: Globe },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
    { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard }
  ];

  const handlePreferenceChange = useCallback((key, value) => {
    setLocalPreferences(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(() => {
    Object.entries(localPreferences).forEach(([key, value]) => {
      onUpdatePreference?.(key, value);
    });
    onClose();
  }, [localPreferences, onUpdatePreference, onClose]);

  const handleReset = useCallback(() => {
    setLocalPreferences({
      fontSize: 14,
      fontFamily: 'JetBrains Mono',
      tabSize: 2,
      wordWrap: true,
      lineNumbers: true,
      minimap: true,
      autoSave: true,
      formatOnSave: true,
      theme: 'aetherflow-dark',
      colorScheme: 'professional',
      glassMorphism: true,
      animations: true,
      accentColor: '#6366f1',
      aiModel: 'meta-llama/llama-4-maverick',
      aiSuggestions: true,
      contextAware: true,
      aiVoice: false,
      aiPersonality: 'professional',
      autoComplete: true,
      syntaxHighlighting: true,
      errorChecking: true,
      backgroundSync: true,
      cacheEnabled: true,
      analytics: true,
      crashReporting: true,
      dataCollection: false,
      shareUsage: false,
      showCursors: true,
      sharePresence: true,
      notifications: true,
      soundEffects: false
    });
  }, []);

  if (!isVisible) return null;

  const renderSettingSection = (section) => {
    switch (section) {
      case 'editor':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Editor Settings</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Font Size</label>
                <select
                  value={localPreferences.fontSize}
                  onChange={(e) => handlePreferenceChange('fontSize', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  {[10, 11, 12, 13, 14, 15, 16, 18, 20, 24].map(size => (
                    <option key={size} value={size}>{size}px</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Font Family</label>
                <select
                  value={localPreferences.fontFamily}
                  onChange={(e) => handlePreferenceChange('fontFamily', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="JetBrains Mono">JetBrains Mono</option>
                  <option value="Fira Code">Fira Code</option>
                  <option value="Source Code Pro">Source Code Pro</option>
                  <option value="Monaco">Monaco</option>
                  <option value="Consolas">Consolas</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tab Size</label>
                <select
                  value={localPreferences.tabSize}
                  onChange={(e) => handlePreferenceChange('tabSize', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value={2}>2 spaces</option>
                  <option value={4}>4 spaces</option>
                  <option value={8}>8 spaces</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              {[
                { key: 'wordWrap', label: 'Word Wrap', desc: 'Wrap long lines of code' },
                { key: 'lineNumbers', label: 'Line Numbers', desc: 'Show line numbers in editor' },
                { key: 'minimap', label: 'Minimap', desc: 'Show code minimap on the right' },
                { key: 'autoSave', label: 'Auto Save', desc: 'Automatically save files while typing' },
                { key: 'formatOnSave', label: 'Format on Save', desc: 'Auto-format code when saving' }
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div>
                    <div className="font-medium text-white">{label}</div>
                    <div className="text-sm text-gray-400">{desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localPreferences[key]}
                      onChange={(e) => handlePreferenceChange(key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Appearance Settings</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                <select
                  value={localPreferences.theme}
                  onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="aetherflow-dark">AETHERFLOW Dark</option>
                  <option value="aetherflow-light">AETHERFLOW Light</option>
                  <option value="cosmic">Cosmic Mode</option>
                  <option value="high-contrast">High Contrast</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Color Scheme</label>
                <select
                  value={localPreferences.colorScheme}
                  onChange={(e) => handlePreferenceChange('colorScheme', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="professional">Professional</option>
                  <option value="vibrant">Vibrant</option>
                  <option value="cosmic">Cosmic</option>
                  <option value="monochrome">Monochrome</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Accent Color</label>
                <div className="flex space-x-2">
                  {['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'].map(color => (
                    <button
                      key={color}
                      onClick={() => handlePreferenceChange('accentColor', color)}
                      className={`w-8 h-8 rounded-lg border-2 ${
                        localPreferences.accentColor === color ? 'border-white' : 'border-gray-600'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {[
                { key: 'glassMorphism', label: 'Glass Morphism', desc: 'Enable glass-like transparent effects' },
                { key: 'animations', label: 'Animations', desc: 'Enable smooth animations and transitions' }
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div>
                    <div className="font-medium text-white">{label}</div>
                    <div className="text-sm text-gray-400">{desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localPreferences[key]}
                      onChange={(e) => handlePreferenceChange(key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'ai':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">AI Assistant Settings</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">AI Model</label>
                <select
                  value={localPreferences.aiModel}
                  onChange={(e) => handlePreferenceChange('aiModel', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="meta-llama/llama-4-maverick">LLaMA-4-Maverick (Primary)</option>
                  <option value="gpt-4o">GPT-4o (Fallback)</option>
                  <option value="claude-3.5-sonnet">Claude 3.5 Sonnet (Fallback)</option>
                  <option value="auto">Auto-Select Best Model</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">AI Personality</label>
                <select
                  value={localPreferences.aiPersonality}
                  onChange={(e) => handlePreferenceChange('aiPersonality', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="technical">Technical Expert</option>
                  <option value="creative">Creative</option>
                  <option value="cosmic">Cosmic Sage</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              {[
                { key: 'aiSuggestions', label: 'AI Code Suggestions', desc: 'Show AI-powered code completions' },
                { key: 'contextAware', label: 'Context Awareness', desc: 'AI understands your entire project context' },
                { key: 'aiVoice', label: 'Voice Interaction', desc: 'Enable voice commands and responses' }
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div>
                    <div className="font-medium text-white">{label}</div>
                    <div className="text-sm text-gray-400">{desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localPreferences[key]}
                      onChange={(e) => handlePreferenceChange(key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-64">
            <Settings size={48} className="text-gray-600 mb-4" />
            <p className="text-gray-500">Settings for {section} coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="w-full max-w-6xl h-[80vh] bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <Settings size={24} className="text-blue-400" />
            <h2 className="text-2xl font-semibold text-white">Settings & Preferences</h2>
          </div>
          <button onClick={onClose} className="btn btn-ghost">
            <X size={20} />
          </button>
        </div>

        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-slate-700/30 border-r border-slate-700 p-4">
            <nav className="space-y-1">
              {settingsTabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all ${
                    activeTab === id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-auto p-6">
              {renderSettingSection(activeTab)}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-slate-700 bg-slate-700/20">
              <div className="flex space-x-3">
                <button onClick={handleReset} className="btn btn-secondary">
                  <RotateCcw size={16} />
                  Reset to Defaults
                </button>
                <button className="btn btn-secondary">
                  <Download size={16} />
                  Export Settings
                </button>
                <button className="btn btn-secondary">
                  <Upload size={16} />
                  Import Settings
                </button>
              </div>
              <div className="flex space-x-3">
                <button onClick={onClose} className="btn btn-secondary">
                  Cancel
                </button>
                <button onClick={handleSave} className="btn btn-primary">
                  <Save size={16} />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;