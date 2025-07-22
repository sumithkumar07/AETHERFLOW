import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, Search, Filter, Grid3X3, List, Star, Download, 
  ExternalLink, Check, Clock, Trending, Award, Shield,
  Code, Database, Cloud, MessageSquare, Mail, Calendar,
  GitBranch, Settings, Cpu, Globe, Lock, Users, Rocket,
  ArrowRight, Eye, Play, ChevronDown, Heart
} from 'lucide-react';
import MicroInteractions from '../components/MicroInteractions';
import EnhancedLoadingComponents from '../components/EnhancedLoadingComponents';

const IntegrationsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [loading, setLoading] = useState({});
  const [installedIntegrations, setInstalledIntegrations] = useState(['github', 'stripe', 'openai']);

  const categories = [
    { id: 'all', name: 'All Integrations', count: 127 },
    { id: 'ai', name: 'AI & Machine Learning', count: 23 },
    { id: 'cloud', name: 'Cloud Services', count: 18 },
    { id: 'database', name: 'Databases', count: 15 },
    { id: 'version-control', name: 'Version Control', count: 12 },
    { id: 'communication', name: 'Communication', count: 16 },
    { id: 'deployment', name: 'Deployment', count: 14 },
    { id: 'monitoring', name: 'Monitoring', count: 11 },
    { id: 'testing', name: 'Testing', count: 8 },
    { id: 'security', name: 'Security', count: 10 }
  ];

  const integrations = [
    {
      id: 'github',
      name: 'GitHub',
      description: 'Complete Git workflow integration with pull requests, issues, and CI/CD',
      category: 'version-control',
      logo: '🐙',
      rating: 4.9,
      downloads: '2.1M',
      price: 'Free',
      tags: ['Git', 'CI/CD', 'Issues', 'Pull Requests'],
      featured: true,
      verified: true,
      lastUpdated: '2 days ago',
      version: '3.2.1',
      compatibility: ['Web', 'Desktop', 'Mobile'],
      screenshots: [
        'https://images.unsplash.com/photo-1693773852578-65cf594b62dd?w=400',
        'https://images.unsplash.com/photo-1633988354540-d3f4e97c67b5?w=400'
      ]
    },
    {
      id: 'openai',
      name: 'OpenAI GPT',
      description: 'Advanced AI coding assistance with GPT-4 integration for code generation and review',
      category: 'ai',
      logo: '🤖',
      rating: 4.8,
      downloads: '1.8M',
      price: '$19/mo',
      tags: ['AI', 'Code Generation', 'Review', 'GPT-4'],
      featured: true,
      verified: true,
      lastUpdated: '1 day ago',
      version: '2.5.0',
      compatibility: ['Web', 'Desktop'],
      screenshots: [
        'https://images.unsplash.com/photo-1555209183-8facf96a4349?w=400',
        'https://images.unsplash.com/photo-1657972170499-3376d9eb8f65?w=400'
      ]
    },
    {
      id: 'stripe',
      name: 'Stripe Payments',
      description: 'Seamless payment processing integration with real-time transaction monitoring',
      category: 'cloud',
      logo: '💳',
      rating: 4.7,
      downloads: '892K',
      price: 'Free',
      tags: ['Payments', 'API', 'Webhooks', 'Analytics'],
      featured: false,
      verified: true,
      lastUpdated: '3 days ago',
      version: '1.9.2',
      compatibility: ['Web', 'Mobile'],
      screenshots: [
        'https://images.unsplash.com/photo-1623281185000-6940e5347d2e?w=400'
      ]
    },
    {
      id: 'postgresql',
      name: 'PostgreSQL',
      description: 'Advanced database integration with query optimization and schema management',
      category: 'database',
      logo: '🐘',
      rating: 4.8,
      downloads: '1.2M',
      price: 'Free',
      tags: ['Database', 'SQL', 'Schema', 'Migration'],
      featured: false,
      verified: true,
      lastUpdated: '5 days ago',
      version: '4.1.0',
      compatibility: ['Web', 'Desktop'],
      screenshots: [
        'https://images.unsplash.com/photo-1711599813951-89297e6201a8?w=400'
      ]
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Team communication with code sharing, notifications, and collaborative features',
      category: 'communication',
      logo: '💬',
      rating: 4.6,
      downloads: '756K',
      price: 'Free',
      tags: ['Communication', 'Notifications', 'Teams', 'Chat'],
      featured: false,
      verified: true,
      lastUpdated: '1 week ago',
      version: '2.3.4',
      compatibility: ['Web', 'Desktop', 'Mobile'],
      screenshots: [
        'https://images.unsplash.com/photo-1657972170499-3376d9eb8f65?w=400'
      ]
    },
    {
      id: 'docker',
      name: 'Docker',
      description: 'Container management and deployment with one-click containerization',
      category: 'deployment',
      logo: '🐳',
      rating: 4.7,
      downloads: '1.1M',
      price: 'Free',
      tags: ['Containers', 'Deployment', 'DevOps', 'Orchestration'],
      featured: true,
      verified: true,
      lastUpdated: '4 days ago',
      version: '3.0.1',
      compatibility: ['Web', 'Desktop'],
      screenshots: [
        'https://images.unsplash.com/photo-1633988354540-d3f4e97c67b5?w=400'
      ]
    }
  ];

  const handleActionWithLoading = async (action, integrationId) => {
    const key = `${action}-${integrationId}`;
    setLoading(prev => ({ ...prev, [key]: true }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      if (action === 'install') {
        setInstalledIntegrations(prev => [...prev, integrationId]);
      } else if (action === 'uninstall') {
        setInstalledIntegrations(prev => prev.filter(id => id !== integrationId));
      }
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const sortedIntegrations = [...filteredIntegrations].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return parseInt(b.downloads) - parseInt(a.downloads);
      case 'rating':
        return b.rating - a.rating;
      case 'recent':
        return new Date(b.lastUpdated) - new Date(a.lastUpdated);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <MicroInteractions />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-surface border-b border-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Zap className="w-8 h-8 text-blue-400" />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AETHERFLOW
                </span>
              </Link>
              <div className="ml-8 text-gray-400">
                <span>/</span>
                <span className="ml-2 text-white">Integration Marketplace</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="btn btn-secondary">
                <ArrowRight className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-20 px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Integration Marketplace
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Supercharge your development workflow with powerful integrations. 
              Connect your favorite tools and services seamlessly.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="glass-surface p-6 rounded-2xl border border-slate-600 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search integrations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10 w-full"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-field"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.count})
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="recent">Recently Updated</option>
                  <option value="name">Name A-Z</option>
                </select>

                <div className="flex border border-slate-600 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-purple-600' : 'hover:bg-slate-700'}`}
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-purple-600' : 'hover:bg-slate-700'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Integrations */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Award className="w-6 h-6 mr-2 text-yellow-400" />
              Featured Integrations
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {integrations.filter(i => i.featured).map(integration => (
                <div key={integration.id} className="glass-surface p-6 rounded-2xl border border-slate-600 hover:border-purple-400 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{integration.logo}</div>
                      <div>
                        <h3 className="font-bold text-white group-hover:text-purple-300 transition-colors">
                          {integration.name}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <span>{integration.version}</span>
                          {integration.verified && (
                            <div className="flex items-center text-green-400">
                              <Shield className="w-3 h-3 mr-1" />
                              <span>Verified</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center text-yellow-400 mb-1">
                        <Star className="w-4 h-4 mr-1 fill-current" />
                        <span className="text-sm">{integration.rating}</span>
                      </div>
                      <div className="text-xs text-gray-400">{integration.downloads} installs</div>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-4">{integration.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {integration.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-1 bg-slate-700 rounded text-xs text-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-purple-400 font-semibold">{integration.price}</span>
                    
                    {installedIntegrations.includes(integration.id) ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-green-400 text-sm flex items-center">
                          <Check className="w-4 h-4 mr-1" />
                          Installed
                        </span>
                        <button
                          onClick={() => handleActionWithLoading('uninstall', integration.id)}
                          disabled={loading[`uninstall-${integration.id}`]}
                          className="btn btn-secondary text-sm px-3 py-1"
                        >
                          {loading[`uninstall-${integration.id}`] ? (
                            <EnhancedLoadingComponents.Spinner size="sm" />
                          ) : (
                            'Remove'
                          )}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleActionWithLoading('install', integration.id)}
                        disabled={loading[`install-${integration.id}`]}
                        className="btn btn-primary text-sm px-4 py-2"
                      >
                        {loading[`install-${integration.id}`] ? (
                          <EnhancedLoadingComponents.Spinner size="sm" />
                        ) : (
                          'Install'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Integrations */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                All Integrations ({sortedIntegrations.length})
              </h2>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedIntegrations.map(integration => (
                  <IntegrationCard
                    key={integration.id}
                    integration={integration}
                    isInstalled={installedIntegrations.includes(integration.id)}
                    loading={loading}
                    onAction={handleActionWithLoading}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedIntegrations.map(integration => (
                  <IntegrationListItem
                    key={integration.id}
                    integration={integration}
                    isInstalled={installedIntegrations.includes(integration.id)}
                    loading={loading}
                    onAction={handleActionWithLoading}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Empty State */}
          {sortedIntegrations.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">No integrations found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="btn btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Integration Card Component
const IntegrationCard = ({ integration, isInstalled, loading, onAction }) => (
  <div className="glass-surface p-6 rounded-2xl border border-slate-600 hover:border-slate-500 transition-all">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="text-2xl">{integration.logo}</div>
        <div>
          <h3 className="font-bold text-white">{integration.name}</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>{integration.version}</span>
            {integration.verified && (
              <Shield className="w-3 h-3 text-green-400" />
            )}
          </div>
        </div>
      </div>
      
      <div className="text-right">
        <div className="flex items-center text-yellow-400 mb-1">
          <Star className="w-4 h-4 mr-1 fill-current" />
          <span className="text-sm">{integration.rating}</span>
        </div>
        <div className="text-xs text-gray-400">{integration.downloads}</div>
      </div>
    </div>

    <p className="text-gray-400 text-sm mb-4">{integration.description}</p>

    <div className="flex flex-wrap gap-2 mb-4">
      {integration.tags.slice(0, 2).map(tag => (
        <span key={tag} className="px-2 py-1 bg-slate-700 rounded text-xs text-gray-300">
          {tag}
        </span>
      ))}
    </div>

    <div className="flex items-center justify-between">
      <span className="text-purple-400 font-semibold">{integration.price}</span>
      
      {isInstalled ? (
        <div className="flex items-center space-x-2">
          <span className="text-green-400 text-sm flex items-center">
            <Check className="w-4 h-4 mr-1" />
            Installed
          </span>
        </div>
      ) : (
        <button
          onClick={() => onAction('install', integration.id)}
          disabled={loading[`install-${integration.id}`]}
          className="btn btn-primary text-sm px-4 py-2"
        >
          {loading[`install-${integration.id}`] ? (
            <EnhancedLoadingComponents.Spinner size="sm" />
          ) : (
            'Install'
          )}
        </button>
      )}
    </div>
  </div>
);

// Integration List Item Component  
const IntegrationListItem = ({ integration, isInstalled, loading, onAction }) => (
  <div className="glass-surface p-4 rounded-xl border border-slate-600 hover:border-slate-500 transition-all">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="text-2xl">{integration.logo}</div>
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-bold text-white">{integration.name}</h3>
            {integration.verified && (
              <Shield className="w-4 h-4 text-green-400" />
            )}
            <div className="flex items-center text-yellow-400">
              <Star className="w-4 h-4 mr-1 fill-current" />
              <span className="text-sm">{integration.rating}</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-2">{integration.description}</p>
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            <span>{integration.downloads} installs</span>
            <span>Updated {integration.lastUpdated}</span>
            <span className="text-purple-400">{integration.price}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {isInstalled ? (
          <span className="text-green-400 text-sm flex items-center">
            <Check className="w-4 h-4 mr-1" />
            Installed
          </span>
        ) : (
          <button
            onClick={() => onAction('install', integration.id)}
            disabled={loading[`install-${integration.id}`]}
            className="btn btn-primary text-sm px-4 py-2"
          >
            {loading[`install-${integration.id}`] ? (
              <EnhancedLoadingComponents.Spinner size="sm" />
            ) : (
              'Install'
            )}
          </button>
        )}
      </div>
    </div>
  </div>
);

export default IntegrationsPage;