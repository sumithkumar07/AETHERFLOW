import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  SparklesIcon,
  DocumentDuplicateIcon,
  ChatBubbleLeftRightIcon,
  LinkIcon,
  Cog6ToothIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  MoonIcon,
  SunIcon,
  FolderIcon,
  RocketLaunchIcon,
  UsersIcon,
  BuildingOfficeIcon,
  CpuChipIcon,
  ChartBarIcon,
  BoltIcon,
  MagnifyingGlassIcon,
  TrophyIcon,
  CommandLineIcon,
  ShieldCheckIcon,
  BeakerIcon,
  PaintBrushIcon,
  UserGroupIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'

const Navigation = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navigation = [
    { name: 'Templates', href: '/templates', icon: DocumentDuplicateIcon }
  ]

  const authenticatedNavigation = [
    // Main Features
    { name: 'AI Chat Hub', href: '/chat', icon: ChatBubbleLeftRightIcon, category: 'main', badge: 'AI' },
    { name: 'AI Projects', href: '/projects', icon: FolderIcon, category: 'main', badge: 'ENHANCED' },
    { name: 'Templates', href: '/templates', icon: DocumentDuplicateIcon, category: 'main' },
    
    // Advanced AI Features
    { name: 'Advanced AI', href: '/advanced', icon: CpuChipIcon, category: 'ai', badge: 'NEW' },
    { name: 'Multi-Agent System', href: '/agents', icon: UserGroupIcon, category: 'ai', badge: 'BETA' },
    
    // Analytics & Performance
    { name: 'Analytics Dashboard', href: '/analytics', icon: ChartBarIcon, category: 'analytics', badge: 'LIVE' },
    { name: 'Performance Monitor', href: '/performance', icon: BoltIcon, category: 'analytics', badge: 'REALTIME' },
    
    // Collaboration & Workflows
    { name: 'Live Collaboration', href: '/collaboration', icon: UsersIcon, category: 'collaboration', badge: 'LIVE' },
    { name: 'Enhanced Workflows', href: '/workflows', icon: AdjustmentsHorizontalIcon, category: 'collaboration', badge: 'AI' },
    
    // Development Tools
    { name: 'Code Quality', href: '/code-quality', icon: BeakerIcon, category: 'development' },
    { name: 'Visual Programming', href: '/visual-programming', icon: PaintBrushIcon, category: 'development', badge: 'BETA' },
    { name: 'Smart Documentation', href: '/smart-docs', icon: DocumentDuplicateIcon, category: 'development' },
    
    // Enterprise & Security
    { name: 'Enterprise Suite', href: '/enterprise', icon: BuildingOfficeIcon, category: 'enterprise' },
    { name: 'Security Center', href: '/security', icon: ShieldCheckIcon, category: 'enterprise' },
    
    // Additional Features
    { name: 'Deploy & Host', href: '/deploy', icon: RocketLaunchIcon, category: 'deploy' },
    { name: 'Integrations Hub', href: '/integrations', icon: LinkIcon, category: 'integrations' },
    
    // Account & Settings
    { name: 'Subscription', href: '/subscription', icon: SparklesIcon, category: 'account' },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, category: 'account' }
  ]

  const currentNavigation = isAuthenticated ? authenticatedNavigation : navigation

  const isCurrentPage = (href) => {
    if (href === '/chat' && location.pathname.startsWith('/chat')) {
      return true
    }
    return location.pathname === href
  }

  // Group navigation items by category for better organization
  const groupedNavigation = currentNavigation.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {})

  const categoryTitles = {
    main: 'Core Features',
    ai: 'AI Intelligence',
    analytics: 'Analytics & Insights',
    collaboration: 'Collaboration',
    development: 'Development Tools',
    enterprise: 'Enterprise',
    deploy: 'Deployment',
    integrations: 'Integrations',
    account: 'Account'
  }

  // Don't show navigation on login/signup pages
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null
  }

  const NavItem = ({ item, isMobile = false }) => {
    const Icon = item.icon
    const isActive = isCurrentPage(item.href)
    
    return (
      <Link
        to={item.href}
        onClick={() => isMobile && setMobileMenuOpen(false)}
        className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
          isActive
            ? 'bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20'
        }`}
      >
        <Icon className={`w-4 h-4 transition-all duration-200 group-hover:scale-110 ${
          isActive ? 'text-blue-600 dark:text-blue-400' : ''
        }`} />
        <span className="flex-1">{item.name}</span>
        
        {item.badge && (
          <span className={`px-1.5 py-0.5 text-xs font-bold rounded uppercase ${
            item.badge === 'NEW' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
            item.badge === 'AI' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
            item.badge === 'LIVE' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse' :
            item.badge === 'BETA' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
            item.badge === 'REALTIME' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white animate-pulse' :
            'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
          }`}>
            {item.badge}
          </span>
        )}
      </Link>
    )
  }

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
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
              className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 animate-pulse-glow"
            >
              <CommandLineIcon className="w-5 h-5 text-white" />
            </motion.div>
            <motion.div
              className="flex flex-col"
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Aether AI
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                Next-Gen Development
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {/* Quick Access Items - Main features only */}
            {isAuthenticated && (
              <>
                <NavItem item={{ name: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon, badge: 'AI' }} />
                <NavItem item={{ name: 'Analytics', href: '/analytics', icon: ChartBarIcon, badge: 'LIVE' }} />
                <NavItem item={{ name: 'AI Agents', href: '/agents', icon: UserGroupIcon, badge: 'NEW' }} />
                <NavItem item={{ name: 'Enterprise', href: '/enterprise', icon: BuildingOfficeIcon }} />
              </>
            )}
            
            {!isAuthenticated && (
              <NavItem item={{ name: 'Templates', href: '/templates', icon: DocumentDuplicateIcon }} />
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Global Search - Enhanced */}
            {isAuthenticated && (
              <div className="hidden md:block relative">
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Search features...</span>
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded">
                    ⌘K
                  </kbd>
                </div>
              </div>
            )}

            {/* Feature Count Badge */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg">
                <SparklesIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  {currentNavigation.length} Features Active
                </span>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
            >
              {theme === 'dark' ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>

            {/* Authentication */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden xl:block text-sm font-medium">
                    {user?.name || 'Profile'}
                  </span>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                  title="Logout"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary text-sm px-4 py-2"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-5 h-5" />
              ) : (
                <Bars3Icon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="py-4 space-y-4 max-h-96 overflow-y-auto">
                {isAuthenticated ? (
                  // Organized by categories for authenticated users
                  Object.entries(groupedNavigation).map(([category, items]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {categoryTitles[category] || category}
                      </h4>
                      {items.map((item) => (
                        <NavItem key={item.name} item={item} isMobile />
                      ))}
                    </div>
                  ))
                ) : (
                  // Simple list for non-authenticated users
                  currentNavigation.map((item) => (
                    <NavItem key={item.name} item={item} isMobile />
                  ))
                )}
                
                {/* Mobile User Actions */}
                {isAuthenticated && (
                  <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                    <NavItem 
                      item={{ name: 'Profile', href: '/profile', icon: UserIcon }} 
                      isMobile 
                    />
                    
                    <button
                      onClick={() => {
                        handleLogout()
                        setMobileMenuOpen(false)
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

export default Navigation