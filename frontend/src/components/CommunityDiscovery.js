import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Heart, Eye, GitBranch, Star,
  User, Calendar, Tag, TrendingUp, Clock, Play,
  ExternalLink, MessageSquare, Copy, Share2,
  Code, Smartphone, Server, Globe, Grid3X3,
  Users, Award, Zap, FileText, ShoppingCart
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CommunityDiscovery = ({ onClose, professionalMode = true }) => {
  const [projects, setProjects] = useState([]);
  const [featuredContent, setFeaturedContent] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [communityStats, setCommunityStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContentType, setSelectedContentType] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('trending');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectComments, setProjectComments] = useState([]);

  useEffect(() => {
    fetchProjects();
    fetchFeaturedContent();
    fetchTrendingTags();
    fetchCommunityStats();
  }, [searchQuery, selectedContentType, selectedTags, selectedDifficulty, sortBy]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        content_type: selectedContentType,
        tags: selectedTags.join(','),
        difficulty: selectedDifficulty,
        search: searchQuery,
        sort_by: sortBy,
        limit: '20'
      });
      
      const response = await fetch(`${BACKEND_URL}/api/community/discover?${params}`);
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeaturedContent = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/community/featured`);
      const data = await response.json();
      setFeaturedContent(data);
    } catch (error) {
      console.error('Error fetching featured content:', error);
    }
  };

  const fetchTrendingTags = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/community/trending/tags`);
      const data = await response.json();
      setTrendingTags(data.trending_tags || []);
    } catch (error) {
      console.error('Error fetching trending tags:', error);
    }
  };

  const fetchCommunityStats = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/community/stats`);
      const data = await response.json();
      setCommunityStats(data);
    } catch (error) {
      console.error('Error fetching community stats:', error);
    }
  };

  const fetchProjectComments = async (projectId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/community/projects/${projectId}/comments`);
      const data = await response.json();
      setProjectComments(data);
    } catch (error) {
      console.error('Error fetching project comments:', error);
    }
  };

  const handleLikeProject = async (projectId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/community/projects/${projectId}/like`, {
        method: 'POST'
      });
      
      if (response.ok) {
        await fetchProjects(); // Refresh projects
      }
    } catch (error) {
      console.error('Error liking project:', error);
    }
  };

  const handleForkProject = async (projectId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/community/projects/${projectId}/fork`, {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Show success notification
        console.log('Project forked successfully:', result);
      }
    } catch (error) {
      console.error('Error forking project:', error);
    }
  };

  const getContentTypeIcon = (contentType) => {
    const icons = {
      'project': Code,
      'snippet': FileText,
      'tutorial': Users,
      'showcase': Award
    };
    return icons[contentType] || Code;
  };

  const getContentTypeColor = (contentType) => {
    const colors = {
      'project': 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300',
      'snippet': 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
      'tutorial': 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300',
      'showcase': 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300'
    };
    return colors[contentType] || colors.project;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'beginner': 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
      'intermediate': 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300',
      'advanced': 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300'
    };
    return colors[difficulty] || colors.intermediate;
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const ProjectCard = ({ project }) => {
    const ContentTypeIcon = getContentTypeIcon(project.content_type);
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group">
        {/* Thumbnail */}
        <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 overflow-hidden rounded-t-lg">
          {project.thumbnail ? (
            <img 
              src={project.thumbnail} 
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ContentTypeIcon className="w-16 h-16 text-blue-500 opacity-50" />
            </div>
          )}
          
          {/* Overlay buttons */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100">
            <button
              onClick={() => {
                setSelectedProject(project);
                setShowProjectModal(true);
                fetchProjectComments(project.id);
              }}
              className="px-3 py-2 bg-white text-gray-900 rounded-md hover:bg-gray-100 flex items-center space-x-1 text-sm font-medium"
            >
              <Eye className="w-4 h-4" />
              <span>View</span>
            </button>
            
            {project.preview_url && (
              <a
                href={project.preview_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-1 text-sm font-medium"
              >
                <Play className="w-4 h-4" />
                <span>Demo</span>
              </a>
            )}
          </div>
          
          {/* Featured badge */}
          {project.featured && (
            <div className="absolute top-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center space-x-1">
              <Star className="w-3 h-3" />
              <span>Featured</span>
            </div>
          )}
          
          {/* Content type badge */}
          <div className={`absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-medium ${getContentTypeColor(project.content_type)}`}>
            {project.content_type.toUpperCase()}
          </div>
        </div>
        
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 text-lg line-clamp-1">
                {project.title}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <User className="w-3 h-3" />
                <span>{project.author.display_name}</span>
                <span>•</span>
                <span>{formatTimeAgo(project.created_at)}</span>
              </div>
            </div>
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${getDifficultyColor(project.difficulty_level)}`}>
              {project.difficulty_level}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
            {project.description}
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{project.views_count.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-3 h-3" />
                <span>{project.likes_count}</span>
              </div>
              <div className="flex items-center space-x-1">
                <GitBranch className="w-3 h-3" />
                <span>{project.forks_count}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="w-3 h-3" />
                <span>{project.comments_count}</span>
              </div>
            </div>
          </div>
          
          {/* Technologies */}
          <div className="flex flex-wrap gap-1 mb-3">
            {project.technologies.slice(0, 3).map(tech => (
              <span
                key={tech}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                +{project.technologies.length - 3}
              </span>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleLikeProject(project.id)}
              className="flex items-center space-x-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-red-100 hover:text-red-600 text-sm"
            >
              <Heart className="w-3 h-3" />
              <span>Like</span>
            </button>
            
            <button
              onClick={() => handleForkProject(project.id)}
              className="flex items-center space-x-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-blue-100 hover:text-blue-600 text-sm"
            >
              <GitBranch className="w-3 h-3" />
              <span>Fork</span>
            </button>
            
            {project.repository_url && (
              <a
                href={project.repository_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Code</span>
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  const FeaturedCard = ({ content }) => (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
      <div className="flex items-center space-x-2 mb-2">
        <Star className="w-5 h-5 text-yellow-300" />
        <span className="text-sm font-medium">Featured</span>
      </div>
      <h3 className="text-xl font-bold mb-2">{content.title}</h3>
      <p className="text-blue-100 mb-4">{content.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm">
          <span>{content.metrics.views} views</span>
          <span>{content.metrics.likes} likes</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-xs">
            {content.author.display_name.charAt(0)}
          </div>
          <span className="text-sm">{content.author.display_name}</span>
        </div>
      </div>
    </div>
  );

  const ProjectModal = () => {
    if (!showProjectModal || !selectedProject) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedProject.title}
                </h2>
                <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400 mt-2">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{selectedProject.author.display_name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatTimeAgo(selectedProject.created_at)}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${getDifficultyColor(selectedProject.difficulty_level)}`}>
                    {selectedProject.difficulty_level}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowProjectModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            <div className="space-y-6">
              <p className="text-gray-700 dark:text-gray-300">
                {selectedProject.description}
              </p>
              
              {/* Technologies */}
              <div>
                <h3 className="font-semibold mb-2">Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.technologies.map(tech => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Tags */}
              {selectedProject.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Comments */}
              <div>
                <h3 className="font-semibold mb-4">Comments ({projectComments.length})</h3>
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {projectComments.map(comment => (
                    <div key={comment.id} className="flex space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {comment.author.display_name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {comment.author.display_name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              {selectedProject.preview_url && (
                <a
                  href={selectedProject.preview_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>View Live Demo</span>
                </a>
              )}
              
              {selectedProject.repository_url && (
                <a
                  href={selectedProject.repository_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View Code</span>
                </a>
              )}
              
              <button
                onClick={() => setShowProjectModal(false)}
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
              <Users className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Community Discovery
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
              onClick={() => setActiveTab('discover')}
              className={`px-4 py-2 rounded-md font-medium flex items-center space-x-2 ${
                activeTab === 'discover'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Discover</span>
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`px-4 py-2 rounded-md font-medium flex items-center space-x-2 ${
                activeTab === 'trending'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Trending</span>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 rounded-md font-medium flex items-center space-x-2 ${
                activeTab === 'stats'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Statistics</span>
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search community projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            
            <select
              value={selectedContentType}
              onChange={(e) => setSelectedContentType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Content</option>
              <option value="project">Projects</option>
              <option value="snippet">Code Snippets</option>
              <option value="tutorial">Tutorials</option>
              <option value="showcase">Showcases</option>
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
              <option value="trending">Trending</option>
              <option value="popular">Most Popular</option>
              <option value="recent">Recently Added</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>
          
          {/* Trending tags */}
          {trendingTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {trendingTags.slice(0, 10).map(tag => (
                <button
                  key={tag.tag}
                  onClick={() => {
                    if (selectedTags.includes(tag.tag)) {
                      setSelectedTags(selectedTags.filter(t => t !== tag.tag));
                    } else {
                      setSelectedTags([...selectedTags, tag.tag]);
                    }
                  }}
                  className={`px-3 py-1 rounded-md text-sm font-medium flex items-center space-x-1 ${
                    selectedTags.includes(tag.tag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Tag className="w-3 h-3" />
                  <span>{tag.tag}</span>
                  <span className="text-xs opacity-75">({tag.count})</span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto">
          {activeTab === 'discover' && (
            <div className="p-6">
              {/* Featured content */}
              {featuredContent.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Featured Content
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {featuredContent.map(content => (
                      <FeaturedCard key={content.id} content={content} />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Projects grid */}
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {projects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}
              
              {!isLoading && projects.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Projects Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'stats' && communityStats && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                      <p className="text-2xl font-bold text-blue-600">{communityStats.total_users}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Projects</p>
                      <p className="text-2xl font-bold text-green-600">{communityStats.total_projects}</p>
                    </div>
                    <Code className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
                      <p className="text-2xl font-bold text-purple-600">{communityStats.total_views.toLocaleString()}</p>
                    </div>
                    <Eye className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Likes</p>
                      <p className="text-2xl font-bold text-red-600">{communityStats.total_likes.toLocaleString()}</p>
                    </div>
                    <Heart className="w-8 h-8 text-red-600" />
                  </div>
                </div>
              </div>
              
              {/* Popular technologies */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Popular Technologies</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {communityStats.popular_technologies.map(tech => (
                    <div key={tech.name} className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-white">{tech.name}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{tech.usage} projects</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <ProjectModal />
    </div>
  );
};

export default CommunityDiscovery;