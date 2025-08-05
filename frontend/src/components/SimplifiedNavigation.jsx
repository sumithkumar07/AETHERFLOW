import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChatBubbleLeftRightIcon,
  FolderIcon,
  DocumentDuplicateIcon,
  Cog6ToothIcon,
  HomeIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon,
  BoltIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'

const SimplifiedNavigation = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Handle scroll for navigation background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // SIMPLIFIED 4-CATEGORY NAVIGATION
  const mainNavItems = [
    {
      name: 'Home',
      href: '/',
      icon: HomeIcon,
      description: 'Welcome & Overview',
      public: true
    },
    {
      name: 'AI Chat',
      href: '/chat',
      icon: ChatBubbleLeftRightIcon,
      description: 'Enhanced AI Conversations',
      protected: true,
      primary: true
    },
    {
      name: 'Projects',
      href: '/projects',
      icon: FolderIcon,
      description: 'Your Development Projects',
      protected: true
    },
    {
      name: 'Templates',
      href: '/templates',
      icon: DocumentDuplicateIcon,
      description: 'Quick Start Templates',
      public: true
    }
  ]

  const secondaryNavItems = [
    {
      name: 'Settings',
      href: '/settings',
      icon: Cog6ToothIcon,
      protected: true
    }
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setMobileMenuOpen(false)
  }

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(href)
  }

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