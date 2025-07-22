import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Zap, Plus, Clock, Users, Star, Code, Rocket, 
  Settings, LogOut, Bell, Search, Filter, Grid3X3, 
  List, Calendar, TrendingUp, ArrowRight, Eye,
  GitBranch, Sparkles
} from 'lucide-react';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Mock data - replace with actual API calls
  const recentProjects = [
    {
      id: '1',
      name: 'Cosmic Chat App',
      description: 'Real-time messaging with quantum encryption',
      lastModified: '2 hours ago',
      type: 'Web App',
      status: 'Active',
      collaborators: 3,
      image: 'https://via.placeholder.com/300x200?text=Cosmic+Chat'
    },
    {
      id: '2', 
      name: 'Reality Engine API',
      description: 'Backend API for multi-dimensional applications',
      lastModified: '1 day ago',
      type: 'API',
      status: 'Development',
      collaborators: 2,
      image: 'https://via.placeholder.com/300x200?text=Reality+API'
    },
    {
      id: '3',
      name: 'Sacred Geometry Dashboard',
      description: 'Analytics dashboard with golden ratio layouts',
      lastModified: '3 days ago', 
      type: 'Dashboard',
      status: 'Completed',
      collaborators: 1,
      image: 'https://via.placeholder.com/300x200?text=Sacred+Dashboard'
    },
    {
      id: '4',
      name: 'Quantum Payment Gateway',
      description: 'Cross-dimensional payment processing system',
      lastModified: '1 week ago',
      type: 'Service',
      status: 'Testing',
      collaborators: 5,
      image: 'https://via.placeholder.com/300x200?text=Payment+Gateway'
    }
  ];

  const quickActions = [
    {
      icon: <Plus className="w-6 h-6" />,
      title: 'New Project',
      description: 'Start a new cosmic development project',
      action: () => navigate('/ide'),
      color: 'blue'
    },
    {
      icon: <Code className="w-6 h-6" />, 
      title: 'Import Repository',
      description: 'Import from GitHub or other sources',
      action: () => console.log('Import'),
      color: 'purple'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Join Team',
      description: 'Collaborate on existing projects',
      action: () => console.log('Join team'),
      color: 'green'
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'AI Code Gen',
      description: 'Generate project with AI assistance',
      action: () => console.log('AI gen'),
      color: 'orange'
    }
  ];

  const stats = {
    totalProjects: 12,
    activeCollaborations: 5,
    vibeTokens: user?.credits || 1000,
    cosmicLevel: user?.plan || 'Professional'
  };

  const filteredProjects = recentProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || project.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'text-green-400 bg-green-400/10',
      'Development': 'text-blue-400 bg-blue-400/10',
      'Completed': 'text-purple-400 bg-purple-400/10',
      'Testing': 'text-yellow-400 bg-yellow-400/10'
    };
    return colors[status] || 'text-gray-400 bg-gray-400/10';
  };

  const getActionColor = (color) => {
    const colors = {
      blue: 'from-blue-400 to-cyan-400',
      purple: 'from-purple-400 to-pink-400',
      green: 'from-green-400 to-emerald-400',
      orange: 'from-orange-400 to-red-400'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/90 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <Zap className="w-8 h-8 text-blue-400" />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AETHERFLOW
                </span>
              </Link>
              <div className="hidden md:block text-gray-400">|</div>
              <h1 className="hidden md:block text-xl font-semibold">Dashboard</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              
              <div className="flex items-center space-x-2 px-3 py-1 bg-purple-600/20 rounded-lg">
                <Star className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium">{stats.vibeTokens}</span>
              </div>

              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-800 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-sm font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden md:block">{user?.name || 'User'}</span>
                </button>
                
                <div className="absolute right-0 top-12 w-48 bg-slate-800 border border-slate-600 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="p-3 border-b border-slate-600">
                    <p className="font-semibold">{user?.name || 'Demo User'}</p>
                    <p className="text-sm text-gray-400">{user?.email || 'demo@aetherflow.dev'}</p>
                  </div>
                  <nav className="p-2">
                    <Link to="/profile" className="flex items-center space-x-2 p-2 hover:bg-slate-700 rounded-lg">
                      <Settings className="w-4 h-4" />
                      <span>Profile Settings</span>
                    </Link>
                    <button 
                      onClick={logout}
                      className="w-full flex items-center space-x-2 p-2 hover:bg-slate-700 rounded-lg text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name || 'Cosmic Developer'} ✨
          </h2>
          <p className="text-gray-300">
            Ready to continue your reality-bending development journey?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <Code className="w-8 h-8 text-blue-400" />
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold mb-1">{stats.totalProjects}</div>
            <div className="text-sm text-gray-400">Total Projects</div>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-purple-400" />
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold mb-1">{stats.activeCollaborations}</div>
            <div className="text-sm text-gray-400">Collaborations</div>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-8 h-8 text-yellow-400" />
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold mb-1">{stats.vibeTokens}</div>
            <div className="text-sm text-gray-400">VIBE Tokens</div>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <Rocket className="w-8 h-8 text-green-400" />
              <ArrowRight className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-lg font-bold mb-1">{stats.cosmicLevel}</div>
            <div className="text-sm text-gray-400">Cosmic Level</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="quick-action-card group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getActionColor(action.color)} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <h4 className="font-semibold mb-2">{action.title}</h4>
                <p className="text-sm text-gray-400">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Projects Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Your Projects</h3>
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-800/70 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-slate-800/70 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">All Types</option>
                <option value="web app">Web App</option>
                <option value="api">API</option>
                <option value="dashboard">Dashboard</option>
                <option value="service">Service</option>
              </select>

              {/* View Mode */}
              <div className="flex bg-slate-800/70 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Projects Grid/List */}
          <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredProjects.map((project) => (
              <div key={project.id} className={`project-card group ${viewMode === 'list' ? 'flex items-center space-x-4 p-4' : 'p-6'}`}>
                {viewMode === 'grid' ? (
                  <>
                    <div className="aspect-video bg-slate-700 rounded-lg mb-4 overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                        <Code className="w-12 h-12 text-gray-400" />
                      </div>
                    </div>
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2 group-hover:text-blue-400 transition-colors">{project.name}</h4>
                      <p className="text-sm text-gray-400 mb-3">{project.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{project.lastModified}</span>
                        <span className={`px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">{project.collaborators}</span>
                      </div>
                      <button
                        onClick={() => navigate('/ide')}
                        className="btn btn-primary btn-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Open
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Code className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1 group-hover:text-blue-400 transition-colors">{project.name}</h4>
                      <p className="text-sm text-gray-400 mb-2">{project.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{project.lastModified}</span>
                        <span className={`px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{project.collaborators}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/ide')}
                      className="btn btn-primary btn-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Open
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <Code className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">No projects found</h4>
              <p className="text-gray-400 mb-6">
                {searchQuery || filterType !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Start your cosmic development journey by creating your first project'
                }
              </p>
              <button
                onClick={() => navigate('/ide')}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Project
              </button>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
          <div className="bg-slate-800/50 rounded-xl border border-slate-600 p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm">You deployed <strong>Cosmic Chat App</strong> to production</span>
                <span className="text-xs text-gray-400">2 hours ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-sm">Sarah joined your <strong>Reality Engine API</strong> project</span>
                <span className="text-xs text-gray-400">1 day ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-sm">You earned 150 VIBE tokens from code optimization</span>
                <span className="text-xs text-gray-400">2 days ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-sm">AI assistant helped debug <strong>Payment Gateway</strong></span>
                <span className="text-xs text-gray-400">3 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;