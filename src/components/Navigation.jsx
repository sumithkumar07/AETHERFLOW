import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HomeIcon,
  ChatBubbleLeftRightIcon,
  DocumentDuplicateIcon,
  CogIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  PuzzlePieceIcon,
  SparklesIcon,
  MoonIcon,
  SunIcon,
  ChevronDownIcon,
  CpuChipIcon,
  ChartBarIcon,
  BeakerIcon,
  UsersIcon,
  MicrophoneIcon,
  CodeBracketIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'

const Navigation = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAdvancedDropdownOpen, setIsAdvancedDropdownOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setIsMobileMenuOpen(false)
  }

  const navigationItems = [
    { name: 'Home', href: '/', icon: HomeIcon, public: true },
    { name: 'Chat Hub', href: '/chat', icon: ChatBubbleLeftRightIcon, protected: true },
    { name: 'Templates', href: '/templates', icon: DocumentDuplicateIcon, public: true },
    { name: 'Integrations', href: '/integrations', icon: PuzzlePieceIcon, protected: true }
  ]

  const advancedFeatures = [
    { 
      name: 'Advanced AI', 
      href: '/advanced-ai', 
      icon: CpuChipIcon, 
      description: 'Multi-agent AI system with intelligent routing' 
    },
    { 
      name: 'Visual Programming', 
      href: '/visual-programming', 
      icon: CodeBracketIcon, 
      description: 'Convert diagrams to code using AI' 
    },
    { 
      name: 'Voice Interface', 
      href: '/voice-interface', 
      icon: MicrophoneIcon, 
      description: 'Control platform with voice commands' 
    },
    { 
      name: 'Enterprise Dashboard', 
      href: '/enterprise', 
      icon: BuildingOfficeIcon, 
      description: 'Enterprise management and monitoring' 
    },
    { 
      name: 'Smart Analytics', 
      href: '/analytics', 
      icon: ChartBarIcon, 
      description: 'AI-powered insights and predictions' 
    },
    { 
      name: 'Collaboration Center', 
      href: '/collaboration', 
      icon: UsersIcon, 
      description: 'Real-time collaborative workspace' 
    }
  ]

  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const filteredItems = navigationItems.filter(item => {
    if (item.public) return true
    if (item.protected && isAuthenticated) return true
    return false
  })

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-3 group"
          >
            <motion.div 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center"
            >
              <SparklesIcon className="w-5 h-5 text-white" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Tempo
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                Next-Gen Development
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {filteredItems.map((item) => {
              const Icon = item.icon
              const isActive = isActivePath(item.href)
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-lg -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              )
            })}

            {/* Advanced Features Dropdown */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setIsAdvancedDropdownOpen(!isAdvancedDropdownOpen)}
                  className="relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <BeakerIcon className="w-4 h-4" />
                  <span>Advanced</span>
                  <ChevronDownIcon className={`w-4 h-4 transition-transform ${isAdvancedDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isAdvancedDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full mt-2 right-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                    >
                      {advancedFeatures.map((feature) => {
                        const Icon = feature.icon
                        return (
                          <Link
                            key={feature.name}
                            to={feature.href}
                            onClick={() => setIsAdvancedDropdownOpen(false)}
                            className="flex items-start space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <Icon className="w-5 h-5 mt-0.5 text-blue-600 dark:text-blue-400" />
                            <div>
                              <div className="font-medium">{feature.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{feature.description}</div>
                            </div>
                          </Link>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Settings Link */}
            {isAuthenticated && (
              <Link
                to="/settings"
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isActivePath('/settings')
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <CogIcon className="w-4 h-4" />
                <span>Settings</span>
                {isActivePath('/settings') && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-lg -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            )}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>{user?.name || 'Profile'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
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
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="py-4 space-y-2">
                {filteredItems.map((item) => {
                  const Icon = item.icon
                  const isActive = isActivePath(item.href)
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                          : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}

                {/* Advanced Features in Mobile */}
                {isAuthenticated && (
                  <>
                    <div className="px-4 py-2">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Advanced Features
                      </div>
                    </div>
                    {advancedFeatures.map((feature) => {
                      const Icon = feature.icon
                      const isActive = isActivePath(feature.href)
                      
                      return (
                        <Link
                          key={feature.name}
                          to={feature.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-start space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                            isActive
                              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                              : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                          }`}
                        >
                          <Icon className="w-5 h-5 mt-0.5" />
                          <div>
                            <div>{feature.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {feature.description}
                            </div>
                          </div>
                        </Link>
                      )
                    })}

                    {/* Settings in Mobile */}
                    <Link
                      to="/settings"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                        isActivePath('/settings')
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                          : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      <CogIcon className="w-5 h-5" />
                      <span>Settings</span>
                    </Link>
                  </>
                )}

                {/* Mobile User Actions */}
                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between px-4 mb-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Theme</span>
                    <button
                      onClick={toggleTheme}
                      className="flex items-center space-x-2 p-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      {theme === 'dark' ? (
                        <>
                          <SunIcon className="w-4 h-4" />
                          <span className="text-sm">Light</span>
                        </>
                      ) : (
                        <>
                          <MoonIcon className="w-4 h-4" />
                          <span className="text-sm">Dark</span>
                        </>
                      )}
                    </button>
                  </div>

                  {isAuthenticated ? (
                    <div className="space-y-2">
                      <Link
                        to="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                      >
                        <UserIcon className="w-5 h-5" />
                        <span>{user?.name || 'Profile'}</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-left"
                      >
                        <span>Sign Out</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        to="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full px-4 py-3 text-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full btn-primary text-center py-3"
                      >
                        Get Started
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

export default Navigation