import React, { useState, useCallback } from 'react';
import { 
  Plus, Folder, Search, Clock, Star, GitBranch, Globe, 
  Archive, Trash2, MoreVertical, X, Calendar, User,
  Code, Eye, Play, Settings, ChevronRight, FolderOpen
} from 'lucide-react';

const ProjectManager = ({
  projects = [],
  recentProjects = [],
  onCreateProject,
  onOpenProject,
  onClose,
  isOnline = true,
  professionalMode = true
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    template: 'blank'
  });

  const projectTemplates = [
    {
      id: 'blank',
      name: 'Blank Project',
      description: 'Start with an empty project',
      icon: Folder
    },
    {
      id: 'react',
      name: 'React App',
      description: 'Modern React application',
      icon: Code
    },
    {
      id: 'node',
      name: 'Node.js API',
      description: 'Backend API with Node.js',
      icon: Globe
    },
    {
      id: 'fullstack',
      name: 'Full Stack',
      description: 'React + Node.js application',
      icon: GitBranch
    }
  ];

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProject = useCallback(async (e) => {
    e.preventDefault();
    
    if (!newProject.name.trim()) return;

    const project = await onCreateProject(newProject.name.trim(), newProject.description.trim());
    
    if (project) {
      setShowCreateForm(false);
      setNewProject({ name: '', description: '', template: 'blank' });
    }
  }, [newProject, onCreateProject]);

  const getProjectStats = (project) => {
    // Mock stats - in real app this would come from the project data
    return {
      files: Math.floor(Math.random() * 50) + 5,
      lastModified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      language: ['JavaScript', 'TypeScript', 'Python', 'Go'][Math.floor(Math.random() * 4)]
    };
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

  const ProjectCard = ({ project, isRecent = false }) => {
    const stats = getProjectStats(project);
    
    return (
      <div 
        className="feature-card cursor-pointer group"
        onClick={() => onOpenProject(project)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="feature-icon">
              <FolderOpen size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                {project.name}
              </h3>
              {project.description && (
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                  {project.description}
                </p>
              )}
            </div>
          </div>
          
          {isRecent && (
            <Star size={14} className="text-yellow-400 flex-shrink-0" />
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Folder size={12} />
              <span>{stats.files} files</span>
            </div>
            <div className="flex items-center space-x-1">
              <Code size={12} />
              <span>{stats.language}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Clock size={12} />
            <span>{formatDate(stats.lastModified)}</span>
          </div>
        </div>

        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center space-x-2">
            <button className="btn btn-primary btn-sm">
              <Play size={12} />
              Open
            </button>
            <button className="btn btn-ghost btn-sm">
              <Eye size={12} />
              Preview
            </button>
            <button className="btn btn-ghost btn-sm">
              <MoreVertical size={12} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col">
      {/* Header */}
      <header className="professional-header">
        <div className="header-content">
          <div className="logo">
            <Folder size={24} />
            <span>Project Manager</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="glass-surface px-3 py-2">
              <div className="flex items-center space-x-2">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-white text-sm outline-none w-64"
                />
              </div>
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
      </header>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-slate-800 border-r border-slate-700 p-4">
          <nav className="space-y-2">
            {[
              { id: 'all', label: 'All Projects', icon: Folder, count: projects.length },
              { id: 'recent', label: 'Recent', icon: Clock, count: recentProjects.length },
              { id: 'starred', label: 'Starred', icon: Star, count: 0 },
              { id: 'archived', label: 'Archived', icon: Archive, count: 0 }
            ].map(({ id, label, icon: Icon, count }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                  activeTab === id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon size={16} />
                  <span>{label}</span>
                </div>
                <span className="text-xs opacity-75">{count}</span>
              </button>
            ))}
          </nav>

          {/* Quick Stats */}
          <div className="mt-8 p-4 bg-slate-700/50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Quick Stats</h4>
            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex justify-between">
                <span>Total Projects</span>
                <span className="text-white">{projects.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Recent Activity</span>
                <span className="text-green-400">{recentProjects.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Storage Used</span>
                <span className="text-blue-400">2.4 GB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {activeTab === 'all' && 'All Projects'}
                  {activeTab === 'recent' && 'Recent Projects'}
                  {activeTab === 'starred' && 'Starred Projects'}
                  {activeTab === 'archived' && 'Archived Projects'}
                </h1>
                <p className="text-gray-400 mt-1">
                  {activeTab === 'all' && `${filteredProjects.length} project${filteredProjects.length !== 1 ? 's' : ''}`}
                  {activeTab === 'recent' && `${recentProjects.length} recently accessed`}
                  {activeTab === 'starred' && 'Your favorite projects'}
                  {activeTab === 'archived' && 'Archived and inactive projects'}
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

          <div className="flex-1 overflow-y-auto p-6">
            {/* Project Grid */}
            {activeTab === 'all' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-16">
                    <Folder size={48} className="text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">
                      {searchQuery ? 'No projects found' : 'No projects yet'}
                    </h3>
                    <p className="text-gray-500 mb-6 text-center max-w-md">
                      {searchQuery 
                        ? `No projects match "${searchQuery}". Try a different search term.`
                        : 'Create your first project to get started with AETHERFLOW.'
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
            )}

            {activeTab === 'recent' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recentProjects.length > 0 ? (
                  recentProjects.map(project => (
                    <ProjectCard key={project.id} project={project} isRecent />
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-16">
                    <Clock size={48} className="text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">No recent projects</h3>
                    <p className="text-gray-500">Projects you've worked on recently will appear here.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Create New Project</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="btn btn-ghost btn-sm"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="My Awesome Project"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="A brief description of your project..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Template
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {projectTemplates.map((template) => {
                    const Icon = template.icon;
                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => setNewProject({ ...newProject, template: template.id })}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          newProject.template === template.id
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        <Icon size={16} className="text-blue-400 mb-2" />
                        <div className="text-sm font-medium text-white">{template.name}</div>
                        <div className="text-xs text-gray-400">{template.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

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
                  className="btn btn-secondary"
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

export default ProjectManager;