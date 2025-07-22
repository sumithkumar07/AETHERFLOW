import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Filter, Star, Download, Eye, Code, Clock, User, Tag, 
  ChevronRight, ExternalLink, Play, GitBranch, Zap, Globe, 
  Smartphone, Server, Database, Palette, ShoppingCart, FileText, 
  Grid3X3, TrendingUp, Award, Bookmark, Share2, Copy, Settings,
  Layers, Box, Cpu, Brain, Workflow, Target, Rocket, Crown
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const EnhancedTemplatesGallery = ({ onClose, onCreateProject, professionalMode = true }) => {
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
  const [viewMode, setViewMode] = useState('grid');
  const [favorites, setFavorites] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState([]);

  useEffect(() => {
    fetchTemplates();
    fetchCategories();
    fetchAiRecommendations();
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
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      } else {
        // Fallback mock data for demo
        setTemplates(getMockTemplates());
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      setTemplates(getMockTemplates());
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/templates/categories`);
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

  const fetchAiRecommendations = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/templates/ai-recommendations`);
      if (response.ok) {
        const data = await response.json();
        setAiRecommendations(data);
      }
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
    }
  };

  // Mock data for demo purposes
  const getMockTemplates = () => [
    {
      id: 'nextjs-ai-saas',
      name: 'Next.js AI SaaS Starter',
      author: 'AETHERFLOW AI',
      description: 'Complete SaaS boilerplate with AI integration, authentication, payments, and dashboard',
      category: 'fullstack',
      framework: 'next.js',
      difficulty: 'intermediate',
      downloads: 15420,
      stars: 4.9,
      rating: 4.9,
      estimated_time: '15 min',
      features: ['AI Chat Integration', 'Stripe Payments', 'User Dashboard', 'Database Setup'],
      technologies: ['Next.js 14', 'OpenAI API', 'Prisma', 'Tailwind CSS', 'NextAuth.js'],
      tags: ['saas', 'ai', 'payments', 'auth'],
      featured: true,
      trending: true,
      aiRecommended: true,
      thumbnail: null,
      preview_url: 'https://demo.example.com',
      compatibility: ['node 18+', 'npm 9+'],
      lastUpdated: '2025-01-15'
    },
    {
      id: 'react-ai-dashboard',
      name: 'React AI Analytics Dashboard',
      author: 'DataViz Pro',
      description: 'Modern analytics dashboard with AI-powered insights and real-time data visualization',
      category: 'dashboard',
      framework: 'react',
      difficulty: 'advanced',
      downloads: 8750,
      stars: 4.8,
      rating: 4.8,
      estimated_time: '20 min',
      features: ['Real-time Charts', 'AI Insights', 'Dark/Light Mode', 'Export Data'],
      technologies: ['React 18', 'Chart.js', 'TensorFlow.js', 'Material-UI'],
      tags: ['analytics', 'ai', 'charts', 'dashboard'],
      featured: true,
      trending: false,
      aiRecommended: true,
      thumbnail: null
    },
    {
      id: 'flutter-ecommerce',
      name: 'Flutter E-commerce App',
      author: 'Mobile Masters',
      description: 'Complete mobile e-commerce solution with payment integration and admin panel',
      category: 'mobile',
      framework: 'flutter',
      difficulty: 'intermediate',
      downloads: 12300,
      stars: 4.7,
      rating: 4.7,
      estimated_time: '30 min',
      features: ['Product Catalog', 'Shopping Cart', 'Payment Gateway', 'User Profiles'],
      technologies: ['Flutter', 'Firebase', 'Stripe', 'Provider'],
      tags: ['ecommerce', 'mobile', 'payments', 'firebase'],
      featured: false,
      trending: true,
      aiRecommended: false,
      thumbnail: null
    },
    {
      id: 'fastapi-ml-api',
      name: 'FastAPI ML API',
      author: 'AI Engineering',
      description: 'Production-ready machine learning API with model serving and monitoring',
      category: 'backend',
      framework: 'fastapi',
      difficulty: 'advanced',
      downloads: 6890,
      stars: 4.9,
      rating: 4.9,
      estimated_time: '25 min',
      features: ['Model Serving', 'API Monitoring', 'Auto Scaling', 'Docker Ready'],
      technologies: ['FastAPI', 'PyTorch', 'Docker', 'Prometheus'],
      tags: ['ml', 'api', 'python', 'docker'],
      featured: true,
      trending: false,
      aiRecommended: true,
      thumbnail: null
    },
    {
      id: 'vue-portfolio',
      name: 'Vue.js Portfolio Site',
      author: 'Design Studio',
      description: 'Beautiful portfolio website with animations and modern design',
      category: 'portfolio',
      framework: 'vue.js',
      difficulty: 'beginner',
      downloads: 9240,
      stars: 4.6,
      rating: 4.6,
      estimated_time: '12 min',
      features: ['Smooth Animations', 'Responsive Design', 'Contact Form', 'Blog Section'],
      technologies: ['Vue 3', 'Nuxt.js', 'GSAP', 'Tailwind CSS'],
      tags: ['portfolio', 'design', 'animations'],
      featured: false,
      trending: false,
      aiRecommended: false,
      thumbnail: null
    }
  ];

  const getMockCategories = () => [
    { id: 'ai', name: 'AI & ML', count: 8, icon: 'brain' },
    { id: 'fullstack', name: 'Full Stack', count: 12, icon: 'layers' },
    { id: 'frontend', name: 'Frontend', count: 15, icon: 'globe' },
    { id: 'backend', name: 'Backend', count: 10, icon: 'server' },
    { id: 'mobile', name: 'Mobile', count: 7, icon: 'smartphone' },
    { id: 'dashboard', name: 'Dashboards', count: 6, icon: 'grid' },
    { id: 'ecommerce', name: 'E-commerce', count: 5, icon: 'shopping-cart' },
    { id: 'portfolio', name: 'Portfolio', count: 9, icon: 'user' }
  ];

  const fetchTemplatePreview = async (templateId) => {
    try {
      setPreviewData({ loading: true });
      const response = await fetch(`${BACKEND_URL}/api/templates/${templateId}/preview`);
      if (response.ok) {
        const data = await response.json();
        setPreviewData(data);
      } else {
        setPreviewData({
          structure: {
            'src/': {
              'components/': {},
              'pages/': {},
              'utils/': {},
              'styles/': {}
            },
            'package.json': {},
            'README.md': {},
            '.env.example': {}
          }
        });
      }
    } catch (error) {
      console.error('Error fetching template preview:', error);
      setPreviewData({ error: 'Failed to load preview' });
    }
  };

  const handleUseTemplate = async (template, projectName) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/templates/${template.id}/use`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          project_name: projectName,
          template_config: {
            ai_assistant: template.aiRecommended,
            framework: template.framework,
            features: template.features
          }
        })
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

  const toggleFavorite = (templateId) => {
    setFavorites(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const getCategoryIcon = (categoryId) => {
    const icons = {
      'ai': Brain,
      'fullstack': Layers,
      'frontend': Globe,
      'backend': Server,
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
      'beginner': 'text-green-400 bg-green-400/10 border-green-400/30',
      'intermediate': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
      'advanced': 'text-red-400 bg-red-400/10 border-red-400/30'
    };
    return colors[difficulty] || colors.intermediate;
  };

  const EnhancedTemplateCard = ({ template }) => {
    const [showUseModal, setShowUseModal] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [isHovered, setIsHovered] = useState(false);

    const CategoryIcon = getCategoryIcon(template.category);
    const isFavorite = favorites.includes(template.id);

    return (
      <>
        <div 
          className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all group relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Header with Thumbnail */}
          <div className="relative h-48 bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden">
            {template.thumbnail ? (
              <img 
                src={template.thumbnail} 
                alt={template.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <CategoryIcon className="w-12 h-12 text-blue-400 opacity-50 mb-2" />
                <div className="text-xs text-gray-500 text-center px-4">
                  {template.framework} • {template.category}
                </div>
              </div>
            )}
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-1">
              {template.featured && (
                <div className="px-2 py-1 bg-yellow-500 text-black rounded-md text-xs font-bold flex items-center space-x-1">
                  <Crown size={10} />
                  <span>Featured</span>
                </div>
              )}
              {template.trending && (
                <div className="px-2 py-1 bg-red-500 text-white rounded-md text-xs font-bold flex items-center space-x-1">
                  <TrendingUp size={10} />
                  <span>Trending</span>
                </div>
              )}
              {template.aiRecommended && (
                <div className="px-2 py-1 bg-blue-500 text-white rounded-md text-xs font-bold flex items-center space-x-1">
                  <Brain size={10} />
                  <span>AI Pick</span>
                </div>
              )}
            </div>
            
            {/* Actions Overlay */}
            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center space-x-2 transition-all ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
              <button
                onClick={() => handlePreviewTemplate(template)}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 flex items-center space-x-2 text-sm font-medium transition-all"
              >
                <Eye size={14} />
                <span>Preview</span>
              </button>
              <button
                onClick={() => setShowUseModal(true)}
                className="px-4 py-2 bg-blue-600/90 backdrop-blur-sm text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 text-sm font-medium transition-all"
              >
                <Download size={14} />
                <span>Use</span>
              </button>
            </div>

            {/* Favorite Button */}
            <button
              onClick={() => toggleFavorite(template.id)}
              className={`absolute top-3 right-3 p-2 rounded-lg transition-all ${
                isFavorite 
                  ? 'bg-red-500 text-white' 
                  : 'bg-black/20 text-gray-300 hover:bg-black/40 hover:text-white'
              }`}
            >
              <Bookmark size={12} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>
          
          <div className="p-5 relative z-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white group-hover:text-blue-400 text-lg transition-colors truncate">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  by {template.author}
                </p>
              </div>
              
              <div className={`px-2 py-1 rounded-lg text-xs font-medium border ${getDifficultyColor(template.difficulty)}`}>
                {template.difficulty}
              </div>
            </div>
            
            <p className="text-sm text-gray-300 mb-4 line-clamp-2 leading-relaxed">
              {template.description}
            </p>
            
            {/* Enhanced Stats */}
            <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Download size={12} />
                  <span>{template.downloads.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star size={12} className="text-yellow-400" />
                  <span>{template.rating}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock size={12} />
                  <span>{template.estimated_time}</span>
                </div>
              </div>
            </div>

            {/* Features Preview */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {template.features.slice(0, 3).map(feature => (
                  <span
                    key={feature}
                    className="px-2 py-1 bg-slate-700 text-gray-300 rounded text-xs"
                  >
                    {feature}
                  </span>
                ))}
                {template.features.length > 3 && (
                  <span className="px-2 py-1 bg-slate-700 text-gray-300 rounded text-xs">
                    +{template.features.length - 3} more
                  </span>
                )}
              </div>
            </div>
            
            {/* Framework and Last Updated */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-medium">
                  {template.framework}
                </span>
              </div>
              
              <div className="text-xs text-gray-500">
                {template.lastUpdated && `Updated ${new Date(template.lastUpdated).toLocaleDateString()}`}
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Use Template Modal */}
        {showUseModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center space-x-3 mb-4">
                <CategoryIcon className="w-8 h-8 text-blue-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Create from Template
                  </h3>
                  <p className="text-sm text-gray-400">
                    {template.name}
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder={`${template.name} Project`}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Template Info */}
              <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
                <div className="text-xs text-gray-400 mb-2">This template includes:</div>
                <div className="flex flex-wrap gap-1">
                  {template.features.slice(0, 4).map(feature => (
                    <span key={feature} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                      {feature}
                    </span>
                  ))}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Setup time: {template.estimated_time} • {template.framework}
                </div>
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
                  className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Rocket size={14} />
                  Create Project
                </button>
                <button
                  onClick={() => setShowUseModal(false)}
                  className="btn btn-secondary"
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

  // Enhanced Category Filter with icons
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
        <span>All Templates</span>
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

  // Enhanced Template Preview
  const EnhancedTemplatePreview = () => {
    if (!showPreview || !selectedTemplate) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  {getCategoryIcon(selectedTemplate.category)({ size: 24, className: "text-white" })}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {selectedTemplate.name}
                  </h2>
                  <p className="text-gray-400 mb-3">
                    {selectedTemplate.description}
                  </p>
                  
                  {/* Enhanced Badges */}
                  <div className="flex items-center space-x-2">
                    {selectedTemplate.featured && (
                      <span className="px-2 py-1 bg-yellow-500 text-black rounded text-xs font-bold flex items-center space-x-1">
                        <Crown size={12} />
                        <span>Featured</span>
                      </span>
                    )}
                    {selectedTemplate.aiRecommended && (
                      <span className="px-2 py-1 bg-blue-500 text-white rounded text-xs font-bold flex items-center space-x-1">
                        <Brain size={12} />
                        <span>AI Recommended</span>
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(selectedTemplate.difficulty)}`}>
                      {selectedTemplate.difficulty}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-auto">
            <div className="grid md:grid-cols-2 gap-6 p-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {selectedTemplate.downloads.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">Downloads</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400 flex items-center justify-center space-x-1">
                      <Star size={20} />
                      <span>{selectedTemplate.rating}</span>
                    </div>
                    <div className="text-sm text-gray-400">Rating</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {selectedTemplate.estimated_time}
                    </div>
                    <div className="text-sm text-gray-400">Setup</div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="font-semibold text-white mb-3 flex items-center space-x-2">
                    <Zap size={16} />
                    <span>Key Features</span>
                  </h3>
                  <div className="space-y-2">
                    {selectedTemplate.features.map(feature => (
                      <div key={feature} className="flex items-center space-x-3 text-gray-300">
                        <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Technologies */}
                <div>
                  <h3 className="font-semibold text-white mb-3 flex items-center space-x-2">
                    <Box size={16} />
                    <span>Technologies</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.technologies.map(tech => (
                      <span
                        key={tech}
                        className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Preview Links */}
                {selectedTemplate.preview_url && (
                  <div>
                    <h3 className="font-semibold text-white mb-3 flex items-center space-x-2">
                      <ExternalLink size={16} />
                      <span>Live Preview</span>
                    </h3>
                    <a
                      href={selectedTemplate.preview_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-700 text-blue-400 hover:text-blue-300 rounded-lg transition-colors"
                    >
                      <Globe size={16} />
                      <span>View Live Demo</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* File Structure */}
                {previewData && !previewData.loading && !previewData.error && (
                  <div>
                    <h3 className="font-semibold text-white mb-3 flex items-center space-x-2">
                      <FileText size={16} />
                      <span>Project Structure</span>
                    </h3>
                    <div className="bg-slate-700/50 rounded-lg p-4 font-mono text-sm max-h-64 overflow-y-auto">
                      <pre className="text-gray-300">
                        {JSON.stringify(previewData.structure, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Author Info */}
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3 flex items-center space-x-2">
                    <User size={16} />
                    <span>Template Author</span>
                  </h3>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-white">{selectedTemplate.author}</div>
                      <div className="text-sm text-gray-400">Template Creator</div>
                    </div>
                  </div>
                </div>

                {/* Compatibility */}
                {selectedTemplate.compatibility && (
                  <div>
                    <h3 className="font-semibold text-white mb-3 flex items-center space-x-2">
                      <Settings size={16} />
                      <span>Requirements</span>
                    </h3>
                    <div className="space-y-2">
                      {selectedTemplate.compatibility.map(req => (
                        <div key={req} className="flex items-center space-x-3 text-gray-300">
                          <CheckCircle2 size={14} className="text-green-400" />
                          <span className="text-sm">{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-6 border-t border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>Updated {selectedTemplate.lastUpdated}</span>
                <span>•</span>
                <span>{selectedTemplate.framework}</span>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => toggleFavorite(selectedTemplate.id)}
                  className={`btn ${favorites.includes(selectedTemplate.id) ? 'btn-secondary' : 'btn-ghost'}`}
                >
                  <Bookmark size={16} fill={favorites.includes(selectedTemplate.id) ? 'currentColor' : 'none'} />
                  {favorites.includes(selectedTemplate.id) ? 'Saved' : 'Save'}
                </button>
                
                <button
                  onClick={() => {
                    setShowPreview(false);
                    // Show use modal
                  }}
                  className="btn btn-primary"
                >
                  <Download size={16} />
                  Use This Template
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
                  <Code size={16} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Templates Gallery</h1>
                  <p className="text-xs text-gray-400">Professional project templates</p>
                </div>
              </div>
              
              {/* AI Badge */}
              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full">
                <Brain size={12} className="text-blue-400" />
                <span className="text-xs text-blue-400 font-medium">AI Curated</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Enhanced Filters */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              <select
                value={selectedFramework}
                onChange={(e) => setSelectedFramework(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
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
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="downloads">Most Popular</option>
                <option value="stars">Highest Rated</option>
                <option value="recent">Recently Updated</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
            
            <CategoryFilter />
          </div>
        </div>
        
        {/* Templates Grid */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {templates.map(template => (
                <EnhancedTemplateCard key={template.id} template={template} />
              ))}
            </div>
          )}
          
          {!isLoading && templates.length === 0 && (
            <div className="text-center py-12">
              <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No Templates Found
              </h3>
              <p className="text-gray-400">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <EnhancedTemplatePreview />
    </div>
  );
};

export default EnhancedTemplatesGallery;