import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CircleStackIcon,
  TableCellsIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  FunnelIcon,
  DocumentTextIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const DatabaseManager = ({ isVisible, onClose, projectId }) => {
  const [databases, setDatabases] = useState([])
  const [selectedDb, setSelectedDb] = useState(null)
  const [tables, setTables] = useState([])
  const [selectedTable, setSelectedTable] = useState(null)
  const [tableData, setTableData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showQueryBuilder, setShowQueryBuilder] = useState(false)
  const [activeTab, setActiveTab] = useState('browse')

  // Mock data - replace with real API calls
  useEffect(() => {
    if (isVisible) {
      setDatabases([
        { id: '1', name: 'main_db', type: 'MongoDB', status: 'connected', collections: 8 },
        { id: '2', name: 'users_db', type: 'PostgreSQL', status: 'connected', tables: 5 },
        { id: '3', name: 'cache_db', type: 'Redis', status: 'connected', keys: 1247 }
      ])
    }
  }, [isVisible])

  const handleDbSelect = async (db) => {
    setSelectedDb(db)
    setIsLoading(true)
    try {
      // Mock API call
      const mockTables = [
        { name: 'users', type: 'collection', records: 1247, size: '2.3MB' },
        { name: 'projects', type: 'collection', records: 89, size: '456KB' },
        { name: 'messages', type: 'collection', records: 5632, size: '12.1MB' },
        { name: 'integrations', type: 'collection', records: 23, size: '78KB' }
      ]
      setTables(mockTables)
    } catch (error) {
      toast.error('Failed to load database tables')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTableSelect = async (table) => {
    setSelectedTable(table)
    setIsLoading(true)
    try {
      // Mock table data
      const mockData = [
        { _id: '1', name: 'John Doe', email: 'john@example.com', createdAt: '2025-01-15' },
        { _id: '2', name: 'Jane Smith', email: 'jane@example.com', createdAt: '2025-01-16' },
        { _id: '3', name: 'Bob Johnson', email: 'bob@example.com', createdAt: '2025-01-17' }
      ]
      setTableData(mockData)
    } catch (error) {
      toast.error('Failed to load table data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = () => {
    toast.success('Data export started')
  }

  const handleImportData = () => {
    toast.success('Data import started')
  }

  const filteredData = tableData.filter(row => 
    Object.values(row).some(value => 
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  if (!isVisible) return null

  return (
    <motion.div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-7xl h-[80vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <CircleStackIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Database Manager
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage your project databases
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="flex h-full">
          {/* Left Sidebar - Databases */}
          <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900 dark:text-white">Databases</h3>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {databases.map((db) => (
                <motion.div
                  key={db.id}
                  onClick={() => handleDbSelect(db)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedDb?.id === db.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{db.name}</h4>
                    <div className={`w-3 h-3 rounded-full ${
                      db.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Type: {db.type}</span>
                      <span>{db.collections || db.tables || db.keys} items</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Middle Panel - Tables/Collections */}
          <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {selectedDb ? `${selectedDb.name} Tables` : 'Select Database'}
              </h3>
            </div>

            {selectedDb && (
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
                  </div>
                ) : (
                  tables.map((table) => (
                    <motion.div
                      key={table.name}
                      onClick={() => handleTableSelect(table)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedTable?.name === table.name
                          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      whileHover={{ x: 2 }}
                    >
                      <div className="flex items-center space-x-3">
                        <TableCellsIcon className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">{table.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {table.records} records • {table.size}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Right Panel - Data View */}
          <div className="flex-1 flex flex-col">
            {selectedTable ? (
              <>
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {selectedTable.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleExportData}
                        className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        <span>Export</span>
                      </button>
                      <button
                        onClick={handleImportData}
                        className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <ArrowUpTrayIcon className="w-4 h-4" />
                        <span>Import</span>
                      </button>
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search records..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <FunnelIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Data Table */}
                <div className="flex-1 overflow-auto p-4">
                  {filteredData.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                          <tr>
                            {Object.keys(filteredData[0]).map((key) => (
                              <th key={key} className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                                {key}
                              </th>
                            ))}
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                              {Object.values(row).map((value, valueIndex) => (
                                <td key={valueIndex} className="px-4 py-3 text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                                  {String(value)}
                                </td>
                              ))}
                              <td className="px-4 py-3 text-right border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-end space-x-2">
                                  <button className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors">
                                    <PencilIcon className="w-4 h-4" />
                                  </button>
                                  <button className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <CircleStackIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Select a table
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Choose a database and table to view and manage data
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default DatabaseManager