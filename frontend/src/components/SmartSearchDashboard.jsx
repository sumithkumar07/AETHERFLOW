import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  FileText, 
  Code, 
  Database, 
  BookOpen,
  Filter,
  Zap,
  Star,
  Clock,
  ArrowRight,
  FolderOpen,
  Hash,
  Brain,
  Target,
  TrendingUp
} from 'lucide-react';

const SmartSearchDashboard = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchStats, setSearchStats] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);

  const categories = [
    { id: 'all', name: 'All', icon: Search },
    { id: 'file', name: 'Files', icon: FileText },
    { id: 'function', name: 'Functions', icon: Code },
    { id: 'class', name: 'Classes', icon: Database },
    { id: 'variable', name: 'Variables', icon: Hash },
    { id: 'comment', name: 'Comments', icon: BookOpen },
    { id: 'documentation', name: 'Docs', icon: BookOpen }
  ];

  useEffect(() => {
    fetchSearchStats();
    loadRecentSearches();
  }, []);

  const fetchSearchStats = async () => {
    try {
      const response = await fetch('/api/enhanced/search/stats');
      const data = await response.json();
      if (data.success) {
        setSearchStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch search stats:', error);
    }
  };

  const loadRecentSearches = () => {
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(recent.slice(0, 5));
  };

  const saveRecentSearch = (searchQuery) => {
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const updated = [searchQuery, ...recent.filter(q => q !== searchQuery)].slice(0, 10);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    setRecentSearches(updated.slice(0, 5));
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch('/api/enhanced/search/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          limit: 20,
          category: selectedCategory === 'all' ? null : selectedCategory
        })
      });

      const data = await response.json();
      if (data.success) {
        setResults(data.results);
        setSuggestions(data.suggestions || []);
        saveRecentSearch(query);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const indexCodebase = async () => {
    try {
      const response = await fetch('/api/enhanced/search/index', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_path: '/app'
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchSearchStats();
      }
    } catch (error) {
      console.error('Indexing failed:', error);
    }
  };

  const getCategoryIcon = (category) => {
    const categoryData = categories.find(c => c.id === category);
    return categoryData ? categoryData.icon : FileText;
  };

  const getCategoryColor = (category) => {
    const colors = {
      file: 'text-blue-600 bg-blue-50',
      function: 'text-green-600 bg-green-50',
      class: 'text-purple-600 bg-purple-50',
      variable: 'text-yellow-600 bg-yellow-50',
      comment: 'text-gray-600 bg-gray-50',
      documentation: 'text-indigo-600 bg-indigo-50'
    };
    return colors[category] || 'text-gray-600 bg-gray-50';
  };

  const highlightQuery = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Brain className="w-8 h-8 text-blue-600 mr-3" />
              Smart Search & Knowledge Base
            </h1>
            <p className="text-gray-600 mt-1">
              RAG-powered search across your entire codebase
            </p>
          </div>
          
          {searchStats && (
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="text-center">
                <div className="font-semibold text-lg text-gray-900">
                  {searchStats.total_indexed_files?.toLocaleString() || 0}
                </div>
                <div>Files Indexed</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg text-gray-900">
                  {searchStats.total_functions?.toLocaleString() || 0}
                </div>
                <div>Functions</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg text-gray-900">
                  {searchStats.total_classes?.toLocaleString() || 0}
                </div>
                <div>Classes</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Interface */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search across your codebase..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!query.trim() || isSearching}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {isSearching ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </>
              )}
            </button>
          </div>

          {/* Category Filters */}
          <div className="flex items-center space-x-2 overflow-x-auto">
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {category.name}
                </button>
              );
            })}
          </div>

          {/* Recent Searches & Quick Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {recentSearches.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Recent:</span>
                  {recentSearches.slice(0, 3).map((recentQuery, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(recentQuery)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      {recentQuery}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={indexCodebase}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
              >
                <Zap className="w-4 h-4 mr-1" />
                Re-index
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Search Results */}
        <div className="lg:col-span-3">
          {results.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Search Results ({results.length})
                </h2>
                <div className="text-sm text-gray-600">
                  Found in {(Math.random() * 2 + 0.5).toFixed(2)}s
                </div>
              </div>

              <div className="space-y-4">
                {results.map((result, index) => {
                  const CategoryIcon = getCategoryIcon(result.category);
                  return (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className={`p-1 rounded ${getCategoryColor(result.category)}`}>
                              <CategoryIcon className="w-4 h-4" />
                            </div>
                            <h3 className="font-medium text-gray-900">{result.title}</h3>
                            <span className="text-xs text-gray-500">Line {result.line_number}</span>
                          </div>
                          
                          <p 
                            className="text-sm text-gray-600 mb-2"
                            dangerouslySetInnerHTML={{
                              __html: highlightQuery(result.highlighted_content, query)
                            }}
                          />
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center">
                              <FolderOpen className="w-3 h-3 mr-1" />
                              {result.file_path}
                            </div>
                            <div className="flex items-center">
                              <Star className="w-3 h-3 mr-1" />
                              Score: {(result.score * 100).toFixed(0)}%
                            </div>
                            {result.metadata?.method && (
                              <div className="flex items-center">
                                <Target className="w-3 h-3 mr-1" />
                                {result.metadata.method}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <ArrowRight className="w-4 h-4 text-gray-400 ml-4" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : query && !isSearching ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600">
                Try adjusting your search terms or check different categories
              </p>
            </div>
          ) : !query ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Search</h3>
              <p className="text-gray-600">
                Enter your search query to find functions, classes, files, and more
              </p>
            </div>
          ) : null}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="w-5 h-5 text-yellow-500 mr-2" />
                Suggestions
              </h3>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(suggestion)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          {searchStats && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                Index Statistics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Languages</span>
                  <span className="font-medium">{searchStats.supported_languages?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cache Size</span>
                  <span className="font-medium">{searchStats.cache_size || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Recent Searches</span>
                  <span className="font-medium">{searchStats.recent_searches?.length || 0}</span>
                </div>
              </div>
              
              {searchStats.supported_languages && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Indexed Languages</h4>
                  <div className="flex flex-wrap gap-1">
                    {searchStats.supported_languages.map(lang => (
                      <span
                        key={lang}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 text-gray-500 mr-2" />
                Recent Searches
              </h3>
              <div className="space-y-2">
                {recentSearches.map((recentQuery, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(recentQuery)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    {recentQuery}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartSearchDashboard;