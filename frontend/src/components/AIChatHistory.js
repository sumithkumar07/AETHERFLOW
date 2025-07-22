import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, MessageSquare, Clock, Trash2, 
  Star, Download, Archive, Calendar, Bot,
  ChevronDown, ChevronRight, Eye, Copy, Share2,
  Tag, User, Zap, MoreVertical, ArrowUp
} from 'lucide-react';

const AIChatHistory = ({ onClose, professionalMode = true }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  // Mock conversation data
  const mockConversations = [
    {
      id: 'conv_001',
      title: 'React Component Optimization',
      model: 'Claude 3.5 Sonnet',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      message_count: 12,
      favorite: true,
      tags: ['react', 'optimization', 'performance'],
      summary: 'Discussion about optimizing React components for better performance, including memo, useMemo, and useCallback strategies.',
      messages: [
        { role: 'user', content: 'How can I optimize my React components for better performance?' },
        { role: 'assistant', content: 'There are several strategies for React optimization...' },
      ]
    },
    {
      id: 'conv_002', 
      title: 'Python API Design Patterns',
      model: 'GPT-4',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      message_count: 8,
      favorite: false,
      tags: ['python', 'api', 'design-patterns'],
      summary: 'Exploring best practices for designing RESTful APIs in Python using FastAPI and proper architectural patterns.',
      messages: [
        { role: 'user', content: 'What are the best practices for Python API design?' },
        { role: 'assistant', content: 'Here are the key principles for Python API design...' },
      ]
    },
    {
      id: 'conv_003',
      title: 'Database Schema Design',
      model: 'Claude 3.5 Sonnet',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      message_count: 15,
      favorite: true,
      tags: ['database', 'postgresql', 'schema'],
      summary: 'Comprehensive discussion about designing efficient database schemas for a multi-tenant SaaS application.',
      messages: [
        { role: 'user', content: 'I need help designing a database schema for my SaaS app' },
        { role: 'assistant', content: 'Let me help you design an efficient schema...' },
      ]
    },
    {
      id: 'conv_004',
      title: 'CSS Grid vs Flexbox',
      model: 'GPT-4',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      message_count: 6,
      favorite: false,
      tags: ['css', 'layout', 'frontend'],
      summary: 'Comparison between CSS Grid and Flexbox, when to use each, and practical examples.',
      messages: [
        { role: 'user', content: 'When should I use CSS Grid vs Flexbox?' },
        { role: 'assistant', content: 'Great question! Here\'s how to choose between them...' },
      ]
    },
    {
      id: 'conv_005',
      title: 'Microservices Architecture',
      model: 'Claude 3.5 Sonnet',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      message_count: 20,
      favorite: true,
      tags: ['architecture', 'microservices', 'scalability'],
      summary: 'Deep dive into microservices architecture patterns, benefits, challenges, and implementation strategies.',
      messages: [
        { role: 'user', content: 'Should I migrate from monolith to microservices?' },
        { role: 'assistant', content: 'This is a complex decision that depends on several factors...' },
      ]
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setConversations(mockConversations);
      setIsLoading(false);
    }, 1000);
  }, []);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getModelIcon = (model) => {
    if (model.includes('Claude')) return '🔮';
    if (model.includes('GPT')) return '🧠';
    if (model.includes('Gemini')) return '💎';
    return '🤖';
  };

  const filteredConversations = conversations.filter(conv => {
    if (searchQuery && !conv.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !conv.summary.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !conv.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }
    
    if (selectedModel !== 'all' && !conv.model.toLowerCase().includes(selectedModel.toLowerCase())) {
      return false;
    }
    
    if (favoriteOnly && !conv.favorite) {
      return false;
    }
    
    if (dateRange !== 'all') {
      const now = new Date();
      const diffInDays = Math.floor((now - conv.created_at) / (1000 * 60 * 60 * 24));
      
      if (dateRange === 'today' && diffInDays > 0) return false;
      if (dateRange === 'week' && diffInDays > 7) return false;
      if (dateRange === 'month' && diffInDays > 30) return false;
    }
    
    return true;
  });

  const handleToggleFavorite = (convId) => {
    setConversations(conversations.map(conv =>
      conv.id === convId ? { ...conv, favorite: !conv.favorite } : conv
    ));
  };

  const handleDeleteConversation = (convId) => {
    setConversations(conversations.filter(conv => conv.id !== convId));
    if (selectedConversation?.id === convId) {
      setSelectedConversation(null);
      setShowDetails(false);
    }
  };

  const handleExportConversation = (conversation) => {
    const exportData = {
      title: conversation.title,
      model: conversation.model,
      created_at: conversation.created_at,
      messages: conversation.messages
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conversation.title.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const ConversationCard = ({ conversation }) => (
    <div 
      className={`bg-white dark:bg-gray-800 p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
        selectedConversation?.id === conversation.id 
          ? 'border-blue-500 shadow-md' 
          : 'border-gray-200 dark:border-gray-700'
      }`}
      onClick={() => {
        setSelectedConversation(conversation);
        setShowDetails(true);
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getModelIcon(conversation.model)}</span>
            <MessageSquare className="w-4 h-4 text-blue-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {conversation.title}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>{conversation.model}</span>
              <span>•</span>
              <span>{conversation.message_count} messages</span>
              <span>•</span>
              <span>{formatTimeAgo(conversation.updated_at)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFavorite(conversation.id);
            }}
            className={`p-1 rounded-md transition-colors ${
              conversation.favorite 
                ? 'text-yellow-500 hover:text-yellow-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Star className={`w-4 h-4 ${conversation.favorite ? 'fill-current' : ''}`} />
          </button>
          
          <div className="relative group">
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <MoreVertical className="w-4 h-4" />
            </button>
            
            <div className="absolute right-0 top-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleExportConversation(conversation);
                }}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
              >
                <Download className="w-3 h-3" />
                <span>Export</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteConversation(conversation.id);
                }}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
        {conversation.summary}
      </p>
      
      <div className="flex flex-wrap gap-1">
        {conversation.tags.map(tag => (
          <span
            key={tag}
            className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );

  const ConversationDetails = () => {
    if (!showDetails || !selectedConversation) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{getModelIcon(selectedConversation.model)}</span>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedConversation.title}
                  </h2>
                </div>
                <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
                  <span>{selectedConversation.model}</span>
                  <span>•</span>
                  <span>{selectedConversation.message_count} messages</span>
                  <span>•</span>
                  <span>{formatTimeAgo(selectedConversation.created_at)}</span>
                  {selectedConversation.favorite && (
                    <>
                      <span>•</span>
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Summary</h3>
                <p className="text-gray-700 dark:text-gray-300">{selectedConversation.summary}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Conversation</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {selectedConversation.messages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-3xl p-4 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}>
                        <div className="flex items-center space-x-2 mb-2">
                          {message.role === 'user' ? (
                            <User className="w-4 h-4" />
                          ) : (
                            <Bot className="w-4 h-4" />
                          )}
                          <span className="text-sm font-medium">
                            {message.role === 'user' ? 'You' : selectedConversation.model}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedConversation.tags.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedConversation.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleToggleFavorite(selectedConversation.id)}
                className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
                  selectedConversation.favorite
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Star className={`w-4 h-4 ${selectedConversation.favorite ? 'fill-current' : ''}`} />
                <span>{selectedConversation.favorite ? 'Favorited' : 'Add to Favorites'}</span>
              </button>
              
              <button
                onClick={() => handleExportConversation(selectedConversation)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
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
              <MessageSquare className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                AI Chat History
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
        
        {/* Filters */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Models</option>
              <option value="claude">Claude</option>
              <option value="gpt">GPT</option>
              <option value="gemini">Gemini</option>
            </select>
            
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            
            <button
              onClick={() => setFavoriteOnly(!favoriteOnly)}
              className={`px-3 py-2 rounded-md flex items-center space-x-2 ${
                favoriteOnly
                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <Star className={`w-4 h-4 ${favoriteOnly ? 'fill-current' : ''}`} />
              <span>Favorites</span>
            </button>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>{filteredConversations.length} conversations</span>
            <div className="flex items-center space-x-4">
              <span>Total: {conversations.length}</span>
              <span>Favorites: {conversations.filter(c => c.favorite).length}</span>
            </div>
          </div>
        </div>
        
        {/* Conversations List */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredConversations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredConversations.map(conversation => (
                <ConversationCard key={conversation.id} conversation={conversation} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Conversations Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery || selectedModel !== 'all' || favoriteOnly || dateRange !== 'all'
                  ? 'Try adjusting your filters.'
                  : 'Start a new conversation with the AI to see it here.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
      
      <ConversationDetails />
    </div>
  );
};

export default AIChatHistory;