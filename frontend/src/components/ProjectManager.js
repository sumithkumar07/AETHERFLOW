import React, { useState } from 'react';
import { Plus, Folder, Calendar, X, Github, Globe } from 'lucide-react';

const ProjectManager = ({ projects, onCreateProject, onOpenProject, onClose }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    await onCreateProject(projectName.trim(), projectDescription.trim());
    setProjectName('');
    setProjectDescription('');
    setShowCreateForm(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getProjectIcon = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('react') || lower.includes('web') || lower.includes('frontend')) {
      return '⚛️';
    }
    if (lower.includes('api') || lower.includes('backend') || lower.includes('server')) {
      return '🚀';
    }
    if (lower.includes('mobile') || lower.includes('app')) {
      return '📱';
    }
    if (lower.includes('ai') || lower.includes('ml') || lower.includes('bot')) {
      return '🤖';
    }
    return '📁';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-400">VibeCode</h1>
            <p className="text-gray-400 text-sm mt-1">Your projects, your code, your creativity</p>
          </div>
          {projects.length > 0 && (
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg"
              title="Close"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">⚡</div>
          <h2 className="text-3xl font-bold mb-2">Welcome to VibeCode</h2>
          <p className="text-gray-400 text-lg">
            A modern, AI-powered web-based IDE for all your coding needs
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg flex items-center space-x-2 text-lg font-medium transition-colors"
          >
            <Plus size={20} />
            <span>Create New Project</span>
          </button>
        </div>

        {/* Create Project Form */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Create New Project</h3>
                <button 
                  onClick={() => setShowCreateForm(false)}
                  className="p-1 hover:bg-gray-700 rounded"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateProject}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="My Awesome Project"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                    required
                    autoFocus
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Brief description of your project..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                    rows="3"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {projects.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">Your Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-gray-600 rounded-lg p-6 cursor-pointer transition-all duration-200 transform hover:scale-[1.02]"
                  onClick={() => onOpenProject(project)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl mb-2">
                      {getProjectIcon(project.name)}
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                      <Calendar size={12} className="mr-1" />
                      {formatDate(project.created_at)}
                    </div>
                  </div>
                  
                  <h4 className="font-bold text-lg mb-2 text-white">
                    {project.name}
                  </h4>
                  
                  {project.description && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                      {project.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Folder size={12} className="mr-1" />
                        Files
                      </span>
                    </div>
                    
                    <button 
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenProject(project);
                      }}
                    >
                      Open →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {projects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Folder size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold mb-2">No projects yet</h3>
            <p className="text-gray-400 mb-6">
              Create your first project to start coding!
            </p>
          </div>
        )}

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl mb-3">🤖</div>
            <h4 className="font-bold text-lg mb-2">AI Assistant</h4>
            <p className="text-gray-400 text-sm">
              Get help with coding, debugging, and optimization from our AI assistant
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl mb-3">⚡</div>
            <h4 className="font-bold text-lg mb-2">Fast Editor</h4>
            <p className="text-gray-400 text-sm">
              Monaco Editor with syntax highlighting, auto-completion, and more
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl mb-3">🌐</div>
            <h4 className="font-bold text-lg mb-2">Web-Based</h4>
            <p className="text-gray-400 text-sm">
              Access your projects from anywhere, no installation required
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectManager;