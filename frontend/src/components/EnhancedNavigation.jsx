import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, Link } from 'react-router-dom'
import { 
  HomeIcon,
  SparklesIcon,
  FolderIcon,
  CpuChipIcon,
  ChartBarIcon,
  Cog8ToothIcon,
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  CommandLineIcon,
  BookOpenIcon,
  PuzzlePieceIcon,
  RocketLaunchIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useResponsive } from './ResponsiveLayout'

// Enhanced breadcrumb navigation
export const EnhancedBreadcrumbs = ({ items = [], className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex ${className}`}>
      <ol className="flex items-center space-x-2 text-sm">
        {items.map((item, index) => (
          <li key={item.path || index} className="flex items-center">
            {index > 0 && (
              <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-2" />
            )}
            
            {item.href ? (
              <Link
                to={item.href}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors font-medium"
              >
                {item.label}
              </Link>
            ) : (
              <span 
                className={`${
                  index === items.length - 1 
                    ? 'text-gray-900 dark:text-white font-semibold' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
                aria-current={index === items.length - 1 ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

// Smart command palette with search
export const CommandPalette = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    } else {
      setQuery('')
    }
  }, [isOpen])

  // Navigation items with search metadata
  const navigationItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      href: '/dashboard',
      icon: HomeIcon,
      keywords: ['home', 'overview', 'main', 'stats'],
      category: 'Navigation'
    },
    { 
      id: 'ai-chat', 
      label: 'AI Chat', 
      href: '/ai-chat',
      icon: SparklesIcon,
      keywords: ['chat', 'ai', 'assistant', 'conversation', 'groq'],
      category: 'AI Tools'
    },
    { 
      id: 'projects', 
      label: 'Projects', 
      href: '/projects',
      icon: FolderIcon,
      keywords: ['projects', 'work', 'files', 'code'],
      category: 'Development'
    },
    { 
      id: 'templates', 
      label: 'Templates', 
      href: '/templates',
      icon: PuzzlePieceIcon,
      keywords: ['templates', 'starter', 'boilerplate', 'examples'],
      category: 'Development'
    },
    { 
      id: 'integrations', 
      label: 'Integrations', 
      href: '/integrations',
      icon: CpuChipIcon,
      keywords: ['integrations', 'apis', 'services', 'connections'],
      category: 'Tools'
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      href: '/analytics',
      icon: ChartBarIcon,
      keywords: ['analytics', 'metrics', 'stats', 'reports', 'data'],
      category: 'Insights'
    },
    { 
      id: 'documentation', 
      label: 'Documentation', 
      href: '/docs',
      icon: BookOpenIcon,
      keywords: ['docs', 'help', 'guide', 'manual', 'reference'],
      category: 'Help'
    },
    { 
      id: 'deploy', 
      label: 'Deploy', 
      href: '/deploy',
      icon: RocketLaunchIcon,
      keywords: ['deploy', 'launch', 'publish', 'production', 'live'],
      category: 'Development'
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      href: '/settings',
      icon: Cog8ToothIcon,
      keywords: ['settings', 'config', 'preferences', 'account'],
      category: 'Account'
    }
  ]

  // Filter items based on search query
  const filteredItems = query === ''
    ? navigationItems
    : navigationItems.filter(item => 
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.keywords.some(keyword => 
          keyword.toLowerCase().includes(query.toLowerCase())
        ) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      )

  // Group items by category
  const groupedItems = filteredItems.reduce((groups, item) => {
    const category = item.category
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(item)
    return groups
  }, {})

  const handleItemSelect = (item) => {
    onNavigate?.(item.href)
    onClose?.()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          >
            {/* Search Input */}
            <div className="flex items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search or jump to..."
                className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none text-lg"
              />
              <kbd className="hidden sm:inline-flex h-6 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto p-2">
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category} className="mb-4 last:mb-0">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {category}
                  </div>
                  <div className="space-y-1">
                    {items.map((item) => {
                      const Icon = item.icon
                      return (
                        <motion.button
                          key={item.id}
                          whileHover={{ backgroundColor: 'rgb(243 244 246)' }}
                          onClick={() => handleItemSelect(item)}
                          className="w-full flex items-center px-4 py-3 text-left rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 group"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {item.label}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {item.href}
                            </div>
                          </div>
                          <div className="text-xs text-gray-400">
                            <ChevronRightIcon className="w-4 h-4" />
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              ))}

              {filteredItems.length === 0 && (
                <div className="text-center py-8">
                  <CommandLineIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No results found for "{query}"
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Context-aware navigation sidebar
export const ContextualSidebar = ({ 
  isOpen, 
  onClose, 
  currentPath = '/',
  className = '' 
}) => {
  const [expandedGroups, setExpandedGroups] = useState(new Set(['main']))
  const { isMobile } = useResponsive()

  const navigationGroups = [
    {
      id: 'main',
      label: 'Main',
      items: [
        { 
          id: 'dashboard', 
          label: 'Dashboard', 
          href: '/dashboard',
          icon: HomeIcon,
          description: 'Overview and quick actions'
        },
        { 
          id: 'ai-chat', 
          label: 'AI Chat', 
          href: '/ai-chat',
          icon: SparklesIcon,
          description: 'Chat with AI agents',
          badge: 'NEW'
        }
      ]
    },
    {
      id: 'development',
      label: 'Development',
      items: [
        { 
          id: 'projects', 
          label: 'Projects', 
          href: '/projects',
          icon: FolderIcon,
          description: 'Manage your projects'
        },
        { 
          id: 'templates', 
          label: 'Templates', 
          href: '/templates',
          icon: PuzzlePieceIcon,
          description: 'Ready-to-use templates'
        },
        { 
          id: 'integrations', 
          label: 'Integrations', 
          href: '/integrations',
          icon: CpuChipIcon,
          description: 'Connect external services'
        }
      ]
    },
    {
      id: 'insights',
      label: 'Insights',
      items: [
        { 
          id: 'analytics', 
          label: 'Analytics', 
          href: '/analytics',
          icon: ChartBarIcon,
          description: 'Track your progress'
        }
      ]
    },
    {
      id: 'help',
      label: 'Help & Support',
      items: [
        { 
          id: 'documentation', 
          label: 'Documentation', 
          href: '/docs',
          icon: BookOpenIcon,
          description: 'Guides and references'
        }
      ]
    }
  ]

  const toggleGroup = (groupId) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId)
    } else {
      newExpanded.add(groupId)
    }
    setExpandedGroups(newExpanded)
  }

  const isActive = (href) => currentPath === href || currentPath.startsWith(href + '/')

  return (
    <AnimatePresence>
      {(isOpen || !isMobile) && (
        <>
          {/* Mobile overlay */}
          {isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
          )}

          {/* Sidebar */}
          <motion.aside
            initial={isMobile ? { x: '-100%', opacity: 0 } : { opacity: 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={isMobile ? { x: '-100%', opacity: 0 } : { opacity: 1 }}
            className={`
              fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-900 
              border-r border-gray-200 dark:border-gray-800 z-50 
              overflow-y-auto ${className}
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Aether AI
                </h1>
              </div>
              
              {isMobile && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Close navigation"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Navigation Groups */}
            <nav className="p-4 space-y-6">
              {navigationGroups.map((group) => (
                <div key={group.id} className="space-y-2">
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="w-full flex items-center justify-between text-left px-2 py-1 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <span>{group.label}</span>
                    <ChevronDownIcon 
                      className={`w-4 h-4 transition-transform ${
                        expandedGroups.has(group.id) ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {expandedGroups.has(group.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-1 overflow-hidden"
                      >
                        {group.items.map((item) => {
                          const Icon = item.icon
                          const active = isActive(item.href)

                          return (
                            <Link
                              key={item.id}
                              to={item.href}
                              onClick={() => isMobile && onClose?.()}
                              className={`
                                flex items-center space-x-3 px-3 py-3 rounded-xl 
                                transition-all duration-200 group relative
                                ${active 
                                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                }
                              `}
                            >
                              {/* Active indicator */}
                              {active && (
                                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r" />
                              )}

                              <div className={`
                                w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110
                                ${active 
                                  ? 'bg-blue-200 dark:bg-blue-800' 
                                  : 'bg-gray-200 dark:bg-gray-700'
                                }
                              `}>
                                <Icon className="w-4 h-4" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium truncate">
                                    {item.label}
                                  </span>
                                  {item.badge && (
                                    <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {item.description}
                                </p>
                              </div>
                            </Link>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

// Enhanced top navigation bar
export const EnhancedTopBar = ({ 
  onMenuToggle,
  onCommandPaletteOpen,
  user,
  className = ''
}) => {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const notifications = [
    {
      id: 1,
      title: 'AI Chat Enhanced',
      message: 'New multi-agent collaboration features available',
      time: '2m ago',
      unread: true
    },
    {
      id: 2,
      title: 'Project Deployed',
      message: 'Your app is now live at https://your-app.vercel.app',
      time: '1h ago',
      unread: false
    }
  ]

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <header className={`bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 ${className}`}>
      <div className="px-4 lg:px-6 h-16 flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
            aria-label="Toggle menu"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          <div className="hidden sm:block">
            <button
              onClick={onCommandPaletteOpen}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-600 dark:text-gray-400"
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
              <span className="text-sm">Search or jump to...</span>
              <kbd className="hidden lg:inline-flex h-5 px-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 rounded">
                ⌘K
              </kbd>
            </button>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Notifications"
            >
              <BellIcon className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Notifications
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                          notification.unread ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                              {notification.title}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                              {notification.message}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            {notification.time}
                          </span>
                        </div>
                        {notification.unread && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <UserCircleIcon className="w-5 h-5 text-white" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                {user?.name || 'User'}
              </span>
            </button>

            {/* User dropdown */}
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {user?.name || 'User Name'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                  <div className="p-2">
                    <Link
                      to="/settings"
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Cog8ToothIcon className="w-4 h-4" />
                      <span className="text-sm">Settings</span>
                    </Link>
                    <button
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <span className="text-sm">Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}

export default {
  EnhancedBreadcrumbs,
  CommandPalette,
  ContextualSidebar,
  EnhancedTopBar
}