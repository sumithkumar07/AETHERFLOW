import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  FolderIcon,
  CpuChipIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  MoonIcon,
  SunIcon,
  MagnifyingGlassIcon,
  CommandLineIcon,
  BoltIcon,
  DocumentDuplicateIcon,
  RocketLaunchIcon,
  HomeIcon,
  BeakerIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'

const ModernNavigation = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Streamlined navigation - 4 main sections
  const navigationSections = [
    {
      id: 'workspace',
      title: 'AI Workspace',
      icon: SparklesIcon,
      items: [
        { name: 'AI Chat', href: '/chat', icon: ChatBubbleLeftRightIcon, badge: 'ENHANCED', primary: true },
        { name: 'AI Agents', href: '/agents', icon: CpuChipIcon, badge: 'SMART' },
        { name: 'Projects', href: '/projects', icon: FolderIcon }
      ]
    },
    {
      id: 'tools',
      title: 'Development Tools',
      icon: BoltIcon,
      items: [
        { name: 'Templates', href: '/templates', icon: DocumentDuplicateIcon },
        { name: 'Deploy', href: '/deploy', icon: RocketLaunchIcon, badge: 'FAST' },
        { name: 'Advanced', href: '/advanced', icon: BeakerIcon, badge: 'PRO' }
      ]
    },
    {
      id: 'insights',
      title: 'Analytics & Insights',
      icon: ChartBarIcon,
      items: [
        { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, badge: 'LIVE' },
        { name: 'Performance', href: '/performance', icon: BoltIcon, badge: 'REAL-TIME' },
        { name: 'Workflows', href: '/workflows', icon: SparklesIcon }
      ]
    },
    {
      id: 'account',
      title: 'Account & Settings',
      icon: UserIcon,
      items: [
        { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
        { name: 'Profile', href: '/profile', icon: UserIcon },
        { name: 'Subscription', href: '/subscription', icon: SparklesIcon, badge: 'PREMIUM' }
      ]
    }
  ]

  const quickAccessItems = isAuthenticated ? [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'AI Chat', href: '/chat', icon: ChatBubbleLeftRightIcon, badge: 'AI' },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, badge: 'LIVE' }
  ] : []

  const isCurrentPage = (href) => {
    if (href === '/chat' && location.pathname.startsWith('/chat')) {
      return true
    }
    return location.pathname === href
  }

  // Enhanced search functionality
  const handleSearch = (query) => {
    // In a real app, this would search through features, docs, etc.
    console.log('Searching for:', query)
    setSearchOpen(false)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Global search: Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
      // Close search: Escape
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [searchOpen])

  // Don't show navigation on login/signup pages
  if (['/login', '/signup'].includes(location.pathname)) {
    return null
  }

  const NavItem = ({ item, isMobile = false, isQuickAccess = false }) => {
    const Icon = item.icon
    const isActive = isCurrentPage(item.href)
    
    return (
      <Link
        to={item.href}
        onClick={() => isMobile && setMobileMenuOpen(false)}
        className={`group relative flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
          isActive
            ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 shadow-lg ring-2 ring-blue-200/30 dark:ring-blue-800/30'
            : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
        } ${isQuickAccess ? 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 hover:scale-105' : ''}`}
      >
        {/* Active indicator */}
        {isActive && !isQuickAccess && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
        
        <div className="relative z-10 flex items-center space-x-3 w-full">
          <Icon className={`w-4 h-4 transition-all duration-300 group-hover:scale-110 ${
            isActive ? 'text-blue-600 dark:text-blue-400' : ''
          } ${isQuickAccess ? 'w-5 h-5' : ''}`} />
          
          <span className={`flex-1 ${item.primary ? 'font-semibold' : ''}`}>
            {item.name}
          </span>
          
          {item.badge && (
            <motion.span 
              className={`px-2 py-0.5 text-xs font-bold rounded-full uppercase tracking-wide shadow-sm ${
                item.badge === 'ENHANCED' || item.badge === 'AI' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                item.badge === 'LIVE' || item.badge === 'REAL-TIME' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse' :
                item.badge === 'SMART' || item.badge === 'PRO' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                item.badge === 'FAST' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                item.badge === 'PREMIUM' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
                'bg-gray-500 text-white'
              }`}
              whileHover={{ scale: 1.1 }}
            >
              {item.badge}
            </motion.span>
          )}
        </div>
      </Link>
    )
  }

  const NavSection = ({ section, isMobile = false }) => (
    <div className="space-y-1">
      <div className="flex items-center space-x-2 px-3 py-2">
        <section.icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {section.title}
        </h4>
      </div>
      <div className="space-y-1">
        {section.items.map((item) => (
          <NavItem key={item.name} item={item} isMobile={isMobile} />
        ))}
      </div>
    </div>
  )

  const SearchModal = () => (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSearchOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl mt-20 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Search features, docs, projects..."
                className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(e.target.value)
                  }
                }}
              />
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 rounded">
                ESC
              </kbd>
            </div>
            <div className="p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Quick actions coming soon...
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/30 dark:border-gray-700/30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Enhanced Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-3 group"
            >
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300"
              >
                <CommandLineIcon className="w-6 h-6 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              </motion.div>
              
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  Aether AI
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1 font-medium">
                  Enhanced Platform
                </span>
              </div>
            </Link>

            {/* Desktop Quick Access */}
            <div className="hidden lg:flex items-center space-x-2">
              {quickAccessItems.map((item) => (
                <NavItem key={item.name} item={item} isQuickAccess />
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-3">
              {/* Enhanced Search Button */}
              {isAuthenticated && (
                <motion.button
                  onClick={() => setSearchOpen(true)}
                  className="hidden md:flex items-center space-x-3 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:shadow-lg"
                  whileHover={{ scale: 1.02 }}
                >
                  <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Search...</span>
                  <kbd className="px-2 py-1 text-xs font-bold text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 rounded shadow-sm">
                    ⌘K
                  </kbd>
                </motion.button>
              )}

              {/* Status Indicator */}
              {isAuthenticated && (
                <motion.div 
                  className="hidden lg:flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-800/50"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                    AI Online
                  </span>
                </motion.div>
              )}

              {/* Theme Toggle */}
              <motion.button
                onClick={toggleTheme}
                className="p-2.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {theme === 'dark' ? (
                  <SunIcon className="w-5 h-5" />
                ) : (
                  <MoonIcon className="w-5 h-5" />
                )}
              </motion.button>

              {/* Authentication */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-300"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                      <UserIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden xl:block text-sm font-semibold text-gray-900 dark:text-white">
                      {user?.name || 'User'}
                    </span>
                  </Link>
                  
                  <motion.button
                    onClick={handleLogout}
                    className="p-2.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300"
                    title="Logout"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="btn-primary text-sm px-6 py-2.5"
                  >
                    Get Started Free
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </motion.button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden border-t border-gray-200/30 dark:border-gray-700/30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl"
              >
                <div className="py-6 space-y-6 max-h-[80vh] overflow-y-auto">
                  {/* Mobile Search */}
                  <div className="px-3">
                    <button
                      onClick={() => {
                        setSearchOpen(true)
                        setMobileMenuOpen(false)
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-left"
                    >
                      <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-500 dark:text-gray-400">Search features...</span>
                    </button>
                  </div>

                  {isAuthenticated ? (
                    // Navigation sections for authenticated users
                    <>
                      {navigationSections.map((section) => (
                        <div key={section.id} className="px-3">
                          <NavSection section={section} isMobile />
                        </div>
                      ))}
                      
                      {/* Mobile User Actions */}
                      <div className="px-3 pt-4 border-t border-gray-200/30 dark:border-gray-700/30">
                        <button
                          onClick={() => {
                            handleLogout()
                            setMobileMenuOpen(false)
                          }}
                          className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-all duration-300"
                        >
                          <ArrowRightOnRectangleIcon className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    // Simple public navigation
                    <div className="px-3 space-y-2">
                      <NavItem item={{ name: 'Templates', href: '/templates', icon: DocumentDuplicateIcon }} isMobile />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Search Modal */}
      <SearchModal />
    </>
  )
}

export default ModernNavigation