import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Filter, Download, Star, Trash2, Settings, 
  Package, Shield, Users, Clock, ExternalLink, 
  CheckCircle, AlertCircle, Loader
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { useNotifications } from './NotificationSystem';

const ExtensionsMarketplace = ({ isVisible, onClose, currentProject }) => {
  const [extensions, setExtensions] = useState([]);
  const [installedExtensions, setInstalledExtensions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [selectedExtension, setSelectedExtension] = useState(null);
  const [activeTab, setActiveTab] = useState('marketplace');
  
  const notifications = useNotifications();

  const categories = [
    { id: 'all', name: 'All Extensions', count: 0 },
    { id: 'themes', name: 'Themes', count: 45 },
    { id: 'languages', name: 'Languages', count: 120 },
    { id: 'debuggers', name: 'Debuggers', count: 28 },
    { id: 'formatters', name: 'Formatters', count: 35 },
    { id: 'linters', name: 'Linters', count: 67 },
    { id: 'snippets', name: 'Snippets', count: 89 },
    { id: 'productivity', name: 'Productivity', count: 156 },
    { id: 'ai', name: 'AI Tools', count: 34 },
    { id: 'cosmic', name: 'Cosmic (AETHERFLOW)', count: 12 }
  ];

  // Mock extensions data
  const mockExtensions = [
    {
      id: 'prettier',
      name: 'Prettier - Code formatter',
      description: 'VS Code plugin for prettier/prettier',
      publisher: 'Prettier',
      version: '10.1.0',
      downloads: 15600000,
      rating: 4.8,
      category: 'formatters',
      tags: ['formatter', 'javascript', 'typescript'],
      installed: false,
      icon: '🎨',
      size: '2.1 MB'
    },
    {
      id: 'eslint',
      name: 'ESLint',
      description: 'Integrates ESLint into VS Code',
      publisher: 'Microsoft',
      version: '2.4.2',
      downloads: 12300000,
      rating: 4.7,
      category: 'linters',
      tags: ['linter', 'javascript', 'typescript'],
      installed: true,
      icon: '🔍',
      size: '1.8 MB'
    },
    {
      id: 'cosmic-reality-engine',
      name: 'AETHERFLOW Cosmic Reality Engine',
      description: 'Advanced reality manipulation for multidimensional debugging',
      publisher: 'AETHERFLOW',
      version: '3.0.0',
      downloads: 25000,
      rating: 4.9,
      category: 'cosmic',
      tags: ['cosmic', 'reality', 'quantum', 'debugging'],
      installed: true,
      icon: '🌌',
      size: '15.2 MB'
    },
    {
      id: 'python',
      name: 'Python',
      description: 'IntelliSense, Linting, Debugging, Jupyter Notebooks',
      publisher: 'Microsoft',
      version: '2023.20.0',
      downloads: 45600000,
      rating: 4.6,
      category: 'languages',
      tags: ['python', 'jupyter', 'intellisense'],
      installed: false,
      icon: '🐍',
      size: '12.4 MB'
    },
    {
      id: 'github-copilot',
      name: 'GitHub Copilot',
      description: 'Your AI pair programmer',
      publisher: 'GitHub',
      version: '1.126.0',
      downloads: 8900000,
      rating: 4.5,
      category: 'ai',
      tags: ['ai', 'copilot', 'assistant'],
      installed: false,
      icon: '🤖',
      size: '5.7 MB'
    }
  ];

  useEffect(() => {
    if (isVisible) {
      loadExtensions();
      loadInstalledExtensions();
    }
  }, [isVisible]);

  const loadExtensions = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setExtensions(mockExtensions);
    } catch (error) {
      notifications.error('Failed to load extensions marketplace');
    } finally {
      setLoading(false);
    }
  };

  const loadInstalledExtensions = () => {
    const installed = mockExtensions.filter(ext => ext.installed);
    setInstalledExtensions(installed);
  };

  const installExtension = useCallback(async (extension) => {
    try {
      setLoading(true);
      notifications.info(`Installing ${extension.name}...`);
      
      // Simulate installation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setExtensions(prev => prev.map(ext => 
        ext.id === extension.id ? { ...ext, installed: true } : ext
      ));
      setInstalledExtensions(prev => [...prev, { ...extension, installed: true }]);
      
      notifications.success(`${extension.name} installed successfully!`);
    } catch (error) {
      notifications.error(`Failed to install ${extension.name}`);
    } finally {
      setLoading(false);
    }
  }, [notifications]);

  const uninstallExtension = useCallback(async (extension) => {
    try {
      setLoading(true);
      notifications.info(`Uninstalling ${extension.name}...`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setExtensions(prev => prev.map(ext => 
        ext.id === extension.id ? { ...ext, installed: false } : ext
      ));
      setInstalledExtensions(prev => prev.filter(ext => ext.id !== extension.id));
      
      notifications.success(`${extension.name} uninstalled successfully!`);
    } catch (error) {
      notifications.error(`Failed to uninstall ${extension.name}`);
    } finally {
      setLoading(false);
    }
  }, [notifications]);

  const filteredExtensions = extensions.filter(ext => {
    const matchesSearch = searchQuery === '' || 
      ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ext.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ext.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || ext.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 w-[95vw] h-[90vh] max-w-7xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-4">
            <Package className="text-blue-400" size={24} />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Extensions Marketplace
            </h2>
            <span className="text-sm text-gray-400">
              {filteredExtensions.length} extensions
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => loadExtensions()}
              className="btn btn-ghost btn-sm"
              disabled={loading}
              title="Refresh"
            >
              <Download size={16} />
            </button>
            
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 border-r border-slate-700/50 p-4">
            {/* Tabs */}
            <div className="flex bg-slate-800/50 rounded-lg p-1 mb-6">
              <button
                onClick={() => setActiveTab('marketplace')}
                className={`flex-1 px-3 py-2 rounded text-sm transition-all ${
                  activeTab === 'marketplace' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Marketplace
              </button>
              <button
                onClick={() => setActiveTab('installed')}
                className={`flex-1 px-3 py-2 rounded text-sm transition-all ${
                  activeTab === 'installed' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Installed ({installedExtensions.length})
              </button>
            </div>

            {/* Categories */}
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Categories</h3>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600/20 text-blue-300 border-blue-500/30 border'
                      : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <span>{category.name}</span>
                  <span className="text-xs text-gray-500">{category.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Search and Filter */}
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search extensions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <button className="btn btn-ghost btn-sm">
                  <Filter size={16} />
                  Filter
                </button>
              </div>
            </div>

            {/* Extensions List */}
            <div className="flex-1 p-6 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <div className="grid gap-4">
                  {(activeTab === 'marketplace' ? filteredExtensions : installedExtensions).map(extension => (
                    <div
                      key={extension.id}
                      className="glass-surface p-6 rounded-xl hover:border-blue-500/30 transition-all cursor-pointer"
                      onClick={() => setSelectedExtension(extension)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="text-3xl">{extension.icon}</div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-white mb-1">
                              {extension.name}
                            </h3>
                            <p className="text-sm text-gray-400 mb-2">
                              {extension.description}
                            </p>
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>{extension.publisher}</span>
                              <span>v{extension.version}</span>
                              <span>{extension.downloads.toLocaleString()} downloads</span>
                              <span className="flex items-center space-x-1">
                                <Star size={12} className="text-yellow-400 fill-current" />
                                <span>{extension.rating}</span>
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-1 mt-2">
                              {extension.tags.map(tag => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-slate-700/50 rounded text-xs text-gray-300"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2">
                          {extension.installed ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  uninstallExtension(extension);
                                }}
                                className="btn btn-sm bg-red-600/20 text-red-300 hover:bg-red-600/40"
                                disabled={loading}
                              >
                                <Trash2 size={14} />
                                Uninstall
                              </button>
                              <div className="flex items-center space-x-1 text-xs text-green-400">
                                <CheckCircle size={12} />
                                <span>Installed</span>
                              </div>
                            </>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                installExtension(extension);
                              }}
                              className="btn btn-sm btn-primary"
                              disabled={loading}
                            >
                              {loading ? <Loader size={14} className="animate-spin" /> : <Download size={14} />}
                              Install
                            </button>
                          )}
                          <span className="text-xs text-gray-500">{extension.size}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtensionsMarketplace;