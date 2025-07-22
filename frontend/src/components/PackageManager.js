import React, { useState, useCallback, useEffect } from 'react';
import { 
  Package, Search, Download, Trash2, Star, Shield, AlertTriangle,
  CheckCircle, Clock, Zap, Settings, Filter, TrendingUp, Award,
  ExternalLink, Eye, X, Plus, Minus, RefreshCw, Info, Globe
} from 'lucide-react';

const PackageManager = ({ isVisible, onClose, currentProject }) => {
  const [activeTab, setActiveTab] = useState('installed');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isInstalling, setIsInstalling] = useState(new Set());
  const [installedPackages, setInstalledPackages] = useState([]);
  const [availablePackages, setAvailablePackages] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  // Mock data
  const mockInstalledPackages = [
    {
      id: 'react',
      name: 'React',
      version: '19.0.0',
      description: 'A JavaScript library for building user interfaces',
      category: 'framework',
      size: '2.3 MB',
      lastUpdated: '2025-01-15',
      status: 'stable',
      dependencies: 3,
      vulnerabilities: 0,
      canUninstall: false // core dependency
    },
    {
      id: 'lodash',
      name: 'Lodash',
      version: '4.17.21',
      description: 'A modern JavaScript utility library',
      category: 'utility',
      size: '1.4 MB',
      lastUpdated: '2024-12-10',
      status: 'outdated',
      dependencies: 0,
      vulnerabilities: 1,
      canUninstall: true,
      updateAvailable: '4.18.0'
    },
    {
      id: 'axios',
      name: 'Axios',
      version: '1.8.4',
      description: 'Promise based HTTP client for the browser and Node.js',
      category: 'networking',
      size: '856 KB',
      lastUpdated: '2025-01-01',
      status: 'stable',
      dependencies: 2,
      vulnerabilities: 0,
      canUninstall: true
    },
    {
      id: 'prettier',
      name: 'Prettier',
      version: '3.2.4',
      description: 'An opinionated code formatter',
      category: 'development',
      size: '12.1 MB',
      lastUpdated: '2024-11-20',
      status: 'stable',
      dependencies: 8,
      vulnerabilities: 0,
      canUninstall: true
    },
    {
      id: 'eslint',
      name: 'ESLint',
      version: '9.15.0',
      description: 'A tool for identifying and reporting on patterns in JavaScript',
      category: 'development',
      size: '8.7 MB',
      lastUpdated: '2024-12-15',
      status: 'stable',
      dependencies: 12,
      vulnerabilities: 0,
      canUninstall: true
    }
  ];

  const mockAvailablePackages = [
    {
      id: 'typescript',
      name: 'TypeScript',
      version: '5.3.3',
      description: 'A strongly typed programming language that builds on JavaScript',
      category: 'language',
      downloads: '45M/week',
      rating: 4.9,
      author: 'Microsoft',
      size: '15.2 MB',
      isInstalled: false,
      isPopular: true,
      lastUpdated: '2025-01-10'
    },
    {
      id: 'tailwindcss',
      name: 'Tailwind CSS',
      version: '3.4.17',
      description: 'A utility-first CSS framework',
      category: 'styling',
      downloads: '12M/week',
      rating: 4.8,
      author: 'Tailwind Labs',
      size: '3.2 MB',
      isInstalled: false,
      isPopular: true,
      lastUpdated: '2025-01-12'
    },
    {
      id: 'framer-motion',
      name: 'Framer Motion',
      version: '11.0.5',
      description: 'A production-ready motion library for React',
      category: 'animation',
      downloads: '2.8M/week',
      rating: 4.7,
      author: 'Framer',
      size: '1.9 MB',
      isInstalled: false,
      isPopular: false,
      lastUpdated: '2024-12-28'
    },
    {
      id: 'react-query',
      name: 'TanStack Query',
      version: '5.17.19',
      description: 'Powerful data synchronization for React',
      category: 'data',
      downloads: '3.5M/week',
      rating: 4.6,
      author: 'TanStack',
      size: '2.1 MB',
      isInstalled: false,
      isPopular: true,
      lastUpdated: '2025-01-08'
    },
    {
      id: 'zustand',
      name: 'Zustand',
      version: '4.4.7',
      description: 'A small, fast and scalable bearbones state-management solution',
      category: 'state',
      downloads: '1.9M/week',
      rating: 4.8,
      author: 'pmndrs',
      size: '156 KB',
      isInstalled: false,
      isPopular: false,
      lastUpdated: '2024-12-20'
    }
  ];

  const mockRecommendations = [
    {
      id: 'react-hook-form',
      name: 'React Hook Form',
      reason: 'Based on your React usage',
      confidence: 0.9,
      category: 'forms'
    },
    {
      id: 'vitest',
      name: 'Vitest',
      reason: 'For testing your JavaScript code',
      confidence: 0.85,
      category: 'testing'
    },
    {
      id: 'date-fns',
      name: 'date-fns',
      reason: 'Alternative to moment.js',
      confidence: 0.8,
      category: 'utility'
    }
  ];

  useEffect(() => {
    if (isVisible) {
      setInstalledPackages(mockInstalledPackages);
      setAvailablePackages(mockAvailablePackages);
      setRecommendations(mockRecommendations);
    }
  }, [isVisible]);

  const handleInstallPackage = useCallback(async (packageId) => {
    setIsInstalling(prev => new Set([...prev, packageId]));
    
    // Simulate installation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const packageToInstall = availablePackages.find(pkg => pkg.id === packageId);
    if (packageToInstall) {
      const newPackage = {
        id: packageToInstall.id,
        name: packageToInstall.name,
        version: packageToInstall.version,
        description: packageToInstall.description,
        category: packageToInstall.category,
        size: packageToInstall.size,
        lastUpdated: new Date().toISOString().split('T')[0],
        status: 'stable',
        dependencies: Math.floor(Math.random() * 10),
        vulnerabilities: 0,
        canUninstall: true
      };
      
      setInstalledPackages(prev => [...prev, newPackage]);
      setAvailablePackages(prev => prev.map(pkg => 
        pkg.id === packageId ? { ...pkg, isInstalled: true } : pkg
      ));
    }
    
    setIsInstalling(prev => {
      const newSet = new Set(prev);
      newSet.delete(packageId);
      return newSet;
    });
  }, [availablePackages]);

  const handleUninstallPackage = useCallback(async (packageId) => {
    setIsInstalling(prev => new Set([...prev, packageId]));
    
    // Simulate uninstallation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setInstalledPackages(prev => prev.filter(pkg => pkg.id !== packageId));
    setAvailablePackages(prev => prev.map(pkg => 
      pkg.id === packageId ? { ...pkg, isInstalled: false } : pkg
    ));
    
    setIsInstalling(prev => {
      const newSet = new Set(prev);
      newSet.delete(packageId);
      return newSet;
    });
  }, []);

  const handleUpdatePackage = useCallback(async (packageId) => {
    setIsInstalling(prev => new Set([...prev, packageId]));
    
    // Simulate update
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    setInstalledPackages(prev => prev.map(pkg => 
      pkg.id === packageId 
        ? { ...pkg, version: pkg.updateAvailable, status: 'stable', updateAvailable: undefined }
        : pkg
    ));
    
    setIsInstalling(prev => {
      const newSet = new Set(prev);
      newSet.delete(packageId);
      return newSet;
    });
  }, []);

  const filteredInstalledPackages = installedPackages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pkg.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || pkg.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredAvailablePackages = availablePackages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pkg.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || pkg.category === categoryFilter;
    return matchesSearch && matchesCategory && !pkg.isInstalled;
  });

  const categories = ['all', 'framework', 'utility', 'development', 'styling', 'networking', 'data', 'state', 'animation', 'testing', 'forms', 'language'];

  if (!isVisible) return null;

  const tabs = [
    { id: 'installed', label: 'Installed', count: installedPackages.length },
    { id: 'browse', label: 'Browse', count: availablePackages.filter(p => !p.isInstalled).length },
    { id: 'updates', label: 'Updates', count: installedPackages.filter(p => p.updateAvailable).length },
    { id: 'recommendations', label: 'Recommended', count: recommendations.length }
  ];

  const PackageCard = ({ pkg, isInstalled = false, showActions = true }) => (
    <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600 hover:border-slate-500 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-white truncate">{pkg.name}</h3>
            <span className="text-xs px-2 py-1 bg-slate-600 rounded text-gray-300">
              v{pkg.version}
            </span>
            {pkg.isPopular && (
              <TrendingUp size={12} className="text-orange-400" title="Popular" />
            )}
            {isInstalled && pkg.vulnerabilities > 0 && (
              <AlertTriangle size={12} className="text-red-400" title={`${pkg.vulnerabilities} vulnerabilities`} />
            )}
            {isInstalled && pkg.status === 'outdated' && (
              <Clock size={12} className="text-yellow-400" title="Update available" />
            )}
            {isInstalled && pkg.status === 'stable' && (
              <CheckCircle size={12} className="text-green-400" title="Up to date" />
            )}
          </div>
          <p className="text-sm text-gray-400 mb-2">{pkg.description}</p>
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            {isInstalled ? (
              <>
                <span>Size: {pkg.size}</span>
                <span>Dependencies: {pkg.dependencies}</span>
                <span>Updated: {pkg.lastUpdated}</span>
              </>
            ) : (
              <>
                <span>Downloads: {pkg.downloads}</span>
                <div className="flex items-center space-x-1">
                  <Star size={10} className="text-yellow-400" />
                  <span>{pkg.rating}</span>
                </div>
                <span>by {pkg.author}</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      {showActions && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded ${
              pkg.category === 'framework' ? 'bg-blue-600/20 text-blue-300' :
              pkg.category === 'utility' ? 'bg-green-600/20 text-green-300' :
              pkg.category === 'development' ? 'bg-purple-600/20 text-purple-300' :
              'bg-gray-600/20 text-gray-300'
            }`}>
              {pkg.category}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {isInstalled ? (
              <>
                {pkg.updateAvailable && (
                  <button
                    onClick={() => handleUpdatePackage(pkg.id)}
                    disabled={isInstalling.has(pkg.id)}
                    className="btn btn-primary btn-xs"
                  >
                    {isInstalling.has(pkg.id) ? (
                      <RefreshCw size={10} className="animate-spin" />
                    ) : (
                      <Download size={10} />
                    )}
                    Update
                  </button>
                )}
                {pkg.canUninstall && (
                  <button
                    onClick={() => handleUninstallPackage(pkg.id)}
                    disabled={isInstalling.has(pkg.id)}
                    className="btn btn-secondary btn-xs"
                  >
                    {isInstalling.has(pkg.id) ? (
                      <RefreshCw size={10} className="animate-spin" />
                    ) : (
                      <Trash2 size={10} />
                    )}
                    Remove
                  </button>
                )}
                {!pkg.canUninstall && (
                  <span className="text-xs text-gray-500">Core dependency</span>
                )}
              </>
            ) : (
              <button
                onClick={() => handleInstallPackage(pkg.id)}
                disabled={isInstalling.has(pkg.id)}
                className="btn btn-primary btn-xs"
              >
                {isInstalling.has(pkg.id) ? (
                  <RefreshCw size={10} className="animate-spin" />
                ) : (
                  <Download size={10} />
                )}
                Install
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'installed':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                {filteredInstalledPackages.length} package{filteredInstalledPackages.length !== 1 ? 's' : ''} installed
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>Total size: {Math.round(installedPackages.reduce((sum, pkg) => sum + parseFloat(pkg.size) || 0, 0) * 10) / 10} MB</span>
              </div>
            </div>
            
            {filteredInstalledPackages.map(pkg => (
              <PackageCard key={pkg.id} pkg={pkg} isInstalled />
            ))}
            
            {filteredInstalledPackages.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Package size={48} className="mx-auto mb-4 opacity-50" />
                <p>No installed packages found</p>
              </div>
            )}
          </div>
        );

      case 'browse':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                {filteredAvailablePackages.length} package{filteredAvailablePackages.length !== 1 ? 's' : ''} available
              </p>
              <button className="btn btn-ghost btn-sm">
                <TrendingUp size={12} />
                Popular
              </button>
            </div>
            
            {filteredAvailablePackages.map(pkg => (
              <PackageCard key={pkg.id} pkg={pkg} isInstalled={false} />
            ))}
            
            {filteredAvailablePackages.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Search size={48} className="mx-auto mb-4 opacity-50" />
                <p>No packages found matching your search</p>
              </div>
            )}
          </div>
        );

      case 'updates':
        const updatablePackages = installedPackages.filter(pkg => pkg.updateAvailable);
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                {updatablePackages.length} update{updatablePackages.length !== 1 ? 's' : ''} available
              </p>
              {updatablePackages.length > 0 && (
                <button className="btn btn-primary btn-sm">
                  <Download size={12} />
                  Update All
                </button>
              )}
            </div>
            
            {updatablePackages.map(pkg => (
              <PackageCard key={pkg.id} pkg={pkg} isInstalled />
            ))}
            
            {updatablePackages.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p>All packages are up to date</p>
              </div>
            )}
          </div>
        );

      case 'recommendations':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              Recommended packages based on your project
            </p>
            
            {recommendations.map(rec => {
              const pkg = availablePackages.find(p => p.id === rec.id);
              return pkg ? (
                <div key={rec.id} className="relative">
                  <div className="absolute top-2 right-2 z-10">
                    <div className="flex items-center space-x-1 text-xs bg-blue-600 text-white px-2 py-1 rounded">
                      <Award size={10} />
                      <span>{Math.round(rec.confidence * 100)}% match</span>
                    </div>
                  </div>
                  <PackageCard pkg={pkg} isInstalled={false} />
                  <div className="mt-2 text-xs text-gray-400">
                    <Info size={10} className="inline mr-1" />
                    {rec.reason}
                  </div>
                </div>
              ) : null;
            })}
            
            {recommendations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Zap size={48} className="mx-auto mb-4 opacity-50" />
                <p>No recommendations available</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="w-full max-w-6xl h-[85vh] bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <Package size={20} className="text-green-400" />
            <h2 className="text-lg font-semibold text-white">Package Manager</h2>
            {currentProject && (
              <span className="text-sm text-gray-400">- {currentProject.name}</span>
            )}
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            <X size={16} />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b border-slate-700 bg-slate-700/20">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search packages..."
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            
            <button className="btn btn-ghost btn-sm">
              <Filter size={14} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-700/30">
          {tabs.map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-700/50'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <span>{label}</span>
              {count > 0 && (
                <span className={`px-2 py-1 rounded text-xs ${
                  activeTab === id ? 'bg-blue-600' : 'bg-gray-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default PackageManager;