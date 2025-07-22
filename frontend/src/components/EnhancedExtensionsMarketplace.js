import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Filter, Download, Star, Trash2, Settings, Package, Zap, Code, 
  Palette, Bug, ChevronDown, CheckCircle, AlertCircle, Clock, ExternalLink,
  User, Calendar, TrendingUp, Grid3X3, Shield, Activity, Brain, Workflow,
  Layers, Box, Cpu, Globe, Terminal, FileCode, Brush, Database, Lock,
  Award, Crown, ThumbsUp, MessageSquare, Eye, X, ChevronRight, Play, GitBranch
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const EnhancedExtensionsMarketplace = ({ onClose, professionalMode = true }) => {
  const [activeTab, setActiveTab] = useState('browse');
  const [extensions, setExtensions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('downloads');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExtension, setSelectedExtension] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [installedExtensions, setInstalledExtensions] = useState([]);
  const [updateCount, setUpdateCount] = useState(0);
  const [securityAnalysis, setSecurityAnalysis] = useState({});

  useEffect(() => {
    fetchExtensions();
    fetchCategories();
    fetchInstalledExtensions();
  }, [selectedCategory, searchQuery, sortBy, activeTab]);

  const fetchExtensions = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        category: selectedCategory,
        search: searchQuery,
        sort_by: sortBy,
        installed_only: activeTab === 'installed'
      });
      
      const response = await fetch(`${BACKEND_URL}/api/extensions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setExtensions(data);
      } else {
        setExtensions(getMockExtensions());
      }
    } catch (error) {
      console.error('Error fetching extensions:', error);
      setExtensions(getMockExtensions());
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/extensions/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        setCategories(getMockCategories());
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(getMockCategories());
    }
  };

  const fetchInstalledExtensions = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/extensions/installed`);
      if (response.ok) {
        const data = await response.json();
        setInstalledExtensions(data);
        setUpdateCount(data.filter(ext => ext.hasUpdate).length);
      }
    } catch (error) {
      console.error('Error fetching installed extensions:', error);
    }
  };

  // Mock data for demo
  const getMockExtensions = () => [
    {
      id: 'aetherflow-ai-copilot',
      name: 'AETHERFLOW AI Copilot',
      publisher: 'AETHERFLOW Team',
      description: 'Advanced AI coding assistant with multi-model support and context awareness',
      category: 'ai',
      version: '2.1.0',
      downloads: 125000,
      rating: 4.9,
      reviews: 1247,
      compatible: true,
      installed: false,
      featured: true,
      trending: true,
      verified: true,
      hasUpdate: false,
      securityScore: 98,
      icon: null,
      tags: ['ai', 'copilot', 'coding', 'autocomplete'],
      lastUpdated: '2025-01-20',
      size: '45.2 MB',
      permissions: ['Code access', 'Network requests', 'File system'],
      keyFeatures: [
        'Multi-model AI support (GPT-4, Claude, Gemini)',
        'Context-aware code suggestions',
        'Natural language to code',
        'Code explanation and documentation',
        'Real-time collaboration insights'
      ],
      changelog: 'Added support for Gemini Pro model, improved context awareness by 40%'
    },
    {
      id: 'theme-cosmic-dark',
      name: 'Cosmic Dark Pro',
      publisher: 'ThemeForge Studios',
      description: 'Professional dark theme with cosmic elements and customizable syntax highlighting',
      category: 'themes',
      version: '3.5.2',
      downloads: 89500,
      rating: 4.8,
      reviews: 892,
      compatible: true,
      installed: true,
      featured: false,
      trending: true,
      verified: true,
      hasUpdate: true,
      securityScore: 100,
      icon: null,
      tags: ['theme', 'dark', 'cosmic', 'syntax'],
      lastUpdated: '2025-01-18',
      size: '2.1 MB',
      permissions: ['UI customization'],
      keyFeatures: [
        'Multiple color variants',
        'Customizable syntax highlighting',
        'Icon theme included',
        'Eye strain reduction',
        'High contrast support'
      ]
    },
    {
      id: 'git-flow-master',
      name: 'Git Flow Master',
      publisher: 'DevOps Pro',
      description: 'Advanced Git workflow management with visual branching and merge conflict resolution',
      category: 'version-control',
      version: '4.2.1',
      downloads: 67800,
      rating: 4.7,
      reviews: 654,
      compatible: true,
      installed: false,
      featured: true,
      trending: false,
      verified: true,
      hasUpdate: false,
      securityScore: 95,
      icon: null,
      tags: ['git', 'version-control', 'workflow', 'merging'],
      size: '12.8 MB',
      permissions: ['Git repository access', 'File system'],
      keyFeatures: [
        'Visual branch management',
        'Smart merge conflict resolution',
        'Automated workflow templates',
        'Code review integration',
        'Release management'
      ]
    },
    {
      id: 'docker-dev-suite',
      name: 'Docker Development Suite',
      publisher: 'Container Labs',
      description: 'Complete Docker development environment with container management and debugging',
      category: 'containers',
      version: '1.8.4',
      downloads: 45600,
      rating: 4.6,
      reviews: 423,
      compatible: true,
      installed: true,
      featured: false,
      trending: false,
      verified: true,
      hasUpdate: false,
      securityScore: 92,
      icon: null,
      tags: ['docker', 'containers', 'devops', 'debugging'],
      size: '28.4 MB',
      permissions: ['Docker daemon access', 'Network requests', 'File system'],
      keyFeatures: [
        'Container lifecycle management',
        'Docker Compose integration',
        'Image building and debugging',
        'Registry management',
        'Resource monitoring'
      ]
    },
    {
      id: 'api-testing-pro',
      name: 'API Testing Pro',
      publisher: 'TestMaster Inc',
      description: 'Comprehensive API testing and documentation tool with automated test generation',
      category: 'testing',
      version: '2.7.0',
      downloads: 38200,
      rating: 4.5,
      reviews: 287,
      compatible: true,
      installed: false,
      featured: false,
      trending: true,
      verified: true,
      hasUpdate: false,
      securityScore: 94,
      icon: null,
      tags: ['api', 'testing', 'documentation', 'automation'],
      size: '18.7 MB',
      permissions: ['Network requests', 'File system'],
      keyFeatures: [
        'Visual API client',
        'Automated test generation',
        'Response validation',
        'Collection management',
        'CI/CD integration'
      ]
    }
  ];

  const getMockCategories = () => [
    { id: 'ai', name: 'AI & Machine Learning', count: 23, icon: 'brain' },
    { id: 'themes', name: 'Themes & UI', count: 45, icon: 'palette' },
    { id: 'version-control', name: 'Version Control', count: 18, icon: 'git-branch' },
    { id: 'containers', name: 'Containers & DevOps', count: 12, icon: 'box' },
    { id: 'testing', name: 'Testing & Quality', count: 15, icon: 'bug' },
    { id: 'productivity', name: 'Productivity', count: 32, icon: 'zap' },
    { id: 'languages', name: 'Language Support', count: 28, icon: 'code' },
    { id: 'debugging', name: 'Debugging', count: 11, icon: 'activity' }
  ];

  const handleInstallExtension = async (extensionId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/extensions/install`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extension_id: extensionId })
      });
      
      if (response.ok) {
        await fetchExtensions();
        await fetchInstalledExtensions();
      }
    } catch (error) {
      console.error('Error installing extension:', error);
    }
  };

  const handleUninstallExtension = async (extensionId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/extensions/${extensionId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchExtensions();
        await fetchInstalledExtensions();
      }
    } catch (error) {
      console.error('Error uninstalling extension:', error);
    }
  };

  const getCategoryIcon = (categoryId) => {
    const icons = {
      'ai': Brain,
      'themes': Palette,
      'version-control': GitBranch,
      'containers': Box,
      'testing': Bug,
      'productivity': Zap,
      'languages': Code,
      'debugging': Activity
    };
    return icons[categoryId] || Package;
  };

  const getSecurityColor = (score) => {
    if (score >= 95) return 'text-green-400';
    if (score >= 85) return 'text-yellow-400';
    return 'text-red-400';
  };

  const EnhancedExtensionCard = ({ extension }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
      <div 
        className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-blue-500/50 transition-all cursor-pointer group relative overflow-hidden"
        onClick={() => setSelectedExtension(extension)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              {extension.icon ? (
                <img src={extension.icon} alt={extension.name} className="w-12 h-12 rounded-lg flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                    {extension.name}
                  </h3>
                  {extension.verified && (
                    <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-400">
                  by {extension.publisher} • v{extension.version}
                </p>
              </div>
            </div>
            
            {/* Badges */}
            <div className="flex flex-col items-end space-y-1 flex-shrink-0">
              {extension.featured && (
                <div className="px-2 py-1 bg-yellow-500 text-black rounded text-xs font-bold flex items-center space-x-1">
                  <Crown size={10} />
                  <span>Featured</span>
                </div>
              )}
              {extension.trending && (
                <div className="px-2 py-1 bg-red-500 text-white rounded text-xs font-bold flex items-center space-x-1">
                  <TrendingUp size={10} />
                  <span>Trending</span>
                </div>
              )}
              {extension.hasUpdate && (
                <div className="px-2 py-1 bg-blue-500 text-white rounded text-xs font-bold">
                  Update Available
                </div>
              )}
            </div>
          </div>
          
          <p className="text-sm text-gray-300 mb-4 line-clamp-2 leading-relaxed">
            {extension.description}
          </p>
          
          {/* Enhanced Stats */}
          <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Download size={12} />
                <span>{extension.downloads.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star size={12} className="text-yellow-400" />
                <span>{extension.rating}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare size={12} />
                <span>{extension.reviews}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield size={12} className={getSecurityColor(extension.securityScore)} />
                <span className={getSecurityColor(extension.securityScore)}>{extension.securityScore}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {extension.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-slate-700 text-gray-300 rounded text-xs"
              >
                {tag}
              </span>
            ))}
            {extension.tags.length > 3 && (
              <span className="px-2 py-1 bg-slate-700 text-gray-300 rounded text-xs">
                +{extension.tags.length - 3}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className={`transition-all duration-200 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {extension.installed ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle configure
                      }}
                      className="btn btn-ghost btn-sm"
                    >
                      <Settings size={12} />
                      Configure
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUninstallExtension(extension.id);
                      }}
                      className="btn btn-ghost btn-sm text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={12} />
                      Uninstall
                    </button>
                  </>
                ) : extension.compatible ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInstallExtension(extension.id);
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    <Download size={12} />
                    Install
                  </button>
                ) : (
                  <span className="px-3 py-1 text-xs bg-gray-700 text-gray-400 rounded">
                    Incompatible
                  </span>
                )}
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedExtension(extension);
                  setShowDetails(true);
                }}
                className="btn btn-ghost btn-sm"
              >
                <Eye size={12} />
                Details
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CategoryFilter = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        onClick={() => setSelectedCategory('all')}
        className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all ${
          selectedCategory === 'all'
            ? 'bg-blue-600 text-white shadow-lg'
            : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
        }`}
      >
        <Grid3X3 size={14} />
        <span>All Extensions</span>
      </button>
      {categories.map(category => {
        const IconComponent = getCategoryIcon(category.id);
        return (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            <IconComponent size={14} />
            <span>{category.name}</span>
            <span className="text-xs opacity-75">({category.count})</span>
          </button>
        );
      })}
    </div>
  );

  const EnhancedExtensionDetails = () => {
    if (!selectedExtension || !showDetails) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                {selectedExtension.icon ? (
                  <img src={selectedExtension.icon} alt={selectedExtension.name} className="w-16 h-16 rounded-lg" />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h2 className="text-2xl font-bold text-white">
                      {selectedExtension.name}
                    </h2>
                    {selectedExtension.verified && (
                      <CheckCircle className="w-6 h-6 text-blue-400" />
                    )}
                  </div>
                  <p className="text-gray-400 mb-3">
                    by {selectedExtension.publisher} • v{selectedExtension.version}
                  </p>
                  
                  {/* Badges */}
                  <div className="flex items-center space-x-2 mb-4">
                    {selectedExtension.featured && (
                      <span className="px-3 py-1 bg-yellow-500 text-black rounded-lg text-sm font-bold flex items-center space-x-1">
                        <Crown size={14} />
                        <span>Featured</span>
                      </span>
                    )}
                    {selectedExtension.trending && (
                      <span className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm font-bold flex items-center space-x-1">
                        <TrendingUp size={14} />
                        <span>Trending</span>
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-300">
                    {selectedExtension.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Main Info */}
              <div className="md:col-span-2 space-y-6">
                {/* Key Features */}
                {selectedExtension.keyFeatures && (
                  <div>
                    <h3 className="font-semibold text-white mb-3 flex items-center space-x-2">
                      <Zap size={16} />
                      <span>Key Features</span>
                    </h3>
                    <div className="space-y-2">
                      {selectedExtension.keyFeatures.map((feature, index) => (
                        <div key={index} className="flex items-start space-x-3 text-gray-300">
                          <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Permissions */}
                <div>
                  <h3 className="font-semibold text-white mb-3 flex items-center space-x-2">
                    <Shield size={16} />
                    <span>Permissions Required</span>
                  </h3>
                  <div className="space-y-2">
                    {selectedExtension.permissions.map((permission, index) => (
                      <div key={index} className="flex items-center space-x-3 text-gray-300">
                        <Lock size={12} className="text-yellow-400 flex-shrink-0" />
                        <span className="text-sm">{permission}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Changelog */}
                {selectedExtension.changelog && (
                  <div>
                    <h3 className="font-semibold text-white mb-3 flex items-center space-x-2">
                      <Clock size={16} />
                      <span>What's New</span>
                    </h3>
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {selectedExtension.changelog}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats & Info */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-4">Statistics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Downloads</span>
                      <span className="text-white font-medium">{selectedExtension.downloads.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Rating</span>
                      <div className="flex items-center space-x-1">
                        <Star size={14} className="text-yellow-400" />
                        <span className="text-white font-medium">{selectedExtension.rating}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Reviews</span>
                      <span className="text-white font-medium">{selectedExtension.reviews}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Security Score</span>
                      <div className="flex items-center space-x-1">
                        <Shield size={14} className={getSecurityColor(selectedExtension.securityScore)} />
                        <span className={`font-medium ${getSecurityColor(selectedExtension.securityScore)}`}>
                          {selectedExtension.securityScore}/100
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Size</span>
                      <span className="text-white font-medium">{selectedExtension.size}</span>
                    </div>
                  </div>
                </div>

                {/* Publisher Info */}
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-3">Publisher</h4>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-white">{selectedExtension.publisher}</div>
                      {selectedExtension.verified && (
                        <div className="text-xs text-blue-400 flex items-center space-x-1">
                          <CheckCircle size={10} />
                          <span>Verified Publisher</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    Last updated: {selectedExtension.lastUpdated}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h4 className="font-semibold text-white mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedExtension.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-slate-700 text-gray-300 rounded-lg text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-6 border-t border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>Version {selectedExtension.version}</span>
                <span>•</span>
                <span>{selectedExtension.size}</span>
                <span>•</span>
                <span>Updated {selectedExtension.lastUpdated}</span>
              </div>
              
              <div className="flex space-x-3">
                {selectedExtension.installed ? (
                  <>
                    {selectedExtension.hasUpdate && (
                      <button className="btn btn-primary">
                        <Download size={16} />
                        Update
                      </button>
                    )}
                    <button
                      onClick={() => handleUninstallExtension(selectedExtension.id)}
                      className="btn btn-secondary text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                      Uninstall
                    </button>
                  </>
                ) : selectedExtension.compatible ? (
                  <button
                    onClick={() => handleInstallExtension(selectedExtension.id)}
                    className="btn btn-primary"
                  >
                    <Download size={16} />
                    Install Extension
                  </button>
                ) : (
                  <button
                    disabled
                    className="btn btn-secondary opacity-50 cursor-not-allowed"
                  >
                    <AlertCircle size={16} />
                    Incompatible
                  </button>
                )}
                
                <button
                  onClick={() => setShowDetails(false)}
                  className="btn btn-ghost"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-40 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Enhanced Header */}
        <div className="bg-slate-800 border-b border-slate-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Package size={16} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Extensions Marketplace</h1>
                  <p className="text-xs text-gray-400">Enhance your development experience</p>
                </div>
              </div>
              
              {/* Update Badge */}
              {updateCount > 0 && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full">
                  <Download size={12} className="text-blue-400" />
                  <span className="text-xs text-blue-400 font-medium">{updateCount} Updates Available</span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Enhanced Tabs */}
          <div className="flex space-x-1 mb-4">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'browse'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-slate-700'
              }`}
            >
              <Search className="w-4 h-4 inline mr-2" />
              Browse Extensions
            </button>
            <button
              onClick={() => setActiveTab('installed')}
              className={`px-4 py-2 rounded-lg font-medium transition-all relative ${
                activeTab === 'installed'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-slate-700'
              }`}
            >
              <CheckCircle className="w-4 h-4 inline mr-2" />
              Installed
              {installedExtensions.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-blue-500 text-white rounded-full text-xs">
                  {installedExtensions.length}
                </span>
              )}
              {updateCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              )}
            </button>
          </div>

          {/* Enhanced Filters */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search extensions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="downloads">Most Downloaded</option>
                <option value="rating">Highest Rated</option>
                <option value="name">Name A-Z</option>
                <option value="recent">Recently Updated</option>
                <option value="security">Security Score</option>
              </select>
            </div>
            
            {activeTab === 'browse' && <CategoryFilter />}
          </div>
        </div>
        
        {/* Extensions Grid */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {extensions.map(extension => (
                <EnhancedExtensionCard key={extension.id} extension={extension} />
              ))}
            </div>
          )}
          
          {!isLoading && extensions.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                {activeTab === 'installed' ? 'No Extensions Installed' : 'No Extensions Found'}
              </h3>
              <p className="text-gray-400">
                {activeTab === 'installed' 
                  ? 'Browse the marketplace to find and install extensions that enhance your development workflow.'
                  : 'Try adjusting your search or filter criteria to find the perfect extension.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
      
      <EnhancedExtensionDetails />
    </div>
  );
};

export default EnhancedExtensionsMarketplace;