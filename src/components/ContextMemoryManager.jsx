import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  DocumentTextIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon,
  ClockIcon,
  TagIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const ContextMemoryManager = ({ projectId, className = '' }) => {
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [newMemory, setNewMemory] = useState('')
  const [selectedTags, setSelectedTags] = useState([])

  const availableTags = [
    'important', 'bug', 'feature', 'idea', 'todo', 
    'architecture', 'performance', 'security', 'ui-ux'
  ]

  useEffect(() => {
    loadContextMemories()
  }, [projectId])

  const loadContextMemories = async () => {
    setLoading(true)
    
    try {
      // Simulate loading from localStorage or API
      const savedMemories = localStorage.getItem(`context_memories_${projectId}`)
      if (savedMemories) {
        setMemories(JSON.parse(savedMemories))
      } else {
        // Create some demo memories
        const demoMemories = [
          {
            id: 'mem_1',
            content: 'User wants authentication with social login support (Google, GitHub)',
            tags: ['important', 'feature', 'todo'],
            created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            priority: 'high',
            status: 'active'
          },
          {
            id: 'mem_2', 
            content: 'Database schema needs optimization for user queries - consider indexing',
            tags: ['performance', 'architecture'],
            created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            priority: 'medium',
            status: 'active'
          },
          {
            id: 'mem_3',
            content: 'UI needs dark mode toggle and better mobile responsiveness',
            tags: ['ui-ux', 'feature'],
            created_at: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
            priority: 'low',
            status: 'active'
          }
        ]
        setMemories(demoMemories)
        localStorage.setItem(`context_memories_${projectId}`, JSON.stringify(demoMemories))
      }
    } catch (error) {
      console.error('Failed to load context memories:', error)
    } finally {
      setLoading(false)
    }
  }

  const addMemory = async () => {
    if (!newMemory.trim()) return

    const memory = {
      id: `mem_${Date.now()}`,
      content: newMemory,
      tags: selectedTags,
      created_at: new Date().toISOString(),
      priority: 'medium',
      status: 'active'
    }

    const updatedMemories = [memory, ...memories]
    setMemories(updatedMemories)
    localStorage.setItem(`context_memories_${projectId}`, JSON.stringify(updatedMemories))
    
    setNewMemory('')
    setSelectedTags([])
    toast.success('Context memory added')
  }

  const deleteMemory = async (memoryId) => {
    const updatedMemories = memories.filter(m => m.id !== memoryId)
    setMemories(updatedMemories)
    localStorage.setItem(`context_memories_${projectId}`, JSON.stringify(updatedMemories))
    toast.success('Memory deleted')
  }

  const toggleMemoryStatus = async (memoryId) => {
    const updatedMemories = memories.map(m => 
      m.id === memoryId 
        ? { ...m, status: m.status === 'active' ? 'archived' : 'active' }
        : m
    )
    setMemories(updatedMemories)
    localStorage.setItem(`context_memories_${projectId}`, JSON.stringify(updatedMemories))
  }

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50 dark:bg-red-900/20'
      case 'medium': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
      case 'low': return 'border-green-500 bg-green-50 dark:bg-green-900/20'
      default: return 'border-gray-500 bg-gray-50 dark:bg-gray-800'
    }
  }

  const getTagColor = (tag) => {
    const colors = {
      important: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      bug: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      feature: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      idea: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      todo: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      architecture: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      performance: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      security: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      'ui-ux': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300'
    }
    return colors[tag] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }

  const visibleMemories = showAll ? memories : memories.slice(0, 3)
  const activeMemories = visibleMemories.filter(m => m.status === 'active')

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <DocumentTextIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Context Memory
          </h3>
        </div>
        <button
          onClick={() => setShowAll(!showAll)}
          className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          {showAll ? <EyeSlashIcon className="w-3 h-3" /> : <EyeIcon className="w-3 h-3" />}
          <span>{showAll ? 'Show Less' : 'Show All'}</span>
        </button>
      </div>

      {/* Add Memory Form */}
      <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <textarea
          value={newMemory}
          onChange={(e) => setNewMemory(e.target.value)}
          placeholder="Add important context or notes..."
          rows={2}
          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        
        <button
          onClick={addMemory}
          disabled={!newMemory.trim()}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm rounded-lg transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Add to Memory</span>
        </button>
      </div>

      {/* Memory List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-16 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {activeMemories.map((memory, index) => (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
                className={`p-3 rounded-lg border-l-4 ${getPriorityColor(memory.priority)} group`}
              >
                <div className="flex items-start justify-between space-x-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {memory.content}
                    </p>
                    
                    {/* Tags */}
                    {memory.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {memory.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`px-2 py-0.5 text-xs rounded-full ${getTagColor(tag)}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Timestamp */}
                    <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <ClockIcon className="w-3 h-3" />
                      <span>{format(new Date(memory.created_at), 'MMM d, HH:mm')}</span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleMemoryStatus(memory.id)}
                      className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors"
                      title={memory.status === 'active' ? 'Archive' : 'Activate'}
                    >
                      {memory.status === 'active' ? (
                        <EyeSlashIcon className="w-4 h-4" />
                      ) : (
                        <EyeIcon className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteMemory(memory.id)}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Summary */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        {memories.length === 0 ? (
          'No context memories yet'
        ) : (
          `${activeMemories.length} active memories • ${memories.filter(m => m.status === 'archived').length} archived`
        )}
      </div>
    </div>
  )
}

export default ContextMemoryManager