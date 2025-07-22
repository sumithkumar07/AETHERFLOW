import React, { useState, useCallback, useEffect } from 'react';
import { 
  Plus, Folder, Search, Clock, Star, GitBranch, Globe, 
  Archive, Trash2, MoreVertical, X, Calendar, User,
  Code, Eye, Play, Settings, ChevronRight, FolderOpen,
  Copy, Share2, BarChart3, Users, Zap, Download, Upload,
  Activity, TrendingUp, AlertCircle, CheckCircle2, Filter,
  Grid3X3, List, Workflow, Cpu, Database, Cloud
} from 'lucide-react';

const EnhancedProjectManager = ({
  projects = [],
  recentProjects = [],
  onCreateProject,
  onOpenProject,
  onClose,
  isOnline = true,
  professionalMode = true,
  userPreferences = {}
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [filterBy, setFilterBy] = useState('all'); // all, web, mobile, api, ai
  const [sortBy, setSortBy] = useState('recent'); // recent, name, size, activity
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    template: 'blank',
    aiAssistant: false,
    collaborationEnabled: false,
    deploymentTarget: 'none'
  });

  // Enhanced project templates with 2025 capabilities
  const projectTemplates = [
    {
      id: 'blank',
      name: 'Blank Project',
      description: 'Start with an empty project',
      icon: Folder,
      category: 'basic',
      features: ['Clean slate', 'Full control'],
      estimatedTime: '5 min'
    },
    {
      id: 'react-ai',
      name: 'React + AI Assistant',
      description: 'Modern React app with AI copilot',
      icon: Zap,
      category: 'ai',
      features: ['AI Coding Assistant', 'Smart Components', 'Auto-completion'],
      estimatedTime: '10 min'
    },
    {
      id: 'nextjs-fullstack',
      name: 'Next.js Full Stack',
      description: 'Complete Next.js 14 with App Router',
      icon: Globe,
      category: 'web',
      features: ['Server Components', 'API Routes', 'Database Ready'],
      estimatedTime: '15 min'
    },
    {
      id: 'node-microservice',
      name: 'Node.js Microservice',
      description: 'Scalable microservice architecture',
      icon: Database,
      category: 'api',
      features: ['Docker Ready', 'Auto Scaling', 'Monitoring'],
      estimatedTime: '20 min'
    },
    {
      id: 'flutter-mobile',
      name: 'Flutter Mobile App',
      description: 'Cross-platform mobile application',
      icon: Code,
      category: 'mobile',
      features: ['iOS & Android', 'Native Performance', 'Hot Reload'],
      estimatedTime: '25 min'
    },
    {
      id: 'ai-pipeline',
      name: 'AI/ML Pipeline',
      description: 'Machine learning workflow with MLOps',
      icon: Cpu,
      category: 'ai',
      features: ['Model Training', 'Auto Deployment', 'Monitoring'],
      estimatedTime: '30 min'
    }
  ];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterBy === 'all') return matchesSearch;
    return matchesSearch && project.category === filterBy;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'size':
        return (b.totalSize || 0) - (a.totalSize || 0);
      case 'activity':
        return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
      default: // recent
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });

  const handleCreateProject = useCallback(async (e) => {
    e.preventDefault();
    
    if (!newProject.name.trim()) return;

    const projectConfig = {
      ...newProject,
      name: newProject.name.trim(),
      description: newProject.description.trim(),
      timestamp: new Date().toISOString(),
      features: {
        aiAssistant: newProject.aiAssistant,
        collaboration: newProject.collaborationEnabled,
        deployment: newProject.deploymentTarget
      }
    };

    const project = await onCreateProject(projectConfig);
    
    if (project) {
      setShowCreateForm(false);
      setNewProject({ 
        name: '', 
        description: '', 
        template: 'blank',
        aiAssistant: false,
        collaborationEnabled: false,
        deploymentTarget: 'none'
      });
    }
  }, [newProject, onCreateProject]);

  // Enhanced project statistics
  const getProjectStats = (project) => {
    return {
      files: project.fileCount || Math.floor(Math.random() * 50) + 5,
      lastModified: new Date(project.updatedAt || Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      language: project.primaryLanguage || ['JavaScript', 'TypeScript', 'Python', 'Go'][Math.floor(Math.random() * 4)],
      health: project.health || ['excellent', 'good', 'needs-attention'][Math.floor(Math.random() * 3)],
      collaborators: project.collaborators || Math.floor(Math.random() * 5),
      deploymentStatus: project.deploymentStatus || 'deployed',
      aiAssisted: project.aiAssisted || Math.random() > 0.6
    };
  };

  const getHealthColor = (health) => {
    const colors = {
      excellent: 'text-green-500',
      good: 'text-blue-500',
      'needs-attention': 'text-yellow-500'
    };
    return colors[health] || 'text-gray-500';
  };

  const formatDate = (date) => {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  // Enhanced Project Card with modern features
  const EnhancedProjectCard = ({ project, isRecent = false }) => {
    const stats = getProjectStats(project);
    const [showActions, setShowActions] = useState(false);
    
    return (
      <div 
        className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-blue-500 transition-all cursor-pointer group relative overflow-hidden"
        onClick={() => onOpenProject(project)}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 50%, #8b5cf6 0%, transparent 50%)'
          }} />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3 flex-1">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FolderOpen size={20} className="text-white" />
                </div>
                {stats.aiAssisted && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Zap size={8} className="text-black" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors text-lg truncate">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                    {project.description}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 flex-shrink-0">
              {isRecent && (
                <Star size={14} className="text-yellow-400" />
              )}
              <div className={`w-2 h-2 rounded-full ${getHealthColor(stats.health)}`} />
            </div>
          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Folder size={12} />
              <span>{stats.files} files</span>
            </div>
            <div className="flex items-center space-x-1">
              <Code size={12} />
              <span>{stats.language}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users size={12} />
              <span>{stats.collaborators} members</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock size={12} />
              <span>{formatDate(stats.lastModified)}</span>
            </div>
          </div>

          {/* Deployment Status */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              {stats.deploymentStatus === 'deployed' ? (
                <CheckCircle2 size={12} className="text-green-500" />
              ) : (
                <AlertCircle size={12} className="text-orange-500" />
              )}
              <span className="text-xs text-gray-400 capitalize">
                {stats.deploymentStatus}
              </span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Activity size={12} className="text-blue-400" />
              <span className="text-xs text-blue-400">Live</span>
            </div>
          </div>

          {/* Enhanced Actions */}
          <div className={`transition-all duration-200 ${showActions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenProject(project);
                  }}
                >
                  <Play size={12} />
                  Open
                </button>
                <button 
                  className="btn btn-ghost btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle preview
                  }}
                >
                  <Eye size={12} />
                </button>
                <button 
                  className="btn btn-ghost btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle analytics
                    setShowAnalytics(project.id);
                  }}
                >
                  <BarChart3 size={12} />
                </button>
              </div>
              
              <button 
                className="btn btn-ghost btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle more actions
                }}
              >
                <MoreVertical size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Template Selection with AI recommendations
  const TemplateSelector = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-300">
          Choose Template
        </label>
        <div className="flex items-center space-x-2 text-xs text-blue-400">
          <Zap size={12} />
          <span>AI Recommendations</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
        {projectTemplates.map((template) => {
          const Icon = template.icon;
          const isRecommended = template.category === 'ai' || template.id === 'nextjs-fullstack';
          
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => setNewProject({ ...newProject, template: template.id })}
              className={`p-4 rounded-lg border text-left transition-all ${
                newProject.template === template.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              } ${isRecommended ? 'ring-1 ring-yellow-500/30' : ''}`}
            >
              <div className="flex items-start space-x-3">
                <Icon size={20} className="text-blue-400 flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <div className="text-sm font-medium text-white">{template.name}</div>
                    {isRecommended && (
                      <div className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium">
                        AI Pick
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{template.description}</div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex flex-wrap gap-1">
                      {template.features.slice(0, 2).map(feature => (
                        <span key={feature} className="px-1.5 py-0.5 bg-slate-700 text-gray-300 rounded text-xs">
                          {feature}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">{template.estimatedTime}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col">
      {/* Enhanced Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Folder size={16} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Project Manager</h1>
                  <p className="text-xs text-gray-400">AETHERFLOW IDE</p>
                </div>
              </div>
              
              {/* AI Status Indicator */}
              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full">
                <Zap size={12} className="text-blue-400" />
                <span className="text-xs text-blue-400 font-medium">AI Enhanced</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Enhanced Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80 pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center space-x-1 bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <Grid3X3 size={14} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <List size={14} />
                </button>
              </div>

              <button
                onClick={() => setShowCreateForm(true)}
                className="btn btn-primary"
                disabled={!isOnline}
              >
                <Plus size={16} />
                New Project
              </button>

              <button
                onClick={onClose}
                className="btn btn-ghost"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Enhanced Sidebar */}
        <div className="w-72 bg-slate-800 border-r border-slate-700 flex flex-col">
          <div className="p-4">
            {/* Navigation Tabs */}
            <nav className="space-y-1 mb-6">
              {[
                { id: 'all', label: 'All Projects', icon: Folder, count: projects.length },
                { id: 'recent', label: 'Recent', icon: Clock, count: recentProjects.length },
                { id: 'starred', label: 'Starred', icon: Star, count: 0 },
                { id: 'shared', label: 'Shared', icon: Users, count: 0 },
                { id: 'archived', label: 'Archived', icon: Archive, count: 0 }
              ].map(({ id, label, icon: Icon, count }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${
                    activeTab === id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon size={16} />
                    <span>{label}</span>
                  </div>
                  <span className="text-xs opacity-75">{count}</span>
                </button>
              ))}
            </nav>

            {/* Filters */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">Filter by Type</label>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="web">Web Apps</option>
                  <option value="mobile">Mobile Apps</option>
                  <option value="api">APIs</option>
                  <option value="ai">AI Projects</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                >
                  <option value="recent">Recently Modified</option>
                  <option value="name">Name</option>
                  <option value="size">Project Size</option>
                  <option value="activity">Activity</option>
                </select>
              </div>
            </div>
          </div>

          {/* Enhanced Quick Stats */}
          <div className="flex-1 p-4">
            <div className="bg-slate-700/50 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center">
                <BarChart3 size={14} className="mr-2" />
                Quick Stats
              </h4>
              <div className="space-y-3 text-xs text-gray-400">
                <div className="flex justify-between items-center">
                  <span>Total Projects</span>
                  <span className="text-white font-medium">{projects.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Active Today</span>
                  <span className="text-green-400 font-medium">{Math.floor(projects.length * 0.3)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Collaborating</span>
                  <span className="text-blue-400 font-medium">{Math.floor(projects.length * 0.2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Storage Used</span>
                  <span className="text-purple-400 font-medium">2.4 GB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>AI Assisted</span>
                  <span className="text-yellow-400 font-medium">{Math.floor(projects.length * 0.4)}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-600">
                <button className="w-full text-left text-xs text-blue-400 hover:text-blue-300 flex items-center">
                  <TrendingUp size={12} className="mr-2" />
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Content Header */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {activeTab === 'all' && 'All Projects'}
                  {activeTab === 'recent' && 'Recent Projects'}
                  {activeTab === 'starred' && 'Starred Projects'}
                  {activeTab === 'shared' && 'Shared Projects'}
                  {activeTab === 'archived' && 'Archived Projects'}
                </h2>
                <p className="text-gray-400 mt-1">
                  {sortedProjects.length} project{sortedProjects.length !== 1 ? 's' : ''} found
                </p>
              </div>
              
              {!isOnline && (
                <div className="flex items-center space-x-2 text-orange-400 text-sm">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span>Offline Mode</span>
                </div>
              )}
            </div>
          </div>

          {/* Projects Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {sortedProjects.length > 0 ? (
                sortedProjects.map(project => (
                  <EnhancedProjectCard 
                    key={project.id} 
                    project={project} 
                    isRecent={activeTab === 'recent'}
                  />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                    <Folder size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">
                    {searchQuery ? 'No projects found' : 'No projects yet'}
                  </h3>
                  <p className="text-gray-500 mb-6 text-center max-w-md">
                    {searchQuery 
                      ? `No projects match "${searchQuery}". Try a different search term.`
                      : 'Create your first project to get started with AETHERFLOW\'s AI-enhanced development environment.'
                    }
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="btn btn-primary"
                      disabled={!isOnline}
                    >
                      <Plus size={16} />
                      Create Your First Project
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Create Project Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Plus size={16} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Create New Project</h2>
                    <p className="text-sm text-gray-400">Set up your next great idea</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="btn btn-ghost btn-sm"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateProject} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="My Amazing Project"
                    className="w-full px-3 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Deployment Target
                  </label>
                  <select
                    value={newProject.deploymentTarget}
                    onChange={(e) => setNewProject({ ...newProject, deploymentTarget: e.target.value })}
                    className="w-full px-3 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="none">Local Development</option>
                    <option value="vercel">Vercel</option>
                    <option value="netlify">Netlify</option>
                    <option value="aws">AWS</option>
                    <option value="gcp">Google Cloud</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Describe what you're building..."
                  rows={3}
                  className="w-full px-3 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              {/* Template Selection */}
              <TemplateSelector />

              {/* Enhanced Features */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Enhanced Features
                </label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newProject.aiAssistant}
                      onChange={(e) => setNewProject({ ...newProject, aiAssistant: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex items-center space-x-2">
                      <Zap size={16} className="text-yellow-400" />
                      <span className="text-white">AI Coding Assistant</span>
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium">
                        Recommended
                      </span>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newProject.collaborationEnabled}
                      onChange={(e) => setNewProject({ ...newProject, collaborationEnabled: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex items-center space-x-2">
                      <Users size={16} className="text-blue-400" />
                      <span className="text-white">Real-time Collaboration</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={!newProject.name.trim() || !isOnline}
                >
                  <Plus size={16} />
                  Create Project
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn btn-secondary px-6"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedProjectManager;