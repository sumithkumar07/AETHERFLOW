import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Star, Download, Eye, Code, 
  Clock, User, Tag, ChevronRight, ExternalLink,
  Play, GitBranch, Zap, Globe, Smartphone, Server,
  Database, Palette, ShoppingCart, FileText, Grid3X3
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const TemplatesGallery = ({ onClose, onCreateProject, professionalMode = true }) => {
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFramework, setSelectedFramework] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('downloads');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    fetchTemplates();
    fetchCategories();
  }, [selectedCategory, selectedFramework, selectedDifficulty, searchQuery, sortBy]);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        category: selectedCategory,
        framework: selectedFramework,
        difficulty: selectedDifficulty,
        search: searchQuery,
        sort_by: sortBy
      });
      
      const response = await fetch(`${BACKEND_URL}/api/templates?${params}`);
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/templates/categories`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTemplatePreview = async (templateId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/templates/${templateId}/preview`);
      const data = await response.json();
      setPreviewData(data);
    } catch (error) {
      console.error('Error fetching template preview:', error);
    }
  };

  const handleUseTemplate = async (template, projectName) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/templates/${template.id}/use`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_name: projectName })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        onCreateProject && onCreateProject(result.project_id);
        onClose();
      }
    } catch (error) {
      console.error('Error using template:', error);
    }
  };

  const handlePreviewTemplate = async (template) => {
    setSelectedTemplate(template);
    setShowPreview(true);
    await fetchTemplatePreview(template.id);
  };

  const getCategoryIcon = (categoryId) => {
    const icons = {
      'frontend': Globe,
      'backend': Server,
      'fullstack': Zap,
      'mobile': Smartphone,
      'dashboard': Grid3X3,
      'portfolio': User,
      'ecommerce': ShoppingCart,
      'blog': FileText
    };
    return icons[categoryId] || Code;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'beginner': 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
      'intermediate': 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300',
      'advanced': 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300'
    };
    return colors[difficulty] || colors.intermediate;
  };

  const TemplateCard = ({ template }) => {
    const [showUseModal, setShowUseModal] = useState(false);
    const [projectName, setProjectName] = useState('');

    const CategoryIcon = getCategoryIcon(template.category);

    return (
      <>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group overflow-hidden">
          {/* Thumbnail */}
          <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
            {template.thumbnail ? (
              <img 
                src={template.thumbnail} 
                alt={template.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <CategoryIcon className="w-16 h-16 text-blue-500 opacity-50" />
              </div>
            )}
            
            {/* Overlay buttons */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100">
              <button
                onClick={() => handlePreviewTemplate(template)}
                className="px-3 py-2 bg-white text-gray-900 rounded-md hover:bg-gray-100 flex items-center space-x-1 text-sm font-medium"
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </button>
              <button
                onClick={() => setShowUseModal(true)}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-1 text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                <span>Use</span>
              </button>
            </div>
            
            {/* Featured badge */}
            {template.featured && (
              <div className="absolute top-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center space-x-1">
                <Star className="w-3 h-3" />
                <span>Featured</span>
              </div>
            )}
          </div>
          
          <div className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 text-lg">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  by {template.author}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-md text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                {template.difficulty}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
              {template.description}
            </p>
            
            {/* Stats */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Download className="w-3 h-3" />
                  <span>{template.downloads.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3" />
                  <span>{template.stars}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{template.estimated_time}</span>
                </div>
              </div>
            </div>
            
            {/* Framework and tags */}
            <div className="flex items-center justify-between">
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-medium">
                {template.framework}
              </span>
              
              <div className="flex space-x-1">
                {template.tags.slice(0, 2).map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {template.tags.length > 2 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                    +{template.tags.length - 2}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Use Template Modal */}
        {showUseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Create Project from Template
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create a new project using "{template.name}" template
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    if (projectName.trim()) {
                      handleUseTemplate(template, projectName.trim());
                      setShowUseModal(false);
                    }
                  }}
                  disabled={!projectName.trim()}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Project
                </button>
                <button
                  onClick={() => setShowUseModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  const CategoryFilter = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        onClick={() => setSelectedCategory('all')}
        className={`px-3 py-1 rounded-md text-sm font-medium flex items-center space-x-1 ${
          selectedCategory === 'all'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
      >
        <Grid3X3 className="w-3 h-3" />
        <span>All</span>
      </button>
      {categories.map(category => {
        const IconComponent = getCategoryIcon(category.id);
        return (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-3 py-1 rounded-md text-sm font-medium flex items-center space-x-1 ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <IconComponent className="w-3 h-3" />
            <span>{category.name}</span>
            <span className="text-xs">({category.count})</span>
          </button>
        );
      })}
    </div>
  );

  const TemplatePreview = () => {
    if (!showPreview || !selectedTemplate) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedTemplate.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedTemplate.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {previewData ? (
              <div className="space-y-6">
                {/* Preview URL */}
                {selectedTemplate.preview_url && (
                  <div>
                    <h3 className="font-semibold mb-2">Live Preview</h3>
                    <a
                      href={selectedTemplate.preview_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open Preview</span>
                    </a>
                  </div>
                )}
                
                {/* Features */}
                {selectedTemplate.features.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Features</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                      {selectedTemplate.features.map(feature => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Technologies */}
                <div>
                  <h3 className="font-semibold mb-2">Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.technologies.map(tech => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* File Structure */}
                {previewData.structure && (
                  <div>
                    <h3 className="font-semibold mb-2">Project Structure</h3>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-4 font-mono text-sm">
                      <pre className="text-gray-800 dark:text-gray-200">
                        {JSON.stringify(previewData.structure, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  // Handle use template
                  setShowPreview(false);
                  // You can open the use modal here
                }}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Use This Template</span>
              </button>
              
              <button
                onClick={() => setShowPreview(false)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
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
              <Code className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Templates Gallery
              </h1>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ✕
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
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            
            <select
              value={selectedFramework}
              onChange={(e) => setSelectedFramework(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Frameworks</option>
              <option value="react">React</option>
              <option value="vue.js">Vue.js</option>
              <option value="next.js">Next.js</option>
              <option value="svelte">Svelte</option>
              <option value="fastapi">FastAPI</option>
              <option value="flutter">Flutter</option>
            </select>
            
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="downloads">Most Popular</option>
              <option value="stars">Most Starred</option>
              <option value="recent">Recently Updated</option>
              <option value="name">Name</option>
            </select>
          </div>
          
          <CategoryFilter />
        </div>
        
        {/* Templates Grid */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {templates.map(template => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          )}
          
          {!isLoading && templates.length === 0 && (
            <div className="text-center py-12">
              <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Templates Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <TemplatePreview />
    </div>
  );
};

export default TemplatesGallery;