import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  UsersIcon, 
  DocumentTextIcon,
  ClockIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  PhotoIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { useCollaborationStore } from '../../store/collaborationStore'
import toast from 'react-hot-toast'

/**
 * Collaboration Center - Real-time collaboration hub
 * Connects to /api/collaboration/* endpoints and WebSocket
 */
const CollaborationCenter = () => {
  const {
    activeDocuments,
    collaborators,
    presence,
    recentActivity,
    onlineUsers,
    connections,
    connectionStatus,
    loading,
    error,
    initialize,
    fetchActiveSessions,
    fetchCollaborationHistory,
    connectToDocument,
    disconnectFromDocument,
    updateUserPresence,
    createSnapshot,
    getDocumentCollaborators,
    clearError
  } = useCollaborationStore()

  const [selectedDocument, setSelectedDocument] = useState('')
  const [presenceData, setPresenceData] = useState({
    cursor_position: 0,
    current_selection: '',
    current_file: ''
  })

  useEffect(() => {
    initialize()
  }, [initialize])

  const handleConnectToDocument = async (documentId) => {
    const result = connectToDocument(documentId)
    
    if (result.success) {
      setSelectedDocument(documentId)
      toast.success(`Connected to document: ${documentId}`)
      
      // Fetch collaborators for this document
      await getDocumentCollaborators(documentId)
    } else {
      toast.error('Failed to connect to document')
    }
  }

  const handleDisconnectFromDocument = (documentId) => {
    const result = disconnectFromDocument(documentId)
    
    if (result.success) {
      if (selectedDocument === documentId) {
        setSelectedDocument('')
      }
      toast.success('Disconnected from document')
    }
  }

  const handleUpdatePresence = async (documentId) => {
    if (!documentId) return
    
    const result = await updateUserPresence(documentId, presenceData)
    
    if (result.success) {
      toast.success('Presence updated')
    }
  }

  const handleCreateSnapshot = async (documentId) => {
    const description = prompt('Enter snapshot description:')
    if (!description) return
    
    const result = await createSnapshot(documentId, description)
    
    if (result.success) {
      toast.success('Snapshot created successfully!')
    }
  }

  const getConnectionStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200'
      case 'connecting': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200'
      case 'disconnected': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const getUserStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-400'
      case 'editing': return 'bg-blue-400'
      case 'viewing': return 'bg-gray-400'
      default: return 'bg-gray-300'
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Collaboration Center
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Real-time collaborative workspace
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-400' : 
                connectionStatus === 'connecting' ? 'bg-yellow-400' : 'bg-red-400'
              }`} />
              <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                {connectionStatus}
              </span>
            </div>
            <button
              onClick={() => initialize()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowPathIcon className="h-4 w-4 inline mr-1" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex justify-between">
            <div className="text-red-800 dark:text-red-200">{error}</div>
            <button onClick={clearError} className="text-red-600 hover:text-red-800">
              ×
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Sessions */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Active Collaboration Sessions
            </h2>

            {/* Document Connection */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                Connect to Document
              </h3>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter document ID..."
                  value={selectedDocument}
                  onChange={(e) => setSelectedDocument(e.target.value)}
                  className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <button
                  onClick={() => handleConnectToDocument(selectedDocument)}
                  disabled={!selectedDocument || loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  Connect
                </button>
              </div>
            </div>

            {/* Connected Documents */}
            <div className="space-y-4">
              {Object.keys(connections).length === 0 ? (
                <div className="text-center py-8">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No active sessions
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Connect to a document to start collaborating
                  </p>
                </div>
              ) : (
                Object.keys(connections).map((documentId) => (
                  <motion.div
                    key={documentId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Document: {documentId}
                        </h3>
                        <div className="mt-2 flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <UsersIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {collaborators[documentId]?.length || 0} collaborators
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <EyeIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {presence[documentId]?.active_count || 0} viewing
                            </span>
                          </div>
                        </div>
                        
                        {/* Collaborators List */}
                        {collaborators[documentId] && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {collaborators[documentId].map((collaborator) => (
                              <div
                                key={collaborator.user_id}
                                className="flex items-center space-x-2 px-2 py-1 bg-white dark:bg-gray-600 rounded-full text-xs"
                              >
                                <div className={`w-2 h-2 rounded-full ${getUserStatusColor(collaborator.status)}`} />
                                <span className="text-gray-700 dark:text-gray-300">
                                  {collaborator.user_name}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleCreateSnapshot(documentId)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          <PhotoIcon className="h-4 w-4 inline mr-1" />
                          Snapshot
                        </button>
                        <button
                          onClick={() => handleDisconnectFromDocument(documentId)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Presence Update */}
            {selectedDocument && connections[selectedDocument] && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                  Update Your Presence
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cursor Position
                    </label>
                    <input
                      type="number"
                      value={presenceData.cursor_position}
                      onChange={(e) => setPresenceData(prev => ({
                        ...prev,
                        cursor_position: parseInt(e.target.value) || 0
                      }))}
                      className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Current Selection
                    </label>
                    <input
                      type="text"
                      value={presenceData.current_selection}
                      onChange={(e) => setPresenceData(prev => ({
                        ...prev,
                        current_selection: e.target.value
                      }))}
                      placeholder="Selected text..."
                      className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => handleUpdatePresence(selectedDocument)}
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Update Presence
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Recent Activity */}
        <div className="space-y-6">
          {/* Connection Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Connection Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Status</span>
                <span className={`px-2 py-1 text-xs rounded-full capitalize ${getConnectionStatusColor(connectionStatus)}`}>
                  {connectionStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Active Connections</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {Object.keys(connections).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Total Collaborators</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {Object.values(collaborators).flat().length}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            
            {recentActivity.length === 0 ? (
              <div className="text-center py-4">
                <ClockIcon className="h-8 w-8 text-gray-400 mx-auto" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  No recent activity
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {activity.type === 'active_session' ? (
                        <UsersIcon className="h-5 w-5 text-green-600" />
                      ) : (
                        <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {activity.document_name || activity.action}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.recent_activity || activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={fetchActiveSessions}
                className="w-full text-left px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors"
              >
                Refresh Active Sessions
              </button>
              <button
                onClick={fetchCollaborationHistory}
                className="w-full text-left px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors"
              >
                Load History
              </button>
              <button
                onClick={() => setSelectedDocument('demo-doc-' + Date.now())}
                className="w-full text-left px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors"
              >
                Create Test Document
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CollaborationCenter