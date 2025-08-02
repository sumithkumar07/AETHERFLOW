import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  DocumentTextIcon,
  ClockIcon,
  TrashIcon,
  StarIcon,
  TagIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

const ContextMemoryManager = ({ projectId }) => {
  const [memories, setMemories] = useState([
    {
      id: 1,
      type: 'code_discussion',
      content: 'Discussed implementing user authentication with JWT tokens',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      importance: 'high',
      tags: ['authentication', 'security'],
      pinned: true,
      relatedFiles: ['auth.js', 'login.jsx']
    },
    {
      id: 2,
      type: 'bug_resolution',
      content: 'Fixed infinite re-render issue in useEffect hook',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      importance: 'medium',
      tags: ['react', 'hooks', 'bug'],
      pinned: false,
      relatedFiles: ['UserProfile.jsx']
    },
    {
      id: 3,
      type: 'feature_planning',
      content: 'Planning to add real-time notifications using WebSockets',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      importance: 'high',
      tags: ['websockets', 'notifications'],
      pinned: false,
      relatedFiles: []
    },
    {
      id: 4,
      type: 'api_design',
      content: 'Discussed REST API endpoints for project management',
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      importance: 'medium',
      tags: ['api', 'rest', 'projects'],
      pinned: false,
      relatedFiles: ['projects.py', 'routes.py']
    }
  ])

  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const getImportanceColor = (importance) => {
    switch (importance) {
      case 'high': return 'text-red-600 dark:text-red-400'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400'
      case 'low': return 'text-green-600 dark:text-green-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'code_discussion': return '💻'
      case 'bug_resolution': return '🐛'
      case 'feature_planning': return '🎯'
      case 'api_design': return '🔗'
      default: return '📝'
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'code_discussion': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'bug_resolution': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'feature_planning': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
      case 'api_design': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now - time
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return time.toLocaleDateString()
  }

  const togglePin = (memoryId) => {
    setMemories(prev => prev.map(memory => 
      memory.id === memoryId 
        ? { ...memory, pinned: !memory.pinned }
        : memory
    ))
  }

  const deleteMemory = (memoryId) => {
    setMemories(prev => prev.filter(memory => memory.id !== memoryId))
  }

  const filteredMemories = memories
    .filter(memory => {
      if (filter === 'pinned') return memory.pinned
      if (filter === 'high') return memory.importance === 'high'
      return true
    })
    .filter(memory => 
      memory.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      memory.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      // Pinned items first, then by timestamp
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return new Date(b.timestamp) - new Date(a.timestamp)
    })

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <DocumentTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="font-medium text-gray-900 dark:text-white">Context Memory</h3>
      </div>

      {/* Search and Filter */}
      <div className="space-y-3">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search memories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex space-x-2">
          {[
            { id: 'all', label: 'All', count: memories.length },
            { id: 'pinned', label: 'Pinned', count: memories.filter(m => m.pinned).length },
            { id: 'high', label: 'High Priority', count: memories.filter(m => m.importance === 'high').length }
          ].map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                filter === filterOption.id
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
              }`}
            >
              {filterOption.label} ({filterOption.count})
            </button>
          ))}
        </div>
      </div>

      {/* Memory List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredMemories.map((memory) => (
          <motion.div
            key={memory.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3 rounded-lg border transition-all hover:shadow-sm ${
              memory.pinned 
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getTypeIcon(memory.type)}</span>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getTypeColor(memory.type)}`}>
                  {memory.type.replace('_', ' ')}
                </span>
                <span className={`text-xs font-medium ${getImportanceColor(memory.importance)}`}>
                  {memory.importance}
                </span>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => togglePin(memory.id)}
                  className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                  title={memory.pinned ? 'Unpin' : 'Pin'}
                >
                  {memory.pinned ? (
                    <StarIconSolid className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <StarIcon className="w-4 h-4" />
                  )}
                </button>
                
                <button
                  onClick={() => deleteMemory(memory.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
              {memory.content}
            </p>

            {/* Tags */}
            {memory.tags.length > 0 && (
              <div className="flex items-center space-x-2 mb-2">
                <TagIcon className="w-3 h-3 text-gray-400" />
                <div className="flex flex-wrap gap-1">
                  {memory.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Related Files */}
            {memory.relatedFiles.length > 0 && (
              <div className="mb-2">
                <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">Related files:</div>
                <div className="flex flex-wrap gap-1">
                  {memory.relatedFiles.map((file, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 text-xs font-mono bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded"
                    >
                      {file}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
              <div className="flex items-center space-x-1">
                <ClockIcon className="w-3 h-3" />
                <span>{formatTimeAgo(memory.timestamp)}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredMemories.length === 0 && (
        <div className="text-center py-8">
          <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'No memories found matching your search' : 'No memories stored yet'}
          </p>
        </div>
      )}

      {/* Memory Stats */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">Total Memories</span>
          <span className="font-semibold text-gray-900 dark:text-white">{memories.length}</span>
        </div>
        <div className="flex justify-between items-center text-sm mt-1">
          <span className="text-gray-600 dark:text-gray-400">High Priority</span>
          <span className="font-semibold text-red-600 dark:text-red-400">
            {memories.filter(m => m.importance === 'high').length}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm mt-1">
          <span className="text-gray-600 dark:text-gray-400">Pinned</span>
          <span className="font-semibold text-yellow-600 dark:text-yellow-400">
            {memories.filter(m => m.pinned).length}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ContextMemoryManager