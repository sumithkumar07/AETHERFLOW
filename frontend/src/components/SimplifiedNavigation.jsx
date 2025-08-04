import React, { useState } from 'react'
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
  RocketLaunchIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'

const SimplifiedNavigation = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Simplified navigation structure - 4 main categories instead of 9
  const authenticatedNavigation = [
    // Core AI Features
    {
      category: 'ai',
      title: 'AI Workspace',
      items: [
        { name: 'AI Chat', href: '/chat', icon: ChatBubbleLeftRightIcon, badge: 'ENHANCED', primary: true },
        { name: 'AI Agents', href: '/agents', icon: CpuChipIcon, badge: 'SMART' },
        { name: 'Projects', href: '/projects', icon: FolderIcon, badge: 'AI' }
      ]
    },
    // Development Tools
    {
      category: 'development',
      title: 'Development',
      items: [
        { name: 'Templates', href: '/templates', icon: DocumentDuplicateIcon },
        { name: 'Deploy', href: '/deploy', icon: RocketLaunchIcon, badge: 'FAST' },
        { name: 'Advanced', href: '/advanced', icon: BoltIcon, badge: 'PRO' }
      ]
    },
    // Analytics & Insights  
    {
      category: 'insights',
      title: 'Insights',
      items: [
        { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, badge: 'LIVE' },
        { name: 'Performance', href: '/performance', icon: BoltIcon, badge: 'REAL-TIME' },
        { name: 'Workflows', href: '/workflows', icon: SparklesIcon }
      ]
    },
    // Account & Settings
    {
      category: 'account',
      title: 'Account',
      items: [
        { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
        { name: 'Subscription', href: '/subscription', icon: SparklesIcon, badge: 'PREMIUM' }
      ]
    }
  ]

  const publicNavigation = [
    { name: 'Templates', href: '/templates', icon: DocumentDuplicateIcon, primary: true }
  ]

  const isCurrentPage = (href) => {
    if (href === '/chat' && location.pathname.startsWith('/chat')) {
      return true
    }
    return location.pathname === href
  }

  // Quick access items for desktop header
  const quickAccessItems = isAuthenticated ? [
    { name: 'AI Chat', href: '/chat', icon: ChatBubbleLeftRightIcon, badge: 'AI' },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, badge: 'LIVE' },
    { name: 'AI Agents', href: '/agents', icon: CpuChipIcon, badge: 'SMART' }
  ] : []

  // Don't show navigation on login/signup pages
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null
  }

  const NavItem = ({ item, isMobile = false, isQuickAccess = false }) => {
    const Icon = item.icon
    const isActive = isCurrentPage(item.href)
    
    const baseClasses = `flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden`
    
    const activeClasses = isActive
      ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/40 dark:to-purple-900/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-200/50 dark:ring-blue-800/50 shadow-lg'
      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 hover:shadow-md'

    const quickAccessClasses = isQuickAccess
      ? 'px-4 py-2.5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:scale-105 hover:shadow-lg'
      : ''

    return (
      <Link
        to={item.href}
        onClick={() => isMobile && setMobileMenuOpen(false)}
        className={`${baseClasses} ${quickAccessClasses || activeClasses}`}
      >
        {/* Background animation */}
        {isActive && !isQuickAccess && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
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
              className={`px-2 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${
                item.badge === 'ENHANCED' || item.badge === 'AI' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' :
                item.badge === 'LIVE' || item.badge === 'REAL-TIME' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse shadow-lg' :
                item.badge === 'SMART' || item.badge === 'PRO' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' :
                item.badge === 'FAST' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' :
                item.badge === 'PREMIUM' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg' :
                'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {item.badge}
            </motion.span>
          )}
        </div>
      </Link>
    )
  }

  const CategorySection = ({ category, isMobile = false }) => (
    <div className="space-y-2">
      <h4 className="px-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
        {category.title}
      </h4>
      <div className="space-y-1">
        {category.items.map((item) => (
          <NavItem key={item.name} item={item} isMobile={isMobile} />
        ))}
      </div>
    </div>
  )

  return (
    <nav className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border-b border-gray-200/30 dark:border-gray-700/30 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Enhanced Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group"
          >
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300"
            >
              <CommandLineIcon className="w-6 h-6 text-white" />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </motion.div>
            
            <motion.div
              className="flex flex-col"
              whileHover={{ y: -1 }}
            >
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Aether AI
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1 font-medium">
                Smart Development
              </span>
            </motion.div>
          </Link>

          {/* Desktop Quick Access */}
          <div className="hidden lg:flex items-center space-x-2">
            {quickAccessItems.map((item) => (
              <NavItem key={item.name} item={item} isQuickAccess />
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            {/* Enhanced Global Search */}
            {isAuthenticated && (
              <motion.div 
                className="hidden md:block relative"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center space-x-3 px-4 py-2.5 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl cursor-pointer hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg">
                  <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Search AI features...</span>
                  <kbd className="px-2 py-1 text-xs font-bold text-gray-800 dark:text-gray-300 bg-white/60 dark:bg-gray-700/60 rounded-lg shadow-sm">
                    ⌘K
                  </kbd>
                </div>
              </motion.div>
            )}

            {/* Active Features Counter */}
            {isAuthenticated && (
              <motion.div 
                className="hidden lg:flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl border border-green-200/50 dark:border-green-800/50"
                whileHover={{ scale: 1.05 }}
              >
                <SparklesIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-bold text-green-700 dark:text-green-300">
                  AI Active
                </span>
              </motion.div>
            )}

            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              className="p-2.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-300 hover:shadow-lg"
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
                  className="flex items-center space-x-2 p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-300 hover:shadow-lg"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden xl:block text-sm font-semibold">
                    {user?.name || 'Profile'}
                  </span>
                </Link>
                
                <motion.button
                  onClick={handleLogout}
                  className="p-2.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300 hover:shadow-lg"
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
                  className="btn-primary text-sm px-6 py-2.5 shadow-lg hover:shadow-xl"
                >
                  Get Started Free
                </Link>
              </div>
            )}

            {/* Simplified Mobile menu button */}
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Simplified Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-gray-200/30 dark:border-gray-700/30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl"
            >
              <div className="py-6 space-y-6 max-h-screen overflow-y-auto">
                {isAuthenticated ? (
                  // Organized categories for authenticated users
                  <>
                    {authenticatedNavigation.map((category) => (
                      <CategorySection key={category.category} category={category} isMobile />
                    ))}
                    
                    {/* Mobile User Actions */}
                    <div className="pt-4 border-t border-gray-200/30 dark:border-gray-700/30 space-y-2">
                      <NavItem 
                        item={{ name: 'Profile', href: '/profile', icon: UserIcon }} 
                        isMobile 
                      />
                      
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
                  // Simple list for non-authenticated users
                  <div className="space-y-2">
                    {publicNavigation.map((item) => (
                      <NavItem key={item.name} item={item} isMobile />
                    ))}
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

export default SimplifiedNavigation