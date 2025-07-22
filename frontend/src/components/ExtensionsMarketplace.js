import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, Star, Trash2, Settings, 
  Package, Zap, Code, Palette, Bug, ChevronDown,
  CheckCircle, AlertCircle, Clock, ExternalLink,
  User, Calendar, TrendingUp, Grid3X3
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ExtensionsMarketplace = ({ onClose, professionalMode = true }) => {
  const [activeTab, setActiveTab] = useState('browse');
  const [extensions, setExtensions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('downloads');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExtension, setSelectedExtension] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch extensions data
  useEffect(() => {
    fetchExtensions();
    fetchCategories();
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
      const data = await response.json();
      setExtensions(data);
    } catch (error) {
      console.error('Error fetching extensions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/extensions/categories`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInstallExtension = async (extensionId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/extensions/install`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extension_id: extensionId })
      });
      
      if (response.ok) {
        await fetchExtensions(); // Refresh list
        // Show success notification
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
        await fetchExtensions(); // Refresh list
        // Show success notification
      }
    } catch (error) {
      console.error('Error uninstalling extension:', error);
    }
  };

  const handleExtensionClick = (extension) => {
    setSelectedExtension(extension);
    setShowDetails(true);
  };

  const ExtensionCard = ({ extension }) => (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer group"
      onClick={() => handleExtensionClick(extension)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {extension.icon ? (
            <img src={extension.icon} alt={extension.name} className="w-10 h-10 rounded" />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600">
              {extension.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              by {extension.publisher}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {extension.compatible ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
          
          {extension.installed ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUninstallExtension(extension.id);
              }}
              className="px-3 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800"
            >
              <Trash2 className="w-3 h-3 inline mr-1" />
              Uninstall
            </button>
          ) : extension.compatible ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleInstallExtension(extension.id);
              }}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Download className="w-3 h-3 inline mr-1" />
              Install
            </button>
          ) : (
            <span className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md">
              Incompatible
            </span>
          )}
        </div>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
        {extension.description}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Download className="w-3 h-3" />
            <span>{extension.downloads.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3" />
            <span>{extension.rating}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {extension.tags.slice(0, 2).map(tag => (
            <span
              key={tag}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const CategoryFilter = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        onClick={() => setSelectedCategory('all')}
        className={`px-3 py-1 rounded-md text-sm font-medium ${
          selectedCategory === 'all'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
      >
        All Categories
      </button>
      {categories.map(category => (
        <button
          key={category.id}
          onClick={() => setSelectedCategory(category.id)}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            selectedCategory === category.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {category.name} ({category.count})
        </button>
      ))}
    </div>
  );

  const ExtensionDetails = () => {
    if (!selectedExtension) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                {selectedExtension.icon ? (
                  <img src={selectedExtension.icon} alt={selectedExtension.name} className="w-16 h-16 rounded" />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedExtension.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    by {selectedExtension.publisher} • v{selectedExtension.version}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {selectedExtension.description}
            </p>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {selectedExtension.downloads.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Downloads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">
                  {selectedExtension.rating}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {selectedExtension.compatible ? '✓' : '✗'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Compatible</div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              {selectedExtension.installed ? (
                <button
                  onClick={() => handleUninstallExtension(selectedExtension.id)}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 inline mr-2" />
                  Uninstall Extension
                </button>
              ) : selectedExtension.compatible ? (
                <button
                  onClick={() => handleInstallExtension(selectedExtension.id)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  <Download className="w-4 h-4 inline mr-2" />
                  Install Extension
                </button>
              ) : (
                <button
                  disabled
                  className="flex-1 bg-gray-400 text-white py-2 px-4 rounded-md cursor-not-allowed"
                >
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  Incompatible with AETHERFLOW
                </button>
              )}
              
              <button
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => setShowDetails(false)}
              >
                Close
              </button>
            </div>
            
            {selectedExtension.tags.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedExtension.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-40 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Package className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Extensions Marketplace
              </h1>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-4 py-2 rounded-md font-medium ${
                activeTab === 'browse'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Search className="w-4 h-4 inline mr-2" />
              Browse Extensions
            </button>
            <button
              onClick={() => setActiveTab('installed')}
              className={`px-4 py-2 rounded-md font-medium ${
                activeTab === 'installed'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <CheckCircle className="w-4 h-4 inline mr-2" />
              Installed
            </button>
          </div>
        </div>
        
        {/* Filters and Search */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search extensions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="downloads">Most Downloaded</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Name</option>
              <option value="recent">Recently Updated</option>
            </select>
          </div>
          
          {activeTab === 'browse' && <CategoryFilter />}
        </div>
        
        {/* Extensions Grid */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {extensions.map(extension => (
                <ExtensionCard key={extension.id} extension={extension} />
              ))}
            </div>
          )}
          
          {!isLoading && extensions.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {activeTab === 'installed' ? 'No Extensions Installed' : 'No Extensions Found'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {activeTab === 'installed' 
                  ? 'Browse the marketplace to find and install extensions.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
      
      {showDetails && <ExtensionDetails />}
    </div>
  );
};

export default ExtensionsMarketplace;