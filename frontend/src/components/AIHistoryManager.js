import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  MessageSquare, Search, Filter, Calendar, Star, Trash2, 
  Download, Upload, Settings, Bot, User, Clock, 
  ChevronRight, ChevronDown, Copy, ExternalLink,
  Archive, BookOpen, Tag, Hash
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { useNotifications } from './NotificationSystem';

const AIHistoryManager = ({ isVisible, onClose, currentSession }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [loading, setLoading] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [showSettings, setShowSettings] = useState(false);
  const [expandedConversations, setExpandedConversations] = useState(new Set());
  
  const notifications = useNotifications();

  const filterOptions = [
    { value: 'all', label: 'All Conversations' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'starred', label: 'Starred' },
    { value: 'archived', label: 'Archived' },
    { value: 'coding', label: 'Coding Help' },
    { value: 'debugging', label: 'Debugging' },
    { value: 'explanation', label: 'Explanations' }
  ];

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'alphabetical', label: 'Alphabetical' },
    { value: 'longest', label: 'Longest Conversations' },
    { value: 'starred', label: 'Starred First' }
  ];

  // Mock conversation data
  const mockConversations = useMemo(() => [
    {
      id: 'conv_1',
      title: 'React Hook Optimization',
      summary: 'Discussion about optimizing React hooks and preventing unnecessary re-renders',
      createdAt: new Date(2024, 0, 20, 14, 30),
      updatedAt: new Date(2024, 0, 20, 15, 45),
      messageCount: 12,
      category: 'coding',
      tags: ['react', 'hooks', 'optimization', 'performance'],
      starred: true,
      archived: false,
      model: 'GPT-4o',
      language: 'JavaScript',
      messages: [
        {
          id: 'msg_1',
          role: 'user',
          content: 'How can I optimize my React hooks to prevent unnecessary re-renders?',
          timestamp: new Date(2024, 0, 20, 14, 30),
          codeBlocks: []
        },
        {
          id: 'msg_2',
          role: 'assistant',
          content: 'Here are several strategies to optimize React hooks and prevent unnecessary re-renders:\n\n1. **Use useCallback for functions**\n2. **Use useMemo for expensive calculations**\n3. **Split state appropriately**',
          timestamp: new Date(2024, 0, 20, 14, 32),
          codeBlocks: [
            {
              language: 'javascript',
              code: 'const optimizedCallback = useCallback(() => {\n  // your logic here\n}, [dependency]);'
            }
          ]
        }
      ]
    },
    {
      id: 'conv_2',
      title: 'Python Async/Await Patterns',
      summary: 'Learning about asynchronous programming patterns in Python',
      createdAt: new Date(2024, 0, 19, 10, 15),
      updatedAt: new Date(2024, 0, 19, 11, 30),
      messageCount: 8,
      category: 'explanation',
      tags: ['python', 'async', 'concurrency'],
      starred: false,
      archived: false,
      model: 'Claude-3.5-Sonnet',
      language: 'Python',
      messages: []
    },
    {
      id: 'conv_3',
      title: 'Database Query Debugging',
      summary: 'Troubleshooting slow SQL queries and optimization techniques',
      createdAt: new Date(2024, 0, 18, 16, 45),
      updatedAt: new Date(2024, 0, 18, 17, 20),
      messageCount: 15,
      category: 'debugging',
      tags: ['sql', 'database', 'performance', 'optimization'],
      starred: true,
      archived: false,
      model: 'GPT-4o',
      language: 'SQL',
      messages: []
    }
  ], []);

  useEffect(() => {
    if (isVisible) {
      loadConversations();
    }
  }, [isVisible]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setConversations(mockConversations);
    } catch (error) {
      notifications.error('Failed to load conversation history');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedConversations = useMemo(() => {
    let filtered = conversations;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(conv => 
        conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (filterBy !== 'all') {
      const now = new Date();
      filtered = filtered.filter(conv => {
        switch (filterBy) {
          case 'today':
            return conv.updatedAt.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return conv.updatedAt >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return conv.updatedAt >= monthAgo;
          case 'starred':
            return conv.starred;
          case 'archived':
            return conv.archived;
          default:
            return conv.category === filterBy;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return b.updatedAt - a.updatedAt;
        case 'oldest':
          return a.createdAt - b.createdAt;
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'longest':
          return b.messageCount - a.messageCount;
        case 'starred':
          if (a.starred && !b.starred) return -1;
          if (!a.starred && b.starred) return 1;
          return b.updatedAt - a.updatedAt;
        default:
          return 0;
      }
    });

    return filtered;
  }, [conversations, searchQuery, filterBy, sortBy]);

  const toggleStar = useCallback((conversationId) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, starred: !conv.starred } : conv
    ));
  }, []);

  const toggleArchive = useCallback((conversationId) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, archived: !conv.archived } : conv
    ));
  }, []);

  const deleteConversation = useCallback((conversationId) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
      }
      notifications.success('Conversation deleted');
    }
  }, [selectedConversation, notifications]);

  const exportConversation = useCallback((conversation) => {
    const content = JSON.stringify(conversation, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${conversation.title.replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notifications.success('Conversation exported');
  }, [notifications]);

  const copyMessageContent = useCallback((message) => {
    navigator.clipboard.writeText(message.content);
    notifications.success('Message copied to clipboard');
  }, [notifications]);

  const formatRelativeTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const toggleConversationExpansion = (conversationId) => {
    setExpandedConversations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(conversationId)) {
        newSet.delete(conversationId);
      } else {
        newSet.add(conversationId);
      }
      return newSet;
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 w-[95vw] h-[90vh] max-w-7xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-4">
            <MessageSquare className="text-blue-400" size={24} />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI Conversation History
            </h2>
            <span className="text-sm text-gray-400">
              {filteredAndSortedConversations.length} conversations
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="btn btn-ghost btn-sm"
              title="Settings"
            >
              <Settings size={16} />
            </button>
            
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex h-full">
          {/* Sidebar - Conversations List */}
          <div className="w-96 border-r border-slate-700/50 p-4 flex flex-col">
            {/* Search and Filters */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div className="flex space-x-2">
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="flex-1 bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  {filterOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <LoadingSpinner />
                </div>
              ) : (
                filteredAndSortedConversations.map(conversation => (
                  <div
                    key={conversation.id}
                    className={`glass-surface p-4 rounded-xl cursor-pointer transition-all ${
                      selectedConversation?.id === conversation.id 
                        ? 'ring-2 ring-blue-500/50 bg-blue-500/10' 
                        : 'hover:border-blue-500/30'
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-white truncate flex-1">
                        {conversation.title}
                      </h3>
                      
                      <div className="flex items-center space-x-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(conversation.id);
                          }}
                          className={`p-1 rounded ${conversation.starred ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
                        >
                          <Star size={12} fill={conversation.starred ? 'currentColor' : 'none'} />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleConversationExpansion(conversation.id);
                          }}
                          className="p-1 rounded text-gray-400 hover:text-white"
                        >
                          {expandedConversations.has(conversation.id) ? 
                            <ChevronDown size={12} /> : <ChevronRight size={12} />
                          }
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                      {conversation.summary}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-2">
                        <span>{conversation.messageCount} messages</span>
                        <span>•</span>
                        <span>{conversation.model}</span>
                      </div>
                      <span>{formatRelativeTime(conversation.updatedAt)}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {conversation.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-slate-700/50 rounded text-xs text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                      {conversation.tags.length > 3 && (
                        <span className="px-2 py-1 bg-slate-700/50 rounded text-xs text-gray-400">
                          +{conversation.tags.length - 3}
                        </span>
                      )}
                    </div>

                    {expandedConversations.has(conversation.id) && conversation.messages.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-700/30 space-y-2">
                        {conversation.messages.slice(0, 3).map(message => (
                          <div key={message.id} className="text-xs">
                            <div className="flex items-center space-x-2 mb-1">
                              {message.role === 'user' ? (
                                <User size={10} className="text-blue-400" />
                              ) : (
                                <Bot size={10} className="text-green-400" />
                              )}
                              <span className="text-gray-400">
                                {message.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-gray-300 line-clamp-2 pl-4">
                              {message.content.slice(0, 100)}...
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Main Content - Selected Conversation */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Conversation Header */}
                <div className="p-6 border-b border-slate-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">
                      {selectedConversation.title}
                    </h3>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyMessageContent({ content: selectedConversation.messages.map(m => m.content).join('\n\n') })}
                        className="btn btn-ghost btn-sm"
                        title="Copy entire conversation"
                      >
                        <Copy size={16} />
                      </button>
                      
                      <button
                        onClick={() => exportConversation(selectedConversation)}
                        className="btn btn-ghost btn-sm"
                        title="Export conversation"
                      >
                        <Download size={16} />
                      </button>
                      
                      <button
                        onClick={() => toggleArchive(selectedConversation.id)}
                        className="btn btn-ghost btn-sm"
                        title={selectedConversation.archived ? "Unarchive" : "Archive"}
                      >
                        <Archive size={16} />
                      </button>
                      
                      <button
                        onClick={() => deleteConversation(selectedConversation.id)}
                        className="btn btn-ghost btn-sm text-red-400 hover:text-red-300"
                        title="Delete conversation"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>{selectedConversation.messageCount} messages</span>
                    <span>•</span>
                    <span>{selectedConversation.model}</span>
                    <span>•</span>
                    <span>{formatRelativeTime(selectedConversation.updatedAt)}</span>
                    <span>•</span>
                    <span className="capitalize">{selectedConversation.category}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedConversation.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-slate-700/50 rounded-full text-xs text-gray-300"
                      >
                        <Tag size={10} className="inline mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-6">
                    {selectedConversation.messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] ${
                          message.role === 'user' 
                            ? 'bg-blue-600/20 border-blue-500/30' 
                            : 'bg-slate-800/50 border-slate-600/30'
                        } border rounded-xl p-4`}>
                          <div className="flex items-center space-x-2 mb-2">
                            {message.role === 'user' ? (
                              <User size={14} className="text-blue-400" />
                            ) : (
                              <Bot size={14} className="text-green-400" />
                            )}
                            <span className="text-sm font-medium text-gray-300">
                              {message.role === 'user' ? 'You' : selectedConversation.model}
                            </span>
                            <span className="text-xs text-gray-500">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                            
                            <button
                              onClick={() => copyMessageContent(message)}
                              className="ml-auto p-1 text-gray-400 hover:text-white rounded"
                              title="Copy message"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                          
                          <div className="text-gray-200 whitespace-pre-wrap">
                            {message.content}
                          </div>
                          
                          {message.codeBlocks?.map((block, index) => (
                            <div key={index} className="mt-3 bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-400">{block.language}</span>
                                <button
                                  onClick={() => navigator.clipboard.writeText(block.code)}
                                  className="text-xs text-gray-400 hover:text-white"
                                >
                                  Copy
                                </button>
                              </div>
                              <pre className="text-sm text-gray-200 overflow-x-auto">
                                <code>{block.code}</code>
                              </pre>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Select a Conversation</h3>
                  <p>Choose a conversation from the sidebar to view its history</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIHistoryManager;